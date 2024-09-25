/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 17:19:11
 * @Description: 穿梭下拉框内容
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-25 14:39:49
 */
export default defineComponent({
    props: {
        sourceTitle: {
            type: String,
            require: true,
            default: '',
        },
        targetTitle: {
            type: String,
            require: true,
            default: '',
        },
        sourceData: {
            type: Array as PropType<{ value: string; label: string }[]>,
            require: true,
        },
        linkedList: {
            type: Array as PropType<string[]>,
            require: true,
        },
        type: {
            type: String,
            require: true,
            default: '',
        },
    },
    emits: {
        confirm(e: { value: string; label: string }[]) {
            return e
        },
        close() {
            return true
        },
    },
    setup(props, ctx) {
        const data = ref<{ value: string; label: string }[]>([])
        const chosedList = ref<string[]>([])
        const MAX_TRIGGER_COUNT = 16
        const { openMessageTipBox } = useMessageBox()
        const { Translate } = useLangStore()
        const typeMapping: Record<string, string> = {
            record: 'IDCS_RECORD_CHANNEL_LIMIT',
            ftpRec: 'IDCS_FTP_RECORD_CHANNEL_LIMIT',
            snap: 'IDCS_SNAP_CHANNEL_LIMIT',
            ftpSnap: 'IDCS_FTP_SNAP_CHANNEL_LIMIT',
            alarmOut: 'IDCS_ALARMOUT_LIMIT',
        }
        const genData = () => {
            data.value = props.sourceData!
            chosedList.value = props.linkedList!
        }
        /**
         * @description 限制联动通道数量
         */
        const change = () => {
            if (chosedList.value.length > MAX_TRIGGER_COUNT) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
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
        onMounted(() => {
            genData()
        })
        return {
            data,
            chosedList,
            props,
            verify,
            close,
            change,
        }
    },
})
