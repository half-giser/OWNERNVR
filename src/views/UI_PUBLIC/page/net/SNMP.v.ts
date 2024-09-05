/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 18:21:09
 * @Description: SNMP配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 16:05:31
 */
import { NetSNMPForm } from '@/types/apiType/net'
import { type FormInstance, type FormRules } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const formRef = ref<FormInstance>()
        const formData = ref(new NetSNMPForm())
        const formRule = ref<FormRules>({
            snmpPort: [
                {
                    validator(rule, value, callback) {
                        if (!disabled.value && !value) {
                            callback(new Error(Translate('IDCS_PROMPT_SNMP_PORT_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'change',
                },
            ],
            readCommunity: [
                {
                    validator(rule, value, callback) {
                        if (!disabled.value && !value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_READ_COMMUNITY_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'change',
                },
            ],
            writeCommunity: [
                {
                    validator(rule, value, callback) {
                        if (!disabled.value && !value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_WRITE_COMMUNITY_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'change',
                },
            ],
            trapAddress: [
                {
                    validator(rule, value, callback) {
                        if (!disabled.value) {
                            if (!value.length) {
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
                    trigger: 'change',
                },
            ],
            trapPort: [
                {
                    validator(rule, value, callback) {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_TRAP_PORT_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'change',
                },
            ],
        })

        /**
         * @description 获取表单数据
         */
        const getData = async () => {
            const result = await querySNMPCfg()
            commLoadResponseHandler(result, ($) => {
                const $content = queryXml($('//content')[0].element)
                formData.value.snmpv1Switch = $content('snmpv1Switch').text().toBoolean()
                formData.value.snmpv2Switch = $content('snmpv2Switch').text().toBoolean()
                formData.value.snmpPort = Number($content('snmpPort').text())
                formData.value.readCommunity = $content('readCommunity').text()
                formData.value.writeCommunity = $content('writeCommunity').text()
                formData.value.trapPort = Number($content('trapPort').text())
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

                openLoading(LoadingTarget.FullScreen)

                const sendXml = rawXml`
                    <content>
                        <snmpv1Switch>${formData.value.snmpv1Switch.toString()}</snmpv1Switch>
                        <snmpv2Switch>${formData.value.snmpv2Switch.toString()}</snmpv2Switch>
                        <snmpPort>${formData.value.snmpPort.toString()}</snmpPort>
                        <readCommunity>${formData.value.readCommunity}</readCommunity>
                        <writeCommunity>${formData.value.writeCommunity}</writeCommunity>
                        <trapAddress>${formData.value.trapAddress}</trapAddress>
                        <trapPort>${formData.value.trapPort.toString()}</trapPort>
                    </content>
                `
                const result = await editSNMPCfg(sendXml)
                commSaveResponseHadler(result)

                closeLoading(LoadingTarget.FullScreen)
            })
        }

        // 是否禁用表单项
        const disabled = computed(() => {
            return !formData.value.snmpv1Switch && !formData.value.snmpv2Switch
        })

        watch(disabled, () => {
            formRef.value?.clearValidate()
        })

        onMounted(() => {
            getData()
        })

        return {
            formRef,
            formData,
            formRule,
            disabled,
            setData,
        }
    },
})
