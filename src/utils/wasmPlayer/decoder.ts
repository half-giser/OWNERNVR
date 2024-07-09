/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-03 10:03:29
 * @Description: 解码线程模块, 负责视频流解码, 输出YUV图像数据和PCM音频数据
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-19 10:53:13
 */

/**
 * 解码线程模块, 负责视频流解码, 输出YUV图像数据和PCM音频数据
 * --------------------------------------------------------------------------------------------------------------------
 * (1) js和C++只能传递数值类型数据，其他数据类型需要通过指针交互，例如sendData函数中，传递视频流的方法分4步：
 *    1. cacheBuffer = Module._malloc(chunkSize)    // 按chunkSize大小分配内存，变量cacheBuffer存放内存指针
 *    2. var typedArray = new Uint8Array(data)      // 将原始视频流buffer转化为8位无符号整数值的类型化数组
 *    3. Module.HEAPU8.set(typedArray, cacheBuffer) // 将类型化数组拷贝至已分配的内存中
 *    4. Module._pushWebAVPacket(handle, cacheBuffer, typedArray.length)  // 最后调用wasm中封装的接口将内存指针传递
 *                                                                           到c++模块，c++根据内存指针读取数据
 * (2) wasm提供的接口函数，具体见decode.c文件
 *    _createWebPlayer:  创建解码器实例
 *    _pushWebAVPacket:  喂数据
 *    _decodeFrame:      解帧
 *    _clearPacketList:  清空wasm内部解码帧队列（回放的seek等需要跳帧的业务调用此方法）
 *    _destroyWebPlayer: 销毁解码器实例
 * ---------------------------------------------------------------------------------------------------------------------
 */
const ctx: Worker = self as any

interface WorkerGlobeExtends {
    Module: {
        onRuntimeInitialized?: () => void
        _malloc: (size: number) => number
        _setLogLevel: (level: number) => void
        _setLogMode: (mode: number) => void
        _destroyWebPlayer: (handle: number | undefined) => void
        _decodeFrame: (handle: number | undefined, buffer: number | null, count: number) => number
        _pushWebAVPacket: (handle: number | undefined, cacheBuffer: number | null, length: number, num1: number, num2: number, onlyForRecord: number, pBuffer: number, pCount: number) => number
        _getPosInfo: (handle: number | undefined, pBuffer: number, pCount: number) => number
        _clearPacketList: (handle: number | undefined) => void
        _startRecordAvi: (handle: number | undefined, index: number) => void
        _readRecordAviFile: (handle: number | undefined, bytebuffer: number, count: number, chunkSize: number) => number
        _stopRecordAvi: (handle: number | undefined) => void
        _openRecordAviFile: (handle: number | undefined, index: number) => void
        _getAviFileSize: (handle: number | undefined) => number
        _delAviFile: (handle: number | undefined, index: number) => void
        _free: (buffer: number | null) => void
        _createWebPlayer: (type: number) => number
        HEAPU8: {
            subarray: (num1: number, num2: number) => number[]
            set: (typedArray: Uint8Array, cacheBuffer: number | null) => void
        }
        HEAP32: {
            subarray: (num1: number, num2: number) => number[]
        }
    }
    importScripts: (url: string) => void
}

interface Worker extends WorkerGlobeExtends {}

ctx.Module = {
    onRuntimeInitialized() {
        handleWasmLoaded()
    },
    ...(ctx.Module || {}),
}
ctx.importScripts('./libffmpeg.js')

const MEMORY_PARAM_COUNT = 15 // 内存数组长度
const MEMORY_PARAM_SIZE = 4 // 数组参数占字节大小
let chunkSize = 640 * 1024 // 默认分配640k内存缓存接受的流数据
let cacheBuffer: number | null = null // 送帧内存指针
let paramByteBuffer: number | null = null // 读帧内存指针
let handle: number | undefined // 解码器实例句柄
let decodeTimer: NodeJS.Timeout | number = 0
// const DecodeInterval = 15
let videoType = -1
let videoWidth = 0
let videoHeight = 0
const kErrorCode_Parse_FrameType_POS = 12 // pos帧类型

