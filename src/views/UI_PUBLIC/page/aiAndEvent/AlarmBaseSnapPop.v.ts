/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-08 13:37:46
 * @Description: 普通事件-联动-抓图
 */
import { type AlarmSnapPopDto } from '@/types/apiType/aiAndEvent'

export default defineComponent({
    props: {
        /**
         * @property {Array} 通道列表
         */
        data: {
            type: Array as PropType<AlarmSnapPopDto[]>,
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
        /**
         * @property {boolean} 选项是否排除当前通道
         */
        exclude: {
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
            snapList: [] as SelectOption<string, string>[],
            isDropdown: false,
            isPop: false,
        })

        const chlSourceList = computed(() => {
            const chlId = prop.data[prop.index]?.id || ''
            if (prop.exclude) {
                return pageData.value.snapList.filter((item) => item.value !== chlId)
            } else {
                return pageData.value.snapList
            }
        })

        const chlLinkList = computed(() => {
            const find = prop.data[prop.index]
            return find ? find.snap.chls.map((item) => item.value) : []
        })

        /**
         * @description 确认修改所有通道
         * @param {SelectOption<string, string>[]} event
         */
        const confirmAll = (event: SelectOption<string, string>[]) => {
            prop.data.forEach((item, index) => {
                ctx.emit('confirm', index, prop.exclude ? event.filter((chl) => chl.value !== item.id) : event)
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
            ctx.emit('confirm', prop.index, prop.data[prop.index].snap.chls)
        }

        /**
         * @description 获取抓图通道列表
         */
        const getSnapList = async () => {
            pageData.value.snapList = await buildSnapChlList()
        }

        onMounted(() => {
            getSnapList()
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
            chlSourceList,
            confirmAll,
            closeAll,
            confirm,
            close,
        }
    },
})
