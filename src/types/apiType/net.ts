/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 14:47:05
 * @Description: 网络
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-09 16:42:14
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
