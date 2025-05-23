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
import PlaybackEventSelector from '../playback/PlaybackEventSelector.vue'
import { EVENT_TYPE_NAME_MAPPING } from '@/utils/const/record'

export default defineComponent({
    components: {
        BackupPop,
        BackupLocalPop,
        BackupPosInfoPop,
        PlaybackEventSelector,
    },
    setup() {
        const { Translate } = useLangStore()
        const router = useRouter()
        const tableRef = ref<TableInstance>()

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
            allEventList: [] as string[],
            // 目标选项
            targetOptions: [
                // 人
                {
                    label: Translate('IDCS_DETECTION_PERSON'),
                    value: 'smdPerson',
                },
                // 车
                {
                    label: Translate('IDCS_DETECTION_VEHICLE'),
                    value: 'smdCar',
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
        })

        // 最大通道数
        const maxChl = computed(() => {
            return Math.min(pageData.value.chlList.length, pageData.value.maxChl)
        })

        // 表格数据
        const tableData = ref<PlaybackRecLogList[]>([])

        const eventTableData = computed(() => {
            return tableData.value.filter((item) => {
                if (!formData.value.target.length || formData.value.target.length === pageData.value.targetOptions.length) {
                    return true
                }

                if (item.event === 'smdPerson' && formData.value.target.includes('smdPerson')) {
                    return true
                }

                if (item.event === 'smdCar' && formData.value.target.includes('smdCar')) {
                    return true
                }

                if (!['smdPerson', 'smdCar'].includes(item.event) && formData.value.target.includes('None')) {
                    return true
                }

                return false
            })
        })

        // 当前页的表格数据
        const filterTableData = computed(() => {
            return eventTableData.value.slice((pageData.value.currentPage - 1) * pageData.value.pageSize, pageData.value.currentPage * pageData.value.pageSize)
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
            events: [] as string[],
            target: ['smdPerson', 'smdCar', 'None'],
        })

        // 通道全选
        const isChlAll = computed(() => {
            return !!formData.value.chls.length && formData.value.chls.length >= maxChl.value
        })

        const changeTarget = () => {
            pageData.value.currentPage = 1
        }

        /**
         * @description 序号显示
         * @param {Number} index
         * @returns {Number}
         */
        const displayIndex = (index: number) => {
            return pageData.value.pageSize * (pageData.value.currentPage - 1) + index + 1
        }

        /**
         * @description 显示事件文本
         * @param {Object} row
         * @returns {String}
         */
        const displayEvent = (row: PlaybackRecLogList) => {
            return Translate(EVENT_TYPE_NAME_MAPPING[row.event])
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

            tableData.value = []
            pageData.value.currentPage = 1
            formData.value.target = ['smdPerson', 'smdCar', 'None']

            const events = !formData.value.events.length ? pageData.value.allEventList : formData.value.events

            for (const chl of formData.value.chls) {
                const sendXml = rawXml`
                    <condition>
                        <startTime>${formatGregoryDate(startTime, DEFAULT_DATE_FORMAT)}</startTime>
                        <endTime>${formatGregoryDate(endTime, DEFAULT_DATE_FORMAT)}</endTime>
                        <recTypes type='list'>
                            ${events
                                .map((item) => {
                                    if (item === 'motion') {
                                        return rawXml`
                                            <item>motion</item>
                                            <item>smdPerson</item>
                                            <item>smdCar</item>
                                        `
                                    } else {
                                        return `<item>${item}</item>`
                                    }
                                })
                                .join('')}
                        </recTypes>
                        ${events.includes('pos') ? `<keyword>${formData.value.pos}</keyword>` : ''}
                        <chl id="${chl}" />
                    </condition>
                `
                const result = await queryRecLog(sendXml)
                const $ = queryXml(result)

                const chlId = $('content/chl').attr('id')
                const chlName = $('content/chl').text()

                $('content/recList/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const startTime = $item('startTime').text().num() * 1000
                    const endTime = $item('endTime').text().num() * 1000
                    const recType = $item('recType').text()
                    const size = $item('size').text()

                    if (!['human', 'vehicle', 'nonMotorizedVehicle'].includes(recType)) {
                        tableData.value.push({
                            chlId: chlId,
                            chlName: chlName,
                            startTime: startTime, // 开始时间戳（UTC）
                            endTime: endTime, // 结束时间戳（UTC）
                            event: recType,
                            recSubType: recType,
                            size: size ? size + 'MB' : '--',
                            duration: dayjs.utc(endTime - startTime).format('HH:mm:ss'),
                            timeZone: '',
                        })
                    }
                })
            }

            closeLoading()

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

        // 是否支持POS
        const enablePos = computed(() => {
            const events = formData.value.events.map((item) => {
                return item
            })
            return !events.length || events.includes('POS')
        })

        const getRecTypeList = (events: string[]) => {
            pageData.value.allEventList = events
        }

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
            handleRecClick,
            eventTableData,
            filterTableData,
            handleRecChange,
            showPosInfo,
            enablePos,
            getRecTypeList,
            changeTarget,
        }
    },
})
