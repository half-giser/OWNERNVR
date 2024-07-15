/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 14:47:05
 * @Description: 网络
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-12 11:05:19
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
    heartbeatTime = null as number | null
    switch = false
}

export class NetDDNSServerTypeList {
    display = ''
    serverType = ''
    serverAddr = ''
    userName = ''
    password = ''
    domainName = ''
    heartbeatTime = null as number | null
    defaultServerAddr = ''
    defaultHeartBeatTime = null as number | null
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
