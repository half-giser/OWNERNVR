/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 11:18:21
 * @Description: websocket下载类
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-05-31 09:07:35
 */
import WebsocketBase from './websocketBase'
import { ErrorCode } from '../constants'
import { CMD_DOWNLOAD_FILE_OPEN, type CmdDownloadFileOpenOption, CMD_DOWNLOAD_CONFIRM_STEP, CMD_DOWNLOAD_FILE_CLOSE } from './websocketCmd'
import { appendBuffer, download } from '../tools'

export interface WebsocketDownloadOption {
    config: CmdDownloadFileOpenOption
    fileName: string
    success?: (param: ArrayBuffer) => void
    error?: (code: number) => void
}

export default class WebsocketDownload {
    private config: CmdDownloadFileOpenOption
    private fileName: string
    private fileBuffer: ArrayBuffer | null = null
    // private fileSize = 0
    private downloadIndex = 0
    // private oneDownloadNum = 8
    private ws: WebsocketBase | null = null
    private readonly successCallback: WebsocketDownloadOption['success']
    private readonly errorCallback: WebsocketDownloadOption['error']

    constructor(option: WebsocketDownloadOption) {
        this.config = option.config
        this.fileName = option.fileName
        this.successCallback = option.success
        this.errorCallback = option.error
        this.init()
    }

    private init() {
        this.ws = new WebsocketBase({
            onopen: () => {
                this.start()
            },
            onmessage: (data: string | ArrayBuffer) => {
                if (data instanceof ArrayBuffer) {
                    const fileBuffer = this.getFileBuffer(data)
                    this.writeFile(fileBuffer)
                } else {
                    const res = JSON.parse(data)
                    const resData = res.data || {}
                    const resBasic = res.basic || {}
                    const dataCode = Number(resData.code)
                    if (res.url === '/device/file/download/step') {
                        if (dataCode === ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED) {
                            // 文件流完成
                            this.download()
                        }
                    }
                    const code = dataCode || Number(resBasic.code)
                    if (code && code !== 0 && code !== ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED) {
                        this.errorCallback && this.errorCallback(code)
                    }
                }
            },
        })
    }

    private start() {
        const cmd = CMD_DOWNLOAD_FILE_OPEN(this.config)
        this.ws!.send(JSON.stringify(cmd))
    }

    // 解包，返回真正的文件buffer
    private getFileBuffer(data: ArrayBuffer) {
        const dataView = new DataView(data)
        const encryptType = dataView.getUint32(0, true)
        const jsonOffset = encryptType === 0 ? 8 : 16
        const jsonLen = dataView.getUint32(4, true)
        const jsonEndPosition = jsonLen + jsonOffset
        return data.slice(jsonEndPosition)
    }

    private writeFile(newBuf: ArrayBuffer) {
        this.downloadIndex++
        if (!this.fileBuffer) {
            this.fileBuffer = newBuf || null
            this.confirmStep()
            return
        }
        this.fileBuffer = appendBuffer(this.fileBuffer, newBuf)
        this.confirmStep()
    }

    // 确认下载帧
    private confirmStep() {
        const cmd = CMD_DOWNLOAD_CONFIRM_STEP(this.downloadIndex)
        this.ws!.send(JSON.stringify(cmd))
    }

    private download() {
        const blob = new Blob([this.fileBuffer as ArrayBuffer])
        download(blob, this.fileName)
        this.ws!.send(JSON.stringify(CMD_DOWNLOAD_FILE_CLOSE()))
        this.ws!.close()
        this.successCallback && this.successCallback(this.fileBuffer as ArrayBuffer)
    }
}
