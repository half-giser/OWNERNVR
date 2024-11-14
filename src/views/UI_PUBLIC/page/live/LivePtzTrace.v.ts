/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:07:46
 * @Description: 现场预览-云台视图-轨迹
 */
import ChannelTraceAddPop from '../channel/ChannelTraceAddPop.vue'
import { type ChannelPtzTraceDto } from '@/types/apiType/channel'

export default defineComponent({
    components: {
        ChannelTraceAddPop,
    },
    props: {
        /**
         * @property 通道ID
         */
        chlId: {
            type: String,
            required: true,
        },
        /**
         * @property 通道名称
         */
        chlName: {
            type: String,
            required: true,
        },
        /**
         * @property 是否可用
         */
        enabled: {
            type: Boolean,
            required: true,
        },
        /**
         * @property 当前是否选中轨迹
         */
        active: {
            type: Boolean,
            required: true,
        },
    },
    setup(prop) {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const systemCaps = useCababilityStore()

        // 最大的巡航线数量
        const TRACE_MAX_COUNT = 4
        // 录像时间
        const DEFAULT_RECORD_TIME = 180

        const pageData = ref({
            // 是否显示新增轨迹弹窗
            isAddPop: false,
            maxCount: TRACE_MAX_COUNT,
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

        // 列表数据
        const listData = ref<ChannelPtzTraceDto[]>([])

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
            if ($('//status').text() === 'success' && chlId === prop.chlId) {
                pageData.value.maxCount = $('//content/traces').attr('maxCount').num()
                listData.value = $('//content/traces/item').map((item) => {
                    return {
                        name: item.text(),
                        index: item.attr('index').num(),
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

            if (listData.value.length >= pageData.value.maxCount) {
                openMessageBox({
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
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_CHANNEL_TRACE_EMPTY'),
                })
                return
            }

            if (prop.chlId) {
                const sendXml = rawXml`
                    <content>
                        <chlId>${prop.chlId}</chlId>
                        <index>${item.index}</index>
                    </content>
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
                    <content>
                        <chlId>${prop.chlId}</chlId>
                    </content>
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

            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_TRACE_S').formatForLang(Translate('IDCS_CHANNEL'), getShortString(name, 10)),
            }).then(async () => {
                checkTraceRecord(prop.chlId)

                const sendXml = rawXml`
                    <condition>
                        <chlId>${prop.chlId}</chlId>
                        <traceIndexes>
                            <item index="${index}">${index}</item>
                        </traceIndexes>
                    </condition>
                `
                const result = await delLocalChlPtzTrace(sendXml)
                const $ = queryXml(result)

                if ($('//status').text() === 'success') {
                    const sendXml = rawXml`
                       <content>
                            <chlId>${prop.chlId}</chlId>
                            <index>${index}</index>
                       </content> 
                    `
                    const result = await deleteChlPtzTrace(sendXml)
                    const $ = queryXml(result)

                    if ($('//status').text() === 'success') {
                        openMessageBox({
                            type: 'success',
                            message: Translate('IDCS_DELETE_SUCCESS'),
                        }).then(() => getList())
                    } else {
                        getList()
                    }
                } else {
                    getList()
                }
            })
        }

        const timer = useClock(() => {}, 1000)

        /**
         * @description 重置录像状态
         */
        const resetRecord = () => {
            pageData.value.recordStatus = false
            pageData.value.recordTime = DEFAULT_RECORD_TIME
            timer.stop()
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
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_CHANNEL_TRACE_EMPTY'),
                })
                return
            }

            if (prop.chlId) {
                pageData.value.recordStatus = true

                const sendXml = rawXml`
                    <content>
                        <chlId>${prop.chlId}</chlId>
                        <index>${item.index}</index>
                    </content>
                `
                await startChlPtzTrace(sendXml)

                pageData.value.recordTime = DEFAULT_RECORD_TIME - 1
                timer.update(() => {
                    pageData.value.recordTime--
                    if (pageData.value.recordTime < 0) {
                        stopRecord(index)
                    }
                })
                timer.repeat()
            }
        }

        /**
         * @description 取消录像
         * @param {string} chlId
         */
        const checkTraceRecord = async (chlId: string) => {
            const item = listData.value[pageData.value.active]
            if (item && chlId && pageData.value.recordStatus) {
                resetRecord()
                const sendXml = rawXml`
                    <content>
                        <chlId>${prop.chlId}</chlId>
                        <index>${item.index}</index>
                    </content>
                `
                await cancelChlPtzTrace(sendXml)
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

            if (prop.chlId && pageData.value.recordStatus) {
                resetRecord()
                const sendXml = rawXml`
                    <content>
                        <chlId>${prop.chlId}</chlId>
                        <index>${item.index}</index>
                    </content>
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
                    if (pageData.value.recordTime !== DEFAULT_RECORD_TIME) {
                        // 切换通道时取消轨迹录制
                        if (oldVal) {
                            checkTraceRecord(oldVal)
                        }
                    }

                    if (newVal) {
                        getList()
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

        onBeforeUnmount(() => {
            if (pageData.value.recordTime !== DEFAULT_RECORD_TIME) {
                // 切换通道时取消轨迹录制
                checkTraceRecord(prop.chlId)
            }
        })

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
            ChannelTraceAddPop,
        }
    },
})
