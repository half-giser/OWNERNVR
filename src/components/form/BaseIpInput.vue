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
                @paste.prevent="handlePaste($event, index)"
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
        /**
         * @property 是否允许IP地址为空值，若否，则输入框会默认填充0
         */
        allowEmpty?: boolean
    }>(),
    {
        disabled: false,
        invalidateMode: 'PREVENT',
        allowEmpty: false,
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
const updateValue = (value: number | '', index: number) => {
    let current: string | number = value
    if (typeof current === 'number') {
        if (prop.invalidateMode === 'PREVENT') {
            if (current > MAX_VALUE || current < MIN_VALUE) {
                current = address.value[index]
            }
        } else if (prop.invalidateMode === 'REPLACE') {
            current = clamp(current, MIN_VALUE, MAX_VALUE)
        }
    }

    const split: (string | number)[] = [...address.value]
    split[index] = current

    let join = ''
    if (prop.allowEmpty) {
        join = split.join('.')
        if (join === '...') join = ''
    } else {
        const filter = split.filter((i) => i === '')
        if (filter.length < split.length) {
            if (filter.length) {
                split.forEach((i, index) => {
                    if (i === '') split[index] = 0
                })
            }
            join = split.join('.')
        }
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
    if (typeof input.selectionStart === 'number') {
        return input.selectionStart === 0 && input.selectionEnd === input.value.length
    } else return false
}

/**
 * @description 处理键盘事件，并更改输入框的焦点、选中，校验输入数据的合法性
 * @param {Event} e
 * @param {number} index
 */
const handleKeyDown = (e: KeyboardEvent, index: number) => {
    const keyCode = e.key
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
        case 'v':
            if (e.ctrlKey) {
                isPreventDefault = false
            }
            break
        case 'c':
            if (e.ctrlKey) {
                isPreventDefault = false
            }
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
    const value = (e.target as HTMLInputElement).value
    if (prop.allowEmpty && value === '') {
        updateValue(value, index)
        return
    }
    const current = Number(value)
    const newValue = updateValue(current, index)
    ;(e.target as HTMLInputElement).value = String(newValue)
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
    if (!prop.allowEmpty) {
        const notEmpty = address.value.some((item, index) => {
            return index !== 0 && item !== 0 && item !== ''
        })
        if ((address.value[0] === 0 || address.value[0] === '') && notEmpty) {
            updateValue(1, 0)
        }
    }
}

/**
 * @description 粘贴
 * @param {ClipboardEvent} e
 * @param {number} index
 */
const handlePaste = (e: ClipboardEvent, index: number) => {
    const text = e.clipboardData?.getData('text')?.trim()
    if (text) {
        if (!isNaN(Number(text))) {
            const num = Number(text)
            if (num >= 0 && num <= 255) {
                updateValue(num, index)
            }
        } else if (checkIpV4(text)) {
            emits('update:modelValue', text)
            emits('change', text)
        }
    }
}
</script>

<style lang="scss">
.IpInput {
    border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
    box-shadow: 0 0 0 1px var(--input-border) inset;
    cursor: text;
    display: inline-flex;
    justify-content: flex-start;
    padding: 0 5px;
    transition: var(--el-transition-box-shadow);
    font-size: var(--el-font-size-base);
    width: 100%;
    height: var(--el-component-size);
    box-sizing: border-box;
    background: var(--input-bg);
    color: var(--input-text);

    &:hover:not(.disabled),
    &.is-focus:not(.disabled) {
        box-shadow: 0 0 0 1px var(--primary) inset;
        border-color: var(--primary);
    }

    &.disabled {
        box-shadow: 0 0 0 1px var(--input-border-disabled) inset;
        background-color: var(--input-bg-disabled);
        cursor: not-allowed;
        color: var(--el-disabled-text-color);

        span {
            color: var(--el-disabled-text-color);
        }
    }

    input {
        font-size: inherit;
        line-height: var(--el-component-size);
        height: var(--el-component-size);
        width: 22px;
        border: none;
        outline: 0;
        text-align: center;
        background: transparent;
        color: var(--input-text);
        padding: 0;

        &:disabled {
            color: var(--el-disabled-text-color);
            cursor: not-allowed;
        }
    }

    span {
        color: var(--input-text);
        line-height: calc(var(--el-component-size) - 2px);
    }
}
</style>
