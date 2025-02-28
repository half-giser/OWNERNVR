/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 新增通道
 */
import ChannelAddActivateIPCPop from './ChannelAddActivateIPCPop.vue'
import ChannelAddSetDefaultPwdPop from './ChannelAddSetDefaultPwdPop.vue'
import ChannelAddEditIPCIpPop from './ChannelAddEditIPCIpPop.vue'
import ChannelAddToAddRecorderPop from './ChannelAddToAddRecorderPop.vue'
import ChannelAddSetProtocolPop from './ChannelAddSetProtocolPop.vue'
import ChannelAddMultiChlIPCAdd, { type channelAddMultiChlIPCAddPop } from './ChannelAddMultiChlIPCAdd.vue'
import type { TableInstance } from 'element-plus'

export default defineComponent({
    components: {
        ChannelAddActivateIPCPop,
        ChannelAddSetDefaultPwdPop,
        ChannelAddEditIPCIpPop,
        ChannelAddToAddRecorderPop,
        ChannelAddSetProtocolPop,
        ChannelAddMultiChlIPCAdd,
    },
    setup() {
        const { Translate } = useLangStore()
        const cababilityStore = useCababilityStore()
        const router = useRouter()
        const supportsIPCActivation = cababilityStore.supportsIPCActivation ? cababilityStore.supportsIPCActivation : true
        const supportRecorder = ref(false)

        const quickAddTableRef = ref<TableInstance>()
        const manualAddTableRef = ref<TableInstance>()
        const addRecorderTableRef = ref<TableInstance>()
        const tabKeys = {
            quickAdd: 'quickAdd',
            manualAdd: 'manualAdd',
            addRecorder: 'addRecorder',
        }
        const tabs = computed(() => {
            return [
                {
                    key: tabKeys.quickAdd,
                    text: Translate('IDCS_QUICK_ADD'),
                    show: true,
                },
                {
                    key: tabKeys.manualAdd,
                    text: Translate('IDCS_MANUAL_ADD'),
                    show: true,
                },
                {
                    key: tabKeys.addRecorder,
                    text: Translate('IDCS_ADD_RECORDER'),
                    show: supportRecorder.value,
                },
            ]
        })
        const activeTab = ref(tabKeys.quickAdd)
        const quickAddTableData = ref<ChannelQuickAddDto[]>([])
        const manualAddFormData = ref<ChannelManualAddDto[]>([])
        const addRecorderTableData = ref<ChannelAddRecorderDto[]>([])
        const defaultPwdList = ref<ChannelDefaultPwdDto[]>([])
        const mapping = ref<Record<string, ChannelDefaultPwdDto>>({})
        const selNum = ref(0)
        const total = ref(0)
        const txtBandwidth = ref('')
        const manufacturerMap = ref<Record<string, string>>({})
        const manufacturerList = ref<SelectOption<string, string>[]>([])
        const nameList = ref<SelectOption<string, string>[]>([])
        const protocolList = ref<ChannelRTSPPropertyDto[]>([])
        const quickAddEditRowData = ref(new ChannelQuickAddDto())
        const chlCountLimit = ref(128) // 通道个数上限
        const faceMatchLimitMaxChlNum = ref(0)
        const activateIpcData = ref<ChannelQuickAddDto[]>([])
        const setProtocolPopVisiable = ref(false)
        const multiChlIPCAddRef = ref<channelAddMultiChlIPCAddPop>()

        let rtspMapping: Array<string> = []
        const tempManualProtocolData: Array<string> = []

        // 手动添加
        const manualAddTypeOptions = ref([
            {
                value: 'ip',
                label: 'IPv4',
            },
            {
                value: 'ipv6',
                label: 'IPv6',
            },
            {
                value: 'domain',
                label: Translate('IDCS_DOMAIN'),
            },
        ])

        const getSystemCaps = () => {
            openLoading()
            queryRecordDistributeInfo().then((res) => {
                const $ = queryXml(res)
                const mode = $('content/recMode/mode').text()
                querySystemCaps().then((res) => {
                    closeLoading()
                    const $ = queryXml(res)
                    chlCountLimit.value = $('content/chlMaxCount').text().num()
                    const totalBandwidth = $('content/totalBandwidth').text().num()
                    const usedBandwidth = $('content/' + (mode === 'auto' ? 'usedAutoBandwidth' : 'usedManualBandwidth'))
                        .text()
                        .num()
                    supportRecorder.value = $('content/supportRecorder').text().bool()
                    faceMatchLimitMaxChlNum.value = $('content/faceMatchLimitMaxChlNum').text().num()
                    const remainBandwidth = Math.max(0, (totalBandwidth * 1024 - usedBandwidth) / 1024)
                    txtBandwidth.value = Translate('IDCS_CURRENT_BANDWIDTH_ALL_D_D').formatForLang(remainBandwidth.toFixed(0), totalBandwidth.toFixed(0))
                })
            })
        }

        const getDefaultPwd = async () => {
            openLoading()

            const res = await queryDevDefaultPwd()
            const $ = queryXml(res)

            closeLoading()

            if ($('status').text() === 'success') {
                mapping.value = {}
                defaultPwdList.value = $('content/item').map((ele) => {
                    const $item = queryXml(ele.element)
                    const defaultPwdData = new ChannelDefaultPwdDto()
                    defaultPwdData.id = ele.attr('id')
                    defaultPwdData.userName = $item('userName').text()
                    defaultPwdData.password = $item('password').text()
                    defaultPwdData.displayName = $item('displayName').text()
                    defaultPwdData.protocolType = $item('protocolType').text()

                    mapping.value[defaultPwdData.id] = defaultPwdData
                    return defaultPwdData
                })
            }
        }

        const getLanFreeDevs = () => {
            openLoading()
            queryLanFreeDeviceList().then(async (res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    manufacturerMap.value = {}
                    manufacturerList.value = []
                    nameList.value = []
                    $('types/manufacturer/enum').forEach((ele) => {
                        const value = ele.text()
                        const label = ele.attr('displayName')
                        manufacturerMap.value[value] = label
                        manufacturerList.value.push({
                            value,
                            label,
                        })
                        nameList.value.push({
                            value,
                            label,
                        })
                    })
                    await getProtocolList()
                    if (cababilityStore.analogChlCount * 1 <= 0) {
                        manufacturerList.value.push({
                            value: 'ProtocolMgr',
                            label: Translate('IDCS_PROTOCOL_MANAGE'),
                        })
                        nameList.value.push({
                            value: 'ProtocolMgr',
                            label: Translate('IDCS_PROTOCOL_MANAGE'),
                        })
                    }
                    manualAddFormData.value = []
                    addManualAddRow()
                    const rowData = $('content/item').map((ele) => {
                        const eleXml = queryXml(ele.element)
                        return {
                            ip: eleXml('ip').text(),
                            port: eleXml('port').text(),
                            httpPort: eleXml('httpPort').text(), // IPC激活时需要
                            mask: eleXml('mask').text(),
                            gateway: eleXml('gateway').text(),
                            manufacturer: eleXml('manufacturer').text(),
                            poeIndex: eleXml('poeIndex').text(),
                            productModel: {
                                factoryName: eleXml('productModel').attr('factoryName'),
                                identity: eleXml('productModel').attr('identity'),
                                innerText: eleXml('productModel').text(),
                            },
                            devName: eleXml('devName').text(),
                            version: eleXml('version').text(),
                            mac: eleXml('mac').text(),
                            industryProductType: eleXml('industryProductType').text(),
                            protocolType: eleXml('protocolType').text(),
                            activateStatus: eleXml('activateStatus').text(),
                        }
                    })
                    rowData.sort((ele1, ele2) => {
                        return getIpNumber(ele2.ip) - getIpNumber(ele1.ip)
                    })
                    rowData.sort((ele1, ele2) => {
                        const activate1 = ele1.activateStatus === 'UNACTIVATED' ? 1 : ele1.activateStatus === 'UNKNOWN' ? 0 : -1
                        const activate2 = ele2.activateStatus === 'UNACTIVATED' ? 1 : ele2.activateStatus === 'UNKNOWN' ? 0 : -1
                        return activate2 - activate1
                    })
                    quickAddTableData.value = rowData
                    total.value = rowData.length
                }
            })
        }

        const getLanRecorders = () => {
            openLoading()
            queryLanRecorderList().then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    addRecorderTableData.value = $('content/item').map((ele) => {
                        const eleXml = queryXml(ele.element)
                        return {
                            ip: eleXml('ip').text(),
                            port: eleXml('port').text().num(),
                            version: eleXml('version').text(),
                            name: eleXml('name').text(),
                            serialNum: eleXml('serialNum').text(),
                            chlTotalCount: eleXml('chlTotalCount').text().num(),
                            httpPort: eleXml('httpPort').text().num(),
                            chlAddedCount: eleXml('chlAddedCount').text().num(),
                            productModel: eleXml('productModel').text(),
                            displayName: eleXml('name').text() + (eleXml('chlTotalCount').text().num() > 0 ? '(' + eleXml('chlAddedCount').text() + '/' + eleXml('chlTotalCount').text() + ')' : ''),
                        }
                    })
                }
            })
        }

        const getProtocolList = async () => {
            const res = await queryRtspProtocolList()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                protocolList.value = []
                rtspMapping = []
                $('content/item').forEach((ele) => {
                    const eleXml = queryXml(ele.element)
                    if (eleXml('enabled').text().bool()) {
                        const displayName = eleXml('displayName').text()
                        manufacturerMap.value[displayName] = displayName
                        rtspMapping.push(displayName)
                        manufacturerList.value.push({
                            value: displayName,
                            label: displayName,
                        })
                        protocolList.value.push({
                            displayName: displayName,
                            index: ele.attr('id'),
                        })
                    }
                })
            }
        }

        const closeSetProtocolPop = (isRefresh = false) => {
            setProtocolPopVisiable.value = false
            if (isRefresh) getData()
        }

        const addManualAddRow = (length = -1) => {
            if (length !== manualAddFormData.value.length - 1) {
                return
            }

            const defaultPwdData = defaultPwdList.value[0]
            let defaultPort = 80
            if (defaultPwdData.protocolType === 'TVT_IPCAMERA') {
                if (defaultPwdData.displayName === 'Speco') {
                    defaultPort = 554
                } else {
                    defaultPort = 9008
                }
            }
            const newData = new ChannelManualAddDto()
            newData.ip = DEFAULT_EMPTY_IP
            newData.port = defaultPort
            newData.userName = defaultPwdData.userName
            newData.password = '******'
            newData.manufacturer = defaultPwdData.id
            newData.protocolType = defaultPwdData.protocolType
            newData.addrType = 'ip'
            manualAddFormData.value.push(newData)
            tempManualProtocolData.push(newData.manufacturer)
        }

        const formatDisplayManufacturer = (rowData: ChannelQuickAddDto) => {
            if (rowData.productModel.factoryName) {
                return rowData.productModel.factoryName
            } else {
                return rowData.manufacturer ? manufacturerMap.value[rowData.manufacturer] : ''
            }
        }

        const handleQuickAddRowClick = (rowData: ChannelQuickAddDto) => {
            quickAddTableRef.value!.clearSelection()
            quickAddTableRef.value!.toggleRowSelection(rowData, true)
        }

        const isDelManualAddRowDisabled = (index: number) => {
            return index === manualAddFormData.value.length - 1
        }

        const delManualAddRow = (index: number) => {
            manualAddFormData.value.splice(index, 1)
        }

        const changeManufacturer = (index: number, row: ChannelManualAddDto) => {
            const val = row.manufacturer
            if (val === 'ProtocolMgr') {
                setProtocolPopVisiable.value = true
                nextTick(() => {
                    row.manufacturer = tempManualProtocolData[index]
                })
            } else {
                if (index < tempManualProtocolData.length) tempManualProtocolData[index] = val
                const isArray = protocolList.value
                    .map((item) => item.displayName)
                    .some((ele) => {
                        return trimAllSpace(ele) === trimAllSpace(val)
                    })
                if (isArray) {
                    row.port = 0
                    row.userName = ''
                    row.password = ''
                    row.portDisabled = true
                } else {
                    let defaultPort = 80
                    if (mapping.value[val].protocolType === 'TVT_IPCAMERA') {
                        if (mapping.value[val].displayName === 'Speco') {
                            defaultPort = 554
                        } else {
                            defaultPort = 9008
                        }
                    } else {
                        defaultPort = 80
                    }
                    row.port = defaultPort
                    row.userName = mapping.value[val].userName
                    row.password = '******'
                    row.portDisabled = false
                }
            }
            addManualAddRow(index)
        }

        const handleRefresh = () => {
            switch (activeTab.value) {
                case tabKeys.quickAdd:
                    getDefaultPwd()
                    getLanFreeDevs()
                    break
                case tabKeys.addRecorder:
                    getDefaultPwd()
                    getLanRecorders()
                    break
            }
        }

        // 激活IPC
        const isActivateIPCPop = ref(false)

        const activateIPC = () => {
            const selectedRows: Array<ChannelQuickAddDto> = quickAddTableRef.value!.getSelectionRows()
            const unActivateData = selectedRows.filter((ele) => ele.activateStatus === 'UNACTIVATED')

            if (!selectedRows.length) {
                openMessageBox(Translate('IDCS_SEL_ACTIVATE_CHANNEL'))
                return false
            }

            if (!unActivateData.length) {
                openMessageBox(Translate('IDCS_NO_CHANNEL_TO_ACTIVATE'))
                return false
            }

            activateIpcData.value = unActivateData
            isActivateIPCPop.value = true
        }

        const closeActivateIPCPop = () => {
            isActivateIPCPop.value = false
        }

        // 设置默认密码
        const isSetDefaultPwdPop = ref(false)

        const setDefaultPwd = () => {
            isSetDefaultPwdPop.value = true
        }

        const closeSetDefaultPwdPop = () => {
            isSetDefaultPwdPop.value = false
        }

        // 快速添加编辑通道ip
        const isEditIPCIpPop = ref(false)

        const openEditIPCIpPop = (row: ChannelQuickAddDto) => {
            quickAddEditRowData.value = row
            isEditIPCIpPop.value = true
        }

        const closeEditIPCIpPop = () => {
            isEditIPCIpPop.value = false
        }

        const handleQuickAddSelectionChange = () => {
            selNum.value = quickAddTableRef.value!.getSelectionRows().length
        }

        const goBack = () => {
            router.push('list')
        }

        const changeDefaultPwd = (rows: Array<ChannelDefaultPwdDto>) => {
            defaultPwdList.value = rows
            mapping.value = {}
            rows.forEach((ele) => {
                mapping.value[ele.id] = ele
            })
        }

        // 添加录像机
        const cloneRecoderEditItem = new ChannelAddRecorderDto()
        const recoderEditItem = ref<ChannelAddRecorderDto>(cloneRecoderEditItem)
        const isAddRecorderPop = ref(false)

        let selectedRecoder: ChannelAddRecorderDto | null = null

        const handleRecorderRowClick = (rowData: ChannelAddRecorderDto) => {
            selectedRecoder = rowData
        }

        const handleRecorderRowDbClick = (rowData: ChannelAddRecorderDto) => {
            recoderEditItem.value = selectedRecoder = rowData
            isAddRecorderPop.value = true
        }

        const closeAddRecorderPop = () => {
            isAddRecorderPop.value = false
        }

        const addRecorder = () => {
            recoderEditItem.value = cloneRecoderEditItem
            isAddRecorderPop.value = true
        }

        const save = () => {
            switch (activeTab.value) {
                case tabKeys.quickAdd:
                case tabKeys.manualAdd:
                    setData()
                    break
                case tabKeys.addRecorder:
                    if (selectedRecoder) {
                        recoderEditItem.value = selectedRecoder
                        isAddRecorderPop.value = true
                    }
                    break
            }
        }

        const setData = async () => {
            await getDefaultPwd()

            if (activeTab.value === tabKeys.quickAdd) {
                let addChlCount = 0

                const manufacturer = Object.entries(manufacturerMap.value)
                    .map((item) => {
                        return `<enum displayName='${item[1]}'>${item[0]}</enum>`
                    })
                    .join('')
                let numName = Number(localStorage.getItem(LocalCacheKey.KEY_DEFAULT_CHL_MAX_VALUE))
                const selection = quickAddTableRef.value!.getSelectionRows() as ChannelQuickAddDto[]
                const items = selection
                    .map((ele) => {
                        let data = ''
                        // 处理IPC设备名称为空格的情况
                        const devName = ele.devName.trim()
                        const defaultName = devName ? devName : Translate('IDCS_IP_CHANNEL')
                        // 添加IPC时，若设备有名称，则使用设备的名称；若设备无名称，则使用默认的名称+序号(自动计数)
                        let normalName = defaultName
                        let thermalName = defaultName
                        if (!devName) {
                            numName++
                            normalName = padStart(numName, 2)
                            thermalName = padStart(numName + 1, 2)
                            normalName = defaultName + ' ' + normalName
                            thermalName = defaultName + ' ' + thermalName
                        }

                        if (ele.industryProductType === 'THERMAL_DOUBLE') {
                            data += getXmlDataByQuickAdd(ele, 'NORMAL', normalName)
                            data += getXmlDataByQuickAdd(ele, 'THERMAL_DOUBLE', thermalName)
                            numName++
                            addChlCount += 2
                        } else {
                            data += getXmlDataByQuickAdd(ele, 'NORMAL', normalName)
                            addChlCount++
                        }
                        return data
                    })
                    .join('')

                if (!addChlCount) {
                    router.push('list')
                    return
                }

                const sendXml = rawXml`
                    <types>
                        <manufacturer>
                            ${manufacturer}
                        </manufacturer>
                        <protocolType>
                            <enum>TVT_IPCAMERA</enum>
                            <enum>ONVIF</enum>
                        </protocolType>
                    </types>
                    <content type='list'>
                        <itemType>
                            <manufacturer type='manufacturer'/>
                            <protocolType type='protocolType'/>
                        </itemType>
                        ${items}
                    </content>
                `
                addIPCDev(sendXml)
            } else {
                const allDatas: { isArray: boolean; element: ChannelManualAddDto }[] = []
                for (const element of manualAddFormData.value) {
                    const isArray = protocolList.value
                        .map((item) => item.displayName)
                        .some((ele) => {
                            return trimAllSpace(ele) === trimAllSpace(element.manufacturer)
                        })
                    element.userName = cutStringByByte(element.userName, nameByteMaxLen)
                    if (!element.userName && rtspMapping.every((thisEntry) => trimAllSpace(thisEntry) !== trimAllSpace(element.manufacturer))) {
                        continue
                    }

                    allDatas.push({
                        isArray: isArray,
                        element: element,
                    })
                }
                multiChlIPCAddRef.value?.init(allDatas, mapping.value, manufacturerMap.value, protocolList.value, (sendXml: string) => {
                    addIPCDev(sendXml)
                })
            }
        }

        const getXmlDataByQuickAdd = (element: ChannelQuickAddDto, supportType: string, chlName: string) => {
            return rawXml`
                <item>
                    <name maxByteLen="63">${wrapCDATA(chlName)}</name>
                    <ip>${element.ip}</ip>
                    <port>${element.port}</port>
                    <userName>${mapping.value[element.manufacturer].userName}</userName>
                    <index>0</index>
                    <manufacturer>${element.manufacturer}</manufacturer>
                    <protocolType>${mapping.value[element.manufacturer].protocolType}</protocolType>
                    <productModel ${element.productModel.factoryName ? `factoryName="${element.productModel.identity || element.productModel.factoryName}"` : ''}>${element.productModel.innerText}</productModel>
                    ${element.poeIndex ? `<poeIndex>${element.poeIndex}</poeIndex>` : ''}
                    <accessType>${supportType === 'THERMAL_DOUBLE' ? 'THERMAL' : 'NORMAL'}</accessType>
                    <rec per='5' post='10' />
                    <snapSwitch>true</snapSwitch>
                    <buzzerSwitch>false</buzzerSwitch>
                    <popVideoSwitch>false</popVideoSwitch>
                    <frontEndOffline_popMsgSwitch>false</frontEndOffline_popMsgSwitch>
                </item>
            `
        }

        const addIPCDev = (sendXml: string) => {
            openLoading()
            createDevList(sendXml).then((res) => {
                closeLoading()
                const $ = queryXml(res)
                getSystemCaps()
                if ($('status').text() === 'success') {
                    openMessageBox({
                        type: 'success',
                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                    }).then(() => {
                        router.push('list')
                    })
                } else {
                    const errorCode = $('errorCode').text().num()
                    switch (errorCode) {
                        case ErrorCode.USER_ERROR_NODE_ID_EXISTS:
                            openMessageBox(Translate('IDCS_PROMPT_CHANNEL_EXIST'))
                            break
                        case ErrorCode.USER_ERROR_OVER_LIMIT:
                            openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT')).then(() => {
                                router.push('list')
                            })
                            break
                        case ErrorCode.USER_ERROR_OVER_BANDWIDTH_LIMIT:
                            openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_BANDWIDTH_LIMIT'))
                            break
                        case ErrorCode.USER_ERROR_SPECIAL_CHAR:
                            const poePort = $('poePort').text()
                            // POE连接冲突提示
                            openMessageBox(Translate('IDCS_POE_RESOURCE_CONFLICT_TIP').formatForLang(poePort))
                            break
                        case ErrorCode.USER_ERROR_LIMITED_PLATFORM_TYPE_MISMATCH:
                            openMessageBox(Translate('IDCS_ADD_CHANNEL_FAIL').formatForLang(faceMatchLimitMaxChlNum.value))
                            break
                        case ErrorCode.USER_ERROR_INVALID_IP:
                            openMessageBox(Translate('IDCS_PROMPT_IPADDRESS_V6_INVALID'))
                            break
                        case ErrorCode.USER_ERROR_PC_LICENSE_MISMATCH:
                            const msg = Translate('IDCS_ADD_CHANNEL_FAIL').formatForLang(faceMatchLimitMaxChlNum.value) + Translate('IDCS_REBOOT_DEVICE').formatForLang(Translate('IDCS_KEEP_ADD'))
                            openMessageBox({
                                type: 'question',
                                message: msg,
                            }).then(() => {
                                const data = rawXml`
                                    <content>
                                        <AISwitch>false</AISwitch>
                                    </content>
                                `
                                editBasicCfg(data)
                            })
                            break
                        default:
                            openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                            break
                    }
                }
            })
        }

        const getData = async () => {
            mapping.value = {}
            defaultPwdList.value = []
            await getDefaultPwd()
            getLanFreeDevs()
            getLanRecorders()
            getSystemCaps()
        }

        onMounted(() => {
            getData()
        })

        return {
            quickAddTableRef,
            manualAddTableRef,
            addRecorderTableRef,
            tabs,
            tabKeys,
            activeTab,
            quickAddTableData,
            manualAddFormData,
            addRecorderTableData,
            selNum,
            total,
            supportsIPCActivation,
            txtBandwidth,
            formatDisplayManufacturer,
            handleQuickAddRowClick,
            manualAddTypeOptions,
            manufacturerList,
            isDelManualAddRowDisabled,
            addManualAddRow,
            delManualAddRow,
            changeManufacturer,
            handleRefresh,
            activateIPC,
            activateIpcData,
            isActivateIPCPop,
            closeActivateIPCPop,
            goBack,
            handleQuickAddSelectionChange,
            isSetDefaultPwdPop,
            setDefaultPwd,
            closeSetDefaultPwdPop,
            changeDefaultPwd,
            isEditIPCIpPop,
            openEditIPCIpPop,
            closeEditIPCIpPop,
            quickAddEditRowData,
            mapping,
            save,
            recoderEditItem,
            handleRecorderRowClick,
            handleRecorderRowDbClick,
            isAddRecorderPop,
            closeAddRecorderPop,
            chlCountLimit,
            faceMatchLimitMaxChlNum,
            addRecorder,
            setProtocolPopVisiable,
            closeSetProtocolPop,
            nameList,
            multiChlIPCAddRef,
        }
    },
})
