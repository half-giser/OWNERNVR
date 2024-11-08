/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-08 13:37:15
 * @Description: 普通事件-联动-报警输出
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-11-08 13:39:42
 */
import { type AlarmOutPopDto } from '@/types/apiType/aiAndEvent'

export default defineComponent({
    props: {
        data: {
            type: Array as PropType<AlarmOutPopDto[]>,
            required: true,
        },
        index: {
            type: Number,
            required: true,
        },
        visible: {
            type: Boolean,
            default: false,
        },
    },
    emits: {
        confirm(index: number, data: SelectOption<string, string>[]) {
            return typeof Array.isArray(index) && Array.isArray(data)
        },
    },
    setup(prop, ctx) {
        const pageData = ref({
            alarmOutList: [] as SelectOption<string, string>[],
            isDropdown: false,
            isPop: false,
        })

        const chlLinkList = computed(() => {
            const find = prop.data[prop.index]
            return find ? find.alarmOut.alarmOuts.map((item) => item.value) : []
        })

        const confirmAll = (event: SelectOption<string, string>[]) => {
            prop.data.forEach((_item, index) => {
                ctx.emit('confirm', index, event)
            })
            pageData.value.isDropdown = false
        }

        const closeAll = () => {
            pageData.value.isDropdown = false
        }

        const confirm = (event: SelectOption<string, string>[]) => {
            ctx.emit('confirm', prop.index, event)
        }

        const close = () => {
            ctx.emit('confirm', prop.index, prop.data[prop.index].alarmOut.alarmOuts)
        }

        const getAlarmOutList = async () => {
            pageData.value.alarmOutList = await buildAlarmOutChlList()
        }

        onMounted(() => {
            getAlarmOutList()
        })

        watch(
            () => prop.visible,
            (visible) => {
                pageData.value.isPop = visible
            },
        )

        return {
            pageData,
            chlLinkList,
            confirmAll,
            closeAll,
            confirm,
            close,
        }
    },
})
