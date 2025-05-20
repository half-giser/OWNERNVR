/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 添加通道 - 手动添加IPC通道(普通通道+热成像通道)
 */
import { type CheckboxValueType } from 'element-plus'

export default defineComponent({
    props: {
        data: {
            type: Array as PropType<ChannelManualAddDto[]>,
            required: true,
        },
    },
    emits: {
        confirm(data: ChannelManualAddDto[]) {
            return !!data
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const tableData = ref<ChannelManualAddDto[]>([])

        const open = () => {
            tableData.value = cloneDeep(prop.data)
        }

        const confirm = () => {
            ctx.emit('confirm', tableData.value)
        }

        const cancel = () => {
            ctx.emit('close')
        }

        const getCheckAllValue = (row: ChannelManualAddDto) => {
            const every = row.multiChlList.every((item) => item.disabled || item.checked)
            if (every) {
                return true
            } else {
                return false
            }
        }

        const updateCheckAllValue = (e: CheckboxValueType, row: ChannelManualAddDto) => {
            if (e) {
                row.multiChlList.forEach((item) => {
                    if (!item.disabled) {
                        item.checked = true
                    }
                })
            } else {
                row.multiChlList.forEach((item) => {
                    if (!item.disabled) {
                        item.checked = false
                    }
                })
            }
        }

        return {
            cancel,
            confirm,
            tableData,
            open,
            getCheckAllValue,
            updateCheckAllValue,
        }
    },
})
