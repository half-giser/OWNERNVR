/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 17:21:49
 * @Description: 编辑用户信息弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-09 20:50:29
 */
import BaseSensitiveEmailInput from '../../components/form/BaseSensitiveEmailInput.vue'
import { UserEditForm, type UserAuthGroupOption } from '@/types/apiType/userAndSecurity'
import { type FormInstance, type FormRules } from 'element-plus'

export default defineComponent({
    components: {
        BaseSensitiveEmailInput,
    },
    props: {
        /**
         * @property 用户ID
         */
        userId: {
            type: String,
            require: true,
            default: '',
        },
    },
    emits: {
        close() {
            return true
        },
        resetPassword() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const { openMessageTipBox } = useMessageBox()
        const { closeLoading, LoadingTarget, openLoading } = useLoading()

        const formRef = ref<FormInstance>()
        const formData = ref(new UserEditForm())

        const pageData = ref({
            // 是否显示AuthGroup选项框
            isAuthGroup: false,
            // Enable选项框的disable
            isEnableDisabled: false,
            // AuthEffective选项框的disable
            isAuthEffectiveDisabled: false,
            // AuthGroup选项框的disable
            isAuthGroupDisabled: false,
            // 是否显示修改密码按钮
            isChangePasswordBtn: false,
        })

        const rules = ref<FormRules>({
            email: [
                {
                    validator: (rule, value: string, callback) => {
                        if (value.length && !checkEmail(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_INVALID_EMAIL')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const authGroupOptions = ref<UserAuthGroupOption[]>([])

        /**
         * @description 回显用户信息
         */
        const getUser = async () => {
            const sendXml = rawXml`
                <condition>
                   <userId>${prop.userId}</userId> 
                </condition>
            `
            const result = await queryUser(sendXml)
            const $ = queryXml(result)
            if ($('/response/status').text() === 'success') {
                formData.value.enabled = $('/response/content/enabled').text().toBoolean()
                formData.value.userName = $('/response/content/userName').text()
                formData.value.email = $('/response/content/email').text()
                formData.value.authGroup = $('/response/content/authGroup').attr('id') as string
                formData.value.allowModifyPassword = $('/response/content/modifyPassword').text().toBoolean()
                formData.value.authEffective = $('/response/content/authEffective').text().toBoolean()

                const authInfo = userSession.getAuthInfo()
                const currentUserName = authInfo ? authInfo[0] : ''
                const editUserName = formData.value.userName
                const editUserType = $('/response/content/userType').text()
                pageData.value.isAuthGroup = USER_TYPE_DEFAULT_ADMIN !== editUserType
                pageData.value.isEnableDisabled = false

                if (currentUserName === editUserName) {
                    pageData.value.isEnableDisabled = true
                }

                if (editUserType === USER_TYPE_DEFAULT_ADMIN) {
                    pageData.value.isEnableDisabled = true
                    pageData.value.isAuthEffectiveDisabled = true
                    pageData.value.isAuthGroupDisabled = true
                    pageData.value.isChangePasswordBtn = false
                    authGroupOptions.value = [
                        {
                            id: '',
                            name: 'Administrator',
                        },
                    ]
                } else {
                    pageData.value.isAuthEffectiveDisabled = false
                    pageData.value.isAuthGroupDisabled = false
                    pageData.value.isChangePasswordBtn = true
                }
            } else {
                const errorCode = Number($('/response/errorCode').text())
                let errorText = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR__CANNOT_FIND_NODE_ERROR:
                        errorText = Translate('IDCS_RESOURCE_NOT_EXIST').formatForLang(Translate('IDCS_USER'))
                        break
                    default:
                        errorText = Translate('IDCS_QUERY_DATA_FAIL')
                }
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: errorText,
                }).then(() => {
                    ctx.emit('close')
                })
            }
        }

        /**
         * @description 点击修改密码
         */
        const changePassword = () => {
            ctx.emit('resetPassword')
        }

        /**
         * @description 表单验证
         */
        const verify = () => {
            formRef.value?.validate((valid) => {
                if (valid) {
                    doEditUser()
                }
            })
        }

        /**
         * @description 获取权限组
         */
        const getAuthGroup = async () => {
            const sendXml = rawXml`
                <requireField>
                    <name/>
                </requireField>
            `
            const result = await queryAuthGroupList(sendXml)

            commLoadResponseHandler(result, ($) => {
                authGroupOptions.value = $('/response/content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id')!,
                        name: $item('name').text(),
                    }
                })
            })
        }

        /**
         * @description 确认修改用户信息
         */
        const doEditUser = async () => {
            openLoading(LoadingTarget.FullScreen)

            const sendXml = rawXml`
                <content>
                    <userId>${prop.userId}</userId>
                    <userName>${wrapCDATA(formData.value.userName)}</userName>
                    <authGroup id="${formData.value.authGroup}"></authGroup>
                    <bindMacSwitch>false</bindMacSwitch>
                    <modifyPassword>${String(formData.value.allowModifyPassword)}</modifyPassword>
                    <mac>${wrapCDATA('00:00:00:00:00:00')}</mac>
                    <email>${wrapCDATA(formData.value.email)}</email>
                    <enabled>${String(formData.value.enabled)}</enabled>
                    <authEffective>${String(formData.value.authEffective)}</authEffective>
                </content>
            `
            const result = await editUser(sendXml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('/response/status').text() === 'success') {
                ctx.emit('close')
            } else {
                const errorCode = Number($('/response/errorCode').text())
                let errorText = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR__CANNOT_FIND_NODE_ERROR:
                        errorText = Translate('IDCS_RESOURCE_NOT_EXIST').formatForLang(Translate('IDCS_USER'))
                        break
                    default:
                        errorText = Translate('IDCS_SAVE_DATA_FAIL')
                }
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: errorText,
                }).then(() => {
                    ctx.emit('close')
                })
            }
        }

        /**
         * @description 打开弹窗时的数据请求
         */
        const handleOpen = async () => {
            await getAuthGroup()
            await getUser()
        }

        /**
         * @description 关闭弹窗
         */
        const goBack = () => {
            ctx.emit('close')
        }

        /**
         * @description 显示权限组名字
         * @param {string} value
         * @returns {string}
         */
        const displayAuthGroup = (value: string) => {
            const name = DEFAULT_AUTH_GROUP_MAPPING[value] ? Translate(DEFAULT_AUTH_GROUP_MAPPING[value]) : value
            return name
        }

        return {
            formRef,
            formData,
            pageData,
            authGroupOptions,
            handleOpen,
            changePassword,
            verify,
            rules,
            goBack,
            displayAuthGroup,
            BaseSensitiveEmailInput,
        }
    },
})
