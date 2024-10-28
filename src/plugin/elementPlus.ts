/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-25 09:17:39
 * @Description: Element Plus的默认值设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-25 09:49:03
 */
import { ElDialog, ElInputNumber, ElPagination, ElForm, ElTooltip, ElSelect, ElTable, ElDropdown } from 'element-plus'

ElPagination.props.layout = {
    type: String,
    default: 'prev, pager, next, sizes, total, jumper',
}

ElPagination.props.pageSizes = {
    type: Array as PropType<number[]>,
    default: () => [10, 20, 30],
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

ElDialog.props.alignCenter = {
    type: Boolean,
    default: true,
}

ElDialog.props.draggable = {
    type: Boolean,
    default: true,
}

ElForm.props.labelPosition = {
    type: String,
    default: 'left',
}

ElTooltip.props.showAfter = {
    type: Number,
    default: 500,
}

ElSelect.props.placeholder = {
    type: String,
    default: ' ',
}

ElTable.props.emptyText = {
    type: String,
    default: ' ',
}

ElDropdown.props.trigger = {
    type: String,
    default: 'click',
}
