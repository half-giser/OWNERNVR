/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-05 14:16:36
 * @Description: 集成wasm-player和多分屏功能
 */

import WasmPlayer, { type WasmPlayerVideoFrame } from './wasmPlayer'
import type WebGLPlayer from './webglPlayer'

export interface TVTPlayerOption {
    type?: 'record' | 'live'
    split?: number
    enablePos?: boolean
    showVideoLoss?: boolean
    screen: {
        getVideoCanvas: (windIndex: number) => HTMLCanvasElement
        toggleVideoLossLogo: (winIndex: number, bool: boolean, tip?: string) => void
        showErrorTips: (type: string, winIndex: number, winData?: TVTPlayerWinDataListItem) => void
        setPosBaseSize: (param: { width: number; height: number }) => void
        toggleAudioIcon: (winIndex: number, bool: boolean) => void
        togglePtzIcon: (winIndex: number, bool: boolean) => void
        zoom: (winIndex: number, scale: number) => void
        setWatermark: (winIndex: number, text: string) => void
        toggleWatermark: (winIndex: number, bool: boolean) => void
        togglePos: (winIndex: number, bool: boolean) => void
        clearPos: (winIndex: number) => void
        toggleAlarmOsdVisible: (winIndex: number, bool: boolean, hideAll?: string) => void
        toggleRecordOsdVisible: (winIndex: number, bool: boolean) => void
        toggleChlIp: (winIndex: number, bool: boolean) => void
        hideErrorTips: (winIndex: number) => void
        setSplit: (split: number, isDblClickSplit: boolean) => void
        snap: (frame: WasmPlayerVideoFrame, player: typeof WebGLPlayer, fileName: string) => void
        getSplit: () => number
        setVideoDivSize: (winIndex: number, width: number, height: number) => void
        resetVideoDivSize: (winIndex: number) => void
        zoomOut: (winIndex: number) => void
        zoom3D: (winIndex: number, status: boolean) => void
        resetZoom3D: (winIndex: number) => void
        toggleOSD: (bool: boolean) => void
        toggleRecordStatus: (winIndex: number, recordTypes: string[], isRecording: boolean) => void
        toggleAlarmStatus: (winIndex: number, alarmType: string, isAlarming: boolean) => void
        zoomIn: (winIndex: number) => void
        getItemSize: (winIndex: number) => { width: number; height: number }
        // setSize: (width: number, height: number) => void
        setPollIndex: (winIndex: number) => void
        getWinIndexByPosition: (positionIndex: number) => number
        fullscreen: () => void
        resize: () => void
        getOverlayCanvas: (winIndex: number) => HTMLCanvasElement
        drawPos: (posFrame: Uint8Array, posLength: number, cfg: TVTPlayerPosInfoItem, winIndex: number, chlId: string) => void
        setIpToScreen: (winIndex: number, chlIp: string) => void
        selectWin: (winIndex: number) => void
    }

    onsuccess: (winIndex: number, item: TVTPlayerWinDataListItem) => void
    onplayStatus: (items: TVTPlayerWinDataListItem[]) => void
    ontime: (winIndex: number, item: TVTPlayerWinDataListItem, showTimestamp: number) => void
    onstop: (winIndex: number, item: TVTPlayerWinDataListItem) => void
    onplayComplete: (winIndex: number, item: TVTPlayerWinDataListItem) => void
    onrecordFile: (recordBuf: ArrayBuffer, item: TVTPlayerWinDataListItem, recordStartTime: number) => void
    // onpos: () => void
    onerror: (winIndex: number, item: TVTPlayerWinDataListItem, reason?: string) => void
    onselect: (winIndex: number, item: TVTPlayerWinDataListItem) => void
    onwinexchange: (oldWinIndex: number, newWinIndex: number) => void
    ondblclickchange: (winIndex: number, positionIndex: number) => void
}

export type TVTPlayerScreen = TVTPlayerOption['screen'] & {
    onselect: (winIndex: number) => void
    onwinexchange: (oldWinIndex: number, newWinIndex: number) => void
    ondblclickchange: (winIndex: number, positionIndex: number) => void
    getZoomCallback: (winIndex: number) => { left: number; bottom: number; viewWidth: number; viewHeight: number }
    setZoomCallback: (winIndex: number, left: number, bottom: number, width: number, height: number) => void
    getVideoRealSize: (winIndex: number) => void
    setMagnify3D: (winIndex: number, zoom3DType: string, callback: () => void, obj: { dx: number; dy: number; zoom: number } | false) => void
    setZoom: (winIndex: number, actionType: 'ZoomIn' | 'ZoomOut' | 'StopAction', speed: number, type: 'control' | 'direction' | 'activeStop' | 'stop') => void
}

export interface TVTPlayerWinDataListItem {
    PLAY_STATUS: 'play' | 'stop' | 'error'
    CHANNEL_INFO: null | {
        chlID: string
        supportPtz: boolean
        chlName: string
        streamType: number
    }
    winIndex: number
    seeking: boolean
    original: boolean // 原始比例(1：1)状态，true开启，false关闭
    audio: boolean // 声音 true开启，false关闭
    magnify3D: boolean // 3D放大 true开启，false关闭
    localRecording: boolean // 是否开启本地录像 true开启，false关闭
    isPolling: boolean // 是否开启通道组轮询播放
    timestamp: number
    showWatermark: boolean
    showPos: boolean
    position: number
}

