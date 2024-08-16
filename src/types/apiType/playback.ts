/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 12:00:49
 * @Description: 录像与回放
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-13 17:22:20
 */

export class RecPlayList {
    chlId = ''
    chlName = ''
    eventList = [] as string[]
    startTime = '' // 日期格式为公历 YYYY-MM-DD HH:mm:ss
    endTime = '' // 日期格式为公历 YYYY-MM-DD HH:mm:ss
}

export class PlaybackPopList {
    chlId = ''
    chlName = ''
    eventList = [] as string[]
    startTime = 0 // 时间戳 （毫秒）
    endTime = 0 // 时间戳 （毫秒）
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
    groupby = 'chlId'
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
    timeZone = ''
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

export class PlaybackSearchImgList {
    index = 0
    chlId = ''
    chlName = ''
    creator = ''
    captureMode = 0
    captureModeKey = ''
    captureTimeStamp = 0
    captureTime = ''
}

export class PlaybackSearchImgForm {
    startTime = ''
    endTime = ''
    pageIndex = 1
    pageSize = 50
    sortType = ''
    sortField = ''
}

export class PlaybackTimeSliceList {
    startTime = 0
    endTime = 0
    chlList = [] as PlaybackTimeSliceChlList[]
}

export class PlaybackTimeSliceChlList {
    chlId = ''
    chlName = ''
    imgUrl = ''
    frameTime = 0
    taskId = ''
}

export class PlaybackChlTimeSliceList {
    imgUrl = ''
    frameTime = 0
    taskId = ''
    startTime = 0
    endTime = 0
}

// export class PlaybackTimeSliceChlList {
//     id = ''
//     value = ''
//     imgUrl = ''
// }
