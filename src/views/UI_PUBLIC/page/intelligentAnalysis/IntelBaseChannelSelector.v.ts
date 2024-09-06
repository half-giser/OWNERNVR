/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-05 10:16:53
 * @Description: 智能分析 通道选择器
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 10:22:08
 */
import { type TableInstance } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 通道选项
         */
        modelValue: {
            type: Array as PropType<string[]>,
            required: true,
        },
    },
    emits: {
        'update:modelValue'(selection: string[]) {
            return Array.isArray(selection)
        },
        ready(chlMap: Record<string, string>) {
            return !!chlMap
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const chlMap: Record<string, string> = {}

        const pageData = ref({
            // 是否显示选项框
            isPop: false,
        })

        const tableRef = ref<TableInstance>()

        const selected = ref<SelectOption<string, string>[]>([])

        const tableData = ref<SelectOption<string, string>[]>([])

        /**
         * @description 选中值更改
         */
        const handleCurrentChange = (row: SelectOption<string, string>[]) => {
            selected.value = row
        }

        // 选项框回显的内容
        const content = computed(() => {
            if (tableData.value.length === prop.modelValue.length || !prop.modelValue.length) {
                return Translate('IDCS_CHANNEL') + `(${Translate('IDCS_FULL')})`
            }
            return prop.modelValue.map((item) => chlMap[item]).join('; ')
        })

        /**
         * @description 重置
         */
        const reset = () => {
            tableRef.value?.clearSelection()
        }

        /**
         * @description 确认
         */
        const confirm = () => {
            pageData.value.isPop = false
            if (!selected.value.length) {
                ctx.emit(
                    'update:modelValue',
                    tableData.value.map((item) => item.value),
                )
            } else {
                ctx.emit(
                    'update:modelValue',
                    selected.value.map((item) => item.value),
                )
            }
        }

        onMounted(() => {
            getChlList({
                isContainsDeletedItem: true,
                authList: '@spr,@bk',
            }).then((result) => {
                const $ = queryXml(result)
                tableData.value = $('//content/item').map((item) => {
                    const $item = queryXml(item.element)
                    chlMap[item.attr('id')!] = $item('name').text()
                    return {
                        label: $item('name').text(),
                        value: item.attr('id')!,
                    }
                })
                ctx.emit('ready', chlMap)
                confirm()
            })
        })

        return {
            pageData,
            tableRef,
            tableData,
            handleCurrentChange,
            reset,
            confirm,
            content,
        }
    },
})
