/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 12:08:57
 * @Description: AI/事件的类型定义，类型命名的前缀统一为Alaram*
 */
export type AlarmDetectTarget = 'person' | 'car' | 'motor'

/**
 * @description 报警输出
 */
export class AlarmOutDto extends TableRowStatus {
    id = '' //告警输出ID
    name = '' //告警输出名称
    nameMaxByteLen = 32
    index = 0 //告警输出在设备上的序号
    devDesc: string | undefined = undefined //告警输出所在设备的描述，如果为undefined表示本机，否则表示通道的名称
    devID: string | undefined = undefined //告警输出所在设备的ID，如果为undefined表示本机，否则表示通道的ID
    delayTime = 0 //延迟时间
    scheduleId = '' //排程ID
    scheduleName = '' //排程名称
    type = '' //常开常闭类型--本机报警输出在有效
}

/**
 * @description email接收人
 */
export class AlarmEmailReceiverDto {
    address = ''
    schedule = ''
}

/**
 * @description 事件通知——显示——弹出视频
 */
export class AlarmDisplayPopVideoForm {
    popVideoDuration = 0 // 弹出视频持续时间
    popVideoOutput = '' // 弹出视频输出
}

/**
 * @description 事件通知——显示——弹出消息框
 */
export class AlarmDisplayPopMsgForm {
    popMsgDuration = 0
    popMsgShow = false
}

/**
 * @description 事件通知——蜂鸣器
 */
export class AlarmBuzzerForm {
    buzzerDuration = 0
}

/**
 * @description 事件通知——推送
 */
export class AlarmPushForm {
    chkEnable = false // 是否启用
    pushSchedule = ''
}

/**
 * @description 事件通知——闪灯
 */
export class AlarmWhiteLightDto extends TableRowStatus {
    id = ''
    name = ''
    enable = false
    durationTime = 0
    frequencyType = ''
}

/**
 * @description 报警服务器表单
 */
export class AlarmServerForm {
    enable = false
    address = ''
    url = ''
    port = 0
    heartEnable = false
    protocol = ''
    interval = 0
    schedule = ''
    deviceId = ''
    token = ''
}

/**
 * @description 移动侦测、前端掉线、视频丢失的通用表格数据类型
 */
export class AlarmEventDto extends TableRowStatus {
    id = ''
    addType = ''
    chlType = ''
    poeIndex = ''
    productModel = {
        value: '',
        factoryName: '',
    }
    name = ''
    schedule = ''
    record = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
    snap = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
    sysAudio = ''
    msgPush = ''
    ftpSnap = '' //抓图到FTP，暂时无用
    alarmOut = {
        switch: false,
        alarmOuts: [] as SelectOption<string, string>[],
    }
    preset = {
        switch: false,
        presets: [] as { index: string; name: string; chl: SelectOption<string, string> }[],
    }
    beeper = ''
    videoPopup = ''
    videoPopupInfo = {
        switch: false,
        chl: { value: '', label: '' } as SelectOption<string, string>,
    }
    videoPopupList: SelectOption<string, string>[] = []
    msgBoxPopup = ''
    email = ''
    popMsgSwitch = ''
}

/**
 * @description IPC声音报警输出项
 */
export class AlarmAudioAlarmOutDto extends TableRowStatus {
    index = 0
    id = ''
    name = ''
    audioTypeList: Record<string, SelectOption<number, string>[]> = {
        customize: [],
    }
    // customeAudioNum = 0
    langArr: SelectOption<string, string>[] = []
    audioSwitch = false
    audioType = 0
    customizeAudioType = 0
    alarmTimes: number | undefined = undefined
    audioVolume: number | undefined = undefined
    alarmTimesDisabled = false
    audioVolumeDisabled = false
    languageType = ''
    audioFormat = ''
    sampleRate = ''
    audioChannel = ''
    audioDepth = ''
    audioFileLimitSize = 200 * 1024
    schedule = ''
}

/**
 * @description IPC声音设备项
 */
export class AlarmAudioDevice extends TableRowStatus {
    index = 0
    id = ''
    name = ''
    audioEncodeType: SelectOption<string, string>[] = []
    audioInputType: SelectOption<string, string>[] = []
    audioOutputType: SelectOption<string, string>[] = []
    audioInSwitch = false
    audioEncode = ''
    audioInput = ''
    loudSpeaker = ''
    audioOutput = ''
    micInVolume = 0
    linInVolume = 0
    audioOutVolume = 0
    micMaxValue = 100
    linMaxValue = 100
    audioOutMaxValue = 100
    micOrLinEnabled = false
    audioOutEnabled = false
    audioInSwitchEnabled = false
    audioDenoise = ''
    audioDenoiseEnabled = false
    isSpeakerMutex = false
    loudSpeakerswitch = false
    audioOutputswitch = false
    audioDenoiseType: SelectOption<string, string>[] = []
}

export class AlarmLocalAudioDto {
    audioSchedule = ''
    volume = 0
    list: AlarmLocalAudioFileDto[] = []
    formatType: string[] = []
}

/**
 * @description 本地声音表格项
 */
export class AlarmLocalAudioFileDto {
    id = ''
    index = ''
    name = ''
    originalName = ''
    fileValid = ''
    fileType = ''
}

/**
 * @description
 */
export class AlarmIpSpeakerDto {
    schedule = ''
    volume = 0
    volumeMin = 0
    volumeMax = 100
    online = false
}

/**
 * @description 异常报警表格项
 */
export class AlarmExceptionDto {
    id = ''
    eventType = ''
    sysAudio = ''
    msgPush = ''
    alarmOut = {
        switch: false,
        alarmOuts: [] as SelectOption<string, string>[],
    }
    alarmOutList: string[] = []
    beeper = ''
    msgBoxPopup = ''
    email = 'false'
    emailDisable = true
}

/**
 * @description 系统撤防
 */
