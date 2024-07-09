/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-23 10:00:43
 * @Description:
 */
import { type ChannelInfoDto } from '@/types/apiType/channel'
import { type FormInstance } from 'element-plus'
import { getSecurityVer } from '../../../../utils/tools'
import { AES_encrypt } from '../../../../utils/encrypt'
import { useUserSessionStore } from '@/stores/userSession'
import { getXmlWrapData } from '../../../../api/api'
import { editIPChlPassword } from '../../../../api/channel'
import { queryXml } from '../../../../utils/xmlParse'
import useMessageBox from '@/hooks/useMessageBox'
import useLoading from '@/hooks/useLoading'
import { useLangStore } from '@/stores/lang'

export default defineComponent({
    props: {
        editData: Array<ChannelInfoDto>,
        nameMapping: Object,
        close: {
            type: Function,
            require: true,
            default: () => {},
        },
    },
    setup(props: any) {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const userSessionStore = useUserSessionStore()
        const { openMessageTipBox } = useMessageBox()
        const tableRef = ref()
        const tableData = ref([] as Array<ChannelInfoDto>)
        const formRef = ref<FormInstance>()
        const formData = ref({} as Record<string, string>)

        const validate = {
            validatePassword: (_rule: any, value: any, callback: any) => {
                if (!value) {
                    callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                    return
                }
                callback()
            },
            validateConfirmPassword: (_rule: any, value: any, callback: any) => {
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
            tableRef.value.clearSelection()
            tableRef.value.toggleRowSelection(rowData, true)
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
            tableRef.value.toggleAllSelection()
        }

        const save = () => {
            if (!formRef) return false
            formRef.value?.validate((valid) => {
                if (valid) {
                    const rows = tableRef.value.getSelectionRows()
                    const total = rows.length
                    let count = 0
                    let successCount = 0
                    let saveFailIpc = ''
                    if (rows.length == 0) return

                    const sendData = (ele: ChannelInfoDto) => {
                        const data = `<content>
                            <chl id='${ele.id}'>
                                <password${getSecurityVer()}><![CDATA[${AES_encrypt(formData.value.password, userSessionStore.sesionKey)}]]></password>
                            </chl>
                        </content>`
                        editIPChlPassword(getXmlWrapData(data)).then((res: any) => {
                            count++
                            if (queryXml(res)('status').text() == 'success') {
                                successCount++
                            } else {
                                saveFailIpc += `${props.nameMapping[ele.id]},`
                            }
                            if (count == total) {
                                closeLoading(LoadingTarget.FullScreen)
                                props.close()
                                if (successCount == total) {
                                    openMessageTipBox({
                                        type: 'success',
                                        title: Translate('IDCS_SUCCESS_TIP'),
                                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                                        showCancelButton: false,
                                    })
                                } else {
                                    openMessageTipBox({
                                        type: 'info',
                                        title: Translate('IDCS_INFO_TIP'),
                                        message: saveFailIpc + Translate('IDCS_SAVE_DATA_FAIL'),
                                        showCancelButton: false,
                                    })
                                }
                            }
                        })
                    }

                    openLoading(LoadingTarget.FullScreen)
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
