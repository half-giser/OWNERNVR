/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 13:48:22
 * @Description: 按事件搜索
 */
import dayjs from 'dayjs'
import BackupPop from '../searchAndBackup/BackupPop.vue'
import BackupLocalPop from '../searchAndBackup/BackupLocalPop.vue'
import { type TableInstance } from 'element-plus'
import BackupPosInfoPop from './BackupPosInfoPop.vue'
import { type EventTypeItem } from '@/utils/const/record'

export default defineComponent({
    components: {
        BackupPop,
        BackupLocalPop,
        BackupPosInfoPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const router = useRouter()
        const systemCaps = useCababilityStore()

        const tableRef = ref<TableInstance>()

        // 事件与显示文本映射
        const EVENTS_MAPPING: Record<string, string> = {
            MANUAL: Translate('IDCS_MANUAL'),
            MOTION: Translate('IDCS_MOTION_DETECTION'),
            SCHEDULE: Translate('IDCS_SCHEDULE'),
            SENSOR: Translate('IDCS_SENSOR'),
            INTELLIGENT: Translate('IDCS_AI'),
            POS: Translate('IDCS_POS'),
        }

        const plugin = usePlugin({
            onReady: (mode, plugin) => {
                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Playback')
                    plugin.ExecuteCmd(sendXML)
                }
            },
            onDestroy: (mode, plugin) => {
                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_StopPreview('ALL')
                    plugin.ExecuteCmd(sendXML)
                }
            },
        })

        // 播放模式
        const mode = computed(() => {
            return plugin.IsSupportH5() ? 'h5' : 'ocx'
        })

        // 通道ID与通道名称的映射
        const chlMap = ref<Record<string, string>>({})

        const dateTime = useDateTimeStore()
        const userAuth = useUserChlAuth()

        const pageData = ref({
            // 通道列表
            chlList: [] as PlaybackChlList[],
            // 是否打开本地备份弹窗（H5）
            isLocalBackUpPop: false,
            // 是否打开备份弹窗
            isBackUpPop: false,
            // 录像备份列表
            backupRecList: [] as PlaybackBackUpRecList[],
            // 事件选项
            eventOptions: [
                {
                    checked: 'event_type_manual_checked',
                    unchecked: 'event_type_manual_unchecked',
                    file: 'event_type_manual',
                    label: EVENTS_MAPPING.MANUAL,
                    value: 'MANUAL',
                    hidden: false,
                },
                {
                    checked: 'event_type_sensor_checked',
                    unchecked: 'event_type_sensor_unchecked',
                    file: 'event_type_sensor',
                    label: EVENTS_MAPPING.SENSOR,
                    value: 'SENSOR',
                    hidden: false,
                },
                {
                    checked: 'event_type_Intelligence_checked',
                    unchecked: 'event_type_Intelligence_unchecked',
                    file: 'event_type_Intelligence',
                    label: EVENTS_MAPPING.INTELLIGENT,
                    value: 'INTELLIGENT',
                    hidden: false,
                },
                {
                    checked: 'event_type_motion_checked',
                    unchecked: 'event_type_motion_unchecked',
                    file: 'event_type_motion',
                    label: EVENTS_MAPPING.MOTION,
                    value: 'MOTION',
                    hidden: systemCaps.ipChlMaxCount <= 0,
                },
                {
                    checked: 'event_type_pos_checked',
                    unchecked: 'event_type_pos_unchecked',
                    file: 'event_type_pos',
                    label: EVENTS_MAPPING.POS,
                    value: 'POS',
                    hidden: !systemCaps.supportPOS,
                },
                {
                    checked: 'event_type_schedule_checked',
                    unchecked: 'event_type_schedule_unchecked',
                    file: 'event_type_schedule',
                    label: EVENTS_MAPPING.SCHEDULE,
                    value: 'SCHEDULE',
                    hidden: false,
                },
            ],
            // 目标选项
            targetOptions: [
                // 人
                {
                    label: Translate('IDCS_DETECTION_PERSON'),
                    value: 'SMDHUMAN',
                },
                // 车
                {
                    label: Translate('IDCS_DETECTION_VEHICLE'),
                    value: 'SMDVEHICLE',
                },
                // 无
                {
                    label: Translate('IDCS_NULL'),
                    value: 'None',
                },
            ],
            // 当前页码
            currentPage: 1,
            // 每页显示条数
            pageSize: 50,
            // 选中的列表项
            selectedRecList: [] as PlaybackRecLogList[],
            // 是否显示回放弹窗
            isPlaybackPop: false,
            // 是否显示POS信息弹窗
            isPosInfoPop: false,
            // POS信息
            posInfo: new PlaybackRecLogList(),
            // 回放列表
            playbackList: [] as PlaybackPopList[],
            // 最大通道数
            maxChl: 36,
            // 已选择的事件类型列表
            events: [] as EventTypeItem[],
        })

        // 最大通道数
        const maxChl = computed(() => {
            return Math.min(pageData.value.chlList.length, pageData.value.maxChl)
        })

        // 表格数据
        const tableData = ref<PlaybackRecLogList[]>([])

        // 当前页的表格数据
        const filterTableData = computed(() => {
            return tableData.value.slice((pageData.value.currentPage - 1) * pageData.value.pageSize, pageData.value.currentPage * pageData.value.pageSize)
        })

        const formData = ref({
            // 开始时间
            startTime: '',
            // 结束时间
            endTime: '',
            // 选中的通道
            chls: [] as string[],
            // POS关键字
            pos: '',
        })

        // 通道全选
        const isChlAll = computed(() => {
            return !!formData.value.chls.length && formData.value.chls.length >= maxChl.value
        })

        /**
         * @description 序号显示
         * @param {Number} index
         * @returns {Number}
         */
        const displayIndex = (index: number) => {
            return pageData.value.pageSize * (pageData.value.currentPage - 1) + index + 1
        }

        /**
         * @description 显示事件图标
         * @param {Object} row
         * @returns {Boolean}
         */
        const displayEventIcon = (row: PlaybackRecLogList) => {
            return ['SMDHUMAN', 'SMDHUMAN'].includes(row.event)
        }

        /**
         * @description 显示事件文本
         * @param {Object} row
         * @returns {String}
         */
        const displayEvent = (row: PlaybackRecLogList) => {
            if (displayEventIcon(row)) {
                return EVENTS_MAPPING.MOTION
            } else {
                return EVENTS_MAPPING[row.event]
            }
        }

        /**
         * @description 显示时间日期格式
         * @param {Number} timestamp
         * @returns {String}
         */
        const displayDateTime = (timestamp: number) => {
            return formatDate(timestamp, dateTime.dateTimeFormat)
        }

        /**
         * @description 获取通道列表
         */
        const getChlsList = async () => {
            const result = await queryChlsExistRec()
            const $ = queryXml(result)

            chlMap.value = {}

            if ($('status').text() === 'success') {
                pageData.value.chlList = $('content/item').map((item) => {
                    const id = item.attr('id')

                    // 新获取的通道列表若没有已选中的通道，移除该选中的通道
                    const index = formData.value.chls.indexOf('id')
                    if (index > -1) {
                        formData.value.chls.splice(index, 1)
                    }

                    chlMap.value[id] = item.text()

                    return {
                        id,
                        value: item.text(),
                    }
                })
            }
        }

        /**
         * @description 备份
         */
        const backUp = () => {
            const selection = tableRef.value!.getSelectionRows() as PlaybackRecLogList[]

            if ((mode.value === 'ocx' && plugin.BackUpTask.isExeed(selection.length)) || selection.length > 100) {
                openMessageBox(Translate('IDCS_BACKUP_TASK_NUM_LIMIT').formatForLang(plugin.BackUpTask.limit))
                return
            }
            pageData.value.backupRecList = selection.map((chl) => {
                return {
                    chlId: chl.chlId,
                    chlName: chl.chlName,
                    events: [chl.event],
                    startTime: chl.startTime,
                    endTime: chl.endTime,
                    streamType: 1,
                }
            })
            pageData.value.isBackUpPop = true
        }

        /**
         * @description 确认备份
         * @param {string} type
         * @param {string} path
         * @param {string} format
         */
        const confirmBackUp = (type: string, path: string, format: string) => {
            if (type === 'local') {
                if (mode.value === 'h5') {
                    pageData.value.isLocalBackUpPop = true
                }

                if (mode.value === 'ocx') {
                    plugin.BackUpTask.addTask(pageData.value.backupRecList, path, format)
                    router.push({
                        path: '/search-and-backup/backup-state',
                    })
                }
                pageData.value.isBackUpPop = false
            } else {
                pageData.value.isBackUpPop = false
                router.push({
                    path: '/search-and-backup/backup-state',
                })
            }
        }

        /**
         * @description 通道全选和取消全选
         * @param {boolean} bool
         */
        const toggleAllChl = (bool: string | number | boolean) => {
            if (bool === false) {
                formData.value.chls = []
            } else {
                formData.value.chls = pageData.value.chlList.map((item) => item.id).slice(0, maxChl.value)
            }
        }

        /**
         * @description 搜索
         */
        const search = async () => {
            const startTime = dayjs(formData.value.startTime, { format: DEFAULT_DATE_FORMAT, jalali: false }).valueOf()
            const endTime = dayjs(formData.value.endTime, { format: DEFAULT_DATE_FORMAT, jalali: false }).valueOf()
            if (endTime <= startTime) {
                openMessageBox(Translate('IDCS_END_TIME_GREATER_THAN_START'))
                return
            }

            openLoading()

            const chls = formData.value.chls.map((chl) => `<item id="${chl}"></item>`).join('')
            const eventsXML = pageData.value.events
                .map((item1) => {
                    if (item1.value === 'motion') {
                        return ['motion', 'smdPerson', 'smdCar'].map((item2) => `<item>${item2}</item>`).join('')
                    } else {
                        return `<item>${item1.value}</item>`
                    }
                })
                .join('')

            tableData.value = []

            const sendXml = rawXml`
                <condition>
                    <startTime>${formatGregoryDate(startTime, DEFAULT_DATE_FORMAT)}</startTime>
                    <endTime>${formatGregoryDate(endTime, DEFAULT_DATE_FORMAT)}</endTime>
                    <recType type='list'>
                        <itemType type='recType'/>
                        ${eventsXML}
                    </recType>
                    ${enablePos ? `<keyword>${formData.value.pos}</keyword>` : ''}
                    ${formData.value.chls.length ? `<chl type='list'>${chls}</chl>` : ''}
                </condition>
            `
            const result = await queryRecLog(sendXml)
            const $ = queryXml(result)

            closeLoading()

            showMaxSearchLimitTips($)

            $('content/chl/item').forEach((item) => {
                const $item = queryXml(item.element)
                const chlId = item.attr('id')
                const chlName = $item('name').text()
                const timeZone = $item('recList').attr('timeZone')
                $item('recList/item').forEach((rec) => {
                    const $rec = queryXml(rec.element)
                    const startTime = dayjs.utc($rec('startTime').text()).valueOf()
                    const endTime = dayjs.utc($rec('endTime').text()).valueOf()
                    const size = $rec('size').text()
                    const recType = $rec('recType').text()
                    const recSubType = $rec('recSubType').text()
                    tableData.value.push({
                        chlId,
                        chlName,
                        startTime,
                        endTime,
                        event: recType,
                        recSubType,
                        size: size ? size + 'MB' : '--',
                        duration: dayjs.utc(endTime - startTime).format('HH:mm:ss'),
                        timeZone,
                    })
                })
            })

            if (!tableData.value.length) {
                openMessageBox(Translate('IDCS_NO_RECORD_DATA'))
            }
        }

        /**
         * @description 播放回放
         * @param {Object} row
         */
        const playRec = (row: PlaybackRecLogList) => {
            pageData.value.playbackList = [
                {
                    chlId: row.chlId,
                    chlName: row.chlName,
                    startTime: row.startTime,
                    endTime: row.endTime,
                    eventList: [row.event],
                },
            ]
            pageData.value.isPlaybackPop = true
        }

        /**
         * @description 点击列表项回调
         * @param {Array} row
         */
        const handleRecClick = (row: PlaybackRecLogList) => {
            tableRef.value!.toggleRowSelection(row, true)
        }

        /**
         * @description 选中的列表项改变时回调
         * @param {Array} rows
         */
        const handleRecChange = (rows: PlaybackRecLogList[]) => {
            pageData.value.selectedRecList = rows
        }

        /**
         * @description 查看POS信息
         */
        const showPosInfo = (row: PlaybackRecLogList) => {
            pageData.value.isPosInfoPop = true
            pageData.value.posInfo = row
        }

        watch(filterTableData, () => {
            tableRef.value!.clearSelection()
        })

        /**
         * @description 打开事件类型筛选框
         */
        interface EventSelectorInstance {
            open(): void
        }
        const baseEventSelectorRef = ref<EventSelectorInstance>()
        const openEventSelector = () => {
            console.log(pageData.value.events)
            baseEventSelectorRef.value?.open()
        }

        // 选择的事件类型列表 - 拼接为字符串
        const eventsStr = computed(() => {
            const events = pageData.value.events.map((item) => {
                return Translate(EVENT_TYPE_NAME_MAPPING[item.value])
            })
            return events.length === 0 ? Translate('IDCS_FULL') : events.join(', ')
        })

        // 是否支持POS
        const enablePos = computed(() => {
            const events = pageData.value.events.map((item) => {
                return item.value
            })
            return events.length === 0 || events.includes('POS')
        })

        onMounted(() => {
            getChlsList()

            const date = new Date()
            formData.value.startTime = dayjs(date).hour(0).minute(0).second(0).calendar('gregory').format(DEFAULT_DATE_FORMAT)
            formData.value.endTime = dayjs(date).hour(23).minute(59).second(59).calendar('gregory').format(DEFAULT_DATE_FORMAT)
        })

        return {
            mode,
            formData,
            pageData,
            userAuth,
            confirmBackUp,
            backUp,
            toggleAllChl,
            isChlAll,
            displayIndex,
            displayDateTime,
            displayEvent,
            search,
            tableRef,
            tableData,
            playRec,
            displayEventIcon,
            handleRecClick,
            filterTableData,
            handleRecChange,
            showPosInfo,

            baseEventSelectorRef,
            openEventSelector,
            eventsStr,
            enablePos,
        }
    },
})
