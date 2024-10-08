/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-23 11:52:48
 * @Description: 登录界面
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-30 16:16:50
 */
import { type FormRules, type FormInstance } from 'element-plus'
import { LoginForm, LoginReqData } from '@/types/apiType/user'
import LoginPrivacyPop from './LoginPrivacyPop.vue'

export default defineComponent({
    components: {
        LoginPrivacyPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const langStore = useLangStore()
        const Plugin = inject('Plugin') as PluginType
        const userSessionStore = useUserSessionStore()
        const router = useRouter()
        const theme = getUiAndTheme()

        const pageData = ref({
            langTypes: {} as Record<string, string>,
            langType: langStore.langType,
            langId: langStore.langId,
            calendarOptions: [] as SelectOption<string, string>[],
            // 登录错误提示
            errorMsg: '',
            // 登录按钮禁用标志
            btnDisabled: false,
            isPrivacy: false,
            quality: 'sub',
            qualityOptions: [
                {
                    label: 'IDCS_HIGH_QUALITY',
                    value: 'main',
                },
                {
                    label: 'IDCS_STANDARD_QUALITY',
                    value: 'sub',
                },
            ],
        })

        langStore.getLangTypes().then((res) => {
            pageData.value.langTypes = unref(res)
        })

        const formRef = ref<FormInstance>()

        // 界面表单数据
        const formData = ref(new LoginForm())
        formData.value.calendarType = userSessionStore.calendarType

        // 校验规则
        const rules = reactive<FormRules>({
            userName: [
                {
                    validator(rule, value, callback) {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_USERNAME_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'blur',
                },
            ],
            password: [
                {
                    validator(rule, value, callback) {
                        if (value.length > 16) {
                            callback(new Error(Translate('IDCS_LOGIN_FAIL_REASON_U_P_ERROR')))
                            return
                        }
                        callback()
                    },
                    trigger: 'blur',
                },
            ],
        })

        /**
         * @description 错误超过次数锁定后的读秒回调
         * @param {string} countDownInfo
         */
        const countDownCallback = (countDownInfo: string) => {
            pageData.value.errorMsg = countDownInfo
        }

        /**
         * @description 错误超过次数锁定后的读秒结束回调
         */
        const countDownEndCallback = () => {
            pageData.value.errorMsg = ''
            pageData.value.btnDisabled = false
        }

        // 初始化错误超过次数锁定检测工具
        const errorLockChecker = new ErrorLockChecker('login', countDownCallback, countDownEndCallback)
        if (errorLockChecker.isLocked) {
            pageData.value.btnDisabled = true
        }

        /**
         * @description 登录验证
         */
        const handleLogin = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    pageData.value.btnDisabled = true
                    fnReqLogin()
                }
            })
        }

        /**
         * @description 登录
         */
        const fnReqLogin = async () => {
            const result = await reqLogin(getXmlWrapData(''))
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                userSessionStore.updataByReqLogin(result)
                const reqData = new LoginReqData()
                const md5Pwd = MD5_encrypt(formData.value.password)
                reqData.userName = formData.value.userName
                const nonce = userSessionStore.nonce ? userSessionStore.nonce : ''
                reqData.password = '' + sha512_encrypt(md5Pwd + '#' + nonce)
                reqData.passwordMd5 = md5Pwd
                fnDoLogin(reqData)
            } else {
                const errorCode = $('errorCode').text()
                console.log(errorCode)
                // ElMessage.error(Translate(ErrorCodeMapping[errorCode]))
                pageData.value.btnDisabled = false
            }
        }

        /**
         * @description 登录后更新用户会话信息
         * @param {LoginReqData} reqData
         */
        const fnDoLogin = async (reqData: LoginReqData) => {
            const sendXml = rawXml`
                <content>
                    <userName>${reqData.userName}</userName>
                    <password>${reqData.password}</password>
                </content>
            `
            try {
                const result = await doLogin(getXmlWrapData(sendXml))
                const $ = queryXml(result)
                if ($('//status').text() == 'success') {
                    // doLogin后更新用户会话信息
                    await userSessionStore.updateByLogin('STANDARD', result, reqData, formData.value)
                    pageData.value.btnDisabled = false
                    // UI1-D / UI1-G 登录默认画质
                    if (['UI1-D', 'UI1-G'].includes(theme.name)) {
                        userSessionStore.defaultStreamType = pageData.value.quality
                    }
                    Plugin.DisposePlugin()
                    Plugin.TogglePageByPlugin()
                    Plugin.StartV2Process()
                    router.push('/live')
                } else if ($('//status').text() == 'fail') {
                    pageData.value.btnDisabled = false
                    formData.value.password = ''
                    const errorCode = Number($('errorCode').text())
                    const ramainingNumber = $('ramainingNumber').text()
                    errorLockChecker.setLockTime(Number($('ramainingTime').text()) * 1000)
                    errorLockChecker.isLocked = $('locked').text().toBoolean()
                    if (errorCode) {
                        switch (errorCode) {
                            case ErrorCode.USER_ERROR_NO_USER:
                            case ErrorCode.USER_ERROR_PWD_ERR:
                                errorLockChecker.preErrorMsg = Translate('IDCS_LOGIN_FAIL_REASON_U_P_ERROR')
                                pageData.value.errorMsg = errorLockChecker.preErrorMsg
                                errorLockChecker.error(() => {
                                    if (ramainingNumber) {
                                        pageData.value.errorMsg = pageData.value.errorMsg + '\n' + Translate('IDCS_TICK_ERROR_COUNT').formatForLang(ramainingNumber)
                                    }
                                })
                                if (errorLockChecker.isLocked) {
                                    pageData.value.btnDisabled = true
                                }
                                break
                            case ErrorCode.USER_ERROR_USER_LOCKED:
                                pageData.value.errorMsg = Translate('IDCS_LOGIN_FAIL_USER_LOCKED')
                                break
                            case ErrorCode.USER_ERROR_NO_AUTH:
                                pageData.value.errorMsg = Translate('IDCS_LOGIN_FAIL_USER_LIMITED_TELNET')
                                break
                            case ErrorCode.USER_ERROR_INVALID_PARAM:
                                pageData.value.errorMsg = Translate('IDCS_USER_ERROR_INVALID_PARAM')
                                break
                            default:
                                pageData.value.errorMsg = Translate('IDCS_UNKNOWN_ERROR_CODE') + errorCode
                        }
                    } else {
                        pageData.value.errorMsg = Translate('loginFailed')
                    }
                }
            } catch (e) {
                pageData.value.btnDisabled = false
            }
        }

        /**
         * 是否展示隐私政策弹窗
         */
        const getIsShowPrivacy = async () => {
            const result = await queryShowPrivacyView()
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                if ($('//content/show').text().toBoolean() && !localStorage.getItem('privacy')) {
                    pageData.value.isPrivacy = true
                } else {
                    localStorage.setItem('privacy', 'true')
                }
            }
        }

        /**
         * @description 同意并关闭隐私弹窗
         */
        const closePrivacy = () => {
            pageData.value.isPrivacy = false
            localStorage.setItem('privacy', 'true')
        }

        /**
         * @description 切换语言
         */
        const changeLang = async () => {
            formRef.value!.clearValidate()
            langStore.updateLangId(pageData.value.langId)
            const langType = LANG_TYPE_MAPPING[pageData.value.langId]
            if (langType) {
                langStore.updateLangType(langType)
            }
            await langStore.getLangItems(true)
            updateCalendar()
        }

        /**
         * @description 根据用户选择的语言，获取日历类型
         */
        const updateCalendar = () => {
            const langType = langStore.langType
            if (CALENDAR_TYPE_MAPPING[langType]) {
                pageData.value.calendarOptions = CALENDAR_TYPE_MAPPING[langType].map((item) => {
                    if (item.isDefault) {
                        formData.value.calendarType = item.value
                    }
                    return {
                        label: Translate(item.text),
                        value: item.value,
                    }
                })
            } else {
                pageData.value.calendarOptions = []
                formData.value.calendarType = 'Gregorian'
            }
        }

        /**
         * @description 回车登录
         * @param e
         */
        const keyUp = (e: KeyboardEvent) => {
            if (e.key && e.key.toLowerCase() == 'enter') {
                handleLogin()
            }
        }

        onMounted(() => {
            const title = Translate('IDCS_WEB_CLIENT')
            document.title = title === 'IDCS_WEB_CLIENT' ? '' : title

            getIsShowPrivacy()
            updateCalendar()
        })

        useEventListener(window, 'keyup', keyUp, false)

        return {
            formRef,
            pageData,
            formData,
            handleLogin,
            keyUp,
            rules,
            changeLang,
            closePrivacy,
            LoginPrivacyPop,
        }
    },
})
