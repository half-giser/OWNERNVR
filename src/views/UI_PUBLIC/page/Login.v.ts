/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-23 11:52:48
 * @Description: 登录界面
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-23 14:11:10
 */
import { type FormRules, type FormInstance } from 'element-plus'
import { LoginForm, LoginReqData } from '@/types/apiType/user'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const langStore = useLangStore()
        const Plugin = inject('Plugin') as PluginType
        const userSessionStore = useUserSessionStore()
        const router = useRouter()

        // 语言
        const langTypes = ref<Record<string, string>>({})
        const langType = ref('')
        const langId = ref('')
        langStore.getLangTypes().then((res) => {
            langTypes.value = unref(res)
        })
        langType.value = langStore.getLangType
        langId.value = langStore.getLangId

        const loginFormRef = ref<FormInstance>()

        // 登录错误提示
        const loginErrorMessage = ref('')

        // 界面表单数据
        const pageData = ref(new LoginForm())
        pageData.value.userName = ''
        pageData.value.password = ''

        // 登录按钮禁用标志
        const loginBtnDisabled = ref(false)

        // 隐私政策
        const isPrivacy = ref(false)
        const isAllowPrivacy = ref(false)

        // 错误超过次数锁定后的读秒回调
        const countDownCallback = (countDownInfo: string) => {
            loginErrorMessage.value = countDownInfo
        }

        // 错误超过次数锁定后的读秒结束回调
        const countDownEndCallback = () => {
            loginErrorMessage.value = ''
            loginBtnDisabled.value = false
        }

        // 初始化错误超过次数锁定检测工具
        const errorLockChecker = new ErrorLockChecker('login', countDownCallback, countDownEndCallback)
        if (errorLockChecker.isLocked) {
            loginBtnDisabled.value = true
        }

        // 登录验证
        const handleLogin = async (formEl: FormInstance | undefined) => {
            if (!formEl) return
            await formEl.validate((valid) => {
                if (valid) {
                    loginBtnDisabled.value = true
                    fnReqLogin()
                }
            })
        }

        // 登录
        const fnReqLogin = () => {
            const data: string = getXmlWrapData('')
            reqLogin(data).then((res) => {
                if (xmlParse('status', res).text() == 'success') {
                    // reqLogin更新用户会话信息
                    userSessionStore.updataByReqLogin(res)
                    // 执行doLogin
                    const reqData = new LoginReqData()
                    const md5Pwd = MD5_encrypt(pageData.value.password)
                    reqData.userName = pageData.value.userName
                    const nonce = userSessionStore.nonce ? userSessionStore.nonce : ''
                    reqData.password = '' + sha512_encrypt(md5Pwd + '#' + nonce)
                    reqData.passwordMd5 = md5Pwd
                    fnDoLogin(reqData)
                } else {
                    const errorCode = xmlParse('errorCode', res).text()
                    ElMessage.error(Translate(ErrorCodeMapping[errorCode]))
                    loginBtnDisabled.value = false
                }
            })
        }

        // 登录后更新用户会话信息
        const fnDoLogin = (reqData: LoginReqData) => {
            const data = getXmlWrapData(`<content><userName>${reqData.userName}</userName><password>${reqData.password}</password></content>`)
            doLogin(data)
                .then(async (res) => {
                    if (xmlParse('status', res).text() == 'success') {
                        // doLogin后更新用户会话信息
                        await userSessionStore.updateByLogin('STANDARD', res, reqData, pageData.value)
                        loginBtnDisabled.value = false
                        Plugin.DisposePlugin()
                        Plugin.TogglePageByPlugin()
                        Plugin.StartV2Process()
                        router.push('/live')
                    } else if (xmlParse('status', res).text() == 'fail') {
                        loginBtnDisabled.value = false
                        pageData.value.password = ''
                        const errorCode = xmlParse('errorCode', res).text()
                        const ramainingNumber = xmlParse('ramainingNumber', res).text()
                        errorLockChecker.setLockTime(Number(xmlParse('ramainingTime', res).text()) * 1000)
                        errorLockChecker.isLocked = xmlParse('locked', res).text() === 'true'
                        if (errorCode) {
                            switch (errorCode) {
                                case '536870947':
                                case '536870948':
                                    errorLockChecker.preErrorMsg = Translate('IDCS_LOGIN_FAIL_REASON_U_P_ERROR')
                                    loginErrorMessage.value = errorLockChecker.preErrorMsg
                                    errorLockChecker.error(() => {
                                        if (ramainingNumber) {
                                            loginErrorMessage.value = loginErrorMessage.value + '\n' + Translate('IDCS_TICK_ERROR_COUNT').formatForLang(ramainingNumber)
                                        }
                                    })
                                    if (errorLockChecker.isLocked) {
                                        loginBtnDisabled.value = true
                                    }
                                    break
                                case '536870951':
                                    loginErrorMessage.value = Translate('IDCS_LOGIN_FAIL_USER_LOCKED')
                                    break
                                case '536870953':
                                    loginErrorMessage.value = Translate('IDCS_LOGIN_FAIL_USER_LIMITED_TELNET')
                                    break
                                case '536870943':
                                    loginErrorMessage.value = Translate('IDCS_USER_ERROR_INVALID_PARAM')
                                    break
                                default:
                                    loginErrorMessage.value = Translate('IDCS_UNKNOWN_ERROR_CODE') + errorCode
                            }
                        } else {
                            loginErrorMessage.value = Translate('loginFailed')
                        }
                    }
                })
                .catch(() => {
                    loginBtnDisabled.value = false
                })
        }

        // 是否展示弹窗
        const getIsShowPrivacy = async () => {
            const result = await queryShowPrivacyView()
            const $ = queryXml(result)
            if ($('/response/status').text() === 'success') {
                if ($('/response/content/show').text().toBoolean() && !localStorage.getItem('privacy')) {
                    isPrivacy.value = true
                } else {
                    localStorage.setItem('privacy', 'true')
                }
            }
        }

        // 同意并关闭隐私弹窗
        const closePrivacy = () => {
            isPrivacy.value = false
            localStorage.setItem('privacy', 'true')
        }

        // 切换语言
        watch(langId, async (newVal) => {
            langStore.updateLangId(newVal)
            for (const item in LANG_MAPPING) {
                if (LANG_MAPPING[item].toLowerCase() == newVal) {
                    // langStore.langType.value
                    langStore.updateLangType(item)
                }
            }
            await langStore.getLangItems(true)
        })

        // 回车登录
        const keyUp = (e: KeyboardEvent) => {
            if (e.key && e.key.toLowerCase() == 'enter') {
                handleLogin(loginFormRef.value)
            }
        }

        // 校验规则
        const rules = reactive<FormRules>({
            userName: [{ required: true, message: Translate('IDCS_PROMPT_USERNAME_EMPTY'), trigger: 'blur' }],
        })

        onMounted(() => {
            getIsShowPrivacy()
            // 绑定监听事件
            window.addEventListener('keyup', keyUp)
        })

        onUnmounted(() => {
            window.removeEventListener('keyup', keyUp)
        })

        return {
            loginFormRef,
            pageData,
            loginErrorMessage,
            handleLogin,
            loginBtnDisabled,
            langTypes,
            langType,
            langId,
            keyUp,
            rules,
            isPrivacy,
            isAllowPrivacy,
            closePrivacy,
        }
    },
})
