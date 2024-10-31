/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-16 17:39:53
 * @Description: 通道 - 视频遮挡配置
 */
import { ChannelMask, PrivacyMask } from '@/types/apiType/channel'
import CanvasMask, { type CanvasMaskMaskItem } from '@/utils/canvas/canvasMask'
import { type XmlResult } from '@/utils/xmlParse'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const osType = getSystemInfo().platform

        const playerRef = ref<PlayerInstance>()
        const formData = ref(new ChannelMask())
        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelMask[]>([])
        const pageIndex = ref(1)
        const pageSize = ref(10)
        const pageTotal = ref(0)
        const selectedChlId = ref('')
        const btnOKDisabled = ref(true)
        const editRows = new Set<ChannelMask>()
        const editStatus = ref(false)
        const switchOptions = getSwitchOptions()
        let maskDrawer: CanvasMask | undefined = undefined

        const colorMap: Record<string, string> = {
            black: Translate('IDCS_BLACK'),
            white: Translate('IDCS_WHITE'),
            gray: Translate('IDCS_GRAY'),
        }

        const handleChlSel = (chlId: string) => {
            const rowData = getRowById(chlId)!
            formData.value = rowData
            tableRef.value!.setCurrentRow(rowData)
        }

        const handleRowClick = (rowData: ChannelMask) => {
            if (!rowData.disabled) {
                selectedChlId.value = rowData.id
                formData.value = rowData
            }
            tableRef.value!.setCurrentRow(getRowById(selectedChlId.value))
        }

        const handleChangeSwitch = () => {
            const rowData = getRowById(selectedChlId.value)!
            editRows.add(rowData)
            btnOKDisabled.value = false
            setOcxData(rowData)
        }

        const changeSwitchAll = (val: string) => {
            tableData.value.forEach((ele) => {
                if (!ele.disabled) {
                    ele.switch = val
                    editRows.add(ele)
                    btnOKDisabled.value = false
                    setOcxData(ele)
                }
            })
        }

        const changeEditStatus = () => {
            if (!selectedChlId.value) return
            if (!playerRef.value || !playerRef.value.ready) return
            if (playerRef.value.mode === 'h5') {
                maskDrawer?.setEnable(editStatus.value)
            } else {
                if (osType === 'mac') {
                } else {
                    const sendXML = OCX_XML_MaskAreaSetSwitch(editStatus.value ? 'EDIT_ON' : 'EDIT_OFF')
                    playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }
        }

        const handleClearArea = () => {
            if (!playerRef.value || !playerRef.value.ready) return
            if (playerRef.value.mode === 'h5') {
                maskDrawer?.clear()
                maskDrawer?.setEnable(false)
            } else {
                if (osType === 'mac') {
                } else {
                    let sendXML = OCX_XML_MaskAreaSetSwitch('NONE')
                    playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    sendXML = OCX_XML_MaskAreaSetSwitch('EDIT_OFF')
                    playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }
            editStatus.value = false
            const rowData = getRowById(selectedChlId.value)!
            if (rowData.mask.length) {
                rowData.mask.forEach((ele) => {
                    ele.switch = false
                    ele.X = ele.Y = ele.width = ele.height = 0
                })
                editRows.add(rowData)
                btnOKDisabled.value = false
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
                    if (!$('content/chl').length || chlId != $('content/chl').attr('id')) isSpeco = true
                    rowData.isSpeco = isSpeco
                    rowData.mask = $('content/chl/privacyMask/item').map((ele) => {
                        const eleXml = queryXml(ele.element)
                        isSwitch = isSwitch || eleXml('switch').text().toBoolean()
                        return {
                            switch: eleXml('switch').text().toBoolean(),
                            X: Number(eleXml('rectangle/X').text()),
                            Y: Number(eleXml('rectangle/Y').text()),
                            width: Number(eleXml('rectangle/width').text()),
                            height: Number(eleXml('rectangle/height').text()),
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
            btnOKDisabled.value = true
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
                    const eleXml = queryXml(ele.element)
                    const newData = new ChannelMask()
                    newData.id = ele.attr('id')!
                    newData.name = eleXml('name').text()
                    newData.chlIndex = eleXml('chlIndex').text()
                    newData.chlType = eleXml('chlType').text()
                    newData.status = 'loading'
                    newData.disabled = true
                    return newData
                })
                pageTotal.value = Number($('content').attr('total'))
            } else {
                tableData.value = []
                selectedChlId.value = ''
            }

            for (let i = 0; i < tableData.value.length; i++) {
                const ele = tableData.value[i]
                if (ele.chlType !== 'recorder') {
                    await getData(ele.id)
                } else {
                    ele.status = ''
                }

                if (!getRowById(ele.id)) {
                    break
                }

                if (i === 0) {
                    formData.value = tableData.value[0]
                    selectedChlId.value = tableData.value[0].id
                    tableRef.value!.setCurrentRow(tableData.value[0])
                }
            }
        }

        const getSaveData = (rowData: ChannelMask) => {
            const mask = rowData.mask.length ? rowData.mask : [new PrivacyMask()]
            const maskXml = mask
                .map((ele) => {
                    return rawXml`
                        <item>
                            <switch>${rowData.switch}</switch>
                            <rectangle>
                                <X>${ele.switch ? ele.X.toString() : '0'}</X>
                                <Y>${ele.switch ? ele.Y.toString() : '0'}</Y>
                                <width>${ele.switch ? ele.width.toString() : '0'}</width>
                                <height>${ele.switch ? ele.height.toString() : '0'}</height>
                            </rectangle>
                            <color>${!rowData.mask.length ? 'black' : rowData.color}</color>
                        </item>
                    `
                })
                .join('')
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
                            ${maskXml}
                        </privacyMask>
                    </chl>
                </content>
            `
            return sendXml
        }

        const save = async () => {
            if (!editRows.size) return

            openLoading()
            tableData.value.forEach((ele) => (ele.status = ''))

            for (let i = 0; i < tableData.value.length; i++) {
                const ele = tableData.value[i]
                if (editRows.has(ele)) {
                    try {
                        const res = await editPrivacyMask(getSaveData(ele))
                        const $ = queryXml(res)
                        if ($('status').text() === 'success') {
                            ele.status = 'success'
                            editRows.delete(ele)
                        } else {
                            ele.status = 'error'
                        }
                    } catch {
                        ele.status = 'error'
                    }
                }
            }

            closeLoading()
            if (!editRows.size) {
                btnOKDisabled.value = true
            }
        }

        const getRowById = (chlId: string) => {
            return tableData.value.find((element) => element.id === chlId)
        }

        const LiveNotify2Js = ($: (path: string) => XmlResult) => {
            if ($("statenotify[@type='MaskArea']").length) {
                const preRowData = getRowById(selectedChlId.value)!
                if (osType === 'mac') {
                } else {
                    if (!preRowData.mask.length) {
                        for (let i = 0; i < 4; i++) {
                            preRowData.mask.push(new PrivacyMask())
                        }
                    }
                    const rectangles = $('statenotify/item/rectangle')
                    preRowData.mask.forEach((ele, index) => {
                        const rectExist = rectangles[index] != undefined
                        if (rectExist) {
                            const rectangleXml = queryXml(rectangles[index].element)
                            ele.switch = true
                            ele.X = Number(rectangleXml('X').text())
                            ele.Y = Number(rectangleXml('Y').text())
                            ele.width = Number(rectangleXml('width').text())
                            ele.height = Number(rectangleXml('height').text())
                        } else {
                            ele.switch = false
                            ele.X = ele.Y = ele.width = ele.height = 0
                        }
                    })
                }
                editRows.add(preRowData)
                btnOKDisabled.value = false
            }
        }

        const handleMaskChange = (maskList: CanvasMaskMaskItem[]) => {
            const rowData = getRowById(selectedChlId.value)!
            if (!rowData.mask.length) {
                for (let i = 0; i < 4; i++) {
                    rowData.mask.push(new PrivacyMask())
                }
            }
            rowData.mask.forEach((ele, index) => {
                const item = maskList[index]
                const itemExist = item != undefined
                ele.switch = itemExist
                ele.X = itemExist ? item.X : 0
                ele.Y = itemExist ? item.Y : 0
                ele.width = itemExist ? item.width : 0
                ele.height = itemExist ? item.height : 0
            })
            editRows.add(rowData)
            btnOKDisabled.value = false
        }

        const setOcxData = (rowData: ChannelMask) => {
            const masks: CanvasMaskMaskItem[] = []
            if (!rowData.mask.length) {
                for (let i = 0; i < 4; i++) {
                    rowData.mask.push(new PrivacyMask())
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
                maskDrawer?.setArea(masks)
            } else {
                if (osType === 'mac') {
                } else {
                    const sendXML = OCX_XML_SetMaskArea(masks)
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }
        }

        // 播放模式
        const mode = computed(() => {
            if (!playerRef.value) {
                return ''
            }
            return playerRef.value.mode
        })

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        const onReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                maskDrawer = new CanvasMask({
                    el: player.getDrawbordCanvas(0) as HTMLCanvasElement,
                    onchange: handleMaskChange,
                })
            } else {
                plugin.VideoPluginNotifyEmitter.addListener(LiveNotify2Js)
                const sendXML = OCX_XML_SetPluginModel(osType === 'mac' ? 'VedioMaskConfig' : 'ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
                maskDrawer && maskDrawer.clear()
            } else {
                if (osType === 'mac') {
                } else {
                    plugin.RetryStartChlView(rowData.id, rowData.name, () => {
                        let sendXML = OCX_XML_MaskAreaSetSwitch('NONE') // todo 只下发none会有问题，可以编辑
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        sendXML = OCX_XML_MaskAreaSetSwitch('EDIT_OFF')
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    })
                }
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
            if (ready.value) {
                if (mode.value === 'ocx') {
                    plugin.VideoPluginNotifyEmitter.removeListener(LiveNotify2Js)
                    const sendXML = OCX_XML_StopPreview('ALL')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    maskDrawer?.destroy()
                    maskDrawer = undefined
                }
            }
        })

        return {
            playerRef,
            formData,
            tableRef,
            tableData,
            btnOKDisabled,
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
