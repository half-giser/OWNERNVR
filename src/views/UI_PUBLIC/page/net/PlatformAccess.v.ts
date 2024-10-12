/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-15 18:19:00
 * @Description: 平台接入
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-11 11:24:30
 */
import { NetPlatformAccessForm, type NetPlatformSipList, NetPlatformSipCodeList } from '@/types/apiType/net'
import PlatformAccessCodeIdPop from './PlatformAccessCodeIdPop.vue'
import type { FormInstance, FormRules } from 'element-plus'

export default defineComponent({
    components: {
        PlatformAccessCodeIdPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const userSession = useUserSessionStore()

        // 平台接入类型与显示文本的映射
        const ACCESS_TYPE_MAPPING: Record<string, string> = {
            NVMS5000: Translate('IDCS_PLATFORM_SOFTWARE'),
            GB28181: 'GB28181',
        }

        const pageData = ref({
            // 平台类型选项
            platformTypeList: [] as SelectOption<string, string>[],
            // 是否显示设置编码ID弹窗
            isCodePop: false,
            // 编码ID弹窗数据
            codeData: new NetPlatformSipCodeList(),
            // 编码ID弹窗索引
            codeListIndex: 0,
            // 保留端口
            reservedPort: [] as number[],
        })

        const formRef = ref<FormInstance>()
        const formData = ref(new NetPlatformAccessForm())
        const formRules = ref<FormRules>({
            serverAddr: [
                {
                    validator(rule, value: string, callback) {
                        if (formData.value.accessType === 'GB28181' || !formData.value.nwms5000Switch) {
                            callback()
                            return
                        }
                        if (!value) {
                            callback(new Error(Translate('IDCS_DDNS_SERVER_ADDR_EMPTY')))
                            return
                        }
                        if (!checkDomain(value.trim())) {
                            callback(new Error(Translate('IDCS_INVALID_CHAR')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            reportId: [
                {
                    validator(rule, value: number, callback) {
                        if (formData.value.accessType === 'GB28181' || !formData.value.nwms5000Switch) {
                            callback()
                            return
                        }
                        if (!value) {
                            callback(new Error(Translate('IDCS_REPORT_ID_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            port: [
                {
                    validator(rule, value: number, callback) {
                        if (formData.value.accessType === 'GB28181' || !formData.value.nwms5000Switch) {
                            callback()
                            return
                        }
                        const index = pageData.value.reservedPort.indexOf(value)
                        if (index > -1) {
                            callback(new Error(Translate('IDCS_SYSTEM_RESERVED_PORT').formatForLang(value)))
                        }
                        callback()
                        return
                    },
                    trigger: 'manual',
                },
            ],
            sipAddr: [
                {
                    validator(rule, value: string, callback) {
                        if (formData.value.accessType !== 'GB28181' || !formData.value.gb28181Switch) {
                            callback()
                            return
                        }
                        if (!value) {
                            callback(new Error(Translate('IDCS_SIP_SERVER_ADDR_EMPTY')))
                            return
                        }
                    },
                    trigger: 'manual',
                },
            ],
            sipRelm: [
                {
                    validator(rule, value: string, callback) {
                        if (formData.value.accessType !== 'GB28181' || !formData.value.gb28181Switch) {
                            callback()
                            return
                        }
                        if (!value) {
                            callback(new Error(Translate('IDCS_SIP_SERVER_DOMIN_EMPTY')))
                            return
                        }
                    },
                    trigger: 'manual',
                },
            ],
            sipId: [
                {
                    validator(rule, value: string, callback) {
                        if (formData.value.accessType !== 'GB28181' || !formData.value.gb28181Switch) {
                            callback()
                            return
                        }
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_DDNS_SERVER_ADDR_EMPTY')))
                            return
                        }
                        if (sipCodeList.value.includes(value) || value === formData.value.sipDeviceId) {
                            callback(new Error(Translate('IDCS_SIP_ID_REPEAT')))
                            return
                        }
                        callback()
                        return
                    },
                    trigger: 'manual',
                },
            ],
            sipDeviceId: [
                {
                    validator(rule, value: string, callback) {
                        if (formData.value.accessType !== 'GB28181' || !formData.value.gb28181Switch) {
                            callback()
                            return
                        }
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_SIP_DEVICE_ID_EMPTY')))
                            return
                        }
                        if (sipCodeList.value.includes(value)) {
                            callback(new Error(Translate('IDCS_SIP_ID_REPEAT')))
                            return
                        }
                        callback()
                        return
                    },
                    trigger: 'manual',
                },
            ],
            sipUserName: [
                {
                    validator(rule, value: string, callback) {
                        if (formData.value.accessType !== 'GB28181' || !formData.value.gb28181Switch) {
                            callback()
                            return
                        }
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_USERNAME_EMPTY')))
                            return
                        }
                        callback()
                        return
                    },
                    trigger: 'manual',
                },
            ],
            sipPassword: [
                {
                    validator(rule, value: string, callback) {
                        if (formData.value.accessType !== 'GB28181' || !formData.value.gb28181Switch) {
                            callback()
                            return
                        }
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }
                        callback()
                        return
                    },
                    trigger: 'manual',
                },
            ],
            sipPort: [
                {
                    validator(rule, value: number, callback) {
                        if (formData.value.accessType !== 'GB28181' || !formData.value.gb28181Switch) {
                            callback()
                            return
                        }
                        const index = pageData.value.reservedPort.indexOf(value)
                        if (index > -1) {
                            callback(new Error(Translate('IDCS_SYSTEM_RESERVED_PORT').formatForLang(value)))
                        }
                        callback()
                        return
                    },
                    trigger: 'manual',
                },
            ],
            sipLocalPort: [
                {
                    validator(rule, value: number, callback) {
                        if (formData.value.accessType !== 'GB28181' || !formData.value.gb28181Switch) {
                            callback()
                            return
                        }
                        const index = pageData.value.reservedPort.indexOf(value)
                        if (index > -1) {
                            callback(new Error(Translate('IDCS_SYSTEM_RESERVED_PORT').formatForLang(value)))
                        }
                        callback()
                        return
                    },
                    trigger: 'manual',
                },
            ],
        })

        const tableData = ref<NetPlatformSipList[]>([])

        /**
         * @description 获取配置数据
         */
        const getData = async () => {
            openLoading()

            const reulst = await queryPlatformCfg()

            closeLoading()

            commLoadResponseHandler(reulst, ($) => {
                formData.value.accessType = $('//content').attr('current')

                // 老版本升级之后可能会找不到current属性,默认为"NVMS5000"
                if (!formData.value.accessType) {
                    formData.value.accessType = 'NVMS5000'
                }

                $('//content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    if (item.attr('id') === 'NVMS5000') {
                        formData.value.nwms5000Switch = $item('switch').text().toBoolean()
                        formData.value.serverAddr = $item('serverAddr').text()
                        formData.value.reportId = Number($item('reportId').text())
                        formData.value.port = Number($item('port').text())
                    } else if (item.attr('id') === 'GB28181') {
                        formData.value.gb28181Switch = $item('switch').text().toBoolean()
                        formData.value.sipRelm = $item('sipServerInfo/relm').text()
                        formData.value.sipAddr = $item('sipServerInfo/addr').text()
                        formData.value.sipLocalPort = Number($item('sipServerInfo/localPort').text())
                        formData.value.sipPort = Number($item('sipServerInfo/port').text())
                        formData.value.sipDeviceId = $item('sipServerInfo/deviceId').text()
                        formData.value.sipUserName = $item('sipServerInfo/username').text()
                        formData.value.sipId = $item('sipServerInfo').attr('id')!
                    }
                })
                $('//types/platformType/enum').forEach((item) => {
                    if (item.text() === 'GB28181') {
                        if ($('//content/item[@id="GB28181"]').length) {
                            pageData.value.platformTypeList.push({
                                label: ACCESS_TYPE_MAPPING.GB28181,
                                value: item.text(),
                            })
                        }
                    } else {
                        pageData.value.platformTypeList.push({
                            label: ACCESS_TYPE_MAPPING[item.text()],
                            value: item.text(),
                        })
                    }
                })

                if ($('//content/item/sipChl').length) {
                    tableData.value.push({
                        value: 'chl',
                        type: $('//content/item/sipChl').attr('type')!,
                        label: Translate('IDCS_CHANNEL'),
                        list: $('//content/item/sipChl/item').map((item) => {
                            return {
                                id: item.attr('id')!,
                                gbId: item.attr('gbId')!,
                                text: item.text(),
                            }
                        }),
                    })

                    tableData.value.push({
                        value: 'alarm',
                        type: $('//content/item/sipSensor').attr('type')!,
                        label: Translate('IDCS_ALARM_IN'),
                        list: $('//content/item/sipSensor/item').map((item) => {
                            return {
                                id: item.attr('id')!,
                                gbId: item.attr('gbId')!,
                                text: item.text(),
                            }
                        }),
                    })
                }

                const reservedPort = $('//content').attr('reservedPort')
                if (reservedPort) {
                    pageData.value.reservedPort = reservedPort
                        .split(',')
                        .map((port) => {
                            const split = port.split('-')
                            if (split.length === 1) return [Number(port)]
                            const ports: number[] = []
                            for (let i = Number(split[0]); i <= Number(split[1]); i++) {
                                ports.push(i)
                            }
                            return ports
                        })
                        .flat()
                }
            })
        }

        /**
         * @description 打开编辑编码ID弹窗
         * @param {Number} index
         * @param {NetPlatformSipCodeList} item
         */
        const editCodeId = (index: number, item: NetPlatformSipCodeList) => {
            if (!formData.value.gb28181Switch) {
                return
            }
            pageData.value.codeData = item
            pageData.value.codeListIndex = index
            pageData.value.isCodePop = true
        }

        /**
         * @description 确认编辑编码ID后，更新表格，关闭弹窗
         * @param {String} gbId
         */
        const confirmEditCodeId = (gbId: string) => {
            const index = tableData.value[pageData.value.codeListIndex].list.findIndex((item) => item.id === pageData.value.codeData.id)
            if (index > -1) {
                tableData.value[pageData.value.codeListIndex].list[index].gbId = gbId
            }
            pageData.value.isCodePop = false
        }

        /**
         * @description 验证表单通过后 更新数据
         */
        const verify = () => {
            formRef.value?.validate((valid) => {
                if (valid) {
                    setData()
                }
            })
        }

        /**
         * @description 更新数据
         */
        const setData = async () => {
            let sendXml = ''
            // TODO GB28181 需数据才能测试
            if (formData.value.accessType === 'GB28181') {
                const tableXml = tableData.value
                    .map((item) => {
                        const tag = item.value === 'chl' ? 'sipChl' : 'sipSensor'
                        return rawXml`
                        <${tag}>
                            ${item.list.map((code) => `<item id="${code.id}" gbId="${code.gbId}">${code.text}</item>`).join('')}
                        </${tag}>
                    `
                    })
                    .join('')
                sendXml = rawXml`
                    <content current="${formData.value.accessType}">
                        <item id="${formData.value.accessType}">
                            ${tableXml}
                            <switch>${formData.value.gb28181Switch.toString()}</switch>
                            <sipServerInfo id="${formData.value.sipId}">
                                <relm>${formData.value.sipRelm}</relm>
                                <addr>${formData.value.sipAddr}</addr>
                                <localPort>${formData.value.sipLocalPort.toString()}</localPort>
                                <port>${formData.value.sipPort.toString()}</port>
                                <deviceId>${formData.value.sipDeviceId}</deviceId>
                                <username>${formData.value.sipUserName}</username>
                                ${ternary(formData.value.sipPassword === '******' || !formData.value.sipPassword, '', `<password${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.sipPassword, userSession.sesionKey))}</password>`)}
                                <expireTime>${formData.value.sipExpireTime.toString()}</expireTime>
                            </sipServerInfo>
                        </item>
                    </content>
                `
            } else {
                sendXml = rawXml`
                    <content current="${formData.value.accessType}">
                        <item id="${formData.value.accessType}">
                            <serverAddr>${formData.value.serverAddr}</serverAddr>
                            <reportId>${formData.value.reportId.toString()}</reportId>
                            <port>${formData.value.port.toString()}</port>
                            <switch>${formData.value.nwms5000Switch.toString()}</switch>
                        </item>
                    </content> 
                `
            }

            openLoading()

            const result = await editPlatformCfg(sendXml)
            closeLoading()
            commSaveResponseHadler(result)
        }

        // 编码ID列表
        const sipCodeList = computed(() => {
            return tableData.value.map((item) => item.list.map((item) => item.gbId)).flat()
        })

        /**
         * @description 密码框获得焦点后 重置占位符
         */
        const handlePasswordFocus = () => {
            if (formData.value.sipPassword === '******') {
                formData.value.sipPassword = ''
            }
        }

        /**
         * @description NWMS5000启用配置后 弹窗提示框
         */
        const changeNWMS5000Switch = () => {
            if (formData.value.nwms5000Switch) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_RTSP_OR_FTP_ENABLE_REMIND'),
                })
            }
        }

        onMounted(() => {
            getData()
        })

        return {
            pageData,
            formRef,
            formData,
            formRules,
            tableData,
            nameByteMaxLen: nameByteMaxLen,
            formatDigit: formatDigit,
            formatInputMaxLength: formatInputMaxLength,
            editCodeId,
            confirmEditCodeId,
            verify,
            PlatformAccessCodeIdPop,
            sipCodeList,
            handlePasswordFocus,
            changeNWMS5000Switch,
        }
    },
})
