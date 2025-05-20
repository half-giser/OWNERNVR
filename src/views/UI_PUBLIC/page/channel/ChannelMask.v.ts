/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-16 17:39:53
 * @Description: 通道 - 视频遮挡配置
 */
import { type XMLQuery } from '@/utils/xmlParse'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        const pageData = ref({
            onlineChlList: [] as string[],
        })

        const playerRef = ref<PlayerInstance>()
        const formData = ref(new ChannelMaskDto())
        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelMaskDto[]>([])
        const maskTableRef = ref<TableInstance>()

        const selectedChlId = ref('')
        const editStatus = ref(false)
        const switchOptions = getTranslateOptions(DEFAULT_BOOL_SWITCH_OPTIONS)

        const drawingArea = ref<CanvasMaskMaskItem[]>([])

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
        let drawer = CanvasMask()

        const colorMap: Record<string, string> = {
            black: Translate('IDCS_BLACK'),
            white: Translate('IDCS_WHITE'),
            gray: Translate('IDCS_GRAY'),
        }

        const chlOptions = computed(() => {
            return tableData.value.map((item) => {
                return {
                    label: item.name,
                    value: item.id,
                }
            })
        })

        const handleChlSel = (chlId: string) => {
            const rowData = getRowById(chlId)!
            formData.value = rowData
            tableRef.value!.setCurrentRow(rowData)
            changeEditStatus(false)

            formData.value.mask.forEach((item, index) => {
                item.isSelect = index === 0
            })

            if (formData.value.mask.length) {
                maskTableRef.value!.setCurrentRow(formData.value.mask[0])
            }

            setTimeout(() => {
                resetMask(formData.value)
            }, 10)
        }

        const handleRowClick = (rowData: ChannelMaskDto) => {
            if (!rowData.disabled) {
                selectedChlId.value = rowData.id
                formData.value = rowData
            }

            tableRef.value!.setCurrentRow(getRowById(selectedChlId.value))
            changeEditStatus(false)

            formData.value.mask.forEach((item, index) => {
                item.isSelect = index === 0
            })

            if (formData.value.mask.length) {
                maskTableRef.value!.setCurrentRow(formData.value.mask[0])
            }

            setTimeout(() => {
                resetMask(formData.value)
            }, 10)
        }

        const changeSwitch = () => {
            setData(formData.value)
        }

        const changeSwitchAll = async (val: boolean) => {
            tableData.value.forEach((item) => {
                if (!item.disabled && item.mask.length) {
                    item.switch = val
                }
            })

            Promise.all(tableData.value.filter((item) => !item.disabled && item.mask.length).map((item) => setData(item))).then((result) => {
                commMutiSaveResponseHandler(result)
            })
        }

        const changeMaskSwitch = async () => {
            const result = await setData(formData.value)
            commSaveResponseHandler(result)
        }

        const changeAllMaskSwitch = async (bool: boolean) => {
            formData.value.mask.forEach((item) => {
                item.switch = bool
            })
            const result = await setData(formData.value)
            commSaveResponseHandler(result)
        }

        const changeEditStatus = (status: boolean) => {
            if (!selectedChlId.value) return

            editStatus.value = status

            if (mode.value === 'h5') {
                drawer.setEnable(editStatus.value)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_MaskAreaSetSwitch(editStatus.value ? 'EDIT_ON' : 'EDIT_OFF')
                plugin.ExecuteCmd(sendXML)
            }
        }

        const handleClearArea = () => {
            resetMask(formData.value)
        }

        /**
         * @description 获取行视频遮挡配置信息
         * @param {string} chlId
         */
        const getData = async (chlId: string) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            try {
                const res = await queryPrivacyMask(sendXml)
                const $ = queryXml(res)
                const rowData = getRowById(chlId)
                if (!rowData) {
                    return
                }

                if ($('status').text() === 'success') {
                    if (!$('content/chl').length || chlId !== $('content/chl').attr('id')) {
                        return
                    }

                    rowData.mask = $('content/chl/privacyMask/item')
                        .map((item, index) => {
                            const $item = queryXml(item.element)
                            if (!rowData.color) {
                                rowData.color = $item('color').text()
                            }

                            if (!rowData.switch) {
                                rowData.switch = $item('switch').text().bool()
                            }

                            return {
                                id: item.attr('token') || index,
                                areaIndex: item.attr('index').num(),
                                switch: $item('switch').text().bool(),
                                X: $item('rectangle/X').text().num(),
                                Y: $item('rectangle/Y').text().num(),
                                width: $item('rectangle/width').text().num(),
                                height: $item('rectangle/height').text().num(),
                                color: $item('color').text(),
                                isDrawing: false,
                                isSelect: index === 0,
                            }
                        })
                        .filter((item) => {
                            return item.X || item.Y || item.X || item.Y
                        })
                    rowData.status = ''
                    rowData.disabled = rowData.protocolType === 'ONVIF' || !pageData.value.onlineChlList.includes(chlId)
                    rowData.isPtz = $('content/chl').attr('type') === 'intPtz'
                    rowData.maxCount = $('content/chl/privacyMask').attr('count').num()
                } else {
                    rowData.status = ''
                }
            } catch {
                const rowData = getRowById(chlId)
                if (!rowData) {
                    return
                }
                rowData.status = ''
            }
        }

        const getPreset = async (chlId: string) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryChlPresetList(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                const rowData = getRowById(chlId)!
                rowData.presetList = $('content/presets/item').map((item) => {
                    return {
                        label: item.text(),
                        value: item.attr('index'),
                    }
                })

                if (rowData.presetList.length) {
                    rowData.preset = rowData.presetList[0].value
                }
            }
        }

        const playPreset = (chlId: string, index: string, speed: number) => {
            const sendXml = rawXml`
                <content>
                    <chlId>${chlId}</chlId>
                    <index>${index}</index>
                    <speed>${speed}</speed>
                </content>
            `
            goToPtzPreset(sendXml)
        }

        const getOnlineChlList = async () => {
            const result = await queryOnlineChlList()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.onlineChlList = $('content/item').map((item) => item.attr('id'))
            }
        }

        const getDataList = async () => {
            openLoading()

            const res = await getChlList({
                requireField: ['supportPtz', 'protocolType'],
                isSupportMaskSetting: true,
            })
            const $ = queryXml(res)

            closeLoading()

            if ($('status').text() === 'success') {
                tableData.value = $('content/item').map((ele) => {
                    const $item = queryXml(ele.element)
                    const item = new ChannelMaskDto()
                    item.id = ele.attr('id')
                    item.name = $item('name').text()
                    item.chlIndex = $item('chlIndex').text()
                    item.chlType = $item('chlType').text()
                    item.protocolType = $item('protocolType').text()
                    item.status = 'loading'
                    item.disabled = true
                    return item
                })
            } else {
                tableData.value = []
                selectedChlId.value = ''
            }

            let onlineChlId = ''

            tableData.value.forEach(async (item) => {
                if (!onlineChlId && pageData.value.onlineChlList.includes(item.id)) {
                    onlineChlId = item.id
                }

                if (item.chlType !== 'recorder') {
                    await getData(item.id)
                    if (item.isPtz) {
                        await getPreset(item.id)
                    }
                } else {
                    item.status = ''
                }

                if (!tableData.value.some((row) => row === item)) {
                    return
                }

                if (onlineChlId === item.id) {
                    formData.value = item
                    selectedChlId.value = item.id
                    tableRef.value!.setCurrentRow(item)
                    nextTick(() => {
                        if (formData.value.mask.length) {
                            maskTableRef.value!.setCurrentRow(0)
                        }
                        resetMask(formData.value)
                    })
                }
            })
        }

        const setData = async (rowData: ChannelMaskDto) => {
            const sendXml = rawXml`
                <types>
                    <color>
                        <enum>black</enum>
                        <enum>white</enum>
                        <enum>gray</enum>
                    </color>
                </types>
                <content>
                    <chl id='${rowData.id}'>
                        <privacyMask type='list' count='${rowData.maxCount}' ${rowData.isPtz ? ' type="intPtz"' : ''}>
                            <itemType>
                                <color type='color'/>
                            </itemType>
                            ${rowData.mask
                                .map((ele) => {
                                    return rawXml`
                                        <item token="${ele.id}" index="${ele.areaIndex}">
                                            <switch>${rowData.switch}</switch>
                                            <rectangle>
                                                <X>${ele.X}</X>
                                                <Y>${ele.Y}</Y>
                                                <width>${ele.width}</width>
                                                <height>${ele.height}</height>
                                            </rectangle>
                                            <color>${ele.color}</color>
                                        </item>
                                    `
                                })
                                .join('')}
                        </privacyMask>
                    </chl>
                </content>
            `
            const result = await editPrivacyMask(sendXml)
            return result
        }

        const getRowById = (chlId: string) => {
            return tableData.value.find((element) => element.id === chlId)
        }

        const notify = ($: XMLQuery, stateType: string) => {
            if (stateType === 'MaskArea') {
                formData.value.mask.forEach((ele) => {
                    ele.isSelect = false
                })

                drawingArea.value[0] = {
                    X: $('statenotify/item/rectangle/X').text().num(),
                    Y: $('statenotify/item/rectangle/Y').text().num(),
                    width: $('statenotify/item/rectangle/width').text().num(),
                    height: $('statenotify/item/rectangle/height').text().num(),
                    color: 'black',
                    isDrawing: true,
                    isSelect: true,
                }
            }

            if (stateType === 'StartViewChl') {
                resetMask(formData.value)
            }
        }

        const handleMaskChange = (maskList: CanvasMaskMaskItem[]) => {
            const rowData = getRowById(selectedChlId.value)!

            rowData.mask.forEach((ele, index) => {
                const item = maskList[index]
                ele.X = item.X || 0
                ele.Y = item.Y || 0
                ele.width = item.width || 0
                ele.height = item.height || 0
                ele.color = item.color || 'black'
                ele.isDrawing = item.isDrawing || false
                ele.isSelect = item.isSelect || false
            })

            if (maskList.length > rowData.mask.length) {
                drawingArea.value[0] = maskList.at(-1)!
            }
        }

        const resetMask = (rowData: ChannelMaskDto) => {
            drawingArea.value = []

            if (mode.value === 'h5') {
                console.log(rowData.mask)
                drawer.setMask(rowData.mask)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetMaskArea(rowData.mask)
                plugin.ExecuteCmd(sendXML)
            }

            if (rowData.isPtz) {
                handleInvokePrivacyMask(rowData)
            }
        }

        const updateMask = (rowData: ChannelMaskDto) => {
            const mask = [...rowData.mask, ...drawingArea.value]

            if (mode.value === 'h5') {
                drawer.setMask(mask)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetMaskArea(mask)
                plugin.ExecuteCmd(sendXML)
            }

            if (rowData.isPtz) {
                handleInvokePrivacyMask(rowData)
            }
        }

        const onReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                drawer.destroy()
                drawer = CanvasMask({
                    el: player.getDrawbordCanvas(),
                    onchange: handleMaskChange,
                })
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 切换播放通道
         */
        const play = () => {
            if (!selectedChlId.value) return
            if (!ready.value) return
            const rowData = getRowById(selectedChlId.value)!
            if (mode.value === 'h5') {
                player.play({
                    chlID: rowData.id,
                    streamType: 2,
                })
                drawer.clear()
                resetMask(formData.value)
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(rowData.id, rowData.name, () => {
                    const sendXML1 = OCX_XML_MaskAreaSetSwitch('NONE') // todo 只下发none会有问题，可以编辑
                    plugin.ExecuteCmd(sendXML1)

                    const sendXML2 = OCX_XML_MaskAreaSetSwitch('EDIT_OFF')
                    plugin.ExecuteCmd(sendXML2)
                })
            }
        }

        const handleSelectMask = (row: ChannelPrivacyMaskDto) => {
            formData.value.mask.forEach((item) => {
                if (item === row) {
                    item.isSelect = true
                } else {
                    item.isSelect = false
                }
            })

            if (drawingArea.value.length) {
                drawingArea.value[0].isSelect = false
            }

            updateMask(formData.value)
        }

        const handleInvokePrivacyMask = async (rowData: ChannelMaskDto) => {
            const item = formData.value.mask.find((item) => {
                return item.isSelect
            })

            if (!item) {
                return
            }

            const sendXml = rawXml`
                <content>
                    <chl id="${rowData.id}">
                        <token>${item.id}</token>
                    </chl>
                </content>
            `

            invokePrivacyMask(sendXml)
        }

        const addMask = async () => {
            if (formData.value.mask.length > formData.value.maxCount) {
                openMessageBox(Translate('IDCS_OVER_MAX_NUMBER_LIMIT'))
                return
            }

            if (!drawingArea.value.length) {
                openMessageBox(Translate('IDCS_DRAW_AREA_FIRST_TIP'))
                return
            }

            openLoading()

            const item = drawingArea.value[0]

            const sendXml = rawXml`
                <content>
                    <chl id="${formData.value.id}">
                        <privacyMask type="list" count="${formData.value.maxCount}">
                            <itemType>
                                <color type="color" />
                            </itemType>
                            <item>
                                <switch>false</switch>
                                <rectangle>
                                    <X>${item.X}</X>
                                    <Y>${item.Y}</Y>
                                    <width>${item.width}</width>
                                    <height>${item.height}</height>
                                </rectangle>
                                <color>${item.color || 'black'}</color>
                            </item>
                        </privacyMask>
                    </chl>
                </content>
            `

            const result = await addPrivacyMask(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })

                await getData(formData.value.id)
                handleChlSel(formData.value.id)
            } else {
                openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
            }
        }

        const removeMask = async () => {
            const item = formData.value.mask.find((item) => {
                return item.isSelect
            })

            if (!item) {
                return
            }

            const sendXml = rawXml`
                <content>
                    <chl id="${formData.value.id}">
                        <token>${item.id}</token>
                    </chl>
                </content>
            `
            const result = await deletePrivacyMask(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_DELETE_SUCCESS'),
                })

                await getData(formData.value.id)
                handleChlSel(formData.value.id)
            } else {
                openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && tableData.value.length) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        watch(selectedChlId, () => {
            editStatus.value = false
            play()
        })

        onMounted(async () => {
            await getOnlineChlList()
            getDataList()
        })

        onBeforeUnmount(() => {
            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }

            drawer.destroy()
        })

        return {
            playerRef,
            notify,
            formData,
            tableRef,
            tableData,
            chlOptions,
            selectedChlId,
            colorMap,
            editStatus,
            handleChlSel,
            handleRowClick,
            changeSwitch,
            changeSwitchAll,
            handleClearArea,
            onReady,
            switchOptions,
            getDataList,
            playPreset,
            changeEditStatus,
            drawingArea,
            addMask,
            removeMask,
            handleSelectMask,
            maskTableRef,
            changeMaskSwitch,
            changeAllMaskSwitch,
        }
    },
})
