/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 18:15:30
 * @Description: 系统的类型定义，类型命名的前缀统一为System*
 */
import { TableRowStatus } from './base'

/**
 * @description 网络状态列表
 */
export class SystemNetStatusList {
    i = 0 // 缩进数
    k = '' // 属性名
    v = '' // 属性值
}

/**
 * @description 录像状态列表
 */
export class SystemRecordStatusList {
    name = ''
    resolution = ''
    frameRate = 0
    quality = 0
    bitType = ''
    level = ''
    recStatus = ''
    streamType = ''
    recTypes: string[] = []
}

/**
 * @description 通道状态列表
 */
export class SystemChannelStatusList {
    name = ''
    online = false
    motionStatus = ''
    intelligentStatus = ''
    recStatus = ''
}

/**
 * @description 磁盘状态列表
 */
export class SystemDiskStatusList extends TableRowStatus {
    id = ''
    diskNum = ''
    raidType = ''
    size = 0
    freeSpace = 0
    combinedStatus = ''
    diskStatus = ''
    diskEncryptStatus = ''
    type = ''
    source = ''
    recTime = ''
    group = ''
    detail = []
    sortIndex = 0
    recFileDate = ''
}

export interface SystemAlarmStatusListData {
    id: string
    img?: string
    rec: {
        id: string
        text: string
    }[]
    alarmTime: string
    data: {
        key: string
        value: string
        span: number
        hide?: boolean
    }[]
}

/**
 * @description 报警状态列表
 */
export class SystemAlarmStatusList {
    id = ''
    type = ''
    // status = 0
    data: SystemAlarmStatusListData[] = []
    index = 0
}

/**
 * @description 自动更新表单
 */
export class SystemAutoMaintenanceForm {
    switch = false
    interval: number | undefined = undefined
    time = '00:00:00'
}

/**
 * @description 设备基本信息表单
 */
export class SystemBaseInfoForm {
    name = ''
    deviceNumber = ''
    productModel = ''
    videoType = ''
    hardwareVersion = ''
    mcuVersion = ''
    kenerlVersion = ''
    softwareVersion = ''
    sn = ''
    AndroidAppAddress = ''
    IOSAppAddress = ''
    PCBAV = ''
    PN = ''
    PCUI = ''
    launchDate = ''
    apiVersion = ''
    onvifVersion = ''
    onvifDevVersion = ''
    ocxVersion = ''
    showApp = false
    showGDPR = false
    qrCodeContent = ''
    qrCodeContentIsEnabled = false
    securityCode = ''
}

/**
 * @description 恢复出厂设置表单
 */
export class SystemFactoryDefaultForm {
    exceptNetworkConfigSwitch = 'false'
}

class SystemGeneralSettingDecoderResolution {
    id = 0
    onlineStatus = false
    decoder: { index: number; value: string }[] = []
}

/**
 * @description 全局配置表单
 */
export class SystemGeneralSettingForm {
    deviceName = '' // 设备名称
    deviceNameMaxByteLen = 32
    deviceNumber: number | undefined = undefined // 设备编号
    videoFormat = '' // 视频制式
    outputAdapt = false // 固定显示分辨率
    resolution: string[] = [] // 显示多路输出分辨率
    outputConfig = '' //
    enableGuide = false // 启用开机向导
    mobileStreamAdaption = false // App现场自适应
    enableAutoDwell = false // 自动轮询
    waitTime = 0 // 等待时长
    zeroOrAddIpc = false //
    superResolution = false
    decoderResolution: SystemGeneralSettingDecoderResolution[] = []
    decoder: Record<number, Record<number, string>> = {}
}

/**
 * @description 时间与日期配置表单
 */
export class SystemDateTimeForm {
    systemTime = '' // new Date() // 系统时间
    // isSync = false //  和计算机时间同步
    dateFormat = 'year-month-day' // 日期格式
    timeFormat = '24' // 时间格式
    syncType = '' // 同步方式
    timeServer = '' // 时间服务器
    timeServerMaxByteLen = 63
    timeZone = '' // 时区
    enableDST = false // 夏令时
    gpsBaudRate = ''
    gpsBaudRateMin = 0
    gpsBaudRateMax = 0
    ntpInterval = 0
    ntpIntervalMin = 0
    ntpIntervalMax = 0
}

export class SystemOutputSettingChlItem {
    id = ''
    winindex = 0
}

export class SystemOutputSettingChlGroup {
    segNum = 1
    chls: SystemOutputSettingChlItem[] = []
}

