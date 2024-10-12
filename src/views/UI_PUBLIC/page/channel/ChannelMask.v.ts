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
        let maskDrawer: CanvasMask | undefined = undefined

        const statusToolTip: Record<string, string> = {
            loading: Translate('IDCS_DEVC_REQUESTING_DATA'),
            saveSuccess: Translate('IDCS_SAVE_DATA_SUCCESS'),
            saveFailed: Translate('IDCS_SAVE_DATA_FAIL'),
        }

        const colorMap: Record<string, string> = {
            black: Translate('IDCS_BLACK'),
            white: Translate('IDCS_WHITE'),
            gray: Translate('IDCS_GRAY'),
        }

        const handleSizeChange = (val: number) => {
            pageSize.value = val
            getDataList()
            btnOKDisabled.value = true
        }

        const handleCurrentChange = (val: number) => {
            pageIndex.value = val
            getDataList()
            btnOKDisabled.value = true
        }

        const handleChlSel = (chlId: string) => {
            const rowData = getRowById(chlId)
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
            const rowData = getRowById(selectedChlId.value)
            editRows.add(rowData)
            btnOKDisabled.value = false
            setOcxData(rowData)
        }

        const changeSwitchAll = (val: boolean) => {
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
                if (osType == 'mac') {
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
                if (osType == 'mac') {
                } else {
                    let sendXML = OCX_XML_MaskAreaSetSwitch('NONE')
                    playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    sendXML = OCX_XML_MaskAreaSetSwitch('EDIT_OFF')
                    playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }
            editStatus.value = false
            const rowData = getRowById(selectedChlId.value)
            if (rowData.mask.length) {
                rowData.mask.forEach((ele) => {
                    ele.switch = false
                    ele.X = ele.Y = ele.width = ele.height = 0
                })
                editRows.add(rowData)
                btnOKDisabled.value = false
            }
        }

        const getData = (chlId: string) => {
            queryPrivacyMask(getXmlWrapData(`<condition><chlId>${chlId}</chlId></condition>`)).then((res) => {
                const $ = queryXml(res)
                const rowData = getRowById(chlId)
                if ($('status').text() == 'success') {
                    let isSwitch = false
                    let isSpeco = false
                    if ($('content/chl').length == 0 || chlId != $('content/chl').attr('id')) isSpeco = true
                    rowData.isSpeco = isSpeco
                    $('content/chl/privacyMask/item').forEach((ele) => {
                        const eleXml = queryXml(ele.element)
                        const newData = new PrivacyMask()
                        newData.switch = eleXml('switch').text().toBoolean()
                        newData.X = Number(eleXml('rectangle/X').text())
                        newData.Y = Number(eleXml('rectangle/Y').text())
                        newData.width = Number(eleXml('rectangle/width').text())
                        newData.height = Number(eleXml('rectangle/height').text())
                        rowData.mask.push(newData)
                        isSwitch = isSwitch || eleXml('switch').text().toBoolean()
                    })
                    rowData.switch = isSwitch
                    rowData.status = ''
                    rowData.disabled = isSpeco

                    // if (chlId == selectedChlId.value) {
                    //     formData.value = rowData
                    // }
                } else {
                    rowData.status = ''
                }
            })
        }

        const getDataList = () => {
            openLoading()
            getChlList({
                pageIndex: pageIndex.value,
                pageSize: pageSize.value,
                isSupportMaskSetting: true,
            }).then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    tableData.value = []
                    editRows.clear()
                    btnOKDisabled.value = true
                    $('content/item').forEach((ele) => {
                        const eleXml = queryXml(ele.element)
                        const newData = new ChannelMask()
                        newData.id = ele.attr('id')!
                        newData.name = eleXml('name').text()
                        newData.chlIndex = eleXml('chlIndex').text()
                        newData.chlType = eleXml('chlType').text()
                        newData.status = 'loading'
                        newData.disabled = true
                        newData.statusTip = statusToolTip['loading']
                        tableData.value.push(newData)
                    })
                    pageTotal.value = Number($('content').attr('total'))
                    if (!tableData.value.length) return
                    formData.value = tableData.value[0]
                    selectedChlId.value = tableData.value[0].id
                    tableRef.value!.setCurrentRow(tableData.value[0])
                    tableData.value.forEach((ele) => {
                        if (ele.chlType != 'recorder') {
                            getData(ele.id)
                        } else {
                            ele.status = ''
                        }
                    })
                } else {
                    selectedChlId.value = ''
                }
            })
        }

        const getSaveData = (rowData: ChannelMask): string => {
            let data = rawXml`
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
                            </itemType>`
            if (!rowData.mask.length) {
                data += rawXml`
                    <item>
                        <switch>false</switch>
                        <rectangle>
                            <X>0</X>
                            <Y>0</Y>
                            <width>0</width>
                            <height>0</height>
                        </rectangle>
                        <color>black</color>
                    </item>`
            } else {
                rowData.mask.forEach((ele) => {
                    data += rawXml`
                        <item>
                            <switch>${ele.switch ? rowData.switch.toString() : 'false'}</switch>
                            <rectangle>
                                <X>${ele.switch ? ele.X.toString() : '0'}</X>
                                <Y>${ele.switch ? ele.Y.toString() : '0'}</Y>
                                <width>${ele.switch ? ele.width.toString() : '0'}</width>
                                <height>${ele.switch ? ele.height.toString() : '0'}</height>
                            </rectangle>
                            <color>${rowData.color}</color>
                        </item>`
                })
            }
            data += rawXml`
                        </privacyMask>
                    </chl>
                </content>`
            return data
        }

        const save = () => {
            const total = editRows.size
            if (total == 0) return
            let count = 0
            const successRows: ChannelMask[] = []
            openLoading()
            tableData.value.forEach((ele) => (ele.status = ''))
            editRows.forEach((ele) => {
                editPrivacyMask(getXmlWrapData(getSaveData(ele))).then((res) => {
                    const $ = queryXml(res)
                    const success = $('status').text() == 'success'
                    if (success) {
                        ele.status = 'success'
                        ele.statusTip = statusToolTip['saveSuccess']
                        successRows.push(ele)
                    } else {
                        ele.status = 'error'
                        ele.statusTip = statusToolTip['saveFailed']
                    }
                    count++
                    if (count >= total) {
                        successRows.forEach((element) => {
                            editRows.delete(element)
                        })
                        if (!editRows.size) btnOKDisabled.value = true
                        editStatus.value = false
                        closeLoading()
                    }
                })
            })
        }

        const getRowById = (chlId: string) => {
            return tableData.value.find((element) => element.id == chlId) as ChannelMask
        }

        const LiveNotify2Js = ($: (path: string) => XmlResult) => {
            if ($("statenotify[@type='MaskArea']").length > 0) {
                const preRowData = getRowById(selectedChlId.value)
                if (osType == 'mac') {
                    // todo
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
            const rowData = getRowById(selectedChlId.value)
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
                if (osType == 'mac') {
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
                const sendXML = OCX_XML_SetPluginModel(osType == 'mac' ? 'VedioMaskConfig' : 'ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 切换播放通道
         */
        const play = () => {
            if (!selectedChlId.value) return
            if (!ready.value) return
            const rowData = getRowById(selectedChlId.value)
            if (mode.value === 'h5') {
                player.play({
                    chlID: rowData.id,
                    streamType: 2,
                })
                maskDrawer && maskDrawer.clear()
            } else {
                if (osType == 'mac') {
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
            DefaultPagerSizeOptions,
            DefaultPagerLayout,
            selectedChlId,
            colorMap,
            editStatus,
            handleSizeChange,
            handleCurrentChange,
            handleChlSel,
            handleRowClick,
            handleChangeSwitch,
            changeSwitchAll,
            handleClearArea,
            save,
            onReady,
        }
    },
})
