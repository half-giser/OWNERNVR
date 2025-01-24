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

export default function WasmPlayer(options: WasmPlayerOption) {
    let wasmReady = false // wasm文件是否加载成功
    let videoQueue: WasmPlayerVideoFrame[] = [] // 缓存视频帧队列
    const maxVideoQueueLength = 8 // 缓存视频帧队列最大长度
    let audioQueue: Uint8Array[] = [] // 缓存音频帧队列
    // const maxAudioQueueLength = 8 // 缓存音频帧队列最大长度
    let videoWidth = 0
    let videoHeight = 0
    let isDecoding = false // 是否正在解码
    let isFirstDecod = false // 是否首次解码
    let basicRealTime = 0 // 播放基准真实时间
    let basicFrameTime = 0 // 播放基准帧时间
    let displayLoopID = 0 // 帧动画播放ID句柄
    let playState = '' // 播放状态
    let playSpeed = 1 // 播放速度倍数
    let isKeyFramePlay = false // 是否关键帧播放
    let frameTimestamp = 0 // 当前帧时间
    const seeking = false
    let cmdParams: any
    let frameIndex = 0
    let lastRenderTime = 0
    let webPageVisible = true // 当前网页是否可见
    let isEndPlay = false // 设备已传输完数据，准备停止播放（先播放完缓存的帧数据）
    let notDecodeNumber = 0 // 未解码（缓存）的帧数据数量
    let frameData: WasmPlayerVideoFrame | null = null // 当前帧数据
    let recordBuf: ArrayBuffer | null = null
    let pcmPlayer: ReturnType<typeof PCMPlayer>

    const type = options.type || 'live'
    let taskID = '' // 与设备交互的guid

    const canvas = options.canvas
    const onopen = options.onopen
    const onsuccess = options.onsuccess
    const onstop = options.onstop
    const onerror = options.onerror
    const onfinished = options.onfinished
    const ontime = options.ontime
    const onwatermark = options.onwatermark
    const onrecordFile = options.onrecordFile
    const onpos = options.onpos
    const volume = options.volume // 当前音量

    /**
     * @description 初始化
     */
    /**
     * @description 初始化解码线程
     */

    const decodeWorker = new Worker('/workers/decoder.js', {
        type: 'classic',
    })
    decodeWorker.onmessage = (e: any) => {
        const data = e.data
        if (!data?.cmd) {
            return
        }

        switch (data.cmd) {
            case 'ready':
                wasmReady = true
                decodeWorker.postMessage({
                    cmd: 'init',
                    type: DECODE_TYPES[type],
                })
                break
            case 'getVideoFrame':
                const videoFrame = data.data
                frameData = videoFrame
                notDecodeNumber = videoFrame.notDecodeNumber
                onVideoFrame(videoFrame)
                break
            case 'getAudioFrame':
                const audioFrame = data.data
                onAudioFrame(audioFrame)
                break
            case 'getRecData': // 获取到录像数据
                onRecordData(data.data, data.finished)
                break
            case 'fileOverSize': // 检测到读取avi文件达到单个文件阈值时
                onFileOverSize()
                break
            case 'getPosInfo': // 获取到pos数据
                onPosInfo(data.frame, data.posLength)
                break
            case 'bufferError':
                stopDecode()
                break
            case 'errorCode':
                onerror && onerror(data.code, data.url)
                break
            default:
                break
        }
    }

    /**
     * @description 初始化下载线程
     */
    const downloadWorker = new Worker('/workers/downloader.js', {
        type: 'classic',
    })
    downloadWorker.onmessage = (e: any) => {
        const data = e.data
        if (!data?.cmd) {
            return
        }

        switch (data.cmd) {
            case 'feedData':
                if (!isFirstDecod) {
                    startDecode()
                    isFirstDecod = true
                    clearDisplayLoop()
                    displayLoop()
                    onsuccess && onsuccess()
                    if (type === 'live') {
                        onfinished && onfinished()
                    }
                }
                decodeWorker.postMessage({
                    cmd: 'sendData',
                    buffer: data.buffer,
                })
                if (!isDecoding && type === 'live') {
                    startDecode()
                }
                break
            case 'close':
            case 'error':
                if (type === 'record' && data.code === ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED && data.url === '/device/playback/data') {
                    // 回放结束
                    if (isEndPlay) return // 设备会发送两次停止播放，避免重复进入停止逻辑
                    isEndPlay = true
                    endPlay(data)
                    return
                }
                // 其他错误类型，如音频无权限
                onerror && onerror(data.code, data.url)
                onfinished && onfinished()
                break
            default:
                break
        }
    }

    /**
     * @description 初始化webgl渲染器
     */
    const webglPlayer = WebGLPlayer(canvas, {
        preserveDrawingBuffer: false,
    })

    const pageVisibleChangeHandle = () => {
        webPageVisible = !document.hidden
    }

    /**
     * 参考文档：@see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/visibilitychange_event
     */
    document.addEventListener('visibilitychange', pageVisibleChangeHandle, false)

    /**
     * @description 播放
     * @param {Object} cmdParams
     * @param {Function} callback
     */
    const play = (cmdParam: Partial<CmdPlaybackOpenOption> | Partial<CmdPreviewOption>, callback?: () => void) => {
        let cmd
        cmdParams = cmdParam
        if (type === 'live') {
            cmd = CMD_PREVIEW(cmdParams as CmdPreviewOption)
            taskID = cmd.data.task_id
        } else if (type === 'record') {
            isEndPlay = false
            notDecodeNumber = 0
            if (!(cmdParams as CmdPlaybackOpenOption).typeMask) {
                ;(cmdParams as CmdPlaybackOpenOption).typeMask = REC_EVENT_TYPES
            }
            cmd = CMD_PLAYBACK_OPEN(cmdParams as CmdPlaybackOpenOption)
            taskID = cmd.data.task_id
        }
        playState = PLAY_STATE_PLAYING
        startDownload(getWebsocketOpenUrl(), cmd, callback)
    }

    /**
     * @description 停止
     */
    const stop = () => {
        stopDownload()
        stopDecode()
        clearFrameList()
        clearDisplayLoop()
        playState = PLAY_STATE_STOP
        webglPlayer.clear()
        onstop && onstop()
    }

    /**
     * @description 暂停回放
     */
    const pause = () => {
        playState = PLAY_STATE_PAUSE
        stopDecode()
        // stopDownload()
    }

    /**
     * @description 继续回放
     */
    const resume = () => {
        playState = PLAY_STATE_PLAYING
        resetBasicTime()
        resumeDownload()
        startDecode()
        clearDisplayLoop()
        displayLoop()
    }

    /**
     * @description 手动播放下一帧
     */
    const nextFrame = () => {
        playState = PLAY_STATE_NEXT_FRAME
        startDecode()
        clearDisplayLoop()
        displayLoop()
    }

    /**
     * @description seek跳转回放，通过先停止再重新播放的逻辑实现
     * 传参为跳转的绝对时间戳（单位秒）
     * @param {number} frameTimestamp
     */
    const seek = (frameTimestamp: number) => {
        stop()
        ;(cmdParams as CmdPlaybackOpenOption).startTime = Math.floor(frameTimestamp)
        clearFrameList()
        setTimeout(() => {
            clearFrameList()
            isFirstDecod = false
            play(cmdParams, () => {
                setSpeed(playSpeed, true, frameTimestamp * 1e3)
            })
        }, 200)
    }

    /**
     * @description 倍速回放
     * @param {Number} speed 倍数系数: 0.5、1、2、4...
     * @param {Boolean} isSeek 是否是seek之后设置倍速（由于seek是先stop再play，此时需要手动执行全帧或关键帧回放命令）
     * 大于4倍数需要启用关键帧回放，否则全帧回放
     */
    const setSpeed = (speed: number, isSeek: boolean = false, timestamp: number = 0) => {
        if (speed > 4) {
            if (playSpeed <= 4 || isSeek) {
                // 4倍速切到8倍速 采用关键帧播放
                keyFramePlay(timestamp)
            }
        } else {
            if (playSpeed > 4 || isSeek) {
                // 8倍速切到4倍速 采用全帧播放
                allFramePlay(timestamp)
            }
        }
        playSpeed = speed
        resetBasicTime()
    }

    /**
     * @description 帧时间戳转换为UTC时间格式: 年-月-日 时:分:秒:毫秒
     * @param {Number} timestamp 毫秒时间戳
     */
    const frameTime2UTC = (timestamp: number) => {
        if (!timestamp) {
            return ''
        }
        return localToUtc(timestamp, 'YYYY-MM-DD HH:mm:ss:SSS')
    }

    /**
     * @description 启用关键帧回放
     * @param {Number} timestamp 毫秒时间戳
     */
    const keyFramePlay = (timestamp: number) => {
        stopDecode()
        clearFrameList() // 清空缓存帧队列
        webglPlayer.clear()
        const time = timestamp || frameTimestamp
        isKeyFramePlay = true
        const cmdParams = CMD_PLAYBACK_KEY_FRAME(taskID, frameTime2UTC(time))
        downloadWorker.postMessage({
            cmd: 'sendCMD',
            data: JSON.stringify(cmdParams),
        })
        startDecode()
    }

    /**
     * @description 恢复全帧回放
     * @param {Number} timestamp 秒时间戳
     */
    const allFramePlay = (timestamp: number) => {
        stopDecode()
        clearFrameList() // 清空缓存帧队列
        webglPlayer.clear()
        const time = timestamp || frameTimestamp
        isKeyFramePlay = false
        const cmdParams = CMD_PLAYBACK_ALL_FRAME(taskID, frameTime2UTC(time))
        downloadWorker.postMessage({
            cmd: 'sendCMD',
            data: JSON.stringify(cmdParams),
        })
        startDecode()
    }

    /**
     * @description 打开音频流
     * @param {Object} cmdParams
     */
    const openAudioStream = (cmdParams: any) => {
        downloadWorker.postMessage({
            cmd: 'sendCMD',
            data: JSON.stringify(cmdParams),
        })
    }

    /**
     * @description 原始比例画面(1:1)
     */
    const displayOriginal = () => {
        const curWHRatio = canvas.width / canvas.height
        const realWHRatio = videoWidth / videoHeight
        if (curWHRatio > realWHRatio) {
            // 当前宽过大，则两侧留空
            canvas.width = canvas.height * realWHRatio
        } else if (curWHRatio < realWHRatio) {
            // 当前高过大，则上下留空
            canvas.height = canvas.width / realWHRatio
        }
    }

    /**
     * @description 设置视频宽高
     * @param {number} width
     * @param {number} height
     */
    const setSize = (width: number, height: number) => {
        canvas.width = width
        canvas.height = height
    }

    /**
     * @description 获取canvas宽高属性值
     */
    const getSize = () => {
        return {
            width: canvas.width,
            height: canvas.height,
        }
    }

    /**
     * @description 设置音量 取值0-100（设置给pcmPlayer时转化为0-1）
     * @param {number} volume
     */
    const setVolume = (volume: number) => {
        pcmPlayer && pcmPlayer.volume(volume / 100)
    }

    /**
     * @description 打开声音
     */
    const openAudio = () => {
        let cmdJSON
        if (type === 'live') {
            cmdJSON = CMD_PREVIEW_AUDIO_OPEN(taskID)
        } else if (type === 'record') {
            cmdJSON = CMD_PLAYBACK_AUDIO_OPEN(taskID)
        }
        downloadWorker.postMessage({
            cmd: 'sendCMD',
            data: JSON.stringify(cmdJSON),
        })
    }

    /**
     * @description 关闭声音
     */
    const closeAudio = () => {
        let cmdJSON
        if (type === 'live') {
            cmdJSON = CMD_PREVIEW_AUDIO_CLOSE(taskID)
        } else if (type === 'record') {
            cmdJSON = CMD_PLAYBACK_AUDIO_CLOSE(taskID)
        }
        downloadWorker.postMessage({
            cmd: 'sendCMD',
            data: JSON.stringify(cmdJSON),
        })
    }

    /**
     * @description 销毁播放器
     */
    const destroy = () => {
        try {
            decodeWorker.postMessage({
                cmd: 'destroy',
            })
            decodeWorker.terminate()
        } catch {}

        try {
            downloadWorker.postMessage({
                cmd: 'destroy',
            })
            downloadWorker.terminate()
        } catch {}

        clearDisplayLoop()

        document.removeEventListener('visibilitychange', pageVisibleChangeHandle, false)

        webglPlayer.clear()

        if (pcmPlayer) {
            pcmPlayer.destroy()
        }
    }

    /**
     * @description 回放结束
     * @param {Object} data
     */
    const endPlay = (data: any) => {
        if (notDecodeNumber === 0) {
            stopDecode()
            pause()
            onfinished && onfinished()
            onerror && onerror(data.code, data.url)
            isEndPlay = false
        } else {
            setTimeout(() => endPlay(data), 50)
        }
    }

    /**
     * @description 获取webgl窗口位置
     */
    const getWebGL = () => {
        return webglPlayer.getViewport()
    }

    /**
     * @description 设置webgl窗口位置
     * @param {number} left
     * @param {number} bottom
     * @param {number} width
     * @param {number} height
     */
    const setWebGL = (left: number, bottom: number, width: number, height: number) => {
        webglPlayer.setViewport(left, bottom, width, height)
    }

    /**
     * @description 初始化音频播放器
     * @param {WasmPlayerAudioFrame} frame
     */
    const initPcmPlayer = (frame: WasmPlayerAudioFrame) => {
        pcmPlayer = PCMPlayer({
            encoding: AudioEncodingMap[frame.sampleFmt] || '16bitInt',
            channels: frame.channels,
            sampleRate: frame.sampleRate,
            flushingTime: 1000,
            volume: volume / 100,
        })
        // audioTimeOffset = pcmPlayer.getTimestamp()
    }

    /**
     * @description 开启解码
     */
    const startDecode = () => {
        isDecoding = true
        decodeWorker.postMessage({
            cmd: 'decodeFrame',
        })
    }

    /**
     * @description 停止解码
     */
    const stopDecode = () => {
        isDecoding = false
        decodeWorker.postMessage({
            cmd: 'stopDecode',
        })
    }

    /**
     * @description 清空缓存帧队列
     */
    const clearFrameList = () => {
        videoQueue = []
        audioQueue = []
        decodeWorker.postMessage({
            cmd: 'clear',
        })
    }

    /**
     * @deecription 开启收流
     * @param {string} url
     * @param {Object} cmdParams
     * @param {Function} callback
     */
    const startDownload = (url: string, cmdParams: any, callback?: () => void) => {
        if (wasmReady) {
            downloadWorker.postMessage({
                cmd: 'start',
                data: {
                    url: url,
                    params: JSON.stringify(cmdParams),
                },
            })
            onopen && onopen()
            callback && callback()
        } else {
            setTimeout(() => startDownload(url, cmdParams, callback), 100)
        }
    }

    /**
     * @description 刷新回放帧索引
     * @param {number} frameIndex
     */
    const refreshPlaybackFrameIndex = (index: number) => {
        frameIndex = index
        if (playState !== PLAY_STATE_PLAYING && playState !== PLAY_STATE_NEXT_FRAME) return
        const cmdParams = CMD_PLAYBACK_REFRESH_FRAME_INDEX(taskID, frameIndex)
        downloadWorker.postMessage({
            cmd: 'sendCMD',
            data: JSON.stringify(cmdParams),
        })
    }

    /**
     * @description 继续收流
     */
    const resumeDownload = () => {
        playState = PLAY_STATE_PLAYING
        refreshPlaybackFrameIndex(frameIndex)
    }

    /**
     * @description 停止收流
     */
    const stopDownload = () => {
        let cmdParams = null
        if (type === 'live') {
            cmdParams = CMD_STOP_PREVIEW(taskID)
        } else if (type === 'record') {
            cmdParams = CMD_PLAYBACK_CLOSE(taskID)
        }
        downloadWorker.postMessage({
            cmd: 'stop',
            data: JSON.stringify(cmdParams),
        })
    }

    /**
     * @description 处理解码得到的视频帧数据
     * @param {WasmPlayerVideoFrame} frame
     */
    const onVideoFrame = (frame: WasmPlayerVideoFrame) => {
        if (type === 'record') {
            // 回放模式下每8帧需要通知设备端刷新帧索引
            const frameIndex = frame.frameIndex
            if (frameIndex > 0 && (frameIndex % 8 === 0 || isKeyFramePlay)) {
                refreshPlaybackFrameIndex(frameIndex)
            }
        }

        if (!webPageVisible || frame.frameType === 4) {
            // 帧类型 -- 4: 预解码, 只解码不播放
            return
        }
        videoQueue.push(frame)
        if (videoQueue.length > maxVideoQueueLength) {
            stopDecode()
        }
    }

    /**
     * @description 通过requestAnimationFrame开启播放帧队列
     */
    const displayLoop = () => {
        if (playState === PLAY_STATE_PLAYING || playState === PLAY_STATE_NEXT_FRAME) {
            displayLoopID = requestAnimationFrame(() => displayLoop())
        }

        if ((playState !== PLAY_STATE_PLAYING && playState !== PLAY_STATE_NEXT_FRAME) || videoQueue.length === 0 || seeking) {
            return
        }

        for (let i = 0; i < 2; i++) {
            if (displayNextVideoFrame()) {
                videoQueue.shift()
                if (playState === PLAY_STATE_NEXT_FRAME) {
                    if (!videoQueue.length) {
                        refreshPlaybackFrameIndex(frameIndex)
                    }
                    clearDisplayLoop()
                    playState = PLAY_STATE_PAUSE
                    break
                }
            }

            if (!videoQueue.length) {
                break
            }
        }

        // 缓存帧队列小于最大缓存的半数时，重新开启解码
        if (videoQueue.length < maxVideoQueueLength / 2 && !isDecoding) {
            startDecode()
        }
    }

    /**
     * @description 关闭requestAnimationFrame
     */
    const clearDisplayLoop = () => {
        cancelAnimationFrame(displayLoopID)
        displayLoopID = 0
    }

    /**
     * @description 获取基准真实时间
     */
    const getBasicRealTime = () => {
        return basicRealTime
    }

    /**
     * @description 设置基准真实时间
     */
    const setBasicRealTime = (realTime: number) => {
        basicRealTime = realTime
    }

    /**
     * @description 重置基准时间
     */
    const resetBasicTime = () => {
        basicRealTime = 0
        basicFrameTime = 0
    }

    /**
     * @description 渲染下一帧视频帧
     * 仅回放进行播放节奏控制
     */
    const displayNextVideoFrame = () => {
        const frame = videoQueue[0]
        const currentRealTime = Date.now()
        const currentFrameTime = frame.realTimestamp // 当前帧时间
        if (!basicFrameTime) {
            basicRealTime = currentRealTime // 真实基准时间
            basicFrameTime = currentFrameTime // 帧基准时间
        }
        const intervalReal = currentRealTime - basicRealTime // 真实时间差
        const intervalFrame = currentFrameTime - basicFrameTime // 帧时间差
        if (intervalFrame < 0) {
            // 保证帧基准时间小于当前帧时间
            basicFrameTime = currentFrameTime
        }

        if (intervalReal * playSpeed < intervalFrame) {
            if (!seeking) {
                ontime && ontime(frame.realTimestamp)
            }
            return false
        } else {
            // 节流控制, 若解码和渲染性能较高时, 仍保持最高30帧/s的刷新速率, 避免视频加速
            if (currentRealTime - lastRenderTime < 1000 / 30) {
                return true
            } else {
                lastRenderTime = currentRealTime
            }

            // 渲染画面
            if (!cmdParams.hasOwnProperty('isPlayback') || (cmdParams.hasOwnProperty('isPlayback') && cmdParams.isPlayback)) {
                renderVideoFrame(frame)
            }
            if (intervalReal > 10 * 1000 * playSpeed) resetBasicTime() // 真实时间偏差过大时, 重新校准
            if (!seeking) {
                ontime && ontime(frame.realTimestamp)
            }
            return true
        }
    }

    /**
     * @description 渲染视频帧
     * @param {WasmPlayerVideoFrame} frame
     */
    const renderVideoFrame = (frame: WasmPlayerVideoFrame) => {
        const buffer = new Uint8Array(frame.buffer)
        const videoBuffer = buffer.slice(0, frame.yuvLen)
        const yLength = frame.width * frame.height
        const uvLength = (frame.width / 2) * (frame.height / 2)
        videoWidth = frame.width
        videoHeight = frame.height
        webglPlayer.renderFrame(videoBuffer, frame.width, frame.height, yLength, uvLength)
        // 派发水印信息
        if (typeof onwatermark === 'function') {
            const watermarkLen = frame.watermarkLen || 0
            if (watermarkLen > 0) {
                const watermarkBuf = buffer.slice(buffer.byteLength - watermarkLen)
                const watermark = Uint8ArrayToStr(watermarkBuf)
                onwatermark(watermark)
            }
        }
        // 更新帧时间
        frameTimestamp = frame.realTimestamp
    }

    /**
     * @description 获取视频原始宽高
     */
    const getVideoRealSize = () => {
        return {
            width: videoWidth,
            height: videoHeight,
        }
    }

    /**
     * @description 处理解码得到的音频帧数据
     * @param {WasmPlayerAudioFrame} frame
     */
    const onAudioFrame = (frame: WasmPlayerAudioFrame) => {
        if (!pcmPlayer) {
            initPcmPlayer(frame)
        }
        audioQueue.push(new Uint8Array(frame.buffer))
        const data = audioQueue.shift()!
        pcmPlayer.feed(data)
    }

    /**
     * @description 设置时间间隔
     * @param {number} timeGap
     */
    const setTimeGap = (timeGap: number) => {
        basicRealTime -= timeGap
    }

    /**
     * @description 接收到录像时
     * @param {ArrayBuffer} data 录像数据
     * @param {boolean} finished 是否已结束
     */
    const onRecordData = (data: ArrayBuffer, finished: boolean) => {
        recordBuf = appendBuffer(recordBuf, data) as ArrayBuffer
        if (finished) {
            onrecordFile && onrecordFile(recordBuf)
            recordBuf = null
        }
    }

    /**
     * @description onFileOverSize
     */
    const onFileOverSize = () => {
        stopRecord()
    }

    /**
     * @description 开始本地录像
     */
    const startRecord = () => {
        decodeWorker.postMessage({
            cmd: 'startRecord',
        })
    }

    /**
     * @description 结束本地录像
     * @param {Boolean} manul 是否手动停止
     */
    const stopRecord = (manul: boolean = false) => {
        decodeWorker.postMessage({
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
    const onPosInfo = (frame: any, posLength: number) => {
        onpos(frame, posLength)
    }

    /**
     * @description 获取当前帧数据（和webgl播放器）
     * @returns
     */
    const getCurrFrame = () => {
        return {
            frame: frameData as WasmPlayerVideoFrame,
            WebGLPlayer: WebGLPlayer,
        }
    }

    /**
     * @description 判断是否同一个Canvas
     * @param {HTMLCanvasElement} canvas
     * @returns {boolean}
     */
    const isSameCanvas = (cav: HTMLCanvasElement) => {
        return canvas === cav
    }

    /**
     * @description 获取播放状态
     * @returns {string}
     */
    const getPlayState = () => {
        return playState
    }

    /**
     * @description 渲染帧数据
     * @param {Uint8Array} videoFrame
     * @param {number} width
     * @param {number} height
     * @param {number} uOffset
     * @param {number} vOffset
     */
    const renderFrame = (videoFrame: Uint8Array, width: number, height: number, uOffset: number, vOffset: number) => {
        webglPlayer.renderFrame(videoFrame, width, height, uOffset, vOffset)
    }

    return {
        play,
        stop,
        pause,
        resume,
        nextFrame,
        keyFramePlay,
        allFramePlay,
        seek,
        openAudio,
        openAudioStream,
        closeAudio,
        displayOriginal,
        setSize,
        getSize,
        setVolume,
        getWebGL,
        setWebGL,
        getVideoRealSize,
        startRecord,
        stopRecord,
        setTimeGap,
        getCurrFrame,
        isSameCanvas,
        getPlayState,
        renderFrame,
        resetBasicTime,
        getBasicRealTime,
        setBasicRealTime,
        destroy,
        setSpeed,
    }
}