interface TVTPlayerPlayParams {
    winIndex?: number // 窗口索引, 不传则默认为激活窗口索引
    isSelect?: boolean // 播放之后焦点是否落在窗口索引位置
    showWatermark?: boolean // 是否显示水印
    callback?: (winIndex: number) => void // 播放完成(成功或失败)之后的自定义回调
    audioStatus?: boolean // 播放时设置音频开关状态（默认是继承上次音频状态，预览切换通道时需置为关）
    showPos?: boolean // 是否显示Pos
    isDblClickSplit?: boolean
    isOnline?: boolean // 如果调用方明确传入通道离线状态，则根据此字段显示离线提示，否则显示“正在请求视频流”
    volume?: number
    chlID: string
    isPolling?: boolean // 是否开启通道组轮询播放
    supportPtz?: boolean
    chlName?: string
    streamType: number
    startTime?: number // 时间戳 单位：秒
    endTime?: number // 时间戳 单位：秒
    typeMask?: string[]
    isPlayback?: boolean
    isEndRec?: boolean
}

export interface TVTPlayerPosInfoItem {
    previewDisplay: boolean // 现场预览是否显示pos
    printMode: 'page' | 'scroll' // pos显示模式：page翻页/scroll滚屏
    displayPosition: {
        // pos显示区域
        x: number
        y: number
        width: number
        height: number
    }
    timeout: number // pos超时隐藏时间，默认10秒
}

interface TVTPlayerRecordStatusChlMapItem {
    recordTypes: string[]
    isRecording: boolean
}

export default class TVTPlayer {
    private readonly MAX_SPLIT = 4
    private type: 'record' | 'live' = 'live' // 仅现场预览模式显示视频丢失logo
    private split = 1
    // private showVideoLoss = false
    private activeWinIndex = 0
    private showTimestamp = 0
    private playerList: (WasmPlayer | null)[] = []
    private winDataList: TVTPlayerWinDataListItem[] = []
    private recordStartTime: number[] = []
    private seeking = false
    private speed = 1
    private timeGapMap: Record<number, number> = {}
    private recordStatusChlMap: Record<string, TVTPlayerRecordStatusChlMapItem> = {} // 通道id和录像状态的映射,录像状态包含属性见 setRecordStatus 方法
    private alarmStatusChlMap: Record<string, Record<string, boolean>> = {} // 通道id和报警状态的映射,录像状态包含属性见 setAlarmStatus 方法
    private noRecordFlag = true // 特殊处理问题单 NVRUSS78-252
    private posInfo: Record<string, TVTPlayerPosInfoItem> = {}
    private chlIpMap: Record<string, string> = {} // 通道GUID和通道ip的映射
    private enablePos: boolean
    screen: TVTPlayerScreen
    private readonly onsuccess: TVTPlayerOption['onsuccess']
    private readonly onplayStatus: TVTPlayerOption['onplayStatus']
    private readonly ontime: TVTPlayerOption['ontime']
    private readonly onstop: TVTPlayerOption['onstop']
    private readonly onplayComplete: TVTPlayerOption['onplayComplete']
    private readonly onrecordFile: TVTPlayerOption['onrecordFile']
    // private readonly onpos: TVTPlayerOption['onpos']
    private readonly onerror: TVTPlayerOption['onerror']
    private readonly onselect: TVTPlayerOption['onselect']
    private readonly onwinexchange: TVTPlayerOption['onwinexchange']
    private readonly ondblclickchange: TVTPlayerOption['ondblclickchange']
    private readonly ERROR_CODE_MAP: Record<number, string> = {
        [ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED]: 'playComplete', // 文件流完成(回放结束时出现)
        [ErrorCode.USER_ERROR_NO_RECORDDATA]: 'noRecord', // 无录像数据
        [ErrorCode.USER_ERROR_DEVICE_BUSY]: 'deviceBusy', // 设备忙，不能请求
        [ErrorCode.USER_ERROR_DEV_RESOURCE_LIMITED]: 'deviceBusy', // 设备忙，设备资源限制
        [ErrorCode.USER_ERROR_NODE_NET_DISCONNECT]: 'offline', // 网络断开，通道离线
        [ErrorCode.USER_ERROR_NODE_NET_OFFLINE]: 'offline', // 通道不在线
        [ErrorCode.USER_ERROR_NO_AUTH]: 'noPermission', // 无权限
    }

