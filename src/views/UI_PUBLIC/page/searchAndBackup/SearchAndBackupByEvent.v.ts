/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 13:48:22
 * @Description: 按事件搜索
 */
import dayjs from 'dayjs'
import { type PlaybackChlList, type PlaybackBackUpRecList, PlaybackRecLogList } from '@/types/apiType/playback'
import BackupPop from '../searchAndBackup/BackupPop.vue'
import BackupLocalPop from '../searchAndBackup/BackupLocalPop.vue'
import { type TableInstance } from 'element-plus'
import { type PlaybackPopList } from '@/components/player/BasePlaybackPop.vue'
import BackupPosInfoPop from './BackupPosInfoPop.vue'

export default defineComponent({
    components: {
        BackupPop,
        BackupLocalPop,
        BackupPosInfoPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
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

        const plugin = setupPlugin({
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
                    label: Translate('SMDVEHICLE'),
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
            // POS关键字
            posKeyword: '',
            // 回放列表
            playbackList: [] as PlaybackPopList[],
            // 最大通道数
            maxChl: 36,
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

        // 可显示的事件选项
        const filterEvents = computed(() => {
            return pageData.value.eventOptions.filter((item) => !item.hidden)
        })

        const formData = ref({
            // 开始时间
            startTime: '',
            // 结束时间
            endTime: '',
            // 选中的通道
            chls: [] as string[],
            // 选中的事件
            events: filterEvents.value.map((item) => item.value),
            // POS关键字
            pos: '',
            // 选中的目标
            targets: pageData.value.targetOptions.map((item) => item.value),
        })

        // 通道全选
        const isChlAll = computed(() => {
            return !!formData.value.chls.length && formData.value.chls.length >= maxChl.value
        })

        // 事件全选
        const isEventAll = computed(() => {
            return formData.value.events.length >= filterEvents.value.length
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
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_BACKUP_TASK_NUM_LIMIT').formatForLang(plugin.BackUpTask.limit),
                })
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
         * @description 事件全选或取消全选
         * @param {boolean} bool
         */
        const toggleAllEvent = (bool: string | number | boolean) => {
            if (bool === false) {
                formData.value.events = []
            } else {
                formData.value.events = filterEvents.value.map((item) => item.value)
            }
        }

        /**
         * @description 勾选事件或取消勾选
         * @param {String} value
         */
        const changeEvent = (value: string) => {
            const index = formData.value.events.indexOf(value)
            if (index === -1) {
                formData.value.events.push(value)
            } else {
                formData.value.events.splice(index, 1)
            }
        }

        /**
         * @description 搜索
         */
        const search = async () => {
            const startTime = dayjs(formData.value.startTime, dateTime.dateTimeFormat).valueOf()
            const endTime = dayjs(formData.value.endTime, dateTime.dateTimeFormat).valueOf()
            if (endTime <= startTime) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_END_TIME_GREATER_THAN_START'),
                })
                return
            }

            formData.value.pos = pageData.value.posKeyword

            openLoading()

            const chls = formData.value.chls.map((chl) => `<item id="${chl}"></item>`).join('')
            const events = formData.value.events
                .map((event) => {
                    if (!formData.value.targets.length || formData.value.targets.length >= pageData.value.targetOptions.length) {
                        if (event === 'MOTION') {
                            return ['MOTION', 'SMDHUMAN', 'SMDVEHICLE'].map((item) => `<item>${item}</item>`).join('')
                        } else {
                            return `<item>${event}</item>`
                        }
                    } else if (formData.value.targets.includes('NONE')) {
                        if (event === 'MOTION') {
                            return ['MOTION', ...formData.value.targets]
                                .filter((item) => item !== 'NONE')
                                .map((item) => `<item>${item}</item>`)
                                .join('')
                        } else {
                            return `<item>${event}</item>`
                        }
                    } else {
                        if (event === 'MOTION') {
                            return formData.value.targets.map((item) => `<item>${item}</item>`).join('')
                        } else {
                            return ''
                        }
                    }
                })
                .join('')

            tableData.value = []

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
                    <startTime>${formatDate(startTime, 'YYYY-MM-DD HH:mm:ss')}</startTime>
                    <endTime>${formatDate(endTime, 'YYYY-MM-DD HH:mm:ss')}</endTime>
                    <startTimeEx>${localToUtc(startTime)}</startTimeEx>
                    <endTimeEx>${localToUtc(endTime)}</endTimeEx>
                    <recType type='list'>
                        <itemType type='recType'/>
                        ${events}
                    </recType>
                    ${formData.value.events.includes('POS') ? `<keyword>${formData.value.pos}</keyword>` : ''}
                    ${formData.value.chls.length ? `<chl type='list'>${chls}</chl>` : ''}
                </condition>
            `
            const result = await queryChlRecLog(sendXml)
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
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_NO_RECORD_DATA'),
                })
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

        onMounted(() => {
            getChlsList()

            const date = new Date()
            formData.value.startTime = dayjs(date).hour(0).minute(0).second(0).format(dateTime.dateTimeFormat)
            formData.value.endTime = dayjs(date).hour(23).minute(59).second(59).format(dateTime.dateTimeFormat)
        })

        return {
            mode,
            formData,
            dateTime,
            pageData,
            userAuth,
            confirmBackUp,
            backUp,
            toggleAllChl,
            isChlAll,
            filterEvents,
            isEventAll,
            displayIndex,
            displayDateTime,
            displayEvent,
            toggleAllEvent,
            changeEvent,
            search,
            tableRef,
            tableData,
            playRec,
            displayEventIcon,
            handleRecClick,
            filterTableData,
            handleRecChange,
            showPosInfo,
        }
    },
})
