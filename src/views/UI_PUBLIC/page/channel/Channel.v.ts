/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-07 17:12:45
 * @Description: 通道列表
 */
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
        const { Translate } = useLangStore()
        const cababilityStore = useCababilityStore()
        const userSession = useUserSessionStore()
        const router = useRouter()
        const plugin = usePlugin()

        const tableData = ref<ChannelInfoDto[]>([])
        const virtualTableData = computed<number[]>(() => {
            return Array(tableData.value.length)
                .fill(1)
                .map((item, key) => item + key)
        })
        const channelEditPopVisable = ref(false)
        const editRowData = ref(new ChannelInfoDto())
        const protocolList = ref<ChannelRTSPPropertyDto[]>([])
        const txtBrandwidth = ref('')
        const ipNum = ref('')
        const ipNumVisable = ref(false)
        const baseLivePopRef = ref<LivePopInstance>()
        const channelIPCUpgradePopRef = ref<ChannelIPCUpgradeExpose>()

        let ipChlMaxCount = 0
        let ipChlMaxCountOriginal = 0
        const manufacturerMap = ref<Record<string, string>>({})
        const nameMapping = ref<Record<string, string>>({})

        let virtualHostEnabled = false

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
        const editChannel = (rowData: ChannelInfoDto) => {
            editRowData.value = rowData
            channelEditPopVisable.value = true
        }

        const confirmEditChannel = (newData: ChannelInfoDto) => {
            editRowData.value.name = newData.name
            editRowData.value.ip = newData.ip
            editRowData.value.port = newData.port
        }

        const closeEditChannelPop = (isRefresh = false) => {
            channelEditPopVisable.value = false
            if (isRefresh) getDataList()
        }

        const editIPCPwdPopVisiable = ref(false)

        const editIPCPwd = () => {
            editIPCPwdPopVisiable.value = true
        }

        const closeEditIPCPwdPop = () => {
            editIPCPwdPopVisiable.value = false
        }

        const delAllChannel = () => {
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

        const delChannel = (rowData: ChannelInfoDto) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_CHNANEL_S').formatForLang(getShortString(rowData.name, 10)),
            }).then(() => {
                const sendXml = rawXml`
                    <condition>
                        <devIds type="list">
                            <item id="${rowData.id}">${rowData.name}${rowData.poeIndex > 0 ? `<poeIndex>${rowData.poeIndex}</poeIndex>` : ''}</item>
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

        const setChannel = (rowData: ChannelInfoDto) => {
            if (rowData.poePort && rowData.poePort !== '') {
                const ip = checkIpV6(userSession.serverIp) ? `[${userSession.serverIp}]` : userSession.serverIp
                window.open(`http://${ip}:${rowData.poePort}`, '_blank', '')
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
                    const httpPort = $('content/chl/port/httpPort').text()
                    // ipv6地址访问格式为：http://[ipv6]
                    const ip = checkIpV6(rowData.ip) ? `[${rowData.ip}]` : rowData.ip
                    window.open(`http://${ip}:${httpPort}`, '_blank', '')
                })
            }
        }

        const isShowUpgradeBtn = (rowData: ChannelInfoDto) => {
            return rowData.protocolType === 'TVT_IPCAMERA'
        }

        const upgradeIPC = (rowData: ChannelInfoDto) => {
            if (rowData.upgradeStatus === 'success' || isUpgradeDisabled(rowData)) return
            openUpgradePop('single', [rowData])
        }

        const upgradeIPCBatch = () => {
            openUpgradePop('multiple', tableData.value)
        }

        const openUpgradePop = (type: 'single' | 'multiple', data: ChannelInfoDto[]) => {
            if (plugin.IsSupportH5() && isHttpsLogin()) {
                openNotify(formatHttpsTips(Translate('IDCS_IPC_UPGRADE')), true)
                return
            }
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_IPC_UPGRADE_FINISH_RESTART'),
            }).then(() => {
                channelIPCUpgradePopRef.value!.init(type, data)
            })
        }

        const getDataList = async (chlName?: string) => {
            const sendXml = rawXml`
                ${
                    chlName
                        ? rawXml`
                            <condition>
                                <name>${wrapCDATA(chlName || '')}</name>
                            </condition>
                        `
                        : ''
                }
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
            const res = await queryDevList(sendXml)
            const $ = queryXml(res)

            if ($('status').text() === 'success') {
                manufacturerMap.value = Object.fromEntries(
                    $('types/manufacturer/enum').map((ele) => {
                        return [ele.text(), ele.attr('displayName')]
                    }),
                )

                nameMapping.value = {}
                tableData.value = $('content/item').map((ele) => {
                    const eleXml = queryXml(ele.element)
                    nameMapping.value[ele.attr('id')] = eleXml('name').text()
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
                    channelInfo.poeIndex = eleXml('poeIndex').text().num()
                    channelInfo.manufacturer = eleXml('manufacturer').text()
                    channelInfo.productModel = {
                        factoryName: eleXml('productModel').attr('factoryName'),
                        innerText: eleXml('productModel').text(),
                    }
                    channelInfo.index = eleXml('index').text().num()
                    channelInfo.chlIndex = eleXml('chlIndex').text()
                    channelInfo.chlType = eleXml('chlType').text()

                    return channelInfo
                })
                saveMaxValueForDefaultChl()
                tableData.value.forEach((ele) => {
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
        }

        const getIPChlInfo = (channelInfo: ChannelInfoDto) => {
            const type = channelInfo.productModel.factoryName === 'Recorder'
            const sendXml = rawXml`
                <condition>
                    <chlId>${type ? channelInfo.devID : channelInfo.id}</chlId>
                </condition>
            `
            queryIPChlInfo(sendXml).then((res) => {
                const version = queryXml(res)('content/chl/detailedSoftwareVersion').text()
                if (version !== channelInfo.version) channelInfo.version = version
            })
        }

        const isUpgradeDisabled = (channelInfo: ChannelInfoDto) => {
            return channelInfo.accessType === '1' || !channelInfo.isOnline
        }

        const getOnlineChlList = () => {
            queryOnlineChlList().then((res) => {
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    const onlineChlList = $('content/item').map((element) => element.attr('id'))
                    tableData.value.forEach((ele) => {
                        //模拟通道，状态置为空
                        if (!ele.ip) {
                            return
                        }
                        ele.isOnline = onlineChlList.includes(ele.id)
                        if (ele.isOnline) {
                            getIPChlInfo(ele)
                        }
                    })
                }

                refreshChlStatusTimer.repeat()
            })
        }

        const getIpAnalogCout = async () => {
            const res = await queryBasicCfg()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                ipChlMaxCountOriginal = $('content/channelSignalType')
                    .text()
                    .array(':')
                    .filter((ele) => ele === 'D').length
            }
        }

        const getBandwidth = async () => {
            const res1 = await queryRecordDistributeInfo()
            const $res1 = queryXml(res1)
            const mode = $res1('content/recMode/mode').text()

            const $ = await cababilityStore.updateCabability()

            if ($('status').text() === 'success') {
                const totalBandwidth = $('content/totalBandwidth').text().num()
                const usedBandwidth = $('content/' + (mode === 'auto' ? 'usedAutoBandwidth' : 'usedManualBandwidth'))
                    .text()
                    .num()
                const remainBandwidth = Math.max(0, (totalBandwidth * 1024 - usedBandwidth) / 1024)
                const switchableIpChlMaxCount = $('content/switchableIpChlMaxCount').text().num()
                ipChlMaxCount = ipChlMaxCountOriginal + $('content/ipChlMaxCount').text().num()
                txtBrandwidth.value = Translate('IDCS_CURRENT_BANDWIDTH_ALL_D_D').formatForLang(remainBandwidth.toFixed(0), totalBandwidth.toFixed(0))

                if ((switchableIpChlMaxCount > 0 && cababilityStore.analogChlCount > 0) || cababilityStore.analogChlCount === 0) {
                    ipNumVisable.value = true
                    ipNum.value = ' : ' + ipChlMaxCount
                } else {
                    ipNumVisable.value = false
                }
            }
        }

        const getProtocolList = async () => {
            const res = await queryRtspProtocolList()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                protocolList.value = $('content/item').map((ele) => {
                    const eleXml = queryXml(ele.element)
                    return {
                        displayName: eleXml('displayName').text(),
                        index: ele.attr('id'),
                    }
                })
            }
        }

        const saveMaxValueForDefaultChl = () => {
            let value = 0
            const defaultName = Translate('IDCS_IP_CHANNEL')
            const pattern = defaultName + 'd*'
            for (const key in nameMapping.value) {
                const result = nameMapping.value[key].match(pattern)
                if (result && result.length) {
                    const num = Number(nameMapping.value[key].split(defaultName)[1])
                    value = num > value ? num : value
                }
            }
            localStorage.setItem(LocalCacheKey.KEY_DEFAULT_CHL_MAX_VALUE, value.toString())
        }

        const formatDisplayName = (rowData: ChannelInfoDto) => {
            let value = rowData.name
            if (rowData.chlType === 'recorder') {
                const chlNumStr = padStart(rowData.index + 1, 2)
                value = `[R${chlNumStr}]${value}`
            }
            return rowData.addType === 'poe' ? protocolTrasMap.IDCS_POE_PREFIX.formatForLang(padStart(rowData.poeIndex, 2)) + value : value
        }

        const formatDisplayManufacturer = (rowData: ChannelInfoDto) => {
            const value = rowData.manufacturer
            const filters = protocolList.value.map((item) => item.index)
            return rowData.productModel.factoryName && rowData.productModel.factoryName.toLowerCase() !== ''
                ? rowData.productModel.factoryName
                : value
                  ? value.indexOf('RTSP') !== -1
                      ? protocolList.value[filters.indexOf(value.slice(5))].displayName
                      : manufacturerMap.value[value]
                  : ''
        }

        const getNetPortCfg = async () => {
            const result = await queryNetPortCfg()
            const $ = queryXml(result)
            virtualHostEnabled = $('content/virtualHostEnabled').text().bool()
        }

        onMounted(async () => {
            openLoading()
            try {
                await getNetPortCfg()
                await getIpAnalogCout()
                await getBandwidth()
                await getProtocolList()
                await getDataList()
            } catch {
            } finally {
                closeAllLoading()
            }
        })

        ctx.expose({
            handleToolBarEvent,
        })

        return {
            userSession,
            tableData,
            virtualTableData,
            channelEditPopVisable,
            editRowData,
            protocolList,
            manufacturerMap,
            handlePreview,
            editChannel,
            closeEditChannelPop,
            editIPCPwdPopVisiable,
            editIPCPwd,
            closeEditIPCPwdPop,
            delChannel,
            delAllChannel,
            setChannel,
            isShowUpgradeBtn,
            upgradeIPC,
            upgradeIPCBatch,
            formatDisplayName,
            formatDisplayManufacturer,
            txtBrandwidth,
            ipNum,
            ipNumVisable,
            nameMapping,
            confirmEditChannel,
            baseLivePopRef,
            channelIPCUpgradePopRef,
            isUpgradeDisabled,
        }
    },
})
