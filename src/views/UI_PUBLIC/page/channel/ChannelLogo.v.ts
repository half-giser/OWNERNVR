/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-23 14:11:24
 * @Description: LOGO设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-25 18:35:05
 */
import { ChannelLogoSetDto } from '@/types/apiType/channel'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const playerRef = ref<PlayerInstance>()

        const pageData = ref({
            notification: [] as string[],
            // 选中行索引
            tableIndex: 0,
            switchOptions: getSwitchOptions(),
            pageIndex: 1,
            pageSize: 10,
            total: 10,
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelLogoSetDto[]>([])

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
         * @description 播放视频
         */
        const play = () => {
            const row = tableData.value[pageData.value.tableIndex]
            if (mode.value === 'h5') {
                player.play({
                    chlID: row.chlId,
                    streamType: 2,
                })
            } else if (mode.value === 'ocx') {
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
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
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
                chlType: 'analog',
            })
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                tableData.value = $('//content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const rowData = new ChannelLogoSetDto()
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
                const result = await queryIPChlORChlLogo(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    item.switch = $('content/chl/logo/switch').text().toBoolean().toString()
                    item.opacity = Number($('content/chl/logo/opacity').text())
                    item.minOpacity = Number($('content/chl/logo/opacity').attr('min'))
                    item.maxOpacity = Number($('content/chl/logo/opacity').attr('max'))
                    item.X = Number($('content/chl/logo/X').text())
                    item.Y = Number($('content/chl/logo/Y').text())
                    item.minX = Number($('content/chl/logo/X').attr('min'))
                    item.maxX = Number($('content/chl/logo/X').attr('max'))
                    item.minY = Number($('content/chl/logo/Y').attr('min'))
                    item.maxY = Number($('content/chl/logo/Y').attr('max'))
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

            for (let i = 0; i < tableData.value.length; i++) {
                if (editRows.value.has(i)) {
                    const item = tableData.value[i]
                    const sendXml = rawXml`
                        <content>
                            <chl id="${item.chlId}">
                                <name>${item.chlName}</name>
                                <logo>
                                    <switch>${item.switch}</switch>
                                    <opacity min="${item.minOpacity.toString()}" max="${item.maxOpacity.toString()}">${item.opacity.toString()}</opacity>
                                    <X min="${item.minX.toString()}" max="${item.maxX.toString()}">${item.X.toString()}</X>
                                    <Y min="${item.minY.toString()}" max="${item.maxY.toString()}">${item.Y.toString()}</Y>
                                </logo>
                            </chl>
                        </content>
                    `
                    try {
                        const result = await editIPChlORChlLogo(sendXml)
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
         * @description 修改通道选项
         */
        const changeChl = () => {
            tableRef.value?.setCurrentRow(tableData.value[pageData.value.tableIndex])
        }

        /**
         * @description 更改所有开关
         * @param {string} value
         */
        const changeAllSwitch = (value: string) => {
            tableData.value.forEach((item, index) => {
                if (!item.disabled) {
                    item.switch = value
                    addEditRow(index)
                }
            })
        }

        /**
         * @description 记录修改行的索引
         */
        const addEditRow = (index: number) => {
            editRows.value.add(index)
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

        const handleKeydownEnter = (e: KeyboardEvent) => {
            ;(e.target as HTMLInputElement).blur()
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
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
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
            changeAllSwitch,
            handleKeydownEnter,
            editRows,
            addEditRow,
        }
    },
})
