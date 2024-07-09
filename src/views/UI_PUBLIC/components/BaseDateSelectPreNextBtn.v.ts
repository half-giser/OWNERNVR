/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-24 20:38:38
 * @Description: 通用的日期选择，前一个/后一个日期组件
 */

import { parsePersianCalendartoDate } from '@/utils/tools'
import { useUserSessionStore } from '@/stores/userSession'
import useMessageBox from '@/hooks/useMessageBox'
import BaseImgSprite from '@/views/UI_PUBLIC/components/sprite/BaseImgSprite.vue'

export default defineComponent({
    components: {
        BaseImgSprite,
    },
    props: {
        // 系统日期格式
        dateTimeFormat: {
            type: Object,
            require: false,
            default: () => {
                return {
                    dateFormat: 'yyyy/MM/dd',
                    timeFormat: 'hh:mm:ss tt',
                    format: 'yyyy/MM/dd hh:mm:ss tt',
                    dateFormatForCalc: 'yyyy/MM/dd', // 固定格式，方便split,join,getMonth等自定义计算
                    timeFormatForCalc: 'hh:mm:ss tt', // 固定格式，方便split,join,getMonth等自定义计算
                    formatForCalc: 'yyyy/MM/dd hh:mm:ss tt', // 固定格式，方便split,join,getMonth等自定义计算
                }
            },
        },
        // 当前的时间信息(currentDateIndex,startTimeFormat,endTimeFormat,selectedDateForShow,selectedDateForLabel,oneWeekFirstDayFormat,oneWeekLastDayFormat,oneMonthFirstDayFormat,oneMonthLastDayFormat)
        selectedDateInfo: {
            type: Object,
            require: false,
            default: () => {
                return {
                    startTimeFormat: '',
                    endTimeFormat: '',
                    oneWeekFirstDayFormat: '',
                    oneWeekLastDayFormat: '',
                    oneMonthFirstDayFormat: '',
                    oneMonthLastDayFormat: '',
                    startTimeFormatForCalc: '', // 开始时间-查询协议需要的字段, 固定格式，方便split,join,getMonth等自定义计算
                    endTimeFormatForCalc: '', // 结束时间-查询协议需要的字段, 固定格式，方便split,join,getMonth等自定义计算
                    oneWeekFirstDayFormatForCalc: '', // 固定格式，方便split,join,getMonth等自定义计算
                    oneWeekLastDayFormatForCalc: '', // 固定格式，方便split,join,getMonth等自定义计算
                    oneMonthFirstDayFormatForCalc: '', // 固定格式，方便split,join,getMonth等自定义计算
                    oneMonthLastDayFormatForCalc: '', // 固定格式，方便split,join,getMonth等自定义计算
                    currentDateIndex: '',
                    selectedDateForShow: '',
                    selectedDateForLabel: '',
                }
            },
        },
        // 父组件传递过来的“函数型prop-用于数据子传夫”
        handlePreDate: {
            type: Function,
            require: true,
        },
        // 父组件传递过来的“函数型prop-用于数据子传夫”
        handleNextDate: {
            type: Function,
            require: true,
        },
    },
    setup(props: any) {
        // 多语言翻译方法
        const { Translate } = useLangStore()
        // 提示弹框
        const { openMessageTipBox } = useMessageBox()
        // 用户信息store
        const userSessionStore = useUserSessionStore()
        // props.dateInfo（子组件中不允许直接修改props数据，需要搞个副本操作，最终再传递给父组件最新的数据）
        const dateInfo = props.selectedDateInfo

        // 前一个日期
        function handlePre() {
            // 今天、昨天
            const today = new Date()
            const yesterday = new Date()
            yesterday.setDate(today.getDate() - 1)
            const todayFormat = today.format(props.dateTimeFormat.dateFormat)
            const yesterdayFormat = yesterday.format(props.dateTimeFormat.dateFormat)
            // date、dateFormat、dateFormatForCalc
            let date = new Date()
            let dateFormat = new Date().format(props.dateTimeFormat.dateFormat)
            let dateFormatForCalc = new Date().format(props.dateTimeFormat.dateFormatForCalc)
            if (dateInfo.selectedDateForShow === Translate('IDCS_CALENDAR_TODAY')) {
                date = today
            } else if (dateInfo.selectedDateForShow === Translate('IDCS_CALENDAR_YESTERDAY')) {
                date = yesterday
            } else {
                date = new Date(dateInfo.startTimeFormatForCalc)
                if (userSessionStore.calendarType === 'Persian') {
                    date = parsePersianCalendartoDate(dateInfo.startTimeFormatForCalc) || new Date()
                }
            }
            // day、week、month、custom、today
            if (dateInfo.currentDateIndex === 'day') {
                date.setDate(date.getDate() - 1)
                dateFormat = date.format(props.dateTimeFormat.dateFormat)
                dateFormatForCalc = date.format(props.dateTimeFormat.dateFormatForCalc)
                if (dateFormat === todayFormat) {
                    dateInfo.selectedDateForShow = Translate('IDCS_CALENDAR_TODAY')
                } else if (dateFormat === yesterdayFormat) {
                    dateInfo.selectedDateForShow = Translate('IDCS_CALENDAR_YESTERDAY')
                } else {
                    dateInfo.selectedDateForShow = dateFormat
                }
            } else if (dateInfo.currentDateIndex === 'week') {
                // 一周的最初一天、最后一天
                let oneWeekFirstDay = new Date(dateInfo.oneWeekFirstDayFormatForCalc)
                let oneWeekLastDay = new Date(dateInfo.oneWeekLastDayFormatForCalc)
                if (userSessionStore.calendarType === 'Persian') {
                    oneWeekFirstDay = parsePersianCalendartoDate(dateInfo.oneWeekFirstDayFormat) || new Date()
                    oneWeekLastDay = parsePersianCalendartoDate(dateInfo.oneWeekLastDayFormat) || new Date()
                }
                oneWeekFirstDay.setDate(oneWeekFirstDay.getDate() - 7)
                oneWeekLastDay.setDate(oneWeekLastDay.getDate() - 7)
                dateInfo.oneWeekFirstDayFormatForCalc = oneWeekFirstDay.format(props.dateTimeFormat.dateFormatForCalc)
                dateInfo.oneWeekLastDayFormatForCalc = oneWeekLastDay.format(props.dateTimeFormat.dateFormatForCalc)
                dateInfo.oneWeekFirstDayFormat = oneWeekFirstDay.format(props.dateTimeFormat.dateFormat)
                dateInfo.oneWeekLastDayFormat = oneWeekLastDay.format(props.dateTimeFormat.dateFormat)
                dateFormat = dateInfo.oneWeekFirstDayFormat
                dateFormatForCalc = dateInfo.oneWeekFirstDayFormatForCalc
                dateInfo.selectedDateForShow = `${dateInfo.oneWeekFirstDayFormat} -- ${dateInfo.oneWeekLastDayFormat}`
            } else if (dateInfo.currentDateIndex === 'month') {
                date = new Date(dateInfo.startTimeFormatForCalc)
                date.setMonth(date.getMonth() - 1)
                dateFormat = date.format(props.dateTimeFormat.dateFormat)
                dateFormatForCalc = date.format(props.dateTimeFormat.dateFormatForCalc)
                // 获取年/月
                const dateYear = date.getFullYear()
                const dateMonth = date.getMonth() + 1
                const dateYearMonth = `${dateYear}/${dateMonth < 10 ? '0' + dateMonth : dateMonth}`
                dateInfo.selectedDateForShow = dateYearMonth
                // 获取某月第一天和最后一天
                const oneMonthFirstDay = new Date(dateYearMonth)
                dateInfo.oneMonthFirstDayFormatForCalc = oneMonthFirstDay.format(props.dateTimeFormat.dateFormatForCalc)
                dateInfo.oneMonthLastDayFormatForCalc = getOneMonthLastDay(dateInfo.oneMonthFirstDayFormatForCalc).format(props.dateTimeFormat.dateFormatForCalc)
                dateInfo.oneMonthFirstDayFormat = oneMonthFirstDay.format(props.dateTimeFormat.dateFormat)
                dateInfo.oneMonthLastDayFormat = getOneMonthLastDay(dateInfo.oneMonthFirstDayFormatForCalc).format(props.dateTimeFormat.dateFormat)
                const dateArr = getOneMonthAllDay(dateInfo.oneMonthFirstDayFormatForCalc, dateInfo.oneMonthLastDayFormatForCalc)
                dateInfo.selectedDateForLabel = `${Translate('IDCS_DATE_TITLE')}(${dateArr.length})${Translate('IDCS_DAY_TIMES')}`
            } else if (dateInfo.currentDateIndex === 'custom') {
                // ...
            } else if (dateInfo.currentDateIndex === 'today') {
                date.setDate(date.getDate() - 1)
                dateFormat = date.format(props.dateTimeFormat.dateFormat)
                dateFormatForCalc = date.format(props.dateTimeFormat.dateFormatForCalc)
                if (dateFormat === todayFormat) {
                    dateInfo.selectedDateForShow = Translate('IDCS_CALENDAR_TODAY')
                } else if (dateFormat === yesterdayFormat) {
                    dateInfo.selectedDateForShow = Translate('IDCS_CALENDAR_YESTERDAY')
                    dateInfo.currentDateIndex = 'day'
                } else {
                    dateInfo.selectedDateForShow = dateFormat
                    dateInfo.currentDateIndex = 'day'
                }
            }
            // 更新开始时间
            if (dateInfo.currentDateIndex !== 'custom') {
                dateInfo.startTimeFormat = dateFormat
                dateInfo.startTimeFormatForCalc = dateFormatForCalc
            }
            // 传递最新数据给父组件
            props.handlePreDate(dateInfo as SelectedDateInfo)
        }

        // 后一个日期
        function handleNext() {
            // 今天、昨天
            const today = new Date()
            const yesterday = new Date()
            yesterday.setDate(today.getDate() - 1)
            const todayFormat = today.format(props.dateTimeFormat.dateFormat)
            const yesterdayFormat = yesterday.format(props.dateTimeFormat.dateFormat)
            // date、dateFormat、dateFormatForCalc
            let date = new Date()
            let dateFormat = new Date().format(props.dateTimeFormat.dateFormat)
            let dateFormatForCalc = new Date().format(props.dateTimeFormat.dateFormatForCalc)
            if (dateInfo.selectedDateForShow === Translate('IDCS_CALENDAR_TODAY')) {
                date = today
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_INVALID_TIME_RANGE'),
                    showCancelButton: false,
                }).catch(() => {})
                return
            } else if (dateInfo.selectedDateForShow === Translate('IDCS_CALENDAR_YESTERDAY')) {
                date = yesterday
            } else {
                date = new Date(dateInfo.startTimeFormatForCalc)
                if (userSessionStore.calendarType === 'Persian') {
                    date = parsePersianCalendartoDate(dateInfo.startTimeFormatForCalc) || new Date()
                }
            }
            // 今天的最后时刻
            const todayLast = new Date()
            todayLast.setHours(23)
            todayLast.setMinutes(59)
            todayLast.setSeconds(59)
            // day、week、month、custom、today
            if (dateInfo.currentDateIndex === 'day') {
                date.setDate(date.getDate() + 1)
                dateFormat = date.format(props.dateTimeFormat.dateFormat)
                dateFormatForCalc = date.format(props.dateTimeFormat.dateFormatForCalc)
                if (dateFormat === todayFormat) {
                    dateInfo.selectedDateForShow = Translate('IDCS_CALENDAR_TODAY')
                    dateInfo.currentDateIndex = 'today'
                } else if (dateFormat === yesterdayFormat) {
                    dateInfo.selectedDateForShow = Translate('IDCS_CALENDAR_YESTERDAY')
                } else {
                    dateInfo.selectedDateForShow = dateFormat
                }
            } else if (dateInfo.currentDateIndex === 'week') {
                // 一周的最初一天、最后一天
                let oneWeekFirstDay = new Date(dateInfo.oneWeekFirstDayFormatForCalc)
                let oneWeekLastDay = new Date(dateInfo.oneWeekLastDayFormatForCalc)
                if (userSessionStore.calendarType === 'Persian') {
                    oneWeekFirstDay = parsePersianCalendartoDate(dateInfo.oneWeekFirstDayFormat) || new Date()
                    oneWeekLastDay = parsePersianCalendartoDate(dateInfo.oneWeekLastDayFormat) || new Date()
                }
                oneWeekFirstDay.setDate(oneWeekFirstDay.getDate() + 7)
                oneWeekLastDay.setDate(oneWeekLastDay.getDate() + 7)
                if (oneWeekFirstDay.getTime() > todayLast.getTime()) {
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_INVALID_TIME_RANGE'),
                        showCancelButton: false,
                    }).catch(() => {})
                    return
                }
                dateInfo.oneWeekFirstDayFormatForCalc = oneWeekFirstDay.format(props.dateTimeFormat.dateFormatForCalc)
                dateInfo.oneWeekLastDayFormatForCalc = oneWeekLastDay.format(props.dateTimeFormat.dateFormatForCalc)
                dateInfo.oneWeekFirstDayFormat = oneWeekFirstDay.format(props.dateTimeFormat.dateFormat)
                dateInfo.oneWeekLastDayFormat = oneWeekLastDay.format(props.dateTimeFormat.dateFormat)
                dateFormat = dateInfo.oneWeekFirstDayFormat
                dateFormatForCalc = dateInfo.oneWeekFirstDayFormatForCalc
                dateInfo.selectedDateForShow = `${dateInfo.oneWeekFirstDayFormat} -- ${dateInfo.oneWeekLastDayFormat}`
            } else if (dateInfo.currentDateIndex === 'month') {
                const nextMonth = new Date(dateInfo.startTimeFormatForCalc)
                nextMonth.setMonth(date.getMonth() + 1)
                if (nextMonth.getTime() > todayLast.getTime()) {
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_INVALID_TIME_RANGE'),
                        showCancelButton: false,
                    }).catch(() => {})
                    return
                }
                date = new Date(dateInfo.startTimeFormatForCalc)
                date.setMonth(date.getMonth() + 1)
                dateFormat = date.format(props.dateTimeFormat.dateFormat)
                dateFormatForCalc = date.format(props.dateTimeFormat.dateFormatForCalc)
                // 获取年/月
                const dateYear = date.getFullYear()
                const dateMonth = date.getMonth() + 1
                const dateYearMonth = `${dateYear}/${dateMonth < 10 ? '0' + dateMonth : dateMonth}`
                dateInfo.selectedDateForShow = dateYearMonth
                // 获取某月第一天和最后一天
                const oneMonthFirstDay = new Date(dateYearMonth)
                dateInfo.oneMonthFirstDayFormatForCalc = oneMonthFirstDay.format(props.dateTimeFormat.dateFormatForCalc)
                dateInfo.oneMonthLastDayFormatForCalc = getOneMonthLastDay(dateInfo.oneMonthFirstDayFormatForCalc).format(props.dateTimeFormat.dateFormatForCalc)
                dateInfo.oneMonthFirstDayFormat = oneMonthFirstDay.format(props.dateTimeFormat.dateFormat)
                dateInfo.oneMonthLastDayFormat = getOneMonthLastDay(dateInfo.oneMonthFirstDayFormatForCalc).format(props.dateTimeFormat.dateFormat)
                const dateArr = getOneMonthAllDay(dateInfo.oneMonthFirstDayFormatForCalc, dateInfo.oneMonthLastDayFormatForCalc)
                dateInfo.selectedDateForLabel = `${Translate('IDCS_DATE_TITLE')}(${dateArr.length})${Translate('IDCS_DAY_TIMES')}`
            } else if (dateInfo.currentDateIndex === 'custom') {
                // ...
            } else if (dateInfo.currentDateIndex === 'today') {
                date.setDate(date.getDate() + 1)
                dateFormat = date.format(props.dateTimeFormat.dateFormat)
                dateFormatForCalc = date.format(props.dateTimeFormat.dateFormatForCalc)
                if (dateFormat === todayFormat) {
                    dateInfo.selectedDateForShow = Translate('IDCS_CALENDAR_TODAY')
                } else if (dateFormat === yesterdayFormat) {
                    dateInfo.selectedDateForShow = Translate('IDCS_CALENDAR_YESTERDAY')
                } else {
                    dateInfo.selectedDateForShow = dateFormat
                }
            }
            // 更新开始时间
            if (dateInfo.currentDateIndex !== 'custom') {
                dateInfo.startTimeFormat = dateFormat
                dateInfo.startTimeFormatForCalc = dateFormatForCalc
            }
            // 传递最新数据给父组件
            props.handleNextDate(dateInfo as SelectedDateInfo)
        }

        return { dateInfo, handlePre, handleNext }
    },
})
