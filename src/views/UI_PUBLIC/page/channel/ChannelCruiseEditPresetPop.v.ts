/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-21 17:52:33
 * @Description: 云台-巡航线-新增/编辑预置点弹窗
 */
import type { FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property {Enum} 新增或编辑 add | edit
         */
        type: {
            type: String,
            default: 'add',
        },
        /**
         * @property {string} 通道ID
         */
        chlId: {
            type: String,
            required: true,
        },
        /**
         * @property {Object} 预置点数据（编辑时候传值）
         */
        data: {
            type: Object as PropType<ChannelPtzCruisePresetDto>,
            default: () => new ChannelPtzCruisePresetDto(),
        },
    },
    emits: {
        close() {
            return true
        },
        confirm(data: ChannelPtzCruisePresetDto) {
            return !!data
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
            // 持续时间选项
            timeOptions: [5, 10, 15, 20, 25, 30, 60, 120, 180].map((value) => {
                return {
                    label: getTranslateForSecond(value),
                    value,
                }
            }),
            // 速度选项
            speedOptions: arrayToOptions([1, 2, 3, 4, 5, 6, 7, 8]),
            // 预置点选项
            nameOptions: [] as SelectOption<number, string>[],
        })

        const formRef = useFormRef()
        const formData = ref(new ChannelPtzCruisePresetForm())
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
         * @description 打开弹窗时重置表单
         */
        const open = () => {
            getList()

            if (prop.type === 'add') {
                formData.value = new ChannelPtzCruisePresetForm()
            } else {
                formData.value.name = prop.data.name
                formData.value.holdTime = prop.data.holdTime
                formData.value.speed = prop.data.speed
            }
        }

        /**
         * @description 获取预置点列表数据
         */
        const getList = async () => {
            pageData.value.nameOptions = []
            const sendXml = rawXml`
                <condition>
                    <chlId>${prop.chlId}</chlId>
                </condition>
            `
            const result = await queryChlPresetList(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                // NTA1-1850 预置点按顺序显示
                pageData.value.nameOptions = $('content/presets/item')
                    .map((item) => {
                        return {
                            value: item.attr('index').num(),
                            label: item.text(),
                        }
                    })
                    .sort((a, b) => {
                        return (a.value = b.value)
                    })
                if (pageData.value.nameOptions.length && prop.type === 'add') {
                    formData.value.name = pageData.value.nameOptions[0].label
                }
            }
        }

        /**
         * @description 确认数据
         */
        const confirm = () => {
            const data = {
                ...formData.value,
                index: pageData.value.nameOptions.find((item) => item.label === formData.value.name)!.value || 1,
                id: prop.data.id,
            }
            ctx.emit('confirm', data)
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        return {
            pageData,
            formRef,
            formData,
            formRule,
            open,
            confirm,
            close,
        }
    },
})
