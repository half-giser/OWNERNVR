/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 18:21:09
 * @Description: SNMP配置
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()

        const pageData = ref({
            securityLevelOptions: [
                {
                    label: Translate('IDCS_NO_AUTH_NO_PRIV'),
                    value: 0,
                },
                {
                    label: Translate('IDCS_AUTH_NO_PRIV'),
                    value: 1,
                },
                {
                    label: Translate('IDCS_AUTH_PRIV'),
                    value: 2,
                },
            ],
            authTypeOptions: [
                {
                    label: 'MD5',
                    value: 0,
                },
                {
                    label: 'SHA',
                    value: 1,
                },
            ],
            privTypeOptions: [
                {
                    label: 'AES',
                    value: 0,
                },
                {
                    label: 'DES',
                    value: 1,
                },
            ],
            authPassword: false,
            privPassword: false,
        })

        const formRef = useFormRef()
        const formData = ref(new NetSNMPForm())
        const formRule = ref<FormRules>({
            snmpPort: [
                {
                    validator(_rule, value: number, callback) {
                        if (formData.value.snmpv1Switch || formData.value.snmpv2Switch || formData.value.snmpv3Switch) {
                            if (!value) {
                                callback(new Error(Translate('IDCS_PROMPT_SNMP_PORT_EMPTY')))
                                return
                            }
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            readCommunity: [
                {
                    validator(_rule, value: string, callback) {
                        if (formData.value.snmpv1Switch || formData.value.snmpv2Switch) {
                            if (!value.trim()) {
                                callback(new Error(Translate('IDCS_PROMPT_READ_COMMUNITY_EMPTY')))
                                return
                            }
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            writeCommunity: [
                {
                    validator(_rule, value: string, callback) {
                        if (formData.value.snmpv1Switch || formData.value.snmpv2Switch) {
                            if (!value.trim()) {
                                callback(new Error(Translate('IDCS_PROMPT_WRITE_COMMUNITY_EMPTY')))
                                return
                            }
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            trapAddress: [
                {
                    validator(_rule, value: string, callback) {
                        if (formData.value.snmpv1Switch || formData.value.snmpv2Switch || formData.value.snmpv3Switch) {
                            if (!value) {
                                callback(new Error(Translate('IDCS_PROMPT_TRAP_ADDRESS_EMPTY')))
                                return
                            }

                            if (value === DEFAULT_EMPTY_IP || !checkIpV4(value)) {
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
                        if (formData.value.snmpv1Switch || formData.value.snmpv2Switch || formData.value.snmpv3Switch) {
                            if (!value) {
                                callback(new Error(Translate('IDCS_PROMPT_TRAP_PORT_EMPTY')))
                                return
                            }
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            authPassword: [
                {
                    validator(_rule, value: string, callback) {
                        if (formData.value.snmpv3Switch && pageData.value.authPassword && formData.value.securityLevel !== 0) {
                            if (!value.trim()) {
                                callback(new Error(Translate('IDCS_PROMPT_AUTH_PASSWD_EMPTY')))
                                return
                            }

                            if (value.trim().length < 8) {
                                callback(new Error(Translate('IDCS_PROMPT_AUTH_LEN_TOO_SHORT')))
                                return
                            }
                        }
                    },
                    trigger: 'manual',
                },
            ],
            privPassword: [
                {
                    validator(_rule, value: string, callback) {
                        if (formData.value.snmpv3Switch && pageData.value.privPassword && formData.value.securityLevel === 2) {
                            if (!value.trim()) {
                                callback(new Error(Translate('IDCS_PROMPT_PRIVACY_PASSWD_EMPTY')))
                                return
                            }

                            if (value.trim().length < 8) {
                                callback(new Error(Translate('IDCS_PROMPT_PRIVACY_LEN_TOO_SHORT')))
                                return
                            }
                        }
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
                formData.value.snmpv1Switch = $('content/snmpv1Switch').text().bool()
                formData.value.snmpv2Switch = $('content/snmpv2Switch').text().bool()
                formData.value.snmpv3Switch = $('content/snmpv3Switch').text().bool()
                formData.value.snmpPort = $('content/snmpPort').text().num()
                formData.value.readCommunity = $('content/readCommunity').text()
                formData.value.writeCommunity = $('content/writeCommunity').text()
                formData.value.trapPort = $('content/trapPort').text().num()
                formData.value.trapAddress = $('content/trapAddress').text()
                formData.value.username = $('content/UserName').text()
                formData.value.securityLevel = $('content/SecurityLevel').text().num()
                formData.value.authType = $('content/AuthType').text().num()
                formData.value.privType = $('content/PrivType').text().num()
            })
        }

        /**
         * @description 更新表单数据
         */
        const setData = () => {
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }

                openLoading()

                const sendXml = rawXml`
                    <content>
                        <snmpv1Switch>${formData.value.snmpv1Switch}</snmpv1Switch>
                        <snmpv2Switch>${formData.value.snmpv2Switch}</snmpv2Switch>
                        <snmpv3Switch>${formData.value.snmpv3Switch}</snmpv3Switch>
                        ${formData.value.snmpPort ? `<snmpPort>${formData.value.snmpPort}</snmpPort>` : ''}
                        ${formData.value.readCommunity ? `<readCommunity>${formData.value.readCommunity}</readCommunity>` : ''}
                        ${formData.value.writeCommunity ? `<writeCommunity>${formData.value.writeCommunity}</writeCommunity>` : ''}
                        ${formData.value.trapAddress && formData.value.trapAddress !== DEFAULT_EMPTY_IP && formData.value.trapAddress !== '' ? `<trapAddress>${formData.value.trapAddress}</trapAddress>` : ''}
                        ${formData.value.trapPort ? `<trapPort>${formData.value.trapPort}</trapPort>` : ''}
                        ${formData.value.username ? `<UserName>${wrapCDATA(formData.value.username)}</UserName>` : ''}
                        <SecurityLevel>${formData.value.securityLevel}</SecurityLevel>
                        <AuthType>${formData.value.authType}</AuthType>
                        <PrivType>${formData.value.privType}</PrivType>
                        ${formData.value.authPassword ? `<AuthPasswd ${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.authPassword, userSession.sesionKey))}</AuthPasswd>` : ''}
                        ${formData.value.privPassword ? `<PrivPasswd ${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.privPassword, userSession.sesionKey))}</PrivPasswd>` : ''}
                    </content>
                `
                const result = await editSNMPCfg(sendXml)
                commSaveResponseHandler(result)

                closeLoading()
            })
        }

        /**
         * @description 约束readCommunity和writeCommunity的输入
         * @param {string} value
         * @returns {string}
         */
        const formatCommunity = (value: string) => {
            return value.replace(/[^A-z|\d!@#$%^&*(){}\|:"`<>?~_\\'./\-\s\[\];,=+]/g, '')
        }

        const formatUserName = (value: string) => {
            return value.replace(/[\u4e00-\u9fa5]/g, '')
        }

        const changeSNMPV1Switch = () => {
            if (formData.value.snmpv1Switch) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_SECURITY_RISK_AND_KEEP').formatForLang(Translate('IDCS_ENABLE_SNMP_V1')),
                }).catch(() => {
                    formData.value.snmpv1Switch = false
                })
            }
        }

        const changeSNMPV2Switch = () => {
            if (formData.value.snmpv2Switch) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_SECURITY_RISK_AND_KEEP').formatForLang(Translate('IDCS_ENABLE_SNMP_V2')),
                }).catch(() => {
                    formData.value.snmpv2Switch = false
                })
            }
        }

        const changeSNMPV3Switch = () => {
            if (formData.value.snmpv3Switch) {
                formData.value.snmpv1Switch = false
                formData.value.snmpv2Switch = false
            }
        }

        const changeSecurityLevel = () => {
            // NTA1-4178：网络安全问题单-提示
            if (formData.value.securityLevel === 0) {
                openMessageBox(Translate('IDCS_SECURITY_RISK_AND_RECOMMEND').formatForLang(Translate('IDCS_NO_AUTH_NO_PRIV'), Translate('IDCS_AUTH_PRIV')))
                return
            }

            if (formData.value.securityLevel === 1) {
                openMessageBox(Translate('IDCS_SECURITY_RISK_AND_RECOMMEND').formatForLang(Translate('IDCS_AUTH_NO_PRIV'), Translate('IDCS_AUTH_PRIV')))
                formData.value.authPassword = ''
                return
            }

            if (formData.value.securityLevel === 2) {
                formData.value.authPassword = ''
                formData.value.privPassword = ''
            }
        }

        const changeAuthPasswordSwitch = () => {
            if (!pageData.value.authPassword) {
                formData.value.authPassword = ''
            }
        }

        const changePrivPasswordSwitch = () => {
            if (!pageData.value.privPassword) {
                formData.value.privPassword = ''
            }
        }

        onMounted(() => {
            getData()
        })

        return {
            pageData,
            formRef,
            formData,
            formRule,
            setData,
            formatCommunity,
            formatUserName,
            changeSNMPV3Switch,
            changeSNMPV1Switch,
            changeSNMPV2Switch,
            changeSecurityLevel,
            changeAuthPasswordSwitch,
            changePrivPasswordSwitch,
        }
    },
})
