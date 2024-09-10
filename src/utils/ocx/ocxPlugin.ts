/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-03 11:57:07
 * @Description: OCX插件模块
 * 原项目中MAC插件和TimeSliderPlugin相关逻辑不保留
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 16:21:17
 */
import WebsocketPlugin from '@/utils/websocket/websocketPlugin'
import { APP_TYPE } from '@/utils/constants'
import { ClientPort, P2PClientPort, P2PACCESSTYPE, SERVER_IP, getPluginPath, PluginSizeModeMapping, type OCX_Plugin_Notice_Map } from '@/utils/ocx/ocxUtil'

type PluginStatus = 'Unloaded' | 'Loaded' | 'InitialComplete' | 'Connected' | 'Disconnected' | 'Reconnecting'

type EmbedPlugin = HTMLEmbedElement & {
    queryInfoMap: Record<number, (str: string) => void>
    QueryInfo: (str: string) => string
    ExecuteCmd: (str: string) => void
    Destroy: () => void
    LiveNotify2Js: (strXMLFormat: string) => Promise<void>
}

let plugin: ReturnType<typeof useOCXPlugin> | null = null

const useOCXPlugin = () => {
    const pluginStore = usePluginStore()
    const { Translate, getLangTypes, getLangItems, langItems } = useLangStore()
    const { openMessageTipBox } = useMessageBox()
    const router = useRouter()
    const { closeLoading, openLoading, LoadingTarget } = useLoading()
    const userSession = useUserSessionStore()
    const layoutStore = useLayoutStore()
    const route = useRoute()

    // 通知相关
    const isPluginAvailable = ref(true) //插件是否有效
    const pluginNoticeHtml = ref<keyof typeof OCX_Plugin_Notice_Map | ''>('')
    const pluginDownloadUrl = ref('')
    const pluginNoticeContainer = ref('')
    const isInstallPlugin = ref(false) // 插件已安装运行标记

    let videoPlugin: WebsocketPlugin | null = null // | EmbedPlugin //主视频插件
    let videoPluginStatus: PluginStatus = 'Unloaded' // Unloaded, Loaded, InitialComplete, Connected, Disconnected, Reconnecting

    const VideoPluginReconnectTimeout = 5000 // 断开重新连接时间
    let VideoPluginReconnectTimeoutId: NodeJS.Timeout | null = null // 重新连接超时ID

    const VideoPluginNotifyEmitter = CreateEvent('notify')

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
    let loginErrorCallback: (code?: number, desc?: string) => void = () => {}

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
            } else if (Number(var1Arr[i]) == Number(var2Arr[i])) {
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
     * @description 检测当前浏览器是否支持插件（websocket)
     * @returns {boolean}
     */
    const checkSupportWebsocket = () => {
        const browserVersion = browserInfo.majorVersion
        const browserType = browserInfo.type
        // 若满足下列浏览器和对应的版本号，则需要升级浏览器（低版本不支持websocket）
        if (browserType == 'ie' && browserVersion < 10) {
            isPluginAvailable.value = false
            pluginNoticeHtml.value = 'IDCS_IE_VERSION_WARNING'
            return false
        } else if (browserType == 'chrome' && browserVersion < 57) {
            isPluginAvailable.value = false
            pluginNoticeHtml.value = 'IDCS_CHROME_VERSION_WARNING'
            return false
        } else if (browserType == 'firefox' && browserVersion < 53) {
            isPluginAvailable.value = false
            pluginNoticeHtml.value = 'IDCS_FIREFOX_VERSION_WARNING'
            return false
        } else if (browserType == 'opera' && browserVersion < 44) {
            isPluginAvailable.value = false
            pluginNoticeHtml.value = 'IDCS_OPERA_VERSION_WARNING'
            return false
        } else if (browserType == 'safari' && browserVersion < 11) {
            isPluginAvailable.value = false
            pluginNoticeHtml.value = 'IDCS_SAFARI_VERSION_WARNING'
            return false
        } else if ((browserType == 'edge' || browserType == 'lowEdge') && browserVersion < 16) {
            isPluginAvailable.value = false
            pluginNoticeHtml.value = 'IDCS_EDGE_VERSION_WARNING'
            return false
        } else if (!['ie', 'chrome', 'firefox', 'opera', 'safari', 'edge', 'lowEdge'].includes(browserInfo.type)) {
            isPluginAvailable.value = false
            pluginNoticeHtml.value = 'IDCS_OTHER_VERSION_WARNING'
            return false
        }
        return true
    }

    /**
     * @description 视频插件通知回调
     * Firefox，Chrome中，回调函数名的字符串中不能出现“.”,否则插件无法识别，不能正确回调
     * @param {string} strXMLFormat
     */
    const VideoPluginNotify = async (strXMLFormat: string) => {
        const $ = queryXml(XMLStr2XMLDoc(strXMLFormat))
        const funcName = Number($('/response').attr('reqId'))

        if ($('/response').length && funcName) {
            ;(getVideoPlugin() as WebsocketPlugin).queryInfoMap[funcName](strXMLFormat)
            return
        }

        if ($('/statenotify[@target="dateCtrl"]').length) {
            // TimeSliderPluginNotify(strXMLFormat)
            return
        }
        if ($('/statenotify[@type="NVMS_NAT_CMD"]').length) {
            const $response = $('/statenotify[@type="NVMS_NAT_CMD"]/response')
            const $request = queryXml(XMLStr2XMLDoc(CMD_QUEUE.cmd))("//cmd[@type='NVMS_NAT_CMD']/request")
            const curCmdUrl = $request.attr('url')
            const curCmdFlay = $request.attr('flag')
            if ($response.attr('flag') === curCmdFlay && $response.attr('url') === curCmdUrl) {
                try {
                    CMD_QUEUE.unlock()
                    clearTimeout(CMD_QUEUE.timeoutId)
                } catch (ex) {
                } finally {
                    CMD_QUEUE.next()
                }
            }
        }
        // 获取插件返回的sessionId，用于刷新无感知登录（授权码登录成功后，返回sessionId)
        if ($("/statenotify[@type='sessionId']").length) {
            let sessionId = null
            if ($('/statenotify[@type="sessionId"]/sessionId').length) {
                sessionId = $('/statenotify[@type="sessionId"]/sessionId').text()
            }
            pluginStore.p2pSessionId = sessionId
            return
        }
        //OCX已创建好窗口，通知可以登录了
        else if ($('/statenotify[@type="InitialComplete"]').length) {
            setVideoPluginStatus('InitialComplete')
            videoPluginLogin()
        }
        //连接成功
        else if ($('/statenotify[@type="connectstate"]').length) {
            const $xmlNote = $('/statenotify[@type="connectstate"]')
            let status = ''
            if ($('/statenotify[@type="connectstate"]/status').length) {
                status = $('/statenotify[@type="connectstate"]/status').text().trim()
            } else {
                status = $xmlNote.text().trim()
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
                    if (APP_TYPE === 'P2P') {
                        closeLoading()
                        if (VideoPluginReconnectTimeoutId !== null) {
                            // 重新连接成功，隐藏“加载中”状态
                            clearTimeout(VideoPluginReconnectTimeoutId)
                            VideoPluginReconnectTimeoutId = null
                        } else {
                            // if (systemInfo.platform === 'mac') {
                            //     isPluginAvailable.value = true
                            // }

                            //初始化多语言翻译模块
                            await getLangTypes()
                            await getLangItems()
                            layoutStore.isInitial = true
                            delCookie('ec')
                            delCookie('em')

                            //执行标准客户端的登录流程
                            const userInfoArr = userSession.getAuthInfo()
                            const sendXML = OCX_XML_SetLang()
                            getVideoPlugin().ExecuteCmd(sendXML)
                            router.replace('/live')
                            const result = await doLogin(getXmlWrapData(''), {}, false)
                            if (queryXml(result)('/response/status').text() === 'success') {
                                // TODO !!!
                                if (userInfoArr) {
                                    setCookie('lastSN', userInfoArr[2], 36500)
                                }
                                userSession.updateByLogin('P2P', result)
                            } else {
                                Logout()
                            }
                        }
                    }
                }
            } else {
                if (APP_TYPE === 'P2P') {
                    const errorCode = Number($('/statenotify/errorCode').text())
                    const errorDescription = $('/statenotify/errorDescription').text() || ''
                    const curRoutUrl = route.path
                    switch (errorCode) {
                        case ErrorCode.USER_ERROR_NODE_NET_DISCONNECT: //SN掉线，重新连接
                            setVideoPluginStatus('Reconnecting')
                            openLoading()
                            VideoPluginReconnectTimeoutId = setTimeout(function () {
                                videoPluginLogin()
                            }, VideoPluginReconnectTimeout)
                            return
                        case 536871080: // 设备已被绑定，需要授权码方式登录
                            const authCodeIndex = errorDescription
                            pluginStore.authCodeIndex = authCodeIndex
                            if (curRoutUrl.includes('authCodeLogin')) {
                                execLoginTypeCallback(P2PACCESSTYPE.P2P_AUTHCODE_LOGIN, authCodeIndex)
                            } else {
                                router.replace('/live')
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

        VideoPluginNotifyEmitter.emit($, strXMLFormat)
    }

    let videoPluginLoadLang_timeoutId: NodeJS.Timeout | null = null

    /**
     * @description 初始化成功后，检测到语言包加载成功后，设置插件的语言内容
     */
    const videoPluginLoadLang = () => {
        if (Object.keys(langItems).length) {
            if (videoPluginLoadLang_timeoutId !== null) {
                clearTimeout(videoPluginLoadLang_timeoutId)
                videoPluginLoadLang_timeoutId = null
            }
            const sendXML = OCX_XML_SetLang()
            getVideoPlugin().ExecuteCmd(sendXML)
        } else {
            videoPluginLoadLang_timeoutId = setTimeout(videoPluginLoadLang, 500)
        }
    }

    let videoPluginLoginForStandard_timeoutId: NodeJS.Timeout | null = null

    /**
     * @description 标准客户端插件登录
     * 初始化成功后，检测到客户端登录成功后，插件立即登录
     */
    const videoPluginLoginForStandard = () => {
        const userInfoArr = userSession.getAuthInfo()
        if (userInfoArr != null) {
            if (videoPluginLoginForStandard_timeoutId != null) {
                clearTimeout(videoPluginLoginForStandard_timeoutId)
                videoPluginLoginForStandard_timeoutId = null
            }

            if (!pluginStore.pluginPort) {
                // 跳转初始页面前，获取OCX请求视频端口，只请求一次，全局保存
                getPort((port) => {
                    pluginStore.pluginPort = port
                    _videoPluginLoginForStandard()
                })
            } else {
                _videoPluginLoginForStandard()
            }
        } else {
            videoPluginLoginForStandard_timeoutId = setTimeout(videoPluginLoginForStandard, 500)
        }
    }

    /**
     * @description 获取端口
     * @param {Function} callback
     */
    const getPort = async (callback?: (p: number) => void) => {
        let hostName = window.top!.location.hostname
        let isSubIpUsed = false // 辅IP登录，插件使用externalPort登录
        queryNetStatus()
            .then(() => {
                if (hostName.indexOf('[') !== -1 || hostName.lastIndexOf(']') !== -1) {
                    hostName = hostName.substring(hostName.indexOf('[') + 1, hostName.indexOf(']'))
                }
                return queryNetCfgV2()
            })
            .then((result) => {
                const $ = queryXml(result)
                if ($('//status').text() === 'success') {
                    $('//content/nicConfigs/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        if (item.attr('isSupSecondIP') === 'true') {
                            // 判断是否使用了辅IP
                            const secondIpSwitch = $item('secondIpSwitch').text().toBoolean()
                            isSubIpUsed = hostName === $item('secondIp').text() && secondIpSwitch
                        }
                    })
                }
                return queryUPnPCfg()
            })
            .then((result) => {
                const $ = queryXml(result)
                if ($('//status').text() === 'success') {
                    const isUPnPEnable = $('//content/switch').text().toBoolean()
                    let port = 0
                    $('//content/ports/item').forEach((item) => {
                        const $item = queryXml(item.element)

                        if ($item('portType').text() === 'SERVICE') {
                            if (isSubIpUsed && isUPnPEnable) {
                                port = Number($item('externalPort').text())
                            } else {
                                port = Number($item('localPort').text())
                            }
                            return false
                        }
                    })
                    callback && callback(port)
                }
            })
    }

    /**
     * @description 标准用户名/密码登录
     */
    const _videoPluginLoginForStandard = () => {
        // userInfoArr: string[]
        // const username = userInfoArr[0]
        // const password = userInfoArr[1]
        const id = ''
        const sendXML = OCX_XML_SetLoginInfo(SERVER_IP, pluginStore.pluginPort, id)
        getVideoPlugin().ExecuteCmd(sendXML)
    }

    /**
     * @description p2p用户名/密码登录
     */
    const p2pUsernameLogin = () => {
        pluginStore.p2pSessionId = null // 采用用户名/密码登录，要么无sessionId, 要么产生新的授权码后有新的sessionId
        const userInfoArr = userSession.getAuthInfo()
        if (userInfoArr != null) {
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
        const p2pSessionId = pluginStore.p2pSessionId
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
    const videoPluginLogin = () => {
        if (APP_TYPE === 'P2P') {
            if (pluginStore.p2pSessionId) {
                p2pSessionIdLogin()
            } else {
                p2pUsernameLogin()
            }
        } else {
            if (userSession.sessionId) {
                videoPluginLoadLang()
                videoPluginLoginForStandard()
            }
        }
    }

    /**
     * @description
     * @param errorCode
     * @param errorDescription
     */
    const goToIndex = (errorCode?: number, errorDescription?: string) => {
        errorCode && setCookie('ec', errorCode)
        errorDescription && setCookie('em', errorDescription.trim())
        // TODO: what is it?
        // window.location.href = '/index.html'
        router.push({
            path: '/live',
        })
    }

    //命令发送队列
    const CMD_QUEUE = {
        viewFlag: 1, //当页面切换后，该flag加1，OCX将不会处理上一个页面的请求
        cmd: '',
        queue: [] as string[], // { cmd: string }
        lock: false, //锁定标识：当前命令没有返回时，不能发送新的命令
        timeout: 60000, //命令超时时长，如果一个命令发出后，在_timeout时间内没返回，就认为超时
        timeoutId: 0 as NodeJS.Timeout | number,
        add(cmd: string) {
            if (this.queue.length > 10000) {
                throw 'CMD_QUEUE is full'
            }
            this.queue.push(cmd)
            if (this.queue.length == 1 && !this.lock) {
                setTimeout(this.execute, 10)
            }
            return cmd
        },
        execute() {
            if (this.queue.length == 0 || this.lock) {
                return
            }
            this.lock = true
            const cmd = this.queue.shift()!
            this.cmd = cmd
            getVideoPlugin().ExecuteCmd(cmd)
            this.timeoutId = setTimeout(() => {
                this.unlock()
                this.next()
            }, this.timeout)
        },
        unlock() {
            this.lock = false
        },
        clear() {
            this.cmd = ''
            this.queue.length = 0
            this.lock = false
        },
        next() {
            this.cmd = ''
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

        if (!checkSupportWebsocket()) {
            setPluginNotice('body')
            return
        }
        const connPlugin = new WebsocketPlugin({
            wsType: 'pluginMainProcess',
            port: APP_TYPE === 'STANDARD' ? ClientPort : P2PClientPort,
            onopen: () => {
                isInstallPlugin.value = true
            },
            onmessage: (strXMLFormat: string) => {
                const $ = queryXml(XMLStr2XMLDoc(strXMLFormat))
                if ($('/response').attr('type') === 'SetWebSocketPort') {
                    const port = Number($('/response/port').text())
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
            pluginErrorHandle()
            return
        }
        videoPlugin = new WebsocketPlugin({
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
                showPluginNoResponse()
            },
        })
    }

    /**
     * @description 加载Windows插件
     */
    const loadWinPlugin = () => {
        const path = getPluginPath()
        const downLoadUrl = APP_TYPE === 'STANDARD' ? path.ClientPluDownLoadPath : path.P2PClientPluDownLoadPath
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
                APP_TYPE == 'P2P' && setPluginNotice('body')
                return
            } else {
                isPluginAvailable.value = true
                setVideoPluginStatus('Loaded')
            }

            //设置OCX模式
            try {
                if (APP_TYPE === 'P2P') {
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
     * @description 根据是否选择插件切换不同的页面
     */
    const togglePageByPlugin = () => {
        let currPluginMode = pluginStore.currPluginMode
        // 如果当前浏览器不支持H5，获取的插件模式为'h5'时，需要进行转换为'ocx'
        if (APP_TYPE == 'STANDARD' && 'WebAssembly' in window) {
            // currPluginMode = currPluginMode // || 'h5'
        } else {
            currPluginMode = 'ocx'
        }
        pluginStore.currPluginMode = currPluginMode
    }

    /**
     * @description 插件异步查询信息
     * @param pluginObj
     * @param sendXML
     * @param callback
     */
    const asynQueryInfo = (pluginObj: WebsocketPlugin | EmbedPlugin | typeof FakePluginForWasm, sendXML: string, callback?: (str: string) => void) => {
        pluginObj.QueryInfo(sendXML, (strXMLFormat: string) => {
            callback && callback(strXMLFormat)
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
            if (getVideoPluginStatus() == 'Disconnected') {
                setVideoPluginStatus('Reconnecting')
                videoPluginLogin()
            }
        }

        return videoPlugin ? videoPlugin : FakePluginForWasm
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
    const setLoginTypeCallback = (callback: ((loginType: string, authCodeIndex: string) => void) | null) => {
        p2pLoginTypeCallback = callback
    }

    /**
     * @description 执行P2P登录回调
     * @returns {Function}
     */
    const execLoginTypeCallback = (loginType: string, authCodeIndex: string) => {
        if (typeof p2pLoginTypeCallback == 'function') {
            p2pLoginTypeCallback(loginType, authCodeIndex)
        } else {
            // TODO what is it?
            // window.location.href = '/index.html'
            router.push({
                path: '/live',
            })
        }
    }

    /**
     * @description 设置登录失败回调
     * @param {Function} callback
     */
    const setLoginErrorCallback = (callback: () => void) => {
        loginErrorCallback = callback
    }

    /**
     * @description 执行登录失败回调
     * @param {number} errorCode
     * @param {string} errorDescription
     * @returns {Function}
     */
    const execLoginErrorCallback = (errorCode?: number, errorDescription?: string) => {
        if (typeof loginErrorCallback == 'function') {
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
        if (APP_TYPE == 'P2P') {
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
        // }
        pluginStore.ocxPort = 0
        pluginStore.currPluginMode = null
        videoPlugin = null
    }

    let isPluginNoResponse = false

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
        if (isPluginNoResponse) return

        isPluginNoResponse = true
        openMessageTipBox({
            type: 'info',
            message: Translate('IDCS_PLUGIN_NO_RESPONSE_TIPS'),
        })
            .then(() => {
                Logout()
            })
            .finally(() => {
                isPluginNoResponse = false
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
            setTimeout(function () {
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
        // TODO effect
        // 有弹框时，不显示视频插件窗口（排除录像回放窗口、通道预览窗口、系统设置-》POS显示弹窗设置窗口）
        // if (isShow && $('.tvt_dialog').length > 0 && $('#popRec_content').length == 0 && $('#popLiveOCX').length == 0 && $('#editDisplaySet').length == 0) {
        //     return
        // }
        if (isShow && layoutStore.messageBoxCount) return
        /**
         * 大回放页面事件模式窗口、任务备份表格、事件录像记录表格显示时;
         */
        // if (isShow && $('.ocxWinCover').is(':visible')) return
        /**
         * 智能分析-》车辆搜索-》停车记录tab激活时,不显示视频插件窗口，通过特殊类ocxWinTab进行标记
         */
        // if (isShow && $('.ocxWinTab').hasClass('active')) return

        // 检查浏览器当前标签页是否为可见。若不可见,则不显示视频插件窗口
        if (isShow && document.visibilityState == 'hidden') return
        if (!getIsPluginAvailable()) return
        // if (systemInfo.platform === 'mac' && APP_TYPE === 'P2P') {
        //     // TODO effect
        //     // if ($('.tvt_dialog').length > 0 && isShow && $('#popRec_content').length == 0) {
        //     //     return
        //     // }

        //     /*ocx假隐藏*/
        //     const ocx = document.querySelectorAll('object,embed') as NodeListOf<HTMLElement>
        //     ocx.forEach((element) => {
        //         if (isShow && element.getAttribute('pluginPlaceholderId')) {
        //             if (element.getAttribute('plugin_visible') === 'false') {
        //                 setPluginSize(document.getElementById(element.getAttribute('pluginPlaceholderId') as string), element as EmbedPlugin)
        //             }
        //         } else {
        //             element.style.setProperty('width', '1px')
        //             element.style.setProperty('height', '1px')
        //         }
        //         if (isShow) {
        //             element.setAttribute('plugin_visible', 'true')
        //         } else {
        //             element.setAttribute('plugin_visible', 'false')
        //         }
        //     })
        //     return
        // }
        const sendXML = OCX_XML_DisplayPlugin(isShow)
        getVideoPlugin().ExecuteCmd(sendXML)
    }

    /**
     * @description 设置插件大小
     * @param {HTMLElement} pluginRefDiv 视频占位符元素
     * @param {Object} pluginObj 视频插件
     */
    const setPluginSize = (pluginRefDiv: HTMLElement | null, pluginObj?: ReturnType<typeof getVideoPlugin>, shouldAdjust = false) => {
        // if (!context) context = document.body // $('body')
        if (!pluginObj) pluginObj = getVideoPlugin()
        // if (systemInfo.platform === 'mac' && APP_TYPE === 'P2P') {
        //     setPluginSizeForP2PMac(pluginRefDiv, pluginObj as EmbedPlugin)
        //     return
        // }
        if (!pluginRefDiv) {
            return
        }

        // // 获取浏览器的缩放比率
        const ratio = window.devicePixelRatio
        // 视频插件占位符尺寸
        const divOcxRect = pluginRefDiv.getBoundingClientRect(),
            divOcxLeft = divOcxRect.left * ratio,
            divOcxTop = divOcxRect.top * ratio
        let refW = divOcxRect.width * ratio,
            refH = divOcxRect.height * ratio
        const navHeight = 100 * ratio // 页面顶部导航栏高度
        const browserType = browserInfo.type // 浏览器类型

        const ocxMode = PluginSizeModeMapping[browserType]
        let winLeft = 0,
            winTop = 0,
            menuH = 0 // 浏览器工具栏高度（包含了地址栏、书签栏）
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
        // && $.inArray(pluginPlaceholderId, ['divPopRecOCX', 'popLiveOCX']) == -1
        if (divOcxTop <= navHeight) {
            winTop = ocxMode == 'relativeToBrowser' || browserType == 'lowEdge' ? navHeight + menuH : navHeight
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
        if (ocxMode == 'relativeToScreen') {
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
        const domWidth = ocxMode == 'relativeToDom' ? window.innerWidth * ratio : 0
        const domHeight = ocxMode == 'relativeToDom' ? window.innerHeight * ratio : 0
        const sendXML = OCX_XML_SetPluginSize(winLeft, winTop, adjust(refW), adjust(refH), ocxMode, domWidth, domHeight)
        pluginObj.ExecuteCmd(sendXML)
    }

    /**
     * @description 根据浏览器的缩放比例获取视口大小
     * @param {number} ratio
     * @returns {Object}
     */
    const getViewPort = (ratio: number) => {
        if (document.compatMode == 'BackCompat') {
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
        browserScrollCallback: (e: Event) => void
        browserMoveTimer: NodeJS.Timeout
        mutationObserver: MutationObserver
        resizeObserver: ResizeObserver
        observerList: HTMLElement[]
    }

    const browserEventMap = new Map<HTMLElement, BrowserMoveEventObj>()

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
        const keys = browserEventMap.keys()
        let current = keys.next()
        while (current.value) {
            closeCurPlugin(current.value)
            current = keys.next()
        }
    }

    /**
     * @description 关闭插件位置监听
     * @param pluginPlaceholderId
     * @returns
     */
    const disableUpdatePluginPos = (pluginPlaceholderId: HTMLElement | null) => {
        if (!pluginPlaceholderId) return null
        if (browserEventMap.has(pluginPlaceholderId)) {
            const browserMoveEventObj = browserEventMap.get(pluginPlaceholderId)!
            document.getElementById('layoutMainContent')?.removeEventListener('scroll', browserMoveEventObj.browserScrollCallback)
            window.removeEventListener('scroll', browserMoveEventObj.browserScrollCallback)
            window.removeEventListener('resize', browserMoveEventObj.browserScrollCallback)
            clearInterval(browserMoveEventObj.browserMoveTimer)
            browserMoveEventObj.mutationObserver.disconnect()
            browserMoveEventObj.resizeObserver.disconnect()
            browserEventMap.delete(pluginPlaceholderId)
            forcedHidden = false
        }
    }

    let forcedHidden = false

    /**
     * @description 监听浏览器窗口的移动，控制插件随之一起移动
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
        let oldX = 0,
            oldY = 0,
            oldWidth = 0,
            oldHeihgt = 0

        const browserMoveTimer = setInterval(() => {
            // 最小化浏览器时, screenX会变成-32000, 此时不重新设置尺寸
            if (window.screenX < -30000 || window.screenY < -30000) return
            // 浏览器窗口的尺寸（x,y,width,height)发生变化时，视为浏览器窗口发生了移动
            const screenX = window.screenX
            const screenY = window.screenY
            const width = window.outerWidth
            const height = window.outerHeight
            if (oldX == screenX && oldY == screenY && oldWidth == width && oldHeihgt == height) return
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

        // 观察弹窗样式变化 重新设置插件大小
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
                    const hasPop = data.observerList.some((item) => {
                        return item.style.display !== 'none'
                    })
                    if (!hasPop && browserEventMap.size) {
                        displayOCX(true)
                        forcedHidden = false
                    }
                    if (hasPop) {
                        displayOCX(false)
                        forcedHidden = true
                    }
                }
            }
        })

        const observerList: HTMLElement[] = []
        const overlays = document.querySelectorAll('.el-overlay')
        const dialogs = document.querySelectorAll('.el-dialog')
        const poppers = document.querySelectorAll('.el-popover')
        for (const dialog of dialogs) {
            if (dialog.querySelector('.PluginPlayer') !== null) {
                mutationObserver.observe(dialog, { attributes: true })
            }
        }
        for (const overlay of overlays) {
            mutationObserver.observe(overlay, { attributes: true })
            observerList.push(overlay as HTMLElement)
        }
        for (const popper of poppers) {
            if (popper.classList.contains('popper')) {
                continue
            }
            mutationObserver.observe(popper, { attributes: true })
            observerList.push(popper as HTMLElement)
        }

        // 观察容器大小变化 重新设置插件大小
        const resizeObserver = new ResizeObserver(() => {
            browserScrollCallback()
        })
        resizeObserver.observe(pluginPlaceholderId)

        document.getElementById('layoutMainContent')?.addEventListener('scroll', browserScrollCallback)
        window.addEventListener('scroll', browserScrollCallback)
        window.addEventListener('resize', browserScrollCallback)
        browserEventMap.set(pluginPlaceholderId, {
            browserMoveTimer: browserMoveTimer,
            browserScrollCallback: browserScrollCallback,
            mutationObserver: mutationObserver,
            resizeObserver: resizeObserver,
            observerList: observerList,
        })
    }

    /**
     * @description VisibleChange事件回调
     */
    const pageVisibleChangeHandle = () => {
        if (!getIsPluginAvailable()) {
            return
        }
        if (document.visibilityState == 'hidden') {
            //状态判断
            displayOCX(false)
        } else {
            setTimeout(() => {
                if (browserEventMap.size && !forcedHidden) displayOCX(true)
            }, 500)
        }
    }

    // 消息框打开时，隐藏OCX
    watch(
        () => layoutStore.messageBoxCount,
        (newVal) => {
            if (!getIsInstallPlugin()) return
            if (newVal) {
                displayOCX(false)
            } else {
                setTimeout(() => {
                    if (browserEventMap.size && !forcedHidden) displayOCX(true)
                }, 500)
            }
        },
    )

    // 检测登录重连
    watch(
        () => pluginStore.isReconn,
        (newVal) => {
            if (newVal) {
                setReconnCallBack(() => {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_LOGIN_OVERTIME'),
                    }).then(() => {
                        closeLoading(LoadingTarget.FullScreen)
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

    document.addEventListener('visibilitychange', pageVisibleChangeHandle, false)

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
        TogglePageByPlugin: togglePageByPlugin,
        RetryStartChlView: retryStartChlView,
        SetPluginNotice: setPluginNotice,
        VideoPluginNotifyEmitter,
        isPluginAvailable,
        pluginNoticeHtml,
        pluginDownloadUrl,
        pluginNoticeContainer,
        BackUpTask: backupTask,
    }
}

/**
 * @description 确保plugin对象是个单例
 * @returns
 */
export const usePlugin = () => {
    if (plugin) {
        return plugin
    } else {
        plugin = useOCXPlugin()
        return plugin
    }
}
