/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-19 14:43:09
 * @Description: 本地配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-19 16:26:10
 */
import type { FormInstance, FormRules } from 'element-plus'
import { SystemLocalConfig } from '@/types/apiType/system'

export default defineComponent({
    setup() {
        const Plugin = inject('Plugin') as PluginType
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const pluginStore = usePluginStore()

        // 播放器模式
        const mode = computed(() => {
            return pluginStore.currPluginMode
        })

        const pageData = ref({
            // 是否禁用修改表单
            disabled: true,
            // 抓图数量最大值
            maxSnap: 10,
        })

        const formRef = ref<FormInstance>()

        const formData = ref(new SystemLocalConfig())

        const formRule = ref<FormRules>({
            liveSnapSavePath: [
                {
                    validator(rule, value, callback) {
                        if (!value) {
                            callback(new Error(Translate('IDCS_FTP_SAVE_PATH_ISEMPTY')))
                            return
                        }
                        callback()
                    },
                },
            ],
            recSavePath: [
                {
                    validator(rule, value, callback) {
                        if (!value) {
                            callback(new Error(Translate('IDCS_FTP_SAVE_PATH_ISEMPTY')))
                            return
                        }
                        callback()
                    },
                },
            ],
        })

        /**
         * @description 获取回显表单数据
         */
        const getData = () => {
            try {
                Plugin.AsynQueryInfo(Plugin.GetVideoPlugin(), OCX_XML_GetLocalCfg(), (result) => {
                    const doc = XMLStr2XMLDoc(result)
                    const $ = queryXml(doc)
                    formData.value.snapCount = Number($('//snapCount').text())
                    formData.value.liveSnapSavePath = $('//liveSnapSavePath').text()
                    formData.value.recSavePath = $('//recSavePath').text()
                    formData.value.recBackUpPath = $('//recBackUpPath').text()
                })
            } catch {
                openMessageTipBox({
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
                Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                openMessageTipBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
            } catch {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_SAVE_DATA_FAIL'),
                })
            }
        }

        /**
         * @description 修改抓图保存路径
         */
        const changeSnapSavePath = () => {
            Plugin.AsynQueryInfo(Plugin.GetVideoPlugin(), OCX_XML_OpenFileBrowser('FOLDER'), (result) => {
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
            Plugin.AsynQueryInfo(Plugin.GetVideoPlugin(), OCX_XML_OpenFileBrowser('FOLDER'), (result) => {
                const path = OCX_XML_OpenFileBrowser_getpath(result).trim()
                if (path) {
                    formData.value.recSavePath = path
                }
            })
        }

        watch(
            mode,
            (newVal) => {
                if (newVal === 'ocx' && !Plugin.IsPluginAvailable()) {
                    Plugin.SetPluginNoResponse()
                    Plugin.ShowPluginNoResponse()
                }
                if (newVal === 'ocx') {
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                    Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    pageData.value.disabled = false
                    getData()
                }
            },
            {
                immediate: true,
            },
        )

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
