/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 11:16:22
 * @Description: 越界
 */
import { type AlarmChlDto, type AlarmOnlineChlDto, AlarmTripwireDto, type CanvasPasslineDirection } from '@/types/apiType/aiAndEvent'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import CanvasPassline, { type CanvasPasslinePassline } from '@/utils/canvas/canvasPassline'
import ChannelPtzCtrlPanel from '@/views/UI_PUBLIC/page/channel/ChannelPtzCtrlPanel.vue'
import { cloneDeep } from 'lodash-es'
import { type XMLQuery } from '@/utils/xmlParse'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import AlarmBaseResourceData from './AlarmBaseResourceData.vue'

export default defineComponent({
    components: {
        ScheduleManagPop,
        ChannelPtzCtrlPanel,
        AlarmBaseRecordSelector,
        AlarmBaseAlarmOutSelector,
        AlarmBaseTriggerSelector,
        AlarmBasePresetSelector,
        AlarmBaseResourceData,
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
        const playerRef = ref<PlayerInstance>()
        let tripwireDrawer: ReturnType<typeof CanvasPassline>

        const directionTypeTip: Record<string, string> = {
            none: 'A<->B',
            rightortop: 'A->B',
            leftorbotton: 'A<-B',
        }

        const pageData = ref({
            // 是否支持声音设置
            supportAlarmAudioConfig: true,
            // 请求数据失败显示提示
            reqFail: false,
            // 选择的功能:param,target,trigger
            tab: 'param',
            // 排程管理
            isSchedulePop: false,
            scheduleList: [] as SelectOption<string, string>[],
            // 选择的警戒面
            chosenSurfaceIndex: 0,
            // 是否显示全部区域绑定值
            isShowAllArea: false,
            // 控制显示展示全部区域的checkbox
            showAllAreaVisible: false,
            // 控制显示清除全部区域按钮 >=2才显示
            clearAllVisible: false,
            // 云台speed
            tripWirespeed: 0,
            // 云台锁定状态
            lockStatus: false,
            moreDropDown: false,
        })

        const formData = ref(new AlarmTripwireDto())
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
                tripwireDrawer = CanvasPassline({
                    el: canvas,
                    enableOSD: true,
                    enableShowAll: false,
                    onchange: changeTripwire,
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

        // 首次加载成功 播放tripwire视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && watchEdit.ready.value) {
                nextTick(() => {
                    play()
                    changeTab()
                })
                stopWatchFirstPlay()
            }
        })

        // 修改越界播放器速度
        /**
         * @description 修改速度
         * @param {Number} speed
         */
        const setSpeed = (speed: number) => {
            pageData.value.tripWirespeed = speed
        }

        // 关闭排程管理后刷新排程列表
        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            formData.value.schedule = getScheduleId(pageData.value.scheduleList, formData.value.schedule)
        }

        // 获取越界检测数据
        const getTripwireData = async () => {
            openLoading()

            if (!props.chlData.supportTripwire && !props.chlData.supportBackTripwire && props.chlData.supportPeaTrigger) {
                const sendXML = rawXml`
                    <condition>
                        <chlId>${props.currChlId}</chlId>
                    </condition>
                    <requireField>
                        <trigger/>
                    </requireField>
                `
                const res = await queryTripwire(sendXML)
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    formData.value.schedule = getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid'))

                    const $trigger = queryXml($('content/chl/trigger')[0].element)

                    formData.value.trigger = ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch'].filter((item) => {
                        return $trigger(item).text().bool()
                    })

                    formData.value.sysAudio = $trigger('sysAudio').attr('id')

                    formData.value.record = $trigger('sysRec/chls/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    })

                    formData.value.alarmOut = $trigger('alarmOut/alarmOuts/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    })

                    formData.value.preset = $trigger('preset/presets/item').map((item) => {
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

                    watchEdit.listen()
                } else {
                    pageData.value.reqFail = true
                    pageData.value.tab = ''
                }
            } else {
                const sendXML = rawXml`
                    <condition>
                        <chlId>${props.currChlId}</chlId>
                    </condition>
                    <requireField>
                        <param/>
                        <trigger/>
                    </requireField>
                `
                const res = await queryTripwire(sendXML)
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    const $trigger = queryXml($('content/chl/trigger')[0].element)
                    const $param = queryXml($('content/chl/param')[0].element)

                    formData.value.schedule = getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid'))

                    formData.value.directionList = $('types/direction/enum').map((item) => {
                        return {
                            value: item.text(),
                            label: directionTypeTip[item.text()],
                        }
                    })

                    formData.value.mutexList = $param('mutexList/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    })

                    formData.value.mutexListEx = $param('mutexListEx/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    })

                    formData.value.holdTime = $param('alarmHoldTime').text().num()
                    formData.value.holdTimeList = getAlarmHoldTimeList($param('holdTimeNote').text(), formData.value.holdTime)

                    formData.value.lineInfo = $param('line/item').map((item) => {
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
                            configured: false,
                        }
                    })
                    formData.value.direction = formData.value.lineInfo[pageData.value.chosenSurfaceIndex].direction
                    formData.value.detectionEnable = $param('switch').text().bool()
                    formData.value.originalEnable = formData.value.detectionEnable
                    formData.value.audioSuport = $param('triggerAudio').text() !== ''
                    formData.value.lightSuport = $param('triggerWhiteLight').text() !== ''
                    formData.value.hasAutoTrack = $param('autoTrack').text() !== ''
                    formData.value.autoTrack = $param('autoTrack').text().bool()
                    formData.value.pictureAvailable = $param('saveTargetPicture').text() !== ''
                    formData.value.saveTargetPicture = $param('aveTargetPicture').text().bool()
                    formData.value.saveSourcePicture = $param('saveSourcePicture').text().bool()
                    formData.value.onlyPreson = $param('sensitivity').text() !== ''
                    // NTA1-231：低配版IPC：4M S4L-C，越界/区域入侵目标类型只支持人
                    formData.value.onlyPersonSensitivity = formData.value.onlyPreson ? $param('sensitivity').text().num() : 0
                    formData.value.hasObj = $param('objectFilter').text() !== ''
                    if (formData.value.hasObj) {
                        const car = $param('objectFilter/car/switch').text().bool()
                        const person = $param('objectFilter/person/switch').text().bool()
                        const motorcycle = $param('objectFilter/motor/switch').text().bool()
                        const personSensitivity = $param('objectFilter/person/sensitivity').text().num()
                        const carSensitivity = $param('objectFilter/car/sensitivity').text().num()
                        const motorSensitivity = $param('objectFilter/motor/sensitivity').text().num()
                        formData.value.objectFilter = {
                            car: car,
                            person: person,
                            motorcycle: motorcycle,
                            personSensitivity: personSensitivity,
                            carSensitivity: carSensitivity,
                            motorSensitivity: motorSensitivity,
                        }
                    }

                    formData.value.sysAudio = $trigger('sysAudio').attr('id')

                    formData.value.record = $trigger('sysRec/chls/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    })

                    formData.value.alarmOut = $trigger('alarmOut/alarmOuts/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    })

                    formData.value.preset = $trigger('preset/presets/item').map((item) => {
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
        }

        // 保存越界检测数据
        const saveData = async () => {
            let paramXml = ''
            if (props.chlData.supportTripwire || props.chlData.supportBackTripwire) {
                paramXml = rawXml`
                    <param>
                        <switch>${formData.value.detectionEnable}</switch>
                        <alarmHoldTime unit="s">${formData.value.holdTime}</alarmHoldTime>
                        ${formData.value.onlyPreson ? `<sensitivity>${formData.value.onlyPersonSensitivity}</sensitivity>` : ''}
                        ${
                            formData.value.hasObj
                                ? rawXml`
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
                                `
                                : ''
                        }
                        ${formData.value.hasAutoTrack ? `<autoTrack>${formData.value.autoTrack}</autoTrack>` : ''}
                        <line type="list" count="${formData.value.lineInfo.length}">
                            <itemType>
                                <direction type="direction"/>
                            </itemType>
                            ${formData.value.lineInfo
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
                        </line>
                        ${formData.value.audioSuport && props.chlData.supportAudio ? `<triggerAudio>${formData.value.trigger.includes('triggerAudio')}</triggerAudio>` : ''}
                        ${formData.value.lightSuport && props.chlData.supportWhiteLight ? `<triggerWhiteLight>${formData.value.trigger.includes('triggerWhiteLight')}</triggerWhiteLight>` : ''}
                        ${
                            formData.value.pictureAvailable
                                ? rawXml`
                                    <saveSourcePicture>${formData.value.saveSourcePicture}</saveSourcePicture>
                                    <saveTargetPicture>${formData.value.saveTargetPicture}</saveTargetPicture>
                                `
                                : ''
                        }
                    </param>
                `
            }

            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}" scheduleGuid="${formData.value.schedule}">
                        ${paramXml}
                        <trigger>
                            <sysRec>
                                <chls type="list">
                                    ${formData.value.record
                                        .map(
                                            (element) => rawXml`
                                                <item id="${element.value}">
                                                    <![CDATA[${element.label}]]>
                                                </item>
                                            `,
                                        )
                                        .join('')}
                                </chls>
                            </sysRec>
                            <alarmOut>
                                <alarmOuts type="list">
                                    ${formData.value.alarmOut
                                        .map(
                                            (element) => rawXml`
                                                <item id="${element.value}">
                                                    <![CDATA[${element.label}]]>
                                                </item>
                                            `,
                                        )
                                        .join('')}
                                </alarmOuts>
                            </alarmOut>
                            <preset>
                                <presets type="list">
                                    ${formData.value.preset
                                        .map((item) => {
                                            return rawXml`
                                                <item>
                                                    <index>${item.index}</index>
                                                    <name><![CDATA[${item.name}]]></name>
                                                    <chl id='${item.chl.value}'><![CDATA[${item.chl.label}]]></chl>
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
                            <sysAudio id='${formData.value.sysAudio}'></sysAudio>
                        </trigger>
                    </chl>
                </content>
            `
            openLoading()
            const result = await editTripwire(sendXml)
            const $ = queryXml(result)
            closeLoading()
            if ($('status').text() === 'success') {
                // NT-9292 开关为开把originalSwitch置为true避免多次弹出互斥提示
                if (formData.value.detectionEnable) {
                    formData.value.originalEnable = formData.value.detectionEnable
                }
                refreshInitPage()
                watchEdit.update()
            }
        }

        // 执行保存tripwire数据
        const applyData = () => {
            if (!props.chlData.supportTripwire && !props.chlData.supportBackTripwire && props.chlData.supportPeaTrigger) {
                saveData()
            } else {
                checkMutexChl({
                    isChange: formData.value.detectionEnable && formData.value.detectionEnable !== formData.value.originalEnable,
                    mutexList: formData.value.mutexList,
                    mutexListEx: formData.value.mutexListEx,
                    chlName: props.chlData.name,
                    chlIp: props.chlData.ip,
                    chlList: props.onlineChannelList,
                    tips: 'IDCS_SIMPLE_TRIPWIRE_DETECT_TIPS',
                }).then(() => {
                    saveData()
                })
            }
        }

        // 对sheduleList进行处理
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        // tripwire tab点击事件
        const changeTab = () => {
            if (pageData.value.tab === 'param') {
                if (mode.value === 'h5') {
                    setTripwireOcxData()
                    tripwireDrawer.setEnable('line', true)
                }

                if (mode.value === 'ocx') {
                    const surface = pageData.value.chosenSurfaceIndex
                    const sendXML1 = OCX_XML_SetTripwireLine(formData.value.lineInfo[surface])
                    plugin.ExecuteCmd(sendXML1)

                    const sendXML2 = OCX_XML_SetTripwireLineAction('EDIT_ON')
                    plugin.ExecuteCmd(sendXML2)
                }

                if (pageData.value.isShowAllArea) {
                    showAllArea(true)
                }
            } else if (pageData.value.tab === 'target') {
                showAllArea(false)

                if (mode.value === 'h5') {
                    tripwireDrawer.clear()
                    tripwireDrawer.setEnable('line', false)
                }

                if (mode.value === 'ocx') {
                    const sendXML1 = OCX_XML_SetTripwireLineAction('NONE')
                    plugin.ExecuteCmd(sendXML1)

                    const sendXML2 = OCX_XML_SetTripwireLineAction('EDIT_OFF')
                    plugin.ExecuteCmd(sendXML2)
                }
            }
        }

        // tripwire刷新页面数据
        const refreshInitPage = () => {
            // 区域状态
            const lineInfoList = formData.value.lineInfo
            lineInfoList.forEach((lineInfo, surface) => {
                if (lineInfo && !lineInfo.startPoint.X && !lineInfo.startPoint.Y && !lineInfo.endPoint.X && !lineInfo.endPoint.Y) {
                    formData.value.lineInfo[surface].configured = false
                } else {
                    formData.value.lineInfo[surface].configured = true
                }
            })
            if (formData.value.lineInfo.length > 1) {
                pageData.value.showAllAreaVisible = true
                pageData.value.clearAllVisible = true
            } else {
                pageData.value.showAllAreaVisible = false
                pageData.value.clearAllVisible = false
            }
        }

        // tripwire执行是否显示全部区域
        const toggleShowAllArea = () => {
            tripwireDrawer && tripwireDrawer.setEnableShowAll(pageData.value.isShowAllArea)
            showAllArea(pageData.value.isShowAllArea)
        }

        // tripWire选择警戒面
        const changeSurface = () => {
            // pageData.value.chosenSurfaceIndex = index
            formData.value.direction = formData.value.lineInfo[pageData.value.chosenSurfaceIndex].direction
            setTripwireOcxData()
        }

        // tripwire选择方向
        const changeDirection = () => {
            formData.value.lineInfo[pageData.value.chosenSurfaceIndex].direction = formData.value.direction
            setTripwireOcxData()
        }

        // 通用获取云台锁定状态
        const getPTZLockStatus = async () => {
            const sendXML = rawXml`
                <condition>
                    <chlId>${props.currChlId}</chlId>
                </condition>
            `
            const res = await queryBallIPCPTZLockCfg(sendXML)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.lockStatus = $('content/chl/param/PTZLock').text().bool()
            }
        }

        // 通用修改云台锁定状态
        const editLockStatus = () => {
            const sendXML = rawXml`
                <content>
                    <chl id='${props.currChlId}'>
                        <param>
                            <PTZLock>${!pageData.value.lockStatus}</PTZLock>
                        </param>
                    </chl>
                </content>
            `
            openLoading()
            editBallIPCPTZLockCfg(sendXML).then((res) => {
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    closeLoading()
                    pageData.value.lockStatus = !pageData.value.lockStatus
                }
            })
        }

        // tripwire绘图
        const changeTripwire = (passline: CanvasPasslinePassline) => {
            const surface = pageData.value.chosenSurfaceIndex
            formData.value.lineInfo[surface].startPoint = {
                X: passline.startX,
                Y: passline.startY,
            }
            formData.value.lineInfo[surface].endPoint = {
                X: passline.endX,
                Y: passline.endY,
            }
            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
            refreshInitPage()
        }

        // tripwire是否显示所有区域
        const showAllArea = (isShowAll: boolean) => {
            tripwireDrawer && tripwireDrawer.setEnableShowAll(isShowAll)
            if (isShowAll) {
                const lineInfoList = formData.value.lineInfo
                const currentSurface = pageData.value.chosenSurfaceIndex

                if (mode.value === 'h5') {
                    tripwireDrawer.setCurrentSurfaceOrAlarmLine(currentSurface)
                    tripwireDrawer.drawAllPassline(lineInfoList, currentSurface)
                }

                if (mode.value === 'ocx') {
                    const pluginLineInfoList = cloneDeep(lineInfoList)
                    pluginLineInfoList.splice(currentSurface, 1) // 插件端下发全部区域需要过滤掉当前区域数据

                    const sendXML = OCX_XML_SetAllArea({ lineInfoList: pluginLineInfoList }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, true)
                    plugin.ExecuteCmd(sendXML)
                }
            } else {
                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetAllArea({ lineInfoList: [] }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, false)
                    plugin.ExecuteCmd(sendXML)
                }
                setTripwireOcxData()
            }
        }

        // tripwire显示
        const setTripwireOcxData = () => {
            if (pageData.value.tab === 'param') {
                const surface = pageData.value.chosenSurfaceIndex
                if (formData.value.lineInfo.length > 0) {
                    if (mode.value === 'h5') {
                        tripwireDrawer.setCurrentSurfaceOrAlarmLine(surface)
                        tripwireDrawer.setDirection(formData.value.lineInfo[surface].direction)
                        tripwireDrawer.setPassline({
                            startX: formData.value.lineInfo[surface].startPoint.X,
                            startY: formData.value.lineInfo[surface].startPoint.Y,
                            endX: formData.value.lineInfo[surface].endPoint.X,
                            endY: formData.value.lineInfo[surface].endPoint.Y,
                        })
                    }

                    if (mode.value === 'ocx') {
                        const sendXML = OCX_XML_SetTripwireLine(formData.value.lineInfo[surface])
                        plugin.ExecuteCmd(sendXML)
                    }
                }

                if (pageData.value.isShowAllArea) {
                    showAllArea(true)
                }
            }
        }

        // 清空当前区域
        const clearArea = () => {
            if (mode.value === 'h5') {
                tripwireDrawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetTripwireLineAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            const surface = pageData.value.chosenSurfaceIndex
            formData.value.lineInfo[surface].startPoint = {
                X: 0,
                Y: 0,
            }
            formData.value.lineInfo[surface].endPoint = {
                X: 0,
                Y: 0,
            }
            formData.value.lineInfo[surface].configured = false
            tripwireDrawer.clear()
        }

        // 清空所有区域
        const clearAllArea = () => {
            formData.value.lineInfo.forEach((lineInfo) => {
                lineInfo.startPoint = {
                    X: 0,
                    Y: 0,
                }
                lineInfo.endPoint = {
                    X: 0,
                    Y: 0,
                }
                lineInfo.configured = false
            })

            if (mode.value === 'h5') {
                tripwireDrawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML1 = OCX_XML_SetAllArea({ lineInfoList: [] }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, pageData.value.isShowAllArea)
                plugin.ExecuteCmd(sendXML1)

                const sendXML2 = OCX_XML_SetTripwireLineAction('NONE')
                plugin.ExecuteCmd(sendXML2)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        const notify = ($: XMLQuery, stateType: string) => {
            if (stateType === 'TripwireLine') {
                const surface = pageData.value.chosenSurfaceIndex
                formData.value.lineInfo[surface].startPoint = {
                    X: $('statenotify/startPoint').attr('X').num(),
                    Y: $('statenotify/startPoint').attr('Y').num(),
                }
                formData.value.lineInfo[surface].endPoint = {
                    X: $('statenotify/endPoint').attr('X').num(),
                    Y: $('statenotify/endPoint').attr('Y').num(),
                }
                refreshInitPage()
            }
        }

        onMounted(async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            await getScheduleList()
            await getTripwireData()
            if (pageData.value.reqFail) {
                return
            }
            refreshInitPage()
            if (props.chlData.supportAutoTrack) {
                getPTZLockStatus()
            }
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendAreaXML = OCX_XML_SetTripwireLineAction('NONE')
                plugin.ExecuteCmd(sendAreaXML)

                const sendAllAreaXML = OCX_XML_SetAllArea({ lineInfoList: [] }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, false)
                plugin.ExecuteCmd(sendAllAreaXML!)

                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }
        })

        return {
            playerRef,
            pageData,
            formData,
            notify,
            watchEdit,
            handlePlayerReady,
            setSpeed,
            closeSchedulePop,
            applyData,
            changeTab,
            toggleShowAllArea,
            changeSurface,
            changeDirection,
            editLockStatus,
            clearArea,
            clearAllArea,
        }
    },
})
