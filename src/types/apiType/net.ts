/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 14:47:05
 * @Description: 网络的类型定义，类型命名的前缀统一为Net*
 */
import { TableRowStatus } from './base'
import { type RecordStreamQualityCapsDto } from './record'

/**
 * @description TCP/IP配置表单
 */
export class NetTcpIpForm {
    netConfig = {
        defaultNic: '',
        poeMode: 0,
        supportNetworkFaultTolerance: false,
        supportNetworkMultiAddrSetting: false,
        toeEnable: false,
        curWorkMode: '',
    }
    // ipGroupSwitch = false
    // ipGroupMode = ''
    // ipDefaultBond = ''
    ipGroupConfig = new NetTcpIpGroupList()
    // bonds: NetTcpIpBondsList[] = []
    nicConfigs: NetTcpIpNicConfigList[] = []
}

/**
 * @description TCP/IP DHCP列表项
 */
export class NetTcpIpDhcpList {
    [key: string]: string | number | undefined | boolean
    ip = ''
    gateway = ''
    mask = ''
    ipV6 = ''
    gatewayV6 = ''
    subLengthV6: number | undefined = undefined
    dns1 = ''
    dns2 = ''
    ipv6Dns1 = ''
    ipv6Dns2 = ''
}

/**
 * @description TCP/IP Bond列表项
 */
export class NetTcpIpGroupList extends NetTcpIpDhcpList {
    // index = 0
    // id = ''
    switch = false
    mode = ''
    dhcpSwitch = false
    primaryNIC = ''
    // NICs = ''
    // ip = ''
    // gateway = ''
    // mask = ''
    mtu = 0
    ipV6Switch = false
    // ipV6 = ''
    // gatewayV6 = ''
    // subLengthV6 = ''
    ipv4DnsDhcpSwitch = false
    // dns1 = ''
    // dns2 = ''
    ipv6DnsDhcpSwitch = false
    // ipv6Dns1 = ''
    // ipv6Dns2 = ''
    isPoe = false
}

/**
 * @description TCP/IP NIC配置列表项
 */
export class NetTcpIpNicConfigList extends NetTcpIpDhcpList {
    index = 0
    id = ''
    isPoe = false
    isSupSecondIP = false
    isSupMultiWorkMode = false
    dhcpSwitch = false
    // ip = ''
    // gateway = ''
    // mask = ''
    mac = ''
    mtu = 0
    ipV6Switch = false
    // ipV6 = ''
    // gatewayV6 = ''
    // subLengthV6 = ''
    isOnline = false
    ipv4DnsDhcpSwitch = false
    // dns1 = ''
    // dns2 = ''
    ipv6DnsDhcpSwitch = false
    // ipv6Dns1 = ''
    // ipv6Dns2 = ''
    secondIpSwitch = false
    secondIp = ''
    secondMask = ''
}

/**
 * @description TCP/IP 高级配置表单
 */
export class NetTcpIpAdvanceForm {
    dhcpSwitch = false
    secondIpSwitch = false
    secondIp = ''
    secondMask = ''
    mtu: number[] = []
}

/**
 * @description 端口配置表单
 */
export class NetPortForm {
    httpPort = 10
    httpsPort = 10
    netPort = 10
    posPort = 10
    autoReportPort = 10
    // rtspPort = 0
    // virtualHostEnabled = false
}

/**
 * @description 端口-UPnP端口选项
 */
export class NetPortUPnPPortDto {
    portType = ''
    externalPort = ''
    externalIP = ''
    localPort = ''
    status = ''
}

/**
 * @description 端口 UPnP选项
 */
export class NetPortUPnPDto {
    switch = ''
    mappingType = ''
    portsType = ''
    ports: NetPortUPnPPortDto[] = []
}

/**
 * @description API服务配置表单
 */
export class NetPortApiServerForm {
    apiserverSwitch = false
    authenticationType = ''
}

/**
 * @description RTSP服务配置表单
 */
