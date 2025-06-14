/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-20 10:30:00
 * @Description: 智能分析-车（汽车、摩托车/单车、车牌号）
 */
import IntelBaseDateTimeSelector from './IntelBaseDateTimeSelector.vue'
import IntelBaseChannelSelector from './IntelBaseChannelSelector.vue'
import IntelBaseProfileSelector from './IntelBaseProfileSelector.vue'
import IntelBasePlateColorPop from './IntelBasePlateColorPop.vue'
import IntelBaseSnapItem from './IntelBaseSnapItem.vue'
import IntelSearchDetailPanel from './IntelSearchDetailPanel.vue'
import IntelSearchBackupPop, { type IntelSearchBackUpExpose } from './IntelSearchBackupPop.vue'
import IntelLicencePlateDBAddPlatePop from './IntelLicencePlateDBAddPlatePop.vue'
import { type CheckboxValueType } from 'element-plus'

export default defineComponent({
    components: {
        IntelBaseDateTimeSelector,
        IntelBaseChannelSelector,
        IntelBaseProfileSelector,
        IntelBasePlateColorPop,
        IntelBaseSnapItem,
        IntelSearchDetailPanel,
        IntelSearchBackupPop,
        IntelLicencePlateDBAddPlatePop,
    },
    setup() {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()
        const auth = useUserChlAuth(true)
        // 三个排序下拉框的引用
        const backupPopRef = ref<IntelSearchBackUpExpose>()
        const detailRef = ref()
        const layoutStore = useLayoutStore()

        // key对应界面tab类型，value对应协议需要下发的searchType字段
        const SEARCH_TYPE_MAPPING: Record<string, string> = {
            byCar: 'byVehicle',
            byMotorcycle: 'byNonMotorizedVehicle',
            byPlateNumber: 'byPlate',
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

        // 颜色
        const OLD_NEW_COLOR_MAP: Record<number, string> = {
            1: 'red',
            2: 'orange',
            3: 'yellow',
            4: 'green',
            5: 'blue',
            6: 'cyan',
            7: 'purple',
            8: 'black',
            9: 'white',
            10: 'silver',
            11: 'gray',
            12: 'gold',
            13: 'brown',
        }

        // 汽车品牌
        const OLD_NEW_CAR_BRAND_MAP: Record<number | string, string> = {
            3: 'acura',
            4: 'alfaromeo',
            5: 'astonmartin',
            6: 'audi',
            10: 'bmw',
            11: 'brabus',
            15: 'bentley',
            16: 'benz',
            18: 'bugatti',
            19: 'buick',
            21: 'cowin',
            22: 'cadillac',
            24: 'chevrolet',
            25: 'chrysler',
            26: 'citroen',
            27: 'denza',
            30: 'ds',
            31: 'dacia',
            32: 'dodge',
            36: 'fiat',
            40: 'ferrari',
            41: 'foday',
            42: 'ford',
            43: 'gmc',
            45: 'genesis',
            53: 'honda',
            55: 'hyundai',
            56: 'infiniti',
            60: 'jaguar',
            61: 'jeep',
            63: 'jetta',
            66: 'kia',
            68: 'lancia',
            71: 'lamborghini',
            72: 'landrover',
            75: 'lexus',
            76: 'lincoln',
            79: 'lotus',
            82: 'mg',
            83: 'mini',
            84: 'maserati',
            85: 'mazda',
            86: 'mclaren',
            87: 'mitsubishi',
            91: 'nissan',
            94: 'opel',
            95: 'pagani',
            96: 'peugeot',
            97: 'porsche',
            100: 'renault',
            102: 'rollsroyce',
            104: 'skoda',
            105: 'suzuki',
            106: 'swm',
            107: 'seat',
            108: 'smart',
            110: 'ssangyong',
            111: 'subaru',
            112: 'toyota',
            114: 'tesla',
            117: 'volkswagen',
            118: 'volvo',
            1: 'other',
            other: 'other',
        }

        // 汽车类型
        const OLD_NEW_CAR_TYPE_MAP: Record<number, string> = {
            1: 'sedan',
            2: 'suv',
            3: 'mpv',
            4: 'sportsCar',
            5: 'van',
            6: 'publicBus',
            7: 'schoolBus',
            8: 'bus',
            9: 'lightBus',
            10: 'pickUp',
            11: 'truck',
            12: 'specialVehicle',
        }

        // 摩托车类型
        const OLD_NEW_MOTOR_TYPE_MAP: Record<number, string> = {
            1: 'bicycle',
            2: 'batteryCar',
            3: 'motor',
            4: 'tricycle',
        }

        // 界面数据
        const pageData = ref({
            // 搜索类型（byCar/byMotorcycle/byPlateNumber）
            searchType: 'byCar' as 'byCar' | 'byMotorcycle' | 'byPlateNumber',
            // 搜索选项
            searchOptions: [
                {
                    label: Translate('IDCS_DETECTION_VEHICLE'),
                    value: 'byCar',
                },
                {
                    label: Translate('IDCS_NON_VEHICLE'),
                    value: 'byMotorcycle',
                },
                {
                    label: Translate('IDCS_LICENSE_PLATE_NUM'),
                    value: 'byPlateNumber',
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
            // 选择的属性列表（汽车）
            attributeForCar: {} as Record<string, Record<string, string[]>>,
            // 选择的属性列表（摩托车/单车）
            attributeForMotorcycle: {} as Record<string, Record<string, string[]>>,
            // 填写的车牌号
            plateNumber: '',
            // 选择的车牌颜色
            plateColors: [] as string[],
            pageSize: 12,
            // 分页器（汽车）
            pageIndexForCar: 1,
            // 分页器（摩托车/单车）
            pageIndexForMotorcycle: 1,
            // 分页器（车牌号）
            pageIndexForPlateNumber: 1,
            // 列表数据（汽车）
            targetIndexDatasForCar: [] as IntelTargetIndexItem[],
            // 列表数据（摩托车/单车）
            targetIndexDatasForMotorcycle: [] as IntelTargetIndexItem[],
            // 列表数据（车牌号）
            targetIndexDatasForPlateNumber: [] as IntelTargetIndexItem[],
            // 详情数据（汽车）
            targetDatasForCar: [] as IntelTargetDataItem[],
            // 详情数据（摩托车/单车）
            targetDatasForMotorcycle: [] as IntelTargetDataItem[],
            // 详情数据（车牌号）
            targetDatasForPlateNumber: [] as IntelTargetDataItem[],
            // 是否打开详情
            isDetailOpen: false,
            // 当前打开的详情的索引index（特征值的base64）（汽车）
            openDetailIndexForCar: '',
            // 当前打开的详情的索引index（特征值的base64）（摩托车/单车）
            openDetailIndexForMotorcycle: '',
            // 当前打开的详情的索引index（特征值的base64）（车牌号）
            openDetailIndexForPlateNumber: '',
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
            backupPlateTypeOptions: [
                {
                    label: Translate('IDCS_BACKUP_PICTURE_WITH_LIST').formatForLang(Translate('IDCS_LICENSE_PLATE_NUM_LIST')),
                    value: 'pic+csv',
                },
                {
                    label: Translate('IDCS_BACKUP_RECORD'),
                    value: 'video',
                },
                {
                    label: Translate('IDCS_BACKUP_PICTURE_AND_RECORD_WITH_LIST').formatForLang(Translate('IDCS_LICENSE_PLATE_NUM_LIST')),
                    value: 'pic+csv+video',
                },
            ],
            // 选中的详情数据（汽车）
            selectedTargetDatasForCar: [] as IntelTargetDataItem[],
            // 选中的详情数据（摩托车/单车）
            selectedTargetDatasForMotorcycle: [] as IntelTargetDataItem[],
            // 选中的详情数据（车牌号）
            selectedTargetDatasForPlateNumber: [] as IntelTargetDataItem[],
            // 是否全选
            isCheckedAll: false,
            // 是否支持备份（H5模式）
            isSupportBackUp: !isHttpsLogin(),
            isRegisterPop: false,
            registerPlateNumber: '',
        })
        // 列表索引数据（根据分页索引pageIndex和分页大小pageSize从总数据targetIndexDatas中截取的当页列表数据）
        const sliceTargetIndexDatas = ref<IntelTargetIndexItem[]>([])

        /**
         * @description 获取列表索引数据 - searchTargetIndex
         */
        const getAllTargetIndexDatas = async () => {
            resetSortStatus()
            resetCurrSelectedTargetDatas()
            setCurrTargetIndexDatas([])
            setCurrTargetDatas([])
            const currAttrObjToList: attrObjToListItem[] = getCurrAttribute()
            const sendXml = rawXml`
                <resultLimit>10000</resultLimit>
                <condition>
                    <searchType>${SEARCH_TYPE_MAPPING[pageData.value.searchType]}</searchType>
                    <startTime isUTC="true">${localToUtc(pageData.value.dateRange[0], DEFAULT_DATE_FORMAT)}</startTime>
                    <endTime isUTC="true">${localToUtc(pageData.value.dateRange[1], DEFAULT_DATE_FORMAT)}</endTime>
                    <chls type="list">${pageData.value.chlIdList.map((item) => `<item id="${item}"></item>`).join('')}</chls>
                    ${
                        pageData.value.searchType !== 'byPlateNumber'
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
                                                                return `<item>${attr}</item>`
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
                        pageData.value.searchType === 'byPlateNumber'
                            ? rawXml`<byPlateParams>
                                    <licencePlate>${pageData.value.plateNumber}</licencePlate>
                                    <attrs type="list">
                                        <item>
                                            <attrType type="plateColor">plateColor</attrType>
                                            <attrValues type="list">
                                                ${pageData.value.plateColors
                                                    .map((color) => {
                                                        return `<item>${color}</item>`
                                                    })
                                                    .join('')}
                                            </attrValues>
                                        </item>
                                    </attrs>
                                </byPlateParams>`
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
            switch (pageData.value.searchType) {
                case 'byCar':
                    pageData.value.targetIndexDatasForCar = targetIndexDatas
                    break
                case 'byMotorcycle':
                    pageData.value.targetIndexDatasForMotorcycle = targetIndexDatas
                    break
                case 'byPlateNumber':
                    pageData.value.targetIndexDatasForPlateNumber = targetIndexDatas
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
                case 'byCar':
                    return pageData.value.targetIndexDatasForCar
                case 'byMotorcycle':
                    return pageData.value.targetIndexDatasForMotorcycle
                case 'byPlateNumber':
                    return pageData.value.targetIndexDatasForPlateNumber
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
                case 'byCar':
                    pageData.value.targetDatasForCar = targetIndexDatas.map((item) => Object.assign({}, new IntelTargetDataItem(), cloneDeep(item)))
                    break
                case 'byMotorcycle':
                    pageData.value.targetDatasForMotorcycle = targetIndexDatas.map((item) => Object.assign({}, new IntelTargetDataItem(), cloneDeep(item)))
                    break
                case 'byPlateNumber':
                    pageData.value.targetDatasForPlateNumber = targetIndexDatas.map((item) => Object.assign({}, new IntelTargetDataItem(), cloneDeep(item)))
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
                case 'byCar':
                    return pageData.value.targetDatasForCar
                case 'byMotorcycle':
                    return pageData.value.targetDatasForMotorcycle
                case 'byPlateNumber':
                    return pageData.value.targetDatasForPlateNumber
                default:
                    return []
            }
        }

        /**
         * @description 设置分页pageIndex
         */
        const setCurrPageIndex = (pageIndex: number) => {
            switch (pageData.value.searchType) {
                case 'byCar':
                    pageData.value.pageIndexForCar = pageIndex
                    break
                case 'byMotorcycle':
                    pageData.value.pageIndexForMotorcycle = pageIndex
                    break
                case 'byPlateNumber':
                    pageData.value.pageIndexForPlateNumber = pageIndex
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
                case 'byCar':
                    return pageData.value.pageIndexForCar
                case 'byMotorcycle':
                    return pageData.value.pageIndexForMotorcycle
                case 'byPlateNumber':
                    return pageData.value.pageIndexForPlateNumber
                default:
                    return 1
            }
        }

        /**
         * @description 记录当前打开详情的索引index
         */
        const setCurrOpenDetailIndex = (index: string) => {
            switch (pageData.value.searchType) {
                case 'byCar':
                    pageData.value.openDetailIndexForCar = index
                    break
                case 'byMotorcycle':
                    pageData.value.openDetailIndexForMotorcycle = index
                    break
                case 'byPlateNumber':
                    pageData.value.openDetailIndexForPlateNumber = index
                    break
                default:
                    break
            }
        }

        const openDetailIndex = computed(() => {
            switch (pageData.value.searchType) {
                case 'byCar':
                    return pageData.value.openDetailIndexForCar
                case 'byMotorcycle':
                    return pageData.value.openDetailIndexForMotorcycle
                case 'byPlateNumber':
                default:
                    return pageData.value.openDetailIndexForPlateNumber
            }
        })

        /**
         * @description 获取当前属性数据
         */
        const getCurrAttribute = () => {
            let attrType = ''
            let attrObj = {} as Record<string, string[]>
            let attrObjToList = [] as attrObjToListItem[]
            switch (pageData.value.searchType) {
                case 'byCar':
                    attrType = ATTRIBUTE_TYPE_MAPPING[pageData.value.searchType]
                    attrObj = pageData.value.attributeForCar[attrType]
                    attrObjToList = []
                    Object.keys(attrObj).forEach((key) => {
                        attrObjToList.push({
                            attrType: key,
                            attrValue: attrObj[key],
                        })
                    })
                    return attrObjToList
                case 'byMotorcycle':
                    attrType = ATTRIBUTE_TYPE_MAPPING[pageData.value.searchType]
                    attrObj = pageData.value.attributeForMotorcycle[attrType]
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
                case 'byCar':
                    return pageData.value.selectedTargetDatasForCar
                case 'byMotorcycle':
                    return pageData.value.selectedTargetDatasForMotorcycle
                case 'byPlateNumber':
                    return pageData.value.selectedTargetDatasForPlateNumber
                default:
                    return []
            }
        }

        /**
         * @description 重置当前选中的详情数据
         */
        const resetCurrSelectedTargetDatas = () => {
            switch (pageData.value.searchType) {
                case 'byCar':
                    pageData.value.selectedTargetDatasForCar = []
                    break
                case 'byMotorcycle':
                    pageData.value.selectedTargetDatasForMotorcycle = []
                    break
                case 'byPlateNumber':
                    pageData.value.selectedTargetDatasForPlateNumber = []
                    break
                default:
                    break
            }
        }

        /**
         * @description 选择车牌号颜色（车牌号）
         */
        const handleChangePlateColor = (colors: string[]) => {
            pageData.value.plateColors = colors
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
         * @description 手动排序: 时间排序、通道排序
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
                } else {
                    // 切换为通道排序降序
                    pageData.value.sortOptions.find((item) => item.value === 'chl')!.status = 'down'
                    handleSortByChl('down')
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
                } else {
                    // 切换为时间排序降序
                    pageData.value.sortOptions.find((item) => item.value === 'time')!.status = 'down'
                    handleSortByTime('down')
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
         * @description 备份全部
         */
        const handleBackupAll = () => {
            backupPopRef.value?.startBackup({
                isBackupPic: true,
                isBackupVideo: false,
                isBackupPlateCsv: pageData.value.searchType === 'byPlateNumber',
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
                isBackupPlateCsv: backupType.includes('csv'),
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
                const find = list.find((item) => item.index === openDetailIndex.value)
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
            const isTrail = false
            const currentIndex = targetDataItem.index
            const detailData = isTrail ? getCurrTargetIndexDatas() : getCurrTargetDatas()
            detailRef?.value.init({
                isTrail,
                currentIndex,
                detailData,
            })
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
         * @description 日期时间格式化
         * @param {number} timestamp 毫秒
         * @returns {String}
         */
        const displayDateTime = (timestamp: number) => {
            if (timestamp === 0) return ''
            return formatDate(timestamp, dateTime.dateTimeFormat)
        }

        // 备份按钮置灰/可用状态
        const isEnableBackup = computed(() => {
            const currSelectedTargetDatas = getCurrSelectedTargetDatas()
            return currSelectedTargetDatas.length > 0
        })

        const handleRegister = (item: IntelTargetDataItem) => {
            pageData.value.isRegisterPop = true
            pageData.value.registerPlateNumber = item.plateAttrInfo.plateNumber
        }

        const checkSearchData = () => {
            try {
                const LiveToSearch = JSON.parse(localStorage.getItem('LiveToSearch')!)
                if (LiveToSearch) {
                    const type = LiveToSearch.data.type
                    const targetType = LiveToSearch.data.targetType
                    const eventType = LiveToSearch.data.eventType

                    if (type === 'vehicle_plate') {
                        pageData.value.searchType = 'byPlateNumber'
                        // 旧协议
                        const dataInfo = LiveToSearch.data.dataInfo || {}
                        pageData.value.plateColors = dataInfo.platecolor
                        pageData.value.plateNumber = dataInfo.plate

                        const plateAttrInfo = dataInfo.plateAttrInfo
                        if (plateAttrInfo && Object.keys(plateAttrInfo).length) {
                            pageData.value.plateColors = plateAttrInfo.plateColor
                            pageData.value.plateNumber = plateAttrInfo.plateNumber
                        }
                    } else {
                        const dataInfo = LiveToSearch.data.dataInfo || {}

                        if (targetType === 'vehicle') {
                            pageData.value.searchType = 'byCar'

                            if (eventType === 'video_metavideo') {
                                const mapping = [
                                    {
                                        key: 'vehicleColor',
                                        mapping: OLD_NEW_COLOR_MAP,
                                        infoKey: 'color',
                                    },
                                    {
                                        key: 'vehicleBrand',
                                        mapping: OLD_NEW_CAR_BRAND_MAP,
                                        infoKey: 'brand',
                                    },
                                    {
                                        key: 'vehicleType',
                                        mapping: OLD_NEW_CAR_TYPE_MAP,
                                        infoKey: 'type',
                                    },
                                ]

                                // 旧协议
                                const car_info = dataInfo.car_info
                                if (car_info && Object.keys(car_info).length) {
                                    mapping.forEach((item) => {
                                        if (typeof car_info[item.infoKey] === 'number' || car_info[item.infoKey] === 'string') {
                                            pageData.value.attributeForCar.person[item.key] = [item.mapping[car_info[item.infoKey]]]
                                        }
                                    })
                                }

                                const vehicleAttrInfo = LiveToSearch.data.dataInfo.vehicleAttrInfo
                                if (vehicleAttrInfo && Object.keys(vehicleAttrInfo).length) {
                                    mapping.forEach((item) => {
                                        if (typeof vehicleAttrInfo[item.key] === 'string') {
                                            pageData.value.attributeForCar.person[item.key] = vehicleAttrInfo[item.key].split(',')
                                        }
                                    })
                                }
                            }
                        } else {
                            pageData.value.searchType = 'byMotorcycle'

                            if (eventType === 'video_metavideo') {
                                const mapping = [
                                    {
                                        key: 'nonMotorizedVehicleType',
                                        mapping: OLD_NEW_MOTOR_TYPE_MAP,
                                        infoKey: 'bike_type',
                                    },
                                ]

                                // 旧协议
                                const bike_info = dataInfo.bike_info
                                if (bike_info && Object.keys(bike_info).length) {
                                    mapping.forEach((item) => {
                                        if (typeof bike_info[item.infoKey] === 'number' || bike_info[item.infoKey] === 'string') {
                                            pageData.value.attributeForMotorcycle.person[item.key] = [item.mapping[bike_info[item.infoKey]]]
                                        }
                                    })
                                }

                                const nonMotorVehicleAttrInfo = LiveToSearch.data.dataInfo.nonMotorVehicleAttrInfo
                                if (nonMotorVehicleAttrInfo && Object.keys(nonMotorVehicleAttrInfo).length) {
                                    mapping.forEach((item) => {
                                        if (typeof nonMotorVehicleAttrInfo[item.key] === 'string') {
                                            pageData.value.attributeForCar.person[item.key] = nonMotorVehicleAttrInfo[item.key].split(',')
                                        }
                                    })
                                }
                            }
                        }
                        getAllTargetIndexDatas()
                    }
                    localStorage.removeItem('LiveToSearch')
                }
            } catch {
                localStorage.removeItem('LiveToSearch')
            }

            if (layoutStore.searchTargetFromSearchType) {
                pageData.value.searchType = layoutStore.searchTargetFromSearchType as 'byCar' | 'byMotorcycle' | 'byPlateNumber'
                layoutStore.searchTargetFromSearchType = ''
                layoutStore.searchTargetFromPage = ''
            }
        }

        const handleLeaveToSearchTarget = () => {
            layoutStore.searchTargetFromPage = 'vehicle'
            layoutStore.searchTargetFromSearchType = pageData.value.searchType
        }

        onMounted(() => {
            checkSearchData()
        })

        return {
            pageData,
            detailRef,
            getAllTargetIndexDatas,
            handleChangePlateColor,
            handleChangePage,
            handleCheckedAll,
            handleSort,
            handleBackupAll,
            handleBackup,
            switchDetail,
            showDetail,
            handleChangeItem,
            handleChecked,
            displayDateTime,
            isEnableBackup,
            handleBackupCurrentTarget,
            backupPopRef,
            auth,
            handleRegister,
            getCurrPageIndex,
            getCurrTargetIndexDatas,
            setCurrPageIndex,
            getCurrTargetDatas,
            openDetailIndex,
            handleLeaveToSearchTarget,
        }
    },
})
