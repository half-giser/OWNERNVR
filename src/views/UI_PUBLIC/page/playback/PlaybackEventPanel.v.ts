/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:37:25
 * @Description: 回放-事件类型视图
 */
import RecordBaseEventSelector from '../record/RecordBaseEventSelector.vue'

export interface EventPanelExpose {
    setEvent(chl: string): void
}

export default defineComponent({
    components: {
        RecordBaseEventSelector,
    },
    emits: {
        change(data: PlaybackEventList[], typeMask: string[], eventList: string[], modeType: string, posKeyword: string, forced: boolean) {
            return Array.isArray(data) && Array.isArray(typeMask) && Array.isArray(eventList) && typeof modeType === 'string' && typeof posKeyword === 'string' && typeof forced === 'boolean'
        },
    },
    setup(_, ctx) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        const EVENT_TYPE_MAPPING: Record<string, string> = {
            // 常规回放
            human: Translate('IDCS_DETECTION_PERSON'), // 人
            vehicle: Translate('IDCS_DETECTION_VEHICLE'), // 车
            nonMotorizedVehicle: Translate('IDCS_DETECTION_MOTORCYCLE'), // 非机动车
            // 事件回放
            motion: Translate('IDCS_MOTION_DETECTION'), // 移动侦测
            smdPerson: Translate('IDCS_MOTION_DETECTION'), // SMD-人
            smdCar: Translate('IDCS_MOTION_DETECTION'), // SMD-车
            manual: Translate('IDCS_MANUAL'), // 手动
            pos: Translate('IDCS_POS'), // pos
            sensor: Translate('IDCS_SENSOR'), // 传感器
            intrusion: Translate('IDCS_INVADE_DETECTION'), // 区域入侵
            smartEntry: Translate('IDCS_SMART_AOI_ENTRY_DETECTION'), // 区域进入
            smartLeave: Translate('IDCS_SMART_AOI_LEAVE_DETECTION'), // 区域离开
            tripwire: Translate('IDCS_BEYOND_DETECTION'), // 越界
            vfd: Translate('IDCS_FACE_DETECTION'), // 人脸侦测
            faceMatch: Translate('IDCS_FACE_MATCH'), // 人脸识别
            plateMatch: Translate('IDCS_VEHICLE_DETECTION'), // 车牌识别
            loitering: Translate('IDCS_LOITERING_DETECTION'), // 徘徊检测
            pvd: Translate('IDCS_PARKING_DETECTION'), // 停车检测
            threshold: Translate('IDCS_SMART_STATISTIC_THRESHOLD_ALARM'), // 统计阈值
            cdd: Translate('IDCS_CROWD_DENSITY_DETECTION'), // 人群密度检测
            osc: Translate('IDCS_WATCH_DETECTION'), // 物品遗留与看护
            asd: Translate('IDCS_AUDIO_EXCEPTION_DETECTION'), // 声音异常
            avd: Translate('IDCS_ABNORMAL_DETECTION'), // 视频异常
            smartCroedGather: Translate('IDCS_CROWD_GATHERING'), // 人员聚集
            cpc: Translate('IDCS_PASS_LINE_COUNT_DETECTION'), // 人流量统计
            firePoint: Translate('IDCS_FIRE_POINT_DETECTION'), // 火点检测
            temperatureAlarm: Translate('IDCS_TEMPERATURE_DETECTION'), // 温度检测
            schedule: Translate('IDCS_SCHEDULE'), // 排程
        }

        const TYPE_MASK_MAP: Record<string, string[]> = {
            // 常规回放
            human: ['target_human'],
            vehicle: ['target_vehicle'],
            nonMotorizedVehicle: ['target_non_motor_vehicle'],
            // 事件回放
            motion: ['motion', 'SMDHuman', 'SMDVehicle'],
            smdPerson: ['SMDHuman'],
            smdCar: ['SMDVehicle'],
            manual: ['manual'],
            pos: ['pos'],
            sensor: ['sensor'],
            intrusion: ['perimeter'],
            smartEntry: ['smart_aoi_entry'],
            smartLeave: ['smart_aoi_leave'],
            tripwire: ['tripwire'],
            vfd: ['vfd'],
            faceMatch: ['face_verity'],
            plateMatch: ['smart_plate_verity'],
            loitering: ['loitering'],
            pvd: ['pvd'],
            threshold: ['threshold'],
            cdd: ['cdd'],
            osc: ['osc'],
            asd: ['asd'],
            avd: ['avd'],
            smartCroedGather: ['crowd_gather'],
            firePoint: ['smart_fire_point'],
            temperatureAlarm: ['smart_temperature'],
        }

        // 事件模式索引与key值的映射
        const MODE_INDEX_TYPE_MAP: Record<number, string> = {
            0: 'modeOne',
            1: 'modeTwo',
        }

        const EVENT_TYPE_COLOR_MAP = [
            {
                // 录像条底色（优先级最低，作为时间轴底色，不需要展示在录像条下方作为示例）
                key: 'otherType',
                color: '#005692',
                name: Translate('IDCS_NORMAL_RECORD'),
                level: 69,
            },
            // 按人车：###需要展示在录像条下方作为示例###
            {
                // 人
                key: 'human',
                color: '#A12534',
                name: Translate('IDCS_DETECTION_PERSON'),
                level: 1,
            },
            {
                // 车、非
                key: 'vehicle',
                color: '#00AD45',
                name: Translate('IDCS_VEHICLE'),
                level: 2,
            },
            // 按类别：###需要展示在录像条下方作为示例###
            {
                // AI录像（优先级最低，作为时间轴底色）
                key: 'AI',
                color: '#00CCCC',
                name: Translate('IDCS_AI'),
                level: 3,
            },
            {
                // 通用录像
                key: 'general',
                color: '#A12534',
                name: Translate('IDCS_GENERAL'),
                level: 4,
            },
            // 按事件：###需要展示在录像条下方作为示例###
            {
                // 手动
                key: 'manual',
                color: '#00CC00',
                name: Translate('IDCS_MANUAL'),
                level: 5,
            },
            {
                // 传感器
                key: 'sensor',
                color: '#CC0000',
                name: Translate('IDCS_SENSOR'),
                level: 6,
            },
            {
                // 周界防范（区域入侵、区域进入、区域离开、越界）
                key: 'boundary',
                color: '#00CCCC',
                name: Translate('IDCS_HUMAN_CAR_OTHER_BOUNDARY'),
                children: ['intrusion', 'smartEntry', 'smartLeave', 'tripwire'],
                level: 7,
            },
            {
                // 目标事件（人脸侦测、人脸识别、车牌识别）
                key: 'target',
                color: '#00CCCC',
                name: Translate('IDCS_TARGET_EVENT'),
                children: ['vfd', 'faceMatch', 'plateMatch'],
                level: 8,
            },
            {
                // 异常行为（徘徊检测、停车检测、统计阈值、人群密度检测、物品遗留与看护、声音异常、视频异常、人员聚集）
                key: 'abnormal',
                color: '#00CCCC',
                name: Translate('IDCS_EXCEPTION_BEHAVIOR'),
                children: ['loitering', 'pvd', 'threshold', 'cdd', 'osc', 'asd', 'avd', 'smartCroedGather'],
                level: 9,
            },
            {
                // 热成像（火点检测、温度检测）
                key: 'thermal',
                color: '#00CCCC',
                name: Translate('IDCS_THERMAL_LIGHT'),
                children: ['firePoint', 'temperatureAlarm'],
                level: 10,
            },
            {
                // 移动侦测（motion、smdPerson、smdCar）
                key: 'motion',
                color: '#CCCC00',
                name: Translate('IDCS_MOTION_DETECTION'),
                children: ['motion', 'smdPerson', 'smdCar'],
                level: 11,
            },
            {
                // pos
                key: 'pos',
                color: '#6900CC',
                name: Translate('IDCS_POS'),
                level: 12,
            },
        ]

        // xml下发字段和websocket下发字段的映射
        // const TYPE_MASK_MAP: Record<string, string[]> = {
        //     MANUAL: ['manual'],
        //     SCHEDULE: ['schedule'],
        //     MOTION: ['motion'],
        //     SMDHUMAN: ['SMDHuman'],
        //     SMDVEHICLE: ['SMDVehicle'],
        //     SENSOR: ['sensor'],
        //     TRIPWIRE: ['tripwire'],
        //     INVADE: ['perimeter'],
        //     FACEDETECTION: ['vfd'],
        //     POS: ['pos'],
        //     FACEMATCH: ['face_verity'],
        //     AOIENTRY: ['smart_aoi_entry'],
        //     AOILEAVE: ['smart_aoi_leave'],
        //     VEHICLE: ['smart_plate_verity'],
        //     NORMALALL: ['manual', 'schedule', 'motion', 'SMDHuman', 'SMDVehicle', 'sensor', 'pos'],
        //     OTHER: ['osc', 'avd', 'cdd', 'smart_pass_line', 'smart_fire_point', 'smart_temperature'],
        //     ITEMCARE: ['osc'],
        //     CROWDDENSITY: ['cdd'],
        //     EXCEPTION: ['avd'],
        //     FIREPOINT: ['smart_fire_point'],
        //     TEMPERATURE: ['smart_temperature'],
        //     INTELLIGENT: [
        //         'osc',
        //         'avd',
        //         'cdd',
        //         'smart_pass_line',
        //         'vfd',
        //         'face_verity',
        //         'smart_plate_verity',
        //         'tripwire',
        //         'perimeter',
        //         'smart_aoi_entry',
        //         'smart_aoi_leave',
        //         'smart_fire_point',
        //         'smart_temperature',
        //     ],
        // }

        const pageData = ref({
            isPlayModePop: false,
            // 当前的播放事件模式：常规回放（normalPlay）、事件回放（eventPlay）
            playMode: 'normal',
            playModeList: [
                {
                    value: 'normal',
                    label: Translate('IDCS_NORMAL_PLAYBACK'),
                },
                {
                    value: 'event',
                    label: Translate('IDCS_EVENT_PLAYBACK'),
                },
            ],
            filterType: 'byEvent',
            filterTypeList: [
                {
                    value: 'byEvent',
                    label: Translate('IDCS_BY_EVENT'),
                    children: EVENT_TYPE_COLOR_MAP.filter((item) => ['manual', 'sensor', 'boundary', 'target', 'abnormal', 'thermal', 'motion', 'pos'].includes(item.key)).sort(
                        (a, b) => a.level - b.level,
                    ),
                },
                {
                    value: 'byEvent',
                    label: Translate('IDCS_BY_CATEGORY'),
                    children: EVENT_TYPE_COLOR_MAP.filter((item) => ['AI', 'otherType'].includes(item.key)).sort((a, b) => a.level - b.level),
                },
            ],
            // 是否显示事件弹窗
            isEventPop: false,
            // 常规回放事件列表
            normalEvent: [
                {
                    name: EVENT_TYPE_MAPPING.human,
                    value: 'human',
                    children: ['human'],
                    selected: true,
                    icon: 'personTypeIcon',
                },
                {
                    name: EVENT_TYPE_MAPPING.vehicle,
                    value: 'vehicle',
                    children: ['vehicle', 'nonMotorizedVehicle'],
                    selected: true,
                    icon: 'vehicleTypeIcon',
                },
            ],
            // 事件列表
            events: [
                [
                    {
                        checked: 'event_type_manual_checked',
                        unchecked: 'event_type_manual_unchecked',
                        file: 'event_type_manual',
                        value: 'MANUAL',
                        name: Translate('IDCS_MANUAL'),
                        children: [],
                        color: '#00FF00',
                        enable: true,
                        enablePop: true,
                        level: 1,
                    },
                    {
                        checked: 'event_type_sensor_checked',
                        unchecked: 'event_type_sensor_unchecked',
                        file: 'event_type_sensor',
                        value: 'SENSOR',
                        name: Translate('IDCS_SENSOR'),
                        children: [],
                        color: '#FF0000',
                        enable: true,
                        enablePop: true,
                        level: 2,
                    },
                    {
                        checked: 'event_type_Intelligence_checked',
                        unchecked: 'event_type_Intelligence_unchecked',
                        file: 'event_type_Intelligence',
                        value: 'INTELLIGENT',
                        name: Translate('IDCS_AI_ALL'),
                        // children: [],
                        children: ['FACEDETECTION', 'FACEMATCH', 'VEHICLE', 'TRIPWIRE', 'INVADE', 'AOIENTRY', 'AOILEAVE', 'FIREPOINT', 'TEMPERATURE'],
                        color: '#02B4B4',
                        enable: systemCaps.ipChlMaxCount > 0,
                        enablePop: true,
                        level: 3,
                    },
                    {
                        checked: 'event_type_motion_checked',
                        unchecked: 'event_type_motion_unchecked',
                        file: 'event_type_motion',
                        value: 'MOTION',
                        name: Translate('IDCS_MOTION_DETECTION'),
                        children: ['MOTION', 'SMDHUMAN', 'SMDVEHICLE'],
                        color: '#fefc0b',
                        enable: true,
                        enablePop: true,
                        level: 4,
                    },
                    {
                        checked: 'event_type_pos_checked',
                        unchecked: 'event_type_pos_unchecked',
                        file: 'event_type_pos',
                        value: 'POS',
                        name: Translate('IDCS_POS'),
                        children: [],
                        color: '#8000ff',
                        enable: systemCaps.supportPOS,
                        enablePop: systemCaps.supportPOS,
                        level: 5,
                    },
                    {
                        checked: 'event_type_schedule_checked',
                        unchecked: 'event_type_schedule_unchecked',
                        file: 'event_type_schedule',
                        value: 'SCHEDULE',
                        name: Translate('IDCS_SCHEDULE'),
                        children: [],
                        color: '#0080FF',
                        enable: true,
                        enablePop: true,
                        level: 6,
                    },
                ],
                [
                    {
                        checked: 'event_type_normal_checked',
                        unchecked: 'event_type_normal_unchecked',
                        file: 'event_type_normal',
                        value: 'NORMALALL',
                        name: Translate('IDCS_EVENT_NORMAL_ALL'),
                        children: ['MANUAL', 'SENSOR', 'MOTION', 'SMDHUMAN', 'SMDVEHICLE', 'SCHEDULE'],
                        color: '#00ffc0',
                        enable: true,
                        enablePop: true,
                        level: 6,
                    },
                    {
                        checked: 'event_type_face_checked',
                        unchecked: 'event_type_face_unchecked',
                        file: 'event_type_peopleface',
                        value: 'PEOPLEFACE',
                        name: Translate('IDCS_FACE'),
                        children: ['FACEDETECTION', 'FACEMATCH'],
                        color: '#3c88f6',
                        enable: true,
                        enablePop: true,
                        level: 1,
                    },
                    {
                        checked: 'event_type_vehicle_checked',
                        unchecked: 'event_type_vehicle_unchecked',
                        file: 'event_type_vehicle',
                        value: 'VEHICLE',
                        name: Translate('IDCS_LICENSE_PLATE'),
                        children: [],
                        color: '#5dff0e',
                        enable: true,
                        enablePop: true,
                        level: 2,
                    },
                    {
                        checked: 'event_type_tripwire_checked',
                        unchecked: 'event_type_tripwire_unchecked',
                        file: 'event_type_tripwire',
                        value: 'TRIPWIRE',
                        name: Translate('IDCS_BEYOND_DETECTION'),
                        children: [],
                        color: '#ff4830',
                        enable: true,
                        enablePop: true,
                        level: 3,
                    },
                    {
                        checked: 'event_type_Invade_checked',
                        unchecked: 'event_type_Invade_unchecked',
                        file: 'event_type_Invade',
                        value: 'INVADE',
                        name: Translate('IDCS_INVADE_DETECTION'),
                        children: ['INVADE', 'AOIENTRY', 'AOILEAVE'],
                        color: '#FFFF00',
                        enable: true,
                        enablePop: true,
                        level: 4,
                    },
                    {
                        checked: 'event_type_other_checked',
                        unchecked: 'event_type_other_unchecked',
                        file: 'event_type_other',
                        value: 'OTHER',
                        name: Translate('IDCS_MAINTENSIGN_ITEM_OTHERSYS'),
                        children: ['ITEMCARE', 'CROWDDENSITY', 'EXCEPTION', 'FIREPOINT', 'TEMPERATURE'],
                        color: '#8300ff',
                        enable: true,
                        enablePop: true,
                        level: 5,
                    },
                ],
            ],
            // 当前选中的事件
            eventList: [] as string[],
            // 事件模式索引
            eventIndex: 0,
            // 事件模式索引
            activeEventIndex: 0,
            // 事件列表提示文本
            eventTips: [
                [
                    Translate('IDCS_EVENT_NORMAL_ALL'),
                    [Translate('IDCS_MANUAL'), Translate('IDCS_SENSOR'), Translate('IDCS_MOTION_DETECTION'), systemCaps.supportPOS ? Translate('IDCS_POS') : '', Translate('IDCS_SCHEDULE')]
                        .filter((item) => !!item)
                        .join(', '),
                ].join(': '),
                [
                    Translate('IDCS_AI_ALL'),
                    [
                        Translate('IDCS_FACE_RECOGNITION'),
                        Translate('IDCS_VEHICLE_DETECTION'),
                        Translate('IDCS_BEYOND_DETECTION'),
                        Translate('IDCS_INVADE_DETECTION'),
                        Translate('IDCS_WATCH_DETECTION'),
                        Translate('IDCS_CROWD_DENSITY_DETECTION'),
                        Translate('IDCS_ABNORMAL_DISPOSE_WAY'),
                        Translate('IDCS_FIRE_POINT_DETECTION'),
                        Translate('IDCS_TEMPERATURE_DETECTION'),
                    ],
                ].join(': '),
            ],
            // UI1-B客户不支持选第二种模式
            isEventPopBtn: !systemCaps.IntelAndFaceConfigHide,
            // 是否显示POS输入框
            isPosInput: systemCaps.supportPOS,
            // POS关键字
            posKeyword: '',
            // SMD目标
            SMDTarget: '',
            forcedChange: false,
        })

        const changePlayMode = (value: string) => {
            pageData.value.isPlayModePop = false
            pageData.value.playMode = value
        }

        /**
         * @description 更改选中的事件
         * @param {string} value
         */
        const changeEvent = (value: string) => {
            const index = pageData.value.eventList.indexOf(value)
            if (index > -1) {
                // 最后一个禁止取消
                if (pageData.value.eventList.length > 1) {
                    pageData.value.eventList.splice(index, 1)
                }
            } else {
                pageData.value.eventList.push(value)
            }
        }

        /**
         * @description 设置选中的事件
         * @param {string[]} value
         */
        const setEvent = (value: string) => {
            let event = ''
            pageData.value.events[pageData.value.eventIndex]
                .filter((item) => item.enable)
                .some((item) => {
                    if (item.value === value || item.children.includes(value)) {
                        event = item.value
                        return true
                    } else {
                        return false
                    }
                })

            if (event) {
                if (['MOTION', 'SMDHUMAN', 'SMDVEHICLE'].includes(value)) {
                    pageData.value.SMDTarget = value
                }
                pageData.value.forcedChange = true
                pageData.value.eventList = [event]
            }
        }

        /**
         * @description 更改事件模式
         */
        const changeEventList = () => {
            pageData.value.eventIndex = pageData.value.activeEventIndex
            pageData.value.eventList = pageData.value.events[pageData.value.activeEventIndex].filter((item) => item.enable).map((item) => item.value)
            closeEventPop()
        }

        /**
         * @description 关闭弹窗
         */
        const closeEventPop = () => {
            pageData.value.isEventPop = false
        }

        watch(
            () => pageData.value.eventList,
            (newVal) => {
                const list = pageData.value.events[pageData.value.activeEventIndex]
                    .filter((item) => newVal.includes(item.value))
                    .sort((a, b) => b.level - a.level)
                    .map((item) => ({
                        value: item.value,
                        color: item.color,
                        children: item.children,
                        name: item.name,
                    }))
                const typeMask = Array.from(
                    new Set(
                        list
                            .map((item) => {
                                if (item.value === 'INTELLIGENT') {
                                    return TYPE_MASK_MAP[item.value]
                                }
                                if (item.children.length) {
                                    if (item.value === 'MOTION' && pageData.value.SMDTarget) {
                                        return TYPE_MASK_MAP[pageData.value.SMDTarget]
                                    } else {
                                        return item.children
                                            .map((child) => {
                                                return TYPE_MASK_MAP[child]
                                            })
                                            .flat()
                                    }
                                } else return TYPE_MASK_MAP[item.value]
                            })
                            .flat(),
                    ),
                )
                const eventList = Array.from(
                    new Set(
                        list
                            .map((item) => {
                                if (item.children.length && item.value !== 'INTELLIGENT') {
                                    return item.children
                                }
                                return [item.value]
                            })
                            .flat(),
                    ),
                )

                ctx.emit('change', list, typeMask, eventList, MODE_INDEX_TYPE_MAP[pageData.value.activeEventIndex], pageData.value.posKeyword, pageData.value.forcedChange)
                pageData.value.SMDTarget = ''
                pageData.value.forcedChange = false
            },
            {
                immediate: true,
                deep: true,
            },
        )

        onMounted(() => {
            pageData.value.eventList = pageData.value.events[0].map((item) => item.value)
        })

        ctx.expose({
            setEvent,
        })

        return {
            pageData,
            changeEventList,
            closeEventPop,
            changeEvent,
            changePlayMode,
        }
    },
})
