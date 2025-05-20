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

        const EVENT_TYPE_MAPPING: Record<string, string> = {
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
            supportAudio: systemCaps.supportAlarmAudioConfig,
            audioList: [] as SelectOption<string, string>[],
            // 打开穿梭框时选择行的索引
            triggerDialogIndex: 0,
            isAlarmOutPop: false,
        })

        const tableData = ref<AlarmExceptionDto[]>([])
        const watchEdit = useWatchEditData(tableData)

        /**
         * @description 获取声音列表
         */
        const getAudioList = async () => {
            if (pageData.value.supportAudio) {
                pageData.value.audioList = await buildAudioList()
            }
        }

        /**
         * @description 获取列表数据
         */
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

        /**
         * @description 格式化事件类型
         * @param {string} eventType
         * @returns {string}
         */
        const formatEventType = (eventType: string) => {
            return Translate(EVENT_TYPE_MAPPING[eventType])
        }

        /**
         * @description 开关报警输出
         * @param {number} index
         */
        const switchAlarmOut = (index: number) => {
            const row = tableData.value[index].alarmOut
            if (row.switch) {
                openAlarmOut(index)
            } else {
                row.alarmOuts = []
            }
        }

        /**
         * @description 打开报警输出穿梭框
         * @param {number} index
         */
        const openAlarmOut = (index: number) => {
            tableData.value[index].alarmOut.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.isAlarmOutPop = true
        }

        /**
         * @description 更新报警输出联动
         * @param {number} index
         * @param {SelectOption<string, string>[]} data
         */
        const changeAlarmOut = (index: number, data: SelectOption<string, string>[]) => {
            pageData.value.isAlarmOutPop = false
            tableData.value[index].alarmOut = {
                switch: !!data.length,
                alarmOuts: cloneDeep(data),
            }
        }

        /**
         * @description 批量更改系统音频
         * @param {string} sysAudio
         */
        const changeAllAudio = (sysAudio: string) => {
            tableData.value.forEach((item) => {
                item.sysAudio = sysAudio
            })
        }

        /**
         * @description 批量更改消息推送
         * @param {string} msgPush
         */
        const changeAllMsgPush = (msgPush: string) => {
            tableData.value.forEach((item) => {
                item.msgPush = msgPush
            })
        }

        /**
         * @description 批量更改蜂鸣器
         * @param {string} beeper
         */
        const changeAllBeeper = (beeper: string) => {
            tableData.value.forEach((item) => {
                item.beeper = beeper
            })
        }

        /**
         * @description 批量更改消息框弹出
         * @param {string} msgBoxPopup
         */
        const changeAllMsgPopUp = (msgBoxPopup: string) => {
            tableData.value.forEach((item) => {
                item.msgBoxPopup = msgBoxPopup
            })
        }

        /**
         * @description 批量更改邮件
         * @param {string} email
         */
        const changeAllEmail = (email: string) => {
            tableData.value.forEach((item) => {
                if (!item.emailDisable) {
                    item.email = email
                }
            })
        }

        /**
         * @description
         * @returns {string}
         */
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

        /**
         * @description 保存数据
         */
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