export class AlarmSystemDisarmDto {
    id = ''
    chlName = ''
    // 已选择的撤防联动项列表
    disarmItemsList: { id: string; value: string }[] = []
    // 可选择的撤防联动项列表
    disarmItems: { id: string; value: string }[] = []
    // disarmItemsStr = ''
    nodeType = ''
}

export class AlarmSystemDisarmFormDto {
    sensorSwitch = false
    inputSource = ''
    resetTime = '00:00:00'
    autoResetSwitch = false
    defenseSwitch = false
    remoteSwitch = false
}

export class AlaramSystemDisarmChlDto {
    id = ''
    name = ''
    nodeType = ''
    supportManualAudio = false
    supportManualWhiteLight = false
}

/**
 * @description 传感器的table项
 */
export class AlarmSensorEventDto extends TableRowStatus {
    id = ''
    alarmInType = ''
    nodeIndex = ''
    isEditable = false
    serialNum = '' // 序号
    name = '' // 名称
    originalName = ''
    // 类型
    type = ''
    // 启用
    switch = ''
    holdTimeNote = ''
    // 持续时间
    holdTime = ''
    // 排程
    schedule = ''
    // record录像
    record = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
    // audio声音
    sysAudio = ''
    // snap抓图
    snap = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
    // 报警输出
    alarmOut = {
        switch: false,
        alarmOuts: [] as SelectOption<string, string>[],
    }
    // 预置点名称
    preset = {
        switch: false,
        presets: [] as AlarmPresetItem[],
    }
    msgPushSwitch = '' // 推送
    buzzerSwitch = '' // 蜂鸣器
    emailSwitch = '' // email
    popMsgSwitch = '' // 消息框弹出
    popVideo = '' // 视频弹出
}

/**
 * @description 预置点
 */
export class AlarmPresetItem {
    index = ''
    name = ''
    chl = {
        value: '',
        label: '',
    }
}

/**
 * @description IP Speaker
 */
export class AlarmIPSpeakerItem {
    ipSpeakerId = ''
    ipSpeakerName? = ''
    audioID = ''
    audioName? = ''
}

/**
 * @description: 组合报警
 */
export class AlarmCombinedDto extends TableRowStatus {
    id = ''
    name = ''
    combinedAlarm = {
        switch: false,
        item: [] as AlarmCombinedItemDto[],
    }
    record = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
    snap = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
    alarmOut = {
        switch: false,
        alarmOuts: [] as SelectOption<string, string>[],
    }
    preset = {
        switch: false,
        presets: [] as AlarmPresetItem[],
    }
    triggerAudio = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
    triggerWhiteLight = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
    sysAudio = ''
    msgPush = ''
    beeper = ''
    email = ''
    msgBoxPopup = ''
    popVideo = ''
}

export class AlarmCombinedItemDto {
    alarmSourceType = ''
    alarmSourceEntity = {
        value: '',
        label: '',
    }
}

export class AlarmCombinedFaceMatchDto {
    rule = ''
    duration = 5
    delay = 5
    groupId: string[] = []
    noShowDisplay = 'false'
    displayText = ''
    faceDataBase: string[] = []
}

/**
 * @description: AI事件——人脸识别通道
 */
export class AlarmFaceChlDto {
    id = ''
    name = ''
    ip = ''
    chlType = ''
    accessType = ''
    supportVfd = false
    supportBackVfd = false
    supportAudio = false
    supportWhiteLight = false
    showAIReourceDetail = false
    faceMatchLimitMaxChlNum = 0
}

export class AlarmMutexDto {
    object = ''
    status = false
}

/**
 * @description 人脸侦测——参数配置表单项
 */
export class AlarmFaceDetectionDto {
    supportVfd = false
    enabledSwitch = false
    originalSwitch = false
    holdTime = 0
    holdTimeList: SelectOption<number, string>[] = []
    regionInfo: CanvasBaseArea[] = []
    mutexList: AlarmMutexDto[] = []
    mutexListEx: AlarmMutexDto[] = []
    saveFacePicture: boolean | undefined = undefined
    saveSourcePicture: boolean | undefined = undefined
    snapInterval = ''
    captureCycle = 3
    captureCycleChecked = true
    minFaceFrame = 3
    minRegionInfo: CanvasBaseArea[] = []
    maxFaceFrame = 50
    maxRegionInfo: CanvasBaseArea[] = []
    triggerAudio = ''
    triggerWhiteLight = ''
    faceExpSwitch = false
    faceExpStrength = 50
    schedule = ''
    record: SelectOption<string, string>[] = []
    alarmOut: SelectOption<string, string>[] = []
    preset: AlarmPresetItem[] = []
    ipSpeaker: AlarmIPSpeakerItem[] = []
    trigger: string[] = []
    sysAudio = ''
}

/**
 * @description 人脸识别——参数配置表单项（人脸匹配）
 */
export class AlarmFaceMatchDto {
    hitEnable = false
    notHitEnable = false
    liveDisplaySwitch = false
    groupInfo: AlarmFaceGroupDto[] = []
}

/**
 * @description 人脸识别——参数配置——人脸分组表格
 */
export class AlarmFaceGroupDto {
    guid = ''
    groupId = ''
    name = ''
    similarity = 75
    count = 0
}

/**
 * @description 在线通道项
 */
export class AlarmOnlineChlDto {
    id = ''
    ip = ''
    name = ''
    accessType = ''
}

/**
 * @description 通道项
 */
export class AlarmChlDto extends AlarmOnlineChlDto {
    chlType = ''
    supportOsc = false
    supportCdd = false
    supportVfd = false
    supportBackVfd = false
    supportAvd = false
    supportPea = false
    supportPeaTrigger = false
    supportIpd = false
    supportTripwire = false
    supportAOIEntry = false
    supportAOILeave = false
    supportBackTripwire = false
    supportBackPea = false
    supportBackAOIEntry = false
    supportBackAOILeave = false
    supportVehiclePlate = false
    supportPassLine = false
    supportCpc = false
    supportAudio = false
    supportWhiteLight = false
    supportAutoTrack = false
    supportFire = false
    supportTemperature = false
    supportVideoMetadata = false
    supportLoitering = false
    supportPvd = false
    supportRegionStatistics = false
    supportASD = false
    supportHeatMap = false
    supportCrowdGathering = false
    supportBinocularCountConfig = false
}

