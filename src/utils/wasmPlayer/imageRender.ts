/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 18:07:24
 * @Description: 基于wasm的单帧图片渲染(串行处理，即一次只处理一张渲染)
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-09 11:52:40
 */
import WebGLPlayer from './webglPlayer'

export interface ImageRenderOption {
    ready?: () => void
    onerror?: (code?: number, url?: string) => void
}

interface ImageRenderVideoFrame {
    buffer: ArrayBuffer
    timestamp: number
    width: number
    height: number
    realTimestamp: number
    keyFrame: number
    frameIndex: number
    yuvLen: number
    watermarkLen: number
    notDecodeNumber: number
    frameType: number
}

type TaskType = {
    buffer: ArrayBuffer
    cb: (str: string, realTimestamp: number) => void
}

export default class ImageRender {
    private type = 0 // 解码类型，0表示回放
    private curTask?: TaskType // 执行完渲染后的回调
    private taskQueue: TaskType[] = [] // 执行完渲染后的回调队列
    private canvas: HTMLCanvasElement = document.createElement('canvas')
    private webglPlayer?: WebGLPlayer
    private decodeWorker?: Worker
    private readonly ready: ImageRenderOption['ready']
    private readonly onerror: ImageRenderOption['onerror']

    constructor(option: ImageRenderOption) {
        this.ready = option.ready
        this.onerror = option.onerror
        this.initDecoder()
        this.initWebglPlayer()
    }

    /**
     * @description 初始化解码线程
     */
    private initDecoder() {
        this.decodeWorker = new Worker('/workers/decoder.js', {
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
                    })
                    this.ready && this.ready()
                    break
                case 'getVideoFrame':
                    this.renderVideoFrame(data.data)
                    break
                case 'frameError':
                case 'bufferError':
                    this.onerror && this.onerror()
                    this.execNextTask()
                    break
                case 'errorCode':
                    this.onerror && this.onerror(data.code, data.url)
                    this.execNextTask()
                    break
                default:
                    break
            }
        }
    }

    /**
     * @description 初始化webgl渲染器
     */
    private initWebglPlayer() {
        this.canvas.width = 200
        this.canvas.height = 200
        this.webglPlayer = new WebGLPlayer(this.canvas, {
            preserveDrawingBuffer: true,
        })
    }

    /**
     * @description 渲染图像
     * @param {ImageRenderVideoFrame} frame
     */
    renderVideoFrame(frame: ImageRenderVideoFrame) {
        if (!this.webglPlayer) {
            return
        }
        const buffer = new Uint8Array(frame.buffer)
        const videoBuffer = buffer.slice(0, frame.yuvLen)
        const yLength = frame.width * frame.height
        const uvLength = (frame.width / 2) * (frame.height / 2)
        this.webglPlayer.renderFrame(videoBuffer, frame.width, frame.height, yLength, uvLength)
        if (this.curTask && typeof this.curTask.cb === 'function') {
            // 回调返回图片url和帧毫秒时间戳；frameType===4为预解码帧，不渲染不统计
            this.curTask.cb(frame.frameType !== 4 ? this.getImgUrl() : 'preDecodedFrame', frame.realTimestamp)
            this.execNextTask()
        }
    }

    /**
     * @description 获取图片Base64格式数据
     * @returns {string{}
     */
    getImgUrl() {
        const canvas = document.createElement('canvas')
        canvas.width = 800
        canvas.height = 600
        const context = canvas.getContext('2d')!
        context.drawImage(this.canvas, 0, 0, canvas.width, canvas.height)
        const dataURL = canvas.toDataURL()
        return dataURL
    }

    /**
     * @description 渲染图像
     * @param {ArrayBuffer} buffer
     * @param {Function} doneCallback
     */
    render(buffer: ArrayBuffer, doneCallback: TaskType['cb']) {
        this.taskQueue.push({
            buffer: buffer,
            cb: doneCallback,
        })
        if (this.taskQueue.length === 1) {
            this.execTask()
        }
    }

    /**
     * @description 执行任务
     */
    execTask() {
        if (this.taskQueue[0]) {
            this.curTask = this.taskQueue[0]
            this.decodeWorker!.postMessage({
                cmd: 'sendData',
                buffer: this.curTask.buffer,
                isPure: true,
            })
        }
    }

    /**
     * @description 执行下一个任务
     */
    execNextTask() {
        this.taskQueue.shift()
        this.execTask()
    }

    /**
     * @description 销毁渲染器
     */
    destroy() {
        this.decodeWorker!.postMessage({
            cmd: 'destroy',
        })
        this.decodeWorker!.terminate()
        this.webglPlayer?.clear()
        delete this.webglPlayer
        delete this.curTask
        this.taskQueue = []
    }
}
