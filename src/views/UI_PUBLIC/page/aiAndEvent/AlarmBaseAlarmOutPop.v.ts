/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-08 13:37:15
 * @Description: 普通事件-联动-报警输出
 */
export default defineComponent({
    props: {
        /**
         * @property {Array} 通道列表
         */
        data: {
            type: Array as PropType<AlarmOutPopDto[]>,
            required: true,
        },
        /**
         * @property {number} 通道索引
         */
        index: {
            type: Number,
            required: true,
        },
        /**
         * @property {boolean} 打开弹窗
         */
        visible: {
            type: Boolean,
            default: false,
        },
        /**
         * @property {boolean} 选项是否排除当前通道
         */
        exclude: {
            type: Boolean,
            default: false,
        },
    },
    emits: {
        confirm(index: number, data: SelectOption<string, string>[]) {
            return typeof Array.isArray(index) && Array.isArray(data)
        },
    },
    setup(prop, ctx) {
        type AlarmOutList = SelectOption<string, string> & {
            device: SelectOption<string, string>
        }

        const pageData = ref({
            alarmOutList: [] as AlarmOutList[],
            isDropdown: false,
            isPop: false,
        })

        const chlSourceList = computed(() => {
            const chlId = prop.data[prop.index]?.id || ''
            if (prop.exclude) {
                return pageData.value.alarmOutList.filter((item) => item.device.value !== chlId)
            } else {
                return pageData.value.alarmOutList
            }
        })

        const chlLinkList = computed(() => {
            const find = prop.data[prop.index]
            return find ? find.alarmOut.alarmOuts.map((item) => item.value) : []
        })

        /**
         * @description 确认修改所有通道
         * @param {AlarmOutList[]} event
         */
        const confirmAll = (event: AlarmOutList[]) => {
            prop.data.forEach((item, index) => {
                ctx.emit('confirm', index, prop.exclude ? event.filter((chl) => chl.device.value !== item.id) : event)
            })
            pageData.value.isDropdown = false
        }

        /**
         * @description 取消所有修改
         */
        const closeAll = () => {
            pageData.value.isDropdown = false
        }

        /**
         * @description 确认修改当前通道
         * @param {SelectOption<string, string>[]} event
         */
        const confirm = (event: SelectOption<string, string>[]) => {
            ctx.emit('confirm', prop.index, event)
        }

        /**
         * @description 取消修改当前通道
         */
        const close = () => {
            ctx.emit('confirm', prop.index, prop.data[prop.index].alarmOut.alarmOuts)
        }

        /**
         * @description 获取报警输出列表
         */
        const getAlarmOutList = async () => {
            pageData.value.alarmOutList = await buildAlarmOutChlList()
        }

        onMounted(() => {
            getAlarmOutList()
        })

        watch(
            () => prop.visible,
            (visible) => {
                pageData.value.isPop = visible
            },
        )

        return {
            pageData,
            chlLinkList,
            chlSourceList,
            confirmAll,
            closeAll,
            confirm,
            close,
        }
    },
})