/**
 * @description: AI事件——视频结构化通道
 */
export class AlarmVideoMetaDto extends AlarmOnlineChlDto {
    chlType = ''
    supportVideoMetadata = false
}

/**
 * @description: AI事件——事件启用通道
 */
export class AlarmIntelligentModeDto extends AlarmOnlineChlDto {
    supportInvokeEventTypeConfig = false
}

/**
 * @description: AI事件——事件启用——事件类型
 *   事件名称、提示文本、icon文件名
 */
export class AlarmIntelligentModeEventTypeDto {
    event = ''
    title = ''
    iconFile = ''
}

/**
 * @description AI资源表格项
 */
export class AlarmAIResourceDto {
    aiResType = ''
    aiResDetailInfo: Record<string, AlarmAIResDetailInfoDto> = {}
    aiResDetailTips = ''
    aiResPercent = ''
}

/**
 * @description AI资源详细信息项
 */
export class AlarmAIResDetailInfoDto {
    chlId = ''
    chlName = ''
    eventTypes: string[] = []
    decodeStatus = ''
    connectState = false
    aiResType: string[] = []
    aiResPercent = ''
    occupyDecodeCapPercent = ''
}
/**
 * @description 区域入侵不同区域类型的公用页面数据。
 */
export class AlarmPeaDto {
    // 是否启用侦测
    detectionEnable = false
    // 用于对比
    originalEnable = false
    // 是否支持SD卡存储
    pictureAvailable = false
    // SD卡原图存储
    saveTargetPicture = false
    // SD卡目标图存储
    saveSourcePicture = false
    // 联动追踪是否支持
    hasAutoTrack = false
    // 联动追踪
    autoTrack = false
    // 持续时间
    holdTime = 0
    // 持续时间列表
    holdTimeList: SelectOption<number, string>[] = []
    // 检测目标列表
    detectTargetList: SelectOption<AlarmDetectTarget, string>[] = []
    // 检测目标
    detectTarget: AlarmDetectTarget = 'person'
    // 是否支持配置时间阈值
    supportDuration = false
    // 时间阈值
    duration = new AlarmNumberInputDto()
    // 区别联咏ipc标志
    regulation = false
    // 是否支持配置屏蔽区域
    supportMaskArea = false
    // 屏蔽区域
    maskAreaInfo: { point: CanvasBasePoint[]; maxCount: number }[] = []
    boundaryInfo: {
        objectFilter: AlarmObjectFilterCfgDto
        point: CanvasBasePoint[]
        maxCount: number
    }[] = []
    regionInfo: CanvasBaseArea[] = []
    mutexList: AlarmMutexDto[] = []
    mutexListEx: AlarmMutexDto[] = []
    // 目标类型只支持人
    onlyPerson = false
    // 只支持人的灵敏度
    sensitivity = 0
    // 联动
    triggerSwitch = false
    // 音频联动
    audioSuport = false
    // 白光联动
    lightSuport = false
    sysAudio = ''
    recordSwitch = false
    recordChls: SelectOption<string, string>[] = []
    alarmOutSwitch = false
    alarmOutChls: SelectOption<string, string>[] = []
    presetSwitch = false
    presets: AlarmPresetItem[] = []
    ipSpeaker: AlarmIPSpeakerItem[] = []
    trigger: string[] = []
    triggerList: string[] = []
}

export type CanvasPasslineDirection = 'none' | 'rightortop' | 'leftorbotton'
// 客流统计绘制区域方向用
export type CanvasBoundaryDirection = 'AtoB' | 'BtoA'

/**
 * @description 越界
 */
export class AlarmTripwireDto {
    lineInfo: {
        objectFilter: AlarmObjectFilterCfgDto
        direction: CanvasPasslineDirection
        startPoint: { X: number; Y: number }
        endPoint: { X: number; Y: number }
    }[] = []
    // 检测目标列表
    detectTargetList: SelectOption<AlarmDetectTarget, string>[] = []
    // 检测目标
    detectTarget: AlarmDetectTarget = 'person'
    // 方向
    direction: CanvasPasslineDirection = 'none'
    // 方向列表
    directionList: SelectOption<string, string>[] = []
    // 排程
    schedule = ''
    // 持续时间
    holdTime = 0
    holdTimeList: SelectOption<number, string>[] = []
    // mutex
    mutexList: AlarmMutexDto[] = []
    mutexListEx: AlarmMutexDto[] = []
    // 目标类型只支持人
    onlyPreson = false
    // 只支持人的灵敏度
    sensitivity = 0
    // 是否支持SD卡存储
    pictureAvailable = false
    // SD卡原图存储
    saveTargetPicture = false
    // SD卡目标图存储
    saveSourcePicture = false
    // 联动追踪
    hasAutoTrack = false
    autoTrack = false
    // 是否启用侦测
    detectionEnable = false
    // 用于对比
    originalEnable = false
    triggerSwitch = false
    // 音频联动
    audioSuport = false
    // 白光联动
    lightSuport = false
    sysAudio = ''
    record: SelectOption<string, string>[] = []
    trigger: string[] = []
    triggerList = ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch']
    alarmOut: SelectOption<string, string>[] = []
    preset: AlarmPresetItem[] = []
    ipSpeaker: AlarmIPSpeakerItem[] = []
}

/**
 * @description 检测目标、目标大小数据类型
 */
