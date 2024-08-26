/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 17:21:22
 * @Description: 查看或更改用户
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-23 14:05:23
 */
import UserEditPop from './UserEditPop.vue'
import UserEditPasswordPop from './UserEditPasswordPop.vue'
import { type XmlResult } from '@/utils/xmlParse'
import { type UserList, type UserPermissionChannelAuthList, UserPermissionSystemAuthList } from '@/types/apiType/userAndSecurity'

export default defineComponent({
    components: {
        UserEditPop,
        UserEditPasswordPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        // 用户列表
        const userList = ref<UserList[]>([])

        // 左侧系统权限列表
        const systemAuthList = ref(new UserPermissionSystemAuthList())

        // 左侧通道权限列表
        const channelAuthList = ref<UserPermissionChannelAuthList[]>([])

        const pageData = ref({
            // 通道权限Tabs
            channelTabs: DEFAULT_CHANNEL_AUTH_TABS,
            // 当前选中的通道权限Tab
            activeChannelTab: DEFAULT_CHANNEL_AUTH_TABS[0],
            // 当前选中的用户索引
            activeUser: 0,
            // 搜索框的搜索内容
            searchText: '',
            // 是否打开编辑用户弹窗
            isEditUser: false,
            // 编辑用户的ID
            editUserId: '',
            // 编辑用户名
            editUserName: '',
            // 是否打开编辑用户密码的弹窗
            isEditUserPassword: false,
            // 本地通道权限列表
            localChannelIds: DEFAULT_LOCAL_CHANNEL_AUTH_LIST,
            // 远程通道权限列表
            remoteChannelIds: DEFAULT_REMOTE_CHANNEL_AUTH_LIST,
        })

        /**
         * @description 获取权限组
         * @param id
         */
        const getAuthGroup = async (id: string) => {
            openLoading(LoadingTarget.FullScreen)

            if (id) {
                const sendXml = rawXml`
                    <condition>
                        <authGroupId>${id}</authGroupId>
                    </condition>
                    <requireField>
                        <name/>
                        <chlAuth/>
                        <systemAuth/>
                    </requireField>
                `
                const result = await queryAuthGroup(sendXml)
                commLoadResponseHandler(result, ($result) => {
                    getSystemAuth($result)
                    getChannelAuth($result, true)
                })
            } else {
                const result = await getChlList({})
                commLoadResponseHandler(result, ($) => {
                    getChannelAuth($, false)
                })
            }

            closeLoading(LoadingTarget.FullScreen)
        }

        /**
         * @description 更新系统权限
         * @param {Function} $doc
         */
        const getSystemAuth = ($doc: (path: string) => XmlResult) => {
            const $ = queryXml($doc('/response/content/systemAuth')[0].element)
            Object.keys(systemAuthList.value).forEach((classify: string) => {
                Object.keys(systemAuthList.value[classify].value).forEach((key) => {
                    systemAuthList.value[classify].value[key].value = $(key).text().toBoolean()
                })
            })
        }

        /**
         * @description 更新通道权限
         * @param {Function} $
         * @param {boolean} isQueryFromUserID
         */
        const getChannelAuth = ($: (path: string) => XmlResult, isQueryFromUserID: boolean) => {
            if (isQueryFromUserID) {
                channelAuthList.value = $('/response/content/chlAuth/item').map((item) => {
                    const arrayItem: Record<string, any> = {}
                    const $item = queryXml(item.element)
                    arrayItem.id = item.attr('id') as string
                    arrayItem.name = $item('name').text()
                    const auth = $item('auth').text()
                    DEFAULT_CHANNEL_AUTH_LIST.forEach((key) => {
                        if (auth.includes(key)) {
                            arrayItem[key] = 'true'
                        } else {
                            arrayItem[key] = 'false'
                        }
                    })
                    return arrayItem as UserPermissionChannelAuthList
                })
            } else {
                channelAuthList.value = $('/response/content/item').map((item) => {
                    const arrayItem: Record<string, any> = {}
                    const $item = queryXml(item.element)
                    arrayItem.id = item.attr('id') as string
                    arrayItem.name = $item('name').text()
                    DEFAULT_CHANNEL_AUTH_LIST.forEach((key) => {
                        arrayItem[key] = true
                    })
                    return arrayItem as UserPermissionChannelAuthList
                })
            }
        }

        /**
         * @description 清除所有左侧权限信息
         */
        const resetAuth = () => {
            Object.keys(systemAuthList.value).forEach((classify: string) => {
                Object.keys(systemAuthList.value[classify].value).forEach((key) => {
                    systemAuthList.value[classify].value[key].value = false
                })
            })
            channelAuthList.value = []
        }

        /**
         * @description 获取用户列表
         * @param userName
         */
        const getUserList = async (userName: string) => {
            openLoading(LoadingTarget.FullScreen)

            const sendXml = userName
                ? rawXml`
                    <condition>
                        <userName>${wrapCDATA(userName)}</userName>
                    </condition>
                `
                : ''
            const result = await queryUserList(sendXml)

            commLoadResponseHandler(result, ($) => {
                const authInfo = userSession.getAuthInfo()
                const currentUserName = authInfo ? authInfo[0] : ''
                const currentUserType = userSession.userType

                userList.value = $('/response/content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const isAdmin = $item('userType').text() === USER_TYPE_DEFAULT_ADMIN

                    return {
                        id: item.attr('id') as string,
                        userName: $item('userName').text(),
                        password: $item('password').text(),
                        bindMacSwitch: $item('bindMacSwitch').text(),
                        userType: $item('userType').text(),
                        mac: $item('mac').text(),
                        email: $item('email').text(),
                        comment: $item('comment').text(),
                        enabled: $item('enabled').text(),
                        authEffective: $item('authEffective').text().toBoolean(),

                        authGroupId: isAdmin ? '' : ($item('authGroup').attr('id') as string),
                        authGroupName: isAdmin ? '' : $item('authGroup').text(),
                        del: !(isAdmin || $item('userName').text() === currentUserName),
                        edit: !(isAdmin && currentUserType !== USER_TYPE_DEFAULT_ADMIN),
                    }
                })

                handleChangeUser(userList.value[0])
            })

            closeLoading(LoadingTarget.FullScreen)
        }

        /**
         * @description 点击右侧表格项，更新权限组
         * @param row
         */
        const handleChangeUser = async (row: UserList) => {
            pageData.value.activeUser = userList.value.findIndex((item) => item.id === row.id)
            if (currentUser.value) {
                getAuthGroup(row.id)
            } else {
                resetAuth()
            }
        }

        /**
         * @description 打开编辑用户弹窗
         * @param row
         */
        const handleEditUser = (row: UserList) => {
            pageData.value.editUserId = row.id
            pageData.value.editUserName = row.userName
            pageData.value.isEditUser = true
        }

        /**
         * @description 关闭编辑用户弹窗
         */
        const handleCloseEditUser = () => {
            pageData.value.isEditUser = false
            getUserList(pageData.value.searchText)
        }

        /**
         * @description 删除用户
         * @param row
         */
        const handleDeleteUser = (row: UserList) => {
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_USER_DELETE_USER_S').formatForLang(row.userName),
            }).then(async () => {
                openLoading(LoadingTarget.FullScreen)
                const sendXml = rawXml`
                    <condition>
                        <userIds type="list">
                           <item id="${row.id}">${wrapCDATA(row.userName)}</item> 
                        </userIds>
                    </condition>
                `
                await delUser(sendXml)
                await getUserList(pageData.value.searchText)
                closeLoading(LoadingTarget.FullScreen)
            })
        }

        /**
         * @description 打开修改密码弹窗
         */
        const handleEditUserPassword = () => {
            pageData.value.isEditUserPassword = true
        }

        /**
         * @description 关闭修改密码弹窗
         */
        const handleCloseEditUserPassword = () => {
            pageData.value.isEditUserPassword = false
        }

        // 当前选中的用户
        const currentUser = computed(() => {
            if (!userList.value[pageData.value.activeUser]) {
                return null
            }
            return userList.value[pageData.value.activeUser]
        })

        // 当前选中用户的用户名
        const userName = computed(() => {
            if (currentUser.value) {
                return Translate('IDCS_USER_RIGHT_INFORMATION').formatForLang(replaceWithEntity(currentUser.value.userName))
            }
            return ''
        })

        // 当前选中用户的authEffective
        const authEffective = computed(() => {
            if (currentUser.value) {
                return currentUser.value.authEffective || currentUser.value.userType === USER_TYPE_DEFAULT_ADMIN
            }
            return true
        })

        /**
         * 处理右上侧输入框和按钮的事件
         * @param event
         * @returns
         */
        const handleToolBarEvent = (event: ConfigToolBarEvent<ChannelToolBarEvent>) => {
            if (event.type === 'search') {
                pageData.value.searchText = event.data.searchText
                getUserList(event.data.searchText)
                return
            }
        }

        /**
         * @description 显示权限开关文案
         * @param {boolean} string
         * @returns {string}
         */
        const displayChannelAuth = (value: string) => {
            return value === 'true' ? Translate('IDCS_ON') : Translate('IDCS_OFF')
        }

        /**
         * @description 显示权限组名字
         * @param {string} value
         * @returns {string}
         */
        const displayAuthGroup = (value: string) => {
            const defaultValue = DEFAULT_AUTH_GROUP_MAPPING[value]
            return defaultValue ? Translate(defaultValue) : value
        }

        onMounted(() => {
            getUserList('')
        })

        return {
            handleToolBarEvent,
            systemAuthList,
            pageData,
            channelAuthList,
            displayChannelAuth,
            userName,
            authEffective,
            userList,
            displayAuthGroup,
            handleChangeUser,
            handleEditUser,
            handleDeleteUser,
            handleCloseEditUser,
            handleEditUserPassword,
            handleCloseEditUserPassword,
            UserEditPop,
            UserEditPasswordPop,
        }
    },
})
