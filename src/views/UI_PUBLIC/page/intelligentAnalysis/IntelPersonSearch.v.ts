/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-20 10:30:00
 * @Description: 智能分析-人（人脸、人体、人属性）
 */
import IntelBaseDateTimeSelector from './IntelBaseDateTimeSelector.vue'
import IntelBaseChannelSelector from './IntelBaseChannelSelector.vue'
import IntelBaseProfileSelector from './IntelBaseProfileSelector.vue'
import IntelFaceSearchChooseFacePop from './IntelFaceSearchChooseFacePop.vue'
import IntelBaseSnapItem from './IntelBaseSnapItem.vue'

export default defineComponent({
    components: {
        IntelBaseDateTimeSelector,
        IntelBaseChannelSelector,
        IntelBaseProfileSelector,
        IntelFaceSearchChooseFacePop,
        IntelBaseSnapItem,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const dateTime = useDateTimeStore()
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
            attributeForPersonAttribute: {} as Record<string, Record<string, string[]>>,
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
            // 选择的图片列表（人体）
            picCacheListForBody: [] as (IntelFaceDBSnapFaceList | IntelBodyDBSnapBodyList | IntelFaceDBFaceInfo)[],
            // 是否支持备份（H5模式）
            isSupportBackUp: isBrowserSupportWasm() && !isHttpsLogin(),
        })
        // 列表索引数据（根据分页索引pageIndex和分页大小pageSize从总数据targetIndexDatas中截取的当页列表数据）
        const sliceTargetIndexDatas = ref<IntelTargetIndexItem[]>([])

        /**
         * @description 获取通道ID与通道名称的映射
         * @param {Record<string, string>} e
         */
        let chlIdNameMap: Record<string, string> = {}
        const getChlIdNameMap = (e: Record<string, string>) => {
            chlIdNameMap = e
            console.log(chlIdNameMap)
        }

        /**
         * @description 获取列表索引数据 - searchTargetIndex
         */
        const getAllTargetIndexDatas = async () => {
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
                            ? ` <byAttrParams>
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
                            ? ` <byPicParams>
                                    <similarity>${pageData.value.searchType === 'byFace' ? pageData.value.similarityForFace : pageData.value.similarityForBody}</similarity>
                                    <picInfos type="list">
                                    ${currPicCacheList
                                        .map((element) => {
                                            return rawXml`
                                                <item>
                                                    ${
                                                        element.featureData
                                                            ? `<searchAttr>
                                                                    <snapsLib>
                                                                        <featureData>${element.featureData}</featureData>
                                                                    </snapsLib>
                                                                </searchAttr>`
                                                            : element.featureIndex
                                                              ? `<searchAttr>
                                                                    <snapsLib>
                                                                        <index>${element.featureIndex}</index>
                                                                    </snapsLib>
                                                                </searchAttr>`
                                                              : element.imgId || element.imgId === 0
                                                                ? `<searchAttr>
                                                                    <snapsLib>
                                                                        <imgId>${element.imgId}</imgId>
                                                                        <chlId>${element.chlId}</chlId>
                                                                        <frameTime>${element.frameTime}</frameTime>
                                                                    </snapsLib>
                                                                </searchAttr>`
                                                                : element.id || element.id === '0'
                                                                  ? `<searchAttr>
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
            const tempTargetDatas: IntelTargetDataItem[] = []
            closeLoading()
            targetIndexDatas.forEach(async (item) => {
                const sendXml = rawXml`
                    <condition>
                        <index>${item.index}</index>
                        <supportRegister>true</supportRegister>
                        ${pageData.value.searchType === 'byFace' || pageData.value.searchType === 'byBody' ? '<featureStatus>true</featureStatus>' : ''}
                    </condition>
                `
                const result = await requestTargetData(sendXml)
                const $ = queryXml(result)

                const tempTargetData: IntelTargetDataItem = Object.assign({}, new IntelTargetDataItem(), cloneDeep(item))
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
                setCurrTargetDatas(cloneDeep(tempTargetDatas))
            })
            closeLoading()
        }

        /**
         * @description 设置界面列表详情数据targetDatas
         */
        const setCurrTargetDatas = (targetDatas: IntelTargetDataItem[]) => {
            switch (pageData.value.searchType) {
                case 'byFace':
                    pageData.value.targetDatasForFace = targetDatas
                    break
                case 'byBody':
                    pageData.value.targetDatasForBody = targetDatas
                    break
                case 'byPersonAttribute':
                    pageData.value.targetDatasForPersonAttribute = targetDatas
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
                    pageData.value.picCacheListForFace.forEach((item) => {
                        getImageSize(item)
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
                    pageData.value.picCacheListForBody.forEach((item) => {
                        getImageSize(item)
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
                    pageData.value.picCacheListForFace = pageData.value.picCacheListForFace.map((item, index) => {
                        item.libIndex = index
                        item.picBase64 = item.pic.includes(';base64,') ? item.pic.split(',')[1] : item.pic
                        return item
                    })
                    return pageData.value.picCacheListForFace
                case 'byBody':
                    pageData.value.picCacheListForBody = pageData.value.picCacheListForBody.map((item, index) => {
                        item.libIndex = index
                        item.picBase64 = item.pic.includes(';base64,') ? item.pic.split(',')[1] : item.pic
                        return item
                    })
                    return pageData.value.picCacheListForBody
                default:
                    return []
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
            getCurrPageTargetDatas(sliceTargetIndexDatas.value)
        }

        /**
         * @description 全选
         */
        const handleSelectAll = () => {
            console.log('handleSelectAll')
        }

        /**
         * @description 手动排序
         */
        const handleSort = (sortType: string) => {
            console.log(sortType)
        }

        /**
         * @description 切换详情界面的展示与隐藏
         */
        const switchDetail = () => {
            pageData.value.isDetailOpen = !pageData.value.isDetailOpen
        }

        /**
         * @description 打开详情
         */
        const showDetail = (targetDataItem: IntelTargetDataItem) => {
            pageData.value.isDetailOpen = true
            setCurrOpenDetailIndex(targetDataItem.index)
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
                img.onload = function () {
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

        // 计算出当前是否需要显示对比图
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

        return {
            pageData,
            getChlIdNameMap,
            getAllTargetIndexDatas,
            getCurrTargetDatas,
            openChoosePicPop,
            chooseFaceSnap,
            chooseBodySnap,
            chooseFace,
            handleChangePic,
            handleDeletePic,
            handleChangePage,
            handleSelectAll,
            handleSort,
            switchDetail,
            showDetail,
            handleSearch,
            displayDateTime,
            showPicChooser,
            showCompare,
        }
    },
})
