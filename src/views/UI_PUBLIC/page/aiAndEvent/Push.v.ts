/*
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-12 15:28:16
 * @Description: AI/事件——事件通知——推送
 */
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'

export default defineComponent({
    components: {
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const formData = ref(new AlarmPushForm())

        const pageData = ref({
            scheduleOption: [] as SelectOption<string, string>[],
            //排程管理弹窗显示状态
            isSchedulePop: false,
        })

        const getScheduleData = async () => {
            pageData.value.scheduleOption = await buildScheduleList({
                isDefault: false,
            })
        }

        const getData = async () => {
            await getScheduleData()
            const result = await queryEventNotifyParam()

            commLoadResponseHandler(result, ($) => {
                formData.value.chkEnable = $('content/mobilePushSwitch').text().bool()

                if ($('content/pushSchedule').attr('id')) {
                    formData.value.pushSchedule = $('content/pushSchedule').attr('id')
                } else {
                    const scheduleName = $('content/pushSchedule').text() || '24x7'
                    formData.value.pushSchedule = pageData.value.scheduleOption.find((item) => scheduleName === item.label)?.value || ''
                }
            })
        }

        // 测试按钮，向手机发送测试推送信息
        const testData = async () => {
            const result = await testMobilePush()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_TEST_PUSH_MOBILE_SUCCESS'),
                })
            } else {
                openMessageBox(Translate('IDCS_TEST_PUSH_MOBILE_FAILED'))
            }
        }

        const setData = async () => {
            const sendXml = rawXml`
                <content>
                    <mobilePushSwitch>${formData.value.chkEnable}</mobilePushSwitch>
                    <pushSchedule id='${formData.value.pushSchedule}'></pushSchedule>
                </content>
            `
            const result = await editEventNotifyParam(sendXml)
            commSaveResponseHandler(result)
        }

        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleData()
            formData.value.pushSchedule = getScheduleId(pageData.value.scheduleOption, formData.value.pushSchedule, '')
        }

        onMounted(async () => {
            openLoading()

            await getData()

            closeLoading()
        })

        return {
            formData,
            pageData,
            testData,
            setData,
            closeSchedulePop,
        }
    },
})
