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
/* eslint-disable */
self.Module = {
  onRuntimeInitialized: function () {
    handleWasmLoaded()
  }
}

self.importScripts('./libffmpeg.js')

var chunkSize = 640 * 1024; // 默认分配640k内存缓存接受的流数据
var cacheBuffer = null; // 送帧内存指针
var MEMORY_PARAM_COUNT = 15; // 内存数组长度
var MEMORY_PARAM_SIZE = 4; // 数组参数占字节大小
var paramByteBuffer = null; // 读帧内存指针
var handle; // 解码器实例句柄
var decodeTimer = null
var DecodeInterval = 15
var videoType = -1
var videoWidth = 0
var videoHeight = 0
var kErrorCode_Parse_FrameType_POS = 12 // pos帧类型

/**
 * Uint8Array转字符串
 */ 
function Uint8ArrayToString (fileData) {
  var dataString = ''
  for (var i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i])
  }
  return dataString
}

/**
 * 分配送帧和读帧内存空间
 */ 
function setMalloc() {
  cacheBuffer = Module._malloc(chunkSize)
  paramByteBuffer = Module._malloc(MEMORY_PARAM_COUNT * MEMORY_PARAM_SIZE);
  Module._setLogLevel(0)
  Module._setLogMode(0)
}

/**
 * wasm加载完成时执行
 */ 
function handleWasmLoaded() {
  setMalloc()
  self.postMessage({ cmd: 'ready' })
}

/**
 * 创建解码器 type: 1现场 0回放
 */  
function createDecoder(type) {
  // 创建解码器句柄
  handle = Module._createWebPlayer(type)
  RecordModule.type = type
}