    constructor(options: TVTPlayerOption) {
        const cababilityStore = useCababilityStore()
        this.type = options.type || 'live'
        this.split = options.split || 1
        // this.showVideoLoss = options.type === 'live'
        this.enablePos = (options.enablePos || false) && cababilityStore.supportPOS
        this.onsuccess = options.onsuccess
        this.onplayStatus = options.onplayStatus
        this.ontime = options.ontime
        this.onstop = options.onstop
        this.onplayComplete = options.onplayComplete
        this.onrecordFile = options.onrecordFile
        // this.onpos = options.onpos
        this.onerror = options.onerror
        this.onselect = options.onselect
        this.onwinexchange = options.onwinexchange
        this.ondblclickchange = options.ondblclickchange
        this.screen = {
            ...options.screen,
            // el: options.el,
            // showVideoLoss: options.showVideoLoss,
            // split: options.split,
            // onselect: options.onselect,
            // onwinexchange: options.onwinexchange,
            onselect: (winIndex: number) => {
                this.activeWinIndex = winIndex
                this.onselect && this.onselect(winIndex, this.winDataList[winIndex])
            },
            onwinexchange: (oldWinIndex: number, newWinIndex: number) => {
                // 分屏互换时，_winDataList和_playerList对应数据也要互换
                // const oldWinData = this.winDataList[oldWinIndex]
                // const newWinData = this.winDataList[newWinIndex]
                // oldWinData.winIndex = newWinIndex
                // newWinData.winIndex = oldWinIndex
                // this.winDataList[oldWinIndex] = newWinData
                // this.winDataList[newWinIndex] = oldWinData
                // const oldPlayer = this.playerList[oldWinIndex]
                // const newPlayer = this.playerList[newWinIndex]
                // oldPlayer && (oldPlayer.cmdParams.winIndex = newWinIndex)
                // newPlayer && (newPlayer.cmdParams.winIndex = oldWinIndex)
                // this.playerList[oldWinIndex] = newPlayer
                // this.playerList[newWinIndex] = oldPlayer
                // this.activeWinIndex = newWinIndex
                this.onselect && this.onselect(newWinIndex, this.winDataList[newWinIndex])
                this.onwinexchange && this.onwinexchange(oldWinIndex, newWinIndex)
            },
            ondblclickchange: (winIndex: number, newSplit: number) => {
                // 保持所有分屏的显示状态
                for (let i = 0; i < this.MAX_SPLIT; i++) {
                    const original = this.winDataList[i].original
                    this.displayOriginal(i, original)
                }
                this.ondblclickchange && this.ondblclickchange(winIndex, newSplit)
            },
            // 放大画面
            getZoomCallback: (winIndex: number) => {
                return (
                    this.playerList[winIndex]?.getWebGL() || {
                        left: 0,
                        bottom: 0,
                        viewWidth: 0,
                        viewHeight: 0,
                    }
                )
            },
            // 缩小画面
            setZoomCallback: (winIndex: number, left: number, bottom: number, width: number, height: number) => {
                this.playerList[winIndex]?.setWebGL(left, bottom, width, height)
            },
            // 获取视频原始宽高
            getVideoRealSize: (winIndex: number) => {
                return this.playerList[winIndex]?.getVideoRealSize()
            },
            // 设置3D功能
            setMagnify3D: (winIndex: number, zoom3DType: string, callback: () => void, obj: { dx: number; dy: number; zoom: number } | false) => {
                if (this.playerList[winIndex]) {
                    const data = {
                        chlId: this.winDataList[winIndex].CHANNEL_INFO!.chlID,
                        dx: obj ? obj.dx : 0,
                        dy: obj ? obj.dy : 0,
                        zoom: zoom3DType ? (zoom3DType === 'zoom3DIn' ? -20 : 20) : obj ? obj.zoom : 1,
                    }
                    this.setMagnify3D(data, callback)
                }
            },
            // 设置缩放功能（3D球机和非球机统一使用ptzMoveCall协议控制缩放）
            setZoom: (winIndex: number, actionType: 'ZoomIn' | 'ZoomOut' | 'StopAction', speed = 1, type: 'control' | 'direction' | 'activeStop' | 'stop') => {
                if (this.playerList[winIndex]) {
                    const opt = {
                        chlId: this.winDataList[winIndex].CHANNEL_INFO!.chlID,
                        actionType, // ZoomIn, ZoomOut, StopAction
                        speed, // 默认 1
                        type, // control, direction, activeStop, stop
                    }
                    this.setZoom(opt)
                }
            },
        }
        this.init()
        if (this.enablePos) {
            this.getPosCfg()
        }
    }

    /**
     * @description 初始化数据
     */
    init() {
        for (let i = 0; i < this.MAX_SPLIT; i++) {
            this.playerList.push(null)
            this.winDataList.push({
                PLAY_STATUS: 'stop',
                CHANNEL_INFO: null,
                winIndex: i,
                seeking: false,
                original: false,
                audio: false,
                magnify3D: false,
                localRecording: false,
                isPolling: false,
                timestamp: 0,
                showWatermark: false,
                showPos: false,
                position: this.screen.getWinIndexByPosition(i),
            })
        }
    }

