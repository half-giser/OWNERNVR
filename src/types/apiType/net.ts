/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 14:47:05
 * @Description: 网络
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-16 14:43:47
 */

/**
 * @description 端口表单
 */
export class NetPortForm {
    httpPort = 0
    httpsPort = 0
    netPort = 0
    posPort = 0
    // rtspPort = 0
    virtualHostEnabled = false
}

export class NetPortUPnPPortDto {
    portType = ''
    externalPort = ''
    externalIP = ''
    localPort = ''
    status = ''
}

export class NetPortUPnPDto {
    switch = ''
    mappingType = ''
    portsType = ''
    ports = [] as NetPortUPnPPortDto[]
}

export class NetPortApiServerForm {
    apiserverSwitch = false
    authenticationType = ''
}

export class NetPortRtspServerForm {
    rtspServerSwitch = false
    anonymousAccess = false
    rtspAuthType = ''
    rtspPort = 0
}

export class NetPPPoEForm {
    switch = false
    userName = ''
    password = ''
}

export class NetDDNSForm {
    serverType = ''
    serverAddr = ''
    userName = ''
    password = ''
    domainName = ''
    heartbeatTime = undefined as number | undefined
    switch = false
}

export class NetDDNSServerTypeList {
    display = ''
    serverType = ''
    serverAddr = ''
    userName = ''
    password = ''
    domainName = ''
    heartbeatTime = undefined as number | undefined
    defaultServerAddr = ''
    defaultHeartBeatTime = undefined as number | undefined
    suffix = ''
    requireParam = [] as string[]
    hideParam = [] as string[]
    defaultDomainName = ''
    isRegisterBtn = true
    isTestBtn = false
}

export class NetEmailForm {
    anonymousSwitch = false
    name = ''
    address = ''
    userName = ''
    server = ''
    port = 25
    attachImg = 0
    imageNumber = 0
    ssl = ''
    password = ''
}

export class NetEmailReceiverDto {
    address = ''
    schedule = ''
}

export class NetEmailTestForm {
    address = ''
    password = ''
}

export class NetUPnPForm {
    switch = false
    mappingType = ''
}

export class NetUPnPPortDto {
    portType = ''
    externalPort = 0
    externalIP = ''
    localPort = ''
    status = ''
}

export class Net8021xForm {
    switch = false
    protocal = ''
    version = ''
    userName = ''
    password = ''
}

export class NetNatForm {
    natSwitch = false
    index = ''
}

export class NetUPnPReportForm {
    switch = false
    serverAddr = ''
    port = 0
    manId = ''
}

export class NetHTTPSPrivateCertForm {
    countryName = ''
    commonName = ''
    stateOrProvinceName = ''
    localityName = ''
    organizationName = ''
    organizationalUnitName = ''
    email = ''
    validityPeriod = 0
    password = ''
}

export class NetHTTPSCertPasswordForm {
    password = ''
    encryption = 'unencrypted'
}

export class NetFTPForm {
    switch = false
    serverAddr = ''
    port = 0
    userName = ''
    anonymousSwitch = false
    maxSize = 0
    path = ''
    disNetUpLoad = false
    password = ''
}

export class NetFTPList {
    id = ''
    chlNum = ''
    name = ''
    streamType = ''
    schedule = ''
    motion = ''
    inteligence = ''
    sensor = ''
    ftpSnapSwitch = 'false'
    ftpAlarmInfoSwitch = 'false'
}

export class NetSNMPForm {
    snmpv1Switch = false
    snmpv2Switch = false
    snmpPort = 0
    readCommunity = ''
    writeCommunity = ''
    trapPort = 0
    trapAddress = ''
}

export class NetCloudUpgradeForm {
    upgradeType = 'close'
}

export class NetStreamChlList {
    id = ''
    addType = ''
    chlType = ''
    chlIndex = ''
    name = ''
    poeIndex = ''
    productModel = ''
    factoryName = ''
}

export class NetSubStreamResList {
    fps = 0
    value = ''
}

export class NetSubStreamQualityCapsList {
    enct = ''
    res = ''
    digitalDefault = 0
    analogDefault = 0
    value = [] as string[]
}

export class NetSubStreamListBitRange {
    min = 0
    max = 0
}

export class NetSubStreamList {
    [key: string]: any
    id = ''
    name = ''
    chlType = ''
    subCaps = {
        supEnct: [] as string[],
        bitType: [] as string[],
        res: [] as NetSubStreamResList[],
    }
    videoEncodeType = ''
    subStreamQualityCaps = [] as NetSubStreamQualityCapsList[]
    streamType = ''
    GOP = 0
    resolution = ''
    frameRate = 0
    bitType = ''
    level = ''
    videoQuality = 0
    // bitRange = null as null | NetSubStreamListBitRange
    // audio = ''
}

export class NetSubStreamResolutionList {
    key = ''
    value = ''
    resolution = [] as NetSubStreamResList[]
    chlsList = [] as { chlId: string; chlName: string; chlIndex: number }[]
}

export class NetOnvifForm {
    switch = false
}

export class NetOnvifUserList {
    id = ''
    userName = ''
    userLevel = ''
    password = ''
}

export class NetOnvifUserForm {
    userName = ''
    userLevel = ''
    password = ''
    confirmPassword = ''
}

export class NetPlatformAccessForm {
    accessType = ''
    nwms5000Switch = false
    serverAddr = ''
    reportId = 0
    port = 0
    gb28181Switch = false
    sipRelm = ''
    sipAddr = ''
    sipLocalPort = 0
    sipPort = 0
    sipDeviceId = ''
    sipUserName = ''
    sipPassword = '******'
    sipExpireTime = 0
    sipId = ''
}

export class NetPlatformSipList {
    value = ''
    type = ''
    label = ''
    list = [] as NetPlatformSipCodeList[]
}

export class NetPlatformSipCodeList {
    id = ''
    gbId = ''
    text = ''
}
