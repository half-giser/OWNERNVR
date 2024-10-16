/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 17:51:22
 * @Description: 人群密度检测
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-16 11:23:01
 */
import { type chlCaps, type PresetList, type PresetItem } from '@/types/apiType/aiAndEvent'
import { type TabsPaneContext } from 'element-plus'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import { type XmlResult } from '@/utils/xmlParse'
import { cloneDeep } from 'lodash-es'
import CanvasVfd from '@/utils/canvas/canvasVfd'
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
            type: Array as PropType<{ value: string; label: string }[]>,
            required: true,
        },
        onlineChannelList: {
            type: Array as PropType<{ id: string; ip: string; name: string; accessType: string }[]>,
            required: true,
        },
    },
    setup(props) {
        const { openLoading, closeLoading } = useLoading()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const playerRef = ref<PlayerInstance>()
        const pluginStore = usePluginStore()
        const osType = getSystemInfo().platform
        let cddDrawer: CanvasVfd
        const pageData = ref<{ [key: string]: any }>({
            // 当前选中的通道
            currChlId: '',
            // 当前选择通道数据
            chlData: {} as chlCaps,
            // 声音列表
            voiceList: [] as { value: string; label: string }[],
            // 是否支持声音设置
            supportAlarmAudioConfig: true,
            // 默认声音id
            defaultAudioId: '{00000000-0000-0000-0000-000000000000}',
            // 不支持功能提示页面是否展示
            notSupportTipShow: false,
            // 请求数据失败显示提示
            requireDataFail: false,
            // apply按钮是否可用
            applyDisable: true,
            // 排程管理
            schedule: '',
            scheduleManagePopOpen: false,
            scheduleDefaultId: '{00000000-0000-0000-0000-000000000000}',
            scheduleList: [] as SelectOption<string, string>[],
            // record数据源
            recordSource: [] as { value: string; label: string }[],
            // alarmOut数据源
            alarmOutSource: [] as { value: string; label: string; device: { value: string; label: string } }[],
            // 是否启用侦测
            detectionEnable: false,
            // 用于对比
            originalEnable: false,
            isSwitchChange: false,
            // 选择的功能:param、trigger
            fuction: 'param',
            // 播放器相关
            // 通知列表
            notification: [] as string[],
            // TODO 是否显示绘制控制按钮 老代码写死不显示 并且允许画图
            showDrawAvailable: false,
            // 是否允许绘制 老代码写死允许画图
            isDrawAvailable: true,
            // 持续时间
            holdTime: 0,
            holdTimeList: [] as { value: number; label: string }[],
            // 刷新频率
            refreshFrequency: 0,
            refreshFrequencyList: [] as { value: number; label: string }[],
            // 报警阈值
            triggerAlarmLevel: 0,
            // mutex
            mutexList: [] as { object: string; status: boolean }[],
            regionInfo: [] as { X1: number; X2: number; Y1: number; Y2: number }[],
            triggerSwitch: false,
            snapSwitch: false,
            msgPushSwitch: false,
            buzzerSwitch: false,
            popVideoSwitch: false,
            emailSwitch: false,
            sysAudio: '',
            record: {
                switch: false,
                chls: [] as { value: string; label: string }[],
            },
            // 选中的record id
            recordList: [] as string[],
            recordIsShow: false,
            recordHeaderTitle: 'IDCS_TRIGGER_CHANNEL_RECORD',
            recordSourceTitle: 'IDCS_CHANNEL',
            recordTargetTitle: 'IDCS_CHANNEL_TRGGER',
            recordType: 'record',

            alarmOut: {
                switch: false,
                chls: [] as { value: string; label: string }[],
            },
            // 选中的alarmOut id
            alarmOutList: [] as string[],
            alarmOutIsShow: false,
            alarmOutHeaderTitle: 'IDCS_TRIGGER_ALARM_OUT',
            alarmOutSourceTitle: 'IDCS_ALARM_OUT',
            alarmOutTargetTitle: 'IDCS_TRIGGER_ALARM_OUT',
            alarmOutType: 'alarmOut',

            preset: {
                switch: false,
                presets: [] as PresetItem[],
            },
            presetSource: [] as PresetList[],

            initComplete: false,
            drawInitCount: 0,
            eventTypeMapping: {
                faceDetect: Translate('IDCS_FACE_DETECTION') + '+' + Translate('IDCS_FACE_RECOGNITION'),
                faceMatch: Translate('IDCS_FACE_RECOGNITION'),
                tripwire: Translate('IDCS_BEYOND_DETECTION'),
                perimeter: Translate('IDCS_INVADE_DETECTION'),
            } as Record<string, string>,
            closeTip: {
                cdd: Translate('IDCS_CROWD_DENSITY_DETECTION'),
                cpc: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
                ipd: Translate('IDCS_INVADE_DETECTION'),
                tripwire: Translate('IDCS_BEYOND_DETECTION'),
                osc: Translate('IDCS_WATCH_DETECTION'),
                avd: Translate('IDCS_ABNORMAL_DETECTION'),
                perimeter: Translate('IDCS_INVADE_DETECTION'),
                vfd: Translate('IDCS_FACE_DETECTION'),
                aoientry: Translate('IDCS_INVADE_DETECTION'),
                aoileave: Translate('IDCS_INVADE_DETECTION'),
                passlinecount: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
                vehicle: Translate('IDCS_PLATE_DETECTION'),
                fire: Translate('IDCS_FIRE_POINT_DETECTION'),
                vsd: Translate('IDCS_VSD_DETECTION'),
            } as Record<string, string>,
            directionTypeTip: {
                none: 'A<->B',
                rightortop: 'A->B',
                leftorbotton: 'A<-B',
            } as Record<string, string>,
        })
        const triggerData = ref<{ value: boolean; label: string; property: string }[]>([
            { value: pageData.value.snapSwitch, label: 'IDCS_SNAP', property: 'snapSwitch' },
            { value: pageData.value.msgPushSwitch, label: 'IDCS_PUSH', property: 'msgPushSwitch' },
            { value: pageData.value.buzzerSwitch, label: 'IDCS_BUZZER', property: 'buzzerSwitch' },
            { value: pageData.value.popVideoSwitch, label: 'IDCS_VIDEO_POPUP', property: 'popVideoSwitch' },
            { value: pageData.value.emailSwitch, label: 'IDCS_EMAIL', property: 'emailSwitch' },
        ])
        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']
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
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                if (playerRef.value) {
                    const canvas = playerRef.value.player.getDrawbordCanvas(0)
                    cddDrawer = new CanvasVfd({
                        el: canvas,
                        onchange: cddAreaChange,
                    })
                }
                if (isHttpsLogin()) {
                    pageData.value.notification = [formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`)]
                }
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
                plugin.AddPluginMoveEvent(document.getElementById('player')!)
                const sendXML = OCX_XML_SetPluginModel(osType == 'mac' ? 'FireConfig' : 'ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                plugin.DisplayOCX(true)
            }
        }
        //播放视频
        const play = () => {
            const { id, name } = pageData.value.chlData
            if (mode.value === 'h5') {
                player.play({
                    chlID: id,
                    streamType: 2,
                })
            } else if (mode.value === 'ocx') {
                if (osType == 'mac') {
                    const sendXML = OCX_XML_Preview({
                        winIndexList: [0],
                        chlIdList: [pageData.value.chlData['id']],
                        chlNameList: [pageData.value.chlData['name']],
                        streamType: 'sub',
                        chlIndexList: [pageData.value.chlData['id']],
                        chlTypeList: [pageData.value.chlData['chlType']],
                    })
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    plugin.RetryStartChlView(id, name)
                }
            }
        }
        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && pageData.value.initComplete) {
                nextTick(() => {
                    play()
                    setOcxData()
                })
                stopWatchFirstPlay()
            }
        })
        // 对sheduleList进行处理
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
            pageData.value.scheduleList.map((item: any) => {
                item.value = item.value != '' ? item.value : pageData.value.scheduleDefaultId
            })
        }
        // 获取recordList
        const getRecordList = async () => {
            pageData.value.recordSource = []
            const resb = await getChlList({
                nodeType: 'chls',
                isSupportSnap: false,
            })
            const res = queryXml(resb)
            if (res('status').text() == 'success') {
                res('//content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    pageData.value.recordSource.push({
                        value: item.attr('id'),
                        label: $item('name').text(),
                    })
                })
            }
        }
        // 获取alarmOutList
        const getAlarmOutList = async () => {
            pageData.value.alarmOutSource = []
            const resb = await getChlList({
                requireField: ['device'],
                nodeType: 'alarmOuts',
            })
            const res = queryXml(resb)
            if (res('status').text() == 'success') {
                res('//content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    let name = $item('name').text()
                    if ($item('devDesc').text()) {
                        name = $item('devDesc').text() + '-' + name
                    }
                    pageData.value.alarmOutSource.push({
                        value: item.attr('id'),
                        label: name,
                        device: {
                            value: $item('device').attr('id'),
                            label: $item('device').text(),
                        },
                    })
                })
            }
        }
        // 获取preset
        const getPresetList = async () => {
            const sendXml = rawXml`
                <types>
                    <nodeType>
                        <enum>chls</enum>
                        <enum>sensors</enum>
                        <enum>alarmOuts</enum>
                    </nodeType>
                </types>
                <nodeType type="nodeType">chls</nodeType>
                <requireField>
                    <name/>
                    <chlType/>
                </requireField>
                <condition>
                    <supportPtz/>
                </condition>
            `
            const result = await queryNodeList(getXmlWrapData(sendXml))

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
                    pageData.value.preset.presets.forEach((item: PresetItem) => {
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
                pageData.value.presetSource = rowData
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
                    $('/response/content/presets/item').forEach((item) => {
                        row.presetList.push({
                            value: item.attr('index')!,
                            label: item.text(),
                        })
                    })
                })
                row.isGetPresetList = true
            }
        }
        // tripwire常规联动全选/全不选
        const handleTriggerSwitch = () => {
            pageData.value.applyDisable = false
            if (pageData.value.triggerSwitch) {
                triggerData.value.forEach((item) => {
                    item.value = true
                    const property = item.property + ''
                    if (property in pageData.value) {
                        pageData.value[property] = true
                    }
                })
            } else {
                triggerData.value.forEach((item) => {
                    item.value = false
                    const property = item.property
                    if (property in pageData.value) {
                        pageData.value[property] = false
                    }
                })
            }
        }
        // 单个联动选择
        const handleTrigger = (item: { value: boolean; label: string; property: string }) => {
            pageData.value.applyDisable = false
            const property = item.property
            if (property in pageData.value) {
                pageData.value[property] = item.value
            }
            const triggerSwitch = triggerData.value.every((item) => item.value)
            pageData.value.triggerSwitch = triggerSwitch
        }
        // 设置record
        const recordConfirm = (e: { value: string; label: string }[]) => {
            pageData.value.applyDisable = false
            if (e.length !== 0) {
                pageData.value.record.chls = cloneDeep(e)
                const chls = pageData.value.record.chls
                pageData.value.recordList = chls.map((item: { value: string; label: string }) => item.value)
            } else {
                pageData.value.record.chls = []
                pageData.value.recordList = []
                pageData.value.record.switch = false
            }
            pageData.value.recordIsShow = false
        }
        // record弹窗关闭
        const recordClose = () => {
            if (!pageData.value.record.chls.length) {
                pageData.value.record.chls = []
                pageData.value.recordList = []
                pageData.value.record.switch = false
            }
            pageData.value.recordIsShow = false
        }
        // 设置alarmOut
        const alarmOutConfirm = (e: { value: string; label: string }[]) => {
            pageData.value.applyDisable = false
            if (e.length !== 0) {
                pageData.value.alarmOut.chls = cloneDeep(e)
                const chls = pageData.value.alarmOut.chls
                pageData.value.alarmOutList = chls.map((item: { value: string; label: string }) => item.value)
            } else {
                pageData.value.alarmOut.chls = []
                pageData.value.alarmOutList = []
                pageData.value.alarmOut.switch = false
            }
            pageData.value.alarmOutIsShow = false
        }
        // alarmOut弹窗关闭
        const alarmOutClose = () => {
            if (!pageData.value.alarmOut.chls.length) {
                pageData.value.alarmOut.chls = []
                pageData.value.alarmOutList = []
                pageData.value.alarmOut.switch = false
            }
            pageData.value.alarmOutIsShow = false
        }
        // tab点击事件
        const handleFunctionTabClick = async (pane: TabsPaneContext) => {
            pageData.value.fuction = pane.props.name?.toString() ? pane.props.name?.toString() : ''
            if (pageData.value.fuction == 'param') {
                setOcxData()
            }
        }
        // 格式化持续时间
        const formatHoldTime = (holdTimeList: string[]) => {
            const timeList: { value: number; label: string }[] = []
            holdTimeList.forEach((ele) => {
                const element = Number(ele)
                const itemText = element == 60 ? '1 ' + Translate('IDCS_MINUTE') : element > 60 ? element / 60 + ' ' + Translate('IDCS_MINUTES') : element + ' ' + Translate('IDCS_SECONDS')
                timeList.push({ value: element, label: itemText })
            })
            timeList.sort((a, b) => a.value - b.value)
            return timeList
        }
        const getData = async () => {
            const sendXml = rawXml` <condition>
                                        <chlId>${pageData.value.currChlId}</chlId>
                                    </condition>
                                    <requireField>
                                        <param/>
                                        <trigger/>
                                    </requireField>`
            openLoading()
            const res = await queryCdd(sendXml)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                const holdTimeArr = $('//content/chl/param/holdTimeNote').text().split(',')
                let holdTimeList = formatHoldTime(holdTimeArr)
                const holdTime = Number($('//content/chl/param/alarmHoldTime').text())
                if (!holdTimeArr.includes(holdTime.toString())) {
                    holdTimeArr.push(holdTime.toString())
                    holdTimeList = formatHoldTime(holdTimeArr)
                }
                const refreshFrequencyList: { value: number; label: string }[] = []
                $('//types/refreshFrequency/enum').forEach((item) => {
                    const ele = Number(item.text()) / 1000
                    const itemText = ele + ' ' + Translate('IDCS_SECONDS')
                    refreshFrequencyList.push({ value: Number(item.text()), label: itemText })
                })
                const mutexList: { object: string; status: boolean }[] = []
                $('//content/trigger/mutexList/item').forEach((item) => {
                    mutexList.push({
                        object: item.text(),
                        status: item.attr('status') == 'true',
                    })
                })
                const regionInfo: { X1: number; X2: number; Y1: number; Y2: number }[] = []
                $('//content/chl/param/regionInfo/item').forEach((item) => {
                    const $ = queryXml(item.element)
                    regionInfo.push({
                        X1: Number($('X1').text()),
                        X2: Number($('X2').text()),
                        Y1: Number($('Y1').text()),
                        Y2: Number($('Y2').text()),
                    })
                })
                const enabledSwitch = $('//content/chl/param/switch').text() == 'true'
                const refreshFrequency = $('//content/chl/param/detectFrequency').text()
                const triggerAlarmLevel = $('//content/chl/param/triggerAlarmLevel').text()
                let schedule = $('//content/chl').attr('scheduleGuid')
                schedule =
                    schedule != ''
                        ? pageData.value.scheduleList.some((item: { value: string; label: string }) => item.value == schedule)
                            ? schedule
                            : pageData.value.scheduleDefaultId
                        : pageData.value.scheduleDefaultId
                $('//content/chl/trigger').forEach((item) => {
                    const $item = queryXml(item.element)
                    pageData.value.snapSwitch = $item('snapSwitch').text() == 'true'
                    pageData.value.msgPushSwitch = $item('msgPushSwitch').text() == 'true'
                    pageData.value.buzzerSwitch = $item('buzzerSwitch').text() == 'true'
                    pageData.value.popVideoSwitch = $item('popVideoSwitch').text() == 'true'
                    pageData.value.emailSwitch = $item('emailSwitch').text() == 'true'
                    pageData.value.sysAudio = $item('sysAudio').attr('id') == '' ? $item('sysAudio').attr('id') : ''
                    pageData.value.record = {
                        switch: $item('sysRec/switch').text() == 'true',
                        chls: $item('sysRec/chls/item').map((item) => {
                            return {
                                value: item.attr('id'),
                                label: item.text(),
                            }
                        }),
                    }
                    pageData.value.recordList = pageData.value.record.chls.map((item: { value: string; label: string }) => item.value)
                    pageData.value.alarmOut = {
                        switch: $item('alarmOut/switch').text() == 'true',
                        chls: $item('alarmOut/alarmOuts/item').map((item) => {
                            return {
                                value: item.attr('id'),
                                label: item.text(),
                            }
                        }),
                    }
                    pageData.value.alarmOutList = pageData.value.alarmOut.chls.map((item: { value: string; label: string }) => item.value)
                    pageData.value.preset = {
                        switch: $item('preset/switch').text() == 'true',
                        presets: $item('preset/presets/item').map((item) => {
                            const $ = queryXml(item.element)
                            return {
                                index: $('index').text(),
                                name: $('name').text(),
                                chl: {
                                    value: $('chl').attr('id'),
                                    label: $('chl').text(),
                                },
                            }
                        }),
                    }
                })
                triggerData.value = [
                    { value: pageData.value.snapSwitch, label: 'IDCS_SNAP', property: 'snapSwitch' },
                    { value: pageData.value.msgPushSwitch, label: 'IDCS_PUSH', property: 'msgPushSwitch' },
                    { value: pageData.value.buzzerSwitch, label: 'IDCS_BUZZER', property: 'buzzerSwitch' },
                    { value: pageData.value.popVideoSwitch, label: 'IDCS_VIDEO_POPUP', property: 'popVideoSwitch' },
                    { value: pageData.value.emailSwitch, label: 'IDCS_EMAIL', property: 'emailSwitch' },
                ]
                pageData.value.holdTime = holdTime
                pageData.value.holdTimeList = holdTimeList
                pageData.value.refreshFrequency = Number(refreshFrequency)
                pageData.value.refreshFrequencyList = refreshFrequencyList
                pageData.value.triggerAlarmLevel = Number(triggerAlarmLevel)
                pageData.value.mutexList = mutexList
                pageData.value.regionInfo = regionInfo
                pageData.value.detectionEnable = enabledSwitch
                pageData.value.originalEnable = enabledSwitch
                pageData.value.schedule = schedule
            } else {
                // pageData.value.requireDataFail = true
            }
        }
        const saveData = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${pageData.value.currChlId}" scheduleGuid="${pageData.value['schedule']}">
                        <param>
                            <switch>${pageData.value['detectionEnable'].toString()}</switch>
                            <holdTime unit="s">${pageData.value['holdTime'].toString()}</holdTime>
                            <detectFrequency>${pageData.value['refreshFrequency'].toString()}</detectFrequency>
                            <triggerAlarmLevel>${pageData.value['triggerAlarmLevel'].toString()}</triggerAlarmLevel>
                            <regionInfo type="list">
                                <item type="rectangle">
                                    <X1 type="uint32">${Math.round(pageData.value['regionInfo'][0]['X1']).toString()}</X1>
                                    <Y1 type="uint32">${Math.round(pageData.value['regionInfo'][0]['Y1']).toString()}</Y1>
                                    <X2 type="uint32">${Math.round(pageData.value['regionInfo'][0]['X2']).toString()}</X2>
                                    <Y2 type="uint32">${Math.round(pageData.value['regionInfo'][0]['Y2']).toString()}</Y2>
                                </item>
                            </regionInfo>
                        </param>
                        <trigger>
                            <sysRec>
                                <chls type="list">
                                    ${pageData.value['record']['chls']
                                        .map(
                                            (element: { value: string; label: string }) => rawXml`
                                        <item id="${element['value']}">
                                            <![CDATA[${element['label']}]]>
                                        </item>
                                    `,
                                        )
                                        .join('')}
                                </chls>
                            </sysRec>
                            <alarmOut>
                                <alarmOuts type="list">
                                    ${pageData.value['alarmOut']['chls']
                                        .map(
                                            (element: { value: string; label: string }) => rawXml`
                                        <item id="${element['value']}">
                                            <![CDATA[${element['label']}]]>
                                        </item>
                                    `,
                                        )
                                        .join('')}
                                </alarmOuts>
                            </alarmOut>
                            <preset>
                                <presets type="list">
                                    ${pageData.value['presetSource']
                                        .map((element: PresetList) =>
                                            element['preset']['value']
                                                ? rawXml`
                                        <item>
                                            <index>${element['preset']['value']}</index>
                                            <name><![CDATA[${element['preset']['label']}]]></name>
                                            <chl id="${element['id']}">
                                                <![CDATA[${element['name']}]]>
                                            </chl>
                                        </item>
                                    `
                                                : '',
                                        )
                                        .join('')}
                                </presets>
                            </preset>
                            <snapSwitch>${pageData.value['snapSwitch'].toString()}</snapSwitch>
                            <msgPushSwitch>${pageData.value['msgPushSwitch'].toString()}</msgPushSwitch>
                            <buzzerSwitch>${pageData.value['buzzerSwitch'].toString()}</buzzerSwitch>
                            <popVideoSwitch>${pageData.value['popVideoSwitch'].toString()}</popVideoSwitch>
                            <emailSwitch>${pageData.value['emailSwitch'].toString()}</emailSwitch>
                            <sysAudio id='${pageData.value['sysAudio']}'></sysAudio>
                        </trigger>
                    </chl>
                </content>
            `
            openLoading()
            const res = await editCdd(sendXml)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                // NT-9292 开关为开把originalSwitch置为true避免多次弹出互斥提示
                if (pageData.value['detectionEnable']) {
                    pageData.value['originalEnable'] = true
                }
                pageData.value.applyDisable = true
            }
        }
        const handleApply = async () => {
            let isSwitchChange = false
            let switchChangeType = ''
            if (pageData.value['detectionEnable'] && pageData.value['detectionEnable'] != pageData.value['originalEnable']) {
                isSwitchChange = true
            }
            pageData.value['mutexList'].forEach((ele: { object: string; status: boolean }) => {
                if (ele['status']) {
                    switchChangeType = ele['object']
                }
            })
            if (isSwitchChange && switchChangeType) {
                openMessageTipBox({
                    type: 'question',
                    message: Translate('IDCS_SIMPLE_CROWD_DETECT_TIPS').formatForLang(
                        Translate('IDCS_CHANNEL') + ':' + pageData.value['chlData']['name'],
                        pageData.value['closeTip'][switchChangeType],
                    ),
                }).then(() => {
                    saveData()
                })
            } else {
                saveData()
            }
        }
        // 初始化页面数据
        const initPageData = async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            pageData.value.currChlId = props.currChlId
            pageData.value.chlData = props.chlData
            pageData.value.voiceList = props.voiceList
            await getScheduleList()
            await getRecordList()
            await getAlarmOutList()
            await getData()
            pageData.value.initComplete = true
            await getPresetList()
            if (mode.value === 'h5') {
                cddDrawer.setEnable(true)
            } else {
                plugin.VideoPluginNotifyEmitter.addListener(LiveNotify2Js)
                const sendXML = OCX_XML_SetCddAreaAction('EDIT_ON')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        const handleDrawAvailableChange = () => {
            if (pageData.value.isDrawAvailable) {
                cddDrawer.setEnable(true)
            } else {
                cddDrawer.setEnable(false)
            }
        }
        const cddAreaChange = (data: { X1: number; X2: number; Y1: number; Y2: number }) => {
            pageData.value.regionInfo = [data]
            pageData.value.applyDisable = false
        }
        const setOcxData = () => {
            if (pageData.value['regionInfo'].length > 0) {
                if (mode.value === 'h5') {
                    cddDrawer.setArea(pageData.value['regionInfo'][0])
                } else {
                    const sendXML = OCX_XML_SetCddArea(pageData.value['regionInfo'][0])
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }
        }
        const clearArea = () => {
            if (mode.value === 'h5') {
                cddDrawer.clear()
            } else {
                const sendXML = OCX_XML_SetCddAreaAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            pageData.value['regionInfo'][0] = { X1: 0, X2: 0, Y1: 0, Y2: 0 }
            pageData.value.applyDisable = false
        }
        const LiveNotify2Js = ($: (path: string) => XmlResult) => {
            const $xmlNote = $("statenotify[@type='CddParam']")
            if ($xmlNote.length > 0) {
                const points: { X1: number; X2: number; Y1: number; Y2: number }[] = []
                $('statenotify/item').forEach((element) => {
                    const $ = queryXml(element.element)
                    points.push({ X1: Number($('X1').text()), Y1: Number($('Y1').text()), X2: Number($('X2').text()), Y2: Number($('Y2').text()) })
                })
                pageData.value['regionInfo'] = points
                pageData.value.applyDisable = false
            }
        }
        onMounted(async () => {
            await initPageData()
        })
        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                plugin.VideoPluginNotifyEmitter.removeListener(LiveNotify2Js)
                const sendAreaXML = OCX_XML_SetCddAreaAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendAreaXML)
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                plugin.CloseCurPlugin(document.getElementById('player'))
            }
            if (mode.value === 'h5') {
                player.destroy()
            }
        })
        return {
            pageData,
            playerRef,
            triggerData,
            handlePlayerReady,
            handleTriggerSwitch,
            handleTrigger,
            recordConfirm,
            recordClose,
            alarmOutConfirm,
            alarmOutClose,
            getPresetById,
            handleFunctionTabClick,
            handleApply,
            handleDrawAvailableChange,
            clearArea,
            ScheduleManagPop,
        }
    },
})
