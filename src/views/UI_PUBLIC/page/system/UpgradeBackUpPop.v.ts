/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 16:34:38
 * @Description: 系统升级-备份弹窗
 */
import type { FormInstance, FormRules } from 'element-plus'
import { SystemUpgradeBackUpForm } from '@/types/apiType/system'

export default defineComponent({
    emits: {
        confirm(filePath: string) {
            return filePath.length
        },
    },
    setup(_prop, ctx) {
        const Plugin = inject('Plugin') as PluginType
        const { Translate } = useLangStore()

        const formRef = ref<FormInstance>()

        const formData = ref(new SystemUpgradeBackUpForm())

        const rules = ref<FormRules>({
            filePath: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value) {
                            callback(new Error(Translate('IDCS_SELECT_PATH')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 通知插件选择文件
         */
        const chooseFile = () => {
            const sendXML = OCX_XML_OpenFileBrowser('SAVE_FILE', undefined, 'ConfigurationBackupFile')
            Plugin.AsynQueryInfo(Plugin.GetVideoPlugin(), sendXML, (result) => {
                const path = OCX_XML_OpenFileBrowser_getpath(result).trim()
                if (path) {
                    formData.value.filePath = path
                }
            })
        }

        /**
         * @description 验证表单
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    ctx.emit('confirm', formData.value.filePath)
                }
            })
        }

        /**
         * @description 打开弹窗时清空表单
         */
        const opened = () => {
            formRef.value?.clearValidate()
            formData.value = new SystemUpgradeBackUpForm()
            formRef.value?.clearValidate()
        }

        return {
            chooseFile,
            formRef,
            formData,
            rules,
            verify,
            opened,
        }
    },
})
