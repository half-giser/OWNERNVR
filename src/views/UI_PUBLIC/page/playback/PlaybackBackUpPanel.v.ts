/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:36:12
 * @Description: 回放-备份任务列表
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-08 11:03:34
 */
import { type PlaybackBackUpTaskList } from '@/types/apiType/playback'
import { type XMLQuery } from '@/utils/xmlParse'
import dayjs from 'dayjs'
import { type PlaybackBackUpRecList } from '@/types/apiType/playback'

export interface BackUpPanelExpose {
    isExeed: (len: number) => boolean
    addLocalBackUpList: (list: PlaybackBackUpRecList[], path: string, format: string) => void
}

export default defineComponent({
    props: {
        visible: Boolean,
        mode: String,
    },
    emits: {
        'update:visible'(bool: Boolean) {
            return typeof bool === 'boolean'
        },
    },
    setup(prop, ctx) {
        const Plugin = inject('Plugin') as PluginType
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const userSession = useUserSessionStore()

        // OCX本地下载任务限制
        const LOCAL_TASK_COUNT_LIMIT = 100
        // 本地Creator
        const LOCAL_CREATOR = userSession.getAuthInfo() ? userSession.getAuthInfo()![0] : ''
        // 任务列表刷新间隔3秒
        const REFRESH_IMTERVAL = 3000

        let timer: NodeJS.Timeout | number = 0 // 任务列表刷新定时器
        let chlIndex = -1

        // 本地任务列表（OCX）
        const localTableData = ref<PlaybackBackUpTaskList[]>([])
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
                    ${taskIdList.map((id) => `<item id="${id}">${action}</item>`).join('')}
                </content>
            `
            await ctrlRecBackupTask(sendXml)
            getRecBackUpTaskList()
        }

        /**
         * @description OCX模式本地下载
         * @param {Object} backupList
         */
        const createLocalBackUpTask = (backupList: PlaybackBackUpTaskList[]) => {
            backupList.forEach((item) => {
                const sendXML = OCX_XML_BackUpRecList(item.backupFileFormat, item.backupPath, item.streamType === 0 ? true : false, [
                    {
                        chlName: item.chlName,
                        chlId: item.chlId,
                        chlIndex: item.chlIndex,
                        startTime: item.startTime,
                        endTime: item.endTime,
                        event: item.eventType,
                        startTimeEx: item.startTimeEx,
                        endTimeEx: item.endTimeEx,
                        duration: item.duration,
                    },
                ])
                Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            })
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

            if ($('/response/status').text() === 'success') {
                remoteTableData.value = $('/response/content/item').map((item) => {
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
                const findIndex = localTableData.value.findIndex((item) => item.taskId === row.taskId)
                if (findIndex > -1) {
                    if (localTableData.value[findIndex].status === 'ongoing') {
                        localTableData.value[findIndex].status = 'pause'
                        const sendXML = OCX_XML_BackUpRecOperate('PauseBackUpRec', [row.taskId])
                        Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    } else {
                        localTableData.value[findIndex].status = 'pending_pause'
                    }
                }
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
                const findIndex = localTableData.value.findIndex((item) => item.taskId === row.taskId)
                if (findIndex > -1) {
                    if (['pending', 'pending_pause'].includes(localTableData.value[findIndex].status)) {
                        createLocalBackUpTask([localTableData.value[findIndex]])
                    } else {
                        const sendXML = OCX_XML_BackUpRecOperate('ContinueBackUpRec', [row.taskId])
                        Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                    localTableData.value[findIndex].status = 'ongoing'
                }
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
                    const findIndex = localTableData.value.findIndex((item) => item.taskId === row.taskId)
                    if (findIndex > -1) {
                        if (['pause', 'ongoing'].includes(localTableData.value[findIndex].status)) {
                            const sendXML = OCX_XML_BackUpRecOperate('StopBackUpRec', [row.taskId])
                            Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }
                        localTableData.value.splice(findIndex, 1)
                        nextProcess()
                    }
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

                const taskIds = localTableData.value.filter((item) => ['pause', 'ongoing'].includes(item.status)).map((item) => item.taskId)
                const sendXML = OCX_XML_BackUpRecOperate('StopBackUpRec', taskIds)
                Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                localTableData.value = []
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
            const runningList = localTableData.value
                .filter((item) => {
                    if (item.status === 'ongoing') {
                        item.status = 'pause'
                        return true
                    } else if (item.status === 'pending') {
                        item.status = 'pending_pause'
                        return false
                    } else {
                        return false
                    }
                })
                .map((item) => item.taskId)
            const sendXML = OCX_XML_BackUpRecOperate('PauseBackUpRec', runningList)
            Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
        }

        /**
         * @description 恢复所有任务
         */
        const resumeAllTask = () => {
            editRecBackUpTask(
                remoteTableData.value.map((item) => item.taskId),
                'resume',
            )

            const pendingList = localTableData.value.filter((item) => {
                if (['pending', 'pending_pause'].includes(item.status)) {
                    item.status = 'ongoing'
                    return true
                }
                return false
            })
            createLocalBackUpTask(pendingList)

            const pauseList = localTableData.value
                .filter((item) => {
                    if (item.status === 'pause') {
                        item.status = 'ongoing'
                        return true
                    }
                    return false
                })
                .map((item) => item.taskId)
            const sendXML = OCX_XML_BackUpRecOperate('ContinueBackUpRec', pauseList)
            Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
        }

        /**
         * @description 系统繁忙 重新开始备份任务
         * @param {Array} taskIds
         */
        const resendTask = (taskIds: string[]) => {
            createLocalBackUpTask(localTableData.value.filter((item) => taskIds.includes(item.taskId)))
        }

        /**
         * @description 处理下一个备份任务
         */
        const nextProcess = () => {
            if (localTableData.value.some((item) => item.status === 'ongoing')) {
                return
            }
            const findIndex = localTableData.value.findIndex((item) => item.status === 'pending')
            if (findIndex > -1) {
                localTableData.value[findIndex].status = 'ongoing'
                createLocalBackUpTask([localTableData.value[findIndex]])
            }
        }

        /**
         * @description OCX通知回调
         * @param {XMLQuery} $
         */
        const notify = ($: XMLQuery) => {
            // 备份通知
            if ($('statenotify[@type="BackUpRec"]').length) {
                // var backupTaskGrid = $("#backupTaskGrid");
                const errorCode = Number($('statenotify[@type="BackUpRec"]/errorCode').text())

                if ([ErrorCode.USER_ERROR_NO_AUTH, 513, ErrorCode.USER_ERROR_SYSTEM_BUSY].includes(errorCode)) {
                    const taskIds = $("statenotify[@type='BackUpRec']/errorDescription").text().split(',')
                    if (errorCode === ErrorCode.USER_ERROR_SYSTEM_BUSY) {
                        resendTask(taskIds)
                    } else {
                        localTableData.value.forEach((item) => {
                            if (taskIds.includes(item.taskId)) {
                                item.status = 'failed'
                                nextProcess()
                            }
                        })
                    }
                } else if (errorCode == ErrorCode.USER_ERROR_DISK_SPACE_NO_ENOUGH) {
                    const errorDescription = $('statenotify[@type="BackUpRec"]/errorDescription').text()
                    localTableData.value = []
                    openMessageTipBox({
                        type: 'info',
                        message: errorDescription,
                    })
                }
            }
            //备份任务通知
            else if ($("statenotify[@type='BackUpRecTasks']").length) {
                const taskItems = $("statenotify[@type='BackUpRecTasks']/tasks/item")

                // 清理已完成或失败的数据
                if (localTableData.value.length > LOCAL_TASK_COUNT_LIMIT) {
                    for (let i = localTableData.value.length--; i >= 0; i--) {
                        if (['complete', 'failed'].includes(localTableData.value[i].status)) {
                            localTableData.value.splice(i, 1)
                        }
                        if (localTableData.value.length <= LOCAL_TASK_COUNT_LIMIT) {
                            break
                        }
                    }
                }

                taskItems.forEach((item) => {
                    console.log(item.attr('size')!)
                    const findIndex = localTableData.value.findIndex((data) => data.chlIndex === Number(item.attr('chlIndex')!))
                    if (findIndex > -1) {
                        localTableData.value[findIndex].dataSize = item.attr('size')! === '0.0MB' ? '--' : item.attr('size')!
                        localTableData.value[findIndex].taskId = item.attr('id')!
                        if (localTableData.value[findIndex].status !== 'complete') {
                            localTableData.value[findIndex].status = 'ongoing'
                        }
                    }
                })
            }
            //备份任务进度通知
            else if ($("statenotify[@type='BackUpRecProgress']").length) {
                $("statenotify[@type='BackUpRecProgress']/tasks/item").forEach((item) => {
                    const taskId = item.attr('id')
                    const progress = item.text()
                    console.log(taskId, progress)
                    const findIndex = localTableData.value.findIndex((item) => item.taskId === taskId)
                    if (findIndex > -1) {
                        localTableData.value[findIndex].progress = progress
                        if (progress === '100%' && localTableData.value[findIndex].status !== 'complete') {
                            localTableData.value[findIndex].status = 'complete'
                            nextProcess()
                        }
                    }
                })
            }
        }

        /**
         * @description 判断本地下载数量是否超出限制
         * @param {Number} addNum
         * @returns {Boolean}
         */
        const isExeed = (addNum: number) => {
            return localTableData.value.filter((item) => !['failed', 'complete'].includes(item.status)).length + addNum > LOCAL_TASK_COUNT_LIMIT
        }

        /**
         * @description 增加本地备份任务
         * @param {Array} list
         * @param {String} path
         * @param {String} format
         */
        const addLocalBackUpList = (list: PlaybackBackUpRecList[], path: string, format: string) => {
            list.forEach((item) => {
                chlIndex++
                localTableData.value.push({
                    taskId: '',
                    chlIndex,
                    startEndTime: formatDate(item.endTime) + '~' + formatDate(item.startTime),
                    duration: dayjs.utc(item.endTime - item.startTime).format('HH:mm:ss'),
                    chlName: item.chlName,
                    destination: 'local', // Translate('IDCS_LOCAL'),
                    backupFileFormat: format,
                    backupPath: path,
                    creator: LOCAL_CREATOR,
                    dataSize: '--',
                    eventType: item.events.join(','),
                    progress: '0%',
                    status: 'pending',
                    chlId: item.chlId,
                    startTime: formatDate(item.startTime),
                    endTime: formatDate(item.endTime),
                    startTimeEx: localToUtc(item.startTime),
                    endTimeEx: localToUtc(item.endTime),
                    streamType: item.streamType,
                })
            })
            nextProcess()
        }

        watch(
            () => prop.visible,
            (newVal) => {
                if (newVal) {
                    getRecBackUpTaskList()
                } else {
                    clearTimeout(timer)
                }
                pageData.value.visible = prop.visible
            },
        )

        onMounted(() => {
            console.log('notify')
            Plugin.VideoPluginNotifyEmitter.addListener(notify)
        })

        onBeforeUnmount(() => {
            clearTimeout(timer)
            Plugin.VideoPluginNotifyEmitter.removeListener(notify)
        })

        ctx.expose({
            isExeed,
            addLocalBackUpList,
        })

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
