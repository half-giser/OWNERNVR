/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 18:26:39
 * @Description: 新增预置点弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-09 15:38:13
 */
import { type ChannelPtzPresetDto } from '@/types/apiType/channel'
import type { FormInstance, FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property {Number} 最大预置点数
         */
        max: {
            type: Number,
            default: 128,
        },
        /**
         * @property {Array} 预置点列表
         */
        presets: {
            type: Array as PropType<ChannelPtzPresetDto[]>,
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
        const { openLoading, closeLoading } = useLoading()

        const pageData = ref({
            // 预置点选项
            presetOptions: [] as number[],
        })

        const formRef = ref<FormInstance>()
        const formData = ref({
            index: 0 as number | string,
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
                        if (prop.presets.map((item) => item.name).includes(value.trim())) {
                            callback(new Error(Translate('IDCS_PROMPT_PRESET_NAME_OR_INDEX_EXIST')))
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

            const presetsIndex = prop.presets.map((item) => item.index)
            pageData.value.presetOptions = Array(prop.max)
                .fill(0)
                .map((item, index) => {
                    return index + 1
                })
                .filter((item) => {
                    return !presetsIndex.includes(item)
                })
            if (pageData.value.presetOptions.length) {
                formData.value.index = pageData.value.presetOptions[0]
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
                    <index>${formData.value.index.toString()}</index>
                    <name>${wrapCDATA(formData.value.name)}</name>
                    <chlId>${prop.chlId}</chlId>
                </content>
            `
            const result = await createChlPreset(sendXml)
            const $ = queryXml(result)

            closeLoading()

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
                        errorInfo = Translate('IDCS_PROMPT_PRESET_NAME_OR_INDEX_EXIST')
                        break
                    case ErrorCode.USER_ERROR_OVER_LIMIT:
                        errorInfo = Translate('IDCS_PRESET_MAX_NUM')
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_NO_PERMISSION')
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
            pageData,
            open,
            verify,
            close,
            nameByteMaxLen,
            formatInputMaxLength,
        }
    },
})