    /**
     * 播放
     * @param {Object} params 具体字段参考wasm-player的play方法
     *      @property {Number} winIndex 窗口索引, 不传则默认为激活窗口索引
     *      @property {Boolean} isSelect 播放之后焦点是否落在窗口索引位置
     *      @property {Boolean} showWatermark 是否显示水印
     *      @property {Boolean} callback 播放完成(成功或失败)之后的自定义回调
     *      @property {Boolean} audioStatus 播放时设置音频开关状态（默认是继承上次音频状态，预览切换通道时需置为关）
     *      @property {Boolean} showPos 是否显示Pos
     */
    play(params: TVTPlayerPlayParams) {
        this.noRecordFlag = true
        // https访问时，拦截并根据业务类型弹出提示
        if (isHttpsLogin()) {
            this.handleHttpsPlay()
            return
        }
        const winIndex = this.screen.getWinIndexByPosition(params.winIndex || params.winIndex === 0 ? params.winIndex : this.activeWinIndex)
        const isDblClickSplit = params.isDblClickSplit || false
        this.stop(winIndex)
        const videoCav = this.screen.getVideoCanvas(winIndex)
        const curSplit = this.getSplit()
        if (!isDblClickSplit && curSplit < winIndex + 1) {
            this.setSplit(this.MAX_SPLIT)
        }
        // 先隐藏视频丢失logo
        this.screen.toggleVideoLossLogo(winIndex, false)
        const isOnline = typeof params.isOnline === 'undefined' ? true : params.isOnline
        if (!isOnline) {
            this.screen.showErrorTips('offline', winIndex, this.winDataList[winIndex])
        } else {
            this.screen.showErrorTips('streamOpening', winIndex, this.winDataList[winIndex])
        }
        this.playerList[winIndex] = new WasmPlayer({
            canvas: videoCav,
            type: this.type,
            volume: params.volume || 50,
            onopen: () => {},
            onsuccess: () => {
                const winIndex = this.getWinIndexByCav(videoCav)
                if (params.audioStatus) this.winDataList[winIndex].audio = Boolean(params.audioStatus)
                this.handlePlaySuccess(winIndex)
            },
            onstop: () => {
                const winIndex = this.getWinIndexByCav(videoCav)
                this.winDataList[winIndex].PLAY_STATUS = 'stop'
                this.winDataList[winIndex].seeking = false
                // this.winDataList[winIndex].audio = false  // NVR145-178 音频不重置
                this.winDataList[winIndex].magnify3D = false
                this.winDataList[winIndex].timestamp = 0
                this.screen.toggleAudioIcon(winIndex, false)
                this.screen.togglePtzIcon(winIndex, false)
                this.screen.zoom(winIndex, 1)
                // 关闭并清除水印
                this.screen.setWatermark(winIndex, '')
                this.screen.toggleWatermark(winIndex, false)
                // 清除pos
                this.screen.togglePos(winIndex, false)
                this.screen.clearPos(winIndex)
                // 关闭报警事件图标
                this.screen.toggleAlarmOsdVisible(winIndex, false, 'hideAll')
                // 关闭录像状态图标
                this.screen.toggleRecordOsdVisible(winIndex, false)
                // 显示视频丢失logo
                this.screen.toggleVideoLossLogo(winIndex, true)
                // 关闭通道ip信息
                this.screen.toggleChlIp(winIndex, false)
                // 窗口停止播放时如果打开了原始比例按钮需要重置，否则切换通道时显示的还是上次设置的原始比例
                this.winDataList[winIndex].original && this.displayOriginal(winIndex, false)
                this.onstop && this.onstop(winIndex, this.winDataList[winIndex])
                this.onplayStatus && this.onplayStatus(this.getPlayingChlList())
            },
            onfinished: () => {
                const winIndex = this.getWinIndexByCav(videoCav)
                if (params.callback) params.callback(winIndex)
            },
            onerror: (errorCode?: number, url?: string) => {
                const winIndex = this.getWinIndexByCav(videoCav)
                this.handlePlayError(winIndex, errorCode, url)
                this.winDataList[winIndex].PLAY_STATUS = 'error'
                this.onerror && this.onerror(winIndex, this.winDataList[winIndex])
                this.onplayStatus && this.onplayStatus(this.getPlayingChlList())
            },
            ontime: (timestamp: number) => {
                this.noRecordFlag = false
                const winIndex = this.getWinIndexByCav(videoCav)
                this.handleOntime(winIndex, timestamp)
                if (this.winDataList[winIndex].PLAY_STATUS === 'error') {
                    this.screen.hideErrorTips(winIndex)
                    this.screen.toggleVideoLossLogo(winIndex, false)
                    this.winDataList[winIndex].PLAY_STATUS = 'play'
                    this.onplayStatus && this.onplayStatus(this.getPlayingChlList())
                }
            },
            onwatermark: (watermark: string) => {
                const winIndex = this.getWinIndexByCav(videoCav)
                this.screen.setWatermark(winIndex, watermark)
            },
            onrecordFile: (recordBuf: ArrayBuffer) => {
                const winIndex = this.getWinIndexByCav(videoCav)
                this.onrecordFile && this.onrecordFile(recordBuf, this.winDataList[winIndex], this.recordStartTime[winIndex])
            },
            onpos: (posFrame: Uint8Array, posLength) => {
                if (!this.enablePos) return
                const winIndex = this.getWinIndexByCav(videoCav)
                this.handlePos(posFrame, posLength, params.chlID, winIndex)
            },
        })
        this.playerList[winIndex]?.play(params)
        this.screen.resetZoom3D(winIndex)
        this.winDataList[winIndex].CHANNEL_INFO = {
            chlID: params.chlID,
            supportPtz: params.supportPtz || false,
            chlName: params.chlName || '',
            streamType: params.streamType || 2,
        }
        this.winDataList[winIndex].original = false
        this.winDataList[winIndex].localRecording = false
        this.winDataList[winIndex].audio = false
        this.winDataList[winIndex].magnify3D = false
        this.winDataList[winIndex].timestamp = 0
        this.winDataList[winIndex].showWatermark = params.showWatermark || false
        this.winDataList[winIndex].showPos = params.showPos || false
        this.winDataList[winIndex].isPolling = params.isPolling || false
        if (params.isSelect !== false) {
            this.screen.selectWin(winIndex)
            this.activeWinIndex = winIndex
        }
    }

    /**
     * @description 获取视频canvas对象所在窗口号
     * @param {HTMLCanvasElement} canvas
     * @returns {number}
     **/
    getWinIndexByCav(canvas: HTMLCanvasElement) {
        if (!this.playerList) return -1
        const findIndex = this.playerList.findIndex((item) => item?.isSameCanvas(canvas))
        return findIndex
    }

    /**
     * @description 停止某个窗口播放
     * @param {number} winIndex
     */
    stop(winIndex: number) {
        if (!this.playerList[winIndex]) {
            return
        }
        this.playerList[winIndex].stop()
        this.playerList[winIndex].destroy()
        this.screen.hideErrorTips(winIndex)
        this.playerList[winIndex] = null
    }

    /**
     * @description 全部窗口停止播放
     */
    stopAll() {
        for (let i = 0; i < this.playerList.length; i++) {
            this.stop(i)
        }
    }

    /**
     * @description 暂停某个窗口播放
     * @param {number} winIndex
     */
    pause(winIndex: number) {
        this.playerList[winIndex]?.pause()
    }

    /**
     * @description 全部窗口暂停播放
     */
    pauseAll() {
        for (let i = 0; i < this.playerList.length; i++) {
            this.pause(i)
        }
    }

    /**
     * @description 继续某个窗口播放
     * @param {number} winIndex
     */
    resume(winIndex: number) {
        this.playerList[winIndex]?.resume()
    }

    /**
     * @description 全部窗口继续播放
     */
    resumeAll() {
        for (let i = 0; i < this.playerList.length; i++) {
            this.resume(i)
        }
    }

    /**
     * @description 设置分屏
     * @param {number} split
     * @param {boolean} isDblClickSplit
     */
    setSplit(split: number, isDblClickSplit: boolean = false) {
        // this.stopAll()
        this.screen.setSplit(split, isDblClickSplit)
        this.split = split
    }

    /**
     * @description 获取分屏数
     * @returns {number}
     */
    getSplit() {
        return this.screen.getSplit()
    }

    /**
     * @description seek回放时间点
     * @param {number} frameTime
     */
    seek(frameTime: number) {
        this.seeking = true
        for (let i = 0; i < this.playerList.length; i++) {
            this.playerList[i]?.seek(frameTime)
            this.winDataList[i].seeking = this.winDataList[i].PLAY_STATUS === 'play'
        }
    }

