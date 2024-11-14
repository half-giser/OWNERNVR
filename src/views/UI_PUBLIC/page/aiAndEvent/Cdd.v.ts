/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 17:51:22
 * @Description: 人群密度检测
 */
import { type AlarmChlDto, AlarmCddDto } from '@/types/apiType/aiAndEvent'
import { type TabsPaneContext } from 'element-plus'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import { type XMLQuery } from '@/utils/xmlParse'
import CanvasVfd from '@/utils/canvas/canvasVfd'
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
         * @property {string} 选中的通道
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
    setup(props) {
        const { openLoading, closeLoading } = useLoading()
        const openMessageBox = useMessageBox().openMessageBox
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const playerRef = ref<PlayerInstance>()
        const pluginStore = usePluginStore()
        const osType = getSystemInfo().platform

        const closeTip = getAlarmEventList()

        let cddDrawer: CanvasVfd

        const pageData = ref({
            // 是否支持声音设置
            supportAlarmAudioConfig: systemCaps.supportAlarmAudioConfig,
            // 不支持功能提示页面是否展示
            // notSupportTipShow: false,
            // 请求数据失败显示提示
            requireDataFail: false,
            // apply按钮是否可用
            applyDisable: true,
            scheduleManagePopOpen: false,
            scheduleList: [] as SelectOption<string, string>[],
            // 选择的功能:param、trigger
            fuction: 'param',
            // 播放器相关
            // 通知列表
            notification: [] as string[],
            // 是否显示绘制控制按钮 老代码写死不显示 并且允许画图
            // showDrawAvailable: false,
            // 是否允许绘制 老代码写死允许画图
            // isDrawAvailable: true,
            initComplete: false,
            drawInitCount: 0,
        })

        const formData = ref(new AlarmCddDto())

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
                const sendXML = OCX_XML_SetPluginModel(osType === 'mac' ? 'FireConfig' : 'ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        //播放视频
        const play = () => {
            const { id, name } = props.chlData
            if (mode.value === 'h5') {
                player.play({
                    chlID: id,
                    streamType: 2,
                })
            } else if (mode.value === 'ocx') {
                if (osType === 'mac') {
                    // const sendXML = OCX_XML_Preview({
                    //     winIndexList: [0],
                    //     chlIdList: [props.chlData.id],
                    //     chlNameList: [props.chlData.name],
                    //     streamType: 'sub',
                    //     chlIndexList: [props.chlData.id],
                    //     chlTypeList: [props.chlData.chlType],
                    // })
                    // plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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

        // 关闭排程管理后刷新排程列表
        const handleSchedulePopClose = async () => {
            pageData.value.scheduleManagePopOpen = false
            await getScheduleList()
        }

        // 对sheduleList进行处理
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        // tab点击事件
        const handleFunctionTabClick = async (pane: TabsPaneContext) => {
            pageData.value.fuction = pane.props.name?.toString() ? pane.props.name?.toString() : ''
            if (pageData.value.fuction === 'param') {
                setOcxData()
            }
        }

        // 格式化持续时间
        const formatHoldTime = (holdTimeList: string[]) => {
            const timeList: SelectOption<number, string>[] = []
            holdTimeList.forEach((ele) => {
                const element = Number(ele)
                const itemText = getTranslateForSecond(element)
                timeList.push({ value: element, label: itemText })
            })
            timeList.sort((a, b) => a.value - b.value)
            return timeList
        }

        const getData = async () => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${props.currChlId}</chlId>
                </condition>
                <requireField>
                    <param/>
                    <trigger/>
                </requireField>`
            openLoading()
            const res = await queryCdd(sendXml)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                const holdTimeArr = $('//content/chl/param/holdTimeNote').text().split(',')
                const holdTime = $('//content/chl/param/alarmHoldTime').text().num()
                if (!holdTimeArr.includes(holdTime.toString())) {
                    holdTimeArr.push(holdTime.toString())
                }

                let schedule = $('//content/chl').attr('scheduleGuid')
                schedule = schedule !== '' ? (pageData.value.scheduleList.some((item: { value: string; label: string }) => item.value === schedule) ? schedule : DEFAULT_EMPTY_ID) : DEFAULT_EMPTY_ID

                const trigger = $('//content/chl/trigger')
                const $trigger = queryXml(trigger[0].element)

                formData.value = {
                    detectionEnable: $('//content/chl/param/switch').text().bool(),
                    originalEnable: $('//content/chl/param/switch').text().bool(),
                    schedule,
                    holdTime,
                    holdTimeList: formatHoldTime(holdTimeArr),
                    refreshFrequency: $('//content/chl/param/detectFrequency').text().num(),
                    refreshFrequencyList: $('//types/refreshFrequency/enum').map((item) => {
                        const value = item.text().num() / 1000
                        return {
                            value,
                            label: getTranslateForSecond(value / 1000),
                        }
                    }),
                    regionInfo: $('//content/chl/param/regionInfo/item').map((item) => {
                        const $ = queryXml(item.element)
                        return {
                            X1: $('X1').text().num(),
                            X2: $('X2').text().num(),
                            Y1: $('Y1').text().num(),
                            Y2: $('Y2').text().num(),
                        }
                    }),
                    mutexList: $('//content/trigger/mutexList/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    }),
                    triggerAlarmLevel: $('//content/chl/param/triggerAlarmLevel').text().num(),
                    trigger: ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch'].filter((item) => {
                        return $trigger(item).text().bool()
                    }),
                    record: $trigger('sysRec/chls/item').map((item) => {
                        return {
                            value: item.attr('id')!,
                            label: item.text(),
                        }
                    }),
                    alarmOut: $trigger('alarmOut/alarmOuts/item').map((item) => {
                        return {
                            value: item.attr('id')!,
                            label: item.text(),
                        }
                    }),
                    preset: $trigger('preset/presets/item').map((item) => {
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
                    sysAudio: $trigger('sysAudio').attr('id') === '' ? $trigger('sysAudio').attr('id') : '',
                }
            } else {
                pageData.value.requireDataFail = true
            }
        }

        const saveData = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}" scheduleGuid="${formData.value.schedule}">
                        <param>
                            <switch>${formData.value.detectionEnable}</switch>
                            <holdTime unit="s">${formData.value.holdTime}</holdTime>
                            <detectFrequency>${formData.value.refreshFrequency}</detectFrequency>
                            <triggerAlarmLevel>${formData.value.triggerAlarmLevel}</triggerAlarmLevel>
                            <regionInfo type="list">
                                <item type="rectangle">
                                    <X1 type="uint32">${Math.round(formData.value.regionInfo[0].X1)}</X1>
                                    <Y1 type="uint32">${Math.round(formData.value.regionInfo[0].Y1)}</Y1>
                                    <X2 type="uint32">${Math.round(formData.value.regionInfo[0].X2)}</X2>
                                    <Y2 type="uint32">${Math.round(formData.value.regionInfo[0].Y2)}</Y2>
                                </item>
                            </regionInfo>
                        </param>
                        <trigger>
                            <sysRec>
                                <chls type="list">
                                    ${formData.value.record.map((element) => `<item id="${element.value}"><![CDATA[${element.label}]]></item>`).join('')}
                                </chls>
                            </sysRec>
                            <alarmOut>
                                <alarmOuts type="list">
                                    ${formData.value.alarmOut
                                        .map(
                                            (element) => `
                                                <item id="${element.value}"><![CDATA[${element.label}]]></item>`,
                                        )
                                        .join('')}
                                </alarmOuts>
                            </alarmOut>
                            <preset>
                                <presets type="list">
                                    ${formData.value.preset
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
                            <snapSwitch>${formData.value.trigger.includes('snapSwitch')}</snapSwitch>
                            <msgPushSwitch>${formData.value.trigger.includes('msgPushSwitch')}</msgPushSwitch>
                            <buzzerSwitch>${formData.value.trigger.includes('buzzerSwitch')}</buzzerSwitch>
                            <popVideoSwitch>${formData.value.trigger.includes('popVideoSwitch')}</popVideoSwitch>
                            <emailSwitch>${formData.value.trigger.includes('emailSwitch')}</emailSwitch>
                            <sysAudio id='${formData.value.sysAudio}'></sysAudio>
                        </trigger>
                    </chl>
                </content>
            `
            openLoading()
            const res = await editCdd(sendXml)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                // NT-9292 开关为开把originalSwitch置为true避免多次弹出互斥提示
                if (formData.value.detectionEnable) {
                    formData.value.originalEnable = true
                }
                pageData.value.applyDisable = true
            }
        }

        const handleApply = async () => {
            let isSwitchChange = false
            let switchChangeType = ''
            if (formData.value.detectionEnable && formData.value.detectionEnable !== formData.value.originalEnable) {
                isSwitchChange = true
            }

            formData.value.mutexList.forEach((ele) => {
                if (ele.status) {
                    switchChangeType = ele.object
                }
            })

            if (isSwitchChange && switchChangeType) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_SIMPLE_CROWD_DETECT_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + props.chlData.name, closeTip[switchChangeType]),
                }).then(() => {
                    saveData()
                })
            } else {
                saveData()
            }
        }

        // 初始化页面数据
        const initPageData = async () => {
            await getScheduleList()
            await getData()
            nextTick(() => {
                pageData.value.initComplete = true
                if (mode.value === 'h5') {
                    cddDrawer.setEnable(true)
                } else {
                    plugin.VideoPluginNotifyEmitter.addListener(LiveNotify2Js)
                    const sendXML = OCX_XML_SetCddAreaAction('EDIT_ON')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            })
        }

        const cddAreaChange = (data: { X1: number; X2: number; Y1: number; Y2: number }) => {
            formData.value.regionInfo = [data]
        }

        const setOcxData = () => {
            if (formData.value.regionInfo.length) {
                if (mode.value === 'h5') {
                    cddDrawer.setArea(formData.value.regionInfo[0])
                } else {
                    const sendXML = OCX_XML_SetCddArea(formData.value.regionInfo[0])
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
            formData.value.regionInfo[0] = { X1: 0, X2: 0, Y1: 0, Y2: 0 }
        }

        const LiveNotify2Js = ($: XMLQuery) => {
            if ($("statenotify[@type='CddParam']").length) {
                formData.value.regionInfo = $('statenotify/item').map((element) => {
                    const $ = queryXml(element.element)
                    return {
                        X1: $('X1').text().num(),
                        Y1: $('Y1').text().num(),
                        X2: $('X2').text().num(),
                        Y2: $('Y2').text().num(),
                    }
                })
            }
        }

        watch(
            formData,
            () => {
                if (pageData.value.initComplete) {
                    pageData.value.applyDisable = false
                }
            },
            {
                deep: true,
            },
        )

        onMounted(() => {
            initPageData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                plugin.VideoPluginNotifyEmitter.removeListener(LiveNotify2Js)
                const sendAreaXML = OCX_XML_SetCddAreaAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendAreaXML)
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }

            if (mode.value === 'h5') {
                player.destroy()
            }
        })

        return {
            pageData,
            formData,
            playerRef,
            handlePlayerReady,
            handleSchedulePopClose,
            handleFunctionTabClick,
            handleApply,
            clearArea,
            ScheduleManagPop,
            AlarmBaseRecordSelector,
            AlarmBaseAlarmOutSelector,
            AlarmBaseTriggerSelector,
            AlarmBasePresetSelector,
        }
    },
})
