/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-04 20:27:19
 * @Description:
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-30 16:29:12
 */

/**
 * @description 合并buffer
 * @param {ArrayBuffer | null} buffer1
 * @param {ArrayBuffer} buffer2
 * @returns {ArrayBuffer}
 */
export const appendBuffer = (buffer1: ArrayBuffer | null, buffer2: ArrayBuffer) => {
    if (!buffer1) {
        return new Uint8Array(buffer2)
    } else {
        const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
        tmp.set(new Uint8Array(buffer1), 0)
        tmp.set(new Uint8Array(buffer2), buffer1.byteLength)
        return tmp.buffer
    }
}

/**
 * @description Uint8Array转字符串
 * 解决中文乱码问题: @see https://stackoverflow.com/questions/8936984/uint8array-to-string-in-javascript/22373197
 * @param {array} Uint8Array
 * @returns {string}
 */
export const Uint8ArrayToStr = (array: Uint8Array) => {
    let out = ''
    let i = 0
    const len = array.length
    let c: number
    let char2: number
    let char3: number
    while (i < len) {
        c = array[i++]
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c)
                break
            case 12:
            case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++]
                out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f))
                break
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++]
                char3 = array[i++]
                out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0))
                break
        }
    }
    return out
}

/**
 * @description buffer转base64
 * @param {ArrayBuffer} buffer
 * @returns {String}
 */
export const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
}

/**
 * @description js数据类型转buffer
 * data -> blob -> buffer
 * @param {*} json
 */
export const dataToBuffer = (data: any) => {
    return new Promise((resolve: (param: ArrayBuffer) => void) => {
        const blob = new Blob([data])
        const reader = new FileReader()
        reader.readAsArrayBuffer(blob)
        reader.onloadend = () => {
            const buffer = reader.result as ArrayBuffer
            resolve(buffer)
        }
    })
}

/**
 * 构建包头
 * @param {*} json
 * @returns {ArrayBuffer}
 */
export const buildHeader = (json: any) => {
    const buffer = new ArrayBuffer(8)
    const dataView = new DataView(buffer)
    dataView.setUint32(0, 0, true)
    dataView.setUint32(4, JSON.stringify(json).length, true)
    return dataView.buffer
}

/**
 * @description 获取图片Base64
 * @param buffer
 * @param streamBufRangeStr
 * @param jsonEndPosition
 * @returns {string}
 */
export const getPicBase64 = (buffer: ArrayBuffer, streamBufRangeStr: string, jsonEndPosition: number) => {
    const streamBufRange = streamBufRangeStr.split(',')
    if (streamBufRange && streamBufRange.length > 0) {
        const start = Number(streamBufRange[0]) + jsonEndPosition
        const end = Number(streamBufRange[1]) + start
        return arrayBufferToBase64(buffer.slice(start, end))
    } else {
        return null
    }
}

/**
 * @description Base64转文件
 * @param {String} base64
 * @param {String} fileName
 * @returns
 */
export const base64ToFile = (base64: string, fileName: string) => {
    const mime = fileName.split('.').pop()
    const bstr = window.atob(base64)
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], fileName, { type: mime })
}