// 缓存队列喂wasm数据（ws推流为异步任务, 而wasm同一时间只能执行一个方法）
class SendQueue {
    status = 'sending' // 状态, sending/stop
    isFirstSend = true // 是否第一次喂数据
    queue: (() => void)[] = [] // 推流队列
    retryIndex = 0 // 重试次数（喂数据比接收推流快时, 设置重试）
    retryTimer: NodeJS.Timeout | number = 0 // 重试定时器
    retryLimit = 6000 // 重试次数上限
    // constructor() {}
    init() {
        this.status = 'sending'
        this.isFirstSend = true
        this.queue = []
        this.clearRetryTimer()
    }
    clearRetryTimer() {
        clearTimeout(this.retryTimer)
        // this.retryTimer = null
    }
    add(callback: () => void) {
        this.queue.push(callback)
        if (this.isFirstSend) {
            this.isFirstSend = false
            this.execute()
        }
    }
    execute() {
        if (this.status !== 'sending') return
        if (this.queue.length === 0) {
            if (this.retryIndex < this.retryLimit) {
                this.retryIndex++
                this.clearRetryTimer()
                this.retryTimer = setTimeout(() => {
                    this.execute()
                }, 100)
            } else {
                console.log('SEND_QUEUE no new Data in 10mins, sendData() fail')
            }
        } else {
            this.retryIndex = 0
            const callback = this.queue.shift()
            callback && callback()
        }
    }
    executeNext() {
        this.status = 'sending'
        this.execute()
    }
}

const SEND_QUEUE = new SendQueue()

