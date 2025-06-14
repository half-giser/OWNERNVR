/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-23 16:32:45
 * @Description: 用户会话信息
 */
import { type XMLQuery } from '@/utils/xmlParse'
import { generateAsyncRoutes } from '@/router'

export const useUserSessionStore = defineStore(
    'userSession',
    () => {
        const cababilityStore = useCababilityStore()
        const layoutStore = useLayoutStore()

        const sessionId = ref('')
        const token = ref('')
        const nonce = ref('')
        const userName = ref('')
        const userId = ref('')
        const unmask = ref(0)
        const auInfo_N9K = ref('')
        const dualAuth_N9K = ref('')
        const daTokenLoginAuth = ref('')
        const sesionKey = ref('')
        const securityVer = ref('')
        const facePersonnalInfoMgr = ref(false)
        const authGroupId = ref('')
        const allowModifyPassword = ref(false)
        const userType = ref('')
        const defaultPwd = ref(false)
        const loginCheck = ref(false)
        const isChangedPwd = ref(false)
        const pwdSaftyStrength = ref(0)
        const pwdExpired = ref(false)
        const calendarType = ref('Gregorian')
        const authEffective = ref(false)
        const authMask = ref(0)
        const csvDeviceName = ref('')
        const sn = ref('')
        const defaultStreamType = ref('')
        const urlLoginAuth = ref('')

        const p2pSessionId = ref<null | string>(null)
        const authCodeIndex = ref('')
        const refreshLoginPage = ref(false)

        let hostname = window.location.hostname
        // ie8以上的版本ipv6的ip带括号，导致请求不到视频
        if (hostname.indexOf('[') !== -1) {
            hostname = hostname.slice(1, -1)
        }

        const serverIp = ref(import.meta.env.VITE_APP_IP || hostname)

        /**
         * 为了P2P仅部署一套代码减少发布件，将P2P版本、设备登录方式通过动态方式进行获取
         * P2P公共代码逻辑里存储了相关信息到sessionStorage中，若没有这些信息则采取默认的值
         */
        const appType = ref<'P2P' | 'STANDARD'>(Number(getCookie(LocalCacheKey.KEY_IS_P2P)) === 1 || import.meta.env.VITE_P2P_IS_TEST === 'true' ? 'P2P' : 'STANDARD')

        const p2pVersion = ref<'1.0' | '2.0'>(sessionStorage.getItem(LocalCacheKey.KEY_P2P_VERSION) === '1.0' ? '1.0' : '2.0')

        /**
         * @description 获取AuthInfo
         * @returns {string[]}
         */
        const getAuthInfo = () => {
            if (import.meta.env.VITE_P2P_IS_TEST === 'true') return [import.meta.env.VITE_P2P_ADMIN, import.meta.env.VITE_P2P_PASSWORD, import.meta.env.VITE_P2P_SN]
            if (!auInfo_N9K.value) return null
            if (!unmask.value) return null

            const auInfo_N9K_New = JSON.parse(auInfo_N9K.value) as { username: string; password: string; sn: string }

            const userInfoArr: string[] = []
            const auInfo_username = decryptUnicode(auInfo_N9K_New.username, unmask.value)
            if (auInfo_username && auInfo_username !== 'null') {
                userInfoArr.push(auInfo_username)
            }

            const auInfo_password = decryptUnicode(auInfo_N9K_New.password, unmask.value)
            if (auInfo_password && auInfo_password !== 'null') {
                userInfoArr.push(auInfo_password)
            }

            const auInfo_sn = decryptUnicode(auInfo_N9K_New.sn, unmask.value)
            if (auInfo_sn && auInfo_sn !== 'null') {
                userInfoArr.push(auInfo_sn)
            }

            userName.value = auInfo_username

            return userInfoArr
        }

        // 获取双重认证信息
        const getDualAuthInfo = () => {
            if (!dualAuth_N9K.value) {
                return null
            }

            if (!unmask.value) {
                return
            }

            const info = JSON.parse(dualAuth_N9K.value) as { username: string; password: string }
            const dualAuth_username = decryptUnicode(info.username, unmask.value)
            const dualAuth_password = decryptUnicode(info.password, unmask.value)

            return [dualAuth_username, dualAuth_password]
        }

        // 设置双重认证信息
        const setDualAuthInfo = (dualAuthInfo: { username: string; password: string }) => {
            if (!unmask.value) {
                return
            }

            const dualAuth_username = setUnicode(dualAuthInfo.username, unmask.value)
            const dualAuth_password = setUnicode(dualAuthInfo.password, unmask.value)
            dualAuth_N9K.value = JSON.stringify({
                username: dualAuth_username,
                password: dualAuth_password,
            })
            sessionStorage.setItem('dualAuth_N9K', dualAuth_N9K.value)
        }

        /**
         * @description 初始化权限
         * @param {XMLQuery} $
         */
        const initSystemAuth = ($: XMLQuery) => {
            authMask.value = 0
            SYSTEM_AUTH_LIST.forEach((element, index) => {
                if ($(`content/systemAuth/${element}`).text().bool()) {
                    authMask.value += Math.pow(2, index)
                }
            })
            authEffective.value = $('content/authEffective').text().bool()
        }

        /**
         * @description 判断是否有某个权限（可选值见顶部systemAuthList）
         * @param {strng} authName
         * @returns {boolean}
         */
        const hasAuth = (authName: string) => {
            const mask = authMask.value
            if (!authEffective.value) {
                return true
            }
            const authIndex = SYSTEM_AUTH_LIST.indexOf(authName)
            return authIndex !== -1 && (mask & Math.pow(2, authIndex)) !== 0
        }

        /**
         * @description reqLogin更新用户会话信息
         * @param loginResult
         */
        const updataByReqLogin = (loginResult: XMLDocument | Element) => {
            const $ = queryXml(loginResult)

            let _sessionId = $('content/sessionId').text()
            nonce.value = $('content/nonce').text()
            // token.value = $('content/token').text()
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
        // async function updateByLogin(loginType: 'P2P', loginResult: Element | XMLDocument): Promise<void>
        // async function updateByLogin(loginType: 'STANDARD', loginResult: Element | XMLDocument, loginFormData: UserLoginForm): Promise<void>
        async function updateByLogin(loginResult: Element | XMLDocument, loginFormData: UserLoginForm): Promise<void> {
            const $ = queryXml(loginResult)

            // if (loginType === 'STANDARD') {
            calendarType.value = loginFormData.calendarType
            userName.value = loginFormData.userName
            // 加盐存储用户名的掩码，用于解决右上角显示用户名问题
            unmask.value = Math.floor(Math.random() * 10000)
            auInfo_N9K.value = JSON.stringify({
                username: setUnicode(loginFormData.userName, unmask.value),
                password: '',
                sn: '',
            })

            const ciphertext = $('content/sessionKey').text()
            // const aesKey = loginReqData!.passwordMd5
            // const plaintext = AES_decrypt(ciphertext, aesKey)
            const aesKey = RSA_PRIVATE_KEY
            const plaintext = RSA_decrypt(aesKey, ciphertext) + ''
            sesionKey.value = plaintext
            token.value = $('content/token').text()
            securityVer.value = $('content/securityVer').text()
            userId.value = $('content/userId').text()
            facePersonnalInfoMgr.value = $('content/systemAuth/facePersonnalInfoMgr').text().bool()
            authGroupId.value = $('content/authGroupId').text()
            allowModifyPassword.value = $('content/modifyPassword').text().bool()
            userType.value = $('content/userType').text()

            const resetPassword = $('content/resetInfo').text()
            if (userType.value === USER_TYPE_DEFAULT_ADMIN && MD5_encrypt(loginFormData.password) === resetPassword) {
                defaultPwd.value = true
            } else {
                defaultPwd.value = false
            }

            loginCheck.value = false
            isChangedPwd.value = false
            layoutStore.isPwdChecked = false
            pwdSaftyStrength.value = getPwdSaftyStrength(loginFormData.password)
            pwdExpired.value = $('content/passwordExpired').text().bool()
            // }

            initSystemAuth($)

            await cababilityStore.updateCabability()

            // 从设备基本信息获取名称
            const $basic = await cababilityStore.updateBaseConfig()
            csvDeviceName.value = $basic('content/name').text()

            // 从磁盘信息获取Raid
            await cababilityStore.updateDiskMode()
            await cababilityStore.updateHotStandbyMode()

            generateAsyncRoutes()
        }

        /**
         * @description P2P登录情况下，从SessionStorage中获取auInfo_N9K、unmask、sn等信息
         */
        const getP2PSessionInfo = () => {
            auInfo_N9K.value = sessionStorage.getItem(LocalCacheKey.KEY_AU_INFO_N9K) || ''
            unmask.value = Number(sessionStorage.getItem(LocalCacheKey.KEY_UNMASK))
            sn.value = sessionStorage.getItem(LocalCacheKey.KEY_SN) || ''
            dualAuth_N9K.value = sessionStorage.getItem(LocalCacheKey.KEY_DUAL_AUTH_N9K) || ''
            calendarType.value = sessionStorage.getItem(LocalCacheKey.KEY_CALENDAR_TYPE) || 'Gregorian'
            daTokenLoginAuth.value = sessionStorage.getItem(LocalCacheKey.KEY_DA_TOKEN_LOGIN_AUTH) || ''
        }

        /**
         * @description 用户登出时，清理Session
         */
        const clearSession = () => {
            auInfo_N9K.value = ''
            dualAuth_N9K.value = ''
            daTokenLoginAuth.value = ''
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
            layoutStore.isPwdChecked = false
            layoutStore.liveLastChlList = []
            layoutStore.liveLastSegNum = 1

            sessionStorage.removeItem(LocalCacheKey.KEY_AU_INFO_N9K)
            sessionStorage.removeItem(LocalCacheKey.KEY_DUAL_AUTH_N9K)
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
            dualAuth_N9K,
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
            authEffective,
            defaultStreamType,
            p2pSessionId,
            authCodeIndex,
            getP2PSessionInfo,
            clearSession,
            refreshLoginPage,
            getDualAuthInfo,
            setDualAuthInfo,
            daTokenLoginAuth,
            urlLoginAuth,
            authMask,
        }
    },
    {
        persist: true,
    },
)
