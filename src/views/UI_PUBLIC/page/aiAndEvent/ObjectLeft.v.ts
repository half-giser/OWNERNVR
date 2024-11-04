/*
 * @Description: AI 事件——更多——物品遗留与看护
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-18 09:43:49
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-30 16:21:37
 */
import { cloneDeep } from 'lodash-es'
import { type BoundaryItem, ObjectLeft, type PresetList, type chlCaps } from '@/types/apiType/aiAndEvent'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'
import { type TabPaneName, type CheckboxValueType } from 'element-plus'
import CanvasPolygon from '@/utils/canvas/canvasPolygon'
import { type XmlResult } from '@/utils/xmlParse'

export default defineComponent({
    components: {
        ScheduleManagPop,
    },
    props: {
        /**
         * @property 选中的通道
         */
        currChlId: {
            type: String,
            required: true,
        },
        chlData: {
            type: Object as PropType<chlCaps>,
            required: true,
        },
        voiceList: {
            type: Array as PropType<SelectOption<string, string>[]>,
            required: true,
        },
    },
    setup(prop) {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const pluginStore = usePluginStore()
        const systemCaps = useCababilityStore()
        const Plugin = inject('Plugin') as PluginType
        const osType = getSystemInfo().platform
        // 系统配置
        const supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
        // 温度检测数据
        const objectLeftData = ref(new ObjectLeft())

        // 播放器
        const playerRef = ref<PlayerInstance>()

        const oscTypeTip: Record<string, string> = {
            abandum: Translate('IDCS_LEAVE_BEHIND'),
            objstolen: Translate('IDCS_ARTICLE_LOSE'),
        }

        // 常规联动
        const normalParamCheckAll = ref(false)
        const normalParamCheckList = ref([] as string[])
        // 常规联动多选数据项
        const normalParamList = ref([
            { value: 'catchSnapSwitch', label: Translate('IDCS_SNAP') },
            { value: 'msgPushSwitch', label: Translate('IDCS_PUSH') },
            { value: 'buzzerSwitch', label: Translate('IDCS_BUZZER') },
            { value: 'popVideoSwitch', label: Translate('IDCS_VIDEO_POPUP') },
            { value: 'emailSwitch', label: Translate('IDCS_EMAIL') },
        ])
        // 联动预置点
        const MAX_TRIGGER_PRESET_COUNT = 16
        const PresetTableData = ref<PresetList[]>([])

        const closeTip = getAlarmEventList()

        // 页面数据
        const pageData = ref({
            tab: 'param',
            // 是否显示全部区域
            isShowAllArea: false,
            // 在只有一个区域时，不显示（显示全部区域checkbox，全部清除btn）
            isShowAllAreaCheckBox: false,
            isShowAllClearBtn: false,
            // 排程
            scheduleList: [] as SelectOption<string, string>[],
            scheduleManagPopOpen: false,
            warnArea: 0,
            areaName: '',
            configuredArea: [] as boolean[],
            // 声音列表
            voiceList: prop.voiceList,
            // record穿梭框数据源
            recordList: [] as SelectOption<string, string>[],
            recordIsShow: false,
            // alarmOut穿梭框数据源
            alarmOutList: [] as SelectOption<string, string>[],
            alarmOutIsShow: false,
            // 初始化，后判断应用是否可用
            initComplated: false,
            applyDisabled: true,
            // 消息提示
            notification: [] as string[],
        })

        // 获取录像数据
        const getRecordList = async () => {
            pageData.value.recordList = await buildRecordChlList()
        }

        // 获取报警输出数据
        const getAlarmOutData = async () => {
            pageData.value.alarmOutList = await buildAlarmOutChlList()
        }

        // 播放模式
        const mode = computed(() => {
            if (!playerRef.value) {
                return ''
            }
            return playerRef.value.mode
        })

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']
        // 物品遗留与看护绘制的Canvas
        let objDrawer: CanvasPolygon

        /**
         * @description 播放器就绪时回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                if (isHttpsLogin()) {
                    pageData.value.notification = [formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`)]
                }
                const canvas = player.getDrawbordCanvas(0)
                objDrawer = new CanvasPolygon({
                    el: canvas,
                    onchange: areaChange,
                    closePath: closePath,
                    forceClosePath: forceClosePath,
                    clearCurrentArea: clearCurrentArea,
                })
            }

            if (mode.value === 'ocx') {
                if (!plugin.IsInstallPlugin()) {
                    plugin.SetPluginNotice('#layout2Content')
                    return
                }

                if (!plugin.IsPluginAvailable()) {
                    pluginStore.showPluginNoResponse = true
                    plugin.ShowPluginNoResponse()
                }
                const sendXML = OCX_XML_SetPluginModel(osType == 'mac' ? 'OscConfig' : 'ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        // objDrawer初始化时绑定以下函数
        const areaChange = (points: { X: number; Y: number; isClosed?: boolean }[] | { X1: number; Y1: number; X2: number; Y2: number }) => {
            objectLeftData.value.boundary[pageData.value.warnArea].points = points as { X: number; Y: number; isClosed: boolean }[]
            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        const closePath = (points: { X: number; Y: number; isClosed?: boolean }[]) => {
            points.forEach((item) => (item.isClosed = true))
            objectLeftData.value.boundary[pageData.value.warnArea].points = points as { X: number; Y: number; isClosed: boolean }[]
        }

        const forceClosePath = (canBeClosed: boolean) => {
            if (!canBeClosed) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_INTERSECT'),
                })
            }
        }

        const clearCurrentArea = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DRAW_CLEAR_TIP'),
            }).then(() => {
                if (objectLeftData.value.boundary.length == 0) return
                objectLeftData.value.boundary[pageData.value.warnArea].points = []
                if (mode.value === 'h5') {
                    objDrawer.clear()
                } else {
                    const sendXML = OCX_XML_SetOscAreaAction('NONE')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }

                if (pageData.value.isShowAllArea) {
                    showAllArea()
                }
            })
        }

        /**
         * @description 播放视频
         */
        const play = () => {
            const chlData = prop.chlData
            if (mode.value === 'h5') {
                player.play({
                    chlID: prop.currChlId,
                    streamType: 2,
                })
            } else if (mode.value === 'ocx') {
                if (osType == 'mac') {
                    const sendXML = OCX_XML_Preview({
                        winIndexList: [0],
                        chlIdList: [chlData.id],
                        chlNameList: [chlData.name],
                        streamType: 'sub',
                        // chl没有index属性
                        chlIndexList: ['0'],
                        chlTypeList: [chlData.chlType],
                    })
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    plugin.RetryStartChlView(prop.currChlId, chlData.name)
                }
            }
            // 设置视频区域可编辑
            // 界面内切换tab，调用play时初始化区域
            setTimeout(() => {
                setAreaView()
            }, 0)
            if (mode.value === 'h5') {
                objDrawer.setEnable(true)
            } else {
                const sendXML = OCX_XML_SetOscAreaAction('EDIT_ON')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        const getObjectLeftData = async () => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${prop.currChlId}</chlId>
                </condition>
                <requireField>
                    <param/>
                    <trigger/>
                </requireField>
            `
            openLoading()
            const result = await queryOsc(sendXml)
            closeLoading()
            commLoadResponseHandler(result, async ($) => {
                const enabledSwitch = $('//content/chl/param/switch').text() == 'true'
                let holdTimeArr = $('//content/chl/param/holdTimeNote').text().split(',')
                const holdTime = $('//content/chl/param/holdTime').text()
                if (!holdTimeArr.includes(holdTime)) {
                    holdTimeArr.push(holdTime)
                    holdTimeArr = holdTimeArr.sort((a, b) => Number(a) - Number(b))
                }
                const holdTimeList = holdTimeArr.map((item) => {
                    const label = getTranslateForSecond(Number(item))
                    return {
                        value: item,
                        label,
                    }
                })
                const oscTypeList = $('//types/oscType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: oscTypeTip[item.text()],
                    }
                })
                const boundary = [] as BoundaryItem[]
                $('//content/chl/param/boundary/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const boundaryItem = {
                        areaName: $item('name').text().trim(),
                        points: [] as { X: number; Y: number; isClosed: boolean }[],
                    }
                    $item('point/item').forEach((ele) => {
                        const $ele = queryXml(ele.element)
                        boundaryItem.points.push({
                            X: Number($ele('X').text()),
                            Y: Number($ele('Y').text()),
                            isClosed: true,
                        })
                    })
                    boundary.push(boundaryItem)
                })
                const mutexList = $('//content/chl/param/mutexList/item').map((item) => {
                    const $item = queryXml(item.element)
                    return { object: $item('object').text(), status: $item('status').text() == 'true' }
                })
                const trigger = $('//content/chl/trigger')
                const $trigger = queryXml(trigger[0].element)
                const record = $trigger('sysRec/chls/item').map((item) => {
                    return {
                        value: item.attr('id')!,
                        label: item.text(),
                    }
                })
                const alarmOut = $trigger('alarmOut/alarmOuts/item').map((item) => {
                    return {
                        value: item.attr('id')!,
                        label: item.text(),
                    }
                })
                const preset = $trigger('preset/presets/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        index: $item('index').text(),
                        name: $item('name').text(),
                        chl: {
                            value: $item('chl').attr('id')!,
                            label: $item('chl').text(),
                        },
                    }
                })
                objectLeftData.value = {
                    enabledSwitch,
                    originalSwitch: enabledSwitch,
                    holdTime,
                    holdTimeList,
                    schedule: $('//content/chl').attr('scheduleGuid'),
                    oscTypeList,
                    oscType: $('//content/chl/param/oscType').text(),
                    areaMaxCount: Number($('//content/chl/param/boundary').attr('maxCount')), // 支持配置几个警戒面
                    regulation: $('//content/chl/param/boundary').attr('regulation') == '1', // 区别联咏ipc标志
                    boundary,
                    mutexList,
                    maxNameLength: Number($('//content/chl/param/boundary/item/name').attr('maxLen')) || 15,
                    record,
                    alarmOut,
                    preset,
                    msgPushSwitch: $trigger('msgPushSwitch').text() == 'true',
                    buzzerSwitch: $trigger('buzzerSwitch').text() == 'true',
                    popVideoSwitch: $trigger('popVideoSwitch').text() == 'true',
                    emailSwitch: $trigger('emailSwitch').text() == 'true',
                    catchSnapSwitch: $trigger('snapSwitch').text() == 'true',
                    sysAudio: $('sysAudio').attr('id'),
                }
            }).then(() => {
                pageData.value.initComplated = true
                handleObjectLeftData()
            })
        }

        const handleObjectLeftData = () => {
            pageData.value.areaName = objectLeftData.value.boundary[pageData.value.warnArea].areaName
            if (objectLeftData.value.msgPushSwitch) normalParamCheckList.value.push('msgPushSwitch')
            if (objectLeftData.value.buzzerSwitch) normalParamCheckList.value.push('buzzerSwitch')
            if (objectLeftData.value.popVideoSwitch) normalParamCheckList.value.push('popVideoSwitch')
            if (objectLeftData.value.emailSwitch) normalParamCheckList.value.push('emailSwitch')
            if (objectLeftData.value.catchSnapSwitch) normalParamCheckList.value.push('catchSnapSwitch')
            if (normalParamCheckList.value.length == normalParamList.value.length) {
                normalParamCheckAll.value = true
            }
            // 初始化样式
            refreshInitPage()
            // 绘制
            setAreaView()
        }

        // 检测和屏蔽区域的样式初始化
        const refreshInitPage = () => {
            objectLeftData.value.boundary.forEach((item, index) => {
                if (item.points && item.points.length > 0) {
                    pageData.value.configuredArea[index] = true
                } else {
                    pageData.value.configuredArea[index] = false
                }
            })
            // 是否显示全部区域切换按钮和清除全部按钮（区域数量大于等于2时才显示）
            if (objectLeftData.value.boundary && objectLeftData.value.boundary.length > 1) {
                pageData.value.isShowAllAreaCheckBox = true
                pageData.value.isShowAllClearBtn = true
            } else {
                pageData.value.isShowAllAreaCheckBox = false
                pageData.value.isShowAllClearBtn = false
            }
        }

        // tab项切换
        const tabChange = (name: TabPaneName) => {
            if (name == 'param') {
                play()
            }
        }

        // 视频区域
        const showAllArea = () => {
            objDrawer && objDrawer.setEnableShowAll(pageData.value.isShowAllArea)
            if (pageData.value.isShowAllArea) {
                const detectAreaInfo = {} as Record<number, { X: number; Y: number; isClosed: boolean }[]>
                objectLeftData.value.boundary.forEach((item, index) => {
                    detectAreaInfo[index] = item.points
                })
                if (mode.value === 'h5') {
                    const index = pageData.value.warnArea
                    objDrawer.setCurrAreaIndex(index, 'detectionArea')
                    objDrawer.drawAllPolygon(detectAreaInfo, {}, 'detectionArea', index, true)
                } else {
                    // todo,非h5情况下的全部显示没有写
                    console.log('ocx show all alarm area')
                }
            } else {
                // TODO
                if (mode.value != 'h5') {
                    console.log('ocx not show all alarm area')
                }
                setAreaView()
            }
        }

        const clearArea = () => {
            if (mode.value === 'h5') {
                objDrawer.clear()
            } else {
                const sendXML = OCX_XML_SetOscAreaAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            if (objectLeftData.value.boundary.length == 0) return
            objectLeftData.value.boundary[pageData.value.warnArea].points = []
            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        const clearAllArea = () => {
            objectLeftData.value.boundary.forEach((item) => {
                item.points = []
            })
            if (mode.value === 'h5') {
                objDrawer && objDrawer.clear()
            } else {
                const sendXML = OCX_XML_SetOscAreaAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        // 警戒区域切换
        const warnAreaChange = () => {
            setOtherAreaClosed()
            setAreaView()
        }

        // 设置区域图形
        const setAreaView = () => {
            if (objectLeftData.value.boundary && objectLeftData.value.boundary.length > 0 && objectLeftData.value.boundary[pageData.value.warnArea]) {
                if (mode.value === 'h5') {
                    objDrawer.setCurrAreaIndex(pageData.value.warnArea, 'detectionArea')
                    objDrawer.setPointList(objectLeftData.value.boundary[pageData.value.warnArea].points, true)
                } else {
                    const sendXML = OCX_XML_SetOscArea(objectLeftData.value.boundary[pageData.value.warnArea].points, objectLeftData.value.regulation)
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }

            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        // 闭合区域
        const setClosed = (points: { X: number; Y: number; isClosed: boolean }[]) => {
            points?.forEach((item) => {
                item.isClosed = true
            })
        }

        const setOtherAreaClosed = () => {
            if (mode.value == 'h5') {
                // 画点-区域
                if (objectLeftData.value.boundary && objectLeftData.value.boundary.length > 0) {
                    objectLeftData.value.boundary.forEach((item) => {
                        if (item.points.length >= 3 && objDrawer.judgeAreaCanBeClosed(item.points)) {
                            setClosed(item.points)
                        }
                    })
                }
            }
        }

        // 名称输入限制
        const areaNameInput = (value: string) => {
            pageData.value.areaName = cutStringByByte(value, objectLeftData.value.maxNameLength)
            objectLeftData.value.boundary[pageData.value.warnArea].areaName = pageData.value.areaName
        }

        // 回车键失去焦点
        const enterBlur = (event: { target: { blur: () => void } }) => {
            event.target.blur()
        }

        // 常规联动多选
        const handleNormalParamCheckAll = (value: CheckboxValueType) => {
            normalParamCheckList.value = value ? normalParamList.value.map((item) => item.value) : []
            if (value) {
                objectLeftData.value.catchSnapSwitch = true
                objectLeftData.value.msgPushSwitch = true
                objectLeftData.value.buzzerSwitch = true
                objectLeftData.value.popVideoSwitch = true
                objectLeftData.value.emailSwitch = true
            }
        }

        const handleNormalParamCheck = (value: CheckboxValueType[]) => {
            normalParamCheckAll.value = value.length === normalParamList.value.length
            objectLeftData.value.catchSnapSwitch = value.includes('catchSnapSwitch')
            objectLeftData.value.msgPushSwitch = value.includes('msgPushSwitch')
            objectLeftData.value.buzzerSwitch = value.includes('buzzerSwitch')
            objectLeftData.value.popVideoSwitch = value.includes('popVideoSwitch')
            objectLeftData.value.emailSwitch = value.includes('emailSwitch')
        }

        // 录像配置相关处理
        const recordConfirm = (e: SelectOption<string, string>[]) => {
            objectLeftData.value.record = cloneDeep(e)
            pageData.value.recordIsShow = false
        }

        const recordClose = () => {
            pageData.value.recordIsShow = false
        }

        // 报警输出相关处理
        const alarmOutConfirm = (e: SelectOption<string, string>[]) => {
            objectLeftData.value.alarmOut = cloneDeep(e)
            pageData.value.alarmOutIsShow = false
        }

        const alarmOutClose = () => {
            pageData.value.alarmOutIsShow = false
        }

        // 获取联动预置点数据
        const getPresetData = async () => {
            const result = await getChlList({
                isSupportPtz: true,
            })
            let rowData = [] as PresetList[]
            commLoadResponseHandler(result, async ($) => {
                rowData = $('//content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id')!,
                        name: $item('name').text(),
                        chlType: $item('chlType').text(),
                        preset: { value: '', label: Translate('IDCS_NULL') },
                        presetList: [{ value: '', label: Translate('IDCS_NULL') }],
                        isGetPresetList: false,
                    }
                })
                rowData.forEach((row) => {
                    objectLeftData.value.preset?.forEach((item) => {
                        if (row.id == item.chl.value) {
                            row.preset = { value: item.index, label: item.name }
                            row.presetList.push({ value: item.index, label: item.name })
                        }
                    })
                })
                for (let i = rowData.length - 1; i >= 0; i--) {
                    //预置点里过滤掉recorder通道
                    if (rowData[i].chlType == 'recorder') {
                        rowData.splice(i, 1)
                    }
                }
                PresetTableData.value = rowData
            })
        }

        // 预置点选择框下拉时获取预置点列表数据
        const getPresetById = async (row: PresetList) => {
            if (!row.isGetPresetList) {
                row.presetList.splice(1)
                const sendXml = rawXml`
                    <condition>
                        <chlId>${row.id}</chlId>
                    </condition>
                `
                const result = await queryChlPresetList(sendXml)
                commLoadResponseHandler(result, ($) => {
                    $('//content/presets/item').forEach((item) => {
                        row.presetList.push({
                            value: item.attr('index')!,
                            label: item.text(),
                        })
                    })
                })
                row.isGetPresetList = true
            }
        }

        const presetChange = (row: PresetList) => {
            const ids = objectLeftData.value.preset.map((item) => item.chl.value)
            if (ids.includes(row.id)) {
                objectLeftData.value.preset = objectLeftData.value.preset.filter((item) => row.id != item.chl.value)
            }

            if (row.preset.value !== '') {
                objectLeftData.value.preset.push({
                    index: row.preset.value,
                    name: row.preset.label,
                    chl: {
                        value: row.id,
                        label: row.name,
                    },
                })
            }

            if (objectLeftData.value.preset.length > MAX_TRIGGER_PRESET_COUNT) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PRESET_LIMIT'),
                })
            }
        }

        // 检测区域合法性(物品遗留看护AI事件中：区域为多边形)
        const verification = () => {
            for (const item of objectLeftData.value.boundary) {
                const count = item.points.length
                if (count > 0 && count < 4) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'),
                    })
                    return false
                } else if (count > 0 && !judgeAreaCanBeClosed(item.points)) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_INTERSECT'),
                    })
                    return false
                }
            }
            return true
        }

        const getObjectLeftSaveData = () => {
            const sendXml = rawXml`
                <content>
                    <chl id='${prop.currChlId}' scheduleGuid='${objectLeftData.value.schedule}'>
                        <param>
                            <switch>${String(objectLeftData.value.enabledSwitch)}</switch>
                            <holdTime unit='s'>${objectLeftData.value.holdTime}</holdTime>
                            <oscType>${objectLeftData.value.oscType}</oscType>
                            <boundary type='list' count='${String(objectLeftData.value.boundary.length)}'>
                                <itemType>
                                    <point type='list'/>
                                </itemType>
                                ${objectLeftData.value.boundary
                                    .map((item) => {
                                        return rawXml`
                                            <item>
                                                <name maxLen='${objectLeftData.value.maxNameLength.toString()}'><![CDATA[${item.areaName}]]></name>
                                                <point type='list' maxCount='6' count='${String(item.points.length)}'>
                                                    ${item.points
                                                        .map((ele) => {
                                                            return rawXml`
                                                                <item>
                                                                    <X>${ele.X.toString()}</X>
                                                                    <Y>${ele.Y.toString()}</Y>
                                                                </item>`
                                                        })
                                                        .join('')}
                                                </point>
                                            </item>
                                        `
                                    })
                                    .join('')}
                            </boundary>
                        </param>
                        <trigger>
                            <sysRec>
                                <chls type='list'>
                                    ${objectLeftData.value.record
                                        .map((item) => {
                                            return `<item id='${item.value}'><![CDATA[${item.label}]]></item>`
                                        })
                                        .join('')}
                                </chls>
                            </sysRec>
                            <alarmOut>
                                <alarmOuts type='list'>
                                    ${objectLeftData.value.alarmOut
                                        .map((item) => {
                                            return `<item id='${item.value}'><![CDATA[${item.label}]]></item>`
                                        })
                                        .join('')}
                                </alarmOuts>
                            </alarmOut>
                            <preset>
                                <presets type='list'>
                                    ${objectLeftData.value.preset
                                        .map((item) => {
                                            return rawXml`
                                                <item>
                                                    <index>${item.index}</index>
                                                    <name><![CDATA[${item.name}]]></name>
                                                    <chl id='${item.chl.value}'><![CDATA[${item.chl.label}]]></chl>
                                                </item>`
                                        })
                                        .join('')}
                                </presets>
                            </preset>
                            <snapSwitch>${String(objectLeftData.value.catchSnapSwitch)}</snapSwitch>
                            <msgPushSwitch>${String(objectLeftData.value.msgPushSwitch)}</msgPushSwitch>
                            <buzzerSwitch>${String(objectLeftData.value.buzzerSwitch)}</buzzerSwitch>
                            <popVideoSwitch>${String(objectLeftData.value.popVideoSwitch)}</popVideoSwitch>
                            <emailSwitch>${String(objectLeftData.value.emailSwitch)}</emailSwitch>
                            <sysAudio id='${objectLeftData.value.sysAudio}'></sysAudio>
                        </trigger>
                    </chl>
                </content>
            `

            return sendXml
        }

        const setObjectLeftData = async () => {
            const sendXml = getObjectLeftSaveData()
            openLoading()
            const result = await editOsc(sendXml)
            closeLoading()
            const $ = queryXml(result)
            if ($('//status').text() == 'success') {
                if (objectLeftData.value.enabledSwitch) {
                    objectLeftData.value.originalSwitch = true
                }
                // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面）
                setAreaView()
                refreshInitPage()
                pageData.value.applyDisabled = true
            }
        }

        const applyObjectLeftData = () => {
            if (!verification()) return
            let isSwitchChange = false
            const switchChangeTypeArr: string[] = []
            if (objectLeftData.value.enabledSwitch && objectLeftData.value.enabledSwitch != objectLeftData.value.originalSwitch) {
                isSwitchChange = true
            }
            objectLeftData.value.mutexList?.forEach((item) => {
                if (item.status) {
                    switchChangeTypeArr.push(closeTip[item.object])
                }
            })
            if (isSwitchChange && switchChangeTypeArr.length > 0) {
                const switchChangeType = switchChangeTypeArr.join(',')
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_SIMPLE_WATCH_DETECT_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + prop.chlData.name, switchChangeType),
                }).then(() => {
                    setObjectLeftData()
                })
            } else {
                setObjectLeftData()
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        const LiveNotify2Js = ($: (path: string) => XmlResult) => {
            // 物品看护改变
            // const $xmlNote = $("statenotify[@type='OscArea']")
            const $points = $("statenotify[@type='OscArea']/points")
            const errorCode = $("statenotify[@type='OscArea']/errorCode").text()
            // 绘制点线
            if ($points.length > 0) {
                const points = [] as { X: number; Y: number }[]
                $('/statenotify/points/item').forEach((item) => {
                    points.push({ X: Number(item.attr('X')), Y: Number(item.attr('Y')) })
                })
                objectLeftData.value.boundary[pageData.value.warnArea].points = points as { X: number; Y: number; isClosed: boolean }[]
            }

            // 处理错误码
            if (errorCode == '517') {
                // 517-区域已闭合
                clearCurrentArea()
            } else if (errorCode == '515') {
                // 515-区域有相交直线，不可闭合
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_INTERSECT'),
                })
            }
        }
        onMounted(async () => {
            if (mode.value != 'h5') {
                Plugin.VideoPluginNotifyEmitter.addListener(LiveNotify2Js)
            }
            pageData.value.scheduleList = await buildScheduleList()
            await getRecordList()
            await getAlarmOutData()
            await getObjectLeftData()
            await getPresetData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                Plugin.VideoPluginNotifyEmitter.removeListener(LiveNotify2Js)
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendMinXML = OCX_XML_SetOscAreaAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendMinXML)
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }

            if (mode.value == 'h5') {
                objDrawer.destroy()
            }
        })

        watch(
            objectLeftData,
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
            ScheduleManagPop,
            supportAlarmAudioConfig,
            playerRef,
            objectLeftData,
            // 常规联动
            normalParamCheckAll,
            normalParamCheckList,
            normalParamList,
            // 联动预置点
            PresetTableData,
            pageData,
            // 播放器就绪
            handlePlayerReady,
            // tab项切换（参数设置，联动方式）
            tabChange,
            // 视频区域
            showAllArea,
            clearArea,
            clearAllArea,
            // 警戒区域切换
            warnAreaChange,
            areaNameInput,
            enterBlur,
            // 联动方式
            handleNormalParamCheckAll,
            handleNormalParamCheck,
            recordConfirm,
            recordClose,
            alarmOutConfirm,
            alarmOutClose,
            presetChange,
            getPresetById,
            // 提交物品遗留与看护数据
            applyObjectLeftData,
        }
    },
})
