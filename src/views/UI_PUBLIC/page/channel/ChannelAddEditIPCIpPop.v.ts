/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 添加通道 - 编辑IPC IP弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-22 11:17:11
 */
import { type FormRules, type FormInstance } from 'element-plus'
import { ChannelAddEditIPCIpDto, type ChannelQuickAddDto, type DefaultPwdDto } from '@/types/apiType/channel'

export default defineComponent({
    props: {
        editItem: {
            type: Object as PropType<ChannelQuickAddDto>,
            required: true,
        },
        mapping: {
            type: Object as PropType<Record<string, DefaultPwdDto>>,
            required: true,
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
        const formRef = ref<FormInstance>()
        const formData = ref(new ChannelAddEditIPCIpDto())
        const maskDisabled = ref(false)
        const gatewayDisabled = ref(false)

        const rules = ref<FormRules>({
            ip: [
                {
                    validator(rule, value, callback) {
                        if (!value || value === '0.0.0.0') {
                            callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_INVALID')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            mask: [
                {
                    validator(rule, value, callback) {
                        if (!maskDisabled.value && (!value || value === '0.0.0.0')) {
                            callback(new Error(Translate('IDCS_PROMPT_SUBNET_MASK_INVALID')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            gateway: [
                {
                    validator(rule, value, callback) {
                        if (!gatewayDisabled.value && (!value || value === '0.0.0.0')) {
                            callback(new Error(Translate('IDCS_PROMPT_GATEWAY_INVALID')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            password: [
                {
                    validator(rule, value, callback) {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const save = () => {
            formRef.value?.validate((valid) => {
                if (!valid) {
                    return
                }
                const data = rawXml`
                    <content>
                        <device>
                            <item id='1'>
                                <oldIP>${props.editItem.ip}</oldIP>
                                <newIP>${formData.value.ip}</newIP>
                                <netmask>${formData.value.mask}</netmask>
                                <gateway>${formData.value.gateway}</gateway>
                                <username>${formData.value.userName}</username>
                                <password${getSecurityVer()}><![CDATA[${AES_encrypt(formData.value.password, userSessionStore.sesionKey)}]]></password>
                            </item>
                        </device>
                    </content>`
                openLoading()
                editDevNetworkList(data).then((res) => {
                    closeLoading()
                    const $ = queryXml(res)
                    if ($('status').text() == 'success') {
                        const errorCode = Number($('//content/item/errorCode').text())
                        if (errorCode === 0) {
                            emit('close')
                        } else {
                            if (errorCode === ErrorCode.USER_ERROR_CHANNEL_IPADDRESS_AND_PORT_EXIST) {
                                showMsg(Translate('IDCS_PROMPT_CHANNEL_IPADDRESS_AND_PORT_EXIST'))
                            } else if (errorCode == ErrorCode.USER_ERROR_MASK_NOT_CONTINE || errorCode == ErrorCode.USER_ERROR_INVALID_SUBMASK) {
                                // 子网掩码无效
                                showMsg(Translate('IDCS_ERROR_MASK_NOT_CONTINE'))
                            } else if (errorCode == ErrorCode.USER_ERROR_DIFFERENT_SEGMENT) {
                                // 网关不在由IP地址和子网掩码定义的同一网段上
                                showMsg(Translate('IDCS_ERROR_DIFFERENT_SEGMENT'))
                            } else {
                                // 其他错误码不提示直接刷新通道列表，与设备一致
                                emit('close')
                            }
                        }
                    } else {
                        showMsg(Translate('IDCS_SAVE_DATA_FAIL'))
                    }
                })
            })
        }

        const showMsg = (msg: string) => {
            openMessageTipBox({
                type: 'info',
                message: msg,
            })
        }

        const opened = () => {
            formRef.value?.clearValidate()
            formRef.value?.resetFields()
            const newData = new ChannelAddEditIPCIpDto()
            newData.mac = props.editItem.mac
            newData.ip = props.editItem.ip
            newData.mask = props.editItem.mask
            newData.gateway = props.editItem.gateway
            newData.userName = props.mapping[props.editItem.manufacturer].userName
            formData.value = newData
            maskDisabled.value = formData.value.mask == '0.0.0.0'
            gatewayDisabled.value = formData.value.gateway == '0.0.0.0'
        }

        return {
            formRef,
            formData,
            rules,
            maskDisabled,
            gatewayDisabled,
            opened,
            save,
        }
    },
})
