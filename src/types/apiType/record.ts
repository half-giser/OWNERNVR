/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-03 16:14:27
 * @Description: 录像配置的类型定义，类型命名的前缀统一为Record*
 */
import { TableRowStatus } from './base'

/**
 * @description 录像-模式配置
 */
export class RecordDistributeInfoDto {
    mode = '' // 录像模式类型
    autoMode = '' // 自动录像模式
    autoModeEvents: string[] = [] // 自动录像模式事件列表
    autoModeId = '' //自动模式Radio列表中选择的ID
    urgencyRecDuration = 0 // 手动录像时长
    // recordScheduleList: RecordScheduleDto[] = []
}

/**
 * @description 通道的录像排程配置
 */
export class RecordScheduleDto extends TableRowStatus {
    id = '' //通道ID
    name = '' //通道名称
    alarmRec = '' //传感器录像排程
    motionRec = '' //移动侦测录像排程
    intelligentRec = '' //AI录像排程
    posRec = '' //POS录像排程
    scheduleRec = '' //定时录像排程
    allEventRec = '' //全事件录像排程
}

/**
 * @description 录像模式
 */
export interface RecordModeDto {
    id: string
    text: string
    type: string
    events: string[]
    index: number //用于指定在自定义组合模式中出现的顺序
    disabled?: boolean
}

/**
 * @description 通道录像参数列表
 */
export class RecordParamDto extends TableRowStatus {
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
    manufacturerEnable = false
    expirationDisplay = ''
    week = ''
    holiday = ''
    singleExpirationUnit = ''
}

/**
 * @description 通道录像参数表单
 */
export class RecordParamForm {
    loopRecSwitch = false
    doubleStreamRecSwitch = 'double'
}

/**
 * @description
 */
export class RecordStreamQualityCapsDto {
    enct = ''
    res = ''
    digitalDefault = 0
    analogDefault = 0
    value: string[] = []
}

/**
 * @description 录像子码流列表
 */
export class RecordSubStreamList extends TableRowStatus {
    id = ''
    index = 0
    name = ''
    isRTSPChl = false
    chlType = ''
    subCaps = {
        supEnct: [] as SelectOption<string, string>[],
        bitType: [] as string[],
        res: [] as { fps: number; value: string; label: string }[],
    }
    streamType = ''
    streamLength = 0
    resolution = ''
    frameRate = 0
    bitType = ''
    level = ''
    videoQuality = 0
    videoEncodeType = ''
    subStreamQualityCaps: RecordStreamQualityCapsDto[] = []
    protocolType = ''
    // frameRateList: number[] = []
    // maxFps = 0
}

/**
 * @description 分辨率数据项
 */
export class RecordStreamResolutionDto {
    res = ''
    resGroup: SelectOption<string, string>[] = []
    chls = {
        expand: false,
        data: [] as SelectOption<string, string>[],
    }
}

export class RecordStreamInfoAttrDto {
    res = ''
    fps = 0
    QoI = 0
    audio = ''
    type = ''
    bitType = ''
    level = ''
    originalFps = 0
}

export class RecordSubStreamInfoAttrDto {
    res = ''
    fps = 0
    QoI = 0
    enct = ''
    bitType = ''
    level = ''
    GOP: number | undefined = undefined
    OnlyRead = ''
}

/**
 * @description 录像码流信息
 */
export class RecordStreamInfoDto extends TableRowStatus {
    id = ''
    name = ''
    streamType = ''
    videoEncodeType = ''
    resolution = ''
    frameRate = 0
    bitRate = ''
    level = ''
    videoQuality = 0
    audio = ''
    recordStream = ''
    GOP: number | undefined = undefined
    chlType = ''
    isRTSPChl = false
    mainCaps = {
        // 可选的编码类型
        supEnct: [] as SelectOption<string, string>[],
        // 可选的码率
        bitType: [] as string[],
        res: [] as { fps: number; value: string; label: string }[],
    }
    main = {
        enct: '',
        aGOP: '',
        mGOP: '',
    }
    an = new RecordStreamInfoAttrDto()
    ae = new RecordStreamInfoAttrDto()
    mn = new RecordStreamInfoAttrDto()
    me = new RecordStreamInfoAttrDto()
    mainStreamQualityCaps: RecordStreamQualityCapsDto[] = []
    levelNote: SelectOption<string, string>[] = []
    bitType = ''
    supportAudio = false
}

export interface RecordStreamTableExpose {
    setData: () => void
    getRemainRecTime: () => void
}
