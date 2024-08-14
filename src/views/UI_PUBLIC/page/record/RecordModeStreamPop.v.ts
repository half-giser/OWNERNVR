/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-31 11:11:05
 * @Description: 自动模式通道码流参数配置
 * @LastEditors: tengxiang tengxiang@tvt.net.cn
 * @LastEditTime: 2024-07-31 16:09:04
 */
import { type RecMode } from '@/types/apiType/record'
import { defineComponent } from 'vue'

export default defineComponent({
    props: {
        advanceRecModeMap: Object as PropType<Record<string, RecMode>>,
        autoModeId: String,
    },
    emits: ['confirm', 'close'],
    setup(props, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
            mainTitle: '',
            tabs: [] as SelectOption<string, string>[],
        })

        onMounted(() => {})

        const onOpen = () => {
            if (!props.autoModeId) return
            const events = props.autoModeId!.split('_')
            pageData.value.mainTitle = events
                .map((item) => {
                    return props.advanceRecModeMap![item].text
                })
                .join('+')
            const intensiveIndex = props.autoModeId!.indexOf(REC_MODE_TYPE.INTENSIVE)
            pageData.value.tabs.length = 0
            if (intensiveIndex > -1) {
                events.splice(intensiveIndex, 1)
                pageData.value.tabs.push({
                    value: REC_MODE_TYPE.INTENSIVE,
                    label: Translate('IDCS_TIME_RECORD'),
                })
            }

            pageData.value.tabs.push({
                value: REC_MODE_TYPE.EVENT,
                label: events
                    .map((item) => {
                        return props.advanceRecModeMap![item].text
                    })
                    .join('+'),
            })
        }

        const tabSeleced = (key: string) => {
            console.log(key)
        }

        const setData = () => {
            ctx.emit('close', true)
        }

        return {
            pageData,
            onOpen,
            tabSeleced,
            setData,
        }
    },
})
