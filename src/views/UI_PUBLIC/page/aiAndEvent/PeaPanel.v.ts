/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-19 13:36:26
 * @Description: 区域入侵
 */
import ChannelPtzCtrlPanel from '@/views/UI_PUBLIC/page/channel/ChannelPtzCtrlPanel.vue'
import { type XMLQuery, type XmlElement } from '@/utils/xmlParse'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import AlarmBaseResourceData from './AlarmBaseResourceData.vue'

export default defineComponent({
    components: {
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
        type CanvasPolygonAreaType = 'detectionArea' | 'maskArea' | 'regionArea' // 侦测-"detectionArea"/屏蔽-"maskArea"/矩形-"regionArea"

        const systemCaps = useCababilityStore()
        const { Translate } = useLangStore()
        const playerRef = ref<PlayerInstance>()

        const AREA_TYPE_MAPPING: Record<string, string> = {
            perimeter: 'perimeter',
            entry: 'aoientry',
            leave: 'aoileave',
        }

        const pageData = ref({
            // 是否支持声音设置
            supportAlarmAudioConfig: true,
            // 请求数据失败显示提示
            reqFail: false,
            // 排程管理
            isSchedulePop: false,
            scheduleList: [] as SelectOption<string, string>[],
            // 选择的功能:param,target,trigger
            tab: 'param',
            // 是否启用侦测
            detectionEnable: false,
            // 用于对比
            originalEnable: false,
            // 侦测类型
            detectionTypeText: Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(props.chlData.supportTripwire ? 'IPC' : 'NVR'),
            // activityType 1:perimeter 2:entry 3:leave
            activityType: 'perimeter',
            // 选择的警戒面index
            warnAreaIndex: 0,
            warnAreaChecked: [] as number[],
            // 支持的活动类型列表
            supportList: [] as string[],
            // 云台锁定状态
            lockStatus: false,
            // 云台speed
            speed: 0,
            // 排程
            schedule: '',
            // 是否显示全部区域绑定值
            isShowAllArea: false,
            // 控制显示展示全部区域的checkbox
            showAllAreaVisible: true,
            // 控制显示清除全部区域按钮 >=2才显示
            clearAllVisible: true,
            // 区域活动
            areaActive: '',
            // 区域活动列表
            areaActiveList: [] as SelectOption<string, string>[],
            // 方向
            direction: '',
            // 方向列表
            directionList: [] as SelectOption<string, string>[],
            // 区域活动禁用
            areaActiveDisable: false,
            // 方向禁用
            directionDisable: false,
            // 画图相关
            // 当前画点规则 regulation==1：画矩形，regulation==0或空：画点 - (regulation=='1'则currentRegulation为true：画矩形，否则currentRegulation为false：画点)
            currentRegulation: false,
            // detectionArea侦测区域 maskArea屏蔽区域 regionArea矩形区域
            currAreaType: 'detectionArea' as CanvasPolygonAreaType,
            moreDropDown: false,
        })

        // 三种类型的数据
        const formData = ref<Record<string, AlarmPeaDto>>({
            perimeter: new AlarmPeaDto(),
            entry: new AlarmPeaDto(),
            leave: new AlarmPeaDto(),
        })
        const watchEdit = useWatchEditData(formData)

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']
        let drawer = CanvasPolygon()

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        const mode = computed(() => {
            if (!ready.value) {
                return ''
            }
            return playerRef.value!.mode
        })

        const areaType = computed(() => {
            return AREA_TYPE_MAPPING[pageData.value.activityType]
        })

        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                drawer.destroy()
                drawer = CanvasPolygon({
                    el: player.getDrawbordCanvas(),
                    regulation: pageData.value.currentRegulation,
                    onchange: changePea,
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
        // 首次加载成功 播放pea视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && watchEdit.ready.value) {
                nextTick(() => {
                    play()
                    changeTab()
                })
                stopWatchFirstPlay()
            }
        })
        /**
         * @description 修改速度
         * @param {Number} speed
         */
        const setSpeed = (speed: number) => {
            pageData.value.speed = speed
        }

        // 关闭排程管理后刷新排程列表
        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            pageData.value.schedule = getScheduleId(pageData.value.scheduleList, pageData.value.schedule)
        }

        // 对sheduleList进行处理
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        // 获取区域入侵检测数据
        const getPeaData = async () => {
            pageData.value.supportList = []
            pageData.value.areaActiveList = []
            pageData.value.directionList = []
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
            const res = await queryIntelAreaConfig(sendXML)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.schedule = getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid'))
                getPeaActivityData('perimeter', res)
                getPeaActivityData('entry', res)
                getPeaActivityData('leave', res)
                pageData.value.activityType = pageData.value.supportList[0]
                if (pageData.value.supportList.includes('perimeter')) {
                    pageData.value.areaActiveList.push({
                        value: 'perimeter',
                        label: Translate('IDCS_APPEAR'),
                    })
                }

                if (pageData.value.supportList.includes('entry') || pageData.value.supportList.includes('leave')) {
                    pageData.value.areaActiveList.push({
                        value: 'crossing',
                        label: Translate('IDCS_CROSSING'),
                    })
                    pageData.value.directionList.push({
                        value: 'entry',
                        label: Translate('IDCS_ENTRANCE'),
                    })
                    pageData.value.directionList.push({
                        value: 'leave',
                        label: Translate('IDCS_LEAVE'),
                    })
                } else {
                    pageData.value.directionDisable = true
                    pageData.value.directionList = []
                }
                pageData.value.areaActive = pageData.value.areaActiveList[0].value
                if (pageData.value.areaActive === 'perimeter') {
                    pageData.value.activityType = 'perimeter'
                    pageData.value.direction = pageData.value.directionList.length > 0 ? pageData.value.directionList[0].value : ''
                    pageData.value.directionDisable = true
                } else if (pageData.value.areaActive === 'crossing') {
                    pageData.value.activityType = pageData.value.directionList[0].value
                    pageData.value.direction = pageData.value.directionList[0].value
                    pageData.value.directionDisable = false
                }
                pageData.value.currentRegulation = formData.value[pageData.value.activityType].regulation
                pageData.value.currAreaType = pageData.value.currentRegulation ? 'regionArea' : 'detectionArea'
                watchEdit.listen()
            } else {
                pageData.value.reqFail = true
                pageData.value.tab = ''
            }
        }

        // 获取区域活动数据 perimeter/entry/leave
        const getPeaActivityData = (activityType: string, res: XMLDocument | Element) => {
            const $ = queryXml(res)
            const param = $(`content/chl/${activityType}/param`)
            if (!param.length) {
                return
            }

            const $param = queryXml(param[0].element)
            const $trigger = queryXml($(`content/chl/${activityType}/trigger`)[0].element)

            const areaData = formData.value[activityType]

            pageData.value.supportList.push(activityType)

            areaData.mutexList = $param('mutexList/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    object: $item('object').text(),
                    status: $item('status').text().bool(),
                }
            })
            areaData.mutexListEx = $param('mutexListEx/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    object: $item('object').text(),
                    status: $item('status').text().bool(),
                }
            })
            areaData.detectionEnable = $param('switch').text().bool()
            areaData.originalEnable = areaData.detectionEnable
            if (areaData.detectionEnable) {
                pageData.value.activityType = activityType
            }

            areaData.holdTime = $param('alarmHoldTime').text().num()
            areaData.holdTimeList = getAlarmHoldTimeList($param('holdTimeNote').text(), areaData.holdTime)

            const regulation = $param('content/chl/perimeter/param/boundary').attr('regulation') === '1'
            areaData.regulation = regulation

            const boundaryInfo: { point: CanvasBasePoint[]; maxCount: number }[] = []
            const regionInfo: CanvasBaseArea[] = []
            $param('boundary/item').forEach((element) => {
                const $element = queryXml(element.element)
                const boundary = {
                    point: [] as CanvasBasePoint[],
                    maxCount: $element('point').attr('maxCount').num(),
                }
                const region = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
                $element('point/item').forEach((point, index) => {
                    const $item = queryXml(point.element)
                    boundary.point.push({
                        X: $item('X').text().num(),
                        Y: $item('Y').text().num(),
                        isClosed: true,
                    })
                    getRegion(index, point, region)
                })
                boundaryInfo.push(boundary)
                regionInfo.push(region)
            })

            areaData.boundaryInfo = boundaryInfo
            areaData.regionInfo = regionInfo
            areaData.audioSuport = $param('triggerAudio').text() !== ''
            areaData.lightSuport = $param('triggerWhiteLight').text() !== ''
            areaData.hasAutoTrack = $param('autoTrack').text() !== ''
            areaData.autoTrack = $param('autoTrack').text().bool()
            areaData.pictureAvailable = $param('saveTargetPicture').text() !== ''
            areaData.saveTargetPicture = $param('saveTargetPicture').text().bool()
            areaData.saveSourcePicture = $param('saveSourcePicture').text().bool()
            areaData.pea_onlyPreson = $param('sensitivity').text() !== ''
            // NTA1-231：低配版IPC：4M S4L-C，越界/区域入侵目标类型只支持人
            areaData.onlyPersonSensitivity = formData.value[activityType].pea_onlyPreson ? $('sensitivity').text().num() : 0
            areaData.hasObj = $param('objectFilter').text() !== ''
            if (areaData.hasObj) {
                areaData.car = $param('objectFilter/car/switch').text().bool()
                areaData.person = $param('objectFilter/person/switch').text().bool()
                areaData.motorcycle = $param('objectFilter/motor/switch').text().bool()
                areaData.personSensitivity = $param('objectFilter/person/sensitivity').text().num()
                areaData.carSensitivity = $param('objectFilter/car/sensitivity').text().num()
                areaData.motorSensitivity = $param('objectFilter/motor/sensitivity').text().num()
            }

            areaData.sysAudio = $trigger('sysAudio').attr('id')
            areaData.recordSwitch = $trigger('sysRec/switch').text().bool()
            areaData.recordChls = $trigger('sysRec/chls/item').map((item) => {
                return {
                    value: item.attr('id'),
                    label: item.text(),
                }
            })
            areaData.alarmOutSwitch = $trigger('alarmOut/switch').text().bool()
            areaData.alarmOutChls = $trigger('alarmOut/alarmOuts/item').map((item) => {
                return {
                    value: item.attr('id'),
                    label: item.text(),
                }
            })
            areaData.presetSwitch = $trigger('preset/switch').text().bool()
            areaData.presets = $trigger('preset/presets/item').map((item) => {
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

            areaData.trigger = ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch'].filter((item) => {
                return $trigger(item).text().bool()
            })

            areaData.triggerList = ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch']

            if (areaData.audioSuport && props.chlData.supportAudio) {
                areaData.triggerList.push('triggerAudio')
                const triggerAudio = $param('triggerAudio').text().bool()
                if (triggerAudio) {
                    areaData.trigger.push('triggerAudio')
                }
            }

            if (areaData.lightSuport && props.chlData.supportWhiteLight) {
                areaData.triggerList.push('triggerWhiteLight')
                const triggerWhiteLight = $param('triggerWhiteLight').text().bool()
                if (triggerWhiteLight) {
                    areaData.trigger.push('triggerWhiteLight')
                }
            }
        }

        // 保存区域入侵检测数据
        const savePeaData = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}" scheduleGuid="${pageData.value.schedule}">
                        ${pageData.value.supportList
                            .map((type) => {
                                const data = formData.value[type]
                                if (type !== pageData.value.activityType) {
                                    data.detectionEnable = false
                                }
                                return rawXml`
                                    <${type}>
                                        <param>
                                            <switch>${data.detectionEnable}</switch>
                                            <alarmHoldTime unit="s">${data.holdTime}</alarmHoldTime>
                                            <boundary type="list" count="${data.boundaryInfo.length}">
                                                <itemType>
                                                    <point type="list"/>
                                                </itemType>
                                                ${data.boundaryInfo
                                                    .map((element) => {
                                                        return rawXml`
                                                            <item>
                                                                <point type="list" maxCount="${element.maxCount}" count="${element.point.length}">
                                                                    ${element.point
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
                                            </boundary>
                                            ${data.audioSuport && props.chlData.supportAudio ? `<triggerAudio>${data.trigger.includes('triggerAudio')}</triggerAudio>` : ''}
                                            ${data.lightSuport && props.chlData.supportWhiteLight ? `<triggerWhiteLight>${data.trigger.includes('triggerWhiteLight')}</triggerWhiteLight>` : ''}
                                            ${
                                                data.pictureAvailable
                                                    ? rawXml`
                                                        <saveSourcePicture>${data.saveSourcePicture}</saveSourcePicture>
                                                        <saveTargetPicture>${data.saveTargetPicture}</saveTargetPicture>
                                                    `
                                                    : ''
                                            }
                                            ${data.hasAutoTrack ? `<autoTrack>${data.autoTrack}</autoTrack>` : ''}
                                            ${data.pea_onlyPreson ? `<sensitivity>${data.onlyPersonSensitivity}</sensitivity>` : ''}
                                            ${
                                                data.hasObj
                                                    ? rawXml`
                                                        <objectFilter>
                                                            <car>
                                                                <switch>${data.car}</switch>
                                                                <sensitivity>${data.carSensitivity}</sensitivity>
                                                            </car>
                                                            <person>
                                                                <switch>${data.person}</switch>
                                                                <sensitivity>${data.personSensitivity}</sensitivity>
                                                            </person>
                                                            ${
                                                                props.chlData.accessType === '0'
                                                                    ? rawXml`
                                                                        <motor>
                                                                            <switch>${data.motorcycle}</switch>
                                                                            <sensitivity>${data.motorSensitivity}</sensitivity>
                                                                        </motor>
                                                                    `
                                                                    : ''
                                                            }
                                                        </objectFilter>
                                                    `
                                                    : ''
                                            }
                                        </param>
                                        <trigger>
                                            <sysRec>
                                                <chls type="list">
                                                    ${data.recordChls.map((element) => `<item id="${element.value}">${wrapCDATA(element.label)}</item>`).join('')}
                                                </chls>
                                            </sysRec>
                                            <alarmOut>
                                                <alarmOuts type="list">
                                                    ${data.alarmOutChls.map((element) => `<item id="${element.value}">${wrapCDATA(element.label)}</item>`).join('')}
                                                </alarmOuts>
                                            </alarmOut>
                                            <preset>
                                                <presets type="list">
                                                    ${data.presets
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
                                            <snapSwitch>${data.trigger.includes('snapSwitch')}</snapSwitch>
                                            <msgPushSwitch>${data.trigger.includes('msgPushSwitch')}</msgPushSwitch>
                                            <buzzerSwitch>${data.trigger.includes('buzzerSwitch')}</buzzerSwitch>
                                            <popVideoSwitch>${data.trigger.includes('popVideoSwitch')}</popVideoSwitch>
                                            <emailSwitch>${data.trigger.includes('emailSwitch')}</emailSwitch>
                                            <sysAudio id='${data.sysAudio}'></sysAudio>
                                        </trigger>
                                    </${type}>
                                `
                            })
                            .join('')}
                    </chl>
                </content>
            `
            openLoading()
            const result = await editIntelAreaConfig(sendXml)
            const $ = queryXml(result)
            closeLoading()
            if ($('status').text() === 'success') {
                if (formData.value[pageData.value.activityType].detectionEnable) {
                    formData.value.perimeter.originalEnable = true
                    formData.value.entry.originalEnable = true
                    formData.value.leave.originalEnable = true
                }
                // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面）
                // setPeaOcxData()
                refreshInitPage()
                watchEdit.update()
            } else {
                const errorCode = $('errorCode').text().num()
                if (errorCode === 536871053) {
                    openMessageBox(Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'))
                }
            }
        }

        // 执行保存pea数据
        const applyData = async () => {
            if (!verification()) return
            const data = formData.value[pageData.value.activityType]
            checkMutexChl({
                isChange: data.detectionEnable && data.detectionEnable !== data.originalEnable,
                mutexList: data.mutexList,
                mutexListEx: data.mutexListEx,
                chlName: props.chlData.name,
                chlIp: props.chlData.ip,
                chlList: props.onlineChannelList,
                tips: 'IDCS_SIMPLE_INVADE_DETECT_TIPS',
            }).then(() => {
                savePeaData()
            })
        }

        // 获取区域
        const getRegion = (index: number, element: XmlElement, region: CanvasBaseArea) => {
            const $ = queryXml(element.element)
            if (index === 0) {
                region.X1 = $('X').text().num()
                region.Y1 = $('Y').text().num()
            }

            if (index === 1) {
                region.X2 = $('X').text().num()
            }

            if (index === 2) {
                region.Y2 = $('Y').text().num()
            }
        }

        // 获取矩形区域点列表
        const getRegionPoints = (points: CanvasBaseArea) => {
            const pointList = []
            pointList.push({ X: points.X1, Y: points.Y1, isClosed: true })
            pointList.push({ X: points.X2, Y: points.Y1, isClosed: true })
            pointList.push({ X: points.X2, Y: points.Y2, isClosed: true })
            pointList.push({ X: points.X1, Y: points.Y2, isClosed: true })
            return pointList
        }

        // pea检验区域合法性
        const verification = () => {
            // 区域为多边形时，检测区域合法性(区域入侵AI事件中：currentRegulation为false时区域为多边形；currentRegulation为true时区域为矩形-联咏IPC)
            if (!pageData.value.currentRegulation) {
                const allRegionList: CanvasBasePoint[][] = []
                const type = pageData.value.activityType
                const boundaryInfoList = formData.value[type].boundaryInfo
                boundaryInfoList.forEach((ele) => {
                    allRegionList.push(ele.point)
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
            }
            return true
        }

        // pea tab点击事件
        const changeTab = () => {
            if (pageData.value.tab === 'param') {
                const type = pageData.value.activityType
                const area = pageData.value.warnAreaIndex
                const boundaryInfo = formData.value[type].boundaryInfo
                if (mode.value === 'h5') {
                    drawer.setEnable(true)
                    setPeaOcxData()
                }

                if (mode.value === 'ocx') {
                    setTimeout(() => {
                        if (boundaryInfo[area].point.length) {
                            const sendXML1 = OCX_XML_SetPeaArea(boundaryInfo[area].point, pageData.value.currentRegulation)
                            plugin.ExecuteCmd(sendXML1)
                        }

                        const sendXML2 = OCX_XML_SetPeaAreaAction('EDIT_ON')
                        plugin.ExecuteCmd(sendXML2)
                    }, 100)
                }

                if (pageData.value.isShowAllArea) {
                    showAllPeaArea(true)
                }
            } else if (pageData.value.tab === 'target') {
                showAllPeaArea(false)
                if (mode.value === 'h5') {
                    drawer.clear()
                    drawer.setEnable(false)
                }

                if (mode.value === 'ocx') {
                    setTimeout(() => {
                        const sendXML1 = OCX_XML_SetPeaAreaAction('NONE')
                        plugin.ExecuteCmd(sendXML1)

                        const sendXML2 = OCX_XML_SetPeaAreaAction('EDIT_OFF')
                        plugin.ExecuteCmd(sendXML2)
                    }, 100)
                }
            }
        }

        // pea刷新页面数据
        const refreshInitPage = () => {
            const type = pageData.value.activityType
            if (pageData.value.currentRegulation) {
                // 画矩形
                const regionInfoList = formData.value[type].regionInfo
                pageData.value.warnAreaChecked = regionInfoList.map((ele, index) => {
                    if (ele.X1 || ele.Y1 || ele.X2 || ele.Y2) {
                        return index
                    }
                    return -1
                })

                // 是否显示全部区域切换按钮和清除全部按钮（区域数量大于等于2时才显示）
                if (regionInfoList && regionInfoList.length > 1) {
                    pageData.value.showAllAreaVisible = true
                    pageData.value.clearAllVisible = true
                } else {
                    pageData.value.showAllAreaVisible = false
                    pageData.value.clearAllVisible = false
                }
            } else {
                // 画点
                const boundaryInfoList = formData.value[type].boundaryInfo
                pageData.value.warnAreaChecked = boundaryInfoList.map((ele, index) => {
                    if (ele.point.length) {
                        return index
                    }
                    return -1
                })

                // 是否显示全部区域切换按钮和清除全部按钮（区域数量大于等于2时才显示）
                if (boundaryInfoList && boundaryInfoList.length > 1) {
                    pageData.value.showAllAreaVisible = true
                    pageData.value.clearAllVisible = true
                } else {
                    pageData.value.showAllAreaVisible = false
                    pageData.value.clearAllVisible = false
                }
            }
        }

        // 初始化数据
        const initPageData = async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            pageData.value.detectionTypeText = Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(props.chlData.supportPea ? 'IPC' : 'NVR')
            await getPeaData()
            pageData.value.currentRegulation = formData.value[pageData.value.activityType].regulation
            pageData.value.currAreaType = pageData.value.currentRegulation ? 'regionArea' : 'detectionArea'
            refreshInitPage()
            if (props.chlData.supportAutoTrack) {
                getPTZLockStatus()
            }
        }

        // pea执行是否显示全部区域
        const toggleShowAllArea = () => {
            showAllPeaArea(pageData.value.isShowAllArea)
        }

        // pea切换区域活动操作
        const changeAreaActive = () => {
            if (pageData.value.areaActive === 'perimeter') {
                pageData.value.activityType = 'perimeter'
                pageData.value.directionDisable = true
            } else {
                pageData.value.activityType = pageData.value.directionList[0].value
                pageData.value.direction = pageData.value.directionList[0].value
                pageData.value.directionDisable = false
            }
            // 初始化区域活动的数据
            pageData.value.currentRegulation = formData.value[pageData.value.activityType].regulation
            pageData.value.currAreaType = pageData.value.currentRegulation ? 'regionArea' : 'detectionArea'
            refreshInitPage()
            setPeaOcxData()
        }

        // pea切换方向操作
        const changeDirection = () => {
            pageData.value.activityType = pageData.value.direction
            // 初始化区域活动的数据
            pageData.value.currentRegulation = formData.value[pageData.value.activityType].regulation
            pageData.value.currAreaType = pageData.value.currentRegulation ? 'regionArea' : 'detectionArea'
            refreshInitPage()
            setPeaOcxData()
        }

        // pea选择警戒区域
        const changeWarnArea = () => {
            // pageData.value.warnAreaIndex = index
            setPeaOcxData()
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
                    pageData.value.lockStatus = !pageData.value.lockStatus
                }
            })
        }

        // pea
        // pea绘图
        const changePea = (points: CanvasBaseArea | CanvasBasePoint[]) => {
            const type = pageData.value.activityType
            const area = pageData.value.warnAreaIndex
            if (formData.value[type].regulation) {
                if (!Array.isArray(points)) {
                    formData.value[type].boundaryInfo[area].point = getRegionPoints(points)
                    formData.value[type].regionInfo[area] = points
                }
            } else {
                if (Array.isArray(points)) {
                    formData.value[type].boundaryInfo[area].point = points
                }
            }

            if (pageData.value.isShowAllArea) {
                showAllPeaArea(true)
            }
            refreshInitPage()
        }

        // pea是否显示所有区域
        const showAllPeaArea = (isShowAll: boolean) => {
            if (mode.value === 'h5') {
                drawer.setEnableShowAll(isShowAll)
            }

            if (isShowAll) {
                const type = pageData.value.activityType
                const index = pageData.value.warnAreaIndex
                if (pageData.value.currentRegulation) {
                    // 画矩形
                    const regionInfoList = formData.value[type].regionInfo

                    if (mode.value === 'h5') {
                        drawer.setCurrAreaIndex(index, pageData.value.currAreaType)
                        drawer.drawAllRegion(regionInfoList, index)
                    }

                    if (mode.value === 'ocx') {
                        const pluginRegionInfoList = cloneDeep(regionInfoList)
                        pluginRegionInfoList.splice(index, 1) // 插件端下发全部区域需要过滤掉当前区域数据
                        const sendXML = OCX_XML_SetAllArea({ regionInfoList: pluginRegionInfoList }, 'Rectangle', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', true)
                        plugin.ExecuteCmd(sendXML)
                    }
                } else {
                    // 画点
                    const boundaryInfo: CanvasBasePoint[][] = []
                    const boundaryInfoList = formData.value[type].boundaryInfo
                    boundaryInfoList.forEach((ele, idx) => {
                        boundaryInfo[idx] = ele.point.map((item) => {
                            return {
                                X: item.X,
                                Y: item.Y,
                                isClosed: item.isClosed,
                            }
                        })
                    })

                    if (mode.value === 'h5') {
                        drawer.setCurrAreaIndex(index, pageData.value.currAreaType)
                        drawer.drawAllPolygon(boundaryInfo, [], pageData.value.currAreaType, index, true)
                    }

                    if (mode.value === 'ocx') {
                        const sendXML = OCX_XML_SetAllArea({ detectAreaInfo: boundaryInfo }, 'IrregularPolygon', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', true)
                        plugin.ExecuteCmd(sendXML)
                    }
                }
            } else {
                if (mode.value === 'ocx') {
                    if (pageData.value.currentRegulation) {
                        // 画矩形
                        const sendXML = OCX_XML_SetAllArea({}, 'Rectangle', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', false)
                        plugin.ExecuteCmd(sendXML)
                    } else {
                        // 画点
                        const sendXML = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', false)
                        plugin.ExecuteCmd(sendXML)
                    }
                }
                setPeaOcxData()
            }
        }

        // pea显示
        const setPeaOcxData = () => {
            const type = pageData.value.activityType
            const area = pageData.value.warnAreaIndex
            const boundaryInfo = formData.value[type].boundaryInfo
            const regionInfo = formData.value[type].regionInfo
            if (boundaryInfo.length) {
                if (mode.value === 'h5') {
                    drawer.setCurrAreaIndex(area, pageData.value.currAreaType)
                    if (pageData.value.currentRegulation) {
                        // 画矩形
                        drawer.setArea(regionInfo[area])
                    } else {
                        // 画点
                        drawer.setPointList(boundaryInfo[area].point, true)
                    }
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPeaArea(boundaryInfo[area].point, pageData.value.currentRegulation)
                    plugin.ExecuteCmd(sendXML)
                }
            }

            if (pageData.value.isShowAllArea) {
                showAllPeaArea(true)
            }
        }

        // 区域关闭
        const closePath = (points: CanvasBasePoint[]) => {
            const currType = pageData.value.activityType
            const area = pageData.value.warnAreaIndex
            formData.value[currType].boundaryInfo[area].point = points
            formData.value[currType].boundaryInfo[area].point.forEach((ele) => {
                ele.isClosed = true
            })
        }

        // 提示区域关闭
        const forceClosePath = (canBeClosed: boolean) => {
            if (!canBeClosed) {
                openMessageBox(Translate('IDCS_INTERSECT'))
            }
        }

        // 清空当前区域对话框
        const clearCurrentArea = () => {
            const currType = pageData.value.activityType
            const area = pageData.value.warnAreaIndex
            // const length = cloneDeep(formData.value[currType]['boundaryInfo'][area]['point'].length)
            // if (length == 6) {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DRAW_CLEAR_TIP'),
            }).then(() => {
                formData.value[currType].boundaryInfo[area].point = []

                if (mode.value === 'h5') {
                    drawer.clear()
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                    plugin.ExecuteCmd(sendXML)
                }

                if (pageData.value.isShowAllArea) {
                    showAllPeaArea(true)
                }
            })
            // }
        }

        // 清空当前区域按钮
        const clearArea = () => {
            const currType = pageData.value.activityType
            const area = pageData.value.warnAreaIndex
            formData.value[currType].boundaryInfo[area].point = []
            formData.value[currType].regionInfo[area] = { X1: 0, Y1: 0, X2: 0, Y2: 0 }

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            if (pageData.value.isShowAllArea) {
                showAllPeaArea(true)
            }
        }

        // 清空所有区域
        const clearAllArea = () => {
            const type = pageData.value.activityType
            const regionInfoList = formData.value[type].regionInfo
            const boundaryInfoList = formData.value[type].boundaryInfo
            if (pageData.value.currentRegulation) {
                // 画矩形
                regionInfoList.forEach((ele) => {
                    ele.X1 = 0
                    ele.Y1 = 0
                    ele.X2 = 0
                    ele.Y2 = 0
                })
            } else {
                // 画点
                boundaryInfoList.forEach((ele) => {
                    ele.point = []
                })
            }

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                if (pageData.value.currentRegulation) {
                    // 画矩形
                    const sendXML = OCX_XML_SetAllArea({}, 'Rectangle', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', pageData.value.isShowAllArea)
                    plugin.ExecuteCmd(sendXML)
                } else {
                    // 画点
                    const sendXML = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', pageData.value.isShowAllArea)
                    plugin.ExecuteCmd(sendXML)
                }
                const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            if (pageData.value.isShowAllArea) {
                showAllPeaArea(true)
            }
        }

        const notify = ($: XMLQuery, stateType: string) => {
            // 区域入侵
            if (stateType === 'PeaArea') {
                if ($('statenotify/points').length) {
                    const currType = pageData.value.activityType
                    const points = $('statenotify/points/item').map((element) => {
                        const X = element.attr('X').num()
                        const Y = element.attr('Y').num()
                        return { X, Y }
                    })
                    const area = pageData.value.warnAreaIndex
                    if (pageData.value.currentRegulation) {
                        formData.value[currType].boundaryInfo[area].point = points
                        formData.value[currType].regionInfo[area] = {
                            X1: points[0].X,
                            Y1: points[0].Y,
                            X2: points[1].X,
                            Y2: points[2].Y,
                        }
                    } else {
                        formData.value[currType].boundaryInfo[area].point = points
                    }
                    refreshInitPage()
                }

                const errorCode = $('statenotify/errorCode').text().num()
                // 处理错误码
                if (errorCode === 517) {
                    // 517-区域已闭合
                    clearCurrentArea()
                } else if (errorCode === 515) {
                    // 515-区域有相交直线，不可闭合
                    openMessageBox(Translate('IDCS_INTERSECT'))
                }
            }
        }

        onMounted(async () => {
            await getScheduleList()
            initPageData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                const sendAreaXML = OCX_XML_SetPeaAreaAction('NONE')
                plugin.ExecuteCmd(sendAreaXML)
                if (pageData.value.currentRegulation) {
                    // 画矩形
                    const sendAllAreaXML = OCX_XML_SetAllArea({}, 'Rectangle', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', false)
                    plugin.ExecuteCmd(sendAllAreaXML)
                } else {
                    // 画点
                    const sendAllAreaXML = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', false)
                    plugin.ExecuteCmd(sendAllAreaXML)
                }
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }

            drawer.destroy()
        })

        return {
            pageData,
            formData,
            watchEdit,
            playerRef,
            notify,
            handlePlayerReady,
            setSpeed,
            closeSchedulePop,
            applyData,
            changeTab,
            toggleShowAllArea,
            changeAreaActive,
            changeDirection,
            changeWarnArea,
            editLockStatus,
            clearArea,
            clearAllArea,
            areaType,
        }
    },
})
