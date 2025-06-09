/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-03 11:57:07
 * @Description: OCX插件模块
 * 原项目中MAC插件和TimeSliderPlugin相关逻辑不保留
 */
import { type XMLQuery } from '../xmlParse'
import { generateAsyncRoutes } from '../../router'

type PluginStatus = 'Unloaded' | 'Loaded' | 'InitialComplete' | 'Connected' | 'Disconnected' | 'Reconnecting'
type PluginSizeMode = 'relativeToScreen' | 'relativeToDom' | 'relativeToBrowser' | 'absolute'

/**
 * @description 比较插件版本
 * @param {string} ver1
 * @param {string} ver2
 * @returns {Number}
 */
const compareOcxVersion = (ver1: string, ver2: string) => {
    const var1Arr = ver1.split(',')
    const var2Arr = ver2.split(',')
    for (let i = 0; i < var1Arr.length; i++) {
        if (Number(var1Arr[i]) > Number(var2Arr[i])) {
            return 1
        } else if (Number(var1Arr[i]) === Number(var2Arr[i])) {
            continue
        } else {
            return -1
        }
    }
    return 0
}

const loadScript = async (src: string) => {
    return new Promise((resolve) => {
        const script = document.createElement('script')
        script.onload = () => {
            resolve(void 0)
        }
        script.src = src
        document.body.appendChild(script)
    })
}

