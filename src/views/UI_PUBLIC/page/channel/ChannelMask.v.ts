/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-16 17:39:53
 * @Description: 通道 - 视频遮挡配置
 */
import { ChannelMaskDto, ChannelPrivacyMaskDto } from '@/types/apiType/channel'
import CanvasMask, { type CanvasMaskMaskItem } from '@/utils/canvas/canvasMask'
import { type XMLQuery } from '@/utils/xmlParse'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        const playerRef = ref<PlayerInstance>()
        const formData = ref(new ChannelMaskDto())
        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelMaskDto[]>([])
        const pageIndex = ref(1)
        const pageSize = ref(10)
        const pageTotal = ref(0)
        const selectedChlId = ref('')
        const editRows = useWatchEditRows<ChannelMaskDto>()
        const editStatus = ref(false)
        const switchOptions = getTranslateOptions(DEFAULT_SWITCH_OPTIONS)

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
        }

        const handleRowClick = (rowData: ChannelMaskDto) => {
            if (!rowData.disabled) {
                selectedChlId.value = rowData.id
                formData.value = rowData
            }
            tableRef.value!.setCurrentRow(getRowById(selectedChlId.value))
        }

        const handleChangeSwitch = () => {
            const rowData = getRowById(selectedChlId.value)!
            setOcxData(rowData)
        }

        const changeSwitchAll = (val: string) => {
            tableData.value.forEach((ele) => {
                if (!ele.disabled) {
                    ele.switch = val
                    setOcxData(ele)
                }
            })
        }

        const changeEditStatus = () => {
            if (!selectedChlId.value) return

            if (mode.value === 'h5') {
                drawer.setEnable(editStatus.value)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_MaskAreaSetSwitch(editStatus.value ? 'EDIT_ON' : 'EDIT_OFF')
                plugin.ExecuteCmd(sendXML)
            }
        }

        const handleClearArea = () => {
            if (mode.value === 'h5') {
                drawer.clear()
                drawer.setEnable(false)
            }

            if (mode.value === 'ocx') {
                const sendXML1 = OCX_XML_MaskAreaSetSwitch('NONE')
                plugin.ExecuteCmd(sendXML1)

                const sendXML2 = OCX_XML_MaskAreaSetSwitch('EDIT_OFF')
                plugin.ExecuteCmd(sendXML2)
            }

            editStatus.value = false
            const rowData = getRowById(selectedChlId.value)!
            if (rowData.mask.length) {
                rowData.mask.forEach((ele) => {
                    ele.switch = false
                    ele.X = ele.Y = ele.width = ele.height = 0
                })
            }
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
                    let isSwitch = false
                    let isSpeco = false
                    if (!$('content/chl').length || chlId !== $('content/chl').attr('id')) isSpeco = true
                    rowData.isSpeco = isSpeco
                    rowData.mask = $('content/chl/privacyMask/item').map((ele) => {
                        const $item = queryXml(ele.element)
                        isSwitch = isSwitch || $item('switch').text().bool()
                        return {
                            switch: $item('switch').text().bool(),
                            X: $item('rectangle/X').text().num(),
                            Y: $item('rectangle/Y').text().num(),
                            width: $item('rectangle/width').text().num(),
                            height: $item('rectangle/height').text().num(),
                        }
                    })
                    rowData.switch = String(isSwitch)
                    rowData.status = ''
                    rowData.disabled = isSpeco
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

        const getDataList = async () => {
            editRows.clear()
            openLoading()

            const res = await getChlList({
                pageIndex: pageIndex.value,
                pageSize: pageSize.value,
                isSupportMaskSetting: true,
            })
            const $ = queryXml(res)

            closeLoading()

            if ($('status').text() === 'success') {
                tableData.value = $('content/item').map((ele) => {
                    const $item = queryXml(ele.element)
                    const newData = new ChannelMaskDto()
                    newData.id = ele.attr('id')
                    newData.name = $item('name').text()
                    newData.chlIndex = $item('chlIndex').text()
                    newData.chlType = $item('chlType').text()
                    newData.status = 'loading'
                    newData.disabled = true
                    return newData
                })
                pageTotal.value = $('content').attr('total').num()
            } else {
                tableData.value = []
                selectedChlId.value = ''
            }

            tableData.value.forEach(async (item, i) => {
                if (item.chlType !== 'recorder') {
                    await getData(item.id)
                } else {
                    item.status = ''
                }

                if (!tableData.value.some((row) => row === item)) {
                    return
                }

                editRows.listen(item)

                if (i === 0) {
                    formData.value = item
                    selectedChlId.value = item.id
                    tableRef.value!.setCurrentRow(item)
                }
            })
        }

        const getSaveData = (rowData: ChannelMaskDto) => {
            const mask = rowData.mask.length ? rowData.mask : [new ChannelPrivacyMaskDto()]
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
                        <privacyMask type='list' count='4'>
                            <itemType>
                                <color type='color'/>
                            </itemType>
                            ${mask
                                .map((ele) => {
                                    return rawXml`
                                        <item>
                                            <switch>${rowData.switch}</switch>
                                            <rectangle>
                                                <X>${ele.switch ? ele.X : 0}</X>
                                                <Y>${ele.switch ? ele.Y : 0}</Y>
                                                <width>${ele.switch ? ele.width : 0}</width>
                                                <height>${ele.switch ? ele.height : 0}</height>
                                            </rectangle>
                                            <color>${!rowData.mask.length ? 'black' : rowData.color}</color>
                                        </item>
                                    `
                                })
                                .join('')}
                        </privacyMask>
                    </chl>
                </content>
            `
            return sendXml
        }

        const save = async () => {
            openLoading()

            tableData.value.forEach((ele) => (ele.status = ''))

            for (const ele of editRows.toArray()) {
                try {
                    const res = await editPrivacyMask(getSaveData(ele))
                    const $ = queryXml(res)
                    if ($('status').text() === 'success') {
                        ele.status = 'success'
                        editRows.remove(ele)
                    } else {
                        ele.status = 'error'
                    }
                } catch {
                    ele.status = 'error'
                }
            }

            closeLoading()
        }

        const getRowById = (chlId: string) => {
            return tableData.value.find((element) => element.id === chlId)
        }

        const notify = ($: XMLQuery, stateType: string) => {
            if (stateType === 'MaskArea') {
                const preRowData = getRowById(selectedChlId.value)!
                if (!preRowData.mask.length) {
                    for (let i = 0; i < 4; i++) {
                        preRowData.mask.push(new ChannelPrivacyMaskDto())
                    }
                }
                const rectangles = $('statenotify/item/rectangle')
                preRowData.mask.forEach((ele, index) => {
                    const rectExist = rectangles[index] !== undefined
                    if (rectExist) {
                        const $rect = queryXml(rectangles[index].element)
                        ele.switch = true
                        ele.X = $rect('X').text().num()
                        ele.Y = $rect('Y').text().num()
                        ele.width = $rect('width').text().num()
                        ele.height = $rect('height').text().num()
                    } else {
                        ele.switch = false
                        ele.X = ele.Y = ele.width = ele.height = 0
                    }
                })
            }
        }

        const handleMaskChange = (maskList: CanvasMaskMaskItem[]) => {
            const rowData = getRowById(selectedChlId.value)!
            if (!rowData.mask.length) {
                for (let i = 0; i < 4; i++) {
                    rowData.mask.push(new ChannelPrivacyMaskDto())
                }
            }
            rowData.mask.forEach((ele, index) => {
                const item = maskList[index]
                const itemExist = item !== undefined
                ele.switch = itemExist
                ele.X = itemExist ? item.X : 0
                ele.Y = itemExist ? item.Y : 0
                ele.width = itemExist ? item.width : 0
                ele.height = itemExist ? item.height : 0
            })
        }

        const setOcxData = (rowData: ChannelMaskDto) => {
            const masks: CanvasMaskMaskItem[] = []
            if (!rowData.mask.length) {
                for (let i = 0; i < 4; i++) {
                    rowData.mask.push(new ChannelPrivacyMaskDto())
                }
            }
            rowData.mask.forEach((ele) => {
                masks.push({
                    X: ele.switch ? ele.X : 0,
                    Y: ele.switch ? ele.Y : 0,
                    width: ele.switch ? ele.width : 0,
                    height: ele.switch ? ele.height : 0,
                })
            })

            if (mode.value === 'h5') {
                drawer.setArea(masks)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetMaskArea(masks)
                plugin.ExecuteCmd(sendXML)
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
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(rowData.id, rowData.name, () => {
                    const sendXML1 = OCX_XML_MaskAreaSetSwitch('NONE') // todo 只下发none会有问题，可以编辑
                    plugin.ExecuteCmd(sendXML1)

                    const sendXML2 = OCX_XML_MaskAreaSetSwitch('EDIT_OFF')
                    plugin.ExecuteCmd(sendXML2)
                })
            }
            setOcxData(rowData)
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

        watch(editStatus, changeEditStatus)

        onMounted(() => {
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
            editRows,
            pageIndex,
            pageSize,
            pageTotal,
            selectedChlId,
            colorMap,
            editStatus,
            handleChlSel,
            handleRowClick,
            handleChangeSwitch,
            changeSwitchAll,
            handleClearArea,
            save,
            onReady,
            switchOptions,
            getDataList,
        }
    },
})
