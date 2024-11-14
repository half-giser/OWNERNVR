/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 13:36:25
 * @Description: POS连接设置
 */
import { type FormInstance, type FormRules } from 'element-plus'
import { SystemPosList, SystemPosConnectionForm } from '@/types/apiType/system'

export default defineComponent({
    props: {
        /**
         * @property POS配置数据
         */
        data: {
            type: Object as PropType<SystemPosList>,
            default: () => new SystemPosList(),
        },
    },
    emits: {
        confirm(e: SystemPosConnectionForm) {
            return e
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const formRef = ref<FormInstance>()
        const formData = ref(new SystemPosConnectionForm())

        const rules = ref<FormRules>({
            ip: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value || value === '0.0.0.0') {
                            callback(new Error(Translate('IDCS_POS_IP_EMPTY')))
                            return
                        }

                        if (!/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_INVALID')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            port: [
                {
                    validator: (_rule, value: number | null | undefined, callback) => {
                        if (formData.value.switch) {
                            if (!value) {
                                callback(new Error(Translate('IDCS_POS_PORT_EMPTY')))
                                return
                            }

                            if (value < 10 || value > 65535) {
                                callback(new Error(Translate('IDCS_PROMPT_PORT_INVALID')))
                                return
                            }
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 验证表单，保存数据
         */
        const verify = () => {
            formRef.value?.validate((valid) => {
                if (valid) {
                    ctx.emit('confirm', {
                        ip: formData.value.ip,
                        port: formData.value.port,
                        switch: prop.data.connectionType === 'TCP-Listen' ? formData.value.switch : true,
                    })
                }
            })
        }

        /**
         * @description 打开弹窗时，初始化弹窗数据
         */
        const open = () => {
            formRef.value?.clearValidate()
            formRef.value?.resetFields()
            formData.value.ip = prop.data.connectionSetting.posIp || '0.0.0.0'
            formData.value.switch = prop.data.connectionSetting.filterPostPortSwitch
            if (prop.data.connectionType === 'TCP-Listen') {
                formData.value.port = formData.value.switch ? prop.data.connectionSetting.posPort : undefined
            } else {
                formData.value.port = prop.data.connectionSetting.posPort
            }
        }

        const changeSwitch = () => {
            if (!formData.value.switch) {
                formData.value.port = undefined
            }
        }

        return {
            formRef,
            formData,
            open,
            verify,
            close,
            rules,
            changeSwitch,
        }
    },
})
