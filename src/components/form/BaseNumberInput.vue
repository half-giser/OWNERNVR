<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-17 11:56:00
 * @Description: 数字输入框. 由于ElInputNumber不能满足项目要求，故自行实现适用于本项目的数字输入框
 * element-plus数字输入组件的缺陷包括：
 * (1) 可输入超出最大值的值
 * (2) 可输入小数点、e、+、-等符号
 * (3) firefox可输入任意字符
 * (4) 整数除0本身外，开头可以是0
-->
<template>
    <el-input
        ref="$input"
        class="BaseNumberInput"
        :model-value="showValue"
        @keydown="handleKeyPress"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @compositionend="handleCompositionEnd"
        @paste.prevent="handlePaste"
    />
</template>

<script lang="ts" setup>
import type { InputInstance } from 'element-plus'

const props = withDefaults(
    defineProps<{
        /**
         * @property 绑定值
         */
        modelValue: number | undefined
        /**
         * @property 最小值
         */
        min?: number
        /**
         * @property 最大值
         */
        max?: number
        /**
         * @property 清楚值
         */
        valueOnClear?: null | 'min'
        /**
         * @property 精度
         */
        precision?: number
        /**
         * @property 步长
         */
        step?: number
    }>(),
    {
        min: 0,
        max: Infinity,
        valueOnClear: 'min',
        precision: 0,
        step: 1,
    },
)

const emit = defineEmits<{
    (e: 'focus', event: FocusEvent): void
    (e: 'blur', event: FocusEvent): void
    (e: 'change', currentValue: number | undefined): void
    (e: 'update:modelValue', currentValue: number | undefined): void
}>()

const focusValue = ref('')
const isFocus = ref(false)

const $input = ref<InputInstance>()

const showValue = computed(() => {
    if (isFocus.value) {
        return focusValue.value
    }
    return props.modelValue
})

const isNumber = () => {
    return focusValue.value !== ''
}

const toNumber = () => {
    return Number(focusValue.value)
}

const toClamp = (num: number, min: number, max: number) => {
    const power = Math.pow(10, props.precision)
    return (clamp(num * power, min * power, max * power) / power).toFixed(props.precision)
}

/**
 * @description 处理键盘事件
 * @param {KeyboardEvent} e
 */
const handleKeyPress = (e: Event | KeyboardEvent) => {
    const keyCode = (e as KeyboardEvent).key
    const ctrlKey = (e as KeyboardEvent).ctrlKey
    const metaKey = (e as KeyboardEvent).metaKey

    let isPreventDefault = true

    switch (keyCode) {
        case 'ArrowRight':
        case 'ArrowLeft':
        case 'Backspace':
        case 'Tab':
        case 'Enter':
            isPreventDefault = false
            break
        case 'ArrowUp':
            if (isNumber()) {
                updateValue(toClamp(toNumber() + props.step, props.min, props.max))
            }
            break
        case 'ArrowDown':
            if (isNumber()) {
                updateValue(toClamp(toNumber() - props.step, props.min, props.max))
            }
            break
        case 'v':
        case 'c':
        case 'x':
            if (ctrlKey || metaKey) {
                isPreventDefault = false
            }
            break
        case '.':
            if (!String(focusValue.value).includes('.') && !!props.precision) {
                isPreventDefault = false
            }
            break
        default:
            if (/[0-9]/.test(keyCode)) {
                isPreventDefault = false
                // 数字不以0开头，如果已经输入0，阻止其他数字输入
                if (showValue.value === 0 || showValue.value === '0') {
                    isPreventDefault = true
                }
            }
            break
    }

    if (isPreventDefault) {
        e.preventDefault()
    }

    return false
}

/**
 * @description 获得焦点
 */
const focus = async () => {
    $input.value?.focus()
}

/**
 * @description 失去焦点
 */
const blur = () => {
    $input.value?.blur()
}

/**
 * @description 处理输入事件
 * @param {string} e
 */
const handleInput = (e: string) => {
    if (e === '') {
        updateValue(e)
    } else {
        const value = Number(e)
        if (value > props.max) {
            if (Number(focusValue.value) > props.max) {
                updateValue(e)
            } else {
                updateValue(focusValue.value)
            }
            return
        }
        updateValue(e)
    }
}

/**
 * @description 处理焦点事件
 * @param {FocusEvent} e
 */
const handleFocus = (e: FocusEvent) => {
    isFocus.value = true
    focusValue.value = typeof props.modelValue === 'undefined' ? '' : String(props.modelValue)
    emit('focus', e)
}

/**
 * @description 处理失去焦点事件
 * @param {FocusEvent} e
 */
const handleBlur = (e: FocusEvent) => {
    if (props.valueOnClear === 'min') {
        if (toNumber() <= props.min) {
            updateValue(props.min + '')
        }
    }

    if (props.valueOnClear === null) {
        if (showValue.value === '') {
            updateValue('')
        }
    }

    isFocus.value = false

    emit('blur', e)
}

/**
 * @description 处理合成事件
 */
const handleCompositionEnd = () => {
    if ($input.value) {
        $input.value.input!.value = focusValue.value
    }
}

/**
 * @description 更新数据
 * @param {number | string} value
 */
const updateValue = (value: string) => {
    if (value === '') {
        focusValue.value = value
        emit('update:modelValue', props.valueOnClear === 'min' ? 0 : undefined)
        emit('change', props.valueOnClear === 'min' ? 0 : undefined)
        return
    }

    if (/^00/.test(value)) {
        value = value.replace('0', '')
    }

    if (props.precision > 0) {
        const index = value.indexOf('.')
        if (index === -1) {
            focusValue.value = value
        } else {
            focusValue.value = value.substring(0, index + 1 + props.precision)
        }
    } else {
        focusValue.value = value
    }

    const modelValue = focusValue.value === '' ? undefined : Number(focusValue.value)
    emit('update:modelValue', modelValue)
    emit('change', modelValue)
}

/**
 * @description 粘贴
 * @param {ClipboardEvent} e
 */
const handlePaste = (e: ClipboardEvent) => {
    const text = e.clipboardData?.getData('text')?.trim()
    const value = Number(text)
    if (text && !isNaN(value)) {
        updateValue(toClamp(value, props.min, props.max))
    }
}

const expose = {
    focus,
    blur,
}

export type BaseNumberInputReturnsType = typeof expose

defineExpose(expose)
</script>
