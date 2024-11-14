/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 10:35:00
 * @Description: 基于webAssembly + canvas的视频播放器
 */
import WebGLPlayer from './webglPlayer'
import PCMPlayer, { type PCMPlayerOptionEncoding } from './pcmPlayer'
import {
    getWebsocketOpenUrl,
    CMD_PREVIEW,
    type CmdPreviewOption,
    REC_EVENT_TYPES,
    CMD_PLAYBACK_OPEN,
    type CmdPlaybackOpenOption,
    CMD_PLAYBACK_KEY_FRAME,
    CMD_PLAYBACK_ALL_FRAME,
    CMD_PREVIEW_AUDIO_OPEN,
    CMD_PLAYBACK_AUDIO_OPEN,
    CMD_PREVIEW_AUDIO_CLOSE,
    CMD_PLAYBACK_AUDIO_CLOSE,
    CMD_PLAYBACK_REFRESH_FRAME_INDEX,
    CMD_STOP_PREVIEW,
    CMD_PLAYBACK_CLOSE,
} from '../websocket/websocketCmd'
import { appendBuffer, Uint8ArrayToStr } from '../tools'
import { ErrorCode } from '../constants'

export interface WasmPlayerVideoFrame {
    buffer: Iterable<number>
    width: number
    height: number
    realTimestamp: number
    frameIndex: number
    yuvLen: number
    watermarkLen: number
    frameType: number
    notDecodeNumber: number
}

interface WasmPlayerAudioFrame {
    buffer: Iterable<number>
    sampleFmt: keyof typeof AudioEncodingMap
    channels: number
    sampleRate: number
}

const AudioEncodingMap: Record<number, PCMPlayerOptionEncoding> = {
    8: '8bitInt',
    16: '16bitInt',
    32: '32bitInt',
}
const DECODE_TYPES = {
    live: 1,
    record: 0,
}
// 定义播放状态常量
const PLAY_STATE_PAUSE = 'PAUSE' // 已暂停
const PLAY_STATE_PLAYING = 'PLAYING' // 正常播放中
const PLAY_STATE_STOP = 'STOP' // 已停止
const PLAY_STATE_NEXT_FRAME = 'NEXT_FRAME' // 手动下一帧

/**
 * @param {Object} options
 * @param {Object} canvas: 视频画布，传入canvas对象
 * @param {String} type: 播放类型 live/record(现场/录像)
 * @param {Function} onopen: 打开流事件
 * @param {Function} onsuccess: 播放成功事件
 * @param {Function} onstop: 播放停止事件
 * @param {Function} onerror: 播放错误事件
 * @param {Function} onfinished: 播放完成事件
 * @param {Function} ontime: 播放时间通知事件（播放录像时）
 * @param {Function} onwatermark: 水印通知
 * @param {Function} onrecordFile: 录像文件通知
 * @param {Function} onpos: pos信息通知
 */
interface WasmPlayerOption {
    type: 'live' | 'record'
    canvas: HTMLCanvasElement
    onopen: () => void
    onsuccess: () => void
    onstop: () => void
    onerror: (code?: number, url?: string) => void
    onfinished: () => void
    ontime: (timestamp: number) => void
    onwatermark: (watermark: string) => void
    onrecordFile: (buf: ArrayBuffer) => void
    onpos: (pos: Uint8Array, len: number) => void
    volume: number
}

