/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-06 17:34:44
 * @Description: 智能分析 - 抓拍选项框
 */

import type { CheckboxValueType } from 'element-plus'
import { DEFAULT_BODY_STRUCT_MAPPING, DEFAULT_NON_VEHICLE_STRUCT_MAPPING, DEFAULT_VEHICLE_STRUCT_MAPPING } from '@/utils/const/snap'

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
         * @property {enum} 卡片类型 snap | panorama | match | struct
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
        /**
         * @property 视频结构化属性
         */
        attributes: {
            type: Object as PropType<Record<string, string | number>>,
            default: () => ({}),
        },
        /**
         * @property 视频结构化目标
         */
        targetType: {
            type: String,
            default: 'person',
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
    setup(prop, ctx) {
        const { Translate } = useLangStore()

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

        /**
         * @description 获取信息列表项
         * @param {String} icon
         * @param {String} value
         * @returns {Object}
         */
        const getInfoListItem = (icon: string, value: string) => {
            return {
                icon,
                value: !value || value === '--' ? Translate('IDCS_UNCONTRAST') : Translate(value),
            }
        }

        const infoList = computed(() => {
            if (prop.type !== 'struct') {
                return []
            }

            if (prop.targetType === 'person') {
                return DEFAULT_BODY_STRUCT_MAPPING.slice(0, 5).map((item) => {
                    const value = prop.attributes[item.type]
                    return getInfoListItem(item.type, item.map[Number(value)])
                })
            }

            if (prop.targetType === 'vehicle') {
                return DEFAULT_VEHICLE_STRUCT_MAPPING.filter((item) => {
                    return !['year', 'model'].includes(item.type)
                }).map((item) => {
                    let value = item.map ? item.map[Number(prop.attributes[item.type])] : prop.attributes[item.type]
                    if (item.type === 'brand' && !value) value = Translate('IDCS_MAINTENSIGN_ITEM_OTHERSYS')
                    return getInfoListItem('vehicle_' + item.type, item.map[Number(value)])
                })
            }

            if (prop.targetType === 'non_vehicle') {
                return DEFAULT_NON_VEHICLE_STRUCT_MAPPING.map((item) => {
                    return getInfoListItem('nonVehicle_' + item.type, item.map[Number(prop.attributes[item.type])])
                })
            }
        })

        return {
            changeValue,
            loadImg,
            infoList,
        }
    },
})
