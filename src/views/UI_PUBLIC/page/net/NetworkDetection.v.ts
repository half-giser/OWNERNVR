/*
 * @Date: 2025-04-27 19:45:25
 * @Description: 网络检测
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        const formRef = useFormRef()
        const formData = ref(new NetDetectionForm())

        const rules = ref<FormRules>({
            address: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_DESTINATION_ADDRESS_EMPTY')))
                            return
                        }

                        if (!checkIpV4(value) && !checkIpV6(value) && !checkDomainName(value)) {
                            callback(new Error(Translate('IDCS_INVALID_PARAMETER')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 网络检测
         */
        const test = async () => {
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }
                openLoading()

                const sendXml = rawXml`
                <content>
                    <destAddr>${formData.value.address}</destAddr>
                </content>
            `
                const result = await queryPingCmdResult(sendXml)
                const $ = queryXml(result)

                closeLoading()

                if ($('status').text() === 'success') {
                    if ($('content/result').text() === 'success') {
                        const delay = $('content/avgDelay').text()
                        const loss = $('content/packetLoss').text()
                        openMessageBox({
                            type: 'success',
                            message: Translate('IDCS_TEST_RESULTS_SUCCESS_TIP').formatForLang(delay, loss),
                        })
                    } else {
                        openMessageBox(Translate('IDCS_TEST_RESULTS_FAIL_TIP'))
                    }
                } else {
                    const errorCode = $('errorCode').text().num()
                    switch (errorCode) {
                        case ErrorCode.USER_ERROR_LOG_QUERY_BE_IN_A_MONTH:
                            openMessageBox(Translate('IDCS_DNSCFG_EMPTY_TIP'))
                            break
                        default:
                            openMessageBox(Translate('IDCS_TEST_FAIL'))
                            break
                    }
                }
            })
        }

        /**
         * @description 约束地址输入
         * @param {string} value
         * @returns {string}
         */
        const formatAddress = (value: string) => {
            return value.replace(/&|\||;|\/|'|\\|"|<|>|%/g, '')
        }

        return {
            formData,
            formRef,
            rules,
            test,
            formatAddress,
        }
    },
})
