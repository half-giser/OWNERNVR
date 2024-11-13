/*
 * @Description: 普通事件——组合报警
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-22 16:04:47
 */
import { type AlarmCombinedDto, type AlarmCombinedItemDto, type AlarmCombinedFaceMatchDto, type AlarmPresetItem } from '@/types/apiType/aiAndEvent'
import { cloneDeep, isEqual } from 'lodash-es'
import AlarmBasePresetPop from './AlarmBasePresetPop.vue'
import AlarmBaseSnapPop from './AlarmBaseSnapPop.vue'
import AlarmBaseRecordPop from './AlarmBaseRecordPop.vue'
import AlarmBaseAlarmOutPop from './AlarmBaseAlarmOutPop.vue'
import CombinationAlarmPop from './CombinationAlarmPop.vue'

export default defineComponent({
    components: {
        AlarmBasePresetPop,
        AlarmBaseSnapPop,
        AlarmBaseRecordPop,
        AlarmBaseAlarmOutPop,
        CombinationAlarmPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
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

            recordIsShow: false,
            snapIsShow: false,
            alarmOutIsShow: false,

            // 当前打开dialog行的index
            triggerDialogIndex: 0,

            // 预置点名称配置
            isPresetPopOpen: false,

            isCombinedAlarmPopOpen: false,
            combinedAlarmLinkedId: '',
            combinedAlarmLinkedList: [] as AlarmCombinedItemDto[],
            currRowFaceObj: {} as Record<string, Record<string, AlarmCombinedFaceMatchDto>>,

            // 人脸对象，层级依次为combinedID，chlID，obj
            faceObj: {} as Record<string, Record<string, Record<string, AlarmCombinedFaceMatchDto>>>,
        })

        // 表格数据
        const tableData = ref<AlarmCombinedDto[]>([])
        // 缓存表格初始数据，保存时对比变化了的行
        let tableDataInit = [] as AlarmCombinedDto[]

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
            openLoading()
            pageData.value.initComplated = false
            const $faceGroup = await getFaceGroupData()
            const $faceMatch = await getFaceMatchData()

            const result = await queryCombinedAlarm()
            commLoadResponseHandler(result, ($) => {
                closeLoading()
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
                        record: {
                            switch: $trigger('sysRec/switch').text() == 'true',
                            chls: $trigger('sysRec/chls/item').map((element) => {
                                return {
                                    value: element.attr('id')!,
                                    label: element.text(),
                                }
                            }),
                        },
                        snap: {
                            switch: $trigger('sysSnap/switch').text() == 'true',
                            chls: $trigger('sysSnap/chls/item').map((element) => {
                                return {
                                    value: element.attr('id')!,
                                    label: element.text(),
                                }
                            }),
                        },
                        alarmOut: {
                            switch: $trigger('alarmOut/switch').text() == 'true',
                            alarmOuts: $trigger('alarmOut/alarmOuts/item').map((element) => {
                                return {
                                    value: element.attr('id')!,
                                    label: element.text(),
                                }
                            }),
                        },
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
                    } as AlarmCombinedDto

                    const audioData = pageData.value.audioList.filter((item) => {
                        return item.value === row.sysAudio
                    })
                    if (!audioData.length) {
                        row.sysAudio = DEFAULT_EMPTY_ID
                    }

                    const currCombinedId = item.attr('id')!
                    $item('param/alarmSource/item').forEach((ele) => {
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

                    row.preset.presets = $trigger('preset/presets/item').map((element) => {
                        const $element = queryXml(element.element)
                        return {
                            index: $element('index').text(),
                            name: $element('name').text(),
                            chl: {
                                value: $element('chl').attr('id'),
                                label: $element('chl').text(),
                            },
                        }
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

        const nameBlur = (row: AlarmCombinedDto) => {
            const name = row.name
            if (!checkChlName(name)) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS'),
                })
                row.name = originalName.value
            } else {
                if (!name) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_PROMPT_NAME_EMPTY'),
                    })
                    row.name = originalName.value
                }

                for (const item of tableData.value) {
                    if (item.id != row.id && name == item.name) {
                        openMessageBox({
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
        const openCombinedAlarmPop = (row: AlarmCombinedDto) => {
            pageData.value.combinedAlarmLinkedId = row.id
            pageData.value.combinedAlarmLinkedList = row.combinedAlarm.item
            pageData.value.currRowFaceObj = pageData.value.faceObj[row.id]
            pageData.value.isCombinedAlarmPopOpen = true
        }

        const handleCombinedAlarmLinkedList = (currId: string, combinedAlarmItems: AlarmCombinedItemDto[], entity: string, obj: AlarmCombinedFaceMatchDto) => {
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

        const combinedAlarmCheckChange = (row: AlarmCombinedDto) => {
            if (row.combinedAlarm.switch) {
                openCombinedAlarmPop(row)
            } else {
                row.combinedAlarm.item = []
            }
            changeCombinedALarmInfo(row)
        }

        const switchRecord = (index: number) => {
            const row = tableData.value[index].record
            if (row.switch) {
                openRecord(index)
            } else {
                row.chls = []
            }
        }

        const openRecord = (index: number) => {
            tableData.value[index].record.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.recordIsShow = true
        }

        const changeRecord = (index: number, data: SelectOption<string, string>[]) => {
            pageData.value.recordIsShow = false
            tableData.value[index].record = {
                switch: !!data.length,
                chls: cloneDeep(data),
            }
        }

        const switchSnap = (index: number) => {
            const row = tableData.value[index].snap
            if (row.switch) {
                openSnap(index)
            } else {
                row.chls = []
            }
        }

        const openSnap = (index: number) => {
            tableData.value[index].snap.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.snapIsShow = true
        }

        const changeSnap = (index: number, data: SelectOption<string, string>[]) => {
            pageData.value.snapIsShow = false
            tableData.value[index].snap = {
                switch: !!data.length,
                chls: cloneDeep(data),
            }
        }

        const switchAlarmOut = (index: number) => {
            const row = tableData.value[index].alarmOut
            if (row.switch) {
                openAlarmOut(index)
            } else {
                row.alarmOuts = []
            }
        }

        const openAlarmOut = (index: number) => {
            tableData.value[index].alarmOut.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.alarmOutIsShow = true
        }

        const changeAlarmOut = (index: number, data: SelectOption<string, string>[]) => {
            pageData.value.alarmOutIsShow = false
            tableData.value[index].alarmOut = {
                switch: !!data.length,
                alarmOuts: cloneDeep(data),
            }
        }

        const switchPreset = (index: number) => {
            const row = tableData.value[index].preset
            if (row.switch) {
                openPreset(index)
            } else {
                row.presets = []
            }
        }

        const openPreset = (index: number) => {
            tableData.value[index].alarmOut.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.isPresetPopOpen = true
        }

        const changePreset = (index: number, data: AlarmPresetItem[]) => {
            pageData.value.isPresetPopOpen = false
            tableData.value[index].preset = {
                switch: !!data.length,
                presets: cloneDeep(data),
            }
        }

        const changeCombinedALarmInfo = (row: AlarmCombinedDto) => {
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

        const getEditedRows = (table: AlarmCombinedDto[], tableInit: AlarmCombinedDto[]) => {
            const editedRows = [] as AlarmCombinedDto[]
            table.forEach((item, index) => {
                if (!isEqual(item, tableInit[index])) {
                    editedRows.push(item)
                }
            })
            return editedRows
        }

        const getSavaData = (row: AlarmCombinedDto) => {
            const sendXml = rawXml`
                <content type='list'>
                    <item id='${row.id}'>
                        <param>
                            <name><![CDATA[${row.name}]]></name>
                            <switch>${row.combinedAlarm.switch}</switch>
                            <alarmSource>
                                ${row.combinedAlarm.item
                                    .map((item) => {
                                        return rawXml`
                                            <item>
                                                <alarmSourceType>${item.alarmSourceType}</alarmSourceType>
                                                <alarmSourceEntity id='${item.alarmSourceEntity.value}'><![CDATA[${item.alarmSourceEntity.label}]]></alarmSourceEntity>
                                            </item>
                                        `
                                    })
                                    .join('')}
                            </alarmSource>
                        </param>
                        <trigger>
                            <sysRec>
                                <switch>${row.record.switch}</switch>
                                <chls>
                                    ${row.record.chls
                                        .map((item) => {
                                            return `<item id='${item.value}'>${item.label}</item>`
                                        })
                                        .join('')}
                                </chls>
                            </sysRec>
                            <sysSnap>
                                <switch>${row.snap.switch}</switch>
                                <chls>
                                    ${row.snap.chls
                                        .map((item) => {
                                            return `<item id='${item.value}'>${item.label}</item>`
                                        })
                                        .join('')}
                                </chls>
                            </sysSnap>
                            <alarmOut>
                                <switch>${row.alarmOut.switch}</switch>
                                <alarmOuts>
                                    ${row.alarmOut.alarmOuts
                                        .map((item) => {
                                            return `<item id='${item.value}'>${item.label}</item>`
                                        })
                                        .join('')}
                                </alarmOuts>
                            </alarmOut>
                            <popVideo>
                                <switch>${row.popVideo.switch}</switch>
                                <chl id='${row.popVideo.chl.value}'></chl>
                            </popVideo>
                            <preset>
                                <switch>${row.preset.switch}</switch>
                                <presets>
                                    ${row.preset.presets
                                        .map((item) => {
                                            return rawXml`
                                                <item>
                                                    <index>${item.index}</index>
                                                    <name><![CDATA[${item.index}]]></name>
                                                    <chl id='${item.chl.value}'>${item.chl.label}</chl>
                                                </item>
                                            `
                                        })
                                        .join('')}
                                </presets>
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
            if (editedRows.length) {
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

            const sendXml = rawXml`
                <content>
                    ${combinedId
                        .map((item, index) => {
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

                            return rawXml`
                                <item id='${item}' alarmSourceType='FaceMatch'>
                                    <chlID id='${groupId[index]}'></chlID>
                                    <matchRule>${obj.rule}</matchRule>
                                    <startTime>${obj.duration}</startTime>
                                    <endTime>${obj.delay}</endTime>
                                    <noShowDisplay>${obj.noShowDisplay}</noShowDisplay>
                                    <displayText>${obj.displayText}</displayText>
                                    <groupId>
                                        ${obj.groupId
                                            .map((element) => {
                                                return `<item id='${element}'></item>`
                                            })
                                            .join('')}
                                    </groupId>
                                </item>
                            `
                        })
                        .join('')}
                    ${peaCombinedId
                        .map((item, index) => {
                            return rawXml`
                                <item id='${item}' alarmSourceType='InvadeDetect'>
                                    <chlID id='${peaGroupId[index]}'></chlID>
                                </item>
                            `
                        })
                        .join('')}
                    ${tripwireCombinedId
                        .map((item, index) => {
                            return rawXml`
                                <item id='${item}' alarmSourceType='Tripwire'>
                                    <chlID id='${tripwireGroupId[index]}'></chlID>
                                </item>
                            `
                        })
                        .join('')}
                </content>
            `

            return sendXml
        }

        onMounted(async () => {
            // 相关请求，获取前置数据
            await getSystemCaps() // 系统配置
            await getChlData() // 通道数据
            await getData()

            // 在tabledata初始化完成后开始监听tabledata的数据变化
            if (tableData.value.length === pageData.value.totalCount) {
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
            AlarmBasePresetPop,
            AlarmBaseSnapPop,
            AlarmBaseRecordPop,
            AlarmBaseAlarmOutPop,
            CombinationAlarmPop,
            pageData,
            tableData,
            // 组合报警提示
            changeCombinedALarmInfo,
            // 名称修改
            nameFocus,
            nameBlur,
            enterBlur,
            // 组合报警
            openCombinedAlarmPop,
            handleCombinedAlarmLinkedList,
            combinedAlarmClose,
            combinedAlarmCheckChange,
            switchRecord,
            openRecord,
            changeRecord,
            switchAlarmOut,
            openAlarmOut,
            changeAlarmOut,
            switchSnap,
            openSnap,
            changeSnap,
            switchPreset,
            openPreset,
            changePreset,
            // 表头改变属性
            changeAllValue,
            setData,
        }
    },
})
