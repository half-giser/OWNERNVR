<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 15:24:33
 * @Description: 敏感信息脱敏变换的文本输入框
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-11 09:20:39
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

const prop = withDefaults(
    defineProps<{
        /**
         * @property 值
         */
        modelValue: string
        /**
         * @property 敏感程度
         */
        level?: 'low' | 'high' | 'medium' | 'tail'
        /**
         * @property 是否强制显示原值
         */
        showValue?: boolean
    }>(),
    {
        modelValue: '',
        level: 'medium',
        showValue: false,
    },
)

const emits = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'focus'): void
    (e: 'blur'): void
}>()

const value = ref('')

const handleBlur = () => {
    if (!prop.showValue) {
        handleHideSensitiveInfo()
    }
    emits('blur')
}

const handleFocus = () => {
    handleShowSensitiveInfo()
    emits('focus')
}

const handleHideSensitiveInfo = () => {
    value.value = hideSensitiveInfo(prop.modelValue, prop.level, 'name')
}

const handleShowSensitiveInfo = () => {
    value.value = prop.modelValue
}

const handleInput = (e: string) => {
    emits('update:modelValue', e)
}

const stopWatch = watch(
    () => prop.modelValue,
    () => {
        handleBlur()
        stopWatch()
    },
)

watch(
    () => prop.showValue,
    (newVal) => {
        if (newVal) {
            handleShowSensitiveInfo()
        } else {
            handleHideSensitiveInfo()
        }
    },
    {
        immediate: true,
    },
)
</script>
