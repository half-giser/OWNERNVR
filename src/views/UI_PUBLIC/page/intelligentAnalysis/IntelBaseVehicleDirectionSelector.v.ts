/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-06 11:18:24
 * @Description: 智能分析 - 进出口方向 选择框
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-06 16:37:43
 */
export default defineComponent({
    props: {
        /**
         * @property 勾选值
         */
        modelValue: {
            type: Array as PropType<number[]>,
            required: true,
        },
    },
    emits: {
        'update:modelValue'(value: number[]) {
            return Array.isArray(value)
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
            // 是否打开选项框
            isPop: false,
            // 进出口方向选项值
            options: [
                {
                    label: Translate('IDCS_VEHICLE_IN'),
                    value: 1,
                },
                {
                    label: Translate('IDCS_VEHICLE_OUT'),
                    value: 2,
                },
            ],
        })

        // 勾选的值
        const selected = ref<number[]>([])

        // 占位显示内容
        const content = computed(() => {
            if (prop.modelValue.length === pageData.value.options.length) {
                return `${Translate('IDCS_VEHICLE_DIRECTION')} (${Translate('IDCS_FULL')})`
            } else if (!prop.modelValue.length) {
                return Translate('IDCS_VEHICLE_DIRECTION')
            } else {
                return pageData.value.options
                    .filter((item) => {
                        return prop.modelValue.includes(item.value)
                    })
                    .map((item) => item.label)
                    .join('; ')
            }
        })

        /**
         * @description 重置
         */
        const reset = () => {
            selected.value = []
        }

        /**
         * @description 确认
         */
        const confirm = () => {
            if (!selected.value.length) {
                ctx.emit(
                    'update:modelValue',
                    pageData.value.options.map((item) => item.value),
                )
            } else {
                ctx.emit('update:modelValue', selected.value)
            }
        }

        // 选项框打开时 更新选项框勾选项
        watch(
            () => pageData.value.isPop,
            (value) => {
                if (value) {
                    selected.value = prop.modelValue
                }
            },
        )

        onMounted(() => {
            // 如果表单没有值，则创造初始值
            if (!prop.modelValue.length) {
                confirm()
            }
        })

        return {
            pageData,
            selected,
            confirm,
            reset,
            content,
        }
    },
})
