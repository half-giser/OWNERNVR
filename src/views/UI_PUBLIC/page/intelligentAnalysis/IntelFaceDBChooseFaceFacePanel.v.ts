/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-12 11:56:52
 * @Description: 智能分析 - 选择人脸 - 从人脸库选择
 */
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
        const dateTime = useDateTimeStore()

        // 缓存人脸Base64图片数据 节约请求
        const cacheFaceMap = new Map<string, IntelFaceDBFaceInfo>()

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

            pageData.value.faceGroupList = $('content/item').map((item) => {
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
            filterListData.value.forEach(async (item) => {
                const id = item.id

                if (!cacheFaceMap.has(id)) {
                    const info = await getFaceInfo(id)
                    if (info) {
                        for (let j = 1; j <= info.faceImgCount; j++) {
                            const pic = await getFaceImg(id, j)
                            info.pic.push(pic)
                        }
                        cacheFaceMap.set(id, info)
                    }
                }

                if (cacheFaceMap.has(id) && index === formData.value.pageIndex) {
                    const pic = cacheFaceMap.get(id)!
                    item.id = pic.id
                    item.number = pic.number
                    item.name = pic.name
                    item.sex = pic.sex
                    item.birthday = pic.birthday
                    item.nativePlace = pic.nativePlace
                    item.certificateType = pic.certificateType
                    item.certificateNum = pic.certificateNum
                    item.mobile = pic.mobile
                    item.note = pic.note
                    item.faceImgCount = pic.faceImgCount
                    item.pic = pic.pic
                    item.groupId = pic.groupId
                }
            })
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
                    ${formData.value.name ? `<name>${formData.value.name}</name>` : ''}
                </condition>
            `
            try {
                const result = await queryFacePersonnalInfoList(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    listData.value = $('content/item').map((item) => {
                        const $item = queryXml(item.element)
                        const info = new IntelFaceDBFaceInfo()
                        info.id = item.attr('id')
                        info.name = $item('name').text()
                        return info
                    })
                }
            } catch {}

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

            try {
                const result = await queryFacePersonnalInfoList(sendXml)
                const $ = queryXml(result)

                const item = $('content/item')[0]
                const $item = queryXml(item.element)
                return {
                    id: item.attr('id'),
                    number: $item('number').text(),
                    name: $item('name').text(),
                    sex: $item('sex').text(),
                    birthday: formatGregoryDate($item('birthday').text(), dateTime.dateFormat, 'YYYY-MM-DD'),
                    nativePlace: $item('nativePlace').text(),
                    certificateType: $item('certificateType').text(),
                    certificateNum: $item('certificateNum').text(),
                    mobile: $item('mobile').text(),
                    faceImgCount: $item('faceImgCount').text().num(),
                    note: $item('note').text(),
                    pic: [] as string[],
                    groupId: $item('groups/item/groupId').text(),
                }
            } catch {
                return null
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
            try {
                const result = await requestFacePersonnalInfoImage(sendXml)
                const $ = queryXml(result)

                const pic = $('content').text()
                if (pic) return wrapBase64Img(pic)
                return ''
            } catch {
                return ''
            }
        }

        /**
         * @description 获取分组的人脸数量
         * @param {IntelFaceDBGroupList} item
         * @param {number} index
         */
        const getGroupFaceFeatureCount = async (item: IntelFaceDBGroupList) => {
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
            if ($('status').text() === 'success') {
                item.count = $('content').attr('total').num()
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
                        openMessageBox(Translate('IDCS_SELECT_FACE_UPTO_MAX').formatForLang(5))
                        return
                    }
                    formData.value.faceIndex.push(index)
                }
            }

            ctx.emit(
                'change',
                formData.value.faceIndex.map((index) => {
                    const item = listData.value[index]
                    return cacheFaceMap.get(item.id) || item
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
                await getGroupFaceFeatureCount(item)
            }
            formData.value.faceGroup = cloneDeep(pageData.value.faceGroupList)
            ctx.emit('changeGroup', formData.value.faceGroup)
            searchFace()
        }

        onBeforeUnmount(() => {
            cacheFaceMap.clear()
        })

        onBeforeRouteLeave(() => {
            cacheFaceMap.clear()
        })

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
