/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-11 15:00:19
 * @Description: 过线检测
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-30 13:47:17
 */
import { type chlCaps, type regionData, type emailData } from '@/types/apiType/aiAndEvent'
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
            type: Object as PropType<chlCaps>,
            required: true,
        },
        voiceList: {
            type: Array as PropType<{ value: string; label: string }[]>,
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
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const playerRef = ref<PlayerInstance>()
        const pluginStore = usePluginStore()
        const osType = getSystemInfo().platform
        let passLineDrawer: CanvasPassline
        let cpcDrawer: CanvasCpc
        const pageData = ref({
            // 当前选中的通道
            currChlId: '',
            // 当前选择通道数据
            chlData: {} as chlCaps,
            // 声音列表
            voiceList: [] as { value: string; label: string }[],
            // 是否支持声音设置
            supportAlarmAudioConfig: true,
            // 默认声音id
            defaultAudioId: '{00000000-0000-0000-0000-000000000000}',
            // 不支持功能提示页面是否展示
            notSupportTipShow: false,
            // 请求数据失败显示提示
            requireDataFail: false,
            // 排程管理
            scheduleManagePopOpen: false,
            scheduleDefaultId: '{00000000-0000-0000-0000-000000000000}',
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

            // CPC播放器设置
            // 是否显示CPC绘制控制 TODO 老代码写死不显示，并且不可画图
            showCpcDrawAvailable: false,
            // CPC绘制控制
            isCpcDrawAvailable: false,

            // passLine
            // apply按钮是否可用
            applyDisable: true,
            // 是否启用侦测
            passLineDetectionEnable: false,
            // 用于对比
            passLineOriginalEnable: false,
            // mutex
            passLineMutexList: [] as { object: string; status: boolean }[],
            passLineMutexListEx: [] as { object: string; status: boolean }[],
            // 排程
            passLineSchedule: '',
            // 持续时间
            passLineholdTime: 0,
            // 选择的警戒面
            chosenSurfaceIndex: 0,
            lineInfo: [] as { direction: CanvasPasslineDirection; startPoint: { X: number; Y: number }; endPoint: { X: number; Y: number }; configured: boolean }[],
            // 方向
            direction: '' as CanvasPasslineDirection,
            // 方向列表
            directionList: [] as { value: string; label: string }[],
            // OSD
            countOSD: {
                switch: false,
                X: 0,
                Y: 0,
                osdFormat: '',
            },
            // 是否启用自动重置
            autoReset: true,
            // 重置时间模式 day/week/month
            countTimeType: 'day',
            // 重置模式列表
            countCycleTypeList: [
                { value: 'day', label: Translate('IDCS_TIME_DAY') },
                { value: 'week', label: Translate('IDCS_TIME_WEEK') },
                { value: 'month', label: Translate('IDCS_TIME_MOUNTH') },
                // { value: 'off', label: Translate('IDCS_OFF') },
            ] as { value: string; label: string }[],
            // 三种模式的时间
            countPeriod: {
                day: {
                    date: '0',
                    dateTime: '00:00:00',
                } as { date: string; dateTime: string },
                week: {
                    date: '0',
                    dateTime: '00:00:00',
                } as { date: string; dateTime: string },
                month: {
                    date: '1',
                    dateTime: '00:00:00',
                } as { date: string; dateTime: string },
            } as Record<string, { date: string; dateTime: string }>,
            weekOption: [
                { value: '0', label: Translate('IDCS_WEEK_DAY_SEVEN') },
                { value: '1', label: Translate('IDCS_WEEK_DAY_ONE') },
                { value: '2', label: Translate('IDCS_WEEK_DAY_TWO') },
                { value: '3', label: Translate('IDCS_WEEK_DAY_THREE') },
                { value: '4', label: Translate('IDCS_WEEK_DAY_FOUR') },
                { value: '5', label: Translate('IDCS_WEEK_DAY_FIVE') },
                { value: '6', label: Translate('IDCS_WEEK_DAY_SIX') },
            ] as { value: string; label: string }[],
            monthOption: [] as { value: string; label: string }[],

            // 更多弹窗数据
            morePopOpen: false,
            openCount: 0,
            // SD卡原图存储
            saveTargetPicture: false,
            // SD卡目标图存储
            saveSourcePicture: false,
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
            emailData: {} as emailData,

            // cpc TODO现无支持设备，无法测试
            // 是否启用侦测
            cpcDetectionEnable: false,
            // 用于对比
            cpcOriginalEnable: false,
            cpcMutexList: [] as { object: string; status: boolean }[],
            cpcMutexListEx: [] as { object: string; status: boolean }[],
            // cpcLineInfo: { X1: 100, Y1: 100, X2: 2000, Y2: 2000 } as regionData,
            // regionInfo: { X1: 100, Y1: 100, X2: 2000, Y2: 2000 } as regionData,
            cpcLineInfo: {} as regionData,
            regionInfo: {} as regionData,
            // 排程
            cpcSchedule: '',
            // 持续时间
            holdTime: 0,
            holdTimeList: [] as { value: number; label: string }[],
            // 灵敏度
            detectSensitivity: 0,
            detectSensitivityList: [] as { value: number; label: string }[],
            // 统计周期
            statisticalPeriod: ' ',
            statisticalPeriodList: [] as { value: string; label: string }[],
            // 进入阈值
            crossInAlarmNumValue: 0,
            // 离开阈值
            crossOutAlarmNumValue: 0,
            // 滞留阈值
            twoWayDiffAlarmNumValue: 0,

            // 检测目标
            hasObj: false,
            objectFilter: {
                person: false,
                car: false,
                motorcycle: false,
                personSensitivity: 0,
                carSensitivity: 0,
                motorSensitivity: 0,
            },
            // 音频联动
            audioSuport: false,
            triggerAudio: false,
            // 白光联动
            lightSuport: false,
            triggerWhiteLight: false,

            initComplete: false,
            drawInitCount: 0,
            eventTypeMapping: {
                faceDetect: Translate('IDCS_FACE_DETECTION') + '+' + Translate('IDCS_FACE_RECOGNITION'),
                faceMatch: Translate('IDCS_FACE_RECOGNITION'),
                tripwire: Translate('IDCS_BEYOND_DETECTION'),
                perimeter: Translate('IDCS_INVADE_DETECTION'),
            } as Record<string, string>,
            closeTip: {
                cdd: Translate('IDCS_CROWD_DENSITY_DETECTION'),
                cpc: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
                ipd: Translate('IDCS_INVADE_DETECTION'),
                tripwire: Translate('IDCS_BEYOND_DETECTION'),
                osc: Translate('IDCS_WATCH_DETECTION'),
                avd: Translate('IDCS_ABNORMAL_DETECTION'),
                perimeter: Translate('IDCS_INVADE_DETECTION'),
                vfd: Translate('IDCS_FACE_DETECTION'),
                aoientry: Translate('IDCS_INVADE_DETECTION'),
                aoileave: Translate('IDCS_INVADE_DETECTION'),
                passlinecount: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
                vehicle: Translate('IDCS_PLATE_DETECTION'),
                fire: Translate('IDCS_FIRE_POINT_DETECTION'),
                vsd: Translate('IDCS_VSD_DETECTION'),
            } as Record<string, string>,
            directionTypeTip: {
                none: 'A<->B',
                rightortop: 'A->B',
                leftorbotton: 'A<-B',
            } as Record<string, string>,
            HWDRLevel: {
                high: Translate('IDCS_HWDR_HIGH'),
                middle: Translate('IDCS_HWDR_MEDIUM'),
                low: Translate('IDCS_HWDR_LOW'),
            } as Record<string, string>,
            peopleCount: {
                all: Translate('IDCS_TIME_ALL'),
                daily: Translate('IDCS_TIME_DAY'),
                weekly: Translate('IDCS_TIME_WEEK'),
                monthly: Translate('IDCS_TIME_MOUNTH'),
            } as Record<string, string>,
            countCycleTypeTip: {
                day: Translate('IDCS_TIME_DAY'),
                week: Translate('IDCS_TIME_WEEK'),
                month: Translate('IDCS_TIME_MOUNTH'),
                off: Translate('IDCS_OFF'),
            } as Record<string, string>,
            weekMap: {
                '0': Translate('IDCS_WEEK_DAY_SEVEN'),
                '1': Translate('IDCS_WEEK_DAY_ONE'),
                '2': Translate('IDCS_WEEK_DAY_TWO'),
                '3': Translate('IDCS_WEEK_DAY_THREE'),
                '4': Translate('IDCS_WEEK_DAY_FOUR'),
                '5': Translate('IDCS_WEEK_DAY_FIVE'),
                '6': Translate('IDCS_WEEK_DAY_SIX'),
            } as Record<string, string>,
        })
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
                    if (pageData.value.chlData['supportPassLine']) {
                        passLineDrawer = new CanvasPassline({
                            el: canvas,
                            enableOSD: true,
                            enableShowAll: false,
                            onchange: passlineDrawChange,
                        })
                    } else if (pageData.value.chlData['supportCpc']) {
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
                plugin.AddPluginMoveEvent(document.getElementById('player') as HTMLElement)
                const sendXML = OCX_XML_SetPluginModel(osType == 'mac' ? 'TripwireConfig' : 'ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                plugin.DisplayOCX(true)
            }
        }
        //播放视频
        const play = () => {
            const { id, name } = pageData.value.chlData
            if (mode.value === 'h5') {
                player.play({
                    chlID: id,
                    streamType: 2,
                })
            } else if (mode.value === 'ocx') {
                if (osType == 'mac') {
                    const sendXML = OCX_XML_Preview({
                        winIndexList: [0],
                        chlIdList: [pageData.value.chlData['id']],
                        chlNameList: [pageData.value.chlData['name']],
                        streamType: 'sub',
                        chlIndexList: [pageData.value.chlData['id']],
                        chlTypeList: [pageData.value.chlData['chlType']],
                    })
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    plugin.RetryStartChlView(id, name)
                }
            }
        }
        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && pageData.value.chlData && pageData.value.initComplete) {
                nextTick(() => {
                    play()
                    if (pageData.value.chlData['supportPassLine']) {
                        if (mode.value === 'h5') {
                            passLineDrawer.setEnable('line', true)
                            passLineDrawer.setEnable('osd', pageData.value.countOSD.switch)
                            passLineDrawer.setOSD(pageData.value.countOSD)
                            passLineSetOcxData()
                        } else if (mode.value === 'ocx') {
                            const sendXML1 = OCX_XML_SetTripwireLineAction('EDIT_ON')
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                            const sendXML2 = OCX_XML_SetTripwireLineInfo(pageData.value['countOSD'])
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                            passLineSetOcxData()
                        }
                    } else if (pageData.value.chlData['supportCpc']) {
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
            pageData.value.scheduleList.map((item) => {
                item.value = item.value != '' ? item.value : pageData.value.scheduleDefaultId
            })
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
                    schedule = scheduleIdList.includes(schedule) ? schedule : pageData.value.scheduleDefaultId
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
            let sendXml = rawXml`<content><receiver>`
            pageData.value.receiverData.forEach((element) => {
                sendXml += rawXml`
                                <item>
                                    <address><![CDATA[${element['address']}]]></address>
                                    <schedule id="${element['schedule']}"></schedule>
                                </item>
                            `
            })
            sendXml += '</receiver></content>'
            await editEmailCfg(sendXml)
        }
        // 获取定时发送邮件配置
        const getTimingSendEmail = async () => {
            const res = await queryTimingSendEmail()
            const $res = queryXml(res)
            if ($res('status').text() == 'success') {
                $res('//content/chl').forEach((chl) => {
                    if (chl.attr('id') == pageData.value.currChlId) {
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
            const sendXML = rawXml`<content>
                                    <chl id="${pageData.value.currChlId}">
                                        <param>
                                            <item>
                                                <type>${pageData.value.sendEmailData.type}</type>
                                                <switch>${pageData.value.sendEmailData.enableSwitch.toString()}</switch>
                                                <dailyReportSwitch>${pageData.value.sendEmailData.dailyReportSwitch.toString()}</dailyReportSwitch>
                                                <weeklyReportSwitch>${pageData.value.sendEmailData.weeklyReportSwitch.toString()}</weeklyReportSwitch>
                                                <weeklyReportDate>${pageData.value.sendEmailData.weeklyReportDate}</weeklyReportDate>
                                                <mouthlyReportSwitch>${pageData.value.sendEmailData.mouthlyReportSwitch.toString()}</mouthlyReportSwitch>
                                                <mouthlyReportDate>${pageData.value.sendEmailData.mouthlyReportDate}</mouthlyReportDate>
                                                <reportHour>${pageData.value.sendEmailData.reportHour.toString()}</reportHour>
                                                <reportMin>${pageData.value.sendEmailData.reportMin.toString()}</reportMin>
                                            </item>
                                        </param>
                                    </chl>
                                </content>`
            await editTimingSendEmail(sendXML)
        }
        // 保存passLine排程
        const setScheduleGuid = () => {
            const sendXml = rawXml`<content>
                                <chl id="${pageData.value.currChlId}" scheduleGuid="${pageData.value['passLineSchedule']}">
                                <trigger></trigger>
                                </chl>
                              </content>`
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
            pageData.value.emailData.saveSourcePicture = pageData.value.saveSourcePicture
            pageData.value.emailData.saveTargetPicture = pageData.value.saveTargetPicture
            pageData.value.emailData.sendEmailData = pageData.value.sendEmailData
            pageData.value.emailData.receiverData = pageData.value.receiverData
            pageData.value.morePopOpen = true
            pageData.value.applyDisable = false
        }
        // 关闭更多弹窗，将数据传到pageData
        const handleMorePopClose = (e: emailData) => {
            const data = cloneDeep(e)
            pageData.value.saveSourcePicture = data.saveSourcePicture
            pageData.value.saveTargetPicture = data.saveTargetPicture
            pageData.value.sendEmailData = data.sendEmailData
            pageData.value.receiverData = data.receiverData
            pageData.value.morePopOpen = false
        }
        // tab点击事件
        const handleFunctionTabClick = async (pane: TabsPaneContext) => {
            pageData.value.fuction = pane.props.name?.toString() ? pane.props.name?.toString() : ''
            if (pageData.value.fuction == 'param') {
                if (pageData.value.chlData['supportPassLine']) {
                    if (mode.value === 'h5') {
                        passLineSetOcxData()
                        passLineDrawer.setEnable('line', true)
                        passLineDrawer.setEnable('osd', pageData.value.countOSD.switch)
                        passLineDrawer.setOSD(pageData.value.countOSD)
                    } else if (mode.value === 'ocx') {
                        setTimeout(() => {
                            const alarmLine = pageData.value.chosenSurfaceIndex
                            const plugin = playerRef.value!.plugin
                            const sendXML1 = OCX_XML_SetTripwireLine(pageData.value['lineInfo'][alarmLine])
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                            const sendXML2 = OCX_XML_SetTripwireLineAction('EDIT_ON')
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                            const sendXML3 = OCX_XML_SetTripwireLineInfo(pageData.value.countOSD)
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML3)
                        }, 100)
                    }
                } else if (pageData.value.chlData['supportCpc']) {
                    cpcDrawSetOcxData()
                    cpcDrawer.setEnable(true)
                }
            } else if (pageData.value.fuction == 'target') {
                if (pageData.value.chlData['supportPassLine']) {
                    if (mode.value === 'h5') {
                        passLineDrawer.clear()
                        passLineDrawer.setEnable('line', false)
                        passLineDrawer.setEnable('osd', false)
                        passLineDrawer.setOSD(pageData.value.countOSD)
                    } else if (mode.value === 'ocx') {
                        setTimeout(() => {
                            const plugin = playerRef.value!.plugin
                            const sendXML1 = OCX_XML_SetTripwireLineAction('NONE')
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                            const sendXML2 = OCX_XML_SetTripwireLineAction('EDIT_OFF')
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                            const sendXML3 = OCX_XML_SetTripwireLineInfo(pageData.value.countOSD)
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML3)
                        }, 100)
                    }
                } else if (pageData.value.chlData['supportCpc']) {
                    cpcDrawer.clear()
                    cpcDrawer.setEnable(false)
                }
            }
        }

        // 获取数据
        const getData = async (manualResetSwitch?: boolean) => {
            openLoading()
            if (pageData.value.chlData['supportPassLine']) {
                const sendXml = rawXml`<condition>
                                        <chlId>${pageData.value.currChlId}</chlId>
                                    </condition>
                                    <requireField>
                                        <param/>
                                    </requireField>`
                const res = await queryPls(sendXml)
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    const countCycleTypeList: { value: string; label: string }[] = []
                    $('//types/countCycleType/enum').forEach((element) => {
                        const itemValue = element.text()
                        countCycleTypeList.push({ value: itemValue, label: pageData.value.countCycleTypeTip[itemValue] })
                    })
                    const directionList: { value: string; label: string }[] = []
                    $('//types/direction/enum').forEach((element) => {
                        const itemValue = element.text()
                        directionList.push({ value: itemValue, label: pageData.value.directionTypeTip[itemValue] })
                    })
                    const mutexList: { object: string; status: boolean }[] = []
                    $('//content/chl/param/mutexList/item').forEach((element) => {
                        const $ = queryXml(element.element)
                        mutexList.push({ object: $('object').text(), status: $('status').text() == 'true' })
                    })
                    const mutexListEx: { object: string; status: boolean }[] = []
                    $('//content/chl/param/mutexListEx/item').forEach((element) => {
                        const $ = queryXml(element.element)
                        mutexListEx.push({ object: $('object').text(), status: $('status').text() == 'true' })
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
                    const lineInfo: { direction: CanvasPasslineDirection; startPoint: { X: number; Y: number }; endPoint: { X: number; Y: number }; configured: boolean }[] = []
                    $('//content/chl/param/line/item').forEach((element) => {
                        const $ = queryXml(element.element)
                        const direction: CanvasPasslineDirection = $('direction').text() as CanvasPasslineDirection
                        const line = {
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
                        lineInfo.push(line)
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

                    pageData.value.passLineSchedule = schedule
                        ? pageData.value.scheduleList.some((item: { value: string; label: string }) => item.value == schedule)
                            ? schedule
                            : pageData.value.scheduleDefaultId
                        : pageData.value.scheduleDefaultId
                    pageData.value.passLineholdTime = Number(holdTime)
                    pageData.value.countCycleTypeList = countCycleTypeList.filter((item) => item.value !== 'off')
                    pageData.value.directionList = directionList
                    pageData.value.passLineMutexList = mutexList
                    pageData.value.passLineMutexListEx = mutexListEx
                    pageData.value.countOSD = countOSD
                    pageData.value.objectFilter = objectFilter
                    pageData.value.countTimeType = countTimeType !== 'off' ? countTimeType : 'day'
                    pageData.value.countPeriod = countPeriod
                    pageData.value.passLineDetectionEnable = enabledSwitch
                    pageData.value.passLineOriginalEnable = enabledSwitch
                    pageData.value.triggerAudio = triggerAudio
                    pageData.value.triggerWhiteLight = triggerWhiteLight
                    pageData.value.saveTargetPicture = saveTargetPicture
                    pageData.value.saveSourcePicture = saveSourcePicture
                    pageData.value.lineInfo = lineInfo
                    pageData.value.applyDisable = true
                    pageData.value.direction = lineInfo[0].direction
                    pageData.value.autoReset = countTimeType !== 'off'
                    if (pageData.value.countOSD.switch) {
                        if (mode.value === 'ocx') {
                            const sendXML = OCX_XML_SetTripwireLineInfo(pageData.value['countOSD'])
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        } else {
                            passLineDrawer.setEnable('osd', pageData.value['countOSD']['switch'])
                            passLineDrawer.setOSD(pageData.value['countOSD'])
                        }
                    }
                } else {
                    pageData.value.requireDataFail = true
                }
            } else if (pageData.value.chlData['supportCpc']) {
                // TODO 现无测试机器，暂时不做处理
                const sendXml = rawXml`<condition>
                                            <chlId>${pageData.value.currChlId}</chlId>
                                        </condition>
                                        <requireField>
                                            <param/>
                                        </requireField>`
                const res = await queryCpc(sendXml)
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    let holdTimeList: { value: number; label: string }[] = []
                    const holdTimeArr = $('//content/chl/param/holdTimeNote').text().split(',')
                    holdTimeArr.forEach((element) => {
                        holdTimeList.push({ value: Number(element), label: element })
                    })
                    const holdTime = Number($('//content/chl/param/holdTime').text())
                    if (!holdTimeArr.includes(holdTime.toString())) {
                        holdTimeArr.push(holdTime.toString())
                        holdTimeList = formatHoldTime(holdTimeArr)
                    }
                    const detectSensitivityList: { value: number; label: string }[] = []
                    $('//types/detectSensitivity/enum').forEach((element) => {
                        const itemValue = Number(element.text())
                        detectSensitivityList.push({ value: itemValue, label: itemValue.toString() })
                    })
                    const statisticalPeriodList: { value: string; label: string }[] = []
                    $('//types/statisticalPeriod/enum').forEach((element) => {
                        const itemValue = element.text()
                        statisticalPeriodList.push({ value: itemValue, label: pageData.value.peopleCount[itemValue] })
                    })
                    let regionInfo = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
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
                    let lineInfo = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
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
                    const mutexList: { object: string; status: boolean }[] = []
                    $('//content/chl/param/mutexList/item').forEach((element) => {
                        const $ = queryXml(element.element)
                        mutexList.push({ object: $('object').text(), status: $('status').text() == 'true' })
                    })
                    const mutexListEx: { object: string; status: boolean }[] = []
                    $('//content/chl/param/mutexListEx/item').forEach((element) => {
                        const $ = queryXml(element.element)
                        mutexListEx.push({ object: $('object').text(), status: $('status').text() == 'true' })
                    })
                    const enabledSwitch = $('//content/chl/param/switch').text() == 'true'
                    const detectSensitivity = Number($('//content/chl/param/detectSensitivity').text())
                    const statisticalPeriod = $('//content/chl/param/statisticalPeriod').text()
                    const crossInAlarmNumValue = Number($('//content/chl/param/crossInAlarmNum').text())
                    const crossOutAlarmNumValue = Number($('//content/chl/param/crossOutAlarmNum').text())
                    const twoWayDiffAlarmNumValue = Number($('//content/chl/param/twoWayDiffAlarmNum').text())
                    const cpcSchedule = $('//content/chl').attr('scheduleGuid')
                    pageData.value.cpcSchedule =
                        cpcSchedule == ''
                            ? pageData.value.scheduleList.some((item: { value: string; label: string }) => item.value == cpcSchedule)
                                ? cpcSchedule
                                : pageData.value.scheduleDefaultId
                            : pageData.value.scheduleDefaultId
                    pageData.value.cpcDetectionEnable = enabledSwitch
                    pageData.value.cpcOriginalEnable = enabledSwitch
                    pageData.value.holdTime = holdTime
                    pageData.value.detectSensitivity = detectSensitivity
                    pageData.value.statisticalPeriod = statisticalPeriod
                    pageData.value.crossInAlarmNumValue = crossInAlarmNumValue
                    pageData.value.crossOutAlarmNumValue = crossOutAlarmNumValue
                    pageData.value.twoWayDiffAlarmNumValue = twoWayDiffAlarmNumValue
                    pageData.value.cpcMutexList = mutexList
                    pageData.value.cpcMutexListEx = mutexListEx
                    pageData.value.holdTimeList = holdTimeList
                    pageData.value.detectSensitivityList = detectSensitivityList
                    pageData.value.statisticalPeriodList = statisticalPeriodList
                    pageData.value.regionInfo = regionInfo
                    pageData.value.cpcLineInfo = lineInfo
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
                    <chl id="${pageData.value.currChlId}">
                        <param>
                            <switch>${pageData.value['passLineDetectionEnable'].toString()}</switch>
                            <alarmHoldTime unit="s">${pageData.value['passLineholdTime'].toString()}</alarmHoldTime>
                            <objectFilter>
                                <car>
                                    <switch>${pageData.value['objectFilter']['car'].toString()}</switch>
                                    <sensitivity>${pageData.value['objectFilter']['carSensitivity'].toString()}</sensitivity>
                                </car>
                                <person>
                                    <switch>${pageData.value['objectFilter']['person'].toString()}</switch>
                                    <sensitivity>${pageData.value['objectFilter']['personSensitivity'].toString()}</sensitivity>
                                </person>
                                ${
                                    pageData.value['chlData']['accessType'] == '0'
                                        ? rawXml`
                                            <motor>
                                                <switch>${pageData.value['objectFilter']['motorcycle'].toString()}</switch>
                                                <sensitivity>${pageData.value['objectFilter']['motorSensitivity'].toString()}</sensitivity>
                                            </motor>
                                        `
                                        : ''
                                }
                            </objectFilter>
                            <countPeriod>
                                <countTimeType>${pageData.value['countTimeType']}</countTimeType>
                                <day>
                                    <dateSpan>${pageData.value['countPeriod']['day']['date']}</dateSpan>
                                    <dateTimeSpan>${pageData.value['countPeriod']['day']['dateTime']}</dateTimeSpan>
                                </day>
                                <week>
                                    <dateSpan>${pageData.value['countPeriod']['week']['date']}</dateSpan>
                                    <dateTimeSpan>${pageData.value['countPeriod']['week']['dateTime']}</dateTimeSpan>
                                </week>
                                <month>
                                    <dateSpan>${pageData.value['countPeriod']['month']['date']}</dateSpan>
                                    <dateTimeSpan>${pageData.value['countPeriod']['month']['dateTime']}</dateTimeSpan>
                                </month>
                            </countPeriod>
                            <countOSD>
                                <switch>${pageData.value['countOSD']['switch'].toString()}</switch>
                                <X>${Math.round(pageData.value['countOSD']['X']).toString()}</X>
                                <Y>${Math.round(pageData.value['countOSD']['Y']).toString()}</Y>
                                <osdFormat>${pageData.value['countOSD']['osdFormat']}</osdFormat>
                            </countOSD>
                            ${pageData.value['chlData']['supportAudio'] ? `<triggerAudio>${pageData.value['triggerAudio']}</triggerAudio>` : ''}
                            ${pageData.value['chlData']['supportWhiteLight'] ? `<triggerWhiteLight>${pageData.value['triggerWhiteLight']}</triggerWhiteLight>` : ''}
                            <saveTargetPicture>${pageData.value['saveTargetPicture'].toString()}</saveTargetPicture>
                            <saveSourcePicture>${pageData.value['saveSourcePicture'].toString()}</saveSourcePicture>
                            <line type="list" count="${pageData.value['lineInfo'].length.toString()}">
                                <itemType>
                                    <direction type="direction"/>
                                </itemType>
                                ${pageData.value['lineInfo']
                                    .map(
                                        (element) => rawXml`
                                            <item>
                                                <direction type="direction">${element['direction']}</direction>
                                                <startPoint>
                                                    <X>${Math.round(element['startPoint']['X']).toString()}</X>
                                                    <Y>${Math.round(element['startPoint']['Y']).toString()}</Y>
                                                </startPoint>
                                                <endPoint>
                                                    <X>${Math.round(element['endPoint']['X']).toString()}</X>
                                                    <Y>${Math.round(element['endPoint']['Y']).toString()}</Y>
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
            const regionInfo = pageData.value['regionInfo']
            const cpcLineInfo = pageData.value['cpcLineInfo']
            const sendXml = rawXml`
                        <content>
                            <chl id="${pageData.value.currChlId}" scheduleGuid="${pageData.value['cpcSchedule']}">
                                <param>
                                    <switch>${pageData.value['cpcDetectionEnable'].toString()}</switch>
                                    <detectSensitivity>${pageData.value['detectSensitivity'].toString()}</detectSensitivity>
                                    <statisticalPeriod>${pageData.value['statisticalPeriod']}</statisticalPeriod>
                                    <crossOutAlarmNum>${pageData.value['crossOutAlarmNumValue'].toString()}</crossOutAlarmNum>
                                    <crossInAlarmNum>${pageData.value['crossInAlarmNumValue'].toString()}</crossInAlarmNum>
                                    <twoWayDiffAlarmNum>${pageData.value['twoWayDiffAlarmNumValue'].toString()}</twoWayDiffAlarmNum>
                                    <holdTime unit="s">${pageData.value['holdTime'].toString()}</holdTime>
                                    <regionInfo type="list">
                                            <item>
                                                <X1>${regionInfo['X1'].toString()}</X1>
                                                <Y1>${regionInfo['Y1'].toString()}</Y1>
                                                <X2>${regionInfo['X2'].toString()}</X2>
                                                <Y2>${regionInfo['Y2'].toString()}</Y2>
                                            </item>
                                    </regionInfo>
                                    <lineInfo type="list">
                                            <item>
                                                <X1>${cpcLineInfo['X1'].toString()}</X1>
                                                <Y1>${cpcLineInfo['Y1'].toString()}</Y1>
                                                <X2>${cpcLineInfo['X2'].toString()}</X2>
                                                <Y2>${cpcLineInfo['Y2'].toString()}</Y2>
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
                if (pageData.value['cpcDetectionEnable']) {
                    pageData.value['cpcOriginalEnable'] = true
                }
                pageData.value.applyDisable = true
            }
        }
        // 保存
        const handleApply = async () => {
            if (pageData.value.chlData['supportPassLine']) {
                let isSwitchChange = false
                const switchChangeTypeArr: string[] = []

                if (pageData.value['passLineDetectionEnable'] && pageData.value['passLineDetectionEnable'] !== pageData.value['passLineOriginalEnable']) {
                    isSwitchChange = true
                }

                const mutexChlNameObj = getMutexChlNameObj()

                pageData.value['passLineMutexList'].forEach((ele) => {
                    if (ele['status']) {
                        const prefixName = mutexChlNameObj['normalChlName'] ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj['normalChlName']) : ''
                        const showInfo = prefixName ? prefixName + pageData.value.closeTip[ele['object']].toLowerCase() : pageData.value.closeTip[ele['object']]
                        switchChangeTypeArr.push(showInfo)
                    }
                })

                pageData.value['passLineMutexListEx'].forEach((ele) => {
                    if (ele['status']) {
                        const prefixName = mutexChlNameObj['thermalChlName'] ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj['thermalChlName']) : ''
                        const showInfo = prefixName ? prefixName + pageData.value.closeTip[ele['object']].toLowerCase() : pageData.value.closeTip[ele['object']]
                        switchChangeTypeArr.push(showInfo)
                    }
                })

                if (isSwitchChange && switchChangeTypeArr.length > 0) {
                    const switchChangeType = switchChangeTypeArr.join(',')
                    openMessageTipBox({
                        type: 'question',
                        message: Translate('IDCS_SIMPLE_PASSLINE_DETECT_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + pageData.value['chlData']['name'], switchChangeType),
                    }).then(() => {
                        savePassLineData()
                    })
                } else {
                    savePassLineData()
                }
            } else if (pageData.value.chlData['supportCpc']) {
                let isSwitchChange = false
                const switchChangeTypeArr: string[] = []

                if (pageData.value['cpcDetectionEnable'] && pageData.value['cpcDetectionEnable'] !== pageData.value['cpcOriginalEnable']) {
                    isSwitchChange = true
                }

                const mutexChlNameObj = getMutexChlNameObj()

                pageData.value['cpcMutexList'].forEach((ele) => {
                    if (ele['status']) {
                        const prefixName = mutexChlNameObj['normalChlName'] ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj['normalChlName']) : ''
                        const showInfo = prefixName ? prefixName + pageData.value.closeTip[ele['object']].toLowerCase() : pageData.value.closeTip[ele['object']]
                        switchChangeTypeArr.push(showInfo)
                    }
                })

                pageData.value['cpcMutexListEx'].forEach((ele) => {
                    if (ele['status']) {
                        const prefixName = mutexChlNameObj['thermalChlName'] ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj['thermalChlName']) : ''
                        const showInfo = prefixName ? prefixName + pageData.value.closeTip[ele['object']].toLowerCase() : pageData.value.closeTip[ele['object']].toLowerCase()
                        switchChangeTypeArr.push(showInfo)
                    }
                })

                if (isSwitchChange && switchChangeTypeArr.length > 0) {
                    const switchChangeType = switchChangeTypeArr.join(',')
                    openMessageTipBox({
                        type: 'question',
                        message: Translate('IDCS_SIMPLE_PASSLINE_DETECT_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + pageData.value['chlData']['name'], switchChangeType),
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
            const sendXml = rawXml`<content>
                                    <chl id="${pageData.value.currChlId}">
                                        <param>
                                            <forceReset>true</forceReset>
                                        </param>
                                    </chl>
                                </content>`
            const res = await editPls(sendXml)
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                openMessageTipBox({
                    type: 'success',
                    message: Translate('IDCS_RESET_SUCCESSED'),
                })
            } else {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_SAVE_DATA_FAIL'),
                })
            }
            // 重置的参数不包括开关, 故记下过线统计的开关
            const manualResetSwitch = pageData.value.passLineDetectionEnable
            getData(manualResetSwitch)
        }
        // cpc手动重置请求
        const cpcManualResetData = async () => {
            const sendXml = rawXml`<content><chl id="${pageData.value.currChlId}"></chl></content>`
            const res = await forceResetCpc(sendXml)
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                openMessageTipBox({
                    type: 'success',
                    message: Translate('IDCS_RESET_SUCCESSED'),
                })
            } else {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_SAVE_DATA_FAIL'),
                })
            }
        }
        // 执行手动重置
        const handleReset = () => {
            if (pageData.value.chlData['supportPassLine']) {
                openMessageTipBox({
                    type: 'question',
                    message: Translate('IDCS_RESET_TIP'),
                }).then(() => {
                    passLineManualResetData()
                })
            } else if (pageData.value.chlData['supportCpc']) {
                openMessageTipBox({
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
            pageData.value.currChlId = props.currChlId
            pageData.value.chlData = props.chlData
            pageData.value.voiceList = props.voiceList
            // pageData.value.chlData['supportPassLine'] = false
            // pageData.value.chlData['supportCpc'] = true
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
                if (pageData.value.chlData['supportPassLine']) {
                    if (mode.value === 'h5') {
                        passLineDrawer.setEnable('line', true)
                        if (pageData.value['countOSD'].switch) {
                            passLineDrawer.setEnable('osd', pageData.value.countOSD.switch)
                            passLineDrawer.setOSD(pageData.value['countOSD'])
                        }
                    } else {
                        const sendXML1 = OCX_XML_SetTripwireLineAction('EDIT_ON')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                        if (pageData.value['countOSD'].switch) {
                            const sendXML2 = OCX_XML_SetTripwireLineInfo(pageData.value['countOSD'])
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                        }
                    }
                    passLineSetOcxData()
                } else if (pageData.value.chlData['supportCpc']) {
                    // cpcDrawer.setEnable(true)
                    cpcDrawSetOcxData()
                }
                clearTimeout(pageTimer)
            }, 250)

            pageData.value.initComplete = true
        }
        // passLine选择警戒线
        const handleLineChange = () => {
            pageData.value.direction = pageData.value.lineInfo[pageData.value.chosenSurfaceIndex].direction
            passLineSetOcxData()
        }
        // passLine选择方向
        const handleDirectionChange = () => {
            pageData.value.lineInfo[pageData.value.chosenSurfaceIndex].direction = pageData.value.direction
            passLineSetOcxData()
            pageData.value.applyDisable = false
        }
        // passLine OSD变化
        const handleOSDChange = () => {
            if (mode.value === 'h5') {
                passLineDrawer.setEnable('osd', pageData.value.countOSD.switch)
                passLineDrawer.setOSD(pageData.value.countOSD)
            } else {
                const plugin = playerRef.value!.plugin
                const sendXML = OCX_XML_SetTripwireLineInfo(pageData.value['countOSD'])
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            pageData.value.applyDisable = false
        }

        // 获取mutexobj
        const getMutexChlNameObj = () => {
            let normalChlName = ''
            let thermalChlName = ''
            const sameIPChlList: { id: string; ip: string; name: string; accessType: string }[] = []
            const chlIp = pageData.value.chlData['ip']
            props.onlineChannelList.forEach((chl) => {
                if (chl['ip'] == chlIp) {
                    sameIPChlList.push(chl)
                }
            })
            if (sameIPChlList.length > 1) {
                sameIPChlList.forEach((chl) => {
                    if (chl['accessType'] == '1') {
                        thermalChlName = chl['name'] == pageData.value.chlData['name'] ? '' : chl['name']
                    } else {
                        normalChlName = chl['name'] == pageData.value.chlData['name'] ? '' : chl['name']
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
            const timeList: { value: number; label: string }[] = []
            holdTimeList.forEach((ele) => {
                const element = Number(ele)
                const itemText = element == 60 ? '1 ' + Translate('IDCS_MINUTE') : element > 60 ? element / 60 + ' ' + Translate('IDCS_MINUTES') : element + ' ' + Translate('IDCS_SECONDS')
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
            pageData.value['lineInfo'][alarmLine]['startPoint'] = {
                X: passline.startX,
                Y: passline.startY,
            }
            pageData.value['lineInfo'][alarmLine]['endPoint'] = {
                X: passline.endX,
                Y: passline.endY,
            }
            pageData.value['countOSD']['X'] = osdInfo.X
            pageData.value['countOSD']['Y'] = osdInfo.Y
            // if (pageData.value.isShowAllArea) {
            //     passLineShowAllArea(true)
            // }
            pageData.value.applyDisable = false
        }
        // passLine绘图
        const passLineSetOcxData = () => {
            const alarmLine = pageData.value.chosenSurfaceIndex
            const plugin = playerRef.value!.plugin
            if (pageData.value['lineInfo'].length > 0) {
                if (mode.value === 'h5') {
                    passLineDrawer.setCurrentSurfaceOrAlarmLine(alarmLine)
                    passLineDrawer.setDirection(pageData.value['lineInfo'][alarmLine]['direction'])
                    passLineDrawer.setPassline({
                        startX: pageData.value['lineInfo'][alarmLine]['startPoint'].X,
                        startY: pageData.value['lineInfo'][alarmLine]['startPoint'].Y,
                        endX: pageData.value['lineInfo'][alarmLine]['endPoint'].X,
                        endY: pageData.value['lineInfo'][alarmLine]['endPoint'].Y,
                    })
                } else {
                    const sendXML = OCX_XML_SetTripwireLine(pageData.value['lineInfo'][alarmLine])
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }
            if (pageData.value['countOSD']['switch']) {
                if (mode.value !== 'h5') {
                    const sendXML = OCX_XML_SetTripwireLineInfo(pageData.value['countOSD'])
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    passLineDrawer.setEnable('osd', true)
                    passLineDrawer.setOSD(pageData.value['countOSD'])
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
                const lineInfoList = pageData.value['lineInfo']
                const currentAlarmLine = pageData.value.chosenSurfaceIndex
                if (mode.value === 'h5') {
                    passLineDrawer.setCurrentSurfaceOrAlarmLine(currentAlarmLine)
                    passLineDrawer.drawAllPassline(lineInfoList, currentAlarmLine)
                } else {
                    console.log('ocx show all alarm area')
                    const pluginLineInfoList = JSON.parse(JSON.stringify(lineInfoList))
                    pluginLineInfoList.splice(currentAlarmLine, 1) // 插件端下发全部区域需要过滤掉当前区域数据
                    const sendXML = OCX_XML_SetAllArea({ lineInfoList: pluginLineInfoList }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, true)
                    if (sendXML) {
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                }
            } else {
                if (mode.value !== 'h5') {
                    const sendXML = OCX_XML_SetAllArea({ lineInfoList: [] }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, false)
                    if (sendXML) {
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
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
            pageData.value['lineInfo'][currentAlarmLine]['startPoint'] = { X: 0, Y: 0 }
            pageData.value['lineInfo'][currentAlarmLine]['endPoint'] = { X: 0, Y: 0 }
            if (pageData.value.isShowAllArea) {
                passLineShowAllArea(true)
            }
            pageData.value.applyDisable = false
        }
        // passLine清空所有区域
        const passLineClearAllArea = () => {
            const plugin = playerRef.value!.plugin

            const lineInfoList = pageData.value['lineInfo']
            lineInfoList.forEach((lineInfo) => {
                lineInfo['startPoint'] = { X: 0, Y: 0 }
                lineInfo['endPoint'] = { X: 0, Y: 0 }
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
            pageData.value.applyDisable = false
        }
        // passLine刷新
        const passLineRefreshInitPage = () => {
            const lineInfoList = pageData.value['lineInfo']
            lineInfoList.forEach((lineInfo) => {
                if (lineInfo && lineInfo['startPoint'].X == 0 && lineInfo['startPoint'].Y == 0 && lineInfo['endPoint'].X == 0 && lineInfo['endPoint'].Y == 0) {
                    lineInfo.configured = false
                } else {
                    lineInfo.configured = true
                }
            })
            // 是否显示全部区域切换按钮和清除全部按钮（区域数量大于等于2时才显示）
            if (pageData.value['lineInfo'].length > 1) {
                pageData.value.showAllAreaVisible = true
                pageData.value.clearAllVisible = true
            } else {
                pageData.value.showAllAreaVisible = false
                pageData.value.clearAllVisible = false
            }
        }

        // CPC绘图变化
        const cpcDrawChange = (regionInfo: regionData, arrowlineInfo: regionData) => {
            pageData.value.regionInfo = regionInfo
            pageData.value.cpcLineInfo = arrowlineInfo
            pageData.value.applyDisable = false
        }
        // CPC绘图
        const cpcDrawSetOcxData = () => {
            if (mode.value === 'h5') {
                cpcDrawer.setRegionInfo(pageData.value['regionInfo'])
                cpcDrawer.setLineInfo(pageData.value['cpcLineInfo'])
            } else {
                const sendXML = OCX_XML_SetCpcArea(pageData.value['regionInfo'], pageData.value['cpcLineInfo'])
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
            pageData.value.regionInfo = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
            pageData.value.applyDisable = false
        }
        const LiveNotify2Js = ($: (path: string) => XmlResult) => {
            if ($("statenotify[@type='CpcParam']").length > 0) {
                const region: regionData[] = []
                const line: regionData[] = []
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
                pageData.value['regionInfo'] = region[0]
                pageData.value['cpcLineInfo'] = line[0]
                pageData.value.applyDisable = false
            } else if ($("statenotify[@type='TripwireLine']").length > 0) {
                const alarmLine = pageData.value.chosenSurfaceIndex
                pageData.value['lineInfo'][alarmLine]['startPoint'] = {
                    X: parseInt($('statenotify/startPoint').attr('X')),
                    Y: parseInt($('statenotify/startPoint').attr('Y')),
                }
                pageData.value['lineInfo'][alarmLine]['endPoint'] = {
                    X: parseInt($('statenotify/endPoint').attr('X')),
                    Y: parseInt($('statenotify/endPoint').attr('Y')),
                }
                pageData.value.applyDisable = false
            } else if ($("statenotify[@type='TripwireLineInfo']").length > 0) {
                const X = $('statenotify/PosInfo/X').text()
                const Y = $('statenotify/PosInfo/Y').text()
                pageData.value['countOSD']['X'] = parseInt(X)
                pageData.value['countOSD']['Y'] = parseInt(Y)
                pageData.value.applyDisable = false
            }
        }
        onMounted(async () => {
            await initPageData()
        })
        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                plugin.VideoPluginNotifyEmitter.removeListener(LiveNotify2Js)
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendAreaXML = OCX_XML_SetTripwireLineAction('NONE')
                plugin.GetVideoPlugin().ExecuteCmd(sendAreaXML)
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                plugin.CloseCurPlugin(document.getElementById('player'))
            }
            if (mode.value === 'h5') {
                player.destroy()
            }
        })
        return {
            playerRef,
            pageData,
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
