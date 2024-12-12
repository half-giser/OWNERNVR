/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 09:12:25
 * @Description: PPPoE
 */
import { NetPPPoEForm } from '@/types/apiType/net'
import { type FormRules } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()

        const pageData = ref({
            // 是否显示启用密码复选框
            isPasswordSwitch: true,
            // 是否勾选启用密码
            passwordSwitch: false,
            // 是否启用无线
            wirelessSwitch: false,
        })
        const formRef = useFormRef()
        const formData = ref(new NetPPPoEForm())
        const formRule = ref<FormRules>({
            userName: [
                {
                    validator(_rule, value: string, callback) {
                        if (formData.value.switch && !value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_USERNAME_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            password: [
                {
                    validator(_rule, value: string, callback) {
                        if (formData.value.switch && pageData.value.passwordSwitch && !value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 回显表单数据
         */
        const getData = async () => {
            const result = await queryPPPoECfg()
            commLoadResponseHandler(result, ($) => {
                formData.value.switch = $('content/switch').text().bool()
                formData.value.userName = $('content/userName').text().trim()

                if (!formData.value.userName) {
                    pageData.value.passwordSwitch = true
                    pageData.value.isPasswordSwitch = false
                }
            })
        }

        /**
         * @description 更新表单数据
         */
        const setData = () => {
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }

                openLoading()

                const sendXml = rawXml`
                    <content>
                        <switch>${formData.value.switch}</switch>
                        ${formData.value.switch ? `<userName maxByteLen="63">${wrapCDATA(formData.value.userName)}</userName>` : ''}
                        ${formData.value.switch && formData.value.password ? `<password ${getSecurityVer()}>${wrapCDATA(formData.value.password)}</password>` : ''}
                    </content>
                `
                const result = await editPPPoECfg(sendXml)

                closeLoading()
                commSaveResponseHandler(result)
            })
        }

        /**
         * @description 获取无线网络数据
         */
        const getWirelessNetworkData = async () => {
            const result = await queryWirelessNetworkCfg()
            const $ = queryXml(result)
            pageData.value.wirelessSwitch = $('content/switch').text().bool()
        }

        onMounted(async () => {
            openLoading()

            await getData()
            await getWirelessNetworkData()

            closeLoading()
        })

        return {
            formData,
            formRef,
            formRule,
            pageData,
            setData,
            formatInputUserName,
        }
    },
})
