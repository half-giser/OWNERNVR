/*
 * @Date: 2025-04-27 14:03:11
 * @Description: 登录双重认证弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
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
    },
    setup(_prop, ctx) {
        const { Translate } = useLangStore()
        const formRef = useFormRef()
        const formData = ref(new UserDualAuthLoginForm())
        const userSession = useUserSessionStore()
        const layoutStore = useLayoutStore()

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
                    const nonce = userSession.nonce ? userSession.nonce : ''
                    ctx.emit('confirm', {
                        username: formData.value.username,
                        password: sha512_encrypt(MD5_encrypt(formData.value.password) + '#' + nonce),
                    })
                }
            })
        }

        /**
         * @description 开启弹窗
         */
        const open = () => {
            layoutStore.isAuth = true
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
            layoutStore.isAuth = false
        }

        return {
            formRef,
            formData,
            open,
            close,
            verify,
            rules,
        }
    },
})
