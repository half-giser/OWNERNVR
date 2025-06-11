/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-23 09:01:11
 * @Description: 云台-智能追踪
 */
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const playerRef = ref<PlayerInstance>()

        const pageData = ref({
            // 追踪模式选项
            trackModeOptions: [
                {
                    label: Translate('IDCS_AUTO_TRACK_CONTROL_PRIORITY'),
                    value: 'auto',
                },
                {
                    label: Translate('IDCS_MANUAL_CONTROL_PRIORITY'),
                    value: 'manual',
                },
            ],
            // 目标静止后自动归位选项
            autoBackOptions: [
                {
                    label: Translate('IDCS_ENABLE'),
                    value: true,
                },
                {
                    label: Translate('IDCS_CLOSE'),
                    value: false,
                },
            ],
            // 选中行索引
            tableIndex: 0,
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzSmartTrackDto[]>([])

        const chlOptions = computed(() => {
            return tableData.value.map((item, index) => {
                return {
                    label: item.chlName,
                    value: index,
                    disabled: item.disabled,
                }
            })
        })

        // 编辑行索引
        const editRows = useWatchEditRows<ChannelPtzSmartTrackDto>()

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
         * @description 修改所有行目标静止后归位
         * @param {Boolean} bool
         */
        const changeAllAutoBack = (bool: boolean) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.autoBackSwitch = bool
                }
            })
        }

        /**
         * @description 获取行数据
         * @param {string} chlId
         * @param {number} index
         */
        const getConfig = async (chlId: string, index: number) => {
            const item = tableData.value[index]
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryBallIPCATCfg(sendXml)
            const $ = queryXml(result)

            try {
                if ($('status').text() === 'success') {
                    item.autoBackSwitch = $('content/chl/param/backTime/switch').text().bool()
                    item.autoBackTime = $('content/chl/param/backTime/timeValue').text().num()
                    item.ptzControlMode = $('content/chl/param/ptzControlMode').text()
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
                            <param>
                                <backTime>
                                    <switch>${item.autoBackSwitch}</switch>
                                    <timeValue>${item.autoBackTime}</timeValue>
                                </backTime>
                                <ptzControlMode>${item.ptzControlMode}</ptzControlMode>
                            </param>
                        </chl>
                    </content>
                `
                try {
                    const result = await editBallIPCATCfg(sendXml)
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
            openLoading()

            const result = await getChlList({
                pageIndex: 1,
                pageSize: 999,
                isSupportAutoTrack: true,
            })
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                tableData.value = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const rowData = new ChannelPtzSmartTrackDto()
                    rowData.status = 'loading'
                    rowData.chlId = item.attr('id')
                    rowData.chlName = $item('name').text()
                    rowData.disabled = true
                    return rowData
                })
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
         * @param {ChannelPtzSmartTrackDto} row
         */
        const handleRowClick = (row: ChannelPtzSmartTrackDto) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            if (index !== pageData.value.tableIndex) {
                pageData.value.tableIndex = index
            }
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

        onMounted(async () => {
            editRows.clear()

            await getData()

            tableData.value.forEach(async (item, i) => {
                await getConfig(item.chlId, i)

                if (!tableData.value.some((find) => find === item)) {
                    return
                }

                editRows.listen(item)

                if (i === 0) {
                    tableRef.value?.setCurrentRow(item)
                }
            })
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
            handleRowClick,
            changeAllAutoBack,
            editRows,
        }
    },
})
