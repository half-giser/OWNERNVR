/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-19 09:52:27
 * @Description:
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-26 18:26:55
 */
import { ChannelInfoDto, ChlGroup } from '@/types/apiType/channel'
import { trim } from 'lodash'
import BaseImgSprite from '../../components/sprite/BaseImgSprite.vue'
import BaseLivePop from '@/views/UI_PUBLIC/components/BaseLivePop.vue'

export default defineComponent({
    components: {
        BaseImgSprite,
        BaseLivePop,
    },
    props: {
        dialog: {
            type: Boolean,
            default: false,
            require: false,
        },
        close: Function,
        callBack: Function,
    },
    setup(prop) {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const { openMessageTipBox } = useMessageBox()
        const router = useRouter()

        const formRef = ref()
        const formData = ref(new ChlGroup())
        const tableRef = ref()
        const baseLivePopRef = ref()
        const tableData = ref<ChannelInfoDto[]>([])
        const selNum = ref(0)
        const total = ref(0)
        const timeList = [
            { text: '5 ' + Translate('IDCS_SECONDS'), value: 5 },
            { text: '10 ' + Translate('IDCS_SECONDS'), value: 10 },
            { text: '20 ' + Translate('IDCS_SECONDS'), value: 20 },
            { text: '30 ' + Translate('IDCS_SECONDS'), value: 30 },
            { text: '1 ' + Translate('IDCS_MINUTE'), value: 60 },
            { text: '2 ' + Translate('IDCS_MINUTES'), value: 120 },
            { text: '5 ' + Translate('IDCS_MINUTES'), value: 300 },
            { text: '10 ' + Translate('IDCS_MINUTES'), value: 600 },
        ]
        const chlGroupCountLimit = 16 // 通道组个数上限

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

        const validate = {
            validateName: (_rule: any, value: any, callback: any) => {
                value = trim(value)
                if (value.length === 0) {
                    callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                    return
                } else {
                    formData.value.name = value = cutStringByByte(value, nameByteMaxLen)
                    // 应该不可能发生此情况
                    if (value == 0) {
                        callback(new Error(Translate('IDCS_INVALID_CHAR')))
                        return
                    }
                }
                callback()
            },
        }

        const rules = ref({
            name: [{ validator: validate.validateName, trigger: 'manual' }],
        })

        const verification = async () => {
            if (!formRef) return false
            const valid = await formRef.value.validate()
            if (valid) {
                if (!selNum.value) {
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_PROMPT_CHANNEL_GROUP_EMPTY'),
                        showCancelButton: false,
                    })
                    return false
                }
                if (selNum.value > chlGroupCountLimit) {
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_CHL_GROUP_CHL_OVER_TIPS').formatForLang(chlGroupCountLimit),
                        showCancelButton: false,
                    })
                    return false
                }
            }
            return valid
        }

        const save = async () => {
            if (!(await verification())) return
            let data = `
                <content>
                    <name><![CDATA[${formData.value.name}]]></name>
                    <dwellTime unit='s'>${formData.value.dwellTime}</dwellTime>
                    <chlIdList type='list'>`
            tableRef.value.getSelectionRows().forEach((ele: ChannelInfoDto) => {
                data += `<item>${ele.id}</item>`
            })
            data += `
                    </chlIdList>
                </content>`
            openLoading(LoadingTarget.FullScreen)
            createChlGroup(getXmlWrapData(data)).then((res: any) => {
                closeLoading(LoadingTarget.FullScreen)
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    openMessageTipBox({
                        type: 'success',
                        title: Translate('IDCS_SUCCESS_TIP'),
                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                        showCancelButton: false,
                    }).then(() => {
                        if (prop.callBack) prop.callBack()
                        handleCancel()
                    })
                } else {
                    const errorCdoe = Number(res('errorCode').text())
                    let msg = Translate('IDCS_SAVE_DATA_FAIL')
                    if (errorCdoe == errorCodeMap.nameExist) {
                        msg = Translate('IDCS_PROMPT_CHANNEL_GROUP_NAME_EXIST')
                    } else if (errorCdoe == errorCodeMap.outOfRange) {
                        msg = Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT')
                    }
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: msg,
                        showCancelButton: false,
                    })
                }
            })
        }

        const handleCancel = () => {
            if (prop.dialog) {
                prop.close && prop.close()
            } else {
                router.push('list')
            }
        }

        const getData = () => {
            const data = `
                <requireField>
                    <name/>
                    <ip/>
                    <chlIndex/>
                    <chlType/>
                </requireField>`
            openLoading(LoadingTarget.FullScreen)
            queryDevList(getXmlWrapData(data)).then((res: any) => {
                closeLoading(LoadingTarget.FullScreen)
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    const chlList: ChannelInfoDto[] = []
                    res('//content/item').forEach((ele: any) => {
                        const eleXml = queryXml(ele.element)
                        const newData = new ChannelInfoDto()
                        newData.id = ele.attr('id')
                        newData.chlIndex = eleXml('chlIndex').text()
                        newData.chlType = eleXml('chlType').text()
                        newData.name = eleXml('name').text()
                        newData.ip = eleXml('ip').text()
                        newData.addType = eleXml('addType').text()
                        chlList.push(newData)
                    })
                    tableData.value = chlList
                    total.value = chlList.length
                }
            })
        }

        onMounted(() => {
            formData.value = new ChlGroup()
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
            total,
            baseLivePopRef,
            handleRowClick,
            handleSelectionChange,
            handlePreview,
            save,
            handleCancel,
        }
    },
})
