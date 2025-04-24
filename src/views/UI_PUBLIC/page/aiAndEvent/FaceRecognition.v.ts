/*
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-28 13:42:09
 * @Description: AI 事件——人脸识别
 */
import { type TabPaneName, type CheckboxValueType } from 'element-plus'
import RecognitionPanel from './RecognitionPanel.vue'
import { type XMLQuery } from '@/utils/xmlParse'
import AlarmBaseChannelSelector from './AlarmBaseChannelSelector.vue'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import AlarmBaseResourceData from './AlarmBaseResourceData.vue'

export default defineComponent({
    components: {
        RecognitionPanel,
        AlarmBaseChannelSelector,
        AlarmBaseRecordSelector,
        AlarmBaseAlarmOutSelector,
        AlarmBaseTriggerSelector,
        AlarmBasePresetSelector,
        AlarmBaseResourceData,
    },
    setup() {
        const { Translate } = useLangStore()
        const router = useRouter()
        const systemCaps = useCababilityStore()

        const playerRef = ref<PlayerInstance>()

        const taskTabs = ref<SelectOption<string, string>[]>([])
        //nameId的取值为0,1,2,3;0为默认的识别成功和陌生人类型，添加的项取值不可能为0
        const defaultNameId = [1, 2, 3]
        let haveUseNameId: number[] = []
        // 人脸分组数据，初始化后不会改变
        const faceGrougMap: Record<
            string,
            {
                name: string
                groupId: string
            }
        > = {}

        type FaceGroupDto = {
            guid: string
            name: string
        }

        const faceGroupData = ref<FaceGroupDto[]>([])

        // 人脸匹配数据
        const faceMatchData = ref(new AlarmFaceMatchDto())
        const watchMatch = useWatchEditData(faceMatchData)

        // 需要用到的系统配置
        const supportFaceMatch = systemCaps.supportFaceMatch
        const showAIReourceDetail = systemCaps.showAIReourceDetail
        const localFaceDectEnabled = !!systemCaps.localFaceDectMaxCount
        const faceMatchLimitMaxChlNum = systemCaps.faceMatchLimitMaxChlNum
        const supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig
        const AISwitch = systemCaps.AISwitch

        // 侦测tab项下的界面数据
        const detectionPageData = ref({
            // '启用IPC/NVR侦测'
            deviceInfo: '',
            // 默认进入参数配置tab项
            tab: 'param',
            // 显示范围框是否选中
            isDispalyRangeChecked: false,
            snapList: [300, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 15000, 20000, 30000, 40000, 50000, 60000, 120000, 240000, 360000, 480000, 600000].map((item) => {
                let label = ''
                if (item / 1000 <= 60) {
                    label = getTranslateForSecond(item / 1000)
                } else {
                    label = getTranslateForMin(item / 1000 / 60)
                }
                return {
                    value: item.toString(),
                    label,
                }
            }),
            // 人脸曝光是否禁用
            faceExpDisabled: true,
            triggerList: ['snapSwitch', 'msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch'],
        })

        // 侦测页的数据
        const detectionFormData = ref(new AlarmFaceDetectionDto())
        const watchDetection = useWatchEditData(detectionFormData)

        // 识别tab项下的界面数据
        const recognitionPageData = ref({
            // 默认进入参数配置tab项
            tab: 'hit',
            // 相似度下拉框
            isSimilarityPop: false,
            // 相似度默认值
            similarity: 75,
            // 当前选中tab的任务数据
            taskData: {} as AlarmRecognitionTaskDto,
        })

        // 人脸识别数据
        const recognitionFormData = ref(new AlarmFaceRecognitionDto())
        const watchRecognition = useWatchEditData(recognitionFormData)

        // 整体的通用界面数据
        const pageData = ref({
            curChl: '',
            chlList: [] as AlarmFaceChlDto[],
            // 当前选择的tab项
            tab: '',
            detectionDisabled: false,
            recognitionDisabled: false,
            libraryDisabled: false,
            isRecognitionShow: true,
            isLibraryShow: true,
            // 排程
            scheduleList: [] as SelectOption<string, string>[],
            isSchedulePop: false,
            // 声音列表
            voiceList: [] as SelectOption<string, string>[],
            notSupport: false,
            // 高级设置
            isAdvance: false,
        })

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

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']
        let drawer = CanvasVfd()

        const chlData = computed(() => {
            return pageData.value.chlList.find((item) => item.id === pageData.value.curChl) || new AlarmFaceChlDto()
        })

        /**
         * @description 播放器就绪时回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                drawer.destroy()
                drawer = CanvasVfd({
                    el: player.getDrawbordCanvas(),
                    onchange: (area) => {
                        detectionFormData.value.regionInfo = [area]
                    },
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
            // const chlData = chlList[pageData.value.curChl]
            if (mode.value === 'h5') {
                player.play({
                    chlID: pageData.value.curChl,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(pageData.value.curChl, chlData.value.name)
            }

            if (chlData.value.supportVfd) {
                // 设置视频区域可编辑
                if (mode.value === 'h5') {
                    drawer.setEnable(true)
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetVfdAreaAction('EDIT_ON')
                    plugin.ExecuteCmd(sendXML)
                }
            } else {
                // 设置视频区域不可编辑
                if (mode.value === 'h5') {
                    drawer.setEnable(false)
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetVfdAreaAction('EDIT_OFF')
                    plugin.ExecuteCmd(sendXML)
                }
            }

            // 通道和tab切换时直接绘制失效，将绘制改成微任务执行
            setTimeout(() => {
                setCurrChlView('vfdArea')
            }, 0)
        }

        /**
         * @description 获取声音列表数据
         */
        const getVoiceList = async () => {
            pageData.value.voiceList = await buildAudioList()
        }

        /**
         * @description 获取通道数据
         */
        const getChlData = async () => {
            const online = await queryOnlineChlList()
            const $online = await commLoadResponseHandler(online)
            const onlineChlList = $online('content/item').map((item) => {
                return item.attr('id')
            })

            const result = await getChlList({
                requireField: ['ip', 'supportVfd', 'supportAudioAlarmOut', 'supportFire', 'supportWhiteLightAlarmOut', 'supportTemperature'],
            })
            commLoadResponseHandler(result, ($) => {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const protocolType = $item('protocolType').text()
                    const factoryName = $item('productModel').attr('factoryName')
                    if (factoryName === 'Recorder') return
                    const curChlId = item.attr('id')
                    if (protocolType !== 'RTSP' && onlineChlList.includes(curChlId)) {
                        const supportVfd = $item('supportVfd').text().bool()
                        const supportFire = $item('supportFire').text().bool()
                        const supportTemperature = $item('supportTemperature').text().bool()
                        let supportBackVfd = false
                        if (localFaceDectEnabled) {
                            // 支持人脸后侦测且人脸前侦测为false，才算支持人脸后侦测
                            supportBackVfd = !supportVfd
                        }

                        // 热成像通道（火点检测/温度检测）不支持后侦测
                        if (supportFire || supportTemperature) {
                            supportBackVfd = false
                        }

                        // 当前没有选中任何通道的情况下，初始化为第一个支持人脸识别的通道
                        if (!pageData.value.curChl) {
                            if (supportVfd || supportBackVfd) {
                                pageData.value.curChl = curChlId
                            }
                        }
                        const name = $item('name').text()

                        pageData.value.chlList.push({
                            id: curChlId,
                            name,
                            ip: $item('ip').text(),
                            chlType: $item('chlType').text(),
                            accessType: $item('accessType').text(),
                            supportVfd,
                            supportBackVfd,
                            supportAudio: $item('supportAudioAlarmOut').text().bool(),
                            supportWhiteLight: $item('supportWhiteLightAlarmOut').text().bool(),
                            showAIReourceDetail,
                            faceMatchLimitMaxChlNum,
                        })
                    }
                })
            })
        }

        /**
         * @description 通道发生改变时刷新数据
         */
        const changeChl = async () => {
            openLoading()
            pageData.value.tab = ''
            detectionPageData.value.tab = 'param'
            // 识别页切换为识别成功，-禁用
            recognitionPageData.value.tab = 'hit'

            const data = chlData.value
            pageData.value.detectionDisabled = !(data.supportVfd || data.supportBackVfd)
            pageData.value.recognitionDisabled = !(data.supportVfd || (data.supportBackVfd && supportFaceMatch))
            // TSSR-20367, 仅TD-3332B2-A1型号才会返回AISwitch字段, 此时人像库固定显示, 仅可选/置灰
            if (typeof AISwitch === 'boolean') {
                pageData.value.recognitionDisabled = false
                pageData.value.libraryDisabled = AISwitch ? true : false
            } else if (!supportFaceMatch) {
                pageData.value.isRecognitionShow = false
                // NLYH-64：非AI模式下，不支持人脸比对，可根据是否支持人脸比对supportFaceMatch来隐藏人脸识别和人脸库
                pageData.value.isLibraryShow = false
            }

            if (!(data.supportVfd || data.supportBackVfd)) {
                pageData.value.notSupport = true
            } else {
                pageData.value.notSupport = false
            }

            // handleCurrChlData()
            // 更换通道时清空上一个通道的数据
            detectionFormData.value = new AlarmFaceDetectionDto()
            recognitionFormData.value = new AlarmFaceRecognitionDto()
            faceMatchData.value = new AlarmFaceMatchDto()
            taskTabs.value = []
            faceGroupData.value = []
            haveUseNameId = []

            await getGroupData()
            await getMatchData()
            await getRecognitionData()
            await getDetectionData()
            pageData.value.tab = 'faceDetection'

            closeLoading()
        }

        /**
         * @description 获取人脸识别配置
         */
        const getVfdData = async () => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlData.value.id}</chlId>
                </condition>
                <requireField>
                    <param/>
                    <trigger/>
                </requireField>
            `
            const result = await queryVfd(sendXml)
            commLoadResponseHandler(result, ($) => {
                const $param = queryXml($('content/chl/param')[0].element)
                const $trigger = queryXml($('content/chl/trigger')[0].element)

                const enabledSwitch = $param('switch').text().bool()

                // true自定义可输入1-65534，false显示“无限制”，值为65535
                // 防止返回值是65535时，是“无限制”状态，值取默认值3
                let captureCycle = $param('senceMode/customize/captureCycle').text().num()
                let captureCycleChecked = true
                if (captureCycle === 65535) {
                    captureCycleChecked = false
                    captureCycle = 3
                }

                detectionFormData.value = {
                    supportVfd: true,
                    enabledSwitch,
                    originalSwitch: enabledSwitch,
                    holdTime: $param('holdTime').text().num(),
                    holdTimeList: getAlarmHoldTimeList($param('holdTimeNote').text(), $param('holdTime').text().num()),
                    regionInfo: $param('regionInfo/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            X1: $item('X1').text().num(),
                            Y1: $item('Y1').text().num(),
                            X2: $item('X2').text().num(),
                            Y2: $item('Y2').text().num(),
                        }
                    }),
                    mutexList: $param('mutexList/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    }),
                    mutexListEx: $param('mutexListEx/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    }),
                    saveFacePicture: $param('saveFacePicture').text().undef()?.bool(),
                    saveSourcePicture: $param('saveSourcePicture').text().undef()?.bool(),
                    snapInterval: $param('senceMode/customize/intervalTime').text(),
                    captureCycle,
                    captureCycleChecked,
                    minFaceFrame: $param('minFaceFrame').text().num(),
                    minRegionInfo: [],
                    maxFaceFrame: $param('maxFaceFrame').text().num(),
                    maxRegionInfo: [],
                    triggerAudio: $param('triggerAudio').text(),
                    triggerWhiteLight: $param('triggerWhiteLight').text(),
                    faceExpSwitch: $param('faceExp/switch').text().bool(),
                    faceExpStrength: $param('faceExp/faceExpStrength').text().num(),
                    schedule: getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid')),
                    record: $trigger('sysRec/chls/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    }),
                    alarmOut: $trigger('alarmOut/alarmOuts/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    }),
                    preset: $trigger('preset/presets/item').map((item) => {
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
                    sysAudio: $trigger('sysAudio').attr('id'),
                }

                if (!$param('senceMode/customize/faceExpStrength').length) {
                    // 先判断人脸曝光是否为空，确定是否禁用，再赋给其默认值50
                    detectionPageData.value.faceExpDisabled = true
                    detectionFormData.value.faceExpStrength = 50
                } else {
                    detectionPageData.value.faceExpDisabled = false
                }
            })

            if (detectionFormData.value.triggerAudio && chlData.value.supportAudio) {
                detectionPageData.value.triggerList.push('triggerAudio')
                if (detectionFormData.value.triggerAudio === 'true') {
                    detectionFormData.value.trigger.push('triggerAudio')
                }
            }

            if (detectionFormData.value.triggerWhiteLight && chlData.value.supportWhiteLight) {
                detectionPageData.value.triggerList.push('triggerWhiteLight')
                if (detectionFormData.value.triggerWhiteLight === 'true') {
                    detectionFormData.value.trigger.push('triggerWhiteLight')
                }
            }

            detectionPageData.value.isDispalyRangeChecked = false
        }

        /**
         * @description 获取人脸比对配置
         */
        const getBackFaceMatchData = async () => {
            const sendXml = rawXml`
                    <condition>
                        <chlId>${chlData.value.id}</chlId>
                    </condition>
                `
            const result = await queryBackFaceMatch(sendXml)
            const $ = queryXml(result)
            $('content/param/chls/item').forEach((item) => {
                if (item.attr('guid') === pageData.value.curChl) {
                    const $item = queryXml(item.element)
                    const enabledSwitch = $item('switch').text().bool()
                    detectionFormData.value.enabledSwitch = enabledSwitch
                    detectionFormData.value.originalSwitch = enabledSwitch
                    detectionFormData.value.mutexList = $item('mutexList/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    })
                    detectionFormData.value.schedule = getScheduleId(pageData.value.scheduleList, item.attr('scheduleGuid'))
                }
            })
        }

        /**
         * @description 获取人脸侦测的数据
         */
        const getDetectionData = async () => {
            watchDetection.reset()

            if (chlData.value.supportVfd) {
                await getVfdData()
            } else {
                await getBackFaceMatchData()
            }

            watchDetection.listen()
            detectionPageData.value.deviceInfo = Translate('IDCS_DETECTION_BY_DEVICE').formatForLang(chlData.value.supportVfd ? 'IPC' : 'NVR')
            setCurrChlView('vfdArea')
        }

        /**
         * @description 当前通道play上的视图
         * @param {string} type
         */
        const setCurrChlView = (type: string) => {
            if (type === 'vfdArea') {
                if (detectionFormData.value.regionInfo && detectionFormData.value.regionInfo.length > 0) {
                    if (mode.value === 'h5') {
                        drawer.setArea(detectionFormData.value.regionInfo[0])
                    }

                    if (mode.value === 'ocx') {
                        const sendXML = OCX_XML_SetVfdArea(detectionFormData.value.regionInfo[0], type, '#00ff00', OCX_AI_EVENT_TYPE_VFD_BLOCK)
                        plugin.ExecuteCmd(sendXML)
                    }
                }
            } else if (type === 'faceMax') {
                if (mode.value === 'h5') {
                    drawer.setRangeMax(detectionFormData.value.maxRegionInfo[0])
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetVfdArea(detectionFormData.value.maxRegionInfo[0], type, '#00ff00', OCX_AI_EVENT_TYPE_VFD_BLOCK)
                    plugin.ExecuteCmd(sendXML)
                }
            } else if (type === 'faceMin') {
                if (mode.value === 'h5') {
                    drawer.setRangeMin(detectionFormData.value.minRegionInfo[0])
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetVfdArea(detectionFormData.value.minRegionInfo[0], type, '#00ff00', OCX_AI_EVENT_TYPE_VFD_BLOCK)
                    plugin.ExecuteCmd(sendXML)
                }
            }
        }

        /**
         * @description 计算位置
         * @param {number} percent
         * @returns {Object}
         */
        const calcRegionInfo = (percent: number) => {
            const X1 = ((100 - percent) * 10000) / 100 / 2
            const X2 = ((100 - percent) * 10000) / 100 / 2 + (percent * 10000) / 100
            const Y1 = ((100 - percent) * 10000) / 100 / 2
            const Y2 = ((100 - percent) * 10000) / 100 / 2 + (percent * 10000) / 100
            const regionInfo = {
                X1: X1,
                Y1: Y1,
                X2: X2,
                Y2: Y2,
            }
            return regionInfo
        }

        /**
         * @description 绘制最小框
         */
        const blurMinFaceFrame = () => {
            if (detectionPageData.value.isDispalyRangeChecked) {
                const minRegionInfo = calcRegionInfo(detectionFormData.value.minFaceFrame)
                detectionFormData.value.minRegionInfo = []
                detectionFormData.value.minRegionInfo.push(minRegionInfo)
                setCurrChlView('faceMin')
            }
        }

        /**
         * @description 绘制最大框
         */
        const blurMaxFaceFrame = () => {
            if (detectionPageData.value.isDispalyRangeChecked) {
                const maxRegionInfo = calcRegionInfo(detectionFormData.value.maxFaceFrame)
                detectionFormData.value.maxRegionInfo = []
                detectionFormData.value.maxRegionInfo.push(maxRegionInfo)
                setCurrChlView('faceMax')
            }
        }

        /**
         * @description 是否显示范围框
         * @param {boolean} value
         */
        const changeDisplayRange = (value: CheckboxValueType) => {
            if (value) {
                // 显示范围框
                const minRegionInfo = calcRegionInfo(detectionFormData.value.minFaceFrame)
                detectionFormData.value.minRegionInfo = []
                detectionFormData.value.minRegionInfo.push(minRegionInfo)
                setCurrChlView('faceMin')
                const maxRegionInfo = calcRegionInfo(detectionFormData.value.maxFaceFrame)
                detectionFormData.value.maxRegionInfo = []
                detectionFormData.value.maxRegionInfo.push(maxRegionInfo)
                setCurrChlView('faceMax')
                if (mode.value === 'h5') {
                    drawer.toggleRange(true)
                }
            } else {
                if (mode.value === 'h5') {
                    drawer.toggleRange(false)
                }

                if (mode.value === 'ocx') {
                    const sendFaceMinXML = OCX_XML_SetVfdAreaAction('NONE', 'faceMin')
                    plugin.ExecuteCmd(sendFaceMinXML)

                    const sendFaceMaxXML = OCX_XML_SetVfdAreaAction('NONE', 'faceMax')
                    plugin.ExecuteCmd(sendFaceMaxXML)
                }
            }
        }

        /**
         * @description 清空绘制区域
         */
        const clearDrawArea = () => {
            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
                plugin.ExecuteCmd(sendXML)
            }

            detectionFormData.value.regionInfo = [
                {
                    X1: 0,
                    Y1: 0,
                    X2: 0,
                    Y2: 0,
                },
            ]
        }

        /**
         * @description 更改Tab
         * @param {TabPaneName} name
         */
        const changeTab = (name: TabPaneName) => {
            // if (name === 'faceDetection') {
            //     play()
            // } else
            if (name === 'faceLibrary') {
                router.push({
                    path: '/intelligent-analysis/sample-data-base/sample-data-base-face',
                    state: {
                        backChlId: pageData.value.curChl,
                    },
                })
            }
        }

        /**
         * @description 获取AI资源列表数据
         */
        const handleAIResourceError = () => {
            if (pageData.value.tab === 'faceDetection') {
                detectionFormData.value.enabledSwitch = false
            } else if (pageData.value.tab === 'faceCompare') {
                faceMatchData.value.hitEnable = false
                faceMatchData.value.notHitEnable = false
            }
        }

        /**
         * @description 删除AI资源行数据
         */
        const handleAIResourceDel = () => {
            getChlData()
        }

        /**
         * @description 提交人脸侦测数据
         */
        const applyFaceDetectionData = () => {
            checkMutexChl({
                tips: 'IDCS_SIMPLE_FACE_DETECT_TIPS',
                isChange: detectionFormData.value.enabledSwitch && detectionFormData.value.enabledSwitch !== detectionFormData.value.originalSwitch,
                mutexList: detectionFormData.value.mutexList,
                mutexListEx: detectionFormData.value.mutexListEx,
                chlList: pageData.value.chlList,
                chlIp: chlData.value.ip,
                chlName: chlData.value.name,
            }).then(() => {
                if (chlData.value.supportVfd) {
                    setDetectionData()
                } else {
                    setDetectionBackUpData()
                }
            })
        }

        /**
         * @description
         * @returns {string}
         */
        const getFaceDetectionSaveData = () => {
            const sendXml = rawXml`
                <content>
                    <chl id='${pageData.value.curChl}' scheduleGuid='${detectionFormData.value.schedule}'><param>
                    <switch>${detectionFormData.value.enabledSwitch}</switch>
                    <holdTime>${detectionFormData.value.holdTime}</holdTime>
                    ${typeof detectionFormData.value.saveFacePicture === 'boolean' ? `<saveFacePicture>${detectionFormData.value.saveFacePicture}</saveFacePicture>` : ''}
                    ${typeof detectionFormData.value.saveSourcePicture === 'boolean' ? `<saveSourcePicture>${detectionFormData.value.saveSourcePicture}</saveSourcePicture>` : ''}
                    ${
                        detectionFormData.value.snapInterval
                            ? rawXml`
                                <senceMode>
                                    <Mode>customize</Mode>
                                    <customize>
                                        <intervalTime>${detectionFormData.value.snapInterval}</intervalTime>
                                        <captureCycle>${!detectionFormData.value.captureCycleChecked ? 65535 : detectionFormData.value.captureCycle}</captureCycle>
                                    </customize>
                                </senceMode>
                            `
                            : ''
                    }
                    ${detectionFormData.value.minFaceFrame ? `<minFaceFrame>${detectionFormData.value.minFaceFrame}</minFaceFrame>` : ''}
                    ${detectionFormData.value.maxFaceFrame ? `<maxFaceFrame>${detectionFormData.value.maxFaceFrame}</maxFaceFrame>` : ''}
                    ${detectionFormData.value.triggerAudio && chlData.value.supportAudio ? `<triggerAudio>${detectionFormData.value.trigger.includes('triggerAudio')}</triggerAudio>` : ''}
                    ${detectionFormData.value.triggerWhiteLight && chlData.value.supportWhiteLight ? `<triggerWhiteLight>${detectionFormData.value.trigger.includes('triggerWhiteLight')}</triggerWhiteLight>` : ''}
                    ${
                        !detectionPageData.value.faceExpDisabled
                            ? rawXml`
                                <faceExp>
                                    <switch>${detectionFormData.value.faceExpSwitch}</switch>
                                    <faceExpStrength>${detectionFormData.value.faceExpStrength}</faceExpStrength>
                                </faceExp>
                            `
                            : ''
                    }
                    <regionInfo type='list'>
                        ${detectionFormData.value.regionInfo
                            .map(
                                (item) => rawXml`
                                    <item>
                                        <X1>${item.X1}</X1>
                                        <Y1>${item.Y1}</Y1>
                                        <X2>${item.X2}</X2>
                                        <Y2>${item.Y2}</Y2>
                                    </item>
                                `,
                            )
                            .join('')}
                    </regionInfo>
                    </param>
                        <trigger>
                            <sysRec>
                                <chls type='list'>
                                    ${detectionFormData.value.record.map((item) => `<item id='${item.value}'>${wrapCDATA(item.label)}</item>`).join('')}
                                </chls>
                            </sysRec>
                            <alarmOut>
                                <alarmOuts type='list'>
                                    ${detectionFormData.value.alarmOut.map((item) => `<item id='${item.value}'>${wrapCDATA(item.label)}</item>`).join('')}
                                </alarmOuts>
                            </alarmOut>
                            <preset>
                                <presets type='list'>
                                    ${detectionFormData.value.preset
                                        .map((item) => {
                                            return rawXml`
                                                <item>
                                                    <index>${item.index}</index>
                                                    <name>${wrapCDATA(item.name)}</name>
                                                    <chl id='${item.chl.value}'>${wrapCDATA(item.chl.label)}</chl>
                                                </item>
                                            `
                                        })
                                        .join('')}
                                </presets>
                            </preset>
                            <snapSwitch>${detectionFormData.value.trigger.includes('snapSwitch')}</snapSwitch>
                            <msgPushSwitch>${detectionFormData.value.trigger.includes('msgPushSwitch')}</msgPushSwitch>
                            <buzzerSwitch>${detectionFormData.value.trigger.includes('buzzerSwitch')}</buzzerSwitch>
                            <popVideoSwitch>${detectionFormData.value.trigger.includes('popVideoSwitch')}</popVideoSwitch>
                            <emailSwitch>${detectionFormData.value.trigger.includes('emailSwitch')}</emailSwitch>
                            <sysAudio id='${detectionFormData.value.sysAudio}'></sysAudio>
                        </trigger>
                    </chl>
                </content>
            `

            return sendXml
        }

        /**
         * @description 保存人脸识别配置
         */
        const setDetectionData = async () => {
            const sendXml = getFaceDetectionSaveData()
            openLoading()
            await editVfd(sendXml)
            closeLoading()
            if (detectionFormData.value.enabledSwitch) {
                detectionFormData.value.originalSwitch = true
            }
            watchDetection.update()
        }

        /**
         * @description 保存人脸比对配置
         */
        const setDetectionBackUpData = async () => {
            const sendXml = rawXml`
                <content>
                    <param>
                        <chls>
                            <item guid='${pageData.value.curChl}' scheduleGuid='${detectionFormData.value.schedule}'>
                                <switch>${detectionFormData.value.enabledSwitch}</switch>
                            </item>
                        </chls>
                    </param>
                </content>
            `
            openLoading()
            await editRealFaceMatch(sendXml)
            closeLoading()
            watchDetection.update()
        }

        // 首次加载成功 播放视频
        watchEffect(() => {
            if (ready.value && watchDetection.ready.value) {
                nextTick(() => {
                    if (mode.value === 'h5') {
                        drawer.clear()
                    }

                    if (mode.value === 'ocx') {
                        const sendXML = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
                        plugin.ExecuteCmd(sendXML)
                    }

                    play()

                    changeDisplayRange(false)
                })
            }
        })

        /**
         * @description 添加任务项
         */
        const addTask = () => {
            // 默认有识别成功、陌生人两项，添加的最多为3项
            if (taskTabs.value.length === 5) {
                openMessageBox(Translate('IDCS_OVER_MAX_NUMBER_LIMIT'))
                return false
            }
            const nameId = defaultNameId.find((item) => !haveUseNameId.includes(item))!
            haveUseNameId.push(nameId)
            taskTabs.value.push({
                value: 'hit' + nameId,
                label: Translate('IDCS_SUCCESSFUL_RECOGNITION') + nameId,
            })
            recognitionPageData.value.tab = 'hit' + nameId
            recognitionFormData.value.task.push({
                guid: '',
                id: '',
                ruleType: 'hit',
                pluseSwitch: false,
                groupId: [],
                nameId: nameId,
                hintword: '',
                sysAudio: DEFAULT_EMPTY_ID,
                schedule: DEFAULT_EMPTY_ID,
                record: [
                    {
                        value: pageData.value.curChl,
                        label: chlData.value.name,
                    },
                ], //添加的任务默认联动本通道
                alarmOut: [],
                snap: [],
                preset: [],
                trigger: ['msgPushSwitch'],
            })
        }

        /**
         * @description 移除任务项
         */
        const removeTask = () => {
            if (['param', 'miss', 'hit'].includes(recognitionPageData.value.tab)) {
                return false
            }
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(() => {
                haveUseNameId = haveUseNameId.filter((item) => item !== Number(recognitionPageData.value.tab[3]))
                taskTabs.value = taskTabs.value.filter((item) => item.value !== recognitionPageData.value.tab)
                recognitionFormData.value.task = recognitionFormData.value.task.filter((item) => {
                    if (item.ruleType === 'hit' && item.nameId === Number(recognitionPageData.value.tab[3])) {
                        if (item.guid) {
                            deleteRecognitionData(item)
                        }
                    } else {
                        return item
                    }
                })
                recognitionPageData.value.tab = 'hit'
            })
        }

        /**
         * @description 获取人脸分组数据
         */
        const getGroupData = async () => {
            const result = await queryFacePersonnalInfoGroupList()
            const $ = queryXml(result)
            $('content/item').forEach((item) => {
                const $item = queryXml(item.element)
                const guid = item.attr('id')
                const groupId = $item('groupId').text()

                let name = $item('name').text()
                if (!name) {
                    if (groupId === '1' || groupId === '2') {
                        name = Translate('IDCS_WHITE_LIST') + groupId
                    } else if (groupId === '3') {
                        name = Translate('IDCS_BLACK_LIST')
                    }
                }
                faceGrougMap[guid] = {
                    name,
                    groupId,
                }

                if ($item('enableAlarmSwitch').text().bool()) {
                    faceGroupData.value.push({
                        guid: guid,
                        name: name,
                    })
                }
            })
        }

        /**
         * @description 获取人脸组的人脸数量
         * @param {AlarmFaceGroupDto} item
         */
        const getGroupFaceFeatureCount = async (item: AlarmFaceGroupDto) => {
            const sendXml = rawXml`
                <pageIndex>1</pageIndex>
                <pageSize>15</pageSize>
                <condition>
                    <faceFeatureGroups type="list">
                        <item id="${item.groupId}"></item>
                    </faceFeatureGroups>
                </condition>
            `
            const result = await queryFacePersonnalInfoList(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                item.count = $('content').attr('total').num()
            } else {
                item.count = 0
            }
        }

        /**
         * @description 获取人脸识别-参数设置数据
         */
        const getMatchData = async () => {
            watchMatch.reset()

            const sendXml = rawXml`
                <condition>
                    <chlId>${pageData.value.curChl}</chlId>
                </condition>
            `
            const result = await queryFaceMatchConfig(sendXml)

            commLoadResponseHandler(result, ($) => {
                const hitEnable = $('content/chl/hitEnable').text().bool()
                const notHitEnable = $('content/chl/notHitEnable').text().bool()
                const liveDisplaySwitch = $('content/chl/liveDisplaySwitch').text().bool()
                const groupInfo: AlarmFaceGroupDto[] = $('content/chl/groupId/item').map((item) => {
                    const $item = queryXml(item.element)
                    const guid = item.attr('guid')
                    const similarity = $item('similarity').text().num()
                    const data = faceGrougMap[guid]
                    return {
                        guid: guid,
                        name: data.name,
                        groupId: data.groupId,
                        similarity: similarity,
                        count: 0,
                    }
                })

                groupInfo.forEach((item) => getGroupFaceFeatureCount(item))

                faceMatchData.value = {
                    hitEnable: hitEnable,
                    notHitEnable: notHitEnable,
                    liveDisplaySwitch: !liveDisplaySwitch,
                    groupInfo,
                }

                watchMatch.listen()
            })
        }

        /**
         * @description 更改所有人脸分组相似度
         */
        const changeAllSimilarity = () => {
            faceMatchData.value.groupInfo.forEach((item) => {
                item.similarity = recognitionPageData.value.similarity
            })
            recognitionPageData.value.isSimilarityPop = false
        }

        /**
         * @description 提交人脸匹配数据
         */
        const setMatchData = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id='${pageData.value.curChl}'>
                        <hitEnable>${faceMatchData.value.hitEnable}</hitEnable>
                        <notHitEnable>${faceMatchData.value.notHitEnable}</notHitEnable>
                        <liveDisplaySwitch>${!faceMatchData.value.liveDisplaySwitch}</liveDisplaySwitch>
                        <groupId>
                            ${faceMatchData.value.groupInfo
                                .map((item) => {
                                    return rawXml`
                                        <item guid='${item.guid}'>
                                            <similarity>${item.similarity}</similarity>
                                        </item>
                                    `
                                })
                                .join('')}
                        </groupId>
                    </chl>
                </content>
            `

            openLoading()
            const result = await editFaceMatchConfig(sendXml)
            const $ = queryXml(result)
            closeLoading()

            if ($('status').text() === 'success') {
                watchMatch.update()
            } else {
                const errorCode = $('errorCode').text().num()
                if (errorCode === ErrorCode.USER_ERROR_LIMITED_PLATFORM_VERSION_MISMATCH) {
                    openMessageBox(Translate('IDCS_MAX_CHANNEL_LIMIT').formatForLang(faceMatchLimitMaxChlNum))
                } else if (errorCode === ErrorCode.USER_ERROR_PC_LICENSE_MISMATCH) {
                    openMessageBox(Translate('IDCS_MAX_CHANNEL_LIMIT').formatForLang(faceMatchLimitMaxChlNum) + Translate('IDCS_REBOOT_DEVICE').formatForLang(Translate('IDCS_ENABLE') + 'AI')).then(
                        async () => {
                            //AISwitch 打开AI模式开关 NT-9997
                            const sendXml = rawXml`
                                <content>
                                    <AISwitch>true</AISwitch>
                                </content>
                            `
                            await editBasicCfg(sendXml)
                        },
                    )
                } else {
                    openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                }
            }
        }

        /**
         * @description 获取人脸识别数据
         */
        const getRecognitionData = async () => {
            watchRecognition.reset()

            const sendXml = rawXml`
                <condition>
                    <chlId>${pageData.value.curChl}</chlId>
                </condition>
            `
            const result = await queryFaceMatchAlarmParam(sendXml)

            commLoadResponseHandler(result, ($) => {
                recognitionFormData.value.voiceList = [{ value: '', label: Translate('IDCS_NULL') }]
                $('content/voiceItem/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    recognitionFormData.value.voiceList.push({
                        value: $item('filePath').text(),
                        label: $item('name').text(),
                    })
                })

                recognitionFormData.value.task = $('content/chl/task/item').map((item) => {
                    const $item = queryXml(item.element)
                    const nameId = $item('param/nameId').text().num()
                    const $param = queryXml($item('param')[0].element)
                    const $trigger = queryXml($item('trigger')[0].element)
                    haveUseNameId.push(nameId)
                    return {
                        guid: item.attr('guid'),
                        id: item.attr('id'),
                        ruleType: $param('ruleType').text(),
                        nameId,
                        pluseSwitch: $param('pluseSwitch').text().bool(),
                        groupId: $param('groupId/item').map((item) => item.attr('guid')),
                        hintword: $param('hint/word').text(),
                        schedule: getScheduleId(pageData.value.scheduleList, $item('schedule').attr('id')),
                        record: $trigger('sysRec/chls/item').map((item) => {
                            return {
                                value: item.attr('id'),
                                label: item.text(),
                            }
                        }),
                        alarmOut: $trigger('alarmOut/alarmOuts/item').map((item) => {
                            return {
                                value: item.attr('id'),
                                label: item.text(),
                            }
                        }),
                        snap: $trigger('sysSnap/chls/item').map((item) => {
                            return {
                                value: item.attr('id'),
                                label: item.text(),
                            }
                        }),
                        preset: $trigger('preset/presets/item').map((item) => {
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
                        trigger: ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'popMsgSwitch'].filter((item) => {
                            return $trigger(item).text().bool()
                        }),
                        sysAudio: $trigger('sysAudio').attr('id'),
                    }
                })

                recognitionFormData.value.task.forEach((item) => {
                    if (item.ruleType === 'hit' && !item.nameId) {
                        taskTabs.value.push({
                            value: 'hit',
                            label: Translate('IDCS_SUCCESSFUL_RECOGNITION'),
                        })
                        recognitionPageData.value.taskData = item
                    } else if (item.ruleType === 'miss' && !item.nameId) {
                        taskTabs.value.push({
                            value: 'miss',
                            label: Translate('IDCS_GROUP_STRANGER'),
                        })
                    } else {
                        taskTabs.value.push({
                            value: 'hit' + item.nameId,
                            label: Translate('IDCS_SUCCESSFUL_RECOGNITION') + item.nameId,
                        })
                    }
                })

                watchRecognition.listen()
            })
        }

        /**
         * @description
         * @returns {string}
         */
        const getFaceCompareSaveData = () => {
            const sendXml = rawXml`
                <content>
                    <chl id='${pageData.value.curChl}'>
                        <task>
                            ${recognitionFormData.value.task
                                .map((item) => {
                                    return rawXml`
                                        <item guid='${item.guid}' id='${item.id}'>
                                            <param>
                                                <ruleType>${item.ruleType}</ruleType>
                                                <pluseSwitch>${item.pluseSwitch}</pluseSwitch>
                                                <nameId>${item.nameId}</nameId>
                                                <groupId>
                                                    ${item.groupId.map((ele) => `<item guid='${ele}'></item>`).join('')}
                                                </groupId>
                                                <hint>
                                                    <word>${item.hintword}</word>
                                                </hint>
                                            </param>
                                            <schedule id='${item.schedule}'></schedule>
                                            <trigger>
                                                <sysAudio id='${item.sysAudio}'></sysAudio>
                                                <buzzerSwitch>${item.trigger.includes('buzzerSwitch')}</buzzerSwitch>
                                                <popMsgSwitch>${item.trigger.includes('popMsgSwitch')}</popMsgSwitch>
                                                <emailSwitch>${item.trigger.includes('emailSwitch')}</emailSwitch>
                                                <msgPushSwitch>${item.trigger.includes('msgPushSwitch')}</msgPushSwitch>
                                                <popVideo>
                                                    <switch>${item.trigger.includes('popVideoSwitch')}</switch>
                                                    <chls>
                                                        <item id='${pageData.value.curChl}'></item>
                                                    </chls>
                                                </popVideo>
                                                <alarmOut>
                                                    <switch>true</switch>
                                                    <alarmOuts type='list'>
                                                        ${item.alarmOut.map((ele) => `<item id='${ele.value}'></item>`).join('')}
                                                    </alarmOuts>
                                                </alarmOut>
                                                <preset>
                                                    <switch>${!!item.preset.length}</switch>
                                                    <presets type='list'>
                                                        ${item.preset
                                                            .map((ele) => {
                                                                return rawXml`
                                                                    <item>
                                                                        <index>${ele.index}</index>
                                                                        <name>${wrapCDATA(ele.name)}</name>
                                                                        <chl id='${ele.chl.value}'>${wrapCDATA(ele.chl.label)}</chl>
                                                                    </item>
                                                                `
                                                            })
                                                            .join('')}
                                                    </presets>
                                                </preset>
                                                <sysRec>
                                                    <switch>true</switch>
                                                    <chls type='list'>
                                                        ${item.record.map((ele) => `<item id='${ele.value}'></item>`).join('')}
                                                    </chls>
                                                </sysRec>
                                                <sysSnap>
                                                    <switch>true</switch>
                                                    <chls type='list'>
                                                        ${item.snap.map((ele) => `<item id='${ele.value}'></item>`).join('')}
                                                    </chls>
                                                </sysSnap>
                                            </trigger>
                                        </item>
                                    `
                                })
                                .join('')}
                        </task>
                    </chl>
                </content>
            `
            return sendXml
        }

        /**
         * @description 设置人脸比对配置
         */
        const setFaceCompareData = async () => {
            const sendXml = getFaceCompareSaveData()
            openLoading()
            await editFaceMatchAlarmParam(sendXml)
            closeLoading()
            recognitionPageData.value.tab = 'hit'
            watchRecognition.update()
        }

        /**
         * @description 删除人脸识别成功配置
         * @param {AlarmRecognitionTaskDto} data
         */
        const deleteRecognitionData = async (data: AlarmRecognitionTaskDto) => {
            const sendXml = rawXml`
                <condition>
                    <chl id='${pageData.value.curChl}'>
                        <task>
                            <item id='${data.id}' guid='${data.guid}'></item>
                        </task>
                    </chl>
                </condition>`
            await deleteFaceMatchAlarmParam(sendXml)
        }

        /**
         * @description 提交人脸识别数据
         */
        const applyRecognitionData = async () => {
            // 识别中监听faceMatchData和recognitionFormData两个数据
            if (!watchMatch.disabled.value) {
                await setMatchData()
            }

            if (!watchRecognition.disabled.value) {
                await setFaceCompareData()
            }
        }

        const notify = ($: XMLQuery, stateType: string) => {
            if (stateType === 'VfdArea') {
                detectionFormData.value.regionInfo = $('statenotify/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        X1: $item('X1').text().num(),
                        Y1: $item('Y1').text().num(),
                        X2: $item('X2').text().num(),
                        Y2: $item('Y2').text().num(),
                    }
                })
            }
        }

        /**
         * @description 获取排程列表
         */
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        /**
         * @description 关闭排程弹窗
         */
        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            detectionFormData.value.schedule = getScheduleId(pageData.value.scheduleList, detectionFormData.value.schedule)
        }

        onMounted(async () => {
            openLoading()

            if (supportAlarmAudioConfig) {
                await getVoiceList()
            }

            await getScheduleList()
            await getChlData()

            if (history.state.chlId) {
                if (pageData.value.chlList.some((item) => item.id === history.state.chlId)) {
                    pageData.value.curChl = history.state.chlId
                }
                delete history.state.chlId
            }

            if (!pageData.value.curChl && pageData.value.chlList.length) {
                pageData.value.curChl = pageData.value.chlList[0].id
            }

            closeLoading()

            await changeChl()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendAreaXML = OCX_XML_SetVfdAreaAction('NONE', 'vfdArea')
                plugin.ExecuteCmd(sendAreaXML)

                const sendMaxXML = OCX_XML_SetVfdAreaAction('NONE', 'faceMax')
                plugin.ExecuteCmd(sendMaxXML)

                const sendMinXML = OCX_XML_SetVfdAreaAction('NONE', 'faceMin')
                plugin.ExecuteCmd(sendMinXML)

                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }

            drawer.destroy()
        })

        return {
            chlData,
            detectionPageData,
            pageData,
            detectionFormData,
            supportAlarmAudioConfig,
            AISwitch,
            supportFaceMatch,
            showAIReourceDetail,
            playerRef,
            notify,
            changeTab,
            changeChl,
            blurMinFaceFrame,
            blurMaxFaceFrame,
            changeDisplayRange,
            clearDrawArea,
            applyFaceDetectionData,
            handlePlayerReady,
            closeSchedulePop,
            taskTabs,
            faceMatchData,
            faceGroupData,
            recognitionPageData,
            addTask,
            removeTask,
            changeAllSimilarity,
            applyRecognitionData,
            handleAIResourceError,
            handleAIResourceDel,
            recognitionFormData,
            watchDetection,
            watchMatch,
            watchRecognition,
        }
    },
})
