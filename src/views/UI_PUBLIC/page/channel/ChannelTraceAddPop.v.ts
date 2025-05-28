/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-21 10:40:04
 * @Description: 新增轨迹弹窗
 */
import type { FormRules } from 'element-plus'

export default defineComponent({
    props: {
        data: {
            type: Object as PropType<ChannelPtzTraceChlDto>,
            default: new ChannelPtzTraceChlDto(),
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

        const formRef = useFormRef()
        const formData = ref({
            name: '',
            number: 0,
        })
        const formRule = ref<FormRules>({
            name: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                            return
                        }

                        if (prop.data.trace.map((item) => item.name).includes(value.trim())) {
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
            const traceIndex = prop.data.trace.map((item) => item.index)
            const traceOptions = Array(prop.data.maxCount)
                .fill(0)
                .map((_, index) => {
                    return index + 1
                })
                .filter((item) => {
                    return !traceIndex.includes(item)
                })

            if (traceOptions.length) {
                formData.value.number = traceOptions[0]
                formData.value.name = 'PATROL' + traceOptions[0]
            } else {
                formData.value.number = prop.data.maxCount + 1
                formData.value.name = 'PATROL' + (prop.data.maxCount + 1)
            }
        }

        /**
         * @description 新增轨迹保存数据
         */
        const setData = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <name>${wrapCDATA(formData.value.name)}</name>
                    <chlId id="${prop.data.chlId}"></chlId>
                    <index>${formData.value.number}</index>
                </content>
            `
            const result = await createChlPtzTrace(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).finally(() => {
                    ctx.emit('confirm')
                })
            } else {
                const errorCode = $('errorCode').text().num()
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_NAME_EXISTED:
                        errorInfo = Translate('IDCS_PROMPT_CRUISE_NAME_EXIST')
                        break
                    default:
                        errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                        break
                }
                openMessageBox(errorInfo)
            }
        }

        /**
         * @description 验证表单
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
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
        }
    },
})
