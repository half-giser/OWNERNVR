/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-09 19:21:49
 * @Description: 智能分析 - 人体搜索
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-29 14:13:36
 */
import { type IntelSearchCollectList, type IntelSearchList, IntelSnapImgDto, IntelSearchBodyForm, type IntelSnapPopList } from '@/types/apiType/intelligentAnalysis'
import IntelBaseChannelSelector from './IntelBaseChannelSelector.vue'
import IntelBaseDateTimeSelector from './IntelBaseDateTimeSelector.vue'
import IntelBaseEventSelector from './IntelBaseEventSelector.vue'
import IntelBaseProfileSelector from './IntelBaseProfileSelector.vue'
import IntelBaseCollect from './IntelBaseCollect.vue'
import IntelBaseSnapItem from './IntelBaseSnapItem.vue'
import IntelBaseSnapPop from './IntelBaseSnapPop.vue'
import type { TableInstance, CheckboxValueType } from 'element-plus'
import { type PlaybackPopList } from '@/components/player/BasePlaybackPop.vue'
import BackupPop from '../searchAndBackup/BackupPop.vue'
import BackupLocalPop from '../searchAndBackup/BackupLocalPop.vue'
import { type PlaybackBackUpRecList } from '@/types/apiType/playback'
import { type DownloadZipOptions } from '@/utils/tools'
import dayjs from 'dayjs'

