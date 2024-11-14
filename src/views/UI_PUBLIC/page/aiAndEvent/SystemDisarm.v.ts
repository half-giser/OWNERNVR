/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-23 10:59:14
 * @Description: 系统撤防
 */
import { AlarmSystemDisarmDto } from '@/types/apiType/aiAndEvent'
import { cloneDeep } from 'lodash-es'
export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        // const systemCaps = useCababilityStore()
        const openMessageBox = useMessageBox().openMessageBox
        const { openLoading, closeLoading } = useLoading()

        const defenseParamMap: Record<string, string> = {
            sysRec: Translate('IDCS_RECORD'),
            alarmOut: Translate('IDCS_ALARM_OUT'),
            preset: Translate('IDCS_PRESET'),
            msgPushSwitch: Translate('IDCS_PUSH'),
            snapSwitch: Translate('IDCS_SNAP'),
            buzzerSwitch: Translate('IDCS_BUZZER'),
            popVideoSwitch: Translate('IDCS_VIDEO_POPUP'),
            emailSwitch: Translate('IDCS_EMAIL'),
            popMsgSwitch: Translate('IDCS_MESSAGEBOX_POPUP'),
            sysAudio: Translate('IDCS_VOICE_PROMPT'),
            nodeAudioSwitch: 'IPC_' + Translate('IDCS_AUDIO'),
            nodeLightSwitch: 'IPC_' + Translate('IDCS_LIGHT'),
        }

        const formData = ref({
            sensorSwitch: false,
            inputSource: '',
        })

        const pageData = ref({
            // 通道map
            chlsMap: {} as Record<string, { id: string; name: string; chlType: string; supportManualAudio: boolean; supportManualWhiteLight: boolean }>,
            // 传感器map
            sensorsMap: {} as Record<string, { id: string; name: string; supportManualAudio: boolean; supportManualWhiteLight: boolean }>,
            // 源传感器列表
            sensorSourcelist: [] as { id: string; value: string; supportManualAudio: boolean; supportManualWhiteLight: boolean }[],
            // 当前在线的通道列表
            onlineChlList: [] as string[],
            // 通道和传感器源列表
            chlAndsensorSourceList: [] as { id: string; value: string; nodeType: string; supportManualAudio: boolean; supportManualWhiteLight: boolean }[],
            // 撤防联动项通用列表，从后端获取，不包含手动声光报警输出和手动白光报警输出
            defenseParamList: [] as { id: string; value: string }[],
            // 添加撤防通道或传感器时的可选列表
            filterChlsSourceList: [] as { id: string; value: string; nodeType: string; supportManualAudio: boolean; supportManualWhiteLight: boolean }[],
            // 添加撤防通道或传感器时的已选择列表
            selectedChlsSourceList: [] as { id: string; value: string; nodeType: string; supportManualAudio: boolean; supportManualWhiteLight: boolean }[],
            // 撤防联动项配置框中的已选择列表
            selectedCfgList: [] as { id: string; value: string }[],
            // 总的撤防联动项列表
            totalDefenseParamList: [] as { id: string; value: string }[],

            hasSupportManualAudioChl: false,
            hasSupportManualWhiteLightChl: false,

            defenseSwitch: false,
            remoteSwitch: false,
            applyDisable: true,

            showAddDialog: false,
            showCfgDialog: false,
            // 打开撤防选择框时选择行的索引
            triggerDialogIndex: 0,
            // 撤防选择是否全选
            isSelectAll: false,
            addDialogTitle: Translate('IDCS_CHANNEL') + '/' + Translate('IDCS_SENSOR'),
            popoverVisible: false,
        })

        const tableData = ref([] as AlarmSystemDisarmDto[])
        const cfgTableData = ref([] as { id: string; value: string; selected: boolean }[])

        // 获取在线的通道列表
        const getOnlineChlList = async () => {
            const onlineChls = await queryOnlineChlList()
            const res = queryXml(onlineChls)
            if (res('status').text() === 'success') {
                res('//content/item').forEach((item) => {
                    pageData.value.onlineChlList.push(item.attr('id')!)
                })
            }
        }

        // 获取所有的通道
        const getChlListAll = async () => {
            const chllist = await getChlList({
                requireField: ['protocolType', 'supportManualAudioAlarmOut', 'supportManualWhiteLightAlarmOut'],
            })
            const res = queryXml(chllist)
            if (res('status').text() === 'success') {
                res('//content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const chlId = item.attr('id')!
                    const chlName = $item('name').text()
                    const chlType = $item('chlType').text()
                    const supportManualAudio = $item('supportManualAudioAlarmOut').text().bool()
                    const supportManualWhiteLight = $item('supportManualWhiteLightAlarmOut').text().bool()
                    pageData.value.chlsMap[chlId] = {
                        id: chlId,
                        name: chlName,
                        chlType: chlType,
                        supportManualAudio: supportManualAudio,
                        supportManualWhiteLight: supportManualWhiteLight,
                    }
                    pageData.value.onlineChlList.forEach((id: string) => {
                        // 过滤不在线通道
                        if (chlId === id) {
                            pageData.value.chlAndsensorSourceList.push({
                                id: chlId,
                                value: chlName,
                                nodeType: 'channel',
                                supportManualAudio: supportManualAudio,
                                supportManualWhiteLight: supportManualWhiteLight,
                            })
                        }
                    })
                    if (supportManualAudio) pageData.value.hasSupportManualAudioChl = true
                    if (supportManualWhiteLight) pageData.value.hasSupportManualWhiteLightChl = true
                })
            }
        }

        // 获取传感器源列表
        const getSensorSourceList = async () => {
            const chllist = await getChlList({
                nodeType: 'sensors',
            })
            const res = queryXml(chllist)
            if (res('status').text() === 'success') {
                let virtualMaxIdx = Number.POSITIVE_INFINITY // alarmInType==virtual节点的最大index
                res('//content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    let name = $item('name').text()
                    const devId = $item('devID').text()
                    const devDesc = $item('devDesc').text()
                    const sensorId = item.attr('id')
                    const alarmInType = item.attr('alarmInType')
                    const alarmIndex = item.attr('index').num()
                    if (devDesc) {
                        name = devDesc + '_' + name
                    }
                    pageData.value.sensorsMap[sensorId] = {
                        id: sensorId,
                        name: name,
                        supportManualAudio: false,
                        supportManualWhiteLight: false,
                    }
                    if (alarmInType === 'virtual') {
                        virtualMaxIdx = alarmIndex
                    }

                    if (alarmInType !== 'ipc' && alarmIndex <= virtualMaxIdx) {
                        // 过滤掉IPC和报警盒子(index大于alarmInType==virtual节点的最大index并且不是IPC的就是报警盒子)
                        pageData.value.sensorSourcelist.push({
                            id: sensorId,
                            value: name,
                            supportManualAudio: false,
                            supportManualWhiteLight: false,
                        })
                    }

                    if (devId) {
                        pageData.value.onlineChlList.forEach((chlId) => {
                            if (chlId === devId) {
                                pageData.value.chlAndsensorSourceList.push({
                                    id: sensorId,
                                    value: name,
                                    nodeType: 'sensor',
                                    supportManualAudio: false,
                                    supportManualWhiteLight: false,
                                })
                            }
                        })
                    } else {
                        pageData.value.chlAndsensorSourceList.push({
                            id: sensorId,
                            value: name,
                            nodeType: 'sensor',
                            supportManualAudio: false,
                            supportManualWhiteLight: false,
                        })
                    }
                })
            }
        }

        const buildData = () => {
            querySystemDisArmParam().then(async (resb) => {
                const res = queryXml(resb)
                if (res('status').text() === 'success') {
                    pageData.value.defenseSwitch = res('//content/defenseSwitch').text().bool()
                    pageData.value.remoteSwitch = res('//content/remoteSwitch').text().bool()
                    formData.value.sensorSwitch = res('//content/sensorSwitch').text().bool()
                    formData.value.inputSource = res('//content/inputSourceSensor').text()
                    formData.value.inputSource =
                        formData.value.inputSource && formData.value.inputSource !== DEFAULT_EMPTY_ID
                            ? formData.value.inputSource
                            : pageData.value.sensorSourcelist[0]
                              ? pageData.value.sensorSourcelist[0].id
                              : ''
                    pageData.value.defenseParamList = []
                    res('//types/defenseType/enum').forEach((item) => {
                        const defenseType = item.text()
                        if (defenseType !== 'nodeAudioSwitch' && defenseType !== 'nodeLightSwitch') {
                            pageData.value.defenseParamList.push({
                                id: defenseType,
                                value: defenseParamMap[defenseType],
                            })
                        }
                    })
                    pageData.value.totalDefenseParamList = getTotalDefenseParamList(pageData.value.hasSupportManualAudioChl, pageData.value.hasSupportManualWhiteLightChl)
                    res('//content/defenseSwitchParam/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const row = new AlarmSystemDisarmDto()
                        const chlId = item.attr('id')!
                        const nodeType = $item('nodeType').text()
                        // 撤防联动项
                        let disarmItemsStr = ''
                        const disarmItemsList = [] as { id: string; value: string }[]
                        $item('defenseAttrs/item').forEach((item, idx) => {
                            const splicer = idx < $item('defenseAttrs/item').length - 1 ? ', ' : ''
                            disarmItemsStr += defenseParamMap[item.text()] + splicer
                            disarmItemsList.push({
                                id: item.text(),
                                value: defenseParamMap[item.text()],
                            })
                        })
                        // 获取当前通道所支持的撤防联动项列表: ipcDefenseParamList
                        const supportManualAudio = getCapabilityFieldRes(nodeType, chlId, 'supportManualAudioAlarmOut')
                        const supportManualWhiteLight = getCapabilityFieldRes(nodeType, chlId, 'supportManualWhiteLightAlarmOut')
                        const ipcDefenseParamList = getIpcDefenseParamList(supportManualAudio, supportManualWhiteLight)
                        if (ipcDefenseParamList.length === disarmItemsList.length) {
                            disarmItemsStr = Translate('IDCS_FULL')
                        }

                        if (disarmItemsList.length === 0) {
                            disarmItemsStr = Translate('IDCS_NULL')
                        }
                        row.id = chlId
                        row.chlName =
                            nodeType === 'channel'
                                ? pageData.value.chlsMap[chlId]
                                    ? pageData.value.chlsMap[chlId].name
                                    : ''
                                : pageData.value.sensorsMap[chlId]
                                  ? pageData.value.sensorsMap[chlId].name
                                  : ''
                        row.disarmItemsStr = disarmItemsStr
                        row.disarmItemsList = disarmItemsList
                        row.disarmItems = ipcDefenseParamList
                        row.nodeType = nodeType
                        tableData.value.push(row)
                    })
                    filterChlsSource()
                }
            })
        }

        const getSaveData = () => {
            const sendXml = rawXml`
                <types>
                    <defenseType>
                        ${pageData.value.totalDefenseParamList.map((item) => `<enum>${item.id}</enum>`).join('')}
                    </defenseType>
                    <nodeType>
                        <enum>channel</enum>
                        <enum>sensor</enum>
                    </nodeType>
                </types>
                <content>
                    <defenseSwitch>${pageData.value.defenseSwitch}</defenseSwitch>
                    <remoteSwitch>${pageData.value.remoteSwitch}</remoteSwitch>
                    <sensorSwitch>${formData.value.sensorSwitch}</sensorSwitch>
                    <inputSourceSensor>${formData.value.inputSource}</inputSourceSensor>
                    <defenseSwitchParam type="list">
                        ${tableData.value
                            .map((item) => {
                                return rawXml`
                                    <item id="${item.id}">
                                        <nodeType type="nodeType">${item.nodeType}</nodeType>
                                        <defenseAttrs type="list">
                                            ${item.disarmItemsList.map((ele) => `<item>${ele.id}</item>`).join('')}
                                        </defenseAttrs>
                                    </item>
                                `
                            })
                            .join('')}
                    </defenseSwitchParam>
                </content>
            `

            return sendXml
        }

        const setData = () => {
            const sendXml = getSaveData()
            openLoading()
            editSystemDisArmParam(sendXml).then((resb) => {
                closeLoading()
                const res = queryXml(resb)
                if (res('status').text() === 'success') {
                    openMessageBox({
                        type: 'success',
                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                    })
                } else {
                    const errorCode = res('errorcode').text().num()
                    if (errorCode === ErrorCode.USER_ERROR_NO_AUTH) {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_DISARM_SAVE_INVALID'),
                        })
                    }
                }
            })
            pageData.value.applyDisable = true
        }

        // 获取该通道或传感器的能力，是否支持手动声光报警输出或者手动白光报警输出，后续用于判断是否显示手动声光报警输出或者手动白光报警输出
        const getCapabilityFieldRes = (nodeType: string, chlId: string, capField: string) => {
            let supportManualAudio = false
            let supportManualWhiteLight = false
            if (nodeType === 'channel') {
                supportManualAudio = pageData.value.chlsMap[chlId] ? pageData.value.chlsMap[chlId].supportManualAudio : false
                supportManualWhiteLight = pageData.value.chlsMap[chlId] ? pageData.value.chlsMap[chlId].supportManualWhiteLight : false
            } else {
                supportManualAudio = pageData.value.sensorsMap[chlId] ? pageData.value.sensorsMap[chlId].supportManualAudio : false
                supportManualWhiteLight = pageData.value.sensorsMap[chlId] ? pageData.value.sensorsMap[chlId].supportManualWhiteLight : false
            }
            return capField === 'supportManualAudioAlarmOut' ? supportManualAudio : supportManualWhiteLight
        }

        // 获取单个通道或传感器的撤防联动项列表
        const getIpcDefenseParamList = (supportManualAudio: boolean, supportManualWhiteLight: boolean) => {
            const ipcDefenseParamList = cloneDeep(pageData.value.defenseParamList)
            if (supportManualAudio) {
                ipcDefenseParamList.push({
                    id: 'nodeAudioSwitch',
                    value: defenseParamMap.nodeAudioSwitch,
                })
            }

            if (supportManualWhiteLight) {
                ipcDefenseParamList.push({
                    id: 'nodeLightSwitch',
                    value: defenseParamMap.nodeLightSwitch,
                })
            }
            return ipcDefenseParamList
        }

        // 获取所有的撤防联动项列表，用于保存时生成sendXml
        const getTotalDefenseParamList = (hasSupportManualAudioChl: boolean, hasSupportManualWhiteLightChl: boolean) => {
            const totalDefenseParamList = cloneDeep(pageData.value.defenseParamList)
            if (hasSupportManualAudioChl) {
                totalDefenseParamList.push({
                    id: 'nodeAudioSwitch',
                    value: defenseParamMap.nodeAudioSwitch,
                })
            }

            if (hasSupportManualWhiteLightChl) {
                totalDefenseParamList.push({
                    id: 'nodeLightSwitch',
                    value: defenseParamMap.nodeLightSwitch,
                })
            }
            return totalDefenseParamList
        }

        // 重新获取可添加的通道列表
        const filterChlsSource = () => {
            pageData.value.filterChlsSourceList = cloneDeep(pageData.value.chlAndsensorSourceList)
            for (let i = 0; i < tableData.value.length; i++) {
                for (let j = 0; j < pageData.value.filterChlsSourceList.length; j++) {
                    if (pageData.value.filterChlsSourceList[j] && pageData.value.filterChlsSourceList[j].id === tableData.value[i].id) {
                        pageData.value.filterChlsSourceList.splice(j, 1)
                    }
                }
            }
        }

        // 撤防项包含当前选择的传感器源时，应用时必须删除。
        const filterConfiguredDefParaList = () => {
            if (formData.value.sensorSwitch) {
                let flagIdx = -1
                let sensorName = ''
                for (let i = 0; i < tableData.value.length; i++) {
                    if (tableData.value[i] && tableData.value[i].id === formData.value.inputSource) {
                        flagIdx = i
                        sensorName = tableData.value[i].chlName
                        break
                    }
                }

                if (flagIdx >= 0) {
                    openMessageBox({
                        type: 'question',
                        message: Translate('IDCS_DISARM_INPUT_SENSOR_TIP').formatForLang(sensorName),
                    }).then(() => {
                        tableData.value.splice(flagIdx, 1)
                        setData()
                        filterChlsSource()
                    })
                } else {
                    setData()
                }
            } else {
                setData()
            }
        }

        // 一键撤防或一键布放
        const setdisarmAll = () => {
            if (!pageData.value.defenseSwitch) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_CLOSE_GUARD_QUESTION_TIP'),
                }).then(() => {
                    pageData.value.defenseSwitch = true
                })
            } else {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_RECOVER_GUARD_QUESTION_TIP'),
                }).then(() => {
                    pageData.value.defenseSwitch = false
                })
            }
        }

        // 添加通道或传感器
        const addItem = () => {
            if (pageData.value.selectedChlsSourceList.length > 0) {
                pageData.value.selectedChlsSourceList.forEach((item: { id: string; value: string; nodeType: string; supportManualAudio: boolean; supportManualWhiteLight: boolean }) => {
                    const row = new AlarmSystemDisarmDto()
                    const ipcDefenseParamList = getIpcDefenseParamList(item.supportManualAudio, item.supportManualWhiteLight)
                    let disarmItemsStr = ''
                    if (ipcDefenseParamList.length === pageData.value.defenseParamList.length) {
                        disarmItemsStr = Translate('IDCS_FULL')
                    } else {
                        pageData.value.defenseParamList.forEach((ele: { id: string; value: string }, idx: number) => {
                            const splicer = idx < pageData.value.defenseParamList.length - 1 ? ', ' : ''
                            disarmItemsStr += defenseParamMap[ele.id] + splicer
                        })
                    }
                    row.id = item.id
                    row.chlName =
                        item.nodeType === 'channel'
                            ? pageData.value.chlsMap[item.id]
                                ? pageData.value.chlsMap[item.id].name
                                : ''
                            : pageData.value.sensorsMap[item.id]
                              ? pageData.value.sensorsMap[item.id].name
                              : ''
                    row.nodeType = item.nodeType
                    row.disarmItemsList = pageData.value.defenseParamList
                    row.disarmItemsStr = disarmItemsStr
                    row.disarmItems = ipcDefenseParamList
                    tableData.value.push(row)
                })
            }
            pageData.value.showAddDialog = false
            filterChlsSource()
            pageData.value.applyDisable = false
        }

        // 打开撤防联动项配置框
        const disarmCfg = (index: number) => {
            cfgTableData.value = []
            pageData.value.triggerDialogIndex = index
            pageData.value.selectedCfgList = []
            cfgTableData.value = []
            tableData.value[pageData.value.triggerDialogIndex].disarmItems.forEach((item: { id: string; value: string }) => {
                const selected = tableData.value[pageData.value.triggerDialogIndex].disarmItemsList.some((ele: { id: string; value: string }) => {
                    return ele.id === item.id
                })
                if (selected) {
                    pageData.value.selectedCfgList.push(item)
                }
                cfgTableData.value.push({
                    id: item.id,
                    value: item.value,
                    selected: selected,
                })
            })
            pageData.value.isSelectAll = cfgTableData.value.length === pageData.value.selectedCfgList.length
            pageData.value.showCfgDialog = true
        }

        // 点击确定按钮，单个保存撤防联动项配置
        const cfgItem = () => {
            tableData.value[pageData.value.triggerDialogIndex].disarmItemsList = pageData.value.selectedCfgList
            tableData.value[pageData.value.triggerDialogIndex].disarmItemsStr = ''
            tableData.value[pageData.value.triggerDialogIndex].disarmItemsList.forEach((item, idx) => {
                const splicer = idx < tableData.value[pageData.value.triggerDialogIndex].disarmItemsList.length - 1 ? ', ' : ''
                tableData.value[pageData.value.triggerDialogIndex].disarmItemsStr += defenseParamMap[item.id] + splicer
            })
            if (tableData.value[pageData.value.triggerDialogIndex].disarmItemsList.length === tableData.value[pageData.value.triggerDialogIndex].disarmItems.length) {
                tableData.value[pageData.value.triggerDialogIndex].disarmItemsStr = Translate('IDCS_FULL')
            }

            if (!tableData.value[pageData.value.triggerDialogIndex].disarmItemsList.length) {
                tableData.value[pageData.value.triggerDialogIndex].disarmItemsStr = Translate('IDCS_NULL')
            }
            pageData.value.showCfgDialog = false
            pageData.value.applyDisable = false
        }

        // 点击按钮，保存所有撤防联动项配置
        const disarmCfgAll = () => {
            tableData.value.forEach((item: AlarmSystemDisarmDto) => {
                item.disarmItemsList = pageData.value.selectedCfgList.filter((ele: { id: string; value: string }) => {
                    return item.disarmItems.some((ele2: { id: string; value: string }) => {
                        return ele.id === ele2.id
                    })
                })
                item.disarmItemsStr = ''
                item.disarmItemsList.forEach((ele: { id: string; value: string }, idx: number) => {
                    const splicer = idx < item.disarmItemsList.length - 1 ? ', ' : ''
                    item.disarmItemsStr += defenseParamMap[ele.id] + splicer
                })
                if (item.disarmItemsList.length === item.disarmItems.length) {
                    item.disarmItemsStr = Translate('IDCS_FULL')
                }

                if (!item.disarmItemsList.length) {
                    item.disarmItemsStr = Translate('IDCS_NULL')
                }
            })
            pageData.value.popoverVisible = false
            pageData.value.applyDisable = false
        }

        // 删除单个撤防项
        const deleteItem = (row: AlarmSystemDisarmDto) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(() => {
                tableData.value.forEach((item: AlarmSystemDisarmDto) => {
                    if (item.id === row.id) {
                        tableData.value.splice(tableData.value.indexOf(item), 1)
                    }
                })
            })
            filterChlsSource()
            pageData.value.applyDisable = false
        }

        // 删除所有撤防项
        const deleteItemAll = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_ALL_ITEMS'),
            }).then(() => {
                tableData.value = []
                pageData.value.filterChlsSourceList = pageData.value.chlAndsensorSourceList
            })
            // filterChlsSource()
            pageData.value.applyDisable = false
        }

        // 撤防联动项选择框中选择通道或传感器
        const handleSelectedAdd = (rows: { id: string; value: string; nodeType: string; supportManualAudio: boolean; supportManualWhiteLight: boolean }[]) => {
            pageData.value.selectedChlsSourceList = rows
        }

        // 下拉菜单选择撤防联动项
        const handleSelectedDropDown = (rows: { id: string; value: string }[]) => {
            pageData.value.selectedCfgList = rows
        }

        // 撤防联动项配置框中全选或全不选
        const handleSelectCfgAll = () => {
            if (!pageData.value.isSelectAll) {
                pageData.value.selectedCfgList = []
                cfgTableData.value.forEach((item) => {
                    item.selected = false
                })
            } else {
                pageData.value.selectedCfgList = cfgTableData.value
                cfgTableData.value.forEach((item) => {
                    item.selected = true
                })
            }
        }

        // 撤防联动项配置框中选择单个项
        const handleSelectedCfg = (row: { id: string; value: string; selected: boolean }) => {
            if (row.selected) {
                pageData.value.selectedCfgList.push(row)
            } else {
                pageData.value.selectedCfgList = pageData.value.selectedCfgList.filter((item) => item.id !== row.id)
            }
            pageData.value.isSelectAll = cfgTableData.value.length === pageData.value.selectedCfgList.length
        }

        onMounted(async () => {
            await getOnlineChlList()
            await getChlListAll()
            await getSensorSourceList()
            buildData()
        })

        return {
            formData,
            pageData,
            tableData,
            cfgTableData,
            filterChlsSource,
            setdisarmAll,
            addItem,
            disarmCfg,
            cfgItem,
            disarmCfgAll,
            deleteItem,
            deleteItemAll,
            filterConfiguredDefParaList,
            handleSelectedAdd,
            handleSelectedDropDown,
            handleSelectCfgAll,
            handleSelectedCfg,
        }
    },
})
