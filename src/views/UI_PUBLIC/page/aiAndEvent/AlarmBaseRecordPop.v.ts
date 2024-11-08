/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-08 13:37:33
 * @Description: 普通事件-联动-录像
 */
import { type AlarmRecordPopDto } from '@/types/apiType/aiAndEvent'

export default defineComponent({
    props: {
        data: {
            type: Array as PropType<AlarmRecordPopDto[]>,
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
            recordList: [] as SelectOption<string, string>[],
            isDropdown: false,
            isPop: false,
        })

        const chlLinkList = computed(() => {
            const find = prop.data[prop.index]
            return find ? find.record.chls.map((item) => item.value) : []
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
            ctx.emit('confirm', prop.index, prop.data[prop.index].record.chls)
        }

        const getRecordList = async () => {
            pageData.value.recordList = await buildRecordChlList()
        }

        onMounted(() => {
            getRecordList()
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
