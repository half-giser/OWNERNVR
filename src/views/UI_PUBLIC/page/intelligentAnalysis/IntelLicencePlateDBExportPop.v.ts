/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-02 16:42:46
 * @Description: 车牌导出弹窗
 */
import WebsocketPlateLib, { type WebsocketPlateLibOnSuccessParam } from '@/utils/websocket/websocketPlatelib'

export default defineComponent({
    props: {
        /**
         * @property 导出的数据
         */
        data: {
            type: Object as PropType<Record<string, string>>,
            required: true,
        },
        /**
         * @property 任务总数
         */
        total: {
            type: Number,
            default: 0,
        },
    },
    emits: {
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()

        const MAX_ZIP_FILE_LENGTH = 5000 // 一个压缩包最大图片文件数量

        let websocket: ReturnType<typeof WebsocketPlateLib> | null = null

        const csvHeader = ['(B1)' + Translate('IDCS_LICENSE_PLATE_NUM'), '(B2)' + Translate('IDCS_VEHICLE_OWNER'), '(B3)' + Translate('IDCS_PHONE_NUMBER'), '(N1)' + Translate('IDCS_VEHICLE_TYPE')]

        const pageData = ref({
            // 当前任务
            currentTask: 0,
            // 任务总数
            totalTask: 0,
        })

        const progress = computed(() => {
            return Math.ceil((pageData.value.currentTask / pageData.value.totalTask) * 100)
        })

        type ExportData = {
            content: string
            folder: string
            name: string
        }

        const exportData: ExportData[] = []
        let currentGroupId = ''

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
            pageData.value.currentTask = 0
            pageData.value.totalTask = prop.total

            websocket = WebsocketPlateLib({
                onsuccess(data) {
                    // 数据接收完毕, 执行导出
                    if (typeof data === 'number') {
                        if (data === ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED) {
                            downloadZip({
                                zipName: getZipName(),
                                files: exportData,
                            }).then(() => {
                                openMessageBox({
                                    type: 'success',
                                    title: Translate('IDCS_INFORMATION_MSG'),
                                    message: Translate('IDCS_EXPORT_SUCCESS'),
                                }).then(() => {
                                    close()
                                })
                            })
                            return
                        }
                        return
                    }

                    data.forEach((item) => {
                        const groupName = prop.data[item.groupId]

                        if (currentGroupId !== item.groupId) {
                            const csvObj = {
                                content: csvHeader.join(',') + '\n',
                                folder: getZipName() + '/' + groupName,
                                name: getCsvName(),
                            }
                            exportData.push(csvObj)
                            currentGroupId = item.groupId
                        }
                        exportData[exportData.length - 1].content += getCsvRow(item) + '\n'
                    })

                    if (pageData.value.currentTask < pageData.value.totalTask) {
                        pageData.value.currentTask++
                    }
                },
                onerror(code) {
                    let errorInfo = ''
                    switch (code) {
                        case ErrorCode.USER_ERROR_NO_RECORDDATA:
                            errorInfo = Translate('IDCS_NO_RECORD_DATA')
                            break
                        case ErrorCode.USER_ERROR_NO_AUTH:
                            errorInfo = Translate('IDCS_NO_PERMISSION')
                            break
                        case ErrorCode.USER_ERROR_SYSTEM_BUSY:
                            errorInfo = Translate('IDCS_EXPORT_FACE_DATABASE_TASK_TIP')
                            break
                    }
                    openMessageBox({
                        type: 'info',
                        message: errorInfo,
                    }).then(() => {
                        close()
                    })
                },
                onclose() {
                    close()
                },
            })
        }

        /**
         * @description 生成当前时间年月日时分秒
         * @returns {string}
         */
        const getCurrentTime = () => {
            return formatDate(new Date(), 'YYYYMMDDHHmmss')
        }

        /**
         * @description 生成csv文件名,规则：platedatabase_backup_时间.csv
         * @returns {string}
         */
        const getCsvName = () => {
            return 'platedatabase_backup_' + getCurrentTime() + '.csv'
        }

        /**
         * @description 生成zip压缩包名,规则：单个压缩包为platedatabase_backup
         * 多个压缩包platedatabase_backup-1/platedatabase_backup-2 ...(以此类推)
         * @returns {string}
         */
        const getZipName = () => {
            let suffix = ''
            suffix = pageData.value.totalTask <= MAX_ZIP_FILE_LENGTH ? '' : '-' + Math.ceil(pageData.value.currentTask / MAX_ZIP_FILE_LENGTH)
            return 'platedatabase_backup' + suffix
        }

        /**
         * @description 获取csv行数据
         * @param {WebsocketPlateLibOnSuccessParam} row
         * @returns {string}
         */
        const getCsvRow = (row: WebsocketPlateLibOnSuccessParam) => {
            const csvRow = [
                row.plateNumberValue || '', // 车牌号
                row.ownerValue || '', // 车主
                row.phoneValue || '', // 手机号码
                row.vehicleType || '', // 车型
            ]
            return csvRow.join(',')
        }

        /**
         * @description 停止，结束下载
         */
        const destroy = () => {
            if (websocket) {
                websocket.stop()
                websocket.destroy()
            }
            websocket = null
            pageData.value.currentTask = 0
        }

        onBeforeUnmount(() => {
            destroy()
        })

        return {
            open,
            pageData,
            progress,
        }
    },
})
