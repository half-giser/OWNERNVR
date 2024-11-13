/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 17:25:20
 * @Description: 自动维护
 */
import { type FormInstance, type FormRules } from 'element-plus'
import { SystemAutoMaintenanceForm } from '@/types/apiType/system'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const dateTime = useDateTimeStore()

        const formRef = ref<FormInstance>()
        const pageData = ref({
            // 自动重启的文案
            autoRestartTip: '',
        })
        const formData = ref(new SystemAutoMaintenanceForm())
        const rules = ref<FormRules>({
            interval: [
                {
                    validator: (_rule, value: number | null | undefined, callback) => {
                        if (formData.value.switch && typeof value !== 'number') {
                            callback(new Error(Translate('IDCS_INTERVAL_DAYS_EMPTY')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            time: [
                {
                    validator: (_rule, value: Date, callback) => {
                        if (formData.value.switch && !value) {
                            callback(new Error(Translate('IDCS_POINT_TIME_EMPTY')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 回显表单数据
         */
        const getData = async () => {
            const result = await queryAutoMaintenance()
            commLoadResponseHandler(result, ($) => {
                formData.value.switch = $('//content/autoMaintenanceCfg/switch').text().toBoolean()
                const interval = $('//content/autoMaintenanceCfg/interval').text()
                if (interval !== '') {
                    formData.value.interval = Number(interval)
                }
                const timeValue = $('//content/autoMaintenanceCfg/time').text().trim().split(':')
                formData.value.time = new Date(2000, 0, 1, Number(timeValue[0]), Number(timeValue[1]))

                if (formData.value.switch) {
                    const spanTimeFormat = $('//content/autoMaintenanceNote').text().trim() + ':00'
                    const currentTime = formatDate(spanTimeFormat, dateTime.dateTimeFormat)
                    pageData.value.autoRestartTip = Translate('IDCS_REBOOT_TIP').formatForLang(currentTime)
                } else {
                    pageData.value.autoRestartTip = ''
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
            openLoading()
            const sendXml = rawXml`
                <content>
                    <autoMaintenanceCfg>
                        <switch>${formData.value.switch}</switch>
                        <interval>${formData.value.interval || ''}</interval>
                        <time>${formatDate(formData.value.time, 'HH:mm')}</time>
                    </autoMaintenanceCfg>
                </content>
            `
            const result = await editAutoMaintenance(sendXml)
            commSaveResponseHadler(result, () => {
                getData()
            })
            closeLoading()
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
