/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 12:00:49
 * @Description: 回放与备份的类型定义，类型命名的前缀统一为Playback*
 */

/**
 * @description 回放 通道列表项
 */
export class PlaybackChlList {
    id = ''
    value = ''
}

/**
 * @description 回放 通道组列表项
 */
export class PlaybackChannelGroupList {
    id = ''
    value = ''
    dwellTime = 0
    nameMaxByteLen = 63
}

/**
 * @description 回放 事件列表项
 */
export class PlaybackEventList {
    value = ''
    name = ''
    children: string[] = []
    color = ''
}

/**
 * @description 回放 备份任务列表项
 */
export class PlaybackBackUpTaskList extends TableRowStatus {
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

/**
 * @description 回放 录像日志列表项
 */
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

/**
 * @description 回放 录像列表项
 */
export class PlaybackRecList {
    chlId = ''
    chlName = ''
    records: {
        startTime: number
        endTime: number
        event: string
        size: string
        duration: string
        recSubType: string
        eventColorType?: string
    }[] = []
    timeZone = ''
}

/**
 * @description 备份 录像列表项
 */
export class PlaybackBackUpRecList {
    chlId = ''
    chlName = ''
    events: string[] = []
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

/**
 * @description 按图像备份 搜索表单
 */
export class PlaybackSearchImgForm {
    startTime = ''
    endTime = ''
    pageIndex = 1
    pageSize = 50
    sortType = ''
    sortField = ''
}

/**
 * @description 按时间切片 列表项
 */
export class PlaybackTimeSliceList {
    startTime = 0
    endTime = 0
    chlList: PlaybackTimeSliceChlList[] = []
}

/**
 * @description 按时间切片 通道列表项
 */
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

/**
 * @description 回放弹窗 通道列表
 */
export class PlaybackPopList {
    chlId = ''
    chlName = ''
    eventList: string[] = []
    startTime = 0 // 时间戳 （毫秒）
    endTime = 0 // 时间戳 （毫秒）
}
