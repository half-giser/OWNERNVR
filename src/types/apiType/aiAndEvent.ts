/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 12:08:57
 * @Description: AI/事件
 */

/**
 * @description 报警输出
 */
export class AlarmOutDto {
    id = '' //告警输出ID
    name = '' //告警输出名称
    index = '' //告警输出在设备上的序号
    devDesc = undefined as string | undefined //告警输出所在设备的描述，如果为undefined表示本机，否则表示通道的名称
    devID = undefined as string | undefined //告警输出所在设备的ID，如果为undefined表示本机，否则表示通道的ID
    delayTime = 0 //延迟时间
    scheduleId = '' //排程ID
    scheduleName = '' //排程名称
    oldSchedule = '' //记录打开排程管理弹窗前的名称
    type = '' //常开常闭类型--本机报警输出在有效
    status = '' //行状态: loading, success, error
    disabled = true //是否禁用
}

/**
 * @description email接收人
 */
export class AlarmEmailReceiverDto {
    address = ''
    addressShow = ''
    schedule = ''
    delDisabled = false
    rowDisabled = false
    rowClicked = false
}

/**
 * @description 事件通知——显示——弹出视频
 */
export class AlarmDisplayPopVideoForm {
    popVideoDuration = 0 // 弹出视频持续时间
    popVideoOutputShow = false // 是否显示
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
export class AlarmWhiteLightDto {
    id = ''
    name = ''
    enable = ''
    durationTime: number | null = null
    frequencyType = ''
    enableDisable = true
    rowDisable = false
    durationTimeDisable = false
    frequencyTypeDisable = false
    status = '' //行状态: loading, success, error
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
 * @description 事件通知——报警服务器-报警类型
 */
// export class AlarmTypeInfoDto {
//     id = ''
//     value = ''
// }

/**
 * @description 移动侦测、前端掉线、视频丢失的通用表格数据类型
 */
export class AlarmEventDto {
    id = ''
    addType = ''
    chlType = ''
    poeIndex = ''
    productModel = {
        value: '',
        factoryName: '',
    }
    status = '' //行状态: loading, success, error
    name = ''
    schedule = {
        value: '',
        label: '',
    }
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
        presets: [] as { index: string; name: string; chl: { value: string; label: string } }[],
    }
    beeper = ''
    videoPopup = ''
    videoPopupInfo = { switch: false, chl: { value: '', label: '' } as { value: string; label: string } }
    videoPopupList = [] as SelectOption<string, string>[]
    msgBoxPopup = ''
    email = ''
    oldSchedule = {
        value: '',
        label: '',
    }

    rowDisable = true
}

/**
 * @description IPC声音表单
 */
export class AlarmIpcAudioForm {
    ipcRadio = 'audioAlarm' // 摄像机选择项——语音播报/声音设备

    // 语音播报
    audioChl = '' // 通道
    audioChecked = false // 声音是否启用
    voice = '' // 语音
    number = undefined as number | undefined // 次数
    volume = undefined as number | undefined // 音量
    language = '' // 语言

