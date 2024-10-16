/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-22 17:18:32
 * @Description: 添加通道 - 激活IPC弹窗
 */
import { type FormInstance } from 'element-plus'
import { type RuleItem } from 'async-validator'
import { type ChannelQuickAddDto } from '@/types/apiType/channel'

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
        const { openLoading, closeLoading } = useLoading()
        const userSessionStore = useUserSessionStore()
        const formRef = ref<FormInstance>()
        const formData = ref({} as Record<string, string>)
        const useDefaultPwdSwitch = ref(false)

        const validate: Record<string, RuleItem['validator']> = {
            validatePassword: (_rule, value, callback) => {
                if (!useDefaultPwdSwitch.value) {
                    if (!value) {
                        callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                        return
                    }
                }
                callback()
            },
            validateConfirmPassword: (_rule, value, callback) => {
                if (!useDefaultPwdSwitch.value) {
                    if (!value) {
                        callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                        return
                    }
                    if (formData.value.password != value) {
                        callback(new Error(Translate('IDCS_PWD_MISMATCH_TIPS')))
                        return
                    }
                }
                callback()
            },
        }

        const rules = ref({
            password: [{ validator: validate.validatePassword, trigger: 'manual' }],
            confirmPassword: [{ validator: validate.validateConfirmPassword, trigger: 'manual' }],
        })

        const opened = () => {
            if (formRef.value) formRef.value.resetFields()
            formData.value = {}
            useDefaultPwdSwitch.value = false
        }

        const save = () => {
            if (!formRef) return false
            formRef.value?.validate((valid) => {
                if (valid) {
                    const data = rawXml`
                        <content>
                            ${props.activateIpcData
                                .map((ele) => {
                                    return rawXml`
                                        <item>
                                            <userPassword>
                                                <password type='string' encryptType='md5' maxLen='63'${getSecurityVer()}><![CDATA[${useDefaultPwdSwitch.value ? '' : AES_encrypt(formData.value.password, userSessionStore.sesionKey)}]]></password>
                                            </userPassword>
                                            <name>${ele.devName}</name>
                                            <ip>${ele.ip}</ip>
                                            <port>${ele.httpPort}</port>
                                            <protocolType>${ele.protocolType}</protocolType>
                                            <manufacturer>${ele.manufacturer}</manufacturer>
                                        </item>
                                    `
                                })
                                .join('')}
                        </content>
                    `
                    openLoading()
                    activateIPC(data).then(() => {
                        closeLoading()
                        // 激活后成功或失败不做提示处理
                        emit('close')
                    })
                }
            })
        }

        return {
            formRef,
            formData,
            useDefaultPwdSwitch,
            rules,
            opened,
            save,
        }
    },
})
