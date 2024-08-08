/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 12:00:49
 * @Description: 录像与回放
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-06 14:35:47
 */

export class RecPlayList {
    chlId = ''
    chlName = ''
    eventList = [] as string[]
    startTime = '' // 日期格式为公历 YYYY-MM-DD HH:mm:ss
    endTime = '' // 日期格式为公历 YYYY-MM-DD HH:mm:ss
}

export class PlaybackChlList {
    id = ''
    value = ''
}

export class PlaybackChannelGroupList {
    id = ''
    value = ''
    dwellTime = 0
}

export class PlaybackEventList {
    value = ''
    name = ''
    children = [] as string[]
    color = ''
}

export class PlaybackBackUpTaskList {
    taskId = ''
    startEndTime = ''
    duration = ''
    // endTime = ''
    chlName = ''
    destination = ''
    backupFileFormat = ''
    backupPath = ''
    creator = ''
    dataSize = ''
    eventType = ''
    progress = ''
    status = ''
    chlIndex = 0
    chlId = ''
    startTime = ''
    endTime = ''
    startTimeEx = ''
    endTimeEx = ''
    streamType = 0
}

export class PlaybackRecLogList {
    chlId = ''
    chlName = ''
    startTime = 0 // 开始时间戳（UTC）
    endTime = 0 // 结束时间戳（UTC）
    event = ''
    recSubType = ''
    size = ''
    duration = ''
}

export class PlaybackRecList {
    chlId = ''
    chlName = ''
    records = [] as {
        startTime: number
        endTime: number
        event: string
        size: string
        duration: string
        recSubType: string
    }[]
    timeZone = ''
}

export class PlaybackBackUpRecList {
    chlId = ''
    chlName = ''
    events = [] as string[]
    startTime = 0
    endTime = 0
    streamType = 1 // 码流类型 0主码流 1子码流
}

export class PlaybackBackUpUserAuth {
    // 是否拥有全部权限
    hasAll = false
    ad = {} as Record<string, boolean>
    // bk = {} as Record<string, boolean>
    // spr = {} as Record<string, boolean>
}
