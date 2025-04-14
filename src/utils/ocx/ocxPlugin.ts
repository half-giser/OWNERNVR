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

    const systemInfo = getSystemInfo()
    const browserInfo = getBrowserInfo()

    const backupTask = useOcxBackUp((str) => {
        getVideoPlugin().ExecuteCmd(str)
    })

    VideoPluginNotifyEmitter.addListener(backupTask.notify)

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

    /**
     * @description 插件需更新
     * @param {string} downLoadUrl
     */
    const getPluginUpdateNotice = (downLoadUrl: string) => {
        pluginNoticeHtml.value = 'IDCS_PLUGIN_VERSION_UPDATE'
        pluginDownloadUrl.value = downLoadUrl
    }

    /**
     * @description Windows无安装插件
     * @param {string} downLoadUrl
     */
    const getPluginNotice = (downLoadUrl: string) => {
        pluginNoticeHtml.value = 'IDCS_NO_PLUGIN_FOR_WINDOWS'
        pluginDownloadUrl.value = downLoadUrl
    }

    /**
     * @description 设置通知在哪显示
     * @param {string} selector 容器Selector
     */
    const setPluginNotice = (selector: string = '') => {
        pluginNoticeContainer.value = selector
    }

    /**
     * NVR2.2+所支持的浏览器均支持WebSocket
     * @description 检测当前浏览器是否支持插件（websocket)
     * @returns {boolean}
     */
    // const checkSupportWebsocket = () => {
    //     const browserVersion = browserInfo.majorVersion
    //     const browserType = browserInfo.type
    //     // 若满足下列浏览器和对应的版本号，则需要升级浏览器（低版本不支持websocket）
    //     if (browserType === 'ie' && browserVersion < 10) {
    //         isPluginAvailable.value = false
    //         pluginNoticeHtml.value = 'IDCS_IE_VERSION_WARNING'
    //         return false
    //     } else if (browserType === 'chrome' && browserVersion < 57) {
    //         isPluginAvailable.value = false
    //         pluginNoticeHtml.value = 'IDCS_CHROME_VERSION_WARNING'
    //         return false
    //     } else if (browserType === 'firefox' && browserVersion < 53) {
    //         isPluginAvailable.value = false
    //         pluginNoticeHtml.value = 'IDCS_FIREFOX_VERSION_WARNING'
    //         return false
    //     } else if (browserType === 'opera' && browserVersion < 44) {
    //         isPluginAvailable.value = false
    //         pluginNoticeHtml.value = 'IDCS_OPERA_VERSION_WARNING'
    //         return false
    //     } else if (browserType === 'safari' && browserVersion < 11) {
    //         isPluginAvailable.value = false
    //         pluginNoticeHtml.value = 'IDCS_SAFARI_VERSION_WARNING'
    //         return false
    //     } else if ((browserType === 'edge' || browserType === 'lowEdge') && browserVersion < 16) {
    //         isPluginAvailable.value = false
    //         pluginNoticeHtml.value = 'IDCS_EDGE_VERSION_WARNING'
    //         return false
    //     } else if (!['ie', 'chrome', 'firefox', 'opera', 'safari', 'edge', 'lowEdge'].includes(browserInfo.type)) {
    //         isPluginAvailable.value = false
    //         pluginNoticeHtml.value = 'IDCS_OTHER_VERSION_WARNING'
    //         return false
    //     }
    //     return true
    // }

    /**
     * @description 视频插件通知回调
     * Firefox，Chrome中，回调函数名的字符串中不能出现“.”,否则插件无法识别，不能正确回调
     * @param {string} strXMLFormat
     */
    const VideoPluginNotify = async (strXMLFormat: string) => {
        const $ = queryXml(XMLStr2XMLDoc(strXMLFormat))
        const funcName = $('/response').attr('reqId').num()
        const stateType = $('statenotify').attr('type')

        if ($('response').length && funcName) {
            ;(getVideoPlugin() as ReturnType<typeof WebsocketPlugin>).queryInfoMap[funcName](strXMLFormat)
            return
        }

        if ($('statenotify[@target="dateCtrl"]').length) {
            // TimeSliderPluginNotify(strXMLFormat)
            return
        }

        if (stateType === 'NVMS_NAT_CMD') {
            const $response = $('statenotify/response')
            const $request = queryXml(XMLStr2XMLDoc(CMD_QUEUE.cmd.cmd))('//cmd[@type="NVMS_NAT_CMD"]/request')
            if ($response.attr('flag') === $request.attr('flag') && $response.attr('url') === $request.attr('url')) {
                CMD_QUEUE.resolve($response[0].element)
            }
        }

        // 获取插件返回的sessionId，用于刷新无感知登录（授权码登录成功后，返回sessionId)
        if (stateType === 'sessionId') {
            let sessionId = null
            if ($('statenotify/sessionId').length) {
                sessionId = $('statenotify/sessionId').text()
            }
            userSession.p2pSessionId = sessionId
            return
        }
        //OCX已创建好窗口，通知可以登录了
        else if (stateType === 'InitialComplete') {
            setVideoPluginStatus('InitialComplete')
            videoPluginLogin()
        }
        //连接成功
        else if (stateType === 'connectstate') {
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
                        if (VideoPluginReconnectTimeoutId !== null) {
                            // 重新连接成功，隐藏“加载中”状态
                            clearTimeout(VideoPluginReconnectTimeoutId)
                            VideoPluginReconnectTimeoutId = null
                        } else {
                            //初始化多语言翻译模块
                            await getLangTypes()
                            await getLangItems()

                            delCookie('ec')
                            delCookie('em')

                            //执行标准客户端的登录流程
                            const userInfoArr = userSession.getAuthInfo()
                            await videoPluginLoadLang()
                            const result = await doLogin('')
                            if (queryXml(result)('status').text() === 'success') {
                                if (userInfoArr) {
                                    setCookie('lastSN', userInfoArr[2], 36500)
                                }
                                await userSession.updateByLogin('P2P', result)
                                generateAsyncRoutes()
                                router.replace('/live')
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
                    switch (errorCode) {
                        case ErrorCode.USER_ERROR_NODE_NET_DISCONNECT: //SN掉线，重新连接
                            setVideoPluginStatus('Reconnecting')
                            openLoading()
                            VideoPluginReconnectTimeoutId = setTimeout(() => {
                                videoPluginLogin()
                            }, VideoPluginReconnectTimeout)
                            return
                        case 536871080: // 设备已被绑定，需要授权码方式登录
                            const authCodeIndex = errorDescription
                            userSession.authCodeIndex = authCodeIndex
                            if (curRoutUrl.includes('authCodeLogin')) {
                                execLoginTypeCallback(P2P_ACCESS_TYPE_AUTHCODE_LOGIN, authCodeIndex)
                            } else {
                                layoutStore.isInitial = true
                                router.push('/authCodeLogin')
                            }
                            return
                    }

                    if (curRoutUrl.includes('authCodeLogin')) {
                        execLoginErrorCallback(errorCode, errorDescription)
                    } else {
                        goToIndex(errorCode, errorDescription)
                    }
                    return
                } else {
                    if (getIsReconn()) {
                        setTimeout(() => {
                            videoPluginLogin()
                        }, VideoPluginReconnectTimeout)
                    }
                }
            }
        }

        VideoPluginNotifyEmitter.emit($, stateType, strXMLFormat)
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

            const userInfoArr = userSession.getAuthInfo()
            if (userInfoArr !== null) {
                exec()
            } else {
                const stopWatch = watch(
                    () => userSession.getAuthInfo(),
                    async (userInfoArr) => {
                        if (userInfoArr !== null) {
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
        // await queryNetStatus()
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
                if ($item('portType').text() === 'SERVICE') {
                    if (isSubIpUsed && isUPnPEnable) {
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
        const id = ''
        const sendXML = OCX_XML_SetLoginInfo(userSession.serverIp, pluginStore.pluginPort, id)
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
     * @description p2p SessionId登录
     */
    const p2pSessionIdLogin = () => {
        const p2pSessionId = userSession.p2pSessionId
        const userInfoArr = userSession.getAuthInfo()
        if (p2pSessionId && userInfoArr && userInfoArr[2]) {
            const sendXML = OCX_XML_SetSessionIdLogin_P2P(p2pSessionId, userInfoArr[2])
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
            if (userSession.p2pSessionId) {
                p2pSessionIdLogin()
            } else {
                p2pUsernameLogin()
            }
        } else {
            if (userSession.sessionId) {
                await videoPluginLoadLang()
                videoPluginLoginForStandard()
            }
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
        cmd: string
        resolve: ($: Element) => void
        reject: (e: string) => void
    }

    // P2P命令发送队列
    const CMD_QUEUE = {
        viewFlag: 1, //当页面切换后，该flag加1，OCX将不会处理上一个页面的请求
        cmd: {
            cmd: '',
            resolve: () => {},
            reject: () => {},
        } as CmdQueue,
        queue: [] as CmdQueue[], // { cmd: string }
        lock: false, //锁定标识：当前命令没有返回时，不能发送新的命令
        timeout: 300000, //命令超时时长，如果一个命令发出后，在_timeout时间内没返回，就认为超时
        timeoutId: 0 as NodeJS.Timeout | number,
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
            getVideoPlugin().ExecuteCmd(cmd.cmd)
            this.timeoutId = setTimeout(() => {
                this.reject()
            }, this.timeout)
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

        // if (!checkSupportWebsocket()) {
        //     setPluginNotice('body')
        //     return
        // }
        const connPlugin = WebsocketPlugin({
            wsType: 'pluginMainProcess',
            port: userSession.appType === 'STANDARD' ? ClientPort : P2PClientPort,
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
     * @description 初始化视频插件
     */
    const initVideoPlugin = () => {
        if (videoPlugin) return
        switch (systemInfo.platform) {
            case 'windows':
                initWinPlugin()
                break
            default:
                console.error("The plugin don't support current operating system!")
        }
    }

    /**
     * @description 初始化Windows视频插件
     */
    const initWinPlugin = () => {
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
                pluginStore.currPluginMode = 'ocx'
                pluginStore.showPluginNoResponse = false // 插件崩溃时提示插件无响应
                loadWinPlugin()
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
    const loadWinPlugin = () => {
        const path = getPluginPath()
        const downLoadUrl = userSession.appType === 'STANDARD' ? path.ClientPluDownLoadPath : path.P2PClientPluDownLoadPath
        let needUpate = true
        const sendXML = OCX_XML_GetOcxVersion()
        getVideoPlugin().QueryInfo(sendXML, (strXMLFormat) => {
            const $ = queryXml(XMLStr2XMLDoc(strXMLFormat))
            const $xmlDoc = $('//response[@type="GetOcxVersion"]')
            if ($xmlDoc.length > 0) {
                const intCurVer = $xmlDoc.text()
                if (compareOcxVersion(intCurVer, path.ClientPluVer) >= 0) {
                    needUpate = false
                }
            }

            if (needUpate) {
                isPluginAvailable.value = false
                getPluginUpdateNotice(downLoadUrl)
            }

            if (needUpate) {
                isPluginAvailable.value = false
                isInstallPlugin.value = false
                // 将showPluginNoResponse置为空，避免更新插件并安装后页面弹出：插件无响应
                pluginStore.showPluginNoResponse = false
                if (userSession.appType === 'P2P') {
                    setPluginNotice('body')
                }
                return
            } else {
                isPluginAvailable.value = true
                setVideoPluginStatus('Loaded')
            }

            //设置OCX模式
            try {
                if (userSession.appType === 'P2P') {
                    const sendXML = OCX_XML_Initial_P2P('Interactive', 'VideoPluginNotify', 'Live', 1)
                    getVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    const sendXML = OCX_XML_Initial('Interactive', 'VideoPluginNotify', 'Live')
                    getVideoPlugin().ExecuteCmd(sendXML)
                }

                const sendXML = OCX_XML_SetProperty({ calendarType: userSession.calendarType, supportRecStatus: true })
                getVideoPlugin().ExecuteCmd(sendXML)
            } catch (ex) {}
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
    const executeCmd = (cmd: string) => {
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
        const path = getPluginPath()
        if (userSession.appType === 'P2P') {
            getPluginNotice(path.P2PClientPluDownLoadPath)
            // 与插件建链成功后，发生了错误，禁止跳转到插件下载页面,保留当前页面状态
            if (pluginStore.showPluginNoResponse) return
            if (!startPluginError && route.path.includes('authCodeLogin')) return
            setPluginNotice('body')
        } else {
            getPluginNotice(path.ClientPluDownLoadPath)
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
        const navHeight = document.getElementById('layoutMainHeader')!.clientHeight
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
        observerList: Map<HTMLElement, 'intersect' | 'visible'> // HTMLElement[]
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
        const browserScrollCallback = () => {
            setPluginSize(pluginPlaceholderId, getVideoPlugin())
        }

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

        // 观察弹窗样式变化 重新设置插件大小、显示隐藏
        const mutationObserver = new MutationObserver((mutationsList) => {
            let flag = false
            for (const mutation of mutationsList) {
                if (mutation.attributeName === 'style') {
                    if ((mutation.target as HTMLElement).querySelector('.PluginPlayer') === null) {
                        flag = true
                    } else {
                        browserScrollCallback()
                    }
                }
            }

            if (flag) {
                const data = browserEventMap.get(pluginPlaceholderId)
                if (data) {
                    const rect = data.element.getBoundingClientRect()
                    let hasPop = false
                    data.observerList.forEach((type, element) => {
                        if (hasPop) {
                            return
                        }

                        if (type === 'intersect') {
                            const observeRect = element.getBoundingClientRect()
                            hasPop = element.style.display !== 'none' && isOverlap(rect, observeRect)
                            return
                        }

                        hasPop = element.style.display !== 'none'
                    })

                    if (!hasPop && browserEventMap.data.length) {
                        forcedHidden = false
                        displayOCX(true)
                    }

                    if (hasPop) {
                        forcedHidden = true
                        displayOCX(false)
                    }
                }
            }
        })

        /**
         * @notice 这里自动获取同步加载的对话框组件，并把它们添加进观察列表
         * 如果是异步方式加载的组件，这里将添加失败，需要手动地执行ObserverElement()来添加
         */

        const observerList = new Map<HTMLElement, 'intersect' | 'visible'>()

        const dialogs = document.querySelectorAll('.el-dialog')
        for (const dialog of dialogs) {
            if (dialog.querySelector('.PluginPlayer') !== null) {
                mutationObserver.observe(dialog, { attributes: true })
            }
        }

        const overlays = document.querySelectorAll('.el-overlay')
        for (const overlay of overlays) {
            mutationObserver.observe(overlay, { attributes: true })
            observerList.set(overlay as HTMLElement, 'visible')
        }

        const poppers = document.querySelectorAll('.el-popover')
        for (const popper of poppers) {
            mutationObserver.observe(popper, { attributes: true })
            observerList.set(popper as HTMLElement, 'intersect')
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
                browserEventMap.get(pluginRefDiv)!.observerList.set(observeElement, observeType)
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

    onMounted(() => {
        disposePlugin()

        if (userSession.appType === 'STANDARD') {
            startV2Process()
        } else {
            if (userSession.refreshLoginPage) {
                userSession.clearSession()
                goToIndex()
                return
            }

            // siteDictionary.js 在根目录下
            const script = document.createElement('script')
            script.onload = () => {
                userSession.p2pSessionId = null
                startV2Process()
            }
            script.src = `${import.meta.env.VITE_P2P_URL}/siteDictionary.js?v=${import.meta.env.VITE_PACKAGE_VER}`
            document.body.appendChild(script)
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
        DisplayOCX: displayOCX,
        GetVideoPluginStatus: getVideoPluginStatus,
        SetVideoPluginStatus: setVideoPluginStatus,
        VideoPluginLogin: videoPluginLogin,
        P2pAuthCodeLogin: p2pAuthCodeLogin,
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

    onBeforeUnmount(() => {
        if (data.onMessage) {
            plugin.VideoPluginNotifyEmitter.removeListener(data.onMessage)
        }

        if (data.onDestroy) {
            data.onDestroy(mode, plugin)
        }
    })
}
