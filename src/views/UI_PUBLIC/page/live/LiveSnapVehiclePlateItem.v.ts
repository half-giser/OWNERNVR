/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:10:18
 * @Description: 现场预览-目标检测视图-渲染单个抓拍元素组件
 */
import { DEFAULT_NON_VEHICLE_STRUCT_MAPPING, DEFAULT_PLATE_VEHICLE_STRUCT_MAPPING, DEFAULT_VEHICLE_PLATE_STRUCT_MAPPING } from '@/utils/const/snap'

export default defineComponent({
    props: {
        /**
         * @property 抓拍数据
         */
        data: {
            type: Object as PropType<WebsocketSnapOnSuccessSnap>,
            required: true,
        },
        /**
         * @property 边框类型
         */
        border: {
            type: Number,
            default: 0,
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
        const systemCaps = useCababilityStore()
        const { Translate, getTextDir } = useLangStore()
        const dateTime = useDateTimeStore()

        // 车牌识别与文本映射
        const PLATE_RECOGNISE_MAPPING: Record<number, string> = {
            0: '',
            1: Translate('IDCS_SUCCESSFUL_RECOGNITION'),
            3: Translate('IDCS_STRANGE_PLATE'),
        }

        /**
         * @description 显示Base64图像
         * @param {String} src
         * @returns {String}
         */
        const displayBase64Img = (src?: null | string) => {
            if (!src) return ''
            return wrapBase64Img(src)
        }

        /**
         * @description 格式化时间
         * @param {number} time
         * @returns {string}
         */
        const displayTime = (time: number) => {
            return formatDate(time, dateTime.timeFormat)
        }

        // 显示信息
        const displayMsg = computed(() => {
            const plateNum = prop.data.info!.plate || '--'
            // 车牌比对成功
            if (prop.data.info!.compare_status === 1) {
                return `(${plateNum})`
            }

            // 陌生车牌
            if (prop.data.info!.compare_status === 3) {
                return `(${plateNum})`
            }

            return plateNum
        })

        // 显示提示文本
        const displayTip = computed(() => {
            const plateRecognise = PLATE_RECOGNISE_MAPPING[prop.data.info!.compare_status]
            const plateGroup = prop.data.info!.group_name
            const plateTip = prop.data.info!.text_tip || ''
            if (prop.data.info!.compare_status === 1) {
                return plateTip || plateGroup
            }

            if (prop.data.info!.compare_status === 3) {
                return plateTip || plateRecognise
            }
            return ''
        })

        // 显示边框
        const msgBorder = computed(() => {
            if (prop.data.type === 'vehicle_plate' && prop.data.info!.compare_status === 3) {
                return true
            }
            return false
        })

        // 是否显示注册按钮
        const isAddBtn = computed(() => {
            return (
                (systemCaps.supportFaceMatch && prop.data.type === 'face_detect') ||
                (prop.data.type === 'face_verify' && prop.data.info!.compare_status !== 6) ||
                (systemCaps.supportPlateMatch && prop.data.type === 'vehicle_plate' && prop.data.info!.compare_status !== 1)
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
                value: !value || value === '--' ? Translate('IDCS_UNCONTRAST') : Translate(value),
            }
        }

        // 信息列表
        const infoList = computed(() => {
            if (Number(prop.data.info!.vehicle_type) === 2) {
                const type = prop.data.info!.bike_info ?? {}
                return DEFAULT_NON_VEHICLE_STRUCT_MAPPING.map((item) => {
                    return getInfoListItem('nonVehicle_' + item.type, item.map[Number(type[item.type])])
                })
            }

            const type = prop.data.info!.car_info ?? {}
            return DEFAULT_PLATE_VEHICLE_STRUCT_MAPPING.map((item) => {
                return getInfoListItem('vehicle_' + item.type, item.map[Number(type[item.type])])
            })
        })

        const vehiclePlateInfoList = computed(() => {
            const type = (prop.data.info!.target_type === 'vehicle' ? prop.data.info!.car_info : prop.data.info!.bike_info) ?? {}
            return DEFAULT_VEHICLE_PLATE_STRUCT_MAPPING.filter((item) => !['plate', 'owner', 'mobile_phone_number', 'group_name'].includes(item.type)).map((item) => {
                return getInfoListItem('vehicle_plate_' + item.type, item.map[Number(type[item.type])])
            })
        })

        const loadImg = (e: Event) => {
            const img = e.currentTarget as HTMLImageElement
            if (img.naturalWidth > img.naturalHeight) {
                img.style.objectFit = 'contain'
            } else {
                img.style.objectFit = 'fill'
            }
        }

        return {
            displayBase64Img,
            displayTime,
            displayMsg,
            displayTip,
            isAddBtn,
            msgBorder,
            getTextDir,
            loadImg,
            infoList,
            vehiclePlateInfoList,
        }
    },
})
