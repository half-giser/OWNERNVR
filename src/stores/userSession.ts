/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-23 16:32:45
 * @Description: 用户会话信息
 */
import { type XmlResult } from '@/utils/xmlParse'
import { type LoginForm, type LoginReqData } from '@/types/apiType/user'

export const useUserSessionStore = defineStore(
    'userSession',
    () => {
        const sessionId = ref('')
        const token = ref('')
        const nonce = ref('')
        const userName = ref('')
        const userId = ref('')
        const unmask = ref(0)
        const auInfo_N9K = ref('')
        const sesionKey = ref('')
        const securityVer = ref('')
        const facePersonnalInfoMgr = ref('')
        const authGroupId = ref('')
        const allowModifyPassword = ref('')
        const userType = ref('')
        const defaultPwd = ref(false)
        const loginCheck = ref('')
        const isChangedPwd = ref(false)
        const ignoreAIJudge = ref('')
        const backChlId = ref('')
        const pwdSaftyStrength = ref(0)
        const pwdExpired = ref(false)
        const analogChlCount = ref(0)
        const ipChlMaxCount = ref(0)
        const supportPOS = ref(false)
        const calendarType = ref('')
        const authEffective = ref(false)
        const authMask = ref(0)
        const csvDeviceName = ref('')
        const showPluginNoResponse = ref('')
        const cababilityStore = useCababilityStore()
        const sn = ref('')
        const advanceRecModeId = ref('')

        /**
         * 加密本地存储用户信息
         * @param authInfo
         * @returns
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

        // 初始化权限
        const initSystemAuth = ($: (path: string) => XmlResult) => {
            authMask.value = 0
            SYSTEM_AUTH_LIST.forEach((element, index) => {
                if ($(`content/systemAuth/${element}`).text().toBoolean()) {
                    authMask.value += Math.pow(2, index)
                }
            })
            authEffective.value = $('content/authEffective').text().toBoolean()
        }

        /**
         * 判断是否有某个权限（可选值见顶部systemAuthList）
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
         * reqLogin更新用户会话信息
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
         * doLogin后更新用户会话信息
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
                facePersonnalInfoMgr.value = $('content/systemAuth/facePersonnalInfoMgr').text()
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
                ignoreAIJudge.value = ''
                backChlId.value = ''
                pwdSaftyStrength.value = getPwdSaftyStrength(loginFormData!.password)
                pwdExpired.value = $('content/passwordExpired').text() === 'true'
            }

            initSystemAuth($)

            await cababilityStore.updateCabability()

            // 从设备基本信息获取名称
            await queryBasicCfg(getXmlWrapData('')).then((result) => {
                const $ = queryXml(result)
                csvDeviceName.value = $('content/name').text()
                const CustomerID = $('content/CustomerID').text()
                //CustomerID为100代表inw48客户,要求隐藏智能侦测,包括人脸报警
                cababilityStore.isInw48 = CustomerID == '100'
                cababilityStore.CustomerID = Number(CustomerID)
            })

            // 从磁盘信息获取Raid
            await queryDiskMode().then((result) => {
                const $ = queryXml(result)
                cababilityStore.isUseRaid = $('content/diskMode/isUseRaid').text().toBoolean()
            })
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
            ignoreAIJudge,
            backChlId,
            pwdSaftyStrength,
            pwdExpired,
            analogChlCount,
            ipChlMaxCount,
            supportPOS,
            calendarType,
            csvDeviceName,
            showPluginNoResponse,
            hasAuth,
            getAuthInfo,
            updataByReqLogin,
            updateByLogin,
            sn,
            advanceRecModeId,
        }
    },
    {
        persist: true,
    },
)
