/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 17:19:08
 * @Description: websocket 订阅通道在线状态、报警推送、录像事件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-05-31 09:32:02
 */
import WebsocketBase from './websocketBase'
import { CMD_STATE_INFO_SUBSCRIBE, CMD_STATE_INFO_UNSUBSCRIBE, type CmdStateInfoSubscribeOption } from './websocketCmd'
import { Uint8ArrayToStr } from '../tools'

export interface WebsocketStateOption {
    config: CmdStateInfoSubscribeOption
    onmessage?: (param: ArrayBuffer) => void
}

export default class WebsocketState {
    private ws?: WebsocketBase
    private config: CmdStateInfoSubscribeOption
    private readonly onmessage: WebsocketStateOption['onmessage']

    constructor(option: WebsocketStateOption) {
        this.config = option.config
        this.onmessage = option.onmessage
        this.init()
    }

    private init() {
        this.ws = new WebsocketBase({
            onopen: () => {
                this.start()
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
                        this.onmessage && this.onmessage(jsonData)
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
    }

    start() {
        const cmd = CMD_STATE_INFO_SUBSCRIBE(this.config)
        this.ws!.send(JSON.stringify(cmd))
    }

    stop() {
        const cmd = CMD_STATE_INFO_UNSUBSCRIBE()
        this.ws!.send(JSON.stringify(cmd))
    }

    destroy() {
        this.stop()
        this.ws!.close()
    }
}