    /**
     * @description 播放成功的处理
     * @param {number} winIndex
     */
    handlePlaySuccess(winIndex: number) {
        if (this.type === 'record') {
            this.winDataList[winIndex].seeking = false
            this.showTimestamp = 0
            let seekingFlag = false
            for (let i = 0; i < this.split; i++) {
                this.playerList[i]?.resetBasicTime()
                if (this.winDataList[i].seeking && this.playerList[i]) {
                    seekingFlag = true
                }
            }
            this.seeking = seekingFlag
        } else if (this.type === 'live') {
            const supportPtz = this.winDataList[winIndex].CHANNEL_INFO!.supportPtz
            this.screen.togglePtzIcon(winIndex, supportPtz)
            const chlId = this.winDataList[winIndex].CHANNEL_INFO!.chlID
            if (this.recordStatusChlMap[chlId]) {
                const recordTypes = this.recordStatusChlMap[chlId].recordTypes
                const isRecording = this.recordStatusChlMap[chlId].isRecording
                this.setRecordStatus(chlId, recordTypes, isRecording)
            }

            if (this.alarmStatusChlMap[chlId]) {
                Object.keys(this.alarmStatusChlMap[chlId]).forEach((alarmType) => {
                    const isAlarming = this.alarmStatusChlMap[chlId][alarmType]
                    this.setAlarmStatus(chlId, alarmType, isAlarming)
                })
            }

            // 设置通道ip信息 (目前仅在UI1-E实现)
            this.setChlIp(winIndex, chlId)
            // 打开录像状态图标
            this.screen.toggleRecordOsdVisible(winIndex, true)
            // 打开报警事件图标
            this.screen.toggleAlarmOsdVisible(winIndex, true)
            // 打开通道ip信息
            this.screen.toggleChlIp(winIndex, true)
        }
        this.winDataList[winIndex].audio ? this.openAudio(winIndex) : this.closeAudio(winIndex)
        this.screen.toggleWatermark(winIndex, this.winDataList[winIndex].showWatermark)
        this.screen.togglePos(winIndex, this.winDataList[winIndex].showPos)
        this.screen.hideErrorTips(winIndex)
        this.winDataList[winIndex].PLAY_STATUS = 'play'
        typeof this.onsuccess === 'function' && this.onsuccess(winIndex, this.winDataList[winIndex])
        typeof this.onplayStatus === 'function' && this.onplayStatus(this.getPlayingChlList())
    }

    /**
     * @description 处理播放失败
     * @param {number} winIndex
     * @param {number} errorCode
     * @param {string} url
     */
    handlePlayError(winIndex: number, errorCode: number = 0, url: string = '') {
        if (url === '/device/preview/audio/open#response' || url === '/device/playback/audio/open#response') {
            // 处理打开音频回复的错误码
            switch (errorCode) {
                case ErrorCode.USER_ERROR_UNSUPPORTED_CMD: // 不支持打开音频
                    this.closeAudio(winIndex)
                    this.onerror && this.onerror(winIndex, this.winDataList[winIndex], 'notSupportAudio')
                    this.onerror && this.onerror(winIndex, this.winDataList[winIndex], 'audioClosed')
                    break
                case ErrorCode.USER_ERROR_NO_AUTH: // 无权限
                    this.closeAudio(winIndex)
                    this.onerror && this.onerror(winIndex, this.winDataList[winIndex], 'noPermission')
                    this.onerror && this.onerror(winIndex, this.winDataList[winIndex], 'audioClosed')
                    break
            }
        } else if (url === '/device/preview/audio/close#response' || url === '/device/playback/audio/close#response') {
            // 处理关闭音频回复的错误码
            switch (errorCode) {
                // 音频流已关闭
                case ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED:
                    this.onerror && this.onerror(winIndex, this.winDataList[winIndex], 'audioClosed')
                    break
                default:
                    break
            }
        } else {
            // 处理视频流相关错误码
            switch (errorCode) {
                // 文件流完成(回放结束时出现)
                case ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED:
                    this.onplayComplete && this.onplayComplete(winIndex, this.winDataList[winIndex])
                    break
                case ErrorCode.USER_ERROR_DEVICE_BUSY:
                case ErrorCode.USER_ERROR_DEV_RESOURCE_LIMITED:
                    // 回放返回设备忙时，直接关闭回放链路
                    if (url === '/device/playback/open#response' && this.playerList[winIndex]) {
                        this.playerList[winIndex]!.stop()
                        this.playerList[winIndex]!.destroy()
                        this.playerList[winIndex] = null // NCNHZ07-49
                    }
                    break
                default:
                    break
            }

            if (this.noRecordFlag && errorCode === ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED) {
                this.screen.showErrorTips('noRecord', winIndex, this.winDataList[winIndex])
            } else {
                this.screen.showErrorTips(this.ERROR_CODE_MAP[errorCode], winIndex, this.winDataList[winIndex])
            }
        }
    }

