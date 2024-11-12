/*
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-20 17:19:56
 * @Description: 预置点名称配置
 */
import { type AlarmPresetPopDto, type AlarmPresetItem } from '@/types/apiType/aiAndEvent'

export default defineComponent({
    props: {
        /**
         * @property {Array} 通道列表
         */
        data: {
            type: Array as PropType<AlarmPresetPopDto[]>,
            required: true,
        },
        /**
         * @property {number} 通道索引
         */
        index: {
            type: Number,
            required: true,
        },
    },
    emits: {
        confirm(index: number, data: AlarmPresetItem[]) {
            return typeof Array.isArray(index) && Array.isArray(data)
        },
    },
    setup(prop, ctx) {
        const MAX_TRIGGER_PRESET_COUNT = 16
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()

        const pageData = ref({
            chlList: [] as SelectOption<string, string>[],
            presetList: {} as Record<string, SelectOption<string, string>[]>,
            currentValue: [] as AlarmPresetItem[],
        })

        const reqMap: Record<string, boolean> = {}

        // 选中的预置点
        const selected = computed(() => {
            const selectedData: Record<string, string> = {}
            pageData.value.currentValue.forEach((item) => {
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
            const presetItems = [...pageData.value.currentValue]
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
                pageData.value.currentValue = presetItems.filter((item) => item.index !== ' ')
            }
        }

        /**
         * @description 回显的通道列表
         */
        const chlList = computed(() => {
            const find = prop.data[prop.index]
            if (find) {
                return pageData.value.chlList.filter((item) => item.value !== find.id)
            }
            return pageData.value.chlList
        })

        /**
         * @description 打开弹窗时 更新弹窗回显的数据
         */
        const open = () => {
            pageData.value.currentValue = prop.data[prop.index].preset.presets
        }

        /**
         * @description 确认
         */
        const confirm = () => {
            ctx.emit('confirm', prop.index, pageData.value.currentValue)
        }

        /**
         * @description 取消
         */
        const close = () => {
            ctx.emit('confirm', prop.index, prop.data[prop.index].preset.presets)
        }

        onMounted(() => {
            getChannelList()
        })

        return {
            pageData,
            chlList,
            open,
            confirm,
            close,
            getPresetList,
            change,
            selected,
        }
    },
})
