/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 11:53:45
 * @Description: websocket 导出人脸库
 */
import WebsocketBase from './websocketBase'

export interface WebsocketFaceLibOption {
    onsuccess?: (param: number | WebsocketFaceLibFaceDataDatum[]) => void
    onerror?: (code?: number) => void
    onclose?: () => void
}

export type WebsocketFaceLibFaceDataDatum = {
    name: string
    sex: string
    birthday: string
    nativePlace: string
    certificateType: string
    certificateNum: string
    note: string
    mobile: string
    number: string
    groupId: string
    faceId: string // 人脸id
    faceImg: string // 人脸图片base64
    total: string
    index: string
}

export default function WebsocketFaceLib(option: WebsocketFaceLibOption) {
    let taskId: string | null = null
    let abnormalIndex = 0

    const onsuccess = option.onsuccess
    const onerror = option.onerror
    const onclose = option.onclose

    const ws = WebsocketBase({
        onopen: () => {
            start()
        },
        onmessage: (data: string | ArrayBuffer) => {
            if (data instanceof ArrayBuffer) {
                const dataView = new DataView(data)
                const encryptType = dataView.getUint32(0, true)
                const jsonOffset = encryptType === 0 ? 8 : 16
                const jsonLen = dataView.getUint32(4, true)
                const jsonEndPosition = jsonLen + jsonOffset
                const jsonBuf = data.slice(jsonOffset, jsonEndPosition)
                const jsonStr = Uint8ArrayToStr(new Uint8Array(jsonBuf))
                try {
                    const json = JSON.parse(jsonStr)
                    const faceDataList = getFaceData(json.data, jsonEndPosition, data)
                    onsuccess && onsuccess(faceDataList)
                } catch (e) {
                    console.log(abnormalIndex * 1 + 1, jsonStr + ': this data is abnormal')
                    refreshIndex(abnormalIndex * 1 + 1)
                }
            } else {
                const res = JSON.parse(data)
                const code = Number(res.basic.code)
                if (res.url === '/device/facelib/export/start#response' && code === 0) {
                    console.log('open the task of exporting sample library')
                }
                // 导出有误
                else if (res.url === '/device/facelib/export/start#response' && code !== 0) {
                    onerror && onerror(code)
                } else if (res.url === '/device/facelib/export/data' && code !== 0) {
                    // 数据发送完毕
                    if (code === ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED) {
                        onsuccess && onsuccess(code)
                    }
                }
            }
        },
        onerror: onerror,
        onclose: onclose,
    })
    // }

    /**
     * @description 从响应json报文的data字段信息中读取人脸库数据
     * @param {WebsocketFaceLibFaceDataDatum[]} data
     * @param {number} jsonEndPosition
     * @param {ArrayBuffer} buffer
     * @return {Array} faceDataList
     * faceDataList: [ // 参考协议queryFacePersonnalInfoList的返回字段
     *  {
     *      name,
     *      sex,
     *      birthday,
     *      nativePlace,
     *      certificateType,
     *      certificateNum,
     *      note,
     *      mobile,
     *      number,
     *      groupId,
     *      faceId, // 人脸id
     *      faceImg // 人脸图片base64
     *  },
     *  {},
     *  ...
     * ]
     *
     */
    const getFaceData = (data: WebsocketFaceLibFaceDataDatum[], jsonEndPosition: number, buffer: ArrayBuffer) => {
        try {
            const faceDataList: WebsocketFaceLibFaceDataDatum[] = data.map((item) => ({
                ...item,
                faceImg: getPicBase64(buffer, item.faceImg, jsonEndPosition) as string,
            }))

            const lastIndex = Number(data.at(-1)!.index)
            abnormalIndex = lastIndex
            if (lastIndex >= 0) {
                refreshIndex(lastIndex)
            }
            return faceDataList
        } catch (e) {
            return []
        }
    }

    const start = () => {
        const cmd = CMD_FACELIB_EXPORT_START()
        taskId = cmd.data.task_id
        ws.send(JSON.stringify(cmd))
    }

    /**
     * @description
     * @param {number} index
     */
    const refreshIndex = (index: number) => {
        const cmd = CMD_FACELIB_EXPORT_REFRESH_INDEX(index, taskId as string)
        ws.send(JSON.stringify(cmd))
    }

    const stop = () => {
        const cmd = CMD_FACELIB_EXPORT_STOP(taskId as string)
        ws.send(JSON.stringify(cmd))
    }

    const destroy = () => {
        stop()
        ws.close()
    }

    return {
        start,
        stop,
        destroy,
    }
}
