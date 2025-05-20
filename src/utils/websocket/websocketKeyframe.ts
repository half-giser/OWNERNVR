/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 18:00:36
 * @Description: websocket 请求通道关键帧
 */

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

export const WebsocketKeyframe = (option: WebsocketKeyframeOption) => {
    let ws: ReturnType<typeof WebsocketBase>
    let taskId: string | null = null
    let cmdQueue: ReturnType<typeof CMD_KEYFRAME_START>[] = []
    let ready = false

    const onready = option.onready
    const onmessage = option.onmessage
    const onerror = option.onerror
    const onclose = option.onclose
    const imgRender = WasmImageRender({
        ready: () => {
            init()
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
                    const dataView = new DataView(data)
                    const encryptType = dataView.getUint32(0, true)
                    const jsonOffset = encryptType === 0 ? 8 : 16
                    const jsonLen = dataView.getUint32(4, true)
                    const jsonEndPosition = jsonLen + jsonOffset
                    const jsonBuf = data.slice(jsonOffset, jsonEndPosition)
                    const json = JSON.parse(Uint8ArrayToStr(new Uint8Array(jsonBuf)))
                    handleFrameData(json, jsonEndPosition, data)
                } else {
                    const res = JSON.parse(data)
                    if (res.url === '/device/search/key/frame/data') {
                        if (res.data.code === ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED) {
                            // 此错误码表示上一个任务已结束，可开启下一个任务了
                            const currentTaskId = res.data.task_id.toLowerCase()
                            if (currentTaskId === taskId) {
                                execNextCmd()
                            }
                        }
                    } else if (res.url === '/device/search/key/frame/start#response') {
                        const code = Number(res.basic.code)
                        if (code === ErrorCode.USER_ERROR_FAIL) {
                            // 此错误码表示当前任务未请求到图片流
                            // 直接跳过执行下一个任务
                            const currentTaskId = res.data.task_id.toLowerCase()
                            if (currentTaskId === taskId) {
                                execNextCmd()
                            }
                        }
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
        if (ready) {
            cb()
        } else {
            setTimeout(() => {
                checkReady(cb)
            }, 10)
        }
    }

    /**
     * @param {Object} json
     *  @property {String} task_id: 任务id
     *  @property {String} frame_data: 图片帧起止范围
     *  @property {Number} frame_index: 图片帧索引
     */
    const handleFrameData = (json: { data: { task_id: string; frame_data: string; thumbnail_stream_data: string }; frame_index: number }, jsonEndPosition: number, buffer: ArrayBuffer) => {
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

            imgRender.render(imgBuf, (imgUrl, frameTime) => {
                if (imgUrl !== 'preDecodedFrame') {
                    onmessage &&
                        onmessage({
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
    const start = (option: CmdKeyframeStartOption) => {
        const cmd = CMD_KEYFRAME_START(option)
        cmdQueue.push(cmd)
        if (cmdQueue.length === 1) {
            execCmd()
        }
        return cmd.data.task_id
    }

    /**
     * @description 发送请求
     */
    const execCmd = () => {
        const cmd = cmdQueue[0]
        if (cmd) {
            taskId = cmd.data.task_id
            ws?.send(JSON.stringify(cmd))
        }
    }

    /**
     * @description 发送请求
     */
    const execNextCmd = () => {
        stop()
        cmdQueue.shift()
        execCmd()
    }

    /**
     * @description 停止请求
     */
    const stop = () => {
        if (!taskId) {
            return
        }
        const cmd = CMD_KEYFRAME_STOP(taskId)
        ws?.send(JSON.stringify(cmd))
    }

    /**
     * @description 停止全部任务
     */
    const stopAll = () => {
        stop()
        cmdQueue = []
    }

    const destroy = () => {
        ws?.close()
        imgRender?.destroy()
        taskId = null
        cmdQueue = []
    }

    return {
        checkReady,
        start,
        stop,
        stopAll,
        destroy,
    }
}
