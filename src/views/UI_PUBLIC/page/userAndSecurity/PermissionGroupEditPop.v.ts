/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 15:33:50
 * @Description: 编辑权限组弹窗
 */
import type { XMLQuery } from '@/utils/xmlParse'
import PermissionGroupInfoPop from './PermissionGroupInfoPop.vue'

export default defineComponent({
    components: {
        PermissionGroupInfoPop,
    },
    props: {
        /**
         * @description 用户组ID
         */
        groupId: {
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
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const systemCaps = useCababilityStore()

        const formData = ref(new UserPermissionGroupAddForm())

        // 系统权限列表
        const systemAuthList = ref(new UserPermissionSystemAuthList())

        // 通道权限列表
        const channelAuthList = ref<UserPermissionChannelAuthList[]>([])

        const pageData = ref({
            isShowInfo: false,
            // 通道权限Tabs
            channelTabs: DEFAULT_CHANNEL_AUTH_TABS,
            // 当前选中的通道权限Tab
            activeChannelTab: DEFAULT_CHANNEL_AUTH_TABS[0],
            // 通道权限选项
            channelOption: getTranslateOptions(DEFAULT_BOOL_SWITCH_OPTIONS),
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

            commLoadResponseHandler(result, ($) => {
                getSystemAuth($)
                getChannelAuth($)
                formData.value.name = $('content/name').text()
            })
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
            if (userSession.userType === USER_TYPE_DEFAULT_ADMIN) {
                systemAuthList.value.configurations.value.securityMgr.value = false
            }
        }

        /**
         * @description 更新通道权限
         * @param {Function} $
         * @param {boolean} isQueryFromGroupID
         */
        const getChannelAuth = ($: XMLQuery) => {
            channelAuthList.value = $('content/chlAuth/item').map((item) => {
                const arrayItem = new UserPermissionChannelAuthList()
                const $item = queryXml(item.element)
                arrayItem.id = item.attr('id')
                arrayItem.name = $item('name').text()
                const auth = $item('auth').text()
                DEFAULT_CHANNEL_AUTH_LIST.forEach((key) => {
                    if (auth.includes(key)) {
                        arrayItem[key] = true
                    } else {
                        arrayItem[key] = false
                    }
                })
                return arrayItem
            })
        }

        /**
         * @description 一次性处理同列的开关
         * @param {string} key
         * @param {boolean} value
         */
        const changeAllChannelAuth = (key: UserPermissionAuthKey, value: boolean) => {
            channelAuthList.value.forEach((item) => {
                item[key] = value
            })
        }

        /**
         * @description 发起编辑权限组请求
         */
        const doEditAuthGroup = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <id>${prop.groupId}</id>
                    <name>${wrapCDATA(formData.value.name)}</name>
                    <chlAuthNote>${wrapCDATA('local: [_lp:live preview, _spr: search and play record, _bk:backup, _ptz:PTZ control],remote: [@lp:live preview, @spr: search and play record, @bk:backup, @ptz: PTZ control]')}</chlAuthNote>
                    <chlAuth type="list">
                        <itemType>
                            <name/>
                            <auth/>
                        </itemType>
                        ${channelAuthList.value
                            .map((item) => {
                                return rawXml`
                                    <item id="${item.id}">
                                        <name>${wrapCDATA(item.name)}</name>
                                        <auth>${wrapCDATA(DEFAULT_CHANNEL_AUTH_LIST.filter((key) => item[key]).join(','))}</auth>
                                    </item>
                                `
                            })
                            .join('')}
                    </chlAuth>
                    <systemAuth>
                        ${Object.keys(systemAuthList.value)
                            .map((item) => {
                                return Object.keys(systemAuthList.value[item].value)
                                    .map((key) => {
                                        return `<${key}>${systemAuthList.value[item].value[key].value}</${key}>`
                                    })
                                    .join('')
                            })
                            .join('')}
                    </systemAuth>
                </content>
            `
            const result = await editAuthGroup(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                ctx.emit('confirm')
            } else {
                const errorCode = $('errorCode').text().num()
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_GET_CONFIG_INFO_FAIL:
                        ctx.emit('confirm')
                        return
                    case ErrorCode.USER_ERROR__CANNOT_FIND_NODE_ERROR:
                        errorInfo = Translate('IDCS_RESOURCE_NOT_EXIST').format(Translate('IDCS_RIGHT_GROUP'))
                        break
                    default:
                        errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                        break
                }
                openMessageBox(errorInfo)
            }
        }

        /**
         * @description 处理关闭弹窗
         */
        const goBack = () => {
            ctx.emit('close')
        }

        /**
         * @description 打开弹窗时处理回显信息
         */
        const open = async () => {
            openLoading()
            formData.value.name = ''
            // channelAuthList.value = []
            await getAuthGroup(prop.groupId)
            closeLoading()
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
            systemAuthList.value = new UserPermissionSystemAuthList()
            if (!systemCaps.supportFaceMatch && !systemCaps.supportPlateMatch) {
                systemAuthList.value.configurations.value.facePersonnalInfoMgr.hidden = true
            }
        })

        return {
            formData,
            doEditAuthGroup,
            systemAuthList,
            channelAuthList,
            pageData,
            goBack,
            changeAllChannelAuth,
            open,
            displayAuthGroup,
        }
    },
})
