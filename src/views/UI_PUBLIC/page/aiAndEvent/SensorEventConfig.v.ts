import { type PresetItem, SensorEvent, type ChlList } from '@/types/apiType/aiAndEvent'
import { QueryNodeListDto } from '@/types/apiType/channel'
import { tableRowStatus, tableRowStatusToolTip } from '@/utils/const/other'
import { cloneDeep, isEqual } from 'lodash'
import BaseTransferPop from '@/components/BaseTransferPop.vue'
import BaseTransferDialog from '@/components/BaseTransferDialog.vue'
import SetPresetPop from './SetPresetPop.vue'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'

export default defineComponent({
    components: {
        BaseTransferPop,
        BaseTransferDialog,
        SetPresetPop,
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const recordRef = ref()
        const snapRef = ref()
        const alarmOutRef = ref()
        const tempName = ref('')
        const defaultAudioId = '{00000000-0000-0000-0000-000000000000}'

        const pageData = ref({
            // 分页有关变量
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            // 排程列表
            scheduleList: [] as SelectOption<string, string>[],
            scheduleManagePopOpen: false,
            // 类型
            typeList: [
                { value: 'NO', label: Translate('IDCS_ALWAYS_OPEN') },
                { value: 'NC', label: Translate('IDCS_ALWAYS_CLOSE') },
            ],
            // 启用、推送、蜂鸣器、消息框弹出、email
            switchList: [
                { value: 'true', label: Translate('IDCS_ON') },
                { value: 'false', label: Translate('IDCS_OFF') },
            ],
            // 持续时间列表
            durationList: [] as SelectOption<string, string>[],
            // 是否支持声音
            supportAudio: false,
            // 声音列表
            audioList: [] as SelectOption<string, string>[],
            // 视频弹出列表
            videoPopupChlList: [] as SelectOption<string, string>[],
            // 应用是否禁用
            applyDisabled: true,

            // 初始化时只请求一次相关列表数据
            initData: false,

            initComplated: false,

            chls: [] as ChlList[],

            // record穿梭框数据源
            recordList: [] as { value: string; label: string }[],
            recordHeaderTitle: 'IDCS_TRIGGER_CHANNEL_RECORD',
            recordSourceTitle: 'IDCS_CHANNEL',
            recordTargetTitle: 'IDCS_CHANNEL_TRGGER',
            // 表头选中id
            recordChosedIdsAll: [] as string[],
            // 表头选中的数据
            recordChosedListAll: [] as { value: string; label: string }[],
            recordIsShowAll: false,
            recordIsShow: false,
            recordType: 'record',

            // snap穿梭框数据源
            snapList: [] as { value: string; label: string }[],
            snapHeaderTitle: 'IDCS_TRIGGER_CHANNEL_SNAP',
            snapSourceTitle: 'IDCS_CHANNEL',
            snapTargetTitle: 'IDCS_CHANNEL_TRGGER',
            // 表头选中id
            snapChosedIdsAll: [] as string[],
            // 表头选中的数据
            snapChosedListAll: [] as { value: string; label: string }[],
            snapIsShowAll: false,
            snapIsShow: false,
            snapType: 'snap',

            // alarmOut穿梭框数据源
            alarmOutList: [] as { value: string; label: string }[],
            alarmOutHeaderTitle: 'IDCS_TRIGGER_ALARM_OUT',
            alarmOutSourceTitle: 'IDCS_ALARM_OUT',
            alarmOutTargetTitle: 'IDCS_TRIGGER_ALARM_OUT',
            // 表头选中id
            alarmOutChosedIdsAll: [] as string[],
            // 表头选中的数据
            alarmOutChosedListAll: [] as { value: string; label: string }[],
            alarmOutIsShowAll: false,
            alarmOutIsShow: false,
            alarmOutType: 'alarmOut',

            // 当前打开dialog行的index
            triggerDialogIndex: 0,

            // 预置点名称配置
            isPresetPopOpen: false,
            presetChlId: '',
            presetLinkedList: [] as PresetItem[],
        })

        // 表格数据
        const tableData = ref<SensorEvent[]>([])
        // 缓存表格初始数据，保存时对比变化了的行
        let tableDataInit = [] as SensorEvent[]

        // 改变页码，刷新数据
        const changePagination = () => {
            getData()
        }

        //  改变每页显示条数，刷新数据
        const changePaginationSize = () => {
            const totalPage = Math.ceil(pageData.value.totalCount / pageData.value.pageSize)
            if (pageData.value.pageIndex > totalPage) {
                pageData.value.pageIndex = totalPage
            }
            getData()
        }

        // 获取系统配置和基本信息，部分系统配置可用项
        const getSystemCaps = async () => {
            const result = await querySystemCaps(getXmlWrapData(''))
            const $ = queryXml(result)

            pageData.value.supportAudio = $('/response/content/supportAlarmAudioConfig').text() == 'true'
        }

        // 获取声音数据
        const getAudioData = async () => {
            const result = await queryAlarmAudioCfg()
            const $ = queryXml(result)

            pageData.value.audioList = $('/response/content/audioList/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    value: item.attr('id')!,
                    label: $item('name').text(),
                }
            })
            pageData.value.audioList.push({
                value: defaultAudioId,
                label: '<' + Translate('IDCS_NULL') + '>',
            })
        }

        // 获取chl通道数据
        const getChlData = async (type: string) => {
            const queryNodeListDto = new QueryNodeListDto()
            queryNodeListDto.nodeType = 'chls'
            queryNodeListDto.isSupportSnap = type == 'snap'

            getChlList(queryNodeListDto).then((result: any) => {
                commLoadResponseHandler(result, ($) => {
                    $('/response/content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        pageData.value.chls.push({
                            id: item.attr('id')!,
                            name: $item('name').text(),
                        })
                    })
                    if (type == 'snap') {
                        // 在获取到通道数据后处理有关页面数据列表
                        pageData.value.snapList = pageData.value.chls.map((item) => {
                            return {
                                value: item.id,
                                label: item.name,
                            }
                        })
                    } else {
                        // 在获取到通道数据后处理有关页面数据列表
                        pageData.value.recordList = pageData.value.chls.map((item) => {
                            return {
                                value: item.id,
                                label: item.name,
                            }
                        })
                        // 视频弹出数据
                        pageData.value.videoPopupChlList.push({
                            value: '',
                            label: Translate('IDCS_OFF'),
                        })
                        pageData.value.chls.forEach((item) => {
                            pageData.value.videoPopupChlList.push({
                                value: item.id,
                                label: item.name,
                            })
                        })
                    }
                    pageData.value.chls = []
                })
            })
        }

        const getAlarmOutData = async () => {
            getChlList({
                requireField: ['device'],
                nodeType: 'alarmOuts',
            }).then((result: any) => {
                commLoadResponseHandler(result, ($) => {
                    const rowData = [] as {
                        id: string
                        name: string
                        device: {
                            id: string
                            innerText: string
                        }
                    }[]
                    $('/response/content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        let name = $item('name').text()
                        if ($item('devDesc').text()) {
                            name = $item('devDesc').text() + '_' + name
                        }
                        rowData.push({
                            id: item.attr('id')!,
                            name,
                            device: {
                                id: $item('device').attr('id'),
                                innerText: $item('device').text(),
                            },
                        })
                    })
                    pageData.value.alarmOutList = rowData.map((item) => {
                        return {
                            value: item.id,
                            label: item.name,
                        }
                    })
                })
            })
        }

        const getData = async () => {
            pageData.value.scheduleList = await buildScheduleList()

            // 初始化、改变页码、改变单页行数进行数据清空和btn禁用
            tableData.value.length = 0
            tableDataInit = []
            pageData.value.initComplated = false
            pageData.value.applyDisabled = true

            // 获取列表数据
            getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                nodeType: 'sensors',
            }).then((result: any) => {
                commLoadResponseHandler(result, ($) => {
                    pageData.value.totalCount = Number($('/response/content').attr('total'))
                    $('/response/content/item').forEach(async (item) => {
                        const row = new SensorEvent()
                        row.id = item.attr('id')!
                        row.alarmInType = item.attr('alarmInType')!
                        row.nodeIndex = item.attr('index')!
                        row.status = tableRowStatus.loading
                        tableData.value.push(row)
                    })
                    tableData.value.forEach(async (item) => {
                        await getDataById(item)
                        if (tableDataInit.length == pageData.value.pageSize) {
                            // 数据获取完成，用于打开对tabledata的监听，判断applyBtn是否可用
                            pageData.value.initComplated = true
                        }
                    })
                })
            })
        }

        const getDataById = async (rowData: SensorEvent) => {
            const sendXml = rawXml`
                    <condition>
                        <alarmInId>${rowData.id}</alarmInId>
                    </condition>
                    `
            const result = await queryAlarmIn(sendXml)
            rowData.status = '' // 请求完成，取消loading状态
            commLoadResponseHandler(result, ($) => {
                rowData.disabled = false
                if (!pageData.value.initData && $('/response/content/param/holdTimeNote').length > 0) {
                    $('/response/content/param/holdTimeNote')
                        .text()
                        .split(',')
                        .forEach((item) => {
                            const itemNum = Number(item)
                            pageData.value.durationList.push({
                                value: item,
                                label:
                                    itemNum == 60
                                        ? '1 ' + Translate('IDCS_MINUTE')
                                        : itemNum > 60
                                          ? itemNum / 60 + ' ' + Translate('IDCS_MINUTES')
                                          : itemNum == 1
                                            ? itemNum + ' ' + Translate('IDCS_SECOND')
                                            : itemNum + ' ' + Translate('IDCS_SECONDS'),
                            })
                        })
                    pageData.value.initData = true
                }

                const content = $('/response/content')[0]
                const $content = queryXml(content.element)

                const index = Number($content('param/index').text()) - 0 + 1
                const devDescTemp = $content('param/devDesc').text()
                const isEditable = $content('param/devDesc').attr('isEditable') == 'false' ? false : true
                let serialNum = ''
                if (rowData.alarmInType === 'local') {
                    serialNum = Translate('IDCS_LOCAL') + '-' + rowData.nodeIndex
                } else if (rowData.alarmInType === 'virtual') {
                    serialNum = Translate('IDCS_VIRTUAL') + '-' + rowData.nodeIndex
                } else {
                    serialNum = devDescTemp + '-' + index
                }

                rowData.isEditable = isEditable
                rowData.serialNum = serialNum
                rowData.name = $content('param/name').text()
                rowData.originalName = $content('param/name').text()
                rowData.type = $content('param/voltage').text()
                rowData.switch = $content('param/switch').text()
                rowData.holdTimeNote = $content('param/holdTimeNote').text()
                rowData.holdTime = $content('param/holdTime').text()
                rowData.schedule = {
                    value: $content('trigger/triggerSchedule/schedule').attr('id'),
                    label: $content('trigger/triggerSchedule/schedule').text(),
                }
                rowData.oldSchedule = $content('trigger/triggerSchedule/schedule').attr('id')
                rowData.sysRec = {
                    switch: $content('trigger/sysRec/switch').text() == 'true',
                    chls: [],
                }
                rowData.sysAudio = $content('trigger/sysAudio').attr('id') || defaultAudioId
                rowData.sysSnap = {
                    switch: $content('trigger/sysSnap/switch').text() == 'true',
                    chls: [],
                }
                rowData.alarmOut = {
                    switch: $content('trigger/alarmOut/switch').text() == 'true',
                    alarmOuts: [],
                }
                rowData.popVideo = {
                    switch: $content('trigger/popVideo/switch').text(),
                    chl: {
                        id: $content('trigger/popVideo/chl').attr('id'),
                        innerText: $content('trigger/popVideo/chl').text(),
                    },
                }
                rowData.preset = {
                    switch: $content('trigger/preset/switch').text() == 'true',
                    presets: [],
                }
                rowData.msgPushSwitch = $content('trigger/msgPushSwitch').text()
                rowData.buzzerSwitch = $content('trigger/buzzerSwitch').text()
                rowData.emailSwitch = $content('trigger/emailSwitch').text()
                rowData.popMsgSwitch = $content('trigger/popMsgSwitch').text()

                const audioData = pageData.value.audioList.filter((item) => {
                    item.value == rowData.sysAudio
                })
                if (audioData.length == 0) {
                    rowData.sysAudio = defaultAudioId
                }

                $content('trigger/sysRec/chls/item').forEach((item) => {
                    rowData.sysRec.chls.push({
                        value: item.attr('id')!,
                        label: item.text(),
                    })
                })
                rowData.recordList = rowData.sysRec.chls.map((item) => item.value)

                $content('trigger/sysSnap/chls/item').forEach((item) => {
                    rowData.sysSnap.chls.push({
                        value: item.attr('id')!,
                        label: item.text(),
                    })
                })

                $content('trigger/alarmOut/chls/item').forEach((item) => {
                    rowData.alarmOut.alarmOuts.push({
                        value: item.attr('id')!,
                        label: item.text(),
                    })
                })

                $content('trigger/preset/presets/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    rowData.preset.presets.push({
                        index: $item('index').text(),
                        name: $item('name').text(),
                        chl: {
                            value: $item('chl').attr('id'),
                            label: $item('chl').text(),
                        },
                    })
                })
                tableDataInit.push(cloneDeep(rowData))
            })
        }

        // 名称修改时的处理
        const nameFocus = (name: string) => {
            tempName.value = name
        }

        const nameBlur = (row: SensorEvent) => {
            const name = row.name
            if (!checkChlName(name)) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS'),
                    showCancelButton: false,
                })
                row.name = tempName.value
            } else {
                if (!name) {
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_PROMPT_NAME_EMPTY'),
                        showCancelButton: false,
                    })
                    row.name = tempName.value
                }
                tableData.value.forEach((item) => {
                    if (item.id != row.id && name == item.name) {
                        openMessageTipBox({
                            type: 'info',
                            title: Translate('IDCS_INFO_TIP'),
                            message: Translate('IDCS_NAME_SAME'),
                            showCancelButton: false,
                        })
                        row.name = tempName.value
                    }
                })
            }
        }

        // 回车键失去焦点
        const enterBlur = (event: { target: { blur: () => void } }) => {
            event.target.blur()
        }

        // 录像配置相关处理
        const recordDropdownOpen = () => {
            recordRef.value.handleOpen()
            pageData.value.recordIsShowAll = true
        }

        const recordConfirmAll = (e: any[]) => {
            if (e.length !== 0) {
                pageData.value.recordChosedListAll = cloneDeep(e)
                pageData.value.recordChosedIdsAll = e.map((item) => item.value)
                tableData.value.forEach((item) => {
                    if (!item.disabled) {
                        item.sysRec.switch = true
                        item.sysRec.chls = pageData.value.recordChosedListAll
                        item.recordList = pageData.value.recordChosedListAll.map((item) => item.value)
                    }
                })
            }
            pageData.value.recordChosedListAll = []
            pageData.value.recordChosedIdsAll = []
            pageData.value.recordIsShowAll = false
            recordRef.value.handleClose()
        }
        const recordCloseAll = () => {
            pageData.value.recordChosedListAll = []
            pageData.value.recordChosedIdsAll = []
            pageData.value.recordIsShowAll = false
            recordRef.value.handleClose()
        }
        // 打开录像dialog
        const setRecord = function (index: number) {
            pageData.value.triggerDialogIndex = index
            pageData.value.recordIsShow = true
        }
        const recordConfirm = (e: { value: string; label: string }[]) => {
            const index = pageData.value.triggerDialogIndex
            if (e.length !== 0) {
                tableData.value[index].sysRec.chls = cloneDeep(e)
                tableData.value[index].recordList = e.map((item) => item.value)
            } else {
                tableData.value[index].sysRec.chls = []
                tableData.value[index].recordList = []
                tableData.value[index].sysRec.switch = false
            }
            pageData.value.recordIsShow = false
        }
        const recordClose = () => {
            if (!tableData.value[pageData.value.triggerDialogIndex].sysRec.chls.length) {
                tableData.value[pageData.value.triggerDialogIndex].sysRec.switch = false
                tableData.value[pageData.value.triggerDialogIndex].recordList = []
                tableData.value[pageData.value.triggerDialogIndex].sysRec.chls = []
            }
            pageData.value.recordIsShow = false
        }

        // 抓图配置相关处理
        const snapDropdownOpen = () => {
            snapRef.value.handleOpen()
            pageData.value.snapIsShowAll = true
        }

        const snapConfirmAll = (e: any[]) => {
            if (e.length !== 0) {
                pageData.value.snapChosedListAll = cloneDeep(e)
                pageData.value.snapChosedIdsAll = e.map((item) => item.value)
                tableData.value.forEach((item) => {
                    if (!item.disabled) {
                        item.sysSnap.switch = true
                        item.sysSnap.chls = pageData.value.snapChosedListAll
                        item.snapList = e.map((item) => item.value)
                    }
                })
            }
            pageData.value.snapChosedListAll = []
            pageData.value.snapChosedIdsAll = []
            pageData.value.snapIsShowAll = false
            snapRef.value.handleClose()
        }
        const snapCloseAll = () => {
            pageData.value.snapChosedListAll = []
            pageData.value.snapChosedIdsAll = []
            pageData.value.snapIsShowAll = false
            snapRef.value.handleClose()
        }
        // 打开抓图dialog
        const setSnap = function (index: number) {
            pageData.value.triggerDialogIndex = index
            pageData.value.snapIsShow = true
        }
        const snapConfirm = (e: { value: string; label: string }[]) => {
            const index = pageData.value.triggerDialogIndex
            if (e.length !== 0) {
                tableData.value[index].sysSnap.chls = cloneDeep(e)
                tableData.value[index].snapList = e.map((item) => item.value)
            } else {
                tableData.value[index].sysSnap.chls = []
                tableData.value[index].snapList = []
                tableData.value[index].sysSnap.switch = false
            }
            pageData.value.snapIsShow = false
        }
        const snapClose = () => {
            if (!tableData.value[pageData.value.triggerDialogIndex].sysSnap.chls.length) {
                tableData.value[pageData.value.triggerDialogIndex].sysSnap.switch = false
                tableData.value[pageData.value.triggerDialogIndex].snapList = []
                tableData.value[pageData.value.triggerDialogIndex].sysSnap.chls = []
            }
            pageData.value.snapIsShow = false
        }

        // 报警输出相关处理
        const alarmOutDropdownOpen = () => {
            alarmOutRef.value.handleOpen()
            pageData.value.alarmOutIsShowAll = true
        }

        const alarmOutConfirmAll = (e: any[]) => {
            if (e.length !== 0) {
                pageData.value.alarmOutChosedListAll = cloneDeep(e)
                pageData.value.alarmOutChosedIdsAll = e.map((item) => item.value)
                tableData.value.forEach((item) => {
                    if (!item.disabled) {
                        item.alarmOut.switch = true
                        item.alarmOut.alarmOuts = pageData.value.alarmOutChosedListAll
                        item.alarmOutList = e.map((item) => item.value)
                    }
                })
            }
            pageData.value.alarmOutChosedListAll = []
            pageData.value.alarmOutChosedIdsAll = []
            pageData.value.alarmOutIsShowAll = false
            alarmOutRef.value.handleClose()
        }
        const alarmOutCloseAll = () => {
            pageData.value.alarmOutChosedListAll = []
            pageData.value.alarmOutChosedIdsAll = []
            pageData.value.alarmOutIsShowAll = false
            alarmOutRef.value.handleClose()
        }
        // 打开报警输出dialog
        const setAlarmOut = function (index: number) {
            pageData.value.triggerDialogIndex = index
            pageData.value.alarmOutIsShow = true
        }
        const alarmOutConfirm = (e: { value: string; label: string }[]) => {
            const index = pageData.value.triggerDialogIndex
            if (e.length !== 0) {
                tableData.value[index].alarmOut.alarmOuts = cloneDeep(e)
                tableData.value[index].alarmOutList = e.map((item) => item.value)
            } else {
                tableData.value[index].alarmOut.alarmOuts = []
                tableData.value[index].alarmOutList = []
                tableData.value[index].alarmOut.switch = false
            }
            pageData.value.alarmOutIsShow = false
        }
        const alarmOutClose = () => {
            if (!tableData.value[pageData.value.triggerDialogIndex].alarmOut.alarmOuts.length) {
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.switch = false
                tableData.value[pageData.value.triggerDialogIndex].alarmOutList = []
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.alarmOuts = []
            }
            pageData.value.alarmOutIsShow = false
        }

        // 预置点名称配置处理
        const openPresetPop = (row: SensorEvent) => {
            pageData.value.presetChlId = row.id
            pageData.value.presetLinkedList = row.preset.presets
            pageData.value.isPresetPopOpen = true
        }

        const handlePresetLinkedList = (id: string, linkedList: PresetItem[]) => {
            tableData.value.forEach((item) => {
                if (item.id == id) {
                    item.preset.presets = linkedList
                }
            })
        }

        const presetClose = (id: string) => {
            pageData.value.isPresetPopOpen = false
            tableData.value.forEach((item) => {
                if (item.id == id && item.preset.presets.length == 0) {
                    item.preset.switch = false
                }
            })
        }

        const presetCheckChange = (row: SensorEvent) => {
            if (row.preset.switch) {
                openPresetPop(row)
            }
        }

        const checkChange = (index: number, type: string) => {
            if (type == 'record' && tableData.value[index].sysRec.switch) {
                setRecord(index)
            } else if (type == 'snap' && tableData.value[index].sysSnap.switch) {
                setSnap(index)
            } else if (type == 'alarmOut' && tableData.value[index].alarmOut.switch) {
                setAlarmOut(index)
            }
        }

        const changeScheduleAll = (value: string) => {
            if (value == 'scheduleMgr') {
                pageData.value.scheduleManagePopOpen = true
            } else {
                tableData.value.forEach((item) => {
                    item.schedule.value = value
                    item.oldSchedule = value
                })
            }
        }

        const changeSchedule = (row: SensorEvent) => {
            if (row.schedule.value == 'scheduleMgr') {
                pageData.value.scheduleManagePopOpen = true
                row.schedule.value = row.oldSchedule
            } else {
                row.oldSchedule = row.schedule.value
            }
        }

        /**
         * @description: 改变所有项的值
         * @param {string} value 值
         * @param {string} field 字段名
         * @return {*}
         */
        const changeAllValue = (value: any, field: string) => {
            tableData.value.forEach((item) => {
                if (field == 'videoPopUp') {
                    item.popVideo.chl.id = value
                    if (value != '') item.popVideo.switch = 'true'
                } else {
                    ;(item as any)[field] = value
                }
            })
        }

        const getEditedRows = (table: SensorEvent[], tableInit: SensorEvent[]) => {
            const editedRows = [] as SensorEvent[]
            table.forEach((item, index) => {
                if (!isEqual(item, tableInit[index])) {
                    editedRows.push(item)
                }
            })
            return editedRows
        }

        const getSavaData = (row: SensorEvent) => {
            let sendXml = `
                <types>
                    <alarmInVoltage>
                        <enum>NO</enum>
                        <enum>NC</enum>
                    </alarmInVoltage>
                </types>
                <content id='${row.id}'>
                    <param>
                        <name><![CDATA[${row.name}]]></name>
                        <voltage type='alarmInVoltage'>${row.type}</voltage>
                        <switch>${row.switch}</switch>
                        <holdTime unit='s'>${row.holdTime}</holdTime>
                    </param>
                `
            //sysRec通道遍历
            sendXml += `
                    <trigger>
                        <sysRec>
                            <switch>${row.sysRec.switch}</switch>
                            <chls type='list'>
                `
            row.sysRec.chls.forEach((item) => {
                sendXml += `<item id='${item.value}'>
                    <![CDATA[${item.label}]]></item>
                `
            })
            //sysSnap通道遍历
            sendXml += `</chls>
                </sysRec>
                <sysSnap>
                    <switch>${row.sysSnap.switch}</switch>
                    <chls type='list'>
                `
            row.sysSnap.chls.forEach((item) => {
                sendXml += `<item id='${item.value}'>
                    <![CDATA[${item.label}]]></item>
                `
            })
            //alarmOut通道遍历
            sendXml += `</chls>
                </sysSnap>
                <alarmOut>
                    <switch>${row.alarmOut.switch}</switch>
                        <alarmOuts type='list'>
                `
            row.alarmOut.alarmOuts.forEach((item) => {
                sendXml += `<item id='${item.value}'>
                    <![CDATA[${item.label}]]></item>
                `
            })
            sendXml += `</alarmOuts>
                </alarmOut>
                    <preset>
                        <switch>${row.preset.switch}</switch>
                        <presets type='list'>
                `
            row.preset.presets.forEach((item) => {
                sendXml += `<item>
                    <index>${item.index}</index>
                        <name><![CDATA[${item.index}]]></name>
                        <chl id='${item.chl.value}'>
                        <![CDATA[${item.chl.label}]]></chl>
                    </item>
                `
            })
            sendXml += `</presets>
                </preset>
                <buzzerSwitch>${row.buzzerSwitch}</buzzerSwitch>
                <popVideo>
                    <switch>${row.popVideo.switch}</switch>
                    <chl id='${row.popVideo.chl.id}'></chl>
                </popVideo>
                <popMsgSwitch>${row.popMsgSwitch}</popMsgSwitch>
                <sysAudio id='${row.sysAudio}'></sysAudio>
                <triggerSchedule><switch>${row.schedule ? 'true' : 'flase'}</switch><schedule id='${row.schedule.value}'></schedule></triggerSchedule>
                <emailSwitch>${row.emailSwitch}</emailSwitch>
                <msgPushSwitch>${row.msgPushSwitch}</msgPushSwitch>
            </trigger>
            </content>
                `
            return sendXml
        }

        const setData = async () => {
            const editedRows = getEditedRows(tableData.value, tableDataInit)
            let count = 0
            openLoading(LoadingTarget.FullScreen)
            editedRows.forEach(async (item) => {
                const sendXml = getSavaData(item)
                const result = await editAlarmIn(sendXml)
                const $ = queryXml(result)
                const isSuccess = $('/response/status').text() === 'success'
                item.status = isSuccess ? 'success' : 'error'
                count++

                if (count >= editedRows.length) {
                    pageData.value.applyDisabled = false
                    // 更新表格初始对比值
                    tableDataInit = cloneDeep(tableData.value)
                }
            })
            closeLoading(LoadingTarget.FullScreen)
        }

        onMounted(async () => {
            // 相关请求，获取前置数据
            await getSystemCaps() // 系统配置
            await getAudioData() // 声音数据
            await getChlData('initCtrl') // 通道数据
            // await getChlData('record')  在类型上只判断是否为snap，record请求数据合并在initCtrl中处理
            await getChlData('snap')
            await getAlarmOutData() // 报警输出

            await getData()
        })

        watch(
            tableData,
            () => {
                if (pageData.value.initComplated) {
                    pageData.value.applyDisabled = false
                }
            },
            {
                deep: true,
            },
        )

        return {
            recordRef,
            snapRef,
            alarmOutRef,
            tableRowStatusToolTip,
            pageData,
            tableData,
            changePaginationSize,
            changePagination,
            // 名称修改
            nameFocus,
            nameBlur,
            enterBlur,
            checkChange,
            // 排程
            changeScheduleAll,
            changeSchedule,
            // 录像
            recordDropdownOpen,
            recordConfirmAll,
            recordCloseAll,
            setRecord,
            recordConfirm,
            recordClose,
            // 抓图
            snapDropdownOpen,
            snapConfirmAll,
            snapCloseAll,
            setSnap,
            snapConfirm,
            snapClose,
            // 报警输出
            alarmOutDropdownOpen,
            alarmOutConfirmAll,
            alarmOutCloseAll,
            setAlarmOut,
            alarmOutConfirm,
            alarmOutClose,
            // 预置点名称
            openPresetPop,
            handlePresetLinkedList,
            presetClose,
            presetCheckChange,
            // 表头改变属性
            changeAllValue,
            setData,
        }
    },
})
