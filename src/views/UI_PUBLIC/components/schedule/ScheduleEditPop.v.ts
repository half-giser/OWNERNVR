import { defineComponent } from 'vue'
import BaseScheduleWeek from '@/components/BaseScheduleWeek.vue'
import { ScheduleInfo } from '@/types/apiType/schedule'
import { type FormInstance, type FormRules } from 'element-plus'

export default defineComponent({
    components: { BaseScheduleWeek },
    props: {
        scheduleDtail: Object as PropType<ScheduleInfo>,
        dayEnum: {
            type: Array as PropType<string[]>,
            required: true,
        },
    },
    emits: ['close'],
    setup(props, ctx) {
        const { Translate } = useLangStore()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const scheduleWeekRef: Ref<InstanceType<typeof BaseScheduleWeek> | null> = ref(null)

        const pageData = ref({
            dragAction: 'add',
            mainTitle: '',
            //手动选择时间段面板显示状态
            manualTimeInputShow: false,
            //手动选择时间段
            manualTimeSpan: ref<[Date, Date]>([new Date(2016, 9, 10, 0, 0), new Date(2016, 9, 10, 23, 59)]),
            weekdays: [0, 1, 2, 3, 4, 5, 6] as number[],
        })

        const formRef = ref<FormInstance>()
        const formData: Ref<ScheduleInfo> = ref(new ScheduleInfo())

        // 表单验证规则
        const formRule = ref<FormRules>({
            name: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_SCHEDULE_NAME_EMPTY')))
                            return
                        }
                        formData.value.name = cutStringByByte(value, nameByteMaxLen)
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            timespan: [
                {
                    validator: (_rule, _value: string, callback) => {
                        if (!(formData.value.timespan.length && formData.value.timespan.find((o) => o.length > 0))) {
                            callback(new Error(''))
                            openMessageTipBox({
                                type: 'info',
                                title: Translate('IDCS_INFO_TIP'),
                                message: Translate('IDCS_PROMPT_SCHEDULE_PERIOD_EMPTY'),
                            })
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
         * @return {*}
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
         * 记录当前打开手动输入的按钮（在周排程时，打开一个手动输入/复制到，需要关闭其他天的手动输入/复制到，不能阻止冒泡，导致document点击时间不触发）
         */
        let manualTimeInputTarget: EventTarget | null = null
        /**
         * 手动设置时间段面板打开
         */
        const manualTimeInputOpen = (event: Event) => {
            manualTimeInputTarget = event.target
            pageData.value.manualTimeInputShow = true
            document.addEventListener('click', manualTimeInputClose)
        }

        /**
         * @description: 手动输入时间面板关闭
         * @param {Event} event
         * @return {*}
         */
        const manualTimeInputClose = (event?: Event) => {
            if (event == null || (event.target != manualTimeInputTarget && !(event.target as HTMLElement).closest('.el-popper'))) {
                pageData.value.manualTimeInputShow = false
                document.removeEventListener('click', manualTimeInputClose)
            }
        }

        const dateToTimeNum = (time: Date) => {
            return time.getHours() * 60 + time.getMinutes()
        }

        /**
         * @description: 批量手动输入时间
         * @return {*}
         */
        const manualTimeInputOk = () => {
            if (pageData.value.weekdays.length > 0) {
                scheduleWeekRef.value!.addTimeSpan([dateToTimeNum(pageData.value.manualTimeSpan[0]), dateToTimeNum(pageData.value.manualTimeSpan[1])], pageData.value.weekdays)
            }
            manualTimeInputClose()
        }

        // const verification = () => {
        //     if(scheduleData.value.name.length)
        // }

        const save = () => {
            formData.value.timespan = scheduleWeekRef.value!.getValue()
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }

                let timeSpanXmlStr = ''
                formData.value.timespan.forEach((dayValue, index) => {
                    dayValue.forEach((item) => {
                        timeSpanXmlStr += rawXml`
                        <item>
                            <mode>weekly</mode>
                            <start>${item[0]}</start>
                            <end>${item[1]}</end>
                            <day>${props.dayEnum[index]}</day>
                        </item>`
                    })
                })

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
                    ${props.scheduleDtail ? '<id>' + props.scheduleDtail.id + '</id>' : ''}
                    <name><![CDATA[${formData.value.name}]]></name>
                    <period type="list">
                        <itemType>
                            <mode type="schedulePeriodMode"/>
                            <day type="weekDay"/>
                        </itemType>
                        ${timeSpanXmlStr}
                    </period>
                </content>`

                const saveFun = props.scheduleDtail ? editSchedule : createSchedule

                openLoading(LoadingTarget.FullScreen)
                const result = await saveFun(sendXml)
                closeLoading(LoadingTarget.FullScreen)
                commSaveResponseHadler(result, () => {
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
            manualTimeInputOpen,
            manualTimeInputClose,
            manualTimeInputOk,
            save,
        }
    },
})
