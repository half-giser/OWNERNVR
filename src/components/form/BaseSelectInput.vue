<!--
 * @Date: 2025-05-16 16:39:14
 * @Description: 允许创建词条的选择器(增加规则校验)
 * （Element-Plus本身不提供方法为约束创建词条的字符规则，故实现此组件来增加字符校验能力）
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-select-v2
        ref="$select"
        v-format
        :model-value="modelValue"
        filterable
        allow-create
        :persistent="true"
        :options="options"
        :remote="false"
        @update:model-value="emit('update:modelValue', $event)"
        @visible-change="handleVisibleChange"
    />
</template>

<script lang="ts" setup>
import { type ElSelectV2 } from 'element-plus'
import { type ComponentInstance } from 'vue'

const props = withDefaults(
    defineProps<{
        modelValue: string
        isByte?: boolean
        maxlength?: number
        formatter?: (str: string) => string
        options: SelectOption<string, string>[]
        validate?: (str: string) => boolean
    }>(),
    {
        isByte: true,
        maxlength: nameByteMaxLen,
        formatter: (str: string) => str,
        options: () => [],
        modelValue: '',
        validate: () => true,
    },
)

const emit = defineEmits<{
    (e: 'outOfRange'): void
    (e: 'update:modelValue', event: string): void
    (e: 'visibleChange', bool: boolean): void
}>()

const popperObserver = usePopperObserver()
const $select = ref<ComponentInstance<typeof ElSelectV2>>()

const vFormat = {
    created(el: HTMLElement) {
        el.addEventListener('input', handleInput)
        el.addEventListener('compositionend', handleCompositionEnd)
    },
    beforeUnmount(el: HTMLElement) {
        el.removeEventListener('input', handleCompositionEnd)
        el.removeEventListener('compositionend', handleInput)
    },
}

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

const handleCompositionEnd = () => {
    $select.value!.states.inputValue = formatInput($select.value!.states.inputValue)
    const data = { target: { value: formatInput($select.value!.states.inputValue) } } as any as Event
    $select.value!.onInput(data)
}

const handleInput = () => {
    $select.value!.states.inputValue = formatInput($select.value!.states.inputValue)
    const data = { target: { value: formatInput($select.value!.states.inputValue) } } as any as Event
    $select.value!.onInput(data)
}

let cacheModelValue = ''

const focus = () => {
    $select.value?.focus()
}

const blur = () => {
    $select.value?.blur()
}

const hide = popperObserver.observe(blur, 'el-select-dropdown')

const handleVisibleChange = (bool: boolean) => {
    if (bool) {
        cacheModelValue = props.modelValue
        popperObserver.addListener(hide)
    } else {
        if (!props.validate(props.modelValue)) {
            emit('update:modelValue', cacheModelValue)
        }
        popperObserver.removeListener(hide)
    }

    emit('visibleChange', bool)
}

defineExpose({
    focus,
    blur,
})

onBeforeUnmount(() => {
    popperObserver.removeListener(hide)
})
</script>
