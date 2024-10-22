/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 新增通道
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-22 15:47:08
 */
import { ChannelManualAddDto, DefaultPwdDto } from '@/types/apiType/channel'
import { ChannelAddRecorderDto, ChannelQuickAddDto } from '@/types/apiType/channel'
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
        const { openLoading, closeLoading } = useLoading()
        const cababilityStore = useCababilityStore()
        const router = useRouter()
        const { openMessageTipBox } = useMessageBox()
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
                { key: tabKeys.quickAdd, text: Translate('IDCS_QUICK_ADD'), show: true },
                { key: tabKeys.manualAdd, text: Translate('IDCS_MANUAL_ADD'), show: true },
                { key: tabKeys.addRecorder, text: Translate('IDCS_ADD_RECORDER'), show: supportRecorder.value },
            ]
        })
        const activeTab = ref(tabKeys.quickAdd)
        const quickAddTableData = ref([] as Array<ChannelQuickAddDto>)
        const manualAddFormData = ref([] as Array<ChannelManualAddDto>)
        const addRecorderTableData = ref([] as Array<ChannelAddRecorderDto>)
        const defaultPwdList = ref([] as Array<DefaultPwdDto>)
        const mapping = ref({} as Record<string, DefaultPwdDto>)
        const selNum = ref(0)
        const total = ref(0)
        const txtBandwidth = ref('')
        const manufacturerMap = ref({} as Record<string, string>)
        const manufacturerList = ref([] as Array<Record<string, string>>)
        const nameList = ref([] as Array<Record<string, string>>)
        const protocolList = ref([] as Array<Record<string, string>>)
        const quickAddEditRowData = ref(new ChannelQuickAddDto())
        const chlCountLimit = ref(128) // 通道个数上限
        const faceMatchLimitMaxChlNum = ref(0)
        const activateIpcData = ref([] as Array<ChannelQuickAddDto>)
        const setProtocolPopVisiable = ref(false)
        const multiChlIPCAddRef = ref<channelAddMultiChlIPCAddPop>()

        let rtspMapping = [] as Array<string>
        const tempManualProtocolData = [] as Array<string>

        // 手动添加
        const manualAddTypeOptions = ref([
            { value: 'ip', text: 'IPv4' },
            { value: 'ipv6', text: 'IPv6' },
            { value: 'domain', text: Translate('IDCS_DOMAIN') },
        ])

        const getSystemCaps = () => {
            openLoading()
            queryRecordDistributeInfo().then((res) => {
                const $ = queryXml(res)
                const mode = $('//content/recMode/mode').text()
                querySystemCaps().then((res) => {
                    closeLoading()
                    const $ = queryXml(res)
                    chlCountLimit.value = Number($('//content/chlMaxCount').text())
                    const totalBandwidth = Number($('//content/totalBandwidth').text())
                    const usedBandwidth = Number($('//content/' + (mode == 'auto' ? 'usedAutoBandwidth' : 'usedManualBandwidth')).text())
                    supportRecorder.value = $('//content/supportRecorder').text().toBoolean()
                    faceMatchLimitMaxChlNum.value = Number($('//content/faceMatchLimitMaxChlNum').text())
                    let remainBandwidth = (totalBandwidth * 1024 - usedBandwidth) / 1024
                    if (remainBandwidth < 0) remainBandwidth = 0
                    txtBandwidth.value = Translate('IDCS_CURRENT_BANDWIDTH_ALL_D_D').formatForLang(remainBandwidth.toFixed(0), totalBandwidth.toFixed(0))
                })
            })
        }

        const getDefaultPwd = (callback?: () => void) => {
            openLoading()
            queryDevDefaultPwd().then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    defaultPwdList.value = []
                    mapping.value = {}
                    $('//content/item').forEach((ele) => {
                        const eleXml = queryXml(ele.element)
                        const defaultPwdData = new DefaultPwdDto()
                        defaultPwdData.id = ele.attr('id') as string
                        defaultPwdData.userName = eleXml('userName').text()
                        defaultPwdData.password = eleXml('password').text()
                        defaultPwdData.displayName = eleXml('displayName').text()
                        defaultPwdData.protocolType = eleXml('protocolType').text()
                        defaultPwdList.value.push(defaultPwdData)

                        mapping.value[defaultPwdData.id] = defaultPwdData
                    })
                    if (callback) callback()
                }
            })
        }

        const getLanFreeDevs = () => {
            openLoading()
            queryLanFreeDeviceList().then(async (res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    manufacturerMap.value = {}
                    manufacturerList.value = []
                    nameList.value = []
                    $('//types/manufacturer/enum').forEach((ele) => {
                        const value = ele.text()
                        const text = ele.attr('displayName')!
                        manufacturerMap.value[value] = text
                        manufacturerList.value.push({
                            value: value,
                            text: text,
                        })
                        nameList.value.push({
                            value: value,
                            text: text,
                        })
                    })
                    await getProtocolList()
                    if (cababilityStore.analogChlCount * 1 <= 0) {
                        manufacturerList.value.push({
                            value: 'ProtocolMgr',
                            text: Translate('IDCS_PROTOCOL_MANAGE'),
                        })
                        nameList.value.push({
                            value: 'ProtocolMgr',
                            text: Translate('IDCS_PROTOCOL_MANAGE'),
                        })
                    }
                    manualAddFormData.value = []
                    manualAddNewRow(0)
                    const rowData: ChannelQuickAddDto[] = $('//content/item').map((ele) => {
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
                        const activate1 = ele1['activateStatus'] == 'UNACTIVATED' ? 1 : ele1['activateStatus'] == 'UNKNOWN' ? 0 : -1
                        const activate2 = ele2['activateStatus'] == 'UNACTIVATED' ? 1 : ele2['activateStatus'] == 'UNKNOWN' ? 0 : -1
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
                if ($('status').text() == 'success') {
                    addRecorderTableData.value = $('//content/item').map((ele) => {
                        const eleXml = queryXml(ele.element)
                        return {
                            ip: eleXml('ip').text(),
                            port: Number(eleXml('port').text()),
                            version: eleXml('version').text(),
                            name: eleXml('name').text(),
                            serialNum: eleXml('serialNum').text(),
                            chlTotalCount: Number(eleXml('chlTotalCount').text()),
                            httpPort: Number(eleXml('httpPort').text()),
                            chlAddedCount: Number(eleXml('chlAddedCount').text()),
                            productModel: eleXml('productModel').text(),
                            displayName: eleXml('name').text() + (Number(eleXml('chlTotalCount').text()) > 0 ? '(' + eleXml('chlAddedCount').text() + '/' + eleXml('chlTotalCount').text() + ')' : ''),
                        }
                    })
                }
            })
        }

        const getProtocolList = async () => {
            const res = await queryRtspProtocolList()
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                protocolList.value = []
                rtspMapping = []
                $('//content/item').forEach((ele) => {
                    const eleXml = queryXml(ele.element)
                    if (eleXml('enabled').text().toBoolean()) {
                        // todo key、value相同？
                        const displayName = eleXml('displayName').text()
                        manufacturerMap.value[displayName] = displayName
                        rtspMapping.push(displayName)
                        manufacturerList.value.push({
                            value: displayName,
                            text: displayName,
                        })
                        protocolList.value.push({
                            displayName: displayName,
                            index: ele.attr('id')!,
                        })
                    }
                })
            }
        }

        const closeSetProtocolPop = (isRefresh = false) => {
            setProtocolPopVisiable.value = false
            if (isRefresh) getData()
        }

        const manualAddNewRow = (rowCount: number) => {
            const defaultPwdData = defaultPwdList.value[0]
            let defaultPort = 80
            if (defaultPwdData.protocolType == 'TVT_IPCAMERA') {
                if (defaultPwdData.displayName == 'Speco') {
                    defaultPort = 554
                } else {
                    defaultPort = 9008
                }
            } else {
                defaultPort = 80
            }
            const newData = new ChannelManualAddDto()
            newData.ip = '0.0.0.0'
            newData.port = defaultPort
            newData.userName = defaultPwdData.userName
            newData.password = '******'
            newData.index = rowCount // todo 感觉没用处，甚至使用此index可能出现问题（删除数据行时后面数据行的index不会修改）
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

        const handleRowClick = (rowData: ChannelQuickAddDto) => {
            quickAddTableRef.value!.clearSelection()
            quickAddTableRef.value!.toggleRowSelection(rowData, true)
        }

        const rowDelClass = (index: number) => {
            return index === manualAddFormData.value.length - 1 ? true : false
        }

        const rowDel = (index: number) => {
            if (rowDelClass(index)) return
            manualAddFormData.value.splice(index, 1)
        }

        const cellChange = (val: any, index: number, row: ChannelManualAddDto, tag?: string) => {
            if (tag) {
                if (tag === 'manufacturer') {
                    if (val === 'ProtocolMgr') {
                        row.manufacturer = tempManualProtocolData[index]
                        setProtocolPopVisiable.value = true
                    } else {
                        if (index < tempManualProtocolData.length) tempManualProtocolData[index] = val
                        const filters = filterProperty(protocolList.value, 'displayName')
                        let isArray = false
                        filters.forEach((ele) => {
                            //解决中间有空格不相等的问题
                            if (Trim(ele, 'g') == Trim(val, 'g')) isArray = true
                        })
                        if (isArray) {
                            row.port = 0
                            row.userName = ''
                            row.password = ''
                            row.portDisabled = true
                        } else {
                            let defaultPort = 80
                            if (mapping.value[val]['protocolType'] == 'TVT_IPCAMERA') {
                                if (mapping.value[val]['displayName'] == 'Speco') {
                                    defaultPort = 554
                                } else {
                                    defaultPort = 9008
                                }
                            } else {
                                defaultPort = 80
                            }
                            row.port = defaultPort
                            row.userName = mapping.value[val]['userName']
                            row.password = '******'
                            row.portDisabled = false
                        }
                    }
                }
            }
            if (index == manualAddFormData.value.length - 1) manualAddNewRow(manualAddFormData.value.length)
        }

        const Trim = (str: string, is_global: string) => {
            let result
            result = str.replace(/(^\s+)|(\s+$)/g, '')
            if (is_global.toLowerCase() == 'g') {
                result = result.replace(/\s/g, '')
            }
            return result
        }

        const in_array = (stringToSearch: string, arrayToSearch: string[]) => {
            for (let s = 0; s < arrayToSearch.length; s++) {
                const thisEntry = arrayToSearch[s]
                //解决中间有空格不相等的问题
                if (Trim(thisEntry, 'g') == Trim(stringToSearch, 'g')) {
                    return true
                }
            }
            return false
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

        const activateVerify = () => {
            const selectedRows: Array<ChannelQuickAddDto> = quickAddTableRef.value!.getSelectionRows()
            const unActivateData: Array<ChannelQuickAddDto> = []
            if (selectedRows.length == 0) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_SEL_ACTIVATE_CHANNEL'),
                })
                return false
            }
            selectedRows.forEach((ele) => {
                if (ele.activateStatus == 'UNACTIVATED') unActivateData.push(ele)
            })
            if (unActivateData.length == 0) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_NO_CHANNEL_TO_ACTIVATE'),
                })
                return false
            }
            activateIpcData.value = unActivateData
            return true
        }

        // 激活IPC
        const activateIPCVisable = ref(false)

        const handleActivate = () => {
            if (!activateVerify()) return
            activateIPCVisable.value = true
        }

        const closeActivateIPCPop = () => {
            activateIPCVisable.value = false
        }

        // 设置默认密码
        const setDefaultPwdPopVisiable = ref(false)
        const handleSetDefaultPwd = () => {
            setDefaultPwdPopVisiable.value = true
        }
        const closeSetDefaultPwdPop = () => {
            setDefaultPwdPopVisiable.value = false
        }

        // 快速添加编辑通道ip
        const editIPCIpPopVisiable = ref(false)
        const openEditIPCIpPop = (row: ChannelQuickAddDto) => {
            quickAddEditRowData.value = row
            editIPCIpPopVisiable.value = true
        }
        const closeEditIPCIpPop = () => {
            editIPCIpPopVisiable.value = false
        }

        const handleSelectionChange = () => {
            selNum.value = quickAddTableRef.value!.getSelectionRows().length
        }

        const handleCancel = () => {
            router.push('list')
        }

        const handleUpdateMapping = (rows: Array<DefaultPwdDto>) => {
            defaultPwdList.value = rows
            mapping.value = {}
            rows.forEach((ele: DefaultPwdDto) => {
                mapping.value[ele.id] = ele
            })
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
            toAddRecorderPopVisiable.value = true
        }
        const toAddRecorderPopVisiable = ref(false)
        const closeToAddRecorderPopVisiable = () => {
            toAddRecorderPopVisiable.value = false
        }

        const handleManualAdd = () => {
            recoderEditItem.value = cloneRecoderEditItem
            toAddRecorderPopVisiable.value = true
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
                        toAddRecorderPopVisiable.value = true
                    }
                    break
            }
        }

        const setData = () => {
            getDefaultPwd(() => {
                if (activeTab.value === tabKeys.quickAdd) {
                    let addChlCount = 0

                    const manufacturer = Object.entries(manufacturerMap.value)
                        .map((item) => {
                            return `<enum displayName='${item[1]}'>${item[0]}</enum>`
                        })
                        .join('')
                    let numName = Number(localStorage.getItem(LocalCacheKey.defaultChlMaxValue))
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
                                normalName = String(String(numName).length < 2 ? '0' + numName : numName)
                                thermalName = String(String(numName + 1).length < 2 ? '0' + (numName + 1) : numName + 1)
                                normalName = defaultName + ' ' + normalName
                                thermalName = defaultName + ' ' + thermalName
                            }
                            if (ele.industryProductType == 'THERMAL_DOUBLE') {
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
                    const allDatas: Record<string, any>[] = []
                    for (const element of manualAddFormData.value) {
                        const filters = filterProperty(protocolList.value, 'displayName')
                        let isArray = false
                        filters.forEach((ele: string) => {
                            //解决中间有空格不相等的问题
                            if (Trim(ele, 'g') == Trim(element.manufacturer, 'g')) {
                                isArray = true
                            }
                        })
                        element.userName = cutStringByByte(element.userName, nameByteMaxLen)
                        if (!element.userName && !in_array(element.manufacturer, rtspMapping)) continue
                        allDatas.push({
                            isArray: isArray,
                            element: element,
                        })
                    }
                    console.log(allDatas, mapping.value, manufacturerMap.value, protocolList.value)
                    multiChlIPCAddRef.value?.init(allDatas, mapping.value, manufacturerMap.value, protocolList.value, (sendXml: string) => {
                        addIPCDev(sendXml)
                    })
                }
            })
        }

        const getXmlDataByQuickAdd = (element: ChannelQuickAddDto, supportType: string, chlName: string) => {
            return rawXml`
                <item>
                    <name>${chlName}</name>
                    <ip>${element.ip}</ip>
                    <port>${element.port}</port>
                    <userName>${mapping.value[element.manufacturer].userName}</userName>
                    <index>0</index>
                    <manufacturer>${element.manufacturer}</manufacturer>
                    <protocolType>${mapping.value[element.manufacturer].protocolType}</protocolType>
                    <productModel ${element.productModel.factoryName ? `factoryName="${element.productModel.identity || element.productModel.factoryName}"` : ''}>${element.productModel.innerText}</productModel>
                    ${ternary(!!element.poeIndex, `<poeIndex>${element.poeIndex}</poeIndex>`)}
                    <accessType>${supportType === 'THERMAL_DOUBLE' ? 'THERMAL' : 'NORMAL'}</accessType>
                    <rec per='5' post='10'/>
                        <snapSwitch>true</snapSwitch>
                        <buzzerSwitch>false</buzzerSwitch>
                        <popVideoSwitch>false</popVideoSwitch>
                        <frontEndOffline_popMsgSwitch>false</frontEndOffline_popMsgSwitch>
                    </rec>
                </item>
            `
        }

        const addIPCDev = (sendXml: string) => {
            openLoading()
            createDevList(sendXml).then((res) => {
                closeLoading()
                const $ = queryXml(res)
                getSystemCaps()
                if ($('status').text() == 'success') {
                    openMessageTipBox({
                        type: 'success',
                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                    }).then(() => {
                        router.push('list')
                    })
                } else {
                    const errorCode = Number($('errorCode').text())
                    if (errorCode == ErrorCode.USER_ERROR_NODE_ID_EXISTS) {
                        openMessageTipBox({
                            type: 'info',
                            message: Translate('IDCS_PROMPT_CHANNEL_EXIST'),
                        })
                    } else if (errorCode == ErrorCode.USER_ERROR_OVER_LIMIT) {
                        openMessageTipBox({
                            type: 'info',
                            message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                        }).then(() => {
                            router.push('list')
                        })
                    } else if (errorCode == ErrorCode.USER_ERROR_OVER_BANDWIDTH_LIMIT) {
                        openMessageTipBox({
                            type: 'info',
                            message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_BANDWIDTH_LIMIT'),
                        })
                    } else if (errorCode == ErrorCode.USER_ERROR_SPECIAL_CHAR) {
                        const poePort = $('poePort').text()
                        // POE连接冲突提示
                        openMessageTipBox({
                            type: 'info',
                            message: Translate('IDCS_POE_RESOURCE_CONFLICT_TIP').formatForLang(poePort),
                        })
                    } else if (errorCode == ErrorCode.USER_ERROR_LIMITED_PLATFORM_TYPE_MISMATCH) {
                        openMessageTipBox({
                            type: 'info',
                            message: Translate('IDCS_ADD_CHANNEL_FAIL').formatForLang(faceMatchLimitMaxChlNum),
                        })
                    } else if (errorCode == ErrorCode.USER_ERROR_INVALID_IP) {
                        openMessageTipBox({
                            type: 'info',
                            message: Translate('IDCS_PROMPT_IPADDRESS_V6_INVALID'),
                        })
                    } else if (errorCode == ErrorCode.USER_ERROR_PC_LICENSE_MISMATCH) {
                        const msg = Translate('IDCS_ADD_CHANNEL_FAIL').formatForLang(faceMatchLimitMaxChlNum) + Translate('IDCS_REBOOT_DEVICE').formatForLang(Translate('IDCS_KEEP_ADD'))
                        openMessageTipBox({
                            type: 'question',
                            message: msg,
                        }).then(() => {
                            const data = '<content><AISwitch>false</AISwitch></content>'
                            editBasicCfg(data)
                        })
                    } else {
                        openMessageTipBox({
                            type: 'info',
                            message: Translate('IDCS_SAVE_DATA_FAIL'),
                        })
                    }
                }
            })
        }

        const getData = () => {
            mapping.value = {}
            defaultPwdList.value = []
            getDefaultPwd(() => {
                getLanFreeDevs()
                getLanRecorders()
            })
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
            handleRowClick,
            manualAddTypeOptions,
            manufacturerList,
            rowDelClass,
            rowDel,
            cellChange,
            handleRefresh,
            handleActivate,
            activateIpcData,
            activateIPCVisable,
            closeActivateIPCPop,
            handleCancel,
            handleSelectionChange,
            setDefaultPwdPopVisiable,
            handleSetDefaultPwd,
            closeSetDefaultPwdPop,
            handleUpdateMapping,
            editIPCIpPopVisiable,
            openEditIPCIpPop,
            closeEditIPCIpPop,
            quickAddEditRowData,
            mapping,
            save,
            recoderEditItem,
            handleRecorderRowClick,
            handleRecorderRowDbClick,
            toAddRecorderPopVisiable,
            closeToAddRecorderPopVisiable,
            chlCountLimit,
            faceMatchLimitMaxChlNum,
            handleManualAdd,
            setProtocolPopVisiable,
            closeSetProtocolPop,
            nameList,
            multiChlIPCAddRef,
            ChannelAddActivateIPCPop,
            ChannelAddSetDefaultPwdPop,
            ChannelAddEditIPCIpPop,
            ChannelAddToAddRecorderPop,
            ChannelAddSetProtocolPop,
            ChannelAddMultiChlIPCAdd,
        }
    },
})
