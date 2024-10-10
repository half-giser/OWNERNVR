/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 18:46:39
 * @Description: 导出人脸库弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-09 15:43:05
 */
import WebsocketFaceLib, { type WebsocketFaceLibFaceDataDatum } from '@/utils/websocket/websocketFacelib'

export default defineComponent({
    props: {
        /**
         * @property 组ID与组名称的映射
         */
        data: {
            type: Object as PropType<Record<string, string>>,
            required: true,
        },
    },
    emits: {
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        // const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const MAX_ZIP_FILE_LENGTH = 5000 // 一个压缩包最大图片文件数量

        let websocket: WebsocketFaceLib | null = null

        const csvHeader = [
            '(01)' + Translate('IDCS_NAME_PERSON'),
            '(02)' + Translate('IDCS_SEX'),
            '(03)' + Translate('IDCS_BIRTHDAY'),
            '(04)' + Translate('IDCS_ID_TYPE'),
            '(05)' + Translate('IDCS_ID_NUMBER'),
            '(08)' + Translate('IDCS_PHONE_NUMBER'),
            '(12)' + Translate('IDCS_IMAGE_NAME'),
            '(13)' + Translate('IDCS_NUMBER'),
            '(14)' + Translate('IDCS_REMARK'),
        ]

        const pageData = ref({
            // 下载进度
            // progress: 0,
            // 当前任务
            currentTask: 0,
            // 任务总数
            totalTask: 0,
        })

        const progress = computed(() => {
            return Math.ceil((pageData.value.currentTask / pageData.value.totalTask) * 100)
        })

        let csvFileIndexMapByGroupId: Record<string, number> = {}

        type ExportData = {
            content: string
            folder: string
            name: string
        }

        let exportData: ExportData[] = []
        let imgFileNum = 0

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

            websocket = new WebsocketFaceLib({
                onsuccess(data) {
                    // 数据接收完毕, 执行导出
                    if (typeof data === 'number') {
                        if (data === ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED) {
                            downloadZip({
                                zipName: getZipName(),
                                files: exportData,
                            }).then(() => {
                                openMessageTipBox({
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
                        pageData.value.totalTask = Number(item.total)

                        const groupName = prop.data[item.groupId]

                        // 组装csv
                        if (!csvFileIndexMapByGroupId[item.groupId]) {
                            const csvObj = {
                                content: csvHeader.join(',') + '\r\n',
                                folder: getZipName() + '/' + groupName,
                                name: getCsvName(),
                            }
                            exportData.push(csvObj)
                            csvFileIndexMapByGroupId[item.groupId] = exportData.length - 1
                        }
                        // 组装img
                        const imgObj = {
                            content: item.faceImg,
                            folder: getZipName() + '/' + groupName,
                            name: getImageName(item.name, item.faceId),
                        }
                        exportData.push(imgObj)
                        imgFileNum++

                        // 填充csv表格数据
                        exportData[csvFileIndexMapByGroupId[item.groupId]].content += getCsvRow(item) + '\r\n'
                    })

                    if (pageData.value.currentTask < pageData.value.totalTask) {
                        pageData.value.currentTask++
                    }
                    isHandleExport()
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
                    openMessageTipBox({
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
         * @description 符合条件则执行导出
         */
        const isHandleExport = () => {
            // 超出压缩包文件数量最大上限，先导出（有后续）
            if (imgFileNum == MAX_ZIP_FILE_LENGTH && pageData.value.currentTask < pageData.value.totalTask) {
                downloadZip({
                    zipName: getZipName(),
                    files: exportData,
                })
                exportData = []
                imgFileNum = 0
                csvFileIndexMapByGroupId = {}
            }
        }

        /**
         * @description 生成csv文件名,规则：facedatabase_backup_时间.csv
         * @returns {string}
         */
        const getCsvName = () => {
            return 'facedatabase_backup_' + getCurrentTime() + '.csv'
        }

        /**
         * @description 生成img文件名,规则：图片名_人脸id.jpg
         * @param {string} imgName
         * @param {string} imgId
         * @returns {string}
         */
        const getImageName = (imgName: string, imgId: string) => {
            return imgName + '_' + imgId + '.jpg'
        }

        /**
         * @description 生成zip压缩包名,规则：单个压缩包为facedatabase_backup
         * 多个压缩包facedatabase_backup-1/facedatabase_backup-2 ...(以此类推)
         * @returns {string}
         */
        const getZipName = () => {
            let suffix = ''
            suffix = pageData.value.totalTask <= MAX_ZIP_FILE_LENGTH ? '' : '-' + Math.ceil(pageData.value.currentTask / MAX_ZIP_FILE_LENGTH)
            return 'facedatabase_backup' + suffix
        }

        /**
         * @description 获取当前时间格式化文本
         * @returns {string}
         */
        const getCurrentTime = () => {
            return formatDate(new Date(), 'YYYYMMDDHHmmss')
        }

        /**
         * @description 生成行字符串
         * @param {WebsocketFaceLibFaceDataDatum} row
         * @returns {string}
         */
        const getCsvRow = (row: WebsocketFaceLibFaceDataDatum) => {
            const csvRow = [
                row.name || '', // 名称
                row.sex, // 性别
                row.birthday || '', // 生日
                Translate('IDCS_ID_CARD'), // 证件类型
                row.certificateNum || '', // 证件号码
                row.mobile || '', // 手机
                row.name + '_' + row.faceId + '.jpg', // 图片名称
                row.number || '', // 编号
                row.note || '', // 备注
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
