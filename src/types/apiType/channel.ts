/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-08 17:03:07
 * @Description: 通道的类型定义，类型命名的前缀统一为Channel*
 */
import { TableRowStatus } from './base'

/**
 * @description 通道列表项
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
    poeIndex = 0
    manufacturer = ''
    autoReportID = ''
    productModel = {
        factoryName: '',
        innerText: '',
    }
    index = 0
    chlIndex = 0
    isOnline = false
    chlType = ''
    version = ''
    delDisabled = false
    showSetting = true
    upgradeStatus: 'normal' | 'notActive' | 'progress' | 'error' | 'success' = 'normal' // normal：初始状态， notActive：未激活， progress：正在升级， error：升级失败/校验头文件失败, success：升级成功
    upgradeProgressText = '' // 升级进度
    supportJump = false
    supportSetting = false
}

export class ChannelEditForm {
    chlNum = ''
    name = ''
    nameMaxByteLen = 63
    port = 0
    manufacturer = ''
    productModel = {
        factoryName: '',
        innerText: '',
    }
    userName = ''
    userNameMaxByteLen = 63
    autoReportID = ''
    chlIndex = 0
    ip = ''
    password = ''
}

export interface ChannelIPCUpgradeExpose {
    init: (type: 'single' | 'multiple', data: ChannelInfoDto[]) => void
    initWsState: (list: ChannelInfoDto[]) => void
}

/**
 * @description 通道 默认密码表单
 */
export class ChannelDefaultPwdDto {
    id = ''
    userName = ''
    password = ''
    displayName = ''
    protocolType = ''
    showInput = false
    port = 0
}

export class ChannelAddMultiChlList {
    chlType: string | number = ''
    chlLabel = ''
    type: string | number = ''
    disabled = true
    checked = false
}

/**
 * @description 快速添加通道 列表项
 */
export class ChannelQuickAddDto {
    ip = ''
    chlNum = 0
    port = 0
    httpPort = 0
    httpType = ''
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
    localEthName = ''
    subIp = ''
    subIpNetMask = ''
    channelNumber = 0
    multiChlList: ChannelAddMultiChlList[] = []
}

/**
 * @description 手动添加 通道列表项
 */
export class ChannelManualAddDto {
    name = ''
    ip = ''
    chlNum = 0
    domain = ''
    port = 10
    userName = ''
    password = ''
    manufacturer = ''
    protocolType = ''
    addrType = ''
    portDisabled = false
    industryProductType = ''
    channelNumber = 0
    multiChlList: ChannelAddMultiChlList[] = []
    fisheyeStreamType = ''
    errorMsg = ''
}

/**
 * @description 添加录像通道
 */
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

/**
 * @description
 */
export class ChannelAddReportDto {
    autoReportID = ''
    ip = ''
    port = 0
    manufacturer = ''
    protocolType = ''
    username = ''
    password = ''
    chlNum = 0
}

/**
 * @description 编辑IPC IP表单
 */
export class ChannelAddEditIPCIpDto {
    mac = ''
    ip = ''
    mask = ''
    gateway = ''
    userName = ''
    password = ''
}

/**
 * @description 录像通道列表项
 */
export class ChannelRecorderDto {
    index = 0
    name = ''
    isAdded = false
    bandWidth = ''
    productModel = ''
}

/**
 * @description 添加录像通道列表项
 */
export class ChannelRecorderAddDto {
    ip = ''
    domain = ''
    chkDomain = false
    servePort = 6036
    httpPort = 80
    channelCount = 8
    userName = ''
    password = ''
    useDefaultPwd = true
    recorderList: Array<ChannelRecorderDto> = []
}

export class ChannelRTSPPropertyDto {
    displayName = ''
    index = ''
}

/**
 * @description 查询IPC列表
 */
export class ChannelQueryNodeListDto {
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
    isSupportFishEyeConfig = false
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
    isSupportRegionStatistics = false
    isSupportVehicleDirection = false
    isSupportRS485Ptz = false
    authList = ''
    chlType = ''
    ignoreNdChl = false
    requireField: string[] = []
}

/**
 * @description 设置协议
 */
export class ChannelResourcesPathDto {
    streamType = ''
    protocol = ''
    transportProtocol = ''
    port = 10
    path = ''
}

/**
 * @description 协议管理列表项
 */
export class ChannelProtocolManageDto {
    id = ''
    enabled = false
    displayName = ''
    label = ''
    resourcesPath: ChannelResourcesPathDto[] = []
}

/**
 * @description
 */
