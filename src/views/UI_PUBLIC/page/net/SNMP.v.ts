/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 18:21:09
 * @Description: SNMP配置
 */
import { NetSNMPForm } from '@/types/apiType/net'
import { type FormRules } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()

        const formRef = useFormRef()
        const formData = ref(new NetSNMPForm())
        const formRule = ref<FormRules>({
            snmpPort: [
                {
                    validator(_rule, value: number, callback) {
                        if (!disabled.value && !value) {
                            callback(new Error(Translate('IDCS_PROMPT_SNMP_PORT_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            readCommunity: [
                {
                    validator(_rule, value: string, callback) {
                        if (!disabled.value && !value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_READ_COMMUNITY_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            writeCommunity: [
                {
                    validator(_rule, value: string, callback) {
                        if (!disabled.value && !value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_WRITE_COMMUNITY_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            trapAddress: [
                {
                    validator(_rule, value: string, callback) {
                        if (!disabled.value) {
                            if (!value) {
                                callback(new Error(Translate('IDCS_PROMPT_TRAP_ADDRESS_EMPTY')))
                                return
                            }

                            if (value === '0.0.0.0' || !checkIpV4(value)) {
                                callback(new Error(Translate('IDCS_PROMPT_TRAP_ADDRESS_INVALID')))
                                return
                            }
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            trapPort: [
                {
                    validator(_rule, value: number, callback) {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_TRAP_PORT_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 获取表单数据
         */
        const getData = async () => {
            const result = await querySNMPCfg()
            commLoadResponseHandler(result, ($) => {
                const $content = queryXml($('content/content')[0].element)
                formData.value.snmpv1Switch = $content('snmpv1Switch').text().bool()
                formData.value.snmpv2Switch = $content('snmpv2Switch').text().bool()
                formData.value.snmpPort = $content('snmpPort').text().num()
                formData.value.readCommunity = $content('readCommunity').text()
                formData.value.writeCommunity = $content('writeCommunity').text()
                formData.value.trapPort = $content('trapPort').text().num()
                formData.value.trapAddress = $content('trapAddress').text()
            })
        }

        /**
         * @description 更新表单数据
         */
        const setData = () => {
            // TODO: 未启用情况下 如果一些表单项为空，提交会报错. 原项目也是如此
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }

                openLoading()

                const sendXml = rawXml`
                    <content>
                        <snmpv1Switch>${formData.value.snmpv1Switch}</snmpv1Switch>
                        <snmpv2Switch>${formData.value.snmpv2Switch}</snmpv2Switch>
                        <snmpPort>${formData.value.snmpPort}</snmpPort>
                        <readCommunity>${formData.value.readCommunity}</readCommunity>
                        <writeCommunity>${formData.value.writeCommunity}</writeCommunity>
                        <trapAddress>${formData.value.trapAddress}</trapAddress>
                        <trapPort>${formData.value.trapPort}</trapPort>
                    </content>
                `
                const result = await editSNMPCfg(sendXml)
                commSaveResponseHandler(result)

                closeLoading()
            })
        }

        // 是否禁用表单项
        const disabled = computed(() => {
            return !formData.value.snmpv1Switch && !formData.value.snmpv2Switch
        })

        /**
         * @description 约束readCommunity和writeCommunity的输入
         * @param {string} value
         * @returns {string}
         */
        const formatCommunity = (value: string) => {
            return value.replace(/[^A-z|\d!@#$%^&*(){}\|:"`<>?~_\\'./\-\s\[\];,=+]/g, '')
        }

        onMounted(() => {
            getData()
        })

        return {
            formRef,
            formData,
            formRule,
            disabled,
            setData,
            formatCommunity,
        }
    },
})
