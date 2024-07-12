/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-11 08:56:40
 * @Description: 802.1x配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-12 16:37:52
 */
import { type FormInstance, type FormRules } from 'element-plus'
import { Net8021xForm } from '@/types/apiType/net'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const userSession = useUserSessionStore()

        const formRef = ref<FormInstance>()
        const formData = ref(new Net8021xForm())
        const formRule = ref<FormRules>({
            userName: [
                {
                    validator(rule, value: string, callback) {
                        if (formData.value.switch && !value.length) {
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
                    validator(rule, value: string, callback) {
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
            openLoading(LoadingTarget.FullScreen)

            const result = await query802xCfg()
            const $ = queryXml(queryXml(result)('content')[0].element)

            closeLoading(LoadingTarget.FullScreen)

            formData.value.switch = $('Switch').text().toBoolean()
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

                openLoading(LoadingTarget.FullScreen)

                const password = AES_encrypt(formData.value.password, userSession.sesionKey)
                const sendXml = rawXml`
                    <content>
                        <Switch>${formData.value.switch.toString()}</Switch>
                        <Protocol>${formData.value.protocal}</Protocol>
                        <Version>${formData.value.version}</Version>
                        <Username>${wrapCDATA(formData.value.userName)}</Username>
                        ${formData.value.switch && pageData.value.passwordSwitch ? `<Password ${getSecurityVer()}>${wrapCDATA(password)}</Password>` : ''}
                    </content>
                `
                const result = await edit802xCfg(sendXml)
                commSaveResponseHadler(result)

                closeLoading(LoadingTarget.FullScreen)
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
