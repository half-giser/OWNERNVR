/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-22 15:15:52
 * @Description: 云台-任务
 */
import { type TableInstance, type FormRules } from 'element-plus'
import ChannelPtzTaskEditPop from './ChannelPtzTaskEditPop.vue'
import { ChannelPtzTaskChlDto } from '@/types/apiType/channel'

export default defineComponent({
    components: {
        ChannelPtzTaskEditPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        const playerRef = ref<PlayerInstance>()
        const auth = useUserChlAuth(false)

        // 功能与显示文本的映射
        const TYPE_TRANS_MAPPING: Record<string, string> = {
            // NON: Translate('IDCS_NO'),
            PRE: Translate('IDCS_PRESET'),
            CRU: Translate('IDCS_CRUISE'),
            TRA: Translate('IDCS_PTZ_TRACE'),
            RSC: Translate('IDCS_RANDOM_SCANNING'),
            ASC: Translate('IDCS_BOUNDARY_SCANNING'),
        }

        // 默认名称与显示文本的映射
        const NAME_TRANS_MAPPING: Record<string, string> = {
            // No: Translate('IDCS_NO'),
            'Random Scanning': Translate('IDCS_RANDOM_SCANNING'),
            'Boundary Scanning': Translate('IDCS_BOUNDARY_SCANNING'),
        }

        const pageData = ref({
            // 当前表格选中索引
            tableIndex: 0,
            // 表格展开索引列表
            expandRowKey: [] as string[],
            // 功能选项
            typeOptions: objectToOptions(TYPE_TRANS_MAPPING, 'string'),
            // 是否显示编辑弹窗
            isEditPop: false,
            // 编辑数据
            editData: new ChannelPtzTaskDto(),
            editRow: new ChannelPtzTaskChlDto(),
        })

        const formRef = useFormRef()

        const formData = ref(new ChannelPtzTaskDto())

        const formRule = ref<FormRules>({
            editIndex: [
                {
                    validator: (_rule, _value, callback) => {
                        if (tableData.value[pageData.value.tableIndex].taskItemCount >= tableData.value[pageData.value.tableIndex].maxCount) {
                            openMessageBox(Translate('IDCS_OVER_MAX_NUMBER_LIMIT'))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            endTime: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (getSeconds(value) < getSeconds(formData.value.startTime)) {
                            callback(new Error(Translate('IDCS_END_TIME_GREATER_THAN_START')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzTaskChlDto[]>([])

        const chlOptions = computed(() => {
            return tableData.value.map((item, index) => {
                return {
                    label: item.chlName,
                    value: index,
                }
            })
        })

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

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        /**
         * @description 播放器就绪时回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 播放视频
         */
        const play = () => {
            const { chlId, chlName } = tableData.value[pageData.value.tableIndex]

            if (mode.value === 'h5') {
                player.play({
                    chlID: chlId,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(chlId, chlName)
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && tableData.value.length) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        /**
         * @description 获取预置点列表
         * @param {ChannelPtzTaskChlDto} row
         */
        const getPresetNameList = async (row: ChannelPtzTaskChlDto) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${row.chlId}</chlId>
                </condition>
            `
            const result = await queryChlPresetList(sendXml)
            const $ = queryXml(result)

            const nameMapping: Record<number, string> = {}

            $('content/presets/item').forEach((item) => {
                nameMapping[item.attr('index').num()] = item.text()
            })

            row.presetList = getNameList(row.preMin, row.preMax, nameMapping)
        }

        /**
         * @description 获取巡航线列表
         * @param {ChannelPtzTaskChlDto} row
         */
        const getCruiseNameList = async (row: ChannelPtzTaskChlDto) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${row.chlId}</chlId>
                </condition>
            `
            const result = await queryChlCruiseList(sendXml)
            const $ = queryXml(result)
            const nameMapping: Record<number, string> = {}

            $('content/presets/item').forEach((item) => {
                nameMapping[item.attr('index').num()] = item.text()
            })

            row.cruiseList = getNameList(row.cruMin, row.cruMax, nameMapping)
        }

        /**
         * @description 获取轨迹列表
         * @param {ChannelPtzTaskChlDto} row
         */
        const getTraceNameList = async (row: ChannelPtzTaskChlDto) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${row.chlId}</chlId>
                </condition>
            `
            const result = await queryLocalChlPtzTraceList(sendXml)
            const $ = queryXml(result)
            const nameMapping: Record<number, string> = {}
            $('content/presets/item').forEach((item) => {
                nameMapping[item.attr('index').num()] = item.text()
            })

            row.traceList = getNameList(row.traMin, row.traMax, nameMapping)
        }

        /**
         * @description
         * @param {number} min
         * @param {number} max
         * @param {Record<number, string>} nameMapping
         * @returns
         */
        const getNameList = (min: number, max: number, nameMapping: Record<number, string>) => {
            return Array(max - min)
                .fill(min)
                .map((item, index) => {
                    return {
                        value: item + index,
                        label: `${item + index}${nameMapping[item + index] ? `(${nameMapping[item + index]})` : ''}`,
                    }
                })
        }

        /**
         * @description
         * @param {ChannelPtzTaskChlDto} row
         * @param {string} type
         * @returns {SelectOption<number, string>[]}
         */
        const getNameOption = (row: ChannelPtzTaskChlDto, type: string) => {
            if (typeof row === 'undefined') {
                return [
                    {
                        value: 0,
                        label: '',
                    },
                ]
            }

            switch (type) {
                case 'PRE':
                    return row.presetList
                case 'CRU':
                    return row.cruiseList
                case 'TRA':
                    return row.traceList
                case 'RSC':
                    return [
                        {
                            value: 0,
                            label: 'Random Scanning',
                        },
                    ]
                case 'ASC':
                    return [
                        {
                            value: 0,
                            label: 'Boundary Scanning',
                        },
                    ]
                default:
                    return [
                        {
                            value: 0,
                            label: '',
                        },
                    ]
            }
        }

        /**
         * @description 获取任务列表
         * @param {row} ChannelPtzTaskChlDto
         */
        const getTaskList = async (row: ChannelPtzTaskChlDto) => {
            const sendData = rawXml`
                <condition>
                    <chlId>${row.chlId}</chlId>
                </condition>
            `
            const result = await queryLocalChlPtzTask(sendData)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                row.tasks = $('content/tasks/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        startTime: $item('startTime').text(),
                        endTime: $item('endTime').text(),
                        type: $item('type').text(),
                        editIndex: item.attr('index').num(),
                    }
                })
                row.preMin = $('types/pre').attr('min').num()
                row.preMax = $('types/pre').attr('max').num()
                row.cruMin = $('types/cru').attr('min').num()
                row.cruMax = $('types/cru').attr('max').num()
                row.traMin = $('types/tra').attr('min').num()
                row.traMax = $('types/tra').attr('max').num()
                row.maxCount = $('content/tasks').attr('maxCount').num()
                row.status = $('content/tasks').attr('status').bool()
            }
        }

        /**
         * @description 计算秒时间戳
         * @param {String} formatString HH:mm
         */
        const getSeconds = (formatString: string) => {
            const split = formatString.split(':')
            return Number(split[0]) * 3600 + Number(split[1]) * 60
        }

        /**
         * @description 编辑任务列表
         * @param {String} chlId
         * @param {Boolean} status
         * @param {ChannelPtzTaskDto[]} taskList
         * @param {boolean} prompt
         */
        const setTask = async (chlId: string, status: boolean, taskList: ChannelPtzTaskDto[], prompt = true) => {
            const sendXML = rawXml`
                <content>
                    <chlId id="${chlId}"></chlId>
                    <index>1</index>
                    <name>task1</name>
                    <status>${status}</status>
                    <childs type="list">${taskList
                        .map((item) => {
                            return rawXml`
                                <item index="${item.editIndex}">
                                    <type>${item.type}</type>
                                    <startTime>${getSeconds(item.startTime)}</startTime>
                                    <endTime>${getSeconds(item.endTime)}</endTime>
                                </item>
                            `
                        })
                        .join('')}</childs>
                </content>
            `
            const result = await editChlPtzTask(sendXML)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                if (prompt) {
                    openMessageBox({
                        type: 'success',
                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                    })
                }
            }
            return $('status').text() === 'success'
        }

        /**
         * @description 编辑任务状态
         * @param {String} chlId
         * @param {Boolean} status
         */
        const setTaskStatus = async (chlId: string, status: boolean) => {
            const sendXml = rawXml`
                <content>
                    <chlId>${chlId}</chlId>
                    <index>1</index>
                    <status>${status}</status>
                </content>
            `
            await setChlPtzTaskStatus(sendXml)
        }

        /**
         * @description 改变所有任务状态
         */
        const changeTaskStatus = async () => {
            if (pageData.value.expandRowKey.length) {
                const chlId = pageData.value.expandRowKey[0]
                const row = tableData.value.find((item) => item.chlId === chlId)
                if (row) {
                    await setTask(chlId, !row.status, row.tasks)
                    await setTaskStatus(chlId, !row.status)
                    row.status = !row.status
                }
            }
        }

        /**
         * @description 打开编辑任务弹窗
         * @param {ChannelPtzTaskDto} row
         */
        const editTask = (data: ChannelPtzTaskDto, row: ChannelPtzTaskChlDto) => {
            pageData.value.editData = data
            pageData.value.editRow = row
            pageData.value.isEditPop = true
        }

        /**
         * @description 确认编辑任务，更新任务列表
         * @param {ChannelPtzTaskForm} data
         */
        const confirmEditTask = async (data: ChannelPtzTaskDto) => {
            const row = pageData.value.editRow
            pageData.value.isEditPop = false
            pageData.value.editData.editIndex = data.editIndex
            pageData.value.editData.endTime = data.endTime
            pageData.value.editData.startTime = data.startTime
            pageData.value.editData.type = data.type
            await setTask(row.chlId, row.status, row.tasks)
        }

        /**
         * @description 关闭编辑任务弹窗
         */
        const closeEditTask = () => {
            pageData.value.isEditPop = false
        }

        /**
         * @description 删除所有任务
         */
        const deleteAllTask = (row: ChannelPtzTaskChlDto) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_ALL_ITEMS'),
            }).then(async () => {
                if (pageData.value.expandRowKey.length) {
                    const result = await setTask(row.chlId, false, [], false)
                    if (result) {
                        row.tasks = []
                    }
                }
            })
        }

        /**
         * @description 删除任务
         * @param {number} index
         * @param {ChannelPtzTaskChlDto} row
         */
        const deleteTask = (index: number, row: ChannelPtzTaskChlDto) => {
            const name = displayName(row.tasks[index].editIndex, row.tasks[index].type, row)
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_ITEM_BY_TASK_S').formatForLang(name),
            }).then(async () => {
                const tasks = cloneDeep(row.tasks)
                tasks.splice(index, 1)
                const result = await setTask(row.chlId, false, tasks, false)
                if (result) {
                    openMessageBox({
                        type: 'success',
                        message: Translate('IDCS_DELETE_SUCCESS'),
                    })
                    row.tasks.splice(index, 1)
                } else {
                    openMessageBox(Translate('IDCS_DELETE_FAIL'))
                }
            })
        }

        /**
         * @description 获取通道数据
         */
        const getData = async () => {
            const result = await getChlList({
                pageIndex: 1,
                pageSize: 999,
                requireField: ['supportIntegratedPtz'],
            })
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                tableData.value = $('content/item')
                    .filter((item) => {
                        const $item = queryXml(item.element)
                        return (auth.value.hasAll || auth.value.ptz[item.attr('id')]) && $item('chlType').text() !== 'recorder' && $item('supportIntegratedPtz').text().bool()
                    })
                    .map((item) => {
                        const $item = queryXml(item.element)
                        const row = new ChannelPtzTaskChlDto()
                        row.chlId = item.attr('id')
                        row.chlName = $item('name').text()
                        row.taskItemCount = $item('taskItemCount').text().num()
                        return row
                    })
            }
        }

        /**
         * @description 添加任务
         */
        const setData = () => {
            formRef.value!.validate(async (valid) => {
                if (valid) {
                    const row = tableData.value[pageData.value.tableIndex]
                    const chlId = tableData.value[pageData.value.tableIndex].chlId
                    const task = cloneDeep(formData.value)
                    row.tasks.push(task)
                    await setTask(chlId, row.status, row.tasks)
                    await setTaskStatus(chlId, row.status)
                }
            })
        }

        /**
         * @description 时间的文本显示
         * @param {String} time
         */
        const displayTime = (time: string) => {
            return formatDate(time, dateTime.hourMinuteFormat, 'HH:mm')
        }

        /**
         * @description 功能的文本显示
         * @param {String} type
         */
        const displayType = (type: string) => {
            return TYPE_TRANS_MAPPING[type]
        }

        /**
         * @description 名称的文本显示
         * @param {number} editIndex
         * @param {string} type
         * @param {ChannelPtzTaskChlDto} data
         * @returns {string}
         */
        const displayName = (editIndex: number, type: string, data: ChannelPtzTaskChlDto) => {
            if (NAME_TRANS_MAPPING[type]) {
                return NAME_TRANS_MAPPING[type]
            }

            if (type === 'PRE') {
                return data.presetList.find((item) => item.value === editIndex)?.label || ''
            }

            if (type === 'CRU') {
                return data.cruiseList.find((item) => item.value === editIndex)?.label || ''
            }

            if (type === 'TRA') {
                return data.traceList.find((item) => item.value === editIndex)?.label || ''
            }

            return ''
        }

        /**
         * @description 获取默认值
         * @param {ChannelPtzTaskChlDto} row
         * @param {string} type
         * @returns {number}
         */
        const getNumber = (row: ChannelPtzTaskChlDto, type: string) => {
            switch (type) {
                case 'PRE':
                    return row.preMin
                case 'CRU':
                    return row.cruMin
                case 'TRA':
                    return row.traMin
                case 'RSC':
                    return 0
                case 'ASC':
                    return 0
                default:
                    return 0
            }
        }

        /**
         * @description 修改通道选项
         */
        const changeChl = () => {
            tableRef.value!.setCurrentRow(tableData.value[pageData.value.tableIndex])
            formData.value = new ChannelPtzTaskDto()
            formData.value.editIndex = getNumber(tableData.value[pageData.value.tableIndex], formData.value.type)
        }

        /**
         * @description 修改功能选项
         */
        const changeType = () => {
            formData.value.editIndex = getNumber(tableData.value[pageData.value.tableIndex], formData.value.type)
        }

        /**
         * @description 点击表格项回调
         * @param {ChannelPtzTaskChlDto} row
         */
        const handleRowClick = (row: ChannelPtzTaskChlDto) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            if (index !== pageData.value.tableIndex) {
                pageData.value.tableIndex = index
            }
        }

        /**
         * @description 表格项展开回调
         * @param {ChannelPtzTaskChlDto} row
         * @param {boolean} expanded
         */
        const handleExpandChange = (row: ChannelPtzTaskChlDto, expanded: ChannelPtzTaskChlDto[]) => {
            if (expanded.length > 1) {
                const find = tableData.value.find((item) => item.chlId === expanded[0].chlId)!
                tableRef.value!.toggleRowExpansion(find, false)
            }

            if (!expanded.length) {
                pageData.value.expandRowKey = []
            }

            if (expanded.some((item) => item.chlId === row.chlId)) {
                tableRef.value!.setCurrentRow(row)
                pageData.value.expandRowKey = [row.chlId]
            }
        }

        const getRowKey = (row: ChannelPtzTaskChlDto) => {
            return row.chlId
        }

        watch(
            () => pageData.value.tableIndex,
            () => {
                play()
            },
        )

        onMounted(async () => {
            openLoading()
            await auth.value.update()
            await getData()

            for (const item of tableData.value) {
                await getTaskList(item)
                getPresetNameList(item)
                getCruiseNameList(item)
                getTraceNameList(item)
            }

            if (tableData.value.length) {
                changeChl()
            }

            closeLoading()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }
        })

        return {
            playerRef,
            tableRef,
            tableData,
            chlOptions,
            formRef,
            formData,
            formRule,
            pageData,
            changeChl,
            changeType,
            handlePlayerReady,
            handleExpandChange,
            getRowKey,
            handleRowClick,
            setTaskStatus,
            changeTaskStatus,
            editTask,
            confirmEditTask,
            closeEditTask,
            deleteAllTask,
            deleteTask,
            displayTime,
            displayType,
            displayName,
            setData,
            getNameOption,
        }
    },
})
