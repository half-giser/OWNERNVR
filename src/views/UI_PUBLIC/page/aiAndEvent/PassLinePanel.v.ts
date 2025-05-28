/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-11 15:00:19
 * @Description: 过线检测
 */
import PassLineEmailPop from './PassLineEmailPop.vue'
import { type XMLQuery } from '@/utils/xmlParse'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import AlarmBaseIPSpeakerSelector from './AlarmBaseIPSpeakerSelector.vue'

export default defineComponent({
    components: {
        PassLineEmailPop,
        AlarmBaseRecordSelector,
        AlarmBaseAlarmOutSelector,
        AlarmBaseTriggerSelector,
        AlarmBasePresetSelector,
        AlarmBaseIPSpeakerSelector,
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

        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        const playerRef = ref<PlayerInstance>()

        const DIRECTION_TYPE: Record<string, string> = {
            none: 'A<->B',
            rightortop: 'A->B',
            leftorbotton: 'A<-B',
        }

        const PERIOD_MAPPING: Record<string, string> = {
            all: Translate('IDCS_TIME_ALL'),
            daily: Translate('IDCS_TIME_DAY'),
            weekly: Translate('IDCS_TIME_WEEK'),
            monthly: Translate('IDCS_TIME_MOUNTH'),
        }

        const COUNT_CYCLE_TYPE_MAPPING: Record<string, string> = {
            day: Translate('IDCS_TIME_DAY'),
            week: Translate('IDCS_TIME_WEEK'),
            month: Translate('IDCS_TIME_MOUNTH'),
            off: Translate('IDCS_OFF'),
        }

        const DIRECTION_TYPE_MAPPING: Record<string, string> = {
            rightortop: 'A->B',
            leftorbotton: 'A<-B',
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
            // 控制显示最值区域
            isShowDisplayRange: false,
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
            // 发件人的原始数据
            origSendEmailData: {
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
            // 收件人的原始数据
            origReceiverData: [] as AlarmPassLinesEmailDto['receiverData'],
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
            drawInitCount: 0,
            openCount: 0,
            // 更多弹窗数据
            morePopOpen: false,
            // 选择的警戒面
            surfaceIndex: 0,
            surfaceChecked: [] as number[],
        })

        const formData = ref(new AlarmPassLinesDto())
        const watchEdit = useWatchEditData(formData)

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']
        let passLineDrawer = CanvasPassline()
        let cpcDrawer = CanvasCpc()

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
            const surfaceIndex = pageData.value.surfaceIndex
            const haslineInfo = formData.value.line.length > 0
            return haslineInfo && formData.value.line[surfaceIndex].objectFilter.supportPerson
        })

        // 显示车的勾选框 + 灵敏度配置项
        const showAllCarTarget = computed(() => {
            const surfaceIndex = pageData.value.surfaceIndex
            const haslineInfo = formData.value.line.length > 0
            return haslineInfo && formData.value.line[surfaceIndex].objectFilter.supportCar
        })

        // 显示摩托车的勾选框 + 灵敏度配置项
        const showAllMotorTarget = computed(() => {
            const surfaceIndex = pageData.value.surfaceIndex
            const haslineInfo = formData.value.line.length > 0
            return haslineInfo && formData.value.line[surfaceIndex].objectFilter.supportMotor
        })

        // 显示人的滞留报警阈值配置项
        const showPersonThreshold = computed(() => {
            const surfaceIndex = pageData.value.surfaceIndex
            const haslineInfo = formData.value.line.length > 0
            return haslineInfo && formData.value.line[surfaceIndex].objectFilter.person.supportAlarmThreshold
        })

        // 显示车的滞留报警阈值配置项
        const showCarThreshold = computed(() => {
            const surfaceIndex = pageData.value.surfaceIndex
            const haslineInfo = formData.value.line.length > 0
            return haslineInfo && formData.value.line[surfaceIndex].objectFilter.car.supportAlarmThreshold
        })

        // 显示非机动车的滞留报警阈值配置项
        const showMotorThreshold = computed(() => {
            const surfaceIndex = pageData.value.surfaceIndex
            const haslineInfo = formData.value.line.length > 0
            return haslineInfo && formData.value.line[surfaceIndex].objectFilter.motor.supportAlarmThreshold
        })

        /**
         * @description 播放器准备就绪回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                const canvas = player.getDrawbordCanvas()
                if (props.chlData.supportPassLine) {
                    passLineDrawer.destroy()
                    passLineDrawer = CanvasPassline({
                        el: canvas,
                        enableOSD: true,
                        enableShowAll: false,
                        onchange: changePassLine,
                    })
                } else if (props.chlData.supportCpc) {
                    cpcDrawer.destroy()
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
         * @description 获取收件人配置
         */
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
                pageData.value.origReceiverData = cloneDeep(pageData.value.receiverData)
            }
        }

        /**
         * @description 设置收件人配置
         */
        const setEmailCfg = async () => {
            // 数据未被修改，不下发编辑协议
            if (JSON.stringify(pageData.value.origReceiverData) === JSON.stringify(pageData.value.receiverData)) return
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
            const res = await editEmailCfg(sendXml)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.origReceiverData = cloneDeep(pageData.value.receiverData)
            }
        }

        /**
         * @description 获取定时发送邮件配置
         */
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
                        pageData.value.origSendEmailData = cloneDeep(pageData.value.sendEmailData)
                    }
                })
            }
        }

        /**
         * @description 设置定时发送邮件配置
         */
        const setTimingSendEmail = async () => {
            // 数据未被修改，不下发编辑协议
            if (JSON.stringify(pageData.value.origSendEmailData) === JSON.stringify(pageData.value.sendEmailData)) return
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
            const res = await editTimingSendEmail(sendXML)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.origSendEmailData = cloneDeep(pageData.value.sendEmailData)
            }
        }

        /**
         * @description 打开更多弹窗
         */
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

        /**
         * @description 关闭更多弹窗
         * @param {AlarmPassLinesEmailDto} e
         */
        const closeMorePop = (e: AlarmPassLinesEmailDto) => {
            const data = cloneDeep(e)
            formData.value.saveSourcePicture = data.saveSourcePicture
            formData.value.saveTargetPicture = data.saveTargetPicture
            pageData.value.sendEmailData = data.sendEmailData
            pageData.value.receiverData = data.receiverData
            pageData.value.morePopOpen = false
        }

        /**
         * @description 切换Tab
         */
        const changeTab = () => {
            if (pageData.value.tab === 'param') {
                if (props.chlData.supportPassLine) {
                    if (mode.value === 'h5') {
                        setPassLineOcxData()
                        passLineDrawer.setEnable('line', true)
                        passLineDrawer.setEnable('osd', false)
                        passLineDrawer.setOSD(formData.value.countOSD)
                    }

                    if (mode.value === 'ocx') {
                        setTimeout(() => {
                            const alarmLine = pageData.value.surfaceIndex
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
            } else if (pageData.value.tab === 'imageOSD') {
                showAllPassLineArea(false)
                if (props.chlData.supportPassLine) {
                    if (mode.value === 'h5') {
                        passLineDrawer.clear()
                        passLineDrawer.setEnable('line', false)
                        passLineDrawer.setEnable('osd', formData.value.countOSD.switch)
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
            } else if (pageData.value.tab === 'trigger') {
                showAllPassLineArea(false)

                if (mode.value === 'h5') {
                    passLineDrawer.clear()
                    passLineDrawer.setEnable('line', false)
                }

                if (mode.value === 'ocx') {
                    const sendXML1 = OCX_XML_SetTripwireLineAction('NONE')
                    plugin.ExecuteCmd(sendXML1)

                    const sendXML2 = OCX_XML_SetTripwireLineAction('EDIT_OFF')
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

            if (props.chlData.supportPassLine) {
                const sendXml = rawXml`
                    <condition>
                        <chlId>${props.currChlId}</chlId>
                    </condition>
                    <requireField>
                        <param/>
                        <trigger/>
                    </requireField>
                `
                const res = await queryPls(sendXml)
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

                    formData.value.directionList = $('types/direction/enum').map((element) => {
                        const itemValue = element.text()
                        return {
                            value: itemValue,
                            label: DIRECTION_TYPE_MAPPING[itemValue],
                        }
                    })

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

                    // 解析检测目标的数据
                    const objectFilterMode = getCurrentAICfgMode('line', $param)
                    pageData.value.objectFilterMode = objectFilterMode
                    const $paramObjectFilter = $('content/chl/param/objectFilter')
                    let objectFilter = ref(new AlarmObjectFilterCfgDto())
                    if (objectFilterMode === 'mode1') {
                        // 模式一
                        if ($param('objectFilter').text() !== '') {
                            objectFilter = getObjectFilterData(objectFilterMode, $paramObjectFilter, [])
                        }
                    }

                    $param('line/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        // 下列模式需要获取从line/item/objectFilter获取检测目标配置数据
                        const needResetObjectList = ['mode2', 'mode3', 'mode5']
                        const needResetObjectFilter = needResetObjectList.indexOf(objectFilterMode) > -1
                        if (needResetObjectFilter) {
                            // 模式2灵敏度相关数据从chl/param/objectFilter节点获取
                            const $resultNode = objectFilterMode === 'mode2' ? $paramObjectFilter : []
                            objectFilter = getObjectFilterData(objectFilterMode, $item('objectFilter'), $resultNode)
                        }

                        formData.value.line.push({
                            objectFilter: objectFilter.value,
                            direction: $item('direction').text() as CanvasPasslineDirection,
                            startPoint: {
                                X: $item('startPoint/X').text().num(),
                                Y: $item('startPoint/Y').text().num(),
                            },
                            endPoint: {
                                X: $item('endPoint/X').text().num(),
                                Y: $item('endPoint/Y').text().num(),
                            },
                        })
                    })
                    if (formData.value.line.length > 1) {
                        pageData.value.showAllAreaVisible = true
                        pageData.value.clearAllVisible = true
                    }
                    formData.value.direction = formData.value.line[pageData.value.surfaceIndex].direction
                    // 默认用line的第一个数据初始化检测目标
                    if (formData.value.line[0].objectFilter.detectTargetList.length) {
                        formData.value.detectTargetList = formData.value.line[0].objectFilter.detectTargetList.map((item) => {
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

                    const objectFilterData = formData.value.line[0].objectFilter
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

                    pageData.value.direction = formData.value.line[0].direction
                    pageData.value.directionList = $('types/direction/enum').map((element) => {
                        const itemValue = element.text()
                        return {
                            value: itemValue,
                            label: DIRECTION_TYPE[itemValue],
                        }
                    })

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
                            label: PERIOD_MAPPING[itemValue],
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
            } else {
                pageData.value.reqFail = true
                pageData.value.tab = ''
                closeLoading()
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
                paramXml = setObjectFilterXmlData(formData.value.line[0].objectFilter, props.chlData)
            }

            return paramXml
        }

        /**
         * @description 组装各个区域下的ObjectFilter节点数据
         */
        const setItemObjectFilterData = (item: { objectFilter: globalThis.AlarmObjectFilterCfgDto }) => {
            let paramXml = ''
            const singleDetectCfgList = ['mode2', 'mode3', 'mode5'] // 上述模式每个区域可单独配置检测目标或目标大小
            if (singleDetectCfgList.indexOf(pageData.value.objectFilterMode) !== -1) {
                paramXml += setObjectFilterXmlData(item.objectFilter, props.chlData)
            }

            return paramXml
        }

        /**
         * @description 保存PASSLINE配置
         */
        const savePassLineData = async () => {
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
                                                    ${setItemObjectFilterData(element)}
                                            </item>
                                        `,
                                    )
                                    .join('')}
                            </line>
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
            const res = await editPls(sendXml)
            const $ = queryXml(res)
            closeLoading()
            if ($('status').text() === 'success') {
                setEmailCfg()
                setTimingSendEmail()
                refreshInitPage()
                watchEdit.update()
            } else {
                openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
            }
        }

        /**
         * @description 保存CPC配置
         */
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
                tips: 'IDCS_SIMPLE_PASSLINE_DETECT_TIPS',
            }).then(() => {
                if (props.chlData.supportPassLine) {
                    savePassLineData()
                } else if (props.chlData.supportCpc) {
                    saveCpcData()
                }
            })
        }

        /**
         * @description PASSLINE手动重置
         */
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
                openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
            }
            // 重置的参数不包括开关, 故记下过线统计的开关
            const manualResetSwitch = formData.value.detectionEnable
            getData(manualResetSwitch)
        }

        /**
         * @description CPC手动重置
         */
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
                openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
            }
        }

        /**
         * @description 执行手动重置
         */
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
            const surfaceIndex = pageData.value.surfaceIndex
            const detectTarget = formData.value.detectTarget
            // 最小区域宽
            const minTextW = formData.value.line[surfaceIndex].objectFilter[detectTarget].minRegionInfo.width
            // 最小区域高
            const minTextH = formData.value.line[surfaceIndex].objectFilter[detectTarget].minRegionInfo.height
            // 最大区域宽
            const maxTextW = formData.value.line[surfaceIndex].objectFilter[detectTarget].maxRegionInfo.width
            // 最大区域高
            const maxTextH = formData.value.line[surfaceIndex].objectFilter[detectTarget].maxRegionInfo.height

            const errorMsg = Translate('IDCS_MIN_LESS_THAN_MAX')
            switch (type) {
                case 'minTextW':
                    if (minTextW >= maxTextW) {
                        openMessageBox(errorMsg)
                        formData.value.line[surfaceIndex].objectFilter[detectTarget].minRegionInfo.width = maxTextW - 1
                    }
                    break
                case 'minTextH':
                    if (minTextH >= maxTextH) {
                        openMessageBox(errorMsg)
                        formData.value.line[surfaceIndex].objectFilter[detectTarget].minRegionInfo.height = maxTextH - 1
                    }
                    break
                case 'maxTextW':
                    if (maxTextW <= minTextW) {
                        openMessageBox(errorMsg)
                        formData.value.line[surfaceIndex].objectFilter[detectTarget].maxRegionInfo.width = minTextW + 1
                    }
                    break
                case 'maxTextH':
                    if (maxTextH <= minTextH) {
                        openMessageBox(errorMsg)
                        formData.value.line[surfaceIndex].objectFilter[detectTarget].maxRegionInfo.height = minTextH + 1
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
                const currentSurface = pageData.value.surfaceIndex
                const currTargetType = formData.value.detectTarget // 人/车/非
                const minRegionInfo = formData.value.line[currentSurface].objectFilter[currTargetType].minRegionInfo // 最小区域
                const maxRegionInfo = formData.value.line[currentSurface].objectFilter[currTargetType].maxRegionInfo // 最大区域
                const minPercentW = minRegionInfo.width
                const minPercentH = minRegionInfo.height
                const maxPercentW = maxRegionInfo.width
                const maxPercentH = maxRegionInfo.height
                minRegionInfo.region = []
                maxRegionInfo.region = []
                minRegionInfo.region.push(calcRegionInfo(minPercentW, minPercentH))
                maxRegionInfo.region.push(calcRegionInfo(maxPercentW, maxPercentH))

                if (mode.value === 'h5') {
                    passLineDrawer.setRangeMin(minRegionInfo.region[0])
                    passLineDrawer.setRangeMax(maxRegionInfo.region[0])
                    passLineDrawer.toggleRange(true)
                }

                if (mode.value === 'ocx') {
                    // 插件需要先删除区域 再重新添加区域进行显示
                    const areaList = [1, 2]
                    const sendXMLClear = OCX_XML_DeleteRectangleArea(areaList)
                    plugin.ExecuteCmd(sendXMLClear)
                    const minRegionForPlugin = cloneDeep(minRegionInfo.region[0])
                    minRegionForPlugin.ID = 1
                    minRegionForPlugin.text = 'Min'
                    minRegionForPlugin.LineColor = 'yellow'
                    const maxRegionForPlugin = cloneDeep(maxRegionInfo.region[0])
                    maxRegionForPlugin.ID = 2
                    maxRegionForPlugin.text = 'Max'
                    maxRegionForPlugin.LineColor = 'yellow'
                    const rectangles = []
                    rectangles.push(minRegionForPlugin)
                    rectangles.push(maxRegionForPlugin)
                    const sendXML = OCX_XML_AddRectangleArea(rectangles)
                    plugin.ExecuteCmd(sendXML)
                }
            } else {
                if (mode.value === 'h5') {
                    passLineDrawer.toggleRange(false)
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
         * @description passLine选择警戒线
         */
        const changeLine = () => {
            pageData.value.direction = formData.value.line[pageData.value.surfaceIndex].direction
            setPassLineOcxData()
        }

        /**
         * @description passLine 切换方向
         */
        const changeDirection = () => {
            formData.value.line[pageData.value.surfaceIndex].direction = pageData.value.direction
            setPassLineOcxData()
        }

        /**
         * @description passLine 开关OSD
         */
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

        /**
         * @description passLine更新绘图区域
         * @param passline
         * @param osdInfo
         */
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
            const alarmLine = pageData.value.surfaceIndex
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

        /**
         * @description passLine绘图
         */
        const setPassLineOcxData = () => {
            const alarmLine = pageData.value.surfaceIndex
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

        /**
         * @description 执行是否显示全部区域
         */
        const togglePassLineShowAllArea = () => {
            showAllPassLineArea(pageData.value.isShowAllArea)
        }

        /**
         * @description passLine显示全部区域
         * @param {boolean} isShowAllArea
         */
        const showAllPassLineArea = (isShowAllArea: boolean) => {
            if (mode.value === 'h5') {
                passLineDrawer.setEnableShowAll(isShowAllArea)
            }

            if (isShowAllArea) {
                const lineInfoList = formData.value.line
                const currentAlarmLine = pageData.value.surfaceIndex
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

        /**
         * @description passLine清空当前区域
         */
        const clearArea = () => {
            if (mode.value === 'h5') {
                passLineDrawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetTripwireLineAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            const currentAlarmLine = pageData.value.surfaceIndex
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

        /**
         * @description passLine清空所有区域
         */
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
                passLineDrawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML1 = OCX_XML_SetAllArea({}, 'WarningLine', OCX_AI_EVENT_TYPE_TRIPWIRE_LINE, '', pageData.value.isShowAllArea)
                if (sendXML1) {
                    plugin.ExecuteCmd(sendXML1)
                }
                const sendXML = OCX_XML_SetTripwireLineAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description PASSLINE刷新
         */
        const refreshInitPage = () => {
            const lineInfoList = formData.value.line
            pageData.value.surfaceChecked = lineInfoList.map((lineInfo, index) => {
                if (lineInfo.startPoint.X || lineInfo.startPoint.Y || lineInfo.endPoint.X || lineInfo.endPoint.Y) {
                    return index
                }
                return -1
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

        /**
         * @description CPC绘图变化
         * @param {CanvasBaseArea} regionInfo
         * @param {CanvasBaseArea} arrowlineInfo
         */
        const changeCpc = (regionInfo: CanvasBaseArea, arrowlineInfo: CanvasBaseArea) => {
            formData.value.regionInfo = regionInfo
            formData.value.lineInfo = arrowlineInfo
        }

        /**
         * @description CPC绘图
         */
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

        /**
         * @description CPC清空当前区域
         */
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

        const notify = ($: XMLQuery, stateType: string) => {
            if (stateType === 'CpcParam') {
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
            }

            if (stateType === 'TripwireLine') {
                const alarmLine = pageData.value.surfaceIndex
                formData.value.line[alarmLine].startPoint = {
                    X: $('statenotify/startPoint').attr('X').num(),
                    Y: $('statenotify/startPoint').attr('Y').num(),
                }
                formData.value.line[alarmLine].endPoint = {
                    X: $('statenotify/endPoint').attr('X').num(),
                    Y: $('statenotify/endPoint').attr('Y').num(),
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
                const sendAreaXML = OCX_XML_SetTripwireLineAction('NONE')
                plugin.ExecuteCmd(sendAreaXML)

                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }

            passLineDrawer.destroy()
            cpcDrawer.destroy()
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
            showPersonThreshold,
            showCarThreshold,
            showMotorThreshold,
            handlePlayerReady,
            closeSchedulePop,
            changeTab,
            togglePassLineShowAllArea,
            toggleDisplayRange,
            showDisplayRange,
            checkMinMaxRange,
            blurDuration,
            clearArea,
            clearAllArea,
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
