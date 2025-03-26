/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:37:55
 * @Description: 回放-事件列表
 */
import dayjs from 'dayjs'

export default defineComponent({
    props: {
        /**
         * @property {Number} 开始时间 毫秒
         */
        startTime: {
            type: Number,
            required: true,
            default: 0,
        },
        /**
         * @property {Number} 结束时间 毫秒
         */
        endTime: {
            type: Number,
            required: true,
            default: 0,
        },
        /**
         * @property {Enum} 模式 modeOne | modeTwo
         */
        modeType: {
            type: String,
            required: true,
            default: 'modeOne',
        },
        /**
         * @property {Array} 事件列表
         */
        eventList: {
            type: Array as PropType<string[]>,
            required: true,
            default: () => [],
        },
        /**
         * @property {Array} 通道列表
         */
        chls: {
            type: Array as PropType<PlaybackChlList[]>,
            required: true,
            default: () => [],
        },
        /**
         * @property 当前通道
         */
        chl: {
            type: String,
            required: true,
            default: '',
        },
        /**
         * @property 播放状态
         */
        playStatus: {
            type: String,
            required: true,
        },
        /**
         * @property POS关键字
         */
        posKeyword: {
            type: String,
            default: '',
        },
    },
    emits: {
        play(row: PlaybackRecLogList) {
            return !!row.chlId
        },
        download(row: PlaybackRecLogList) {
            return !!row.chlId
        },
        error(msgs: string[]) {
            return Array.isArray(msgs)
        },
        callback(list: PlaybackRecList[], hasPosEvent: boolean) {
            return Array.isArray(list) && typeof hasPosEvent === 'boolean'
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const dateTime = useDateTimeStore()

        // 事件与显示文本的映射
        const EVENT_TRANS_MAPPING: Record<string, string> = {
            MANUAL: Translate('IDCS_MANUAL'),
            SENSOR: Translate('IDCS_SENSOR'),
            MOTION: Translate('IDCS_MOTION_DETECTION'),
            POS: Translate('IDCS_POS'),
            VEHICLE: Translate('IDCS_VEHICLE_DETECTION'),
            FACEDETECTION: Translate('IDCS_FACE_RECOGNITION'),
            FACEMATCH: systemCaps.supportFaceMatch ? Translate('IDCS_FACE_RECOGNITION') : Translate('IDCS_FACE_DETECTION'),
            TRIPWIRE: Translate('IDCS_BEYOND_DETECTION'),
            INVADE: Translate('IDCS_INVADE_DETECTION'),
            AOIENTRY: Translate('IDCS_INVADE_DETECTION'),
            AOILEAVE: Translate('IDCS_INVADE_DETECTION'),
            SCHEDULE: Translate('IDCS_SCHEDULE'),
            ITEMCARE: Translate('IDCS_WATCH_DETECTION'),
            CROWDDENSITY: Translate('IDCS_CROWD_DENSITY_DETECTION'),
            EXCEPTION: Translate('IDCS_ABNORMAL_DISPOSE_WAY'),
            FIREPOINT: Translate('IDCS_FIRE_POINT_DETECTION'),
            TEMPERATURE: Translate('IDCS_TEMPERATURE_DETECTION'),
        }
        // 检测目标与显示文本的映射
        const MOTION_TARGETS_MAPPING: Record<string, string> = {
            SMDHUMAN: Translate('IDCS_DETECTION_PERSON'), // 人
            SMDVEHICLE: Translate('IDCS_DETECTION_VEHICLE'), // 车
            None: Translate('IDCS_NULL'), // 无
        }

        const isMac = getSystemInfo().platform

        const pageData = ref({
            // 弹窗是否可见
            visible: false,
            // 是否显示事件选项
            eventVisible: false,
            // 事件选项
            eventOptions: Object.entries(EVENT_TRANS_MAPPING)
                .filter((item) => {
                    // 根据能力集判断是否显示POS
                    if (item[0] === 'POS') return systemCaps.supportPOS
                    // FACEDETECTION FACEMATCH 都归为人脸识别(FACEMATCH)，AOILEAVE AOIENTRY INVADE 都归为区域入侵(INVADE)，渲染的时候只取一个
                    if (['FACEDETECTION', 'AOIENTRY', 'AOILEAVE'].includes(item[0])) return false
                    return true
                })
                .map((item) => ({
                    label: item[1],
                    value: item[0],
                })) as SelectOption<string, string>[],
            // 检测目标选项
            motionTargetOptions: Object.entries(MOTION_TARGETS_MAPPING).map((item) => ({
                label: item[1],
                value: item[0],
            })) as SelectOption<string, string>[],
            // 选中的事件选项
            event: [] as string[],
            // 选中的检测目标选项
            motion: [] as string[],
        })

        // 表格数据
        const tableData = ref<PlaybackRecList[]>([])

        /**
         * @description 格式化时间
         * @param {number} timestamp 毫秒
         * @returns {string}
         */
        const displayTime = (timestamp: number) => {
            return formatDate(timestamp, dateTime.dateTimeFormat)
        }

        /**
         * @description 显示事件图标
         * @param {Object} row
         * @returns {Boolean}
         */
        const displayEventIcon = (row: PlaybackRecLogList) => {
            return ['SMDHUMAN', 'SMDHUMAN'].includes(row.event) || ['SMDHUMAN', 'SMDHUMAN'].includes(row.recSubType)
        }

        /**
         * @description 显示事件文本
         * @param {Object} row
         * @returns {String}
         */
        const displayEvent = (row: PlaybackRecLogList) => {
            if (displayEventIcon(row)) {
                return EVENT_TRANS_MAPPING.MOTION
            } else {
                // INTELLIGENT、NORMALALL事件类型显示具体的子类型事件
                return EVENT_TRANS_MAPPING[row.event] || EVENT_TRANS_MAPPING[row.recSubType]
            }
        }

        // 表格数据限制
        const filterTableData = computed(() => {
            if (!prop.chl) {
                return []
            }
            const current = tableData.value.find((item) => item.chlId === prop.chl)
            if (!current) {
                return []
            }
            const records = current.records.map((item) => {
                return {
                    chlId: current.chlId,
                    chlName: current.chlName,
                    ...item,
                }
            })
            if (!pageData.value.event.length && !pageData.value.motion.length) {
                return records
            }
            const events = pageData.value.event
            const motions = pageData.value.motion
            return records
                .filter((item) => {
                    if (item.event === 'FACEMATCH' || item.recSubType === 'FACEMATCH') {
                        if (systemCaps.supportFaceMatch) {
                            return events.includes('FACEMATCH') || events.includes('FACEDETECTION')
                        } else {
                            return events.includes('FACEDETECTION')
                        }
                    } else if (item.event === 'INVADE' || item.recSubType === 'INVADE') {
                        return events.includes('INVADE') || events.includes('AOIENTRY') || events.includes('AOILEAVE')
                    } else {
                        return events.includes(item.event) || events.includes(item.recSubType) || ['SMDHUMAN', 'SMDHUMAN'].includes(item.event) || ['SMDHUMAN', 'SMDHUMAN'].includes(item.recSubType)
                    }
                })
                .filter((item) => {
                    // 目标：全选/全不选/包括“无”，显示所有的选择的事件类型结果
                    if (!motions.length || motions.includes('None')) {
                        return true
                    }

                    // 不包括“无”：如果选择了Motion类型则显示选中的目标类型结果；否则显示空数据
                    if (events.includes('MOTION')) {
                        return motions.includes(item.event) || motions.includes(item.recSubType)
                    } else {
                        return false
                    }
                })
        })

        let isLocked = false

        /**
         * @description 获取录像列表
         */
        const getRecList = async () => {
            if (isLocked) {
                return
            }
            isLocked = true

            const chls = prop.chls.map((chl) => `<item id="${chl.id}"></item>`).join('')
            const sendXml = rawXml`
                <types>
                    <recType>
                        ${wrapEnums(['MOTION', 'SMDHUMAN', 'SMDVEHICLE', 'SCHEDULE', 'SENSOR', 'MANUAL', 'INTELLIGENT', 'POS', 'NORMALALL', 'FACEDETECTION', 'FACEMATCH', 'VEHICLE', 'TRIPWIRE', 'INVADE', 'AOIENTRY', 'AOILEAVE', 'ITEMCARE', 'CROWDDENSITY', 'EXCEPTION'])}
                    </recType>
                </types>
                <requireField>
                    <chl />
                    <recList>
                        <item>
                            <recType />
                            <startTime />
                            <endTime />
                            <size />
                        </item>
                    </recList>
                </requireField>
                <condition>
                    <modeType>${prop.modeType}</modeType>
                    <startTime>${formatDate(prop.startTime, DEFAULT_DATE_FORMAT)}</startTime>
                    <endTime>${formatDate(prop.endTime, DEFAULT_DATE_FORMAT)}</endTime>
                    <startTimeEx>${localToUtc(prop.startTime)}</startTimeEx>
                    <endTimeEx>${localToUtc(prop.endTime)}</endTimeEx>
                    <recType type='list'>
                        <itemType type='recType'/>
                        ${prop.eventList.map((event) => `<item>${event}</item>`).join('')}
                    </recType>
                    ${prop.eventList.includes('POS') ? `<keyword>${prop.posKeyword}</keyword>` : ''}
                    ${prop.chls.length ? `<chl>${chls}</chl>` : ''}
                </condition>
            `
            const result = await queryChlRecLog(sendXml)
            const $ = queryXml(result)

            isLocked = false

            if ($('status').text() === 'success') {
                let hasPosEvent = false
                tableData.value = $('content/chl/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        chlId: item.attr('id'),
                        chlName: $item('name').text(),
                        records: $item('recList/item').map((rec) => {
                            const $rec = queryXml(rec.element)
                            const startTime = dayjs.utc($rec('startTime').text()).valueOf()
                            const endTime = dayjs.utc($rec('endTime').text()).valueOf()
                            const size = $rec('size').text()
                            const recType = $rec('recType').text()
                            const recSubType = $rec('recSubType').text()
                            if (recType === 'POS' || recSubType === 'POS') {
                                hasPosEvent = true
                            }
                            return {
                                startTime,
                                endTime,
                                event: recType,
                                recSubType,
                                size: size ? size + 'MB' : '--',
                                duration: dayjs.utc(endTime - startTime).format('HH:mm:ss'),
                            }
                        }),
                        timeZone: $item('recList').attr('timeZone'),
                    }
                })
                ctx.emit('callback', tableData.value, hasPosEvent)
            } else {
                const errorType = $('errorDescription').text()
                if (errorType === 'noRecord') {
                    const error = prop.chls.map((item) => item.value + ' : ' + Translate('IDCS_NO_RECORD_DATA'))
                    ctx.emit('error', error)
                }
            }
        }

        /**
         * @description 播放选中任务
         * @param {Object} row
         */
        const play = (row: PlaybackRecLogList) => {
            pageData.value.visible = false
            ctx.emit('play', row)
        }

        /**
         * @description 下载选中任务
         * @param {Object} row
         */
        const download = (row: PlaybackRecLogList) => {
            pageData.value.visible = false
            ctx.emit('download', row)
        }

        /**
         * @description 刷新列表
         */
        const refresh = () => {
            if (prop.chls.length) {
                getRecList()
            } else {
                tableData.value = []
                ctx.emit('callback', [], false)
            }
        }

        watch(
            () => prop.chls,
            () => {
                if (prop.playStatus !== 'pending') {
                    nextTick(() => refresh())
                }
            },
            {
                deep: true,
            },
        )

        // watch(
        //     () => prop.startTime,
        //     () => {
        //         nextTick(() => refresh())
        //     },
        // )

        watch(
            () => prop.playStatus,
            (newVal) => {
                // if (tableData.value.length === prop.chls.length) {
                //     return
                // }

                if (newVal === 'pending') {
                    nextTick(() => refresh())
                }
            },
            {
                deep: true,
            },
        )

        watch(
            () => pageData.value.visible,
            () => {
                if (pageData.value.eventVisible) {
                    pageData.value.visible = true
                }
            },
        )

        return {
            play,
            download,
            pageData,
            filterTableData,
            isMac,
            displayTime,
            displayEvent,
            displayEventIcon,
        }
    },
})
