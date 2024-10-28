/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-24 14:39:41
 * @Description: 隐私政策弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-16 11:04:58
 */
export default defineComponent({
    props: {
        /**
         * @property 是否显示同意勾选框
         */
        forceAllow: {
            type: Boolean,
            default: true,
        },
    },
    emits: {
        close() {
            return true
        },
    },
    setup(_prop, ctx) {
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
