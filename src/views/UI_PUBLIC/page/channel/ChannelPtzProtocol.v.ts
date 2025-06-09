/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-23 10:36:12
 * @Description: 云台-协议
 */
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup(_prop, ctx) {
        const playerRef = ref<PlayerInstance>()

        const pageData = ref({
            // 云台选项
            ptzOptions: getTranslateOptions(DEFAULT_BOOL_SWITCH_OPTIONS),
            // 云台索引
            tableIndex: 0,
            pageIndex: 1,
            pageSize: 10,
            total: 10,
            keyword: '',
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzProtocolDto[]>([])
        const editRows = useWatchEditRows<ChannelPtzProtocolDto>()

        const chlOptions = computed(() => {
            return tableData.value.map((item, index) => {
                return {
                    label: item.chlName,
                    value: index,
                    disabled: item.disabled,
                }
            })
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

        /**
         * @description 播放器就绪时回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 播放视频
         */
        const play = () => {
            const { chlId, chlName } = tableData.value[pageData.value.tableIndex]

            if (mode.value === 'h5') {
                player.play({
                    chlID: chlId,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(chlId, chlName)
            }
        }

        /**
         * @description 保存编辑行数据
         */
        const setData = async () => {
            openLoading()

            tableData.value.forEach((item) => (item.status = ''))

            for (const item of editRows.toArray()) {
                const sendXml = rawXml`
                    <types>
                        <baudRate>${wrapEnums(item.baudRateOptions)}</baudRate>
                        <protocol>${wrapEnums(item.protocolOptions)}</protocol>
                    </types>
                    <content>
                        <chl id="${item.chlId}">
                            <baudRate type="baudRate">${item.baudRate}</baudRate>
                            <protocol type="protocol">${item.protocol}</protocol>
                            <address>${item.address}</address>
                        </chl>
                    </content>
                `
                try {
                    const result = await editPtzProtocol(sendXml)
                    const $ = queryXml(result)
                    if ($('status').text() === 'success') {
                        item.status = 'success'
                        editRows.remove(item)
                    } else {
                        item.status = 'error'
                    }
                } catch {
                    item.status = 'error'
                }
            }

            closeLoading()
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            editRows.clear()

            await getList()

            tableData.value.forEach(async (item, i) => {
                await getConfig(item.chlId, i)

                if (!tableData.value.some((find) => find === item)) {
                    return
                }

                editRows.listen(item)

                if (i === 0) {
                    pageData.value.tableIndex = i
                    tableRef.value!.setCurrentRow(item)
                }
            })
        }

        /**
         * @description 获取列表数据
         */
        const getList = async () => {
            openLoading()

            const result = await getChlList({
                isSupportRS485Ptz: true,
            })
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                tableData.value = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const rowData = new ChannelPtzProtocolDto()
                    rowData.disabled = true
                    rowData.status = 'loading'
                    rowData.chlId = item.attr('id')
                    rowData.chlName = $item('name').text()
                    return rowData
                })
                pageData.value.total = $('content').attr('total').num()
            }
        }

        /**
         * @description 获取行数据
         * @param {string} chlId
         * @param {number} index
         */
        const getConfig = async (chlId: string, index: number) => {
            const item = tableData.value[index]

            try {
                const sendXml = rawXml`
                    <condition>
                        <chlId>${chlId}</chlId>
                    </condition>
                `
                const result = await queryPtzProtocol(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    item.baudRate = $('content/chl/baudRate').text()
                    item.protocol = $('content/chl/protocol').text()
                    item.address = $('content/chl/address').text().num()
                    item.addressMin = $('content/chl/address').attr('min').num() || 1
                    item.addressMax = $('content/chl/address').attr('max').num() || 255
                    item.baudRateOptions = $('types/baudRate/enum').map((item) => {
                        return {
                            value: item.text(),
                            label: item.text(),
                        }
                    })
                    item.protocolOptions = $('types/protocol/enum').map((item) => {
                        return {
                            value: item.text(),
                            label: item.text(),
                        }
                    })
                    item.disabled = false
                } else {
                    item.disabled = true
                }
            } catch {
                item.disabled = true
            } finally {
                item.status = ''
            }
        }

        /**
         * @description 修改通道选项
         */
        const changeChl = () => {
            tableRef.value!.setCurrentRow(tableData.value[pageData.value.tableIndex])
        }

        /**
         * @description 点击表格项回调
         * @param {ChannelPtzProtocolDto} row
         */
        const handleRowClick = (row: ChannelPtzProtocolDto) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            if (index !== pageData.value.tableIndex) {
                pageData.value.tableIndex = index
            }
        }

        /**
         * @description 处理右上角搜索通道
         * @param {ConfigToolBarEvent<SearchToolBarEvent>} toolBarEvent
         */
        const handleToolBarEvent = (toolBarEvent: ConfigToolBarEvent<SearchToolBarEvent>) => {
            pageData.value.keyword = toolBarEvent.data.searchText
            pageData.value.pageIndex = 1
            getData()
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && tableData.value.length) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        watch(
            () => pageData.value.tableIndex,
            () => {
                play()
            },
        )

        onMounted(() => {
            getData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }
        })

        ctx.expose({
            handleToolBarEvent,
        })

        return {
            playerRef,
            handlePlayerReady,
            pageData,
            tableData,
            chlOptions,
            changeChl,
            setData,
            getData,
            handleRowClick,
            editRows,
        }
    },
})
