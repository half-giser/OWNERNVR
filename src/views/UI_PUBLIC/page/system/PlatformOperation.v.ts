/*
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-10-25 18:38:09
 * @Description: 平台操作管理
 */
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        const router = useRouter()

        const tableRef = ref<TableInstance>()
        const tableData = ref<SystemSHDBPlatformOperatorDto[]>([])

        const pageData = ref({
            operationTypeList: [] as SelectOption<string, string>[],
            // 用户类型
            userTypeList: [
                {
                    value: 'operator',
                    label: Translate('IDCS_OPERATE_USER'),
                },
                {
                    value: 'repairtor',
                    label: Translate('IDCS_MAINTENANCE_USER'),
                },
                {
                    value: 'acceptancetor',
                    label: Translate('IDCS_ACCEPTANCE_USER'),
                },
            ],
            // 操作类型
            // 操作人员
            operatorTypeList: [
                {
                    value: 'testScreenshot',
                    label: Translate('IDCS_OPERATE_USER_TEST_SNAP'),
                },
                {
                    value: 'faultRepair',
                    label: Translate('IDCS_OPERATE_USER_FAULT'),
                },
            ],
            // 维保人员
            repairtorTypeList: [
                {
                    value: 'maintenanceScreenshot',
                    label: Translate('IDCS_MAINTEN_USER_SNAP'),
                },
                {
                    value: 'maintenanceSign',
                    label: Translate('IDCS_MAINTEN_USER_MAINTENSIGN'),
                },
                {
                    value: 'repairSign',
                    label: Translate('IDCS_MAINTEN_USER_REPAIRSIGN'),
                },
            ],
            // 验收人员
            acceptancetorTypeList: [
                {
                    value: 'acceptScreenshot',
                    label: Translate('IDCS_ACCEPTANCE_SNAP'),
                },
            ],
            // 测试抓图/维保抓图/验收抓图
            // 全选
            selectAll: true,
            // 反选
            reverseSelect: false,
            faultTypeList: [
                {
                    value: 'videoMonitorError',
                    label: Translate('IDCS_FAULT_VIDEO'),
                },
                {
                    value: 'aroundAlarmError',
                    label: Translate('IDCS_FAULT_PERIMETER'),
                },
                {
                    value: 'netAlarmError',
                    label: Translate('IDCS_FAULT_NETWORK'),
                },
                {
                    value: 'localAlarmError',
                    label: Translate('IDCS_FAULT_LOCAL'),
                },
                {
                    value: 'invadeAlarmError',
                    label: Translate('IDCS_FAULT_INTRUSION'),
                },
                {
                    value: 'buildIntercomError',
                    label: Translate('IDCS_FAULT_INTERCOM'),
                },
                {
                    value: 'entranceGuardError',
                    label: Translate('IDCS_FAULT_ACCESSCONTROL'),
                },
                {
                    value: 'entranceCtrlError',
                    label: Translate('IDCS_FAULT_ENTRYCONTROL'),
                },
                {
                    value: 'electronicPatrolError',
                    label: Translate('IDCS_FAULT_ELEPAT'),
                },
                {
                    value: 'otherSystemError',
                    label: Translate('IDCS_FAULT_OTHERSYS'),
                },
            ],
            chooseFaultTypeList: [
                {
                    value: 'frontEndError',
                    label: Translate('IDCS_FAULT_FRONTEQU'),
                },
                {
                    value: 'transLineError',
                    label: Translate('IDCS_FAULT_TRANSMISSION'),
                },
                {
                    value: 'controlSystemError',
                    label: Translate('IDCS_FAULT_CONTROLSYS'),
                },
            ],
            maintenanceList: [
                {
                    value: 'normal',
                    label: Translate('IDCS_MAINTENSIGN_DAILY'),
                },
                {
                    value: 'special',
                    label: Translate('IDCS_MAINTENSIGN_SPECIAL'),
                },
            ],
            chooseMaintenanceTypeList: [
                {
                    value: 'videoMonitor',
                    label: Translate('IDCS_MAINTENSIGN_ITEM_VIDEO'),
                },
                {
                    value: 'aroundAlarm',
                    label: Translate('IDCS_MAINTENSIGN_ITEM_PERIMETER'),
                },
                {
                    value: 'invadeAlarm',
                    label: Translate('IDCS_MAINTENSIGN_ITEM_INTRUSION'),
                },
                {
                    value: 'buildIntercom',
                    label: Translate('IDCS_MAINTENSIGN_ITEM_INTERCOM'),
                },
                {
                    value: 'entranceGuard',
                    label: Translate('IDCS_MAINTENSIGN_ITEM_ACCESSCONTROL'),
                },
                {
                    value: 'entranceCtrl',
                    label: Translate('IDCS_MAINTENSIGN_ITEM_ENTRYCONTROL'),
                },
                {
                    value: 'electronicPatrol',
                    label: Translate('IDCS_MAINTENSIGN_ITEM_ELEPAT'),
                },
                {
                    value: 'other',
                    label: Translate('IDCS_MAINTENSIGN_ITEM_OTHERSYS'),
                },
            ],
            repairList: [
                {
                    value: 'noRepaired',
                    label: Translate('IDCS_REPAIRSIGN_RESULT_NO'),
                },
                {
                    value: 'partRepaired',
                    label: Translate('IDCS_REPAIRSIGN_RESULT_SOME'),
                },
                {
                    value: 'repaired',
                    label: Translate('IDCS_REPAIRSIGN_RESULT_ALL'),
                },
            ],
        })

        const formData = ref({
            userType: 'operator',
            operationType: 'testScreenshot',
            // 警号
            alarmNum: '',
            // 选中的故障类型（多选）
            chooseFaultType: ['frontEndError', 'transLineError', 'controlSystemError'],
            // 故障报修——故障类型
            faultType: 'videoMonitorError',
            // 故障维修——故障记录描述
            faultRecord: '',
            // 维保签到——保养项目
            maintenance: 'normal',
            // 维保签到——选中的保养项目（多选）
            chooseMaintenanceType: ['videoMonitor', 'aroundAlarm', 'invadeAlarm', 'buildIntercom', 'entranceGuard', 'entranceCtrl', 'electronicPatrol', 'other'],
            // 维保签到——保养记录描述
            maintenanceRecord: '',
            // 维修签到——故障处理结果
            repair: 'noRepaired',
            // 维修签到——选中的维修项目（多选）
            chooseRepairType: ['videoMonitor', 'aroundAlarm', 'invadeAlarm', 'buildIntercom', 'entranceGuard', 'entranceCtrl', 'electronicPatrol', 'other'],
            // 维修签到——维修记录描述
            repairRecord: '',
        })

        // 用户类型
        const changeUserType = (value: string) => {
            switch (value) {
                case 'operator':
                    formData.value.operationType = 'testScreenshot'
                    changeOperationType('testScreenshot')
                    pageData.value.operationTypeList = pageData.value.operatorTypeList
                    break
                case 'repairtor':
                    formData.value.operationType = 'maintenanceScreenshot'
                    changeOperationType('maintenanceScreenshot')
                    pageData.value.operationTypeList = pageData.value.repairtorTypeList
                    break
                case 'acceptancetor':
                    formData.value.operationType = 'acceptScreenshot'
                    changeOperationType('acceptScreenshot')
                    pageData.value.operationTypeList = pageData.value.acceptancetorTypeList
                    break
                default:
                    pageData.value.operationTypeList = []
                    break
            }
        }

        // 用户类型
        const changeOperationType = (value: string) => {
            switch (value) {
                case 'testScreenshot':
                case 'maintenanceScreenshot':
                case 'acceptScreenshot':
                    pageData.value.selectAll = true
                    selectAll()
                    pageData.value.reverseSelect = false
                    break
                case 'faultRepair':
                case 'maintenanceSign':
                case 'repairSign':
                    break
            }
        }

        const getData = async () => {
            openLoading()
            const result = await getChlList()
            closeLoading()
            commLoadResponseHandler(result, ($) => {
                tableData.value = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const chlId = item.attr('id')
                    return {
                        chlId,
                        chlNum: hexToDec(chlId.substring(1, chlId.indexOf('-'))),
                        name: $item('name').text(),
                    }
                })
            })
        }

        // 表头全选checkbox点击
        const selectAllChl = (rows: SystemSHDBPlatformOperatorDto[]) => {
            pageData.value.selectAll = rows.length === tableData.value.length
        }

        // 手动点击选择行checkbox
        const handleSelect = (selection: SystemSHDBPlatformOperatorDto[], row: SystemSHDBPlatformOperatorDto) => {
            if (!selection.some((item) => item.chlId === row.chlId)) {
                tableRef.value!.setCurrentRow(null)
            }
            pageData.value.selectAll = selection.length === tableData.value.length
        }

        // 全选
        const selectAll = () => {
            tableRef.value!.clearSelection()
            if (pageData.value.selectAll) {
                tableRef.value!.toggleAllSelection()
            }
        }

        // 反选
        const reverseSelection = () => {
            const selectedRowsIds = tableRef.value!.getSelectionRows().map((row: SystemSHDBPlatformOperatorDto) => row.chlId)
            tableRef.value!.setCurrentRow(null)
            tableRef.value!.clearSelection()
            tableData.value.forEach((row) => {
                if (!selectedRowsIds.includes(row.chlId)) {
                    tableRef.value!.toggleRowSelection(row, true)
                }
            })
            pageData.value.selectAll = selectedRowsIds.length === 0
        }

        // 行点击事件
        const handleRowClick = (rowData: SystemSHDBPlatformOperatorDto) => {
            pageData.value.selectAll = false
            tableRef.value!.clearSelection()
            tableRef.value!.toggleRowSelection(rowData, true)
        }

        //设置上传按钮状态
        const uploadDisabled = computed(() => {
            switch (formData.value.operationType) {
                case 'testScreenshot':
                case 'maintenanceScreenshot':
                case 'acceptScreenshot':
                    return tableRef.value!.getSelectionRows().length === 0
                case 'faultRepair':
                    return formData.value.chooseFaultType.length === 0
                case 'maintenanceSign':
                    return formData.value.chooseMaintenanceType.length === 0
                case 'repairSign':
                    return formData.value.chooseRepairType.length === 0
            }
        })

        const goBack = () => {
            router.push({
                path: '/config/system/platform/parameter',
            })
        }

        // 测试抓图上传数据
        const getTestScreenshotSaveData = () => {
            const selection = tableRef.value!.getSelectionRows() as SystemSHDBPlatformOperatorDto[]
            const sendXml = rawXml`
                <content>
                    <item id='testerUploadImage'>
                        <chlList type='list'>
                            ${selection.map((item) => `<item>${item.chlId}</item>`).join('')}
                        </chlList>
                    </item>
                </content>
            `
            return sendXml
        }

        // 故障报修上传数据
        const getFaultRepairSaveData = () => {
            const sendXml = rawXml`
                <content>
                    <item id='errorRepair'>
                        <errorType>${formData.value.faultType}</errorType>
                        <errorParts>${formData.value.chooseFaultType.join(',')}</errorParts>
                        <comment>${wrapCDATA(formData.value.faultRecord)}</comment>
                    </item>
                </content>
            `
            return sendXml
        }

        // 维保抓图上传数据
        const getMaintenanceScreenshotSaveData = () => {
            const selection = tableRef.value!.getSelectionRows() as SystemSHDBPlatformOperatorDto[]
            const sendXml = rawXml`
                <content>
                    <item id='keeperUploadImage'>
                        <chlList type='list'>
                            ${selection.map((item) => `<item>${item.chlId}</item>`).join('')}
                        </chlList>
                    </item>
                </content>
            `
            return sendXml
        }

        // 维保签到上传数据
        const getMaintenanceSignSaveData = () => {
            const sendXml = rawXml`
                <content>
                    <item id='keeperAssign'>
                        <keepType>${formData.value.maintenance}</keepType>
                        <operationItem>${formData.value.chooseMaintenanceType.join(',')}</operationItem>
                        <comment>${wrapCDATA(formData.value.maintenanceRecord)}</comment>
                    </item>
                </content>
            `
            return sendXml
        }

        // 维修签到上传数据
        const getRepairSignSaveData = () => {
            const sendXml = rawXml`
                <content>
                    <item id='repairAssign'>
                        <repairResult>${formData.value.repair}</repairResult>
                        <operationItem>${formData.value.chooseRepairType.join(',')}</operationItem>
                        <comment>${wrapCDATA(formData.value.repairRecord)}</comment>
                    </item>
                </content>
            `
            return sendXml
        }

        // 验收抓图上传数据
        const getAcceptScreenshotSaveData = () => {
            const selection = tableRef.value!.getSelectionRows() as SystemSHDBPlatformOperatorDto[]
            const sendXml = rawXml`
                <content>
                    <item id='checkUploadImage'>
                        <chlList type='list'>
                            ${selection.map((item) => `<item>${item.chlId}</item>`).join('')}
                        </chlList>
                        <alarmNum>${formData.value.alarmNum}</alarmNum>
                    </item>
                </content>
            `
            return sendXml
        }

        // 上传数据
        const uploadData = async () => {
            let sendXml = ''
            switch (formData.value.operationType) {
                case 'testScreenshot':
                    sendXml = getTestScreenshotSaveData()
                    break
                case 'faultRepair':
                    sendXml = getFaultRepairSaveData()
                    break
                case 'maintenanceScreenshot':
                    sendXml = getMaintenanceScreenshotSaveData()
                    break
                case 'maintenanceSign':
                    sendXml = getMaintenanceSignSaveData()
                    break
                case 'repairSign':
                    sendXml = getRepairSignSaveData()
                    break
                case 'acceptScreenshot':
                    sendXml = getAcceptScreenshotSaveData()
                    break
            }
            openLoading()
            const result = await editSHDBOperationCfg(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                openMessageBox(Translate('IDCS_PLATFORM_OPERATE_UPLOAD_MSG'))
            }
            closeLoading()
        }

        // 挂载完成获取数据
        onMounted(async () => {
            pageData.value.operationTypeList = pageData.value.operatorTypeList
            await getData()
            selectAll()
        })

        return {
            tableRef,
            tableData,
            pageData,
            formData,
            uploadDisabled,
            changeUserType,
            changeOperationType,
            selectAllChl,
            handleSelect,
            selectAll,
            reverseSelection,
            handleRowClick,
            goBack,
            uploadData,
        }
    },
})
