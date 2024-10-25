/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 14:33:04
 * @Description: websocket 备份录像
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-09 16:15:57
 */
import WebsocketBase from './websocketBase'
import RecordBuilder from '../wasmPlayer/recordBuilder'
import { type CmdPlaybackOpenOption } from './websocketCmd'

export interface WebsocketRecordBackupOption {
    onready?: () => void
    onmessage?: (param: WebsocketRecordBackupOnMessageParam) => void
    onFrameTime?: (frameTime: number, taskIndex: number) => void
    onerror?: (errorcode?: number) => void
    onclose?: () => void
    maxSingleSize: number
}

export type WebsocketRecordBackupOnMessageParam = {
    file: ArrayBuffer | null
    taskId: string
    taskIndex: number
    chlId: string
    frameTime: number
    firstFrameTime: number
    finished: boolean
}

type CmdQueueDatum = {
    cmd: ReturnType<typeof CMD_PLAYBACK_OPEN>
    taskIndex: number
}

export default class WebsocketRecordBackup {
    private ws?: WebsocketBase
    private recordBuilder?: RecordBuilder
    private ready = false
    private taskId?: string
    private lastTaskId?: string
    private recordList: CmdPlaybackOpenOption[] = []
    private cmdQueue: CmdQueueDatum[] = []
    private frameIndex = 0
    private frameTime = 0
    private taskIndex = -1
    private taskStatusMap: Record<string, string> = {}
    private taskIdFrameTimeMap: Record<string, number> = {}
    private canFreshFrameIndex = false
    private readonly onready: WebsocketRecordBackupOption['onready']
    private readonly onmessage: WebsocketRecordBackupOption['onmessage']
    private readonly onFrameTime: WebsocketRecordBackupOption['onFrameTime']
    private readonly onerror: WebsocketRecordBackupOption['onerror']
    private readonly onclose: WebsocketRecordBackupOption['onclose']

    constructor(option: WebsocketRecordBackupOption) {
        this.onready = option.onready
        this.onmessage = option.onmessage
        this.onFrameTime = option.onFrameTime
        this.onerror = option.onerror
        this.onclose = option.onclose
        this.recordBuilder = new RecordBuilder({
            maxSingleSize: option.maxSingleSize,
            ready: () => this.init(),
            onFrameIndex: (frameIndex: number, frameTime: number) => {
                this.frameIndex = frameIndex
                this.frameTime = frameTime
                if (frameTime && !this.taskIdFrameTimeMap[this.taskId as string]) {
                    this.taskIdFrameTimeMap[this.taskId as string] = frameTime
                }

                // 每8帧执行一次刷新帧命令
                if (frameIndex % 8 === 0 && this.canFreshFrameIndex) {
                    this.refreshFrameIndex(frameIndex)
                }

                // 每30帧通知一次帧时间
                if (frameIndex % 30 === 0) {
                    this.onFrameTime && this.onFrameTime(frameTime, this.taskIndex)
                }
            },
        })
    }

    init() {
        this.ws = new WebsocketBase({
            onopen: () => {
                this.ready = true
                this.onready && this.onready()
            },
            onmessage: (data: string | ArrayBuffer) => {
                if (data instanceof ArrayBuffer) {
                    this.recordBuilder!.sendBuffer(data)
                } else {
                    const res = JSON.parse(data)
                    const resBasic = res.basic || {}
                    const resData = res.data || {}
                    const dataCode = Number(resData.code)
                    const code = dataCode || resBasic.code || 0
                    if (code && code !== 0) {
                        let taskId = resData.task_id
                        taskId = taskId ? taskId.toLowerCase() : null
                        this.handleErrorCode(code, taskId, res.url)
                    }
                }
            },
            onerror: () => {
                this.ready = false
                this.onerror && this.onerror()
            },
            onclose: () => {
                this.ready = false
                this.onclose && this.onclose()
            },
        })
    }

