/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 10:52:55
 * @Description: UPnP上报
 */
import { type FormRules } from 'element-plus'
import { NetUPnPReportForm } from '@/types/apiType/net'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        const formRef = useFormRef()
        const formData = ref(new NetUPnPReportForm())
        const formRule = ref<FormRules>({
            serverAddr: {
                validator(_rule, value: string, callback) {
                    if (!formData.value.switch) {
                        callback()
                        return
                    }

                    if (!value.trim()) {
                        callback(new Error(Translate('IDCS_DDNS_SERVER_ADDR_EMPTY')))
                        return
                    }

                    if (!cutStringByByte(value, nameByteMaxLen)) {
                        callback(new Error(Translate('IDCS_INVALID_CHAR')))
                        return
                    }

                    callback()
                },
            },
        })
        const pageData = ref({
            // UPnP开关
            upnpSwitch: false,
        })

        /**
         * @description 获取数据
         */
        const getData = async () => {
            const result = await queryUPnPCfg()
            const $ = queryXml(result)
            if ($('content/reportPorts').length) {
                pageData.value.upnpSwitch = $('content/switch').text().bool()
                formData.value.switch = $('content/reportPorts/switch').text().bool()
                formData.value.serverAddr = $('content/reportPorts/serverAddr').text()
                formData.value.port = $('content/reportPorts/port').text().num()
                formData.value.manId = $('content/reportPorts/manId').text()
            }
        }

        /**
         * @description 提交表单
         */
        const setData = () => {
            // TODO 在未启用、serverAddr和manId为空的情况下点击确认，会返回fail无效参数（原项目也存在这个问题）
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }
                openLoading()

                const sendXml = rawXml`
                    <content>
                        <reportPorts>
                            <serverAddr maxByteLen="63">${wrapCDATA(formData.value.serverAddr)}</serverAddr>
                            <manId>${formData.value.manId}</manId>
                            <port>${formData.value.port}</port>
                            <switch>${formData.value.switch}</switch>
                        </reportPorts>
                    </content>
                `
                const result = await editUPnPCfg(sendXml)
                commSaveResponseHandler(result)

                closeLoading()
            })
        }

        /**
         * @description 更改启用复选框事件回调
         */
        const changeSwitch = () => {
            if (formData.value.switch && !pageData.value.upnpSwitch) {
                openMessageBox(Translate('IDCS_ENABLE_UPNP_REPORT_TIPS'))
            }
        }

        onMounted(() => {
            getData()
        })

        return {
            formRef,
            formData,
            formRule,
            setData,
            formatInputMaxLength,
            changeSwitch,
        }
    },
})
