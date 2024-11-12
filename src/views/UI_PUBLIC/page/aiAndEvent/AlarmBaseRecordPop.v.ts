/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-08 13:37:33
 * @Description: 普通事件-联动-录像
 */
import { type AlarmRecordPopDto } from '@/types/apiType/aiAndEvent'

export default defineComponent({
    props: {
        /**
         * @property {Array} 通道列表
         */
        data: {
            type: Array as PropType<AlarmRecordPopDto[]>,
            required: true,
        },
        /**
         * @property {number} 通道索引
         */
        index: {
            type: Number,
            required: true,
        },
        /**
         * @property {boolean} 打开弹窗
         */
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

        /**
         * @description 确认修改所有通道
         * @param {SelectOption<string, string>[]} event
         */
        const confirmAll = (event: SelectOption<string, string>[]) => {
            prop.data.forEach((_item, index) => {
                ctx.emit('confirm', index, event)
            })
            pageData.value.isDropdown = false
        }

        /**
         * @description 取消所有修改
         */
        const closeAll = () => {
            pageData.value.isDropdown = false
        }

        /**
         * @description 确认修改当前通道
         * @param {SelectOption<string, string>[]} event
         */
        const confirm = (event: SelectOption<string, string>[]) => {
            ctx.emit('confirm', prop.index, event)
        }

        /**
         * @description 取消修改当前通道
         */
        const close = () => {
            ctx.emit('confirm', prop.index, prop.data[prop.index].record.chls)
        }

        /**
         * @description 获取录像通道列表
         */
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
