<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 15:24:33
 * @Description: 敏感信息脱敏变换的文本输入框
-->

<template>
    <el-input
        v-model="value"
        :formatter="formatInput"
        :parser="formatInput"
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
         * @property 敏感程度
         */
        level?: 'low' | 'high' | 'medium' | 'tail'
        /**
         * @property 是否强制显示原值
         */
        showValue?: boolean
        maxlength?: number
        isByte?: boolean
        formatter?: (str: string) => string
    }>(),
    {
        modelValue: '',
        level: 'medium',
        showValue: false,
        maxlength: nameByteMaxLen,
        isByte: true,
        formatter: (str: string) => str,
    },
)

const emits = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'focus'): void
    (e: 'blur'): void
    (e: 'outOfRange'): void
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
    value.value = hideSensitiveInfo(prop.modelValue, prop.level, 'name')
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

const formatInput = (str: string) => {
    if (!prop.isByte) {
        if (str.length > prop.maxlength) {
            emits('outOfRange')
            str = str.substring(0, prop.maxlength)
        }
        return prop.formatter(str)
    }

    if (getBytesLength(str) > prop.maxlength) {
        emits('outOfRange')
        str = getLimitBytesStr(str, prop.maxlength)
    }

    return prop.formatter(str)
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