export class ChannelMultiChlCheckedInfoDto {
    operateIndex = 0
    chlType = ''
    chlLabel = ''
    checked = true
    disabled = false
}

/**
 * @description
 */
export class ChannelMultiChlIPCAddDto extends ChannelManualAddDto {
    multichannelCheckedInfoList: ChannelMultiChlCheckedInfoDto[] = []
    type = ''
}

/**
 * @description 通道组 列表项
 */
export class ChannelGroupDto {
    id = ''
    nameMaxByteLen = 63
    name = ''
    dwellTime = 0
    chlCount = 0
    chls: Record<string, string | boolean>[] = []
}

/**
 * @description 通道信号配置 列表项
 */
export class ChannelSignalDto {
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

/**
 * @description OSD配置 列表项
 */
export class ChannelOsdDto extends TableRowStatus {
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

/**
 * @description 图像设置 列表项
 */
export class ChannelImageDto extends TableRowStatus {
    id = ''
    name = ''
    chlType = ''
    AccessType = ''

    isSupportImageFusion = false

    imageFusion = {
        switch: false,
        distance: 0,
        distanceUnit: '',
        distanceMin: 0,
        distanceMax: 0,
        distanceFmin: 0,
        distanceFmax: 0,
        distanceDefault: 0,
        distanceFdefault: 0,
        poolid: 0,
        poolidDefault: 0,
        poolidMin: 0,
        poolidMax: 0,
        fusespeed: 0,
        fusespeedDefault: 0,
        fusespeedMin: 0,
        fusespeedMax: 0,
    }

    isSupportHallway = false //是否支持走廊模式
    isSupportIRCutMode = false //是否支持日夜模式
    // isSupportThermal = false // 是否热成像通道
    isSpeco = false

    bright: number | undefined = undefined
    brightMin = 0
    brightMax = 100
    brightDefault: number | undefined = undefined

    contrast: number | undefined = undefined
    contrastMin = 0
    contrastMax = 100
    contrastDefault: number | undefined = undefined

    saturation: number | undefined = undefined
    saturationMin = 0
    saturationMax = 100
    saturationDefault: number | undefined = undefined

    hue: number | undefined = undefined
    hueMin: number | undefined = undefined
    hueMax: number | undefined = undefined
    hueDefault: number | undefined = undefined

    paletteCode: string | undefined = undefined
    defaultPaletteCode: string | undefined = undefined

    cfgFile: string | undefined = undefined
    cfgFileDefault: string | undefined = undefined

    denoise: number | undefined = undefined
    denoiseDefault: number | undefined = undefined
    denoiseMin = 0
    denoiseMax = 100
    denoiseSwitch: boolean | undefined = false
    denoiseSwitchDefault: boolean | undefined = false

    // ShowGainMode: boolean | undefined = false

    WDR: number | undefined = undefined
    WDRDefault: number | undefined = undefined
    WDRMin = 0
    WDRMax = 100
    WDRSwitch: boolean | undefined = false
    WDRSwitchDefault: boolean | undefined = false

    dZoom: string | undefined = undefined
    dZoomDefault: string | undefined = undefined

    HFR: boolean | undefined = undefined

    whiteBalanceMode: string | undefined = undefined
    whiteBalanceModeDefault: string | undefined = undefined

    red: number | undefined = undefined
    redDefault: number | undefined = undefined
    redMin = 0
    redMax = 100

    blue: number | undefined = undefined
    blueDefault: number | undefined = undefined
    blueMin = 0
    blueMax = 100

    IRCutMode: string | undefined = undefined
    IRCutModeDefault: string | undefined = undefined
    IRCutConvSen: string | undefined = undefined
    IRCutConvSen2: string | undefined = undefined // 只用于判断
    IRCutConvSenDefault: string | undefined = undefined
    IRCutDayTime: string | undefined = undefined
    IRCutNightTime: string | undefined = undefined

    sharpen: number | undefined = undefined
    sharpenDefault: number | undefined = undefined
    sharpenMin = 0
    sharpenMax = 100
    sharpenSwitch: boolean | undefined = undefined
    sharpenSwitchDefault: boolean | undefined = undefined
    sharpenSwitchEnable: boolean | undefined = undefined

    mirrorSwitchDefault: boolean | undefined = undefined
    mirrorSwitch: boolean | undefined = undefined

    flipSwitchDefault: boolean | undefined = undefined
    flipSwitch: boolean | undefined = undefined

    imageRotate: string | undefined = undefined
    imageRotateDefault: string | undefined = undefined

    imageShift: number | undefined = undefined
    imageShiftDefault: number | undefined = undefined
    imageShiftMin = 0
    imageShiftMax = 100

