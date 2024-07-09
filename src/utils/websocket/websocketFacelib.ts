/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 11:53:45
 * @Description: websocket 导出人脸库
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-05-31 09:09:38
 */
import WebsocketBase from './websocketBase'
import { Uint8ArrayToStr, getPicBase64 } from '../tools'
import { ErrorCode } from '../constants'
import { CMD_FACELIB_EXPORT_START, CMD_FACELIB_EXPORT_REFRESH_INDEX, CMD_FACELIB_EXPORT_STOP } from './websocketCmd'

export interface WebsocketFaceLibOption {
    onsuccess?: (param: number | FaceDataDatum[]) => void
    onerror?: (code?: number) => void
    onclose?: () => void
}

type FaceDataDatum = {
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

export default class WebsocketFaceLib {
    private ws: WebsocketBase | null = null
    private taskId: string | null = null
    private abnormalIndex = 0
    private readonly onsuccess: WebsocketFaceLibOption['onsuccess']
    private readonly onerror: WebsocketFaceLibOption['onerror']
    private readonly onclose: WebsocketFaceLibOption['onclose']

    constructor(option: WebsocketFaceLibOption) {
        this.onsuccess = option.onsuccess
        this.onerror = option.onerror
        this.onclose = option.onclose
        this.init()
    }

    private init() {
        this.ws = new WebsocketBase({
            onopen: () => {
                this.start()
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
                        const faceDataList = this.getFaceData(json.data, jsonEndPosition, data)
                        this.onsuccess && this.onsuccess(faceDataList)
                    } catch (e) {
                        console.log(this.abnormalIndex * 1 + 1, jsonStr + ': this data is abnormal')
                        this.refreshIndex(this.abnormalIndex * 1 + 1)
                    }
                } else {
                    const res = JSON.parse(data)
                    const code = Number(res.basic.code)
                    if (res.url === '/device/facelib/export/start#response' && code === 0) {
                        console.log('open the task of exporting sample library')
                    }
                    // 导出有误
                    else if (res.url === '/device/facelib/export/start#response' && code !== 0) {
                        this.onerror && this.onerror(code)
                    } else if (res.url === '/device/facelib/export/data' && code !== 0) {
                        // 数据发送完毕
                        if (code === ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED) {
                            this.onsuccess && this.onsuccess(code)
                        }
                    }
                }
            },
            onerror: this.onerror,
            onclose: this.onclose,
        })
    }

    /**
     * 从响应json报文的data字段信息中读取人脸库数据
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
    private getFaceData(data: FaceDataDatum[], jsonEndPosition: number, buffer: ArrayBuffer) {
        try {
            const faceDataList: FaceDataDatum[] = data.map((item) => ({
                ...item,
                faceImg: getPicBase64(buffer, item.faceImg, jsonEndPosition) as string,
            }))

            const lastIndex = Number(data[data.length - 1].index)
            this.abnormalIndex = lastIndex
            if (lastIndex >= 0) {
                this.refreshIndex(lastIndex)
            }
            return faceDataList
        } catch (e) {
            return []
        }
    }

    start() {
        const cmd = CMD_FACELIB_EXPORT_START()
        this.taskId = cmd.data.task_id
        this.ws!.send(JSON.stringify(cmd))
    }

    private refreshIndex(index: number) {
        const cmd = CMD_FACELIB_EXPORT_REFRESH_INDEX(index, this.taskId as string)
        this.ws!.send(JSON.stringify(cmd))
    }

    stop() {
        const cmd = CMD_FACELIB_EXPORT_STOP(this.taskId as string)
        this.ws!.send(JSON.stringify(cmd))
    }

    destroy() {
        this.stop()
        this.ws!.close()
    }
}