    // 声音设备
    deviceChl = '' // 通道
    deviceEnable = false // 声音设备
    deviceAudioInput = '' // 音频输入设备
    micOrLinVolume = 0 // 音频输入音量
    loudSpeaker = '' // 扬声器（内置）
    deviceAudioOutput = '' // LOUT（外置）
    outputVolume = 0 // 音频输出音量
    audioEncode = '' // 音频输入编码
}

/**
 * @description IPC声音报警输出项
 */
export class AlarmAudioAlarmOutDto {
    successFlag = false
    editFlag = false
    id = ''
    name = ''
    audioTypeList = [] as SelectOption<string, string>[]
    customeAudioNum = 0
    langArr = [] as SelectOption<string, string>[]
    audioSwitch = ''
    audioType = ''
    alarmTimes = 1
    audioVolume = 0
    languageType = ''
    audioFormat = ''
    sampleRate = ''
    audioChannel = ''
    audioDepth = ''
    audioFileLimitSize = ''
}

/**
 * @description IPC声音设备项
 */
export class AlarmAudioDevice {
    successFlag = false
    editFlag = false
    id = ''
    name = ''
    audioEncodeType = [] as SelectOption<string, string>[]
    audioInputType = [] as SelectOption<string, string>[]
    audioOutputType = [] as SelectOption<string, string>[]
    audioInSwitch = ''
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
}

/**
 * @description 本地声音表格项
 */
export class AlarmLocalAudioDto {
    id = ''
    index = ''
    name = ''
    originalName = ''
    fileValid = ''
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
    alarmOutList = [] as string[]
    beeper = ''
    msgBoxPopup = ''
    email = 'false'
    rowDisable = true
    emailDisable = true
}

/**
 * @description 系统撤防
 */
export class AlarmSystemDisarmDto {
    id = ''
    chlName = ''
    // 已选择的撤防联动项列表
    disarmItemsList = [] as { id: string; value: string }[]
    // 可选择的撤防联动项列表
    disarmItems = [] as { id: string; value: string }[]
    disarmItemsStr = ''
    nodeType = ''
}

// 传感器页面——通道列表
export class ChlList {
    id = ''
    name = ''
}

/**
 * @description 传感器的table项
 */
export class AlarmSensorEventDto {
    id = ''
    status = '' //行状态: loading, success, error
    alarmInType = ''
    nodeIndex = ''
    disabled = true
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
    schedule = {
        value: '',
        label: '',
    }
    // 打开排程管理时将原本的排程填入
    oldSchedule = ''
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
    // 视频弹出
    popVideo = {
        switch: '',
        chl: {
            id: '',
            innerText: '',
        },
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

export class AlarmPresetList {
    id = ''
    name = ''
    chlType = ''
    preset = {
        value: '',
        label: '',
    }
    presetList = [] as SelectOption<string, string>[]
    // 在点击select获取option数据，阻止重复获取请求
    isGetPresetList = false
}

/**
 * @description: 组合报警
 */
export class AlarmCombinedDto {
    id = ''
    name = ''
    status = '' //行状态: loading, success, error
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
    popVideo = {
        switch: '',
        chl: {
            value: '',
            label: '',
        },
    }
    preset = {
        switch: false,
        presets: [] as AlarmPresetItem[],
    }
    sysAudio = ''
    msgPush = ''
    beeper = ''
    email = ''
    msgBoxPopup = ''
    videoPopup = ''
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
    groupId = [] as string[]
    noShowDisplay = 'false'
    displayText = ''
    faceDataBase = [] as string[]
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

/**
 * @description 人脸侦测——参数配置表单项
 */
export class AlarmFaceDetectionDto {
    enabledSwitch = false
    originalSwitch = false
    holdTime = ''
    holdTimeList = [] as SelectOption<string, string>[]
    regionInfo = [] as Region[]
    mutexList = [] as { object: string; status: boolean }[]
    mutexListEx = [] as { object: string; status: boolean }[]
    saveFacePicture = ''
    saveSourcePicture = ''
    snapInterval = ''
    captureCycle = ''
    minFaceFrame = 3
    minRegionInfo = [] as Region[]
    maxFaceFrame = 50
    maxRegionInfo = [] as Region[]
    triggerAudio = ''
    triggerWhiteLight = ''
    faceExpSwitch = false
    faceExpStrength = 50
    schedule = ''
    record = [] as SelectOption<string, string>[]
    alarmOut = [] as SelectOption<string, string>[]
    preset = [] as AlarmPresetItem[]
    trigger = [] as string[]
    sysAudio = ''
}

export class Region {
    X1 = 0
    Y1 = 0
    X2 = 0
    Y2 = 0
}

/**
 * @description 人脸识别——参数配置表单项（人脸匹配）
 */
export class AlarmFaceMatchDto {
    hitEnable = false
    notHitEnable = false
    liveDisplaySwitch = false
    groupInfo = [] as AlarmFaceGroupDto[]
    editFlag = false
}

/**
 * @description 人脸识别——参数配置——人脸分组表格
 */
export class AlarmFaceGroupDto {
    guid = ''
    name = ''
    similarity = 75
}

/**
 * @description 通道项
 */
export class AlarmChlDto {
    id = ''
    ip = ''
    name = ''
    accessType = ''
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
    showAIReourceDetail = false
    faceMatchLimitMaxChlNum = 0
}

/**
 * @description AI资源表格项
 */
export class AlarmAIResourceDto {
    id = ''
    name = ''
    eventType = [] as string[]
    eventTypeText = ''
    percent = ''
    decodeResource = '--'
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
    holdTimeList = [] as { value: number; label: string }[]
    // 区别联咏ipc标志
    regulation = false
    boundaryInfo = [] as { point: { X: number; Y: number; isClosed?: boolean }[]; maxCount: number; configured: boolean }[]
    regionInfo = [] as { X1: number; Y1: number; X2: number; Y2: number }[]
    mutexList = [] as { object: string; status: boolean }[]
    mutexListEx = [] as { object: string; status: boolean }[]
    // 目标类型只支持人
    pea_onlyPreson = false
    // 只支持人的灵敏度
    onlyPersonSensitivity = 0
    // 检测目标
    hasObj = false
    person = false
    car = false
    motorcycle = false
    // 检测目标灵敏度
    personSensitivity = 0
    carSensitivity = 0
    motorSensitivity = 0
    // 联动
    triggerSwitch = false
    // 音频联动
    audioSuport = false
    // 白光联动
    lightSuport = false
    sysAudio = ''
    recordSwitch = false
    recordChls = [] as SelectOption<string, string>[]
    alarmOutSwitch = false
    alarmOutChls = [] as SelectOption<string, string>[]
    presetSwitch = false
    presets = [] as AlarmPresetItem[]
    trigger = [] as string[]
    triggerList = [] as string[]
}

export type CanvasPasslineDirection = 'none' | 'rightortop' | 'leftorbotton'

/**
 * @description 越界
 */
export class AlarmTripwireDto {
    lineInfo = [] as { direction: CanvasPasslineDirection; startPoint: { X: number; Y: number }; endPoint: { X: number; Y: number }; configured: boolean }[]
    // 方向
    direction = '' as CanvasPasslineDirection
    // 方向列表
    directionList = [] as SelectOption<string, string>[]
    // 排程
    tripwire_schedule = ''
    // 持续时间
    holdTime = 0
    holdTimeList = [] as SelectOption<number, string>[]
    // mutex
    mutexList = [] as { object: string; status: boolean }[]
    mutexListEx = [] as { object: string; status: boolean }[]
    // 目标类型只支持人
    tripwire_onlyPreson = false
    // 只支持人的灵敏度
    onlyPersonSensitivity = 0
    // 是否支持SD卡存储
    pictureAvailable = false
    // SD卡原图存储
    saveTargetPicture = false
    // SD卡目标图存储
    saveSourcePicture = false
    // 联动追踪
    hasAutoTrack = false
    autoTrack = false
    // 检测目标
    hasObj = false
    // 是否启用侦测
    detectionEnable = false
    // 用于对比
    originalEnable = false
    objectFilter = {
        person: false,
        car: false,
        motorcycle: false,
        personSensitivity: 0,
        carSensitivity: 0,
        motorSensitivity: 0,
    }
    triggerSwitch = false
    // 音频联动
    audioSuport = false
    // 白光联动
    lightSuport = false
    sysAudio = ''
    record = [] as SelectOption<string, string>[]
    trigger = [] as string[]
    triggerList = ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch']
    alarmOut = [] as SelectOption<string, string>[]
    preset = [] as AlarmPresetItem[]
}

/**
 * @description 过线统计
 */
export class AlarmPassLinesDto {
    // 三种模式的时间
    countPeriod = {
        day: {
            date: '0',
            dateTime: '00:00:00',
        } as { date: string; dateTime: string },
        week: {
            date: '0',
            dateTime: '00:00:00',
        } as { date: string; dateTime: string },
        month: {
            date: '1',
            dateTime: '00:00:00',
        } as { date: string; dateTime: string },
    } as Record<string, { date: string; dateTime: string }>
    // 是否启用侦测
    passLineDetectionEnable = false
    // 用于对比
    passLineOriginalEnable = false
    // mutex
    passLineMutexList = [] as { object: string; status: boolean }[]
    passLineMutexListEx = [] as { object: string; status: boolean }[]
    // 排程
    passLineSchedule = ''
    // 持续时间
    passLineholdTime = 0
    lineInfo = [] as { direction: CanvasPasslineDirection; startPoint: { X: number; Y: number }; endPoint: { X: number; Y: number }; configured: boolean }[]
    // OSD
    countOSD = {
        switch: false,
        X: 0,
        Y: 0,
        osdFormat: '',
    }
    // 是否启用自动重置
    autoReset = true
    // 重置时间模式 day/week/month
    countTimeType = 'day'
    // 重置模式列表
    countCycleTypeList = [] as SelectOption<string, string>[]
    // SD卡原图存储
    saveTargetPicture = false
    // SD卡目标图存储
    saveSourcePicture = false
    // cpc TODO现无支持设备，无法测试
    // 是否启用侦测
    cpcDetectionEnable = false
    // 用于对比
    cpcOriginalEnable = false
    cpcMutexList = [] as { object: string; status: boolean }[]
    cpcMutexListEx = [] as { object: string; status: boolean }[]
    cpcLineInfo = new AlarmPassLinesRegion()
    regionInfo = new AlarmPassLinesRegion()
    // 排程
    cpcSchedule = ''
    // 持续时间
    holdTime = 0
    holdTimeList = [] as SelectOption<number, string>[]
    // 灵敏度
    detectSensitivity = 0
    detectSensitivityList = [] as SelectOption<number, string>[]
    // 统计周期
    statisticalPeriod = ' '
    statisticalPeriodList = [] as SelectOption<string, string>[]
    // 进入阈值
    crossInAlarmNumValue = 0
    // 离开阈值
    crossOutAlarmNumValue = 0
    // 滞留阈值
    twoWayDiffAlarmNumValue = 0
    objectFilter = {
        person: false,
        car: false,
        motorcycle: false,
        personSensitivity: 0,
        carSensitivity: 0,
        motorSensitivity: 0,
    }
    triggerAudio = false
    // 白光联动
    lightSuport = false
    triggerWhiteLight = false
}

/**
 * @description 过线统计 Email
 */
export class AlarmPassLinesEmailDto {
    saveTargetPicture = false
    saveSourcePicture = false
    sendEmailData = {
        type: '0',
        enableSwitch: false,
        dailyReportSwitch: false,
        weeklyReportSwitch: false,
        weeklyReportDate: '0',
        mouthlyReportSwitch: false,
        mouthlyReportDate: '0',
        reportHour: 0,
        reportMin: 0,
    }
    receiverData = [] as { address: string; schedule: string; rowClicked: boolean }[]
}

export class AlarmPassLinesRegion {
    X1 = 0
    Y1 = 0
    X2 = 0
    Y2 = 0
}

/**
 * @description 人脸识别——识别成功/陌生人
 */
export class AlarmFaceRecognitionDto {
    voiceList = [] as SelectOption<string, string>[]
    task = [] as AlarmRecognitionTaskDto[]
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
    groupId = [] as string[]
    hintword = ''
    schedule = ''
    record = [] as SelectOption<string, string>[]
    alarmOut = [] as SelectOption<string, string>[]
    snap = [] as SelectOption<string, string>[]
    preset = [] as AlarmPresetItem[]
    trigger = [] as string[]
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
    exposureChecked = false
    exposureValue = 0
    plateAbsenceCheceked = false
    regionInfo = [] as Region[]
    maskAreaInfo = {} as Record<number, { X: number; Y: number; isClosed: boolean }[]>
    mutexList = [] as { object: string; status: boolean }[]
    plateSize = {
        minWidth: 0,
        maxWidth: 0,
        min: 1,
        max: 50,
    }
    minRegionInfo = [] as Region[]
    maxRegionInfo = [] as Region[]
}

/**
 * @description 车牌识别——识别成功/陌生车牌
 */
export class AlarmVehicleRecognitionDto {
    hitEnable = false
    notHitEnable = false
    task = [] as AlarmRecognitionTaskDto[]
    editFlag = false
}

/**
 * @description AI事件——更多——温度检测
 */
export class AlarmTemperatureDetectionDto {
    enabledSwitch = false
    holdTime = ''
    holdTimeList = [] as SelectOption<string, string>[]
    schedule = ''
    triggerAudio = ''
    triggerWhiteLight = ''
    record = [] as SelectOption<string, string>[]
    alarmOut = [] as SelectOption<string, string>[]
    snap = [] as SelectOption<string, string>[]
    preset = [] as AlarmPresetItem[]
    trigger = [] as string[]
    sysAudio = ''
    boundaryData = [] as AlarmTemperatureDetectionBoundryDto[]
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
    emissivity = 0
    emissivityDefault = 0
    distance = 0
    distanceDefault = 0
    reflectTemper = 0
    reflectTemperDefault = 0
    alarmRule = ''
    alarmTemper = 0
    alarmTemperDefault = 0
    maxCount = 0
    points = [] as { X: number; Y: number; isClosed?: boolean }[]
}

/**
 * @description AI事件——更多——物品遗留与看护
 */
export class AlarmObjectLeftDto {
    enabledSwitch = false
    originalSwitch = false
    holdTime = ''
    holdTimeList = [] as SelectOption<string, string>[]
    schedule = ''
    oscTypeList = [] as SelectOption<string, string>[]
    oscType = ''
    areaMaxCount = 0
    regulation = false
    boundary = [] as AlarmObjectLeftBoundaryDto[]
    mutexList = [] as { object: string; status: boolean }[]
    maxNameLength = 0
    record = [] as SelectOption<string, string>[]
    alarmOut = [] as SelectOption<string, string>[]
    preset = [] as AlarmPresetItem[]
    trigger = [] as string[]
    sysAudio = ''
}

export class AlarmObjectLeftBoundaryDto {
    areaName = ''
    points = [] as { X: number; Y: number; isClosed?: boolean }[]
}

/**
 * @description AI事件——更多——异常侦测
 **/
export class AlarmAbnormalDisposeDto {
    holdTime = ''
    holdTimeList = [] as SelectOption<string, string>[]
    sceneChangeSwitch = ''
    clarityAbnormalSwitch = ''
    colorAbnormalSwitch = ''
    sensitivity = 0
    record = [] as SelectOption<string, string>[]
    alarmOut = [] as SelectOption<string, string>[]
    preset = [] as AlarmPresetItem[]
    trigger = [] as string[]
    sysAudio = ''
}

/**
 * @description AI事件——更多——视频结构化
 **/
export class AlarmVideoStructureDto {
    enabledSwitch = false
    originalSwitch = false
    schedule = ''
    saveSourcePicture = ''
    saveTargetPicture = ''
    algoChkModel = ''
    intervalCheck = 1
    intervalCheckMin = 1
    intervalCheckMax = 1
    detectAreaInfo = {} as Record<number, { X: number; Y: number; isClosed: boolean }[]>
    maskAreaInfo = {} as Record<number, { X: number; Y: number; isClosed: boolean }[]>
    mutexList = [] as { object: string; status: boolean }[]
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
            date: '',
            dateTime: '',
        },
        week: {
            date: '',
            dateTime: '',
        },
        month: {
            date: '',
            dateTime: '',
        },
    }
    objectFilter = {
        car: false,
        person: false,
        motorcycle: false,
        carSensitivity: 1,
        personSensitivity: 1,
        motorSensitivity: 1,
    }
    osdType = ''
    osdPersonCfgList = [] as { index: string; value: string; tagName: string }[]
    osdCarCfgList = [] as { index: string; value: string; tagName: string }[]
    osdBikeCfgList = [] as { index: string; value: string; tagName: string }[]
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
    holdTimeList = [] as SelectOption<number, string>[]
    // 刷新频率
    refreshFrequency = 0
    refreshFrequencyList = [] as SelectOption<number, string>[]
    regionInfo = [] as { X1: number; X2: number; Y1: number; Y2: number }[]
    // 常规联动选项
    trigger = [] as string[]
    sysAudio = ''
    record = [] as SelectOption<string, string>[]
    alarmOut = [] as SelectOption<string, string>[]
    preset = [] as AlarmPresetItem[]
    // 报警阈值
    triggerAlarmLevel = 0
    // mutex
    mutexList = [] as { object: string; status: boolean }[]
}

/**
 * @description 火点检测表单
 */
export class AlarmFireDetectionDto {
    // 排程管理
    schedule = ''
    // 持续时间
    holdTime = 0
    holdTimeList = [] as SelectOption<number, string>[]
    // mutex
    mutexList = [] as { object: string; status: boolean }[]
    mutexListEx = [] as { object: string; status: boolean }[]
    trigger = [] as string[]
    triggerList = [] as string[]
    // 音频联动
    audioSuport = false
    // 白光联动
    lightSuport = false
    // 是否启用侦测
    detectionEnable = false
    // 用于对比
    originalEnable = false
    sysAudio = ''
    record = [] as SelectOption<string, string>[]
    alarmOut = [] as SelectOption<string, string>[]
    snap = [] as SelectOption<string, string>[]
    preset = [] as AlarmPresetItem[]
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
