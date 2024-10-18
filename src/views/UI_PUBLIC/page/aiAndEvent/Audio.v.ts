/*
 * @Description: AI/事件——事件通知——声音
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-13 09:23:25
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-30 15:04:09
 */
import { ipcAudioForm, type AudioAlarmOut, type AudioDevice, type LocalTableRow } from '@/types/apiType/aiAndEvent'
import { QueryNodeListDto } from '@/types/apiType/channel'
import UploadAudioPop from './UploadAudioPop.vue'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'

export default defineComponent({
    components: {
        UploadAudioPop,
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()

        const Plugin = inject('Plugin') as PluginType
        const isSupportH5 = Plugin.IsSupportH5()

        const localTableRef = ref()

        const ipcAudioFormData = ref(new ipcAudioForm())
        const audioAlarmOutData: Record<string, AudioAlarmOut> = {}
        const audioDeviceData: Record<string, AudioDevice> = {}

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
            supportAlarmAudioConfig: systemCaps.supportAlarmAudioConfig == true,
            btnApplyDisabled: false,
            isImportAudioDialog: false,
            scheduleManagPopOpen: false,
            audioSchedule: '',
            originAudioSchedule: '',
            audioScheduleList: [] as SelectOption<string, string>[],
            localTableData: [] as LocalTableRow[],
        })

        // 获取语音播报信息
        const getAudioAlarmData = async () => {
            const queryNodeListDto = new QueryNodeListDto()
            queryNodeListDto.isSupportAudioAlarmOut = true
            queryNodeListDto.nodeType = 'chls'
            getChlList(queryNodeListDto).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    if ($('/response/content').attr('total') == '0') {
                        audioAlarmPageData.value.chlDisabled = true
                        changeAudioAlarmDataDisabled(true)

                        ipcAudioFormData.value.audioChecked = true
                    } else {
                        $('/response/content/item').forEach((item) => {
                            const $item = queryXml(item.element)
                            const id = item.attr('id') as string
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

            const success = $('/response/status').text() == 'success'

            const audioTypeList = [] as SelectOption<string, string>[]
            let customeAudioNum = 0 //保存已上传自定义声音的数量

            $('/response/types/audioAlarmType/enum').forEach((item) => {
                audioTypeList.push({
                    value: item.text(),
                    label: item.attr('value') as string,
                })
                if (Number(item.text()) >= 100) {
                    customeAudioNum++
                }
            })

            const langArr = [] as SelectOption<string, string>[]
            $('/response/types/audioLanguageType/enum').forEach((item) => {
                const langType = item.text()
                if (langType == 'en-us') {
                    langArr.push({ value: langType, label: Translate('IDCS_en_US') })
                } else if (langType == 'zh-cn') {
                    langArr.push({ value: langType, label: Translate('IDCS_zh_CN') })
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
                audioSwitch: success ? $('/response/content/chl/param/switch').text() : '',
                audioType: success ? $('/response/content/chl/param/audioType').text() : '',
                alarmTimes: success ? $('/response/content/chl/param/alarmTimes').text() : '',
                audioVolume: success ? $('/response/content/chl/param/audioVolume').text() : '',
                languageType: success ? $('/response/content/chl/param/languageType').text() : '',
                audioFormat: success ? $('/response/content/chl/param/audioParamLimit/audioFormat').text() : '',
                sampleRate: success ? $('/response/content/chl/param/audioParamLimit/sampleRate').text() : '',
                audioChannel: success ? $('/response/content/chl/param/audioParamLimit/audioChannel').text() : '',
                audioDepth: success ? $('/response/content/chl/param/audioParamLimit/audioDepth').text() : '',
                audioFileLimitSize: success ? ($('/response/content/chl/param/audioParamLimit/audioFileSize').text().split(' ').pop() as string) : '',
            }

            if (audioAlarmPageData.value.firstId == id) {
                ipcAudioFormData.value.audioChl = id
                handleAudioAlarmOutData(audioAlarmOutData[id])
            }
        }

        // 处理语音播报的数据，在初始化和通道改变时调用
        const handleAudioAlarmOutData = (data: AudioAlarmOut) => {
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
                    ipcAudioFormData.value.audioChecked = data.audioSwitch == 'true'
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
                    ipcAudioFormData.value.number = ''
                }

                if (data.audioVolume) {
                    ipcAudioFormData.value.volume = data.audioVolume
                    audioAlarmPageData.value.volumeDisabled = false
                } else {
                    audioAlarmPageData.value.volumeDisabled = true
                    ipcAudioFormData.value.volume = ''
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
                ipcAudioFormData.value.number = ''
                ipcAudioFormData.value.volume = ''
                ipcAudioFormData.value.language = ''
                changeAudioAlarmDataDisabled(true)
                ipcAudioFormData.value.audioChecked = true
            }
        }
        // 声音按钮若可勾选时，取消启用需要置灰语音、次数、音量、语言
        const setEnableList = (data: AudioAlarmOut) => {
            const audioCheckEnable = data.audioSwitch && data.audioSwitch == 'false' ? true : false

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
            audioAlarmOutData[ipcAudioFormData.value.audioChl].alarmTimes = ipcAudioFormData.value.number
            audioAlarmOutData[ipcAudioFormData.value.audioChl].editFlag = true
            pageData.value.btnApplyDisabled = false
        }

        const blurVolume = () => {
            audioAlarmOutData[ipcAudioFormData.value.audioChl].audioVolume = ipcAudioFormData.value.volume
            if (audioDeviceData[ipcAudioFormData.value.audioChl] && audioDeviceData[ipcAudioFormData.value.audioChl].audioOutEnabled) {
                audioDeviceData[ipcAudioFormData.value.audioChl].audioOutVolume = Number(ipcAudioFormData.value.volume)
                if (ipcAudioFormData.value.deviceChl == ipcAudioFormData.value.audioChl) {
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
                openMessageTipBox({
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
                    <id>${String(ipcAudioFormData.value.voice)}</id>
                    </deleteAudioAlarm>
                </param>
                </chl>
            </content>
            `
            const result = await deleteCustomizeAudioAlarm(sendXml)
            const $ = queryXml(result)

            if ($('/response/status').text() == 'success') {
                const chlId = ipcAudioFormData.value.audioChl
                audioAlarmPageData.value.audioTypeList = audioAlarmPageData.value.audioTypeList.filter((item) => item.value != ipcAudioFormData.value.voice)
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
                openMessageTipBox({
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
                    <id>${String(ipcAudioFormData.value.voice)}</id>
                    </auditionAudioAlarm>
                </param>
                </chl>
            </content>
            `
            const result = await auditionCustomizeAudioAlarm(sendXml)
            const $ = queryXml(result)

            if ($('/response/status').text() != 'success') {
                const errorCode = Number($('/response/errorCode').text())
                let msg = audioAlarmOutData[ipcAudioFormData.value.audioChl].name + Translate('IDCS_AUDITION_FAILED')
                if (errorCode === ErrorCode.USER_ERROR_GET_CONFIG_INFO_FAIL) msg += Translate('IDCS_GET_CFG_FAIL')
                openMessageTipBox({
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
                        <switch>${String(ipcAudioFormData.value.audioChecked)}</switch>
                        <audioType>${ipcAudioFormData.value.voice}</audioType>
                        <alarmTimes>${ipcAudioFormData.value.number}</alarmTimes>
                        <audioVolume>${ipcAudioFormData.value.volume}</audioVolume>
                        <languageType>${Number(ipcAudioFormData.value.voice) >= 100 ? 'customize' : ipcAudioFormData.value.language}</languageType>
                    </param>
                    </chl>
                </content>
                `
                const result = await editAudioAlarmOutCfg(sendXml)
                commSaveResponseHadler(result)
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
                    $('/response/content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const id = item.attr('id') as string
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
            const volume = $('/response/content/chl/param/volume')
            const $volume = queryXml(volume[0]?.element)

            const success = $('/response/status').text() == 'success'

            const encodeType = [] as SelectOption<string, string>[]
            $('/response/types/audioEncode/enum').forEach((item) => {
                encodeType.push({
                    value: item.text(),
                    label: item.text(),
                })
            })

            const inputType = [] as SelectOption<string, string>[]
            $('/response/types/audioInput/enum').forEach((item) => {
                inputType.push({
                    value: item.text(),
                    label: AUDIO_INPUT_MAPPING[item.text()],
                })
            })

            const outputType = [] as SelectOption<string, string>[]
            $('/response/types/audioOutput/enum').forEach((item) => {
                outputType.push({
                    value: item.text(),
                    label: AUDIO_OUTPUT_MAPPING[item.text()],
                })
            })

            audioDeviceData[id] = {
                successFlag: success,
                editFlag: false,
                id,
                name,
                audioEncodeType: encodeType,
                audioInputType: inputType,
                audioOutputType: outputType,
                audioInSwitch: success ? $('/response/content/chl/param/audioInSwitch').text() : '',
                audioEncode: success ? $('/response/content/chl/param/audioEncode').text() : '',
                audioInput: success ? $('/response/content/chl/param/audioInput').text() : '',
                loudSpeaker: success ? $('/response/content/chl/param/loudSpeaker').text() : '',
                audioOutput: success ? $('/response/content/chl/param/audioOutput').text() : '',
                micInVolume: success ? Number($volume('micInVolume').text()) : 0,
                linInVolume: success ? Number($volume('linInVolume').text()) : 0,
                audioOutVolume: success ? Number($volume('audioOutVolume').text()) : 0,
                micMaxValue: success ? ($volume('micInVolume').attr('max') ? Number($volume('micInVolume').attr('max')) : 100) : 100,
                linMaxValue: success ? ($volume('linInVolume').attr('max') ? Number($volume('linInVolume').attr('max')) : 100) : 100,
                audioOutMaxValue: success ? ($volume('audioOutVolume').attr('max') ? Number($volume('audioOutVolume').attr('max')) : 100) : 100,
                micOrLinEnabled: success ? $volume('micInVolume').length > 0 || $volume('linInVolume').length > 0 || false : false,
                audioOutEnabled: success ? $volume('audioOutVolume').length > 0 || false : false,
            }

            if (audioDevicePageData.value.firstId == id) {
                ipcAudioFormData.value.deviceChl = id
                handleAudioDeviceData(audioDeviceData[id])
            }
        }

        const handleAudioDeviceData = (data: AudioDevice) => {
            pageData.value.btnApplyDisabled = true
            ipcAudioFormData.value.deviceEnable = data.audioInSwitch ? data.audioInSwitch == 'true' : true

            if (data.successFlag) {
                audioDevicePageData.value.micMaxValue = data.audioInput == 'MIC' ? data.micMaxValue : data.linMaxValue
                ipcAudioFormData.value.micOrLinVolume = data.audioInput == 'MIC' ? data.micInVolume : data.linInVolume

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

        const deviceDataEnable = (data: AudioDevice) => {
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
            if (audioDeviceData[ipcAudioFormData.value.deviceChl].audioInput == 'MIC') {
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
                let sendXml = rawXml`
                <content>
                <chl id='${ipcAudioFormData.value.deviceChl}'>
                    <param>
                `
                if (ipcAudioFormData.value.deviceEnable) sendXml += `<audioInSwitch>${String(ipcAudioFormData.value.deviceEnable)}</audioInSwitch>`
                if (ipcAudioFormData.value.deviceAudioInput) sendXml += `<audioInput>${String(ipcAudioFormData.value.deviceAudioInput)}</audioInput>`
                if (ipcAudioFormData.value.deviceAudioOutput) sendXml += `<audioOutput>${String(ipcAudioFormData.value.deviceAudioOutput)}</audioOutput>`
                if (ipcAudioFormData.value.loudSpeaker) sendXml += `<loudSpeaker>${String(ipcAudioFormData.value.loudSpeaker)}</loudSpeaker>`
                if (ipcAudioFormData.value.audioEncode) sendXml += `<audioEncode>${String(ipcAudioFormData.value.audioEncode)}</audioEncode>`

                sendXml += rawXml`<volume>`

                if (audioDeviceData[ipcAudioFormData.value.deviceChl].micInVolume >= 0) sendXml += `<micInVolume>${String(audioDeviceData[ipcAudioFormData.value.deviceChl].micInVolume)}</micInVolume>`
                if (audioDeviceData[ipcAudioFormData.value.deviceChl].linInVolume >= 0) sendXml += `<linInVolume>${String(audioDeviceData[ipcAudioFormData.value.deviceChl].linInVolume)}</linInVolume>`
                if (ipcAudioFormData.value.outputVolume >= 0) sendXml += `<audioOutVolume>${String(ipcAudioFormData.value.outputVolume)}</audioOutVolume>`

                sendXml += rawXml`
                      </volume>
                    </param>
                    </chl>
                </content>
                `
                const result = await editAudioStreamConfig(sendXml)
                commSaveResponseHadler(result)
                closeLoading()
                audioDeviceData[ipcAudioFormData.value.deviceChl].editFlag = false
            }
        }

        const getScheduleList = async () => {
            pageData.value.audioScheduleList = await buildScheduleList()
            pageData.value.audioScheduleList.forEach((item) => {
                if ((item.value = '')) {
                    item.value = '{00000000-0000-0000-0000-000000000000}'
                }
            })
            console.log(pageData.value.audioScheduleList)
        }

        const getScheduleData = async () => {
            await getScheduleList()
            const result = await queryEventNotifyParam()

            commLoadResponseHandler(result, ($) => {
                pageData.value.audioSchedule = $('/response/content/triggerChannelAudioSchedule').attr('id') || '{00000000-0000-0000-0000-000000000000}'
                pageData.value.originAudioSchedule = pageData.value.audioSchedule
            })
        }

        const setScheduleData = async () => {
            let audioName = ''
            pageData.value.audioScheduleList.forEach((item) => {
                if (item.value == pageData.value.audioSchedule) {
                    audioName = item.label
                }
            })

            openLoading()
            const sendXml = rawXml`
                <content>
                    <triggerChannelAudioSchedule id='${pageData.value.audioSchedule}'>${audioName}</triggerChannelAudioSchedule>
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
                pageData.value.localTableData = $('/response/content/audioList/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id') as string,
                        index: item.attr('index') as string,
                        name: $item('/name').text(),
                        originalName: $item('/name').text(),
                        fileValid: $item('/fileValid').text(),
                    }
                })
            })
        }

        const handleRowClick = (rowData: LocalTableRow) => {
            localTableRef.value.clearSelection()
            localTableRef.value.toggleRowSelection(rowData, true)
        }

        const addLocalAudio = () => {
            const canAdd = handleClickAddAudio()
            if (canAdd) pageData.value.isImportAudioDialog = true
        }

        const deleteLocalAudio = async () => {
            const selectedId = localTableRef.value.getSelectionRows().map((item: LocalTableRow) => item.id)

            let sendXml = rawXml`<content>`
            selectedId.forEach((item: string) => {
                sendXml += rawXml`<item id='${item}'></item>`
            })
            sendXml += rawXml`</content>`

            const result = await deleteAlarmAudio(sendXml)
            commSaveResponseHadler(result)
        }

        const setData = async () => {
            await setAudioAlarmData()
            await setAudiDeviceData()
            if (pageData.value.audioSchedule != pageData.value.originAudioSchedule) {
                await setScheduleData()
            }
        }

        const handleSchedulePopClose = async () => {
            pageData.value.scheduleManagPopOpen = false
            await getScheduleData()
        }

        onMounted(async () => {
            openLoading()

            await getAudioAlarmData()
            await getAudioDeviceData()
            await getScheduleData()
            if (pageData.value.supportAlarmAudioConfig) {
                await getLocalTableData()
            }
            await getLocalTableData()

            closeLoading()
        })

        return {
            UploadAudioPop,
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
