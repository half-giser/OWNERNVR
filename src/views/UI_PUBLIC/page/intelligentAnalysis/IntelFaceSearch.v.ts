/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-29 09:54:23
 * @Description: 智能分析-人脸搜索
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-12 13:43:17
 */
import {
    IntelFaceImgDto,
    IntelSearchFaceList,
    type IntelSnapPopList,
    type IntelFaceDBGroupDto,
    IntelFaceDBFaceInfo,
    IntelFaceDBSnapFaceList,
    type IntelFaceMatchPopList,
    type IntelFaceDBGroupList,
    type IntelFaceDBImportFaceDto,
    type IntelFaceTrackMapList,
} from '@/types/apiType/intelligentAnalysis'
import type { TableInstance, CheckboxValueType } from 'element-plus'
import { type PlaybackPopList } from '@/components/player/BasePlaybackPop.vue'
import BackupPop from '../searchAndBackup/BackupPop.vue'
import BackupLocalPop from '../searchAndBackup/BackupLocalPop.vue'
import IntelBaseSnapPop from './IntelBaseSnapPop.vue'
import IntelFaceDBSnapRegisterPop from './IntelFaceDBSnapRegisterPop.vue'
import IntelBaseSnapItem from './IntelBaseSnapItem.vue'
import IntelBaseFaceMatchPop from './IntelBaseFaceMatchPop.vue'
import IntelFaceSearchChooseFacePop from './IntelFaceSearchChooseFacePop.vue'
import IntelFaceSearchTrackMapPanel from './IntelFaceSearchTrackMapPanel.vue'
import { type PlaybackBackUpRecList } from '@/types/apiType/playback'
import { type DownloadZipOptions } from '@/utils/tools'
import dayjs from 'dayjs'

