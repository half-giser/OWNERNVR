/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-06 17:34:44
 * @Description: 智能分析 - 抓拍选项框
 */

import type { CheckboxValueType } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 是否选中
         */
        modelValue: {
            type: Boolean,
            default: false,
        },
        /**
         * @property 图片路径
         */
        src: {
            type: String,
            default: '',
        },
        /**
         * @property 比对的图像 （type === 'match' 的时候传入）
         */
        matchSrc: {
            type: String,
            default: '',
        },
        /**
         * @property {enum} 卡片类型 snap | panorama | match
         */
        type: {
            type: String,
            default: 'snap',
        },
        /**
         * @property 图标
         */
        play: {
            type: Boolean,
            default: false,
        },
        /**
         * @property 禁用选择
         */
        disabled: {
            type: Boolean,
            default: false,
        },
        /**
         * @property 错误提示信息
         */
        errorText: {
            type: String,
            default: '',
        },
        /**
         * @property 是否显示识别成功图标
         */
        identity: {
            type: Boolean,
            default: false,
        },
    },
    emits: {
        'update:modelValue'(bool: boolean) {
            return typeof bool === 'boolean'
        },
        detail() {
            return true
        },
    },
    setup(_prop, ctx) {
        /**
         * @description 选中/取消选中
         * @param {boolean} e
         */
        const changeValue = (e: CheckboxValueType) => {
            ctx.emit('update:modelValue', e as boolean)
        }

        return {
            changeValue,
        }
    },
})
