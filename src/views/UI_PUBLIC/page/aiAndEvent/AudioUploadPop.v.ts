/*
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-14 15:48:05
 * @Description: 事件通知——声音——ipc/local添加语音文件弹窗
 */
import { AlarmAudioAlarmOutDto } from '@/types/apiType/aiAndEvent'

export default defineComponent({
    props: {
        type: {
            type: String,
            required: true,
        },
        ipcAudioChl: {
            type: String,
            required: true,
        },
        ipcRowData: {
            type: Object as PropType<AlarmAudioAlarmOutDto>,
            required: true,
            default: () => new AlarmAudioAlarmOutDto(),
        },
    },
    emits: {
        apply(audioId: number, fileName: string) {
            return typeof audioId === 'number' && typeof fileName === 'string'
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

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
        })

        let rawFile: File | undefined = undefined

        const open = () => {
            pageData.value.title = prop.type === 'ipcAudio' ? Translate('IDCS_LOAD_WAV') : Translate('IDCS_LOAD_MP3')
            pageData.value.uploadAccept = prop.type === 'ipcAudio' ? '.wav' : '.mp3'

            rawFile = undefined
            pageData.value.uploadFileName = ''
            pageData.value.btnApplyDisabled = true

            const data = prop.ipcRowData
            if (prop.type === 'ipcAudio') {
                pageData.value.isIpcTipsShow = true
                pageData.value.isLocalTipsShow = false
                const audioFormat = '*.' + data.audioFormat + ',' + data.audioDepth + ',' + data.sampleRate + ',' + data.audioChannel
                pageData.value.audioFilesSizeTips = Translate('IDCS_FILE_SIZE_LIMIT_TIP').formatForLang(data.audioFileLimitSize, 10 - data.customeAudioNum)
                pageData.value.audioFormatTips = Translate('IDCS_FILE_FORMAT_LIMIT_TIP').formatForLang('', audioFormat)
            } else {
                pageData.value.isIpcTipsShow = false
                pageData.value.isLocalTipsShow = true
                pageData.value.localFilesSizeTips = Translate('IDCS_FILE_MAX_SIZE_LIMIT_TIP').formatForLang('1.5MB')
                pageData.value.audioFormatTips = Translate('IDCS_FILE_FORMAT_LIMIT_TIP').formatForLang('', '*.mp3')
            }
        }

        const uploadFile = (e: Event) => {
            const files = (e.target as HTMLInputElement).files
            if (!files?.length) {
                return
            }

            if (prop.type === 'nvrAudio' && files[0].name.indexOf('.mp3') === -1) {
                // 过滤非mp3文件
                openMessageBox(Translate('IDCS_SELECT_MP3_FILE'))
                return
            } else if (prop.type === 'ipcAudio' && files[0].name.indexOf('.wav') === -1) {
                openMessageBox(Translate('IDCS_NO_CHOOSE_TDB_FILE').formatForLang('wav'))
                return
            }
            rawFile = files[0]
            pageData.value.uploadFileName = files[0].name
            pageData.value.btnApplyDisabled = false
        }

        const apply = () => {
            const _file = rawFile
            if (!_file) {
                return
            }
            const blob = new Blob([_file])
            fileToBase64(blob, async (data: string) => {
                const fileSize = base64FileSize(data)
                if (prop.type === 'ipcAudio') {
                    // let audioFileLimitSize = prop.ipcRowData.audioFileLimitSize
                    const audioFileLimitSize = (Number(prop.ipcRowData.audioFileLimitSize) / 1024).toFixed(2)
                    if (fileSize > audioFileLimitSize) {
                        openMessageBox(Translate('IDCS_OUT_FILE_SIZE'))
                        return
                    }
                    const sendXml = rawXml`
                        <content>
                            <chl id='${prop.ipcAudioChl}'>
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

                    if ($('status').text() === 'success') {
                        ctx.emit('close')
                        const audioId = $('content/param/id').text().num()
                        ctx.emit('apply', audioId, pageData.value.uploadFileName)
                    } else {
                        const errorCode = $('errorCode').text().num()
                        handleErrorMsg(errorCode)
                    }
                } else {
                    if (Number(fileSize) > 1.5) {
                        // 上传的音乐文件必须小于1.5MB
                        openMessageBox(Translate('IDCS_OUT_FILE_SIZE'))
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

                    if ($('status').text() === 'success') {
                        ctx.emit('close')
                    } else {
                        const errorCode = $('errorCode').text().num()
                        handleErrorMsg(errorCode)
                    }
                }
            })
        }

        const handleErrorMsg = (errorCode: number) => {
            if (errorCode === ErrorCode.USER_ERROR_CLIENT_LIMITED_BY_LITE_TYPE) {
                openMessageBox(Translate('IDCS_OUT_FILE_SIZE'))
            } else if (errorCode === ErrorCode.USER_ERROR_NAME_EXISTED) {
                openMessageBox(Translate('IDCS_NAME_SAME'))
            } else if (errorCode === ErrorCode.USER_ERROR_DEV_RESOURCE_LIMITED) {
                openMessageBox(Translate('IDCS_CONFIG_SPACE_NOT_ENOUGH'))
            } else if (errorCode === ErrorCode.USER_ERROR_NODE_NET_DISCONNECT) {
                openMessageBox(Translate('IDCS_OCX_NET_DISCONNECT'))
            } else {
                openMessageBox(Translate('IDCS_AUDIO_FILE_TASK_ERROR').formatForLang(pageData.value.uploadFileName))
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
