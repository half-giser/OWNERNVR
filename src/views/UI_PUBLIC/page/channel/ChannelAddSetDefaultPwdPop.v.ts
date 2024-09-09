import { DefaultPwdDto } from '@/types/apiType/channel'
import { type FormInstance } from 'element-plus'
import { type RuleItem } from 'async-validator'
import BaseCheckAuthPop, { type UserCheckAuthForm } from '../../components/auth/BaseCheckAuthPop.vue'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
    },
    emits: {
        change(data: DefaultPwdDto[]) {
            return !!data
        },
        close() {
            return true
        },
    },
    setup(props, { emit }) {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const userSessionStore = useUserSessionStore()
        const { openMessageTipBox } = useMessageBox()
        const formRef = ref<FormInstance>()
        const formData = ref({
            params: [] as Array<DefaultPwdDto>,
        })
        const tableRef = ref()
        const passwordInputRef = ref<Array<Element | globalThis.ComponentPublicInstance | null>>([])

        const baseCheckAuthPopVisiable = ref(false)
        const handleBaseCheckAuthPopClose = () => {
            baseCheckAuthPopVisiable.value = false
        }

        const getData = () => {
            openLoading(LoadingTarget.FullScreen)
            queryDevDefaultPwd(getXmlWrapData('')).then((res) => {
                closeLoading(LoadingTarget.FullScreen)
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    const rowData = [] as Array<DefaultPwdDto>
                    $('//content/item').forEach((ele) => {
                        const eleXml = queryXml(ele.element)
                        const defaultPwdData = new DefaultPwdDto()
                        defaultPwdData.id = ele.attr('id') as string
                        defaultPwdData.userName = eleXml('userName').text()
                        defaultPwdData.password = '' // 协议修改之后密码不传输
                        defaultPwdData.displayName = eleXml('displayName').text()
                        defaultPwdData.protocolType = eleXml('protocolType').text()
                        rowData.push(defaultPwdData)
                    })
                    formData.value.params = rowData
                }
            })
        }

        const handlePwdViewChange = (index: number, rowData: DefaultPwdDto) => {
            const flag = rowData.showInput
            rowData.showInput = !rowData.showInput
            if (!flag) {
                const curPwdInput = passwordInputRef.value[index]
                if (curPwdInput) (curPwdInput as HTMLInputElement).focus()
            }
        }

        const validate: Record<string, RuleItem['validator']> = {
            validateUserName: (_rule, value, callback) => {
                if (value.trim().length == 0) {
                    callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                    return
                }
                callback()
            },
        }

        const rules = ref({
            userName: [{ validator: validate.validateUserName, trigger: 'manual' }],
        })

        const save = () => {
            if (!formRef) return false
            formRef.value?.validate((valid) => {
                if (valid) {
                    baseCheckAuthPopVisiable.value = true
                }
            })
        }

        const setData = (e: UserCheckAuthForm) => {
            let data = `<content type='list'>`
            formData.value.params.forEach((ele: DefaultPwdDto) => {
                data += rawXml`<item id='${ele.id}'>
                            <userName>${cutStringByByte(ele.userName, nameByteMaxLen)}</userName>`
                if (ele.password != '') {
                    data += `<password ${getSecurityVer()}><![CDATA[${AES_encrypt(ele.password, userSessionStore.sesionKey)}]]></password>`
                }
                data += '</item>'
            })
            data += rawXml`</content>
                    <auth>
                        <userName>${e.userName}</userName>
                        <password>${e.hexHash}</password>
                    </auth>`
            editDevDefaultPwd(getXmlWrapData(data)).then((res) => {
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    const defaultPwdData: Array<DefaultPwdDto> = []
                    $('//content/item').forEach((ele) => {
                        const eleXml = queryXml(ele.element)
                        const newData = new DefaultPwdDto()
                        newData.id = ele.attr('id')!
                        newData.userName = eleXml('userName').text()
                        newData.password = eleXml('password').text()
                        newData.displayName = eleXml('displayName').text()
                        newData.protocolType = eleXml('protocolType').text()
                        defaultPwdData.push(newData)
                    })
                    emit('change', defaultPwdData)
                    baseCheckAuthPopVisiable.value = false
                    emit('close')
                } else {
                    const errorCode = $('errorCode').text()
                    if (errorCode == '536870948' || errorCode == '536870947') {
                        // 用户名/密码错误
                        openMessageTipBox({
                            type: 'info',
                            message: Translate('IDCS_DEVICE_PWD_ERROR'),
                        })
                    } else if (errorCode == '536870953') {
                        // 鉴权账号无相关权限
                        openMessageTipBox({
                            type: 'info',
                            message: Translate('IDCS_NO_AUTH'),
                        })
                    } else {
                        baseCheckAuthPopVisiable.value = false
                        emit('close')
                    }
                }
            })
        }

        const handleKeydownEnter = (event: Event) => {
            ;(event.target as HTMLElement).blur()
        }

        const opened = () => {
            formRef.value?.clearValidate()
            getData()
        }

        return {
            opened,
            formRef,
            formData,
            tableRef,
            rules,
            passwordInputRef,
            handlePwdViewChange,
            save,
            baseCheckAuthPopVisiable,
            handleBaseCheckAuthPopClose,
            setData,
            handleKeydownEnter,
        }
    },
})