export default class WasmPlayer {
    private type: WasmPlayerOption['type']
    private taskID = '' // 与设备交互的guid
    private canvas: HTMLCanvasElement
    private volume = 0
    private wasmReady = false // wasm文件是否加载成功
    private videoQueue: WasmPlayerVideoFrame[] = [] // 缓存视频帧队列
    private maxVideoQueueLength = 8 // 缓存视频帧队列最大长度
    private audioQueue: Uint8Array[] = [] // 缓存音频帧队列
    // private maxAudioQueueLength = 8 // 缓存音频帧队列最大长度
    private videoWidth = 0
    private videoHeight = 0
    private webglPlayer?: WebGLPlayer
    private pcmPlayer?: PCMPlayer
    // private audioTimeOffset = 0
    private isDecoding = false // 是否正在解码
    private isFirstDecod = false // 是否首次解码
    private basicRealTime = 0 // 播放基准真实时间
    private basicFrameTime = 0 // 播放基准帧时间
    private displayLoopID = 0 // 帧动画播放ID句柄
    private playState = '' // 播放状态
    private playSpeed = 1 // 播放速度倍数
    private isKeyFramePlay = false // 是否关键帧播放
    private frameTimestamp = 0 // 当前帧时间
    private seeking = false
    cmdParams: any
    private frameIndex = 0
    private lastRenderTime = 0
    // private pageVisibleChangeHandle = null // 网页可见性变化处理函数
    private webPageVisible = true // 当前网页是否可见
    private isEndPlay = false // 设备已传输完数据，准备停止播放（先播放完缓存的帧数据）
    private notDecodeNumber = 0 // 未解码（缓存）的帧数据数量
    private frameData: WasmPlayerVideoFrame | null = null // 当前帧数据
    private decodeWorker?: Worker
    private downloadWorker?: Worker
    private recordBuf: ArrayBuffer | null = null
    private readonly onopen: WasmPlayerOption['onopen']
    private readonly onsuccess: WasmPlayerOption['onsuccess']
    private readonly onstop: WasmPlayerOption['onstop']
    private readonly onerror: WasmPlayerOption['onerror']
    private readonly onfinished: WasmPlayerOption['onfinished']
    private readonly ontime: WasmPlayerOption['ontime']
    private readonly onwatermark: WasmPlayerOption['onwatermark']
    private readonly onrecordFile: WasmPlayerOption['onrecordFile']
    private readonly onpos: WasmPlayerOption['onpos']
    private pageVisibleChangeHandle = () => {}

    constructor(options: WasmPlayerOption) {
        this.type = options.type || 'live'
        this.taskID = '' // 与设备交互的guid
        this.canvas = options.canvas
        this.onopen = options.onopen
        this.onsuccess = options.onsuccess
        this.onstop = options.onstop
        this.onerror = options.onerror
        this.onfinished = options.onfinished
        this.ontime = options.ontime
        this.onwatermark = options.onwatermark
        this.onrecordFile = options.onrecordFile
        this.onpos = options.onpos
        this.volume = options.volume // 当前音量
        this.init()
    }

    /**
     * @description 播放
     * @param {Object} cmdParams
     * @param {Function} callback
     */
    play(cmdParams: Partial<CmdPlaybackOpenOption> | Partial<CmdPreviewOption>, callback?: () => void) {
        let cmd
        this.cmdParams = cmdParams
        if (this.type === 'live') {
            cmd = CMD_PREVIEW(cmdParams as CmdPreviewOption)
            this.taskID = cmd.data.task_id
        } else if (this.type === 'record') {
            this.isEndPlay = false
            this.notDecodeNumber = 0
            if (!(cmdParams as CmdPlaybackOpenOption).typeMask) {
                ;(cmdParams as CmdPlaybackOpenOption).typeMask = REC_EVENT_TYPES
            }
            cmd = CMD_PLAYBACK_OPEN(cmdParams as CmdPlaybackOpenOption)
            this.taskID = cmd.data.task_id
        }
        this.playState = PLAY_STATE_PLAYING
        this.startDownload(getWebsocketOpenUrl(), cmd, callback)
    }

    /**
     * @description 停止
     */
    stop() {
        this.stopDownload()
        this.stopDecode()
        this.clearFrameList()
        this.clearDisplayLoop()
        this.playState = PLAY_STATE_STOP
        this.webglPlayer?.clear()
        this.onstop && this.onstop()
    }

