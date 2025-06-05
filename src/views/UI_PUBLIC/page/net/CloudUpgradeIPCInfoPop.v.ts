/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-13 15:54:18
 * @Description: 查看ipc升级信息详情
 */
export default defineComponent({
    props: {
        /**
         * @property ipc升级信息列表
         */
        data: {
            type: Array as PropType<NetIpcUpgradeInfoList[]>,
            required: true,
        },
        /**
         * @property 当前ipc升级信息索引
         */
        activeIndex: {
            type: Number,
            required: true,
        },
    },
    emits: {
        close() {
            return true
        },
        change(index: number) {
            return !isNaN(index)
        },
    },
    setup(prop, ctx) {
        /**
         * @description 上一条
         */
        const prev = () => {
            if (prop.activeIndex > 0) {
                ctx.emit('change', prop.activeIndex - 1)
            }
        }

        /**
         * @description 下一条
         */
        const next = () => {
            if (prop.activeIndex < prop.data.length - 1) {
                ctx.emit('change', prop.activeIndex + 1)
            }
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 当前项
         */
        const item = computed(() => {
            if (prop.data[prop.activeIndex]) return prop.data[prop.activeIndex] as NetIpcUpgradeInfoList
            return new NetIpcUpgradeInfoList()
        })

        return {
            prev,
            next,
            close,
            item,
        }
    },
})