// arraybuffer转字符串
function buffer2str(buffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
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
function readStreamFromBuf(buffer) {
  var dataView = new DataView(buffer)
  var encryptType = dataView.getUint32(0, true)
  var jsonOffset = encryptType === 0 ? 8 : 16
  var jsonLen = dataView.getUint32(4, true)
  var jsonBuf = buffer.slice(jsonOffset, jsonLen + jsonOffset)
  try {
    var json = JSON.parse(buffer2str(jsonBuf))
    // 先解析是否有错误码
    if (json.data.code && json.data.code !== 0) {
      self.postMessage({
        cmd: 'errorCode',
        code: json.data.code,
        taskID: json.data.task_id,
        url: json.url
      })
      return null
    }
    var url = json.url, streamBufRange
    if (url === '/device/preview/data') {
      streamBufRange = json.data.live_stream_data.split(',')
    } else if (url === '/device/playback/data') {
      streamBufRange = json.data.playback_stream_data.split(',')
    }
    if (streamBufRange && streamBufRange.length > 0) {
      var start = streamBufRange[0] * 1 + jsonLen + jsonOffset
      var end = streamBufRange[1] * 1 + start
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
  var pCount = 3, pSize = 4
  var pBuffer = Module._malloc(pCount * pSize);
  var ret = Module._getPosInfo(handle, pBuffer, pCount)
  var pIntBuff = pBuffer >> 2;
  var pArray = Module.HEAP32.subarray(pIntBuff, pIntBuff + pCount);
  var outArray = Module.HEAPU8.subarray(ret, ret + pArray[1]);
  var arr = new Uint8Array(outArray);
  var posLength = pArray[0] // pos有效信息长度
  self.postMessage({
    cmd: 'getPosInfo',
    frame: arr.slice(0, posLength),
    posLength: pArray[0],
    frameTime: getRealTimestamp(pArray[1], pArray[2])
  })
  Module._free(pBuffer)
  pBuffer = null
}

/**
 * 读取请求到的buffer, 分离出视频流buffer喂给wasm解码器
 * @param {Boolean} isPure 是否是纯视频流buffer, 如果为true, 则直接push给wasm（解析图片）
 * @param {Boolean} onlyForRecord 当前业务是否为纯录制
 */
function sendData(buffer, isPure, onlyForRecord) {
  var streamBuf = buffer
  if (!isPure) {
    streamBuf = readStreamFromBuf(buffer)
  }
  if (!streamBuf) {
    self.postMessage({ cmd: 'bufferError' })
    stopDecodeTimer()
    SEND_QUEUE.execute()
    return
  }
  var typedArray = new Uint8Array(streamBuf)
  if (typedArray.byteLength > chunkSize) { // buffer长度大于当前内存时, 重新分配内存空间
    Module._free(cacheBuffer)
    cacheBuffer = null
    chunkSize = typedArray.byteLength
    cacheBuffer = Module._malloc(chunkSize)
  }
  Module.HEAPU8.set(typedArray, cacheBuffer)
  var pCount = 7, pSize = 4
  var pBuffer = Module._malloc(pCount * pSize)
  var retCode = Module._pushWebAVPacket(handle, cacheBuffer, typedArray.length, 0, 0, onlyForRecord ? 1 : 0, pBuffer, pCount)
  RecordModule.checkFileSize()
  if (retCode === kErrorCode_Parse_FrameType_POS) {
    handlePosBuf()
    Module._free(pBuffer)
    pBuffer = null
    SEND_QUEUE.execute()
    return
  }
  if (!onlyForRecord && !RecordModule.recording) {
    Module._free(pBuffer)
    pBuffer = null
    SEND_QUEUE.execute()
    if (isPure) {
      decodeOneFrame()
    }
    return
  }
  var pIntBuff = pBuffer >> 2;
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
  var pArray = Module.HEAP32.subarray(pIntBuff, pIntBuff + pCount);
  if (pArray[3] === 1) {
    Module._free(pBuffer)
    pArray = null
    pBuffer = null
    SEND_QUEUE.execute()
    return 
  }
  // 纯录制时通知帧索引
  if (onlyForRecord) {
    self.postMessage({
      cmd: 'frameIndex',
      frameIndex: pArray[0],
      frameTime: getRealTimestamp(pArray[1], pArray[2])
    })
  }
  Module._free(pBuffer)
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
  var isVideoTypeChange = pArray[4] !== -1 && videoType !== pArray[4]
  var isVideoWidthChange = pArray[5] !== 0 && videoWidth !== pArray[5]
  var isVideoHeightChange = pArray[6] !== 0 && videoHeight !== pArray[6]
  var isChange = isVideoTypeChange || isVideoWidthChange || isVideoHeightChange
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
  var ret = Module._decodeFrame(handle, paramByteBuffer, MEMORY_PARAM_COUNT)
  var paramIntBuff = paramByteBuffer >> 2;
  var paramArray = Module.HEAP32.subarray(paramIntBuff, paramIntBuff + MEMORY_PARAM_COUNT);
  var outArray = Module.HEAPU8.subarray(ret, ret + paramArray[2] + paramArray[12]);
  var arr = new Uint8Array(outArray);
  decodeTimer = setTimeout(function () {
    decodeFrame()
  }, 0)
  if (paramArray[0] !== 0) { // 当前帧解码失败
    self.postMessage({ cmd: 'frameError'}); // 获取关键帧失败时进行通知
    return
  }
  var type = paramArray[1]
  if (type === 1) { // 视频流
    var data = {
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
      frameType: paramArray[14]
    }
    self.postMessage({ cmd: 'getVideoFrame', data: data })
  } else if (type === 0) { // 音频流
    var data = {
      buffer: arr,
      timestamp: paramArray[3],
      channels: paramArray[6],
      sampleRate: paramArray[7],
      sampleFmt: paramArray[8]
    }
    self.postMessage({ cmd: 'getAudioFrame', data: data })
  }
}

// 根据解码得到的两个相对时间戳求得真实时间戳
function getRealTimestamp(pts1, pts2) {
  return pts2 * 100000000 + pts1
}

/* ------------------录像相关 start--------------------- */
var RecordModule = {
  MEMORY_PARAM_COUNT: 3,
  MEMORY_PARAM_SIZE: 4,
  chunkSize: 1024 * 1024, // 每次读取文件大小1M
  paramByteBuffer: null,
  manul: false, // 是否手动停止录像
  maxSingleSize: 1024 * 1024 * 10, // 单录像文件最大字节数, 默认10M
  readTimer: null,
  fileIndex: 0,
  recording: false,
  type: 1, // 1现场 0回放
  init: function () {
    RecordModule.paramByteBuffer = Module._malloc(RecordModule.MEMORY_PARAM_COUNT * RecordModule.MEMORY_PARAM_SIZE);
  },
  setMaxSingleSize: function (maxSingleSize) {
    if (maxSingleSize || maxSingleSize === 0) {
      RecordModule.maxSingleSize = maxSingleSize === 0 ? Infinity : maxSingleSize
    }
  },
  // 开始录像
  startRecord: function () {
    RecordModule.init()
    Module._startRecordAvi(handle, RecordModule.fileIndex)
    RecordModule.recording = true
    console.log('start record, fileIndex:', RecordModule.fileIndex)
  },
  // 停止录像
  stopRecord: function (manul) {
    RecordModule.recording = false
    RecordModule.manul = manul
    RecordModule.fileIndex++
    Module._stopRecordAvi(handle)
    console.log('end record, fileIndex:', RecordModule.fileIndex - 1)
    Module._openRecordAviFile(handle, RecordModule.fileIndex - 1)
    RecordModule.startReadTimer()
  },
  /**
   * 读取录像文件
   * paramArray:
   * [0] errorCode        错误码 0成功
   * [1] readSize         应读取长度
   * [2] realReadLen      实际读取长度
   */
  readRecFile: function () {
    if (!RecordModule.readTimer) {
      return
    }
    var ret = Module._readRecordAviFile(handle, RecordModule.paramByteBuffer, RecordModule.MEMORY_PARAM_COUNT, RecordModule.chunkSize)
    var paramIntBuff = RecordModule.paramByteBuffer >> 2;
    var paramArray = Module.HEAP32.subarray(paramIntBuff, paramIntBuff + RecordModule.MEMORY_PARAM_COUNT);
    var outArray = Module.HEAPU8.subarray(ret, ret + paramArray[2]);
    var arr = new Uint8Array(outArray);
    RecordModule.readTimer = setTimeout(function () {
      RecordModule.readRecFile()
    }, 0)
    if (paramArray[0] !== 0 && paramArray[1] == 0 && paramArray[2] == 0) { // 空录像文件
      RecordModule.stopReadTimer()
      console.log('file empty, fileIndex:', RecordModule.fileIndex - 1)
      self.postMessage({ cmd: 'getRecData', data: [], finished: true, manul: true, fileIndex: RecordModule.fileIndex - 1 })
      Module._delAviFile(handle, RecordModule.fileIndex - 1)
      return
    }
    var finished = paramArray[2] < paramArray[1]
    // console.log('file length should be read：', paramArray[1], ', file real length：', paramArray[2])
    self.postMessage({ cmd: 'getRecData', data: arr, finished: finished, manul: RecordModule.manul, fileIndex: RecordModule.fileIndex - 1 })
    if (finished) {
      RecordModule.stopReadTimer()
      console.log('end read recordFile, fileIndex:', RecordModule.fileIndex - 1)
      Module._delAviFile(handle, RecordModule.fileIndex - 1)
    }
  },
  // 检测已处理文件长度
  checkFileSize: function () {
    if (RecordModule.maxSingleSize === Infinity) {
      return
    }
    var fileSize = Module._getAviFileSize(handle)
    if (fileSize >= RecordModule.maxSingleSize && SEND_QUEUE.status === 'sending') {
      SEND_QUEUE.status = 'stop'
      self.postMessage({
        cmd: 'fileOverSize'
      })
    }
  },
  // 停止录像任务后，开启文件读取
  startReadTimer: function () {
    RecordModule.stopReadTimer()
    RecordModule.readTimer = true
    console.log('start read recordFile, fileIndex:', RecordModule.fileIndex - 1)
    RecordModule.readRecFile()
  },
  stopReadTimer: function () {
    clearTimeout(RecordModule.readTimer)
    RecordModule.readTimer = null
  },
  destroy: function () {
    Module._free(RecordModule.paramByteBuffer)
    RecordModule.paramByteBuffer = null
    RecordModule.fileIndex = 0
    RecordModule.stopReadTimer()
  }
}

/* ------------------录像相关 end--------------------- */

/**
 * 销毁解码器实例
 */
function destroy() {
  // 销毁
  Module._destroyWebPlayer(handle)
  // 释放内存
  Module._free(paramByteBuffer)
  cacheBuffer = null
  paramByteBuffer = null
  stopDecodeTimer()
  RecordModule.destroy()
  SEND_QUEUE.init()
}

// 开启解码
function startDecodeTimer() {
  stopDecodeTimer()
  decodeTimer = true
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
  decodeTimer = null
}

// 清空wasm内部的缓存帧队列
function clearFrameList() {
  Module._clearPacketList(handle)
}

/**
 * 监听器
 */
self.onmessage = function (e) {
  var data = e.data
  switch (data.cmd) {
    case 'init':
      SEND_QUEUE.init()
      createDecoder(data.type)
      RecordModule.setMaxSingleSize(data.maxSingleSize)
      break;
    case 'sendData':
      SEND_QUEUE.add(function() {
        sendData(data.buffer, data.isPure, data.onlyForRecord)
      })
      break;
    case 'decodeFrame':
      startDecodeTimer()
      break;
    case 'stopDecode':
      stopDecodeTimer()
      break;
    case 'startRecord':
      RecordModule.startRecord()
      if (data.isExecuteSendQueue) SEND_QUEUE.executeNext()
      break;
    case 'stopRecord':
      RecordModule.stopRecord(data.manul)
      break;
    case 'clear':
      clearFrameList()
      break;
    case 'destroy':
      destroy()
      break;
    default:
      break;
  }
}

// 缓存队列喂wasm数据（ws推流为异步任务, 而wasm同一时间只能执行一个方法）
var SEND_QUEUE = {
  status: 'sending', // 状态, sending/stop
  isFirstSend: true, // 是否第一次喂数据
  queue: [], // 推流队列
  retryIndex: 0, // 重试次数（喂数据比接收推流快时, 设置重试）
  retryTimer: null, // 重试定时器
  retryLimit: 6000, // 重试次数上限
  init: function () {
    SEND_QUEUE.status = 'sending'
    SEND_QUEUE.isFirstSend = true
    SEND_QUEUE.queue = []
    SEND_QUEUE.clearRetryTimer()
  },
  clearRetryTimer: function() {
    clearTimeout(SEND_QUEUE.retryTimer)
    SEND_QUEUE.retryTimer = null
  },
  add: function (callback) {
    SEND_QUEUE.queue.push(callback)
    if (SEND_QUEUE.isFirstSend) {
      SEND_QUEUE.isFirstSend = false
      SEND_QUEUE.execute()
    }
  },
  execute: function () {
    if (SEND_QUEUE.status !== 'sending') return
    if (SEND_QUEUE.queue.length === 0) {
      if (SEND_QUEUE.retryIndex < SEND_QUEUE.retryLimit) {
        SEND_QUEUE.retryIndex++
        SEND_QUEUE.clearRetryTimer()
        SEND_QUEUE.retryTimer = setTimeout(function() {
          SEND_QUEUE.execute()
        }, 100)
      } else {
        console.log('SEND_QUEUE no new Data in 10mins, sendData() fail')
      }
    } else {
      SEND_QUEUE.retryIndex = 0
      var callback = SEND_QUEUE.queue.shift()
      callback && callback()
    }
  },
  executeNext: function () {
    SEND_QUEUE.status = 'sending'
    SEND_QUEUE.execute()
  }
}