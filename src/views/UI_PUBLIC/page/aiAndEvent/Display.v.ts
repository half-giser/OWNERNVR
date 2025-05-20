/*
 * @Description: AI/事件——事件通知——显示
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-30 09:23:37
 */
export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        const videoFormData = ref(new AlarmDisplayPopVideoForm())
        const msgFormData = ref(new AlarmDisplayPopMsgForm())

        const pageData = ref({
            // 弹出视频持续时间选项
            popVideoDurationOption: [] as SelectOption<number, string>[],
            // 弹出视频输出选项
            popVideoOutputOption: [] as SelectOption<string, string>[],
            // 弹出消息框持续时间选项
            popMsgDurationOption: [] as SelectOption<number, string>[],
        })

        /**
         * @description 获取数据
         */
        const getData = async () => {
            const result = await queryEventNotifyParam()

            commLoadResponseHandler(result, ($) => {
                videoFormData.value.popVideoDuration = $('content/popVideoDuration').text().num()
                videoFormData.value.popVideoOutput = $('content/popVideoOutput').text()

                msgFormData.value.popMsgDuration = $('content/popMsgDuration').text().num()
                msgFormData.value.popMsgShow = !$('content/popMsgShow').text().bool()

                pageData.value.popVideoDurationOption = getAlarmHoldTimeList($('content/popVideoDurationNote').text(), videoFormData.value.popVideoDuration, 'keep')
                pageData.value.popMsgDurationOption = getAlarmHoldTimeList($('content/popMsgDurationNote').text(), msgFormData.value.popMsgDuration, 'keep')

                const popVideoOutputNote = $('content/popVideoOutputNote').text().array()
                pageData.value.popVideoOutputOption = popVideoOutputNote.map((item) => {
                    if (popVideoOutputNote.length === 2) {
                        return {
                            value: item,
                            label: Number(item) === 0 ? Translate('IDCS_MAIN_SCREEN') : Translate('IDCS_SECOND_SCREEN'),
                        }
                    } else {
                        return {
                            value: item,
                            label: Number(item) === 0 ? Translate('IDCS_MAIN_SCREEN') : Translate('IDCS_SECOND_SCREEN') + item,
                        }
                    }
                })
            })
        }

        /**
         * @description 提交数据
         */
        const setData = async () => {
            openLoading()
            const sendXml = rawXml`
                <content>
                    <popVideoDuration>${videoFormData.value.popVideoDuration}</popVideoDuration>
                    <popMsgDuration>${msgFormData.value.popMsgDuration}</popMsgDuration>
                    <popMsgShow>${!msgFormData.value.popMsgShow}</popMsgShow>
                    <popVideoOutput>${videoFormData.value.popVideoOutput}</popVideoOutput>
                </content>
            `
            const result = await editEventNotifyParam(sendXml)
            commSaveResponseHandler(result)

            closeLoading()
        }

        onMounted(async () => {
            openLoading()

            await getData()

            closeLoading()
        })

        return {
            pageData,
            videoFormData,
            msgFormData,
            setData,
        }
    },
})
