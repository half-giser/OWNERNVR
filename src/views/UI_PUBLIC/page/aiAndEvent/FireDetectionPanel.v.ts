/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-11 14:16:37
 * @Description: 火点检测
 */
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
            type: Array as PropType<AlarmOnlineChlDto[]>,
            required: true,
        },
    },
    setup(props) {
        const systemCaps = useCababilityStore()

        const playerRef = ref<PlayerInstance>()

        const pageData = ref({
            // 是否支持声音设置
            supportAlarmAudioConfig: true,
            // 请求数据失败显示提示
            reqFail: false,
            // 选择的功能:param、trigger
            tab: 'param',
            isSchedulePop: false,
            scheduleList: [] as SelectOption<string, string>[],
            isSwitchChange: false,
            drawInitCount: 0,
        })

        const formData = ref(new AlarmFireDetectionDto())
        const watchEdit = useWatchEditData(formData)

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        // 播放模式
        const mode = computed(() => {
            if (!ready.value) {
                return ''
            }
            return playerRef.value!.mode
        })

        /**
         * @description 播放器准备就绪
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 播放视频
         */
        const play = () => {
            const { id, name } = props.chlData

            if (mode.value === 'h5') {
                player.play({
                    chlID: id,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(id, name)
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && watchEdit.ready.value) {
                nextTick(() => {
                    play()
                })
                stopWatchFirstPlay()
            }
        })

        /**
         * @description 关闭排程管理后刷新排程列表
         */
        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            formData.value.schedule = getScheduleId(pageData.value.scheduleList, formData.value.schedule)
        }

        /**
         * @description 获取排程列表
         */
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        /**
         * @description 获取火点检测配置
         */
        const getData = async () => {
            openLoading()

            const sendXml = rawXml` 
                <condition>
                    <chlId>${props.currChlId}</chlId>
                </condition>
                <requireField>
                    <param/>
                    <trigger/>
                </requireField>
            `
            const result = await querySmartFireConfig(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                const $param = queryXml($('content/chl/param')[0].element)
                const $trigger = queryXml($('content/chl/trigger')[0].element)

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
                    holdTime: $param('alarmHoldTime').text().num(),
                    holdTimeList: getAlarmHoldTimeList($param('holdTimeNote').text(), $param('alarmHoldTime').text().num()),
                    schedule: getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid')),
                    detectionEnable: $param('switch').text().bool(),
                    originalEnable: $param('switch').text().bool(),
                    audioSuport: $param('triggerAudio').text() !== '',
                    lightSuport: $param('triggerWhiteLight').text() !== '',
                    trigger: ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch', 'popMsgSwitch'].filter((item) => {
                        return $trigger(item).text().bool()
                    }),
                    triggerList: ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch', 'popMsgSwitch'],
                    sysAudio: $trigger('sysAudio').attr('id'),
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

                watchEdit.listen()
            } else {
                pageData.value.tab = ''
                pageData.value.reqFail = true
            }
        }

        /**
         * @description 保存数据
         */
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
                                    ${formData.value.record.map((element) => `<item id="${element.value}">${wrapCDATA(element.label)}</item>`).join('')}
                                </chls>
                            </sysRec>
                            <sysSnap>
                                <chls type="list">
                                    ${formData.value.snap.map((element) => `<item id="${element.value}">${wrapCDATA(element.label)}</item>`).join('')}
                                </chls>
                            </sysSnap>
                            <alarmOut>
                                <alarmOuts type="list">
                                    ${formData.value.alarmOut.map((element) => `<item id="${element.value}">${wrapCDATA(element.label)}</item>`).join('')}
                                </alarmOuts>
                            </alarmOut>
                            <preset>
                                <presets type="list">
                                    ${formData.value.preset
                                        .map((item) => {
                                            return rawXml`
                                                <item>
                                                    <index>${item.index}</index>
                                                    <name>${wrapCDATA(item.name)}</name>
                                                    <chl id='${item.chl.value}'>${wrapCDATA(item.chl.label)}</chl>
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
            closeLoading()
            commSaveResponseHandler(res, () => {
                if (formData.value.detectionEnable) {
                    // 开关为开把originalSwitch置为true避免多次弹出互斥提示
                    formData.value.originalEnable = true
                }
                watchEdit.update()
            })
        }

        /**
         * @description 检测互斥通道 更新配置
         */
        const applyData = () => {
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

        /**
         * @description 初始化页面数据
         */
        const initPageData = async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            await getScheduleList()
            getData()
        }

        onMounted(() => {
            initPageData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }
        })

        return {
            pageData,
            formData,
            watchEdit,
            playerRef,
            handlePlayerReady,
            closeSchedulePop,
            applyData,
        }
    },
})
