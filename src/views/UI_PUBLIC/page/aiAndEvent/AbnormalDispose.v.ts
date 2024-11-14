/*
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-19 09:27:33
 * @Description: AI 事件——更多——异常侦测
 */
import { AlarmAbnormalDisposeDto, type AlarmChlDto } from '@/types/apiType/aiAndEvent'
import { type TabPaneName } from 'element-plus'
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
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const pluginStore = usePluginStore()
        const systemCaps = useCababilityStore()
        const osType = getSystemInfo().platform

        // 系统配置
        const supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
        // 异常侦测表单数据
        const abnormalDisposeData = ref(new AlarmAbnormalDisposeDto())

        // 播放器
        const playerRef = ref<PlayerInstance>()

        // 页面数据
        const pageData = ref({
            tab: 'param',
            enableList: getSwitchOptions(),
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
                const sendXML = OCX_XML_SetPluginModel(osType === 'mac' ? 'AvdConfig' : 'ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
        }

        const getAbnormalDisposeData = async () => {
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
            const result = await queryAvd(sendXml)
            closeLoading()
            commLoadResponseHandler(result, async ($) => {
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
                const trigger = $('//content/chl/trigger')
                const $trigger = queryXml(trigger[0].element)

                abnormalDisposeData.value = {
                    holdTime,
                    holdTimeList,
                    sceneChangeSwitch: $('//content/chl/param/sceneChangeSwitch').text(),
                    clarityAbnormalSwitch: $('//content/chl/param/clarityAbnormalSwitch').text(),
                    colorAbnormalSwitch: $('//content/chl/param/colorAbnormalSwitch').text(),
                    sensitivity: $('//content/chl/param/sensitivity').text().num(),
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
                    sysAudio: $('sysAudio').attr('id'),
                }
            }).then(() => {
                pageData.value.initComplated = true
            })
        }

        // tab切换
        const tabChange = (name: TabPaneName) => {
            if (name === 'param') {
                play()
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        const getAbnormalDisposeSaveData = () => {
            const sendXml = rawXml`
                <content>
                    <chl id='${prop.currChlId}'>
                        <param>
                            <holdTime unit='s'>${abnormalDisposeData.value.holdTime}</holdTime>
                            <sensitivity>${abnormalDisposeData.value.sensitivity}</sensitivity>
                            ${abnormalDisposeData.value.sceneChangeSwitch ? `<sceneChangeSwitch >${abnormalDisposeData.value.sceneChangeSwitch}</sceneChangeSwitch>` : ''}
                            ${abnormalDisposeData.value.clarityAbnormalSwitch ? `<clarityAbnormalSwitch >${abnormalDisposeData.value.clarityAbnormalSwitch}</clarityAbnormalSwitch>` : ''}
                            ${abnormalDisposeData.value.colorAbnormalSwitch ? `<colorAbnormalSwitch >${abnormalDisposeData.value.colorAbnormalSwitch}</colorAbnormalSwitch>` : ''}
                        </param>
                        <trigger>
                            <sysRec>
                                <chls type='list'>
                                    ${abnormalDisposeData.value.record
                                        .map((item) => {
                                            return `<item id='${item.value}'><![CDATA[${item.label}]]></item>`
                                        })
                                        .join('')}
                                </chls>
                            </sysRec>
                            <alarmOut>
                                <alarmOuts type='list'>
                                    ${abnormalDisposeData.value.alarmOut
                                        .map((item) => {
                                            return `<item id='${item.value}'><![CDATA[${item.label}]]></item>`
                                        })
                                        .join('')}
                                </alarmOuts>
                            </alarmOut>
                            <preset>
                                <presets type='list'>
                                    ${abnormalDisposeData.value.preset
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
                            <snapSwitch>${abnormalDisposeData.value.trigger.includes('snapSwitch')}</snapSwitch>
                            <msgPushSwitch>${abnormalDisposeData.value.trigger.includes('msgPushSwitch')}</msgPushSwitch>
                            <buzzerSwitch>${abnormalDisposeData.value.trigger.includes('buzzerSwitch')}</buzzerSwitch>
                            <popVideoSwitch>${abnormalDisposeData.value.trigger.includes('popVideoSwitch')}</popVideoSwitch>
                            <emailSwitch>${abnormalDisposeData.value.trigger.includes('emailSwitch')}</emailSwitch>
                            <sysAudio id='${abnormalDisposeData.value.sysAudio}'></sysAudio>
                        </trigger>
                    </chl>
                </content>
            `

            return sendXml
        }

        const applyAbnormalDisposeData = async () => {
            const sendXml = getAbnormalDisposeSaveData()
            openLoading()
            const result = await editAvd(sendXml)
            closeLoading()
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                pageData.value.applyDisabled = true
            }
        }

        onMounted(() => {
            getAbnormalDisposeData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable()) {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        })

        watch(
            abnormalDisposeData,
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
            supportAlarmAudioConfig,
            playerRef,
            abnormalDisposeData,
            pageData,
            // 播放器就绪
            handlePlayerReady,
            // tab项切换（参数设置，联动方式）
            tabChange,
            // 提交异常侦测数据
            applyAbnormalDisposeData,
            AlarmBaseRecordSelector,
            AlarmBaseAlarmOutSelector,
            AlarmBaseTriggerSelector,
            AlarmBasePresetSelector,
        }
    },
})
