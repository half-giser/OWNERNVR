/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-07 17:12:45
 * @Description: 通道列表
 */
import { ChannelInfoDto, type ChannelIPCUpgradeExpose } from '@/types/apiType/channel'
import ChannelEditPop from './ChannelEditPop.vue'
import ChannelEditIPCPwdPop from './ChannelEditIPCPwdPop.vue'
import ChannelIPCUpgradePop from './ChannelIPCUpgradePop.vue'

export default defineComponent({
    components: {
        ChannelEditPop,
        ChannelEditIPCPwdPop,
        ChannelIPCUpgradePop,
    },
    setup(_prop, ctx) {
        const volumn = ref(0)
        const mute = ref(false)
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const browserInfo = getBrowserInfo()
        const cababilityStore = useCababilityStore()
        const userSession = useUserSessionStore()
        const router = useRouter()
        const { openMessageBox } = useMessageBox()
        const Plugin = inject('Plugin') as PluginType
        const pluginStore = usePluginStore()
        const isSupportH5 = Plugin.IsSupportH5()

        const tableData = ref([] as ChannelInfoDto[])
        const channelEditPopVisable = ref(false)
        const editRowData = ref(new ChannelInfoDto())
        const protocolList = ref([] as Record<string, string>[])
        const txtBrandwidth = ref('')
        const ipNum = ref('')
        const ipNumVisable = ref(false)
        const editNameMapping = ref({} as Record<string, string>)
        const baseLivePopRef = ref<LivePopInstance>()
        const notifications = ref([] as string[])
        const channelIPCUpgradePopRef = ref<ChannelIPCUpgradeExpose>()

        let ipChlMaxCount = 0
        let ipChlMaxCountOriginal = 0
        let manufacturerMap: Record<string, string> = {}
        let nameMapping: Record<string, string> = {}

        const virtualHostEnabled = false
        const protocolTrasMap: Record<string, string> = {
            TVT_IPCAMERA: Translate('IDCS_TVT'),
            ONVIF: Translate('IDCS_ONVIF'),
            IDCS_POE_PREFIX: Translate('IDCS_POE_PREFIX'),
        }

        // 通道树状态定时刷新
        const refreshChlStatusTimer = useRefreshTimer(() => {
            getOnlineChlList()
        })

        const handleToolBarEvent = (toolBarEvent: ConfigToolBarEvent<SearchToolBarEvent>) => {
            switch (toolBarEvent.type) {
                case 'search':
                    getDataList(toolBarEvent.data.searchText)
                    break
                case 'addChl':
                    router.push('add')
                    break
            }
        }

        const handlePreview = (rowData: ChannelInfoDto) => {
            baseLivePopRef.value?.openLiveWin(rowData.id, rowData.name, rowData.isOnline)
        }

        // 编辑通道
        const handleEditChannel = (rowData: ChannelInfoDto) => {
            editRowData.value = rowData
            editNameMapping.value = nameMapping
            channelEditPopVisable.value = true
        }

        const setDataCallBack = (newData: ChannelInfoDto) => {
            editRowData.value.name = newData.name
            editRowData.value.ip = newData.ip
            editRowData.value.port = newData.port
        }

        const closeEditChannelPop = (isRefresh = false) => {
            channelEditPopVisable.value = false
            if (isRefresh) getDataList()
        }

        const editIPCPwdPopVisiable = ref(false)
        const handleEditIPCPwd = () => {
            editNameMapping.value = nameMapping
            editIPCPwdPopVisiable.value = true
        }

        const closeEditIPCPwdPop = () => {
            editIPCPwdPopVisiable.value = false
        }

        const handleDelChannelAll = () => {
            if (!tableData.value.length) return
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_ALL_ITEMS'),
            }).then(() => {
                const sendXml = rawXml`
                    <condition>
                        <devIds type="list">
                            ${
                                // UI1-E可以删除poe通道
                                tableData.value
                                    .filter((ele) => ele.ip && (import.meta.env.VITE_UI_TYPE === 'UI1-E' || ele.addType !== 'poe'))
                                    .map((ele) => `<item id="${ele.id}"></item>`)
                                    .join('')
                            }
                        </devIds>
                    </condition>
                `
                openLoading()
                delDevList(sendXml).then(() => {
                    closeLoading()
                    //删除通道不提示
                    getDataList()
                })
            })
        }

        const handleDelChannel = (rowData: ChannelInfoDto) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_CHNANEL_S').formatForLang(getShortString(rowData.name, 10)),
            }).then(() => {
                const sendXml = rawXml`
                    <condition>
                        <devIds type="list">
                            <item id="${rowData.id}">${rowData.name}${ternary(Number(rowData.poeIndex) > 0, `<poeIndex>${rowData.poeIndex}</poeIndex>`)}</item>
                        </devIds>
                    </condition>
                `
                openLoading()
                delDevList(sendXml).then(() => {
                    closeLoading()
                    //删除通道不提示
                    getDataList()
                })
            })
        }

        const handleSettingChannel = (rowData: ChannelInfoDto) => {
            const linkWinMode = browserInfo.type === 'ie' ? '_self' : '_blank'
            if (rowData.poePort && rowData.poePort !== '') {
                const ip = checkIpV6(userSession.serverIp) ? `[${userSession.serverIp}]` : userSession.serverIp
                browserInfo.type === 'ie' && (pluginStore.showPluginNoResponse = false)
                window.open(`http://${ip}:${rowData.poePort}`, linkWinMode, '')
            } else {
                // 非poe通道跳转时要带上端口号，避免用户改了ipc默认的80端口，导致跳转不成功
                const data = rawXml`
                    <condition>
                        <chlId>${rowData.id}</chlId>
                    </condition>
                `
                openLoading()
                queryChlPort(data).then((res) => {
                    closeLoading()
                    const $ = queryXml(res)
                    const httpPort = $('//content/chl/port/httpPort').length ? $('//content/chl/port/httpPort').text() : ''
                    // ipv6地址访问格式为：http://[ipv6]
                    const ip = checkIpV6(rowData.ip) ? '[' + rowData.ip + ']' : rowData.ip
                    browserInfo.type === 'ie' && (pluginStore.showPluginNoResponse = false)
                    window.open('http://' + ip + ':' + httpPort, linkWinMode, '')
                })
            }
        }

        const handleShowUpgradeBtn = (rowData: ChannelInfoDto) => {
            if (rowData.protocolType === 'TVT_IPCAMERA') rowData.showUpgradeBtn = true
            return rowData.showUpgradeBtn
        }

        const handleUpgradeIPC = (rowData: ChannelInfoDto) => {
            if (rowData.upgradeStatus === 'success' || rowData.upgradeDisabled) return
            openUpgradePop('single', [rowData])
        }

        const handleBatchUpgradeIPC = () => {
            openUpgradePop('multiple', tableData.value)
        }

        const openUpgradePop = (type: 'single' | 'multiple', data: ChannelInfoDto[]) => {
            if (isSupportH5 && isHttpsLogin()) {
                notifications.value.push(formatHttpsTips(Translate('IDCS_IPC_UPGRADE')))
                return
            }
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_IPC_UPGRADE_FINISH_RESTART'),
            }).then(() => {
                channelIPCUpgradePopRef.value!.init(type, data)
            })
        }

        const getDataList = (chlName?: string) => {
            const sendXml = rawXml`
                ${ternary(
                    chlName,
                    rawXml`
                        <condition>
                            <name>${wrapCDATA(chlName || '')}</name>
                        </condition>
                    `,
                )}
                <requireField>
                    <name/>
                    <ip/>
                    <port/>
                    <userName/>
                    <password/>
                    <protocolType/>
                    <productModel/>
                    <chlIndex/>
                    <index/>
                    <chlType/>
                    <chlNum/>
                </requireField>
            `
            openLoading()
            queryDevList(sendXml).then((res) => {
                closeLoading()
                const $ = queryXml(res)
                getIpAnalogCout()
                getProtocolList(() => {
                    if ($('status').text() === 'success') {
                        manufacturerMap = {}
                        $('//types/manufacturer/enum').forEach((ele) => {
                            manufacturerMap[ele.text()] = ele.attr('displayName')
                        })

                        tableData.value = []
                        nameMapping = {}
                        $('//content/item').forEach((ele) => {
                            const eleXml = queryXml(ele.element)
                            nameMapping[ele.attr('id')] = eleXml('name').text()
                            const channelInfo = new ChannelInfoDto()
                            channelInfo.id = ele.attr('id')
                            channelInfo.chlNum = eleXml('chlNum').text()
                            channelInfo.name = eleXml('name').text()
                            channelInfo.devID = eleXml('devID').text()
                            channelInfo.ip = eleXml('ip').text()
                            channelInfo.port = eleXml('port').text().num()
                            channelInfo.poePort = eleXml('poePort').text()
                            channelInfo.userName = eleXml('userName').text()
                            channelInfo.password = eleXml('password').text()
                            channelInfo.protocolType = eleXml('protocolType').text()
                            channelInfo.addType = eleXml('addType').text()
                            channelInfo.accessType = eleXml('AccessType').text()
                            channelInfo.poeIndex = eleXml('poeIndex').text()
                            channelInfo.manufacturer = eleXml('manufacturer').text()
                            channelInfo.productModel = {
                                factoryName: eleXml('productModel').attr('factoryName'),
                                innerText: eleXml('productModel').text(),
                            }
                            channelInfo.index = eleXml('index').text()
                            channelInfo.chlIndex = eleXml('chlIndex').text()
                            channelInfo.chlType = eleXml('chlType').text()

                            tableData.value.push(channelInfo)
                        })
                        saveMaxValueForDefaultChl()
                        tableData.value.forEach((ele: ChannelInfoDto) => {
                            //UI1-E POE通道可删除，其他UI不能删除
                            if ((ele.addType === 'poe' && import.meta.env.VITE_UI_TYPE !== 'UI1-E') || !ele.ip) {
                                ele.delDisabled = true
                            }

                            if (ele.addType === 'poe') {
                                if (!virtualHostEnabled) ele.showSetting = false
                            } else if (ele.protocolType === 'RTSP') {
                                ele.showSetting = false
                            }
                        })

                        channelIPCUpgradePopRef.value!.initWsState(tableData.value)

                        //获取在线通道列表
                        getOnlineChlList()
                    }
                })
            })
        }

        const getIPChlInfo = (channelInfo: ChannelInfoDto) => {
            const type = channelInfo.productModel.factoryName === 'Recorder'
            const sendXml = rawXml`
                <condition>
                    <chlId>${type ? channelInfo.devID : channelInfo.id}</chlId>
                </condition>
            `
            queryIPChlInfo(sendXml).then((res) => {
                const version = queryXml(res)('//content/chl/detailedSoftwareVersion').text()
                if (version !== channelInfo.version) channelInfo.version = version
            })
        }

        const getOnlineChlList = () => {
            queryOnlineChlList().then((res) => {
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    if (!tableData.value.length) return
                    tableData.value.forEach((ele) => {
                        //模拟通道，状态置为空
                        if (!ele.ip) return
                        let isOnline = false
                        $('//content/item').forEach((element) => {
                            const chlId = element.attr('id')
                            if (ele.id === chlId) {
                                if (!ele.isOnline) {
                                    ele.isOnline = true
                                    ele.upgradeDisabled = false
                                }
                                isOnline = true
                                getIPChlInfo(ele)
                            }
                        })
                        if (!isOnline && ele.isOnline) {
                            ele.isOnline = false
                            ele.upgradeDisabled = true
                        }

                        if (ele.accessType === '1') {
                            ele.upgradeDisabled = true
                            ele.showUpgradeBtn = true
                        }
                    })
                }

                refreshChlStatusTimer.repeat()
            })
        }

        const getIpAnalogCout = () => {
            openLoading()
            queryBasicCfg().then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    let channelSignalTypeList: string[] = []
                    if ($('//content/channelSignalType').length) channelSignalTypeList = $('//content/channelSignalType').text().split(':')
                    ipChlMaxCountOriginal = 0
                    channelSignalTypeList.forEach((ele) => {
                        if (ele === 'D') ipChlMaxCountOriginal++
                    })
                }
                getBandwidth()
            })
        }

        const getBandwidth = () => {
            openLoading()
            queryRecordDistributeInfo().then((res1) => {
                closeLoading()
                const $ = queryXml(res1)
                const mode = $('//content/recMode/mode').text()
                openLoading()
                querySystemCaps().then((res2) => {
                    closeLoading()
                    const $ = queryXml(res2)
                    if ($('status').text() === 'success') {
                        const totalBandwidth = $('//content/totalBandwidth').text().num()
                        const usedBandwidth = $('//content/' + (mode === 'auto' ? 'usedAutoBandwidth' : 'usedManualBandwidth'))
                            .text()
                            .num()
                        let remainBandwidth = (totalBandwidth * 1024 - usedBandwidth) / 1024
                        const switchableIpChlMaxCount = $('//content/switchableIpChlMaxCount').text().num()
                        ipChlMaxCount = ipChlMaxCountOriginal + $('//content/ipChlMaxCount').text().num()
                        if (remainBandwidth < 0) remainBandwidth = 0
                        txtBrandwidth.value = Translate('IDCS_CURRENT_BANDWIDTH_ALL_D_D').formatForLang(remainBandwidth.toFixed(0), totalBandwidth.toFixed(0))

                        if ((switchableIpChlMaxCount > 0 && cababilityStore.analogChlCount > 0) || cababilityStore.analogChlCount === 0) {
                            ipNumVisable.value = true
                            ipNum.value = ' : ' + ipChlMaxCount
                        } else {
                            ipNumVisable.value = false
                        }
                    }
                })
            })
        }

        const getProtocolList = (callback: Function) => {
            openLoading()
            queryRtspProtocolList().then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    protocolList.value = []
                    const nodes = $('//content/item')
                    nodes.forEach((ele) => {
                        const eleXml = queryXml(ele.element)
                        protocolList.value.push({
                            displayName: eleXml('displayName').text(),
                            index: ele.attr('id'),
                        })
                    })
                    if (callback) callback()
                }
            })
        }

        const saveMaxValueForDefaultChl = () => {
            let value = 0
            const defaultName = Translate('IDCS_IP_CHANNEL')
            const pattern = defaultName + 'd*'
            for (const key in nameMapping) {
                const result = nameMapping[key].match(pattern)
                if (result && result.length) {
                    const num = Number(nameMapping[key].split(defaultName)[1])
                    value = num > value ? num : value
                }
            }
            localStorage.setItem(LocalCacheKey.KEY_DEFAULT_CHL_MAX_VALUE, value.toString())
        }

        const formatDisplayName = (rowData: ChannelInfoDto) => {
            let value = rowData.name
            if (rowData.chlType === 'recorder') {
                const chlNum = Number(rowData.index) + 1
                const chlNumStr = chlNum < 10 ? '0' + chlNum : chlNum
                value = '[R' + chlNumStr + ']' + value
            }
            return rowData.addType === 'poe' ? protocolTrasMap.IDCS_POE_PREFIX.formatForLang(Number(rowData.poeIndex) > 9 ? rowData.poeIndex : '0' + rowData.poeIndex) + value : value
        }

        const formatDisplayManufacturer = (rowData: ChannelInfoDto) => {
            const value = rowData.manufacturer
            const filters = filterProperty(protocolList.value, 'index')
            return rowData.productModel.factoryName && rowData.productModel.factoryName.toLowerCase() !== ''
                ? rowData.productModel.factoryName
                : value
                  ? value.indexOf('RTSP') !== -1
                      ? protocolList.value[filters.indexOf(value.slice(5))].displayName
                      : manufacturerMap[value]
                  : ''
        }

        onMounted(() => {
            getDataList()
        })

        ctx.expose({
            handleToolBarEvent,
        })

        return {
            tableData,
            channelEditPopVisable,
            editRowData,
            protocolList,
            manufacturerMap,
            handlePreview,
            handleEditChannel,
            closeEditChannelPop,
            editIPCPwdPopVisiable,
            handleEditIPCPwd,
            closeEditIPCPwdPop,
            handleDelChannel,
            handleDelChannelAll,
            handleSettingChannel,
            handleShowUpgradeBtn,
            handleUpgradeIPC,
            handleBatchUpgradeIPC,
            formatDisplayName,
            formatDisplayManufacturer,
            txtBrandwidth,
            ipNum,
            ipNumVisable,
            editNameMapping,
            setDataCallBack,
            volumn,
            mute,
            baseLivePopRef,
            notifications,
            channelIPCUpgradePopRef,
            ChannelEditPop,
            ChannelEditIPCPwdPop,
            ChannelIPCUpgradePop,
        }
    },
})
