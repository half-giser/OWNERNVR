/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-20 10:30:00
 * @Description: 智能分析-人（人脸、人体、人属性）
 */
import IntelBaseDateTimeSelector from './IntelBaseDateTimeSelector.vue'
import IntelBaseChannelSelector from './IntelBaseChannelSelector.vue'
import IntelBaseProfileSelector from './IntelBaseProfileSelector.vue'
import IntelBaseSnapItem from './IntelBaseSnapItem.vue'

export default defineComponent({
    components: {
        IntelBaseDateTimeSelector,
        IntelBaseChannelSelector,
        IntelBaseProfileSelector,
        IntelBaseSnapItem,
    },
    setup() {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()
        // key对应界面tab类型，value对应协议需要下发的searchType字段
        const SEARCH_TYPE_MAPPING: Record<string, string> = {
            byFace: 'byHumanFacePic',
            byBody: 'byHumanBodyPic',
            byPersonAttribute: 'byHumanBody',
        }
        // 通道ID与通道名称的映射
        let chlIdNameMap: Record<string, string> = {}

        const pageData = ref({
            // 搜索类型（byFace/byBody/byPersonAttribute）
            searchType: 'byFace',
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
                },
            ],
            // 排序类型（按时间/按通道）
            sortType: 'time',
            // 排序选项
            sortOptions: [
                {
                    label: Translate('IDCS_CHANNEL'),
                    value: 'chl',
                },
                {
                    label: Translate('IDCS_TIME'),
                    value: 'time',
                },
            ],
            // 选择的日期时间范围
            dateRange: [0, 0] as [number, number],
            // 选择的通道ID列表
            chlIdList: [] as string[],
            // 选择的属性列表（人属性）
            attributeForPersonAttribute: {} as Record<string, Record<string, number[]>>,
            // 分页器（人脸）
            pageIndexForFace: 1,
            pageSizeForFace: 12,
            // 分页器（人体）
            pageIndexForBody: 1,
            pageSizeForBody: 12,
            // 分页器（人属性）
            pageIndexForPersonAttribute: 1,
            pageSizeForPersonAttribute: 12,
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
            // 是否支持备份（H5模式）
            isSupportBackUp: isBrowserSupportWasm() && !isHttpsLogin(),
        })

        // 列表索引数据（根据分页索引pageIndex和分页大小pageSize从总数据targetIndexDatas中截取的当页列表数据）
        const sliceTargetIndexDatas = ref<IntelTargetIndexItem[]>([])
        // 列表详情数据（遍历列表索引数据的每一项，获取对应的详情数据）
        const sliceTargetDatas = ref<IntelTargetDataItem[]>([])

        /**
         * @description 获取列表数据
         */
        const getAllTargetIndexDatas = async () => {
            console.log(chlIdNameMap)
            const sendXml = rawXml`
                <resultLimit>10000</resultLimit>
                <condition>
                    <searchType>${SEARCH_TYPE_MAPPING[pageData.value.searchType]}</searchType>
                    <startTime isUTC="true">${localToUtc(pageData.value.dateRange[0], DEFAULT_DATE_FORMAT)}</startTime>
                    <endTime isUTC="true">${localToUtc(pageData.value.dateRange[1], DEFAULT_DATE_FORMAT)}</endTime>
                    <chls type="list">${pageData.value.chlIdList.map((item) => `<item id="${item}"></item>`).join('')}</chls>
                </condition>
            `
            console.log(sendXml)
            openLoading()
            const result = await searchTargetIndex(sendXml)
            const $ = queryXml(result)
            closeLoading()
            if ($('status').text() === 'success') {
                const targetIndexDatas: IntelTargetIndexItem[] = $('content/results/item').map((item) => {
                    const $item = queryXml(item.element)
                    const index = $item('index').text() // 索引信息,客户端原封不动返回取图
                    const targetID = $item('targetID').text()
                    const targetType = $item('targetType').text()
                    const chlID = $item('chlID').text()
                    const channelName = $item('channelName').text()
                    const timeStamp = $item('timeStamp').text().num() // 这一帧的时间戳
                    const timeStampUTC = $item('timeStampUTC').text() // 这一帧的时间戳 UTC
                    const timeStamp100ns = ('0000000' + $item('timeStamp100ns').text()).slice(-7) // 这一帧的时间戳 100ns
                    const quality = $item('quality').text() // quality
                    const similarity = $item('similarity').text() // 相似度
                    const eventType = $item('eventType').text() // eventType
                    const libIndex = $item('libIndex').text() // 以图搜索表示是哪张图地搜索结果（用于对比图的展示）
                    const startTime = $item('startTime').text().num() // 目标开始时间戳
                    const startTimeUTC = $item('startTimeUTC').text() // 目标开始时间戳 UTC
                    const endTime = $item('endTime').text().num() // 目标消失的时间戳
                    const endTimeUTC = $item('endTimeUTC').text() // 目标消失的时间戳 UTC
                    return {
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
                    }
                })
                // 设置界面列表索引数据targetIndexDatas
                setCurrTargetIndexDatas(targetIndexDatas)
                // 初始化第一页数据
                handleChangePage(1)
            }
        }

        /**
         * @description 获取通道ID与通道名称的映射
         * @param {Record<string, string>} e
         */
        const getChlIdNameMap = (e: Record<string, string>) => {
            chlIdNameMap = e
        }

        /**
         * @description 手动排序
         */
        const handleSort = (sortType: string) => {
            console.log(sortType)
        }

        /**
         * @description 全选
         */
        const handleSelectAll = () => {
            console.log('handleSelectAll')
        }

        /**
         * @description 切换分页页码
         */
        const handleChangePage = (pageIndex: number) => {
            // 设置分页pageIndex
            setCurrPageIndex(pageIndex)
            // 遍历列表索引数据的每一项，获取对应的详情数据
            const tempPageIndex = getCurrPageIndex()
            const tempPageSize = getCurrPageSize()
            const tempTargetIndexDatas = getCurrTargetIndexDatas()
            sliceTargetIndexDatas.value = tempTargetIndexDatas.slice((tempPageIndex - 1) * tempPageSize, tempPageIndex * tempPageSize)
            setCurrTargetDatas(sliceTargetIndexDatas.value)
        }

        /**
         * @description 设置界面列表详情数据targetDatas
         */
        const setCurrTargetDatas = (targetIndexDatas: IntelTargetIndexItem[]) => {
            const tempTargetDatas: IntelTargetDataItem[] = []
            targetIndexDatas.forEach(async (item) => {
                closeLoading()
                const sendXml = rawXml`
                    <condition>
                        <index>${item.index}</index>
                        <supportRegister>true</supportRegister>
                        ${pageData.value.searchType === 'byFace' || pageData.value.searchType === 'byBody' ? '<featureStatus>true</featureStatus>' : ''}
                    </condition>
                `
                const result = await requestTargetData(sendXml)
                const $ = queryXml(result)
                closeLoading()

                const tempTargetData: IntelTargetDataItem = Object.assign({}, new IntelTargetDataItem(), cloneDeep(item))
                if ($('status').text() === 'success') {
                    const isNoData = false
                    const isDelete = $('content/isDelete').text().bool()
                    const targetID = $('content/targetID').text()
                    const featureStatus = $('content/featureStatus').text()
                    const supportRegister = $('content/supportRegister').text()
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
                        upperCloth: {
                            upperClothType: $('content/humanAttrInfo/upperClothType').text(),
                            upperClothColor: $('content/humanAttrInfo/upperClothColor').text(),
                        },
                        lowerCloth: {
                            lowerClothType: $('content/humanAttrInfo/lowerClothType').text(),
                            lowerClothColor: $('content/humanAttrInfo/lowerClothColor').text(),
                        },
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
                    tempTargetData.isNoData = isNoData
                    tempTargetData.isDelete = isDelete
                    tempTargetData.targetID = targetID
                    tempTargetData.featureStatus = featureStatus
                    tempTargetData.supportRegister = supportRegister
                    tempTargetData.targetType = targetType
                    tempTargetData.timeStamp = timeStamp
                    tempTargetData.timeStampLocal = timeStampLocal
                    tempTargetData.timeStampUTC = timeStampUTC
                    tempTargetData.startTime = startTime
                    tempTargetData.startTimeLocal = startTimeLocal
                    tempTargetData.startTimeUTC = startTimeUTC
                    tempTargetData.endTime = endTime
                    tempTargetData.endTimeLocal = endTimeLocal
                    tempTargetData.endTimeUTC = endTimeUTC
                    tempTargetData.objPicData = objPicData
                    tempTargetData.backgroundPicDatas = backgroundPicDatas
                    tempTargetData.targetTrace = targetTrace
                    tempTargetData.ruleInfos = ruleInfos
                    tempTargetData.humanAttrInfo = humanAttrInfo
                    tempTargetData.vehicleAttrInfo = vehicleAttrInfo
                    tempTargetData.nonMotorVehicleAttrInfo = nonMotorVehicleAttrInfo
                    tempTargetData.plateAttrInfo = plateAttrInfo
                } else {
                    // 组装数据
                    tempTargetData.isNoData = true
                }
                tempTargetDatas.push(tempTargetData)

                // 设置当前界面展示的列表详情数据
                sliceTargetDatas.value = cloneDeep(tempTargetDatas)
                switch (pageData.value.searchType) {
                    case 'byFace':
                        pageData.value.targetDatasForFace = cloneDeep(tempTargetDatas)
                        break
                    case 'byBody':
                        pageData.value.targetDatasForBody = cloneDeep(tempTargetDatas)
                        break
                    case 'byPersonAttribute':
                        pageData.value.targetDatasForPersonAttribute = cloneDeep(tempTargetDatas)
                        break
                    default:
                        break
                }
            })
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
         * @description 获取分页pageSize
         */
        const getCurrPageSize = () => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    return pageData.value.pageSizeForFace
                case 'byBody':
                    return pageData.value.pageSizeForBody
                case 'byPersonAttribute':
                    return pageData.value.pageSizeForPersonAttribute
                default:
                    return 1
            }
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
         * @description 打开/关闭详情
         */
        const switchDetail = () => {
            pageData.value.isDetailOpen = !pageData.value.isDetailOpen
        }

        return {
            pageData,
            sliceTargetDatas,
            getAllTargetIndexDatas,
            getChlIdNameMap,
            handleSort,
            handleSelectAll,
            handleChangePage,
            getCurrTargetDatas,
            displayDateTime,
            switchDetail,
        }
    },
})
