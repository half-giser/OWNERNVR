/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 14:08:47
 * @Description: websocket 导入车牌库
 */

export interface WebsocketImportPlateLibOption {
    // onopen?: () => void
    onsuccess?: () => void
    onprogress?: (param: number) => void
    onerror?: (param?: number) => void
    onclose?: () => void
    plateDataList: CmdPlateLibImportDataList[]
    limitNum?: number
}

export const WebsocketImportPlateLib = (option: WebsocketImportPlateLibOption) => {
    let importIdx = 0
    let taskId: string | null = null

    const onsuccess = option.onsuccess
    const onprogress = option.onprogress
    const onerror = option.onerror
    const onclose = option.onclose
    const plateDataList = option.plateDataList
    const totalNum = option.plateDataList.length
    const limitNum = option.limitNum || 25

    const ws = WebsocketBase({
        onopen: () => {
            start()
        },
        onmessage: (data) => {
            if (typeof data === 'string') {
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
                    // 由于step实际记录会将再次导入的数据计入计算，所以这里需要计算当前已经导入的数据
                    const currIndex = (importIdx + 1) * limitNum
                    if (currIndex >= totalNum) {
                        onsuccess && onsuccess()
                    } else {
                        importIdx++
                        cutPackage(importIdx)
                        onprogress && onprogress(currIndex + limitNum)
                    }
                }
                // 导入过程有误
                else if (res.url === '/device/platelib/import/data#response' && code !== 0) {
                    // 536870960：代表系统忙，需要等待2秒，重新进行数据下发，此处不需要importIdx自增
                    if (code === ErrorCode.USER_ERROR_SYSTEM_BUSY) {
                        setTimeout(function () {
                            cutPackage(importIdx)
                        }, 2000)
                    } else {
                        onerror && onerror(code)
                    }
                }
                // 停止录入成功
                else if (res.url === '/device/platelib/import/stop#response') {
                    destroy()
                }
            }
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
            const temp = appendBuffer(headerbuffer, jsonBuffer as ArrayBufferLike)
            ws.send(temp)
        })
    }

    const start = () => {
        const cmd = CMD_PLATELIB_IMPORT_START(totalNum)
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
