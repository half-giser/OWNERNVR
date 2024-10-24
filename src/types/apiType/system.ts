/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 18:15:30
 * @Description: 系统
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-24 14:30:26
 */

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
    frameRate = ''
    quality = ''
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
export class SystemDiskStatusList {
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
    gridRowStatus = 'loading'
    gridRowDisabled = true
    gridRowStatusInitTooltip = ''
    sortIndex = 0
}

export interface SystemAlarmStatusListData {
    id: string
    img?: string
    rec: {
        id: string
        text: string
    }[]
    alarmTime: string
    data: { key: string; value: string; span: number; hide?: boolean }[]
}

/**
 * @description 报警状态列表
 */
export class SystemAlarmStatusList {
    id = ''
    type = ''
    // status = 0
    data = [] as SystemAlarmStatusListData[]
    index = 0
}

/**
 * @description 自动更新表单
 */
export class SystemAutoMaintenanceForm {
    switch = false
    interval = undefined as number | undefined
    time = new Date(2000, 0, 1, 0, 0)
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
}

/**
 * @description 恢复出厂设置表单
 */
export class SystemFactoryDefaultForm {
    exceptNetworkConfigSwitch = 'false'
}

/**
 * @description 全局配置表单
 */
export class SystemGeneralSettingForm {
    deviceName = '' // 设备名称
    deviceNumber = 0 // 设备编号
    videoFormat = '' // 视频制式
    outputAdapt = false // 固定显示分辨率
    resolution: string[] = [] // 显示多路输出分辨率
    outputConfig = '' //
    enableGuide = false // 启用开机向导
    mobileStreamAdaption = false // App现场自适应
    enableAutoDwell = false // 自动轮询
    waitTime = 0 // 等待时长
    zeroOrAddIpc = false //
    decoder: Record<number, Record<number, string>> = {}
}

/**
 * @description 时间与日期配置表单
 */
export class SystemDateTimeForm {
    systemTime = '' // new Date() // 系统时间
    isSync = false //  和计算机时间同步
    dateFormat = 'year-month-day' // 日期格式
    timeFormat = '24' // 时间格式
    syncType = '' // 同步方式
    timeServer = '' // 时间服务器
    timeZone = '' // 时区
    enableDST = false // 夏令时
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
    isIncludeNetworkConfig = false
    isIncludeDataEncryptPwd = false
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
    subType = [] as string[]
}

/**
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
    triggerRecChls = [] as { id: string; text: string }[]
    index = 0
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
    chlId = ''
    name = ''
    colorList = [] as string[]
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
    port = undefined as number | undefined
    switch = false
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
    timeZone = '' // 时区
    enableDST = false // 夏令时
    videoType = ''
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
 * @description 开机向导 密保问题表单
 */
export class SystemGuideQuestionForm {
    id = ''
    question = ''
    answer = ''
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
export class ImageUploadDto {
    chlId = ''
    chlNum = 0
    name = ''
    timeCount = 0
    timelist = [] as SelectOption<string, string>[]
}
