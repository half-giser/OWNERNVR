/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 12:08:57
 * @Description: AI/事件
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-09-25 09:35:58
 */
const { Translate } = useLangStore()

/**
 * @description: 报警输出
 * @return {*}
 */
export class AlarmOut {
    id = '' //告警输出ID
    name = '' //告警输出名称
    index = '' //告警输出在设备上的序号
    devDesc = undefined as string | undefined //告警输出所在设备的描述，如果为undefined表示本机，否则表示通道的名称
    devID = undefined as string | undefined //告警输出所在设备的ID，如果为undefined表示本机，否则表示通道的ID
    delayTime = 0 //延迟时间
    scheduleId = '' //排程ID
    scheduleName = '' //排程名称
    type = '' //常开常闭类型--本机报警输出在有效
    status = '' //行状态: loading, success, error
    disabled = true //是否禁用
    // 表格中显示的序号，是devDesc-index
    get serialNum() {
        return `${this.devDesc ? this.devDesc : Translate('IDCS_LOCAL')}-${this.index}`
    }
}

/**
 * @description: email接收人
 * @return {*}
 */
export class EmailReceiver {
    address = ''
    addressShow = ''
    schedule = ''
    delDisabled = false
    rowDisabled = false
    rowClicked = false
}
// 事件通知——显示——弹出视频
export class PopVideoForm {
    popVideoDuration = 0 // 弹出视频持续时间
    popVideoOutputShow = false // 是否显示
    popVideoOutput = '' // 弹出视频输出
}

// 事件通知——显示——弹出消息框
export class PopMsgForm {
    popMsgDuration = 0
    popMsgShow = false
}

// 事件通知——蜂鸣器
export class buzzerForm {
    buzzerDuration = 0
}

// 事件通知——推送
export class pushForm {
    chkEnable = false // 是否启用
    pushSchedule = ''
}

// 事件通知——闪灯
export class whiteLightInfo {
    id = ''
    name = ''
    enable = ''
    durationTime: number | null = null
    frequencyType = ''
    enableDisable = true
    rowDisable = true
    durationTimeDisable = false
    frequencyTypeDisable = false
    status = '' //行状态: loading, success, error
}

// 事件通知——报警类型
export class AlarmTypeInfo {
    id = ''
    value = ''
}

// 移动侦测、前端掉线、视频丢失的通用表格数据类型
export class MotionEventConfig {
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
        chls: [] as { value: string; label: string }[],
    }
    recordList = [] as string[]
    snap = {
        switch: false,
        chls: [] as { value: string; label: string }[],
    }
    snapList = [] as string[]
    sysAudio = ''
    msgPush = ''
    ftpSnap = '' //抓图到FTP，暂时无用
    alarmOut = {
        switch: false,
        chls: [] as { value: string; label: string }[],
    }
    alarmOutList = [] as string[]
    preset = {
        switch: false,
        presets: [] as { index: string; name: string; chl: { value: string; label: string } }[],
    }
    beeper = ''
    videoPopup = ''
    videoPopupInfo = { switch: false, chl: { value: '', label: '' } as { value: string; label: string } }
    videoPopupList = [] as { value: string; label: string }[]
    msgBoxPopup = ''
    email = ''
    oldSchedule = {
        value: '',
        label: '',
    }

    rowDisable = true
}

export class ipcAudioForm {
    ipcRadio = 'audioAlarm' // 摄像机选择项——语音播报/声音设备

