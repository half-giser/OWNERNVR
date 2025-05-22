/*
 * @Description: 车牌颜色选择弹窗
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2025-05-20 17:07:03
 */
import { type AttrObjDto, getSearchOptions } from '@/utils/tools'
export default defineComponent({
    props: {
        /**
         * @property 已选择颜色列表
         */
        selectedColors: {
            type: Array as PropType<string[]>,
            default: () => [],
        },
    },
    emits: {
        confirmColor(e: string[]) {
            return Array.isArray(e)
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
            isPop: false,
            enable: false,
            colors: [] as IntelPlateColorList[],
            selectedColors: [] as string[],
        })

        const open = () => {
            if (pageData.value.enable) {
                pageData.value.selectedColors = cloneDeep(prop.selectedColors)
            }
            pageData.value.colors.map((item) => {
                if (pageData.value.selectedColors.includes(item.value)) {
                    item.selected = true
                } else {
                    item.selected = false
                }
                return item
            })
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
            if (!pageData.value.enable) {
                pageData.value.selectedColors = []
            }
            ctx.emit('confirmColor', pageData.value.selectedColors)
            close()
        }

        const close = () => {
            pageData.value.isPop = false
        }

        // 占位显示内容
        const content = computed(() => {
            return pageData.value.selectedColors.length > 0 ? `${Translate('IDCS_COLOR')}(${Translate('IDCS_PART')})` : `${Translate('IDCS_COLOR')}(${Translate('IDCS_FULL')})`
        })

        onMounted(async () => {
            const attrOptions: Record<string, AttrObjDto[]> = await getSearchOptions()
            pageData.value.colors = attrOptions.plate[0]?.children as unknown as IntelPlateColorList[]
        })

        return {
            pageData,
            open,
            chooseColor,
            reset,
            confirm,
            close,
            content,
        }
    },
})
