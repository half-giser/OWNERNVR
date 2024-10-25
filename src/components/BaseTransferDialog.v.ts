/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 17:19:11
 * @Description: 穿梭框弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-15 17:18:09
 */
export default defineComponent({
    props: {
        headerTitle: {
            type: String,
            default: '',
        },
        sourceTitle: {
            type: String,
            default: '',
        },
        targetTitle: {
            type: String,
            default: '',
        },
        sourceData: {
            type: Array as PropType<{ label: string; value: string; disabled?: boolean }[]>,
            required: true,
        },
        linkedList: {
            type: Array as PropType<string[]>,
            required: true,
        },
        type: {
            type: String,
            default: '',
        },
    },
    emits: {
        confirm(e: SelectOption<string, string>[]) {
            return e
        },
        close() {
            return true
        },
    },
    setup(props, ctx) {
        const data = ref<SelectOption<string, string>[]>([])
        const chosedList = ref<string[]>([])
        const MAX_TRIGGER_COUNT = 16
        const source_title = ref('')
        const target_title = ref('')
        const { openMessageTipBox } = useMessageBox()
        const { Translate } = useLangStore()
        const panelWidth = ref(200)
        const typeMapping: Record<string, string> = {
            record: 'IDCS_RECORD_CHANNEL_LIMIT',
            ftpRec: 'IDCS_FTP_RECORD_CHANNEL_LIMIT',
            snap: 'IDCS_SNAP_CHANNEL_LIMIT',
            ftpSnap: 'IDCS_FTP_SNAP_CHANNEL_LIMIT',
            alarmOut: 'IDCS_ALARMOUT_LIMIT',
        }
        const open = () => {
            data.value = props.sourceData
            chosedList.value = props.linkedList
            source_title.value = Translate(props.sourceTitle)
            target_title.value = Translate(props.targetTitle)
        }

        /**
         * @description 限制联动通道数量
         */
        const change = () => {
            if (chosedList.value.length > MAX_TRIGGER_COUNT) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate(typeMapping[props.type]),
                })
                chosedList.value.splice(MAX_TRIGGER_COUNT, chosedList.value.length - 1)
            }
        }

        /**
         * @description 保存数据
         */
        const verify = () => {
            const filterList = data.value.filter((item) => chosedList.value.includes(item.value))
            ctx.emit('confirm', filterList)
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        const updatePanelWidth = () => {
            const source_length = source_title.value.length
            const sourceTitleWidth = source_length * 9
            const target_length = target_title.value.length
            const targetTitleWidth = target_length * 9
            const maxWidth = Math.max(sourceTitleWidth, targetTitleWidth)
            panelWidth.value = Math.max(maxWidth + 87, panelWidth.value)
        }
        onMounted(() => {
            open()
            updatePanelWidth()
        })
        return {
            data,
            chosedList,
            props,
            verify,
            open,
            close,
            change,
            source_title,
            target_title,
            panelWidth,
        }
    },
})
