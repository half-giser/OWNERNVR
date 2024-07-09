<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-14 13:46:45
 * @Description: 敏感信息脱敏变换的电子邮箱输入框
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-17 16:26:36
-->

<!--
@keywords: HideSensitiveInfo HideEmailAddress  
-->

<template>
    <el-input
        v-model="value"
        type="text"
        :maxlength="nameByteMaxLen"
        :formatter="formatInputMaxLength"
        :parser="formatInputMaxLength"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
    />
</template>

<script lang="ts" setup>
import { nameByteMaxLen } from '@/utils/constants'
import { formatInputMaxLength } from '@/utils/tools'

const prop = defineProps<{
    modelValue: string
}>()

const emits = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const value = ref('')

const handleBlur = () => {
    value.value = hideEmailAddress(prop.modelValue)
}

const handleFocus = () => {
    value.value = prop.modelValue
}

const handleInput = (e: string) => {
    emits('update:modelValue', e)
}
</script>
