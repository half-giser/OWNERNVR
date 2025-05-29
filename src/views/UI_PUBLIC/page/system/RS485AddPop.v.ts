/**
 * @Date: 2025-05-04 16:02:54
 * @Description: RS485 新增/编辑弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import type { FormRules } from 'element-plus'

export default defineComponent({
    props: {
        type: {
            type: String,
            required: true,
        },
        row: {
            type: Object as PropType<SystemRS485Dto>,
            required: true,
        },
        protocolTypeList: {
            type: Array as PropType<SelectOption<string, string>[]>,
            required: true,
        },
        operateTypeList: {
            type: Array as PropType<SelectOption<string, string>[]>,
            required: true,
        },
        forbiddenCharsList: {
            type: Array as PropType<string[]>,
            required: true,
        },
        baudRateTypeList: {
            type: Array as PropType<SelectOption<number, string>[]>,
            required: true,
        },
        count: {
            type: Number,
            required: true,
        },
        maxCount: {
            type: Number,
            required: true,
        },
    },
    emits: {
        confirm() {
            return true
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
            isNameOutOfRange: false,
            isNameIllegal: false,
        })

        const formRef = useFormRef()

        const formData = ref(new SystemRS485Dto())

        const formRules = ref<FormRules>({
            name: [
                {
                    validator(_rule, value: string, callback) {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_NAME_EMPTY')))
                            return
                        }

                        if (pageData.value.isNameOutOfRange) {
                            callback(new Error(Translate('IDCS_CHARACTER_LENGTH_FORMAT').formatForLang(32)))
                            pageData.value.isNameOutOfRange = false
                            return
                        }

                        if (pageData.value.isNameIllegal) {
                            callback(new Error(Translate('IDCS_RS485_INVALID_NAME')))
                            pageData.value.isNameIllegal = false
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const open = () => {
            if (prop.type === 'add') {
                formData.value = new SystemRS485Dto()
                if (prop.operateTypeList.length) {
                    formData.value.operate = prop.operateTypeList[0].value
                }
            } else {
                formData.value = cloneDeep(prop.row)
            }
        }

        const close = () => {
            ctx.emit('close')
        }

        const test = async () => {
            const sendXml = rawXml`
                <content>
                    <operateInfos>
                        <name>${wrapCDATA(formData.value.name)}</name>
                        <baudrate>${formData.value.baudrate}</baudrate>
                        <addrID>${formData.value.addrID}</addrID>
                        <protocol>${formData.value.protocol}</protocol>
                        ${formData.value.protocol === 'CUSTOMIZE' ? `<code>${formData.value.code}</code>` : `<operate>${formData.value.operate}</operate>`}
                    </operateInfos>
                </content>
            `
            const result = await executeCustomOperate(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_TEST_SUCCESS'),
                })
            } else {
                const errorCode = $('errorCode').text().num()
                let errorMsg = Translate('IDCS_TEST_FAIL')
                if (errorCode === 536870922) {
                    errorMsg = Translate('IDCS_SELECT_INVALID_OP')
                }
                openMessageBox(errorMsg)
            }
        }

        const setData = () => {
            formRef.value?.validate(async (valid) => {
                if (valid) {
                    if (prop.type === 'add' && prop.count >= prop.maxCount) {
                        openMessageBox(Translate('IDCS_RS485_OPREATE_LIMIT'))
                        return
                    }

                    const sendXml = rawXml`
                        <content>
                            <operateInfos>
                                <item ${prop.type === 'edit' ? ` id="${formData.value.id}"` : ''}>
                                    <name>${wrapCDATA(formData.value.name)}</name>
                                    <baudrate>${formData.value.baudrate}</baudrate>
                                    <addrID>${formData.value.addrID}</addrID>
                                    <protocol>${formData.value.protocol}</protocol>
                                    ${formData.value.protocol === 'CUSTOMIZE' ? `<code>${formData.value.code}</code>` : `<operate>${formData.value.operate}</operate>`}
                                </item>
                            </operateInfos>
                        </content>
                    `

                    let result: Element | XMLDocument
                    if (prop.type === 'add') {
                        result = await addCustomOperateList(sendXml)
                    } else {
                        result = await editCustomOperateList(sendXml)
                    }

                    const $ = queryXml(result)

                    if ($('status').text() === 'success') {
                        openMessageBox({
                            type: 'success',
                            message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                        }).then(() => {
                            ctx.emit('confirm')
                        })
                    } else {
                        const errorCode = $('errorCode').text().num()
                        let errorInfo = ''
                        switch (errorCode) {
                            // "最多添加36个操作！
                            case 536871004:
                                errorInfo = Translate('IDCS_RS485_OPREATE_LIMIT').formatForLang(prop.maxCount)
                                break
                            // 无效的自定义协议！自定义协议只能是16进制字符串，长度不得超过128且长度必须为偶数！
                            case 536870943:
                                errorInfo = Translate('IDCS_INVALID_CUSTOM_PROTOCOL')
                                break
                            // 操作已存在
                            case 536871060:
                                errorInfo = Translate('IDCS_RS485_OP_ALREADY_EXIST')
                                break
                            // 选择了无效的操作
                            case 536870922:
                                errorInfo = Translate('IDCS_SELECT_INVALID_OP')
                                break
                            default:
                                errorInfo = Translate('IDCS_SAVE_FAIL')
                                break
                        }
                        openMessageBox(errorInfo)
                    }
                }
            })
        }

        const handleNameOutOfRange = () => {
            pageData.value.isNameOutOfRange = true
            formRef.value?.validateField('name')
        }

        const formatName = (str: string) => {
            const regexp = new RegExp(`[${prop.forbiddenCharsList.map((item) => `\\${item}`).join('')}]`)
            if (regexp.test(str.trim())) {
                pageData.value.isNameIllegal = true
                formRef.value?.validateField('name')
                return str.replace(regexp, '')
            }
            return str
        }

        const formatCode = (str: string) => {
            return str.replace(/[\u4E00-\u9FA5]/g, '')
        }

        return {
            formData,
            formRules,
            formRef,
            open,
            close,
            test,
            setData,
            handleNameOutOfRange,
            formatName,
            formatCode,
        }
    },
})
