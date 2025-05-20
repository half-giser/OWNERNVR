/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 10:47:27
 * @Description: 音频播放器
 */

/**
 * 音频播放器
 * 源码：@see https://github.com/samirkumardas/pcm-player
 * 关于Web Audio API 参考：
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
 */

export type PCMPlayerOptionEncoding = '8bitInt' | '16bitInt' | '32bitInt' | '32bitFloat'
export type TypedArrayConstructorType = Int8ArrayConstructor | Int16ArrayConstructor | Int32ArrayConstructor | Float32ArrayConstructor
export interface PCMPlayerOption {
    encoding: PCMPlayerOptionEncoding // 编码格式
    channels: number // 声道
    sampleRate: number // 采样率
    flushingTime: number // pcm数据刷新间隔
    volume: number // pcm初始化音量（0-1）
}

export const PCMPlayer = (options: PCMPlayerOption) => {
    const CACHE_BUFFER_NUM = 4000 // 缓存的buffer数量
    const encodings: Record<PCMPlayerOptionEncoding, number> = {
        '8bitInt': 128,
        '16bitInt': 32768,
        '32bitInt': 2147483648,
        '32bitFloat': 1,
    }
    const typedArrays: Record<PCMPlayerOptionEncoding, TypedArrayConstructorType> = {
        '8bitInt': Int8Array,
        '16bitInt': Int16Array,
        '32bitInt': Int32Array,
        '32bitFloat': Float32Array,
    }

    let option: PCMPlayerOption = {
        encoding: '16bitInt', // 编码格式
        channels: 1, // 声道
        sampleRate: 8000, // 采样率
        flushingTime: 1000, // pcm数据刷新间隔
        volume: 0.5, // pcm初始化音量（0-1）
    }

    option = {
        ...options,
        ...option,
    }

    const maxValue = encodings[option.encoding] ? encodings[option.encoding] : encodings['16bitInt']
    const typedArray = typedArrays[option.encoding] ? typedArrays[option.encoding] : typedArrays['16bitInt']
    const gainValue = option.volume
    const audioCtx = new AudioContext()
    const gainNode = audioCtx.createGain()
    gainNode.gain.value = gainValue
    gainNode.connect(audioCtx.destination)

    let samples = new Float32Array()
    let startTime = audioCtx.currentTime

    const isTypedArray = (data: Uint8Array) => {
        return data.byteLength && data.buffer && data.buffer.constructor === ArrayBuffer
    }

    /**
     * @description 播放原始pcm裸数据
     * @param {Uint8Array} obj
     */
    const feed = (obj: Uint8Array) => {
        if (!isTypedArray(obj)) return
        const data = getFormatedValue(obj)
        const tmp = new Float32Array(samples.length + data.length)
        tmp.set(samples, 0)
        tmp.set(data, samples.length)
        samples = tmp
        if (samples.length > CACHE_BUFFER_NUM) {
            // 累计到一定buffer，执行播放
            play(samples)
            samples = new Float32Array()
        }
    }

    const getFormatedValue = (obj: any) => {
        const data = new typedArray(obj.buffer)
        const float32 = new Float32Array(data.length)

        for (let i = 0; i < data.length; i++) {
            float32[i] = data[i] / maxValue
        }
        return float32
    }

    /**
     * @description 控制播放器音量, 取值范围0~1，0表示静音
     * PS:可设置增益值，即最大音量的倍数，取值范围-3.4 ~ 3.4，
     * 例如volume传值2 表示音量为最大音量的200%
     * @param {number} volume
     */
    const volume = (volume: number) => {
        gainNode.gain.value = volume
    }

    const destroy = () => {
        samples = new Float32Array()
        audioCtx.close()
    }

    const getTimestamp = () => {
        if (audioCtx) {
            return audioCtx.currentTime
        } else {
            return 0
        }
    }

    const play = (data: Float32Array) => {
        if (!data.length) return

        const bufferSource = audioCtx.createBufferSource()
        const length = data.length / option.channels
        const audioBuffer = audioCtx.createBuffer(option.channels, length, option.sampleRate)
        let audioData: Float32Array
        let offset: number
        let decrement: number

        for (let channel = 0; channel < option.channels; channel++) {
            audioData = audioBuffer.getChannelData(channel)
            offset = channel
            decrement = 50
            for (let i = 0; i < length; i++) {
                audioData[i] = data[offset]
                /* fadein */
                if (i < 50) {
                    audioData[i] = (audioData[i] * i) / 50
                }

                /* fadeout*/
                if (i >= length - 51) {
                    audioData[i] = (audioData[i] * decrement--) / 50
                }
                offset += option.channels
            }
        }

        if (startTime < audioCtx!.currentTime) {
            startTime = audioCtx!.currentTime
        }
        bufferSource.buffer = audioBuffer
        bufferSource.connect(gainNode!)
        bufferSource.start(startTime)
        startTime += audioBuffer.duration
    }

    const pause = () => {
        if (audioCtx.state === 'running') {
            audioCtx.suspend()
        }
    }

    const resume = () => {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume()
        }
    }

    return {
        feed,
        volume,
        destroy,
        play,
        pause,
        resume,
        getTimestamp,
    }
}
