/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:36:48
 * @Description: 回放-远程备份任务 加密弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-08 11:04:10
 */
import type { FormInstance, FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 是否加密
         */
        encrypt: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
    emits: {
        close() {
            return true
        },
        confirm(password: string) {
            return typeof password === 'string'
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const formRef = ref<FormInstance>()
        const formData = ref({
            encrypt: 'encrypted',
            password: '',
            confirmPassword: '',
        })
        const formRule = ref<FormRules>({
            password: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (formData.value.encrypt === 'unencrypted') {
                            callback()
                            return
                        }

                        if (!value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'blur',
                },
            ],
            confirmPassword: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (formData.value.encrypt === 'unencrypted') {
                            callback()
                            return
                        }

                        if (!value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }

                        if (value !== formData.value.password) {
                            callback(new Error(Translate('IDCS_PWD_MISMATCH_TIPS')))
                            return
                        }
                        callback()
                    },
                    trigger: 'blur',
                },
            ],
        })

        const pageData = ref({
            // 是否显示密码
            showPassword: false,
        })

        /**
         * @description 验证表单后，关闭弹窗
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    if (formData.value.encrypt === 'encrypted') {
                        ctx.emit('confirm', MD5_encrypt(formData.value.password))
                    } else {
                        ctx.emit('confirm', '')
                    }
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
         * @description 打开弹窗时，重置表单
         */
        const open = () => {
            formRef.value?.clearValidate()
            formRef.value?.resetFields()
            if (prop.encrypt === false) {
                formData.value.encrypt = 'unencrypted'
            } else {
                formData.value.encrypt = 'encrypt'
            }
        }

        return {
            formData,
            formRule,
            formRef,
            pageData,
            open,
            verify,
            close,
        }
    },
})
