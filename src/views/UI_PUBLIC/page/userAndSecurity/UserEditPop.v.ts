/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 17:21:49
 * @Description: 编辑用户信息弹窗
 */
import { type UserCheckAuthForm } from '@/types/apiType/user'

export default defineComponent({
    props: {
        /**
         * @property 用户ID
         */
        userId: {
            type: String,
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
        resetPassword() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()

        const formRef = useFormRef()
        const formData = ref(new UserEditForm())

        const pageData = ref({
            isEditAdmin: false,
            isEditSelf: false,
            isEditDebug: false,
            isSchedulePop: false,
            scheduleList: [] as SelectOption<string, string>[],
            isAdmin: userSession.userType === USER_TYPE_DEFAULT_ADMIN,
            isCheckAuthPop: false,
        })

        const authGroupOptions = ref<SelectOption<string, string>[]>([])

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
            if ($('status').text() === 'success') {
                formData.value.enabled = $('content/enabled').text().bool()
                formData.value.userName = $('content/userName').text()
                formData.value.userNameMaxByteLen = $('content/userName').attr('maxByteLen').num() || nameByteMaxLen
                formData.value.email = $('content/email').text()
                formData.value.emailMaxByteLen = $('content/email').attr('maxByteLen').num() || nameByteMaxLen
                formData.value.authGroup = $('content/authGroup').attr('id')
                formData.value.allowModifyPassword = $('content/modifyPassword').text().bool()
                formData.value.authEffective = !$('content/authEffective').text().bool()
                formData.value.accessCode = $('content/accessCode').text().bool()
                formData.value.loginScheduleInfoEnabled = $('content/loginScheduleInfo').attr('enable').bool()
                formData.value.loginScheduleInfo = $('content/loginScheduleInfo').attr('scheduleId')

                const currentUserName = userSession.userName
                const editUserName = formData.value.userName
                const editUserType = $('content/userType').text()

                pageData.value.isEditAdmin = USER_TYPE_DEFAULT_ADMIN === editUserType
                pageData.value.isEditSelf = currentUserName === editUserName
                pageData.value.isEditDebug = 'debug' === editUserType

                if (pageData.value.isEditAdmin) {
                    authGroupOptions.value = [
                        {
                            value: '',
                            label: displayAuthGroup('Administrator'),
                        },
                    ]
                }
            } else {
                const errorCode = $('errorCode').text().num()
                let errorText = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR__CANNOT_FIND_NODE_ERROR:
                        errorText = Translate('IDCS_RESOURCE_NOT_EXIST').formatForLang(Translate('IDCS_USER'))
                        break
                    default:
                        errorText = Translate('IDCS_QUERY_DATA_FAIL')
                }
                openMessageBox(errorText)
            }
        }

        /**
         * @description 点击修改密码
         */
        const changePassword = () => {
            ctx.emit('resetPassword')
        }

        /**
         * @description 获取权限组
         */
        const getAuthGroup = async () => {
            const sendXml = rawXml`
                <name/>
            `
            const result = await queryAuthGroupList(sendXml)

            commLoadResponseHandler(result, ($) => {
                authGroupOptions.value = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        value: item.attr('id'),
                        label: displayAuthGroup($item('name').text()),
                    }
                })
            })
        }

        /**
         * @description 确认修改用户信息
         */
        const doEditUser = async () => {
            pageData.value.isCheckAuthPop = true
        }

        const confirmEditUser = async (e: UserCheckAuthForm) => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <userId>${prop.userId}</userId>
                    <userName>${wrapCDATA(formData.value.userName)}</userName>
                    <authGroup id="${formData.value.authGroup}"></authGroup>
                    <bindMacSwitch>false</bindMacSwitch>
                    <modifyPassword>${formData.value.allowModifyPassword}</modifyPassword>
                    <mac>${wrapCDATA(DEFAULT_EMPTY_MAC)}</mac>
                    <email>${wrapCDATA(formData.value.email)}</email>
                    <enabled>${formData.value.enabled}</enabled>
                    ${pageData.value.isAdmin ? `<accessCode>${formData.value.accessCode}</accessCode>` : ''}
                    ${!pageData.value.isEditAdmin && !pageData.value.isEditDebug ? `<loginScheduleInfo enable="${formData.value.loginScheduleInfoEnabled}" scheduleId="${formData.value.loginScheduleInfo}"></loginScheduleInfo>` : ''}
                    <authEffective>${!formData.value.authEffective}</authEffective>
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await editUser(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                pageData.value.isCheckAuthPop = false
                ctx.emit('confirm')
            } else {
                const errorCode = $('errorCode').text().num()
                let errorText = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR__CANNOT_FIND_NODE_ERROR:
                        errorText = Translate('IDCS_RESOURCE_NOT_EXIST').formatForLang(Translate('IDCS_USER'))
                        break
                    default:
                        errorText = Translate('IDCS_SAVE_DATA_FAIL')
                }
                openMessageBox(errorText)
            }
        }

        /**
         * @description 打开弹窗时的数据请求
         */
        const open = async () => {
            await getAuthGroup()
            await getScheduleList()
            getUser()
        }

        /**
         * @description 关闭弹窗
         */
        const goBack = () => {
            ctx.emit('close')
        }

        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            formData.value.loginScheduleInfo = getScheduleId(pageData.value.scheduleList, formData.value.loginScheduleInfo)
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
            open,
            changePassword,
            doEditUser,
            goBack,
            closeSchedulePop,
            confirmEditUser,
        }
    },
})