    // 语音播报
    audioChl = '' // 通道
    audioChecked = false // 声音是否启用
    voice = '' // 语音
    number = '' // 次数
    volume = '' // 音量
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

export class AudioAlarmOut {
    successFlag = false
    editFlag = false
    id = ''
    name = ''
    audioTypeList = [] as SelectOption<string, string>[]
    customeAudioNum = 0
    langArr = [] as SelectOption<string, string>[]
    audioSwitch = ''
    audioType = ''
    alarmTimes = ''
    audioVolume = ''
    languageType = ''
    audioFormat = ''
    sampleRate = ''
    audioChannel = ''
    audioDepth = ''
    audioFileLimitSize = ''
}

export class AudioDevice {
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

export class LocalTableRow {
    id = ''
    index = ''
    name = ''
    originalName = ''
    fileValid = ''
}

export class ExceptionAlarmRow {
    id = ''
    eventType = ''
    sysAudio = ''
    msgPush = ''
    alarmOut = {
        switch: false,
        alarmOuts: [] as { value: string; label: string }[],
    }
    alarmOutList = [] as string[]
    beeper = ''
    msgBoxPopup = ''
    email = 'false'
    rowDisable = true
    emailDisable = true
}

export class SystemDisarm {
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

// 传感器的table项
export class SensorEvent {
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
    sysRec = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
    recordList = [] as string[]
    // audio声音
    sysAudio = ''
    // snap抓图
    sysSnap = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
    snapList = [] as string[]
    // 报警输出
    alarmOut = {
        switch: false,
        alarmOuts: [] as SelectOption<string, string>[],
    }
    alarmOutList = [] as string[]
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
        presets: [] as PresetItem[],
    }
    msgPushSwitch = '' // 推送
    buzzerSwitch = '' // 蜂鸣器
    emailSwitch = '' // email
    popMsgSwitch = '' // 消息框弹出
}

export class PresetItem {
    index = ''
    name = ''
    chl = {
        value: '',
        label: '',
    }
}

export class PresetList {
    id = ''
    name = ''
    chlType = ''
    preset = {
        value: '',
        label: '',
    }
    presetList = [] as SelectOption<string, string>[]
}
/**
 * @description: 组合报警
 * @return {*}
 */

export class CombinedAlarm {
    id = ''
    name = ''
    status = '' //行状态: loading, success, error
    combinedAlarm = {
        switch: false,
        item: [] as CombinedAlarmItem[],
    }
    sysRec = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
    recordList = [] as string[]
    sysSnap = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
    snapList = [] as string[]
    alarmOut = {
        switch: false,
        alarmOuts: [] as SelectOption<string, string>[],
    }
    alarmOutList = [] as string[]
    popVideo = {
        switch: '',
        chl: {
            value: '',
            label: '',
        },
    }
    preset = {
        switch: false,
        presets: [] as PresetItem[],
    }
    sysAudio = ''
    msgPush = ''
    beeper = ''
    email = ''
    msgBoxPopup = ''
    videoPopup = ''
}

export class CombinedAlarmItem {
    alarmSourceType = ''
    alarmSourceEntity = {
        value: '',
        label: '',
    }
}

export class faceMatchObj {
    rule = ''
    duration = 5
    delay = 5
    groupId = [] as string[]
    noShowDisplay = 'false'
    displayText = ''
    faceDataBase = [] as string[]
}
/**
 * @description: AI事件——人脸识别相关类型
 * @return {*}
 */
// 人脸识别通道
export class FaceChlItem {
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
// AI资源table项
export class AIResource {
    id = ''
    name = ''
    eventType = [] as string[]
    eventTypeText = ''
    percent = ''
    decodeResource = ''
    decodeResourceText = ''
}
// 侦测——参数配置表单项
export class FaceDetection {
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
    preset = [] as PresetItem[]
    msgPushSwitch = false
    buzzerSwitch = false
    popVideoSwitch = false
    emailSwitch = false
    catchSnapSwitch = false
    sysAudio = ''
}

export class Region {
    X1 = 0
    Y1 = 0
    X2 = 0
    Y2 = 0
}
// 识别——参数配置表单项（人脸匹配）
export class FaceMatch {
    hitEnable = false
    notHitEnable = false
    liveDisplaySwitch = false
    groupInfo = [] as FaceGroupTableItem[]
    editFlag = false
}
// 识别——参数配置——人脸分组表格
export class FaceGroupTableItem {
    guid = ''
    name = ''
    similarity = 75
}

export class chlCaps {
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

export class aiResourceRow {
    id = ''
    name = ''
    eventType = [] as string[]
    eventTypeText = ''
    percent = ''
    decodeResource = '--'
}

// 区域入侵不同区域类型的公用页面数据。
export class peaPageData {
    [key: string]: any
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
    regionInfo = {} as { X1: number; Y1: number; X2: number; Y2: number }[]
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
    snapSwitch = false
    msgPushSwitch = false
    buzzerSwitch = false
    popVideoSwitch = false
    emailSwitch = false
    // 音频联动
    audioSuport = false
    triggerAudio = false
    // 白光联动
    lightSuport = false
    triggerWhiteLight = false
    // 用于显示在页面上
    peaTriggerData = [] as { value: boolean; label: string; property: string }[]
    sysAudio = ''
    recordSwitch = false
    recordChls = [] as { value: string; label: string }[]
    // 选中的record id
    recordList = [] as string[]
    recordIsShow = false
    recordHeaderTitle = 'IDCS_TRIGGER_CHANNEL_RECORD'
    recordSourceTitle = 'IDCS_CHANNEL'
    recordTargetTitle = 'IDCS_CHANNEL_TRGGER'
    // recordSource = [] as { value: string; label: string }[]
    recordType = 'record'