    /**
     * @description 检查当前渲染任务是否执行完
     * @param {Function} cb
     */
    checkReady(cb: () => void) {
        const timer = setTimeout(() => {
            if (this.ready) {
                cb()
            } else {
                this.checkReady(cb)
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
    handleErrorCode(errorCode: number, taskId: string, url: string) {
        console.log(`record:${taskId} end, errorCode: ${errorCode}, URL:${url}, last frameIndex: ${this.frameIndex}`)

        if (!this.canFreshFrameIndex || this.taskStatusMap[taskId] === 'done') {
            return
        }

        if (taskId) {
            this.taskStatusMap[taskId] = 'done'
        }
        this.canFreshFrameIndex = false
        this.recordBuilder!.stopRecord(true) // 遇到错误码时，手动中断录像
        if (errorCode === ErrorCode.USER_ERROR_NO_RECORDDATA) {
            // 当前任务无录像时
            if (this.cmdQueue.length <= 1) {
                // 任务队列为空，则通知完成
                const taskIndex = this.recordList.length - 1
                this.onmessage &&
                    this.onmessage({
                        file: null,
                        taskId,
                        taskIndex,
                        chlId: this.recordList[taskIndex].chlID,
                        frameTime: 0,
                        firstFrameTime: 0,
                        finished: true,
                    })
            }
            return
        }

        if (errorCode && errorCode !== ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED) {
            // 录像流结束
            this.onerror && this.onerror(errorCode)
        }
    }

    /**
     * @description 开启一个任务
     * @param {Array<CmdPlaybackOpenOption>} recordList 成员字段见startOneTask
     */
    start(recordList: CmdPlaybackOpenOption[]) {
        if (!(recordList && recordList.length)) {
            return
        }
        this.recordList = recordList
        this.cmdQueue = []
        this.checkReady(() => {
            for (let i = 0; i < recordList.length; i++) {
                this.startOneTask(recordList[i], i)
            }
        })
    }

    /**
     * @description 开启一个录像任务
     * @param {CmdPlaybackOpenOption} record
     * @param {number} taskIndex 任务索引
     */
    startOneTask(record: CmdPlaybackOpenOption, taskIndex: number) {
        const cmd = CMD_PLAYBACK_OPEN(record)
        const taskId = cmd.data.task_id
        const chlId = record.chlID
        this.cmdQueue.push({
            cmd: cmd,
            taskIndex: taskIndex,
        })
        this.taskStatusMap[taskId] = 'waiting'
        if (this.cmdQueue.length === this.recordList.length) {
            this.lastTaskId = taskId
        }
        this.recordBuilder!.createRecord((recordFile, isFinished, fileIndex) => {
            this.onmessage &&
                this.onmessage({
                    file: recordFile,
                    taskId: taskId,
                    taskIndex,
                    chlId,
                    frameTime: this.frameTime,
                    firstFrameTime: this.taskIdFrameTimeMap[taskId] || cmd.data.start_time * 1000 + 2000,
                    finished: isFinished && this.taskStatusMap[this.lastTaskId as string] === 'done',
                })
            console.log(`record:${taskIndex} -- fileIndex:${fileIndex} complete, frameTime:${formatDate(this.frameTime, 'YYYY/MM/DD HH:mm:ss')}`)
            if (isFinished) {
                // 完成一个任务后才开启下一个
                this.execNextCmd()
            }
        })
        if (this.cmdQueue.length === 1) {
            this.execCmd()
        }
        return taskId
    }

    /**
     * @description 停止请求录像回放
     */
    stop() {
        if (!this.taskId) {
            return
        }
        const cmd = CMD_PLAYBACK_CLOSE(this.taskId)
        this.ws!.send(JSON.stringify(cmd))
    }

    /**
     * @description 停止全部任务
     */
    stopAll() {
        this.stop()
        this.cmdQueue = []
    }

    /**
     * @description 刷新帧索引
     * @param {number} frameIndex
     */
    refreshFrameIndex(frameIndex: number) {
        const cmd = CMD_PLAYBACK_REFRESH_FRAME_INDEX(this.taskId as string, frameIndex)
        this.ws!.send(JSON.stringify(cmd))
    }

    /**
     * @description 发送请求
     */
    execCmd() {
        const cmdItem = this.cmdQueue[0]
        this.canFreshFrameIndex = !!cmdItem
        if (cmdItem) {
            this.taskId = cmdItem.cmd.data.task_id
            this.taskIndex = cmdItem.taskIndex
            this.ws!.send(JSON.stringify(cmdItem.cmd))
            this.taskStatusMap[this.taskId as string] = 'excuting'
        }
    }

    /**
     * @description 发送下一个请求
     */
    execNextCmd() {
        this.stop()
        this.cmdQueue.shift()
        this.execCmd()
    }

    destroy() {
        this.ws?.close()
        delete this.ws
        this.recordBuilder?.destroy()
        delete this.recordBuilder
        this.ready = false
        delete this.taskId
        this.cmdQueue = []
        this.recordList = []
        this.taskStatusMap = {}
        this.taskIdFrameTimeMap = {}
    }
}
