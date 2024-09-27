/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-13 11:32:17
 * @Description:过线检测邮件设置弹窗
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-25 17:07:07
 */
import { type emailData } from '@/types/apiType/aiAndEvent'
import { type FormInstance, type FormRules } from 'element-plus'
export default defineComponent({
    props: {
        scheduleList: {
            type: Array as PropType<{ value: string; label: string }[]>,
            required: true,
        },
        emailData: {
            type: Object as PropType<emailData>,
            required: true,
        },
    },
    emits: {
        close(e: emailData) {
            return e
        },
    },
    setup(props, ctx) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const formRef = ref<FormInstance>()
        const formData = ref({
            address: '',
            schedule: '',
            rowClicked: false,
        })
        const error = ref('')
        const maxEmailCount = ref(16)
        const rules = reactive<FormRules>({
            address: [
                {
                    validator: (rule, value: string, callback) => {
                        if (value == '') {
                            callback(new Error(Translate('IDCS_PROMPT_EMAIL_ADDRESS_EMPTY')))
                            error.value = Translate('IDCS_PROMPT_EMAIL_ADDRESS_EMPTY')
                            return
                        } else if (!checkEmail(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_INVALID_EMAIL')))
                            error.value = Translate('IDCS_PROMPT_INVALID_EMAIL')
                            return
                        } else if (checkExist(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_EMAIL_EXIST')))
                            error.value = Translate('IDCS_PROMPT_EMAIL_EXIST')
                            return
                        } else if (pageData.value.data.receiverData.length >= maxEmailCount.value) {
                            callback(new Error(Translate('IDCS_PROMPT_EMAIL_NUM_LIMIT').formatForLang(maxEmailCount.value)))
                            error.value = Translate('IDCS_PROMPT_EMAIL_NUM_LIMIT').formatForLang(maxEmailCount.value)
                            return
                        }
                        callback()
                    },
                    trigger: 'blur',
                },
            ],
        })
        const pageData = ref({
            data: {
                saveTargetPicture: false,
                saveSourcePicture: false,
                sendEmailData: {
                    type: '0',
                    enableSwitch: false,
                    dailyReportSwitch: false,
                    weeklyReportSwitch: false,
                    weeklyReportDate: '1',
                    mouthlyReportSwitch: false,
                    mouthlyReportDate: '1',
                    reportHour: 0,
                    reportMin: 0,
                },
                receiverData: [] as { address: string; schedule: string; rowClicked: boolean }[],
            } as emailData,
            time: '00:00',
            weekOption: [
                { value: '1', label: Translate('IDCS_WEEK_DAY_ONE') },
                { value: '2', label: Translate('IDCS_WEEK_DAY_TWO') },
                { value: '3', label: Translate('IDCS_WEEK_DAY_THREE') },
                { value: '4', label: Translate('IDCS_WEEK_DAY_FOUR') },
                { value: '5', label: Translate('IDCS_WEEK_DAY_FIVE') },
                { value: '6', label: Translate('IDCS_WEEK_DAY_SIX') },
                { value: '7', label: Translate('IDCS_WEEK_DAY_SEVEN') },
            ] as { value: string; label: string }[],
            monthOption: [] as { value: string; label: string }[],
            scheduleList: [] as { value: string; label: string }[],
            // 添加弹窗
            popOpen: false,
        })
        const handleTimePickerChange = () => {
            pageData.value.data.sendEmailData.reportHour = parseInt(pageData.value.time.split(':')[0])
            pageData.value.data.sendEmailData.reportMin = parseInt(pageData.value.time.split(':')[1])
            console.log('pageData.value', pageData.value)
        }
        // 原代码中显示了地址后无法隐藏，这里改为再次点击隐藏
        const handleRowClick = function (row: { address: string; schedule: string; rowClicked: boolean }) {
            row.rowClicked = !row.rowClicked
            // // 原代码逻辑：若未被点击，则显示
            // if (!row.rowClicked) {
            //     row.rowClicked = !row.rowClicked
            // }
            pageData.value.data.receiverData.forEach((item) => {
                if (item != row) {
                    item.rowClicked = false
                }
            })
        }
        // 隐藏邮箱地址
        const formatAddress = function (rowData: { address: string; schedule: string; rowClicked: boolean }) {
            if (rowData.rowClicked) {
                return rowData.address
            }
            return hideEmailAddress(rowData.address)
        }
        // 删除收件人
        const handleDelReceiver = function (row: { address: string; schedule: string; rowClicked: boolean }) {
            openMessageTipBox({
                type: 'question',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_DELETE_MP_EMAIL_RECEIVER_S').formatForLang(row['address']),
            }).then(() => {
                const index = pageData.value.data.receiverData.indexOf(row)
                pageData.value.data.receiverData.splice(index, 1)
            })
        }
        // 新增收件人
        const handleAddReceiver = function () {
            // 规则验证
            if (!formRef.value) return
            formRef.value.validate((valid) => {
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
        const checkExist = function (address: string) {
            const result = pageData.value.data.receiverData.filter((item) => item.address == address)
            return result.length > 0
        }
        const open = () => {
            pageData.value.data.saveTargetPicture = props.emailData.saveTargetPicture
            pageData.value.data.saveSourcePicture = props.emailData.saveSourcePicture
            pageData.value.data.sendEmailData = props.emailData.sendEmailData
            pageData.value.data.receiverData = props.emailData.receiverData
            pageData.value.time =
                (props.emailData.sendEmailData.reportHour > 10 ? props.emailData.sendEmailData.reportHour : '0' + props.emailData.sendEmailData.reportHour) +
                ':' +
                (props.emailData.sendEmailData.reportMin > 10 ? props.emailData.sendEmailData.reportMin : '0' + props.emailData.sendEmailData.reportMin)
            pageData.value.scheduleList = props.scheduleList
            formData.value.schedule = pageData.value.scheduleList[0].value
            console.log('pageData.value', pageData.value)
        }
        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close', pageData.value.data)
        }
        onMounted(() => {
            for (let i = 1; i <= 31; i++) {
                // TODO 只能翻译成中文
                pageData.value.monthOption.push({ value: i.toString(), label: i.toString() + Translate('IDCS_TIMING_SEND_EMAIL_DAY') })
            }
        })
        return {
            Translate,
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
            handleDelReceiver,
            handleAddReceiver,
        }
    },
})
