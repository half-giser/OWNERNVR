/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-23 09:01:11
 * @Description: 云台-智能追踪
 */
import { type TableInstance } from 'element-plus'
import { ChannelPtzSmartTrackDto } from '@/types/apiType/channel'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const playerRef = ref<PlayerInstance>()

        const pageData = ref({
            notification: [] as string[],
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
         * @description 修改所有行目标静止后归位
         * @param {Boolean} bool
         */
        const changeAllAutoBack = (bool: boolean) => {
            tableData.value.forEach((item, index) => {
                if (!item.disabled) {
                    item.autoBackSwitch = bool
                    addEditRow(index)
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
                if ($('//status').text() === 'success') {
                    item.autoBackSwitch = $('//content/chl/param/backTime/switch').text().bool()
                    item.autoBackTime = $('//content/chl/param/backTime/timeValue').text().num()
                    item.ptzControlMode = $('//content/chl/param/ptzControlMode').text()
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
            openLoading()

            const result = await getChlList({
                pageIndex: 1,
                pageSize: 999,
                isSupportAutoTrack: true,
            })
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                tableData.value = $('//content/item').map((item) => {
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
            tableRef.value?.setCurrentRow(tableData.value[pageData.value.tableIndex])
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

        /**
         * @description 记录修改行的索引
         */
        const addEditRow = (index: number) => {
            editRows.value.add(index)
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
            await getData()
            for (let i = 0; i < tableData.value.length; i++) {
                await getConfig(tableData.value[i].chlId, i)

                if (i === 0) {
                    tableRef.value?.setCurrentRow(tableData.value[0])
                }
            }
        })

        return {
            playerRef,
            handlePlayerReady,
            pageData,
            tableData,
            changeChl,
            setData,
            handleRowClick,
            changeAllAutoBack,
            editRows,
            addEditRow,
        }
    },
})
