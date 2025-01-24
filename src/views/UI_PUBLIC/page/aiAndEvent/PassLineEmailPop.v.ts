/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-13 11:32:17
 * @Description: 过线检测邮件设置弹窗
 */
import { type AlarmPassLinesEmailDto, type AlarmPassLinesEmailReceiverDto } from '@/types/apiType/aiAndEvent'
import { type FormRules } from 'element-plus'
export default defineComponent({
    props: {
        scheduleList: {
            type: Array as PropType<SelectOption<string, string>[]>,
            required: true,
        },
        emailData: {
            type: Object as PropType<AlarmPassLinesEmailDto>,
            required: true,
        },
    },
    emits: {
        close(e: AlarmPassLinesEmailDto) {
            return e
        },
    },
    setup(props, ctx) {
        const { Translate } = useLangStore()
        const formRef = useFormRef()
        const formData = ref({
            address: '',
            schedule: '',
        })
        const error = ref('')
        const maxEmailCount = ref(16)
        const rules = reactive<FormRules>({
            address: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_EMAIL_ADDRESS_EMPTY')))
                            error.value = Translate('IDCS_PROMPT_EMAIL_ADDRESS_EMPTY')
                            return
                        }

                        if (!checkEmail(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_INVALID_EMAIL')))
                            error.value = Translate('IDCS_PROMPT_INVALID_EMAIL')
                            return
                        }

                        if (checkExist(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_EMAIL_EXIST')))
                            error.value = Translate('IDCS_PROMPT_EMAIL_EXIST')
                            return
                        }

                        if (pageData.value.data.receiverData.length >= maxEmailCount.value) {
                            callback(new Error(Translate('IDCS_PROMPT_EMAIL_NUM_LIMIT').formatForLang(maxEmailCount.value)))
                            error.value = Translate('IDCS_PROMPT_EMAIL_NUM_LIMIT').formatForLang(maxEmailCount.value)
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const pageData = ref({
            data: {
                saveTargetPicture: false,
                saveSourcePicture: false,
                sendEmailData: {
                    type: 0,
                    enableSwitch: false,
                    dailyReportSwitch: false,
                    weeklyReportSwitch: false,
                    weeklyReportDate: 1,
                    mouthlyReportSwitch: false,
                    mouthlyReportDate: 1,
                    reportHour: 0,
                    reportMin: 0,
                },
                receiverData: [],
            } as AlarmPassLinesEmailDto,
            time: '00:00',
            weekOption: objectToOptions(getTranslateMapping(DEFAULT_WEEK_MAPPING), 'number').slice(1),
            monthOption: [] as SelectOption<string, string>[],
            scheduleList: [] as SelectOption<string, string>[],
            // 添加弹窗
            popOpen: false,
            currentRow: {
                address: '',
                schedule: '',
            },
        })

        const handleTimePickerChange = () => {
            const time = pageData.value.time.split(':')[0]
            pageData.value.data.sendEmailData.reportHour = Number(time[0])
            pageData.value.data.sendEmailData.reportMin = Number(time[1])
        }

        // 原代码中显示了地址后无法隐藏，这里改为再次点击隐藏
        const handleRowClick = (row: AlarmPassLinesEmailReceiverDto) => {
            pageData.value.currentRow = row
        }

        // 隐藏邮箱地址
        const formatAddress = (rowData: AlarmPassLinesEmailReceiverDto) => {
            if (rowData === pageData.value.currentRow) {
                return rowData.address
            }
            return hideEmailAddress(rowData.address)
        }

        const formatSchedule = (rowData: AlarmPassLinesEmailReceiverDto) => {
            return props.scheduleList.find((item) => rowData.schedule === item.value)!.label
        }

        // 删除收件人
        const delReceiver = (row: AlarmPassLinesEmailReceiverDto) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_EMAIL_RECEIVER_S').formatForLang(row.address),
            }).then(() => {
                const index = pageData.value.data.receiverData.indexOf(row)
                pageData.value.data.receiverData.splice(index, 1)
            })
        }

        // 新增收件人
        const addReceiver = () => {
            // 规则验证
            formRef.value!.validate((valid) => {
                if (valid) {
                    const data = {
                        address: formData.value.address,
                        schedule: formData.value.schedule,
                        rowClicked: false,
                    }
                    pageData.value.data.receiverData.push(data)
                    formData.value.address = ''
                    pageData.value.popOpen = false
                }
            })
        }

        const checkExist = (address: string) => {
            const result = pageData.value.data.receiverData.some((item) => item.address === address)
            return result
        }

        const open = () => {
            pageData.value.data.saveTargetPicture = props.emailData.saveTargetPicture
            pageData.value.data.saveSourcePicture = props.emailData.saveSourcePicture
            pageData.value.data.sendEmailData = props.emailData.sendEmailData
            pageData.value.data.receiverData = props.emailData.receiverData
            pageData.value.time = `${('0' + props.emailData.sendEmailData.reportHour).slice(-2)}:${('0' + props.emailData.sendEmailData.reportMin).slice(-2)}`
            pageData.value.scheduleList = props.scheduleList
            pageData.value.currentRow = {
                schedule: '',
                address: '',
            }
            formData.value.schedule = pageData.value.scheduleList[0].value
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close', pageData.value.data)
        }

        onMounted(() => {
            // TODO 只能翻译成中文
            pageData.value.monthOption = Array(31)
                .fill(0)
                .map((_, index) => {
                    const i = (index + 1).toString()
                    return {
                        value: i,
                        label: i + Translate('IDCS_TIMING_SEND_EMAIL_DAY'),
                    }
                })
        })

        return {
            formRef,
            formData,
            error,
            rules,
            pageData,
            open,
            close,
            handleTimePickerChange,
            handleRowClick,
            formatAddress,
            formatSchedule,
            delReceiver,
            addReceiver,
        }
    },
})
