/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-05 10:22:52
 * @Description: 智能分析 事件选择器
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 10:23:07
 */
export default defineComponent({
    props: {
        /**
         * @property
         */
        mode: {
            type: String,
            default: 'radio',
        },
        /**
         * @property face, vehicle
         */
        range: {
            type: Array as PropType<string[]>,
            default: () => ['face'],
        },
        /**
         * @property
         */
        modelValue: {
            type: Array as PropType<string[]>,
            default: () => [],
        },
    },
    emits: {
        'update:modelValue'(selection: string[]) {
            return Array.isArray(selection)
        },
        ready(eventMap: Record<string, string>) {
            return !!eventMap
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        // 事件与显示文本的映射
        const EVENT_MAPPING: Record<string, string> = {
            faceDetection: Translate('IDCS_FACE_DETECTION'),
            faceMatchWhiteList: Translate('IDCS_FACE_MATCH') + '-' + Translate('IDCS_SUCCESSFUL_RECOGNITION'),
            faceMatchStranger: Translate('IDCS_FACE_MATCH') + '-' + Translate('IDCS_GROUP_STRANGER'),
            intrusion: Translate('IDCS_INVADE_DETECTION'),
            tripwire: Translate('IDCS_BEYOND_DETECTION'),
            passLine: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
            plateDetection: Translate('IDCS_PLATE_DETECTION'),
            plateMatchWhiteList: Translate('IDCS_PLATE_MATCH') + '-' + Translate('IDCS_SUCCESSFUL_RECOGNITION'),
            plateMatchStranger: Translate('IDCS_PLATE_MATCH') + '-' + Translate('IDCS_STRANGE_PLATE'),
        }

        const pageData = ref({
            // 是否显示选项框
            isPop: false,
            // 人脸选项
            faceOptions: [
                {
                    value: 'faceDetection',
                    hidden: false,
                },
                {
                    value: 'faceMatchWhiteList',
                    hidden: !systemCaps.supportFaceMatch,
                },
                {
                    value: 'faceMatchStranger',
                    hidden: !systemCaps.supportFaceMatch,
                },
                {
                    value: 'intrusion',
                    hidden: false,
                },
                {
                    value: 'tripwire',
                    hidden: false,
                },
                {
                    value: 'passLine',
                    hidden: false,
                },
            ],
            // 车辆选项
            vehicleOptions: [
                {
                    value: 'intrusion',
                    hidden: false,
                },
                {
                    value: 'tripwire',
                    hidden: false,
                },
                {
                    value: 'passLine',
                    hidden: false,
                },
                {
                    value: 'plateDetection',
                    hidden: !systemCaps.supportPlateMatch,
                },
                {
                    value: 'plateMatchWhiteList',
                    hidden: !systemCaps.supportPlateMatch,
                },
                {
                    value: 'plateMatchStranger',
                    hidden: !systemCaps.supportPlateMatch,
                },
            ],
        })

        // 排除重复项和隐藏项后的选项
        const options = computed(() => {
            const list: string[] = []
            if (prop.range.includes('face')) {
                pageData.value.faceOptions.forEach((item) => {
                    if (!item.hidden) {
                        list.push(item.value)
                    }
                })
            }
            if (prop.range.includes('vehicle')) {
                pageData.value.vehicleOptions.forEach((item) => {
                    if (!item.hidden) {
                        list.push(item.value)
                    }
                })
            }
            return Array.from(new Set(list)).map((value) => {
                return {
                    label: EVENT_MAPPING[value],
                    value,
                }
            })
        })

        // 选项框回显的内容
        const content = computed(() => {
            if (!prop.modelValue.length) {
                return Translate('IDCS_EVENT') + `(${Translate('IDCS_NULL')})`
            } else return prop.modelValue.map((item) => EVENT_MAPPING[item]).join('; ')
        })

        /**
         * @description 选项切换
         * @param {string} e
         */
        const changeRadio = (e: string | number | boolean | undefined) => {
            ctx.emit('update:modelValue', [e as string])
        }

        onMounted(() => {
            ctx.emit('ready', EVENT_MAPPING)
        })

        return {
            pageData,
            options,
            content,
            changeRadio,
        }
    },
})
