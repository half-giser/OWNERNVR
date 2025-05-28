/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-06 16:42:13
 * @Description: 智能分析 属性选择器
 */
import { type AttrObjDto, getSearchOptions } from '@/utils/tools'
export default defineComponent({
    props: {
        /**
         * @property 勾选的属性值
         */
        modelValue: {
            type: Object as PropType<Record<string, Record<string, string[]>>>,
            required: true,
        },
        /**
         * @property {<'person' | 'car' | 'motor'>[]} 选项范围
         */
        range: {
            type: Array as PropType<string[]>,
            required: true,
        },
        /**
         * @property {'default' | 'spread'} 占位形式
         */
        placeholderType: {
            type: String,
            default: 'default',
        },
    },
    emits: {
        'update:modelValue'(obj: Record<string, Record<string, string[]>>) {
            return !!obj
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        type Options = {
            label: string
            value: string
            children: AttrObjDto[]
        }

        // 所有选项
        const OPTIONS: Options[] = [
            {
                label: Translate('IDCS_DETECTION_PERSON'),
                value: 'person',
                children: [],
            },
            {
                label: Translate('IDCS_DETECTION_VEHICLE'),
                value: 'car',
                children: [],
            },
            {
                label: Translate('IDCS_NON_VEHICLE'),
                value: 'motor',
                children: [],
            },
        ]

        const NAMES_MAPPING: Record<string, string> = {}
        const DEFAULT_VALUE: Record<string, Record<string, string[]>> = {}
        const LEN_MAPPING: Record<string, Record<string, number>> = {}

        // 选项
        const options = computed(() => {
            return OPTIONS.filter((item) => {
                return prop.range.includes(item.value)
            })
        })

        // 勾选值对象
        const selected = ref<Record<string, Record<string, string[]>>>(DEFAULT_VALUE)
        // 属性checkbox勾选值对象
        const attrCheckVals = ref<Record<string, Record<string, boolean>>>({})

        // 占位显示内容
        const content = computed(() => {
            const label: Record<string, boolean> = {}
            Object.keys(prop.modelValue).forEach((key1) => {
                label[key1] = false
                Object.keys(prop.modelValue[key1]).forEach((key2) => {
                    const value = prop.modelValue[key1][key2]
                    if (key2 === 'vehicleBrand') {
                        if (value.length) {
                            label[key1] = true
                        }
                    } else {
                        if (value.length && value.length !== LEN_MAPPING[key1][key2]) {
                            label[key1] = true
                        }
                    }
                })
            })
            const entries = Object.entries(label).filter((item) => prop.range.includes(item[0]))
            if (prop.placeholderType === 'default') {
                return entries.map((item) => `${NAMES_MAPPING[item[0]]}(${item[1] ? Translate('IDCS_PART') : Translate('IDCS_FULL')})`).join('; ')
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
         * @param {string} value
         */
        const change = (key1: string, key2: string, value: string) => {
            const index = selected.value[key1][key2].indexOf(value)
            if (index === -1) {
                selected.value[key1][key2].push(value)
            } else {
                selected.value[key1][key2].splice(index, 1)
            }
        }

        const handleCheckboxChange = (key1: string, key2: string) => {
            if (key1 === 'person' && key2 === 'upperClothType') {
                attrCheckVals.value[key1].upperClothColor = attrCheckVals.value.person.upperClothType
            } else if (key1 === 'person' && key2 === 'mask') {
                attrCheckVals.value[key1].hat = attrCheckVals.value.person.mask
                attrCheckVals.value[key1].glasses = attrCheckVals.value.person.mask
            }
        }

        /**
         * @description 重置选项
         */
        const reset = () => {
            Object.keys(selected.value).forEach((key1: string) => {
                Object.keys(selected.value[key1]).forEach((key2: string) => {
                    if (key2 === 'vehicleBrand') {
                        selected.value[key1][key2] = ['all']
                    } else {
                        selected.value[key1][key2] = []
                    }
                })
            })
            Object.keys(attrCheckVals.value).forEach((key1: string) => {
                Object.keys(attrCheckVals.value[key1]).forEach((key2: string) => {
                    attrCheckVals.value[key1][key2] = false
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
            const result: Record<string, Record<string, string[]>> = {}
            Object.keys(selected.value).forEach((key1: string) => {
                Object.keys(selected.value[key1]).forEach((key2: string) => {
                    const value = [...selected.value[key1][key2]]
                    if (!result[key1]) {
                        result[key1] = {}
                    }

                    if (attrCheckVals.value[key1][key2] && value.length) {
                        result[key1][key2] = value
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
                                selected.value[key1][key2] = [...prop.modelValue[key1][key2]]
                                if (key2 === 'upperClothType' || key2 === 'upperClothColor') {
                                    attrCheckVals.value[key1][key2] = selected.value[key1].upperClothType?.length > 0 || selected.value[key1].upperClothColor?.length > 0
                                } else if (key2 === 'mask' || key2 === 'hat' || key2 === 'glasses') {
                                    attrCheckVals.value[key1][key2] = selected.value[key1].mask?.length > 0 || selected.value[key1].hat?.length > 0 || selected.value[key1].glasses?.length > 0
                                } else {
                                    attrCheckVals.value[key1][key2] = selected.value[key1][key2].length > 0
                                }

                                if (key2 === 'vehicleBrand') {
                                    if (prop.modelValue[key1][key2].length === 0) {
                                        selected.value[key1][key2] = ['all']
                                    }
                                }
                            } else {
                                if (key2 === 'vehicleBrand') {
                                    selected.value[key1][key2] = ['all']
                                } else {
                                    selected.value[key1][key2] = []
                                }

                                if (key2 === 'upperClothType' || key2 === 'upperClothColor') {
                                    attrCheckVals.value[key1][key2] = prop.modelValue[key1]?.upperClothType?.length > 0 || prop.modelValue[key1]?.upperClothColor?.length > 0
                                } else if (key2 === 'mask' || key2 === 'hat' || key2 === 'glasses') {
                                    attrCheckVals.value[key1][key2] = prop.modelValue[key1]?.mask?.length > 0 || prop.modelValue[key1]?.hat?.length > 0 || prop.modelValue[key1]?.glasses?.length > 0
                                } else {
                                    attrCheckVals.value[key1][key2] = false
                                }
                            }
                        })
                    })
                }
            },
        )

        onMounted(async () => {
            const attrOptions: Record<string, AttrObjDto[]> = await getSearchOptions()
            OPTIONS.filter((item) => prop.range.includes(item.value)).forEach((item) => {
                item.children = attrOptions[item.value] || []
            })
            OPTIONS.forEach((item1) => {
                NAMES_MAPPING[item1.value] = item1.label
                DEFAULT_VALUE[item1.value] = {}
                LEN_MAPPING[item1.value] = {}
                attrCheckVals.value[item1.value] = {}
                item1.children.forEach((item2) => {
                    DEFAULT_VALUE[item1.value][item2.value] = []
                    LEN_MAPPING[item1.value][item2.value] = item2.children.length
                    attrCheckVals.value[item1.value][item2.value] = false
                })
            })
            // 如果表单没有值，则创造初始值
            if (!Object.keys(prop.modelValue).length) {
                confirm()
            }
        })

        return {
            content,
            selected,
            pageData,
            options,
            attrCheckVals,
            change,
            reset,
            confirm,
            close,
            handleCheckboxChange,
        }
    },
})
