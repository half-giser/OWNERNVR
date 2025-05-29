/*
 * @Description: AI 事件——更多——视频结构化
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-20 10:15:52
 */
import { type CheckboxValueType, type CheckboxGroupValueType } from 'element-plus'
import { type XMLQuery } from '@/utils/xmlParse'
import AlarmBaseErrorPanel from './AlarmBaseErrorPanel.vue'

export default defineComponent({
    components: {
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
    },
    setup(prop) {
        const { Translate } = useLangStore()

        type CanvasAreaType = 'detectionArea' | 'maskArea'
        // 高级设置
        const advancedVisible = ref(false)

        // 播放器
        const playerRef = ref<PlayerInstance>()

        let currAreaType: CanvasAreaType = 'detectionArea' // detectionArea侦测区域 maskArea屏蔽区域 regionArea矩形区域

        const countCycleTypeTip: Record<string, string> = {
            day: Translate('IDCS_TIME_DAY'),
            week: Translate('IDCS_TIME_WEEK'),
            month: Translate('IDCS_TIME_MOUNTH'),
            off: Translate('IDCS_OFF'),
        }

        const imgOsdTypeTip: Record<string, string> = {
            person: Translate('IDCS_DETECTION_PERSON'),
            vehicle: Translate('IDCS_DETECTION_VEHICLE'),
            bike: Translate('IDCS_NON_VEHICLE'),
        }

        const osdListTagNameMap: Record<string, string> = {
            sexSwitch: Translate('IDCS_SEX'),
            ageSwitch: Translate('IDCS_AGE'),
            orientationSwitch: Translate('IDCS_DIRECTION'),
            maskSwitch: Translate('IDCS_MASK'),
            hatSwitch: Translate('IDCS_HAT'),
            glassesSwitch: Translate('IDCS_GLASSES'),
            backpackSwitch: Translate('IDCS_BACKPACK'),
            shortsleevesSwitch: Translate('IDCS_LONG_SHORT_SLEEVE'),
            upperbodycolorSwitch: Translate('IDCS_UPPERCOLOR'),
            skirtSwitch: Translate('IDCS_SKIRT'),
            lowerbodycolorSwitch: Translate('IDCS_BLOWERCOLOR'),
            shortsSwitch: Translate('IDCS_LONG_SHORT_TROUSER'),
            colorSwitch: Translate('IDCS_COLOR'),
            categorySwitch: Translate('IDCS_TYPE'),
            brandSwitch: Translate('IDCS_BRAND'),
            bikeTypeSwitch: Translate('IDCS_TYPE'),
        }

        const detectTargetTypeTip: Record<string, string> = {
            person: Translate('IDCS_DETECTION_PERSON'),
            car: Translate('IDCS_DETECTION_VEHICLE'),
            motor: Translate('IDCS_NON_VEHICLE'),
        }

        const noneOSD = {
            switch: false,
            X: 0,
            Y: 0,
            osdPersonName: '',
            osdCarName: '',
            osdBikeName: '',
            osdFormat: '',
        }

        const pageData = ref({
            reqFail: false,
            tab: 'param',
            // 存储是否可用
            isSavePicDisabled: false,
            // 是否显示全部区域
            isShowAllArea: false,
            // 控制显示展示全部区域的checkbox
            showAllAreaVisible: true,
            // 控制显示清除全部区域按钮 >=2才显示
            clearAllVisible: true,
            // 控制显示最值区域
            isShowDisplayRange: false,
            // 排程
            scheduleList: [] as SelectOption<string, string>[],
            isSchedulePop: false,
            // 配置模式
            objectFilterMode: 'mode1',
            // 检测区域，屏蔽区域
            detectArea: 0,
            detectAreaChecked: [] as number[],
            // 记住最新选择的警戒区域，后面选择屏蔽区域时，用此index去舒初始化页面
            lastDetectArea: 0,
            maskArea: -1,
            // 初始是否有数据（添加样式）
            maskAreaChecked: [] as number[],
            // 是否启用自动重置
            autoReset: true,
            timeType: 'day',
            // 重置模式列表
            countCycleTypeList: [] as SelectOption<string, string>[],
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
            imgOsdTypeList: [] as SelectOption<string, string>[],
        })

        // 视频结构化数据
        const formData = ref(new AlarmVideoStructureDto())
        const watchEdit = useWatchEditData(formData)

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
                    enable: true,
                    enableOSD: formData.value.countOSD.switch,
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
         * @description 更新区域数据
         * @param {CanvasBaseArea | CanvasBasePoint[]} area
         * @param {CanvasPolygonOSDInfo} osdInfo
         */
        const changeArea = (area: CanvasBaseArea | CanvasBasePoint[], osdInfo?: CanvasPolygonOSDInfo) => {
            // 检测区域/屏蔽区域
            if (currAreaType === 'detectionArea') {
                formData.value.detectAreaInfo[pageData.value.detectArea].point = area as CanvasBasePoint[]
            } else if (currAreaType === 'maskArea') {
                formData.value.maskAreaInfo[pageData.value.maskArea].point = area as CanvasBasePoint[]
            }

            if (osdInfo) {
                formData.value.countOSD.X = osdInfo.X
                formData.value.countOSD.Y = osdInfo.Y
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(pageData.value.isShowAllArea)
            }
        }

        /**
         * @description 闭合区域
         * @param {CanvasBasePoint[]} area
         */
        const closePath = (area: CanvasBasePoint[]) => {
            area.forEach((item) => (item.isClosed = true))
            if (currAreaType === 'detectionArea') {
                formData.value.detectAreaInfo[pageData.value.detectArea].point = area
                formData.value.detectAreaInfo[pageData.value.detectArea].point.forEach((ele) => {
                    ele.isClosed = true
                })
            } else if (currAreaType === 'maskArea') {
                formData.value.maskAreaInfo[pageData.value.maskArea].point = area
                formData.value.maskAreaInfo[pageData.value.maskArea].point.forEach((ele) => {
                    ele.isClosed = true
                })
            }
        }

        /**
         * @description 强制闭合路径的回调
         * @param {boolean} canBeClosed
         */
        const forceClosePath = (canBeClosed: boolean) => {
            if (!canBeClosed) {
                openMessageBox(Translate('IDCS_INTERSECT'))
            }
        }

        /**
         * @description 清除当前区域
         */
        const clearCurrentArea = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DRAW_CLEAR_TIP'),
            }).then(() => {
                if (currAreaType === 'detectionArea') {
                    formData.value.detectAreaInfo[pageData.value.detectArea].point = []
                } else if (currAreaType === 'maskArea') {
                    formData.value.maskAreaInfo[pageData.value.maskArea].point = []
                }

                if (mode.value === 'h5') {
                    drawer.clear()
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetVsdAreaAction('NONE')
                    plugin.ExecuteCmd(sendXML)
                }

                showAllArea(pageData.value.isShowAllArea)
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
        }

        // 首次加载成功 播放视频
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
         * @description 获取数据
         */
        const getData = async () => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${prop.currChlId}</chlId>
                </condition>
                <requireField>
                    <param/>
                </requireField>
            `
            const result = await queryVideoMetadata(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                const param = $('content/chl/param')
                const $param = queryXml(param[0].element)
                const enabledSwitch = $param('switch').text().bool()

                // 重置信息（循环模式列表）
                $('types/countCycleType/enum').forEach((item) => {
                    if (item.text() !== 'off') {
                        pageData.value.countCycleTypeList.push({
                            value: item.text(),
                            label: countCycleTypeTip[item.text()],
                        })
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
                const detectAreaInfo: {
                    objectFilter: AlarmObjectFilterCfgDto
                    point: CanvasBasePoint[]
                    maxCount: number
                }[] = []
                $param('boundary/item').forEach((element) => {
                    const $element = queryXml(element.element)
                    const needResetObjectList = ['mode2', 'mode3', 'mode5']
                    const needResetObjectFilter = needResetObjectList.indexOf(objectFilterMode) !== -1
                    if (needResetObjectFilter) {
                        const $resultNode = objectFilterMode === 'mode2' ? $paramObjectFilter : []
                        objectFilter = getObjectFilterData(objectFilterMode, $element('objectFilter'), $resultNode)
                    }
                    const boundary = {
                        objectFilter: objectFilter.value,
                        point: [] as CanvasBasePoint[],
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
                    detectAreaInfo.push(boundary)
                })

                // 屏蔽区域
                const maskAreaInfo: {
                    point: CanvasBasePoint[]
                    maxCount: number
                }[] = []
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

                // OSD
                const countOSD = {
                    switch: $param('countOSD/switch').text().bool(),
                    X: $param('countOSD/X').text().num(),
                    Y: $param('countOSD/Y').text().num(),
                    osdPersonName: $param('countOSD/osdPersonName').text(),
                    osdCarName: $param('countOSD/osdCarName').text(),
                    osdBikeName: $param('countOSD/osdBikeName').text(),
                    osdFormat: '',
                    supportCountOSD: $param('countOSD').length > 0,
                    supportPoint: $param('countOSD/X').length > 0 && $param('countOSD/Y').length > 0,
                    supportOsdPersonName: $param('countOSD/osdPersonName').length > 0,
                    supportOsdCarName: $param('countOSD/osdCarName').length > 0,
                    supportBikeName: $param('countOSD/osdBikeName').length > 0,
                }
                countOSD.osdFormat =
                    (countOSD.osdPersonName ? countOSD.osdPersonName + '-# ' : '') +
                    (countOSD.osdCarName ? countOSD.osdCarName + '-# ' : '') +
                    (countOSD.osdBikeName ? countOSD.osdBikeName + '-# ' : '')

                // 图片叠加(OSD)
                pageData.value.imgOsdTypeList = $('types/osdEumType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: imgOsdTypeTip[item.text()],
                    }
                })

                const osdPersonCfgList: AlarmVideoStructureCfgDto[] = []
                $param('osdConfig/personcfg/*[@index]').forEach((item) => {
                    const tagName = item.element.tagName
                    if (tagName !== 'shoulderbagSwitch' && tagName !== 'modelyearSwitch' && tagName !== 'modelSwitch') {
                        osdPersonCfgList.push({
                            index: item.attr('index'),
                            value: item.text().bool(),
                            tagName,
                            label: osdListTagNameMap[tagName],
                        })
                    }
                })

                const osdCarCfgList: AlarmVideoStructureCfgDto[] = []
                $param('osdConfig/carcfg/*[@index]').forEach((item) => {
                    const tagName = item.element.tagName
                    if (tagName !== 'shoulderbagSwitch' && tagName !== 'modelyearSwitch' && tagName !== 'modelSwitch') {
                        osdCarCfgList.push({
                            index: item.attr('index'),
                            value: item.text().bool(),
                            tagName,
                            label: osdListTagNameMap[tagName],
                        })
                    }
                })

                const osdBikeCfgList: AlarmVideoStructureCfgDto[] = []
                $param('osdConfig/bikecfg/*[@index]').forEach((item) => {
                    const tagName = item.element.tagName
                    if (tagName !== 'shoulderbagSwitch' && tagName !== 'modelyearSwitch' && tagName !== 'modelSwitch') {
                        osdBikeCfgList.push({
                            index: item.attr('index'),
                            value: item.text().bool(),
                            tagName,
                            label: osdListTagNameMap[tagName],
                        })
                    }
                })

                // 默认用detectAreaInfo的第一个数据初始化检测目标
                const detectTargetList = detectAreaInfo[0].objectFilter.detectTargetList.map((item) => {
                    return {
                        value: item,
                        label: detectTargetTypeTip[item],
                    }
                })

                formData.value = {
                    enabledSwitch,
                    originalSwitch: enabledSwitch,
                    schedule: getScheduleId(pageData.value.scheduleList, $('content/chl').attr('scheduleGuid')),
                    saveSourcePicture: $param('saveSourcePicture').text().bool(),
                    saveTargetPicture: $param('saveTargetPicture').text().bool(),
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
                    countOSD,
                    countPeriod: {
                        countTimeType: $param('countPeriod/countTimeType').text(),
                        day: {
                            date: $param('countPeriod/daily/dateSpan').text().num(),
                            dateTime: $param('countPeriod/daily/dateTimeSpan').text() || '00:00:00',
                        },
                        week: {
                            date: $param('countPeriod/weekly/dateSpan').text().num(),
                            dateTime: $param('countPeriod/weekly/dateTimeSpan').text() || '00:00:00',
                        },
                        month: {
                            date: $param('countPeriod/monthly/dateSpan').text().num(),
                            dateTime: $param('countPeriod/monthly/dateTimeSpan').text() || '00:00:00',
                        },
                    },
                    detectAreaInfo,
                    maskAreaInfo,
                    detectTargetList,
                    detectTarget: detectTargetList.length ? detectTargetList[0].value : 'person',
                    osdType: $param('osdConfig/osdType').text(),
                    osdPersonCfgList,
                    osdCarCfgList,
                    osdBikeCfgList,
                }

                refreshInitPage()

                if (!$param('saveSourcePicture').text()) {
                    pageData.value.isSavePicDisabled = true
                }

                pageData.value.autoReset = formData.value.countPeriod.countTimeType !== 'off'
                if (pageData.value.autoReset) {
                    pageData.value.timeType = formData.value.countPeriod.countTimeType
                }

                watchEdit.listen()
            } else {
                pageData.value.tab = ''
                pageData.value.reqFail = true
            }
        }

        /**
         * @description 检测和屏蔽区域的样式初始化
         */
        const refreshInitPage = () => {
            // 区域状态
            pageData.value.detectAreaChecked = formData.value.detectAreaInfo.map((item, index) => {
                if (item.point.length > 0) {
                    return index
                }
                return -1
            })

            pageData.value.maskAreaChecked = formData.value.maskAreaInfo.map((item, index) => {
                if (item.point.length > 0) {
                    return index
                }
                return -1
            })

            // 是否显示全部区域切换按钮和清除全部按钮（区域数量大于等于2时才显示）
            if (formData.value.detectAreaInfo && formData.value.detectAreaInfo.length > 1) {
                pageData.value.showAllAreaVisible = true
                pageData.value.clearAllVisible = true
            } else {
                pageData.value.showAllAreaVisible = false
                pageData.value.clearAllVisible = false
            }

            // OSD状态
            if (formData.value.countOSD) {
                const osdPersonName = formData.value.countOSD.osdPersonName
                const osdCarName = formData.value.countOSD.osdCarName
                const osdBikeName = formData.value.countOSD.osdBikeName
                formData.value.countOSD.osdFormat = (osdPersonName ? osdPersonName + '-# ' : '') + (osdCarName ? osdCarName + '-# ' : '') + (osdBikeName ? osdBikeName + '-# ' : '')
            }

            changeTab()
        }

        /**
         * @description 切换Tab
         */
        const changeTab = () => {
            if (pageData.value.tab === 'param') {
                setAreaView(currAreaType)
                if (mode.value === 'h5') {
                    setTimeout(() => {
                        drawer.setEnable(true)
                        drawer.setOSDEnable(false)
                        drawer.init(true)
                    }, 10)
                }

                if (mode.value === 'ocx') {
                    setTimeout(() => {
                        const sendXML1 = OCX_XML_SetVsdAreaInfo(noneOSD, 'vsd')
                        plugin.ExecuteCmd(sendXML1)

                        const sendXML2 = OCX_XML_SetVsdAreaAction('EDIT_ON')
                        plugin.ExecuteCmd(sendXML2)

                        play()
                    }, 100)
                }

                if (pageData.value.isShowAllArea) {
                    showAllArea(true)
                }
            } else if (pageData.value.tab === 'detection') {
                if (mode.value === 'h5') {
                    drawer.clear()
                    drawer.setEnable(false)
                    drawer.setOSDEnable(false)
                    drawer.init(true)
                }

                if (mode.value === 'ocx') {
                    setTimeout(() => {
                        const sendXML1 = OCX_XML_SetVsdAreaInfo(noneOSD, 'vsd')
                        plugin.ExecuteCmd(sendXML1)

                        const sendXML2 = OCX_XML_SetVsdAreaAction('NONE')
                        plugin.ExecuteCmd(sendXML2)

                        const sendXML3 = OCX_XML_SetVsdAreaAction('EDIT_OFF')
                        plugin.ExecuteCmd(sendXML3)

                        play()
                    }, 100)
                }

                showAllArea(false)
            } else if (pageData.value.tab === 'image') {
                if (mode.value === 'h5') {
                    drawer.clear()
                    drawer.setEnable(false)
                    drawer.setOSDEnable(false)
                    drawer.init(true)
                }

                if (mode.value === 'ocx') {
                    setTimeout(() => {
                        const sendXML1 = OCX_XML_SetVsdAreaInfo(noneOSD, 'vsd')
                        plugin.ExecuteCmd(sendXML1)

                        const sendXML2 = OCX_XML_SetVsdAreaAction('NONE')
                        plugin.ExecuteCmd(sendXML2)

                        const sendXML3 = OCX_XML_SetVsdAreaAction('EDIT_OFF')
                        plugin.ExecuteCmd(sendXML3)

                        play()
                    }, 100)
                }

                showAllArea(false)
            } else if (pageData.value.tab === 'osd') {
                if (mode.value === 'h5') {
                    setTimeout(() => {
                        drawer.clear()
                        drawer.setEnable(false)
                        drawer.setOSDEnable(formData.value.countOSD.switch)
                        drawer.setOSD(formData.value.countOSD)
                        drawer.init(true)
                    }, 10)
                }

                if (mode.value === 'ocx') {
                    const osdData = formData.value.countOSD ? formData.value.countOSD : noneOSD
                    setTimeout(() => {
                        const sendXML1 = OCX_XML_SetVsdAreaInfo(osdData, 'vsd')
                        plugin.ExecuteCmd(sendXML1)

                        const sendXML2 = OCX_XML_SetVsdAreaAction('NONE')
                        plugin.ExecuteCmd(sendXML2)

                        const sendXML3 = OCX_XML_SetVsdAreaAction('EDIT_OFF')
                        plugin.ExecuteCmd(sendXML3)

                        play()
                    }, 100)
                }
            }
        }

        /**
         * @description 开启/关闭显示全部区域
         * @param {boolean} value
         */
        const showAllArea = (value: CheckboxValueType) => {
            if (mode.value === 'h5') {
                drawer.setEnableShowAll(value as boolean)
            }

            if (value) {
                const detectAreaInfo: CanvasBasePoint[][] = []
                const detectAreaInfoList = formData.value.detectAreaInfo
                const maskAreaInfo: CanvasBasePoint[][] = []
                const maskAreaInfoList = formData.value.maskAreaInfo
                detectAreaInfoList.forEach((ele, idx) => {
                    detectAreaInfo[idx] = ele.point.map((item) => {
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
                    let index = -1
                    if (currAreaType === 'detectionArea') {
                        index = pageData.value.detectArea
                    } else if (currAreaType === 'maskArea') {
                        index = pageData.value.maskArea
                    }
                    drawer.setCurrAreaIndex(index, currAreaType)
                    drawer.drawAllPolygon(detectAreaInfo, maskAreaInfo, currAreaType, index, true)
                }

                if (mode.value === 'ocx') {
                    setTimeout(() => {
                        const sendXML = OCX_XML_SetAllArea({ detectAreaInfo, maskAreaInfo }, 'IrregularPolygon', OCX_AI_EVENT_TYPE_VSD, '', true)
                        plugin.ExecuteCmd(sendXML)
                    }, 100)
                }
            } else {
                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_VSD, '', false)
                    plugin.ExecuteCmd(sendXML)
                }

                if (pageData.value.tab === 'param') {
                    changeAreaType()
                }
            }
        }

        /**
         * @description 清空区域
         */
        const clearArea = () => {
            if (currAreaType === 'detectionArea') {
                formData.value.detectAreaInfo[pageData.value.detectArea].point = []
            } else if (currAreaType === 'maskArea') {
                formData.value.maskAreaInfo[pageData.value.maskArea].point = []
            }

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetVsdAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        /**
         * @description 全部清除
         */
        const clearAllArea = () => {
            for (const key in formData.value.detectAreaInfo) {
                formData.value.detectAreaInfo[key].point = []
            }

            for (const key in formData.value.maskAreaInfo) {
                formData.value.maskAreaInfo[key].point = []
            }

            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML1 = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_VSD, '', pageData.value.isShowAllArea)
                plugin.ExecuteCmd(sendXML1)

                const sendXML2 = OCX_XML_SetVsdAreaAction('NONE')
                plugin.ExecuteCmd(sendXML2)
            }

            if (pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        /**
         * @description 切换检测区域
         */
        const changeDetectArea = () => {
            currAreaType = 'detectionArea'
            pageData.value.lastDetectArea = pageData.value.detectArea
            pageData.value.maskArea = -1
            changeAreaType()
            showDisplayRange()
        }

        /**
         * @description 切换屏蔽区域
         */
        const changeMaskArea = () => {
            currAreaType = 'maskArea'
            pageData.value.detectArea = -1
            changeAreaType()
            showDisplayRange()
        }

        /**
         * @description 改变区域类型
         */
        const changeAreaType = () => {
            // 切换另一个区域前先封闭其他可闭合的区域（“area”）
            setOtherAreaClosed()
            // 检测区域/屏蔽区域
            if (currAreaType === 'detectionArea') {
                drawer.setLineStyle('#00ff00', 1.5)
                setAreaView('detectionArea')
            } else if (currAreaType === 'maskArea') {
                drawer.setLineStyle('#d9001b', 1.5)
                setAreaView('maskArea')
            }
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
         * @description 校验目标范围最大值
         * @param {string} type
         */
        const checkMinMaxRange = (type: string) => {
            const warnAreaIndex = pageData.value.lastDetectArea
            const detectTarget = formData.value.detectTarget
            // 最小区域宽
            const minTextW = formData.value.detectAreaInfo[warnAreaIndex].objectFilter[detectTarget].minRegionInfo.width
            // 最小区域高
            const minTextH = formData.value.detectAreaInfo[warnAreaIndex].objectFilter[detectTarget].minRegionInfo.height
            // 最大区域宽
            const maxTextW = formData.value.detectAreaInfo[warnAreaIndex].objectFilter[detectTarget].maxRegionInfo.width
            // 最大区域高
            const maxTextH = formData.value.detectAreaInfo[warnAreaIndex].objectFilter[detectTarget].maxRegionInfo.height

            const errorMsg = Translate('IDCS_MIN_LESS_THAN_MAX')
            switch (type) {
                case 'minTextW':
                    if (minTextW >= maxTextW) {
                        openMessageBox(errorMsg)
                        formData.value.detectAreaInfo[warnAreaIndex].objectFilter[detectTarget].minRegionInfo.width = maxTextW - 1
                    }
                    break
                case 'minTextH':
                    if (minTextH >= maxTextH) {
                        openMessageBox(errorMsg)
                        formData.value.detectAreaInfo[warnAreaIndex].objectFilter[detectTarget].minRegionInfo.height = maxTextH - 1
                    }
                    break
                case 'maxTextW':
                    if (maxTextW <= minTextW) {
                        openMessageBox(errorMsg)
                        formData.value.detectAreaInfo[warnAreaIndex].objectFilter[detectTarget].maxRegionInfo.width = minTextW + 1
                    }
                    break
                case 'maxTextH':
                    if (maxTextH <= minTextH) {
                        openMessageBox(errorMsg)
                        formData.value.detectAreaInfo[warnAreaIndex].objectFilter[detectTarget].maxRegionInfo.height = minTextH + 1
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
                const currentSurface = pageData.value.lastDetectArea
                const currTargetType = formData.value.detectTarget // 人/车/非
                const minRegionInfo = formData.value.detectAreaInfo[currentSurface].objectFilter[currTargetType].minRegionInfo // 最小区域
                const maxRegionInfo = formData.value.detectAreaInfo[currentSurface].objectFilter[currTargetType].maxRegionInfo // 最大区域
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
         * @description 设置区域图形
         * @param {string} type
         */
        const setAreaView = (type: string) => {
            if (type === 'detectionArea') {
                const index = pageData.value.detectArea
                if (formData.value.detectAreaInfo[index]) {
                    if (mode.value === 'h5') {
                        drawer.setCurrAreaIndex(index, type)
                        drawer.setPointList(formData.value.detectAreaInfo[index].point, true)
                    }

                    if (mode.value === 'ocx') {
                        // 从侦测区域切换到屏蔽区域时（反之同理），会先执行侦测区域的清空、不可编辑，再执行屏蔽区域的是否可编辑三个命令
                        // 最后执行渲染画线的命令，加延时的目的是这个过程执行命令过多，插件响应不过来
                        setTimeout(() => {
                            const sendXML = OCX_XML_SetVsdArea(formData.value.detectAreaInfo[index].point, false, index, 'green')
                            plugin.ExecuteCmd(sendXML)
                        }, 100)
                    }
                }
            } else if (type === 'maskArea') {
                const index = pageData.value.maskArea
                if (formData.value.maskAreaInfo[index]) {
                    if (mode.value === 'h5') {
                        drawer.setCurrAreaIndex(index, type)
                        drawer.setPointList(formData.value.maskAreaInfo[index].point, true)
                    }

                    if (mode.value === 'ocx') {
                        setTimeout(() => {
                            const sendXML = OCX_XML_SetVsdArea(formData.value.maskAreaInfo[index].point, false, index, 'red')
                            plugin.ExecuteCmd(sendXML)
                        }, 100)
                    }
                }
            }

            if (pageData.value.tab === 'param' && pageData.value.isShowAllArea) {
                showAllArea(true)
            }
        }

        /**
         * @description 设置OSD
         */
        const setEnableOSD = () => {
            const enable = formData.value.countOSD.switch

            if (mode.value === 'h5') {
                drawer.setOSDEnable(enable)
                drawer.setOSD(formData.value.countOSD)
            }

            if (mode.value === 'ocx') {
                // 需要插件提供专门在画点多边形情况下显示OSD的插件命令
                const sendXML = OCX_XML_SetVsdAreaInfo(formData.value.countOSD, 'vsd')
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 闭合区域
         * @param {CanvasBasePoint[]} poinObjtList
         */
        const setClosed = (poinObjtList: CanvasBasePoint[]) => {
            poinObjtList.forEach((item) => {
                item.isClosed = true
            })
        }

        // 闭合其他区域
        const setOtherAreaClosed = () => {
            if (mode.value === 'h5') {
                // 画点-区域
                formData.value.detectAreaInfo.forEach((ele) => {
                    if (ele.point.length >= 3 && drawer.judgeAreaCanBeClosed(ele.point)) {
                        setClosed(ele.point)
                    }
                })

                formData.value.maskAreaInfo.forEach((ele) => {
                    if (ele.point.length >= 3 && drawer.judgeAreaCanBeClosed(ele.point)) {
                        setClosed(ele.point)
                    }
                })
            }
        }

        /**
         * @description 自动重置
         * @param value
         */
        const changeAutoReset = (value: CheckboxValueType) => {
            formData.value.countPeriod.countTimeType = value ? pageData.value.timeType : 'off'
        }

        /**
         * @description 重置时间模式
         * @param {string} value
         */
        const changeTimeType = (value: string) => {
            // 自动重置选中时formData.value.countPeriod.countTimeType被置为off，不方便直接绑定元素
            // 用pageData.value.timeType绑定页面元素
            formData.value.countPeriod.countTimeType = value
            // advancedVisible.value = true
        }

        const handleClick = (event: Event) => {
            event.stopPropagation()
        }

        /**
         * @description 手动重置
         */
        const resetData = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_RESET_TIP'),
            }).then(async () => {
                const sendXml = rawXml`
                    <content>
                        <chl id="${prop.currChlId}">
                            <param>
                                <forceReset>true</forceReset>
                            </param>
                        </chl>
                    </content>
                `
                const result = await editVideoMetadata(sendXml)
                commSaveResponseHandler(result)
            })
        }

        const osdCfgList = computed(() => {
            if (formData.value.osdType === 'person') {
                return formData.value.osdPersonCfgList
            }

            if (formData.value.osdType === 'vehicle') {
                return formData.value.osdCarCfgList
            }

            if (formData.value.osdType === 'bike') {
                return formData.value.osdBikeCfgList
            }

            return []
        })

        const osdCheckedList = computed(() => {
            return osdCfgList.value.filter((item) => item.value).map((item) => item.index)
        })

        const osdShowList = computed(() => {
            return osdCfgList.value.filter((item) => item.value).map((item) => item.label)
        })

        const isOsdCheckedAll = computed(() => {
            return osdCheckedList.value.length === osdCfgList.value.length
        })

        /**
         * @description 更改OSD配置
         * @param value
         */
        const changeOsdCfg = (value: CheckboxGroupValueType) => {
            if (formData.value.osdType === 'person') {
                formData.value.osdPersonCfgList.forEach((item) => {
                    item.value = value.includes(item.index)
                })
            }

            if (formData.value.osdType === 'vehicle') {
                formData.value.osdCarCfgList.forEach((item) => {
                    item.value = value.includes(item.index)
                })
            }

            if (formData.value.osdType === 'bike') {
                formData.value.osdBikeCfgList.forEach((item) => {
                    item.value = value.includes(item.index)
                })
            }
        }

        /**
         * @description 全选、取消全选
         * @param {boolean} value
         */
        const toggleAllOsd = (value: CheckboxValueType) => {
            if (formData.value.osdType === 'person') {
                formData.value.osdPersonCfgList.forEach((item) => {
                    item.value = value as boolean
                })
            }

            if (formData.value.osdType === 'vehicle') {
                formData.value.osdCarCfgList.forEach((item) => {
                    item.value = value as boolean
                })
            }

            if (formData.value.osdType === 'bike') {
                formData.value.osdBikeCfgList.forEach((item) => {
                    item.value = value as boolean
                })
            }
        }

        /**
         * @description 判断osd是否可用
         * @param {string} value
         * @returns {boolean}
         */
        const checkOsdName = (value: string) => {
            const name = value.replace(' ', '')
            //前端过滤XML中不允许字符：<>&'\"\x00-\x08\x0b-\x0c\x0e-\x1f]以及键盘上看到的特殊字符：!@#$%^*()-+=:;,./?\\|
            // var reg = /[!@#$%^*()-+=:;,./?\\|<>&'\"\x00-\x08\x0b-\x0c\x0e-\x1f]/g;
            const reg = /[&$|;`\\/:*?\"<>]/g
            if (!reg.test(name)) return true
            else return false
        }

        /**
         * @description 区域为多边形时，检测区域合法性(温度检测页面一个点为画点，两个点为画线，大于两个小于8个为区域，只需要检测区域的合法性)
         * @returns {boolean}
         */
        const verification = () => {
            // 检测区域合法性(视频结构化AI事件中：检测和屏蔽区域都为多边形)
            const allRegionList = [...formData.value.detectAreaInfo, ...formData.value.maskAreaInfo]

            for (const i in allRegionList) {
                const count = allRegionList[i].point.length
                if (count > 0 && count < 4) {
                    openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'))
                    return false
                } else if (count > 0 && !drawer.judgeAreaCanBeClosed(allRegionList[i].point)) {
                    openMessageBox(Translate('IDCS_INTERSECT'))
                    return false
                }
            }
            // 检测OSD名称合法性
            const peopleOsdName = formData.value.countOSD.osdPersonName
            const carOsdName = formData.value.countOSD.osdCarName
            const bikeOsdName = formData.value.countOSD.osdBikeName
            if (!checkOsdName(peopleOsdName) || !checkOsdName(carOsdName) || !checkOsdName(bikeOsdName)) {
                openMessageBox(Translate('IDCS_USER_ERROR_INVALID_PARAM'))
                return false
            }
            return true
        }

        /**
         * @description 组装param根节点下的ObjectFilter数据
         */
        const setParamObjectFilterData = () => {
            let paramXml = ''
            const noParamObjectNodeList = ['mode0', 'mode4', 'mode5'] // 模式0,4,5不需要下发基础的objectFilter节点
            if (noParamObjectNodeList.indexOf(pageData.value.objectFilterMode) === -1) {
                // 模式1、2、3均要下发基础的objectFilter节点
                paramXml = setObjectFilterXmlData(formData.value.detectAreaInfo[0].objectFilter, prop.chlData)
            }
            return paramXml
        }

        /**
         * @description 组装各个区域下的ObjectFilter节点数据
         */
        const setItemObjectFilterData = (item: { objectFilter: globalThis.AlarmObjectFilterCfgDto }) => {
            let paramXml = ''
            const singleDetectCfgList = ['mode2', 'mode3'] // 上述模式每个区域可单独配置检测目标或目标大小
            if (singleDetectCfgList.indexOf(pageData.value.objectFilterMode) !== -1) {
                paramXml += setObjectFilterXmlData(item.objectFilter, prop.chlData)
            }

            return paramXml
        }

        /**
         * @description
         * @returns {string}
         */
        const getSaveData = (): string => {
            const sendXml = rawXml`
                <content>
                    <chl id='${prop.currChlId}' scheduleGuid='${formData.value.schedule}'>
                        <param>
                            <switch>${formData.value.enabledSwitch}</switch>
                            <saveTargetPicture>${formData.value.saveTargetPicture}</saveTargetPicture>
                            <saveSourcePicture>${formData.value.saveSourcePicture}</saveSourcePicture>
                            <boundary type='list' count='4'>
                                ${formData.value.detectAreaInfo
                                    .map((element) => {
                                        return rawXml`
                                            <item>
                                                <point type='list' maxCount='${element.maxCount}' count='${element.point.length}'>
                                                    ${element.point
                                                        .map((item) => {
                                                            return rawXml`
                                                                <item>
                                                                    <X>${Math.floor(item.X)}</X>
                                                                    <Y>${Math.floor(item.Y)}</Y>
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
                            <maskArea type='list' count='4'>
                                ${formData.value.maskAreaInfo
                                    .map((element) => {
                                        return rawXml`
                                            <item>
                                                <point type='list' maxCount='${element.maxCount}' count='${element.point.length}'>
                                                    ${element.point
                                                        .map((item) => {
                                                            return rawXml`
                                                                <item>
                                                                    <X>${Math.floor(item.X)}</X>
                                                                    <Y>${Math.floor(item.Y)}</Y>
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
                            ${setParamObjectFilterData()}
                            <countPeriod>
                                <countTimeType>${formData.value.countPeriod.countTimeType}</countTimeType>
                                <daily>
                                    <dateSpan>${formData.value.countPeriod.day.date}</dateSpan>
                                    <dateTimeSpan>${formData.value.countPeriod.day.dateTime}</dateTimeSpan>
                                </daily>
                                <weekly>
                                    <dateSpan>${formData.value.countPeriod.week.date}</dateSpan>
                                    <dateTimeSpan>${formData.value.countPeriod.week.dateTime}</dateTimeSpan>
                                </weekly>
                                <monthly>
                                    <dateSpan>${formData.value.countPeriod.month.date}</dateSpan>
                                    <dateTimeSpan>${formData.value.countPeriod.month.dateTime}</dateTimeSpan>
                                </monthly>
                            </countPeriod>
                            ${
                                formData.value.countOSD.supportCountOSD
                                    ? rawXml`
                                        <countOSD>
                                            <switch>${formData.value.countOSD.switch}</switch>
                                            ${formData.value.countOSD.supportPoint ? `<X>${formData.value.countOSD.X}</X>` : ''}
                                            ${formData.value.countOSD.supportPoint ? `<Y>${formData.value.countOSD.Y}</Y>` : ''}
                                            ${formData.value.countOSD.supportOsdPersonName ? `<osdPersonName>${formData.value.countOSD.osdPersonName}</osdPersonName>` : ''}
                                            ${formData.value.countOSD.supportOsdCarName ? `<osdCarName>${formData.value.countOSD.osdCarName}</osdCarName>` : ''}
                                            ${formData.value.countOSD.supportBikeName ? `<osdBikeName>${formData.value.countOSD.osdBikeName}</osdBikeName>` : ''}
                                        </countOSD>
                                    `
                                    : ''
                            }
                            <osdConfig>
                                <osdType type='osdEumType'>${formData.value.osdType}</osdType>
                                <personcfg>
                                    ${formData.value.osdPersonCfgList
                                        .map((item) => {
                                            return `<${item.tagName} type='boolean' index='${item.index}'>${item.value}</${item.tagName}>`
                                        })
                                        .join('')}
                                </personcfg>
                                <carcfg>
                                    ${formData.value.osdCarCfgList
                                        .map((item) => {
                                            return `<${item.tagName} type='boolean' index='${item.index}'>${item.value}</${item.tagName}>`
                                        })
                                        .join('')}
                                </carcfg>
                                <bikecfg>
                                    ${formData.value.osdBikeCfgList
                                        .map((item) => {
                                            return `<${item.tagName} type='boolean' index='${item.index}'>${item.value}</${item.tagName}>`
                                        })
                                        .join('')}
                                </bikecfg>
                            </osdConfig>
                        </param>
                        <trigger></trigger>
                    </chl>
                </content>
            `

            return sendXml
        }

        /**
         * @description 保存配置
         */
        const setData = async () => {
            const sendXml = getSaveData()
            openLoading()
            const result = await editVideoMetadata(sendXml)
            closeLoading()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                if (formData.value.enabledSwitch) {
                    formData.value.originalSwitch = true
                }

                // 保存成功后刷新视频区域，四个点时区域没有闭合但保存后也可以闭合（四点已经可以画面）
                if (currAreaType === 'detectionArea') {
                    setAreaView('detectionArea')
                } else if (currAreaType === 'maskArea') {
                    setAreaView('maskArea')
                }
                refreshInitPage()
                watchEdit.update()
            } else {
                openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
            }
        }

        /**
         * @description 校验表单，检查互斥通道 后提交表单
         */
        const applyData = () => {
            if (!verification()) return
            checkMutexChl({
                isChange: formData.value.enabledSwitch && formData.value.enabledSwitch !== formData.value.originalSwitch,
                tips: 'IDCS_SIMPLE_VIDEO_META_DETECT_TIPS',
                mutexList: formData.value.mutexList,
                chlName: prop.chlData.name,
            }).then(() => {
                setData()
            })
        }

        const notify = ($: XMLQuery, stateType: string) => {
            // 侦测区域/屏蔽区域
            if (stateType === 'PeaArea') {
                // 绘制点线
                if ($('statenotify/points').length) {
                    const point = $('statenotify/points/item').map((item) => {
                        return {
                            X: item.attr('X').num(),
                            Y: item.attr('Y').num(),
                        }
                    })
                    if (currAreaType === 'detectionArea') {
                        formData.value.detectAreaInfo[pageData.value.detectArea].point = point
                    } else if (currAreaType === 'maskArea') {
                        formData.value.maskAreaInfo[pageData.value.maskArea].point = point
                    }
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

            // OSD
            if (stateType === 'TripwireLineInfo') {
                const X = $('statenotify/PosInfo/X').text().num()
                const Y = $('statenotify/PosInfo/Y').text().num()
                formData.value.countOSD.X = X
                formData.value.countOSD.Y = Y
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
            formData.value.schedule = getScheduleId(pageData.value.scheduleList, formData.value.schedule)
        }

        onMounted(async () => {
            openLoading()
            await getScheduleList()
            await getData()
            closeLoading()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                // 切到其他AI事件页面时清除一下插件显示的（线条/点/矩形/多边形）数据
                const sendAreaXML = OCX_XML_SetVsdAreaAction('NONE')
                plugin.ExecuteCmd(sendAreaXML)

                const sendAllAreaXML = OCX_XML_SetAllArea({}, 'IrregularPolygon', OCX_AI_EVENT_TYPE_VSD, '', false)
                plugin.ExecuteCmd(sendAllAreaXML)

                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }

            if (mode.value === 'h5') {
                drawer.destroy()
            }
        })

        return {
            advancedVisible,
            playerRef,
            formData,
            watchEdit,
            pageData,
            mode,
            osdCfgList,
            osdCheckedList,
            isOsdCheckedAll,
            osdShowList,
            notify,
            handlePlayerReady,
            changeTab,
            showAllArea,
            clearArea,
            clearAllArea,
            changeDetectArea,
            changeMaskArea,
            setEnableOSD,
            changeAutoReset,
            changeTimeType,
            handleClick,
            resetData,
            changeOsdCfg,
            toggleShowAllArea,
            toggleDisplayRange,
            showDisplayRange,
            checkMinMaxRange,
            toggleAllOsd,
            applyData,
            closeSchedulePop,
        }
    },
})
