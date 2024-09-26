/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-24 14:39:41
 * @Description: 隐私政策弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-24 14:46:54
 */
export default defineComponent({
    emits: {
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const pageData = ref({
            // 是否同意政策
            isAllowPrivacy: false,
        })

        /**
         * @description 关闭弹窗
         */
        const closePrivacy = () => {
            ctx.emit('close')
        }

        return {
            pageData,
            closePrivacy,
        }
    },
})
