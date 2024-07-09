import { getXmlWrapData } from '@/api/api'
import { editDevDefaultPwd, queryDevDefaultPwd } from '@/api/channel'
import { DefaultPwdDto } from '@/types/apiType/channel'
import { queryXml } from '@/utils/xmlParse'
import { type FormInstance } from 'element-plus'
import { trim } from 'lodash'
import BaseCheckAuthPop from '../../components/BaseCheckAuthPop.vue'
import { cutStringByByte, getSecurityVer } from '@/utils/tools'
import { nameByteMaxLen } from '@/utils/constants'
import { AES_encrypt } from '@/utils/encrypt'
import { useUserSessionStore } from '@/stores/userSession'
import { type SetupContext } from 'vue'
import useMessageBox from '@/hooks/useMessageBox'
import useLoading from '@/hooks/useLoading'
import { useLangStore } from '@/stores/lang'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
    },
    props: {
        close: {
            type: Function,
            require: true,
            default: () => {},
        },
    },
    emits: ['change'],
    setup(props: any, { emit }: SetupContext) {
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
            queryDevDefaultPwd(getXmlWrapData('')).then((res: any) => {
                closeLoading(LoadingTarget.FullScreen)
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    const rowData = [] as Array<DefaultPwdDto>
                    res('//content/item').forEach((ele: any) => {
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

        const validate = {
            validateUserName: (_rule: any, value: any, callback: any) => {
                value = trim(value)
                if (value.length == 0) {
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

        const setData = (authName: string, authPwd: string) => {
            let data = `<content type='list'>`
            formData.value.params.forEach((ele: DefaultPwdDto) => {
                data += `<item id='${ele.id}'>
                            <userName>${cutStringByByte(ele.userName, nameByteMaxLen)}</userName>`
                if (ele.password != '') {
                    data += `<password ${getSecurityVer()}><![CDATA[${AES_encrypt(ele.password, userSessionStore.sesionKey)}]]></password>`
                }
                data += '</item>'
            })
            data += `</content>
                    <auth>
                        <userName>${authName}</userName>
                        <password>${authPwd}</password>
                    </auth>`
            editDevDefaultPwd(getXmlWrapData(data)).then((res: any) => {
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    const defaultPwdData: Array<DefaultPwdDto> = []
                    res('//content/item').forEach((ele: any) => {
                        const eleXml = queryXml(ele.element)
                        const newData = new DefaultPwdDto()
                        newData.id = ele.attr('id')
                        newData.userName = eleXml('userName').text()
                        newData.password = eleXml('password').text()
                        newData.displayName = eleXml('displayName').text()
                        newData.protocolType = eleXml('protocolType').text()
                        defaultPwdData.push(newData)
                    })
                    emit('change', defaultPwdData)
                    baseCheckAuthPopVisiable.value = false
                    props.close()
                } else {
                    const errorCode = res('errorCode').text()
                    if (errorCode == '536870948' || errorCode == '536870947') {
                        // 用户名/密码错误
                        openMessageTipBox({
                            type: 'info',
                            title: Translate('IDCS_INFO_TIP'),
                            message: Translate('IDCS_DEVICE_PWD_ERROR'),
                            showCancelButton: false,
                        })
                    } else if (errorCode == '536870953') {
                        // 鉴权账号无相关权限
                        openMessageTipBox({
                            type: 'info',
                            title: Translate('IDCS_INFO_TIP'),
                            message: Translate('IDCS_NO_AUTH'),
                            showCancelButton: false,
                        })
                    } else {
                        baseCheckAuthPopVisiable.value = false
                        props.close()
                    }
                }
            })
        }

        const handleKeydownEnter = (event: any) => {
            event.target.blur()
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
