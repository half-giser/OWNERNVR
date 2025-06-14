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
import AlarmBaseIPSpeakerSelector from './AlarmBaseIPSpeakerSelector.vue'
import AlarmBaseResourceData from './AlarmBaseResourceData.vue'
import AlarmBaseErrorPanel from './AlarmBaseErrorPanel.vue'

export default defineComponent({
    components: {
        ChannelPtzCtrlPanel,
        AlarmBaseRecordSelector,
        AlarmBaseAlarmOutSelector,
        AlarmBaseTriggerSelector,
        AlarmBasePresetSelector,
        AlarmBaseIPSpeakerSelector,
        AlarmBaseResourceData,
        AlarmBaseErrorPanel,
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
        let currAreaType: CanvasPolygonAreaType = 'detectionArea' // detectionArea侦测区域 maskArea屏蔽区域 regionArea矩形区域

        const AREA_TYPE_MAPPING: Record<string, string> = {
            perimeter: 'perimeter',
            entry: 'aoientry',
            leave: 'aoileave',
        }

        const detectTargetTypeTip: Record<string, string> = {
            person: Translate('IDCS_DETECTION_PERSON'),
            car: Translate('IDCS_DETECTION_VEHICLE'),
            motor: Translate('IDCS_NON_VEHICLE'),
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
            // 配置模式
            objectFilterMode: 'mode1',
            // 侦测类型
            detectionTypeText: Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(props.chlData.supportTripwire ? 'IPC' : 'NVR'),
            // activityType 1:perimeter 2:entry 3:leave
            activityType: 'perimeter',
            // 选择的警戒区域index
            warnAreaIndex: 0,
            warnAreaChecked: [] as number[],
            // 记住最新选择的警戒区域，后面选择屏蔽区域时，用此index去舒初始化页面
            lastSelectWarnArea: 0,
            // 选择的屏蔽区域index，页面初始化时未选择屏蔽区域
            maskAreaIndex: -1,
            maskAreaChecked: [] as number[],
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
            // 控制显示最值区域
            isShowDisplayRange: false,
            // 画图相关
            // 当前画点规则 regulation==1：画矩形，regulation==0或空：画点 - (regulation=='1'则currentRegulation为true：画矩形，否则currentRegulation为false：画点)
            currentRegulation: false,
            moreDropDown: false,
            // 高级弹出框的位置
            poppeOptions: {
                placement: 'bottom-end',
                modifiers: [
                    {
                        name: 'offset',
                        options: { offset: [30, 7] }, // [水平偏移, 垂直偏移]
                    },
                ],
            },
        })

        const formData = ref(new AlarmPeaDto())
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

        // 显示人的勾选框 + 灵敏度配置项
        const showAllPersonTarget = computed(() => {
            const warnAreaIndex = pageData.value.lastSelectWarnArea
            const hasBoundaryInfo = formData.value.boundaryInfo.length > 0
            return hasBoundaryInfo && formData.value.boundaryInfo[warnAreaIndex].objectFilter.supportPerson
        })

        // 显示车的勾选框 + 灵敏度配置项
        const showAllCarTarget = computed(() => {
            const warnAreaIndex = pageData.value.lastSelectWarnArea
            const hasBoundaryInfo = formData.value.boundaryInfo.length > 0
            return hasBoundaryInfo && formData.value.boundaryInfo[warnAreaIndex].objectFilter.supportCar
        })

        // 显示摩托车的勾选框 + 灵敏度配置项
        const showAllMotorTarget = computed(() => {
            const warnAreaIndex = pageData.value.lastSelectWarnArea
            const hasBoundaryInfo = formData.value.boundaryInfo.length > 0
            return hasBoundaryInfo && formData.value.boundaryInfo[warnAreaIndex].objectFilter.supportMotor
        })

        // 显示人的灵敏度配置项
        const showPersonSentity = computed(() => {
            const warnAreaIndex = pageData.value.lastSelectWarnArea
            const hasBoundaryInfo = formData.value.boundaryInfo.length > 0
            return hasBoundaryInfo && formData.value.boundaryInfo[warnAreaIndex].objectFilter.person.supportSensitivity
        })

        // 显示车的灵敏度配置项
        const showCarSentity = computed(() => {
            const warnAreaIndex = pageData.value.lastSelectWarnArea
            const hasBoundaryInfo = formData.value.boundaryInfo.length > 0
            return hasBoundaryInfo && formData.value.boundaryInfo[warnAreaIndex].objectFilter.car.supportSensitivity
        })

        // 显示摩托车的灵敏度配置项
        const showMotorSentity = computed(() => {
            const warnAreaIndex = pageData.value.lastSelectWarnArea
            const hasBoundaryInfo = formData.value.boundaryInfo.length > 0
            return hasBoundaryInfo && formData.value.boundaryInfo[warnAreaIndex].objectFilter.motor.supportSensitivity
        })

        /**
         * @description 播放器准备就绪回调
         */
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
         * @description 获取区域入侵检测数据
         */
        const getPeaData = async () => {
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
            const res = await queryPerimeter(sendXML)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.schedule = getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid'))
                getPeaActivityData(res)
                pageData.value.currentRegulation = formData.value.regulation
                currAreaType = pageData.value.currentRegulation ? 'regionArea' : 'detectionArea'
                watchEdit.listen()
            } else {
                pageData.value.reqFail = true
                pageData.value.tab = ''
            }
        }

        /**
         * @description 获取区域检测数据
         * @param {XMLDocument | Element} res
         */
        const getPeaActivityData = (res: XMLDocument | Element) => {
            const $ = queryXml(res)
            const param = $('content/chl/param')
            if (!param.length) {
                return
            }

            const $param = queryXml(param[0].element)
            const $trigger = queryXml($('content/chl/trigger')[0].element)

            const areaData = formData.value

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

            areaData.holdTime = $param('alarmHoldTime').text().num()
            areaData.holdTimeList = getAlarmHoldTimeList($param('holdTimeNote').text(), areaData.holdTime)

            // 时间阈值（秒）
            areaData.supportDuration = $param('duration').text() !== ''
            areaData.duration = {
                value: $param('duration').text().num(),
                min: $param('duration').attr('min').num(),
                max: $param('duration').attr('max').num(),
            }

            // 屏蔽区域
            areaData.supportMaskArea = $param('maskArea').text() !== ''
            const maskAreaInfo: { point: CanvasBasePoint[]; maxCount: number }[] = []
            $param('maskArea/item').forEach((element) => {
                const $element = queryXml(element.element)
                const maskArea = {
                    point: [] as CanvasBasePoint[],
                    maxCount: $element('point').attr('maxCount').num(),
                }
                $element('point/item').forEach((point) => {
                    const $item = queryXml(point.element)
                    maskArea.point.push({
                        X: $item('X').text().num(),
                        Y: $item('Y').text().num(),
                        isClosed: true,
                    })
                })
                maskAreaInfo.push(maskArea)
            })
            areaData.maskAreaInfo = maskAreaInfo

            const regulation = $param('content/chl/param/boundary').attr('regulation') === '1'
            areaData.regulation = regulation

            // 解析检测目标的数据
            const objectFilterMode = getCurrentAICfgMode('boundary', $param)
            pageData.value.objectFilterMode = objectFilterMode
            const $paramObjectFilter = $('content/chl/param/objectFilter')
            let objectFilter = ref(new AlarmObjectFilterCfgDto())
            if (objectFilterMode === 'mode1') {
                // 模式一
                if ($param('objectFilter').text() !== '') {
                    objectFilter = getObjectFilterData(objectFilterMode, $paramObjectFilter, [])
                }
            }
            const boundaryInfo: {
                objectFilter: AlarmObjectFilterCfgDto
                point: CanvasBasePoint[]
                maxCount: number
            }[] = []
            const regionInfo: CanvasBaseArea[] = []
            $param('boundary/item').forEach((element) => {
                const $element = queryXml(element.element)
                const needResetObjectList = ['mode2', 'mode3', 'mode5']
                const needResetObjectFilter = needResetObjectList.indexOf(objectFilterMode) !== -1
                if (needResetObjectFilter) {
                    const $resultNode = objectFilterMode === 'mode2' ? $paramObjectFilter : []
                    objectFilter = getObjectFilterData(objectFilterMode, $element('objectFilter'), $resultNode)
                }

                // ONVIF存在每个区域有公共灵敏度和开关
                if (objectFilterMode === 'mode5') {
                    // NTA1-3733 存在只有开关的情况
                    const supportCommonEnable = $element('switch').length > 0
                    const supportCommonSensitivity = supportCommonEnable && $element('>sensitivity').length > 0
                    if (supportCommonSensitivity) {
                        objectFilter.value.supportCommonEnable = supportCommonEnable
                        objectFilter.value.supportCommonSensitivity = supportCommonSensitivity
                        objectFilter.value.commonSensitivity.enable = $element('switch').text().bool()
                        objectFilter.value.commonSensitivity.value = $element('sensitivity').text().num()
                        objectFilter.value.commonSensitivity.min = $element('sensitivity').attr('min').num()
                        objectFilter.value.commonSensitivity.max = $element('sensitivity').attr('max').num()
                    } else if (supportCommonEnable) {
                        objectFilter.value.supportCommonEnable = supportCommonEnable
                        objectFilter.value.commonSensitivity.enable = $element('switch').text().bool()
                    }
                }
                const boundary = {
                    objectFilter: objectFilter.value,
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
            areaData.onlyPerson = $param('sensitivity').text() !== ''
            // NTA1-231：低配版IPC：4M S4L-C，越界/区域入侵目标类型只支持人
            areaData.sensitivity = formData.value.onlyPerson ? $('sensitivity').text().num() : 0

            // 默认用boundaryInfo的第一个数据初始化检测目标
            if (formData.value.boundaryInfo[0].objectFilter.detectTargetList.length) {
                formData.value.detectTargetList = formData.value.boundaryInfo[0].objectFilter.detectTargetList.map((item) => {
                    return {
                        value: item,
                        label: detectTargetTypeTip[item],
                    }
                })
                formData.value.detectTarget = formData.value.detectTargetList[0].value
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

            areaData.ipSpeaker = $trigger('triggerAudioDevice/chls/item').map((item) => {
                return {
                    ipSpeakerId: item.attr('id'),
                    audioID: item.attr('audioID'),
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

        /**
         * @description 组装param根节点下的ObjectFilter数据
         */
        const setParamObjectFilterData = () => {
            let paramXml = ''
            const noParamObjectNodeList = ['mode0', 'mode4', 'mode5'] // 模式0,4,5不需要下发基础的objectFilter节点
            if (noParamObjectNodeList.indexOf(pageData.value.objectFilterMode) === -1) {
                // 模式1、2、3均要下发基础的objectFilter节点
                paramXml = setObjectFilterXmlData(formData.value.boundaryInfo[0].objectFilter, props.chlData)
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
         * @description 保存配置
         */
        const savePeaData = async () => {
            const data = formData.value
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}" scheduleGuid="${pageData.value.schedule}">
                        <param>
                            <switch>${data.detectionEnable}</switch>
                            <alarmHoldTime unit="s">${data.holdTime}</alarmHoldTime>
                            ${data.supportDuration ? `<duration>${data.duration.value}</duration>` : ''}
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
                                                    ${setItemObjectFilterData(element)}
                                                    ${
                                                        element.objectFilter.supportCommonSensitivity
                                                            ? rawXml`
                                                            ${element.objectFilter.supportCommonEnable ? `<switch>${element.objectFilter.commonSensitivity.enable}</switch>` : ''}
                                                            <sensitivity>${element.objectFilter.commonSensitivity.value}</sensitivity>`
                                                            : ''
                                                    }
                                            </item>
                                            `
                                    })
                                    .join('')}
                            </boundary>
                            ${
                                data.supportMaskArea
                                    ? rawXml`
                                <maskArea type="list" count="${data.maskAreaInfo.length}">
                                ${data.maskAreaInfo
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
                                </maskArea>
                            `
                                    : ''
                            }
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
                            ${data.onlyPerson ? `<sensitivity>${data.sensitivity}</sensitivity>` : ''}
                            ${setParamObjectFilterData()}
                        </param>
                        <trigger>
                            <sysRec>
                                <chls type="list">
                                    ${data.recordChls.map((element: { value: any; label: string }) => `<item id="${element.value}">${wrapCDATA(element.label)}</item>`).join('')}
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
                            <triggerAudioDevice>
                                <chls type="list">
                                ${data.ipSpeaker
                                    .map((item) => {
                                        return rawXml`<item id='${item.ipSpeakerId}' audioID='${item.audioID}'/>`
                                    })
                                    .join('')}
                                </chls>
                            </triggerAudioDevice>
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
            const result = await editPerimeter(sendXml)
            const $ = queryXml(result)
            closeLoading()
            if ($('status').text() === 'success') {
                if (formData.value.detectionEnable) {
                    formData.value.originalEnable = true
                }
                // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面）
                setPeaOcxData()
                refreshInitPage()
                watchEdit.update()
            } else {
                const errorCode = $('errorCode').text().num()
                if (errorCode === 536871053) {
                    openMessageBox(Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'))
                } else if (errorCode === 536870983) {
                    openMessageBox(Translate('IDCS_DECODE_CAPABILITY_NOT_ENOUGH'))
                } else if (errorCode === 536871091) {
                    openMessageBox(Translate('IDCS_RESOLUTION_OVER_CAPABILITY'))
                } else {
                    openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                }
            }
        }

        /**
         * @description 检测互斥通道 保存数据
         */
        const applyData = async () => {
            if (!verification()) return
            const data = formData.value
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

        /**
         * @description 获取区域
         * @param {number} index
         * @param {XmlElement} element
         * @param {CanvasBaseArea} region
         */
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

        /**
         * @description 获取矩形区域点列表
         * @param {CanvasBaseArea} points
         * @returns
         */
        const getRegionPoints = (points: CanvasBaseArea) => {
            const pointList = []
            pointList.push({ X: points.X1, Y: points.Y1, isClosed: true })
            pointList.push({ X: points.X2, Y: points.Y1, isClosed: true })
            pointList.push({ X: points.X2, Y: points.Y2, isClosed: true })
            pointList.push({ X: points.X1, Y: points.Y2, isClosed: true })
            return pointList
        }

        /**
         * @description 检验区域合法性
         * @returns {boolean}
         */
        const verification = (): boolean => {
            // 区域为多边形时，检测区域合法性(区域入侵AI事件中：currentRegulation为false时区域为多边形；currentRegulation为true时区域为矩形-联咏IPC)
            if (!pageData.value.currentRegulation) {
                const allRegionList: CanvasBasePoint[][] = []
                const boundaryInfoList = formData.value.boundaryInfo
                const maskAreaInfoList = formData.value.maskAreaInfo
                boundaryInfoList.forEach((ele) => {
                    allRegionList.push(ele.point)
                })
                maskAreaInfoList.forEach((ele) => {
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

        /**
         * @description 改变Tab
         */
        const changeTab = () => {
            if (pageData.value.tab === 'param') {
                if (mode.value === 'h5') {
                    drawer.setEnable(true)
                }

                if (mode.value === 'ocx') {
                    const maxCount = getMaxCount()
                    const sendXML = OCX_XML_SetPeaAreaAction('EDIT_ON', maxCount)
                    plugin.ExecuteCmd(sendXML)
                }

                setPeaOcxData()
            } else if (pageData.value.tab === 'target') {
                showAllPeaArea(false)
                if (mode.value === 'h5') {
                    drawer.clear()
                    drawer.setEnable(false)
                }

                if (mode.value === 'ocx') {
                    const sendXML1 = OCX_XML_SetPeaAreaAction('NONE')
                    plugin.ExecuteCmd(sendXML1)

                    const sendXML2 = OCX_XML_SetPeaAreaAction('EDIT_OFF')
                    plugin.ExecuteCmd(sendXML2)
                }
            }
        }

        /**
         * @description 刷新页面数据
         */
        const refreshInitPage = () => {
            if (pageData.value.currentRegulation) {
                // 画矩形
                const regionInfoList = formData.value.regionInfo
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
                // 画点-警戒区域
                const boundaryInfoList = formData.value.boundaryInfo
                pageData.value.warnAreaChecked = boundaryInfoList.map((ele, index) => {
                    if (ele.point.length) {
                        return index
                    }
                    return -1
                })
                // 画点-屏蔽区域
                const maskAreaInfo = formData.value.maskAreaInfo
                pageData.value.maskAreaChecked = maskAreaInfo.map((ele, index) => {
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

        /**
         * @description 初始化数据
         */
        const initPageData = async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            pageData.value.detectionTypeText = Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(props.chlData.supportPea ? 'IPC' : 'NVR')
            await getPeaData()
            pageData.value.currentRegulation = formData.value.regulation
            currAreaType = pageData.value.currentRegulation ? 'regionArea' : 'detectionArea'
            refreshInitPage()
            if (props.chlData.supportAutoTrack) {
                getPTZLockStatus()
            }
        }

        /**
         * @description 开启关闭显示全部区域
         */
        const toggleShowAllArea = () => {
            showAllPeaArea(pageData.value.isShowAllArea)
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
         * @description 选择警戒区域
         */
        const changeWarnArea = () => {
            currAreaType = 'detectionArea'
            setOtherAreaClosed()
            setPeaOcxData()
            showDisplayRange()
            // 取消选中屏蔽区域
            pageData.value.maskAreaIndex = -1
            pageData.value.lastSelectWarnArea = pageData.value.warnAreaIndex
        }

        /**
         * @description 选择屏蔽区域
         */
        const changeMaskArea = () => {
            currAreaType = 'maskArea'
            setOtherAreaClosed()
            setPeaOcxData()
            showDisplayRange()
            // 取消选中警戒区域
            pageData.value.warnAreaIndex = -1
        }

        /**
         * @description 校验目标范围最大最小值
         * @param {string} type
         */
        const checkMinMaxRange = (type: string) => {
            const warnAreaIndex = pageData.value.lastSelectWarnArea
            const detectTarget = formData.value.detectTarget
            // 最小区域宽
            const minTextW = formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].minRegionInfo.width
            // 最小区域高
            const minTextH = formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].minRegionInfo.height
            // 最大区域宽
            const maxTextW = formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].maxRegionInfo.width
            // 最大区域高
            const maxTextH = formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].maxRegionInfo.height

            const errorMsg = Translate('IDCS_MIN_LESS_THAN_MAX')
            switch (type) {
                case 'minTextW':
                    if (minTextW >= maxTextW) {
                        openMessageBox(errorMsg)
                        formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].minRegionInfo.width = maxTextW - 1
                    }
                    break
                case 'minTextH':
                    if (minTextH >= maxTextH) {
                        openMessageBox(errorMsg)
                        formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].minRegionInfo.height = maxTextH - 1
                    }
                    break
                case 'maxTextW':
                    if (maxTextW <= minTextW) {
                        openMessageBox(errorMsg)
                        formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].maxRegionInfo.width = minTextW + 1
                    }
                    break
                case 'maxTextH':
                    if (maxTextH <= minTextH) {
                        openMessageBox(errorMsg)
                        formData.value.boundaryInfo[warnAreaIndex].objectFilter[detectTarget].maxRegionInfo.height = minTextH + 1
                    }
                    break
                default:
                    break
            }
        }

        /**
         * @description 获取可绘制的最大点数
         * @return {number} maxCount
         */
        const getMaxCount = (): number => {
            let maxCount = 6
            if (currAreaType === 'maskArea' && formData.value.maskAreaInfo.length > 0) {
                maxCount = formData.value.maskAreaInfo[0].maxCount
            } else if (formData.value.boundaryInfo.length > 0) {
                maxCount = formData.value.boundaryInfo[0].maxCount
            }
            return maxCount
        }

        /**
         * @description 获取云台锁定状态
         */
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

        /**
         * @description 修改云台锁定状态
         */
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

        /**
         * @description 更新区域数据
         * @param {CanvasBaseArea | CanvasBasePoint[]} points
         */
        const changePea = (points: CanvasBaseArea | CanvasBasePoint[]) => {
            const area = pageData.value.warnAreaIndex
            if (formData.value.regulation) {
                if (!Array.isArray(points)) {
                    formData.value.boundaryInfo[area].point = getRegionPoints(points)
                    formData.value.regionInfo[area] = points
                }
            } else {
                if (currAreaType === 'maskArea') {
                    const index = pageData.value.maskAreaIndex
                    formData.value.maskAreaInfo[index].point = points as CanvasBasePoint[]
                } else {
                    formData.value.boundaryInfo[area].point = points as CanvasBasePoint[]
                }
            }

            if (pageData.value.isShowAllArea) {
                showAllPeaArea(true)
            }
            refreshInitPage()
        }

        /**
         * @description 绘制所有区域
         * @param {boolean} isShowAll
         */
        const showAllPeaArea = (isShowAll: boolean) => {
            if (mode.value === 'h5') {
                drawer.setEnableShowAll(isShowAll)
            }

            if (isShowAll) {
                const index = pageData.value.warnAreaIndex
                const curIndex = currAreaType === 'maskArea' ? pageData.value.maskAreaIndex : pageData.value.warnAreaIndex
                if (pageData.value.currentRegulation) {
                    // 画矩形
                    const regionInfoList = formData.value.regionInfo

                    if (mode.value === 'h5') {
                        drawer.setCurrAreaIndex(index, currAreaType)
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
                    const boundaryInfoList = formData.value.boundaryInfo
                    const maskAreaInfo: CanvasBasePoint[][] = []
                    const maskAreaInfoList = formData.value.maskAreaInfo
                    boundaryInfoList.forEach((ele, idx) => {
                        boundaryInfo[idx] = ele.point.map((item) => {
                            return {
                                X: item.X,
                                Y: item.Y,
                                isClosed: item.isClosed,
                            }
                        })
                    })

                    maskAreaInfoList.forEach((ele, idx) => {
                        maskAreaInfo[idx] = ele.point.map((item) => {
                            return {
                                X: item.X,
                                Y: item.Y,
                                isClosed: item.isClosed,
                            }
                        })
                    })

                    if (mode.value === 'h5') {
                        drawer.setCurrAreaIndex(curIndex, currAreaType)
                        drawer.drawAllPolygon(boundaryInfo, maskAreaInfo, currAreaType, curIndex, true)
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

        /**
         * @description 是否显示大小范围区域
         */
        const showDisplayRange = () => {
            if (pageData.value.isShowDisplayRange) {
                const currentSurface = pageData.value.warnAreaIndex
                const currTargetType = formData.value.detectTarget // 人/车/非
                const minRegionInfo = formData.value.boundaryInfo[currentSurface].objectFilter[currTargetType].minRegionInfo // 最小区域
                const maxRegionInfo = formData.value.boundaryInfo[currentSurface].objectFilter[currTargetType].maxRegionInfo // 最大区域
                const minPercentW = minRegionInfo.width
                const minPercentH = minRegionInfo.height
                const maxPercentW = maxRegionInfo.width
                const maxPercentH = maxRegionInfo.height
                minRegionInfo.region = []
                maxRegionInfo.region = []
                minRegionInfo.region.push(calcRegionInfo(minPercentW, minPercentH))
                maxRegionInfo.region.push(calcRegionInfo(maxPercentW, maxPercentH))

                if (mode.value === 'h5') {
                    drawer.setRangeMin(minRegionInfo.region[0])
                    drawer.setRangeMax(maxRegionInfo.region[0])
                    drawer.toggleRange(true)
                }

                if (mode.value === 'ocx') {
                    // 插件需要先删除区域 再重新添加区域进行显示
                    const areaList = [1, 2]
                    const sendXMLClear = OCX_XML_DeleteRectangleArea(areaList)
                    plugin.ExecuteCmd(sendXMLClear)

                    const rectangles = [
                        {
                            ...minRegionInfo.region[0],
                            ID: 1,
                            text: 'Min',
                            LineColor: 'yellow',
                        },
                        {
                            ...maxRegionInfo.region[0],
                            ID: 2,
                            text: 'Max',
                            LineColor: 'yellow',
                        },
                    ]
                    const sendXML = OCX_XML_AddRectangleArea(rectangles)
                    plugin.ExecuteCmd(sendXML)
                }
            } else {
                if (mode.value === 'h5') {
                    drawer.toggleRange(false)
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
         * @description 绘制区域
         */
        const setPeaOcxData = () => {
            const area = currAreaType === 'maskArea' ? pageData.value.maskAreaIndex : pageData.value.warnAreaIndex
            const boundaryInfo = formData.value.boundaryInfo
            const maskAreaInfo = formData.value.maskAreaInfo
            const itemInfo = currAreaType === 'maskArea' ? maskAreaInfo : boundaryInfo
            const regionInfo = formData.value.regionInfo
            if (itemInfo.length) {
                if (mode.value === 'h5') {
                    // 检测区域/屏蔽区域
                    const lineStyle = currAreaType === 'maskArea' ? '#d9001b' : '#00ff00'
                    drawer.setLineStyle(lineStyle)
                    drawer.setCurrAreaIndex(area, currAreaType)
                    if (pageData.value.currentRegulation) {
                        // 画矩形
                        drawer.setArea(regionInfo[area])
                    } else {
                        // 画点
                        drawer.setPointList(itemInfo[area].point, true)
                    }
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPeaArea(itemInfo[area].point, pageData.value.currentRegulation)
                    plugin.ExecuteCmd(sendXML)
                }
            }

            if (pageData.value.isShowAllArea) {
                showAllPeaArea(true)
            }
        }

        /**
         * @description 关闭区域
         * @param {CanvasBasePoint[]} points
         */
        const closePath = (points: CanvasBasePoint[]) => {
            if (currAreaType === 'maskArea') {
                const area = pageData.value.maskAreaIndex
                formData.value.maskAreaInfo[area].point = points
                formData.value.maskAreaInfo[area].point.forEach((ele) => {
                    ele.isClosed = true
                })
            } else {
                const area = pageData.value.warnAreaIndex
                formData.value.boundaryInfo[area].point = points
                formData.value.boundaryInfo[area].point.forEach((ele) => {
                    ele.isClosed = true
                })
            }
        }

        /**
         * @description 区域是否可关闭回调
         * @param {boolean} canBeClosed
         */
        const forceClosePath = (canBeClosed: boolean) => {
            if (!canBeClosed) {
                openMessageBox(Translate('IDCS_INTERSECT'))
            }
        }

        /**
         * @description 区域是否闭合
         * @param {CanvasBasePoint} poinObjtList
         */
        const setClosed = (poinObjtList: CanvasBasePoint[]) => {
            poinObjtList.forEach((element) => {
                element.isClosed = true
            })
        }

        /**
         * @description 切换区域时判断当前区域是否可闭合
         */
        const setOtherAreaClosed = () => {
            // 画点-区域
            if (mode.value === 'h5' && !pageData.value.currentRegulation) {
                const allRegionList = [...formData.value.boundaryInfo, ...formData.value.maskAreaInfo]
                allRegionList.forEach((ele) => {
                    const poinObjtList = ele.point
                    if (poinObjtList.length >= 4 && drawer.judgeAreaCanBeClosed(poinObjtList)) {
                        setClosed(poinObjtList)
                    }
                })
            }
        }

        /**
         * @description 清空当前区域对话框
         */
        const clearCurrentArea = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DRAW_CLEAR_TIP'),
            }).then(() => {
                if (currAreaType === 'maskArea') {
                    const area = pageData.value.maskAreaIndex
                    formData.value.maskAreaInfo[area].point = []
                } else {
                    const area = pageData.value.warnAreaIndex
                    formData.value.boundaryInfo[area].point = []
                }

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
        }

        /**
         * @description 清空当前区域按钮
         */
        const clearArea = () => {
            if (currAreaType === 'maskArea') {
                const area = pageData.value.maskAreaIndex
                formData.value.maskAreaInfo[area].point = []
            } else {
                const area = pageData.value.warnAreaIndex
                formData.value.boundaryInfo[area].point = []
                formData.value.regionInfo[area] = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
            }

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

        /**
         * @description 清空所有区域
         */
        const clearAllArea = () => {
            const regionInfoList = formData.value.regionInfo
            const boundaryInfoList = formData.value.boundaryInfo
            const maskAreaInfoList = formData.value.maskAreaInfo
            if (pageData.value.currentRegulation) {
                // 画矩形
                regionInfoList.forEach((ele) => {
                    ele.X1 = 0
                    ele.Y1 = 0
                    ele.X2 = 0
                    ele.Y2 = 0
                })
            } else {
                // 画点-警戒区域
                boundaryInfoList.forEach((ele) => {
                    ele.point = []
                })
                // 画点-屏蔽区域
                maskAreaInfoList.forEach((ele) => {
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
                    const points = $('statenotify/points/item').map((element) => {
                        const X = element.attr('X').num()
                        const Y = element.attr('Y').num()
                        return { X, Y }
                    })
                    const area = pageData.value.warnAreaIndex
                    if (pageData.value.currentRegulation) {
                        formData.value.boundaryInfo[area].point = points
                        formData.value.regionInfo[area] = {
                            X1: points[0].X,
                            Y1: points[0].Y,
                            X2: points[1].X,
                            Y2: points[2].Y,
                        }
                    } else {
                        if (currAreaType === 'maskArea') {
                            const index = pageData.value.maskAreaIndex
                            formData.value.maskAreaInfo[index].point = points
                        } else {
                            formData.value.boundaryInfo[area].point = points
                        }
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
            areaType,
            showAllPersonTarget,
            showAllCarTarget,
            showAllMotorTarget,
            showPersonSentity,
            showCarSentity,
            showMotorSentity,
            notify,
            handlePlayerReady,
            setSpeed,
            closeSchedulePop,
            applyData,
            changeTab,
            getMaxCount,
            toggleShowAllArea,
            toggleDisplayRange,
            showDisplayRange,
            blurDuration,
            changeWarnArea,
            changeMaskArea,
            checkMinMaxRange,
            editLockStatus,
            clearArea,
            clearAllArea,
        }
    },
})
