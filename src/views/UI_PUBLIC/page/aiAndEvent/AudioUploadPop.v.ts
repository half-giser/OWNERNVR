/*
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-14 15:48:05
 * @Description: 事件通知——声音——ipc/local添加语音文件弹窗
 */
export default defineComponent({
    props: {
        type: {
            type: String,
            required: true,
        },
        ipcData: {
            type: Object as PropType<AlarmAudioAlarmOutDto>,
            required: true,
            default: () => new AlarmAudioAlarmOutDto(),
        },
        format: {
            type: Array as PropType<string[]>,
            default: () => ['WAV'],
        },
        audioDepth: {
            type: String,
            default: '16bit',
        },
        sampleRate: {
            type: String,
            default: '',
        },
        audioChannel: {
            type: String,
            default: '',
        },
        fileLimitSize: {
            type: Number,
            default: 1.5 * 1024 * 1024,
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
            audioFilesSizeTips: '',
            isIpcTipsShow: true,
            isLocalTipsShow: false,
            uploadFileName: '',
            btnApplyDisabled: true,
        })

        let rawFile: File | undefined = undefined

        const accept = computed(() => {
            return prop.format.map((item) => '.' + item.toLowerCase()).join(',')
        })

        const tips = computed(() => {
            const arr = prop.format.map((item) => '*.' + item.toLowerCase())
            arr.push(prop.audioDepth, prop.sampleRate, prop.audioChannel)
            const result = arr.filter((item) => !!item).join(', ')
            return Translate('IDCS_FILE_FORMAT_LIMIT_TIP').formatForLang('', result)
        })

        const open = () => {
            pageData.value.title = prop.type === 'ipcAudio' ? Translate('IDCS_LOAD_WAV') : Translate('IDCS_LOAD_MP3')

            rawFile = undefined
            pageData.value.uploadFileName = ''
            pageData.value.btnApplyDisabled = true
        }

        const displayFileSize = computed(() => {
            let fileLimitSize = prop.fileLimitSize
            if (fileLimitSize > 1024) {
                fileLimitSize = fileLimitSize / 1024
                if (fileLimitSize > 1024) {
                    return fileLimitSize / 1024 + 'MB'
                } else {
                    return fileLimitSize + 'KB'
                }
            }
            return fileLimitSize + 'b'
        })

        const uploadFile = (e: Event) => {
            const files = (e.target as HTMLInputElement).files
            if (!files?.length) {
                return
            }

            if (!prop.format.some((item) => files[0].name.toLowerCase().endsWith(item.toLocaleLowerCase()))) {
                openMessageBox(Translate('IDCS_SELECT_FILE_TIPS').formatForLang(prop.format.map((item) => item.toLowerCase()).join(', '), displayFileSize.value))
            }

            rawFile = files[0]
            pageData.value.uploadFileName = files[0].name
            pageData.value.btnApplyDisabled = false
        }

        const apply = async () => {
            const _file = rawFile
            if (!_file) {
                return
            }
            const blob = new Blob([_file])
            const data = await fileToBase64(blob)
            const fileSize = base64FileSize(data)
            const fileType = prop.format.find((item) => pageData.value.uploadFileName.toLowerCase().endsWith(item.toLowerCase()))!

            if (fileSize > prop.fileLimitSize) {
                openMessageBox(Translate('IDCS_OUT_FILE_SIZE'))
                return
            }

            if (prop.type === 'ipcAudio') {
                const sendXml = rawXml`
                    <content>
                        <chl id='${prop.ipcData.id}'>
                            <param>
                                <addAudioAlarm>
                                    <audioName>${wrapCDATA(pageData.value.uploadFileName)}</audioName>
                                    <audioFileSize>${fileSize}</audioFileSize>
                                    <audioFileData>${wrapCDATA(data)}</audioFileData>
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
                const sendXml = rawXml`
                    <content>
                        <item>
                            <name>${wrapCDATA(pageData.value.uploadFileName)}</name>
                            <format>${fileType}</format>
                            <fileData>${wrapCDATA(data)}</fileData>
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
            accept,
            tips,
            displayFileSize,
        }
    },
})
