/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-08 17:03:07
 * @Description: 通道
 */

export class ChannelInfoDto {
    id = ''
    chlNum = ''
    name = ''
    devID = ''
    ip = ''
    port = 0
    poePort = ''
    userName = ''
    password = ''
    protocolType = ''
    addType = ''
    accessType = ''
    poeIndex = ''
    manufacturer = ''
    productModel = {
        factoryName: '',
        innerText: '',
    }
    index = ''
    chlIndex = ''
    isOnline = false
    chlType = ''
    version = ''
    delDisabled = false
    showSetting = true
    showUpgradeBtn = false
    upgradeDisabled = true
    upgradeStatus: 'normal' | 'notActive' | 'progress' | 'error' | 'success' = 'normal' // normal：初始状态， notActive：未激活， progress：正在升级， error：升级失败/校验头文件失败, success：升级成功
    upgradeProgressText = '' // 升级进度
}

export class DefaultPwdDto {
    id = ''
    userName = ''
    password = ''
    displayName = ''
    protocolType = ''
    showInput = false
}

export class ChannelQuickAddDto {
    ip = ''
    port = ''
    httpPort = ''
    mask = ''
    gateway = ''
    manufacturer = ''
    poeIndex = ''
    productModel = {
        factoryName: '',
        identity: '',
        innerText: '',
    }
    devName = ''
    version = ''
    mac = ''
    industryProductType = ''
    protocolType = ''
    activateStatus = ''
}

export class ChannelManualAddDto {
    name = ''
    ip = ''
    domain = ''
    port = 10
    userName = ''
    password = ''
    index = 0
    manufacturer = ''
    protocolType = ''
    addrType = ''
    portDisabled = false
}

export class ChannelAddRecorderDto {
    ip = ''
    port = 0
    version = ''
    name = ''
    serialNum = ''
    chlTotalCount = 0
    httpPort = 0
    chlAddedCount = 0
    productModel = ''
    displayName = ''
}

export class ChannelAddEditIPCIpDto {
    mac = ''
    ip = ''
    mask = ''
    gateway = ''
    userName = ''
    password = ''
}

export class RecorderDto {
    index = ''
    name = ''
    isAdded = false
    bandWidth = ''
    productModel = ''
}

export class RecorderAddDto {
    ip = ''
    domain = ''
    chkDomain = false
    servePort = 6036
    httpPort = 80
    channelCount = 8
    userName = ''
    password = ''
    useDefaultPwd = true
    recorderList: Array<RecorderDto> = []
}

export class QueryNodeListDto {
    pageIndex = 0
    pageSize = 0
    nodeType = ''
    chlName = ''
    isSupportPtz = false
    isSupportPtzGroupTraceTask = false
    isSupportTalkback = false
    isSupportOsc = false
    isSupportSnap = false
    isSupportVfd = false
    isSupportBackEndVfd = false
    isSupportCpc = false
    isSupportCdd = false
    isSupportIpd = false
    isSupportAvd = false
    isSupportPea = false
    isSupportTripwire = false
    isSupportImageRotate = false
    isSupportFishEye = false
    isSupportMotion = false
    isSupportOsd = false
    isSupportAudioSetting = false
    isSupportMaskSetting = false
    isSupportImageSetting = false
    isSupportWhiteLightAlarmOut = false
    isSupportAudioAlarmOut = false
    isSupportAudioDev = false
    isSupportAOIEntry = false
    isSupportAOILeave = false
    isSupportPassLine = false
    isSupportVehiclePlate = false
    isSupportAutoTrack = false
    isSupportAccessControl = false
    isContainsDeletedItem = false
    authList = ''
    chlType = ''
    ignoreNdChl = false
    requireField: string[] = []
}

export class ResourcesPathDto {
    streamType = ''
    protocol = ''
    transportProtocol = ''
    port = 10
    path = ''
}

export class ProtocolManageDto {
    id = ''
    enabled = false
    displayName = ''
    resourcesPath: ResourcesPathDto[] = []
}

export class MultiChlCheckedInfoDto {
    operateIndex = 0
    chlType = ''
    chlLabel = ''
    checked = true
    disabled = false
}

export class MultiChlIPCAddDto extends ChannelManualAddDto {
    multichannelCheckedInfoList: MultiChlCheckedInfoDto[] = []
    type = ''
}

export class ChlGroup {
    id = ''
    name = ''
    dwellTime = 0
    chlCount = 0
    chls: Record<string, string | boolean>[] = []
}

