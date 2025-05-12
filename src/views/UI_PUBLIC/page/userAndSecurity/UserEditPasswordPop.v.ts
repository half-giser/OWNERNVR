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

        const pageData = ref({
            isEditSelf: false,
            passwordErrorMessage: '',
            isCheckAuthPop: false,
        })

        const formRef = useFormRef()
        const formData = ref(new UserEditPasswordForm())
        // 要求的密码强度
        const passwordStrength = ref<keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING>('weak')
        // 当前密码强度
        const strength = computed(() => getPwdSaftyStrength(formData.value.newPassword))

        const rules = ref<FormRules>({
            currentPassword: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (pageData.value.isEditSelf) {
                            if (!value.length) {
                                callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                                return
                            }

                            if (pageData.value.passwordErrorMessage) {
                                callback(new Error(pageData.value.passwordErrorMessage))
                                pageData.value.passwordErrorMessage = ''
                                return
                            }
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
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
                if (!systemCaps.supportPwdSecurityConfig) {
                    strength = 'strong'
                }
            }
            passwordStrength.value = strength
            return strength
        }

        /**
         * @description 显示左下方的提示信息
         */
        const noticeMsg = computed(() => {
            return getTranslateForPasswordStrength(passwordStrength.value)
        })

        /**
         * @description 表单验证
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    if (pageData.value.isEditSelf) {
                        updateCurrentUserPassword()
                    } else {
                        pageData.value.isCheckAuthPop = true
                    }
                }
            })
        }

        const updateCurrentUserPassword = async () => {
            const oldPassword = AES_encrypt(base64Encode(MD5_encrypt(formData.value.currentPassword)), userSession.sesionKey)
            const password = AES_encrypt(base64Encode(MD5_encrypt(formData.value.newPassword)), userSession.sesionKey)
            const xml = rawXml`
                <content>
                    <oldPassword ${getSecurityVer()}>${wrapCDATA(oldPassword)}</oldPassword>
                    <password ${getSecurityVer()}>${wrapCDATA(password)}</password>
                </content>
            `
            const result = await editUserPassword(xml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                userSession.defaultPwd = false
                userSession.isChangedPwd = true
                userSession.pwdExpired = false
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).then(() => {
                    ctx.emit('close')
                    Logout()
                })
            } else {
                const errorCode = $('errorCode').text().num()
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_PWD_ERR:
                        pageData.value.passwordErrorMessage = Translate('IDCS_PASSWORD_NOT_CORRENT')
                        formRef.value!.validate()
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_NO_PERMISSION'))
                        break
                    case ErrorCode.USER_ERROR_NO_USER:
                        openMessageBox(Translate('IDCS_DEVICE_USER_NOTEXIST')).then(() => {
                            Logout()
                        })
                        break
                    default:
                        openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                        break
                }
            }
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
                pageData.value.isCheckAuthPop = false
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

        const open = () => {
            pageData.value.isEditSelf = userSession.userName === prop.userName
            getPasswordSecurityStrength()
        }

        return {
            formRef,
            formData,
            noticeMsg,
            strength,
            pageData,
            open,
            close,
            rules,
            verify,
            doUpdateUserPassword,
        }
    },
})
