/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-27 14:25:04
 * @Description: 业务应用-人脸考勤-详情弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-27 17:45:24
 */
import { type BusinessFaceList, BusinessFaceDetailList, BusinessFaceResultList } from '@/types/apiType/business'
import { type TableInstance } from 'element-plus'

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
         * @property 时间格式
         */
        timeFormat: {
            type: String,
            default: 'HH:mm:ss',
        },
        /**
         * @property 日期格式
         */
        dateFormat: {
            type: String,
            default: 'YYYY-MM-DD',
        },
    },
    emits: {
        close() {
            return true
        },
    },
    setup(prop) {
        const router = useRouter()

        const tableRef = ref<TableInstance>()

        const pageData = ref({
            // 第一张抓拍图Base64数据
            pic1: '',
            // 第二章抓拍图Base64数据
            pic2: '',
        })

        const current = ref(new BusinessFaceDetailList())

        let cachePic: Record<string, string> = {}

        const cloneData = new BusinessFaceResultList()

        // 抓拍1数据
        const item1 = computed(() => {
            if (current.value?.detail?.length) {
                return prop.data.searchData[current.value.date][0]
            }
            return cloneData
        })

        // 抓拍2数据
        const item2 = computed(() => {
            if (current.value?.detail?.length > 1) {
                const item = prop.data.searchData[current.value.date]
                return item[item.length - 1]
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
                if (cachePic[prop.data.id + '_' + newItem.timestamp]) {
                    pageData.value.pic1 = cachePic[prop.data.id + '_' + newItem.timestamp]
                }
                const img = await getPicData(newItem)
                pageData.value.pic1 = img
                if (img) {
                    cachePic[prop.data.id + '_' + newItem.timestamp] = img
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
                if (cachePic[prop.data.id + '_' + newItem.timestamp]) {
                    pageData.value.pic2 = cachePic[prop.data.id + '_' + newItem.timestamp]
                }
                const img = await getPicData(newItem)
                pageData.value.pic2 = img
                if (img) {
                    cachePic[prop.data.id + '_' + newItem.timestamp] = img
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
            return formatDate(timestamp, prop.timeFormat)
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
        }

        /**
         * @description 打开弹窗时重置表格
         */
        const open = () => {
            if (prop.data.detail.length) {
                tableRef.value?.setScrollTop(0)
                tableRef.value?.setCurrentRow(prop.data.detail[0])
            }
        }

        /**
         * @description 获取图片数据
         * @param {Object} item
         * @returns {Promise<string>}
         */
        const getPicData = async (item: BusinessFaceResultList) => {
            const sendXml = rawXml`
                <condition>
                    <imgId>${item.imgId.toString()}</imgId>
                    <chlId>${item.chlId}</chlId>
                    <frameTime>${formatDate(item.timestamp, 'YYYY-MM-DD HH:mm:ss')}:${item.timeNS}</frameTime>
                    <isPanorama />
                </condition>
            `
            const result = await requestChSnapFaceImage(sendXml)
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                return 'data:image/png;base64,' + $('//content').text()
            } else {
                return ''
            }
        }

        /**
         * @description 打开智能分析页面
         */
        const search = async () => {
            // TODO!!!
            const id = prop.data.id
            const data = await getSimpleFaceFeatureInfo(id)

            data.content1 = await getFacePersonalImage(data.id)
            const searchInfo = {
                data: [data],
                date: formatDate(current.value.date, prop.dateFormat, 'YYYY-MM-DD'),
            }
            router.push({
                path: 'smartAnalysis',
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
            const item = $('//content/item')[0]
            const $item = queryXml(item.element)

            return {
                id: item.attr('id')!,
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
                        id: group.attr('id')!,
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
            if ($('//status').text() === 'success') {
                return $('//content').text()
            } else return ''
        }

        onBeforeUnmount(() => {
            cachePic = {}
        })

        return {
            getRowKey,
            tableRef,
            handleCurrentChange,
            open,
            current,
            item1,
            item2,
            pageData,
            displayTime,
            displayDetail,
            search,
        }
    },
})
