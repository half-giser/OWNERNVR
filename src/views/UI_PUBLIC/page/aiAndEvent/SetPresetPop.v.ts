/*
 * @Description: 预置点名称配置
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-20 17:19:56
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-08-22 11:24:34
 */
import { type PresetList, type PresetItem } from '@/types/apiType/aiAndEvent'

export default defineComponent({
    props: {
        filterChlId: {
            type: String,
            require: true,
        },
        linkedList: {
            type: Array<PresetItem>,
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
            const sendXml = rawXml`
                <types>
                    <nodeType>
                        <enum>chls</enum>
                        <enum>sensors</enum>
                        <enum>alarmOuts</enum>
                    </nodeType>
                </types>
                <nodeType type="nodeType">chls</nodeType>
                <requireField>
                    <name/>
                    <chlType/>
                </requireField>
                <condition>
                    <supportPtz/>
                </condition>
            `
            const result = await queryNodeList(getXmlWrapData(sendXml))

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
                    }
                })

                rowData = rowData.filter((item) => item.id != prop.filterChlId)

                rowData.forEach((row) => {
                    prop.linkedList?.forEach((item) => {
                        if (row.id == item.chl.value) {
                            row.preset = { value: item.index, label: item.name }
                        }
                    })
                })

                for (let i = rowData.length - 1; i >= 0; i--) {
                    //预置点里过滤掉recorder通道
                    if (rowData[i].chlType == 'recorder') {
                        rowData.splice(i, 1)
                    } else {
                        await getPresetById(rowData[i])
                    }
                }

                tableData.value = rowData
            })
        }

        const getPresetById = async (row: PresetList) => {
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
        }

        const save = () => {
            let presetCount = 0
            const linkedList = [] as PresetItem[]
            tableData.value.forEach((item) => {
                if (item.preset.value !== '') {
                    presetCount++
                    linkedList.push({
                        index: item.preset.value,
                        name: item.preset.label,
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
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_PRESET_LIMIT'),
                })
            } else {
                prop.handlePresetLinkedList!(prop.filterChlId, linkedList)
                ctx.emit('close', prop.filterChlId as string)
            }
        }

        const close = () => {
            ctx.emit('close', prop.filterChlId as string)
        }
        return {
            tableData,
            open,
            save,
            close,
        }
    },
})
