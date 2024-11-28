/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-19 14:43:09
 * @Description: 本地配置
 */
import type { FormRules } from 'element-plus'
import { SystemLocalConfig } from '@/types/apiType/system'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()

        const plugin = usePluginHook({
            onReady: (mode, plugin) => {
                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    pageData.value.disabled = false
                    getData()
                }
            },
        })

        const pageData = ref({
            // 是否禁用修改表单
            disabled: true,
            // 抓图数量最大值
            maxSnap: 10,
            snapOptions: Array(10)
                .fill(1)
                .map((item, index) => {
                    const value = item + index
                    return {
                        label: value,
                        value,
                    }
                }),
        })

        const formRef = useFormRef()

        const formData = ref(new SystemLocalConfig())

        const formRule = ref<FormRules>({
            liveSnapSavePath: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value) {
                            callback(new Error(Translate('IDCS_FTP_SAVE_PATH_ISEMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            recSavePath: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value) {
                            callback(new Error(Translate('IDCS_FTP_SAVE_PATH_ISEMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 获取回显表单数据
         */
        const getData = () => {
            try {
                plugin.AsynQueryInfo(plugin.GetVideoPlugin(), OCX_XML_GetLocalCfg(), (result) => {
                    const doc = XMLStr2XMLDoc(result)
                    const $ = queryXml(doc)
                    formData.value.snapCount = $('response/snapCount').text().num()
                    formData.value.liveSnapSavePath = $('response/liveSnapSavePath').text()
                    formData.value.recSavePath = $('response/recSavePath').text()
                    formData.value.recBackUpPath = $('response/recBackUpPath').text()
                })
            } catch {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_QUERY_DATA_FAIL'),
                })
            }
        }

        /**
         * @description 验证表单
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    setData()
                }
            })
        }

        /**
         * @description 保存修改
         */
        const setData = () => {
            try {
                const sendXML = OCX_XML_SetLocalCfg(formData.value.snapCount, formData.value.liveSnapSavePath, formData.value.recSavePath, formData.value.recBackUpPath)
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
            } catch {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_SAVE_DATA_FAIL'),
                })
            }
        }

        /**
         * @description 修改抓图保存路径
         */
        const changeSnapSavePath = () => {
            plugin.AsynQueryInfo(plugin.GetVideoPlugin(), OCX_XML_OpenFileBrowser('FOLDER'), (result) => {
                const path = OCX_XML_OpenFileBrowser_getpath(result).trim()
                if (path) {
                    formData.value.liveSnapSavePath = path
                }
            })
        }

        /**
         * @description 修改录像文件保存路径
         */
        const changeRecSavePath = () => {
            plugin.AsynQueryInfo(plugin.GetVideoPlugin(), OCX_XML_OpenFileBrowser('FOLDER'), (result) => {
                const path = OCX_XML_OpenFileBrowser_getpath(result).trim()
                if (path) {
                    formData.value.recSavePath = path
                }
            })
        }

        return {
            pageData,
            formRef,
            formData,
            formRule,
            verify,
            changeSnapSavePath,
            changeRecSavePath,
        }
    },
})
