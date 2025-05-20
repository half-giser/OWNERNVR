/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 16:34:38
 * @Description: 系统升级-备份弹窗
 */
import type { FormRules } from 'element-plus'

export default defineComponent({
    emits: {
        confirm(filePath: string) {
            return filePath.length
        },
    },
    setup(_prop, ctx) {
        const plugin = usePlugin()
        const { Translate } = useLangStore()

        const formRef = useFormRef()

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
            plugin.AsynQueryInfo(sendXML, (result) => {
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

        return {
            chooseFile,
            formRef,
            formData,
            rules,
            verify,
        }
    },
})
