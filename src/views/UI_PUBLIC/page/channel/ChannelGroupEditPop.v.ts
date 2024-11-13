/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-18 14:20:56
 * @Description: 通道组 - 编辑弹窗
 */

import { ChannelGroupDto } from '@/types/apiType/channel'
import { cloneDeep } from 'lodash-es'
import { type FormRules, type FormInstance } from 'element-plus'

export default defineComponent({
    props: {
        editItem: {
            type: Object as PropType<ChannelGroupDto>,
            required: true,
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
        const { openLoading, closeLoading } = useLoading()
        const { openMessageBox } = useMessageBox()
        const formRef = ref<FormInstance>()
        const formData = ref(new ChannelGroupDto())
        const timeList = [5, 10, 20, 30, 60, 120, 300, 600]

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
            if (formRef.value) formRef.value.resetFields()
            formData.value = cloneDeep(props.editItem)
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
                if ($('status').text() == 'success') {
                    openMessageBox({
                        type: 'success',
                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                    }).then(() => {
                        emit('callBack', formData.value)
                        emit('close')
                    })
                } else {
                    if (Number($('errorCode').text()) == ErrorCode.USER_ERROR_NAME_EXISTED) {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_PROMPT_CHANNEL_GROUP_NAME_EXIST'),
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
            formRef,
            formData,
            timeList,
            rules,
            opened,
            save,
            getTranslateForSecond,
            formatInputMaxLength,
            nameByteMaxLen,
        }
    },
})
