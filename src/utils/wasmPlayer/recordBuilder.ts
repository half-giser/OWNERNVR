/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 14:46:09
 * @Description: 生成视频文件 (串行处理，即一次只处理一个输出任务)
 */
export interface WasmRecordBuilderOption {
    ready?: () => void
    maxSingleSize: number
    onFrameIndex?: (frameIndex: number, frameTime: number) => void
    onerror?: () => void
}

type DoneCallback = (recordFile: ArrayBuffer, manul: boolean) => void

export const WasmRecordBuilder = (option: WasmRecordBuilderOption) => {
    const type = 0 // 解码类型，0表示回放

    let doneCallback: DoneCallback | null = null // 执行完录像录制任务后的回调
    let callbackQueue: DoneCallback[] = [] // 执行完录像录制任务后的回调队列
    let recordFile: ArrayBuffer | null = null

    const ready = option.ready
    const maxSingleSize = option.maxSingleSize
    const onFrameIndex = option.onFrameIndex
    const onerror = option.onerror

    const decodeWorker = new Worker('/workers/decoder.js', {
        type: 'classic',
    })

    decodeWorker.onmessage = (e: any) => {
        const data = e.data
        if (!(data && data.cmd)) {
            return
        }

        switch (data.cmd) {
            case 'ready':
                decodeWorker.postMessage({
                    cmd: 'init',
                    type: type,
                    maxSingleSize: maxSingleSize,
                })
                ready && ready()
                break
            case 'frameIndex':
                onFrameIndex && onFrameIndex(data.frameIndex, data.frameTime)
                break
            case 'getRecData': // 获取到录像数据
                onRecordData(data.data, data.finished, data.manul)
                break
            case 'fileOverSize': // 检测到读取avi文件达到单个文件阈值时
                onFileOverSize()
                break
            case 'bufferError':
                onerror && onerror()
                break
            case 'errorCode':
                handleErrorCode(data.code, data.url)
                break
            default:
                break
        }
    }

    /**
     * @description 接收到录像时
     * @param {ArrayBuffer} data 录像数据
     * @param {boolean} finished 是否已结束
     * @param {boolean} manul 是否手动停止录像
     */
    const onRecordData = (data: ArrayBuffer, finished: boolean, manual: boolean) => {
        recordFile = appendBuffer(recordFile, data) as ArrayBuffer
        if (!finished) {
            return
        }

        // 回调返回封装完格式的录像
        doneCallback && doneCallback(recordFile, manual)

        if (manual) {
            // 此处说明当前任务已处理完, 则执行下一个
            execNextTask()
        }

        recordFile = null
    }

    /**
     * @description 已录制文件超过阈值时
     */
    const onFileOverSize = () => {
        stopRecord()
    }

    /**
     * @description 喂原始视频buffer
     * @param {ArrayBuffer} buffer
     */
    const sendBuffer = (buffer: ArrayBuffer, isPure = false) => {
        decodeWorker.postMessage({
            cmd: 'sendData',
            buffer: buffer,
            isPure,
            onlyForRecord: true,
        })
    }

    /**
     * @description 创建录像
     * @param {Function} doneCallback
     */
    const startRecord = (doneCallback: DoneCallback) => {
        callbackQueue.push(doneCallback)
        if (callbackQueue.length === 1) {
            execTask()
        }
    }

    /**
     * @description 执行任务
     */
    const execTask = () => {
        if (callbackQueue[0]) {
            doneCallback = callbackQueue[0]
            decodeWorker.postMessage({
                cmd: 'startRecord',
            })
        }
    }

    /**
     * @description 执行下一个任务
     */
    const execNextTask = () => {
        callbackQueue.shift()
        execTask()
    }

    /**
     * @description 结束录像
     * @param {Boolean} manul:是否手动停止
     */
    const stopRecord = (manul: boolean = false) => {
        decodeWorker.postMessage({
            cmd: 'stopRecord',
            manul: manul,
        })
    }

    /**
     * @description 销毁
     */
    const destroy = () => {
        decodeWorker.postMessage({
            cmd: 'destroy',
        })
        decodeWorker.terminate()
        doneCallback = null
        callbackQueue = []
    }

    /**
     * @description 打印错误信息
     * @param {number} code
     * @param {string} url
     */
    const handleErrorCode = (code: number, url: string) => {
        console.log(code, url)
    }

    return {
        sendBuffer,
        startRecord,
        stopRecord,
        destroy,
    }
}
