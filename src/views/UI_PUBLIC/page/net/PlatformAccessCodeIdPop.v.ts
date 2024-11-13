/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-16 14:52:59
 * @Description: 平台接入 设置Code ID弹窗
 */
import { type FormInstance, type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 编码ID列表
         */
        codeList: {
            type: Array as PropType<string[]>,
            default: () => [],
        },
        /**
         * @property 名称
         */
        name: {
            type: String,
            default: '',
        },
        /**
         * @property Code
         */
        code: {
            type: String,
            default: '',
        },
    },
    emits: {
        confirm(code: string) {
            return typeof code === 'string'
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const formRef = ref<FormInstance>()
        const formData = ref({
            name: '',
            code: '',
        })

        const formRule = ref<FormRules>({
            code: [
                {
                    validator(_rule, value: string, callback) {
                        if (prop.codeList.includes(value) && value !== prop.code) {
                            callback(new Error(Translate('IDCS_SIP_ID_REPEAT')))
                            return
                        }

                        if (!/^\d{20}$/.test(value)) {
                            callback(new Error(Translate('IDCS_SIP_ID_INVALID')))
                            return
                        }

                        callback()
                    },
                    trigger: 'blur',
                },
            ],
        })

        /**
         * @description 打开弹窗时重置表单
         */
        const open = () => {
            formRef.value?.clearValidate()
            formData.value.name = prop.name
            formData.value.code = prop.code
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 校验表单
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    ctx.emit('confirm', formData.value.code)
                }
            })
        }

        return {
            formRef,
            formData,
            formRule,
            open,
            verify,
            close,
            confirm,
            formatDigit,
        }
    },
})
