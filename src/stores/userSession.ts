/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-23 16:32:45
 * @Description: 用户会话信息
 */
import { type XMLQuery } from '@/utils/xmlParse'
import { type LoginForm, type LoginReqData } from '@/types/apiType/user'
import { generateAsyncRoutes } from '@/router'

export const useUserSessionStore = defineStore(
    'userSession',
    () => {
        const cababilityStore = useCababilityStore()
        const dateTime = useDateTimeStore()

        const sessionId = ref('')
        const token = ref('')
        const nonce = ref('')
        const userName = ref('')
        const userId = ref('')
        const unmask = ref(0)
        const auInfo_N9K = ref('')
        const sesionKey = ref('')
        const securityVer = ref('')
        const facePersonnalInfoMgr = ref(false)
        const authGroupId = ref('')
        const allowModifyPassword = ref('')
        const userType = ref('')
        const defaultPwd = ref(false)
        const loginCheck = ref('')
        const isChangedPwd = ref(false)
        const pwdSaftyStrength = ref(0)
        const pwdExpired = ref(false)
        const calendarType = ref('Gregorian')
        const authEffective = ref(false)
        const authMask = ref(0)
        const csvDeviceName = ref('')
        const sn = ref('')
        const advanceRecModeId = ref('')
        const defaultStreamType = ref('')

        const p2pSessionId = ref<null | string>(null)
        const authCodeIndex = ref('')
        const refreshLoginPage = ref(false)

        let hostname = window.location.hostname
        // ie8以上的版本ipv6的ip带括号，导致请求不到视频
        if (hostname.indexOf('[') !== -1) {
            hostname = hostname.substring(1, hostname.length - 1)
        }

        const serverIp = ref(import.meta.env.VITE_APP_IP || hostname)

        /**
         * 为了P2P仅部署一套代码减少发布件，将P2P版本、设备登录方式通过动态方式进行获取
         * P2P公共代码逻辑里存储了相关信息到sessionStorage中，若没有这些信息则采取默认的值
         */
        const appType = ref<'P2P' | 'STANDARD'>(Number(getCookie(LocalCacheKey.KEY_IS_P2P)) === 1 ? 'P2P' : 'STANDARD')

        const p2pVersion = ref<'1.0' | '2.0'>(sessionStorage.getItem(LocalCacheKey.KEY_P2P_VERSION) === '1.0' ? '1.0' : '2.0')

        /**
         * @description 加密本地存储用户信息
         * @param authInfo
         */
        const setAuthInfo = (authInfo: string) => {
            if (!unmask.value) return
            const unmaskNum = unmask.value
            const userInfoMaskedArr = []
            for (let i = 0; i < authInfo.length; i++) {
                userInfoMaskedArr.push(authInfo.charCodeAt(i) ^ unmaskNum)
            }
            const userInfoMasked = userInfoMaskedArr.join(' ')
            auInfo_N9K.value = base64Encode(userInfoMasked)
        }

        /**
         * @description 获取AuthInfo
         * @returns {string[]}
         */
        const getAuthInfo = () => {
            if (!auInfo_N9K.value) return null
            if (!unmask.value) return null
            const unmaskNum = unmask.value
            const authorizationBasic = auInfo_N9K.value.replace(/\"/g, '')
            const userInfoMasked = base64Decode(authorizationBasic)
            const userInfoMaskedArr = userInfoMasked.split(' ').map((item) => Number(item))
            const userInfoArr = []
            for (let i = 0; i < userInfoMaskedArr.length; i++) {
                userInfoArr.push(String.fromCharCode(userInfoMaskedArr[i] ^ unmaskNum))
            }
            return userInfoArr.join('').split(':')
        }

        /**
         * @description 初始化权限
         * @param {XMLQuery} $
         */
        const initSystemAuth = ($: XMLQuery) => {
            authMask.value = 0
            SYSTEM_AUTH_LIST.forEach((element, index) => {
                if ($(`content/systemAuth/${element}`).text().toBoolean()) {
                    authMask.value += Math.pow(2, index)
                }
            })
            authEffective.value = $('content/authEffective').text().toBoolean()
        }

        /**
         * @description 判断是否有某个权限（可选值见顶部systemAuthList）
         * @param {strng} authName
         * @returns {boolean}
         */
        const hasAuth = (authName: string) => {
            if (!authEffective.value) {
                return true
            }
            const authIndex = SYSTEM_AUTH_LIST.indexOf(authName)
            return authIndex !== -1 && (authMask.value & Math.pow(2, authIndex)) !== 0
        }

        /**
         * @description reqLogin更新用户会话信息
         * @param loginResult
         */
        const updataByReqLogin = (loginResult: XMLDocument | Element) => {
            const $ = queryXml(loginResult)

            let _sessionId = $('content/sessionId').text()
            nonce.value = $('content/nonce').text()
            token.value = $('content/token').text()
            if (_sessionId.indexOf('{') !== -1 || _sessionId.lastIndexOf('}') !== -1) {
                _sessionId = _sessionId.substring(_sessionId.indexOf('{') + 1, _sessionId.indexOf('}'))
            }
            sessionId.value = _sessionId
            setCookie('sessionId', sessionId.value)
        }

        /**
         * @description doLogin后更新用户会话信息
         * @param loginResult
         * @param loginReqData
         * @param loginFormData
         */
        async function updateByLogin(loginType: 'P2P', loginResult: Element | XMLDocument): Promise<void>
        async function updateByLogin(loginType: 'STANDARD', loginResult: Element | XMLDocument, loginReqData: LoginReqData, loginFormData: LoginForm): Promise<void>
        async function updateByLogin(loginType: 'P2P' | 'STANDARD', loginResult: Element | XMLDocument, loginReqData?: LoginReqData, loginFormData?: LoginForm): Promise<void> {
            const $ = queryXml(loginResult)

            if (loginType === 'STANDARD') {
                calendarType.value = loginFormData!.calendarType
                //加盐存储用户名的掩码，用于解决右上角显示用户名问题
                unmask.value = Math.floor(Math.random() * 10000)
                setAuthInfo(loginReqData!.userName + ':')

                const ciphertext = $('content/sessionKey').text()
                const aesKey = loginReqData!.passwordMd5
                const plaintext = AES_decrypt(ciphertext, aesKey)

                sesionKey.value = plaintext
                securityVer.value = $('content/securityVer').text()
                userId.value = $('content/userId').text()
                facePersonnalInfoMgr.value = $('content/systemAuth/facePersonnalInfoMgr').text().toBoolean()
                authGroupId.value = $('content/authGroupId').text()
                allowModifyPassword.value = $('content/modifyPassword').text()
                userType.value = $('content/userType').text()

                const resetPassword = $('content/resetInfo').text()
                if (userType.value === USER_TYPE_DEFAULT_ADMIN && MD5_encrypt(loginFormData!.password) == resetPassword) {
                    defaultPwd.value = true
                } else {
                    defaultPwd.value = false
                }

                loginCheck.value = 'check'
                isChangedPwd.value = false
                pwdSaftyStrength.value = getPwdSaftyStrength(loginFormData!.password)
                pwdExpired.value = $('content/passwordExpired').text() === 'true'
            }

            initSystemAuth($)

            await cababilityStore.updateCabability()

            // 从设备基本信息获取名称
            await queryBasicCfg().then((result) => {
                const $ = queryXml(result)
                csvDeviceName.value = $('content/name').text()
                const CustomerID = $('content/CustomerID').text()
                cababilityStore.CustomerID = Number(CustomerID)
                cababilityStore.AISwitch = $('content/AISwitch').text() ? $('content/AISwitch').text().toBoolean() : undefined
                cababilityStore.productModel = $('content/productModel').text()
            })

            // 从磁盘信息获取Raid
            await queryDiskMode().then((result) => {
                const $ = queryXml(result)
                cababilityStore.isUseRaid = $('content/diskMode/isUseRaid').text().toBoolean()
            })

            await dateTime.getTimeConfig(true)

            generateAsyncRoutes()
        }

        /**
         * @description P2P登录情况下，从SessionStorage中获取auInfo_N9K、unmask、sn等信息
         */
        const getP2PSessionInfo = () => {
            auInfo_N9K.value = sessionStorage.getItem(LocalCacheKey.KEY_AU_INFO_N9K) || ''
            unmask.value = Number(sessionStorage.getItem(LocalCacheKey.KEY_UNMASK))
            sn.value = sessionStorage.getItem(LocalCacheKey.KEY_SN) || ''
        }

        /**
         * @description 用户登出时，清理Session
         */
        const clearSession = () => {
            auInfo_N9K.value = ''
            unmask.value = 0
            authGroupId.value = ''
            authMask.value = 0
            userId.value = ''
            authEffective.value = false
            sessionId.value = ''
            token.value = ''
            defaultPwd.value = false
            isChangedPwd.value = false
            pwdSaftyStrength.value = 0
            pwdExpired.value = false
            refreshLoginPage.value = false
            p2pSessionId.value = null
            sessionStorage.removeItem(LocalCacheKey.KEY_AU_INFO_N9K)
            sessionStorage.removeItem(LocalCacheKey.KEY_UNMASK)
            sessionStorage.removeItem(LocalCacheKey.KEY_SN)
        }

        return {
            sessionId,
            token,
            nonce,
            userName,
            userId,
            unmask,
            auInfo_N9K,
            sesionKey,
            securityVer,
            facePersonnalInfoMgr,
            authGroupId,
            allowModifyPassword,
            userType,
            defaultPwd,
            loginCheck,
            isChangedPwd,
            pwdSaftyStrength,
            pwdExpired,
            serverIp,
            appType,
            p2pVersion,
            calendarType,
            csvDeviceName,
            hasAuth,
            getAuthInfo,
            updataByReqLogin,
            updateByLogin,
            sn,
            advanceRecModeId,
            authEffective,
            defaultStreamType,
            p2pSessionId,
            authCodeIndex,
            getP2PSessionInfo,
            clearSession,
            refreshLoginPage,
        }
    },
    {
        persist: true,
    },
)