export class AlarmObjectFilterCfgDto {
    supportPerson = false // 支持检测目标--人
    supportCar = false // 支持检测目标--车
    supportMotor = false // 支持检测目标--非机动车
    supportMaxMinTarget = false // 支持配置目标大小--人、车、非任意一个
    supportPersonMaxMin = false // 支持配置目标大小--人
    supportCarMaxMin = false // 支持配置目标大小--车
    supportMotorMaxMin = false // 支持配置目标大小--非机动车
    supportCommonEnable = false
    supportCommonSensitivity = false
    detectTargetList: AlarmDetectTarget[] = [] // 检测目标列表：person、car、motor
    commonSensitivity = new AlarmSensitivityInfoDto()
    person = new AlarmTargetCfgDto() // 检测目标为人的相关数据：开启检测、灵敏度、最小目标范围、最大目标范围
    car = new AlarmTargetCfgDto() // 检测目标为车的相关数据：开启检测、灵敏度、最小目标范围、最大目标范围
    motor = new AlarmTargetCfgDto() // 检测目标为车的相关数据：开启检测、灵敏度、最小目标范围、最大目标范围
}

/**
 * @description 检测目标数据类型
 */
export class AlarmTargetCfgDto {
    supportAlarmThreshold = false
    stayAlarmThreshold = new AlarmNumberInputDto()
    // 是否支持配置灵敏度
    supportSensitivity = false
    // 是否支持配置灵敏度开关
    supportSensityEnable = false
    sensitivity = new AlarmSensitivityInfoDto()
    minRegionInfo = new AlarmMaxMinRegionInfoDto()
    maxRegionInfo = new AlarmMaxMinRegionInfoDto()
}

/**
 * @description 时间阈值、滞留预警数据类型
 */
export class AlarmNumberInputDto {
    value = 0
    min = 0
    max = 100
    default? = 50
}

/**
 * @description 目标大小最值数据类型
 */
export class AlarmMaxMinRegionInfoDto {
    region: CanvasBaseArea[] = []
    width = 0
    height = 0
    min = 0
    max = 100
    default = 50
}

/**
 * @description 目标灵敏度数据类型
 */
export class AlarmSensitivityInfoDto {
    enable? = false
    value = 1
    max = 100
    min = 0
    default = 50
}

/**
 * @description 徘徊检测页面数据。
 */
export class AlarmLoiterDto {
    // 是否启用侦测
    detectionEnable = false
    // 用于对比
    originalEnable = false
    // 是否支持SD卡存储
    pictureAvailable = false
    // SD卡原图存储
    saveTargetPicture = false
    // SD卡目标图存储
    saveSourcePicture = false
    // 联动追踪是否支持
    hasAutoTrack = false
    // 联动追踪
    autoTrack = false
    // 持续时间
    holdTime = 0
    // 持续时间列表
    holdTimeList: SelectOption<number, string>[] = []
    // 检测目标列表
    detectTargetList: SelectOption<AlarmDetectTarget, string>[] = []
    // 检测目标
    detectTarget: AlarmDetectTarget = 'person'
    // 是否支持配置时间阈值
    supportDuration = false
    // 时间阈值
    duration = new AlarmNumberInputDto()
    // 触发模式
    supportTriggerMode = false
    triggerMode = 0
    boundaryInfo: {
        objectFilter: AlarmObjectFilterCfgDto
        point: CanvasBasePoint[]
        maxCount: number
    }[] = []
    mutexList: AlarmMutexDto[] = []
    mutexListEx: AlarmMutexDto[] = []
    // 联动
    triggerSwitch = false
    // 音频联动
    audioSuport = false
    // 白光联动
    lightSuport = false
    sysAudio = ''
    recordSwitch = false
    recordChls: SelectOption<string, string>[] = []
    alarmOutSwitch = false
    alarmOutChls: SelectOption<string, string>[] = []
    presetSwitch = false
    presets: AlarmPresetItem[] = []
    ipSpeaker: AlarmIPSpeakerItem[] = []
    trigger: string[] = []
    triggerList: string[] = []
}

/**
 * @description 声音异常页面数据。
 */
export class AlarmAsdDto {
    // 是否启用侦测
    detectionEnable = false
    // 用于对比
    originalEnable = false
    // 是否支持配置持续时间
    holdTimeEnable = false
    // 持续时间
    holdTime = 0
    // 持续时间列表
    holdTimeList: SelectOption<number, string>[] = []
    enabledArea = false
    //
    sdRiseSwitch = false
    sdRiseSwitchEnable = false
    sdRiseSensitivity = new AlarmSensitivityInfoDto()
    sdRiseThreshold = new AlarmNumberInputDto()
    //
    sdReduceSwitch = false
    sdReduceSwitchEnable = false
    sdReduceSensitivity = new AlarmSensitivityInfoDto()
    mutexList: AlarmMutexDto[] = []
    // 联动
    // triggerSwitch = false
    // 音频联动
    audioSuport = false
    // 白光联动
    lightSuport = false
    sysAudio = ''
    recordSwitch = false
    recordChls: SelectOption<string, string>[] = []
    alarmOutSwitch = false
    alarmOutChls: SelectOption<string, string>[] = []
    presetSwitch = false
    presets: AlarmPresetItem[] = []
    ipSpeaker: AlarmIPSpeakerItem[] = []
    trigger: string[] = []
    triggerList: string[] = []
}

/**
 * @description 热力图页面数据。
 */
export class AlarmHeatMapDto {
    // 是否启用侦测
    detectionEnable = false
    // 用于对比
    originalEnable = false
    // 是否支持SD卡存储
    pictureAvailable = false
    // SD卡原图存储
    saveTargetPicture = false
    // SD卡目标图存储
    saveSourcePicture = false
    // 联动追踪是否支持
    hasAutoTrack = false
    // 联动追踪
    autoTrack = false
    // 检测目标列表
    detectTargetList: SelectOption<AlarmDetectTarget, string>[] = []
    // 检测目标
    detectTarget: AlarmDetectTarget = 'person'
    boundaryInfo: {
        objectFilter: AlarmObjectFilterCfgDto
        point: CanvasBasePoint[]
        maxCount: number
    }[] = []
    mutexList: AlarmMutexDto[] = []
    mutexListEx: AlarmMutexDto[] = []
    // 联动
    triggerSwitch = false
    // 音频联动
    audioSuport = false
    // 白光联动
    lightSuport = false
    sysAudio = ''
    recordSwitch = false
    recordChls: SelectOption<string, string>[] = []
    alarmOutSwitch = false
    alarmOutChls: SelectOption<string, string>[] = []
    presetSwitch = false
    presets: AlarmPresetItem[] = []
    trigger: string[] = []
    triggerList: string[] = []
}

