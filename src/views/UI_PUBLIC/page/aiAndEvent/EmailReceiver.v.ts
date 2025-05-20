/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-12 14:21:22
 * @Description: email通知
 */
import { type FormRules, type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const router = useRouter()
        const userSession = useUserSessionStore()
        const { Translate } = useLangStore()
        const tableData = ref<AlarmEmailReceiverDto[]>([])
        const tableRef = ref<TableInstance>()
        const maxEmailCount = ref(16)
        const rules = reactive<FormRules>({
            recipient: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_EMAIL_ADDRESS_EMPTY')))
                            return
                        }

                        if (!checkEmail(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_INVALID_EMAIL')))
                            return
                        }

                        if (tableData.value.some((item) => item.address.toLowerCase() === value.toLowerCase())) {
                            callback(new Error(Translate('IDCS_PROMPT_EMAIL_EXIST')))
                            return
                        }

                        if (tableData.value.length >= maxEmailCount.value) {
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
        const formRef = useFormRef()
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
            scheduleList: [] as SelectOption<string, string>[],
            //排程管理弹窗显示状态
            isSchedulePop: false,
            currentRow: new AlarmEmailReceiverDto(),
        })

        const getIconStatus = () => {
            if (pageData.value.senderShow) {
                return 0
            }
            return 2
        }

        /**
         * @description 开关发件人隐藏/显示
         */
        const toggleMask = () => {
            pageData.value.senderShow = !pageData.value.senderShow
        }

        /**
         * @description 发件人显示/脱敏显示
         * @param {string} sender
         * @returns {string}
         */
        const formatSender = (sender: string) => {
            if (pageData.value.senderShow) {
                return sender
            }
            return hideEmailAddress(sender)
        }

        /**
         * @description 邮箱显示/脱敏显示
         * @param {AlarmEmailReceiverDto} rowData
         * @returns {string}
         */
        const formatAddress = (rowData: AlarmEmailReceiverDto) => {
            if (rowData === pageData.value.currentRow) {
                return rowData.address
            }
            return hideEmailAddress(rowData.address)
        }

        /**
         * @description 获取排程列表
         */
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
            pageData.value.schedule = pageData.value.scheduleList[0].value
        }

        /**
         * @description 获取收件人数据
         */
        const getData = async () => {
            openLoading()
            queryEmailCfg().then((result) => {
                closeLoading()
                const scheduleIds = pageData.value.scheduleList.map((item) => item.value)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    pageData.value.sender = $('content/sender/address').text()
                    tableData.value = $('content/receiver/item').map((item) => {
                        const $item = queryXml(item.element)
                        const scheduleId = $item('schedule').attr('id')
                        return {
                            address: $item('address').text(),
                            schedule: !scheduleId || !scheduleIds.includes(scheduleId) ? DEFAULT_EMPTY_ID : scheduleId,
                        }
                    })
                }
            })
        }

        /**
         * @description 选中行
         * @param {AlarmEmailReceiverDto} row
         */
        const handleRowClick = (row: AlarmEmailReceiverDto) => {
            pageData.value.currentRow = row
        }

        /**
         * @description 批量更改排程
         * @param {string} value
         */
        const changeAllSchedule = (value: string) => {
            tableData.value.forEach((item) => {
                item.schedule = value
            })
        }

        /**
         * @description 删除收件人
         * @param {AlarmEmailReceiverDto} row
         */
        const delReceiver = (row: AlarmEmailReceiverDto) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_EMAIL_RECEIVER_S').formatForLang(row.address),
            }).then(() => {
                const index = tableData.value.indexOf(row)
                tableData.value.splice(index, 1)
            })
        }

        /**
         * @description 批量删除收件人
         */
        const delAllReceiver = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_ALL_ITEMS'),
            }).then(() => {
                tableData.value = []
            })
        }

        /**
         * @description 新增收件人
         * @returns
         */
        const addRecipient = () => {
            // 规则验证
            if (!formRef.value) return
            formRef.value.validate((valid) => {
                if (valid) {
                    const emailReceiver = new AlarmEmailReceiverDto()
                    emailReceiver.address = pageData.value.form.recipient
                    emailReceiver.schedule = pageData.value.schedule
                    tableData.value.push(emailReceiver)
                    pageData.value.form.recipient = ''
                }
            })
        }

        /**
         * @description 前往编辑发件人
         */
        const editSender = () => {
            if (!userSession.hasAuth('net')) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_NO_AUTH'),
                })
                return
            }

            router.push('/config/net/email')
        }

        /**
         * @description 保存数据
         */
        const setData = () => {
            const sendXml = rawXml`
                <content>   
                    <receiver type="list">
                        ${tableData.value
                            .map((item) => {
                                return rawXml`
                                    <item>
                                        <address>${wrapCDATA(item.address)}</address>
                                        <schedule id="${item.schedule}"></schedule>
                                    </item>
                                `
                            })
                            .join('')}
                    </receiver>
                </content>
            `
            openLoading()
            editEmailCfg(sendXml).then((res) => {
                closeLoading()
                commSaveResponseHandler(res)
            })
        }

        /**
         * @description 打开排程弹窗
         */
        const openSchedulePop = () => {
            pageData.value.isSchedulePop = true
        }

        /**
         * @description 关闭排程弹窗，更新数据
         */
        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            const scheduleIds = pageData.value.scheduleList.map((item) => item.value)
            tableData.value.forEach((item) => {
                if (!scheduleIds.includes(item.schedule)) {
                    item.schedule = DEFAULT_EMPTY_ID
                }
            })
        }

        onMounted(async () => {
            await getScheduleList()
            getData()
        })

        return {
            pageData,
            tableData,
            tableRef,
            formRef,
            rules,
            delReceiver,
            delAllReceiver,
            addRecipient,
            getIconStatus,
            toggleMask,
            editSender,
            changeAllSchedule,
            setData,
            formatSender,
            formatAddress,
            handleRowClick,
            openSchedulePop,
            closeSchedulePop,
        }
    },
})
