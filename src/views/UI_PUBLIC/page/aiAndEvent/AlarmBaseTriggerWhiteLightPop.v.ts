/*
 * @Date: 2025-05-16 14:29:49
 * @Description: 普通事件-联动-IPC闪灯
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
export default defineComponent({
    props: {
        /**
         * @property {Array} 通道列表
         */
        data: {
            type: Array as PropType<AlarmTriggerWhiteLightPopDto[]>,
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
    },
    emits: {
        confirm(index: number, data: SelectOption<string, string>[]) {
            return typeof Array.isArray(index) && Array.isArray(data)
        },
    },
    setup(prop, ctx) {
        const pageData = ref({
            chlList: [] as SelectOption<string, string>[],
            isDropdown: false,
            isPop: false,
        })

        const chlLinkList = computed(() => {
            const find = prop.data[prop.index]
            return find ? find.triggerWhiteLight.chls.map((item) => item.value) : []
        })

        /**
         * @description 确认修改所有通道
         * @param {SelectOption<string, string>[]} event
         */
        const confirmAll = (event: SelectOption<string, string>[]) => {
            prop.data.forEach((_item, index) => {
                ctx.emit('confirm', index, event)
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
            ctx.emit('confirm', prop.index, prop.data[prop.index].triggerWhiteLight.chls)
        }

        /**
         * @description 获取IPC闪灯通道
         */
        const getList = async () => {
            const result = await getChlList({
                nodeType: 'chls',
                requireField: ['supportManualWhiteLightAlarmOut'],
            })
            const $ = queryXml(result)
            $('content/item').forEach((item) => {
                const $item = queryXml(item.element)
                if ($item('supportManualWhiteLightAlarmOut').text().bool()) {
                    pageData.value.chlList.push({
                        value: item.attr('id'),
                        label: $item('name').text(),
                    })
                }
            })
        }

        onMounted(() => {
            getList()
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
            confirmAll,
            closeAll,
            confirm,
            close,
        }
    },
})