    /**
     * @description 处理播放进度回调
     * @param {number} winIndex
     * @param {number} timestamp
     */
    handleOntime(winIndex: number, timestamp: number) {
        this.winDataList[winIndex].timestamp = timestamp
        if (this.type === 'record') {
            if (this.seeking) return
            const timeArr = []
            for (let i = 0; i < this.split; i++) {
                const statusI = this.winDataList[i].PLAY_STATUS
                const timestampI = this.winDataList[i].timestamp
                if (statusI === 'play' && timestampI >= this.showTimestamp) {
                    const timeGap = timestampI - this.showTimestamp
                    if (this.showTimestamp !== 0 && timeGap >= 2000 * this.speed) {
                        if (this.playerList[i]?.getPlayState() === 'PLAYING') {
                            this.playerList[i]!.pause()
                            this.timeGapMap[i] = timeGap
                        }
                    } else if (timestampI >= this.showTimestamp) {
                        timeArr.push(timestampI)
                        if (this.playerList[i]?.getPlayState() === 'PAUSE') {
                            this.playerList[i]!.resume()
                        }
                    }
                }
            }

            if (timeArr.length > 0) {
                this.showTimestamp = Math.min.apply(null, timeArr)
            } else {
                this.showTimestamp = timestamp
                const timeGapArr = Object.values(this.timeGapMap)
                const minTimeGap = timeGapArr.length > 0 ? Math.min.apply(null, timeGapArr) : 0
                for (let i = 0; i < this.split; i++) {
                    this.playerList[i]?.setTimeGap(minTimeGap)
                    if (this.playerList[i]?.getPlayState() === 'PAUSE') {
                        this.playerList[i]!.resume()
                    }
                }
                this.timeGapMap = {}
            }
        } else {
            this.showTimestamp = timestamp
        }
        this.ontime && this.ontime(winIndex, this.winDataList[winIndex], this.showTimestamp)
    }

    /**
     * @description 倍速播放
     * @param {number} speed
     */
    setSpeed(speed: number) {
        this.speed = speed
        for (let i = 0; i < this.playerList.length; i++) {
            this.playerList[i]?.setSpeed(speed)
        }
    }

    /**
     * @description 手动下一帧播放
     */
    nextFrame() {
        for (let i = 0; i < this.playerList.length; i++) {
            this.playerList[i]?.nextFrame()
        }
    }

    /**
     * @description 启用关键帧回放
     * @param {Number} timestamp 毫秒时间戳
     */
    keyFramePlay(timestamp: number) {
        for (let i = 0; i < this.playerList.length; i++) {
            this.playerList[i]?.keyFramePlay(timestamp)
        }
    }

    /**
     * @description 恢复全帧回放
     * @param {Number} timestamp 毫秒时间戳
     */
    allFramePlay(timestamp: number) {
        for (let i = 0; i < this.playerList.length; i++) {
            this.playerList[i]?.allFramePlay(timestamp)
        }
    }

    /**
     * @description 原始比例播放
     * @param {Number} winIndex 窗口号
     * @param {Boolean} bool 是否原始比例
     */
    displayOriginal(winIndex: number, bool: boolean) {
        if (!this.playerList[winIndex]) return
        if (bool) {
            this.playerList[winIndex]!.displayOriginal()
            const size = this.playerList[winIndex]!.getSize()
            this.screen.setVideoDivSize(winIndex, size.width, size.height)
        } else {
            const size = this.screen.getItemSize(winIndex)
            this.playerList[winIndex]!.setSize(size.width, size.height)
            this.screen.resetVideoDivSize(winIndex)
        }
        this.winDataList[winIndex].original = bool
    }

    /**
     * @description 放大
     * @param {number} winIndex
     */
    zoomOut(winIndex: number) {
        this.screen.zoomOut(winIndex)
    }

    /**
     * @description 缩小
     * @param {number} winIndex
     */
    zoomIn(winIndex: number) {
        this.screen.zoomIn(winIndex)
    }

    /**
     * @description 手动设置通道组轮询状态
     * @param {boolean} bool
     * @param {number} winIndex
     */
    setPollingState(bool: boolean, winIndex?: number) {
        if (winIndex !== undefined) {
            this.winDataList[winIndex].isPolling = bool
            return
        }

        for (let i = 0; i < this.MAX_SPLIT; i++) {
            this.winDataList[i].isPolling = bool
        }
    }

    /**
     * @description 3D功能
     * @param {boolean} status
     * @param {number} winIndex
     */
    zoom3D(winIndex: number, status: boolean) {
        this.screen.zoom3D(winIndex, status)
        this.winDataList[winIndex].magnify3D = status
    }

    /**
     * @description 显示/隐藏OSD
     * @param {boolean} bool
     */
    toggleOSD(bool: boolean) {
        this.screen.toggleOSD(bool)
    }

    /**
     * @description 显示/隐藏水印
     * @param {boolean} bool
     */
    toggleWatermark(bool: boolean) {
        for (let i = 0; i < this.MAX_SPLIT; i++) {
            this.winDataList[i].showWatermark = bool
            this.screen.toggleWatermark(i, bool)
        }
    }

    /**
     * @description 显示/隐藏pos
     * @param {boolean} bool
     */
    togglePos(bool: boolean) {
        for (let i = 0; i < this.MAX_SPLIT; i++) {
            this.winDataList[i].showPos = bool
            this.screen.togglePos(i, bool)
        }
    }

    /**
     * @description 设置录像状态
     * @param {String} chlId 通道id
     * @param {Array} recordTypes 录像类型 ['motion', 'manual', ...]
     * @param {Boolean} isRecording 是否正在录像
     */
    setRecordStatus(chlId: string, recordTypes: string[], isRecording: boolean) {
        const winIndexes = this.getWinIndexesByChlId(chlId)
        this.recordStatusChlMap[chlId] = {
            recordTypes: recordTypes,
            isRecording: isRecording,
        }
        for (let i = 0; i < winIndexes.length; i++) {
            this.screen.toggleRecordStatus(winIndexes[i], recordTypes, isRecording)
        }
    }

    /**
     * @description 设置报警状态
     * @param {String} chlId 通道id
     * @param {String} alarmType 报警类型(只处理移动侦测和智能事件，详情见 screen.js中的 INTELIGENCE_CHLIDREN 和 MOTION_CHLIDREN )
     * @param {Boolean} isAlarming 是否正在报警
     */
    setAlarmStatus(chlId: string, alarmType: string, isAlarming: boolean) {
        const winIndexes = this.getWinIndexesByChlId(chlId)
        this.alarmStatusChlMap[chlId] = {}
        if (!this.alarmStatusChlMap[chlId]) {
            this.alarmStatusChlMap[chlId] = {}
        }
        this.alarmStatusChlMap[chlId][alarmType] = isAlarming
        for (let i = 0; i < winIndexes.length; i++) {
            this.screen.toggleAlarmStatus(winIndexes[i], alarmType, isAlarming)
        }
    }

