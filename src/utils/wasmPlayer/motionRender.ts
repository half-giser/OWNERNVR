/*
 * @Date: 2025-04-28 17:06:39
 * @Description: 基于wasm的单帧图片渲染(串行处理，即一次只处理一张渲染)
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import { type WebsocketMotionDto } from '../websocket/websocketMotion'

interface WasmMotionRenderOption {
    ready?: () => void
    // 待完善类型信息
    onmotion?: (data: WebsocketMotionDto) => void
    onerror?: (code?: number, url?: string) => void
}

export const WasmMotionRender = (option: WasmMotionRenderOption) => {
    const type = 0 // 解码类型，0表示回放

    const ready = option.ready
    const onmotion = option.onmotion
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
            case 'getParamInfo':
                onparam(data.type, data.data)
                break
            case 'frameError':
            case 'bufferError':
                onerror && onerror()
                break
            case 'errorCode':
                onerror && onerror(data.code, data.url)
                break
            default:
                break
        }
    }

    /**
     * 解码后的motion数据
     */
    const onparam = (type: string, data: WebsocketMotionDto) => {
        // motion
        if (type === 'motion_info') {
            onmotion && onmotion(data)
        }
    }

    /**
     * 解码motion帧数据
     */
    const decoderMotion = (buffer: ArrayBuffer) => {
        decodeWorker.postMessage({
            cmd: 'sendData',
            buffer: buffer,
        })
    }

    /**
     * 销毁渲染器
     */
    const destroy = () => {
        decodeWorker.postMessage({
            cmd: 'destroy',
        })
        decodeWorker.terminate()
    }

    return {
        decoderMotion,
        destroy,
    }
}
