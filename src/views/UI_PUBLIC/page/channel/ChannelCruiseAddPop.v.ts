/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-21 17:51:18
 * @Description: 云台-巡航线-新增弹窗
 */
import type { FormRules, TableInstance } from 'element-plus'
import ChannelCruiseEditPresetPop from './ChannelCruiseEditPresetPop.vue'

export default defineComponent({
    components: {
        ChannelCruiseEditPresetPop,
    },
    props: {
        data: {
            type: Object as PropType<ChannelPtzCruiseChlDto>,
            default: () => new ChannelPtzCruiseChlDto(),
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

        let presetId = 0

        const pageData = ref({
            // 是否显示预置点弹窗
            isPresetPop: false,
            // 预置点索引
            presetIndex: 0,
            // 'add' | 'edit'
            presetType: 'add',
        })

        const formRef = useFormRef()
        const formData = ref({
            name: '',
        })

        const formRule = ref<FormRules>({
            name: [
                {
                    validator: (_, value: string, callback) => {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                            return
                        }

                        if (prop.data.cruise.map((item) => item.name).includes(value.trim())) {
                            callback(new Error(Translate('IDCS_PROMPT_CRUISE_NAME_EXIST')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzCruisePresetDto[]>([])

        /**
         * @description 打开弹窗时，重置表单和选项数据
         */
        const open = () => {
            const cruiseIndex = prop.data.cruise.map((item) => item.index)
            const cruiseOptions = Array(prop.data.maxCount)
                .fill(0)
                .map((_, index) => {
                    return index + 1
                })
                .filter((item) => {
                    return !cruiseIndex.includes(item)
                })
            if (cruiseOptions.length) {
                formData.value.name = 'cruise' + cruiseOptions[0]
            } else {
                formData.value.name = ''
            }
        }

        const reset = () => {
            tableData.value = []
            formRef.value!.resetFields()
        }

        /**
         * @description 保存数据
         */
        const setData = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <name>${wrapCDATA(formData.value.name)}</name>
                    <chlId>${prop.data.chlId}</chlId>
                    <presets type="list">
                        ${tableData.value
                            .map((item) => {
                                return rawXml`
                                    <item index="${item.index}">
                                        <speed>${item.speed}</speed>
                                        <holdTime>${item.holdTime}</holdTime>
                                    </item>
                                `
                            })
                            .join('')}
                    </presets>
                </content>
            `
            const result = await createChlCruise(sendXml)
            const $ = queryXml(result)

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

            closeLoading()
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

        /**
         * @description 新增预置点
         */
        const addPreset = () => {
            if (tableData.value.length >= prop.data.cruisePresetMaxCount) {
                openMessageBox(Translate('IDCS_PRESET_MAX_NUM').formatForLang(prop.data.cruisePresetMaxCount))
                return
            }
            pageData.value.isPresetPop = true
            pageData.value.presetType = 'add'
        }

        /**
         * @description 编辑预置点
         */
        const editPreset = (index: number) => {
            pageData.value.presetIndex = index
            pageData.value.isPresetPop = true
            pageData.value.presetType = 'edit'
        }

        /**
         * @description 确认新增/编辑预置点
         */
        const confirmChangePreset = (data: ChannelPtzCruisePresetDto) => {
            if (pageData.value.presetType === 'add') {
                tableData.value.push({
                    ...data,
                    id: ++presetId,
                })
            } else {
                tableData.value[pageData.value.presetIndex] = { ...data }
            }
            pageData.value.isPresetPop = false
        }

        /**
         * @description 删除预置点
         * @param {Number} index
         */
        const deletePreset = (index: number) => {
            pageData.value.presetIndex = index

            if (index > 0 && tableData.value.length - 1 === index) {
                pageData.value.presetIndex--
            }
            tableData.value.slice(index, 1)
        }

        /**
         * @description 删除所有预置点
         */
        const deleteAllPreset = () => {
            tableData.value = []
            pageData.value.presetIndex = 0
        }

        /**
         * @description 选中表格项
         * @param {ChannelPtzCruisePresetDto} row
         */
        const handleRowClick = (row: ChannelPtzCruisePresetDto) => {
            pageData.value.presetIndex = tableData.value.findIndex((item) => row.id === item.id)
        }

        /**
         * @description 上移预置点
         * @param index
         */
        const moveUpPreset = () => {
            const index = pageData.value.presetIndex
            const temp = { ...tableData.value[index] }
            tableData.value[index] = { ...tableData.value[index - 1] }
            tableData.value[index - 1] = temp
        }

        /**
         * @description 下移预置点
         * @param index
         */
        const moveDownPreset = () => {
            const index = pageData.value.presetIndex
            const temp = { ...tableData.value[index] }
            tableData.value[index] = { ...tableData.value[index + 1] }
            tableData.value[index + 1] = temp
        }

        const displayHoldTime = (time: number) => {
            return getTranslateForSecond(time)
        }

        return {
            formRef,
            formData,
            formRule,
            pageData,
            tableRef,
            tableData,
            open,
            verify,
            close,
            reset,
            addPreset,
            editPreset,
            handleRowClick,
            confirmChangePreset,
            deletePreset,
            deleteAllPreset,
            moveUpPreset,
            moveDownPreset,
            displayHoldTime,
        }
    },
})
