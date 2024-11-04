/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-02 14:01:05
 * @Description: 车牌库
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-11-04 17:58:39
 */
import { type TableInstance } from 'element-plus'
import { IntelPlateDBGroupList, IntelPlateDBPlateInfo } from '@/types/apiType/intelligentAnalysis'
import IntelLicencePlateDBEditPop from './IntelLicencePlateDBEditPop.vue'
import IntelLicencePlateDBExportPop from './IntelLicencePlateDBExportPop.vue'
import IntelLicencePlateDBAddPlatePop from './IntelLicencePlateDBAddPlatePop.vue'

export default defineComponent({
    components: {
        IntelLicencePlateDBEditPop,
        IntelLicencePlateDBExportPop,
        IntelLicencePlateDBAddPlatePop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const userSession = useUserSessionStore()
        const router = useRouter()

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
            isExportDisabled: import.meta.env.VITE_APP_TYPE === 'P2P' || isHttpsLogin(),
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

        /**
         * @description 检查是否有操作权限
         * @returns {boolean}
         */
        const checkPermission = () => {
            if (!userSession.facePersonnalInfoMgr) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_NO_PERMISSION'),
                })
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
                    tableRef.value?.toggleRowExpansion(find, false)
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

                    if ($('//status').text() === 'success') {
                        if (pageData.value.expandRowKey.length) {
                            const find = tableData.value.find((item) => item.id === pageData.value.expandRowKey[0])
                            if (find) {
                                tableRef.value?.toggleRowExpansion(find, false)
                            }
                            pageData.value.expandRowKey = []
                        }
                        getGroupList()
                    } else {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_NO_AUTH'),
                        })
                    }
                } catch (e) {
                    if (pageData.value.expandRowKey.length) {
                        const find = tableData.value.find((item) => item.id === pageData.value.expandRowKey[0])
                        if (find) {
                            tableRef.value?.toggleRowExpansion(find, false)
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
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_EXPORT_FAIL'),
                })
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
        const handleVehicleRecognition = async () => {
            if (!userSession.hasAuth('alarmMgr')) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_NO_AUTH'),
                })
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
            if (pageData.value.editPlateType === 'add') {
                await getGroupList()
            }

            if (pageData.value.expandRowKey.length) {
                searchPlate(pageData.value.expandRowKey[0], true)
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

                if ($('//status').text() === 'success') {
                    searchPlate(row.groupId, true)
                } else {
                    const errorCode = Number($('//errorCode').text())
                    if (errorCode === ErrorCode.USER_ERROR_NO_AUTH) {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_NO_AUTH'),
                        })
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
            searchPlate(groupId, true)
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
         * @param {boolean} forced 关键字没变时是否刷新
         */
        const searchPlate = async (groupId: string, forced = false) => {
            if (!forced && formData.value.cacheName === formData.value.name) {
                return
            }
            formData.value.pageIndex = 1
            await getPlate(1, groupId)
        }

        /**
         * @description 获取车牌列表
         * @param {number} pageIndex
         * @param {string} groupId
         */
        const getPlate = async (pageIndex: number, groupId: string) => {
            openLoading()

            groupTableData.value = []

            const sendXml = rawXml`
                <pageIndex>${pageIndex.toString()}</pageIndex>
                <pageSize>${formData.value.pageSize.toString()}</pageSize>
                <condition>
                    <groupId>${groupId}</groupId>
                    ${ternary(!!formData.value.name, `<plateInfoKeyword>${wrapCDATA(formData.value.name)}</plateInfoKeyword>`)}
                </condition>
            `
            const result = await queryPlateNumber(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                groupTableData.value = $('//content/plate/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id')!,
                        groupId: $item('groupId').text(),
                        plateNumber: $item('plateNumber').text(),
                        owner: $item('owner').text(),
                        ownerPhone: $item('ownerPhone').text(),
                        vehicleType: $item('vehicleType').text(),
                        ownerFaceId: $item('ownerFaceId').text(),
                    }
                })
                formData.value.total = Number($('//content/plate').attr('total')!)
            }
        }

        /**
         * @description 获取分组列表
         */
        const getGroupList = async () => {
            openLoading()

            const result = await queryPlateLibrary()
            const $ = queryXml(result)

            closeLoading()

            tableData.value = $('//content/group/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    id: item.attr('id')!,
                    name: $item('name').text(),
                    plateNum: Number($item('plateNum').text()),
                }
            })
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
        const handleExpandChange = async (row: IntelPlateDBGroupList, expanded: IntelPlateDBGroupList[]) => {
            if (expanded.length > 1) {
                const find = tableData.value.find((item) => item.id === expanded[0].id)!
                tableRef.value?.toggleRowExpansion(find, false)
            }

            if (!expanded.length) {
                groupTableData.value = []
                pageData.value.expandRowKey = []
            }

            if (expanded.some((item) => item.id === row.id)) {
                tableRef.value?.setCurrentRow(row)
                groupTableData.value = []
                pageData.value.expandRowKey = [row.id]

                formData.value.name = ''
                searchPlate(row.id, true)
            }
        }

        const getRowKey = (row: IntelPlateDBGroupList) => {
            return row.id
        }

        onMounted(async () => {
            getGroupList()
        })

        onBeforeUnmount(() => {
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
            confirmEditGroup,
            addPlate,
            editPlate,
            confirmEditPlate,
            deletePlate,
            tableRef,
            tableData,
            handleRowClick,
            handleExpandChange,
            getRowKey,
            groupTableData,
            changePlatePage,
            changePlatePageSize,
            hideSensitiveInfo,
            handleNameFocus,
            searchPlate,
            handleVehicleRecognition,
            IntelLicencePlateDBEditPop,
            IntelLicencePlateDBExportPop,
            IntelLicencePlateDBAddPlatePop,
        }
    },
})
