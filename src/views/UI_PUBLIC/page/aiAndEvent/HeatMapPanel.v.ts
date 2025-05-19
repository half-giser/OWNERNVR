/*
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-08 17:49:20
 * @Description: 徘徊检测
 */
import { type XMLQuery } from '@/utils/xmlParse'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import Heatmap from './Heatmap.vue'
import { dayjs } from 'element-plus'

export default defineComponent({
    components: {
        AlarmBaseRecordSelector,
        AlarmBaseAlarmOutSelector,
        AlarmBaseTriggerSelector,
        AlarmBasePresetSelector,
        Heatmap,
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

        const currAreaType: CanvasPolygonAreaType = 'detectionArea' // detectionArea侦测区域 maskArea屏蔽区域 regionArea矩形区域

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
            // 选择的警戒区域index
            warnAreaIndex: 0,
            warnAreaChecked: [] as number[],
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
            // 开始时间
            startTime: '',
            // 结束时间
            endTime: '',
            // 检索目标
            searchTarget: 'person',
            // 绘制热力图相关
            hasNoChartData: true,
            renderImageW: 700,
            renderImageH: 450,
            // 热力图渲染值
            renderLevel: 100,
            imgOrigBase64: '',
            heatMapChartData: [] as AlarmHeatMapChartDto[],
            legendMin: 0,
            legendMax: 0,
            legendSrc: '',
        })

        const formData = ref(new AlarmHeatMapDto())
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

        const maxCount = computed(() => {
            let count = 6
            if (formData.value.boundaryInfo.length > 0) {
                count = formData.value.boundaryInfo[pageData.value.warnAreaIndex].maxCount
            }
            return count
        })

        // 显示人的灵敏度配置项
        const showPersonSentity = computed(() => {
            const warnAreaIndex = pageData.value.warnAreaIndex
            const hasBoundaryInfo = formData.value.boundaryInfo.length > 0
            return hasBoundaryInfo && formData.value.boundaryInfo[warnAreaIndex].objectFilter.person.supportSensitivity
        })

        // 显示车的灵敏度配置项
        const showCarSentity = computed(() => {
            const warnAreaIndex = pageData.value.warnAreaIndex
            const hasBoundaryInfo = formData.value.boundaryInfo.length > 0
            return hasBoundaryInfo && formData.value.boundaryInfo[warnAreaIndex].objectFilter.car.supportSensitivity
        })

        // 显示摩托车的灵敏度配置项
        const showMotorSentity = computed(() => {
            const warnAreaIndex = pageData.value.warnAreaIndex
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
                    regulation: false,
                    onchange: changeArea,
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
        const getData = async () => {
            const sendXML = rawXml`
                <condition>
                    <chlId>${props.currChlId}</chlId>
                </condition>
                <requireField>
                    <param/>
                </requireField>
            `
            openLoading()
            const res = await queryHeatMapConfig(sendXML)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.schedule = getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid'))
                bindCtrlData(res)
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
        const bindCtrlData = (res: XMLDocument | Element) => {
            const $ = queryXml(res)
            const param = $('content/chl/param')
            if (!param.length) {
                return
            }

            const $param = queryXml(param[0].element)

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
            formData.value.detectionEnable = $param('switch').text().bool()
            formData.value.originalEnable = $param('switch').text().bool()

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
            $param('boundary/item').forEach((element, index) => {
                const $element = queryXml(element.element)
                const needResetObjectList = ['mode2', 'mode3']
                const needResetObjectFilter = needResetObjectList.indexOf(objectFilterMode) !== -1
                if (needResetObjectFilter) {
                    const $resultNode = objectFilterMode === 'mode2' ? $paramObjectFilter : []
                    objectFilter = getObjectFilterData(objectFilterMode, $element('objectFilter'), $resultNode)
                }

                const boundary = {
                    objectFilter: objectFilter.value,
                    point: [] as CanvasBasePoint[],
                    area: index,
                    LineColor: 'green',
                    maxCount: $element('point').attr('maxCount').num(),
                }
                $element('point/item').forEach((point) => {
                    const $item = queryXml(point.element)
                    boundary.point.push({
                        X: $item('X').text().num(),
                        Y: $item('Y').text().num(),
                        isClosed: true,
                    })
                })
                boundaryInfo.push(boundary)
            })

            formData.value.boundaryInfo = boundaryInfo
            formData.value.audioSuport = $param('triggerAudio').text() !== ''
            formData.value.lightSuport = $param('triggerWhiteLight').text() !== ''
            formData.value.hasAutoTrack = $param('autoTrack').text() !== ''
            formData.value.autoTrack = $param('autoTrack').text().bool()
            formData.value.pictureAvailable = $param('saveTargetPicture').text() !== ''
            formData.value.saveTargetPicture = $param('saveTargetPicture').text().bool()
            formData.value.saveSourcePicture = $param('saveSourcePicture').text().bool()

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
        const saveData = async () => {
            const data = formData.value
            const sendXml = rawXml`
                <content>
                    <chl id="${props.currChlId}" scheduleGuid="${pageData.value.schedule}">
                        <param>
                            <switch>${data.detectionEnable}</switch>
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
            const result = await editHeatMapConfig(sendXml)
            const $ = queryXml(result)
            closeLoading()
            if ($('status').text() === 'success') {
                if (formData.value.detectionEnable) {
                    formData.value.originalEnable = true
                }
                // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面）
                setOcxData()
                refreshInitPage()
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
            if (!verification()) return
            const data = formData.value
            checkMutexChl({
                isChange: data.detectionEnable && data.detectionEnable !== data.originalEnable,
                mutexList: data.mutexList,
                mutexListEx: data.mutexListEx,
                chlName: props.chlData.name,
                chlIp: props.chlData.ip,
                chlList: props.onlineChannelList,
                tips: 'IDCS_HEAT_MAP',
                isShowCommonMsg: true,
            }).then(() => {
                saveData()
            })
        }

        /**
         * @description 检验区域合法性
         * @returns {boolean}
         */
        const verification = (): boolean => {
            // 区域为多边形时，检测区域合法性(区域入侵AI事件中：currentRegulation为false时区域为多边形；currentRegulation为true时区域为矩形-联咏IPC)
            const allRegionList: CanvasBasePoint[][] = []
            const boundaryInfoList = formData.value.boundaryInfo
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
            return true
        }

        /**
         * @description 改变Tab
         */
        const changeTab = () => {
            if (pageData.value.tab === 'param') {
                const area = pageData.value.warnAreaIndex
                const boundaryInfo = formData.value.boundaryInfo
                if (mode.value === 'h5') {
                    drawer.setEnable(true)
                    setOcxData()
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
                    showAllArea(true)
                }
            }
        }

        /**
         * @description 刷新页面数据
         */
        const refreshInitPage = () => {
            // 画点-警戒区域
            const boundaryInfoList = formData.value.boundaryInfo
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

        /**
         * @description 初始化数据
         */
        const initPageData = async () => {
            pageData.value.supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
            await getData()
            refreshInitPage()
        }

        /**
         * @description 开启关闭显示全部区域
         */
        const toggleShowAllArea = () => {
            showAllArea(pageData.value.isShowAllArea)
        }

        /**
         * @description 开关显示大小范围区域
         */
        const toggleDisplayRange = () => {
            showDisplayRange()
        }

        /**
         * @description 选择警戒区域
         */
        const changeWarnArea = () => {
            setOtherAreaClosed()
            setOcxData()
            showDisplayRange()
        }

        /**
         * @description 校验目标范围最大最小值
         * @param {string} type
         */
        const checkMinMaxRange = (type: string) => {
            const warnAreaIndex = pageData.value.warnAreaIndex
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
         * @description 更新区域数据
         * @param {CanvasBaseArea | CanvasBasePoint[]} points
         */
        const changeArea = (points: CanvasBaseArea | CanvasBasePoint[]) => {
            const area = pageData.value.warnAreaIndex
            formData.value.boundaryInfo[area].point = points
            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
            refreshInitPage()
        }

        /**
         * @description 绘制所有区域
         * @param {boolean} isShowAll
         */
        const showAllArea = (isShowAll: boolean) => {
            if (mode.value === 'h5') {
                drawer.setEnableShowAll(isShowAll)
            }

            if (isShowAll) {
                const curIndex = pageData.value.warnAreaIndex
                // 画点
                const boundaryInfo: CanvasBasePoint[][] = []
                const boundaryInfoList = formData.value.boundaryInfo
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
                    drawer.setCurrAreaIndex(curIndex, currAreaType)
                    drawer.drawAllPolygon(boundaryInfo, [], currAreaType, curIndex, true)
                }

                if (mode.value === 'ocx') {
                    // 先清除所有区域
                    const sendClearXML = OCX_XML_DeletePolygonArea('clearAll')
                    plugin.ExecuteCmd(sendClearXML)
                    // 再绘制当前区域
                    const polygonAreas = [cloneDeep(boundaryInfoList[curIndex])]
                    const sendAreaXML = OCX_XML_AddPolygonArea(polygonAreas, curIndex.toString(), true)
                    plugin.ExecuteCmd(sendAreaXML)
                    // 然后再绘制所有区域（结合上面绘制的当前区域会让当前区域有加粗效果）
                    const sendAllAreaXML = OCX_XML_AddPolygonArea(boundaryInfoList, curIndex.toString(), true)
                    plugin.ExecuteCmd(sendAllAreaXML)
                }
            } else {
                // if (mode.value === 'ocx') {
                //     // 画点
                //     const sendXML = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_PEA_DETECTION, '', false)
                //     plugin.ExecuteCmd(sendXML)
                // }
                setOcxData()
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
        const setOcxData = () => {
            const area = pageData.value.warnAreaIndex
            const boundaryInfo = formData.value.boundaryInfo
            if (boundaryInfo.length) {
                if (mode.value === 'h5') {
                    drawer.setCurrAreaIndex(area, currAreaType)
                    // 画点
                    drawer.setPointList(boundaryInfo[area].point, true)
                }

                if (mode.value === 'ocx') {
                    const sendClearXML = OCX_XML_DeletePolygonArea('clearAll')
                    plugin.ExecuteCmd(sendClearXML)
                    const sendXML = OCX_XML_AddPolygonArea(boundaryInfo[area], area, false)
                    plugin.ExecuteCmd(sendXML)
                }
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        /**
         * @description 关闭区域
         * @param {CanvasBasePoint[]} points
         */
        const closePath = (points: CanvasBasePoint[]) => {
            const area = pageData.value.warnAreaIndex
            formData.value.boundaryInfo[area].point = points
            formData.value.boundaryInfo[area].point.forEach((ele) => {
                ele.isClosed = true
            })
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
            poinObjtList.forEach(function (element) {
                element.isClosed = true
            })
        }

        /**
         * @description 切换区域时判断当前区域是否可闭合
         */
        const setOtherAreaClosed = () => {
            // 画点-区域
            if (mode.value === 'h5' && !pageData.value.currentRegulation) {
                const boundaryInfoList = formData.value.boundaryInfo
                if (boundaryInfoList && boundaryInfoList.length > 0) {
                    boundaryInfoList.forEach(function (boundaryInfo) {
                        const poinObjtList = boundaryInfo.point
                        if (poinObjtList.length >= 4 && drawer.judgeAreaCanBeClosed(poinObjtList)) {
                            setClosed(poinObjtList)
                        }
                    })
                }
            }
        }

        /**
         * @description 检索热力图统计数据
         */
        const handleStatics = async () => {
            const startTime = dayjs(pageData.value.startTime, { format: DEFAULT_DATE_FORMAT, jalali: false }).valueOf()
            const endTime = dayjs(pageData.value.endTime, { format: DEFAULT_DATE_FORMAT, jalali: false }).valueOf()
            if (endTime <= startTime) {
                openMessageBox(Translate('IDCS_END_TIME_GREATER_THAN_START'))
                return
            }
            const sendXML = rawXml`
                <condition>
                    <chlId>${props.currChlId}</chlId>
                    <startTime>${localToUtc(startTime)}</startTime>
                    <endTime>${localToUtc(endTime)}</endTime>
                </condition>
                <requireField>
                    <param/>
                </requireField>
            `
            openLoading()
            const res = await queryHeatMapStatistics(sendXML)
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.hasNoChartData = false
                const $ = queryXml(res)
                const jpgData = $('content/imageDataBase64').text()
                pageData.value.imgOrigBase64 = 'data:image/jpeg;base64,' + jpgData
                const itemType = pageData.value.searchTarget
                const points: AlarmHeatMapChartDto[] = []
                $('content/statistics/item').forEach((element) => {
                    const $item = queryXml(element.element)
                    const point_data = {
                        x: Math.floor(($item('targetX').text().num() / 10000) * pageData.value.renderImageW),
                        y: Math.floor(($item('targetY').text().num() / 10000) * pageData.value.renderImageH),
                        value: $(itemType).text(),
                    }
                    if (point_data.value !== '0') {
                        points.push(point_data)
                    }
                })
                drawImgCanvas()
                pageData.value.heatMapChartData = cloneDeep(points)
            } else {
                pageData.value.hasNoChartData = true
            }
        }

        const drawImgCanvas = () => {
            const $canvas = document.getElementById('originCanvas')
            const heatMapImg = $canvas.toDataURL() // 获取热力图的base64
            // 需要频繁读取图像数据的场景，可设置willReadFrequently属性为true，加快多个getImageData读取操作的速度
            $canvas.willReadFrequently = true // 设置
            // 获取Canvas的2D绘图上下文
            const ctx = $canvas.getContext('2d')
            // 先清除当前的canvas效果再绘制
            ctx.clearRect(0, 0, pageData.value.renderImageW, pageData.value.renderImageH)
            // 在一个cavans里面绘制原图和热力图，方便后续导出
            const imgOrigain = new Image()
            imgOrigain.src = pageData.value.imgOrigBase64 // 原图
            const imgHeatmap = new Image()
            imgHeatmap.src = heatMapImg // 热力图
            imgOrigain.onload = function () {
                ctx.drawImage(imgOrigain, 0, 0, pageData.value.renderImageW, pageData.value.renderImageH) // 绘制原图
                // 原图比热力图大，在此添加延时任务，预期原图绘制成功之后再绘制热力图
                setTimeout(
                    (imgHeatmap.onload = function () {
                        ctx.drawImage(imgHeatmap, 0, 0, pageData.value.renderImageW, pageData.value.renderImageH)
                    }),
                    100,
                )
            }
        }

        const updateLegend = (data) => {
            const legendCanvas = document.createElement('canvas')
            legendCanvas.width = 100
            legendCanvas.height = 10
            const legendCtx = legendCanvas.getContext('2d')
            let gradientCfg = {}
            if (data.gradient !== gradientCfg) {
                gradientCfg = data.gradient
                const gradient = legendCtx.createLinearGradient(0, 0, 100, 1)
                for (const key in gradientCfg) {
                    gradient.addColorStop(key, gradientCfg[key])
                }
                legendCtx.fillStyle = gradient
                legendCtx.fillRect(0, 0, 100, 10)
                pageData.value.legendMin = data.min
                pageData.value.legendMax = data.max || 10000
                pageData.value.legendSrc = legendCanvas.toDataURL()
            }
        }

        /**
         * @description 导出热力图统计数据
         */
        const handleExport = async () => {
            const fileName = props.chlData.name + '_' + formatDate(new Date(), 'YYYYMMDDHHmmss') + '.jpg'
            const dataURL = document.getElementById('originCanvas').toDataURL()

            const link = document.createElement('a')
            if (window.navigator.msSaveOrOpenBlob) {
                // 兼容IE
                const bstr = window.atob(dataURL.split(',')[1])
                let n = bstr.length
                const u8arr = new Uint8Array(n)
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n)
                }
                const blob = new Blob([u8arr])
                window.navigator.msSaveOrOpenBlob(blob, fileName)
            } else {
                // 谷歌 火狐
                link.setAttribute('href', dataURL)
                link.setAttribute('download', fileName)
                link.style.display = 'none'
                document.body.appendChild(link)
                try {
                    link.click()
                } catch (e) {
                    openMessageBox('Your browser does not support downloading pictures')
                }
            }

            setTimeout(() => {
                document.body.removeChild(link)
            }, 1000)
        }

        /**
         * @description 清空当前区域对话框
         */
        const clearCurrentArea = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DRAW_CLEAR_TIP'),
            }).then(() => {
                const area = pageData.value.warnAreaIndex
                formData.value.boundaryInfo[area].point = []

                if (mode.value === 'h5') {
                    drawer.clear()
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPeaAreaAction('NONE')
                    plugin.ExecuteCmd(sendXML)
                }

                if (pageData.value.isShowAllArea) {
                    showAllArea(true)
                }
            })
            // }
        }

        /**
         * @description 清空当前区域按钮
         */
        const clearArea = () => {
            const area = pageData.value.warnAreaIndex
            formData.value.boundaryInfo[area].point = []

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_DeletePolygonArea(area.toString())
                plugin.ExecuteCmd(sendXML)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        /**
         * @description 清空所有区域
         */
        const clearAllArea = () => {
            const boundaryInfoList = formData.value.boundaryInfo
            // 画点-警戒区域
            boundaryInfoList.forEach((ele) => {
                ele.point = []
            })

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                // 画点
                const sendXML = OCX_XML_DeletePolygonArea('clearAll')
                plugin.ExecuteCmd(sendXML)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
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
                    formData.value.boundaryInfo[area].point = points
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
            const date = new Date()
            pageData.value.startTime = dayjs(date).hour(0).minute(0).second(0).calendar('gregory').format(DEFAULT_DATE_FORMAT)
            pageData.value.endTime = dayjs(date).hour(23).minute(59).second(59).calendar('gregory').format(DEFAULT_DATE_FORMAT)
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendAreaXML = OCX_XML_AddPolygonArea([], '0', false)
                plugin.ExecuteCmd(sendAreaXML)
                // 画点
                const sendAllAreaXML = OCX_XML_DeletePolygonArea('clearAll')
                plugin.ExecuteCmd(sendAllAreaXML)
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
                pageData.value.isShowDisplayRange = false
            }

            drawer.destroy()
        })

        return {
            pageData,
            formData,
            watchEdit,
            playerRef,
            maxCount,
            showPersonSentity,
            showCarSentity,
            showMotorSentity,
            notify,
            handlePlayerReady,
            closeSchedulePop,
            applyData,
            changeTab,
            toggleShowAllArea,
            toggleDisplayRange,
            showDisplayRange,
            changeWarnArea,
            checkMinMaxRange,
            handleStatics,
            handleExport,
            clearArea,
            clearAllArea,
            updateLegend,
        }
    },
})
