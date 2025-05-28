/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-18 14:20:56
 * @Description: 通道组 - 编辑弹窗
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        editItem: {
            type: Object as PropType<ChannelGroupDto>,
            required: true,
        },
        dwellTimeList: {
            type: Array as PropType<number[]>,
            default: () => [5, 10, 20, 30, 60, 120, 300, 600],
        },
    },
    emits: {
        close() {
            return true
        },
        callBack(data: ChannelGroupDto) {
            return !!data
        },
    },
    setup(props, { emit }) {
        const { Translate } = useLangStore()

        const formRef = useFormRef()
        const formData = ref(new ChannelGroupDto())
        // const timeList = [5, 10, 20, 30, 60, 120, 300, 600].map((value) => {
        //     return {
        //         label: value + Translate('IDCS_SECONDS'),
        //         value,
        //     }
        // })

        const timeList = ref<SelectOption<number, string>[]>([])

        const rules = ref<FormRules>({
            name: [
                {
                    validator: (_rule, value: string, callback) => {
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

        const opened = () => {
            formData.value = cloneDeep(props.editItem)
            const dwellTimeList = props.dwellTimeList
            if (!dwellTimeList.includes(formData.value.dwellTime)) {
                dwellTimeList.push(formData.value.dwellTime)
            }
            timeList.value = dwellTimeList
                .sort((a, b) => a - b)
                .map((item) => {
                    return {
                        label: item + Translate('IDCS_SECONDS'),
                        value: item,
                    }
                })
        }

        const verification = async () => {
            if (!formRef) return false
            return await formRef.value!.validate()
        }

        const save = async () => {
            if (!(await verification())) return
            const sendXml = rawXml`
                <content>
                    <id>${formData.value.id}</id>
                    <name maxByteLen="63">${wrapCDATA(formData.value.name)}</name>
                    <dwellTime unit='s'>${formData.value.dwellTime}</dwellTime>
                </content>`
            openLoading()
            editChlGroup(sendXml).then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    openMessageBox({
                        type: 'success',
                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                    }).then(() => {
                        emit('callBack', formData.value)
                        emit('close')
                    })
                } else {
                    if ($('errorCode').text().num() === ErrorCode.USER_ERROR_NAME_EXISTED) {
                        openMessageBox(Translate('IDCS_PROMPT_CHANNEL_GROUP_NAME_EXIST'))
                    } else {
                        openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
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
