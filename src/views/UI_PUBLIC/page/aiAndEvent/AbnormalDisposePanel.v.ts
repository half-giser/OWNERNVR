/*
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-19 09:27:33
 * @Description: AI 事件——更多——异常侦测
 */
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'

export default defineComponent({
    components: {
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
    setup(prop) {
        const systemCaps = useCababilityStore()

        // 系统配置
        const supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig

        // 异常侦测表单数据
        const formData = ref(new AlarmAbnormalDisposeDto())
        const watchEdit = useWatchEditData(formData)

        // 播放器
        const playerRef = ref<PlayerInstance>()

        // 页面数据
        const pageData = ref({
            tab: 'param',
            reqFail: false,
            enableList: getTranslateOptions(DEFAULT_SWITCH_OPTIONS),
        })

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

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        /**
         * @description 播放器就绪时回调
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
            const chlData = prop.chlData

            if (mode.value === 'h5') {
                player.play({
                    chlID: prop.currChlId,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(prop.currChlId, chlData.name)
            }
        }

        /**
         * @description 获取异常侦测表单数据
         */
        const getData = async () => {
            openLoading()

            const sendXml = rawXml`
                <condition>
                    <chlId>${prop.currChlId}</chlId>
                </condition>
                <requireField>
                    <param/>
                    <trigger/>
                </requireField>
            `
            const result = await queryAvd(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                const $trigger = queryXml($('content/chl/trigger')[0].element)
                const $param = queryXml($('content/chl/param')[0].element)

                formData.value = {
                    holdTime: $param('holdTime').text().num(),
                    holdTimeList: getAlarmHoldTimeList($param('holdTimeNote').text(), $param('holdTime').text().num()),
                    sceneChangeSwitch: $param('sceneChangeSwitch').text(),
                    clarityAbnormalSwitch: $param('clarityAbnormalSwitch').text(),
                    colorAbnormalSwitch: $param('colorAbnormalSwitch').text(),
                    sensitivity: $param('sensitivity').text().num(),
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
                        const $item = queryXml(item.element)
                        return {
                            index: $item('index').text(),
                            name: $item('name').text(),
                            chl: {
                                value: $item('chl').attr('id'),
                                label: $item('chl').text(),
                            },
                        }
                    }),
                    trigger: ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch'].filter((item) => {
                        return $trigger(item).text().bool()
                    }),
                    sysAudio: $trigger('sysAudio').attr('id'),
                }

                watchEdit.listen()
            } else {
                pageData.value.reqFail = true
                pageData.value.tab = ''
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        /**
         * @description 生成提交XML
         * @returns {string}
         */
        const getSaveData = () => {
            const sendXml = rawXml`
                <content>
                    <chl id='${prop.currChlId}'>
                        <param>
                            <holdTime unit='s'>${formData.value.holdTime}</holdTime>
                            <sensitivity>${formData.value.sensitivity}</sensitivity>
                            ${formData.value.sceneChangeSwitch ? `<sceneChangeSwitch >${formData.value.sceneChangeSwitch}</sceneChangeSwitch>` : ''}
                            ${formData.value.clarityAbnormalSwitch ? `<clarityAbnormalSwitch >${formData.value.clarityAbnormalSwitch}</clarityAbnormalSwitch>` : ''}
                            ${formData.value.colorAbnormalSwitch ? `<colorAbnormalSwitch >${formData.value.colorAbnormalSwitch}</colorAbnormalSwitch>` : ''}
                        </param>
                        <trigger>
                            <sysRec>
                                <chls type='list'>
                                    ${formData.value.record
                                        .map((item) => {
                                            return `<item id='${item.value}'>${wrapCDATA(item.label)}</item>`
                                        })
                                        .join('')}
                                </chls>
                            </sysRec>
                            <alarmOut>
                                <alarmOuts type='list'>
                                    ${formData.value.alarmOut
                                        .map((item) => {
                                            return `<item id='${item.value}'>${wrapCDATA(item.label)}</item>`
                                        })
                                        .join('')}
                                </alarmOuts>
                            </alarmOut>
                            <preset>
                                <presets type='list'>
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
                            <sysAudio id='${formData.value.sysAudio}'></sysAudio>
                        </trigger>
                    </chl>
                </content>
            `

            return sendXml
        }

        /**
         * @description 保存数据
         */
        const setData = async () => {
            openLoading()
            const sendXml = getSaveData()
            const result = await editAvd(sendXml)
            closeLoading()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                watchEdit.update()
            }
        }

        onMounted(() => {
            getData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }
        })

        return {
            supportAlarmAudioConfig,
            playerRef,
            formData,
            pageData,
            handlePlayerReady,
            setData,
            watchEdit,
        }
    },
})
