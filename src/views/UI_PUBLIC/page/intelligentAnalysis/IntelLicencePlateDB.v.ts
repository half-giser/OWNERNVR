/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-02 14:01:05
 * @Description: 车牌库
 */
import { type TableInstance } from 'element-plus'
import IntelLicencePlateDBEditPop from './IntelLicencePlateDBEditPop.vue'
import IntelLicencePlateDBExportPop from './IntelLicencePlateDBExportPop.vue'
import IntelLicencePlateDBAddPlatePop from './IntelLicencePlateDBAddPlatePop.vue'
import dayjs from 'dayjs'

export default defineComponent({
    components: {
        IntelLicencePlateDBEditPop,
        IntelLicencePlateDBExportPop,
        IntelLicencePlateDBAddPlatePop,
    },
    setup() {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const router = useRouter()
        const dateTime = useDateTimeStore()

        const pageData = ref({
            // 是否显示编辑分组弹窗
            isEditPop: false,
            // 编辑的分组数据
            editData: new IntelPlateDBGroupList(),
            // 编辑分组/新增分组 add | edit
            editType: 'add',
            // 展开的行
            expandRowKey: [] as string[],
            // 展开的行
            tableIndex: 0,
            // 导出按钮不显示
            isExportDisabled: isHttpsLogin(),
            // 是否显示编辑车牌弹窗
            isEditPlatePop: false,
            // 编辑车牌的数据
            editPlateData: new IntelPlateDBPlateInfo(),
            // 编辑车牌/新增车牌 add | edit
            editPlateType: 'add',
            // 是否显示导出弹窗
            isExportPop: false,
            // 组ID与组名称的映射
            exportMap: {} as Record<string, string>,
            // 导出数据总条数
            exportTotal: 0,
            // 当前选中的车牌列表行
            currentPlateRow: new IntelPlateDBPlateInfo(),
        })

        const formData = ref({
            pageIndex: 1,
            pageSize: 15,
            total: 1,
            name: '',
            cacheName: '',
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<IntelPlateDBGroupList[]>([])
        const groupTableData = ref<IntelPlateDBPlateInfo[]>([])

        const isExportDisabled = computed(() => {
            const total = tableData.value.reduce((a, b) => {
                return a + b.plateNum
            }, 0)
            return !total
        })

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

        const displayGroupName = (row: IntelPlateDBGroupList) => {
            return `${row.name}${userSession.facePersonnalInfoMgr ? `(${row.plateNum})` : ''}`
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
        const editGroup = (row: IntelPlateDBGroupList) => {
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
                const find = tableData.value.find((item) => item.id === pageData.value.expandRowKey[0])
                if (find) {
                    tableRef.value!.toggleRowExpansion(find, false)
                }
                pageData.value.expandRowKey = []
            }
            pageData.value.isEditPop = false

            await getGroupList()
        }

        /**
         * @description 删除分组数据
         * @param {IntelFaceDBGroupList} row
         */
        const deleteGroup = (row: IntelPlateDBGroupList) => {
            if (!checkPermission()) {
                return
            }
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_NOTE_DELETE_ALL_LICENSE_PLATE'),
            }).then(async () => {
                openLoading()

                try {
                    const sendXml = rawXml`
                        <condition>
                            <group type="list">
                                <item id="${row.id}"></item>
                            </group>
                        </condition>
                    `
                    const result = await deletePlateLibrary(sendXml)
                    const $ = queryXml(result)

                    closeLoading()

                    if ($('status').text() === 'success') {
                        if (pageData.value.expandRowKey.length) {
                            const find = tableData.value.find((item) => item.id === pageData.value.expandRowKey[0])
                            if (find) {
                                tableRef.value!.toggleRowExpansion(find, false)
                            }
                            pageData.value.expandRowKey = []
                        }
                        getGroupList()
                    } else {
                        openMessageBox(Translate('IDCS_NO_AUTH'))
                    }
                } catch (e) {
                    if (pageData.value.expandRowKey.length) {
                        const find = tableData.value.find((item) => item.id === pageData.value.expandRowKey[0])
                        if (find) {
                            tableRef.value!.toggleRowExpansion(find, false)
                        }
                        pageData.value.expandRowKey = []
                    }
                    // P2P车牌删除超时兼容处理
                    closeLoading()
                    getGroupList()
                }
            })
        }

        /**
         * @description 导出分组
         */
        const exportGroup = () => {
            if (!checkPermission()) {
                return
            }

            const totalTask = tableData.value.reduce((a, b) => {
                return a + b.plateNum
            }, 0)
            if (!totalTask) {
                openMessageBox(Translate('IDCS_EXPORT_FAIL'))
                return
            }

            tableData.value.forEach((item) => {
                pageData.value.exportMap[item.id] = item.name
            })

            pageData.value.isExportPop = true
            pageData.value.exportTotal = totalTask
        }

        /**
         * @description 跳转车牌识别页面
         */
        const handleVehicleRecognition = () => {
            if (!userSession.hasAuth('alarmMgr')) {
                openMessageBox(Translate('IDCS_NO_AUTH'))
            }

            if (history.state.backChlId) {
                router.push({
                    path: '/config/alarm/vehicleRecognition',
                    state: {
                        chlId: history.state.backChlId,
                    },
                })
            } else {
                router.push({
                    path: '/config/alarm/vehicleRecognition',
                })
            }
        }

        /**
         * @description 打开新增车牌弹窗
         * @param {string} groupId
         */
        const addPlate = (groupId: string) => {
            if (!checkPermission()) {
                return
            }

            if (!groupId) {
                groupId = tableData.value[pageData.value.tableIndex]?.id || ''
            }

            pageData.value.editPlateData.groupId = groupId
            pageData.value.editPlateType = 'add'
            pageData.value.isEditPlatePop = true
        }

        /**
         * @description 打开编辑车牌弹窗
         * @param {IntelPlateDBPlateInfo} row
         */
        const editPlate = (row: IntelPlateDBPlateInfo) => {
            if (!checkPermission()) {
                return
            }
            pageData.value.isEditPlatePop = true
            pageData.value.editPlateType = 'edit'
            pageData.value.editPlateData = row
        }

        /**
         * @description 确认编辑车牌 刷新数据
         */
        const confirmEditPlate = async () => {
            pageData.value.isEditPlatePop = false
            await getGroupList()

            if (pageData.value.expandRowKey.length) {
                searchPlate(pageData.value.expandRowKey[0])
            }
        }

        /**
         * @description 删除车牌
         */
        const deletePlate = (row: IntelPlateDBPlateInfo) => {
            if (!checkPermission()) {
                return
            }
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(async () => {
                openLoading()

                const sendXml = rawXml`
                    <condition>
                        <plate type="list">
                            <item id="${row.id}" />
                        </plate>
                    </condition>
                `
                const result = await deletePlateNumber(sendXml)
                const $ = queryXml(result)

                closeLoading()

                if ($('status').text() === 'success') {
                    await getGroupList()
                    searchPlate(row.groupId)
                } else {
                    const errorCode = $('errorCode').text().num()
                    if (errorCode === ErrorCode.USER_ERROR_NO_AUTH) {
                        openMessageBox(Translate('IDCS_NO_AUTH'))
                    }
                }
            })
        }

        /**
         * @description 切换车牌列表页码
         * @param {number} pageIndex
         * @param {string} groupId
         */
        const changePlatePage = (pageIndex: number, groupId: string) => {
            getPlate(pageIndex, groupId)
        }

        /**
         * @description 切换车牌列表页码大小
         * @param {number} pageSize
         * @param {string} groupId
         */
        const changePlatePageSize = (pageSize: number, groupId: string) => {
            formData.value.pageSize = pageSize
            searchPlate(groupId)
        }

        /**
         * @description 关键字数据框聚焦时回调
         */
        const handleNameFocus = () => {
            formData.value.cacheName = formData.value.name
        }

        /**
         * @description 搜索车牌列表
         * @param {string} groupId
         */
        const searchPlate = async (groupId: string) => {
            formData.value.pageIndex = 1
            await getPlate(1, groupId)
        }

        const bounceSearchPlate = debounce((groupId: string) => searchPlate(groupId), 500)

        /**
         * @description 获取车牌列表
         * @param {number} pageIndex
         * @param {string} groupId
         */
        const getPlate = async (pageIndex: number, groupId: string) => {
            openLoading()

            groupTableData.value = []

            const sendXml = rawXml`
                <pageIndex>${pageIndex}</pageIndex>
                <pageSize>${formData.value.pageSize}</pageSize>
                <condition>
                    <groupId>${groupId}</groupId>
                    ${formData.value.name ? `<plateInfoKeyword>${wrapCDATA(formData.value.name)}</plateInfoKeyword>` : ''}
                </condition>
            `
            const result = await queryPlateNumber(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                groupTableData.value = $('content/plate/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id'),
                        groupId: $item('groupId').text(),
                        plateNumber: $item('plateNumber').text(),
                        owner: $item('owner').text(),
                        ownerPhone: $item('ownerPhone').text(),
                        vehicleType: $item('vehicleType').text(),
                        ownerFaceId: $item('ownerFaceId').text(),
                        startTime: $item('startTime').text(),
                        endTime: $item('endTime').text(),
                    }
                })
                formData.value.total = $('content/plate').attr('total').num()
            }
        }

        /**
         * @description 获取分组列表
         */
        const getGroupList = async () => {
            const result = await queryPlateLibrary()
            const $ = queryXml(result)

            tableData.value = $('content/group/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    id: item.attr('id'),
                    name: $item('name').text(),
                    plateNum: $item('plateNum').text().num(),
                }
            })
        }

        /**
         * @description 点击车牌列表项回调
         * @param row
         */
        const handleExpandRowClick = (row: IntelPlateDBPlateInfo) => {
            pageData.value.currentPlateRow = row
        }

        /**
         * @description 选中该行时 显示车牌号码 否则隐藏
         * @param {IntelPlateDBPlateInfo} row
         * @returns {string}
         */
        const displayPlateNumber = (row: IntelPlateDBPlateInfo) => {
            if (row === pageData.value.currentPlateRow) {
                return row.plateNumber
            }
            return hideSensitiveInfo(row.plateNumber, 'medium')
        }

        /**
         * @description 选中改行时 显示手机号码 否则隐藏
         * @param {IntelPlateDBPlateInfo} row
         * @returns {string}
         */
        const displayPhone = (row: IntelPlateDBPlateInfo) => {
            if (row === pageData.value.currentPlateRow) {
                return row.ownerPhone
            }
            return hideSensitiveInfo(row.ownerPhone, 'medium')
        }

        /**
         * @description 选中改行时 显示车主信息 否则隐藏
         * @param {IntelPlateDBPlateInfo} row
         * @returns {string}
         */
        const displayOwner = (row: IntelPlateDBPlateInfo) => {
            if (row === pageData.value.currentPlateRow) {
                return row.owner
            }
            return hideSensitiveInfo(row.owner, 'medium', 'name')
        }

        /**
         * @description 点击表格项回调
         * @param {IntelPlateDBGroupList} row
         */
        const handleRowClick = (row: IntelPlateDBGroupList) => {
            const index = tableData.value.findIndex((item) => item.id === row.id)
            if (index !== pageData.value.tableIndex) {
                pageData.value.tableIndex = index
            }
        }

        /**
         * @description 表格项展开回调
         * @param {IntelPlateDBGroupList} row
         * @param {boolean} expanded
         */
        const handleExpandChange = (row: IntelPlateDBGroupList, expanded: IntelPlateDBGroupList[]) => {
            if (expanded.length > 1) {
                const find = tableData.value.find((item) => item.id === expanded[0].id)!
                tableRef.value!.toggleRowExpansion(find, false)
            }

            if (!expanded.length) {
                groupTableData.value = []
                pageData.value.expandRowKey = []
            }

            if (expanded.some((item) => item.id === row.id)) {
                tableRef.value!.setCurrentRow(row)
                groupTableData.value = []
                pageData.value.expandRowKey = [row.id]

                formData.value.name = ''
                searchPlate(row.id)
            }
        }

        const getRowKey = (row: IntelPlateDBGroupList) => {
            return row.id
        }

        const displayDate = (date: string) => {
            if (date) {
                return formatDate(date, dateTime.dateTimeFormat)
            }
            return '--'
        }

        const isOutOfDate = (date: string) => {
            if (!date) {
                return false
            }
            const endDate = dayjs(date, { format: DEFAULT_DATE_FORMAT, jalali: false })
            return dateTime.getSystemTime().isAfter(endDate)
        }

        onActivated(async () => {
            openLoading()
            await getGroupList()
            closeLoading()
        })

        onBeforeRouteLeave(() => {
            if (history.state.backChlId) {
                delete history.state.backChlId
            }
        })

        return {
            pageData,
            formData,
            addGroup,
            editGroup,
            deleteGroup,
            exportGroup,
            isExportDisabled,
            confirmEditGroup,
            addPlate,
            editPlate,
            confirmEditPlate,
            deletePlate,
            tableRef,
            tableData,
            handleExpandRowClick,
            handleRowClick,
            handleExpandChange,
            getRowKey,
            groupTableData,
            changePlatePage,
            changePlatePageSize,
            displayPlateNumber,
            displayOwner,
            displayPhone,
            handleNameFocus,
            searchPlate,
            bounceSearchPlate,
            handleVehicleRecognition,
            displayGroupName,
            displayDate,
            isOutOfDate,
        }
    },
})
