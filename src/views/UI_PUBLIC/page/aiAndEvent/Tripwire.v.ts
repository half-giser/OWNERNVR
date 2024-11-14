/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 11:16:22
 * @Description: 越界
 */
import { type AlarmChlDto, AlarmTripwireDto, type CanvasPasslineDirection } from '@/types/apiType/aiAndEvent'
import { type TabsPaneContext } from 'element-plus'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import CanvasPassline from '@/utils/canvas/canvasPassline'
import ChannelPtzCtrlPanel from '@/views/UI_PUBLIC/page/channel/ChannelPtzCtrlPanel.vue'
import { cloneDeep } from 'lodash-es'
import { type XmlResult } from '@/utils/xmlParse'
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
            type: Array as PropType<{ id: string; ip: string; name: string; accessType: string }[]>,
            required: true,
        },
    },
    setup(props) {
        const { openLoading, closeLoading } = useLoading()
        const openMessageBox = useMessageBox().openMessageBox
        const systemCaps = useCababilityStore()
        const { Translate } = useLangStore()
        const pluginStore = usePluginStore()
        const osType = getSystemInfo().platform
        const tripwireplayerRef = ref<PlayerInstance>()
        let tripwireDrawer: CanvasPassline

        const closeTip = getAlarmEventList()

        const directionTypeTip: Record<string, string> = {
            none: 'A<->B',
            rightortop: 'A->B',
            leftorbotton: 'A<-B',
        }

        const pageData = ref({
            // 是否支持声音设置
            supportAlarmAudioConfig: true,
            // 不支持功能提示页面是否展示
            notSupportTipShow: false,
            // 请求数据失败显示提示
            requireDataFail: false,
            // 排程管理
            scheduleManagePopOpen: false,
            scheduleList: [] as SelectOption<string, string>[],
            // 选择的功能:tripwire_param,tripwire_target,tripwire_trigger
            tripwireFunction: 'tripwire_param',
            // apply按钮是否可用
            applyDisable: true,
            // 播放器相关
            // 通知列表
            notification: [] as string[],
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
            initComplete: false,
            moreDropDown: false,
        })

        const formData = ref(new AlarmTripwireDto())

        let tripwirePlayer: PlayerInstance['player']
        let tripwirePlugin: PlayerInstance['plugin']

        // tripwire播放模式
        const tripwiremode = computed(() => {
            if (!tripwireplayerRef.value) {
                return ''
            }
            return tripwireplayerRef.value.mode
        })

        const tripwireReady = computed(() => {
            return tripwireplayerRef.value?.ready || false
        })

        const tripWirehandlePlayerReady = () => {
            tripwirePlayer = tripwireplayerRef.value!.player
            tripwirePlugin = tripwireplayerRef.value!.plugin

            if (tripwiremode.value === 'h5') {
                if (tripwireplayerRef.value) {
                    const canvas = tripwireplayerRef.value.player.getDrawbordCanvas(0)
                    tripwireDrawer = new CanvasPassline({
                        el: canvas,
                        enableOSD: true,
                        enableShowAll: false,
                        onchange: tripwireChange,
                    })
                }

                if (isHttpsLogin()) {
                    pageData.value.notification = [formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`)]
                }
            }

            if (tripwiremode.value === 'ocx') {
                if (!tripwirePlugin.IsInstallPlugin()) {
                    tripwirePlugin.SetPluginNotice('#layout2Content')
                    return
                }

                if (!tripwirePlugin.IsPluginAvailable()) {
                    pluginStore.showPluginNoResponse = true
                    tripwirePlugin.ShowPluginNoResponse()
                }
                const sendXML = OCX_XML_SetPluginModel(osType === 'mac' ? 'TripwireConfig' : 'ReadOnly', 'Live')
                tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 播放视频
         */
        const tripwirePlay = () => {
            const { id, name } = props.chlData
            if (tripwiremode.value === 'h5') {
                tripwirePlayer.play({
                    chlID: id,
                    streamType: 2,
                })
            } else {
                if (osType === 'mac') {
                    // const sendXML = OCX_XML_Preview({
                    //     winIndexList: [0],
                    //     chlIdList: [id],
                    //     chlNameList: [name],
                    //     streamType: 'sub',
                    //     chlIndexList: [props.chlData.id],
                    //     chlTypeList: [props.chlData.chlType],
                    // })
                    // tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    tripwirePlugin.RetryStartChlView(id, name)
                }
            }
        }

        // 首次加载成功 播放tripwire视频
        const tripwirestopWatchFirstPlay = watchEffect(() => {
            if (tripwireReady.value && pageData.value.initComplete) {
                nextTick(() => {
                    tripwirePlay()
                    setTripwireOcxData()
                })
                tripwirestopWatchFirstPlay()
            }
        })

        // 修改越界播放器速度
        /**
         * @description 修改速度
         * @param {Number} speed
         */
        const setTripWireSpeed = (speed: number) => {
            pageData.value.tripWirespeed = speed
        }

        // 关闭排程管理后刷新排程列表
        const handleSchedulePopClose = async () => {
            pageData.value.scheduleManagePopOpen = false
            await getScheduleList()
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
                    pageData.value.applyDisable = true

                    const schedule = $('//content/chl').attr('scheduleGuid')
                    formData.value.tripwire_schedule =
                        schedule !== '' ? (pageData.value.scheduleList.some((item: { value: string; label: string }) => item.value === schedule) ? schedule : DEFAULT_EMPTY_ID) : DEFAULT_EMPTY_ID

                    const trigger = $('//content/chl/trigger')
                    const $trigger = queryXml(trigger[0].element)

                    formData.value.trigger = ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch'].filter((item) => {
                        return $trigger(item).text().bool()
                    })

                    formData.value.sysAudio = $trigger('sysAudio').attr('id') || ''

                    formData.value.record = $trigger('sysRec/chls/item').map((item) => {
                        return {
                            value: item.attr('id')!,
                            label: item.text(),
                        }
                    })

                    formData.value.alarmOut = $trigger('alarmOut/alarmOuts/item').map((item) => {
                        return {
                            value: item.attr('id')!,
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
                } else {
                    pageData.value.requireDataFail = true
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
                    pageData.value.applyDisable = true
                    const schedule = $('//content/chl').attr('scheduleGuid')
                    formData.value.tripwire_schedule =
                        schedule === '' ? DEFAULT_EMPTY_ID : pageData.value.scheduleList.some((item: { value: string; label: string }) => item.value === schedule) ? schedule : DEFAULT_EMPTY_ID
                    formData.value.directionList = $('//types/direction/enum').map((item) => {
                        return {
                            value: item.text(),
                            label: directionTypeTip[item.text()],
                        }
                    })
                    formData.value.mutexList = $('//content/chl/param/mutexList/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    })
                    formData.value.mutexListEx = $('//content/chl/param/mutexListEx/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    })

                    const holdTimeArr = $('//content/chl/param/holdTimeNote').text().split(',')
                    formData.value.holdTime = $('//content/chl/param/alarmHoldTime').text().num()
                    if (!holdTimeArr.includes(formData.value.holdTime.toString())) {
                        holdTimeArr.push(formData.value.holdTime.toString())
                    }
                    formData.value.holdTimeList = formatHoldTime(holdTimeArr)

                    formData.value.lineInfo = $('//content/chl/param/line/item').map((item) => {
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
                    formData.value.detectionEnable = $('//content/chl/param/switch').text().bool()
                    formData.value.originalEnable = formData.value.detectionEnable
                    formData.value.audioSuport = $('//content/chl/param/triggerAudio').text() !== ''
                    formData.value.lightSuport = $('//content/chl/param/triggerWhiteLight').text() !== ''
                    formData.value.hasAutoTrack = $('//content/chl/param/autoTrack').text() !== ''
                    formData.value.autoTrack = $('//content/chl/param/autoTrack').text().bool()
                    formData.value.pictureAvailable = $('//content/chl/param/saveTargetPicture').text() !== ''
                    formData.value.saveTargetPicture = $('//content/chl/param/saveTargetPicture').text().bool()
                    formData.value.saveSourcePicture = $('//content/chl/param/saveSourcePicture').text().bool()
                    formData.value.tripwire_onlyPreson = $('//content/chl/param/sensitivity').text() !== ''
                    // NTA1-231：低配版IPC：4M S4L-C，越界/区域入侵目标类型只支持人
                    formData.value.onlyPersonSensitivity = formData.value.tripwire_onlyPreson ? $('//content/chl/param/sensitivity').text().num() : 0
                    formData.value.hasObj = $('//content/chl/param/objectFilter').text() !== ''
                    if (formData.value.hasObj) {
                        const car = $('//content/chl/param/objectFilter/car/switch').text().bool()
                        const person = $('//content/chl/param/objectFilter/person/switch').text().bool()
                        const motorcycle = $('//content/chl/param/objectFilter/motor/switch').text().bool()
                        const personSensitivity = $('//content/chl/param/objectFilter/person/sensitivity').text().num()
                        const carSensitivity = $('//content/chl/param/objectFilter/car/sensitivity').text().num()
                        const motorSensitivity = $('//content/chl/param/objectFilter/motor/sensitivity').text().num()
                        formData.value.objectFilter = {
                            car: car,
                            person: person,
                            motorcycle: motorcycle,
                            personSensitivity: personSensitivity,
                            carSensitivity: carSensitivity,
                            motorSensitivity: motorSensitivity,
                        }
                    }

                    const trigger = $('//content/chl/trigger')
                    const $trigger = queryXml(trigger[0].element)

                    formData.value.sysAudio = $trigger('sysAudio').attr('id') || ''

                    formData.value.record = $trigger('sysRec/chls/item').map((item) => {
                        return {
                            value: item.attr('id')!,
                            label: item.text(),
                        }
                    })

                    formData.value.alarmOut = $trigger('alarmOut/alarmOuts/item').map((item) => {
                        return {
                            value: item.attr('id')!,
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
                        const triggerAudio = $('//content/chl/param/triggerAudio').text().bool()
                        if (triggerAudio) {
                            formData.value.trigger.push('triggerAudio')
                        }
                    }

                    if (formData.value.lightSuport && props.chlData.supportWhiteLight) {
                        formData.value.triggerList.push('triggerWhiteLight')
                        const triggerWhiteLight = $('//content/chl/param/triggerWhiteLight').text().bool()
                        if (triggerWhiteLight) {
                            formData.value.trigger.push('triggerWhiteLight')
                        }
                    }
                } else {
                    pageData.value.requireDataFail = true
                }
            }
        }

        // 保存越界检测数据
        const saveTripwireData = async () => {
            let paramXml = ''
            if (props.chlData.supportTripwire || props.chlData.supportBackTripwire) {
                paramXml = rawXml`
                    <param>
                        <switch>${formData.value.detectionEnable}</switch>
                        <alarmHoldTime unit="s">${formData.value.holdTime}</alarmHoldTime>
                        ${formData.value.tripwire_onlyPreson ? `<sensitivity>${formData.value.onlyPersonSensitivity}</sensitivity>` : ''}
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
                    <chl id="${props.currChlId}" scheduleGuid="${formData.value.tripwire_schedule}">
                        ${paramXml}
                        <trigger>
                            <sysRec>
                                <chls type="list">
                                    ${formData.value.record
                                        .map(
                                            (element: { value: string; label: string }) => rawXml`
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
                                            (element: { value: string; label: string }) => rawXml`
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
            const $ = await editTripwire(sendXml)
            const res = queryXml($)
            closeLoading()
            if (res('status').text() === 'success') {
                // NT-9292 开关为开把originalSwitch置为true避免多次弹出互斥提示
                if (formData.value.detectionEnable) {
                    formData.value.originalEnable = formData.value.detectionEnable
                }
                nextTick(() => {
                    pageData.value.applyDisable = true
                })
                tripwireRefreshInitPage()
            }
        }

        // 执行保存tripwire数据
        const handleTripwireApply = () => {
            if (!props.chlData.supportTripwire && !props.chlData.supportBackTripwire && props.chlData.supportPeaTrigger) {
                saveTripwireData()
            } else {
                let isSwitchChange = false
                const switchChangeTypeArr: string[] = []
                if (formData.value.detectionEnable && formData.value.detectionEnable !== formData.value.originalEnable) {
                    isSwitchChange = true
                }
                const mutexChlNameObj = getMutexChlNameObj()
                formData.value.mutexList.forEach((ele) => {
                    if (ele.status) {
                        const prefixName = mutexChlNameObj.normalChlName ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj.normalChlName) : ''
                        const showInfo = prefixName ? prefixName + closeTip[ele.object].toLowerCase() : closeTip[ele.object]
                        switchChangeTypeArr.push(showInfo)
                    }
                })
                formData.value.mutexListEx.forEach((ele) => {
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
                        message: Translate('IDCS_SIMPLE_TRIPWIRE_DETECT_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + props.chlData.name, switchChangeType),
                    }).then(() => {
                        saveTripwireData()
                    })
                } else {
                    saveTripwireData()
                }
            }
        }

        // 对sheduleList进行处理
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        // 获取mutexobj
        const getMutexChlNameObj = () => {
            let normalChlName = ''
            let thermalChlName = ''
            const sameIPChlList: { id: string; ip: string; name: string; accessType: string }[] = []
            const chlIp = props.chlData.ip
            props.onlineChannelList.forEach((chl) => {
                if (chl.ip === chlIp) {
                    sameIPChlList.push(chl)
                }
            })
            if (sameIPChlList.length > 1) {
                sameIPChlList.forEach((chl) => {
                    if (chl.accessType === '1') {
                        thermalChlName = chl.name === props.chlData.name ? '' : chl.name
                    } else {
                        normalChlName = chl.name === props.chlData.name ? '' : chl.name
                    }
                })
            }
            return {
                normalChlName: normalChlName,
                thermalChlName: thermalChlName,
            }
        }

        // tripwire tab点击事件
        const handleTripwireFunctionTabClick = async (pane: TabsPaneContext) => {
            pageData.value.tripwireFunction = pane.props.name?.toString() ? pane.props.name?.toString() : ''
            if (pageData.value.tripwireFunction === 'tripwire_param') {
                if (tripwiremode.value === 'h5') {
                    setTripwireOcxData()
                    tripwireDrawer.setEnable('line', true)
                } else {
                    const surface = pageData.value.chosenSurfaceIndex
                    const sendXML1 = OCX_XML_SetTripwireLine(formData.value.lineInfo[surface])
                    tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                    const sendXML2 = OCX_XML_SetTripwireLineAction('EDIT_ON')
                    tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                }

                if (pageData.value.isShowAllArea) {
                    showAllTripwireArea(true)
                }
            } else if (pageData.value.tripwireFunction === 'tripwire_target') {
                showAllTripwireArea(false)
                if (tripwiremode.value === 'h5') {
                    tripwireDrawer.clear()
                    tripwireDrawer.setEnable('line', false)
                } else {
                    const sendXML1 = OCX_XML_SetTripwireLineAction('NONE')
                    tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                    const sendXML2 = OCX_XML_SetTripwireLineAction('EDIT_OFF')
                    tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                }
            }
        }

        // tripwire刷新页面数据
        const tripwireRefreshInitPage = () => {
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

        const initPageData = async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            pageData.value.initComplete = false
            if (
                props.chlData.supportTripwire ||
                props.chlData.supportAOIEntry ||
                props.chlData.supportAOILeave ||
                props.chlData.supportBackTripwire ||
                props.chlData.supportBackAOIEntry ||
                props.chlData.supportBackAOILeave
            ) {
                const pageTimer = setTimeout(async () => {
                    // 临时方案-NVRUSS44-79（页面快速切换时。。。）
                    const tripwirePlugin = tripwireplayerRef.value?.plugin
                    if (tripwiremode.value !== 'h5') {
                        tripwirePlugin?.VideoPluginNotifyEmitter.addListener(tripwireLiveNotify2Js)
                    }
                    // pageData.value.detectionTypeText = Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(props.chlData.supportTripwire ? 'IPC' : 'NVR')
                    await getTripwireData()
                    // 是否显示控制全部区域按钮
                    tripwireRefreshInitPage()
                    nextTick(() => {
                        pageData.value.initComplete = true
                        if (props.chlData.supportAutoTrack) {
                            getPTZLockStatus()
                        }

                        if (tripwiremode.value === 'h5') {
                            tripwireDrawer.setEnable('line', true)
                        } else {
                            const sendXML = OCX_XML_SetPeaAreaAction('EDIT_ON')
                            tripwirePlugin?.GetVideoPlugin().ExecuteCmd(sendXML)
                        }
                    })
                    // setTripwireOcxData()
                    clearTimeout(pageTimer)
                }, 250)
            } else {
                pageData.value.notSupportTipShow = true
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

        // tripwire执行是否显示全部区域
        const handleTripwireShowAllAreaChange = () => {
            tripwireDrawer && tripwireDrawer.setEnableShowAll(pageData.value.isShowAllArea)
            showAllTripwireArea(pageData.value.isShowAllArea)
        }

        // tripWire选择警戒面
        const handleSurfaceChange = () => {
            // pageData.value.chosenSurfaceIndex = index
            formData.value.direction = formData.value.lineInfo[pageData.value.chosenSurfaceIndex].direction
            setTripwireOcxData()
        }

        // tripwire选择方向
        const handleTripwireDirectionChange = () => {
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
                pageData.value.lockStatus = $('//content/chl/param/PTZLock').text().bool()
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
        const tripwireChange = (passline: { startX: number; startY: number; endX: number; endY: number }) => {
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
                showAllTripwireArea(true)
            }
            tripwireRefreshInitPage()
            pageData.value.applyDisable = false
        }

        // tripwire是否显示所有区域
        const showAllTripwireArea = (isShowAll: boolean) => {
            tripwireDrawer && tripwireDrawer.setEnableShowAll(isShowAll)
            if (isShowAll) {
                const lineInfoList = formData.value.lineInfo
                const currentSurface = pageData.value.chosenSurfaceIndex
                if (tripwiremode.value === 'h5') {
                    tripwireDrawer.setCurrentSurfaceOrAlarmLine(currentSurface)
                    tripwireDrawer.drawAllPassline(lineInfoList, currentSurface)
                } else {
                    const pluginLineInfoList = cloneDeep(lineInfoList)
                    pluginLineInfoList.splice(currentSurface, 1) // 插件端下发全部区域需要过滤掉当前区域数据
                    const sendXML = OCX_XML_SetAllArea({ lineInfoList: pluginLineInfoList }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, true)
                    if (sendXML) {
                        tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                }
            } else {
                if (tripwiremode.value !== 'h5') {
                    const sendXML = OCX_XML_SetAllArea({ lineInfoList: [] }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, false)
                    if (sendXML) {
                        tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                }
                setTripwireOcxData()
            }
        }

        // tripwire显示
        const setTripwireOcxData = () => {
            if (pageData.value.tripwireFunction === 'tripwire_param') {
                const surface = pageData.value.chosenSurfaceIndex
                if (formData.value.lineInfo.length > 0) {
                    if (tripwiremode.value === 'h5') {
                        tripwireDrawer.setCurrentSurfaceOrAlarmLine(surface)
                        tripwireDrawer.setDirection(formData.value.lineInfo[surface].direction)
                        tripwireDrawer.setPassline({
                            startX: formData.value.lineInfo[surface].startPoint.X,
                            startY: formData.value.lineInfo[surface].startPoint.Y,
                            endX: formData.value.lineInfo[surface].endPoint.X,
                            endY: formData.value.lineInfo[surface].endPoint.Y,
                        })
                    } else {
                        const sendXML = OCX_XML_SetTripwireLine(formData.value.lineInfo[surface])
                        if (sendXML) {
                            tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }
                    }
                }

                if (pageData.value.isShowAllArea) {
                    showAllTripwireArea(true)
                }
            }
        }

        // 清空当前区域
        const clearTripwireArea = () => {
            if (tripwiremode.value === 'h5') {
                tripwireDrawer.clear()
            } else {
                const sendXML = OCX_XML_SetTripwireLineAction('NONE')
                tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            const surface = pageData.value.chosenSurfaceIndex
            formData.value.lineInfo[surface].startPoint = { X: 0, Y: 0 }
            formData.value.lineInfo[surface].endPoint = { X: 0, Y: 0 }
            formData.value.lineInfo[surface].configured = false
            tripwireDrawer.clear()
            pageData.value.applyDisable = false
        }

        // 清空所有区域
        const clearAllTripwireArea = () => {
            formData.value.lineInfo.forEach((lineInfo) => {
                lineInfo.startPoint = { X: 0, Y: 0 }
                lineInfo.endPoint = { X: 0, Y: 0 }
                lineInfo.configured = false
            })
            if (tripwiremode.value === 'h5') {
                tripwireDrawer.clear()
            } else {
                const sendXML1 = OCX_XML_SetAllArea({ lineInfoList: [] }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, pageData.value.isShowAllArea)
                if (sendXML1) {
                    tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML1)
                }
                const sendXML2 = OCX_XML_SetTripwireLineAction('NONE')
                if (sendXML2) {
                    tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML2)
                }
            }

            if (pageData.value.isShowAllArea) {
                showAllTripwireArea(true)
            }
            pageData.value.applyDisable = false
        }

        const tripwireLiveNotify2Js = ($: (path: string) => XmlResult) => {
            if ($('/statenotify[@type="TripwireLine"]').length > 0) {
                const surface = pageData.value.chosenSurfaceIndex
                formData.value.lineInfo[surface].startPoint = {
                    X: $('/statenotify/startPoint').attr('X').num(),
                    Y: $('/statenotify/startPoint').attr('Y').num(),
                }
                formData.value.lineInfo[surface].endPoint = {
                    X: $('/statenotify/endPoint').attr('X').num(),
                    Y: $('/statenotify/endPoint').attr('Y').num(),
                }
                tripwireRefreshInitPage()
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

        onMounted(async () => {
            await getScheduleList()
            await initPageData()
        })

        onBeforeUnmount(() => {
            if (tripwirePlugin?.IsPluginAvailable() && tripwiremode.value === 'ocx' && tripwireReady.value) {
                tripwirePlugin.VideoPluginNotifyEmitter.removeListener(tripwireLiveNotify2Js)
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendAreaXML = OCX_XML_SetTripwireLineAction('NONE')
                tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendAreaXML)
                const sendAllAreaXML = OCX_XML_SetAllArea({ lineInfoList: [] }, 'WarningLine', 'TYPE_TRIPWIRE_LINE', undefined, false)
                tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendAllAreaXML!)
                const sendXML = OCX_XML_StopPreview('ALL')
                tripwirePlugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }

            if (tripwiremode.value === 'h5') {
                tripwirePlayer.destroy()
            }
        })
        return {
            tripwireplayerRef,
            pageData,
            formData,
            tripWirehandlePlayerReady,
            setTripWireSpeed,
            handleSchedulePopClose,
            handleTripwireApply,
            handleTripwireFunctionTabClick,
            handleTripwireShowAllAreaChange,
            handleSurfaceChange,
            handleTripwireDirectionChange,
            editLockStatus,
            clearTripwireArea,
            clearAllTripwireArea,
            ScheduleManagPop,
            ChannelPtzCtrlPanel,
            AlarmBaseRecordSelector,
            AlarmBaseAlarmOutSelector,
            AlarmBaseTriggerSelector,
            AlarmBasePresetSelector,
            AlarmBaseResourceData,
        }
    },
})
