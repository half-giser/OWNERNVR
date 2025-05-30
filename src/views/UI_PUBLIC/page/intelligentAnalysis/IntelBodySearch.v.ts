/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-09 19:21:49
 * @Description: 智能分析 - 人体搜索
 */
import IntelBaseChannelSelector from './IntelBaseChannelSelector.vue'
import IntelBaseDateTimeSelector from './IntelBaseDateTimeSelector.vue'
import IntelBaseEventSelector from './IntelBaseEventSelector.vue'
import IntelBaseProfileSelector from './IntelBaseProfileSelector.vue'
import IntelBaseCollect from './IntelBaseCollect.vue'
import IntelBaseSnapItem from './IntelBaseSnapItem.vue'
import IntelBaseSnapPop from './IntelBaseSnapPop.vue'
import type { TableInstance, CheckboxValueType } from 'element-plus'
import BackupPop from '../searchAndBackup/BackupPop.vue'
import BackupLocalPop from '../searchAndBackup/BackupLocalPop.vue'
import { type DownloadZipOptions } from '@/utils/downloaders'
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
        const dateTime = useDateTimeStore()
        const auth = useUserChlAuth()

        // 图像失败重新请求最大次数
        const REPEAR_REQUEST_IMG_TIMES = 2
        // 图像缓存，避免重复请求相同的图片
        const cachePic = new Map<string, IntelSnapImgDto>()

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
            // 通道名称
            chlName: '',
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

            if (history.state.eventType) {
                const eventType: string[] = []
                switch (history.state.eventType) {
                    case 'aoi_entry':
                    case 'aoi_leave':
                    case 'perimeter':
                        eventType.push('intrusion')
                        break
                    case 'tripwire':
                        eventType.push('tripwire')
                        break
                    case 'pass_line':
                        eventType.push('passLine')
                        break
                    case 'video_metavideo':
                        eventType.push('videoMetadata')
                        break
                }
                delete history.state.eventType
                if (eventType.length) {
                    formData.value.event = eventType
                }
                getData()
            }
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
            if (!row || !row.imgId || !row.frameTime) {
                return getNonce() + ''
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
            playerData.value.chlName = row.chlName

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
            playerData.value.chlName = ''
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
            tableRef.value!.clearSelection()
            formData.value.pageIndex = pageIndex
            sliceTableData.value = tableData.value.slice((pageIndex - 1) * formData.value.pageSize, pageIndex * formData.value.pageSize)
            sliceTableData.value.forEach(async (item, i) => {
                const key = getUniqueKey(item)
                const flag = await getPic(item, false, i)

                if (flag) {
                    const flag2 = await getPic(item, true, i)
                    if (flag2) {
                        const pic = cachePic.get(key)!
                        item.pic = pic.pic
                        item.panorama = pic.panorama
                        item.width = pic.width
                        item.height = pic.height
                        item.X1 = pic.X1
                        item.Y1 = pic.Y1
                        item.X2 = pic.X2
                        item.Y2 = pic.Y2
                        item.isDelSnap = pic.isDelSnap
                        item.isNoData = pic.isNoData
                        item.attribute = pic.attribute
                        item.eventType = pic.eventType
                        item.targetType = pic.targetType
                        item.plateNumber = pic.plateNumber
                    }
                }
            })
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
                const pic = cachePic.get(key)
                if (!row.isDelSnap && (!pic || !pic.pic || !pic.panorama)) {
                    const sendXml = rawXml`
                        <condition>
                            <imgId>${row.imgId}</imgId>
                            <chlId>${row.chlId}</chlId>
                            <frameTime>${row.frameTime}</frameTime>
                            <pathGUID>${row.pathGUID}</pathGUID>
                            <sectionNo>${row.sectionNo}</sectionNo>
                            <fileIndex>${row.fileIndex}</fileIndex>
                            <blockNo>${row.bolckNo}</blockNo>
                            <offset>${row.offset}</offset>
                            <eventType>${row.eventTypeID}</eventType>
                            ${isPanorama ? '<isPanorama />' : ''}
                        </condition>
                    `
                    const result = await requestSmartTargetSnapImage(sendXml)
                    const $ = queryXml(result)

                    if ($('status').text() === 'success') {
                        const content = $('content').text()
                        if (!content && times < REPEAR_REQUEST_IMG_TIMES) {
                            return getPic(row, isPanorama, index, times + 1)
                        }
                        const width = $('rect/ptWidth').text().num() || 1
                        const height = $('rect/ptHeight').text().num() || 1
                        const leftTopX = $('rect/leftTopX').text().num()
                        const leftTopY = $('rect/leftTopY').text().num()
                        const rightBottomX = $('rect/rightBottomX').text().num()
                        const rightBottomY = $('rect/rightBottomY').text().num()
                        const item = {
                            pic: pic ? pic.pic : '',
                            panorama: pic ? pic.panorama : '',
                            eventType: $('eventType').text(),
                            targetType: $('targetType').text(),
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

                        $('attribute/item').forEach((attribute) => {
                            item.attribute[attribute.attr('type')] = attribute.text()
                        })

                        if (isPanorama) {
                            item.panorama = wrapBase64Img(content)
                        } else {
                            item.pic = wrapBase64Img(content)
                        }
                        cachePic.set(key, item)
                    } else {
                        const item = pic || new IntelSnapImgDto()
                        const errorCode = $('errorCode').text().num()
                        switch (errorCode) {
                            case ErrorCode.HTTPS_CERT_EXIST:
                                item.isDelSnap = true
                                item.isNoData = false
                                cachePic.set(key, item)
                                break
                            case ErrorCode.USER_ERROR_NO_RECORDDATA:
                                item.isDelSnap = false
                                item.isNoData = true
                                cachePic.set(key, item)
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
            stop()

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
                    <startTime>${localToUtc(formData.value.dateRange[0], DEFAULT_DATE_FORMAT)}</startTime>
                    <endTime>${localToUtc(formData.value.dateRange[1], DEFAULT_DATE_FORMAT)}</endTime>
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
            cachePic.clear()
            tableData.value = []
            formData.value.eventType = [...formData.value.event]

            const result = await searchSmartTarget(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                tableData.value = $('content/i').map((item) => {
                    const isDelSnap = item.attr('s') === 'd'
                    const split = item.text().array()
                    const guid = hexToDec(split[3])
                    const chlId = getChlGuid16(split[3]).toUpperCase()
                    const timestamp = hexToDec(split[0]) * 1000
                    return {
                        isDelSnap: isDelSnap,
                        isNoData: false,
                        plateNumber: '',
                        imgId: hexToDec(split[2]) + '',
                        timestamp: hexToDec(split[0]) * 1000,
                        frameTime: localToUtc(timestamp) + ':' + padStart(hexToDec(split[1]), 7),
                        guid,
                        chlId,
                        chlName: chlMap[chlId] || Translate('IDCS_HISTORY_CHANNEL'),
                        recStartTime: hexToDec(split[4]) * 1000,
                        recEndTime: hexToDec(split[5]) * 1000,
                        pathGUID: split[6],
                        sectionNo: hexToDec(split[7]),
                        fileIndex: hexToDec(split[8]),
                        bolckNo: hexToDec(split[9]),
                        offset: hexToDec(split[10]),
                        eventTypeID: hexToDec(split[11]),
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
                openMessageBox(Translate('IDCS_NO_RECORD_DATA'))
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
                tableRef.value!.clearSelection()
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
                openMessageBox(Translate('IDCS_CHANNEL_BACUP_NO_PERMISSION').formatForLang(find.chlName))
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
                openMessageBox(Translate('IDCS_NO_RECORD_DATA'))
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

        onBeforeRouteLeave(() => {
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
        }
    },
})
