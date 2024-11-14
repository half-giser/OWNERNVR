/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 18:00:36
 * @Description: websocket 请求通道关键帧
 */
import WebsocketBase from './websocketBase'
import ImgRender from '../wasmPlayer/imageRender'
import { type CmdKeyframeStartOption } from './websocketCmd'

export interface WebsocketKeyframeOption {
    onready?: () => void
    onmessage?: (param: WebsocketKeyframeOnMessageParam) => void
    onerror?: (param?: any) => void
    onclose?: () => void
}

export interface WebsocketKeyframeOnMessageParam {
    taskId: string
    frameTime: number
    frameIndex: number
    imgUrl: string
}

export default class WebsocketKeyframe {
    private ws?: WebsocketBase
    // private ready = false
    private taskId?: string
    private cmdQueue: ReturnType<typeof CMD_KEYFRAME_START>[] = []
    private imgRender?: ImgRender
    private readonly onready: WebsocketKeyframeOption['onready']
    private readonly onmessage: WebsocketKeyframeOption['onmessage']
    private readonly onerror: WebsocketKeyframeOption['onerror']
    private readonly onclose: WebsocketKeyframeOption['onclose']
    private ready = false

    constructor(option: WebsocketKeyframeOption) {
        this.onready = option.onready
        this.onmessage = option.onmessage
        this.onerror = option.onerror
        this.onclose = option.onclose
        this.imgRender = new ImgRender({
            ready: () => {
                this.init()
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
                    const dataView = new DataView(data)
                    const encryptType = dataView.getUint32(0, true)
                    const jsonOffset = encryptType === 0 ? 8 : 16
                    const jsonLen = dataView.getUint32(4, true)
                    const jsonEndPosition = jsonLen + jsonOffset
                    const jsonBuf = data.slice(jsonOffset, jsonEndPosition)
                    const json = JSON.parse(Uint8ArrayToStr(new Uint8Array(jsonBuf)))
                    this.handleFrameData(json, jsonEndPosition, data)
                } else {
                    const res = JSON.parse(data)
                    if (res.url === '/device/search/key/frame/data') {
                        if (res.data.code === ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED) {
                            // 此错误码表示上一个任务已结束，可开启下一个任务了
                            const taskId = res.data.task_id.toLowerCase()
                            if (taskId === this.taskId) {
                                this.execNextCmd()
                            }
                        }
                    } else if (res.url === '/device/search/key/frame/start#response') {
                        const code = Number(res.basic.code)
                        if (code === ErrorCode.USER_ERROR_FAIL) {
                            // 此错误码表示当前任务未请求到图片流
                            // 直接跳过执行下一个任务
                            const taskId = res.data.task_id.toLowerCase()
                            if (taskId === this.taskId) {
                                this.execNextCmd()
                            }
                        }
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
        if (this.ready) {
            cb()
        } else {
            setTimeout(() => {
                // if (this.ws) {
                this.checkReady(cb)
                // }
            }, 10)
        }
    }

    /**
     * @param {Object} json
     *  @property {String} task_id: 任务id
     *  @property {String} frame_data: 图片帧起止范围
     *  @property {Number} frame_index: 图片帧索引
     */
    handleFrameData(json: { data: { task_id: string; frame_data: string; thumbnail_stream_data: string }; frame_index: number }, jsonEndPosition: number, buffer: ArrayBuffer) {
        try {
            const imgBufRange = json.data.thumbnail_stream_data.split(',')
            let imgBuf: ArrayBuffer | null = null
            if (imgBufRange && imgBufRange.length) {
                const start = Number(imgBufRange[0]) + jsonEndPosition
                const end = Number(imgBufRange[1]) * 1 + start
                imgBuf = buffer.slice(start, end)
            }

            if (!imgBuf) {
                return
            }

            this.imgRender!.render(imgBuf, (imgUrl, frameTime) => {
                if (imgUrl !== 'preDecodedFrame') {
                    this.onmessage &&
                        this.onmessage({
                            taskId: json.data.task_id,
                            frameTime: frameTime,
                            frameIndex: json.frame_index,
                            imgUrl: imgUrl,
                        })
                }
            })
        } catch (e) {}
    }

    /**
     * @description
     * @param {CmdKeyframeStartOption} option
     */
    start(option: CmdKeyframeStartOption) {
        const cmd = CMD_KEYFRAME_START(option)
        this.cmdQueue.push(cmd)
        if (this.cmdQueue.length === 1) {
            this.execCmd()
        }
        return cmd.data.task_id
    }

    /**
     * @description 发送请求
     */
    execCmd() {
        const cmd = this.cmdQueue[0]
        if (cmd) {
            this.taskId = cmd.data.task_id
            this.ws!.send(JSON.stringify(cmd))
        }
    }

    /**
     * @description 发送请求
     */
    execNextCmd() {
        this.stop()
        this.cmdQueue.shift()
        this.execCmd()
    }

    /**
     * @description 停止请求
     */
    stop() {
        if (!this.taskId) {
            return
        }
        const cmd = CMD_KEYFRAME_STOP(this.taskId)
        this.ws!.send(JSON.stringify(cmd))
    }

    /**
     * @description 停止全部任务
     */
    stopAll() {
        this.stop()
        this.cmdQueue = []
    }

    destroy() {
        this.ws?.close()
        delete this.ws
        this.imgRender?.destroy()
        delete this.imgRender
        // this.ready = false
        delete this.taskId
        this.cmdQueue = []
    }
}
