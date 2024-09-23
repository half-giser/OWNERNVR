/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-07 15:00:44
 * @Description: 账号密码权限认证弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-20 18:11:23
 */
import { type FormInstance, type FormRules } from 'element-plus'

export class UserCheckAuthForm {
    userName = ''
    password = '' // 明文密码用于与插件的鉴权交互
    hexHash = '' // 密文密码
}

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
    setup(prop, ctx) {
        const { Translate } = inject('appGlobalProp') as appGlobalProp
        const formRef = ref<FormInstance>()
        const formData = ref(new UserCheckAuthForm())
        const userSession = useUserSessionStore()
        // 校验规则
        const rules = reactive<FormRules>({
            userName: [
                {
                    required: true,
                    message: Translate('IDCS_PROMPT_USERNAME_EMPTY'),
                    trigger: 'blur',
                },
            ],
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
            formData.value = new UserCheckAuthForm()
            formRef.value?.clearValidate()
        }

        /**
         * @description 认证表单数据
         */
        const verify = () => {
            formRef.value!.validate(async (valid: boolean) => {
                if (valid) {
                    const nonce = userSession.nonce ? userSession.nonce : ''
                    formData.value.hexHash = '' + sha512_encrypt(MD5_encrypt(formData.value.password) + '#' + nonce)
                    ctx.emit('confirm', formData.value)
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
            close,
            reset,
            verify,
            rules,
        }
    },
})
