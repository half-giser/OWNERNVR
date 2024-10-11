/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-22 15:15:52
 * @Description: 云台-任务
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-09 15:39:02
 */
import { cloneDeep } from 'lodash-es'
import { ChannelPtzTaskDto, type ChannelPtzTaskChlDto, ChannelPtzTaskForm } from '@/types/apiType/channel'
import { type FormInstance, type TableInstance, type FormRules } from 'element-plus'
import ChannelPtzTaskEditPop from './ChannelPtzTaskEditPop.vue'

export default defineComponent({
    components: {
        ChannelPtzTaskEditPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()

        const playerRef = ref<PlayerInstance>()
        const auth = useUserChlAuth(false)
        const dateTime = useDateTimeStore()

        // 任务数最大值
        const TASK_LIMIT = 8

        let timer: NodeJS.Timeout | number = 0

        // 功能与显示文本的映射
        const TYPE_TRANS_MAPPING: Record<string, string> = {
            NON: Translate('IDCS_NO'),
            PRE: Translate('IDCS_PRESET'),
            CRU: Translate('IDCS_CRUISE'),
            TRA: Translate('IDCS_PTZ_TRACE'),
            RSC: Translate('IDCS_RANDOM_SCANNING'),
            ASC: Translate('IDCS_BOUNDARY_SCANNING'),
        }

        // 默认名称与显示文本的映射
        const NAME_TRANS_MAPPING: Record<string, string> = {
            No: Translate('IDCS_NO'),
            'Random Scanning': Translate('IDCS_RANDOM_SCANNING'),
            'Boundary Scanning': Translate('IDCS_BOUNDARY_SCANNING'),
        }

        const pageData = ref({
            // 通知列表
            notification: [] as string[],
            // 当前表格选中索引
            tableIndex: 0,
            // 表格展开索引列表
            expandRowKey: [] as string[],
            // 功能选项
            typeOptions: [
                {
                    label: Translate('IDCS_NO'),
                    value: 'NON',
                },
                {
                    label: Translate('IDCS_PRESET'),
                    value: 'PRE',
                },
                {
                    label: Translate('IDCS_CRUISE'),
                    value: 'CRU',
                },
                {
                    label: Translate('IDCS_PTZ_TRACE'),
                    value: 'TRA',
                },
                {
                    label: Translate('IDCS_RANDOM_SCANNING'),
                    value: 'RSC',
                },
                {
                    label: Translate('IDCS_BOUNDARY_SCANNING'),
                    value: 'ASC',
                },
            ],
            // 名称选项
            nameOptions: [
                {
                    label: Translate('IDCS_NO'),
                    value: 'No',
                },
            ],
            // 任务启用状态
            taskStatus: false,
            // 是否显示编辑弹窗
            isEditPop: false,
            // 编辑数据
            editData: new ChannelPtzTaskDto(),
            // 编辑的通道ID
            editChlId: '',
        })

        const formRef = ref<FormInstance>()

        const formData = ref(new ChannelPtzTaskForm())

        const formRule = ref<FormRules>({
            name: [
                {
                    validator(rule, value: string, callback) {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                            return
                        }
                        if (tableData.value[pageData.value.tableIndex].taskItemCount >= TASK_LIMIT) {
                            openMessageTipBox({
                                type: 'info',
                                message: Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                            })
                            callback(new Error(''))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            endTime: [
                {
                    validator(rule, value: string, callback) {
                        if (getSeconds(value) < getSeconds(formData.value.startTime)) {
                            callback(new Error(Translate('IDCS_END_TIME_GREATER_THAN_START')))
                            return
                        }
                        callback()
                        return
                    },
                    trigger: 'manual',
                },
            ],
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzTaskChlDto[]>([])

        const taskTableData = ref<ChannelPtzTaskDto[]>([])

        // 播放模式
        const mode = computed(() => {
            if (!playerRef.value) {
                return ''
            }
            return playerRef.value.mode
        })

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        /**
         * @description 播放器就绪时回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                if (isHttpsLogin()) {
                    pageData.value.notification = [formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`)]
                }
            }
            if (mode.value === 'ocx') {
                if (!plugin.IsInstallPlugin()) {
                    plugin.SetPluginNotice('#layout2Content')
                    return
                }
                if (!plugin.IsPluginAvailable()) {
                    plugin.SetPluginNoResponse()
                    plugin.ShowPluginNoResponse()
                }
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            } else if (mode.value === 'ocx') {
                plugin.RetryStartChlView(chlId, chlName)
            }
        }

        /**
         * @description 获取预置点列表
         * @param {String} chlId
         */
        const getPresetNameList = async (chlId: string) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryChlPresetList(sendXml)
            const $ = queryXml(result)

            pageData.value.nameOptions = $('//content/presets/item').map((item) => {
                return {
                    value: item.attr('index')!,
                    label: item.text(),
                }
            })
        }

        /**
         * @description 获取巡航线列表
         * @param {string} chlId
         */
        const getCruiseNameList = async (chlId: string) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryChlCruiseList(sendXml)
            const $ = queryXml(result)
            pageData.value.nameOptions = $('//content/cruises/item').map((item) => {
                return {
                    value: item.attr('index')!,
                    label: item.text(),
                }
            })
        }

        /**
         * @description 获取轨迹列表
         * @param {string} chlId
         */
        const getTraceNameList = async (chlId: string) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryLocalChlPtzTraceList(sendXml)
            const $ = queryXml(result)
            pageData.value.nameOptions = $('//content/traces/item').map((item) => {
                return {
                    value: item.attr('index')!,
                    label: item.text(),
                }
            })
        }

        /**
         * @description 只有数据更新才重新渲染
         */
        const compareTask = (data: ChannelPtzTaskDto[]) => {
            if (data.length !== taskTableData.value.length) {
                return true
            }
            return taskTableData.value.some((item, index) => {
                return (
                    item.startTime !== data[index].startTime ||
                    item.endTime !== data[index].endTime ||
                    item.name !== data[index].name ||
                    item.enable !== data[index].enable ||
                    item.type !== data[index].type ||
                    item.editIndex !== data[index].editIndex
                )
            })
        }

        /**
         * @description 获取任务列表
         * @param {String} chlId
         * @param {Boolean} update 是否更新表格
         */
        const getTaskList = async (chlId: string, update = true) => {
            const index = tableData.value.findIndex((item) => item.chlId === chlId)
            const sendData = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryLocalChlPtzTask(sendData)
            const $ = queryXml(result)

            if ($('//status').text() === 'success') {
                const status = $('//content/tasks').attr('status')!.toBoolean()
                const data = $('//content/tasks/item').map((item, index) => {
                    const $item = queryXml(item.element)
                    return {
                        index: index + 1,
                        enable: status ? Translate('IDCS_ON') : Translate('IDCS_OFF'),
                        startTime: $item('startTime').text(), // formatDate($item('startTime').text(), dateTime.hourMinuteFormat.value, 'HH:mm'),
                        endTime: $item('endTime').text(), // formatDate($item('endTime').text(), dateTime.hourMinuteFormat.value, 'HH:mm'),
                        type: $item('type').text(),
                        name: $item('name').text(),
                        editIndex: item.attr('index')!,
                    }
                })
                if (update && chlId === pageData.value.expandRowKey[0]) {
                    if (pageData.value.taskStatus !== status) {
                        pageData.value.taskStatus = status
                    }
                    const different = compareTask(data)
                    if (different) {
                        taskTableData.value = data
                        tableData.value[index].taskItemCount = taskTableData.value.length
                    }
                }
                return {
                    data,
                    status,
                }
            } else {
                return {
                    data: [],
                    status: false,
                }
            }
        }

        /**
         * @description 定时获取任务列表
         */
        const renderTaskList = async () => {
            stopRenderTaskList()
            if (pageData.value.expandRowKey.length) {
                await getTaskList(pageData.value.expandRowKey[0])
            } else if (taskTableData.value.length) {
                taskTableData.value = []
            }
            timer = setTimeout(() => {
                renderTaskList()
            }, 2000)
        }

        /**
         * @description 停止定时获取任务列表
         */
        const stopRenderTaskList = () => {
            clearTimeout(timer)
            timer = 0
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
         * @param {Array} taskList
         */
        const setTask = async (chlId: string, status: boolean, taskList: ChannelPtzTaskDto[]) => {
            const taskXml = taskList
                .map((item) => {
                    return rawXml`
                        <item index="${item.editIndex}">
                            <type>${item.type}</type>
                            <startTime>${getSeconds(item.startTime).toString()}</startTime>
                            <endTime>${getSeconds(item.endTime).toString()}</endTime>
                        </item>
                    `
                })
                .join('')
            const sendXML = rawXml`
                <content>
                    <chlId id="${chlId}"></chlId>
                    <index>1</index>
                    <name>task1</name>
                    <status>${status.toString()}</status>
                    <childs type="list">${taskXml}</childs>
                </content>
            `
            await editChlPtzTask(sendXML)
            openMessageTipBox({
                type: 'success',
                message: Translate('IDCS_SAVE_DATA_SUCCESS'),
            })
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
                    <status>${status.toString()}</status>
                </content>
            `
            await setChlPtzTaskStatus(sendXml)
        }

        /**
         * @description 改变所有任务状态
         */
        const changeTaskStatus = async () => {
            if (pageData.value.expandRowKey.length) {
                stopRenderTaskList()
                const chlId = pageData.value.expandRowKey[0]
                const status = !pageData.value.taskStatus
                await setTask(chlId, status, taskTableData.value)
                await setTaskStatus(chlId, status)
                renderTaskList()
            }
        }

        /**
         * @description 打开编辑任务弹窗
         * @param {ChannelPtzTaskDto} row
         */
        const editTask = (row: ChannelPtzTaskDto) => {
            stopRenderTaskList()
            pageData.value.isEditPop = true
            pageData.value.editData = { ...row }
            pageData.value.editChlId = pageData.value.expandRowKey[0]
        }

        /**
         * @description 确认编辑任务，更新任务列表
         * @param {ChannelPtzTaskForm} data
         */
        const confirmEditTask = async (data: ChannelPtzTaskForm) => {
            pageData.value.isEditPop = false
            const current = cloneDeep(taskTableData.value)
            current[pageData.value.editData.index - 1] = {
                ...pageData.value.editData,
                ...data,
                editIndex: data.name,
            }
            await setTask(pageData.value.editChlId, pageData.value.taskStatus, current)
            await setTaskStatus(pageData.value.editChlId, pageData.value.taskStatus)
            renderTaskList()
        }

        /**
         * @description 关闭编辑任务弹窗
         */
        const closeEditTask = () => {
            pageData.value.isEditPop = false
            renderTaskList()
        }

        /**
         * @description 删除所有任务
         */
        const deleteAllTask = () => {
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_DELETE_ALL_ITEMS'),
            }).then(async () => {
                if (pageData.value.expandRowKey.length) {
                    stopRenderTaskList()
                    const chlId = pageData.value.expandRowKey[0]
                    await setTask(chlId, false, [])
                    renderTaskList()
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
                requireField: ['taskItemCount'],
                isSupportPtzGroupTraceTask: true,
            })
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                tableData.value = $('//content/item')
                    .filter((item) => {
                        const $item = queryXml(item.element)
                        return (auth.value.hasAll || auth.value.ptz[item.attr('id')!]) && $item('chlType').text() !== 'recorder'
                    })
                    .map((item) => {
                        const $item = queryXml(item.element)

                        return {
                            chlId: item.attr('id')!,
                            chlName: $item('name').text(),
                            taskItemCount: Number($item('taskItemCount').text()),
                        }
                    })
            }
        }

        /**
         * @description 添加任务
         */
        const setData = () => {
            formRef.value?.validate(async (valid) => {
                if (valid) {
                    stopRenderTaskList()
                    const chlId = tableData.value[pageData.value.tableIndex].chlId
                    const result = await getTaskList(chlId, false)
                    result.data.push({
                        index: 10000,
                        enable: '',
                        startTime: formData.value.startTime,
                        endTime: formData.value.endTime,
                        name: formData.value.name,
                        type: formData.value.type,
                        editIndex: formData.value.name,
                    })
                    await setTask(chlId, result.status, result.data)
                    await setTaskStatus(chlId, result.status)
                    tableData.value[pageData.value.tableIndex].taskItemCount++
                    renderTaskList()
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
         * @param {String} name
         */
        const displayName = (name: string) => {
            return NAME_TRANS_MAPPING[name] ? NAME_TRANS_MAPPING[name] : name
        }

        /**
         * @description 获取名称选项
         */
        const getName = async () => {
            const chlId = tableData.value[pageData.value.tableIndex].chlId

            if (formData.value.type === 'NON') {
                pageData.value.nameOptions = [
                    {
                        label: displayName('NO'),
                        value: 'NO',
                    },
                ]
            } else if (formData.value.type === 'PRE') {
                await getPresetNameList(chlId)
            } else if (formData.value.type === 'CRU') {
                await getCruiseNameList(chlId)
            } else if (formData.value.type === 'TRA') {
                await getTraceNameList(chlId)
            } else if (formData.value.type === 'RSC') {
                pageData.value.nameOptions = [
                    {
                        label: displayName('Random Scanning'),
                        value: 'Random Scanning',
                    },
                ]
            } else if (formData.value.type === 'ASC') {
                pageData.value.nameOptions = [
                    {
                        label: displayName('Boundary Scanning'),
                        value: 'Boundary Scanning',
                    },
                ]
            }
            if (pageData.value.nameOptions.length) {
                formData.value.name = pageData.value.nameOptions[0].value
            }
        }

        /**
         * @description 修改通道选项
         */
        const changeChl = () => {
            tableRef.value?.setCurrentRow(tableData.value[pageData.value.tableIndex])
            formRef.value?.clearValidate()
            formData.value.name = ''
            getName()
        }

        /**
         * @description 修改功能选项
         */
        const changeType = () => {
            formData.value.name = ''
            getName()
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
        const handleExpandChange = async (row: ChannelPtzTaskChlDto, expanded: ChannelPtzTaskChlDto[]) => {
            if (expanded.length > 1) {
                const find = tableData.value.find((item) => item.chlId === expanded[0].chlId)!
                tableRef.value?.toggleRowExpansion(find, false)
            }
            if (!expanded.length) {
                taskTableData.value = []
                pageData.value.expandRowKey = []
                stopRenderTaskList()
            }
            if (expanded.some((item) => item.chlId === row.chlId)) {
                tableRef.value?.setCurrentRow(row)
                taskTableData.value = []
                pageData.value.expandRowKey = [row.chlId]
                renderTaskList()
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
            if (tableData.value.length) {
                tableRef.value?.setCurrentRow(tableData.value[pageData.value.tableIndex])
                await renderTaskList()
            }
            closeLoading()
        })

        onBeforeUnmount(() => {
            stopRenderTaskList()
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        })

        return {
            playerRef,
            tableRef,
            tableData,
            formRef,
            formData,
            formRule,
            taskTableData,
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
            displayTime,
            displayType,
            displayName,
            setData,
            ChannelPtzTaskEditPop,
        }
    },
})
