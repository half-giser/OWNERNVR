/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 14:08:47
 * @Description: websocket 导入车牌库
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-11 09:39:06
 */
import WebsocketBase from './websocketBase'

export interface WebsocketImportPlateLibOption {
    // onopen?: () => void
    onsuccess?: () => void
    onprogress?: (param: number) => void
    onerror?: (param?: number) => void
    onclose?: () => void
    plateDataList: string[]
    limitNum: number
}

export default class WebsocketImportPlateLib {
    private ws: WebsocketBase | null = null
    private plateDataList: string[] = []
    private totalNum = 0
    private limitNum = 300
    private importIdx = 0
    private taskId: string | null = null
    // private readonly onopen: WebsocketImportPlateLibOption['onopen']
    private readonly onsuccess: WebsocketImportPlateLibOption['onsuccess']
    private readonly onprogress: WebsocketImportPlateLibOption['onprogress']
    private readonly onerror: WebsocketImportPlateLibOption['onerror']
    private readonly onclose: WebsocketImportPlateLibOption['onclose']

    constructor(option: WebsocketImportPlateLibOption) {
        // this.onopen = option.onopen
        this.onsuccess = option.onsuccess
        this.onprogress = option.onprogress
        this.onerror = option.onerror
        this.onclose = option.onclose
        this.plateDataList = option.plateDataList
        this.totalNum = option.plateDataList.length
        this.limitNum = option.limitNum || 300
        this.init()
    }

    private init() {
        this.ws = new WebsocketBase({
            onopen: () => {
                this.start()
            },
            onmessage: (data: string) => {
                try {
                    const res = JSON.parse(data)
                    const code = Number(res.basic.code)
                    // 开始导入
                    if (res.url === '/device/platelib/import/start#response' && code === 0) {
                        this.cutPackage(0)
                        this.onprogress && this.onprogress(this.limitNum)
                    }
                    // 导入有误
                    else if (res.url === '/device/platelib/import/start#response' && code !== 0) {
                        this.onerror && this.onerror(code)
                    }
                    // 通知进度
                    else if (res.url === '/device/platelib/import/data#response' && code == 0) {
                        const step = res.data.step
                        if (step >= this.totalNum) {
                            this.onsuccess && this.onsuccess()
                        } else {
                            this.importIdx++
                            this.cutPackage(this.importIdx)
                            this.onprogress && this.onprogress(step)
                        }
                    }
                    // 导入过程有误
                    else if (res.url === '/device/platelib/import/data#response' && code != 0) {
                        this.onerror && this.onerror(code)
                    }
                    // 停止录入成功
                    else if (res.url === '/device/platelib/import/stop#response') {
                        this.destroy()
                    }
                } catch (ev) {}
            },
            onerror: this.onerror,
            onclose: this.onclose,
        })
    }

    /**
     * @description 裁剪JSON数据成多份
     * @param {number} importIdx
     */
    private cutPackage(importIdx: number) {
        const startIdx = importIdx * this.limitNum
        const endIdx = (importIdx + 1) * this.limitNum
        const plateDataListSlice = this.plateDataList.slice(startIdx, endIdx)
        if (plateDataListSlice.length > 0) {
            const cmd = CMD_PLATELIB_IMPORT_DATA(this.taskId as string, plateDataListSlice)
            this.sendJsonBuffer(cmd)
        }
    }

    /**
     * @description 传输给服务端
     * @param {Object} json
     */
    private sendJsonBuffer(json: any) {
        dataToBuffer(JSON.stringify(json)).then((jsonBuffer) => {
            // 包头buffer + jsonbuffer (数据包含在jsonbuffer里)
            const headerbuffer = buildHeader(json)
            const temp = appendBuffer(headerbuffer, jsonBuffer)
            this.ws!.send(temp)
        })
    }

    start() {
        const cmd = CMD_PLATELIB_IMPORT_START()
        this.taskId = cmd.data.task_id
        this.ws!.send(JSON.stringify(cmd))
    }

    stop() {
        const cmd = CMD_PLATELIB_IMPORT_STOP(this.taskId as string)
        this.ws!.send(JSON.stringify(cmd))
    }

    destroy() {
        this.ws!.close()
    }
}
