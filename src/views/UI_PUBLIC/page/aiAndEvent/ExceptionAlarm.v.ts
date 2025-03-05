/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-21 15:34:24
 * @Description: 异常报警
 */
import AlarmBasePresetPop from './AlarmBasePresetPop.vue'
import AlarmBaseAlarmOutPop from './AlarmBaseAlarmOutPop.vue'

export default defineComponent({
    components: {
        AlarmBasePresetPop,
        AlarmBaseAlarmOutPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

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
            enableList: getTranslateOptions(DEFAULT_SWITCH_OPTIONS),
            supportAudio: false,
            audioList: [] as SelectOption<string, string>[],
            // 打开穿梭框时选择行的索引
            triggerDialogIndex: 0,
            isAlarmOutPop: false,
        })

        const tableData = ref<AlarmExceptionDto[]>([])
        const watchEdit = useWatchEditData(tableData)

        const getAudioList = async () => {
            pageData.value.supportAudio = systemCaps.supportAlarmAudioConfig
            if (pageData.value.supportAudio) {
                pageData.value.audioList = await buildAudioList()
            }
        }

        const getData = () => {
            openLoading()

            queryAbnormalTrigger().then((result) => {
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    $('content/item').forEach((item) => {
                        const row = new AlarmExceptionDto()
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
                        row.sysAudio = getSystemAudioID(pageData.value.audioList, $item('sysAudio').attr('id'))
                        row.msgPush = $item('msgPushSwitch').text()
                        row.alarmOut.switch = $item('triggerAlarmOut/switch').text().bool()
                        row.alarmOut.alarmOuts = $item('triggerAlarmOut/alarmOuts/item').map((item) => {
                            return {
                                value: item.attr('id'),
                                label: item.text(),
                            }
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
                    watchEdit.listen()
                }
            })
            closeLoading()
        }

        const formatEventType = (eventType: string) => {
            return Translate(eventTypeMapping[eventType])
        }

        const switchAlarmOut = (index: number) => {
            const row = tableData.value[index].alarmOut
            if (row.switch) {
                openAlarmOut(index)
            } else {
                row.alarmOuts = []
            }
        }

        const openAlarmOut = (index: number) => {
            tableData.value[index].alarmOut.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.isAlarmOutPop = true
        }

        const changeAlarmOut = (index: number, data: SelectOption<string, string>[]) => {
            pageData.value.isAlarmOutPop = false
            tableData.value[index].alarmOut = {
                switch: !!data.length,
                alarmOuts: cloneDeep(data),
            }
        }

        // 系统音频
        const changeAllAudio = (sysAudio: string) => {
            tableData.value.forEach((item) => {
                item.sysAudio = sysAudio
            })
        }

        // 消息推送
        const changeAllMsgPush = (msgPush: string) => {
            tableData.value.forEach((item) => {
                item.msgPush = msgPush
            })
        }

        // 蜂鸣器
        const changeAllBeeper = (beeper: string) => {
            tableData.value.forEach((item) => {
                item.beeper = beeper
            })
        }

        // 消息框弹出
        const changeAllMsgPopUp = (msgBoxPopup: string) => {
            tableData.value.forEach((item) => {
                item.msgBoxPopup = msgBoxPopup
            })
        }

        // 邮件
        const changeAllEmail = (email: string) => {
            tableData.value.forEach((item) => {
                if (!item.emailDisable) {
                    item.email = email
                }
            })
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
                        </triggerAlarmOut>
                    </itemType>
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
                                            ${alarmOuts.map((item) => `<item id="${item.value}">${wrapCDATA(item.label)}</item>`).join('')}
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
                </content>
            `
            return sendXml
        }

        const setData = async () => {
            openLoading()
            const sendXml = getSavaData()
            const result = await editAbnormalTrigger(sendXml)
            commSaveResponseHandler(result)
            closeLoading()
            watchEdit.update()
        }

        onMounted(async () => {
            await getAudioList()
            getData()
        })

        return {
            pageData,
            tableData,
            watchEdit,
            formatEventType,
            openAlarmOut,
            changeAlarmOut,
            changeAllAudio,
            changeAllMsgPush,
            changeAllBeeper,
            changeAllMsgPopUp,
            changeAllEmail,
            setData,
            switchAlarmOut,
        }
    },
})
