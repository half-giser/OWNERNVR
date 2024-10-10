/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-23 10:00:43
 * @Description: 通道 - 编辑IPC密码弹窗
 */
import { type ChannelInfoDto } from '@/types/apiType/channel'
import { type TableInstance, type FormInstance } from 'element-plus'
import { type RuleItem } from 'async-validator'

export default defineComponent({
    props: {
        editData: {
            type: Array as PropType<ChannelInfoDto[]>,
            required: true,
        },
        nameMapping: {
            type: Object as PropType<Record<string, string>>,
            default: () => ({}),
        },
    },
    emits: {
        close() {
            return true
        },
    },
    setup(props, { emit }) {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const userSessionStore = useUserSessionStore()
        const { openMessageTipBox } = useMessageBox()
        const tableRef = ref<TableInstance>()
        const tableData = ref([] as Array<ChannelInfoDto>)
        const formRef = ref<FormInstance>()
        const formData = ref({} as Record<string, string>)

        const validate: Record<string, RuleItem['validator']> = {
            validatePassword: (_rule, value, callback) => {
                if (!value) {
                    callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                    return
                }
                callback()
            },
            validateConfirmPassword: (_rule, value, callback) => {
                if (formData.value.password != value) {
                    callback(new Error(Translate('IDCS_PWD_MISMATCH_TIPS')))
                    return
                }
                callback()
            },
        }

        const rules = ref({
            password: [{ validator: validate.validatePassword, trigger: 'manual' }],
            confirmPassword: [{ validator: validate.validateConfirmPassword, trigger: 'manual' }],
        })

        const handleRowClick = (rowData: ChannelInfoDto) => {
            tableRef.value!.clearSelection()
            tableRef.value!.toggleRowSelection(rowData, true)
        }

        const opened = () => {
            if (formRef.value) formRef.value.resetFields()
            formData.value = {}
            tableData.value = props.editData.filter((ele: ChannelInfoDto) => {
                return ele.chlStatus == Translate('IDCS_ONLINE') && ele.protocolType == 'TVT_IPCAMERA' && ele.addType != 'poe'
            })
            tableData.value.sort((a, b) => {
                //按字符串排序 (NT2-1297)
                const property1 = a.name
                const property2 = b.name
                const len = property1.length >= property2.length ? property2.length : property1.length
                let result = 0
                for (let i = 0; i < len; i++) {
                    if (property1[i] !== property2[i]) {
                        result = property1.charCodeAt(i) >= property2.charCodeAt(i) ? 1 : -1
                        break
                    }
                }
                return result
            })
            tableRef.value!.toggleAllSelection()
        }

        const save = () => {
            if (!formRef) return false
            formRef.value?.validate((valid) => {
                if (valid) {
                    const rows = tableRef.value!.getSelectionRows()
                    const total = rows.length
                    let count = 0
                    let successCount = 0
                    let saveFailIpc = ''
                    if (rows.length == 0) return

                    const sendData = (ele: ChannelInfoDto) => {
                        const data = rawXml`<content>
                            <chl id='${ele.id}'>
                                <password${getSecurityVer()}><![CDATA[${AES_encrypt(formData.value.password, userSessionStore.sesionKey)}]]></password>
                            </chl>
                        </content>`
                        editIPChlPassword(getXmlWrapData(data)).then((res) => {
                            count++
                            if (queryXml(res)('status').text() == 'success') {
                                successCount++
                            } else {
                                saveFailIpc += `${props.nameMapping[ele.id]},`
                            }
                            if (count == total) {
                                closeLoading()
                                emit('close')
                                if (successCount == total) {
                                    openMessageTipBox({
                                        type: 'success',
                                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                                    })
                                } else {
                                    openMessageTipBox({
                                        type: 'info',
                                        message: saveFailIpc + Translate('IDCS_SAVE_DATA_FAIL'),
                                    })
                                }
                            }
                        })
                    }

                    openLoading()
                    rows.forEach((ele: ChannelInfoDto) => {
                        sendData(ele)
                    })
                }
            })
        }

        return {
            opened,
            tableRef,
            tableData,
            handleRowClick,
            formRef,
            formData,
            rules,
            save,
        }
    },
})