export class ChlSignal {
    id = 0
    name = ''
    lite = false
    signalType = ''
    chlSupSignalTypeArray: string[] = []
    defaultChannelSignalType = ''
    signal = ''
    analogIp = ''
    showLite = true
    showSignal = true
}

class ChannelRowStatus {
    status = ''
    statusTip = ''
    disabled = true
}

export class ChannelOsd extends ChannelRowStatus {
    id = ''
    name = ''
    ip = ''
    chlIndex = ''
    chlType = ''
    displayName = false
    displayTime = false
    displayNameDisabled = false
    displayTimeDisabled = false
    remarkSwitch = true
    remarkNote = ''
    remarkDisabled = true
    status = ''
    disabled = true
    statusInitToolTip = ''
    manufacturer = ''
    dateFormat = ''
    timeFormat = ''
    timeEnum: string[] = []
    dateEnum: string[] = []
    supportTimeFormat = false
    supportDateFormat = false
    isSpeco = false
    timeX = 0
    timeXMinValue = 0
    timeXMaxValue = 0
    timeY = 0
    timeYMinValue = 0
    timeYMaxValue = 0
    nameX = 0
    nameXMinValue = 0
    nameXMaxValue = 0
    nameY = 0
    nameYMinValue = 0
    nameYMaxValue = 0
}

export class ChannelImage extends ChannelRowStatus {
    id = ''
    name = ''
    chlType = ''
    bright: number | undefined = undefined
    contrast: number | undefined = undefined
    saturation: number | undefined = undefined
    hue: number | undefined = undefined
    isSupportHallway = false //是否支持走廊模式
    isSupportIRCutMode = false //是否支持日夜模式
    isSupportThermal = false // 是否热成像通道
    isSpeco = false
    paletteCode: string | undefined = undefined
    defaultPaletteCode: string | undefined = undefined
    brightMinValue: number | undefined = undefined
    brightMaxValue: number | undefined = undefined
    brightDefaultValue: number | undefined = undefined
    contrastMinValue: number | undefined = undefined
    contrastMaxValue: number | undefined = undefined
    contrastDefaultValue: number | undefined = undefined
    hueMinValue: number | undefined = undefined
    hueMaxValue: number | undefined = undefined
    hueDefaultValue: number | undefined = undefined
    saturationMinValue: number | undefined = undefined
    saturationMaxValue: number | undefined = undefined
    saturationDefaultValue: number | undefined = undefined
    cfgFile: string | undefined = undefined
    cfgFileDefault: string | undefined = undefined
    denoiseValue: number | undefined = undefined
    denoiseDefaultValue: number | undefined = undefined
    denoiseMinValue: number | undefined = undefined
    denoiseMaxValue: number | undefined = undefined
    denoiseSwitch: boolean | undefined = false
    ShowGainMode: boolean | undefined = false
    WDRDefaultValue: number | undefined = undefined
    WDRMinValue: number | undefined = undefined
    WDRMaxValue: number | undefined = undefined
    WDRSwitch: boolean | undefined = undefined
    WDRValue: number | undefined = undefined
    HFR: boolean | undefined = undefined
    whiteBalanceMode: string | undefined = undefined
    redDefaultValue: number | undefined = undefined
    redMinValue: number | undefined = undefined
    redMaxValue: number | undefined = undefined
    redValue: number | undefined = undefined
    blueDefaultValue: number | undefined = undefined
    blueMinValue: number | undefined = undefined
    blueMaxValue: number | undefined = undefined
    blueValue: number | undefined = undefined
    IRCutMode: string | undefined = undefined
    IRCutModeDef: string | undefined = undefined
    IRCutConvSen: string | undefined = undefined
    IRCutConvSen2: string | undefined = undefined // 只用于判断
    IRCutConvSenDef: string | undefined = undefined
    IRCutDayTime: string | undefined = undefined
    IRCutNightTime: string | undefined = undefined
    sharpenDefaultValue: number | undefined = undefined
    sharpenMinValue: number | undefined = undefined
    sharpenMaxValue: number | undefined = undefined
    sharpenValue: number | undefined = undefined
    sharpenSwitch: boolean | undefined = undefined
    sharpenSwitchEnable: boolean | undefined = undefined
    mirrorSwitch: boolean | undefined = undefined
    flipSwitch: boolean | undefined = undefined
    imageRotate: string | undefined = undefined
    imageRotateDef: string | undefined = undefined
    imageDefaultValue: number | undefined = undefined
    imageMinValue: number | undefined = undefined
    imageMaxValue: number | undefined = undefined
    imageValue: number | undefined = undefined
    BLCMode: string | undefined = undefined
    BLCModeDefault: string | undefined = undefined
    HWDRLevel: string | undefined = undefined
    HWDRLevelDefault: string | undefined = undefined
    smartIrMode: string | undefined = undefined
    smartIrModeDefault: string | undefined = undefined
    lightLevelDefaultValue: number | undefined = undefined
    lightLevelMinValue: number | undefined = undefined
    lightLevelMaxValue: number | undefined = undefined
    lightLevelValue: number | undefined = undefined
    smartIrSwitch: boolean | undefined = undefined
    smartIrSwitchDefault: boolean | undefined = undefined
    smartIrLevel: string | undefined = undefined
    smartIrLevelDefault: string | undefined = undefined
    // 透雾
    defogValue: number | undefined = undefined
    defogDefaultValue: number | undefined = undefined
    defogMinValue: number | undefined = undefined
    defogMaxValue: number | undefined = undefined
    defogSwitch: boolean | undefined = undefined
    // 抗闪
    antiflicker: string | undefined = undefined
    antiflickerDefault: string | undefined = undefined
    // 曝光模式
    exposureMode: string | undefined = undefined
    exposureModeDefault: string | undefined = undefined
    exposureModeValue: number | undefined = undefined
    exposureModeDefaultValue: number | undefined = undefined
    exposureModeMinValue: number | undefined = undefined
    exposureModeMaxValue: number | undefined = undefined
    // 延迟时间
    delayTimeValue: number | undefined = undefined
    delayTimeDefaultValue: number | undefined = undefined
    delayTimeMinValue: number | undefined = undefined
    delayTimeMaxValue: number | undefined = undefined
    // 红外模式
    InfraredMode: string | undefined = undefined
    InfraredModeDefault: string | undefined = undefined
    // 增益限制
    gainMode: string | undefined = undefined
    gainModeDefault: string | undefined = undefined
    gainValue: number | undefined = undefined
    gainAGC: number | undefined = undefined
    gainAGCDefaultValue: number | undefined = undefined
    gainDefaultValue: number | undefined = undefined
    gainMinValue: number | undefined = undefined
    gainMaxValue: number | undefined = undefined
    IPCVersion = ''
    // 快门
    shutterMode: string | undefined = undefined
    shutterModeDefault: string | undefined = undefined
    shutterValue: string | undefined = undefined
    shutterValueDefault: string | undefined = undefined
    shutterLowLimit: string | undefined = undefined
    shutterLowLimitDefault: string | undefined = undefined
    shutterUpLimit: string | undefined = undefined
    shutterUpLimitDefault: string | undefined = undefined

