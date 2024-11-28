/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-19 09:52:27
 * @Description: 新增通道组
 */
import { ChannelInfoDto, ChannelGroupDto } from '@/types/apiType/channel'
import type { TableInstance, FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 是否内嵌在弹窗内
         */
        dialog: {
            type: Boolean,
            default: false,
        },
    },
    emits: {
        close() {
            return true
        },
        callBack() {
            return true
        },
    },
    setup(prop, { emit }) {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageBox } = useMessageBox()
        const router = useRouter()

        const formRef = useFormRef()
        const formData = ref(new ChannelGroupDto())
        const tableRef = ref<TableInstance>()
        const baseLivePopRef = ref<LivePopInstance>()
        const tableData = ref<ChannelInfoDto[]>([])
        const selNum = ref(0)
        const timeList = [5, 10, 20, 30, 60, 120, 300, 600].map((value) => {
            return {
                label: getTranslateForSecond(value),
                value,
            }
        })
        const chlGroupCountLimit = 16 // 通道组个数上限

        const handleRowClick = (rowData: ChannelInfoDto) => {
            tableRef.value!.clearSelection()
            tableRef.value!.toggleRowSelection(rowData, true)
        }

        const handleSelectionChange = () => {
            selNum.value = tableRef.value!.getSelectionRows().length
        }

        const handlePreview = (rowData: ChannelInfoDto) => {
            baseLivePopRef.value?.openLiveWin(rowData.id, rowData.name)
        }

        const rules = ref<FormRules>({
            name: [
                {
                    validator: (_rule, value, callback) => {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                            return
                        }

                        if (!cutStringByByte(value, nameByteMaxLen)) {
                            callback(new Error(Translate('IDCS_INVALID_CHAR')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const verification = async () => {
            if (!formRef) return false
            const valid = await formRef.value!.validate()
            if (valid) {
                if (!selNum.value) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_PROMPT_CHANNEL_GROUP_EMPTY'),
                    })
                    return false
                }

                if (selNum.value > chlGroupCountLimit) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_CHL_GROUP_CHL_OVER_TIPS').formatForLang(chlGroupCountLimit),
                    })
                    return false
                }
            }
            return valid
        }

        const save = async () => {
            if (!(await verification())) return
            const selection = tableRef.value!.getSelectionRows() as ChannelInfoDto[]
            const sendXml = rawXml`
                <content>
                    <name><![CDATA[${formData.value.name}]]></name>
                    <dwellTime unit='s'>${formData.value.dwellTime}</dwellTime>
                    <chlIdList type='list'>
                        ${selection.map((ele) => `<item>${ele.id}</item>`).join('')}
                    </chlIdList>
                </content>
            `
            openLoading()
            createChlGroup(sendXml).then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    openMessageBox({
                        type: 'success',
                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                    }).then(() => {
                        emit('callBack')
                        handleCancel()
                    })
                } else {
                    const errorCdoe = $('errorCode').text().num()
                    let msg = Translate('IDCS_SAVE_DATA_FAIL')
                    if (errorCdoe === ErrorCode.USER_ERROR_NAME_EXISTED) {
                        msg = Translate('IDCS_PROMPT_CHANNEL_GROUP_NAME_EXIST')
                    } else if (errorCdoe === ErrorCode.USER_ERROR_OVER_LIMIT) {
                        msg = Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT')
                    }
                    openMessageBox({
                        type: 'info',
                        message: msg,
                    })
                }
            })
        }

        const handleCancel = () => {
            if (prop.dialog) {
                emit('close')
            } else {
                router.push('list')
            }
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
                    tableData.value = $('content/item').map((ele) => {
                        const $item = queryXml(ele.element)
                        const newData = new ChannelInfoDto()
                        newData.id = ele.attr('id')
                        newData.chlIndex = $item('chlIndex').text()
                        newData.chlType = $item('chlType').text()
                        newData.name = $item('name').text()
                        newData.ip = $item('ip').text()
                        newData.addType = $item('addType').text()
                        return newData
                    })
                }
            })
        }

        onMounted(() => {
            formData.value = new ChannelGroupDto()
            formData.value.dwellTime = 60
            getData()
        })

        return {
            formRef,
            formData,
            timeList,
            rules,
            tableRef,
            tableData,
            selNum,
            baseLivePopRef,
            handleRowClick,
            handleSelectionChange,
            handlePreview,
            save,
            handleCancel,
            chlGroupCountLimit,
            formatInputMaxLength,
        }
    },
})
