/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-28 14:12:55
 * @Description: 实时过车记录 - 详情弹窗
 */
import ParkLotSnapPanel from './ParkLotSnapPanel.vue'
import ParkLotInfoPanel from './ParkLotInfoPanel.vue'

export default defineComponent({
    components: {
        ParkLotSnapPanel,
        ParkLotInfoPanel,
    },
    props: {
        /**
         * @property {Array} 实时过车记录列表
         */
        list: {
            type: Array as PropType<BusinessParkingLotList[]>,
            required: true,
        },
        /**
         * @property {Number} 当前索引
         */
        index: {
            type: Number,
            required: true,
        },
        /**
         * @property {String} 弹窗类型 edit: 可编辑；read：不可编辑
         */
        type: {
            type: String as PropType<'edit' | 'read'>,
            default: 'edit',
        },
        remarkSwitch: {
            type: Boolean,
            default: true,
        },
    },
    emits: {
        updatePlate(index: number, plate: string) {
            return typeof index === 'number' && typeof plate === 'string'
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const pageData = ref({
            index: 0,
            list: [] as BusinessParkingLotList[],
            // relativeList: [] as BusinessParkingLotRelevantList[],
            isRemarkPop: false,
            isEnterImgLoading: false,
            isExitImgLoading: false,
        })

        const cloneData = new BusinessParkingLotList()

        const current = computed(() => {
            if (pageData.value.list[pageData.value.index]) {
                return pageData.value.list[pageData.value.index]
            } else {
                return cloneData
            }
        })

        /**
         * @description 抓拍图片
         * @param {String} chlId
         * @param {String} frameTime
         * @param {number} eventType
         * @param {String} imgId
         */
        const getParkImg = async (chlId: string, frameTime: string, eventType: number, imgId: string, isSnap = false) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                    <frameTime>${frameTime}</frameTime>
                    <eventType>${eventType}</eventType>
                    <imgId>${imgId}</imgId>
                    ${isSnap ? '' : '<isPanorama />'}
                </condition>
            `
            const result = await requestSmartTargetSnapImage(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                const img = $('content').text()

                const width = $('rect/ptWidth').text().num() || 1
                const height = $('rect/ptHeight').text().num() || 1
                const leftTopX = $('rect/leftTopX').text().num()
                const leftTopY = $('rect/leftTopY').text().num()
                const rightBottomX = $('rect/rightBottomX').text().num()
                const rightBottomY = $('rect/rightBottomY').text().num()

                return {
                    master: $('owner').text() || '--',
                    phoneNum: $('ownerPhone').text() || '--',
                    img: img ? wrapBase64Img(img) : '',
                    traceObj: {
                        X1: leftTopX / width,
                        Y1: leftTopY / height,
                        X2: rightBottomX / width,
                        Y2: rightBottomY / height,
                    },
                }
            } else {
                return {
                    master: '--',
                    phoneNum: '--',
                    img: '',
                    traceObj: {
                        width: 1,
                        height: 1,
                        X1: 0,
                        Y1: 0,
                        X2: 0,
                        Y2: 0,
                    },
                }
            }
        }

        /**
         * @description 打开弹窗时 重置弹窗信息
         */
        const open = () => {
            pageData.value.index = prop.index

            if (prop.list.length) {
                pageData.value.list = prop.list
                getImgData()
            } else {
                pageData.value.list = []
            }
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 上一条数据
         */
        const handlePrev = () => {
            if (pageData.value.index > 0) {
                pageData.value.index--
            }
            getImgData()
        }

        /**
         * @description 下一条数据
         */
        const handleNext = () => {
            if (pageData.value.index < pageData.value.list.length - 1) {
                pageData.value.index++
            }
            getImgData()
        }

        const getImgData = async () => {
            const item = pageData.value.list[pageData.value.index]

            if (item.isHistory) {
                if (item.isEnter && !item.enterImg) {
                    pageData.value.isEnterImgLoading = true
                    const data = await getParkImg(item.enterChlId, item.enterFrameTime, item.eventType, item.enterVehicleId)
                    item.master = data.master
                    item.phoneNum = data.phoneNum
                    item.enterImg = data.img
                    item.enterTraceObj = data.traceObj

                    const snapData = await getParkImg(item.enterChlId, item.enterFrameTime, item.eventType, item.enterVehicleId, true)
                    item.enterSnapImg = snapData.img

                    pageData.value.isEnterImgLoading = false
                }

                if (item.isExit && !item.exitImg) {
                    pageData.value.isExitImgLoading = true
                    const data = await getParkImg(item.exitChlId, item.exitFrameTime, item.eventType, item.exitVehicleId)
                    item.master = data.master
                    item.phoneNum = data.phoneNum
                    item.exitImg = data.img
                    item.exitTraceObj = data.traceObj

                    const snapData = await getParkImg(item.exitChlId, item.exitFrameTime, item.eventType, item.exitVehicleId, true)
                    item.exitSnapImg = snapData.img
                    pageData.value.isExitImgLoading = false
                }
            }
        }

        return {
            current,
            pageData,
            handleNext,
            handlePrev,
            close,
            open,
        }
    },
})
