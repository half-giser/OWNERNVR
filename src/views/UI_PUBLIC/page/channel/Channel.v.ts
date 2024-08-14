/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-07 17:12:45
 * @Description:
 */
import { queryDevList, queryRtspProtocolList, delDevList, queryChlPort, queryIPChlInfo, queryOnlineChlList } from '@/api/channel'
import { getXmlWrapData } from '@/api/api'
import { queryBasicCfg } from '@/api/system'
import { queryXml } from '@/utils/xmlParse'
import { ChannelInfoDto } from '@/types/apiType/channel'
import { LocalCacheKey } from '@/utils/constants'
import { getUiAndTheme, isHttpsLogin } from '@/utils/tools'
import { checkIpV6, filterProperty, formatHttpsTips, getShortString } from '../../../../utils/tools'
import ChannelEditPop from './ChannelEditPop.vue'
import { querySystemCaps } from '@/api/system'
import { useUserSessionStore } from '@/stores/userSession'
import { useCababilityStore } from '@/stores/cabability'
import { ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import ChannelEditIPCPwdPop from './ChannelEditIPCPwdPop.vue'
import useMessageBox from '@/hooks/useMessageBox'
import { useLangStore } from '@/stores/lang'
import useLoading from '@/hooks/useLoading'
import BaseImgSprite from '@/views/UI_PUBLIC/components/sprite/BaseImgSprite.vue'
import BaseLivePop from '@/views/UI_PUBLIC/components/BaseLivePop.vue'
import BaseNotification from '@/views/UI_PUBLIC/components/BaseNotification.vue'
import ChannelIPCUpgradePop from './ChannelIPCUpgradePop.vue'

export default defineComponent({
    components: {
        ArrowDown,
        ChannelEditPop,
        ChannelEditIPCPwdPop,
        BaseImgSprite,
        BaseLivePop,
        BaseNotification,
        ChannelIPCUpgradePop,
    },
    setup() {
        const volumn = ref(0)
        const mute = ref(false)
        const { Translate } = useLangStore()
        const { LoadingTarget, openLoading, closeLoading } = useLoading()
        const { browserInfo, serverIp } = inject('appGlobalProp') as appGlobalProp
        const userSessionStore = useUserSessionStore()
        const cababilityStore = useCababilityStore()
        const router = useRouter()
        const { openMessageTipBox } = useMessageBox()
        const Plugin = inject('Plugin') as PluginType
        const isSupportH5 = Plugin.IsSupportH5()

        const tableData = ref([] as ChannelInfoDto[])
        const channelEditPopVisable = ref(false)
        const editRowData = ref(new ChannelInfoDto())
        const protocolList = ref([] as Record<string, string>[])
        const txtBrandwidth = ref('')
        const ipNum = ref('')
        const ipNumVisable = ref(false)
        const editNameMapping = ref({} as Record<string, string>)
        const baseLivePopRef = ref()
        const notifications = ref([] as string[])
        const channelIPCUpgradePopRef = ref()

        let ipChlMaxCount = 0
        let ipChlMaxCountOriginal = 0
        let manufacturerMap: Record<string, string> = {}
        let nameMapping: Record<string, string> = {}
        const { name: uiName } = getUiAndTheme()
        const virtualHostEnabled = false
        const protocolTrasMap: Record<string, string> = {
            TVT_IPCAMERA: Translate('IDCS_TVT'),
            ONVIF: Translate('IDCS_ONVIF'),
            IDCS_POE_PREFIX: Translate('IDCS_POE_PREFIX'),
        }
        let ChlStatusRefreshTimer: NodeJS.Timeout | null = null
        const ChlStatusRefreshTimeSpan = 5000 //通道树状态刷新时间间隔

        const handleToolBarEvent = function (toolBarEvent: ConfigToolBarEvent<ChannelToolBarEvent>) {
            switch (toolBarEvent.type) {
                case 'search':
                    getDataList(toolBarEvent.data.searchText)
                    break
                case 'addChl':
                    router.push('add')
                    break
            }
        }

        const handlePreview = function (rowData: ChannelInfoDto) {
            baseLivePopRef.value.openLiveWin(rowData.id, rowData.name, rowData.chlIndex, rowData.chlType, rowData.chlStatus == Translate('IDCS_ONLINE'))
        }

        // 编辑通道
        const handleEditChannel = function (rowData: ChannelInfoDto) {
            editRowData.value = rowData
            editNameMapping.value = nameMapping
            channelEditPopVisable.value = true
        }

        const setDataCallBack = function (newData: ChannelInfoDto) {
            editRowData.value.name = newData.name
            editRowData.value.ip = newData.ip
            editRowData.value.port = newData.port
        }

        const closeEditChannelPop = function (isRefresh: boolean) {
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

        const handleDelChannelAll = function () {
            if (tableData.value.length == 0) return
            openMessageTipBox({
                type: 'question',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_DELETE_ALL_ITEMS'),
            })
                .then(() => {
                    let data = '<condition><devIds type="list">'
                    tableData.value.forEach((ele: ChannelInfoDto) => {
                        // UI1-E可以删除poe通道
                        if (uiName == 'UI1-E') {
                            if (ele.ip) data += '<item id="' + ele.id + '"></item>'
                        } else {
                            if (ele.addType != 'poe' && ele.ip) data += '<item id="' + ele.id + '"></item>'
                        }
                    })
                    data += '</devIds></condition>'
                    const sendXml = getXmlWrapData(data)
                    openLoading(LoadingTarget.FullScreen)
                    delDevList(sendXml).then(() => {
                        closeLoading(LoadingTarget.FullScreen)
                        //删除通道不提示
                        getDataList()
                    })
                })
                .catch(() => {})
        }

        const handleDelChannel = function (rowData: ChannelInfoDto) {
            openMessageTipBox({
                type: 'question',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_DELETE_MP_CHNANEL_S').formatForLang(getShortString(rowData.name, 10)),
            })
                .then(() => {
                    let data = '<condition><devIds type="list">' + '<item id="' + rowData.id + '">' + rowData.name
                    if (Number(rowData.poeIndex) * 1 > 0) data += '<poeIndex>' + rowData.poeIndex + '</poeIndex>'
                    data += '</item>' + '</devIds></condition>'
                    const sendXml = getXmlWrapData(data)
                    openLoading(LoadingTarget.FullScreen)
                    delDevList(sendXml).then(() => {
                        closeLoading(LoadingTarget.FullScreen)
                        //删除通道不提示
                        getDataList()
                    })
                })
                .catch(() => {})
        }

        const handleSettingChannel = function (rowData: ChannelInfoDto) {
            const linkWinMode = browserInfo.type === 'ie' ? '_self' : '_blank'
            if (rowData.poePort && rowData.poePort != '') {
                const ip = checkIpV6(serverIp) ? '[' + serverIp + ']' : serverIp
                browserInfo.type === 'ie' && (userSessionStore.showPluginNoResponse = '')
                window.open('http://' + ip + ':' + rowData.poePort, linkWinMode, '')
            } else {
                // 非poe通道跳转时要带上端口号，避免用户改了ipc默认的80端口，导致跳转不成功
                const data = getXmlWrapData(`<condition><chlId>${rowData.id}</chlId></condition>`)
                openLoading(LoadingTarget.FullScreen)
                queryChlPort(data).then((res: any) => {
                    closeLoading(LoadingTarget.FullScreen)
                    res = queryXml(res)
                    const httpPort = res('//content/chl/port/httpPort').length > 0 ? res('//content/chl/port/httpPort').text() : ''
                    // ipv6地址访问格式为：http://[ipv6]
                    const ip = checkIpV6(rowData.ip) ? '[' + rowData.ip + ']' : rowData.ip
                    browserInfo.type === 'ie' && (userSessionStore.showPluginNoResponse = '')
                    window.open('http://' + ip + ':' + httpPort, linkWinMode, '')
                })
            }
        }

        const handleShowUpgradeBtn = function (rowData: ChannelInfoDto) {
            if (rowData.protocolType == 'TVT_IPCAMERA') rowData.showUpgradeBtn = true
            return rowData.showUpgradeBtn
        }

        const handleUpgradeIPC = function (rowData: ChannelInfoDto) {
            if (rowData.upgradeStatus == 'success' || rowData.upgradeDisabled) return
            openUpgradePop('single', [rowData])
        }

        const handleBatchUpgradeIPC = function () {
            openUpgradePop('multiple', tableData.value)
        }

        const openUpgradePop = (type: string, data: ChannelInfoDto[]) => {
            if (isSupportH5 && isHttpsLogin()) {
                notifications.value.push(formatHttpsTips(Translate('IDCS_IPC_UPGRADE')))
                return
            }
            openMessageTipBox({
                type: 'question',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_IPC_UPGRADE_FINISH_RESTART'),
            })
                .then(() => {
                    channelIPCUpgradePopRef.value.init(type, data)
                })
                .catch(() => {})
        }

        const getDataList = function (chlName?: String) {
            let data = ''
            if (chlName) data += `<condition><name><![CDATA[${chlName}]]></name></condition>`
            data +=
                '<requireField>' +
                '<name/>' +
                '<ip/>' +
                '<port/>' +
                '<userName/>' +
                '<password/>' +
                '<protocolType/>' +
                '<productModel/>' +
                '<chlIndex/>' +
                '<index/>' +
                '<chlType/>' +
                '<chlNum/>' +
                '</requireField>'
            const sendXml = getXmlWrapData(data)
            openLoading(LoadingTarget.FullScreen)
            queryDevList(sendXml).then((res: any) => {
                closeLoading(LoadingTarget.FullScreen)
                res = queryXml(res)
                getIpAnalogCout()
                getProtocolList(function () {
                    if (res('status').text() == 'success') {
                        manufacturerMap = {}
                        res('//types/manufacturer/enum').forEach((ele: any) => {
                            manufacturerMap[ele.text()] = ele.attr('displayName')
                        })

                        tableData.value = []
                        nameMapping = {}
                        res('//content/item').forEach((ele: any) => {
                            const eleXml = queryXml(ele.element)
                            nameMapping[ele.attr('id')] = eleXml('name').text()
                            const channelInfo = new ChannelInfoDto()
                            channelInfo.id = ele.attr('id')
                            channelInfo.chlNum = eleXml('chlNum').text()
                            channelInfo.name = eleXml('name').text()
                            channelInfo.devID = eleXml('devID').text()
                            channelInfo.ip = eleXml('ip').text()
                            channelInfo.port = eleXml('port').text()
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
                            channelInfo.chlStatus = eleXml('chlStatus').text()
                            channelInfo.chlType = eleXml('chlType').text()

                            tableData.value.push(channelInfo)
                        })
                        saveMaxValueForDefaultChl()
                        tableData.value.forEach((ele: ChannelInfoDto) => {
                            //模拟通道，端口和状态置为空
                            if (!ele.ip) {
                                ele.chlStatus = ''
                                ele.port = ''
                            } else {
                                ele.chlStatus = Translate('IDCS_OFFLINE')
                            }

                            //UI1-E POE通道可删除，其他UI不能删除
                            if ((ele.addType == 'poe' && uiName != 'UI1-E') || !ele.ip) {
                                ele.delDisabled = true
                            }
                            if (ele.addType == 'poe') {
                                if (!virtualHostEnabled) ele.showSetting = false
                            } else if (ele.protocolType == 'RTSP') {
                                ele.showSetting = false
                            }
                            getIPChlInfo(ele)
                        })

                        channelIPCUpgradePopRef.value.initWsState(tableData.value)

                        //获取在线通道列表
                        getOnlineChlList()
                    }
                })
            })
        }

        const getIPChlInfo = function (channelInfo: ChannelInfoDto) {
            const type = channelInfo.productModel.factoryName == 'Recorder'
            const data = getXmlWrapData('<condition><chlId>' + (type ? channelInfo.devID : channelInfo.id) + '</chlId></condition>')
            queryIPChlInfo(data).then((res: any) => {
                channelInfo.version = queryXml(res)('//content/chl/detailedSoftwareVersion').text()
            })
        }

        const getOnlineChlList = function () {
            queryOnlineChlList().then((res: any) => {
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    if (tableData.value.length == 0) return
                    tableData.value.forEach((ele: ChannelInfoDto) => {
                        //模拟通道，状态置为空
                        if (!ele.ip) {
                            ele.chlStatus = ''
                            return
                        }
                        let isOnline = false
                        res('//content/item').forEach((element: any) => {
                            const chlId = element.attr('id')
                            if (ele.id == chlId) {
                                ele.chlStatus = Translate('IDCS_ONLINE')
                                ele.upgradeDisabled = false
                                //if ($status.hasClass("disableError")) $status.addClass("error").removeClass("disableError");
                                isOnline = true
                                getIPChlInfo(ele)
                            }
                        })
                        if (!isOnline) {
                            ele.chlStatus = Translate('IDCS_OFFLINE')
                            ele.upgradeDisabled = true
                            //if ($status.hasClass("error")) $status.addClass("disableError").removeClass("error");
                        }
                        if (ele.accessType == '1') {
                            ele.upgradeDisabled = true
                            ele.showUpgradeBtn = true
                        }
                    })
                }
                StartRefreshChlStatus()
            })
        }

        const StartRefreshChlStatus = function () {
            if (ChlStatusRefreshTimer) {
                StopRefreshChlStatus()
            }
            ChlStatusRefreshTimer = setTimeout(function () {
                getOnlineChlList()
            }, ChlStatusRefreshTimeSpan)
        }

        const StopRefreshChlStatus = function () {
            clearTimeout(ChlStatusRefreshTimer as NodeJS.Timeout)
            ChlStatusRefreshTimer = null
        }

        const getIpAnalogCout = function () {
            openLoading(LoadingTarget.FullScreen)
            queryBasicCfg(getXmlWrapData('')).then((res: any) => {
                closeLoading(LoadingTarget.FullScreen)
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    let channelSignalTypeList = []
                    if (res('//content/channelSignalType').length > 0) channelSignalTypeList = res('//content/channelSignalType').text().split(':')
                    ipChlMaxCountOriginal = 0
                    channelSignalTypeList.forEach((ele: string) => {
                        if (ele == 'D') ipChlMaxCountOriginal++
                    })
                }
                getBandwidth()
            })
        }

        const getBandwidth = function () {
            openLoading(LoadingTarget.FullScreen)
            queryRecordDistributeInfo().then((res1: any) => {
                closeLoading(LoadingTarget.FullScreen)
                res1 = queryXml(res1)
                const mode = res1('//content/recMode/mode').text()
                openLoading(LoadingTarget.FullScreen)
                querySystemCaps(getXmlWrapData('')).then((res2: any) => {
                    closeLoading(LoadingTarget.FullScreen)
                    res2 = queryXml(res2)
                    if (res2('status').text() == 'success') {
                        const totalBandwidth = res2('//content/totalBandwidth').text() * 1
                        const usedBandwidth = res2('//content/' + (mode == 'auto' ? 'usedAutoBandwidth' : 'usedManualBandwidth')).text() * 1
                        let remainBandwidth = (totalBandwidth * 1024 - usedBandwidth) / 1024
                        const switchableIpChlMaxCount = res2('//content/switchableIpChlMaxCount').text()
                        ipChlMaxCount = ipChlMaxCountOriginal + res2('//content/ipChlMaxCount').text() * 1
                        if (remainBandwidth < 0) remainBandwidth = 0
                        txtBrandwidth.value = Translate('IDCS_CURRENT_BANDWIDTH_ALL_D_D').formatForLang(remainBandwidth.toFixed(0), totalBandwidth.toFixed(0))

                        if ((switchableIpChlMaxCount * 1 > 0 && cababilityStore.analogChlCount * 1 > 0) || cababilityStore.analogChlCount * 1 == 0) {
                            ipNumVisable.value = true
                            ipNum.value = ' : ' + ipChlMaxCount
                        } else {
                            ipNumVisable.value = false
                        }
                    }
                })
            })
        }

        const getProtocolList = function (callback: Function) {
            openLoading(LoadingTarget.FullScreen)
            queryRtspProtocolList(getXmlWrapData('')).then((res: any) => {
                closeLoading(LoadingTarget.FullScreen)
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    protocolList.value = []
                    const nodes = res('//content/item')
                    nodes.forEach((ele: any) => {
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

        const saveMaxValueForDefaultChl = function () {
            let value = 0
            const defaultName = Translate('IDCS_IP_CHANNEL')
            const pattern = defaultName + 'd*'
            for (const key in nameMapping) {
                const result = nameMapping[key].match(pattern)
                if (result && result.length > 0) {
                    const num = parseInt(nameMapping[key].split(defaultName)[1])
                    value = num > value ? num : value
                }
            }
            localStorage.setItem(LocalCacheKey.defaultChlMaxValue, value.toString())
        }

        const formatDisplayName = function (rowData: ChannelInfoDto) {
            let value = rowData.name
            if (rowData.chlType == 'recorder') {
                const chlNum = Number(rowData.index) * 1 + 1
                const chlNumStr = chlNum < 10 ? '0' + chlNum : chlNum
                value = '[R' + chlNumStr + ']' + value
            }
            return rowData.addType == 'poe' ? protocolTrasMap['IDCS_POE_PREFIX'].formatForLang(Number(rowData.poeIndex) > 9 ? rowData.poeIndex : '0' + rowData.poeIndex) + value : value
        }

        const formatDisplayManufacturer = function (rowData: ChannelInfoDto) {
            const value = rowData.manufacturer
            const filters = filterProperty(protocolList.value, 'index')
            return rowData.productModel.factoryName && rowData.productModel.factoryName.toLowerCase() != ''
                ? rowData.productModel.factoryName
                : value
                  ? value.indexOf('RTSP') != -1
                      ? protocolList.value[filters.indexOf(value.slice(5))]['displayName']
                      : manufacturerMap[value]
                  : ''
        }

        onMounted(() => {
            getDataList()
        })

        onUnmounted(() => {
            StopRefreshChlStatus()
        })

        return {
            handleToolBarEvent,
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
        }
    },
})
