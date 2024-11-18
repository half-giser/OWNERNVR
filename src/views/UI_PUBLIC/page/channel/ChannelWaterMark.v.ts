/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-29 11:48:59
 * @Description: 水印设置
 */
import { ChannelWaterMarkDto } from '@/types/apiType/channel'
import { type TableInstance } from 'element-plus'
export default defineComponent({
    setup() {
        const { openLoading, closeLoading } = useLoading()
        const { Translate } = useLangStore()
        const playerRef = ref<PlayerInstance>()
        const pluginStore = usePluginStore()
        const osType = getSystemInfo().platform
        const tableRef = ref<TableInstance>()
        const pageData = ref({
            currChlId: '',
            switchDisabled: true,
            // 当前选择通道数据
            chlData: new ChannelWaterMarkDto(),
            // 通道列表
            chlList: [] as ChannelWaterMarkDto[],
            customTextSetAll: '',
            notification: [] as string[],
            initComplete: false,
            options: getSwitchOptions(),
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            editRows: new Set() as Set<ChannelWaterMarkDto>,
            informationPop: false,
        })

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        let pageChangeTimes = 0

        /**
         * @description 请求数据前, 记录当前页码
         */
        const savePagination = () => {
            pageChangeTimes++
            return pageChangeTimes
        }

        /**
         * @description 返回数据时，判断页码是否发生变化，若是，则停止之前的更新、获取、提交数据
         */
        const isPaginationChanged = (currentTimes: number) => {
            return pageChangeTimes !== currentTimes
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

        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                if (isHttpsLogin()) {
                    pageData.value.notification = [formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`)]
                }
            }

            if (mode.value === 'ocx') {
                if (!plugin.IsInstallPlugin()) {
                    plugin.SetPluginNotice('#layout2Content')
                    return
                }

                if (!plugin.IsPluginAvailable()) {
                    pluginStore.showPluginNoResponse = true
                    plugin.ShowPluginNoResponse()
                }
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            } else if (mode.value === 'ocx') {
                if (osType === 'mac') {
                    // const sendXML = OCX_XML_Preview({
                    //     winIndexList: [0],
                    //     chlIdList: [pageData.value.chlData['chlId']],
                    //     chlNameList: [pageData.value.chlData['chlName']],
                    //     streamType: 'sub',
                    //     chlIndexList: ['1'],
                    //     chlTypeList: [pageData.value.chlData['chlType']],
                    // })
                    // plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    plugin.RetryStartChlView(pageData.value.currChlId, chlName)
                }
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
            addEditRow(pageData.value.chlData)
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
            addEditRow(pageData.value.chlData)
        }

        const handleSwitchChangeAll = (value: string) => {
            pageData.value.chlList.forEach((item) => {
                if (!item.disabled) {
                    item.switch = value
                    addEditRow(item)
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
            addEditRow(pageData.value.chlData)
        }

        const handleSetCustomTextAll = (customText: string) => {
            pageData.value.chlList.forEach((item) => {
                if (!item.disabled) {
                    item.customText = customText
                    addEditRow(item)
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
            const timer = savePagination()
            pageData.value.editRows.clear()
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
                pageData.value.totalCount = $('//content').attr('total').num()
                pageData.value.chlList = $('//content/item').map((item) => {
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

            for (let i = 0; i < pageData.value.chlList.length; i++) {
                const item = pageData.value.chlList[i]
                await getData(item)

                if (isPaginationChanged(timer)) {
                    break
                }

                if (i === 0) {
                    pageData.value.currChlId = pageData.value.chlList[0].chlId
                    tableRef.value!.setCurrentRow(pageData.value.chlList[0])
                    pageData.value.initComplete = true
                    pageData.value.chlData = item
                    if (pageData.value.chlData.disabled) {
                        pageData.value.switchDisabled = true
                    } else {
                        pageData.value.switchDisabled = false
                    }
                }
            }
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
                    const waterMarkSwitch = $('//content/chl/watermark/switch').text()
                    const customText = $('//content/chl/watermark/customText').text()
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

            for (let i = 0; i < pageData.value.chlList.length; i++) {
                const item = pageData.value.chlList[i]
                if (pageData.value.editRows.has(item)) {
                    const sendXml = getSaveData(item)
                    const res = await editChlWaterMark(sendXml)
                    const $ = queryXml(res)
                    if ($('status').text() === 'success') {
                        item.status = 'success'
                        pageData.value.editRows.delete(item)
                    } else {
                        item.status = 'error'
                    }
                }
            }

            closeLoading()
        }

        const handleApply = async () => {
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

        const addEditRow = (row: ChannelWaterMarkDto) => {
            pageData.value.editRows.add(getRowById(row.chlId))
        }

        onMounted(() => {
            getDataList()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }

            if (mode.value === 'h5') {
                player.destroy()
            }
        })

        return {
            pageData,
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
            addEditRow,
            getDataList,
        }
    },
})
