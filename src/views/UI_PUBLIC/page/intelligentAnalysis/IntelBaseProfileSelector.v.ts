/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-06 16:42:13
 * @Description: 智能分析 属性选择器
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-06 16:42:39
 */
import {
    GENDER_MAP,
    AGE_MAP,
    ORIENT_MAP,
    HAT_MAP,
    GLASS_MAP,
    MASK_MAP,
    BACKPACK_TYPE_MAP,
    UPPER_TYPE_MAP,
    LOWER_TYPE_MAP,
    COLOR_MAP,
    SKIRT_TYPE_MAP,
    CAR_TYPE_MAP,
    NON_MOTOR_MAP,
    CAR_BRAND_MAP,
} from '@/utils/const/snap'
export default defineComponent({
    props: {
        /**
         * @property 勾选的属性值
         */
        modelValue: {
            type: Object as PropType<Record<string, Record<string, number[]>>>,
            required: true,
        },
        /**
         * @property {enum[]} 选项范围 ['person', 'car', 'motor']
         */
        range: {
            type: Array as PropType<string[]>,
            required: true,
        },
    },
    emits: {
        'update:modelValue'(obj: Record<string, Record<string, number[]>>) {
            return !!obj
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const UNKNOWN = Translate('IDCS_ENCRYPT_UNKNOWN')
        const CAR_BRAND_OPTIONS: number[] = []

        /**
         * @description 构造选项
         * @param {Object} obj
         * @param {string} str
         * @returns {Array}
         */
        const getOptions = (obj: Record<number, string>, str?: string) => {
            return Object.entries(obj)
                .map((item) => {
                    return {
                        label: item[1] === '--' ? UNKNOWN : str ? (Translate(item[1]).formatForLang(str) as string) : Translate(item[1]),
                        value: Number(item[0]),
                    }
                })
                .toSorted((a, b) => {
                    if (typeof a.value === 'string' || typeof b.value === 'string') {
                        return -1
                    }
                    if (b.value === 0) {
                        return -2
                    }
                    return a.value - b.value
                })
        }

        /**
         * @description 构造车型品牌选项
         * @returns {Array}
         */
        const getCarBrandOption = () => {
            return [
                {
                    label: Translate('IDCS_FULL'),
                    value: -2,
                },
            ].concat(
                Object.entries(CAR_BRAND_MAP).map((item) => {
                    if (item[0] !== 'other' && Number(item[0])) {
                        CAR_BRAND_OPTIONS.push(Number(item[0]))
                    }
                    return {
                        label: item[1] === '--' ? UNKNOWN : Translate(item[1]),
                        value: item[0] === 'other' ? -1 : Number(item[0]),
                    }
                }),
            )
        }

        type Options = {
            label: string
            value: string
            children: {
                label: string
                value: string
                children: {
                    label: string
                    value: string
                    children: {
                        label: string
                        value: number
                    }[]
                }[]
            }[]
        }

        // 所有选项
        const OPTIONS: Options[] = [
            {
                label: Translate('IDCS_DETECTION_PERSON'),
                value: 'person',
                children: [
                    {
                        label: Translate('IDCS_GENERAL'),
                        value: 'general',
                        children: [
                            {
                                label: Translate('IDCS_SEX'),
                                value: 'gender',
                                children: getOptions(GENDER_MAP),
                            },
                            {
                                label: Translate('IDCS_AGE'),
                                value: 'age',
                                children: getOptions(AGE_MAP),
                            },
                            {
                                label: Translate('IDCS_DIRECTION'),
                                value: 'orient',
                                children: getOptions(ORIENT_MAP),
                            },
                        ],
                    },
                    {
                        label: Translate('IDCS_HEAD_FACE'),
                        value: 'head_face',
                        children: [
                            {
                                label: Translate('IDCS_MASK'),
                                value: 'mask',
                                children: getOptions(MASK_MAP),
                            },
                            {
                                label: Translate('IDCS_HAT'),
                                value: 'hat',
                                children: getOptions(HAT_MAP),
                            },
                            {
                                label: Translate('IDCS_GLASSES'),
                                value: 'galsses',
                                children: getOptions(GLASS_MAP),
                            },
                        ],
                    },
                    {
                        label: Translate('IDCS_UPPER_BODY'),
                        value: 'upper_body',
                        children: [
                            {
                                label: Translate('IDCS_BACKPACK'),
                                value: 'backpack',
                                children: getOptions(BACKPACK_TYPE_MAP),
                            },
                            {
                                label: Translate('IDCS_UPPER_BODY_CLOTH_TYPE'),
                                value: 'upper_length',
                                children: getOptions(UPPER_TYPE_MAP, Translate('IDCS_UPPER_CLOTH')),
                            },
                            {
                                label: Translate('IDCS_UPPERCOLOR'),
                                value: 'upper_color',
                                children: getOptions(COLOR_MAP),
                            },
                        ],
                    },
                    {
                        label: Translate('IDCS_LOWER_BODY'),
                        value: 'lower_body',
                        children: [
                            {
                                label: Translate('IDCS_LOWER_BODY_CLOTH_TYPE'),
                                value: 'lower_length',
                                children: getOptions(LOWER_TYPE_MAP, Translate('IDCS_LOWER_CLOTH')),
                            },
                            {
                                label: Translate('IDCS_BLOWERCOLOR'),
                                value: 'lower_color',
                                children: getOptions(COLOR_MAP),
                            },
                        ],
                    },
                    {
                        label: Translate('IDCS_SKIRT'),
                        value: 'skirt',
                        children: [
                            {
                                label: Translate('IDCS_SKIRT'),
                                value: 'skirt',
                                children: getOptions(SKIRT_TYPE_MAP),
                            },
                        ],
                    },
                ],
            },
            {
                label: Translate('IDCS_DETECTION_VEHICLE'),
                value: 'car',
                children: [
                    {
                        label: '',
                        value: '',
                        children: [
                            {
                                label: Translate('IDCS_COLOR'),
                                value: 'color',
                                children: getOptions(COLOR_MAP),
                            },
                            {
                                label: Translate('IDCS_TYPE'),
                                value: 'type',
                                children: getOptions(CAR_TYPE_MAP),
                            },
                            {
                                label: Translate('IDCS_BRAND'),
                                value: 'brand',
                                children: getCarBrandOption(),
                            },
                        ],
                    },
                ],
            },
            {
                label: Translate('IDCS_NON_VEHICLE'),
                value: 'motor',
                children: [
                    {
                        label: '',
                        value: '',
                        children: [
                            {
                                label: Translate('IDCS_TYPE'),
                                value: 'type',
                                children: getOptions(NON_MOTOR_MAP),
                            },
                        ],
                    },
                ],
            },
        ]

        const NAMES_MAPPING: Record<string, string> = {}
        const DEFAULT_VALUE: Record<string, Record<string, number[]>> = {}
        const LEN_MAPPING: Record<string, Record<string, number>> = {}

        OPTIONS.forEach((item1) => {
            NAMES_MAPPING[item1.value] = item1.label
            DEFAULT_VALUE[item1.value] = {}
            LEN_MAPPING[item1.value] = {}
            item1.children.forEach((item2) => {
                item2.children.forEach((item3) => {
                    if (item3.value === 'brand') {
                        DEFAULT_VALUE[item1.value][item3.value] = [-2]
                    } else {
                        DEFAULT_VALUE[item1.value][item3.value] = []
                    }
                    LEN_MAPPING[item1.value][item3.value] = item3.children.length
                })
            })
        })

        // 选项
        const options = computed(() => {
            return OPTIONS.filter((item) => {
                return prop.range.includes(item.value)
            })
        })

        // 勾选值对象
        const selected = ref<Record<string, Record<string, number[]>>>(DEFAULT_VALUE)

        // 占位显示内容
        const content = computed(() => {
            const label: Record<string, boolean> = {}
            Object.keys(prop.modelValue).forEach((key1) => {
                label[key1] = false
                Object.keys(prop.modelValue[key1]).forEach((key2) => {
                    const value = prop.modelValue[key1][key2]
                    if (key2 === 'brand') {
                        if (value.length === 1 && value[0] === 0) {
                            label[key1] = true
                        }
                    } else {
                        if (prop.modelValue[key1][key2].length && prop.modelValue[key1][key2].length !== LEN_MAPPING[key1][key2]) {
                            label[key1] = true
                        }
                    }
                })
            })
            const entries = Object.entries(label)
            if (entries.length === 1) {
                return `${Translate('IDCS_ATTRIBUTE')} (${entries[0][1] ? Translate('IDCS_PART') : Translate('IDCS_FULL')})`
            } else {
                return `${Translate('IDCS_ATTRIBUTE')} (${entries.map((item) => `${NAMES_MAPPING[item[0]]}: ${item[1] ? Translate('IDCS_PART') : Translate('IDCS_FULL')}`).join('; ')})`
            }
        })

        const pageData = ref({
            // 是否打开弹窗
            isPop: false,
        })

        /**
         * @description 勾选值更新时回调
         * @param {string} key1
         * @param {string} key2
         * @param {number} value
         */
        const change = (key1: string, key2: string, value: number) => {
            const index = selected.value[key1][key2].indexOf(value)
            if (index === -1) {
                selected.value[key1][key2].push(value)
            } else {
                selected.value[key1][key2].splice(index, 1)
            }
        }

        /**
         * @description 重置选项
         */
        const reset = () => {
            Object(selected.value).keys((key1: string) => {
                Object(selected.value[key1]).keys((key2: string) => {
                    selected.value[key1][key2] = []
                })
            })
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            pageData.value.isPop = false
        }

        /**
         * @description 确认选项
         */
        const confirm = () => {
            const result: Record<string, Record<string, number[]>> = {}
            Object.keys(selected.value).forEach((key1: string) => {
                Object.keys(selected.value[key1]).forEach((key2: string) => {
                    const value = [...selected.value[key1][key2]]
                    if (!result[key1]) {
                        result[key1] = {}
                    }
                    if (key2 === 'brand') {
                        if (value[0] < 0) {
                            result[key1][key2] = [...CAR_BRAND_OPTIONS]
                        } else {
                            result[key1][key2] = value
                        }
                    } else {
                        if (value.length) {
                            result[key1][key2] = value
                        }
                    }
                })
            })
            ctx.emit('update:modelValue', result)
            pageData.value.isPop = false
        }

        // 选项框打开时 更新选项框勾选项
        watch(
            () => pageData.value.isPop,
            (value) => {
                if (value) {
                    Object.keys(selected.value).forEach((key1: string) => {
                        Object.keys(selected.value[key1]).forEach((key2: string) => {
                            if (prop.modelValue[key1] && prop.modelValue[key1][key2]) {
                                if (key2 === 'brand') {
                                    if (prop.modelValue[key1][key2].length === CAR_BRAND_OPTIONS.length && selected.value[key1][key2][0] >= 0) {
                                        selected.value[key1][key2][0] = -2
                                    } else {
                                        selected.value[key1][key2] = [...prop.modelValue[key1][key2]]
                                    }
                                } else {
                                    selected.value[key1][key2] = [...prop.modelValue[key1][key2]]
                                }
                            }
                        })
                    })
                }
            },
        )

        onMounted(() => {
            // 如果表单没有值，则创造初始值
            if (!Object.keys(prop.modelValue).length) {
                const result: Record<string, Record<string, number[]>> = {}
                options.value.forEach((item1) => {
                    result[item1.value] = {}
                    item1.children.forEach((item2) => {
                        item2.children.forEach((item3) => {
                            result[item1.value][item3.value] = []
                        })
                    })
                })
                ctx.emit('update:modelValue', result)
            }
        })

        return {
            content,
            selected,
            pageData,
            options,
            change,
            reset,
            confirm,
            close,
        }
    },
})
