/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-11 14:16:37
 * @Description: 火点检测
 */
import { type AlarmChlDto, AlarmFireDetectionDto } from '@/types/apiType/aiAndEvent'
import { type TabsPaneContext } from 'element-plus'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import AlarmBaseSnapSelector from './AlarmBaseSnapSelector.vue'

export default defineComponent({
    components: {
        ScheduleManagPop,
        AlarmBaseRecordSelector,
        AlarmBaseAlarmOutSelector,
        AlarmBaseTriggerSelector,
        AlarmBasePresetSelector,
        AlarmBaseSnapSelector,
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
        /**
         * @property {Array} 在线通道列表
         */
        onlineChannelList: {
            type: Array as PropType<{ id: string; ip: string; name: string; accessType: string }[]>,
            required: true,
        },
    },
    setup(props) {
        const { openLoading, closeLoading } = useLoading()
        const openMessageBox = useMessageBox().openMessageBox
        const { openNotify } = useNotification()
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        const playerRef = ref<PlayerInstance>()
        const osType = getSystemInfo().platform

        const pageData = ref({
            // 是否支持声音设置
            supportAlarmAudioConfig: true,
            // 不支持功能提示页面是否展示
            // notSupportTipShow: false,
            // 请求数据失败显示提示
            requireDataFail: false,
            // apply按钮是否可用
            applyDisable: true,
            scheduleManagePopOpen: false,
            scheduleList: [] as SelectOption<string, string>[],
            isSwitchChange: false,
            // 选择的功能:param、trigger
            fuction: 'param',
            // 播放器相关
            initComplete: false,
            drawInitCount: 0,
        })

        const formData = ref(new AlarmFireDetectionDto())

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
                    openNotify(formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`))
                }
            }

            if (mode.value === 'ocx') {
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
        }

        // 格式化持续时间
        const formatHoldTime = (holdTimeList: string[]) => {
            const timeList = holdTimeList.map((ele) => {
                const value = Number(ele)
                const label = getTranslateForSecond(value)
                return {
                    value,
                    label,
                }
            })
            timeList.sort((a, b) => a.value - b.value)
            return timeList
        }

        // 获取火点数据
        const getData = async () => {
            const sendXml = rawXml` 
                <condition>
                    <chlId>${props.currChlId}</chlId>
                </condition>
                <requireField>
                    <param/>
                    <trigger/>
                </requireField>
            `
            openLoading()
            const res = await querySmartFireConfig(sendXml)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                const $param = queryXml($('content/chl/param')[0].element)
                const $trigger = queryXml($('content/chl/trigger')[0].element)

                const holdTimeArr = $param('holdTimeNote').text().split(',')
                const holdTime = $param('alarmHoldTime').text().num()
                if (!holdTimeArr.includes(holdTime.toString())) {
                    holdTimeArr.push(holdTime.toString())
                }

                let schedule = $('content/chl').attr('scheduleGuid')
                schedule = schedule !== '' ? (pageData.value.scheduleList.some((item) => item.value === schedule) ? schedule : DEFAULT_EMPTY_ID) : DEFAULT_EMPTY_ID

                formData.value = {
                    mutexList: $param('mutexList/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    }),
                    mutexListEx: $param('mutexListEx/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    }),
                    holdTime,
                    holdTimeList: formatHoldTime(holdTimeArr),
                    schedule,
                    detectionEnable: $param('switch').text().bool(),
                    originalEnable: $param('switch').text().bool(),
                    audioSuport: $param('triggerAudio').text() !== '',
                    lightSuport: $param('triggerWhiteLight').text() !== '',
                    trigger: ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch', 'popMsgSwitch'].filter((item) => {
                        return $trigger(item).text().bool()
                    }),
                    triggerList: ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch', 'popMsgSwitch'],
                    sysAudio: $trigger('sysAudio').attr('id') === '' ? $trigger('sysAudio').attr('id') : '',
                    record: $trigger('sysRec/chls/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    }),
                    alarmOut: $trigger('alarmOut/alarmOuts/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    }),
                    snap: $trigger('sysSnap/chls/item').map((item) => {
                        return {
                            value: item.attr('id'),
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
                }

                if (formData.value.audioSuport && props.chlData.supportAudio) {
                    formData.value.triggerList.push('triggerAudio')
                    if ($param('triggerAudio').text().bool()) {
                        formData.value.trigger.push('triggerAudio')
                    }
                }

                if (formData.value.lightSuport && props.chlData.supportWhiteLight) {
                    formData.value.triggerList.push('triggerWhiteLight')
                    if ($param('triggerWhiteLight').text().bool()) {
                        formData.value.trigger.push('triggerWhiteLight')
                    }
                }

                pageData.value.applyDisable = true
            } else {
                pageData.value.requireDataFail = true
            }
        }

        // 执行编辑请求
        const saveData = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}" scheduleGuid="${formData.value.schedule}">
                        <param>
                            <switch>${formData.value.detectionEnable}</switch>
                            <alarmHoldTime>${formData.value.holdTime}</alarmHoldTime>
                            ${props.chlData.supportAudio && formData.value.audioSuport ? `<triggerAudio>${formData.value.trigger.includes('triggerAudio')}</triggerAudio>` : ''}
                            ${props.chlData.supportWhiteLight && formData.value.lightSuport ? `<triggerWhiteLight>${formData.value.trigger.includes('triggerWhiteLight')}</triggerWhiteLight>` : ''}
                        </param>
                        <trigger>
                            <sysRec>
                                <chls type="list">
                                    ${formData.value.record.map((element) => `<item id="${element.value}"><![CDATA[${element.label}]]></item>`).join('')}
                                </chls>
                            </sysRec>
                            <sysSnap>
                                <chls type="list">
                                    ${formData.value.snap.map((element) => `<item id="${element.value}"><![CDATA[${element.label}]]></item>`).join('')}
                                </chls>
                            </sysSnap>
                            <alarmOut>
                                <alarmOuts type="list">
                                    ${formData.value.alarmOut.map((element) => `<item id="${element.value}"><![CDATA[${element.label}]]></item>`).join('')}
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
                            <popMsgSwitch>${formData.value.trigger.includes('popMsgSwitch')}</popMsgSwitch>
                            <sysAudio id='${formData.value.sysAudio}'></sysAudio>
                        </trigger>
                    </chl>
                </content>
            `

            openLoading()
            const res = await editSmartFireConfig(sendXml)
            const $ = queryXml(res)
            closeLoading()
            if ($('status').text() === 'success') {
                if (formData.value.detectionEnable) {
                    // 开关为开把originalSwitch置为true避免多次弹出互斥提示
                    formData.value.originalEnable = true
                }
                pageData.value.applyDisable = true
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
            } else {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_SAVE_DATA_FAIL'),
                })
            }
        }

        // 应用
        const handleApply = () => {
            checkMutexChl({
                tips: 'IDCS_FIRE_POINT_DETECT_TIPS',
                isChange: formData.value.detectionEnable && formData.value.detectionEnable !== formData.value.originalEnable,
                mutexList: formData.value.mutexList,
                mutexListEx: formData.value.mutexListEx,
                chlName: props.chlData.name,
                chlIp: props.chlData.ip,
                chlList: props.onlineChannelList,
            }).then(() => {
                saveData()
            })
        }

        // 初始化页面数据
        const initPageData = async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            await getScheduleList()
            await getData()
            nextTick(() => {
                pageData.value.initComplete = true
            })
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
            ScheduleManagPop,
            AlarmBaseRecordSelector,
            AlarmBaseAlarmOutSelector,
            AlarmBaseTriggerSelector,
            AlarmBasePresetSelector,
            AlarmBaseSnapSelector,
        }
    },
})
