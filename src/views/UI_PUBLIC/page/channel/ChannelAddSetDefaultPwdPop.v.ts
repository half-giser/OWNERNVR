/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 添加通道 - 设置通道默认密码弹窗
 */
import { type FormRules } from 'element-plus'
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import { type BasePasswordReturnsType } from '@/components/form/BasePasswordInput.vue'

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
        const userSessionStore = useUserSessionStore()
        const formRef = useFormRef()
        const formData = ref({
            params: [] as Array<ChannelDefaultPwdDto>,
        })

        const rules = ref<FormRules>({
            userName: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const passwordInputRef = ref<Array<Element | globalThis.ComponentPublicInstance | null | BasePasswordReturnsType>>([])

        const isCheckAuthPop = ref(false)

        const handleBaseCheckAuthPopClose = () => {
            isCheckAuthPop.value = false
        }

        const getData = () => {
            openLoading()
            queryDevDefaultPwd().then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    formData.value.params = $('content/item').map((ele) => {
                        const $item = queryXml(ele.element)
                        return {
                            id: ele.attr('id'),
                            userName: $item('userName').text(),
                            password: '', // 协议修改之后密码不传输
                            displayName: $item('displayName').text(),
                            protocolType: $item('protocolType').text(),
                            showInput: false,
                        }
                    })
                }
            })
        }

        const togglePwd = (index: number, rowData: ChannelDefaultPwdDto) => {
            rowData.showInput = !rowData.showInput
            if (rowData.showInput) {
                nextTick(() => {
                    const curPwdInput = passwordInputRef.value[index]
                    if (curPwdInput) (curPwdInput as BasePasswordReturnsType).focus()
                })
            }
        }

        const save = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    isCheckAuthPop.value = true
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
                                    ${ele.password ? `<password maxLen='64' ${getSecurityVer()}>${wrapCDATA(AES_encrypt(ele.password, userSessionStore.sesionKey))}</password>` : ''}
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
                if ($('status').text() === 'success') {
                    const defaultPwdData = $('content/item').map((ele) => {
                        const $item = queryXml(ele.element)
                        return {
                            id: ele.attr('id'),
                            userName: $item('userName').text(),
                            password: $item('password').text(),
                            displayName: $item('displayName').text(),
                            protocolType: $item('protocolType').text(),
                            showInput: false,
                        }
                    })
                    emit('change', defaultPwdData)
                    isCheckAuthPop.value = false
                    emit('close')
                } else {
                    const errorCode = $('errorCode').text().num()
                    switch (errorCode) {
                        // 用户名/密码错误
                        case ErrorCode.USER_ERROR_PWD_ERR:
                        case ErrorCode.USER_ERROR_NO_USER:
                            openMessageBox(Translate('IDCS_DEVICE_PWD_ERROR'))
                            break
                        // 鉴权账号无相关权限
                        case ErrorCode.USER_ERROR_NO_AUTH:
                            openMessageBox(Translate('IDCS_NO_AUTH'))
                            break
                        default:
                            isCheckAuthPop.value = false
                            emit('close')
                            break
                    }
                }
            })
        }

        const opened = () => {
            getData()
        }

        return {
            opened,
            formRef,
            formData,
            rules,
            passwordInputRef,
            togglePwd,
            save,
            isCheckAuthPop,
            handleBaseCheckAuthPopClose,
            setData,
        }
    },
})
