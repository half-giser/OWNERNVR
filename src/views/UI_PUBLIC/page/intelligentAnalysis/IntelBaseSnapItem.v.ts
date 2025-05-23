/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-21 10:30:00
 * @Description: 智能分析-人、车
 */

export default defineComponent({
    props: {
        /**
         * @property 当前搜索类型
         */
        searchType: {
            type: String,
            default: 'byFace',
        },
        /**
         * @property 当前目标详情数据项
         */
        targetData: {
            type: Object as PropType<IntelTargetDataItem>,
            default: () => new IntelTargetDataItem(),
            require: true,
        },
        /**
         * @property 当前打开的目标详情索引index
         */
        detailIndex: {
            type: String,
            default: '',
        },
        /**
         * @property 是否显示对比图
         */
        showCompare: {
            type: Boolean,
            default: false,
        },
        /**
         * @property 当前选择的对比图列表
         */
        choosePics: {
            type: Array as PropType<(IntelFaceDBSnapFaceList | IntelBodyDBSnapBodyList | IntelFaceDBFaceInfo)[]>,
            default: () => [new IntelFaceDBSnapFaceList()],
            require: true,
        },
    },
    emits: {
        detail() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const dateTime = useDateTimeStore()

        /**
         * @description 处理点击封面图事件（打开详情）
         */
        const handleClickCover = () => {
            ctx.emit('detail')
        }

        /**
         * @description 日期时间格式化
         * @param {number} timestamp 毫秒
         * @returns {String}
         */
        const displayDateTime = (timestamp: number) => {
            if (timestamp === 0) return ''
            return formatDate(timestamp, dateTime.dateTimeFormat)
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

        // 是否显示搜索按钮
        const showSearch = computed(() => {
            if (prop.searchType === 'byFace') {
                return systemCaps.supportFaceMatch
            } else if (prop.searchType === 'byBody') {
                return systemCaps.supportREID
            } else {
                return false
            }
        })

        // 是否显示导出按钮
        const showExport = computed(() => {
            return true
        })

        // 是否显示注册按钮
        const showRegister = computed(() => {
            if (prop.searchType === 'byFace') {
                return systemCaps.supportFaceMatch && prop.targetData.supportRegister
            } else if (prop.searchType === 'byPlateNumber') {
                return systemCaps.supportPlateMatch && prop.targetData.supportRegister
            } else {
                return false
            }
        })

        // 是否显示车牌号（只有车牌号界面才显示）
        const showPlateNumber = computed(() => {
            return prop.searchType === 'byPlateNumber' && prop.targetData.plateAttrInfo?.plateNumber
        })

        // 是否显示相似度
        const showSimilarity = computed(() => {
            return prop.showCompare && !!prop.targetData.similarity
        })

        // 当前目标数据对应的对比图
        const comparePicInfo = computed(() => {
            return prop.choosePics.find((item) => item.libIndex === prop.targetData.libIndex)
        })

        return {
            Translate,
            handleClickCover,
            displayDateTime,
            loadImg,
            showSearch,
            showExport,
            showRegister,
            showPlateNumber,
            showSimilarity,
            comparePicInfo,
        }
    },
})
