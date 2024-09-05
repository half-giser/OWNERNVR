/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-21 10:40:04
 * @Description: 新增轨迹弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-22 16:48:30
 */
import { type ChannelPtzTraceDto } from '@/types/apiType/channel'
import type { FormInstance, FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property {Number} 最大轨迹数
         */
        max: {
            type: Number,
            default: 128,
        },
        /**
         * @property {Array} 轨迹列表
         */
        trace: {
            type: Array as PropType<ChannelPtzTraceDto[]>,
            required: true,
        },
        /**
         * @property {String} 通道ID
         */
        chlId: {
            type: String,
            required: true,
        },
    },
    emits: {
        confirm() {
            return true
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const formRef = ref<FormInstance>()
        const formData = ref({
            name: '',
        })
        const formRule = ref<FormRules>({
            name: [
                {
                    validator(rule, value: string, callback) {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                            return
                        }
                        if (prop.trace.map((item) => item.name).includes(value.trim())) {
                            callback(new Error(Translate('IDCS_PROMPT_CUSTOME_VIEW_NAME_EXIST')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 打开弹窗时，重置表单和选项数据
         */
        const open = () => {
            formRef.value?.clearValidate()
            formRef.value?.resetFields()

            const traceIndex = prop.trace.map((item) => item.index)
            const traceOptions = Array(prop.max)
                .fill(0)
                .map((item, index) => {
                    return index + 1
                })
                .filter((item) => {
                    return !traceIndex.includes(item)
                })
            if (traceOptions.length) {
                formData.value.name = 'trace' + traceOptions[0]
            } else {
                formData.value.name = ''
            }
        }

        /**
         * @description 新增轨迹保存数据
         */
        const setData = async () => {
            openLoading(LoadingTarget.FullScreen)

            const sendXml = rawXml`
                <content>
                    <name>${wrapCDATA(formData.value.name)}</name>
                    <chlId id="${prop.chlId}"></chlId>
                    <index>1</index>
                </content>
            `
            const result = await createChlPtzTrace(sendXml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('//status').text() === 'success') {
                openMessageTipBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).finally(() => {
                    ctx.emit('confirm')
                })
            } else {
                const errorCode = Number($('//errorCode').text())
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_NAME_EXISTED:
                        errorInfo = Translate('IDCS_PROMPT_CRUISE_NAME_EXIST')
                        break
                    default:
                        errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                        break
                }
                openMessageTipBox({
                    type: 'info',
                    message: errorInfo,
                })
            }
        }

        /**
         * @description 验证表单
         */
        const verify = () => {
            formRef.value?.validate((valid) => {
                if (valid) {
                    setData()
                }
            })
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        return {
            formRef,
            formData,
            formRule,
            open,
            verify,
            close,
            nameByteMaxLen,
            formatInputMaxLength,
        }
    },
})
