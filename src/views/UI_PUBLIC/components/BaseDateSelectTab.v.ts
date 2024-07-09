/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-24 17:04:27
 * @Description: 通用的日期选择选项卡组件
 */

export default defineComponent({
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
        // 当前的时间信息(dateInfo.currentDateIndex,dateInfo.startTimeFormat,endTimeFormat,dateInfo.selectedDateForShow,dateInfo.selectedDateForLabel,dateInfo.oneWeekFirstDayFormat,dateInfo.oneWeekLastDayFormat,dateInfo.oneMonthFirstDayFormat,dateInfo.oneMonthLastDayFormat)
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
        handleSelectDate: {
            type: Function,
            require: true,
        },
    },
    setup(props: any) {
        // 多语言翻译方法
        const { Translate } = useLangStore()
        // props.dateInfo（子组件中不允许直接修改props数据，需要搞个副本操作，最终再传递给父组件最新的数据）
        const dateInfo = props.selectedDateInfo

        // 日期选择-回调
        function handleSelect(dateIndex: string) {
            // 更新当前选中的标签项
            dateInfo.currentDateIndex = dateIndex
            // day、week、month、custom、today
            if (dateIndex === 'day') {
                const today = new Date()
                const yesterday = new Date()
                yesterday.setDate(today.getDate() - 1)
                const todayFormat = today.format(props.dateTimeFormat.dateFormat)
                const yesterdayFormat = yesterday.format(props.dateTimeFormat.dateFormat)
                // 获取开始时间、展示时间
                dateInfo.startTimeFormat = new Date(dateInfo.startTimeFormatForCalc).format(props.dateTimeFormat.dateFormat)
                dateInfo.startTimeFormatForCalc = new Date(dateInfo.startTimeFormatForCalc).format(props.dateTimeFormat.dateFormatForCalc)
                if (dateInfo.startTimeFormat === yesterdayFormat) {
                    dateInfo.selectedDateForShow = Translate('IDCS_CALENDAR_YESTERDAY')
                } else if (dateInfo.startTimeFormat === todayFormat) {
                    dateInfo.selectedDateForShow = Translate('IDCS_CALENDAR_TODAY')
                } else {
                    dateInfo.selectedDateForShow = dateInfo.startTimeFormat
                }
                dateInfo.selectedDateForLabel = Translate('IDCS_ATTENDANCE_DATE').formatForLang(1, '')
            } else if (dateIndex === 'week') {
                const startTime = new Date(dateInfo.startTimeFormatForCalc)
                const startTimeStamp = startTime.getTime()
                const startTimeDay = startTime.getDay()
                if (startTimeDay) {
                    const oneDayMilliseconds = 24 * 60 * 60 * 1000
                    const mondayTimeStamp = startTimeStamp - (startTimeDay - 1) * oneDayMilliseconds
                    const sundayTimeStamp = startTimeStamp + (7 - startTimeDay) * oneDayMilliseconds
                    const mondayTime = new Date(mondayTimeStamp)
                    const sundayTime = new Date(sundayTimeStamp)
                    dateInfo.oneWeekFirstDayFormatForCalc = mondayTime.format(props.dateTimeFormat.dateFormatForCalc)
                    dateInfo.oneWeekLastDayFormatForCalc = sundayTime.format(props.dateTimeFormat.dateFormatForCalc)
                    dateInfo.oneWeekFirstDayFormat = mondayTime.format(props.dateTimeFormat.dateFormat)
                    dateInfo.oneWeekLastDayFormat = sundayTime.format(props.dateTimeFormat.dateFormat)
                } else {
                    startTime.setDate(startTime.getDate() - 6)
                    dateInfo.oneWeekFirstDayFormatForCalc = startTime.format(props.dateTimeFormat.dateFormatForCalc)
                    dateInfo.oneWeekLastDayFormatForCalc = dateInfo.startTimeFormatForCalc
                    dateInfo.oneWeekFirstDayFormat = startTime.format(props.dateTimeFormat.dateFormat)
                    dateInfo.oneWeekLastDayFormat = dateInfo.startTimeFormat
                }
                // 获取开始时间、展示时间
                dateInfo.startTimeFormat = dateInfo.oneWeekFirstDayFormat
                dateInfo.startTimeFormatForCalc = dateInfo.oneWeekFirstDayFormatForCalc
                dateInfo.selectedDateForShow = `${dateInfo.oneWeekFirstDayFormat} -- ${dateInfo.oneWeekLastDayFormat}`
                dateInfo.selectedDateForLabel = `${Translate('IDCS_DATE_TITLE')}(7)${Translate('IDCS_DAY_TIMES')}`
            } else if (dateIndex === 'month') {
                // 获取年/月
                const startTime = new Date(dateInfo.startTimeFormatForCalc)
                const startTimeYear = startTime.getFullYear()
                const startTimeMonth = startTime.getMonth() + 1
                const startTimeYearMonth = `${startTimeYear}/${startTimeMonth < 10 ? '0' + startTimeMonth : startTimeMonth}`
                // 获取某月第一天和最后一天
                const oneMonthFirstDay = new Date(startTimeYearMonth)
                dateInfo.oneMonthFirstDayFormatForCalc = oneMonthFirstDay.format(props.dateTimeFormat.dateFormatForCalc)
                dateInfo.oneMonthLastDayFormatForCalc = getOneMonthLastDay(dateInfo.oneMonthFirstDayFormatForCalc).format(props.dateTimeFormat.dateFormatForCalc)
                dateInfo.oneMonthFirstDayFormat = oneMonthFirstDay.format(props.dateTimeFormat.dateFormat)
                dateInfo.oneMonthLastDayFormat = getOneMonthLastDay(dateInfo.oneMonthFirstDayFormatForCalc).format(props.dateTimeFormat.dateFormat)
                const dateArr = getOneMonthAllDay(dateInfo.oneMonthFirstDayFormatForCalc, dateInfo.oneMonthLastDayFormatForCalc)
                // 获取开始时间、展示时间（此时开始时间更新为某月第一天）
                dateInfo.startTimeFormat = dateInfo.oneMonthFirstDayFormat
                dateInfo.startTimeFormatForCalc = dateInfo.oneMonthFirstDayFormatForCalc
                dateInfo.selectedDateForShow = startTimeYearMonth
                dateInfo.selectedDateForLabel = `${Translate('IDCS_DATE_TITLE')}(${dateArr.length})${Translate('IDCS_DAY_TIMES')}`
            } else if (dateIndex === 'custom') {
                // ...
            } else if (dateIndex === 'today') {
                // 获取开始时间、展示时间
                dateInfo.startTimeFormat = new Date().format(props.dateTimeFormat.dateFormat)
                dateInfo.startTimeFormatForCalc = new Date().format(props.dateTimeFormat.dateFormatForCalc)
                dateInfo.selectedDateForShow = Translate('IDCS_CALENDAR_TODAY')
                dateInfo.selectedDateForLabel = Translate('IDCS_ATTENDANCE_DATE').formatForLang(1, '')
            }
            // 传递最新数据给父组件
            props.handleSelectDate(dateInfo as SelectedDateInfo)
        }

        onMounted(() => {
            handleSelect('today')
        })

        return { handleSelect }
    },
})
