/*
 * @Author: xujp xujp@tvt.net.cn
 * @Date: 2023-05-26 17:27:29
 * @Description: websocket开启视频插件播放视频功能 插件2.0基础类
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-06 16:56:15
 */
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
export default class WebsocketPlugin {
    fake = false
    // private readonly RETRY_TIME = 1000 // 重试频率
    private readonly MAX_RETRY = 1 // 最大重试次数
    private port: number // 端口
    private wsUrl: string // websocket链接地址
    private wsType: LogInfoType // ws类型, 'pluginMainProcess': 插件主进程用于获取新端口号，'pluginSubProcess': 插件子进程用于浏览器、插件、NVR三者之间交互
    private reqId: number // 记录查询信息id
    // private retryTimer: number | null // 重试定时器
    private retryCount: number // 当前重试次数
    queryInfoMap: Record<number, (str: string) => void> // 插件信息
    private ws!: WebSocket // websocket对象
    private readonly onopenCb: WebSocketPluginOption['onopen'] // ws成功回调
    private readonly onmessageCb: WebSocketPluginOption['onmessage'] // ws通信回调
    private readonly onerrorCb: WebSocketPluginOption['onerror'] // ws错误回调
    private readonly oncloseCb: WebSocketPluginOption['onclose'] // ws关闭回调

    constructor(option: WebSocketPluginOption) {
        this.onopenCb = option.onopen
        this.onmessageCb = option.onmessage
        this.onerrorCb = option.onerror
        this.oncloseCb = option.onclose
        this.port = option.port
        this.wsUrl = option.wsUrl || 'ws://127.0.0.1:' + this.port + '/requestWebsocketConnection'
        this.wsType = option.wsType || 'pluginSubProcess'
        this.reqId = 1
        // this.retryTimer = null
        this.retryCount = 0
        this.queryInfoMap = {}
        this.init()
    }

    /**
     * @description 初始化
     */
    init() {
        this.ws = new WebSocket(this.wsUrl)
        this.ws.onopen = (event) => {
            this.printLog(this.wsType, 'openTip')
            this.onopenCb && this.onopenCb(event)
        }

        this.ws.onmessage = (event) => {
            try {
                this.onmessageCb && this.onmessageCb(event.data)
            } catch (ev) {
                this.onmessageCb && this.onmessageCb(event.data)
            }
        }

        this.ws.onerror = () => {
            if (this.wsType == 'pluginSubProcess') {
                this.openRetryConnect()
            } else {
                this.printLog(this.wsType, 'interruptErr')
                this.onerrorCb && this.onerrorCb()
            }
        }

        this.ws.onclose = (event) => {
            this.printLog(this.wsType, 'closeTip')
            this.oncloseCb && this.oncloseCb(event)
        }
    }

    /**
     * @description 重试连接
     */
    openRetryConnect() {
        if (this.retryCount >= this.MAX_RETRY) {
            // 超过最大重试次数, 断开连接
            if (typeof this.onerrorCb === 'function') {
                this.printLog(this.wsType, 'interruptErr')
                this.onerrorCb()
            }
            this.retryCount = 0
            this.Destroy()
        } else {
            this.init()
            this.retryCount++
        }
    }

    /**
     * @description 向插件发送指令
     * @param {string} xmlData
     */
    ExecuteCmd(xmlData: string) {
        if (this.ws && this.ws.readyState === 1) this.ws.send(xmlData)
    }

    /**
     * @description 通过插件查询设备信息
     * @param {string} xmlData
     * @param {Function} callBack
     */
    QueryInfo(xmlData: string, callBack: (str: string) => void) {
        const newXmlData: string = this.handle(xmlData, this.reqId + '')
        this.ws.send(newXmlData)
        this.queryInfoMap[this.reqId] = callBack
        this.reqId++
    }

    /**
     * @description 关闭插件链接
     */
    Destroy() {
        this.reqId = 0
        this.queryInfoMap = {}
        if (this.ws) this.ws.close()
    }

    /**
     * @description 处理xml数据
     * @param {string} xmlData
     * @param {string} reqId
     * @returns {string}
     */
    handle(xmlData: string, reqId: string) {
        const $xmlDoc = <XMLDocument>XMLStr2XMLDoc(xmlData)
        xmlParse('//request', $xmlDoc).attr('reqId', reqId)
        return XMLDoc2XMLStr($xmlDoc)
    }

    /**
     * @description 打印信息
     * @param {LogInfoType} logType
     * @param {ErrorType} logLevel
     */
    printLog(logType: LogInfoType, logLevel: ErrorType) {
        console.log(logInfoMapping[logType][logLevel], formatDate(new Date()).formatForLang('YYYY-MM-DD HH:mm:ss'))
    }
}
