/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-07 15:00:44
 * @Description: 加密密码弹窗
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 弹窗标题
         */
        title: {
            type: String,
            default: 'IDCS_EXPORT',
        },
        /**
         * @property 提示文本
         */
        tip: {
            type: String,
            default: '',
        },
        /**
         * @property NT2-3154 隐藏取消按钮
         */
        upgradeFlag: {
            type: Boolean,
            default: false,
        },
        /**
         * @property {sha512 | md5}
         */
        encrypt: {
            type: String as PropType<'sha512' | 'md5'>,
            default: 'sha512',
        },
    },
    emits: {
        confirm(data: UserInputEncryptPwdForm) {
            return !!data
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()

        const formRef = useFormRef()
        const formData = ref(new UserInputEncryptPwdForm())
        const isShowPassord = ref(false)

        // 校验规则
        const rules = reactive<FormRules>({
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
                    let password = ''
                    if (prop.encrypt === 'md5') {
                        password = MD5_encrypt(formData.value.password)
                    } else {
                        password = AES_encrypt(formData.value.password, userSession.sesionKey)
                    }
                    ctx.emit('confirm', { password })
                }
            })
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        return {
            formRef,
            formData,
            isShowPassord,
            rules,
            verify,
            close,
        }
    },
})
