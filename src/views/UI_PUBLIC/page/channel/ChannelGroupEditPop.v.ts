import { ChlGroup } from '@/types/apiType/channel'
import { trim, cloneDeep } from 'lodash'

/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-18 14:20:56
 * @Description:
 */
export default defineComponent({
    props: {
        editItem: ChlGroup,
        callBack: Function,
        close: {
            type: Function,
            require: true,
            default: () => {},
        },
    },
    setup(props: any) {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const { openMessageTipBox } = useMessageBox()
        const formRef = ref()
        const formData = ref(new ChlGroup())
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

        const opened = () => {
            if (formRef.value) formRef.value.resetFields()
            formData.value = cloneDeep(props.editItem)
        }

        const verification = async () => {
            if (!formRef) return false
            return await formRef.value.validate()
        }

        const save = async () => {
            if (!(await verification())) return
            const data = `
                <content>
                    <id>${formData.value.id}</id>
                    <name><![CDATA[${formData.value.name}]]></name>
                    <dwellTime unit='s'>${formData.value.dwellTime}</dwellTime>
                </content>`
            openLoading(LoadingTarget.FullScreen)
            editChlGroup(getXmlWrapData(data)).then((res: any) => {
                closeLoading(LoadingTarget.FullScreen)
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    openMessageTipBox({
                        type: 'success',
                        title: Translate('IDCS_SUCCESS_TIP'),
                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                        showCancelButton: false,
                    })
                        .then(() => {
                            if (props.callBack) props.callBack(formData.value)
                            props.close()
                        })
                        .catch(() => {})
                } else {
                    if (Number(res('errorCode').text()) == errorCodeMap.nameExist) {
                        openMessageTipBox({
                            type: 'info',
                            title: Translate('IDCS_INFO_TIP'),
                            message: Translate('IDCS_PROMPT_CHANNEL_GROUP_NAME_EXIST'),
                            showCancelButton: false,
                        })
                    } else {
                        openMessageTipBox({
                            type: 'info',
                            title: Translate('IDCS_INFO_TIP'),
                            message: Translate('IDCS_SAVE_DATA_FAIL'),
                            showCancelButton: false,
                        })
                    }
                }
            })
        }

        return {
            formRef,
            formData,
            timeList,
            rules,
            opened,
            save,
        }
    },
})
