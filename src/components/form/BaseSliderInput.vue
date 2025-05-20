<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2025-04-11 19:58:15
 * @Description: 滑块组件
 * 基于Element-plus的滑块组件，但使用BaseNumberInput取代Element-plus内置的ElInputNumber
-->
<template>
    <div class="BaseSlider">
        <el-slider
            :model-value="modelValue"
            :show-input="false"
            :show-tooltip="false"
            :min="min"
            :max="max"
            :step="step"
            :disabled="disabled"
            @update:model-value="handleUpdate"
            @change="handleChange"
            @input="handleUpdate"
        />
        <div
            v-if="showControl"
            class="BaseSlider-btns"
        >
            <div
                class="BaseSlider-btn BaseSlider-btn--prev"
                :class="{
                    disabled: disabled || typeof modelValue === 'undefined' || modelValue <= min,
                }"
                @click="handlePrev"
            ></div>
            <div
                class="BaseSlider-btn BaseSlider-btn--next"
                :class="{
                    disabled: disabled || typeof modelValue === 'undefined' || modelValue >= max,
                }"
                @click="handleNext"
            ></div>
        </div>
        <BaseNumberInput
            v-if="showInput"
            :model-value="showValue"
            :min="min"
            :max="max"
            :step="step"
            :disabled="disabled"
            @update:model-value="handleUpdateDebounce"
            @blur="handleChange(modelValue)"
        />
    </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
    defineProps<{
        /**
         * @property 绑定值
         */
        modelValue?: number
        /**
         * @property 是否禁用
         */
        disabled?: boolean
        /**
         * @property 最小值
         */
        min?: number
        /**
         * @property 最大值
         */
        max?: number
        /**
         * @property 是否显示提示信息
         */
        // showTooltip?: boolean
        /**
         * @property 是否显示输入框
         */
        showInput?: boolean
        /**
         * @property 是否显示控制按钮
         */
        showControl?: boolean
        /**
         * @property 步长
         */
        step?: number
        /**
         * @property 禁用状态且值为undefined时的数字输入框显示
         */
        valueOnDisabled?: null | 'min'
    }>(),
    {
        disabled: false,
        min: 0,
        max: 100,
        // showTooltip: true,
        step: 1,
        showControl: false,
        showInput: true,
        valueOnDisabled: 'min',
    },
)

const emits = defineEmits<{
    (e: 'update:modelValue', modelValue: number): void
    (e: 'change', modelValue: number): void
    (e: 'input', modelValue: number): void
}>()

const showValue = computed(() => {
    if (props.disabled && !props.modelValue) {
        if (props.valueOnDisabled === 'min') {
            return props.min
        }
        return undefined
    }
    return props.modelValue
})

/**
 * @description 更新数值
 */
const handleUpdate = (e?: number | number[]) => {
    emits('update:modelValue', Number(e))
    emits('input', Number(e))
}

/**
 * @description 处理change事件
 */
const handleChange = (e?: number | number[]) => {
    emits('change', Number(e))
}

/**
 * @description 减小
 */
const handlePrev = () => {
    if (props.disabled || typeof props.modelValue === 'undefined' || props.modelValue <= props.min) {
        return
    }
    const value = Math.max(props.modelValue - props.step, props.min)
    handleUpdate(value)
    handleChange(value)
}

/**
 * @description 增加
 */
const handleNext = () => {
    if (props.disabled || typeof props.modelValue === 'undefined' || props.modelValue >= props.max) {
        return
    }
    const value = Math.min(props.modelValue + props.step, props.max)
    handleUpdate(value)
    handleChange(value)
}

const handleUpdateDebounce = debounce((e?: number) => handleUpdate(e))
</script>

<style lang="scss">
.BaseSlider {
    width: 100%;
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    padding-left: 8px;

    .BaseNumberInput {
        margin-left: 20px;
        height: var(--el-component-size);
        width: 40px !important;
        flex-shrink: 0;

        .el-input__inner {
            text-align: center;
        }
    }

    &-btns {
        display: flex;
        width: 35px;
        justify-content: space-between;
        flex-shrink: 0;
        margin-left: 8px;

        & + .BaseNumberInput {
            margin-left: 0;
        }
    }

    &-btn {
        width: 0;
        height: 0;
        border-width: 7px;
        border-style: solid;
        cursor: pointer;

        &.disabled {
            cursor: not-allowed;
        }

        &--prev {
            border-color: transparent var(--slider-btn-border) transparent transparent;

            &.disabled {
                border-color: transparent var(--slider-btn-border-disabled) transparent transparent;
            }
        }

        &--next {
            border-color: transparent transparent transparent var(--slider-btn-border);

            &.disabled {
                border-color: transparent transparent transparent var(--slider-btn-border-disabled);
            }
        }
    }
}
</style>