// 录像相关
class Recorder {
    MEMORY_PARAM_COUNT = 3
    MEMORY_PARAM_SIZE = 4
    chunkSize = 1024 * 1024 // 每次读取文件大小1M
    paramByteBuffer = 0
    manul = false // 是否手动停止录像
    maxSingleSize = 1024 * 1024 * 10 // 单录像文件最大字节数, 默认10M
    readTimer: NodeJS.Timeout | number = 0
    fileIndex = 0
    recording = false
    type = 1 // 1现场 0回放
    init() {
        this.paramByteBuffer = ctx.Module._malloc(this.MEMORY_PARAM_COUNT * this.MEMORY_PARAM_SIZE)
    }
    setMaxSingleSize(maxSingleSize: number) {
        if (maxSingleSize || maxSingleSize === 0) {
            this.maxSingleSize = maxSingleSize === 0 ? Infinity : maxSingleSize
        }
    }
    // 开始录像
    startRecord() {
        this.init()
        ctx.Module._startRecordAvi(handle, this.fileIndex)
        this.recording = true
        console.log('start record, fileIndex:', this.fileIndex)
    }
    // 停止录像
    stopRecord(manul: boolean) {
        this.recording = false
        this.manul = manul
        this.fileIndex++
        ctx.Module._stopRecordAvi(handle)
        console.log('end record, fileIndex:', this.fileIndex - 1)
        ctx.Module._openRecordAviFile(handle, this.fileIndex - 1)
        this.startReadTimer()
    }
    /**
     * 读取录像文件
     * paramArray:
     * [0] errorCode        错误码 0成功
     * [1] readSize         应读取长度
     * [2] realReadLen      实际读取长度
     */
    readRecFile() {
        if (!this.readTimer) {
            return
        }
        const ret = ctx.Module._readRecordAviFile(handle, this.paramByteBuffer, this.MEMORY_PARAM_COUNT, this.chunkSize)
        const paramIntBuff = this.paramByteBuffer >> 2
        const paramArray = ctx.Module.HEAP32.subarray(paramIntBuff, paramIntBuff + this.MEMORY_PARAM_COUNT)
        const outArray = ctx.Module.HEAPU8.subarray(ret, ret + paramArray[2])
        const arr = new Uint8Array(outArray)
        this.readTimer = setTimeout(() => {
            this.readRecFile()
        }, 0)
        if (paramArray[0] !== 0 && paramArray[1] == 0 && paramArray[2] == 0) {
            // 空录像文件
            this.stopReadTimer()
            console.log('file empty, fileIndex:', this.fileIndex - 1)
            ctx.postMessage({ cmd: 'getRecData', data: [], finished: true, manul: true, fileIndex: this.fileIndex - 1 })
            ctx.Module._delAviFile(handle, this.fileIndex - 1)
            return
        }
        const finished = paramArray[2] < paramArray[1]
        // console.log('file length should be read：', paramArray[1], ', file real length：', paramArray[2])
        ctx.postMessage({ cmd: 'getRecData', data: arr, finished: finished, manul: this.manul, fileIndex: this.fileIndex - 1 })
        if (finished) {
            this.stopReadTimer()
            console.log('end read recordFile, fileIndex:', this.fileIndex - 1)
            ctx.Module._delAviFile(handle, this.fileIndex - 1)
        }
    }
    // 检测已处理文件长度
    checkFileSize() {
        if (this.maxSingleSize === Infinity) {
            return
        }
        const fileSize = ctx.Module._getAviFileSize(handle)
        if (fileSize >= this.maxSingleSize && SEND_QUEUE.status === 'sending') {
            SEND_QUEUE.status = 'stop'
            ctx.postMessage({
                cmd: 'fileOverSize',
            })
        }
    }
    // 停止录像任务后，开启文件读取
    startReadTimer() {
        this.stopReadTimer()
        this.readTimer = 0
        console.log('start read recordFile, fileIndex:', this.fileIndex - 1)
        this.readRecFile()
    }
    stopReadTimer() {
        clearTimeout(this.readTimer)
        this.readTimer = 0
    }
    destroy() {
        ctx.Module._free(this.paramByteBuffer)
        this.paramByteBuffer = 0
        this.fileIndex = 0
        this.stopReadTimer()
    }
}

const RecordModule = new Recorder()

/**
 * Uint8Array转字符串
 */
// function Uint8ArrayToString(fileData: Uint8Array) {
//     let dataString = ''
//     for (let i = 0; i < fileData.length; i++) {
//         dataString += String.fromCharCode(fileData[i])
//     }
//     return dataString
// }

/**
 * 分配送帧和读帧内存空间
 */
function setMalloc() {
    cacheBuffer = ctx.Module._malloc(chunkSize)
    paramByteBuffer = ctx.Module._malloc(MEMORY_PARAM_COUNT * MEMORY_PARAM_SIZE)
    ctx.Module._setLogLevel(0)
    ctx.Module._setLogMode(0)
}

/**
 * wasm加载完成时执行
 */
function handleWasmLoaded() {
    setMalloc()
    ctx.postMessage({ cmd: 'ready' })
}

/**
 * 创建解码器 type: 1现场 0回放
 */
function createDecoder(type: number) {
    // 创建解码器句柄
    handle = ctx.Module._createWebPlayer(type)
    RecordModule.type = type
}

// arraybuffer转字符串
function buffer2str(buffer: ArrayBuffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer) as any as number[])
}

