/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-28 12:02:37
 * @Description: AI - 通道选择器
 */
export default defineComponent({
    props: {
        height: {
            type: Number,
            default: 140,
        },
        list: {
            type: Array as PropType<{ id: string; name: string }[]>,
            default: () => [],
        },
        modelValue: {
            type: String,
            required: true,
        },
    },
    emits: {
        'update:modelValue'(value: string) {
            return typeof value === 'string'
        },
        change(value: string) {
            return typeof value === 'string'
        },
    },
    setup(prop, { emit }) {
        const pageData = ref({
            isPop: false,
        })

        const change = (value: string) => {
            emit('update:modelValue', value)
            emit('change', value)
            pageData.value.isPop = false
        }

        const content = computed(() => {
            return prop.list.find((item) => item.id === prop.modelValue)?.name || ''
        })

        return {
            pageData,
            change,
            content,
        }
    },
})
