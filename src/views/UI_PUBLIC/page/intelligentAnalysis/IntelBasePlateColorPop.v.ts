/*
 * @Description: 车牌颜色选择弹窗
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2025-05-20 17:07:03
 */
import { PLATE_COLOR_SELECT_MAP } from '@/utils/const/snap'
export default defineComponent({
    props: {
        /**
         * @property 弹窗是否打开
         */
        modelValue: {
            type: Boolean,
            required: true,
        },
        /**
         * @property 颜色选择生 效
         */
        enable: {
            type: Boolean,
            default: false,
        },
        /**
         * @property 可选择颜色列表
         */
        colors: {
            type: Array as PropType<string[]>,
            default: () => [],
        },
        /**
         * @property 已选择颜色列表
         */
        selectedColors: {
            type: Array as PropType<string[]>,
            default: () => [],
        },
    },
    emits: {
        'update:modelValue'(e: boolean) {
            return typeof e === 'boolean'
        },
        close() {
            return true
        },
        confirmColor(e: string[], enable: boolean) {
            return Array.isArray(e) && typeof enable === 'boolean'
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
            enable: false,
            colors: [] as IntelPlateColorList[],
            selectedColors: [] as string[],
        })

        const open = () => {
            pageData.value.enable = prop.enable
            if (pageData.value.enable) {
                pageData.value.selectedColors = cloneDeep(prop.selectedColors)
            }
            pageData.value.colors = prop.colors.map((item) => {
                const text = Translate(PLATE_COLOR_SELECT_MAP[item])
                return {
                    value: item,
                    label: text,
                    selected: pageData.value.selectedColors.includes(item),
                }
            })
        }

        const close = () => {
            destory()
            ctx.emit('update:modelValue', false)
            ctx.emit('close')
        }

        const destory = () => {
            pageData.value.enable = false
            pageData.value.colors = []
            pageData.value.selectedColors = []
        }

        const chooseColor = (color: string) => {
            const index = pageData.value.colors.findIndex((item) => item.value === color)
            if (index !== -1) {
                pageData.value.colors[index].selected = !pageData.value.colors[index].selected
                if (pageData.value.colors[index].selected) {
                    pageData.value.selectedColors.push(color)
                } else {
                    const selectedIndex = pageData.value.selectedColors.findIndex((item) => item === color)
                    if (selectedIndex !== -1) {
                        pageData.value.selectedColors.splice(selectedIndex, 1)
                    }
                }
            }
        }

        const reset = () => {
            pageData.value.enable = false
            pageData.value.colors.forEach((item) => {
                item.selected = false
            })
            pageData.value.selectedColors = []
        }

        const confirm = () => {
            ctx.emit('update:modelValue', false)
            if (!pageData.value.enable) {
                pageData.value.selectedColors = []
            }
            ctx.emit('confirmColor', pageData.value.selectedColors, pageData.value.enable)
            ctx.emit('close')
        }
        return {
            pageData,
            open,
            close,
            chooseColor,
            reset,
            confirm,
        }
    },
})