    /**
     * @description 全屏
     */
    fullscreen() {
        this.screen.fullscreen()
    }

    /**
     * @description 设置音量，取值0-100
     * @param {number} winIndex
     * @param {number} volume
     */
    setVolume(winIndex: number, volume: number) {
        this.playerList[winIndex]?.setVolume(volume)
    }

    /**
     * @description 打开声音, 此操作为互斥行为，即只能同时打开1个通道的声音
     * @param {number} winIndex
     */
    openAudio(winIndex: number) {
        // 先关闭所有通道的声音
        for (let i = 0; i < this.playerList.length; i++) {
            this.closeAudio(i)
        }
        this.playerList[winIndex]?.openAudio()
        this.winDataList[winIndex].audio = true
        this.screen.toggleAudioIcon(winIndex, true)
    }

    /**
     * @description 关闭声音
     * @param {number} winIndex
     */
    closeAudio(winIndex: number) {
        this.playerList[winIndex]?.closeAudio()
        this.winDataList[winIndex].audio = false
        this.screen.toggleAudioIcon(winIndex, false)
    }

    /**
     * @description 获取正在播放的窗口集合
     * @returns {Array}
     */
    getPlayingWinIndexList() {
        const list = []
        for (let i = 0; i < this.winDataList.length; i++) {
            if (this.winDataList[i] && this.winDataList[i].PLAY_STATUS === 'play') {
                list.push(i)
            }
        }
        return list
    }

    /**
     * @description 根据通道id获取窗口号(返回值为窗口号数组，因为可能存在多个窗口打开同一通道)
     * @param {String} chlId
     */
    getWinIndexesByChlId(chlId: string) {
        const winIndexes = []
        for (let i = 0; i < this.winDataList.length; i++) {
            const item = this.winDataList[i]
            if (item?.CHANNEL_INFO?.chlID === chlId) {
                winIndexes.push(i)
            }
        }
        return winIndexes
    }

    /**
     * @description 获取处于播放状态的通道集合
     * @returns {Array}
     */
    getPlayingChlList() {
        const list = []
        for (let i = 0; i < this.winDataList.length; i++) {
            if (this.winDataList[i] && this.winDataList[i].PLAY_STATUS === 'play') {
                list.push(this.winDataList[i])
            }
        }
        return list
    }

    getChlList() {
        return [...this.winDataList]
    }

    /**
     * @description 获取空闲窗口集合
     * @returns {Array}
     */
    getFreeWinIndexes() {
        const list = []
        for (let i = 0; i < this.winDataList.length; i++) {
            if (!(this.winDataList[i] && this.winDataList[i].PLAY_STATUS === 'play')) {
                list.push(i)
            }
        }
        return list
    }

    /**
     * @description 获取当前选中窗口
     * @returns {number}
     */
    getSelectedWinIndex() {
        return this.activeWinIndex
    }

    /**
     * @description 获取窗口数据
     * @param {number} winIndex
     * @returns {TVTPlayerWinDataListItem}
     */
    getWinDataByWinIndex(winIndex: number) {
        return this.winDataList[winIndex]
    }

    /**
     * @description 获取所有窗口数据
     * @returns {TVTPlayerWinDataListItem[]}
     */
    getWinData() {
        return this.winDataList
    }

    /**
     * @description 抓图
     * @param {number} winIndex
     * @param {string} fileName
     * @returns
     */
    snap(winIndex: number, fileName: string) {
        const config = this.playerList[winIndex]!.getCurrFrame()
        return this.screen.snap(config.frame, config.WebGLPlayer, fileName)
    }

    /**
     * @description 更新尺寸
     */
    resize() {
        this.screen.resize()
        // 遍历查看当前窗口是否处于原始比例状态，如果是则置为原始比例
        for (let i = 0; i < this.playerList.length; i++) {
            if (this.winDataList[i].original && this.playerList[i]) {
                this.displayOriginal(i, true)
            }
        }
    }

    /**
     * @description 获取对应窗口的覆盖层canvas, 返回canvas的jquery对象
     * @param {number} winIndex
     * @returns
     */
    getDrawbordCanvas(winIndex: number) {
        return this.screen.getOverlayCanvas(winIndex)
    }

    /**
     * @description 开始本地录像
     * @param {number} winIndex
     */
    startRecord(winIndex: number) {
        if (this.playerList[winIndex]) {
            this.recordStartTime[winIndex] = new Date().getTime() // 记录开始录像时间
            this.playerList[winIndex]!.startRecord()
            this.winDataList[winIndex].localRecording = true
        }
    }

    /**
     * @description 停止本地录像
     * @param {number} winIndex
     */
    stopRecord(winIndex: number) {
        if (this.playerList[winIndex]) {
            this.playerList[winIndex]!.stopRecord(true)
            this.winDataList[winIndex].localRecording = false
        }
    }

    /**
     * @description 开始全部本地录像
     */
    startAllRecord() {
        for (let i = 0; i < this.playerList.length; i++) {
            this.startRecord(i)
        }
    }

    /**
     * @description 停止全部本地录像
     */
    stopAllRecord() {
        for (let i = 0; i < this.playerList.length; i++) {
            this.stopRecord(i)
        }
    }

