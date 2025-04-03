/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-31 16:36:16
 * @Description: 排程编辑弹框
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        scheduleDtail: Object as PropType<ScheduleInfo>,
        dayEnum: {
            type: Array as PropType<string[]>,
            required: true,
        },
    },
    emits: {
        close(type: boolean) {
            return typeof type === 'boolean'
        },
    },
    setup(props, ctx) {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        const scheduleWeekRef = ref<ScheduleWeekInstance>()

        const pageData = ref({
            dragAction: 'add',
            mainTitle: '',
            //手动选择时间段面板显示状态
            manualTimeInputShow: false,
            //手动选择时间段
            manualTimeSpan: ref<[Date, Date]>([new Date(2016, 9, 10, 0, 0), new Date(2016, 9, 10, 23, 59)]),
            weekdays: [0, 1, 2, 3, 4, 5, 6] as number[],
        })

        const formRef = useFormRef()
        const formData: Ref<ScheduleInfo> = ref(new ScheduleInfo())

        // 表单验证规则
        const formRule = ref<FormRules>({
            name: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_SCHEDULE_NAME_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            timespan: [
                {
                    validator: (_rule, _value, callback) => {
                        if (!(formData.value.timespan.length && formData.value.timespan.find((o) => o.length > 0))) {
                            openMessageBox(Translate('IDCS_PROMPT_SCHEDULE_PERIOD_EMPTY'))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description: 打开排程新增/编辑弹框
         */
        const onOpen = () => {
            if (props.scheduleDtail) {
                pageData.value.mainTitle = Translate('IDCS_EDIT_SCHEDULE')
                formData.value = props.scheduleDtail
                scheduleWeekRef.value?.resetValue(formData.value.timespan)
            } else {
                pageData.value.mainTitle = Translate('IDCS_ADD_SCHEDULE')
                formData.value = new ScheduleInfo()
            }
        }

        /**
         * @description: 手动输入时间面板关闭
         * @return {*}
         */
        const manualTimeInputClose = () => {
            pageData.value.manualTimeInputShow = false
        }

        const dateToTimeNum = (time: Date) => {
            return time.getHours() * 60 + time.getMinutes()
        }

        /**
         * @description 批量手动输入时间
         * @return {*}
         */
        const manualTimeInputOk = () => {
            if (pageData.value.weekdays.length) {
                scheduleWeekRef.value!.addTimeSpan([dateToTimeNum(pageData.value.manualTimeSpan[0]), dateToTimeNum(pageData.value.manualTimeSpan[1])], pageData.value.weekdays)
            }
            manualTimeInputClose()
        }

        /**
         * @description 新增/编辑排程
         */
        const save = () => {
            formData.value.timespan = scheduleWeekRef.value!.getValue()
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }

                const sendXml = rawXml`
                    <types>
                        <schedulePeriodMode>
                            <enum>weekly</enum>
                            <enum>yearly</enum>
                        </schedulePeriodMode>
                        <weekDay>
                            <enum>sun</enum>
                            <enum>mon</enum>
                            <enum>tue</enum>
                            <enum>wed</enum>
                            <enum>thu</enum>
                            <enum>fri</enum>
                            <enum>sat</enum>
                        </weekDay>
                    </types>
                    <content>
                        ${props.scheduleDtail ? `<id>${props.scheduleDtail.id}</id>` : ''}
                        <name maxByteLen="63">${wrapCDATA(formData.value.name)}</name>
                        <period type="list">
                            <itemType>
                                <mode type="schedulePeriodMode"/>
                                <day type="weekDay"/>
                            </itemType>
                            ${formData.value.timespan
                                .map((dayValue, index) => {
                                    return dayValue
                                        .map((item) => {
                                            return rawXml`
                                            <item>
                                                <mode>weekly</mode>
                                                <start>${item[0]}</start>
                                                <end>${item[1]}</end>
                                                <day>${props.dayEnum[index]}</day>
                                            </item>`
                                        })
                                        .join('')
                                })
                                .join('')}
                        </period>
                    </content>
                `

                const saveFun = props.scheduleDtail ? editSchedule : createSchedule

                openLoading()
                const result = await saveFun(sendXml)
                closeLoading()
                commSaveResponseHandler(result, () => {
                    ctx.emit('close', true)
                })
            })
        }

        return {
            pageData,
            formRef,
            formData,
            formRule,
            scheduleWeekRef,
            onOpen,
            manualTimeInputClose,
            manualTimeInputOk,
            save,
            dateTime,
        }
    },
})
