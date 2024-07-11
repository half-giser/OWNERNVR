/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 20:32:14
 * @Description: 权限组列表
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-09 20:45:45
 */
import BaseImgSprite from '../../components/sprite/BaseImgSprite.vue'
import PermissionGroupEditPop from './PermissionGroupEditPop.vue'
import { delAuthGroup } from '@/api/userAndSecurity'
import { type UserAuthGroupList, type UserPermissionChannelAuthList, UserPermissionSystemAuthList } from '@/types/apiType/userAndSecurity'

export default defineComponent({
    components: {
        BaseImgSprite,
        PermissionGroupEditPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const router = useRouter()

        // 权限组数据列表
        const authGroupList = ref<UserAuthGroupList[]>([])

        // 左侧系统权限列表
        const systemAuthList = ref(new UserPermissionSystemAuthList())

        // 左侧通道权限列表
        const channelAuthList = ref<UserPermissionChannelAuthList[]>([])

        const pageData = ref({
            // 通道权限Tabs
            channelTabs: DEFAULT_CHANNEL_AUTH_TABS,
            // 当前选中的通道权限Tab
            activeChannelTab: DEFAULT_CHANNEL_AUTH_TABS[0],
            // 当前选中的权限组索引
            activeAuthGroup: 0,
            // 是否打开编辑权限组弹窗
            isEditAuthGroup: false,
            // 编辑权限组的ID
            editAuthGroupID: '',
            // 本地通道权限列表
            localChannelIds: DEFAULT_LOCAL_CHANNEL_AUTH_LIST,
            // 远程通道权限列表
            remoteChannelIds: DEFAULT_REMOTE_CHANNEL_AUTH_LIST,
        })

        /**
         * @description 获取权限组
         */
        const getAuthGroup = async () => {
            openLoading(LoadingTarget.FullScreen)

            const result = await queryAuthGroupList('')

            commLoadResponseHandler(result, ($) => {
                authGroupList.value = []
                $('/response/content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const arrayItem: UserAuthGroupList = {
                        id: item.attr('id') as string,
                        name: $item('name').text(),
                        isDefault: $item('isDefault').text().toBoolean(),
                        enableEdit: $item('enableEdit').text().toBoolean(),
                        chlAuth: [],
                        systemAuth: {
                            localChlMgr: $item('systemAuth/localChlMgr').text().toBoolean(),
                            remoteChlMgr: $item('systemAuth/remoteChlMgr').text().toBoolean(),
                            diskMgr: $item('systemAuth/diskMgr').text().toBoolean(),
                            talk: $item('systemAuth/talk').text().toBoolean(),
                            alarmMgr: $item('systemAuth/alarmMgr').text().toBoolean(),
                            net: $item('systemAuth/net').text().toBoolean(),
                            rec: $item('systemAuth/rec').text().toBoolean(),
                            remoteLogin: $item('systemAuth/remoteLogin').text().toBoolean(),
                            scheduleMgr: $item('systemAuth/scheduleMgr').text().toBoolean(),
                            localSysCfgAndMaintain: $item('systemAuth/localSysCfgAndMaintain').text().toBoolean(),
                            facePersonnalInfoMgr: $item('systemAuth/facePersonnalInfoMgr').text().toBoolean(),
                            remoteSysCfgAndMaintain: $item('systemAuth/remoteSysCfgAndMaintain').text().toBoolean(),
                            securityMgr: $item('systemAuth/securityMgr').text().toBoolean(),
                            parkingLotMgr: $item('systemAuth/parkingLotMgr').text().toBoolean(),
                            AccessControlMgr: $item('systemAuth/AccessControlMgr').text().toBoolean(),
                        },
                    }
                    $item('chlAuth/item').forEach((chlItem) => {
                        const $chlItem = queryXml(chlItem.element)
                        arrayItem.chlAuth.push({
                            id: chlItem.attr('id') as string,
                            name: $chlItem('name').text(),
                            auth: $chlItem('auth').text(),
                        })
                    })
                    authGroupList.value.push(arrayItem)

                    if (authGroupList.value.length) {
                        if (!authGroupList.value[pageData.value.activeAuthGroup]) {
                            pageData.value.activeAuthGroup = 0
                        }
                        getSystemAuth()
                        getChannelAuth()
                    } else {
                        resetAuth()
                    }
                })
            })

            closeLoading(LoadingTarget.FullScreen)
        }

        /**
         * @description 更新左侧显示的系统权限
         */
        const getSystemAuth = () => {
            if (!currentAuthGroup.value) return
            const currentItem = currentAuthGroup.value.systemAuth
            Object.keys(systemAuthList.value).forEach((classify: string) => {
                Object.keys(systemAuthList.value[classify].value).forEach((key) => {
                    systemAuthList.value[classify].value[key].value = currentItem[key] || false
                })
            })
        }

        /**
         * @description 更新左侧显示的通道权限
         */
        const getChannelAuth = () => {
            if (!currentAuthGroup.value) return

            const currentItem = currentAuthGroup.value.chlAuth
            channelAuthList.value = currentItem.map((item) => {
                const arrayItem: Record<string, any> = {}
                arrayItem.id = item.id
                arrayItem.name = item.name
                DEFAULT_CHANNEL_AUTH_LIST.forEach((key) => {
                    if (item.auth.includes(key)) {
                        arrayItem[key] = 'true'
                    } else {
                        arrayItem[key] = 'false'
                    }
                })
                return arrayItem as UserPermissionChannelAuthList
            })
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
         * @description 处理高亮选中的权限组，显示左侧信息
         * @param {UserAuthGroupList} row
         */
        const handleChangeAuthGroup = async (row: UserAuthGroupList) => {
            pageData.value.activeAuthGroup = authGroupList.value.findIndex((item) => item.id === row.id)

            if (currentAuthGroup.value) {
                getSystemAuth()
                getChannelAuth()
            } else {
                resetAuth()
            }
        }

        /**
         * @description 打开编辑用户弹窗
         * @param {UserAuthGroupList} row
         */
        const handleEditAuthGroup = (row: UserAuthGroupList) => {
            pageData.value.editAuthGroupID = row.id
            pageData.value.isEditAuthGroup = true
        }

        /**
         * @description 关闭编辑用户弹窗
         * @param {boolean} e 是否刷新页面数据
         */
        const handleCloseEditAuthGroup = (e: boolean) => {
            pageData.value.isEditAuthGroup = false

            if (e) {
                getAuthGroup()
            }
        }

        /**
         * @description 删除权限组
         * @param {UserAuthGroupList} row
         */
        const handleDeleteAuthGroup = (row: UserAuthGroupList) => {
            openMessageTipBox({
                type: 'question',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_USER_DELETE_USERGROUP_S').formatForLang(replaceWithEntity(row.name)),
            }).then(async () => {
                openLoading(LoadingTarget.FullScreen)

                const sendXml = rawXml`
                    <condition>
                        <authGroupIds type="list">
                            <item id="${row.id}">${wrapCDATA(row.name)}</item>
                        </authGroupIds>
                    </condition>
                `
                const result = await delAuthGroup(sendXml)
                const $ = queryXml(result)

                closeLoading(LoadingTarget.FullScreen)

                if ($('/response/status').text() === 'success') {
                    openMessageTipBox({
                        type: 'success',
                        title: Translate('IDCS_SUCCESS_TIP'),
                        message: Translate('IDCS_DELETE_SUCCESS'),
                    })
                    getAuthGroup()
                } else {
                    const errorCode = Number($('response/errorCode').text())
                    let errorInfo = ''
                    switch (errorCode) {
                        case ErrorCode.USER_ERROR_EXISTED_CHILD_NODE:
                            errorInfo = Translate('IDCS_USER_DELETE_USERGROUP_N').formatForLang(getShortString(row.name, 10))
                            break
                        default:
                            errorInfo = Translate('IDCS_DELETE_FAIL')
                            break
                    }
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: errorInfo,
                    })
                }
            })
        }

        /**
         * @description 复制权限组
         * @param {UserAuthGroupList} row
         */
        const handleSaveAsAuthGroup = (row: UserAuthGroupList) => {
            router.push({
                path: '/config/security/auth_group/add',
                query: {
                    group_id: row.id,
                },
            })
        }

        // 当前选中的权限组
        const currentAuthGroup = computed(() => {
            if (!authGroupList.value[pageData.value.activeAuthGroup]) {
                return null
            }
            return authGroupList.value[pageData.value.activeAuthGroup]
        })

        // 当前选中全选组的名称
        const authGroupName = computed(() => {
            if (currentAuthGroup.value) {
                const name = currentAuthGroup.value.name
                const mappingName = displayAuthGroup(name)
                return Translate('IDCS_USER_RIGHT_INFORMATION').formatForLang(replaceWithEntity(mappingName))
            }
            return ''
        })

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
            const name = DEFAULT_AUTH_GROUP_MAPPING[value] ? Translate(DEFAULT_AUTH_GROUP_MAPPING[value]) : value
            return name
        }

        onMounted(() => {
            getAuthGroup()
        })

        return {
            systemAuthList,
            pageData,
            channelAuthList,
            displayChannelAuth,
            authGroupName,
            authGroupList,
            displayAuthGroup,
            handleChangeAuthGroup,
            handleEditAuthGroup,
            handleDeleteAuthGroup,
            handleCloseEditAuthGroup,
            handleSaveAsAuthGroup,
            BaseImgSprite,
            PermissionGroupEditPop,
        }
    },
})
