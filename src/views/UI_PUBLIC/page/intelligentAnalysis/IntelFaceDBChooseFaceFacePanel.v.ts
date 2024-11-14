/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-12 11:56:52
 * @Description: 智能分析 - 选择人脸 - 从人脸库选择
 */
import { cloneDeep } from 'lodash-es'
import { IntelFaceDBFaceInfo, type IntelFaceDBGroupList } from '@/types/apiType/intelligentAnalysis'
import IntelBaseFaceItem from './IntelBaseFaceItem.vue'

export default defineComponent({
    components: {
        IntelBaseFaceItem,
    },
    props: {
        /**
         * @property 内嵌此组件的弹窗是否被打开
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
        changeGroup(e: IntelFaceDBGroupList[]) {
            return Array.isArray(e)
        },
        change(e: IntelFaceDBFaceInfo[]) {
            return Array.isArray(e)
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const dateTime = useDateTimeStore()

        // 缓存人脸Base64图片数据 节约请求
        const cacheFaceMap: Record<string, IntelFaceDBFaceInfo> = {}

        const pageData = ref({
            // 人脸数据库选项
            faceGroupList: [] as IntelFaceDBGroupList[],
            // 是否选中所有人脸组
            isAllFaceGroup: true,
            // 分组弹窗
            isSelectGroupPop: false,
        })

        const formData = ref({
            pageIndex: 1,
            pageSize: 18,
            faceGroup: [] as IntelFaceDBGroupList[],
            faceIndex: [] as number[], // -1,
            name: '',
        })

        const listData = ref<IntelFaceDBFaceInfo[]>([])
        const filterListData = ref<IntelFaceDBFaceInfo[]>([])

        /**
         * @description 打开人脸组弹窗
         */
        const changeGroup = () => {
            pageData.value.isSelectGroupPop = true
        }

        /**
         * @description 获取分组数据
         */
        const getGroupList = async () => {
            openLoading()

            const result = await queryFacePersonnalInfoGroupList()
            const $ = queryXml(result)

            closeLoading()

            pageData.value.faceGroupList = $('//content/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    id: item.attr('id'),
                    name: $item('name').text(),
                    property: $item('property').text(),
                    groupId: $item('groupId').text(),
                    enableAlarmSwitch: $item('enableAlarmSwitch').text().bool(),
                    count: 0,
                }
            })
        }

        /**
         * @description 通道全选/取消全选
         */
        const changeAllFaceGroup = () => {
            if (pageData.value.isAllFaceGroup) {
                formData.value.faceGroup = cloneDeep(pageData.value.faceGroupList)
            } else {
                formData.value.faceGroup = []
            }
            searchFace()
            ctx.emit('changeGroup', formData.value.faceGroup)
        }

        /**
         * @description 确认更改人脸组
         * @param {IntelFaceDBGroupList[]} e
         */
        const confirmChangeGroup = (e: IntelFaceDBGroupList[]) => {
            formData.value.faceGroup = e
            pageData.value.isAllFaceGroup = formData.value.faceGroup.length === pageData.value.faceGroupList.length
            searchFace()
            ctx.emit('changeGroup', formData.value.faceGroup)
        }

        /**
         * @description 搜索人脸
         * @param {string} groupId
         */
        const searchFace = async () => {
            formData.value.pageIndex = 1
            await getFace()
            changePage(1)
        }

        /**
         * @description 切换分页
         * @param {number} index
         */
        const changePage = async (index: number) => {
            formData.value.pageIndex = index
            filterListData.value = listData.value.slice((formData.value.pageIndex - 1) * formData.value.pageSize, formData.value.pageIndex * formData.value.pageSize)
            for (let i = 0; i < filterListData.value.length; i++) {
                const item = filterListData.value[i]
                const id = item.id
                if (!cacheFaceMap[id]) {
                    const info = await getFaceInfo(id)
                    cacheFaceMap[id] = info
                    for (let j = 1; j <= info.faceImgCount; j++) {
                        const pic = await getFaceImg(id, j)
                        cacheFaceMap[id].pic.push(pic)
                    }
                }

                if (index === formData.value.pageIndex) {
                    filterListData.value[i] = cloneDeep(cacheFaceMap[id])
                } else {
                    break
                }
            }
        }

        /**
         * @description 获取人脸数据
         * @param {number} pageIndex
         * @param {string} groupId
         * @param {boolean} force 是否重新请求图片数据
         * @param {boolean} update 是否重新请求列表数据
         */
        const getFace = async () => {
            openLoading()

            formData.value.faceIndex = []
            listData.value = []

            const sendXml = rawXml`
                <pageIndex>1</pageIndex>
                <pageSize>16</pageSize>
                <condition>
                    <faceFeatureGroups type="list">
                        ${formData.value.faceGroup.map((item) => `<item id="${item.groupId}"></item>`).join('')}
                    </faceFeatureGroups>
                    ${(ternary(!!formData.value.name), `<name>${formData.value.name}</name>`)}
                </condition>
            `
            const result = await queryFacePersonnalInfoList(sendXml)
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                listData.value = $('//content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const info = new IntelFaceDBFaceInfo()
                    info.id = item.attr('id')
                    info.name = $item('name').text()
                    return info
                })
            }

            if (!formData.value.faceGroup.length) {
                listData.value = []
            }
            closeLoading()
        }

        /**
         * @description 获取单个人脸数据
         * @param {string} id
         * @returns {IntelFaceDBFaceInfo}
         */
        const getFaceInfo = async (id: string) => {
            const sendXml = rawXml`
                <pageIndex>1</pageIndex>
                <pageSize>1</pageSize>
                <condition>
                    <id>${id}</id>
                </condition>
            `
            const result = await queryFacePersonnalInfoList(sendXml)
            const $ = queryXml(result)

            const item = $('//content/item')[0]
            const $item = queryXml(item.element)
            return {
                id: item.attr('id'),
                number: $item('number').text(),
                name: $item('name').text(),
                sex: $item('sex').text(),
                birthday: formatDate($item('birthday').text(), dateTime.dateFormat, 'YYYY-MM-DD'),
                nativePlace: $item('nativePlace').text(),
                certificateType: $item('certificateType').text(),
                certificateNum: $item('certificateNum').text(),
                mobile: $item('mobile').text(),
                faceImgCount: $item('faceImgCount').text().num(),
                note: $item('remark').text(),
                pic: [],
                groupId: $item('groups/item/groupId').text(),
            }
        }

        /**
         * @description 获取单张人脸图的Base64
         * @param {string} id
         * @param {number} index
         * @returns {string}
         */
        const getFaceImg = async (id: string, index: number) => {
            const sendXml = rawXml`
                <condition>
                    <id>${id}</id>
                    <index>${index}</index>
                </condition>
            `
            const result = await requestFacePersonnalInfoImage(sendXml)
            const $ = queryXml(result)

            const pic = $('//content').text()
            if (pic) return 'data:image/png;base64,' + pic
            return ''
        }

        /**
         * @description 获取分组的人脸数量
         * @param {IntelFaceDBGroupList} item
         * @param {number} index
         */
        const getGroupFaceFeatureCount = async (item: IntelFaceDBGroupList, index: number) => {
            const sendXml = rawXml`
                <pageIndex>1</pageIndex>
                <pageSize>1</pageSize>
                <condition>
                    <faceFeatureGroups type="list">
                        <item id="${item.groupId}"></item>
                    </faceFeatureGroups>
                </condition>
            `
            const result = await queryFacePersonnalInfoList(sendXml)
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                pageData.value.faceGroupList[index].count = $('//content').attr('total').num()
            }
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
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_SELECT_FACE_UPTO_MAX').formatForLang(5),
                        })
                        return
                    }
                    formData.value.faceIndex.push(index)
                }
            }

            ctx.emit(
                'change',
                formData.value.faceIndex.map((index) => {
                    const item = listData.value[index]
                    return cacheFaceMap[item.id] || item
                }),
            )
        }

        /**
         * @description 打开时重置
         */
        const open = async () => {
            formData.value.faceIndex = []
            await getGroupList()
            for (let i = 0; i < pageData.value.faceGroupList.length; i++) {
                const item = pageData.value.faceGroupList[i]
                await getGroupFaceFeatureCount(item, i)
            }
            formData.value.faceGroup = cloneDeep(pageData.value.faceGroupList)
            ctx.emit('changeGroup', formData.value.faceGroup)
            searchFace()
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

        return {
            pageData,
            formData,
            changeAllFaceGroup,
            confirmChangeGroup,
            changeGroup,
            searchFace,
            changePage,
            listData,
            filterListData,
            selectFace,
        }
    },
})
