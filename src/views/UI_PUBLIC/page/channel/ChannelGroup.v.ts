/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-17 21:17:45
 * @Description: 通道组
 */
import { ChannelGroupDto } from '@/types/apiType/channel'
import ChannelGroupEditPop from './ChannelGroupEditPop.vue'
import ChannelGroupAddChlPop from './ChannelGroupAddChlPop.vue'
import ChannelPtzTableExpandPanel from './ChannelPtzTableExpandPanel.vue'
import ChannelPtzTableExpandItem from './ChannelPtzTableExpandItem.vue'

export default defineComponent({
    components: {
        ChannelGroupEditPop,
        ChannelGroupAddChlPop,
        ChannelPtzTableExpandPanel,
        ChannelPtzTableExpandItem,
    },
    setup(_prop, ctx) {
        const router = useRouter()
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageBox } = useMessageBox()

        const tableData = ref<ChannelGroupDto[]>([])
        const pageIndex = ref(1)
        const pageSize = ref(10)
        const pageTotal = ref(0)
        const editItem = ref(new ChannelGroupDto())
        const editItemForAddChl = ref(new ChannelGroupDto())
        const isEditPop = ref(false)
        const isAddChlPop = ref(false)
        let tmpExpendedRows: ChannelGroupDto[] = []

        const closeChlGroupEditPop = () => {
            isEditPop.value = false
        }

        const closeChlGroupAddChlPop = (isRefresh = false) => {
            isAddChlPop.value = false
            if (isRefresh) {
                handleExpandChange(editItemForAddChl.value!, tmpExpendedRows)
            }
        }

        const setDataCallBack = (rowData: ChannelGroupDto) => {
            editItem.value!.name = rowData.name
            editItem.value!.dwellTime = rowData.dwellTime
        }

        const handleToolBarEvent = (toolBarEvent: ConfigToolBarEvent<SearchToolBarEvent>) => {
            switch (toolBarEvent.type) {
                case 'addChlGroup':
                    router.push('add')
                    break
            }
        }

        const formatDwellTime = (value: number) => {
            return Translate('IDCS_STAY_TIME_D').formatForLang(value + ' ', getTranslateForSecond(value))
        }

        const handleEditChlGroup = (rowData: ChannelGroupDto) => {
            editItem.value = rowData
            isEditPop.value = true
        }

        const handleDelChlGroup = (rowData: ChannelGroupDto) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_GROUP_S').formatForLang(getShortString(rowData.name, 10)),
            }).then(() => {
                const data = rawXml`
                    <condition>
                        <chlGroupIds type='list'>
                            <item id='${rowData.id}'></item>
                        </chlGroupIds>
                    </condition>
                `
                openLoading()
                delChlGroup(data).then((res) => {
                    closeLoading()
                    const $ = queryXml(res)
                    if ($('status').text() === 'success') {
                        openMessageBox({
                            type: 'success',
                            message: Translate('IDCS_DELETE_SUCCESS'),
                        }).then(() => {
                            pageIndex.value = 1
                            getData()
                        })
                    } else {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_DELETE_FAIL'),
                        })
                    }
                })
            })
        }

        const handleSizeChange = (val: number) => {
            pageSize.value = val
            getData()
        }

        const handleCurrentChange = (val: number) => {
            pageIndex.value = val
            getData()
        }

        const handleExpandChange = (row: ChannelGroupDto, expandedRows: ChannelGroupDto[]) => {
            if (expandedRows.includes(row)) {
                const data = rawXml`
                    <condition>
                        <chlGroupId>${row.id}</chlGroupId>
                    </condition>
                `
                openLoading()
                queryChlGroup(data).then((res) => {
                    closeLoading()
                    const $ = queryXml(res)
                    if ($('status').text() === 'success') {
                        const chlList: Record<string, string | boolean>[] = []
                        $('//content/chlList/item').forEach((ele) => {
                            chlList.push({
                                value: ele.attr('id'),
                                text: ele.text(),
                                showDelIcon: false,
                            })
                        })
                        row.chls = chlList
                        row.chlCount = chlList.length
                    }
                })
            }
            tmpExpendedRows = expandedRows
        }

        const getData = () => {
            const data = rawXml`
                <pageIndex>${pageIndex.value}</pageIndex>
                <pageSize>${pageSize.value}</pageSize>
                <requireField>
                    <name/>
                    <dwellTime/>
                    <chlCount/>
                </requireField>
            `
            openLoading()
            queryChlGroupList(data).then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    tableData.value = []
                    $('//content/item').forEach((ele) => {
                        const eleXml = queryXml(ele.element)
                        const newData = new ChannelGroupDto()
                        newData.id = ele.attr('id')
                        newData.name = eleXml('name').text()
                        newData.dwellTime = eleXml('dwellTime').text().num()
                        newData.chlCount = eleXml('chlCount').text().num()
                        tableData.value.push(newData)
                    })
                    pageTotal.value = $('content').attr('total').num()
                }
            })
        }

        const handleAddChl = (rowData: ChannelGroupDto) => {
            editItemForAddChl.value = rowData
            isAddChlPop.value = true
        }

        const handleDelChl = (rowData: ChannelGroupDto, chlId: string) => {
            if (rowData.chlCount <= 1) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_CHANNEL_GROUP_DELETE_CHANNEL_ERROR'),
                })
                return
            }
            const data = rawXml`
                <types>
                    <actionType>
                        <enum>add</enum>
                        <enum>remove</enum>
                    </actionType>
                </types>
                <content>
                    <chlGroup>
                        <action type='actionType'>remove</action>
                        <id>${rowData.id}</id>
                        <chls type='list'>
                            <item id='${chlId}'></item>
                        </chls>
                    </chlGroup>
                </content>
            `
            openLoading()
            editSetAndElementRelation(data).then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    openMessageBox({
                        type: 'success',
                        message: Translate('IDCS_DELETE_SUCCESS'),
                    }).then(() => {
                        rowData.chls = rowData.chls.filter((item) => item.value !== chlId)
                        rowData.chlCount = rowData.chls.length
                    })
                } else {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_DELETE_FAIL'),
                    })
                }
            })
        }

        onMounted(() => {
            getData()
        })

        ctx.expose({
            handleToolBarEvent,
        })

        return {
            tableData,
            pageIndex,
            pageSize,
            pageTotal,
            editItem,
            editItemForAddChl,
            isEditPop,
            isAddChlPop,
            closeChlGroupEditPop,
            closeChlGroupAddChlPop,
            setDataCallBack,
            formatDwellTime,
            handleEditChlGroup,
            handleDelChlGroup,
            handleSizeChange,
            handleCurrentChange,
            handleExpandChange,
            handleAddChl,
            handleDelChl,
            ChannelGroupEditPop,
            ChannelGroupAddChlPop,
            ChannelPtzTableExpandPanel,
            ChannelPtzTableExpandItem,
        }
    },
})