/**
 * @description 热力图图表坐标数据
 */
export class AlarmHeatMapChartDto {
    x = 0
    y = 0
    value = 0
}

/**
 * @description 区域统计
 */
export class AlarmAreaStatisDto {
    // 三种模式的时间
    countPeriod = {
        day: {
            date: 0,
            dateTime: DEFAULT_EMPTY_TIME,
        },
        week: {
            date: 0,
            dateTime: DEFAULT_EMPTY_TIME,
        },
        month: {
            date: 1,
            dateTime: DEFAULT_EMPTY_TIME,
        },
    }
    // 是否启用侦测
    detectionEnable = false
    // 用于对比
    originalEnable = false
    // SD卡原图存储
    saveTargetPicture = false
    // SD卡目标图存储
    saveSourcePicture = false
    // mutex
    mutexList: AlarmMutexDto[] = []
    mutexListEx: AlarmMutexDto[] = []
    // 排程
    schedule = ''
    // 是否支持持续时间
    supportAlarmHoldTime = false
    // 持续时间
    holdTime = 0
    // 持续时间列表
    holdTimeList: SelectOption<number, string>[] = []
    // 检测目标列表
    detectTargetList: SelectOption<AlarmDetectTarget, string>[] = []
    // 检测目标
    detectTarget: AlarmDetectTarget = 'person'
    // 是否支持配置时间阈值
    supportDuration = false
    // 时间阈值
    duration = new AlarmNumberInputDto()
    // OSD
    countOSD = {
        switch: false,
        X: 0,
        Y: 0,
        osdFormat: '',
        showEnterOsd: false,
        osdEntranceName: '',
        osdEntranceNameMaxLen: nameByteMaxLen,
        supportOsdEntranceName: false,
        showExitOsd: false,
        osdExitName: '',
        osdExitNameMaxLen: nameByteMaxLen,
        supportOsdExitName: false,
        showStayOsd: false,
        osdStayName: '',
        osdStayNameMaxLen: nameByteMaxLen,
        supportOsdStayName: false,
        osdWelcomeName: '',
        osdWelcomeNameMaxLen: nameByteMaxLen,
        supportOsdWelcomeName: false,
        osdAlarmName: '',
        osdAlarmNameMaxLen: nameByteMaxLen,
        supportOsdAlarmName: false,
    }
    // 重置时间模式 day/week/month
    countTimeType = ''
    // 重置模式列表
    countCycleTypeList: SelectOption<string, string>[] = []
    boundaryInfo: {
        objectFilter: AlarmObjectFilterCfgDto
        point: CanvasBasePoint[]
        maxCount: number
    }[] = []
    regionInfo: CanvasBaseArea[] = []
    // 目标类型只支持人
    onlyPerson = false
    // 只支持人的灵敏度
    sensitivity = 0
    // 区别联咏ipc标志
    regulation = false
    // 联动
    triggerSwitch = false
    // 音频联动
    audioSuport = false
    // 白光联动
    lightSuport = false
    sysAudio = ''
    recordSwitch = false
    recordChls: SelectOption<string, string>[] = []
    alarmOutSwitch = false
    alarmOutChls: SelectOption<string, string>[] = []
    presetSwitch = false
    presets: AlarmPresetItem[] = []
    ipSpeaker: AlarmIPSpeakerItem[] = []
    trigger: string[] = []
    triggerList: string[] = []
}

/**
 * @description 客流统计
 */
export class AlarmBinocularCountDto {
    // 是否启用侦测
    detectionEnable = false
    // 用于对比
    originalEnable = false
    // 是否支持SD卡存储
    pictureAvailable = false
    // SD卡原图存储
    saveSourcePicture = false
    // mutex
    mutexList: AlarmMutexDto[] = []
    mutexListEx: AlarmMutexDto[] = []
    // 排程
    schedule = ''
    // 是否支持持续时间
    supportAlarmHoldTime = false
    // 持续时间
    holdTime = 0
    // 持续时间列表
    holdTimeList: SelectOption<number, string>[] = []
    lineInfo: {
        direction: CanvasPasslineDirection
        startPoint: { X: number; Y: number }
        endPoint: { X: number; Y: number }
    }[] = []
    boundaryInfo: {
        direction: CanvasBoundaryDirection
        rectA: {
            point: CanvasBasePoint[]
            area: number
            LineColor: string
            maxCount: number
        }
        rectB: {
            point: CanvasBasePoint[]
            area: number
            LineColor: string
            maxCount: number
        }
    }[] = []
    // 滞留报警阈值
    overcrowdingThreshold = new AlarmNumberInputDto()
    // 灵敏度
    sensitivity = new AlarmSensitivityInfoDto()
    // 三种模式的时间
    countPeriod = {
        // 重置时间模式 day/week/month
        countTimeType: 'day',
        day: {
            date: 0,
            dateTime: DEFAULT_EMPTY_TIME,
        },
        week: {
            date: 0,
            dateTime: DEFAULT_EMPTY_TIME,
        },
        month: {
            date: 0,
            dateTime: DEFAULT_EMPTY_TIME,
        },
    }
    // 标定方式配置
    calibration = {
        modeType: '',
        height: new AlarmBinocularCountNumberDto(),
        regionInfo: {
            X1: 0,
            Y1: 0,
            X2: 0,
            Y2: 0,
        },
    }
    // OSD
    countOSD = {
        // 是否开启OSD
        switch: false,
        // 起始位置X
        X: 0,
        // 起始位置Y
        Y: 0,
        osdFormat: '',
        // 是否显示进入口OSD
        showEnterOsd: false,
        // 进入口 OSD 信息
        osdEntranceName: '',
        // 是否显示出口OSD
        showExitOsd: false,
        // 出口 OSD 信息
        osdExitName: '',
        // 是否显示滞留OSD
        showStayOsd: false,
        // 滞留 OSD 信息
        osdStayName: '',
        // 人数 OSD 信息
        osdPersonName: '',
        // 儿童数 OSD 信息
        osdChildName: '',
        // 高于阈值OSD显示
        osdAlarmName: '',
        // 低于阈值OSD显示
        osdWelcomeName: '',
    }
    // 是否开启高度过滤
    enableHeightFilter = false
    // 高度过滤阈值
    heightLowerLimit = new AlarmBinocularCountNumberDto()
    // 是否开启儿童计数
    enableChildFilter = false
    // 儿童计数高度过滤阈值
    childHeightLowerLimit = new AlarmBinocularCountNumberDto()
}

