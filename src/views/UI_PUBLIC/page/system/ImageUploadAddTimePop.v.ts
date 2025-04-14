/*
 * @Description: 系统——上海地标平台——添加上传时间弹窗
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-10-24 10:03:25
 */
import { type TableInstance } from 'element-plus'

export default defineComponent({
    props: {
        tableData: {
            type: Array as PropType<SystenSHDBImageUploadDto[]>,
            required: true,
        },
    },
    emits: {
        confirm(data: SystenSHDBImageUploadDto[], addTime: string) {
            return data || addTime
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const tableRef = ref<TableInstance>()
        const dateTime = useDateTimeStore()

        const pageData = ref({
            // 添加的时间数据
            addTimeData: DEFAULT_EMPTY_TIME,
            // 全选
            selectAll: true,
            // 反选
            reverseSelect: false,
        })

        const open = () => {
            pageData.value.addTimeData = DEFAULT_EMPTY_TIME
            pageData.value.selectAll = true
            pageData.value.reverseSelect = false
            selectAll()
        }

        // 表头全选checkbox点击
        const selectAllChl = (rows: SystenSHDBImageUploadDto[]) => {
            pageData.value.selectAll = rows.length === prop.tableData.length
        }

        // 手动点击选择行checkbox
        const handleSelect = (selection: SystenSHDBImageUploadDto[], row: SystenSHDBImageUploadDto) => {
            if (!selection.some((item) => item.chlId === row.chlId)) {
                tableRef.value!.setCurrentRow(null)
            }
            pageData.value.selectAll = selection.length === prop.tableData.length
        }

        // 全选
        const selectAll = () => {
            tableRef.value!.clearSelection()
            if (pageData.value.selectAll) {
                tableRef.value!.toggleAllSelection()
            }
        }

        // 反选
        const reverseSelection = () => {
            const selectedRowsIds = tableRef.value!.getSelectionRows().map((row: SystenSHDBImageUploadDto) => row.chlId)
            tableRef.value!.setCurrentRow(null)
            tableRef.value!.clearSelection()
            prop.tableData.forEach((row) => {
                if (!selectedRowsIds.includes(row.chlId)) {
                    tableRef.value!.toggleRowSelection(row, true)
                }
            })
            pageData.value.selectAll = selectedRowsIds.length === 0
        }

        // 行点击事件
        const handleRowClick = (rowData: SystenSHDBImageUploadDto) => {
            pageData.value.selectAll = false
            tableRef.value!.clearSelection()
            tableRef.value!.toggleRowSelection(rowData, true)
        }

        const addTime = () => {
            ctx.emit('confirm', tableRef.value!.getSelectionRows(), pageData.value.addTimeData)
        }

        const close = () => {
            ctx.emit('close')
        }

        return {
            tableRef,
            pageData,
            dateTime,
            open,
            selectAllChl,
            // 手动点击选择行checkbox
            handleSelect,
            selectAll,
            reverseSelection,
            handleRowClick,
            addTime,
            close,
        }
    },
})