    /**
     * @description 暂停回放
     */
    pause() {
        this.playState = PLAY_STATE_PAUSE
        this.stopDecode()
        // this.stopDownload()
    }

    /**
     * @description 继续回放
     */
    resume() {
        this.playState = PLAY_STATE_PLAYING
        this.resetBasicTime()
        this.resumeDownload()
        this.startDecode()
        this.clearDisplayLoop()
        this.displayLoop()
    }

    /**
     * @description 手动播放下一帧
     */
    nextFrame() {
        this.playState = PLAY_STATE_NEXT_FRAME
        this.startDecode()
        this.clearDisplayLoop()
        this.displayLoop()
    }

    /**
     * @description seek跳转回放，通过先停止再重新播放的逻辑实现
     * 传参为跳转的绝对时间戳（单位秒）
     * @param {number} frameTimestamp
     */
    seek(frameTimestamp: number) {
        this.stop()
        ;(this.cmdParams as CmdPlaybackOpenOption).startTime = Math.floor(frameTimestamp)
        this.clearFrameList()
        setTimeout(() => {
            this.clearFrameList()
            this.isFirstDecod = false
            this.play(this.cmdParams, () => {
                this.setSpeed(this.playSpeed, true, frameTimestamp * 1e3)
            })
        }, 200)
    }

    /**
     * @description 倍速回放
     * @param {Number} speed 倍数系数: 0.5、1、2、4...
     * @param {Boolean} isSeek 是否是seek之后设置倍速（由于seek是先stop再play，此时需要手动执行全帧或关键帧回放命令）
     * 大于4倍数需要启用关键帧回放，否则全帧回放
     */
    setSpeed(speed: number, isSeek: boolean = false, timestamp: number = 0) {
        if (speed > 4) {
            if (this.playSpeed <= 4 || isSeek) {
                // 4倍速切到8倍速 采用关键帧播放
                this.keyFramePlay(timestamp)
            }
        } else {
            if (this.playSpeed > 4 || isSeek) {
                // 8倍速切到4倍速 采用全帧播放
                this.allFramePlay(timestamp)
            }
        }
        this.playSpeed = speed
        this.resetBasicTime()
    }

    /**
     * @description 帧时间戳转换为UTC时间格式: 年-月-日 时:分:秒:毫秒
     * @param {Number} timestamp 毫秒时间戳
     */
    frameTime2UTC(timestamp: number) {
        if (!timestamp) {
            return ''
        }
        return localToUtc(timestamp, 'yyyy-MM-DD HH:mm:ss:S')
        // const utcDate = LocalTime2UTCTime(new Date(timestamp))
        // return utcDate.format('yyyy-MM-dd HH:mm:ss:S')
    }

    /**
     * @description 启用关键帧回放
     * @param {Number} timestamp 毫秒时间戳
     */
    keyFramePlay(timestamp: number) {
        this.stopDecode()
        this.clearFrameList() // 清空缓存帧队列
        this.webglPlayer?.clear()
        const time = timestamp || this.frameTimestamp
        this.isKeyFramePlay = true
        const cmdParams = CMD_PLAYBACK_KEY_FRAME(this.taskID, this.frameTime2UTC(time))
        this.downloadWorker!.postMessage({
            cmd: 'sendCMD',
            data: JSON.stringify(cmdParams),
        })
        this.startDecode()
    }

    /**
     * @description 恢复全帧回放
     * @param {Number} timestamp 秒时间戳
     */
    allFramePlay(timestamp: number) {
        this.stopDecode()
        this.clearFrameList() // 清空缓存帧队列
        if (this.webglPlayer) this.webglPlayer.clear()
        const time = timestamp || this.frameTimestamp
        this.isKeyFramePlay = false
        const cmdParams = CMD_PLAYBACK_ALL_FRAME(this.taskID, this.frameTime2UTC(time))
        this.downloadWorker!.postMessage({
            cmd: 'sendCMD',
            data: JSON.stringify(cmdParams),
        })
        this.startDecode()
    }

