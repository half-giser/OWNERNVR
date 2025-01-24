/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-29 11:48:59
 * @Description: 水印设置
 */
import { ChannelWaterMarkDto } from '@/types/apiType/channel'
import { type TableInstance } from 'element-plus'
export default defineComponent({
    setup() {
        const playerRef = ref<PlayerInstance>()
        const tableRef = ref<TableInstance>()
        const pageData = ref({
            currChlId: '',
            switchDisabled: true,
            // 当前选择通道数据
            chlData: new ChannelWaterMarkDto(),
            // 通道列表
            chlList: [] as ChannelWaterMarkDto[],
            customTextSetAll: '',
            initComplete: false,
            options: getTranslateOptions(DEFAULT_SWITCH_OPTIONS),
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            informationPop: false,
        })
        const editRows = useWatchEditRows<ChannelWaterMarkDto>()

        const chlOptions = computed(() => {
            return pageData.value.chlList.map((item) => {
                return {
                    label: item.chlName,
                    value: item.chlId,
                }
            })
        })

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

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

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
            }
        }

        //播放视频
        const play = () => {
            const { chlName } = pageData.value.chlData

            if (mode.value === 'h5') {
                player.play({
                    chlID: pageData.value.currChlId,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(pageData.value.currChlId, chlName)
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && pageData.value.initComplete) {
                nextTick(() => {
                    play()
                })
                stopWatchFirstPlay()
            }
        })

        const handleChlChange = (value: string) => {
            const chlData = pageData.value.chlList.find((item) => item.chlId === value)
            if (chlData) {
                pageData.value.chlData = chlData
            }

            if (pageData.value.chlData.disabled) {
                pageData.value.switchDisabled = true
            } else {
                pageData.value.switchDisabled = false
            }

            tableRef.value!.setCurrentRow(chlData)
            play()
        }

        const handleSwitchChange = (value: string) => {
            pageData.value.chlList.forEach((item) => {
                if (item.chlId === pageData.value.currChlId) {
                    item.switch = value
                }
            })
        }

        const handleTableSwitchChange = (row: ChannelWaterMarkDto) => {
            if (pageData.value.currChlId === row.chlId) {
                pageData.value.chlData.switch = row.switch
            }
        }

        const handleSwitchChangeAll = (value: string) => {
            pageData.value.chlList.forEach((item) => {
                if (!item.disabled) {
                    item.switch = value
                }

                if (pageData.value.currChlId === item.chlId) {
                    pageData.value.chlData.switch = value
                }
            })
        }

        const formatInput = (str: string) => {
            return str.replace(/[^A-Za-z0-9]/g, '')
        }

        const handleCustomTextInput = (customText: string) => {
            pageData.value.chlList.forEach((item) => {
                if (item.chlId === pageData.value.currChlId) {
                    item.customText = customText
                }
            })
        }

        const handleSetCustomTextAll = (customText: string) => {
            pageData.value.chlList.forEach((item) => {
                if (!item.disabled) {
                    item.customText = customText
                }

                if (pageData.value.currChlId === item.chlId) {
                    pageData.value.chlData.customText = customText
                }
            })
            pageData.value.informationPop = false
        }

        const handleSetCancel = () => {
            pageData.value.informationPop = false
        }

        const getDataList = async () => {
            editRows.clear()
            pageData.value.initComplete = false
            pageData.value.switchDisabled = true

            openLoading()

            const res = await getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                chlType: 'analog',
                isSupportMaskSetting: true,
            })
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.chlList = []
                pageData.value.totalCount = $('content').attr('total').num()
                pageData.value.chlList = $('content/item').map((item) => {
                    const $ = queryXml(item.element)
                    return {
                        chlId: item.attr('id'),
                        chlName: $('name').text(),
                        chlIndex: '1',
                        chlType: $('chlType').text(),
                        status: 'loading',
                        disabled: true,
                        switch: '',
                        customText: '',
                        statusTip: '',
                    }
                })
            }

            closeLoading()

            pageData.value.chlList.forEach(async (item, i) => {
                await getData(item)

                if (!pageData.value.chlList.some((find) => find === item)) {
                    return
                }

                editRows.listen(item)

                if (i === 0) {
                    pageData.value.currChlId = item.chlId
                    tableRef.value!.setCurrentRow(item)
                    pageData.value.initComplete = true
                    pageData.value.chlData = item
                    if (pageData.value.chlData.disabled) {
                        pageData.value.switchDisabled = true
                    } else {
                        pageData.value.switchDisabled = false
                    }
                }
            })
        }

        const getData = async (item: ChannelWaterMarkDto) => {
            try {
                const sendXml = rawXml`
                    <condition>
                        <chlId>${item.chlId}</chlId>
                    </condition>
                `
                const res = await queryChlWaterMark(sendXml)
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    const waterMarkSwitch = $('content/chl/watermark/switch').text()
                    const customText = $('content/chl/watermark/customText').text()
                    item.disabled = false
                    item.status = ''
                    item.switch = waterMarkSwitch
                    item.customText = customText
                } else {
                    item.status = ''
                }
            } catch {
                item.status = ''
            }
        }

        const getSaveData = (row: ChannelWaterMarkDto) => {
            const sendXml = rawXml`
                <content>
                    <chl id="${row.chlId}">
                        <waterMark>
                            <switch>${row.switch}</switch>
                            <customText>${row.customText.trim()}</customText>
                        </waterMark>
                    </chl>
                </content>
            `
            return sendXml
        }

        const setData = async () => {
            openLoading()

            pageData.value.chlList.forEach((item) => (item.status = ''))

            for (const item of editRows.toArray()) {
                const sendXml = getSaveData(item)
                const res = await editChlWaterMark(sendXml)
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    item.status = 'success'
                    editRows.remove(item)
                } else {
                    item.status = 'error'
                }
            }

            closeLoading()
        }

        const handleApply = () => {
            setData()
        }

        const handleRowClick = (rowData: ChannelWaterMarkDto) => {
            if (!rowData.disabled) {
                pageData.value.currChlId = rowData.chlId
                pageData.value.chlData = rowData
                if (pageData.value.chlData.disabled) {
                    pageData.value.switchDisabled = true
                } else {
                    pageData.value.switchDisabled = false
                }
                tableRef.value!.setCurrentRow(rowData)
                play()
            }
        }

        const getRowById = (chlId: string) => {
            return pageData.value.chlList.find((element) => element.chlId === chlId)!
        }

        onMounted(() => {
            getDataList()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }
        })

        return {
            pageData,
            chlOptions,
            editRows,
            handlePlayerReady,
            playerRef,
            tableRef,
            handleChlChange,
            handleSwitchChange,
            handleTableSwitchChange,
            handleSwitchChangeAll,
            formatInput,
            handleCustomTextInput,
            handleSetCustomTextAll,
            handleSetCancel,
            handleApply,
            handleRowClick,
            getRowById,
            getDataList,
        }
    },
})
