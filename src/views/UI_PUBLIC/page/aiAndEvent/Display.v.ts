/*
 * @Description: AI/事件——事件通知——显示
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-30 09:23:37
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-18 15:35:12
 */
import { PopVideoForm, PopMsgForm } from '@/types/apiType/aiAndEvent'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()

        const videoFormData = ref(new PopVideoForm())
        const msgFormData = ref(new PopMsgForm())

        const pageData = ref({
            // 弹出视频持续时间选项
            popVideoDurationOption: [] as SelectOption<number, string>[],
            // 弹出视频输出选项
            popVideoOutputOption: [] as SelectOption<string, string>[],
            // 弹出消息框持续时间选项
            popMsgDurationOption: [] as SelectOption<number, string>[],
        })

        // 获取数据
        const getData = async () => {
            const result = await queryEventNotifyParam()

            commLoadResponseHandler(result, ($) => {
                videoFormData.value.popVideoDuration = Number($('/response/content/popVideoDuration').text())
                pageData.value.popVideoDurationOption = $('/response/content/popVideoDurationNote')
                    .text()
                    .split(',')
                    .map((item) => {
                        const value = Number(item)
                        return {
                            value: value,
                            label: value === 0 ? Translate('IDCS_ALWAYS_KEEP') : getTranslateForSecond(value),
                        }!
                    })
                videoFormData.value.popVideoOutput = $('/response/content/popVideoOutput').text()
                const popVideoOutputNote = $('/response/content/popVideoOutputNote').text().split(',')
                if (popVideoOutputNote.length >= 2) {
                    videoFormData.value.popVideoOutputShow = true
                }
                popVideoOutputNote.forEach((item) => {
                    if (popVideoOutputNote.length == 2) {
                        pageData.value.popVideoOutputOption.push({
                            value: item,
                            label: Number(item) == 0 ? Translate('IDCS_MAIN_SCREEN') : Translate('IDCS_SECOND_SCREEN'),
                        })
                    } else {
                        pageData.value.popVideoOutputOption.push({
                            value: item,
                            label: Number(item) == 0 ? Translate('IDCS_MAIN_SCREEN') : Translate('IDCS_SECOND_SCREEN') + parseInt(item),
                        })
                    }
                })

                msgFormData.value.popMsgDuration = Number($('/response/content/popMsgDuration').text())
                pageData.value.popMsgDurationOption = $('/response/content/popMsgDurationNote')
                    .text()
                    .split(',')
                    .map((item) => {
                        const value = Number(item)
                        return {
                            value: value,
                            label: value === 0 ? Translate('IDCS_ALWAYS_KEEP') : getTranslateForSecond(value),
                        }!
                    })

                msgFormData.value.popMsgShow = $('/response/content/popMsgShow').text() == 'false'
            })
        }

        const setData = async () => {
            openLoading()
            const sendXml = rawXml`
                <content>
                    <popVideoDuration>${String(videoFormData.value.popVideoDuration)}</popVideoDuration>
                    <popMsgDuration>${String(msgFormData.value.popMsgDuration)}</popMsgDuration>
                    <popMsgShow>${String(!msgFormData.value.popMsgShow)}</popMsgShow>
                    <popVideoOutput>${String(videoFormData.value.popVideoOutput)}</popVideoOutput>
                </content>
            `
            const result = await editEventNotifyParam(sendXml)
            commSaveResponseHadler(result)

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