    /**
     * @description 打开音频流
     * @param {Object} cmdParams
     */
    openAudioStream(cmdParams: any) {
        this.downloadWorker!.postMessage({
            cmd: 'sendCMD',
            data: JSON.stringify(cmdParams),
        })
    }

    /**
     * @description 原始比例画面(1:1)
     */
    displayOriginal() {
        const curWHRatio = this.canvas.width / this.canvas.height
        const realWHRatio = this.videoWidth / this.videoHeight
        if (curWHRatio > realWHRatio) {
            // 当前宽过大，则两侧留空
            this.canvas.width = this.canvas.height * realWHRatio
        } else if (curWHRatio < realWHRatio) {
            // 当前高过大，则上下留空
            this.canvas.height = this.canvas.width / realWHRatio
        }
    }

    /**
     * @description 设置视频宽高
     * @param {number} width
     * @param {number} height
     */
    setSize(width: number, height: number) {
        this.canvas.width = width
        this.canvas.height = height
    }

    /**
     * @description 获取canvas宽高属性值
     */
    getSize() {
        return {
            width: this.canvas.width,
            height: this.canvas.height,
        }
    }

    /**
     * @description 设置音量 取值0-100（设置给pcmPlayer时转化为0-1）
     * @param {number} volume
     */
    setVolume(volume: number) {
        this.pcmPlayer && this.pcmPlayer.volume(volume / 100)
    }

    /**
     * @description 打开声音
     */
    openAudio() {
        let cmdJSON
        if (this.type === 'live') {
            cmdJSON = CMD_PREVIEW_AUDIO_OPEN(this.taskID)
        } else if (this.type === 'record') {
            cmdJSON = CMD_PLAYBACK_AUDIO_OPEN(this.taskID)
        }
        this.downloadWorker!.postMessage({
            cmd: 'sendCMD',
            data: JSON.stringify(cmdJSON),
        })
    }

    /**
     * @description 关闭声音
     */
    closeAudio() {
        let cmdJSON
        if (this.type === 'live') {
            cmdJSON = CMD_PREVIEW_AUDIO_CLOSE(this.taskID)
        } else if (this.type === 'record') {
            cmdJSON = CMD_PLAYBACK_AUDIO_CLOSE(this.taskID)
        }
        this.downloadWorker!.postMessage({
            cmd: 'sendCMD',
            data: JSON.stringify(cmdJSON),
        })
    }

    /**
     * @description 销毁播放器
     */
    destroy() {
        this.destroyDecoder()
        this.destroyDownloader()
        this.clearDisplayLoop()
        document.removeEventListener('visibilitychange', this.pageVisibleChangeHandle, false)
        if (this.webglPlayer) {
            this.webglPlayer.clear()
            delete this.webglPlayer
        }

        if (this.pcmPlayer) {
            this.pcmPlayer.destroy()
            delete this.pcmPlayer
        }
    }

    /**
     * @description 更新webPageVisible状态
     */
    // private pageVisibleChangeHandle() {
    //     this.webPageVisible = !document.hidden
    // }

    /**
     * @description 初始化
     */
    private init() {
        this.initDecoder()
        this.initDownloader()
        this.initWebGL()
        this.pageVisibleChangeHandle = () => {
            this.webPageVisible = !document.hidden
        }
        // this.pageVisibleChangeHandle = () => {
        //     this.webPageVisible = !document.hidden
        // }
        /**
         * 参考文档：@see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/visibilitychange_event
         */
        document.addEventListener('visibilitychange', this.pageVisibleChangeHandle, false)
    }

