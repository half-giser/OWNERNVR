/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-17 21:17:45
 * @Description:
 */
import { ChlGroup } from '@/types/apiType/channel'
import { DefaultPagerSizeOptions, DefaultPagerLayout } from '@/utils/constants'
import ChannelGroupEditPop from './ChannelGroupEditPop.vue'
import ChannelGroupAddChlPop from './ChannelGroupAddChlPop.vue'

export default defineComponent({
    components: {
        ChannelGroupEditPop,
        ChannelGroupAddChlPop,
    },
    setup() {
        const router = useRouter()
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageTipBox } = useMessageBox()

        const tableData = ref<ChlGroup[]>()
        const pageIndex = ref(1)
        const pageSize = ref(10)
        const pageTotal = ref(0)
        const editItem = ref(new ChlGroup())
        const editItemForAddChl = ref(new ChlGroup())
        const chlGroupEditPopVisiable = ref(false)
        const chlGroupAddChlPopVisiable = ref(false)
        let tmpExpendedRows: ChlGroup[] = []

        const closeChlGroupEditPop = () => {
            chlGroupEditPopVisiable.value = false
        }

        const closeChlGroupAddChlPop = (isRefresh = false) => {
            chlGroupAddChlPopVisiable.value = false
            if (isRefresh) {
                handleExpandChange(editItemForAddChl.value!, tmpExpendedRows)
            }
        }

        const setDataCallBack = (rowData: ChlGroup) => {
            editItem.value!.name = rowData.name
            editItem.value!.dwellTime = rowData.dwellTime
        }

        const handleToolBarEvent = (toolBarEvent: ConfigToolBarEvent<ChannelToolBarEvent>) => {
            switch (toolBarEvent.type) {
                case 'addChlGroup':
                    router.push('add')
                    break
            }
        }

        const formatDwellTime = (value: number) => {
            if (value >= 60) {
                value = value / 60
                return Translate('IDCS_STAY_TIME_D').formatForLang(value + ' ', value === 1 ? Translate('IDCS_MINUTE') : Translate('IDCS_MINUTES'))
            } else {
                return Translate('IDCS_STAY_TIME_D').formatForLang(value + ' ', Translate('IDCS_SECONDS'))
            }
        }

        const handleEditChlGroup = (rowData: ChlGroup) => {
            editItem.value = rowData
            chlGroupEditPopVisiable.value = true
        }

        const handleDelChlGroup = (rowData: ChlGroup) => {
            openMessageTipBox({
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
                    if ($('status').text() == 'success') {
                        openMessageTipBox({
                            type: 'success',
                            message: Translate('IDCS_DELETE_SUCCESS'),
                        }).then(() => {
                            pageIndex.value = 1
                            getData()
                        })
                    } else {
                        openMessageTipBox({
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

        const handleExpandChange = (row: ChlGroup, expandedRows: ChlGroup[]) => {
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
                    if ($('status').text() == 'success') {
                        const chlList: Record<string, string | boolean>[] = []
                        $('//content/chlList/item').forEach((ele) => {
                            chlList.push({
                                value: ele.attr('id')!,
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
                <pageIndex>${pageIndex.value.toString()}</pageIndex>
                <pageSize>${pageSize.value.toString()}</pageSize>
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
                if ($('status').text() == 'success') {
                    tableData.value = []
                    $('//content/item').forEach((ele) => {
                        const eleXml = queryXml(ele.element)
                        const newData = new ChlGroup()
                        newData.id = ele.attr('id')!
                        newData.name = eleXml('name').text()
                        newData.dwellTime = Number(eleXml('dwellTime').text())
                        newData.chlCount = Number(eleXml('chlCount').text())
                        tableData.value?.push(newData)
                    })
                    pageTotal.value = Number($('content').attr('total'))
                }
            })
        }

        const handleAddChl = (rowData: ChlGroup) => {
            editItemForAddChl.value = rowData
            chlGroupAddChlPopVisiable.value = true
        }
        const handleDelChl = (rowData: ChlGroup, chlId: string) => {
            if (rowData.chlCount <= 1) {
                openMessageTipBox({
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
                if ($('status').text() == 'success') {
                    openMessageTipBox({
                        type: 'success',
                        message: Translate('IDCS_DELETE_SUCCESS'),
                    }).then(() => {
                        rowData.chls = rowData.chls.filter((item) => item['value'] != chlId)
                        rowData.chlCount = rowData.chls.length
                    })
                } else {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_DELETE_FAIL'),
                    })
                }
            })
        }

        onMounted(() => {
            getData()
        })

        return {
            tableData,
            pageIndex,
            pageSize,
            pageTotal,
            editItem,
            editItemForAddChl,
            chlGroupEditPopVisiable,
            chlGroupAddChlPopVisiable,
            closeChlGroupEditPop,
            closeChlGroupAddChlPop,
            setDataCallBack,
            DefaultPagerSizeOptions,
            DefaultPagerLayout,
            handleToolBarEvent,
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
        }
    },
})
