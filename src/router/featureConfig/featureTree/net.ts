/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 11:47:13
 * @Description: 功能面板-网络
 */
const netRoutes: FeatureItem = {
    component: 'layout/L2T1Layout.vue',
    path: 'net',
    meta: {
        sort: 50,
        lk: 'IDCS_NETWORK',
        plClass: 'md3',
        icon: 'net',
        auth: 'net',
        groups: {
            //网络
            network: {
                sort: 10,
                lk: 'IDCS_NETWORK',
                icon: 'net_s',
            },
            //码流设置
            netStream: {
                sort: 20,
                lk: 'IDCS_STREAM_SET',
                icon: 'subStream_s',
            },
            //集成
            integration: {
                sort: 30,
                lk: 'IDCS_INTEGRATION',
                icon: 'integrate_s',
            },
            //网络状态
            netStatus: {
                sort: 40,
                lk: 'IDCS_NETWORK_STATE',
                icon: 'netStatus_s',
            },
        },
    },
    children: {
        // TCP/IP
        tcpIp: {
            path: 'tcp_ip',
            component: 'net/TcpIp.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_TCP_IPV4',
                group: 'network',
                default: true,
                homeDefault: true,
                inHome: 'self',
                homeSort: 10,
                minHeight: 850,
            },
        },
        // 端口
        port: {
            path: 'port',
            component: 'net/Port.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_PORT',
                group: 'network',
                inHome: 'self',
                homeSort: 20,
            },
        },
        // PPPoE
        pppoe: {
            path: 'pppoe',
            component: 'net/PPPOE.vue',
            meta: {
                sort: 30,
                lk: 'PPPOE',
                group: 'network',
            },
        },
        // DDNS
        ddns: {
            path: 'ddns',
            component: 'net/DDNS.vue',
            meta: {
                sort: 40,
                lk: 'DDNS',
                group: 'network',
            },
        },
        // EMail
        emailSender: {
            path: 'email',
            component: 'net/EmailSender.vue',
            meta: {
                sort: 50,
                lk: 'IDCS_EMAIL',
                group: 'network',
                inHome: 'self',
                homeSort: 30,
            },
        },
        // UPnP
        upnp: {
            path: 'upnp',
            component: 'net/UPnP.vue',
            meta: {
                sort: 60,
                lk: 'UPnP',
                group: 'network',
            },
        },
        // 8021.x
        p8021x: {
            path: '802',
            component: 'net/P8021x.vue',
            meta: {
                sort: 70,
                lk: '802.1x',
                group: 'network',
            },
        },
        // NAT
        nat: {
            path: 'nat',
            component: 'net/Nat.vue',
            meta: {
                sort: 80,
                lk: 'IDCS_NAT',
                group: 'network',
                hasCap(systemCaps) {
                    return systemCaps.showNat
                },
            },
        },
        // HTTPS
        https: {
            path: 'https',
            component: 'net/Https.vue',
            meta: {
                sort: 90,
                lk: 'IDCS_HTTPS',
                group: 'network',
                hasCap(systemCaps) {
                    return systemCaps.supportHttpsConfig
                },
            },
        },
        // FTP
        ftp: {
            path: 'ftp',
            component: 'net/FTP.vue',
            meta: {
                sort: 100,
                lk: 'FTP',
                group: 'network',
                minWidth: 1400,
                minHeight: 800,
                hasCap(systemCaps) {
                    return systemCaps.supportFTP
                },
            },
        },
        // SNMP
        snmp: {
            path: 'snmp',
            component: 'net/SNMP.vue',
            meta: {
                sort: 110,
                lk: 'IDCS_SNMP',
                group: 'network',
                hasCap(systemCaps) {
                    return systemCaps.supportSnmp
                },
            },
        },
        // 云升级
        cloudUpgrade: {
            path: 'upgradeOnline',
            component: 'net/CloudUpgrade.vue',
            meta: {
                sort: 120,
                lk: 'IDCS_ONLINE_UPGRADE',
                group: 'network',
                hasCap(systemCaps) {
                    return systemCaps.showCloudUpgrade
                },
            },
        },
        // 网络码流设置
        networkStream: {
            path: 'stream/sub',
            component: 'net/NetworkStream.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_NETWORK_STREAM_CONFIG',
                group: 'netStream',
                default: true,
            },
        },
        // ONVIF
        onvif: {
            path: 'ONVIF',
            component: 'net/ONVIF.vue',
            meta: {
                sort: 10,
                lk: 'ONVIF',
                group: 'integration',
                default: true,
            },
        },
        // 平台接入
        platformAccess: {
            path: 'platform',
            component: 'net/PlatformAccess.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_PLATFORM_ACCESS',
                group: 'integration',
                hasCap(systemCaps) {
                    return systemCaps.supportPlatform
                },
            },
        },
        // UPnP上报
        upnpReport: {
            path: 'upnpReport',
            component: 'net/UpnpReport.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_UPNP_REPORT',
                group: 'integration',
            },
        },
        // 网络状态
        netStatus: {
            path: 'status',
            components: {
                toolBar: 'system/SystemToolBar.vue',
                default: 'system/NetworkStatus.vue',
            },
            meta: {
                sort: 10,
                lk: 'IDCS_NETWORK_STATE',
                group: 'netStatus',
                default: true,
                inHome: 'self',
                homeSort: 40,
            },
        },
    },
}

export default netRoutes
