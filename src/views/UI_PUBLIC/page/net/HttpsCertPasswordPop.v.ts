/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-15 17:12:04
 * @Description: 证书加密密码弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-15 20:24:06
 */
import { type FormInstance, type FormRules } from 'element-plus'
import { NetHTTPSCertPasswordForm } from '@/types/apiType/net'

export default defineComponent({
    emits: {
        confirm(e: NetHTTPSCertPasswordForm) {
            return (e.encryption === 'unencrypted' && !e.password) || (e.encryption === 'encrypted' && e.password)
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
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

        const formRef = ref<FormInstance>()
        const formData = ref(new NetHTTPSCertPasswordForm())
        const formRule = ref<FormRules>({
            password: [
                {
                    validator: (rule, value: string, callback) => {
                        if (!value.length && formData.value.encryption === 'encrypted') {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }
                        callback()
                        return
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 验证表单，通过后回传信息
         */
        const verify = () => {
            formRef.value!.validate((valid: boolean) => {
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
        const opened = () => {
            formRef.value?.clearValidate()
            formRef.value?.resetFields()
        }

        return {
            pageData,
            formData,
            formRule,
            formRef,
            verify,
            close,
            opened,
        }
    },
})