    BLCMode: string | undefined = undefined
    BLCModeDefault: string | undefined = undefined

    HWDRLevel: string | undefined = undefined
    HWDRLevelDefault: string | undefined = undefined
    HWDRMutexRotao = false

    smartIrMode: string | undefined = undefined
    smartIrModeDefault: string | undefined = undefined

    lightLevel: number | undefined = undefined
    lightLevelDefault: number | undefined = undefined
    lightLevelMin = 0
    lightLevelMax = 100

    smartIrSwitch: boolean | undefined = undefined
    smartIrSwitchDefault: boolean | undefined = undefined

    smartIrLevel: string | undefined = undefined
    smartIrLevelDefault: string | undefined = undefined

    // 透雾
    defog: number | undefined = undefined
    defogDefault: number | undefined = undefined
    defogMin = 0
    defogMax = 100
    defogSwitchDefault: boolean | undefined = undefined
    defogSwitch: boolean | undefined = undefined

    // 抗闪
    antiflicker: string | undefined = undefined
    antiflickerDefault: string | undefined = undefined

    // 曝光模式
    exposureMode: string | undefined = undefined
    exposureModeDefault: string | undefined = undefined
    exposure: number | undefined = undefined
    exposureDefault: number | undefined = undefined
    exposureMin = 0
    exposureMax = 100

    // 延迟时间
    delayTime: number | undefined = undefined
    delayTimeDefault: number | undefined = undefined
    delayTimeMin = 0
    delayTimeMax = 100

    // 红外模式
    InfraredMode: string | undefined = undefined
    InfraredModeDefault: string | undefined = undefined

    // 红外灯的亮度
    irLightBright: number | undefined = undefined
    irLightBrightDefault: number | undefined = undefined
    irLightBrightMin = 0
    irLightBrightMax = 100

    // 增益限制
    noGainMode = false
    gainMode: string | undefined = undefined
    gainModeDefault: string | undefined = undefined
    gainAGC: number | undefined = undefined
    gainAGCDefault: number | undefined = undefined
    gainAGCMin = 0
    gainAGCMax = 100
    gain: number | undefined = undefined
    gainDefault: number | undefined = undefined
    gainMin = 0
    gainMax = 100

    IPCVersion = ''

    // 快门
    shutterMode: string | undefined = undefined
    shutterModeDefault: string | undefined = undefined
    shutter: string | undefined = undefined
    shutterDefault: string | undefined = undefined
    shutterLowLimit: string | undefined = undefined
    shutterLowLimitDefault: string | undefined = undefined
    shutterUpLimit: string | undefined = undefined
    shutterUpLimitDefault: string | undefined = undefined

    supportSchedule = false
    scheduleInfo = new ChannelScheduleInfoDto()

    // 白光灯
    whitelightMode: string | undefined = undefined
    whitelightModeDefault: string | undefined = undefined
    whitelightStrength: number | undefined = undefined
    whitelightStrengthMin = 0
    whitelightStrengthMax = 100
    whitelightStrengthDefault: number | undefined = undefined
    whitelightOnTime: string | undefined = undefined
    whitelightOnTimeDefault: string | undefined = undefined
    whitelightOffTime: string | undefined = undefined
    whitelightOffTimeDefault: string | undefined = undefined

    antiShakeDsp: boolean | undefined = undefined
    illumination: string | undefined = undefined
    ImageOverExposure: string | undefined = undefined

