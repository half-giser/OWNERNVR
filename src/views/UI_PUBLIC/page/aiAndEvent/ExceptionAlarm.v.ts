/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-21 15:34:24
 * @Description: 异常报警
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-30 15:07:35
 */
import { cloneDeep } from 'lodash-es'
import { ArrowDown } from '@element-plus/icons-vue'
import BaseTransferPop from '@/components/BaseTransferPop.vue'
import BaseTransferDialog from '@/components/BaseTransferDialog.vue'
import { ExceptionAlarmRow } from '@/types/apiType/aiAndEvent'
import SetPresetPop from './SetPresetPop.vue'
// import { APP_TYPE } from '@/utils/constants'
export default defineComponent({
    components: {
        ArrowDown,
        BaseTransferPop,
        BaseTransferDialog,
        SetPresetPop,
    },
    setup() {
        const chosedList = ref<any[]>([])
        const { Translate } = useLangStore()
        const tableData = ref<ExceptionAlarmRow[]>([])
        const alarmOutRef = ref()
        const { LoadingTarget, openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const pageData = ref({
            enableList: [
                { value: 'true', label: Translate('IDCS_ON') },
                { value: 'false', label: Translate('IDCS_OFF') },
            ],
            eventTypeMapping: {
                ipConflict: 'IDCS_IP_CONFLICT',
                diskRWError: 'IDCS_DISK_IO_ERROR',
                diskFull: 'IDCS_DISK_FULL',
                illegalAccess: 'IDCS_UNLAWFUL_ACCESS',
                networkBreak: 'IDCS_NET_DISCONNECT',
                noDisk: 'IDCS_NO_DISK',
                signalShelter: 'IDCS_SIGNAL_SHELTER',
                hddPullOut: 'IDCS_HDD_PULL_OUT',
                raidException: 'IDCS_RAID_EXCEPTION',
                alarmServerOffline: 'IDCS_ALARM_SERVER_OFFLINE',
                diskFailure: 'IDCS_DISK_FAILURE',
            },
            defaultAudioId: '{00000000-0000-0000-0000-000000000000}',
            supportAudio: false,
            audioList: [] as { value: string; label: string }[],
            // 打开穿梭框时选择行的索引
            triggerDialogIndex: 0,

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

            // disable
            applyDisable: true,
        })
        const getAudioList = async () => {
            pageData.value.supportAudio = systemCaps.supportAlarmAudioConfig
            // pageData.value.supportAudio = true
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
                        if ($item('devDesc').text().length) {
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
            tableData.value.length = 0
            openLoading(LoadingTarget.FullScreen)

            queryAbnormalTrigger().then((resb) => {
                // TODO p2p
                // if (APP_TYPE == 'P2P') {
                //     res = res[0]
                // }
                const res = queryXml(resb)
                if (res('status').text() == 'success') {
                    tableData.value = []
                    res('//content/item').forEach((item: any) => {
                        const row = new ExceptionAlarmRow()
                        row.rowDisable = false
                        const $item = queryXml(item.element)
                        const abnormalType = $item('abnormalType').text()
                        if (abnormalType == 'RAIDSubHealth' || abnormalType == 'RAIDUnavaiable' || abnormalType == 'signalShelter') {
                            return
                        }
                        if (abnormalType == 'raidException' && !systemCaps.supportRaid) {
                            return
                        }
                        if (abnormalType == 'alarmServerOffline' && !systemCaps.supportAlarmServerConfig) {
                            return
                        }
                        row.eventType = $item('abnormalType').text()
                        row.sysAudio = $item('sysAudio').attr('id') || pageData.value.defaultAudioId
                        // 设置的声音文件被删除时，显示为none
                        const AudioData = pageData.value.audioList.filter((element: { value: string; label: string }) => {
                            return element.value === row.sysAudio
                        })
                        if (AudioData.length === 0) {
                            row.sysAudio = pageData.value.defaultAudioId
                        }
                        row.msgPush = $item('msgPushSwitch').text()
                        row.alarmOut.switch = $item('triggerAlarmOut/switch').text() == 'true' ? true : false
                        $item('triggerAlarmOut/alarmOuts/item').forEach((item: any) => {
                            row.alarmOut.alarmOuts.push({
                                value: item.attr('id'),
                                label: item.text(),
                            })
                        })
                        row.alarmOutList = row.alarmOut.alarmOuts.map((item) => item.value)
                        row.beeper = $item('buzzerSwitch').text()
                        if (row.eventType != 'networkBreak' && row.eventType != 'ipConflict') {
                            row.email = $item('emailSwitch').text()
                            row.emailDisable = false
                        }
                        row.msgBoxPopup = $item('popMsgSwitch').text()
                        tableData.value.push(row)
                    })
                }
            })
            closeLoading(LoadingTarget.FullScreen)
        }

        const formatEventType = function (eventType: string) {
            return Translate(pageData.value.eventTypeMapping[eventType as keyof typeof pageData.value.eventTypeMapping])
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
                        addEditRow()
                        item.alarmOut.alarmOuts = []
                        item.alarmOutList = []
                        item.alarmOut.switch = true
                        item.alarmOut.alarmOuts = pageData.value.alarmOutChosedListAll
                        item.alarmOutList = pageData.value.alarmOutChosedListAll.map((item) => item.value)
                    }
                })
            } else {
                tableData.value.forEach((item) => {
                    if (!item.rowDisable) {
                        addEditRow()
                        item.alarmOut.switch = false
                        item.alarmOut.alarmOuts = []
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
            addEditRow()
            if (e.length != 0) {
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.alarmOuts = cloneDeep(e)
                const chls = tableData.value[pageData.value.triggerDialogIndex].alarmOut.alarmOuts
                tableData.value[pageData.value.triggerDialogIndex].alarmOutList = chls.map((item) => item.value)
            } else {
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.alarmOuts = []
                tableData.value[pageData.value.triggerDialogIndex].alarmOutList = []
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.switch = false
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

        const alarmOutSwitchChange = function (row: ExceptionAlarmRow) {
            addEditRow()
            if (row.alarmOut.switch === false) {
                row.alarmOut.alarmOuts = []
                row.alarmOutList = []
            }
        }
        // 系统音频
        const handleSysAudioChangeAll = function (sysAudio: string) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow()
                    item.sysAudio = sysAudio
                }
            })
        }
        // 消息推送
        const handleMsgPushChangeAll = function (msgPush: string) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow()
                    item.msgPush = msgPush
                }
            })
        }
        // 蜂鸣器
        const handleBeeperChangeAll = function (beeper: string) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow()
                    item.beeper = beeper
                }
            })
        }
        // 消息框弹出
        const handleMsgBoxPopupChangeAll = function (msgBoxPopup: string) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow()
                    item.msgBoxPopup = msgBoxPopup
                }
            })
        }
        // 邮件
        const handleEmailChangeAll = function (email: string) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable && !item.emailDisable) {
                    addEditRow()
                    item.email = email
                }
            })
        }

        const addEditRow = function () {
            pageData.value.applyDisable = false
        }

        const getSavaData = function () {
            let sendXml = rawXml`
                <types>
                    <abnormalType>
                    <enum>ipConflict</enum>
                    <enum>diskRWError</enum>
                    <enum>diskFull</enum>
                    <enum>illegalAccess</enum>
                    <enum>networkBreak</enum>
                    <enum>noDisk</enum>
                    <enum>raidException</enum>
                    </abnormalType>
                </types>
                <content type="list">
                    <itemType>
                            <abnormalType type="abnormalType"/>
                            <triggerAlarmOut>
                                <alarmOuts type="list"/>
                            </triggerAlarmOut>
                    </itemType>
                `
            tableData.value.forEach((item) => {
                const alarmOutSwitch = item.alarmOut.switch
                sendXml += rawXml`
                            <item>
                                <abnormalType>${item['eventType']}</abnormalType>
                                <triggerAlarmOut>
                                    <switch>${item['alarmOut']['switch'].toString()}</switch>
                                    <alarmOuts>
                        `
                if (!alarmOutSwitch) {
                    item.alarmOut = { switch: false, alarmOuts: [] }
                }
                let alarmOuts = item.alarmOut.alarmOuts
                if (!alarmOuts) {
                    alarmOuts = []
                }
                if (!(alarmOuts instanceof Array)) {
                    alarmOuts = [alarmOuts]
                }
                alarmOuts.forEach((item: any) => {
                    sendXml += rawXml` <item id="${item.value}">
                                <![CDATA[${item.label}]]>
                            </item>`
                })
                sendXml += rawXml`</alarmOuts>
                    </triggerAlarmOut>`
                sendXml += rawXml`
                        <msgPushSwitch>${item.msgPush}</msgPushSwitch>
                        <buzzerSwitch>${item.beeper}</buzzerSwitch>
                        <popMsgSwitch>${item.msgBoxPopup}</popMsgSwitch>
                        <emailSwitch>${item.email}</emailSwitch>
                        <sysAudio id='${item.sysAudio}'></sysAudio>
                    </item>`
            })
            sendXml += rawXml`</content>`
            return sendXml
        }
        const setData = function () {
            openLoading(LoadingTarget.FullScreen)
            const sendXml = getSavaData()
            editAbnormalTrigger(sendXml).then((resb) => {
                const res = queryXml(resb)
                if (res('status').text() == 'success') {
                    openMessageTipBox({
                        type: 'success',
                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                    })
                } else {
                    openMessageTipBox({
                        type: 'error',
                        message: Translate('IDCS_SAVE_DATA_FAIL'),
                    })
                }
            })
            closeLoading(LoadingTarget.FullScreen)
            pageData.value.applyDisable = true
        }

        onMounted(async () => {
            await getAudioList()
            await getAlarmOutList()
            buildTableData()
        })
        return {
            Translate,
            chosedList,
            pageData,
            tableData,
            openMessageTipBox,
            alarmOutRef,
            formatEventType,
            alarmOutDropdownOpen,
            alarmOutConfirmAll,
            alarmOutCloseAll,
            setAlarmOut,
            alarmOutConfirm,
            alarmOutClose,
            alarmOutSwitchChange,
            handleSysAudioChangeAll,
            handleMsgPushChangeAll,
            handleBeeperChangeAll,
            handleMsgBoxPopupChangeAll,
            handleEmailChangeAll,
            setData,
            addEditRow,
        }
    },
})
