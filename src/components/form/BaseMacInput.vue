<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-04 10:26:32
 * @Description: MAC地址输入框
-->
<template>
    <div
        ref="$MacContainer"
        class="MacInput"
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
                @blur="handleBlur(index)"
            />
            <span v-if="index !== address.length - 1">:</span>
        </template>
    </div>
</template>

<script lang="ts" setup>
type InvalidateMode = 'REPLACE' | 'PREVENT'
type InputMode = 'IPv6' | 'MAC'

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
         * @property MAC地址值
         */
        modelValue: string
        mode?: InputMode
    }>(),
    {
        disabled: false,
        invalidateMode: 'PREVENT',
        mode: 'MAC',
    },
)

const emits = defineEmits<{
    (e: 'change' | 'update:modelValue', value: string): void
}>()

const MAX_VALUE = 255
const MIN_VALUE = 0
const MAC_DEFAULT_VALUE = Array(6).fill('00')
const IPV6_DFAULT_VALUE = Array(8).fill('00')

const $MacContainer = ref<HTMLDivElement>()
const isFocus = ref(0)

const address = computed(() => {
    const arr = prop.mode === 'MAC' ? MAC_DEFAULT_VALUE : IPV6_DFAULT_VALUE
    const split = prop.modelValue.split(':')
    return arr.map((item, index) => {
        if (!split[index]) return item
        else return split[index]
    })
})

/**
 * @description 获取输入框元素
 * @param {number} index （index < 4)
 */
const getInputElement = (index: number) => {
    return $MacContainer.value!.querySelectorAll('input')[index]
}

/**
 * @description 更新数据，生成真实的IP地址
 * @param {number} value
 * @param {number} index
 */
const updateValue = (value: number, index: number) => {
    let current = value
    if (prop.invalidateMode === 'PREVENT') {
        if (current > MAX_VALUE || current < MIN_VALUE) {
            current = hexToDec(address.value[index])
        }
    } else if (prop.invalidateMode === 'REPLACE') {
        current = Math.min(MAX_VALUE, Math.max(MIN_VALUE, current))
    }
    const split = [...address.value]
    const hex = decToHex(current)
    split[index] = hex
    const join = split.join(':')
    emits('update:modelValue', join)
    emits('change', join)
    return hex
}

/**
 * @description 判断输入框的文本是否选中
 * @param {HTMLInputElement} input
 * @returns {boolean}
 */
const isTextSelected = (input: HTMLInputElement) => {
    if (typeof input.selectionStart === 'number') {
        return input.selectionStart === 0 && input.selectionEnd === input.value.length
    } else return false
    // else if (typeof document.selection != 'undefined') {
    //     input.focus()
    //     return document.selection.createRange().text == input.value
    // }
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
        case 'ArrowRight':
        case '.':
        case 'Tab':
            if (index < address.value.length - 1) {
                const $nextInput = getInputElement(index + 1)
                $nextInput.focus()
                $nextInput.select()
            }
            break
        case 'ArrowLeft':
            if (index > 0) {
                const $prevInout = getInputElement(index - 1)
                $prevInout.focus()
                $prevInout.select()
            }
            break
        case 'ArrowUp':
            updateValue(hexToDec(address.value[index]) + 1, index)
            break
        case 'ArrowDown':
            updateValue(hexToDec(address.value[index]) - 1, index)
            break
        case 'Backspace':
            isPreventDefault = false
            break
        default:
            if (/[0-9a-fA-F]/.test(keyCode)) {
                if (address.value[index].length < 2 || isTextSelected(e.target as HTMLInputElement)) {
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
    const current = hexToDec((e.target as HTMLInputElement).value)
    const value = updateValue(current, index)
    ;(e.target as HTMLInputElement).value = value
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
const handleBlur = (index: number) => {
    isFocus.value--
    const split = [...address.value]
    if (split[index].length === 1) {
        split[index] = '0' + split[index]
    }
    const join = split.join(':')
    emits('update:modelValue', join)
    emits('change', join)
}
</script>

<style lang="scss">
.MacInput {
    align-items: left;
    border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
    box-shadow: 0 0 0 1px var(--input-border) inset;
    cursor: text;
    display: inline-flex;
    justify-content: flex-start;
    padding: 0 11px;
    transform: translateZ(0);
    transition: var(--el-transition-box-shadow);
    font-size: var(--el-font-size-base);
    line-height: var(--el-component-size);
    width: var(--el-input-width);
    box-sizing: border-box;
    background: var(--input-bg);
    color: var(--input-text);

    &:hover,
    &.is-focus {
        box-shadow: 0 0 0 1px var(--primary) inset;
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
        color: var(--el-disabled-text-color);
        cursor: not-allowed;

        span {
            color: var(--el-disabled-text-color);
        }
    }

    input {
        max-width: 25%;
        width: 25px;
        font-size: inherit;
        line-height: calc(var(--el-component-size) - 2px);
        height: calc(var(--el-component-size) - 2px);
        border: none;
        outline: 0;
        text-align: center;
        background: transparent;
        color: var(--input-text);

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
