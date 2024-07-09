/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 14:46:09
 * @Description: 生成视频文件 (串行处理，即一次只处理一个输出任务)
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-20 18:01:37
 */
import { appendBuffer } from '../tools'

export interface RecordBuilderOption {
    ready?: () => void
    maxSingleSize: number
    onFrameIndex?: (frameIndex: number, frameTime: number) => void
    onerror?: () => void
}

type DoneCallback = (recordFile: ArrayBuffer, manul: boolean, fileIndex: number) => void

export default class RecordBuilder {
    private type = 0 // 解码类型，0表示回放
    private doneCallback?: DoneCallback | null // 执行完录像录制任务后的回调
    private callbackQueue: DoneCallback[] = [] // 执行完录像录制任务后的回调队列
    private maxSingleSize = 0
    private decodeWorker?: Worker
    private recordFile: ArrayBuffer | null = null
    private readonly ready: RecordBuilderOption['ready']
    private readonly onFrameIndex: RecordBuilderOption['onFrameIndex']
    private readonly onerror: RecordBuilderOption['onerror']

    constructor(option: RecordBuilderOption) {
        this.ready = option.ready
        this.maxSingleSize = option.maxSingleSize
        this.onFrameIndex = option.onFrameIndex
        this.onerror = option.onerror
        this.initDecoder()
    }

    private initDecoder() {
        this.decodeWorker = new Worker(new URL('@/utils/wasmPlayer/decoder.js', import.meta.url), {
            type: 'classic',
        })
        this.decodeWorker.onmessage = (e: any) => {
            const data = e.data
            if (!(data && data.cmd)) {
                return
            }
            switch (data.cmd) {
                case 'ready':
                    this.decodeWorker!.postMessage({
                        cmd: 'init',
                        type: this.type,
                        maxSingleSize: this.maxSingleSize,
                    })
                    this.ready && this.ready()
                    break
                case 'frameIndex':
                    this.onFrameIndex && this.onFrameIndex(data.frameIndex, data.frameTime)
                    break
                case 'getRecData': // 获取到录像数据
                    this.onRecordData(data.data, data.finished, data.manul, data.fileIndex)
                    break
                case 'fileOverSize': // 检测到读取avi文件达到单个文件阈值时
                    this.onFileOverSize()
                    break
                case 'bufferError':
                    this.onerror && this.onerror()
                    break
                case 'errorCode':
                    this.handleErrorCode(data.code, data.url)
                    break
                default:
                    break
            }
        }
    }

    /**
     * @description 接收到录像时
     * @param {ArrayBuffer} data 录像数据
     * @param {boolean} finished 是否已结束
     * @param {boolean} manul 是否手动停止录像
     * @param {number} fileIndex 录像任务的第几个文件
     */
    private onRecordData(data: ArrayBuffer, finished: boolean, manul: boolean, fileIndex: number) {
        this.recordFile = appendBuffer(this.recordFile, data)
        if (!finished) return
        // 回调返回封装完格式的录像
        this.doneCallback && this.doneCallback(this.recordFile, manul, fileIndex)
        // manul为true则说明当前任务所有文件已处理完, 执行下一个任务
        if (manul) {
            this.execNextTask()
        }
        // 当前任务还有分批文件, 继续录像
        else {
            this.startRecord()
        }
        this.recordFile = null
    }

    /**
     * @description 已录制文件超过阈值时
     */
    private onFileOverSize() {
        this.stopRecord()
    }

    /**
     * @description 喂原始视频buffer
     * @param {ArrayBuffer} buffer
     */
    sendBuffer(buffer: ArrayBuffer) {
        this.decodeWorker!.postMessage({
            cmd: 'sendData',
            buffer: buffer,
            onlyForRecord: true,
        })
    }

    /**
     * @description 创建录像
     * @param {Function} doneCallback
     */
    createRecord(doneCallback: DoneCallback) {
        this.callbackQueue.push(doneCallback)
        if (this.callbackQueue.length === 1) {
            this.doneCallback = this.callbackQueue[0]
            this.startRecord()
        }
    }

    /**
     * @description 执行下一个任务
     */
    execNextTask() {
        this.callbackQueue.shift()
        this.execTask()
    }

    /**
     * @description 执行任务
     */
    execTask() {
        if (this.callbackQueue[0]) {
            this.doneCallback = this.callbackQueue[0]
            this.startRecord()
        }
    }

    /**
     * @description 开始录像
     */
    startRecord() {
        this.decodeWorker!.postMessage({
            cmd: 'startRecord',
            isExecuteSendQueue: true,
        })
    }

    /**
     * @description 结束录像
     * @param {Boolean} manul:是否手动停止
     */
    stopRecord(manul: boolean = false) {
        this.decodeWorker!.postMessage({
            cmd: 'stopRecord',
            manul: manul,
        })
    }

    /**
     * @description 销毁
     */
    destroy() {
        this.decodeWorker!.postMessage({
            cmd: 'destroy',
        })
        this.decodeWorker!.terminate()
        this.doneCallback = null
        this.callbackQueue = []
    }

    /**
     * @description 打印错误信息
     * @param {number} code
     * @param {string} url
     */
    handleErrorCode(code: number, url: string) {
        console.log(code, url)
    }
}
