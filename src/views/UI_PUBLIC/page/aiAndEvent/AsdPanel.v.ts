/*
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-14 10:43:17
 * @Description: 声音异常
 */
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import * as echarts from 'echarts'
import { isNotSupportWebsocket } from '@/utils/tools'

export default defineComponent({
    components: {
        AlarmBaseRecordSelector,
        AlarmBaseAlarmOutSelector,
        AlarmBaseTriggerSelector,
        AlarmBasePresetSelector,
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

        const pageData = ref({
            // 是否支持声音设置
            supportAlarmAudioConfig: true,
            // 请求数据失败显示提示
            reqFail: false,
            // 排程管理
            isSchedulePop: false,
            scheduleList: [] as SelectOption<string, string>[],
            // 选择的功能:param,trigger
            tab: 'param',
            // 是否启用侦测
            detectionEnable: false,
            // 用于对比
            originalEnable: false,
            // 排程
            schedule: '',
            count: 0,
            xCount: 0,
            myChart: null,
            audioQueueMaxLen: 100,
            audioStandardData: [],
            audioBackGroundData: [],
            colors: ['red', 'blue', 'green'],
        })

        const asdChartRef = ref(null)
        const formData = ref(new AlarmAsdDto())
        const watchEdit = useWatchEditData(formData)
        let websocket: ReturnType<typeof WebsocketSnap> | null = null

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
         * @description 订阅声音异常强度值
         */
        const getSoundData = () => {
            if (isNotSupportWebsocket()) return
            websocket = WebsocketSnap({
                config: [{ channel_id: props.currChlId, audio_exception: { info: true } }],
                onsuccess(soundDataArr) {
                    handleSoundData(soundDataArr)
                },
            })
        }

        /**
         * @description 处理推送的声音异常强度数据
         */
        const handleSoundData = (soundDataArr: WebsocketSnapOnSuccessParam[]) => {
            if (pageData.value.audioStandardData.length > pageData.value.audioQueueMaxLen) {
                pageData.value.audioStandardData.shift()
                pageData.value.audioBackGroundData.shift()
            }
            soundDataArr.forEach((item: {}) => {
                pageData.value.xCount++
                pageData.value.audioStandardData.push([pageData.value.xCount, item.soundLevel])
                pageData.value.audioBackGroundData.push([pageData.value.xCount, item.backgroundLevel])
            })
            renderChart()
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
            const res = await queryAsd(sendXML)
            closeLoading()
            const $ = queryXml(res)

            if ($('status').text() === 'success') {
                const param = $('content/chl/param')
                if (!param.length) {
                    return
                }
                const $param = queryXml(param[0].element)
                const $trigger = queryXml($('content/chl/trigger')[0].element)

                pageData.value.schedule = getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid'))
                formData.value = {
                    mutexList: $param('mutexList/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    }),
                    detectionEnable: $param('switch').text().bool(),
                    originalEnable: $param('switch').text().bool(),
                    holdTime: $param('alarmHoldTime').text().num(),
                    holdTimeEnable: $param('alarmHoldTime').length > 0,
                    holdTimeList: getAlarmHoldTimeList($param('holdTimeNote').text(), $param('alarmHoldTime').text().num()),
                    enabledArea: $param('objectFilter').length > 0,
                    sdRiseSwitch: $param('objectFilter/soundRise/switch').text().bool(),
                    sdRiseSwitchEnable: $param('objectFilter/soundRise/switch').length > 0,
                    sdRiseSensitivity: {
                        value: $param('objectFilter/soundRise/sensitivity').text().num(),
                        min: $param('objectFilter/soundRise/sensitivity').attr('min').num(),
                        max: $param('objectFilter/soundRise/sensitivity').attr('max').num(),
                        default: $param('objectFilter/soundRise/sensitivity').attr('default').num(),
                    },
                    sdRiseThreshold: {
                        value: $param('objectFilter/soundRise/soundThreshold').text().num(),
                        min: $param('objectFilter/soundRise/soundThreshold').attr('min').num(),
                        max: $param('objectFilter/soundRise/soundThreshold').attr('max').num(),
                        default: $param('objectFilter/soundRise/soundThreshold').attr('default').num(),
                    },
                    sdReduceSwitch: $param('objectFilter/soundReduce/switch').text().bool(),
                    sdReduceSwitchEnable: $param('objectFilter/soundReduce/switch').length > 0,
                    sdReduceSensitivity: {
                        value: $param('objectFilter/soundReduce/sensitivity').text().num(),
                        min: $param('objectFilter/soundReduce/sensitivity').attr('min').num(),
                        max: $param('objectFilter/soundReduce/sensitivity').attr('max').num(),
                        default: $param('objectFilter/soundReduce/sensitivity').attr('default').num(),
                    },
                    sysAudio: $trigger('sysAudio').attr('id'),
                    audioSuport: $param('triggerAudio').text() !== '',
                    lightSuport: $param('triggerWhiteLight').text() !== '',
                    recordSwitch: $trigger('sysRec/switch').text().bool(),
                    recordChls: $trigger('sysRec/chls/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    }),
                    alarmOutSwitch: $trigger('alarmOut/switch').text().bool(),
                    alarmOutChls: $trigger('alarmOut/alarmOuts/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    }),
                    presetSwitch: $trigger('preset/switch').text().bool(),
                    presets: $trigger('preset/presets/item').map((item) => {
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
                    triggerList: ['snapSwitch', 'msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch'],
                }

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

        /**
         * @description 保存配置
         */
        const saveData = async () => {
            const data = formData.value
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}" scheduleGuid="${pageData.value.schedule}">
                        <param>
                            <switch>${data.detectionEnable}</switch>
                            ${data.holdTimeEnable ? `<alarmHoldTime>${data.holdTime}</alarmHoldTime>` : ''}
                            <objectFilter>
                                <soundRise>
                                    <switch>${data.sdRiseSwitch}</switch>
                                    <sensitivity>${data.sdRiseSensitivity.value}</sensitivity>
                                    <soundThreshold>${data.sdRiseThreshold.value}</soundThreshold>
                                </soundRise>
                                <soundReduce>
                                    <switch>${data.sdReduceSwitch}</switch>
                                    <sensitivity>${data.sdReduceSensitivity.value}</sensitivity>
                                </soundReduce>
                            </objectFilter>
                            ${data.audioSuport && props.chlData.supportAudio ? `<triggerAudio>${data.trigger.includes('triggerAudio')}</triggerAudio>` : ''}
                            ${data.lightSuport && props.chlData.supportWhiteLight ? `<triggerWhiteLight>${data.trigger.includes('triggerWhiteLight')}</triggerWhiteLight>` : ''}
                        </param>
                        <trigger>
                            <sysRec>
                                <chls type="list">
                                    ${data.recordChls.map((element: { value: any; label: string }) => `<item id="${element.value}">${wrapCDATA(element.label)}</item>`).join('')}
                                </chls>
                            </sysRec>
                            <alarmOut>
                                <alarmOuts type="list">
                                    ${data.alarmOutChls.map((element: { value: any; label: string }) => `<item id="${element.value}">${wrapCDATA(element.label)}</item>`).join('')}
                                </alarmOuts>
                            </alarmOut>
                            <preset>
                                <presets type="list">
                                    ${data.presets
                                        .map((item: { index: string | number | boolean; name: string; chl: { value: string | number | boolean; label: string } }) => {
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
                            <snapSwitch>${data.trigger.includes('snapSwitch')}</snapSwitch>
                            <msgPushSwitch>${data.trigger.includes('msgPushSwitch')}</msgPushSwitch>
                            <buzzerSwitch>${data.trigger.includes('buzzerSwitch')}</buzzerSwitch>
                            <popVideoSwitch>${data.trigger.includes('popVideoSwitch')}</popVideoSwitch>
                            <emailSwitch>${data.trigger.includes('emailSwitch')}</emailSwitch>
                            <sysAudio id='${data.sysAudio}'></sysAudio>
                        </trigger>
                    </chl>
                </content>
            `
            openLoading()
            const result = await editAsd(sendXml)
            const $ = queryXml(result)
            closeLoading()
            if ($('status').text() === 'success') {
                if (formData.value.detectionEnable) {
                    formData.value.originalEnable = true
                }
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
            const data = formData.value
            checkMutexChl({
                isChange: data.detectionEnable && data.detectionEnable !== data.originalEnable,
                mutexList: data.mutexList,
                chlName: props.chlData.name,
                chlIp: props.chlData.ip,
                chlList: props.onlineChannelList,
                tips: 'IDCS_AUDIO_EXCEPTION_DETECTION',
                isShowCommonMsg: true,
            }).then(() => {
                saveData()
            })
        }

        /**
         * @description 初始化数据
         */
        const initPageData = async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            await getData()
            getSoundData()
        }

        // 初始化声音强度空数据
        const initChartsData = () => {
            pageData.value.audioStandardData = []
            pageData.value.audioBackGroundData = []
            for (let i = 0; i < 99; i++) {
                pageData.value.xCount++
                const tempItem = [i + 1, null]
                pageData.value.audioStandardData.push(tempItem)
                pageData.value.audioBackGroundData.push(tempItem)
            }
            pageData.value.myChart = echarts.init(asdChartRef.value)
            renderChart()
            // if (isNotSupportWebsocket) {
            //     $('#asd_paramwrap .legend').hide()
            //     $('#divAsdEchartArea').html('')
            //     $('#divAsdEchartArea').css('backgroundColor', '#686e7a')
            //     RollMsg.clear()
            //     RollMsg.Append(CommonFunctions.FormatHttpsTips(LangCtrl._L_('IDCS_REALTIME_VOLUMN')))
            // }
        }

        // 声音强度图表渲染
        const renderChart = () => {
            const controlValue = formData.value.sdRiseThreshold.value || 50
            const controlValueList = pageData.value.audioStandardData.map(function (item) {
                return [item[0], controlValue]
            })
            const option = {
                title: {
                    left: 0,
                    top: '5px',
                    text: Translate('IDCS_REALTIME_VOLUMN'),
                    textStyle: {
                        color: '#ddd',
                        fontSize: 15,
                        fontWeight: 'bold',
                    },
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params: string | any[]) {
                        let res = ''
                        for (let i = 0; i < params.length; i++) {
                            if (i === 0) {
                                const tempIndex = params[i].name < 100 ? '' : params[i].name - 99
                                res += tempIndex + '<br />'
                            }
                            const seriesValue = !params[i].value[1] ? '-' : params[i].value[1]
                            res += '<span class="circle ' + pageData.value.colors[i] + '"></span>' + seriesValue + '<br />'
                        }
                        return res
                    },
                },
                grid: [
                    {
                        top: '15%',
                        left: '7%',
                        right: '5%',
                        bottom: '6%',
                    },
                ],
                xAxis: {
                    type: 'category',
                    axisLabel: {
                        show: false,
                        inside: false,
                    },
                    splitLine: false,
                    boundaryGap: false,
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#000',
                        },
                    },
                },
                yAxis: {
                    show: true,
                    min: 0,
                    max: 100,
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#000',
                        },
                    },
                    axisTick: {
                        show: true,
                    },
                    splitLine: false,
                },
                series: [
                    {
                        data: pageData.value.audioStandardData,
                        type: 'line',
                        name: Translate('IDCS_SOUND_INTENSITY'),
                        showSymbol: false,
                        itemStyle: {
                            color: '#c23531',
                        },
                        lineStyle: {
                            width: 1.5,
                        },
                    },
                    {
                        data: pageData.value.audioBackGroundData,
                        type: 'line',
                        name: Translate('IDCS_BACK_GROUND_SOUND_INTENSITY'),
                        showSymbol: false,
                        itemStyle: {
                            color: '#00f',
                        },
                        lineStyle: {
                            width: 1.5,
                        },
                    },
                    {
                        data: controlValueList,
                        type: 'line',
                        name: Translate('IDCS_SOUND_RISE_THRESHOLD'),
                        showSymbol: false,
                        itemStyle: {
                            color: '#61a0a8',
                        },
                        lineStyle: {
                            width: 2,
                        },
                    },
                ],
                backgroundColor: '#686e7a',
            }
            pageData.value.myChart?.setOption(option)
        }

        onMounted(async () => {
            await getScheduleList()
            initPageData()
            initChartsData()
        })

        onBeforeUnmount(() => {
            websocket && websocket.destroy()
        })

        return {
            pageData,
            formData,
            watchEdit,
            asdChartRef,
            closeSchedulePop,
            applyData,
        }
    },
})
