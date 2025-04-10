<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-17 11:56:00
 * @Description: 数字输入框. 由于ElInputNumber不能满足项目要求，故自行实现适用于本项目的数字输入框
 * 不适配的地方包括：
 * (1) 可输入超出最大值的值
 * (2) 可输入句点、e、+-等符号
 * (3) firefox可输入任意字符
-->
<template>
    <el-input
        ref="input"
        class="BaseNumberInput"
        type="number"
        :model-value="showValue"
        @keydown="handleKeyPress"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @paste.prevent="handlePaste"
    />
</template>

<script lang="ts" setup>
import type { InputInstance } from 'element-plus'

const props = withDefaults(
    defineProps<{
        modelValue: number | undefined
        min?: number
        max?: number
        valueOnClear?: number | null | 'min'
        precision?: number
    }>(),
    {
        min: 0,
        max: Infinity,
        valueOnClear: 'min',
        precision: 0,
    },
)

const showValue = computed(() => {
    if (typeof props.modelValue === 'number') {
        if (props.precision) {
            return props.modelValue.toFixed(props.precision)
        }
        return props.modelValue
    }
    return props.modelValue
})

const emit = defineEmits<{
    (e: 'focus', event: FocusEvent): void
    (e: 'blur', event: FocusEvent): void
    (e: 'change', currentValue: number | undefined): void
    (e: 'update:modelValue', currentValue: number | undefined): void
}>()
const handleKeyPress = (e: Event | KeyboardEvent) => {
    const keyCode = (e as KeyboardEvent).key
    const ctrlKey = (e as KeyboardEvent).ctrlKey
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
            if (typeof props.modelValue === 'number') {
                updateValue(clamp(Number(props.modelValue) + 1, props.min, props.max))
            }
            break
        case 'ArrowDown':
            if (typeof props.modelValue === 'number') {
                updateValue(clamp(Number(props.modelValue) - 1, props.min, props.max))
            }
            break
        case 'v':
        case 'c':
        case 'x':
            if (ctrlKey) {
                isPreventDefault = false
            }
            break
        case '.':
            if (!String(showValue.value).includes('.') && props.precision) {
                isPreventDefault = false
            }
            break
        default:
            if (/[0-9]/.test(keyCode)) {
                isPreventDefault = false
            }
            break
    }

    if (isPreventDefault) {
        e.preventDefault()
    }

    return false
}

const input = ref<InputInstance>()

const focus = () => {
    input.value?.focus()
}

const blur = () => {
    input.value?.blur()
}

const handleInput = (e: string) => {
    if (e === '') {
        updateValue(undefined)
    } else {
        const value = Number(e)
        if (value > props.max) {
            return
        }

        updateValue(value)
    }
}

const handleFocus = (e: FocusEvent) => {
    emit('focus', e)
}

const handleBlur = (e: FocusEvent) => {
    if (props.valueOnClear === 'min') {
        if (typeof props.modelValue === 'undefined' || props.modelValue < props.min) {
            updateValue(props.min)
        }
    } else if (typeof props.valueOnClear === 'number') {
        if (typeof props.modelValue === 'undefined') {
            updateValue(props.valueOnClear)
        }
    } else if (typeof props.valueOnClear === null) {
        updateValue(props.modelValue)
    }
    emit('blur', e)
}

/**
 * @description 更新数据
 * @param {number} value
 */
const updateValue = (value: number | undefined) => {
    emit('update:modelValue', value)
    emit('change', value)
}

/**
 * @description 粘贴
 * @param {ClipboardEvent} e
 */
const handlePaste = (e: ClipboardEvent) => {
    const text = e.clipboardData?.getData('text')?.trim()
    const value = Number(text)
    if (text && !isNaN(value)) {
        updateValue(clamp(value, props.min, props.max))
    }
}

const expose = {
    focus,
    blur,
}

export type BaseNumberInputReturnsType = typeof expose

defineExpose(expose)
</script>
