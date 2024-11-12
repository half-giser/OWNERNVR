/*
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-13 09:18:41
 * @Description: AI 事件——更多——温度检测
 */
import { cloneDeep } from 'lodash-es'
import { type AlarmTemperatureDetectionBoundryDto, type AlarmChlDto, AlarmTemperatureDetectionDto } from '@/types/apiType/aiAndEvent'
import CanvasPolygon from '@/utils/canvas/canvasTemperature'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'
import { type TableInstance, type TabPaneName } from 'element-plus'
import { type XmlResult } from '@/utils/xmlParse'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import AlarmBaseSnapSelector from './AlarmBaseSnapSelector.vue'

export default defineComponent({
    components: {
        ScheduleManagPop,
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
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const pluginStore = usePluginStore()
        const systemCaps = useCababilityStore()
        const osType = getSystemInfo().platform
        const Plugin = inject('Plugin') as PluginType

        // 系统配置
        const supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
        // 温度检测数据
        const tempDetectionData = ref(new AlarmTemperatureDetectionDto())

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
            tab: 'param',
            currRowData: {} as AlarmTemperatureDetectionBoundryDto,
            // 是否显示全部区域
            isShowAllArea: false,
            // 绘图区域下提示信息
            drawAreaTip: '',
            scheduleList: [] as SelectOption<string, string>[],
            scheduleManagPopOpen: false,
            alarmRuleTypeList: [] as SelectOption<string, string>[][],
            // 声音列表
            voiceList: prop.voiceList,
            triggerList: ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch', 'popMsgSwitch'],
            // 初始化，后判断应用是否可用
            initComplated: false,
            applyDisabled: true,
            notification: [] as string[],
            errorMessage: '',
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
        // 车牌侦测绘制的Canvas
        let tempDrawer = new CanvasPolygon({
            el: document.createElement('canvas'),
        })

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
                const canvas = player.getDrawbordCanvas(0)
                tempDrawer = new CanvasPolygon({
                    el: canvas,
                    onchange: tempAreaChange,
                    closePath: tempClosePath,
                    forceClosePath: tempForceClosePath,
                    clearCurrentArea: tempClearCurrentArea,
                })
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
                const sendXML = OCX_XML_SetPluginModel(osType == 'mac' ? 'OscConfig' : 'ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        // tempDrawer初始化时绑定以下函数
        const tempAreaChange = (points: { X: number; Y: number; isClosed?: boolean }[] | { X1: number; Y1: number; X2: number; Y2: number }) => {
            pageData.value.currRowData.points = points as { X: number; Y: number; isClosed: boolean }[]
            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        const tempClosePath = (points: { X: number; Y: number; isClosed?: boolean }[]) => {
            if (pageData.value.currRowData.ruleType == 'area') {
                points.forEach((item) => (item.isClosed = true))
                pageData.value.currRowData.points = points as { X: number; Y: number; isClosed: boolean }[]
            }
        }

        const tempForceClosePath = (canBeClosed: boolean) => {
            if (!canBeClosed) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_INTERSECT'),
                })
            }
        }

        const tempClearCurrentArea = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DRAW_CLEAR_TIP'),
            }).then(() => {
                if (tempDetectionData.value.boundaryData.length == 0) return
                pageData.value.currRowData.points = []
                if (mode.value === 'h5') {
                    tempDrawer.clear()
                } else {
                    const sendXML = OCX_XML_SetOscAreaAction('NONE')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            // 设置视频区域可编辑
            // 界面内切换tab，调用play时初始化区域
            setTimeout(() => {
                setAreaView()
            }, 0)
            if (mode.value === 'h5') {
                tempDrawer.setEnable(true)
            } else {
                const sendXML = OCX_XML_SetVfdAreaAction('EDIT_ON')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        const getRealValueByRatio = (value: string) => {
            return (Number(value) / 10000).toFixed(2)
        }

        const getScaleValueByRatio = (value: string) => {
            return String(Number(value) * 10000)
        }

        // 获取温度检测数据
        const getTemperatureDetectionData = async () => {
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
            const result = await queryTemperatureAlarmConfig(sendXml)
            closeLoading()
            commLoadResponseHandler(result, async ($) => {
                let holdTimeArr = $('//content/chl/param/holdTimeNote').text().split(',')
                const holdTime = $('//content/chl/param/alarmHoldTime').text()
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
                const boundaryData = [] as AlarmTemperatureDetectionBoundryDto[]
                $('//content/chl/param/boundary/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const points = $item('point/item').map((ele) => {
                        const $ele = queryXml(ele.element)
                        return {
                            X: Number($ele('X').text()),
                            Y: Number($ele('Y').text()),
                            isClosed: true,
                        }
                    })
                    boundaryData.push({
                        id: $item('ruleId').text(),
                        ruleId: Number($item('ruleId').text()),
                        switch: $item('switch').text() == 'true',
                        ruleName: $item('ruleName').text(),
                        ruleType: $item('ruleType').text(),
                        emissivity: getRealValueByRatio($item('emissivity').text()),
                        emissivityDefault: getRealValueByRatio($item('emissivity').attr('default')),
                        distance: getRealValueByRatio($item('distance').text()),
                        distanceDefault: getRealValueByRatio($item('distance').attr('default')),
                        reflectTemper: getRealValueByRatio($item('reflectTemper').text()),
                        reflectTemperDefault: getRealValueByRatio($item('reflectTemper').attr('default')),
                        alarmRule: $item('alarmRule').text(),
                        alarmTemper: getRealValueByRatio($item('alarmTemper').text()),
                        alarmTemperDefault: getRealValueByRatio($item('alarmTemper').attr('default')),
                        maxCount: Number($item('point').attr('maxCount')),
                        points,
                    })
                })
                const trigger = $('//content/chl/trigger')
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
                const snap = $trigger('sysSnap/chls/item').map((item) => {
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
                tempDetectionData.value = {
                    enabledSwitch: $('//content/chl/param/switch').text() == 'true',
                    holdTime,
                    holdTimeList,
                    schedule: $('//content/chl').attr('scheduleGuid'),
                    triggerAudio: $('//content/chl/param/triggerAudio').text(),
                    triggerWhiteLight: $('//content/chl/param/triggerWhiteLight').text(),
                    record,
                    alarmOut,
                    snap,
                    preset,
                    trigger: ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch', 'popMsgSwitch'].filter((item) => {
                        return $trigger(item).text().toBoolean()
                    }),
                    sysAudio: $('sysAudio').attr('id'),
                    boundaryData,
                }

                if (prop.chlData.supportAudio && tempDetectionData.value.triggerAudio) {
                    pageData.value.triggerList.push('triggerAudio')
                    if (tempDetectionData.value.triggerAudio === 'true') {
                        tempDetectionData.value.trigger.push('triggerAudio')
                    }
                }

                if (prop.chlData.supportWhiteLight && tempDetectionData.value.triggerWhiteLight) {
                    pageData.value.triggerList.push('triggerWhiteLight')
                    if (tempDetectionData.value.triggerWhiteLight === 'true') {
                        tempDetectionData.value.trigger.push('triggerWhiteLight')
                    }
                }
            }).then(() => {
                pageData.value.initComplated = true
                handleTemperatureDetectionData()
            })
        }

        // 处理温度检测数据
        const handleTemperatureDetectionData = () => {
            // 报警规则选项列表与类型有关
            tempDetectionData.value.boundaryData.forEach((item, index) => {
                if (index == 0) {
                    // 初始化选中第一行并绘制图形
                    boundaryTableRef.value!.setCurrentRow(item)
                    pageData.value.currRowData = item
                }
                pageData.value.alarmRuleTypeList[index] = item.ruleType == 'point' ? alarmRuleTypeList2 : alarmRuleTypeList1
            })
            setPaintType()
            setAreaView()
        }

        // tab项（参数设置，联动方式）
        const tempTabChange = (name: TabPaneName) => {
            if (name == 'param') {
                play()
            }
        }

        // 切换行
        const boundaryRowClick = (row: AlarmTemperatureDetectionBoundryDto) => {
            pageData.value.currRowData = row
            // 切换另一个区域前先封闭其他可闭合的区域（“area”）
            setOtherAreaClosed()
            if (mode.value === 'h5') {
                tempDrawer.clear()
            } else {
                const sendXML = OCX_XML_SetOscAreaAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            setPaintType()
            setAreaView()
        }

        // 设置区域图形
        const setAreaView = () => {
            if (pageData.value.currRowData) {
                if (mode.value === 'h5') {
                    const isFoucusClosePath = pageData.value.currRowData.ruleType == 'area'
                    tempDrawer.setCurrAreaIndex(pageData.value.currRowData.ruleId, 'detectionArea')
                    tempDrawer.setPointList(pageData.value.currRowData.points, isFoucusClosePath)
                } else {
                    const sendXML = OCX_XML_SetOscArea(pageData.value.currRowData.points, false)
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }

            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        // 是否显示全部区域
        const showAllArea = () => {
            tempDrawer && tempDrawer.setEnableShowAll(pageData.value.isShowAllArea)
            if (pageData.value.isShowAllArea) {
                const detectAreaInfo = [] as { X: number; Y: number; isClosed: boolean }[][]
                tempDetectionData.value.boundaryData.forEach((item, index) => {
                    detectAreaInfo[index] = item.points
                })
                if (mode.value === 'h5') {
                    const index = pageData.value.currRowData.ruleId
                    tempDrawer.setCurrAreaIndex(index, 'detectionArea')
                    tempDrawer.drawAllPolygon(detectAreaInfo, {}, 'detectionArea', index, true)
                } else {
                    const pluginDetectAreaInfo = cloneDeep(detectAreaInfo)
                    pluginDetectAreaInfo[pageData.value.currRowData.ruleId] = [] // 插件端下发全部区域需要过滤掉当前区域数据
                    const sendXML = OCX_XML_SetAllArea({ detectAreaInfo: pluginDetectAreaInfo }, 'IrregularPolygon', 'TYPE_WATCH_DETECTION', '', true)
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML!)
                }
            } else {
                if (mode.value === 'h5') {
                    setAreaView()
                } else {
                    const sendXML = OCX_XML_SetAllArea({ detectAreaInfo: [] }, 'IrregularPolygon', 'TYPE_WATCH_DETECTION', '', false)
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML!)
                }
            }
        }

        // 清空
        const clearArea = () => {
            if (mode.value === 'h5') {
                tempDrawer.clear()
            } else {
                const sendXML = OCX_XML_SetOscAreaAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            if (tempDetectionData.value.boundaryData.length == 0) return
            pageData.value.currRowData.points = []
            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        // 全部清除
        const clearAllArea = () => {
            tempDetectionData.value.boundaryData.forEach((item) => {
                item.points = []
            })
            if (mode.value === 'h5') {
                tempDrawer.clear()
            } else {
                const sendXMLAll = OCX_XML_SetAllArea({ detectAreaInfo: [], maskAreaInfo: [] }, 'IrregularPolygon', 'TYPE_WATCH_DETECTION', '', pageData.value.isShowAllArea)
                plugin.GetVideoPlugin().ExecuteCmd(sendXMLAll!)
                const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        // 名称输入限制
        const ruleNameInput = (value: string, index: number) => {
            tempDetectionData.value.boundaryData[index].ruleName = cutStringByByte(value, 63)
        }

        // 回车键失去焦点
        const enterBlur = (event: { target: { blur: () => void } }) => {
            event.target.blur()
        }

        // 类型改变
        const ruleTypeChange = (value: string, row: AlarmTemperatureDetectionBoundryDto, index: number) => {
            pageData.value.alarmRuleTypeList[index] = value == 'point' ? alarmRuleTypeList2 : alarmRuleTypeList1
            pageData.value.currRowData = row
            boundaryTableRef.value!.setCurrentRow(row)
            row.alarmRule = 'avgtemperabove'
            setPaintType()
            clearArea()
        }

        // 发射率输入限制
        const emissivityInput = (value: string, index: number) => {
            let num = '' + value
            num = num
                .replace(/[^\d.]/g, '') // 清除“数字”和“.”以外的字符
                .replace(/\.{2,}/g, '.') // 只保留第一个. 清除多余的
                .replace('.', '$#$') //把字符"."替换成'$#$',把'.'转换成一个比较特殊的字符防止被下一个正则替换给替换掉，因为replace对于字符串只匹配一次,所以只会替换第一个'.'
                .replace(/\./g, '') //把其余的字符'.'替换为空字符串(删除)
                .replace('$#$', '.') //把字符'$#$'替换回原来的'.'
                .replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3') // 只能输入两个小数。^字符串开始;第一组匹配,匹配1个'-';重复匹配`-`0-n个,但不进入分组 (\d+)第二组匹配,匹配1-n个数字; \.随后匹配一个'.'; (\d\d)第三组匹配,一个两位的数字; .*$后面匹配任意字符0-n个,直到字符串结束. 替换的目标是:'(第一组匹配)(第二组匹配).(第三组匹配)' */

            let res = Number(num)
            if (num.indexOf('.') < 0 && num !== '') {
                // 如果没有小数点，首位不能为类似于00、 01、02的数字
                res = parseFloat(num)
            }

            if (res > 1) {
                // 数字默认为0.01
                res = 0.01
                pageData.value.errorMessage = Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(0.01, 1)
            }
            tempDetectionData.value.boundaryData[index].emissivity = value != '' ? String(res) : ''
        }

        const emissivityBlur = (row: AlarmTemperatureDetectionBoundryDto) => {
            const value = Number(row.emissivity)
            if (!value || value < 0.01 || value > 1) {
                // 数字默认为0.01
                row.emissivity = '0.01'
                pageData.value.errorMessage = Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(0.01, 1)
            }
        }

        // 距离
        const distanceInput = (value: string, index: number) => {
            if (!/^[0-9]+$/.test(value)) value = value.replace(/\D/g, '')
            if ((value[0] == '0' && value[1] > '0') || value == '00') value = value.slice(1)
            if (Number(value) > 10000) {
                value = cutStringByByte(value, 4)
                pageData.value.errorMessage = Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(0, 10000)
            }
            tempDetectionData.value.boundaryData[index].distance = value
        }

        const distanceBlur = (row: AlarmTemperatureDetectionBoundryDto) => {
            if (!row.distance) row.distance = '0'
            row.distance = parseFloat(row.distance).toFixed(2)
        }

        // 反射温度(℃)
        const reflectTemperInput = (value: string, index: number) => {
            if (!/^[0-9]+$/.test(value)) {
                value = value.replace(/[^-?\d+$.]/g, '')
            }

            if (value[0] == '-') {
                value = value
                    .replace(/\.{2,}/g, '.') // 只保留第一个- 清除多余的
                    .replace('-', '$#$') //把字符"-"替换成'$#$',把'-'转换成一个比较特殊的字符防止被下一个正则替换给替换掉，因为replace对于字符串只匹配一次,所以只会替换第一个'.'
                    .replace(/\-/g, '') //把其余的字符'-'替换为空字符串(删除)
                    .replace('$#$', '-') //把字符'$#$'替换回原来的'-'
                if (Number(value) < -30) {
                    value = value.slice(0, -1)
                    pageData.value.errorMessage = Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(-30, 60)
                }
            } else {
                value = value.replace(/\-/g, '') //把字符'-'替换为空字符串(删除)
                if (Number(value) > 60) {
                    value = value.slice(0, -1)
                    pageData.value.errorMessage = Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(-30, 60)
                }
            }
            tempDetectionData.value.boundaryData[index].reflectTemper = value
        }

        const reflectTemperBlur = (row: AlarmTemperatureDetectionBoundryDto) => {
            if (!row.reflectTemper) row.reflectTemper = '-30'
            row.reflectTemper = parseFloat(row.reflectTemper).toFixed(2)
        }

        // 报警温度(℃)
        const alarmTemperInput = (value: string, index: number) => {
            if (!/^[0-9]+$/.test(value)) {
                value = value.replace(/[^-?\d+$.]/g, '')
            }

            if (value[0] == '-') {
                value = value
                    .replace(/\.{2,}/g, '.') // 只保留第一个- 清除多余的
                    .replace('-', '$#$') //把字符"-"替换成'$#$',把'-'转换成一个比较特殊的字符防止被下一个正则替换给替换掉，因为replace对于字符串只匹配一次,所以只会替换第一个'.'
                    .replace(/\-/g, '') //把其余的字符'-'替换为空字符串(删除)
                    .replace('$#$', '-') //把字符'$#$'替换回原来的'-'
                if (Number(value) < -50) {
                    value = value.slice(0, -1)
                    pageData.value.errorMessage = Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(-50, 500)
                }
            } else {
                value = value.replace(/\-/g, '') //把字符'-'替换为空字符串(删除)
                if (Number(value) > 500) {
                    value = value.slice(0, -1)
                    pageData.value.errorMessage = Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(-50, 500)
                }
            }
            tempDetectionData.value.boundaryData[index].alarmTemper = value
        }

        const alarmTemperBlur = (row: AlarmTemperatureDetectionBoundryDto) => {
            if (!row.alarmTemper) row.alarmTemper = '-30'
            row.alarmTemper = parseFloat(row.alarmTemper).toFixed(2)
        }

        // 设置绘制类型
        const setPaintType = () => {
            const rowData = pageData.value.currRowData
            if (rowData.ruleType == 'line') {
                pageData.value.drawAreaTip = Translate('IDCS_DRAW_LINE_TIP')
            } else if (rowData.ruleType == 'area') {
                pointToValueMap.area = rowData.maxCount
                pageData.value.drawAreaTip = Translate('IDCS_DRAW_AREA_TIP').formatForLang(6)
            } else {
                pageData.value.drawAreaTip = ''
            }

            if (mode.value === 'h5') {
                tempDrawer.setPointCount(pointToValueMap[rowData.ruleType], 'temperatureDetect')
            } else {
                const sendXML = OCX_XML_SetOscAreaAction('EDIT_ON', pointToValueMap[rowData.ruleType])
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        // 闭合区域
        const setClosed = (points: { X: number; Y: number; isClosed: boolean }[]) => {
            points?.forEach((item) => {
                item.isClosed = true
            })
        }

        const setOtherAreaClosed = () => {
            if (mode.value == 'h5') {
                // 画点-区域
                if (tempDetectionData.value.boundaryData && tempDetectionData.value.boundaryData.length > 0) {
                    tempDetectionData.value.boundaryData.forEach((item) => {
                        if (item.ruleType == 'area' && item.points.length >= 3 && tempDrawer.judgeAreaCanBeClosed(item.points)) {
                            setClosed(item.points)
                        }
                    })
                }
            }
        }

        // 区域为多边形时，检测区域合法性(温度检测页面一个点为画点，两个点为画线，大于两个小于8个为区域，只需要检测区域的合法性)
        const verification = () => {
            const count = tempDetectionData.value.boundaryData.length
            for (const item of tempDetectionData.value.boundaryData) {
                if (count > 2 && !tempDrawer.judgeAreaCanBeClosed(item.points)) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_INTERSECT'),
                    })
                    return false
                }
            }
            return true
        }

        const getTempDetectionSaveData = () => {
            const sendXml = rawXml`
                <content>
                    <chl id='${prop.currChlId}' scheduleGuid='${tempDetectionData.value.schedule}'>
                        <param>
                            <switch>${tempDetectionData.value.enabledSwitch}</switch>
                            <alarmHoldTime>${tempDetectionData.value.holdTime}</alarmHoldTime>
                            ${ternary(tempDetectionData.value.triggerAudio && prop.chlData.supportAudio, `<triggerAudio>${tempDetectionData.value.trigger.includes('triggerAudio')}</triggerAudio>`)}
                            ${ternary(tempDetectionData.value.triggerWhiteLight && prop.chlData.supportWhiteLight, `<triggerWhiteLight>${tempDetectionData.value.trigger.includes('triggerWhiteLight')}</triggerWhiteLight>`)}
                            <boundary type='list' count='10' maxCount='10'>
                                ${tempDetectionData.value.boundaryData
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
                                                    ${item.points.map((ele) => `<item><X>${Number(ele.X).toFixed(0)}</X><Y>${Number(ele.Y).toFixed(0)}</Y></item>`).join('')}
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
                                    ${tempDetectionData.value.record.map((item) => `<item id='${item.value}'>${wrapCDATA(item.label)}</item>`).join('')}
                                </chls>
                            </sysRec>
                            <sysSnap>
                                <chls type='list'>
                                    ${tempDetectionData.value.snap.map((item) => `<item id='${item.value}'>${wrapCDATA(item.label)}</item>`).join('')}
                                </chls>
                            </sysSnap>
                            <alarmOut>
                                <alarmOuts type='list'>
                                    ${tempDetectionData.value.alarmOut.map((item) => `<item id='${item.value}'>${wrapCDATA(item.label)}</item>`).join('')}
                                </alarmOuts>
                            </alarmOut>
                            <preset>
                                <presets type='list'>
                                    ${tempDetectionData.value.preset
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
                            <snapSwitch>${tempDetectionData.value.trigger.includes('snapSwitch')}</snapSwitch>
                            <msgPushSwitch>${tempDetectionData.value.trigger.includes('msgPushSwitch')}</msgPushSwitch>
                            <buzzerSwitch>${tempDetectionData.value.trigger.includes('buzzerSwitch')}</buzzerSwitch>
                            <popVideoSwitch>${tempDetectionData.value.trigger.includes('popVideoSwitch')}</popVideoSwitch>
                            <emailSwitch>${tempDetectionData.value.trigger.includes('emailSwitch')}</emailSwitch>
                            <popMsgSwitch>${tempDetectionData.value.trigger.includes('popMsgSwitch')}</popMsgSwitch>
                            <sysAudio id='${tempDetectionData.value.sysAudio}'></sysAudio>
                        </trigger>
                    </chl>
                </content>
            `
            return sendXml
        }

        const applyTempDetectionData = async () => {
            if (!verification()) return
            const sendXml = getTempDetectionSaveData()
            openLoading()
            const result = await editTemperatureAlarmConfig(sendXml)
            closeLoading()
            const $ = queryXml(result)
            if ($('//status').text() == 'success') {
                // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面）
                setAreaView()
                pageData.value.applyDisabled = true
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
            } else {
                const errorCode = $('//errorCode').text()
                if (errorCode == '536871053') {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'),
                    })
                } else {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_SAVE_DATA_FAIL'),
                    })
                }
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        const LiveNotify2Js = ($: (path: string) => XmlResult) => {
            // 温度报警检测
            // const $xmlNote = $("statenotify[type='OscArea']")
            const $points = $("statenotify[@type='OscArea']/points")
            const errorCode = $("statenotify[@type='OscArea']/errorCode").text()
            // 绘制点线
            if ($points.length > 0) {
                const points = [] as { X: number; Y: number }[]
                $('/statenotify/points/item').forEach((item) => {
                    points.push({ X: Number(item.attr('X')), Y: Number(item.attr('Y')) })
                })
                pageData.value.currRowData.points = points as { X: number; Y: number; isClosed: boolean }[]
            }

            // 处理错误码
            if (errorCode == '517') {
                // 517-区域已闭合
                tempClearCurrentArea()
            } else if (errorCode == '515') {
                // 515-区域有相交直线，不可闭合
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_INTERSECT'),
                })
            }
        }
        onMounted(async () => {
            if (mode.value != 'h5') {
                Plugin.VideoPluginNotifyEmitter.addListener(LiveNotify2Js)
            }
            pageData.value.scheduleList = await buildScheduleList()
            await getTemperatureDetectionData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                Plugin.VideoPluginNotifyEmitter.removeListener(LiveNotify2Js)
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendMinXML = OCX_XML_SetOscAreaAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendMinXML)
                const sendXMLAll = OCX_XML_SetAllArea({ detectAreaInfo: [] }, 'IrregularPolygon', 'TYPE_WATCH_DETECTION', '', false)
                plugin.GetVideoPlugin().ExecuteCmd(sendXMLAll!)
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }

            if (mode.value == 'h5') {
                tempDrawer.destroy()
            }
        })

        watch(
            tempDetectionData,
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
            ScheduleManagPop,
            supportAlarmAudioConfig,
            tempDetectionData,
            playerRef,
            boundaryTableRef,
            // 规则类型
            ruleShapeTypeList,
            // 报警规则类型
            alarmRuleTypeList1,
            alarmRuleTypeList2,
            // 联动预置点
            // PresetTableData,
            pageData,
            // 播放器就绪
            handlePlayerReady,
            // tab项切换（参数设置，联动方式）
            tempTabChange,
            // 视频区域
            showAllArea,
            clearArea,
            clearAllArea,
            // 区域table切换行
            boundaryRowClick,
            // 名称输入限制
            ruleNameInput,
            // 回车键失去焦点
            enterBlur,
            // 类型（区域，线，点）
            ruleTypeChange,
            // 发射率
            emissivityInput,
            emissivityBlur,
            // 距离
            distanceInput,
            distanceBlur,
            // 反射温度(℃)
            reflectTemperInput,
            reflectTemperBlur,
            // 报警温度(℃)
            alarmTemperInput,
            alarmTemperBlur,
            // 提交温度检测数据
            applyTempDetectionData,
            AlarmBaseRecordSelector,
            AlarmBaseAlarmOutSelector,
            AlarmBaseTriggerSelector,
            AlarmBasePresetSelector,
            AlarmBaseSnapSelector,
        }
    },
})
