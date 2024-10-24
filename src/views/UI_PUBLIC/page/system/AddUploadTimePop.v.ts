/*
 * @Description: 系统——上海地标平台——添加上传时间弹窗
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-10-24 10:03:25
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-24 14:16:06
 */
import { type ImageUploadDto } from '@/types/apiType/system'

export default defineComponent({
    props: {
        tableData: {
            type: Array as PropType<ImageUploadDto[]>,
            required: true,
        },
    },
    emits: {
        confirm(data: ImageUploadDto[], addTime: string) {
            return data || addTime
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const tableRef = ref()

        const pageData = ref({
            // 添加的时间数据
            addTimeData: '00:00:00',
            // 全选
            selectAll: true,
            // 反选
            reverseSelect: false,
        })
        const open = () => {
            console.log('open')
            pageData.value.addTimeData = '00:00:00'
            pageData.value.selectAll = true
            pageData.value.reverseSelect = false
            selectAll()
        }
        // 表头全选checkbox点击
        const selectAllChl = (rows: ImageUploadDto[]) => {
            pageData.value.selectAll = rows.length === prop.tableData.length
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
            const selectedRowsIds = tableRef.value!.getSelectionRows().map((row: ImageUploadDto) => row.chlId)
            tableRef.value!.setCurrentRow()
            tableRef.value!.clearSelection()
            prop.tableData.forEach((row: ImageUploadDto) => {
                if (!selectedRowsIds.includes(row.chlId)) {
                    tableRef.value!.toggleRowSelection(row, true)
                }
            })
            pageData.value.selectAll = selectedRowsIds.length === 0
        }
        // 行点击事件
        const handleRowClick = (rowData: ImageUploadDto) => {
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
            prop,
            tableRef,
            pageData,
            open,
            selectAllChl,
            selectAll,
            reverseSelection,
            handleRowClick,
            addTime,
            close,
        }
    },
})
