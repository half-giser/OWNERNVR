/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-07 15:00:44
 * @Description: 账号密码权限认证弹窗
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 弹窗标题
         */
        title: {
            type: String,
            default: 'IDCS_SUPER_USER_CERTIFICATION_RIGHT',
        },
        /**
         * @property 提示文本
         */
        tip: {
            type: String,
            default: '',
        },
        /**
         * @property 确认按钮文本
         */
        confirmText: {
            type: String,
            default: 'IDCS_OK',
        },
    },
    emits: {
        confirm(data: UserCheckAuthForm) {
            return !!data
        },
        close() {
            return true
        },
    },
    setup(_prop, ctx) {
        const { Translate } = useLangStore()
        const formRef = useFormRef()
        const formData = ref(new UserCheckAuthForm())
        const userSession = useUserSessionStore()
        const layoutStore = useLayoutStore()

        // 校验规则
        const rules = reactive<FormRules>({
            userName: [
                {
                    required: true,
                    message: Translate('IDCS_PROMPT_USERNAME_EMPTY'),
                    trigger: 'manual',
                },
            ],
            password: [
                {
                    required: true,
                    message: Translate('IDCS_PROMPT_PASSWORD_EMPTY'),
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
                    formData.value.hexHash = sha512_encrypt(MD5_encrypt(formData.value.password) + '#' + nonce)
                    ctx.emit('confirm', formData.value)
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
