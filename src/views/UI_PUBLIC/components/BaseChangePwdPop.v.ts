import { ChangePasswordForm } from '@/types/apiType/user'
import { type FormInstance, type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        title: {
            type: String,
            require: true,
            default: '',
        },
        forced: {
            type: Boolean,
            require: false,
            default: false,
        },
        passwordStrength: {
            type: String,
            require: true,
            default: 'weak',
        },
    },
    emits: {
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = inject('appGlobalProp') as appGlobalProp
        const formRef = ref<FormInstance>()
        const formData = ref(new ChangePasswordForm())
        const noticeMsg = ref('')
        const strength = computed(() => getPwdSaftyStrength(formData.value.newPassword))
        const userSession = useUserSessionStore()
        const { openMessageTipBox } = useMessageBox()

        const rules = ref<FormRules>({
            currentPassword: [
                {
                    validator: (rule, value: string, callback) => {
                        if (value.length === 0) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            newPassword: [
                {
                    validator: (rule, value: string, callback) => {
                        if (value.length === 0) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }
                        if (strength.value < DEFAULT_PASSWORD_STREMGTH_MAPPING[prop.passwordStrength as keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING]) {
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
                    validator: (rule, value: string, callback) => {
                        if (value.length === 0) {
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

        const getNoticeMsg = () => {
            switch (prop.passwordStrength) {
                case 'medium':
                    noticeMsg.value = Translate('IDCS_PASSWORD_STRONG_MIDDLE').formatForLang(8, 16)
                    break
                case 'strong':
                    noticeMsg.value = Translate('IDCS_PASSWORD_STRONG_HEIGHT').formatForLang(8, 16)
                    break
                case 'stronger':
                    noticeMsg.value = Translate('IDCS_PASSWORD_STRONG_HEIGHEST').formatForLang(8, 16)
                    break
                default:
                    break
            }
        }

        const verify = () => {
            formRef.value!.validate(async (valid: boolean) => {
                if (valid) {
                    doUpdateUserPassword()
                }
            })
        }

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
            if ($('/response/status').text() === 'success') {
                userSession.defaultPwd = false
                userSession.isChangedPwd = true
                userSession.pwdExpired = false
                openMessageTipBox({
                    type: 'success',
                    title: Translate('IDCS_SUCCESS_TIP'),
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).then(() => {
                    ctx.emit('close')
                })
            } else {
                const errorCode = Number($('/response/errorCode').text())
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_PWD_ERR:
                        ElMessage({
                            type: 'error',
                            message: Translate('IDCS_PASSWORD_NOT_CORRENT'),
                        })
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        ElMessage({
                            type: 'error',
                            message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_NO_PERMISSION'),
                        })
                        break
                    case ErrorCode.USER_ERROR_NO_USER:
                        openMessageTipBox({
                            type: 'error',
                            title: Translate('IDCS_INFO_TIP'),
                            message: Translate('IDCS_DEVICE_USER_NOTEXIST'),
                        }).then(() => {
                            Logout()
                        })
                        break
                    default:
                        ElMessage({
                            type: 'error',
                            message: Translate('IDCS_SAVE_DATA_FAIL'),
                        })
                        break
                }
            }
        }

        const handleBeforeClose = (done: (cancel?: boolean) => void) => {
            done(prop.forced)
        }

        const opened = () => {
            formData.value = new ChangePasswordForm()
            formRef.value?.clearValidate()
        }

        const close = () => {
            if (prop.forced) {
                openMessageTipBox({
                    type: 'question',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_PWD_STRONG_ERROR_TIPS'),
                }).then(() => {
                    Logout()
                })
            } else {
                ctx.emit('close')
            }
        }

        onMounted(() => {
            getNoticeMsg()
        })

        return {
            formRef,
            formData,
            noticeMsg,
            strength,
            close,
            rules,
            opened,
            verify,
            handleBeforeClose,
        }
    },
})
