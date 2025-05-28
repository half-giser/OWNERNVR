/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-05 10:22:52
 * @Description: 智能分析 事件选择器
 */
export default defineComponent({
    props: {
        /**
         * @property radio | checkbox
         */
        mode: {
            type: String,
            default: 'radio',
        },
        /**
         * @property ['face', 'person', 'vehicle']
         */
        range: {
            type: Array as PropType<string[]>,
            default: () => ['face'],
        },
        /**
         * @property 当前选中的事件值
         */
        modelValue: {
            type: Array as PropType<string[]>,
            default: () => [] as string[],
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
            smartEntry: Translate('IDCS_SMART_AOI_ENTRY_DETECTION'),
            smartLeave: Translate('IDCS_SMART_AOI_LEAVE_DETECTION'),
            passLine: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
            regionStatistics: Translate('IDCS_REGION_STATISTICS'),
            smartLoitering: Translate('IDCS_LOITERING_DETECTION'),
            passengerFlow: Translate('IDCS_PASSENGER_FLOW_STATIST'),
            videoMetadata: Translate('IDCS_VSD_DETECTION'),
            plateDetection: Translate('IDCS_PLATE_DETECTION'),
            plateMatchWhiteList: Translate('IDCS_PLATE_MATCH') + '-' + Translate('IDCS_SUCCESSFUL_RECOGNITION'),
            plateMatchStranger: Translate('IDCS_PLATE_MATCH') + '-' + Translate('IDCS_STRANGE_PLATE'),
            smartPvd: Translate('IDCS_PARKING_DETECTION'),
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
                {
                    value: 'videoMetadata',
                    hidden: prop.mode === 'radio',
                },
            ],
            // 人体选项
            personOptions: [
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
                    value: 'smartEntry',
                    hidden: false,
                },
                {
                    value: 'smartLeave',
                    hidden: false,
                },
                {
                    value: 'passLine',
                    hidden: false,
                },
                {
                    value: 'regionStatistics',
                    hidden: false,
                },
                {
                    value: 'smartLoitering',
                    hidden: false,
                },
                {
                    value: 'passengerFlow',
                    hidden: false,
                },
                {
                    value: 'videoMetadata',
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
                    value: 'smartEntry',
                    hidden: false,
                },
                {
                    value: 'smartLeave',
                    hidden: false,
                },
                {
                    value: 'passLine',
                    hidden: false,
                },
                {
                    value: 'regionStatistics',
                    hidden: false,
                },
                {
                    value: 'smartPvd',
                    hidden: false,
                },
                {
                    value: 'videoMetadata',
                    hidden: false,
                },
            ],
            // 车牌选项
            plateOptions: [
                {
                    value: 'plateDetection',
                    hidden: false,
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

            if (prop.range.includes('person')) {
                pageData.value.personOptions.forEach((item) => {
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

            if (prop.range.includes('plate')) {
                pageData.value.plateOptions.forEach((item) => {
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
            } else if (prop.modelValue.length === options.value.length) {
                return Translate('IDCS_EVENT') + `(${Translate('IDCS_FULL')})`
            } else {
                return prop.modelValue.map((item) => EVENT_MAPPING[item]).join('; ')
            }
        })

        /**
         * @description 选项切换
         * @param {string} e
         */
        const changeRadio = (e: string | number | boolean | undefined) => {
            pageData.value.isPop = false
            ctx.emit('update:modelValue', [e as string])
        }

        const checkboxSelected = ref<string[]>([])

        /**
         * @description 确认复选
         */
        const confirmCheckbox = () => {
            pageData.value.isPop = false
            if (!checkboxSelected.value.length) {
                ctx.emit(
                    'update:modelValue',
                    options.value.map((item) => item.value),
                )
            } else {
                ctx.emit('update:modelValue', checkboxSelected.value)
            }
        }

        /**
         * @description 重置复选
         */
        const resetCheckbox = () => {
            checkboxSelected.value = []
        }

        // 选项框打开时 更新选项框勾选项
        watch(
            () => pageData.value.isPop,
            (value) => {
                if (value) {
                    if (prop.mode === 'checkbox') {
                        if (prop.modelValue.length === options.value.length) {
                            if (checkboxSelected.value.length) {
                                checkboxSelected.value = prop.modelValue
                            }
                        } else {
                            checkboxSelected.value = prop.modelValue
                        }
                    }
                }
            },
        )

        onMounted(() => {
            ctx.emit('ready', EVENT_MAPPING)
            // 如果表单没有值，则创造初始值
            if (prop.mode === 'checkbox' && !prop.modelValue.length) {
                confirmCheckbox()
            }
        })

        return {
            pageData,
            options,
            content,
            changeRadio,
            checkboxSelected,
            confirmCheckbox,
            resetCheckbox,
        }
    },
})
