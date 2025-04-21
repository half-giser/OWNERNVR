/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:36:48
 * @Description: 回放-远程备份任务 加密弹窗
 */
import type { FormRules } from 'element-plus'

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

        const formRef = useFormRef()
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

                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            confirmPassword: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (formData.value.encrypt === 'unencrypted') {
                            callback()
                            return
                        }

                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }

                        if (value !== formData.value.password) {
                            callback(new Error(Translate('IDCS_PWD_MISMATCH_TIPS')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
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
            if (prop.encrypt === false) {
                formData.value.encrypt = 'unencrypted'
            } else {
                formData.value.encrypt = 'encrypted'
            }
        }

        return {
            formData,
            formRule,
            formRef,
            open,
            verify,
            close,
        }
    },
})
