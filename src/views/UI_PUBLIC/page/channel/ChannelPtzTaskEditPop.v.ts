/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-22 15:16:17
 * @Description: 云台-任务-编辑弹窗
 */
import { type ChannelPtzTaskDto, ChannelPtzTaskForm } from '@/types/apiType/channel'
import { type FormInstance, type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 通道ID
         */
        chlId: {
            type: String,
            required: true,
        },
        /**
         * @property 编辑的任务数据
         */
        data: {
            type: Object as PropType<ChannelPtzTaskDto>,
            required: true,
        },
    },
    emits: {
        confirm(data: ChannelPtzTaskForm) {
            return !!data
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        // 默认名称与显示文本的映射
        const NAME_TRANS_MAPPING: Record<string, string> = {
            No: Translate('IDCS_NO'),
            'Random Scanning': Translate('IDCS_RANDOM_SCANNING'),
            'Boundary Scanning': Translate('IDCS_BOUNDARY_SCANNING'),
        }

        const pageData = ref({
            // 功能选项
            typeOptions: [
                {
                    label: Translate('IDCS_NO'),
                    value: 'NON',
                },
                {
                    label: Translate('IDCS_PRESET'),
                    value: 'PRE',
                },
                {
                    label: Translate('IDCS_CRUISE'),
                    value: 'CRU',
                },
                {
                    label: Translate('IDCS_PTZ_TRACE'),
                    value: 'TRA',
                },
                {
                    label: Translate('IDCS_RANDOM_SCANNING'),
                    value: 'RSC',
                },
                {
                    label: Translate('IDCS_BOUNDARY_SCANNING'),
                    value: 'ASC',
                },
            ],
            // 名称选项
            nameOptions: [
                {
                    label: Translate('IDCS_NO'),
                    value: 'No',
                },
            ],
        })

        const formRef = ref<FormInstance>()
        const formData = ref(new ChannelPtzTaskForm())

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
            endTime: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (getSeconds(value) < getSeconds(formData.value.startTime)) {
                            callback(new Error(Translate('IDCS_END_TIME_GREATER_THAN_START')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 计算秒时间戳
         * @param {String} formatString HH:mm
         */
        const getSeconds = (formatString: string) => {
            const split = formatString.split(':')
            return Number(split[0]) * 3600 + Number(split[1]) * 60
        }

        /**
         * @description 获取预置点列表
         * @param {String} chlId
         */
        const getPresetNameList = async (chlId: string) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryChlPresetList(sendXml)
            const $ = queryXml(result)

            pageData.value.nameOptions = $('//content/presets/item').map((item) => {
                return {
                    value: item.attr('index')!,
                    label: item.text(),
                }
            })
        }

        /**
         * @description 获取巡航线列表
         * @param {string} chlId
         */
        const getCruiseNameList = async (chlId: string) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryChlCruiseList(sendXml)
            const $ = queryXml(result)
            pageData.value.nameOptions = $('//content/cruises/item').map((item) => {
                return {
                    value: item.attr('index')!,
                    label: item.text(),
                }
            })
        }

        /**
         * @description 获取轨迹列表
         * @param {string} chlId
         */
        const getTraceNameList = async (chlId: string) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryLocalChlPtzTraceList(sendXml)
            const $ = queryXml(result)
            pageData.value.nameOptions = $('//content/traces/item').map((item) => {
                return {
                    value: item.attr('index')!,
                    label: item.text(),
                }
            })
        }

        /**
         * @description 获取名称选项
         */
        const getName = async () => {
            const chlId = prop.chlId

            if (formData.value.type === 'NON') {
                pageData.value.nameOptions = [
                    {
                        label: NAME_TRANS_MAPPING.NO,
                        value: 'NO',
                    },
                ]
            } else if (formData.value.type === 'PRE') {
                await getPresetNameList(chlId)
            } else if (formData.value.type === 'CRU') {
                await getCruiseNameList(chlId)
            } else if (formData.value.type === 'TRA') {
                await getTraceNameList(chlId)
            } else if (formData.value.type === 'RSC') {
                pageData.value.nameOptions = [
                    {
                        label: NAME_TRANS_MAPPING['Random Scanning'],
                        value: 'Random Scanning',
                    },
                ]
            } else if (formData.value.type === 'ASC') {
                pageData.value.nameOptions = [
                    {
                        label: NAME_TRANS_MAPPING['Boundary Scanning'],
                        value: 'Boundary Scanning',
                    },
                ]
            }

            if (pageData.value.nameOptions.length) {
                formData.value.name = pageData.value.nameOptions[0].value
            }
        }

        /**
         * @description 修改功能选项
         */
        const changeType = () => {
            formData.value.name = ''
            getName()
        }

        /**
         * @description 验证表单
         */
        const verify = () => {
            formRef.value?.validate((valid) => {
                if (valid) {
                    ctx.emit('confirm', formData.value)
                }
            })
        }

        /**
         * @description 打开弹窗时重置表单
         */
        const open = async () => {
            formRef.value?.clearValidate()
            formData.value.startTime = prop.data.startTime
            formData.value.endTime = prop.data.endTime
            formData.value.type = prop.data.type
            await getName()
            formData.value.name = prop.data.name
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        return {
            formRef,
            formRule,
            formData,
            pageData,
            changeType,
            verify,
            open,
            close,
        }
    },
})
