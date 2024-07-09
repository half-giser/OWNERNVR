/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 17:25:20
 * @Description: 自动维护
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-08 20:19:45
 */
import { type FormInstance, type FormRules } from 'element-plus'
import { SystemAutoMaintenanceForm } from '@/types/apiType/system'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const dateTime = useDateTime()

        const formRef = ref<FormInstance>()
        const pageData = ref({
            // 是否显示自动重启的提示
            isAutoResttartTip: false,
            // 自动重启的文案
            autoRestartTip: '',
        })
        const formData = ref(new SystemAutoMaintenanceForm())
        const rules = ref<FormRules>({
            interval: [
                {
                    validator: (rule, value, callback) => {
                        if (formData.value.switch && !value) {
                            callback(new Error(Translate('IDCS_INTERVAL_DAYS_EMPTY')))
                            return
                        }
                        callback()
                    },
                },
            ],
        })

        /**
         * @description 回显表单数据
         */
        const getData = async () => {
            const result = await queryAutoMaintenance()
            commLoadResponseHandler(result, async ($) => {
                formData.value.switch = $('/response/content/autoMaintenanceCfg/switch').text().toBoolean()
                formData.value.interval = $('/response/content/autoMaintenanceCfg/interval').text()
                const timeValue = $('/response/content/autoMaintenanceCfg/time').text().trim().split(':')
                formData.value.time = new Date(2000, 1, 1, Number(timeValue[0]), Number(timeValue[1]))

                await dateTime.getTimeConfig()

                if (formData.value.switch) {
                    const spanTimeFormat = $('/response/content/autoMaintenanceNote').text().trim() + ':00'
                    const currentTime = formatDate(spanTimeFormat, dateTime.dateTimeFormat.value)
                    pageData.value.autoRestartTip = Translate('IDCS_REBOOT_TIP').formatForLang(currentTime)
                    pageData.value.isAutoResttartTip = true
                } else {
                    pageData.value.isAutoResttartTip = false
                }
            })
        }

        /**
         * @description 表单验证
         */
        const verify = () => {
            formRef.value?.validate((valid) => {
                if (valid) {
                    setData()
                }
            })
        }

        /**
         * @description 提交数据
         */
        const setData = async () => {
            openLoading(LoadingTarget.FullScreen)
            const sendXml = rawXml`
                <content>
                    <autoMaintenanceCfg>
                        <switch>${String(formData.value.switch)}</switch>
                        <interval>${formData.value.interval}</interval>
                        <time>${String(formData.value.time.getHours())}:${String(formData.value.time.getMinutes())}</time>
                    </autoMaintenanceCfg>
                </content>
            `
            const result = await editAutoMaintenance(sendXml)
            commSaveResponseHadler(result, () => {
                getData()
            })
            closeLoading(LoadingTarget.FullScreen)
        }

        onMounted(() => {
            getData()
        })

        return {
            formRef,
            formData,
            pageData,
            verify,
            rules,
        }
    },
})
