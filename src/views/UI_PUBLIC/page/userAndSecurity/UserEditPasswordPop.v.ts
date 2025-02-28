/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 17:21:34
 * @Description: 更改其他用户密码的弹窗
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import { type FormRules } from 'element-plus'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
    },
    props: {
        /**
         * @property 用户ID
         */
        userId: {
            type: String,
            required: true,
        },
        /**
         * @property 用户名
         */
        userName: {
            type: String,
            required: true,
        },
    },
    emits: {
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const systemCaps = useCababilityStore()

        const noticeMsg = ref('')
        const formRef = useFormRef()
        const formData = ref(new UserEditPasswordForm())
        // 要求的密码强度
        const passwordStrength = ref<keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING>('weak')
        // 当前密码强度
        const strength = computed(() => getPwdSaftyStrength(formData.value.newPassword))
        const isAuthDialog = ref(false)

        const rules = ref<FormRules>({
            newPassword: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }

                        if (strength.value < DEFAULT_PASSWORD_STREMGTH_MAPPING[passwordStrength.value as keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING]) {
                            callback(new Error(Translate('IDCS_PWD_STRONG_ERROR')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            confirmNewPassword: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }

                        if (value !== formData.value.newPassword) {
                            callback(new Error(Translate('IDCS_PWD_MISMATCH_TIPS')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 获取要求的密码强度
         */
        const getPasswordSecurityStrength = async () => {
            let strength: keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING = 'weak'
            const result = await queryPasswordSecurity()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                strength = ($('content/pwdSecureSetting/pwdSecLevel').text() as keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING & null) ?? 'weak'
                if (systemCaps.supportPwdSecurityConfig) {
                    strength = 'strong'
                }
            }
            passwordStrength.value = strength
            return strength
        }

        /**
         * @description 显示左下方的提示信息
         */
        const getNoticeMsg = () => {
            return getTranslateForPasswordStrength(passwordStrength.value)
        }

        /**
         * @description 表单验证
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    isAuthDialog.value = true
                    // doUpdateUserPassword()
                }
            })
        }

        /**
         * @description 确认修改密码
         * @param {UserCheckAuthForm} e
         */
        const doUpdateUserPassword = async (e: UserCheckAuthForm) => {
            openLoading()

            const password = AES_encrypt(MD5_encrypt(formData.value.newPassword), userSession.sesionKey)
            const xml = rawXml`
                <content>
                    <userId>${prop.userId}</userId>
                    <userName>${wrapCDATA(prop.userName)}</userName>
                    <password maxLen='16' ${getSecurityVer()}>${wrapCDATA(password)}</password>
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await editOtherUserPassword(xml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                isAuthDialog.value = false
                ctx.emit('close')
            } else {
                const errorCode = $('errorCode').text().num()
                let errorText = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_PWD_ERR:
                    case ErrorCode.USER_ERROR_NO_USER:
                        errorText = Translate('IDCS_DEVICE_PWD_ERROR')
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorText = Translate('IDCS_NO_AUTH')
                        break
                    default:
                        errorText = Translate('IDCS_SAVE_DATA_FAIL')
                        break
                }
                openMessageBox(errorText)
            }
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        onMounted(async () => {
            await getPasswordSecurityStrength()
            getNoticeMsg()
        })

        return {
            formRef,
            formData,
            noticeMsg,
            strength,
            close,
            rules,
            verify,
            isAuthDialog,
            doUpdateUserPassword,
        }
    },
})
