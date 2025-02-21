/*
 * @Description: AI 事件——更多——物品遗留与看护
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-18 09:43:49
 */
import { AlarmObjectLeftDto, type AlarmChlDto } from '@/types/apiType/aiAndEvent'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'
import CanvasPolygon from '@/utils/canvas/canvasPolygon'
import { type CanvasBasePoint, type CanvasBaseArea } from '@/utils/canvas/canvasBase'
import { type XMLQuery } from '@/utils/xmlParse'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'

export default defineComponent({
    components: {
        ScheduleManagPop,
        AlarmBaseRecordSelector,
        AlarmBaseAlarmOutSelector,
        AlarmBaseTriggerSelector,
        AlarmBasePresetSelector,
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
    },
    setup(prop) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        // 系统配置
        const supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig

        // 温度检测数据
        const formData = ref(new AlarmObjectLeftDto())
        const watchEdit = useWatchEditData(formData)

        // 播放器
        const playerRef = ref<PlayerInstance>()

        const oscTypeTip: Record<string, string> = {
            abandum: Translate('IDCS_LEAVE_BEHIND'),
            objstolen: Translate('IDCS_ARTICLE_LOSE'),
        }

        // 页面数据
        const pageData = ref({
            tab: 'param',
            reqFail: false,
            // 是否显示全部区域
            isShowAllArea: false,
            // 在只有一个区域时，不显示（显示全部区域checkbox，全部清除btn）
            isShowAllAreaCheckBox: false,
            isShowAllClearBtn: false,
            // 排程
            scheduleList: [] as SelectOption<string, string>[],
            isSchedulePop: false,
            warnArea: 0,
            warnAreaChecked: [] as number[],
            // configuredArea: [] as boolean[],
            // 声音列表
            voiceList: prop.voiceList,
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
        let drawer = CanvasPolygon()

        /**
         * @description 播放器就绪时回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                drawer.destroy()
                drawer = CanvasPolygon({
                    el: player.getDrawbordCanvas(),
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

        // drawer初始化时绑定以下函数
        const changeArea = (points: CanvasBasePoint[] | CanvasBaseArea) => {
            formData.value.boundary[pageData.value.warnArea].points = points as CanvasBasePoint[]
            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        const closePath = (points: CanvasBasePoint[]) => {
            points.forEach((item) => (item.isClosed = true))
            formData.value.boundary[pageData.value.warnArea].points = points
        }

        const forceClosePath = (canBeClosed: boolean) => {
            if (!canBeClosed) {
                openMessageBox(Translate('IDCS_INTERSECT'))
            }
        }

        const clearCurrentArea = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DRAW_CLEAR_TIP'),
            }).then(() => {
                if (!formData.value.boundary.length) return
                formData.value.boundary[pageData.value.warnArea].points = []

                if (mode.value === 'h5') {
                    drawer.clear()
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetOscAreaAction('NONE')
                    plugin.ExecuteCmd(sendXML)
                }

                if (pageData.value.isShowAllArea) {
                    showAllArea()
                }
            })
        }

        /**
         * @description 播放视频
         */
        const play = () => {
            const chlData = prop.chlData

            if (mode.value === 'h5') {
                player.play({
                    chlID: prop.currChlId,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(prop.currChlId, chlData.name)
            }

            if (mode.value === 'h5') {
                drawer.setEnable(true)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetOscAreaAction('EDIT_ON')
                plugin.ExecuteCmd(sendXML)
            }

            // 设置视频区域可编辑
            // 界面内切换tab，调用play时初始化区域
            setAreaView()
        }

        const getData = async () => {
            openLoading()
            const sendXml = rawXml`
                <condition>
                    <chlId>${prop.currChlId}</chlId>
                </condition>
                <requireField>
                    <param/>
                    <trigger/>
                </requireField>
            `
            const result = await queryOsc(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                const $param = queryXml($('content/chl/param')[0].element)
                const $trigger = queryXml($('content/chl/trigger')[0].element)

                formData.value = {
                    enabledSwitch: $param('switch').text().bool(),
                    originalSwitch: $param('switch').text().bool(),
                    holdTime: $param('holdTime').text().num(),
                    holdTimeList: getAlarmHoldTimeList($param('holdTimeNote').text(), $param('holdTime').text().num()),
                    schedule: getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid')),
                    oscTypeList: $('types/oscType/enum').map((item) => {
                        return {
                            value: item.text(),
                            label: oscTypeTip[item.text()],
                        }
                    }),
                    oscType: $param('oscType').text(),
                    areaMaxCount: $param('boundary').attr('maxCount').num(), // 支持配置几个警戒面
                    regulation: $param('boundary').attr('regulation') === '1', // 区别联咏ipc标志
                    boundary: $param('boundary/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            areaName: $item('name').text().trim(),
                            points: $item('point/item').map((ele) => {
                                const $ele = queryXml(ele.element)
                                return {
                                    X: $ele('X').text().num(),
                                    Y: $ele('Y').text().num(),
                                    isClosed: true,
                                }
                            }),
                        }
                    }),
                    mutexList: $param('mutexList/item').map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            object: $item('object').text(),
                            status: $item('status').text().bool(),
                        }
                    }),
                    maxNameLength: $param('boundary/item/name').attr('maxLen').num() || 15,
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
                    sysAudio: $('sysAudio').attr('id'),
                    trigger: ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch'].filter((item) => {
                        return $trigger(item).text().bool()
                    }),
                }
                refreshInitPage()
                watchEdit.listen()
            } else {
                pageData.value.tab = ''
                pageData.value.reqFail = true
            }
        }

        // 检测和屏蔽区域的样式初始化
        const refreshInitPage = () => {
            pageData.value.warnAreaChecked = formData.value.boundary.map((item, index) => {
                if (item.points.length) {
                    return index
                }
                return -1
            })
            // 是否显示全部区域切换按钮和清除全部按钮（区域数量大于等于2时才显示）
            if (formData.value.boundary && formData.value.boundary.length > 1) {
                pageData.value.isShowAllAreaCheckBox = true
                pageData.value.isShowAllClearBtn = true
            } else {
                pageData.value.isShowAllAreaCheckBox = false
                pageData.value.isShowAllClearBtn = false
            }
        }

        // 视频区域
        const showAllArea = () => {
            if (mode.value === 'h5') {
                drawer.setEnableShowAll(pageData.value.isShowAllArea)
            }

            if (pageData.value.isShowAllArea) {
                const detectAreaInfo = formData.value.boundary.map((item) => {
                    return item.points
                })
                if (mode.value === 'h5') {
                    const index = pageData.value.warnArea
                    drawer.setCurrAreaIndex(index, 'detectionArea')
                    drawer.drawAllPolygon(detectAreaInfo, [], 'detectionArea', index, true)
                }

                if (mode.value === 'ocx') {
                    // 非h5情况下的全部显示没有写
                    // console.log('ocx show all alarm area')
                }
            } else {
                if (mode.value === 'ocx') {
                    // console.log('ocx not show all alarm area')
                }

                setAreaView()
            }
        }

        const clearArea = () => {
            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetOscAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            if (!formData.value.boundary.length) return
            formData.value.boundary[pageData.value.warnArea].points = []
            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        const clearAllArea = () => {
            formData.value.boundary.forEach((item) => {
                item.points = []
            })

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetOscAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        // 警戒区域切换
        const changeWarnArea = () => {
            setOtherAreaClosed()
            setAreaView()
        }

        // 设置区域图形
        const setAreaView = () => {
            if (formData.value.boundary.length && formData.value.boundary[pageData.value.warnArea]) {
                if (mode.value === 'h5') {
                    drawer.setCurrAreaIndex(pageData.value.warnArea, 'detectionArea')
                    drawer.setPointList(formData.value.boundary[pageData.value.warnArea].points, true)
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetOscArea(formData.value.boundary[pageData.value.warnArea].points, formData.value.regulation)
                    plugin.ExecuteCmd(sendXML)
                }
            }

            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        // 闭合区域
        const setClosed = (points: CanvasBasePoint[]) => {
            points.forEach((item) => {
                item.isClosed = true
            })
        }

        const setOtherAreaClosed = () => {
            if (mode.value === 'h5') {
                // 画点-区域
                formData.value.boundary.forEach((item) => {
                    if (item.points.length >= 3 && drawer.judgeAreaCanBeClosed(item.points)) {
                        setClosed(item.points)
                    }
                })
            }
        }

        // 名称输入限制
        const formatAreaName = (value: string) => {
            return cutStringByByte(value, formData.value.maxNameLength)
        }

        // 回车键失去焦点
        const blurInput = (event: Event) => {
            ;(event.target as HTMLInputElement).blur()
        }

        // 检测区域合法性(物品遗留看护AI事件中：区域为多边形)
        const verification = () => {
            for (const item of formData.value.boundary) {
                const count = item.points.length
                if (count > 0 && count < 4) {
                    openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'))
                    return false
                } else if (count > 0 && !drawer.judgeAreaCanBeClosed(item.points)) {
                    openMessageBox(Translate('IDCS_INTERSECT'))
                    return false
                }
            }
            return true
        }

        const getObjectLeftSaveData = () => {
            const sendXml = rawXml`
                <content>
                    <chl id='${prop.currChlId}' scheduleGuid='${formData.value.schedule}'>
                        <param>
                            <switch>${formData.value.enabledSwitch}</switch>
                            <holdTime unit='s'>${formData.value.holdTime}</holdTime>
                            <oscType>${formData.value.oscType}</oscType>
                            <boundary type='list' count='${formData.value.boundary.length}'>
                                <itemType>
                                    <point type='list'/>
                                </itemType>
                                ${formData.value.boundary
                                    .map((item) => {
                                        return rawXml`
                                            <item>
                                                <name maxLen='${formData.value.maxNameLength}'><![CDATA[${item.areaName}]]></name>
                                                <point type='list' maxCount='6' count='${item.points.length}'>
                                                    ${item.points
                                                        .map((ele) => {
                                                            return rawXml`
                                                                <item>
                                                                    <X>${ele.X}</X>
                                                                    <Y>${ele.Y}</Y>
                                                                </item>`
                                                        })
                                                        .join('')}
                                                </point>
                                            </item>
                                        `
                                    })
                                    .join('')}
                            </boundary>
                        </param>
                        <trigger>
                            <sysRec>
                                <chls type='list'>
                                    ${formData.value.record
                                        .map((item) => {
                                            return `<item id='${item.value}'><![CDATA[${item.label}]]></item>`
                                        })
                                        .join('')}
                                </chls>
                            </sysRec>
                            <alarmOut>
                                <alarmOuts type='list'>
                                    ${formData.value.alarmOut
                                        .map((item) => {
                                            return `<item id='${item.value}'><![CDATA[${item.label}]]></item>`
                                        })
                                        .join('')}
                                </alarmOuts>
                            </alarmOut>
                            <preset>
                                <presets type='list'>
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

            return sendXml
        }

        const setData = async () => {
            openLoading()
            const sendXml = getObjectLeftSaveData()
            const result = await editOsc(sendXml)
            closeLoading()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                if (formData.value.enabledSwitch) {
                    formData.value.originalSwitch = true
                }
                // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面）
                setAreaView()
                refreshInitPage()
                watchEdit.update()
            }
        }

        const applyData = () => {
            if (!verification()) return
            checkMutexChl({
                isChange: formData.value.enabledSwitch && formData.value.enabledSwitch !== formData.value.originalSwitch,
                chlName: prop.chlData.name,
                tips: 'IDCS_SIMPLE_WATCH_DETECT_TIPS',
                mutexList: formData.value.mutexList,
            }).then(() => {
                setData()
            })
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && watchEdit.ready.value) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        const notify = ($: XMLQuery, stateType: string) => {
            // 物品看护改变
            if (stateType === 'OscArea') {
                // 绘制点线
                if ($('statenotify/points').length) {
                    formData.value.boundary[pageData.value.warnArea].points = $('statenotify/points/item').map((item) => {
                        return {
                            X: item.attr('X').num(),
                            Y: item.attr('Y').num(),
                        }
                    })
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

        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            formData.value.schedule = getScheduleId(pageData.value.scheduleList, formData.value.schedule)
        }

        onMounted(async () => {
            await getScheduleList()
            getData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendMinXML = OCX_XML_SetOscAreaAction('NONE')
                plugin.ExecuteCmd(sendMinXML)

                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }

            drawer.destroy()
        })

        return {
            supportAlarmAudioConfig,
            playerRef,
            notify,
            formData,
            watchEdit,
            pageData,
            // 播放器就绪
            handlePlayerReady,
            // 视频区域
            showAllArea,
            clearArea,
            clearAllArea,
            // 警戒区域切换
            changeWarnArea,
            formatAreaName,
            blurInput,
            // 提交物品遗留与看护数据
            applyData,
            closeSchedulePop,
        }
    },
})