    /**
     * @description 初始化解码线程
     */
    private initDecoder() {
        this.wasmReady = false
        this.decodeWorker = new Worker('/workers/decoder.js', {
            type: 'classic',
        })
        this.decodeWorker.onmessage = (e: any) => {
            const data = e.data
            if (!data?.cmd) {
                return
            }

            switch (data.cmd) {
                case 'ready':
                    this.wasmReady = true
                    this.decodeWorker!.postMessage({
                        cmd: 'init',
                        type: DECODE_TYPES[this.type],
                    })
                    break
                case 'getVideoFrame':
                    const videoFrame = data.data
                    this.frameData = videoFrame
                    this.notDecodeNumber = videoFrame.notDecodeNumber
                    this.onVideoFrame(videoFrame)
                    break
                case 'getAudioFrame':
                    const audioFrame = data.data
                    this.onAudioFrame(audioFrame)
                    break
                case 'getRecData': // 获取到录像数据
                    this.onRecordData(data.data, data.finished)
                    break
                case 'fileOverSize': // 检测到读取avi文件达到单个文件阈值时
                    this.onFileOverSize()
                    break
                case 'getPosInfo': // 获取到pos数据
                    this.onPosInfo(data.frame, data.posLength)
                    break
                case 'bufferError':
                    this.stopDecode()
                    break
                case 'errorCode':
                    this.onerror && this.onerror(data.code, data.url)
                    break
                default:
                    break
            }
        }
    }

    /**
     * @description 初始化下载线程
     */
    private initDownloader() {
        this.downloadWorker = new Worker('/workers/downloader.js', {
            type: 'classic',
        })
        this.downloadWorker.onmessage = (e: any) => {
            const data = e.data
            if (!data?.cmd) {
                return
            }

            switch (data.cmd) {
                case 'feedData':
                    if (!this.isFirstDecod) {
                        this.startDecode()
                        this.isFirstDecod = true
                        this.clearDisplayLoop()
                        this.displayLoop()
                        this.onsuccess && this.onsuccess()
                        if (this.type === 'live') {
                            this.onfinished && this.onfinished()
                        }
                    }
                    this.decodeWorker!.postMessage({
                        cmd: 'sendData',
                        buffer: data.buffer,
                    })
                    if (!this.isDecoding && this.type === 'live') {
                        this.startDecode()
                    }
                    break
                case 'close':
                case 'error':
                    if (this.type === 'record' && data.code === ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED && data.url === '/device/playback/data') {
                        // 回放结束
                        if (this.isEndPlay) return // 设备会发送两次停止播放，避免重复进入停止逻辑
                        this.isEndPlay = true
                        this.endPlay(data)
                        return
                    }
                    // 其他错误类型，如音频无权限
                    this.onerror && this.onerror(data.code, data.url)
                    this.onfinished && this.onfinished()
                    break
                default:
                    break
            }
        }
    }

    /**
     * @description 回放结束
     * @param {Object} data
     */
    private endPlay(data: any) {
        if (this.notDecodeNumber === 0) {
            this.stopDecode()
            this.pause()
            this.onfinished && this.onfinished()
            this.onerror && this.onerror(data.code, data.url)
            this.isEndPlay = false
        } else {
            setTimeout(() => this.endPlay(data), 50)
        }
    }

    /**
     * @description 初始化webgl渲染器
     */
    private initWebGL() {
        this.webglPlayer = new WebGLPlayer(this.canvas, {
            preserveDrawingBuffer: false,
        })
    }

    /**
     * @description 获取webgl窗口位置
     */
    getWebGL() {
        return this.webglPlayer!.getViewport()
    }

    /**
     * @description 设置webgl窗口位置
     * @param {number} left
     * @param {number} bottom
     * @param {number} width
     * @param {number} height
     */
    setWebGL(left: number, bottom: number, width: number, height: number) {
        this.webglPlayer!.setViewport(left, bottom, width, height)
    }

