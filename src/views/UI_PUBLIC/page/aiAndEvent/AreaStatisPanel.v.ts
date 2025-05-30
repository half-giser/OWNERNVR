/*
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-12 10:01:05
 * @Description: 区域统计
 */
import { type XMLQuery } from '@/utils/xmlParse'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import AlarmBaseIPSpeakerSelector from './AlarmBaseIPSpeakerSelector.vue'
import AlarmBaseErrorPanel from './AlarmBaseErrorPanel.vue'
import { type CheckboxValueType } from 'element-plus'

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
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        const playerRef = ref<PlayerInstance>()
        let currAreaType: CanvasPolygonAreaType = 'detectionArea' // detectionArea侦测区域 maskArea屏蔽区域 regionArea矩形区域

        const COUNT_CYCLE_TYPE_MAPPING: Record<string, string> = {
            day: Translate('IDCS_TIME_DAY'),
            week: Translate('IDCS_TIME_WEEK'),
            month: Translate('IDCS_TIME_MOUNTH'),
            off: Translate('IDCS_OFF'),
        }

        const DETECT_TARGET_TYPE_MAPPING: Record<string, string> = {
            person: Translate('IDCS_DETECTION_PERSON'),
            car: Translate('IDCS_DETECTION_VEHICLE'),
            motor: Translate('IDCS_NON_VEHICLE'),
        }

        const pageData = ref({
            // 是否支持声音设置
            supportAlarmAudioConfig: true,
            // 请求数据失败显示提示
            reqFail: false,
            // 选择的功能:param、imageOSD、trigger
            tab: 'param',
            // 排程管理
            isSchedulePop: false,
            scheduleList: [] as SelectOption<string, string>[],
            // 配置模式
            objectFilterMode: 'mode1',
            // 是否显示全部区域绑定值
            isShowAllArea: false,
            // 控制显示展示全部区域的checkbox
            showAllAreaVisible: false,
            // 控制显示清除全部区域按钮 >=2才显示
            clearAllVisible: false,
            // 控制显示最值区域
            isShowDisplayRange: false,
            // 是否启用自动重置
            autoReset: true,
            timeType: 'day',
            weekOption: objectToOptions(getTranslateMapping(DEFAULT_WEEK_MAPPING), 'number'),
            monthOption: Array(31)
                .fill(0)
                .map((_, index) => {
                    const i = index + 1
                    return {
                        value: i,
                        label: i,
                    }
                }),
            // 当前画点规则 regulation==1：画矩形，regulation==0或空：画点 - (regulation=='1'则currentRegulation为true：画矩形，否则currentRegulation为false：画点)
            currentRegulation: false,
            // 选择的警戒面
            warnAreaIndex: 0,
            warnAreaChecked: [] as number[],
            // 更多弹窗数据
            moreDropDown: false,
        })

        const formData = ref(new AlarmAreaStatisDto())
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

        // 显示人的勾选框 + 灵敏度配置项
        const showAllPersonTarget = computed(() => {
            const warnAreaIndex = pageData.value.warnAreaIndex
            const haslineInfo = formData.value.boundaryInfo.length > 0
            return haslineInfo && formData.value.boundaryInfo[warnAreaIndex].objectFilter.supportPerson
        })

        // 显示车的勾选框 + 灵敏度配置项
        const showAllCarTarget = computed(() => {
            const warnAreaIndex = pageData.value.warnAreaIndex
            const haslineInfo = formData.value.boundaryInfo.length > 0
            return haslineInfo && formData.value.boundaryInfo[warnAreaIndex].objectFilter.supportCar
        })

        // 显示摩托车的勾选框 + 灵敏度配置项
        const showAllMotorTarget = computed(() => {
            const warnAreaIndex = pageData.value.warnAreaIndex
            const haslineInfo = formData.value.boundaryInfo.length > 0
            return haslineInfo && formData.value.boundaryInfo[warnAreaIndex].objectFilter.supportMotor
        })

        /**
         * @description 播放器准备就绪回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                const canvas = player.getDrawbordCanvas()
                drawer.destroy()
                drawer = CanvasPolygon({
                    el: canvas,
                    enableOSD: true,
                    enableShowAll: false,
                    regulation: pageData.value.currentRegulation,
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
            if (ready.value && props.chlData && watchEdit.ready.value) {
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
            openLoading()
            pageData.value.scheduleList = await buildScheduleList()
            closeLoading()
        }

        /**
         * @description 切换Tab
         */
        const changeTab = () => {
            if (pageData.value.tab === 'param') {
                if (mode.value === 'h5') {
                    drawer.setEnable(true)
                    drawer.setOSDEnable(false)
                    drawer.setOSD(formData.value.countOSD)
                    setOcxData()
                }

                if (mode.value === 'ocx') {
                    setTimeout(() => {
                        const alarmLine = pageData.value.warnAreaIndex
                        const plugin = playerRef.value!.plugin

                        const sendXML1 = OCX_XML_SetPeaArea(formData.value.boundaryInfo[alarmLine].point, pageData.value.currentRegulation)
                        plugin.ExecuteCmd(sendXML1)

                        const sendXML2 = OCX_XML_SetPeaAreaAction('EDIT_ON')
                        plugin.ExecuteCmd(sendXML2)

                        const sendXML3 = OCX_XML_SetAiOSDInfo(formData.value.countOSD, 'areaStatis')
                        plugin.ExecuteCmd(sendXML3)
                    }, 100)
                }
            } else if (pageData.value.tab === 'imageOSD') {
                showAllArea(false)
                if (mode.value === 'h5') {
                    drawer.clear()
                    drawer.setEnable(true)
                    drawer.setOSDEnable(formData.value.countOSD.switch)
                    drawer.setOSD(formData.value.countOSD)
                }

                if (mode.value === 'ocx') {
                    setTimeout(() => {
                        const sendXML1 = OCX_XML_SetPeaAreaAction('NONE')
                        plugin.ExecuteCmd(sendXML1)

                        const sendXML2 = OCX_XML_SetPeaAreaAction('EDIT_OFF')
                        plugin.ExecuteCmd(sendXML2)

                        const sendXML3 = OCX_XML_SetAiOSDInfo(formData.value.countOSD, 'areaStatis')
                        plugin.ExecuteCmd(sendXML3)
                    }, 100)
                }
            } else if (pageData.value.tab === 'trigger') {
                showAllArea(false)

                if (mode.value === 'h5') {
                    drawer.clear()
                    drawer.setEnable(false)
                    drawer.setOSDEnable(false)
                }

                if (mode.value === 'ocx') {
                    const sendXML1 = OCX_XML_SetPeaAreaAction('NONE')
                    plugin.ExecuteCmd(sendXML1)

                    const sendXML2 = OCX_XML_SetPeaAreaAction('EDIT_OFF')
                    plugin.ExecuteCmd(sendXML2)
                }
            }
        }

        /**
         * @description 获取配置数据
         * @param {boolean} manualResetSwitch
         */
        const getData = async (manualResetSwitch?: boolean) => {
            watchEdit.reset()
            openLoading()

            if (props.chlData.supportRegionStatistics) {
                const sendXml = rawXml`
                    <condition>
                        <chlId>${props.currChlId}</chlId>
                    </condition>
                    <requireField>
                        <param/>
                        <trigger/>
                    </requireField>
                `
                const res = await queryRegionStatisticsConfig(sendXml)
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    const $param = queryXml($('content/chl/param')[0].element)
                    const $trigger = queryXml($('content/chl/trigger')[0].element)

                    let enabledSwitch = $param('switch').text().bool()
                    if (typeof manualResetSwitch === 'boolean') {
                        enabledSwitch = manualResetSwitch
                    }
                    formData.value.detectionEnable = enabledSwitch
                    formData.value.originalEnable = enabledSwitch

                    const countTimeType = $param('countPeriod/countTimeType').text()
                    formData.value.countTimeType = countTimeType !== 'off' ? countTimeType : 'day'

                    formData.value.countPeriod = {
                        day: {
                            date: $param('countPeriod/day/dateSpan').text().num(),
                            dateTime: $param('countPeriod/day/dateTimeSpan').text(),
                        },
                        week: {
                            date: $param('countPeriod/week/dateSpan').text().num(),
                            dateTime: $param('countPeriod/week/dateTimeSpan').text(),
                        },
                        month: {
                            date: $param('countPeriod/month/dateSpan').text().num(),
                            dateTime: $param('countPeriod/month/dateTimeSpan').text(),
                        },
                    }

                    formData.value.schedule = getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid'))
                    formData.value.supportAlarmHoldTime = $param('alarmHoldTime').text().length > 0
                    formData.value.holdTime = Number($param('alarmHoldTime').text())
                    formData.value.holdTimeList = getAlarmHoldTimeList($param('holdTimeNote').text(), formData.value.holdTime)

                    // 时间阈值（秒）
                    formData.value.supportDuration = $param('duration').text() !== ''
                    formData.value.duration = {
                        value: $param('duration').text().num(),
                        min: $param('duration').attr('min').num(),
                        max: $param('duration').attr('max').num(),
                    }

                    formData.value.countCycleTypeList = $('types/countCycleType/enum')
                        .map((element) => {
                            const itemValue = element.text()
                            return {
                                value: itemValue,
                                label: COUNT_CYCLE_TYPE_MAPPING[itemValue],
                            }
                        })
                        .filter((item) => item.value !== 'off')

                    formData.value.mutexList = $param('mutexList/item').map((element) => {
                        const $ = queryXml(element.element)
                        return {
                            object: $('object').text(),
                            status: $('status').text().bool(),
                        }
                    })
                    formData.value.mutexListEx = $param('mutexListEx/item').map((element) => {
                        const $ = queryXml(element.element)
                        return {
                            object: $('object').text(),
                            status: $('status').text().bool(),
                        }
                    })

                    // 区别联咏ipc标志
                    const regulation = $param('content/chl/param/boundary').attr('regulation') === '1'
                    formData.value.regulation = regulation
                    // 解析检测目标的数据
                    const objectFilterMode = getCurrentAICfgMode('boundary', $param)
                    pageData.value.objectFilterMode = objectFilterMode
                    const $paramObjectFilter = $('content/chl/param/objectFilter')
                    let objectFilter = ref(new AlarmObjectFilterCfgDto())
                    if (objectFilterMode === 'mode1') {
                        // 模式一
                        if ($param('objectFilter').text() !== '') {
                            objectFilter = getObjectFilterData(objectFilterMode, $paramObjectFilter, [])
                        }
                    }
                    const boundaryInfo: {
                        objectFilter: AlarmObjectFilterCfgDto
                        point: CanvasBasePoint[]
                        maxCount: number
                    }[] = []
                    const regionInfo: CanvasBaseArea[] = []

                    $param('boundary/item').forEach((element) => {
                        const $element = queryXml(element.element)
                        const needResetObjectList = ['mode2', 'mode3']
                        const needResetObjectFilter = needResetObjectList.indexOf(objectFilterMode) !== -1
                        if (needResetObjectFilter) {
                            const $resultNode = objectFilterMode === 'mode2' ? $paramObjectFilter : []
                            objectFilter = getObjectFilterData(objectFilterMode, $element('objectFilter'), $resultNode)
                        }

                        const boundary = {
                            objectFilter: objectFilter.value,
                            point: [] as CanvasBasePoint[],
                            maxCount: $element('point').attr('maxCount').num(),
                        }
                        const region = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
                        $element('point/item').forEach((point, index) => {
                            const $item = queryXml(point.element)
                            boundary.point.push({
                                X: $item('X').text().num(),
                                Y: $item('Y').text().num(),
                                isClosed: true,
                            })
                            getRegion(index, point, region)
                        })
                        boundaryInfo.push(boundary)
                        regionInfo.push(region)
                    })

                    formData.value.boundaryInfo = boundaryInfo
                    formData.value.regionInfo = regionInfo

                    formData.value.onlyPerson = $param('sensitivity').text() !== ''
                    // NTA1-231：低配版IPC：4M S4L-C，越界/区域入侵目标类型只支持人
                    formData.value.sensitivity = formData.value.onlyPerson ? $('sensitivity').text().num() : 0

                    if (formData.value.boundaryInfo.length > 1) {
                        pageData.value.showAllAreaVisible = true
                        pageData.value.clearAllVisible = true
                    }

                    // 默认用line的第一个数据初始化检测目标
                    if (formData.value.boundaryInfo[0].objectFilter.detectTargetList.length) {
                        formData.value.detectTargetList = formData.value.boundaryInfo[0].objectFilter.detectTargetList.map((item) => {
                            return {
                                value: item,
                                label: DETECT_TARGET_TYPE_MAPPING[item],
                            }
                        })
                        formData.value.detectTarget = formData.value.detectTargetList[0].value
                    }
                    // OSD信息
                    let osdFormat = $param('countOSD/osdFormat').text()
                    const showEnterOsd = $param('countOSD/showEnterOsd').text().bool()
                    const osdEntranceName = $param('countOSD/osdEntranceName').text()
                    const osdEntranceNameMaxLen = $param('countOSD/osdEntranceName').attr('maxByteLen').num() || nameByteMaxLen
                    const supportOsdEntranceName = $param('countOSD/osdEntranceName').length > 0
                    const showExitOsd = $param('countOSD/showExitOsd').text().bool()
                    const osdExitName = $param('countOSD/osdExitName').text()
                    const osdExitNameMaxLen = $param('countOSD/osdExitName').attr('maxByteLen').num() || nameByteMaxLen
                    const supportOsdExitName = $param('countOSD/osdExitName').length > 0
                    const showStayOsd = $param('countOSD/showStayOsd').text().bool()
                    const osdStayName = $param('countOSD/osdStayName').text()
                    const osdStayNameMaxLen = $param('countOSD/osdStayName').attr('maxByteLen').num() || nameByteMaxLen
                    const supportOsdStayName = $param('countOSD/osdStayName').length > 0
                    const osdWelcomeName = $param('countOSD/osdWelcomeName').text()
                    const osdWelcomeNameMaxLen = $param('countOSD/osdWelcomeName').attr('maxByteLen').num() || nameByteMaxLen
                    const supportOsdWelcomeName = $param('countOSD/osdWelcomeName').length > 0
                    const osdAlarmName = $param('countOSD/osdAlarmName').text()
                    const osdAlarmNameMaxLen = $param('countOSD/osdAlarmName').attr('maxByteLen').num() || nameByteMaxLen
                    const supportOsdAlarmName = $param('countOSD/osdAlarmName').length > 0

                    // 拼接osdFormat
                    let entryOsdFormat = osdEntranceName + ': '
                    let exitOsdFormat = osdExitName + '  : '
                    let stayOsdFormat = osdStayName + ' : '

                    const objectFilterData = formData.value.boundaryInfo[0].objectFilter
                    if (objectFilterData.supportPerson) {
                        if (showEnterOsd) entryOsdFormat += 'human-# '
                        if (showExitOsd) exitOsdFormat += 'human-# '
                        if (showStayOsd) stayOsdFormat += 'human-# '
                    }

                    if (objectFilterData.supportCar) {
                        if (showEnterOsd) entryOsdFormat += 'car-# '
                        if (showExitOsd) exitOsdFormat += 'car-# '
                        if (showStayOsd) stayOsdFormat += 'car-# '
                    }

                    if (objectFilterData.supportMotor) {
                        if (showEnterOsd) entryOsdFormat += 'bike-# '
                        if (showExitOsd) exitOsdFormat += 'bike-# '
                        if (showStayOsd) stayOsdFormat += 'bike-# '
                    }

                    if (supportOsdEntranceName || supportOsdExitName || supportOsdStayName) {
                        osdFormat = ''
                        if (showEnterOsd) {
                            osdFormat += entryOsdFormat + '\\n'
                        }

                        if (showExitOsd) {
                            osdFormat += exitOsdFormat + '\\n'
                        }

                        if (showStayOsd) {
                            osdFormat += stayOsdFormat + '\\n'
                        }
                    } else {
                        osdFormat = osdFormat
                    }
                    formData.value.countOSD = {
                        switch: $param('countOSD/switch').text().bool(),
                        X: $param('countOSD/X').text().num(),
                        Y: $param('countOSD/Y').text().num(),
                        osdFormat: osdFormat,
                        showEnterOsd: showEnterOsd,
                        osdEntranceName: osdEntranceName,
                        osdEntranceNameMaxLen: osdEntranceNameMaxLen,
                        supportOsdEntranceName: supportOsdEntranceName,
                        showExitOsd: showExitOsd,
                        osdExitName: osdExitName,
                        osdExitNameMaxLen: osdExitNameMaxLen,
                        supportOsdExitName: supportOsdExitName,
                        showStayOsd: showStayOsd,
                        osdStayName: osdStayName,
                        osdStayNameMaxLen: osdStayNameMaxLen,
                        supportOsdStayName: supportOsdStayName,
                        osdWelcomeName: osdWelcomeName,
                        osdWelcomeNameMaxLen: osdWelcomeNameMaxLen,
                        supportOsdWelcomeName: supportOsdWelcomeName,
                        osdAlarmName: osdAlarmName,
                        osdAlarmNameMaxLen: osdAlarmNameMaxLen,
                        supportOsdAlarmName: supportOsdAlarmName,
                    }

                    formData.value.audioSuport = $param('triggerAudio').text() !== ''
                    formData.value.lightSuport = $param('triggerWhiteLight').text() !== ''
                    formData.value.saveTargetPicture = $param('saveTargetPicture').text().bool()
                    formData.value.saveSourcePicture = $param('saveSourcePicture').text().bool()

                    formData.value.sysAudio = $trigger('sysAudio').attr('id')
                    formData.value.recordSwitch = $trigger('sysRec/switch').text().bool()
                    formData.value.recordChls = $trigger('sysRec/chls/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    })
                    formData.value.alarmOutSwitch = $trigger('alarmOut/switch').text().bool()
                    formData.value.alarmOutChls = $trigger('alarmOut/alarmOuts/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    })
                    formData.value.presetSwitch = $trigger('preset/switch').text().bool()
                    formData.value.presets = $trigger('preset/presets/item').map((item) => {
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

                    formData.value.trigger = ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch'].filter((item) => {
                        return $trigger(item).text().bool()
                    })

                    formData.value.triggerList = ['snapSwitch', 'msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch']

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
                    pageData.value.currentRegulation = formData.value.regulation
                    currAreaType = pageData.value.currentRegulation ? 'regionArea' : 'detectionArea'
                    watchEdit.listen()
                } else {
                    pageData.value.reqFail = true
                    pageData.value.tab = ''
                }
            } else {
                pageData.value.reqFail = true
                pageData.value.tab = ''
                closeLoading()
            }
        }

        /**
         * @description 获取区域
         * @param {number} index
         * @param {XmlElement} element
         * @param {CanvasBaseArea} region
         */
        const getRegion = (index: number, element: XmlElement, region: CanvasBaseArea) => {
            const $ = queryXml(element.element)
            if (index === 0) {
                region.X1 = $('X').text().num()
                region.Y1 = $('Y').text().num()
            }

            if (index === 1) {
                region.X2 = $('X').text().num()
            }

            if (index === 2) {
                region.Y2 = $('Y').text().num()
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
                paramXml = setObjectFilterXmlData(formData.value.boundaryInfo[0].objectFilter, props.chlData)
            }

            return paramXml
        }

        /**
         * @description 组装各个区域下的ObjectFilter节点数据
         */
        const setItemObjectFilterData = (item: { objectFilter: globalThis.AlarmObjectFilterCfgDto }) => {
            let paramXml = ''
            const singleDetectCfgList = ['mode2', 'mode3'] // 上述模式每个区域可单独配置检测目标或目标大小
            if (singleDetectCfgList.indexOf(pageData.value.objectFilterMode) !== -1) {
                paramXml += setObjectFilterXmlData(item.objectFilter, props.chlData)
            }

            return paramXml
        }

        /**
         * @description 保存PASSLINE配置
         */
        const saveData = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}" scheduleGuid="${formData.value.schedule}">
                        <param>
                            <switch>${formData.value.detectionEnable}</switch>
                            ${formData.value.supportAlarmHoldTime ? `<alarmHoldTime unit="s">${formData.value.holdTime}</alarmHoldTime>` : ''}
                            ${formData.value.supportDuration ? `<duration>${formData.value.duration.value}</duration>` : ''}
                            <countPeriod>
                                <countTimeType>${formData.value.countTimeType}</countTimeType>
                                <day>
                                    <dateSpan>${formData.value.countPeriod.day.date}</dateSpan>
                                    <dateTimeSpan>${formData.value.countPeriod.day.dateTime}</dateTimeSpan>
                                </day>
                                <week>
                                    <dateSpan>${formData.value.countPeriod.week.date}</dateSpan>
                                    <dateTimeSpan>${formData.value.countPeriod.week.dateTime}</dateTimeSpan>
                                </week>
                                <month>
                                    <dateSpan>${formData.value.countPeriod.month.date}</dateSpan>
                                    <dateTimeSpan>${formData.value.countPeriod.month.dateTime}</dateTimeSpan>
                                </month>
                            </countPeriod>
                            <countOSD>
                                <switch>${formData.value.countOSD.switch}</switch>
                                <X>${Math.round(formData.value.countOSD.X)}</X>
                                <Y>${Math.round(formData.value.countOSD.Y)}</Y>
                            ${
                                formData.value.countOSD.supportOsdEntranceName
                                    ? `<showEnterOsd>${formData.value.countOSD.showEnterOsd}</showEnterOsd>
                                <osdEntranceName>${formData.value.countOSD.osdEntranceName}</osdEntranceName>`
                                    : ''
                            }
                             ${
                                 formData.value.countOSD.supportOsdExitName
                                     ? `<showExitOsd>${formData.value.countOSD.showExitOsd}</showExitOsd>
                                <osdExitName>${formData.value.countOSD.osdExitName}</osdExitName>`
                                     : ''
                             }
                             ${
                                 formData.value.countOSD.supportOsdStayName
                                     ? `<showStayOsd>${formData.value.countOSD.showStayOsd}</showStayOsd>
                                <osdStayName>${formData.value.countOSD.osdStayName}</osdStayName>`
                                     : ''
                             }
                             ${formData.value.countOSD.supportOsdAlarmName ? `<osdAlarmName>${formData.value.countOSD.osdAlarmName}</osdAlarmName>` : ''}
                             ${formData.value.countOSD.supportOsdWelcomeName ? `<osdWelcomeName>${formData.value.countOSD.osdWelcomeName}</osdWelcomeName>` : ''}
                            </countOSD>
                            ${formData.value.audioSuport && props.chlData.supportAudio ? `<triggerAudio>${formData.value.trigger.includes('triggerAudio')}</triggerAudio>` : ''}
                            ${formData.value.lightSuport && props.chlData.supportWhiteLight ? `<triggerWhiteLight>${formData.value.trigger.includes('triggerWhiteLight')}</triggerWhiteLight>` : ''}
                            <saveTargetPicture>${formData.value.saveTargetPicture}</saveTargetPicture>
                            <saveSourcePicture>${formData.value.saveSourcePicture}</saveSourcePicture>
                            ${formData.value.onlyPerson ? `<sensitivity>${formData.value.sensitivity}</sensitivity>` : ''}
                            <boundary type="list" count="${formData.value.boundaryInfo.length}">
                                <itemType>
                                    <point type="list"/>
                                </itemType>
                                ${formData.value.boundaryInfo
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
                                                    ${setItemObjectFilterData(element)}
                                            </item>
                                        `
                                    })
                                    .join('')}
                            </boundary>
                            ${setParamObjectFilterData()}
                        </param>
                       <trigger>
                            <sysRec>
                                <chls type="list">
                                    ${formData.value.recordChls.map((element: { value: any; label: string }) => `<item id="${element.value}">${wrapCDATA(element.label)}</item>`).join('')}
                                </chls>
                            </sysRec>
                            <alarmOut>
                                <alarmOuts type="list">
                                    ${formData.value.alarmOutChls.map((element) => `<item id="${element.value}">${wrapCDATA(element.label)}</item>`).join('')}
                                </alarmOuts>
                            </alarmOut>
                            <preset>
                                <presets type="list">
                                    ${formData.value.presets
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
            const res = await editRegionStatisticsConfig(sendXml)
            const $ = queryXml(res)
            closeLoading()
            if ($('status').text() === 'success') {
                // NT-9292 开关为开把originalSwitch置为true避免多次弹出互斥提示
                if (formData.value.detectionEnable) {
                    formData.value.originalEnable = true
                }
                // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面）
                setOcxData()
                refreshInitPage()
                watchEdit.update()
            } else {
                openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
            }
        }

        /**
         * @description 检查互斥通道，保存配置
         */
        const applyData = () => {
            checkMutexChl({
                isChange: formData.value.detectionEnable && formData.value.detectionEnable !== formData.value.originalEnable,
                mutexList: formData.value.mutexList,
                mutexListEx: formData.value.mutexListEx,
                chlName: props.chlData.name,
                chlIp: props.chlData.ip,
                chlList: props.onlineChannelList,
                tips: 'IDCS_REGION_STATISTICS_DETECT_TIPS',
            }).then(() => {
                saveData()
            })
        }

        /**
         * @description 手动重置
         */
        const resetAreaStatisData = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}">
                        <param>
                            <forceReset>true</forceReset>
                        </param>
                    </chl>
                </content>`
            const res = await editRegionStatisticsConfig(sendXml)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_RESET_SUCCESSED'),
                })
            } else {
                openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
            }
            // 重置的参数不包括开关, 故记下过线统计的开关
            const manualResetSwitch = formData.value.detectionEnable
            getData(manualResetSwitch)
        }

        /**
         * @description 执行手动重置
         */
        const resetData = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_RESET_TIP'),
            }).then(() => {
                resetAreaStatisData()
            })
        }

        /**
         * @description 初始化页面数据
         */
        const initPageData = async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            await getScheduleList()
            await getData()
            refreshInitPage()
        }

        /**
         * @description 开关显示大小范围区域
         */
        const toggleDisplayRange = () => {
            showDisplayRange()
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
         * @description 校验目标范围最大最小值
         * @param {string} type
         */
        const checkMinMaxRange = (type: string) => {
            const warnAreaIndex = pageData.value.warnAreaIndex
            const detectTarget = formData.value.detectTarget
            // 最小区域宽
            const minTextW = formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].minRegionInfo.width
            // 最小区域高
            const minTextH = formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].minRegionInfo.height
            // 最大区域宽
            const maxTextW = formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].maxRegionInfo.width
            // 最大区域高
            const maxTextH = formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].maxRegionInfo.height

            const errorMsg = Translate('IDCS_MIN_LESS_THAN_MAX')
            switch (type) {
                case 'minTextW':
                    if (minTextW >= maxTextW) {
                        openMessageBox(errorMsg)
                        formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].minRegionInfo.width = maxTextW - 1
                    }
                    break
                case 'minTextH':
                    if (minTextH >= maxTextH) {
                        openMessageBox(errorMsg)
                        formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].minRegionInfo.height = maxTextH - 1
                    }
                    break
                case 'maxTextW':
                    if (maxTextW <= minTextW) {
                        openMessageBox(errorMsg)
                        formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].maxRegionInfo.width = minTextW + 1
                    }
                    break
                case 'maxTextH':
                    if (maxTextH <= minTextH) {
                        openMessageBox(errorMsg)
                        formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].maxRegionInfo.height = minTextH + 1
                    }
                    break
                default:
                    break
            }
        }

        /**
         * @description 是否显示大小范围区域
         */
        const showDisplayRange = () => {
            if (pageData.value.isShowDisplayRange) {
                const currentSurface = pageData.value.warnAreaIndex
                const currTargetType = formData.value.detectTarget // 人/车/非
                const minRegionInfo = formData.value.boundaryInfo[currentSurface].objectFilter[currTargetType].minRegionInfo // 最小区域
                const maxRegionInfo = formData.value.boundaryInfo[currentSurface].objectFilter[currTargetType].maxRegionInfo // 最大区域
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
         * @description 选择警戒区域
         */
        const changeWarnArea = () => {
            setOtherAreaClosed()
            setOcxData()
            showDisplayRange()
        }

        /**
         * @description 自动重置
         * @param value
         */
        const changeAutoReset = (value: CheckboxValueType) => {
            formData.value.countTimeType = value ? pageData.value.timeType : 'off'
        }

        /**
         * @description 重置时间模式
         * @param {string} value
         */
        const changeTimeType = (value: string) => {
            // 自动重置选中时formData.value.countPeriod.countTimeType被置为off，不方便直接绑定元素
            // 用pageData.value.timeType绑定页面元素
            formData.value.countTimeType = value
            // advancedVisible.value = true
        }

        /**
         * @description 更新绘图区域
         * @param passline
         * @param osdInfo
         */
        const changeArea = (points: CanvasBaseArea | CanvasBasePoint[], osdInfo?: CanvasPolygonOSDInfo) => {
            const area = pageData.value.warnAreaIndex
            if (formData.value.regulation) {
                if (!Array.isArray(points)) {
                    formData.value.boundaryInfo[area].point = getRegionPoints(points)
                    formData.value.regionInfo[area] = points
                }
            } else {
                formData.value.boundaryInfo[area].point = points as CanvasBasePoint[]
            }

            if (osdInfo) {
                formData.value.countOSD.X = osdInfo.X
                formData.value.countOSD.Y = osdInfo.Y
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
            refreshInitPage()
        }

        /**
         * @description 获取矩形区域点列表
         * @param {CanvasBaseArea} points
         * @returns
         */
        const getRegionPoints = (points: CanvasBaseArea) => {
            const pointList = []
            pointList.push({ X: points.X1, Y: points.Y1, isClosed: true })
            pointList.push({ X: points.X2, Y: points.Y1, isClosed: true })
            pointList.push({ X: points.X2, Y: points.Y2, isClosed: true })
            pointList.push({ X: points.X1, Y: points.Y2, isClosed: true })
            return pointList
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
                const index = pageData.value.warnAreaIndex
                const curIndex = pageData.value.warnAreaIndex
                if (pageData.value.currentRegulation) {
                    // 画矩形
                    const regionInfoList = formData.value.regionInfo

                    if (mode.value === 'h5') {
                        drawer.setCurrAreaIndex(index, currAreaType)
                        drawer.drawAllRegion(regionInfoList, index)
                    }

                    if (mode.value === 'ocx') {
                        const pluginRegionInfoList = cloneDeep(regionInfoList)
                        pluginRegionInfoList.splice(index, 1) // 插件端下发全部区域需要过滤掉当前区域数据
                        const sendXML = OCX_XML_SetAllArea({ regionInfoList: pluginRegionInfoList }, 'Rectangle', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', true)
                        plugin.ExecuteCmd(sendXML)
                    }
                } else {
                    // 画点
                    const boundaryInfo: CanvasBasePoint[][] = []
                    const boundaryInfoList = formData.value.boundaryInfo
                    boundaryInfoList.forEach((ele, idx) => {
                        boundaryInfo[idx] = ele.point.map((item) => {
                            return {
                                X: item.X,
                                Y: item.Y,
                                isClosed: item.isClosed,
                            }
                        })
                    })

                    if (mode.value === 'h5') {
                        drawer.setCurrAreaIndex(curIndex, currAreaType)
                        drawer.drawAllPolygon(boundaryInfo, [], currAreaType, curIndex, true)
                    }

                    if (mode.value === 'ocx') {
                        const sendXML = OCX_XML_SetAllArea({ detectAreaInfo: boundaryInfo }, 'IrregularPolygon', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', true)
                        plugin.ExecuteCmd(sendXML)
                    }
                }
            } else {
                if (mode.value === 'ocx') {
                    if (pageData.value.currentRegulation) {
                        // 画矩形
                        const sendXML = OCX_XML_SetAllArea({}, 'Rectangle', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', false)
                        plugin.ExecuteCmd(sendXML)
                    } else {
                        // 画点
                        const sendXML = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', false)
                        plugin.ExecuteCmd(sendXML)
                    }
                }
                setOcxData()
            }
        }

        /**
         * @description 绘制区域
         */
        const setOcxData = () => {
            const area = pageData.value.warnAreaIndex
            const boundaryInfo = formData.value.boundaryInfo
            const regionInfo = formData.value.regionInfo
            if (boundaryInfo.length) {
                if (mode.value === 'h5') {
                    drawer.setCurrAreaIndex(area, currAreaType)
                    if (pageData.value.currentRegulation) {
                        // 画矩形
                        drawer.setArea(regionInfo[area])
                    } else {
                        // 画点
                        drawer.setPointList(boundaryInfo[area].point, true)
                    }
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPeaArea(boundaryInfo[area].point, pageData.value.currentRegulation)
                    plugin.ExecuteCmd(sendXML)
                }
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        /**
         * @description 设置OSD
         */
        const setEnableOSD = () => {
            const enable = formData.value.countOSD.switch

            if (mode.value === 'h5') {
                drawer.setOSDEnable(enable)
                drawer.setOSD(formData.value.countOSD)
            }

            if (mode.value === 'ocx') {
                // 需要插件提供专门在画点多边形情况下显示OSD的插件命令
                const sendXML = OCX_XML_SetAiOSDInfo(formData.value.countOSD, 'areaStatis')
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 关闭区域
         * @param {CanvasBasePoint[]} points
         */
        const closePath = (points: CanvasBasePoint[]) => {
            const area = pageData.value.warnAreaIndex
            formData.value.boundaryInfo[area].point = points
            formData.value.boundaryInfo[area].point.forEach((ele) => {
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
            poinObjtList.forEach(function (element) {
                element.isClosed = true
            })
        }

        /**
         * @description 切换区域时判断当前区域是否可闭合
         */
        const setOtherAreaClosed = () => {
            // 画点-区域
            if (mode.value === 'h5' && !pageData.value.currentRegulation) {
                const boundaryInfoList = formData.value.boundaryInfo
                if (boundaryInfoList && boundaryInfoList.length > 0) {
                    boundaryInfoList.forEach(function (boundaryInfo) {
                        const poinObjtList = boundaryInfo.point
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
                const area = pageData.value.warnAreaIndex
                formData.value.boundaryInfo[area].point = []
                if (mode.value === 'h5') {
                    drawer.clear()
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                    plugin.ExecuteCmd(sendXML)
                }

                if (pageData.value.isShowAllArea) {
                    showAllArea(true)
                }
            })
        }

        /**
         * @description 执行是否显示全部区域
         */
        const toggleShowAllArea = () => {
            showAllArea(pageData.value.isShowAllArea)
        }

        /**
         * @description 清空当前区域
         */
        const clearArea = () => {
            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            const area = pageData.value.warnAreaIndex
            formData.value.boundaryInfo[area].point = []
            formData.value.regionInfo[area] = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        /**
         * @description passLine清空所有区域
         */
        const clearAllArea = () => {
            const regionInfoList = formData.value.regionInfo
            const boundaryInfoList = formData.value.boundaryInfo

            if (pageData.value.currentRegulation) {
                // 画矩形
                regionInfoList.forEach((ele) => {
                    ele.X1 = 0
                    ele.Y1 = 0
                    ele.X2 = 0
                    ele.Y2 = 0
                })
            } else {
                // 画点-警戒区域
                boundaryInfoList.forEach((ele) => {
                    ele.point = []
                })
            }

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                if (pageData.value.currentRegulation) {
                    // 画矩形
                    const sendXML = OCX_XML_SetAllArea({}, 'Rectangle', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', pageData.value.isShowAllArea)
                    plugin.ExecuteCmd(sendXML)
                } else {
                    // 画点
                    const sendXML = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', pageData.value.isShowAllArea)
                    plugin.ExecuteCmd(sendXML)
                }
                const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        /**
         * @description PASSLINE刷新
         */
        const refreshInitPage = () => {
            if (pageData.value.currentRegulation) {
                // 画矩形
                const regionInfoList = formData.value.regionInfo
                pageData.value.warnAreaChecked = regionInfoList.map((ele, index) => {
                    if (ele.X1 || ele.Y1 || ele.X2 || ele.Y2) {
                        return index
                    }
                    return -1
                })

                // 是否显示全部区域切换按钮和清除全部按钮（区域数量大于等于2时才显示）
                if (regionInfoList && regionInfoList.length > 1) {
                    pageData.value.showAllAreaVisible = true
                    pageData.value.clearAllVisible = true
                } else {
                    pageData.value.showAllAreaVisible = false
                    pageData.value.clearAllVisible = false
                }
            } else {
                // 画点-警戒区域
                const boundaryInfoList = formData.value.boundaryInfo
                pageData.value.warnAreaChecked = boundaryInfoList.map((ele, index) => {
                    if (ele.point.length) {
                        return index
                    }
                    return -1
                })

                // 是否显示全部区域切换按钮和清除全部按钮（区域数量大于等于2时才显示）
                if (boundaryInfoList && boundaryInfoList.length > 1) {
                    pageData.value.showAllAreaVisible = true
                    pageData.value.clearAllVisible = true
                } else {
                    pageData.value.showAllAreaVisible = false
                    pageData.value.clearAllVisible = false
                }
            }
        }

        const notify = ($: XMLQuery, stateType: string) => {
            if (stateType === 'PeaArea') {
                if ($('statenotify/points').length) {
                    const points = $('statenotify/points/item').map((element) => {
                        const X = element.attr('X').num()
                        const Y = element.attr('Y').num()
                        return { X, Y }
                    })
                    const area = pageData.value.warnAreaIndex
                    if (pageData.value.currentRegulation) {
                        formData.value.boundaryInfo[area].point = points
                        formData.value.regionInfo[area] = {
                            X1: points[0].X,
                            Y1: points[0].Y,
                            X2: points[1].X,
                            Y2: points[2].Y,
                        }
                    } else {
                        formData.value.boundaryInfo[area].point = points
                    }
                    refreshInitPage()
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

            if (stateType === 'TripwireLineInfo') {
                const X = $('statenotify/PosInfo/X').text().num()
                const Y = $('statenotify/PosInfo/Y').text().num()
                formData.value.countOSD.X = X
                formData.value.countOSD.Y = Y
            }
        }

        onMounted(() => {
            initPageData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendAreaXML = OCX_XML_SetPeaAreaAction('NONE')
                plugin.ExecuteCmd(sendAreaXML)
                if (pageData.value.currentRegulation) {
                    // 画矩形
                    const sendAllAreaXML = OCX_XML_SetAllArea({}, 'Rectangle', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', false)
                    plugin.ExecuteCmd(sendAllAreaXML)
                } else {
                    // 画点
                    const sendAllAreaXML = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', false)
                    plugin.ExecuteCmd(sendAllAreaXML)
                }
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }

            drawer.destroy()
        })

        return {
            playerRef,
            notify,
            pageData,
            watchEdit,
            formData,
            showAllPersonTarget,
            showAllCarTarget,
            showAllMotorTarget,
            handlePlayerReady,
            closeSchedulePop,
            changeTab,
            setEnableOSD,
            toggleShowAllArea,
            toggleDisplayRange,
            showDisplayRange,
            checkMinMaxRange,
            blurDuration,
            changeWarnArea,
            changeAutoReset,
            changeTimeType,
            clearArea,
            clearAllArea,
            resetData,
            applyData,
        }
    },
})
