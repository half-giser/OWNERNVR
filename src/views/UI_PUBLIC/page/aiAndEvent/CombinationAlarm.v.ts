import { type CombinedAlarm, type CombinedAlarmItem, type faceMatchObj, type PresetItem } from '@/types/apiType/aiAndEvent'
import { cloneDeep, isEqual } from 'lodash-es'
import SetPresetPop from './SetPresetPop.vue'
import CombinationAlarmPop from './CombinationAlarmPop.vue'

export default defineComponent({
    components: {
        SetPresetPop,
        CombinationAlarmPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()

        // 名称被修改时保存原始名称
        const originalName = ref('')

        const COMBINED_ALARM_TYPES_MAPPING: Record<string, string> = {
            Motion: Translate('IDCS_MOTION_DETECTION'), //移动侦测
            Sensor: Translate('IDCS_SENSOR'), //传感器
            FaceMatch: Translate('IDCS_FACE_MATCH'), //人脸识别
            InvadeDetect: Translate('IDCS_INVADE_DETECTION'), //区域入侵
            Tripwire: Translate('IDCS_BEYOND_DETECTION'), //越界
        }

        const pageData = ref({
            // 类型
            typeList: getAlwaysOptions(),
            // 启用、推送、蜂鸣器、消息框弹出、email
            switchList: getSwitchOptions(),
            // 持续时间列表
            durationList: [] as SelectOption<string, string>[],
            // 是否支持声音
            supportAudio: false,
            // 声音列表
            audioList: [] as SelectOption<string, string>[],
            // 视频弹出列表
            videoPopupChlList: [] as SelectOption<string, string>[],
            // 应用是否禁用
            applyDisabled: true,

            // 初始化
            totalCount: 0,
            initComplated: false,
            CombinedALarmInfo: '',

            // record穿梭框数据源
            recordList: [] as SelectOption<string, string>[],
            // 表头选中id
            recordChosedIdsAll: [] as string[],
            // 表头选中的数据
            recordChosedListAll: [] as SelectOption<string, string>[],
            recordIsShowAll: false,
            recordIsShow: false,

            // snap穿梭框数据源
            snapList: [] as SelectOption<string, string>[],
            // 表头选中id
            snapChosedIdsAll: [] as string[],
            // 表头选中的数据
            snapChosedListAll: [] as SelectOption<string, string>[],
            snapIsShowAll: false,
            snapIsShow: false,

            // alarmOut穿梭框数据源
            alarmOutList: [] as SelectOption<string, string>[],
            // 表头选中id
            alarmOutChosedIdsAll: [] as string[],
            // 表头选中的数据
            alarmOutChosedListAll: [] as SelectOption<string, string>[],
            alarmOutIsShowAll: false,
            alarmOutIsShow: false,

            // 当前打开dialog行的index
            triggerDialogIndex: 0,

            // 预置点名称配置
            isPresetPopOpen: false,
            presetChlId: '',
            presetLinkedList: [] as PresetItem[],

            isCombinedAlarmPopOpen: false,
            combinedAlarmLinkedId: '',
            combinedAlarmLinkedList: [] as CombinedAlarmItem[],
            currRowFaceObj: {} as Record<string, Record<string, faceMatchObj>>,

            // 人脸对象，层级依次为combinedID，chlID，obj
            faceObj: {} as Record<string, Record<string, Record<string, faceMatchObj>>>,
        })

        // 表格数据
        const tableData = ref<CombinedAlarm[]>([])
        // 缓存表格初始数据，保存时对比变化了的行
        let tableDataInit = [] as CombinedAlarm[]

        // 获取系统配置和基本信息，部分系统配置可用项
        const getSystemCaps = async () => {
            pageData.value.supportAudio = systemCaps.supportAlarmAudioConfig
            if (pageData.value.supportAudio) {
                await getAudioData()
            }
        }

        // 获取声音数据
        const getAudioData = async () => {
            pageData.value.audioList = await buildAudioList()
        }

        const getChlData = async () => {
            getChlList({ requireField: ['protocolType'] }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    // 视频弹出数据
                    pageData.value.videoPopupChlList.push({
                        value: '',
                        label: Translate('IDCS_OFF'),
                    })
                    $('//content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const protocolType = $item('protocolType').text()
                        if (protocolType == 'RTSP') return
                        pageData.value.videoPopupChlList.push({
                            value: item.attr('id')!,
                            label: $item('name').text(),
                        })
                    })
                })
            })
        }

        const getRecordList = async () => {
            pageData.value.recordList = await buildRecordChlList()
        }

        const getSnapList = async () => {
            pageData.value.snapList = await buildSnapChlList()
        }

        const getAlarmOutData = async () => {
            pageData.value.alarmOutList = await buildAlarmOutChlList()
        }

        // 获取人脸库列表
        const getFaceGroupData = async () => {
            const result = await queryFacePersonnalInfoGroupList()
            const $ = queryXml(result)

            return $
        }

        // 获取已配置的人脸库分组
        const getFaceMatchData = async () => {
            const result = await queryCombinedAlarmFaceMatch()
            const $ = queryXml(result)

            return $
        }

        const getData = async () => {
            pageData.value.initComplated = false
            const $faceGroup = await getFaceGroupData()
            const $faceMatch = await getFaceMatchData()

            const result = await queryCombinedAlarm()
            commLoadResponseHandler(result, ($) => {
                pageData.value.totalCount = $('//content/item').length
                $('//content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const trigger = $item('trigger')
                    const $trigger = queryXml(trigger[0].element)

                    const row = {
                        id: item.attr('id'),
                        name: $item('param/name').text(),
                        status: '',
                        combinedAlarm: {
                            switch: $item('param/switch').text() == 'true',
                            item: [],
                        },
                        sysRec: {
                            switch: $trigger('sysRec/switch').text() == 'true',
                            chls: [],
                        },
                        recordList: [],
                        sysSnap: {
                            switch: $trigger('sysSnap/switch').text() == 'true',
                            chls: [],
                        },
                        snapList: [],
                        alarmOut: {
                            switch: $trigger('alarmOut/switch').text() == 'true',
                            alarmOuts: [],
                        },
                        alarmOutList: [],
                        popVideo: {
                            switch: $trigger('popVideo/switch').text(),
                            chl: {
                                value: $trigger('popVideo/chl').attr('id'),
                                label: $trigger('popVideo/chl').text(),
                            },
                        },
                        preset: {
                            switch: $trigger('preset/switch').text() == 'true',
                            presets: [],
                        },
                        sysAudio: $trigger('sysAudio').attr('id') || DEFAULT_EMPTY_ID,
                        msgPush: $trigger('msgPushSwitch').text(),
                        beeper: $trigger('buzzerSwitch').text(),
                        email: $trigger('emailSwitch').text(),
                        msgBoxPopup: $trigger('popMsgSwitch').text(),
                        videoPopup: $trigger('popVideo/switch').text() == 'false' ? '' : $trigger('popVideo/chl').attr('id'),
                    } as CombinedAlarm

                    const audioData = pageData.value.audioList.filter((item) => {
                        return item.value === row.sysAudio
                    })
                    if (!audioData.length) {
                        row.sysAudio = DEFAULT_EMPTY_ID
                    }

                    const currCombinedId = item.attr('id')!
                    $item('param/alarmSource/item').forEach(async (ele) => {
                        const $ele = queryXml(ele.element)
                        const APISource = $ele('alarmSourceType').text() // 接口返回报警类型
                        const APIChlId = $ele('alarmSourceEntity').attr('id') // 接口返回报警源
                        let realSource = ''

                        if (APISource == 'Motion') {
                            // 已配置的FaceMatch数组
                            $faceMatch('content/item').forEach((faceItem) => {
                                const $faceItem = queryXml(faceItem.element)
                                // FaceMatch数组XML包含了组合报警Id和通道chlId,若匹配上，证明已配置，是FaceMatch类型
                                if (faceItem.attr('id') == currCombinedId && $faceItem('chlID').attr('id') == APIChlId) {
                                    const alarmSourceType = faceItem.attr('alarmSourceType')
                                    realSource = alarmSourceType ? alarmSourceType : 'Motion'

                                    if (alarmSourceType == 'FaceMatch') {
                                        const chlIdMapFaceName = {} as Record<string, string>
                                        const groupId = [] as string[]
                                        const faceDataBase = [] as string[]
                                        $faceGroup('content/item').forEach((ele2) => {
                                            const $ele2 = queryXml(ele2.element)
                                            chlIdMapFaceName[ele2.attr('id')!] = $ele2('name').text()
                                        })
                                        $faceItem('groupId/item').forEach((ele3) => {
                                            groupId.push(ele3.attr('id')!)
                                            faceDataBase.push(chlIdMapFaceName[ele3.attr('id')!])
                                        })
                                        pageData.value.faceObj[currCombinedId] = {}
                                        pageData.value.faceObj[currCombinedId][APIChlId] = {}
                                        pageData.value.faceObj[currCombinedId][APIChlId].obj = {
                                            duration: parseInt($faceItem('startTime').text()),
                                            delay: parseInt($faceItem('endTime').text()),
                                            faceDataBase: faceDataBase,
                                            groupId: groupId,
                                            rule: $faceItem('matchRule').text(),
                                            noShowDisplay: $faceItem('noShowDisplay').text(),
                                            displayText: $faceItem('displayText').text(),
                                        }
                                    }
                                }
                            })
                        }
                        row.combinedAlarm.item.push({
                            alarmSourceType: realSource || $ele('alarmSourceType').text(),
                            alarmSourceEntity: {
                                value: APIChlId || $ele('alarmSourceEntity').attr('id'),
                                label: $ele('alarmSourceEntity').text(),
                            },
                        })
                    })

                    $trigger('sysRec/chls/item').forEach((element) => {
                        row.sysRec.chls.push({
                            value: element.attr('id')!,
                            label: element.text(),
                        })
                    })
                    row.recordList = row.sysRec.chls.map((item) => item.value)

                    $trigger('sysSnap/chls/item').forEach((element) => {
                        row.sysSnap.chls.push({
                            value: element.attr('id')!,
                            label: element.text(),
                        })
                    })
                    row.snapList = row.sysSnap.chls.map((item) => item.value)

                    $trigger('alarmOut/alarmOuts/item').forEach((element) => {
                        row.alarmOut.alarmOuts.push({
                            value: element.attr('id')!,
                            label: element.text(),
                        })
                    })
                    row.alarmOutList = row.alarmOut.alarmOuts.map((item) => item.value)

                    $trigger('preset/presets/item').forEach((element) => {
                        const $element = queryXml(element.element)
                        row.preset.presets.push({
                            index: $element('index').text(),
                            name: $element('name').text(),
                            chl: {
                                value: $element('chl').attr('id'),
                                label: $element('chl').text(),
                            },
                        })
                    })
                    tableData.value.push(row)
                    tableDataInit.push(cloneDeep(row))
                })
            })
        }

        // 名称修改时的处理
        const nameFocus = (name: string) => {
            originalName.value = name
        }

        const nameBlur = (row: CombinedAlarm) => {
            const name = row.name
            if (!checkChlName(name)) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS'),
                })
                row.name = originalName.value
            } else {
                if (!name) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_PROMPT_NAME_EMPTY'),
                    })
                    row.name = originalName.value
                }

                for (const item of tableData.value) {
                    if (item.id != row.id && name == item.name) {
                        openMessageTipBox({
                            type: 'info',
                            message: Translate('IDCS_NAME_SAME'),
                        })
                        row.name = originalName.value
                        break
                    }
                }
            }
        }

        // 回车键失去焦点
        const enterBlur = (event: { target: { blur: () => void } }) => {
            event.target.blur()
        }

        // 组合报警弹窗打开
        const openCombinedAlarmPop = (row: CombinedAlarm) => {
            pageData.value.combinedAlarmLinkedId = row.id
            pageData.value.combinedAlarmLinkedList = row.combinedAlarm.item
            pageData.value.currRowFaceObj = pageData.value.faceObj[row.id]
            pageData.value.isCombinedAlarmPopOpen = true
        }

        const handleCombinedAlarmLinkedList = (currId: string, combinedAlarmItems: CombinedAlarmItem[], entity: string, obj: faceMatchObj) => {
            tableData.value.some((item) => {
                if (item.id == currId) {
                    item.combinedAlarm.item = combinedAlarmItems
                    if (entity) {
                        pageData.value.faceObj[currId] = {}
                        pageData.value.faceObj[currId][entity] = {}
                        pageData.value.faceObj[currId][entity].obj = obj
                    }
                }
            })
        }

        const combinedAlarmClose = (id: string) => {
            pageData.value.isCombinedAlarmPopOpen = false
            tableData.value.forEach((item) => {
                if (item.id == id) {
                    changeCombinedALarmInfo(item)
                    if (item.combinedAlarm.item.length == 0) item.combinedAlarm.switch = false
                }
            })
        }

        const combinedAlarmCheckChange = (row: CombinedAlarm) => {
            if (row.combinedAlarm.switch) {
                openCombinedAlarmPop(row)
            } else {
                row.combinedAlarm.item = []
            }
            changeCombinedALarmInfo(row)
        }

        // 录像配置相关处理
        const recordConfirmAll = (e: any[]) => {
            if (e.length !== 0) {
                pageData.value.recordChosedListAll = cloneDeep(e)
                pageData.value.recordChosedIdsAll = e.map((item) => item.value)
                tableData.value.forEach((item) => {
                    item.sysRec.switch = true
                    item.sysRec.chls = pageData.value.recordChosedListAll
                    item.recordList = pageData.value.recordChosedListAll.map((item) => item.value)
                })
            }
            pageData.value.recordChosedListAll = []
            pageData.value.recordChosedIdsAll = []
            pageData.value.recordIsShowAll = false
        }

        const recordCloseAll = () => {
            pageData.value.recordChosedListAll = []
            pageData.value.recordChosedIdsAll = []
            pageData.value.recordIsShowAll = false
        }

        // 打开录像dialog
        const setRecord = (index: number) => {
            pageData.value.triggerDialogIndex = index
            pageData.value.recordIsShow = true
        }

        const recordConfirm = (e: SelectOption<string, string>[]) => {
            const index = pageData.value.triggerDialogIndex
            if (e.length !== 0) {
                tableData.value[index].sysRec.chls = cloneDeep(e)
                tableData.value[index].recordList = e.map((item) => item.value)
            } else {
                tableData.value[index].sysRec.chls = []
                tableData.value[index].recordList = []
                tableData.value[index].sysRec.switch = false
            }
            pageData.value.recordIsShow = false
        }

        const recordClose = () => {
            if (!tableData.value[pageData.value.triggerDialogIndex].sysRec.chls.length) {
                tableData.value[pageData.value.triggerDialogIndex].sysRec.switch = false
                tableData.value[pageData.value.triggerDialogIndex].recordList = []
                tableData.value[pageData.value.triggerDialogIndex].sysRec.chls = []
            }
            pageData.value.recordIsShow = false
        }

        // 抓图配置相关处理
        const snapConfirmAll = (e: any[]) => {
            if (e.length !== 0) {
                pageData.value.snapChosedListAll = cloneDeep(e)
                pageData.value.snapChosedIdsAll = e.map((item) => item.value)
                tableData.value.forEach((item) => {
                    item.sysSnap.switch = true
                    item.sysSnap.chls = pageData.value.snapChosedListAll
                    item.snapList = e.map((item) => item.value)
                })
            }
            pageData.value.snapChosedListAll = []
            pageData.value.snapChosedIdsAll = []
            pageData.value.snapIsShowAll = false
        }

        const snapCloseAll = () => {
            pageData.value.snapChosedListAll = []
            pageData.value.snapChosedIdsAll = []
            pageData.value.snapIsShowAll = false
        }

        // 打开抓图dialog
        const setSnap = (index: number) => {
            pageData.value.triggerDialogIndex = index
            pageData.value.snapIsShow = true
        }

        const snapConfirm = (e: SelectOption<string, string>[]) => {
            const index = pageData.value.triggerDialogIndex
            if (e.length !== 0) {
                tableData.value[index].sysSnap.chls = cloneDeep(e)
                tableData.value[index].snapList = e.map((item) => item.value)
            } else {
                tableData.value[index].sysSnap.chls = []
                tableData.value[index].snapList = []
                tableData.value[index].sysSnap.switch = false
            }
            pageData.value.snapIsShow = false
        }

        const snapClose = () => {
            if (!tableData.value[pageData.value.triggerDialogIndex].sysSnap.chls.length) {
                tableData.value[pageData.value.triggerDialogIndex].sysSnap.switch = false
                tableData.value[pageData.value.triggerDialogIndex].snapList = []
                tableData.value[pageData.value.triggerDialogIndex].sysSnap.chls = []
            }
            pageData.value.snapIsShow = false
        }

        // 报警输出相关处理
        const alarmOutConfirmAll = (e: any[]) => {
            if (e.length !== 0) {
                pageData.value.alarmOutChosedListAll = cloneDeep(e)
                pageData.value.alarmOutChosedIdsAll = e.map((item) => item.value)
                tableData.value.forEach((item) => {
                    item.alarmOut.switch = true
                    item.alarmOut.alarmOuts = pageData.value.alarmOutChosedListAll
                    item.alarmOutList = e.map((item) => item.value)
                })
            }
            pageData.value.alarmOutChosedListAll = []
            pageData.value.alarmOutChosedIdsAll = []
            pageData.value.alarmOutIsShowAll = false
        }

        const alarmOutCloseAll = () => {
            pageData.value.alarmOutChosedListAll = []
            pageData.value.alarmOutChosedIdsAll = []
            pageData.value.alarmOutIsShowAll = false
        }

        // 打开报警输出dialog
        const setAlarmOut = (index: number) => {
            pageData.value.triggerDialogIndex = index
            pageData.value.alarmOutIsShow = true
        }

        const alarmOutConfirm = (e: SelectOption<string, string>[]) => {
            const index = pageData.value.triggerDialogIndex
            if (e.length !== 0) {
                tableData.value[index].alarmOut.alarmOuts = cloneDeep(e)
                tableData.value[index].alarmOutList = e.map((item) => item.value)
            } else {
                tableData.value[index].alarmOut.alarmOuts = []
                tableData.value[index].alarmOutList = []
                tableData.value[index].alarmOut.switch = false
            }
            pageData.value.alarmOutIsShow = false
        }

        const alarmOutClose = () => {
            if (!tableData.value[pageData.value.triggerDialogIndex].alarmOut.alarmOuts.length) {
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.switch = false
                tableData.value[pageData.value.triggerDialogIndex].alarmOutList = []
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.alarmOuts = []
            }
            pageData.value.alarmOutIsShow = false
        }

        // 预置点名称配置处理
        const openPresetPop = (row: CombinedAlarm) => {
            pageData.value.presetChlId = row.id
            pageData.value.presetLinkedList = row.preset.presets
            pageData.value.isPresetPopOpen = true
        }

        const handlePresetLinkedList = (id: string, linkedList: PresetItem[]) => {
            tableData.value.forEach((item) => {
                if (item.id == id) {
                    item.preset.presets = linkedList
                }
            })
        }

        const presetClose = (id: string) => {
            pageData.value.isPresetPopOpen = false
            tableData.value.forEach((item) => {
                if (item.id == id && item.preset.presets.length == 0) {
                    item.preset.switch = false
                }
            })
        }

        const presetCheckChange = (row: CombinedAlarm) => {
            if (row.preset.switch) {
                openPresetPop(row)
            } else {
                row.preset.presets = []
            }
        }

        const checkChange = (index: number, type: string) => {
            switch (type) {
                case 'record':
                    if (tableData.value[index].sysRec.switch) {
                        setRecord(index)
                    } else {
                        tableData.value[index].sysRec.chls = []
                        tableData.value[index].recordList = []
                    }
                    break
                case 'snap':
                    if (tableData.value[index].sysSnap.switch) {
                        setSnap(index)
                    } else {
                        tableData.value[index].sysSnap.chls = []
                        tableData.value[index].snapList = []
                    }
                    break
                case 'alarmOut':
                    if (tableData.value[index].alarmOut.switch) {
                        setAlarmOut(index)
                    } else {
                        tableData.value[index].alarmOut.alarmOuts = []
                        tableData.value[index].alarmOutList = []
                    }
                    break
                default:
                    break
            }
        }

        const changeCombinedALarmInfo = (row: CombinedAlarm) => {
            let info = ''
            row.combinedAlarm.item.forEach((item, index) => {
                if (index == 0) {
                    info += row.name + ': '
                }
                info += item.alarmSourceEntity.label + '  ' + COMBINED_ALARM_TYPES_MAPPING[item.alarmSourceType] + ' & '
            })
            if (info) {
                info = info.substring(0, info.length - 3)
            }
            pageData.value.CombinedALarmInfo = info
        }

        /**
         * @description: 改变所有项的值
         * @param {string} value 值
         * @param {string} field 字段名
         * @return {*}
         */
        const changeAllValue = (value: any, field: string) => {
            tableData.value.forEach((item) => {
                if (field == 'videoPopUp') {
                    item.popVideo.chl.value = value
                    if (value != '') item.popVideo.switch = 'true'
                } else {
                    ;(item as any)[field] = value
                }
            })
        }

        const getEditedRows = (table: CombinedAlarm[], tableInit: CombinedAlarm[]) => {
            const editedRows = [] as CombinedAlarm[]
            table.forEach((item, index) => {
                if (!isEqual(item, tableInit[index])) {
                    editedRows.push(item)
                }
            })
            return editedRows
        }

        const getSavaData = (row: CombinedAlarm) => {
            let sendXml = rawXml`
            <content type='list'>
                <item id='${row.id}'>
                    <param><name><![CDATA[${row.name}]]></name>
                    <switch>${String(row.combinedAlarm.switch)}</switch>
                    <alarmSource>
            `
            // 组合报警
            row.combinedAlarm.item.forEach((item) => {
                sendXml += rawXml`
                <item>
                    <alarmSourceType>${item.alarmSourceType}</alarmSourceType>
                        <alarmSourceEntity id='${item.alarmSourceEntity.value}'><![CDATA[${item.alarmSourceEntity.label}]]></alarmSourceEntity>
                </item>
                `
            })
            sendXml += rawXml`</alarmSource></param>`
            //sysRec通道遍历
            sendXml += rawXml`
                    <trigger>
                        <sysRec>
                            <switch>${String(row.sysRec.switch)}</switch>
                            <chls>
            `
            row.sysRec.chls.forEach((item) => {
                sendXml += rawXml`<item id='${item.value}'>${item.label}</item>
                `
            })
            //sysSnap通道遍历
            sendXml += rawXml`</chls>
                </sysRec>
                <sysSnap>
                    <switch>${String(row.sysSnap.switch)}</switch>
                    <chls>
            `
            row.sysSnap.chls.forEach((item) => {
                sendXml += rawXml`<item id='${item.value}'>${item.label}</item>
                `
            })
            //alarmOut通道遍历
            sendXml += rawXml`</chls>
                </sysSnap>
                <alarmOut>
                    <switch>${String(row.alarmOut.switch)}</switch>
                        <alarmOuts>
            `
            row.alarmOut.alarmOuts.forEach((item) => {
                sendXml += rawXml`<item id='${item.value}'>${item.label}</item>
                `
            })
            sendXml += rawXml`</alarmOuts>
                </alarmOut>
                <popVideo>
                    <switch>${row.popVideo.switch}</switch>
                    <chl id='${row.popVideo.chl.value}'></chl>
                </popVideo>
                    <preset>
                        <switch>${String(row.preset.switch)}</switch>
                        <presets>
            `
            row.preset.presets.forEach((item) => {
                sendXml += rawXml`<item>
                    <index>${item.index}</index>
                        <name><![CDATA[${item.index}]]></name>
                        <chl id='${item.chl.value}'>${item.chl.label}</chl>
                    </item>
                `
            })
            sendXml += rawXml`</presets>
                </preset>
                <msgPushSwitch>${row.msgPush}</msgPushSwitch>
                <buzzerSwitch>${row.beeper}</buzzerSwitch>
                <popMsgSwitch>${row.msgBoxPopup}</popMsgSwitch>
                <emailSwitch>${row.email}</emailSwitch>
                <sysAudio id='${row.sysAudio}'></sysAudio>
            </trigger>
            </item>
            </content>
            `
            return sendXml
        }

        const setData = async () => {
            const editedRows = getEditedRows(tableData.value, tableDataInit)
            let count = 0
            if (editedRows.length != 0) {
                openLoading()
                editedRows.forEach(async (item) => {
                    const sendXml = getSavaData(item)
                    const result = await editCombinedAlarm(sendXml)
                    const $ = queryXml(result)
                    const isSuccess = $('//status').text() === 'success'
                    item.status = isSuccess ? 'success' : 'error'
                    count++

                    if (count >= editedRows.length) {
                        // 更新表格初始对比值
                        tableDataInit = cloneDeep(tableData.value)
                        closeLoading()
                        nextTick(() => {
                            pageData.value.applyDisabled = true
                        })
                    }
                })
            }
            const sendXml1 = getSaveFaceData()
            await editCombinedAlarmFaceMatch(sendXml1)
        }

        const getSaveFaceData = () => {
            const combinedId = [] as string[]
            const groupId = [] as string[]
            const peaCombinedId = [] as string[]
            const peaGroupId = [] as string[]
            const tripwireCombinedId = [] as string[]
            const tripwireGroupId = [] as string[]
            tableData.value.forEach((item) => {
                if (item.combinedAlarm.switch) {
                    item.combinedAlarm.item.forEach((ele) => {
                        if (ele.alarmSourceType == 'FaceMatch') {
                            combinedId.push(item.id)
                            groupId.push(ele.alarmSourceEntity.value)
                        } else if (ele.alarmSourceType == 'InvadeDetect') {
                            peaCombinedId.push(item.id)
                            peaGroupId.push(ele.alarmSourceEntity.value)
                        } else if (ele.alarmSourceType == 'Tripwire') {
                            tripwireCombinedId.push(item.id)
                            tripwireGroupId.push(ele.alarmSourceEntity.value)
                        }
                    })
                }
            })
            let sendXml = rawXml`<content>`

            combinedId.forEach((item, index) => {
                let obj = pageData.value.faceObj[item] && pageData.value.faceObj[item][groupId[index]] && pageData.value.faceObj[item][groupId[index]].obj
                if (!obj) {
                    obj = {
                        rule: '1',
                        duration: -5,
                        delay: 5,
                        noShowDisplay: 'false',
                        displayText: '',
                        groupId: [],
                        faceDataBase: [],
                    }
                }
                sendXml += rawXml`<item id='${item}' alarmSourceType='FaceMatch'>`
                sendXml += rawXml`<chlID id='${groupId[index]}'></chlID>
                        <matchRule>${obj.rule}</matchRule>
                        <startTime>${String(obj.duration)}</startTime>
                        <endTime>${String(obj.delay)}</endTime>
                        <noShowDisplay>${obj.noShowDisplay}</noShowDisplay>
                        <displayText>${obj.displayText}</displayText>
                        <groupId>`
                obj.groupId.forEach((element) => {
                    sendXml += rawXml`'<item id='${element}'></item>`
                })
                sendXml += rawXml`</groupId></item>`
            })

            // 区域入侵xml
            peaCombinedId.forEach((item, index) => {
                sendXml += rawXml`'<item id='${item}' alarmSourceType='InvadeDetect'>`
                sendXml += rawXml`<chlID id='${peaGroupId[index]}'></chlID>`
                sendXml += rawXml`</item>`
            })
            // 越界
            tripwireCombinedId.forEach((item, index) => {
                sendXml += rawXml`<item id='${item}' alarmSourceType='Tripwire'>`
                sendXml += rawXml`<chlID id='${tripwireGroupId[index]}'></chlID>`
                sendXml += rawXml`</item>`
            })

            sendXml += `</content>`
            return sendXml
        }

        onMounted(async () => {
            // 相关请求，获取前置数据
            await getSystemCaps() // 系统配置
            await getChlData() // 通道数据
            await getRecordList()
            await getSnapList()
            await getAlarmOutData() // 报警输出

            await getData()

            // 在tabledata初始化完成后开始监听tabledata的数据变化
            if (tableData.value.length == pageData.value.totalCount) {
                pageData.value.initComplated = true
            }
        })

        watch(
            tableData,
            () => {
                if (pageData.value.initComplated) {
                    pageData.value.applyDisabled = false
                }
            },
            {
                deep: true,
            },
        )

        return {
            SetPresetPop,
            CombinationAlarmPop,
            pageData,
            tableData,
            // 组合报警提示
            changeCombinedALarmInfo,
            // 名称修改
            nameFocus,
            nameBlur,
            enterBlur,
            checkChange,
            // 组合报警
            openCombinedAlarmPop,
            handleCombinedAlarmLinkedList,
            combinedAlarmClose,
            combinedAlarmCheckChange,
            // 录像
            recordConfirmAll,
            recordCloseAll,
            setRecord,
            recordConfirm,
            recordClose,
            // 抓图
            snapConfirmAll,
            snapCloseAll,
            setSnap,
            snapConfirm,
            snapClose,
            // 报警输出
            alarmOutConfirmAll,
            alarmOutCloseAll,
            setAlarmOut,
            alarmOutConfirm,
            alarmOutClose,
            // 预置点名称
            openPresetPop,
            handlePresetLinkedList,
            presetClose,
            presetCheckChange,
            // 表头改变属性
            changeAllValue,
            setData,
        }
    },
})
