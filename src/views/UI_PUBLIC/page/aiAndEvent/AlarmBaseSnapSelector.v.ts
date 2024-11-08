/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-06 17:41:15
 * @Description: AI-联动-抓图-选择面板
 */
export default defineComponent({
    props: {
        modelValue: {
            type: Array as PropType<SelectOption<string, string>[]>,
            required: true,
        },
    },
    emits: {
        'update:modelValue'(e: SelectOption<string, string>[]) {
            return Array.isArray(e)
        },
    },
    setup(_prop, ctx) {
        const pageData = ref({
            isPop: false,
            snapList: [] as SelectOption<string, string>[],
        })

        const getSnapList = async () => {
            pageData.value.snapList = await buildSnapChlList()
        }

        const confirm = (option: SelectOption<string, string>[]) => {
            ctx.emit('update:modelValue', option)
            pageData.value.isPop = false
        }

        const close = () => {
            pageData.value.isPop = false
        }

        onMounted(() => {
            getSnapList()
        })

        return {
            pageData,
            confirm,
            close,
        }
    },
})
