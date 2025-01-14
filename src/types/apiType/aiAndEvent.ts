/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 12:08:57
 * @Description: AI/事件
 */

import { TableRowStatus } from './base'
import type { CanvasBasePoint, CanvasBaseArea } from '@/utils/canvas/canvasBase'

/**
 * @description 报警输出
 */
export class AlarmOutDto extends TableRowStatus {
    id = '' //告警输出ID
    name = '' //告警输出名称
    index = '' //告警输出在设备上的序号
    devDesc: string | undefined = undefined //告警输出所在设备的描述，如果为undefined表示本机，否则表示通道的名称
    devID: string | undefined = undefined //告警输出所在设备的ID，如果为undefined表示本机，否则表示通道的ID
    delayTime = 0 //延迟时间
    scheduleId = '' //排程ID
    scheduleName = '' //排程名称
    oldSchedule = '' //记录打开排程管理弹窗前的名称
    type = '' //常开常闭类型--本机报警输出在有效
}

/**
 * @description email接收人
 */
export class AlarmEmailReceiverDto {
    address = ''
    addressShow = ''
    schedule = ''
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
export class AlarmWhiteLightDto extends TableRowStatus {
    id = ''
    name = ''
    enable = false
    durationTime: number | undefined = undefined
    frequencyType = ''
    // enableDisable = true
    // durationTimeDisable = false
    // frequencyTypeDisable = false
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
    oldSchedule = ''
}

/**
 * @description IPC声音报警输出项
 */
export class AlarmAudioAlarmOutDto extends TableRowStatus {
    editFlag = false
    index = 0
    id = ''
    name = ''
    audioTypeList: SelectOption<number, string>[] = [{ label: '', value: 0 }]
    customeAudioNum = 0
    langArr: SelectOption<string, string>[] = []
    audioSwitch = false
    audioType = 0
    alarmTimes: number | undefined = undefined
    audioVolume: number | undefined = undefined
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
export class AlarmAudioDevice extends TableRowStatus {
    editFlag = false
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
    presetList: SelectOption<string, string>[] = []
    // 在点击select获取option数据，阻止重复获取请求
    isGetPresetList = false
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
}

/**
 * @description AI资源表格项
 */
export class AlarmAIResourceDto {
    id = ''
    name = ''
    eventType: string[] = []
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
    holdTimeList: SelectOption<number, string>[] = []
    // 区别联咏ipc标志
    regulation = false
    boundaryInfo: { point: CanvasBasePoint[]; maxCount: number; configured: boolean }[] = []
    regionInfo: CanvasBaseArea[] = []
    mutexList: AlarmMutexDto[] = []
    mutexListEx: AlarmMutexDto[] = []
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
    recordChls: SelectOption<string, string>[] = []
    alarmOutSwitch = false
    alarmOutChls: SelectOption<string, string>[] = []
    presetSwitch = false
    presets: AlarmPresetItem[] = []
    trigger: string[] = []
    triggerList: string[] = []
}

export type CanvasPasslineDirection = 'none' | 'rightortop' | 'leftorbotton'

/**
 * @description 越界
 */
export class AlarmTripwireDto {
    lineInfo: { direction: CanvasPasslineDirection; startPoint: { X: number; Y: number }; endPoint: { X: number; Y: number }; configured: boolean }[] = []
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
    record: SelectOption<string, string>[] = []
    trigger: string[] = []
    triggerList = ['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'snapSwitch']
    alarmOut: SelectOption<string, string>[] = []
    preset: AlarmPresetItem[] = []
}

/**
 * @description 过线统计
 */
export class AlarmPassLinesDto {
    // 三种模式的时间
    countPeriod = {
        day: {
            date: 0,
            dateTime: '00:00:00',
        },
        week: {
            date: 0,
            dateTime: '00:00:00',
        },
        month: {
            date: 1,
            dateTime: '00:00:00',
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
    // 持续时间
    holdTime = 0
    line: {
        direction: CanvasPasslineDirection
        startPoint: { X: number; Y: number }
        endPoint: { X: number; Y: number }
        configured: boolean
    }[] = []
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
    holdTimeList: SelectOption<number, string>[] = []
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
    maskAreaInfo: Record<number, CanvasBasePoint[]> = {}
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
    triggerAudio = ''
    triggerWhiteLight = ''
    record: SelectOption<string, string>[] = []
    alarmOut: SelectOption<string, string>[] = []
    snap: SelectOption<string, string>[] = []
    preset: AlarmPresetItem[] = []
    trigger: string[] = []
    sysAudio = ''
    boundaryData: AlarmTemperatureDetectionBoundryDto[] = []
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
    algoChkModel = ''
    intervalCheck = 1
    intervalCheckMin = 1
    intervalCheckMax = 1
    detectAreaInfo: Record<number, CanvasBasePoint[]> = {}
    maskAreaInfo: Record<number, CanvasBasePoint[]> = {}
    mutexList: AlarmMutexDto[] = []
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
            dateTime: '00:00:00',
        },
        week: {
            date: 0,
            dateTime: '00:00:00',
        },
        month: {
            date: 0,
            dateTime: '00:00:00',
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
    sysAudio = ''
    record: SelectOption<string, string>[] = []
    alarmOut: SelectOption<string, string>[] = []
    snap: SelectOption<string, string>[] = []
    preset: AlarmPresetItem[] = []
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
