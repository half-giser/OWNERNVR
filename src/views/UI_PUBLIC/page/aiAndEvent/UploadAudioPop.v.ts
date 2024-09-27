/*
 * @Description: 事件通知——声音——ipc/local添加语音文件弹窗
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-14 15:48:05
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-09-26 15:38:31
 */
import { type AudioAlarmOut } from '@/types/apiType/aiAndEvent'
import { type UploadFile } from 'element-plus'

export default defineComponent({
    props: {
        type: String,
        ipcAudioChl: String,
        ipcRowData: {
            type: Object,
            require: true,
        },
        handleAddVoiceList: {
            type: Function,
            require: true,
        },
    },
    emits: {
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()

        const pageData = ref({
            title: '',
            uploadAccept: '',
            audioFilesSizeTips: '',
            audioFormatTips: '',
            localFilesSizeTips: '',
            isIpcTipsShow: true,
            isLocalTipsShow: false,
            uploadFileName: '',
            btnApplyDisabled: true,
            uploadFile: {} as UploadFile,
        })
        const open = () => {
            pageData.value.title = prop.type == 'ipcAudio' ? Translate('IDCS_LOAD_WAV') : Translate('IDCS_LOAD_MP3')
            pageData.value.uploadAccept = prop.type == 'ipcAudio' ? '.wav' : '.mp3'

            pageData.value.uploadFile = {} as UploadFile
            pageData.value.uploadFileName = ''
            pageData.value.btnApplyDisabled = true

            const data = prop.ipcRowData as AudioAlarmOut
            if (prop.type == 'ipcAudio') {
                const audioFormat = '*.' + data.audioFormat + ',' + data.audioDepth + ',' + data.sampleRate + ',' + data.audioChannel
                pageData.value.audioFilesSizeTips = Translate('IDCS_FILE_SIZE_LIMIT_TIP').formatForLang(data.audioFileLimitSize, 10 - data.customeAudioNum)
                pageData.value.audioFormatTips = Translate('IDCS_FILE_FORMAT_LIMIT_TIP').formatForLang('', audioFormat)
            } else {
                pageData.value.isIpcTipsShow = false
                pageData.value.localFilesSizeTips = Translate('IDCS_FILE_MAX_SIZE_LIMIT_TIP').formatForLang('1.5MB')
                pageData.value.audioFormatTips = Translate('IDCS_FILE_FORMAT_LIMIT_TIP').formatForLang('', '*.mp3')
                pageData.value.isLocalTipsShow = true
            }
        }

        const uploadFile = (uploadFile: UploadFile) => {
            if (prop.type == 'nvrAudio' && uploadFile.name.indexOf('.mp3') == -1) {
                // 过滤非mp3文件
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_SELECT_MP3_FILE'),
                })
                return
            } else if (prop.type == 'ipcAudio' && uploadFile.name.indexOf('.wav') == -1) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_NO_CHOOSE_TDB_FILE').formatForLang('wav'),
                })
                return
            }
            pageData.value.uploadFile = uploadFile
            pageData.value.uploadFileName = uploadFile.name
            pageData.value.btnApplyDisabled = false
        }

        const apply = () => {
            const _file = pageData.value.uploadFile.raw
            const blob = new Blob([_file] as BlobPart[])
            fileToBase64(blob, async (data: string) => {
                const fileSize = base64FileSize(data)
                if (prop.type == 'ipcAudio') {
                    let audioFileLimitSize = prop?.ipcRowData?.audioFileLimitSize
                    audioFileLimitSize = (parseInt(audioFileLimitSize) / 1024).toFixed(2)
                    if (fileSize > audioFileLimitSize) {
                        showMsg(Translate('IDCS_OUT_FILE_SIZE'))
                        return
                    }
                    const sendXml = rawXml`
                    <content>
                        <chl id='${prop.ipcAudioChl as string}'>
                            <param>
                                <addAudioAlarm>
                                    <audioName><![CDATA[${pageData.value.uploadFileName}]]></audioName>
                                    <audioFileSize>${fileSize}</audioFileSize>
                                    <audioFileData><![CDATA[${data}]]></audioFileData>
                                </addAudioAlarm>
                            </param>
                        </chl>
                    </content>
                    `
                    const result = await addCustomizeAudioAlarm(sendXml)
                    const $ = queryXml(result)

                    if ($('/response/status').text() == 'success') {
                        ctx.emit('close')
                        const audioId = $('/response/content/param/id').text()
                        prop.handleAddVoiceList!(audioId, pageData.value.uploadFileName)
                    } else {
                        const errorCode = $('/response/errorCode').text()
                        handleErrorMsg(errorCode)
                    }
                } else {
                    if (Number(fileSize) > 1.5) {
                        // 上传的音乐文件必须小于1.5MB
                        showMsg(Translate('IDCS_OUT_FILE_SIZE'))
                        return
                    }
                    const sendXml = rawXml`
                    <content>
                        <item>
                            <name><![CDATA[${pageData.value.uploadFileName}]]></name>
                            <fileData><![CDATA[${data}]]></fileData>
                        </item>
                    </content>
                    `
                    const result = await addAlarmAudioCfg(sendXml)
                    const $ = queryXml(result)

                    if ($('/response/status').text() == 'success') {
                        ctx.emit('close')
                    } else {
                        const errorCode = $('/response/errorCode').text()
                        handleErrorMsg(errorCode)
                    }
                }
            })
        }

        const showMsg = (msg: string) => {
            openMessageTipBox({
                type: 'info',
                title: Translate('IDCS_INFO_TIP'),
                message: msg,
                showCancelButton: false,
            })
        }

        const handleErrorMsg = (errorCode: string) => {
            if (errorCode == '536871048') {
                showMsg(Translate('IDCS_OUT_FILE_SIZE'))
            } else if (errorCode == '536870970') {
                showMsg(Translate('IDCS_NAME_SAME'))
            } else if (errorCode == '536870982') {
                showMsg(Translate('IDCS_CONFIG_SPACE_NOT_ENOUGH'))
            } else if (errorCode == '536870931') {
                showMsg(Translate('IDCS_OCX_NET_DISCONNECT'))
            } else {
                showMsg(Translate('IDCS_AUDIO_FILE_TASK_ERROR').formatForLang(pageData.value.uploadFileName))
            }
        }

        return {
            pageData,
            open,
            uploadFile,
            apply,
        }
    },
})
