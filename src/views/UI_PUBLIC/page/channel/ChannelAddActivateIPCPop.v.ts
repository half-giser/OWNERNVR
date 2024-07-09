/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-22 17:18:32
 * @Description:
 */
import { type FormInstance } from 'element-plus'
import { type ChannelQuickAddDto } from '../../../../types/apiType/channel'
import { getSecurityVer } from '../../../../utils/tools'
import { AES_encrypt } from '../../../../utils/encrypt'
import { useUserSessionStore } from '@/stores/userSession'
import { activateIPC } from '../../../../api/channel'
import { getXmlWrapData } from '../../../../api/api'
import useLoading from '@/hooks/useLoading'
import { useLangStore } from '@/stores/lang'

export default defineComponent({
    props: {
        activateIpcData: Array<ChannelQuickAddDto>,
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
        const formRef = ref<FormInstance>()
        const formData = ref({} as Record<string, string>)
        const useDefaultPwdSwitch = ref(false)

        const validate = {
            validatePassword: (_rule: any, value: any, callback: any) => {
                if (!useDefaultPwdSwitch.value) {
                    if (!value) {
                        callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                        return
                    }
                }
                callback()
            },
            validateConfirmPassword: (_rule: any, value: any, callback: any) => {
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
                    let data = '<content>'
                    props.activateIpcData.forEach((ele: ChannelQuickAddDto) => {
                        data += `<item>
                                    <userPassword>
                                        <password type='string' encryptType='md5' maxLen='63'${getSecurityVer()}><![CDATA[${useDefaultPwdSwitch.value ? '' : AES_encrypt(formData.value.password, userSessionStore.sesionKey)}]]></password>
                                    </userPassword>
                                    <name>${ele.devName}</name>
                                    <ip>${ele.ip}</ip>
                                    <port>${ele.httpPort}</port>
                                    <protocolType>${ele.protocolType}</protocolType>
                                    <manufacturer>${ele.manufacturer}</manufacturer>
                                </item>`
                    })
                    data += '</content>'
                    openLoading(LoadingTarget.FullScreen)
                    activateIPC(getXmlWrapData(data)).then(() => {
                        closeLoading(LoadingTarget.FullScreen)
                        // 激活后成功或失败不做提示处理
                        props.close()
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
