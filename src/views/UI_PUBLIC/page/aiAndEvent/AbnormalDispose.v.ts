/*
 * @Description: AI 事件——更多——异常侦测
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-19 09:27:33
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-25 11:05:05
 */
import { cloneDeep } from 'lodash-es'
import { AbnormalDispose, type PresetList, type chlCaps } from '@/types/apiType/aiAndEvent'
import { type TabPaneName, type CheckboxValueType } from 'element-plus'

export default defineComponent({
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
    },
    setup(prop) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const pluginStore = usePluginStore()
        const systemCaps = useCababilityStore()
        const osType = getSystemInfo().platform
        // 系统配置
        const supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
        // 温度检测数据
        const abnormalDisposeData = ref(new AbnormalDispose())

        // 播放器
        const playerRef = ref<PlayerInstance>()

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

        // 页面数据
        const pageData = ref({
            tab: 'param',
            enableList: [
                { value: 'true', label: Translate('IDCS_ON') },
                { value: 'false', label: Translate('IDCS_OFF') },
            ],
            // 声音列表
            voiceList: prop.voiceList,
            // record穿梭框数据源
            recordList: [] as { value: string; label: string }[],
            recordIsShow: false,
            // alarmOut穿梭框数据源
            alarmOutList: [] as { value: string; label: string }[],
            alarmOutIsShow: false,
            // 初始化，后判断应用是否可用
            initComplated: false,
            applyDisabled: true,
            // 消息提示
            notification: [] as string[],
        })
        // 获取录像数据
        const getRecordList = async () => {
            getChlList({
                nodeType: 'chls',
                isSupportSnap: false,
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    $('content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        pageData.value.recordList.push({
                            value: item.attr('id')!,
                            label: $item('name').text(),
                        })
                    })
                })
            })
        }
        // 获取报警输出数据
        const getAlarmOutData = async () => {
            getChlList({
                requireField: ['device'],
                nodeType: 'alarmOuts',
            }).then((result: any) => {
                commLoadResponseHandler(result, ($) => {
                    const rowData = [] as {
                        id: string
                        name: string
                        device: {
                            id: string
                            innerText: string
                        }
                    }[]
                    $('/response/content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        let name = $item('name').text()
                        if ($item('devDesc').text()) {
                            name = $item('devDesc').text() + '_' + name
                        }
                        rowData.push({
                            id: item.attr('id')!,
                            name,
                            device: {
                                id: $item('device').attr('id'),
                                innerText: $item('device').text(),
                            },
                        })
                    })
                    pageData.value.alarmOutList = rowData.map((item) => {
                        return {
                            value: item.id,
                            label: item.name,
                        }
                    })
                })
            })
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
                const sendXML = OCX_XML_SetPluginModel(osType == 'mac' ? 'AvdConfig' : 'ReadOnly', 'Live')
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
        }
        const getAbnormalDisposeData = async () => {
            const sendXml = rawXml`
                <condition><chlId>${prop.currChlId}</chlId></condition>
                <requireField><param/><trigger/></requireField>
                `
            openLoading(LoadingTarget.FullScreen)
            const result = await queryAvd(sendXml)
            closeLoading(LoadingTarget.FullScreen)
            commLoadResponseHandler(result, async ($) => {
                let holdTimeArr = $('/response/content/chl/param/holdTimeNote').text().split(',')
                const holdTime = $('/response/content/chl/param/holdTime').text()
                if (!holdTimeArr.includes(holdTime)) {
                    holdTimeArr.push(holdTime)
                    holdTimeArr = holdTimeArr.sort((a, b) => Number(a) - Number(b))
                }
                const holdTimeList = holdTimeArr.map((item) => {
                    const label = item == '60' ? '1 ' + Translate('IDCS_MINUTE') : Number(item) > 60 ? Number(item) / 60 + ' ' + Translate('IDCS_MINUTES') : item + ' ' + Translate('IDCS_SECONDS')
                    return {
                        value: item,
                        label,
                    }
                })
                const trigger = $('/response/content/chl/trigger')
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
                abnormalDisposeData.value = {
                    holdTime,
                    holdTimeList,
                    sceneChangeSwitch: $('/response/content/chl/param/sceneChangeSwitch').text(),
                    clarityAbnormalSwitch: $('/response/content/chl/param/clarityAbnormalSwitch').text(),
                    colorAbnormalSwitch: $('/response/content/chl/param/colorAbnormalSwitch').text(),
                    sensitivity: Number($('/response/content/chl/param/sensitivity').text()),
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
                handleAbnormalDisposeData()
                pageData.value.initComplated = true
            })
        }
        const handleAbnormalDisposeData = () => {
            if (abnormalDisposeData.value.msgPushSwitch) normalParamCheckList.value.push('msgPushSwitch')
            if (abnormalDisposeData.value.buzzerSwitch) normalParamCheckList.value.push('buzzerSwitch')
            if (abnormalDisposeData.value.popVideoSwitch) normalParamCheckList.value.push('popVideoSwitch')
            if (abnormalDisposeData.value.emailSwitch) normalParamCheckList.value.push('emailSwitch')
            if (abnormalDisposeData.value.catchSnapSwitch) normalParamCheckList.value.push('catchSnapSwitch')
            if (normalParamCheckList.value.length == normalParamList.value.length) {
                normalParamCheckAll.value = true
            }
        }
        // tab切换
        const tabChange = (name: TabPaneName) => {
            if (name == 'param') {
                play()
            }
        }
        // 常规联动多选
        const handleNormalParamCheckAll = (value: CheckboxValueType) => {
            normalParamCheckList.value = value ? normalParamList.value.map((item) => item.value) : []
            if (value) {
                abnormalDisposeData.value.catchSnapSwitch = true
                abnormalDisposeData.value.msgPushSwitch = true
                abnormalDisposeData.value.buzzerSwitch = true
                abnormalDisposeData.value.popVideoSwitch = true
                abnormalDisposeData.value.emailSwitch = true
            }
        }
        const handleNormalParamCheck = (value: CheckboxValueType[]) => {
            normalParamCheckAll.value = value.length === normalParamList.value.length
            abnormalDisposeData.value.catchSnapSwitch = value.includes('catchSnapSwitch')
            abnormalDisposeData.value.msgPushSwitch = value.includes('msgPushSwitch')
            abnormalDisposeData.value.buzzerSwitch = value.includes('buzzerSwitch')
            abnormalDisposeData.value.popVideoSwitch = value.includes('popVideoSwitch')
            abnormalDisposeData.value.emailSwitch = value.includes('emailSwitch')
        }

        // 录像配置相关处理
        const recordConfirm = (e: { value: string; label: string }[]) => {
            abnormalDisposeData.value.record = cloneDeep(e)
            pageData.value.recordIsShow = false
        }
        const recordClose = () => {
            pageData.value.recordIsShow = false
        }
        // 报警输出相关处理
        const alarmOutConfirm = (e: { value: string; label: string }[]) => {
            abnormalDisposeData.value.alarmOut = cloneDeep(e)
            pageData.value.alarmOutIsShow = false
        }
        const alarmOutClose = () => {
            pageData.value.alarmOutIsShow = false
        }
        // 获取联动预置点数据
        const getPresetData = async () => {
            const sendXml = rawXml`
                <types>
                    <nodeType>
                        <enum>chls</enum>
                        <enum>sensors</enum>
                        <enum>alarmOuts</enum>
                    </nodeType>
                </types>
                <nodeType type='nodeType'>chls</nodeType>
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
                rowData = $('/response/content/item').map((item) => {
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
                    abnormalDisposeData.value.preset?.forEach((item) => {
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
                    }
                }

                PresetTableData.value = rowData
            })
        }
        const getPresetById = async (row: PresetList) => {
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
        }
        const presetChange = (row: PresetList) => {
            const ids = abnormalDisposeData.value.preset.map((item) => item.chl.value)
            if (ids.includes(row.id)) {
                abnormalDisposeData.value.preset = abnormalDisposeData.value.preset.filter((item) => row.id != item.chl.value)
            }
            if (row.preset.value !== '') {
                abnormalDisposeData.value.preset.push({
                    index: row.preset.value,
                    name: row.preset.label,
                    chl: {
                        value: row.id,
                        label: row.name,
                    },
                })
            }
            if (abnormalDisposeData.value.preset.length > MAX_TRIGGER_PRESET_COUNT) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_PRESET_LIMIT'),
                })
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
            let sendXml = rawXml`<content>
                <chl id='${prop.currChlId}'>
                <param>
                <holdTime unit='s'>${abnormalDisposeData.value.holdTime}</holdTime>
                <sensitivity>${String(abnormalDisposeData.value.sensitivity)}</sensitivity>
            `
            if (abnormalDisposeData.value.sceneChangeSwitch) {
                sendXml += rawXml`<sceneChangeSwitch >${abnormalDisposeData.value.sceneChangeSwitch}</sceneChangeSwitch>`
            }
            if (abnormalDisposeData.value.clarityAbnormalSwitch) {
                sendXml += rawXml`<clarityAbnormalSwitch >${abnormalDisposeData.value.clarityAbnormalSwitch}</clarityAbnormalSwitch>`
            }
            if (abnormalDisposeData.value.colorAbnormalSwitch) {
                sendXml += rawXml`<colorAbnormalSwitch >${abnormalDisposeData.value.colorAbnormalSwitch}</colorAbnormalSwitch>`
            }
            sendXml += rawXml`</param>
                <trigger>
                    <sysRec>
                    <chls type='list'>
            `
            abnormalDisposeData.value.record.forEach((item) => {
                sendXml += rawXml`<item id='${item.value}'>
                        <![CDATA[${item.label}]]></item>`
            })
            sendXml += `</chls></sysRec>
                <alarmOut>
                <alarmOuts type='list'>
            `
            abnormalDisposeData.value.alarmOut.forEach((item) => {
                sendXml += rawXml`<item id='${item.value}'>
                        <![CDATA[${item.label}]]></item>`
            })
            sendXml += `</alarmOuts>
                </alarmOut>
                <preset>
                <presets type='list'>
            `
            abnormalDisposeData.value.preset.forEach((item) => {
                sendXml += rawXml`<item>
                    <index>${item.index}</index>
                        <name><![CDATA[${item.name}]]></name>
                        <chl id='${item.chl.value}'><![CDATA[${item.chl.label}]]></chl>
                        </item>`
            })
            sendXml += rawXml`</presets>
                </preset>
                <snapSwitch>${String(abnormalDisposeData.value.catchSnapSwitch)}</snapSwitch>
                <msgPushSwitch>${String(abnormalDisposeData.value.msgPushSwitch)}</msgPushSwitch>
                <buzzerSwitch>${String(abnormalDisposeData.value.buzzerSwitch)}</buzzerSwitch>
                <popVideoSwitch>${String(abnormalDisposeData.value.popVideoSwitch)}</popVideoSwitch>
                <emailSwitch>${String(abnormalDisposeData.value.emailSwitch)}</emailSwitch>
                <sysAudio id='${abnormalDisposeData.value.sysAudio}'></sysAudio>
                </trigger>
                </chl></content>`
            return sendXml
        }

        const applyAbnormalDisposeData = async () => {
            const sendXml = getAbnormalDisposeSaveData()
            openLoading(LoadingTarget.FullScreen)
            const result = await editAvd(sendXml)
            closeLoading(LoadingTarget.FullScreen)
            const $ = queryXml(result)
            if ($('/response/status').text() == 'success') {
                pageData.value.applyDisabled = true
            }
        }
        onMounted(async () => {
            await getRecordList()
            await getAlarmOutData()
            await getAbnormalDisposeData()
            await getPresetData()
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
            // 联动方式
            handleNormalParamCheckAll,
            handleNormalParamCheck,
            recordConfirm,
            recordClose,
            alarmOutConfirm,
            alarmOutClose,
            presetChange,
            // 提交异常侦测数据
            applyAbnormalDisposeData,
        }
    },
})