    /**
     * @description 初始化音频播放器
     * @param {WasmPlayerAudioFrame} frame
     */
    private initPcmPlayer(frame: WasmPlayerAudioFrame) {
        this.pcmPlayer = new PCMPlayer({
            encoding: AudioEncodingMap[frame.sampleFmt] || '16bitInt',
            channels: frame.channels,
            sampleRate: frame.sampleRate,
            flushingTime: 1000,
            volume: this.volume / 100,
        })
        // this.audioTimeOffset = this.pcmPlayer.getTimestamp()
    }

    /**
     * @description 销毁解码线程
     */
    private destroyDecoder() {
        this.decodeWorker?.postMessage({
            cmd: 'destroy',
        })
        this.decodeWorker?.terminate()
    }

    /**
     * @description 销毁下载线程
     */
    private destroyDownloader() {
        this.downloadWorker?.postMessage({
            cmd: 'destroy',
        })
        this.downloadWorker?.terminate()
    }

    /**
     * @description 开启解码
     */
    private startDecode() {
        this.isDecoding = true
        this.decodeWorker!.postMessage({
            cmd: 'decodeFrame',
        })
    }

    /**
     * @description 停止解码
     */
    private stopDecode() {
        this.isDecoding = false
        this.decodeWorker!.postMessage({
            cmd: 'stopDecode',
        })
    }

    /**
     * @description 清空缓存帧队列
     */
    private clearFrameList() {
        this.videoQueue = []
        this.audioQueue = []
        this.decodeWorker!.postMessage({
            cmd: 'clear',
        })
    }

    /**
     * @deecription 开启收流
     * @param {string} url
     * @param {Object} cmdParams
     * @param {Function} callback
     */
    private startDownload(url: string, cmdParams: any, callback?: () => void) {
        if (this.wasmReady) {
            this.downloadWorker!.postMessage({
                cmd: 'start',
                data: {
                    url: url,
                    params: JSON.stringify(cmdParams),
                },
            })
            this.onopen && this.onopen()
            callback && callback()
        } else {
            setTimeout(() => this.startDownload(url, cmdParams, callback), 100)
        }
    }

    /**
     * @description 刷新回放帧索引
     * @param {number} frameIndex
     */
    private refreshPlaybackFrameIndex(frameIndex: number) {
        this.frameIndex = frameIndex
        if (this.playState !== PLAY_STATE_PLAYING && this.playState !== PLAY_STATE_NEXT_FRAME) return
        const cmdParams = CMD_PLAYBACK_REFRESH_FRAME_INDEX(this.taskID, frameIndex)
        this.downloadWorker!.postMessage({
            cmd: 'sendCMD',
            data: JSON.stringify(cmdParams),
        })
    }

    /**
     * @description 继续收流
     */
    private resumeDownload() {
        this.playState = PLAY_STATE_PLAYING
        this.refreshPlaybackFrameIndex(this.frameIndex)
    }

    /**
     * @description 停止收流
     */
    private stopDownload() {
        let cmdParams = null
        if (this.type === 'live') {
            cmdParams = CMD_STOP_PREVIEW(this.taskID)
        } else if (this.type === 'record') {
            cmdParams = CMD_PLAYBACK_CLOSE(this.taskID)
        }
        this.downloadWorker!.postMessage({
            cmd: 'stop',
            data: JSON.stringify(cmdParams),
        })
    }

    /**
     * @description 处理解码得到的视频帧数据
     * @param {WasmPlayerVideoFrame} frame
     */
    private onVideoFrame(frame: WasmPlayerVideoFrame) {
        if (this.type === 'record') {
            // 回放模式下每8帧需要通知设备端刷新帧索引
            const frameIndex = frame.frameIndex
            if (frameIndex > 0 && (frameIndex % 8 === 0 || this.isKeyFramePlay)) {
                this.refreshPlaybackFrameIndex(frameIndex)
            }
        }

        if (!this.webPageVisible || frame.frameType === 4) {
            // 帧类型 -- 4: 预解码, 只解码不播放
            return
        }
        this.videoQueue.push(frame)
        if (this.videoQueue.length > this.maxVideoQueueLength) {
            this.stopDecode()
        }
    }

