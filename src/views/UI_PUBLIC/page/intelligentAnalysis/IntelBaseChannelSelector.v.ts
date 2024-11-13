/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-05 10:16:53
 * @Description: 智能分析 通道选择器
 */
import { type TableInstance } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 通道ID选项
         */
        modelValue: {
            type: Array as PropType<string[]>,
            required: true,
        },
        /**
         * @property {'channel' | 'park'} 通道或停车场
         */
        mode: {
            type: String,
            default: 'channel',
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
                if (prop.mode === 'channel') {
                    return Translate('IDCS_CHANNEL') + `(${Translate('IDCS_FULL')})`
                }
                return Translate('IDCS_SEARCH_ENTRANCE_AND_EXIT') + `(${Translate('IDCS_FULL')})`
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

        /**
         * @description 获取通道数据
         */
        const getData = async () => {
            const result = await getChlList({
                isContainsDeletedItem: true,
                authList: '@spr,@bk',
            })
            const $ = queryXml(result)
            tableData.value = $('//content/item').map((item) => {
                const $item = queryXml(item.element)
                let text = $item('name').text()
                const id = item.attr('id')!
                if (id === DEFAULT_EMPTY_ID) {
                    text = prop.mode === 'channel' ? Translate('IDCS_HISTORY_CHANNEL') : Translate('IDCS_HISTORY_ENTRANCE_EXIT')
                }
                chlMap[id] = text
                return {
                    label: text,
                    value: id,
                }
            })
        }

        // 打开弹窗时 重置选项
        watch(
            () => pageData.value.isPop,
            (value) => {
                if (value) {
                    if (tableData.value.length === prop.modelValue.length) {
                        if (selected.value.length) {
                            tableData.value.forEach((item) => {
                                tableRef.value?.toggleRowSelection(item, prop.modelValue.includes(item.value))
                            })
                        }
                    } else {
                        tableData.value.forEach((item) => {
                            tableRef.value?.toggleRowSelection(item, prop.modelValue.includes(item.value))
                        })
                    }
                }
            },
        )

        onMounted(async () => {
            await getData()
            ctx.emit('ready', chlMap)
            // 如果表单没有值，则创造初始值
            if (!prop.modelValue.length) {
                confirm()
            }
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
