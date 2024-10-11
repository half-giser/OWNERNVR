/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-20 09:10:22
 * @Description: P2P授权码登录
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-09 18:40:21
 */
import type { FormInstance, FormRules } from 'element-plus'
import { AuthCodeLoginForm } from '@/types/apiType/user'

export default defineComponent({
    setup() {
        const Plugin = usePlugin()
        const layoutStore = useLayoutStore()
        const { openLoading, closeLoading } = useLoading()
        const lang = useP2PLang()
        const Translate = lang.Translate
        const userSession = useUserSessionStore()
        const pluginStore = usePluginStore()

        const pageData = ref({
            // 当前选择语言
            langId: lang.langId,
            // 登录按钮是否禁用
            btnDisabled: false,
            // 获取授权码按钮是否禁用
            authCodeDisabled: false,
            // 错误信息回显
            errorMsg: '',
            // 版权信息
            copyright: import.meta.env.VITE_APP_COPYRIGHT,
            // auth code index
            authCodeIndex: userSession.authCodeIndex,
            // auth code 过期时间
            expireTime: 0,
            // 登录类型
            loginType: P2PACCESSTYPE.P2P_AUTHCODE_LOGIN,
            // 日历选项
            calendarOptions: [] as SelectOption<string, string>[],
        })

        // 错误码与回显文本映射
        const ErrorCodeMapping: Record<number, string> = {
            536870928: 'IDCS_AUTHCODE_ERROR', // authcode error
            536870929: 'IDCS_PLUGIN_NO_RESPONSE_TIPS', // plugin no response
            536870935: 'IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE', // dev connect fail
            536870941: 'IDCS_AUTHCODE_EXPIRE', // authcode expire
            536870947: 'IDCS_AUTHCODE_ERROR', // authcode error
            536870948: 'IDCS_AUTHCODE_ERROR', // authcode error
            536870951: 'IDCS_DEVICE_LOCKED', // user lock
            536870953: 'IDCS_LOGIN_FAIL_USER_LIMITED_TELNET', // no remote auth
            536871080: 'IDCS_ACCESS_EXCEPTION_RETRY', // access exception
            536871081: 'IDCS_ACCESS_EXCEPTION_RETRY', // access exception
        }

        const formRef = ref<FormInstance>()

        const formData = ref(new AuthCodeLoginForm())

        const rules = ref<FormRules>({
            sn: [
                {
                    validator(rule, value, callback) {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_SN_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            code: [
                {
                    validator(rule, value, callback) {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_AUTHCODE_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        let timer: NodeJS.Timeout | number = 0

        /**
         * @description 更换语言，重新请求语言列表
         */
        const changeLang = async () => {
            lang.updateLangId(pageData.value.langId)
            lang.updateLangType(LANG_TYPE_MAPPING[pageData.value.langId])
            await lang.getLangItems(true)
            updateCalendar()
        }

        /**
         * @description 根据用户选择的语言，获取日历类型
         */
        const updateCalendar = () => {
            const langType = lang.langType.value
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
         * @description 处理错误信息
         * @param {number} errorCode
         * @param {string} errorDescription
         */
        const handlerErrorCode = (errorCode?: number, errorDescription?: string) => {
            if (!errorCode) {
                backToHomePage()
                return
            }
            let errorMsg = ''
            const unkownError = Translate('IDCS_UNKNOWN_ERROR_CODE') + errorCode
            switch (errorCode) {
                case ErrorCode.USER_ERROR_NODE_NET_OFFLINE: // 设备连接失败
                case 536871080: // 当前设备已经被绑定,需要授权码登录
                case 536871081: // 当前设备已解绑，需要用户名/密码登录
                    let backHomeErrorCode = ErrorCode.USER_ERROR_NODE_NET_OFFLINE
                    if (errorCode == 536871080 || errorCode == 536871081) {
                        backHomeErrorCode = 536871080 // 返回首页，并提示‘访问异常，请重试’
                    }
                    backToHomePage(backHomeErrorCode)
                    return
                case ErrorCode.USER_ERROR_NO_USER: // 用户名不存在
                case ErrorCode.USER_ERROR_PWD_ERR: // 密码错误
                case ErrorCode.USER_ERROR_USER_LOCKED: // 设备登录被锁定
                    if (errorCode == ErrorCode.USER_ERROR_USER_LOCKED) {
                        stopCountDownTime()
                        pageData.value.authCodeDisabled = true
                    }
                    handleUserLockedError(errorCode, errorDescription)
                    return
                case ErrorCode.USER_ERROR_INVALID_POINT:
                case ErrorCode.USER_ERROR_TASK_NO_EXISTS:
                case ErrorCode.USER_ERROR_NO_AUTH:
                    errorMsg = Translate('IDCS_AUTHCODE_EXPIRE')
                    const errorLangKey = ErrorCodeMapping[errorCode]
                    errorMsg = errorLangKey ? Translate(errorLangKey) : unkownError
                    break
                default:
                    errorMsg = unkownError
                    break
            }
            clearAuInfo()
            pageData.value.errorMsg = errorMsg
            pageData.value.btnDisabled = false
        }

        /**
         * @description 清除用户信息
         */
        const clearAuInfo = () => {
            userSession.auInfo_N9K = ''
            delCookie('auInfo_N9K')
        }

        /**
         * @description 处理用户锁定错误
         * @param {number} errorCode
         * @param {string} errorDescription
         */
        const handleUserLockedError = (errorCode: number, errorDescription?: string) => {
            if (errorCode == ErrorCode.USER_ERROR_USER_LOCKED) {
                setCookie('originError', ErrorCodeMapping[errorCode], 365)
                delCookie('ec')
                delCookie('em')
            } else {
                setCookie('ec', ErrorCode.USER_ERROR_MODULE_NO_INITIAL)
                errorDescription && setCookie('em', errorDescription)
            }
            const errorLangKey = ErrorCodeMapping[errorCode]
            const errorMsg = errorLangKey ? Translate(errorLangKey) : Translate('IDCS_AUTHCODE_ERROR')
            pageData.value.errorMsg = errorMsg
            if (errorDescription) {
                const errorTextArr = errorDescription.split(' ')
                const errorTextObj: Record<string, number> = {}
                errorTextArr.forEach((item) => {
                    const keyValueArr = item.split('=')
                    if (keyValueArr.length === 2) {
                        errorTextObj[keyValueArr[0]] = Number(keyValueArr[1])
                    }
                })
                if (errorTextObj.Locked && errorTextObj.RamainTime && errorTextObj.RamainCount) {
                    handleLock(errorTextObj.RamainTime * 1000, errorTextObj.RemainCount * 1)
                }
            }
        }

        /**
         * @description 用户锁定倒计时
         * @param {number} remainTime
         * @param {number} lockCount
         */
        const handleLock = (remainTime: number, lockCount: number) => {
            let lockTime = 5 * 60 * 1000
            let count = 0
            if (!isNaN(lockCount)) {
                count = lockCount
            } else if (getCookie('loginLockCount')) {
                count = Number(getCookie('loginLockCount'))
                count--
                if (count < 0) {
                    count = 0
                }
                setCookie('loginLockCount', count)
            }
            if (count === 0) {
                if (!isNaN(remainTime)) {
                    lockTime = remainTime
                }
                setCookie('loginLockTime', Date.now(), 365)
                setCookie('ramainTime', Date.now(), 365)
                setCookie('loginLock', 'true')
                pageData.value.btnDisabled = true
                const originError = pageData.value.errorMsg
                new CountDowner({
                    distime: lockTime / 1000,
                    callback(obj) {
                        let info = ''
                        if (parseInt(obj.disminites) > 0) {
                            info = Translate('IDCS_TICK_MIN').formatForLang(obj.disminites, obj.disseconds)
                        } else {
                            info = Translate('IDCS_TICK_SEC').formatForLang(obj.disseconds)
                        }
                        pageData.value.btnDisabled = true
                        pageData.value.errorMsg = originError + info
                    },
                    overFn() {
                        pageData.value.errorMsg = ''
                        pageData.value.btnDisabled = false
                        setCookie('loginLockCount', 5)
                        setCookie('loginLock', 'false')
                    },
                })
            }
        }

        /**
         * @description 检查登录是否已被锁定
         */
        const checkIsLocking = () => {
            let lockTime = 5 * 60 * 1000
            if (pageData.value.loginType === P2PACCESSTYPE.P2P_AUTHCODE_LOGIN) {
                return
            }
            if (!getCookie('loginLock')) {
                setCookie('loginLock', 'false')
            }
            if (!getCookie('loginLockCount')) {
                setCookie('loginLockCount', 5)
            }
            const cookieLockTime = getCookie('loginLockTime')
            const cookieRemainTime = getCookie('ramainTime')
            const currentTime = Date.now()
            if (cookieLockTime && cookieRemainTime) {
                const loginLockTime = Number(cookieLockTime)
                const remainTime = Number(cookieRemainTime)
                lockTime = remainTime
                if (currentTime - loginLockTime < lockTime) {
                    setCookie('loginLock', 'true')
                    const originError = getCookie('originError') || ''
                    new CountDowner({
                        distime: loginLockTime + lockTime - currentTime,
                        callback(obj) {
                            if (getCookie('loginLock') === 'true') {
                                let info = ''
                                if (parseInt(obj.disminites) > 0) {
                                    info = Translate('IDCS_TICK_MIN').formatForLang(obj.disminites, obj.disseconds)
                                } else {
                                    info = Translate('IDCS_TICK_SEC').formatForLang(obj.disseconds)
                                }
                                pageData.value.btnDisabled = true
                                pageData.value.errorMsg = originError + info
                            }
                        },
                        overFn() {
                            pageData.value.errorMsg = ''
                            pageData.value.btnDisabled = false
                            pageData.value.authCodeDisabled = false
                        },
                    })
                }
            }
        }

        /**
         * @description 返回P2P登录页
         * @param {number} errorCode
         */
        const backToHomePage = (errorCode?: number) => {
            if (errorCode) {
                setCookie('ec', errorCode)
            }
            window.location.href = '/index.html'
        }

        /**
         * @description 开始倒计时
         */
        const startCountDownTime = () => {
            pageData.value.expireTime = 180
            timer = setInterval(() => {
                pageData.value.expireTime--
                if (pageData.value.expireTime <= 0) {
                    stopCountDownTime()
                }
            }, 999)
        }

        /**
         * @description 过期时间文本
         */
        const expireTime = computed(() => {
            const unit = pageData.value.expireTime > 60 ? Translate('IDCS_SECONDS') : Translate('IDCS_SECOND')
            return `(${pageData.value.expireTime} ${unit})`
        })

        /**
         * @description 结束倒计时
         */
        const stopCountDownTime = () => {
            clearInterval(timer)
        }

        /**
         * @description 验证登录表单
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    handleLogin()
                }
            })
        }

        /**
         * @description 重新获取授权码
         */
        const getAuthCode = () => {
            openLoading()
            pluginStore.manuaClosePlugin = false
            pageData.value.errorMsg = ''
            userSession.p2pSessionId = null
            Plugin.DisposePlugin()
            Plugin.StartV2Process()
            Plugin.SetLoginTypeCallback((loginType, authCodeIndex) => {
                closeLoading()
                pageData.value.loginType = loginType
                pageData.value.authCodeIndex = authCodeIndex
                startCountDownTime()
                checkIsLocking()
                pluginStore.manuaClosePlugin = false
            })
        }

        /**
         * @description 登录
         */
        const handleLogin = () => {
            if (pageData.value.expireTime <= 0) {
                handlerErrorCode(536870941)
                return
            }
            pageData.value.btnDisabled = true
            pageData.value.errorMsg = ''
            userSession.calendarType = formData.value.calendarType
            Plugin.P2pAuthCodeLogin(formData.value.code, pageData.value.authCodeIndex)
        }

        onMounted(async () => {
            await lang.getLangTypes()
            await lang.getLangItems()
            Plugin.SetLoginErrorCallback(handlerErrorCode)
            layoutStore.isInitial = true
            userSession.refreshLoginPage = true
            startCountDownTime()
            checkIsLocking()
            updateCalendar()
        })

        onBeforeUnmount(() => {
            stopCountDownTime()
            Plugin.SetLoginTypeCallback()
            userSession.refreshLoginPage = false
        })

        return {
            Translate: lang.Translate,
            pageData,
            lang,
            changeLang,
            formData,
            rules,
            handleLogin,
            expireTime,
            formRef,
            verify,
            getAuthCode,
        }
    },
})
