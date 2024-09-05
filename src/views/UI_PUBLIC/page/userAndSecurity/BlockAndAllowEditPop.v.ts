/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 10:38:53
 * @Description: 编辑黑白名单弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 14:16:10
 */
import { UserEditBlackAllowListForm } from '@/types/apiType/userAndSecurity'
import { type FormInstance, type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 当前编辑数据
         */
        data: {
            type: Object as PropType<UserEditBlackAllowListForm>,
            required: true,
        },
        /**
         * @property 列表索引
         */
        index: {
            type: Number,
            required: true,
        },
        /**
         * @property 列表数据
         */
        tableData: {
            type: Array as PropType<UserEditBlackAllowListForm[]>,
            required: true,
        },
    },
    emits: {
        confirm(data: UserEditBlackAllowListForm) {
            return !!data
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const formRef = ref<FormInstance>()
        const formData = ref(new UserEditBlackAllowListForm())
        const rules = ref<FormRules>({
            ip: [
                {
                    validator: (rule, value: string, callback) => {
                        if (formData.value.addressType !== 'ip') {
                            callback()
                            return
                        }
                        if (!value || value === '0.0.0.0') {
                            callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_EMPTY')))
                            return
                        }
                        const findIndex = prop.tableData.findIndex((item) => item.ip === value)
                        if (findIndex > -1 && findIndex !== prop.index) {
                            callback(new Error(Translate('IDCS_IP_ADDRESS_REPEAT_LIMIT')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            startIp: [
                {
                    validator: (rule, value: string, callback) => {
                        if (formData.value.addressType !== 'iprange') {
                            callback()
                            return
                        }
                        if (startIpNum.value === 0) {
                            callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_EMPTY')))
                            return
                        }
                        if (startIpNum.value > endIpNum.value) {
                            callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_COMPARE')))
                            return
                        }
                        const findIndex = prop.tableData.findIndex((item) => item.startIp === value && item.endIp === formData.value.endIp)
                        if (findIndex > -1 && findIndex !== prop.index) {
                            callback(new Error(Translate('IDCS_IP_ADDRESS_REPEAT_LIMIT')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            endIp: [
                {
                    validator: (rule, value, callback) => {
                        if (formData.value.addressType !== 'iprange') {
                            callback()
                            return
                        }
                        if (endIpNum.value === 0) {
                            callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            mac: [
                {
                    validator: (rule, value: string, callback) => {
                        if (formData.value.addressType !== 'mac') {
                            callback()
                            return
                        }
                        if (value === '00:00:00:00:00:00') {
                            callback(new Error(Translate('IDCS_PROMPT_MACADDRESS_INVALID')))
                            return
                        }
                        const findIndex = prop.tableData.findIndex((item) => item.mac === value)
                        if (findIndex > -1 && findIndex !== prop.index) {
                            callback(new Error(Translate('IDCS_MAC_ADDRESS_REPEAT_LIMIT')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 返回IP十进制数值
         * @param {string} ip
         * @returns {number}
         */
        const getIpNumber = (ip: string) => {
            const split = ip.split('.')
            return split.reduce((sum, current, index) => {
                return Number(sum) + Number(current) * Math.pow(Math.pow(2, 8), split.length - 1 - index)
            }, 0)
        }

        // 开始IP段的十进制数值
        const startIpNum = computed(() => {
            return getIpNumber(formData.value.startIp)
        })

        // 结束IP段的十进制数值
        const endIpNum = computed(() => {
            return getIpNumber(formData.value.endIp)
        })

        // 标题
        const title = computed(() => {
            if (formData.value.addressType === 'mac') {
                if (prop.index === -1) return Translate('IDCS_ADD_MAC')
                else return Translate('IDCS_EDIT_MAC')
            } else {
                if (prop.index === -1) return Translate('IDCS_ADD_IP')
                else return Translate('IDCS_EDIT_IP')
            }
        })

        /**
         * @description 验证表单，验证通过则关闭弹窗，往表格添加/更新数据
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    ctx.emit('confirm', formData.value)
                }
            })
        }

        /**
         * @description 关闭弹窗，不执行任何操作
         */
        const goBack = () => {
            ctx.emit('close')
        }

        /**
         * @description 开启弹窗时更新表单数据
         */
        const handleOpen = () => {
            formRef.value?.clearValidate()
            formData.value.switch = prop.data.switch
            formData.value.addressType = prop.data.addressType
            formData.value.ip = prop.data.ip
            formData.value.startIp = prop.data.startIp
            formData.value.endIp = prop.data.endIp
            formData.value.mac = prop.data.mac
        }

        return {
            formRef,
            formData,
            rules,
            verify,
            goBack,
            handleOpen,
            title,
        }
    },
})