    /**
     * @description 通过requestAnimationFrame开启播放帧队列
     */
    private displayLoop() {
        if (this.playState === PLAY_STATE_PLAYING || this.playState === PLAY_STATE_NEXT_FRAME) {
            this.displayLoopID = requestAnimationFrame(this.displayLoop.bind(this))
        }

        if ((this.playState !== PLAY_STATE_PLAYING && this.playState !== PLAY_STATE_NEXT_FRAME) || this.videoQueue.length === 0 || this.seeking) {
            return
        }

        for (let i = 0; i < 2; i++) {
            if (this.displayNextVideoFrame()) {
                this.videoQueue.shift()
                if (this.playState === PLAY_STATE_NEXT_FRAME) {
                    if (!this.videoQueue.length) {
                        this.refreshPlaybackFrameIndex(this.frameIndex)
                    }
                    this.clearDisplayLoop()
                    this.playState = PLAY_STATE_PAUSE
                    break
                }
            }

            if (!this.videoQueue.length) {
                break
            }
        }

        // 缓存帧队列小于最大缓存的半数时，重新开启解码
        if (this.videoQueue.length < this.maxVideoQueueLength / 2 && !this.isDecoding) {
            this.startDecode()
        }
    }

    /**
     * @description 关闭requestAnimationFrame
     */
    private clearDisplayLoop() {
        cancelAnimationFrame(this.displayLoopID)
        this.displayLoopID = 0
    }

    /**
     * @description 获取基准真实时间
     */
    getBasicRealTime() {
        return this.basicRealTime
    }

    /**
     * @description 设置基准真实时间
     */
    setBasicRealTime(realTime: number) {
        this.basicRealTime = realTime
    }

    /**
     * @description 重置基准时间
     */
    resetBasicTime() {
        this.basicRealTime = 0
        this.basicFrameTime = 0
    }

    /**
     * @description 渲染下一帧视频帧
     * 仅回放进行播放节奏控制
     */
    private displayNextVideoFrame() {
        const frame = this.videoQueue[0]
        const currentRealTime = new Date().getTime()
        const currentFrameTime = frame.realTimestamp // 当前帧时间
        if (!this.basicFrameTime) {
            this.basicRealTime = currentRealTime // 真实基准时间
            this.basicFrameTime = currentFrameTime // 帧基准时间
        }
        const intervalReal = currentRealTime - this.basicRealTime // 真实时间差
        const intervalFrame = currentFrameTime - this.basicFrameTime // 帧时间差
        if (intervalFrame < 0) {
            // 保证帧基准时间小于当前帧时间
            this.basicFrameTime = currentFrameTime
        }

        if (intervalReal * this.playSpeed < intervalFrame) {
            if (!this.seeking) {
                this.ontime && this.ontime(frame.realTimestamp)
            }
            return false
        } else {
            // 节流控制, 若解码和渲染性能较高时, 仍保持最高30帧/s的刷新速率, 避免视频加速
            if (currentRealTime - this.lastRenderTime < 1000 / 30) {
                return true
            } else {
                this.lastRenderTime = currentRealTime
            }

            // 渲染画面
            if (!this.cmdParams.hasOwnProperty('isPlayback') || (this.cmdParams.hasOwnProperty('isPlayback') && this.cmdParams.isPlayback)) {
                this.renderVideoFrame(frame)
            }
            if (intervalReal > 10 * 1000 * this.playSpeed) this.resetBasicTime() // 真实时间偏差过大时, 重新校准
            if (!this.seeking) {
                this.ontime && this.ontime(frame.realTimestamp)
            }
            return true
        }
    }

