/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-28 11:45:28
 * @Description: 报警状态
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-14 17:41:18
 */
import { type XmlResult } from '@/utils/xmlParse'
import type { SystemAlarmStatusListData, SystemAlarmStatusList } from '@/types/apiType/system'
import dayjs from 'dayjs'
import type { TableInstance } from 'element-plus'
import { type PlaybackPopList } from '@/components/player/BasePlaybackPop.vue'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const systemCaps = useCababilityStore()
        // const userSession = useUserSessionStore()
        const dateTime = useDateTime()

        const NAME_MAPPING: Record<number, string> = {
            1: Translate('IDCS_WHITE_LIST') + '1',
            2: Translate('IDCS_WHITE_LIST') + '2',
            3: Translate('IDCS_BLACK_LIST'),
            9: Translate('IDCS_GROUP_STRANGER'),
        }

        const TARGET_TYPE_MAPPING: Record<number, string> = {
            1: Translate('IDCS_DETECTION_PERSON'),
            2: Translate('IDCS_DETECTION_VEHICLE'),
            3: Translate('IDCS_NON_VEHICLE'),
        }

        const ABNORMAL_TYPE_MAPPING: Record<string, string> = {
            ipConflict: 'IDCS_IP_CONFLICT',
            RAIDHotError: 'IDCS_RAID_HOT_EXCEPTION',
            diskRWError: 'IDCS_DISK_IO_ERROR',
            diskFull: 'IDCS_DISK_FULL',
            RAIDSubHealth: 'IDCS_RAID_SUBHEALTH',
            RAIDUnavailable: 'IDCS_RAID_UNAVAILABLE',
            illegalAccess: 'IDCS_UNLAWFUL_ACCESS',
            networkBreak: 'IDCS_NET_DISCONNECT',
            frontEndOffline: 'IDCS_FRONT_OFFLINE',
            noDisk: 'IDCS_NO_DISK',
            signalShelter: 'IDCS_SIGNAL_SHELTER',
            videoLoss: 'IDCS_VLOSS_ALARM',
            hddPullOut: 'IDCS_HDD_PULL_OUT',
            alarmServerOffline: 'IDCS_ALARM_SERVER_OFFLINE',
        }
        const INTELLIGENCE_TYPE_MAPPING: Record<string, string> = {
            osc: 'IDCS_WATCH_DETECTION',
            avd: 'IDCS_ABNORMAL_DETECTION',
            tripwire: 'IDCS_BEYOND_DETECTION',
            pea: 'IDCS_INVADE_DETECTION',
            vfd: 'IDCS_FACE_DETECTION',
            cdd: 'IDCS_CROWD_DENSITY_DETECTION',
            ipd: 'IDCS_PEOPLE_INSTRUSION_DETECTION',
            cpc: 'IDCS_PEOPLE_COUNT_DETECTION',
            temperatureAlarm: 'IDCS_TEMPERATURE_DETECTION',
            smartFirePoint: 'IDCS_FIRE_POINT_DETECTION',
        }

        const SWITCH_MAPPING: Record<string, string> = {
            true: Translate('IDCS_ON'),
            false: Translate('IDCS_OFF'),
        }

        const PLATE_LIBRARY_NAME: Record<string, string> = {}

        const tableList = ref<SystemAlarmStatusList[]>([])
        const tableRef = ref<TableInstance>()

        // 刷新时间间隔（毫秒）
        const refreshInterval = 30000
        // 视频提前时间（毫秒）
        const preTime = 10000
        // 回放视频长度（毫秒）
        const recDuration = 5 * 60 * 1000
        // 定时器，每隔一段时间自动刷新状态
        let getAlarmStatusTimer: NodeJS.Timeout | number = 0

        const pageData = ref({
            isInw48: false,
            activeIndex: -1,
            activeRow: [] as string[],
            // 是否打开回放弹窗
            isRecord: false,
            recordPlayList: [] as PlaybackPopList[],
        })

        /**
         * @description 获取基础配置信息
         */
        const getBasicCfg = async () => {
            const result = await queryBasicCfg(getXmlWrapData(''))
            const $ = queryXml(result)

            const CustomerID = $('/response/content/CustomerID').text()
            pageData.value.isInw48 = CustomerID === '100'
        }

        /**
         * @description 获取Face Feature Groups Name
         */
        const getFaceFeatureGroupsName = async () => {
            const result = await queryFacePersonnalInfoGroupList()
            const $ = queryXml(result)
            // const data: Record<number, string> = {}
            $('/response/content/item').forEach((item) => {
                const $item = queryXml(item.element)
                const groupId = Number($item('groupId').text())
                const name = $item('name').text()
                if ([1, 2, 3].includes(groupId) && name) {
                    NAME_MAPPING[groupId] = name
                    return
                }
                if (groupId !== 9) {
                    NAME_MAPPING[groupId] = name
                    return
                }
            })
        }

        /**
         * @description 查询车牌库
         */
        const getPlateLibrary = async () => {
            const result = await queryPlateLibrary()
            const $ = queryXml(result)

            if ($('/response/status').text() === 'success') {
                $('/response/content/group/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    PLATE_LIBRARY_NAME[item.attr('id')!] = $item('name').text()
                })
            }
        }

        /**
         * @description 初始化表格数据
         */
        const renderTable = () => {
            const rowData = [
                // 报警输入
                {
                    id: 'alarmIn',
                    type: Translate('IDCS_ALARM_IN'),
                    data: [],
                    index: 1,
                },
                // 报警输出
                {
                    id: 'alarmOut',
                    type: Translate('IDCS_ALARM_OUT'),
                    data: [],
                    index: 1,
                },
                // 移动侦测
                {
                    id: 'motion',
                    type: Translate('IDCS_MOTION_DETECTION'),
                    data: [],
                    index: 1,
                },
            ]
            if (systemCaps.ipChlMaxCount > 0 && !pageData.value.isInw48) {
                // 智能分析
                rowData.push({
                    id: 'intelligents',
                    type: Translate('IDCS_AI'),
                    data: [],
                    index: 1,
                })
            }
            rowData.push(
                // 异常报警
                {
                    id: 'abnormal',
                    type: Translate('IDCS_ABNORMAL_ALARM'),
                    data: [],
                    index: 1,
                },
                // 组合报警
                {
                    id: 'combinedAlarm',
                    type: Translate('IDCS_COMBINATION_ALARM'),
                    data: [],
                    index: 1,
                },
            )
            if (systemCaps.supportFaceMatch) {
                // 人脸比对报警
                rowData.push({
                    id: 'faceMatchAlarms',
                    type: Translate('IDCS_FACE_MATCH_ALARM'),
                    data: [],
                    index: 1,
                })
            }
            if (systemCaps.supportPlateMatch) {
                // 车辆比对报警
                rowData.push({
                    id: 'vehiclePlateMatchAlarms',
                    type: Translate('IDCS_PLATE_MATCH_ALARM'),
                    data: [],
                    index: 1,
                })
            }
            tableList.value = rowData
        }

        /**
         * @description 报警状态的ICON的状态
         * @param {SystemAlarmStatusList} row
         * @param {number} index
         * @returns
         */
        const getAlarmClassName = (row: SystemAlarmStatusList, index: number) => {
            if (row.data.length === 0) {
                return 1
            }
            if (index === pageData.value.activeIndex) {
                return 4
            }
            if (row.id === 'motion') {
                return 2
            }
            if (row.id === 'intelligents') {
                return 3
            }
            return 0
        }

        /**
         * @description 报警状态的class name
         * @param {SystemAlarmStatusList} row
         * @param {number} index
         * @returns
         */
        const getAlarmStatusActive = (row: SystemAlarmStatusList, index: number) => {
            if (row.data.length === 0) {
                return false
            }
            if (index === pageData.value.activeIndex) {
                return true
            }
            return false
        }

        /**
         * @description 获取报警状态信息
         */
        const getAlarmStatus = async () => {
            const result = await queryAlarmStatus()
            commLoadResponseHandler(result, ($) => {
                const types = tableList.value.map((item) => item.id)

                getAlaramInData($, types.indexOf('alarmIn'))
                getAlarmOutData($, types.indexOf('alarmOut'))
                getMotionData($, types.indexOf('motion'))
                getAbnormalData($, types.indexOf('abnormal'))
                getCombinedAlarmsData($, types.indexOf('combinedAlarm'))

                if (types.indexOf('intelligents') > -1) {
                    getIntelligentsData($, types.indexOf('intelligents'))
                }
                if (types.indexOf('faceMatchAlarms') > -1) {
                    getFaceMatchAlaramsData($, types.indexOf('faceMatchAlarms'))
                }
                if (types.indexOf('vehiclePlateMatchAlarms') > -1) {
                    getVehiclePlateMatchAlarmsData($, types.indexOf('vehiclePlateMatchAlarms'))
                }
            })

            getAlarmStatusTimer = setTimeout(() => {
                getAlarmStatus()
                updatePagination()
            }, refreshInterval)
        }

        /**
         * @description 更新页码
         */
        const updatePagination = () => {
            tableList.value.forEach((item) => {
                if (item.index > item.data.length) {
                    item.index = item.data.length
                }
            })
        }

        /**
         * @description 报警输入
         * @param {Function} $
         * @param {number} index
         */
        const getAlaramInData = ($: (path: string) => XmlResult, index: number) => {
            const alarmInData = $('/response/content/alarmIns/item').map((item) => {
                const $item = queryXml(item.element)
                const alarmTime = utcToLocal($item('alarmTime').text(), dateTime.dateTimeFormat.value)
                const rec = $item('triggerRecChls/item').map((chl) => ({
                    id: chl.attr('id')!,
                    text: chl.text(),
                }))
                const triggerRecChlNames = rec.map((item) => item.text).join(', ')
                return {
                    id: $item('sourceAlarmIn').attr('id')!,
                    rec,
                    alarmTime,
                    data: [
                        {
                            key: 'IDCS_ALARM_SOURCE',
                            value: replaceWithEntity($item('sourceAlarmIn').text()),
                            span: 2,
                        },
                        {
                            key: 'IDCS_ALARM_HAPPEN_TIME',
                            value: alarmTime,
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_RECORD_CHANNEL',
                            value: triggerRecChlNames || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OUT',
                            value: $item('triggerAlarmOutNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_PRESET',
                            value: $item('triggerPresetNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: '',
                            value: '',
                            span: 2,
                            hidden: true,
                        },
                        {
                            key: 'IDCS_SNAP',
                            value: SWITCH_MAPPING[$item('snapSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_BUZZER',
                            value: SWITCH_MAPPING[$item('buzzerSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OPEN_VIDEO',
                            value: SWITCH_MAPPING[$item('popVideoSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OPEN_MESSAGE',
                            value: SWITCH_MAPPING[$item('popMsgSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_SEND_EMAIL',
                            value: SWITCH_MAPPING[$item('emailSwitch').text()],
                            span: 1,
                        },
                    ],
                }
            })
            tableList.value[index].data = alarmInData
        }

        /**
         * @description 报警输出
         * @param {Function} $
         * @param {number} index
         */
        const getAlarmOutData = ($: (path: string) => XmlResult, index: number) => {
            const alarmOutData = $('/response/content/alarmOuts/item').map((item) => {
                const $item = queryXml(item.element)
                const alarmTime = utcToLocal($item('alarmTime').text(), dateTime.dateTimeFormat.value)
                return {
                    id: $item('alarmOut').attr('id')!,
                    rec: [],
                    alarmTime,
                    data: [
                        {
                            key: 'IDCS_ALARM_SOURCE',
                            value: replaceWithEntity($item('alarmOut').text()),
                            span: 2,
                        },
                        {
                            key: 'IDCS_ALARM_HAPPEN_TIME',
                            value: alarmTime,
                            span: 2,
                        },
                    ],
                }
            })
            tableList.value[index].data = alarmOutData
        }

        /**
         * @description 移动侦测
         * @param {Function} $
         * @param {number} index
         */
        const getMotionData = ($: (path: string) => XmlResult, index: number) => {
            const motionData = $('/response/content/motions/item').map((item) => {
                const $item = queryXml(item.element)
                const alarmTime = utcToLocal($item('alarmTime').text(), dateTime.dateTimeFormat.value)
                const rec = $item('triggerRecChls/item').map((chl) => ({
                    id: chl.attr('id')!,
                    text: chl.text(),
                }))
                const triggerRecChlNames = rec.map((item) => item.text).join(', ')

                return {
                    id: $item('sourceChl').attr('id')!,
                    alarmTime,
                    rec,
                    data: [
                        {
                            key: 'IDCS_ALARM_SOURCE',
                            value: replaceWithEntity($item('sourceChl').text()),
                            span: 2,
                        },
                        {
                            key: 'IDCS_ALARM_HAPPEN_TIME',
                            value: alarmTime,
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_RECORD_CHANNEL',
                            value: triggerRecChlNames || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OUT',
                            value: $item('triggerAlarmOutNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_PRESET',
                            value: $item('triggerPresetNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: '',
                            value: '',
                            span: 2,
                            hidden: true,
                        },
                        {
                            key: 'IDCS_SNAP',
                            value: SWITCH_MAPPING[$item('snapSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_BUZZER',
                            value: SWITCH_MAPPING[$item('buzzerSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OPEN_VIDEO',
                            value: SWITCH_MAPPING[$item('popVideoSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TARGET_DETECTION',
                            value: TARGET_TYPE_MAPPING[Number($item('targetType').text())] || '',
                            span: 1,
                            hide: !(TARGET_TYPE_MAPPING[Number($item('targetType').text())] || ''),
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_SEND_EMAIL',
                            value: SWITCH_MAPPING[$item('emailSwitch').text()],
                            span: 2,
                        },
                    ],
                }
            })
            tableList.value[index].data = motionData
        }

        /**
         * @description 智能分析
         * @param {Function} $
         * @param {number} index
         */
        const getIntelligentsData = ($: (path: string) => XmlResult, index: number) => {
            const intelligentsData = $('/response/content/intelligents/item').map((item) => {
                const $item = queryXml(item.element)
                const alarmTime = utcToLocal($item('alarmTime').text(), dateTime.dateTimeFormat.value)
                const rec = $item('triggerRecChls/item').map((chl) => ({
                    id: chl.attr('id')!,
                    text: chl.text(),
                }))
                const triggerRecChlNames = rec.map((item) => item.text).join(', ')

                return {
                    id: $item('sourceChl').attr('id')!,
                    alarmTime,
                    rec,
                    data: [
                        {
                            key: 'IDCS_ALARM_SOURCE',
                            value: replaceWithEntity($item('sourceChl').text()),
                            span: 1,
                        },
                        {
                            key: 'IDCS_ALARM_HAPPEN_TIME',
                            value: alarmTime,
                            span: 2,
                        },
                        {
                            key: 'IDCS_CONNECT_STATUS',
                            value: Translate(INTELLIGENCE_TYPE_MAPPING[$item('intelligentType').text()]),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_RECORD_CHANNEL',
                            value: triggerRecChlNames || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OUT',
                            value: $item('triggerAlarmOutNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_PRESET',
                            value: $item('triggerPresetNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: '',
                            value: '',
                            span: 2,
                            hidden: true,
                        },
                        {
                            key: 'IDCS_SNAP',
                            value: SWITCH_MAPPING[$item('snapSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_BUZZER',
                            value: SWITCH_MAPPING[$item('buzzerSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OPEN_VIDEO',
                            value: SWITCH_MAPPING[$item('popVideoSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_SEND_EMAIL',
                            value: SWITCH_MAPPING[$item('popMsgSwitch').text()],
                            span: 2,
                        },
                    ],
                }
            })
            tableList.value[index].data = intelligentsData
        }

        /**
         * @description 异常报警
         * @param {Function} $
         * @param {number} index
         */
        const getAbnormalData = ($: (path: string) => XmlResult, index: number) => {
            const data: SystemAlarmStatusListData[] = []

            const abnormalData = $('/response/content/abnormals/item').map((item) => {
                const $item = queryXml(item.element)

                const abnormalType = $item('abnormalType').text() || ''
                const diskType = Number($item('alarmNode').attr('diskType')!)
                const alarmTime = utcToLocal($item('alarmTime').text(), dateTime.dateTimeFormat.value)
                const serialNO = $item('alarmNode').attr('serialNO')!
                const nic = $item('alarmNode').attr('nic')!
                const ip = $item('alarmNode').attr('ip')!

                let abnormalTypeText = ''
                let abnormalInfo = ''

                switch (abnormalType) {
                    case 'ipConflict':
                    case 'RAIDHotError':
                        abnormalInfo = $item('alarmNode').text()
                        break
                    case 'diskRWError':
                    case 'hddPullOut':
                        abnormalInfo = (diskType === 2 ? Translate('IDCS_ESATA') : Translate('IDCS_DISK')) + $item('alarmNode').text()
                        break
                    case 'diskFull':
                    case 'RAIDSubHealth':
                    case 'RAIDUnavailable':
                    case 'illegalAccess':
                    case 'networkBreak':
                    case 'noDisk':
                    case 'signalShelter':
                    case 'alarmServerOffline':
                        abnormalInfo = replaceWithEntity($item('alarmNode').text())
                        break
                    default:
                        break
                }
                switch (abnormalType) {
                    case 'diskRWError':
                        const text1 = Translate(ABNORMAL_TYPE_MAPPING[abnormalType])
                        const text2 = serialNO ? '--' + Translate('IDCS_DISK_IO_ERROR_D_D').formatForLang($item('alarmNode').text() || '', serialNO) : ''
                        abnormalTypeText = text1 + text2
                        break
                    case 'networkBreak':
                        abnormalTypeText = '%1%2'.formatForLang(
                            Translate(ABNORMAL_TYPE_MAPPING[abnormalType]),
                            nic ? '(%1)'.formatForLang(Translate(nic == 'eth0' ? 'IDCS_ETH0_NAME' : nic == 'eth1' ? 'IDCS_ETH1_NAME' : nic)) : '',
                        )
                        break
                    case 'ipConflict':
                        const ipTips = ip ? `:${ip}` : ''
                        abnormalTypeText = Translate(ABNORMAL_TYPE_MAPPING[abnormalType]) + ipTips
                        break
                    default:
                        abnormalTypeText = Translate(ABNORMAL_TYPE_MAPPING[abnormalType])
                        break
                }
                return {
                    id: $item('alarmNode').attr('id')!,
                    alarmTime,
                    rec: [],
                    data: [
                        {
                            key: 'IDCS_ALARM_SOURCE',
                            value: abnormalInfo,
                            span: 2,
                        },
                        {
                            key: 'IDCS_ALARM_HAPPEN_TIME',
                            value: alarmTime,
                            span: 2,
                        },
                        {
                            key: 'IDCS_STATE',
                            value: abnormalTypeText,
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OUT',
                            value: $item('triggerAlarmOutNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: '',
                            value: '',
                            span: 2,
                            hidden: true,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_BUZZER',
                            value: SWITCH_MAPPING[$item('buzzerSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OPEN_MESSAGE',
                            value: SWITCH_MAPPING[$item('popMsgSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_SEND_EMAIL',
                            value: SWITCH_MAPPING[$item('emailSwitch').text()],
                            span: 2,
                        },
                    ],
                }
            })
            const frontEndOfflineData = $('/response/content/frontEndOffline/item').map((item) => {
                const $item = queryXml(item.element)
                const alarmTime = utcToLocal($item('alarmTime').text(), dateTime.dateTimeFormat.value)
                const ip = $item('alarmNode').attr('ip')!

                let errorNote = ''
                const errorCode = Number($item('errorCode').text())
                switch (errorCode) {
                    case 536870948:
                        errorNote = `(${Translate('IDCS_DEVICE_PWD_ERROR')})`
                        break
                    case 536870935:
                        errorNote = `(${Translate('IDCS_NODE_NOT_ONLINE')})`
                        break
                    default:
                        break
                }
                const ipTips = ip ? ` ${Translate('IDCS_IP_ADDRESS')}:${ip}` : ''

                return {
                    id: $item('sourceChl').attr('id')!,
                    alarmTime,
                    rec: [],
                    data: [
                        {
                            key: 'IDCS_ALARM_SOURCE',
                            value: replaceWithEntity($item('sourceChl').text()),
                            span: 2,
                        },
                        {
                            key: 'IDCS_ALARM_HAPPEN_TIME',
                            value: alarmTime,
                            span: 2,
                        },
                        {
                            key: 'IDCS_STATE',
                            value: Translate(ABNORMAL_TYPE_MAPPING['frontEndOffline']) + errorNote + ipTips,
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OUT',
                            value: $item('triggerAlarmOutNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_PRESET',
                            value: $item('triggerPresetNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: '',
                            value: '',
                            span: 2,
                            hidden: true,
                        },
                        {
                            key: 'IDCS_SNAP',
                            value: SWITCH_MAPPING[$item('snapSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_BUZZER',
                            value: SWITCH_MAPPING[$item('buzzerSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OPEN_VIDEO',
                            value: SWITCH_MAPPING[$item('popVideoSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OPEN_MESSAGE',
                            value: SWITCH_MAPPING[$item('popMsgSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_SEND_EMAIL',
                            value: SWITCH_MAPPING[$item('emailSwitch').text()],
                            span: 2,
                        },
                    ],
                }
            })
            const videoLossData = $('/response/content/videoLoss/item').map((item) => {
                const $item = queryXml(item.element)
                const alarmTime = utcToLocal($item('alarmTime').text(), dateTime.dateTimeFormat.value)

                return {
                    id: $item('sourceChl').attr('id')!,
                    alarmTime,
                    rec: [],
                    data: [
                        {
                            key: 'IDCS_ALARM_SOURCE',
                            value: replaceWithEntity($item('sourceChl').text()),
                            span: 2,
                        },
                        {
                            key: 'IDCS_ALARM_HAPPEN_TIME',
                            value: alarmTime,
                            span: 2,
                        },
                        {
                            key: 'IDCS_STATE',
                            value: Translate(ABNORMAL_TYPE_MAPPING['videoLoss']),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OUT',
                            value: $item('triggerAlarmOutNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_PRESET',
                            value: $item('triggerPresetNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: '',
                            value: '',
                            span: 2,
                            hidden: true,
                        },
                        {
                            key: 'IDCS_SNAP',
                            value: SWITCH_MAPPING[$item('snapSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_BUZZER',
                            value: SWITCH_MAPPING[$item('buzzerSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OPEN_VIDEO',
                            value: SWITCH_MAPPING[$item('popVideoSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OPEN_MESSAGE',
                            value: SWITCH_MAPPING[$item('popMsgSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_SEND_EMAIL',
                            value: SWITCH_MAPPING[$item('emailSwitch').text()],
                            span: 2,
                        },
                    ],
                }
            })
            data.push(...abnormalData, ...frontEndOfflineData, ...videoLossData)
            data.sort((a, b) => {
                return dayjs(a.alarmTime, dateTime.dateTimeFormat.value).valueOf() - dayjs(b.alarmTime, dateTime.dateTimeFormat.value).valueOf()
            })
            tableList.value[index].data = data
        }

        /**
         * @description 人脸比对报警
         * @param {Function} $
         * @param {number} index
         */
        const getFaceMatchAlaramsData = ($: (path: string) => XmlResult, index: number) => {
            const faceMatchAlarmsData = $('/response/content/faceMatchAlarms/item').map((item) => {
                const $item = queryXml(item.element)
                const alarmTime = utcToLocal($item('alarmTime').text(), dateTime.dateTimeFormat.value)
                const rec = $item('triggerRecChls/item').map((chl) => ({
                    id: chl.attr('id')!,
                    text: chl.text(),
                }))
                const triggerRecChlNames = rec.map((item) => item.text).join(', ')

                return {
                    id: $item('sourceFacePersonnalInfoGroup').attr('id')!,
                    alarmTime,
                    rec: [],
                    img: 'data:image/png;base64,' + $item('faceImgData').text(),
                    data: [
                        {
                            key: '',
                            value: $item('eventHint').text() || '',
                            span: 2,
                        },
                        {
                            key: 'IDCS_ALARM_SOURCE',
                            value: $item('sourceChl').text() || '',
                            span: 2,
                        },
                        {
                            key: 'IDCS_ALARM_HAPPEN_TIME',
                            value: alarmTime,
                            span: 2,
                        },
                        {
                            key: 'IDCS_NAME_PERSON',
                            value: $item('name').text() || '--',
                            span: 2,
                        },
                        {
                            key: 'IDCS_SIMILARITY',
                            value: $item('similarity').text() ? $item('similarity').text() + '%' : '--',
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_RECORD_CHANNEL',
                            value: triggerRecChlNames || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OUT',
                            value: $item('triggerAlarmOutNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_PRESET',
                            value: $item('triggerPresetNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_BUZZER',
                            value: SWITCH_MAPPING[$item('buzzerSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OPEN_VIDEO',
                            value: SWITCH_MAPPING[$item('popVideoSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OPEN_MESSAGE',
                            value: SWITCH_MAPPING[$item('popMsgSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_SNAP',
                            value: SWITCH_MAPPING[$item('snapSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_SEND_EMAIL',
                            value: SWITCH_MAPPING[$item('emailSwitch').text()],
                            span: 2,
                        },
                    ],
                }
            })
            tableList.value[index].data = faceMatchAlarmsData
        }

        /**
         * @description 组合报警
         * @param {Function} $
         * @param {number} index
         */
        const getCombinedAlarmsData = ($: (path: string) => XmlResult, index: number) => {
            const combinedAlarmsData = $('/response/content/combinedAlarms/item').map((item) => {
                const $item = queryXml(item.element)
                const alarmTime = utcToLocal($item('alarmTime').text(), dateTime.dateTimeFormat.value)
                const rec = $item('triggerRecChls/item').map((chl) => ({
                    id: chl.attr('id')!,
                    text: chl.text(),
                }))
                const triggerRecChlNames = rec.map((item) => item.text).join(', ')

                return {
                    id: $item('sourceAlarmIn').attr('id')!,
                    rec,
                    alarmTime,
                    data: [
                        {
                            key: 'IDCS_ALARM_SOURCE',
                            value: $item('sourceAlarmIn').text(),
                            span: 2,
                        },
                        {
                            key: 'IDCS_ALARM_HAPPEN_TIME',
                            value: alarmTime,
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_RECORD_CHANNEL',
                            value: triggerRecChlNames || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OUT',
                            value: $item('triggerAlarmOutNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_PRESET',
                            value: $item('triggerPresetNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: '',
                            value: '',
                            span: 2,
                            hidden: true,
                        },
                        {
                            key: 'IDCS_SNAP',
                            value: SWITCH_MAPPING[$item('snapSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_BUZZER',
                            value: SWITCH_MAPPING[$item('buzzerSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OPEN_VIDEO',
                            value: SWITCH_MAPPING[$item('popVideoSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_SEND_EMAIL',
                            value: SWITCH_MAPPING[$item('emailSwitch').text()],
                            span: 2,
                        },
                    ],
                }
            })
            tableList.value[index].data = combinedAlarmsData
        }

        /**
         * @description 车辆比对报警
         * @param {Function} $
         * @param {number} index
         */
        const getVehiclePlateMatchAlarmsData = ($: (path: string) => XmlResult, index: number) => {
            const vehiclePlateMatchAlarmsData = $('/response/content/vehiclePlateMatchAlarms/item').map((item) => {
                const $item = queryXml(item.element)
                const alarmTime = utcToLocal($item('alarmTime').text(), dateTime.dateTimeFormat.value)
                const rec = $item('triggerRecChls/item').map((chl) => ({
                    id: chl.attr('id')!,
                    text: chl.text(),
                }))
                const triggerRecChlNames = rec.map((item) => item.text).join(', ')

                return {
                    id: $item('sourcePlateGroup').attr('id')!,
                    alarmTime,
                    rec: [],
                    img: 'data:image/png;base64,' + $item('plateImgData').text(),
                    data: [
                        {
                            key: '',
                            value: $item('eventHint').text() || '',
                            span: 2,
                        },
                        {
                            key: 'IDCS_ALARM_SOURCE',
                            value: $item('sourceChl').text() || '',
                            span: 2,
                        },
                        {
                            key: 'IDCS_ALARM_HAPPEN_TIME',
                            value: alarmTime,
                            span: 2,
                        },
                        {
                            key: 'IDCS_GROUP_NAME',
                            value: PLATE_LIBRARY_NAME[Number($item('sourcePlateGroup').attr('id')!)],
                            span: 2,
                        },
                        {
                            key: 'IDCS_LICENSE_PLATE_NUM',
                            value: $item('plateNumber').text() || '--',
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_RECORD_CHANNEL',
                            value: triggerRecChlNames || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OUT',
                            value: $item('triggerAlarmOutNames').text() || Translate('IDCS_NULL'),
                            span: 2,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_BUZZER',
                            value: SWITCH_MAPPING[$item('buzzerSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OPEN_VIDEO',
                            value: SWITCH_MAPPING[$item('popVideoSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_OPEN_MESSAGE',
                            value: SWITCH_MAPPING[$item('popMsgSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_SNAP',
                            value: SWITCH_MAPPING[$item('snapSwitch').text()],
                            span: 1,
                        },
                        {
                            key: 'IDCS_TRIGGER_ALARM_SEND_EMAIL',
                            value: SWITCH_MAPPING[$item('emailSwitch').text()],
                            span: 2,
                        },
                    ],
                }
            })

            tableList.value[index].data = vehiclePlateMatchAlarmsData
        }

        /**
         * @description 选中当前行
         * @param {SystemAlarmStatusList} row
         */
        const handleChangeRow = (row: SystemAlarmStatusList) => {
            pageData.value.activeIndex = tableList.value.findIndex((item) => row.id === item.id)!
        }

        /**
         * @description 回放
         * @param {SystemAlarmStatusListData} row
         */
        const playRec = (row: SystemAlarmStatusListData) => {
            const alarmTime = row.alarmTime
            const startTime = dayjs(alarmTime, dateTime.dateTimeFormat.value).subtract(preTime, 'millisecond').valueOf()
            const endTime = dayjs(alarmTime, dateTime.dateTimeFormat.value).add(recDuration, 'millisecond').subtract(preTime, 'millisecond').valueOf()

            const playList = row.rec.map((item) => {
                return {
                    chlId: item.id,
                    chlName: item.text,
                    eventList: ['MOTION', 'SCHEDULE', 'SENSOR', 'MANUAL', 'INTELLIGENT'],
                    startTime,
                    endTime,
                }
            })
            pageData.value.recordPlayList = playList
            pageData.value.isRecord = true
        }

        onMounted(async () => {
            openLoading(LoadingTarget.FullScreen)
            await getBasicCfg()
            await systemCaps.updateCabability()
            await getFaceFeatureGroupsName()
            await getPlateLibrary()

            renderTable()
            await dateTime.getTimeConfig()
            await getAlarmStatus()
            closeLoading(LoadingTarget.FullScreen)
        })

        onBeforeUnmount(() => {
            clearTimeout(getAlarmStatusTimer)
        })

        return {
            tableRef,
            tableList,
            pageData,
            getAlarmClassName,
            getAlarmStatusActive,
            handleChangeRow,
            playRec,
        }
    },
})
