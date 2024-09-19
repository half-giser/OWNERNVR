/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 11:47:13
 * @Description: 功能面板-磁盘
 */
export default {
    path: 'disk',
    component: 'layout/L2T1Layout.vue',
    meta: {
        sort: 40,
        lk: 'IDCS_DISK',
        plClass: 'md3',
        icon: 'disk',
        enabled: 'diskMgr',
        groups: {
            //磁盘管理
            diskManagement: {
                sort: 10,
                lk: 'IDCS_DISK_MANAGE',
                icon: 'diskManagement_s',
            },
            //存储模式
            storageMode: {
                sort: 20,
                lk: 'IDCS_STORAGE_MODE',
                icon: 'storageMode_s',
            },
            //信息
            diskInfo: {
                sort: 30,
                lk: 'IDCS_INFORMATION',
                icon: 'diskInfo_s',
            },
        },
    },
    children: {
        diskManagement: {
            //磁盘管理
            path: 'management',
            component: 'disk/DiskManagement.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_DISK_MANAGE',
                group: 'diskManagement',
                default: true,
                inHome: 'self',
                homeSort: 10,
                enabled: 'diskMgr',
            },
        },
        diskMode: {
            //磁盘模式
            path: 'diskMode',
            component: 'disk/DiskMode.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_DISK_MODE',
                group: 'diskManagement',
                default: true,
                inHome: 'self',
                homeSort: 10,
                enabled: 'diskMgr',
                auth(systemCaps) {
                    return systemCaps.supportRaid
                },
            },
        },
        physicalDiskCfg: {
            // 物理磁盘
            path: 'physicalDiskCfg',
            component: 'disk/PhysicalDisk.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_PHYSICAL_DISK',
                group: 'diskManagement',
                enabled: 'diskMgr',
                auth(systemCaps) {
                    return systemCaps.isUseRaid
                },
            },
        },
        diskArray: {
            // 磁盘阵列
            path: 'diskArray',
            component: 'disk/Raid.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_ARRAY',
                group: 'diskManagement',
                enabled: 'diskMgr',
                auth(systemCaps) {
                    return systemCaps.isUseRaid
                },
            },
        },
        storageMode: {
            //存储模式配置
            path: 'storage/mode',
            component: 'disk/StorageMode.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_STORAGE_MODE_SET',
                group: 'storageMode',
                default: true,
                inHome: 'group',
                homeSort: 20,
                enabled: 'diskMgr',
            },
        },
        viewDiskInfo: {
            //查看磁盘信息
            path: 'information',
            components: {
                toolBar: 'system/SystemToolBar.vue',
                default: 'system/DiskStatus.vue',
            },
            // component: 'disk/ViewDiskInfo.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_VIEW_DISK_INFORMATION',
                group: 'diskInfo',
                default: true,
            },
        },
        smartInfo: {
            //SMART信息
            path: 'information/smart',
            component: 'disk/SmartInfo.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_DISK_SMART_INFO',
                group: 'diskInfo',
            },
        },
        healthStatusCheck: {
            //健康状态检测
            path: 'information/health',
            component: 'disk/HealthStatusCheck.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_HEALTH_STATUS_CHECK',
                group: 'diskInfo',
            },
        },
    },
} as FeatureItem
