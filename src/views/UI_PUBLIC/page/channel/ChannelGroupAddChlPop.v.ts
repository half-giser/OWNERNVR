import { ChannelInfoDto, type ChlGroup } from '@/types/apiType/channel'
import { cloneDeep } from 'lodash-es'

/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-18 18:07:21
 * @Description:
 */
export default defineComponent({
    props: {
        popVisiable: Boolean,
        editItem: {
            type: Object as PropType<ChlGroup>,
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
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const { openMessageTipBox } = useMessageBox()

        let tmpEditItem: ChlGroup
        const tableRef = ref()
        const tableData = ref<ChannelInfoDto[]>([])
        const baseLivePopRef = ref()
        const selNum = ref(0)
        const total = ref(0)

        const handleRowClick = function (rowData: ChannelInfoDto) {
            tableRef.value.clearSelection()
            tableRef.value.toggleRowSelection(rowData, true)
        }

        const handleSelectionChange = () => {
            selNum.value = tableRef.value.getSelectionRows().length
        }

        const handlePreview = (rowData: ChannelInfoDto) => {
            baseLivePopRef.value.openLiveWin(rowData.id, rowData.name, rowData.chlIndex, rowData.chlType)
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
            openLoading(LoadingTarget.FullScreen)
            queryDevList(getXmlWrapData(data)).then((res) => {
                closeLoading(LoadingTarget.FullScreen)
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    const chlList: ChannelInfoDto[] = []
                    const addedChlList: string[] = tmpEditItem.chls.map((ele: Record<string, string | boolean>) => {
                        return ele['value'] as string
                    })
                    $('//content/item').forEach((ele) => {
                        const eleXml = queryXml(ele.element)
                        const id = ele.attr('id')!
                        if (!addedChlList.includes(id)) {
                            const newData = new ChannelInfoDto()
                            newData.id = id
                            newData.chlIndex = eleXml('chlIndex').text()
                            newData.chlType = eleXml('chlType').text()
                            newData.name = eleXml('name').text()
                            newData.ip = eleXml('ip').text()
                            newData.addType = eleXml('addType').text()
                            chlList.push(newData)
                        }
                    })
                    tableData.value = chlList
                    total.value = chlList.length
                }
            })
        }

        const verification = () => {
            if (!selNum.value) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_CHANNEL_GROUP_EMPTY'),
                })
                return false
            }
            return true
        }

        const save = () => {
            if (!verification()) return
            let data = rawXml`
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
                        <chls type='list'>`
            tableRef.value.getSelectionRows().forEach((ele: ChannelInfoDto) => {
                data += `<item id='${ele.id}'></item>`
            })
            data += rawXml`
                        </chls>
                    </chlGroup>
                </content>`
            openLoading(LoadingTarget.FullScreen)
            editSetAndElementRelation(getXmlWrapData(data)).then((res) => {
                closeLoading(LoadingTarget.FullScreen)
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    tableRef.value.getSelectionRows().forEach((ele: ChannelInfoDto) => {
                        tmpEditItem.chls.push({
                            value: ele.id,
                            text: ele.name,
                            showDelIcon: false,
                        })
                    })
                    emit('close', true)
                } else {
                    const errorCdoe = $('errorCode').text()
                    if (Number(errorCdoe) == errorCodeMap.outOfRange) {
                        openMessageTipBox({
                            type: 'info',
                            message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                        })
                    } else {
                        openMessageTipBox({
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
            total,
            baseLivePopRef,
            opened,
            handleRowClick,
            handleSelectionChange,
            handlePreview,
            save,
        }
    },
})