/**
 * @description 客流统计--警戒区域数据类型
 */
export class AlarmBinoCountBoundaryDto {
    rectA = {
        point: {
            X: 0,
            Y: 0,
            isClosed: false,
        },
        area: 0,
        LineColor: 'green',
        maxCount: 6,
    }
    rectB = {
        point: {
            X: 0,
            Y: 0,
            isClosed: false,
        },
        area: 0,
        LineColor: 'green',
        maxCount: 6,
    }
}

/**
 * @description 客流统计--镜头离地高度、高度过滤、儿童计数高度过滤数据类型
 */
export class AlarmBinocularCountNumberDto {
    value = 1
    min = 0
    max = 100
    unit = ''
}

/**
 * @description 过线统计
 */
export class AlarmPassLinesDto {
    // 三种模式的时间
    countPeriod = {
        day: {
            date: 0,
            dateTime: DEFAULT_EMPTY_TIME,
        },
        week: {
            date: 0,
            dateTime: DEFAULT_EMPTY_TIME,
        },
        month: {
            date: 1,
            dateTime: DEFAULT_EMPTY_TIME,
        },
    }
    // 是否启用侦测
    detectionEnable = false
    // 用于对比
    originalEnable = false
    // mutex
    mutexList: AlarmMutexDto[] = []
    mutexListEx: AlarmMutexDto[] = []
    // 排程
    schedule = ''
    // 是否支持持续时间
    supportAlarmHoldTime = false
    // 持续时间
    holdTime = 0
    // 持续时间列表
    holdTimeList: SelectOption<number, string>[] = []
    // 方向
    direction: CanvasPasslineDirection = 'none'
    // 方向列表
    directionList: SelectOption<string, string>[] = []
    // 检测目标列表
    detectTargetList: SelectOption<AlarmDetectTarget, string>[] = []
    // 检测目标
    detectTarget: AlarmDetectTarget = 'person'
    // 是否支持配置时间阈值
    supportDuration = false
    // 时间阈值
    duration = new AlarmNumberInputDto()
    line: {
        objectFilter: AlarmObjectFilterCfgDto
        direction: CanvasPasslineDirection
        startPoint: { X: number; Y: number }
        endPoint: { X: number; Y: number }
    }[] = []
    // OSD
    countOSD = {
        switch: false,
        X: 0,
        Y: 0,
        osdFormat: '',
        showEnterOsd: false,
        osdEntranceName: '',
        osdEntranceNameMaxLen: nameByteMaxLen,
        supportOsdEntranceName: false,
        showExitOsd: false,
        osdExitName: '',
        osdExitNameMaxLen: nameByteMaxLen,
        supportOsdExitName: false,
        showStayOsd: false,
        osdStayName: '',
        osdStayNameMaxLen: nameByteMaxLen,
        supportOsdStayName: false,
        osdWelcomeName: '',
        osdWelcomeNameMaxLen: nameByteMaxLen,
        supportOsdWelcomeName: false,
        osdAlarmName: '',
        osdAlarmNameMaxLen: nameByteMaxLen,
        supportOsdAlarmName: false,
    }
    // 重置时间模式 day/week/month
    countTimeType = ''
    // 重置模式列表
    countCycleTypeList: SelectOption<string, string>[] = []
    // SD卡原图存储
    saveTargetPicture = false
    // SD卡目标图存储
    saveSourcePicture = false
    lineInfo: CanvasBaseArea = {
        X1: 0,
        Y1: 0,
        X2: 0,
        Y2: 0,
    }
    regionInfo: CanvasBaseArea = {
        X1: 0,
        Y1: 0,
        X2: 0,
        Y2: 0,
    }
    // 灵敏度
    detectSensitivity = 0
    detectSensitivityList: SelectOption<number, string>[] = []
    // 统计周期
    statisticalPeriod = ' '
    statisticalPeriodList: SelectOption<string, string>[] = []
    // 进入阈值
    crossInAlarmNumValue = 0
    // 离开阈值
    crossOutAlarmNumValue = 0
    // 滞留阈值
    twoWayDiffAlarmNumValue = 0
    // 联动
    triggerSwitch = false
    // 音频联动
    audioSuport = false
    // 白光联动
    lightSuport = false
    sysAudio = ''
    recordSwitch = false
    recordChls: SelectOption<string, string>[] = []
    alarmOutSwitch = false
    alarmOutChls: SelectOption<string, string>[] = []
    presetSwitch = false
    presets: AlarmPresetItem[] = []
    ipSpeaker: AlarmIPSpeakerItem[] = []
    trigger: string[] = []
    triggerList: string[] = []
}

/**
 * @description 过线统计 Email
 */
export class AlarmPassLinesEmailDto {
    saveTargetPicture = false
    saveSourcePicture = false
    sendEmailData = {
        type: 0,
        enableSwitch: false,
        dailyReportSwitch: false,
        weeklyReportSwitch: false,
        weeklyReportDate: 0,
        mouthlyReportSwitch: false,
        mouthlyReportDate: 0,
        reportHour: 0,
        reportMin: 0,
    }
    receiverData: AlarmPassLinesEmailReceiverDto[] = []
}

