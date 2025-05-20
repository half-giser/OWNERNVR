/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 11:31:57
 * @Description: 现场预览的类型定义，类型命名的前缀统一为Live*
 */

/**
 * @description 现场预览 通道列表项
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
    chlIp = ''
    poeSwitch = false
}

/**
 * @description 现场预览 通道组列表项
 */
export class LiveChannelGroupList {
    id = ''
    value = ''
    dwellTime = 0
}

/**
 * @description 现场预览 通道组通道列表项
 */
export class LiveChlOfChannelGroupList {
    id = ''
    value = ''
}

/**
 * @description 现场预览 自定义视图通道列表项
 */
export class LiveCustomViewChlList {
    chlId = ''
    chlIndex = 0
}

/**
 * @description 现场预览 自定义视图列表项
 */
export class LiveCustomViewList {
    chlArr: LiveCustomViewChlList[] = []
    historyPlay = ''
    segNum = 0
    value = ''
    id = 0
}

/**
 * @description 现场预览 报警列表项
 */
export class LiveAlarmList {
    id = ''
    name = ''
    switch = false
    delay = 0
}

/**
 * @description 现场预览 分辨率选项
 */
export class LiveResolutionOptions {
    value = ''
    label = ''
    maxFps = 0
}

/**
 * @description 现场预览 质量选项
 */
export class LiveQualityOptions {
    value = ''
    enct = ''
    res = ''
    chlType = ''
}

/**
 * @description 现场预览 码流表单
 */
export class LiveStreamForm {
    resolution = ''
    frameRate = 0
    quality = ''
}

/**
 * @description 现场预览 镜头 表单
 */
export class LiveLensForm {
    focusType = ''
    focusTime = 0
    irchangeFocus = false
}

/**
 * @description 现场预览 窗口数据
 */
export class LiveSharedWinData {
    PLAY_STATUS: 'play' | 'stop' | 'error' = 'stop'
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
