<!--
 * @Date: 2025-06-06 10:01:51
 * @Description: 下拉选择框. 由于ElSelectV2不能完全满足项目要求，故扩展实现了此选择框
 * （1）如果下拉选项为空，el-select-v2会显示原值，但我们需要显示为空
 * （2）下拉选择框需支持滚动页面后自动关闭，否则下拉菜单会一直显示
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-select-v2
        ref="$select"
        :model-value="modelValue"
        :options="computedOptions"
        :persistent
        :popper-class="persistent ? `intersect-ocx ${popperClass}` : popperClass"
        :disabled
        :append-to
        :props
        :placeholder
        :teleported
        @visible-change="handleVisibleChange"
        @change="emit('change', $event)"
        @update:model-value="emit('update:modelValue', $event)"
    />
</template>

<script lang="ts" setup>
import { type ElSelectV2 } from 'element-plus'
import { type OptionType } from 'element-plus/es/components/select-v2/src/select.types.mjs'
import { type Props } from 'element-plus/lib/components/select-v2/src/useProps.js'
import { type ComponentInstance } from 'vue'

const prop = withDefaults(
    defineProps<{
        modelValue: any
        options: OptionType[]
        persistent?: boolean
        popperClass?: string
        placeholder?: string
        disabled?: boolean
        appendTo?: string
        props?: Props
        emptyText?: string | null
        teleported?: boolean
    }>(),
    {
        persistent: false,
        popperClass: '',
        placeholder: '',
        disabled: false,
        emptyText: null,
        teleported: true,
    },
)

const emit = defineEmits<{
    (e: 'update:modelValue', event: any): void
    (e: 'visibleChange', bool: boolean): void
    (e: 'change', event: any): void
}>()

const popperObserver = usePopperObserver()
const $select = ref<ComponentInstance<typeof ElSelectV2>>()

const focus = () => {
    $select.value?.focus()
}

const blur = () => {
    $select.value?.blur()
}

const hide = popperObserver.observe(blur, 'el-select-dropdown')

const handleVisibleChange = (bool: boolean) => {
    if (bool) {
        popperObserver.addListener(hide)
    } else {
        popperObserver.removeListener(hide)
    }

    emit('visibleChange', bool)
}

const computedOptions = computed(() => {
    if (!prop.options.length && typeof prop.emptyText === 'string') {
        return [
            {
                [prop.props?.label || 'label']: prop.emptyText,
                [prop.props?.value || 'value']: prop.modelValue,
            },
        ]
    }

    return prop.options
})

const expose = {
    focus,
    blur,
}

export type BaseSelectReturnsType = typeof expose

defineExpose(expose)

onBeforeUnmount(() => {
    popperObserver.removeListener(hide)
})
</script>
