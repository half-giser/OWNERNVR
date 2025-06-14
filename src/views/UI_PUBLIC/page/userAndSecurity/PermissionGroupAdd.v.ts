/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 20:32:26
 * @Description: 添加权限组
 */
import { type FormRules } from 'element-plus'
import type { XMLQuery } from '@/utils/xmlParse'
import PermissionGroupInfoPop from './PermissionGroupInfoPop.vue'

export default defineComponent({
    components: {
        PermissionGroupInfoPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const router = useRouter()
        const systemCaps = useCababilityStore()

        const formRef = useFormRef()
        const formData = ref(new UserPermissionGroupAddForm())

        const rules = ref<FormRules>({
            name: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value) {
                            callback(new Error(Translate('IDCS_USER_GROUP_EMPTY_TIPS')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

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
            openLoading()
            // 从另存为入口进来，回显数据
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

                commLoadResponseHandler(result, ($) => {
                    getSystemAuth($)
                    getChannelAuth($, true)
                    getAuthGroupList($('content/name').text())
                })
            }
            // 从新建入口进来，所有选项默认为false
            else {
                const result = await getChlList()
                commLoadResponseHandler(result, ($) => {
                    getSystemAuth()
                    getChannelAuth($, false)
                    getAuthGroupList()
                })
            }
            closeLoading()
        }

        /**
         * @description 创建从另存为入口进来的回显名称
         */
        const getAuthGroupList = async (name?: string) => {
            const sendXml = name
                ? rawXml`
                <condition>
                    <name>${wrapCDATA(name)}</name>
                    <requireField>
                        <name />
                    </requireField>
                </condition>
            `
                : ''
            const result = await queryAuthGroupList(sendXml)
            const $ = queryXml(result)

            formData.value.nameMaxByteLen = $('content/itemType/name').attr('maxByteLen').num() || nameByteMaxLen

            if (name) {
                const nameList = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return $item('name').text()
                })

                let groupName = ''
                for (let i = 1; i < Number.POSITIVE_INFINITY; i++) {
                    groupName = (DEFAULT_AUTH_GROUP_MAPPING[groupName] ? Translate(DEFAULT_AUTH_GROUP_MAPPING[groupName]) : name) + i
                    if (nameList.includes(groupName)) {
                        continue
                    } else break
                }
                formData.value.name = groupName
            }
        }

        /**
         * @description 更新系统权限
         * @param {Function} $doc
         */
        const getSystemAuth = ($doc?: XMLQuery) => {
            const $ = $doc ? queryXml($doc('content/systemAuth')[0].element) : ''
            Object.keys(systemAuthList.value).forEach((classify) => {
                systemAuthList.value[classify].label = Translate(systemAuthList.value[classify].key)
                Object.keys(systemAuthList.value[classify].value).forEach((key) => {
                    if ($) {
                        systemAuthList.value[classify].value[key].value = $(key).text().bool()
                    }

                    if (systemAuthList.value[classify].value[key].formatForLang?.length) {
                        systemAuthList.value[classify].value[key].label = Translate(systemAuthList.value[classify].value[key].key).formatForLang(
                            ...systemAuthList.value[classify].value[key].formatForLang.map((item) => Translate(item)),
                        )
                    } else {
                        systemAuthList.value[classify].value[key].label = Translate(systemAuthList.value[classify].value[key].key)
                    }
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
        const getChannelAuth = ($: XMLQuery, isQueryFromGroupID: boolean) => {
            if (isQueryFromGroupID) {
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
            } else {
                channelAuthList.value = $('content/item').map((item) => {
                    const arrayItem = new UserPermissionChannelAuthList()
                    const $item = queryXml(item.element)
                    arrayItem.id = item.attr('id')
                    arrayItem.name = $item('name').text()
                    DEFAULT_CHANNEL_AUTH_LIST.forEach((key) => {
                        arrayItem[key] = false
                    })
                    return arrayItem
                })
            }
        }

        /**
         * @description 一次性处理同列的开关
         * @param {string} key
         * @param {string} value
         */
        const changeAllChannelAuth = (key: UserPermissionAuthKey, value: boolean) => {
            channelAuthList.value.forEach((item) => {
                item[key] = value
            })
        }

        /**
         * @description 验证表单，通过后打开授权弹窗
         */
        const verify = () => {
            formData.value.name = formData.value.name.trim()
            formRef.value!.validate((valid) => {
                if (valid) {
                    doCreateAuthGroup()
                }
            })
        }

        /**
         * @description 发起新建权限组请求
         */
        const doCreateAuthGroup = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <name maxByteLen="63">${wrapCDATA(formData.value.name)}</name>
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
                                        ${wrapCDATA(DEFAULT_CHANNEL_AUTH_LIST.filter((key) => item[key]).join(','))}
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
            const result = await createAuthGroup(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                goBack()
            } else {
                const errorCode = $('errorCode').text().num()
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_NAME_EXISTED:
                        errorInfo = Translate('IDCS_USER_GROUP_EXISTED_TIPS')
                        break
                    case ErrorCode.USER_ERROR_OVER_LIMIT:
                        errorInfo = Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT')
                        break
                    default:
                        errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                        break
                }
                openMessageBox(errorInfo)
            }
        }

        /**
         * @description 返回至权限列表页
         */
        const goBack = () => {
            router.push({
                path: '/config/security/auth_group/list',
            })
        }

        onMounted(() => {
            if (!systemCaps.supportFaceMatch && !systemCaps.supportPlateMatch) {
                systemAuthList.value.configurations.value.facePersonnalInfoMgr.hidden = true
            }
            const id = history.state.group_id || ''
            getAuthGroup(id)
            if (history.state.group_id) {
                delete history.state.group_id
            }
        })

        return {
            formRef,
            formData,
            rules,
            systemAuthList,
            channelAuthList,
            pageData,
            goBack,
            verify,
            changeAllChannelAuth,
        }
    },
})