export default defineComponent({
    components: {
        BackupPop,
        BackupLocalPop,
        IntelBaseSnapItem,
        IntelBaseSnapPop,
        IntelFaceDBSnapRegisterPop,
        IntelBaseFaceMatchPop,
        IntelFaceSearchChooseFacePop,
        IntelFaceSearchTrackMapPanel,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const dateTime = useDateTimeStore()
        const auth = useUserChlAuth()

        // 图像失败重新请求最大次数
        const REPEAR_REQUEST_IMG_TIMES = 2
        // 图像缓存，避免重复请求相同的图片 key为imgId+timestamp
        const cachePic: Record<string, IntelFaceImgDto> = {}
        // 个人信息缓存，避免重复请求相同的个人信息 key 为 faceFeatureId
        const cacheInfo: Record<string, IntelFaceDBFaceInfo> = {}
        // 缓存导入图像
        let cacheImportFace: string[] = []
        // 缓存抓拍图像
        let cacheSnapFace: string[] = []

        const pageData = ref({
            // 搜索类型
            searchType: 'event',
            // 搜索选项
            searchOptions: [
                {
                    label: Translate('IDCS_BY_EVENT'),
                    value: 'event',
                },
                {
                    label: Translate('IDCS_BY_FACE'),
                    value: 'face',
                },
            ],
            // 是否搜索多张人脸（用于判断是否可以显示轨迹）
            isMultiFaceSearch: false,
            // 日期范围类型
            dateRangeType: 'date',
            // 图表类型
            chartType: 'list',
            // 图表选项
            chartTypeOptions: [
                {
                    label: Translate('IDCS_OPERATE_SNAPSHOT_MSPB'),
                    value: 'list',
                    hide: [],
                },
                {
                    label: Translate('IDCS_LIST'),
                    value: 'table',
                    hide: [],
                },
                // 只在按人脸中显示
                {
                    label: Translate('IDCS_TRACK_MAP'),
                    value: 'track',
                    hide: ['event'],
                },
            ],
            // 列表类型 （抓拍/原图/）
            listType: 'snap',
            // 列表选项
            listTypeOptions: [
                {
                    label: Translate('IDCS_FACE_SNAP_IMAGE'),
                    value: 'snap',
                    hide: [],
                },
                // 在按人脸或事件-识别成功中显示
                {
                    label: Translate('IDCS_FACE_MATCH_IMAGE'),
                    value: 'match',
                    hide: ['byAll', 'byStrangerList'],
                },
                {
                    label: Translate('IDCS_PANORAMA'),
                    value: 'panorama',
                    hide: [],
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
            // 事件选项
            eventOptions: [
                {
                    label: Translate('IDCS_ALL_EVENT'),
                    value: 'byAll',
                    eventType: 'faceDetection',
                },
                {
                    label: Translate('IDCS_SUCCESSFUL_RECOGNITION'),
                    value: 'byWhiteList',
                    eventType: 'faceMatchWhiteList',
                },
                {
                    label: Translate('IDCS_GROUP_STRANGER'),
                    value: 'byStrangerList',
                    eventType: 'faceMatchStranger',
                },
            ],
            // 通道选项
            chlOptions: [] as SelectOption<string, string>[],
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
            selection: [] as IntelSearchFaceList[],
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
            // 是否打开注册人脸弹窗
            isRegisterPop: false,
            // 注册人脸图
            registerPic: '',
            // 通道弹窗
            isChlPop: false,
            // 是否打开人脸比对弹窗
            isMatchPop: false,
            // 人脸比对列表
            matchList: [] as IntelFaceMatchPopList[],
            // 当前选中的匹配列表的索引
            matchIndex: 0,
            // 选择人脸弹窗
            isChoosePop: false,
            // 人脸数据库选项
            faceDatabaseList: [] as IntelFaceDBGroupDto[],
            trackMapList: [] as IntelFaceTrackMapList[],
        })

        const formData = ref({
            dateRange: [0, 0] as [number, number],
            pageIndex: 1,
            pageSize: 40,
            event: 'byAll',
            chls: [] as SelectOption<string, string>[],
            similarity: 75,
            searchType: 'event',
            eventType: 'byAll',
            identityFlag: false,
            face: '',
            faceType: '',
            snapFace: [] as IntelFaceDBSnapFaceList[],
            featureFace: [] as IntelFaceDBFaceInfo[],
            featureFaceGroup: [] as IntelFaceDBGroupList[],
            importFace: [] as IntelFaceDBImportFaceDto[],
        })

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
            dateRangeType: 'date',
        })

        const playerRef = ref<PlayerInstance>()

        const tableRef = ref<TableInstance>()

        const tableData = ref<IntelSearchFaceList[]>([])

        const sliceTableData = ref<IntelSearchFaceList[]>([])

        const cloneIntelSearchFaceList = new IntelSearchFaceList()
        // 将列表数据整理为拥有日期cols span的列表数据，用于渲染显示
        const sliceTableDataWithDateColsSpan = computed(() => {
            const data: IntelSearchFaceList[][] = []
            let currentDate = ''
            let index = -1
            sliceTableData.value.forEach((item) => {
                const date = item.frameTime.split(' ')[0]
                if (date !== currentDate) {
                    index++
                    currentDate = date
                    data[index] = []
                    data[index].push({
                        ...cloneIntelSearchFaceList,
                        timestamp: item.timestamp,
                        faceFeatureId: -1000,
                    })
                }
                data[index].push(item)
            })
            return data.flat()
        })

        const chlMap: Record<string, string> = {}
        const faceGroupMap: Record<string, string> = {}

        // 判断图表按钮是否可见
        const isChartGroupVisible = computed(() => {
            return pageData.value.chartType === 'list'
        })

        // 判断轨迹按钮是否可见
        const isTrackVisible = computed(() => {
            return pageData.value.chartType === 'track'
        })

        // 判断“标识”选项框是否可见
        const isIdentityVisible = computed(() => {
            return formData.value.eventType !== 'byWhiteList'
        })

        /**
         * @description 判断单个图表选项是否可见
         * @param {string[]} coditions
         * @returns {boolean}
         */
        const isChartOptionVisible = (coditions: string[]) => {
            return !coditions.includes(formData.value.searchType)
        }

        // 判断排序选项是否可见
        const isSortVisible = computed(() => {
            return formData.value.searchType !== 'face' && formData.value.eventType !== 'byWhiteList'
        })

        /**
         * @description 判断单个列表选项是否可见
         * @param {string[]} conditions
         * @returns {boolean}
         */
        const isListOptionVisible = (conditions: string[]) => {
            return formData.value.searchType === 'face' || !conditions.includes(formData.value.eventType)
        }

        // 是否选中多张人脸
        const isMultiFacePic = computed(() => {
            const faceType = formData.value.face
            return (
                faceType === 'group' ||
                (faceType === 'face' && formData.value.featureFace.length > 1) ||
                (faceType === 'snap' && formData.value.snapFace.length > 1) ||
                (faceType === 'import' && formData.value.importFace.length > 1)
            )
        })

        // 判断是否显示人脸信息
        const isFaceInfo = computed(() => {
            return formData.value.featureFace.length === 1 || formData.value.snapFace.length === 1
        })

        // 回显的人脸图片
        const formFacePic = computed(() => {
            const faceType = formData.value.face
            if (faceType === 'face') {
                return formData.value.featureFace[0]?.pic[0] || ''
            }
            if (faceType === 'snap') {
                return formData.value.snapFace[0]?.pic || ''
            }
            if (faceType === 'import') {
                return formData.value.importFace[0]?.pic
            }
            return ''
        })

        const cloneSnapInfo = new IntelFaceDBSnapFaceList()

        // 抓拍库的人脸信息
        const formSnapData = computed(() => {
            if (formData.value.face === 'snap' && formData.value.snapFace.length === 1) {
                return formData.value.snapFace[0]
            }
            return cloneSnapInfo
        })

        const cloneFaceInfo = new IntelFaceDBFaceInfo()

        // 人脸库的人脸信息
        const formFaceData = computed(() => {
            if (formData.value.face === 'face' && formData.value.featureFace.length === 1) {
                return formData.value.featureFace[0]
            }
            return cloneFaceInfo
        })

        /**
         * @description 获取通道列表
         */
        const getChannelList = async () => {
            const result = await getChlList({
                isContainsDeletedItem: true,
                authList: '@spr,@bk',
            })
            const $ = queryXml(result)
            pageData.value.chlOptions = $('//content/item').map((item) => {
                const $item = queryXml(item.element)
                let text = $item('name').text()
                const id = item.attr('id')!
                if (id === '{00000000-0000-0000-0000-000000000000}') {
                    text = Translate('IDCS_HISTORY_CHANNEL')
                }
                chlMap[id] = text
                return {
                    label: text,
                    value: id,
                }
            })
        }

        /**
         * @description 确认修改通道 关闭通道弹窗
         * @param {Array} e
         */
        const confirmChangeChl = (e: SelectOption<string, string>[]) => {
            formData.value.chls = e
        }

        /**
         * @description 更改时间范围类型
         * @param {Array} value 时间戳 ms
         * @param {String} type
         */
        const changeDateRange = (value: [number, number], type: string) => {
            formData.value.dateRange = [...value]
            if (type === 'today') {
                pageData.value.dateRangeType = 'date'
            } else {
                pageData.value.dateRangeType = type
            }
        }

        /**
         * @description 清除选中的人脸数据
         */
        const resetFaceData = () => {
            formData.value.featureFace = []
            formData.value.featureFaceGroup = []
            formData.value.snapFace = []
            formData.value.importFace = []
            formData.value.face = ''
        }

        /**
         * @description 选择抓拍库人脸数据
         * @param {IntelFaceDBSnapFaceList[]} e
         */
        const changeSnap = (e: IntelFaceDBSnapFaceList[]) => {
            resetFaceData()
            formData.value.face = 'snap'
            formData.value.snapFace = e
            getData()
        }

        /**
         * @description 选择人脸库人脸数据
         * @param {IntelFaceDBFaceInfo[]} e
         */
        const changeFace = (e: IntelFaceDBFaceInfo[], shouldAddToCache = true) => {
            resetFaceData()
            if (shouldAddToCache) {
                e.forEach((item) => {
                    cacheInfo[item.id] = { ...item }
                })
            }
            formData.value.face = 'face'
            formData.value.featureFace = e
            getData()
        }

        /**
         * @description 选择人脸库人脸组数据
         * @param {IntelFaceDBGroupList[]} e
         */
        const changeFaceGroup = (e: IntelFaceDBGroupList[]) => {
            resetFaceData()
            formData.value.face = 'group'
            formData.value.featureFaceGroup = e
            getData()
        }

        /**
         * @description 选择外部导入的人脸数据
         * @param {IntelFaceDBImportFaceDto[]} e
         */
        const changeImportFace = (e: IntelFaceDBImportFaceDto[]) => {
            resetFaceData()
            formData.value.face = 'import'
            formData.value.importFace = e
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
         * @returns {String}
         */
        const displayTime = (timestamp: number) => {
            if (timestamp === 0) return ''
            return formatDate(timestamp, dateTime.timeFormat)
        }

        /**
         * @description 格式化日期
         * @param {number} timestamp
         * @returns {String}
         */
        const displayDate = (timestamp: number) => {
            if (timestamp === 0) return ''
            return formatDate(timestamp, dateTime.dateFormat)
        }

        /**
         * @description 抓图卡片上的日期显示
         * @param {number} timestamp
         */
        const displayCardTime = (timestamp: number) => {
            if (pageData.value.dateRangeType === 'date') {
                return displayTime(timestamp)
            } else {
                return displayDateTime(timestamp)
            }
        }

        /**
         * @description 人脸组名称回显
         * @param {string} id
         * @returns {string}
         */
        const displayFaceGroup = (id: string) => {
            return faceGroupMap[id] || ''
        }

        const getUniqueKey = (row: { imgId: string; frameTime: string }) => {
            if (!row.imgId || !row.frameTime) {
                return Math.floor(Math.random() * 1e8) + ''
            }
            return `${row.imgId}:${row.frameTime}`
        }

        /**
         * @description 播放
         * @param {IntelSearchFaceList | IntelFaceTrackMapList} row
         */
        const play = (row: IntelSearchFaceList | IntelFaceTrackMapList) => {
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
         * @description 恢复播放
         */
        const resume = () => {
            playerRef.value?.player.resumeAll()
        }

        /**
         * @description 暂停播放
         */
        const pause = () => {
            playerRef.value?.player.pauseAll()
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
        const handlePlayerTimeUpdate = (index: number, data: any, timestamp: number) => {
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
                const key = getUniqueKey(item)
                const snapFlag = await getPic(item, false, i)
                if (!snapFlag) {
                    break
                }
                const panoramaFlag = await getPic(item, true, i)
                if (!panoramaFlag) {
                    break
                }
                let match = ''
                if (formData.value.eventType === 'byWhiteList' || formData.value.faceType === 'face' || formData.value.faceType === 'group') {
                    const matchFlag = await getFacePic(item, i)
                    if (!matchFlag) {
                        break
                    }

                    const infoFlag = await getFaceInfo(item, i)
                    if (!infoFlag) {
                        break
                    }
                    if (cacheInfo[item.faceFeatureId]) {
                        sliceTableData.value[i].info = {
                            ...cacheInfo[item.faceFeatureId],
                        }
                    }
                    match = cacheInfo[item.faceFeatureId]?.pic[0] || ''
                }
                if (formData.value.faceType === 'import') {
                    match = cacheImportFace[item.faceFeatureId]
                }
                if (formData.value.faceType === 'snap') {
                    match = cacheSnapFace[item.faceFeatureId]
                }
                if (cachePic[key]) {
                    sliceTableData.value[i] = {
                        ...sliceTableData.value[i],
                        ...cachePic[key],
                        match,
                    }
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
         * @param {IntelSearchFaceList} row
         * @param {boolean} isPanorama
         * @param {number} index
         */
        const getPic = async (row: IntelSearchFaceList, isPanorama: boolean, index: number, times = 0) => {
            const key = getUniqueKey(row)
            try {
                if (!row.isDelSnap && (!cachePic[key] || !cachePic[key].pic || !cachePic[key].panorama)) {
                    const sendXml = rawXml`
                        <condition>
                            <imgId>${row.imgId}</imgId>
                            <chlId>${row.chlId}</chlId>
                            <frameTime>${row.frameTime}</frameTime>
                            <featureStatus>true</featureStatus>
                            ${ternary(isPanorama, '<isPanorama />')}
                        </condition>
                    `
                    const result = await requestChSnapFaceImage(sendXml)
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
                            match: '',
                            width,
                            height,
                            X1: leftTopX / width,
                            Y1: leftTopY / height,
                            X2: rightBottomX / width,
                            Y2: rightBottomY / height,
                            isDelSnap: false,
                            isNoData: !content,
                            identity: false,
                        }
                        if (isPanorama) {
                            item.panorama = 'data:image/png;base64,' + content
                        } else {
                            item.pic = 'data:image/png;base64,' + content
                            item.identity = $('//featureStatus').text().toBoolean()
                        }
                        cachePic[key] = item
                    } else {
                        cachePic[key] = cachePic[key] || new IntelFaceImgDto()
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
                if (key === getUniqueKey(sliceTableData.value[index])) {
                    return true
                } else {
                    return false
                }
            } catch (e) {
                if (times < REPEAR_REQUEST_IMG_TIMES) {
                    return getPic(row, isPanorama, index, times + 1)
                } else {
                    cachePic[key] = cachePic[key] || new IntelFaceImgDto()
                    if (key === getUniqueKey(sliceTableData.value[index])) {
                        return true
                    } else {
                        return false
                    }
                }
            }
        }

        /**
         * @description 获取人脸信息
         * @param {IntelSearchFaceList} row
         * @param {number} index
         */
        const getFaceInfo = async (row: IntelSearchFaceList, index: number) => {
            const key = row.faceFeatureId
            try {
                if (!cacheInfo[key]) {
                    const sendXml = rawXml`
                        <pageIndex>1</pageIndex>
                        <pageSize>1</pageSize>
                        <condition>
                            <id>${row.faceFeatureId.toString()}</id>
                        </condition>
                    `
                    const result = await queryFacePersonnalInfoList(sendXml)
                    const $ = queryXml(result)
                    const item = $('//content/item')[0]
                    const $item = queryXml(item.element)
                    cacheInfo[key] = {
                        id: item.attr('id')!,
                        number: $item('number').text(),
                        name: $item('name').text(),
                        sex: $item('sex').text(),
                        birthday: formatDate($item('birthday').text(), dateTime.dateFormat, 'YYYY-MM-DD'),
                        nativePlace: $item('nativePlace').text(),
                        certificateType: $item('certificateType').text(),
                        certificateNum: $item('certificateNum').text(),
                        mobile: $item('mobile').text(),
                        faceImgCount: Number($item('faceImgCount').text()),
                        note: $item('remark').text(),
                        pic: [],
                        groupId: $item('groups/item/groupId').text(),
                    }

                    const pic = await getFacePic(row)
                    cacheInfo[key].pic.push(pic)
                }
                if (getUniqueKey(row) === getUniqueKey(sliceTableData.value[index])) {
                    return true
                } else {
                    return false
                }
            } catch (e) {
                cacheInfo[key] = cacheInfo[key] || { ...cloneFaceInfo }
                if (getUniqueKey(row) === getUniqueKey(sliceTableData.value[index])) {
                    return true
                } else {
                    return false
                }
            }
        }

        /**
         * @description 获取人脸库的人脸图
         * @param {IntelSearchFaceList} row
         * @param {Number} times
         */
        const getFacePic = async (row: IntelSearchFaceList, times = 0) => {
            try {
                const sendXml = rawXml`
                    <condition>
                        <id>${row.faceFeatureId.toString()}</id>
                        <index>1</index>
                    </condition>
                `
                const result = await requestFacePersonnalInfoImage(sendXml)
                const $ = queryXml(result)
                if ($('//status').text() === 'success') {
                    const content = $('//content').text()
                    if (!content) {
                        return ''
                    } else {
                        return 'data:image/png;base64,' + content
                    }
                } else {
                    // 重复获取数据
                    if (times < REPEAR_REQUEST_IMG_TIMES) {
                        return getFacePic(row, times + 1)
                    } else {
                        return ''
                    }
                }
            } catch (e) {
                if (times < REPEAR_REQUEST_IMG_TIMES) {
                    return getFacePic(row, times + 1)
                } else {
                    return ''
                }
            }
        }

        /**
         * @description 获取人脸数据库列表
         */
        const getFaceDatabaseList = async () => {
            const result = await queryFacePersonnalInfoGroupList()
            const $ = queryXml(result)

            pageData.value.faceDatabaseList = $('//content/item').map((item) => {
                const $item = queryXml(item.element)
                faceGroupMap[$item('groupId').text()] = $item('name').text()
                return {
                    id: item.attr('id')!,
                    groupId: $item('groupId').text(),
                    name: $item('name').text(),
                }
            })
        }

        const getTrackMapList = () => {
            pageData.value.trackMapList = tableData.value
                .map((item) => ({
                    chlId: item.chlId,
                    chlName: item.chlName,
                    recStartTime: item.recStartTime,
                    recEndTime: item.recEndTime,
                    timestamp: item.timestamp,
                    imgId: item.imgId,
                    frameTime: item.frameTime,
                }))
                .toSorted((a, b) => {
                    return a.timestamp - b.timestamp
                })
        }

        /**
         * @description 获取列表数据
         */
        const getData = async () => {
            const chlXml = (formData.value.chls.length ? formData.value.chls : pageData.value.chlOptions)
                .map((item) => {
                    return `<item id="${item.value}"></item>`
                })
                .join('')

            let eventXml = ''
            let faceXml = ''
            if (pageData.value.searchType === 'event') {
                eventXml = rawXml`
                    <event>
                        <eventType>${formData.value.event}</eventType>
                    </event>
                `
            } else {
                const faceType = formData.value.face
                if (faceType === '') {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_SELECT_FACE_EMPTY'),
                    })
                    return
                } else {
                    const imgData = formData.value.importFace
                        .map(
                            (item) => rawXml`
                                <item>
                                    <imgData>${item.pic.split(',')[1]}</imgData>
                                    <imgWidth>${item.width.toString()}</imgWidth>
                                    <imgHeight>${item.height.toString()}</imgHeight>
                                </item>
                            `,
                        )
                        .join('')
                    const snapData = formData.value.snapFace
                        .map(
                            (item) => rawXml`
                                <item>
                                    <frameTime>${item.frameTime}</frameTime>
                                    <img id="${item.imgId.toString()}"></img>
                                    <chl id="${item.chlId}"></chl>
                                    <index>0</index>
                                </item>
                            `,
                        )
                        .join('')
                    faceXml = rawXml`
                        ${ternary(faceType === 'face', `<faceFeatures type="list">${formData.value.featureFace.map((item) => `<item>${item.id}</item>`).join('')}</faceFeatures>`)}
                        ${ternary(faceType === 'group', `<faceFeatureGroups type="list">${formData.value.featureFaceGroup.map((item) => `<item id="${item.groupId}"></item>`).join('')}</faceFeatureGroups>`)}
                        ${ternary(faceType === 'snap', `<faceImgs type="list">${snapData}</faceImgs>`)}
                        <faceImgData>${ternary(faceType === 'import', imgData)}</faceImgData>
                    `
                    pageData.value.isMultiFaceSearch =
                        formData.value.featureFaceGroup.length > 0 || formData.value.featureFace.length > 1 || formData.value.snapFace.length > 1 || formData.value.importFace.length > 1
                }
            }

            const sendXml = rawXml`
                <resultLimit>10000</resultLimit>
                <condition>
                    <startTime>${formatDate(formData.value.dateRange[0], 'YYYY-MM-DD HH:mm:ss')}</startTime>
                    <endTime>${formatDate(formData.value.dateRange[1], 'YYYY-MM-DD HH:mm:ss')}</endTime>
                    <chls type="list">${chlXml}</chls>
                    ${eventXml}
                    ${faceXml}
                    <similarity>${formData.value.similarity.toString()}</similarity>
                </condition>
            `

            openLoading()
            formData.value.searchType = pageData.value.searchType
            formData.value.eventType = pageData.value.searchType === 'face' ? '' : formData.value.event
            formData.value.faceType = pageData.value.searchType === 'face' ? formData.value.face : ''
            tableData.value = []
            cacheImportFace = formData.value.importFace.map((item) => item.pic)
            cacheSnapFace = formData.value.snapFace.map((item) => item.pic)

            const result = await searchImageByImageV2(sendXml)
            const $ = queryXml(result)

            const eventType = formData.value.searchType === 'face' ? '' : pageData.value.eventOptions.find((item) => item.value === formData.value.event)!.eventType

            closeLoading()

            if ($('//status').text() === 'success') {
                tableData.value = $('//content/i').map((item) => {
                    const isDelSnap = item.attr('s')! === 'd'
                    const split = item.text().split(',')
                    const guid = parseInt(split[4], 16)
                    const chlId = getChlGuid16(split[4]).toUpperCase()
                    const timestamp = parseInt(split[1], 16) * 1000
                    return {
                        faceFeatureId: parseInt(split[0], 16),
                        isDelSnap: isDelSnap,
                        isNoData: false,
                        imgId: parseInt(split[3], 16) + '',
                        timestamp,
                        frameTime: localToUtc(timestamp) + ':' + ('0000000' + parseInt(split[2], 16)).slice(-7),
                        guid,
                        chlId,
                        chlName: chlMap[chlId],
                        recStartTime: parseInt(split[6], 16) * 1000,
                        recEndTime: parseInt(split[7], 16) * 1000,
                        pic: '',
                        panorama: '',
                        match: '',
                        eventType,
                        targetType: 'face',
                        width: 1,
                        height: 1,
                        X1: 0,
                        Y1: 0,
                        X2: 0,
                        Y2: 0,
                        similarity: parseInt(split[5], 16),
                        plateNumber: '',
                        identity: false,
                        info: {
                            ...cloneFaceInfo,
                        },
                    }
                })
                showMaxSearchLimitTips($)

                if (!tableData.value.length) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_NO_RECORD_DATA'),
                    })
                }

                if (!isSortVisible.value) {
                    pageData.value.sortType = 'time'
                }
                getTrackMapList()
            } else {
                const errorCode = Number($('//errorCode').text())
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_WALL_HAVEDECODER:
                    case ErrorCode.USER_ERROR_ONLY_ONE_ADU_EXISTED:
                    case ErrorCode.USER_ERROR_TVWALLSERVER_HAVEWALL:
                        errorInfo = Translate('IDCS_UNQUALIFIED_PICTURE')
                        break
                    case ErrorCode.USER_ERROR_OVER_LIMIT:
                        errorInfo = Translate('IDCS_GROUP_FACE_NUM_IS_TOO_MANY')
                        break
                    case ErrorCode.USER_ERROR_DEV_RESOURCE_LIMITED:
                        errorInfo = Translate('IDCS_DEVICE_BUSY')
                        break
                    default:
                        errorInfo = Translate('IDCS_NO_RECORD_DATA')
                        break
                }
                openMessageTipBox({
                    type: 'info',
                    message: errorInfo,
                })
            }
            changeSortType()
        }

        /**
         * @description 查看抓拍详情
         * @param {IntelSearchFaceList} index
         */
        const showDetail = (row: IntelSearchFaceList) => {
            const index = sliceTableData.value.findIndex((item) => getUniqueKey(item) === getUniqueKey(row))
            stop()
            if (formData.value.eventType === 'byWhiteList' || formData.value.faceType === 'face' || formData.value.faceType === 'group') {
                pageData.value.matchList = sliceTableData.value.map((item) => {
                    return {
                        ...item.info,
                        ...item,
                        info: '',
                        groupName: faceGroupMap[item.info.groupId],
                    }
                })
                pageData.value.matchIndex = index
                pageData.value.isMatchPop = true
            } else {
                pageData.value.detailIndex = index
                pageData.value.isDetailPop = true
            }
        }

        // 已选选项
        const selectionIds = computed(() => {
            return pageData.value.selection.map((item) => getUniqueKey(item))
        })

        /**
         * @description 点击表格行，勾选当前行
         * @param {IntelSearchFaceList} row
         */
        const handleTableRowClick = (row: IntelSearchFaceList) => {
            play(row)
            tableRef.value!.clearSelection()
            tableRef.value!.toggleRowSelection(row, true)
        }

        /**
         * @description 表格勾选项改变回调
         * @param {IntelSearchFaceList[]} row
         */
        const handleTableSelectionChange = (row: IntelSearchFaceList[]) => {
            pageData.value.selection = row
        }

        /**
         * @description 禁用表格选项
         * @param {IntelSearchFaceList} row
         * @returns {boolean}
         */
        const getTableSelectable = (row: IntelSearchFaceList) => {
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
         * @param {IntelSnapPopList | IntelFaceMatchPopList} row
         */
        const playRec = (row: IntelSnapPopList | IntelFaceMatchPopList) => {
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
         * @description 搜索人脸数据
         * @param {IntelSnapPopList | IntelFaceMatchPopList} row
         */
        const searchSnap = (row: IntelSnapPopList | IntelFaceMatchPopList) => {
            changeSnap([
                {
                    timestamp: row.timestamp,
                    frameTime: row.frameTime,
                    imgId: Number(row.imgId),
                    faceFeatureId: '',
                    pic: row.pic,
                    featureStatus: false,
                    chlId: row.chlId,
                    chlName: row.chlName,
                },
            ])
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
                openMessageTipBox({
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
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_NO_RECORD_DATA'),
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
                    openMessageTipBox({
                        type: 'success',
                        message: Translate('IDCS_BACKUP_SUCCESS'),
                    })
                })
                .catch(() => {
                    closeLoading()
                })
        }

        const handleTableSpanMethods = (
            data: any,
        ):
            | number[]
            | {
                  rowspan: number
                  colspan: number
              }
            | undefined => {
            if (data.columnIndex === 1) {
                if (data.row.faceFeatureId === -1000) {
                    return [1, 6]
                } else {
                    return [1, 1]
                }
            }
            if (data.columnIndex !== 1) {
                if (data.row.faceFeatureId === -1000) {
                    return [0, 0]
                } else {
                    return [1, 1]
                }
            }
        }

        onMounted(async () => {
            openLoading()
            await getFaceDatabaseList()
            await getChannelList()
            closeLoading()
            if (history.state.date) {
                changeDateRange([dayjs(history.state.date).hour(0).minute(0).second(0).valueOf(), dayjs(history.state.date).hour(23).minute(59).second(59).valueOf()], 'date')
                delete history.state.date
            }
            if (history.state.faceType) {
                pageData.value.searchType = 'face'
                if (history.state.faceType === 'face') {
                    const item = new IntelFaceDBFaceInfo()
                    item.id = history.state.id
                    item.name = history.state.name
                    item.birthday = history.state.birthday
                    item.certificateNum = history.state.certificateNum
                    item.mobile = history.state.mobile
                    item.pic = [history.state.pic]
                    changeFace([item])
                    delete history.state.faceType
                    delete history.state.id
                    delete history.state.name
                    delete history.state.birthday
                    delete history.state.certificateNum
                    delete history.state.mobile
                    delete history.state.pic
                } else if (history.state.faceType === 'snap') {
                    const item = new IntelFaceDBSnapFaceList()
                    item.chlId = history.state.chlId
                    item.chlName = chlMap[item.chlId]
                    item.faceFeatureId = '0'
                    item.imgId = history.state.imgId
                    item.frameTime = history.state.frameTime
                    item.pic = history.state.pic
                    changeSnap([item])
                    delete history.state.faceType
                    delete history.state.chlId
                    delete history.state.imgId
                    delete history.state.frameTime
                    delete history.state.pic
                }
            }
        })

        onBeforeUnmount(() => {
            stop()
        })

        return {
            formData,
            pageData,
            playerData,
            changeDateRange,
            backUp,
            handleSliderMouseDown,
            handleSliderMouseUp,
            handleSliderChange,
            handlePlayerTimeUpdate,
            displayTime,
            displayDateTime,
            displayDate,
            displayCardTime,
            displayFaceGroup,
            playerRef,
            tableRef,
            tableData,
            sliceTableData,
            changePage,
            play,
            showDetail,
            getData,
            changeSortType,
            handleTableRowClick,
            handleTableSelectionChange,
            handleTableSpanMethods,
            getTableSelectable,
            selectionIds,
            handleSelect,
            handleSelectAll,
            playRec,
            confirmBackUp,
            downloadVideo,
            auth,
            confirmChangeChl,
            isListOptionVisible,
            isSortVisible,
            isChartGroupVisible,
            isChartOptionVisible,
            isTrackVisible,
            isIdentityVisible,
            changeSnap,
            changeFace,
            changeFaceGroup,
            changeImportFace,
            resetFaceData,
            isMultiFacePic,
            isFaceInfo,
            formFacePic,
            formSnapData,
            formFaceData,
            searchSnap,
            stop,
            pause,
            resume,
            getUniqueKey,
            sliceTableDataWithDateColsSpan,
        }
    },
})
