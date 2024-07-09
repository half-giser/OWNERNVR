/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 10:47:27
 * @Description: 音频播放器
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-20 18:19:05
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

export default class PCMPlayer {
    private readonly CACHE_BUFFER_NUM = 4000 // 缓存的buffer数量
    private option: PCMPlayerOption = {
        encoding: '16bitInt', // 编码格式
        channels: 1, // 声道
        sampleRate: 8000, // 采样率
        flushingTime: 1000, // pcm数据刷新间隔
        volume: 0.5, // pcm初始化音量（0-1）
    }
    private samples: Float32Array
    private audioCtx?: AudioContext
    private gainNode?: GainNode
    private startTime = 0
    private maxValue: number
    private typedArray: TypedArrayConstructorType
    private gainValue: number

    constructor(option: PCMPlayerOption) {
        this.option = {
            ...this.option,
            ...option,
        }
        this.samples = new Float32Array()
        this.flush = this.flush.bind(this)
        // this.interval = setInterval(this.flush, this.option.flushingTime); // 源代码是通过flush方法播放，这里改写为用自定义play方法
        this.maxValue = this.getMaxValue()
        this.typedArray = this.getTypedArray()
        this.gainValue = this.option.volume
        this.createContext()
    }

    getMaxValue() {
        const encodings: Record<PCMPlayerOptionEncoding, number> = {
            '8bitInt': 128,
            '16bitInt': 32768,
            '32bitInt': 2147483648,
            '32bitFloat': 1,
        }

        return encodings[this.option.encoding] ? encodings[this.option.encoding] : encodings['16bitInt']
    }

    getTypedArray() {
        const typedArrays: Record<PCMPlayerOptionEncoding, TypedArrayConstructorType> = {
            '8bitInt': Int8Array,
            '16bitInt': Int16Array,
            '32bitInt': Int32Array,
            '32bitFloat': Float32Array,
        }

        return typedArrays[this.option.encoding] ? typedArrays[this.option.encoding] : typedArrays['16bitInt']
    }

    createContext() {
        this.audioCtx = new AudioContext()
        this.gainNode = this.audioCtx.createGain()
        this.gainNode.gain.value = this.gainValue
        this.gainNode.connect(this.audioCtx.destination)
        this.startTime = this.audioCtx.currentTime
    }

    isTypedArray(data: Uint8Array) {
        return data.byteLength && data.buffer && data.buffer.constructor == ArrayBuffer
    }

    /**
     * @description 播放原始pcm裸数据
     * @param {Uint8Array} obj
     */
    feed(obj: Uint8Array) {
        if (!this.isTypedArray(obj)) return
        const data = this.getFormatedValue(obj)
        const tmp = new Float32Array(this.samples.length + data.length)
        tmp.set(this.samples, 0)
        tmp.set(data, this.samples.length)
        this.samples = tmp
        if (this.samples.length > this.CACHE_BUFFER_NUM) {
            // 累计到一定buffer，执行播放
            this.play(this.samples)
            this.samples = new Float32Array()
        }
    }

    getFormatedValue(obj: any) {
        const data = new this.typedArray(obj.buffer)
        const float32 = new Float32Array(data.length)

        for (let i = 0; i < data.length; i++) {
            float32[i] = data[i] / this.maxValue
        }
        return float32
    }

    /**
     * @description 控制播放器音量, 取值范围0~1，0表示静音
     * PS:可设置增益值，即最大音量的倍数，取值范围-3.4 ~ 3.4，
     * 例如volume传值2 表示音量为最大音量的200%
     * @param {number} volume
     */
    volume(volume: number) {
        this.gainNode!.gain.value = volume
    }

    destroy() {
        this.samples = new Float32Array()
        this.audioCtx?.close()
        delete this.audioCtx
    }

    flush() {
        if (!this.samples.length) return
        const bufferSource = this.audioCtx!.createBufferSource()
        const length = this.samples.length / this.option.channels
        const audioBuffer = this.audioCtx!.createBuffer(this.option.channels, length, this.option.sampleRate)
        let audioData: Float32Array
        let offset: number
        let decrement: number

        for (let channel = 0; channel < this.option.channels; channel++) {
            audioData = audioBuffer.getChannelData(channel)
            offset = channel
            decrement = 50
            for (let i = 0; i < length; i++) {
                audioData[i] = this.samples[offset]
                /* fadein */
                if (i < 50) {
                    audioData[i] = (audioData[i] * i) / 50
                }
                /* fadeout*/
                if (i >= length - 51) {
                    audioData[i] = (audioData[i] * decrement--) / 50
                }
                offset += this.option.channels
            }
        }

        if (this.startTime < this.audioCtx!.currentTime) {
            this.startTime = this.audioCtx!.currentTime
        }
        bufferSource.buffer = audioBuffer
        bufferSource.connect(this.gainNode!)
        bufferSource.start(this.startTime)
        this.startTime += audioBuffer.duration
        this.samples = new Float32Array()
    }

    getTimestamp() {
        if (this.audioCtx) {
            return this.audioCtx.currentTime
        } else {
            return 0
        }
    }

    play(data: Float32Array) {
        if (!data.length) return

        const bufferSource = this.audioCtx!.createBufferSource()
        const length = data.length / this.option.channels
        const audioBuffer = this.audioCtx!.createBuffer(this.option.channels, length, this.option.sampleRate)
        let audioData: Float32Array
        let offset: number
        let decrement: number

        for (let channel = 0; channel < this.option.channels; channel++) {
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
                offset += this.option.channels
            }
        }

        if (this.startTime < this.audioCtx!.currentTime) {
            this.startTime = this.audioCtx!.currentTime
        }
        bufferSource.buffer = audioBuffer
        bufferSource.connect(this.gainNode!)
        bufferSource.start(this.startTime)
        this.startTime += audioBuffer.duration
    }

    pause() {
        if (this.audioCtx?.state === 'running') {
            this.audioCtx.suspend()
        }
    }

    resume() {
        if (this.audioCtx?.state === 'suspended') {
            this.audioCtx.resume()
        }
    }
}