    supportSchedule = false
    scheduleInfo = new ChannelScheduleInfo()
    // 白光灯
    whitelightMode: string | undefined = undefined
    whitelightModeDefault: string | undefined = undefined
    whitelightStrength: number | undefined = undefined
    whitelightStrengthMin: number | undefined = undefined
    whitelightStrengthMax: number | undefined = undefined
    whitelightStrengthDefault: number | undefined = undefined
    whitelightOnTime: string | undefined = undefined
    whitelightOnTimeDefault: string | undefined = undefined
    whitelightOffTime: string | undefined = undefined
    whitelightOffTimeDefault: string | undefined = undefined

    configFileTypeEnum: string[] = []
    shutterModeEnum: string[] = []
    shutterValueEnum: string[] = []
    whiteBalanceModeEnum: string[] = []
    BLCModeArray: string[] = []
    HWDRLevelArray: string[] = []
    IRCutModeArray: string[] = []
    IRCutConvSenArray: string[] = []
    SmartIrArray: string[] = []
    antiflickerModeArray: string[] = []
    InfraredModeArray: string[] = []
    exposureModeArray: string[] = []
    exposureValueArray: string[] = []
    gainModeEnum: string[] = []
    paletteList: Record<string, string>[] = []
    activeTab = 'imageAdjust'
}

export class ChannelScheduleInfo {
    scheduleType = 'full'
    scheduleInfoEnum: string[] = []
    program = ''
    dayTime = ''
    nightTime = ''
}

export class ChannelLensCtrl {
    id = ''
    supportAz = false
    focusType = ''
    focusTypeList: Record<string, string>[] = []
    timeInterval = ''
    timeIntervalList: Record<string, string>[] = []
    IrchangeFocus = false
    IrchangeFocusDisabled = false
}

