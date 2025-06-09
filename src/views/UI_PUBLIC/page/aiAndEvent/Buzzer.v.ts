/*
 * @Description: AI/事件——事件通知——蜂鸣器
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-30 15:55:38
 */
export default defineComponent({
    setup() {
        const formData = ref(new AlarmBuzzerForm())

        const pageData = ref({
            buzzerDurationOption: [] as SelectOption<number, string>[],
        })

        const getData = async () => {
            const result = await queryEventNotifyParam()
            commLoadResponseHandler(result, ($) => {
                formData.value.buzzerDuration = $('content/buzzerDuration').text().num()
                pageData.value.buzzerDurationOption = getAlarmHoldTimeList($('content/buzzerDurationNote').text(), formData.value.buzzerDuration)
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
            commSaveResponseHandler(result)

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
