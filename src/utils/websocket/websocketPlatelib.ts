/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 18:48:05
 * @Description: websocket导出车牌库
 */

export interface WebsocketPlateLibOption {
    onsuccess?: (param: WebsocketPlateLibOnSuccessParam[] | number) => void
    onerror?: (param?: number) => void
    onclose?: () => void
}

interface PlateDataDatum {
    vehicle_plate_id: string
    vehicle_plate_group_id: string
    plate_number: string
    vehicle_type: string
    owner: string
    owner_phone: string
}

export interface WebsocketPlateLibOnSuccessParam {
    '@id': string
    groupId: string
    plateNumberValue: string
    vehicleType: string
    ownerValue: string
    phoneValue: string
}

export const WebsocketPlateLib = (option: WebsocketPlateLibOption) => {
    let taskId: string | null = null

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
                try {
                    const jsonStr = Uint8ArrayToStr(new Uint8Array(jsonBuf))
                    const json = JSON.parse(jsonStr)
                    const plateDataList = getPlateData(json.plate_data)
                    onsuccess && onsuccess(plateDataList)
                } catch (e) {
                    destroy()
                    onerror && onerror()
                    return
                }
            } else {
                const res = JSON.parse(data)
                const code = Number(res.basic.code)
                if (res.url === '/device/platelib/export/start#response' && code === 0) {
                    // 开始导出
                    console.log('open the task of exporting sample library')
                } else if (res.url === '/device/platelib/export/start#response' && code !== 0) {
                    // 导出有误
                    onerror && onerror(code)
                } else if (res.url === '/device/platelib/export/data' && code !== 0) {
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

    /**
     * @description 从响应json报文的data字段信息中读取车牌库数据
     * @param {PlateDataDatum[]} data
     * @return {Array} plateDataList
     * plateDataList: [
     *  {
     *      "@id",
     *      groupId,
     *      plateNumberValue,
     *      vehicleType,
     *      ownerValue,
     *      phoneValue
     *  },
     *  {},
     *  ...
     * ]
     */
    const getPlateData = (data: PlateDataDatum[]) => {
        try {
            const plateDataList = data.map((item) => ({
                '@id': item.vehicle_plate_id,
                groupId: item.vehicle_plate_group_id,
                plateNumberValue: item.plate_number,
                vehicleType: item.vehicle_type,
                ownerValue: item.owner,
                phoneValue: item.owner_phone,
            }))
            confirmStep()
            return plateDataList
        } catch (e) {
            return []
        }
    }

    const start = () => {
        const cmd = CMD_PLATELIB_EXPORT_START()
        taskId = cmd.data.task_id
        ws.send(JSON.stringify(cmd))
    }

    const stop = () => {
        const cmd = CMD_PLATELIB_EXPORT_STOP(taskId as string)
        ws.send(JSON.stringify(cmd))
    }

    const confirmStep = () => {
        const cmd = CMD_PLATELIB_EXPORT_CONFIRM_STEP(taskId as string)
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
