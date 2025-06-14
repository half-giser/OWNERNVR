/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-14 09:47:42
 * @Description: 新增用户
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import { type FormRules } from 'element-plus'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const userSession = useUserSessionStore()
        const router = useRouter()

        const pageData = ref({
            isCheckAuthPop: false,
            isSchedulePop: false,
            scheduleList: [] as SelectOption<string, string>[],
            isAdmin: userSession.userType === USER_TYPE_DEFAULT_ADMIN,
        })

        const formData = ref(new UserAddForm())
        const formRef = useFormRef()

        // 要求的密码强度
        const passwordStrength = ref<keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING>('weak')
        // 当前密码强度
        const strength = computed(() => getPwdSaftyStrength(formData.value.password))

        const authGroupOptions = ref<SelectOption<string, string>[]>([])

        // 密码强度提示信息
        const noticeMsg = computed(() => {
            return getTranslateForPasswordStrength(passwordStrength.value)
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
         * @description 获取权限组
         */
        const getAuthGroup = async () => {
            const sendXml = rawXml`
                <name/>
            `
            const result = await queryAuthGroupList(sendXml)
            commLoadResponseHandler(result, ($) => {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    // TSSR-2195 添加用户/编辑用户时，权限组列表不显示调试组；
                    if ($item('groupType').text() === 'debug') {
                        return
                    }
                    authGroupOptions.value.push({
                        value: item.attr('id'),
                        label: displayAuthGroup($item('name').text()),
                    })
                })
                if (authGroupOptions.value.length) {
                    formData.value.authGroup = authGroupOptions.value[0].value
                }
            })
        }

        /**
         * @description 显示权限组名字
         * @param {string} value
         * @returns {string}
         */
        const displayAuthGroup = (value: string) => {
            const name = DEFAULT_AUTH_GROUP_MAPPING[value] ? Translate(DEFAULT_AUTH_GROUP_MAPPING[value]) : value
            return name
        }

        // 表单验证规则
        const rules = ref<FormRules>({
            userName: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_USERNAME_EMPTY')))
                            return
                        }

                        if (/\W/.test(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            password: [
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
            confirmPassword: [
                {
                    validator: (_rule, value: string, callback) => {
                        // if (!value) {
                        //     callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                        //     return
                        // }

                        if (value !== formData.value.password) {
                            callback(new Error(Translate('IDCS_PWD_MISMATCH_TIPS')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            // email: [
            //     {
            //         validator: (_rule, value: string, callback) => {
            //             if (!!value && !checkEmail(value)) {
            //                 callback(new Error(Translate('IDCS_PROMPT_INVALID_EMAIL')))
            //                 return
            //             }

            //             callback()
            //         },
            //         trigger: 'manual',
            //     },
            // ],
        })

        /**
         * @description 验证表单，通过后打开授权弹窗
         */
        const verify = () => {
            formData.value.userName = formData.value.userName.trim()
            formRef.value!.validate((valid) => {
                if (valid) {
                    pageData.value.isCheckAuthPop = true
                }
            })
        }

        /**
         * @description 发起创建用户请求
         * @param e
         */
        const doCreateUser = async (e: UserCheckAuthForm) => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <userName maxByteLen="63">${wrapCDATA(formData.value.userName)}</userName>
                    <password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(MD5_encrypt(formData.value.password), userSession.sesionKey))}</password>
                    <email>${wrapCDATA(formData.value.email)}</email>
                    <modifyPassword>${formData.value.allowModifyPassword}</modifyPassword>
                    ${pageData.value.isAdmin ? `<accessCode>${formData.value.accessCode}</accessCode>` : ''}
                    <authGroupId>${wrapCDATA(formData.value.authGroup)}</authGroupId>
                    <bindMacSwitch>false</bindMacSwitch>
                    <mac>${wrapCDATA(DEFAULT_EMPTY_MAC)}</mac>
                    <enabled>true</enabled>
                    <authEffective>true</authEffective>
                    <loginScheduleInfo enable="${formData.value.loginScheduleInfoEnabled}" scheduleId="${formData.value.loginScheduleInfo}"></loginScheduleInfo>
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await createUser(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                pageData.value.isCheckAuthPop = false
                goBack()
            } else {
                let errorInfo = ''
                const errorCode = $('errorCode').text().num()
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_NAME_EXISTED:
                        errorInfo = Translate('IDCS_USER_EXISTED_TIPS')
                        break
                    case ErrorCode.USER_ERROR_OVER_LIMIT:
                        errorInfo = Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT')
                        break
                    // 密码错误
                    case ErrorCode.USER_ERROR_NO_USER:
                    case ErrorCode.USER_ERROR_PWD_ERR:
                        errorInfo = Translate('IDCS_DEVICE_PWD_ERROR')
                        break
                    // 鉴权账号无相关权限
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_AUTH')
                        break
                    default:
                        errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                        break
                }
                openMessageBox({
                    type: 'error',
                    message: errorInfo,
                })
            }
        }

        /**
         * @description 跳转用户列表页
         */
        const goBack = () => {
            router.push('/config/security/user/list')
        }

        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            formData.value.loginScheduleInfo = getScheduleId(pageData.value.scheduleList, formData.value.loginScheduleInfo)
        }

        onMounted(async () => {
            openLoading()
            await getScheduleList()
            await getPasswordSecurityStrength()
            await getAuthGroup()
            formData.value.loginScheduleInfo = pageData.value.scheduleList[0].value
            closeLoading()
        })

        return {
            formRef,
            formData,
            rules,
            authGroupOptions,
            strength,
            pageData,
            doCreateUser,
            verify,
            goBack,
            noticeMsg,
            closeSchedulePop,
        }
    },
})
