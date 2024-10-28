/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-21 15:34:24
 * @Description: 异常报警
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-28 10:05:53
 */
import { cloneDeep } from 'lodash-es'
import { ExceptionAlarmRow } from '@/types/apiType/aiAndEvent'
import SetPresetPop from './SetPresetPop.vue'
export default defineComponent({
    components: {
        SetPresetPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const tableData = ref<ExceptionAlarmRow[]>([])
        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const pageData = ref({
            enableList: getSwitchOptions(),
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
            supportAudio: false,
            audioList: [] as SelectOption<string, string>[],
            // 打开穿梭框时选择行的索引
            triggerDialogIndex: 0,

            // alarmOut穿梭框数据源
            alarmOutList: [] as SelectOption<string, string>[],
            // 表头选中id
            alarmOutChosedIdsAll: [] as string[],
            // 表头选中的数据
            alarmOutChosedListAll: [] as SelectOption<string, string>[],
            alarmOutIsShow: false,
            alarmOutType: 'alarmOut',

            // disable
            applyDisable: true,
            alarmOutPopoverVisible: false,
        })

        const getAudioList = async () => {
            pageData.value.supportAudio = systemCaps.supportAlarmAudioConfig
            if (pageData.value.supportAudio) {
                pageData.value.audioList = await buildAudioList()
            }
        }

        const getAlarmOutList = async () => {
            pageData.value.alarmOutList = await buildAlarmOutChlList()
        }

        const buildTableData = () => {
            tableData.value.length = 0
            openLoading()

            queryAbnormalTrigger().then((resb) => {
                const res = queryXml(resb)
                if (res('status').text() == 'success') {
                    tableData.value = []
                    res('//content/item').forEach((item) => {
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
                        row.sysAudio = $item('sysAudio').attr('id') || DEFAULT_EMPTY_ID
                        // 设置的声音文件被删除时，显示为none
                        const AudioData = pageData.value.audioList.filter((element: { value: string; label: string }) => {
                            return element.value === row.sysAudio
                        })
                        if (AudioData.length === 0) {
                            row.sysAudio = DEFAULT_EMPTY_ID
                        }
                        row.msgPush = $item('msgPushSwitch').text()
                        row.alarmOut.switch = $item('triggerAlarmOut/switch').text() == 'true' ? true : false
                        $item('triggerAlarmOut/alarmOuts/item').forEach((item) => {
                            row.alarmOut.alarmOuts.push({
                                value: item.attr('id')!,
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
            closeLoading()
        }

        const formatEventType = (eventType: string) => {
            return Translate(pageData.value.eventTypeMapping[eventType as keyof typeof pageData.value.eventTypeMapping])
        }

        // 下列为alarmOut穿梭框相关
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
            pageData.value.alarmOutPopoverVisible = false
        }

        const alarmOutCloseAll = () => {
            pageData.value.alarmOutChosedListAll = []
            pageData.value.alarmOutChosedIdsAll = []
            pageData.value.alarmOutPopoverVisible = false
        }

        const setAlarmOut = (index: number) => {
            pageData.value.triggerDialogIndex = index
            pageData.value.alarmOutIsShow = true
        }

        const alarmOutConfirm = (e: SelectOption<string, string>[]) => {
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

        const alarmOutSwitchChange = (row: ExceptionAlarmRow) => {
            addEditRow()
            if (row.alarmOut.switch === false) {
                row.alarmOut.alarmOuts = []
                row.alarmOutList = []
            } else {
                setAlarmOut(tableData.value.indexOf(row))
            }
        }

        // 系统音频
        const handleSysAudioChangeAll = (sysAudio: string) => {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow()
                    item.sysAudio = sysAudio
                }
            })
        }

        // 消息推送
        const handleMsgPushChangeAll = (msgPush: string) => {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow()
                    item.msgPush = msgPush
                }
            })
        }

        // 蜂鸣器
        const handleBeeperChangeAll = (beeper: string) => {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow()
                    item.beeper = beeper
                }
            })
        }

        // 消息框弹出
        const handleMsgBoxPopupChangeAll = (msgBoxPopup: string) => {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow()
                    item.msgBoxPopup = msgBoxPopup
                }
            })
        }

        // 邮件
        const handleEmailChangeAll = (email: string) => {
            tableData.value.forEach((item) => {
                if (!item.rowDisable && !item.emailDisable) {
                    addEditRow()
                    item.email = email
                }
            })
        }

        const addEditRow = () => {
            pageData.value.applyDisable = false
        }

        const getSavaData = () => {
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
                                <abnormalType>${item.eventType}</abnormalType>
                                <triggerAlarmOut>
                                    <switch>${item.alarmOut.switch.toString()}</switch>
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
                alarmOuts.forEach((item) => {
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

        const setData = () => {
            openLoading()
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
            closeLoading()
            pageData.value.applyDisable = true
        }

        onMounted(async () => {
            await getAudioList()
            await getAlarmOutList()
            buildTableData()
        })
        return {
            pageData,
            tableData,
            formatEventType,
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
