/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 17:19:11
 * @Description: 穿梭框弹窗
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-08-19 10:13:14
 */
export default defineComponent({
    props: {
        headerTitle: {
            type: String,
            require: true,
            default: '',
        },
        sourceTitle: {
            type: String,
            require: true,
            default: '',
        },
        targetTitle: {
            type: String,
            require: true,
            default: '',
        },
        sourceData: {
            type: Array<any>,
            require: true,
            default: [],
        },
        linkedList: {
            type: Array<any>,
            require: true,
            default: [],
        },
    },
    emits: {
        confirm(e: any[]) {
            return e
        },
        close() {
            return true
        },
    },
    setup(props, ctx) {
        const data = ref<any[]>([])
        const chosedList = ref<any[]>([])

        /**
         * @description 保存数据
         */
        const verify = () => {
            const filterList = data.value.filter((item) => chosedList.value.includes(item.id))
            ctx.emit('confirm', filterList)
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }
        return {
            data,
            chosedList,
            props,
            verify,
            close,
        }
    },
})
