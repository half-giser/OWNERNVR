/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-08 17:43:50
 * @Description: OCX备份列表模块
 */
import { type XMLQuery } from '@/utils/xmlParse'
import dayjs from 'dayjs'

export const useOcxBackUp = (cmd: (str: string) => void) => {
    const userSession = useUserSessionStore()
    const { Translate } = useLangStore()
    const dateTime = useDateTimeStore()

    // OCX本地下载任务限制
    const LOCAL_TASK_COUNT_LIMIT = 100
    let chlIndex = -1

    // 本地任务列表（OCX）
    const localTableData = ref<PlaybackBackUpTaskList[]>([])

    const HEARTBEAT_TIME = 60000
    let timer: NodeJS.Timeout | number = 0

    /**
     * @description 恢复所有任务
     */
    const resumeAllTask = () => {
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
        cmd(sendXML)
    }

    /**
     * @description OCX模式本地下载
     * @param {Object} backupList
     */
    const createLocalBackUpTask = (backupList: PlaybackBackUpTaskList[]) => {
        backupList.forEach((item) => {
            const sendXML = OCX_XML_BackUpRecList(
                item.backupFileFormat,
                item.backupPath,
                item.groupby,
                item.streamType === 0 ? true : false,
                item.eventType.split(',').map((event) => {
                    return {
                        chlName: item.chlName,
                        chlId: item.chlId,
                        chlIndex: item.chlIndex,
                        startTime: item.startTime,
                        endTime: item.endTime,
                        event: event,
                        startTimeEx: item.startTimeEx,
                        endTimeEx: item.endTimeEx,
                        duration: item.duration,
                    }
                }),
            )
            cmd(sendXML)
        })
    }

    /**
     * @description 删除所有任务
     */
    const deleteAllTask = () => {
        const taskIds = localTableData.value.filter((item) => ['pause', 'ongoing'].includes(item.status)).map((item) => item.taskId)
        const sendXML = OCX_XML_BackUpRecOperate('StopBackUpRec', taskIds)
        cmd(sendXML)
        localTableData.value = []
    }

    /**
     * @description 暂停所有任务
     */
    const pauseAllTask = () => {
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
        cmd(sendXML)
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

    const normalTaskNum = computed(() => {
        return localTableData.value.filter((item) => !['failed', 'complete'].includes(item.status)).length
    })

    /**
     * @description 判断本地下载数量是否超出限制
     * @param {Number} addNum
     * @returns {Boolean}
     */
    const isExeed = (addNum: number) => {
        return normalTaskNum.value + addNum > LOCAL_TASK_COUNT_LIMIT
    }

    /**
     * @description 任务暂停
     * @param {Object} row
     */
    const pauseTask = (row: PlaybackBackUpTaskList) => {
        const findIndex = localTableData.value.findIndex((item) => item.taskId === row.taskId)
        if (findIndex > -1) {
            if (localTableData.value[findIndex].status === 'ongoing') {
                localTableData.value[findIndex].status = 'pause'
                const sendXML = OCX_XML_BackUpRecOperate('PauseBackUpRec', [row.taskId])
                cmd(sendXML)
            } else {
                localTableData.value[findIndex].status = 'pending_pause'
            }
        }
    }

    /**
     * @description 任务恢复下载
     * @param {Object} row
     */
    const resumeTask = (row: PlaybackBackUpTaskList) => {
        const findIndex = localTableData.value.findIndex((item) => item.taskId === row.taskId)
        if (findIndex > -1) {
            if (['pending', 'pending_pause'].includes(localTableData.value[findIndex].status)) {
                createLocalBackUpTask([localTableData.value[findIndex]])
            } else {
                const sendXML = OCX_XML_BackUpRecOperate('ContinueBackUpRec', [row.taskId])
                cmd(sendXML)
            }
            localTableData.value[findIndex].status = 'ongoing'
        }
    }

    /**
     * @description 删除任务
     * @param {Object} row
     */
    const deleteTask = (row: PlaybackBackUpTaskList) => {
        const findIndex = localTableData.value.findIndex((item) => item.taskId === row.taskId)
        if (findIndex > -1) {
            if (['pause', 'ongoing'].includes(localTableData.value[findIndex].status)) {
                const sendXML = OCX_XML_BackUpRecOperate('StopBackUpRec', [row.taskId])
                cmd(sendXML)
            }
            localTableData.value.splice(findIndex, 1)
            nextProcess()
        }
    }

    const errorCodeMap: Record<number, string> = {
        [ErrorCode.USER_ERROR_NO_AUTH]: Translate('IDCS_NODE_NO_AUTH').formatForLang(''),
        513: Translate('IDCS_NO_RECORD_DATA'),
        [ErrorCode.USER_ERROR_SYSTEM_BUSY]: Translate('IDCS_DEVICE_BUSY'),
    }

    /**
     * @description OCX通知回调
     * @param {XMLQuery} $
     */
    const notify = ($: XMLQuery, stateType: string) => {
        // 备份通知
        if (stateType === 'BackUpRec') {
            // var backupTaskGrid = $("#backupTaskGrid");
            const errorCode = $('statenotify/errorCode').text().num()

            if (errorCodeMap[errorCode]) {
                const taskIds = $('statenotify/errorDescription').text().array()
                if (errorCode === ErrorCode.USER_ERROR_SYSTEM_BUSY) {
                    resendTask(taskIds)
                } else {
                    localTableData.value.forEach((item) => {
                        if (taskIds.includes(item.taskId)) {
                            item.status = 'failed'
                            item.statusTip = errorCodeMap[errorCode]
                            nextProcess()
                        }
                    })
                }
            } else if (errorCode === 2) {
                openMessageBox($('statenotify/errorDescription').text())
            } else if (errorCode === ErrorCode.USER_ERROR_DISK_SPACE_NO_ENOUGH) {
                const errorDescription = $('statenotify/errorDescription').text()
                // localTableData.value = []
                // openMessageBox(errorDescription)
                localTableData.value.forEach((item) => {
                    if (item.status !== 'complete') {
                        item.status = 'failed'
                        item.statusTip = errorDescription
                    }
                })
                openMessageBox(errorDescription)
            }
        }

        //备份任务通知
        if (stateType === 'BackUpRecTasks') {
            const taskItems = $('statenotify/tasks/item')

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
                const findIndex = localTableData.value.findIndex((data) => data.chlIndex === item.attr('chlIndex').num())
                if (findIndex > -1) {
                    localTableData.value[findIndex].dataSize = item.attr('size') === '0.0MB' ? '--' : item.attr('size')
                    localTableData.value[findIndex].taskId = item.attr('id')
                    if (localTableData.value[findIndex].status !== 'complete') {
                        localTableData.value[findIndex].status = 'ongoing'
                    }
                }
            })
        }

        //备份任务进度通知
        if (stateType === 'BackUpRecProgress') {
            $('statenotify/tasks/item').forEach((item) => {
                const taskId = item.attr('id')
                const progress = item.text()
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
     * @description 增加本地备份任务
     * @param {Array} list
     * @param {String} path
     * @param {String} format
     */
    const addTask = (list: PlaybackBackUpRecList[], path: string, format: string, groupby = 'chlId') => {
        // 本地Creator
        const LOCAL_CREATOR = userSession.userName
        list.forEach((item) => {
            chlIndex++
            localTableData.value.push({
                taskId: '',
                chlIndex,
                startEndTime: formatDate(item.startTime, dateTime.dateTimeFormat) + '~' + formatDate(item.endTime, dateTime.dateTimeFormat),
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
                startTime: formatGregoryDate(item.startTime),
                endTime: formatGregoryDate(item.endTime),
                startTimeEx: localToUtc(item.startTime),
                endTimeEx: localToUtc(item.endTime),
                streamType: item.streamType,
                groupby,
                disabled: false,
                statusTip: '',
            })
        })
        nextProcess()
    }

    /**
     * @description 开始心跳检测
     */
    const startHeartbeat = () => {
        stopHeartbeat()
        timer = setInterval(() => {
            heartBeat()
        }, HEARTBEAT_TIME)
    }

    /**
     * @description 停止心跳检测
     */
    const stopHeartbeat = () => {
        clearInterval(timer)
    }

    onBeforeUnmount(() => {
        stopHeartbeat()
    })

    watch(normalTaskNum, (val, oldVal) => {
        if (val === 0) {
            stopHeartbeat()
        } else if (val > 0 && oldVal === 0) {
            startHeartbeat()
        }
    })

    return {
        localTableData,
        isExeed,
        resumeAllTask,
        pauseAllTask,
        deleteAllTask,
        resumeTask,
        pauseTask,
        deleteTask,
        addTask,
        notify,
        limit: LOCAL_TASK_COUNT_LIMIT,
    }
}
