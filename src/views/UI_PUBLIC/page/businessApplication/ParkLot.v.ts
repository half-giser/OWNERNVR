/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-27 18:22:21
 * @Description: 实时过车记录
 */
import dayjs from 'dayjs'
import ParkLotPop from './ParkLotPop.vue'

export default defineComponent({
    components: {
        ParkLotPop,
    },
    setup() {
        const { Translate } = useLangStore()

        let listIndex = 0

        // 进出结果与文本映射
        const PARK_RESULT_MAPPING: Record<string, string> = {
            'enter-exit': Translate('IDCS_VEHICLE_IN') + '-' + Translate('IDCS_VEHICLE_HAVE_OUT'), // 进场-已出场
            'nonEnter-exit': Translate('IDCS_VEHICLE_NOT_IN') + '-' + Translate('IDCS_VEHICLE_HAVE_OUT'), // 未匹配进场-已出场
            'enter-nonExit': Translate('IDCS_VEHICLE_IN') + '-' + Translate('IDCS_VEHICLE_NOT_OUT_TIPS'), // 进场-暂未出场
            'nonEnter-nonExit': Translate('IDCS_NOT_HAVE_IN'), // 未进场
        }

        // 进场放行方式/出场放行方式与文本映射
        const OPEN_GATE_MAPPING: Record<string | number, string> = {
            0: '', // 拒绝放行
            1: Translate('IDCS_AUTO_RELEASE'), // 自动放行
            2: Translate('IDCS_MANNAL_RELEASE'), // 手动放行
            refuse: '', // 拒绝放行
            auto: Translate('IDCS_AUTO_RELEASE'), // 自动放行
            manual: Translate('IDCS_MANNAL_RELEASE'), // 手动放行
        }

        // 方向与文本映射
        const DIRECTION_MAPPING: Record<string | number, string> = {
            0: '', // 无
            1: Translate('IDCS_APPROACH'), // 进场
            2: Translate('IDCS_APPEARANCE'), // 出场
            in: Translate('IDCS_APPROACH'), // 进场
            out: Translate('IDCS_APPEARANCE'), // 出场
        }

        const router = useRouter()
        const dateTime = useDateTimeStore()

        const DATA_LIMIT = 5 // 最大数量限制

        let websocket: ReturnType<typeof WebsocketSnap>

        const pageData = ref({
            // 停车场名称
            parkName: '',
            // 车位总数
            total: '',
            // 剩余车位数
            rest: '',
            // 进场总数
            enterCount: '',
            // 出场总数
            exitCount: '',
            // 详情弹窗
            isDetailPop: false,
            // 当前详情索引
            detailIndex: 0,
            // 当前时间
            currentTime: '',
        })

        const cloneData = new BusinessParkingLotList()

        const tableData = ref<BusinessParkingLotList[]>([])

        const formData = ref({
            plateNum: '',
        })

        const current = computed(() => {
            if (tableData.value.length) {
                return tableData.value[0]
            }
            return cloneData
        })

        watch(current, () => {
            formData.value.plateNum = current.value.plateNum
        })

        // 剩余车位/车位总量
        const restOfTotal = computed(() => {
            if (pageData.value.total && pageData.value.rest) {
                return pageData.value.rest + ' / ' + pageData.value.total
            }
            return '\u200b'
        })

        /**
         * @description 显示停车时长
         * @param {Object} row
         */
        const displayDuration = (row: BusinessParkingLotList) => {
            if (!row.exitTime || !row.enterTime) return '--'
            const duration = row.exitTime - row.enterTime
            const e = 1000 * 60 * 60
            if (duration < 1000 * 60 * 60) {
                const minute = Math.round(duration / 1000 / 60)
                return minute + Translate('IDCS_MINUTE_LEAST')
            } else {
                const hour = Math.floor(duration / e)
                const minute = Math.round((duration % e) / 1000 / 60)
                return hour + Translate('IDCS_HOUR_LEAST') + (minute > 0 ? ' ' + minute + Translate('IDCS_MINUTE_LEAST') : '')
            }
        }

        /**
         * @description 显示车牌号码
         * @param {String} plate
         * @returns {String}
         */
        const displayPlateNum = (plate: string) => {
            return plate || Translate('IDCS_NO_PLATE')
        }

        /**
         * @description 显示进出结果
         * @param {String} type
         * @returns {String}
         */
        const displayType = (type: string) => {
            return PARK_RESULT_MAPPING[type] || '--'
        }

        /**
         * @description 显示进场时间/出场时间
         * @param {number} time
         * @returns {String}
         */
        const displayDateTime = (time: number) => {
            if (!time) return '--'
            return formatDate(time, dateTime.dateTimeFormat)
        }

        /**
         * @description 显示方向
         * @param {String} direction
         * @returns {String}
         */
        const displayDirection = (direction: string) => {
            return DIRECTION_MAPPING[direction] || '--'
        }

        /**
         * @description 显示进场放行方式/出场放行方式
         * @param {String} type
         * @returns {String}
         */
        const displayOpenGateType = (type: string) => {
            return OPEN_GATE_MAPPING[type] || '--'
        }

        /**
         * @description 打开详情弹窗
         * @param index
         */
        const showDetail = (index: number) => {
            pageData.value.isDetailPop = true
            pageData.value.detailIndex = index
        }

        /**
         * @description 返回
         */
        const goBack = () => {
            router.back()
        }

        /**
         * @description 获取停车场配置
         */
        const getParkingLotConfig = async () => {
            const result = await queryParkingLotConfig()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.parkName = $('content/basicInfo/name').text() || Translate('IDCS_PARKING_LOT')
                pageData.value.total = $('content/basicInfo/totalVehicleNum').text()
                pageData.value.rest = $('content/basicInfo/remainSpaceNum').text()
            }
        }

        /**
         * @description 获取进出结果枚举值
         * @param {boolean} isEnter
         * @param {string} enterType
         * @param {boolean} isExit
         * @param {string} exitType
         * @return {Enum}
         */
        const getType = (isEnter: boolean, enterType: string, isExit: boolean, exitType: string) => {
            let type = ''
            if (isEnter && isExit) {
                type = 'enter-exit'
            }
            // 进场-拒绝放行
            else if (isEnter && (enterType === '0' || enterType === 'refuse')) {
                type = 'nonEnter-nonExit'
            }
            // "出场拒绝放行"、"无进场和出场数据"时, 没有进出结果
            else if ((isExit && (exitType === '0' || exitType === 'refuse')) || (!isEnter && !isExit)) {
                type = ''
            } else if (isEnter && !isExit) {
                type = 'enter-nonExit'
            } else if (!isEnter && isExit) {
                type = 'nonEnter-exit'
            }

            return type
        }

        /**
         * @description 获取抓拍数据
         */
        const getParkSnapConfig = async () => {
            const sendXml = rawXml`
                <condition>
                    <resultCount>${DATA_LIMIT}</resultCount>
                </condition>
            `
            const result = await searchGateSnap(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                tableData.value = $('content/item').map((item) => {
                    listIndex++

                    const $item = queryXml(item.element)

                    const direction = $item('vehicleInfo/direction').text()
                    const openType = $item('vehicleInfo/openType').text()

                    const enter = direction === 'in' || openType === 'refuse' ? $item('vehicleInfo') : $item('relativeVehicleInfo')
                    const exit = direction === 'in' || openType === 'refuse' ? $item('relativeVehicleInfo') : $item('vehicleInfo')
                    const $enter = enter.length ? queryXml(enter[0].element) : ''
                    const $exit = exit.length ? queryXml(exit[0].element) : ''

                    const enterFrameTime = $enter ? $enter('time').text() : ''
                    const enterTime = enterFrameTime ? dayjs.utc(enterFrameTime.slice(0, -8), DEFAULT_DATE_FORMAT).valueOf() : 0

                    const exitFrameTime = $exit ? $exit('time').text() : ''
                    const exitTime = exitFrameTime ? dayjs.utc(exitFrameTime.slice(0, -8), DEFAULT_DATE_FORMAT).valueOf() : 0

                    const isEnter = $enter.length > 0
                    const enterType = $enter ? $enter('openType').text() : ''

                    const isExit = $exit.length > 0
                    const exitType = $exit ? $exit('openType').text() : ''

                    const type = getType(isEnter, enterType, isExit, exitType)

                    return {
                        index: listIndex,
                        plateNum: $item('plate').text(),
                        eventType: $item('eventType').text().num(),
                        master: '',
                        phoneNum: '',
                        // groupName: '',
                        isEnter,
                        enterChlId: $enter ? $enter('gate').text() : '',
                        enterChl: $enter ? $enter('gateName').text() : '',
                        enterTime,
                        enterFrameTime,
                        enterVehicleId: $enter ? $enter('id').text() : '',
                        enterType,
                        enterImg: '',
                        isExit,
                        exitChlId: $exit ? $exit('gate').text() : '',
                        exitChl: $exit ? $exit('gateName').text() : '',
                        exitTime,
                        exitFrameTime,
                        exitVehicleId: $exit ? $exit('id').text() : '',
                        exitType,
                        exitImg: '',
                        direction,
                        isHistory: true,
                        type,
                        abnormal: type === 'enter-nonExit' || type === 'nonEnter-nonExit',
                        isRelative: false,
                    }
                })
            }
        }

        /**
         * @description 自动更新抓拍数据
         */
        const createWebsoket = () => {
            websocket = WebsocketSnap({
                config: [
                    {
                        parking_lot: {
                            info: true,
                        },
                    },
                ],
                onsuccess(result) {
                    if (result.length) {
                        pageData.value.rest = (result[0] as WebsocketSnapOnSuccessPlate).restNum
                        pageData.value.total = (result[0] as WebsocketSnapOnSuccessPlate).totalNum
                        pageData.value.enterCount = (result[0] as WebsocketSnapOnSuccessPlate).enterNum
                        pageData.value.exitCount = (result[0] as WebsocketSnapOnSuccessPlate).exitNum
                    }

                    const data = (result as WebsocketSnapOnSuccessPlate[])
                        .filter((item) => {
                            return item.direction || item.isEnter || item.isExit
                        })
                        .map((item) => {
                            listIndex++

                            const type = getType(item.isEnter, String(item.enterType), item.isExit, String(item.exitType))

                            return {
                                index: listIndex,
                                plateNum: item.plateNum,
                                eventType: 0,
                                master: item.master,
                                phoneNum: item.phoneNum,
                                // groupName: item.groupName,
                                isEnter: item.isEnter,
                                enterChlId: item.enterChlId,
                                enterChl: item.enterChl,
                                enterTime: Number(item.enterTime),
                                enterFrameTime: String(item.enterframeTime),
                                enterVehicleId: item.enterVehicleId,
                                enterType: String(item.enterType),
                                enterImg: item.enterImg ? wrapBase64Img(item.enterImg) : '',
                                isExit: item.isExit,
                                exitChlId: item.exitChlId,
                                exitChl: item.exitChl,
                                exitTime: Number(item.exitTime),
                                exitFrameTime: String(item.exitframeTime),
                                exitVehicleId: item.exitVehicleId,
                                exitType: String(item.exitType),
                                exitImg: item.exitImg ? wrapBase64Img(item.exitImg) : '',
                                direction: item.direction,
                                isHistory: false,
                                type,
                                abnormal: type === 'enter-nonExit' || type === 'nonEnter-nonExit',
                                isRelative: false,
                            }
                        })
                    tableData.value = data.concat(tableData.value).slice(0, DATA_LIMIT)
                },
            })
        }

        /**
         * @description 修正提交
         */
        const commit = () => {
            const isEnterRefuse = current.value.enterType === '0' || current.value.enterType === 'refuse'
            if (isEnterRefuse) {
                if (!formData.value.plateNum.trim()) {
                    openMessageBox(Translate('IDCS_VEHICLE_NUMBER_EMPTY'))
                    return
                }
                tableData.value[0].plateNum = formData.value.plateNum.trim()
            }
        }

        /**
         * @description 开闸放行
         */
        const handleOpenGate = async () => {
            const item = current.value
            if (item.enterType !== '0' && item.enterType !== 'refuse') return
            if (!item.enterChlId || !item.enterTime || !item.enterVehicleId) return
            if (!item.plateNum) {
                openMessageBox(Translate('IDCS_VEHICLE_NUMBER_EMPTY'))
                return
            }
            const sendXml = rawXml`
                <condition>
                    <plate>${wrapCDATA(item.plateNum)}</plate>
                    <gate>${item.enterChlId}</gate>
                    <time>${localToUtc(current.value.enterTime)}</time>
                    <id>${item.enterVehicleId}</id>
                </condition>
            `
            const result = await openGate(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'fail') {
                const errorCode = $('errorCode').text().num()
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_INVALID_PARAM:
                        errorInfo = Translate('IDCS_INVALID_PARAMETER')
                        break
                    default:
                        errorInfo = Translate('IDCS_OPEN_GATE_RELEASE_FAIL')
                        break
                }
                openMessageBox(errorInfo)
            }
        }

        /**
         * @description 车辆进出记录搜索
         */
        const search = () => {
            router.push({
                path: '/intelligent-analysis/search/search-vehicle',
                state: {
                    searchType: 'park',
                },
            })
        }

        /**
         * @description 抓拍图片
         * @param {String} chlId
         * @param {String} frameTime
         * @param {number} eventType
         * @param {String} imgId
         */
        const getParkImg = async (chlId: string, frameTime: string, eventType: number, imgId: string) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                    <frameTime>${frameTime}</frameTime>
                    <eventType>${eventType}</eventType>
                    <imgId>${imgId}</imgId>
                    <isPanorama />
                </condition>
            `
            const result = await requestSmartTargetSnapImage(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                const img = $('content').text()
                return {
                    master: $('owner').text() || '--',
                    phoneNum: $('ownerPhone').text() || '--',
                    img: img ? wrapBase64Img(img) : '',
                }
            } else {
                return {
                    master: '--',
                    phoneNum: '--',
                    img: '',
                }
            }
        }

        /**
         * @description 更新车牌
         * @param {Number} index
         * @param {String} plate
         */
        const handleUpdatePlate = (index: number, plate: string) => {
            const findIndex = tableData.value.findIndex((item) => item.index === index)
            if (findIndex > -1) {
                tableData.value[findIndex].plateNum = plate
            }
        }

        /**
         * @description 定时更新当前时间
         */
        const timer = useClock(() => {
            pageData.value.currentTime = dateTime.getSystemTime().add(500, 'ms').format(dateTime.dateTimeFormat) // date.format(dateTime.dateTimeFormat)
        }, 1000)

        onMounted(async () => {
            timer.repeat(true, true)
            await getParkingLotConfig()
            await getParkSnapConfig()
            createWebsoket()
            tableData.value.forEach(async (item) => {
                if (item.isHistory) {
                    if (item.isEnter) {
                        const data = await getParkImg(item.enterChlId, item.enterFrameTime, item.eventType, item.enterVehicleId)
                        item.master = data.master
                        item.phoneNum = data.phoneNum
                        item.enterImg = data.img
                    }

                    if (item.isExit) {
                        const data = await getParkImg(item.exitChlId, item.exitFrameTime, item.eventType, item.exitVehicleId)
                        item.master = data.master
                        item.phoneNum = data.phoneNum
                        item.exitImg = data.img
                    }
                }
            })
        })

        onBeforeUnmount(() => {
            websocket?.destroy()
        })

        return {
            pageData,
            tableData,
            goBack,
            restOfTotal,
            current,
            displayPlateNum,
            displayDuration,
            displayType,
            displayDateTime,
            displayDirection,
            displayOpenGateType,
            showDetail,
            commit,
            search,
            handleOpenGate,
            handleUpdatePlate,
            formData,
        }
    },
})
