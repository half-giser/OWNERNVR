/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:37:25
 * @Description: 回放-事件类型视图
 */
import PlaybackEventSelector from './PlaybackEventSelector.vue'

export default defineComponent({
    components: {
        PlaybackEventSelector,
    },
    emits: {
        change(data: PlaybackEventList[], typeMask: string[], eventList: string[], posKeyword: string) {
            return Array.isArray(data) && Array.isArray(typeMask) && Array.isArray(eventList) && typeof posKeyword === 'string'
        },
        ready(eventList: string[]) {
            return Array.isArray(eventList)
        },
    },
    setup(_, ctx) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

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

        const EVENT_TYPE_COLOR_MAP = [
            {
                // 录像条底色（优先级最低，作为时间轴底色，不需要展示在录像条下方作为示例）
                value: 'otherType',
                color: '#005692',
                name: Translate('IDCS_NORMAL_RECORD'),
                level: 69,
                children: [],
            },
            // 按人车：###需要展示在录像条下方作为示例###
            {
                // 人
                value: 'human',
                color: '#A12534',
                name: Translate('IDCS_DETECTION_PERSON'),
                level: 1,
                children: ['human'],
            },
            {
                // 车、非
                value: 'vehicle',
                color: '#00AD45',
                name: Translate('IDCS_VEHICLE'),
                level: 2,
                hidden: !systemCaps.supportPlateMatch,
                children: ['vehicle', 'nonMotorizedVehicle'],
            },
            // 按类别：###需要展示在录像条下方作为示例###
            {
                // AI录像（优先级最低，作为时间轴底色）
                value: 'AI',
                color: '#00CCCC',
                name: Translate('IDCS_AI'),
                level: 3,
                children: [
                    'intrusion',
                    'smartEntry',
                    'smartLeave',
                    'tripwire',
                    'vfd',
                    'faceMatch',
                    'plateMatch',
                    'loitering',
                    'pvd',
                    'threshold',
                    'cdd',
                    'osc',
                    'asd',
                    'avd',
                    'smartCroedGather',
                    'cpc',
                    'firePoint',
                    'temperatureAlarm',
                    'schedule',
                ],
            },
            {
                // 通用录像
                value: 'general',
                color: '#A12534',
                name: Translate('IDCS_GENERAL'),
                level: 4,
                children: ['motion', 'smdPerson', 'smdCar', 'manual', 'pos', 'sensor'],
            },
            // 按事件：###需要展示在录像条下方作为示例###
            {
                // 手动
                value: 'manual',
                color: '#00CC00',
                name: Translate('IDCS_MANUAL'),
                level: 5,
                children: ['manual'],
            },
            {
                // 传感器
                value: 'sensor',
                color: '#CC0000',
                name: Translate('IDCS_SENSOR'),
                level: 6,
                children: ['sensor'],
            },
            {
                // 周界防范（区域入侵、区域进入、区域离开、越界）
                value: 'boundary',
                color: '#00CCCC',
                name: Translate('IDCS_HUMAN_CAR_OTHER_BOUNDARY'),
                children: ['intrusion', 'smartEntry', 'smartLeave', 'tripwire'],
                level: 7,
            },
            {
                // 目标事件（人脸侦测、人脸识别、车牌识别）
                value: 'target',
                color: '#00CCCC',
                name: Translate('IDCS_TARGET_EVENT'),
                children: ['vfd', 'faceMatch', 'plateMatch'],
                level: 8,
            },
            {
                // 异常行为（徘徊检测、停车检测、统计阈值、人群密度检测、物品遗留与看护、声音异常、视频异常、人员聚集）
                value: 'abnormal',
                color: '#00CCCC',
                name: Translate('IDCS_EXCEPTION_BEHAVIOR'),
                children: ['loitering', 'pvd', 'threshold', 'cdd', 'osc', 'asd', 'avd', 'smartCroedGather'],
                level: 9,
            },
            {
                // 热成像（火点检测、温度检测）
                value: 'thermal',
                color: '#00CCCC',
                name: Translate('IDCS_THERMAL_LIGHT'),
                children: ['firePoint', 'temperatureAlarm'],
                level: 10,
            },
            {
                // 移动侦测（motion、smdPerson、smdCar）
                value: 'motion',
                color: '#CCCC00',
                name: Translate('IDCS_MOTION_DETECTION'),
                children: ['motion', 'smdPerson', 'smdCar'],
                level: 11,
            },
            {
                // pos
                value: 'pos',
                color: '#6900CC',
                name: Translate('IDCS_POS'),
                level: 12,
                hidden: !systemCaps.supportPOS,
                children: ['pos'],
            },
        ]

        const allEventList = EVENT_TYPE_COLOR_MAP.map((item) => item.children).flat()

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
            isFilterPop: false,
            filterType: 'byCategory',
            filterTypeList: [
                {
                    value: 'byEvent',
                    label: Translate('IDCS_BY_EVENT'),
                    children: EVENT_TYPE_COLOR_MAP.filter((item) => ['manual', 'sensor', 'boundary', 'target', 'abnormal', 'thermal', 'motion', 'pos'].includes(item.value)).sort(
                        (a, b) => a.level - b.level,
                    ),
                },
                {
                    value: 'byCategory',
                    label: Translate('IDCS_BY_CATEGORY'),
                    children: EVENT_TYPE_COLOR_MAP.filter((item) => ['AI', 'otherType'].includes(item.value)).sort((a, b) => a.level - b.level),
                },
            ],
            // 是否显示事件弹窗
            isEventPop: false,
            // 常规回放事件列表
            normalEvent: [
                {
                    name: Translate('IDCS_DETECTION_PERSON'),
                    value: 'human',
                    children: ['human'],
                    selected: true,
                    icon: 'personTypeIcon',
                },
                {
                    name: Translate('IDCS_VEHICLE'),
                    value: 'vehicle',
                    children: ['vehicle', 'nonMotorizedVehicle'],
                    selected: true,
                    icon: 'vehicleTypeIcon',
                },
            ],
            // 当前选中的事件
            eventList: [] as string[],
            // 是否显示POS输入框
            isPosInput: systemCaps.supportPOS,
            // POS关键字
            posKeyword: '',
            // SMD目标
            // SMDTarget: '',
        })

        const changePlayMode = (value: string) => {
            pageData.value.isPlayModePop = false
            pageData.value.playMode = value
        }

        /**
         * @description 关闭弹窗
         */
        const closeEventPop = () => {
            pageData.value.isEventPop = false
        }

        watch(
            () => pageData.value.playMode,
            () => {
                changeEvent()
            },
        )

        watch(
            () => pageData.value.eventList,
            () => {
                changeEvent()
            },
            {
                deep: true,
            },
        )

        watch(
            () => JSON.stringify(pageData.value.normalEvent),
            () => {
                changeEvent()
            },
        )

        watch(
            () => pageData.value.filterType,
            () => {
                changeEvent()
            },
        )

        const changeEvent = () => {
            const eventColorList = EVENT_TYPE_COLOR_MAP.filter((item) => {
                if (pageData.value.playMode === 'normal') {
                    return ['human', 'vehicle', 'otherType'].includes(item.value)
                } else {
                    if (pageData.value.filterType === 'byEvent') {
                        return ['manual', 'sensor', 'boundary', 'target', 'abnormal', 'thermal', 'motion', 'pos', 'otherType'].includes(item.value)
                    } else {
                        return ['AI', 'general', 'otherType'].includes(item.value)
                    }
                }
            })
                .filter((item) => !item.hidden)
                .sort((a, b) => b.level - a.level)
            const eventList = eventColorList
                .map((item) => {
                    if (pageData.value.playMode === 'normal') {
                        if (pageData.value.normalEvent.some((event) => event.selected && event.value === item.value)) {
                            return item.children
                        }
                        return []
                    } else {
                        if (!pageData.value.eventList.length) {
                            return item.children
                        }
                        return item.children.filter((event) => pageData.value.eventList.includes(event))
                    }
                })
                .flat()
            const typeMask = eventList.map((item) => (TYPE_MASK_MAP[item] ? TYPE_MASK_MAP[item] : [])).flat()

            ctx.emit('change', eventColorList, typeMask, eventList, pageData.value.posKeyword)
        }

        onMounted(() => {
            ctx.emit('ready', allEventList)
            changeEvent()
        })

        return {
            pageData,
            closeEventPop,
            changeEvent,
            changePlayMode,
            systemCaps,
        }
    },
})
