/*
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-15 19:54:20
 * @Description: 客流统计
 */
import { type XMLQuery } from '@/utils/xmlParse'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import { type CheckboxValueType } from 'element-plus'
import AlarmBaseErrorPanel from './AlarmBaseErrorPanel.vue'

export default defineComponent({
    components: {
        AlarmBaseRecordSelector,
        AlarmBaseAlarmOutSelector,
        AlarmBaseTriggerSelector,
        AlarmBasePresetSelector,
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
        type CanvasPolygonAreaType = 'detectionArea' | 'maskArea' | 'regionArea' // 侦测-"detectionArea"/屏蔽-"maskArea"/矩形-"regionArea"

        const systemCaps = useCababilityStore()
        const { Translate } = useLangStore()
        const playerRef = ref<PlayerInstance>()

        const currAreaType: CanvasPolygonAreaType = 'detectionArea' // detectionArea侦测区域 maskArea屏蔽区域 regionArea矩形区域

        const LINE_DIRECTION_MAPPING: Record<string, string> = {
            rightortop: 'A->B',
            leftorbotton: 'A<-B',
        }

        const BOUNDARY_DIRECTION_MAPPING: Record<string, string> = {
            AtoB: 'A->B',
            BtoA: 'A<-B',
        }

        const CALIBRATION_MODE_MAPPING: Record<string, string> = {
            auto: Translate('IDCS_AUTO'),
            manual: Translate('IDCS_MANUAL'),
        }

        const COUNT_CYCLE_TYPE_MAPPING: Record<string, string> = {
            day: Translate('IDCS_TIME_DAY'),
            week: Translate('IDCS_TIME_WEEK'),
            month: Translate('IDCS_TIME_MOUNTH'),
            off: Translate('IDCS_OFF'),
        }

        const pageData = ref({
            // 是否支持声音设置
            supportAlarmAudioConfig: true,
            // 请求数据失败显示提示
            reqFail: false,
            // 排程
            schedule: '',
            // 排程管理
            isSchedulePop: false,
            scheduleList: [] as SelectOption<string, string>[],
            // 选择的功能:param,target,trigger
            tab: 'param',
            // 是否启用侦测
            detectionEnable: false,
            // 用于对比
            originalEnable: false,
            // 警戒线的默认方向
            lineDirection: 'rightortop' as CanvasPasslineDirection,
            defaultLineDirection: 'rightortop' as CanvasPasslineDirection,
            // 警戒区域的默认方向
            areaDirection: 'AtoB' as CanvasBoundaryDirection,
            defaultAreaDirection: 'AtoB' as CanvasBoundaryDirection,
            // 绘制类型
            detectType: 0, // 0：警戒线； 1：警戒区域
            detectTypeList: [] as SelectOption<number, string>[],
            // 选择的警戒线index
            lineIndex: 0,
            lineChecked: [] as number[],
            // 选择的警戒区域index
            warnAreaIndex: 0,
            warnAreaChecked: [] as number[],
            // 选择的绘制区域index
            drawAreaIndex: 'rectA' as 'rectA' | 'rectB',
            drawAreaChecked: [] as string[],
            // 绘制线方向下拉
            lineDirectionList: [] as SelectOption<string, string>[],
            // 绘制区域指向下拉
            areaDirectionList: [] as SelectOption<string, string>[],
            // 标定方式下拉
            calibrationModeList: [] as SelectOption<string, string>[],
            // 是否显示全部区域绑定值
            isShowAllArea: false,
            // 当前画点规则 regulation==1：画矩形，regulation==0或空：画点 - (regulation=='1'则currentRegulation为true：画矩形，否则currentRegulation为false：画点)
            currentRegulation: false,
            // 是否启用自动重置
            autoReset: true,
            timeType: 'day',
            // 重置模式列表
            countCycleTypeList: [] as SelectOption<string, string>[],
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
            imgOsdTypeList: [] as SelectOption<string, string>[],
            moreDropDown: false,
            lastTab: '',
        })

        const formData = ref(new AlarmBinocularCountDto())
        const watchEdit = useWatchEditData(formData)

        const noneOSD = {
            switch: false,
            X: 0,
            Y: 0,
            osdFormat: '',
        }

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']
        let drawer = CanvasBinocular()

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        const mode = computed(() => {
            if (!ready.value) {
                return ''
            }
            return playerRef.value!.mode
        })

        const showAreaTipMsg = computed(() => {
            return pageData.value.tab === 'param' || (pageData.value.tab === 'calibration' && formData.value.calibration.modeType === 'auto')
        })

        const drawAreaTipMsg = computed(() => {
            let areaTips = ''
            if (pageData.value.tab === 'param') {
                areaTips = pageData.value.detectType === 0 ? Translate('IDCS_DRAW_RECT_TIP') : Translate('IDCS_DRAW_AREA_TIP').formatForLang(6)
            } else if (pageData.value.tab === 'calibration') {
                areaTips = Translate('IDCS_DRAW_RECT_TIP')
            }
            return areaTips
        })

        const showLineCfg = computed(() => {
            return pageData.value.detectType === 0
        })

        const showAreaCfg = computed(() => {
            return pageData.value.detectType === 1
        })

        /**
         * @description 播放器准备就绪回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                drawer.destroy()
                drawer = CanvasBinocular({
                    el: player.getDrawbordCanvas(),
                    enable: true,
                    enableOSD: false,
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

        // 首次加载成功 播放pea视频
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
            pageData.value.schedule = getScheduleId(pageData.value.scheduleList, pageData.value.schedule)
        }

        /**
         * @description 获取排程列表
         */
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        /**
         * @description 获取区域入侵检测数据
         */
        const getData = async () => {
            const sendXML = rawXml`
                <condition>
                    <chlId>${props.currChlId}</chlId>
                </condition>
                <requireField>
                    <param/>
                    <trigger/>
                </requireField>
            `
            openLoading()
            const res = await querySmartBinocularCountConfig(sendXML)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.schedule = getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid'))
                bindCtrlData(res)
                watchEdit.listen()
            } else {
                pageData.value.reqFail = true
                pageData.value.tab = ''
            }
        }

        /**
         * @description 获取区域检测数据
         * @param {XMLDocument | Element} res
         */
        const bindCtrlData = (res: XMLDocument | Element) => {
            const $ = queryXml(res)
            const param = $('content/chl/param')
            if (!param.length) {
                return
            }
            const $param = queryXml(param[0].element)

            pageData.value.lineDirectionList = $('types/directionMode/enum').map((element) => {
                const itemValue = element.text()
                return {
                    value: itemValue,
                    label: LINE_DIRECTION_MAPPING[itemValue],
                }
            })
            pageData.value.areaDirectionList = $('types/boundaryDirectionMode/enum').map((element) => {
                const itemValue = element.text()
                return {
                    value: itemValue,
                    label: BOUNDARY_DIRECTION_MAPPING[itemValue],
                }
            })
            pageData.value.calibrationModeList = $('types/calibrationMode/enum').map((element) => {
                const itemValue = element.text()
                return {
                    value: itemValue,
                    label: CALIBRATION_MODE_MAPPING[itemValue],
                }
            })

            pageData.value.countCycleTypeList = $('types/countCycleType/enum')
                .map((element) => {
                    const itemValue = element.text()
                    return {
                        value: itemValue,
                        label: COUNT_CYCLE_TYPE_MAPPING[itemValue],
                    }
                })
                .filter((item) => item.value !== 'off')

            const detectionEnable = $param('switch').text().bool()
            const supportAlarmHoldTime = $param('alarmHoldTime').length > 0
            const holdTime = $param('alarmHoldTime').text().num()
            const holdTimeList = getAlarmHoldTimeList($param('holdTimeNote').text(), holdTime)

            let boundaryInfo = $param('rule/boundary/item').map((element, index) => {
                const $element = queryXml(element.element)
                const direction = $element('direction').text() as CanvasBoundaryDirection

                return {
                    direction,
                    rectA: {
                        point: $element('rectA/point/item').map((point) => {
                            const $item = queryXml(point.element)
                            return {
                                X: $item('X').text().num(),
                                Y: $item('Y').text().num(),
                                isClosed: true,
                            }
                        }),
                        area: index,
                        LineColor: 'green',
                        maxCount: $element('rectA/point').attr('maxCount').num(),
                    },
                    rectB: {
                        point: $element('rectB/point/item').map((point) => {
                            const $item = queryXml(point.element)
                            return {
                                X: $item('X').text().num(),
                                Y: $item('Y').text().num(),
                                isClosed: true,
                            }
                        }),
                        area: index,
                        LineColor: 'green',
                        maxCount: $element('rectB/point').attr('maxCount').num(),
                    },
                }
            })

            if (boundaryInfo.length) {
                pageData.value.detectType = 1
            } else {
                boundaryInfo = [
                    {
                        direction: pageData.value.defaultAreaDirection,
                        rectA: {
                            point: [],
                            area: 0,
                            LineColor: 'green',
                            maxCount: 6,
                        },
                        rectB: {
                            point: [],
                            area: 0,
                            LineColor: 'green',
                            maxCount: 6,
                        },
                    },
                ]
            }

            let lineInfo = $param('rule/line/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    direction: $item('direction').text() as CanvasPasslineDirection,
                    startPoint: {
                        X: $item('startPoint/X').text().num(),
                        Y: $item('startPoint/Y').text().num(),
                    },
                    endPoint: {
                        X: $item('endPoint/X').text().num(),
                        Y: $item('endPoint/Y').text().num(),
                    },
                }
            })

            if (lineInfo.length) {
                pageData.value.detectType = 0
            } else {
                lineInfo = [
                    {
                        direction: pageData.value.defaultLineDirection,
                        startPoint: {
                            X: 0,
                            Y: 0,
                        },
                        endPoint: {
                            X: 0,
                            Y: 0,
                        },
                    },
                ]
            }

            if ($param('rule/line').length > 0) {
                pageData.value.detectTypeList.push({
                    value: 0,
                    label: Translate('IDCS_ALARM_LINE'),
                })
            }

            if ($param('rule/boundary').length > 0) {
                pageData.value.detectTypeList.push({
                    value: 1,
                    label: Translate('IDCS_WARN_AREA'),
                })
            }

            // OSD
            const countOSD = {
                switch: $param('countOSD/switch').text().bool(),
                X: $param('countOSD/X').text().num(),
                Y: $param('countOSD/Y').text().num(),
                osdFormat: '',
                showEnterOsd: $param('countOSD/showEnterOsd').text().bool(),
                osdEntranceName: $param('countOSD/osdEntranceName').text(),
                showExitOsd: $param('countOSD/showExitOsd').text().bool(),
                osdExitName: $param('countOSD/osdExitName').text(),
                showStayOsd: $param('countOSD/showStayOsd').text().bool(),
                osdStayName: $param('countOSD/osdStayName').text(),
                osdPersonName: $param('countOSD/osdPersonName').text(),
                osdChildName: $param('countOSD/osdChildName').text(),
                osdAlarmName: $param('countOSD/osdAlarmName').text(),
                osdWelcomeName: $param('countOSD/osdWelcomeName').text(),
            }
            const countItem = (countOSD.osdPersonName ? countOSD.osdPersonName + '-# ' : '') + (countOSD.osdChildName ? countOSD.osdChildName + '-# ' : '')
            countOSD.osdFormat =
                (countOSD.showEnterOsd ? countOSD.osdEntranceName + ': ' + countItem + '\\n' : '') +
                (countOSD.showExitOsd ? countOSD.osdExitName + ': ' + countItem + '\\n' : '') +
                (countOSD.showStayOsd ? countOSD.osdStayName + ': ' + countItem : '')

            formData.value = {
                detectionEnable: detectionEnable,
                originalEnable: detectionEnable,
                schedule: getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid')),
                supportAlarmHoldTime: supportAlarmHoldTime,
                holdTime: holdTime,
                holdTimeList: holdTimeList,
                pictureAvailable: $param('saveSourcePicture').text() !== '',
                saveSourcePicture: $param('saveSourcePicture').text().bool(),
                lineInfo: lineInfo,
                boundaryInfo: boundaryInfo,
                countOSD: countOSD,
                overcrowdingThreshold: {
                    value: $param('overcrowdingThreshold').text().num(),
                    min: $param('overcrowdingThreshold').attr('min').num(),
                    max: $param('overcrowdingThreshold').attr('max').num(),
                    default: $param('overcrowdingThreshold').attr('default').num(),
                },
                sensitivity: {
                    value: $param('sensitivity').text().num(),
                    min: $param('sensitivity').attr('min').num(),
                    max: $param('sensitivity').attr('max').num(),
                    default: $param('sensitivity').attr('default').num(),
                },
                calibration: {
                    modeType: $param('calibration/mode').text(),
                    height: {
                        value: $param('calibration/height').text().num(),
                        min: $param('calibration/height').attr('min').num(),
                        max: $param('calibration/height').attr('max').num(),
                        unit: $param('calibration/height').attr('unit'),
                    },
                    regionInfo: {
                        X1: $param('calibration/regionInfo/X1').text().num(),
                        Y1: $param('calibration/regionInfo/Y1').text().num(),
                        X2: $param('calibration/regionInfo/X2').text().num(),
                        Y2: $param('calibration/regionInfo/Y2').text().num(),
                    },
                },
                enableHeightFilter: $param('heightFilter/switch').text().bool(),
                heightLowerLimit: {
                    value: $param('heightFilter/heightLowerLimit').text().num(),
                    min: $param('heightFilter/heightLowerLimit').attr('min').num(),
                    max: $param('heightFilter/heightLowerLimit').attr('max').num(),
                    unit: $param('heightFilter/heightLowerLimit').attr('unit'),
                },
                enableChildFilter: $param('childFilter/switch').text().bool(),
                childHeightLowerLimit: {
                    value: $param('childFilter/heightUpperLimit').text().num(),
                    min: $param('childFilter/heightUpperLimit').attr('min').num(),
                    max: $param('childFilter/heightUpperLimit').attr('max').num(),
                    unit: $param('childFilter/heightUpperLimit').attr('unit'),
                },
                countPeriod: {
                    countTimeType: $param('countPeriod/countTimeType').text(),
                    day: {
                        date: $param('countPeriod/daily/dateSpan').text().num(),
                        dateTime: $param('countPeriod/daily/dateTimeSpan').text(),
                    },
                    week: {
                        date: $param('countPeriod/weekly/dateSpan').text().num(),
                        dateTime: $param('countPeriod/weekly/dateTimeSpan').text(),
                    },
                    month: {
                        date: $param('countPeriod/monthly/dateSpan').text().num(),
                        dateTime: $param('countPeriod/monthly/dateTimeSpan').text(),
                    },
                },
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
            }

            pageData.value.autoReset = formData.value.countPeriod.countTimeType !== 'off'
            if (pageData.value.autoReset) {
                pageData.value.timeType = formData.value.countPeriod.countTimeType
            }
        }

        /**
         * @description 手动重置
         */
        const resetData = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_RESET_TIP'),
            }).then(async () => {
                const sendXml = rawXml`
                    <content>
                        <chl id="${props.currChlId}">
                            <param>
                                <forceReset>true</forceReset>
                            </param>
                        </chl>
                    </content>
                `
                const result = await editVideoMetadata(sendXml)
                commSaveResponseHandler(result)
            })
        }

        // 判断数据是否为空
        const getRegionInfoIsEmpty = (data: CanvasBaseArea) => {
            return data.X1 === 0 && data.Y1 === 0 && data.X2 === 0 && data.Y2 === 0
        }

        /**
         * @description 保存配置
         */
        const saveData = async () => {
            const data = formData.value
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}" scheduleGuid="${pageData.value.schedule}">
                       ${
                           props.chlData.supportBinocularCountConfig
                               ? rawXml`
                                <param>
                                    <switch>${data.detectionEnable}</switch>
                                    <alarmHoldTime unit="s">${data.holdTime}</alarmHoldTime>
                                    <sensitivity>${data.sensitivity.value}</sensitivity>
                                    <overcrowdingThreshold>${data.overcrowdingThreshold.value}</overcrowdingThreshold>
                                    ${data.pictureAvailable ? `<saveSourcePicture>${data.saveSourcePicture}</saveSourcePicture>` : ''}
                                    <rule ruleRelationType="mutex">
                                        <line type="list" count="${data.lineInfo.length && pageData.value.detectType === 0 ? data.lineInfo.length : 0}">
                                        ${
                                            pageData.value.detectType === 0
                                                ? rawXml`
                                                    ${data.lineInfo
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
                                                                </item>
                                                            `
                                                        })
                                                        .join('')}
                                                    `
                                                : ''
                                        }

                                        </line>
                                        <boundary type="list" count="${data.boundaryInfo.length && pageData.value.detectType === 1 ? data.boundaryInfo.length : 0}">
                                        ${
                                            pageData.value.detectType === 1
                                                ? rawXml`
                                                    ${data.boundaryInfo
                                                        .map((element) => {
                                                            return rawXml`
                                                                <item>
                                                                    <direction type="direction">${element.direction}</direction>
                                                                    <rectA>
                                                                        <point type="list" maxCount="${element.rectA.maxCount}" count="${element.rectA.point.length}">
                                                                            ${element.rectA.point
                                                                                .map((point, index) => {
                                                                                    return rawXml`
                                                                                        <item index="${index}">
                                                                                            <X>${Math.floor(point.X)}</X>
                                                                                            <Y>${Math.floor(point.Y)}</Y>
                                                                                        </item>
                                                                                    `
                                                                                })
                                                                                .join('')}
                                                                        </point>
                                                                    </rectA>
                                                                    <rectB>
                                                                        <point type="list" maxCount="${element.rectB.maxCount}" count="${element.rectB.point.length}">
                                                                            ${element.rectB.point
                                                                                .map((point, index) => {
                                                                                    return rawXml`
                                                                                        <item index="${index}">
                                                                                            <X>${Math.floor(point.X)}</X>
                                                                                            <Y>${Math.floor(point.Y)}</Y>
                                                                                        </item>
                                                                                    `
                                                                                })
                                                                                .join('')}
                                                                        </point>
                                                                    </rectB>
                                                                </item>
                                                            `
                                                        })
                                                        .join('')}
                                                    `
                                                : ''
                                        }

                                        </boundary>
                                    </rule>
                                    <countPeriod>
                                        <countTimeType>${data.countPeriod.countTimeType}</countTimeType>
                                        <daily>
                                            <dateSpan>${data.countPeriod.day.date}</dateSpan>
                                            <dateTimeSpan>${data.countPeriod.day.dateTime}</dateTimeSpan>
                                        </daily>
                                        <weekly>
                                            <dateSpan>${data.countPeriod.week.date}</dateSpan>
                                            <dateTimeSpan>${data.countPeriod.week.dateTime}</dateTimeSpan>
                                        </weekly>
                                        <monthly>
                                            <dateSpan>${data.countPeriod.month.date}</dateSpan>
                                            <dateTimeSpan>${data.countPeriod.month.dateTime}</dateTimeSpan>
                                        </monthly>
                                    </countPeriod>
                                    <calibration>
                                        <mode type="calibrationMode" default="auto">${data.calibration.modeType}</mode>
                                        <height>${data.calibration.height.value}</height>
                                        ${
                                            !getRegionInfoIsEmpty(data.calibration.regionInfo)
                                                ? rawXml`
                                                    <regionInfo>
                                                        <X1>${Math.floor(data.calibration.regionInfo.X1)}</X1>
                                                        <Y1>${Math.floor(data.calibration.regionInfo.Y1)}</Y1>
                                                        <X2>${Math.floor(data.calibration.regionInfo.X2)}</X2>
                                                        <Y2>${Math.floor(data.calibration.regionInfo.Y2)}</Y2>
                                                    </regionInfo>`
                                                : ''
                                        }

                                    </calibration>
                                    <countOSD>
                                        <switch>${data.countOSD.switch}</switch>
                                        <X>${data.countOSD.X}</X>
                                        <Y>${data.countOSD.Y}</Y>
                                        <showEnterOsd>${data.countOSD.showEnterOsd}</showEnterOsd>
                                        <showExitOsd>${data.countOSD.showExitOsd}</showExitOsd>
                                        <showStayOsd>${data.countOSD.showStayOsd}</showStayOsd>
                                        <osdPersonName>${wrapCDATA(data.countOSD.osdPersonName)}</osdPersonName>
                                        <osdChildName>${wrapCDATA(data.countOSD.osdChildName)}</osdChildName>
                                        <osdAlarmName>${wrapCDATA(data.countOSD.osdAlarmName)}</osdAlarmName>
                                        <osdWelcomeName>${wrapCDATA(data.countOSD.osdWelcomeName)}</osdWelcomeName>
                                        ${data.countOSD.showEnterOsd ? `<osdEntranceName>${wrapCDATA(data.countOSD.osdEntranceName)}</osdEntranceName>` : ''}
                                        ${data.countOSD.showExitOsd ? `<osdExitName>${wrapCDATA(data.countOSD.osdExitName)}</osdExitName>` : ''}
                                        ${data.countOSD.showStayOsd ? `<osdStayName>${wrapCDATA(data.countOSD.osdStayName)}</osdStayName>` : ''}
                                    </countOSD>
                                    <heightFilter>
                                        <switch>${data.enableHeightFilter}</switch>
                                        ${data.enableHeightFilter ? `<heightLowerLimit>${data.heightLowerLimit.value}</heightLowerLimit>` : ''}
                                    </heightFilter>
                                    <childFilter>
                                        <switch>${data.enableChildFilter}</switch>
                                        ${data.enableChildFilter ? `<heightUpperLimit>${data.childHeightLowerLimit.value}</heightUpperLimit>` : ''}
                                    </childFilter>
                                </param>
                                `
                               : ''
                       }
                    </chl>
                </content>
            `
            openLoading()
            const result = await editSmartBinocularCountConfig(sendXml)
            const $ = queryXml(result)
            closeLoading()
            if ($('status').text() === 'success') {
                if (formData.value.detectionEnable) {
                    formData.value.originalEnable = true
                }
                refreshInitPage()
                watchEdit.update()
            } else {
                const errorCode = $('errorCode').text().num()
                if (errorCode === 536871053) {
                    openMessageBox(Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'))
                } else {
                    openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                }
            }
        }

        /**
         * @description 检测互斥通道 保存数据
         */
        const applyData = async () => {
            if (!verification()) return
            if (!heightFilterVerify()) return
            const data = formData.value
            checkMutexChl({
                isChange: data.detectionEnable && data.detectionEnable !== data.originalEnable,
                mutexList: data.mutexList,
                mutexListEx: data.mutexListEx,
                chlName: props.chlData.name,
                chlIp: props.chlData.ip,
                chlList: props.onlineChannelList,
                tips: 'IDCS_PASSENGER_FLOW_STATIST',
                isShowCommonMsg: true,
            }).then(() => {
                saveData()
            })
        }

        /**
         * @description 若【高度过滤】的高度大于【儿童计数】高度，保存时提示：高度过滤的高度应低于儿童计数；
         * @returns {boolean}
         */
        const heightFilterVerify = (): boolean => {
            if (formData.value.heightLowerLimit.value && formData.value.enableChildFilter) {
                const adultHeight = formData.value.heightLowerLimit.value
                const childHeight = formData.value.childHeightLowerLimit.value
                if (adultHeight >= childHeight) {
                    openMessageBox(Translate('IDCS_HEIGHT_FILTER_TIP'))
                    return false
                }
            }
            return true
        }

        /**
         * @description 检验区域合法性
         * @returns {boolean}
         */
        const verification = (): boolean => {
            // 区域为多边形时，检测区域合法性(区域入侵AI事件中：currentRegulation为false时区域为多边形；currentRegulation为true时区域为矩形-联咏IPC)
            const allRegionList: CanvasBasePoint[][] = []
            const boundaryInfoList = formData.value.boundaryInfo
            let checkFlg = true
            if (Object.keys(boundaryInfoList).length !== 0) {
                boundaryInfoList.forEach((ele) => {
                    const rectA = (ele.rectA && ele.rectA.point) || []
                    const rectB = (ele.rectB && ele.rectB.point) || []
                    allRegionList.push(rectA)
                    allRegionList.push(rectB)
                    for (const i in allRegionList) {
                        const count = allRegionList[i].length
                        if (count > 0 && count < 4) {
                            openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'))
                            checkFlg = false
                            return
                        } else if (count > 0 && !drawer.judgeAreaCanBeClosed(allRegionList[i])) {
                            openMessageBox(Translate('IDCS_INTERSECT'))
                            checkFlg = false
                            return
                        }
                    }

                    // 若当前选择的是警戒区域并且只绘制了一个区域，则提示：不能只绘制一个区域
                    if (pageData.value.detectType === 1 && ((rectA.length > 0 && rectB.length === 0) || (rectA.length === 0 && rectB.length > 0))) {
                        openMessageBox(Translate('IDCS_DRAW_ONE_AREA_TIP'))
                        checkFlg = false
                        return
                    }

                    // 当前ipc侧只支持绘制警戒线/警戒区域的其中一种，在此判断，清空另一种绘制图形
                    if (pageData.value.detectType === 0) {
                        formData.value.boundaryInfo = [
                            {
                                direction: pageData.value.defaultAreaDirection,
                                rectA: {
                                    point: [
                                        {
                                            X: 0,
                                            Y: 0,
                                            isClosed: false,
                                        },
                                    ],
                                    area: 0,
                                    LineColor: 'green',
                                    maxCount: 6,
                                },
                                rectB: {
                                    point: [
                                        {
                                            X: 0,
                                            Y: 0,
                                            isClosed: false,
                                        },
                                    ],
                                    area: 0,
                                    LineColor: 'green',
                                    maxCount: 6,
                                },
                            },
                        ]
                    } else if (pageData.value.detectType === 1) {
                        formData.value.lineInfo = [
                            {
                                direction: pageData.value.defaultLineDirection,
                                startPoint: {
                                    X: 0,
                                    Y: 0,
                                },
                                endPoint: {
                                    X: 0,
                                    Y: 0,
                                },
                            },
                        ]
                    }
                })
            }
            return checkFlg
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
                    clearOCXData()

                    if (pageData.value.detectType === 1) {
                        const sendXML = OCX_XML_SetPeaAreaAction('EDIT_ON')
                        plugin.ExecuteCmd(sendXML)
                    } else {
                        const sendEnableXML = OCX_XML_SetTripwireLineAction('EDIT_ON')
                        plugin.ExecuteCmd(sendEnableXML)
                    }
                }

                setTimeout(() => {
                    setOcxData()
                }, 150)
            } else if (pageData.value.tab === 'calibration') {
                const modeType = formData.value.calibration.modeType
                if (mode.value === 'h5') {
                    drawer.setDrawType('osd', false)
                    drawer.setEnableShowAll(false)
                    drawer.setEnable(modeType === 'auto')
                    drawer.clear()
                    // 标定方式为自动时，绘制矩形区域
                    if (modeType === 'auto') {
                        drawer.setDrawType('regulation', true)
                        drawer.setArea(formData.value.calibration.regionInfo)
                        drawer.drawArea()
                    }
                }

                if (mode.value === 'ocx') {
                    // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                    clearOCXData()

                    setTimeout(() => {
                        if (modeType === 'auto') {
                            const sendXML = OCX_XML_AddPolygonArea([], 0, false)
                            plugin.ExecuteCmd(sendXML)

                            const sendXML2 = OCX_XML_SetVfdAreaAction('EDIT_ON')
                            plugin.ExecuteCmd(sendXML2)

                            const sendXML3 = OCX_XML_SetVfdArea(formData.value.calibration.regionInfo, 'regionArea', 'green', OCX_AI_EVENT_TYPE_PLATE_DETECTION)
                            plugin.ExecuteCmd(sendXML3)
                        }
                    }, 150)
                }
            } else if (pageData.value.tab === 'imageOSD') {
                const countOSD = formData.value.countOSD || noneOSD
                const onlyOSD = formData.value.countOSD.switch
                if (mode.value === 'h5') {
                    drawer.clear()
                    drawer.setDrawType('osd', onlyOSD)
                    drawer.setOSD(countOSD)
                }

                if (mode.value === 'ocx') {
                    clearOCXData()

                    setTimeout(() => {
                        const sendClearOsdXML = OCX_XML_SetTripwireLineInfo(countOSD, onlyOSD)
                        plugin.ExecuteCmd(sendClearOsdXML)
                    }, 150)
                }
            } else if (pageData.value.tab === 'heightFilter') {
                if (mode.value === 'h5') {
                    drawer.clear()
                    drawer.setDrawType('osd', false)
                    drawer.setEnable(false)
                    drawer.init(true)
                }

                if (mode.value === 'ocx') {
                    clearOCXData()
                }
            }

            pageData.value.lastTab = pageData.value.tab
        }

        /**
         * @description 刷新页面数据
         */
        const refreshInitPage = () => {
            // 警戒线
            if (formData.value.lineInfo.length > 0) {
                pageData.value.lineChecked = formData.value.lineInfo.map((lineInfo, index) => {
                    if (lineInfo.startPoint.X || lineInfo.startPoint.Y || lineInfo.endPoint.X || lineInfo.endPoint.Y) {
                        return index
                    } else {
                        return -1
                    }
                })
            }

            // 警戒区域
            const boundaryInfoList = formData.value.boundaryInfo
            pageData.value.warnAreaChecked = []
            pageData.value.drawAreaChecked = []
            boundaryInfoList.forEach((ele, idx) => {
                if ((ele.rectA.point && ele.rectA.point.length > 0) || (ele.rectB.point && ele.rectB.point.length > 0)) {
                    pageData.value.warnAreaChecked.push(idx)
                    pageData.value.drawAreaChecked.push('rectA')
                    pageData.value.drawAreaChecked.push('rectB')
                }
            })
        }

        const isShowAllVisible = computed(() => {
            if (pageData.value.detectType === 0) {
                if (formData.value.lineInfo.length > 1) {
                    return true
                } else {
                    return false
                }
            }
            // 警戒区域有2个绘制区域，因此默认展示以下配置项
            else {
                return true
            }
        })

        /**
         * @description 初始化数据
         */
        const initPageData = async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            await getData()
            refreshInitPage()
        }

        /**
         * @description 切换线/区域
         */
        const changeLineArea = () => {
            if (pageData.value.detectType === 0) {
                if (mode.value === 'h5') {
                    drawer.clear()
                }

                // 清除多边形绘制区域
                const sendClearXML = OCX_XML_DeletePolygonArea('clearAll')
                plugin.ExecuteCmd(sendClearXML)

                const sendEnableXML = OCX_XML_SetTripwireLineAction('EDIT_ON')
                plugin.ExecuteCmd(sendEnableXML)
            } else {
                if (mode.value === 'h5') {
                    drawer.clear()
                }

                // 清除箭头绘制
                const sendClearPointXML = OCX_XML_SetTripwireLineAction('NONE')
                plugin.ExecuteCmd(sendClearPointXML)

                const sendEnableXML = OCX_XML_SetTripwireLineAction('EDIT_OFF')
                plugin.ExecuteCmd(sendEnableXML)

                const sendXML = OCX_XML_SetPeaAreaAction('EDIT_ON')
                plugin.ExecuteCmd(sendXML)
            }

            setTimeout(() => {
                setOcxData()
            }, 200)
        }

        /**
         * @description 切换线
         */
        const changeLine = () => {
            setOcxData()
        }

        /**
         * @description 切换线的方向
         */
        const changeLineDirection = () => {
            formData.value.lineInfo[pageData.value.lineIndex].direction = pageData.value.lineDirection
            setOcxData()
        }

        /**
         * @description 选择警戒区域
         */
        const changeWarnArea = () => {
            setOtherAreaClosed()
            setOcxData()
        }

        /**
         * @description 选择绘制区域
         */
        const changeDrawArea = () => {
            setOtherAreaClosed()
            setOcxData()
        }

        /**
         * @description 切换区域的方向
         */
        const changeAreaDirection = () => {
            // 警戒区域
            const area = pageData.value.warnAreaIndex
            // 绘制区域
            formData.value.boundaryInfo[area].direction = pageData.value.areaDirection
            setOcxData()
        }

        /**
         * @description 切换校正模式
         */
        const changeCalibrationMode = () => {
            const modeType = formData.value.calibration.modeType
            // 切换到手动时，清空已绘制的矩形区域
            if (modeType === 'manual') {
                if (mode.value === 'h5') {
                    drawer.clear()
                    drawer.setEnable(false)
                } else {
                    // 区域不可绘制
                    const sendXML1 = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
                    plugin.ExecuteCmd(sendXML1)
                    const sendXML2 = OCX_XML_SetVfdAreaAction('EDIT_OFF')
                    plugin.ExecuteCmd(sendXML2)
                }
            } else {
                if (mode.value === 'h5') {
                    drawer.setEnable(true)
                    drawer.setDrawType('regulation', true)
                    drawer.setArea(formData.value.calibration.regionInfo)
                    drawer.drawArea()
                } else {
                    // 绘制矩形区域
                    const sendXML1 = OCX_XML_SetVfdAreaAction('EDIT_ON')
                    plugin.ExecuteCmd(sendXML1)

                    const sendXML2 = OCX_XML_SetVfdArea(formData.value.calibration.regionInfo, 'regionArea', 'green', OCX_AI_EVENT_TYPE_PLATE_DETECTION)
                    plugin.ExecuteCmd(sendXML2)
                }
            }
        }

        /**
         * @description 标定方式校验：选择自动，若未绘制区域，点击【标定】，提示：请先绘制区域；
         */
        const calibrateVerify = () => {
            let celibrateFlg = true
            if (formData.value.calibration.modeType === 'auto') {
                const regionInfo = formData.value.calibration.regionInfo
                Object.values(regionInfo).forEach((item) => {
                    if (item === 0) {
                        openMessageBox(Translate('IDCS_DRAW_AREA_FIRST_TIP'))
                        celibrateFlg = false
                        return false
                    }
                })
            }
            return celibrateFlg
        }

        /**
         * @description 点击校正按钮
         */
        const handleCalibrate = async () => {
            if (!calibrateVerify()) return
            const data = formData.value
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}" scheduleGuid="${pageData.value.schedule}">
                       ${
                           props.chlData.supportBinocularCountConfig
                               ? rawXml`
                                    <param>
                                        <calibration>
                                            <mode type="calibrationMode" default="auto">${data.calibration.modeType}</mode>
                                            <height>${data.calibration.height.value}</height>
                                            ${
                                                !getRegionInfoIsEmpty(data.calibration.regionInfo)
                                                    ? rawXml`
                                                        <regionInfo>
                                                            <X1>${Math.floor(data.calibration.regionInfo.X1)}</X1>
                                                            <Y1>${Math.floor(data.calibration.regionInfo.Y1)}</Y1>
                                                            <X2>${Math.floor(data.calibration.regionInfo.X2)}</X2>
                                                            <Y2>${Math.floor(data.calibration.regionInfo.Y2)}</Y2>
                                                        </regionInfo>`
                                                    : ''
                                            }

                                        </calibration>
                                    </param>
                                `
                               : ''
                       }
                    </chl>
                </content>
            `
            openLoading()
            const result = await editSmartBinocularCountConfig(sendXml)
            const $ = queryXml(result)
            closeLoading()
            if ($('status').text() === 'success') {
                watchEdit.update()
            } else {
                const errorCode = $('errorCode').text().num()
                if (errorCode === 536871053) {
                    openMessageBox(Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'))
                } else {
                    openMessageBox(Translate('IDCS_CALIBRATION_FAILED'))
                }
            }
        }

        /**
         * @description 设置OSD
         */
        const setEnableOSD = () => {
            const enable = formData.value.countOSD.switch

            if (mode.value === 'h5') {
                drawer.setDrawType('osd', enable)
                drawer.setOSD(formData.value.countOSD)
            }

            if (mode.value === 'ocx') {
                // 需要插件提供专门在画点多边形情况下显示OSD的插件命令
                const sendXML = OCX_XML_SetAiOSDInfo(formData.value.countOSD, 'areaStatis')
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 开启关闭显示全部区域
         */
        const toggleShowAllArea = () => {
            showAllArea(pageData.value.isShowAllArea)
        }

        /**
         * @description 自动重置
         * @param value
         */
        const changeAutoReset = (value: CheckboxValueType) => {
            formData.value.countPeriod.countTimeType = value ? pageData.value.timeType : 'off'
        }

        /**
         * @description 重置时间模式
         * @param {string} value
         */
        const changeTimeType = (value: string) => {
            // 自动重置选中时formData.value.countPeriod.countTimeType被置为off，不方便直接绑定元素
            // 用pageData.value.timeType绑定页面元素
            formData.value.countPeriod.countTimeType = value
            // advancedVisible.value = true
        }

        /**
         * @description 更新区域数据
         * @param {CanvasBaseArea | CanvasBasePoint[] | CanvasPasslinePassline} points
         */
        const changeArea = (points: CanvasBaseArea | CanvasBasePoint[] | CanvasPasslinePassline, osdInfo?: CanvasPolygonOSDInfo) => {
            if (pageData.value.tab === 'calibration') {
                formData.value.calibration.regionInfo = points as CanvasBaseArea
            } else if (pageData.value.tab === 'imageOSD') {
                if (osdInfo) {
                    formData.value.countOSD.X = osdInfo.X
                    formData.value.countOSD.Y = osdInfo.Y
                }
            } else {
                const lineInfo = points as CanvasPasslinePassline
                // 警戒线
                if (pageData.value.detectType === 0) {
                    const lineIndex = pageData.value.lineIndex
                    formData.value.lineInfo[lineIndex].startPoint = {
                        X: lineInfo.startX,
                        Y: lineInfo.startY,
                    }
                    formData.value.lineInfo[lineIndex].endPoint = {
                        X: lineInfo.endX,
                        Y: lineInfo.endY,
                    }
                } else {
                    // 警戒区域
                    const area = pageData.value.warnAreaIndex
                    // 绘制区域
                    const drawArea = pageData.value.drawAreaIndex
                    formData.value.boundaryInfo[area][drawArea].point = points as CanvasBasePoint[]
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
            if (pageData.value.tab !== 'param') return

            if (mode.value === 'h5') {
                drawer.setEnableShowAll(isShowAll)
            }

            if (isShowAll) {
                if (pageData.value.detectType === 0) {
                    if (formData.value.lineInfo.length < 2) return
                    const lineIndex = pageData.value.lineIndex
                    const lineInfo = formData.value.lineInfo
                    if (mode.value === 'h5') {
                        drawer.setCurrentSurfaceOrAlarmLine(lineIndex)
                        drawer.drawAllPassline(lineInfo, lineIndex)
                    } else {
                        const lineInfoList = cloneDeep(lineInfo)
                        lineInfoList.splice(lineIndex, 1) // 插件端下发全部区域需要过滤掉当前区域数据
                        const sendClearXML = OCX_XML_SetAllArea({ lineInfoList: lineInfoList }, 'WarningLine', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', true)
                        plugin.ExecuteCmd(sendClearXML)
                    }
                } else {
                    const area = pageData.value.warnAreaIndex // 警戒区域
                    const drawArea = pageData.value.drawAreaIndex // 绘制区域
                    // 画点
                    const boundaryInfoList = formData.value.boundaryInfo
                    const boundaryInfo = boundaryInfoList.map((ele) => {
                        return {
                            rectA: ele.rectA?.point ? ele.rectA.point : [],
                            rectB: ele.rectB?.point ? ele.rectB.point : [],
                        }
                    })

                    if (mode.value === 'h5') {
                        drawer.setCurrAreaIndex(area, drawArea, currAreaType)
                        drawer.drawAllPolygon(boundaryInfo, [], 'detectionArea', area, drawArea, true)
                    }

                    if (mode.value === 'ocx') {
                        // 先清除所有区域
                        const sendClearXML = OCX_XML_DeletePolygonArea('clearAll')
                        plugin.ExecuteCmd(sendClearXML)
                        // 再绘制当前区域
                        const polygonAreas: Record<number, { [key: string]: CanvasBasePoint[] }> = {}
                        if (boundaryInfoList.length > 0) {
                            polygonAreas[area] = {
                                [drawArea]: (boundaryInfoList[area][drawArea] && boundaryInfoList[area][drawArea].point) || [],
                            }
                        }
                        const sendAreaXML = OCX_XML_AddPolygonAreaBinicular(polygonAreas, area, false, drawArea)
                        plugin.ExecuteCmd(sendAreaXML)

                        // 然后再绘制所有区域（结合上面绘制的当前区域会让当前区域有加粗效果）
                        const sendAllAreaXML = OCX_XML_AddPolygonAreaBinicular(boundaryInfo, area, true, drawArea)
                        plugin.ExecuteCmd(sendAllAreaXML)
                    }
                }
            } else {
                if (pageData.value.detectType === 0 && mode.value === 'ocx') {
                    // 画点
                    const sendXML = OCX_XML_SetAllArea({}, 'WarningLine', OCX_AI_EVENT_TYPE_TRIPWIRE_LINE, '', false)
                    plugin.ExecuteCmd(sendXML)
                }
                setOcxData()
            }
        }

        /**
         * @description 绘制区域
         */
        const setOcxData = () => {
            const detectType = pageData.value.detectType
            // 绘制警戒线
            if (detectType === 0) {
                const lineIndex = pageData.value.lineIndex
                let direction = pageData.value.defaultLineDirection
                if (mode.value === 'h5') {
                    // h5绘制警戒线的数据
                    let lineData = {
                        startX: 0,
                        startY: 0,
                        endX: 0,
                        endY: 0,
                    }
                    if (formData.value.lineInfo.length > 0) {
                        direction = formData.value.lineInfo[lineIndex].direction
                        lineData = {
                            startX: formData.value.lineInfo[lineIndex].startPoint.X,
                            startY: formData.value.lineInfo[lineIndex].startPoint.Y,
                            endX: formData.value.lineInfo[lineIndex].endPoint.Y,
                            endY: formData.value.lineInfo[lineIndex].endPoint.Y,
                        }
                        lineData.startX = formData.value.lineInfo[lineIndex].startPoint.X
                        lineData.startY = formData.value.lineInfo[lineIndex].startPoint.Y
                        lineData.endX = formData.value.lineInfo[lineIndex].endPoint.X
                        lineData.endY = formData.value.lineInfo[lineIndex].endPoint.Y
                    }
                    drawer.setDrawType('line', true)
                    drawer.setCurrentSurfaceOrAlarmLine(lineIndex)
                    drawer.setDirection(direction)
                    drawer.setPassline(lineData)
                }

                if (mode.value === 'ocx') {
                    // 插件绘制警戒线的数据
                    let lineOcxData = {
                        direction: direction,
                        startPoint: { X: 0, Y: 0 },
                        endPoint: { X: 0, Y: 0 },
                    }
                    if (formData.value.lineInfo.length > 0) {
                        lineOcxData = formData.value.lineInfo[lineIndex]
                    }

                    const sendClearXML = OCX_XML_DeletePolygonArea('clearAll')
                    plugin.ExecuteCmd(sendClearXML)

                    const sendXML = OCX_XML_SetTripwireLine(lineOcxData)
                    plugin.ExecuteCmd(sendXML)
                }
            } else {
                // 绘制警戒区域
                const area = pageData.value.warnAreaIndex
                const drawArea = pageData.value.drawAreaIndex
                const boundaryInfo = formData.value.boundaryInfo
                const polygonData = boundaryInfo[area] && boundaryInfo[area][drawArea] ? boundaryInfo[area][drawArea].point : []
                if (mode.value === 'h5') {
                    drawer.setDrawType('', true)
                    drawer.setCurrAreaIndex(area, drawArea, 'detectionArea')
                    drawer.setPointList(polygonData, true)
                }

                if (mode.value === 'ocx') {
                    // 先清除所有区域
                    const sendClearXML = OCX_XML_DeletePolygonArea('clearAll')
                    plugin.ExecuteCmd(sendClearXML)

                    // 再绘制当前区域
                    const polygonAreas = {
                        [area]: {
                            [drawArea]: polygonData,
                        },
                    }
                    const sendXML = OCX_XML_AddPolygonAreaBinicular(polygonAreas, area, false, drawArea)
                    plugin.ExecuteCmd(sendXML)
                }
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        /**
         * @description 关闭区域
         * @param {CanvasBasePoint[]} points
         */
        const closePath = (points: CanvasBasePoint[]) => {
            // 警戒区域区域
            const area = pageData.value.warnAreaIndex
            // 绘制区域
            const drawArea = pageData.value.drawAreaIndex
            formData.value.boundaryInfo[area][drawArea].point = points
            setClosed(formData.value.boundaryInfo[area][drawArea].point)
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
                const boundaryInfoList = formData.value.boundaryInfo
                if (boundaryInfoList && boundaryInfoList.length > 0) {
                    boundaryInfoList.forEach((boundaryInfo) => {
                        {
                            const poinObjtList = boundaryInfo.rectA.point
                            if (poinObjtList.length >= 4 && drawer.judgeAreaCanBeClosed(poinObjtList)) {
                                setClosed(poinObjtList)
                            }
                        }

                        {
                            const poinObjtList = boundaryInfo.rectB.point
                            if (poinObjtList.length >= 4 && drawer.judgeAreaCanBeClosed(poinObjtList)) {
                                setClosed(poinObjtList)
                            }
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
                // 警戒区域区域
                const area = pageData.value.warnAreaIndex
                // 绘制区域
                const drawArea = pageData.value.drawAreaIndex
                formData.value.boundaryInfo[area][drawArea].point = []

                if (mode.value === 'h5') {
                    drawer.clear()
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_DeletePolygonArea(area, drawArea)
                    plugin.ExecuteCmd(sendXML)
                }

                if (pageData.value.isShowAllArea) {
                    showAllArea(true)
                }
            })
            // }
        }

        /**
         * @description 清空插件绘制的OSD信息
         */
        const clearOCXData = () => {
            // if (pageData.value.tab !== 'imageOSD') {
            if (pageData.value.lastTab === 'param') {
                if (pageData.value.detectType === 0) {
                    // 清除箭头绘制
                    const sendClearPointXML = OCX_XML_SetTripwireLineAction('NONE')
                    plugin.ExecuteCmd(sendClearPointXML)

                    const sendEnableXML = OCX_XML_SetTripwireLineAction('EDIT_OFF')
                    plugin.ExecuteCmd(sendEnableXML)
                } else {
                    // 清除多边形绘制区域
                    const sendClearXML = OCX_XML_DeletePolygonArea('clearAll')
                    plugin.ExecuteCmd(sendClearXML)
                }
            }

            if (pageData.value.lastTab === 'calibration') {
                // 清除矩形绘制
                const sendClearRectXML = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
                plugin.ExecuteCmd(sendClearRectXML)

                const sendEnableRectXML = OCX_XML_SetVfdAreaAction('EDIT_OFF')
                plugin.ExecuteCmd(sendEnableRectXML)
            }

            if (pageData.value.lastTab === 'imageOSD') {
                const sendClearOsdXML = OCX_XML_SetTripwireLineInfo(noneOSD)
                plugin.ExecuteCmd(sendClearOsdXML)
                // setTimeout(() => {
                //     const sendClearOsdXML = OCX_XML_SetTripwireLineInfo(noneOSD)
                //     plugin.ExecuteCmd(sendClearOsdXML)
                // }, 100)
            }
            // }

            // if (pageData.value.tab === 'imageOSD') {
            // 清除多边形绘制区域
            // const sendClearXML = OCX_XML_DeletePolygonArea('clearAll')
            // plugin.ExecuteCmd(sendClearXML)

            // // 清除箭头绘制
            // const sendClearPointXML = OCX_XML_SetTripwireLineAction('NONE')
            // plugin.ExecuteCmd(sendClearPointXML)

            // const sendEnableXML = OCX_XML_SetTripwireLineAction('EDIT_OFF')
            // plugin.ExecuteCmd(sendEnableXML)

            // // 清除矩形绘制
            // const sendClearRectXML = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
            // plugin.ExecuteCmd(sendClearRectXML)

            // const sendEnableRectXML = OCX_XML_SetVfdAreaAction('EDIT_OFF')
            // plugin.ExecuteCmd(sendEnableRectXML)
            // // }

            // if (pageData.value.tab !== 'imageOSD') {
            //     setTimeout(() => {
            //         const sendClearOsdXML = OCX_XML_SetTripwireLineInfo(noneOSD)
            //         plugin.ExecuteCmd(sendClearOsdXML)
            //     }, 200)
            // }
        }

        /**
         * @description 清空当前区域按钮
         */
        const clearArea = () => {
            // 清除标定方式
            if (pageData.value.tab === 'calibration') {
                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
                    plugin.ExecuteCmd(sendXML)
                }

                formData.value.calibration.regionInfo = {
                    X1: 0,
                    X2: 0,
                    Y1: 0,
                    Y2: 0,
                }
            } else {
                // 清除警戒线
                if (pageData.value.detectType === 0) {
                    const lineIndex = pageData.value.lineIndex
                    formData.value.lineInfo[lineIndex].startPoint = { X: 0, Y: 0 }
                    formData.value.lineInfo[lineIndex].endPoint = { X: 0, Y: 0 }

                    if (mode.value === 'ocx') {
                        const sendXML = OCX_XML_SetTripwireLineAction('NONE')
                        plugin.ExecuteCmd(sendXML)
                    }
                } else {
                    // 清除警戒区域
                    const area = pageData.value.warnAreaIndex
                    const drawArea = pageData.value.drawAreaIndex
                    formData.value.boundaryInfo[area][drawArea].point = []

                    if (mode.value === 'ocx') {
                        const sendXML = OCX_XML_DeletePolygonArea(area, drawArea)
                        plugin.ExecuteCmd(sendXML)
                    }
                }
            }

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        /**
         * @description 清空所有区域
         */
        const clearAllArea = () => {
            if (pageData.value.detectType === 0) {
                formData.value.lineInfo.forEach((item) => {
                    item.startPoint = { X: 0, Y: 0 }
                    item.endPoint = { X: 0, Y: 0 }
                })

                if (mode.value === 'h5') {
                    drawer.clear()
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetAllArea({ lineInfoList: [] }, 'WarningLine', OCX_AI_EVENT_TYPE_TRIPWIRE_LINE, undefined, pageData.value.isShowAllArea)
                    plugin.ExecuteCmd(sendXML)

                    const sendXML2 = OCX_XML_SetTripwireLineAction('NONE')
                    plugin.ExecuteCmd(sendXML2)
                }
            } else {
                const boundaryInfoList = formData.value.boundaryInfo
                // 画点-警戒区域
                boundaryInfoList.forEach((ele) => {
                    ele.rectA.point = []
                    ele.rectB.point = []
                })

                if (mode.value === 'h5') {
                    drawer.clear()
                }

                if (mode.value === 'ocx') {
                    // 画点
                    const sendXML = OCX_XML_DeletePolygonArea('clearAll')
                    plugin.ExecuteCmd(sendXML)
                }
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        const notify = ($: XMLQuery, stateType: string) => {
            // 标定方式
            if (stateType === 'VfdArea') {
                // 绘制矩形
                formData.value.calibration.regionInfo = {
                    X1: $('statenotify/item/X1').text().num(),
                    X2: $('statenotify/item/X2').text().num(),
                    Y1: $('statenotify/item/Y1').text().num(),
                    Y2: $('statenotify/item/Y2').text().num(),
                }
            } else if (stateType === 'TripwireLineInfo') {
                // 绘制OSD
                const X = $('statenotify/PosInfo/X').text().num()
                const Y = $('statenotify/PosInfo/Y').text().num()
                formData.value.countOSD.X = X
                formData.value.countOSD.Y = Y
            } else if (stateType === 'TripwireLine') {
                // 绘制警戒线
                const lineIndex = pageData.value.lineIndex
                formData.value.lineInfo[lineIndex].startPoint = {
                    X: $('statenotify/startPoint').attr('X').num(),
                    Y: $('statenotify/startPoint').attr('Y').num(),
                }
                formData.value.lineInfo[lineIndex].endPoint = {
                    X: $('statenotify/endPoint').attr('X').num(),
                    Y: $('statenotify/endPoint').attr('Y').num(),
                }
            } else if (stateType === 'PeaArea') {
                // 绘制警戒区域
                if ($('statenotify/points').length) {
                    const point = $('statenotify/points/item').map((item) => {
                        return {
                            X: item.attr('X').num(),
                            Y: item.attr('Y').num(),
                        }
                    })
                    const area = pageData.value.warnAreaIndex
                    const drawArea = pageData.value.drawAreaIndex
                    formData.value.boundaryInfo[area][drawArea].point = point
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
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendAreaXML = OCX_XML_AddPolygonArea([], 0, false)
                plugin.ExecuteCmd(sendAreaXML)
                // 画点
                const sendAllAreaXML = OCX_XML_DeletePolygonArea('clearAll')
                plugin.ExecuteCmd(sendAllAreaXML)
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
            showLineCfg,
            showAreaCfg,
            showAreaTipMsg,
            drawAreaTipMsg,
            notify,
            handlePlayerReady,
            closeSchedulePop,
            applyData,
            changeTab,
            changeLineArea,
            changeLine,
            changeLineDirection,
            changeAreaDirection,
            changeCalibrationMode,
            handleCalibrate,
            setEnableOSD,
            toggleShowAllArea,
            changeWarnArea,
            changeDrawArea,
            changeAutoReset,
            changeTimeType,
            resetData,
            clearArea,
            clearAllArea,
            isShowAllVisible,
        }
    },
})
