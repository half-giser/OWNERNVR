/*
 * @Description: 目标检索页面
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-26 14:21:56
 */
import IntelSearchDetailPanel from './IntelSearchDetailPanel.vue'
import { type TableInstance, type CheckboxValueType } from 'element-plus'
import IntelSearchBackupPop, { type IntelSearchBackUpExpose } from './IntelSearchBackupPop.vue'

export default defineComponent({
    components: {
        IntelSearchDetailPanel,
        IntelSearchBackupPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const auth = useUserChlAuth(true)
        const router = useRouter()
        const backupPopRef = ref<IntelSearchBackUpExpose>()
        const layoutStore = useLayoutStore()

        // 详情弹框
        const detailRef = ref()
        const tableRef = ref<TableInstance>()

        const tableData = ref<SelectOption<string, string>[]>([])

        const pageData = ref({
            // 日期范围类型
            dateRangeType: 'date',
            // 目标特征参数
            targetType: 'humanFace', // humanFace humanBody
            targetFeatureIndex: 0,
            targetFeatureData: '',
            // 检索目标图
            pic: '',
            // 相似度
            similarity: 50,
            // 是否打开详情
            isDetailOpen: false,
            // 排序类型（按时间/按通道）
            sortType: 'similarity',
            // 排序选项
            sortOptions: [
                {
                    label: Translate('IDCS_SIMILARITY'),
                    value: 'similarity',
                    status: 'down',
                },
                {
                    label: Translate('IDCS_TIME'),
                    value: 'time',
                    status: 'down',
                },
            ],
            // 选择的日期时间范围
            dateRange: [0, 0] as [number, number],
            // 选择的通道ID列表
            chlIdList: [] as string[],
            // 分页器（目标检索）
            pageIndexForSearchTarget: 1,
            pageSizeForSearchTarget: 12,
            // 列表数据（目标检索）
            targetIndexDatasForSearchTarget: [] as IntelTargetIndexItem[],
            // 当前打开的详情的索引index（特征值的base64）（目标检索）
            openDetailIndexForSearchTarget: '',
            // 是否是轨迹界面（人脸界面才有轨迹）
            isTrail: false,
            // 详情数据（目标检索）
            targetDatasForSearchTarget: [] as IntelTargetDataItem[],
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
            // 选中的详情数据（目标检索）
            selectedTargetDatasForSearchTarget: [] as IntelTargetDataItem[],
            // 是否全选
            isCheckedAll: false,
            // 是否支持备份（H5模式）
            isSupportBackUp: !isHttpsLogin(),
        })
        // 列表索引数据（根据分页索引pageIndex和分页大小pageSize从总数据targetIndexDatas中截取的当页列表数据）
        const sliceTargetIndexDatas = ref<IntelTargetIndexItem[]>([])

        /**
         * @description 获取通道数据 - 通道ID与通道名称的映射
         */
        const chlIdNameMap: Record<string, string> = {}
        const getChlData = async () => {
            const result = await getChlList({
                isContainsDeletedItem: true,
                authList: '@spr,@bk',
            })
            const $ = queryXml(result)
            tableData.value = $('content/item')
                .map((item) => {
                    const $item = queryXml(item.element)
                    const text = $item('name').text()
                    const id = item.attr('id')
                    if (id === DEFAULT_EMPTY_ID) {
                        return null
                    }
                    pageData.value.chlIdList.push(id)
                    chlIdNameMap[id] = text
                    return {
                        label: text,
                        value: id,
                    }
                })
                .filter((item) => item !== null) // NTA1-1294 不显示已删除通道

            tableRef.value!.toggleAllSelection()
        }

        /**
         * @description 返回
         */
        const handleExit = () => {
            localStorage.removeItem('extractResultInfos')

            if (layoutStore.searchTargetFromPage === 'vehicle') {
                router.push({
                    path: '/intelligent-analysis/search/search-vehicle',
                })
            } else {
                router.push({
                    path: '/intelligent-analysis/search/search-person',
                })
            }
        }

        /**
         * @description 更改时间范围类型
         * @param {Array} value 时间戳 ms
         * @param {String} type
         */
        const changeDateRange = (value: [number, number], type: string) => {
            pageData.value.dateRange = [...value]
            if (type === 'today') {
                pageData.value.dateRangeType = 'date'
            } else {
                pageData.value.dateRangeType = type
            }
        }

        /**
         * @description 选中值更改
         * @param {SelectOption<string, string>[]} row
         */
        const handleCurrentChange = (row: SelectOption<string, string>[]) => {
            pageData.value.chlIdList = row.map((item) => item.value)
        }

        /**
         * @description 获取列表索引数据 - searchTargetIndex
         */
        const getAllTargetIndexDatas = async () => {
            resetSortStatus()
            resetCurrSelectedTargetDatas()
            setCurrTargetIndexDatas([])
            setCurrTargetDatas([])
            const sendXml = rawXml`
                <resultLimit>10000</resultLimit>
                <condition>
                    <searchType>byFeature</searchType>
                    <startTime isUTC="true">${localToUtc(pageData.value.dateRange[0], DEFAULT_DATE_FORMAT)}</startTime>
                    <endTime isUTC="true">${localToUtc(pageData.value.dateRange[1], DEFAULT_DATE_FORMAT)}</endTime>
                    <chls type="list">${pageData.value.chlIdList.map((item) => `<item id="${item}"></item>`).join('')}</chls>
                    <byFeatureParams>
                        <featureInfos type="list">
                            <item>
                                <index>${pageData.value.targetFeatureIndex}</index>
                                <feature>${pageData.value.targetFeatureData}</feature>
                            </item>
                        </featureInfos>
                        <targetType>${pageData.value.targetType}</targetType>
                        <similarity>${pageData.value.similarity}</similarity>
                        <onlyREIDResult>true</onlyREIDResult>
                    </byFeatureParams>
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
                    }
                })

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
            pageData.value.targetIndexDatasForSearchTarget = targetIndexDatas
        }

        /**
         * @description 获取界面列表索引数据targetIndexDatas
         */
        const getCurrTargetIndexDatas = () => {
            return pageData.value.targetIndexDatasForSearchTarget
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
                        <featureStatus>true</featureStatus>
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
            pageData.value.targetDatasForSearchTarget = targetIndexDatas.map((item) => Object.assign({}, new IntelTargetDataItem(), cloneDeep(item)))
        }

        /**
         * @description 获取界面列表详情数据targetDatas
         */
        const getCurrTargetDatas = () => {
            return pageData.value.targetDatasForSearchTarget
        }

        /**
         * @description 设置分页pageIndex
         */
        const setCurrPageIndex = (pageIndex: number) => {
            pageData.value.pageIndexForSearchTarget = pageIndex
        }

        /**
         * @description 获取分页pageIndex
         */
        const getCurrPageIndex = () => {
            return pageData.value.pageIndexForSearchTarget
        }

        /**
         * @description 获取分页pageSize
         */
        const getCurrPageSize = () => {
            return pageData.value.pageSizeForSearchTarget
        }

        /**
         * @description 记录当前打开详情的索引index
         */
        const setCurrOpenDetailIndex = (index: string) => {
            pageData.value.openDetailIndexForSearchTarget = index
        }

        /**
         * @description 获取当前选中的详情数据
         */
        const getCurrSelectedTargetDatas = () => {
            return pageData.value.selectedTargetDatasForSearchTarget
        }

        /**
         * @description 重置当前选中的详情数据
         */
        const resetCurrSelectedTargetDatas = () => {
            pageData.value.selectedTargetDatasForSearchTarget = []
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
         * @description 重置排序状态
         */
        const resetSortStatus = () => {
            pageData.value.sortOptions.forEach((item) => {
                item.status = 'down'
            })
            pageData.value.sortType = 'similarity'
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
            const tempPageSize = getCurrPageSize()
            sliceTargetIndexDatas.value = targetIndexDatas.slice((tempPageIndex - 1) * tempPageSize, tempPageIndex * tempPageSize)
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
            const tempPageSize = getCurrPageSize()
            sliceTargetIndexDatas.value = targetIndexDatas.slice((tempPageIndex - 1) * tempPageSize, tempPageIndex * tempPageSize)
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
            const tempPageSize = getCurrPageSize()
            sliceTargetIndexDatas.value = targetIndexDatas.slice((tempPageIndex - 1) * tempPageSize, tempPageIndex * tempPageSize)
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
                indexData: pageData.value.targetIndexDatasForSearchTarget.map((item) => {
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
        const handleBackup = (type: string) => {
            backupPopRef.value?.startBackup({
                isBackupPic: type.includes('pic'),
                isBackupVideo: type.includes('video'),
                indexData: pageData.value.selectedTargetDatasForSearchTarget.map((item) => {
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
                const find = list.find((item) => item.index === pageData.value.openDetailIndexForSearchTarget)
                if (find) {
                    showDetail(find)
                } else if (list.length) {
                    showDetail(list[0])
                }
            }
        }

        /**
         * @description 打开详情
         */
        const showDetail = (targetDataItem: IntelTargetDataItem) => {
            pageData.value.isDetailOpen = true
            setCurrOpenDetailIndex(targetDataItem.index)
            // 初始化详情
            const isTrail = pageData.value.isTrail
            const currentIndex = targetDataItem.index
            const detailData = pageData.value.targetDatasForSearchTarget
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

        // 备份按钮置灰/可用状态
        const isEnableBackup = computed(() => {
            const currSelectedTargetDatas = getCurrSelectedTargetDatas()
            return currSelectedTargetDatas.length > 0
        })

        const setDefaultData = () => {
            if (localStorage.getItem('extractResultInfos')) {
                const extractResultInfos = JSON.parse(localStorage.getItem('extractResultInfos') || '')
                pageData.value.targetType = extractResultInfos[0].targetType
                pageData.value.targetFeatureIndex = extractResultInfos[0].targetFeatureIndex
                pageData.value.targetFeatureData = extractResultInfos[0].targetFeatureData
                const img = extractResultInfos[0].imgBase64
                pageData.value.pic = img.startsWith('data:image/png;base64,') ? img : 'data:image/png;base64,' + img
            }
        }

        const handleRefresh = () => {
            resetSortStatus()
            resetCurrSelectedTargetDatas()
            setCurrTargetIndexDatas([])
            setCurrTargetDatas([])
            pageData.value.pageIndexForSearchTarget = 1
            pageData.value.selectedTargetDatasForSearchTarget = []
            pageData.value.isDetailOpen = false
            setDefaultData()
        }

        onMounted(async () => {
            setDefaultData()
            getChlData()
        })

        onBeforeUnmount(() => {
            localStorage.removeItem('extractResultInfos')
        })

        return {
            pageData,
            tableData,
            tableRef,
            detailRef,
            handleExit,
            changeDateRange,
            handleCurrentChange,
            getAllTargetIndexDatas,
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
            isEnableBackup,
            handleBackupCurrentTarget,
            auth,
            backupPopRef,
            handleRefresh,
        }
    },
})