export class AlarmPassLinesEmailReceiverDto {
    address = ''
    schedule = ''
}

/**
 * @description 人脸识别——识别成功/陌生人
 */
export class AlarmFaceRecognitionDto {
    voiceList: SelectOption<string, string>[] = []
    task: AlarmRecognitionTaskDto[] = []
    editFlag = false
}

/**
 * @description 识别成功
 */
export class AlarmRecognitionTaskDto {
    guid = ''
    id = ''
    ruleType = ''
    nameId = 0
    pluseSwitch = false
    groupId: string[] = []
    hintword = ''
    schedule = ''
    record: SelectOption<string, string>[] = []
    alarmOut: SelectOption<string, string>[] = []
    snap: SelectOption<string, string>[] = []
    preset: AlarmPresetItem[] = []
    ipSpeaker: AlarmIPSpeakerItem[] = []
    trigger: string[] = []
    sysAudio = ''
}

/**
 * @description: AI事件——车牌识别相关类型
 */

/**
 * @description 车牌识别通道
 */
export class AlarmVehicleChlDto {
    id = ''
    name = ''
    chlType = ''
    supportVehiclePlate = false
}

/**
 * @description 车牌侦测——参数配置表单项
 */
export class AlarmVehicleDetectionDto {
    enabledSwitch = false
    originalSwitch = false
    schedule = ''
    plateSupportArea = ''
    direction = ''
    exposureSwitch = false
    exposureValue = 0
    exposureMin = 1
    exposureMax = 50
    capturePlateAbsenceVehicle = false
    regionInfo: CanvasBaseArea[] = []
    maskAreaInfo: CanvasBasePoint[][] = []
    mutexList: AlarmMutexDto[] = []
    plateSize = {
        minWidth: 0,
        maxWidth: 1,
        min: 0,
        max: 50,
    }
    minRegionInfo: CanvasBaseArea[] = []
    maxRegionInfo: CanvasBaseArea[] = []
}

/**
 * @description 车牌识别——识别成功/陌生车牌
 */
export class AlarmVehicleRecognitionDto {
    hitEnable = false
    notHitEnable = false
    task: AlarmRecognitionTaskDto[] = []
    editFlag = false
}

/**
 * @description AI事件——更多——温度检测
 */
export class AlarmTemperatureDetectionDto {
    enabledSwitch = false
    holdTime = 0
    holdTimeList: SelectOption<number, string>[] = []
    schedule = ''
    // 是否支持配置屏蔽区域
    supportMaskArea = false
    // 屏蔽区域
    maskAreaInfo: { points: CanvasBasePoint[]; maxCount: number }[] = []
    // 当前温度单位
    tempUnits = ''
    // 当前距离单位
    distanceUnits = ''
    // 是否支持配置距离
    isShowDistance = false
    // 使能热成像显示温度信息
    thermaldisplayen = false
    // 是否支持配置热成像
    isShowThermal = false
    // 使能可见光显示温度信息
    opticaldisplayen = false
    // 是否支持配置可见光
    isShowOptical = false
    tempInfo = {
        // 是否支持配置温度条
        isShowSegcolor: false,
        // 是否启用显示温度条
        segcolorTemperatureParam: false,
        // 是否启用点击测温
        dotTemperatureInfo: false,
        // 发射率
        emissivity: new AlarmTempEmissivityDto(),
        // 距离
        distance: new AlarmTempDistanceDto(),
        // 反射温度
        reflectTemper: new AlarmTemperatureDto(),
        // 最高温
        maxtemperen: false,
        // 是否显示平均温
        isShowAvgtemperen: false,
        // 平均温
        avgtemperen: false,
        // 最低温
        mintemperen: false,
    }
    triggerAudio = ''
    triggerWhiteLight = ''
    record: SelectOption<string, string>[] = []
    alarmOut: SelectOption<string, string>[] = []
    snap: SelectOption<string, string>[] = []
    preset: AlarmPresetItem[] = []
    ipSpeaker: AlarmIPSpeakerItem[] = []
    trigger: string[] = []
    sysAudio = ''
    boundaryData: AlarmTemperatureDetectionBoundryDto[] = []
}

/**
 * @description AI事件——更多——温度检测——发射率
 */
export class AlarmTempEmissivityDto {
    value = 0
    min = 1
    max = 100
    default = 50
}

/**
 * @description AI事件——更多——温度检测——距离
 */
export class AlarmTempDistanceDto {
    value = 0
    min = 0
    max = 100
    fmin = 0
    fmax = 328
    default = 50
    fdefault = 16
}

/**
 * @description AI事件——更多——温度检测——反射温度、警报温度
 */
export class AlarmTemperatureDto {
    value = 0
    min = -30
    max = 60
    fmin = -22
    fmax = 140
    default = 25
    fdefault = 77
}
/**
 * @description 检测界限数据（区域）
 */
export class AlarmTemperatureDetectionBoundryDto {
    id = ''
    ruleId = 0
    switch = false
    ruleName = ''
    ruleType = ''
    // 是否支持配置时间阈值
    supportDuration = false
    // 时间阈值
    duration = new AlarmNumberInputDto()
    emissivity = new AlarmTempEmissivityDto()
    distance = new AlarmTempDistanceDto()
    reflectTemper = new AlarmTemperatureDto()
    alarmRule = ''
    alarmTemper = new AlarmTemperatureDto()
    maxCount = 0
    points: CanvasBasePoint[] = []
}

/**
 * @description AI事件——更多——物品遗留与看护
 */
export class AlarmObjectLeftDto {
    enabledSwitch = false
    originalSwitch = false
    holdTime = 0
    holdTimeList: SelectOption<number, string>[] = []
    schedule = ''
    oscTypeList: SelectOption<string, string>[] = []
    oscType = ''
    areaMaxCount = 0
    regulation = false
    boundary: AlarmObjectLeftBoundaryDto[] = []
    mutexList: AlarmMutexDto[] = []
    maxNameLength = 0
    record: SelectOption<string, string>[] = []
    alarmOut: SelectOption<string, string>[] = []
    preset: AlarmPresetItem[] = []
    ipSpeaker: AlarmIPSpeakerItem[] = []
    trigger: string[] = []
    sysAudio = ''
}

