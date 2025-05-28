/*
 * @Date: 2025-04-30 09:48:55
 * @Description: URL跳转自动登录
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import progress from '@bassist/progress'

export default defineComponent({
    setup() {
        const userSession = useUserSessionStore()
        const router = useRouter()
        const plugin = usePlugin()

        const formData = ref(new UserLoginForm())
        const reqFormData = ref(new UserLoginReqData())

        let navigateTo = '/live'

        const fnReqLogin = async () => {
            progress.start()
            try {
                const result = await reqLogin()
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    userSession.updataByReqLogin(result)
                    reqFormData.value = new UserLoginReqData()
                    reqFormData.value.userName = formData.value.userName

                    const md5Pwd = MD5_encrypt(formData.value.password)
                    const nonce = userSession.nonce ? userSession.nonce : ''
                    reqFormData.value.password = sha512_encrypt(`${md5Pwd}#${nonce}#${RSA_PUBLIC_KEY.replace(/\r/g, '')}`)
                    reqFormData.value.rsaPublic = RSA_PUBLIC_KEY

                    return reqFormData.value
                } else {
                    const errorCode = $('errorCode').text()
                    throw new Error(errorCode)
                }
            } catch (e) {
                throw new Error('')
            }
        }

        const fnDoLogin = async (reqData: UserLoginReqData) => {
            const sendXml = rawXml`
                <content>
                    <userName>${wrapCDATA(reqData.userName)}</userName>
                    <password>${wrapCDATA(reqData.password)}</password>
                    <rsaPublic>${reqData.rsaPublic}</rsaPublic>
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
                    throw new Error(errorCode + '')
                }
            } catch (e) {
                throw new Error('')
            }
        }

        /**
         * @description 登录成功后处理
         */
        const handleLoginSuccess = () => {
            // UI1-D / UI1-G 登录默认画质
            if (import.meta.env.VITE_UI_TYPE === 'UI1-D' || import.meta.env.VITE_UI_TYPE === 'UI1-G') {
                userSession.defaultStreamType = 'sub'
            }
            plugin.DisposePlugin()
            plugin.StartV2Process()
            router.push(navigateTo)
        }

        onMounted(async () => {
            const auInfo = userSession.sessionId
            if (auInfo) {
                router.push(navigateTo)
                return
            }

            try {
                const userInfo = JSON.parse(userSession.urlLoginAuth)
                if (userInfo) {
                    formData.value.userName = userInfo.userName
                    formData.value.password = userInfo.password
                    formData.value.calendarType = 'Gregorian'
                    if (userInfo.navigateTo) {
                        navigateTo = '/' + userInfo.navigateTo
                    }

                    const reqData = await fnReqLogin()
                    const result = await fnDoLogin(reqData)
                    // doLogin后更新用户会话信息
                    await userSession.updateByLogin(result, formData.value)
                    userSession.urlLoginAuth = ''
                    handleLoginSuccess()
                } else {
                    router.push('/login')
                }
            } catch (e) {
                progress.done()
                router.push('/login')
            }
        })

        return {}
    },
})
