<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-04 10:26:32
 * @Description: IPv4地址输入框
-->
<template>
    <div
        ref="$IpContainer"
        class="IpInput"
        :class="{ 'is-focus': isFocus, disabled: prop.disabled }"
    >
        <template
            v-for="(item, index) in address"
            :key="index"
        >
            <input
                :value="item"
                type="text"
                :disabled="prop.disabled"
                @keydown="handleKeyDown($event, index)"
                @input="handleInput($event, index)"
                @focus="handleFocus"
                @blur="handleBlur"
            />
            <span v-if="index !== address.length - 1">.</span>
        </template>
    </div>
</template>

<script lang="ts" setup>
type InvalidateMode = 'REPLACE' | 'PREVENT'

const prop = withDefaults(
    defineProps<{
        /**
         * @property 是否禁用输入框
         */
        disabled?: boolean
        /**
         * @property 无效值处理方式
         */
        invalidateMode?: InvalidateMode
        /**
         * @property IP地址值
         */
        modelValue: string
    }>(),
    {
        disabled: false,
        invalidateMode: 'PREVENT',
    },
)

const emits = defineEmits<{
    (e: 'change' | 'update:modelValue', value: string): void
}>()

const MAX_VALUE = 255
const MIN_VALUE = 0
const IPV4_DFAULT_VALUE = Array(4).fill(0)

const $IpContainer = ref<HTMLDivElement>()
const isFocus = ref(0)

// IP地址数组
const address = computed(() => {
    const split = prop.modelValue.split('.')
    return IPV4_DFAULT_VALUE.map((_item, index) => {
        if (!split[index]) return ''
        else return Number(split[index])
    })
})

/**
 * @description 获取输入框元素
 * @param {number} index （index < 4)
 */
const getInputElement = (index: number) => {
    return $IpContainer.value!.querySelectorAll('input')[index]
}

/**
 * @description 更新数据，生成真实的IP地址
 * @param {number} value
 * @param {number} index
 */
const updateValue = (value: number, index: number) => {
    let current: string | number = value
    if (prop.invalidateMode === 'PREVENT') {
        if (current > MAX_VALUE || current < MIN_VALUE) {
            current = address.value[index]
        }
    } else if (prop.invalidateMode === 'REPLACE') {
        current = Math.min(MAX_VALUE, Math.max(MIN_VALUE, current))
    }

    const split: (string | number)[] = [...address.value]
    split[index] = current

    const filter = split.filter((i) => i === '')

    let join = ''
    if (filter.length < split.length) {
        if (filter.length > 0) {
            split.forEach((i, index) => {
                if (i === '') split[index] = 0
            })
        }
        join = split.join('.')
    }

    emits('update:modelValue', join)
    emits('change', join)
    return current
}

/**
 * @description 判断输入框的文本是否选中
 * @param {HTMLInputElement} input
 * @returns {boolean}
 */
const isTextSelected = (input: HTMLInputElement) => {
    if (typeof input.selectionStart == 'number') {
        return input.selectionStart === 0 && input.selectionEnd == input.value.length
    } else return false
}

/**
 * @description 处理键盘事件，并更改输入框的焦点、选中，校验输入数据的合法性
 * @param {Event} e
 * @param {number} index
 */
const handleKeyDown = (e: Event, index: number) => {
    const keyCode = (e as KeyboardEvent).key
    let isPreventDefault = true

    switch (keyCode) {
        // 选中下一个输入框
        case 'ArrowRight':
        case '.':
        case 'Tab':
            if (index < address.value.length - 1) {
                const $nextInput = getInputElement(index + 1)
                $nextInput.focus()
                $nextInput.select()
            }
            break
        // 选中上一个输入框
        case 'ArrowLeft':
            if (index > 0) {
                const $prevInout = getInputElement(index - 1)
                $prevInout.focus()
                $prevInout.select()
            }
            break
        // 数值增加
        case 'ArrowUp':
            updateValue(Number(address.value[index]) + 1, index)
            break
        // 数值减少
        case 'ArrowDown':
            updateValue(Number(address.value[index]) - 1, index)
            break
        // 删除数值
        case 'Backspace':
            isPreventDefault = false
            break
        // 校验输入的数字合法性，合法则执行输入事件
        default:
            if (/[0-9]/.test(keyCode)) {
                if (Number(address.value[index]) < 100 || isTextSelected(e.target as HTMLInputElement)) {
                    isPreventDefault = false
                }
            }
            break
    }

    if (isPreventDefault) {
        e.preventDefault()
    }
    return false
}

/**
 * @description 处理输入事件，更新数据
 * @param {Event} e
 * @param {number} index
 */
const handleInput = (e: Event, index: number) => {
    const current = Number((e.target as HTMLInputElement).value)
    const value = updateValue(current, index)
    ;(e.target as HTMLInputElement).value = String(value)
}

/**
 * @description 处理焦点事件，选中输入框
 */
const handleFocus = (e: Event) => {
    isFocus.value++
    ;(e.target as HTMLInputElement).select()
}

/**
 * @description 处理丧失焦点事件
 */
const handleBlur = () => {
    isFocus.value--
}
</script>

<style lang="scss">
.IpInput {
    // --el-input-inner-height: 28px;

    align-items: left;
    border: 1px solid var(--input-border);
    border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
    box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
    cursor: text;
    display: inline-flex;
    justify-content: flex-start;
    padding: 0 11px;
    transform: translateZ(0);
    transition: var(--el-transition-box-shadow);
    font-size: var(--el-font-size-base);
    line-height: calc(var(--el-component-size) - 2px);
    width: var(--el-input-width);
    box-sizing: border-box;
    background: var(--el-input-bg-color, var(--el-fill-color-blank));

    &:hover,
    &.is-focus {
        box-shadow: 0 0 0 1px var(--el-input-hover-border-color) inset;
        border-color: var(--primary);

        &.disabled {
            background-color: var(--input-bg-disabled);
            border-color: var(--input-border-disabled);
        }
    }

    &.disabled {
        box-shadow: none;
        background-color: var(--input-bg-disabled);
        border-color: var(--input-border-disabled);
        cursor: not-allowed;
        color: var(--el-disabled-text-color);

        span {
            color: var(--el-disabled-text-color);
        }
    }

    input {
        max-width: 25%;
        font-size: inherit;
        line-height: calc(var(--el-component-size) - 4px);
        height: calc(var(--el-component-size) - 4px);
        width: 25px;
        border: none;
        outline: 0;
        text-align: center;
        background: transparent;

        &:disabled {
            color: var(--el-disabled-text-color);
            cursor: not-allowed;
        }
    }

    span {
        color: var(--input-text);
    }
}
</style>
