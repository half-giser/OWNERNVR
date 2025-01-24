/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 18:07:24
 * @Description: 基于wasm的单帧图片渲染(串行处理，即一次只处理一张渲染)
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

export default function ImageRender(option: ImageRenderOption) {
    const type = 0 // 解码类型，0表示回放

    let curTask: TaskType // 执行完渲染后的回调
    let taskQueue: TaskType[] = [] // 执行完渲染后的回调队列

    const canvas: HTMLCanvasElement = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 200

    const ready = option.ready
    const onerror = option.onerror

    /**
     * @description 初始化解码线程
     */
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
                })
                ready && ready()
                break
            case 'getVideoFrame':
                renderVideoFrame(data.data)
                break
            case 'frameError':
            case 'bufferError':
                onerror && onerror()
                execNextTask()
                break
            case 'errorCode':
                onerror && onerror(data.code, data.url)
                execNextTask()
                break
            default:
                break
        }
    }

    /**
     * @description 初始化webgl渲染器
     */
    const webglPlayer = WebGLPlayer(canvas, {
        preserveDrawingBuffer: true,
    })

    /**
     * @description 渲染图像
     * @param {ImageRenderVideoFrame} frame
     */
    const renderVideoFrame = (frame: ImageRenderVideoFrame) => {
        if (!webglPlayer) {
            return
        }
        const buffer = new Uint8Array(frame.buffer)
        const videoBuffer = buffer.slice(0, frame.yuvLen)
        const yLength = frame.width * frame.height
        const uvLength = (frame.width / 2) * (frame.height / 2)
        webglPlayer.renderFrame(videoBuffer, frame.width, frame.height, yLength, uvLength)
        if (curTask && typeof curTask.cb === 'function') {
            // 回调返回图片url和帧毫秒时间戳；frameType===4为预解码帧，不渲染不统计
            curTask.cb(frame.frameType !== 4 ? getImgUrl() : 'preDecodedFrame', frame.realTimestamp)
            execNextTask()
        }
    }

    /**
     * @description 获取图片Base64格式数据
     * @returns {string{}
     */
    const getImgUrl = () => {
        const cav = document.createElement('canvas')
        cav.width = 800
        cav.height = 600
        const context = cav.getContext('2d')!
        context.drawImage(canvas, 0, 0, canvas.width, canvas.height)
        const dataURL = cav.toDataURL()
        return dataURL
    }

    /**
     * @description 渲染图像
     * @param {ArrayBuffer} buffer
     * @param {Function} doneCallback
     */
    const render = (buffer: ArrayBuffer, doneCallback: TaskType['cb']) => {
        taskQueue.push({
            buffer: buffer,
            cb: doneCallback,
        })
        if (taskQueue.length === 1) {
            execTask()
        }
    }

    /**
     * @description 执行任务
     */
    const execTask = () => {
        if (taskQueue[0]) {
            curTask = taskQueue[0]
            decodeWorker.postMessage({
                cmd: 'sendData',
                buffer: curTask.buffer,
                isPure: true,
            })
        }
    }

    /**
     * @description 执行下一个任务
     */
    const execNextTask = () => {
        taskQueue.shift()
        execTask()
    }

    /**
     * @description 销毁渲染器
     */
    const destroy = () => {
        decodeWorker.postMessage({
            cmd: 'destroy',
        })
        decodeWorker.terminate()
        webglPlayer.clear()
        taskQueue = []
    }

    return {
        render,
        destroy,
    }
}
