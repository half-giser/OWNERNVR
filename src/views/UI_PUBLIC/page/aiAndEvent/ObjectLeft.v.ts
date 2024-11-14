/*
 * @Description: AI 事件——更多——物品遗留与看护
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-18 09:43:49
 */
import { type AlarmObjectLeftBoundaryDto, AlarmObjectLeftDto, type AlarmChlDto } from '@/types/apiType/aiAndEvent'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'
import { type TabPaneName } from 'element-plus'
import CanvasPolygon from '@/utils/canvas/canvasPolygon'
import { type XmlResult } from '@/utils/xmlParse'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'

export default defineComponent({
    components: {
        ScheduleManagPop,
        AlarmBaseRecordSelector,
        AlarmBaseAlarmOutSelector,
        AlarmBaseTriggerSelector,
        AlarmBasePresetSelector,
    },
    props: {
        /**
         * @property 选中的通道
         */
        currChlId: {
            type: String,
            required: true,
        },
        /**
         * @property {AlarmChlDto} 通道数据
         */
        chlData: {
            type: Object as PropType<AlarmChlDto>,
            required: true,
        },
        /**
         * @property {Array} 声音选项
         */
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
        const objectLeftData = ref(new AlarmObjectLeftDto())

        // 播放器
        const playerRef = ref<PlayerInstance>()

        const oscTypeTip: Record<string, string> = {
            abandum: Translate('IDCS_LEAVE_BEHIND'),
            objstolen: Translate('IDCS_ARTICLE_LOSE'),
        }

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
            // 初始化，后判断应用是否可用
            initComplated: false,
            applyDisabled: true,
            // 消息提示
            notification: [] as string[],
        })

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
        let objDrawer = new CanvasPolygon({
            el: document.createElement('canvas'),
        })

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
                const sendXML = OCX_XML_SetPluginModel(osType === 'mac' ? 'OscConfig' : 'ReadOnly', 'Live')
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
            objectLeftData.value.boundary[pageData.value.warnArea].points = points
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
                if (!objectLeftData.value.boundary.length) return
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
                if (osType === 'mac') {
                    // const sendXML = OCX_XML_Preview({
                    //     winIndexList: [0],
                    //     chlIdList: [chlData.id],
                    //     chlNameList: [chlData.name],
                    //     streamType: 'sub',
                    //     // chl没有index属性
                    //     chlIndexList: ['0'],
                    //     chlTypeList: [chlData.chlType],
                    // })
                    // plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
                const enabledSwitch = $('//content/chl/param/switch').text().bool()
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
                const boundary = [] as AlarmObjectLeftBoundaryDto[]
                $('//content/chl/param/boundary/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const boundaryItem = {
                        areaName: $item('name').text().trim(),
                        points: [] as { X: number; Y: number; isClosed?: boolean }[],
                    }
                    $item('point/item').forEach((ele) => {
                        const $ele = queryXml(ele.element)
                        boundaryItem.points.push({
                            X: $ele('X').text().num(),
                            Y: $ele('Y').text().num(),
                            isClosed: true,
                        })
                    })
                    boundary.push(boundaryItem)
                })
                const mutexList = $('//content/chl/param/mutexList/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        object: $item('object').text(),
                        status: $item('status').text().bool(),
                    }
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

                const triggerList = ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch'].filter((item) => {
                    return $trigger(item).text().bool()
                })

                objectLeftData.value = {
                    enabledSwitch,
                    originalSwitch: enabledSwitch,
                    holdTime,
                    holdTimeList,
                    schedule: $('//content/chl').attr('scheduleGuid'),
                    oscTypeList,
                    oscType: $('//content/chl/param/oscType').text(),
                    areaMaxCount: $('//content/chl/param/boundary').attr('maxCount').num(), // 支持配置几个警戒面
                    regulation: $('//content/chl/param/boundary').attr('regulation') === '1', // 区别联咏ipc标志
                    boundary,
                    mutexList,
                    maxNameLength: $('//content/chl/param/boundary/item/name').attr('maxLen').num() || 15,
                    record,
                    alarmOut,
                    preset,
                    sysAudio: $('sysAudio').attr('id'),
                    trigger: triggerList,
                }
            }).then(() => {
                pageData.value.initComplated = true
                handleObjectLeftData()
            })
        }

        const handleObjectLeftData = () => {
            pageData.value.areaName = objectLeftData.value.boundary[pageData.value.warnArea].areaName

            // 初始化样式
            refreshInitPage()
            // 绘制
            setAreaView()
        }

        // 检测和屏蔽区域的样式初始化
        const refreshInitPage = () => {
            objectLeftData.value.boundary.forEach((item, index) => {
                if (item.points && item.points.length) {
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
            if (name === 'param') {
                play()
            }
        }

        // 视频区域
        const showAllArea = () => {
            objDrawer && objDrawer.setEnableShowAll(pageData.value.isShowAllArea)
            if (pageData.value.isShowAllArea) {
                const detectAreaInfo = {} as Record<number, { X: number; Y: number; isClosed?: boolean }[]>
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
                if (mode.value !== 'h5') {
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
            if (!objectLeftData.value.boundary.length) return
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
        const setClosed = (points: { X: number; Y: number; isClosed?: boolean }[]) => {
            points.forEach((item) => {
                item.isClosed = true
            })
        }

        const setOtherAreaClosed = () => {
            if (mode.value === 'h5') {
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
                } else if (count > 0 && !objDrawer.judgeAreaCanBeClosed(item.points)) {
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
                            <switch>${objectLeftData.value.enabledSwitch}</switch>
                            <holdTime unit='s'>${objectLeftData.value.holdTime}</holdTime>
                            <oscType>${objectLeftData.value.oscType}</oscType>
                            <boundary type='list' count='${objectLeftData.value.boundary.length}'>
                                <itemType>
                                    <point type='list'/>
                                </itemType>
                                ${objectLeftData.value.boundary
                                    .map((item) => {
                                        return rawXml`
                                            <item>
                                                <name maxLen='${objectLeftData.value.maxNameLength}'><![CDATA[${item.areaName}]]></name>
                                                <point type='list' maxCount='6' count='${item.points.length}'>
                                                    ${item.points
                                                        .map((ele) => {
                                                            return rawXml`
                                                                <item>
                                                                    <X>${ele.X}</X>
                                                                    <Y>${ele.Y}</Y>
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
                            <snapSwitch>${objectLeftData.value.trigger.includes('snapSwitch')}</snapSwitch>
                            <msgPushSwitch>${objectLeftData.value.trigger.includes('msgPushSwitch')}</msgPushSwitch>
                            <buzzerSwitch>${objectLeftData.value.trigger.includes('buzzerSwitch')}</buzzerSwitch>
                            <popVideoSwitch>${objectLeftData.value.trigger.includes('popVideoSwitch')}</popVideoSwitch>
                            <emailSwitch>${objectLeftData.value.trigger.includes('emailSwitch')}</emailSwitch>
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
            if ($('//status').text() === 'success') {
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
            if (objectLeftData.value.enabledSwitch && objectLeftData.value.enabledSwitch !== objectLeftData.value.originalSwitch) {
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
            if ($("statenotify[@type='OscArea']").length) {
                // 绘制点线
                if ($('statenotify/points').length) {
                    objectLeftData.value.boundary[pageData.value.warnArea].points = $('/statenotify/points/item').map((item) => {
                        return {
                            X: item.attr('X').num(),
                            Y: item.attr('Y').num(),
                        }
                    })
                }

                const errorCode = $('statenotify/errorCode').text().num()

                // 处理错误码
                if (errorCode === 517) {
                    // 517-区域已闭合
                    clearCurrentArea()
                } else if (errorCode === 515) {
                    // 515-区域有相交直线，不可闭合
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_INTERSECT'),
                    })
                }
            }
        }
        onMounted(async () => {
            if (mode.value !== 'h5') {
                Plugin.VideoPluginNotifyEmitter.addListener(LiveNotify2Js)
            }
            pageData.value.scheduleList = await buildScheduleList()
            await getObjectLeftData()
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

            if (mode.value === 'h5') {
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
            // 提交物品遗留与看护数据
            applyObjectLeftData,
            AlarmBaseRecordSelector,
            AlarmBaseAlarmOutSelector,
            AlarmBaseTriggerSelector,
            AlarmBasePresetSelector,
        }
    },
})
