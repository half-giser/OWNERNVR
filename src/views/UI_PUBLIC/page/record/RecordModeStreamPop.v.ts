/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-31 11:11:05
 * @Description: 自动模式通道码流参数配置
 */
import { type RecordModeDto, type RecordStreamTableExpose } from '@/types/apiType/record'
import { defineComponent } from 'vue'
import RecordBaseStreamTable from './RecordBaseStreamTable.vue'
import { cloneDeep } from 'lodash-es'
export default defineComponent({
    components: {
        RecordBaseStreamTable,
    },
    props: {
        advanceRecModeMap: {
            type: Object as PropType<Record<string, RecordModeDto>>,
            required: true,
        },
        autoModeId: {
            type: String,
            required: true,
        },
    },
    emits: {
        confirm(e: string[]) {
            return Array.isArray(e)
        },
        close(type: boolean) {
            return typeof type === 'boolean'
        },
    },
    setup(props, ctx) {
        const { Translate } = useLangStore()
        const recordStreamTableRef = ref<RecordStreamTableExpose>()
        const pageData = ref({
            mainTitle: '',
            tabs: [] as SelectOption<string, string>[],
            currenMode: '',
            modeMapping: {
                EVENT: 'event',
                INTENSIVE: 'timing',
            } as Record<string, string>,
            txtBandwidth: '',
            recTime: '',
            PredictVisible: false,
            CalculateVisible: false,
            initComplete: false,
            key: '',
        })

        onMounted(() => {})

        const onOpen = () => {
            pageData.value.key = props.autoModeId
            pageData.value.initComplete = false
            if (!props.autoModeId) return
            const events = props.autoModeId!.split('_')
            pageData.value.mainTitle = events
                .map((item) => {
                    return props.advanceRecModeMap[item].text
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
            pageData.value.currenMode = pageData.value.modeMapping[pageData.value.tabs[0].value]
            if (import.meta.env.VITE_UI_TYPE === 'UI1-E') {
                pageData.value.PredictVisible = true
                pageData.value.CalculateVisible = true
            }
            pageData.value.initComplete = true
        }

        const tabSeleced = (key: string) => {
            if (key === REC_MODE_TYPE.INTENSIVE) {
                pageData.value.currenMode = 'timing'
            } else {
                pageData.value.currenMode = 'event'
            }
        }

        const getBandwidth = (e: string) => {
            const text = cloneDeep(e)
            pageData.value.txtBandwidth = text
        }

        const getRecTime = (e: string) => {
            const text = cloneDeep(e)
            pageData.value.recTime = text
        }

        const handleCalculate = () => {
            if (recordStreamTableRef.value) {
                recordStreamTableRef.value.queryRemainRecTimeF()
            }
        }

        const setData = () => {
            if (recordStreamTableRef.value) {
                recordStreamTableRef.value.setData()
            }
            ctx.emit('close', true)
        }

        return {
            recordStreamTableRef,
            pageData,
            onOpen,
            tabSeleced,
            setData,
            RecordBaseStreamTable,
            handleCalculate,
            getBandwidth,
            getRecTime,
        }
    },
})
