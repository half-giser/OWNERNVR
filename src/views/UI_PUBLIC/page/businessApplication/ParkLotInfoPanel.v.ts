/*
 * @Date: 2025-05-26 14:28:41
 * @Description: 停车场进出记录 - 详情信息
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import ParkLotRemarkPop from './ParkLotRemarkPop.vue'
import dayjs from 'dayjs'

export default defineComponent({
    components: {
        ParkLotRemarkPop,
    },
    props: {
        current: {
            type: Object as PropType<BusinessParkingLotList>,
            default: () => new BusinessParkingLotList(),
        },
        remarkSwitch: {
            type: Boolean,
            default: true,
        },
        /**
         * @property {String} 弹窗类型 edit: 可编辑；read：不可编辑
         */
        type: {
            type: String as PropType<'edit' | 'read'>,
            default: 'edit',
        },
    },
    emits: {
        updatePlate(plate: string) {
            return typeof plate === 'string'
        },
    },
    setup(props, ctx) {
        const dateTime = useDateTimeStore()
        const { Translate } = useLangStore()

        // 方向与文本映射
        const DIRECTION_MAPPING: Record<string | number, string> = {
            0: '', // 无
            1: Translate('IDCS_APPROACH'), // 进场
            2: Translate('IDCS_APPEARANCE'), // 出场
            in: Translate('IDCS_APPROACH'), // 进场
            out: Translate('IDCS_APPEARANCE'), // 出场
            in_out: Translate('IDCS_APPROACH_APPEARANCE'), // 进场和出场
        }

        // 进出结果与文本映射
        const PARK_RESULT_MAPPING: Record<string, string> = {
            'enter-exit': Translate('IDCS_VEHICLE_IN') + '-' + Translate('IDCS_VEHICLE_HAVE_OUT'), // 进场-已出场
            'nonEnter-exit': Translate('IDCS_VEHICLE_NOT_IN') + '-' + Translate('IDCS_VEHICLE_HAVE_OUT'), // 未匹配进场-已出场
            'enter-nonExit': Translate('IDCS_VEHICLE_IN') + '-' + Translate('IDCS_VEHICLE_NOT_OUT_TIPS'), // 进场-暂未出场
            'nonEnter-nonExit': Translate('IDCS_NOT_HAVE_IN'), // 未进场
            'out-nonEnter-nonExit': Translate('IDCS_VEHICLE_NOT_OUT_TIPS'), // 暂未出场
        }

        const pageData = ref({
            isRemarkPop: false,
        })

        const formData = ref({
            plateNum: '',
        })

        /**
         * @description 修正提交
         */
        const commit = () => {
            if (!formData.value.plateNum.trim()) {
                openMessageBox(Translate('IDCS_VEHICLE_NUMBER_EMPTY'))
                return
            }
            ctx.emit('updatePlate', formData.value.plateNum.trim())
            if (props.remarkSwitch) {
                pageData.value.isRemarkPop = true
            } else {
                commitOpenGate()
            }
        }

        /**
         * @description 开闸放行
         */
        const commitOpenGate = async (remark?: string) => {
            pageData.value.isRemarkPop = false

            const item = props.current
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

        const getPlateStartTimeState = () => {
            const now = Date.now()
            if (props.current.plateStartTime && props.current.isEnter) {
                const plateStartTimeStamp = dayjs(props.current.plateStartTime.replace(/\//g, '-'), { format: DEFAULT_DATE_FORMAT, jalali: false }).valueOf() // new Date(props.current.plateStartTime).getTime()
                return now < plateStartTimeStamp
            } else {
                return false
            }
        }

        const getPlateEndTimeState = () => {
            const now = Date.now()
            if (props.current.isExit) {
                const plateEndTimeStamp = dayjs(props.current.plateEndTime.replace(/\//g, '-') || '2037-12-31 23:59:59', { format: DEFAULT_DATE_FORMAT, jalali: false }).valueOf()
                return now > plateEndTimeStamp
            } else {
                return false
            }
        }

        /**
         * @description 显示进场时间/出场时间
         * @param {number} time
         * @returns {String}
         */
        const displayDateTime = (time: number | string) => {
            if (!time || !dayjs(time).isValid()) return '--'
            return formatDate(time, dateTime.dateTimeFormat)
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
         * @description 显示方向
         * @param {String} direction
         * @returns {String}
         */
        const displayDirection = (direction: string) => {
            return DIRECTION_MAPPING[direction] || '--'
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

        watch(
            () => props.current.plateNum,
            () => {
                formData.value.plateNum = props.current.plateNum
            },
        )

        return {
            displayDateTime,
            getPlateStartTimeState,
            getPlateEndTimeState,
            commitOpenGate,
            displayType,
            displayDirection,
            commit,
            formData,
            pageData,
            displayDuration,
        }
    },
})
