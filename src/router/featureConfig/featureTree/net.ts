/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 11:47:13
 * @Description: 功能面板-网络
 */
export default {
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
        tcpIp: {
            //TCP/IP
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
            },
        },
        port: {
            //端口
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
        pppoe: {
            //PPPoE
            path: 'pppoe',
            component: 'net/PPPOE.vue',
            meta: {
                sort: 30,
                lk: 'PPPOE',
                group: 'network',
            },
        },
        ddns: {
            //DDNS
            path: 'ddns',
            component: 'net/DDNS.vue',
            meta: {
                sort: 40,
                lk: 'DDNS',
                group: 'network',
            },
        },
        emailSender: {
            //EMail
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
        upnp: {
            //UPnP
            path: 'upnp',
            component: 'net/UPnP.vue',
            meta: {
                sort: 60,
                lk: 'UPnP',
                group: 'network',
            },
        },
        p8021x: {
            //8021.x
            path: '802',
            component: 'net/P8021x.vue',
            meta: {
                sort: 70,
                lk: '802.1x',
                group: 'network',
            },
        },
        nat: {
            //NAT
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
        https: {
            //HTTPS
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
        ftp: {
            //FTP
            path: 'ftp',
            component: 'net/FTP.vue',
            meta: {
                sort: 100,
                lk: 'FTP',
                group: 'network',
                hasCap(systemCaps) {
                    return systemCaps.supportFTP
                },
            },
        },
        snmp: {
            //SNMP
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
        cloudUpgrade: {
            //云升级
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
        networkStream: {
            //网络码流设置
            path: 'stream/sub',
            component: 'net/NetworkStream.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_NETWORK_STREAM_CONFIG',
                group: 'netStream',
                default: true,
            },
        },
        onvif: {
            //ONVIF
            path: 'ONVIF',
            component: 'net/ONVIF.vue',
            meta: {
                sort: 10,
                lk: 'ONVIF',
                group: 'integration',
                default: true,
            },
        },
        platformAccess: {
            //平台接入
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
        upnpReport: {
            //UPnP上报
            path: 'upnpReport',
            component: 'net/UpnpReport.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_UPNP_REPORT',
                group: 'integration',
            },
        },
        netStatus: {
            //网络状态
            path: 'status',
            components: {
                toolBar: 'system/SystemToolBar.vue',
                default: 'system/NetworkStatus.vue',
            },
            // component: 'net/NetworkStatus.vue',
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
} as FeatureItem
