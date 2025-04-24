/*
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-13 09:18:41
 * @Description: AI 事件——更多——温度检测
 */
import { type TableInstance } from 'element-plus'
import { type XMLQuery } from '@/utils/xmlParse'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import AlarmBaseSnapSelector from './AlarmBaseSnapSelector.vue'

export default defineComponent({
    components: {
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
    },
    setup(prop) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        // 系统配置
        const supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
        // 温度检测数据
        const formData = ref(new AlarmTemperatureDetectionDto())
        const watchEdit = useWatchEditData(formData)

        // 播放器
        const playerRef = ref<PlayerInstance>()
        // 区域界限table
        const boundaryTableRef = ref<TableInstance>()

        // 规则类型
        const ruleShapeTypeList = [
            {
                value: 'point',
                label: Translate('IDCS_DOT'),
            },
            {
                value: 'line',
                label: Translate('IDCS_LINE'),
            },
            {
                value: 'area',
                label: Translate('IDCS_AREA'),
            },
        ]

        // 绘制图形对应的点个数
        const pointToValueMap: Record<string, number> = {
            point: 1,
            line: 2,
            area: 6,
        }

        // 报警规则类型
        const alarmRuleTypeList1 = [
            {
                value: 'maxtemperabove',
                label: Translate('IDCS_MAX_TEMPER_ABOVE'),
            },
            {
                value: 'maxtemperbelow',
                label: Translate('IDCS_MAX_TEMPER_BELOW'),
            },
            {
                value: 'mintemperabove',
                label: Translate('IDCS_MIN_TEMPER_ABOVE'),
            },
            {
                value: 'mintemperbelow',
                label: Translate('IDCS_MIN_TEMPER_BELOW'),
            },
            {
                value: 'avgtemperabove',
                label: Translate('IDCS_AVG_TEMPER_ABOVE'),
            },
            {
                value: 'avgtemperbelow',
                label: Translate('IDCS_AVG_TEMPER_BELOW'),
            },
            {
                value: 'difftemperabove',
                label: Translate('IDCS_DIFF_TEMPER_ABOVE'),
            },
            {
                value: 'difftemperbelow',
                label: Translate('IDCS_DIFF_TEMPER_BELOW'),
            },
        ]

        const alarmRuleTypeList2 = [
            {
                value: 'avgtemperabove',
                label: Translate('IDCS_AVG_TEMPER_ABOVE'),
            },
            {
                value: 'avgtemperbelow',
                label: Translate('IDCS_AVG_TEMPER_BELOW'),
            },
        ]

        // 页面数据
        const pageData = ref({
            reqFail: false,
            tab: 'param',
            currRowData: new AlarmTemperatureDetectionBoundryDto(),
            // 是否显示全部区域
            isShowAllArea: false,
            // 绘图区域下提示信息
            drawAreaTip: '',
            scheduleList: [] as SelectOption<string, string>[],
            isSchedulePop: false,
            // 声音列表
            voiceList: prop.voiceList,
            triggerList: ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch', 'popMsgSwitch'],
            errorMessage: '',
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
        let drawer = CanvasTemperature()

        /**
         * @description 播放器就绪时回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                drawer.destroy()
                drawer = CanvasTemperature({
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
         * @description 切换区域
         * @param {CanvasBasePoint[] | CanvasBaseArea} points
         */
        const changeArea = (points: CanvasBasePoint[] | CanvasBaseArea) => {
            pageData.value.currRowData.points = points as CanvasBasePoint[]
            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        /**
         * @description 闭合路径
         * @param {CanvasBasePoint[]} points
         */
        const closePath = (points: CanvasBasePoint[]) => {
            if (pageData.value.currRowData.ruleType === 'area') {
                points.forEach((item) => (item.isClosed = true))
                pageData.value.currRowData.points = points
            }
        }

        /**
         * @description 适合可闭合回调
         * @param {boolean} canBeClosed
         */
        const forceClosePath = (canBeClosed: boolean) => {
            if (!canBeClosed) {
                openMessageBox(Translate('IDCS_INTERSECT'))
            }
        }

        /**
         * @description 清除当前区域
         */
        const clearCurrentArea = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DRAW_CLEAR_TIP'),
            }).then(() => {
                if (!formData.value.boundaryData.length) return
                pageData.value.currRowData.points = []

                if (mode.value === 'h5') {
                    drawer.clear()
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetOscAreaAction('NONE')
                    plugin.ExecuteCmd(sendXML)
                }

                if (pageData.value.isShowAllArea) {
                    showAllArea()
                }
            })
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
         * @description
         * @param {string} value
         * @returns {number}
         */
        const getRealValueByRatio = (value: string) => {
            return Number(value) / 10000
        }

        /**
         * @description
         * @param {number} value
         * @returns {number}
         */
        const getScaleValueByRatio = (value: number) => {
            return value * 10000
        }

        /**
         * @description 获取温度检测配置
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
            const result = await queryTemperatureAlarmConfig(sendXml)
            const $ = queryXml(result)

            closeLoading()

            const alarmRuleType1 = alarmRuleTypeList1.map((item) => item.value)
            const alarmRuleType2 = alarmRuleTypeList2.map((item) => item.value)

            if ($('status').text() === 'success') {
                const $param = queryXml($('content/chl/param')[0].element)
                const $trigger = queryXml($('content/chl/trigger')[0].element)

                formData.value = {
                    enabledSwitch: $param('switch').text().bool(),
                    holdTime: $param('alarmHoldTime').text().num(),
                    holdTimeList: getAlarmHoldTimeList($param('holdTimeNote').text(), $param('alarmHoldTime').text().num()),
                    schedule: getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid')),
                    triggerAudio: $param('triggerAudio').text(),
                    triggerWhiteLight: $param('triggerWhiteLight').text(),
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
                    trigger: ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch', 'popMsgSwitch'].filter((item) => {
                        return $trigger(item).text().bool()
                    }),
                    sysAudio: $trigger('sysAudio').attr('id'),
                    boundaryData: $param('boundary/item').map((item) => {
                        const $item = queryXml(item.element)

                        const ruleType = $item('ruleType').text()
                        let alarmRule = $item('alarmRule').text()
                        if (ruleType === 'point' && !alarmRuleType2.includes(alarmRule)) {
                            alarmRule = 'avgtemperabove'
                        } else if (ruleType !== 'point' && !alarmRuleType1.includes(alarmRule)) {
                            alarmRule = 'avgtemperabove'
                        }

                        return {
                            id: $item('ruleId').text(),
                            ruleId: $item('ruleId').text().num(),
                            switch: $item('switch').text().bool(),
                            ruleName: $item('ruleName').text(),
                            ruleType: ruleType,
                            emissivity: getRealValueByRatio($item('emissivity').text()),
                            emissivityDefault: getRealValueByRatio($item('emissivity').attr('default')),
                            distance: getRealValueByRatio($item('distance').text()),
                            distanceDefault: getRealValueByRatio($item('distance').attr('default')),
                            reflectTemper: getRealValueByRatio($item('reflectTemper').text()),
                            reflectTemperDefault: getRealValueByRatio($item('reflectTemper').attr('default')),
                            alarmRule: alarmRule,
                            alarmTemper: getRealValueByRatio($item('alarmTemper').text()),
                            alarmTemperDefault: getRealValueByRatio($item('alarmTemper').attr('default')),
                            maxCount: $item('point').attr('maxCount').num(),
                            points: $item('point/item').map((ele) => {
                                const $ele = queryXml(ele.element)
                                return {
                                    X: $ele('X').text().num(),
                                    Y: $ele('Y').text().num(),
                                    isClosed: true,
                                }
                            }),
                        }
                    }),
                }

                if (prop.chlData.supportAudio && formData.value.triggerAudio) {
                    pageData.value.triggerList.push('triggerAudio')
                    if (formData.value.triggerAudio === 'true') {
                        formData.value.trigger.push('triggerAudio')
                    }
                }

                if (prop.chlData.supportWhiteLight && formData.value.triggerWhiteLight) {
                    pageData.value.triggerList.push('triggerWhiteLight')
                    if (formData.value.triggerWhiteLight === 'true') {
                        formData.value.trigger.push('triggerWhiteLight')
                    }
                }

                formData.value.boundaryData.forEach((item, index) => {
                    if (index === 0) {
                        // 初始化选中第一行并绘制图形
                        boundaryTableRef.value!.setCurrentRow(item)
                        pageData.value.currRowData = item
                    }
                })

                watchEdit.listen()
            } else {
                pageData.value.tab = ''
                pageData.value.reqFail = true
            }
        }

        const getRuleTypeList = (ruleType: string) => {
            return ruleType === 'point' ? alarmRuleTypeList2 : alarmRuleTypeList1
        }

        /**
         * @description 切换行
         * @param {AlarmTemperatureDetectionBoundryDto} row
         */
        const changeBoundary = (row: AlarmTemperatureDetectionBoundryDto) => {
            pageData.value.currRowData = row
            // 切换另一个区域前先封闭其他可闭合的区域（“area”）
            setOtherAreaClosed()

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetOscAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            setPaintType()
            setAreaView()
        }

        /**
         * @description 设置区域图形
         */
        const setAreaView = () => {
            if (pageData.value.currRowData?.points) {
                if (mode.value === 'h5') {
                    const isFoucusClosePath = pageData.value.currRowData.ruleType === 'area'
                    drawer.setCurrAreaIndex(pageData.value.currRowData.ruleId, 'detectionArea')
                    drawer.setPointList(pageData.value.currRowData.points, isFoucusClosePath)
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetOscArea(pageData.value.currRowData.points, false)
                    plugin.ExecuteCmd(sendXML)
                }
            }

            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        /**
         * @description 是否显示全部区域
         */
        const showAllArea = () => {
            if (mode.value === 'h5') {
                drawer.setEnableShowAll(pageData.value.isShowAllArea)
            }

            if (pageData.value.isShowAllArea) {
                const detectAreaInfo = formData.value.boundaryData.map((item) => item.points)

                if (mode.value === 'h5') {
                    const index = pageData.value.currRowData.ruleId
                    drawer.setCurrAreaIndex(index, 'detectionArea')
                    drawer.drawAllPolygon(detectAreaInfo, [], 'detectionArea', index, true)
                }

                if (mode.value === 'ocx') {
                    const pluginDetectAreaInfo = cloneDeep(detectAreaInfo)
                    pluginDetectAreaInfo[pageData.value.currRowData.ruleId] = [] // 插件端下发全部区域需要过滤掉当前区域数据
                    const sendXML = OCX_XML_SetAllArea({ detectAreaInfo: pluginDetectAreaInfo }, 'IrregularPolygon', OCX_AI_EVENT_TYPE_WATCH_DETECTION, '', true)
                    plugin.ExecuteCmd(sendXML)
                }
            } else {
                if (mode.value === 'h5') {
                    setAreaView()
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_WATCH_DETECTION, '', false)
                    plugin.ExecuteCmd(sendXML)
                }
            }
        }

        /**
         * @description 清空
         */
        const clearArea = () => {
            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetOscAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        /**
         * @description 全部清除
         */
        const clearAllArea = () => {
            formData.value.boundaryData.forEach((item) => {
                item.points = []
            })

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXMLAll = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_WATCH_DETECTION, '', pageData.value.isShowAllArea)
                plugin.ExecuteCmd(sendXMLAll!)

                const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        /**
         * @description 改变类型
         * @param {AlarmTemperatureDetectionBoundryDto} row
         */
        const changeRuleType = (row: AlarmTemperatureDetectionBoundryDto) => {
            pageData.value.currRowData = row
            boundaryTableRef.value!.setCurrentRow(row)
            row.alarmRule = 'avgtemperabove'
            setPaintType()
            clearArea()
        }

        /**
         * @description 数值失去焦点
         * @param {number} min
         * @param {number} max
         */
        const blurValue = (min: number, max: number) => {
            pageData.value.errorMessage = Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(min, max)
        }

        /**
         * @description 设置绘制类型
         */
        const setPaintType = () => {
            const rowData = pageData.value.currRowData
            if (rowData.ruleType === 'line') {
                pageData.value.drawAreaTip = Translate('IDCS_DRAW_LINE_TIP')
            } else if (rowData.ruleType === 'area') {
                pointToValueMap.area = rowData.maxCount
                pageData.value.drawAreaTip = Translate('IDCS_DRAW_AREA_TIP').formatForLang(6)
            } else {
                pageData.value.drawAreaTip = ''
            }

            if (mode.value === 'h5') {
                drawer.setPointCount(pointToValueMap[rowData.ruleType], 'temperatureDetect')
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetOscAreaAction('EDIT_ON', pointToValueMap[rowData.ruleType])
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 闭合区域
         * @param {CanvasBasePoint[]} points
         */
        const setClosed = (points: CanvasBasePoint[]) => {
            points.forEach((item) => {
                item.isClosed = true
            })
        }

        /**
         * @description 闭合其他区域
         */
        const setOtherAreaClosed = () => {
            if (mode.value === 'h5') {
                // 画点-区域
                formData.value.boundaryData.forEach((item) => {
                    if (item.ruleType === 'area' && item.points.length >= 3 && drawer.judgeAreaCanBeClosed(item.points)) {
                        setClosed(item.points)
                    }
                })
            }
        }

        /**
         * @description 区域为多边形时，检测区域合法性(温度检测页面一个点为画点，两个点为画线，大于两个小于8个为区域，只需要检测区域的合法性)
         * @returns {boolean}
         */
        const verification = () => {
            const count = formData.value.boundaryData.length
            for (const item of formData.value.boundaryData) {
                if (count > 2 && !drawer.judgeAreaCanBeClosed(item.points)) {
                    openMessageBox(Translate('IDCS_INTERSECT'))
                    return false
                }
            }
            return true
        }

        /**
         * @description
         * @returns {string}
         */
        const getTempDetectionSaveData = () => {
            const sendXml = rawXml`
                <content>
                    <chl id='${prop.currChlId}' scheduleGuid='${formData.value.schedule}'>
                        <param>
                            <switch>${formData.value.enabledSwitch}</switch>
                            <alarmHoldTime>${formData.value.holdTime}</alarmHoldTime>
                            ${formData.value.triggerAudio && prop.chlData.supportAudio ? `<triggerAudio>${formData.value.trigger.includes('triggerAudio')}</triggerAudio>` : ''}
                            ${formData.value.triggerWhiteLight && prop.chlData.supportWhiteLight ? `<triggerWhiteLight>${formData.value.trigger.includes('triggerWhiteLight')}</triggerWhiteLight>` : ''}
                            <boundary type='list' count='10' maxCount='10'>
                                ${formData.value.boundaryData
                                    .map((item) => {
                                        return rawXml`
                                            <item>
                                                <switch>${item.switch}</switch>
                                                <ruleId>${item.ruleId}</ruleId>
                                                <ruleName>${item.ruleName}</ruleName>
                                                <ruleType>${item.ruleType}</ruleType>
                                                <emissivity min='0' max='10000' default='9600'>${getScaleValueByRatio(item.emissivity)}</emissivity>
                                                <distance min='0' max='1000000' default='50000'>${getScaleValueByRatio(item.distance)}</distance>
                                                <reflectTemper min='4294667296' max='600000' default='250000'>${getScaleValueByRatio(item.reflectTemper)}</reflectTemper>
                                                <alarmRule>${item.alarmRule}</alarmRule>
                                                <alarmTemper min='4294667296' max='600000' default='250000'>${getScaleValueByRatio(item.alarmTemper)}</alarmTemper>
                                                <point type='list' count='${item.points.length}' maxCount='${item.maxCount}'>
                                                    ${item.points
                                                        .map(
                                                            (ele) => rawXml`
                                                                <item>
                                                                    <X>${Math.floor(ele.X)}</X>
                                                                    <Y>${Math.floor(ele.Y)}</Y>
                                                                </item>
                                                            `,
                                                        )
                                                        .join('')}
                                                </point>
                                            </item>
                                        `
                                    })
                                    .join('')}
                            </boundary>
                        </param>
                        <trigger>
                            <sysRec>
                                <chls type='list'>
                                    ${formData.value.record.map((item) => `<item id='${item.value}'>${wrapCDATA(item.label)}</item>`).join('')}
                                </chls>
                            </sysRec>
                            <sysSnap>
                                <chls type='list'>
                                    ${formData.value.snap.map((item) => `<item id='${item.value}'>${wrapCDATA(item.label)}</item>`).join('')}
                                </chls>
                            </sysSnap>
                            <alarmOut>
                                <alarmOuts type='list'>
                                    ${formData.value.alarmOut.map((item) => `<item id='${item.value}'>${wrapCDATA(item.label)}</item>`).join('')}
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
                            <popMsgSwitch>${formData.value.trigger.includes('popMsgSwitch')}</popMsgSwitch>
                            <sysAudio id='${formData.value.sysAudio}'></sysAudio>
                        </trigger>
                    </chl>
                </content>
            `
            return sendXml
        }

        /**
         * @description 保存配置
         */
        const setData = async () => {
            if (!verification()) return

            openLoading()

            const sendXml = getTempDetectionSaveData()
            const result = await editTemperatureAlarmConfig(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).finally(() => {
                    // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面）
                    setAreaView()
                    watchEdit.update()
                })
            } else {
                const errorCode = $('errorCode').text().num()
                if (errorCode === 536871053) {
                    openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'))
                } else {
                    openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                }
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
                        const sendXML = OCX_XML_SetVfdAreaAction('EDIT_ON')
                        plugin.ExecuteCmd(sendXML)
                    }

                    setPaintType()
                    setAreaView()
                })
                stopWatchFirstPlay()
            }
        })

        const notify = ($: XMLQuery, stateType: string) => {
            // 温度报警检测
            if (stateType === 'PeaArea') {
                if ($('statenotify/points').length) {
                    pageData.value.currRowData.points = $('statenotify/points/item').map((item) => {
                        return {
                            X: item.attr('X').num(),
                            Y: item.attr('Y').num(),
                        }
                    })
                }

                const errorCode = $('statenotify/errorCode').text().num()
                if (errorCode === 517) {
                    // 517-区域已闭合
                    clearCurrentArea()
                } else if (errorCode === 515) {
                    // 515-区域有相交直线，不可闭合
                    openMessageBox(Translate('IDCS_INTERSECT'))
                }
            }
        }

        /**
         * @description 获取排程列表
         */
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        /**
         * @description 关闭排程弹窗
         */
        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            formData.value.schedule = getScheduleId(pageData.value.scheduleList, formData.value.schedule)
        }

        onMounted(async () => {
            await getScheduleList()
            getData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendMinXML = OCX_XML_SetOscAreaAction('NONE')
                plugin.ExecuteCmd(sendMinXML)

                const sendXMLAll = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_WATCH_DETECTION, '', false)
                plugin.ExecuteCmd(sendXMLAll!)

                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }

            drawer.destroy()
        })

        return {
            supportAlarmAudioConfig,
            formData,
            watchEdit,
            playerRef,
            notify,
            boundaryTableRef,
            ruleShapeTypeList,
            pageData,
            handlePlayerReady,
            showAllArea,
            clearArea,
            clearAllArea,
            changeBoundary,
            changeRuleType,
            blurValue,
            getRuleTypeList,
            setData,
            closeSchedulePop,
        }
    },
})
