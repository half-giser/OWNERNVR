/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-11 14:16:37
 * @Description: 火点检测
 */
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import AlarmBaseIPSpeakerSelector from './AlarmBaseIPSpeakerSelector.vue'
import AlarmBaseSnapSelector from './AlarmBaseSnapSelector.vue'
import { type XMLQuery } from '@/utils/xmlParse'
import AlarmBaseErrorPanel from './AlarmBaseErrorPanel.vue'

export default defineComponent({
    components: {
        AlarmBaseRecordSelector,
        AlarmBaseAlarmOutSelector,
        AlarmBaseTriggerSelector,
        AlarmBasePresetSelector,
        AlarmBaseIPSpeakerSelector,
        AlarmBaseSnapSelector,
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
        const currAreaType: CanvasPolygonAreaType = 'maskArea' // detectionArea侦测区域 maskArea屏蔽区域 regionArea矩形区域

        const ALARM_MODE_MAPPING: Record<string, string> = {
            OnlyFire: Translate('IDCS_ONLY_FIRE_POINT_DETECTION'),
            FlameAndFire: Translate('IDCS_FLAME_FIRE_POINT_DETECTION'),
        }

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
            // 选择的屏蔽区域index，页面初始化时未选择屏蔽区域
            maskAreaIndex: 0,
            maskAreaChecked: [] as number[],
            // 是否显示全部区域绑定值
            isShowAllArea: false,
            // 当前画点规则 regulation==1：画矩形，regulation==0或空：画点 - (regulation=='1'则currentRegulation为true：画矩形，否则currentRegulation为false：画点)
            currentRegulation: false,
        })

        const formData = ref(new AlarmFireDetectionDto())
        const watchEdit = useWatchEditData(formData)

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']
        let drawer = CanvasPolygon()

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

            if (mode.value === 'h5') {
                drawer.destroy()
                drawer = CanvasPolygon({
                    el: player.getDrawbordCanvas(),
                    onchange: changeArea,
                    closePath: closePath,
                    forceClosePath: forceClosePath,
                    clearCurrentArea: clearCurrentArea,
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

        // 首次加载成功 播放视频
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

                const fireAlarmModeList = $('types/ararmModeType/enum').map((element) => {
                    const itemValue = element.text()
                    return {
                        value: itemValue,
                        label: ALARM_MODE_MAPPING[itemValue],
                    }
                })
                // 屏蔽区域
                const supportMaskArea = $param('maskArea').text() !== ''
                const maskAreaInfo: { point: CanvasBasePoint[]; maxCount: number }[] = []
                $param('maskArea/item').forEach((element) => {
                    const $element = queryXml(element.element)
                    const maskArea = {
                        point: [] as CanvasBasePoint[],
                        maxCount: $element('point').attr('maxCount').num(),
                    }
                    $element('point/item').forEach((point) => {
                        const $item = queryXml(point.element)
                        maskArea.point.push({
                            X: $item('X').text().num(),
                            Y: $item('Y').text().num(),
                            isClosed: true,
                        })
                    })
                    maskAreaInfo.push(maskArea)
                })

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
                    fireAlarmMode: $param('fireAlarmMode').text(),
                    fireAlarmModeList: fireAlarmModeList,
                    // 时间阈值（秒）
                    supportDuration: $param('duration').text() !== '',
                    duration: {
                        value: $param('duration').text().num(),
                        min: $param('duration').attr('min').num(),
                        max: $param('duration').attr('max').num(),
                    },
                    ShowFireSensitivity: $param('sensitivity').text().length > 0,
                    sensitivity: $param('sensitivity').text().num(),
                    supportMaskArea: supportMaskArea,
                    maskAreaInfo: maskAreaInfo,
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
                    ipSpeaker: $trigger('triggerAudioDevice/chls/item').map((item) => {
                        return {
                            ipSpeakerId: item.attr('id'),
                            audioID: item.attr('audioID'),
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
                            ${formData.value.supportDuration ? `<duration>${formData.value.duration.value}</duration>` : ''}
                            ${formData.value.fireAlarmMode ? `<fireAlarmMode>${formData.value.fireAlarmMode}</fireAlarmMode>` : ''}
                            ${formData.value.ShowFireSensitivity ? `<sensitivity>${formData.value.sensitivity}</sensitivity>` : ''}
                            ${props.chlData.supportAudio && formData.value.audioSuport ? `<triggerAudio>${formData.value.trigger.includes('triggerAudio')}</triggerAudio>` : ''}
                            ${props.chlData.supportWhiteLight && formData.value.lightSuport ? `<triggerWhiteLight>${formData.value.trigger.includes('triggerWhiteLight')}</triggerWhiteLight>` : ''}
                        ${
                            formData.value.supportMaskArea
                                ? rawXml`
                                <maskArea type="list" count="${formData.value.maskAreaInfo.length}">
                                ${formData.value.maskAreaInfo
                                    .map((element) => {
                                        return rawXml`
                                                <item>
                                                    <point type="list" maxCount="${element.maxCount}" count="${element.point.length}">
                                                        ${element.point
                                                            .map((point) => {
                                                                return rawXml`
                                                                    <item>
                                                                        <X>${Math.floor(point.X)}</X>
                                                                        <Y>${Math.floor(point.Y)}</Y>
                                                                    </item>
                                                                `
                                                            })
                                                            .join('')}
                                                    </point>
                                                </item>
                                            `
                                    })
                                    .join('')}
                                </maskArea>
                            `
                                : ''
                        }
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
                // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面）
                setOcxData()
                refreshInitPage()
                watchEdit.update()
            })
        }

        /**
         * @description 检测互斥通道 更新配置
         */
        const applyData = () => {
            if (!verification()) return
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
         * @description 检验区域合法性
         * @returns {boolean}
         */
        const verification = (): boolean => {
            // 区域为多边形时，检测区域合法性(区域入侵AI事件中：currentRegulation为false时区域为多边形；currentRegulation为true时区域为矩形-联咏IPC)
            if (!pageData.value.currentRegulation) {
                const allRegionList: CanvasBasePoint[][] = []
                const maskAreaInfoList = formData.value.maskAreaInfo
                maskAreaInfoList.forEach((ele) => {
                    allRegionList.push(ele.point)
                })
                for (const i in allRegionList) {
                    const count = allRegionList[i].length
                    if (count > 0 && count < 4) {
                        openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'))
                        return false
                    } else if (count > 0 && !drawer.judgeAreaCanBeClosed(allRegionList[i])) {
                        openMessageBox(Translate('IDCS_INTERSECT'))
                        return false
                    }
                }
            }
            return true
        }

        /**
         * @description 刷新页面数据
         */
        const refreshInitPage = () => {
            // 画点-屏蔽区域
            const maskAreaInfoList = formData.value.maskAreaInfo
            pageData.value.maskAreaChecked = maskAreaInfoList.map((ele, index) => {
                if (ele.point.length) {
                    return index
                }
                return -1
            })
        }

        /**
         * @description 初始化页面数据
         */
        const initPageData = async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            await getData()
            refreshInitPage()
        }

        /**
         * @description 改变Tab
         */
        const changeTab = () => {
            if (pageData.value.tab === 'param') {
                if (mode.value === 'h5') {
                    drawer.setEnable(true)
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetVsdAreaAction('EDIT_ON')
                    plugin.ExecuteCmd(sendXML)
                }

                setOcxData()
            } else if (pageData.value.tab === 'target') {
                showAllArea(false)
                if (mode.value === 'h5') {
                    drawer.clear()
                    drawer.setEnable(false)
                }

                if (mode.value === 'ocx') {
                    const sendXML1 = OCX_XML_SetVsdAreaAction('NONE')
                    plugin.ExecuteCmd(sendXML1)

                    const sendXML2 = OCX_XML_SetVsdAreaAction('EDIT_OFF')
                    plugin.ExecuteCmd(sendXML2)
                }
            }
        }

        /**
         * @description 开启关闭显示全部区域
         */
        const toggleShowAllArea = () => {
            showAllArea(pageData.value.isShowAllArea)
        }

        /**
         * @description 数值失去焦点
         * @param {number} min
         * @param {number} max
         */
        const blurDuration = (min: number, max: number) => {
            openMessageBox(Translate('IDCS_DURATION_RANGE').formatForLang(min, max))
        }

        /**
         * @description 选择屏蔽区域
         */
        const changeMaskArea = () => {
            setOtherAreaClosed()
            setOcxData()
        }

        /**
         * @description 更新区域数据
         * @param {CanvasBaseArea | CanvasBasePoint[]} points
         */
        const changeArea = (points: CanvasBaseArea | CanvasBasePoint[]) => {
            const index = pageData.value.maskAreaIndex
            formData.value.maskAreaInfo[index].point = points as CanvasBasePoint[]

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        /**
         * @description 绘制区域
         */
        const setOcxData = () => {
            const area = pageData.value.maskAreaIndex
            const maskAreaInfo = formData.value.maskAreaInfo
            if (maskAreaInfo.length) {
                if (mode.value === 'h5') {
                    // 检测区域/屏蔽区域
                    const lineStyle = '#d9001b'
                    drawer.setLineStyle(lineStyle)
                    drawer.setCurrAreaIndex(area, currAreaType)
                    // 画点
                    drawer.setPointList(maskAreaInfo[area].point, true)
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetVsdArea(maskAreaInfo[area].point, false, area, 'red')
                    plugin.ExecuteCmd(sendXML)
                }
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        /**
         * @description 绘制所有区域
         * @param {boolean} isShowAll
         */
        const showAllArea = (isShowAll: boolean) => {
            if (mode.value === 'h5') {
                drawer.setEnableShowAll(isShowAll)
            }

            if (isShowAll) {
                const index = pageData.value.maskAreaIndex
                // 画点
                const maskAreaInfo: CanvasBasePoint[][] = []
                const maskAreaInfoList = formData.value.maskAreaInfo
                maskAreaInfoList.forEach((ele, idx) => {
                    maskAreaInfo[idx] = ele.point.map((item) => {
                        return {
                            X: item.X,
                            Y: item.Y,
                            isClosed: item.isClosed,
                        }
                    })
                })

                if (mode.value === 'h5') {
                    drawer.setCurrAreaIndex(index, currAreaType)
                    drawer.drawAllPolygon([], maskAreaInfo, currAreaType, index, true)
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetAllArea({ maskAreaInfo: maskAreaInfo }, 'IrregularPolygon', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', true)
                    plugin.ExecuteCmd(sendXML)
                }
            } else {
                if (mode.value === 'ocx') {
                    // 画点
                    const sendXML = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', false)
                    plugin.ExecuteCmd(sendXML)
                }
                setOcxData()
            }
        }

        /**
         * @description 关闭区域
         * @param {CanvasBasePoint[]} points
         */
        const closePath = (points: CanvasBasePoint[]) => {
            const area = pageData.value.maskAreaIndex
            formData.value.maskAreaInfo[area].point = points
            formData.value.maskAreaInfo[area].point.forEach((ele) => {
                ele.isClosed = true
            })
        }

        /**
         * @description 区域是否可关闭回调
         * @param {boolean} canBeClosed
         */
        const forceClosePath = (canBeClosed: boolean) => {
            if (!canBeClosed) {
                openMessageBox(Translate('IDCS_INTERSECT'))
            }
        }

        /**
         * @description 区域是否闭合
         * @param {CanvasBasePoint} poinObjtList
         */
        const setClosed = (poinObjtList: CanvasBasePoint[]) => {
            poinObjtList.forEach((element) => {
                element.isClosed = true
            })
        }

        /**
         * @description 切换区域时判断当前区域是否可闭合
         */
        const setOtherAreaClosed = () => {
            // 画点-区域
            if (mode.value === 'h5' && !pageData.value.currentRegulation) {
                const maskAreaInfoList = formData.value.maskAreaInfo
                if (maskAreaInfoList && maskAreaInfoList.length > 0) {
                    maskAreaInfoList.forEach((maskAreaInfo) => {
                        const poinObjtList = maskAreaInfo.point
                        if (poinObjtList.length >= 4 && drawer.judgeAreaCanBeClosed(poinObjtList)) {
                            setClosed(poinObjtList)
                        }
                    })
                }
            }
        }

        /**
         * @description 清空当前区域对话框
         */
        const clearCurrentArea = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DRAW_CLEAR_TIP'),
            }).then(() => {
                const area = pageData.value.maskAreaIndex
                formData.value.maskAreaInfo[area].point = []

                if (mode.value === 'h5') {
                    drawer.clear()
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetVsdAreaAction('NONE')
                    plugin.ExecuteCmd(sendXML)
                }

                if (pageData.value.isShowAllArea) {
                    showAllArea(true)
                }
            })
        }

        /**
         * @description 清空当前区域按钮
         */
        const clearArea = () => {
            const area = pageData.value.maskAreaIndex
            formData.value.maskAreaInfo[area].point = []

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetVsdAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        /**
         * @description 清空所有区域
         */
        const clearAllArea = () => {
            const maskAreaInfoList = formData.value.maskAreaInfo
            // 画点-屏蔽区域
            maskAreaInfoList.forEach((ele) => {
                ele.point = []
            })

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                // 画点
                const sendAllAreaXML = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_VSD, '', pageData.value.isShowAllArea)
                plugin.ExecuteCmd(sendAllAreaXML)
                const sendXML = OCX_XML_SetVsdAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        const notify = ($: XMLQuery, stateType: string) => {
            // 区域入侵
            if (stateType === 'PeaArea') {
                if ($('statenotify/points').length) {
                    const points = $('statenotify/points/item').map((element) => {
                        const X = element.attr('X').num()
                        const Y = element.attr('Y').num()
                        return { X, Y }
                    })
                    const index = pageData.value.maskAreaIndex
                    formData.value.maskAreaInfo[index].point = points
                }

                const errorCode = $('statenotify/errorCode').text().num()
                // 处理错误码
                if (errorCode === 517) {
                    // 517-区域已闭合
                    clearCurrentArea()
                } else if (errorCode === 515) {
                    // 515-区域有相交直线，不可闭合
                    openMessageBox(Translate('IDCS_INTERSECT'))
                }
            }
        }

        onMounted(async () => {
            await getScheduleList()
            initPageData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                const sendAreaXML = OCX_XML_SetVsdAreaAction('NONE')
                plugin.ExecuteCmd(sendAreaXML)
                const sendAllAreaXML = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_VSD, '', pageData.value.isShowAllArea)
                plugin.ExecuteCmd(sendAllAreaXML)
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }
        })

        return {
            pageData,
            formData,
            watchEdit,
            playerRef,
            notify,
            handlePlayerReady,
            closeSchedulePop,
            changeTab,
            blurDuration,
            changeMaskArea,
            toggleShowAllArea,
            clearArea,
            clearAllArea,
            applyData,
        }
    },
})
