/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 09:55:33
 * @Description: websocket基础类
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-09 16:25:55
 */
export interface WebsocketBaseOption {
    onopen?: (param: string) => void
    onmessage?: (param: string | BinaryType) => void
    onerror?: () => void
    onclose?: () => void
    binaryType?: BinaryType
}

export default class WebsocketBase {
    private readonly HEART_BEAT_TIME = 30000 * 1000 // 心跳频率
    private readonly RETRY_TIME = 5000 // 重试频率
    private readonly MAX_RETRY = 10 // 最大重试次数
    private ws: WebSocket | null = null // 连接实例
    private heartBeatTimer: NodeJS.Timeout | number = 0 // 心跳定时器
    private retryTimer: NodeJS.Timeout | number = 0 // 重试定时器
    private retryCount = 0 // 当前重试次数
    private readonly binaryType: BinaryType
    private readonly onopenCb: WebsocketBaseOption['onopen']
    private readonly onmessageCb: WebsocketBaseOption['onmessage']
    private readonly onerrorCb: WebsocketBaseOption['onerror']
    private readonly oncloseCb: WebsocketBaseOption['onclose']

    constructor(option: WebsocketBaseOption) {
        this.onopenCb = option.onopen
        this.onmessageCb = option.onmessage
        this.onerrorCb = option.onerror
        this.oncloseCb = option.onclose
        this.binaryType = option.binaryType || 'arraybuffer'
        this.init()
    }

    /**
     * @description 初始化建立连接，连接url由getWebsocketOpenUrl函数提供
     */
    private init() {
        this.ws = new WebSocket(getWebsocketOpenUrl())
        this.ws.binaryType = this.binaryType
        this.ws.onopen = () => {
            console.log('websocket success:', formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'))
        }

        this.ws.onmessage = (event) => {
            try {
                const res = JSON.parse(event.data)
                const resData = res.data || {}
                const code = Number(resData.code)
                if (res.url === '/device/create_connection#response' && code === 0) {
                    console.log('websocket authentication success:', formatDate(new Date(), 'YYYY-MM-dd hh:mm:ss'))
                    this.closeRetryTimer()
                    this.openHeartBeat()
                    this.onopenCb && this.onopenCb(event.data)
                } else {
                    this.onmessageCb && this.onmessageCb(event.data)
                }
            } catch (ev) {
                this.onmessageCb && this.onmessageCb(event.data)
            }
        }

        this.ws.onerror = () => {
            this.openRetryTimer()
        }

        this.ws.onclose = () => {
            console.log('websocket closed', formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'))
            this.oncloseCb && this.oncloseCb()
        }
    }

    /**
     * @description 开启心跳检测
     */
    private openHeartBeat() {
        this.heartBeatTimer = setInterval(() => {
            if (this.ws!.readyState === 1) {
                console.log('websocket keep connect')
            } else {
                console.log('websocket disconnect, try again')
                this.openRetryTimer()
            }
        }, this.HEART_BEAT_TIME)
    }

    /**
     * @description 关闭心跳
     */
    private closeHeartBeat() {
        clearInterval(this.heartBeatTimer)
        this.heartBeatTimer = 0
    }

    /**
     * @description 开启重试定时器
     */
    private openRetryTimer() {
        if (this.retryTimer) {
            this.closeRetryTimer()
        }
        // 定时尝试重连，5秒尝试一次
        this.retryTimer = setInterval(() => {
            if (this.ws!.readyState === 1) {
                this.closeRetryTimer()
            } else if (this.retryCount > this.MAX_RETRY) {
                // 最多重试10次，超过10次断开连接
                this.onerrorCb && this.onerrorCb()
                this.close()
            } else {
                this.ws = new WebSocket(getWebsocketOpenUrl())
                this.retryCount++
            }
        }, this.RETRY_TIME)
    }

    /**
     * @description 清除重试定时器
     */
    private closeRetryTimer() {
        this.retryCount = 0
        clearInterval(this.retryTimer)
        this.retryTimer = 0
    }

    /**
     * @description 发送数据
     * @param { string | ArrayBufferLike | Blob | ArrayBufferView } data
     */
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        if (this.ws?.readyState === 1) {
            this.ws.send(data)
        }
    }

    /**
     * @description 关闭连接
     */
    close() {
        this.ws?.close()
        this.closeHeartBeat()
        this.closeRetryTimer()
    }
}
