/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-11 08:56:40
 * @Description: 802.1x配置
 */
import { type FormRules } from 'element-plus'
import { Net8021xForm } from '@/types/apiType/net'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()

        const formRef = useFormRef()
        const formData = ref(new Net8021xForm())
        const formRule = ref<FormRules>({
            userName: [
                {
                    validator(_rule, value: string, callback) {
                        if (formData.value.switch && !value.trim()) {
                            callback(new Error(Translate('IDCS_USERNAME_TIP')))
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
                            callback(new Error(Translate('IDCS_PASSWORD_TIP')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const pageData = ref({
            // 是否启用编辑密码
            passwordSwitch: false,
        })

        /**
         * @description 获取表单数据
         */
        const getData = async () => {
            openLoading()

            const result = await query802xCfg()
            const $ = queryXml(queryXml(result)('content')[0].element)

            closeLoading()

            formData.value.switch = $('Switch').text().bool()
            formData.value.protocal = $('Protocol').text()
            formData.value.version = $('Version').text()
            formData.value.userName = $('Username').text()
        }

        /**
         * @description 提交表单
         */
        const setData = () => {
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }

                openLoading()

                const password = AES_encrypt(formData.value.password, userSession.sesionKey)
                const sendXml = rawXml`
                    <content>
                        <Switch>${formData.value.switch}</Switch>
                        <Protocol>${formData.value.protocal}</Protocol>
                        <Version>${formData.value.version}</Version>
                        <Username>${wrapCDATA(formData.value.userName)}</Username>
                        ${formData.value.switch && pageData.value.passwordSwitch ? `<Password ${getSecurityVer()}>${wrapCDATA(password)}</Password>` : ''}
                    </content>
                `
                const result = await edit802xCfg(sendXml)
                commSaveResponseHandler(result)

                closeLoading()
            })
        }

        onMounted(() => {
            getData()
        })

        return {
            formRef,
            formData,
            formRule,
            pageData,
            setData,
        }
    },
})
