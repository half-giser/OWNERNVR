/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 13:36:25
 * @Description: POS连接设置
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property POS配置数据
         */
        data: {
            type: Object as PropType<SystemPosList>,
            default: () => new SystemPosList(),
        },
        portList: {
            type: Array as PropType<number[]>,
            default: () => [],
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

        const formRef = useFormRef()
        const formData = ref(new SystemPosConnectionForm())

        const pageData = ref({
            posPortOptions: [
                {
                    label: Translate('IDCS_POS_PORT'),
                    value: 'remote',
                },
                {
                    label: Translate('IDCS_POS_LOCAL_RECEIVE_PORT'),
                    value: 'local',
                },
            ],
        })

        const rules = ref<FormRules>({
            ip: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value || value === DEFAULT_EMPTY_IP) {
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

                        if (prop.data.connectionType === 'UDP' && formData.value.posPortType) {
                            callback(new Error(Translate('IDCS_NETWORK_PORT_CONFLICT')))
                            return
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
            formRef.value!.validate((valid) => {
                if (valid) {
                    ctx.emit('confirm', {
                        ip: formData.value.ip,
                        port: formData.value.port,
                        switch: prop.data.connectionType === 'TCP-Listen' ? formData.value.switch : true,
                        posPortType: prop.data.connectionType === 'UDP' ? formData.value.posPortType : 'remote',
                    })
                }
            })
        }

        /**
         * @description 打开弹窗时，初始化弹窗数据
         */
        const open = () => {
            formData.value.ip = prop.data.connectionSetting.posIp || DEFAULT_EMPTY_IP
            formData.value.switch = prop.data.connectionSetting.filterPostPortSwitch
            if (prop.data.connectionType === 'TCP-Listen') {
                formData.value.port = formData.value.switch ? (prop.data.connectionSetting.posPort ? prop.data.connectionSetting.posPort : undefined) : undefined
            } else {
                formData.value.port = prop.data.connectionSetting.posPort ? prop.data.connectionSetting.posPort : undefined
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
            pageData,
        }
    },
})
