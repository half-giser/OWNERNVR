<!--
 * @Date: 2025-04-17 20:24:14
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Description: 文本输入框（限制字符长度）
-->
<template>
    <el-input
        ref="$input"
        :formatter="formatInput"
        :parser="formatInput"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
        @input="emit('input', $event)"
    />
</template>

<script lang="ts" setup>
import type { InputInstance } from 'element-plus'

const props = withDefaults(
    defineProps<{
        isByte?: boolean
        maxlength?: number
        formatter?: (str: string) => string
    }>(),
    {
        isByte: true,
        maxlength: nameByteMaxLen,
        formatter: (str: string) => str,
    },
)

const emit = defineEmits<{
    (e: 'focus', event: FocusEvent): void
    (e: 'blur', event: FocusEvent): void
    (e: 'input', value: string): void
    (e: 'outOfRange'): void
}>()

const $input = ref<InputInstance>()

const focus = () => {
    $input.value?.focus()
}

const blur = () => {
    $input.value?.blur()
}

const expose = {
    focus,
    blur,
}

export type BasePasswordReturnsType = typeof expose

defineExpose(expose)

const formatInput = (str: string) => {
    if (!props.isByte) {
        if (str.length > props.maxlength) {
            emit('outOfRange')
            str = str.substring(0, props.maxlength)
        }
        return props.formatter(str)
    }

    if (getBytesLength(str) > props.maxlength) {
        emit('outOfRange')
        str = getLimitBytesStr(str, props.maxlength)
    }

    return props.formatter(str)
}
</script>
