/*
 * @Date: 2025-05-08 15:58:58
 * @Description: 停车场 remark弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
export default defineComponent({
    emits: {
        confirm(remark: string) {
            return typeof remark === 'string'
        },
        close() {
            return true
        },
    },
    setup(_prop, ctx) {
        const formRef = useFormRef()

        const formData = ref({
            remark: '',
        })

        const formatRemark = (str: string) => {
            return str.replace(/[:;]/g, '')
        }

        const confirm = () => {
            ctx.emit('confirm', formData.value.remark)
        }

        return {
            formRef,
            formData,
            formatRemark,
            confirm,
        }
    },
})
