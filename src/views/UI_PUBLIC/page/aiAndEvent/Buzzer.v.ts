/*
 * @Description: AI/事件——事件通知——蜂鸣器
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-30 15:55:38
 */
import { AlarmBuzzerForm } from '@/types/apiType/aiAndEvent'

export default defineComponent({
    setup() {
        const { openLoading, closeLoading } = useLoading()

        const formData = ref(new AlarmBuzzerForm())

        const pageData = ref({
            buzzerDurationOption: [] as SelectOption<number, string>[],
        })

        const getData = async () => {
            const result = await queryEventNotifyParam()
            commLoadResponseHandler(result, ($) => {
                formData.value.buzzerDuration = $('//content/buzzerDuration').text().num()
                pageData.value.buzzerDurationOption = $('//content/buzzerDurationNote')
                    .text()
                    .split(',')
                    .map((item) => {
                        const value = Number(item)
                        return {
                            value: value,
                            label: getTranslateForSecond(value),
                        }!
                    })
            })
        }

        const setData = async () => {
            openLoading()
            const sendXml = rawXml`
                <content>
                    <buzzerDuration>${formData.value.buzzerDuration}</buzzerDuration>
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
            formData,
            pageData,
            setData,
        }
    },
})
