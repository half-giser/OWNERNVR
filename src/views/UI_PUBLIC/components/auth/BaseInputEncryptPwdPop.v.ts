/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-07 15:00:44
 * @Description: 加密密码弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-12 09:47:41
 */
import { type FormInstance, type FormRules } from 'element-plus'
import { UserInputEncryptPwdForm } from '@/types/apiType/user'

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
         * @property 显示密码
         */
        decryptFlag: {
            type: Boolean,
            default: false,
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
        const { Translate } = inject('appGlobalProp') as appGlobalProp
        const formRef = ref<FormInstance>()
        const formData = ref(new UserInputEncryptPwdForm())
        const isShowPassord = ref(false)

        // 校验规则
        const rules = reactive<FormRules>({
            password: [
                {
                    required: true,
                    message: Translate('IDCS_PROMPT_PASSWORD_EMPTY'),
                    trigger: 'blur',
                },
            ],
        })

        /**
         * @description 重置表单数据
         */
        const reset = () => {
            formData.value = new UserInputEncryptPwdForm()
            formRef.value?.clearValidate()
        }

        /**
         * @description 认证表单数据
         */
        const verify = () => {
            formRef.value!.validate(async (valid: boolean) => {
                if (valid) {
                    let password = ''
                    if (prop.encrypt === 'md5') {
                        password = MD5_encrypt(formData.value.password)
                    } else {
                        password = sha512_encrypt(MD5_encrypt(formData.value.password))
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
            reset,
            verify,
            close,
        }
    },
})