    /**
     * @description 获取pos配置
     */
    getPosCfg() {
        queryPosList().then((res) => {
            const $ = queryXml(res)
            if ($('status').text() !== 'success') return
            const $systemX = $('content/itemType/coordinateSystem/X')
            const $systemY = $('content/itemType/coordinateSystem/Y')
            const width = $systemX.attr('max').num() - $systemX.attr('min').num()
            const height = $systemY.attr('max').num() - $systemY.attr('min').num()
            this.screen.setPosBaseSize({ width, height })
            const posInfo: Record<string, TVTPlayerPosInfoItem> = {}
            $('channel/chl').forEach((ele) => {
                const chlId = ele.attr('id') as string
                const $ele = queryXml(ele.element)
                const previewDisplay = $ele('previewDisplay').text().bool()
                const printMode = $ele('printMode').text()
                posInfo[chlId] = {
                    previewDisplay: previewDisplay, // 现场预览是否显示pos
                    printMode: printMode as 'page' | 'scroll', // pos显示模式：page翻页/scroll滚屏
                    displayPosition: {
                        // pos显示区域
                        x: 0,
                        y: 0,
                        width: width,
                        height: height,
                    },
                    timeout: 10, // pos超时隐藏时间，默认10秒
                }
            })
            $('content/item').forEach((ele) => {
                const $ele = queryXml(ele.element)
                const $position = 'param/displaySetting/displayPosition/'
                const $triggerChls = $ele('trigger/triggerChl/chls/item')
                const timeout = $ele('param/displaySetting/common/timeOut').text()
                if (!$triggerChls.length) return
                const displayPosition = {
                    x: $ele(`${$position}X`).text().num(),
                    y: $ele(`${$position}Y`).text().num(),
                    width: $ele(`${$position}width`).text().num(),
                    height: $ele(`${$position}height`).text().num(),
                }
                $triggerChls.forEach((item) => {
                    const chlId = item.attr('id')
                    if (posInfo[chlId]) {
                        posInfo[chlId].displayPosition = displayPosition
                        posInfo[chlId].timeout = Number(timeout)
                    }
                })
            })
        })
    }

    /**
     * @description 处理pos信息
     * @param {Uint8Array} posFrame
     * @param {number} posLength
     * @param {string} chlId
     * @param {number} winIndex
     */
    handlePos(posFrame: Uint8Array, posLength: number, chlId: string, winIndex: number) {
        if (!this.posInfo) {
            return
        }
        const cfg = this.posInfo[chlId]
        if (this.type === 'live') {
            if (!cfg.previewDisplay) {
                return
            } else {
                // 现场预览默认打开pos
                this.screen.togglePos(winIndex, true)
            }
        }
        this.screen.drawPos(posFrame, posLength, cfg, winIndex, chlId)
    }

    /**
     * @description 处理https访问时的视频播放
     */
    handleHttpsPlay() {
        const { Translate } = useLangStore()
        const { openNotify } = useNotification()
        if (this.type === 'live') {
            openNotify(formatHttpsTips(Translate('IDCS_LIVE_PREVIEW')))
        } else if (this.type === 'record') {
            openNotify(formatHttpsTips(Translate('IDCS_REPLAY')))
        }
    }

    /**
     * @description UI1-E 获取通道IP
     */
    getChlIp() {
        queryDevOsdDisplayCfg().then((res) => {
            const $ = queryXml(res)
            if ($('status').text() !== 'success') return
            if ($('content/addressSwitch').text().bool()) {
                // 若为true则可以显示ip地址
                const sendXml = rawXml`
                    <requireField>
                        <ip/>
                    </requireField>
                `
                queryDevList(sendXml).then((res) => {
                    const $ = queryXml(res)
                    if ($('status').text() !== 'success') return
                    this.chlIpMap = {}
                    $('content/item').forEach((item) => {
                        const $el = queryXml(item.element)
                        const ip = $el('ip').text()
                        const id = item.attr('id')
                        this.chlIpMap[id] = ip
                    })
                    this.winDataList.forEach((item) => {
                        if (item.CHANNEL_INFO) {
                            for (const key in this.chlIpMap) {
                                if (item.CHANNEL_INFO.chlID === key) {
                                    this.setChlIp(item.winIndex, key)
                                    break
                                }
                            }
                        }
                    })
                })
            }
        })
    }

    /**
     * @description UI1-E 设置通道IP
     * @param winIndex
     * @param chlId
     */
    setChlIp(winIndex: number, chlId: string) {
        if (import.meta.env.VITE_UI_TYPE === 'UI1-E') {
            this.screen.setIpToScreen(winIndex, this.chlIpMap[chlId])
        }
    }

    /**
     * @description 设置3D功能
     * @param obj
     * @param callback
     */
    setMagnify3D(obj: { chlId: string; dx: number; dy: number; zoom: number }, callback: () => void) {
        const data = rawXml`
            <content>
                <chlId>${obj.chlId}</chlId>
                <dx>${String(obj.dx)}</dx>
                <dy>${String(obj.dy)}</dy>
                <zoom>${String(obj.zoom)}</zoom>
            </content>
        `
        ptz3DControl(data)
            .then(() => {
                callback && callback()
            })
            .catch(() => {
                callback && callback()
            })
    }

    /**
     * @description 设置缩放功能
     * @param {Object} opt
     */
    setZoom(opt: { chlId: string; speed: number; type: 'control' | 'direction' | 'activeStop' | 'stop'; actionType: 'ZoomIn' | 'ZoomOut' | 'StopAction' }) {
        const data = rawXml`
            <content>
                <chlId>${opt.chlId}</chlId>
                <actionType>${opt.actionType}</actionType>
                <speed>${String(opt.speed)}</speed>
                <type>${opt.type}</type>
            </content>
        `
        ptzMoveCall(data)
    }

    exchangWin(newWinIndex: number, newWinPosition: number, oldWinIndex: number, oldWinPosition: number) {
        this.winDataList[newWinIndex].position = newWinPosition
        this.winDataList[oldWinIndex].position = oldWinPosition
    }

    /**
     * @description 销毁播放器
     */
    destroy() {
        for (let i = 0; i < this.playerList.length; i++) {
            this.stop(i)
        }
        this.posInfo = {}
    }

    /**
     * 选中某个窗口
     */
    // selectWin(winIndex: number) {
    //     this.screen.selectWin(winIndex)
    // }
}
