/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-12 14:21:22
 * @Description: email通知
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-08-27 16:47:53
 */
import { defineComponent } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import { EmailReceiver } from '@/types/apiType/aiAndEvent'
import { type FormInstance, type FormRules } from 'element-plus'

export default defineComponent({
    components: {
        ArrowDown,
        ScheduleManagPop,
    },
    setup() {
        const router = useRouter()
        const userSession = useUserSessionStore()
        const { Translate } = useLangStore()
        const { LoadingTarget, openLoading, closeLoading } = useLoading()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const tableData = ref<EmailReceiver[]>([])
        const maxEmailCount = ref(16)
        const rules = reactive<FormRules>({
            recipient: [
                { required: true, message: Translate('IDCS_PROMPT_EMAIL_ADDRESS_EMPTY'), trigger: 'blur' },
                {
                    validator: (rule, value: string, callback) => {
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
                    trigger: 'blur',
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
        const checkExist = function (address: string) {
            const result = tableData.value.filter((item) => item.address == address)
            return result.length > 0
        }
        const getIconStatus = function () {
            if (pageData.value.senderShow) {
                return 0
            }
            return 2
        }
        const maskShow = function () {
            pageData.value.senderShow = !pageData.value.senderShow
        }
        const formatSender = function (sender: string) {
            if (pageData.value.senderShow) {
                return sender
            }
            return hideEmailAddress(sender)
        }
        const formatAddress = function (rowData: EmailReceiver) {
            if (rowData.rowClicked) {
                return rowData.address
            }
            return hideEmailAddress(rowData.address)
        }
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
            pageData.value.schedule = pageData.value.scheduleList[0].value
        }
        const getData = function () {
            getScheduleList().then(() => {
                // 将scheduleList中value为''的元素转换为' '
                pageData.value.scheduleList.forEach((item) => {
                    if (item.value == '') {
                        item.value = ' '
                    }
                })
                openLoading(LoadingTarget.FullScreen)
                queryEmailCfg().then((resb) => {
                    closeLoading(LoadingTarget.FullScreen)
                    const res = queryXml(resb)
                    if (res('status').text() == 'success') {
                        pageData.value.sender = res('//content/sender/address').text()
                        res('//content/receiver/item').forEach((ele: any) => {
                            const eleXml = queryXml(ele.element)
                            const emailReceiver = new EmailReceiver()
                            if (typeof eleXml('schedule').attr('id') == undefined) {
                                emailReceiver.address = eleXml('address').text()
                                emailReceiver.schedule = ''
                                emailReceiver.addressShow = hideEmailAddress(emailReceiver.address)
                                tableData.value.push(emailReceiver)
                            } else {
                                emailReceiver.address = eleXml('address').text()
                                emailReceiver.schedule = eleXml('schedule').attr('id') == '{00000000-0000-0000-0000-000000000000}' ? ' ' : eleXml('schedule').attr('id')
                                emailReceiver.addressShow = hideEmailAddress(emailReceiver.address)
                                tableData.value.push(emailReceiver)
                            }
                        })
                    }
                })
            })
        }
        // 原代码中显示了地址后无法隐藏，这里改为再次点击隐藏
        const handleRowClick = function (row: EmailReceiver) {
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
        const handleScheduleChangeAll = function (value: string) {
            tableData.value.forEach((item) => {
                item.schedule = value
            })
        }
        const handleDelReceiver = function (row: EmailReceiver) {
            openMessageTipBox({
                type: 'question',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_DELETE_MP_EMAIL_RECEIVER_S').formatForLang(row['address']),
            }).then(() => {
                const index = tableData.value.indexOf(row)
                tableData.value.splice(index, 1)
            })
        }
        const handleDelReceiverAll = function () {
            openMessageTipBox({
                type: 'question',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_DELETE_ALL_ITEMS'),
            }).then(() => {
                tableData.value = []
            })
        }
        const addRecipient = function () {
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
        const handleSenderEdit = function () {
            if (userSession.hasAuth('net')) {
                router.push('/config/net/email')
            } else {
                openMessageTipBox({
                    type: 'question',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_NO_AUTH'),
                })
            }
        }
        const handleScheduleManage = function () {
            pageData.value.scheduleManagePopOpen = true
        }
        const handleApply = function () {
            let sendXml = rawXml`
            <content>   
                <receiver type="list">
                `
            tableData.value.forEach((item) => {
                const schedule = item.schedule == ' ' ? '{00000000-0000-0000-0000-000000000000}' : item.schedule
                sendXml += rawXml`
                    <item>
                        <address><![CDATA[${item.address}]]></address>
                        <schedule id="${schedule}"></schedule>
                    </item>
                `
            })
            sendXml += rawXml`
                </receiver>
            </content>`
            openLoading(LoadingTarget.FullScreen)
            editEmailCfg(sendXml).then((resb) => {
                closeLoading(LoadingTarget.FullScreen)
                const res = queryXml(resb)
                if (res('status').text() == 'success') {
                    openMessageTipBox({
                        type: 'success',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                    })
                } else {
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_SAVE_DATA_FAIL'),
                    })
                }
            })
        }
        onMounted(async () => {
            // pageData.value.scheduleList = await buildScheduleList()
            // pageData.value.schedule = pageData.value.scheduleList[0].value
            getData()
        })

        return {
            pageData,
            Translate,
            tableData,
            formRef,
            rules,
            handleDelReceiver,
            handleDelReceiverAll,
            addRecipient,
            getIconStatus,
            maskShow,
            handleSenderEdit,
            handleScheduleChangeAll,
            handleScheduleManage,
            handleApply,
            formatSender,
            formatAddress,
            handleRowClick,
        }
    },
})
