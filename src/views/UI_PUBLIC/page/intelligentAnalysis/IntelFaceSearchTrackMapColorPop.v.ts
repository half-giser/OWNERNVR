/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-13 11:46:09
 * @Description: 智能分析 - 人脸搜索 - 轨迹 - 修改颜色
 */
export default defineComponent({
    props: {
        /**
         * @property 颜色选项
         */
        colors: {
            type: Array as PropType<string[]>,
            required: true,
        },
        /**
         * @property 字体颜色
         */
        fontColor: {
            type: String,
            required: true,
        },
        /**
         * @property 线条颜色
         */
        lineColor: {
            type: String,
            required: true,
        },
    },
    emits: {
        confirm(lineColor: string, fontColor: string) {
            return typeof lineColor === 'string' && typeof fontColor === 'string'
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const pageData = ref({
            lineColor: '',
            fontColor: '',
        })

        /**
         * @description 开启弹窗时重置选中值
         */
        const open = () => {
            pageData.value.lineColor = prop.lineColor
            pageData.value.fontColor = prop.fontColor
        }

        /**
         * @description 确认修改颜色
         */
        const confirm = () => {
            ctx.emit('confirm', pageData.value.lineColor, pageData.value.fontColor)
        }

        /**
         * @description 关闭弹窗 取消修改
         */
        const close = () => {
            ctx.emit('close')
        }

        return {
            pageData,
            open,
            confirm,
            close,
        }
    },
})
