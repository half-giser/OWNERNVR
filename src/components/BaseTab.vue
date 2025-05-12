<!--
 * @Date: 2025-05-06 19:24:31
 * @Description: Tab
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="base-head-box BaseTab">
        <div
            v-for="item in options"
            :key="item.value"
            :class="{
                active: modelValue === item.value,
                hide: item.disabled,
            }"
            @click="change(item)"
        >
            {{ item.label }}
        </div>
    </div>
</template>

<script lang="ts" setup>
defineProps<{
    options: SelectOption<string, string>[]
    modelValue: string
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'change', value: string): void
}>()

const change = (item: SelectOption<string, string>) => {
    if (item.disabled) {
        return
    }

    emits('update:modelValue', item.value)
    emits('change', item.value)
}
</script>

<style lang="scss" scoped>
.BaseTab {
    display: flex;
    user-select: none;

    & > div {
        margin-right: 30px;
        color: var(--main-text);
        cursor: pointer;

        &.hide {
            display: none;
        }

        &.active,
        &:hover {
            color: var(--primary);
        }
    }
}
</style>
