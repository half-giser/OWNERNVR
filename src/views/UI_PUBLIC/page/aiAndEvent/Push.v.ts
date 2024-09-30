/*
 * @Description: AI/事件——事件通知——推送
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-12 15:28:16
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-08-30 11:35:38
 */
import { pushForm } from '@/types/apiType/aiAndEvent'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'

export default defineComponent({
    components: {
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const pushFormData = ref(new pushForm())

        const pageData = ref({
            scheduleOption: [] as SelectOption<string, string>[],
            //排程管理弹窗显示状态
            scheduleManagPopOpen: false,
        })

        const getScheduleData = async () => {
            const result = await queryScheduleList()

            commLoadResponseHandler(result, ($) => {
                pageData.value.scheduleOption = $('/response/content/item').map((item) => {
                    return {
                        value: item.attr('id')!,
                        label: item.text(),
                    }
                })
            })
        }

        const getData = async () => {
            await getScheduleData()
            const result = await queryEventNotifyParam()

            commLoadResponseHandler(result, ($) => {
                pushFormData.value.chkEnable = $('/response/content/mobilePushSwitch').text() == 'true'

                if ($('/response/content/pushSchedule').attr('id')) {
                    pushFormData.value.pushSchedule = $('/response/content/pushSchedule').attr('id')
                } else {
                    const scheduleName = $('/response/content/pushSchedule').text() || '24x7'
                    pageData.value.scheduleOption.forEach((item) => {
                        if (scheduleName == item.label) {
                            pushFormData.value.pushSchedule = item.value
                        }
                    })
                }
            })
        }

        // 测试按钮，向手机发送测试推送信息
        const testMobile = async () => {
            const result = await testMobilePush()
            const $ = queryXml(result)
            if ($('/response/status').text() == 'success') {
                openMessageTipBox({
                    type: 'success',
                    message: Translate('IDCS_TEST_PUSH_MOBILE_SUCCESS'),
                })
            } else {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_TEST_PUSH_MOBILE_FAILED'),
                })
            }
        }

        const setData = async () => {
            const sendXml = rawXml`
                <content>
                    <mobilePushSwitch>${String(pushFormData.value.chkEnable)}</mobilePushSwitch>
                    <pushSchedule id='${pushFormData.value.pushSchedule}'></pushSchedule>
                </content>
            `
            const result = await editEventNotifyParam(sendXml)
            commSaveResponseHadler(result)
        }

        onMounted(async () => {
            openLoading(LoadingTarget.FullScreen)

            await getData()

            closeLoading(LoadingTarget.FullScreen)
        })

        return {
            pushFormData,
            pageData,
            testMobile,
            setData,
        }
    },
})
