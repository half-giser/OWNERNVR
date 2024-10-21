/*
 * @Description: AI 事件——更多——温度检测
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-13 09:18:41
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-21 14:23:49
 */
import { cloneDeep } from 'lodash-es'
import { type BoundaryTableDataItem, type chlCaps, type PresetList, TempDetection } from '@/types/apiType/aiAndEvent'
import CanvasPolygon from '@/utils/canvas/canvasTemperature'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'
import { type TabPaneName, type CheckboxValueType } from 'element-plus'
import { type XmlResult } from '@/utils/xmlParse'

export default defineComponent({
    components: {
        ScheduleManagPop,
    },
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
        const { openLoading, closeLoading } = useLoading()
        const pluginStore = usePluginStore()
        const systemCaps = useCababilityStore()
        const osType = getSystemInfo().platform
        const Plugin = inject('Plugin') as PluginType

        // 系统配置
        const supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
        // 温度检测数据
        const tempDetectionData = ref(new TempDetection())

        // 播放器
        const playerRef = ref<PlayerInstance>()
        // 区域界限table
        const boundaryTableRef = ref()

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
            { value: 'maxtemperabove', label: Translate('IDCS_MAX_TEMPER_ABOVE') },
            { value: 'maxtemperbelow', label: Translate('IDCS_MAX_TEMPER_BELOW') },
            { value: 'mintemperabove', label: Translate('IDCS_MIN_TEMPER_ABOVE') },
            { value: 'mintemperbelow', label: Translate('IDCS_MIN_TEMPER_BELOW') },
            { value: 'avgtemperabove', label: Translate('IDCS_AVG_TEMPER_ABOVE') },
            { value: 'avgtemperbelow', label: Translate('IDCS_AVG_TEMPER_BELOW') },
            { value: 'difftemperabove', label: Translate('IDCS_DIFF_TEMPER_ABOVE') },
            { value: 'difftemperbelow', label: Translate('IDCS_DIFF_TEMPER_BELOW') },
        ]
        const alarmRuleTypeList2 = [
            { value: 'avgtemperabove', label: Translate('IDCS_AVG_TEMPER_ABOVE') },
            { value: 'avgtemperbelow', label: Translate('IDCS_AVG_TEMPER_BELOW') },
        ]

        // 常规联动
        const normalParamCheckAll = ref(false)
        const normalParamCheckList = ref([] as string[])
        // 常规联动多选数据项
        const normalParamList = ref([
            { value: 'msgPushSwitch', label: Translate('IDCS_PUSH') },
            { value: 'buzzerSwitch', label: Translate('IDCS_BUZZER') },
            { value: 'popVideoSwitch', label: Translate('IDCS_VIDEO_POPUP') },
            { value: 'emailSwitch', label: Translate('IDCS_EMAIL') },
            { value: 'popMsgSwitch', label: Translate('IDCS_MESSAGEBOX_POPUP') },
            // 在满足条件后添加到列表中
            // { value: 'triggerAudio', label: 'IPC_' + Translate('IDCS_AUDIO') },
            // { value: 'triggerWhiteLight', label: 'IPC_' + Translate('IDCS_LIGHT') },
        ])
        // 联动预置点
        const MAX_TRIGGER_PRESET_COUNT = 16
        const PresetTableData = ref<PresetList[]>([])

        // 页面数据
        const pageData = ref({
            tab: 'param',
            currRowData: {} as BoundaryTableDataItem,
            // 是否显示全部区域
            isShowAllArea: false,
            // 绘图区域下提示信息
            drawAreaTip: '',
            // 排程
            scheduleIdNull: '{00000000-0000-0000-0000-000000000000}',
            scheduleList: [] as SelectOption<string, string>[],
            scheduleManagPopOpen: false,
            alarmRuleTypeList: [] as SelectOption<string, string>[][],
            // 声音列表
            voiceList: prop.voiceList,
            // record穿梭框数据源
            recordList: [] as { value: string; label: string }[],
            recordIsShow: false,
            // alarmOut穿梭框数据源
            alarmOutList: [] as { value: string; label: string }[],
            alarmOutIsShow: false,
            // snap穿梭框数据源
            snapList: [] as { value: string; label: string }[],
            snapIsShow: false,
            // 初始化，后判断应用是否可用
            initComplated: false,
            applyDisabled: true,
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
            }).then((result) => {
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
        // 获取抓图数据
        const getSnapList = async () => {
            getChlList({
                nodeType: 'chls',
                isSupportSnap: true,
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    $('content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        pageData.value.snapList.push({
                            value: item.attr('id')!,
                            label: $item('name').text(),
                        })
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
        // 车牌侦测绘制的Canvas
        let tempDrawer: CanvasPolygon
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
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_INTERSECT'),
                })
            }
        }
        const tempClearCurrentArea = () => {
            openMessageTipBox({
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
                let holdTimeArr = $('/response/content/chl/param/holdTimeNote').text().split(',')
                const holdTime = $('/response/content/chl/param/alarmHoldTime').text()
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
                const boundaryData = [] as BoundaryTableDataItem[]
                $('/response/content/chl/param/boundary/item').forEach((item) => {
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
                    enabledSwitch: $('/response/content/chl/param/switch').text() == 'true',
                    holdTime,
                    holdTimeList,
                    schedule: $('/response/content/chl').attr('scheduleGuid'),
                    triggerAudio: $('/response/content/chl/param/triggerAudio').text(),
                    triggerWhiteLight: $('/response/content/chl/param/triggerWhiteLight').text(),
                    record,
                    alarmOut,
                    snap,
                    preset,
                    msgPushSwitch: $trigger('msgPushSwitch').text() == 'true',
                    buzzerSwitch: $trigger('buzzerSwitch').text() == 'true',
                    popVideoSwitch: $trigger('popVideoSwitch').text() == 'true',
                    emailSwitch: $trigger('emailSwitch').text() == 'true',
                    popMsgSwitch: $trigger('popMsgSwitch').text() == 'true',
                    catchSnapSwitch: $trigger('snapSwitch').text() == 'true',
                    sysAudio: $('sysAudio').attr('id'),
                    boundaryData,
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
                    boundaryTableRef.value.setCurrentRow(item, true)
                    pageData.value.currRowData = item
                }
                pageData.value.alarmRuleTypeList[index] = item.ruleType == 'point' ? alarmRuleTypeList2 : alarmRuleTypeList1
            })
            // 常规联动相关选项
            if (tempDetectionData.value.triggerAudio && prop.chlData.supportAudio && normalParamList.value.findIndex((item) => item.value == 'triggerAudio') == -1) {
                normalParamList.value.push({ value: 'triggerAudio', label: 'IPC_' + Translate('IDCS_AUDIO') })
                if (tempDetectionData.value.triggerAudio == 'true') normalParamCheckList.value.push('triggerAudio')
            }
            if (tempDetectionData.value.triggerWhiteLight && prop.chlData.supportWhiteLight && normalParamList.value.findIndex((item) => item.value == 'triggerWhiteLight') == -1) {
                normalParamList.value.push({ value: 'triggerWhiteLight', label: 'IPC_' + Translate('IDCS_LIGHT') })
                if (tempDetectionData.value.triggerWhiteLight == 'true') normalParamCheckList.value.push('triggerWhiteLight')
            }
            // 在数据中有此项，在原页面中没有对于组件
            // if (tempDetectionData.value.catchSnapSwitch) normalParamCheckList.value.push('catchSnapSwitch')
            if (tempDetectionData.value.msgPushSwitch) normalParamCheckList.value.push('msgPushSwitch')
            if (tempDetectionData.value.buzzerSwitch) normalParamCheckList.value.push('buzzerSwitch')
            if (tempDetectionData.value.popVideoSwitch) normalParamCheckList.value.push('popVideoSwitch')
            if (tempDetectionData.value.emailSwitch) normalParamCheckList.value.push('emailSwitch')
            if (tempDetectionData.value.popMsgSwitch) normalParamCheckList.value.push('popMsgSwitch')
            if (normalParamCheckList.value.length == normalParamList.value.length) {
                normalParamCheckAll.value = true
            }
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
        const boundaryRowClick = (row: BoundaryTableDataItem) => {
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
                    const pluginDetectAreaInfo = JSON.parse(JSON.stringify(detectAreaInfo))
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
        const ruleTypeChange = (value: string, row: BoundaryTableDataItem, index: number) => {
            pageData.value.alarmRuleTypeList[index] = value == 'point' ? alarmRuleTypeList2 : alarmRuleTypeList1
            pageData.value.currRowData = row
            boundaryTableRef.value.setCurrentRow(row, true)
            row.alarmRule = 'avgtemperabove'
            setPaintType()
            clearArea()
        }
        // 发射率输入限制
        const emissivityInput = (value: string, index: number) => {
            let num = '' + value
            console.log(value)
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
                ElMessage({
                    message: Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(0.01, 1),
                    type: 'error',
                    customClass: 'errorMsg',
                    duration: 2000,
                })
            }
            tempDetectionData.value.boundaryData[index].emissivity = value != '' ? String(res) : ''
        }
        const emissivityBlur = (row: BoundaryTableDataItem) => {
            const value = Number(row.emissivity)
            if (!value || value < 0.01 || value > 1) {
                // 数字默认为0.01
                row.emissivity = '0.01'
                ElMessage({
                    message: Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(0.01, 1),
                    type: 'error',
                    customClass: 'errorMsg',
                    duration: 2000,
                })
            }
        }
        // 距离
        const distanceInput = (value: string, index: number) => {
            if (!/^[0-9]+$/.test(value)) value = value.replace(/\D/g, '')
            if ((value[0] == '0' && value[1] > '0') || value == '00') value = value.slice(1)
            if (Number(value) > 10000) {
                value = cutStringByByte(value, 4)
                ElMessage({
                    message: Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(0, 10000),
                    type: 'error',
                    customClass: 'errorMsg',
                    duration: 2000,
                })
            }
            tempDetectionData.value.boundaryData[index].distance = value
        }
        const distanceBlur = (row: BoundaryTableDataItem) => {
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
                    ElMessage({
                        message: Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(-30, 60),
                        type: 'error',
                        customClass: 'errorMsg',
                        duration: 2000,
                    })
                }
            } else {
                value = value.replace(/\-/g, '') //把字符'-'替换为空字符串(删除)
                if (Number(value) > 60) {
                    value = value.slice(0, -1)
                    ElMessage({
                        message: Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(-30, 60),
                        type: 'error',
                        customClass: 'errorMsg',
                        duration: 2000,
                    })
                }
            }
            tempDetectionData.value.boundaryData[index].reflectTemper = value
        }
        const reflectTemperBlur = (row: BoundaryTableDataItem) => {
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
                    ElMessage({
                        message: Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(-50, 500),
                        type: 'error',
                        customClass: 'errorMsg',
                        duration: 2000,
                    })
                }
            } else {
                value = value.replace(/\-/g, '') //把字符'-'替换为空字符串(删除)
                if (Number(value) > 500) {
                    value = value.slice(0, -1)
                    ElMessage({
                        message: Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(-50, 500),
                        type: 'error',
                        customClass: 'errorMsg',
                        duration: 2000,
                    })
                }
            }
            tempDetectionData.value.boundaryData[index].alarmTemper = value
        }
        const alarmTemperBlur = (row: BoundaryTableDataItem) => {
            if (!row.alarmTemper) row.alarmTemper = '-30'
            row.alarmTemper = parseFloat(row.alarmTemper).toFixed(2)
        }
        // 设置绘制类型
        const setPaintType = () => {
            const rowData = pageData.value.currRowData
            if (rowData.ruleType == 'line') {
                pageData.value.drawAreaTip = Translate('IDCS_DRAW_LINE_TIP')
            } else if (rowData.ruleType == 'area') {
                pointToValueMap['area'] = rowData['maxCount']
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

        // 常规联动多选
        const handleNormalParamCheckAll = (value: CheckboxValueType) => {
            normalParamCheckList.value = value ? normalParamList.value.map((item) => item.value) : []
            if (value) {
                tempDetectionData.value.msgPushSwitch = true
                tempDetectionData.value.buzzerSwitch = true
                tempDetectionData.value.popVideoSwitch = true
                tempDetectionData.value.emailSwitch = true
                tempDetectionData.value.popMsgSwitch = true
                normalParamList.value.forEach((item) => {
                    if (item.value == 'triggerAudio') {
                        tempDetectionData.value.triggerAudio = 'true'
                    } else if (item.value == 'triggerWhiteLight') {
                        tempDetectionData.value.triggerWhiteLight = 'true'
                    }
                })
            }
        }
        const handleNormalParamCheck = (value: CheckboxValueType[]) => {
            normalParamCheckAll.value = value.length === normalParamList.value.length
            tempDetectionData.value.msgPushSwitch = value.includes('msgPushSwitch')
            tempDetectionData.value.buzzerSwitch = value.includes('buzzerSwitch')
            tempDetectionData.value.popVideoSwitch = value.includes('popVideoSwitch')
            tempDetectionData.value.emailSwitch = value.includes('emailSwitch')
            tempDetectionData.value.popMsgSwitch = value.includes('popMsgSwitch')
            normalParamList.value.forEach((item) => {
                if (item.value == 'triggerAudio') {
                    tempDetectionData.value.triggerAudio = value.includes('triggerAudio') ? 'true' : 'false'
                } else if (item.value == 'triggerWhiteLight') {
                    tempDetectionData.value.triggerWhiteLight = value.includes('triggerWhiteLight') ? 'true' : 'false'
                }
            })
        }

        // 录像配置相关处理
        const recordConfirm = (e: { value: string; label: string }[]) => {
            tempDetectionData.value.record = cloneDeep(e)
            pageData.value.recordIsShow = false
        }
        const recordClose = () => {
            pageData.value.recordIsShow = false
        }
        // 报警输出相关处理
        const alarmOutConfirm = (e: { value: string; label: string }[]) => {
            tempDetectionData.value.alarmOut = cloneDeep(e)
            pageData.value.alarmOutIsShow = false
        }
        const alarmOutClose = () => {
            pageData.value.alarmOutIsShow = false
        }
        // 抓图配置相关处理
        const snapConfirm = (e: { value: string; label: string }[]) => {
            tempDetectionData.value.snap = cloneDeep(e)
            pageData.value.snapIsShow = false
        }
        const snapClose = () => {
            pageData.value.snapIsShow = false
        }
        // 获取联动预置点数据
        const getPresetData = async () => {
            const result = await getChlList({
                isSupportPtz: true,
            })
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
                        isGetPresetList: false,
                    }
                })
                rowData.forEach((row) => {
                    tempDetectionData.value.preset?.forEach((item) => {
                        if (row.id == item.chl.value) {
                            row.preset = { value: item.index, label: item.name }
                            row.presetList.push({ value: item.index, label: item.name })
                        }
                    })
                })
                for (let i = rowData.length - 1; i >= 0; i--) {
                    //预置点里过滤掉recorder通道
                    if (rowData[i].chlType == 'recorder') {
                        rowData.splice(i, 1)
                    }
                }
                PresetTableData.value = rowData
            })
        }
        // 预置点选择框下拉时获取预置点列表数据
        const getPresetById = async (row: PresetList) => {
            if (!row.isGetPresetList) {
                row.presetList.splice(1)
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
                row.isGetPresetList = true
            }
        }
        const presetChange = (row: PresetList) => {
            const ids = tempDetectionData.value.preset.map((item) => item.chl.value)
            if (ids.includes(row.id)) {
                tempDetectionData.value.preset = tempDetectionData.value.preset.filter((item) => row.id != item.chl.value)
            }
            if (row.preset.value !== '') {
                tempDetectionData.value.preset.push({
                    index: row.preset.value,
                    name: row.preset.label,
                    chl: {
                        value: row.id,
                        label: row.name,
                    },
                })
            }
            if (tempDetectionData.value.preset.length > MAX_TRIGGER_PRESET_COUNT) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_PRESET_LIMIT'),
                })
                row.preset.value = ''
                tempDetectionData.value.preset = tempDetectionData.value.preset.filter((item) => row.id != item.chl.value)
            }
        }
        // 区域为多边形时，检测区域合法性(温度检测页面一个点为画点，两个点为画线，大于两个小于8个为区域，只需要检测区域的合法性)
        const verification = () => {
            const count = tempDetectionData.value.boundaryData.length
            for (const item of tempDetectionData.value.boundaryData) {
                if (count > 2 && !judgeAreaCanBeClosed(item.points)) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_INTERSECT'),
                    })
                    return false
                }
            }
            return true
        }
        const getTempDetectionSaveData = () => {
            let sendXml = rawXml`<content>
                <chl id='${prop.currChlId}' scheduleGuid='${tempDetectionData.value.schedule}'>
                <param>
                <switch>${String(tempDetectionData.value.enabledSwitch)}</switch>
                <alarmHoldTime>${tempDetectionData.value.holdTime}</alarmHoldTime>
            `
            if (tempDetectionData.value.triggerAudio && prop.chlData.supportAudio) {
                sendXml += `<triggerAudio>${tempDetectionData.value.triggerAudio}</triggerAudio>`
            }
            if (tempDetectionData.value.triggerWhiteLight && prop.chlData.supportWhiteLight) {
                sendXml += `<triggerWhiteLight>${tempDetectionData.value.triggerWhiteLight}</triggerWhiteLight>`
            }
            sendXml += `<boundary type='list' count='10' maxCount='10'>`
            tempDetectionData.value.boundaryData.forEach((item) => {
                sendXml += rawXml`<item>
                    <switch>${String(item.switch)}</switch>
                    <ruleId>${String(item.ruleId)}</ruleId>
                    <ruleName>${item.ruleName}</ruleName>
                    <ruleType>${item.ruleType}</ruleType>
                    <emissivity min='0' max='10000' default='9600'>${getScaleValueByRatio(item.emissivity)}</emissivity>
                    <distance min='0' max='1000000' default='50000'>${getScaleValueByRatio(item.distance)}</distance>
                    <reflectTemper min='4294667296' max='600000' default='250000'>${getScaleValueByRatio(item.reflectTemper)}</reflectTemper>
                    <alarmRule>${item.alarmRule}</alarmRule>
                    <alarmTemper min='4294667296' max='600000' default='250000'>${getScaleValueByRatio(item.alarmTemper)}</alarmTemper>
                    <point type='list' count='${String(item.points.length)}' maxCount='${String(item.maxCount)}'>
                `
                item.points.forEach((ele) => {
                    sendXml += `<item><X>${Number(ele.X).toFixed(0)}</X><Y>${Number(ele.Y).toFixed(0)}</Y></item>`
                })
                sendXml += `</point></item>`
            })
            sendXml += rawXml`</boundary></param>
                <trigger>
                    <sysRec>
                    <chls type='list'>
            `
            tempDetectionData.value.record.forEach((item) => {
                sendXml += rawXml`<item id='${item.value}'>
                        <![CDATA[${item.label}]]></item>`
            })
            sendXml += rawXml`</chls></sysRec>
                <sysSnap>
                <chls type='list'>
            `
            tempDetectionData.value.snap.forEach((item) => {
                sendXml += rawXml`<item id='${item.value}'>
                        <![CDATA[${item.label}]]></item>`
            })
            sendXml += rawXml`</chls></sysSnap>
                <alarmOut>
                <alarmOuts type='list'>
            `
            tempDetectionData.value.alarmOut.forEach((item) => {
                sendXml += rawXml`<item id='${item.value}'>
                        <![CDATA[${item.label}]]></item>`
            })
            sendXml += rawXml`</alarmOuts>
                </alarmOut>
                <preset>
                <presets type='list'>
            `
            tempDetectionData.value.preset.forEach((item) => {
                sendXml += rawXml`<item>
                    <index>${item.index}</index>
                        <name><![CDATA[${item.name}]]></name>
                        <chl id='${item.chl.value}'><![CDATA[${item.chl.label}]]></chl>
                        </item>`
            })
            sendXml += rawXml`</presets>
                </preset>
                <snapSwitch>${String(tempDetectionData.value.catchSnapSwitch)}</snapSwitch>
                <msgPushSwitch>${String(tempDetectionData.value.msgPushSwitch)}</msgPushSwitch>
                <buzzerSwitch>${String(tempDetectionData.value.buzzerSwitch)}</buzzerSwitch>
                <popVideoSwitch>${String(tempDetectionData.value.popVideoSwitch)}</popVideoSwitch>
                <emailSwitch>${String(tempDetectionData.value.emailSwitch)}</emailSwitch>
                <popMsgSwitch>${String(tempDetectionData.value.popMsgSwitch)}</popMsgSwitch>
                <sysAudio id='${tempDetectionData.value.sysAudio}'></sysAudio>
                </trigger>
                </chl></content>`
            return sendXml
        }
        const applyTempDetectionData = async () => {
            if (!verification()) return
            const sendXml = getTempDetectionSaveData()
            openLoading()
            const result = await editTemperatureAlarmConfig(sendXml)
            closeLoading()
            const $ = queryXml(result)
            if ($('/response/status').text() == 'success') {
                // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面）
                setAreaView()
                pageData.value.applyDisabled = true
                openMessageTipBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
            } else {
                const errorCode = $('/response/errorCode').text()
                if (errorCode == '536871053') {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'),
                    })
                } else {
                    openMessageTipBox({
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
                openMessageTipBox({
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
            pageData.value.scheduleList.forEach((item) => {
                item.value = item.value != '' ? item.value : pageData.value.scheduleIdNull
            })
            await getRecordList()
            await getAlarmOutData()
            await getSnapList()
            await getTemperatureDetectionData()
            await getPresetData()
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
            // 联动方式
            handleNormalParamCheckAll,
            handleNormalParamCheck,
            recordConfirm,
            recordClose,
            alarmOutConfirm,
            alarmOutClose,
            snapConfirm,
            snapClose,
            presetChange,
            getPresetById,
            // 提交温度检测数据
            applyTempDetectionData,
        }
    },
})
