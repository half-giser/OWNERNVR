/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-03 15:01:51
 * @Description: POS显示设置
 */
export default defineComponent({
    props: {
        /**
         * @property POS显示设置数据
         */
        data: {
            type: Object as PropType<SystemPosDisplaySetting>,
            default: () => new SystemPosDisplaySetting(),
        },
        /**
         * @property Display Set设置数据
         */
        limit: {
            type: Object as PropType<SystemPostDisplaySet>,
            required: true,
        },
        /**
         * @property 颜色设置数据
         */
        colorData: {
            type: Array as PropType<SystemPostColorData[]>,
            required: true,
        },
    },
    emits: {
        confirm(a: SystemPosDisplaySetting, b: SystemPostColorData[]) {
            return a || b
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
            // TAB
            tabOption: [Translate('IDCS_GENERAL_SET'), Translate('IDCS_DISPLAY_POSITION'), Translate('IDCS_FISHEYE_DISPLAY')],
            // 选中的TAB索引
            tabIndex: 0,
            // 打印方式选项
            printOption: [
                {
                    label: Translate('IDCS_TURN_PAGE'),
                    value: 'page',
                },
                {
                    label: Translate('IDCS_SCROLL'),
                    value: 'scroll',
                },
            ],
            // 字体颜色选项
            colorOption: [
                {
                    file: 'pos_white',
                    value: 'RGB(255,255,255)',
                },
                {
                    file: 'pos_red',
                    value: 'RGB(255,30,30)',
                },
                {
                    file: 'pos_orange',
                    value: 'RGB(255,120,10)',
                },
                {
                    file: 'pos_yellow',
                    value: 'RGB(255,204,10)',
                },
                {
                    file: 'pos_green',
                    value: 'RGB(10,255,29)',
                },
                {
                    file: 'pos_blue',
                    value: 'RGB(10,174,255)',
                },
                {
                    file: 'pos_indigo',
                    value: 'RGB(66,10,255)',
                },
                {
                    file: 'pos_purple',
                    value: 'RGB(220,10,255)',
                },
            ],
            // 显示模式列表选中项的索引
            colorTableIndex: 0,
        })

        type TableList = {
            value: string
        }

        // 显示位置坐标
        const displayPosition = ref(new SystemPosDisplayPosition())
        // 显示位置绘图中的坐标
        const drawingPosition = ref(new SystemPosDisplayPosition())
        // 开始结束字符列表
        const startEndCharTableList = ref<SystemPosListStartEndChar[]>([])
        // 换行符列表
        const lineBreakTableList = ref<TableList[]>([])
        // 忽略字符列表
        const ignoreChareTableList = ref<TableList[]>([])
        // 显示模式数据列表
        const colorTableList = ref<SystemPostColorData[]>([])

        /**
         * @description 通用配置表单
         */
        const formData = ref({
            upperCase: false,
            timeOut: 10,
        })

        // 示例数据
        const posTextList = [
            '1  SANDWICH \t\t 1.55',
            '1  WATER \t\t 1.89',
            '1  APPLE \t\t 1.11',
            '5% GST \t\t\t 0.23',
            '8% PST \t\t\t 0.36',
            '3 Total \t\t 5.14',
            'Cash \t\t\t 5.14',
            'Friday   11.8.2020    08:30:00',
            '#001000L0001 Clerk 1',
        ]

        const playerRef = ref<PlayerInstance>()

        /**
         * @description Tab切换
         * @param {number} index Tab索引
         */
        const changeTab = (index: number) => {
            pageData.value.tabIndex = index
        }

        /**
         * @description 开始结束字符列表新增行
         * @param {SystemPosListStartEndChar} row
         * @param {number} index
         */
        const addStartEndCharRow = (row: SystemPosListStartEndChar, index: number) => {
            if (row.startChar && row.endChar && index === startEndCharTableList.value.length - 1) {
                startEndCharTableList.value.push({
                    startChar: '',
                    endChar: '',
                })
            }
        }

        /**
         * @description 开始结束字符列表删除行
         * @param {number} index
         */
        const deleteStartEndChar = (index: number) => {
            startEndCharTableList.value.splice(index, 1)
        }

        /**
         * @description 换行符列表新增行
         * @param {TableList} row
         * @param {number} index
         */
        const addLineBreakRow = (row: TableList, index: number) => {
            if (row.value && index === lineBreakTableList.value.length - 1) {
                lineBreakTableList.value.push({
                    value: '',
                })
            }
        }

        /**
         * @description 换行符列表删除行
         * @param {number} index
         */
        const deleteLineBreak = (index: number) => {
            lineBreakTableList.value.splice(index, 1)
        }

        /**
         * @description 忽略字符列表新增行
         * @param {TableList} row
         * @param {number} index
         */
        const addIgnoreCharRow = (row: TableList, index: number) => {
            if (row.value && index === ignoreChareTableList.value.length - 1) {
                ignoreChareTableList.value.push({
                    value: '',
                })
            }
        }

        /**
         * @description 忽略字符列表删除行
         * @param {number} index
         */
        const deleteIgnoreChar = (index: number) => {
            ignoreChareTableList.value.splice(index, 1)
        }

        /**
         * @description 约束输入的字符
         * @param {string} value
         */
        const formatChar = (value: string) => {
            return value.replace(/[^\u4E00-\u9FA5A-Za-z0-9~!@#%^*()\-+=?:"\/{}\\,.·￥%……（）\-+={}：“”【】、；‘'，。、]/g, '')
        }

        const div = ref<HTMLDivElement>()

        let originX = 0
        let originY = 0
        let rectX = 0
        let rectY = 0
        let rectWidth = 0
        let rectHeight = 0
        let isCanvasMoving = false

        /**
         * @description 显示位置MouseDown
         * @param {MouseEvent} event
         */
        const handleCanvasMouseDown = (event: MouseEvent) => {
            const rect = div.value!.getBoundingClientRect()
            rectX = Math.ceil(rect.left)
            rectY = Math.ceil(rect.top)
            rectWidth = Math.ceil(rect.width)
            rectHeight = Math.ceil(rect.height)
            originX = Math.ceil(event.clientX) - rectX
            originY = Math.ceil(event.clientY) - rectY
            isCanvasMoving = true
        }

        /**
         * @description 显示位置MouseMove
         * @param {MouseEvent} event
         */
        const handleCanvasMouseMove = (event: MouseEvent) => {
            if (isCanvasMoving) {
                event.preventDefault()
                const currentX = clamp(Math.ceil(event.clientX) - rectX, 0, rectWidth)
                const currentY = clamp(Math.ceil(event.clientY) - rectY, 0, rectHeight)
                drawingPosition.value.X = Math.min(currentX, originX)
                drawingPosition.value.Y = Math.min(currentY, originY)
                drawingPosition.value.width = Math.abs(currentX - originX)
                drawingPosition.value.height = Math.abs(currentY - originY)
            }
        }

        /**
         * @description 显示位置MouseUp，判断绘制的矩形是否合法
         * @param {MouseEvent} event
         */
        const handleCanvasMouseUp = () => {
            if (isCanvasMoving) {
                if (drawingPosition.value.width < prop.limit.wmin || drawingPosition.value.height < prop.limit.hmin) {
                    openMessageBox(Translate('IDCS_DISPLAY_SIZE_INVALID')).finally(() => {
                        drawingPosition.value = { ...displayPosition.value }
                    })
                } else {
                    displayPosition.value = { ...drawingPosition.value }
                }
            }
            isCanvasMoving = false
        }

        useEventListener(document.body, 'mousemove', handleCanvasMouseMove, false)
        useEventListener(document.body, 'mouseup', handleCanvasMouseUp, false)

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']
        let drawer = CanvasPos()

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        // 播放模式
        const mode = computed(() => {
            if (!ready.value) {
                return ''
            }
            return playerRef.value!.mode
        })

        /**
         * @description 视频插件ready回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                drawer = CanvasPos({
                    el: player.getDrawbordCanvas(),
                })
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
            }

            play()
            drawPos()
        }

        /**
         * @description 播放器播放
         */
        const play = () => {
            const data = colorTableList.value[pageData.value.colorTableIndex]

            if (mode.value === 'h5') {
                player.play({
                    chlID: data.chlId,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(data.chlId, data.name)
            }
        }

        const toggleOCX = (bool: boolean) => {
            if (mode.value === 'ocx') {
                plugin.DisplayOCX(!bool)
            }
        }

        /**
         * @description 改变字体颜色，重新渲染POS绘制
         * @param {string} value
         */
        const changeColor = (value: string) => {
            const index = colorTableList.value[pageData.value.colorTableIndex].colorList.indexOf(value)
            if (index === -1) {
                colorTableList.value[pageData.value.colorTableIndex].colorList.push(value)
            } else if (colorTableList.value[pageData.value.colorTableIndex].colorList.length > 1) {
                colorTableList.value[pageData.value.colorTableIndex].colorList.splice(index, 1)
            }
            drawPos()
        }

        /**
         * @description POS绘制
         */
        const drawPos = () => {
            const ocxData = posTextList.map((text, index) => {
                return {
                    text,
                    RGB: colorTableList.value[pageData.value.colorTableIndex].colorList[index % colorTableList.value[pageData.value.colorTableIndex].colorList.length].replace(/RGB/, ''),
                }
            })

            if (mode.value === 'h5') {
                drawer.setPosList(ocxData)
            }

            if (mode.value === 'ocx') {
                const sendXml = OCX_XML_SETPosColor(ocxData)
                plugin.ExecuteCmd(sendXml)
            }
        }

        /**
         * @description 验证表单，保存数据
         */
        const verify = () => {
            const matchStartEndChar = startEndCharTableList.value.every((item) => {
                if ((item.startChar && !item.endChar) || (!item.startChar && item.endChar)) {
                    return false
                }
                return true
            })
            if (!matchStartEndChar) {
                openMessageBox(Translate('IDCS_START_END_NOT_MATCH'))
                return
            }
            const setting: SystemPosDisplaySetting = {
                common: {
                    startEndChar: [...startEndCharTableList.value],
                    lineBreak: lineBreakTableList.value.map((item) => item.value),
                    ignoreChar: ignoreChareTableList.value.map((item) => item.value),
                    // 原本是忽略大小写的逻辑现在修改为匹配大小写。取反一下
                    ignoreCase: !formData.value.upperCase,
                    timeOut: formData.value.timeOut,
                },
                displayPosition: { ...displayPosition.value },
            }
            ctx.emit('confirm', setting, cloneDeep(colorTableList.value))
            changeTab(0)
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
            changeTab(0)
        }

        /**
         * @description 打开弹窗时，初始化弹窗数据
         */
        const open = () => {
            // 原本是忽略大小写的逻辑现在修改为匹配大小写。取反一下
            formData.value.upperCase = !prop.data.common.ignoreCase
            formData.value.timeOut = prop.data.common.timeOut

            startEndCharTableList.value = [...prop.data.common.startEndChar]
            // 插入空行
            if (!startEndCharTableList.value.length) {
                startEndCharTableList.value.push({
                    startChar: '',
                    endChar: '',
                })
            } else {
                const lastStartEndCharItem = startEndCharTableList.value.at(-1)!
                if (lastStartEndCharItem.startChar || lastStartEndCharItem.endChar) {
                    startEndCharTableList.value.push({
                        startChar: '',
                        endChar: '',
                    })
                }
            }

            lineBreakTableList.value = [...prop.data.common.lineBreak.map((value: string) => ({ value }))]
            // 插入空行
            if (!lineBreakTableList.value.length || lineBreakTableList.value.at(-1)?.value) {
                lineBreakTableList.value.push({
                    value: '',
                })
            }

            ignoreChareTableList.value = [...prop.data.common.ignoreChar.map((value: string) => ({ value }))]
            // 插入空行
            if (!ignoreChareTableList.value.length || ignoreChareTableList.value.at(-1)?.value) {
                ignoreChareTableList.value.push({
                    value: '',
                })
            }

            displayPosition.value = { ...prop.data.displayPosition }
            drawingPosition.value = { ...prop.data.displayPosition }
            colorTableList.value = prop.colorData.map((item, index) => {
                return {
                    index,
                    chlId: item.chlId,
                    name: item.name,
                    colorList: [...item.colorList],
                    printMode: item.printMode,
                    previewDisplay: item.previewDisplay,
                }
            })
        }

        return {
            open,
            pageData,
            formData,
            changeTab,
            addStartEndCharRow,
            deleteStartEndChar,
            addLineBreakRow,
            deleteLineBreak,
            addIgnoreCharRow,
            deleteIgnoreChar,
            handlePlayerReady,
            displayPosition,
            drawingPosition,
            startEndCharTableList,
            lineBreakTableList,
            ignoreChareTableList,
            colorTableList,
            changeColor,
            formatChar,
            handleCanvasMouseDown,
            verify,
            close,
            play,
            playerRef,
            div,
            toggleOCX,
        }
    },
})
