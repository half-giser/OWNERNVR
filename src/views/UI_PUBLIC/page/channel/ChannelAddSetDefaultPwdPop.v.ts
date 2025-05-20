/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 添加通道 - 设置通道默认密码弹窗
 */
// import { type FormRules } from 'element-plus'
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
        const isCheckAuthPop = ref(false)
        const tableData = ref<ChannelDefaultPwdDto[]>([])

        // 要求的密码强度
        const passwordStrength = ref<keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING>('weak')

        const passwordInputRef = ref<Array<Element | globalThis.ComponentPublicInstance | null | BasePasswordReturnsType>>([])

        const handleBaseCheckAuthPopClose = () => {
            isCheckAuthPop.value = false
        }

        const getData = async () => {
            const res = await queryDevDefaultPwd()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                tableData.value = $('content/item').map((ele) => {
                    const $item = queryXml(ele.element)
                    return {
                        id: ele.attr('id'),
                        userName: $item('userName').text(),
                        password: '', // 协议修改之后密码不传输
                        displayName: $item('displayName').text(),
                        protocolType: $item('protocolType').text(),
                        showInput: false,
                        port: $item('port').text().num(),
                    }
                })
            }
        }

        const getPasswordSecurity = async () => {
            const result = await queryPasswordSecurity()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                passwordStrength.value = ($('content/pwdSecureSetting/pwdSecLevel').text() as keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING & null) ?? 'weak'
            }
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

        const varify = () => {
            if (tableData.value.some((item) => !item.userName.trim())) {
                openMessageBox(Translate('IDCS_PROMPT_NAME_EMPTY'))
                return false
            }

            let strongErrorName = ''
            const isStrongError = tableData.value.some((item) => {
                if (
                    item.id === 'TVT' &&
                    item.password !== '******' &&
                    getPwdSaftyStrength(item.password) < DEFAULT_PASSWORD_STREMGTH_MAPPING[passwordStrength.value as keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING]
                ) {
                    strongErrorName = item.displayName
                    return true
                }
                return false
            })

            if (isStrongError) {
                openMessageBox(`${Translate('IDCS_PWD_STRONG_ERROR')}(${strongErrorName})`)
                return false
            }

            return true
        }

        const save = () => {
            if (!varify()) {
                return
            }

            isCheckAuthPop.value = true
        }

        const setData = async (e: UserCheckAuthForm) => {
            const sendXml = rawXml`
                <content type='list'>
                    ${tableData.value
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

            const res = await editDevDefaultPwd(sendXml)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                emit('change', tableData.value)
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
        }

        const formatPassword = (str: string) => {
            return str.replace(/[<>]/g, '')
        }

        const opened = async () => {
            openLoading()
            await getData()
            await getPasswordSecurity()
            closeLoading()
        }

        return {
            opened,
            tableData,
            passwordInputRef,
            togglePwd,
            save,
            isCheckAuthPop,
            handleBaseCheckAuthPopClose,
            setData,
            formatPassword,
        }
    },
})
