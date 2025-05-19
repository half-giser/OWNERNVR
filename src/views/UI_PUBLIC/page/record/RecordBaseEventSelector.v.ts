/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-17 15:38:48
 * @Description: 大回放/按事件搜索备份 - 属性选择器
 */
import { type EventTypeItem, EVENT_TYPE_NAME_MAPPING } from '@/utils/const/record'
export default defineComponent({
    props: {
        /**
         * @property 勾选的属性值
         */
        modelValue: {
            type: Array as PropType<EventTypeItem[]>,
            default: () => [],
            required: true,
        },
    },
    emits: {
        'update:modelValue'(events: EventTypeItem[]) {
            return Array.isArray(events)
        },
    },
    setup(prop, ctx) {
        type OptionListItem = {
            eventTitle: string
            eventList: EventTypeItem[]
        }
        // 所有的录像事件类型枚举（全集）
        const OPTIONS: OptionListItem[] = [
            // 通用事件
            {
                eventTitle: 'IDCS_COMMON_EVENT',
                eventList: [
                    {
                        value: 'motion',
                        label: EVENT_TYPE_NAME_MAPPING.motion,
                        children: ['smdPerson', 'smdCar'],
                    },
                    {
                        value: 'smdPerson',
                        label: EVENT_TYPE_NAME_MAPPING.motion,
                        belongTo: 'motion',
                    },
                    {
                        value: 'smdCar',
                        label: EVENT_TYPE_NAME_MAPPING.motion,
                        belongTo: 'motion',
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
                eventTitle: 'IDCS_HUMAN_CAR_OTHER_BOUNDARY',
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
                eventTitle: 'IDCS_TARGET_EVENT',
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
                eventTitle: 'IDCS_EXCEPTION_BEHAVIOR',
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
                eventTitle: 'IDCS_THERMAL_LIGHT',
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

        // 页面数据
        const pageData = ref({
            // 是否打开事件类型筛选框
            isPop: false,
            // 硬盘中存在的事件类型列表
            recTypeList: [] as string[],
            // 已选择的事件类型列表
            selectedRecTypeList: [] as string[],
        })

        /**
         * @description 每次打开事件筛选框都会调用open方法
         */
        const open = () => {
            pageData.value.isPop = true
            pageData.value.selectedRecTypeList = []
            prop.modelValue.forEach((item: EventTypeItem) => {
                pageData.value.selectedRecTypeList.push(item.value)
            })
            getRecTypeList()
        }

        /**
         * @description 获取设备硬盘中已存在的所有事件类型列表
         */
        const getRecTypeList = async () => {
            const result = await queryRecTypeList()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.recTypeList = []
                const $recTypeListContent = queryXml(queryXml(result)('content')[0].element)
                $recTypeListContent('recTypeList/item').forEach((item) => {
                    const recType = item.text()
                    pageData.value.recTypeList.push(recType)
                })
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
            pageData.value.selectedRecTypeList = []
            pageData.value.recTypeList.forEach((eventType: string) => {
                pageData.value.selectedRecTypeList.push(eventType)
            })
        }

        /**
         * @description 确认
         */
        const confirm = () => {
            const tempEvents = [] as EventTypeItem[]
            OPTIONS.forEach((item1: OptionListItem) => {
                item1.eventList.forEach((item2: EventTypeItem) => {
                    if (!item2.belongTo && pageData.value.selectedRecTypeList.includes(item2.value)) {
                        tempEvents.push(item2)
                    }
                })
            })
            ctx.emit('update:modelValue', tempEvents)
            pageData.value.isPop = false
        }

        // 根据“所有事件类型全集”和“硬盘中存在的事件类型”计算出弹框要展示的事件类型选项（因为界面有展示顺序的要求，所以需要提前定义好事件类型全集来约束展示顺序）
        const options = computed(() => {
            const tempOptions = JSON.parse(JSON.stringify(OPTIONS))
            tempOptions.forEach((item1: OptionListItem) => {
                const tempEventList = [] as EventTypeItem[]
                item1.eventList.forEach((item2: EventTypeItem) => {
                    if (!item2.belongTo && pageData.value.recTypeList.includes(item2.value)) {
                        tempEventList.push(item2)
                    }
                })
                item1.eventList = tempEventList
            })
            return tempOptions
        })

        onMounted(() => {})

        ctx.expose({
            open,
        })

        return {
            pageData,
            options,
            change,
            reset,
            chooseAll,
            confirm,
        }
    },
})
