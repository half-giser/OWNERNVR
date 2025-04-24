/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-23 11:52:48
 * @Description: 登录界面
 */
import { type FormRules } from 'element-plus'
import LoginPrivacyPop from './LoginPrivacyPop.vue'
import progress from '@bassist/progress'

export default defineComponent({
    components: {
        LoginPrivacyPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const langStore = useLangStore()
        const plugin = usePlugin()
        const userSessionStore = useUserSessionStore()
        const router = useRouter()

        const pageData = ref({
            langTypes: [] as SelectOption<string, string>[],
            langType: langStore.langType,
            langId: langStore.langId,
            calendarOptions: [] as SelectOption<string, string>[],
            // 登录按钮禁用标志
            btnDisabled: false,
            isPrivacy: false,
            quality: 'sub',
            isLogin: false,
        })

        langStore.getLangTypes().then((res) => {
            pageData.value.langTypes = Object.entries(res.value).map((item) => {
                return {
                    label: item[1],
                    value: item[0],
                }
            })
        })

        const formRef = useFormRef()

        // 界面表单数据
        const formData = ref(new UserLoginForm())
        formData.value.calendarType = userSessionStore.calendarType

        // 校验规则
        const rules = reactive<FormRules>({
            userName: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value) {
                            errorMsgFun.value = () => Translate('IDCS_PROMPT_USERNAME_EMPTY')
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
                        if (value.length > 16) {
                            errorMsgFun.value = () => Translate('IDCS_LOGIN_FAIL_REASON_U_P_ERROR')
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        // 图像质量
        const qualityOptions = computed(() => {
            return [
                {
                    label: Translate('IDCS_HIGH_QUALITY'),
                    value: 'main',
                },
                {
                    label: Translate('IDCS_STANDARD_QUALITY'),
                    value: 'sub',
                },
            ]
        })

        // 初始化错误超过次数锁定检测工具
        const errorLockChecker = ErrorLockChecker('login')

        // 登录错误提示函数
        const errorMsgFun = ref<() => string>(() => '')

        // 登录错误提示
        const errorMsg = computed(() => {
            if (errorLockChecker.getLock() && pageData.value.isLogin) {
                return errorLockChecker.getErrorMessage()
            }
            return errorMsgFun.value()
        })

        // 登录按钮禁用
        const btnDisabled = computed(() => {
            return pageData.value.btnDisabled || (errorLockChecker.getLock() && pageData.value.isLogin)
        })

        /**
         * @description 登录验证
         */
        const handleLogin = () => {
            formRef.value!.validate(async (valid) => {
                if (valid) {
                    pageData.value.btnDisabled = true
                    try {
                        const reqData = await fnReqLogin()
                        const result = await fnDoLogin(reqData)
                        // doLogin后更新用户会话信息
                        await userSessionStore.updateByLogin('STANDARD', result, reqData, formData.value)
                        // UI1-D / UI1-G 登录默认画质
                        if (import.meta.env.VITE_UI_TYPE === 'UI1-D' || import.meta.env.VITE_UI_TYPE === 'UI1-G') {
                            userSessionStore.defaultStreamType = pageData.value.quality
                        }
                        plugin.DisposePlugin()
                        plugin.StartV2Process()
                        router.push('/live')
                    } catch (e) {
                        console.error(e)
                    } finally {
                        progress.done()
                        pageData.value.btnDisabled = false
                    }
                }
            })
        }

        /**
         * @description 登录
         */
        const fnReqLogin = async () => {
            progress.start()
            try {
                const result = await reqLogin()
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    userSessionStore.updataByReqLogin(result)
                    const reqData = new UserLoginReqData()
                    const md5Pwd = MD5_encrypt(formData.value.password)
                    reqData.userName = formData.value.userName
                    const nonce = userSessionStore.nonce ? userSessionStore.nonce : ''
                    reqData.password = sha512_encrypt(md5Pwd + '#' + nonce)
                    reqData.passwordMd5 = md5Pwd
                    return reqData
                } else {
                    const errorCode = $('errorCode').text()
                    throw new Error(errorCode)
                }
            } catch {
                throw new Error('')
            }
        }

        /**
         * @description 登录后更新用户会话信息
         * @param {UserLoginReqData} reqData
         */
        const fnDoLogin = async (reqData: UserLoginReqData) => {
            const sendXml = rawXml`
                <content>
                    <userName>${reqData.userName}</userName>
                    <password>${reqData.password}</password>
                </content>
            `
            try {
                const result = await doLogin(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    return result
                } else {
                    formData.value.password = ''
                    const errorCode = $('errorCode').text().num()
                    const ramainingNumber = $('ramainingNumber').text()
                    errorLockChecker.setLockTime($('ramainingTime').text().num() * 1000)
                    errorLockChecker.setLock($('locked').text().bool())
                    switch (errorCode) {
                        case ErrorCode.USER_ERROR_NO_USER:
                        case ErrorCode.USER_ERROR_PWD_ERR:
                            pageData.value.isLogin = true
                            errorMsgFun.value = () => Translate('IDCS_LOGIN_FAIL_REASON_U_P_ERROR')
                            errorLockChecker.setPreErrorMessage('IDCS_LOGIN_FAIL_REASON_U_P_ERROR')
                            if (!errorLockChecker.checkIsLocked()) {
                                if (ramainingNumber) {
                                    errorMsgFun.value = () => Translate('IDCS_LOGIN_FAIL_REASON_U_P_ERROR') + '\n' + Translate('IDCS_TICK_ERROR_COUNT').formatForLang(ramainingNumber)
                                }
                            }
                            break
                        case ErrorCode.USER_ERROR_USER_LOCKED:
                            errorMsgFun.value = () => Translate('IDCS_LOGIN_FAIL_USER_LOCKED')
                            break
                        case ErrorCode.USER_ERROR_NO_AUTH:
                            errorMsgFun.value = () => Translate('IDCS_LOGIN_FAIL_USER_LIMITED_TELNET')
                            break
                        case ErrorCode.USER_ERROR_INVALID_PARAM:
                            errorMsgFun.value = () => Translate('IDCS_USER_ERROR_INVALID_PARAM')
                            break
                        default:
                            errorMsgFun.value = () => Translate('IDCS_UNKNOWN_ERROR_CODE') + errorCode
                    }
                    throw new Error(errorCode + '')
                }
            } catch (e) {
                throw new Error('')
            }
        }

        /**
         * @description 是否展示隐私政策弹窗
         */
        const getIsShowPrivacy = async () => {
            const result = await queryShowPrivacyView()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                if ($('content/show').text().bool() && !localStorage.getItem(LocalCacheKey.KEY_PRIVACY)) {
                    pageData.value.isPrivacy = true
                } else {
                    localStorage.setItem(LocalCacheKey.KEY_PRIVACY, 'true')
                }
            }
        }

        /**
         * @description 同意并关闭隐私弹窗
         */
        const closePrivacy = () => {
            pageData.value.isPrivacy = false
            localStorage.setItem(LocalCacheKey.KEY_PRIVACY, 'true')
        }

        /**
         * @description 更新标题
         */
        const updateTitle = () => {
            const title = Translate('IDCS_WEB_CLIENT')
            document.title = title === 'IDCS_WEB_CLIENT' ? '' : title
        }

        /**
         * @description 切换语言
         */
        const changeLang = async () => {
            langStore.updateLangId(pageData.value.langId)
            const langType = LANG_TYPE_MAPPING[pageData.value.langId]
            if (langType) {
                langStore.updateLangType(langType)
            }
            await langStore.getLangItems(true)
            updateCalendar()
            updateTitle()
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
            if (e.key && e.key.toLowerCase() === 'enter') {
                handleLogin()
            }
        }

        onMounted(() => {
            updateTitle()
            getIsShowPrivacy()
            updateCalendar()
        })

        return {
            formRef,
            pageData,
            formData,
            handleLogin,
            keyUp,
            rules,
            changeLang,
            closePrivacy,
            btnDisabled,
            errorMsg,
            qualityOptions,
        }
    },
})
