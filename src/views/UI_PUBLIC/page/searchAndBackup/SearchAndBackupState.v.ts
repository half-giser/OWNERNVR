/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 13:47:43
 * @Description: 备份状态
 */
import { type PlaybackBackUpTaskList } from '@/types/apiType/playback'
import dayjs from 'dayjs'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()

        const plugin = usePluginHook({
            onReady: (mode, plugin) => {
                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Playback')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            },
            onDestroy: (mode, plugin) => {
                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_StopPreview('ALL')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            },
        })

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

        /**
         * 批量下发远程任务的暂停、继续请求
         * @param {Array} taskIdList 任务id列表
         * @param {String} action 执行动作 pause/resume
         */
        const editRecBackUpTask = async (taskIdList: string[], action: 'pause' | 'resume' | 'delete') => {
            const sendXml = rawXml`
                <content>
                    ${taskIdList.map((id) => `<item id="${id}">${action}</item>`).join('')}
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
                        startEndTime: startTime + '~' + endTime,
                        duration,
                        chlName: $item('chls/item').text(),
                        destination: 'remote', // Translate('IDCS_REMOTE'),
                        backupFileFormat: $item('backupFileFormat').text(),
                        backupPath: $('backupPath').text(),
                        creator: $('creator').text(),
                        dataSize: dataSize ? dataSize + 'MB' : '--',
                        eventType: $('eventType').text(),
                        progress: $('progress').text(),
                        status: $('status').text(),
                        chlIndex: 0,
                        startTime: '',
                        endTime: '',
                        startTimeEx: '',
                        endTimeEx: '',
                        chlId: $item('chls/item').attr('id'),
                        streamType: 0,
                        groupby: '',
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
        }

        /**
         * @description 暂停所有任务
         */
        const pauseAllTask = () => {
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
            editRecBackUpTask(
                remoteTableData.value.map((item) => item.taskId),
                'resume',
            )

            plugin.BackUpTask.resumeAllTask()
        }

        onMounted(() => {
            getRecBackUpTaskList()
        })

        return {
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
