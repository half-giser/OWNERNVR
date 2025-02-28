/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:37:25
 * @Description: 回放-事件类型视图
 */
export default defineComponent({
    props: {
        /**
         * @property
         */
        smdRecLogPlay: {
            type: String,
            default: '',
        },
    },
    emits: {
        change(data: PlaybackEventList[], typeMask: string[], eventList: string[], modeType: string, posKeyword: string) {
            return Array.isArray(data) && Array.isArray(typeMask) && Array.isArray(eventList) && typeof modeType === 'string' && typeof posKeyword === 'string'
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        // 事件模式索引与key值的映射
        const MODE_INDEX_TYPE_MAP: Record<number, string> = {
            0: 'modeOne',
            1: 'modeTwo',
        }

        // xml下发字段和websocket下发字段的映射
        const TYPE_MASK_MAP: Record<string, string[]> = {
            MANUAL: ['manual'],
            SCHEDULE: ['schedule'],
            MOTION: ['motion'],
            SMDHUMAN: ['SMDHuman'],
            SMDVEHICLE: ['SMDVehicle'],
            SENSOR: ['sensor'],
            TRIPWIRE: ['tripwire'],
            INVADE: ['perimeter'],
            FACEDETECTION: ['vfd'],
            POS: ['pos'],
            FACEMATCH: ['face_verity'],
            AOIENTRY: ['smart_aoi_entry'],
            AOILEAVE: ['smart_aoi_leave'],
            VEHICLE: ['smart_plate_verity'],
            NORMALALL: ['manual', 'schedule', 'motion', 'SMDHuman', 'SMDVehicle', 'sensor', 'pos'],
            OTHER: ['osc', 'avd', 'cdd', 'smart_pass_line', 'smart_fire_point', 'smart_temperature'],
            ITEMCARE: ['osc'],
            CROWDDENSITY: ['cdd'],
            EXCEPTION: ['avd'],
            FIREPOINT: ['smart_fire_point'],
            TEMPERATURE: ['smart_temperature'],
            INTELLIGENT: [
                'osc',
                'avd',
                'cdd',
                'smart_pass_line',
                'vfd',
                'face_verity',
                'smart_plate_verity',
                'tripwire',
                'perimeter',
                'smart_aoi_entry',
                'smart_aoi_leave',
                'smart_fire_point',
                'smart_temperature',
            ],
        }

        const pageData = ref({
            // 是否显示事件弹窗
            isEventPop: false,
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
            isEventPopBtn: systemCaps.IntelAndFaceConfigHide,
            // 是否显示POS输入框
            isPosInput: systemCaps.supportPOS,
            // POS关键字
            posKeyword: '',
        })

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
                                    if (item.value === 'MOTION' && prop.smdRecLogPlay) {
                                        return TYPE_MASK_MAP[prop.smdRecLogPlay]
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

                ctx.emit('change', list, typeMask, eventList, MODE_INDEX_TYPE_MAP[pageData.value.activeEventIndex], pageData.value.posKeyword)
            },
            {
                immediate: true,
                deep: true,
            },
        )

        onMounted(() => {
            pageData.value.eventList = pageData.value.events[0].map((item) => item.value)
        })

        return {
            pageData,
            changeEventList,
            closeEventPop,
            changeEvent,
        }
    },
})
