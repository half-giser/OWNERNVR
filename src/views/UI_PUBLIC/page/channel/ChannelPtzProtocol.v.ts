/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-23 10:36:12
 * @Description: 云台-协议
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-25 18:31:12
 */
import { type TableInstance } from 'element-plus'
import { ChannelPtzProtocolDto } from '@/types/apiType/channel'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const playerRef = ref<PlayerInstance>()

        const pageData = ref({
            notification: [] as string[],
            // 云台选项
            ptzOptions: getBoolSwitchOptions(),
            // 云台索引
            tableIndex: 0,
            pageIndex: 1,
            pageSize: 10,
            total: 10,
            keyword: '',
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzProtocolDto[]>([])

        // 编辑行索引
        const editRows = ref(new Set<number>())

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

        /**
         * @description 播放器就绪时回调
         */
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
                    plugin.SetPluginNoResponse()
                    plugin.ShowPluginNoResponse()
                }
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 修改所有行云台选项
         * @param {boolean} bool
         */
        const changeAllPtz = (bool: boolean) => {
            tableData.value.forEach((item, index) => {
                if (!item.disabled) {
                    item.ptz = bool
                    addEditRow(index)
                }
            })
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
            } else if (mode.value === 'ocx') {
                plugin.RetryStartChlView(chlId, chlName)
            }
        }

        /**
         * @description 保存编辑行数据
         */
        const setData = async () => {
            openLoading()

            for (let i = 0; i < tableData.value.length; i++) {
                if (editRows.value.has(i)) {
                    const item = tableData.value[i]
                    // const row = tableData.value[editsIndex[i]]
                    const sendXml = rawXml`
                        <types>
                            <baudRate>${wrapEnums(item.baudRateOptions)}</baudRate>
                            <protocol>${wrapEnums(item.protocolOptions)}</protocol>
                        </types>
                        <content>
                            <chl id="${item.chlId}">
                                <baudRate type="baudRate">${item.baudRate}</baudRate>
                                <protocol type="protocol">${item.protocol}</protocol>
                                <address min="${item.addressMin.toString()}" max="${item.addressMax.toString()}">${item.address.toString()}</address>
                                <ptz>${item.ptz.toString()}</ptz>
                            </chl>
                        </content>
                    `
                    try {
                        const result = await editPtzProtocol(sendXml)
                        const $ = queryXml(result)
                        if ($('//status').text() === 'success') {
                            item.status = 'success'
                            editRows.value.delete(i)
                        } else {
                            item.status = 'error'
                        }
                    } catch {
                        item.status = 'error'
                    }
                }
            }
            closeLoading()
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            const timer = savePagination()

            editRows.value.clear()

            await getList()

            for (let i = 0; i < tableData.value.length; i++) {
                await getConfig(tableData.value[i].chlId, i)

                if (isPaginationChanged(timer)) {
                    break
                }

                if (i === 0) {
                    pageData.value.tableIndex = i
                    tableRef.value?.setCurrentRow(tableData.value[i])
                }
            }
        }

        /**
         * @description 获取列表数据
         */
        const getList = async () => {
            openLoading()

            const result = await getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                chlName: pageData.value.keyword,
                chlType: 'analog',
            })
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                tableData.value = $('//content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const rowData = new ChannelPtzProtocolDto()
                    rowData.disabled = true
                    rowData.status = 'loading'
                    rowData.chlId = item.attr('id')!
                    rowData.chlName = $item('name').text()
                    return rowData
                })
                pageData.value.total = Number($('//content').attr('total'))!
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
                if ($('//status').text() === 'success') {
                    item.baudRate = $('//content/chl/baudRate').text()
                    item.protocol = $('//content/chl/protocol').text()
                    item.address = Number($('//content/chl/address').text())
                    item.addressMin = Number($('//content/chl/address').attr('min')!)
                    item.addressMax = Number($('//content/chl/address').attr('max')!)
                    item.ptz = $('//content/chl/ptz').text().toBoolean()
                    item.baudRateOptions = $('//types/baudRate/enum').map((item) => {
                        return {
                            value: item.text(),
                            label: item.text(),
                        }
                    })
                    item.protocolOptions = $('//types/protocol/enum').map((item) => {
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
            tableRef.value?.setCurrentRow(tableData.value[pageData.value.tableIndex])
        }

        /**
         * @description 记录修改行的索引
         */
        const addEditRow = (index: number) => {
            editRows.value.add(index)
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

        return {
            playerRef,
            handlePlayerReady,
            pageData,
            tableData,
            changeChl,
            setData,
            getData,
            handleRowClick,
            changeAllPtz,
            handleToolBarEvent,
            editRows,
            addEditRow,
        }
    },
})
