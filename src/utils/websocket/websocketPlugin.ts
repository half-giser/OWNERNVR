/*
 * @Author: xujp xujp@tvt.net.cn
 * @Date: 2023-05-26 17:27:29
 * @Description: websocket开启视频插件播放视频功能 插件2.0基础类
 */
type LogInfoType = 'pluginMainProcess' | 'pluginSubProcess'

type ErrorType = 'openTip' | 'interruptErr' | 'closeTip'

export interface WebSocketPluginOption {
    onopen?: (e: Event) => void
    onmessage?: (e: any) => void
    onerror?: () => void
    onclose?: (e: CloseEvent) => void
    port: number
    wsUrl?: string
    wsType?: LogInfoType
}

/**
 * 状态订阅类
 * @param {Object} option
 *    @property {Function} onopen    ws成功回调
 *    @property {Function} onmessage ws通信回调
 *    @property {Function} onerror   ws错误回调
 *    @property {Function} onclose   ws关闭回调
 */
export const WebsocketPlugin = (option: WebSocketPluginOption) => {
    const logInfoMapping = {
        pluginMainProcess: {
            openTip: 'ocx 2.0 main process websocket success',
            interruptErr: 'ocx 2.0 main process websocket error',
            closeTip: 'ocx 2.0 main process websocket disconnect',
        },
        pluginSubProcess: {
            openTip: 'ocx 2.0 sub process websocket success',
            interruptErr: 'ocx 2.0 sub process websocket error',
            closeTip: 'ocx 2.0 sub process websocket disconnect',
        },
    }
    // const RETRY_TIME = 1000 // 重试频率
    const MAX_RETRY = 1 // 最大重试次数

    let ws: WebSocket // websocket对象

    const onopenCb = option.onopen
    const onmessageCb = option.onmessage
    const onerrorCb = option.onerror
    const oncloseCb = option.onclose
    // 端口
    const port = option.port
    // websocket链接地址
    const wsUrl = option.wsUrl || 'ws://127.0.0.1:' + port + '/requestWebsocketConnection'
    // ws类型, 'pluginMainProcess': 插件主进程用于获取新端口号，'pluginSubProcess': 插件子进程用于浏览器、插件、NVR三者之间交互
    const wsType = option.wsType || 'pluginSubProcess'
    // 记录查询信息id
    let reqId = 1
    // 重试定时器
    // let retryTimer: NodeJS.Timeout | number = 0
    // 当前重试次数
    let retryCount = 0
    // 插件信息
    let queryInfoMap: Record<number, (str: string) => void> = {}

    /**
     * @description 初始化
     */
    const init = () => {
        ws = new WebSocket(wsUrl)
        ws.onopen = (event) => {
            printLog(wsType, 'openTip')
            onopenCb && onopenCb(event)
        }

        ws.onmessage = (event) => {
            try {
                onmessageCb && onmessageCb(event.data)
            } catch (ev) {
                onmessageCb && onmessageCb(event.data)
            }
        }

        ws.onerror = () => {
            if (wsType === 'pluginSubProcess') {
                openRetryConnect()
            } else {
                printLog(wsType, 'interruptErr')
                onerrorCb && onerrorCb()
            }
        }

        ws.onclose = (event) => {
            printLog(wsType, 'closeTip')
            oncloseCb && oncloseCb(event)
        }
    }

    /**
     * @description 重试连接
     */
    const openRetryConnect = () => {
        if (retryCount >= MAX_RETRY) {
            // 超过最大重试次数, 断开连接
            if (typeof onerrorCb === 'function') {
                printLog(wsType, 'interruptErr')
                onerrorCb()
            }
            retryCount = 0
            Destroy()
        } else {
            init()
            retryCount++
        }
    }

    /**
     * @description 向插件发送指令
     * @param {string} xmlData
     */
    const ExecuteCmd = (xmlData: string) => {
        if (ws && ws.readyState === 1) ws.send(xmlData)
    }

    /**
     * @description 通过插件查询设备信息
     * @param {string} xmlData
     * @param {Function} callBack
     */
    const QueryInfo = (xmlData: string, callBack: (str: string) => void) => {
        const newXmlData: string = handle(xmlData, reqId + '')
        ws.send(newXmlData)
        queryInfoMap[reqId] = callBack
        reqId++
    }

    /**
     * @description 关闭插件链接
     */
    const Destroy = () => {
        reqId = 0
        queryInfoMap = {}
        if (ws) ws.close()
    }

    /**
     * @description 处理xml数据
     * @param {string} xmlData
     * @param {string} reqId
     * @returns {string}
     */
    const handle = (xmlData: string, reqId: string) => {
        const $xmlDoc = <XMLDocument>XMLStr2XMLDoc(xmlData)
        xmlParse('//request', $xmlDoc).attr('reqId', reqId)
        return XMLDoc2XMLStr($xmlDoc)
    }

    /**
     * @description 打印信息
     * @param {LogInfoType} logType
     * @param {ErrorType} logLevel
     */
    const printLog = (logType: LogInfoType, logLevel: ErrorType) => {
        console.log(logInfoMapping[logType][logLevel], formatDate(new Date()))
    }

    init()

    return {
        queryInfoMap,
        ExecuteCmd,
        QueryInfo,
        Destroy,
    }
}
