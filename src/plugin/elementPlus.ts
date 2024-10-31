/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-25 09:17:39
 * @Description: Element Plus的默认值设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-30 17:27:18
 */
import { ElDialog, ElInputNumber, ElPagination, ElForm, ElTooltip, ElSelect, ElTable, ElDropdown, ElPopover, ElDatePicker } from 'element-plus'
import { type PropType } from 'vue'

ElPagination.props.layout = {
    type: String,
    default: 'prev, pager, next, sizes, total, jumper',
}

ElPagination.props.pageSizes = {
    type: Array as PropType<number[]>,
    default: () => [10, 20, 30],
    required: false,
}

ElPagination.props.size = {
    type: String,
    default: 'small',
}

ElInputNumber.props.controls = {
    type: Boolean,
    default: false,
}

ElInputNumber.props.stepStrictly = {
    type: Boolean,
    default: true,
}

ElInputNumber.props.valueOnClear = {
    type: [String, Number, null],
    validator: (val: 'min' | 'max' | number | null) => {
        return val === null || typeof val === 'number' || ['min', 'max'].includes(val)
    },
    default: 'min',
}

ElDialog.props.alignCenter = {
    type: Boolean,
    default: true,
}

ElDialog.props.draggable = {
    type: Boolean,
    default: true,
}

ElDialog.props.closeOnClickModal = {
    type: Boolean,
    default: false,
}

ElDialog.props.closeOnPressEscape = {
    type: Boolean,
    default: false,
}

ElForm.props.labelPosition = {
    type: String,
    default: 'left',
}

ElForm.props.hideRequiredAsterisk = {
    type: Boolean,
    default: true,
}

ElTooltip.props.showAfter = {
    type: Number,
    default: 500,
}

ElSelect.props.placeholder = {
    type: String,
    default: ' ',
}

ElSelect.props.noDataText = {
    type: String,
    default: '',
}

ElTable.props.emptyText = {
    type: String,
    default: ' ',
}

ElDropdown.props.trigger = {
    type: String,
    default: 'click',
}

ElPopover.props.hideAfter = {
    type: Number,
    default: 0,
}

ElPopover.props.trigger = {
    type: String,
    default: 'click',
}

ElDatePicker.props.cellClassName = {
    type: Function as PropType<(data: Date) => string>,
    default: highlightWeekend,
}

ElDatePicker.props.clearable = {
    type: Boolean,
    default: false,
}
