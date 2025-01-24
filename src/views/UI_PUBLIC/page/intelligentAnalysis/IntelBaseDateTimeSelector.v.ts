/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-06 16:40:16
 * @Description: 智能分析 - 时间日期选择器
 */
import dayjs from 'dayjs'
export default defineComponent({
    props: {
        /**
         * @property {[number, number]} 起止时间戳 （ms）
         */
        modelValue: {
            type: Array as PropType<number[] | [number, number]>,
            required: true,
        },
    },
    emits: {
        'update:model-value'(date: [number, number]) {
            return Array.isArray(date)
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        // 日期类型与文案的映射
        const DATE_MAPPING: Record<string, string> = {
            today: Translate('IDCS_CALENDAR_TODAY'),
            yesterday: Translate('IDCS_CALENDAR_YESTERDAY'),
            week: Translate('IDCS_THIS_WEEK'),
            month: Translate('IDCS_THIS_MONTH'),
            custom: Translate('IDCS_REPLAY_CUSTOMIZE'),
        }

        const pageData = ref({
            // 是否显示选项框
            isPop: false,
            // 日期范围类型
            dateRangeType: 'today',
            // 确认的日期范围类型
            confirmDateRangeType: 'today',
            // 按钮选项
            buttons: objectToOptions(DATE_MAPPING, 'string'),
        })

        // 选项框回显内容
        const content = computed(() => {
            if (pageData.value.confirmDateRangeType === 'custom') {
                const from = formatDate(prop.modelValue[0], dateTime.dateTimeFormat)
                const to = formatDate(prop.modelValue[1], dateTime.dateTimeFormat)
                return from + ' -- ' + to
            } else {
                const from = formatDate(prop.modelValue[0], dateTime.dateFormat)
                const to = formatDate(prop.modelValue[1], dateTime.dateFormat)
                const label = DATE_MAPPING[pageData.value.confirmDateRangeType]
                switch (pageData.value.confirmDateRangeType) {
                    case 'today':
                    case 'yesterday':
                        return label + ' ' + from
                    case 'week':
                    case 'month':
                    default:
                        return label + ' ' + from + ' -- ' + to
                }
            }
        })

        const formData = ref({
            // 自定义开始时间
            startTime: '',
            // 自定义结束时间
            endTime: '',
        })

        /**
         * @description 确认更新起止时间
         */
        const confirm = () => {
            pageData.value.isPop = false
            pageData.value.confirmDateRangeType = pageData.value.dateRangeType
            ctx.emit('update:model-value', [dayjs(formData.value.startTime, dateTime.dateTimeFormat).valueOf(), dayjs(formData.value.endTime, dateTime.dateTimeFormat).valueOf()])
        }

        // 打开选择框时，更新勾选值
        watch(
            () => pageData.value.isPop,
            (value) => {
                if (value) {
                    if (pageData.value.dateRangeType !== pageData.value.confirmDateRangeType) {
                        pageData.value.dateRangeType = pageData.value.confirmDateRangeType
                    }
                    formData.value.startTime = formatDate(prop.modelValue[0], dateTime.dateTimeFormat)
                    formData.value.endTime = formatDate(prop.modelValue[1], dateTime.dateTimeFormat)
                }
            },
        )

        /**
         * @description 类型变更时，更新默认起止时间
         * @param {strng} value
         */
        const changeType = (value: string) => {
            pageData.value.dateRangeType = value
            switch (value) {
                case 'today':
                    formData.value.startTime = dayjs().hour(0).minute(0).second(0).format(dateTime.dateTimeFormat)
                    formData.value.endTime = dayjs().hour(23).minute(59).second(59).format(dateTime.dateTimeFormat)
                    break
                case 'yesterday':
                    formData.value.startTime = dayjs().subtract(1, 'day').hour(0).minute(0).second(0).format(dateTime.dateTimeFormat)
                    formData.value.endTime = dayjs().subtract(1, 'day').hour(23).minute(59).second(59).format(dateTime.dateTimeFormat)
                    break
                case 'week':
                    formData.value.startTime = dayjs().day(0).hour(0).minute(0).second(0).format(dateTime.dateTimeFormat)
                    formData.value.endTime = dayjs().day(6).hour(23).minute(59).second(59).format(dateTime.dateTimeFormat)
                    break
                case 'month':
                    const days = dayjs().daysInMonth()
                    formData.value.startTime = dayjs().date(1).hour(0).minute(0).second(0).format(dateTime.dateTimeFormat)
                    formData.value.endTime = dayjs().date(days).hour(23).minute(59).second(59).format(dateTime.dateTimeFormat)
                    break
                default:
                    break
            }
        }

        onMounted(() => {
            // 如果表单没有值，则创造初始值
            if (!prop.modelValue[0] && !prop.modelValue[1]) {
                formData.value.startTime = dayjs().hour(0).minute(0).second(0).format(dateTime.dateTimeFormat)
                formData.value.endTime = dayjs().hour(23).minute(59).second(59).format(dateTime.dateTimeFormat)
                confirm()
            }
        })

        return {
            dateTime,
            formData,
            pageData,
            // changePicker,
            changeType,
            confirm,
            content,
        }
    },
})
