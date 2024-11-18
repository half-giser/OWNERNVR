/*
 * @Description: AI/事件——事件通知——声音
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-13 09:23:25
 */
import { AlarmIpcAudioForm, type AlarmAudioAlarmOutDto, type AlarmAudioDevice, type AlarmLocalAudioDto } from '@/types/apiType/aiAndEvent'
import AudioUploadPop from './AudioUploadPop.vue'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    components: {
        AudioUploadPop,
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()

        const Plugin = inject('Plugin') as PluginType
        const isSupportH5 = Plugin.IsSupportH5()

        const localTableRef = ref<TableInstance>()

        const ipcAudioFormData = ref(new AlarmIpcAudioForm())
        const audioAlarmOutData: Record<string, AlarmAudioAlarmOutDto> = {}
        const audioDeviceData: Record<string, AlarmAudioDevice> = {}

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
                type: 'ipcAudio',
                name: 'ipcAudio',
                label: Translate('IDCS_CAMERA_AUDIO_ALARM'),
            },
            {
                type: 'nvrAudio',
                name: 'nvrAudio',
                label: Translate('IDCS_NVR_AUDIO_ALARM'),
            },
        ]

        const audioAlarmPageData = ref({
            chlAlarmOutList: [] as SelectOption<string, string>[],
            chlDisabled: false,
            audioCheckDisabled: false,
            voiceDisabled: false,
            addAudioDisabled: false,
            deleteAudioDisabled: false,
            listenAudioDisabled: false,
            numberDisabled: false,
            volumeDisabled: false,
            languageDisbaled: false,
            audioFilesSizeTips: '',
            audioFormatTips: '',
            audioTypeList: [] as SelectOption<string, string>[],
            langList: [] as SelectOption<string, string>[],
            queryFailTipsShow: false,
            firstId: '',
        })

        const audioDevicePageData = ref({
            resFailShow: false,
            chlAudioDevList: [] as SelectOption<string, string>[],
            deviceEnableDisabled: false,
            deviceAudioInputDisabled: false,
            micOrLinVolumeDisabled: false,
            loudSpeakerDisabled: false,
            deviceAudioOutputDisabled: false,
            outputVolumeDisabled: false,
            audioEncodeDisabled: false,
            audioInputList: [] as SelectOption<string, string>[],
            loudSpeakerList: [] as SelectOption<string, string>[],
            audioOutputList: [] as SelectOption<string, string>[],
            audioEncodeList: [] as SelectOption<string, string>[],
            firstId: '',
            micMaxValue: 100,
        })

        const pageData = ref({
            audioTab: 'ipcAudio',
            supportAlarmAudioConfig: systemCaps.supportAlarmAudioConfig,
            btnApplyDisabled: false,
            isImportAudioDialog: false,
            scheduleManagPopOpen: false,
            audioSchedule: '',
            originAudioSchedule: '',
            audioScheduleList: [] as SelectOption<string, string>[],
            localTableData: [] as AlarmLocalAudioDto[],
        })

        // 获取语音播报信息
        const getAudioAlarmData = async () => {
            getChlList({
                isSupportAudioAlarmOut: true,
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    if ($('//content').attr('total') === '0') {
                        audioAlarmPageData.value.chlDisabled = true
                        changeAudioAlarmDataDisabled(true)

                        ipcAudioFormData.value.audioChecked = true
                    } else {
                        $('//content/item').forEach((item) => {
                            const $item = queryXml(item.element)
                            const id = item.attr('id')
                            const name = $item('name').text()
                            audioAlarmPageData.value.chlAlarmOutList.push({
                                value: id,
                                label: name,
                            })
                            getAudioAlarmDataById(id, name)
                        })
                        audioAlarmPageData.value.firstId = audioAlarmPageData.value.chlAlarmOutList[0].value
                    }
                })
            })
        }

        const getAudioAlarmDataById = async (id: string, name: string) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${id}</chlId>
                </condition>
                <requireField>
                    <param></param>
                </requireField>
            `
            const result = await queryAudioAlarmOutCfg(sendXml)
            const $ = queryXml(result)

            const success = $('//status').text() === 'success'

            let customeAudioNum = 0 //保存已上传自定义声音的数量
            const audioTypeList = $('//types/audioAlarmType/enum').map((item) => {
                if (item.text().num() >= 100) {
                    customeAudioNum++
                }
                return {
                    value: item.text(),
                    label: item.attr('value'),
                }
            })

            const langArr = [] as SelectOption<string, string>[]
            $('//types/audioLanguageType/enum').forEach((item) => {
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

            audioAlarmOutData[id] = {
                successFlag: success,
                editFlag: false,
                id,
                name,
                audioTypeList: audioTypeList,
                customeAudioNum: customeAudioNum,
                langArr: langArr,
                audioSwitch: success ? $('//content/chl/param/switch').text() : '',
                audioType: success ? $('//content/chl/param/audioType').text() : '',
                alarmTimes: success ? $('//content/chl/param/alarmTimes').text().num() : 1,
                audioVolume: success ? $('//content/chl/param/audioVolume').text().num() : 0,
                languageType: success ? $('//content/chl/param/languageType').text() : '',
                audioFormat: success ? $('//content/chl/param/audioParamLimit/audioFormat').text() : '',
                sampleRate: success ? $('//content/chl/param/audioParamLimit/sampleRate').text() : '',
                audioChannel: success ? $('//content/chl/param/audioParamLimit/audioChannel').text() : '',
                audioDepth: success ? $('//content/chl/param/audioParamLimit/audioDepth').text() : '',
                audioFileLimitSize: success ? $('//content/chl/param/audioParamLimit/audioFileSize').text().split(' ').pop()! : '',
            }

            if (audioAlarmPageData.value.firstId === id) {
                ipcAudioFormData.value.audioChl = id
                handleAudioAlarmOutData(audioAlarmOutData[id])
            }
        }

        // 处理语音播报的数据，在初始化和通道改变时调用
        const handleAudioAlarmOutData = (data: AlarmAudioAlarmOutDto) => {
            pageData.value.btnApplyDisabled = true
            if (data && data.successFlag) {
                const audioFormat = '*.' + data.audioFormat + ',' + data.audioDepth + ',' + data.sampleRate + ',' + data.audioChannel
                audioAlarmPageData.value.audioFilesSizeTips = Translate('IDCS_FILE_SIZE_LIMIT_TIP').formatForLang(data.audioFileLimitSize, 1)
                audioAlarmPageData.value.audioFormatTips = Translate('IDCS_FILE_FORMAT_LIMIT_TIP').formatForLang('', audioFormat)

                audioAlarmPageData.value.audioTypeList = data.audioTypeList.map((item) => {
                    return {
                        value: item.value,
                        label: item.label,
                    }
                })
                audioAlarmPageData.value.langList = data.langArr.map((item) => {
                    return {
                        value: item.value,
                        label: item.label,
                    }
                })

                if (Number(data.audioType) >= 100) {
                    audioAlarmPageData.value.deleteAudioDisabled = false
                    audioAlarmPageData.value.languageDisbaled = true
                } else {
                    audioAlarmPageData.value.deleteAudioDisabled = true
                    audioAlarmPageData.value.languageDisbaled = false
                }

                audioAlarmPageData.value.listenAudioDisabled = false
                audioAlarmPageData.value.addAudioDisabled = false

                if (data.audioSwitch) {
                    ipcAudioFormData.value.audioChecked = data.audioSwitch === 'true'
                    audioAlarmPageData.value.audioCheckDisabled = false
                } else {
                    ipcAudioFormData.value.audioChecked = true
                    audioAlarmPageData.value.audioCheckDisabled = true
                }

                if (data.audioType) {
                    ipcAudioFormData.value.voice = data.audioType
                    audioAlarmPageData.value.voiceDisabled = false
                } else {
                    audioAlarmPageData.value.voiceDisabled = true
                    ipcAudioFormData.value.voice = ''
                }

                if (data.alarmTimes) {
                    ipcAudioFormData.value.number = data.alarmTimes
                    audioAlarmPageData.value.numberDisabled = false
                } else {
                    audioAlarmPageData.value.numberDisabled = true
                    ipcAudioFormData.value.number = undefined
                }

                if (data.audioVolume) {
                    ipcAudioFormData.value.volume = data.audioVolume
                    audioAlarmPageData.value.volumeDisabled = false
                } else {
                    audioAlarmPageData.value.volumeDisabled = true
                    ipcAudioFormData.value.volume = undefined
                }

                if (data.languageType) {
                    ipcAudioFormData.value.language = data.languageType
                    if (Number(data.audioType) >= 100) {
                        audioAlarmPageData.value.languageDisbaled = true
                    } else {
                        audioAlarmPageData.value.languageDisbaled = false
                    }
                } else {
                    audioAlarmPageData.value.languageDisbaled = true
                    ipcAudioFormData.value.language = ''
                }

                setEnableList(data)
                audioAlarmPageData.value.queryFailTipsShow = false
            } else {
                audioAlarmPageData.value.queryFailTipsShow = true
                audioAlarmPageData.value.langList = []
                audioAlarmPageData.value.langList.push({
                    value: 'en-us',
                    label: Translate('IDCS_en_US'),
                })
                ipcAudioFormData.value.audioChecked = true
                ipcAudioFormData.value.voice = ''
                ipcAudioFormData.value.number = undefined
                ipcAudioFormData.value.volume = undefined
                ipcAudioFormData.value.language = ''
                changeAudioAlarmDataDisabled(true)
                ipcAudioFormData.value.audioChecked = true
            }
        }

        // 声音按钮若可勾选时，取消启用需要置灰语音、次数、音量、语言
        const setEnableList = (data: AlarmAudioAlarmOutDto) => {
            const audioCheckEnable = data.audioSwitch && data.audioSwitch === 'false' ? true : false

            if (data.audioType) audioAlarmPageData.value.voiceDisabled = audioCheckEnable
            if (data.alarmTimes) audioAlarmPageData.value.numberDisabled = audioCheckEnable
            if (data.audioVolume) audioAlarmPageData.value.volumeDisabled = audioCheckEnable
            if (data.languageType && Number(data.audioType) < 100) audioAlarmPageData.value.languageDisbaled = audioCheckEnable
            if (data.successFlag) {
                audioAlarmPageData.value.addAudioDisabled = audioCheckEnable
                audioAlarmPageData.value.listenAudioDisabled = audioCheckEnable
            }
            if (Number(data.audioType) >= 100) audioAlarmPageData.value.deleteAudioDisabled = audioCheckEnable
        }

        // 在声音启用改变的时候设置其他项
        const changeAudioAlarmDataDisabled = (enable: boolean) => {
            audioAlarmPageData.value.audioCheckDisabled = enable
            audioAlarmPageData.value.voiceDisabled = enable
            audioAlarmPageData.value.addAudioDisabled = enable
            audioAlarmPageData.value.deleteAudioDisabled = enable
            audioAlarmPageData.value.listenAudioDisabled = enable
            audioAlarmPageData.value.numberDisabled = enable
            audioAlarmPageData.value.volumeDisabled = enable
            audioAlarmPageData.value.languageDisbaled = enable
        }

        const changeChl = () => {
            handleAudioAlarmOutData(audioAlarmOutData[ipcAudioFormData.value.audioChl])
        }

        const changeAudioCheck = () => {
            audioAlarmOutData[ipcAudioFormData.value.audioChl].audioSwitch = ipcAudioFormData.value.audioChecked ? 'true' : 'false'
            setEnableList(audioAlarmOutData[ipcAudioFormData.value.audioChl])
            audioAlarmOutData[ipcAudioFormData.value.audioChl].editFlag = true
            pageData.value.btnApplyDisabled = false
        }

        const changeVioce = () => {
            if (Number(ipcAudioFormData.value.voice) >= 100) {
                // 自定义的音频（>=100）可以删除，语言类型禁用
                audioAlarmPageData.value.deleteAudioDisabled = false
                audioAlarmPageData.value.languageDisbaled = true
                ipcAudioFormData.value.language = ''
            } else {
                audioAlarmPageData.value.deleteAudioDisabled = true
                audioAlarmPageData.value.languageDisbaled = false
                audioAlarmOutData[ipcAudioFormData.value.audioChl].languageType = audioAlarmPageData.value.langList[0].value
                ipcAudioFormData.value.language = audioAlarmPageData.value.langList[0].value
            }
            audioAlarmOutData[ipcAudioFormData.value.audioChl].audioType = String(ipcAudioFormData.value.voice)
            audioAlarmOutData[ipcAudioFormData.value.audioChl].editFlag = true
            pageData.value.btnApplyDisabled = false
        }

        const blurNumber = () => {
            audioAlarmOutData[ipcAudioFormData.value.audioChl].alarmTimes = ipcAudioFormData.value.number as number
            audioAlarmOutData[ipcAudioFormData.value.audioChl].editFlag = true
            pageData.value.btnApplyDisabled = false
        }

        const blurVolume = () => {
            audioAlarmOutData[ipcAudioFormData.value.audioChl].audioVolume = ipcAudioFormData.value.volume as number
            if (audioDeviceData[ipcAudioFormData.value.audioChl] && audioDeviceData[ipcAudioFormData.value.audioChl].audioOutEnabled) {
                audioDeviceData[ipcAudioFormData.value.audioChl].audioOutVolume = Number(ipcAudioFormData.value.volume)
                if (ipcAudioFormData.value.deviceChl === ipcAudioFormData.value.audioChl) {
                    ipcAudioFormData.value.outputVolume = Number(ipcAudioFormData.value.volume)
                }
            }
            audioAlarmOutData[ipcAudioFormData.value.audioChl].editFlag = true
            pageData.value.btnApplyDisabled = false
        }

        const changeLanguage = () => {
            audioAlarmOutData[ipcAudioFormData.value.audioChl].languageType = ipcAudioFormData.value.language
            audioAlarmOutData[ipcAudioFormData.value.audioChl].editFlag = true
            pageData.value.btnApplyDisabled = false
        }

        const handleClickAddAudio = () => {
            if (isSupportH5 && isHttpsLogin()) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_NOT_SUPPORTED').formatForLang('https', Translate('IDCS_UPLOAD_VOICE')) + '!',
                })
                return false
            }
            return true
        }

        const addAudio = () => {
            const canAdd = handleClickAddAudio()
            if (canAdd) pageData.value.isImportAudioDialog = true
        }

        const deleteAudio = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id='${ipcAudioFormData.value.audioChl}'>
                    <param>
                        <deleteAudioAlarm>
                        <id>${ipcAudioFormData.value.voice}</id>
                        </deleteAudioAlarm>
                    </param>
                    </chl>
                </content>
            `
            const result = await deleteCustomizeAudioAlarm(sendXml)
            const $ = queryXml(result)

            if ($('//status').text() === 'success') {
                const chlId = ipcAudioFormData.value.audioChl
                audioAlarmPageData.value.audioTypeList = audioAlarmPageData.value.audioTypeList.filter((item) => item.value !== ipcAudioFormData.value.voice)
                audioAlarmPageData.value.deleteAudioDisabled = true
                audioAlarmPageData.value.languageDisbaled = false
                audioAlarmOutData[chlId].languageType = audioAlarmPageData.value.langList[0].value
                ipcAudioFormData.value.language = audioAlarmPageData.value.langList[0].value
                ipcAudioFormData.value.voice = '1'
                audioAlarmOutData[chlId].audioType = '1'
                audioAlarmOutData[chlId].editFlag = true
                audioAlarmOutData[chlId].customeAudioNum--

                pageData.value.btnApplyDisabled = false
            } else {
                openMessageBox({
                    type: 'error',
                    message: Translate('IDCS_DELETE_FAIL'),
                })
            }
        }

        const listenAudio = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id='${ipcAudioFormData.value.audioChl}'>
                    <param>
                        <auditionAudioAlarm>
                        <audioType>${ipcAudioFormData.value.voice}</audioType>
                        </auditionAudioAlarm>
                    </param>
                    </chl>
                </content>
            `
            const result = await auditionCustomizeAudioAlarm(sendXml)
            const $ = queryXml(result)

            if ($('//status').text() !== 'success') {
                const errorCode = $('//errorCode').text().num()
                let msg = audioAlarmOutData[ipcAudioFormData.value.audioChl].name + Translate('IDCS_AUDITION_FAILED')
                if (errorCode === ErrorCode.USER_ERROR_GET_CONFIG_INFO_FAIL) msg += Translate('IDCS_GET_CFG_FAIL')
                openMessageBox({
                    type: 'info',
                    message: msg,
                })
            }
        }

        const handleAddVoiceList = (audioId: string, fileName: string) => {
            audioAlarmPageData.value.audioTypeList.push({
                value: audioId,
                label: fileName,
            })
            audioAlarmOutData[ipcAudioFormData.value.audioChl].customeAudioNum++
        }

        const setAudioAlarmData = async () => {
            if (audioAlarmOutData[ipcAudioFormData.value.audioChl].successFlag && audioAlarmOutData[ipcAudioFormData.value.audioChl].editFlag) {
                const sendXml = rawXml`
                    <content>
                        <chl id='${ipcAudioFormData.value.audioChl}'>
                        <param>
                            <name><![CDATA[${audioAlarmOutData[ipcAudioFormData.value.audioChl].name}]]></name>
                            <switch>${ipcAudioFormData.value.audioChecked}</switch>
                            <audioType>${ipcAudioFormData.value.voice}</audioType>
                            <alarmTimes>${ipcAudioFormData.value.number || 0}</alarmTimes>
                            <audioVolume>${ipcAudioFormData.value.volume || 0}</audioVolume>
                            <languageType>${Number(ipcAudioFormData.value.voice) >= 100 ? 'customize' : ipcAudioFormData.value.language}</languageType>
                        </param>
                        </chl>
                    </content>
                `
                await editAudioAlarmOutCfg(sendXml)
                audioAlarmOutData[ipcAudioFormData.value.audioChl].editFlag = false
            }
        }

        // 摄像机声音（ipc）—— 声音设备相关方法

        const getAudioDeviceData = async () => {
            getChlList({
                isSupportAudioDev: true,
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    changeAudioDeviceDataDisabled(true) // "声音设备"配置默认全置灰
                    $('//content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const id = item.attr('id')
                        const name = $item('name').text()
                        audioDevicePageData.value.chlAudioDevList.push({
                            value: id,
                            label: name,
                        })
                        getAudioDeviceDataById(id, name)
                    })
                    audioDevicePageData.value.firstId = audioDevicePageData.value.chlAudioDevList[0] && audioDevicePageData.value.chlAudioDevList[0].value
                })
            })
        }

        const getAudioDeviceDataById = async (id: string, name: string) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${id}</chlId>
                </condition>
                <requireField>
                    <param></param>
                </requireField>
            `
            const result = await queryAudioStreamConfig(sendXml)
            const $ = queryXml(result)
            const volume = $('//content/chl/param/volume')
            const $volume = volume.length ? queryXml(volume[0].element) : $

            const success = $('//status').text() === 'success'

            audioDeviceData[id] = {
                successFlag: success,
                editFlag: false,
                id,
                name,
                audioEncodeType: $('//types/audioEncode/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: item.text(),
                    }
                }),
                audioInputType: $('//types/audioInput/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: AUDIO_INPUT_MAPPING[item.text()],
                    }
                }),
                audioOutputType: $('//types/audioOutput/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: AUDIO_OUTPUT_MAPPING[item.text()],
                    }
                }),
                audioInSwitch: success ? $('//content/chl/param/audioInSwitch').text() : '',
                audioEncode: success ? $('//content/chl/param/audioEncode').text() : '',
                audioInput: success ? $('//content/chl/param/audioInput').text() : '',
                loudSpeaker: success ? $('//content/chl/param/loudSpeaker').text() : '',
                audioOutput: success ? $('//content/chl/param/audioOutput').text() : '',
                micInVolume: volume.length ? $volume('micInVolume').text().num() : 0,
                linInVolume: volume.length ? $volume('linInVolume').text().num() : 0,
                audioOutVolume: volume.length ? $volume('audioOutVolume').text().num() : 0,
                micMaxValue: volume.length ? ($volume('micInVolume').attr('max') ? $volume('micInVolume').attr('max').num() : 100) : 100,
                linMaxValue: volume.length ? ($volume('linInVolume').attr('max') ? $volume('linInVolume').attr('max').num() : 100) : 100,
                audioOutMaxValue: volume.length ? ($volume('audioOutVolume').attr('max') ? $volume('audioOutVolume').attr('max').num() : 100) : 100,
                micOrLinEnabled: volume.length ? $volume('micInVolume').length > 0 || $volume('volume/linInVolume').length > 0 || false : false,
                audioOutEnabled: volume.length ? $volume('audioOutVolume').length > 0 || false : false,
            }

            if (audioDevicePageData.value.firstId === id) {
                ipcAudioFormData.value.deviceChl = id
                handleAudioDeviceData(audioDeviceData[id])
            }
        }

        const handleAudioDeviceData = (data: AlarmAudioDevice) => {
            pageData.value.btnApplyDisabled = true
            ipcAudioFormData.value.deviceEnable = data.audioInSwitch ? data.audioInSwitch === 'true' : true

            if (data.successFlag) {
                audioDevicePageData.value.micMaxValue = data.audioInput === 'MIC' ? data.micMaxValue : data.linMaxValue
                ipcAudioFormData.value.micOrLinVolume = data.audioInput === 'MIC' ? data.micInVolume : data.linInVolume

                audioDevicePageData.value.audioInputList = data.audioInputType
                audioDevicePageData.value.loudSpeakerList = data.audioOutputType
                audioDevicePageData.value.audioOutputList = data.audioOutputType
                audioDevicePageData.value.audioEncodeList = data.audioEncodeType

                audioDevicePageData.value.resFailShow = false

                ipcAudioFormData.value.deviceAudioInput = data.audioInput
                ipcAudioFormData.value.loudSpeaker = data.loudSpeaker
                ipcAudioFormData.value.deviceAudioOutput = data.audioOutput
                ipcAudioFormData.value.audioEncode = data.audioEncode
                ipcAudioFormData.value.outputVolume = data.audioOutVolume
            } else {
                ipcAudioFormData.value.deviceAudioInput = ''
                ipcAudioFormData.value.micOrLinVolume = 0
                ipcAudioFormData.value.loudSpeaker = ''
                ipcAudioFormData.value.deviceAudioOutput = ''
                ipcAudioFormData.value.outputVolume = 0
                ipcAudioFormData.value.audioEncode = ''
                audioDevicePageData.value.resFailShow = true
            }

            deviceDataEnable(data)

            if (!ipcAudioFormData.value.deviceEnable) {
                changeAudioDeviceDataDisabled(true)
            }
        }

        const deviceDataEnable = (data: AlarmAudioDevice) => {
            if (!data.successFlag || !data.audioInSwitch) {
                audioDevicePageData.value.deviceEnableDisabled = true
            } else {
                audioDevicePageData.value.deviceEnableDisabled = false
            }

            audioDevicePageData.value.deviceAudioInputDisabled = !data.audioInput ? true : false
            audioDevicePageData.value.micOrLinVolumeDisabled = !data.micOrLinEnabled ? true : false
            audioDevicePageData.value.loudSpeakerDisabled = !data.loudSpeaker ? true : false
            audioDevicePageData.value.deviceAudioOutputDisabled = !data.audioOutput ? true : false
            audioDevicePageData.value.outputVolumeDisabled = !data.audioOutEnabled ? true : false
            audioDevicePageData.value.audioEncodeDisabled = !data.audioEncode ? true : false
        }

        const changeAudioDeviceDataDisabled = (enable: boolean) => {
            audioDevicePageData.value.deviceAudioInputDisabled = enable
            audioDevicePageData.value.micOrLinVolumeDisabled = enable
            audioDevicePageData.value.loudSpeakerDisabled = enable
            audioDevicePageData.value.deviceAudioOutputDisabled = enable
            audioDevicePageData.value.outputVolumeDisabled = enable
            audioDevicePageData.value.audioEncodeDisabled = enable
        }

        const hasEdited = () => {
            audioDeviceData[ipcAudioFormData.value.deviceChl].editFlag = true
            pageData.value.btnApplyDisabled = false
        }

        // form项改变触发事件
        const chagneDeviceChl = () => {
            handleAudioDeviceData(audioDeviceData[ipcAudioFormData.value.deviceChl])
        }

        const changeDeviceEnable = () => {
            audioDeviceData[ipcAudioFormData.value.deviceChl].audioInSwitch = ipcAudioFormData.value.deviceEnable ? 'true' : 'false'
            if (ipcAudioFormData.value.deviceEnable) {
                deviceDataEnable(audioDeviceData[ipcAudioFormData.value.deviceChl])
            } else {
                changeAudioDeviceDataDisabled(true)
            }
            hasEdited()
        }

        const chagneAudioInput = () => {
            audioDeviceData[ipcAudioFormData.value.deviceChl].audioInput = ipcAudioFormData.value.deviceAudioInput
            hasEdited()
        }

        const changeMicOrLinVolume = () => {
            if (audioDeviceData[ipcAudioFormData.value.deviceChl].audioInput === 'MIC') {
                audioDeviceData[ipcAudioFormData.value.deviceChl].micInVolume = ipcAudioFormData.value.micOrLinVolume
            } else {
                audioDeviceData[ipcAudioFormData.value.deviceChl].linInVolume = ipcAudioFormData.value.micOrLinVolume
            }
            hasEdited()
        }

        const changeLoudSpeaker = () => {
            audioDeviceData[ipcAudioFormData.value.deviceChl].loudSpeaker = ipcAudioFormData.value.loudSpeaker
            hasEdited()
        }

        const chagneAudioOutput = () => {
            audioDeviceData[ipcAudioFormData.value.deviceChl].audioOutput = ipcAudioFormData.value.deviceAudioOutput
            hasEdited()
        }

        const changeOutputVolume = () => {
            audioDeviceData[ipcAudioFormData.value.deviceChl].audioOutVolume = ipcAudioFormData.value.outputVolume
            hasEdited()
        }

        const changeAudioEncode = () => {
            audioDeviceData[ipcAudioFormData.value.deviceChl].audioEncode = ipcAudioFormData.value.audioEncode
            hasEdited()
        }

        const setAudiDeviceData = async () => {
            if (audioDeviceData[ipcAudioFormData.value.deviceChl].successFlag && audioDeviceData[ipcAudioFormData.value.deviceChl].editFlag) {
                openLoading()
                const sendXml = rawXml`
                    <content>
                        <chl id='${ipcAudioFormData.value.deviceChl}'>
                            <param>
                                ${ternary(ipcAudioFormData.value.deviceEnable, `<audioInSwitch>${ipcAudioFormData.value.deviceEnable}</audioInSwitch>`)}
                                ${ternary(ipcAudioFormData.value.deviceAudioInput, `<audioInput>${ipcAudioFormData.value.deviceAudioInput}</audioInput>`)}
                                ${ternary(ipcAudioFormData.value.deviceAudioOutput, `<audioOutput>${ipcAudioFormData.value.deviceAudioOutput}</audioOutput>`)}
                                ${ternary(ipcAudioFormData.value.loudSpeaker, `<loudSpeaker>${ipcAudioFormData.value.loudSpeaker}</loudSpeaker>`)}
                                ${ternary(ipcAudioFormData.value.audioEncode, `<audioEncode>${ipcAudioFormData.value.audioEncode}</audioEncode>`)}
                                <volume>
                                    ${ternary(audioDeviceData[ipcAudioFormData.value.deviceChl].micInVolume >= 0, `<micInVolume>${audioDeviceData[ipcAudioFormData.value.deviceChl].micInVolume}</micInVolume>`)}
                                    ${ternary(audioDeviceData[ipcAudioFormData.value.deviceChl].linInVolume >= 0, `<linInVolume>${audioDeviceData[ipcAudioFormData.value.deviceChl].linInVolume}</linInVolume>`)}
                                    ${ternary(ipcAudioFormData.value.outputVolume >= 0, `<audioOutVolume>${ipcAudioFormData.value.outputVolume}</audioOutVolume>`)}
                                </volume>
                            </param>
                        </chl>
                    </content>
                `
                await editAudioStreamConfig(sendXml)
                closeLoading()
                audioDeviceData[ipcAudioFormData.value.deviceChl].editFlag = false
            }
        }

        const getScheduleData = async () => {
            pageData.value.audioScheduleList = await buildScheduleList()

            const result = await queryEventNotifyParam()
            commLoadResponseHandler(result, ($) => {
                const scheduleId = $('//content/triggerChannelAudioSchedule').attr('id')
                // 判断返回的排程是否存在，若不存在设为空ID
                if (scheduleId) {
                    pageData.value.audioSchedule = scheduleId
                    pageData.value.originAudioSchedule = scheduleId
                } else {
                    const scheduleName = $('//content/triggerChannelAudioSchedule').text()
                    const find = pageData.value.audioScheduleList.find((item) => item.label === scheduleName)
                    if (find) {
                        pageData.value.audioSchedule = find.value
                        pageData.value.originAudioSchedule = find.value
                    }
                }
            })
        }

        const setScheduleData = async () => {
            openLoading()
            // <triggerChannelAudioSchedule id='${pageData.value.audioSchedule}'>${audioName}</triggerChannelAudioSchedule>
            // 这里删掉了原代码中传的audioName，因为在audioName = <无>的情况下会导致解析错误
            const sendXml = rawXml`
                <content>
                    <triggerChannelAudioSchedule id='${pageData.value.audioSchedule}'></triggerChannelAudioSchedule>
                </content>
            `
            await editEventNotifyParam(sendXml)
            // commSaveResponseHadler(result)
            pageData.value.btnApplyDisabled = true
            closeLoading()
        }

        // 获取本地声音报警数据
        const getLocalTableData = async () => {
            const result = await queryAlarmAudioCfg()

            commLoadResponseHandler(result, ($) => {
                pageData.value.localTableData = $('//content/audioList/item').map((item) => {
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

        const handleRowClick = (rowData: AlarmLocalAudioDto) => {
            localTableRef.value!.clearSelection()
            localTableRef.value!.toggleRowSelection(rowData, true)
        }

        const addLocalAudio = () => {
            const canAdd = handleClickAddAudio()
            if (canAdd) pageData.value.isImportAudioDialog = true
        }

        const deleteLocalAudio = async () => {
            const selectedId = (localTableRef.value!.getSelectionRows() as AlarmLocalAudioDto[]).map((item) => item.id)

            if (selectedId.length) {
                const sendXml = rawXml`
                    <content>
                        ${selectedId.map((item) => `<item id='${item}'></item>`).join('')}
                    </content>
                `

                const result = await deleteAlarmAudio(sendXml)
                commSaveResponseHadler(result)
            }
        }

        const setData = async () => {
            openLoading()
            await setAudioAlarmData()
            await setAudiDeviceData()
            if (pageData.value.audioSchedule !== pageData.value.originAudioSchedule) {
                await setScheduleData()
            }
            pageData.value.btnApplyDisabled = true
            closeLoading()
        }

        const handleSchedulePopClose = async () => {
            pageData.value.scheduleManagPopOpen = false
            await getScheduleData()
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
            AudioUploadPop,
            ScheduleManagPop,
            localTableRef,
            pageTabs,
            ipcAudioFormData,
            audioAlarmOutData,
            audioAlarmPageData,
            audioDevicePageData,
            pageData,
            changeChl,
            changeAudioCheck,
            changeVioce,
            blurNumber,
            blurVolume,
            changeLanguage,
            addAudio,
            deleteAudio,
            listenAudio,
            handleAddVoiceList,
            chagneDeviceChl,
            changeDeviceEnable,
            chagneAudioInput,
            changeMicOrLinVolume,
            changeLoudSpeaker,
            chagneAudioOutput,
            changeOutputVolume,
            changeAudioEncode,
            handleRowClick,
            addLocalAudio,
            deleteLocalAudio,
            setData,
            handleSchedulePopClose,
        }
    },
})