export class NetPortRtspServerForm {
    rtspServerSwitch = false
    anonymousAccess = false
    rtspAuthType = ''
    rtspPort = 0
}

/***
 * @description PPPoE配置表单
 */
export class NetPPPoEForm {
    switch = false
    userName = ''
    userNameMaxByteLen = 63
    password = ''
}

/**
 * @description DDNS配置表单
 */
export class NetDDNSForm {
    serverType = ''
    serverAddrMaxLen = 64
    serverAddr = ''
    userNameMaxByteLen = 63
    userName = ''
    password = ''
    domainNameMaxLen = 64
    domainName = ''
    heartbeatTime: number | undefined = undefined
    switch = false
}

/**
 * @description DDNS服务烈性列表项
 */
export class NetDDNSServerTypeList {
    display = ''
    serverType = ''
    serverAddr = ''
    userName = ''
    password = ''
    domainName = ''
    heartbeatTime: number | undefined = undefined
    defaultServerAddr = ''
    defaultHeartBeatTime: number | undefined = undefined
    suffix = ''
    requireParam: string[] = []
    hideParam: string[] = []
    defaultDomainName = ''
    isRegisterBtn = true
    isTestBtn = false
}

/**
 * @description Email配置表单
 */
export class NetEmailForm {
    anonymousSwitch = false
    name = ''
    nameMaxByteLen = 63
    address = ''
    addressMaxByteLen = 63
    userName = ''
    userNameMaxByteLen = 63
    server = ''
    serverMaxByteLen = 63
    port = 25
    portMin = 10
    portMax = 65535
    attachImg = 0
    imageNumber = 0
    ssl = ''
    password = ''
    imgType: string[] = []
}

/**
 * @description Email接受者选项
 */
export class NetEmailReceiverDto {
    address = ''
    schedule = ''
}

/**
 * @description Email测试表单
 */
export class NetEmailTestForm {
    address = ''
    addressMaxByteLen = 63
    password = ''
}

/**
 * @description UPnP配置表单
 */
export class NetUPnPForm {
    switch = false
    mappingType = ''
}

/**
 * @description UPnP端口选项
 */
export class NetUPnPPortDto {
    portType = ''
    externalPort = 0
    externalIP = ''
    localPort = ''
    status = ''
}

/**
 * @description 802.1x配置表单
 */
export class Net8021xForm {
    switch = false
    protocal = ''
    version = ''
    userName = ''
    password = ''
}

/**
 * @description NAT配置表单
 */
export class NetNatForm {
    natSwitch = false
    index = 1
    securityAccessSwitch = false
}

/**
 * @description UPnP报告配置表单
 */
export class NetUPnPReportForm {
    switch = false
    serverAddr = ''
    serverAddrMaxByteLen = 63
    port = 0
    manId = ''
    manIdMaxByteLen = 63
}

/**
 * @description HTTPS私有证书配置表单
 */
export class NetHTTPSPrivateCertForm {
    countryName = ''
    commonName = ''
    stateOrProvinceName = ''
    localityName = ''
    organizationName = ''
    organizationalUnitName = ''
    email = ''
    validityPeriod: number | undefined = undefined
    password = ''
}

/**
 * @description HTTPS证书密码表单
 */
export class NetHTTPSCertPasswordForm {
    password = ''
    encryption = 'unencrypted'
}

/**
 * @description FTP配置表单
 */
export class NetFTPForm {
    switch = false
    serverAddrMaxLen = 64
    serverAddr = ''
    portMin = 10
    portMax = 65535
    port = 0
    userNameMaxByteLen = 63
    userName = ''
    anonymousSwitch = false
    maxSize = 0
    maxSizeMin = 0
    maxSizeMax = 4096
    pathMaxLen = 64
    path = ''
    disNetUpLoad = false
    password = ''
}

/**
 * @description FTP列表项
 */
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

/**
 * @description SNMP配置表单
 */
