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
    productModel = {
        factoryName: '',
        innerText: '',
    }
    index = 0
    chlIndex = ''
    isOnline = false
    chlType = ''
    version = ''
    delDisabled = false
    showSetting = true
    upgradeStatus: 'normal' | 'notActive' | 'progress' | 'error' | 'success' = 'normal' // normal：初始状态， notActive：未激活， progress：正在升级， error：升级失败/校验头文件失败, success：升级成功
    upgradeProgressText = '' // 升级进度
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
}

/**
 * @description 快速添加通道 列表项
 */
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

/**
 * @description 手动添加 通道列表项
 */
export class ChannelManualAddDto {
    name = ''
    ip = ''
    domain = ''
    port = 10
    userName = ''
    password = ''
    manufacturer = ''
    protocolType = ''
    addrType = ''
    portDisabled = false
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

    isSupportHallway = false //是否支持走廊模式
    isSupportIRCutMode = false //是否支持日夜模式
    isSupportThermal = false // 是否热成像通道
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
    denoiseSwitch = false

    ShowGainMode: boolean | undefined = false

    WDR: number | undefined = undefined
    WDRDefault: number | undefined = undefined
    WDRMin = 0
    WDRMax = 100
    WDRSwitch = false

    HFR: boolean | undefined = undefined

    whiteBalanceMode: string | undefined = undefined

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
    sharpenSwitch = false
    sharpenSwitchEnable: boolean | undefined = undefined

    mirrorSwitch: boolean | undefined = undefined
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
    defogSwitch = false

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

    // 增益限制
    gainMode: string | undefined = undefined
    gainModeDefault: string | undefined = undefined
    gainAGC: number | undefined = undefined
    gainAGCDefault: number | undefined = undefined
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
    switch = 'false'
    color = 'black'
    isSpeco = false
    mask: ChannelPrivacyMaskDto[] = []
}

/**
 * @description
 */
export class ChannelPrivacyMaskDto {
    switch = false
    X = 0
    Y = 0
    width = 0
    height = 0
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
    sensitivityMinValue = 1
    sensitivityMaxValue = 1
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
    maxCount = Infinity
    presets: ChannelPtzPresetDto[] = []
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
    maxCount = Infinity
    cruise: ChannelPtzCruiseDto[] = []
}

/**
 * @description 巡航线 列表项
 */
export class ChannelPtzCruiseDto extends ChannelPtzPresetDto {}

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
    [key: string]: any
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
    ptz = false
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
