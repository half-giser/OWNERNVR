/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-06 17:40:53
 * @Description: AI-联动-预置点-选择面板
 */
import { type AlarmPresetItem } from '@/types/apiType/aiAndEvent'

export default defineComponent({
    props: {
        /**
         * @property {Array} 选中值
         */
        modelValue: {
            type: Array as PropType<AlarmPresetItem[]>,
            required: true,
        },
    },
    emits: {
        'update:modelValue'(preset: AlarmPresetItem[]) {
            return Array.isArray(preset)
        },
    },
    setup(prop, ctx) {
        const MAX_TRIGGER_PRESET_COUNT = 16
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()

        const pageData = ref({
            chlList: [] as SelectOption<string, string>[],
            presetList: {} as Record<string, SelectOption<string, string>[]>,
        })

        const reqMap: Record<string, boolean> = {}

        // 选中的预置点
        const selected = computed(() => {
            const selectedData: Record<string, string> = {}
            prop.modelValue.forEach((item) => {
                if (pageData.value.presetList[item.chl.value]) {
                    selectedData[item.chl.value] = item.index
                    if (!reqMap[item.chl.value] && pageData.value.presetList[item.chl.value].length === 1) {
                        pageData.value.presetList[item.chl.value].push({
                            label: item.name,
                            value: item.index,
                        })
                    }
                }
            })
            pageData.value.chlList.forEach((item) => {
                if (!selectedData[item.value]) {
                    selectedData[item.value] = ' '
                }
            })
            return selectedData
        })

        /**
         * @description 获取通道列表
         */
        const getChannelList = async () => {
            const result = await getChlList({
                isSupportPtz: true,
            })
            commLoadResponseHandler(result, async ($) => {
                pageData.value.chlList = $('//content/item')
                    .filter((item) => {
                        const $item = queryXml(item.element)
                        return $item('chlType').text() !== 'recorder'
                    })
                    .map((item) => {
                        const $item = queryXml(item.element)
                        const id = item.attr('id')!
                        pageData.value.presetList[id] = [
                            {
                                value: ' ',
                                label: Translate('IDCS_NULL'),
                            },
                        ]
                        reqMap[id] = false
                        return {
                            label: $item('name').text(),
                            value: id,
                        }
                    })
            })
        }

        /**
         * @description 获取预置点列表
         * @param {SelectOption<string, string>} chl
         */
        const getPresetList = async (chl: SelectOption<string, string>) => {
            if (reqMap[chl.value]) {
                return
            }
            reqMap[chl.value] = true

            const sendXml = rawXml`
                <condition>
                    <chlId>${chl.value}</chlId>
                </condition>
            `
            const result = await queryChlPresetList(sendXml)
            commLoadResponseHandler(result, ($) => {
                pageData.value.presetList[chl.value] = [
                    {
                        value: ' ',
                        label: Translate('IDCS_NULL'),
                    },
                ].concat(
                    $('//content/presets/item').map((item) => {
                        return {
                            value: item.attr('index')!,
                            label: item.text(),
                        }
                    }),
                )
            })
        }

        /**
         * @description 更改选项
         * @param {SelectOption<string, string>} chl
         * @param {number} presetIndex
         */
        const change = (chl: SelectOption<string, string>, presetIndex: string) => {
            const presetItems = [...prop.modelValue]
            const preset = pageData.value.presetList[chl.value].find((item) => item.value === presetIndex)!
            const find = presetItems.find((item) => item.chl.value === chl.value)
            if (find) {
                find.index = presetIndex
                find.name = preset.label
            } else {
                presetItems.push({
                    index: presetIndex,
                    name: preset.value,
                    chl: {
                        label: chl.label,
                        value: chl.value,
                    },
                })
            }

            if (presetItems.length > MAX_TRIGGER_PRESET_COUNT) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PRESET_LIMIT'),
                })
            } else {
                const result = presetItems.filter((item) => item.index !== ' ')
                ctx.emit('update:modelValue', result)
            }
        }

        onMounted(() => {
            getChannelList()
        })

        return {
            pageData,
            getPresetList,
            change,
            selected,
        }
    },
})