/**
 * 从websocket流数据包中读取有效视频帧数据
 * 数据包结构说明
 * +--------------------------+---------------------------+----------+----------------------------+
 * |  ENCRYPT_ID（加密标识）  |  ENCRYPT_INFO（加密信息）  |  JSON段  |       数据段（视频帧）     |
 * +--------------------------+---------------------------+----------+----------------------------+
 * 0                          8                           16
 * ENCRYPT_ID（加密标识）：
 *    uint32 dwEncryptType; 加密类型, 当前不支持加密，默认为0
 *    uint32 dwJSonLen; JSON段长度
 * ENCRYPT_INFO（加密信息, 加密类型为0时无此信息）：
 *    uint32 dwSrcDataLen; 源数据长度
 *    uint32 dwSrcDataCRC32; 源数据CRC值,解密时可以校验该值确定解密是否正确
 * JSON段格式：
 * {
 *     "url": "/device/preview/data",
 *     "basic": {
 *         "ver": "1.0",
 *         "id": 1,
 *         "time": 156541727465,
 *         "nonce": 2553352443
 *     },
 *     "data": {
 *         "task_id": string,
 *         "live_stream_data": "0, 500"  // 视频数据buffer在流数据中相对json的偏移值，和该视频数据buffer的长度
 *         "code": 0, // 错误码
 *     }
 *  }
 *
 * @return {ArrayBuffer} 返回有效视频流数据
 */
function readStreamFromBuf(buffer: ArrayBuffer) {
    const dataView = new DataView(buffer)
    const encryptType = dataView.getUint32(0, true)
    const jsonOffset = encryptType === 0 ? 8 : 16
    const jsonLen = dataView.getUint32(4, true)
    const jsonBuf = buffer.slice(jsonOffset, jsonLen + jsonOffset)
    try {
        const json = JSON.parse(buffer2str(jsonBuf))
        // 先解析是否有错误码
        if (json.data.code && json.data.code !== 0) {
            ctx.postMessage({
                cmd: 'errorCode',
                code: json.data.code,
                taskID: json.data.task_id,
                url: json.url,
            })
            return null
        }
        const url = json.url
        let streamBufRange
        if (url === '/device/preview/data') {
            streamBufRange = json.data.live_stream_data.split(',')
        } else if (url === '/device/playback/data') {
            streamBufRange = json.data.playback_stream_data.split(',')
        }
        if (streamBufRange && streamBufRange.length > 0) {
            const start = streamBufRange[0] * 1 + jsonLen + jsonOffset
            const end = streamBufRange[1] * 1 + start
            return buffer.slice(start, end)
        } else {
            return null
        }
    } catch (error) {
        return null
    }
}

// 处理pos帧
function handlePosBuf() {
    const pCount = 3,
        pSize = 4
    let pBuffer: number | null = ctx.Module._malloc(pCount * pSize)
    const ret = ctx.Module._getPosInfo(handle, pBuffer, pCount)
    const pIntBuff = pBuffer >> 2
    const pArray = ctx.Module.HEAP32.subarray(pIntBuff, pIntBuff + pCount)
    const outArray = ctx.Module.HEAPU8.subarray(ret, ret + pArray[1])
    const arr = new Uint8Array(outArray)
    const posLength = pArray[0] // pos有效信息长度
    ctx.postMessage({
        cmd: 'getPosInfo',
        frame: arr.slice(0, posLength),
        posLength: pArray[0],
        frameTime: getRealTimestamp(pArray[1], pArray[2]),
    })
    ctx.Module._free(pBuffer)
    pBuffer = null
}

/**
 * 读取请求到的buffer, 分离出视频流buffer喂给wasm解码器
 * @param {Boolean} isPure 是否是纯视频流buffer, 如果为true, 则直接push给wasm（解析图片）
 * @param {Boolean} onlyForRecord 当前业务是否为纯录制
 */
