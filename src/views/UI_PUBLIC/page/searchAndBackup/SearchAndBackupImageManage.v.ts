/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 13:47:57
 * @Description: 搜索与备份-图片管理
 */
import dayjs from 'dayjs'
import { type TableInstance } from 'element-plus'
import BackupImgPop from './BackupImgPop.vue'
import BackupImgPlayerPop from './BackupImgPlayerPop.vue'

export default defineComponent({
    components: {
        BackupImgPop,
        BackupImgPlayerPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const browser = getBrowserInfo()

        const tableRef = ref<TableInstance>()

        const dateTime = useDateTimeStore()
        const userAuth = useUserChlAuth()

        const pageData = ref({
            // 通道列表
            chlList: [] as PlaybackChlList[],
            // 是否打开本地备份弹窗（H5）
            isLocalBackUpPop: false,
            // 是否显示备份提示弹窗
            isBackUpTipPop: false,
            // 不再显示备份提示弹窗勾选框
            isBackUpTipNotAgain: false,
            // 是否显示图片浏览弹窗
            isBackupPlayerPop: false,
            // 图像浏览的列表项
            playerIndex: 0,
            // 是否打开备份弹窗
            isBackUpPop: false,
            // 图像备份列表
            backupImgList: [] as PlaybackSearchImgList[],
            // 列表总条数
            totalCount: 1,
            // 开始时间
            startTime: '',
            // 结束时间
            endTime: '',
        })

        // 列表数据
        const tableData = ref<PlaybackSearchImgList[]>([])

        const formData = ref(new PlaybackSearchImgForm())

        const plugin = usePlugin({
            onReady: (mode, plugin) => {
                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Playback')
                    plugin.ExecuteCmd(sendXML)
                }
            },
            onDestroy: (mode, plugin) => {
                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_StopPreview('ALL')
                    plugin.ExecuteCmd(sendXML)
                }
            },
        })

        const mode = computed(() => {
            return plugin.IsSupportH5() ? 'h5' : 'ocx'
        })

        /**
         * @description 搜索
         */
        const search = () => {
            formData.value.startTime = pageData.value.startTime
            formData.value.endTime = pageData.value.endTime
            formData.value.pageIndex = 1
            getData()
        }

        /**
         * @description 更改排序方式
         * @param {String} sortField
         */
        const sort = (sortField: string) => {
            formData.value.pageIndex = 1
            if (!formData.value.sortField) {
                formData.value.sortField = sortField
                formData.value.sortType = 'asc'
            } else if (formData.value.sortField === sortField) {
                formData.value.sortType = formData.value.sortType === 'asc' ? 'desc' : 'asc'
            } else {
                formData.value.sortField = sortField
            }
            getData()
        }

        /**
         * @description 获取列表数据
         */
        const getData = async () => {
            const startTime = dayjs(formData.value.startTime, { jalali: false, format: DEFAULT_DATE_FORMAT }).valueOf()
            const endTime = dayjs(formData.value.endTime, { jalali: false, format: DEFAULT_DATE_FORMAT }).valueOf()
            if (endTime <= startTime) {
                openMessageBox(Translate('IDCS_END_TIME_GREATER_THAN_START'))
                return
            }

            openLoading()

            tableRef.value!.clearSelection()
            tableData.value = []

            const sendXml = rawXml`
                <pageIndex>${formData.value.pageIndex}</pageIndex>
                <pageSize>${formData.value.pageSize}</pageSize>
                <condition>
                    <startTime>${formatGregoryDate(startTime, DEFAULT_DATE_FORMAT)}</startTime>
                    <endTime>${formatGregoryDate(endTime, DEFAULT_DATE_FORMAT)}</endTime>
                    <startTimeEx>${localToUtc(startTime)}</startTimeEx>
                    <endTimeEx>${localToUtc(endTime)}</endTimeEx>
                </condition>
                <sort type='list'>
                    <item fieldName="${formData.value.sortField}" sortType="${formData.value.sortType}"></item>
                </sort>
            `
            const result = await searchPictures(sendXml)
            const $ = queryXml(result)

            closeLoading()

            showMaxSearchLimitTips($)
            pageData.value.totalCount = $('content').attr('total').num()

            tableData.value = $('content/item').map((item, index) => {
                const $item = queryXml(item.element)
                return {
                    index: (formData.value.pageIndex - 1) * formData.value.pageSize + index + 1,
                    chlId: $item('chl').attr('id'),
                    chlName: $item('chl').text(),
                    creator: Translate($item('creator').text()),
                    captureMode: $item('captureMode').text().num(),
                    captureModeKey: Translate($item('captureMode').attr('translateKey')),
                    captureTimeStamp: dayjs.utc($item('captureTime').text().substring(0, 19), DEFAULT_DATE_FORMAT).valueOf(),
                    captureTime: $item('captureTime').text(),
                }
            })
        }

        /**
         * @description 显示时间日期格式
         * @param {Nujmber} timestamp 毫秒
         * @returns {String}
         */
        const displayDateTime = (timestamp: number) => {
            return formatDate(timestamp, dateTime.dateTimeFormat)
        }

        /**
         * @description 点击表格行时选中该行
         * @param {Object} row
         */
        const handleRowClick = (row: PlaybackRecLogList) => {
            tableRef.value!.toggleRowSelection(row, true)
        }

        /**
         * @description 打开图片浏览弹窗
         * @param {Number} index
         */
        const browseImg = (index: number) => {
            pageData.value.playerIndex = index
            pageData.value.isBackupPlayerPop = true
        }

        /**
         * @description 导出图像，打开导出弹窗
         * @param {Object} row
         */
        const exportImg = (row: PlaybackSearchImgList) => {
            if (!userAuth.value.hasAll && !userAuth.value.bk[row.chlId]) {
                openMessageBox(Translate('IDCS_NODE_NO_AUTH').formatForLang(row.chlName))
                return
            }
            pageData.value.isBackUpPop = true
            pageData.value.backupImgList = [row]
        }

        /**
         * @description 导出选中的图像，打开导出弹窗
         */
        const exportSelectedImg = () => {
            const selection = tableRef.value!.getSelectionRows() as PlaybackSearchImgList[]
            if (!userAuth.value.hasAll) {
                const find = selection.find((item) => !userAuth.value.bk[item.chlId])
                if (find) {
                    openMessageBox(Translate('IDCS_NODE_NO_AUTH').formatForLang(find.chlName))
                    return
                }
            }
            pageData.value.isBackUpPop = true
            pageData.value.backupImgList = selection
        }

        /**
         * @description 删除图像
         * @param {Object} row
         * @param {Function} cbk
         */
        const deleteImg = (row: PlaybackSearchImgList, cbk?: () => void) => {
            if (!userAuth.value.hasAll && !userAuth.value.bk[row.chlId]) {
                openMessageBox(Translate('IDCS_NODE_NO_AUTH').formatForLang(row.chlName))
                return
            }
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_SELECT_ITEMS'),
            }).then(async () => {
                const sendXml = rawXml`
                    <condition>
                        <pictures type='list'>
                            <item>
                                <chl id="${row.chlId}">${row.chlName}</chl>
                                <captureMode>${row.captureMode}</captureMode>
                                <captureTime>${row.captureTime}</captureTime>
                            </item>
                        </pictures>
                    </condition>
                `
                const result = await delPictures(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    if (tableData.value.length === 1 && formData.value.pageIndex > 1) {
                        formData.value.pageIndex--
                    }
                    await getData()
                    cbk && cbk()
                }
            })
        }

        /**
         * @description 删除选中的图片
         */
        const deleteSelectedImg = () => {
            const selection = tableRef.value!.getSelectionRows() as PlaybackSearchImgList[]
            if (!userAuth.value.hasAll) {
                const find = selection.find((item) => !userAuth.value.bk[item.chlId])
                if (find) {
                    openMessageBox(Translate('IDCS_NODE_NO_AUTH').formatForLang(find.chlName))
                    return
                }
            }
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_SELECT_ITEMS'),
            }).then(async () => {
                const sendXml = rawXml`
                    <condition>
                        <pictures type='list'>
                            ${selection
                                .map((row) => {
                                    return rawXml`
                                        <item>
                                            <chl id="${row.chlId}">${row.chlName}</chl>
                                            <captureMode>${row.captureMode}</captureMode>
                                            <captureTime>${row.captureTime}</captureTime>
                                        </item>
                                    `
                                })
                                .join('')}
                        </pictures>
                    </condition>
                `
                const result = await delPictures(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    formData.value.pageIndex = 1
                    getData()
                }
            })
        }

        /**
         * @description 打开提示弹窗
         */
        const showBackupTipPop = () => {
            pageData.value.isBackUpTipPop = true
        }

        /**
         * @description 关闭提示弹窗
         */
        const closeBackupTipPop = () => {
            if (pageData.value.isBackUpTipNotAgain) {
                sessionStorage.setItem(LocalCacheKey.KEY_BACKUP_PIC_MSG, 'true')
            }
            pageData.value.isBackUpTipPop = false
        }

        /**
         * @description 页码器的页码更新
         * @param {Number} index
         */
        const changePageIndex = (index: number) => {
            formData.value.pageIndex = index
            if (formData.value.startTime && formData.value.endTime) {
                getData()
            }
        }

        /**
         * @description 页码器的每页显示条数更新
         * @param {Number} size
         */
        const changePageSize = (size: number) => {
            formData.value.pageSize = size
            if (formData.value.startTime && formData.value.endTime) {
                getData()
            }
        }

        // 当前浏览的图片的数据
        const picItem = computed(() => {
            return tableData.value[pageData.value.playerIndex] || new PlaybackSearchImgList()
        })

        /**
         * @description 删除浏览的图片
         */
        const handlePlayerDelete = () => {
            const length = tableData.value.length
            deleteImg(picItem.value, () => {
                if (length === 1 && tableData.value.length) {
                    pageData.value.playerIndex = tableData.value.length - 1
                } else if (pageData.value.playerIndex > tableData.value.length - 1) {
                    pageData.value.playerIndex = tableData.value.length - 1
                }
            })
        }

        /**
         * @description 导出浏览的图片
         */
        const handlePlayerExport = () => {
            exportImg(picItem.value)
        }

        /**
         * @description 浏览上一张图片
         */
        const handlePlayerPrev = async () => {
            if (pageData.value.playerIndex === 0 && formData.value.pageIndex === 1) {
                return
            }

            if (pageData.value.playerIndex === 0) {
                formData.value.pageIndex--
                await getData()
                pageData.value.playerIndex = tableData.value.length - 1
                return
            }
            pageData.value.playerIndex--
        }

        /**
         * @description 浏览下一张图片
         */
        const handlePlayerNext = async () => {
            if (pageData.value.playerIndex === tableData.value.length - 1 && formData.value.pageIndex >= Math.ceil(pageData.value.totalCount / formData.value.pageSize)) {
                return
            }

            if (pageData.value.playerIndex === tableData.value.length - 1) {
                formData.value.pageIndex++
                await getData()
                pageData.value.playerIndex = 0
                return
            }
            pageData.value.playerIndex++
        }

        onMounted(() => {
            const date = new Date()
            pageData.value.startTime = dayjs(date).hour(0).minute(0).second(0).calendar('gregory').format(DEFAULT_DATE_FORMAT)
            pageData.value.endTime = dayjs(date).hour(23).minute(59).second(59).calendar('gregory').format(DEFAULT_DATE_FORMAT)
        })

        onActivated(() => {
            search()

            if (!sessionStorage.getItem(LocalCacheKey.KEY_BACKUP_PIC_MSG)) {
                pageData.value.isBackUpTipPop = true
            }
        })

        return {
            mode,
            formData,
            pageData,
            userAuth,
            sort,
            search,
            tableRef,
            tableData,
            handleRowClick,
            displayDateTime,
            browseImg,
            exportImg,
            deleteImg,
            exportSelectedImg,
            deleteSelectedImg,
            browserType: browser.type,
            closeBackupTipPop,
            showBackupTipPop,
            picItem,
            handlePlayerDelete,
            handlePlayerExport,
            handlePlayerPrev,
            handlePlayerNext,
            changePageIndex,
            changePageSize,
        }
    },
})
