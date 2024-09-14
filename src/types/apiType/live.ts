/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 11:31:57
 * @Description: 现场预览
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-14 12:01:45
 */
export class LiveChannelList {
    id = ''
    value = ''
    chlType = ''
    protocolType = ''
    supportPtz = false
    supportPTZGroupTraceTask = false
    supportAccessControl = false
    supportTalkback = false
}

export class LiveChannelGroupList {
    id = ''
    value = ''
    dwellTime = 0
}

export class LiveChlOfChannelGroupList {
    id = ''
    value = ''
}

export class LiveCustomViewChlList {
    chlId = ''
    chlIndex = 0
}

export class LiveCustomViewList {
    chlArr = [] as LiveCustomViewChlList[]
    historyPlay = ''
    segNum = 0
    value = ''
    id = 0
}

export class LiveAlarmList {
    id = ''
    name = ''
    switch = false
    delay = 0
}

export class LiveResolutionOptions {
    value = ''
    label = ''
    maxFps = 0
}

export class LiveQualityOptions {
    value = ''
    enct = ''
    res = ''
    chlType = ''
}

export class LiveStreamForm {
    resolution = ''
    frameRate = 0
    quality = ''
}

export class LiveLensForm {
    focusType = ''
    focusTime = 0
    irchangeFocus = false
}

export class LiveSharedWinData {
    PLAY_STATUS = 'stop' as 'play' | 'stop' | 'error'
    winIndex = 0
    seeking = false
    original = false
    audio = false
    magnify3D = false
    localRecording = false
    isPolling = false
    isDwellPlay = false
    groupID = ''
    timestamp = 0
    showWatermark = false
    showPos = false
    chlID = ''
    supportPtz = false
    chlName = ''
    streamType = 2
    talk = false
    supportAudio = true
}
