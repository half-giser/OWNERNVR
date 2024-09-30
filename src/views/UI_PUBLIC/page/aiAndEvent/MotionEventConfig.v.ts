/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 18:13:56
 * @Description: 移动侦测
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-29 16:34:03
 */
import { cloneDeep } from 'lodash-es'
import { ArrowDown } from '@element-plus/icons-vue'
import { tableRowStatus, tableRowStatusToolTip } from '@/utils/const/other'
import BaseTransferPop from '@/components/BaseTransferPop.vue'
import BaseTransferDialog from '@/components/BaseTransferDialog.vue'
import BaseTableRowStatus from '@/components/BaseTableRowStatus.vue'
import { MotionEventConfig, type PresetItem } from '@/types/apiType/aiAndEvent'
import { errorCodeMap } from '@/utils/constants'
import SetPresetPop from './SetPresetPop.vue'
// import { DropdownInstance } from 'element-plus'
export default defineComponent({
    components: {
        ArrowDown,
        BaseTransferPop,
        BaseTransferDialog,
        SetPresetPop,
        BaseTableRowStatus,
    },
    setup() {
        const chosedList = ref<any[]>([])
        const { Translate } = useLangStore()
        const tableData = ref<MotionEventConfig[]>([])
        const recordRef = ref()
        const snapRef = ref()
        const alarmOutRef = ref()
        const presetRef = ref()

        // ;(snapRef.value as InstanceType<typeof ElDropdown>).handleOpen()
        // ;(alarmOutRef.value as InstanceType<typeof ElDropdown>).handleOpen()
        // ;(recordRef.value as InstanceType<typeof ElDropdown>).handleOpen()
        const { LoadingTarget, openLoading, closeLoading } = useLoading()
        const scheduleList = buildScheduleList()
        const systemCaps = useCababilityStore()
        const userSession = useUserSessionStore()
        const router = useRouter()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const pageData = ref({
            initComplated: false,
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            pageDataCountItems: [10, 20, 30],
            enableList: [
                { value: 'true', label: Translate('IDCS_ON') },
                { value: 'false', label: Translate('IDCS_OFF') },
            ],
            defaultAudioId: '{00000000-0000-0000-0000-000000000000}',
            supportAudio: false,
            scheduleList: [] as [] as SelectOption<string, string>[],
            audioList: [] as { value: string; label: string }[],
            // 打开穿梭框时选择行的索引
            triggerDialogIndex: 0,

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
            alarmOutList: [] as { value: string; label: string; device: { value: string; label: string } }[],
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

            isPresetPopOpen: false,
            presetChlId: '',
            presetLinkedList: [] as PresetItem[],

            // disable
            applyDisable: true,
            editRows: [] as MotionEventConfig[],
        })
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
            pageData.value.scheduleList.forEach((item) => {
                if (item.value == '') {
                    item.value = ' '
                }
            })
        }
        const getAudioList = async () => {
            pageData.value.supportAudio = systemCaps.supportAlarmAudioConfig
            if (pageData.value.supportAudio == true) {
                queryAlarmAudioCfg().then(async (resb) => {
                    pageData.value.audioList = []
                    const res = queryXml(resb)
                    if (res('status').text() == 'success') {
                        res('//content/audioList/item').forEach((item: any) => {
                            const $item = queryXml(item.element)
                            pageData.value.audioList.push({
                                value: item.attr('id'),
                                label: $item('name').text(),
                            })
                        })
                        pageData.value.audioList.push({ value: pageData.value.defaultAudioId, label: '<' + Translate('IDCS_NULL') + '>' })
                    }
                })
            }
        }
        const getRecordList = async () => {
            getChlList({
                nodeType: 'chls',
                isSupportSnap: false,
            }).then(async (resb) => {
                const res = queryXml(resb)
                if (res('status').text() == 'success') {
                    res('//content/item').forEach((item: any) => {
                        const $item = queryXml(item.element)
                        pageData.value.recordList.push({
                            value: item.attr('id'),
                            label: $item('name').text(),
                        })
                    })
                }
            })
        }
        const getSnapList = async () => {
            getChlList({
                nodeType: 'chls',
                isSupportSnap: true,
            }).then(async (resb) => {
                const res = queryXml(resb)
                if (res('status').text() == 'success') {
                    res('//content/item').forEach((item: any) => {
                        const $item = queryXml(item.element)
                        pageData.value.snapList.push({
                            value: item.attr('id'),
                            label: $item('name').text(),
                        })
                    })
                }
            })
        }
        const getAlarmOutList = async () => {
            getChlList({
                requireField: ['device'],
                nodeType: 'alarmOuts',
            }).then(async (resb) => {
                const res = queryXml(resb)
                if (res('status').text() == 'success') {
                    res('//content/item').forEach((item: any) => {
                        const $item = queryXml(item.element)
                        let name = $item('name').text()
                        if ($item('devDesc').text()) {
                            name = $item('devDesc').text() + '-' + name
                        }
                        pageData.value.alarmOutList.push({
                            value: item.attr('id'),
                            label: name,
                            device: {
                                value: $item('device').attr('id'),
                                label: $item('device').text(),
                            },
                        })
                    })
                }
            })
        }
        const buildTableData = function () {
            pageData.value.initComplated = false
            tableData.value.length = 0
            getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                isSupportMotion: true,
            }).then(async (resb) => {
                const $chl = queryXml(resb)
                pageData.value.totalCount = Number($chl('//content').attr('total'))
                $chl('//content/item').forEach(async (item) => {
                    const $ele = queryXml(item.element)
                    const row = new MotionEventConfig()
                    row.id = item.attr('id')!
                    row.addType = $ele('addType').text()
                    row.chlType = $ele('chlType').text()
                    row.name = $ele('name').text()
                    row.poeIndex = $ele('poeIndex').text()
                    row.productModel = { value: $ele('productModel').text(), factoryName: $ele('productModel').attr('factoryName') }
                    row.status = tableRowStatus.loading
                    tableData.value.push(row)
                })
                for (let i = 0; i < tableData.value.length; i++) {
                    const row = tableData.value[i]
                    const sendXml = rawXml`<condition>
                                        <chlId>${row.id}</chlId>
                                    </condition>
                                    <requireField>
                                        <trigger/>
                                    </requireField>`
                    const motion = await queryMotion(sendXml)
                    const res = queryXml(motion)
                    row.status = ''

                    if (res('status').text() == 'success') {
                        row.rowDisable = false
                        row.schedule = {
                            value: res('//content/chl/trigger/triggerSchedule/schedule').attr('id') == '' ? ' ' : res('//content/chl/trigger/triggerSchedule/schedule').attr('id'),
                            label: res('//content/chl/trigger/triggerSchedule/schedule').text(),
                        }
                        row.oldSchedule = row.schedule
                        row.record = {
                            switch: res('//content/chl/trigger/sysRec/switch').text() == 'true' ? true : false,
                            chls: res('//content/chl/trigger/sysRec/chls/item').map((item: any) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        // 获取record中chls的value列表
                        row.recordList = row.record.chls.map((item) => item.value)
                        row.sysAudio = res('//content/chl/trigger/sysAudio').attr('id') || pageData.value.defaultAudioId
                        row.snap = {
                            switch: res('//content/chl/trigger/sysSnap/switch').text() == 'true' ? true : false,
                            chls: res('//content/chl/trigger/sysSnap/chls/item').map((item: any) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        // 获取snap中chls的value列表
                        row.snapList = row.snap.chls.map((item) => item.value)
                        row.alarmOut = {
                            switch: res('//content/chl/trigger/alarmOut/switch').text() == 'true' ? true : false,
                            chls: res('//content/chl/trigger/alarmOut/alarmOuts/item').map((item: any) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        row.alarmOutList = row.alarmOut.chls.map((item) => item.value)
                        row.beeper = res('//content/chl/trigger/buzzerSwitch').text()
                        row.email = res('//content/chl/trigger/emailSwitch').text()
                        row.msgPush = res('//content/chl/trigger/msgPushSwitch').text()
                        row.videoPopup = res('//content/chl/trigger/popVideoSwitch').text()
                        row.preset.switch = res('//content/chl/trigger/preset/switch').text() == 'true' ? true : false
                        res('//content/chl/trigger/preset/presets/item').forEach((item: any) => {
                            const $item = queryXml(item.element)
                            row.preset.presets.push({
                                index: $item('index').text(),
                                name: $item('name').text(),
                                chl: {
                                    value: $item('chl').attr('id'),
                                    label: $item('chl').text(),
                                },
                            })
                        })
                        // 设置的声音文件被删除时，显示为none
                        const AudioData = pageData.value.audioList.filter((element: { value: string; label: string }) => {
                            return element.value === row.sysAudio
                        })
                        if (AudioData.length === 0) {
                            row.sysAudio = pageData.value.defaultAudioId
                        }
                    } else {
                        row.rowDisable = true
                    }
                }
            })
        }
        const changePagination = () => {
            buildTableData()
        }
        const changePaginationSize = () => {
            const totalPage = Math.ceil(pageData.value.totalCount / pageData.value.pageSize)
            if (pageData.value.pageIndex > totalPage) {
                pageData.value.pageIndex = totalPage
            }
            buildTableData()
        }
        const handleScheduleChangeAll = function (schedule: { value: string; label: string }) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    item.schedule = schedule
                    addEditRow(item)
                }
            })
        }

        // 下列为record穿梭框相关
        const recordDropdownOpen = () => {
            recordRef.value.handleOpen()
            pageData.value.recordIsShowAll = true
        }
        const recordConfirmAll = (e: any[]) => {
            if (e.length !== 0) {
                pageData.value.recordChosedListAll = cloneDeep(e)
                pageData.value.recordChosedIdsAll = e.map((item) => item.value)
                tableData.value.forEach((item) => {
                    if (!item.rowDisable) {
                        addEditRow(item)
                        item.record.switch = true
                        item.record.chls = pageData.value.recordChosedListAll
                        item.recordList = pageData.value.recordChosedListAll.map((item) => item.value)
                    }
                })
            } else {
                tableData.value.forEach((item) => {
                    if (!item.rowDisable) {
                        addEditRow(item)
                        item.record.switch = false
                        item.record.chls = []
                        item.recordList = []
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
        const setRecord = function (index: number) {
            pageData.value.recordIsShow = true
            pageData.value.triggerDialogIndex = index
        }
        const recordConfirm = (e: { value: string; label: string }[]) => {
            addEditRow(tableData.value[pageData.value.triggerDialogIndex])
            if (e.length !== 0) {
                tableData.value[pageData.value.triggerDialogIndex].record.chls = cloneDeep(e)
                const chls = tableData.value[pageData.value.triggerDialogIndex].record.chls
                tableData.value[pageData.value.triggerDialogIndex].recordList = chls.map((item) => item.value)
            } else {
                tableData.value[pageData.value.triggerDialogIndex].record.chls = []
                tableData.value[pageData.value.triggerDialogIndex].recordList = []
                tableData.value[pageData.value.triggerDialogIndex].record.switch = false
            }
            pageData.value.recordIsShow = false
        }
        const recordClose = () => {
            if (!tableData.value[pageData.value.triggerDialogIndex].record.chls.length) {
                tableData.value[pageData.value.triggerDialogIndex].record.switch = false
                tableData.value[pageData.value.triggerDialogIndex].recordList = []
                tableData.value[pageData.value.triggerDialogIndex].record.chls = []
            }
            pageData.value.recordIsShow = false
        }

        // 下列为snap穿梭框相关
        const snapDropdownOpen = () => {
            snapRef.value.handleOpen()
            pageData.value.snapIsShowAll = true
        }
        const snapConfirmAll = (e: any[]) => {
            if (e.length !== 0) {
                pageData.value.snapChosedListAll = cloneDeep(e)
                pageData.value.snapChosedIdsAll = e.map((item) => item.value)
                tableData.value.forEach((item) => {
                    if (!item.rowDisable) {
                        addEditRow(item)
                        item.snap.switch = true
                        item.snap.chls = pageData.value.snapChosedListAll
                        item.snapList = pageData.value.snapChosedListAll.map((item) => item.value)
                    }
                })
            } else {
                tableData.value.forEach((item) => {
                    if (!item.rowDisable) {
                        addEditRow(item)
                        item.snap.switch = false
                        item.snap.chls = []
                        item.snapList = []
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
        const setSnap = function (index: number) {
            pageData.value.snapIsShow = true
            pageData.value.triggerDialogIndex = index
        }
        const snapConfirm = (e: { value: string; label: string }[]) => {
            addEditRow(tableData.value[pageData.value.triggerDialogIndex])
            if (e.length !== 0) {
                tableData.value[pageData.value.triggerDialogIndex].snap.chls = cloneDeep(e)
                const chls = tableData.value[pageData.value.triggerDialogIndex].snap.chls
                tableData.value[pageData.value.triggerDialogIndex].snapList = chls.map((item) => item.value)
            } else {
                tableData.value[pageData.value.triggerDialogIndex].snap.chls = []
                tableData.value[pageData.value.triggerDialogIndex].snapList = []
                tableData.value[pageData.value.triggerDialogIndex].snap.switch = false
            }
            pageData.value.snapIsShow = false
        }
        const snapClose = () => {
            if (!tableData.value[pageData.value.triggerDialogIndex].snap.chls.length) {
                tableData.value[pageData.value.triggerDialogIndex].snap.switch = false
                tableData.value[pageData.value.triggerDialogIndex].snapList = []
                tableData.value[pageData.value.triggerDialogIndex].snap.chls = []
            }
            pageData.value.snapIsShow = false
        }

        // 下列为alarmOut穿梭框相关
        const alarmOutDropdownOpen = () => {
            alarmOutRef.value.handleOpen()
            pageData.value.alarmOutIsShowAll = true
        }
        const alarmOutConfirmAll = (e: any[]) => {
            if (e.length !== 0) {
                pageData.value.alarmOutChosedListAll = cloneDeep(e)
                pageData.value.alarmOutChosedIdsAll = e.map((item) => item.value)
                tableData.value.forEach((item) => {
                    if (!item.rowDisable) {
                        addEditRow(item)
                        item.alarmOut.switch = true
                        item.alarmOut.chls = pageData.value.alarmOutChosedListAll
                        item.alarmOutList = pageData.value.alarmOutChosedListAll.map((item) => item.value)
                    }
                })
            } else {
                tableData.value.forEach((item) => {
                    if (!item.rowDisable) {
                        addEditRow(item)
                        item.alarmOut.switch = false
                        item.alarmOut.chls = []
                        item.alarmOutList = []
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
        const setAlarmOut = function (index: number) {
            pageData.value.alarmOutIsShow = true
            pageData.value.triggerDialogIndex = index
        }
        const alarmOutConfirm = (e: { value: string; label: string }[]) => {
            addEditRow(tableData.value[pageData.value.triggerDialogIndex])
            if (e.length !== 0) {
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.chls = cloneDeep(e)
                const chls = tableData.value[pageData.value.triggerDialogIndex].alarmOut.chls
                tableData.value[pageData.value.triggerDialogIndex].alarmOutList = chls.map((item) => item.value)
            } else {
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.chls = []
                tableData.value[pageData.value.triggerDialogIndex].alarmOutList = []
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.switch = false
            }
            pageData.value.alarmOutIsShow = false
        }
        const alarmOutClose = () => {
            if (!tableData.value[pageData.value.triggerDialogIndex].alarmOut.chls.length) {
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.switch = false
                tableData.value[pageData.value.triggerDialogIndex].alarmOutList = []
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.chls = []
            }
            pageData.value.alarmOutIsShow = false
        }

        // presetPop相关
        const openPresetPop = (row: MotionEventConfig) => {
            pageData.value.presetChlId = row.id
            pageData.value.presetLinkedList = row.preset.presets
            pageData.value.isPresetPopOpen = true
        }

        const handlePresetLinkedList = (id: string, linkedList: PresetItem[]) => {
            tableData.value.forEach((item) => {
                if (item.id == id) {
                    item.preset.presets = linkedList
                    addEditRow(item)
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
        // 四个按钮checkBox切换
        const recordSwitchChange = function (row: MotionEventConfig) {
            addEditRow(row)
            if (row.record.switch === false) {
                row.record.chls = []
                row.recordList = []
            }
        }
        const snapSwitchChange = function (row: MotionEventConfig) {
            addEditRow(row)
            if (row.snap.switch === false) {
                row.snap.chls = []
                row.snapList = []
            }
        }
        const alarmOutSwitchChange = function (row: MotionEventConfig) {
            addEditRow(row)
            if (row.alarmOut.switch === false) {
                row.alarmOut.chls = []
                row.alarmOutList = []
            }
        }
        const presetSwitchChange = function (row: MotionEventConfig) {
            addEditRow(row)
            if (row.preset.switch === false) {
                row.preset.presets = []
            }
        }

        // 系统音频
        const handleSysAudioChangeAll = function (sysAudio: string) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.sysAudio = sysAudio
                }
            })
        }
        // 消息推送
        const handleMsgPushChangeAll = function (msgPush: string) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.msgPush = msgPush
                }
            })
        }
        // 蜂鸣器
        const handleBeeperChangeAll = function (beeper: string) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.beeper = beeper
                }
            })
        }
        // 视频弹出
        const handleVideoPopupChangeAll = function (videoPopup: string) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.videoPopup = videoPopup
                }
            })
        }
        // 邮件
        const handleEmailChangeAll = function (email: string) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.email = email
                }
            })
        }

        const handleMotionSetting = function () {
            // 跳转到移动侦测设置页面
            // router.push('/config/channel/settings/motion')
            if (userSession.hasAuth('RemoteChlMgr')) {
                router.push('/config/channel/settings/motion')
            } else {
                openMessageTipBox({
                    type: 'question',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_NO_AUTH'),
                })
            }
        }
        const addEditRow = function (row: MotionEventConfig) {
            // 若该行不存在于编辑行中，则添加
            const isExist = pageData.value.editRows.some((item) => item.id === row.id)
            if (!isExist) {
                pageData.value.editRows.push(row)
            }
            pageData.value.applyDisable = false
        }
        const getSavaData = function (rowData: MotionEventConfig) {
            const recordSwitch = rowData.record.switch
            const snapSwitch = rowData.snap.switch
            const alarmOutSwitch = rowData.alarmOut.switch
            const presetSwitch = rowData.preset.switch
            let sendXml = rawXml`<content>
                                <chl id="${rowData.id}">
                                <trigger>`
            sendXml += rawXml`<sysRec>
                            <switch>${recordSwitch.toString()}</switch>
                            <chls type="list">`
            if (!recordSwitch) {
                rowData.record = { switch: false, chls: [] }
            }
            const recordChls = rowData.record.chls
            recordChls.forEach((item: any) => {
                sendXml += rawXml` <item id="${item.value}">
                                <![CDATA[${item.label}]]>
                            </item>`
            })
            sendXml += rawXml`</chls>
                    </sysRec>`
            sendXml += rawXml`<alarmOut>
                            <switch>${alarmOutSwitch.toString()}</switch>
                            <alarmOuts type="list">`
            if (!alarmOutSwitch) {
                rowData.alarmOut = { switch: false, chls: [] }
            }
            const alarmOutChls = rowData.alarmOut.chls
            alarmOutChls.forEach((item: any) => {
                sendXml += rawXml` <item id="${item.value}">
                                <![CDATA[${item.label}]]>
                            </item>`
            })
            sendXml += rawXml`</alarmOuts>
                    </alarmOut>`
            sendXml += rawXml`<preset>
                            <switch>${presetSwitch.toString()}</switch>
                            <presets type="list">`
            if (!presetSwitch) {
                rowData.preset = { switch: false, presets: [] }
            }
            let presets = rowData.preset.presets
            if (!presets) {
                presets = []
            }
            if (!(presets instanceof Array)) {
                presets = [presets]
            }
            presets.forEach((item: any) => {
                if (item.index) {
                    sendXml += rawXml`
                    <item>
                        <index>${item.index}</index>
                        <name><![CDATA[${item.name}]]></name>
                        <chl id="${item.chl.value}"><![CDATA[${item.chl.label}]]></chl>
                    </item>`
                }
            })
            sendXml += rawXml`</presets>
                    </preset>`
            sendXml += rawXml`<sysSnap>
                            <switch>${snapSwitch.toString()}</switch>
                            <chls type="list">`
            if (!snapSwitch) {
                rowData.snap = { switch: false, chls: [] }
            }
            const snapChls = rowData.snap.chls
            snapChls.forEach((item: any) => {
                sendXml += rawXml` <item id="${item.value}">
                                <![CDATA[${item.label}]]>
                            </item>`
            })
            sendXml += rawXml`</chls>
                    </sysSnap>`
            const schedule = rowData.schedule.value == ' ' ? true : false
            sendXml += rawXml`
                        <buzzerSwitch>${rowData.beeper}</buzzerSwitch>
                        <msgPushSwitch>${rowData.msgPush}</msgPushSwitch>
                        <sysAudio id='${rowData.sysAudio}'></sysAudio>
                        <triggerSchedule>
                            <switch>${schedule.toString()}</switch>
                            <schedule id="${rowData.schedule.value == ' ' ? '' : rowData.schedule.value}"></schedule>
                        </triggerSchedule>
                        <popVideoSwitch>${rowData.videoPopup}</popVideoSwitch>
                        <emailSwitch>${rowData.email}</emailSwitch>
                        </trigger>
                    </chl>
                </content>`
            return sendXml
        }
        const setData = function () {
            openLoading(LoadingTarget.FullScreen)
            pageData.value.editRows.forEach((item: MotionEventConfig) => {
                const sendXml = getSavaData(item)
                editMotion(sendXml).then((resb) => {
                    const res = queryXml(resb)
                    if (res('status').text() == 'success') {
                        item.status = 'success'
                    } else {
                        item.status = 'error'
                        const errorCode = Number(res('errorCode').text())
                        if (errorCode === errorCodeMap.noConfigData) {
                            item.status = 'success'
                        } else {
                            item.status = 'error'
                        }
                    }
                    // buildTableData()
                })
            })
            closeLoading(LoadingTarget.FullScreen)
            pageData.value.editRows = []
            pageData.value.applyDisable = true
        }

        onMounted(async () => {
            await getScheduleList()
            await getAudioList()
            await getRecordList()
            await getSnapList()
            await getAlarmOutList()
            buildTableData()
        })
        return {
            changePagination,
            changePaginationSize,
            Translate,
            scheduleList,
            tableRowStatus,
            tableRowStatusToolTip,
            chosedList,
            pageData,
            tableData,
            openMessageTipBox,
            recordRef,
            snapRef,
            alarmOutRef,
            presetRef,
            handleScheduleChangeAll,
            recordDropdownOpen,
            recordConfirmAll,
            recordCloseAll,
            setRecord,
            recordConfirm,
            recordClose,
            snapDropdownOpen,
            snapConfirmAll,
            snapCloseAll,
            setSnap,
            snapConfirm,
            snapClose,
            alarmOutDropdownOpen,
            alarmOutConfirmAll,
            alarmOutCloseAll,
            setAlarmOut,
            alarmOutConfirm,
            alarmOutClose,
            openPresetPop,
            handlePresetLinkedList,
            presetClose,
            recordSwitchChange,
            snapSwitchChange,
            alarmOutSwitchChange,
            presetSwitchChange,
            handleSysAudioChangeAll,
            handleMsgPushChangeAll,
            handleBeeperChangeAll,
            handleVideoPopupChangeAll,
            handleEmailChangeAll,
            handleMotionSetting,
            setData,
            addEditRow,
            BaseTransferPop,
            BaseTransferDialog,
            SetPresetPop,
            BaseTableRowStatus,
        }
    },
})
