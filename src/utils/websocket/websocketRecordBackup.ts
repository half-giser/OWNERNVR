/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 14:33:04
 * @Description: websocket 备份录像
 */

export interface WebsocketRecordBackupOption {
    onready?: () => void
    onmessage?: (param: WebsocketRecordBackupOnMessageParam) => void
    onFrameTime?: (frameTime: number, taskIndex: number) => void
    onerror?: (errorcode?: number) => void
    onclose?: () => void
    maxSingleSize: number // 单录像文件最大字节数
}

export type WebsocketRecordBackupOnMessageParam = {
    file: ArrayBuffer | null
    taskId: string
    taskIndex: number
    chlId: string
    frameTime: number
    firstFrameTime: number
    finished: boolean
    errorCode?: number
}

type CmdQueueDatum = {
    cmd: ReturnType<typeof CMD_PLAYBACK_OPEN>
    taskIndex: number
    taskId: string
}

export const WebsocketRecordBackup = (option: WebsocketRecordBackupOption) => {
    let ws: ReturnType<typeof WebsocketBase>
    let ready = false
    let taskId: string | null = null
    let lastTaskId: string
    let recordList: CmdPlaybackOpenOption[] = []
    let cmdQueue: CmdQueueDatum[] = [] // 任务队列, 串行方式执行任务
    let frameIndex = 0 // 当前帧
    let frameTime = 0 // 当前帧时间
    let taskIndex = -1 // 当前执行的任务索引
    let taskStatusMap: Record<string, string> = {}
    let taskIdFrameTimeMap: Record<string, number> = {}
    let canFreshFrameIndex = false

    const onready = option.onready
    const onmessage = option.onmessage
    const onFrameTime = option.onFrameTime
    const onerror = option.onerror
    const onclose = option.onclose
    const recordBuilder = WasmRecordBuilder({
        maxSingleSize: option.maxSingleSize,
        ready: () => init(),
        onFrameIndex: (currentFrameIndex: number, currentFrameTime: number) => {
            frameIndex = currentFrameIndex
            frameTime = currentFrameTime
            if (frameTime && !taskIdFrameTimeMap[taskId as string]) {
                taskIdFrameTimeMap[taskId as string] = frameTime
            }

            // 每8帧执行一次刷新帧命令
            if (frameIndex % 8 === 0 && canFreshFrameIndex) {
                refreshFrameIndex(frameIndex)
            }

            // 每30帧通知一次帧时间
            if (frameIndex % 30 === 0) {
                onFrameTime && onFrameTime(frameTime, taskIndex)
            }
        },
    })

    const init = () => {
        ws = WebsocketBase({
            onopen: () => {
                ready = true
                onready && onready()
            },
            onmessage: (data: string | ArrayBuffer) => {
                if (typeof data !== 'string') {
                    recordBuilder.sendBuffer(data)
                } else {
                    const res = JSON.parse(data)
                    const resBasic = res.basic || {}
                    const resData = res.data || {}
                    const dataCode = Number(resData.code)
                    const code = dataCode || resBasic.code || 0
                    if (code && code !== 0) {
                        let taskId = resData.task_id
                        taskId = taskId ? taskId.toLowerCase() : null
                        handleErrorCode(code, taskId, res.url)
                    }
                }
            },
            onerror: () => {
                ready = false
                onerror && onerror()
            },
            onclose: () => {
                ready = false
                onclose && onclose()
            },
        })
    }

    /**
     * @description 检查当前渲染任务是否执行完
     * @param {Function} cb
     */
    const checkReady = (cb: () => void) => {
        const timer = setTimeout(() => {
            if (ready) {
                cb()
            } else {
                checkReady(cb)
                clearTimeout(timer)
            }
        }, 0)
    }

    /**
     * @description 处理错误码
     * @param {number} errorCode
     * @param {string} taskId
     * @param {string} url
     */
    const handleErrorCode = (errorCode: number, taskId: string, url: string) => {
        console.log(`end record:${taskId} end, errorCode: ${errorCode}, URL:${url}, last frameIndex: ${frameIndex}`)

        if (!canFreshFrameIndex || taskStatusMap[taskId] === 'done') {
            return
        }

        if (taskId) {
            taskStatusMap[taskId] = 'done'
        }
        canFreshFrameIndex = false
        recordBuilder.stopRecord(true) // 遇到错误码时，手动中断录像
        if (errorCode === ErrorCode.USER_ERROR_NO_RECORDDATA) {
            // 当前任务无录像时
            if (cmdQueue.length <= 1) {
                // 任务队列为空，则通知完成
                const taskIndex = recordList.length - 1
                onmessage &&
                    onmessage({
                        file: null,
                        taskId,
                        taskIndex,
                        chlId: recordList[taskIndex].chlID,
                        frameTime: 0,
                        firstFrameTime: 0,
                        finished: true,
                        errorCode,
                    })
            }
            return
        }

        if (errorCode && errorCode !== ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED) {
            // 录像流结束
            onerror && onerror(errorCode)
        }
    }

    /**
     * @description 开启一个任务
     * @param {Array<CmdPlaybackOpenOption>} recordList 成员字段见startOneTask
     */
    const start = (currentRecordList: CmdPlaybackOpenOption[]) => {
        if (!currentRecordList.length) {
            return
        }
        recordList = currentRecordList
        cmdQueue = []
        checkReady(() => {
            for (let i = 0; i < currentRecordList.length; i++) {
                startOneTask(currentRecordList[i], i)
            }
        })
    }

    /**
     * @description 开启一个录像任务
     * @param {CmdPlaybackOpenOption} record
     * @param {number} taskIndex 任务索引
     */
    const startOneTask = (record: CmdPlaybackOpenOption, taskIndex: number) => {
        const chlId = record.chlID
        const cmd = CMD_PLAYBACK_OPEN(record)
        const taskId = cmd.data.task_id

        cmdQueue.push({
            cmd: cmd,
            taskId: taskId,
            taskIndex: taskIndex,
        })

        taskStatusMap[taskId] = 'waiting'

        if (cmdQueue.length === recordList.length) {
            lastTaskId = taskId
        }

        recordBuilder.startRecord((recordFile, isFinished) => {
            onmessage &&
                onmessage({
                    file: recordFile,
                    taskId: taskId,
                    taskIndex: taskIndex,
                    chlId: chlId,
                    frameTime: frameTime,
                    firstFrameTime: taskIdFrameTimeMap[taskId] || cmd.data.start_time * 1000 + 2000,
                    finished: isFinished && taskStatusMap[lastTaskId] === 'done',
                })
            console.log('complete record', taskIndex, '， frameTime：', formatDate(frameTime, DEFAULT_DATE_FORMAT))
            // 完成一个任务后才开启下一个
            if (isFinished) {
                execNextCmd()
            }
        })

        if (cmdQueue.length === 1) {
            execCmd()
        }
        return taskId
    }

    /**
     * @description 停止请求录像回放
     */
    const stop = () => {
        if (!taskId) {
            return
        }
        const cmd = CMD_PLAYBACK_CLOSE(taskId)
        ws?.send(JSON.stringify(cmd))
    }

    /**
     * @description 停止全部任务
     */
    const stopAll = () => {
        stop()
        cmdQueue = []
    }

    /**
     * @description 刷新帧索引
     * @param {number} frameIndex
     */
    const refreshFrameIndex = (frameIndex: number) => {
        const cmd = CMD_PLAYBACK_REFRESH_FRAME_INDEX(taskId as string, frameIndex)
        ws?.send(JSON.stringify(cmd))
    }

    /**
     * @description 发送请求
     */
    const execCmd = () => {
        const cmdItem = cmdQueue[0]
        canFreshFrameIndex = !!cmdItem
        if (cmdItem) {
            taskId = cmdItem.taskId
            taskIndex = cmdItem.taskIndex
            ws?.send(JSON.stringify(cmdItem.cmd))
            taskStatusMap[taskId as string] = 'excuting'
        }
    }

    /**
     * @description 发送下一个请求
     */
    const execNextCmd = () => {
        stop()
        cmdQueue.shift()
        execCmd()
    }

    const destroy = () => {
        ws?.close()
        recordBuilder.destroy()
        ready = false
        taskId = null
        cmdQueue = []
        recordList = []
        taskStatusMap = {}
        taskIdFrameTimeMap = {}
    }

    return {
        checkReady,
        start,
        stop,
        stopAll,
        destroy,
    }
}
