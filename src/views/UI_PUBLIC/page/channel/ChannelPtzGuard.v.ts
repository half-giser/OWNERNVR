/*
 * @Date: 2025-05-06 09:11:58
 * @Description: 云台-看守位
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import { type TableInstance } from 'element-plus'
import ChannelPtzCtrlPanel from './ChannelPtzCtrlPanel.vue'
import { ChannelPtzGuardDto } from '@/types/apiType/channel'

export default defineComponent({
    components: {
        ChannelPtzCtrlPanel,
    },
    setup() {
        const { Translate } = useLangStore()

        const playerRef = ref<PlayerInstance>()
        const auth = useUserChlAuth(false)

        const LOCATION_MAPPING: Record<string, string> = {
            PRE: Translate('IDCS_PRESET'),
            CRU: Translate('IDCS_CRUISE'),
            TRA: Translate('IDCS_PTZ_TRACE'),
            RSC: Translate('IDCS_RANDOM_LINE_SCAN'),
            ASC: Translate('IDCS_BOUNDARY_SCANNING'),
        }

        const pageData = ref({
            // 当前表格选中索引
            tableIndex: 0,
            // 速度
            speed: 4,
            locationOptions: [] as SelectOption<string, string>[],
            switchOptions: getTranslateOptions(DEFAULT_BOOL_SWITCH_OPTIONS),
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzGuardDto[]>([])
        const editRows = useWatchEditRows<ChannelPtzGuardDto>()

        const chlOptions = computed(() => {
            return tableData.value.map((item, index) => {
                return {
                    label: item.chlName,
                    value: index,
                }
            })
        })

        const formRef = useFormRef()

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
         * @description 获取数据
         */
        const getData = async () => {
            openLoading()

            const result = await getChlList({
                requireField: ['supportPtz', 'supportIntegratedPtz'],
            })
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    if (auth.value.hasAll || auth.value.ptz[item.attr('id')]) {
                        const supportIntegratedPtz = $item('supportIntegratedPtz').text().bool()
                        const chlType = $item('chlType').text()
                        if (chlType !== 'recorder' && supportIntegratedPtz) {
                            const row = new ChannelPtzGuardDto()
                            row.chlId = item.attr('id')
                            row.chlName = $item('name').text()
                            row.chlIndex = $item('chlIndex').text().num()
                            row.chlType = chlType
                            row.minSpeed = $item('supportPtz').attr('MinPtzCtrlSpeed').num()
                            row.maxSpeed = $item('supportPtz').attr('MaxPtzCtrlSpeed').num()
                            row.status = 'loading'
                            row.disabled = true
                            row.statusTip = ''
                            tableData.value.push(row)
                        }
                    }
                })
            }
        }

        /**
         * @description 获取行数据
         * @param {string} chlId
         * @param {number} index
         */
        const getConfig = async (chlId: string, index: number) => {
            const row = tableData.value[index]

            try {
                const sendXml = rawXml`
                    <condition>
                        <chlId>${chlId}</chlId>
                    </condition>
                `
                const result = await queryChlPtzHomePosition(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    if (!pageData.value.locationOptions.length) {
                        pageData.value.locationOptions = $('types/location/enum').map((item) => {
                            return {
                                value: item.text(),
                                label: LOCATION_MAPPING[item.text()],
                            }
                        })
                    }

                    row.enable = $('content/switch').text().bool()
                    row.location = $('content/location').text()
                    row.number = $('content/number').text().num()
                    row.waitTime = $('content/waitTime').text().num()
                    row.name = $('content/name').text()
                    row.preMin = $('types/pre').attr('min').num()
                    row.preMax = $('types/pre').attr('max').num()
                    row.cruMin = $('types/cru').attr('min').num()
                    row.cruMax = $('types/cru').attr('max').num()
                    row.traMin = $('types/tra').attr('min').num()
                    row.traMax = $('types/tra').attr('max').num()
                    row.waitTimeMin = $('types/waitTime').attr('min').num()
                    row.waitTimeMax = $('types/waitTime').attr('max').num()

                    row.disabled = false
                } else {
                    row.disabled = true
                }
            } catch {
                row.disabled = true
            } finally {
                row.status = ''
            }
        }

        const getPresetNameList = async (chlId: string, index: number) => {
            const row = tableData.value[index]

            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryChlPresetList(sendXml)
            const $ = queryXml(result)
            const nameMapping: Record<number, string> = {}
            $('content/presets/item').forEach((item) => {
                nameMapping[item.attr('index').num()] = item.text()
            })

            row.presetList = getNameList(row.preMin, row.preMax, nameMapping)
        }

        const getCruiseNameList = async (chlId: string, index: number) => {
            const row = tableData.value[index]

            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryChlCruiseList(sendXml)
            const $ = queryXml(result)
            const nameMapping: Record<number, string> = {}
            $('content/presets/item').forEach((item) => {
                nameMapping[item.attr('index').num()] = item.text()
            })

            row.cruiseList = getNameList(row.cruMin, row.cruMax, nameMapping)
        }

        const getTraceNameList = async (chlId: string, index: number) => {
            const row = tableData.value[index]

            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryLocalChlPtzTraceList(sendXml)
            const $ = queryXml(result)
            const nameMapping: Record<number, string> = {}
            $('content/presets/item').forEach((item) => {
                nameMapping[item.attr('index').num()] = item.text()
            })

            row.traceList = getNameList(row.traMin, row.traMax, nameMapping)
        }

        /**
         * @description 修改通道选项
         */
        const changeChl = () => {
            tableRef.value!.setCurrentRow(tableData.value[pageData.value.tableIndex])
        }

        /**
         * @description 点击表格项回调
         * @param {ChannelPtzGuardDto} row
         */
        const handleRowClick = (row: ChannelPtzGuardDto) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            if (index !== pageData.value.tableIndex) {
                pageData.value.tableIndex = index
            }
        }

        const getRowKey = (row: ChannelPtzGuardDto) => {
            return row.chlId
        }

        const changeAllEnabled = (bool: boolean) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.enable = bool
                }
            })
        }

        const changeAllLocationPosition = (location: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.location = location
                    item.number = getNumber(item)
                }
            })
        }

        const changeLocationPosition = (row: ChannelPtzGuardDto) => {
            row.number = getNumber(row)
        }

        const getNumber = (row: ChannelPtzGuardDto) => {
            switch (row.location) {
                case 'PRE':
                    return row.preMin
                case 'CRU':
                    return row.cruMin
                case 'TRA':
                    return row.traMin
                case 'RSC':
                    return 0
                case 'ASC':
                    return 0
                default:
                    return 0
            }
        }

        const getNameList = (min: number, max: number, nameMapping: Record<number, string>) => {
            return Array(max - min)
                .fill(min)
                .map((item, index) => {
                    return {
                        value: item + index,
                        label: `${item + index}${nameMapping[item + index] ? `(${nameMapping[item + index]})` : ''}`,
                    }
                })
        }

        const getNameOption = (row: ChannelPtzGuardDto) => {
            switch (row.location) {
                case 'PRE':
                    return row.presetList
                case 'CRU':
                    return row.cruiseList
                case 'TRA':
                    return row.traceList
                case 'RSC':
                    return [
                        {
                            value: 0,
                            label: 'Random Scanning',
                        },
                    ]
                case 'ASC':
                    return [
                        {
                            value: 0,
                            label: 'Boundary Scanning',
                        },
                    ]
                default:
                    return []
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && tableData.value.length) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        const setData = async () => {
            openLoading()

            tableData.value.forEach((item) => (item.status = ''))

            for (const item of editRows.toArray()) {
                const sendXml = rawXml`
                    <content>
                        <chl id="${item.chlId}">
                            <switch type="boolean">${item.enable}</switch>
                            <location>${item.location}</location>
                            <number>${['RSC', 'ASC'].includes(item.location) ? '' : item.number}</number>
                            <waitTime>${item.waitTime}</waitTime>
                        </chl>
                    </content>
                `
                try {
                    const result = await editChlPtzHomePosition(sendXml)
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

        watch(
            () => pageData.value.tableIndex,
            () => {
                play()
            },
        )

        onMounted(async () => {
            editRows.clear()
            await auth.value.update()
            await getData()
            tableData.value.forEach(async (item, i) => {
                await getConfig(item.chlId, i)
                if (!item.disabled) {
                    await getPresetNameList(item.chlId, i)
                    await getCruiseNameList(item.chlId, i)
                    await getTraceNameList(item.chlId, i)
                    editRows.listen(item)
                }

                if (!tableData.value.some((find) => find === item)) {
                    return
                }

                if (i === 0) {
                    pageData.value.tableIndex = i
                    tableRef.value!.setCurrentRow(item)
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
            tableRef,
            formRef,
            handlePlayerReady,
            pageData,
            tableData,
            chlOptions,
            changeChl,
            handleRowClick,
            getRowKey,
            getNameOption,
            changeAllEnabled,
            changeAllLocationPosition,
            changeLocationPosition,
            editRows,
            setData,
        }
    },
})
