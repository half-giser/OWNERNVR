/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-23 10:00:43
 * @Description: 通道 - 编辑IPC密码弹窗
 */
import { type ChannelInfoDto } from '@/types/apiType/channel'
import { type TableInstance, type FormInstance, type FormRules } from 'element-plus'

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

        const rules = ref<FormRules>({
            password: [
                {
                    validator: (_rule, value, callback) => {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            confirmPassword: [
                {
                    validator: (_rule, value, callback) => {
                        if (formData.value.password != value) {
                            callback(new Error(Translate('IDCS_PWD_MISMATCH_TIPS')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const handleRowClick = (rowData: ChannelInfoDto) => {
            tableRef.value!.clearSelection()
            tableRef.value!.toggleRowSelection(rowData, true)
        }

        const opened = () => {
            if (formRef.value) formRef.value.resetFields()
            formData.value = {}
            tableData.value = props.editData.filter((ele: ChannelInfoDto) => {
                return ele.isOnline && ele.protocolType == 'TVT_IPCAMERA' && ele.addType != 'poe'
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

        const sendData = async (ele: ChannelInfoDto) => {
            const sendXml = rawXml`
                <content>
                    <chl id='${ele.id}'>
                        <password${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSessionStore.sesionKey))}</password>
                    </chl>
                </content>
            `
            const res = await editIPChlPassword(sendXml)
            if (queryXml(res)('status').text() == 'success') {
                return true
            } else {
                return false
            }
        }

        const save = () => {
            formRef.value?.validate(async (valid) => {
                if (valid) {
                    const rows = tableRef.value!.getSelectionRows()
                    if (!rows.length) return

                    openLoading()

                    const saveFailIpc: string[] = []
                    for (let i = 0; i < rows.length; i++) {
                        const result = await sendData(rows[i])
                        if (!result) {
                            saveFailIpc.push(props.nameMapping[rows[i].id])
                        }
                    }

                    closeLoading()

                    emit('close')
                    if (saveFailIpc.length) {
                        openMessageTipBox({
                            type: 'info',
                            message: saveFailIpc.join(', ') + ' ' + Translate('IDCS_SAVE_DATA_FAIL'),
                        })
                    } else {
                        openMessageTipBox({
                            type: 'success',
                            message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                        })
                    }
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
