/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-22 17:18:32
 * @Description: 添加通道 - 激活IPC弹窗
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        activateIpcData: {
            type: Array as PropType<ChannelQuickAddDto[]>,
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
        const formData = ref({
            password: '',
            confirmPassword: '',
        })
        const useDefaultPwdSwitch = ref(false)

        const rules = ref<FormRules>({
            password: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!useDefaultPwdSwitch.value) {
                            if (!value) {
                                callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                                return
                            }
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            confirmPassword: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!useDefaultPwdSwitch.value) {
                            if (!value) {
                                callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                                return
                            }

                            if (formData.value.password !== value) {
                                callback(new Error(Translate('IDCS_PWD_MISMATCH_TIPS')))
                                return
                            }
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const close = () => {
            formRef.value!.resetFields()
            useDefaultPwdSwitch.value = false
        }

        const save = () => {
            formRef.value!.validate(async (valid) => {
                if (valid) {
                    const sendXml = rawXml`
                        <content>
                            ${props.activateIpcData
                                .map((item) => {
                                    return rawXml`
                                        <item>
                                            ${
                                                useDefaultPwdSwitch.value
                                                    ? rawXml`
                                                            <userPassword>
                                                                <password type='string' encryptType='md5' maxLen='63'${getSecurityVer()}>${wrapCDATA(useDefaultPwdSwitch.value ? '' : AES_encrypt(formData.value.password, userSessionStore.sesionKey))}</password>
                                                            </userPassword>
                                                        `
                                                    : ''
                                            }
                                            <name>${wrapCDATA(item.devName)}</name>
                                            <ip>${item.ip}</ip>
                                            <port>${item.httpPort}</port>
                                            <type>${item.httpType}</type>
                                            <protocolType>${item.protocolType}</protocolType>
                                            <productModel ${item.productModel.factoryName ? ` factoryName="${item.productModel.identity || item.productModel.factoryName}"` : ''}>${item.productModel.innerText}</productModel>
                                            <manufacturer>${item.manufacturer}</manufacturer>
                                            <localEthName>${item.localEthName}</localEthName>
                                            <subIp>${item.subIp}</subIp>
                                            <subIpNetMask>${item.subIpNetMask}</subIpNetMask>
                                        </item>
                                    `
                                })
                                .join('')}
                        </content>
                    `
                    openLoading()
                    await activateIPC(sendXml)
                    closeLoading()
                    // 激活后成功或失败不做提示处理
                    emit('close')
                }
            })
        }

        return {
            formRef,
            formData,
            useDefaultPwdSwitch,
            rules,
            close,
            save,
        }
    },
})