    cfgFileList: SelectOption<string, string>[] = []
    shutterModeList: SelectOption<string, string>[] = []
    shutterList: SelectOption<string, string>[] = []
    whiteBalanceModeList: SelectOption<string, string>[] = []
    BLCModeList: SelectOption<string, string>[] = []
    HWDRLevelList: SelectOption<string, string>[] = []
    IRCutModeList: SelectOption<string, string>[] = []
    IRCutConvSenList: SelectOption<string, string>[] = []
    SmartIrList: SelectOption<string, string>[] = []
    antiflickerModeList: SelectOption<string, string>[] = []
    InfraredModeList: SelectOption<string, string>[] = []
    exposureModeList: SelectOption<string, string>[] = []
    exposureList: SelectOption<number, string>[] = []
    gainModeList: SelectOption<string, string>[] = []
    paletteList: SelectOption<string, string>[] = []
    DigitalZoomList: SelectOption<string, string>[] = []
    illuminationModeList: SelectOption<string, string>[] = []
    ImageOverExposureModeList: SelectOption<string, string>[] = []
    activeTab = 'imageAdjust'
}

/**
 * @description
 */
export class ChannelScheduleInfoDto {
    scheduleType = 'full'
    scheduleInfoEnum: string[] = []
    program = ''
    time: [string, string] = ['00:00:00', '00:00:00']
    // dayTime = ''
    // nightTime = ''
}

/**
 * @description 镜头控制
 */
export class ChannelLensCtrlDto {
    id = ''
    supportAz = false
    focusType = ''
    focusTypeList: SelectOption<string, string>[] = []
    timeInterval = ''
    timeIntervalList: SelectOption<string, string>[] = []
    IrchangeFocus = false
    IrchangeFocusDisabled = false
}

/**
 * @description 视频遮罩 列表项
 */
export class ChannelMaskDto extends TableRowStatus {
    id = ''
    name = ''
    chlIndex = ''
    chlType = ''
    switch = false
    color = 'black'
    protocolType = ''
    // isSpeco = false
    mask: ChannelPrivacyMaskDto[] = []
    maxCount = 0
    isPtz = false
    presetList: SelectOption<string, string>[] = []
    preset = ''
}

/**
 * @description
 */
export class ChannelPrivacyMaskDto {
    areaIndex = 0
    id: number | string = ''
    switch = false
    X = 0
    Y = 0
    width = 0
    height = 0
    color = ''
    isDrawing = false
    isSelect = false
}

/**
 * @description 鱼眼
 */
export class ChannelFisheyeDto extends TableRowStatus {
    id = ''
    name = ''
    chlIndex = ''
    chlType = ''
    fishEyeMode = ''
    installType = ''
    fishEyeEnable = false
    supportFishEyeEnable = false
    HIKVISION = false
    isPrivateProtocol = false
    reqCfgFail = false
    fishEyeModeList: SelectOption<string, string>[] = []
}

/**
 * @description 移动侦测
 */
export class ChannelMotionDto extends TableRowStatus {
    id = ''
    name = ''
    chlIndex = ''
    chlType = ''
    switch = false
    sensitivity = 1
    sensitivityMin = 1
    sensitivityMax = 1
    holdTime = 0
    holdTimeList: SelectOption<number, string>[] = []
    supportSMD = false
    isOnvifChl = false
    SMDHuman = false
    SMDVehicle = false
    SMDHumanDisabled = false
    SMDVehicleDisabled = false
    column = 0
    row = 0
    areaInfo: string[] = []
}

/**
 * @description 预置点 通道列表项
 */
export class ChannelPtzPresetChlDto {
    chlId = ''
    chlName = ''
    presetCount = 0
    maxCount = 128
    presets: ChannelPtzPresetDto[] = []
    nameMaxByteLen = 63
    disabled = false
    supportPtz = false
    supportAZ = false
    supportIris = false
    minSpeed = 1
    maxSpeed = 8
    supportIntegratedPtz = false
}

/**
 * @description 预置点 列表项
 */
export class ChannelPtzPresetDto {
    index = 0
    name = ''
}

/**
 * @description 轨迹 通道列表项
 */
export class ChannelPtzTraceChlDto {
    chlId = ''
    chlName = ''
    traceCount = 0
    maxCount = Infinity
    trace: ChannelPtzTraceDto[] = []
    traceMaxHoldTime = 180
    nameMaxLen = 10
    minSpeed = 1
    maxSpeed = 8
}

/**
 * @description 轨迹
 */
export class ChannelPtzTraceDto extends ChannelPtzPresetDto {}

/**
 * @description 巡航线 通道列表项
 */
export class ChannelPtzCruiseChlDto {
    chlId = ''
    chlName = ''
    cruiseCount = 0
    maxCount = 8
    cruise: ChannelPtzCruiseDto[] = []
    cruisePresetMinSpeed = 1
    cruisePresetMaxSpeed = 8
    cruisePresetMinHoldTime = 5
    cruisePresetMaxHoldTime = 100
    cruisePresetDefaultHoldTime = 5
    cruisePresetMaxCount = 16
    cruisePresetHoldTimeList: SelectOption<number, string>[] = []
    cruiseNameMaxLen = 64
}

/**
 * @description 巡航线 列表项
 */
export class ChannelPtzCruiseDto extends ChannelPtzPresetDto {
    number = 0
}

/**
 * @description 巡航线-预置点
 */
export class ChannelPtzCruisePresetDto extends ChannelPtzPresetDto {
    id = 0
    speed = 5
    holdTime = 5
}

/**
 * @description 巡航线-新增预置点表单
 */
export class ChannelPtzCruisePresetForm {
    name = ''
    speed = 5
    holdTime = 5
}

/**
 * @description 巡航线组 列表项
 */
export class ChannelPtzCruiseGroupChlDto {
    chlId = ''
    chlName = ''
    cruiseCount = 0
    maxCount = Infinity
    cruise: ChannelPtzCruiseGroupCruiseDto[] = []
}

/**
 * @description 巡航线组 新增轨迹 列表项
 */
export class ChannelPtzCruiseGroupCruiseDto extends ChannelPtzPresetDto {
    number = 0
}

/**
 * @description 云台 任务 通道列表项
 */
export class ChannelPtzTaskChlDto {
    chlId = ''
    chlName = ''
    taskItemCount = 0
    presetList: SelectOption<number, string>[] = []
    traceList: SelectOption<number, string>[] = []
    cruiseList: SelectOption<number, string>[] = []
    preMin = 0
    preMax = 1
    cruMin = 0
    cruMax = 1
    traMin = 0
    traMax = 1
    tasks: ChannelPtzTaskDto[] = []
    maxCount = 8
    status = false
}

/**
 * @description 云台 任务列表项
 */
export class ChannelPtzTaskDto {
    startTime = '00:00'
    endTime = '00:00'
    type = 'PRE'
    editIndex = 0
}

/**
 * @description 云台 智能跟踪 通道列表项
 */
export class ChannelPtzSmartTrackDto extends TableRowStatus {
    chlId = ''
    chlName = ''
    autoBackSwitch = false
    autoBackTime = 0
    ptzControlMode = 'manual'
}

/**
 * @description 云台协议 通道列表项
 */
export class ChannelPtzProtocolDto extends TableRowStatus {
    chlId = ''
    chlName = ''
    baudRate = ''
    protocol = ''
    baudRateOptions: SelectOption<string, string>[] = []
    protocolOptions: SelectOption<string, string>[] = []
    // status = 'loading'
    address = 1
    addressMin = 1
    addressMax = 1
}

/**
 * @description 云台-看守位
 */
export class ChannelPtzGuardDto extends TableRowStatus {
    chlId = ''
    chlName = ''
    chlIndex = 0
    chlType = ''
    locationArr: string[] = []
    type_number: number[] = []
    minSpeed = 0
    maxSpeed = 8
    enable = false
    location = ''
    number = 0
    waitTime = 0
    name = ''
    preMin = 0
    preMax = 1
    cruMin = 0
    cruMax = 1
    traMin = 0
    traMax = 1
    waitTimeMin = 0
    waitTimeMax = 1
    presetList: SelectOption<number, string>[] = []
    traceList: SelectOption<number, string>[] = []
    cruiseList: SelectOption<number, string>[] = []
}

/**
 * @description 水印设置 通道列表项
 */
export class ChannelWaterMarkDto extends TableRowStatus {
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
export class ChannelLogoSetDto extends TableRowStatus {
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

export class ChannelIpSpeakerDto {
    id = ''
    index = 0
    name = ''
    ip = ''
    port = 0
    status = false
    protocolType = ''
    associatedDeviceID = ''
    associatedDeviceName = ''
    associatedType = ''
    username = ''
}

export class ChannelIpSpeakerDevDto {
    ip = ''
    port = 0
    httpPort = 0
    productModel = ''
    protocolType = ''
    devName = ''
}

export class ChannelIpSpeakerAddDto {
    ip = '0.0.0.0'
    protocolType = 'OVNIF'
    port = 80
    userName = 'admin'
    password = ''
    association = ''
    defaultPwd = false
    associatedDeviceID = ''
    devName = ''
}

export class ChannelSplicingDto {
    spliceTypeList: SelectOption<string, string>[] = []
    spliceType = ''
    spliceDistance = 0
    spliceDistanceMin = 0
    spliceDistanceMax = 100
    spliceDistanceDefault = 0
}

export class ChannelFillLightDto {
    duration = 0
    durationList: SelectOption<number, string>[] = []
    boundary: { area: number; maxCount: number; LineColor?: string; point: CanvasBasePoint[] }[] = []
    objectFilter = {
        supportPerson: false,
        supportPersonSwitch: false,
        personSwitch: false,
        personSensitivity: 0,
        personSensitivityMin: 0,
        personSensitivityMax: 100,

        supportCar: false,
        supportCarSwitch: false,
        carSwitch: false,
        carSensitivity: 0,
        carSensitivityMin: 0,
        carSensitivityMax: 100,

        supportMotor: false,
        supportMotorSwitch: false,
        motorSwitch: false,
        motorSensitivity: 0,
        motorSensitivityMin: 0,
        motorSensitivityMax: 100,
    }
}
