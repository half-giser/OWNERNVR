/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 19:43:51
 * @Description: 云台-轨迹
 */
import { type FormRules, type TableInstance } from 'element-plus'
import ChannelPtzCtrlPanel from './ChannelPtzCtrlPanel.vue'
import ChannelTraceAddPop from './ChannelTraceAddPop.vue'
import ChannelPtzTableExpandPanel from './ChannelPtzTableExpandPanel.vue'
import ChannelPtzTableExpandItem from './ChannelPtzTableExpandItem.vue'

export default defineComponent({
    components: {
        ChannelPtzCtrlPanel,
        ChannelTraceAddPop,
        ChannelPtzTableExpandPanel,
        ChannelPtzTableExpandItem,
    },
    setup() {
        const { Translate } = useLangStore()

        const auth = useUserChlAuth(false)
        const playerRef = ref<PlayerInstance>()

        // 最大的巡航线数量
        // const TRACE_MAX_COUNT = 4

        const pageData = ref({
            // 当前表格选中索引
            tableIndex: 0,
            // 表格展开索引列表
            expandRowKey: [] as string[],
            // 是否显示新增弹窗
            isAddPop: false,
            addData: new ChannelPtzTraceChlDto(),
            // 通道ID
            addChlId: '',
            // 录像剩余时间
            recordTime: 180,
            // 是否录像状态
            recordStatus: false, // 0:未录制， 1:录制中
            // 正在录像的通道ID
            recordChlId: '',
            // 正在录像的轨迹Index
            recordTraceIndex: 0,
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzTraceChlDto[]>([])

        const chlOptions = computed(() => {
            return tableData.value.map((item, index) => {
                return {
                    label: item.chlName,
                    value: index,
                }
            })
        })

        const formData = ref({
            // 轨迹名称
            name: '',
            // 轨迹索引
            traceIndex: '' as string | number,
        })

        const formRef = useFormRef()

        const rules = ref<FormRules>({
            name: [
                {
                    validator(_rule, value: string, callback) {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
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
         * @description 获取轨迹数据
         * @param {string} chlId
         */
        const getTrace = async (chlId: string) => {
            openLoading()

            const index = tableData.value.findIndex((item) => item.chlId === chlId)
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryLocalChlPtzTraceList(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                const row = tableData.value[index]
                row.trace = $('content/traces/item').map((item) => {
                    return {
                        index: item.attr('index').num(),
                        name: item.text(),
                    }
                })
                row.maxCount = $('content/traces').attr('maxCount').num()
                row.traceCount = tableData.value[index].trace.length
                row.traceMaxHoldTime = $('content/traceMaxHoldTime').text().num() || 180
                row.nameMaxLen = $('content/traces/itemType').attr('maxLen').num() || 10
                row.disabled = false
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
                requireField: ['supportPtz', 'supportIntegratedPtz'],
            })
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                tableData.value = $('content/item')
                    .filter((item) => {
                        const $item = queryXml(item.element)
                        return (auth.value.hasAll || auth.value.ptz[item.attr('id')]) && $item('chlType').text() !== 'recorder' && $item('supportIntegratedPtz').text().bool()
                    })
                    .map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            chlId: item.attr('id'),
                            chlName: $item('name').text(),
                            traceCount: $item('traceCount').text().num(),
                            trace: [],
                            maxCount: Infinity,
                            nameMaxLen: 10,
                            traceMaxHoldTime: 180,
                            minSpeed: $('supportPtz').attr('MinPtzCtrlSpeed').num(),
                            maxSpeed: $('supportPtz').attr('MaxPtzCtrlSpeed').num(),
                            disabled: true,
                            status: '',
                            statusTip: '',
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
        const handleExpandChange = (row: ChannelPtzTraceChlDto, expanded: boolean) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            tableRef.value!.setCurrentRow(row)
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
            return (
                tableData.value[pageData.value.tableIndex]?.trace.map((item, value) => ({
                    ...item,
                    value,
                })) || []
            )
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
                openMessageBox(Translate('IDCS_OVER_MAX_NUMBER_LIMIT'))
                return
            }
            pageData.value.addData = current
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

            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_TRACE_S').formatForLang(Translate('IDCS_CHANNEL'), getShortString(chlName, 10), getShortString(trace.name, 10)),
            }).then(async () => {
                openLoading()
                cancelRecord()

                const sendXml = rawXml`
                    <condition>
                        <chlId>${chlId}</chlId>
                        <traceIndexes>
                            <item index="${trace.index}">${trace.index}</item>
                        </traceIndexes>
                    </condition>
                `
                const result = await delLocalChlPtzTrace(sendXml)
                const $ = queryXml(result)

                if ($('status').text() === 'success') {
                    const sendXml = rawXml`
                       <content>
                            <chlId>${chlId}</chlId>
                            <index>${trace.index}</index>
                       </content> 
                    `
                    const result = await deleteChlPtzTrace(sendXml)
                    const $ = queryXml(result)

                    if ($('status').text() === 'success') {
                        openMessageBox({
                            type: 'success',
                            message: Translate('IDCS_DELETE_SUCCESS'),
                        }).then(() => getTrace(chlId))
                    } else {
                        getTrace(chlId)
                    }
                }

                closeLoading()
            })
        }

        /**
         * @description 修改轨迹名称
         */
        const saveName = () => {
            formRef.value?.validate(async (valid) => {
                if (valid) {
                    openLoading()

                    const sendXml = rawXml`
                <content>
                    <chlId>${tableData.value[pageData.value.tableIndex].chlId}</chlId>
                    <index>${currentTrace.value.index}</index>
                    <name>${wrapCDATA(formData.value.name)}</name>
                </content>
            `
                    const result = await editChlPtzTrace(sendXml)
                    const $ = queryXml(result)

                    closeLoading()

                    if ($('status').text() === 'success') {
                        openMessageBox({
                            type: 'success',
                            message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                        }).finally(() => {
                            tableData.value[pageData.value.tableIndex].trace[formData.value.traceIndex as number].name = formData.value.name
                        })
                    } else {
                        const errorCode = $('errorCode').text().num()
                        if (errorCode === ErrorCode.USER_ERROR_NAME_EXISTED) {
                            openMessageBox(Translate('IDCS_PROMPT_PRESET_NAME_EXIST'))
                        } else {
                            openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                        }
                    }
                }
            })
        }

        const timer = useClock(() => {
            pageData.value.recordTime--
            if (pageData.value.recordTime < 0) {
                stopRecord()
            }
        }, 1000)

        /**
         * @description 重置录像状态
         */
        const resetRecord = () => {
            pageData.value.recordStatus = false
            pageData.value.recordTime = tableData.value[pageData.value.tableIndex]?.traceMaxHoldTime || 180
            timer.stop()
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
                    <index>${pageData.value.recordTraceIndex}</index>
                </content>
            `
            await startChlPtzTrace(sendXml)

            pageData.value.recordTime = tableData.value[pageData.value.tableIndex].traceMaxHoldTime - 1
            timer.repeat()
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
                        <index>${pageData.value.recordTraceIndex}</index>
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
                        <index>${pageData.value.recordTraceIndex}</index>
                    </content>
                `
                await cancelChlPtzTrace(sendXml)
            }
        }

        /**
         * @description 播放轨迹
         */
        const playTrace = async () => {
            const sendXml = rawXml`
                <content>
                    <chlId>${tableData.value[pageData.value.tableIndex].chlId}</chlId>
                    <index>${currentTrace.value.index}</index>
                </content>
            `
            await runChlPtzTrace(sendXml)
        }

        /**
         * @description 停止播放轨迹
         */
        const stopTrace = async () => {
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
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }
        })

        return {
            tableRef,
            playerRef,
            pageData,
            formData,
            tableData,
            chlOptions,
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
            formRef,
            rules,
        }
    },
})
