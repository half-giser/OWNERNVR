/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 添加通道 - 编辑IPC IP弹窗
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        editItem: {
            type: Object as PropType<ChannelQuickAddDto>,
            required: true,
        },
        mapping: {
            type: Object as PropType<Record<string, ChannelDefaultPwdDto>>,
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
        const userSessionStore = useUserSessionStore()
        const formRef = useFormRef()
        const formData = ref(new ChannelAddEditIPCIpDto())

        const maskDisabled = computed(() => {
            return formData.value.mask === DEFAULT_EMPTY_IP
        })

        const gatewayDisabled = computed(() => {
            return formData.value.gateway === DEFAULT_EMPTY_IP
        })

        const rules = ref<FormRules>({
            ip: [
                {
                    validator: (_, value: string, callback) => {
                        if (!value || value === DEFAULT_EMPTY_IP) {
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
                    validator: (_, value: string, callback) => {
                        if (!maskDisabled.value && (!value || value === DEFAULT_EMPTY_IP)) {
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
                    validator: (_, value: string, callback) => {
                        if (!gatewayDisabled.value && (!value || value === DEFAULT_EMPTY_IP)) {
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
                    validator: (_, value: string, callback) => {
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
            formRef.value!.validate((valid) => {
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
                                <password${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSessionStore.sesionKey))}</password>
                            </item>
                        </device>
                    </content>`
                openLoading()
                editDevNetworkList(data).then((res) => {
                    closeLoading()
                    const $ = queryXml(res)
                    if ($('status').text() === 'success') {
                        const errorCode = $('content/item/errorCode').text().num()
                        if (errorCode === 0) {
                            emit('close')
                        } else {
                            switch (errorCode) {
                                case ErrorCode.USER_ERROR_CHANNEL_IPADDRESS_AND_PORT_EXIST:
                                    openMessageBox(Translate('IDCS_PROMPT_CHANNEL_IPADDRESS_AND_PORT_EXIST'))
                                    break
                                case ErrorCode.USER_ERROR_MASK_NOT_CONTINE:
                                case ErrorCode.USER_ERROR_INVALID_SUBMASK:
                                    // 子网掩码无效
                                    openMessageBox(Translate('IDCS_ERROR_MASK_NOT_CONTINE'))
                                    break
                                case ErrorCode.USER_ERROR_DIFFERENT_SEGMENT:
                                    // 网关不在由IP地址和子网掩码定义的同一网段上
                                    openMessageBox(Translate('IDCS_ERROR_DIFFERENT_SEGMENT'))
                                    break
                                default:
                                    // 其他错误码不提示直接刷新通道列表，与设备一致
                                    emit('close')
                            }
                        }
                    } else {
                        openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                    }
                })
            })
        }

        const opened = () => {
            formData.value.mac = props.editItem.mac
            formData.value.ip = props.editItem.ip
            formData.value.mask = props.editItem.mask
            formData.value.gateway = props.editItem.gateway
            formData.value.userName = props.mapping[props.editItem.manufacturer].userName
        }

        const close = () => {
            formRef.value!.resetFields()
        }

        return {
            formRef,
            formData,
            rules,
            maskDisabled,
            gatewayDisabled,
            opened,
            close,
            save,
        }
    },
})
