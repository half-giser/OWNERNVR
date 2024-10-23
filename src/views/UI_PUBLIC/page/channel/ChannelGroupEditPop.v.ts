/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-18 14:20:56
 * @Description: 通道组 - 编辑弹窗
 */

import { ChlGroup } from '@/types/apiType/channel'
import { cloneDeep } from 'lodash-es'
import { type FormRules, type FormInstance } from 'element-plus'

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
        const { openLoading, closeLoading } = useLoading()
        const { openMessageTipBox } = useMessageBox()
        const formRef = ref<FormInstance>()
        const formData = ref(new ChlGroup())
        const timeList = [5, 10, 20, 30, 60, 120, 300, 600]

        const rules = ref<FormRules>({
            name: [
                {
                    validator: (_rule, value, callback) => {
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
            const data = rawXml`
                <content>
                    <id>${formData.value.id}</id>
                    <name><![CDATA[${formData.value.name}]]></name>
                    <dwellTime unit='s'>${formData.value.dwellTime.toString()}</dwellTime>
                </content>`
            openLoading()
            editChlGroup(data).then((res) => {
                closeLoading()
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
                    if (Number($('errorCode').text()) == ErrorCode.USER_ERROR_NAME_EXISTED) {
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
            getTranslateForSecond,
        }
    },
})
