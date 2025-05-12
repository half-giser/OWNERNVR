/*
 * @Description: AI/事件——事件通知——声音
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-13 09:23:25
 */
import AudioUploadPop from './AudioUploadPop.vue'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    components: {
        AudioUploadPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        const plugin = usePlugin()
        const localTableRef = ref<TableInstance>()

        const AUDIO_INPUT_MAPPING: Record<string, string> = {
            MIC: Translate('IDCS_DEVICE_MIC_BUILT_IN'),
            LIN: Translate('IDCS_DEVICE_MIC_LINE_IN'),
        }

        const AUDIO_OUTPUT_MAPPING: Record<string, string> = {
            TALKBACK: Translate('IDCS_DEVICE_TALK_BACK'),
            ALARM_AUDIO: Translate('IDCS_DEVICE_ALARM_PLAY'),
            AUTO: Translate('IDCS_AUTO'),
            OFF: Translate('IDCS_OFF'),
        }

        const pageTabs = [
            {
                value: 'ipcAudio',
                label: Translate('IDCS_CAMERA_AUDIO_ALARM'),
            },
            {
                disabled: !systemCaps.supportAlarmAudioConfig,
                value: 'nvrAudio',
                label: Translate('IDCS_NVR_AUDIO_ALARM'),
            },
        ]

        const alarmOutList = ref<AlarmAudioAlarmOutDto[]>([new AlarmAudioAlarmOutDto()])
        const editAlarmOutRows = useWatchEditRows<AlarmAudioAlarmOutDto>()

        const deviceList = ref<AlarmAudioDevice[]>([new AlarmAudioDevice()])
        const editDeviceRows = useWatchEditRows<AlarmAudioDevice>()

        const localList = ref<AlarmLocalAudioDto[]>([])

        const pageData = ref({
            alarmOutIndex: 0,
            deviceIndex: 0,
            audioTab: 'ipcAudio',
            ipcAudioTab: 'audioAlarm',
            supportAlarmAudioConfig: systemCaps.supportAlarmAudioConfig,
            isImportAudioDialog: false,
            isSchedulePop: false,
            schedule: '',
            isScheduleChanged: false,
            scheduleList: [] as SelectOption<string, string>[],
        })

        const btnDisabled = computed(() => {
            return !editAlarmOutRows.size() && !editDeviceRows.size() && !pageData.value.isScheduleChanged
        })

        /**
         * @description 获取语音播报通道列表
         */
        const getAudioAlarmData = () => {
            getChlList({
                isSupportAudioAlarmOut: true,
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    if ($('content').attr('total').num() === 0) {
                        return
                    }

                    alarmOutList.value = $('content/item').map((item, index) => {
                        const $item = queryXml(item.element)
                        const row = new AlarmAudioAlarmOutDto()
                        row.id = item.attr('id')
                        row.name = $item('name').text()
                        row.index = index
                        return row
                    })

                    alarmOutList.value.forEach(async (item) => {
                        await getAudioAlarmItem(item)

                        if (!item.disabled) {
                            editAlarmOutRows.listen(item)
                        }
                    })
                })
            })
        }

        /**
         * @description 获取语音播报信息
         * @param {AlarmAudioAlarmOutDto} item
         */
        const getAudioAlarmItem = async (item: AlarmAudioAlarmOutDto) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${item.id}</chlId>
                </condition>
                <requireField>
                    <param></param>
                </requireField>
            `
            const result = await queryAudioAlarmOutCfg(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                const $param = queryXml($('content/chl/param')[0].element)

                item.disabled = false
                item.editFlag = false

                let customeAudioNum = 0 //保存已上传自定义声音的数量
                item.audioTypeList = $('types/audioAlarmType/enum').map((item) => {
                    if (item.text().num() >= 100) {
                        customeAudioNum++
                    }
                    return {
                        value: item.text().num(),
                        label: item.attr('value'),
                    }
                })
                item.customeAudioNum = customeAudioNum

                const langArr = [] as SelectOption<string, string>[]
                $('types/audioLanguageType/enum').forEach((item) => {
                    const langType = item.text()
                    if (langType === 'en-us') {
                        langArr.push({
                            value: langType,
                            label: Translate('IDCS_en_US'),
                        })
                    } else if (langType === 'zh-cn') {
                        langArr.push({
                            value: langType,
                            label: Translate('IDCS_zh_CN'),
                        })
                    }
                })
                item.langArr = langArr

                item.audioSwitch = $param('switch').text().bool()
                item.audioType = $param('audioType').text().num()
                item.alarmTimes = $param('alarmTimes').text().undef()?.num()
                item.alarmTimesDisabled = !$param('alarmTimes').text()
                item.audioVolume = $param('audioVolume').text().undef()?.num()
                item.audioVolumeDisabled = !$param('audioVolume').text()
                item.languageType = $param('languageType').text()
                item.audioFormat = $param('audioParamLimit/audioFormat').text()
                item.sampleRate = $param('audioParamLimit/sampleRate').text()
                item.audioChannel = $param('audioParamLimit/audioChannel').text()
                item.audioDepth = $param('audioParamLimit/audioDepth').text()
                item.audioFileLimitSize = $param('audioParamLimit/audioFileSize').text().array(' ').pop()!
            }
        }

        /**
         * @description 更改声音回调
         */
        const changeAudioVolume = () => {
            if (alarmOutList.value[pageData.value.alarmOutIndex].id === deviceList.value[pageData.value.deviceIndex].id) {
                deviceList.value[pageData.value.deviceIndex].audioOutVolume = alarmOutList.value[pageData.value.alarmOutIndex].audioVolume!
            }
        }

        /**
         * @description 打开新增音频弹窗
         */
        const addAudio = () => {
            if (plugin.IsSupportH5() && isHttpsLogin()) {
                openNotify(formatHttpsTips(Translate('IDCS_UPLOAD_VOICE')), true)
                return
            }
            pageData.value.isImportAudioDialog = true
        }

        /**
         * @description 删除自定义音频
         */
        const deleteAudio = async () => {
            const item = alarmOutList.value[pageData.value.alarmOutIndex]
            const sendXml = rawXml`
                <content>
                    <chl id='${item.id}'>
                    <param>
                        <deleteAudioAlarm>
                            <id>${item.audioType}</id>
                        </deleteAudioAlarm>
                    </param>
                    </chl>
                </content>
            `
            const result = await deleteCustomizeAudioAlarm(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                item.audioTypeList = item.audioTypeList.filter((typeItem) => typeItem.value !== item.audioType)
                item.audioType = 1
                item.languageType = item.langArr[0].value
                item.customeAudioNum--
            } else {
                openMessageBox({
                    type: 'error',
                    message: Translate('IDCS_DELETE_FAIL'),
                })
            }
        }

        /**
         * @description 试听
         */
        const listenAudio = async () => {
            const item = alarmOutList.value[pageData.value.alarmOutIndex]
            const sendXml = rawXml`
                <content>
                    <chl id='${item.id}'>
                    <param>
                        <auditionAudioAlarm>
                            <audioType>${item.audioType}</audioType>
                        </auditionAudioAlarm>
                    </param>
                    </chl>
                </content>
            `
            const result = await auditionCustomizeAudioAlarm(sendXml)
            const $ = queryXml(result)

            if ($('status').text() !== 'success') {
                const errorCode = $('errorCode').text().num()
                let msg = item.name + Translate('IDCS_AUDITION_FAILED')
                if (errorCode === ErrorCode.USER_ERROR_GET_CONFIG_INFO_FAIL) msg += Translate('IDCS_GET_CFG_FAIL')
                openMessageBox(msg)
            }
        }

        /**
         * @description 确认新增音频
         * @param {number} audioId
         * @param {string} fileName
         */
        const confirmAddAudio = (audioId: number, fileName: string) => {
            alarmOutList.value[pageData.value.alarmOutIndex].audioTypeList.push({
                value: audioId,
                label: fileName,
            })
            alarmOutList.value[pageData.value.alarmOutIndex].customeAudioNum++
        }

        /**
         * @description 关闭新增音频弹窗
         */
        const closeAddAudio = () => {
            if (pageData.value.audioTab === 'nvrAudio') {
                getLocalTableData()
            }
            pageData.value.isImportAudioDialog = false
        }

        /**
         * @description 保存语音播报信息
         */
        const setAudioAlarmData = async () => {
            const editRows = editAlarmOutRows.toArray()
            for (let i = 0; i < editRows.length; i++) {
                try {
                    const item = editRows[i]
                    const sendXml = rawXml`
                        <content>
                            <chl id='${item.id}'>
                            <param>
                                <name>${wrapCDATA(item.name)}</name>
                                <switch>${item.audioSwitch}</switch>
                                <audioType>${item.audioType}</audioType>
                                <alarmTimes>${item.alarmTimes || ''}</alarmTimes>
                                <audioVolume>${item.audioVolume || ''}</audioVolume>
                                <languageType>${item.audioType >= 100 ? 'customize' : item.languageType}</languageType>
                            </param>
                            </chl>
                        </content>
                    `
                    await editAudioAlarmOutCfg(sendXml)
                    editAlarmOutRows.remove(item)
                } catch {}
            }
        }

        /**
         * @description 获取摄像机声音通道列表
         */
        const getAudioDeviceData = () => {
            getChlList({
                isSupportAudioDev: true,
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    if (!$('content/item').length) {
                        return
                    }

                    deviceList.value = $('content/item').map((item, index) => {
                        const $item = queryXml(item.element)
                        const row = new AlarmAudioDevice()
                        row.id = item.attr('id')
                        row.name = $item('name').text()
                        row.index = index
                        return row
                    })

                    deviceList.value.forEach(async (item) => {
                        await getAudioDeviceItem(item)

                        if (!item.disabled) {
                            editDeviceRows.listen(item)
                        }
                    })
                })
            })
        }

        /**
         * @description 获取摄像机声音数据
         * @param {AlarmAudioDevice} item
         */
        const getAudioDeviceItem = async (item: AlarmAudioDevice) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${item.id}</chlId>
                </condition>
                <requireField>
                    <param></param>
                </requireField>
            `
            const result = await queryAudioStreamConfig(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                const $param = queryXml($('content/chl/param')[0].element)

                item.disabled = false

                item.audioEncodeType = $('types/audioEncode/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: item.text(),
                    }
                })
                item.audioInputType = $('types/audioInput/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: AUDIO_INPUT_MAPPING[item.text()],
                    }
                })
                item.audioOutputType = $('types/audioOutput/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: AUDIO_OUTPUT_MAPPING[item.text()],
                    }
                })
                item.audioInSwitch = $param('audioInSwitch').text().bool()
                item.audioInSwitchEnabled = !!$param('audioInSwitch').text()
                item.audioEncode = $param('audioEncode').text()
                item.audioInput = $param('audioInput').text()
                item.loudSpeaker = $param('loudSpeaker').text()
                item.audioOutput = $param('audioOutput').text()
                item.micInVolume = $param('volume/micInVolume').text().num()
                item.linInVolume = $param('volume/linInVolume').text().num()
                item.audioOutVolume = $param('volume/audioOutVolume').text().num()
                item.micMaxValue = $param('volume/micInVolume').attr('max').undef()?.num() ?? 100
                item.linMaxValue = $param('volume/linInVolume').attr('max').undef()?.num() ?? 100
                item.audioOutMaxValue = $param('volume/audioOutVolume').attr('max').undef()?.num() ?? 100
                item.micOrLinEnabled = $param('volume/micInVolume').length > 0 || $param('volume/linInVolume').length > 0
                item.audioOutEnabled = $param('volume/audioOutVolume').length > 0
            }
        }

        /**
         * @description 保存摄像机声音数据
         */
        const setAudiDeviceData = async () => {
            const editRows = editDeviceRows.toArray()

            for (let i = 0; i < editRows.length; i++) {
                const item = editRows[i]
                try {
                    const sendXml = rawXml`
                        <content>
                            <chl id='${item.id}'>
                                <param>
                                    ${item.audioInSwitchEnabled ? `<audioInSwitch>${item.audioInSwitch}</audioInSwitch>` : ''}
                                    ${item.audioInput ? `<audioInput>${item.audioInput}</audioInput>` : ''}
                                    ${item.audioOutput ? `<audioOutput>${item.audioOutput}</audioOutput>` : ''}
                                    ${item.loudSpeaker ? `<loudSpeaker>${item.loudSpeaker}</loudSpeaker>` : ''}
                                    ${item.audioEncode ? `<audioEncode>${item.audioEncode}</audioEncode>` : ''}
                                    <volume>
                                        ${item.micOrLinEnabled ? `<micInVolume>${item.micInVolume}</micInVolume>` : ''}
                                        ${item.micOrLinEnabled ? `<linInVolume>${item.linInVolume}</linInVolume>` : ''}
                                        ${item.audioOutEnabled ? `<audioOutVolume>${item.audioOutVolume}</audioOutVolume>` : ''}
                                    </volume>
                                </param>
                            </chl>
                        </content>
                    `
                    await editAudioStreamConfig(sendXml)
                    editDeviceRows.remove(item)
                } catch {}
            }
        }

        /**
         * @description 获取排程数据
         */
        const getScheduleData = async () => {
            pageData.value.scheduleList = await buildScheduleList()

            const result = await queryEventNotifyParam()
            commLoadResponseHandler(result, ($) => {
                const scheduleId = $('content/triggerChannelAudioSchedule').attr('id')
                // 判断返回的排程是否存在，若不存在设为空ID
                if (scheduleId) {
                    pageData.value.schedule = scheduleId
                } else {
                    const scheduleName = $('content/triggerChannelAudioSchedule').text()
                    const find = pageData.value.scheduleList.find((item) => item.label === scheduleName)
                    if (find) {
                        pageData.value.schedule = find.value
                    }
                }
            })
        }

        /**
         * @description 保存排程设置
         */
        const setScheduleData = async () => {
            if (!pageData.value.isScheduleChanged) {
                return
            }

            // <triggerChannelAudioSchedule id='${pageData.value.schedule}'>${audioName}</triggerChannelAudioSchedule>
            // 这里删掉了原代码中传的audioName，因为在audioName = <无>的情况下会导致解析错误
            const sendXml = rawXml`
                <content>
                    <triggerChannelAudioSchedule id='${pageData.value.schedule}'></triggerChannelAudioSchedule>
                </content>
            `
            await editEventNotifyParam(sendXml)
            pageData.value.isScheduleChanged = false
        }

        // 获取本地声音报警数据
        const getLocalTableData = async () => {
            const result = await queryAlarmAudioCfg()

            commLoadResponseHandler(result, ($) => {
                localList.value = $('content/audioList/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id'),
                        index: item.attr('index'),
                        name: $item('name').text(),
                        originalName: $item('name').text(),
                        fileValid: $item('fileValid').text(),
                    }
                })
            })
        }

        /**
         * @description 选中改行
         * @param {AlarmLocalAudioDto} rowData
         */
        const handleRowClick = (rowData: AlarmLocalAudioDto) => {
            localTableRef.value!.clearSelection()
            localTableRef.value!.toggleRowSelection(rowData, true)
        }

        /**
         * @description 删除本地音频
         */
        const deleteLocalAudio = async () => {
            const selectedId = (localTableRef.value!.getSelectionRows() as AlarmLocalAudioDto[]).map((item) => item.id)

            if (selectedId.length) {
                const sendXml = rawXml`
                    <content>
                        ${selectedId.map((item) => `<item id='${item}'></item>`).join('')}
                    </content>
                `

                const result = await deleteAlarmAudio(sendXml)
                commSaveResponseHandler(result, () => {
                    localList.value = localList.value.filter((item) => !selectedId.includes(item.id))
                })
            }
        }

        /**
         * @description 保存数据
         */
        const setData = async () => {
            openLoading()
            await setAudioAlarmData()
            await setAudiDeviceData()
            await setScheduleData()
            closeLoading()
        }

        /**
         * @description 关闭排程弹窗 更新排程数据
         */
        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleData()
            pageData.value.schedule = getScheduleId(pageData.value.scheduleList, pageData.value.schedule)
        }

        onMounted(async () => {
            openLoading()

            await getScheduleData()
            await getAudioAlarmData()
            await getAudioDeviceData()

            if (pageData.value.supportAlarmAudioConfig) {
                await getLocalTableData()
            }

            closeLoading()
        })

        return {
            localTableRef,
            pageTabs,
            alarmOutList,
            deviceList,
            localList,
            pageData,
            addAudio,
            deleteAudio,
            listenAudio,
            confirmAddAudio,
            closeAddAudio,
            handleRowClick,
            deleteLocalAudio,
            setData,
            closeSchedulePop,
            changeAudioVolume,
            btnDisabled,
        }
    },
})
