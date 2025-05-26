/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-17 15:38:48
 * @Description: 大回放/按事件搜索备份 - 属性选择器
 */
import { EVENT_TYPE_NAME_MAPPING } from '@/utils/const/record'
export default defineComponent({
    props: {
        /**
         * @property 勾选的属性值
         */
        modelValue: {
            type: Array as PropType<string[]>,
            required: true,
        },
        layout: {
            type: String as PropType<'selector' | 'filter'>,
            default: 'selector',
        },
    },
    emits: {
        'update:modelValue'(events: string[]) {
            return Array.isArray(events)
        },
        ready(events: string[]) {
            return Array.isArray(events)
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        // 所有的录像事件类型枚举（全集）
        const OPTIONS = [
            // 通用事件
            {
                eventTitle: Translate('IDCS_COMMON_EVENT'),
                eventList: [
                    {
                        value: 'motion',
                        label: EVENT_TYPE_NAME_MAPPING.motion,
                        children: ['smdPerson', 'smdCar'],
                    },
                    {
                        value: 'manual',
                        label: EVENT_TYPE_NAME_MAPPING.manual,
                    },
                    {
                        value: 'pos',
                        label: EVENT_TYPE_NAME_MAPPING.pos,
                    },
                    {
                        value: 'sensor',
                        label: EVENT_TYPE_NAME_MAPPING.sensor,
                    },
                ],
            },
            // 周界防范
            {
                eventTitle: Translate('IDCS_HUMAN_CAR_OTHER_BOUNDARY'),
                eventList: [
                    {
                        value: 'intrusion',
                        label: EVENT_TYPE_NAME_MAPPING.intrusion,
                    },
                    {
                        value: 'smartEntry',
                        label: EVENT_TYPE_NAME_MAPPING.smartEntry,
                    },
                    {
                        value: 'smartLeave',
                        label: EVENT_TYPE_NAME_MAPPING.smartLeave,
                    },
                    {
                        value: 'tripwire',
                        label: EVENT_TYPE_NAME_MAPPING.tripwire,
                    },
                ],
            },
            // 目标事件
            {
                eventTitle: Translate('IDCS_TARGET_EVENT'),
                eventList: [
                    {
                        value: 'vfd',
                        label: EVENT_TYPE_NAME_MAPPING.vfd,
                    },
                    {
                        value: 'faceMatch',
                        label: EVENT_TYPE_NAME_MAPPING.faceMatch,
                    },
                    {
                        value: 'plateMatch',
                        label: EVENT_TYPE_NAME_MAPPING.plateMatch,
                    },
                ],
            },
            // 异常行为
            {
                eventTitle: Translate('IDCS_EXCEPTION_BEHAVIOR'),
                eventList: [
                    {
                        value: 'loitering',
                        label: EVENT_TYPE_NAME_MAPPING.loitering,
                    },
                    {
                        value: 'pvd',
                        label: EVENT_TYPE_NAME_MAPPING.pvd,
                    },
                    {
                        value: 'threshold',
                        label: EVENT_TYPE_NAME_MAPPING.threshold,
                    },
                    {
                        value: 'cdd',
                        label: EVENT_TYPE_NAME_MAPPING.cdd,
                    },
                    {
                        value: 'osc',
                        label: EVENT_TYPE_NAME_MAPPING.osc,
                    },
                    {
                        value: 'asd',
                        label: EVENT_TYPE_NAME_MAPPING.asd,
                    },
                    {
                        value: 'avd',
                        label: EVENT_TYPE_NAME_MAPPING.avd,
                    },
                    {
                        value: 'smartCroedGather',
                        label: EVENT_TYPE_NAME_MAPPING.smartCroedGather,
                    },
                ],
            },
            // 热成像
            {
                eventTitle: Translate('IDCS_THERMAL_LIGHT'),
                eventList: [
                    {
                        value: 'firePoint',
                        label: EVENT_TYPE_NAME_MAPPING.firePoint,
                    },
                    {
                        value: 'temperatureAlarm',
                        label: EVENT_TYPE_NAME_MAPPING.temperatureAlarm,
                    },
                ],
            },
        ]

        const options = computed(() => {
            return OPTIONS.map((item) => {
                return {
                    eventTitle: item.eventTitle,
                    eventList: item.eventList.filter((event) => pageData.value.recTypeList.includes(event.value)),
                }
            }).filter((item) => item.eventList.length)
        })

        // 页面数据
        const pageData = ref({
            isPop: false,
            // 硬盘中存在的事件类型列表
            recTypeList: [] as string[],
            // 已选择的事件类型列表
            selectedRecTypeList: [] as string[],
        })

        const content = computed(() => {
            if (!prop.modelValue.length || prop.modelValue.length === pageData.value.recTypeList.length) {
                return Translate('IDCS_FULL')
            } else {
                return prop.modelValue.map((item) => (EVENT_TYPE_NAME_MAPPING[item] ? Translate(EVENT_TYPE_NAME_MAPPING[item]) : '')).join(';')
            }
        })

        /**
         * @description 开启弹窗时
         */
        const open = async () => {
            pageData.value.selectedRecTypeList = [...prop.modelValue]
        }

        /**
         * @description 获取设备硬盘中已存在的所有事件类型列表
         */
        const getRecTypeList = async () => {
            const result = await queryRecTypeList()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.recTypeList = $('content/recTypeList/item').map((item) => {
                    return item.text()
                })
                ctx.emit('ready', pageData.value.recTypeList)
            }
        }

        /**
         * @description 点击选择事件（每次点击每一项事件类型按钮都会触发change）
         */
        const change = (eventType: string) => {
            const index = pageData.value.selectedRecTypeList.indexOf(eventType)
            if (index === -1) {
                pageData.value.selectedRecTypeList.push(eventType)
            } else {
                pageData.value.selectedRecTypeList.splice(index, 1)
            }
        }

        /**
         * @description 重置（相当于全选）
         */
        const reset = () => {
            pageData.value.selectedRecTypeList = []
        }

        /**
         * @description 全选
         */
        const chooseAll = () => {
            pageData.value.selectedRecTypeList = [...pageData.value.recTypeList]
        }

        /**
         * @description 确认
         */
        const confirm = () => {
            pageData.value.isPop = false
            ctx.emit(
                'update:modelValue',
                pageData.value.selectedRecTypeList.filter((item) => pageData.value.recTypeList.includes(item)),
            )
        }

        onMounted(() => {
            getRecTypeList()
        })

        return {
            pageData,
            options,
            change,
            reset,
            chooseAll,
            confirm,
            open,
            content,
        }
    },
})
