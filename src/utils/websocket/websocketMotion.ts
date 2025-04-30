/*
 * @Date: 2025-04-28 16:54:33
 * @Description: websocket 订阅移动侦测动态分析效果
 * @Author: yejiahao yejiahao@tvt.net.cn
 */

export interface WebsocketMotionOption {
    onerror?: () => void
    onclose?: () => void
    onmotion?: (data: { motion_infos: { grids: string }[] }) => void
    config: CmdPreviewOption
}

export const WebsocketMotion = (option: WebsocketMotionOption) => {
    const config = option.config // 请求入参

    const onerror = option.onerror
    const onclose = option.onclose
    const onmotion = option.onmotion

    let taskID = '' // 与设备交互的guid
    let ws: ReturnType<typeof WebsocketBase>

    const motionRender = WasmMotionRender({
        ready: () => {
            init()
        },
        onmotion: (data) => {
            onmotion && onmotion(data)
        },
    })

    const init = () => {
        ws = WebsocketBase({
            onopen() {
                start()
            },
            onmessage(data: string | ArrayBuffer) {
                if (typeof data === 'string') {
                    const res = JSON.parse(data)
                    const code = res.basic.code
                    if (res.url === '/device/state_info/subscribe#response' && code === 0) {
                        console.log('status information subscription success')
                    }
                } else {
                    handleMotionData(data)
                }
            },
            onerror() {
                onerror && onerror()
            },
            onclose() {
                onclose && onclose()
            },
        })
    }

    // 解析websocket返回motion帧数据
    const handleMotionData = (buffer: ArrayBuffer) => {
        motionRender.decoderMotion(buffer)
    }

    const start = () => {
        const cmd = CMD_PREVIEW(config)
        taskID = cmd.data.task_id
        ws.send(JSON.stringify(cmd))
    }

    const stop = () => {
        const cmd = CMD_STOP_PREVIEW(taskID)
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
