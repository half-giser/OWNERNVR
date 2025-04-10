/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 17:21:22
 * @Description: 查看或更改用户
 */
import UserEditPop from './UserEditPop.vue'
import UserEditPasswordPop from './UserEditPasswordPop.vue'
import type { XMLQuery } from '@/utils/xmlParse'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    components: {
        UserEditPop,
        UserEditPasswordPop,
    },
    setup(_prop, ctx) {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const systemCaps = useCababilityStore()

        const tableRef = ref<TableInstance>()

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
            activeUser: -1,
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
            localChannelIds: getTranslateOptions(DEFAULT_LOCAL_CHANNEL_AUTH_LIST),
            // 远程通道权限列表
            remoteChannelIds: getTranslateOptions(DEFAULT_REMOTE_CHANNEL_AUTH_LIST),
        })

        /**
         * @description 获取权限组
         * @param id
         */
        const getAuthGroup = async (id: string) => {
            openLoading()

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
                const result = await getChlList()
                commLoadResponseHandler(result, ($) => {
                    getChannelAuth($, false)
                })
            }

            closeLoading()
        }

        /**
         * @description 更新系统权限
         * @param {Function} $doc
         */
        const getSystemAuth = ($doc: XMLQuery) => {
            const $ = queryXml($doc('content/systemAuth')[0].element)
            Object.keys(systemAuthList.value).forEach((classify) => {
                Object.keys(systemAuthList.value[classify].value).forEach((key) => {
                    systemAuthList.value[classify].value[key].value = $(key).text().bool()
                })
            })
        }

        /**
         * @description 更新通道权限
         * @param {Function} $
         * @param {boolean} isQueryFromUserID
         */
        const getChannelAuth = ($: XMLQuery, isQueryFromUserID: boolean) => {
            if (isQueryFromUserID) {
                channelAuthList.value = $('content/chlAuth/item').map((item) => {
                    const arrayItem = new UserPermissionChannelAuthList()
                    const $item = queryXml(item.element)
                    arrayItem.id = item.attr('id')
                    arrayItem.name = $item('name').text()
                    const auth = $item('auth').text()
                    DEFAULT_CHANNEL_AUTH_LIST.forEach((key) => {
                        arrayItem[key] = auth.includes(key)
                    })
                    return arrayItem
                })
            } else {
                channelAuthList.value = $('content/item').map((item) => {
                    const arrayItem = new UserPermissionChannelAuthList()
                    const $item = queryXml(item.element)
                    arrayItem.id = item.attr('id')
                    arrayItem.name = $item('name').text()
                    DEFAULT_CHANNEL_AUTH_LIST.forEach((key) => {
                        arrayItem[key] = true
                    })
                    return arrayItem
                })
            }
        }

        /**
         * @description 清除所有左侧权限信息
         */
        const resetAuth = () => {
            Object.keys(systemAuthList.value).forEach((classify) => {
                Object.keys(systemAuthList.value[classify].value).forEach((key) => {
                    systemAuthList.value[classify].value[key].value = false
                })
            })
            channelAuthList.value = []
        }

        /**
         * @description 获取用户列表
         * @param {string} userName
         */
        const getUserList = async (userName: string) => {
            openLoading()

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

                userList.value = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const isAdmin = $item('userType').text() === USER_TYPE_DEFAULT_ADMIN

                    return {
                        id: item.attr('id'),
                        userName: $item('userName').text(),
                        password: $item('password').text(),
                        bindMacSwitch: $item('bindMacSwitch').text(),
                        userType: $item('userType').text(),
                        mac: $item('mac').text(),
                        email: $item('email').text(),
                        comment: $item('comment').text(),
                        enabled: $item('enabled').text(),
                        authEffective: $item('authEffective').text().bool(),

                        authGroupId: isAdmin ? '' : $item('authGroup').attr('id'),
                        authGroupName: isAdmin ? '' : $item('authGroup').text(),
                        del: !(isAdmin || $item('userName').text() === currentUserName),
                        edit: !(isAdmin && currentUserType !== USER_TYPE_DEFAULT_ADMIN),
                    }
                })

                changeUser(userList.value[0])
                nextTick(() => {
                    tableRef.value!.setCurrentRow(userList.value[0])
                })
            })

            closeLoading()
        }

        /**
         * @description 点击右侧表格项，更新权限组
         * @param row
         */
        const changeUser = (row: UserList) => {
            if (userList.value[pageData.value.activeUser] === row) {
                return
            }
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
        const openEditUserPop = (row: UserList) => {
            pageData.value.editUserId = row.id
            pageData.value.editUserName = row.userName
            pageData.value.isEditUser = true
        }

        /**
         * @description 关闭编辑用户弹窗
         */
        const confirmEditUser = () => {
            pageData.value.isEditUser = false
            getUserList(pageData.value.searchText)
        }

        /**
         * @description 删除用户
         * @param row
         */
        const deleteUser = (row: UserList) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_USER_DELETE_USER_S').formatForLang(row.userName),
            }).then(async () => {
                openLoading()
                const sendXml = rawXml`
                    <condition>
                        <userIds type="list">
                           <item id="${row.id}">${wrapCDATA(row.userName)}</item> 
                        </userIds>
                    </condition>
                `
                const result = await delUser(sendXml)
                const $ = queryXml(result)
                closeLoading()
                if ($('status').text() === 'success') {
                    await getUserList(pageData.value.searchText)
                } else {
                    const errorCode = $('errorCode').text().num()
                    let errorInfo = ''
                    switch (errorCode) {
                        // 用户不存在
                        case ErrorCode.USER_ERROR_NO_USER:
                        case ErrorCode.USER_ERROR_PWD_ERR:
                            errorInfo = Translate('IDCS_USER_OR_PASSWORD_ERROR')
                            break
                        // 鉴权账号无相关权限
                        case ErrorCode.USER_ERROR_NO_AUTH:
                            errorInfo = Translate('IDCS_NO_AUTH')
                            break
                        default:
                            errorInfo = Translate('IDCS_DELETE_FAIL')
                            break
                    }
                    openMessageBox(errorInfo).then(() => {
                        getUserList(pageData.value.searchText)
                    })
                }
            })
        }

        /**
         * @description 打开修改密码弹窗
         */
        const openEditUserPasswordPop = () => {
            pageData.value.isEditUserPassword = true
        }

        /**
         * @description 关闭修改密码弹窗
         */
        // const handleCloseEditUserPassword = () => {
        //     pageData.value.isEditUserPassword = false
        // }

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
                return Translate('IDCS_USER_RIGHT_INFORMATION').formatForLang(currentUser.value.userName)
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
        const handleToolBarEvent = (event: ConfigToolBarEvent<SearchToolBarEvent>) => {
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
        const displayChannelAuth = (value: boolean) => {
            return value ? Translate('IDCS_ON') : Translate('IDCS_OFF')
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
            if (!systemCaps.supportFaceMatch && !systemCaps.supportPlateMatch) {
                systemAuthList.value.configurations.value.facePersonnalInfoMgr.hidden = true
            }
            getUserList('')
        })

        ctx.expose({
            handleToolBarEvent,
        })

        return {
            tableRef,
            systemAuthList,
            pageData,
            channelAuthList,
            displayChannelAuth,
            userName,
            authEffective,
            userList,
            displayAuthGroup,
            changeUser,
            openEditUserPop,
            deleteUser,
            confirmEditUser,
            openEditUserPasswordPop,
        }
    },
})
