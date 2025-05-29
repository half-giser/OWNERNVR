/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 17:51:22
 * @Description: 人群密度检测
 */
import { type XMLQuery } from '@/utils/xmlParse'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import AlarmBaseIPSpeakerSelector from './AlarmBaseIPSpeakerSelector.vue'
import AlarmBaseErrorPanel from './AlarmBaseErrorPanel.vue'

export default defineComponent({
    components: {
        AlarmBaseRecordSelector,
        AlarmBaseAlarmOutSelector,
        AlarmBaseTriggerSelector,
        AlarmBasePresetSelector,
        AlarmBaseIPSpeakerSelector,
        AlarmBaseErrorPanel,
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
        const systemCaps = useCababilityStore()
        const { Translate } = useLangStore()

        const playerRef = ref<PlayerInstance>()

        const pageData = ref({
            // 是否支持声音设置
            supportAlarmAudioConfig: systemCaps.supportAlarmAudioConfig,
            // 请求数据失败显示提示
            reqFail: false,
            // 选择的功能:param、trigger
            tab: 'param',
            isSchedulePop: false,
            scheduleList: [] as SelectOption<string, string>[],
            // 是否显示绘制控制按钮 老代码写死不显示 并且允许画图
            // showDrawAvailable: false,
            // 是否允许绘制 老代码写死允许画图
            // isDrawAvailable: true,
            drawInitCount: 0,
        })

        const formData = ref(new AlarmCddDto())
        const watchEdit = useWatchEditData(formData)

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']
        let drawer = CanvasVfd()

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
         * @description 播放器就绪时回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                if (playerRef.value) {
                    drawer.destroy()
                    drawer = CanvasVfd({
                        el: player.getDrawbordCanvas(),
                        onchange: (data) => {
                            formData.value.regionInfo = [data]
                        },
                    })
                }
            }

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

                    if (mode.value === 'h5') {
                        drawer.setEnable(true)
                    }

                    if (mode.value === 'ocx') {
                        const sendXML = OCX_XML_SetCddAreaAction('EDIT_ON')
                        plugin.ExecuteCmd(sendXML)
                    }

                    setArea()
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
         * @description 获取人群密度检测表单数据
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
                </requireField>`
            const res = await queryCdd(sendXml)

            closeLoading()

            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                const $param = queryXml($('content/chl/param')[0].element)
                const $trigger = queryXml($('content/chl/trigger')[0].element)

                formData.value = {
                    detectionEnable: $param('switch').text().bool(),
                    originalEnable: $param('switch').text().bool(),
                    schedule: getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid')),
                    holdTime: $param('holdTime').text().num(),
                    holdTimeList: getAlarmHoldTimeList($param('holdTimeNote').text(), $param('holdTime').text().num()),
                    refreshFrequency: $param('detectFrequency').text().num(),
                    refreshFrequencyList: $('types/refreshFrequency/enum').map((item) => {
                        const value = item.text().num()
                        return {
                            value,
                            label: `${value / 1000} ${Translate('IDCS_SECONDS')}`,
                        }
                    }),
                    regionInfo: $param('regionInfo/item').map((item) => {
                        const $ = queryXml(item.element)
                        return {
                            X1: $('X1').text().num(),
                            X2: $('X2').text().num(),
                            Y1: $('Y1').text().num(),
                            Y2: $('Y2').text().num(),
                        }
                    }),
                    mutexList: $param('mutexList/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    }),
                    triggerAlarmLevel: $param('triggerAlarmLevel').text().num(),
                    trigger: ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch'].filter((item) => {
                        return $trigger(item).text().bool()
                    }),
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
                    ipSpeaker: $trigger('triggerAudioDevice/chls/item').map((item) => {
                        return {
                            ipSpeakerId: item.attr('id'),
                            audioID: item.attr('audioID'),
                        }
                    }),
                    sysAudio: $trigger('sysAudio').attr('id'),
                }

                watchEdit.listen()
            } else {
                pageData.value.reqFail = true
                pageData.value.tab = ''
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
                                    ${formData.value.record.map((element) => `<item id="${element.value}">${wrapCDATA(element.label)}</item>`).join('')}
                                </chls>
                            </sysRec>
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
                            <triggerAudioDevice>
                                <chls type="list">
                                ${formData.value.ipSpeaker
                                    .map((item) => {
                                        return rawXml`<item id='${item.ipSpeakerId}' audioID='${item.audioID}'/>`
                                    })
                                    .join('')}
                                </chls>
                            </triggerAudioDevice>
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

            const result = await editCdd(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                // NT-9292 开关为开把originalSwitch置为true避免多次弹出互斥提示
                if (formData.value.detectionEnable) {
                    formData.value.originalEnable = true
                }
                watchEdit.update()
            } else {
                openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
            }
        }

        /**
         * @description 检查通道互斥 提交数据
         */
        const applyData = async () => {
            checkMutexChl({
                isChange: formData.value.detectionEnable && formData.value.detectionEnable !== formData.value.originalEnable,
                tips: 'IDCS_SIMPLE_CROWD_DETECT_TIPS',
                mutexList: formData.value.mutexList,
                chlName: props.chlData.name,
            }).then(() => {
                saveData()
            })
        }

        /**
         * @description 绘制区域
         */
        const setArea = () => {
            if (formData.value.regionInfo.length) {
                if (mode.value === 'h5') {
                    drawer.setArea(formData.value.regionInfo[0])
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetCddArea(formData.value.regionInfo[0])
                    plugin.ExecuteCmd(sendXML)
                }
            }
        }

        /**
         * @description 清除区域
         */
        const clearArea = () => {
            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetCddAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            formData.value.regionInfo[0] = {
                X1: 0,
                X2: 0,
                Y1: 0,
                Y2: 0,
            }
        }

        const notify = ($: XMLQuery, stateType: string) => {
            if (stateType === 'CddParam') {
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

        onMounted(async () => {
            await getScheduleList()
            getData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                const sendAreaXML = OCX_XML_SetCddAreaAction('NONE')
                plugin.ExecuteCmd(sendAreaXML)

                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }

            drawer.destroy()
        })

        return {
            pageData,
            formData,
            watchEdit,
            playerRef,
            handlePlayerReady,
            closeSchedulePop,
            applyData,
            clearArea,
            notify,
        }
    },
})
