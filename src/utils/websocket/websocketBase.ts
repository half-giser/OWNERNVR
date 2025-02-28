/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 09:55:33
 * @Description: websocket基础类
 */
export interface WebsocketBaseOption {
    onopen?: (param: string) => void
    onmessage?: (param: string | BinaryType) => void
    onerror?: () => void
    onclose?: () => void
    binaryType?: BinaryType
}

export const WebsocketBase = (option: WebsocketBaseOption) => {
    const HEART_BEAT_TIME = 30000 * 1000 // 心跳频率
    const RETRY_TIME = 5000 // 重试频率
    const MAX_RETRY = 10 // 最大重试次数

    let ws: WebSocket // 连接实例
    let heartBeatTimer: NodeJS.Timeout | number = 0 // 心跳定时器
    let retryTimer: NodeJS.Timeout | number = 0 // 重试定时器
    let retryCount = 0 // 当前重试次数

    const onopenCb = option.onopen
    const onmessageCb = option.onmessage
    const onerrorCb = option.onerror
    const oncloseCb = option.onclose
    const binaryType = option.binaryType || 'arraybuffer'

    /**
     * @description 初始化建立连接，连接url由getWebsocketOpenUrl函数提供
     */
    const init = () => {
        ws = new WebSocket(getWebsocketOpenUrl())

        ws.binaryType = binaryType

        ws.onopen = () => {
            console.log('websocket success:', formatDate(new Date()))
        }

        ws.onmessage = (event) => {
            try {
                const res = JSON.parse(event.data)
                const resData = res.data || {}
                const code = Number(resData.code)
                if (res.url === '/device/create_connection#response' && code === 0) {
                    console.log('websocket authentication success:', formatDate(new Date()))
                    closeRetryTimer()
                    openHeartBeat()
                    onopenCb && onopenCb(event.data)
                } else {
                    onmessageCb && onmessageCb(event.data)
                }
            } catch (ev) {
                onmessageCb && onmessageCb(event.data)
            }
        }

        ws.onerror = () => {
            openRetryTimer()
        }

        ws.onclose = () => {
            console.log('websocket closed', formatDate(new Date()))
            oncloseCb && oncloseCb()
        }
    }

    /**
     * @description 开启心跳检测
     */
    const openHeartBeat = () => {
        heartBeatTimer = setInterval(() => {
            if (ws?.readyState === 1) {
                console.log('websocket keep connect')
            } else {
                console.log('websocket disconnect, try again')
                openRetryTimer()
            }
        }, HEART_BEAT_TIME)
    }

    /**
     * @description 关闭心跳
     */
    const closeHeartBeat = () => {
        clearInterval(heartBeatTimer)
        heartBeatTimer = 0
    }

    /**
     * @description 开启重试定时器
     */
    const openRetryTimer = () => {
        if (retryTimer) {
            closeRetryTimer()
        }
        // 定时尝试重连，5秒尝试一次
        retryTimer = setInterval(() => {
            if (ws?.readyState === 1) {
                closeRetryTimer()
            } else if (retryCount > MAX_RETRY) {
                // 最多重试10次，超过10次断开连接
                onerrorCb && onerrorCb()
                close()
            } else {
                init()
                // ws = new WebSocket(getWebsocketOpenUrl())
                retryCount++
            }
        }, RETRY_TIME)
    }

    /**
     * @description 清除重试定时器
     */
    const closeRetryTimer = () => {
        retryCount = 0
        clearInterval(retryTimer)
        retryTimer = 0
    }

    /**
     * @description 发送数据
     * @param { string | ArrayBufferLike | Blob | ArrayBufferView } data
     */
    const send = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
        if (ws?.readyState === 1) {
            ws.send(data)
        }
    }

    /**
     * @description 关闭连接
     */
    const close = () => {
        ws?.close()
        closeHeartBeat()
        closeRetryTimer()
    }

    init()

    return {
        send,
        close,
    }
}
