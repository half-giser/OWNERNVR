/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 13:47:43
 * @Description: 备份状态
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-14 16:57:42
 */
import { type PlaybackBackUpTaskList } from '@/types/apiType/playback'
import dayjs from 'dayjs'

export default defineComponent({
    setup() {
        const Plugin = inject('Plugin') as PluginType
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()

        const mode = computed(() => {
            return Plugin.IsSupportH5() ? 'h5' : 'ocx'
        })

        // 任务列表刷新间隔3秒
        const REFRESH_IMTERVAL = 3000
        // 任务列表刷新定时器
        let timer: NodeJS.Timeout | number = 0

        // 本地任务列表（OCX）
        const localTableData = computed(() => {
            return Plugin.BackUpTask.localTableData.value
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
            clearTimeout(timer)

            const result = await queryRecBackupTaskList()
            const $ = queryXml(result)

            if ($('//status').text() === 'success') {
                remoteTableData.value = $('//content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const startTime = $item('startTime').text()
                    const endTime = $item('endTime').text()
                    const duration = dayjs(new Date(endTime).getTime() - new Date(startTime).getTime()).format('HH:mm:ss')
                    const dataSize = $item('dataSize').text()

                    return {
                        taskId: item.attr('id')!,
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
                        chlId: $item('chls/item').attr('id')!,
                        streamType: 0,
                        groupby: '',
                    }
                })
                if (remoteTableData.value.length) {
                    timer = setTimeout(() => {
                        getRecBackUpTaskList()
                    }, REFRESH_IMTERVAL)
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
                Plugin.BackUpTask.pauseTask(row)
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
                Plugin.BackUpTask.resumeTask(row)
            }
        }

        /**
         * @description 删除任务
         * @param {Object} row
         */
        const deleteTask = (row: PlaybackBackUpTaskList) => {
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_ARCHIVE_S'),
            }).then(() => {
                if (row.destination === 'remote') {
                    editRecBackUpTask([row.taskId], 'delete')
                } else {
                    Plugin.BackUpTask.deleteTask(row)
                }
            })
        }

        /**
         * @description 删除所有任务
         */
        const deleteAllTask = () => {
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_DELETE_ALL_ARCHIVE'),
            }).then(() => {
                editRecBackUpTask(
                    remoteTableData.value.map((item) => item.taskId),
                    'delete',
                )
                Plugin.BackUpTask.deleteAllTask()
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
            Plugin.BackUpTask.pauseAllTask()
        }

        /**
         * @description 恢复所有任务
         */
        const resumeAllTask = () => {
            editRecBackUpTask(
                remoteTableData.value.map((item) => item.taskId),
                'resume',
            )

            Plugin.BackUpTask.resumeAllTask()
        }

        watch(
            mode,
            (newVal) => {
                if (newVal !== 'h5' && !Plugin.IsPluginAvailable()) {
                    Plugin.SetPluginNoResponse()
                    Plugin.ShowPluginNoResponse()
                }

                if (newVal === 'ocx') {
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Playback')
                    Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            },
            {
                immediate: true,
            },
        )

        onMounted(() => {
            Plugin.SetPluginNotice('#layout2Main')
            getRecBackUpTaskList()
        })

        onBeforeUnmount(() => {
            clearTimeout(timer)
            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
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
