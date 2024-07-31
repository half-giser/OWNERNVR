/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:11:02
 * @Description: 现场预览-目标检测视图-渲染单个结构化抓拍元素
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 17:56:54
 */
import { DEFAULT_BODY_STRUCT_MAPPING, DEFAULT_NON_VEHICLE_STRUCT_MAPPING, DEFAULT_VEHICLE_STRUCT_MAPPING } from '@/utils/const/snap'
import { type WebsocketSnapOnSuccessSnap } from '@/utils/websocket/websocketSnap'

export default defineComponent({
    props: {
        /**
         * @description 抓拍数据
         */
        data: {
            type: Object as PropType<WebsocketSnapOnSuccessSnap>,
            required: true,
        },
        /**
         * @description 边框类型
         */
        border: {
            type: Number,
            required: false,
            default: 0,
        },
        /**
         * @description 时间格式
         */
        timeFormat: {
            type: String,
            required: true,
            default: 'hh:mm:ss',
        },
    },
    emits: {
        add() {
            return true
        },
        detail() {
            return true
        },
        search() {
            return true
        },
        playRec() {
            return true
        },
    },
    setup(prop) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        /**
         * @description 显示Base64图像
         * @param {String} src
         * @returns {String}
         */
        const displayBase64Img = (src?: null | string) => {
            return 'data:image/png;base64,' + String(src)
        }

        /**
         * @description 格式化时间
         * @param {number} time
         * @returns {String}
         */
        const displayTime = (time: number) => {
            return formatDate(time, prop.timeFormat)
        }

        // 是否显示注册按钮
        const isAddBtn = computed(() => {
            return (
                (systemCaps.supportFaceMatch && prop.data.type === 'face_detect') ||
                prop.data.type === 'face_verify' ||
                (systemCaps.supportPlateMatch && prop.data.type === 'vehicle_plate' && prop.data.info.compare_status !== 1)
            )
        })

        /**
         * @description 获取信息列表项
         * @param {String} icon
         * @param {String} value
         * @returns {Object}
         */
        const getInfoListItem = (icon: string, value: string) => {
            return {
                icon,
                value: !value || value === '--' ? Translate('IDCS_UNCONTRAST') : value,
            }
        }

        // 信息列表
        const infoList = computed(() => {
            const targetType = prop.data.info.target_type
            if (targetType === 'person') {
                const type = prop.data.info.person_info
                return DEFAULT_BODY_STRUCT_MAPPING.slice(0, 4).map((item) => {
                    const value = type[item.type]
                    return getInfoListItem(item.type, String(value))
                })
            }
            if (targetType === 'vehicle') {
                const type = prop.data.info.car_info
                return DEFAULT_VEHICLE_STRUCT_MAPPING.filter((item) => {
                    return !['year', 'model'].includes(item.type)
                }).map((item) => {
                    let value = item.map ? item.map[Number(type[item.type])] : type[item.type]
                    if (item.type === 'brand' && !value) value = Translate('IDCS_MAINTENSIGN_ITEM_OTHERSYS')
                    return getInfoListItem('vehicle_' + item.type, String(value))
                })
            }
            if (targetType === 'non_vehicle') {
                const type = prop.data.info.bike_info
                return DEFAULT_NON_VEHICLE_STRUCT_MAPPING.map((item) => {
                    const value = item.map[Number(type[item.type])]
                    return getInfoListItem('nonVehicle_' + item.type, value)
                })
            }
            return []
        })

        return {
            displayBase64Img,
            displayTime,
            isAddBtn,
            infoList,
        }
    },
})
