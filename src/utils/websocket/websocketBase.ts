/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 09:55:33
 * @Description: websocket基础类
 */
export interface WebsocketBaseOption {
    onopen?: (param: string) => void // 建立连接且成功的回调
    onmessage?: (param: string | ArrayBuffer) => void // 数据响应的回调
    onerror?: () => void //WebSocket['onerror'] // 连接错误, 且重试失败（超过最大重试次数）后的回调
    onclose?: () => void //WebSocket['onclose'] // 连接关闭的回调
    binaryType?: BinaryType
}

export const WebsocketBase = (option: WebsocketBaseOption) => {
    const userSession = useUserSessionStore()
    const plugin = usePlugin()
    const p2pTransport = useP2PTransport()

    const isSTANDARD = userSession.appType === 'STANDARD'
    const HEART_BEAT_TIME = isSTANDARD ? 30 * 60 * 1000 : 3 * 1000 // 心跳频率
    const RETRY_TIME = 5000 // 重试频率
    const MAX_RETRY = 3 // 最大重试次数

    let ws: WebSocket // 连接实例
    let heartBeatTimer: NodeJS.Timeout | number = 0 // 心跳定时器
    let retryTimer: NodeJS.Timeout | number = 0 // 重试定时器
    let retryCount = 0 // 当前重试次数
    let identify = 0 // P2P标识id
    let isUpgradeWs = false
    let isP2PCreate = false

    let tempObj: {
        buffer: ArrayBuffer | ArrayBufferLike
        headerLen: number
        payLoadLen: number
    } | null = null

    const onopenCb = option.onopen
    const onmessageCb = option.onmessage
    const onerrorCb = option.onerror
    const oncloseCb = option.onclose
    const binaryType = option.binaryType || 'arraybuffer'

    // 初始化建立连接
    const init = () => {
        const wsUrl = getWebsocketOpenUrl()

        if (isSTANDARD) {
            ws = new WebSocket(wsUrl)
            ws.binaryType = binaryType
            ws.onmessage = (event) => {
                onmessage(event.data)
            }
            ws.onerror = () => onerrorCb && onerrorCb()
            ws.onclose = () => oncloseCb && oncloseCb()
        } else {
            // plugin.add
            plugin.VideoPluginNotifyEmitter.addListener((id: number, buffer: ArrayBuffer) => {
                if (typeof id !== 'number' || !isBuffer(buffer)) return false
                if (id === identify) {
                    const payLoadData = Uint8ArrayToStr(new Uint8Array(buffer))
                    // console.log('%cwebsocket--response =', 'color: red', payLoadData)
                    isUpgradeWs = payLoadData.indexOf('create_connection#response') > -1 // http协议升级为websocket协议, 后续按websocket标准二进制结构通信
                    if (isUpgradeWs) {
                        onmessage(payLoadData)
                    }
                } else {
                    if (tempObj) {
                        tempObj.buffer = appendBuffer(tempObj.buffer as ArrayBuffer, buffer) as ArrayBuffer
                        buffer = tempObj.buffer as ArrayBuffer
                    }

                    const headerObj = splitWebSocketHeader(new Uint8Array(buffer))
                    const opCode = headerObj.ucOpCode // opCode操作码, 1: 纯文本, 2: 二进制
                    const bFin = headerObj.bFin

                    if (opCode === 1 || opCode === 2) {
                        if (!tempObj) {
                            tempObj = {
                                buffer: new Uint8Array(buffer).buffer,
                                headerLen: headerObj.dwHeaderLen,
                                payLoadLen: headerObj.dwPayloadLen,
                            }
                        }

                        if (tempObj && tempObj.buffer.byteLength >= tempObj.headerLen + tempObj.payLoadLen) {
                            let payLoadData: string | ArrayBuffer = tempObj.buffer.slice(tempObj.headerLen) as ArrayBuffer
                            if (opCode === 1) {
                                payLoadData = Uint8ArrayToStr(new Uint8Array(payLoadData))
                            }

                            if (bFin === 1) {
                                onmessage(payLoadData)
                                tempObj = null
                            }
                        }
                    }
                }
            })

            identify = plugin.P2pCmdSender.identify
            isUpgradeWs = false
            const random = getRandomGUID().match(/\{([\s\S]*)\}/)![1] // 随机数去掉{}号
            p2pTransport.CreateWsRequest({
                url: wsUrl,
                random: Number(random),
            })
        }
    }

    // 连接响应回调
    const onmessage = (data: string | ArrayBuffer) => {
        if (typeof data === 'string') {
            const res = JSON.parse(data)
            const resData = res.data || {}
            const code = resData.code
            if (res.url === '/device/create_connection#response' && code === 0) {
                console.log('websocket authentication success:', formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'))
                closeRetryTimer()
                openHeartBeat()
                onopenCb && onopenCb(data)
            } else {
                onmessageCb && onmessageCb(data)
            }
        } else {
            onmessageCb && onmessageCb(data)
        }
    }

    // 发送数据
    const send = async (data: string | ArrayBufferLike | Blob | ArrayBufferView | ArrayBuffer) => {
        if (isSTANDARD) {
            if (ws?.readyState === 1) {
                ws.send(data)
            }
        } else {
            console.log('%crequest--weboskcet =', 'color: green', data)
            const opCode = isBuffer(data) ? 2 : 1 // 1: 纯文本, 2: 二进制, 8: 关闭连接, 9: 心跳PING, 10: 心跳PONG
            const payLoadLen = isBuffer(data) ? (data as ArrayBuffer).byteLength : (data as string).length
            const bFin = true
            const bMask = false
            const headerBuff = getWebSocketHeader(opCode, payLoadLen, bFin, bMask).buffer
            const dataBuff = await dataToBuffer(data)
            const sendBuff = appendBuffer(headerBuff, dataBuff as ArrayBuffer)
            p2pTransport.WsRequest({
                buffer: sendBuff,
                identify: identify,
            })
        }
    }

    // 解析websocket标准二进制报文响应头
    const splitWebSocketHeader = (buffer: Uint8Array) => {
        if (!buffer || buffer.length < 2) {
            throw new Error('Invalid buffer')
        }

        const header = {
            bFin: 0,
            bRsv1: 0,
            bRsv2: 0,
            bRsv3: 0,
            ucOpCode: 0,
            bMask: 0,
            dwPayloadLen: 0,
            dwHeaderLen: 0,
            ucMaskKey: new Uint8Array(4),
        }
        let parseBuffer = buffer
        header.bFin = (parseBuffer[0] >> 7) & 0x01
        header.bRsv1 = (parseBuffer[0] >> 6) & 0x01
        header.bRsv2 = (parseBuffer[0] >> 5) & 0x01
        header.bRsv3 = (parseBuffer[0] >> 4) & 0x01
        header.ucOpCode = parseBuffer[0] & 0x0f
        parseBuffer = parseBuffer.slice(1)
        header.bMask = (parseBuffer[0] >> 7) & 0x01
        const value = parseBuffer[0] & 0x7f

        parseBuffer = parseBuffer.slice(1)

        if (value === 126) {
            if (parseBuffer.length < 2) {
                throw new Error('Invalid buffer')
            }

            header.dwPayloadLen = (parseBuffer[0] << 8) | parseBuffer[1]
            parseBuffer = parseBuffer.slice(2)
            header.dwHeaderLen = 4
        } else if (value === 127) {
            if (parseBuffer.length < 8) {
                throw new Error('Invalid buffer')
            }

            header.dwPayloadLen = (parseBuffer[4] << 24) | (parseBuffer[5] << 16) | (parseBuffer[6] << 8) | parseBuffer[7]

            parseBuffer = parseBuffer.slice(8)
            header.dwHeaderLen = 10
        } else {
            header.dwPayloadLen = value
            header.dwHeaderLen = 2
        }

        if (header.bMask) {
            if (parseBuffer.length < 4) {
                throw new Error('Invalid buffer')
            }
            header.ucMaskKey.set(parseBuffer.slice(0, 4))
            parseBuffer = parseBuffer.slice(4)
            header.dwHeaderLen += 4
        }

        return header
    }

    // 拼接websocket标准二进制报文请求头
    const getWebSocketHeader = (ucOpCode: number, dwPayloadLen: number, bFin: boolean, bMask: boolean) => {
        const headerArray = []
        // 第一个字节
        let firstByte = 0x00
        if (bFin) {
            firstByte |= 0x80
        }
        firstByte |= ucOpCode
        headerArray.push(firstByte)
        // 第二个字节及后续字节
        if (dwPayloadLen < 126) {
            // 小于126则只用7bit表示长度,整个帧头占用2字节
            let secondByte = dwPayloadLen
            if (bMask) {
                secondByte |= 0x80
            }
            headerArray.push(secondByte)
        } else if (dwPayloadLen < 65536) {
            // 小于65536则只用16bit表示长度,整个帧头占用4字节
            let secondByte = 0x7e
            if (bMask) {
                secondByte |= 0x80
            }
            headerArray.push(secondByte)
            headerArray.push((dwPayloadLen >> 8) & 0xff)
            headerArray.push(dwPayloadLen & 0xff)
        } else {
            // 等于/大于65536则用64bit表示长度,整个帧头占用10字节
            let secondByte = 0x7f
            if (bMask) {
                secondByte |= 0x80
            }
            headerArray.push(secondByte)
            headerArray.push(0x00) // 前4个字节为零
            headerArray.push(0x00)
            headerArray.push(0x00)
            headerArray.push(0x00)
            headerArray.push((dwPayloadLen >> 24) & 0xff)
            headerArray.push((dwPayloadLen >> 16) & 0xff)
            headerArray.push((dwPayloadLen >> 8) & 0xff)
            headerArray.push(dwPayloadLen & 0xff)
        }
        return new Uint8Array(headerArray)
    }

    // 建链成功回调
    // const onopen = () => {
    //     console.log('websocket success:', formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'))
    // }

    // 连接错误回调
    // const onerror = () => {
    //     openRetryTimer()
    // }

    // 连接关闭回调
    // const onclose = () => {
    //     console.log('websocket closed', formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'))
    //     oncloseCb && oncloseCb()
    // }

    // 开启心跳
    const openHeartBeat = () => {
        heartBeatTimer = setInterval(() => {
            if (isSTANDARD) {
                if (ws.readyState === 1) {
                    console.log('websocket keep connect')
                } else {
                    console.log('websocket disconnect, try again')
                    openRetryTimer()
                }
            } else {
                sendVirtualWsHeartBeat()
            }
        }, HEART_BEAT_TIME)
    }

    // P2P发送模拟websocket心跳
    const sendVirtualWsHeartBeat = () => {
        const opCode = 10 // 心跳PONG
        const payLoadLen = 0
        const bFin = true
        const bMask = false
        const sendBuff = getWebSocketHeader(opCode, payLoadLen, bFin, bMask)
        p2pTransport.WsRequest({
            buffer: sendBuff,
            identify: identify,
        })
    }

    // 关闭心跳
    const closeHeartBeat = () => {
        clearInterval(heartBeatTimer)
        heartBeatTimer = 0
    }

    // 开启重试定时器
    const openRetryTimer = () => {
        if (retryTimer) {
            closeRetryTimer()
        }
        // 定时尝试重连，5秒尝试一次
        retryTimer = setInterval(() => {
            if (ws.readyState === 1) {
                closeRetryTimer()
            } else if (retryCount > MAX_RETRY) {
                // 最多重试3次，超过3次断开连接
                onerrorCb && onerrorCb()
                close()
            } else {
                init()
                // ws = new WebSocket(getWebsocketOpenUrl())
                retryCount++
            }
        }, RETRY_TIME)
    }

    // 清除重试定时器
    const closeRetryTimer = () => {
        retryCount = 0
        clearInterval(retryTimer)
        retryTimer = 0
    }

    // 关闭连接
    const close = () => {
        if (isSTANDARD) {
            ws && ws.close()
        } else {
            sendVirtualWsClose()
            plugin.VideoPluginNotifyEmitter.removeListener(onmessage)
        }
        tempObj = null
        closeHeartBeat()
        closeRetryTimer()
    }

    // P2P发送模拟websocket关闭连接
    const sendVirtualWsClose = () => {
        const opCode = 8 // 关闭连接
        const payLoadLen = 0
        const bFin = true
        const bMask = false
        const sendBuff = getWebSocketHeader(opCode, payLoadLen, bFin, bMask)
        p2pTransport.WsRequest({
            buffer: sendBuff,
            identify: identify,
        })
    }

    const setP2PCreate = (bool: boolean) => {
        isP2PCreate = bool
    }

    const getP2PCreate = () => {
        return isP2PCreate
    }

    init()

    return {
        send,
        close,
        setP2PCreate,
        getP2PCreate,
    }
}
