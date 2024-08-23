import { ChlGroup } from '@/types/apiType/channel'
import { cloneDeep } from 'lodash-es'
import { type RuleItem } from 'async-validator'

/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-18 14:20:56
 * @Description:
 */
export default defineComponent({
    props: {
        editItem: {
            type: Object as PropType<ChlGroup>,
            required: true,
        },
    },
    emits: {
        close() {
            return true
        },
        callBack(data: ChlGroup) {
            return !!data
        },
    },
    setup(props, { emit }) {
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

        const validate: Record<string, RuleItem['validator']> = {
            validateName: (_rule, value, callback) => {
                value = value.trim()
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
            const data = rawXml`
                <content>
                    <id>${formData.value.id}</id>
                    <name><![CDATA[${formData.value.name}]]></name>
                    <dwellTime unit='s'>${formData.value.dwellTime.toString()}</dwellTime>
                </content>`
            openLoading(LoadingTarget.FullScreen)
            editChlGroup(getXmlWrapData(data)).then((res) => {
                closeLoading(LoadingTarget.FullScreen)
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    openMessageTipBox({
                        type: 'success',
                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                    }).then(() => {
                        emit('callBack', formData.value)
                        emit('close')
                    })
                } else {
                    if (Number($('errorCode').text()) == errorCodeMap.nameExist) {
                        openMessageTipBox({
                            type: 'info',
                            message: Translate('IDCS_PROMPT_CHANNEL_GROUP_NAME_EXIST'),
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
            formRef,
            formData,
            timeList,
            rules,
            opened,
            save,
        }
    },
})
