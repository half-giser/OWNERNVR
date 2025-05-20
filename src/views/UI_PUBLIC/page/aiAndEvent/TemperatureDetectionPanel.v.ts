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

        let currAreaType: CanvasPolygonAreaType = 'detectionArea' // detectionArea侦测区域 maskArea屏蔽区域 regionArea矩形区域

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

        // 温度单位
        const tempUnitsList = [
            {
                value: 'centigrade',
                label: Translate('IDCS_CENTIGRADE') + '(°C)',
            },
            {
                value: 'Fahrenheit',
                label: Translate('IDCS_FAHRENHEIT') + '(°F)',
            },
        ]

        // 距离单位
        const distanceUnitList = [
            {
                value: 'Meter',
                label: Translate('IDCS_METER') + '(m)',
            },
            {
                value: 'Foot',
                label: Translate('IDCS_FOOT') + '(ft)',
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
            // 是否支持声音设置
            supportAlarmAudioConfig: true,
            reqFail: false,
            tab: 'param',
            isClickTable: true, // 区分当前是点击表格还是点击屏蔽区域
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
            // 表格的提示信息
            errorMessage: '',
            // 高级弹出框的提示信息
            errorMessageTemp: '',
            // 选择的屏蔽区域index，页面初始化时未选择屏蔽区域
            maskAreaIndex: -1,
            maskAreaChecked: [] as number[],
            // 控制显示展示全部区域的checkbox
            showAllAreaVisible: true,
            // 控制显示清除全部区域按钮 >=2才显示
            clearAllVisible: true,
            // 当前画点规则 regulation==1：画矩形，regulation==0或空：画点 - (regulation=='1'则currentRegulation为true：画矩形，否则currentRegulation为false：画点)
            currentRegulation: false,
            moreDropDown: false,
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

        // 高级弹出框距离的最值范围
        const tempInfoDistanceMin = computed(() => {
            return formData.value.distanceUnits === 'Meter' ? formData.value.tempInfo.distance.min : formData.value.tempInfo.distance.fmin
        })

        const tempInfoDistanceMax = computed(() => {
            return formData.value.distanceUnits === 'Meter' ? formData.value.tempInfo.distance.max : formData.value.tempInfo.distance.fmax
        })

        // 高级弹出框反射温度的最值范围
        const tempInfoReflectMin = computed(() => {
            return formData.value.tempUnits === 'centigrade' ? formData.value.tempInfo.reflectTemper.min : formData.value.tempInfo.reflectTemper.fmin
        })

        const tempInfoReflectMax = computed(() => {
            return formData.value.tempUnits === 'centigrade' ? formData.value.tempInfo.reflectTemper.max : formData.value.tempInfo.reflectTemper.fmax
        })

        // 根据单位切换对应的说明文字
        const distanceText = computed(() => {
            return formData.value.distanceUnits === 'Meter' ? Translate('IDCS_DISTANCE') : Translate('IDCS_FDISTANCE_UNIT')
        })

        const reflectTemText = computed(() => {
            return formData.value.tempUnits === 'centigrade' ? Translate('IDCS_REFLECTED_TEMPERATURE') : Translate('IDCS_REFLECTED_FTEMPERATURE_UNIT')
        })

        const alarmTemText = computed(() => {
            return formData.value.tempUnits === 'centigrade' ? Translate('IDCS_ALARM_CTEMPERATURE') : Translate('IDCS_ALARM_FTEMPERATURE')
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
         * @description 切换温度单位
         */
        const changeTempUnits = () => {
            const tempUnits = formData.value.tempUnits
            // 更新表格的温度
            formData.value.boundaryData.forEach((element) => {
                element.reflectTemper.value = tempUnits === 'centigrade' ? fahrenheitToCelsius('isReflect', element.reflectTemper.value) : celsiusToFahrenheit('isReflect', element.reflectTemper.value)
                element.alarmTemper.value = tempUnits === 'centigrade' ? fahrenheitToCelsius('isAlarm', element.alarmTemper.value) : celsiusToFahrenheit('isAlarm', element.alarmTemper.value)
            })
            // 更新高级弹出框的反射温度
            formData.value.tempInfo.reflectTemper.value =
                tempUnits === 'centigrade'
                    ? fahrenheitToCelsius('isReflect', formData.value.tempInfo.reflectTemper.value)
                    : celsiusToFahrenheit('isReflect', formData.value.tempInfo.reflectTemper.value)
        }

        /**
         * @description 切换距离单位
         */
        const changeDistanceUnits = () => {
            // 更新表格的距离
            const distanceUnits = formData.value.distanceUnits
            formData.value.boundaryData.forEach((element) => {
                element.distance.value = distanceUnits === 'Meter' ? feetToMeter(element.distance.value) : meterToFeet(element.distance.value)
            })
            // 更新高级弹出框的距离
            formData.value.tempInfo.distance.value = distanceUnits === 'Meter' ? feetToMeter(formData.value.tempInfo.distance.value) : meterToFeet(formData.value.tempInfo.distance.value)
        }

        /**
         * @description 切换区域
         * @param {CanvasBasePoint[] | CanvasBaseArea} points
         */
        const changeArea = (points: CanvasBasePoint[] | CanvasBaseArea) => {
            if (currAreaType === 'maskArea') {
                const index = pageData.value.maskAreaIndex
                formData.value.maskAreaInfo[index].points = points
            } else {
                pageData.value.currRowData.points = points as CanvasBasePoint[]
            }

            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        /**
         * @description 闭合路径
         * @param {CanvasBasePoint[]} points
         */
        const closePath = (points: CanvasBasePoint[]) => {
            if (currAreaType === 'maskArea') {
                const area = pageData.value.maskAreaIndex
                formData.value.maskAreaInfo[area].points = points
                formData.value.maskAreaInfo[area].points.forEach((ele) => {
                    ele.isClosed = true
                })
            } else {
                if (pageData.value.currRowData.ruleType === 'area') {
                    points.forEach((item) => (item.isClosed = true))
                    pageData.value.currRowData.points = points
                }
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
                if (currAreaType === 'maskArea') {
                    const area = pageData.value.maskAreaIndex
                    formData.value.maskAreaInfo[area].points = []
                } else {
                    if (!formData.value.boundaryData.length) return
                    pageData.value.currRowData.points = []
                }

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
         * @description 英尺转为米
         * @param {number} feet
         * @returns {number}
         */
        const feetToMeter = (feet: number) => {
            let meter = Number(feet / 3.2808)
            if (meter > 99.95) meter = 100 // 避免(328/3.2808 = 99.98)的场景
            if (meter < 0) meter = 0
            return meter.toFixed(2).num()
        }

        /**
         * @description 米转为英尺
         * @param {number} meter
         * @returns {number}
         */
        const meterToFeet = (meter: number) => {
            let feet = Number(meter * 3.2808)
            if (feet > 328) feet = 328
            if (feet < 0) feet = 0
            return feet.toFixed(2).num()
        }

        /**
         * @description 摄氏度转为华氏度
         * 反射温度：-22~140；报警温度：-4~302
         * @param {string} type 反射温度、报警温度取值范围不一样，用type做区分，isReflect: 反射温度；isAlarm：报警温度
         * @param {number} celsius 需要转换的摄氏度
         * @returns
         */
        const celsiusToFahrenheit = (type: string, celsius: number) => {
            const min = type === 'isReflect' ? -22 : -4
            const max = type === 'isReflect' ? 140 : 302
            let fahrenheit = Number((celsius * 9) / 5 + 32)
            if (fahrenheit > max) fahrenheit = max
            if (fahrenheit < min) fahrenheit = min
            return fahrenheit.toFixed(2).num()
        }

        /**
         * @description 华氏度转为摄氏度
         * 反射温度：-30~60；报警温度：-20~150
         * @param {string} type 反射温度、报警温度取值范围不一样，用type做区分，isReflect: 反射温度；isAlarm：报警温度
         * @param {number} fahrenheit 需要转换的华氏度
         * @returns
         */
        const fahrenheitToCelsius = (type: string, fahrenheit: number) => {
            const min = type === 'isReflect' ? -30 : -20
            const max = type === 'isReflect' ? 60 : 150
            let celsius = Number(((fahrenheit - 32) * 5) / 9)
            if (celsius > max) celsius = max
            if (celsius < min) celsius = min
            return celsius.toFixed(2).num()
        }

        /**
         * @description
         * @param {string} value
         * @returns {number}
         */
        const getRealValueByRatio = (value: string) => {
            return (Number(value) / 10000).toFixed(2).num()
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

                // 屏蔽区域
                const supportMaskArea = $param('maskArea').text() !== ''
                const maskAreaInfo: {
                    points: CanvasBasePoint[]
                    maxCount: number
                    ruleType: string
                }[] = []
                $param('maskArea/item').forEach((element) => {
                    const $element = queryXml(element.element)
                    const maskArea = {
                        points: [] as CanvasBasePoint[],
                        ruleType: 'area',
                        maxCount: $element('point').attr('maxCount').num(),
                    }
                    $element('point/item').forEach((point) => {
                        const $item = queryXml(point.element)
                        maskArea.points.push({
                            X: $item('X').text().num(),
                            Y: $item('Y').text().num(),
                            isClosed: true,
                        })
                    })
                    maskAreaInfo.push(maskArea)
                })

                formData.value = {
                    enabledSwitch: $param('switch').text().bool(),
                    holdTime: $param('alarmHoldTime').text().num(),
                    holdTimeList: getAlarmHoldTimeList($param('holdTimeNote').text(), $param('alarmHoldTime').text().num()),
                    schedule: getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid')),
                    supportMaskArea: supportMaskArea,
                    maskAreaInfo: maskAreaInfo,
                    // 基础温度配置信息
                    tempUnits: $param('tempUnits').text(),
                    distanceUnits: $param('distanceUnits').text(),
                    isShowDistance: $param('distanceUnits').length > 0,
                    thermaldisplayen: $param('thermaldisplayen').text().bool(),
                    isShowThermal: $param('thermaldisplayen').length > 0,
                    opticaldisplayen: $param('opticaldisplayen').text().bool(),
                    isShowOptical: $param('opticaldisplayen').length > 0,
                    tempInfo: {
                        emissivity: new AlarmTempEmissivityDto(),
                        distance: new AlarmTempDistanceDto(),
                        reflectTemper: new AlarmTemperatureDto(),
                        segcolorTemperatureParam: $param('tempInfo/segcolorTemperatureParam').text().bool(),
                        isShowSegcolor: $param('tempInfo/segcolorTemperatureParam').length > 0,
                        dotTemperatureInfo: $param('tempInfo/dotTemperatureInfo').text().bool(),
                        maxtemperen: $param('tempInfo/maxtemperen').text().bool(),
                        isShowAvgtemperen: $param('tempInfo/avgtemperen').length > 0,
                        avgtemperen: $param('tempInfo/avgtemperen').text().bool(),
                        mintemperen: $param('tempInfo/mintemperen').text().bool(),
                    },
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
                            supportDuration: $item('duration').length > 0,
                            duration: {
                                value: $item('duration').text().num() || $item('duration').attr('default').num(),
                                min: $item('duration').attr('min').num(),
                                max: $item('duration').attr('max').num(),
                                default: $item('duration').attr('default').num(),
                            },
                            emissivity: {
                                value: getRealValueByRatio($item('emissivity').text()),
                                min: getRealValueByRatio($item('emissivity').attr('min')),
                                max: getRealValueByRatio($item('emissivity').attr('max')),
                                default: getRealValueByRatio($item('emissivity').attr('default')),
                            },
                            distance: {
                                value: getRealValueByRatio($item('distance').text()),
                                min: getRealValueByRatio($item('distance').attr('min')),
                                max: getRealValueByRatio($item('distance').attr('max')),
                                fmin: getRealValueByRatio($item('distance').attr('fmin')),
                                fmax: getRealValueByRatio($item('distance').attr('fmax')),
                                default: getRealValueByRatio($item('distance').attr('default')),
                                fdefault: getRealValueByRatio($item('distance').attr('fdefault')),
                            },
                            reflectTemper: {
                                value: getRealValueByRatio($item('reflectTemper').text()),
                                min: getRealValueByRatio($item('reflectTemper').attr('min')),
                                max: getRealValueByRatio($item('reflectTemper').attr('max')),
                                fmin: getRealValueByRatio($item('reflectTemper').attr('fmin')),
                                fmax: getRealValueByRatio($item('reflectTemper').attr('fmax')),
                                default: getRealValueByRatio($item('reflectTemper').attr('default')),
                                fdefault: getRealValueByRatio($item('reflectTemper').attr('fdefault')),
                            },
                            alarmRule: alarmRule,
                            alarmTemper: {
                                value: getRealValueByRatio($item('alarmTemper').text()),
                                min: getRealValueByRatio($item('alarmTemper').attr('min')),
                                max: getRealValueByRatio($item('alarmTemper').attr('max')),
                                fmin: getRealValueByRatio($item('alarmTemper').attr('fmin')),
                                fmax: getRealValueByRatio($item('alarmTemper').attr('fmax')),
                                default: getRealValueByRatio($item('alarmTemper').attr('default')),
                                fdefault: getRealValueByRatio($item('alarmTemper').attr('fdefault')),
                            },
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

                // 发射率
                const emissivityValue = getRealValueByRatio($param('tempInfo/emissivity').text())
                const emissivityDefault = getRealValueByRatio($param('tempInfo/emissivity').attr('default'))
                const emissivity = emissivityValue || emissivityDefault
                formData.value.tempInfo.emissivity = {
                    value: emissivity,
                    min: getRealValueByRatio($param('tempInfo/emissivity').attr('min')),
                    max: getRealValueByRatio($param('tempInfo/emissivity').attr('max')),
                    default: emissivityDefault,
                }
                // 距离
                const distanceDefault = getRealValueByRatio($param('tempInfo/distance').attr('default'))
                const distanceDefaultF = getRealValueByRatio($param('tempInfo/distance').attr('fdefault'))
                const distanceValue = getRealValueByRatio($param('tempInfo/distance').text())
                let distance = 0
                if (formData.value.tempUnits === 'centigrade') {
                    distance = distanceValue || distanceDefault
                } else {
                    distance = distanceValue || distanceDefaultF
                }
                formData.value.tempInfo.distance = {
                    value: distance,
                    min: getRealValueByRatio($param('tempInfo/distance').attr('min')),
                    max: getRealValueByRatio($param('tempInfo/distance').attr('max')),
                    fmin: getRealValueByRatio($param('tempInfo/distance').attr('fmin')),
                    fmax: getRealValueByRatio($param('tempInfo/distance').attr('fmax')),
                    default: distanceDefault,
                    fdefault: distanceValue,
                }
                // 反射温度
                const reflectDefault = getRealValueByRatio($param('tempInfo/reflectTemper').attr('default'))
                const reflectDefaultF = getRealValueByRatio($param('tempInfo/reflectTemper').attr('fdefault'))
                const reflectValue = getRealValueByRatio($param('tempInfo/reflectTemper').text())
                let reflect = 0
                if (formData.value.distanceUnits === 'Meter') {
                    reflect = reflectValue || reflectDefault
                } else {
                    reflect = reflectValue || reflectDefaultF
                }
                formData.value.tempInfo.reflectTemper = {
                    value: reflect,
                    min: getRealValueByRatio($param('tempInfo/reflectTemper').attr('min')),
                    max: getRealValueByRatio($param('tempInfo/reflectTemper').attr('max')),
                    fmin: getRealValueByRatio($param('tempInfo/reflectTemper').attr('fmin')),
                    fmax: getRealValueByRatio($param('tempInfo/reflectTemper').attr('fmax')),
                    default: reflectDefault,
                    fdefault: reflectDefaultF,
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

        /**
         * @description 初始化页面数据
         */
        const initPageData = async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            await getData()
            refreshInitPage()
        }

        /**
         * @description 刷新页面数据
         */
        const refreshInitPage = () => {
            // 画点-屏蔽区域
            const maskAreaInfoList = formData.value.maskAreaInfo
            pageData.value.maskAreaChecked = maskAreaInfoList.map((ele, index) => {
                if (ele.points.length) {
                    return index
                }
                return -1
            })

            // 是否显示全部区域切换按钮和清除全部按钮（区域数量大于等于2时才显示）
            if (maskAreaInfoList && maskAreaInfoList.length > 1) {
                pageData.value.showAllAreaVisible = true
                pageData.value.clearAllVisible = true
            } else {
                pageData.value.showAllAreaVisible = false
                pageData.value.clearAllVisible = false
            }
        }

        const getRuleTypeList = (ruleType: string) => {
            return ruleType === 'point' ? alarmRuleTypeList2 : alarmRuleTypeList1
        }

        /**
         * @description 选择屏蔽区域
         */
        const changeMaskArea = () => {
            currAreaType = 'maskArea'
            // 取消表格高亮效果
            pageData.value.isClickTable = false
            setPaintType('area')
            setOtherAreaClosed()
            setAreaView()
        }

        /**
         * @description 切换行
         * @param {AlarmTemperatureDetectionBoundryDto} row
         */
        const changeBoundary = (row: AlarmTemperatureDetectionBoundryDto) => {
            // 取消屏蔽区域选中效果
            pageData.value.maskAreaIndex = -1
            pageData.value.isClickTable = true
            pageData.value.currRowData = row
            currAreaType = 'detectionArea'
            // 切换另一个区域前先封闭其他可闭合的区域（“area”）
            setOtherAreaClosed()

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetOscAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }
            setPaintType(pageData.value.currRowData.ruleType)
            setAreaView()
        }

        /**
         * @description 设置区域图形
         */
        const setAreaView = () => {
            if (currAreaType === 'maskArea') {
                const area = pageData.value.maskAreaIndex
                const maskAreaInfo = formData.value.maskAreaInfo
                if (maskAreaInfo.length) {
                    if (mode.value === 'h5') {
                        // 检测区域/屏蔽区域
                        const lineStyle = currAreaType === 'maskArea' ? '#d9001b' : '#00ff00'
                        drawer.setLineStyle(lineStyle)
                        drawer.setCurrAreaIndex(area, 'maskArea')
                        // 画点
                        drawer.setPointList(maskAreaInfo[area].points, true)
                    }

                    if (mode.value === 'ocx') {
                        const sendXML = OCX_XML_SetVsdArea(maskAreaInfo[area].points, false, area, 'red')
                        plugin.ExecuteCmd(sendXML)
                    }
                }
            } else {
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
                const maskAreaInfo = formData.value.maskAreaInfo.map((item) => item.points)

                if (mode.value === 'h5') {
                    const index = currAreaType === 'maskArea' ? pageData.value.maskAreaIndex : pageData.value.currRowData.ruleId
                    drawer.setCurrAreaIndex(index, currAreaType)
                    drawer.drawAllPolygon(detectAreaInfo, maskAreaInfo, currAreaType, index, true)
                }

                if (mode.value === 'ocx') {
                    const pluginDetectAreaInfo = cloneDeep(detectAreaInfo)
                    pluginDetectAreaInfo[pageData.value.currRowData.ruleId] = [] // 插件端下发全部区域需要过滤掉当前区域数据
                    const sendXML = OCX_XML_SetAllArea({ detectAreaInfo: pluginDetectAreaInfo, maskAreaInfo: maskAreaInfo }, 'IrregularPolygon', OCX_AI_EVENT_TYPE_WATCH_DETECTION, '', true)
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
            if (currAreaType === 'maskArea') {
                const area = pageData.value.maskAreaIndex
                formData.value.maskAreaInfo[area].points = []
            } else {
                pageData.value.currRowData.points = []
            }

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

            // 屏蔽区域
            const maskAreaInfoList = formData.value.maskAreaInfo
            maskAreaInfoList.forEach((ele) => {
                ele.points = []
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
            setPaintType(pageData.value.currRowData.ruleType)
            clearArea()
        }

        /**
         * @description 数值失去焦点
         * @param {number} min
         * @param {number} max
         */
        const blurInputTemp = (min: number, max: number) => {
            pageData.value.errorMessageTemp = Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(min, max)
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
         * @param {string} ruleType
         */
        const setPaintType = (ruleType: string) => {
            const rowData = pageData.value.currRowData
            if (ruleType === 'line') {
                pageData.value.drawAreaTip = Translate('IDCS_DRAW_LINE_TIP')
            } else if (ruleType === 'area') {
                pointToValueMap.area = rowData.maxCount
                pageData.value.drawAreaTip = Translate('IDCS_DRAW_AREA_TIP').formatForLang(rowData.maxCount)
            } else {
                pageData.value.drawAreaTip = ''
            }

            if (mode.value === 'h5') {
                drawer.setPointCount(pointToValueMap[ruleType], 'temperatureDetect')
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetOscAreaAction('EDIT_ON', pointToValueMap[ruleType])
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
                const allInfoList = [...formData.value.boundaryData, ...formData.value.maskAreaInfo]
                // 画点-区域
                if (allInfoList && allInfoList.length > 0) {
                    allInfoList.forEach((item) => {
                        if (item.ruleType === 'area' && item.points.length >= 4 && drawer.judgeAreaCanBeClosed(item.points)) {
                            setClosed(item.points)
                        }
                    })
                }
            }
        }

        /**
         * @description 区域为多边形时，检测区域合法性(温度检测页面一个点为画点，两个点为画线，大于两个小于8个为区域，只需要检测区域的合法性)
         * @returns {boolean}
         */
        const verification = (): boolean => {
            const count = formData.value.boundaryData.length
            for (const item of formData.value.boundaryData) {
                if (count > 2 && !drawer.judgeAreaCanBeClosed(item.points)) {
                    openMessageBox(Translate('IDCS_INTERSECT'))
                    return false
                }
            }
            // 屏蔽区域为多边形
            const allRegionList: CanvasBasePoint[][] = []
            const maskAreaInfoList = formData.value.maskAreaInfo
            maskAreaInfoList.forEach(function (ele) {
                allRegionList.push(ele.points)
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
                            <tempUnits>${formData.value.tempUnits}</tempUnits>
                            ${formData.value.isShowDistance ? `<distanceUnits>${formData.value.distanceUnits}</distanceUnits>` : ''}
                            ${formData.value.isShowThermal ? `<thermaldisplayen>${formData.value.thermaldisplayen}</thermaldisplayen>` : ''}
                            ${formData.value.isShowOptical ? `<opticaldisplayen>${formData.value.opticaldisplayen}</opticaldisplayen>` : ''}
                            ${formData.value.triggerAudio && prop.chlData.supportAudio ? `<triggerAudio>${formData.value.trigger.includes('triggerAudio')}</triggerAudio>` : ''}
                            ${formData.value.triggerWhiteLight && prop.chlData.supportWhiteLight ? `<triggerWhiteLight>${formData.value.trigger.includes('triggerWhiteLight')}</triggerWhiteLight>` : ''}
                            <tempInfo>
                                <dotTemperatureInfo>${formData.value.tempInfo.dotTemperatureInfo}</dotTemperatureInfo>
                                <emissivity>${getScaleValueByRatio(formData.value.tempInfo.emissivity.value)}</emissivity>
                                <distance>${getScaleValueByRatio(formData.value.tempInfo.distance.value)}</distance>
                                <reflectTemper>${getScaleValueByRatio(formData.value.tempInfo.reflectTemper.value)}</reflectTemper>
                                <maxtemperen>${formData.value.tempInfo.maxtemperen}</maxtemperen>
                                <mintemperen>${formData.value.tempInfo.mintemperen}</mintemperen>
                                ${formData.value.tempInfo.isShowSegcolor ? `<segcolorTemperatureParam>${formData.value.tempInfo.segcolorTemperatureParam}</segcolorTemperatureParam>` : ''}
                                ${formData.value.tempInfo.isShowAvgtemperen ? `<avgtemperen>${formData.value.tempInfo.avgtemperen}</avgtemperen>` : ''}
                            </tempInfo>
                            <boundary type='list' count='10' maxCount='10'>
                                ${formData.value.boundaryData
                                    .map((item) => {
                                        return rawXml`
                                            <item>
                                                <switch>${item.switch}</switch>
                                                <ruleId>${item.ruleId}</ruleId>
                                                <ruleName>${item.ruleName}</ruleName>
                                                <ruleType>${item.ruleType}</ruleType>
                                                <emissivity min='0' max='10000' default='9600'>${getScaleValueByRatio(item.emissivity.value)}</emissivity>
                                                <distance min='0' max='1000000' default='50000'>${getScaleValueByRatio(item.distance.value)}</distance>
                                                <reflectTemper min='4294667296' max='600000' default='250000'>${getScaleValueByRatio(item.reflectTemper.value)}</reflectTemper>
                                                <alarmRule>${item.alarmRule}</alarmRule>
                                                <alarmTemper min='4294667296' max='600000' default='250000'>${getScaleValueByRatio(item.alarmTemper.value)}</alarmTemper>
                                                ${item.supportDuration ? `<duration>${item.duration.value}</duration>` : ''}
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
                            ${
                                formData.value.supportMaskArea
                                    ? rawXml`
                                <maskArea type="list" count="${formData.value.maskAreaInfo.length}">
                                ${formData.value.maskAreaInfo
                                    .map((element) => {
                                        return rawXml`
                                                <item>
                                                    <point type="list" maxCount="${element.maxCount}" count="${element.point.length}">
                                                        ${element.points
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

                    setPaintType(pageData.value.currRowData.ruleType)
                    setAreaView()
                })
                stopWatchFirstPlay()
            }
        })

        const notify = ($: XMLQuery, stateType: string) => {
            // 温度报警检测
            if (stateType === 'PeaArea') {
                if ($('statenotify/points').length) {
                    const points = $('statenotify/points/item').map((item) => {
                        return {
                            X: item.attr('X').num(),
                            Y: item.attr('Y').num(),
                        }
                    })
                    if (currAreaType === 'maskArea') {
                        const index = pageData.value.maskAreaIndex
                        formData.value.maskAreaInfo[index].points = points
                    } else {
                        pageData.value.currRowData.points
                    }
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
            initPageData()
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
            pageData,
            boundaryTableRef,
            ruleShapeTypeList,
            tempUnitsList,
            distanceUnitList,
            tempInfoDistanceMin,
            tempInfoDistanceMax,
            tempInfoReflectMin,
            tempInfoReflectMax,
            distanceText,
            reflectTemText,
            alarmTemText,
            handlePlayerReady,
            showAllArea,
            clearArea,
            clearAllArea,
            changeTempUnits,
            changeDistanceUnits,
            changeMaskArea,
            changeBoundary,
            changeRuleType,
            blurInputTemp,
            blurValue,
            getRuleTypeList,
            setData,
            closeSchedulePop,
        }
    },
})
