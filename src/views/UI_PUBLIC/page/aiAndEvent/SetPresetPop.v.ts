/*
 * @Description: 预置点名称配置
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-20 17:19:56
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-16 10:30:31
 */
import { type PresetList, type PresetItem } from '@/types/apiType/aiAndEvent'

export default defineComponent({
    props: {
        filterChlId: {
            type: String,
            require: true,
        },
        linkedList: {
            type: Object as PropType<PresetItem[]>,
            require: true,
        },
        handlePresetLinkedList: {
            type: Function,
            require: true,
        },
    },
    emits: {
        close(id: string) {
            return id
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()

        const MAX_TRIGGER_PRESET_COUNT = 16
        const tableData = ref<PresetList[]>([])

        const open = async () => {
            const result = await getChlList({
                isSupportPtz: true,
            })

            let rowData = [] as PresetList[]
            commLoadResponseHandler(result, async ($) => {
                rowData = $('/response/content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id')!,
                        name: $item('name').text(),
                        chlType: $item('chlType').text(),
                        preset: { value: '', label: Translate('IDCS_NULL') },
                        presetList: [{ value: '', label: Translate('IDCS_NULL') }],
                        isGetPresetList: false,
                    }
                })

                rowData = rowData.filter((item) => item.id != prop.filterChlId)
                rowData.forEach((row) => {
                    prop.linkedList?.forEach((item) => {
                        if (row.id == item.chl.value) {
                            console.log(item)
                            row.preset = { value: item.index, label: item.name }
                            row.presetList.push({ value: item.index, label: item.name })
                        }
                    })
                })
                console.log(rowData)
                for (let i = rowData.length - 1; i >= 0; i--) {
                    //预置点里过滤掉recorder通道
                    if (rowData[i].chlType == 'recorder') {
                        rowData.splice(i, 1)
                    }
                }
                tableData.value = rowData
            })
        }
        // 预置点选择框下拉时获取预置点列表数据
        const getPresetById = async (row: PresetList) => {
            if (!row.isGetPresetList) {
                row.presetList.splice(1)
                const sendXml = rawXml`
                <condition>
                    <chlId>${row.id}</chlId>
                </condition>
            `
                const result = await queryChlPresetList(sendXml)
                commLoadResponseHandler(result, ($) => {
                    $('/response/content/presets/item').forEach((item) => {
                        row.presetList.push({
                            value: item.attr('index')!,
                            label: item.text(),
                        })
                    })
                })
                row.isGetPresetList = true
            }
        }

        const save = () => {
            let presetCount = 0
            const linkedList = [] as PresetItem[]
            tableData.value.forEach((item) => {
                if (item.preset.value !== '') {
                    // 选择器绑定了value值但label不会随之改变，从列表中查找对应项
                    const presetItem = item.presetList.find((ele) => ele.value === item.preset.value) as { value: string; label: string }
                    presetCount++
                    linkedList.push({
                        index: presetItem.value,
                        name: presetItem.label,
                        chl: {
                            value: item.id,
                            label: item.name,
                        },
                    })
                }
            })

            if (presetCount > MAX_TRIGGER_PRESET_COUNT) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_PRESET_LIMIT'),
                })
            } else {
                prop.handlePresetLinkedList!(prop.filterChlId, linkedList)
                close()
            }
        }

        const close = () => {
            ctx.emit('close', prop.filterChlId!)
            tableData.value = []
        }
        return {
            tableData,
            open,
            save,
            close,
            getPresetById,
        }
    },
})
