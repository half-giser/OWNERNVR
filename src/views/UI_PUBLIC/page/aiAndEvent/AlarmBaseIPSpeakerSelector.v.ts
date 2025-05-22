/*
 * @Description: AI-联动-IP Speaker-选择面板
 * @Author: luoyiming a11593@tvt.net.cn
 * @Date: 2025-05-21 16:37:58
 */
export default defineComponent({
    props: {
        /**
         * @property {Array} 选中值
         */
        modelValue: {
            type: Array as PropType<AlarmIPSpeakerItem[]>,
            required: true,
        },
        /**
         * @property {string} 通道ID
         */
        chlId: {
            type: String,
            required: true,
        },
    },
    emits: {
        'update:modelValue'(voice: AlarmIPSpeakerItem[]) {
            return Array.isArray(voice)
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
            tableData: [] as AlarmIPSpeakerItem[],
            audioList: [] as SelectOption<string, string>[],
            needReqCount: 0,
            hasReqCount: 0,
            hasInitIPSpeakerAudio: false,
        })

        /**
         * 获取声音列表数据
         */
        const getAduioData = async () => {
            const result = await queryAlarmAudioCfg()
            const $ = await commLoadResponseHandler(result)
            pageData.value.audioList = $('content/audioList/item')
                .map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        value: item.attr('id'),
                        label: $item('name').text(),
                    }
                })
                .filter((item) => {
                    // 只显示.wav文件，不显示.mp3文件
                    return !item.label.toLowerCase().endsWith('.mp3')
                })
            pageData.value.audioList.push({
                value: DEFAULT_EMPTY_ID,
                label: `<${Translate('IDCS_NULL')}>`,
            })
        }

        /**
         * @description 获取已添加ipspeaker通道列表
         */
        const getVoiceDevList = async () => {
            const result = await getChlList({
                nodeType: 'voices',
            })
            commLoadResponseHandler(result, ($) => {
                $('content/item').forEach((item) => {
                    pageData.value.needReqCount++
                    const id = item.attr('id')
                    getVoiceDev(id)
                })
            })
        }

        /**
         * 获取ipspeaker详情
         */
        const getVoiceDev = async (ipSpeakerId: string) => {
            const sendXml = rawXml`
                <condition>
                    <alarmInId>${ipSpeakerId}</alarmInId>
                </condition>
            `
            const result = await queryVoiceDev(sendXml)
            commLoadResponseHandler(result, ($) => {
                const id = $('content/associatedType').attr('id')

                if (id === prop.chlId) {
                    pageData.value.tableData.push({
                        ipSpeakerId: ipSpeakerId,
                        ipSpeakerName: $('content/name').text(),
                        audioID: DEFAULT_EMPTY_ID,
                        audioName: `<${Translate('IDCS_NULL')}>`,
                    })
                }
                pageData.value.hasReqCount++
                // voice项全部请求完成，根据传入的modelValue判断对应的audio项
                if (pageData.value.hasReqCount === pageData.value.needReqCount) {
                    initIPSpeakerAudio(false)
                }
            })
        }

        const initIPSpeakerAudio = (modelValueInit: boolean) => {
            // 需要pageData.value.tableData和prop.modelValue数据均被获取到
            pageData.value.tableData.forEach((element) => {
                prop.modelValue.forEach((ele) => {
                    if (element.ipSpeakerId === ele.ipSpeakerId) {
                        const audioData = pageData.value.audioList.filter((audio) => {
                            return audio.value === ele.audioID
                        })
                        if (audioData.length) {
                            element.audioID = audioData[0].value
                        }
                    }
                })
            })
            if (modelValueInit) {
                pageData.value.hasInitIPSpeakerAudio = true
            }
        }

        /**
         * @description 更改选项
         */
        const change = (ipSpeakerRow: AlarmIPSpeakerItem, audioID: string) => {
            ipSpeakerRow.audioID = audioID

            const ipSpeakerItems = cloneDeep(prop.modelValue)
            const find = ipSpeakerItems.find((item) => item.ipSpeakerId === ipSpeakerRow.ipSpeakerId)
            if (find) {
                find.audioID = audioID
            } else {
                ipSpeakerItems.push({
                    ipSpeakerId: ipSpeakerRow.ipSpeakerId,
                    audioID: audioID,
                })
            }
            ctx.emit('update:modelValue', ipSpeakerItems)
        }

        watch(
            () => prop.modelValue,
            (value: AlarmIPSpeakerItem[]) => {
                // 传入的IPSpeaker存在且还未设置对应audio声音项
                if (value.length && !pageData.value.hasInitIPSpeakerAudio) {
                    initIPSpeakerAudio(true)
                }
            },
        )

        onMounted(() => {
            getAduioData()
            getVoiceDevList()
        })

        return {
            pageData,
            change,
        }
    },
})