export class AlarmObjectLeftBoundaryDto {
    areaName = ''
    points: CanvasBasePoint[] = []
}

/**
 * @description AI事件——更多——异常侦测
 **/
export class AlarmAbnormalDisposeDto {
    holdTime = 0
    holdTimeList: SelectOption<number, string>[] = []
    sceneChangeSwitch = ''
    clarityAbnormalSwitch = ''
    colorAbnormalSwitch = ''
    sensitivity = 0
    record: SelectOption<string, string>[] = []
    alarmOut: SelectOption<string, string>[] = []
    preset: AlarmPresetItem[] = []
    ipSpeaker: AlarmIPSpeakerItem[] = []
    trigger: string[] = []
    sysAudio = ''
}

export class AlarmVideoStructureCfgDto {
    index = ''
    value = false
    tagName = ''
    label = ''
}

/**
 * @description AI事件——更多——视频结构化
 **/
export class AlarmVideoStructureDto {
    enabledSwitch = false
    originalSwitch = false
    schedule = ''
    saveSourcePicture = false
    saveTargetPicture = false
    // 检测目标列表
    detectTargetList: SelectOption<AlarmDetectTarget, string>[] = []
    // 检测目标
    detectTarget: AlarmDetectTarget = 'person'
    // 屏蔽区域
    maskAreaInfo: { point: CanvasBasePoint[]; maxCount: number }[] = []
    detectAreaInfo: {
        objectFilter: AlarmObjectFilterCfgDto
        point: CanvasBasePoint[]
        maxCount: number
    }[] = []
    mutexList: AlarmMutexDto[] = []
    mutexListEx: AlarmMutexDto[] = []
    countOSD = {
        switch: false,
        X: 0,
        Y: 0,
        osdPersonName: '',
        osdCarName: '',
        osdBikeName: '',
        osdFormat: '',
        supportCountOSD: false,
        supportPoint: false,
        supportOsdPersonName: false,
        supportOsdCarName: false,
        supportBikeName: false,
    }
    countPeriod = {
        countTimeType: 'day',
        day: {
            date: 0,
            dateTime: DEFAULT_EMPTY_TIME,
        },
        week: {
            date: 0,
            dateTime: DEFAULT_EMPTY_TIME,
        },
        month: {
            date: 0,
            dateTime: DEFAULT_EMPTY_TIME,
        },
    }
    osdType = ''
    osdPersonCfgList: AlarmVideoStructureCfgDto[] = []
    osdCarCfgList: AlarmVideoStructureCfgDto[] = []
    osdBikeCfgList: AlarmVideoStructureCfgDto[] = []
}

/**
 * @description 人群密度检测表单数据
 */
export class AlarmCddDto {
    // 是否启用侦测
    detectionEnable = false
    originalEnable = false
    // 排程管理
    schedule = ''
    // 持续时间
    holdTime = 0
    holdTimeList: SelectOption<number, string>[] = []
    // 刷新频率
    refreshFrequency = 0
    refreshFrequencyList: SelectOption<number, string>[] = []
    regionInfo: CanvasBaseArea[] = []
    // 常规联动选项
    trigger: string[] = []
    sysAudio = ''
    record: SelectOption<string, string>[] = []
    alarmOut: SelectOption<string, string>[] = []
    preset: AlarmPresetItem[] = []
    ipSpeaker: AlarmIPSpeakerItem[] = []
    // 报警阈值
    triggerAlarmLevel = 0
    // mutex
    mutexList: AlarmMutexDto[] = []
}

/**
 * @description 火点检测表单
 */
export class AlarmFireDetectionDto {
    // 排程管理
    schedule = ''
    // 持续时间
    holdTime = 0
    holdTimeList: SelectOption<number, string>[] = []
    // mutex
    mutexList: AlarmMutexDto[] = []
    mutexListEx: AlarmMutexDto[] = []
    trigger: string[] = []
    triggerList: string[] = []
    // 音频联动
    audioSuport = false
    // 白光联动
    lightSuport = false
    // 是否启用侦测
    detectionEnable = false
    // 用于对比
    originalEnable = false
    // 是否支持配置时间阈值
    supportDuration = false
    // 时间阈值
    duration = new AlarmNumberInputDto()
    // 是否支持配置灵敏度节点
    ShowFireSensitivity = false
    // 灵敏度
    sensitivity = 0
    // 触发报警条件
    fireAlarmMode = ''
    fireAlarmModeList: SelectOption<string, string>[] = []
    // 是否支持配置屏蔽区域
    supportMaskArea = false
    // 屏蔽区域
    maskAreaInfo: { point: CanvasBasePoint[]; maxCount: number }[] = []
    sysAudio = ''
    record: SelectOption<string, string>[] = []
    alarmOut: SelectOption<string, string>[] = []
    snap: SelectOption<string, string>[] = []
    preset: AlarmPresetItem[] = []
    ipSpeaker: AlarmIPSpeakerItem[] = []
}

export class AlarmSnapPopDto {
    id = ''
    snap = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
}

export class AlarmOutPopDto {
    id = ''
    alarmOut = {
        switch: false,
        alarmOuts: [] as SelectOption<string, string>[],
    }
}

export class AlarmRecordPopDto {
    id = ''
    record = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
}

export class AlarmPresetPopDto {
    id = ''
    preset = {
        switch: false,
        presets: [] as AlarmPresetItem[],
    }
}

export class AlramTriggerAudioPopDto {
    id = ''
    triggerAudio = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
}

export class AlarmTriggerWhiteLightPopDto {
    id = ''
    triggerWhiteLight = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
}

export class AlarmDetectTargetDto {
    chlId = ''
    chlName = ''
    workMode = ''
    enable = false
    online = false
    front: boolean[] = []
    back: boolean[] = []
}
