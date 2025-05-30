/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 18:26:39
 * @Description: 新增预置点弹窗
 */
import type { FormRules } from 'element-plus'

export default defineComponent({
    props: {
        data: {
            type: Object as PropType<ChannelPtzPresetChlDto>,
            default: () => new ChannelPtzPresetChlDto(),
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

        const pageData = ref({
            // 预置点选项
            presetOptions: [] as SelectOption<number, number>[],
        })

        const formRef = useFormRef()
        const formData = ref({
            index: 0 as number | string,
            name: '',
        })
        const formRule = ref<FormRules>({
            name: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                            return
                        }

                        if (prop.data.presets.map((item) => item.name).includes(value.trim())) {
                            callback(new Error(Translate('IDCS_PROMPT_PRESET_NAME_OR_INDEX_EXIST')))
                            return
                        }

                        if (!checkPresetName(value)) {
                            callback(new Error(Translate('IDCS_CAN_NOT_CONTAIN_SPECIAL_CHAR').formatForLang(PRESET_LIMIT_CHAR)))
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
            const presetsIndex = prop.data.presets.map((item) => item.index)
            pageData.value.presetOptions = arrayToOptions(
                Array(prop.data.maxCount)
                    .fill(0)
                    .map((_, index) => {
                        return index + 1
                    })
                    .filter((item) => {
                        return !presetsIndex.includes(item)
                    }),
            )
            if (pageData.value.presetOptions.length) {
                formData.value.index = pageData.value.presetOptions[0].value
                formData.value.name = 'preset' + formData.value.index
            } else {
                formData.value.index = ''
                formData.value.name = ''
            }
        }

        /**
         * @description 新增预置点保存数据
         */
        const setData = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <index>${formData.value.index}</index>
                    <name>${wrapCDATA(formData.value.name)}</name>
                    <chlId>${prop.data.chlId}</chlId>
                </content>
            `
            const result = await createChlPreset(sendXml)
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
                        errorInfo = Translate('IDCS_PROMPT_PRESET_NAME_OR_INDEX_EXIST')
                        break
                    case ErrorCode.USER_ERROR_OVER_LIMIT:
                        errorInfo = Translate('IDCS_PRESET_MAX_NUM').formatForLang(prop.data.maxCount)
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_NO_PERMISSION')
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
            pageData,
            open,
            verify,
            close,
        }
    },
})
