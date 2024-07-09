/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 17:21:34
 * @Description: 更改其他用户密码的弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-04 20:43:01
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import { UserEditPasswordForm, type UserCheckAuthForm } from '@/types/apiType/userAndSecurity'
import { type FormInstance, type FormRules } from 'element-plus'
import BasePasswordStrength from '../../components/form/BasePasswordStrength.vue'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
        BasePasswordStrength,
    },
    props: {
        userId: {
            type: String,
            required: true,
        },
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
        const { openMessageTipBox } = useMessageBox()
        const { closeLoading, LoadingTarget, openLoading } = useLoading()
        const systemCaps = useCababilityStore()

        const noticeMsg = ref('')
        const formRef = ref<FormInstance>()
        const formData = ref(new UserEditPasswordForm())
        // 要求的密码强度
        const passwordStrength = ref<keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING>('weak')
        // 当前密码强度
        const strength = computed(() => getPwdSaftyStrength(formData.value.newPassword))
        const isAuthDialog = ref(false)

        const rules = ref<FormRules>({
            newPassword: [
                {
                    validator: (rule, value: string, callback) => {
                        if (value.length === 0) {
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

        /**
         * @description 获取要求的密码强度
         */
        const getPasswordSecurityStrength = async () => {
            let strength: keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING = 'weak'
            const isInw48 = systemCaps.supportPwdSecurityConfig // TODO: 原项目是这个值
            const result = await queryPasswordSecurity()
            const $ = queryXml(result)
            if ($('/response/status').text() === 'success') {
                strength = ($('/response/content/pwdSecureSetting/pwdSecLevel').text() as keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING & null) ?? 'weak'
                if (isInw48) {
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
            switch (passwordStrength.value) {
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

        /**
         * @description 表单验证
         */
        const verify = () => {
            formRef.value!.validate(async (valid: boolean) => {
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
            openLoading(LoadingTarget.FullScreen)

            const password = AES_encrypt(MD5_encrypt(formData.value.newPassword), userSession.sesionKey)
            const xml = rawXml`
                <content>
                    <userId>${prop.userId}</userId>
                    <userName>${wrapCDATA(prop.userName)}</userName>
                    <password ${getSecurityVer()}>${wrapCDATA(password)}</password>
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await editOtherUserPassword(xml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('/response/status').text() === 'success') {
                isAuthDialog.value = false
                ctx.emit('close')
            } else {
                const errorCode = Number($('/response/errorCode').text())
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
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: errorText,
                })
            }
        }

        /**
         * @description 打开弹窗时清空信息
         */
        const opened = () => {
            formData.value = new UserEditPasswordForm()
            formRef.value?.clearValidate()
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
            opened,
            verify,
            isAuthDialog,
            doUpdateUserPassword,
            BaseCheckAuthPop,
            BasePasswordStrength,
        }
    },
})
