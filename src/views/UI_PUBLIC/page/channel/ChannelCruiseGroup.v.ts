/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-22 10:15:06
 * @Description: 巡航线组
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-22 19:32:20
 */
import { type TableInstance } from 'element-plus'
import { type ChannelPtzCruiseGroupChlDto, ChannelPtzCruiseGroupCruiseDto } from '@/types/apiType/channel'
import ChannelCruiseGroupAddPop from './ChannelCruiseGroupAddPop.vue'
import ChannelPtzTableExpandPanel from './ChannelPtzTableExpandPanel.vue'
import ChannelPtzTableExpandItem from './ChannelPtzTableExpandItem.vue'

export default defineComponent({
    components: {
        ChannelCruiseGroupAddPop,
        ChannelPtzTableExpandPanel,
        ChannelPtzTableExpandItem,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const pluginStore = usePluginStore()
        const playerRef = ref<PlayerInstance>()
        const auth = useUserChlAuth(false)

        // 最大巡航线数量
        const CRUISE_MAX_COUNT = 8

        const pageData = ref({
            // 通知列表
            notification: [] as string[],
            // 当前表格选中索引
            tableIndex: 0,
            // 表格展开索引列表
            expandRowKey: [] as string[],
            // 是否显示新增弹窗
            isAddPop: false,
            // 新增弹窗的通道ID
            addChlId: '',
            // 新增弹窗轨迹最大值
            addCruiseMax: CRUISE_MAX_COUNT,
            // 新增弹窗轨迹列表
            addCruise: [] as ChannelPtzCruiseGroupCruiseDto[],
            // 巡航线表格选中索引
            cruiseTableIndex: 0,
        })

        let cruiseId = 0

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzCruiseGroupChlDto[]>([])

        const cruiseTableRef = ref<TableInstance>()

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
                    pluginStore.showPluginNoResponse = true
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
         * @description 获取巡航线数据
         * @param {string} chlId
         */
        const getCruise = async (chlId: string) => {
            openLoading(LoadingTarget.FullScreen)

            const index = tableData.value.findIndex((item) => item.chlId === chlId)
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryLocalChlPtzGroup(sendXml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('/response/status').text() === 'success') {
                tableData.value[index].cruise = $('/response/content/cruises/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: ++cruiseId,
                        index: Number(item.attr('index')!),
                        name: $item('name').text(),
                    }
                })
                // tableData.value[index].maxCount = Number($('/response/content/cruises').attr('maxCount'))
                tableData.value[index].cruiseCount = tableData.value[index].cruise.length
            }
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading(LoadingTarget.FullScreen)

            const result = await getChlList({
                pageIndex: 1,
                pageSize: 999,
                requireField: ['groupCruiseCount'],
                isSupportPtzGroupTraceTask: true,
            })
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('/response/status').text() === 'success') {
                tableData.value = $('/response/content/item')
                    .filter((item) => {
                        const $item = queryXml(item.element)
                        return (auth.value.hasAll || auth.value.ptz[item.attr('id')!]) && $item('chlType').text() !== 'recorder'
                    })
                    .map((item) => {
                        const $item = queryXml(item.element)

                        return {
                            chlId: item.attr('id')!,
                            chlName: $item('name').text(),
                            cruiseCount: Number($item('groupCruiseCount').text()),
                            cruise: [],
                            maxCount: CRUISE_MAX_COUNT,
                        }
                    })
            }
        }

        /**
         * @description 删除巡航线
         * @param {Number} chlIndex
         * @param {Number} cruiseIndex
         */
        const deleteCruise = (chlIndex: number, cruiseIndex: number) => {
            const chlId = tableData.value[chlIndex].chlId
            const chlName = tableData.value[chlIndex].chlName
            const cruise = tableData.value[chlIndex].cruise[cruiseIndex]
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_CRUISE_BY_GROUP_S').formatForLang(Translate('IDCS_CHANNEL'), getShortString(chlName, 10), getShortString(cruise.name, 10)),
            }).then(async () => {
                openLoading(LoadingTarget.FullScreen)

                const cruiseXml = tableData.value[chlIndex].cruise
                    .filter((item) => item.index !== cruise.index)
                    .map((item) => `<item index="${item.index.toString()}">${wrapCDATA(item.name)}</item>`)
                    .join('')
                const sendXml = rawXml`
                    <condition>
                        <chlId id="${chlId}"></chlId>
                        <index>1</index>
                        <name>group1</name>
                        <cruises type="list">${cruiseXml}</cruises>
                    </condition>
                `
                const result = await editChlPtzGroup(sendXml)

                closeLoading(LoadingTarget.FullScreen)
                commSaveResponseHadler(result, () => {
                    tableData.value[chlIndex].cruise.splice(cruiseIndex, 1)
                    tableData.value[chlIndex].cruiseCount--
                })
            })
        }

        /**
         * @description 打开新增巡航线弹窗
         * @param {Number} index
         */
        const addCruise = (index: number) => {
            const current = tableData.value[index]
            if (current.cruise.length >= current.maxCount) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                })
                return
            }
            pageData.value.addChlId = current.chlId
            pageData.value.addCruise = current.cruise
            pageData.value.addCruiseMax = current.maxCount
            pageData.value.isAddPop = true
        }

        /**
         * @description 确认新增巡航线
         */
        const confirmAddCruise = () => {
            pageData.value.isAddPop = false
            getCruise(pageData.value.addChlId)
        }

        // 当前巡航线选项
        const cruiseOptions = computed(() => {
            return tableData.value[pageData.value.tableIndex]?.cruise || []
        })

        const defaultCruise = new ChannelPtzCruiseGroupCruiseDto()

        // 当前巡航线
        const currentCruise = computed(() => {
            return cruiseOptions.value[pageData.value.cruiseTableIndex] || defaultCruise
        })

        /**
         * @description 播放巡航线
         */
        const playCruiseGroup = () => {
            const sendXml = rawXml`
                <content>
                    <chlId>${tableData.value[pageData.value.tableIndex].chlId}</chlId>
                    <index>${currentCruise.value.index.toString()}</index>
                </content>
            `
            runChlPtzGroup(sendXml)
        }

        /**
         * @description 停止播放巡航线
         */
        const stopCruiseGroup = () => {
            const sendXml = rawXml`
                <content>
                    <chlId>${tableData.value[pageData.value.tableIndex].chlId}</chlId>
                </content>
            `
            stopChlPtzGroup(sendXml)
        }

        /**
         * @description 修改通道选项
         */
        const changeChl = () => {
            tableRef.value?.setCurrentRow(tableData.value[pageData.value.tableIndex])
            getCruise(tableData.value[pageData.value.tableIndex].chlId)
        }

        /**
         * @description 点击表格项回调
         * @param {ChannelPtzCruiseGroupChlDto} row
         */
        const handleRowClick = (row: ChannelPtzCruiseGroupChlDto) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            if (index !== pageData.value.tableIndex) {
                pageData.value.tableIndex = index
                getCruise(tableData.value[pageData.value.tableIndex].chlId)
            }
        }

        /**
         * @description 表格项展开回调
         * @param {ChannelPtzCruiseGroupChlDto} row
         * @param {boolean} expanded
         */
        const handleExpandChange = async (row: ChannelPtzCruiseGroupChlDto, expanded: boolean) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            tableRef.value?.setCurrentRow(row)
            if (index !== pageData.value.tableIndex) {
                pageData.value.tableIndex = index
                getCruise(tableData.value[pageData.value.tableIndex].chlId)
            }
            if (expanded) {
                if (!pageData.value.expandRowKey.includes(row.chlId)) {
                    pageData.value.expandRowKey.push(row.chlId)
                }
            } else {
                const index = pageData.value.expandRowKey.indexOf(row.chlId)
                if (index > -1) {
                    pageData.value.expandRowKey.splice(index, 1)
                }
            }
        }

        /**
         * @description 点击巡航线表格项回调
         * @param {ChannelPtzCruiseGroupCruiseDto} row
         */
        const handleCruiseRowClick = (row: ChannelPtzCruiseGroupCruiseDto) => {
            pageData.value.cruiseTableIndex = cruiseOptions.value.findIndex((item) => row.id === item.id)
        }

        watch(
            () => pageData.value.tableIndex,
            () => {
                play()
            },
        )

        watch(cruiseOptions, (option) => {
            pageData.value.cruiseTableIndex = 0
            if (option.length) {
                cruiseTableRef.value?.setCurrentRow(cruiseOptions.value[0])
            }
        })

        onMounted(async () => {
            await auth.value.update()
            await getData()
            if (tableData.value.length) {
                tableRef.value?.setCurrentRow(tableData.value[pageData.value.tableIndex])
                getCruise(tableData.value[pageData.value.tableIndex].chlId)
            }
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        })

        return {
            playerRef,
            tableRef,
            tableData,
            cruiseTableRef,
            pageData,
            mode,
            ready,
            handlePlayerReady,
            play,
            addCruise,
            confirmAddCruise,
            deleteCruise,
            cruiseOptions,
            currentCruise,
            changeChl,
            handleRowClick,
            handleExpandChange,
            handleCruiseRowClick,
            playCruiseGroup,
            stopCruiseGroup,
            ChannelCruiseGroupAddPop,
            ChannelPtzTableExpandPanel,
            ChannelPtzTableExpandItem,
        }
    },
})
