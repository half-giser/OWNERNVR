/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-12 14:21:22
 * @Description: email通知
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-24 15:19:00
 */
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import { EmailReceiver } from '@/types/apiType/aiAndEvent'
import { type FormInstance, type FormRules, type TableInstance } from 'element-plus'

export default defineComponent({
    components: {
        ScheduleManagPop,
    },
    setup() {
        const router = useRouter()
        const userSession = useUserSessionStore()
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const tableData = ref<EmailReceiver[]>([])
        const tableRef = ref<TableInstance>()
        const maxEmailCount = ref(16)
        const rules = reactive<FormRules>({
            recipient: [
                {
                    required: true,
                    message: Translate('IDCS_PROMPT_EMAIL_ADDRESS_EMPTY'),
                    trigger: 'manual',
                },
                {
                    validator: (_rule, value: string, callback) => {
                        if (!checkEmail(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_INVALID_EMAIL')))
                            return
                        } else if (checkExist(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_EMAIL_EXIST')))
                            return
                        } else if (tableData.value.length >= maxEmailCount.value) {
                            callback(new Error(Translate('IDCS_PROMPT_EMAIL_NUM_LIMIT').formatForLang(maxEmailCount.value)))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        // 表单实例
        const formRef = ref<FormInstance>()
        const pageData = ref({
            // 发件人
            sender: '',
            // 发件人显示
            senderShow: false,
            // 收件人
            form: {
                recipient: '',
            },
            // 排程
            schedule: '',
            // 排程列表
            scheduleList: [] as [] as SelectOption<string, string>[],
            //排程管理弹窗显示状态
            scheduleManagePopOpen: false,
        })
        const checkExist = (address: string) => {
            const result = tableData.value.some((item) => item.address == address)
            return result
        }

        const getIconStatus = () => {
            if (pageData.value.senderShow) {
                return 0
            }
            return 2
        }

        const maskShow = () => {
            pageData.value.senderShow = !pageData.value.senderShow
        }

        const formatSender = (sender: string) => {
            if (pageData.value.senderShow) {
                return sender
            }
            return hideEmailAddress(sender)
        }

        const formatAddress = (rowData: EmailReceiver) => {
            if (rowData.rowClicked) {
                return rowData.address
            }
            return hideEmailAddress(rowData.address)
        }

        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
            pageData.value.schedule = pageData.value.scheduleList[0].value
        }

        const getData = async () => {
            openLoading()
            await getScheduleList()
            queryEmailCfg().then((resb) => {
                closeLoading()
                const res = queryXml(resb)
                if (res('status').text() == 'success') {
                    pageData.value.sender = res('//content/sender/address').text()
                    res('//content/receiver/item').forEach((ele) => {
                        const eleXml = queryXml(ele.element)
                        const emailReceiver = new EmailReceiver()
                        if (typeof eleXml('schedule').attr('id') == undefined) {
                            emailReceiver.address = eleXml('address').text()
                            emailReceiver.schedule = ''
                            emailReceiver.addressShow = hideEmailAddress(emailReceiver.address)
                            tableData.value.push(emailReceiver)
                        } else {
                            emailReceiver.address = eleXml('address').text()
                            emailReceiver.schedule = eleXml('schedule').attr('id')
                            emailReceiver.addressShow = hideEmailAddress(emailReceiver.address)
                            tableData.value.push(emailReceiver)
                        }
                    })
                }
            })
        }

        // 原代码中显示了地址后无法隐藏，这里改为再次点击隐藏
        const handleRowClick = (row: EmailReceiver) => {
            row.rowClicked = !row.rowClicked
            // // 原代码逻辑：若未被点击，则显示
            // if (!row.rowClicked) {
            //     row.rowClicked = !row.rowClicked
            // }
            tableData.value.forEach((item) => {
                if (item != row) {
                    item.rowClicked = false
                }
            })
        }

        const handleScheduleChange = (row: EmailReceiver) => {
            tableRef.value?.setCurrentRow(row)
            row.rowClicked = true
            tableData.value.forEach((item) => {
                if (item != row) {
                    item.rowClicked = false
                }
            })
        }

        const handleScheduleChangeAll = (value: string) => {
            tableData.value.forEach((item) => {
                item.schedule = value
            })
        }

        const handleDelReceiver = (row: EmailReceiver) => {
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_EMAIL_RECEIVER_S').formatForLang(row.address),
            }).then(() => {
                const index = tableData.value.indexOf(row)
                tableData.value.splice(index, 1)
            })
        }

        const handleDelReceiverAll = () => {
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_DELETE_ALL_ITEMS'),
            }).then(() => {
                tableData.value = []
            })
        }

        const addRecipient = () => {
            // 规则验证
            if (!formRef.value) return
            formRef.value.validate((valid) => {
                if (valid) {
                    const emailReceiver = new EmailReceiver()
                    emailReceiver.address = pageData.value.form.recipient
                    emailReceiver.schedule = pageData.value.schedule
                    emailReceiver.addressShow = hideEmailAddress(emailReceiver.address)
                    tableData.value.push(emailReceiver)
                    pageData.value.form.recipient = ''
                }
            })
        }

        const handleSenderEdit = () => {
            if (userSession.hasAuth('net')) {
                router.push('/config/net/email')
            } else {
                openMessageTipBox({
                    type: 'question',
                    message: Translate('IDCS_NO_AUTH'),
                })
            }
        }

        const handleScheduleManage = () => {
            pageData.value.scheduleManagePopOpen = true
        }

        const handleApply = () => {
            let sendXml = rawXml`
            <content>   
                <receiver type="list">
                `
            tableData.value.forEach((item) => {
                sendXml += rawXml`
                    <item>
                        <address><![CDATA[${item.address}]]></address>
                        <schedule id="${item.schedule}"></schedule>
                    </item>
                `
            })
            sendXml += rawXml`</receiver>
                            </content>`
            openLoading()
            editEmailCfg(sendXml).then((res) => {
                closeLoading()
                commSaveResponseHadler(res)
            })
        }

        const handleSchedulePopClose = async () => {
            pageData.value.scheduleManagePopOpen = false
            await getScheduleList()
        }
        onMounted(async () => {
            getData()
        })

        return {
            pageData,
            tableData,
            tableRef,
            formRef,
            rules,
            handleDelReceiver,
            handleDelReceiverAll,
            addRecipient,
            getIconStatus,
            maskShow,
            handleSenderEdit,
            handleScheduleChange,
            handleScheduleChangeAll,
            handleScheduleManage,
            handleApply,
            formatSender,
            formatAddress,
            handleRowClick,
            ScheduleManagPop,
            handleSchedulePopClose,
        }
    },
})
