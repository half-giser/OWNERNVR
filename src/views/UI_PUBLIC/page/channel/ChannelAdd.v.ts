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
import ChannelAddMultiChlIPCAddPop from './ChannelAddMultiChlIPCAddPop.vue'
import ChannelAddEditChlNoPop from './ChannelAddEditChlNoPop.vue'
import ChannelAddDevChlIpPlanningPop from './ChannelAddDevChlIpPlanningPop.vue'
import type { TableInstance } from 'element-plus'

export default defineComponent({
    components: {
        ChannelAddActivateIPCPop,
        ChannelAddSetDefaultPwdPop,
        ChannelAddEditIPCIpPop,
        ChannelAddToAddRecorderPop,
        ChannelAddSetProtocolPop,
        ChannelAddMultiChlIPCAddPop,
        ChannelAddEditChlNoPop,
        ChannelAddDevChlIpPlanningPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const router = useRouter()
        const supportsIPCActivation = systemCaps.supportsIPCActivation
        const userSession = useUserSessionStore()

        const MULTI_CHANNEL_IPC_NAME_MAPPING: Record<string, string[]> = {
            F: [Translate('IDCS_FISHEYE')],
            P: [Translate('IDCS_FISHEYEMODE_PANORAMA')],
            'F+P+3PTZ': [Translate('IDCS_FISHEYE'), Translate('IDCS_FISHEYEMODE_PANORAMA'), Translate('IDCS_PTZ'), Translate('IDCS_PTZ'), Translate('IDCS_PTZ')],
            'F+4PTZ': [Translate('IDCS_FISHEYE'), Translate('IDCS_PTZ'), Translate('IDCS_PTZ'), Translate('IDCS_PTZ'), Translate('IDCS_PTZ')],
            'F+4PTZFusion': [Translate('IDCS_FISHEYE'), Translate('IDCS_PTZ'), Translate('IDCS_PTZ'), Translate('IDCS_PTZ'), Translate('IDCS_PTZ'), Translate('Fusion')],
        }

        const tabKeys = {
            quickAdd: 'quickAdd',
            manualAdd: 'manualAdd',
            addRecorder: 'addRecorder',
            autoReport: 'autoReport',
        }

        const tabs = ref([
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
                show: systemCaps.supportRecorder,
            },
            {
                key: tabKeys.autoReport,
                text: Translate('IDCS_AUTO_REPORT_ADD'),
                show: true,
            },
        ])

        const activeTab = ref(tabKeys.quickAdd)

        const quickAddTableRef = ref<TableInstance>()
        const quickAddTableData = ref<ChannelQuickAddDto[]>([])

        const manualAddTableRef = ref<TableInstance>()
        const manualAddTableData = ref<ChannelManualAddDto[]>([])

        const addRecorderTableRef = ref<TableInstance>()
        const addRecorderTableData = ref<ChannelAddRecorderDto[]>([])

        const autoReportTableRef = ref<TableInstance>()
        const autoReportTableData = ref<ChannelAddReportDto[]>([])

        const total = ref(0)
        const quickAddEditRowData = ref(new ChannelQuickAddDto())
        const activateIpcData = ref<ChannelQuickAddDto[]>([])
        const setProtocolPopVisiable = ref(false)
        const autoReportManufacturerMap = ref<Record<string, string>>({})

        const pageData = ref({
            poeChlTotalCount: 0,
            usedChlNum: [] as number[],
            isEditChlNoPop: false,
            chlNoEditData: new ChannelQuickAddDto(),
            addReportChlNoEditData: new ChannelAddReportDto(),
            selNum: 0,
            bandwidth: '',
            isIpPlanningPop: false,
            manufacturerList: [] as SelectOption<string, string>[],
            rtspNames: [] as string[],
            protocolList: [] as SelectOption<string, string>[],
            isAddRecorderPop: false,
            defaultPwdList: [] as ChannelDefaultPwdDto[],
            isEditIPCIpPop: false,
            isSetDefaultPwdPop: false,
            isActivateIPCPop: false,
            totalDev: 0,
            isMultiChlPop: false,
            isMultiChlConfirmed: false,
            multiChlList: [] as ChannelManualAddDto[],
        })

        const manufactureNameList = computed(() => {
            return pageData.value.manufacturerList.map((item) => item.label)
        })

        const protocolNameList = computed(() => {
            return pageData.value.protocolList.map((item) => item.label)
        })

        const allManufatureList = computed(() => {
            const list = [...pageData.value.manufacturerList, ...pageData.value.protocolList]

            if (systemCaps.analogChlCount <= 0) {
                list.push({
                    value: 'ProtocolMgr',
                    label: Translate('IDCS_PROTOCOL_MANAGE'),
                })
            }

            return list
        })

        const manufacturerMap = computed(() => {
            return Object.fromEntries([...pageData.value.manufacturerList, ...pageData.value.protocolList].map((item) => [item.value, item.label]))
        })

        const defaultPwdMap = computed<Record<string, ChannelDefaultPwdDto>>(() => {
            return Object.fromEntries(pageData.value.defaultPwdList.map((item) => [item.id, item]))
        })

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

        const getSystemCaps = async () => {
            const res1 = await queryRecordDistributeInfo()
            const $res1 = queryXml(res1)
            const mode = $res1('content/recMode/mode').text()

            const $ = await systemCaps.updateCabability()
            const totalBandwidth = $('content/totalBandwidth').text().num()
            const usedBandwidth = $('content/' + (mode === 'auto' ? 'usedAutoBandwidth' : 'usedManualBandwidth'))
                .text()
                .num()
            const remainBandwidth = Math.max(0, (totalBandwidth * 1024 - usedBandwidth) / 1024)
            pageData.value.bandwidth = Translate('IDCS_CURRENT_BANDWIDTH_ALL_D_D').formatForLang(remainBandwidth.toFixed(0), totalBandwidth.toFixed(0))
        }

        const getDefaultPwd = async () => {
            const res = await queryDevDefaultPwd()
            const $ = queryXml(res)

            if ($('status').text() === 'success') {
                pageData.value.defaultPwdList = $('content/item').map((ele) => {
                    const $item = queryXml(ele.element)
                    const defaultPwdData = new ChannelDefaultPwdDto()
                    defaultPwdData.id = ele.attr('id')
                    defaultPwdData.userName = $item('userName').text()
                    defaultPwdData.password = $item('password').text()
                    defaultPwdData.displayName = $item('displayName').text()
                    defaultPwdData.protocolType = $item('protocolType').text()
                    return defaultPwdData
                })
            }
        }

        const getLanFreeDevs = async () => {
            const res = await queryLanFreeDeviceList()
            const $ = queryXml(res)

            if ($('status').text() === 'success') {
                pageData.value.manufacturerList = []
                $('types/manufacturer/enum').forEach((ele) => {
                    const value = ele.text()
                    const label = ele.attr('displayName')
                    pageData.value.manufacturerList.push({
                        value,
                        label,
                    })
                })

                const rowData = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        ip: $item('ip').text(),
                        port: $item('port').text().num(),
                        httpPort: $item('httpPort').text().num(), // IPC激活时需要
                        httpType: $item('httpType').text(), // IPC激活和快速添加通道时需要
                        mask: $item('mask').text(),
                        gateway: $item('gateway').text(),
                        manufacturer: $item('manufacturer').text(),
                        poeIndex: $item('poeIndex').text(),
                        productModel: {
                            factoryName: $item('productModel').attr('factoryName'),
                            identity: $item('productModel').attr('identity'),
                            innerText: $item('productModel').text(),
                        },
                        devName: $item('devName').text(),
                        version: $item('version').text(),
                        mac: $item('mac').text(),
                        industryProductType: $item('industryProductType').text(),
                        protocolType: $item('protocolType').text(),
                        activateStatus: $item('activateStatus').text(),
                        chlNum: 0,
                        localEthName: $item('localEthName').text(), // BA-3948新增 表明是从哪个网卡搜索上来的
                        subIp: $item('subIp').text(), // BA-3948新增 子IP 用于激活 TVT IPC
                        subIpNetMask: $item('subIpNetMask').text(), // BA-3948新增 子IP的子网掩码 用于激活 TVT IPC
                        channelNumber: $item('channelNumber').text().num(),
                        multiChlList: [],
                    }
                })

                rowData.sort((ele1, ele2) => {
                    return getIpNumber(ele1.ip) - getIpNumber(ele2.ip)
                })

                rowData.sort((ele1, ele2) => {
                    const activate1 = ele1.activateStatus === 'UNACTIVATED' ? 1 : ele1.activateStatus === 'UNKNOWN' ? 0 : -1
                    const activate2 = ele2.activateStatus === 'UNACTIVATED' ? 1 : ele2.activateStatus === 'UNKNOWN' ? 0 : -1
                    return activate2 - activate1
                })

                quickAddTableData.value = rowData
                total.value = rowData.length
            }
        }

        const getLanRecorders = async () => {
            const res = await queryLanRecorderList()
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
        }

        const getProtocolList = async () => {
            const res = await queryRtspProtocolList()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.protocolList = []
                $('content/item').forEach((ele) => {
                    const eleXml = queryXml(ele.element)
                    if (eleXml('enabled').text().bool()) {
                        const displayName = eleXml('displayName').text()
                        pageData.value.protocolList.push({
                            label: displayName,
                            value: ele.attr('id'),
                        })
                    }
                })
            }
        }

        const closeSetProtocolPop = (isRefresh = false) => {
            setProtocolPopVisiable.value = false
            if (isRefresh) getData()
        }

        const getUserdChlNum = async () => {
            const sendXml = rawXml`
                <requireField>
                    <name/>
                    <ip/>
                    <chlNum/>
                    <chlType/>
                </requireField>
            `
            const result = await queryDevList(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.totalDev = $('content').attr('total').num()

                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const addType = $item('addType').text()
                    if (addType === 'poe') {
                        pageData.value.poeChlTotalCount++
                    }
                    const chlNum = $item('chlNum').text().num()
                    if (chlNum) pageData.value.usedChlNum.push(chlNum)
                })
            }
        }

        const chlNumOptions = computed(() => {
            return arrayToOptions(
                Array(systemCaps.chlMaxCount)
                    .fill(0)
                    .map((_, index) => {
                        return index + 1
                    })
                    .filter((item) => !pageData.value.usedChlNum.includes(item)),
            )
        })

        const editQuickAddChlNum = (row: ChannelQuickAddDto) => {
            pageData.value.chlNoEditData = row
            pageData.value.isEditChlNoPop = true
        }

        const confirmEditChlNum = (chlNum: number) => {
            pageData.value.isEditChlNoPop = false
            if (activeTab.value === tabKeys.quickAdd) {
                pageData.value.chlNoEditData.chlNum = chlNum
            } else {
                pageData.value.addReportChlNoEditData.chlNum = chlNum
            }
        }

        const addManualAddRow = (length = -1) => {
            if (length !== manualAddTableData.value.length - 1) {
                return
            }

            const defaultPwdData = pageData.value.defaultPwdList[0]

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

            const allChlNum = chlNumOptions.value.map((item) => item.value)
            const usedChlNum = manualAddTableData.value.map((item) => item.chlNum)
            const unusedChlNum = allChlNum.filter((item) => !usedChlNum.includes(item))
            if (unusedChlNum.length) {
                newData.chlNum = unusedChlNum.shift()!
            } else {
                newData.chlNum = allChlNum.at(-1)!
            }

            manualAddTableData.value.push(newData)
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
            return index === manualAddTableData.value.length - 1
        }

        const delManualAddRow = (index: number) => {
            manualAddTableData.value.splice(index, 1)
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
                const isArray = protocolNameList.value.some((ele) => {
                    return trimAllSpace(ele) === trimAllSpace(val)
                })
                if (isArray) {
                    row.port = 0
                    row.userName = ''
                    row.password = ''
                    row.portDisabled = true
                } else {
                    let defaultPort = 80
                    if (defaultPwdMap.value[val].protocolType === 'TVT_IPCAMERA') {
                        if (defaultPwdMap.value[val].displayName === 'Speco') {
                            defaultPort = 554
                        } else {
                            defaultPort = 9008
                        }
                    } else {
                        defaultPort = 80
                    }
                    row.port = defaultPort
                    row.userName = defaultPwdMap.value[val].userName
                    row.password = '******'
                    row.portDisabled = false
                }
            }
            addManualAddRow(index)
        }

        const handleRefresh = () => {
            switch (activeTab.value) {
                case tabKeys.quickAdd:
                    openLoading()
                    Promise.all([getDefaultPwd(), getLanFreeDevs(), getProtocolList()]).then(() => {
                        closeLoading()
                        manualAddTableData.value = []
                        addManualAddRow()
                    })
                    break
                case tabKeys.addRecorder:
                    openLoading()
                    Promise.all([getDefaultPwd(), getLanRecorders()]).then(() => {
                        closeLoading()
                    })
                    break
                case tabKeys.autoReport:
                    openLoading()
                    Promise.all([getDefaultPwd(), getAutoReportDevs()]).then(() => {
                        closeLoading()
                    })
                    break
                default:
                    break
            }
        }

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
            pageData.value.isActivateIPCPop = true
        }

        const closeActivateIPCPop = () => {
            pageData.value.isActivateIPCPop = false
        }

        const setDefaultPwd = () => {
            pageData.value.isSetDefaultPwdPop = true
        }

        const closeSetDefaultPwdPop = () => {
            pageData.value.isSetDefaultPwdPop = false
        }

        const openEditIPCIpPop = (row: ChannelQuickAddDto) => {
            quickAddEditRowData.value = row
            pageData.value.isEditIPCIpPop = true
        }

        const closeEditIPCIpPop = () => {
            pageData.value.isEditIPCIpPop = false
        }

        const handleQuickAddSelectionChange = () => {
            const rows = quickAddTableRef.value!.getSelectionRows() as ChannelQuickAddDto[]
            pageData.value.selNum = rows.length
            quickAddTableData.value.forEach((item) => {
                if (!rows.includes(item)) {
                    item.chlNum = 0
                }
            })
            const allChlNum = chlNumOptions.value.map((item) => item.value)
            const usedChlNum = rows.map((item) => item.chlNum)
            const unusedChlNum = allChlNum.filter((item) => !usedChlNum.includes(item))
            rows.forEach((item) => {
                if (!item.chlNum && unusedChlNum.length) {
                    item.chlNum = unusedChlNum.shift()!
                }
            })
        }

        const goBack = () => {
            router.push('/config/channel/list')
        }

        const changeDefaultPwd = (rows: Array<ChannelDefaultPwdDto>) => {
            pageData.value.defaultPwdList = rows
        }

        // 添加录像机
        const cloneRecoderEditItem = new ChannelAddRecorderDto()
        const recoderEditItem = ref<ChannelAddRecorderDto>(cloneRecoderEditItem)

        let selectedRecoder: ChannelAddRecorderDto | null = null

        const handleRecorderRowClick = (rowData: ChannelAddRecorderDto) => {
            selectedRecoder = rowData
        }

        const handleRecorderRowDbClick = (rowData: ChannelAddRecorderDto) => {
            recoderEditItem.value = selectedRecoder = rowData
            pageData.value.isAddRecorderPop = true
        }

        const closeAddRecorderPop = () => {
            pageData.value.isAddRecorderPop = false
        }

        const addRecorder = () => {
            recoderEditItem.value = cloneRecoderEditItem
            pageData.value.isAddRecorderPop = true
        }

        /**
         * @description 判断待添加的通道列表中分配的通道号是否重复（不包括通道IP为空、"0.0.0.0"、端口为0的情况）
         * @returns
         */
        const checkChlNumRepeat = (chlNums: number[]) => {
            const flag = chlNums.length <= new Set(chlNums).size

            if (!flag) {
                openMessageBox(Translate('IDCS_CHANNEL_SAME_TIP'))
            }

            return flag
        }

        const save = () => {
            if (pageData.value.totalDev > systemCaps.ipChlMaxCount) {
                openMessageBox(Translate('IDCS_MAX_CHANNEL_ERROR'))
                return
            }

            switch (activeTab.value) {
                case tabKeys.quickAdd:
                case tabKeys.manualAdd:
                case tabKeys.autoReport:
                    setData()
                    break
                case tabKeys.addRecorder:
                    if (selectedRecoder) {
                        recoderEditItem.value = selectedRecoder
                        pageData.value.isAddRecorderPop = true
                    }
                    break
            }
        }

        const getExistChl = async () => {
            const sendXml = rawXml`
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
            const result = await queryDevList(sendXml)
            const $ = queryXml(result)

            return $('content/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    id: item.attr('id')!,
                    chlNum: $item('chlNum').text(),
                    name: $item('name').text(),
                    devID: $item('devID').text(),
                    ip: $item('ip').text(),
                    port: $item('port').text(),
                    poePort: $item('poePort').text(),
                    userName: $item('userName').text(),
                    password: $item('password').text(),
                    accessType: $item('AccessType').text().num() === 0 ? 'NORMAL' : 'THERMAL',
                    chlIndex: $item('chlIndex').text().num(), // 多通道IPC产品的子通道号
                }
            })
        }

        const getQuickAddXML = async (rows: ChannelQuickAddDto[]) => {
            openLoading()
            const normalChlData: ChannelQuickAddDto[] = [] // 普通通道数据（可见光通道也属于普通单目通道）
            const thermalChlData: ChannelQuickAddDto[] = [] // 热成像通道数据（热成像IPC为双通道，包括：可见光通道，热成像通道）
            const fisheyeChlData: ChannelQuickAddDto[] = [] // 鱼眼通道数据（鱼眼IPC为多通道，包括：1，2，3，4，...）
            const nonRtspData: ChannelQuickAddDto[] = [] // 非RTSP通道类型数据（包含：热成像通道，鱼眼通道，...）

            const allChlNum = chlNumOptions.value.map((item) => item.value)
            const usedChlNum = rows.filter((item) => item.ip === '' || item.ip === '0.0.0.0').map((item) => item.chlNum)

            rows.forEach((item) => {
                if (item.ip !== '' && item.ip !== '0.0.0.0' && item.port !== 0) {
                    nonRtspData.push(item)
                }
            })

            const allExistsChlData = await getExistChl()

            nonRtspData.forEach((item) => {
                const resArr = allExistsChlData.filter((chl) => chl.ip === item.ip)
                // 热成像通道
                if (item.industryProductType === 'THERMAL_DOUBLE') {
                    item.multiChlList = [
                        {
                            chlType: 'visibleLight',
                            chlLabel: Translate('IDCS_VISIBLE_LIGHT'),
                            type: 'visibleLight',
                            disabled: resArr.length === 2 || (resArr.length === 1 && resArr[0].accessType === 'NORMAL'),
                            checked: false,
                        },
                        {
                            chlType: 'thermal',
                            chlLabel: Translate('IDCS_THERMAL_LIGHT'),
                            type: 'thermal',
                            disabled: resArr.length === 2 || (resArr.length === 1 && resArr[0].accessType === 'THERMAL'),
                            checked: false,
                        },
                    ]
                    thermalChlData.push(item)
                } else if (item.channelNumber) {
                    const addedChannelNumbers = resArr.filter((item) => item.chlIndex).map((item) => item.chlIndex)
                    for (let i = 0; i < item.channelNumber; i++) {
                        item.multiChlList.push({
                            chlType: i,
                            chlLabel: i + 1 + '',
                            type: i + '',
                            disabled: addedChannelNumbers.includes(i),
                            checked: false,
                        })
                    }
                    fisheyeChlData.push(item)
                } else if (item.industryProductType === 'THERMAL_SINGLE') {
                    if (resArr.length > 0) return
                    normalChlData.push(item)
                } else {
                    // NORMAL
                    normalChlData.push(item)
                }
            })

            let nameNum = Number(localStorage.getItem(LocalCacheKey.KEY_DEFAULT_CHL_MAX_VALUE))
            let itemXml = ''

            const getChlName = (item: ChannelQuickAddDto) => {
                nameNum++
                return (item.devName ? item.devName.trim() : Translate('IDCS_IP_CHANNEL')) + ' ' + padStart(nameNum, 2)
            }

            const getChlNum = (num: number) => {
                const unusedChlNum = allChlNum.filter((item) => !usedChlNum.includes(item))
                if (!unusedChlNum) return 0
                const smaller = unusedChlNum.filter((item) => item < num)
                const bigger = unusedChlNum.filter((item) => item > num)
                const nums = bigger.concat(smaller)
                usedChlNum.push(nums[0])
                return nums[0]
            }

            normalChlData.forEach((item) => {
                itemXml += getQuickAddItemXml(item, 'NORMAL', item.chlNum, getChlName(item), 0)
            })

            thermalChlData.forEach((item) => {
                let index = 0
                item.multiChlList.forEach((info) => {
                    if (!info.disabled) {
                        const chlNum = index === 0 ? item.chlNum : getChlNum(item.chlNum)
                        itemXml += getQuickAddItemXml(item, info.chlType === 'visibleLight' ? 'NORMAL' : 'THERMAL', chlNum, getChlName(item), 0)
                        index++
                    }
                })
            })

            fisheyeChlData.forEach((item) => {
                let index = 0
                item.multiChlList.forEach((info) => {
                    if (!info.disabled) {
                        const chlNum = index === 0 ? item.chlNum : getChlNum(item.chlNum)
                        itemXml += getQuickAddItemXml(item, 'NORMAL', chlNum, getChlName(item), info.chlType)
                        index++
                    }
                })
            })

            const sendXml = rawXml`
                <types>
                    <manufacturer>
                        ${Object.entries(manufacturerMap.value)
                            .map((item) => {
                                return `<enum displayName='${item[1]}'>${item[0]}</enum>`
                            })
                            .join('')}
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
                    ${itemXml}
                </content>
            `

            closeLoading()

            return sendXml
        }

        const getQuickAddItemXml = (item: ChannelQuickAddDto, accessType: 'NORMAL' | 'THERMAL', chlNum = 0, chlName = '', chlIndex: string | number = 0) => {
            if (chlNum === 0) {
                return ''
            }

            const manufacturer = item.manufacturer.includes('LUMA') && item.manufacturer.includes('X10') ? 'LUMA X10' : item.manufacturer
            return rawXml`
                <item>
                    <name>${wrapCDATA(chlName)}</name>
                    <ip>${item.ip}</ip>
                    <port>${item.port}</port>
                    <userName>${wrapCDATA(defaultPwdMap.value[item.manufacturer].userName)}</userName>
                    <index>${chlIndex}</index>
                    <channelId>${chlNum}</channelId>
                    <manufacturer>${manufacturer}</manufacturer>
                    <protocolType>${item.protocolType}</protocolType>
                    <accessType>${accessType}</accessType>
                    <rec per='5' post='10'/>
                    <snapSwitch>true</snapSwitch>
                    <buzzerSwitch>false</buzzerSwitch>
                    <popVideoSwitch>false</popVideoSwitch>
                    <frontEndOffline_popMsgSwitch>false</frontEndOffline_popMsgSwitch>
                    <productModel ${item.productModel.factoryName ? ` factoryName="${item.productModel.identity || item.productModel.factoryName}"` : ''}>${item.productModel.innerText}</productModel>
                    ${item.poeIndex ? `<poeIndex>${item.poeIndex}</poeIndex>` : ''}
                    <localEthName>${item.localEthName}</localEthName>
                    <mac>${item.mac}</mac>
                    <allowAssignIP>true</allowAssignIP>
                    ${
                        item.activateStatus === 'UNACTIVATED'
                            ? rawXml`
                                <subIp>${item.subIp}</subIp>
                                <subIpNetMask>${item.subIpNetMask}</subIpNetMask>
                                <httpPort>${item.httpPort}</httpPort>
                                <httpType>${item.httpType}</httpType>
                            `
                            : ''
                    }
                </item>
            `
        }

        const createLanDeviceRequest = async (row: ChannelManualAddDto) => {
            const manufacturer = row.manufacturer.includes('LUMA') && row.manufacturer.includes('X10') ? 'LUMA X10' : row.manufacturer
            const sendXml = rawXml`
                <content>
                    <manufacturer>${manufacturer}</manufacturer>
                    ${row.addrType === 'ip' ? `<ip>${row.ip}</ip>` : ''}
                    ${row.addrType === 'ipv6' ? `<ip>${row.domain}</ip>` : ''}
                    ${row.addrType === 'domain' ? (checkIpV4(row.domain) ? `<ip>${row.domain}</ip>` : `<domain>${wrapCDATA(row.domain)}</domain>`) : ''}
                    <port>${row.port}</port>
                    <userName>${wrapCDATA(row.userName)}</userName>
                    ${row.password && row.password !== '******' ? `<password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(row.password, userSession.sesionKey))}</password>` : ''}
                </content>
            `
            const result = await queryLanDevice(sendXml)
            return queryXml(result)
        }

        const ErrorCodeMap: Record<number, string> = {
            536870934: Translate('IDCS_FAILED'),
            536870935: Translate('IDCS_NODE_NOT_ONLINE'),
            536870943: Translate('IDCS_INVALID_PARAMETER'),
            536870945: Translate('IDCS_DEVICE_BUSY'),
            536870960: Translate('IDCS_DEVICE_BUSY'),
            536870953: Translate('IDCS_NO_PERMISSION'),
            536870931: Translate('IDCS_NETWORK_DISCONNECT'),
            536870944: Translate('IDCS_NOT_SUPPORTFUNC'),
            536870975: Translate('IDCS_NOT_SUPPORTFUNC'),
            536870948: Translate('IDCS_DEVICE_PWD_ERROR'),
            536870947: Translate('IDCS_DEVICE_USER_NOTEXIST'),
            536870964: Translate('IDCS_LOGIN_OVERTIME'),
            536870973: Translate('IDCS_NOSUPPORT_DEV_VERSION'),
            536870976: Translate('IDCS_DEVICE_TYPE_ERR'),
            536870963: Translate('IDCS_OHTER_HASENTER'),
            536870950: Translate('IDCS_CONNECT_LIMIT'),
            536870970: Translate('IDCS_NAME_EXISTED'),
            536870913: Translate('IDCS_CAMERA_EXISTED'),
            536871004: Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
            536871005: Translate('IDCS_OVER_MAX_BANDWIDTH_LIMIT'),
            536870977: Translate('IDCS_FILE_TYPE_ERROR'),
            536871007: Translate('IDCS_RESOURCE_CONFLICT'),
            536871006: Translate('IDCS_ERROR_IP_SAME_NETWORK_SEGMAENT'),
            536870995: Translate('IDCS_ERROR_IP_MASK_ALL0'),
            536870994: Translate('IDCS_ERROR_IP_MASK_ALL1'),
            536870996: Translate('IDCS_ERROR_ROUTE_MASK_ALL1'),
            536870997: Translate('IDCS_ERROR_ROUTE_MASK_ALL0'),
            536870992: Translate('IDCS_PROMPT_IPADDRESS_INVALID'),
            536870993: Translate('IDCS_PROMPT_SUBNET_MASK_INVALID'),
            536870998: Translate('IDCS_ERROR_USE_LOOPBACK'),
            536870999: Translate('IDCS_ERROR_IP_ROUTE_INVALID'),
            536871000: Translate('IDCS_ERROR_MASK_NOT_CONTINE'),
            536871001: Translate('IDCS_ERROR_DIFFERENT_SEGMENT'),
            536871002: Translate('IDCS_PROMPT_GATEWAY_INVALID'),
            536871010: Translate('IDCS_ERROR_RTSP_URL'),
            536871018: Translate('IDCS_DISK_IN_GROUP_ERROR'),
            536871012: Translate('IDCS_CREATE_RAID_ERROR'),
            536871013: Translate('IDCS_DELETE_RAID_ERROR'),
            536871014: Translate('IDCS_CONFIG_HOT_DISK_ERROR'),
            536871015: Translate('IDCS_CONFIG_NORMAL_DISK_ERROR'),
            536871016: Translate('IDCS_REPAIR_RAID_ERROR'),
            536871040: Translate('IDCS_PWD_STRONG_ERROR'),
            536871042: Translate('IDCS_LOCAL_FACE_LIMIT'),
            536871044: Translate('IDCS_FACEMATCH_NUM_LIMIT'),
            536871049: Translate('IDCS_CLOUD_UPGRADE_FAIED'),
            536871066: Translate('IDCS_DEVICE_TYPE_FAIL'),
            536871087: Translate('IDCS_REMOTE_CHL_ID_ERR'),
            536871050: Translate('IDCS_ADD_CHANNEL_FAIL').formatForLang(systemCaps.faceMatchLimitMaxChlNum),
            536871051: Translate('IDCS_MAX_CHANNEL_LIMIT').formatForLang(systemCaps.faceMatchLimitMaxChlNum),
        }

        const confirmSetMultiChl = (chls: ChannelManualAddDto[]) => {
            pageData.value.multiChlList = chls
            pageData.value.isMultiChlConfirmed = true
            pageData.value.isMultiChlPop = false
        }

        const getManualAddXML = async (rows: ChannelManualAddDto[]) => {
            openLoading()
            const normalChlData: ChannelManualAddDto[] = [] // 普通通道数据（可见光通道也属于普通单目通道）
            const thermalChlData: ChannelManualAddDto[] = [] // 热成像通道数据（热成像IPC为双通道，包括：可见光通道，热成像通道）
            const fisheyeChlData: ChannelManualAddDto[] = [] // 鱼眼通道数据（鱼眼IPC为多通道，包括：1，2，3，4，...）
            const rstpChlData: ChannelManualAddDto[] = [] // RTSP通道类型数据
            const nonRtspData: ChannelManualAddDto[] = [] // 非RTSP通道类型数据（包含：热成像通道，鱼眼通道，...）

            const allChlNum = chlNumOptions.value.map((item) => item.value)
            const usedChlNum: number[] = []

            rows.forEach((item) => {
                const isRTSP = protocolNameList.value.some((name) => trimAllSpace(name) === trimAllSpace(item.manufacturer))
                const legalHost = (item.addrType === 'ip' && item.ip !== '0.0.0.0') || (item.addrType !== 'ip' && item.domain !== '')

                if (legalHost && isRTSP) {
                    rstpChlData.push(item)
                    usedChlNum.push(item.chlNum)
                }

                if (legalHost && !isRTSP && item.port !== 0) {
                    nonRtspData.push(item)
                    usedChlNum.push(item.chlNum)
                }
            })

            for (const item of nonRtspData) {
                const $ = await createLanDeviceRequest(item)
                if ($('status').text() === 'success') {
                    item.industryProductType = $('content/industryProductType').text()
                    item.channelNumber = $('content/channelNumber').text().num() // 有此字段并且值大于0，代表“鱼眼多通道IPC”（但只有大于1时，才会弹框供选择子通道）
                    item.fisheyeStreamType = $('content/fisheyeStreamType').text() // 有此字段，则表示多通道IPC的子通道有各自的名称展示，否则依然展示1，2，3，4...作为子通道名称
                } else {
                    const errorCode = $('errorCode').text().num()
                    // 返回“fail”，代表“普通单目IPC”
                    item.industryProductType = 'NORMAL'
                    item.errorMsg = ErrorCodeMap[errorCode] ? ErrorCodeMap[errorCode] : Translate('IDCS_UNKNOWN_ERROR_CODE') + errorCode
                    const find = quickAddTableData.value.find((element) => element.ip === item.ip)
                    if (find) {
                        item.channelNumber = find.channelNumber
                    }
                }
            }

            const allExistsChlData = await getExistChl()

            nonRtspData.forEach((item) => {
                const resArr = allExistsChlData.filter((chl) => chl.ip === item.ip)
                // 热成像通道
                if (item.industryProductType === 'THERMAL_DOUBLE') {
                    item.multiChlList = [
                        {
                            chlType: 'visibleLight',
                            chlLabel: Translate('IDCS_VISIBLE_LIGHT'),
                            type: 'visibleLight',
                            disabled: resArr.length === 2 || (resArr.length === 1 && resArr[0].accessType === 'NORMAL'),
                            checked: resArr.length === 2 || (resArr.length === 1 && resArr[0].accessType === 'NORMAL'),
                        },
                        {
                            chlType: 'thermal',
                            chlLabel: Translate('IDCS_THERMAL_LIGHT'),
                            type: 'thermal',
                            disabled: resArr.length === 2 || (resArr.length === 1 && resArr[0].accessType === 'THERMAL'),
                            checked: resArr.length === 2 || (resArr.length === 1 && resArr[0].accessType === 'THERMAL'),
                        },
                    ]
                    thermalChlData.push(item)
                }
                // 鱼眼
                else if (item.channelNumber > 1) {
                    const addedChannelNumbers = resArr.filter((item) => item.chlIndex).map((item) => item.chlIndex)
                    for (let i = 0; i < item.channelNumber; i++) {
                        item.multiChlList.push({
                            chlType: i,
                            chlLabel: item.fisheyeStreamType ? MULTI_CHANNEL_IPC_NAME_MAPPING[item.fisheyeStreamType][i] : i + 1 + '',
                            type: i + '',
                            disabled: addedChannelNumbers.includes(i),
                            checked: false,
                        })
                    }
                    fisheyeChlData.push(item)
                } else if (item.industryProductType === 'THERMAL_SINGLE') {
                    if (resArr.length > 0) return
                    normalChlData.push(item)
                } else {
                    // NORMAL
                    normalChlData.push(item)
                }
            })

            closeLoading()
            pageData.value.multiChlList = [...thermalChlData, ...fisheyeChlData]

            if (pageData.value.multiChlList.length) {
                pageData.value.isMultiChlPop = true
                pageData.value.isMultiChlConfirmed = false
                await new Promise(async (resolve, reject) => {
                    await nextTick()
                    const stopWatch = watch(
                        () => pageData.value.isMultiChlPop,
                        (val) => {
                            if (!val) {
                                if (pageData.value.isMultiChlConfirmed) {
                                    resolve(void 0)
                                } else {
                                    reject()
                                }

                                stopWatch()
                            }
                        },
                    )
                })
            }

            let nameNum = Number(localStorage.getItem(LocalCacheKey.KEY_DEFAULT_CHL_MAX_VALUE))
            let itemXml = ''

            const getChlName = () => {
                nameNum++
                return Translate('IDCS_IP_CHANNEL') + ' ' + padStart(nameNum, 2)
            }

            const getChlNum = (num: number) => {
                const unusedChlNum = allChlNum.filter((item) => !usedChlNum.includes(item))
                if (!unusedChlNum) return 0
                const smaller = unusedChlNum.filter((item) => item < num)
                const bigger = unusedChlNum.filter((item) => item > num)
                const nums = bigger.concat(smaller)
                usedChlNum.push(nums[0])
                return nums[0]
            }

            rstpChlData.forEach((item) => {
                itemXml += getManualAddItemXML(item, 'RTSP', 'NORMAL', 0, getChlName(), 0)
            })

            normalChlData.forEach((item) => {
                itemXml += getManualAddItemXML(item, 'NON-RTSP', 'NORMAL', item.chlNum, getChlName(), 0)
            })

            thermalChlData.forEach((item) => {
                let index = 0
                item.multiChlList.forEach((info) => {
                    if (!info.disabled) {
                        const chlNum = index === 0 ? item.chlNum : getChlNum(item.chlNum)
                        itemXml += getManualAddItemXML(item, 'NON-RTSP', info.chlType === 'visibleLight' ? 'NORMAL' : 'THERMAL', chlNum, getChlName(), 0)
                        index++
                    }
                })
            })

            fisheyeChlData.forEach((item) => {
                let index = 0
                item.multiChlList.forEach((info) => {
                    if (!info.disabled) {
                        const chlNum = index === 0 ? item.chlNum : getChlNum(item.chlNum)
                        itemXml += getManualAddItemXML(item, 'NON-RTSP', 'NORMAL', chlNum, getChlName(), info.chlType)
                        index++
                    }
                })
            })

            const sendXml = rawXml`
                <types>
                    <manufacturer>
                        ${Object.entries(manufacturerMap.value)
                            .map((item) => {
                                return `<enum displayName='${item[1]}'>${item[0]}</enum>`
                            })
                            .join('')}
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
                    ${itemXml}
                </content>
            `

            return sendXml
        }

        const getManualAddItemXML = (item: ChannelManualAddDto, type: 'RTSP' | 'NON-RTSP', accessType: 'NORMAL' | 'THERMAL', chlNum = 0, chlName = '', chlIndex: string | number = 0) => {
            if (type === 'RTSP') {
                let manufacturerID = '1'
                const find = pageData.value.protocolList.find((element) => {
                    if (trimAllSpace(element.value) === trimAllSpace(item.manufacturer)) {
                        return true
                    }
                    return false
                })
                if (find) {
                    manufacturerID = find.value
                }

                return rawXml`
                    <item>
                        <name>${wrapCDATA(chlName)}</name>
                        ${item.addrType === 'ip' ? `<ip>${item.ip}</ip>` : ''}
                        ${item.addrType === 'ipv6' ? `<ip>${item.domain}</ip>` : ''}
                        ${item.addrType === 'domain' ? (checkIpV4(item.domain) ? `<ip>${item.domain}</ip>` : `<domain>${wrapCDATA(item.domain)}</domain>`) : ''}
                        <port>0</port>
                        <userName>${wrapCDATA(item.userName)}</userName>
                        <password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(item.password, userSession.sesionKey))}</password>
                        <index>${chlIndex}</index>
                        <channelId>${chlNum}</channelId>
                        <manufacturer>RTSP_${manufacturerID}</manufacturer>
                        <protocolType>RTSP</protocolType>
                        <productModel></productModel>
                        <rec per='5' post='10'/>
                        <snapSwitch>true</snapSwitch>
                        <buzzerSwitch>false</buzzerSwitch>
                        <popVideoSwitch>false</popVideoSwitch>
                        <frontEndOffline_popMsgSwitch>false</frontEndOffline_popMsgSwitch>
                    </item>
                `
            }

            if (type === 'NON-RTSP') {
                // const chlNum = getChlNum(item.chlNum, option.needAutoAllocChlNumFlag)
                // 过滤掉因通道号不足而未分配到可用通道号的通道item
                if (chlNum === 0) {
                    return ''
                }

                const manufacturer = item.manufacturer.includes('LUMA') && item.manufacturer.includes('X10') ? 'LUMA X10' : item.manufacturer
                return rawXml`
                    <item>
                        <name>${wrapCDATA(chlName)}</name>
                        ${item.addrType === 'ip' ? `<ip>${item.ip}</ip>` : ''}
                        ${item.addrType === 'ipv6' ? `<ip>${item.domain}</ip>` : ''}
                        ${item.addrType === 'domain' ? (checkIpV4(item.domain) ? `<ip>${item.domain}</ip>` : `<domain>${wrapCDATA(item.domain)}</domain>`) : ''}
                        <port>${item.port}</port>
                        <userName>${wrapCDATA(item.userName)}</userName>
                        <password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(item.password, userSession.sesionKey))}</password>
                        <index>${chlIndex}</index>
                        <channelId>${chlNum}</channelId>
                        <manufacturer>${manufacturer}</manufacturer>
                        <protocolType>${item.protocolType}</protocolType>
                        <accessType>${accessType}</accessType>
                        <rec per='5' post='10'/>
                        <snapSwitch>false</snapSwitch>
                        <buzzerSwitch>false</buzzerSwitch>
                        <popVideoSwitch>false</popVideoSwitch>
                        <frontEndOffline_popMsgSwitch>true</frontEndOffline_popMsgSwitch>
                        <productModel></productModel>
                    </item>
                `
            }

            return ''
        }

        const setData = async () => {
            // 让协议自己判断通道号是否重复，web不判断（为了保持相同的错误提示：NTA1-2634）
            await getDefaultPwd()

            if (activeTab.value === tabKeys.quickAdd) {
                let rows = (quickAddTableRef.value!.getSelectionRows() as ChannelQuickAddDto[]).filter((item) => {
                    return item.chlNum !== 0
                })

                const ipPlan = await getIpPlan()
                if (!ipPlan) {
                    const selectedIps: string[] = []
                    rows = rows.filter((item) => {
                        if (!selectedIps.includes(item.ip)) {
                            selectedIps.push(item.ip)
                            return true
                        }
                        return false
                    })
                }

                if (!rows.length) {
                    goBack()
                    return
                }

                if (!checkChlNumRepeat(rows.filter((item) => item.ip && item.ip !== '0.0.0.0' && item.port !== 0).map((item) => item.chlNum))) {
                    return
                }

                const sendXml = await getQuickAddXML(rows)
                addIPCDev(sendXml)
            }

            if (activeTab.value === tabKeys.manualAdd) {
                if (!checkChlNumRepeat(manualAddTableData.value.filter((item) => item.ip && item.ip !== '0.0.0.0' && item.port !== 0).map((item) => item.chlNum))) {
                    return
                }

                manualAddTableData.value.some((item) => {
                    if (item.ip && item.ip !== '0.0.0.0' && item.port) {
                        if (!item.userName && !protocolNameList.value.includes(item.manufacturer)) {
                            openMessageBox(Translate('IDCS_INVALID_CHAR'))
                            return
                        }
                    }
                })

                const sendXml = await getManualAddXML(manualAddTableData.value)
                addIPCDev(sendXml)
            }

            if (activeTab.value === tabKeys.autoReport) {
                const rows = autoReportTableRef.value!.getSelectionRows() as ChannelAddReportDto[]

                if (!checkChlNumRepeat(rows.filter((item) => item.ip && item.ip !== '0.0.0.0' && item.port !== 0).map((item) => item.chlNum))) {
                    return
                }

                const defaultChlMaxValue = Number(localStorage.getItem(LocalCacheKey.KEY_DEFAULT_CHL_MAX_VALUE))
                const defaultName = Translate('IDCS_IP_CHANNEL')
                const sendXml = rawXml`
                    <types>
                        <manufacturer>
                            ${Object.entries(manufacturerMap.value)
                                .map((item) => {
                                    return `<enum displayName='${item[1]}'>${item[0]}</enum>`
                                })
                                .join('')}
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
                        ${rows
                            .map((item, index) => {
                                return rawXml`
                                    <item>
                                        <autoReportID>${item.autoReportID}</autoReportID>
                                        <name>${wrapCDATA(`${defaultName} ${padStart(defaultChlMaxValue + index + 1, 2)}`)}</name>
                                        <ip>${item.ip}</ip>
                                        <port>${item.port}</port>
                                        <userName>${wrapCDATA(item.username)}</userName>
                                        ${item.password !== '******' ? `<password ${getSecurityVer()}>${AES_encrypt(item.password, userSession.sesionKey)}</password>` : ''}
                                        <index>0</index>
                                        <channelId>${item.chlNum}</channelId>
                                        <manufacturer>${item.manufacturer}</manufacturer>
                                        <protocolType>${item.protocolType}</protocolType>
                                        <productModel></productModel>
                                        <accessType>NORMAL</accessType>
                                        <rec per='5' post='10'/>
                                        <snapSwitch>true</snapSwitch>
                                        <buzzerSwitch>false</buzzerSwitch>
                                        <popVideoSwitch>false</popVideoSwitch>
                                        <frontEndOffline_popMsgSwitch>true</frontEndOffline_popMsgSwitch>
                                    </item>
                                `
                            })
                            .join('')}
                    </content>
                `
                addIPCDev(sendXml)
            }
        }

        const addIPCDev = async (sendXml: string) => {
            openLoading()
            const res = await createDevList(sendXml)
            await getSystemCaps()
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).then(() => {
                    goBack()
                })
            } else {
                const errorCode = $('errorCode').text().num()
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_NODE_ID_EXISTS:
                        openMessageBox(Translate('IDCS_PROMPT_CHANNEL_EXIST'))
                        break
                    case ErrorCode.USER_ERROR_OVER_LIMIT:
                        openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT')).then(() => {
                            goBack()
                        })
                        break
                    case ErrorCode.USER_ERROR_OVER_BANDWIDTH_LIMIT:
                        openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_BANDWIDTH_LIMIT'))
                        break
                    case ErrorCode.USER_ERROR_SPECIAL_CHAR:
                        const poePort = $('poePort').text()
                        // POE连接冲突提示
                        openMessageBox(poePort ? Translate('IDCS_POE_RESOURCE_CONFLICT_TIP').formatForLang(poePort) : Translate('IDCS_CHANNEL_SAME_TIP'))
                        break
                    case ErrorCode.USER_ERROR_LIMITED_PLATFORM_TYPE_MISMATCH:
                        openMessageBox(Translate('IDCS_ADD_CHANNEL_FAIL').formatForLang(systemCaps.faceMatchLimitMaxChlNum))
                        break
                    case ErrorCode.USER_ERROR_INVALID_IP:
                        openMessageBox(Translate('IDCS_PROMPT_IPADDRESS_V6_INVALID'))
                        break
                    case ErrorCode.USER_ERROR_PC_LICENSE_MISMATCH:
                        const msg = Translate('IDCS_ADD_CHANNEL_FAIL').formatForLang(systemCaps.faceMatchLimitMaxChlNum) + Translate('IDCS_REBOOT_DEVICE').formatForLang(Translate('IDCS_KEEP_ADD'))
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
        }

        const getIpPlan = async () => {
            const result = await queryBasicCfg()
            const $ = queryXml(result)
            return $('content/channelIpPlanning').text().bool()
        }

        const getAutoReportDevs = async () => {
            const defaultPwdData = Object.values(defaultPwdMap.value).find((item) => item.protocolType === 'TVT_IPCAMERA')!

            const result = await queryAutoReportDevList()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                $('types/manufacturer/enum').forEach((item) => {
                    autoReportManufacturerMap.value[item.text()] = item.attr('displayName')
                })

                autoReportTableData.value = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        autoReportID: $item('reportID').text(),
                        ip: $item('ip').text(),
                        port: $item('port').text().num(),
                        manufacturer: $item('manufacturer').text(),
                        protocolType: $item('protocolType').text(),
                        username: defaultPwdData.userName || '',
                        password: '******',
                        chlNum: 0,
                    }
                })
            }
        }

        const displayAutoReportManufaturer = (row: ChannelAddReportDto) => {
            return autoReportManufacturerMap.value[row.protocolType]
        }

        const handleAddReportRowClick = (row: ChannelAddReportDto) => {
            addRecorderTableRef.value!.clearSelection()
            addRecorderTableRef.value!.toggleRowSelection(row, true)
        }

        const handleAddReportSelectionChange = () => {
            const rows = quickAddTableRef.value!.getSelectionRows() as ChannelAddReportDto[]
            pageData.value.selNum = rows.length
            autoReportTableData.value.forEach((item) => {
                if (!rows.includes(item)) {
                    item.chlNum = 0
                }
            })
            const allChlNum = chlNumOptions.value.map((item) => item.value)
            const usedChlNum = rows.map((item) => item.chlNum)
            const unusedChlNum = allChlNum.filter((item) => !usedChlNum.includes(item))
            rows.forEach((item) => {
                if (!item.chlNum && unusedChlNum.length) {
                    item.chlNum = unusedChlNum.shift()!
                }
            })
        }

        const editAutoReportChlNum = (row: ChannelAddReportDto) => {
            pageData.value.isEditChlNoPop = true
            pageData.value.addReportChlNoEditData = row
        }

        const getData = async () => {
            openLoading()
            Promise.all([getUserdChlNum(), getDefaultPwd(), getLanFreeDevs(), getProtocolList(), getSystemCaps()]).then(() => {
                manualAddTableData.value = []
                addManualAddRow()
                closeLoading()
            })
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
            manualAddTableData,
            addRecorderTableData,
            total,
            supportsIPCActivation,
            formatDisplayManufacturer,
            handleQuickAddRowClick,
            manualAddTypeOptions,
            isDelManualAddRowDisabled,
            addManualAddRow,
            delManualAddRow,
            changeManufacturer,
            handleRefresh,
            activateIPC,
            activateIpcData,
            closeActivateIPCPop,
            goBack,
            handleQuickAddSelectionChange,
            setDefaultPwd,
            closeSetDefaultPwdPop,
            changeDefaultPwd,
            openEditIPCIpPop,
            closeEditIPCIpPop,
            quickAddEditRowData,
            save,
            recoderEditItem,
            handleRecorderRowClick,
            handleRecorderRowDbClick,
            closeAddRecorderPop,
            addRecorder,
            setProtocolPopVisiable,
            closeSetProtocolPop,
            editQuickAddChlNum,
            confirmEditChlNum,
            chlNumOptions,
            pageData,
            autoReportTableRef,
            systemCaps,
            autoReportTableData,
            handleAddReportRowClick,
            handleAddReportSelectionChange,
            displayAutoReportManufaturer,
            editAutoReportChlNum,
            manufactureNameList,
            allManufatureList,
            defaultPwdMap,
            confirmSetMultiChl,
        }
    },
})