export default defineComponent({
    components: {
        IntelBaseChannelSelector,
        IntelBaseDateTimeSelector,
        IntelBaseEventSelector,
        IntelBaseProfileSelector,
        IntelBaseCollect,
        IntelBaseSnapItem,
        IntelBaseSnapPop,
        BackupPop,
        BackupLocalPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const dateTime = useDateTimeStore()
        const auth = useUserChlAuth()

        // 图像失败重新请求最大次数
        const REPEAR_REQUEST_IMG_TIMES = 2
        // 图像缓存，避免重复请求相同的图片
        const cachePic: Record<string, IntelSnapImgDto> = {}

        let chlMap: Record<string, string> = {}

        const pageData = ref({
            // 图表类型
            chartType: 'list',
            // 图表选项
            chartTypeOptions: [
                {
                    label: Translate('IDCS_OPERATE_SNAPSHOT_MSPB'),
                    value: 'list',
                },
                {
                    label: Translate('IDCS_LIST'),
                    value: 'table',
                },
            ],
            // 列表类型 （抓拍/原图）
            listType: 'snap',
            // 列表选项
            listTypeOptions: [
                {
                    label: Translate('IDCS_FACE_SNAP_IMAGE'),
                    value: 'snap',
                },
                {
                    label: Translate('IDCS_PANORAMA'),
                    value: 'panorama',
                },
            ],
            // 排序类型（按时间/按通道）
            sortType: 'time',
            // 排序选项
            sortOptions: [
                {
                    label: Translate('IDCS_TIME'),
                    value: 'time',
                },
                {
                    label: Translate('IDCS_CHANNEL'),
                    value: 'chl',
                },
            ],
            // 是否备份图片
            isBackUpPic: true,
            // 是否备份视频
            isBackUpVideo: true,
            // 是否打开备份弹窗
            isBackUpPop: false,
            // 是否打开本地备份录像弹窗
            isBackUpLocalPop: false,
            // 备份列表
            backupList: [] as PlaybackBackUpRecList[],
            // 勾选列表
            selection: [] as IntelSearchList[],
            // 是否打开抓怕详情弹窗
            isDetailPop: false,
            // 当前选中的抓拍的索引
            detailIndex: 0,
            // 是否打开回放弹窗
            isPlaybackPop: false,
            // 回放列表
            playbackList: [] as PlaybackPopList[],
            // 是否支持备份（H5模式）
            isSupportBackUp: isBrowserSupportWasm() && !isHttpsLogin(),
        })

        const formData = ref(new IntelSearchBodyForm())

        const playerData = ref({
            // 播放开始时间
            startTime: 0,
            // 播放结束时间
            endTime: 0,
            // 播放当前时间
            currentTime: 0,
            // 是否锁定滑块
            lockSlider: false,
            // 当前播放的项
            playId: '',
        })

        const playerRef = ref<PlayerInstance>()

        const tableRef = ref<TableInstance>()

        const tableData = ref<IntelSearchList[]>([])

        const sliceTableData = ref<IntelSearchList[]>([])

        /**
         * @description 获取通道ID与通道名称的映射
         * @param {Record<string, string>} e
         */
        const getChlMap = (e: Record<string, string>) => {
            chlMap = e
        }

        /**
         * @description 收藏回显
         * @param {string[]} e
         */
        const changeCollect = (e: IntelSearchCollectList) => {
            formData.value.dateRange = e.dateRange
            formData.value.chl = e.chl
            formData.value.attribute = e.profile
            formData.value.event = e.event
            getData()
        }

        /**
         * @description 日期时间格式化
         * @param {number} timestamp 毫秒
         * @returns {String}
         */
        const displayDateTime = (timestamp: number) => {
            if (timestamp === 0) return ''
            return formatDate(timestamp, dateTime.dateTimeFormat)
        }

        /**
         * @description 格式化时间文本
         * @param {number} timestamp
         */
        const displayTime = (timestamp: number) => {
            if (timestamp === 0) return ''
            return formatDate(timestamp, dateTime.timeFormat)
        }

        const getUniqueKey = (row: { imgId: string; frameTime: string }) => {
            if (!row.imgId || !row.frameTime) {
                return Math.floor(Math.random() * 1e8) + ''
            }
            return `${row.imgId}:${row.frameTime}`
        }

        /**
         * @description 播放
         * @param {Number} startTime 毫秒
         */
        const play = (row: IntelSearchList) => {
            stop()

            playerData.value.playId = getUniqueKey(row)
            playerData.value.startTime = row.recStartTime
            playerData.value.endTime = row.recEndTime

            playerRef.value?.player.play({
                chlID: row.chlId,
                chlName: row.chlName,
                startTime: Math.floor(playerData.value.startTime / 1000),
                endTime: Math.floor(playerData.value.endTime / 1000),
                streamType: 1, // 0主码流，其他子码流
                winIndex: 0,
                showPos: false,
            })
        }

        /**
         * @description 停止播放
         */
        const stop = () => {
            playerData.value.playId = ''
            playerData.value.startTime = 0
            playerData.value.endTime = 0
            playerData.value.currentTime = 0
            playerRef.value?.player.stop(0)
        }

        /**
         * @description seek回放时间点
         * @param {number} timestamp 时间戳，单位 毫秒
         */
        const seek = (timestamp: number) => {
            const currentTime = Math.floor(timestamp / 1000)
            playerRef.value?.player.seek(currentTime)
        }

        /**
         * @description 按下播放器控制条
         */
        const handleSliderMouseDown = () => {
            playerData.value.lockSlider = true
        }

        /**
         * @description 松开播放器控制条
         */
        const handleSliderMouseUp = () => {
            setTimeout(() => {
                playerData.value.lockSlider = false
            }, 10)
        }

        /**
         * @description 控制条发生变化
         */
        const handleSliderChange = () => {
            seek(playerData.value.currentTime - 1)
        }

        /**
         * @description 播放器TimeUpdate回调
         * @param {Number} index
         * @param {TVTPlayerWinDataListItem} data
         * @param {Number} timestamp
         */
        const handlePlayerTimeUpdate = (_index: number, _data: any, timestamp: number) => {
            if (playerData.value.lockSlider) {
                return
            }
            playerData.value.currentTime = timestamp
        }

        /**
         * @description 页码切换
         * @param {number} pageIndex
         */
        const changePage = async (pageIndex: number) => {
            stop()
            tableRef.value!.clearSelection()
            formData.value.pageIndex = pageIndex
            sliceTableData.value = tableData.value.slice((pageIndex - 1) * formData.value.pageSize, pageIndex * formData.value.pageSize)
            for (let i = 0; i < sliceTableData.value.length; i++) {
                const item = sliceTableData.value[i]
                const flag = await getPic(item, false, i)
                if (flag) {
                    const flag2 = await getPic(item, true, i)
                    if (flag2) {
                        sliceTableData.value[i] = {
                            ...sliceTableData.value[i],
                            ...cachePic[getUniqueKey(item)],
                        }
                        continue
                    } else {
                        break
                    }
                } else {
                    break
                }
            }
        }

        /**
         * @description 更改排序类型 重新渲染列表
         */
        const changeSortType = () => {
            if (tableData.value.length) {
                if (pageData.value.sortType === 'time') {
                    tableData.value.sort((a, b) => {
                        return b.timestamp - a.timestamp
                    })
                } else {
                    tableData.value.sort((a, b) => {
                        if (a.guid === b.guid) {
                            return b.timestamp - a.timestamp
                        }
                        return a.guid - b.guid
                    })
                }
            }
            changePage(1)
        }

        /**
         * @description 获取抓拍图或原图
         * @param {IntelSearchList} row
         * @param {boolean} isPanorama
         * @param {number} index
         */
        const getPic = async (row: IntelSearchList, isPanorama: boolean, index: number, times = 0) => {
            try {
                const key = getUniqueKey(row)
                if (!row.isDelSnap && (!cachePic[key] || !cachePic[key].pic || !cachePic[key].panorama)) {
                    const sendXml = rawXml`
                        <condition>
                            <imgId>${row.imgId}</imgId>
                            <chlId>${row.chlId}</chlId>
                            <frameTime>${row.frameTime}</frameTime>
                            <pathGUID>${row.pathGUID}</pathGUID>
                            <sectionNo>${row.sectionNo.toString()}</sectionNo>
                            <fileIndex>${row.fileIndex.toString()}</fileIndex>
                            <blockNo>${row.bolckNo.toString()}</blockNo>
                            <offset>${row.offset.toString()}</offset>
                            <eventType>${row.eventTypeID.toString()}</eventType>
                            ${ternary(isPanorama, '<isPanorama />')}
                        </condition>
                    `
                    const result = await requestSmartTargetSnapImage(sendXml)
                    const $ = queryXml(result)

                    if ($('//status').text() === 'success') {
                        const content = $('//content').text()
                        if (!content && times < REPEAR_REQUEST_IMG_TIMES) {
                            return getPic(row, isPanorama, index, times + 1)
                        }
                        const width = Number($('//rect/ptWidth').text()) || 1
                        const height = Number($('//rect/ptHeight').text()) || 1
                        const leftTopX = Number($('//rect/leftTopX').text())
                        const leftTopY = Number($('//rect/leftTopY').text())
                        const rightBottomX = Number($('//rect/rightBottomX').text())
                        const rightBottomY = Number($('//rect/rightBottomY').text())
                        const item = {
                            pic: cachePic[key] ? cachePic[key].pic : '',
                            panorama: cachePic[key] ? cachePic[key].panorama : '',
                            eventType: $('//eventType').text(),
                            targetType: $('//targetType').text(),
                            width,
                            height,
                            X1: leftTopX / width,
                            Y1: leftTopY / height,
                            X2: rightBottomX / width,
                            Y2: rightBottomY / height,
                            isDelSnap: false,
                            isNoData: !content,
                            plateNumber: '',
                            attribute: {} as Record<string, string>,
                        }

                        $('//attribute').forEach((attribute) => {
                            item.attribute[attribute.attr('type')!] = attribute.text()
                        })

                        if (isPanorama) {
                            item.panorama = 'data:image/png;base64,' + content
                        } else {
                            item.pic = 'data:image/png;base64,' + content
                        }
                        cachePic[key] = item
                    } else {
                        cachePic[key] = cachePic[key] || new IntelSnapImgDto()
                        const errorCode = Number($('//errorCode').text())
                        switch (errorCode) {
                            case ErrorCode.HTTPS_CERT_EXIST:
                                cachePic[key].isDelSnap = true
                                cachePic[key].isNoData = false
                                break
                            case ErrorCode.USER_ERROR_NO_RECORDDATA:
                                cachePic[key].isDelSnap = false
                                cachePic[key].isNoData = true
                                break
                            default:
                                // 重复获取数据
                                if (times < REPEAR_REQUEST_IMG_TIMES) {
                                    return getPic(row, isPanorama, index, times + 1)
                                }
                        }
                    }
                }

                if (getUniqueKey(row) === getUniqueKey(sliceTableData.value[index])) {
                    return true
                } else {
                    return false
                }
            } catch (e) {
                if (times < REPEAR_REQUEST_IMG_TIMES) {
                    return getPic(row, isPanorama, index, times + 1)
                } else {
                    if (getUniqueKey(row) === getUniqueKey(sliceTableData.value[index])) {
                        return true
                    } else {
                        return false
                    }
                }
            }
        }

        /**
         * @description 获取列表数据
         */
        const getData = async () => {
            const attributeXml = Object.keys(formData.value.attribute)
                .map((key) => {
                    const detail = Object.entries(formData.value.attribute[key])
                        .map((item) => {
                            return `<item name="${item[0]}">${item[1].join(',')}</item>`
                        })
                        .join('')
                    return rawXml`
                        <item type="${key}">
                            <attribute>${detail}</attribute>
                        </item>`
                })
                .join('')

            const sendXml = rawXml`
                <resultLimit>10000</resultLimit>
                <condition>
                    <startTime>${formatDate(formData.value.dateRange[0], 'YYYY-MM-DD HH:mm:ss')}</startTime>
                    <endTime>${formatDate(formData.value.dateRange[1], 'YYYY-MM-DD HH:mm:ss')}</endTime>
                    <chls type="list">${formData.value.chl.map((item) => `<item id="${item}"></item>`).join('')}</chls>
                    <events type="list">${formData.value.event.map((item) => `<item>${item}</item>`).join('')}</events>
                    <person type="list">
                        <item>male</item>
                        <item>female</item>
                    </person>
                    <targetAttribute>${attributeXml}</targetAttribute>
                </condition>
            `

            openLoading()
            tableData.value = []

            const result = await searchSmartTarget(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                tableData.value = $('//content/i').map((item) => {
                    const isDelSnap = item.attr('s')! === 'd'
                    const split = item.text().split(',')
                    const guid = parseInt(split[3], 16)
                    const chlId = getChlGuid16(split[3]).toUpperCase()
                    const timestamp = parseInt(split[0], 16) * 1000
                    return {
                        isDelSnap: isDelSnap,
                        isNoData: false,
                        plateNumber: '',
                        direction: '',
                        imgId: parseInt(split[2], 16) + '',
                        timestamp: parseInt(split[0], 16) * 1000,
                        frameTime: localToUtc(timestamp) + ':' + ('0000000' + parseInt(split[1], 16)).slice(-7),
                        guid,
                        chlId,
                        chlName: chlMap[chlId],
                        recStartTime: parseInt(split[4], 16) * 1000,
                        recEndTime: parseInt(split[5], 16) * 1000,
                        pathGUID: split[6],
                        sectionNo: parseInt(split[7], 16),
                        fileIndex: parseInt(split[8], 16),
                        bolckNo: parseInt(split[9], 16),
                        offset: parseInt(split[10], 16),
                        eventTypeID: parseInt(split[11], 16),
                        pic: '',
                        panorama: '',
                        eventType: '',
                        targetType: '',
                        width: 1,
                        height: 1,
                        X1: 0,
                        Y1: 0,
                        X2: 0,
                        Y2: 0,
                        attribute: {},
                    }
                })
                showMaxSearchLimitTips($)
            }

            if (!tableData.value.length) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_NO_RECORD_DATA'),
                })
            }

            changeSortType()
        }

        /**
         * @description 查看抓拍详情
         * @param {number} index
         */
        const showDetail = (index: number) => {
            stop()
            pageData.value.detailIndex = index
            pageData.value.isDetailPop = true
        }

        // 已选选项
        const selectionIds = computed(() => {
            return pageData.value.selection.map((item) => getUniqueKey(item))
        })

        /**
         * @description 点击表格行，勾选当前行
         * @param {IntelSearchList} row
         */
        const handleTableRowClick = (row: IntelSearchList) => {
            play(row)
            tableRef.value!.clearSelection()
            tableRef.value!.toggleRowSelection(row, true)
        }

        /**
         * @description 表格勾选项改变回调
         * @param {IntelSearchList[]} row
         */
        const handleTableSelectionChange = (row: IntelSearchList[]) => {
            pageData.value.selection = row
        }

        /**
         * @description 禁用表格选项
         * @param {IntelSearchList} row
         * @returns {boolean}
         */
        const getTableSelectable = (row: IntelSearchList) => {
            return !row.isDelSnap && !!row.pic && !!row.panorama
        }

        /**
         * @description 列表勾选
         */
        const handleSelect = (index: number, bool: boolean) => {
            tableRef.value!.toggleRowSelection(sliceTableData.value[index], bool)
        }

        /**
         * @description 全选/取消全选
         * @param {CheckboxValueType} bool
         */
        const handleSelectAll = (bool: CheckboxValueType) => {
            if (bool as boolean) {
                sliceTableData.value.forEach((item) => {
                    if (!item.isDelSnap && !item.isNoData) {
                        tableRef.value!.toggleRowSelection(item, true)
                    }
                })
            } else {
                tableRef.value?.clearSelection()
            }
        }

        /**
         * @description 打开回放弹窗
         * @param {IntelSnapPopList} row
         */
        const playRec = (row: IntelSnapPopList) => {
            pageData.value.playbackList = [
                {
                    startTime: row.recStartTime,
                    endTime: row.recEndTime,
                    chlId: row.chlId,
                    chlName: row.chlName,
                    eventList: ['MOTION', 'SCHEDULE', 'SENSOR', 'MANUAL', 'INTELLIGENT'],
                },
            ]
            pageData.value.isPlaybackPop = true
        }

        let downloadData: DownloadZipOptions['files'] = []

        /**
         * @description 检查备份权限
         * @returns {Boolean}
         */
        const checkBackUpAuth = () => {
            if (auth.value.hasAll) {
                return true
            }
            const find = pageData.value.selection.find((item) => {
                return !auth.value.bk[item.chlId]
            })
            if (find) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_CHANNEL_BACUP_NO_PERMISSION').formatForLang(find.chlName),
                })
                return false
            }
            return true
        }

        /**
         * @description 如果需要备份视频，打开备份弹窗，否则直接备份图像
         */
        const backUp = () => {
            if (!checkBackUpAuth()) {
                return
            }
            stop()
            downloadData = []
            if (pageData.value.isBackUpPic) {
                downloadPic()
            }

            if (pageData.value.isBackUpVideo) {
                pageData.value.isBackUpPop = true
            } else {
                createZip()
            }
        }

        /**
         * @description 打开本地录像备份弹窗
         */
        const confirmBackUp = () => {
            pageData.value.isBackUpPop = false
            pageData.value.backupList = pageData.value.selection.map((item) => {
                return {
                    chlId: item.chlId,
                    chlName: item.chlName,
                    startTime: item.recStartTime,
                    endTime: item.recEndTime,
                    events: ['MOTION', 'SCHEDULE', 'SENSOR', 'MANUAL', 'INTELLIGENT'],
                    streamType: 1,
                }
            })
            pageData.value.isBackUpLocalPop = true
        }

        /**
         * @description 生成图片名
         * @param {string} chlName
         * @param {number} time
         * @param {string} suffix
         */
        const getImageName = (chlName: string, time: number, suffix: string) => {
            chlName = chlName ? chlName : Translate('IDCS_UNKNOWN_CHANNEL') + '1' // 已删除通道 chlName为空
            return chlName + '_' + formatDate(time, 'YYYYMMDDHHmmss') + (suffix ? '_' + suffix : '') + '.jpg'
        }

        /**
         * @description 生成zip文件名
         * @param {string} chlName
         */
        const getZipName = (chlName: string) => {
            chlName = chlName ? chlName : Translate('IDCS_UNKNOWN_CHANNEL') + '1'
            return chlName + '_' + dayjs().format('YYYYMMDDHHmmss')
        }

        /**
         * @description 添加图像到ZIP
         */
        const downloadPic = () => {
            pageData.value.selection.forEach((item) => {
                downloadData.push({
                    content: item.pic,
                    folder: '',
                    name: getImageName(item.chlName, item.timestamp, ''),
                })
                downloadData.push({
                    content: item.panorama,
                    folder: '',
                    name: getImageName(item.chlName, item.timestamp, 'background'),
                })
            })
        }

        /**
         * @description 添加视频到ZIP
         * @param {DownloadZipOptions['files']} recordFile
         */
        const downloadVideo = (recordFile: DownloadZipOptions['files']) => {
            downloadData = [...downloadData, ...recordFile]

            if (downloadData.length) {
                createZip()
            } else {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_NO_RECORD_DATA'),
                })
            }
        }

        /**
         * @description 下载ZIP
         */
        const createZip = () => {
            downloadZip({
                zipName: getZipName(pageData.value.selection[0].chlName),
                files: downloadData,
            }).then(() => {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_BACKUP_SUCCESS'),
                })
            })
        }

        onMounted(() => {
            if (history.state.eventType) {
                switch (history.state.eventType) {
                    case 'aoi_entry':
                    case 'aoi_leave':
                    case 'perimeter':
                        formData.value.event.push('intrusion')
                        break
                    case 'tripwire':
                        formData.value.event.push('tripwire')
                        break
                    case 'pass_line':
                        formData.value.event.push('passLine')
                        break
                    case 'video_metavideo':
                        formData.value.event.push('videoMetadata')
                        break
                }
                delete history.state.eventType
                getData()
            }
        })

        onBeforeUnmount(() => {
            stop()
        })

        return {
            pageData,
            playerRef,
            playerData,
            tableRef,
            tableData,
            sliceTableData,
            formData,
            getChlMap,
            changeCollect,
            changePage,
            displayDateTime,
            backUp,
            handleSliderMouseDown,
            handleSliderMouseUp,
            handleSliderChange,
            handlePlayerTimeUpdate,
            play,
            showDetail,
            displayTime,
            getData,
            changeSortType,
            handleTableRowClick,
            handleTableSelectionChange,
            getTableSelectable,
            selectionIds,
            handleSelect,
            handleSelectAll,
            playRec,
            confirmBackUp,
            downloadVideo,
            auth,
            getUniqueKey,
            cacheKey: LocalCacheKey.KEY_BODY_SEARCH_COLLECTION,
            IntelBaseChannelSelector,
            IntelBaseDateTimeSelector,
            IntelBaseEventSelector,
            IntelBaseProfileSelector,
            IntelBaseCollect,
            IntelBaseSnapItem,
            IntelBaseSnapPop,
            BackupPop,
            BackupLocalPop,
        }
    },
})
