/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-11 15:00:19
 * @Description: 过线检测
 */
import { type AlarmChlDto, AlarmPassLinesRegion, type AlarmPassLinesEmailDto, AlarmPassLinesDto } from '@/types/apiType/aiAndEvent'
import { type TabsPaneContext } from 'element-plus'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import CanvasPassline from '@/utils/canvas/canvasPassline'
import CanvasCpc from '@/utils/canvas/canvasCpc'
import PassLineEmailPop from './PassLinesEmailPop.vue'
import { cloneDeep } from 'lodash-es'
import { type XmlResult } from '@/utils/xmlParse'
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
        chlData: {
            type: Object as PropType<AlarmChlDto>,
            required: true,
        },
        voiceList: {
            type: Array as PropType<SelectOption<string, string>[]>,
            required: true,
        },
        onlineChannelList: {
            type: Array as PropType<{ id: string; ip: string; name: string; accessType: string }[]>,
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
        const pluginStore = usePluginStore()
        const osType = getSystemInfo().platform
        let passLineDrawer: CanvasPassline
        let cpcDrawer: CanvasCpc

        const closeTip = getAlarmEventList()

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
            // 不支持功能提示页面是否展示
            // notSupportTipShow: false,
            // 请求数据失败显示提示
            requireDataFail: false,
            // 排程管理
            scheduleManagePopOpen: false,
            scheduleList: [] as SelectOption<string, string>[],
            // 选择的功能:param、target
            fuction: 'param',

            // 通知列表
            notification: [] as string[],
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
            emailData: {} as AlarmPassLinesEmailDto,
            sendEmailData: {
                type: '0',
                enableSwitch: false,
                dailyReportSwitch: false,
                weeklyReportSwitch: false,
                weeklyReportDate: '0',
                mouthlyReportSwitch: false,
                mouthlyReportDate: '0',
                reportHour: 0,
                reportMin: 0,
            },
            receiverData: [] as { address: string; schedule: string; rowClicked: boolean }[],
            // passLine
            // apply按钮是否可用
            applyDisable: true,
            weekOption: [
                {
                    value: '0',
                    label: Translate('IDCS_WEEK_DAY_SEVEN'),
                },
                {
                    value: '1',
                    label: Translate('IDCS_WEEK_DAY_ONE'),
                },
                {
                    value: '2',
                    label: Translate('IDCS_WEEK_DAY_TWO'),
                },
                {
                    value: '3',
                    label: Translate('IDCS_WEEK_DAY_THREE'),
                },
                {
                    value: '4',
                    label: Translate('IDCS_WEEK_DAY_FOUR'),
                },
                {
                    value: '5',
                    label: Translate('IDCS_WEEK_DAY_FIVE'),
                },
                {
                    value: '6',
                    label: Translate('IDCS_WEEK_DAY_SIX'),
                },
            ] as SelectOption<string, string>[],
            monthOption: [] as SelectOption<string, string>[],
            initComplete: false,
            drawInitCount: 0,
            openCount: 0,
            // 更多弹窗数据
            morePopOpen: false,
            // 选择的警戒面
            chosenSurfaceIndex: 0,
        })

        const formData = ref(new AlarmPassLinesDto())

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

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

        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                if (playerRef.value) {
                    const canvas = playerRef.value.player.getDrawbordCanvas(0)
                    if (props.chlData.supportPassLine) {
                        passLineDrawer = new CanvasPassline({
                            el: canvas,
                            enableOSD: true,
                            enableShowAll: false,
                            onchange: passlineDrawChange,
                        })
                    } else if (props.chlData.supportCpc) {
                        cpcDrawer = new CanvasCpc({
                            el: canvas,
                            enable: false,
                            onchange: cpcDrawChange,
                        })
                    }
                }

                if (isHttpsLogin()) {
                    pageData.value.notification = [formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`)]
                }
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
                const sendXML = OCX_XML_SetPluginModel(osType == 'mac' ? 'TripwireConfig' : 'ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            } else if (mode.value === 'ocx') {
                if (osType == 'mac') {
                    // const sendXML = OCX_XML_Preview({
                    //     winIndexList: [0],
                    //     chlIdList: [props.chlData['id']],
                    //     chlNameList: [props.chlData['name']],
                    //     streamType: 'sub',
                    //     chlIndexList: [props.chlData['id']],
                    //     chlTypeList: [props.chlData['chlType']],
                    // })
                    // plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    plugin.RetryStartChlView(id, name)
                }
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && props.chlData && pageData.value.initComplete) {
                nextTick(() => {
                    play()
                    if (props.chlData.supportPassLine) {
                        if (mode.value === 'h5') {
                            passLineDrawer.setEnable('line', true)
                            passLineDrawer.setEnable('osd', formData.value.countOSD.switch)
                            passLineDrawer.setOSD(formData.value.countOSD)
                            passLineSetOcxData()
                        } else if (mode.value === 'ocx') {
                            const sendXML1 = OCX_XML_SetTripwireLineAction('EDIT_ON')
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                            const sendXML2 = OCX_XML_SetTripwireLineInfo(formData.value.countOSD)
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                            passLineSetOcxData()
                        }
                    } else if (props.chlData.supportCpc) {
                        cpcDrawSetOcxData()
                    }
                })
                stopWatchFirstPlay()
            }
        })

        // 关闭排程管理后刷新排程列表
        const handleSchedulePopClose = async () => {
            pageData.value.scheduleManagePopOpen = false
            await getScheduleList()
        }

        // 对sheduleList进行处理
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        // 获取收件人配置
        const getEmailCfg = async () => {
            const res = await queryEmailCfg()
            const $ = queryXml(res)
            pageData.value.receiverData = []
            if ($('status').text() == 'success') {
                $('//content/receiver/item').forEach((item) => {
                    const $ = queryXml(item.element)
                    let schedule = $('schedule').attr('id')
                    // 判断返回的排程是否存在，若不存在设为scheduleDefaultId
                    const scheduleIdList = pageData.value.scheduleList.map((item) => item.value)
                    schedule = scheduleIdList.includes(schedule) ? schedule : DEFAULT_EMPTY_ID
                    pageData.value.receiverData.push({
                        address: $('address').text(),
                        schedule: schedule,
                        rowClicked: false,
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
            const res = await queryTimingSendEmail()
            const $res = queryXml(res)
            if ($res('status').text() == 'success') {
                $res('//content/chl').forEach((chl) => {
                    if (chl.attr('id') == props.currChlId) {
                        const $ = queryXml(chl.element)
                        const type = $('param/item/type').text()
                        const enableSwitch = $('param/item/switch').text() == 'true'
                        const dailyReportSwitch = $('param/item/dailyReportSwitch').text() == 'true'
                        const weeklyReportSwitch = $('param/item/weeklyReportSwitch').text() == 'true'
                        const weeklyReportDate = $('param/item/weeklyReportDate').text()
                        const mouthlyReportSwitch = $('param/item/mouthlyReportSwitch').text() == 'true'
                        const mouthlyReportDate = $('param/item/mouthlyReportDate').text()
                        const reportHour = Number($('param/item/reportHour').text())
                        const reportMin = Number($('param/item/reportMin').text())
                        pageData.value.sendEmailData = {
                            type: type,
                            enableSwitch: enableSwitch,
                            dailyReportSwitch: dailyReportSwitch,
                            weeklyReportSwitch: weeklyReportSwitch,
                            weeklyReportDate: weeklyReportDate,
                            mouthlyReportSwitch: mouthlyReportSwitch,
                            mouthlyReportDate: mouthlyReportDate,
                            reportHour: reportHour,
                            reportMin: reportMin,
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
                    <chl id="${props.currChlId}" scheduleGuid="${formData.value.passLineSchedule}">
                        <trigger></trigger>
                    </chl>
                </content>
            `
            editPls(sendXml)
        }

        // 打开更多弹窗
        const handleMoreClick = async () => {
            // 第一次打开更多弹窗时获取邮件配置和定时发送邮件配置
            if (pageData.value.openCount == 0) {
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
        const handleMorePopClose = (e: AlarmPassLinesEmailDto) => {
            const data = cloneDeep(e)
            formData.value.saveSourcePicture = data.saveSourcePicture
            formData.value.saveTargetPicture = data.saveTargetPicture
            pageData.value.sendEmailData = data.sendEmailData
            pageData.value.receiverData = data.receiverData
            pageData.value.morePopOpen = false
        }

        // tab点击事件
        const handleFunctionTabClick = async (pane: TabsPaneContext) => {
            pageData.value.fuction = pane.props.name?.toString() ? pane.props.name?.toString() : ''
            if (pageData.value.fuction == 'param') {
                if (props.chlData.supportPassLine) {
                    if (mode.value === 'h5') {
                        passLineSetOcxData()
                        passLineDrawer.setEnable('line', true)
                        passLineDrawer.setEnable('osd', formData.value.countOSD.switch)
                        passLineDrawer.setOSD(formData.value.countOSD)
                    } else if (mode.value === 'ocx') {
                        setTimeout(() => {
                            const alarmLine = pageData.value.chosenSurfaceIndex
                            const plugin = playerRef.value!.plugin
                            const sendXML1 = OCX_XML_SetTripwireLine(formData.value.lineInfo[alarmLine])
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                            const sendXML2 = OCX_XML_SetTripwireLineAction('EDIT_ON')
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                            const sendXML3 = OCX_XML_SetTripwireLineInfo(formData.value.countOSD)
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML3)
                        }, 100)
                    }
                } else if (props.chlData.supportCpc) {
                    cpcDrawSetOcxData()
                    cpcDrawer.setEnable(true)
                }
            } else if (pageData.value.fuction == 'target') {
                if (props.chlData.supportPassLine) {
                    if (mode.value === 'h5') {
                        passLineDrawer.clear()
                        passLineDrawer.setEnable('line', false)
                        passLineDrawer.setEnable('osd', false)
                        passLineDrawer.setOSD(formData.value.countOSD)
                    } else if (mode.value === 'ocx') {
                        setTimeout(() => {
                            const plugin = playerRef.value!.plugin
                            const sendXML1 = OCX_XML_SetTripwireLineAction('NONE')
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                            const sendXML2 = OCX_XML_SetTripwireLineAction('EDIT_OFF')
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                            const sendXML3 = OCX_XML_SetTripwireLineInfo(formData.value.countOSD)
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML3)
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
                if ($('status').text() == 'success') {
                    const countCycleTypeList = $('//types/countCycleType/enum').map((element) => {
                        const itemValue = element.text()
                        return {
                            value: itemValue,
                            label: countCycleTypeTip[itemValue],
                        }
                    })

                    const directionList = $('//types/direction/enum').map((element) => {
                        const itemValue = element.text()
                        return {
                            value: itemValue,
                            label: directionTypeTip[itemValue],
                        }
                    })

                    const mutexList = $('//content/chl/param/mutexList/item').map((element) => {
                        const $ = queryXml(element.element)
                        return {
                            object: $('object').text(),
                            status: $('status').text().toBoolean(),
                        }
                    })

                    const mutexListEx = $('//content/chl/param/mutexListEx/item').map((element) => {
                        const $ = queryXml(element.element)
                        return {
                            object: $('object').text(),
                            status: $('status').text().toBoolean(),
                        }
                    })

                    let enabledSwitch = $('//content/chl/param/switch').text() == 'true'
                    if (manualResetSwitch) {
                        // 手动重置时, 再次判断开关取值
                        const applyDisabled = manualResetSwitch == ($('//content/chl/param/switch').text() == 'true')
                        pageData.value.applyDisable = applyDisabled
                        enabledSwitch = manualResetSwitch
                    }

                    const holdTime = $('//content/chl/param/alarmHoldTime').text()
                    let objectFilter = {
                        person: false,
                        car: false,
                        motorcycle: false,
                        personSensitivity: 0,
                        carSensitivity: 0,
                        motorSensitivity: 0,
                    }
                    if ($('//content/chl/param/objectFilter').text() !== '') {
                        const car = $('//content/chl/param/objectFilter/car/switch').text() == 'true'
                        const person = $('//content/chl/param/objectFilter/person/switch').text() == 'true'
                        const motorcycle = $('//content/chl/param/objectFilter/motor/switch').text() == 'true'
                        const personSensitivity = Number($('//content/chl/param/objectFilter/person/sensitivity').text())
                        const carSensitivity = Number($('//content/chl/param/objectFilter/car/sensitivity').text())
                        const motorSensitivity = Number($('//content/chl/param/objectFilter/motor/sensitivity').text())
                        objectFilter = {
                            car: car,
                            person: person,
                            motorcycle: motorcycle,
                            personSensitivity: personSensitivity,
                            carSensitivity: carSensitivity,
                            motorSensitivity: motorSensitivity,
                        }
                    }

                    const countTimeType = $('//content/chl/param/countPeriod/countTimeType').text()
                    const countPeriod = {
                        day: {
                            date: $('//content/chl/param/countPeriod/day/dateSpan').text(),
                            dateTime: $('//content/chl/param/countPeriod/day/dateTimeSpan').text(),
                        },
                        week: {
                            date: $('//content/chl/param/countPeriod/week/dateSpan').text(),
                            dateTime: $('//content/chl/param/countPeriod/week/dateTimeSpan').text(),
                        },
                        month: {
                            date: $('//content/chl/param/countPeriod/month/dateSpan').text(),
                            dateTime: $('//content/chl/param/countPeriod/month/dateTimeSpan').text(),
                        },
                    }
                    const countOSD = {
                        switch: $('//content/chl/param/countOSD/switch').text() == 'true',
                        X: Number($('//content/chl/param/countOSD/X').text()),
                        Y: Number($('//content/chl/param/countOSD/Y').text()),
                        osdFormat: $('//content/chl/param/countOSD/osdFormat').text(),
                    }
                    const triggerAudio = $('//content/chl/param/triggerAudio').text() == 'true'
                    const triggerWhiteLight = $('//content/chl/param/triggerWhiteLight').text() == 'true'
                    const saveTargetPicture = $('//content/chl/param/saveTargetPicture').text() == 'true'
                    const saveSourcePicture = $('//content/chl/param/saveSourcePicture').text() == 'true'
                    const lineInfo = $('//content/chl/param/line/item').map((element) => {
                        const $ = queryXml(element.element)
                        const direction: CanvasPasslineDirection = $('direction').text() as CanvasPasslineDirection
                        return {
                            direction: direction,
                            startPoint: {
                                X: Number($('startPoint/X').text()),
                                Y: Number($('startPoint/Y').text()),
                            },
                            endPoint: {
                                X: Number($('endPoint/X').text()),
                                Y: Number($('endPoint/Y').text()),
                            },
                            configured: false,
                        }
                    })
                    lineInfo.forEach((element) => {
                        if (element.startPoint.X != 0 && element.startPoint.Y != 0 && element.endPoint.X != 0 && element.endPoint.Y != 0) {
                            element.configured = true
                        }
                    })
                    if (lineInfo.length > 1) {
                        pageData.value.showAllAreaVisible = true
                        pageData.value.clearAllVisible = true
                    }
                    const schedule = $('//content/chl').attr('scheduleGuid')

                    formData.value.passLineSchedule = schedule
                        ? pageData.value.scheduleList.some((item: { value: string; label: string }) => item.value == schedule)
                            ? schedule
                            : DEFAULT_EMPTY_ID
                        : DEFAULT_EMPTY_ID
                    formData.value.passLineholdTime = Number(holdTime)
                    formData.value.countCycleTypeList = countCycleTypeList.filter((item) => item.value !== 'off')
                    formData.value.passLineMutexList = mutexList
                    formData.value.passLineMutexListEx = mutexListEx
                    formData.value.countOSD = countOSD
                    formData.value.objectFilter = objectFilter
                    formData.value.countTimeType = countTimeType !== 'off' ? countTimeType : 'day'
                    formData.value.countPeriod = countPeriod
                    formData.value.passLineDetectionEnable = enabledSwitch
                    formData.value.passLineOriginalEnable = enabledSwitch
                    formData.value.triggerAudio = triggerAudio
                    formData.value.triggerWhiteLight = triggerWhiteLight
                    formData.value.saveTargetPicture = saveTargetPicture
                    formData.value.saveSourcePicture = saveSourcePicture
                    formData.value.lineInfo = lineInfo
                    formData.value.autoReset = countTimeType !== 'off'
                    if (formData.value.countOSD.switch) {
                        if (mode.value === 'ocx') {
                            const sendXML = OCX_XML_SetTripwireLineInfo(formData.value.countOSD)
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        } else {
                            passLineDrawer.setEnable('osd', formData.value.countOSD.switch)
                            passLineDrawer.setOSD(formData.value.countOSD)
                        }
                    }
                    pageData.value.direction = lineInfo[0].direction
                    pageData.value.directionList = directionList
                    pageData.value.applyDisable = true
                } else {
                    pageData.value.requireDataFail = true
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
                if ($('status').text() == 'success') {
                    const holdTimeArr = $('//content/chl/param/holdTimeNote').text().split(',')
                    holdTimeArr.forEach((element) => {
                        holdTimeList.push({ value: Number(element), label: element })
                    })
                    const holdTime = Number($('//content/chl/param/holdTime').text())
                    if (!holdTimeArr.includes(holdTime.toString())) {
                        holdTimeArr.push(holdTime.toString())
                    }
                    const holdTimeList = formatHoldTime(holdTimeArr)

                    const detectSensitivityList = $('//types/detectSensitivity/enum').map((element) => {
                        const itemValue = Number(element.text())
                        return {
                            value: itemValue,
                            label: itemValue.toString(),
                        }
                    })

                    const statisticalPeriodList = $('//types/statisticalPeriod/enum').map((element) => {
                        const itemValue = element.text()
                        return {
                            value: itemValue,
                            label: peopleCount[itemValue],
                        }
                    })

                    let regionInfo = new AlarmPassLinesRegion()
                    $('//content/chl/param/regionInfo/item').forEach((element) => {
                        const $ = queryXml(element.element)
                        const region = {
                            X1: Number($('X1').text()),
                            Y1: Number($('Y1').text()),
                            X2: Number($('X2').text()),
                            Y2: Number($('Y2').text()),
                        }
                        regionInfo = region
                    })

                    let lineInfo = new AlarmPassLinesRegion()
                    $('//content/chl/param/lineInfo/item').forEach((element) => {
                        const $ = queryXml(element.element)
                        const line = {
                            X1: Number($('X1').text()),
                            Y1: Number($('Y1').text()),
                            X2: Number($('X2').text()),
                            Y2: Number($('Y2').text()),
                        }
                        lineInfo = line
                    })

                    const mutexList = $('//content/chl/param/mutexList/item').map((element) => {
                        const $ = queryXml(element.element)
                        return {
                            object: $('object').text(),
                            status: $('status').text() == 'true',
                        }
                    })

                    const mutexListEx = $('//content/chl/param/mutexListEx/item').map((element) => {
                        const $ = queryXml(element.element)
                        return {
                            object: $('object').text(),
                            status: $('status').text() == 'true',
                        }
                    })

                    const enabledSwitch = $('//content/chl/param/switch').text() == 'true'
                    const detectSensitivity = Number($('//content/chl/param/detectSensitivity').text())
                    const statisticalPeriod = $('//content/chl/param/statisticalPeriod').text()
                    const crossInAlarmNumValue = Number($('//content/chl/param/crossInAlarmNum').text())
                    const crossOutAlarmNumValue = Number($('//content/chl/param/crossOutAlarmNum').text())
                    const twoWayDiffAlarmNumValue = Number($('//content/chl/param/twoWayDiffAlarmNum').text())
                    const cpcSchedule = $('//content/chl').attr('scheduleGuid')

                    formData.value.cpcSchedule =
                        cpcSchedule == ''
                            ? pageData.value.scheduleList.some((item: { value: string; label: string }) => item.value == cpcSchedule)
                                ? cpcSchedule
                                : DEFAULT_EMPTY_ID
                            : DEFAULT_EMPTY_ID
                    formData.value.cpcDetectionEnable = enabledSwitch
                    formData.value.cpcOriginalEnable = enabledSwitch
                    formData.value.holdTime = holdTime
                    formData.value.detectSensitivity = detectSensitivity
                    formData.value.statisticalPeriod = statisticalPeriod
                    formData.value.crossInAlarmNumValue = crossInAlarmNumValue
                    formData.value.crossOutAlarmNumValue = crossOutAlarmNumValue
                    formData.value.twoWayDiffAlarmNumValue = twoWayDiffAlarmNumValue
                    formData.value.cpcMutexList = mutexList
                    formData.value.cpcMutexListEx = mutexListEx
                    formData.value.holdTimeList = holdTimeList
                    formData.value.detectSensitivityList = detectSensitivityList
                    formData.value.statisticalPeriodList = statisticalPeriodList
                    formData.value.regionInfo = regionInfo
                    formData.value.cpcLineInfo = lineInfo
                    pageData.value.applyDisable = true
                } else {
                    pageData.value.requireDataFail = true
                }
            }
        }

        // 执行passLine编辑请求
        const savePassLineData = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}">
                        <param>
                            <switch>${formData.value.passLineDetectionEnable}</switch>
                            <alarmHoldTime unit="s">${formData.value.passLineholdTime}</alarmHoldTime>
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
                                    props.chlData.accessType == '0'
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
                            <line type="list" count="${formData.value.lineInfo.length}">
                                <itemType>
                                    <direction type="direction"/>
                                </itemType>
                                ${formData.value.lineInfo
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
            if ($('status').text() == 'success') {
                setEmailCfg()
                setTimingSendEmail()
                setScheduleGuid()
                passLineRefreshInitPage()
                pageData.value.applyDisable = true
            }
        }

        // 执行cpc编辑请求
        const saveCpcData = async () => {
            const regionInfo = formData.value.regionInfo
            const cpcLineInfo = formData.value.cpcLineInfo
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}" scheduleGuid="${formData.value.cpcSchedule}">
                        <param>
                            <switch>${formData.value.cpcDetectionEnable}</switch>
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
                                    <X1>${cpcLineInfo.X1}</X1>
                                    <Y1>${cpcLineInfo.Y1}</Y1>
                                    <X2>${cpcLineInfo.X2}</X2>
                                    <Y2>${cpcLineInfo.Y2}</Y2>
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
            if ($('status').text() == 'success') {
                if (formData.value.cpcDetectionEnable) {
                    formData.value.cpcOriginalEnable = true
                }
                pageData.value.applyDisable = true
            }
        }

        // 保存
        const handleApply = async () => {
            if (props.chlData.supportPassLine) {
                let isSwitchChange = false
                const switchChangeTypeArr: string[] = []

                if (formData.value.passLineDetectionEnable && formData.value.passLineDetectionEnable !== formData.value.passLineOriginalEnable) {
                    isSwitchChange = true
                }

                const mutexChlNameObj = getMutexChlNameObj()

                formData.value.passLineMutexList.forEach((ele) => {
                    if (ele.status) {
                        const prefixName = mutexChlNameObj.normalChlName ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj.normalChlName) : ''
                        const showInfo = prefixName ? prefixName + closeTip[ele.object].toLowerCase() : closeTip[ele.object]
                        switchChangeTypeArr.push(showInfo)
                    }
                })

                formData.value.passLineMutexListEx.forEach((ele) => {
                    if (ele.status) {
                        const prefixName = mutexChlNameObj.thermalChlName ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj.thermalChlName) : ''
                        const showInfo = prefixName ? prefixName + closeTip[ele.object].toLowerCase() : closeTip[ele.object]
                        switchChangeTypeArr.push(showInfo)
                    }
                })

                if (isSwitchChange && switchChangeTypeArr.length > 0) {
                    const switchChangeType = switchChangeTypeArr.join(',')
                    openMessageBox({
                        type: 'question',
                        message: Translate('IDCS_SIMPLE_PASSLINE_DETECT_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + props.chlData.name, switchChangeType),
                    }).then(() => {
                        savePassLineData()
                    })
                } else {
                    savePassLineData()
                }
            } else if (props.chlData.supportCpc) {
                let isSwitchChange = false
                const switchChangeTypeArr: string[] = []

                if (formData.value.cpcDetectionEnable && formData.value.cpcDetectionEnable !== formData.value.cpcOriginalEnable) {
                    isSwitchChange = true
                }

                const mutexChlNameObj = getMutexChlNameObj()

                formData.value.cpcMutexList.forEach((ele) => {
                    if (ele.status) {
                        const prefixName = mutexChlNameObj.normalChlName ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj.normalChlName) : ''
                        const showInfo = prefixName ? prefixName + closeTip[ele.object].toLowerCase() : closeTip[ele.object]
                        switchChangeTypeArr.push(showInfo)
                    }
                })

                formData.value.cpcMutexListEx.forEach((ele) => {
                    if (ele.status) {
                        const prefixName = mutexChlNameObj.thermalChlName ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj.thermalChlName) : ''
                        const showInfo = prefixName ? prefixName + closeTip[ele.object].toLowerCase() : closeTip[ele.object].toLowerCase()
                        switchChangeTypeArr.push(showInfo)
                    }
                })

                if (isSwitchChange && switchChangeTypeArr.length > 0) {
                    const switchChangeType = switchChangeTypeArr.join(',')
                    openMessageBox({
                        type: 'question',
                        message: Translate('IDCS_SIMPLE_PASSLINE_DETECT_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + props.chlData.name, switchChangeType),
                    }).then(() => {
                        saveCpcData()
                    })
                } else {
                    saveCpcData()
                }
            }
        }

        // passLine手动重置请求
        const passLineManualResetData = async () => {
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
            if ($('status').text() == 'success') {
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
            const manualResetSwitch = formData.value.passLineDetectionEnable
            getData(manualResetSwitch)
        }

        // cpc手动重置请求
        const cpcManualResetData = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}"></chl>
                </content>`
            const res = await forceResetCpc(sendXml)
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
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
        const handleReset = () => {
            if (props.chlData.supportPassLine) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_RESET_TIP'),
                }).then(() => {
                    passLineManualResetData()
                })
            } else if (props.chlData.supportCpc) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_RESET_TIP'),
                }).then(() => {
                    cpcManualResetData()
                })
            }
        }

        // 初始化页面数据
        const initPageData = async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig

            for (let i = 1; i < 32; i++) {
                pageData.value.monthOption.push({
                    value: i.toString(),
                    label: i.toString(),
                })
            }
            await getScheduleList()
            const pageTimer = setTimeout(async () => {
                // 临时方案-NVRUSS44-79（页面快速切换时。。。）
                const plugin = playerRef.value!.plugin
                if (mode.value === 'ocx') {
                    plugin.VideoPluginNotifyEmitter.addListener(LiveNotify2Js)
                }
                await getData()
                passLineRefreshInitPage()
                if (props.chlData.supportPassLine) {
                    if (mode.value === 'h5') {
                        passLineDrawer.setEnable('line', true)
                        if (formData.value.countOSD.switch) {
                            passLineDrawer.setEnable('osd', formData.value.countOSD.switch)
                            passLineDrawer.setOSD(formData.value.countOSD)
                        }
                    } else {
                        const sendXML1 = OCX_XML_SetTripwireLineAction('EDIT_ON')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                        if (formData.value.countOSD.switch) {
                            const sendXML2 = OCX_XML_SetTripwireLineInfo(formData.value.countOSD)
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                        }
                    }
                    passLineSetOcxData()
                } else if (props.chlData.supportCpc) {
                    // cpcDrawer.setEnable(true)
                    cpcDrawSetOcxData()
                }
                clearTimeout(pageTimer)

                nextTick(() => {
                    pageData.value.initComplete = true
                })
            }, 250)
        }

        // passLine选择警戒线
        const handleLineChange = () => {
            pageData.value.direction = formData.value.lineInfo[pageData.value.chosenSurfaceIndex].direction
            passLineSetOcxData()
        }

        // passLine选择方向
        const handleDirectionChange = () => {
            formData.value.lineInfo[pageData.value.chosenSurfaceIndex].direction = pageData.value.direction
            passLineSetOcxData()
        }

        // passLine OSD变化
        const handleOSDChange = () => {
            if (mode.value === 'h5') {
                passLineDrawer.setEnable('osd', formData.value.countOSD.switch)
                passLineDrawer.setOSD(formData.value.countOSD)
            } else {
                const plugin = playerRef.value!.plugin
                const sendXML = OCX_XML_SetTripwireLineInfo(formData.value.countOSD)
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        // 获取mutexobj
        const getMutexChlNameObj = () => {
            let normalChlName = ''
            let thermalChlName = ''
            const sameIPChlList: { id: string; ip: string; name: string; accessType: string }[] = []
            const chlIp = props.chlData.ip
            props.onlineChannelList.forEach((chl) => {
                if (chl.ip == chlIp) {
                    sameIPChlList.push(chl)
                }
            })
            if (sameIPChlList.length > 1) {
                sameIPChlList.forEach((chl) => {
                    if (chl.accessType == '1') {
                        thermalChlName = chl.name == props.chlData.name ? '' : chl.name
                    } else {
                        normalChlName = chl.name == props.chlData.name ? '' : chl.name
                    }
                })
            }
            return {
                normalChlName: normalChlName,
                thermalChlName: thermalChlName,
            }
        }

        // 格式化持续时间
        const formatHoldTime = (holdTimeList: string[]) => {
            const timeList: SelectOption<number, string>[] = []
            holdTimeList.forEach((ele) => {
                const element = Number(ele)
                const itemText = getTranslateForSecond(element)
                timeList.push({ value: element, label: itemText })
            })
            timeList.sort((a, b) => a.value - b.value)
            return timeList
        }

        // passLine绘图变化
        const passlineDrawChange = (
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
            formData.value.lineInfo[alarmLine].startPoint = {
                X: passline.startX,
                Y: passline.startY,
            }
            formData.value.lineInfo[alarmLine].endPoint = {
                X: passline.endX,
                Y: passline.endY,
            }
            formData.value.countOSD.X = osdInfo.X
            formData.value.countOSD.Y = osdInfo.Y
            // if (pageData.value.isShowAllArea) {
            //     passLineShowAllArea(true)
            // }
        }

        // passLine绘图
        const passLineSetOcxData = () => {
            const alarmLine = pageData.value.chosenSurfaceIndex
            const plugin = playerRef.value!.plugin
            if (formData.value.lineInfo.length > 0) {
                if (mode.value === 'h5') {
                    passLineDrawer.setCurrentSurfaceOrAlarmLine(alarmLine)
                    passLineDrawer.setDirection(formData.value.lineInfo[alarmLine].direction)
                    passLineDrawer.setPassline({
                        startX: formData.value.lineInfo[alarmLine].startPoint.X,
                        startY: formData.value.lineInfo[alarmLine].startPoint.Y,
                        endX: formData.value.lineInfo[alarmLine].endPoint.X,
                        endY: formData.value.lineInfo[alarmLine].endPoint.Y,
                    })
                } else {
                    const sendXML = OCX_XML_SetTripwireLine(formData.value.lineInfo[alarmLine])
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }

            if (formData.value.countOSD.switch) {
                if (mode.value !== 'h5') {
                    const sendXML = OCX_XML_SetTripwireLineInfo(formData.value.countOSD)
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    passLineDrawer.setEnable('osd', true)
                    passLineDrawer.setOSD(formData.value.countOSD)
                }
            }

            if (pageData.value.isShowAllArea) {
                passLineShowAllArea(true)
            }
        }

        // 执行是否显示全部区域
        const handlePassLineShowAllAreaChange = () => {
            // passLineDrawer && passLineDrawer.setEnableShowAll(pageData.value.isShowAllArea)
            passLineShowAllArea(pageData.value.isShowAllArea)
        }

        // passLine显示全部区域
        const passLineShowAllArea = (isShowAllArea: boolean) => {
            passLineDrawer && passLineDrawer.setEnableShowAll(isShowAllArea)
            if (isShowAllArea) {
                const lineInfoList = formData.value.lineInfo
                const currentAlarmLine = pageData.value.chosenSurfaceIndex
                if (mode.value === 'h5') {
                    passLineDrawer.setCurrentSurfaceOrAlarmLine(currentAlarmLine)
                    passLineDrawer.drawAllPassline(lineInfoList, currentAlarmLine)
                } else {
                    console.log('ocx show all alarm area')
                }
            } else {
                if (mode.value !== 'h5') {
                    console.log('ocx not show all alarm area')
                }
                passLineSetOcxData()
            }
        }

        // passLine清空当前区域
        const passLineClearArea = () => {
            if (mode.value === 'h5') {
                passLineDrawer.clear()
            } else {
                const sendXML = OCX_XML_SetTripwireLineAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            const currentAlarmLine = pageData.value.chosenSurfaceIndex
            formData.value.lineInfo[currentAlarmLine].startPoint = { X: 0, Y: 0 }
            formData.value.lineInfo[currentAlarmLine].endPoint = { X: 0, Y: 0 }
            if (pageData.value.isShowAllArea) {
                passLineShowAllArea(true)
            }
        }

        // passLine清空所有区域
        const passLineClearAllArea = () => {
            const plugin = playerRef.value!.plugin

            const lineInfoList = formData.value.lineInfo
            lineInfoList.forEach((lineInfo) => {
                lineInfo.startPoint = { X: 0, Y: 0 }
                lineInfo.endPoint = { X: 0, Y: 0 }
            })
            if (mode.value === 'h5') {
                passLineDrawer && passLineDrawer.clear()
            } else {
                const sendXML1 = OCX_XML_SetAllArea({ lineInfoList: [] }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, pageData.value.isShowAllArea)
                if (sendXML1) {
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                }
                const sendXML = OCX_XML_SetTripwireLineAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        // passLine刷新
        const passLineRefreshInitPage = () => {
            const lineInfoList = formData.value.lineInfo
            lineInfoList.forEach((lineInfo) => {
                if (lineInfo && lineInfo.startPoint.X == 0 && lineInfo.startPoint.Y == 0 && lineInfo.endPoint.X == 0 && lineInfo.endPoint.Y == 0) {
                    lineInfo.configured = false
                } else {
                    lineInfo.configured = true
                }
            })
            // 是否显示全部区域切换按钮和清除全部按钮（区域数量大于等于2时才显示）
            if (formData.value.lineInfo.length > 1) {
                pageData.value.showAllAreaVisible = true
                pageData.value.clearAllVisible = true
            } else {
                pageData.value.showAllAreaVisible = false
                pageData.value.clearAllVisible = false
            }
        }

        // CPC绘图变化
        const cpcDrawChange = (regionInfo: AlarmPassLinesRegion, arrowlineInfo: AlarmPassLinesRegion) => {
            formData.value.regionInfo = regionInfo
            formData.value.cpcLineInfo = arrowlineInfo
        }

        // CPC绘图
        const cpcDrawSetOcxData = () => {
            if (mode.value === 'h5') {
                cpcDrawer.setRegionInfo(formData.value.regionInfo)
                cpcDrawer.setLineInfo(formData.value.cpcLineInfo)
            } else {
                const sendXML = OCX_XML_SetCpcArea(formData.value.regionInfo, formData.value.cpcLineInfo)
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        // CPC开启绘图
        const handleCpcDrawAvailableChange = () => {
            if (mode.value === 'h5') {
                cpcDrawer.setEnable(pageData.value.isCpcDrawAvailable)
            } else if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetCpcAreaAction(pageData.value.isCpcDrawAvailable ? 'EDIT_ON' : 'EDIT_OFF')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        // CPC清空当前区域
        const clearCpcArea = () => {
            if (mode.value === 'h5') {
                cpcDrawer.clear()
            } else if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetCpcAreaAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            formData.value.regionInfo = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
        }

        const LiveNotify2Js = ($: (path: string) => XmlResult) => {
            if ($("statenotify[@type='CpcParam']").length > 0) {
                const region: AlarmPassLinesRegion[] = []
                const line: AlarmPassLinesRegion[] = []
                $('statenotify/regionInfo/item').forEach((element) => {
                    const $ = queryXml(element.element)
                    region.push({
                        X1: parseInt($('X1').text()),
                        Y1: parseInt($('Y1').text()),
                        X2: parseInt($('X2').text()),
                        Y2: parseInt($('Y2').text()),
                    })
                })
                $('statenotify/lineInfo/item').forEach((element) => {
                    const $ = queryXml(element.element)
                    line.push({
                        X1: parseInt($('X1').text()),
                        Y1: parseInt($('Y1').text()),
                        X2: parseInt($('X2').text()),
                        Y2: parseInt($('Y2').text()),
                    })
                })
                formData.value.regionInfo = region[0]
                formData.value.cpcLineInfo = line[0]
            } else if ($("statenotify[@type='TripwireLine']").length > 0) {
                const alarmLine = pageData.value.chosenSurfaceIndex
                formData.value.lineInfo[alarmLine].startPoint = {
                    X: parseInt($('statenotify/startPoint').attr('X')),
                    Y: parseInt($('statenotify/startPoint').attr('Y')),
                }
                formData.value.lineInfo[alarmLine].endPoint = {
                    X: parseInt($('statenotify/endPoint').attr('X')),
                    Y: parseInt($('statenotify/endPoint').attr('Y')),
                }
            } else if ($("statenotify[@type='TripwireLineInfo']").length > 0) {
                const X = $('statenotify/PosInfo/X').text()
                const Y = $('statenotify/PosInfo/Y').text()
                formData.value.countOSD.X = parseInt(X)
                formData.value.countOSD.Y = parseInt(Y)
            }
        }

        watch(
            formData,
            () => {
                if (pageData.value.initComplete) {
                    pageData.value.applyDisable = false
                }
            },
            {
                deep: true,
            },
        )

        onMounted(() => {
            initPageData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                plugin.VideoPluginNotifyEmitter.removeListener(LiveNotify2Js)
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendAreaXML = OCX_XML_SetTripwireLineAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendAreaXML)
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }

            if (mode.value === 'h5') {
                player.destroy()
            }
        })

        return {
            playerRef,
            pageData,
            formData,
            handlePlayerReady,
            handleSchedulePopClose,
            handleFunctionTabClick,
            handlePassLineShowAllAreaChange,
            passLineClearArea,
            passLineClearAllArea,
            handleCpcDrawAvailableChange,
            handleLineChange,
            handleDirectionChange,
            handleOSDChange,
            handleReset,
            handleMoreClick,
            handleMorePopClose,
            clearCpcArea,
            handleApply,
            ScheduleManagPop,
            PassLineEmailPop,
        }
    },
})
