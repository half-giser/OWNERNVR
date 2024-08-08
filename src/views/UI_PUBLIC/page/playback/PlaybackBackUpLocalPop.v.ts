/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:35:59
 * @Description: 回放-本地备份任务 进度弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-08 13:56:50
 */
import type { PlaybackBackUpRecList } from '@/types/apiType/playback'
import WebsocketRecordBackup, { type WebsocketRecordBackupOnMessageParam } from '@/utils/websocket/websocketRecordBackup'

export default defineComponent({
    props: {
        auth: {
            type: Object as PropType<UserChlAuth>,
            required: true,
        },
        backupList: {
            type: Array as PropType<PlaybackBackUpRecList[]>,
            required: true,
        },
        maxSingleSize: {
            type: Number,
            required: false,
            default: 10 * 1024 * 1024,
        },
    },
    emits: {
        close() {
            return true
        },
        error(errorMsg: string[]) {
            return errorMsg
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()

        let recorder: WebsocketRecordBackup | null = null

        const pageData = ref({
            // 下载进度
            progress: 0,
            // 当前任务
            currentTask: 0,
            // 任务总数
            totalTask: 0,
        })

        /**
         * @description 关闭弹窗，停止下载
         */
        const close = () => {
            destroy()
            ctx.emit('close')
        }

        /**
         * @description 开启弹窗，开始下载
         */
        const open = () => {
            if (isHttpsLogin()) {
                ctx.emit('error', [formatHttpsTips(Translate('IDCS_LOCAL_BACKUP'))])
                return
            }
            destroy()
            recorder = new WebsocketRecordBackup({
                maxSingleSize: prop.maxSingleSize,
                onmessage: handleRecordFile,
                onFrameTime: handleFrameTime,
                onerror: handleError,
            })
            const list = prop.backupList.map((item) => {
                return {
                    chlID: item.chlId,
                    startTime: item.startTime / 1000,
                    endTime: item.endTime / 1000,
                    backupVideo: true, // 对应backup字段: true->开启备份任务, false->开启回放任务（所以备份时写死为true）
                    backupAudio: prop.auth.audio[item.chlId],
                    streamType: item.streamType,
                }
            })
            recorder.start(list)
        }

        /**
         * @description 处理录像文件回调，下载文件
         * @param {Object} data
         */
        const handleRecordFile = (data: WebsocketRecordBackupOnMessageParam) => {
            handleDownloadFile(data)

            if (!data.finished) {
                return
            }
            openMessageTipBox({
                type: 'success',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_BACKUP_SUCCESS'),
            }).finally(() => {
                close()
            })
        }

        /**
         * @description 下载文件到本地
         * @param {Object} data
         */
        const handleDownloadFile = (data: WebsocketRecordBackupOnMessageParam) => {
            if (!data.file?.byteLength) {
                return
            }
            const item = prop.backupList[data.taskIndex]
            const fileName = item.chlName + '_' + formatDate(item.startTime, 'YYYYMMDDHHmmss') + '.avi'
            download(new Blob([data.file]), fileName)
        }

        /**
         * @description 下载进度回调
         * @param {number} frameTime
         * @param {number} taskIndex
         */
        const handleFrameTime = (frameTime: number, taskIndex: number) => {
            const item = prop.backupList[taskIndex]
            pageData.value.progress = Math.floor(((frameTime - item.startTime) / (item.endTime - item.startTime)) * 100)
            pageData.value.currentTask = taskIndex + 1
        }

        /**
         * @description 下载失败回调
         * @param {Number} errorCode
         */
        const handleError = (errorCode?: number) => {
            let errorInfo = ''
            switch (errorCode) {
                case ErrorCode.USER_ERROR_DEVICE_BUSY:
                    errorInfo = Translate('IDCS_DEVICE_BUSY')
                    break
                case ErrorCode.USER_ERROR_DEV_RESOURCE_LIMITED:
                    errorInfo = Translate('IDCS_DEVICE_BUSY')
                    break
                case ErrorCode.USER_ERROR_NO_AUTH:
                    errorInfo = Translate('IDCS_NO_PERMISSION')
                    break
            }
            if (errorInfo) {
                openMessageTipBox({
                    type: 'info',
                    message: errorInfo,
                }).finally(() => {
                    close()
                })
            } else {
                close()
            }
        }

        /**
         * @description 停止，结束下载
         */
        const destroy = () => {
            if (recorder) {
                recorder.stop()
                recorder.destroy()
            }
            recorder = null
            pageData.value.currentTask = 0
            pageData.value.progress = 0
        }

        onBeforeUnmount(() => {
            destroy()
        })

        return {
            close,
            open,
            pageData,
        }
    },
})
