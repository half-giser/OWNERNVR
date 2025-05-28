/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 18:48:19
 * @Description: 人脸卡片
 */
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
         * @property 卡片类型
         */
        type: {
            type: String,
            default: 'checkbox',
        },
        /**
         * @property 选项模式中 是否禁用选择
         */
        disabled: {
            type: Boolean,
            default: false,
        },
        /**
         * @property 图标
         */
        icon: {
            type: String,
            default: '',
        },
    },
    emits: {
        'update:modelValue'(bool: boolean) {
            return typeof bool === 'boolean'
        },
    },
    setup(prop, ctx) {
        /**
         * @description 选中/取消选中
         * @param {boolean} e
         */
        const changeValue = (e: boolean) => {
            if (prop.type === 'checkbox' && !prop.disabled) {
                ctx.emit('update:modelValue', e)
            }
        }

        return {
            changeValue,
        }
    },
})
