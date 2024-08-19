/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-16 14:52:59
 * @Description: 平台接入 设置Code ID弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-16 18:10:18
 */
import { type FormInstance, type FormRules } from 'element-plus'
import { formatDigit } from '@/utils/formats'

export default defineComponent({
    props: {
        codeList: {
            type: Array as PropType<string[]>,
            default: () => [],
        },
        name: {
            type: String,
            default: '',
        },
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
                    validator(rule, value: string, callback) {
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

        const open = () => {
            formRef.value?.clearValidate()
            formRef.value?.resetFields()
            formData.value.name = prop.name
            formData.value.code = prop.code
        }

        const close = () => {
            ctx.emit('close')
        }

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
