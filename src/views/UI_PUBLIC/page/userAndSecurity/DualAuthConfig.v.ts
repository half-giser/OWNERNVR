import DualAuthConfigAddPop from './DualAuthConfigAddPop.vue'

export default defineComponent({
    components: {
        DualAuthConfigAddPop,
    },
    setup() {
        const { Translate } = useLangStore()

        const pageData = ref({
            isAddPop: false,
            addPopType: 'add',
            row: null,
            isCheckAuthPop: false,
            checkAuthType: 'set',
            deleteUserIds: [] as string[],
            popData: new UserDualAuthUserDto(),
        })

        const userIdNameMap: Record<string, string> = {}

        const formData = ref({
            switch: false,
        })

        const tableData = ref<UserDualAuthUserDto[]>([])

        const add = () => {
            pageData.value.isAddPop = true
            pageData.value.addPopType = 'add'
        }

        const edit = (row: UserDualAuthUserDto) => {
            pageData.value.isAddPop = true
            pageData.value.addPopType = 'edit'
            pageData.value.popData = row
        }

        const confirmAdd = () => {
            pageData.value.isAddPop = false
            getDualAuthUserList()
        }

        const del = (row: UserDualAuthUserDto) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_USER_DELETE_USER_S').formatForLang(row.userName),
            }).then(() => {
                pageData.value.isCheckAuthPop = true
                pageData.value.deleteUserIds = [row.id]
                pageData.value.checkAuthType = 'del'
            })
        }

        const delAll = () => {
            if (!tableData.value.length) {
                return
            }

            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_ALL_ONVIF_USER_TIP'),
            }).then(() => {
                const ids = tableData.value.map((item) => item.id)
                pageData.value.isCheckAuthPop = true
                pageData.value.deleteUserIds = ids
                pageData.value.checkAuthType = 'del'
                // delDualAuthUser(ids)
            })
        }

        const confirmCheckAuth = (e: UserCheckAuthForm) => {
            if (pageData.value.checkAuthType === 'del') {
                confirmDelDualAuthUser(e)
            } else {
                confirmSetDualAuthCfg(e)
            }
        }

        const confirmDelDualAuthUser = async (e: UserCheckAuthForm) => {
            openLoading()

            const sendXml = rawXml`
                <condition>
                    <userIds>
                        ${pageData.value.deleteUserIds.map((item) => `<item id="${item}"></item>`).join('')}
                    </userIds>
                </condition>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await delDualAuthUser(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                pageData.value.isCheckAuthPop = false
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).then(() => {
                    getDualAuthUserList()
                })
            } else {
                const errorCode = $('errorCode').text().num()
                handleErrorCode(errorCode)
            }
        }

        const confirmSetDualAuthCfg = async (e: UserCheckAuthForm) => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <switch>${formData.value.switch}</switch>
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await editDualAuthCfg(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                pageData.value.isCheckAuthPop = false
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
            } else {
                const errorCode = $('errorCode').text().num()
                handleErrorCode(errorCode)
            }
        }

        const handleErrorCode = (errorCode: number) => {
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

        const getAllUserList = async () => {
            const result = await queryUserList('')
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    userIdNameMap[item.attr('id')] = $item('userName').text()
                })
            }
        }

        const getDualAuthCfg = async () => {
            const result = await queryDualAuthCfg()
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                formData.value.switch = $('content/switch').text().bool()
            }
        }

        const getDualAuthUserList = async () => {
            const result = await queryDualAuthUserList()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                tableData.value = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id'),
                        userName: $item('userName').text(),
                        userNameMaxByteLen: $item('userName').attr('maxByteLen').num() || 63,
                        limitLoginUsers: [],
                    }
                })
            }
            tableData.value.forEach((item, index) => {
                getDualAuthUser(item.id, index)
            })
        }

        const getDualAuthUser = async (userId: string, index: number) => {
            const sendXml = rawXml`
                <condition>
                    <userId>${userId}</userId>
                </condition>
            `
            const result = await queryDualAuthUser(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                tableData.value[index].limitLoginUsers = $('content/limitLoginUsers/item').map((item) => {
                    return {
                        id: item.attr('id'),
                        userName: userIdNameMap[item.attr('id')],
                    }
                })
            }
        }

        const setDualAuthCfg = () => {
            pageData.value.isCheckAuthPop = true
            pageData.value.checkAuthType = 'set'
        }

        onMounted(async () => {
            openLoading()
            await getAllUserList()
            await getDualAuthCfg()
            await getDualAuthUserList()
            closeLoading()
        })

        return {
            pageData,
            tableData,
            formData,
            add,
            edit,
            del,
            delAll,
            confirmCheckAuth,
            setDualAuthCfg,
            confirmAdd,
        }
    },
})
