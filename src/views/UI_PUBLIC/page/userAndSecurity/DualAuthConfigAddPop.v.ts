import { type UserCheckAuthForm } from '@/types/apiType/user'
import { type TableInstance, type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        type: {
            type: String,
            required: true,
        },
        row: {
            type: Object as PropType<UserDualAuthUserDto>,
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
        const userSession = useUserSessionStore()

        const pageData = ref({
            isChangePassword: false,
            isCheckAuthPop: false,
        })

        const formRef = useFormRef()
        const formData = ref(new UserDualAuthUserForm())

        const tableRef = ref<TableInstance>()

        const tableData = ref<UserDualAuthLimitLoginUserDto[]>([])

        const rules = ref<FormRules>({
            name: [
                {
                    validator(_rule, value: string, callback) {
                        if (!value.trim()) {
                            callback(new Error('IDCS_PROMPT_USERNAME_EMPTY'))
                            return
                        }

                        if (!checkIllegalChar(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            password: [
                {
                    validator(_rule, value: string, callback) {
                        if (prop.type === 'add' || pageData.value.isChangePassword) {
                            if (!value) {
                                callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                                return
                            }

                            if (strength.value < DEFAULT_PASSWORD_STREMGTH_MAPPING[passwordStrength.value]) {
                                callback(new Error(Translate('IDCS_PWD_STRONG_ERROR')))
                                return
                            }
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            confirmPassword: [
                {
                    validator(_rule, value: string, callback) {
                        if (prop.type === 'add' || pageData.value.isChangePassword) {
                            if (value !== formData.value.password) {
                                callback(new Error(Translate('IDCS_PWD_MISMATCH_TIPS')))
                                return
                            }
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const open = () => {
            tableRef.value?.clearSelection()

            if (prop.type === 'edit') {
                formData.value.id = prop.row.id
                formData.value.userName = prop.row.userName
                formData.value.userNameMaxByteLen = prop.row.userNameMaxByteLen
                pageData.value.isChangePassword = false

                const ids = prop.row.limitLoginUsers.map((item) => item.id)
                tableData.value.forEach((item) => {
                    if (ids.includes(item.id)) {
                        tableRef.value?.toggleRowSelection(item, true)
                    }
                })
            } else {
                formData.value = new UserDualAuthUserForm()
                pageData.value.isChangePassword = true
            }
        }

        const close = () => {
            ctx.emit('close')
        }

        // 要求的密码强度
        const passwordStrength = ref<keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING>('weak')

        // 密码强度提示信息
        const noticeMsg = computed(() => {
            return getTranslateForPasswordStrength(passwordStrength.value)
        })

        // 当前密码强度
        const strength = computed(() => getPwdSaftyStrength(formData.value.password))

        /**
         * @description 获取要求的密码强度
         */
        const getPasswordSecurityStrength = async () => {
            let strength: keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING = 'weak'
            const result = await queryPasswordSecurity()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                strength = ($('content/pwdSecureSetting/pwdSecLevel').text() as keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING & null) ?? 'weak'
            }
            passwordStrength.value = strength
        }

        const formatName = (str: string) => {
            return str.replace(/([`\^\[\]]|[^A-z\d!@#%(){}~_\\'./\-\s])/g, '')
        }

        const setData = () => {
            formRef.value?.validate(async (valid) => {
                if (valid) {
                    pageData.value.isCheckAuthPop = true
                }
            })
        }

        const confirmSetData = (e: UserCheckAuthForm) => {
            if (prop.type === 'add') {
                addData(e)
            } else {
                editData(e)
            }
        }

        const addData = async (e: UserCheckAuthForm) => {
            openLoading()

            const limitLoginUsers = tableRef.value!.getSelectionRows() as UserDualAuthLimitLoginUserDto[]

            const sendXml = rawXml`
                <content>
                    <userName>${formData.value.userName}</userName>
                    <password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(MD5_encrypt(formData.value.password), userSession.sesionKey))}</password>
                    <limitLoginUsers>
                        ${limitLoginUsers.map((item) => `<item id="${item.id}" />`).join('')}
                    </limitLoginUsers>
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                <auth>
            `
            const result = await createDualAuthUser(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).then(() => {
                    pageData.value.isCheckAuthPop = false
                    ctx.emit('confirm')
                })
            } else {
                const errorCode = $('errorCode').text().num()
                handleError(errorCode)
            }
        }

        const editData = async (e: UserCheckAuthForm) => {
            openLoading()

            const limitLoginUsers = tableRef.value!.getSelectionRows() as UserDualAuthLimitLoginUserDto[]

            const sendXml = rawXml`
                <content>
                    <userId>${formData.value.id}</userId>
                    <userName>${formData.value.userName}</userName>
                    ${pageData.value.isChangePassword ? `<password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(MD5_encrypt(formData.value.password), userSession.sesionKey))}</password>` : ''}
                    <limitLoginUsers>
                        ${limitLoginUsers.map((item) => `<item id="${item.id}" />`).join('')}
                    </limitLoginUsers>
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                <auth>
            `
            const result = await editDualAuthUser(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).then(() => {
                    pageData.value.isCheckAuthPop = false
                    ctx.emit('confirm')
                })
            } else {
                const errorCode = $('errorCode').text().num()
                handleError(errorCode)
            }
        }

        const handleError = (errorCode: number) => {
            let errorInfo = ''
            switch (errorCode) {
                case ErrorCode.USER_ERROR_NAME_EXISTED:
                    errorInfo = Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_PROMPT_CUSTOME_VIEW_NAME_EXIST')
                    break
                case ErrorCode.USER_ERROR_OVER_LIMIT:
                    errorInfo = Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT')
                    break
                case 536870948:
                case 536870947:
                    errorInfo = Translate('IDCS_DEVICE_PWD_ERROR')
                    break
                case 536870953:
                    errorInfo = Translate('IDCS_NO_AUTH')
                    break
                default:
                    errorInfo = Translate('IDCS_SAVE_FAIL')
                    break
            }
            openMessageBox(errorInfo)
        }

        const getUserList = async () => {
            const result = await queryUserList('')
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const type = $item('userType').text().trim()
                    if (type === 'default_admin' || type === 'debug') {
                        return
                    }
                    tableData.value.push({
                        id: item.attr('id'),
                        userName: $item('userName').text(),
                    })
                })
            }
        }

        onMounted(() => {
            getPasswordSecurityStrength()
            getUserList()
        })

        return {
            open,
            close,
            formData,
            pageData,
            formRef,
            strength,
            noticeMsg,
            setData,
            formatName,
            rules,
            confirmSetData,
            tableData,
            tableRef,
        }
    },
})
