/*
 * @Date: 2024-07-09 18:39:25
 * @Description: 修改密码弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 是否强制修改密码，若是，则修改密码才能关闭弹窗
         */
        forced: {
            type: Boolean,
            default: false,
        },
    },
    emits: {
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const formRef = useFormRef()
        const formData = ref(new UserChangePasswordForm())
        const errorMessage = ref('')
        const passwordErrorMessage = ref('')
        const strength = computed(() => getPwdSaftyStrength(formData.value.newPassword))
        const userSession = useUserSessionStore()
        const systemCaps = useCababilityStore()

        const rules = ref<FormRules>({
            currentPassword: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }

                        if (passwordErrorMessage.value) {
                            callback(new Error(passwordErrorMessage.value))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            newPassword: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }

                        if (strength.value < DEFAULT_PASSWORD_STREMGTH_MAPPING[passwordStrength.value]) {
                            callback(new Error(Translate('IDCS_PWD_STRONG_ERROR')))
                            return
                        }

                        if (value === formData.value.currentPassword) {
                            callback(new Error(Translate('IDCS_PWD_SAME_ERROR')))
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

        // 要求的密码强度
        const passwordStrength = ref<keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING>('weak')

        /**
         * @description 获取密码强度提示文本
         */
        const noticeMsg = computed(() => {
            return getTranslateForPasswordStrength(passwordStrength.value)
        })

        /**
         * @description 验证表单
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    doUpdateUserPassword()
                }
            })
        }

        const changePassword = () => {
            if (passwordErrorMessage.value) {
                passwordErrorMessage.value = ''
            }
        }

        /**
         * @description 更新密码
         */
        const doUpdateUserPassword = async () => {
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
                        passwordErrorMessage.value = Translate('IDCS_PASSWORD_NOT_CORRENT')
                        formRef.value!.validate()
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorMessage.value = Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_NO_PERMISSION')
                        break
                    case ErrorCode.USER_ERROR_NO_USER:
                        openMessageBox(Translate('IDCS_DEVICE_USER_NOTEXIST')).then(() => {
                            Logout()
                        })
                        break
                    default:
                        errorMessage.value = Translate('IDCS_SAVE_DATA_FAIL')
                        break
                }
            }
        }

        const handleForceOpen = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_PWD_STRONG_ERROR_TIPS'),
            }).then(() => {
                Logout()
            })
        }

        /**
         * @description 弹窗关闭前检测是否能关闭弹窗
         * @param {Function} done
         */
        const handleBeforeClose = (done: (cancel?: boolean) => void) => {
            if (prop.forced) {
                handleForceOpen()
            }
            done(prop.forced)
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            if (prop.forced) {
                handleForceOpen()
            } else {
                ctx.emit('close')
            }
        }

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

        const open = () => {
            getPasswordSecurityStrength()
        }

        return {
            formRef,
            formData,
            noticeMsg,
            strength,
            close,
            rules,
            verify,
            errorMessage,
            changePassword,
            handleBeforeClose,
            open,
        }
    },
})
