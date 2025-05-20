/*
 * @Date: 2025-05-15 16:04:45
 * @Description: 智能补光
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import { type XMLQuery } from '@/utils/xmlParse'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        const playerRef = ref<PlayerInstance>()

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']
        let drawer = CanvasPolygon()

        const pageData = ref({
            currentChl: '',
            onlineChlList: [] as string[],
            chlList: [] as { id: string; name: string }[],
            tab: 'param',
            requestType: '',
            warnArea: 0,
            isShowAllArea: false,
            warnAreaChecked: [] as number[],
        })

        const chlMap: Record<string, string> = {}

        const formRef = useFormRef()
        const formData = ref(new ChannelFillLightDto())
        const watchEdit = useWatchEditData(formData)

        const getOnlineChlList = async () => {
            const result = await queryOnlineChlList()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.onlineChlList = $('content/item').map((item) => item.attr('id'))
            }
        }

        const getList = async () => {
            const result = await getChlList({
                requireField: ['ip', 'supportSmartLight'],
            })
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const supportSmartLight = $item('supportSmartLight').text().bool()
                    const protocolType = $item('protocolType').text()
                    const factoryName = $('factoryName').attr('factoryName')
                    const id = item.attr('id')
                    if (factoryName !== 'Recorder' && protocolType !== 'RTSP' && pageData.value.onlineChlList.includes(id) && supportSmartLight) {
                        chlMap[id] = $item('name').text()
                        pageData.value.chlList.push({
                            id: id,
                            name: $item('name').text(),
                        })
                    }
                })
            }
        }

        const getData = async () => {
            watchEdit.reset()
            openLoading()

            const sendXml = rawXml`
                <condition>
                    <chlId>${pageData.value.currentChl}</chlId>
                </condition>
                <requireField>
                    <param/>
                </requireField>
            `
            const result = await querySmartLightConfig(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                formData.value = new ChannelFillLightDto()

                const $param = queryXml($('content/chl/param')[0].element)
                formData.value.duration = $param('duration').text().undef()?.num() ?? $param('duration').attr('default').num()
                // 协议不返回，写死数据，跟设备端保持一致
                formData.value.durationList = getAlarmHoldTimeList('10,40,70,100,130,160,190,220,250,300', formData.value.duration)
                formData.value.boundary = $param('boundary/item').map((item, index) => {
                    const $item = queryXml(item.element)

                    return {
                        maxCount: $item('point').attr('maxCount').num(),
                        area: index,
                        point: $item('point/item').map((ele) => {
                            const $ele = queryXml(ele.element)
                            return {
                                X: $ele('X').text().num(),
                                Y: $ele('Y').text().num(),
                                isClosed: true,
                            }
                        }),
                    }
                })

                if ($param('objectFilter').text()) {
                    formData.value.objectFilter.supportPerson = $param('objectFilter/person').length > 0
                    formData.value.objectFilter.supportPersonSwitch = $param('objectFilter/person/switch').length > 0
                    formData.value.objectFilter.personSwitch = $param('objectFilter/person/switch').text().bool()
                    formData.value.objectFilter.personSensitivity = $param('objectFilter/person/sensitivity').text().undef()?.num() ?? $param('objectFilter/person/sensitivity').attr('default').num()
                    formData.value.objectFilter.personSensitivityMin = $param('objectFilter/person/sensitivity').attr('min').num()
                    formData.value.objectFilter.personSensitivityMax = $param('objectFilter/person/sensitivity').attr('max').num()

                    formData.value.objectFilter.supportCar = $param('objectFilter/car').length > 0
                    formData.value.objectFilter.supportCarSwitch = $param('objectFilter/car/switch').length > 0
                    formData.value.objectFilter.carSwitch = $param('objectFilter/car/switch').text().bool()
                    formData.value.objectFilter.carSensitivity = $param('objectFilter/car/sensitivity').text().undef()?.num() ?? $param('objectFilter/person/sensitivity').attr('default').num()
                    formData.value.objectFilter.carSensitivityMin = $param('objectFilter/car/sensitivity').attr('min').num()
                    formData.value.objectFilter.carSensitivityMax = $param('objectFilter/car/sensitivity').attr('max').num()

                    formData.value.objectFilter.supportMotor = $param('objectFilter/motor').length > 0
                    formData.value.objectFilter.supportMotorSwitch = $param('objectFilter/motor/switch').length > 0
                    formData.value.objectFilter.motorSwitch = $param('objectFilter/motor/switch').text().bool()
                    formData.value.objectFilter.motorSensitivity = $param('objectFilter/motor/sensitivity').text().undef()?.num() ?? $param('objectFilter/person/sensitivity').attr('default').num()
                    formData.value.objectFilter.motorSensitivityMin = $param('objectFilter/motor/sensitivity').attr('min').num()
                    formData.value.objectFilter.motorSensitivityMax = $param('objectFilter/motor/sensitivity').attr('max').num()
                }

                pageData.value.warnAreaChecked = formData.value.boundary.map((item, index) => {
                    if (item.point.length) {
                        return index
                    }
                    return -1
                })
                pageData.value.requestType = 'success'
                watchEdit.listen()
            } else {
                pageData.value.requestType = 'fail'
            }
        }

        const setData = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <chl id="${pageData.value.currentChl}">
                        <param>
                            <duration>${formData.value.duration}</duration>
                            <boundary type="list" count="${formData.value.boundary.length}">
                                <itemType>
                                    <point type="list" />
                                </itemType>
                                ${formData.value.boundary
                                    .map((item) => {
                                        return rawXml`
                                            <item>
                                                <point type="list" maxCount="${item.maxCount}" count="${item.point.length}">
                                                    ${item.point
                                                        .map((point) => {
                                                            return rawXml`
                                                                <item>
                                                                    <X>${point.X}</X>
                                                                    <Y>${point.Y}</Y>
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
                            ${
                                formData.value.objectFilter.supportPerson || formData.value.objectFilter.supportCar || formData.value.objectFilter.supportMotor
                                    ? rawXml`
                                        <objectFilter>
                                            <person>
                                                <switch>${formData.value.objectFilter.personSwitch}</switch>
                                                <sensitivity>${formData.value.objectFilter.personSensitivity}</sensitivity>
                                            </person>
                                            <car>
                                                <switch>${formData.value.objectFilter.carSwitch}</switch>
                                                <sensitivity>${formData.value.objectFilter.carSensitivity}</sensitivity>
                                            </car>
                                            <motor>
                                                <switch>${formData.value.objectFilter.motorSwitch}</switch>
                                                <sensitivity>${formData.value.objectFilter.motorSensitivity}</sensitivity>
                                            </motor>
                                        </objectFilter>
                                    `
                                    : ''
                            }
                        </param>
                    </chl>
                </content>
            `
            const result = await editSmartLightConfig(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                pageData.value.warnAreaChecked = formData.value.boundary.map((item, index) => {
                    if (item.point.length) {
                        return index
                    }
                    return -1
                })
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
            formData.value.boundary[pageData.value.warnArea].point = points as CanvasBasePoint[]
            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        const closePath = (points: CanvasBasePoint[]) => {
            points.forEach((item) => (item.isClosed = true))
            formData.value.boundary[pageData.value.warnArea].point = points
        }

        const forceClosePath = (canBeClosed: boolean) => {
            if (!canBeClosed) {
                openMessageBox(Translate('IDCS_INTERSECT'))
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
                    drawer.setPointList(formData.value.boundary[pageData.value.warnArea].point, true)
                }

                if (mode.value === 'ocx') {
                    if (!pageData.value.isShowAllArea) {
                        // 先清除所有区域
                        const sendXML1 = OCX_XML_DeletePolygonArea('clearAll')
                        plugin.ExecuteCmd(sendXML1)
                        // 再绘制当前区域
                        const sendXML2 = OCX_XML_AddPolygonArea(formData.value.boundary, pageData.value.warnArea, false)
                        plugin.ExecuteCmd(sendXML2)
                    }
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
                    if (item.point.length >= 3 && drawer.judgeAreaCanBeClosed(item.point)) {
                        setClosed(item.point)
                    }
                })
            }
        }

        const clearCurrentArea = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DRAW_CLEAR_TIP'),
            }).then(() => {
                if (!formData.value.boundary.length) return
                formData.value.boundary[pageData.value.warnArea].point = []

                if (mode.value === 'h5') {
                    drawer.clear()
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_DeletePolygonArea(pageData.value.warnArea)
                    plugin.ExecuteCmd(sendXML)
                }

                if (pageData.value.isShowAllArea) {
                    showAllArea()
                }
            })
        }

        const clearArea = () => {
            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_DeletePolygonArea(pageData.value.warnArea)
                plugin.ExecuteCmd(sendXML)
            }

            if (!formData.value.boundary.length) return
            formData.value.boundary[pageData.value.warnArea].point = []
            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        const clearAllArea = () => {
            formData.value.boundary.forEach((item) => {
                item.point = []
            })

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_DeletePolygonArea('clearAll')
                plugin.ExecuteCmd(sendXML)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea()
            }
        }

        const showAllArea = () => {
            if (mode.value === 'h5') {
                drawer.setEnableShowAll(pageData.value.isShowAllArea)
            }

            if (pageData.value.isShowAllArea) {
                const detectAreaInfo = formData.value.boundary.map((item) => {
                    return item.point
                })
                if (mode.value === 'h5') {
                    const index = pageData.value.warnArea
                    drawer.setCurrAreaIndex(index, 'detectionArea')
                    drawer.drawAllPolygon(detectAreaInfo, [], 'detectionArea', index, true)
                }

                if (mode.value === 'ocx') {
                    // 先清除所有区域
                    const sendXML1 = OCX_XML_DeletePolygonArea('clearAll')
                    plugin.ExecuteCmd(sendXML1)
                    // 再绘制当前区域
                    const sendXML2 = OCX_XML_AddPolygonArea([formData.value.boundary[pageData.value.warnArea]], pageData.value.warnArea, true)
                    plugin.ExecuteCmd(sendXML2)
                    // 然后再绘制所有区域（结合上面绘制的当前区域会让当前区域有加粗效果）
                    const sendXML3 = OCX_XML_AddPolygonArea(formData.value.boundary, pageData.value.warnArea, true)
                    plugin.ExecuteCmd(sendXML3)
                }
            } else {
                setAreaView()
            }
        }

        const play = () => {
            if (mode.value === 'h5') {
                player.play({
                    chlID: pageData.value.currentChl,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(pageData.value.currentChl, chlMap[pageData.value.currentChl])
            }

            if (mode.value === 'h5') {
                drawer.setEnable(true)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPeaAreaAction('EDIT_ON')
                plugin.ExecuteCmd(sendXML)
            }

            nextTick(() => {
                setAreaView()
            })
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        const changeChl = async () => {
            await getData()
            if (pageData.value.requestType === 'success') {
                pageData.value.warnArea = 0

                if (ready.value) {
                    play()
                }
            }
        }

        const notify = ($: XMLQuery, stateType: string) => {
            if (stateType === 'PeaArea') {
                // 绘制点线
                if ($('statenotify/points').length) {
                    formData.value.boundary[pageData.value.warnArea].point = $('statenotify/points/item').map((item) => {
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

        /**
         * @description 开关显示全部区域
         */
        const toggleShowAllArea = () => {
            showAllArea()
        }

        onMounted(async () => {
            await getOnlineChlList()
            await getList()
            if (pageData.value.chlList.length) {
                pageData.value.currentChl = pageData.value.chlList[0].id
                getData()
            } else {
                pageData.value.requestType = 'not-support'
            }
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                const sendXML1 = OCX_XML_AddPolygonArea([], 0, false)
                plugin.ExecuteCmd(sendXML1)
                const sendXML2 = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML2)
            }
        })

        return {
            formRef,
            pageData,
            playerRef,
            handlePlayerReady,
            changeChl,
            formData,
            watchEdit,
            setData,
            changeWarnArea,
            notify,
            toggleShowAllArea,
            clearArea,
            clearAllArea,
        }
    },
})
