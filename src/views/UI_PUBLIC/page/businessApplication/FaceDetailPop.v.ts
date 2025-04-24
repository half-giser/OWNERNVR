/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-27 14:25:04
 * @Description: 业务应用-人脸考勤-详情弹窗
 */
import { type TableInstance } from 'element-plus'
import dayjs from 'dayjs'

export default defineComponent({
    props: {
        /**
         * @property 人脸数据
         */
        data: {
            type: Object as PropType<BusinessFaceList>,
            required: true,
        },
        /**
         * @property {string} check: 考勤 sign: 签到
         */
        type: {
            type: String as PropType<'check' | 'sign'>,
            default: 'check',
        },
    },
    emits: {
        close() {
            return true
        },
        change(index: number) {
            return typeof index === 'number'
        },
    },
    setup(prop) {
        const router = useRouter()
        const dateTime = useDateTimeStore()

        const tableRef = ref<TableInstance>()

        const pageData = ref({
            // 第一张抓拍图Base64数据
            pic1: '',
            // 第二章抓拍图Base64数据
            pic2: '',
            currentIndex: 0,
        })

        const current = ref(new BusinessFaceDetailList())
        // 缓存搜索结果
        const cachePic = new Map<string, string>()

        const cloneData = new BusinessFaceResultList()

        // 抓拍1数据
        const item1 = computed(() => {
            if (current.value?.detail?.length) {
                if (prop.data.searchData[current.value.date]?.length) {
                    return prop.data.searchData[current.value.date][0]
                }
            }
            return cloneData
        })

        // 抓拍2数据
        const item2 = computed(() => {
            if (current.value?.detail?.length > 1) {
                if (prop.data.searchData[current.value.date]?.length) {
                    return prop.data.searchData[current.value.date].at(-1)!
                }
            }
            return cloneData
        })

        watch(item1, async (newItem, oldItem) => {
            if (newItem.timestamp === 0) {
                pageData.value.pic1 = ''
                return
            } else if (newItem.timestamp === oldItem.timestamp) {
                return
            } else {
                if (cachePic.has(prop.data.id + '_' + newItem.timestamp)) {
                    pageData.value.pic1 = cachePic.get(prop.data.id + '_' + newItem.timestamp)!
                } else {
                    const img = await getPicData(newItem)
                    pageData.value.pic1 = img
                    if (img) {
                        cachePic.set(prop.data.id + '_' + newItem.timestamp, img)
                    }
                }
            }
        })

        watch(item2, async (newItem, oldItem) => {
            if (newItem.timestamp === 0) {
                pageData.value.pic2 = ''
                return
            } else if (newItem.timestamp === oldItem.timestamp) {
                return
            } else {
                if (cachePic.has(prop.data.id + '_' + newItem.timestamp)) {
                    pageData.value.pic2 = cachePic.get(prop.data.id + '_' + newItem.timestamp)!
                } else {
                    const img = await getPicData(newItem)
                    pageData.value.pic2 = img
                    if (img) {
                        cachePic.set(prop.data.id + '_' + newItem.timestamp, img)
                    }
                }
            }
        })

        /**
         * @description tableItem的key
         * @param {Object} row
         * @returns {String}
         */
        const getRowKey = (row: BusinessFaceDetailList) => {
            return prop.data.id + '_' + row.date
        }

        /**
         * @description 显示时间文本
         * @param {Number} timestamp
         * @returns {String}
         */
        const displayTime = (timestamp: number) => {
            return formatDate(timestamp, dateTime.timeFormat)
        }

        /**
         * @description 显示日期文本
         * @param {string} date
         * @returns {string}
         */
        const displayDate = (date: string) => {
            return formatDate(date, dateTime.dateFormat, DEFAULT_YMD_FORMAT)
        }

        /**
         * @description 显示详情文本
         * @param {Array} detail
         * @returns {String}
         */
        const displayDetail = (detail: BusinessFaceResultList[]) => {
            if (!detail.length) return '--'
            return detail.map((item) => displayTime(item.timestamp)).join('; ')
        }

        /**
         * @description 选中当前项
         * @param {Object} row
         */
        const handleCurrentChange = (row: BusinessFaceDetailList) => {
            current.value = row
            pageData.value.currentIndex = prop.data.detail.findIndex((item) => row.date === item.date)
        }

        /**
         * @description 打开弹窗时重置表格
         */
        const open = () => {
            if (prop.data.detail.length) {
                tableRef.value?.setScrollTop(0)
                tableRef.value?.setCurrentRow(prop.data.detail[0])
                current.value = prop.data.detail[0]
                pageData.value.currentIndex = 0
            }
        }

        /**
         * @description 上一页
         */
        const prev = () => {
            pageData.value.currentIndex--
            current.value = prop.data.detail[pageData.value.currentIndex]
            tableRef.value?.setCurrentRow(current.value)
            console.log('scrollIntoView', tableRef.value)
            tableRef.value?.$el.querySelector(`.el-table__row:nth-child(${pageData.value.currentIndex + 1})`)?.scrollIntoViewIfNeeded()
        }

        /**
         * @description 下一页
         */
        const next = () => {
            pageData.value.currentIndex++
            current.value = prop.data.detail[pageData.value.currentIndex]
            tableRef.value?.setCurrentRow(current.value)
            tableRef.value?.$el.querySelector(`.el-table__row:nth-child(${pageData.value.currentIndex + 1})`)?.scrollIntoViewIfNeeded()
        }

        /**
         * @description 获取图片数据
         * @param {Object} item
         * @returns {Promise<string>}
         */
        const getPicData = async (item: BusinessFaceResultList) => {
            const sendXml = rawXml`
                <condition>
                    <imgId>${item.imgId}</imgId>
                    <chlId>${item.chlId}</chlId>
                    <frameTime>${item.frameTime}</frameTime>
                    <isPanorama />
                </condition>
            `
            const result = await requestChSnapFaceImage(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                return wrapBase64Img($('content').text())
            } else {
                return ''
            }
        }

        /**
         * @description 打开智能分析页面
         */
        const search = async () => {
            if (!current.value.date) {
                return
            }
            const id = prop.data.id
            const data = await getSimpleFaceFeatureInfo(id)
            const pic = await getFacePersonalImage(data.id)
            const searchInfo = {
                faceType: 'face',
                id: data.id,
                name: data.name,
                certificateNum: data.certificateNum,
                mobile: data.mobile,
                birthday: data.birthday,
                pic: wrapBase64Img(pic),
                date: dayjs(current.value.date, DEFAULT_YMD_FORMAT).valueOf(),
            }
            router.push({
                path: '/intelligent-analysis/search/search-face',
                state: searchInfo,
            })
        }

        /**
         * @description 获取人脸信息
         * @param {String} id
         * @returns {Promise<object>}
         */
        const getSimpleFaceFeatureInfo = async (id: string) => {
            const sendXml = rawXml`
                <pageIndex>1</pageIndex>
                <pageSize>15</pageSize>
                <condition>
                    <id>${id}</id>
                </condition>
            `
            const result = await queryFacePersonnalInfoList(sendXml)
            const $ = queryXml(result)
            const item = $('content/item')[0]
            const $item = queryXml(item.element)

            return {
                id: item.attr('id'),
                number: $item('number').text(),
                name: $item('name').text(),
                sex: $item('sex').text(),
                birthday: $item('birthday').text(),
                nativePlace: $item('nativePlace').text(),
                certificateType: $item('certificateType').text(),
                certificateNum: $item('certificateNum').text(),
                mobile: $item('mobile').text(),
                createTime: $item('createTime').text(),
                faceImgCount: $item('faceImgCount').text(),
                groups: $item('groups/item').map((group) => {
                    const $group = queryXml(group.element)
                    return {
                        id: group.attr('id'),
                        groupId: $group('groupId').text(),
                        name: $group('name').text(),
                        property: $group('property').text(),
                        validStartTime: $group('validStartTime').text(),
                        validEndTime: $group('validEndTime').text(),
                    }
                }),
                content1: '',
            }
        }

        /**
         * @description 获取人脸图片
         * @param {String} id
         * @returns {Promise<string>}
         */
        const getFacePersonalImage = async (id: string) => {
            const sendXml = rawXml`
                <condition>
                    <id>${id}</id>
                    <index>1</index>
                </condition>
            `
            const result = await requestFacePersonnalInfoImage(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                return $('content').text()
            } else return ''
        }

        onBeforeRouteLeave(() => {
            cachePic.clear()
        })

        return {
            getRowKey,
            tableRef,
            handleCurrentChange,
            current,
            item1,
            item2,
            pageData,
            displayTime,
            displayDate,
            displayDetail,
            search,
            prev,
            next,
            open,
        }
    },
})
