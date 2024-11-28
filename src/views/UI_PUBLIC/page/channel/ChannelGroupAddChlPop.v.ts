/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-18 18:07:21
 * @Description: 通道组 - 新增通道弹窗
 */
import { ChannelInfoDto, type ChannelGroupDto } from '@/types/apiType/channel'
import { type TableInstance } from 'element-plus'
import { cloneDeep } from 'lodash-es'

export default defineComponent({
    props: {
        editItem: {
            type: Object as PropType<ChannelGroupDto>,
            required: true,
        },
    },
    emits: {
        close(isRefresh = false) {
            return typeof isRefresh === 'boolean'
        },
    },
    setup(props, { emit }) {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageBox } = useMessageBox()

        let tmpEditItem: ChannelGroupDto
        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelInfoDto[]>([])
        const baseLivePopRef = ref<LivePopInstance>()
        const selNum = ref(0)

        const handleRowClick = (rowData: ChannelInfoDto) => {
            tableRef.value!.clearSelection()
            tableRef.value!.toggleRowSelection(rowData, true)
        }

        const handleSelectionChange = () => {
            selNum.value = tableRef.value!.getSelectionRows().length
        }

        const handlePreview = (rowData: ChannelInfoDto) => {
            baseLivePopRef.value!.openLiveWin(rowData.id, rowData.name)
        }

        const opened = () => {
            tmpEditItem = cloneDeep(props.editItem)
            getData()
        }

        const getData = () => {
            const data = rawXml`
                <requireField>
                    <name/>
                    <ip/>
                    <chlIndex/>
                    <chlType/>
                </requireField>`
            openLoading()
            queryDevList(data).then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    const chlList: ChannelInfoDto[] = []
                    const addedChlList: string[] = tmpEditItem.chls.map((ele: Record<string, string | boolean>) => {
                        return ele.value as string
                    })
                    $('content/item').forEach((ele) => {
                        const $item = queryXml(ele.element)
                        const id = ele.attr('id')
                        if (!addedChlList.includes(id)) {
                            const newData = new ChannelInfoDto()
                            newData.id = id
                            newData.chlIndex = $item('chlIndex').text()
                            newData.chlType = $item('chlType').text()
                            newData.name = $item('name').text()
                            newData.ip = $item('ip').text()
                            newData.addType = $item('addType').text()
                            chlList.push(newData)
                        }
                    })
                    tableData.value = chlList
                }
            })
        }

        const verification = () => {
            if (!selNum.value) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_CHANNEL_GROUP_EMPTY'),
                })
                return false
            }
            return true
        }

        const save = () => {
            if (!verification()) return
            const selection = tableRef.value!.getSelectionRows() as ChannelInfoDto[]
            const sendXml = rawXml`
                <types>
                    <actionType>
                        <enum>add</enum>
                        <enum>remove</enum>
                    </actionType>
                </types>
                <content>
                    <chlGroup>
                        <action type='actionType'>add</action>
                        <id>${tmpEditItem.id}</id>
                        <chls type='list'>
                            ${selection.map((ele) => `<item id='${ele.id}'></item>`).join('')}
                        </chls>
                    </chlGroup>
                </content>`
            openLoading()
            editSetAndElementRelation(sendXml).then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    tableRef.value!.getSelectionRows().forEach((ele: ChannelInfoDto) => {
                        tmpEditItem.chls.push({
                            value: ele.id,
                            text: ele.name,
                            showDelIcon: false,
                        })
                    })
                    emit('close', true)
                } else {
                    const errorCdoe = $('errorCode').text().num()
                    if (errorCdoe === ErrorCode.USER_ERROR_OVER_LIMIT) {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                        })
                    } else {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_SAVE_DATA_FAIL'),
                        })
                    }
                }
            })
        }

        return {
            tableRef,
            tableData,
            selNum,
            baseLivePopRef,
            opened,
            handleRowClick,
            handleSelectionChange,
            handlePreview,
            save,
        }
    },
})
