/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-08 17:03:07
 * @Description:
 */

export class ChannelInfoDto {
    id = ''
    chlNum = ''
    name = ''
    devID = ''
    ip = ''
    port = ''
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
    chlStatus = ''
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
    port = ''
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
    port = ''
    version = ''
    name = ''
    serialNum = ''
    chlTotalCount = ''
    httpPort = ''
    chlAddedCount = ''
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
    servePort = ''
    httpPort = ''
    channelCount = ''
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
    port = ''
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

export class ChannelOsd {
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
