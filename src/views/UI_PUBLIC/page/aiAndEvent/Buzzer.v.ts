/*
 * @Description: AI/事件——事件通知——蜂鸣器
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-30 15:55:38
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-08-12 18:07:12
 */
import { buzzerForm } from '@/types/apiType/aiAndEvent'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const formData = ref(new buzzerForm())

        const pageData = ref({
            buzzerDurationOption: [] as number[],
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

        const getData = async () => {
            const result = await queryEventNotifyParam()
            commLoadResponseHandler(result, ($) => {
                formData.value.buzzerDuration = Number($('/response/content/buzzerDuration').text())
                $('/response/content/buzzerDurationNote')
                    .text()
                    .split(',')
                    .forEach((item) => {
                        pageData.value.buzzerDurationOption.push(Number(item))
                    })
            })
        }

        const setData = async () => {
            openLoading(LoadingTarget.FullScreen)
            const sendXml = rawXml`
                <content>
                    <buzzerDuration>${String(formData.value.buzzerDuration)}</buzzerDuration>
                </content>
            `
            const result = await editEventNotifyParam(sendXml)
            commSaveResponseHadler(result)

            closeLoading(LoadingTarget.FullScreen)
        }

        onMounted(async () => {
            openLoading(LoadingTarget.FullScreen)

            await getData()

            closeLoading(LoadingTarget.FullScreen)
        })

        return {
            formData,
            pageData,
            displayDurationOption,
            setData,
        }
    },
})
