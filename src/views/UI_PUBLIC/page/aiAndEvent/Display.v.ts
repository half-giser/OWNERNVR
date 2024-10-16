/*
 * @Description: AI/事件——事件通知——显示
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-30 09:23:37
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-08-12 15:00:18
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
            popVideoDurationOption: [] as number[],
            // 弹出视频输出选项
            popVideoOutputOption: [] as SelectOption<string, string>[],
            // 弹出消息框持续时间选项
            popMsgDurationOption: [] as number[],
        })

        /**
         * @description 持续时间选项的格式化
         * @param {number} value 秒
         */
        const displayDurationOption = (value: number) => {
            if (value == 0) {
                return Translate('IDCS_ALWAYS_KEEP')
            } else if (value == 60) {
                return '1 ' + Translate('IDCS_MINUTE')
            } else if (value > 60) {
                return value / 60 + Translate('IDCS_MINUTE')
            }
            return value + Translate('IDCS_SECONDS')
        }

        // 获取数据
        const getData = async () => {
            const result = await queryEventNotifyParam()

            commLoadResponseHandler(result, ($) => {
                videoFormData.value.popVideoDuration = Number($('/response/content/popVideoDuration').text())
                $('/response/content/popVideoDurationNote')
                    .text()
                    .split(',')
                    .forEach((item) => {
                        pageData.value.popVideoDurationOption.push(Number(item))
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
                $('/response/content/popMsgDurationNote')
                    .text()
                    .split(',')
                    .forEach((item) => {
                        pageData.value.popMsgDurationOption.push(Number(item))
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
            displayDurationOption,
            setData,
        }
    },
})
