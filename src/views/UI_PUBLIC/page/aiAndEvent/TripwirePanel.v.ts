/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 11:16:22
 * @Description: 越界
 */
import ChannelPtzCtrlPanel from '@/views/UI_PUBLIC/page/channel/ChannelPtzCtrlPanel.vue'
import { type XMLQuery } from '@/utils/xmlParse'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import AlarmBaseIPSpeakerSelector from './AlarmBaseIPSpeakerSelector.vue'
import AlarmBaseResourceData from './AlarmBaseResourceData.vue'
import AlarmBaseErrorPanel from './AlarmBaseErrorPanel.vue'

export default defineComponent({
    components: {
        ChannelPtzCtrlPanel,
        AlarmBaseRecordSelector,
        AlarmBaseAlarmOutSelector,
        AlarmBaseTriggerSelector,
        AlarmBasePresetSelector,
        AlarmBaseIPSpeakerSelector,
        AlarmBaseResourceData,
        AlarmBaseErrorPanel,
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
        const { Translate } = useLangStore()
        const playerRef = ref<PlayerInstance>()

        const directionTypeTip: Record<string, string> = {
            none: 'A<->B',
            rightortop: 'A->B',
            leftorbotton: 'A<-B',
        }

        const detectTargetTypeTip: Record<string, string> = {
            person: Translate('IDCS_DETECTION_PERSON'),
            car: Translate('IDCS_DETECTION_VEHICLE'),
            motor: Translate('IDCS_NON_VEHICLE'),
        }

        const pageData = ref({
            // 是否支持声音设置
            supportAlarmAudioConfig: true,
            // 请求数据失败显示提示
            reqFail: false,
            // 选择的功能:param,target,trigger
            tab: 'param',
            // 排程管理
            isSchedulePop: false,
            scheduleList: [] as SelectOption<string, string>[],
            // 配置模式
            objectFilterMode: 'mode1',
            // 选择的警戒面
            surfaceIndex: 0,
            surfaceChecked: [] as number[],
            // 是否显示全部区域绑定值
            isShowAllArea: false,
            // 控制显示最值区域
            isShowDisplayRange: false,
            // 云台speed
            tripWirespeed: 0,
            // 云台锁定状态
            lockStatus: false,
            moreDropDown: false,
        })

        const formData = ref(new AlarmTripwireDto())
        const watchEdit = useWatchEditData(formData)

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']
        let drawer = CanvasPassline()

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

        // 显示人的勾选框 + 灵敏度配置项
        const showAllPersonTarget = computed(() => {
            const surfaceIndex = pageData.value.surfaceIndex
            const haslineInfo = formData.value.lineInfo.length > 0
            return haslineInfo && formData.value.lineInfo[surfaceIndex].objectFilter.supportPerson
        })

        // 显示车的勾选框 + 灵敏度配置项
        const showAllCarTarget = computed(() => {
            const surfaceIndex = pageData.value.surfaceIndex
            const haslineInfo = formData.value.lineInfo.length > 0
            return haslineInfo && formData.value.lineInfo[surfaceIndex].objectFilter.supportCar
        })

        // 显示摩托车的勾选框 + 灵敏度配置项
        const showAllMotorTarget = computed(() => {
            const surfaceIndex = pageData.value.surfaceIndex
            const haslineInfo = formData.value.lineInfo.length > 0
            return haslineInfo && formData.value.lineInfo[surfaceIndex].objectFilter.supportMotor
        })

        // 显示人的灵敏度配置项
        const showPersonSentity = computed(() => {
            const surfaceIndex = pageData.value.surfaceIndex
            const hasLineInfo = formData.value.lineInfo.length > 0
            return hasLineInfo && formData.value.lineInfo[surfaceIndex].objectFilter.person.supportSensitivity
        })

        // 显示车的灵敏度配置项
        const showCarSentity = computed(() => {
            const surfaceIndex = pageData.value.surfaceIndex
            const hasLineInfo = formData.value.lineInfo.length > 0
            return hasLineInfo && formData.value.lineInfo[surfaceIndex].objectFilter.car.supportSensitivity
        })

        // 显示摩托车的灵敏度配置项
        const showMotorSentity = computed(() => {
            const surfaceIndex = pageData.value.surfaceIndex
            const hasLineInfo = formData.value.lineInfo.length > 0
            return hasLineInfo && formData.value.lineInfo[surfaceIndex].objectFilter.motor.supportSensitivity
        })

        /**
         * @description 播放器准备就绪回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                drawer.destroy()
                drawer = CanvasPassline({
                    el: player.getDrawbordCanvas(),
                    enableOSD: true,
                    enableShowAll: false,
                    onchange: changeTripwire,
                })
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

        // 首次加载成功 播放tripwire视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && watchEdit.ready.value) {
                nextTick(() => {
                    play()
                    changeTab()
                })
                stopWatchFirstPlay()
            }
        })

        /**
         * @description 修改速度
         * @param {Number} speed
         */
        const setSpeed = (speed: number) => {
            pageData.value.tripWirespeed = speed
        }

        /**
         * @description 关闭排程管理后刷新排程列表
         */
        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            formData.value.schedule = getScheduleId(pageData.value.scheduleList, formData.value.schedule)
        }

        // 此类ipc不支持请求param
        const supportPeaTrigger = computed(() => {
            return !props.chlData.supportTripwire && !props.chlData.supportBackTripwire && props.chlData.supportPeaTrigger
        })

        /**
         * @description 获取越界检测配置
         */
        const getTripwireData = async () => {
            openLoading()

            if (supportPeaTrigger.value) {
                const sendXML = rawXml`
                    <condition>
                        <chlId>${props.currChlId}</chlId>
                    </condition>
                    <requireField>
                        <trigger/>
                    </requireField>
                `
                const res = await queryTripwire(sendXML)
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    formData.value.schedule = getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid'))

                    const $trigger = queryXml($('content/chl/trigger')[0].element)

                    formData.value.trigger = ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch'].filter((item) => {
                        return $trigger(item).text().bool()
                    })

                    formData.value.sysAudio = $trigger('sysAudio').attr('id')

                    formData.value.record = $trigger('sysRec/chls/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    })

                    formData.value.alarmOut = $trigger('alarmOut/alarmOuts/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    })

                    formData.value.preset = $trigger('preset/presets/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            index: $item('index').text(),
                            name: $item('name').text(),
                            chl: {
                                value: $item('chl').attr('id'),
                                label: $item('chl').text(),
                            },
                        }
                    })

                    formData.value.ipSpeaker = $trigger('triggerAudioDevice/chls/item').map((item) => {
                        return {
                            ipSpeakerId: item.attr('id'),
                            audioID: item.attr('audioID'),
                        }
                    })

                    watchEdit.listen()
                } else {
                    pageData.value.reqFail = true
                    pageData.value.tab = ''
                }
            } else {
                const sendXML = rawXml`
                    <condition>
                        <chlId>${props.currChlId}</chlId>
                    </condition>
                    <requireField>
                        <param/>
                        <trigger/>
                    </requireField>
                `
                const res = await queryTripwire(sendXML)
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    const $trigger = queryXml($('content/chl/trigger')[0].element)
                    const $param = queryXml($('content/chl/param')[0].element)

                    formData.value.schedule = getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid'))

                    formData.value.directionList = $('types/direction/enum').map((item) => {
                        return {
                            value: item.text(),
                            label: directionTypeTip[item.text()],
                        }
                    })

                    formData.value.trigger = ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch'].filter((item) => {
                        return $trigger(item).text().bool()
                    })

                    formData.value.mutexList = $param('mutexList/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    })

                    formData.value.mutexListEx = $param('mutexListEx/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    })

                    formData.value.holdTime = $param('alarmHoldTime').text().num()
                    formData.value.holdTimeList = getAlarmHoldTimeList($param('holdTimeNote').text(), formData.value.holdTime)

                    // 解析检测目标的数据
                    const objectFilterMode = getCurrentAICfgMode('line', $param)
                    pageData.value.objectFilterMode = objectFilterMode
                    const $paramObjectFilter = $('content/chl/param/objectFilter')
                    let objectFilter = ref(new AlarmObjectFilterCfgDto())
                    if (objectFilterMode === 'mode1') {
                        // 模式一
                        if ($param('objectFilter').text() !== '') {
                            objectFilter = getObjectFilterData(objectFilterMode, $paramObjectFilter, [])
                        }
                    }
                    $param('line/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        // 下列模式需要获取从line/item/objectFilter获取检测目标配置数据
                        const needResetObjectList = ['mode2', 'mode3', 'mode5']
                        const needResetObjectFilter = needResetObjectList.indexOf(objectFilterMode) > -1
                        if (needResetObjectFilter) {
                            // 模式2灵敏度相关数据从chl/param/objectFilter节点获取
                            const $resultNode = objectFilterMode === 'mode2' ? $paramObjectFilter : []
                            objectFilter = getObjectFilterData(objectFilterMode, $item('objectFilter'), $resultNode)
                        }

                        // ONVIF存在每个区域有公共灵敏度和开关
                        if (objectFilterMode === 'mode5') {
                            // NTA1-3733 存在只有开关的情况
                            const supportCommonEnable = $item('switch').length > 0
                            const supportCommonSensitivity = supportCommonEnable && $item('>sensitivity').length > 0
                            if (supportCommonSensitivity) {
                                objectFilter.value.supportCommonEnable = supportCommonEnable
                                objectFilter.value.supportCommonSensitivity = supportCommonSensitivity
                                objectFilter.value.commonSensitivity.enable = $item('switch').text().bool()
                                objectFilter.value.commonSensitivity.value = $item('sensitivity').text().num()
                                objectFilter.value.commonSensitivity.min = $item('sensitivity').attr('min').num()
                                objectFilter.value.commonSensitivity.max = $item('sensitivity').attr('max').num()
                            } else if (supportCommonEnable) {
                                objectFilter.value.supportCommonEnable = supportCommonEnable
                                objectFilter.value.commonSensitivity.enable = $item('switch').text().bool()
                            }
                        }
                        formData.value.lineInfo.push({
                            objectFilter: objectFilter.value,
                            direction: $item('direction').text() as CanvasPasslineDirection,
                            startPoint: {
                                X: $item('startPoint/X').text().num(),
                                Y: $item('startPoint/Y').text().num(),
                            },
                            endPoint: {
                                X: $item('endPoint/X').text().num(),
                                Y: $item('endPoint/Y').text().num(),
                            },
                        })
                    })
                    formData.value.direction = formData.value.lineInfo[pageData.value.surfaceIndex].direction
                    formData.value.detectionEnable = $param('switch').text().bool()
                    formData.value.originalEnable = formData.value.detectionEnable
                    formData.value.audioSuport = $param('triggerAudio').text() !== ''
                    formData.value.lightSuport = $param('triggerWhiteLight').text() !== ''
                    formData.value.hasAutoTrack = $param('autoTrack').text() !== ''
                    formData.value.autoTrack = $param('autoTrack').text().bool()
                    formData.value.pictureAvailable = $param('saveTargetPicture').text() !== ''
                    formData.value.saveTargetPicture = $param('aveTargetPicture').text().bool()
                    formData.value.saveSourcePicture = $param('saveSourcePicture').text().bool()
                    formData.value.onlyPreson = $param('sensitivity').text() !== ''
                    // NTA1-231：低配版IPC：4M S4L-C，越界/区域入侵目标类型只支持人
                    formData.value.sensitivity = formData.value.onlyPreson ? $param('sensitivity').text().num() : 0

                    // 默认用lineInfo的第一个数据初始化检测目标
                    if (formData.value.lineInfo[0].objectFilter.detectTargetList.length) {
                        formData.value.detectTargetList = formData.value.lineInfo[0].objectFilter.detectTargetList.map((item) => {
                            return {
                                value: item,
                                label: detectTargetTypeTip[item],
                            }
                        })
                        formData.value.detectTarget = formData.value.detectTargetList[0].value
                    }

                    formData.value.sysAudio = $trigger('sysAudio').attr('id')
                    formData.value.record = $trigger('sysRec/chls/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    })

                    formData.value.alarmOut = $trigger('alarmOut/alarmOuts/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    })

                    formData.value.preset = $trigger('preset/presets/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            index: $item('index').text(),
                            name: $item('name').text(),
                            chl: {
                                value: $item('chl').attr('id'),
                                label: $item('chl').text(),
                            },
                        }
                    })

                    formData.value.ipSpeaker = $trigger('triggerAudioDevice/chls/item').map((item) => {
                        return {
                            ipSpeakerId: item.attr('id'),
                            audioID: item.attr('audioID'),
                        }
                    })

                    if (formData.value.audioSuport && props.chlData.supportAudio) {
                        formData.value.triggerList.push('triggerAudio')
                        const triggerAudio = $param('triggerAudio').text().bool()
                        if (triggerAudio) {
                            formData.value.trigger.push('triggerAudio')
                        }
                    }

                    if (formData.value.lightSuport && props.chlData.supportWhiteLight) {
                        formData.value.triggerList.push('triggerWhiteLight')
                        const triggerWhiteLight = $param('triggerWhiteLight').text().bool()
                        if (triggerWhiteLight) {
                            formData.value.trigger.push('triggerWhiteLight')
                        }
                    }

                    watchEdit.listen()
                } else {
                    pageData.value.reqFail = true
                    pageData.value.tab = ''
                }
            }
        }

        /**
         * @description 组装param根节点下的ObjectFilter数据
         */
        const setParamObjectFilterData = () => {
            let paramXml = ''
            const noParamObjectNodeList = ['mode0', 'mode4', 'mode5'] // 模式0,4,5不需要下发基础的objectFilter节点
            if (noParamObjectNodeList.indexOf(pageData.value.objectFilterMode) === -1) {
                // 模式1、2、3均要下发基础的objectFilter节点
                paramXml = setObjectFilterXmlData(formData.value.lineInfo[0].objectFilter, props.chlData)
            }
            return paramXml
        }

        /**
         * @description 组装各个区域下的ObjectFilter节点数据
         */
        const setItemObjectFilterData = (item: { objectFilter: globalThis.AlarmObjectFilterCfgDto }) => {
            let paramXml = ''
            const singleDetectCfgList = ['mode2', 'mode3', 'mode5'] // 上述模式每个区域可单独配置检测目标或目标大小
            if (singleDetectCfgList.indexOf(pageData.value.objectFilterMode) !== -1) {
                paramXml += setObjectFilterXmlData(item.objectFilter, props.chlData)
            }

            return paramXml
        }

        /**
         * @description 保存越界检测配置
         */
        const saveData = async () => {
            let paramXml = ''
            const data = formData.value
            if (!supportPeaTrigger.value) {
                paramXml = rawXml`<param>
                    <switch>${data.detectionEnable}</switch>
                    <alarmHoldTime unit="s">${data.holdTime}</alarmHoldTime>
                    ${data.autoTrack ? `<autoTrack>${data.autoTrack}</autoTrack>` : ''}
                    ${data.audioSuport && props.chlData.supportAudio ? `<triggerAudio>${data.trigger.includes('triggerAudio')}</triggerAudio>` : ''}
                    ${data.lightSuport && props.chlData.supportWhiteLight ? `<triggerWhiteLight>${data.trigger.includes('triggerWhiteLight')}</triggerWhiteLight>` : ''}
                    ${
                        data.pictureAvailable
                            ? rawXml`
                            <saveSourcePicture>${data.saveSourcePicture}</saveSourcePicture>
                            <saveTargetPicture>${data.saveTargetPicture}</saveTargetPicture>
                        `
                            : ''
                    }
                    ${data.hasAutoTrack ? `<autoTrack>${data.autoTrack}</autoTrack>` : ''}
                    ${data.onlyPreson ? `<sensitivity>${data.sensitivity}</sensitivity>` : ''}
                    ${setParamObjectFilterData()}
                    <line type="list" count="${data.lineInfo.length}">
                        <itemType>
                        <direction type="direction"/>
                        </itemType>
                        ${formData.value.lineInfo
                            .map((element) => {
                                return rawXml`
                                    <item>
                                        <direction type="direction">${element.direction}</direction>
                                        <startPoint>
                                            <X>${element.startPoint.X}</X>
                                            <Y>${element.startPoint.Y}</Y>
                                        </startPoint>
                                        <endPoint>
                                            <X>${element.endPoint.X}</X>
                                            <Y>${element.endPoint.Y}</Y>
                                        </endPoint>
                                        ${setItemObjectFilterData(element)}
                                        ${
                                            element.objectFilter.supportCommonSensitivity
                                                ? rawXml`
                                                ${element.objectFilter.supportCommonEnable ? `<switch>${element.objectFilter.commonSensitivity.enable}</switch>` : ''}
                                                <sensitivity>${element.objectFilter.commonSensitivity.value}</sensitivity>`
                                                : ''
                                        }
                                        ${element.objectFilter.supportCommonEnable ? `<switch>${element.objectFilter.commonSensitivity.enable}</switch>` : ''}
                                    </item>
                                `
                            })
                            .join('')}
                    </line>
                </param>`
            }
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}" scheduleGuid="${formData.value.schedule}">
                        ${paramXml}
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
            const result = await editTripwire(sendXml)
            const $ = queryXml(result)
            closeLoading()
            if ($('status').text() === 'success') {
                // NT-9292 开关为开把originalSwitch置为true避免多次弹出互斥提示
                if (formData.value.detectionEnable) {
                    formData.value.originalEnable = formData.value.detectionEnable
                }
                refreshInitPage()
                watchEdit.update()
            } else {
                const errorCode = $('errorCode').text().num()
                switch (errorCode) {
                    case 536870983:
                        openMessageBox(Translate('IDCS_DECODE_CAPABILITY_NOT_ENOUGH'))
                        break
                    case 536871091:
                        openMessageBox(Translate('IDCS_RESOLUTION_OVER_CAPABILITY'))
                        break
                    default:
                        openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                        break
                }
            }
        }

        /**
         * @description 执行保存配置，检查互斥通道
         */
        const applyData = () => {
            if (!props.chlData.supportTripwire && !props.chlData.supportBackTripwire && props.chlData.supportPeaTrigger) {
                saveData()
            } else {
                checkMutexChl({
                    isChange: formData.value.detectionEnable && formData.value.detectionEnable !== formData.value.originalEnable,
                    mutexList: formData.value.mutexList,
                    mutexListEx: formData.value.mutexListEx,
                    chlName: props.chlData.name,
                    chlIp: props.chlData.ip,
                    chlList: props.onlineChannelList,
                    tips: 'IDCS_SIMPLE_TRIPWIRE_DETECT_TIPS',
                }).then(() => {
                    saveData()
                })
            }
        }

        /**
         * @description 获取排程列表
         */
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        /**
         * @description Tab切换
         */
        const changeTab = async () => {
            if (pageData.value.tab === 'param') {
                if (mode.value === 'h5') {
                    drawer.setEnable('line', true)
                }

                if (mode.value === 'ocx') {
                    const sendXML2 = OCX_XML_SetTripwireLineAction('EDIT_ON')
                    plugin.ExecuteCmd(sendXML2)
                }

                setTripwireOcxData()
            } else if (pageData.value.tab === 'trigger') {
                showAllArea(false)

                if (mode.value === 'h5') {
                    drawer.clear()
                    drawer.setEnable('line', false)
                }

                if (mode.value === 'ocx') {
                    const sendXML1 = OCX_XML_SetTripwireLineAction('NONE')
                    plugin.ExecuteCmd(sendXML1)

                    const sendXML2 = OCX_XML_SetTripwireLineAction('EDIT_OFF')
                    plugin.ExecuteCmd(sendXML2)
                }
            }
        }

        /**
         * @description 刷新页面数据
         */
        const refreshInitPage = () => {
            // 区域状态
            pageData.value.surfaceChecked = formData.value.lineInfo.map((lineInfo, index) => {
                if (lineInfo.startPoint.X || lineInfo.startPoint.Y || lineInfo.endPoint.X || lineInfo.endPoint.Y) {
                    return index
                } else {
                    return -1
                }
            })
        }

        /**
         * @description 开关显示全部区域
         */
        const toggleShowAllArea = () => {
            showAllArea(pageData.value.isShowAllArea)
        }

        /**
         * @description 开关显示大小范围区域
         */
        const toggleDisplayRange = () => {
            showDisplayRange()
        }

        /**
         * @description 切换警戒面
         */
        const changeSurface = () => {
            formData.value.direction = formData.value.lineInfo[pageData.value.surfaceIndex].direction
            setTripwireOcxData()
            showDisplayRange()
        }

        /**
         * @description 切换方向
         */
        const changeDirection = () => {
            formData.value.lineInfo[pageData.value.surfaceIndex].direction = formData.value.direction
            setTripwireOcxData()
        }

        /**
         * @description 校验目标范围最大最小值
         * @param {string} type
         */
        const checkMinMaxRange = (type: string) => {
            const surfaceIndex = pageData.value.surfaceIndex
            const detectTarget = formData.value.detectTarget
            // 最小区域宽
            const minTextW = formData.value.lineInfo[surfaceIndex].objectFilter[detectTarget].minRegionInfo.width
            // 最小区域高
            const minTextH = formData.value.lineInfo[surfaceIndex].objectFilter[detectTarget].minRegionInfo.height
            // 最大区域宽
            const maxTextW = formData.value.lineInfo[surfaceIndex].objectFilter[detectTarget].maxRegionInfo.width
            // 最大区域高
            const maxTextH = formData.value.lineInfo[surfaceIndex].objectFilter[detectTarget].maxRegionInfo.height

            const errorMsg = Translate('IDCS_MIN_LESS_THAN_MAX')
            switch (type) {
                case 'minTextW':
                    if (minTextW >= maxTextW) {
                        openMessageBox(errorMsg)
                        formData.value.lineInfo[surfaceIndex].objectFilter[detectTarget].minRegionInfo.width = maxTextW - 1
                    }
                    break
                case 'minTextH':
                    if (minTextH >= maxTextH) {
                        openMessageBox(errorMsg)
                        formData.value.lineInfo[surfaceIndex].objectFilter[detectTarget].minRegionInfo.height = maxTextH - 1
                    }
                    break
                case 'maxTextW':
                    if (maxTextW <= minTextW) {
                        openMessageBox(errorMsg)
                        formData.value.lineInfo[surfaceIndex].objectFilter[detectTarget].maxRegionInfo.width = minTextW + 1
                    }
                    break
                case 'maxTextH':
                    if (maxTextH <= minTextH) {
                        openMessageBox(errorMsg)
                        formData.value.lineInfo[surfaceIndex].objectFilter[detectTarget].maxRegionInfo.height = minTextH + 1
                    }
                    break
                default:
                    break
            }
        }

        /**
         * @description 获取云台锁定状态
         */
        const getPTZLockStatus = async () => {
            const sendXML = rawXml`
                <condition>
                    <chlId>${props.currChlId}</chlId>
                </condition>
            `
            const res = await queryBallIPCPTZLockCfg(sendXML)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.lockStatus = $('content/chl/param/PTZLock').text().bool()
            }
        }

        /**
         * @description 修改云台锁定状态
         */
        const editLockStatus = () => {
            const sendXML = rawXml`
                <content>
                    <chl id='${props.currChlId}'>
                        <param>
                            <PTZLock>${!pageData.value.lockStatus}</PTZLock>
                        </param>
                    </chl>
                </content>
            `
            openLoading()
            editBallIPCPTZLockCfg(sendXML).then((res) => {
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    closeLoading()
                    pageData.value.lockStatus = !pageData.value.lockStatus
                }
            })
        }

        /**
         * @description 绘制
         * @param {CanvasPasslinePassline} passline
         */
        const changeTripwire = (passline: CanvasPasslinePassline) => {
            const surface = pageData.value.surfaceIndex
            formData.value.lineInfo[surface].startPoint = {
                X: passline.startX,
                Y: passline.startY,
            }
            formData.value.lineInfo[surface].endPoint = {
                X: passline.endX,
                Y: passline.endY,
            }
            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        /**
         * @description 是否显示所有区域
         * @param {boolean} isShowAll
         */
        const showAllArea = (isShowAll: boolean) => {
            if (mode.value === 'h5') {
                drawer.setEnableShowAll(isShowAll)
            }

            if (isShowAll) {
                const lineInfoList = formData.value.lineInfo
                const currentSurface = pageData.value.surfaceIndex

                if (mode.value === 'h5') {
                    drawer.setCurrentSurfaceOrAlarmLine(currentSurface)
                    drawer.drawAllPassline(lineInfoList, currentSurface)
                }

                if (mode.value === 'ocx') {
                    const pluginLineInfoList = cloneDeep(lineInfoList)
                    pluginLineInfoList.splice(currentSurface, 1) // 插件端下发全部区域需要过滤掉当前区域数据

                    const sendXML = OCX_XML_SetAllArea({ lineInfoList: pluginLineInfoList }, 'WarningLine', OCX_AI_EVENT_TYPE_TRIPWIRE_LINE, '', true)
                    plugin.ExecuteCmd(sendXML)
                }
            } else {
                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetAllArea({}, 'WarningLine', OCX_AI_EVENT_TYPE_TRIPWIRE_LINE, '', false)
                    plugin.ExecuteCmd(sendXML)
                }
                setTripwireOcxData()
            }
        }

        /**
         * @description 是否显示大小范围区域
         */
        const showDisplayRange = () => {
            if (pageData.value.isShowDisplayRange) {
                const currentSurface = pageData.value.surfaceIndex
                const currTargetType = formData.value.detectTarget // 人/车/非
                const minRegionInfo = formData.value.lineInfo[currentSurface].objectFilter[currTargetType].minRegionInfo // 最小区域
                const maxRegionInfo = formData.value.lineInfo[currentSurface].objectFilter[currTargetType].maxRegionInfo // 最大区域
                const minPercentW = minRegionInfo.width
                const minPercentH = minRegionInfo.height
                const maxPercentW = maxRegionInfo.width
                const maxPercentH = maxRegionInfo.height
                minRegionInfo.region = []
                maxRegionInfo.region = []
                minRegionInfo.region.push(calcRegionInfo(minPercentW, minPercentH))
                maxRegionInfo.region.push(calcRegionInfo(maxPercentW, maxPercentH))

                if (mode.value === 'h5') {
                    drawer.setRangeMin(minRegionInfo.region[0])
                    drawer.setRangeMax(maxRegionInfo.region[0])
                    drawer.toggleRange(true)
                }

                if (mode.value === 'ocx') {
                    // 插件需要先删除区域 再重新添加区域进行显示
                    const areaList = [1, 2]
                    const sendXMLClear = OCX_XML_DeleteRectangleArea(areaList)
                    plugin.ExecuteCmd(sendXMLClear)

                    const rectangles = [
                        {
                            ...minRegionInfo.region[0],
                            ID: 1,
                            text: 'Min',
                            LineColor: 'yellow',
                        },
                        {
                            ...maxRegionInfo.region[0],
                            ID: 2,
                            text: 'Max',
                            LineColor: 'yellow',
                        },
                    ]
                    const sendXML = OCX_XML_AddRectangleArea(rectangles)
                    plugin.ExecuteCmd(sendXML)
                }
            } else {
                if (mode.value === 'h5') {
                    drawer.toggleRange(false)
                }

                if (mode.value === 'ocx') {
                    const areaList = [1, 2]
                    const sendXMLClear = OCX_XML_DeleteRectangleArea(areaList)
                    plugin.ExecuteCmd(sendXMLClear)
                }
            }
        }

        /**
         * @description  计算最大值最小值区域 画布分割为 10000 * 10000
         * @param {number} widthPercent
         * @param {number} heightPercent
         */
        const calcRegionInfo = (widthPercent: number, heightPercent: number) => {
            const X1 = ((100 - widthPercent) * 10000) / 100 / 2
            const X2 = ((100 - widthPercent) * 10000) / 100 / 2 + (widthPercent * 10000) / 100
            const Y1 = ((100 - heightPercent) * 10000) / 100 / 2
            const Y2 = ((100 - heightPercent) * 10000) / 100 / 2 + (heightPercent * 10000) / 100
            const regionInfo = {
                X1: X1,
                Y1: Y1,
                X2: X2,
                Y2: Y2,
            }
            return regionInfo
        }

        /**
         * @description 显示OCX
         */
        const setTripwireOcxData = () => {
            if (pageData.value.tab === 'param') {
                const surface = pageData.value.surfaceIndex
                if (formData.value.lineInfo.length > 0) {
                    if (mode.value === 'h5') {
                        drawer.setCurrentSurfaceOrAlarmLine(surface)
                        drawer.setDirection(formData.value.lineInfo[surface].direction)
                        drawer.setPassline({
                            startX: formData.value.lineInfo[surface].startPoint.X,
                            startY: formData.value.lineInfo[surface].startPoint.Y,
                            endX: formData.value.lineInfo[surface].endPoint.X,
                            endY: formData.value.lineInfo[surface].endPoint.Y,
                        })
                    }

                    if (mode.value === 'ocx') {
                        const sendXML = OCX_XML_SetTripwireLine(formData.value.lineInfo[surface])
                        plugin.ExecuteCmd(sendXML)
                    }
                }

                if (pageData.value.isShowAllArea) {
                    showAllArea(true)
                }
            }
        }

        /**
         * @description 清空当前区域
         */
        const clearArea = () => {
            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetTripwireLineAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            const surface = pageData.value.surfaceIndex
            formData.value.lineInfo[surface].startPoint = {
                X: 0,
                Y: 0,
            }
            formData.value.lineInfo[surface].endPoint = {
                X: 0,
                Y: 0,
            }
            drawer.clear()
        }

        /**
         * @description 清空所有区域
         */
        const clearAllArea = () => {
            formData.value.lineInfo.forEach((lineInfo) => {
                lineInfo.startPoint = {
                    X: 0,
                    Y: 0,
                }
                lineInfo.endPoint = {
                    X: 0,
                    Y: 0,
                }
            })

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML1 = OCX_XML_SetAllArea({}, 'WarningLine', OCX_AI_EVENT_TYPE_TRIPWIRE_LINE, '', pageData.value.isShowAllArea)
                plugin.ExecuteCmd(sendXML1)

                const sendXML2 = OCX_XML_SetTripwireLineAction('NONE')
                plugin.ExecuteCmd(sendXML2)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        const notify = ($: XMLQuery, stateType: string) => {
            if (stateType === 'TripwireLine') {
                const surface = pageData.value.surfaceIndex
                formData.value.lineInfo[surface].startPoint = {
                    X: $('statenotify/startPoint').attr('X').num(),
                    Y: $('statenotify/startPoint').attr('Y').num(),
                }
                formData.value.lineInfo[surface].endPoint = {
                    X: $('statenotify/endPoint').attr('X').num(),
                    Y: $('statenotify/endPoint').attr('Y').num(),
                }
            }
        }

        onMounted(async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            await getScheduleList()
            await getTripwireData()
            if (pageData.value.reqFail) {
                return
            }
            refreshInitPage()
            if (props.chlData.supportAutoTrack) {
                getPTZLockStatus()
            }
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendAreaXML = OCX_XML_SetTripwireLineAction('NONE')
                plugin.ExecuteCmd(sendAreaXML)

                const sendAllAreaXML = OCX_XML_SetAllArea({}, 'WarningLine', OCX_AI_EVENT_TYPE_TRIPWIRE_LINE, '', false)
                plugin.ExecuteCmd(sendAllAreaXML)

                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }

            drawer.destroy()
        })

        return {
            playerRef,
            pageData,
            formData,
            watchEdit,
            showAllPersonTarget,
            showAllCarTarget,
            showAllMotorTarget,
            showPersonSentity,
            showCarSentity,
            showMotorSentity,
            supportPeaTrigger,
            notify,
            handlePlayerReady,
            setSpeed,
            closeSchedulePop,
            applyData,
            changeTab,
            toggleShowAllArea,
            toggleDisplayRange,
            showDisplayRange,
            changeSurface,
            changeDirection,
            checkMinMaxRange,
            editLockStatus,
            clearArea,
            clearAllArea,
        }
    },
})
