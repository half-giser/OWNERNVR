/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:07:46
 * @Description: 现场预览-云台视图-轨迹
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 17:41:21
 */
export default defineComponent({
    props: {
        /**
         * @property 通道ID
         */
        chlId: {
            type: String,
            required: true,
            default: '',
        },
        /**
         * @property 是否可用
         */
        enabled: {
            type: Boolean,
            required: true,
            default: false,
        },
        /**
         * @property 当前选中的轨迹项索引
         */
        active: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    setup(prop) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const systemCaps = useCababilityStore()

        // 最大的巡航线数量
        const TRACE_MAX_COUNT = 4
        // 录像时间
        const DEFAULT_RECORD_TIME = 180

        const pageData = ref({
            // 是否显示新增轨迹弹窗
            isAddPop: false,
            // 当前选中轨迹项索引
            active: 0,
            // 是否播放状态
            playStatus: false,
            // 是否录像状态
            recordStatus: false, // 0:未录制， 1:录制中
            // 录像剩余时间
            recordTime: DEFAULT_RECORD_TIME,
            // 最大录像时间
            maxRecordTime: DEFAULT_RECORD_TIME,
        })

        let timer: NodeJS.Timeout | number = 0

        // 列表数据
        const listData = ref<SelectOption<number, string>[]>([])

        /**
         * @description 获取轨迹列表
         */
        const getList = async () => {
            const chlId = prop.chlId
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryLocalChlPtzTraceList(sendXml)
            const $ = queryXml(result)
            if ($('/response/status').text() === 'success' && chlId === prop.chlId) {
                listData.value = $('/response/content/traces/item').map((item) => {
                    return {
                        label: item.text(),
                        value: Number(item.attr('index')),
                    }
                })
            }
        }

        /**
         * @description 打开新增轨迹弹窗
         */
        const addTrace = () => {
            if (!prop.enabled) {
                return
            }
            if (listData.value.length >= TRACE_MAX_COUNT) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                })
                return
            }
            pageData.value.isAddPop = true
        }

        /**
         * @description 确认新增轨迹 刷新数据
         */
        const confirmAddTrace = () => {
            pageData.value.isAddPop = false
            getList()
        }

        /**
         * @description 播放当前轨迹
         * @param {number} index
         */
        const playCurrentTrace = (index: number) => {
            pageData.value.active = index
            playTrace()
        }

        /**
         * @description 请求播放轨迹
         */
        const playTrace = async () => {
            const item = listData.value[pageData.value.active]
            if (!item) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_CHANNEL_TRACE_EMPTY'),
                })
                return
            }
            if (prop.chlId) {
                const sendXml = rawXml`
                    <chlId>${prop.chlId}</chlId>
                    <index>${item.value.toString()}</index>
                `
                await runChlPtzTrace(sendXml)
                pageData.value.playStatus = true
            }
        }

        /**
         * @description 停止播放轨迹
         */
        const stopTrace = async () => {
            if (prop.chlId) {
                const sendXml = rawXml`
                    <chlId>${prop.chlId}</chlId>
                `
                await stopChlPtzTrace(sendXml)
                pageData.value.playStatus = false
            }
        }

        /**
         * @description 删除轨迹
         * @param {number} index
         * @param {string} name
         */
        const deleteTrace = (index: number, name: string) => {
            if (!prop.enabled) {
                return
            }

            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_TRACE_S').formatForLang(Translate('IDCS_CHANNEL'), getShortString(name, 10)),
            }).then(async () => {
                openLoading(LoadingTarget.FullScreen)

                const sendXml = rawXml`
                    <condition>
                        <chlId>${prop.chlId}</chlId>
                        <traceIndexes>
                            <item index="${index.toString()}">${index.toString()}</item>
                        </traceIndexes>
                    </condition>
                `
                const result = await delLocalChlPtzTrace(sendXml)
                const $ = queryXml(result)

                if ($('/response/status').text() === 'success') {
                    const sendXml = rawXml`
                       <content>
                            <chlId>${prop.chlId}</chlId>
                            <index>${index.toString()}</index>
                       </content> 
                    `
                    const result = await deleteChlPtzTrace(sendXml)
                    const $ = queryXml(result)

                    if ($('/response/status').text() === 'success') {
                        openMessageTipBox({
                            type: 'success',
                            message: Translate('IDCS_DELETE_SUCCESS'),
                        }).then(() => refresh())
                    } else {
                        refresh()
                    }
                } else {
                    refresh()
                }

                closeLoading(LoadingTarget.FullScreen)
            })
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
         * @description 刷新
         */
        const refresh = () => {
            resetRecord()
            getList()
        }

        /**
         * @description 开始录像
         */
        const startRecord = async () => {
            if (!prop.enabled) {
                return
            }

            const index = pageData.value.active
            const item = listData.value[pageData.value.active]
            if (!item) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_CHANNEL_TRACE_EMPTY'),
                })
                return
            }
            if (prop.chlId) {
                const sendXml = rawXml`
                    <content>
                        <chlId>${prop.chlId}</chlId>
                        <index>${item.value.toString()}</index>
                    </content>
                `
                await startChlPtzTrace(sendXml)
                pageData.value.recordTime = DEFAULT_RECORD_TIME - 1
                timer = setInterval(() => {
                    pageData.value.recordTime--
                    if (pageData.value.recordTime < 0) {
                        stopRecord(index)
                    }
                }, 1000)
            }
        }

        /**
         * @description 取消录像
         * @param {string} chlId
         */
        const checkTraceRecord = async (chlId: string) => {
            const item = listData.value[pageData.value.active]
            if (item && chlId) {
                const sendXml = rawXml`
                    <content>
                        <chlId>${prop.chlId}</chlId>
                        <index>${item.value.toString()}</index>
                    </content>
                `
                await cancelChlPtzTrace(sendXml)
                resetRecord()
            }
        }

        /**
         * @description 停止录像
         * @param {number} index
         */
        const stopRecord = async (index: number) => {
            if (!prop.enabled) {
                return
            }

            const item = listData.value[index]
            if (!item) {
                return
            }
            if (prop.chlId) {
                resetRecord()
                const sendXml = rawXml`
                    <chlId>${prop.chlId}</chlId>
                    <index>${item.value.toString()}</index>
                `
                await saveChlPtzTrace(sendXml)
            }
        }

        /**
         * @description 切换选中的轨迹
         * @param {number} index
         */
        const changeActive = (index: number) => {
            if (pageData.value.recordStatus) {
                stopRecord(pageData.value.active)
            }
            pageData.value.active = index
        }

        watch(
            () => prop.chlId,
            (newVal, oldVal) => {
                if (systemCaps.supportPtzGroupAndTrace) {
                    if (newVal) {
                        getList()
                    }
                    if (pageData.value.recordTime !== DEFAULT_RECORD_TIME) {
                        // 切换通道时取消轨迹录制
                        if (oldVal) {
                            checkTraceRecord(oldVal)
                        }
                    }
                }
            },
            {
                immediate: true,
            },
        )

        watch(
            () => prop.active,
            (newVal) => {
                if (!newVal) {
                    if (pageData.value.recordTime !== DEFAULT_RECORD_TIME) {
                        // 切换通道时取消轨迹录制
                        checkTraceRecord(prop.chlId)
                    }
                }
            },
        )

        return {
            pageData,
            listData,
            deleteTrace,
            playCurrentTrace,
            playTrace,
            stopTrace,
            addTrace,
            confirmAddTrace,
            startRecord,
            stopRecord,
            changeActive,
        }
    },
})
