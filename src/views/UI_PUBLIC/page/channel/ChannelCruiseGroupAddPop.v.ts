/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-22 10:15:51
 * @Description: 巡航线组 新增巡航线弹窗
 */
import type { FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property {Number} 最大巡航线数
         */
        max: {
            type: Number,
            default: 8,
        },
        /**
         * @property {String} 通道ID
         */
        chlId: {
            type: String,
            required: true,
        },
        /**
         * @property {Array} 巡航线列表
         */
        cruise: {
            type: Array as PropType<ChannelPtzCruiseDto[]>,
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

        const pageData = ref({
            // 预置点选项
            cruiseOptions: [] as { value: string; label: string; number: number }[],
        })

        const formRef = useFormRef()
        const formData = ref({
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
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 获取巡航线列表
         */
        const getData = async () => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${prop.chlId}</chlId>
                </condition>
            `
            const result = await queryChlCruiseList(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                pageData.value.cruiseOptions = $('content/cruises/item').map((item) => {
                    return {
                        value: item.attr('index'),
                        label: item.text(),
                        number: item.attr('number').num(),
                    }
                })
                if (pageData.value.cruiseOptions.length) {
                    formData.value.name = pageData.value.cruiseOptions[0].value
                } else {
                    formData.value.name = ''
                }
            }
        }

        /**
         * @description 打开弹窗时，重置表单和选项数据
         */
        const open = () => {
            getData()
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 新增预置点保存数据
         */
        const setData = async () => {
            openLoading()

            const label = pageData.value.cruiseOptions.find((item) => item.value === formData.value.name)!.label

            let number = prop.cruise.length + 1
            const findIndex = prop.cruise.findIndex((item, index) => item.number !== index + 1)
            if (findIndex > 0) {
                number = findIndex + 1
            }

            const sendXml = rawXml`
                <content>
                    <chlId id="${prop.chlId}"></chlId>
                    <index>1</index>
                    <name>group1</name>
                    <cruises type="list">
                        ${prop.cruise
                            .map(
                                (item) => rawXml`
                                    <item index="${item.index}" number="${item.number}">
                                        <name>${wrapCDATA(item.name)}</name>
                                    </item>`,
                            )
                            .join('')}
                        <item index="${formData.value.name}" number="${number}">
                            <name>${wrapCDATA(label)}</name>
                        </item>
                    </cruises>
                </content>
            `
            const result = await editChlPtzGroup(sendXml, false)
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
                    case ErrorCode.USER_ERROR_OVER_LIMIT:
                        errorInfo = $('errorDescription').text() === 'Cruise' ? Translate('IDCS_CRUISE_MAX_NUM').formatForLang(prop.max) : Translate('IDCS_SAVE_DATA_FAIL')
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
