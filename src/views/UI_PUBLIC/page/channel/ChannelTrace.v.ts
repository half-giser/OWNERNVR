/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 19:43:51
 * @Description: 云台-轨迹
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 11:55:20
 */
import { type TableInstance } from 'element-plus'
import ChannelPtzCtrlPanel from './ChannelPtzCtrlPanel.vue'
import ChannelTraceAddPop from './ChannelTraceAddPop.vue'
import ChannelPtzTableExpandPanel from './ChannelPtzTableExpandPanel.vue'
import ChannelPtzTableExpandItem from './ChannelPtzTableExpandItem.vue'
import { type ChannelPtzTraceChlDto, ChannelPtzTraceDto } from '@/types/apiType/channel'

export default defineComponent({
    components: {
        ChannelPtzCtrlPanel,
        ChannelTraceAddPop,
        ChannelPtzTableExpandPanel,
        ChannelPtzTableExpandItem,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const auth = useUserChlAuth(false)
        const playerRef = ref<PlayerInstance>()
        const pluginStore = usePluginStore()

        // 最大的巡航线数量
        const TRACE_MAX_COUNT = 4
        // 录像时间
        const DEFAULT_RECORD_TIME = 180

        const pageData = ref({
            // 通知列表
            notification: [] as string[],
            // 当前表格选中索引
            tableIndex: 0,
            // 表格展开索引列表
            expandRowKey: [] as string[],
            // 是否显示新增弹窗
            isAddPop: false,
            // 新增弹窗轨迹最大值
            addTraceMax: TRACE_MAX_COUNT,
            // 新增弹窗轨迹列表
            addTrace: [] as ChannelPtzTraceDto[],
            // 通道ID
            addChlId: '',
            // 录像剩余时间
            recordTime: DEFAULT_RECORD_TIME,
            // 是否录像状态
            recordStatus: false, // 0:未录制， 1:录制中
            // 最大录像时间
            maxRecordTime: DEFAULT_RECORD_TIME,
            // 正在录像的通道ID
            recordChlId: '',
            // 正在录像的轨迹Index
            recordTraceIndex: 0,
        })

        let timer: NodeJS.Timeout | number = 0

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzTraceChlDto[]>([])

        const formData = ref({
            // 轨迹名称
            name: '',
            // 轨迹索引
            traceIndex: '' as string | number,
        })

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
         * @description 获取轨迹数据
         * @param {string} chlId
         */
        const getTrace = async (chlId: string) => {
            openLoading(LoadingTarget.FullScreen)

            const index = tableData.value.findIndex((item) => item.chlId === chlId)
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryLocalChlPtzTraceList(sendXml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('//status').text() === 'success') {
                tableData.value[index].trace = $('//content/traces/item').map((item) => {
                    return {
                        index: Number(item.attr('index')!),
                        name: item.text(),
                    }
                })
                tableData.value[index].maxCount = Number($('//content/traces').attr('maxCount'))
                tableData.value[index].traceCount = tableData.value[index].trace.length
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
                requireField: ['traceCount'],
                isSupportPtzGroupTraceTask: true,
            })
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

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
                            traceCount: Number($item('traceCount').text()),
                            trace: [],
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
            getTrace(tableData.value[pageData.value.tableIndex].chlId)
        }

        /**
         * @description 点击表格项回调
         * @param {ChannelPtzTraceChlDto} row
         */
        const handleRowClick = (row: ChannelPtzTraceChlDto) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            if (index !== pageData.value.tableIndex) {
                pageData.value.tableIndex = index
                getTrace(tableData.value[pageData.value.tableIndex].chlId)
            }
        }

        /**
         * @description 表格项展开回调
         * @param {ChannelPtzTraceChlDto} row
         * @param {boolean} expanded
         */
        const handleExpandChange = async (row: ChannelPtzTraceChlDto, expanded: boolean) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            tableRef.value?.setCurrentRow(row)
            if (index !== pageData.value.tableIndex) {
                pageData.value.tableIndex = index
                getTrace(tableData.value[pageData.value.tableIndex].chlId)
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

        const getRowKey = (row: ChannelPtzTraceChlDto) => {
            return row.chlId
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && tableData.value.length) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        // 当前轨迹选项
        const traceOptions = computed(() => {
            return tableData.value[pageData.value.tableIndex]?.trace || []
        })

        const defaultTrace = new ChannelPtzTraceDto()

        // 当前轨迹
        const currentTrace = computed(() => {
            if (typeof formData.value.traceIndex === 'string') {
                return defaultTrace
            }
            return traceOptions.value[formData.value.traceIndex] || defaultTrace
        })

        watch(
            () => pageData.value.tableIndex,
            () => {
                play()
                cancelRecord()
            },
        )

        watch(traceOptions, (option) => {
            if (option.length) {
                formData.value.traceIndex = 0
            } else {
                formData.value.traceIndex = ''
            }
        })

        watch(currentTrace, (trace) => {
            formData.value.name = trace.name
            nextTick(() => stopRecord())
        })

        /**
         * @description 打开新增轨迹弹窗
         * @param {Number} index
         */
        const addTrace = (index: number) => {
            const current = tableData.value[index]
            if (current.trace.length >= current.maxCount) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                })
                return
            }
            pageData.value.addTraceMax = current.maxCount
            pageData.value.addTrace = current.trace
            pageData.value.addChlId = current.chlId
            pageData.value.isAddPop = true
        }

        /**
         * @description 确认新增轨迹
         */
        const confirmAddTrace = () => {
            pageData.value.isAddPop = false
            const findIndex = tableData.value.findIndex((item) => item.chlId === pageData.value.addChlId)
            if (findIndex > -1) {
                getTrace(tableData.value[findIndex].chlId)
            }
        }

        /**
         * @description 删除轨迹
         * @param {number} chlIndex 索引值
         * @param {number} traceIndex 索引值
         */
        const deleteTrace = (chlIndex: number, traceIndex: number) => {
            const chlId = tableData.value[chlIndex].chlId
            const chlName = tableData.value[chlIndex].chlName
            const trace = tableData.value[chlIndex].trace[traceIndex]

            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_TRACE_S').formatForLang(Translate('IDCS_CHANNEL'), getShortString(chlName, 10), getShortString(trace.name, 10)),
            }).then(async () => {
                openLoading(LoadingTarget.FullScreen)
                cancelRecord()

                const sendXml = rawXml`
                    <condition>
                        <chlId>${chlId}</chlId>
                        <traceIndexes>
                            <item index="${trace.index.toString()}">${trace.index.toString()}</item>
                        </traceIndexes>
                    </condition>
                `
                const result = await delLocalChlPtzTrace(sendXml)
                const $ = queryXml(result)

                if ($('//status').text() === 'success') {
                    const sendXml = rawXml`
                       <content>
                            <chlId>${chlId}</chlId>
                            <index>${trace.index.toString()}</index>
                       </content> 
                    `
                    const result = await deleteChlPtzTrace(sendXml)
                    const $ = queryXml(result)

                    if ($('//status').text() === 'success') {
                        openMessageTipBox({
                            type: 'success',
                            message: Translate('IDCS_DELETE_SUCCESS'),
                        }).then(() => getTrace(chlId))
                    } else {
                        getTrace(chlId)
                    }
                }

                closeLoading(LoadingTarget.FullScreen)
            })
        }

        /**
         * @description 修改轨迹名称
         */
        const saveName = async () => {
            if (!formData.value.name || !traceOptions.value.length) {
                return
            }

            openLoading(LoadingTarget.FullScreen)

            const sendXml = rawXml`
                <content>
                    <chlId>${tableData.value[pageData.value.tableIndex].chlId}</chlId>
                    <index>${currentTrace.value.index.toString()}</index>
                    <name>${wrapCDATA(formData.value.name)}</name>
                </content>
            `
            const result = await editChlPtzTrace(sendXml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('//status').text() === 'success') {
                openMessageTipBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).finally(() => {
                    tableData.value[pageData.value.tableIndex].trace[formData.value.traceIndex as number].name = formData.value.name
                })
            } else {
                const errorCode = Number($('//errorCode').text())
                if (errorCode === ErrorCode.USER_ERROR_NAME_EXISTED) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_PROMPT_PRESET_NAME_EXIST'),
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
         * @description 重置录像状态
         */
        const resetRecord = () => {
            pageData.value.recordStatus = false
            pageData.value.recordTime = DEFAULT_RECORD_TIME
            clearInterval(timer)
            timer = 0
        }

        /**
         * @description 开始录像
         */
        const startRecord = async () => {
            if (!traceOptions.value.length) {
                return
            }

            pageData.value.recordChlId = tableData.value[pageData.value.tableIndex].chlId
            pageData.value.recordTraceIndex = currentTrace.value.index
            pageData.value.recordStatus = true

            const sendXml = rawXml`
                <content>
                    <chlId>${pageData.value.recordChlId}</chlId>
                    <index>${pageData.value.recordTraceIndex.toString()}</index>
                </content>
            `
            await startChlPtzTrace(sendXml)

            pageData.value.recordTime = DEFAULT_RECORD_TIME - 1
            timer = setInterval(() => {
                pageData.value.recordTime--
                if (pageData.value.recordTime < 0) {
                    stopRecord()
                }
            }, 1000)
        }

        /**
         * @description 结束录像
         */
        const stopRecord = async () => {
            if (pageData.value.recordStatus) {
                resetRecord()
                const sendXml = rawXml`
                    <content>
                        <chlId>${pageData.value.recordChlId}</chlId>
                        <index>${pageData.value.recordTraceIndex.toString()}</index>
                    </content>
                `
                await saveChlPtzTrace(sendXml)
            }
        }

        /**
         * @description 取消录像
         */
        const cancelRecord = async () => {
            if (pageData.value.recordStatus) {
                resetRecord()
                const sendXml = rawXml`
                    <content>
                        <chlId>${pageData.value.recordChlId}</chlId>
                        <index>${pageData.value.recordTraceIndex.toString()}</index>
                    </content>
                `
                await cancelChlPtzTrace(sendXml)
            }
        }

        /**
         * @description 播放轨迹
         */
        const playTrace = async () => {
            if (!traceOptions.value.length) {
                return
            }
            const sendXml = rawXml`
                <content>
                    <chlId>${tableData.value[pageData.value.tableIndex].chlId}</chlId>
                    <index>${currentTrace.value.index.toString()}</index>
                </content>
            `
            await runChlPtzTrace(sendXml)
        }

        /**
         * @description 停止播放轨迹
         */
        const stopTrace = async () => {
            if (!tableData.value.length) {
                return
            }
            const sendXml = rawXml`
                <content>
                    <chlId>${tableData.value[pageData.value.tableIndex].chlId}</chlId>
                </content>
            `
            await stopChlPtzTrace(sendXml)
        }

        onMounted(async () => {
            await auth.value.update()
            await getData()
            if (tableData.value.length) {
                tableRef.value?.setCurrentRow(tableData.value[pageData.value.tableIndex])
                getTrace(tableData.value[pageData.value.tableIndex].chlId)
            }
        })

        onBeforeUnmount(() => {
            resetRecord()
            cancelRecord()
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        })

        return {
            tableRef,
            playerRef,
            pageData,
            formData,
            tableData,
            handlePlayerReady,
            changeChl,
            addTrace,
            confirmAddTrace,
            deleteTrace,
            traceOptions,
            saveName,
            handleRowClick,
            handleExpandChange,
            getRowKey,
            startRecord,
            stopRecord,
            playTrace,
            stopTrace,
            formatInputMaxLength,
            nameByteMaxLen,
            ChannelPtzCtrlPanel,
            ChannelTraceAddPop,
            ChannelPtzTableExpandPanel,
            ChannelPtzTableExpandItem,
        }
    },
})
