/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 10:52:55
 * @Description: UPnP上报
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-15 10:29:32
 */
import { type FormInstance, type FormRules } from 'element-plus'
import { NetUPnPReportForm } from '@/types/apiType/net'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const formRef = ref<FormInstance>()
        const formData = ref(new NetUPnPReportForm())
        const formRule = ref<FormRules>({
            serverAddr: {
                validator(rule, value: string, callback) {
                    if (!formData.value.switch) {
                        callback()
                        return
                    }
                    if (!value.length) {
                        callback(new Error(Translate('IDCS_DDNS_SERVER_ADDR_EMPTY')))
                        return
                    }
                    if (!cutStringByByte(value, nameByteMaxLen)) {
                        callback(new Error('IDCS_INVALID_CHAR'))
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
            if ($('/response/content/reportPorts').length) {
                pageData.value.upnpSwitch = $('/response/content/switch').text().toBoolean()
                formData.value.switch = $('/response/content/reportPorts/switch').text().toBoolean()
                formData.value.serverAddr = $('/response/content/reportPorts/serverAddr').text()
                formData.value.port = Number($('/response/content/reportPorts/port').text())
                formData.value.manId = $('/response/content/reportPorts/manId').text()
            }
        }

        /**
         * @description 提交表单
         */
        const setData = () => {
            // TODO 在未启用、serverAddr和manId为空的情况下点击确认，会返回fail无效参数（原项目也存在这个问题）
            formRef.value!.validate(async (valid: boolean) => {
                if (!valid) {
                    return
                }
                openLoading(LoadingTarget.FullScreen)

                const sendXml = rawXml`
                    <content>
                        <reportPorts>
                            <serverAddr>${formData.value.serverAddr}</serverAddr>
                            <manId>${formData.value.manId}</manId>
                            <port>${formData.value.port.toString()}</port>
                            <switch>${formData.value.switch.toString()}</switch>
                        </reportPorts>
                    </content>
                `
                const result = await editUPnPCfg(sendXml)
                commSaveResponseHadler(result)

                closeLoading(LoadingTarget.FullScreen)
            })
        }

        /**
         * @description 更改启用复选框事件回调
         */
        const changeSwitch = () => {
            if (formData.value.switch && !pageData.value.upnpSwitch) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_ENABLE_UPNP_REPORT_TIPS'),
                })
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
            nameByteMaxLen,
            formatInputMaxLength,
            changeSwitch,
        }
    },
})
