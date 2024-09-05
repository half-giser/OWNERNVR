/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 18:47:52
 * @Description: 人脸库 - 选择人脸 - 从抓拍库选择
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-04 18:30:57
 */
import { cloneDeep } from 'lodash-es'
import { type IntelFaceDBSnapFaceList } from '@/types/apiType/intelligentAnalysis'
import IntelFaceItem from './IntelFaceItem.vue'

export default defineComponent({
    components: {
        IntelFaceItem,
    },
    emits: {
        change(item: IntelFaceDBSnapFaceList[]) {
            return Array.isArray(item)
        },
    },
    setup(prop, ctx) {
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
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
            pageIndex: 0,
            dateRange: [0, 0] as [number, number],
            chls: [] as SelectOption<string, string>[],
            faceIndex: -1,
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
            } else {
                formData.value.chls = []
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
            openLoading(LoadingTarget.FullScreen)

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

            closeLoading(LoadingTarget.FullScreen)

            listData.value = $('//content/i')
                .map((item) => {
                    const textArr = item.text().split(',')
                    const chlId = getChlGuid16(textArr[4]).toUpperCase()
                    return {
                        faceFeatureId: parseInt(textArr[0], 16) + '',
                        timestamp: parseInt(textArr[1], 16) * 1000,
                        timeNS: ('0000000' + parseInt(textArr[2], 16)).slice(-7),
                        imgId: parseInt(textArr[3], 16),
                        chlId,
                        chlName: chlMap[chlId],
                        pic: '',
                        featureStatus: false,
                    }
                })
                .toSorted((a, b) => a.timestamp - b.timestamp)

            closeLoading(LoadingTarget.FullScreen)

            changeFacePage(1)
        }

        /**
         * @description 更改分页
         * @param {number} pageIndex
         */
        const changeFacePage = async (pageIndex: number) => {
            formData.value.pageIndex = pageIndex
            filterListData.value = listData.value.slice((formData.value.pageIndex - 1) * 18, formData.value.pageIndex * 18)
            for (let i = 0; i < filterListData.value.length; i++) {
                const result = await getFacePic(filterListData.value[i])
                filterListData.value[i].pic = result.pic
                filterListData.value[i].featureStatus = result.featureStatus
            }
        }

        /**
         * @description 选中/取消选中图片
         * @param {number} index
         */
        const selectFace = (index: number) => {
            if (formData.value.faceIndex === index) {
                formData.value.faceIndex = -1
                ctx.emit('change', [])
            } else {
                formData.value.faceIndex = index
                ctx.emit('change', [filterListData.value[index]])
            }
        }

        /**
         * @description 请求图片Base64数据
         * @param {IntelFaceDBSnapFaceList} item
         * @returns {string}
         */
        const getFacePic = async (item: IntelFaceDBSnapFaceList) => {
            const key = item.timestamp + ':' + item.timeNS
            if (cachePic[key]) {
                return cachePic[key]
            }
            const sendXml = rawXml`
                <condition>
                    <imgId>${item.imgId.toString()}</imgId>
                    <chlId>${item.chlId}</chlId>
                    <frameTime>${localToUtc(item.timestamp)}:${item.timeNS}</frameTime>
                    <featureStatus>true</featureStatus>
                </condition>
            `
            const result = await requestChSnapFaceImage(sendXml)
            const $ = queryXml(result)
            const pic = $('//content').text()
            const featureStatus = $('//featureStatus').text().toBoolean()
            if (pic) {
                cachePic[key] = {
                    pic: 'data:image/png;base64,' + pic,
                    featureStatus,
                }
                return cachePic[key]
            } else {
                return {
                    pic: '',
                    featureStatus: false,
                }
            }
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
            pageData.value.chlList = $('//content/item').map((item) => {
                const $item = queryXml(item.element)
                chlMap[item.attr('id')!] = $item('name').text()
                return {
                    value: item.attr('id')!,
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
            IntelFaceItem,
        }
    },
})
