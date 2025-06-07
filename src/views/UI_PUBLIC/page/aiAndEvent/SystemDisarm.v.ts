/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-23 10:59:14
 * @Description: 系统撤防
 */
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        const DEFENSE_PARAM_MAPPING: Record<string, string> = {
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
            ipSpeakerSwitch: Translate('IDCS_TRIGGER_ALARM_AUDIO_DEVICE'),
        }

        const formData = ref(new AlarmSystemDisarmFormDto())

        const addTableRef = ref<TableInstance>()
        const cfgTableRef = ref<TableInstance>()
        const popTableRef = ref<TableInstance>()

        // 通道map
        const chlsMap = ref<Record<string, AlaramSystemDisarmChlDto>>({})
        // 传感器map
        const sensorsMap = ref<Record<string, AlaramSystemDisarmChlDto>>({})

        const pageData = ref({
            // 源传感器列表
            sensorSourcelist: [] as AlaramSystemDisarmChlDto[],
            // 当前在线的通道列表
            onlineChlList: [] as string[],
            // 通道和传感器源列表
            chlAndsensorSourceList: [] as AlaramSystemDisarmChlDto[],
            // 撤防联动项通用列表，从后端获取，不包含手动声光报警输出和手动白光报警输出
            defenseParamList: [] as { id: string; value: string }[],
            showAddDialog: false,
            showCfgDialog: false,
            // 打开撤防选择框时选择行的索引
            triggerDialogIndex: 0,
            popoverVisible: false,
            ipSpeakersList: [] as { chlId: string; name: string; ipSpeakerId: string }[],
            originaInputSource: '',
        })

        const tableData = ref<AlarmSystemDisarmDto[]>([])
        const cfgTableData = ref<{ id: string; value: string }[]>([])

        // 获取在线的通道列表
        const getOnlineChlList = async () => {
            const result = await queryOnlineChlList()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                $('content/item').forEach((item) => {
                    pageData.value.onlineChlList.push(item.attr('id'))
                })
            }
        }

        const hasSupportManualAudio = computed(() => {
            return Object.values(chlsMap.value).some((item) => item.supportManualAudio)
        })

        const hasSupportManualWhiteLight = computed(() => {
            return Object.values(chlsMap.value).some((item) => item.supportManualWhiteLight)
        })

        const hasSupportIpSpeaker = computed(() => {
            const ids = Object.keys(chlsMap.value)
            return pageData.value.ipSpeakersList.some((item) => ids.includes(item.chlId))
        })

        // 获取所有的通道
        const getChlListAll = async () => {
            const result = await getChlList({
                requireField: ['protocolType', 'supportManualAudioAlarmOut', 'supportManualWhiteLightAlarmOut'],
            })
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const chlId = item.attr('id')
                    const chlName = $item('name').text()
                    const supportManualAudio = $item('supportManualAudioAlarmOut').text().bool()
                    const supportManualWhiteLight = $item('supportManualWhiteLightAlarmOut').text().bool()

                    chlsMap.value[chlId] = {
                        id: chlId,
                        name: chlName,
                        nodeType: 'channel',
                        supportManualAudio: supportManualAudio,
                        supportManualWhiteLight: supportManualWhiteLight,
                    }

                    // 过滤不在线通道
                    if (pageData.value.onlineChlList.includes(chlId)) {
                        pageData.value.chlAndsensorSourceList.push({ ...chlsMap.value[chlId] })
                    }
                })
            }
        }

        // 获取传感器源列表
        const getSensorSourceList = async () => {
            const result = await getChlList({
                nodeType: 'sensors',
            })
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const devId = $item('devID').text()
                    const devDesc = $item('devDesc').text()
                    const name = (devDesc ? devDesc + '_' : '') + $item('name').text()
                    const sensorId = item.attr('id')

                    sensorsMap.value[sensorId] = {
                        id: sensorId,
                        name: name,
                        nodeType: 'sensor',
                        supportManualAudio: false,
                        supportManualWhiteLight: false,
                    }

                    // BA-3507 报警输入源包括：本地、虚拟、通道、报警盒子；
                    pageData.value.sensorSourcelist.push({ ...sensorsMap.value[sensorId] })

                    if (devId) {
                        if (pageData.value.onlineChlList.includes(devId)) {
                            pageData.value.chlAndsensorSourceList.push({ ...sensorsMap.value[sensorId] })
                        }
                    } else {
                        pageData.value.chlAndsensorSourceList.push({ ...sensorsMap.value[sensorId] })
                    }
                })
            }
        }

        const getData = async () => {
            const result = await querySystemDisArmParam()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                formData.value.defenseSwitch = $('content/defenseSwitch').text().bool()
                formData.value.remoteSwitch = $('content/remoteSwitch').text().bool()
                formData.value.sensorSwitch = $('content/sensorSwitch').text().bool()
                formData.value.autoResetSwitch = $('content/autoReset/switch').text().bool()
                formData.value.resetTime = $('content/autoReset/resetTime').text()
                formData.value.inputSource = $('content/inputSourceSensor').text()
                formData.value.inputSource =
                    formData.value.inputSource && formData.value.inputSource !== DEFAULT_EMPTY_ID
                        ? formData.value.inputSource
                        : pageData.value.sensorSourcelist[0]
                          ? pageData.value.sensorSourcelist[0].id
                          : ''
                pageData.value.originaInputSource = formData.value.inputSource
                pageData.value.defenseParamList = $('types/defenseType/enum')
                    .map((item) => {
                        const defenseType = item.text()
                        return {
                            id: defenseType,
                            value: DEFENSE_PARAM_MAPPING[defenseType],
                        }
                    })
                    .filter((item) => !['nodeAudioSwitch', 'nodeLightSwitch', 'ipSpeakerSwitch'].includes(item.id))

                tableData.value = $('content/defenseSwitchParam/item').map((item) => {
                    const $item = queryXml(item.element)
                    const chlId = item.attr('id')
                    const nodeType = $item('nodeType').text()

                    return {
                        id: chlId,
                        chlName: nodeType === 'channel' ? chlsMap.value[chlId].name || '' : sensorsMap.value[chlId].name || '',
                        disarmItemsList: $item('defenseAttrs/item').map((item) => {
                            return {
                                id: item.text(),
                                value: DEFENSE_PARAM_MAPPING[item.text()],
                            }
                        }),
                        nodeType,
                        disarmItems: getIpcDefenseParamList(nodeType, chlId),
                    }
                })
            }
        }

        const getSaveData = () => {
            const sendXml = rawXml`
                <types>
                    <defenseType>
                        ${totalDefenseParamList.value.map((item) => `<enum>${item.id}</enum>`).join('')}
                    </defenseType>
                    <nodeType>
                        <enum>channel</enum>
                        <enum>sensor</enum>
                    </nodeType>
                </types>
                <content>
                    <defenseSwitch>${formData.value.defenseSwitch}</defenseSwitch>
                    <remoteSwitch>${formData.value.remoteSwitch}</remoteSwitch>
                    <sensorSwitch>${formData.value.sensorSwitch}</sensorSwitch>
                    <inputSourceSensor>${formData.value.inputSource || pageData.value.originaInputSource}</inputSourceSensor>
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
                    <autoReset>
                        <switch>${formData.value.autoResetSwitch}</switch>
                        <resetTime>${formData.value.resetTime}</resetTime>
                    </autoReset>
                </content>
            `

            return sendXml
        }

        const setData = async () => {
            openLoading()

            const sendXml = getSaveData()
            const result = await editSystemDisArmParam(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
                pageData.value.originaInputSource = formData.value.inputSource
            } else {
                const errorCode = $('errorcode').text().num()
                if (errorCode === ErrorCode.USER_ERROR_NO_AUTH) {
                    openMessageBox(Translate('IDCS_DISARM_SAVE_INVALID'))
                }
            }
        }

        const getSupportManualAudio = (nodeType: string, chlId: string) => {
            if (nodeType === 'channel') {
                return chlsMap.value[chlId].supportManualAudio || false
            } else {
                return sensorsMap.value[chlId].supportManualAudio || false
            }
        }

        const getSupportManualWhiteLight = (nodeType: string, chlId: string) => {
            if (nodeType === 'channel') {
                return chlsMap.value[chlId].supportManualWhiteLight || false
            } else {
                return sensorsMap.value[chlId].supportManualWhiteLight || false
            }
        }

        const getSupportIpSpeaker = (chlId: string) => {
            return pageData.value.ipSpeakersList.some((item) => item.chlId === chlId)
        }

        // 获取单个通道或传感器的撤防联动项列表
        const getIpcDefenseParamList = (nodeType: string, chlId: string) => {
            const ipcDefenseParamList = cloneDeep(pageData.value.defenseParamList)

            if (getSupportManualAudio(nodeType, chlId)) {
                ipcDefenseParamList.push({
                    id: 'nodeAudioSwitch',
                    value: DEFENSE_PARAM_MAPPING.nodeAudioSwitch,
                })
            }

            if (getSupportManualWhiteLight(nodeType, chlId)) {
                ipcDefenseParamList.push({
                    id: 'nodeLightSwitch',
                    value: DEFENSE_PARAM_MAPPING.nodeLightSwitch,
                })
            }

            if (getSupportIpSpeaker(chlId)) {
                ipcDefenseParamList.push({
                    id: 'ipSpeakerSwitch',
                    value: DEFENSE_PARAM_MAPPING.ipSpeakerSwitch,
                })
            }

            return ipcDefenseParamList
        }

        // 总的撤防联动项列表
        const totalDefenseParamList = computed(() => {
            const totalDefenseParamList = cloneDeep(pageData.value.defenseParamList)
            if (hasSupportManualAudio.value) {
                totalDefenseParamList.push({
                    id: 'nodeAudioSwitch',
                    value: DEFENSE_PARAM_MAPPING.nodeAudioSwitch,
                })
            }

            if (hasSupportManualWhiteLight.value) {
                totalDefenseParamList.push({
                    id: 'nodeLightSwitch',
                    value: DEFENSE_PARAM_MAPPING.nodeLightSwitch,
                })
            }

            if (hasSupportIpSpeaker.value) {
                totalDefenseParamList.push({
                    id: 'ipSpeakerSwitch',
                    value: DEFENSE_PARAM_MAPPING.ipSpeakerSwitch,
                })
            }

            return totalDefenseParamList
        })

        const filterChlsSourceList = computed<AlaramSystemDisarmChlDto[]>(() => {
            const added = tableData.value.map((item) => item.id)
            return pageData.value.chlAndsensorSourceList.filter((item) => !added.includes(item.id))
        })

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
                    })
                } else {
                    setData()
                }
            } else {
                setData()
            }
        }

        // 一键撤防或一键布放
        const setDisarmAll = () => {
            if (!formData.value.defenseSwitch) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_CLOSE_GUARD_QUESTION_TIP'),
                }).then(() => {
                    formData.value.defenseSwitch = true
                })
            } else {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_RECOVER_GUARD_QUESTION_TIP'),
                }).then(() => {
                    formData.value.defenseSwitch = false
                })
            }
        }

        // 添加通道或传感器
        const addItem = () => {
            const selection = addTableRef.value!.getSelectionRows() as AlaramSystemDisarmChlDto[]
            if (selection.length) {
                selection.forEach((item) => {
                    const row = new AlarmSystemDisarmDto()
                    const ipcDefenseParamList = getIpcDefenseParamList(item.nodeType, item.id)
                    row.id = item.id
                    row.chlName = item.nodeType === 'channel' ? chlsMap.value[item.id].name || '' : sensorsMap.value[item.id].name || ''
                    row.nodeType = item.nodeType
                    row.disarmItemsList = pageData.value.defenseParamList
                    row.disarmItems = ipcDefenseParamList
                    if (getSupportIpSpeaker(row.id)) {
                        row.disarmItems.push({
                            id: 'ipSpeakerSwitch',
                            value: DEFENSE_PARAM_MAPPING.ipSpeakerSwitch,
                        })
                    }
                    tableData.value.push(row)
                })
            }
            pageData.value.showAddDialog = false
        }

        // 打开撤防联动项配置框
        const disarmCfg = (index: number) => {
            pageData.value.triggerDialogIndex = index
            cfgTableData.value = tableData.value[pageData.value.triggerDialogIndex].disarmItems
            pageData.value.triggerDialogIndex = index
            pageData.value.showCfgDialog = true
        }

        const openCfgDialog = () => {
            cfgTableData.value.forEach((item) => {
                const selected = tableData.value[pageData.value.triggerDialogIndex].disarmItemsList.some((dItem) => dItem.id === item.id)
                cfgTableRef.value!.toggleRowSelection(item, selected)
            })
        }

        // 点击确定按钮，单个保存撤防联动项配置
        const cfgItem = () => {
            const rowData = tableData.value[pageData.value.triggerDialogIndex]
            rowData.disarmItemsList = cfgTableRef.value!.getSelectionRows()
            pageData.value.showCfgDialog = false
        }

        // 点击按钮，保存所有撤防联动项配置
        const disarmCfgAll = () => {
            const selection = popTableRef.value!.getSelectionRows() as { id: string; value: string }[]
            tableData.value.forEach((item) => {
                item.disarmItemsList = selection.filter((ele) => {
                    return item.disarmItems.some((ele2) => {
                        return ele.id === ele2.id
                    })
                })
            })
            pageData.value.popoverVisible = false
        }

        /**
         * @description 撤防联动项文本显示
         * @param {AlarmSystemDisarmDto} item
         * @returns {string}
         */
        const displayDisarmItems = (item: AlarmSystemDisarmDto) => {
            if (!item.disarmItemsList.length) {
                return Translate('IDCS_NULL')
            }

            if (item.disarmItemsList.length === item.disarmItems.length) {
                return Translate('IDCS_FULL')
            }

            return item.disarmItemsList.map((item) => DEFENSE_PARAM_MAPPING[item.id]).join(', ')
        }

        // 删除单个撤防项
        const deleteItem = (row: AlarmSystemDisarmDto) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(() => {
                tableData.value.forEach((item) => {
                    if (item.id === row.id) {
                        tableData.value.splice(tableData.value.indexOf(item), 1)
                    }
                })
            })
        }

        // 删除所有撤防项
        const deleteItemAll = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_ALL_ITEMS'),
            }).then(() => {
                tableData.value = []
            })
        }

        /**
         * 获取已添加ipspeaker列表
         */
        const getVoiceDevList = async () => {
            const result = await getChlList({
                nodeType: 'voices',
            })
            const $ = await commLoadResponseHandler(result)
            pageData.value.ipSpeakersList = []

            const ids = $('content/item').map((item) => item.attr('id'))
            for (const id of ids) {
                await getVoiceDev(id)
            }
        }

        /**
         * 获取ipspeaker详情
         * @param {*} data
         */
        const getVoiceDev = async (ipSpeakerId: string) => {
            const sendXML = rawXml`
                <condition>
                    <alarmInId>${ipSpeakerId}</alarmInId>
                </condition>
            `
            const result = await queryVoiceDev(sendXML)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                const associatedChlId = $('content/associatedType').attr('id') // 关联ipSpeaker的通道id
                const name = $('content/name').text() // ipSpeaker的名称

                pageData.value.ipSpeakersList.push({
                    chlId: associatedChlId,
                    name: name,
                    ipSpeakerId: ipSpeakerId,
                })
            }
        }

        onMounted(async () => {
            openLoading()
            await getVoiceDevList()
            await getOnlineChlList()
            await getChlListAll()
            await getSensorSourceList()
            await getData()
            closeLoading()
        })

        return {
            formData,
            pageData,
            tableData,
            openCfgDialog,
            addTableRef,
            cfgTableRef,
            popTableRef,
            cfgTableData,
            filterChlsSourceList,
            setDisarmAll,
            addItem,
            disarmCfg,
            cfgItem,
            disarmCfgAll,
            deleteItem,
            deleteItemAll,
            filterConfiguredDefParaList,
            displayDisarmItems,
            totalDefenseParamList,
        }
    },
})
