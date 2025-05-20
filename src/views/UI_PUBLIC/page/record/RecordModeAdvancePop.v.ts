/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-29 14:15:46
 * @Description: 新建录像模式
 */
export default defineComponent({
    props: {
        advanceRecModes: {
            type: Array as PropType<Array<RecordModeDto>>,
            required: true,
        },
        advanceRecModeId: {
            type: String,
            required: true,
        },
    },
    emits: {
        confirm(e: string[]) {
            return Array.isArray(e)
        },
        close() {
            return true
        },
    },
    setup(prop) {
        const open = () => {
            // 选中当前生效的高级模式的时间
            if (prop.advanceRecModeId) {
                selectedEvents.value = prop.advanceRecModeId.split('_')
            }
        }

        //选择的值
        const selectedEvents = ref<string[]>([])

        const isIntensiveDisabled = computed(() => {
            return selectedEvents.value.includes(REC_MODE_TYPE.POS)
        })

        watch(selectedEvents, () => {
            if (selectedEvents.value.includes(REC_MODE_TYPE.POS) && !selectedEvents.value.includes(REC_MODE_TYPE.INTENSIVE)) {
                selectedEvents.value.push(REC_MODE_TYPE.INTENSIVE)
            }
        })

        return {
            open,
            selectedEvents,
            isIntensiveDisabled,
        }
    },
})
