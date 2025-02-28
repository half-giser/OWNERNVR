/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 11:18:21
 * @Description: websocket下载类
 */

export interface WebsocketDownloadOption {
    config: CmdDownloadFileOpenOption
    fileName: string
    success?: (param: ArrayBuffer) => void
    error?: (code: number) => void
}

export const WebsocketDownload = (option: WebsocketDownloadOption) => {
    let fileBuffer: ArrayBuffer | null = null
    let downloadIndex = 0

    const config = option.config
    const fileName = option.fileName
    const successCallback = option.success
    const errorCallback = option.error

    const ws = WebsocketBase({
        onopen: () => {
            start()
        },
        onmessage: (data: string | ArrayBuffer) => {
            if (data instanceof ArrayBuffer) {
                const fileBuffer = getFileBuffer(data)
                writeFile(fileBuffer)
            } else {
                const res = JSON.parse(data)
                const resData = res.data || {}
                const resBasic = res.basic || {}
                const dataCode = Number(resData.code)
                if (res.url === '/device/file/download/step') {
                    if (dataCode === ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED) {
                        // 文件流完成
                        handleDownload()
                    }
                }
                const code = dataCode || Number(resBasic.code)
                if (code && code !== 0 && code !== ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED) {
                    errorCallback && errorCallback(code)
                }
            }
        },
    })

    const start = () => {
        const cmd = CMD_DOWNLOAD_FILE_OPEN(config)
        ws.send(JSON.stringify(cmd))
    }

    /**
     * @description 解包，返回真正的文件buffer
     * @param {ArrayBuffer} data
     * @returns {ArrayBuffer}
     */
    const getFileBuffer = (data: ArrayBuffer) => {
        const dataView = new DataView(data)
        const encryptType = dataView.getUint32(0, true)
        const jsonOffset = encryptType === 0 ? 8 : 16
        const jsonLen = dataView.getUint32(4, true)
        const jsonEndPosition = jsonLen + jsonOffset
        return data.slice(jsonEndPosition)
    }

    /**
     * @description
     * @param {ArrayBuffer} newBuf
     */
    const writeFile = (newBuf: ArrayBuffer) => {
        downloadIndex++
        if (!fileBuffer) {
            fileBuffer = newBuf || null
            confirmStep()
            return
        }
        fileBuffer = appendBuffer(fileBuffer as ArrayBuffer, newBuf)
        confirmStep()
    }

    /**
     * @description 确认下载帧
     */
    const confirmStep = () => {
        const cmd = CMD_DOWNLOAD_CONFIRM_STEP(downloadIndex)
        ws.send(JSON.stringify(cmd))
    }

    const handleDownload = () => {
        const blob = new Blob([fileBuffer as ArrayBuffer])
        download(blob, fileName)
        ws.send(JSON.stringify(CMD_DOWNLOAD_FILE_CLOSE()))
        ws.close()
        successCallback && successCallback(fileBuffer as ArrayBuffer)
    }
}
