/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-01 11:01:12
 * @Description: 查看日志
 */
import dayjs from 'dayjs'
import ViewLogDetailPop from './ViewLogDetailPop.vue'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    components: {
        ViewLogDetailPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const lang = useLangStore()
        const dateTime = useDateTimeStore()

        // 类型和语言资源映射
        const TRANS_MAPPING: Record<string, string> = {
            LOG_ALL: Translate('IDCS_ALL_TYPE'),
            LOG_ALARM_ALL: Translate('IDCS_ALARM_LOG'),
            LOG_ALARM_MOTION: Translate('IDCS_MOTION_DETECT_ALARM'),
            LOG_ALARM_SENSOR: Translate('IDCS_SENSOR_ALARM'),
            LOG_ALARM_ALARMOUTPUT: Translate('IDCS_ALARM_OUT'),
            LOG_ALARM_OSC: Translate('IDCS_OSC_ALARM'),
            LOG_ALARM_AVD: Translate('IDCS_AVD_ALARM'),
            LOG_ALARM_PEA_TRIPWIRE: Translate('IDCS_TRIPWIRE_ALARM'),
            LOG_ALARM_PEA_PERIMETER: Translate('IDCS_INTELLIGENT_ALARM_LOG').formatForLang(Translate('IDCS_INVADE_DETECTION')),
            LOG_ALARM_SMART_AOI_ENTRY: Translate('IDCS_AOI_ENTRY_ALARM'),
            LOG_ALARM_SMART_AOI_LEAVE: Translate('IDCS_AOI_LEAVE_ALARM'),
            LOG_ALARM_VFD: Translate('IDCS_VFD_ALARM'),
            LOG_ALARM_CDD: Translate('IDCS_CDD_ALARM'),
            LOG_ALARM_LOITERING: Translate('IDCS_LOITERING_ALARM'),
            LOG_ALARM_PVD: Translate('IDCS_INTELLIGENT_ALARM_LOG').formatForLang(Translate('IDCS_PARKING_DETECTION')),
            LOG_ALARM_FIRE_POINT: Translate('IDCS_FIRE_POINT_ALARM'),
            LOG_ALARM_TEMPERATURE: Translate('IDCS_TEMPERATURE_ALARM'),
            LOG_ALARM_PASSLINE_COUNT: Translate('IDCS_INTELLIGENT_ALARM_LOG').formatForLang(Translate('IDCS_PASS_LINE_COUNT_DETECTION')),
            LOG_ALARM_COMBINED: Translate('IDCS_COMBINATION_ALARM'),
            LOG_OPERATE_ALL: Translate('IDCS_OPERATION_LOG'),
            LOG_OPERATE_RECORD_SPB: Translate('IDCS_SEARCH') + '/' + Translate('IDCS_REPLAY') + '/' + Translate('IDCS_BACKUP') + (systemCaps.supportRecDelete ? '/' + Translate('IDCS_DELETE') : ''),
            LOG_OPERATE_MANUAL_RECORD: Translate('IDCS_MANUAL_RECORD'),
            LOG_OPERATE_MANUAL_ALARM: Translate('IDCS_MANUAL_ALARM'),
            LOG_OPERATE_SYSTEM_MAINTENANCE: Translate('IDCS_SYSTEM_MAINTENANCE'),
            LOG_OPERATE_PTZ_CONTROL: Translate('IDCS_PTZ_CONTROL'),
            LOG_OPERATE_AUDIO_TALK: Translate('IDCS_AUDIO_TALK'),
            LOG_OPERATE_SYSTEM_SCR: Translate('IDCS_OPERATE_SYSTEM_SCR'),
            LOG_OPERATE_LOGIN_LOGOUT: Translate('IDCS_OPERATE_LOGIN_LOGOUT'),
            LOG_OPERATE_SNAPSHOT_MSPB: Translate('IDCS_OPERATE_SNAPSHOT_MSPB'),
            LOG_OPERATE_FORMAT_HD: Translate('IDCS_OPERATE_FORMAT_HD'),
            LOG_OPERATE_ACCESS_CONTROL: Translate('IDCS_ACCESS_CONTROL_CONFIG'),
            LOG_OPERATE_PARKINGLOT_CONFIG: Translate('IDCS_PARKING_LOT_CONFIG'),
            LOG_CONFIG_ALL: Translate('IDCS_CONFIG_LOG'),
            LOG_OPERATE_CHANNEL: Translate('IDCS_CHANNEL_PARAMS'),
            LOG_OPERATE_RECORD: Translate('IDCS_RECORD_PARAMS'),
            LOG_OPERATE_ALARM: Translate('IDCS_ALARM_PARAMS'),
            LOG_OPERATE_DISK: Translate('IDCS_DISK_PARAMS'),
            LOG_OPERATE_NETWORK: Translate('IDCS_NETWORK_PARAMS'),
            LOG_OPERATE_SCHEDULE: Translate('IDCS_SCHEDULA_PARAMS'),
            LOG_OPERATE_USER: Translate('IDCS_USER_PARAMS'),
            LOG_OPERATE_BASIC: Translate('IDCS_BASIC_PARAMS'),
            LOG_OPERATE_HOT_STANDBY: Translate('IDCS_HOT_STANDBY_CONFIG'),
            LOG_EXCEPTION_ALL: Translate('IDCS_EXCEPTION_LOG'),
            LOG_EXCEPTION_UNLAWFUL_ACCESS: Translate('IDCS_UNLAWFUL_ACCESS'),
            LOG_EXCEPTION_DISK_FULL: Translate('IDCS_DISK_FULL'),
            LOG_EXCEPTION_DISK_IO_ERROR: Translate('IDCS_DISK_IO_ERROR'),
            LOG_EXCEPTION_NO_DISK: Translate('IDCS_NO_DISK'),
            LOG_EXCEPTION_IP_COLLISION: Translate('IDCS_IP_CONFLICT'),
            LOG_EXCEPTION_ABNORMAL_RAID_SUBHEALTH: Translate('IDCS_RAID_SUBHEALTH'),
            LOG_EXCEPTION_ABNORMAL_RAID_UNAVAILABLE: Translate('IDCS_RAID_UNAVAILABLE'),
            LOG_EXCEPTION_INTERNET_DISCONNECT: Translate('IDCS_NETWORK_DISCONNECT'),
            LOG_EXCEPTION_IPC_DISCONNECT: Translate('IDCS_DEVICE_OFFLINE'),
            LOG_EXCEPTION_ABNORMAL_SHUTDOWN: Translate('IDCS_SYSTEM_ABNORMAL_SHUTDOWN'),
            LOG_EXCEPTION_VIDEO_LOSS: Translate('IDCS_VIDEO_LOSS'),
            LOG_EXCEPTION_SIGNAL_SHELTER: Translate('IDCS_SIGNAL_SHELTER'),
            LOG_EXCEPTION_HOT_STANDBY: Translate('IDCS_HOT_STANDBY_EXCEP'),
            LOG_INFOR_ALL: Translate('IDCS_INFORMATION_LOG'),
            LOG_INFOR_DISK: Translate('IDCS_DISK_INFOR'),
            LOG_INFOR_SYSTEM_RUN: Translate('IDCS_SYSTEM_RUNNINGINFOR'),
            LOG_INFORMATION_HOT_STANDBY: Translate('IDCS_HOT_STANDBY_INFO'),
            LOG_EXCEPTION_HDD_PULL_OUT: Translate('IDCS_HDD_PULL_OUT'),
            LOG_EXCEPTION_DISK_FAILURE: Translate('IDCS_DISK_FAILURE'),
            LOG_OPERATE_HDD_INSERT: Translate('IDCS_OPERATE_HDD_INSERT'),
            LOG_OPERATE_FEATURELIBRARY: Translate('IDCS_FEATURE_LIBRARY'),
            LOG_EXCEPTION_NAT_TRAVERSAL_ABNORMAL: Translate('IDCS_NAT_TRAVESAL_ABNORMAL'),
            LOG_EXCEPTION_DISCARD_EXTRACT_TASK: Translate('IDCS_DISCARD_EXTRACT_TASK'),
            LOG_ALARM_FACE_MATCH: Translate('IDCS_FACE_MATCH_ALARM'),
            LOG_ALARM_VEHICLE_PLATE_MATCH: Translate('IDCS_PLATE_MATCH_ALARM'),
            LOG_EXCEPTION_ALARM_SERVER_OFFLINE: Translate('IDCS_ALARM_SERVER_OFFLINE'),
            LOG_ALARM_RTC: Translate('IDCS_RTC_ABNORMAL'),
            LOG_OPERATE_PLATELIBRARY: Translate('IDCS_VEHICLE_DATABASE'), //车牌库
            LOG_EXCEPTION_UPGRADE_ERROR: Translate('IDCS_CLOUD_UPGRADE_FAIED'),
            LOG_OPERATE_NAT_INFO: Translate('IDCS_NAT'),
            LOG_OPERATE_INTELLIGENT_ANALYSIS_INFO: Translate('IDCS_BUSINESS_APPLICATION'), // 业务应用
            LOG_EXCEPTION_ABNORMAL_RAID_HOT_EXCEPTION: Translate('IDCS_RAID_HOT_EXCEPTION'),
            LOG_INFORMATION_NAT: Translate('IDCS_NAT'),
        }

        // 主类型对应子类型列表
        const LOG_TYPE_MAPPING: Record<string, string[]> = {
            LOG_ALARM_ALL: [
                'LOG_ALARM_MOTION',
                'LOG_ALARM_SENSOR',
                'LOG_ALARM_OSC',
                'LOG_ALARM_AVD',
                'LOG_ALARM_PEA_TRIPWIRE',
                'LOG_ALARM_PEA_PERIMETER',
                'LOG_ALARM_SMART_AOI_ENTRY',
                'LOG_ALARM_SMART_AOI_LEAVE',
                'LOG_ALARM_VFD',
                'LOG_ALARM_CDD',
                'LOG_ALARM_LOITERING',
                'LOG_ALARM_PVD',
                'LOG_ALARM_FIRE_POINT',
                'LOG_ALARM_TEMPERATURE',
                'LOG_ALARM_PASSLINE_COUNT',
                'LOG_ALARM_FACE_MATCH',
                'LOG_ALARM_VEHICLE_PLATE_MATCH',
                'LOG_ALARM_ALARMOUTPUT',
                'LOG_ALARM_COMBINED',
                'LOG_ALARM_RTC',
            ],
            LOG_OPERATE_ALL: [
                'LOG_OPERATE_RECORD_SPB',
                'LOG_OPERATE_MANUAL_RECORD',
                'LOG_OPERATE_MANUAL_ALARM',
                'LOG_OPERATE_SYSTEM_MAINTENANCE',
                'LOG_OPERATE_PTZ_CONTROL',
                'LOG_OPERATE_AUDIO_TALK',
                'LOG_OPERATE_SYSTEM_SCR',
                'LOG_OPERATE_LOGIN_LOGOUT',
                'LOG_OPERATE_SNAPSHOT_MSPB',
                'LOG_OPERATE_FORMAT_HD',
                'LOG_OPERATE_HDD_INSERT',
                'LOG_OPERATE_PLATELIBRARY',
                'LOG_OPERATE_FEATURELIBRARY',
                'LOG_OPERATE_PARKINGLOT_CONFIG',
                'LOG_OPERATE_ACCESS_CONTROL',
                'LOG_OPERATE_CHANNEL',
                'LOG_OPERATE_RECORD',
                'LOG_OPERATE_ALARM',
                'LOG_OPERATE_DISK',
                'LOG_OPERATE_NETWORK',
                'LOG_OPERATE_SCHEDULE',
                'LOG_OPERATE_USER',
                'LOG_OPERATE_BASIC',
                'LOG_OPERATE_HOT_STANDBY',
            ],
            LOG_INFOR_ALL: ['LOG_INFORMATION_NAT', 'LOG_INFORMATION_HOT_STANDBY'],
            LOG_EXCEPTION_ALL: [
                'LOG_EXCEPTION_UNLAWFUL_ACCESS',
                'LOG_EXCEPTION_DISK_FULL',
                'LOG_EXCEPTION_DISK_IO_ERROR',
                'LOG_EXCEPTION_NO_DISK',
                'LOG_EXCEPTION_ABNORMAL_RAID_SUBHEALTH',
                'LOG_EXCEPTION_ABNORMAL_RAID_UNAVAILABLE',
                'LOG_EXCEPTION_ABNORMAL_RAID_HOT_EXCEPTION',
                'LOG_EXCEPTION_IP_COLLISION',
                'LOG_EXCEPTION_INTERNET_DISCONNECT',
                'LOG_EXCEPTION_IPC_DISCONNECT',
                'LOG_EXCEPTION_ABNORMAL_SHUTDOWN',
                'LOG_EXCEPTION_VIDEO_LOSS',
                'LOG_EXCEPTION_HDD_PULL_OUT',
                'LOG_EXCEPTION_DISK_FAILURE',
                'LOG_EXCEPTION_NAT_TRAVERSAL_ABNORMAL',
                'LOG_EXCEPTION_ALARM_SERVER_OFFLINE',
                'LOG_EXCEPTION_UPGRADE_ERROR',
                'LOG_EXCEPTION_HOT_STANDBY',
            ],
        }

        // 子类型和主类型映射
        const SUB_MAIN_TYPE_MAPPING: Record<string, string> = Object.fromEntries(
            Object.keys(LOG_TYPE_MAPPING)
                .map((key) => LOG_TYPE_MAPPING[key].map((item) => [item, key]))
                .flat(),
        )

        // 有录像回放的日志子类型
        const REC_LOG_TYPES: string[] = [
            'LOG_ALARM_MOTION',
            'LOG_ALARM_SENSOR',
            'LOG_OPERATE_MANUAL_RECORD',
            'LOG_ALARM_OSC',
            'LOG_ALARM_AVD',
            'LOG_ALARM_PEA_TRIPWIRE',
            'LOG_ALARM_PEA_PERIMETER',
            'LOG_ALARM_SMART_AOI_ENTRY',
            'LOG_ALARM_SMART_AOI_LEAVE',
            'LOG_ALARM_VFD',
            'LOG_ALARM_CDD',
            'LOG_ALARM_LOITERING',
            'LOG_ALARM_PVD',
            'LOG_ALARM_FIRE_POINT',
            'IDCS_TEMPERATURE_ALARM',
            'LOG_ALARM_COMBINED',
        ]

        const LOG_ENUMS = [
            'LOG_ALL',
            'LOG_ALARM_ALL',
            'LOG_ALARM_MOTION',
            'LOG_ALARM_SENSOR',
            'LOG_ALARM_FACE_MATCH',
            'LOG_ALARM_VEHICLE_PLATE_MATCH',
            'LOG_ALARM_ALARMOUTPUT',
            'LOG_ALARM_OSC',
            'LOG_ALARM_AVD',
            'LOG_ALARM_PEA_TRIPWIRE',
            'LOG_ALARM_PEA_PERIMETER',
            'LOG_ALARM_SMART_AOI_ENTRY',
            'LOG_ALARM_SMART_AOI_LEAVE',
            'LOG_ALARM_VFD',
            'LOG_ALARM_CDD',
            'LOG_ALARM_LOITERING',
            'LOG_ALARM_PVD',
            'LOG_ALARM_FIRE_POINT',
            'LOG_ALARM_TEMPERATURE',
            'LOG_ALARM_PASSLINE_COUNT',
            'LOG_ALARM_COMBINED',
            'LOG_ALARM_RTC',
            'LOG_OPERATE_ALL',
            'LOG_OPERATE_RECORD_SPB',
            'LOG_OPERATE_MANUAL_RECORD',
            'LOG_OPERATE_MANUAL_ALARM',
            'LOG_OPERATE_SYSTEM_MAINTENANCE',
            'LOG_OPERATE_PTZ_CONTROL',
            'LOG_OPERATE_AUDIO_TALK',
            'LOG_OPERATE_SYSTEM_SCR',
            'LOG_OPERATE_LOGIN_LOGOUT',
            'LOG_OPERATE_SNAPSHOT_MSPB',
            'LOG_OPERATE_FORMAT_HD',
            'LOG_OPERATE_FEATURELIBRARY',
            'LOG_OPERATE_PLATELIBRARY',
            'LOG_OPERATE_CHANNEL',
            'LOG_OPERATE_RECORD',
            'LOG_OPERATE_ALARM',
            'LOG_OPERATE_DISK',
            'LOG_OPERATE_NETWORK',
            'LOG_OPERATE_SCHEDULE',
            'LOG_OPERATE_USER',
            'LOG_OPERATE_BASIC',
            'LOG_OPERATE_ACCESS_CONTROL',
            'LOG_OPERATE_PARKINGLOT_CONFIG',
            'LOG_OPERATE_RECORD',
            'LOG_OPERATE_HOT_STANDBY',
            'LOG_EXCEPTION_ALL',
            'LOG_EXCEPTION_UNLAWFUL_ACCESS',
            'LOG_EXCEPTION_DISK_FULL',
            'LOG_EXCEPTION_DISK_IO_ERROR',
            'LOG_EXCEPTION_IP_COLLISION',
            'LOG_EXCEPTION_INTERNET_DISCONNECT',
            'LOG_EXCEPTION_IPC_DISCONNECT',
            'LOG_EXCEPTION_ABNORMAL_SHUTDOWN',
            'LOG_EXCEPTION_NO_DISK',
            'LOG_EXCEPTION_HDD_PULL_OUT',
            'LOG_EXCEPTION_DISK_FAILURE',
            'LOG_EXCEPTION_ABNORMAL_RAID_SUBHEALTH',
            'LOG_EXCEPTION_ABNORMAL_RAID_UNAVAILABLE',
            'LOG_EXCEPTION_VIDEO_LOSS',
            'LOG_EXCEPTION_ABNORMAL_RAID_HOT_EXCEPTION',
            'LOG_EXCEPTION_NAT_TRAVERSAL_ABNORMAL',
            'LOG_EXCEPTION_ALARM_SERVER_OFFLINE',
            'LOG_EXCEPTION_SIGNAL_SHELTER',
            'LOG_EXCEPTION_DISCARD_EXTRACT_TASK',
            'LOG_EXCEPTION_UPGRADE_ERROR',
            'LOG_EXCEPTION_HOT_STANDBY',
            'LOG_INFOR_ALL',
            'LOG_INFOR_SCHEDULE_RECORD',
            'LOG_INFOR_SCHEDULE_SNAP',
            'LOG_INFOR_DISK',
            'LOG_INFOR_NETWORK',
            'LOG_INFOR_SYSTEM_BASE',
            'LOG_INFOR_SYSTEM_RUN',
            'LOG_INFOR_CHANNEL_STATE',
            'LOG_INFOR_ALARM_STATE',
            'LOG_INFOR_RECORD_STATE',
            'LOG_INFORMATION_NAT',
            'LOG_INFORMATION_HOT_STANDBY',
        ]

        //提前播放的时间
        const preStartTime = 10 * 1000
        // 回放视频长度
        const recDuration = 5 * 60 * 1000
        // 导出的最大条数
        const exportMaxCount = 2000

        const formData = ref(new SystemLogForm())

        const tableList = ref<SystemLogList[]>([])

        const tableRef = ref<TableInstance>()

        const pageData = ref({
            // 日志主类型选项
            typeOptions: ['LOG_ALL'].concat(Object.keys(LOG_TYPE_MAPPING)).map((item) => {
                return {
                    label: TRANS_MAPPING[item],
                    value: item,
                }
            }),
            // 当前的日志总条数
            totalCount: 0,
            // 页面中的开始时间，校验无误再写进formData
            startTime: '',
            // 页面中的结束事件，校验无误再写进formData
            endTime: '',
            // 是否更新页码
            isUpadtePagination: false,
            // 选中的表格行
            activeTableIndex: -1,
            // 是否打开详情弹窗
            isDetail: false,
            // 是否打开回放弹窗
            isRecord: false,
            recordPlayList: [] as PlaybackPopList[],
        })

        // 日志子类型选项
        const subTypeOptions = computed(() => {
            if (formData.value.type === 'LOG_ALL') {
                return Object.values(LOG_TYPE_MAPPING)
                    .flat()
                    .map((item) => {
                        return {
                            name: TRANS_MAPPING[item],
                            value: item,
                        }
                    })
            }
            if (!LOG_TYPE_MAPPING[formData.value.type]) return []
            return LOG_TYPE_MAPPING[formData.value.type].map((item) => ({
                name: TRANS_MAPPING[item],
                value: item,
            }))
        })

        /**
         * @description 过滤不支持的日志子类型
         * @param {string} type 子类型
         */
        const filterLogType = (type: string) => {
            const mainType = SUB_MAIN_TYPE_MAPPING[type]
            const index = LOG_TYPE_MAPPING[mainType].indexOf(type)
            if (index > -1) {
                LOG_TYPE_MAPPING[mainType].splice(index, 1)
            }
        }

        /**
         * @description 切换主类型后，刷新数据
         */
        const changeMainType = (type: string) => {
            formData.value.type = type
            formData.value.subType = []
            search()
        }

        /**
         * @description 切换子类型后，刷新数据
         */
        const changeSubType = () => {
            search()
        }

        /**
         * @description 获取时间格式化配置
         */
        const getTimeConfig = () => {
            formData.value.startTime = dayjs(new Date().setHours(-48, 0, 0, 0))
                .calendar('gregory')
                .format(DEFAULT_DATE_FORMAT)
            formData.value.endTime = dayjs(new Date().setHours(23, 59, 59, 0))
                .calendar('gregory')
                .format(DEFAULT_DATE_FORMAT)

            pageData.value.startTime = formData.value.startTime
            pageData.value.endTime = formData.value.endTime
        }

        /**
         * @description 生成请求参数
         * @param {boolean} isExport 是否导出
         */
        const getQueryXML = (isExport = false) => {
            const mainType = `<item>${wrapCDATA(formData.value.type)}</item>`
            const subType = formData.value.subType.map((item) => `<item>${wrapCDATA(item)}</item>`).join('')
            const sendXML = rawXml`
                ${!isExport ? `<pageIndex>${formData.value.currentPage}</pageIndex>` : ''}
                ${!isExport ? `<pageSize>${formData.value.pageSize}</pageSize>` : ''}
                <types>
                    <logType>${wrapEnums(LOG_ENUMS)}</logType>
                </types>
                <condition>
                    <logType type="list">
                        <itemType type="logType" />
                        ${formData.value.subType.length ? subType : mainType}
                    </logType>
                    <startTime>${wrapCDATA(localToUtc(formData.value.startTime))}</startTime>
                    <endTime>${wrapCDATA(localToUtc(formData.value.endTime))}</endTime>
                    <langId>${wrapCDATA(lang.langId)}</langId>
                    ${isExport ? `<exportMaxCount>${exportMaxCount}</exportMaxCount>` : ''}
                </condition>
            `
            return sendXML
        }

        /**
         * @description 获取表格数据
         */
        const getData = async () => {
            openLoading()

            // 不是翻页时，才根据新的起始时间查询，确保不发生查询之后又修改起始时间导致的翻页问题和导出与查询结果不一致的问题
            if (!pageData.value.isUpadtePagination) {
                formData.value.startTime = pageData.value.startTime
                formData.value.endTime = pageData.value.endTime
            }

            const result = await queryLog(getQueryXML(false))
            closeLoading()

            commLoadResponseHandler(result, ($) => {
                pageData.value.totalCount = $('content').attr('total').num()

                tableList.value = $('content/item').map((item, index) => {
                    const $item = queryXml(item.element)
                    const clientType = $item('clientType').text()
                    const logType = $item('logType').text()
                    return {
                        index: formData.value.pageSize * (formData.value.currentPage - 1) + (index + 1),
                        logType,
                        clientType,
                        time: $item('time').text(),
                        userName: $item('userName').text(),
                        subType: clientType + (TRANS_MAPPING[logType] ? Translate(TRANS_MAPPING[logType]) : ''),
                        mainType: SUB_MAIN_TYPE_MAPPING[logType] ? Translate(TRANS_MAPPING[SUB_MAIN_TYPE_MAPPING[logType]]) : '',
                        content: $item('content').text(),
                        chl: {
                            id: $item('chl').attr('id'),
                            text: $item('chl').text(),
                        },
                        triggerRecChls: $('triggerRecChls/item').map((chl) => {
                            return {
                                id: chl.attr('id'),
                                text: chl.text(),
                            }
                        }),
                        detailsExtra: $item('detailsExtra').text(),
                        combFaceID: $item('combFaceID').text(),
                        combTime: $item('combTime').text(),
                        combFaceName: $item('combFaceName').text(),
                        combChl: $item('combChl').text(),
                    }
                })
                if (pageData.value.activeTableIndex > tableList.value.length - 1) {
                    pageData.value.activeTableIndex = tableList.value.length - 1
                }
            })
        }

        const displayTime = (time: string) => {
            return utcToLocal(time, dateTime.dateTimeFormat)
        }

        /**
         * @description 搜索
         */
        const search = () => {
            formData.value.currentPage = 1
            pageData.value.isUpadtePagination = false
            getData()
        }

        /**
         * @description 改变页码，刷新数据
         */
        const changePagination = () => {
            pageData.value.isUpadtePagination = true
            getData()
        }

        /**
         * @description 改变每页显示条数，刷新数据
         */
        const changePaginationSize = () => {
            pageData.value.isUpadtePagination = true

            const totalPage = Math.ceil(pageData.value.totalCount / formData.value.pageSize)
            if (formData.value.currentPage > totalPage) {
                formData.value.currentPage = totalPage
            }
            getData()
        }

        /**
         * @description 校验开始时间合法后，刷新数据
         * @param {string} value
         */
        const changeStartTime = (value: string) => {
            if (dayjs(value, DEFAULT_DATE_FORMAT).isAfter(dayjs(pageData.value.endTime, DEFAULT_DATE_FORMAT))) {
                openMessageBox(Translate('IDCS_END_TIME_GREATER_THAN_START'))
                pageData.value.startTime = formData.value.startTime
                return
            }
            formData.value.startTime = value
            search()
        }

        /**
         * @description 校验结束时间合法后，刷新数据
         * @param {string} value
         */
        const changeEndTime = (value: string) => {
            if (dayjs(value, DEFAULT_DATE_FORMAT).isBefore(dayjs(pageData.value.startTime, DEFAULT_DATE_FORMAT))) {
                openMessageBox(Translate('IDCS_END_TIME_GREATER_THAN_START'))
                pageData.value.endTime = formData.value.endTime
                return
            }
            formData.value.endTime = value
            search()
        }

        /**
         * @description 导出数据
         */
        const handleExport = async () => {
            // 从导出逻辑上看，此处导出是用浏览器原生实现，与插件无关，不明白为何插件未安装或不可用时禁止导出
            // if (!Plugin.IsSupportH5() && !Plugin.IsInstallPlugin()) {
            //     openMessageBox(Plugin.pluginNoticeHtml.value)
            //     return
            // }
            // if (!Plugin.IsSupportH5() && !Plugin.IsPluginAvailable()) {
            //     pluginStore.showPluginNoResponse = true
            //     Plugin.ShowPluginNoResponse()
            //     return
            // }
            const sendXML = getQueryXML(true)
            try {
                const result = await exportLog(sendXML)
                const $ = queryXml(result)
                const content = $('content').text()

                download(new Blob([content]), 'log_' + dayjs(new Date()).format('YYYYMMDDHHmmss') + '.txt')
                closeLoading()

                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_EXPORT_SUCCESS') + `(${Translate('IDCS_EXPORT_LOG_OVER_LIMIT_TIP')})`,
                })
            } catch (e) {
                openMessageBox(Translate('IDCS_EXPORT_FAIL'))
            }
        }

        /**
         * @description 打开日志详情弹窗
         * @param {number} index
         */
        const showLogDetail = (index: number) => {
            pageData.value.isDetail = true
            pageData.value.activeTableIndex = index
            // pageData.value.detailIndex = formData.value.currentPage * formData.value.pageSize
        }

        /**
         * @description 切换日志详情选中
         * @param index
         */
        const changeLogDetail = (index: number) => {
            pageData.value.activeTableIndex = index
            tableRef.value!.setCurrentRow(tableList.value[index])
        }

        /**
         * @description 关闭日志详情弹窗
         */
        const closeLogDetail = () => {
            pageData.value.isDetail = false
        }

        /**
         * @description 打开回放
         */
        const playRec = (row: SystemLogList) => {
            const eventList = ['MOTION', 'SCHEDULE', 'SENSOR', 'MANUAL', 'INTELLIGENT']
            const time = row.time

            const startTime = dayjs(time, DEFAULT_DATE_FORMAT).subtract(preStartTime, 'millisecond').valueOf()
            const endTime = dayjs(time, DEFAULT_DATE_FORMAT).add(recDuration, 'millisecond').subtract(preStartTime, 'millisecond').valueOf()

            let playList: PlaybackPopList[] = []
            if (row.logType === 'LOG_ALARM_SENSOR' || row.logType === 'LOG_ALARM_COMBINATION') {
                playList = row.triggerRecChls
                    .filter((item) => item.id !== DEFAULT_EMPTY_ID)
                    .map((item) => ({
                        chlId: item.id,
                        chlName: item.text,
                        eventList,
                        startTime,
                        endTime,
                    }))
            } else {
                if (row.chl.id !== DEFAULT_EMPTY_ID) {
                    playList.push({
                        chlId: row.chl.id,
                        chlName: row.chl.text,
                        eventList,
                        startTime,
                        endTime,
                    })
                }
            }

            if (!playList.length) {
                openMessageBox(Translate('IDCS_CHANNEL_NOTEXIST'))
                return
            }

            pageData.value.recordPlayList = playList
            pageData.value.isRecord = true
        }

        /**
         * @description 选中改行
         * @param {SystemLogList} row
         */
        const handleChangeRow = (row: SystemLogList) => {
            pageData.value.activeTableIndex = tableList.value.findIndex((item) => row.index === item.index)!
        }

        /**
         * @description 判断是否显示播放按钮
         */
        const displayPlayIcon = (row: SystemLogList) => {
            if (REC_LOG_TYPES.includes(row.logType)) {
                return true
            }

            if (row.triggerRecChls.length) {
                return true
            }
            return false
        }

        onMounted(() => {
            getTimeConfig()

            if (!systemCaps.supportFaceMatch) {
                filterLogType('LOG_ALARM_FACE_MATCH')
                filterLogType('LOG_OPERATE_FEATURELIBRARY')
            }

            if (!systemCaps.supportPlateMatch) {
                filterLogType('LOG_ALARM_VEHICLE_PLATE_MATCH')
                filterLogType('LOG_OPERATE_PLATELIBRARY')
            }

            if (!systemCaps.supportAlarmServerConfig) {
                filterLogType('LOG_EXCEPTION_ALARM_SERVER_OFFLINE')
            }

            if (systemCaps.ipChlMaxCount <= 0) {
                filterLogType('LOG_EXCEPTION_IPC_DISCONNECT')
                // filterLogType('LOG_EXCEPTION_VIDEO_LOSS')
            }

            if (systemCaps.analogChlCount <= 0) {
                filterLogType('LOG_EXCEPTION_VIDEO_LOSS')
            }

            // NTA1-616 SSR产品不支持硬盘健康检测功能，隐藏磁盘故障
            if (!systemCaps.supportHDHealth) {
                filterLogType('LOG_EXCEPTION_DISK_FAILURE')
            }

            // NTA1-4021 非RAID机型，隐藏【阵列降级】、【阵列不可用】、【热备异常】
            if (!systemCaps.supportRaid) {
                filterLogType('LOG_EXCEPTION_ABNORMAL_RAID_SUBHEALTH')
                filterLogType('LOG_EXCEPTION_ABNORMAL_RAID_UNAVAILABLE')
                filterLogType('LOG_EXCEPTION_ABNORMAL_RAID_HOT_EXCEPTION')
            }

            // 热备机隐藏AI的日志类型
            if (systemCaps.hotStandBy) {
                filterLogType('LOG_ALARM_MOTION')
                filterLogType('LOG_ALARM_OSC')
                filterLogType('LOG_ALARM_AVD')
                filterLogType('LOG_ALARM_PEA_TRIPWIRE')
                filterLogType('LOG_ALARM_PEA_PERIMETER')
                filterLogType('LOG_ALARM_SMART_AOI_ENTRY')
                filterLogType('LOG_ALARM_SMART_AOI_LEAVE')
                filterLogType('LOG_ALARM_VFD')
                filterLogType('LOG_ALARM_CDD')
                filterLogType('LOG_ALARM_LOITERING')
                filterLogType('LOG_ALARM_PVD')
                filterLogType('LOG_ALARM_FIRE_POINT')
                filterLogType('LOG_ALARM_TEMPERATURE')
                filterLogType('LOG_ALARM_PASSLINE_COUNT')
                filterLogType('LOG_ALARM_FACE_MATCH')
                filterLogType('LOG_ALARM_VEHICLE_PLATE_MATCH')
                filterLogType('LOG_OPERATE_PLATELIBRARY')
                filterLogType('LOG_OPERATE_FEATURELIBRARY')
                filterLogType('LOG_OPERATE_PARKINGLOT_CONFIG')
                filterLogType('LOG_OPERATE_ACCESS_CONTROL')
            }

            formData.value.type = 'LOG_ALL'
            search()
        })

        return {
            formData,
            tableRef,
            tableList,
            pageData,
            subTypeOptions,
            displayPlayIcon,
            changeMainType,
            changeSubType,
            search,
            changePagination,
            changePaginationSize,
            handleExport,
            changeStartTime,
            changeEndTime,
            playRec,
            showLogDetail,
            handleChangeRow,
            changeLogDetail,
            closeLogDetail,
            displayTime,
        }
    },
})
