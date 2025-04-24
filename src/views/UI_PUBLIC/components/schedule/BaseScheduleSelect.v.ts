/*
 * @Date: 2025-04-18 15:41:51
 * @Description: 排程选择器，包含排程管理选项
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
export default defineComponent({
    props: {
        /**
         * @property 排程ID
         */
        modelValue: {
            type: String,
            required: true,
        },
        /**
         * @property 排程列表数据
         */
        options: {
            type: Array as PropType<SelectOption<string, string>[]>,
            required: true,
        },
        /**
         * @property 是否禁用
         */
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    emits: {
        'update:modelValue'(e: string) {
            return typeof e === 'string'
        },
        change(e: string) {
            return typeof e === 'string'
        },
        edit() {
            return true
        },
    },
    setup(props, ctx) {
        const { Translate } = useLangStore()
        const SCHEDULE_MANAGE = 'SCHEDULE_MANAGE'

        // 排程列表选项
        const scheduleList = computed(() => {
            return props.options.concat([
                {
                    value: SCHEDULE_MANAGE,
                    label: Translate('IDCS_SCHEDULE_MANAGE'),
                },
            ])
        })

        const oldValue = ref('')

        /**
         * @description 打开选择器，记录原值
         * @param {boolean} type
         */
        const open = (type: boolean) => {
            if (type) {
                oldValue.value = props.modelValue
            }
        }

        /**
         * @description 数据更新/打开排程管理
         * @param {string} value
         */
        const update = (value: string) => {
            if (value === SCHEDULE_MANAGE) {
                ctx.emit('edit')
                ctx.emit('update:modelValue', value)
                nextTick(() => {
                    ctx.emit('update:modelValue', oldValue.value)
                })
            } else {
                ctx.emit('update:modelValue', value)
                ctx.emit('change', value)
            }
        }

        return {
            scheduleList,
            open,
            update,
        }
    },
})
