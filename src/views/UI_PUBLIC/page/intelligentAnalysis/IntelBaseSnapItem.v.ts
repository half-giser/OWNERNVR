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

        /**
         * @description 图片按规则自适应父容器
         * 显示规则：
         * 1、如果图片实际尺寸高>=宽，在高>=宽的区域铺满显示；在高<宽的区域按真实比例显示，左右留白
         * 2、如果图片实际尺寸高<宽，在高<=宽的区域铺满显示；在高>宽的区域按真实比例显示，上下留白
         * @param {Event} e
         */
        const loadImg = (e: Event) => {
            const img = e.currentTarget as HTMLImageElement
            // 图片实际尺寸高>=宽
            if (img.naturalHeight >= img.naturalWidth) {
                // 在高>=宽的区域铺满显示
                if (img.height >= img.width) {
                    img.style.objectFit = 'fill'
                }
                // 在高<宽的区域按真实比例显示，左右留白
                else {
                    img.style.objectFit = 'contain'
                }
            }
            // 图片实际尺寸高<宽
            else {
                // 高<=宽的区域铺满显示
                if (img.height <= img.width) {
                    img.style.objectFit = 'fill'
                }
                // 在高>宽的区域按真实比例显示，上下留白
                else {
                    img.style.objectFit = 'contain'
                }
            }
        }

        return {
            changeValue,
            loadImg,
        }
    },
})
