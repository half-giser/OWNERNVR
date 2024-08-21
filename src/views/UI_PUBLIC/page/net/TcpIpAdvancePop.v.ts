/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 10:41:09
 * @Description: TCP/IP高级配置弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-20 11:14:24
 */
import { type NetTcpIpForm, NetTcpIpAdvanceForm } from '@/types/apiType/net'
import type { FormInstance, FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property TCP/IP表单数据
         */
        data: {
            type: Object as PropType<NetTcpIpForm>,
            required: true,
        },
    },
    emits: {
        confirm(data: NetTcpIpAdvanceForm, index: number) {
            return !!data && typeof index === 'number'
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const formRef = ref<FormInstance>()
        const formData = ref(new NetTcpIpAdvanceForm())
        const formRule = ref<FormRules>({
            secondIp: [
                {
                    validator(rule, value: string, callback) {
                        if (pageData.value.secondIpIndex === -1 || !formData.value.secondIpSwitch) {
                            callback()
                            return
                        }
                        if (!checkIpV4(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_INVALID')))
                            return
                        }
                        if (pageData.value.ipList.includes(value)) {
                            callback(new Error(Translate('IDCS_IP_USED')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            secondMask: [
                {
                    validator(rule, value, callback) {
                        if (pageData.value.secondIpIndex === -1 || !formData.value.secondIpSwitch) {
                            callback()
                            return
                        }
                        if (!checkIpV4(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_SUBNET_MASK_INVALID')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const pageData = ref({
            secondIpIndex: -1,
            ipList: [] as string[],
        })

        /**
         * @description 显示标题文本
         * @param {Number} i
         * @returns {String}
         */
        const displayTitle = (i: number) => {
            if (prop.data.netConfig.curWorkMode === 'network_fault_tolerance') {
                return Translate('IDCS_FAULT_ETH_NAME').formatForLang(i + 1)
            }
            return Translate('IDCS_ETH_NAME').formatForLang(i + 1)
        }

        /**
         * @description 打开弹窗时重置表单
         */
        const open = () => {
            pageData.value.secondIpIndex = -1
            pageData.value.ipList = []

            formRef.value?.clearValidate()
            formRef.value?.resetFields()

            if (prop.data.netConfig.curWorkMode === 'network_fault_tolerance') {
                formData.value.mtu = prop.data.bonds.map((item) => item.mtu)
            } else {
                formData.value.mtu = prop.data.nicConfigs
                    .filter((item, index) => {
                        pageData.value.ipList.push(item.ip)
                        // 单网口才支持辅ip
                        if (item.isSupSecondIP) {
                            formData.value.secondIpSwitch = item.secondIpSwitch
                            formData.value.secondIp = item.secondIp
                            formData.value.secondMask = item.secondMask
                            formData.value.dhcpSwitch = item.dhcpSwitch
                            pageData.value.secondIpIndex = index
                            // 勾选了自动获取开关不可设置辅ip
                            if (formData.value.dhcpSwitch) {
                                formData.value.secondIpSwitch = false
                            }
                        }
                        return !item.isPoe
                    })
                    .map((item) => item.mtu)
            }
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 表单数据验证通过后 确认表单
         */
        const verify = () => {
            formRef.value?.validate((valid) => {
                if (valid) {
                    ctx.emit('confirm', formData.value, pageData.value.secondIpIndex)
                }
            })
        }

        return {
            formRule,
            formData,
            formRef,
            open,
            close,
            verify,
            displayTitle,
        }
    },
})