const getSingletonPlugin = () => {
    const RELATIVE_TO_SCREEN = 'relativeToScreen' // relativeToScreen：显示器左上角为0,0
    const RELATIVE_TO_DOM = 'relativeToDom' // relativeToBrowser: 浏览器左上角为0, 0;
    const RELATIVE_TO_BROWSER = 'relativeToBrowser' // relativeToDom：文档流里左上角为0, 0;

    const PluginSizeModeMapping: Record<BrowserType, PluginSizeMode> = {
        ie: RELATIVE_TO_SCREEN,
        lowEdge: RELATIVE_TO_SCREEN,
        firefox: RELATIVE_TO_BROWSER,
        unknow: RELATIVE_TO_DOM,
        opera: RELATIVE_TO_DOM,
        edge: RELATIVE_TO_DOM,
        chrome: RELATIVE_TO_DOM,
        safari: RELATIVE_TO_DOM,
    }

    const pluginStore = usePluginStore()
    const p2pTransport = useP2PTransport()
    const p2pLang = useP2PLang()
    const lang = useLangStore()
    const { Translate, getLangTypes, getLangItems } = lang
    const router = useRouter()
    const userSession = useUserSessionStore()
    const layoutStore = useLayoutStore()
    const route = useRoute()

    // 通知相关
    const isPluginAvailable = ref(true) //插件是否有效
    const pluginNoticeHtml = ref('')
    const pluginDownloadUrl = ref('')
    const pluginNoticeContainer = ref('')
    const isInstallPlugin = ref(false) // 插件已安装运行标记

    let videoPlugin: ReturnType<typeof WebsocketPlugin> | null = null // | EmbedPlugin //主视频插件
    let videoPluginStatus: PluginStatus = 'Unloaded' // Unloaded, Loaded, InitialComplete, Connected, Disconnected, Reconnecting

    const VideoPluginReconnectTimeout = 5000 // 断开重新连接时间
    let VideoPluginReconnectTimeoutId: NodeJS.Timeout | null = null // 重新连接超时ID

    const VideoPluginNotifyEmitter = CreateEvent()

    // 对支持wasm的浏览器环境做插件调用代码的兼容处理，避免调用插件的代码报错
    const FakePluginForWasm = {
        fake: true,
        queryInfoMap: {} as Record<number, (str: string) => void>,
        ExecuteCmd: () => {},
        QueryInfo: () => {},
        Destroy: () => {},
    }

    // 回调函数
    let reconCallBack = () => {} // 重连回调函数
    let p2pLoginTypeCallback: ((loginType: string, authCodeIndex: string) => void) | null = null
    let loginErrorCallback: ((code?: number, desc?: string) => void) | null = null
    let p2pDualAuthLoginPop: ReturnType<typeof openP2PDualAuthLoginPop> | null = null

    const systemInfo = getSystemInfo()
    const browserInfo = getBrowserInfo()

    const backupTask = useOcxBackUp((str) => {
        getVideoPlugin().ExecuteCmd(str)
    })

    VideoPluginNotifyEmitter.addListener(backupTask.notify)

    /**
     * @description 插件需更新
     * @param {string} downLoadUrl
     */
    const getPluginUpdateNotice = () => {
        pluginNoticeHtml.value = 'IDCS_PLUGIN_VERSION_UPDATE'
    }

    /**
     * @description Windows无安装插件
     * @param {string} downLoadUrl
     */
    const getPluginNotice = () => {
        pluginNoticeHtml.value = 'IDCS_NO_PLUGIN_FOR_WINDOWS'
    }

    /**
     * @description 设置通知在哪显示
     * @param {string} selector 容器Selector
     */
    const setPluginNotice = (selector: string = '') => {
        pluginNoticeContainer.value = selector
    }

    /**
     * @description 视频插件通知回调
     * Firefox，Chrome中，回调函数名的字符串中不能出现“.”,否则插件无法识别，不能正确回调
     * @param {string} strXMLFormat
     */
    const VideoPluginNotify = async (strXMLFormat: string | ArrayBuffer | Blob) => {
        // P2P http/ws消息通信
        if (isBuffer(strXMLFormat)) {
            p2pTransport.SplitP2PResponse(strXMLFormat as Blob, (p2pObj) => {
                const transType = p2pObj.transType
                const identify = p2pObj.identify
                const buffer = p2pObj.buffer
                if (transType === 'http') {
                    let xmlStr = Uint8ArrayToStr(new Uint8Array(buffer))
                    // NTA1-3903: 兼容协议报文为空的情况
                    if (!xmlStr.match(/<\?xml([\s\S]*)<\/response>/)) {
                        xmlStr = rawXml`
                            <?xml version="1.0" encoding="UTF-8"?>
                            <response version="1.0" cmdId="" cmdUrl="">
                                <status>fail</status>
                                <content></content>
                            </response>
                        `
                    }
                    xmlStr = xmlStr.match(/<\?xml([\s\S]*)<\/response>/)![0]
                    const $xmlDoc = XMLStr2XMLDoc(xmlStr)
                    const $ = queryXml($xmlDoc)
                    const url = $('response').attr('cmdUrl')
                    console.log('%cresponse--' + url, 'color: red', $xmlDoc)
                    CMD_QUEUE.resolve($('response')[0].element)
                } else if (transType === 'websocket') {
                    VideoPluginNotifyEmitter.emit(identify, buffer)
                }
            })

            return
        }

        const $ = queryXml(XMLStr2XMLDoc(strXMLFormat as string))
        const funcName = $('/response').attr('reqId').num()
        const stateType = $('statenotify').attr('type')

        if ($('response').length && funcName) {
            ;(getVideoPlugin() as ReturnType<typeof WebsocketPlugin>).queryInfoMap[funcName](strXMLFormat as string)
            return
        }

        if ($('statenotify[@target="dateCtrl"]').length) {
            return
        }

        //连接成功 / 插件token和sessionId认证成功
        if (stateType === 'connectstate' || stateType === 'AuthenticationState') {
            let status = ''
            if ($('statenotify/status').length) {
                status = $('statenotify/status').text().trim()
            } else {
                status = $('statenotify').text().trim()
            }

            if (status === 'success') {
                pluginStore.ready = true
                setVideoPluginStatus('Connected')
                if (getIsReconn()) {
                    closeLoading()
                    const callBack = getReconnCallBack()
                    callBack && callBack()
                    setIsReconn(false)
                    setReconnCallBack(() => {})
                } else {
                    if (userSession.appType === 'P2P') {
                        closeLoading()

                        if (p2pDualAuthLoginPop !== null) {
                            p2pDualAuthLoginPop.close()
                        }

                        if (VideoPluginReconnectTimeoutId !== null) {
                            // 重新连接成功，隐藏“加载中”状态
                            clearTimeout(VideoPluginReconnectTimeoutId)
                            VideoPluginReconnectTimeoutId = null
                        } else {
                            // 初始化多语言翻译模块
                            await getLangTypes()
                            await getLangItems()

                            delCookie('ec')
                            delCookie('em')

                            //执行标准客户端的登录流程
                            const userInfoArr = userSession.getAuthInfo()!
                            await videoPluginLoadLang()

                            userSession.token = $('statenotify/token').text()
                            userSession.sessionId = $('statenotify/sessionId').text()
                            const result = await getSessionInfo()

                            // const result = await doLogin('')
                            if (queryXml(result)('status').text() === 'success') {
                                if (userInfoArr) {
                                    setCookie('lastSN', userInfoArr[2], 36500)
                                }
                                await userSession.updateByLogin(result, {
                                    userName: userInfoArr[0],
                                    password: userInfoArr[1],
                                    calendarType: userSession.calendarType,
                                })
                                generateAsyncRoutes()
                                const p2pDafultRoute = router.currentRoute.value.path === '/' ? '/live' : router.currentRoute.value.path
                                router.replace(p2pDafultRoute)
                            } else {
                                Logout()
                            }
                            layoutStore.isInitial = true
                        }
                    }
                }
            } else {
                if (userSession.appType === 'P2P') {
                    const errorCode = $('statenotify/errorCode').text().num()
                    const errorDescription = $('statenotify/errorDescription').text()
                    const curRoutUrl = route.path

                    if (userSession.daTokenLoginAuth) {
                        // handleDATokenError(daTokenLoginAuth, errorCode, errorDescription)
                        /**
                         * 处理DAToken登录失败的情形，跳转回云平台网站
                         * 1. 536870943 插件端校验DAToken1 和 DAToken2 失败的情况
                         * 2. 536871086 daToken过期、错误情况下，
                         * @param {String} daTokenLoginAuth
                         */
                        const errorCodeMap: Record<number, string> = {
                            536870935: 'IDCS_LOGIN_FAIL_REASON_DEV_OFFLINE', // dev connect fail
                            536870936: 'IDCS_DEVICE_NOT_BOUND', // device no bound
                            536870943: 'IDCS_INVALID_PARAMETER', // Invalid param
                            536870947: 'IDCS_LOGIN_FAIL_REASON_U_P_ERROR', // user name does not exist
                            536870948: 'IDCS_LOGIN_FAIL_REASON_U_P_ERROR', // Password error
                            536870951: 'IDCS_DEVICE_LOCKED', // user lock
                            536870953: 'IDCS_LOGIN_FAIL_USER_LIMITED_TELNET', // no remote auth
                            536871086: 'IDCS_INVALID_TOKEN', // Invalid Token
                        }
                        const errorMsg = errorCodeMap[errorCode] ? p2pLang.Translate(errorCodeMap[errorCode]) : ''
                        const prefixMsg = [536870936, 536870943, 536870951, 536871086].includes(errorCode) ? p2pLang.Translate('IDCS_LOGIN_FAILED') + ': ' : ''
                        const errorInfo = prefixMsg + errorMsg || p2pLang.Translate('IDCS_LOGIN_FAILED')
                        openMessageBox(errorInfo).then(() => {
                            const daTokenLoginAuth = JSON.parse(userSession.daTokenLoginAuth)
                            const cloudUrl = daTokenLoginAuth.src || ''
                            userSession.clearSession()
                            if (cloudUrl) {
                                window.location.href = cloudUrl
                            } else {
                                goToIndex(errorCode, errorDescription)
                            }
                        })
                        return
                    }

                    switch (errorCode) {
                        //SN掉线，重新连接
                        case ErrorCode.USER_ERROR_NODE_NET_DISCONNECT:
                            setVideoPluginStatus('Reconnecting')
                            openLoading(p2pLang.Translate('IDCS_LOADING'))
                            VideoPluginReconnectTimeoutId = setTimeout(() => {
                                videoPluginLogin()
                            }, VideoPluginReconnectTimeout)
                            break
                        // 设备已被绑定，需要授权码方式登录
                        case 536871080:
                            closeLoading()
                            const authCodeIndex = errorDescription
                            userSession.authCodeIndex = authCodeIndex
                            if (curRoutUrl.includes('authCodeLogin')) {
                                execLoginTypeCallback(P2P_ACCESS_TYPE_AUTHCODE_LOGIN, authCodeIndex)
                            } else {
                                layoutStore.isInitial = true
                                router.push('/authCodeLogin')
                            }
                            break
                        // 登录用户需要双重认证
                        case 536871090:
                            closeLoading()
                            p2pDualAuthLoginPop = openP2PDualAuthLoginPop({
                                confirm(data) {
                                    openLoading(p2pLang.Translate('IDCS_LOADING'))
                                    // 双重认证登录(p2p插件使用明文传输，并且双重认证后p2p界面刷新逻辑保持跟账号密码登录后刷新逻辑一致（账密登录不返回sessionid，刷新界面仍然是通过账密登录，目前只有授权码登录后才会返回sessionid）)
                                    userSession.setDualAuthInfo(data)
                                    p2pDualAuthLogin()
                                },
                                close() {
                                    p2pDualAuthLoginPop = null
                                },
                                destroy() {
                                    p2pDualAuthLoginPop?.close()
                                    goToIndex()
                                },
                            })
                            break
                        case ErrorCode.USER_ERROR_NO_USER:
                        case ErrorCode.USER_ERROR_PWD_ERR:
                            // 授权码错误/双重认证用户名或密码错误
                            closeLoading()
                            if (curRoutUrl.includes('authCodeLogin')) {
                                execLoginErrorCallback(errorCode, errorDescription)
                            } else {
                                if (!!p2pDualAuthLoginPop) {
                                    p2pDualAuthLoginPop.setErrorMsg(p2pLang.Translate('IDCS_LOGIN_FAIL_REASON_U_P_ERROR'))
                                } else {
                                    goToIndex(errorCode, errorDescription)
                                }
                            }
                            break
                        // 不在排程内
                        case 536871089:
                            closeLoading()
                            if (!!p2pDualAuthLoginPop) {
                                p2pDualAuthLoginPop.setErrorMsg(p2pLang.Translate('IDCS_LOGIN_NOT_IN_SCHEDULE'))
                            } else {
                                goToIndex(errorCode, errorDescription)
                            }
                            break
                        default:
                            if (curRoutUrl.includes('authCodeLogin')) {
                                execLoginErrorCallback(errorCode, errorDescription)
                            } else {
                                goToIndex(errorCode, errorDescription)
                            }
                            break
                    }
                } else {
                    if (getIsReconn()) {
                        setTimeout(() => {
                            videoPluginLogin()
                        }, VideoPluginReconnectTimeout)
                    }
                }
            }
        }
        // 通知插件能力集
        else if (stateType === 'RequestNodeAppendInfo') {
            const result = await getChlList({
                requireField: [
                    'supportAZ',
                    'supportIris',
                    'supportPtz',
                    'supportIntegratedPtz',
                    'supportPTZGroupTraceTask',
                    'supportTalkback',
                    'supportOsc',
                    'supportSnap',
                    'supportVfd',
                    'supportBackEndVfd',
                    'supportCpc',
                    'supportCdd',
                    'supportIpd',
                    'supportAvd',
                    'supportPea',
                    'supportTripwire',
                    'supportImageRotate',
                    'supportFishEye',
                    'supportFishEyeConfig',
                    'supportMotion',
                    'supportOsd',
                    'supportAudioSetting',
                    'supportMaskSetting',
                    'supportImageSetting',
                    'supportWhiteLightAlarmOut',
                    'supportAudioAlarmOut',
                    'supportAudioDev',
                    'supportAOIEntry',
                    'supportAOILeave',
                    'supportPassLine',
                    'supportVehiclePlate',
                    'supportAutoTrack',
                    'supportAccessControl',
                    'supportVehicleDirection',
                    'supportRS485Ptz',
                ],
            })
            const $ = queryXml(result)
            if ($('status').text() === 'success' && $('content/item').length) {
                const innerHTMLStr = $('content/item')
                    .map((item) => XMLDoc2XMLStr(item.element))
                    .join('')
                const sendXML = OCX_XML_SetAppendInfo(innerHTMLStr)
                getVideoPlugin().ExecuteCmd(sendXML)
            }
            pluginStore.isAppendInfo = true
        }
        // BindWin
        else if (stateType === 'BindWin') {
            const status = $('statenotify/status').text().num()
            pluginStore.bindStatus = status
            if (status === 1 || status === 2) {
                document.title = Translate('IDCS_WEB_CLIENT')
            } else {
                const sendXML = OCX_XML_PluginBindWin(document.title)
                getVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        VideoPluginNotifyEmitter.emit($, stateType, strXMLFormat as string)
    }

    /**
     * @description 初始化成功后，检测到语言包加载成功后，设置插件的语言内容
     */
    const videoPluginLoadLang = async () => {
        return new Promise((resolve) => {
            const exec = () => {
                const sendXML = OCX_XML_SetLang()
                getVideoPlugin().ExecuteCmd(sendXML)
                resolve(void 0)
            }

            if (Object.keys(lang.langItems).length) {
                exec()
            } else {
                const stopWatch = watch(
                    () => lang.langItems,
                    () => {
                        if (Object.keys(lang.langItems).length) {
                            exec()
                            stopWatch()
                        }
                    },
                )
            }
        })
    }

    /**
     * @description 标准客户端插件登录
     * 初始化成功后，检测到客户端登录成功后，插件立即登录
     */
    const videoPluginLoginForStandard = () => {
        return new Promise((resolve) => {
            const exec = async () => {
                if (!pluginStore.pluginPort) {
                    // 跳转初始页面前，获取OCX请求视频端口，只请求一次，全局保存
                    await getPort()
                }
                _videoPluginLoginForStandard()
                resolve(void 0)
            }

            // const userInfoArr = userSession.getAuthInfo()
            if (userSession.token && userSession.sessionId) {
                exec()
            } else {
                const stopWatch = watch(
                    () => userSession.token && userSession.sessionId,
                    async (userInfoArr) => {
                        if (userInfoArr) {
                            stopWatch()
                            exec()
                        }
                    },
                )
            }
        })
    }

    /**
     * @description 获取端口
     * @param {Function} callback
     */
    const getPort = async () => {
        let hostName = window.location.hostname
        if (hostName.indexOf('[') !== -1 || hostName.lastIndexOf(']') !== -1) {
            hostName = hostName.substring(hostName.indexOf('[') + 1, hostName.indexOf(']'))
        }

        let isSubIpUsed = false // 辅IP登录，插件使用externalPort登录
        const netResult = await queryNetCfgV2()
        const $net = queryXml(netResult)
        if ($net('status').text() === 'success') {
            $net('content/nicConfigs/item').forEach((item) => {
                const $item = queryXml(item.element)
                if (item.attr('isSupSecondIP').bool()) {
                    // 判断是否使用了辅IP
                    const secondIpSwitch = $item('secondIpSwitch').text().bool()
                    isSubIpUsed = hostName === $item('secondIp').text() && secondIpSwitch
                }
            })
        }

        let port = 0
        const result = await queryUPnPCfg()
        const $ = queryXml(result)
        if ($('status').text() === 'success') {
            const isUPnPEnable = $('content/switch').text().bool()
            $('content/ports/item').forEach((item) => {
                const $item = queryXml(item.element)
                const externalIP = $item('externalIP').text()
                if ($item('portType').text() === 'SERVICE') {
                    if ((isSubIpUsed || hostName === externalIP) && isUPnPEnable) {
                        port = $item('externalPort').text().num()
                    } else {
                        port = $item('localPort').text().num()
                    }
                }
            })
        }

        pluginStore.pluginPort = port
    }

    /**
     * @description 标准用户名/密码登录
     */
    const _videoPluginLoginForStandard = () => {
        const sendXML = OCX_XML_SetLoginInfo(userSession.serverIp, pluginStore.pluginPort)
        getVideoPlugin().ExecuteCmd(sendXML)
    }

    /**
     * @description P2P 鉴权认证登录入口
     */
    const p2pAuthenticationLogin = () => {
        const sendXML = OCX_XML_P2PAuthentication()
        getVideoPlugin().ExecuteCmd(sendXML)
    }

    /**
     * @description p2p用户名/密码登录
     */
    const p2pUsernameLogin = () => {
        userSession.p2pSessionId = null // 采用用户名/密码登录，要么无sessionId, 要么产生新的授权码后有新的sessionId
        const userInfoArr = userSession.getAuthInfo()
        if (userInfoArr !== null) {
            const sendXML = OCX_XML_SetPasswordLogin_P2P(userInfoArr[0], userInfoArr[1], userInfoArr[2])
            getVideoPlugin().ExecuteCmd(sendXML)
        } else {
            execLoginErrorCallback()
        }
    }

    /**
     * @description p2p授权码登录
     * @param authCode
     * @param authCodeIndex
     */
    const p2pAuthCodeLogin = (authCode: string, authCodeIndex: string) => {
        const sn = userSession.sn
        if (authCode && authCodeIndex && sn) {
            const sendXML = OCX_XML_SetAuthCodeLogin_P2P(authCode, authCodeIndex, sn)
            getVideoPlugin().ExecuteCmd(sendXML)
        } else {
            execLoginErrorCallback()
        }
    }

    /**
     * @description P2P 双重认证登录入口
     */
    const p2pDualAuthLogin = () => {
        const userInfoArr = userSession.getAuthInfo()
        const dualAuthInfoArr = userSession.getDualAuthInfo()
        if (userInfoArr && userInfoArr.length >= 2 && dualAuthInfoArr && dualAuthInfoArr.length >= 1) {
            const sendXML = OCX_XML_SetDualAuthLogin_P2P(userInfoArr[0], userInfoArr[1], userInfoArr[2], dualAuthInfoArr[0], dualAuthInfoArr[1])
            getVideoPlugin().ExecuteCmd(sendXML)
        } else {
            execLoginErrorCallback()
        }
    }

    /**
     * P2P DAToken登录入口
     */
    const p2pDaTokenLogin = () => {
        const daTokenLoginAuth = userSession.daTokenLoginAuth
        const json = JSON.parse(daTokenLoginAuth) || {}
        const sn = json.sn
        const sign = json.sign
        const daToken = json.daToken
        if (sn && daToken && sign) {
            const sendXML = OCX_XML_SetDATokenLogin_P2P(sn, daToken, sign)
            getVideoPlugin().ExecuteCmd(sendXML)
        } else {
            execLoginErrorCallback()
        }
    }

    /**
     * @description videoPluginLogin 登录
     */
    const videoPluginLogin = async () => {
        if (userSession.appType === 'P2P') {
            if (userSession.token && userSession.sessionId) {
                p2pAuthenticationLogin()
            } else if (userSession.daTokenLoginAuth) {
                p2pDaTokenLogin()
            } else if (userSession.dualAuth_N9K) {
                p2pDualAuthLogin()
            } else {
                p2pUsernameLogin()
            }
        } else {
            await videoPluginLoadLang()
            videoPluginLoginForStandard()
        }
    }

    /**
     * @description 返回P2P登录页
     * @param errorCode
     * @param errorDescription
     */
    const goToIndex = (errorCode?: number, errorDescription?: string) => {
        errorCode && setCookie('ec', errorCode)
        errorDescription && setCookie('em', errorDescription.trim())
        window.location.href = '/index.html'
    }

    type CmdQueue = {
        cmd: string | ArrayBuffer
        resolve: ($: Element) => void
        reject: (e: string) => void
    }

    // P2P命令发送队列
    const CMD_QUEUE = {
        viewFlag: 1, //当页面切换后，该flag加1，OCX将不会处理上一个页面的请求
        cmd: {
            cmd: '' as string | ArrayBuffer,
            resolve: () => {},
            reject: () => {},
        } as CmdQueue,
        queue: [] as CmdQueue[],
        lock: false, //锁定标识：当前命令没有返回时，不能发送新的命令
        timeout: 300000, //命令超时时长，如果一个命令发出后，在_timeout时间内没返回，就认为超时
        timeoutId: 0 as NodeJS.Timeout | number,
        identify: 1, // 事务id, 对应请求和应答数据
        add(cmd: CmdQueue) {
            if (this.queue.length > 10000) {
                cmd.reject('CMD_QUEUE is full')
                return
            }
            this.queue.push(cmd)
            if (this.queue.length === 1 && !this.lock) {
                setTimeout(() => {
                    this.execute()
                }, 10)
            }
            return cmd
        },
        execute() {
            if (!this.queue.length || this.lock) {
                return
            }
            this.lock = true
            const cmd = this.queue.shift()!
            this.cmd = cmd
            this.checkPluginReady(() => {
                getVideoPlugin().ExecuteCmd(cmd.cmd)
                this.timeoutId = setTimeout(() => {
                    this.reject()
                }, this.timeout)
            })
        },
        checkPluginReady(callback: { (): void; (): void }) {
            pluginStore.ready
                ? callback()
                : setTimeout(() => {
                      this.checkPluginReady(callback)
                  }, 200)
        },
        resolve($: Element) {
            clearTimeout(this.timeout)
            this.cmd.resolve($)
            this.unlock()
            this.next()
        },
        reject() {
            clearTimeout(this.timeout)
            this.cmd.reject('timeout')
            this.unlock()
            this.next()
        },
        unlock() {
            this.lock = false
        },
        clear() {
            this.cmd = {
                cmd: '',
                resolve: () => {},
                reject: () => {},
            }
            this.queue.length = 0
            this.lock = false
        },
        next() {
            this.cmd = {
                cmd: '',
                resolve: () => {},
                reject: () => {},
            }
            this.execute()
        },
    }

    /**
     * @description 查询VideoPlugin状态
     * @returns {PluginStatus}
     */
    const getVideoPluginStatus = () => {
        return videoPluginStatus
    }

    /**
     * @description 设置主视频插件状态
     * @param {PluginStatus} value
     * @returns {PluginStatus}
     */
    const setVideoPluginStatus = (value: PluginStatus) => {
        return (videoPluginStatus = value)
    }

    /**
     * @description 开启V2进程
     */
    const startV2Process = () => {
        let startPluginError = true
        isInstallPlugin.value = false
        pluginStore.currPluginMode = null
        const osType = getSystemInfo().platform

        const connPlugin = WebsocketPlugin({
            wsType: 'pluginMainProcess',
            port: userSession.appType === 'STANDARD' ? ClientPort : osType === 'windows' ? P2PClientPort : MacP2PClientPort,
            onopen: () => {
                isInstallPlugin.value = true
            },
            onmessage: (strXMLFormat: string) => {
                const $ = queryXml(XMLStr2XMLDoc(strXMLFormat))
                if ($('/response').attr('type') === 'SetWebSocketPort') {
                    const port = $('/response/port').text().num()
                    if (port) {
                        pluginStore.ocxPort = port
                        startPluginError = false
                        connPlugin.Destroy()
                        initVideoPlugin()
                    } else {
                        pluginErrorHandle()
                    }
                }
            },
            onerror: () => {
                pluginErrorHandle(startPluginError)
            },
            onclose: () => {},
        })
    }

    /**
     * @description 初始化Windows视频插件
     */
    const initVideoPlugin = () => {
        const ocxPort = pluginStore.ocxPort
        if (!ocxPort) {
            // pluginErrorHandle()
            return
        }
        videoPlugin = WebsocketPlugin({
            wsType: 'pluginSubProcess',
            port: ocxPort,
            onopen: () => {
                if (getIsSupportH5()) {
                    // 若当前已经支持H5并切换到H5登录模式，则关闭当前已连接成功的插件2.0
                    getVideoPlugin().Destroy()
                    isPluginAvailable.value = false
                    pluginStore.ready = false
                    return
                }
                pluginStore.currPluginMode = isBrowserSupportWasm() ? 'h5' : 'ocx'
                pluginStore.showPluginNoResponse = false // 插件崩溃时提示插件无响应
                loadVideoPlugin()
            },
            onmessage: VideoPluginNotify,
            onerror: () => {
                pluginErrorHandle()
            },
            onclose: () => {
                pluginStore.ready = false
                pluginStore.currPluginMode = null
                if (pluginStore.manuaClosePlugin) return

                setPluginNoResponse()
                showPluginNoResponse()
            },
        })
    }

    /**
     * @description 加载Windows插件
     */
    const loadVideoPlugin = async () => {
        let ver = ''
        if (userSession.appType === 'STANDARD') {
            if (systemInfo.platform === 'windows') {
                ver = ClientPluVer
            }
        } else {
            if (systemInfo.platform === 'windows') {
                ver = P2PClientPluVer
            } else {
                ver = MacP2PClientPluVer
            }
        }
        let needUpate = true
        const sendXML = OCX_XML_GetOcxVersion()
        getVideoPlugin().QueryInfo(sendXML, (strXMLFormat) => {
            const $ = queryXml(XMLStr2XMLDoc(strXMLFormat))
            const $xmlDoc = $('//response[@type="GetOcxVersion"]')
            if ($xmlDoc.length > 0) {
                const intCurVer = $xmlDoc.text()
                if (compareOcxVersion(intCurVer, ver) >= 0) {
                    needUpate = false
                }
            }

            if (needUpate) {
                isPluginAvailable.value = false
                isInstallPlugin.value = false
                // 将showPluginNoResponse置为空，避免更新插件并安装后页面弹出：插件无响应
                pluginStore.showPluginNoResponse = false
                getPluginUpdateNotice()

                if (userSession.appType === 'P2P') {
                    setPluginNotice('body')
                }
                return
            } else {
                const sendXML = OCX_XML_PluginBindWin()
                executeCmd(sendXML)
                isPluginAvailable.value = true
                setVideoPluginStatus('Loaded')
            }

            const sendXML = OCX_XML_SetProperty({
                calendarType: userSession.calendarType,
                supportRecStatus: true,
            })
            getVideoPlugin().ExecuteCmd(sendXML)
            videoPluginLogin()
        })
    }

    /**
     * @description 插件异步查询信息
     * @param pluginObj
     * @param sendXML
     * @param callback
     */
    const asynQueryInfo = (sendXML: string, callback?: (str: string) => void) => {
        return new Promise((resolve) => {
            getVideoPlugin().QueryInfo(sendXML, (strXMLFormat) => {
                callback && callback(strXMLFormat)
                resolve(strXMLFormat)
            })
        })
    }

    /**
     * 获得视频插件对象
     * @returns {WebsocketPlugin}
     */
    const getVideoPlugin = () => {
        if (!videoPlugin) {
            initVideoPlugin()
        } else {
            if (getVideoPluginStatus() === 'Disconnected') {
                setVideoPluginStatus('Reconnecting')
                videoPluginLogin()
            }
        }

        return videoPlugin ? videoPlugin : FakePluginForWasm
    }

    /**
     * @description 向插件发送命令
     * @param {string} cmd
     * @returns
     */
    const executeCmd = (cmd: string | ArrayBuffer) => {
        return getVideoPlugin().ExecuteCmd(cmd)
    }

    /**
     * @description 获取是否重连
     * @returns {boolean}
     */
    const getIsReconn = () => {
        return pluginStore.isReconn
    }

    /**
     * @description 设置是否重连
     * @param {boolean} isReconnect
     */
    const setIsReconn = (isReconnect: boolean) => {
        pluginStore.isReconn = isReconnect
    }

    /**
     * @description 设置重连回调
     * @param {Function} callBack
     */
    const setReconnCallBack = (callBack: () => void) => {
        reconCallBack = callBack
    }

    /**
     * @description 获得重连回调函数
     * @returns {Function}
     */
    const getReconnCallBack = () => {
        return reconCallBack
    }

    /**
     * @description 设置P2P登录回调
     * @param {Function} callback
     */
    const setLoginTypeCallback = (callback?: ((loginType: string, authCodeIndex: string) => void) | null) => {
        if (typeof callback === 'function') {
            p2pLoginTypeCallback = callback
        } else {
            p2pLoginTypeCallback = null
        }
    }

    /**
     * @description 执行P2P登录回调
     * @returns {Function}
     */
    const execLoginTypeCallback = (loginType: string, authCodeIndex: string) => {
        if (typeof p2pLoginTypeCallback === 'function') {
            p2pLoginTypeCallback(loginType, authCodeIndex)
        } else {
            window.location.href = '/index.html'
        }
    }

    /**
     * @description 设置登录失败回调
     * @param {Function} callback
     */
    const setLoginErrorCallback = (callback?: (errorCode?: number, errorDescription?: string) => void) => {
        if (typeof callback === 'function') {
            loginErrorCallback = callback
        } else {
            loginErrorCallback = null
        }
    }

    /**
     * @description 执行登录失败回调
     * @param {number} errorCode
     * @param {string} errorDescription
     * @returns {Function}
     */
    const execLoginErrorCallback = (errorCode?: number, errorDescription?: string) => {
        if (typeof loginErrorCallback === 'function') {
            loginErrorCallback(errorCode, errorDescription)
        } else {
            goToIndex(errorCode, errorDescription)
        }
    }

    /**
     * @description 错误处理
     * @param {boolean} startPluginError
     */
    const pluginErrorHandle = (startPluginError = false) => {
        isPluginAvailable.value = false
        pluginStore.ocxPort = 0
        // 与插件建链发生错误后，若当前浏览器支持H5方式，则可使用H5登录方式
        if (isBrowserSupportWasm()) {
            pluginStore.currPluginMode = 'h5'
        } else {
            pluginStore.currPluginMode = 'ocx'
        }

        if (userSession.appType === 'P2P') {
            getPluginNotice()
            // 与插件建链成功后，发生了错误，禁止跳转到插件下载页面,保留当前页面状态
            if (pluginStore.showPluginNoResponse) return
            if (!startPluginError && route.path.includes('authCodeLogin')) return
            setPluginNotice('body')
        } else {
            getPluginNotice()
            showPluginNoResponse()
        }
    }

    /**
     * @description 注销视频插件
     */
    const disposePlugin = () => {
        const sendXML = OCX_XML_SetPluginSize(0, 0, 0, 0)
        getVideoPlugin().ExecuteCmd(sendXML)
        getVideoPlugin().Destroy()

        pluginStore.ocxPort = 0
        pluginStore.currPluginMode = null
        videoPlugin = null
    }

    let isPluginNoResponseFlag = false

    const setPluginNoResponse = () => {
        pluginStore.showPluginNoResponse = true
    }

    /**
     * @description 视频无响应处理
     */
    const showPluginNoResponse = () => {
        // 页面初始化处于加载状态中，翻译文件未加载完成时，出现公共错误，取消显示弹窗
        if (!layoutStore.isInitial) return
        /**
         * 1. onclose事件异常触发时， 会首先触发onerror事件, 若当前页面停留在登录页，则不用弹出提示信息
         * 2. 若支持H5登录（插件没有安装）， 则不用弹出提示信息
         */
        if (route.path.includes('login') || !getIsInstallPlugin()) {
            pluginStore.showPluginNoResponse = false
        }

        if (route.path.includes('authCodeLogin')) {
            execLoginErrorCallback(ErrorCode.USER_ERROR_INVALID_POINT, 'The plugin is not responding, please log in again')
            return
        }
        if (getIsSupportH5() || !pluginStore.showPluginNoResponse) return
        if (isPluginNoResponseFlag) return

        isPluginNoResponseFlag = true
        openMessageBox(Translate('IDCS_PLUGIN_NO_RESPONSE_TIPS'))
            .then(() => {
                Logout()
            })
            .finally(() => {
                isPluginNoResponseFlag = false
            })
    }

    /**
     * @description 通过startV2Process启动是否成功判断插件是否运行（安装）
     * 若没有运行（安装），则进入插件页面时显示插件下载链接入口
     * @return {boolean}
     */
    const getIsInstallPlugin = () => {
        return isInstallPlugin.value
    }

    /**
     * @description 标记：通过新的端口号与插件是否成功建立链接，
     * @returns {boolean}
     */
    const getIsPluginAvailable = () => {
        return isPluginAvailable.value
    }

    /**
     * @description 当前登录方式为H5的判断方式：路由是否切换到H5模式
     * @return {boolean}
     */
    const getIsSupportH5 = () => {
        return pluginStore.currPluginMode === 'h5'
    }

    /**
     * @description 视频预览命令必须在插件连接状态connectstate为success后设置才会生效
     * @param {*} chlId 通道ID
     * @param {*} chlName  通道名称
     * @param {*} chlPoe 开启通道预览POE
     * @returns
     */
    const retryStartChlView = (chlId: string, chlName: string, callback?: () => void) => {
        const pluginStatus = getVideoPluginStatus()
        if (pluginStatus !== 'Connected') {
            setTimeout(() => {
                retryStartChlView(chlId, chlName, callback)
            }, 50)
            return
        }
        const sendXML = OCX_XML_SetViewChannelID(chlId, chlName)
        getVideoPlugin().ExecuteCmd(sendXML)
        callback && callback()
    }

    /**
     * @description 显示或隐藏OCX
     * @param {boolean} isShow
     * @returns
     */
    const displayOCX = (isShow: boolean) => {
        if (isShow && layoutStore.messageBoxCount) return
        if (isShow && layoutStore.loadingCount) return
        if (isShow && forcedHidden) return

        // 检查浏览器当前标签页是否为可见。若不可见,则不显示视频插件窗口
        if (isShow && document.visibilityState === 'hidden') return
        if (!getIsPluginAvailable()) return

        const sendXML = OCX_XML_DisplayPlugin(isShow)
        getVideoPlugin().ExecuteCmd(sendXML)
    }

    /**
     * @description 设置插件大小
     * @param {HTMLElement} pluginRefDiv 视频占位符元素
     * @param {Object} pluginObj 视频插件
     */
    const setPluginSize = (pluginRefDiv: HTMLElement | null, pluginObj?: ReturnType<typeof getVideoPlugin>, shouldAdjust = false) => {
        if (!pluginObj) pluginObj = getVideoPlugin()

        if (!pluginRefDiv) {
            if (browserEventMap.data.length) {
                pluginRefDiv = browserEventMap.data[0].element
            } else {
                return
            }
        }

        // 获取浏览器的缩放比率
        const ratio = window.devicePixelRatio
        // 视频插件占位符尺寸
        const divOcxRect = pluginRefDiv.getBoundingClientRect()
        const divOcxLeft = divOcxRect.left * ratio
        const divOcxTop = divOcxRect.top * ratio
        const navHeight = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement ? 0 : document.getElementById('layoutMainHeader')?.clientHeight || 0
        const browserType = browserInfo.type // 浏览器类型
        const ocxMode = PluginSizeModeMapping[browserType]
        let refW = divOcxRect.width * ratio
        let refH = divOcxRect.height * ratio
        let winLeft = 0
        let winTop = 0
        let menuH = 0 // 浏览器工具栏高度（包含了地址栏、书签栏）
        if (browserInfo.type === 'firefox') {
            const offset = (window.outerWidth - window.innerWidth) / 2 // 外宽和内宽偏差值
            let diffVersion = 0 // 火狐版本偏差值
            if (window.screenTop < 0) {
                // 火狐最大化时
                if (systemInfo.version === 'Win7' || browserInfo.majorVersion <= 100) {
                    // 小于100版本时取0, 大于100版本时取window.screenTop
                    diffVersion = 0
                } else {
                    diffVersion = window.screenTop
                }
            }
            menuH = (window.outerHeight - window.innerHeight - offset + diffVersion) * ratio
        }
        let xDiff = 0
        if (browserInfo.type === 'lowEdge') {
            // 低版本Edge浏览器的screenTop不包括浏览器工具栏高度（地址栏、书签栏），需要额外进行计算
            const offset = (window.outerWidth - window.innerWidth) / 2 // 外宽和内宽偏差值
            let yDiff = 0
            window.screenTop === 0 ? (yDiff = 8) : (xDiff = 8)
            menuH = (window.outerHeight - window.innerHeight - offset - yDiff) * ratio
        }
        winLeft = divOcxLeft + xDiff
        winTop = divOcxTop + menuH
        // 视频插件窗口的高大于浏览器视口容许的高（底部收缩）
        if (refH > getViewPort(ratio).height - divOcxTop) {
            refH = getViewPort(ratio).height - divOcxTop
        }

        // 视频插件窗口的顶部越过页面导航菜单区域（顶部收缩）
        if (divOcxTop <= navHeight) {
            winTop = ocxMode === RELATIVE_TO_BROWSER || browserType === 'lowEdge' ? navHeight + menuH : navHeight
            refH -= navHeight - divOcxTop
        }

        // 视频插件窗口的宽大于浏览器视口容许的宽（右部收缩）
        if (refW > getViewPort(ratio).width - divOcxLeft) {
            refW = getViewPort(ratio).width - divOcxLeft
        }

        // 视频插件窗口的左侧越过浏览器视口左边界（左部收缩）
        if (divOcxRect.left <= 0) {
            winLeft = 0
            refW += divOcxLeft
        }

        if (ocxMode === RELATIVE_TO_SCREEN) {
            winLeft = window.screenLeft * ratio + winLeft
            winTop = window.screenTop * ratio + winTop
        }

        const adjust = (size: number) => {
            if (size === 0) return size
            if (shouldAdjust) {
                return size + 1
            }
            return size
        }
        const domWidth = ocxMode === RELATIVE_TO_DOM ? window.innerWidth * ratio : 0
        const domHeight = ocxMode === RELATIVE_TO_DOM ? window.innerHeight * ratio : 0
        const sendXML = OCX_XML_SetPluginSize(winLeft, winTop, adjust(refW), adjust(refH), ocxMode, domWidth, domHeight)
        pluginObj.ExecuteCmd(sendXML)
    }

    /**
     * @description 设置插件显示/隐藏透明区域，用于防止dom元素被插件遮挡
     * @param {boolean} bool
     * @param {DOMRect} size
     */
    const setOCXTransparent = (bool: boolean, divOcxRect: DOMRect) => {
        const ratio = window.devicePixelRatio
        const browserType = browserInfo.type
        const ocxMode = PluginSizeModeMapping[browserType] || PluginSizeModeMapping.unknow

        let menuH = 0 // 浏览器工具栏高度（包含了地址栏、书签栏）
        if (browserInfo.type === 'firefox') {
            const offset = (window.outerWidth - window.innerWidth) / 2 // 外宽和内宽偏差值
            let diffVersion = 0 // 火狐版本偏差值
            if (window.screenTop < 0) {
                // 火狐最大化时
                if (systemInfo.version === 'Win7' || browserInfo.majorVersion <= 100) {
                    // 小于100版本时取0, 大于100版本时取window.screenTop
                    diffVersion = 0
                } else {
                    diffVersion = window.screenTop
                }
            }
            menuH = (window.outerHeight - window.innerHeight - offset + diffVersion) * ratio
        }

        if (browserInfo.type === 'lowEdge') {
            // 低版本Edge浏览器的screenTop不包括浏览器工具栏高度（地址栏、书签栏），需要额外进行计算
            const offset = (window.outerWidth - window.innerWidth) / 2 // 外宽和内宽偏差值
            let yDiff = 0
            if (window.screenTop === 0) {
                yDiff = 8
            }
            menuH = (window.outerHeight - window.innerHeight - offset - yDiff) * ratio
        }

        const startX = Math.ceil(divOcxRect.left) * ratio
        const startY = Math.ceil(divOcxRect.top) * ratio + menuH
        const width = Math.ceil(divOcxRect.width) * ratio
        const height = Math.ceil(divOcxRect.height) * ratio
        const points = [
            { X: startX, Y: startY },
            { X: startX + width, Y: startY },
            { X: startX + width, Y: startY + height },
            { X: startX, Y: startY + height },
        ]

        // 显示透明区域
        if (bool) {
            const sendXML = OCX_XML_setTransparentArea(points, ocxMode, 'false')
            executeCmd(sendXML)
        }
        // 隐藏透明区域
        else {
            const sendXML = OCX_XML_RestoreTransparentArea(points, ocxMode, 'true')
            executeCmd(sendXML)
        }
    }

    /**
     * @description 根据浏览器的缩放比例获取视口大小
     * @param {number} ratio
     * @returns {Object}
     */
    const getViewPort = (ratio: number) => {
        if (document.compatMode === 'BackCompat') {
            return {
                width: document.body.clientWidth * ratio,
                height: document.body.clientHeight * ratio,
            }
        } else {
            return {
                width: document.documentElement.clientWidth * ratio,
                height: document.documentElement.clientHeight * ratio,
            }
        }
    }

    interface BrowserMoveEventObj {
        element: HTMLElement
        browserScrollCallback: (e: Event) => void
        browserMoveTimer: NodeJS.Timeout
        mutationObserver: MutationObserver
        resizeObserver: ResizeObserver
        observerList: Map<HTMLElement, { type: 'intersect' | 'visible'; rect: DOMRect }> // HTMLElement[]
    }

    const browserEventMap = {
        data: [] as BrowserMoveEventObj[],
        has(element: HTMLElement) {
            return this.data.some((item) => item.element === element)
        },
        get(element: HTMLElement) {
            return this.data.find((item) => item.element === element)
        },
        set(item: BrowserMoveEventObj) {
            this.data.push(item)
        },
        delete(element: HTMLElement) {
            const index = this.data.findIndex((item) => item.element === element)
            if (index > -1) {
                this.data.splice(index, 1)
            }
        },
    }

    /**
     * @description 关闭当前插件
     * @param pluginPlaceholderId
     * @returns
     */
    const closeCurPlugin = (pluginPlaceholderId: HTMLElement | null) => {
        if (!pluginPlaceholderId) return null
        pluginPlaceholderId.style.width = '0px'
        pluginPlaceholderId.style.height = '0px'
        setPluginSize(pluginPlaceholderId, getVideoPlugin())
        // 离开当前页面，关闭插件的同时注销浏览器移动、滚动时更新插件尺寸
        disableUpdatePluginPos(pluginPlaceholderId)
    }

    /**
     * @description 关闭所有插件
     * @param pluginPlaceholderId
     * @returns
     */
    const closeAllPlugin = () => {
        for (let i = 0; i < browserEventMap.data.length; i++) {
            closeCurPlugin(browserEventMap.data[i].element)
        }
    }

    // Dialog、Popover等遮挡OCX视窗时，强制OCX视窗隐藏
    let forcedHidden = false
    let lastIntersectElement: HTMLElement | null = null

    /**
     * @description 关闭插件位置监听
     * @param pluginPlaceholderId
     * @returns
     */
    const disableUpdatePluginPos = (pluginPlaceholderId: HTMLElement | null) => {
        if (!pluginPlaceholderId) return null
        if (browserEventMap.has(pluginPlaceholderId)) {
            const browserMoveEventObj = browserEventMap.get(pluginPlaceholderId)!
            document.getElementById('layoutMainBody')?.removeEventListener('scroll', browserMoveEventObj.browserScrollCallback)
            window.removeEventListener('scroll', browserMoveEventObj.browserScrollCallback)
            window.removeEventListener('resize', browserMoveEventObj.browserScrollCallback)
            clearInterval(browserMoveEventObj.browserMoveTimer)
            browserMoveEventObj.mutationObserver.disconnect()
            browserMoveEventObj.resizeObserver.disconnect()
            browserEventMap.delete(pluginPlaceholderId)
            lastIntersectElement = null
            forcedHidden = false
        }
    }

    /**
     * @description 判断两个元素是否重合(相交或覆盖)
     * @see https://zhuanlan.zhihu.com/p/526649229
     * @param {DOMRect} rect1
     * @param {DOMRect} rect2
     * @returns {boolean}
     */
    const isOverlap = (rect1: DOMRect, rect2: DOMRect) => {
        const { left: x1, top: y1, right: x2, bottom: y2 } = rect1
        const { left: x3, top: y3, right: x4, bottom: y4 } = rect2

        if (Math.max(x1, x3) <= Math.min(x2, x4) && Math.max(y1, y3) <= Math.min(y2, y4)) {
            return true
        } else {
            return false
        }
    }

    /**
     * @description 监听浏览器窗口的移动、插件被遮挡等，控制插件移动/显隐
     * @param {HTMLElement} pluginPlaceholderId
     * @param {number} updateInterval
     */
    const addPluginMoveEvent = (pluginPlaceholderId: HTMLElement, updateInterval?: number) => {
        if (!pluginPlaceholderId) return null
        if (browserEventMap.has(pluginPlaceholderId)) return

        const interval = updateInterval || 50
        const browserScrollCallback = debounce(() => {
            setPluginSize(pluginPlaceholderId, getVideoPlugin())

            if (lastIntersectElement) {
                const element = browserEventMap.get(pluginPlaceholderId)?.observerList.get(lastIntersectElement)
                if (element) {
                    setOCXTransparent(false, element.rect)
                    if (lastIntersectElement.style.display !== 'none') {
                        const rect = lastIntersectElement.getBoundingClientRect()
                        browserEventMap.get(pluginPlaceholderId)!.observerList.set(lastIntersectElement, { type: 'intersect', rect: rect })
                        setOCXTransparent(true, rect)
                    }
                }
            }
        })

        let oldX = 0
        let oldY = 0
        let oldWidth = 0
        let oldHeihgt = 0

        const browserMoveTimer = setInterval(() => {
            // 最小化浏览器时, screenX会变成-32000, 此时不重新设置尺寸
            if (window.screenX < -30000 || window.screenY < -30000) return
            // 浏览器窗口的尺寸（x,y,width,height)发生变化时，视为浏览器窗口发生了移动
            const screenX = window.screenX
            const screenY = window.screenY
            const width = window.outerWidth
            const height = window.outerHeight
            if (oldX === screenX && oldY === screenY && oldWidth === width && oldHeihgt === height) return
            if (
                (oldX > 0 && oldY > 0 && screenX <= 0 && screenY <= 0) || // 浏览器最大化
                (oldX <= 0 && oldY <= 0 && screenX > 0 && screenY > 0) // 浏览器缩放
            ) {
                displayOCX(false)
                setTimeout(() => {
                    displayOCX(true)
                }, interval * 6)
            }

            if (Math.abs(screenX - oldX) > 1 || Math.abs(screenY - oldY) > 1 || Math.abs(width - oldWidth) > 1 || Math.abs(height - oldHeihgt) > 1) {
                oldX = screenX
                oldY = screenY
                oldWidth = width
                oldHeihgt = height
                setPluginSize(pluginPlaceholderId, getVideoPlugin())
            }
        }, interval)

        // 观察遮挡元素/OCX占位符样式变化 重新设置插件大小、显示隐藏
        const mutationObserver = new MutationObserver(async (mutationsList) => {
            let isPlaceholder = true // 是否OCX占位符发生变化
            for (const mutation of mutationsList) {
                const target = mutation.target as HTMLElement
                if (mutation.attributeName === 'style') {
                    if (target.querySelector('.PluginPlayer') === null) {
                        if (!target.classList.contains('el-select__popper')) {
                            isPlaceholder = false
                        }
                    } else {
                        browserScrollCallback()
                    }
                }

                if (mutation.attributeName === 'class') {
                    if (target.classList.contains('el-select__popper')) {
                        isPlaceholder = false
                    }
                }
            }

            if (!isPlaceholder) {
                const data = browserEventMap.get(pluginPlaceholderId)
                if (data) {
                    const rect = data.element.getBoundingClientRect()

                    let hasPop = false
                    let hasIntersect = false
                    let currentIntersectElement: HTMLElement | null = null

                    data.observerList.forEach((type, element) => {
                        if (type.type === 'intersect') {
                            if (hasIntersect) {
                                return
                            }

                            const elementRect = element.getBoundingClientRect()
                            const isIntersect = element.style.display !== 'none' && isOverlap(rect, elementRect)
                            if (isIntersect) {
                                hasIntersect = true
                                if (lastIntersectElement !== element) {
                                    currentIntersectElement = element
                                    setTimeout(() => {
                                        const elementRect = element.getBoundingClientRect()
                                        type.rect = elementRect
                                        setOCXTransparent(isIntersect, elementRect)
                                    }, 5)
                                }
                            }
                        }

                        if (type.type === 'visible') {
                            if (hasPop) {
                                return
                            }

                            hasPop = element.style.display !== 'none' && element.querySelector('.PluginPlayer') === null
                        }
                    })

                    if (!hasIntersect) {
                        if (lastIntersectElement) {
                            const element = data.observerList.get(lastIntersectElement)!
                            setOCXTransparent(false, element.rect)
                            lastIntersectElement = null
                        }

                        if (!hasPop && browserEventMap.data.length) {
                            forcedHidden = false
                            displayOCX(true)
                        }

                        if (hasPop) {
                            forcedHidden = true
                            displayOCX(false)
                        }
                    } else {
                        if (lastIntersectElement && currentIntersectElement && lastIntersectElement !== currentIntersectElement) {
                            const element = data.observerList.get(lastIntersectElement)!
                            setOCXTransparent(false, element.rect)
                        }

                        if (currentIntersectElement) {
                            lastIntersectElement = currentIntersectElement
                        }
                    }
                }
            }
        })

        /**
         * @notice 这里自动获取同步加载的对话框组件，并把它们添加进观察列表
         * 如果是异步方式加载的组件，这里将添加失败，需要手动地执行ObserverElement()来添加
         */
        const observerList = new Map<HTMLElement, { type: 'intersect' | 'visible'; rect: DOMRect }>()

        const DEFAULT_RECT = document.body.getBoundingClientRect()

        const dialogs = document.querySelectorAll('.el-dialog')
        for (const dialog of dialogs) {
            if (dialog.querySelector('.PluginPlayer') !== null) {
                mutationObserver.observe(dialog, { attributes: true })
            }
        }

        const overlays = document.querySelectorAll('.el-overlay')
        for (const overlay of overlays) {
            mutationObserver.observe(overlay, { attributes: true })
            observerList.set(overlay as HTMLElement, {
                type: 'visible',
                rect: DEFAULT_RECT,
            })
        }

        const poppers = document.querySelectorAll('.el-popover')
        for (const popper of poppers) {
            mutationObserver.observe(popper, { attributes: true })
            observerList.set(popper as HTMLElement, {
                type: 'intersect',
                rect: popper.getBoundingClientRect(),
            })
        }

        const hideOCX = document.querySelectorAll('.hide-ocx')
        for (const popper of hideOCX) {
            mutationObserver.observe(popper, { attributes: true })
            observerList.set(popper as HTMLElement, {
                type: 'visible',
                rect: DEFAULT_RECT,
            })
        }

        const intersetOCX = document.querySelectorAll('.intersect-ocx')
        for (const popper of intersetOCX) {
            mutationObserver.observe(popper, { attributes: true })
            observerList.set(popper as HTMLElement, {
                type: 'intersect',
                rect: popper.getBoundingClientRect(),
            })
        }

        // 观察容器大小变化 重新设置插件大小
        const resizeObserver = new ResizeObserver(() => {
            browserScrollCallback()
        })
        resizeObserver.observe(pluginPlaceholderId)

        document.getElementById('layoutMainBody')?.addEventListener('scroll', browserScrollCallback)
        window.addEventListener('scroll', browserScrollCallback)
        window.addEventListener('resize', browserScrollCallback)
        browserEventMap.set({
            element: pluginPlaceholderId,
            browserMoveTimer: browserMoveTimer,
            browserScrollCallback: browserScrollCallback,
            mutationObserver: mutationObserver,
            resizeObserver: resizeObserver,
            observerList: observerList,
        })
    }

    /**
     * @description 监听元素变化，控制插件移动/显隐
     * @param {HTMLElement} pluginRefDiv
     * @param {HTMLElement} observeElement
     * @param {string} observeType
     */
    const observeElement = (pluginRefDiv: HTMLElement | null, observeElement: HTMLElement, observeType: 'visible' | 'intersect' | 'scroll') => {
        if (!pluginRefDiv) {
            if (browserEventMap.data.length) {
                pluginRefDiv = browserEventMap.data[0].element
            } else {
                return
            }
        }

        if (browserEventMap.get(pluginRefDiv)) {
            if (browserEventMap.get(pluginRefDiv)!.observerList.has(observeElement)) {
                return
            }

            browserEventMap.get(pluginRefDiv)!.mutationObserver.observe(observeElement, { attributes: true })
            if (observeType === 'intersect' || observeType === 'visible') {
                browserEventMap.get(pluginRefDiv)!.observerList.set(observeElement, { type: observeType, rect: observeElement.getBoundingClientRect() })
            }
        }
    }

    /**
     * @description 移除对元素变化的监听
     * @param pluginDiv
     * @param unobserveElement
     */
    const unobserveElement = (pluginRefDiv: HTMLElement | null, unobserveElement: HTMLElement) => {
        if (!pluginRefDiv) {
            if (browserEventMap.data.length) {
                pluginRefDiv = browserEventMap.data[0].element
            } else {
                return
            }
        }

        if (browserEventMap.get(pluginRefDiv)) {
            if (browserEventMap.get(pluginRefDiv)!.observerList.has(unobserveElement)) {
                browserEventMap.get(pluginRefDiv)!.observerList.delete(unobserveElement)
            }
        }
    }

    let displayTimer: NodeJS.Timeout | number = 0

    /**
     * @description 强制隐藏OCX
     * @param {boolean} hideOCX
     */
    const forceHideOCX = (hideOCX: boolean) => {
        if (!getIsInstallPlugin()) return

        clearTimeout(displayTimer)

        if (hideOCX) {
            displayOCX(false)
        } else {
            displayTimer = setTimeout(() => {
                if (browserEventMap.data.length && !forcedHidden) displayOCX(true)
            }, 50)
        }
    }

    // 消息框打开时，隐藏OCX
    watch(
        () => layoutStore.messageBoxCount,
        (newVal) => forceHideOCX(!!newVal),
    )

    // 全屏Loading时，隐藏OCX
    watch(
        () => layoutStore.loadingCount,
        (newVal) => forceHideOCX(!!newVal),
    )

    // 检测登录重连
    watch(
        () => pluginStore.isReconn,
        (newVal) => {
            if (newVal) {
                setReconnCallBack(() => {
                    openMessageBox(Translate('IDCS_LOGIN_OVERTIME')).then(() => {
                        closeLoading()
                        Logout()
                    })
                })
            }
        },
    )

    // 重置警告框渲染位置
    watch(
        () => route.name,
        () => {
            if (pluginNoticeContainer.value !== 'body') {
                pluginNoticeContainer.value = ''
            }
        },
    )

    watch(
        () => userSession.sessionId,
        (val) => {
            if (val === '') {
                disposePlugin()
            }
        },
    )

    onMounted(async () => {
        disposePlugin()

        if (import.meta.env.DEV) {
            await loadScript('/plugin/OCX/ClientPluVerFile.js')
        } else {
            await loadScript('OCX/ClientPluVerFile.js')
        }

        if (userSession.appType === 'STANDARD') {
            startV2Process()
        } else {
            if (userSession.refreshLoginPage) {
                userSession.clearSession()
                goToIndex()
                return
            }

            // siteDictionary.js 在P2P服务器根目录下
            await loadScript(`${import.meta.env.VITE_P2P_BASE_URL}/siteDictionary.js?v=${import.meta.env.VITE_PACKAGE_VER}`)

            // use114 使用中性版本，但定制化登录页/授权码登录页
            const hostname = sha256_encrypt(location.hostname)
            if (HOSTNAME_CSS_MAP && HOSTNAME_CSS_MAP[hostname]) {
                const cssName = HOSTNAME_CSS_MAP[hostname]
                document.querySelector('html')?.classList.add(cssName)
            }

            await p2pLang.getLangTypes()
            await p2pLang.getLangItems()
            lang.langType = p2pLang.langType
            lang.langId = p2pLang.langId
            userSession.p2pSessionId = null
            startV2Process()
        }
    })

    document.addEventListener('visibilitychange', () => forceHideOCX(document.visibilityState === 'hidden'), false)

    return {
        GetVideoPlugin: getVideoPlugin,
        StartV2Process: startV2Process,
        InitVideoPlugin: initVideoPlugin,
        P2pCmdSender: CMD_QUEUE,
        AsynQueryInfo: asynQueryInfo,
        SetPluginSize: setPluginSize,
        SetOCXTransparent: setOCXTransparent,
        DisplayOCX: displayOCX,
        GetVideoPluginStatus: getVideoPluginStatus,
        SetVideoPluginStatus: setVideoPluginStatus,
        VideoPluginLogin: videoPluginLogin,
        P2pAuthCodeLogin: p2pAuthCodeLogin,
        P2pDualAuthLogin: p2pDualAuthLogin,
        GetIsReconn: getIsReconn,
        SetIsReconn: setIsReconn,
        SetReconnCallBack: setReconnCallBack,
        GetReconnCallBack: getReconnCallBack,
        SetLoginTypeCallback: setLoginTypeCallback,
        ExecLoginTypeCallback: execLoginTypeCallback,
        SetLoginErrorCallback: setLoginErrorCallback,
        ExecLoginErrorCallback: execLoginErrorCallback,
        PluginErrorHandle: pluginErrorHandle,
        DisposePlugin: disposePlugin,
        CloseCurPlugin: closeCurPlugin,
        CloseAllPlugin: closeAllPlugin,
        DisableUpdatePluginPos: disableUpdatePluginPos,
        ShowPluginNoResponse: showPluginNoResponse,
        SetPluginNoResponse: setPluginNoResponse,
        AddPluginMoveEvent: addPluginMoveEvent,
        IsInstallPlugin: getIsInstallPlugin,
        IsPluginAvailable: getIsPluginAvailable,
        IsSupportH5: getIsSupportH5,
        RetryStartChlView: retryStartChlView,
        SetPluginNotice: setPluginNotice,
        VideoPluginNotifyEmitter,
        pluginNoticeHtml,
        pluginDownloadUrl,
        pluginNoticeContainer,
        BackUpTask: backupTask,
        ExecuteCmd: executeCmd,
        ObserveElement: observeElement,
        UnobserveElement: unobserveElement,
    }
}

export type PluginType = ReturnType<typeof getSingletonPlugin>

/**
 * @description 确保plugin对象是个单例
 * @returns
 */
export const usePlugin = (data?: PluginHookOptions): PluginType => {
    if (!window.__RUNTIME_OCX_PLUGIN__) {
        window.__RUNTIME_OCX_PLUGIN__ = getSingletonPlugin()
    }

    if (data) {
        setupPlugin(window.__RUNTIME_OCX_PLUGIN__, data)
    }

    return window.__RUNTIME_OCX_PLUGIN__
}

interface PluginHookOptions {
    player?: Ref<HTMLDivElement | undefined>
    onReady?: (mode: ComputedRef<string>, plugin: ReturnType<typeof getSingletonPlugin>) => void
    onDestroy?: (mode: ComputedRef<string>, plugin: ReturnType<typeof getSingletonPlugin>) => void
    onMessage?: ($: XMLQuery, stateType: string) => void
}

/**
 * @description 在组件中引入无视图的plugin实例，此方法包含组件生命周期内对插件的一些通用的操作（只能在组件setup顶层使用）
 * @param {Function} cbk
 * @returns
 */
export const setupPlugin = (plugin: ReturnType<typeof usePlugin>, data: PluginHookOptions) => {
    const pluginStore = usePluginStore()

    const mode = computed(() => {
        return pluginStore.currPluginMode === 'h5' ? 'h5' : 'ocx'
    })

    const ready = ref(false)

    const readyState = computed(() => {
        if (mode.value === 'h5') return ready.value
        else return ready.value && pluginStore.ready
    })

    const findParentElement = (element: HTMLElement) => {
        const parentElement = element.parentElement
        if (!parentElement) {
            return 'body'
        }

        if (parentElement.classList.contains('el-dialog__body')) {
            return '#' + element.parentElement.id
        }

        if (parentElement.id === 'layout2Content') {
            return '#layout2Content'
        }

        if (parentElement.id === 'layoutMainContent') {
            return '#layoutMainContent'
        }

        if (parentElement.tagName === 'body') {
            return 'body'
        }

        return findParentElement(parentElement)
    }

    const setPluginNotice = () => {
        if (data.player?.value) {
            const findElement = findParentElement(data.player.value)
            plugin.SetPluginNotice(findElement)
        } else {
            const container = ['#layout2Content', '#layoutMainContent', 'body']
            const findElement = container.find((item) => document.querySelector(item))!
            plugin.SetPluginNotice(findElement)
        }
    }

    watch(
        mode,
        (currentMode) => {
            if (currentMode === 'ocx') {
                if (!plugin.IsPluginAvailable()) {
                    plugin.SetPluginNoResponse()
                    plugin.ShowPluginNoResponse()
                }
            }
        },
        {
            immediate: true,
        },
    )

    watch(
        readyState,
        (val) => {
            if (val) {
                if (data.onReady) {
                    data.onReady(mode, plugin)
                }
            }
        },
        {
            immediate: true,
        },
    )

    watchEffect(() => {
        // && !plugin.IsInstallPlugin()
        if (mode.value === 'ocx' && ready.value) {
            setPluginNotice()
        }
    })

    onMounted(() => {
        if (data.onMessage) {
            plugin.VideoPluginNotifyEmitter.addListener(data.onMessage)
        }

        ready.value = true
    })

    onActivated(() => {
        if (!ready.value) {
            if (data.onMessage) {
                plugin.VideoPluginNotifyEmitter.addListener(data.onMessage)
            }

            ready.value = true
        }
    })

    onDeactivated(() => {
        ready.value = false

        if (data.onMessage) {
            plugin.VideoPluginNotifyEmitter.removeListener(data.onMessage)
        }

        if (data.onDestroy) {
            data.onDestroy(mode, plugin)
        }
    })

    onBeforeUnmount(() => {
        if (data.onMessage) {
            plugin.VideoPluginNotifyEmitter.removeListener(data.onMessage)
        }

        if (data.onDestroy) {
            data.onDestroy(mode, plugin)
        }
    })
}
