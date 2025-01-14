/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-11 15:00:19
 * @Description: 过线检测
 */
import { type AlarmChlDto, type AlarmOnlineChlDto, AlarmPassLinesEmailDto, AlarmPassLinesDto } from '@/types/apiType/aiAndEvent'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import CanvasPassline from '@/utils/canvas/canvasPassline'
import CanvasCpc from '@/utils/canvas/canvasCpc'
import { type CanvasBaseArea } from '@/utils/canvas/canvasBase'
import PassLineEmailPop from './PassLineEmailPop.vue'
import { cloneDeep } from 'lodash-es'
import { type XMLQuery } from '@/utils/xmlParse'
export default defineComponent({
    components: {
        ScheduleManagPop,
        PassLineEmailPop,
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
        type CanvasPasslineDirection = 'none' | 'rightortop' | 'leftorbotton'
        const { openLoading, closeLoading } = useLoading()
        const openMessageBox = useMessageBox().openMessageBox
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const playerRef = ref<PlayerInstance>()
        let passLineDrawer: ReturnType<typeof CanvasPassline>
        let cpcDrawer: ReturnType<typeof CanvasCpc>

        const directionTypeTip: Record<string, string> = {
            none: 'A<->B',
            rightortop: 'A->B',
            leftorbotton: 'A<-B',
        }

        const peopleCount: Record<string, string> = {
            all: Translate('IDCS_TIME_ALL'),
            daily: Translate('IDCS_TIME_DAY'),
            weekly: Translate('IDCS_TIME_WEEK'),
            monthly: Translate('IDCS_TIME_MOUNTH'),
        }

        const countCycleTypeTip: Record<string, string> = {
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
            // 选择的功能:param、target
            tab: 'param',
            // 排程管理
            isSchedulePop: false,
            scheduleList: [] as SelectOption<string, string>[],
            // passLine播放器设置
            // 是否显示全部区域绑定值
            isShowAllArea: false,
            // 控制显示展示全部区域的checkbox
            showAllAreaVisible: false,
            // 控制显示清除全部区域按钮 >=2才显示
            clearAllVisible: false,
            // 方向
            direction: '' as CanvasPasslineDirection,
            // 方向列表
            directionList: [] as SelectOption<string, string>[],
            // CPC播放器设置
            // 是否显示CPC绘制控制 老代码写死不显示，并且不可画图
            showCpcDrawAvailable: false,
            // CPC绘制控制
            isCpcDrawAvailable: false,
            emailData: new AlarmPassLinesEmailDto(),
            sendEmailData: {
                type: 0,
                enableSwitch: false,
                dailyReportSwitch: false,
                weeklyReportSwitch: false,
                weeklyReportDate: 0,
                mouthlyReportSwitch: false,
                mouthlyReportDate: 0,
                reportHour: 0,
                reportMin: 0,
            },
            receiverData: [] as AlarmPassLinesEmailDto['receiverData'],
            weekOption: [
                {
                    value: 0,
                    label: Translate('IDCS_WEEK_DAY_SEVEN'),
                },
                {
                    value: 1,
                    label: Translate('IDCS_WEEK_DAY_ONE'),
                },
                {
                    value: 2,
                    label: Translate('IDCS_WEEK_DAY_TWO'),
                },
                {
                    value: 3,
                    label: Translate('IDCS_WEEK_DAY_THREE'),
                },
                {
                    value: 4,
                    label: Translate('IDCS_WEEK_DAY_FOUR'),
                },
                {
                    value: 5,
                    label: Translate('IDCS_WEEK_DAY_FIVE'),
                },
                {
                    value: 6,
                    label: Translate('IDCS_WEEK_DAY_SIX'),
                },
            ] as SelectOption<number, string>[],
            monthOption: Array(31)
                .fill(0)
                .map((_, index) => {
                    const i = index + 1
                    return {
                        value: i,
                        label: i,
                    }
                }),
            // initComplete: false,
            drawInitCount: 0,
            openCount: 0,
            // 更多弹窗数据
            morePopOpen: false,
            // 选择的警戒面
            chosenSurfaceIndex: 0,
        })

        const formData = ref(new AlarmPassLinesDto())
        const watchEdit = useWatchEditData(formData)

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

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

        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                const canvas = player.getDrawbordCanvas(0)
                if (props.chlData.supportPassLine) {
                    passLineDrawer = CanvasPassline({
                        el: canvas,
                        enableOSD: true,
                        enableShowAll: false,
                        onchange: changePassLine,
                    })
                } else if (props.chlData.supportCpc) {
                    cpcDrawer = CanvasCpc({
                        el: canvas,
                        enable: false,
                        onchange: changeCpc,
                    })
                }
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
            }
        }

        //播放视频
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

        // 关闭排程管理后刷新排程列表
        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            formData.value.schedule = getScheduleId(pageData.value.scheduleList, formData.value.schedule)
        }

        // 对sheduleList进行处理
        const getScheduleList = async () => {
            openLoading()
            pageData.value.scheduleList = await buildScheduleList()
            closeLoading()
        }

        // 获取收件人配置
        const getEmailCfg = async () => {
            const res = await queryEmailCfg()
            const $ = queryXml(res)
            pageData.value.receiverData = []
            if ($('status').text() === 'success') {
                $('content/receiver/item').forEach((item) => {
                    const $ = queryXml(item.element)
                    pageData.value.receiverData.push({
                        address: $('address').text(),
                        schedule: getScheduleId(pageData.value.scheduleList, $('schedule').attr('id')),
                    })
                })
            }
        }

        // 设置收件人配置
        const setEmailCfg = async () => {
            const sendXml = rawXml`
                <content>
                    <receiver>
                        ${pageData.value.receiverData
                            .map((item) => {
                                return rawXml`
                                    <item>
                                        <address>${wrapCDATA(item.address)}</address>
                                        <schedule id="${item.schedule}"></schedule>
                                    </item>
                                `
                            })
                            .join('')}
                    </receiver>
                </content>
            `
            await editEmailCfg(sendXml)
        }

        // 获取定时发送邮件配置
        const getTimingSendEmail = async () => {
            const result = await queryTimingSendEmail()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                $('content/chl').forEach((chl) => {
                    if (chl.attr('id') === props.currChlId) {
                        const $item = queryXml(chl.element)
                        pageData.value.sendEmailData = {
                            type: $item('param/item/type').text().num(),
                            enableSwitch: $item('param/item/switch').text().bool(),
                            dailyReportSwitch: $item('param/item/dailyReportSwitch').text().bool(),
                            weeklyReportSwitch: $item('param/item/weeklyReportSwitch').text().bool(),
                            weeklyReportDate: $item('param/item/weeklyReportDate').text().num(),
                            mouthlyReportSwitch: $item('param/item/mouthlyReportSwitch').text().bool(),
                            mouthlyReportDate: $item('param/item/mouthlyReportDate').text().num(),
                            reportHour: $item('param/item/reportHour').text().num(),
                            reportMin: $item('param/item/reportMin').text().num(),
                        }
                    }
                })
            }
        }

        // 设置定时发送邮件配置
        const setTimingSendEmail = async () => {
            const sendXML = rawXml`
                <content>
                    <chl id="${props.currChlId}">
                        <param>
                            <item>
                                <type>${pageData.value.sendEmailData.type}</type>
                                <switch>${pageData.value.sendEmailData.enableSwitch}</switch>
                                <dailyReportSwitch>${pageData.value.sendEmailData.dailyReportSwitch}</dailyReportSwitch>
                                <weeklyReportSwitch>${pageData.value.sendEmailData.weeklyReportSwitch}</weeklyReportSwitch>
                                <weeklyReportDate>${pageData.value.sendEmailData.weeklyReportDate}</weeklyReportDate>
                                <mouthlyReportSwitch>${pageData.value.sendEmailData.mouthlyReportSwitch}</mouthlyReportSwitch>
                                <mouthlyReportDate>${pageData.value.sendEmailData.mouthlyReportDate}</mouthlyReportDate>
                                <reportHour>${pageData.value.sendEmailData.reportHour}</reportHour>
                                <reportMin>${pageData.value.sendEmailData.reportMin}</reportMin>
                            </item>
                        </param>
                    </chl>
                </content>
            `
            await editTimingSendEmail(sendXML)
        }

        // 保存passLine排程
        const setScheduleGuid = () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}" scheduleGuid="${formData.value.schedule}">
                        <trigger></trigger>
                    </chl>
                </content>
            `
            editPls(sendXml)
        }

        // 打开更多弹窗
        const handleMoreClick = async () => {
            // 第一次打开更多弹窗时获取邮件配置和定时发送邮件配置
            if (!pageData.value.openCount) {
                await getEmailCfg()
                await getTimingSendEmail()
            }
            pageData.value.openCount++
            pageData.value.emailData.saveSourcePicture = formData.value.saveSourcePicture
            pageData.value.emailData.saveTargetPicture = formData.value.saveTargetPicture
            pageData.value.emailData.sendEmailData = pageData.value.sendEmailData
            pageData.value.emailData.receiverData = pageData.value.receiverData
            pageData.value.morePopOpen = true
        }

        // 关闭更多弹窗，将数据传到pageData
        const closeMorePop = (e: AlarmPassLinesEmailDto) => {
            const data = cloneDeep(e)
            formData.value.saveSourcePicture = data.saveSourcePicture
            formData.value.saveTargetPicture = data.saveTargetPicture
            pageData.value.sendEmailData = data.sendEmailData
            pageData.value.receiverData = data.receiverData
            pageData.value.morePopOpen = false
        }

        // tab点击事件
        const changeTab = () => {
            if (pageData.value.tab === 'param') {
                if (props.chlData.supportPassLine) {
                    if (mode.value === 'h5') {
                        setPassLineOcxData()
                        passLineDrawer.setEnable('line', true)
                        passLineDrawer.setEnable('osd', formData.value.countOSD.switch)
                        passLineDrawer.setOSD(formData.value.countOSD)
                    }

                    if (mode.value === 'ocx') {
                        setTimeout(() => {
                            const alarmLine = pageData.value.chosenSurfaceIndex
                            const plugin = playerRef.value!.plugin

                            const sendXML1 = OCX_XML_SetTripwireLine(formData.value.line[alarmLine])
                            plugin.ExecuteCmd(sendXML1)

                            const sendXML2 = OCX_XML_SetTripwireLineAction('EDIT_ON')
                            plugin.ExecuteCmd(sendXML2)

                            const sendXML3 = OCX_XML_SetTripwireLineInfo(formData.value.countOSD)
                            plugin.ExecuteCmd(sendXML3)
                        }, 100)
                    }
                } else if (props.chlData.supportCpc) {
                    setCpcOcxData()
                    cpcDrawer.setEnable(true)
                }
            } else if (pageData.value.tab === 'target') {
                if (props.chlData.supportPassLine) {
                    if (mode.value === 'h5') {
                        passLineDrawer.clear()
                        passLineDrawer.setEnable('line', false)
                        passLineDrawer.setEnable('osd', false)
                        passLineDrawer.setOSD(formData.value.countOSD)
                    }

                    if (mode.value === 'ocx') {
                        setTimeout(() => {
                            const sendXML1 = OCX_XML_SetTripwireLineAction('NONE')
                            plugin.ExecuteCmd(sendXML1)

                            const sendXML2 = OCX_XML_SetTripwireLineAction('EDIT_OFF')
                            plugin.ExecuteCmd(sendXML2)

                            const sendXML3 = OCX_XML_SetTripwireLineInfo(formData.value.countOSD)
                            plugin.ExecuteCmd(sendXML3)
                        }, 100)
                    }
                } else if (props.chlData.supportCpc) {
                    cpcDrawer.clear()
                    cpcDrawer.setEnable(false)
                }
            }
        }

        // 获取数据
        const getData = async (manualResetSwitch?: boolean) => {
            watchEdit.reset()
            openLoading()

            if (props.chlData.supportPassLine) {
                const sendXml = rawXml`
                    <condition>
                        <chlId>${props.currChlId}</chlId>
                    </condition>
                    <requireField>
                        <param/>
                    </requireField>
                `
                const res = await queryPls(sendXml)
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    const $param = queryXml($('content/chl/param')[0].element)

                    let enabledSwitch = $param('switch').text().bool()
                    if (typeof manualResetSwitch === 'boolean') {
                        enabledSwitch = manualResetSwitch
                    }
                    formData.value.detectionEnable = enabledSwitch
                    formData.value.originalEnable = enabledSwitch

                    formData.value.objectFilter = {
                        car: $param('objectFilter/car/switch').text().bool(),
                        person: $param('objectFilter/person/switch').text().bool(),
                        motorcycle: $param('objectFilter/motor/switch').text().bool(),
                        personSensitivity: $param('objectFilter/person/sensitivity').text().num(),
                        carSensitivity: $param('car/sensitivity').text().num(),
                        motorSensitivity: $param('motor/sensitivity').text().num(),
                    }

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

                    formData.value.line = $param('line/item').map((element) => {
                        const $item = queryXml(element.element)
                        const direction = $item('direction').text() as CanvasPasslineDirection
                        const startX = $item('startPoint/X').text().num()
                        const startY = $item('startPoint/Y').text().num()
                        const endX = $item('endPoint/X').text().num()
                        const endY = $item('endPoint/Y').text().num()
                        return {
                            direction: direction,
                            startPoint: {
                                X: startX,
                                Y: startY,
                            },
                            endPoint: {
                                X: endX,
                                Y: endY,
                            },
                            configured: Boolean(startX && startY && endX && endY),
                        }
                    })

                    if (formData.value.line.length > 1) {
                        pageData.value.showAllAreaVisible = true
                        pageData.value.clearAllVisible = true
                    }

                    formData.value.schedule = getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid'))
                    formData.value.holdTime = Number($param('alarmHoldTime').text())
                    formData.value.countCycleTypeList = $('types/countCycleType/enum')
                        .map((element) => {
                            const itemValue = element.text()
                            return {
                                value: itemValue,
                                label: countCycleTypeTip[itemValue],
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

                    formData.value.countOSD = {
                        switch: $param('countOSD/switch').text().bool(),
                        X: $param('countOSD/X').text().num(),
                        Y: $param('countOSD/Y').text().num(),
                        osdFormat: $param('countOSD/osdFormat').text(),
                    }

                    formData.value.triggerAudio = $param('triggerAudio').text().bool()
                    formData.value.triggerWhiteLight = $param('triggerWhiteLight').text().bool()
                    formData.value.saveTargetPicture = $param('saveTargetPicture').text().bool()
                    formData.value.saveSourcePicture = $param('saveSourcePicture').text().bool()
                    formData.value.autoReset = countTimeType !== 'off'

                    pageData.value.direction = formData.value.line[0].direction
                    pageData.value.directionList = $('types/direction/enum').map((element) => {
                        const itemValue = element.text()
                        return {
                            value: itemValue,
                            label: directionTypeTip[itemValue],
                        }
                    })

                    watchEdit.listen()
                } else {
                    pageData.value.reqFail = true
                    pageData.value.tab = ''
                }
            } else if (props.chlData.supportCpc) {
                const sendXml = rawXml`
                    <condition>
                        <chlId>${props.currChlId}</chlId>
                    </condition>
                    <requireField>
                        <param/>
                    </requireField>
                `
                const res = await queryCpc(sendXml)
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    const $param = queryXml($('content/chl/param')[0].element)

                    formData.value.holdTime = $param('holdTime').text().num()
                    formData.value.holdTimeList = getAlarmHoldTimeList($param('holdTimeNote').text(), formData.value.holdTime)

                    formData.value.schedule = getScheduleId(pageData.value.scheduleList, $param('content/chl').attr('scheduleGuid'))
                    formData.value.detectionEnable = $param('switch').text().bool()
                    formData.value.originalEnable = $param('switch').text().bool()

                    formData.value.detectSensitivity = $param('detectSensitivity').text().num()
                    formData.value.statisticalPeriod = $param('statisticalPeriod').text()
                    formData.value.crossInAlarmNumValue = $param('crossInAlarmNum').text().num()
                    formData.value.crossOutAlarmNumValue = $param('crossOutAlarmNum').text().num()
                    formData.value.twoWayDiffAlarmNumValue = $param('twoWayDiffAlarmNum').text().num()
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

                    formData.value.detectSensitivityList = $('types/detectSensitivity/enum').map((element) => {
                        const itemValue = element.text().num()
                        return {
                            value: itemValue,
                            label: itemValue.toString(),
                        }
                    })
                    formData.value.statisticalPeriodList = $('types/statisticalPeriod/enum').map((element) => {
                        const itemValue = element.text()
                        return {
                            value: itemValue,
                            label: peopleCount[itemValue],
                        }
                    })
                    formData.value.regionInfo = {
                        X1: $param('regionInfo/item/X1').text().num(),
                        Y1: $param('regionInfo/item/Y1').text().num(),
                        X2: $param('regionInfo/item/X2').text().num(),
                        Y2: $param('regionInfo/item/Y2').text().num(),
                    }
                    formData.value.lineInfo = {
                        X1: $param('lineInfo/item/X1').text().num(),
                        Y1: $param('lineInfo/item/Y1').text().num(),
                        X2: $param('lineInfo/item/X2').text().num(),
                        Y2: $param('lineInfo/item/Y2').text().num(),
                    }

                    watchEdit.listen()
                } else {
                    pageData.value.reqFail = true
                    pageData.value.tab = ''
                }
            }
        }

        // 执行passLine编辑请求
        const savePassLineData = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}">
                        <param>
                            <switch>${formData.value.detectionEnable}</switch>
                            <alarmHoldTime unit="s">${formData.value.holdTime}</alarmHoldTime>
                            <objectFilter>
                                <car>
                                    <switch>${formData.value.objectFilter.car}</switch>
                                    <sensitivity>${formData.value.objectFilter.carSensitivity}</sensitivity>
                                </car>
                                <person>
                                    <switch>${formData.value.objectFilter.person}</switch>
                                    <sensitivity>${formData.value.objectFilter.personSensitivity}</sensitivity>
                                </person>
                                ${
                                    props.chlData.accessType === '0'
                                        ? rawXml`
                                            <motor>
                                                <switch>${formData.value.objectFilter.motorcycle}</switch>
                                                <sensitivity>${formData.value.objectFilter.motorSensitivity}</sensitivity>
                                            </motor>
                                        `
                                        : ''
                                }
                            </objectFilter>
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
                                <osdFormat>${formData.value.countOSD.osdFormat}</osdFormat>
                            </countOSD>
                            ${props.chlData.supportAudio ? `<triggerAudio>${formData.value.triggerAudio}</triggerAudio>` : ''}
                            ${props.chlData.supportWhiteLight ? `<triggerWhiteLight>${formData.value.triggerWhiteLight}</triggerWhiteLight>` : ''}
                            <saveTargetPicture>${formData.value.saveTargetPicture}</saveTargetPicture>
                            <saveSourcePicture>${formData.value.saveSourcePicture}</saveSourcePicture>
                            <line type="list" count="${formData.value.line.length}">
                                <itemType>
                                    <direction type="direction"/>
                                </itemType>
                                ${formData.value.line
                                    .map(
                                        (element) => rawXml`
                                            <item>
                                                <direction type="direction">${element.direction}</direction>
                                                <startPoint>
                                                    <X>${Math.round(element.startPoint.X)}</X>
                                                    <Y>${Math.round(element.startPoint.Y)}</Y>
                                                </startPoint>
                                                <endPoint>
                                                    <X>${Math.round(element.endPoint.X)}</X>
                                                    <Y>${Math.round(element.endPoint.Y)}</Y>
                                                </endPoint>
                                            </item>
                                        `,
                                    )
                                    .join('')}
                            </line>
                        </param>
                        <trigger></trigger>
                    </chl>
                </content>
            `
            openLoading()
            const res = await editPls(sendXml)
            const $ = queryXml(res)
            closeLoading()
            if ($('status').text() === 'success') {
                setEmailCfg()
                setTimingSendEmail()
                setScheduleGuid()
                refreshInitPage()
                watchEdit.update()
            }
        }

        // 执行cpc编辑请求
        const saveCpcData = async () => {
            const regionInfo = formData.value.regionInfo
            const lineInfo = formData.value.lineInfo
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}" scheduleGuid="${formData.value.schedule}">
                        <param>
                            <switch>${formData.value.detectionEnable}</switch>
                            <detectSensitivity>${formData.value.detectSensitivity}</detectSensitivity>
                            <statisticalPeriod>${formData.value.statisticalPeriod}</statisticalPeriod>
                            <crossOutAlarmNum>${formData.value.crossOutAlarmNumValue}</crossOutAlarmNum>
                            <crossInAlarmNum>${formData.value.crossInAlarmNumValue}</crossInAlarmNum>
                            <twoWayDiffAlarmNum>${formData.value.twoWayDiffAlarmNumValue}</twoWayDiffAlarmNum>
                            <holdTime unit="s">${formData.value.holdTime}</holdTime>
                            <regionInfo type="list">
                                <item>
                                    <X1>${regionInfo.X1}</X1>
                                    <Y1>${regionInfo.Y1}</Y1>
                                    <X2>${regionInfo.X2}</X2>
                                    <Y2>${regionInfo.Y2}</Y2>
                                </item>
                            </regionInfo>
                            <lineInfo type="list">
                                <item>
                                    <X1>${lineInfo.X1}</X1>
                                    <Y1>${lineInfo.Y1}</Y1>
                                    <X2>${lineInfo.X2}</X2>
                                    <Y2>${lineInfo.Y2}</Y2>
                                </item>
                            </lineInfo>
                        </param>
                        <trigger></trigger>
                    </chl>
                </content>
            `
            openLoading()
            const res = await editCpc(sendXml)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                if (formData.value.detectionEnable) {
                    formData.value.originalEnable = true
                }
            }
        }

        // 保存
        const applyData = () => {
            checkMutexChl({
                isChange: formData.value.detectionEnable && formData.value.detectionEnable !== formData.value.originalEnable,
                mutexList: formData.value.mutexList,
                mutexListEx: formData.value.mutexListEx,
                chlName: props.chlData.name,
                chlIp: props.chlData.ip,
                chlList: props.onlineChannelList,
                tips: 'IDCS_SIMPLE_PASSLINE_DETECT_TIPS',
            }).then(() => {
                if (props.chlData.supportPassLine) {
                    savePassLineData()
                } else if (props.chlData.supportCpc) {
                    saveCpcData()
                }
            })
        }

        // passLine手动重置请求
        const resetPassLineData = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}">
                        <param>
                            <forceReset>true</forceReset>
                        </param>
                    </chl>
                </content>`
            const res = await editPls(sendXml)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_RESET_SUCCESSED'),
                })
            } else {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_SAVE_DATA_FAIL'),
                })
            }
            // 重置的参数不包括开关, 故记下过线统计的开关
            const manualResetSwitch = formData.value.detectionEnable
            getData(manualResetSwitch)
        }

        // cpc手动重置请求
        const resetCpcData = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}"></chl>
                </content>`
            const res = await forceResetCpc(sendXml)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_RESET_SUCCESSED'),
                })
            } else {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_SAVE_DATA_FAIL'),
                })
            }
        }

        // 执行手动重置
        const resetData = () => {
            if (props.chlData.supportPassLine) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_RESET_TIP'),
                }).then(() => {
                    resetPassLineData()
                })
            } else if (props.chlData.supportCpc) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_RESET_TIP'),
                }).then(() => {
                    resetCpcData()
                })
            }
        }

        // 初始化页面数据
        const initPageData = async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            await getScheduleList()
            await getData()
            refreshInitPage()
        }

        // passLine选择警戒线
        const changeLine = () => {
            pageData.value.direction = formData.value.line[pageData.value.chosenSurfaceIndex].direction
            setPassLineOcxData()
        }

        // passLine选择方向
        const changeDirection = () => {
            formData.value.line[pageData.value.chosenSurfaceIndex].direction = pageData.value.direction
            setPassLineOcxData()
        }

        // passLine OSD变化
        const changeOSD = () => {
            if (mode.value === 'h5') {
                passLineDrawer.setEnable('osd', formData.value.countOSD.switch)
                passLineDrawer.setOSD(formData.value.countOSD)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetTripwireLineInfo(formData.value.countOSD)
                plugin.ExecuteCmd(sendXML)
            }
        }

        // passLine绘图变化
        const changePassLine = (
            passline: {
                startX: number
                startY: number
                endX: number
                endY: number
            },
            osdInfo: {
                X: number
                Y: number
                osdFormat: string
            },
        ) => {
            const alarmLine = pageData.value.chosenSurfaceIndex
            formData.value.line[alarmLine].startPoint = {
                X: passline.startX,
                Y: passline.startY,
            }
            formData.value.line[alarmLine].endPoint = {
                X: passline.endX,
                Y: passline.endY,
            }
            formData.value.countOSD.X = osdInfo.X
            formData.value.countOSD.Y = osdInfo.Y
            // if (pageData.value.isShowAllArea) {
            //     showAllPassLineArea(true)
            // }
        }

        // passLine绘图
        const setPassLineOcxData = () => {
            const alarmLine = pageData.value.chosenSurfaceIndex
            const plugin = playerRef.value!.plugin
            if (formData.value.line.length) {
                const line = formData.value.line[alarmLine]
                if (mode.value === 'h5') {
                    passLineDrawer.setCurrentSurfaceOrAlarmLine(alarmLine)
                    passLineDrawer.setDirection(line.direction)
                    passLineDrawer.setPassline({
                        startX: line.startPoint.X,
                        startY: line.startPoint.Y,
                        endX: line.endPoint.X,
                        endY: line.endPoint.Y,
                    })
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetTripwireLine(line)
                    plugin.ExecuteCmd(sendXML)
                }
            }

            if (formData.value.countOSD.switch) {
                if (mode.value === 'h5') {
                    passLineDrawer.setEnable('osd', true)
                    passLineDrawer.setOSD(formData.value.countOSD)
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetTripwireLineInfo(formData.value.countOSD)
                    plugin.ExecuteCmd(sendXML)
                }
            }

            if (pageData.value.isShowAllArea) {
                showAllPassLineArea(true)
            }
        }

        // 执行是否显示全部区域
        const togglePassLineShowAllArea = () => {
            // passLineDrawer && passLineDrawer.setEnableShowAll(pageData.value.isShowAllArea)
            showAllPassLineArea(pageData.value.isShowAllArea)
        }

        // passLine显示全部区域
        const showAllPassLineArea = (isShowAllArea: boolean) => {
            passLineDrawer && passLineDrawer.setEnableShowAll(isShowAllArea)
            if (isShowAllArea) {
                const lineInfoList = formData.value.line
                const currentAlarmLine = pageData.value.chosenSurfaceIndex
                if (mode.value === 'h5') {
                    passLineDrawer.setCurrentSurfaceOrAlarmLine(currentAlarmLine)
                    passLineDrawer.drawAllPassline(lineInfoList, currentAlarmLine)
                }

                if (mode.value === 'ocx') {
                    // console.log('ocx show all alarm area')
                }
            } else {
                if (mode.value === 'ocx') {
                    // console.log('ocx not show all alarm area')
                }
                setPassLineOcxData()
            }
        }

        // passLine清空当前区域
        const clearArea = () => {
            if (mode.value === 'h5') {
                passLineDrawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetTripwireLineAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            const currentAlarmLine = pageData.value.chosenSurfaceIndex
            formData.value.line[currentAlarmLine].startPoint = {
                X: 0,
                Y: 0,
            }
            formData.value.line[currentAlarmLine].endPoint = {
                X: 0,
                Y: 0,
            }
            if (pageData.value.isShowAllArea) {
                showAllPassLineArea(true)
            }
        }

        // passLine清空所有区域
        const clearAllArea = () => {
            const plugin = playerRef.value!.plugin

            const lineInfoList = formData.value.line
            lineInfoList.forEach((lineInfo) => {
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
                passLineDrawer && passLineDrawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML1 = OCX_XML_SetAllArea({ lineInfoList: [] }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, pageData.value.isShowAllArea)
                if (sendXML1) {
                    plugin.ExecuteCmd(sendXML1)
                }
                const sendXML = OCX_XML_SetTripwireLineAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }
        }

        // passLine刷新
        const refreshInitPage = () => {
            const lineInfoList = formData.value.line
            lineInfoList.forEach((lineInfo) => {
                if (lineInfo && !lineInfo.startPoint.X && !lineInfo.startPoint.Y && !lineInfo.endPoint.X && !lineInfo.endPoint.Y) {
                    lineInfo.configured = false
                } else {
                    lineInfo.configured = true
                }
            })
            // 是否显示全部区域切换按钮和清除全部按钮（区域数量大于等于2时才显示）
            if (formData.value.line.length > 1) {
                pageData.value.showAllAreaVisible = true
                pageData.value.clearAllVisible = true
            } else {
                pageData.value.showAllAreaVisible = false
                pageData.value.clearAllVisible = false
            }
        }

        // CPC绘图变化
        const changeCpc = (regionInfo: CanvasBaseArea, arrowlineInfo: CanvasBaseArea) => {
            formData.value.regionInfo = regionInfo
            formData.value.lineInfo = arrowlineInfo
        }

        // CPC绘图
        const setCpcOcxData = () => {
            if (mode.value === 'h5') {
                cpcDrawer.setRegionInfo(formData.value.regionInfo)
                cpcDrawer.setLineInfo(formData.value.lineInfo)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetCpcArea(formData.value.regionInfo, formData.value.lineInfo)
                plugin.ExecuteCmd(sendXML)
            }
        }

        // CPC开启绘图
        // const toggleCpcDrawAvailable = () => {
        //     if (mode.value === 'h5') {
        //         cpcDrawer.setEnable(pageData.value.isCpcDrawAvailable)
        //     }
        //     if (mode.value === 'ocx') {
        //         const sendXML = OCX_XML_SetCpcAreaAction(pageData.value.isCpcDrawAvailable ? 'EDIT_ON' : 'EDIT_OFF')
        //         plugin.ExecuteCmd(sendXML)
        //     }
        // }

        // CPC清空当前区域
        const clearCpcArea = () => {
            if (mode.value === 'h5') {
                cpcDrawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetCpcAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            formData.value.regionInfo = {
                X1: 0,
                Y1: 0,
                X2: 0,
                Y2: 0,
            }
        }

        const notify = ($: XMLQuery) => {
            if ($("statenotify[@type='CpcParam']").length) {
                const region = $('statenotify/regionInfo/item').map((element) => {
                    const $ = queryXml(element.element)
                    return {
                        X1: $('X1').text().num(),
                        Y1: $('Y1').text().num(),
                        X2: $('X2').text().num(),
                        Y2: $('Y2').text().num(),
                    }
                })
                const line = $('statenotify/lineInfo/item').map((element) => {
                    const $ = queryXml(element.element)
                    return {
                        X1: $('X1').text().num(),
                        Y1: $('Y1').text().num(),
                        X2: $('X2').text().num(),
                        Y2: $('Y2').text().num(),
                    }
                })
                formData.value.regionInfo = region[0]
                formData.value.lineInfo = line[0]
            } else if ($("statenotify[@type='TripwireLine']").length) {
                const alarmLine = pageData.value.chosenSurfaceIndex
                formData.value.line[alarmLine].startPoint = {
                    X: $('statenotify/startPoint').attr('X').num(),
                    Y: $('statenotify/startPoint').attr('Y').num(),
                }
                formData.value.line[alarmLine].endPoint = {
                    X: $('statenotify/endPoint').attr('X').num(),
                    Y: $('statenotify/endPoint').attr('Y').num(),
                }
            } else if ($("statenotify[@type='TripwireLineInfo']").length) {
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
                const sendAreaXML = OCX_XML_SetTripwireLineAction('NONE')
                plugin.ExecuteCmd(sendAreaXML)

                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }
        })

        return {
            playerRef,
            notify,
            pageData,
            watchEdit,
            formData,
            handlePlayerReady,
            closeSchedulePop,
            changeTab,
            togglePassLineShowAllArea,
            clearArea,
            clearAllArea,
            // toggleCpcDrawAvailable,
            changeLine,
            changeDirection,
            changeOSD,
            resetData,
            handleMoreClick,
            closeMorePop,
            clearCpcArea,
            applyData,
        }
    },
})
