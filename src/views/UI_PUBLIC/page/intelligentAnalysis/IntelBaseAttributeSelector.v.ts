/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-05 10:13:11
 * @Description: 智能分析 属性选择器
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 10:17:06
 */
export default defineComponent({
    props: {
        /**
         * @property 选项类型 ['face', 'vehicle']
         */
        range: {
            type: Array as PropType<string[]>,
            default: () => ['vehicle'],
        },
        /**
         * @property {Array(string[], string[])} 车辆选项 人脸选项
         */
        modelValue: {
            type: Array as PropType<string[][]>,
            default: () => [],
        },
    },
    emits: {
        'update:modelValue'(selection: string[][]) {
            return Array.isArray(selection)
        },
        ready(eventMap: Record<string, string>) {
            return !!eventMap
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
            // 是否显示选项框
            isPop: false,
            // 人脸选项
            personOptions: [
                {
                    label: '',
                    value: '',
                },
            ],
            // 车辆选项
            vehicleOptions: [
                {
                    label: Translate('IDCS_DETECTION_VEHICLE'),
                    value: 'car',
                },
                {
                    label: Translate('IDCS_NON_VEHICLE'),
                    value: 'motor',
                },
            ],
        })

        // 勾选的车辆选项
        const selectedVehicle = ref<string[]>([])

        // 勾选的人脸选项
        const selectedPerson = ref<string[]>([])

        // 选项框回显内容
        const content = computed(() => {
            const modelValueLength = prop.modelValue.flat().length
            if (!modelValueLength || modelValueLength === pageData.value.vehicleOptions.length) {
                return Translate('IDCS_ATTRIBUTE') + `(${Translate('IDCS_FULL')})`
            } else return Translate('IDCS_ATTRIBUTE') + `(${Translate('IDCS_PART')})`
        })

        /**
         * @description 确认
         */
        const confirm = () => {
            pageData.value.isPop = false
            if (!selectedVehicle.value.length && !selectedPerson.value.length) {
                ctx.emit('update:modelValue', [pageData.value.vehicleOptions.map((item) => item.value), pageData.value.personOptions.map((item) => item.value)])
            } else {
                ctx.emit('update:modelValue', [selectedVehicle.value, selectedPerson.value])
            }
        }

        /**
         * @description 重置
         */
        const reset = () => {
            selectedVehicle.value = []
        }

        onMounted(() => {
            const mapping: Record<string, string> = {}
            pageData.value.vehicleOptions.map((item) => {
                mapping[item.value] = mapping[item.label]
            })
            ctx.emit('ready', mapping)
            confirm()
        })

        return {
            pageData,
            content,
            selectedVehicle,
            selectedPerson,
            reset,
            confirm,
        }
    },
})
