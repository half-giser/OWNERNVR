/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-25 09:17:39
 * @Description: Element Plus的默认值设置
 */
import { ElDialog, ElInputNumber, ElForm, ElTooltip, ElSelectV2, ElTable, ElDropdown, ElPopover, ElDatePicker, ElTimePicker, ElSlider, ElScrollbar } from 'element-plus'
import { type PropType } from 'vue'
import sprites from '../components/sprite/sprites'
import BaseCalendarIcon from '@/components/icon/BaseCalendarIcon.vue'

// ElPagination.props.layout = {
//     type: String,
//     default: 'jumper, prev, pager, next, sizes, total',
// }

// ElPagination.props.pageSizes = {
//     type: Array as PropType<number[]>,
//     default: () => [10, 20, 30],
//     required: false,
// }

// ElPagination.props.size = {
//     type: String,
//     default: 'small',
// }

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

ElTooltip.props.showArrow = {
    type: Boolean,
    default: false,
}

ElTooltip.props.effect = {
    type: String,
    default: 'light',
}

// ElSelect.props.placeholder = {
//     type: String,
//     default: ' ',
// }

// ElSelect.props.noDataText = {
//     type: String,
//     default: '',
// }

// ElSelect.props.emptyValues = {
//     type: Array,
//     default: () => [null, undefined],
// }

ElSelectV2.props.placeholder = {
    type: String,
    default: ' ',
}

ElSelectV2.props.noDataText = {
    type: String,
    default: '',
}

ElSelectV2.props.emptyValues = {
    type: Array,
    default: () => [null, undefined],
}

ElSelectV2.props.persistent = {
    type: Boolean,
    default: false,
}

ElSelectV2.props.showArrow = {
    type: Boolean,
    default: false,
}

ElSelectV2.props.offset = {
    type: Number,
    default: 0,
}

ElSelectV2.props.itemHeight = {
    type: Number,
    default: 26,
}

ElTable.props.emptyText = {
    type: String,
    default: ' ',
}

ElTable.props.scrollbarAlwaysOn = {
    type: Boolean,
    default: true,
}

ElTable.props.stripe = {
    type: Boolean,
    default: true,
}

ElTable.props.border = {
    type: Boolean,
    default: true,
}

ElTable.props.rowClassName = {
    type: Function,
    default: (data: any) => {
        if (typeof data.row === 'object' && typeof data.row.disabled === 'boolean' && typeof data.row.status === 'string') {
            if (data.row.disabled) {
                return 'disabled'
            }
        }
        return ''
    },
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

ElPopover.props.showArrow = {
    type: Boolean,
    default: false,
}

ElPopover.props.offset = {
    type: Number,
    default: 0,
}

ElDatePicker.props.cellClassName = {
    type: Function as PropType<(data: Date) => string>,
    default: highlightWeekend,
}

ElDatePicker.props.clearable = {
    type: Boolean,
    default: false,
}

ElDatePicker.props.prefixIcon = {
    type: Object,
    default: BaseCalendarIcon,
}

// ElDatePicker.props.showNow = {
//     type: Boolean,
//     default: true,
// }

ElTimePicker.props.clearable = {
    type: Boolean,
    default: false,
}

ElTimePicker.props.editable = {
    type: Boolean,
    default: true,
}

ElSlider.props.showInputControls = {
    type: Boolean,
    default: false,
}

ElScrollbar.props.always = {
    type: Boolean,
    default: true,
}

document.body.style.setProperty('--float-x', `-${sprites.coordinates.floatTip[0]}px`)
document.body.style.setProperty('--float-y', `-${sprites.coordinates.floatTip[1]}px`)