export class SystemOutputSettingDto {
    id = 0
    timeInterval = 0
    chlGroups: SystemOutputSettingChlGroup[] = []
}

export class SystemOutputSettingItem {
    id = 0
    isDwell = false
    // 轮询
    dwell: SystemOutputSettingDto = {
        id: 0,
        timeInterval: 5,
        chlGroups: [] as SystemOutputSettingChlGroup[],
    }
    // 预览
    preview: SystemOutputSettingDto = {
        id: 1,
        timeInterval: 0,
        chlGroups: [
            {
                segNum: 1,
                chls: [],
            },
        ] as SystemOutputSettingChlGroup[],
    }
    maxWin = 0
}

export class SystemOutputSettingDecoderItem {
    id = 0
    onlineStatus = false
    ShowHdmiIn = -1
    output: SystemOutputSettingItem[] = []
}

export class SystemOutputSettingForm {
    // 主输出
    main = new SystemOutputSettingItem()
    // 副输出
    sub: SystemOutputSettingItem[] = []
    // 解码卡
    decoder: SystemOutputSettingDecoderItem[] = [] // SystemOutputSettingItem[][] = []
}

/**
 * @description 输出配置 自定义视图表单
 */
export class SystemOutputSettingAddViewForm {
    name = ''
}

/**
 * @description 录像机OSD提交表单
 */
export class SystemRecorderOSDSettingsForm {
    nameEnable = 'false'
    iconEnable = 'false'
    addressEnable = 'false'
}

/**
 * @description 热备机配置提交表单
 */
export class HotStandbySettingsForm {
    switch = false
    workMode = ''
}

/**
 * @description 工作机配置提交表单
 */
export class WorkMachineSettingsForm {
    ip = ''
    port = 0
    userName = 'admin'
    password = ''
}

/**
 * @description 系统升级表单
 */
export class SystemUpgradeForm {
    filePath = ''
}

/**
 * @description 系统升级备份表单
 */
export class SystemUpgradeBackUpForm extends SystemUpgradeForm {}

/**
 * @description 系统恢复表单
 */
export class SystemRestoreForm extends SystemUpgradeForm {}

/**
 * @description 系统备份表单
 */
export class SystemBackUpForm extends SystemUpgradeForm {
    configSwitch: string[] = []
}

/**
 * @description 系统日志 表单
 */
export class SystemLogForm {
    type = ''
    currentPage = 1
    pageSize = 20
    startTime = ''
    endTime = ''
    subType: string[] = []
}

/**d
 * @description 系统日志列表项
 */
export class SystemLogList {
    logType = ''
    clientType = ''
    time = ''
    userName = ''
    subType = ''
    mainType = ''
    content = ''
    chl = { id: '', text: '' }
    triggerRecChls: { id: string; text: string }[] = []
    index = 0
    detailsExtra = ''
    combFaceID = ''
    combTime = ''
    combFaceName = ''
    combChl = ''
}

/**
 * @description POS 开始结束字符 列表项
 */
export interface SystemPosListStartEndChar {
    startChar: string
    endChar: string
}

/**
 * @description POS 通道列表
 */
export interface SystemPosListChls {
    value: string
    label: string
    till?: string
}

/**
 * @description POS 通道色彩选项
 */
export class SystemPostColorData {
    index = 0
    chlId = ''
    name = ''
    colorList: string[] = []
    printMode = ''
    previewDisplay = false
}

/**
 * @description POS Display Set
 */
export class SystemPostDisplaySet {
    xmin = 0
    xmax = 0
    ymin = 0
    ymax = 0
    wmin = 0
    hmin = 0
}

/**
 * @description POS连接配置表单
 */
export class SystemPosConnectionForm {
    ip = ''
    port: number | undefined = undefined
    switch = false
    posPortType = 'remote'
}

/**
 * @description POS显示BOX坐标
 */
export class SystemPosDisplayPosition {
    width = 320
    height = 128
    X = 0
    Y = 0
}

/**
 * @description POP显示配置
 */
export class SystemPosDisplaySetting {
    common = {
        startEndChar: [] as SystemPosListStartEndChar[],
        lineBreak: [] as string[],
        ignoreChar: [] as string[],
        ignoreCase: false,
        timeOut: 10,
    }
    displayPosition = new SystemPosDisplayPosition()
}

/**
 * @description POS列表项
 */
