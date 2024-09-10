/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-26 17:39:29
 * @Description: 分屏模版
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 15:04:14
 */
export default defineComponent({
    props: {
        /**
         * @property {enum} 类型 screen | thumbail
         */
        type: {
            type: String,
            default: 'screen',
        },
        /**
         * @property 分屏数
         */
        segment: {
            type: Number,
            required: true,
        },
        /**
         * @property 当前选中状态的视窗的索引
         */
        activeWin: {
            type: Number,
            required: true,
        },
        /**
         * @property 当前视图是否选中状态
         */
        activeView: {
            type: Boolean,
            required: false,
        },
        /**
         * @property 视窗数据列表
         */
        winData: {
            type: Array as PropType<{ id: string; value: string }[]>,
            required: true,
        },
    },
    emits: {
        drop(winIndex: number) {
            return !isNaN(winIndex)
        },
        change(winIndex: number) {
            return !isNaN(winIndex)
        },
        clear(winIndex: number) {
            return !isNaN(winIndex)
        },
    },
    setup(prop, ctx) {
        const isContextMenu = ref(false)
        const x = ref(0)
        const y = ref(0)

        /**
         * @description 拖至容器
         * @param {Event} e
         * @param {number} index
         */
        const handleDrop = (e: Event, index: number) => {
            e.preventDefault()
            ctx.emit('drop', index)
        }

        /**
         * @description 阻止右键默认事件
         * @param {Event} e
         */
        const preventContextMenu = (e: Event) => {
            e.preventDefault()
        }

        /**
         * @description 隐藏右键菜单栏
         */
        const hideContextMenu = () => {
            isContextMenu.value = false
        }

        /**
         * @description 点击选中
         * @param {number} index
         */
        const handleClick = (index: number) => {
            ctx.emit('change', index)
        }

        /**
         * @description 拖拽至容器选中
         * @param {number} index
         */
        const handleDragOver = (index: number) => {
            ctx.emit('change', index)
        }

        /**
         * @description 右键打开菜单栏
         * @param {MouseEvent} event
         * @param {number} index
         */
        const handleMouseDown = (event: MouseEvent, index: number) => {
            ctx.emit('change', index)
            if (event.which === 3) {
                isContextMenu.value = true
                x.value = event.pageX
                y.value = event.pageY
            }
        }

        /**
         * @description 清理容器内容
         */
        const clear = () => {
            ctx.emit('clear', prop.activeWin)
        }

        if (prop.type === 'screen') {
            useEventListener(document, 'contextmenu', preventContextMenu, false)
            useEventListener(document, 'click', hideContextMenu, false)
        }

        return {
            handleDrop,
            handleClick,
            handleDragOver,
            handleMouseDown,
            clear,
            isContextMenu,
            x,
            y,
        }
    },
})
