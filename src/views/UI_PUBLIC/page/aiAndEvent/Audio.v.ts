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

        const AUDIO_DENOISE_MAPPING: Record<string, string> = {
            CONVENTION: Translate('IDCS_AUDIO_NORMAL'),
            ENHANCE: Translate('IDCS_AUDIO_ENHANCED'),
        }

        const LANG_MAPPING: Record<string, string> = {
            'zh-cn': Translate('IDCS_zh_CN'),
            'en-us': Translate('IDCS_en_US'),
            'it-it': Translate('IDCS_it_IT'),
            customize: 'Customize',
        }

        const pageTabs = [
            {
                disabled: systemCaps.hotStandBy,
                value: 'ipcAudio',
                label: Translate('IDCS_CAMERA_AUDIO_ALARM'),
            },
            {
                disabled: !systemCaps.supportAlarmAudioConfig,
                value: 'nvrAudio',
                label: Translate('IDCS_NVR_AUDIO_ALARM'),
            },
            {
                disabled: !systemCaps.supportAlarmAudioConfig || systemCaps.hotStandBy,
                value: 'ipSpeaker',
                label: Translate('IDCS_IPSPEAKER_X').formatForLang(Translate('IDCS_AUDIO')),
            },
        ]

        const scheduleMap = ref<Record<string, string>>({})
        const ipSpeakerScheduleMap = ref<Record<string, string>>({})

        const alarmOutList = ref<AlarmAudioAlarmOutDto[]>([])
        const alarmOutFormData = ref(new AlarmAudioAlarmOutDto())
        const editAlarmOutFormData = useWatchEditData(alarmOutFormData)

        const deviceList = ref<AlarmAudioDevice[]>([])
        const deviceFormData = ref(new AlarmAudioDevice())
        const editDeviceFormData = useWatchEditData(deviceFormData)

        const localFormData = ref(new AlarmLocalAudioDto())

        const ipSepeakerList = ref<SelectOption<string, string>[]>([])
        const ipSpeakerFormData = ref(new AlarmIpSpeakerDto())

        const pageData = ref({
            alarmOutIndex: 0,
            deviceIndex: 0,
            audioTab: pageTabs.filter((item) => !item.disabled)[0]?.value || '',
            ipcAudioTab: 'audioAlarm',
            isImportAudioDialog: false,
            isSchedulePop: false,
            scheduleList: [] as SelectOption<string, string>[],
            ipSpeakerId: '',
            ipSpeakerOnlineList: [] as string[],
            selectedLocalAudio: [] as string[],
        })

        const changeTab = () => {
            localTableRef.value!.clearSelection()

            if (pageData.value.audioTab === 'nvrAudio') {
                if (systemCaps.supportAlarmAudioConfig) {
                    getLocalTableData()
                }
            }

            if (pageData.value.audioTab === 'ipSpeaker') {
                if (systemCaps.supportAlarmAudioConfig) {
                    getLocalTableData()
                }
            }
        }

        /**
         * @description 获取语音播报通道列表
         */
        const getAudioAlarmData = async () => {
            const result = await getChlList({
                isSupportAudioAlarmOut: true,
                requireField: ['supportManualAudioAlarmOut'],
                nodeType: 'chls',
            })

            const $ = await commLoadResponseHandler(result)

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
        }

        const changeAlarmOutChl = async () => {
            if (alarmOutList.value[pageData.value.alarmOutIndex]) {
                editAlarmOutFormData.reset()
                openLoading()
                alarmOutFormData.value = cloneDeep(alarmOutList.value[pageData.value.alarmOutIndex])
                await getScheduleData()
                await getAudioAlarmItem()
                alarmOutFormData.value.schedule = scheduleMap.value[alarmOutFormData.value.id]
                closeLoading()
                editAlarmOutFormData.listen()
            }
        }

        /**
         * @description 获取语音播报信息
         */
        const getAudioAlarmItem = async () => {
            const item = alarmOutFormData.value

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

                item.langArr = $('types/audioLanguageType/enum').map((item) => {
                    const value = item.text()
                    const label = item.attr('value') || LANG_MAPPING[item.text()] || ''
                    return {
                        value: value,
                        label: label,
                    }
                })

                $('types/audioAlarmType/enum').map((element) => {
                    const language = element.attr('language') || 'customize'
                    const value = element.text().num()
                    const label = element.attr('value')
                    // 5.1.4以下（老版本）仅支持简体中文、英文
                    // 5.1.4及其以上IPC设备的广播声音列表名称根据语言进行切换
                    if (!item.audioTypeList[language]) {
                        item.audioTypeList[language] = []
                    }

                    if (language === 'customize' && value >= 100) {
                        item.audioTypeList[language].push({
                            value,
                            label,
                        })
                    } else {
                        item.audioTypeList[language].push({
                            value,
                            label,
                        })
                    }
                })

                item.languageType = $param('languageType').text()
                item.audioSwitch = $param('switch').text().bool()
                const audioType = $param('audioType').text().num()
                item.audioType = audioType < 100 ? audioType : 0
                item.customizeAudioType = audioType >= 100 ? audioType : 0
                item.alarmTimes = $param('alarmTimes').text().undef()?.num()
                item.alarmTimesDisabled = !$param('alarmTimes').text()
                item.audioVolume = $param('audioVolume').text().undef()?.num()
                item.audioVolumeDisabled = !$param('audioVolume').text()
                item.audioFormat = $param('audioParamLimit/audioFormat').text()
                item.sampleRate = $param('audioParamLimit/sampleRate').text()
                item.audioChannel = $param('audioParamLimit/audioChannel').text()
                item.audioDepth = $param('audioParamLimit/audioDepth').text()
                item.audioFileLimitSize = $param('audioParamLimit/audioMaxlen').text().num()
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
            const sendXml = rawXml`
                <content>
                    <chl id='${alarmOutFormData.value.id}'>
                        <param>
                            <deleteAudioAlarm>
                                <id>${alarmOutFormData.value.customizeAudioType}</id>
                            </deleteAudioAlarm>
                        </param>
                    </chl>
                </content>
            `
            const result = await deleteCustomizeAudioAlarm(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                alarmOutFormData.value.audioTypeList.customize = cloneDeep(alarmOutFormData.value.audioTypeList.customize)
                if (!alarmOutFormData.value.audioTypeList.customize.length) {
                    alarmOutFormData.value.customizeAudioType = 0
                } else {
                    alarmOutFormData.value.customizeAudioType = alarmOutFormData.value.audioTypeList.customize[0].value
                }
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
            const item = alarmOutFormData.value
            const sendXml = rawXml`
                <content>
                    <chl id='${item.id}'>
                    <param>
                        <auditionAudioAlarm>
                            <audioType>${item.languageType === 'customize' ? item.customizeAudioType : item.audioType}</audioType>
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
            alarmOutFormData.value.audioTypeList.customize.push({
                value: audioId,
                label: fileName,
            })

            if (alarmOutFormData.value.customizeAudioType === 0) {
                alarmOutFormData.value.customizeAudioType = audioId
            }
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
            let languageType = alarmOutFormData.value.languageType
            if (languageType === 'customize') {
                if (alarmOutFormData.value.customizeAudioType < 100) {
                    languageType = alarmOutFormData.value.langArr[0].value
                }
            }

            let audioType = alarmOutFormData.value.audioType
            if (alarmOutFormData.value.languageType === 'customize' && alarmOutFormData.value.customizeAudioType >= 100) {
                audioType = alarmOutFormData.value.customizeAudioType
            }

            const sendXml = rawXml`
                <content>
                    <chl id='${alarmOutFormData.value.id}'>
                        <param>
                            <switch>${alarmOutFormData.value.audioSwitch}</switch>
                            <audioType>${audioType}</audioType>
                            <alarmTimes>${alarmOutFormData.value.alarmTimes || ''}</alarmTimes>
                            <audioVolume>${alarmOutFormData.value.audioVolume || ''}</audioVolume>
                            <languageType>${languageType}</languageType>
                        </param>
                    </chl>
                </content>
            `
            await editAudioAlarmOutCfg(sendXml)
            editAlarmOutFormData.update()
        }

        const setAlarmOutData = async () => {
            openLoading()
            await setAudioAlarmData()
            await setScheduleData()
            closeLoading()
        }

        /**
         * @description 获取排程数据
         */
        const getScheduleData = async () => {
            const result = await queryEventNotifyParam()
            commLoadResponseHandler(result, ($) => {
                $('content/triggerChannelAudioInfos/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    scheduleMap.value[item.attr('id')] = $item('schedule').attr('id')
                })

                $('content/triggerIPSpeakerAudioInfos/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    ipSpeakerScheduleMap.value[item.attr('id')] = $item('schedule').attr('id')
                })
            })
        }

        /**
         * @description 保存排程设置
         */
        const setScheduleData = async () => {
            scheduleMap.value[alarmOutFormData.value.id] = alarmOutFormData.value.schedule

            const sendXml = rawXml`
                <content>
                    <triggerChannelAudioInfos>
                        ${Object.entries(scheduleMap.value)
                            .map((item) => {
                                return rawXml`
                                    <item id="${item[0]}">
                                        <schedule id="${item[1]}">${pageData.value.scheduleList.find((schedule) => schedule.value === item[1])?.label || Translate('IDCS_NULL')}</schedule>
                                    </item>
                                `
                            })
                            .join('')}
                    </triggerChannelAudioInfos>
                </content>
            `
            await editEventNotifyParam(sendXml)
        }

        /**
         * @description 关闭排程弹窗 更新排程数据
         */
        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            pageData.value.scheduleList = await buildScheduleList()
            alarmOutFormData.value.schedule = getScheduleId(pageData.value.scheduleList, alarmOutFormData.value.schedule)
            // todo
        }

        /**
         * @description 获取摄像机声音通道列表
         */
        const getAudioDeviceData = async () => {
            const result = await getChlList({
                isSupportAudioDev: true,
            })
            const $ = await commLoadResponseHandler(result)
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
        }

        const changeDeviceChl = async () => {
            if (deviceList.value[pageData.value.deviceIndex]) {
                editDeviceFormData.reset()
                openLoading()
                deviceFormData.value = cloneDeep(deviceList.value[pageData.value.deviceIndex])
                await getAudioDeviceItem()
                closeLoading()
                editDeviceFormData.listen()
            }
        }

        /**
         * @description 获取摄像机声音数据
         * @param {AlarmAudioDevice} item
         */
        const getAudioDeviceItem = async () => {
            const item = deviceFormData.value
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
                item.audioDenoiseType = $('types/audioDenoiseType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: AUDIO_DENOISE_MAPPING[item.text()],
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
                item.audioDenoise = $param('audioDenoise').text()
                item.audioDenoiseEnabled = $param('audioDenoise').length > 0
                // 判断扬声器（内置）和LOUT（外置）是否互斥
                item.isSpeakerMutex = $param('audioOutputswitch').length > 0
                item.loudSpeakerswitch = $param('loudSpeakerswitch').text().bool()
                item.audioOutputswitch = $param('audioOutputswitch').text().bool()
            }
        }

        const changeLoudSpeakerswitch = () => {
            if (deviceFormData.value.loudSpeakerswitch) {
                deviceFormData.value.audioOutputswitch = false
            } else {
                deviceFormData.value.audioOutputswitch = true
            }
        }

        const changeAudioOutputswitch = () => {
            if (deviceFormData.value.audioOutputswitch) {
                deviceFormData.value.loudSpeakerswitch = false
            } else {
                deviceFormData.value.loudSpeakerswitch = true
            }
        }

        /**
         * @description 保存摄像机声音数据
         */
        const setDeviceData = async () => {
            const item = deviceFormData.value
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
            editDeviceFormData.update()
        }

        // 获取本地声音报警数据
        const getLocalTableData = async () => {
            openLoading()
            const result = await queryAlarmAudioCfg()

            const $ = await commLoadResponseHandler(result)
            localFormData.value.list = $('content/audioList/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    id: item.attr('id'),
                    index: item.attr('index'),
                    name: $item('name').text(),
                    originalName: $item('name').text(),
                    fileValid: $item('fileValid').text(),
                    fileType: $item('name').text().split('.')[1],
                }
            })
            localFormData.value.formatType = $('types/formatType/enum').map((item) => item.text())
            localFormData.value.audioSchedule = $('content/audioSchedule').attr('id')
            localFormData.value.volume = $('content/volume').text().num()

            closeLoading()
        }

        const setLocalAudio = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <volume>${localFormData.value.volume}</volume>
                    <audioSchedule id="${localFormData.value.audioSchedule}"></audioSchedule>
                </content>
            `
            const result = await editAlarmAudioCfg(sendXml)

            closeLoading()

            commSaveResponseHandler(result)
        }

        /**
         * @description 选中改行
         * @param {AlarmLocalAudioDto} rowData
         */
        const handleRowClick = (rowData: AlarmLocalAudioFileDto) => {
            localTableRef.value!.clearSelection()
            localTableRef.value!.toggleRowSelection(rowData, true)
        }

        const handleSelectionChange = (data: AlarmLocalAudioFileDto[]) => {
            pageData.value.selectedLocalAudio = data.map((item) => item.id)
        }

        /**
         * @description 删除本地音频
         */
        const deleteLocalAudio = async () => {
            const selectedId = (localTableRef.value!.getSelectionRows() as AlarmLocalAudioFileDto[]).map((item) => item.id)

            if (selectedId.length) {
                const sendXml = rawXml`
                    <content>
                        ${selectedId.map((item) => `<item id='${item}'></item>`).join('')}
                    </content>
                `

                const result = await deleteAlarmAudio(sendXml)
                commSaveResponseHandler(result, () => {
                    localFormData.value.list = localFormData.value.list.filter((item) => !selectedId.includes(item.id))
                })
            }
        }

        const listenLocalAudio = async () => {
            const sendXml = rawXml`
                <content>
                    <deviceId>${pageData.value.ipSpeakerId}</deviceId>
                    <audioId>${pageData.value.selectedLocalAudio[0]}</audioId>
                </content>
            `
            const result = await auditionAlarmAudio(sendXml)
            const $ = queryXml(result)
            const errorCode = $('errorCode').text().num()
            switch (errorCode) {
                case 536870979:
                    openMessageBox(Translate('IDCS_FILE_NO_EXISTS'))
                    break
                case 536870938:
                    openMessageBox(Translate('IDCS_AUDITION_FAILED'))
                    break
                case 536870943:
                    openMessageBox(Translate('USER_ERROR_INVALID_PARAM'))
                    break
                default:
                    break
            }
        }

        const getIpSpeakerList = async () => {
            const result = await getChlList({
                nodeType: 'voices',
            })
            const $ = queryXml(result)
            ipSepeakerList.value = $('content/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    value: item.attr('id'),
                    label: $item('name').text(),
                }
            })
            if (ipSepeakerList.value.length) {
                pageData.value.ipSpeakerId = ipSepeakerList.value[0].value
            }
        }

        const getOnlintIpSpeakerList = async () => {
            const result = await queryOnlineVoiceDevList()
            const $ = queryXml(result)
            pageData.value.ipSpeakerOnlineList = $('content/item').map((item) => item.attr('id'))
        }

        const getIpSpeakerData = async () => {
            openLoading()
            const sendXml = rawXml`
                <condition>
                    <chlId>${pageData.value.ipSpeakerId}</chlId>
                </condition>
                <requireField>
                    <param></param>
                </requireField>
            `
            const result = await queryAudioStreamConfig(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                ipSpeakerFormData.value.volume = $('content/chl/param/volume/audioOutVolume').text().num()
                ipSpeakerFormData.value.volumeMax = $('content/chl/param/volume/audioOutVolume').attr('max').num()
                ipSpeakerFormData.value.volumeMin = $('content/chl/param/volume/audioOutVolume').attr('min').num()
                ipSpeakerFormData.value.schedule = ipSpeakerScheduleMap.value[pageData.value.ipSpeakerId]
                ipSpeakerFormData.value.online = pageData.value.ipSpeakerOnlineList.includes(pageData.value.ipSpeakerId)
            }
        }

        const changeIPSpeaker = async () => {
            openLoading()
            ipSpeakerFormData.value = new AlarmIpSpeakerDto()
            await getScheduleData()
            await getIpSpeakerData()
            ipSpeakerFormData.value.schedule = ipSpeakerScheduleMap.value[pageData.value.ipSpeakerId]
            closeLoading()
        }

        const setIpSpeakerVolume = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <chl id="${pageData.value.ipSpeakerId}">
                        <param>
                            <volume>
                                <audioOutVolume>${ipSpeakerFormData.value.volume}</audioOutVolume>
                            </volume>
                        </param>
                    </chl>
                </content>
            `
            await editAudioStreamConfig(sendXml)

            closeLoading()
        }

        const setIpSpeakerSchedule = async () => {
            ipSpeakerScheduleMap.value[pageData.value.ipSpeakerId] = ipSpeakerFormData.value.schedule
            openLoading()

            const sendXml = rawXml`
                <content>
                    <triggerIPSpeakerAudioInfos>
                        ${Object.entries(ipSpeakerScheduleMap.value)
                            .map((item) => {
                                return rawXml`
                                <item id="${item[0]}">
                                    <schedule id="${item[1]}">${pageData.value.scheduleList.find((schedule) => schedule.value === item[1])?.label || Translate('IDCS_NULL')}</schedule>
                                </item>
                            `
                            })
                            .join('')}
                    </triggerIPSpeakerAudioInfos>
                </content>
            `
            await editEventNotifyParam(sendXml)

            closeLoading()
        }

        onMounted(async () => {
            openLoading()

            pageData.value.scheduleList = await buildScheduleList()
            await getScheduleData()

            if (!systemCaps.hotStandBy) {
                await getAudioAlarmData()
                await getAudioDeviceData()
            }

            if (systemCaps.supportAlarmAudioConfig) {
                await getOnlintIpSpeakerList()
                await getIpSpeakerList()
            }

            closeLoading()

            if (!systemCaps.hotStandBy) {
                await changeAlarmOutChl()
                await changeDeviceChl()
                if (pageData.value.ipSpeakerId) {
                    await changeIPSpeaker()
                }
            }
        })

        return {
            localTableRef,
            pageTabs,
            alarmOutList,
            alarmOutFormData,
            editAlarmOutFormData,
            deviceList,
            localFormData,
            pageData,
            addAudio,
            deleteAudio,
            listenAudio,
            confirmAddAudio,
            closeAddAudio,
            handleRowClick,
            deleteLocalAudio,
            setDeviceData,
            setAlarmOutData,
            closeSchedulePop,
            changeAudioVolume,
            changeAlarmOutChl,
            deviceFormData,
            editDeviceFormData,
            changeDeviceChl,
            changeLoudSpeakerswitch,
            changeAudioOutputswitch,
            changeTab,
            setLocalAudio,
            listenLocalAudio,
            ipSepeakerList,
            ipSpeakerFormData,
            changeIPSpeaker,
            setIpSpeakerSchedule,
            setIpSpeakerVolume,
            handleSelectionChange,
        }
    },
})
