/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-10 18:29:15
 * @Description: 智能分析 - 组合搜索
 */
import IntelBaseChannelSelector from './IntelBaseChannelSelector.vue'
import IntelBaseDateTimeSelector from './IntelBaseDateTimeSelector.vue'
import IntelBaseEventSelector from './IntelBaseEventSelector.vue'
import IntelBaseProfileSelector from './IntelBaseProfileSelector.vue'
import IntelBaseAttributeSelector from './IntelBaseAttributeSelector.vue'
import IntelBaseCollect from './IntelBaseCollect.vue'
import IntelBaseSnapItem from './IntelBaseSnapItem.vue'
import IntelBaseSnapPop from './IntelBaseSnapPop.vue'
import IntelLicencePlateDBAddPlatePop from './IntelLicencePlateDBAddPlatePop.vue'
import IntelFaceDBSnapRegisterPop from './IntelFaceDBSnapRegisterPop.vue'
import type { TableInstance, CheckboxValueType } from 'element-plus'
import BackupPop from '../searchAndBackup/BackupPop.vue'
import BackupLocalPop from '../searchAndBackup/BackupLocalPop.vue'
import { type DownloadZipOptions } from '@/utils/tools'
import dayjs from 'dayjs'

export default defineComponent({
    components: {
        IntelBaseChannelSelector,
        IntelBaseDateTimeSelector,
        IntelBaseEventSelector,
        IntelBaseProfileSelector,
        IntelBaseAttributeSelector,
        IntelBaseCollect,
        IntelBaseSnapItem,
        IntelBaseSnapPop,
        BackupPop,
        BackupLocalPop,
        IntelLicencePlateDBAddPlatePop,
        IntelFaceDBSnapRegisterPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()
        const auth = useUserChlAuth()
        const userSession = useUserSessionStore()

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
            // 是否打开新增车牌弹窗
            isAddPlatePop: false,
            // 新增车牌的车牌号码
            addPlateNumber: '',
            // 是否打开注册人脸弹窗
            isAddFacePop: false,
            // 注册人脸的图像数据
            addFacePic: '',
            // 车牌侦测、车牌识别才下载CSV
            isSupportCSV: false,
        })

        const formData = ref(new IntelSearchCombineForm())

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

        const attributeRange = computed(() => {
            if (formData.value.target.length) {
                const list = [...formData.value.target[0]]
                if (formData.value.target[1]?.length) {
                    list.push('person')
                }
                return list
            }
            return []
        })

        /**
         * @description 获取通道ID与通道名称的映射
         * @param {Record<string, string>} e
         */
        const getChlMap = (e: Record<string, string>) => {
            chlMap = e
        }

        /**
         * @description 收藏回显
         * @param {IntelSearchCollectList} e
         */
        const changeCollect = (e: IntelSearchCollectList) => {
            formData.value.dateRange = e.dateRange
            formData.value.chl = e.chl
            formData.value.attribute = e.profile
            formData.value.event = e.event
            formData.value.plateNumber = e.plateNumber
            formData.value.target = e.attribute
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
         * @param {IntelSearchList} row
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
                        if (flag2) {
                            const pic = cachePic[key]
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
                if (!row.isDelSnap && (!cachePic[key] || !cachePic[key].pic || !cachePic[key].panorama)) {
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
                            pic: cachePic[key] ? cachePic[key].pic : '',
                            panorama: cachePic[key] ? cachePic[key].panorama : '',
                            eventType: $('eventType').text(),
                            targetType: $('targetType').text(),
                            plateNumber: $('plateNumber').text() || '--',
                            width,
                            height,
                            X1: leftTopX / width,
                            Y1: leftTopY / height,
                            X2: rightBottomX / width,
                            Y2: rightBottomY / height,
                            isDelSnap: false,
                            isNoData: !content,
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
                        cachePic[key] = item
                    } else {
                        cachePic[key] = cachePic[key] || new IntelSnapImgDto()
                        const errorCode = $('errorCode').text().num()
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
            stop()

            const attributeXml = Object.keys(formData.value.attribute)
                .filter((key) => attributeRange.value.includes(key))
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
                    <vehicle>
                        ${formData.value.target[0].map((item) => `<item>${item}</item>`).join('')}
                        ${!!formData.value.plateNumber ? `<item num="${formData.value.plateNumber}">plate</item>` : ''}
                    </vehicle>
                    ${!!formData.value.target[1].length ? '<person type="list"><item></item></person>' : ''}
                    <targetAttribute>${attributeXml}</targetAttribute>
                </condition>
            `

            openLoading()
            tableData.value = []
            pageData.value.isSupportCSV = formData.value.event.every((item) => ['plateDetection', 'plateMatchWhiteList', 'plateMatchStranger'].includes(item))

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
                        imgId: hexToDec(split[2]) + '',
                        timestamp,
                        frameTime: localToUtc(timestamp) + ':' + padStart(hexToDec(split[1]), 7),
                        guid,
                        chlId,
                        chlName: chlMap[chlId],
                        recStartTime: hexToDec(split[4]) * 1000,
                        recEndTime: hexToDec(split[5]) * 1000,
                        pathGUID: split[6],
                        sectionNo: hexToDec(split[7]),
                        fileIndex: hexToDec(split[8]),
                        bolckNo: hexToDec(split[9]),
                        offset: hexToDec(split[10]),
                        eventTypeID: hexToDec(split[11]),
                        plateNumber: '--',
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

        /**
         * @description 打开新增车牌弹窗/注册人脸弹窗
         * @param {IntelSnapPopList} row
         */
        const register = (row: IntelSnapPopList) => {
            if (['plateDetection', 'plateMatchStranger'].includes(row.eventType)) {
                pageData.value.addPlateNumber = row.plateNumber
                pageData.value.isAddPlatePop = true
            } else if (['faceDetection', 'faceMatchStranger'].includes(row.eventType)) {
                pageData.value.addFacePic = row.pic
                pageData.value.isAddFacePop = true
            }
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
                downloadCSV()
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
         * @description 生成CSV文件名
         */
        const getCsvName = () => {
            return 'EXPORT_SNAP_PLATE_LIST-' + dayjs().format('YYYYMMDDHHmmss') + '.csv'
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
         * @description 添加CSV到ZIP
         */
        const downloadCSV = () => {
            // 车牌侦测、车牌识别才下载CSV
            if (pageData.value.isSupportCSV) {
                const csvContent: string[] = []
                const csvTitle = [Translate('IDCS_SERIAL_NUMBER'), Translate('IDCS_LICENSE_PLATE_NUM'), Translate('IDCS_CHANNEL'), Translate('IDCS_DEVICE_NAME'), Translate('IDCS_SNAP_TIME')].join(',')
                csvContent.push(csvTitle)
                sliceTableData.value.forEach((item, index) => {
                    csvContent.push([index + 1, item.plateNumber || '--', item.chlName, userSession.csvDeviceName, displayDateTime(item.timestamp)].join(','))
                })
                downloadData.push({
                    content: csvContent.join('\r\n'),
                    folder: '',
                    name: getCsvName(),
                })
            }
        }

        /**
         * @description 下载ZIP
         */
        const createZip = () => {
            openLoading()
            downloadZip({
                zipName: getZipName(pageData.value.selection[0].chlName),
                files: downloadData,
            })
                .then(() => {
                    closeLoading()
                    openMessageBox({
                        type: 'success',
                        message: Translate('IDCS_BACKUP_SUCCESS'),
                    })
                })
                .catch(() => {
                    closeLoading()
                })
        }

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
            register,
            confirmBackUp,
            downloadVideo,
            auth,
            attributeRange,
            getUniqueKey,
            cacheKey: LocalCacheKey.KEY_COMBINE_SEARCH_COLLECTION,
        }
    },
})
