import { type chlDataItem } from '@/types/apiType/system'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageTipBox } = useMessageBox()

        const router = useRouter()
        const tableRef = ref<TableInstance>()
        const tableData = ref<chlDataItem[]>([])

        const pageData = ref({
            userType: 'operator',
            operationType: 'testScreenshot',
            operationTypeList: [] as SelectOption<string, string>[],
            // 用户类型
            userTypeList: [
                { value: 'operator', label: Translate('IDCS_OPERATE_USER') },
                { value: 'repairtor', label: Translate('IDCS_MAINTENANCE_USER') },
                { value: 'acceptancetor', label: Translate('IDCS_ACCEPTANCE_USER') },
            ],
            // 操作类型
            // 操作人员
            operatorTypeList: [
                { value: 'testScreenshot', label: Translate('IDCS_OPERATE_USER_TEST_SNAP') },
                { value: 'faultRepair', label: Translate('IDCS_OPERATE_USER_FAULT') },
            ],
            // 维保人员
            repairtorTypeList: [
                { value: 'maintenanceScreenshot', label: Translate('IDCS_MAINTEN_USER_SNAP') },
                { value: 'maintenanceSign', label: Translate('IDCS_MAINTEN_USER_MAINTENSIGN') },
                { value: 'repairSign', label: Translate('IDCS_MAINTEN_USER_REPAIRSIGN') },
            ],
            // 验收人员
            acceptancetorTypeList: [{ value: 'acceptScreenshot', label: Translate('IDCS_ACCEPTANCE_SNAP') }],
            // 测试抓图/维保抓图/验收抓图
            // 全选
            selectAll: true,
            // 反选
            reverseSelect: false,
            // 警号
            alarmNum: '',
            // 故障报修——故障类型
            faultType: 'videoMonitorError',
            faultTypeList: [
                { value: 'videoMonitorError', label: Translate('IDCS_FAULT_VIDEO') },
                { value: 'aroundAlarmError', label: Translate('IDCS_FAULT_PERIMETER') },
                { value: 'netAlarmError', label: Translate('IDCS_FAULT_NETWORK') },
                { value: 'localAlarmError', label: Translate('IDCS_FAULT_LOCAL') },
                { value: 'invadeAlarmError', label: Translate('IDCS_FAULT_INTRUSION') },
                { value: 'buildIntercomError', label: Translate('IDCS_FAULT_INTERCOM') },
                { value: 'entranceGuardError', label: Translate('IDCS_FAULT_ACCESSCONTROL') },
                { value: 'entranceCtrlError', label: Translate('IDCS_FAULT_ENTRYCONTROL') },
                { value: 'electronicPatrolError', label: Translate('IDCS_FAULT_ELEPAT') },
                { value: 'otherSystemError', label: Translate('IDCS_FAULT_OTHERSYS') },
            ],
            // 选中的故障类型（多选）
            chooseFaultType: ['frontEndError', 'transLineError', 'controlSystemError'],
            chooseFaultTypeList: [
                { value: 'frontEndError', label: Translate('IDCS_FAULT_FRONTEQU') },
                { value: 'transLineError', label: Translate('IDCS_FAULT_TRANSMISSION') },
                { value: 'controlSystemError', label: Translate('IDCS_FAULT_CONTROLSYS') },
            ],
            // 故障维修——故障记录描述
            faultRecord: '',
            // 维保签到——保养项目
            maintenance: 'normal',
            maintenanceList: [
                { value: 'normal', label: Translate('IDCS_MAINTENSIGN_DAILY') },
                { value: 'special', label: Translate('IDCS_MAINTENSIGN_SPECIAL') },
            ],
            // 维保签到——选中的保养项目（多选）
            chooseMaintenanceType: ['videoMonitor', 'aroundAlarm', 'invadeAlarm', 'buildIntercom', 'entranceGuard', 'entranceCtrl', 'electronicPatrol', 'other'],
            chooseMaintenanceTypeList: [
                { value: 'videoMonitor', label: Translate('IDCS_MAINTENSIGN_ITEM_VIDEO') },
                { value: 'aroundAlarm', label: Translate('IDCS_MAINTENSIGN_ITEM_PERIMETER') },
                { value: 'invadeAlarm', label: Translate('IDCS_MAINTENSIGN_ITEM_INTRUSION') },
                { value: 'buildIntercom', label: Translate('IDCS_MAINTENSIGN_ITEM_INTERCOM') },
                { value: 'entranceGuard', label: Translate('IDCS_MAINTENSIGN_ITEM_ACCESSCONTROL') },
                { value: 'entranceCtrl', label: Translate('IDCS_MAINTENSIGN_ITEM_ENTRYCONTROL') },
                { value: 'electronicPatrol', label: Translate('IDCS_MAINTENSIGN_ITEM_ELEPAT') },
                { value: 'other', label: Translate('IDCS_MAINTENSIGN_ITEM_OTHERSYS') },
            ],
            // 维保签到——保养记录描述
            maintenanceRecord: '',
            // 维修签到——故障处理结果
            repair: 'noRepaired',
            repairList: [
                { value: 'noRepaired', label: Translate('IDCS_REPAIRSIGN_RESULT_NO') },
                { value: 'partRepaired', label: Translate('IDCS_REPAIRSIGN_RESULT_SOME') },
                { value: 'repaired', label: Translate('IDCS_REPAIRSIGN_RESULT_ALL') },
            ],
            // 维修签到——选中的维修项目（多选）
            chooseRepairType: ['videoMonitor', 'aroundAlarm', 'invadeAlarm', 'buildIntercom', 'entranceGuard', 'entranceCtrl', 'electronicPatrol', 'other'],
            // 维修签到——维修记录描述
            repairRecord: '',
            // 上传按钮禁用
            uploadDisabled: false,
        })

        // 用户类型
        const changeUserType = (value: string) => {
            switch (value) {
                case 'operator':
                    pageData.value.operationType = 'testScreenshot'
                    changeOperationType('testScreenshot')
                    pageData.value.operationTypeList = pageData.value.operatorTypeList
                    break
                case 'repairtor':
                    pageData.value.operationType = 'maintenanceScreenshot'
                    changeOperationType('maintenanceScreenshot')
                    pageData.value.operationTypeList = pageData.value.repairtorTypeList
                    break
                case 'acceptancetor':
                    pageData.value.operationType = 'acceptScreenshot'
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
                    refreshUploadBtnStatus()
                    break
            }
        }

        const getData = async () => {
            openLoading()
            const sendXml = rawXml`
                <types>
                    <nodeType>
                        <enum>chls</enum>
                        <enum>sensors</enum>
                        <enum>alarmOuts</enum>
                    </nodeType>
                </types>
                <nodeType type="nodeType">chls</nodeType>
                <requireField>
                    <name/>
                    <chlIndex/>
                    <chlType/>
                </requireField>
            `
            const result = await queryNodeList(sendXml)
            closeLoading()
            tableData.value = []
            commLoadResponseHandler(result, async ($) => {
                $('//content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const chlId = item.attr('id')!
                    tableData.value.push({
                        chlId,
                        chlNum: parseInt(chlId.substring(1, chlId.indexOf('-')), 16),
                        name: $item('name').text(),
                    })
                })
            })
        }

        // 表头全选checkbox点击
        const selectAllChl = (rows: chlDataItem[]) => {
            pageData.value.selectAll = rows.length === tableData.value.length
            refreshUploadBtnStatus()
        }

        // 手动点击选择行checkbox
        const handleSelect = (selection: chlDataItem[], row: chlDataItem) => {
            if (!selection.some((item) => item.chlId === row.chlId)) {
                tableRef.value!.setCurrentRow(null)
            }
            pageData.value.selectAll = selection.length === tableData.value.length
            refreshUploadBtnStatus()
        }

        // 全选
        const selectAll = () => {
            tableRef.value!.clearSelection()
            if (pageData.value.selectAll) {
                tableRef.value!.toggleAllSelection()
                pageData.value.uploadDisabled = false
            } else {
                pageData.value.uploadDisabled = true
            }
        }

        // 反选
        const reverseSelection = () => {
            const selectedRowsIds = tableRef.value!.getSelectionRows().map((row: chlDataItem) => row.chlId)
            tableRef.value!.setCurrentRow(null)
            tableRef.value!.clearSelection()
            tableData.value.forEach((row: chlDataItem) => {
                if (!selectedRowsIds.includes(row.chlId)) {
                    tableRef.value!.toggleRowSelection(row, true)
                }
            })
            pageData.value.selectAll = selectedRowsIds.length === 0
            refreshUploadBtnStatus()
        }

        // 行点击事件
        const handleRowClick = (rowData: chlDataItem) => {
            pageData.value.selectAll = false
            tableRef.value!.clearSelection()
            tableRef.value!.toggleRowSelection(rowData, true)
            refreshUploadBtnStatus()
        }

        //设置上传按钮状态
        const refreshUploadBtnStatus = () => {
            switch (pageData.value.operationType) {
                case 'testScreenshot':
                case 'maintenanceScreenshot':
                case 'acceptScreenshot':
                    pageData.value.uploadDisabled = tableRef.value!.getSelectionRows().length === 0
                    break
                case 'faultRepair':
                    pageData.value.uploadDisabled = pageData.value.chooseFaultType.length === 0
                    break
                case 'maintenanceSign':
                    pageData.value.uploadDisabled = pageData.value.chooseMaintenanceType.length === 0
                    break
                case 'repairSign':
                    pageData.value.uploadDisabled = pageData.value.chooseRepairType.length === 0
                    break
            }
        }

        const handleReturn = () => {
            router.push({
                path: '/config/system/platform/parameter',
            })
        }

        // 测试抓图上传数据
        const getTestScreenshotSaveData = () => {
            const selection = tableRef.value!.getSelectionRows()
            let sendXml = rawXml`<content>
            <item id='testerUploadImage'><chlList type='list'>`
            selection.forEach((item: chlDataItem) => {
                sendXml += rawXml`<item>${item.chlId}</item>`
            })
            sendXml += `</chlList></item></content>`
            return sendXml
        }

        // 故障报修上传数据
        const getFaultRepairSaveData = () => {
            const sendXml = rawXml`<content>
                <item id='errorRepair'>
                <errorType>${pageData.value.faultType}</errorType>
                <errorParts>${pageData.value.chooseFaultType.join(',')}</errorParts>
                <comment><![CDATA[${pageData.value.faultRecord}]]></comment>
                </item>
                </content>
            `
            return sendXml
        }

        // 维保抓图上传数据
        const getMaintenanceScreenshotSaveData = () => {
            const selection = tableRef.value!.getSelectionRows()
            let sendXml = rawXml`<content>
            <item id='keeperUploadImage'><chlList type='list'>`
            selection.forEach((item: chlDataItem) => {
                sendXml += rawXml`<item>${item.chlId}</item>`
            })
            sendXml += `</chlList></item></content>`
            return sendXml
        }

        // 维保签到上传数据
        const getMaintenanceSignSaveData = () => {
            const sendXml = rawXml`<content>
                <item id='keeperAssign'>
                <keepType>${pageData.value.maintenance}</keepType>
                <operationItem>${pageData.value.chooseMaintenanceType.join(',')}</operationItem>
                <comment><![CDATA[${pageData.value.maintenanceRecord}]]></comment>
                </item>
                </content>
            `
            return sendXml
        }

        // 维修签到上传数据
        const getRepairSignSaveData = () => {
            const sendXml = rawXml`<content>
                <item id='repairAssign'>
                <repairResult>${pageData.value.repair}</repairResult>
                <operationItem>${pageData.value.chooseRepairType.join(',')}</operationItem>
                <comment><![CDATA[${pageData.value.repairRecord}]]></comment>
                </item>
                </content>
            `
            return sendXml
        }

        // 验收抓图上传数据
        const getAcceptScreenshotSaveData = () => {
            const selection = tableRef.value!.getSelectionRows()
            let sendXml = rawXml`<content>
            <item id='checkUploadImage'><chlList type='list'>`
            selection.forEach((item: chlDataItem) => {
                sendXml += rawXml`<item>${item.chlId}</item>`
            })
            sendXml += rawXml`</chlList>
            <alarmNum>${pageData.value.alarmNum}</alarmNum>
            </item></content>`
            return sendXml
        }

        // 上传数据
        const uploadData = async () => {
            let sendXml = ``
            switch (pageData.value.operationType) {
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
            if ($('//status').text() == 'success') {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_PLATFORM_OPERATE_UPLOAD_MSG'),
                })
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
            // 用户类型
            changeUserType,
            // 操作类型
            changeOperationType,
            // 表头全选
            selectAllChl,
            // 手动点击选择行checkbox
            handleSelect,
            // 全选
            selectAll,
            // 反选
            reverseSelection,
            // 行点击事件
            handleRowClick,
            // 更新上传按钮状态
            refreshUploadBtnStatus,
            // 返回
            handleReturn,
            // 上传数据
            uploadData,
        }
    },
})