    alarmOutSwitch = false
    alarmOutChls = [] as { value: string; label: string }[]
    // 选中的alarmOut id
    alarmOutList = [] as string[]
    alarmOutIsShow = false
    alarmOutHeaderTitle = 'IDCS_TRIGGER_ALARM_OUT'
    alarmOutSourceTitle = 'IDCS_ALARM_OUT'
    alarmOutTargetTitle = 'IDCS_TRIGGER_ALARM_OUT'
    // alarmOutSource = [] as { value: string; label: string; device: { value: string; label: string } }[]
    alarmOutType = 'alarmOut'

    presetSwitch = false
    presets = [] as PresetItem[]
    presetSource = [] as PresetList[]
}

export class emailData {
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

export class regionData {
    X1 = 0
    Y1 = 0
    X2 = 0
    Y2 = 0
}

// 识别——识别成功/陌生人
export class FaceCompare {
    voiceList = [] as SelectOption<string, string>[]
    task = [] as CompareTask[]
    editFlag = false
}
export class CompareTask {
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
    preset = [] as PresetItem[]
    msgPushSwitch = false
    buzzerSwitch = false
    popVideoSwitch = false
    emailSwitch = false
    popMsgSwitch = false
    sysAudio = ''
}
/**
 * @description: AI事件——车牌识别相关类型
 * @return {*}
 */
// 人脸识别通道
export class VehicleChlItem {
    id = ''
    name = ''
    chlType = ''
    supportVehiclePlate = false
}
// 侦测——参数配置表单项
export class VehicleDetection {
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
// 识别——识别成功/陌生车牌
export class VehicleCompare {
    hitEnable = false
    notHitEnable = false
    task = [] as CompareTask[]
    editFlag = false
}
/* AI事件——更多——温度检测 */
export class TempDetection {
    enabledSwitch = false
    holdTime = ''
    holdTimeList = [] as SelectOption<string, string>[]
    schedule = ''
    triggerAudio = ''
    triggerWhiteLight = ''
    record = [] as SelectOption<string, string>[]
    alarmOut = [] as SelectOption<string, string>[]
    snap = [] as SelectOption<string, string>[]
    preset = [] as PresetItem[]
    msgPushSwitch = false
    buzzerSwitch = false
    popVideoSwitch = false
    emailSwitch = false
    popMsgSwitch = false
    catchSnapSwitch = false
    sysAudio = ''
    boundaryData = [] as BoundaryTableDataItem[]
}
// 检测界限数据（区域）
export class BoundaryTableDataItem {
    id = ''
    ruleId = 0
    switch = false
    ruleName = ''
    ruleType = ''
    emissivity = ''
    emissivityDefault = ''
    distance = ''
    distanceDefault = ''
    reflectTemper = ''
    reflectTemperDefault = ''
    alarmRule = ''
    alarmTemper = ''
    alarmTemperDefault = ''
    maxCount = 0
    points = [] as { X: number; Y: number; isClosed: boolean }[]
}
/* AI事件——更多——物品遗留与看护 */
export class ObjectLeft {
    enabledSwitch = false
    originalSwitch = false
    holdTime = ''
    holdTimeList = [] as SelectOption<string, string>[]
    schedule = ''
    oscTypeList = [] as SelectOption<string, string>[]
    oscType = ''
    areaMaxCount = 0
    regulation = false
    boundary = [] as BoundaryItem[]
    mutexList = [] as { object: string; status: boolean }[]
    maxNameLength = 0
    record = [] as SelectOption<string, string>[]
    alarmOut = [] as SelectOption<string, string>[]
    preset = [] as PresetItem[]
    msgPushSwitch = false
    buzzerSwitch = false
    popVideoSwitch = false
    emailSwitch = false
    catchSnapSwitch = false
    sysAudio = ''
}
export class BoundaryItem {
    areaName = ''
    points = [] as { X: number; Y: number; isClosed: boolean }[]
}
/* AI事件——更多——异常侦测 */
export class AbnormalDispose {
    holdTime = ''
    holdTimeList = [] as SelectOption<string, string>[]
    sceneChangeSwitch = ''
    clarityAbnormalSwitch = ''
    colorAbnormalSwitch = ''
    sensitivity = 0
    record = [] as SelectOption<string, string>[]
    alarmOut = [] as SelectOption<string, string>[]
    preset = [] as PresetItem[]
    msgPushSwitch = false
    buzzerSwitch = false
    popVideoSwitch = false
    emailSwitch = false
    catchSnapSwitch = false
    sysAudio = ''
}
/* AI事件——更多——视频结构化 */
export class VideoStructureData {
    enabledSwitch = false
    originalSwitch = false
    schedule = ''
    saveSourcePicture = ''
    saveTargetPicture = ''
    algoChkModel = ''
    intervalCheck = 0
    intervalCheckMin = 0
    intervalCheckMax = 0
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
