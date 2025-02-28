/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 18:46:48
 * @Description: 人脸库
 */
import { type TableInstance } from 'element-plus'
import IntelBaseFaceItem from './IntelBaseFaceItem.vue'
import IntelFaceDBEditPop from './IntelFaceDBEditPop.vue'
import IntelFaceDBExportPop from './IntelFaceDBExportPop.vue'
import IntelFaceDBAddFacePop from './IntelFaceDBAddFacePop.vue'
import IntelFaceDBEditFacePop from './IntelFaceDBEditFacePop.vue'

export default defineComponent({
    components: {
        IntelBaseFaceItem,
        IntelFaceDBEditPop,
        IntelFaceDBExportPop,
        IntelFaceDBAddFacePop,
        IntelFaceDBEditFacePop,
    },
    setup() {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const dateTime = useDateTimeStore()
        const router = useRouter()

        const CERTIFICATE_TYPE_MAPPING: Record<string, string> = {
            idCard: Translate('IDCS_ID_CARD'),
        }

        // 缓存人脸Base64图片数据 节约请求
        const cacheFaceMap: Record<string, IntelFaceDBFaceInfo | undefined> = {}

        const pageData = ref({
            // 是否显示编辑分组弹窗
            isEditPop: false,
            // 编辑的分组数据
            editData: new IntelFaceDBGroupList(),
            // 编辑分组/新增分组 add | edit
            editType: 'add',
            // 展开的行
            expandRowKey: [] as string[],
            // 选中的行
            tableIndex: 0,
            // 导出按钮不显示
            isExportDisabled: userSession.appType === 'P2P',
            // 是否显示导出提示弹窗
            isExportTipPop: false,
            // 是否显示导出弹窗
            isExportPop: false,
            // 组ID与组名称的映射
            exportMap: {} as Record<string, string>,
            // 是否显示新增人脸弹窗
            isAddFacePop: false,
            // 新增人脸弹窗 组ID
            addFaceGroupId: '',
            // 是否显示编辑人脸弹窗
            isEditFacePop: false,
            // 编辑人脸弹窗 组ID
            editFaceGroupId: '',
            // 编辑人脸数据
            editFaceData: [] as IntelFaceDBFaceInfo[],
            pageSize: 16,
        })

        const formData = ref({
            pageIndex: 1,
            name: '',
            faceIndex: [] as number[],
            infoFaceIndex: -1,
        })

        const tableRef = ref<TableInstance>()
        // 表格数据
        const tableData = ref<IntelFaceDBGroupList[]>([])
        // 当前展开项当前分页的人脸数据列表
        const groupTableData = ref<IntelFaceDBFaceInfo[]>([])
        // 当前展开项的所有人脸数据列表
        const allGroupTableData = ref<IntelFaceDBFaceInfo[]>([])

        // const displayAlarmText = (property: string) => {
        //     const isAlarm = ['allow', 'reject', 'limited'].includes(property)
        //     if (isAlarm) return Translate('IDCS_ABNORMAL')
        //     return Translate('IDCS_NORMAL')
        // }

        /**
         * @description 清理页面内存缓存的人脸数据
         * @param {string[]} ids
         */
        const clearCache = (ids: string[]) => {
            ids.forEach((id) => {
                if (cacheFaceMap[id]) {
                    cacheFaceMap[id] = undefined
                }
            })
        }

        /**
         * @description 显示ID类型名称
         * @param {string} name
         * @returns {string}
         */
        const displayIDCard = (name: string) => {
            return CERTIFICATE_TYPE_MAPPING[name] || ''
        }

        // const getAlarmClassName = (id: string, property: string) => {
        //     const isAlarm = ['allow', 'reject', 'limited'].includes(property)
        //     let className = ''
        //     if (isAlarm) {
        //         if (id === 'isAlarmmotion') {
        //             className = 'motionAlarm'
        //         } else if (id === 'isAlarmintelligents') {
        //             className = 'intelligentsAlarm'
        //         } else {
        //             className = 'alarm'
        //         }
        //     }
        //     return className
        // }

        /**
         * @description 检查是否有操作权限
         * @returns {boolean}
         */
        const checkPermission = () => {
            if (!userSession.facePersonnalInfoMgr) {
                openMessageBox(Translate('IDCS_NO_PERMISSION'))
                return false
            }
            return true
        }

        /**
         * @description 打开新增分组弹窗
         */
        const addGroup = () => {
            if (!checkPermission()) {
                return
            }
            pageData.value.isEditPop = true
            pageData.value.editType = 'add'
        }

        /**
         * @description 打开编辑分组弹窗
         * @param row
         */
        const editGroup = (row: IntelFaceDBGroupList) => {
            if (!checkPermission()) {
                return
            }
            pageData.value.isEditPop = true
            pageData.value.editData = row
            pageData.value.editType = 'edit'
        }

        /**
         * @description 确认新增/编辑分组后，刷新数据
         */
        const confirmEditGroup = async () => {
            if (pageData.value.expandRowKey.length) {
                const find = tableData.value.find((item) => item.groupId === pageData.value.expandRowKey[0])
                if (find) {
                    tableRef.value!.toggleRowExpansion(find, false)
                }
                pageData.value.expandRowKey = []
            }
            pageData.value.isEditPop = false

            await getGroupList()
            tableData.value.forEach((item) => {
                getGroupFaceFeatureCount(item)
            })
        }

        /**
         * @description 删除分组及分组的所有人脸数据
         * @param {IntelFaceDBGroupList} row
         */
        const deleteGroup = (row: IntelFaceDBGroupList) => {
            if (!checkPermission()) {
                return
            }
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_NOTE_DELETE_ALL_FACE'),
            }).then(async () => {
                if (row.count) {
                    const status = await confirmDeleteAllFace(row)
                    if (status) {
                        confirmDeleteGroup(row)
                    }
                } else {
                    confirmDeleteGroup(row)
                }
            })
        }

        /**
         * @description 确认删除分组及分组的所有人脸数据
         * @param {IntelFaceDBGroupList} group
         */
        const confirmDeleteGroup = async (group: IntelFaceDBGroupList) => {
            openLoading()

            const sendXml = rawXml`
                <condition>
                    <ids type="list">
                        <item id="${group.id}"></item>
                    </ids>
                </condition>
            `
            const result = await delFacePersonnalInfoGroups(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).finally(async () => {
                    if (pageData.value.expandRowKey.length) {
                        const find = tableData.value.find((item) => item.groupId === pageData.value.expandRowKey[0])
                        if (find) {
                            tableRef.value!.toggleRowExpansion(find, false)
                        }
                        pageData.value.expandRowKey = []
                    }

                    await getGroupList()
                    tableData.value.forEach((item) => {
                        getGroupFaceFeatureCount(item)
                    })
                })
            } else {
                const errorCode = $('errorCode').text().num()
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_PERMISSION')
                        break
                    default:
                        errorInfo = Translate('IDCS_SAVE_FAIL')
                }
                openMessageBox(errorInfo)
            }
        }

        /**
         * @description 导出分组，打开导出说明弹窗
         */
        const exportGroup = () => {
            if (isHttpsLogin()) {
                openNotify(formatHttpsTips(Translate('IDCS_FACE_LIB_FILE')), true)
                return
            }

            if (!checkPermission()) {
                return
            }

            const totalTask = tableData.value.reduce((a, b) => {
                return a + b.count
            }, 0)
            if (!totalTask) {
                openMessageBox(Translate('IDCS_EXPORT_FAIL'))
                return
            }

            tableData.value.forEach((item) => {
                pageData.value.exportMap[item.groupId] = item.name
            })
            pageData.value.isExportTipPop = true
        }

        /**
         * @description 确认导出，开始执行导出分组
         */
        const confirmExportGroup = () => {
            pageData.value.isExportTipPop = false
            pageData.value.isExportPop = true
        }

        /**
         * @description 打开新增人脸弹窗
         * @param {string} groupId
         */
        const addFace = (groupId: string) => {
            if (!checkPermission()) {
                return
            }
            pageData.value.isAddFacePop = true
            pageData.value.addFaceGroupId = groupId
        }

        /**
         * @description 关闭新增人脸弹窗，刷新数据
         */
        const confirmAddFace = (isRefresh: boolean) => {
            pageData.value.isAddFacePop = false
            if (isRefresh) {
                searchFace(pageData.value.addFaceGroupId)
            }
        }

        /**
         * @description 获取分组数据
         */
        const getGroupList = async () => {
            openLoading()

            const result = await queryFacePersonnalInfoGroupList()
            const $ = queryXml(result)

            closeLoading()

            tableData.value = $('content/item').map((item) => {
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
         * @description 获取分组的人脸数量
         * @param {IntelFaceDBGroupList} item
         * @param {number} index
         */
        const getGroupFaceFeatureCount = async (item: IntelFaceDBGroupList) => {
            const sendXml = rawXml`
                <pageIndex>1</pageIndex>
                <pageSize>${pageData.value.pageSize}</pageSize>
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
            } else {
                item.count = 0
            }
        }

        /**
         * @description 更改人脸页码
         * @param {number} pageIndex
         * @param {string} groupId
         */
        const changeFacePage = (pageIndex: number, groupId: string) => {
            getFace(pageIndex, groupId, false, false)
        }

        /**
         * @description 搜索人脸
         * @param {string} groupId
         */
        const searchFace = async (groupId: string) => {
            formData.value.pageIndex = 1
            await getFace(1, groupId)
        }

        /**
         * @description 获取人脸数据
         * @param {number} pageIndex
         * @param {string} groupId
         * @param {boolean} force 是否重新请求图片数据
         * @param {boolean} update 是否重新请求列表数据
         */
        const getFace = async (pageIndex: number, groupId: string, force = false, update = true) => {
            openLoading()

            groupTableData.value = []
            formData.value.faceIndex = []
            formData.value.infoFaceIndex = -1

            const findIndex = tableData.value.findIndex((item) => item.groupId === groupId)

            if (formData.value.pageIndex === 1 && update) {
                allGroupTableData.value = []

                const sendXml = rawXml`
                    <pageIndex>${pageIndex}</pageIndex>
                    <pageSize>${pageData.value.pageSize}</pageSize>
                    <condition>
                        <faceFeatureGroups type="list">
                            <item id="${groupId}"></item>
                        </faceFeatureGroups>
                        ${formData.value.name ? `<name>${formData.value.name}</name>` : ''}
                    </condition>
                `
                const result = await queryFacePersonnalInfoList(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    if (findIndex > -1 && !formData.value.name) {
                        tableData.value[findIndex].count = $('content').attr('total').num()
                    }
                    allGroupTableData.value = $('content/item').map((item) => {
                        const $item = queryXml(item.element)
                        const info = new IntelFaceDBFaceInfo()
                        info.id = item.attr('id')
                        info.name = $item('name').text()
                        return info
                    })
                }
            }

            closeLoading()

            groupTableData.value = allGroupTableData.value.slice((formData.value.pageIndex - 1) * 16, formData.value.pageIndex * 16)

            groupTableData.value.forEach(async (item, i) => {
                const id = item.id
                if (force || !cacheFaceMap[id]) {
                    const info = await getFaceInfo(id)
                    cacheFaceMap[id] = info
                    for (let j = 1; j <= info.faceImgCount; j++) {
                        const pic = await getFaceImg(id, j)
                        cacheFaceMap[id].pic.push(pic)
                    }
                }

                if (item === groupTableData.value[i]) {
                    const pic = cacheFaceMap[id]
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

            const item = $('content/item')[0]
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
                groupId: '',
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

            const pic = $('content').text()
            if (pic) return wrapBase64Img(pic)
            return ''
        }

        const cloneFace = new IntelFaceDBFaceInfo()

        // 当前选中的人脸的信息
        const currentFace = computed(() => {
            if (groupTableData.value[formData.value.infoFaceIndex]) {
                return groupTableData.value[formData.value.infoFaceIndex]
            }
            return cloneFace
        })

        /**
         * @description 选中/取消选中人脸
         * @param {number} index
         * @param {boolean} status
         */
        const selectFace = (index: number, status: boolean) => {
            if (status) {
                if (!formData.value.faceIndex.includes(index)) {
                    formData.value.faceIndex.push(index)
                }
            } else {
                const findIndex = formData.value.faceIndex.indexOf(index)
                if (findIndex > -1) {
                    formData.value.faceIndex.splice(findIndex, 1)
                }
            }
            formData.value.infoFaceIndex = index
        }

        /**
         * @description 人脸全选
         */
        const selectAllFace = () => {
            formData.value.faceIndex = groupTableData.value.map((_item, index) => index)
        }

        /**
         * @description 删除人脸
         */
        const deleteFace = () => {
            if (!checkPermission()) {
                return
            }
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(async () => {
                openLoading()

                const group = tableData.value.find((item) => item.groupId === pageData.value.expandRowKey[0])!
                const sendXml = rawXml`
                    <condition>
                        <ids type="list">
                            ${formData.value.faceIndex
                                .map((index) => {
                                    const item = groupTableData.value[index]
                                    return rawXml`
                                        <item id="${item.id}">
                                            <groups>
                                                <item id="${group.id}">
                                                    <groupId>${group.groupId}</groupId>
                                                </item>
                                            </groups>
                                        </item>
                                    `
                                })
                                .join('')}
                        </ids>
                    </condition>
                `
                const result = await delFacePersonnalInfo(sendXml)
                const $ = queryXml(result)

                closeLoading()

                if ($('status').text() === 'success') {
                    clearCache(formData.value.faceIndex.map((index) => groupTableData.value[index].id))

                    if (formData.value.faceIndex.length === groupTableData.value.length) {
                        formData.value.pageIndex = 1
                    }
                    formData.value.faceIndex = []
                    formData.value.infoFaceIndex = -1

                    getFace(1, group.groupId)
                } else {
                    const errorCode = $('errorCode').text().num()
                    let errorInfo = ''
                    switch (errorCode) {
                        case ErrorCode.USER_ERROR_NO_AUTH:
                            errorInfo = Translate('IDCS_NO_PERMISSION')
                            break
                        case ErrorCode.USER_ERROR_NO_USER:
                            errorInfo = Translate('IDCS_FACE_NOT_EXIST')
                            break
                        default:
                            errorInfo = Translate('IDCS_SAVE_FAIL')
                    }
                    openMessageBox(errorInfo)
                }
            })
        }

        /**
         * @description 删除当前分组所有人脸
         */
        const deleteAllFace = () => {
            if (!checkPermission()) {
                return
            }

            openMessageBox({
                type: 'question',
                message: Translate('IDCS_NOTE_CLEAR_ALL_FACE'),
            }).then(() => {
                const group = tableData.value.find((item) => item.groupId === pageData.value.expandRowKey[0])!
                confirmDeleteAllFace(group)
            })
        }

        /**
         * @description 执行删除当前分组所有人脸
         * @param {IntelFaceDBGroupList} group
         * @returns {boolean}
         */
        const confirmDeleteAllFace = async (group: IntelFaceDBGroupList) => {
            openLoading()

            const sendXml = rawXml`
                <condition>
                    <ids type="list">
                        <item id="0">
                            <groups>
                                <item id="${group.id}">
                                    <groupId>${group.groupId}</groupId>
                                </item>
                            </groups>
                        </item>
                    </ids>
                </condition>
            `
            const result = await delFacePersonnalInfo(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                formData.value.pageIndex = 1
                formData.value.faceIndex = []
                formData.value.infoFaceIndex = -1

                clearCache(allGroupTableData.value.map((item) => item.id))
                getFace(1, group.groupId)

                return true
            } else {
                const errorCode = $('errorCode').text().num()
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_PERMISSION')
                        break
                    case ErrorCode.USER_ERROR_NO_USER:
                        errorInfo = Translate('IDCS_FACE_NOT_EXIST')
                        break
                    default:
                        errorInfo = Translate('IDCS_SAVE_FAIL')
                }
                openMessageBox(errorInfo)

                return false
            }
        }

        /**
         * @description 打开编辑人脸弹窗
         * @param {string} groupId
         */
        const editFace = (groupId: string) => {
            if (!checkPermission()) {
                return
            }
            pageData.value.editFaceData = formData.value.faceIndex.map((index) => groupTableData.value[index])
            pageData.value.editFaceGroupId = groupId
            pageData.value.isEditFacePop = true
        }

        /**
         * @description 确认编辑人脸 刷新数据
         */
        const confirmEditFace = async (ids: string[]) => {
            pageData.value.isEditFacePop = false
            clearCache(ids)
            tableData.value.forEach(async (item) => {
                await getGroupFaceFeatureCount(item)
                if (item.groupId === pageData.value.expandRowKey[0]) {
                    await searchFace(item.groupId)
                }
            })
        }

        /**
         * @description 跳转人脸识别页面
         */
        const handleFaceRecognition = () => {
            if (!userSession.hasAuth('alarmMgr')) {
                openMessageBox(Translate('IDCS_NO_AUTH'))
            }

            if (history.state.backChlId) {
                router.push({
                    path: '/config/alarm/faceRecognition',
                    state: {
                        chlId: history.state.backChlId,
                    },
                })
            } else {
                router.push({
                    path: '/config/alarm/faceRecognition',
                })
            }
        }

        /**
         * @description 点击表格项回调
         * @param {IntelFaceDBGroupList} row
         */
        const handleRowClick = (row: IntelFaceDBGroupList) => {
            const index = tableData.value.findIndex((item) => item.groupId === row.groupId)
            if (index !== pageData.value.tableIndex) {
                pageData.value.tableIndex = index
            }
        }

        /**
         * @description 表格项展开回调
         * @param {IntelFaceDBGroupList} row
         * @param {boolean} expanded
         */
        const handleExpandChange = async (row: IntelFaceDBGroupList, expanded: IntelFaceDBGroupList[]) => {
            if (expanded.length > 1) {
                const find = tableData.value.find((item) => item.groupId === expanded[0].groupId)!
                tableRef.value!.toggleRowExpansion(find, false)
            }

            if (!expanded.length) {
                groupTableData.value = []
                pageData.value.expandRowKey = []
            }

            if (expanded.some((item) => item.groupId === row.groupId)) {
                tableRef.value!.setCurrentRow(row)
                groupTableData.value = []
                pageData.value.expandRowKey = [row.groupId]

                formData.value.name = ''
                searchFace(row.groupId)
            }
        }

        const getRowKey = (row: IntelFaceDBGroupList) => {
            return row.groupId
        }

        onMounted(async () => {
            await getGroupList()
            tableData.value.forEach((item) => {
                getGroupFaceFeatureCount(item)
            })
        })

        onBeforeUnmount(() => {
            if (history.state.backChlId) {
                delete history.state.backChlId
            }
            clearCache(Object.keys(cacheFaceMap))
        })

        return {
            pageData,
            tableData,
            tableRef,
            groupTableData,
            formData,
            addGroup,
            editGroup,
            confirmEditGroup,
            deleteGroup,
            exportGroup,
            confirmExportGroup,
            searchFace,
            // displayAlarmText,
            displayIDCard,
            // getAlarmClassName,
            handleRowClick,
            handleExpandChange,
            getRowKey,
            handleFaceRecognition,
            addFace,
            confirmAddFace,
            selectFace,
            selectAllFace,
            changeFacePage,
            deleteFace,
            deleteAllFace,
            currentFace,
            hideSensitiveInfo,
            editFace,
            confirmEditFace,
        }
    },
})
