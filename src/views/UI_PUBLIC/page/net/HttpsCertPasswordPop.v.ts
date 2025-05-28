/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-15 17:12:04
 * @Description: 证书加密密码弹窗
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    emits: {
        confirm(e: NetHTTPSCertPasswordForm) {
            return (e.encryption === 'unencrypted' && !e.password) || (e.encryption === 'encrypted' && e.password)
        },
        close() {
            return true
        },
    },
    setup(_prop, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
            // 是否加密选项
            options: [
                {
                    value: 'unencrypted',
                    label: Translate('IDCS_NOT_ENCRYPTED'),
                },
                {
                    value: 'encrypted',
                    label: Translate('IDCS_ENCRYPTION'),
                },
            ],
        })

        const formRef = useFormRef()
        const formData = ref(new NetHTTPSCertPasswordForm())
        const formRule = ref<FormRules>({
            password: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.length && formData.value.encryption === 'encrypted') {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 验证表单，通过后回传信息
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    ctx.emit('confirm', {
                        encryption: formData.value.encryption,
                        password: formData.value.encryption === 'unencrypted' ? '' : formData.value.password,
                    })
                }
            })
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 打开弹窗时重置表单
         */
        const open = () => {
            formData.value = new NetHTTPSCertPasswordForm()
        }

        return {
            pageData,
            formData,
            formRule,
            formRef,
            verify,
            close,
            open,
        }
    },
})
