/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 18:48:05
 * @Description: websocket导出车牌库
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-11 09:39:31
 */
import { ErrorCode } from '../constants'
import WebsocketBase from './websocketBase'
import { Uint8ArrayToStr } from '../tools'
import { CMD_PLATELIB_EXPORT_START, CMD_PLATELIB_EXPORT_STOP, CMD_PLATELIB_EXPORT_CONFIRM_STEP } from './websocketCmd'

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

export default class WebsocketPlateLib {
    private ws: WebsocketBase | null = null
    private taskId?: string
    private readonly onsuccess: WebsocketPlateLibOption['onsuccess']
    private readonly onerror: WebsocketPlateLibOption['onerror']
    private readonly onclose: WebsocketPlateLibOption['onclose']

    constructor(option: WebsocketPlateLibOption) {
        this.onsuccess = option.onsuccess
        this.onerror = option.onerror
        this.onclose = option.onclose
        this.init()
    }

    init() {
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
                    try {
                        const jsonStr = Uint8ArrayToStr(new Uint8Array(jsonBuf))
                        const json = JSON.parse(jsonStr)
                        const plateDataList = this.getPlateData(json.plate_data)
                        this.onsuccess && this.onsuccess(plateDataList)
                    } catch (e) {
                        this.destroy()
                        this.onerror && this.onerror()
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
                        this.onerror && this.onerror(code)
                    } else if (res.url === '/device/platelib/export/data' && code !== 0) {
                        // 数据发送完毕
                        if (code == ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED) {
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
     * 从响应json报文的data字段信息中读取车牌库数据
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
    getPlateData(data: PlateDataDatum[]) {
        try {
            const plateDataList = data.map((item) => ({
                '@id': item.vehicle_plate_id,
                groupId: item.vehicle_plate_group_id,
                plateNumberValue: item.plate_number,
                vehicleType: item.vehicle_type,
                ownerValue: item.owner,
                phoneValue: item.owner_phone,
            }))
            this.confirmStep()
            return plateDataList
        } catch (e) {
            return []
        }
    }

    start() {
        const cmd = CMD_PLATELIB_EXPORT_START()
        this.taskId = cmd.data.task_id
        this.ws!.send(JSON.stringify(cmd))
    }

    stop() {
        const cmd = CMD_PLATELIB_EXPORT_STOP(this.taskId as string)
        this.ws!.send(JSON.stringify(cmd))
    }

    confirmStep() {
        const cmd = CMD_PLATELIB_EXPORT_CONFIRM_STEP(this.taskId as string)
        this.ws!.send(JSON.stringify(cmd))
    }

    destroy() {
        this.stop()
        this.ws!.close()
    }
}
