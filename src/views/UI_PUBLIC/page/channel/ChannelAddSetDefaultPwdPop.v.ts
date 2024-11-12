/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 添加通道 - 设置通道默认密码弹窗
 */
import { type ChannelDefaultPwdDto } from '@/types/apiType/channel'
import { type FormRules, type FormInstance } from 'element-plus'
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import type { UserCheckAuthForm } from '@/types/apiType/user'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
    },
    emits: {
        change(data: ChannelDefaultPwdDto[]) {
            return !!data
        },
        close() {
            return true
        },
    },
    setup(_, { emit }) {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const userSessionStore = useUserSessionStore()
        const { openMessageBox } = useMessageBox()
        const formRef = ref<FormInstance>()
        const formData = ref({
            params: [] as Array<ChannelDefaultPwdDto>,
        })
        const passwordInputRef = ref<Array<Element | globalThis.ComponentPublicInstance | null>>([])

        const baseCheckAuthPopVisiable = ref(false)
        const handleBaseCheckAuthPopClose = () => {
            baseCheckAuthPopVisiable.value = false
        }

        const getData = () => {
            openLoading()
            queryDevDefaultPwd().then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    formData.value.params = $('//content/item').map((ele) => {
                        const eleXml = queryXml(ele.element)
                        return {
                            id: ele.attr('id')!,
                            userName: eleXml('userName').text(),
                            password: '', // 协议修改之后密码不传输
                            displayName: eleXml('displayName').text(),
                            protocolType: eleXml('protocolType').text(),
                            showInput: false,
                        }
                    })
                }
            })
        }

        const handlePwdViewChange = (index: number, rowData: ChannelDefaultPwdDto) => {
            const flag = rowData.showInput
            rowData.showInput = !rowData.showInput
            if (!flag) {
                const curPwdInput = passwordInputRef.value[index]
                if (curPwdInput) (curPwdInput as HTMLInputElement).focus()
            }
        }

        const rules = ref<FormRules>({
            userName: [
                {
                    validator: (_rule, value, callback) => {
                        if (!value.trim().length) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const save = () => {
            formRef.value?.validate((valid) => {
                if (valid) {
                    baseCheckAuthPopVisiable.value = true
                }
            })
        }

        const setData = (e: UserCheckAuthForm) => {
            const sendXml = rawXml`
                <content type='list'>
                    ${formData.value.params
                        .map((ele) => {
                            return rawXml`
                                <item id='${ele.id}'>
                                    <userName maxByteLen="63">${ele.userName}</userName>
                                    ${ternary(!!ele.password, `<password maxLen='64' ${getSecurityVer()}><![CDATA[${AES_encrypt(ele.password, userSessionStore.sesionKey)}]]></password>`)}
                                </item>
                            `
                        })
                        .join('')}
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `

            editDevDefaultPwd(sendXml).then((res) => {
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    const defaultPwdData: ChannelDefaultPwdDto[] = $('//content/item').map((ele) => {
                        const eleXml = queryXml(ele.element)
                        return {
                            id: ele.attr('id')!,
                            userName: eleXml('userName').text(),
                            password: eleXml('password').text(),
                            displayName: eleXml('displayName').text(),
                            protocolType: eleXml('protocolType').text(),
                            showInput: false,
                        }
                    })
                    emit('change', defaultPwdData)
                    baseCheckAuthPopVisiable.value = false
                    emit('close')
                } else {
                    const errorCode = Number($('errorCode').text())
                    if (errorCode == ErrorCode.USER_ERROR_PWD_ERR || errorCode == ErrorCode.USER_ERROR_NO_USER) {
                        // 用户名/密码错误
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_DEVICE_PWD_ERROR'),
                        })
                    } else if (errorCode == ErrorCode.USER_ERROR_NO_AUTH) {
                        // 鉴权账号无相关权限
                        openMessageBox({
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
            rules,
            passwordInputRef,
            handlePwdViewChange,
            save,
            baseCheckAuthPopVisiable,
            handleBaseCheckAuthPopClose,
            setData,
            handleKeydownEnter,
            formatInputMaxLength,
            nameByteMaxLen,
        }
    },
})
