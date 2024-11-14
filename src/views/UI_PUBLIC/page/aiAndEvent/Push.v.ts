/*
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-12 15:28:16
 * @Description: AI/事件——事件通知——推送
 */
import { AlarmPushForm } from '@/types/apiType/aiAndEvent'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'

export default defineComponent({
    components: {
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const pushFormData = ref(new AlarmPushForm())

        const pageData = ref({
            scheduleOption: [] as SelectOption<string, string>[],
            //排程管理弹窗显示状态
            scheduleManagPopOpen: false,
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
                pushFormData.value.chkEnable = $('//content/mobilePushSwitch').text().bool()

                if ($('//content/pushSchedule').attr('id')) {
                    pushFormData.value.pushSchedule = $('//content/pushSchedule').attr('id')
                } else {
                    const scheduleName = $('//content/pushSchedule').text() || '24x7'
                    pageData.value.scheduleOption.forEach((item) => {
                        if (scheduleName === item.label) {
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
            if ($('//status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_TEST_PUSH_MOBILE_SUCCESS'),
                })
            } else {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_TEST_PUSH_MOBILE_FAILED'),
                })
            }
        }

        const setData = async () => {
            const sendXml = rawXml`
                <content>
                    <mobilePushSwitch>${pushFormData.value.chkEnable}</mobilePushSwitch>
                    <pushSchedule id='${pushFormData.value.pushSchedule}'></pushSchedule>
                </content>
            `
            const result = await editEventNotifyParam(sendXml)
            commSaveResponseHadler(result)
        }

        const handleSchedulePopClose = () => {
            pageData.value.scheduleManagPopOpen = false
            getScheduleData()
        }

        onMounted(async () => {
            openLoading()

            await getData()

            closeLoading()
        })

        return {
            pushFormData,
            pageData,
            testMobile,
            setData,
            handleSchedulePopClose,
        }
    },
})
