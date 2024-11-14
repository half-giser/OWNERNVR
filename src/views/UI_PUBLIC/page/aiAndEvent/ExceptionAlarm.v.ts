/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-21 15:34:24
 * @Description: 异常报警
 */
import { cloneDeep } from 'lodash-es'
import { AlarmExceptionDto } from '@/types/apiType/aiAndEvent'
import AlarmBasePresetPop from './AlarmBasePresetPop.vue'
import AlarmBaseAlarmOutPop from './AlarmBaseAlarmOutPop.vue'

export default defineComponent({
    components: {
        AlarmBasePresetPop,
        AlarmBaseAlarmOutPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const tableData = ref<AlarmExceptionDto[]>([])
        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()
        const openMessageBox = useMessageBox().openMessageBox

        const eventTypeMapping: Record<string, string> = {
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
        }

        const pageData = ref({
            enableList: getSwitchOptions(),
            supportAudio: false,
            audioList: [] as SelectOption<string, string>[],
            // 打开穿梭框时选择行的索引
            triggerDialogIndex: 0,
            alarmOutIsShow: false,
            applyDisable: true,
        })

        const getAudioList = async () => {
            pageData.value.supportAudio = systemCaps.supportAlarmAudioConfig
            if (pageData.value.supportAudio) {
                pageData.value.audioList = await buildAudioList()
            }
        }

        const buildTableData = () => {
            tableData.value.length = 0
            openLoading()

            queryAbnormalTrigger().then((resb) => {
                const res = queryXml(resb)
                if (res('status').text() === 'success') {
                    tableData.value = []
                    res('//content/item').forEach((item) => {
                        const row = new AlarmExceptionDto()
                        row.rowDisable = false
                        const $item = queryXml(item.element)
                        const abnormalType = $item('abnormalType').text()
                        if (abnormalType === 'RAIDSubHealth' || abnormalType === 'RAIDUnavaiable' || abnormalType === 'signalShelter') {
                            return
                        }

                        if (abnormalType === 'raidException' && !systemCaps.supportRaid) {
                            return
                        }

                        if (abnormalType === 'alarmServerOffline' && !systemCaps.supportAlarmServerConfig) {
                            return
                        }
                        row.eventType = $item('abnormalType').text()
                        row.sysAudio = $item('sysAudio').attr('id') || DEFAULT_EMPTY_ID
                        // 设置的声音文件被删除时，显示为none
                        const AudioData = pageData.value.audioList.filter((element: { value: string; label: string }) => {
                            return element.value === row.sysAudio
                        })
                        if (!AudioData.length) {
                            row.sysAudio = DEFAULT_EMPTY_ID
                        }
                        row.msgPush = $item('msgPushSwitch').text()
                        row.alarmOut.switch = $item('triggerAlarmOut/switch').text().bool()
                        $item('triggerAlarmOut/alarmOuts/item').forEach((item) => {
                            row.alarmOut.alarmOuts.push({
                                value: item.attr('id'),
                                label: item.text(),
                            })
                        })
                        row.alarmOutList = row.alarmOut.alarmOuts.map((item) => item.value)
                        row.beeper = $item('buzzerSwitch').text()
                        if (row.eventType !== 'networkBreak' && row.eventType !== 'ipConflict') {
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
            return Translate(eventTypeMapping[eventType])
        }

        const switchAlarmOut = (index: number) => {
            addEditRow()
            const row = tableData.value[index].alarmOut
            if (row.switch) {
                openAlarmOut(index)
                console.log('open alarm out')
            } else {
                row.alarmOuts = []
            }
        }

        const openAlarmOut = (index: number) => {
            tableData.value[index].alarmOut.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.alarmOutIsShow = true
        }

        const changeAlarmOut = (index: number, data: SelectOption<string, string>[]) => {
            addEditRow()
            pageData.value.alarmOutIsShow = false
            tableData.value[index].alarmOut = {
                switch: !!data.length,
                alarmOuts: cloneDeep(data),
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
            const sendXml = rawXml`
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
                                ${tableData.value
                                    .map((item) => {
                                        const alarmOutSwitch = item.alarmOut.switch
                                        const alarmOuts = alarmOutSwitch ? item.alarmOut.alarmOuts : []
                                        return rawXml`
                                            <item>
                                                <abnormalType>${item.eventType}</abnormalType>
                                                <triggerAlarmOut>
                                                    <switch>${alarmOutSwitch}</switch>
                                                    <alarmOuts>
                                                        ${alarmOuts.map((item) => `<item id="${item.value}"><![CDATA[${item.label}]]></item>`).join('')}
                                                    </alarmOuts>
                                                </triggerAlarmOut>
                                                <msgPushSwitch>${item.msgPush}</msgPushSwitch>
                                                <buzzerSwitch>${item.beeper}</buzzerSwitch>
                                                <popMsgSwitch>${item.msgBoxPopup}</popMsgSwitch>
                                                <emailSwitch>${item.email}</emailSwitch>
                                                <sysAudio id='${item.sysAudio}'></sysAudio>
                                            </item>
                                        `
                                    })
                                    .join('')}
                            </alarmOuts>
                        </triggerAlarmOut>
                    </itemType>
                </content>
            `
            return sendXml
        }

        const setData = () => {
            openLoading()
            const sendXml = getSavaData()
            editAbnormalTrigger(sendXml).then((resb) => {
                const res = queryXml(resb)
                if (res('status').text() === 'success') {
                    openMessageBox({
                        type: 'success',
                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                    })
                } else {
                    openMessageBox({
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
            buildTableData()
        })

        return {
            pageData,
            tableData,
            formatEventType,
            openAlarmOut,
            changeAlarmOut,
            handleSysAudioChangeAll,
            handleMsgPushChangeAll,
            handleBeeperChangeAll,
            handleMsgBoxPopupChangeAll,
            handleEmailChangeAll,
            setData,
            addEditRow,
            switchAlarmOut,
            AlarmBasePresetPop,
            AlarmBaseAlarmOutPop,
        }
    },
})
