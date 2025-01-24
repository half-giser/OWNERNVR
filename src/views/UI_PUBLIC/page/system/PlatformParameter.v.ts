/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-10-23 11:22:10
 * @Description: 地标平台参数
 */

import type { FormRules } from 'element-plus'
import { SystemSHDBPlatformParameterForm } from '@/types/apiType/system'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        const formRef = useFormRef()

        const pageData = ref({
            // 获取到的地址
            defaultServerAddress: '',
            serverAddress: '',
            defaultPort: 0,
            defaultResolution: '',
            resolutionList: [] as SelectOption<string, string>[],
            defaultLevel: '',
            levelList: [] as SelectOption<string, string>[],
            defaultHoldTime: '',
            // 时间单位
            unit: '',
            holdTimeList: [] as SelectOption<string, string>[],
        })

        const formData = ref(new SystemSHDBPlatformParameterForm())

        const formRule = ref<FormRules>({
            ip: [
                {
                    validator(_rule, value: string, callback) {
                        if (formData.value.isDomain) {
                            if (formData.value.domain === '') {
                                callback(new Error(Translate('IDCS_DOMAIN_NAME_EMPTY')))
                                return
                            } else if (!checkDomain(formData.value.domain)) {
                                callback(new Error(Translate('IDCS_TEST_DDNS_INVALID_HOSTNAME')))
                                return
                            }
                        } else {
                            if (!value || value === '0.0.0.0') {
                                callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_EMPTY')))
                                return
                            } else if (!checkIpV4(value)) {
                                callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_INVALID')))
                                return
                            }
                        }
                    },
                    trigger: 'manual',
                },
            ],
        })

        const getData = async () => {
            openLoading()
            const res = await querySHDBParam()
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.defaultServerAddress = $('content/platformParam/serverAddr').attr('default') || '180.166.128.182'
                pageData.value.serverAddress = $('content/platformParam/serverAddr').text()
                pageData.value.defaultPort = $('content/platformParam/port').attr('default').num() || 5901

                pageData.value.defaultResolution = $('content/snapParam/resolution').attr('default') || 'CIF'
                pageData.value.resolutionList = $('content/snapParam/resolutionNote')
                    .text()
                    .array()
                    .map((item) => ({
                        value: item.trim(),
                        label: item.trim(),
                    }))
                pageData.value.defaultLevel = $('content/snapParam/level').attr('default') || 'medium'
                pageData.value.levelList = $('content/snapParam/levelNote')
                    .text()
                    .array()
                    .reverse()
                    .map((item) => ({
                        value: item.trim(),
                        label: Translate(`IDCS_${item.trim().toUpperCase()}`),
                    }))
                pageData.value.defaultHoldTime = $('content/snapParam/holdTime').attr('default') || '3'
                pageData.value.unit = $('content/snapParam/holdTime').attr('unit')
                pageData.value.holdTimeList = $('content/snapParam/holdTimeNote')
                    .text()
                    .array()
                    .map((item) => ({
                        value: item.trim(),
                        label: getTranslateForSecond(Number(item.trim())),
                    }))

                formData.value.enable = $('content/platformParam/switch').text().bool()
                formData.value.proxyId = $('content/platformParam/proxyId').text()
                formData.value.port = $('content/platformParam/port').text().num() || pageData.value.defaultPort

                formData.value.resolution = $('content/snapParam/resolution').text() || pageData.value.defaultResolution
                formData.value.level = $('content/snapParam/level').text() || pageData.value.defaultLevel
                formData.value.holdTime = $('content/snapParam/holdTime').text() || pageData.value.defaultHoldTime
                formData.value.isDomain = true

                setIpValue(pageData.value.serverAddress)
            }
        }

        const setDefault = () => {
            formData.value.proxyId = ''
            setIpValue(pageData.value.defaultServerAddress)
            formData.value.port = pageData.value.defaultPort
            formData.value.resolution = pageData.value.defaultResolution
            formData.value.level = pageData.value.defaultLevel
            formData.value.holdTime = pageData.value.defaultHoldTime
        }

        const getSavaData = () => {
            const sendXml = rawXml`
                <content>
                    <platformParam>
                        <switch>${formData.value.enable}</switch>
                        <proxyId><![CDATA[${formData.value.proxyId}]]></proxyId>
                        <serverAddr default='${pageData.value.defaultServerAddress}'>
                            <![CDATA[${formData.value.isDomain ? formData.value.domain : formData.value.ip}]]>
                        </serverAddr>
                        <port default='${pageData.value.defaultPort}'>${formData.value.port}</port>
                    </platformParam>
                    <snapParam>
                        <resolution default='${pageData.value.defaultResolution}'>${formData.value.resolution}</resolution>
                        <level default='${pageData.value.defaultLevel}'>${formData.value.level}</level>
                        <holdTime default='${pageData.value.defaultHoldTime}' unit='${pageData.value.unit}'>${formData.value.holdTime}</holdTime>
                    </snapParam>
                </content>
            `
            return sendXml
        }

        const setData = async () => {
            const valid = await formRef.value!.validate()
            if (!valid) return

            const sendXml = getSavaData()
            openLoading()
            const result = await editSHDBParam(sendXml)
            commSaveResponseHandler(result)
            closeLoading()
        }

        // 根据获取到的地址设置ip或者域名
        const setIpValue = (value: string) => {
            if (checkIpV4(value)) {
                formData.value.isDomain = false
                formData.value.ip = value
            } else {
                formData.value.isDomain = true
                formData.value.domain = value
            }
        }

        const changeIp = (value: string) => {
            formData.value.ip = value
        }

        onMounted(() => {
            getData()
        })

        return {
            formRef,
            formData,
            formRule,
            pageData,
            changeIp,
            setDefault,
            setData,
        }
    },
})
