/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 17:19:20
 * @Description: websocket上传类
 */

interface WebsocketUploadOption {
    config: CmdUploadFileOpenOption
    file: Blob
    success?: (param: any) => void
    progress?: (param: number) => void
    error?: (param: number) => void
}

export const WebsocketUpload = (option: WebsocketUploadOption) => {
    let ws: ReturnType<typeof WebsocketBase>

    const maxSingleSize = 50 * 1024 // 单个分片最大32k
    const oneUploadNum = 8 // 最大缓存分片数
    const packageArr: ArrayBuffer[] = [] // 需要上传的分片
    const uploadArr: number[] = [] // 上传队列(长度不超过this.oneUploadNum)
    let uploadIndex = 0 // 当前上传下标
    let fileBuffer: ArrayBuffer | null = null

    const config = option.config
    const file = option.file
    const successCallback = option.success
    const progressCallback = option.progress
    const errorCallback = option.error

    /**
     * @description
     * @param {ArrayBuffer} file
     * @returns {Promise<ArrayBuffer>}
     */
    const readFileInfo = (file: Blob) => {
        return new Promise((resolve: (buffer: ArrayBuffer) => void) => {
            const reader = new FileReader()
            reader.onload = (event) => {
                resolve(event.target!.result as ArrayBuffer)
            }
            reader.readAsArrayBuffer(file)
        })
    }

    const setWebsocket = () => {
        ws = WebsocketBase({
            onopen: () => {
                start()
            },
            onmessage: (data: string) => {
                try {
                    const res = JSON.parse(data)
                    const code = Number(res.basic.code)
                    if (res.url === '/device/file/upload/start#response' && code === 0) {
                        cutPackage(fileBuffer as ArrayBuffer)
                    }

                    if (res.url === '/device/file/upload/step#response' && code === 0) {
                        uploadArr.shift()
                        batchSend()
                        const step = Number(res.data.step)
                        progressCallback && progressCallback(step)
                        if (step === 100) {
                            endUpload()
                            return
                        }
                    }

                    if (res.url === '/device/file/upload/stop#response' && code === 0) {
                        // 文件成功上传完毕，断开连接
                        successCallback && successCallback(res.data)
                        ws?.close()
                    }

                    if (code !== 0) {
                        // 其他错误码时进行
                        errorCallback && errorCallback(code)
                        ws?.close()
                    }
                } catch (e) {}
            },
        })
    }

    const start = () => {
        const cmd = CMD_UPLOAD_FILE_OPEN(config)
        ws?.send(JSON.stringify(cmd))
    }

    /**
     * @description 裁剪文件成多份
     * @param {ArrayBuffer} buffer
     */
    const cutPackage = (buffer: ArrayBuffer) => {
        const cutNumber = Math.ceil(buffer.byteLength / maxSingleSize)
        for (let i = 0; i < cutNumber; i++) {
            const start = i * maxSingleSize
            const end = (i + 1) * maxSingleSize
            // 文件buffer
            const bufferSlice = buffer.slice(start, end)
            packageArr.push(bufferSlice)
        }
        if (packageArr.length) batchSend()
    }

    /**
     * @description 分批上传
     */
    const batchSend = () => {
        // 当上传队列不超过最大缓存分片 和 上传下标不超过分片数 时, 执行上传
        while (uploadArr.length < oneUploadNum && uploadIndex < packageArr.length) {
            uploadIndex++
            const packageIndex = uploadIndex - 1
            const byteLength = packageArr[packageIndex].byteLength
            const bufferSliceStr = '0,' + byteLength
            const json = CMD_UPLOAD_FILE_HEADER(uploadIndex, bufferSliceStr) // 通信的index从1开始
            sendPackage(json, packageArr[packageIndex])
            uploadArr.push(uploadIndex) // 通过上传下标来标识
        }
    }

    /**
     * @description 传输给服务端
     * @param {Object} json
     * @param {ArrayBuffer} bufferSlice
     */
    const sendPackage = (json: ReturnType<typeof CMD_UPLOAD_FILE_HEADER>, bufferSlice: ArrayBuffer) => {
        dataToBuffer(JSON.stringify(json)).then((jsonBuffer) => {
            // 包头buffer + jsonbuffer + 文件buffer
            const headerbuffer = buildHeader(json)
            const temp = appendBuffer(headerbuffer, jsonBuffer) as ArrayBuffer
            const combineBuffer = appendBuffer(temp, bufferSlice)
            ws?.send(combineBuffer)
        })
    }

    /**
     * @description 中断上传
     */
    const cancel = () => {
        // breakUpload = true
        const cmd = CMD_UPLOAD_FILE_CLOSE({
            reason: 'break',
        })
        ws?.send(JSON.stringify(cmd))
    }

    /**
     * @description 结束上传
     */
    const endUpload = () => {
        const cmd = CMD_UPLOAD_FILE_CLOSE({
            reason: 'finished',
            sign: MD5_encrypt(fileBuffer as ArrayBuffer),
        })
        ws?.send(JSON.stringify(cmd))
    }

    const close = () => {
        ws?.close()
    }

    readFileInfo(file).then((buffer) => {
        fileBuffer = buffer
        setWebsocket()
    })

    return {
        start,
        cancel,
        close,
    }
}
