<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-14 13:46:45
 * @Description: 敏感信息脱敏变换的电子邮箱输入框
-->

<!--
@keywords: HideSensitiveInfo HideEmailAddress  
-->

<template>
    <el-input
        v-model="value"
        type="text"
        :formatter="formatInputMaxLength"
        :parser="formatInputMaxLength"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
    />
</template>

<script lang="ts" setup>
const prop = withDefaults(
    defineProps<{
        /**
         * @property 值
         */
        modelValue: string
        /**
         * @property 是否强制显示原值
         */
        showValue?: boolean
    }>(),
    {
        modelValue: '',
        showValue: false,
    },
)

const emits = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'focus'): void
    (e: 'blur'): void
}>()

const value = ref('')
const focusState = ref(false)

/**
 * @description 失去焦点时脱敏处理
 */
const handleBlur = () => {
    if (!prop.showValue) {
        handleHideSensitiveInfo()
    }
    focusState.value = false
    emits('blur')
}

/**
 * @description 获取焦点时显示原值
 */
const handleFocus = () => {
    handleShowSensitiveInfo()
    focusState.value = true
    emits('focus')
}

/**
 * @description 脱敏
 */
const handleHideSensitiveInfo = () => {
    value.value = hideEmailAddress(prop.modelValue)
}

/**
 * @description 显示原值
 */
const handleShowSensitiveInfo = () => {
    value.value = prop.modelValue
}

/**
 * @description 输入
 */
const handleInput = (e: string) => {
    emits('update:modelValue', e)
}

watch(
    () => prop.modelValue,
    () => {
        if (!prop.showValue && !focusState.value) {
            handleHideSensitiveInfo()
        } else {
            handleShowSensitiveInfo()
        }
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
