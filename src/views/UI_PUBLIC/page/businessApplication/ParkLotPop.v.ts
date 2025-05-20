/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-28 14:12:55
 * @Description: 实时过车记录 - 详情弹窗
 */
import dayjs from 'dayjs'
import IntelLicencePlateDBAddPlatePop from '../intelligentAnalysis/IntelLicencePlateDBAddPlatePop.vue'
import ParkLotRemarkPop from './ParkLotRemarkPop.vue'

export default defineComponent({
    components: {
        IntelLicencePlateDBAddPlatePop,
        ParkLotRemarkPop,
    },
    props: {
        /**
         * @property {Array} 实时过车记录列表
         */
        list: {
            type: Array as PropType<BusinessParkingLotList[] | BusinessParkingLotRelevantList[]>,
            required: true,
        },
        /**
         * @property {Number} 当前索引
         */
        index: {
            type: Number,
            required: true,
        },
        /**
         * @property {String} 弹窗类型 edit: 可编辑；read：不可编辑
         */
        type: {
            type: String as PropType<'edit' | 'read'>,
            default: 'edit',
        },
        remarkSwitch: {
            type: Boolean,
            default: true,
        },
    },
    emits: {
        updatePlate(index: number, plate: string) {
            return typeof index === 'number' && typeof plate === 'string'
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        const $enterCanvas = ref<HTMLCanvasElement>()
        const $exitCanvas = ref<HTMLCanvasElement>()

        let enterCanvasContext: ReturnType<typeof CanvasBase>
        let exitCanvasContext: ReturnType<typeof CanvasBase>

        let listIndex = 0

        // 进出结果与文本映射
        const PARK_RESULT_MAPPING: Record<string, string> = {
            'enter-exit': Translate('IDCS_VEHICLE_IN') + '-' + Translate('IDCS_VEHICLE_HAVE_OUT'), // 进场-已出场
            'nonEnter-exit': Translate('IDCS_VEHICLE_NOT_IN') + '-' + Translate('IDCS_VEHICLE_HAVE_OUT'), // 未匹配进场-已出场
            'enter-nonExit': Translate('IDCS_VEHICLE_IN') + '-' + Translate('IDCS_VEHICLE_NOT_OUT_TIPS'), // 进场-暂未出场
            'nonEnter-nonExit': Translate('IDCS_NOT_HAVE_IN'), // 未进场
            'out-nonEnter-nonExit': Translate('IDCS_VEHICLE_NOT_OUT_TIPS'), // 暂未出场
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
            in_out: Translate('IDCS_APPROACH_APPEARANCE'), // 进场和出场
        }

        const pageData = ref({
            tabIndex: 0,
            index: 0,
            isAddPlatePop: false,
            plateNum: '',
            list: [] as BusinessParkingLotList[],
            relativeList: [] as BusinessParkingLotRelevantList[],
            isBtnVisible: false,
            isRemarkPop: false,
            canvasWidth: 796,
            canvasHeight: 538,
        })

        const formData = ref({
            plateNum: '',
        })

        const cloneData = new BusinessParkingLotList()

        const current = computed(() => {
            if (pageData.value.list[pageData.value.index]) {
                return pageData.value.list[pageData.value.index]
            } else {
                return cloneData
            }
        })

        const isTraceObj = (obj: { X1: number; X2: number; Y1: number; Y2: number }) => {
            return obj.X1 || obj.X2 || obj.Y1 || obj.Y2
        }

        watch(current, () => {
            formData.value.plateNum = current.value.plateNum
            if (current.value.isRelative && current.value.direction && !current.value.eventType) {
                getOpenGateEvent(pageData.value.index)
            }

            if (current.value.enterImg) {
                if (!enterCanvasContext) {
                    enterCanvasContext = CanvasBase($enterCanvas.value!)
                }
                enterCanvasContext.ClearRect(0, 0, pageData.value.canvasWidth, pageData.value.canvasHeight)

                if (isTraceObj(current.value.enterTraceObj)) {
                    const X1 = current.value.enterTraceObj.X1 * pageData.value.canvasWidth
                    const Y1 = current.value.enterTraceObj.Y1 * pageData.value.canvasHeight
                    const X2 = current.value.enterTraceObj.X2 * pageData.value.canvasWidth
                    const Y2 = current.value.enterTraceObj.Y2 * pageData.value.canvasHeight
                    enterCanvasContext.Point2Rect(X1, Y1, X2, Y2, {
                        lineWidth: 2,
                        strokeStyle: '#0000ff',
                    })
                }
            }

            if (current.value.exitImg) {
                if (!exitCanvasContext) {
                    exitCanvasContext = CanvasBase($exitCanvas.value!)
                }
                exitCanvasContext.ClearRect(0, 0, pageData.value.canvasWidth, pageData.value.canvasHeight)

                if (isTraceObj(current.value.exitTraceObj)) {
                    const X1 = current.value.exitTraceObj.X1 * pageData.value.canvasWidth
                    const Y1 = current.value.exitTraceObj.Y1 * pageData.value.canvasHeight
                    const X2 = current.value.exitTraceObj.X2 * pageData.value.canvasWidth
                    const Y2 = current.value.exitTraceObj.Y2 * pageData.value.canvasHeight
                    exitCanvasContext.Point2Rect(X1, Y1, X2, Y2, {
                        lineWidth: 2,
                        strokeStyle: '#0000ff',
                    })
                }
            }
        })

        /**
         * @description 获取关联的打开闸门的数据
         * @param {Number} index 索引
         */
        const getOpenGateEvent = async (index: number) => {
            const data = pageData.value.relativeList[index]
            const virtualStart = '2000-01-01 00:00:00'
            const virtualEnd = '2080-01-01 00:00:00'
            const frameTime = data.frameTime
            const isDirectionIn = Number(data.direction) === 1
            const enterExitTime = dayjs.utc(frameTime.slice(0, -8), DEFAULT_DATE_FORMAT).valueOf()
            const startTime = isDirectionIn ? frameTime : virtualStart
            const endTime = isDirectionIn ? virtualEnd : frameTime
            const sendXml = rawXml`
                <condition>
                    <startTime>${startTime}</startTime>
                    <endTime>${endTime}</endTime>
                    <direction>${isDirectionIn ? 'out' : 'in'}</direction>
                    <plate>${wrapCDATA(data.plateNumber)}</plate>
                </condition>
            `
            const result = await searchOpenGateEventRelevanceData(sendXml)
            const $ = queryXml(result)
            const obj: BusinessParkingLotList = {
                index: pageData.value.list[index].index,
                plateNum: data.plateNumber,
                eventType: data.eventTypeID,
                master: data.owner,
                phoneNum: data.ownerPhone,
                // groupName: '',
                isEnter: isDirectionIn,
                enterImg: isDirectionIn ? data.panorama : '',
                enterChl: isDirectionIn ? data.chlName : '',
                enterChlId: '',
                enterType: isDirectionIn ? data.openType : '',
                enterTime: isDirectionIn ? enterExitTime : 0,
                enterFrameTime: '',
                enterVehicleId: '',
                enterSnapImg: '',
                enterTraceObj: {
                    X1: 0,
                    Y1: 0,
                    X2: 0,
                    Y2: 0,
                },
                isExit: !isDirectionIn,
                exitImg: !isDirectionIn ? data.panorama : '',
                exitChl: !isDirectionIn ? data.chlName : '',
                exitChlId: '',
                exitType: !isDirectionIn ? data.openType : '',
                exitTime: !isDirectionIn ? enterExitTime : 0,
                exitFrameTime: '',
                exitVehicleId: '',
                exitSnapImg: '',
                exitTraceObj: {
                    X1: 0,
                    Y1: 0,
                    X2: 0,
                    Y2: 0,
                },
                direction: data.direction,
                isHistory: false,
                type: '',
                abnormal: false,
                isRelative: false,
                remark: data.remark,
                plateStartTime: data.plateStartTime,
                plateEndTime: data.plateEndTime,
            }
            if ($('status').text() === 'success') {
                obj.master = $('owner').text() || obj.master
                obj.phoneNum = $('ownerPhone').text() || obj.phoneNum
                const resDirection = $('directionType').text()
                const gateName = $('gateName').text()
                const openType = $('openGateType').text()
                const apiTime = $('time').text()
                const time = apiTime ? dayjs.utc(apiTime.slice(0, -8), DEFAULT_DATE_FORMAT).valueOf() : 0
                const img = $('content').text()
                if (resDirection === 'in') {
                    obj.enterChl = gateName
                    obj.enterType = openType
                    obj.enterTime = time
                    obj.enterImg = wrapBase64Img(img)
                    obj.isEnter = true
                } else if (resDirection === 'out') {
                    obj.exitChl = gateName
                    obj.exitType = openType
                    obj.exitTime = time
                    obj.exitImg = wrapBase64Img(img)
                    obj.isExit = true
                }
            }
            obj.type = getType(obj.isEnter, obj.enterType, obj.isExit, obj.exitType)
            pageData.value.list[index] = obj
        }

        /**
         * @description 打开弹窗时 重置弹窗信息
         */
        const open = () => {
            pageData.value.index = prop.index
            if (prop.list.length) {
                if (!prop.list[0].isRelative) {
                    pageData.value.list = prop.list as BusinessParkingLotList[]
                } else {
                    pageData.value.list = (prop.list as BusinessParkingLotRelevantList[]).map((item) => {
                        listIndex++
                        const data = new BusinessParkingLotList()
                        data.direction = item.direction
                        data.plateNum = item.plateNumber
                        data.isRelative = true
                        data.index = listIndex
                        return data
                    })
                    pageData.value.relativeList = prop.list as BusinessParkingLotRelevantList[]
                }
            } else {
                pageData.value.list = []
                pageData.value.relativeList = []
            }
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

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
        const displayDateTime = (time: number | string) => {
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

            if (isEnter && !isExit) {
                type = 'enter-nonExit'
            }

            if (!isEnter && isExit) {
                type = 'nonEnter-exit'
            }

            // 进场-拒绝放行
            if (isEnter && (enterType === '0' || enterType === 'refuse')) {
                type = 'nonEnter-nonExit'
            }

            // 出场-拒绝放行
            if (isExit && (exitType === '0' || exitType === 'refuse')) {
                type = 'out-nonEnter-nonExit'
            }

            // NTA1-3765 车辆未进场且未出场的记录需要显示为未进场
            if (!isEnter && !isExit) {
                type = 'nonEnter-nonExit'
            }

            return type
        }

        /**
         * @description 上一条数据
         */
        const handlePrev = () => {
            if (pageData.value.index > 0) {
                pageData.value.index--
            }
        }

        /**
         * @description 下一条数据
         */
        const handleNext = () => {
            if (pageData.value.index < pageData.value.list.length - 1) {
                pageData.value.index++
            }
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
                ctx.emit('updatePlate', current.value.index, formData.value.plateNum.trim())
                if (prop.remarkSwitch) {
                    pageData.value.isRemarkPop = true
                } else {
                    commitOpenGate()
                }
            }
        }

        /**
         * @description 开闸放行
         */
        const commitOpenGate = async (remark?: string) => {
            pageData.value.isRemarkPop = false

            const item = current.value
            const direction = ['in', 'no', '0', '1'].includes(String(item.direction))
            const chlId = direction ? item.enterChlId : item.exitChlId
            const time = localToUtc(direction ? item.enterTime : item.exitTime)
            const vehicleId = direction ? item.enterVehicleId : item.exitVehicleId
            if (!chlId || !time || !vehicleId) return
            if (!item.plateNum) {
                openMessageBox(Translate('IDCS_VEHICLE_NUMBER_EMPTY'))
                return
            }
            const sendXml = rawXml`
                <condition>
                    <plate>${wrapCDATA(item.plateNum)}</plate>
                    <gate>${chlId}</gate>
                    <time>${time}</time>
                    <id>${vehicleId}</id>
                </condition>
                ${remark ? `<remarkText>${wrapCDATA(remark)}</remarkText>` : ''}
            `
            const result = await openGate(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_OPEN_GATE_RELEASE_SUCCESS'),
                })
            } else {
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
         * @description 新增车牌
         */
        const addPlate = () => {
            pageData.value.plateNum = current.value.plateNum
            pageData.value.isAddPlatePop = true
        }

        const getPlateStartTimeState = () => {
            const now = Date.now()
            if (current.value.plateStartTime && current.value.isEnter) {
                const plateStartTimeStamp = dayjs(current.value.plateStartTime, { format: DEFAULT_DATE_FORMAT, jalali: false }).valueOf() // new Date(current.value.plateStartTime).getTime()
                return now < plateStartTimeStamp
            } else {
                return false
            }
        }

        const getPlateEndTimeState = () => {
            const now = Date.now()
            if (current.value.isExit) {
                const plateEndTimeStamp = dayjs(current.value.plateEndTime || '2037-12-31 23:59:59', { format: DEFAULT_DATE_FORMAT, jalali: false }).valueOf()
                return now > plateEndTimeStamp
            } else {
                return false
            }
        }

        // const onMounted(() => {
        //     enterCanvasContext = $enterCanvas.value!.getContext('2d')!
        //     exitCanvasContext = $exitCanvas.value!.getContext('2d')!
        // })

        return {
            current,
            pageData,
            formData,
            displayDuration,
            displayType,
            displayDateTime,
            displayDirection,
            displayOpenGateType,
            commit,
            handleNext,
            handlePrev,
            addPlate,
            close,
            open,
            getPlateStartTimeState,
            getPlateEndTimeState,
            commitOpenGate,
            $enterCanvas,
            $exitCanvas,
        }
    },
})