    /**
     * @description 渲染视频帧
     * @param {WasmPlayerVideoFrame} frame
     */
    private renderVideoFrame(frame: WasmPlayerVideoFrame) {
        if (!this.webglPlayer) {
            return
        }
        const buffer = new Uint8Array(frame.buffer)
        const videoBuffer = buffer.slice(0, frame.yuvLen)
        const yLength = frame.width * frame.height
        const uvLength = (frame.width / 2) * (frame.height / 2)
        this.videoWidth = frame.width
        this.videoHeight = frame.height
        this.webglPlayer.renderFrame(videoBuffer, frame.width, frame.height, yLength, uvLength)
        // 派发水印信息
        if (typeof this.onwatermark === 'function') {
            const watermarkLen = frame.watermarkLen || 0
            if (watermarkLen > 0) {
                const watermarkBuf = buffer.slice(buffer.byteLength - watermarkLen)
                const watermark = Uint8ArrayToStr(watermarkBuf)
                this.onwatermark(watermark)
            }
        }
        // 更新帧时间
        this.frameTimestamp = frame.realTimestamp
    }

    /**
     * @description 获取视频原始宽高
     */
    getVideoRealSize() {
        return {
            width: this.videoWidth,
            height: this.videoHeight,
        }
    }

    /**
     * @description 处理解码得到的音频帧数据
     * @param {WasmPlayerAudioFrame} frame
     */
    private onAudioFrame(frame: WasmPlayerAudioFrame) {
        if (!this.pcmPlayer) {
            this.initPcmPlayer(frame)
        }
        this.audioQueue.push(new Uint8Array(frame.buffer))
        const data = this.audioQueue.shift()!
        this.pcmPlayer!.feed(data)
    }

    /**
     * @description 设置时间间隔
     * @param {number} timeGap
     */
    setTimeGap(timeGap: number) {
        this.basicRealTime -= timeGap
    }

    /**
     * @description 接收到录像时
     * @param {ArrayBuffer} data 录像数据
     * @param {boolean} finished 是否已结束
     */
    private onRecordData(data: ArrayBuffer, finished: boolean) {
        this.recordBuf = appendBuffer(this.recordBuf, data)
        if (finished) {
            this.onrecordFile && this.onrecordFile(this.recordBuf)
            this.recordBuf = null
        }
    }

    /**
     * @description onFileOverSize
     */
    private onFileOverSize() {
        this.stopRecord()
    }

    /**
     * @description 开始本地录像
     */
    startRecord() {
        this.decodeWorker!.postMessage({
            cmd: 'startRecord',
        })
    }

    /**
     * @description 结束本地录像
     * @param {Boolean} manul 是否手动停止
     */
    stopRecord(manul: boolean = false) {
        this.decodeWorker!.postMessage({
            cmd: 'stopRecord',
            manul: manul,
        })
    }

    /**
     * @description 接收到pos帧时
     * @param frame pos数据
     * @param {number} posLength pos长度
     * @param {number} frameTime pos帧时间
     */
    private onPosInfo(frame: any, posLength: number) {
        this.onpos(frame, posLength)
    }

    /**
     * @description 获取当前帧数据（和webgl播放器）
     * @returns
     */
    getCurrFrame() {
        return {
            frame: this.frameData as WasmPlayerVideoFrame,
            WebGLPlayer: WebGLPlayer,
        }
    }

    /**
     * @description 判断是否同一个Canvas
     * @param {HTMLCanvasElement} canvas
     * @returns {boolean}
     */
    isSameCanvas(canvas: HTMLCanvasElement) {
        return this.canvas === canvas
    }

    /**
     * @description 获取播放状态
     * @returns {string}
     */
    getPlayState() {
        return this.playState
    }

    /**
     * @description 渲染帧数据
     * @param {Uint8Array} videoFrame
     * @param {number} width
     * @param {number} height
     * @param {number} uOffset
     * @param {number} vOffset
     */
    renderFrame(videoFrame: Uint8Array, width: number, height: number, uOffset: number, vOffset: number) {
        this.webglPlayer!.renderFrame(videoFrame, width, height, uOffset, vOffset)
    }
}
