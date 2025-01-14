/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 17:19:08
 * @Description: websocket 订阅通道在线状态、报警推送、录像事件
 */
import WebsocketBase from './websocketBase'
import { CMD_STATE_INFO_SUBSCRIBE, CMD_STATE_INFO_UNSUBSCRIBE, type CmdStateInfoSubscribeOption } from './websocketCmd'

export interface WebsocketStateOption {
    config: CmdStateInfoSubscribeOption
    onmessage?: (param: ArrayBuffer) => void
}

export default function WebsocketState(option: WebsocketStateOption) {
    const config = option.config
    const onmessage = option.onmessage

    const ws = WebsocketBase({
        onopen: () => {
            start()
        },
        onmessage: (data: ArrayBuffer | string) => {
            if (data instanceof ArrayBuffer) {
                const dataView = new DataView(data)
                const encryptType = dataView.getUint32(0, true)
                const jsonOffset = encryptType === 0 ? 8 : 16
                const jsonLen = dataView.getUint32(4, true)
                const jsonEndPosition = jsonLen + jsonOffset
                const jsonBuf = data.slice(jsonOffset, jsonEndPosition)
                const json = JSON.parse(Uint8ArrayToStr(new Uint8Array(jsonBuf)))
                const url = json.url
                const jsonData = json.data
                if (url === '/device/state_info/subscribe/data') {
                    onmessage && onmessage(jsonData)
                }
            } else {
                const res = JSON.parse(data)
                const code = Number(res.basic.code)
                if (res.url === '/device/state_info/subscribe#response' && code === 0) {
                    console.log('status information subscription success')
                }
            }
        },
    })

    const start = () => {
        const cmd = CMD_STATE_INFO_SUBSCRIBE(config)
        ws.send(JSON.stringify(cmd))
    }

    const stop = () => {
        const cmd = CMD_STATE_INFO_UNSUBSCRIBE()
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