function sendData(buffer: ArrayBuffer, isPure: boolean, onlyForRecord: boolean) {
    let streamBuf: ArrayBuffer | null = buffer
    if (!isPure) {
        streamBuf = readStreamFromBuf(buffer)
    }
    if (!streamBuf) {
        ctx.postMessage({ cmd: 'bufferError' })
        stopDecodeTimer()
        SEND_QUEUE.execute()
        return
    }
    const typedArray = new Uint8Array(streamBuf)
    if (typedArray.byteLength > chunkSize) {
        // buffer长度大于当前内存时, 重新分配内存空间
        ctx.Module._free(cacheBuffer)
        cacheBuffer = null
        chunkSize = typedArray.byteLength
        cacheBuffer = ctx.Module._malloc(chunkSize)
    }
    ctx.Module.HEAPU8.set(typedArray, cacheBuffer)
    const pCount = 7,
        pSize = 4
    let pBuffer: number | null = ctx.Module._malloc(pCount * pSize)
    const retCode = ctx.Module._pushWebAVPacket(handle, cacheBuffer, typedArray.length, 0, 0, onlyForRecord ? 1 : 0, pBuffer, pCount)
    RecordModule.checkFileSize()
    if (retCode === kErrorCode_Parse_FrameType_POS) {
        handlePosBuf()
        ctx.Module._free(pBuffer)
        pBuffer = null
        SEND_QUEUE.execute()
        return
    }
    if (!onlyForRecord && !RecordModule.recording) {
        ctx.Module._free(pBuffer)
        pBuffer = null
        SEND_QUEUE.execute()
        if (isPure) {
            decodeOneFrame()
        }
        return
    }
    const pIntBuff = pBuffer >> 2
    /**
     * _pushWebAVPacket返回的参数数组
     * pArray:
     * [0] frameIndex    帧索引
     * [1] pts1          相对时间戳1
     * [2] pts2          相对时间戳2
     * [3] type          0 video; 1 audio
     * [4] videoType     0 h264; 1 h265
     * [5] videoWidth    0表示和之前收到的width相同
     * [6] videoHeight   0表示和之前收到的height相同
     * [7] videoFormat   0表示N制, 1表示P制
     */
    let pArray: number[] | null = ctx.Module.HEAP32.subarray(pIntBuff, pIntBuff + pCount)
    if (pArray[3] === 1) {
        ctx.Module._free(pBuffer)
        pArray = null
        pBuffer = null
        SEND_QUEUE.execute()
        return
    }
    // 纯录制时通知帧索引
    if (onlyForRecord) {
        ctx.postMessage({
            cmd: 'frameIndex',
            frameIndex: pArray[0],
            frameTime: getRealTimestamp(pArray[1], pArray[2]),
        })
    }
    ctx.Module._free(pBuffer)
    // 视频码流类型或分辨率变化时，如果正在录像，则先停止再开始
    if (videoType < 0 && (pArray[4] === 0 || pArray[4] === 1)) {
        videoType = pArray[4]
    }
    if (videoWidth === 0 && pArray[5] !== 0) {
        videoWidth = pArray[5]
    }
    if (videoHeight === 0 && pArray[6] !== 0) {
        videoHeight = pArray[6]
    }
    const isVideoTypeChange = pArray[4] !== -1 && videoType !== pArray[4]
    const isVideoWidthChange = pArray[5] !== 0 && videoWidth !== pArray[5]
    const isVideoHeightChange = pArray[6] !== 0 && videoHeight !== pArray[6]
    const isChange = isVideoTypeChange || isVideoWidthChange || isVideoHeightChange
    if (isChange && RecordModule.type == 1) {
        videoType = pArray[4]
        videoWidth = pArray[5]
        videoHeight = pArray[6]
        RecordModule.stopRecord(true)
    }
    SEND_QUEUE.execute()
}

/**
 * 解码
 * paramArray:
 * [0] errorCode        错误码 0成功
 * [1] type             流类型 1视频 0音频
 * [2] len              yuv/pcm 数据长度
 * [3] pts1             相对时间戳1
 * [4] videoWidth       视频宽
 * [5] videoHeight      视频高
 * [6] audioChannels    音频通道数
 * [7] audioSampleRate  音频码率
 * [8] audioSampleFmt   音频格式 16/8bit
 * [9] pts2             相对时间戳2
 * [10] keyFrame        是否是关键帧
 * [11] frameIndex      帧索引
 * [12] watermarkLen    水印占字节长度, 水印buffer追加在YUVbuffer之后
 * [13] notDecodeNumber 未解码的帧数量
 * [14] frameType       帧类型, 4: 预解码, 只解码不播放
 */
