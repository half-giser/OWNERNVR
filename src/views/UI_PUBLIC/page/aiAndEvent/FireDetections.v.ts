/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-11 14:16:37
 * @Description: 火点检测
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-14 17:18:49
 */
import { type chlCaps, type aiResourceRow, type PresetList, type PresetItem } from '@/types/apiType/aiAndEvent'
import { type TabsPaneContext } from 'element-plus'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import { cloneDeep } from 'lodash-es'
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
        const aiResourceTableData = ref<aiResourceRow[]>([])

        const playerRef = ref<PlayerInstance>()
        const pluginStore = usePluginStore()
        const osType = getSystemInfo().platform
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
            // 是否显示ai设置按钮
            showAiConfig: false,
            // AI详情弹窗
            aiResourcePopOpen: false,
            // 总ai资源占用率
            totalResourceOccupancy: '0.00',
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
            // snap数据源
            snapSource: [] as { value: string; label: string }[],
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

            // 持续时间
            holdTime: 0,
            holdTimeList: [] as { value: number; label: string }[],
            // mutex
            mutexList: [] as { object: string; status: boolean }[],
            mutexListEx: [] as { object: string; status: boolean }[],
            triggerSwitch: false,
            snapSwitch: false,
            msgPushSwitch: false,
            buzzerSwitch: false,
            popVideoSwitch: false,
            emailSwitch: false,
            popMsgSwitch: false,
            // 音频联动
            audioSuport: false,
            triggerAudio: false,
            // 白光联动
            lightSuport: false,
            triggerWhiteLight: false,
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

            snap: {
                switch: false,
                chls: [] as { value: string; label: string }[],
            },
            // snap穿梭框数据源
            snapList: [] as { value: string; label: string }[],
            snapIsShow: false,
            snapHeaderTitle: 'IDCS_TRIGGER_CHANNEL_SNAP',
            snapSourceTitle: 'IDCS_CHANNEL',
            snapTargetTitle: 'IDCS_CHANNEL_TRGGER',
            snapType: 'snap',

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
            { value: pageData.value.msgPushSwitch, label: 'IDCS_PUSH', property: 'msgPushSwitch' },
            { value: pageData.value.buzzerSwitch, label: 'IDCS_BUZZER', property: 'buzzerSwitch' },
            { value: pageData.value.popVideoSwitch, label: 'IDCS_VIDEO_POPUP', property: 'popVideoSwitch' },
            { value: pageData.value.emailSwitch, label: 'IDCS_EMAIL', property: 'emailSwitch' },
            { value: pageData.value.popMsgSwitch, label: 'IDCS_MESSAGEBOX_POPUP', property: 'popMsgSwitch' },
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
        // 获取AI资源请求
        const getAIResourceData = async (isEdit: boolean) => {
            let sendXml = ''
            if (isEdit) {
                sendXml = rawXml`
                    <content>
                        <chl>
                            <item id="${pageData.value.currChlId}">
                                <eventType>tripwire</eventType>
                                <switch>${pageData.value.detectionEnable.toString()}</switch>
                            </item>
                        </chl>
                    </content>`
            }
            const res = await queryAIResourceDetail(sendXml)
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                const tempResourceOccupancy = Number($('//content/totalResourceOccupancy').text())
                if (tempResourceOccupancy * 1 <= 100) {
                    aiResourceTableData.value = []
                    pageData.value.totalResourceOccupancy = tempResourceOccupancy.toFixed(2)
                    $('//content/chl/item').forEach((element) => {
                        const $item = queryXml(element.element)
                        const id = element.attr('id')
                        let name = $item('name').text()
                        // 通道是否在线
                        const connectState = $item('connectState').text() == 'true'
                        name = connectState ? name : name + '(' + Translate('IDCS_OFFLINE') + ')'
                        $item('resource/item').forEach((ele) => {
                            const eventType: string[] = ele.attr('eventType') ? ele.attr('eventType')!.split(',') : []
                            const eventTypeText = eventType
                                .map((item) => {
                                    return pageData.value.eventTypeMapping[item]
                                })
                                .join('+')
                            const percent = ele.text() + '%'
                            const decodeResource = ele.attr('occupyDecodeCapPercent')
                                ? ele.attr('occupyDecodeCapPercent') == 'notEnough'
                                    ? Translate('IDCS_NO_DECODE_RESOURCE')
                                    : ele.attr('occupyDecodeCapPercent') + '%'
                                : '--'
                            aiResourceTableData.value.push({
                                id: id ? id : '',
                                name: name,
                                eventType: eventType,
                                eventTypeText: eventTypeText,
                                percent: percent,
                                decodeResource: decodeResource,
                            })
                        })
                    })
                } else {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_NO_RESOURCE'),
                    })
                    // 资源占用率超过100
                    pageData.value.detectionEnable = false
                }
            }
        }
        // 删除AI资源请求
        const deleteAIResource = async (row: aiResourceRow) => {
            let sendXml = rawXml`<content>
                                    <chl id="${row.id}">
                                        <param>`
            row.eventType.forEach((item) => {
                sendXml += rawXml`<item>${item}</item>`
            })
            sendXml += rawXml`</param>
                            </chl>
                        </content>`
            openLoading()
            const res = await freeAIOccupyResource(sendXml)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                aiResourceTableData.value.splice(aiResourceTableData.value.indexOf(row), 1)
            }
        }
        // 点击释放AI资源
        const handleAIResourceDel = async (row: aiResourceRow) => {
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(() => {
                deleteAIResource(row)
                pageData.value.applyDisable = false
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
                        value: item.attr('id')!,
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
        // 获取snap
        const getSnapList = async () => {
            getChlList({
                nodeType: 'chls',
                isSupportSnap: true,
            }).then(async (resb) => {
                const res = queryXml(resb)
                if (res('status').text() == 'success') {
                    res('//content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        pageData.value.snapSource.push({
                            value: item.attr('id'),
                            label: $item('name').text(),
                        })
                    })
                }
                if (pageData.value.snapSource.length > 0) {
                    pageData.value.snapSwitch = true
                }
            })
        }
        // 获取preset
        const getPresetList = async () => {
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
                    }
                })
                rowData.forEach((row) => {
                    pageData.value.preset.presets.forEach((item: PresetItem) => {
                        if (row.id == item.chl.value) {
                            row.preset = { value: item.index, label: item.name }
                        }
                    })
                })

                for (let i = rowData.length - 1; i >= 0; i--) {
                    //预置点里过滤掉recorder通道
                    if (rowData[i].chlType == 'recorder') {
                        rowData.splice(i, 1)
                    } else {
                        await getPresetById(rowData[i])
                        rowData[i].presetList.push({ value: '', label: Translate('IDCS_NULL') })
                    }
                }

                pageData.value.presetSource = rowData
            })
        }
        // 获取预置点
        const getPresetById = async (row: PresetList) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${row.id}</chlId>
                </condition>
            `
            row.presetList = []
            const result = await queryChlPresetList(sendXml)
            commLoadResponseHandler(result, ($) => {
                $('/response/content/presets/item').forEach((item) => {
                    row.presetList.push({
                        value: item.attr('index')!,
                        label: item.text(),
                    })
                })
            })
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
        // 设置snap
        const snapConfirm = (e: { value: string; label: string }[]) => {
            pageData.value.applyDisable = false
            if (e.length !== 0) {
                pageData.value.snap.chls = cloneDeep(e)
                const chls = pageData.value.snap.chls
                pageData.value.snapList = chls.map((item: { value: string; label: string }) => item.value)
            } else {
                pageData.value.snap.chls = []
                pageData.value.snapList = []
                pageData.value.snap.switch = false
            }
            pageData.value.snapIsShow = false
        }
        // snap弹窗关闭
        const snapClose = () => {
            if (!pageData.value.snap.chls.length) {
                pageData.value.snap.chls = []
                pageData.value.snapList = []
                pageData.value.snap.switch = false
            }
            pageData.value.snapIsShow = false
        }
        // tab点击事件
        const handleFunctionTabClick = async (pane: TabsPaneContext) => {
            pageData.value.fuction = pane.props.name?.toString() ? pane.props.name?.toString() : ''
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
        // 获取mutexobj
        const getMutexChlNameObj = () => {
            let normalChlName = ''
            let thermalChlName = ''
            const sameIPChlList: { id: string; ip: string; name: string; accessType: string }[] = []
            const chlIp = pageData.value.chlData['ip']
            props.onlineChannelList.forEach((chl) => {
                if (chl['ip'] == chlIp) {
                    sameIPChlList.push(chl)
                }
            })
            if (sameIPChlList.length > 1) {
                sameIPChlList.forEach((chl) => {
                    if (chl['accessType'] == '1') {
                        thermalChlName = chl['name'] == pageData.value.chlData['name'] ? '' : chl['name']
                    } else {
                        normalChlName = chl['name'] == pageData.value.chlData['name'] ? '' : chl['name']
                    }
                })
            }
            return {
                normalChlName: normalChlName,
                thermalChlName: thermalChlName,
            }
        }
        // 获取火点数据
        const getData = async () => {
            const sendXml = rawXml` 
                <condition>
                    <chlId>${pageData.value.currChlId}</chlId>
                </condition>
                <requireField>
                    <param/>
                    <trigger/>
                </requireField>`
            openLoading()
            const res = await querySmartFireConfig(sendXml)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                pageData.value.mutexList = $('//content/chl/param/mutexList/item').map((item) => {
                    const $item = queryXml(item.element)
                    return { object: $item('object').text(), status: $item('status').text() == 'true' ? true : false }
                })
                const mutexListEx = $('//content/chl/param/mutexListEx/item').map((item) => {
                    const $item = queryXml(item.element)
                    return { object: $item('object').text(), status: $item('status').text() == 'true' ? true : false }
                })
                pageData.value.mutexListEx = mutexListEx ? mutexListEx : []
                const holdTimeArr = $('//content/chl/param/holdTimeNote').text().split(',')
                pageData.value.holdTimeList = formatHoldTime(holdTimeArr)
                pageData.value.holdTime = Number($('//content/chl/param/alarmHoldTime').text())
                if (!holdTimeArr.includes(pageData.value.holdTime.toString())) {
                    holdTimeArr.push(pageData.value.holdTime.toString())
                    pageData.value.holdTimeList = formatHoldTime(holdTimeArr)
                }
                pageData.value.applyDisable = true
                const schedule = $('//content/chl').attr('scheduleGuid')
                pageData.value.schedule =
                    schedule != ''
                        ? pageData.value.scheduleList.some((item: { value: string; label: string }) => item.value == schedule)
                            ? schedule
                            : pageData.value.scheduleDefaultId
                        : pageData.value.scheduleDefaultId
                pageData.value.detectionEnable = $('//content/chl/param/switch').text() == 'true'
                pageData.value.originalEnable = pageData.value.detectionEnable
                pageData.value.audioSuport = $('//content/chl/param/triggerAudio').text() == '' ? false : true
                pageData.value.triggerAudio = $('//content/chl/param/triggerAudio').text() == 'true'
                pageData.value.lightSuport = $('//content/chl/param/triggerWhiteLight').text() == '' ? false : true
                pageData.value.triggerWhiteLight = $('//content/chl/param/triggerWhiteLight').text() == 'true'
                $('//content/chl/trigger').forEach((item) => {
                    const $item = queryXml(item.element)
                    pageData.value.snapSwitch = $item('snapSwitch').text() == 'true'
                    pageData.value.msgPushSwitch = $item('msgPushSwitch').text() == 'true'
                    pageData.value.buzzerSwitch = $item('buzzerSwitch').text() == 'true'
                    pageData.value.popVideoSwitch = $item('popVideoSwitch').text() == 'true'
                    pageData.value.emailSwitch = $item('emailSwitch').text() == 'true'
                    pageData.value.popMsgSwitch = $item('popMsgSwitch').text() == 'true'
                    pageData.value.sysAudio = $item('sysAudio').attr('id') == '' ? $item('sysAudio').attr('id') : ''
                    pageData.value.record = {
                        switch: $item('sysRec/switch').text() == 'true',
                        chls: $item('sysRec/chls/item').map((item) => {
                            return {
                                value: item.attr('id')!,
                                label: item.text(),
                            }
                        }),
                    }
                    pageData.value.recordList = pageData.value.record.chls.map((item: { value: string; label: string }) => item.value)
                    pageData.value.alarmOut = {
                        switch: $item('alarmOut/switch').text() == 'true',
                        chls: $item('alarmOut/alarmOuts/item').map((item) => {
                            return {
                                value: item.attr('id')!,
                                label: item.text(),
                            }
                        }),
                    }
                    pageData.value.alarmOutList = pageData.value.alarmOut.chls.map((item: { value: string; label: string }) => item.value)
                    pageData.value.snap = {
                        switch: $item('sysSnap/switch').text() == 'true',
                        chls: $item('sysSnap/chls/item').map((item) => {
                            return {
                                value: item.attr('id')!,
                                label: item.text(),
                            }
                        }),
                    }
                    pageData.value.snapList = pageData.value.snap.chls.map((item: { value: string; label: string }) => item.value)
                    pageData.value.preset = {
                        switch: $item('preset/switch').text() == 'true',
                        presets: $item('preset/presets/item').map((item) => {
                            const $ = queryXml(item.element)
                            return {
                                index: $('index').text(),
                                name: $('name').text(),
                                chl: {
                                    value: $('chl').attr('id')!,
                                    label: $('chl').text(),
                                },
                            }
                        }),
                    }
                })
                triggerData.value = [
                    { value: pageData.value.msgPushSwitch, label: 'IDCS_PUSH', property: 'msgPushSwitch' },
                    { value: pageData.value.buzzerSwitch, label: 'IDCS_BUZZER', property: 'buzzerSwitch' },
                    { value: pageData.value.popVideoSwitch, label: 'IDCS_VIDEO_POPUP', property: 'popVideoSwitch' },
                    { value: pageData.value.emailSwitch, label: 'IDCS_EMAIL', property: 'emailSwitch' },
                    { value: pageData.value.popMsgSwitch, label: 'IDCS_MESSAGEBOX_POPUP', property: 'popMsgSwitch' },
                ]
                if (pageData.value.audioSuport && pageData.value.chlData['supportAudio']) {
                    triggerData.value.push({ value: pageData.value.triggerAudio, label: 'IDCS_AUDIO', property: 'triggerAudio' })
                }
                if (pageData.value.lightSuport && pageData.value.chlData['supportWhiteLight']) {
                    triggerData.value.push({ value: pageData.value.triggerWhiteLight, label: 'IDCS_LIGHT', property: 'triggerWhiteLight' })
                }
            } else {
                pageData.value.requireDataFail = true
            }
        }
        // 执行编辑请求
        const saveData = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${pageData.value.currChlId}" scheduleGuid="${pageData.value['schedule']}">
                        <param>
                            <switch>${pageData.value['detectionEnable']}</switch>
                            <alarmHoldTime>${pageData.value['holdTime']}</alarmHoldTime>
                            ${pageData.value.chlData['supportAudio'] && pageData.value['audioSuport'] ? `<triggerAudio>${pageData.value['triggerAudio']}</triggerAudio>` : ''}
                            ${pageData.value.chlData['supportWhiteLight'] && pageData.value['lightSuport'] ? `<triggerWhiteLight>${pageData.value['triggerWhiteLight']}</triggerWhiteLight>` : ''}
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
                            <sysSnap>
                                <chls type="list">
                                    ${pageData.value['snap']['chls']
                                        .map(
                                            (element: { value: string; label: string }) => rawXml`
                                        <item id="${element['value']}">
                                            <![CDATA[${element['label']}]]>
                                        </item>
                                    `,
                                        )
                                        .join('')}
                                </chls>
                            </sysSnap>
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
                            <snapSwitch>${pageData.value['snapSwitch']}</snapSwitch>
                            <msgPushSwitch>${pageData.value['msgPushSwitch']}</msgPushSwitch>
                            <buzzerSwitch>${pageData.value['buzzerSwitch']}</buzzerSwitch>
                            <popVideoSwitch>${pageData.value['popVideoSwitch']}</popVideoSwitch>
                            <emailSwitch>${pageData.value['emailSwitch']}</emailSwitch>
                            <popMsgSwitch>${pageData.value['popMsgSwitch']}</popMsgSwitch>
                            <sysAudio id='${pageData.value['sysAudio']}'></sysAudio>
                        </trigger>
                    </chl>
                </content>
            `

            openLoading()
            const res = await editSmartFireConfig(sendXml)
            const $ = queryXml(res)
            closeLoading()
            if ($('status').text() == 'success') {
                if (pageData.value['detectionEnable']) {
                    // 开关为开把originalSwitch置为true避免多次弹出互斥提示
                    pageData.value['originalEnable'] = true
                }
                pageData.value.applyDisable = true
                openMessageTipBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
            } else {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_SAVE_DATA_FAIL'),
                })
            }
        }
        // 应用
        const handleApply = () => {
            let isSwitchChange = false
            const switchChangeTypeArr: string[] = []
            const mutexChlNameObj = getMutexChlNameObj()
            if (pageData.value['detectionEnable'] && pageData.value['detectionEnable'] != pageData.value['originalEnable']) {
                isSwitchChange = true
            }
            pageData.value.mutexList.forEach((ele: { object: string; status: boolean }) => {
                if (ele['status']) {
                    const prefixName = mutexChlNameObj['normalChlName'] ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj['normalChlName']) : ''
                    const showInfo = prefixName ? prefixName + pageData.value.closeTip[ele['object']].toLowerCase() : pageData.value.closeTip[ele['object']]
                    switchChangeTypeArr.push(showInfo)
                }
            })
            pageData.value.mutexListEx.forEach((ele: { object: string; status: boolean }) => {
                if (ele['status']) {
                    const prefixName = mutexChlNameObj['thermalChlName'] ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj['thermalChlName']) : ''
                    const showInfo = prefixName ? prefixName + pageData.value.closeTip[ele['object']].toLowerCase() : pageData.value.closeTip[ele['object']].toLowerCase()
                    switchChangeTypeArr.push(showInfo)
                }
            })
            if (isSwitchChange && switchChangeTypeArr.length > 0) {
                const switchChangeType = switchChangeTypeArr.join(',')
                openMessageTipBox({
                    type: 'question',
                    message: Translate('IDCS_FIRE_POINT_DETECT_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + pageData.value.chlData['name'], switchChangeType),
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
            // TODO 老代码中写死不显示ai
            pageData.value.showAiConfig = false
            if (pageData.value.showAiConfig) {
                await getAIResourceData(false)
            }
            await getScheduleList()
            await getRecordList()
            await getAlarmOutList()
            await getSnapList()
            await getData()
            await getPresetList()
            pageData.value.initComplete = true
            // pageData.value.requireDataFail = true
        }
        onMounted(async () => {
            await initPageData()
        })
        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
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
            aiResourceTableData,
            triggerData,
            playerRef,
            handlePlayerReady,
            handleAIResourceDel,
            handleTriggerSwitch,
            handleTrigger,
            recordConfirm,
            recordClose,
            alarmOutConfirm,
            alarmOutClose,
            snapConfirm,
            snapClose,
            handleFunctionTabClick,
            handleApply,
            ScheduleManagPop,
        }
    },
})
