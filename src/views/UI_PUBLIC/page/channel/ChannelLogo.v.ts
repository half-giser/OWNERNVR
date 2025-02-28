/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-23 14:11:24
 * @Description: LOGO设置
 */
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const playerRef = ref<PlayerInstance>()

        const pageData = ref({
            // 选中行索引
            tableIndex: 0,
            switchOptions: getTranslateOptions(DEFAULT_SWITCH_OPTIONS),
            pageIndex: 1,
            pageSize: 10,
            total: 10,
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelLogoSetDto[]>([])

        const chlOptions = computed(() => {
            return tableData.value.map((item, index) => {
                return {
                    label: item.chlName,
                    value: index,
                }
            })
        })

        // 编辑行索引
        const editRows = useWatchEditRows<ChannelLogoSetDto>()

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
            const row = tableData.value[pageData.value.tableIndex]

            if (mode.value === 'h5') {
                player.play({
                    chlID: row.chlId,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(row.chlId, row.chlName)
                const sendXML = OCX_XML_SetLogoInfo({
                    switch: row.switch === 'true' ? 'ON' : 'OFF',
                    opacity: row.opacity,
                    x: row.X,
                    y: row.Y,
                    minOpacity: row.minOpacity,
                    maxOpacity: row.maxOpacity,
                    minX: row.minX,
                    minY: row.minY,
                    maxX: row.maxX,
                    maxY: row.maxY,
                })
                plugin.ExecuteCmd(sendXML)
            }
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
                    tableRef.value!.setCurrentRow(tableData.value[i])
                }
            })
        }

        /**
         * @description 获取列表数据
         */
        const getList = async () => {
            openLoading()

            const result = await getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                chlType: 'analog',
            })
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                tableData.value = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const rowData = new ChannelLogoSetDto()
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
                const result = await queryIPChlORChlLogo(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    const $logo = queryXml($('content/chl/logo')[0].element)
                    item.switch = $logo('switch').text().bool().toString()
                    item.opacity = $logo('opacity').text().num()
                    item.minOpacity = $logo('opacity').attr('min').num()
                    item.maxOpacity = $logo('opacity').attr('max').num()
                    item.X = $logo('X').text().num()
                    item.Y = $logo('Y').text().num()
                    item.minX = $logo('X').attr('min').num()
                    item.maxX = $logo('X').attr('max').num()
                    item.minY = $logo('Y').attr('min').num()
                    item.maxY = $logo('Y').attr('max').num()
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
         * @description 提交编辑行的数据
         */
        const setData = async () => {
            openLoading()

            tableData.value.forEach((item) => (item.status = ''))

            for (const item of editRows.toArray()) {
                const sendXml = rawXml`
                    <content>
                        <chl id="${item.chlId}">
                            <name>${item.chlName}</name>
                            <logo>
                                <switch>${item.switch}</switch>
                                <opacity min="${item.minOpacity}" max="${item.maxOpacity}">${item.opacity}</opacity>
                                <X min="${item.minX}" max="${item.maxX}">${item.X}</X>
                                <Y min="${item.minY}" max="${item.maxY}">${item.Y}</Y>
                            </logo>
                        </chl>
                    </content>
                `
                try {
                    const result = await editIPChlORChlLogo(sendXml)
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
         * @description 修改通道选项
         */
        const changeChl = () => {
            tableRef.value!.setCurrentRow(tableData.value[pageData.value.tableIndex])
        }

        /**
         * @description 更改所有开关
         * @param {string} value
         */
        const changeAllSwitch = (value: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.switch = value
                }
            })
        }

        /**
         * @description 点击表格项回调
         * @param {ChannelLogoSetDto} row
         */
        const handleRowClick = (row: ChannelLogoSetDto) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            if (!row.disabled) {
                pageData.value.tableIndex = index
            }
            tableRef.value!.setCurrentRow(tableData.value[pageData.value.tableIndex])
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
            changeAllSwitch,
            editRows,
        }
    },
})
