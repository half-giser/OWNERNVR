/*
 * @Date: 2025-04-29 11:43:42
 * @Description: P2P Transport
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
export const useP2PTransport = defineStore('p2pTransport', () => {
    const userSession = useUserSessionStore()
    // 前四个字节描述xml元数据长度
    const HEAD_BYTE = 4
    // ws请求队列
    const wsReqQueue: (() => void)[] = []
    // pedding sending
    let wsReqStatus = 'sending'

    // P2P http请求, 二进制形式: xml元数据长度 + xml元数据 + 负载数据(http请求报文)
    type P2PTransportHttpOptions = {
        url: string
        data: string
        callback: (buffer: ArrayBuffer) => void
    }

    /**
     * @description
     * @param option
     */
    const httpRequest = (option: P2PTransportHttpOptions) => {
        const url = option.url
        const data = option.data
        const callback = option.callback
        const $request = XMLStr2XMLDoc(option.data)
        console.log('%crequest--' + url, 'color: green', $request)
        const payLoadData = getHttpHead(url, data)
        const metaDataXmlStr = getMetaData(payLoadData)
        concatRequestData(metaDataXmlStr, payLoadData, callback)
    }

    const handleWsRequest = (payLoadData: string | ArrayBuffer, metaDataXmlStr: string) => {
        const plugin = usePlugin()
        const callback = (buffer: ArrayBuffer) => {
            plugin.ExecuteCmd(buffer)
            wsReqStatus = 'sending'
            wsReqQueueExcute()
        }

        const wsReqItem = () => {
            concatRequestData(metaDataXmlStr, payLoadData, callback)
        }
        wsReqQueue.push(wsReqItem)
        wsReqQueueExcute()
    }

    const createWsRequest = (option: { url: string; random: string }) => {
        const url = option.url
        const random = option.random
        const payLoadData = getWebsocketHead(url, random)
        const metaDataXmlStr = getMetaData(payLoadData)
        console.log('%crequest--weboskcet =', 'color: green', payLoadData)
        handleWsRequest(payLoadData, metaDataXmlStr)
    }

    // P2P websocket请求, 二进制形式: xml元数据长度 + xml元数据 + 负载数据(websocket标准二进制结构报文)
    const wsRequest = (option: { buffer: ArrayBuffer | Uint8Array<ArrayBuffer>; identify: number }) => {
        const buffer = option.buffer
        const identify = option.identify
        const payLoadData = buffer
        const metaDataXmlStr = getMetaData(payLoadData as ArrayBuffer, identify)
        handleWsRequest(payLoadData as ArrayBuffer, metaDataXmlStr)
    }

    // 组合请求消息
    const concatRequestData = async (metaDataXmlStr: string, payLoadData: string | ArrayBuffer, callback: (buffer: ArrayBuffer) => void) => {
        const metaDataBuff = (await dataToBuffer(metaDataXmlStr)) as ArrayBuffer
        const payLoadDataBuff = (await dataToBuffer(payLoadData)) as ArrayBuffer
        const buffer = new ArrayBuffer(HEAD_BYTE)
        const dataView = new DataView(buffer)
        dataView.setUint32(0, metaDataXmlStr.length, true)
        let resultBuff = dataView.buffer
        resultBuff = appendBuffer(resultBuff, metaDataBuff) as ArrayBuffer
        resultBuff = appendBuffer(resultBuff, payLoadDataBuff) as ArrayBuffer
        typeof callback === 'function' && callback(resultBuff)
    }

    // ws请求队列执行
    const wsReqQueueExcute = () => {
        if (wsReqStatus === 'pedding' || wsReqQueue.length === 0) return false
        wsReqStatus = 'pedding'
        const wsReqItem = wsReqQueue.shift()
        typeof wsReqItem === 'function' && wsReqItem()
    }

    // 获取http消息头
    const getHttpHead = (url: string, data: string) => {
        const head = `POST /${url} HTTP/1.1\nContent-Length:${getBytesLength(data)}\n\n`
        return head + data
    }

    // 获取websocket消息头
    const getWebsocketHead = (url: string, random: string) => {
        const sessionIdSplit = userSession.sessionId.match(/\{([\s\S]*)\}/)
        const sessionId = sessionIdSplit && sessionIdSplit.length > 0 && sessionIdSplit[1]
        return (
            `GET ${url} HTTP/1.1\n` +
            'Upgrade: websocket\n' +
            'Connection: Upgrade\n' +
            'Sec-WebSocket-Version: 13\n' +
            `Cookie: sessionID=${sessionId}\n` +
            `Sec-WebSocket-Key: ${random}\n` +
            'Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits\n'
        )
    }

    // 获取xml元数据
    const getMetaData = (payLoadData: string | ArrayBuffer, hadIdentify?: number) => {
        const plugin = usePlugin()
        const isHttp = typeof payLoadData === 'string' && payLoadData.indexOf(xmlHeader) > 0
        // 传输类型, 1: http协议, 2: websocket协议
        const transType = isHttp ? 1 : 2
        // 源数据长度（加密对象为请求报文）
        const srcDataLen = isBuffer(payLoadData) ? (payLoadData as ArrayBuffer).byteLength : getBytesLength(payLoadData as string)
        // 加密起始位置（加密对象为请求报文）
        // websocket链路标识id
        const identify = hadIdentify || plugin.P2pCmdSender.identify++

        return (
            xmlHeader +
            rawXml`
                <meta>
                    <transType>${transType}</transType>
                    <encryptVer>1</encryptVer>
                    <encryptStartPos>0</encryptStartPos>
                    <srcDataLen>${srcDataLen}</srcDataLen>
                    <identify>${identify}</identify>
                </meta>
            `
        )
    }

    type P2PTransportCallback = {
        transType: string
        identify: number
        buffer: ArrayBuffer
    }

    // 解析P2P响应消息, 二进制形式(xml元数据长度 + xml元数据 + 负载数据)
    const splitP2PResponse = (blob: Blob, callback: (e: P2PTransportCallback) => void) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const buffer = reader.result as ArrayBuffer
            const dataView = new DataView(buffer)
            const metaDataLen = dataView.getUint32(0, true)
            const metaDataBuff = buffer.slice(HEAD_BYTE, metaDataLen + HEAD_BYTE)
            const metaDataXmlStr = Uint8ArrayToStr(new Uint8Array(metaDataBuff))
            const transTypeValue = Number(metaDataXmlStr.match(/<transType>([\s\S]*)<\/transType>/)![1])
            const transType = transTypeValue === 1 ? 'http' : 'websocket'
            const identify = Number(metaDataXmlStr.match(/<identify>([\s\S]*)<\/identify>/)![1])
            const payLoadDataBuff = buffer.slice(HEAD_BYTE + metaDataLen)
            const result = {
                transType: transType,
                identify: identify,
                buffer: payLoadDataBuff,
            }
            typeof callback === 'function' && callback(result)
        }
        reader.readAsArrayBuffer(blob)
    }

    return {
        HttpRequest: httpRequest,
        WsRequest: wsRequest,
        CreateWsRequest: createWsRequest,
        SplitP2PResponse: splitP2PResponse,
    }
})
