/*
 * @Description: 目标检索页面
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-26 14:21:56
 */
import IntelSearchDetail from './IntelSearchDetail.vue'
export default defineComponent({
    components: {
        IntelSearchDetail,
    },
    setup() {
        const { Translate } = useLangStore()
        const router = useRouter()

        const tableRef = ref<TableInstance>()
        // 排序下拉框的引用
        const dropdownRef = ref<DropdownInstance>()
        const tableData = ref<SelectOption<string, string>[]>([])
        const selected = ref<SelectOption<string, string>[]>([])
        // 详情弹框
        const detailRef = ref()

        // 列表索引数据（根据分页索引pageIndex和分页大小pageSize从总数据targetIndexDatas中截取的当页列表数据）
        const sliceTargetIndexDatas = ref<IntelTargetIndexItem[]>([])
        const pageData = ref({
            // 日期范围类型
            dateRangeType: 'date',
            // 目标特征参数
            targetType: 'humanFace',
            targetFeatureIndex: 0,
            targetFeatureData: '',
            // 检索目标图
            pic: '',
            // 相似度
            similarity: 50,
            // 是否打开详情
            isDetailOpen: false,
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
            // 分页器（人脸）
            pageIndexForFace: 1,
            pageSizeForFace: 12,
            // 列表数据（人脸）
            targetIndexDatasForFace: [] as IntelTargetIndexItem[],
            // 当前打开的详情的索引index（特征值的base64）（人脸）
            openDetailIndexForFace: '',
            // 是否是轨迹界面（人脸界面才有轨迹）
            isTrail: false,
            // 详情数据（人脸）
            targetDatasForFace: [] as IntelTargetDataItem[],
            // 备份类型选项
            backupTypeOptions: [
                {
                    label: Translate('IDCS_BACKUP_PICTURE'),
                    value: 'pic' as 'pic' | 'video' | 'picAndVideo',
                },
                {
                    label: Translate('IDCS_BACKUP_RECORD'),
                    value: 'video' as 'pic' | 'video' | 'picAndVideo',
                },
                {
                    label: Translate('IDCS_BACKUP_PICTURE_AND_RECORD'),
                    value: 'picAndVideo' as 'pic' | 'video' | 'picAndVideo',
                },
            ],
            // 是否支持备份（H5模式）
            isSupportBackUp: isBrowserSupportWasm() && !isHttpsLogin(),
        })

        /**
         * @description 获取通道数据
         */
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
                    return {
                        label: text,
                        value: id,
                    }
                })
                .filter((item) => item !== null) // NTA1-1294 不显示已删除通道
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
            // getData()
        }

        /**
         * @description 选中值更改
         * @param {SelectOption<string, string>[]} row
         */
        const handleCurrentChange = (row: SelectOption<string, string>[]) => {
            selected.value = row
        }

        /**
         * @description 点击行 仅选中该行
         * @param {SelectOption<string, string>} row
         */
        const handleRowClick = (row: SelectOption<string, string>) => {
            tableRef.value!.clearSelection()
            tableRef.value!.toggleRowSelection(row, true)
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
         * @description 获取列表详情数据 - requestTargetData
         */
        const getCurrPageTargetDatas = async (targetIndexDatas: IntelTargetIndexItem[]) => {
            const tempTargetDatas: IntelTargetDataItem[] = []
            closeLoading()
            targetIndexDatas.forEach(async (item, index) => {
                const sendXml = rawXml`
                    <condition>
                        <index>${item.index}</index>
                        <supportRegister>true</supportRegister>
                        '<featureStatus>true</featureStatus>'
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
                tempTargetDatas[index] = tempTargetData

                // 设置当前界面展示的列表详情数据
                setCurrTargetDatas(cloneDeep(tempTargetDatas))
            })
            closeLoading()
        }

        /**
         * @description 设置界面列表详情数据targetDatas
         */
        const setCurrTargetDatas = (targetDatas: IntelTargetDataItem[]) => {
            pageData.value.targetDatasForFace = targetDatas
        }

        /**
         * @description 全选
         */
        const handleSelectAll = () => {
            console.log('handleSelectAll')
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
            dropdownRef.value?.handleClose()
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
            // setCurrTargetIndexDatas(targetIndexDatas)
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
            console.log('handleBackupAll')
        }

        /**
         * @description 备份选中项
         */
        const handleBackup = (backupType: 'pic' | 'video' | 'picAndVideo') => {
            console.log(backupType)
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
            // 初始化详情
            const isTrail = false
            const currentIndex = targetDataItem.index
            const detailData = pageData.value.targetDatasForFace
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
         * @description 设置界面列表索引数据targetIndexDatas
         */
        const setCurrTargetIndexDatas = (targetIndexDatas: IntelTargetIndexItem[]) => {
            pageData.value.targetIndexDatasForFace = targetIndexDatas
        }

        /**
         * @description 获取界面列表索引数据targetIndexDatas
         */
        const getCurrTargetIndexDatas = () => {
            return pageData.value.targetIndexDatasForFace
        }

        /**
         * @description 记录当前打开详情的索引index
         */
        const setCurrOpenDetailIndex = (index: string) => {
            pageData.value.openDetailIndexForFace = index
        }

        /**
         * @description 设置分页pageIndex
         */
        const setCurrPageIndex = (pageIndex: number) => {
            pageData.value.pageIndexForFace = pageIndex
        }

        /**
         * @description 获取分页pageIndex
         */
        const getCurrPageIndex = () => {
            return pageData.value.pageIndexForFace
        }

        /**
         * @description 获取分页pageSize
         */
        const getCurrPageSize = () => {
            return pageData.value.pageSizeForFace
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

            openLoading()
            try {
                const imgBase64 = targetDataItem.objPicData.data
                const picWidth = targetDataItem.objPicData.picWidth
                const picHeight = targetDataItem.objPicData.picHeight
                const targetData = await getDetectResultInfos(imgBase64, picWidth, picHeight) // 获取"目标"数据
                const featureData = await extractTragetInfos(targetData) // 获取目标的"BASE64特征数据"
                imgDataItem.featureData = featureData
            } catch {
                openMessageBox(Translate('IDCS_UNQUALIFIED_PICTURE'))
            }
            closeLoading()

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
                const isDetectHumanFace = true
                let targetListLength = 0
                let humanFaceTargetListLength = 0
                detectResultInfos.forEach((item1) => {
                    item1.targetList.forEach((item2) => {
                        targetListLength++

                        if (item2.targetType === 'humanFace') {
                            humanFaceTargetListLength++
                        }
                    })
                })
                if (targetListLength > 0) {
                    if (isDetectHumanFace) {
                        if (humanFaceTargetListLength !== 1) {
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
         * @description 获取列表索引数据 - searchTargetIndex
         */
        const getData = async () => {
            resetSortStatus()
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
                        <targetType>humanBody</targetType>
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
         * @description 返回
         */
        const hanbleExit = () => {
            localStorage.setItem('extractResultInfos', '')
            router.back()
        }

        onMounted(async () => {
            if (localStorage.getItem('extractResultInfos')) {
                const extractResultInfos = JSON.parse(localStorage.getItem('extractResultInfos'))
                pageData.value.targetType = extractResultInfos[0].targetType
                pageData.value.targetFeatureIndex = extractResultInfos[0].targetFeatureIndex
                pageData.value.targetFeatureData = extractResultInfos[0].targetFeatureData
                const img = extractResultInfos[0].imgBase64
                pageData.value.pic = img.startsWith('data:image/png;base64,') ? img : 'data:image/png;base64,' + img
            }

            getChlData()

            await getData()
        })

        onBeforeUnmount(() => {
            localStorage.setItem('extractResultInfos', '')
        })

        return {
            pageData,
            tableData,
            tableRef,
            detailRef,
            dropdownRef,
            getData,
            hanbleExit,
            changeDateRange,
            handleCurrentChange,
            handleRowClick,
            handleSearch,
            handleBackupAll,
            handleSort,
            handleChangePage,
            handleSelectAll,
            handleBackup,
            switchDetail,
            showDetail,
            hideDetail,
            handleChangeItem,
        }
    },
})
