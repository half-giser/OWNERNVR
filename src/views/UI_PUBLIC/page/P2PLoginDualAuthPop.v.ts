/*
 * @Date: 2025-04-29 23:26:59
 * @Description: P2P双重验证弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        errMsg: {
            type: String,
            default: ' ',
        },
    },
    emits: {
        confirm(data: UserDualAuthLoginForm) {
            return !!data
        },
        close() {
            return true
        },
        destroy() {
            return true
        },
    },
    setup(_prop, ctx) {
        const { Translate } = useP2PLang()

        const formRef = useFormRef()
        const formData = ref(new UserDualAuthLoginForm())

        // 校验规则
        const rules = reactive<FormRules>({
            username: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_USERNAME_EMPTY')))
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            password: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }

                        if (value.length > 16) {
                            callback(new Error(Translate('IDCS_LOGIN_FAIL_REASON_U_P_ERROR')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 认证表单数据
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    ctx.emit('confirm', {
                        username: formData.value.username,
                        password: formData.value.password,
                    })
                }
            })
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            formRef.value?.resetFields()
            ctx.emit('close')
        }

        const destroy = () => {
            ctx.emit('destroy')
        }

        return {
            Translate,
            formRef,
            formData,
            open,
            close,
            verify,
            rules,
            destroy,
        }
    },
})
