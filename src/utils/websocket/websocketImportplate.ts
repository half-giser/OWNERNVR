/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 14:08:47
 * @Description: websocket 导入车牌库
 */
import WebsocketBase from './websocketBase'
import { type CmdPlateLibImportDataList } from './websocketCmd'

export interface WebsocketImportPlateLibOption {
    // onopen?: () => void
    onsuccess?: () => void
    onprogress?: (param: number) => void
    onerror?: (param?: number) => void
    onclose?: () => void
    plateDataList: CmdPlateLibImportDataList[]
    limitNum?: number
}

export default function WebsocketImportPlateLib(option: WebsocketImportPlateLibOption) {
    let importIdx = 0
    let taskId: string | null = null

    const onsuccess = option.onsuccess
    const onprogress = option.onprogress
    const onerror = option.onerror
    const onclose = option.onclose
    const plateDataList = option.plateDataList
    const totalNum = option.plateDataList.length
    const limitNum = option.limitNum || 300

    const ws = WebsocketBase({
        onopen: () => {
            start()
        },
        onmessage: (data: string) => {
            try {
                const res = JSON.parse(data)
                const code = Number(res.basic.code)
                // 开始导入
                if (res.url === '/device/platelib/import/start#response' && code === 0) {
                    cutPackage(0)
                    onprogress && onprogress(limitNum)
                }
                // 导入有误
                else if (res.url === '/device/platelib/import/start#response' && code !== 0) {
                    onerror && onerror(code)
                }
                // 通知进度
                else if (res.url === '/device/platelib/import/data#response' && code === 0) {
                    const step = res.data.step
                    if (step >= totalNum) {
                        onsuccess && onsuccess()
                    } else {
                        importIdx++
                        cutPackage(importIdx)
                        onprogress && onprogress(step)
                    }
                }
                // 导入过程有误
                else if (res.url === '/device/platelib/import/data#response' && code !== 0) {
                    onerror && onerror(code)
                }
                // 停止录入成功
                else if (res.url === '/device/platelib/import/stop#response') {
                    destroy()
                }
            } catch (ev) {}
        },
        onerror: onerror,
        onclose: onclose,
    })

    /**
     * @description 裁剪JSON数据成多份
     * @param {number} importIdx
     */
    const cutPackage = (importIdx: number) => {
        const startIdx = importIdx * limitNum
        const endIdx = (importIdx + 1) * limitNum
        const plateDataListSlice = plateDataList.slice(startIdx, endIdx)
        if (plateDataListSlice.length) {
            const cmd = CMD_PLATELIB_IMPORT_DATA(taskId as string, plateDataListSlice)
            sendJsonBuffer(cmd)
        }
    }

    /**
     * @description 传输给服务端
     * @param {Object} json
     */
    const sendJsonBuffer = (json: Record<any, any>) => {
        dataToBuffer(JSON.stringify(json)).then((jsonBuffer) => {
            // 包头buffer + jsonbuffer (数据包含在jsonbuffer里)
            const headerbuffer = buildHeader(json)
            const temp = appendBuffer(headerbuffer, jsonBuffer)
            ws.send(temp)
        })
    }

    const start = () => {
        const cmd = CMD_PLATELIB_IMPORT_START()
        taskId = cmd.data.task_id
        ws.send(JSON.stringify(cmd))
    }

    const stop = () => {
        const cmd = CMD_PLATELIB_IMPORT_STOP(taskId as string)
        ws.send(JSON.stringify(cmd))
    }

    const destroy = () => {
        ws.close()
    }

    return {
        start,
        stop,
        destroy,
    }
}
