/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 20:32:14
 * @Description: 权限组列表
 */
import PermissionGroupEditPop from './PermissionGroupEditPop.vue'
import { delAuthGroup } from '@/api/userAndSecurity'
import { type UserAuthGroupList, UserPermissionChannelAuthList, UserPermissionSystemAuthList } from '@/types/apiType/userAndSecurity'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    components: {
        PermissionGroupEditPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()
        const router = useRouter()

        const tableRef = ref<TableInstance>()

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
            openLoading()

            const result = await queryAuthGroupList('')

            commLoadResponseHandler(result, ($) => {
                authGroupList.value = $('//content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id') as string,
                        name: $item('name').text(),
                        isDefault: $item('isDefault').text().bool(),
                        enableEdit: $item('enableEdit').text().bool(),
                        chlAuth: $item('chlAuth/item').map((chlItem) => {
                            const $chlItem = queryXml(chlItem.element)
                            return {
                                id: chlItem.attr('id') as string,
                                name: $chlItem('name').text(),
                                auth: $chlItem('auth').text(),
                            }
                        }),
                        systemAuth: {
                            localChlMgr: $item('systemAuth/localChlMgr').text().bool(),
                            remoteChlMgr: $item('systemAuth/remoteChlMgr').text().bool(),
                            diskMgr: $item('systemAuth/diskMgr').text().bool(),
                            talk: $item('systemAuth/talk').text().bool(),
                            alarmMgr: $item('systemAuth/alarmMgr').text().bool(),
                            net: $item('systemAuth/net').text().bool(),
                            rec: $item('systemAuth/rec').text().bool(),
                            remoteLogin: $item('systemAuth/remoteLogin').text().bool(),
                            scheduleMgr: $item('systemAuth/scheduleMgr').text().bool(),
                            localSysCfgAndMaintain: $item('systemAuth/localSysCfgAndMaintain').text().bool(),
                            facePersonnalInfoMgr: $item('systemAuth/facePersonnalInfoMgr').text().bool(),
                            remoteSysCfgAndMaintain: $item('systemAuth/remoteSysCfgAndMaintain').text().bool(),
                            securityMgr: $item('systemAuth/securityMgr').text().bool(),
                            parkingLotMgr: $item('systemAuth/parkingLotMgr').text().bool(),
                            AccessControlMgr: $item('systemAuth/AccessControlMgr').text().bool(),
                        },
                    }
                })

                if (authGroupList.value.length) {
                    if (!authGroupList.value[pageData.value.activeAuthGroup]) {
                        pageData.value.activeAuthGroup = 0
                    }
                    getSystemAuth()
                    getChannelAuth()
                    nextTick(() => {
                        tableRef.value!.setCurrentRow(authGroupList.value[pageData.value.activeAuthGroup])
                    })
                } else {
                    resetAuth()
                }
            })

            closeLoading()
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
                const arrayItem = new UserPermissionChannelAuthList()
                arrayItem.id = item.id
                arrayItem.name = item.name
                DEFAULT_CHANNEL_AUTH_LIST.forEach((key) => {
                    if (item.auth.includes(key)) {
                        arrayItem[key] = 'true'
                    } else {
                        arrayItem[key] = 'false'
                    }
                })
                return arrayItem
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
         * @description 确认编辑用户弹窗
         */
        const handleConfirmEditAuthGroup = () => {
            pageData.value.isEditAuthGroup = false
            getAuthGroup()
        }

        /**
         * @description 删除权限组
         * @param {UserAuthGroupList} row
         */
        const handleDeleteAuthGroup = (row: UserAuthGroupList) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_USER_DELETE_USERGROUP_S').formatForLang(replaceWithEntity(row.name)),
            }).then(async () => {
                openLoading()

                const sendXml = rawXml`
                    <condition>
                        <authGroupIds type="list">
                            <item id="${row.id}">${wrapCDATA(row.name)}</item>
                        </authGroupIds>
                    </condition>
                `
                const result = await delAuthGroup(sendXml)
                const $ = queryXml(result)

                closeLoading()

                if ($('//status').text() === 'success') {
                    openMessageBox({
                        type: 'success',
                        message: Translate('IDCS_DELETE_SUCCESS'),
                    })
                    getAuthGroup()
                } else {
                    const errorCode = $('//errorCode').text().num()
                    let errorInfo = ''
                    switch (errorCode) {
                        case ErrorCode.USER_ERROR_EXISTED_CHILD_NODE:
                            errorInfo = Translate('IDCS_USER_DELETE_USERGROUP_N').formatForLang(getShortString(row.name, 10))
                            break
                        default:
                            errorInfo = Translate('IDCS_DELETE_FAIL')
                            break
                    }
                    openMessageBox({
                        type: 'info',
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
                state: {
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
            if (!systemCaps.supportFaceMatch && !systemCaps.supportPlateMatch) {
                systemAuthList.value.configurations.value.facePersonnalInfoMgr.hidden = true
            }
            getAuthGroup()
        })

        return {
            systemAuthList,
            pageData,
            channelAuthList,
            displayChannelAuth,
            authGroupName,
            authGroupList,
            tableRef,
            displayAuthGroup,
            handleChangeAuthGroup,
            handleEditAuthGroup,
            handleDeleteAuthGroup,
            handleConfirmEditAuthGroup,
            handleSaveAsAuthGroup,
            PermissionGroupEditPop,
        }
    },
})
