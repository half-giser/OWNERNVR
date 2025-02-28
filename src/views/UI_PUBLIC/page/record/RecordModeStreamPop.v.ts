/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-31 11:11:05
 * @Description: 自动模式通道码流参数配置
 */
import RecordBaseStreamTable from './RecordBaseStreamTable.vue'

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
            txtBandwidth: '',
            recTime: '',
            isRecTime: false,
        })

        const open = () => {
            const events = props.autoModeId.split('_')
            pageData.value.mainTitle = events
                .map((item) => {
                    return props.advanceRecModeMap[item].text
                })
                .join('+')
            const intensiveIndex = props.autoModeId.indexOf(REC_MODE_TYPE.INTENSIVE)

            pageData.value.tabs = []
            if (intensiveIndex > -1) {
                events.splice(intensiveIndex, 1)
                pageData.value.tabs.push({
                    value: 'timing',
                    label: Translate('IDCS_TIME_RECORD'),
                })
            }

            pageData.value.tabs.push({
                value: 'event',
                label: events
                    .map((item) => {
                        return props.advanceRecModeMap![item].text
                    })
                    .join('+'),
            })

            pageData.value.currenMode = pageData.value.tabs[0].value

            if (import.meta.env.VITE_UI_TYPE === 'UI1-E') {
                pageData.value.isRecTime = true
            }
        }

        const changeTab = (key: string) => {
            pageData.value.currenMode = key
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
            recordStreamTableRef.value?.getRemainRecTime()
        }

        const setData = () => {
            recordStreamTableRef.value?.setData()
            ctx.emit('close', true)
        }

        return {
            recordStreamTableRef,
            pageData,
            open,
            changeTab,
            setData,
            handleCalculate,
            getBandwidth,
            getRecTime,
        }
    },
})
