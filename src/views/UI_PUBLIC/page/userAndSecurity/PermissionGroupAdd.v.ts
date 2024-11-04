/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 20:32:26
 * @Description: 添加权限组
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-30 10:26:31
 */
import { UserPermissionSystemAuthList, UserPermissionChannelAuthList } from '@/types/apiType/userAndSecurity'
import { UserPermissionGroupAddForm } from '@/types/apiType/userAndSecurity'
import { type FormInstance, type FormRules } from 'element-plus'
import type { XMLQuery } from '@/utils/xmlParse'
import PermissionGroupInfoPop from './PermissionGroupInfoPop.vue'

export default defineComponent({
    components: {
        PermissionGroupInfoPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const { openMessageBox } = useMessageBox()
        const { closeLoading, openLoading } = useLoading()
        const router = useRouter()
        const systemCaps = useCababilityStore()

        const formRef = ref<FormInstance>()
        const formData = ref(new UserPermissionGroupAddForm())

        const rules = ref<FormRules>({
            name: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.trim()) {
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
            channelOption: getSwitchOptions(),
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
                    getAuthGroupName($('//content/name').text())
                })
            }
            // 从新建入口进来，所有选项默认为false
            else {
                const result = await getChlList({})
                commLoadResponseHandler(result, ($) => {
                    getChannelAuth($, false)
                })
            }
            closeLoading()
        }

        /**
         * @description 创建从另存为入口进来的回显名称
         */
        const getAuthGroupName = async (name: string) => {
            const sendXml = rawXml`
                <condition>
                    <name>${wrapCDATA(name)}</name>
                    <requireField>
                        <name />
                    </requireField>
                </condition>
            `
            const result = await queryAuthGroupList(sendXml)
            const $ = queryXml(result)

            const nameList = $('//content/item').map((item) => {
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

        /**
         * @description 更新系统权限
         * @param {Function} $doc
         */
        const getSystemAuth = ($doc: XMLQuery) => {
            const $ = queryXml($doc('//content/systemAuth')[0].element)
            Object.keys(systemAuthList.value).forEach((classify: string) => {
                Object.keys(systemAuthList.value[classify].value).forEach((key) => {
                    systemAuthList.value[classify].value[key].value = $(key).text().toBoolean()
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
                channelAuthList.value = $('//content/chlAuth/item').map((item) => {
                    const arrayItem = new UserPermissionChannelAuthList()
                    const $item = queryXml(item.element)
                    arrayItem.id = item.attr('id')!
                    arrayItem.name = $item('name').text()
                    const auth = $item('auth').text()
                    DEFAULT_CHANNEL_AUTH_LIST.forEach((key) => {
                        if (auth.includes(key)) {
                            arrayItem[key] = Translate('IDCS_ON')
                        } else {
                            arrayItem[key] = Translate('IDCS_OFF')
                        }
                    })
                    return arrayItem
                })
            } else {
                channelAuthList.value = $('//content/item').map((item) => {
                    const arrayItem = new UserPermissionChannelAuthList()
                    const $item = queryXml(item.element)
                    arrayItem.id = item.attr('id')!
                    arrayItem.name = $item('name').text()
                    DEFAULT_CHANNEL_AUTH_LIST.forEach((key) => {
                        arrayItem[key] = Translate('IDCS_OFF')
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
        const changeAllChannelAuth = (key: keyof UserPermissionChannelAuthList, value: string) => {
            channelAuthList.value.forEach((item) => {
                item[key] = value
            })
        }

        /**
         * @description 验证表单，通过后打开授权弹窗
         */
        const verify = () => {
            formRef.value?.validate((valid) => {
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
                    <chlAuthNote><![CDATA[local: [_lp:live preview, _spr: search and play record, _bk:backup, _ptz:PTZ control],remote: [@lp:live preview, @spr: search and play record, @bk:backup, @ptz: PTZ control]]]></chlAuthNote>
                    <chlAuth type="list">
                        <itemType>
                            <name/>
                            <auth/>
                        </itemType>
                        ${channelAuthList.value
                            .map((item) => {
                                return rawXml`
                                    <item id="${item.id}">
                                        ${wrapCDATA(DEFAULT_CHANNEL_AUTH_LIST.filter((key) => item[key] === Translate('IDCS_ON')).join(','))}
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

            if ($('//status').text() === 'success') {
                goBack()
            } else {
                const errorCode = Number($('//errorCode').text())
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
                openMessageBox({
                    type: 'info',
                    message: errorInfo,
                })
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
            formatInputMaxLength,
            nameByteMaxLen,
            systemAuthList,
            channelAuthList,
            pageData,
            goBack,
            verify,
            changeAllChannelAuth,
            PermissionGroupInfoPop,
        }
    },
})
