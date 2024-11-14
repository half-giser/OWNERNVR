/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 17:19:20
 * @Description: websocket上传类
 */

import WebsocketBase from './websocketBase'
import { CMD_UPLOAD_FILE_OPEN, type CmdUploadFileOpenOption, CMD_UPLOAD_FILE_HEADER, CMD_UPLOAD_FILE_CLOSE } from './websocketCmd'
import { dataToBuffer, appendBuffer, buildHeader } from '../tools'
import { MD5_encrypt } from '../encrypt'

interface WebsocketUploadOption {
    config: CmdUploadFileOpenOption
    file: Blob
    success?: (param: any) => void
    progress?: (param: number) => void
    error?: (param: number) => void
}

export default class WebsocketUpload {
    private ws?: WebsocketBase
    private config: CmdUploadFileOpenOption
    private file: Blob
    // private breakUpload = false
    private fileBuffer: ArrayBuffer | null = null
    private maxSingleSize = 50 * 1024 // 单个分片最大32k
    private oneUploadNum = 8 // 最大缓存分片数
    private packageArr: ArrayBuffer[] = [] // 需要上传的分片
    private uploadIndex = 0 // 当前上传下标
    private uploadArr: number[] = [] // 上传队列(长度不超过this.oneUploadNum)
    private readonly successCallback: WebsocketUploadOption['success']
    private readonly progressCallback: WebsocketUploadOption['progress']
    private readonly errorCallback: WebsocketUploadOption['error']

    constructor(option: WebsocketUploadOption) {
        this.config = option.config
        this.file = option.file
        this.successCallback = option.success
        this.progressCallback = option.progress
        this.errorCallback = option.error
        this.init()
    }

    private init() {
        this.readFileInfo(this.file).then((buffer) => {
            this.fileBuffer = buffer
            this.setWebsocket()
        })
    }

    /**
     * @description
     * @param {ArrayBuffer} file
     * @returns {Promise<ArrayBuffer>}
     */
    private readFileInfo(file: Blob) {
        return new Promise((resolve: (buffer: ArrayBuffer) => void) => {
            const reader = new FileReader()
            reader.onload = (event) => {
                resolve(event.target!.result as ArrayBuffer)
            }
            reader.readAsArrayBuffer(file)
        })
    }

    private setWebsocket() {
        this.ws = new WebsocketBase({
            onopen: () => {
                this.start()
            },
            onmessage: (data: string) => {
                try {
                    const res = JSON.parse(data)
                    const code = Number(res.basic.code)
                    if (res.url === '/device/file/upload/start#response' && code === 0) {
                        this.cutPackage(this.fileBuffer as ArrayBuffer)
                    }

                    if (res.url === '/device/file/upload/step#response' && code === 0) {
                        this.uploadArr.shift()
                        this.batchSend()
                        const step = Number(res.data.step)
                        this.progressCallback && this.progressCallback(step)
                        if (step === 100) {
                            this.endUpload()
                            return
                        }
                    }

                    if (res.url === '/device/file/upload/stop#response' && code === 0) {
                        // 文件成功上传完毕，断开连接
                        this.successCallback && this.successCallback(res.data)
                        this.ws!.close()
                    }

                    if (code !== 0) {
                        // 其他错误码时进行
                        this.errorCallback && this.errorCallback(code)
                        this.ws!.close()
                    }
                } catch (e) {}
            },
        })
    }

    start() {
        const cmd = CMD_UPLOAD_FILE_OPEN(this.config)
        this.ws!.send(JSON.stringify(cmd))
    }

    /**
     * @description 裁剪文件成多份
     * @param {ArrayBuffer} buffer
     */
    cutPackage(buffer: ArrayBuffer) {
        const cutNumber = Math.ceil(buffer.byteLength / this.maxSingleSize)
        for (let i = 0; i < cutNumber; i++) {
            const start = i * this.maxSingleSize
            const end = (i + 1) * this.maxSingleSize
            // 文件buffer
            const bufferSlice = buffer.slice(start, end)
            this.packageArr.push(bufferSlice)
        }
        if (this.packageArr.length) this.batchSend()
    }

    /**
     * @description 分批上传
     */
    batchSend() {
        // 当上传队列不超过最大缓存分片 和 上传下标不超过分片数 时, 执行上传
        while (this.uploadArr.length < this.oneUploadNum && this.uploadIndex < this.packageArr.length) {
            this.uploadIndex++
            const packageIndex = this.uploadIndex - 1
            const byteLength = this.packageArr[packageIndex].byteLength
            const bufferSliceStr = '0,' + byteLength
            const json = CMD_UPLOAD_FILE_HEADER(this.uploadIndex, bufferSliceStr) // 通信的index从1开始
            this.sendPackage(json, this.packageArr[packageIndex])
            this.uploadArr.push(this.uploadIndex) // 通过上传下标来标识
        }
    }

    /**
     * @description 传输给服务端
     * @param {Object} json
     * @param {ArrayBuffer} bufferSlice
     */
    sendPackage(json: ReturnType<typeof CMD_UPLOAD_FILE_HEADER>, bufferSlice: ArrayBuffer) {
        dataToBuffer(JSON.stringify(json)).then((jsonBuffer) => {
            // 包头buffer + jsonbuffer + 文件buffer
            const headerbuffer = buildHeader(json)
            const temp = appendBuffer(headerbuffer, jsonBuffer)
            const combineBuffer = appendBuffer(temp, bufferSlice)
            this.ws!.send(combineBuffer)
        })
    }

    /**
     * @description 中断上传
     */
    cancel() {
        // this.breakUpload = true
        const cmd = CMD_UPLOAD_FILE_CLOSE({
            reason: 'break',
        })
        this.ws!.send(JSON.stringify(cmd))
    }

    /**
     * @description 结束上传
     */
    endUpload() {
        const cmd = CMD_UPLOAD_FILE_CLOSE({
            reason: 'finished',
            sign: MD5_encrypt(this.fileBuffer as ArrayBuffer),
        })
        this.ws!.send(JSON.stringify(cmd))
    }

    close() {
        this.ws?.close()
    }
}
