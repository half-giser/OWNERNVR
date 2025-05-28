/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-22 15:16:17
 * @Description: 云台-任务-编辑弹窗
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 编辑的任务数据
         */
        data: {
            type: Object as PropType<ChannelPtzTaskDto>,
            required: true,
        },
        row: {
            type: Object as PropType<ChannelPtzTaskChlDto>,
            default: new ChannelPtzTaskChlDto(),
        },
    },
    emits: {
        confirm(data: ChannelPtzTaskDto) {
            return !!data
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

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
        })

        const formRef = useFormRef()
        const formData = ref(new ChannelPtzTaskDto())

        const formRule = ref<FormRules>({
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

        const nameOption = computed(() => {
            switch (formData.value.type) {
                case 'PRE':
                    return prop.row.presetList
                case 'CRU':
                    return prop.row.cruiseList
                case 'TRA':
                    return prop.row.traceList
                case 'RSC':
                    return [
                        {
                            value: 0,
                            label: 'Random Scanning',
                        },
                    ]
                case 'ASC':
                    return [
                        {
                            value: 0,
                            label: 'Boundary Scanning',
                        },
                    ]
                default:
                    return []
            }
        })

        const getNumber = () => {
            switch (formData.value.type) {
                case 'PRE':
                    return prop.row.preMin
                case 'CRU':
                    return prop.row.cruMin
                case 'TRA':
                    return prop.row.traMin
                case 'RSC':
                    return 0
                case 'ASC':
                    return 0
                default:
                    return 0
            }
        }

        /**
         * @description 修改功能选项
         */
        const changeType = () => {
            getNumber()
        }

        /**
         * @description 验证表单
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    ctx.emit('confirm', formData.value)
                }
            })
        }

        /**
         * @description 打开弹窗时重置表单
         */
        const open = async () => {
            formData.value.startTime = prop.data.startTime
            formData.value.endTime = prop.data.endTime
            formData.value.type = prop.data.type
            formData.value.editIndex = prop.data.editIndex
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
            nameOption,
        }
    },
})