export class NetSNMPForm {
    snmpv1Switch = false
    snmpv2Switch = false
    snmpv3Switch = false
    snmpPort = 0
    readCommunity = ''
    writeCommunity = ''
    trapPort = 0
    trapAddress = ''
    username = ''
    securityLevel = 0
    authType = 0
    privType = 0
    authPassword = ''
    privPassword = ''
}

/**
 * @description 云升级配置表单
 */
export class NetCloudUpgradeForm {
    upgradeType = 'close'
}

/**
 * @description 网络码流通道列表项
 */
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

/**
 * @description 网络子码流分辨率列表项
 */
export class NetSubStreamResList {
    fps = 0
    value = ''
    label = ''
}

/**
 * @description 网络子码流比特范围
 */
export class NetSubStreamListBitRange {
    min = 0
    max = 0
}

/**
 * @description 网络子码流列表项
 */
export class NetSubStreamList extends TableRowStatus {
    [key: string]: any
    id = ''
    name = ''
    chlType = ''
    subCaps = {
        supEnct: [] as SelectOption<string, string>[],
        bitType: [] as string[],
        res: [] as NetSubStreamResList[],
    }
    videoEncodeType = ''
    subStreamQualityCaps: RecordStreamQualityCapsDto[] = []
    streamType = ''
    GOP: number | undefined = 0
    resolution = ''
    frameRate = 0
    bitType = ''
    level = ''
    videoQuality = 0
    // bitRange: null | NetSubStreamListBitRange = null
    // audio = ''
}

/**
 * @description 网络子码流分辨率列表项
 */
export class NetSubStreamResolutionList {
    key = ''
    value = ''
    resolution: NetSubStreamResList[] = []
    chlsList: { chlId: string; chlName: string; chlIndex: number }[] = []
}

/**
 * @description Onvif配置表单
 */
export class NetOnvifForm {
    switch = false
}

/**
 * @description Onvif用户列表项
 */
export class NetOnvifUserList {
    id = ''
    userName = ''
    userLevel = ''
    password = ''
}

/**
 * @description Onvif用户配置表单
 */
export class NetOnvifUserForm {
    userName = ''
    userLevel = 'video'
    password = ''
    confirmPassword = ''
}

/**
 * @description 平台接入配置表单
 */
export class NetPlatformAccessForm {
    accessType = ''
    nwms5000Switch = false
    serverAddr = ''
    serverAddrMaxByteLen = 63
    reportId: number | undefined = undefined
    reportIdMax = 99999999
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

/**
 * @description 平台SIP列表
 */
export class NetPlatformSipList {
    value = ''
    type = ''
    label = ''
    list: NetPlatformSipCodeList[] = []
}

/**
 * @description 平台接入SIP Code列表
 */
export class NetPlatformSipCodeList {
    id = ''
    gbId = ''
    text = ''
}

/**
 * @description 网络状态检测表单
 */
export class NetDetectionForm {
    address = ''
}

/**
 * @description 云升级ipc升级信息列表项
 */
export class NetIpcUpgradeInfoList {
    [key: string]: any
    ip = ''
    chlId = ''
    chlName = ''
    state = ''
    formatState = ''
    version = ''
    newVersion = ''
    formatNewVersion = ''
    newVersionNote = ''
    newVersionGUID = ''
    progress = ''
}

/**
 * @description HTTP Post表单
 */
export class NetHttpPostForm {
    switch = false
    host = ''
    hostMaxByteLen = 63
    port = 10
    portMin = 10
    portMax = 65535
    path = ''
    pathMaxByteLen = 63
    protocolType = ''
    userInfoDsiabled = true
    userNameMaxByteLen = 63
    userName = ''
    password = ''
    connectType = ''
    schedule = ''
    keepAliveInfoEnable = false
    heartbeatInterval = 0
    heartbeatIntervalMin = 0
    heartbeatIntervalMax = 1
    heartbeatIntervalDefault = 0
    enablePostPic: string[] = []
    passwordSwitch = false
}
