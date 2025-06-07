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
            type: Array as PropType<NetCloudUpgradeIPCInfoList[]>,
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
    },
    setup(prop, ctx) {
        const pageData = ref({
            index: 0,
        })

        /**
         * @description 上一条
         */
        const prev = () => {
            if (pageData.value.index > 0) {
                pageData.value.index -= 1
            }
        }

        /**
         * @description 下一条
         */
        const next = () => {
            if (pageData.value.index < prop.data.length - 1) {
                pageData.value.index += 1
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
            if (prop.data[pageData.value.index]) return prop.data[pageData.value.index]
            return new NetCloudUpgradeIPCInfoList()
        })

        const open = () => {
            pageData.value.index = prop.activeIndex
        }

        return {
            prev,
            next,
            close,
            item,
            open,
            pageData,
        }
    },
})
