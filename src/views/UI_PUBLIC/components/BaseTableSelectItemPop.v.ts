/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-07 17:02:42
 * @Description: 通用的选择元素弹框（选择通道、选择人脸分组等弹框...）
 */

export default defineComponent({
    props: {
        title: {
            type: String,
            require: true,
        },
        datas: {
            type: Array<any>,
            require: true,
            default: [],
        },
        selectedDatas: {
            type: Array<any>,
            require: true,
            default: [],
        },
        confirm: {
            type: Function,
            require: false,
            default: () => {},
        },
        cancel: {
            type: Function,
            require: true,
            default: () => {},
        },
    },
    setup(props: any) {
        const tableRef = ref()

        function toggleSelection() {
            props.selectedDatas.forEach((row: any) => {
                tableRef.value.toggleRowSelection(row, true)
            })
            if (props.selectedDatas.length === 0) {
                tableRef.value.clearSelection()
            }
        }
        function handleDialogOpened() {
            toggleSelection()
        }

        function handleRowClick(row: any) {
            tableRef.value.clearSelection()
            tableRef.value.toggleRowSelection(row, true)
        }

        function ok() {
            props.confirm(tableRef.value.getSelectionRows())
        }

        function no() {
            props.cancel()
        }

        return {
            tableRef,
            handleDialogOpened,
            handleRowClick,
            ok,
            no,
        }
    },
})