export class SystemPosList {
    id = ''
    name = ''
    switch = 'false'
    connectionType = ''
    manufacturers = ''
    connectionSetting = {
        posIp: '',
        filterDstIpSwitch: false,
        dstIp: '',
        filterPostPortSwitch: false,
        posPort: 0,
        filterDstPortSwitch: false,
        dstPort: 0,
        posPortType: '',
    }
    encodeFormat = ''
    displaySetting = new SystemPosDisplaySetting()
    triggerChl = {
        switch: false,
        chls: [] as SystemPosListChls[],
    }
    // tillMode = {
    //     lastTillMode: false,
    //     currentTillMode: false,
    // }
}

/**
 * @description 开机向导 语言与地区表单
 */
export class SystemGuideLangForm {
    lang = ''
    regionId = ''
    regionCode = ''
}

/**
 * @description 开机向导 用户隐私表单
 */
export class SysmteGuidePrivacyForm {
    checked = false
}

/**
 * @description 开机向导 日期时间表单
 */
export class SystemGuideDateTimeForm {
    systemTime = '' // new Date() // 系统时间
    dateFormat = 'year-month-day' // 日期格式
    timeFormat = '24' // 时间格式
    syncType = '' // 同步方式
    timeServer = '' // 时间服务器
    gpsBaudRate = '' // 波特率
    gpsBaudRateMin = 0 // 波特率 最小值
    gpsBaudRateMax = 0 // 波特率 最大值
    ntpInterval = 0 // 时间间隔[分]
    ntpIntervalMin = 0 // 时间间隔[分] 最小值
    ntpIntervalMax = 0 // 时间间隔[分] 最大值
    timeZone = '' // 时区
    enableDST = false // 夏令时
    videoType = '' // 视频格式
}

/**
 * @description 开机向导 账户表单
 */
export class SystemGuideUserForm {
    userName = 'admin'
    password = ''
    confirmPassword = ''
}

/**
 * @description 开机向导 通道配置（通道默认协议密码/通道IP规划）表单
 */
export class SystemGuideChlConfigForm {
    password = ''
    checked = false
}

/**
 * @description 开机向导 Email和密保问题表单 - 密保问题表单
 */
export class SystemGuideQuestionForm {
    id = ''
    question = ''
    answer = ''
}

/**
 * @description 开机向导 Email和密保问题表单 - Email
 */
export class SystemGuideEmailForm {
    checked = false // e-mail是否启用
    email = ''
}

/**
 * @description 开机向导 磁盘列表
 */
export class SystemGuideDiskList {
    id = ''
    name = ''
    type = ''
    size = 0
    combinedStatus = ''
    diskStatus = ''
    serialNum = ''
}

/**
 * @description 本地配置表单
 */
export class SystemLocalConfig {
    snapCount = 5
    liveSnapSavePath = ''
    recSavePath = ''
    recBackUpPath = ''
}

/**
 * @description POE电源管理列表
 */
export class SystemPoeList {
    id = ''
    poeName = ''
    switch = ''
    power = ''
}

export class SystemPoeExtensionList {
    id = ''
    poeName = ''
    switch = false
}

/**
 * @description 报警图像上传表格项
 */
export class SystemImageUploadAlarmItem {
    id = ''
    chlNum = 0
    name = ''
    preTime = ''
    saveTime = ''
    rowDisable = false
}

/**
 * @description 定时图像上传表格项
 */
export class SystenSHDBImageUploadDto {
    chlId = ''
    chlNum = 0
    name = ''
    timeCount = 0
    timelist: SelectOption<string, string>[] = []
}

/**
 * @description 平台操作管理表格项
 */
export class SystemSHDBPlatformOperatorDto {
    chlId = ''
    chlNum = 0
    name = ''
}

/**
 * @description 地标平台参数 表单
 */
export class SystemSHDBPlatformParameterForm {
    enable = false
    proxyId = ''
    ip = ''
    domain = ''
    isDomain = true
    port = 5901
    resolution = ''
    level = ''
    holdTime = ''
}

/**
 * @description
 */
export class SystemDebugModeForm {
    debugModeSwitch = false
    timeLen = 1
    userName = ''
    password = ''
    startTime = 0
    endTime = 0
}

export class SystemRS485Form {
    switch = false
    name = ''
}

export class SystemRS485Dto {
    id = ''
    name = ''
    baudrate = 9600
    addrID = 0
    protocol = 'PELCOD'
    code = ''
    operate = ''
    settingInfos = ''
}

/**
 * @description 热备机模式下的工作机列表
 */
export class SystemWorkMachineDto {
    ip = ''
    port = 0
    index = 0
    connectStatus = ''
    workStatus = ''
    statusCode = 0
    syncErrorCode = 0
    networkErrorCode = 0
    syncVideoProgress = 0
}
