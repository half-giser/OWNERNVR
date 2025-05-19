/*
 * @Date: 2025-05-10 17:01:38
 * @Description: IP Speaker
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import type { TableInstance } from 'element-plus'
import ChannelIpSpeakerAddPop from './ChannelIpSpeakerAddPop.vue'
import ChannelIpSpeakerEditPop from './ChannelIpSpeakerEditPop.vue'

export default defineComponent({
    components: {
        ChannelIpSpeakerAddPop,
        ChannelIpSpeakerEditPop,
    },
    setup(_prop, ctx) {
        const systemCaps = useCababilityStore()
        const { Translate } = useLangStore()

        const tableData = ref<ChannelIpSpeakerDto[]>([])
        const tableRef = ref<TableInstance>()
        const chlMap: Record<string, string> = {}

        const pageData = ref({
            onlineChlList: [],
            searchText: '',
            isAddPop: false,
            isEditPop: false,
            editData: new ChannelIpSpeakerDto(),
        })

        const getChlName = async () => {
            const result = await getChlList({
                nodeType: 'chls',
            })
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    chlMap[item.attr('id')] = $item('name').text()
                })
            }
        }

        const getVoiceDevList = async () => {
            openLoading()

            const result = await getChlList({
                nodeType: 'voices',
            })
            const $ = await commLoadResponseHandler(result)
            tableData.value = $('content/item')
                .map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id'),
                        index: item.attr('index').num() + 1,
                        name: $item('name').text(),
                        ip: $item('ip').text(),
                        port: $item('port').text().num(),
                        status: false,
                        protocolType: '',
                        associatedDeviceID: '',
                        associatedDeviceName: '',
                        associatedType: '',
                        username: '',
                    }
                })
                .filter((item) => {
                    return !pageData.value.searchText || item.name.indexOf(pageData.value.searchText) > -1
                })

            tableData.value.forEach((row) => {
                getVoiceDev(row)
            })

            refreshChlStatusTimer.repeat(true)

            closeLoading()
        }

        const getVoiceDev = async (row: ChannelIpSpeakerDto) => {
            refreshChlStatusTimer.stop()

            const sendXml = rawXml`
                <condition>
                    <alarmInId>${row.id}</alarmInId>
                </condition>
            `
            const result = await queryVoiceDev(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                row.protocolType = $('content/protocolType').text()
                row.associatedDeviceID = $('content/associatedType ').attr('id')
                row.associatedType = $('content/associatedType').text()
                row.username = $('content/userName').text()

                switch (row.associatedType) {
                    case 'LOCAL':
                        row.associatedDeviceID = DEFAULT_EMPTY_ID
                        row.associatedDeviceName = 'NVR'
                        break
                    case 'NONE':
                        row.associatedDeviceID = ''
                        row.associatedDeviceName = `<${Translate('IDCS_NULL')}>`
                        break
                    case 'CHANNEL':
                    default:
                        row.associatedDeviceName = chlMap[row.associatedDeviceID]
                        break
                }
            }
        }

        const refreshChlStatusTimer = useRefreshTimer(async () => {
            const onlineChlList = await getOnlineChlList()
            tableData.value.forEach((item) => {
                item.status = onlineChlList.includes(item.id)
            })
            refreshChlStatusTimer.repeat()
        })

        const getOnlineChlList = async () => {
            const result = await queryOnlineVoiceDevList()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                const onlineChlList = $('content/item').map((element) => element.attr('id'))
                return onlineChlList
            } else {
                return []
            }
        }

        const handleEdit = (row: ChannelIpSpeakerDto) => {
            pageData.value.isEditPop = true
            pageData.value.editData = row
        }

        const confirmEdit = () => {
            pageData.value.isEditPop = false
            getVoiceDevList()
        }

        const handleDel = (row: ChannelIpSpeakerDto) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(() => {
                delDev([row.id])
            })
        }

        const delDev = async (ids: string[]) => {
            openLoading()

            const sendXml = rawXml`
                <condition>
                    <devIds type="list">
                        ${ids.map((id) => `<item id="${id}" />`).join('')}
                    </devIds>
                </condition>
            `
            const result = await delVoiceDevList(sendXml)
            const $ = queryXml(result)

            closeLoading()
            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_DELETE_SUCCESS'),
                }).then(() => {
                    getVoiceDevList()
                })
            } else {
                const errorCode = $('errorCode').text().num()
                let errorInfo = Translate('IDCS_DELETE_FAIL')
                if (errorCode === ErrorCode.USER_ERROR_INVLID_NODE) {
                    errorInfo = Translate('IDCS_SAVE_FAIL')
                }
                openMessageBox(errorInfo).then(() => {
                    getVoiceDevList()
                })
            }
        }

        const handleAdd = () => {
            pageData.value.isAddPop = true
        }

        const confirmAdd = () => {
            pageData.value.isAddPop = false
            getVoiceDevList()
        }

        const handleToolBarEvent = (toolBarEvent: ConfigToolBarEvent<SearchToolBarEvent>) => {
            switch (toolBarEvent.type) {
                case 'search':
                    pageData.value.searchText = toolBarEvent.data.searchText
                    getVoiceDevList()
                    break
                case 'add':
                    handleAdd()
                    break
                case 'del':
                    const rows = tableRef.value!.getSelectionRows() as ChannelIpSpeakerDto[]
                    if (!rows.length) {
                        openMessageBox(Translate('IDCS_PROMPT_CHANNEL_GROUP_EMPTY'))
                        break
                    }
                    openMessageBox({
                        type: 'question',
                        message: Translate('IDCS_DELETE_MP_S'),
                    }).then(() => {
                        const ids = rows.map((item) => item.id)
                        delDev(ids)
                    })
                    break
                default:
                    break
            }
        }

        onMounted(async () => {
            await getChlName()
            getVoiceDevList()
        })

        ctx.expose({
            handleToolBarEvent,
        })

        return {
            tableData,
            systemCaps,
            handleEdit,
            handleDel,
            pageData,
            tableRef,
            confirmAdd,
            confirmEdit,
        }
    },
})
