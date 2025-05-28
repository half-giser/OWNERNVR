/*
 * @Date: 2025-05-12 10:10:13
 * @Description: 新增通道 - 编辑通道号弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
export default defineComponent({
    props: {
        data: {
            type: Object as PropType<ChannelQuickAddDto>,
            required: true,
        },
        options: {
            type: Array as PropType<SelectOption<number, number>[]>,
            required: true,
        },
    },
    emits: {
        confirm(chlNum: number) {
            return typeof chlNum === 'number'
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const formRef = useFormRef()

        const formData = ref({
            chlNum: 0,
        })

        const open = () => {
            formData.value.chlNum = prop.data.chlNum
        }

        const confirm = () => {
            ctx.emit('confirm', formData.value.chlNum)
        }

        const close = () => {
            ctx.emit('close')
        }

        return {
            formRef,
            formData,
            open,
            confirm,
            close,
        }
    },
})
