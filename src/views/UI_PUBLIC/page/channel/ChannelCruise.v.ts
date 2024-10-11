/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-21 17:50:00
 * @Description: 云台-巡航线
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-09 15:35:26
 */
import { type TableInstance } from 'element-plus'
import { type ChannelPtzCruiseChlDto, ChannelPtzCruiseDto, type ChannelPtzCruisePresetDto } from '@/types/apiType/channel'
import ChannelCruiseAddPop from './ChannelCruiseAddPop.vue'
import ChannelCruiseEditPresetPop from './ChannelCruiseEditPresetPop.vue'
import ChannelPtzTableExpandPanel from './ChannelPtzTableExpandPanel.vue'
import ChannelPtzTableExpandItem from './ChannelPtzTableExpandItem.vue'

export default defineComponent({
    components: {
        ChannelCruiseAddPop,
        ChannelCruiseEditPresetPop,
        ChannelPtzTableExpandPanel,
        ChannelPtzTableExpandItem,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageTipBox } = useMessageBox()
        const playerRef = ref<PlayerInstance>()
        const auth = useUserChlAuth(false)

        // 最大巡航线数量
        const CRUISE_MAX_COUNT = 8
        // 巡航线最大预置点数量
        const PRESET_MAX_COUNT = 16

        let presetId = 0

        const pageData = ref({
            // 通知列表
            notification: [] as string[],
            // 速度
            speed: 4,
            // 当前表格选中索引
            tableIndex: 0,
            // 表格展开索引列表
            expandRowKey: [] as string[],
            // 是否显示新增弹窗
            isAddPop: false,
            // 新增弹窗轨迹最大值
            addCruiseMax: CRUISE_MAX_COUNT,
            // 新增弹窗轨迹列表
            addCruise: [] as ChannelPtzCruiseDto[],
            // 通道ID
            addChlId: '',
            // 是否显示预置点弹窗
            isPresetPop: false,
            // 预置点索引
            presetIndex: 0,
            // 'add' | 'edit'
            presetType: 'add',
        })

        const formData = ref({
            cruiseIndex: '' as number | string,
            name: '',
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzCruiseChlDto[]>([])

        const presetTableData = ref<ChannelPtzCruisePresetDto[]>([])
        const presetTableRef = ref<TableInstance>()

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
         * @description 获取通道的巡航线数据
         */
        const getCruise = async (chlId: string) => {
            openLoading()

            const index = tableData.value.findIndex((item) => item.chlId === chlId)
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryChlCruiseList(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                tableData.value[index].cruise = $('//content/cruises/item').map((item) => {
                    return {
                        index: Number(item.attr('index')!),
                        name: item.text(),
                    }
                })
                tableData.value[index].maxCount = CRUISE_MAX_COUNT // Number($('//content/cruises').attr('maxCount'))
                tableData.value[index].cruiseCount = tableData.value[index].cruise.length
            }
        }

        /**
         * @description 获取巡航线的预置点数据
         */
        const getPreset = async () => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${tableData.value[pageData.value.tableIndex].chlId}</chlId>
                    <cruiseIndex>${currentCruise.value.index.toString()}</cruiseIndex>
                </condition>
            `
            const result = await queryChlCruise(sendXml)
            const $ = queryXml(result)

            if ($('//status').text() === 'success') {
                presetTableData.value = $('//content/presets/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: ++presetId,
                        index: Number(item.attr('index')!),
                        name: $item('name').text(),
                        speed: Number($item('speed').text()),
                        holdTime: Number($item('holdTime').text()),
                    }
                })
                if (presetTableData.value.length) {
                    presetTableRef.value?.setCurrentRow(presetTableData.value[0])
                }
            }
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading()

            const result = await getChlList({
                pageIndex: 1,
                pageSize: 999,
                requireField: ['cruiseCount'],
                isSupportPtz: true,
            })
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                tableData.value = $('//content/item')
                    .filter((item) => {
                        const $item = queryXml(item.element)
                        return (auth.value.hasAll || auth.value.ptz[item.attr('id')!]) && $item('chlType').text() !== 'recorder'
                    })
                    .map((item) => {
                        const $item = queryXml(item.element)

                        return {
                            chlId: item.attr('id')!,
                            chlName: $item('name').text(),
                            cruiseCount: Number($item('cruiseCount').text()),
                            cruise: [],
                            maxCount: Infinity,
                        }
                    })
            }
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
         * @param {ChannelPtzCruiseChlDto} row
         */
        const handleRowClick = (row: ChannelPtzCruiseChlDto) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            if (index !== pageData.value.tableIndex) {
                pageData.value.tableIndex = index
                getCruise(tableData.value[pageData.value.tableIndex].chlId)
            }
        }

        /**
         * @description 表格项展开回调
         * @param {ChannelPtzCruiseChlDto} row
         * @param {boolean} expanded
         */
        const handleExpandChange = async (row: ChannelPtzCruiseChlDto, expanded: boolean) => {
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

        const getRowKey = (row: ChannelPtzCruiseChlDto) => {
            return row.chlId
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && tableData.value.length) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        // 当前巡航线选项
        const cruiseOptions = computed(() => {
            return tableData.value[pageData.value.tableIndex]?.cruise || []
        })

        const defaultCruise = new ChannelPtzCruiseDto()

        // 当前巡航线
        const currentCruise = computed(() => {
            if (typeof formData.value.cruiseIndex === 'string') {
                return defaultCruise
            }
            return cruiseOptions.value[formData.value.cruiseIndex] || defaultCruise
        })

        /**
         * @description 修改巡航线名称
         */
        const saveName = async () => {
            if (!formData.value.name || !cruiseOptions.value.length) {
                return
            }

            openLoading()

            const sendXml = rawXml`
                <content>
                    <chl id="${tableData.value[pageData.value.tableIndex].chlId}"></chl>
                    <index>${currentCruise.value.index.toString()}</index>
                    <name>${wrapCDATA(formData.value.name)}</name>
                </content>
            `
            const result = await editChlCruise(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                openMessageTipBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).finally(() => {
                    tableData.value[pageData.value.tableIndex].cruise[formData.value.cruiseIndex as number].name = formData.value.name
                })
            } else {
                const errorCode = Number($('//errorCode').text())
                if (errorCode === ErrorCode.USER_ERROR_NAME_EXISTED) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_PROMPT_CRUISE_NAME_EXIST'),
                    })
                } else {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_SAVE_DATA_FAIL'),
                    })
                }
            }
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

        /**
         * @description 切换预置点表格选中行回调
         * @param {ChannelPtzCruisePresetDto} row
         */
        const handlePresetRowClick = (row: ChannelPtzCruisePresetDto) => {
            pageData.value.presetIndex = presetTableData.value.findIndex((item) => row.id === item.id)
        }

        /**
         * @description 新增预置点
         */
        const addPreset = () => {
            if (presetTableData.value.length >= PRESET_MAX_COUNT) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_PRESET_MAX_NUM').formatForLang(PRESET_MAX_COUNT),
                })
                return
            }
            pageData.value.isPresetPop = true
            pageData.value.presetType = 'add'
        }

        /**
         * @description 编辑预置点
         */
        const editPreset = (index: number) => {
            pageData.value.presetIndex = index
            pageData.value.isPresetPop = true
            pageData.value.presetType = 'edit'
        }

        /**
         * @description 确认新增或编辑当前巡航线的预置点
         * @param {ChannelPtzCruisePresetDto} data
         */
        const confirmChangePreset = (data: ChannelPtzCruisePresetDto) => {
            if (pageData.value.presetType === 'add') {
                presetTableData.value.push({
                    ...data,
                    id: ++presetId,
                })
            } else {
                presetTableData.value[pageData.value.presetIndex] = { ...data }
            }
            pageData.value.isPresetPop = false
            updatePreset()
        }

        /**
         * @description 删除预置点
         * @param {Number} index
         */
        const deletePreset = (index: number) => {
            pageData.value.presetIndex = index

            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_PRESET_S').formatForLang(
                    Translate('IDCS_CRUISE'),
                    currentCruise.value.name,
                    getShortString(presetTableData.value[pageData.value.presetIndex].name, 10),
                ),
            }).then(() => {
                if (index > 0 && presetTableData.value.length - 1 === index) {
                    pageData.value.presetIndex--
                }
                presetTableData.value.splice(index, 1)
                updatePreset()
            })
        }

        /**
         * @description 删除所有预置点
         */
        const deleteAllPreset = () => {
            if (!presetTableData.value.length) {
                return
            }
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_DELETE_ALL_ITEMS'),
            }).then(() => {
                presetTableData.value = []
                pageData.value.presetIndex = 0
                updatePreset()
            })
        }

        /**
         * @description 上移预置点
         * @param index
         */
        const moveUpPreset = () => {
            const index = pageData.value.presetIndex
            const temp = { ...presetTableData.value[index] }
            presetTableData.value[index] = { ...presetTableData.value[index - 1] }
            presetTableData.value[index - 1] = temp
            pageData.value.presetIndex--
            updatePreset()
        }

        /**
         * @description 下移预置点
         * @param index
         */
        const moveDownPreset = () => {
            const index = pageData.value.presetIndex
            const temp = { ...presetTableData.value[index] }
            presetTableData.value[index] = { ...presetTableData.value[index + 1] }
            presetTableData.value[index + 1] = temp
            pageData.value.presetIndex++
            updatePreset()
        }

        /**
         * @description 更新巡航线的预置点数据
         */
        const updatePreset = async () => {
            openLoading()

            const preset = presetTableData.value
                .map((item) => {
                    return rawXml`
                    <item index="${item.index.toString()}">
                        <name>${wrapCDATA(item.name.toString())}</name>
                        <speed>${item.speed.toString()}</speed>
                        <holdTime>${item.holdTime.toString()}</holdTime>
                    </item>
                `
                })
                .join('')

            const sendXml = rawXml`
                <content>
                    <index>${currentCruise.value.index.toString()}</index>
                    <chl id="${tableData.value[pageData.value.tableIndex].chlId}"></chl>
                    <presets type="list">${preset}</presets>
                </content>
            `
            const result = await editChlCruise(sendXml)
            const $ = queryXml(result)

            closeLoading()
            if (presetTableData.value.length) {
                presetTableRef.value?.setCurrentRow(presetTableData.value[pageData.value.presetIndex])
            }

            return $
        }

        /**
         * @description 删除巡航线
         * @param chlIndex
         * @param cruiseIndex
         */
        const deleteCruise = (chlIndex: number, cruiseIndex: number) => {
            const chlId = tableData.value[chlIndex].chlId
            const chlName = tableData.value[chlIndex].chlName
            const cruise = tableData.value[chlIndex].cruise[cruiseIndex]
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_CRUISE_S').formatForLang(Translate('IDCS_CHANNEL'), getShortString(chlName, 10), getShortString(cruise.name, 10)),
            }).then(async () => {
                openLoading()

                const sendXml = rawXml`
                    <condition>
                        <chlId>${chlId}</chlId>
                        <cruiseIndexes type="list">
                            <item index="${cruise.index.toString()}">${wrapCDATA(cruise.name)}</item> 
                        </cruiseIndexes>
                    </condition>
                `
                const result = await delChlCruise(sendXml)

                closeLoading()
                commSaveResponseHadler(result, () => {
                    tableData.value[chlIndex].cruise.splice(cruiseIndex, 1)
                    tableData.value[chlIndex].cruiseCount--
                })
            })
        }

        /**
         * @description 播放巡航线
         */
        const playCruise = () => {
            if (!cruiseOptions.value.length) {
                return
            }
            const sendXml = rawXml`
                <content>
                    <chlId>${tableData.value[pageData.value.tableIndex].chlId}</chlId>
                    <index>${currentCruise.value.index.toString()}</index>
                    <speed>4</speed>
                </content>
            `
            runPtzCruise(sendXml)
        }

        /**
         * @description 停止播放巡航线
         */
        const stopCruise = () => {
            if (!tableData.value.length) {
                return
            }
            const sendXml = rawXml`
                <content>
                    <chlId>${tableData.value[pageData.value.tableIndex].chlId}</chlId>
                </content>
            `
            stopPtzCruise(sendXml)
        }

        watch(
            () => pageData.value.tableIndex,
            () => {
                play()
            },
        )

        watch(cruiseOptions, (option) => {
            if (option.length) {
                formData.value.cruiseIndex = 0
            } else {
                formData.value.cruiseIndex = ''
            }
        })

        watch(currentCruise, (preset) => {
            formData.value.name = preset.name
            pageData.value.presetIndex = 0
            if (cruiseOptions.value.length) {
                getPreset()
            } else {
                presetTableData.value = []
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
            pageData,
            tableData,
            formData,
            cruiseOptions,
            playCruise,
            stopCruise,
            presetTableData,
            presetTableRef,
            handlePresetRowClick,
            addPreset,
            editPreset,
            deletePreset,
            deleteAllPreset,
            moveUpPreset,
            moveDownPreset,
            confirmChangePreset,
            handlePlayerReady,
            changeChl,
            handleRowClick,
            handleExpandChange,
            getRowKey,
            saveName,
            addCruise,
            confirmAddCruise,
            deleteCruise,
            nameByteMaxLen,
            formatInputMaxLength,
            ChannelCruiseAddPop,
            ChannelCruiseEditPresetPop,
            ChannelPtzTableExpandPanel,
            ChannelPtzTableExpandItem,
        }
    },
})
