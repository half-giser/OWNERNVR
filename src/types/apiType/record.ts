/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-03 16:14:27
 * @Description: 录像与回放
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-08-12 13:53:22
 */

/**
 * 录像-模式配置
 */
export class RecordDistributeInfo {
    mode = '' // 录像模式类型
    autoMode = '' // 自动录像模式
    autoModeEvents = [] as string[] // 自动录像模式事件列表
    autoModeId = '' //自动模式Radio列表中选择的ID
    urgencyRecDuration = 0 // 手动录像时长
    recordScheduleList = [] as RecordSchedule[]
}
/**
 * 通道的录像排程配置
 */
export class RecordSchedule {
    id = '' //通道ID
    name = '' //通道名称
    alarmRec = '' //传感器录像排程
    motionRec = '' //移动侦测录像排程
    intelligentRec = '' //AI录像排程
    posRec = '' //POS录像排程
    scheduleRec = '' //定时录像排程
}

/**
 * 录像模式
 */
export interface RecMode {
    id: string
    text: string
    type: string
    events: string[]
    index: number //用于指定在自定义组合模式中出现的顺序
}

// 通道录像参数列表
export class ChlRecParamList {
    id = ''
    index = 0
    name = ''
    chlType = ''
    preRecordTimeNote = ''
    delayedRecordTimeNote = ''
    per = ''
    post = ''
    ANRSwitch = ''
    expiration = ''
    expirationUnit = ''
    expirationDisplay = ''
    manufacturerEnable = ''
    week = ''
    holiday = ''
    singleExpirationUnit = ''
}

// 页面选择项
export class ItemList {
    value = ''
    label = ''
}

// 录像子码流列表
export class RecordSubStreamList {
    id = ''
    index = 0
    name = ''
    isRTSPChl = ''
    chlType = ''
    subCaps = {
        supEnct: [] as string[],
        bitType: [] as string[],
        res: [] as { fps: string; value: string }[],
    }
    streamType = ''
    streamLength = 0
    resolution = ''
    frameRate = ''
    bitType = ''
    level = ''
    videoQuality = ''
    videoEncodeType = ''
    subStreamQualityCaps = []
    qualitys = [] as string[]
}

// 录像子码流页面，表格行中不存在的属性
export class rowNonExistent {
    videoEncodeType = ''
    videoQuality = ''
    frameRate = ''
    resolution = ''
}

// 录像码流信息
export class RecordStreamInfoDto {
    '@id' = ''
    name = ''
    streamType = ''
    videoEncodeType = ''
    resolution = ''
    frameRate = ''
    bitRate = ''
    level = ''
    videoQuality = ''
    bitRange: { min: number; max: number } | null = { min: 0, max: 0 }
    audio = ''
    recordStream = ''
    GOP = ''
    chlType = ''
    mainCaps = {
        // 可选的编码类型
        '@supEnct': [] as string[],
        // 可选的码率
        '@bitType': [] as string[],
        res: [] as { '@fps': string; value: string }[],
    }
    main = {
        '@enct': '',
        '@aGOP': '',
        '@mGOP': '',
    }
    an = {
        '@res': '',
        '@fps': '',
        '@QoI': '',
        '@audio': '',
        '@type': '',
        '@bitType': '',
        '@level': '',
    }
    ae = {
        '@res': '',
        '@fps': '',
        '@QoI': '',
        '@audio': '',
        '@type': '',
        '@bitType': '',
        '@level': '',
    }
    mn = {
        '@res': '',
        '@fps': '',
        '@QoI': '',
        '@audio': '',
        '@type': '',
        '@bitType': '',
        '@level': '',
    }
    me = {
        '@res': '',
        '@fps': '',
        '@QoI': '',
        '@audio': '',
        '@type': '',
        '@bitType': '',
        '@level': '',
    }
    mainStreamQualityCaps: { '@enct': string; '@res': string; '@digitalDefault': string; '@analogDefault': string; value: string[] }[] = []
    levelNote: string[] = []
    bitType = ''
    supportAudio = false
    // 码率可选范围
    qualitys = [] as { value: string; label: string }[]
    // 帧率可选范围
    frameRates = [] as { value: string; label: string }[]
    resolutions = [] as { value: string; label: string }[]
    // 元素禁用
    rowDisable = false
    videoEncodeTypeDisable = false
    resolutionDisable = false
    frameRateDisable = false
    bitTypeDisable = false
    imageLevelDisable = false
    videoQualityDisable = false
    bitRangeDisable = false
    audioDisable = false
    GOPDisable = false
    // recordStream可能没用
    recordStreamDisable = false

    bitTypeVisible = true
}
