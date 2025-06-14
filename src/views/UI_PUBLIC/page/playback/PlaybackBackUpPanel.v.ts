/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:36:12
 * @Description: 回放-备份任务列表
 */
import dayjs from 'dayjs'

export default defineComponent({
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        mode: {
            type: String,
            required: true,
        },
    },
    emits: {
        'update:visible'(bool: Boolean) {
            return typeof bool === 'boolean'
        },
    },
    setup(prop, ctx) {
        const plugin = usePlugin()
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        // 任务列表刷新间隔3秒
        const REFRESH_IMTERVAL = 3000
        // 任务列表刷新定时器
        const timer = useRefreshTimer(() => {
            getRecBackUpTaskList()
        }, REFRESH_IMTERVAL)

        // 本地任务列表（OCX）
        const localTableData = computed(() => {
            return plugin.BackUpTask.localTableData.value
        })
        // 远程任务列表
        const remoteTableData = ref<PlaybackBackUpTaskList[]>([])

        // 任务列表
        const tableData = computed(() => {
            return [...localTableData.value, ...remoteTableData.value]
        })

        const pageData = ref({
            visible: false,
        })

        /**
         * 批量下发远程任务的暂停、继续请求
         * @param {Array} taskIdList 任务id列表
         * @param {String} action 执行动作 pause/resume
         */
        const editRecBackUpTask = async (taskIdList: string[], action: 'pause' | 'resume' | 'delete') => {
            const sendXml = rawXml`
                <content>
                    ${taskIdList
                        .map((id) => {
                            return rawXml`
                                <item id="${id}">
                                    <action>${action}</action>
                                </item>`
                        })
                        .join('')}
                </content>
            `
            await ctrlRecBackupTask(sendXml)
            getRecBackUpTaskList()
        }

        /**
         * @description destination显示文本
         * @param {string} type
         * @returns {String}
         */
        const displayDestination = (type: string) => {
            if (type === 'remote') {
                return Translate('IDCS_REMOTE')
            }
            return Translate('IDCS_LOCAL')
        }

        /**
         * @description 获取任务列表
         */
        const getRecBackUpTaskList = async () => {
            timer.stop()

            const result = await queryRecBackupTaskList()
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                remoteTableData.value = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const startTime = $item('startTime').text()
                    const endTime = $item('endTime').text()
                    const duration = dayjs(new Date(endTime).getTime() - new Date(startTime).getTime()).format('HH:mm:ss')
                    const dataSize = $item('dataSize').text()

                    return {
                        taskId: item.attr('id'),
                        startEndTime: formatDate(startTime, dateTime.dateTimeFormat) + '~' + formatDate(endTime, dateTime.dateTimeFormat),
                        duration,
                        chlName: $item('chls/item').text(),
                        destination: 'remote',
                        backupFileFormat: $item('backupFileFormat').text(),
                        backupPath: $item('backupPath').text(),
                        creator: $item('creator').text(),
                        dataSize: dataSize ? dataSize + 'MB' : '--',
                        eventType: $item('eventType').text(),
                        progress: $item('progress').text(),
                        status: $item('status').text(),
                        chlIndex: 0,
                        startTime: '',
                        endTime: '',
                        startTimeEx: '',
                        endTimeEx: '',
                        chlId: $item('chls/item').attr('id'),
                        streamType: 0,
                        groupby: '',
                        disabled: false,
                        statusTip: '',
                    }
                })
                if (remoteTableData.value.length) {
                    timer.repeat()
                }
            }
        }

        /**
         * @description 任务暂停
         * @param {Object} row
         */
        const pauseTask = (row: PlaybackBackUpTaskList) => {
            if (row.destination === 'remote') {
                editRecBackUpTask([row.taskId], 'pause')
            } else {
                plugin.BackUpTask.pauseTask(row)
            }
        }

        /**
         * @description 任务恢复下载
         * @param {Object} row
         */
        const resumeTask = (row: PlaybackBackUpTaskList) => {
            if (row.destination === 'remote') {
                editRecBackUpTask([row.taskId], 'resume')
            } else {
                plugin.BackUpTask.resumeTask(row)
            }
        }

        /**
         * @description 删除任务
         * @param {Object} row
         */
        const deleteTask = (row: PlaybackBackUpTaskList) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_ARCHIVE_S'),
            }).then(() => {
                if (row.destination === 'remote') {
                    editRecBackUpTask([row.taskId], 'delete')
                } else {
                    plugin.BackUpTask.deleteTask(row)
                }
            })
        }

        /**
         * @description 删除所有任务
         */
        const deleteAllTask = () => {
            setTimeout(() => {
                ctx.emit('update:visible', true)
                setTimeout(() => {
                    openMessageBox({
                        type: 'question',
                        message: Translate('IDCS_DELETE_ALL_ARCHIVE'),
                    }).then(() => {
                        editRecBackUpTask(
                            remoteTableData.value.map((item) => item.taskId),
                            'delete',
                        )
                        plugin.BackUpTask.deleteAllTask()
                    })
                }, 10)
            }, 0)
        }

        /**
         * @description 暂停所有任务
         */
        const pauseAllTask = () => {
            setTimeout(() => {
                ctx.emit('update:visible', true)
            }, 0)
            editRecBackUpTask(
                remoteTableData.value.map((item) => item.taskId),
                'pause',
            )
            plugin.BackUpTask.pauseAllTask()
        }

        /**
         * @description 恢复所有任务
         */
        const resumeAllTask = () => {
            setTimeout(() => {
                ctx.emit('update:visible', true)
            }, 0)
            editRecBackUpTask(
                remoteTableData.value.map((item) => item.taskId),
                'resume',
            )

            plugin.BackUpTask.resumeAllTask()
        }

        watch(
            () => prop.visible,
            (newVal) => {
                if (newVal) {
                    timer.repeat(true)
                } else {
                    timer.stop()
                }
                pageData.value.visible = prop.visible
            },
        )

        return {
            pageData,
            tableData,
            localTableData,
            remoteTableData,
            pauseTask,
            resumeTask,
            deleteTask,
            pauseAllTask,
            resumeAllTask,
            deleteAllTask,
            displayDestination,
        }
    },
})
