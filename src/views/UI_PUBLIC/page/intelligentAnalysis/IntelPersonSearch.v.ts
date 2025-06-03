/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-20 10:30:00
 * @Description: 智能分析-人（人脸、人体、人属性）
 */
import IntelFaceSearchTrackMapPanel from './IntelFaceSearchTrackMapPanel.vue'
import IntelBaseDateTimeSelector from './IntelBaseDateTimeSelector.vue'
import IntelBaseChannelSelector from './IntelBaseChannelSelector.vue'
import IntelBaseProfileSelector from './IntelBaseProfileSelector.vue'
import IntelFaceSearchChooseFacePop from './IntelFaceSearchChooseFacePop.vue'
import IntelBaseSnapItem from './IntelBaseSnapItem.vue'
import IntelSearchDetailPanel from './IntelSearchDetailPanel.vue'
import IntelSearchBackupPop, { type IntelSearchBackUpExpose } from './IntelSearchBackupPop.vue'
import IntelFaceDBSnapRegisterPop from './IntelFaceDBSnapRegisterPop.vue'
import { type CheckboxValueType } from 'element-plus'

export default defineComponent({
    components: {
        IntelFaceSearchTrackMapPanel,
        IntelBaseDateTimeSelector,
        IntelBaseChannelSelector,
        IntelBaseProfileSelector,
        IntelFaceSearchChooseFacePop,
        IntelBaseSnapItem,
        IntelSearchDetailPanel,
        IntelSearchBackupPop,
        IntelFaceDBSnapRegisterPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const dateTime = useDateTimeStore()
        const auth = useUserChlAuth(true)
        // 三个排序下拉框的引用
        // const faceSortDropdown = ref<DropdownInstance>()
        // const bodySortDropdown = ref<DropdownInstance>()
        // const personAttributeSortDropdown = ref<DropdownInstance>()
        const backupPopRef = ref<IntelSearchBackUpExpose>()
        const detailRef = ref()

        // key对应界面tab类型，value对应协议需要下发的searchType字段
        const SEARCH_TYPE_MAPPING: Record<string, string> = {
            byFace: 'byHumanFacePic',
            byBody: 'byHumanBodyPic',
            byPersonAttribute: 'byHumanBody',
        }
        // key对应界面tab类型，value对应属性弹框返回的属性类型
        const ATTRIBUTE_TYPE_MAPPING: Record<string, string> = {
            byPersonAttribute: 'person',
            byCar: 'car',
            byMotorcycle: 'motor',
        }
        type attrObjToListItem = {
            attrType: string
            attrValue: string[]
        }

        // 界面数据
        const pageData = ref({
            // 搜索类型（byFace/byBody/byPersonAttribute）
            searchType: 'byFace' as 'byFace' | 'byBody' | 'byPersonAttribute',
            isRegisterPop: false,
            registerPic: '',
            // 搜索选项
            searchOptions: [
                {
                    label: Translate('IDCS_FACE'),
                    value: 'byFace',
                },
                {
                    label: Translate('IDCS_FIGURE'),
                    value: 'byBody',
                },
                {
                    label: Translate('IDCS_ATTRIBUTE'),
                    value: 'byPersonAttribute',
                },
            ],
            // 列表类型 （抓拍/原图）
            listType: 'snap',
            // 列表选项
            listTypeOptions: [
                {
                    label: Translate('IDCS_OPERATE_SNAPSHOT_MSPB'),
                    value: 'snap',
                    show: true,
                },
                {
                    label: Translate('IDCS_TRACK_MAP'),
                    value: 'track',
                    show: false,
                },
            ],
            // 是否是以图搜图
            isByPic: false,
            // 排序类型（按时间/按通道）
            sortType: 'time',
            // 排序选项
            sortOptions: [
                {
                    label: Translate('IDCS_CHANNEL'),
                    value: 'chl',
                    status: 'down',
                },
                {
                    label: Translate('IDCS_TIME'),
                    value: 'time',
                    status: 'down',
                },
                {
                    label: Translate('IDCS_SIMILARITY'),
                    value: 'similarity',
                    status: 'down',
                },
            ],
            // 选择的日期时间范围
            dateRange: [0, 0] as [number, number],
            // 选择的通道ID列表
            chlIdList: [] as string[],
            // 选择的属性列表（人属性）
            attributeForPersonAttribute: {} as Record<string, Record<string, string[]>>,
            pageSize: 12,
            // 分页器（人脸）
            pageIndexForFace: 1,
            // 分页器（人体）
            pageIndexForBody: 1,
            // 分页器（人属性）
            pageIndexForPersonAttribute: 1,
            // 列表数据（人脸）
            targetIndexDatasForFace: [] as IntelTargetIndexItem[],
            // 列表数据（人体）
            targetIndexDatasForBody: [] as IntelTargetIndexItem[],
            // 列表数据（人属性）
            targetIndexDatasForPersonAttribute: [] as IntelTargetIndexItem[],
            // 详情数据（人脸）
            targetDatasForFace: [] as IntelTargetDataItem[],
            // 详情数据（人体）
            targetDatasForBody: [] as IntelTargetDataItem[],
            // 详情数据（人属性）
            targetDatasForPersonAttribute: [] as IntelTargetDataItem[],
            // 是否打开详情
            isDetailOpen: false,
            // 当前打开的详情的索引index（特征值的base64）（人脸）
            openDetailIndexForFace: '',
            // 当前打开的详情的索引index（特征值的base64）（人体）
            openDetailIndexForBody: '',
            // 当前打开的详情的索引index（特征值的base64）（人属性）
            openDetailIndexForPersonAttribute: '',
            // 是否是轨迹界面（人脸界面才有轨迹）
            isTrail: false,
            // 是否打开人脸/人体的选择图片弹框
            isChoosePicPop: false,
            picType: '', // 图片类型：抓拍库/人脸库/组/导入...
            snapFace: [] as IntelFaceDBSnapFaceList[], // 抓拍库
            snapBody: [] as IntelBodyDBSnapBodyList[], // 抓拍库
            featureFace: [] as IntelFaceDBFaceInfo[], // 人脸库
            isChangingPic: false, // 是否是通过点击“修改按钮”打开的选择图片弹框
            currChangingIndex: 0, // 当前正在修改的图片index
            // 相似度（人脸）
            similarityForFace: 75,
            // 相似度（人体）
            similarityForBody: 75,
            // 选择的图片列表（人脸）
            picCacheListForFace: [] as (IntelFaceDBSnapFaceList | IntelBodyDBSnapBodyList | IntelFaceDBFaceInfo)[],
            choosePicsForFace: [] as (IntelFaceDBSnapFaceList | IntelBodyDBSnapBodyList | IntelFaceDBFaceInfo)[],
            // 选择的图片列表（人体）
            picCacheListForBody: [] as (IntelFaceDBSnapFaceList | IntelBodyDBSnapBodyList | IntelFaceDBFaceInfo)[],
            choosePicsForBody: [] as (IntelFaceDBSnapFaceList | IntelBodyDBSnapBodyList | IntelFaceDBFaceInfo)[],
            // 备份类型选项
            backupTypeOptions: [
                {
                    label: Translate('IDCS_BACKUP_PICTURE'),
                    value: 'pic',
                },
                {
                    label: Translate('IDCS_BACKUP_RECORD'),
                    value: 'video',
                },
                {
                    label: Translate('IDCS_BACKUP_PICTURE_AND_RECORD'),
                    value: 'pic+video',
                },
            ],
            // 选中的详情数据（人脸）
            selectedTargetDatasForFace: [] as IntelTargetDataItem[],
            // 选中的详情数据（人体）
            selectedTargetDatasForBody: [] as IntelTargetDataItem[],
            // 选中的详情数据（人属性）
            selectedTargetDatasForPersonAttribute: [] as IntelTargetDataItem[],
            // 是否全选
            isCheckedAll: false,
            // 是否支持备份（H5模式）
            isSupportBackUp: isBrowserSupportWasm() && !isHttpsLogin(),
        })
        // 列表索引数据（根据分页索引pageIndex和分页大小pageSize从总数据targetIndexDatas中截取的当页列表数据）
        const sliceTargetIndexDatas = ref<IntelTargetIndexItem[]>([])

        /**
         * @description 获取列表索引数据 - searchTargetIndex
         */
        const getAllTargetIndexDatas = async (isByPic?: boolean) => {
            resetChoosePics()
            resetSortStatus()
            resetCurrSelectedTargetDatas()
            setCurrTargetIndexDatas([])
            setCurrTargetDatas([])
            const currAttrObjToList: attrObjToListItem[] = getCurrAttribute()
            const currPicCacheList: (IntelFaceDBSnapFaceList | IntelBodyDBSnapBodyList | IntelFaceDBFaceInfo)[] = getCurrPicCacheList()
            const sendXml = rawXml`
                <resultLimit>10000</resultLimit>
                <condition>
                    <searchType>${SEARCH_TYPE_MAPPING[pageData.value.searchType]}</searchType>
                    <startTime isUTC="true">${localToUtc(pageData.value.dateRange[0], DEFAULT_DATE_FORMAT)}</startTime>
                    <endTime isUTC="true">${localToUtc(pageData.value.dateRange[1], DEFAULT_DATE_FORMAT)}</endTime>
                    <chls type="list">${pageData.value.chlIdList.map((item) => `<item id="${item}"></item>`).join('')}</chls>
                    ${
                        pageData.value.searchType === 'byPersonAttribute'
                            ? rawXml`<byAttrParams>
                                    <attrs type="list">
                                    ${currAttrObjToList
                                        .map((element) => {
                                            return rawXml`
                                                <item>
                                                    <attrType type="${element.attrType}">${element.attrType}</attrType>
                                                    <attrValues type="list">
                                                        ${element.attrValue
                                                            .map((attr) => {
                                                                return rawXml`
                                                                    <item>${attr}</item>
                                                                `
                                                            })
                                                            .join('')}
                                                    </attrValues>
                                                </item>
                                            `
                                        })
                                        .join('')}
                                    </attrs>
                                </byAttrParams>`
                            : ''
                    }
                    ${
                        currPicCacheList.length > 0
                            ? rawXml`<byPicParams>
                                    <similarity>${pageData.value.searchType === 'byFace' ? pageData.value.similarityForFace : pageData.value.similarityForBody}</similarity>
                                    <picInfos type="list">
                                    ${currPicCacheList
                                        .map((element) => {
                                            return rawXml`
                                                <item>
                                                    ${
                                                        element.featureData
                                                            ? rawXml`<searchAttr>
                                                                    <snapsLib>
                                                                        <featureData>${element.featureData}</featureData>
                                                                    </snapsLib>
                                                                </searchAttr>`
                                                            : element.featureIndex
                                                              ? rawXml`<searchAttr>
                                                                    <snapsLib>
                                                                        <index>${element.featureIndex}</index>
                                                                    </snapsLib>
                                                                </searchAttr>`
                                                              : element.imgId || element.imgId === 0
                                                                ? rawXml`<searchAttr>
                                                                        <snapsLib>
                                                                            <imgId>${element.imgId}</imgId>
                                                                            <chlId>${element.chlId!}</chlId>
                                                                            <frameTime>${element.frameTime!}</frameTime>
                                                                        </snapsLib>
                                                                    </searchAttr>`
                                                                : element.id || element.id === '0'
                                                                  ? rawXml`<searchAttr>
                                                                        <snapsLib>
                                                                            <faceLiraryID>${element.id}</faceLiraryID>
                                                                        </snapsLib>
                                                                    </searchAttr>`
                                                                  : ''
                                                    }
                                                    <index>${element.libIndex || 0}</index>
                                                    <data>${element.picBase64 || ''}</data>
                                                    <picWidth>${element.picWidth || 0}</picWidth>
                                                    <picHeight>${element.picHeight || 0}</picHeight>
                                                </item>
                                                `
                                        })
                                        .join('')}
                                    </picInfos>
                                </byPicParams>`
                            : ''
                    }
                </condition>
            `
            openLoading()
            const result = await searchTargetIndex(sendXml)
            const $ = queryXml(result)
            closeLoading()

            if ($('status').text() === 'success') {
                const targetIndexDatas: IntelTargetIndexItem[] = $('content/results/item').map((item) => {
                    const $item = queryXml(item.element)
                    const checked = false
                    const index = $item('index').text() // 索引信息,客户端原封不动返回取图
                    const targetID = $item('targetID').text()
                    const targetType = $item('targetType').text()
                    const chlID = $item('chlID').text()
                    const channelName = $item('channelName').text()
                    const timeStamp = $item('timeStamp').text().num() // 这一帧的时间戳
                    const timeStampUTC = $item('timeStampUTC').text() // 这一帧的时间戳 UTC
                    const timeStamp100ns = ('0000000' + $item('timeStamp100ns').text()).slice(-7) // 这一帧的时间戳 100ns
                    const quality = $item('quality').text() // quality
                    const similarity = $item('similarity').text().num() // 相似度
                    const eventType = $item('eventType').text() // eventType
                    const libIndex = $item('libIndex').text().num() // 以图搜索表示是哪张图地搜索结果（用于对比图的展示）
                    const startTime = $item('startTime').text().num() // 目标开始时间戳
                    const startTimeUTC = $item('startTimeUTC').text() // 目标开始时间戳 UTC
                    const endTime = $item('endTime').text().num() // 目标消失的时间戳
                    const endTimeUTC = $item('endTimeUTC').text() // 目标消失的时间戳 UTC

                    const personInfoData = new IntelDetailPersonInfo()
                    let isFaceFeature = false

                    if (currPicCacheList[libIndex]) {
                        if (
                            typeof (currPicCacheList[libIndex] as IntelBodyDBSnapBodyList).searchByImageIndex === 'undefined' &&
                            typeof (currPicCacheList[libIndex] as IntelFaceDBSnapFaceList).faceFeatureId === 'undefined'
                        ) {
                            const person = currPicCacheList[libIndex] as IntelFaceDBFaceInfo
                            personInfoData.name = person.name
                            personInfoData.similarity = similarity + ''
                            personInfoData.sex = person.sex
                            personInfoData.number = person.number
                            personInfoData.mobile = person.mobile
                            personInfoData.birthday = person.birthday
                            personInfoData.nativePlace = person.nativePlace
                            personInfoData.certificateType = person.certificateType
                            personInfoData.certificateNum = person.certificateNum
                            personInfoData.groupName = person.groupId
                            personInfoData.groups = [person.groupId]
                            personInfoData.note = person.note

                            isFaceFeature = true
                        }
                    }

                    return {
                        checked,
                        index,
                        targetID,
                        targetType,
                        chlID,
                        channelName,
                        timeStamp,
                        timeStampUTC,
                        timeStamp100ns,
                        quality,
                        similarity,
                        eventType,
                        libIndex,
                        startTime,
                        startTimeUTC,
                        endTime,
                        endTimeUTC,
                        personInfoData,
                        isFaceFeature,
                    }
                })

                if (isByPic) {
                    targetIndexDatas.sort((a, b) => {
                        if (a.similarity !== b.similarity) {
                            return b.similarity - a.similarity
                        }

                        if (a.timeStamp !== b.timeStamp) {
                            return b.timeStamp - a.timeStamp
                        }

                        if (a.timeStamp100ns !== b.timeStamp100ns) {
                            return Number(b.timeStamp100ns) - Number(a.timeStamp100ns)
                        }

                        if (a.chlID !== b.chlID) {
                            const chlIdA = getChlId16(a.chlID)
                            const chlIdB = getChlId16(b.chlID)
                            return chlIdA - chlIdB
                        }
                        return Number(a.targetID) - Number(b.targetID)
                    })
                } else {
                    targetIndexDatas.sort((a, b) => {
                        if (a.timeStamp !== b.timeStamp) {
                            return b.timeStamp - a.timeStamp
                        }

                        if (a.timeStamp100ns !== b.timeStamp100ns) {
                            return Number(b.timeStamp100ns) - Number(a.timeStamp100ns)
                        }

                        if (a.chlID !== b.chlID) {
                            const chlIdA = getChlId16(a.chlID)
                            const chlIdB = getChlId16(b.chlID)
                            return chlIdA - chlIdB
                        }
                        return Number(a.targetID) - Number(b.targetID)
                    })
                }

                if ($('content/IsMaxSearchResultNum').text() === 'true') {
                    openMessageBox(Translate('IDCS_SEARCH_RESULT_LIMIT_TIPS'))
                }

                if (targetIndexDatas.length === 0) {
                    openMessageBox(Translate('IDCS_NO_RECORD_DATA'))
                } else {
                    // 设置界面列表索引数据targetIndexDatas
                    setCurrTargetIndexDatas(targetIndexDatas)
                    // 初始化第一页数据
                    handleChangePage(1)
                }
            } else {
                openMessageBox(Translate('IDCS_NO_RECORD_DATA'))
            }
        }

        /**
         * @description 设置界面列表索引数据targetIndexDatas
         */
        const setCurrTargetIndexDatas = (targetIndexDatas: IntelTargetIndexItem[]) => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    pageData.value.targetIndexDatasForFace = targetIndexDatas
                    break
                case 'byBody':
                    pageData.value.targetIndexDatasForBody = targetIndexDatas
                    break
                case 'byPersonAttribute':
                    pageData.value.targetIndexDatasForPersonAttribute = targetIndexDatas
                    break
                default:
                    break
            }
        }

        /**
         * @description 获取界面列表索引数据targetIndexDatas
         */
        const getCurrTargetIndexDatas = () => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    return pageData.value.targetIndexDatasForFace
                case 'byBody':
                    return pageData.value.targetIndexDatasForBody
                case 'byPersonAttribute':
                    return pageData.value.targetIndexDatasForPersonAttribute
                default:
                    return []
            }
        }

        /**
         * @description 获取列表详情数据 - requestTargetData
         */
        const getCurrPageTargetDatas = async (targetIndexDatas: IntelTargetIndexItem[]) => {
            setCurrTargetDatas(targetIndexDatas)
            const currTargetDatas = getCurrTargetDatas()

            openLoading()
            let reqCount = 0
            currTargetDatas.forEach(async (item) => {
                const sendXml = rawXml`
                    <condition>
                        <index>${item.index}</index>
                        <supportRegister>true</supportRegister>
                        ${pageData.value.searchType === 'byFace' || pageData.value.searchType === 'byBody' ? '<featureStatus>true</featureStatus>' : ''}
                    </condition>
                `
                const result = await requestTargetData(sendXml)
                const $ = queryXml(result)

                if ($('status').text() === 'success') {
                    const isNoData = false
                    const isDelete = $('content/isDelete').text().bool()
                    const targetID = $('content/targetID').text()
                    const featureStatus = $('content/featureStatus').text().bool()
                    const supportRegister = $('content/supportRegister').text().bool()
                    const targetType = $('content/targetType').text()
                    const timeStamp = $('content/timeStamp').text().num()
                    const timeStampLocal = $('content/timeStamp').attr('local')
                    const timeStampUTC = $('content/timeStamp').attr('utc')
                    const startTime = $('content/startTime').text().num()
                    const startTimeLocal = $('content/startTime').attr('local')
                    const startTimeUTC = $('content/startTime').attr('utc')
                    const endTime = $('content/endTime').text().num()
                    const endTimeLocal = $('content/endTime').attr('local')
                    const endTimeUTC = $('content/endTime').attr('utc')
                    // 抓拍图
                    const objPicData: IntelObjPicDataItem = {
                        data: 'data:image/png;base64,' + $('content/objPicData/data').text(),
                        picWidth: $('content/objPicData/picWidth').text().num(),
                        picHeight: $('content/objPicData/picHeight').text().num(),
                    }
                    // 原图（多目ipc会有多张图）
                    const backgroundPicDatas: IntelBackgroundPicDataList[] = []
                    $('content/backgroundPicDatas/item').forEach((backgroundPicDataXml) => {
                        const $ele = queryXml(backgroundPicDataXml.element)
                        backgroundPicDatas.push({
                            index: $ele('index').text(),
                            data: 'data:image/png;base64,' + $ele('data').text(),
                            picWidth: $ele('picWidth').text().num(),
                            picHeight: $ele('picHeight').text().num(),
                        })
                    })
                    // 目标框
                    const leftTopX = $('content/rect/leftTop/x').text().num()
                    const leftTopY = $('content/rect/leftTop/y').text().num()
                    const rightBottomX = $('content/rect/rightBottom/x').text().num()
                    const rightBottomY = $('content/rect/rightBottom/y').text().num()
                    const scaleWidth = $('content/scaleWidth').text().num()
                    const scaleHeight = $('content/scaleHeight').text().num()
                    const targetTrace: IntelTargetTraceItem = {
                        X1: leftTopX / scaleWidth,
                        Y1: leftTopY / scaleHeight,
                        X2: rightBottomX / scaleWidth,
                        Y2: rightBottomY / scaleHeight,
                    }
                    // 告警规则信息
                    const ruleInfos: IntelRuleInfoList[] = []
                    $('content/ruleInfos/item').forEach((ruleInfoXml) => {
                        const ruleInfoData: IntelRuleInfoList = {
                            direction: 'none', // 林忠源：AP未接入方向信息，暂时不绘制方向
                            startPoint: { X: 0, Y: 0 },
                            endPoint: { X: 0, Y: 0 },
                            points: [],
                        }
                        const $ele = queryXml(ruleInfoXml.element)
                        $ele('points/item').forEach((pointXml, pointIndex) => {
                            const $el = queryXml(pointXml.element)
                            // 2个点表示线端
                            if ($ele('points/item').length === 2) {
                                if (pointIndex === 0) {
                                    ruleInfoData.startPoint = {
                                        X: $el('x').text().num(),
                                        Y: $el('y').text().num(),
                                    }
                                } else {
                                    ruleInfoData.endPoint = {
                                        X: $el('x').text().num(),
                                        Y: $el('y').text().num(),
                                    }
                                }
                            }
                            ruleInfoData.points.push({
                                X: $el('x').text().num(),
                                Y: $el('y').text().num(),
                            })
                        })
                        ruleInfos.push(ruleInfoData)
                    })
                    // 人员属性信息
                    const humanAttrInfo: IntelHumanAttrInfoItem = {
                        gender: $('content/humanAttrInfo/gender').text(),
                        ageBracket: $('content/humanAttrInfo/ageBracket').text(),
                        mask: $('content/humanAttrInfo/mask').text(),
                        hat: $('content/humanAttrInfo/hat').text(),
                        glasses: $('content/humanAttrInfo/glasses').text(),
                        backpack: $('content/humanAttrInfo/backpack').text(),
                        upperClothType: $('content/humanAttrInfo/upperClothType').text(),
                        upperClothColor: $('content/humanAttrInfo/upperClothColor').text(),
                        lowerClothType: $('content/humanAttrInfo/lowerClothType').text(),
                        lowerClothColor: $('content/humanAttrInfo/lowerClothColor').text(),
                        skirt: $('content/humanAttrInfo/skirt').text(),
                        direction: $('content/humanAttrInfo/direction').text(),
                    }
                    // 汽车属性信息
                    const vehicleAttrInfo: IntelVehicleAttrInfoItem = {
                        vehicleColor: $('content/vehicleAttrInfo/vehicleColor').text(),
                        vehicleBrand: $('content/vehicleAttrInfo/vehicleBrand').text(),
                        vehicleType: $('content/vehicleAttrInfo/vehicleType').text(),
                    }
                    // 非机动车属性信息
                    const nonMotorVehicleAttrInfo: IntelNonMotorVehicleAttrInfoItem = {
                        nonMotorizedVehicleType: $('content/nonMotorVehicleAttrInfo/nonMotorizedVehicleType').text(),
                    }
                    // 车牌号信息
                    const plateAttrInfo: IntelPlateAttrInfoItem = {
                        plateNumber: $('content/plateAttrInfo/plateNumber').text(),
                        vehicleStyle: $('content/plateAttrInfo/vehicleStyle').text(),
                        plateColor: $('content/plateAttrInfo/plateColor').text(),
                        vehicleColor: $('content/plateAttrInfo/vehicleColor').text(),
                        vehicleBrand: $('content/plateAttrInfo/vehicleBrand').text(),
                        vehicleType: $('content/plateAttrInfo/vehicleType').text(),
                        nonMotorizedVehicleType: $('content/plateAttrInfo/nonMotorizedVehicleType').text(),
                    }

                    // 组装数据
                    item.isNoData = isNoData
                    item.isDelete = isDelete
                    item.targetID = targetID
                    item.featureStatus = featureStatus
                    item.supportRegister = supportRegister
                    item.targetType = targetType
                    item.timeStamp = timeStamp
                    item.timeStampLocal = timeStampLocal
                    item.timeStampUTC = timeStampUTC
                    item.startTime = startTime
                    item.startTimeLocal = startTimeLocal
                    item.startTimeUTC = startTimeUTC
                    item.endTime = endTime
                    item.endTimeLocal = endTimeLocal
                    item.endTimeUTC = endTimeUTC
                    item.objPicData = objPicData
                    item.backgroundPicDatas = backgroundPicDatas
                    item.targetTrace = targetTrace
                    item.ruleInfos = ruleInfos
                    item.humanAttrInfo = humanAttrInfo
                    item.vehicleAttrInfo = vehicleAttrInfo
                    item.nonMotorVehicleAttrInfo = nonMotorVehicleAttrInfo
                    item.plateAttrInfo = plateAttrInfo

                    // 判断当前数据是否被选中
                    const currSelectedTargetDatas = getCurrSelectedTargetDatas()
                    const findIndex = currSelectedTargetDatas.findIndex((selectedItem) => selectedItem.index === item.index)
                    if (findIndex > -1) item.checked = true
                    judgeIsCheckedAll()
                } else {
                    // 组装数据
                    item.isNoData = true
                }

                reqCount++
                if (reqCount >= targetIndexDatas.length) {
                    closeLoading()
                    // 切换分页后默认打开第一个详情
                    if (pageData.value.isDetailOpen) {
                        showDetail(currTargetDatas[0])
                    }
                }
            })
        }

        /**
         * @description 设置界面列表详情数据targetDatas
         */
        const setCurrTargetDatas = (targetIndexDatas: IntelTargetIndexItem[]) => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    pageData.value.targetDatasForFace = targetIndexDatas.map((item) => Object.assign({}, new IntelTargetDataItem(), cloneDeep(item)))
                    break
                case 'byBody':
                    pageData.value.targetDatasForBody = targetIndexDatas.map((item) => Object.assign({}, new IntelTargetDataItem(), cloneDeep(item)))
                    break
                case 'byPersonAttribute':
                    pageData.value.targetDatasForPersonAttribute = targetIndexDatas.map((item) => Object.assign({}, new IntelTargetDataItem(), cloneDeep(item)))
                    break
                default:
                    break
            }
        }

        /**
         * @description 获取界面列表详情数据targetDatas
         */
        const getCurrTargetDatas = () => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    return pageData.value.targetDatasForFace
                case 'byBody':
                    return pageData.value.targetDatasForBody
                case 'byPersonAttribute':
                    return pageData.value.targetDatasForPersonAttribute
                default:
                    return []
            }
        }

        /**
         * @description 设置分页pageIndex
         */
        const setCurrPageIndex = (pageIndex: number) => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    pageData.value.pageIndexForFace = pageIndex
                    break
                case 'byBody':
                    pageData.value.pageIndexForBody = pageIndex
                    break
                case 'byPersonAttribute':
                    pageData.value.pageIndexForPersonAttribute = pageIndex
                    break
                default:
                    break
            }
        }

        /**
         * @description 获取分页pageIndex
         */
        const getCurrPageIndex = () => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    return pageData.value.pageIndexForFace
                case 'byBody':
                    return pageData.value.pageIndexForBody
                case 'byPersonAttribute':
                    return pageData.value.pageIndexForPersonAttribute
                default:
                    return 1
            }
        }

        /**
         * @description 记录当前打开详情的索引index
         */
        const setCurrOpenDetailIndex = (index: string) => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    pageData.value.openDetailIndexForFace = index
                    break
                case 'byBody':
                    pageData.value.openDetailIndexForBody = index
                    break
                case 'byPersonAttribute':
                    pageData.value.openDetailIndexForPersonAttribute = index
                    break
                default:
                    break
            }
        }

        const openDetailIndex = computed(() => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    return pageData.value.openDetailIndexForFace
                case 'byBody':
                    return pageData.value.openDetailIndexForBody
                case 'byPersonAttribute':
                default:
                    return pageData.value.openDetailIndexForPersonAttribute
            }
        })

        /**
         * @description 设置当前界面选择的图片信息列表（只在每次点击搜索的时候更新一次，避免修改、删除所选图片时影响抓拍列表中的对比图展示）
         */
        const resetChoosePics = () => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    pageData.value.choosePicsForFace = cloneDeep(pageData.value.picCacheListForFace)
                    break
                case 'byBody':
                    pageData.value.choosePicsForBody = cloneDeep(pageData.value.picCacheListForBody)
                    break
                default:
                    break
            }
        }

        const choosePics = computed(() => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    return pageData.value.choosePicsForFace
                case 'byBody':
                    return pageData.value.choosePicsForBody
                default:
                    return []
            }
        })

        /**
         * @description 设置当前界面选择的图片信息列表
         */
        const setCurrPicCacheList = (e: (IntelFaceDBSnapFaceList | IntelBodyDBSnapBodyList | IntelFaceDBFaceInfo)[]) => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    if (pageData.value.isChangingPic) {
                        pageData.value.picCacheListForFace.splice(pageData.value.currChangingIndex, 1, ...e)
                    } else {
                        pageData.value.picCacheListForFace = pageData.value.picCacheListForFace.concat(e)
                    }
                    pageData.value.picCacheListForFace.splice(5)
                    pageData.value.picCacheListForFace.forEach((item, index) => {
                        getImageSize(item)
                        item.libIndex = index
                        item.picBase64 = item.pic.includes(';base64,') ? item.pic.split(',')[1] : item.pic
                    })
                    pageData.value.isChangingPic = false
                    break
                case 'byBody':
                    if (pageData.value.isChangingPic) {
                        pageData.value.picCacheListForBody.splice(pageData.value.currChangingIndex, 1, ...e)
                    } else {
                        pageData.value.picCacheListForBody = pageData.value.picCacheListForBody.concat(e)
                    }
                    pageData.value.picCacheListForBody.splice(5)
                    pageData.value.picCacheListForBody.forEach((item, index) => {
                        getImageSize(item)
                        item.libIndex = index
                        item.picBase64 = item.pic.includes(';base64,') ? item.pic.split(',')[1] : item.pic
                    })
                    pageData.value.isChangingPic = false
                    break
                default:
                    break
            }
        }

        /**
         * @description 获取当前界面选择的图片信息列表
         */
        const getCurrPicCacheList = () => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    return pageData.value.picCacheListForFace
                case 'byBody':
                    return pageData.value.picCacheListForBody
                default:
                    return []
            }
        }

        /**
         * @description 获取当前属性数据
         */
        const getCurrAttribute = () => {
            let attrType = ''
            let attrObj = {} as Record<string, string[]>
            let attrObjToList = [] as attrObjToListItem[]
            switch (pageData.value.searchType) {
                case 'byPersonAttribute':
                    attrType = ATTRIBUTE_TYPE_MAPPING[pageData.value.searchType]
                    attrObj = pageData.value.attributeForPersonAttribute[attrType]
                    attrObjToList = []
                    Object.keys(attrObj).forEach((key) => {
                        attrObjToList.push({
                            attrType: key,
                            attrValue: attrObj[key],
                        })
                    })
                    return attrObjToList
                default:
                    return []
            }
        }

        /**
         * @description 获取当前选中的详情数据
         */
        const getCurrSelectedTargetDatas = () => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    return pageData.value.selectedTargetDatasForFace
                case 'byBody':
                    return pageData.value.selectedTargetDatasForBody
                case 'byPersonAttribute':
                    return pageData.value.selectedTargetDatasForPersonAttribute
                default:
                    return []
            }
        }

        /**
         * @description 重置当前选中的详情数据
         */
        const resetCurrSelectedTargetDatas = () => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    pageData.value.selectedTargetDatasForFace = []
                    break
                case 'byBody':
                    pageData.value.selectedTargetDatasForBody = []
                    break
                case 'byPersonAttribute':
                    pageData.value.selectedTargetDatasForPersonAttribute = []
                    break
                default:
                    break
            }
        }

        /**
         * @description 打开图片选择弹框
         */
        const openChoosePicPop = () => {
            pageData.value.isChangingPic = false
            pageData.value.currChangingIndex = 0
            pageData.value.isChoosePicPop = true
        }

        /**
         * @description 选择抓拍库人脸数据 - 抓拍库
         * @param {IntelFaceDBSnapFaceList[]} e
         */
        const chooseFaceSnap = (e: IntelFaceDBSnapFaceList[]) => {
            pageData.value.picType = 'snap'
            pageData.value.snapFace = e
            setCurrPicCacheList(e)
        }

        /**
         * @description 选择抓拍库人体数据 - 抓拍库
         * @param {IntelFaceDBSnapFaceList[]} e
         */
        const chooseBodySnap = (e: IntelBodyDBSnapBodyList[]) => {
            pageData.value.picType = 'snap'
            pageData.value.snapBody = e
            setCurrPicCacheList(e)
        }

        /**
         * @description 选择人脸库人脸数据 - 人脸库
         * @param {IntelFaceDBFaceInfo[]} e
         */
        const chooseFace = (e: IntelFaceDBFaceInfo[]) => {
            pageData.value.picType = 'face'
            pageData.value.featureFace = e
            console.log(pageData.value.featureFace)
            setCurrPicCacheList(e)
        }

        /**
         * @description 修改某一张图片
         */
        const handleChangePic = (index: number) => {
            pageData.value.isChangingPic = true
            pageData.value.currChangingIndex = index
            pageData.value.isChoosePicPop = true
        }

        /**
         * @description 删除某一张图片
         */
        const handleDeletePic = (index: number) => {
            const currPicCacheList = getCurrPicCacheList()
            currPicCacheList.splice(index, 1)
        }

        /**
         * @description 切换分页页码
         */
        const handleChangePage = (pageIndex: number) => {
            // 设置分页pageIndex
            setCurrPageIndex(pageIndex)
            // 遍历列表索引数据的每一项，获取对应的详情数据
            const tempPageIndex = getCurrPageIndex()
            const tempTargetIndexDatas = getCurrTargetIndexDatas()
            sliceTargetIndexDatas.value = tempTargetIndexDatas.slice((tempPageIndex - 1) * pageData.value.pageSize, tempPageIndex * pageData.value.pageSize)
            getCurrPageTargetDatas(sliceTargetIndexDatas.value)
        }

        /**
         * @description 重置排序状态
         */
        const resetSortStatus = () => {
            pageData.value.sortOptions.forEach((item) => {
                item.status = 'down'
            })
            pageData.value.sortType = 'time'
        }

        /**
         * @description 手动排序: 时间排序、通道排序、相似度排序
         */
        const handleSort = (sortType: string) => {
            if (sortType === 'time') {
                if (pageData.value.sortType === 'time') {
                    // 时间排序升序降序切换
                    if (pageData.value.sortOptions.find((item) => item.value === 'time')?.status === 'up') {
                        pageData.value.sortOptions.find((item) => item.value === 'time')!.status = 'down'
                    } else {
                        pageData.value.sortOptions.find((item) => item.value === 'time')!.status = 'up'
                    }
                    handleSortByTime(pageData.value.sortOptions.find((item) => item.value === 'time')!.status)
                } else if (pageData.value.sortType === 'chl') {
                    // 切换为通道排序降序
                    pageData.value.sortOptions.find((item) => item.value === 'chl')!.status = 'down'
                    handleSortByChl('down')
                } else {
                    // 切换为相似度排序降序
                    pageData.value.sortOptions.find((item) => item.value === 'similarity')!.status = 'down'
                    handleSortBySimilarity('down')
                }
            } else if (sortType === 'chl') {
                if (pageData.value.sortType === 'chl') {
                    // 通道排序升序降序切换
                    if (pageData.value.sortOptions.find((item) => item.value === 'chl')?.status === 'up') {
                        pageData.value.sortOptions.find((item) => item.value === 'chl')!.status = 'down'
                    } else {
                        pageData.value.sortOptions.find((item) => item.value === 'chl')!.status = 'up'
                    }
                    handleSortByChl(pageData.value.sortOptions.find((item) => item.value === 'chl')!.status)
                } else if (pageData.value.sortType === 'time') {
                    // 切换为时间排序降序
                    pageData.value.sortOptions.find((item) => item.value === 'time')!.status = 'down'
                    handleSortByTime('down')
                } else {
                    // 切换为相似度排序降序
                    pageData.value.sortOptions.find((item) => item.value === 'similarity')!.status = 'down'
                    handleSortBySimilarity('down')
                }
            } else if (sortType === 'similarity') {
                if (pageData.value.sortType === 'similarity') {
                    // 相似度排序升序降序切换
                    if (pageData.value.sortOptions.find((item) => item.value === 'similarity')?.status === 'up') {
                        pageData.value.sortOptions.find((item) => item.value === 'similarity')!.status = 'down'
                    } else {
                        pageData.value.sortOptions.find((item) => item.value === 'similarity')!.status = 'up'
                    }
                    handleSortBySimilarity(pageData.value.sortOptions.find((item) => item.value === 'similarity')!.status)
                } else if (pageData.value.sortType === 'time') {
                    // 切换为时间排序降序
                    pageData.value.sortOptions.find((item) => item.value === 'time')!.status = 'down'
                    handleSortByTime('down')
                } else {
                    // 切换为通道排序降序
                    pageData.value.sortOptions.find((item) => item.value === 'chl')!.status = 'down'
                    handleSortByChl('down')
                }
            }
            pageData.value.sortType = sortType
        }

        /**
         * @description 时间排序
         * @param {String} sortDirection 排序方向
         */
        const handleSortByTime = (sortDirection: string) => {
            const targetIndexDatas = getCurrTargetIndexDatas()
            if (targetIndexDatas.length === 0) {
                return
            }

            if (sortDirection === 'up') {
                targetIndexDatas.sort((a, b) => {
                    if (a.timeStamp !== b.timeStamp) {
                        return a.timeStamp - b.timeStamp
                    }

                    if (a.timeStamp100ns !== b.timeStamp100ns) {
                        return Number(a.timeStamp100ns) - Number(b.timeStamp100ns)
                    }

                    if (a.similarity !== b.similarity) {
                        return b.similarity - a.similarity
                    }

                    if (a.chlID !== b.chlID) {
                        const chlIdA = getChlId16(a.chlID)
                        const chlIdB = getChlId16(b.chlID)
                        return chlIdA - chlIdB
                    }
                    return Number(a.targetID) - Number(b.targetID)
                })
            } else {
                targetIndexDatas.sort((a, b) => {
                    if (a.timeStamp !== b.timeStamp) {
                        return b.timeStamp - a.timeStamp
                    }

                    if (a.timeStamp100ns !== b.timeStamp100ns) {
                        return Number(b.timeStamp100ns) - Number(a.timeStamp100ns)
                    }

                    if (a.similarity !== b.similarity) {
                        return b.similarity - a.similarity
                    }

                    if (a.chlID !== b.chlID) {
                        const chlIdA = getChlId16(a.chlID)
                        const chlIdB = getChlId16(b.chlID)
                        return chlIdA - chlIdB
                    }
                    return Number(a.targetID) - Number(b.targetID)
                })
            }
            setCurrTargetIndexDatas(targetIndexDatas)
            const tempPageIndex = getCurrPageIndex()
            sliceTargetIndexDatas.value = targetIndexDatas.slice((tempPageIndex - 1) * pageData.value.pageSize, tempPageIndex * pageData.value.pageSize)
            openLoading()
            getCurrPageTargetDatas(sliceTargetIndexDatas.value)
        }

        /**
         * @description 通道排序
         * @param {String} sortDirection 排序方向
         */
        const handleSortByChl = (sortDirection: string) => {
            const targetIndexDatas = getCurrTargetIndexDatas()
            if (targetIndexDatas.length === 0) {
                return
            }

            if (sortDirection === 'up') {
                targetIndexDatas.sort((a, b) => {
                    if (a.chlID !== b.chlID) {
                        const chlIdA = getChlId16(a.chlID)
                        const chlIdB = getChlId16(b.chlID)
                        return chlIdA - chlIdB
                    }

                    if (a.timeStamp !== b.timeStamp) {
                        return b.timeStamp - a.timeStamp
                    }

                    if (a.timeStamp100ns !== b.timeStamp100ns) {
                        return Number(b.timeStamp100ns) - Number(a.timeStamp100ns)
                    }
                    return Number(a.targetID) - Number(b.targetID)
                })
            } else {
                targetIndexDatas.sort((a, b) => {
                    if (a.chlID !== b.chlID) {
                        const chlIdA = getChlId16(a.chlID)
                        const chlIdB = getChlId16(b.chlID)
                        return chlIdB - chlIdA
                    }

                    if (a.timeStamp !== b.timeStamp) {
                        return b.timeStamp - a.timeStamp
                    }

                    if (a.timeStamp100ns !== b.timeStamp100ns) {
                        return Number(b.timeStamp100ns) - Number(a.timeStamp100ns)
                    }
                    return Number(a.targetID) - Number(b.targetID)
                })
            }
            setCurrTargetIndexDatas(targetIndexDatas)
            const tempPageIndex = getCurrPageIndex()
            sliceTargetIndexDatas.value = targetIndexDatas.slice((tempPageIndex - 1) * pageData.value.pageSize, tempPageIndex * pageData.value.pageSize)
            openLoading()
            getCurrPageTargetDatas(sliceTargetIndexDatas.value)
        }

        /**
         * @description 相似度排序
         */
        const handleSortBySimilarity = (sortDirection: string) => {
            const targetIndexDatas = getCurrTargetIndexDatas()
            if (targetIndexDatas.length === 0) {
                return
            }

            if (sortDirection === 'up') {
                targetIndexDatas.sort((a, b) => {
                    if (a.similarity !== b.similarity) {
                        return a.similarity - b.similarity
                    }

                    if (a.timeStamp !== b.timeStamp) {
                        return b.timeStamp - a.timeStamp
                    }

                    if (a.timeStamp100ns !== b.timeStamp100ns) {
                        return Number(b.timeStamp100ns) - Number(a.timeStamp100ns)
                    }

                    if (a.chlID !== b.chlID) {
                        const chlIdA = getChlId16(a.chlID)
                        const chlIdB = getChlId16(b.chlID)
                        return chlIdA - chlIdB
                    }
                    return Number(a.targetID) - Number(b.targetID)
                })
            } else {
                targetIndexDatas.sort((a, b) => {
                    if (a.similarity !== b.similarity) {
                        return b.similarity - a.similarity
                    }

                    if (a.timeStamp !== b.timeStamp) {
                        return b.timeStamp - a.timeStamp
                    }

                    if (a.timeStamp100ns !== b.timeStamp100ns) {
                        return Number(b.timeStamp100ns) - Number(a.timeStamp100ns)
                    }

                    if (a.chlID !== b.chlID) {
                        const chlIdA = getChlId16(a.chlID)
                        const chlIdB = getChlId16(b.chlID)
                        return chlIdA - chlIdB
                    }
                    return Number(a.targetID) - Number(b.targetID)
                })
            }
            setCurrTargetIndexDatas(targetIndexDatas)
            const tempPageIndex = getCurrPageIndex()
            sliceTargetIndexDatas.value = targetIndexDatas.slice((tempPageIndex - 1) * pageData.value.pageSize, tempPageIndex * pageData.value.pageSize)
            openLoading()
            getCurrPageTargetDatas(sliceTargetIndexDatas.value)
        }

        /**
         * @description 备份全部
         */
        const handleBackupAll = () => {
            backupPopRef.value?.startBackup({
                isBackupPic: true,
                isBackupVideo: false,
                indexData: getCurrTargetIndexDatas().map((item) => {
                    return {
                        index: item.index,
                        chlId: item.chlID,
                        chlName: item.channelName,
                        frameTime: item.timeStamp,
                        startTime: item.startTime,
                        endTime: item.endTime,
                    }
                }),
            })
        }

        /**
         * @description 备份选中项
         */
        const handleBackup = (backupType: string) => {
            backupPopRef.value?.startBackup({
                isBackupPic: backupType.includes('pic'),
                isBackupVideo: backupType.includes('video'),
                indexData: getCurrSelectedTargetDatas().map((item) => {
                    return {
                        index: item.index,
                        chlId: item.chlID,
                        chlName: item.channelName,
                        frameTime: item.timeStamp,
                        startTime: item.startTime,
                        endTime: item.endTime,
                    }
                }),
            })
        }

        const handleBackupCurrentTarget = (item: IntelTargetDataItem | IntelTargetIndexItem, type = 'pic') => {
            backupPopRef.value?.startBackup({
                isBackupPic: type.includes('pic'),
                isBackupVideo: type.includes('video'),
                isBackupPlateCsv: type.includes('csv'),
                indexData: [
                    {
                        index: item.index,
                        chlId: item.chlID,
                        chlName: item.channelName,
                        frameTime: item.timeStamp,
                    },
                ],
            })
        }

        /**
         * @description 切换详情界面的展示与隐藏
         */
        const switchDetail = () => {
            pageData.value.isDetailOpen = !pageData.value.isDetailOpen

            if (pageData.value.isDetailOpen) {
                const list = getCurrTargetDatas()
                console.log(list)
                if (pageData.value.isTrail) {
                    if (list.length) {
                        showDetail(list[0])
                    }
                } else {
                    const find = list.find((item) => item.index === openDetailIndex.value)
                    if (find) {
                        showDetail(find)
                    } else if (list.length) {
                        showDetail(list[0])
                    }
                }
            }
        }

        watch(
            () => pageData.value.isTrail,
            (trail) => {
                if (trail && pageData.value.isDetailOpen) {
                    const list = getCurrTargetDatas()
                    if (list.length) {
                        showDetail(list[0])
                    }
                }
            },
        )

        /**
         * @description 打开详情
         */
        const showDetail = (targetDataItem: IntelTargetDataItem) => {
            pageData.value.isDetailOpen = true
            setCurrOpenDetailIndex(targetDataItem.index)
            // 初始化详情
            const isTrail = pageData.value.isTrail
            const currentIndex = targetDataItem.index
            const detailData = isTrail ? getCurrTargetIndexDatas() : getCurrTargetDatas()
            detailRef?.value.init({
                isTrail,
                currentIndex,
                detailData,
            })
        }

        /**
         * @description 关闭详情
         */
        const hideDetail = () => {
            pageData.value.isDetailOpen = false
        }

        /**
         * @description 上一个、下一个按钮切换
         */
        const handleChangeItem = (index: string) => {
            setCurrOpenDetailIndex(index)
        }

        /**
         * @description 勾选/取消勾选
         */
        const handleChecked = (targetDataItem: IntelTargetDataItem) => {
            const currSelectedTargetDatas = getCurrSelectedTargetDatas()
            const findIndex = currSelectedTargetDatas.findIndex((item) => item.index === targetDataItem.index)
            if (targetDataItem.checked) {
                if (findIndex === -1) currSelectedTargetDatas.push(targetDataItem)
            } else {
                if (findIndex > -1) currSelectedTargetDatas.splice(findIndex, 1)
            }
            judgeIsCheckedAll()
        }

        /**
         * @description 勾选/取消勾选 - 全选
         */
        const handleCheckedAll = (checked: CheckboxValueType) => {
            const currTargetDatas = getCurrTargetDatas()
            currTargetDatas.forEach((item) => {
                item.checked = checked as boolean
                handleChecked(item)
            })
        }

        /**
         * @description 判断是否全选
         */
        const judgeIsCheckedAll = () => {
            const currTargetDatas = getCurrTargetDatas()
            pageData.value.isCheckedAll = currTargetDatas.every((item) => item?.checked)
        }

        /**
         * @description 以图搜图
         */
        const handleSearch = async (targetDataItem: IntelTargetDataItem) => {
            const imgDataItem = new IntelFaceDBSnapFaceList()
            imgDataItem.chlId = targetDataItem.chlID
            imgDataItem.featureIndex = targetDataItem.index
            imgDataItem.pic = targetDataItem.objPicData.data
            imgDataItem.picWidth = targetDataItem.objPicData.picWidth
            imgDataItem.picHeight = targetDataItem.objPicData.picHeight

            // NTA1-3999：点击搜索按钮图标时，如果获取不到特征，则走错误提示业务：提示图片不合格，并且该图片不要添加到以图搜图控件中；
            if (targetDataItem.featureStatus) {
                setCurrPicCacheList([imgDataItem])
            } else {
                openLoading()
                try {
                    const imgBase64 = targetDataItem.objPicData.data
                    const picWidth = targetDataItem.objPicData.picWidth
                    const picHeight = targetDataItem.objPicData.picHeight
                    const targetData = await getDetectResultInfos(imgBase64, picWidth, picHeight) // 获取"目标"数据
                    const featureData = await extractTragetInfos(targetData) // 获取目标的"BASE64特征数据"
                    imgDataItem.featureData = featureData
                    setCurrPicCacheList([imgDataItem])
                } catch {
                    openMessageBox(Translate('IDCS_UNQUALIFIED_PICTURE'))
                }
                closeLoading()
            }

            // 关闭详情
            hideDetail()
        }

        /**
         * @description 根据"通道抓拍图"信息数据，去侦测"目标"
         */
        const getDetectResultInfos = async (imgData: string, imgWidth: number, imgHeight: number) => {
            if (!imgData || !imgWidth || !imgHeight) {
                return
            }

            imgData = imgData.includes(';base64,') ? imgData.split(',')[1] : imgData
            const sendXml = rawXml`
                <content>
                    <detectImgInfos>
                        <item index="1">
                            <imgWidth>${imgWidth}</imgWidth>
                            <imgHeight>${imgHeight}</imgHeight>
                            <imgFormat>jpg</imgFormat>
                            <imgData>${imgData}</imgData>
                        </item>
                    </detectImgInfos>
                </content>
            `
            const result = await detectTarget(sendXml)
            const $ = queryXml(result)
            const detectResultInfos = $('content/detectResultInfos/Item').map((item) => {
                const $item = queryXml(item.element)
                const detectIndex = item.attr('index').num()
                return {
                    detectIndex: detectIndex,
                    detectImgInfo: {
                        detectIndex: 1,
                        imgData,
                        imgWidth,
                        imgHeight,
                        imgFormat: 'jpg',
                    },
                    targetList: $item('targetList/item').map((el) => {
                        const $el = queryXml(el.element)
                        return {
                            targetId: el.attr('id').num(),
                            targetType: $el('targetType').text(),
                            rect: {
                                leftTop: {
                                    x: $el('rect/leftTop/x').text().num(),
                                    y: $el('rect/leftTop/y').text().num(),
                                },
                                rightBottom: {
                                    x: $el('rect/rightBottom/x').text().num(),
                                    y: $el('rect/rightBottom/y').text().num(),
                                },
                                scaleWidth: $el('rect/scaleWidth').text().num(),
                                scaleHeight: $el('rect/scaleHeight').text().num(),
                            },
                            featurePointInfos: $el('featurePointInfos/item').map((point) => {
                                const $point = queryXml(point.element)
                                return {
                                    faceFeatureIndex: point.attr('index'),
                                    x: $point('x').text().num(),
                                    y: $point('y').text().num(),
                                }
                            }),
                        }
                    }),
                }
            })

            if (detectResultInfos.length) {
                // 先判断当前图片是否合格（对于以图搜图来说）
                const isDetectHumanFace = pageData.value.searchType === 'byFace'
                const isDetectHumanBody = pageData.value.searchType === 'byBody'
                let targetListLength = 0
                let humanFaceTargetListLength = 0
                let humanBodyTargetListLength = 0
                detectResultInfos.forEach((item1) => {
                    item1.targetList.forEach((item2) => {
                        targetListLength++

                        if (item2.targetType === 'humanFace') {
                            humanFaceTargetListLength++
                        }

                        if (item2.targetType === 'humanBody') {
                            humanBodyTargetListLength++
                        }
                    })
                })
                if (targetListLength > 0) {
                    if (isDetectHumanFace) {
                        if (humanFaceTargetListLength !== 1) {
                            throw new Error('')
                        }
                    } else if (isDetectHumanBody) {
                        if (humanBodyTargetListLength !== 1) {
                            throw new Error('')
                        }
                    } else {
                        throw new Error('')
                    }
                } else {
                    throw new Error('')
                }

                // 获取目标信息
                const find = detectResultInfos[0].targetList.find((item) => item.targetType === 'humanFace' || item.targetType === 'humanBody') // humanFace humanBody
                if (find) {
                    return {
                        detectImgInfo: detectResultInfos[0].detectImgInfo,
                        targetItem: find,
                    }
                } else {
                    throw new Error('')
                }
            }

            throw new Error('')
        }

        /**
         * @description 根据"通道抓拍图"和侦测到的"目标"综合信息数据，去提取目标的"BASE64特征数据"
         */
        const extractTragetInfos = async (data: Awaited<ReturnType<typeof getDetectResultInfos>>) => {
            const detectImgInfo = data!.detectImgInfo
            const targetItem = data!.targetItem
            const sendXml = rawXml`
                <content>
                    <extractImgInfos>
                        <item index="${detectImgInfo.detectIndex}">
                            <imgWidth>${detectImgInfo.imgWidth}</imgWidth>
                            <imgHeight>${detectImgInfo.imgHeight}</imgHeight>
                            <imgFormat>${detectImgInfo.imgFormat}</imgFormat>
                            <imgData>${detectImgInfo.imgData}</imgData>
                            <rect>
                                <leftTop>
                                    <x>${targetItem.rect.leftTop.x}</x>
                                    <y>${targetItem.rect.leftTop.y}</y>
                                </leftTop>
                                <rightBottom>
                                    <x>${targetItem.rect.rightBottom.x}</x>
                                    <y>${targetItem.rect.rightBottom.y}</y>
                                </rightBottom>
                                <scaleWidth>${targetItem.rect.scaleWidth}</scaleWidth>
                                <scaleHeight>${targetItem.rect.scaleHeight}</scaleHeight>
                            </rect>
                            <targetType>${targetItem.targetType}</targetType>
                            <featurePointInfos>
                                ${targetItem.featurePointInfos
                                    .map((point) => {
                                        return rawXml`
                                            <item index="${point.faceFeatureIndex}">
                                                <x>${point.x}</x>
                                                <y>${point.y}</y>
                                            </item>
                                        `
                                    })
                                    .join('')}
                            </featurePointInfos>
                        </item>
                    </extractImgInfos>
                </content>
            `
            const result = await extractTraget(sendXml)
            const $ = queryXml(result)
            return $('extractResultInfos/item/featureData').text()
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
         * @description 获取图片尺寸
         * @param {(IntelFaceDBSnapFaceList | IntelBodyDBSnapBodyList | IntelFaceDBFaceInfo)} 图片信息
         */
        const getImageSize = (item: IntelFaceDBSnapFaceList | IntelBodyDBSnapBodyList | IntelFaceDBFaceInfo) => {
            if (item.pic) {
                const img = new Image()
                img.src = item.pic
                img.onload = () => {
                    item.picWidth = img.width
                    item.picHeight = img.height
                }
            }
        }

        // 是否显示图片选择器
        const showPicChooser = computed(() => {
            if (pageData.value.searchType === 'byFace') {
                return systemCaps.supportFaceMatch
            } else if (pageData.value.searchType === 'byBody') {
                return systemCaps.supportREID
            } else {
                return false
            }
        })

        // 是否需要显示对比图
        const showCompare = computed(() => {
            let flag = false
            const currTargetIndexDatas = getCurrTargetIndexDatas()
            currTargetIndexDatas.forEach((item) => {
                if (item.similarity && item.similarity !== 0) {
                    flag = true
                }
            })
            return flag
        })

        // 备份按钮置灰/可用状态
        const isEnableBackup = computed(() => {
            const currSelectedTargetDatas = getCurrSelectedTargetDatas()
            return currSelectedTargetDatas.length > 0
        })

        const handleRegister = (item: IntelTargetDataItem) => {
            pageData.value.isRegisterPop = true
            pageData.value.registerPic = item.objPicData.data
        }

        const snapItemGrid = computed(() => {
            if (pageData.value.isDetailOpen) {
                return showCompare.value ? 2 : 4
            } else {
                return showCompare.value ? 3 : 6
            }
        })

        const snapItemRatio = computed(() => {
            return showCompare.value ? '66.7%' : '133%'
        })

        const trackChlId = computed(() => {
            return pageData.value.targetIndexDatasForFace.toSorted((a, b) => a.timeStamp - b.timeStamp).map((item) => item.chlID)
        })

        const changeSearchType = () => {
            pageData.value.listType = 'snap'
        }

        // 单张人脸才可显示轨迹
        watchEffect(() => {
            pageData.value.isTrail = pageData.value.listType === 'track'
            pageData.value.listTypeOptions[1].show = pageData.value.searchType === 'byFace' && pageData.value.choosePicsForFace.length === 1
        })

        return {
            pageData,
            detailRef,
            getAllTargetIndexDatas,
            openChoosePicPop,
            chooseFaceSnap,
            chooseBodySnap,
            chooseFace,
            handleChangePic,
            handleDeletePic,
            handleChangePage,
            handleCheckedAll,
            handleSort,
            handleBackupAll,
            handleBackup,
            switchDetail,
            showDetail,
            hideDetail,
            handleChangeItem,
            handleChecked,
            handleSearch,
            displayDateTime,
            showPicChooser,
            showCompare,
            isEnableBackup,
            backupPopRef,
            auth,
            handleBackupCurrentTarget,
            handleRegister,
            snapItemGrid,
            snapItemRatio,
            trackChlId,
            getCurrTargetDatas,
            openDetailIndex,
            choosePics,
            setCurrPageIndex,
            getCurrPageIndex,
            getCurrTargetIndexDatas,
            changeSearchType,
        }
    },
})
