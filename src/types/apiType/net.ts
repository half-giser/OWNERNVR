/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 14:47:05
 * @Description: 网络
 */
import { TableRowStatus } from './base'

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
    ipGroupSwitch = false
    ipGroupMode = ''
    ipDefaultBond = ''
    bonds = [] as NetTcpIpBondsList[]
    nicConfigs = [] as NetTcpIpNicConfigList[]
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
    subLengthV6 = 0
    dns1 = ''
    dns2 = ''
    ipv6Dns1 = ''
    ipv6Dns2 = ''
}

/**
 * @description TCP/IP Bond列表项
 */
export class NetTcpIpBondsList extends NetTcpIpDhcpList {
    index = 0
    id = ''
    dhcpSwitch = false
    primaryNIC = ''
    NICs = ''
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
    mtu = [] as number[]
}

/**
 * @description 端口配置表单
 */
export class NetPortForm {
    httpPort = 0
    httpsPort = 0
    netPort = 0
    posPort = 0
    // rtspPort = 0
    virtualHostEnabled = false
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
    ports = [] as NetPortUPnPPortDto[]
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
    password = ''
}

/**
 * @description DDNS配置表单
 */
export class NetDDNSForm {
    serverType = ''
    serverAddr = ''
    userName = ''
    password = ''
    domainName = ''
    heartbeatTime = undefined as number | undefined
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

/**
 * @description Email配置表单
 */
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
    index = ''
}

/**
 * @description UPnP报告配置表单
 */
export class NetUPnPReportForm {
    switch = false
    serverAddr = ''
    port = 0
    manId = ''
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
    validityPeriod = undefined as number | undefined
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
    serverAddr = ''
    port = 0
    userName = ''
    anonymousSwitch = false
    maxSize = 0
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
    snmpPort = 0
    readCommunity = ''
    writeCommunity = ''
    trapPort = 0
    trapAddress = ''
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
 * @description 网络子码流码流质量列表项
 */
export class NetSubStreamQualityCapsList {
    enct = ''
    res = ''
    digitalDefault = 0
    analogDefault = 0
    value = [] as string[]
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

/**
 * @description 网络子码流分辨率列表项
 */
export class NetSubStreamResolutionList {
    key = ''
    value = ''
    resolution = [] as NetSubStreamResList[]
    chlsList = [] as { chlId: string; chlName: string; chlIndex: number }[]
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

/**
 * @description 平台SIP列表
 */
export class NetPlatformSipList {
    value = ''
    type = ''
    label = ''
    list = [] as NetPlatformSipCodeList[]
}

/**
 * @description 平台接入SIP Code列表
 */
export class NetPlatformSipCodeList {
    id = ''
    gbId = ''
    text = ''
}