export class ChannelMask extends ChannelRowStatus {
    id = ''
    name = ''
    chlIndex = ''
    chlType = ''
    switch = 'false'
    color = 'black'
    isSpeco = false
    mask: PrivacyMask[] = []
}

export class PrivacyMask {
    switch = false
    X = 0
    Y = 0
    width = 0
    height = 0
}

export class ChannelFisheye extends ChannelRowStatus {
    id = ''
    name = ''
    chlIndex = ''
    chlType = ''
    fishEyeMode = ''
    installType = ''
    fishEyeEnable = false
    supportFishEyeEnable = false
    HIKVISION = false
    privateProtocol = false
    reqCfgFail = false
}

export class ChannelMotion extends ChannelRowStatus {
    id = ''
    name = ''
    chlIndex = ''
    chlType = ''
    switch = false
    sensitivity = 1
    sensitivityMinValue = 1
    sensitivityMaxValue = 1
    holdTime = ''
    holdTimeList: string[] = []
    supportSMD = false
    isOnvifChl = false
    objectFilterCar: boolean | undefined = undefined
    objectFilterPerson: boolean | undefined = undefined
    column = 0
    row = 0
    areaInfo: string[] = []
}

export class ChannelPtzPresetChlDto {
    chlId = ''
    chlName = ''
    presetCount = 0
    maxCount = Infinity
    presets = [] as ChannelPtzPresetDto[]
}

export class ChannelPtzPresetDto {
    index = 0
    name = ''
}

export class ChannelPtzTraceChlDto {
    chlId = ''
    chlName = ''
    traceCount = 0
    maxCount = Infinity
    trace = [] as ChannelPtzTraceDto[]
}

export class ChannelPtzTraceDto extends ChannelPtzPresetDto {}

export class ChannelPtzCruiseChlDto {
    chlId = ''
    chlName = ''
    cruiseCount = 0
    maxCount = Infinity
    cruise = [] as ChannelPtzCruiseDto[]
}

export class ChannelPtzCruiseDto extends ChannelPtzPresetDto {}

export class ChannelPtzCruisePresetDto extends ChannelPtzPresetDto {
    id = 0
    speed = 5
    holdTime = 5
}

export class ChannelPtzCruisePresetForm {
    name = ''
    speed = 5
    holdTime = 5
}

export class ChannelPtzCruiseGroupChlDto {
    chlId = ''
    chlName = ''
    cruiseCount = 0
    maxCount = Infinity
    cruise = [] as ChannelPtzCruiseGroupCruiseDto[]
}

export class ChannelPtzCruiseGroupCruiseDto extends ChannelPtzPresetDto {
    id = 0
}

/**
 * @description 云台 任务 通道列表项
 */
export class ChannelPtzTaskChlDto {
    chlId = ''
    chlName = ''
    taskItemCount = 0
}

/**
 * @description 云台 任务列表项
 */
export class ChannelPtzTaskDto {
    index = 0
    enable = ''
    startTime = ''
    endTime = ''
    type = ''
    name = ''
    editIndex = ''
}

/**
 * @description 云台 任务 表单
 */
export class ChannelPtzTaskForm {
    startTime = '00:00'
    endTime = '00:00'
    name = 'No'
    type = 'NON'
}

/**
 * @description 云台 智能跟踪 通道列表项
 */
export class ChannelPtzSmartTrackDto extends ChannelRowStatus {
    chlId = ''
    chlName = ''
    autoBackSwitch = false
    autoBackTime = 0
    ptzControlMode = 'manual'
}

/**
 * @description 云台协议 通道列表项
 */
export class ChannelPtzProtocolDto extends ChannelRowStatus {
    [key: string]: any
    chlId = ''
    chlName = ''
    baudRate = ''
    protocol = ''
    baudRateOptions = [] as SelectOption<string, string>[]
    protocolOptions = [] as SelectOption<string, string>[]
    // status = 'loading'
    address = 1
    addressMin = 1
    addressMax = 1
    ptz = false
}

/**
 * @description 水印设置 通道列表项
 */
export class ChannelWaterMarkDto extends ChannelRowStatus {
    chlId = ''
    chlName = ''
    chlIndex = ''
    chlType = ''
    switch = 'false'
    customText = ''
}

/**
 * @description LOGO设置 通道列表项
 */
export class ChannelLogoSetDto extends ChannelRowStatus {
    [key: string]: any
    chlId = ''
    chlName = ''
    switch = 'false'
    opacity = 30
    minOpacity = 0
    maxOpacity = 100
    minX = 0
    maxX = 10000
    minY = 0
    maxY = 10000
    X = 0
    Y = 0
}
