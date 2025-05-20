/*
 * @Date: 2025-05-04 16:03:00
 * @Description: 找回密码
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import LoginPrivacyPop from './LoginPrivacyPop.vue'

export default defineComponent({
    components: {
        LoginPrivacyPop,
    },
    setup() {
        const router = useRouter()
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()

        const pageData = ref({
            secureEMailState: 0,
            email: '',
            pageType: '',
            isPrivacyPop: false,
            captchaDisabled: false,
            captchaTime: '',
            pubkey: '',
        })

        const isDebuger = userSession.userType === 'debug'

        let countDowner: ReturnType<typeof useCountDowner>

        const formData = ref(new UserForgetPwdForm())

        // 要求的密码强度
        const passwordStrength = ref<keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING>('weak')
        // 当前密码强度
        const strength = computed(() => getPwdSaftyStrength(formData.value.password))

        // 密码强度提示信息
        const noticeMsg = computed(() => {
            return getTranslateForPasswordStrength(passwordStrength.value)
        })

        const getRecoverPasswordInfo = async () => {
            const result = await queryRecoverPasswordInfo()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.pubkey = $('content/key').text()
                pageData.value.secureEMailState = $('content/SecureEMail/secureEMailState').text().num()
                pageData.value.email = $('content/secureEMail/email').text()
                showSecureEmailPage()
            }
        }

        const getPasswordSecurity = async () => {
            const result = await queryPasswordSecurity()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                passwordStrength.value = ($('content/pwdSecureSetting/pwdSecLevel').text() as keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING & null) ?? 'weak'
            }
        }

        const cancel = () => {
            router.push({
                path: '/login',
            })
        }

        const showSecureEmailPage = () => {
            switch (pageData.value.secureEMailState) {
                case 0:
                case 1:
                    pageData.value.pageType = 'privacy'
                    break
                case 2:
                default:
                    pageData.value.pageType = 'no-setting'
                    break
            }
        }

        const handlePrivacyNext = () => {
            switch (pageData.value.secureEMailState) {
                case 0:
                    pageData.value.pageType = 'email'
                    break
                case 1:
                default:
                    pageData.value.pageType = 'cloud-offline'
                    break
            }
        }

        const handleEmailNext = () => {
            pageData.value.pageType = 'new-password'
        }

        const formatCode = (str: string) => {
            return str.replace(/[^a-zA-Z0-9]/g, '')
        }

        const getVerificationCode = async () => {
            if (!formData.value.email.trim()) {
                openMessageBox(Translate('IDCS_PROMPT_EMAIL_ADDRESS_EMPTY'))
                return
            }

            if (!checkEmail(formData.value.email)) {
                openMessageBox(Translate('IDCS_PROMPT_INVALID_EMAIL'))
                return
            }

            pageData.value.captchaDisabled = true
            openLoading()

            const sendXml = rawXml`
                <content>
                    <email>${wrapCDATA(formData.value.email)}</email>
                </content>
            `
            const result = await sendCaptchaEmail(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                // todo
                countDowner = useCountDowner({
                    callback(obj) {
                        pageData.value.captchaTime = obj.disminites + ':' + obj.disseconds
                    },
                    overFn() {
                        pageData.value.captchaTime = ''
                        pageData.value.captchaDisabled = false
                    },
                })
            } else {
                const errorCode = $('errorCode').text().num()
                let errorMsg = ''
                switch (errorCode) {
                    case 536870945:
                        errorMsg = Translate('IDCS_FIND_PASSWORD_BUSY')
                        break
                    case 536871056:
                    default:
                        errorMsg = Translate('IDCS_ENTER_ERROR_EMAIL_ADDRESS_TIP')
                        break
                }
                openMessageBox(errorMsg)
                pageData.value.captchaDisabled = false
            }
        }

        const setData = async () => {
            if (!formData.value.password.trim()) {
                openMessageBox(Translate('IDCS_PROMPT_PASSWORD_EMPTY'))
                return
            }

            if (formData.value.password !== formData.value.confirmPassword) {
                openMessageBox(Translate('IDCS_PWD_MISMATCH_TIPS'))
                return
            }

            if (!isDebuger && strength.value < DEFAULT_PASSWORD_STREMGTH_MAPPING[passwordStrength.value as keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING]) {
                openMessageBox(Translate('IDCS_PWD_STRONG_ERROR'))
                return
            }

            openLoading()

            const sendXml = rawXml`
                <types>
                    <recoverPasswordType>
                        <enum>secureEMail</enum>
                        <enum>pwdProtectQuestion</enum>
                    </recoverPasswordType>
                </types>
                <content>
                    <recoverType type="recoverPasswordType">secureEMail</recoverType>
                    <newPassword>${wrapCDATA(RSA_encrypt(pageData.value.pubkey, formData.value.password.trim()) + '')}</newPassword>
                    <secureEMail>
                        <Captcha>${wrapCDATA(formData.value.captcha)}</Captcha>
                    </secureEMail>
                </content>
            `
            const result = await recoverPassword(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                localStorage.setItem('isLocking', 'false')
                localStorage.setItem('ramainingTime', '0')
                localStorage.setItem('loginLockTime', '0')
            } else {
                const errorCode = $('errorCode').text().num()
                switch (errorCode) {
                    case 536870951:
                        openMessageBox(Translate('IDCS_DEVICE_LOCKE_TIP')).then(() => {
                            cancel()
                        })
                        break
                    case 536871056:
                    default:
                        openMessageBox(Translate('IDCS_VERIFICATION_CODE_ERROR')).then(() => {
                            cancel()
                        })
                        break
                }
            }
        }

        onMounted(async () => {
            openLoading()
            await getRecoverPasswordInfo()
            await getPasswordSecurity()
            closeLoading()
        })

        onBeforeUnmount(() => {
            countDowner?.destroy()
        })

        return {
            pageData,
            noticeMsg,
            strength,
            cancel,
            handlePrivacyNext,
            handleEmailNext,
            formData,
            formatCode,
            getVerificationCode,
            setData,
        }
    },
})