function decodeFrame() {
    if (!decodeTimer) {
        return
    }
    const ret = ctx.Module._decodeFrame(handle, paramByteBuffer, MEMORY_PARAM_COUNT)
    const paramIntBuff = paramByteBuffer! >> 2
    const paramArray = ctx.Module.HEAP32.subarray(paramIntBuff, paramIntBuff + MEMORY_PARAM_COUNT)
    const outArray = ctx.Module.HEAPU8.subarray(ret, ret + paramArray[2] + paramArray[12])
    const arr = new Uint8Array(outArray)
    decodeTimer = setTimeout(function () {
        decodeFrame()
    }, 0)
    if (paramArray[0] !== 0) {
        // 当前帧解码失败
        ctx.postMessage({ cmd: 'frameError' }) // 获取关键帧失败时进行通知
        return
    }
    const type = paramArray[1]
    if (type === 1) {
        // 视频流
        const data = {
            buffer: arr,
            timestamp: paramArray[3],
            width: paramArray[4],
            height: paramArray[5],
            realTimestamp: getRealTimestamp(paramArray[3], paramArray[9]),
            keyFrame: paramArray[10],
            frameIndex: paramArray[11],
            yuvLen: paramArray[2],
            watermarkLen: paramArray[12],
            notDecodeNumber: paramArray[13],
            frameType: paramArray[14],
        }
        ctx.postMessage({ cmd: 'getVideoFrame', data: data })
    } else if (type === 0) {
        // 音频流
        const data = {
            buffer: arr,
            timestamp: paramArray[3],
            channels: paramArray[6],
            sampleRate: paramArray[7],
            sampleFmt: paramArray[8],
        }
        ctx.postMessage({ cmd: 'getAudioFrame', data: data })
    }
}

// 根据解码得到的两个相对时间戳求得真实时间戳
function getRealTimestamp(pts1: number, pts2: number) {
    return pts2 * 100000000 + pts1
}

/**
 * 销毁解码器实例
 */
function destroy() {
    // 销毁
    ctx.Module._destroyWebPlayer(handle)
    // 释放内存
    ctx.Module._free(paramByteBuffer)
    cacheBuffer = null
    paramByteBuffer = null
    stopDecodeTimer()
    RecordModule.destroy()
    SEND_QUEUE.init()
}

// 开启解码
function startDecodeTimer() {
    stopDecodeTimer()
    decodeTimer = 0
    decodeFrame()
}

// 仅仅解一帧
function decodeOneFrame() {
    startDecodeTimer()
    stopDecodeTimer()
}

// 关闭解码
function stopDecodeTimer() {
    clearTimeout(decodeTimer)
    decodeTimer = 0
}

// 清空wasm内部的缓存帧队列
function clearFrameList() {
    ctx.Module._clearPacketList(handle)
}

/**
 * 监听器
 */
ctx.onmessage = (e) => {
    const data = e.data
    switch (data.cmd) {
        case 'init':
            SEND_QUEUE.init()
            createDecoder(data.type)
            RecordModule.setMaxSingleSize(data.maxSingleSize)
            break
        case 'sendData':
            SEND_QUEUE.add(function () {
                sendData(data.buffer, data.isPure, data.onlyForRecord)
            })
            break
        case 'decodeFrame':
            startDecodeTimer()
            break
        case 'stopDecode':
            stopDecodeTimer()
            break
        case 'startRecord':
            RecordModule.startRecord()
            if (data.isExecuteSendQueue) SEND_QUEUE.executeNext()
            break
        case 'stopRecord':
            RecordModule.stopRecord(data.manul)
            break
        case 'clear':
            clearFrameList()
            break
        case 'destroy':
            destroy()
            break
        default:
            break
    }
}
