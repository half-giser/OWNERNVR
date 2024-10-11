/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 新增通道
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-09 15:33:03
 */
import { trim } from 'lodash-es'
import { ChannelManualAddDto, DefaultPwdDto } from '@/types/apiType/channel'
import { ChannelAddRecorderDto, ChannelQuickAddDto } from '@/types/apiType/channel'
import ChannelAddActivateIPCPop from './ChannelAddActivateIPCPop.vue'
import ChannelAddSetDefaultPwdPop from './ChannelAddSetDefaultPwdPop.vue'
import ChannelAddEditIPCIpPop from './ChannelAddEditIPCIpPop.vue'
import ChannelAddToAddRecorderPop from './ChannelAddToAddRecorderPop.vue'
import ChannelAddSetProtocolPop from './ChannelAddSetProtocolPop.vue'
import ChannelAddMultiChlIPCAdd from './ChannelAddMultiChlIPCAdd.vue'
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
        const multiChlIPCAddRef = ref()

        let rtspMapping = [] as Array<string>
        const tempManualProtocolData = [] as Array<string>

        // 手动添加
        const manualAddTypeKeys = {
            ip: 'ip',
            ipv6: 'ipv6',
            domain: 'domain',
        }
        const manualAddTypeOptions = ref([
            { value: manualAddTypeKeys.ip, text: 'IPv4' },
            { value: manualAddTypeKeys.ipv6, text: 'IPv6' },
            { value: manualAddTypeKeys.domain, text: Translate('IDCS_DOMAIN') },
        ])

        const getSystemCaps = () => {
            openLoading()
            queryRecordDistributeInfo().then((res) => {
                const $ = queryXml(res)
                const mode = $('//content/recMode/mode').text()
                querySystemCaps(getXmlWrapData('')).then((res) => {
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
            queryDevDefaultPwd(getXmlWrapData('')).then((res) => {
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
            queryLanFreeDeviceList(getXmlWrapData('')).then((res) => {
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
                    getProtocolList(() => {
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
                        const rowData = [] as Array<ChannelQuickAddDto>
                        $('//content/item').forEach((ele) => {
                            const eleXml = queryXml(ele.element)
                            const newData = new ChannelQuickAddDto()
                            newData.ip = eleXml('ip').text()
                            newData.port = eleXml('port').text()
                            newData.httpPort = eleXml('httpPort').text() // IPC激活时需要
                            newData.mask = eleXml('mask').text()
                            newData.gateway = eleXml('gateway').text()
                            newData.manufacturer = eleXml('manufacturer').text()
                            newData.poeIndex = eleXml('poeIndex').text()
                            newData.productModel = {
                                factoryName: eleXml('productModel').attr('factoryName'),
                                identity: eleXml('productModel').attr('identity'),
                                innerText: eleXml('productModel').text(),
                            }
                            newData.devName = eleXml('devName').text()
                            newData.version = eleXml('version').text()
                            newData.mac = eleXml('mac').text()
                            newData.industryProductType = eleXml('industryProductType').text()
                            newData.protocolType = eleXml('protocolType').text()
                            newData.activateStatus = eleXml('activateStatus').text()
                            rowData.push(newData)
                        })
                        rowData.sort((ele1: ChannelQuickAddDto, ele2: ChannelQuickAddDto) => {
                            const ipArr1 = ele1['ip'].split('.')
                            const ipArr2 = ele2['ip'].split('.')
                            return Number(ipArr1[0]) > Number(ipArr2[0])
                                ? 1
                                : Number(ipArr1[0]) < Number(ipArr2[0])
                                  ? -1
                                  : Number(ipArr1[1]) > Number(ipArr2[1])
                                    ? 1
                                    : Number(ipArr1[1]) < Number(ipArr2[1])
                                      ? -1
                                      : Number(ipArr1[2]) > Number(ipArr2[2])
                                        ? 1
                                        : Number(ipArr1[2]) < Number(ipArr2[2])
                                          ? -1
                                          : Number(ipArr1[3]) > Number(ipArr2[3])
                                            ? 1
                                            : Number(ipArr1[3]) < Number(ipArr2[3])
                                              ? -1
                                              : 0
                        })
                        rowData.sort((ele1: ChannelQuickAddDto, ele2: ChannelQuickAddDto) => {
                            const activate1 = ele1['activateStatus'] == 'UNACTIVATED' ? 1 : ele1['activateStatus'] == 'UNKNOWN' ? 0 : -1
                            const activate2 = ele2['activateStatus'] == 'UNACTIVATED' ? 1 : ele2['activateStatus'] == 'UNKNOWN' ? 0 : -1
                            return activate2 - activate1
                        })
                        quickAddTableData.value = rowData
                        total.value = rowData.length
                    })
                }
            })
        }

        const getLanRecorders = () => {
            openLoading()
            queryLanRecorderList(getXmlWrapData('')).then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    const rowData = [] as Array<ChannelAddRecorderDto>
                    $('//content/item').forEach((ele) => {
                        const eleXml = queryXml(ele.element)
                        const newData = new ChannelAddRecorderDto()
                        newData.ip = eleXml('ip').text()
                        newData.port = Number(eleXml('port').text())
                        newData.version = eleXml('version').text()
                        newData.name = eleXml('name').text()
                        newData.serialNum = eleXml('serialNum').text()
                        newData.chlTotalCount = Number(eleXml('chlTotalCount').text())
                        newData.httpPort = Number(eleXml('httpPort').text())
                        newData.chlAddedCount = Number(eleXml('chlAddedCount').text())
                        newData.productModel = eleXml('productModel').text()
                        newData.displayName =
                            eleXml('name').text() + (Number(eleXml('chlTotalCount').text()) > 0 ? '(' + eleXml('chlAddedCount').text() + '/' + eleXml('chlTotalCount').text() + ')' : '')
                        rowData.push(newData)
                    })
                    addRecorderTableData.value = rowData
                }
            })
        }

        const getProtocolList = (callBack: Function) => {
            queryRtspProtocolList(getXmlWrapData('')).then((res) => {
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    protocolList.value = []
                    rtspMapping = []
                    $('//content/item').forEach((ele) => {
                        const eleXml = queryXml(ele.element)
                        if (eleXml('enabled').text() == 'true') {
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
                                index: ele.attr('id') as string,
                            })
                        }
                    })
                    if (callBack) callBack()
                }
            })
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
            return index === manualAddFormData.value.length - 1 ? 'disabled' : ''
        }

        const rowDel = (index: number) => {
            if (index === manualAddFormData.value.length - 1) return
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
                let addChlCount = 0
                let data = `<types><manufacturer>`
                for (const key in manufacturerMap.value) {
                    data += `<enum displayName='${manufacturerMap.value[key]}'>${key}</enum>`
                }
                data += rawXml`
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
                        </itemType>`
                if (activeTab.value == tabKeys.quickAdd) {
                    let numName = Number(localStorage.getItem(LocalCacheKey.defaultChlMaxValue))
                    quickAddTableRef.value!.getSelectionRows().forEach((ele: ChannelQuickAddDto) => {
                        // 处理IPC设备名称为空格的情况
                        const devName = ele.devName ? trim(ele.devName) : ''
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
                    })
                    if (addChlCount == 0) {
                        router.push('list')
                        return
                    }
                    data += '</content>'
                    addIPCDev(getXmlWrapData(data))
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
                    multiChlIPCAddRef.value.init(allDatas, mapping.value, manufacturerMap.value, protocolList.value, (sendXml: string) => {
                        addIPCDev(sendXml)
                    })
                }
            })
        }

        const getXmlDataByQuickAdd = (element: ChannelQuickAddDto, supportType: string, chlName: string) => {
            const defaultParam = rawXml`
                <rec per='5' post='10'/>
                    <snapSwitch>true</snapSwitch>
                    <buzzerSwitch>false</buzzerSwitch>
                    <popVideoSwitch>false</popVideoSwitch>
                    <frontEndOffline_popMsgSwitch>false</frontEndOffline_popMsgSwitch>`
            let data = rawXml`
                <item>
                    <name>${chlName}</name>
                    <ip>${element.ip}</ip>
                    <port>${element.port}</port>
                    <userName>${mapping.value[element.manufacturer].userName}</userName>
                    <index>0</index>
                    <manufacturer>${element.manufacturer}</manufacturer>
                    <protocolType>${mapping.value[element.manufacturer].protocolType}</protocolType>`
            if (element.productModel.factoryName) {
                if (element.productModel.identity) {
                    data += `<productModel  factoryName='${element.productModel.identity}'>${element.productModel.innerText}</productModel>`
                } else {
                    data += `<productModel  factoryName='${element.productModel.factoryName}'>${element.productModel.innerText}</productModel>`
                }
            } else {
                data += `<productModel>${element.productModel.innerText}</productModel>`
            }
            if (element.poeIndex) {
                data += `<poeIndex>${element.poeIndex}</poeIndex>`
            }
            const curChlType = supportType == 'THERMAL_DOUBLE' ? 'THERMAL' : 'NORMAL'
            data += `<accessType>${curChlType}</accessType>`
            data += `${defaultParam}</item>`
            return data
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
                            editBasicCfg(getXmlWrapData(data))
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
            supportRecorder,
            formatDisplayManufacturer,
            handleRowClick,
            manualAddTypeKeys,
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
