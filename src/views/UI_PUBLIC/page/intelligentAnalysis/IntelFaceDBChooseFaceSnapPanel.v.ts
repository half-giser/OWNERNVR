/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 18:47:52
 * @Description: 智能分析 - 选择人脸 - 从抓拍库选择
 */
import IntelBaseFaceItem from './IntelBaseFaceItem.vue'

export default defineComponent({
    components: {
        IntelBaseFaceItem,
    },
    props: {
        /**
         * @property 嵌入此组件的弹窗是否打开
         */
        visible: {
            type: Boolean,
            default: false,
        },
        /**
         * @property 是否支持多选
         */
        multiple: {
            type: Boolean,
            default: false,
        },
    },
    emits: {
        change(item: IntelFaceDBSnapFaceList[]) {
            return Array.isArray(item)
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        const chlMap: Record<string, string> = {}
        let cachePic: Record<string, { pic: string; featureStatus: boolean }> = {}

        const pageData = ref({
            // 日期范围类型
            dateRangeType: 'date',
            // 通道列表
            chlList: [] as SelectOption<string, string>[],
            // 是否选中所有通道
            isAllChl: false,
            // 是否显示选择通道弹窗
            isSelectChlPop: false,
        })

        const formData = ref({
            pageIndex: 1,
            pageSize: 18,
            dateRange: [0, 0] as [number, number],
            chls: [] as SelectOption<string, string>[],
            faceIndex: [] as number[],
        })

        const listData = ref<IntelFaceDBSnapFaceList[]>([])
        const filterListData = ref<IntelFaceDBSnapFaceList[]>([])

        /**
         * @description 打开通道弹窗
         */
        const changeChl = () => {
            pageData.value.isSelectChlPop = true
        }

        /**
         * @description 确认更改通道
         * @param {Array} rows
         */
        const confirmChangeChl = (rows: SelectOption<string, string>[]) => {
            formData.value.chls = rows
            pageData.value.isAllChl = formData.value.chls.length === pageData.value.chlList.length
        }

        /**
         * @description 通道全选/取消全选
         */
        const changeAllChl = () => {
            if (pageData.value.isAllChl) {
                formData.value.chls = cloneDeep(pageData.value.chlList)
                searchData()
            } else {
                formData.value.chls = []
                searchData()
            }
        }

        /**
         * @description 更改时间范围类型
         * @param {Array} value 时间戳 ms
         * @param {String} type
         */
        const changeDateRange = (value: [number, number], type: string) => {
            formData.value.dateRange = [...value]
            if (type === 'today') {
                pageData.value.dateRangeType = 'date'
            } else {
                pageData.value.dateRangeType = type
            }
        }

        /**
         * @description 检索抓怕数据列表
         */
        const searchData = async () => {
            openLoading()

            const sendXml = rawXml`
                <resultLimit>10000</resultLimit>
                <condition>
                    <startTime>${localToUtc(formData.value.dateRange[0])}</startTime>
                    <endTime>${localToUtc(formData.value.dateRange[1])}</endTime>
                    <chls type="list">${formData.value.chls.map((item) => `<item id="${item.value}" />`).join('')}</chls>
                    <event>
                        <eventType>byAllQualified</eventType>
                    </event>
                </condition>
            `
            const result = await searchImageByImageV2(sendXml)
            const $ = queryXml(result)

            closeLoading()

            formData.value.faceIndex = []
            listData.value = $('content/i')
                .map((item) => {
                    const textArr = item.text().array()
                    const chlId = getChlGuid16(textArr[4]).toUpperCase()
                    const timestamp = hexToDec(textArr[1]) * 1000
                    return {
                        faceFeatureId: hexToDec(textArr[0]) + '',
                        timestamp,
                        frameTime: localToUtc(timestamp) + ':' + padStart(hexToDec(textArr[2]), 7),
                        imgId: hexToDec(textArr[3]),
                        chlId,
                        chlName: chlMap[chlId],
                        pic: '',
                        featureStatus: false,
                    }
                })
                .toSorted((a, b) => a.timestamp - b.timestamp)

            closeLoading()

            changeFacePage(1)
            ctx.emit('change', [])
        }

        /**
         * @description 更改分页
         * @param {number} pageIndex
         */
        const changeFacePage = async (pageIndex: number) => {
            formData.value.pageIndex = pageIndex
            filterListData.value = listData.value.slice((formData.value.pageIndex - 1) * formData.value.pageSize, formData.value.pageIndex * formData.value.pageSize)
            filterListData.value.forEach(async (item) => {
                const data = await getFacePic(item)
                if (data) {
                    item.pic = data.pic
                    item.featureStatus = data.featureStatus
                }
            })
        }

        /**
         * @description 选中/取消选中图片
         * @param {number} index
         */
        const selectFace = (index: number) => {
            const findIndex = formData.value.faceIndex.indexOf(index)
            if (findIndex > -1) {
                formData.value.faceIndex.splice(findIndex, 1)
            } else {
                if (!prop.multiple) {
                    formData.value.faceIndex[0] = index
                } else {
                    if (formData.value.faceIndex.length >= 5) {
                        openMessageBox(Translate('IDCS_SELECT_FACE_UPTO_MAX').formatForLang(5))
                        return
                    }
                    formData.value.faceIndex.push(index)
                }
            }

            ctx.emit(
                'change',
                formData.value.faceIndex.map((index) => listData.value[index]),
            )
        }

        const getUniqueKey = (row: { imgId: number; frameTime: string }) => {
            if (!row || !row.imgId || !row.frameTime) {
                return getNonce() + ''
            }
            return `${row.imgId}:${row.frameTime}`
        }

        /**
         * @description 请求图片Base64数据
         * @param {IntelFaceDBSnapFaceList} item
         * @returns {string}
         */
        const getFacePic = async (item: IntelFaceDBSnapFaceList) => {
            const key = getUniqueKey(item)
            if (cachePic[key]) {
                return cachePic[key]
            }
            const sendXml = rawXml`
                <condition>
                    <imgId>${item.imgId}</imgId>
                    <chlId>${item.chlId}</chlId>
                    <frameTime>${item.frameTime}</frameTime>
                    <featureStatus>true</featureStatus>
                </condition>
            `
            const result = await requestChSnapFaceImage(sendXml)
            const $ = queryXml(result)
            const pic = $('content').text()
            const featureStatus = $('featureStatus').text().bool()
            if (pic) {
                cachePic[key] = {
                    pic: wrapBase64Img(pic),
                    featureStatus,
                }
                return {
                    pic: wrapBase64Img(pic),
                    featureStatus,
                }
            }
            return null
        }

        /**
         * @description 获取通道列表
         */
        const getChannelList = async () => {
            const result = await getChlList({
                isContainsDeletedItem: true,
                authList: '@spr,@bk',
            })
            const $ = queryXml(result)
            pageData.value.chlList = $('content/item').map((item) => {
                const $item = queryXml(item.element)
                chlMap[item.attr('id')] = $item('name').text()
                return {
                    value: item.attr('id'),
                    label: $item('name').text(),
                }
            })
            formData.value.chls = cloneDeep(pageData.value.chlList)
            pageData.value.isAllChl = true
        }

        /**
         * @description 显示格式化时间日期格式
         * @param {number} timestamp
         * @returns {string}
         */
        const displayDateTime = (timestamp: number) => {
            return formatDate(timestamp, dateTime.dateTimeFormat)
        }

        /**
         * @description 打开时重置
         */
        const open = async () => {
            formData.value.faceIndex = []
        }

        watch(
            () => prop.visible,
            (visible) => {
                if (visible) {
                    open()
                }
            },
            {
                immediate: true,
            },
        )

        onMounted(() => {
            getChannelList()
        })

        onBeforeUnmount(() => {
            cachePic = {}
        })

        return {
            pageData,
            formData,
            changeDateRange,
            changeChl,
            confirmChangeChl,
            changeAllChl,
            searchData,
            selectFace,
            changeFacePage,
            close,
            displayDateTime,
            listData,
            filterListData,
        }
    },
})
