/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 11:47:13
 * @Description: 功能面板-磁盘
 */
const diskRoutes: FeatureItem = {
    path: 'disk',
    component: 'layout/L2T1Layout.vue',
    meta: {
        sort: 40,
        lk: 'IDCS_DISK',
        plClass: 'md3',
        icon: 'disk',
        auth: 'diskMgr',
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
        // 磁盘管理
        diskManagement: {
            path: 'management',
            component: 'disk/DiskManagement.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_DISK_MANAGE',
                group: 'diskManagement',
                default: true,
                homeDefault: true,
                inHome: 'self',
                homeSort: 10,
                auth: 'diskMgr',
            },
        },
        // 磁盘模式
        diskMode: {
            path: 'diskMode',
            component: 'disk/DiskMode.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_DISK_MODE',
                group: 'diskManagement',
                auth: 'diskMgr',
                hasCap(systemCaps) {
                    return systemCaps.supportRaid
                },
            },
        },
        // 物理磁盘
        physicalDiskCfg: {
            path: 'physicalDiskCfg',
            component: 'disk/PhysicalDisk.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_PHYSICAL_DISK',
                group: 'diskManagement',
                auth: 'diskMgr',
                hasCap(systemCaps) {
                    return systemCaps.isUseRaid
                },
            },
        },
        // 磁盘阵列
        diskArray: {
            path: 'diskArray',
            component: 'disk/Raid.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_ARRAY',
                group: 'diskManagement',
                auth: 'diskMgr',
                hasCap(systemCaps) {
                    return systemCaps.isUseRaid
                },
            },
        },
        // 存储模式配置
        storageMode: {
            path: 'storage/mode',
            component: 'disk/StorageMode.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_STORAGE_MODE_SET',
                group: 'storageMode',
                default: true,
                inHome: 'group',
                homeSort: 20,
                auth: 'diskMgr',
            },
        },
        // 查看磁盘信息
        viewDiskInfo: {
            path: 'information',
            components: {
                toolBar: 'system/SystemToolBar.vue',
                default: 'system/DiskStatus.vue',
            },
            meta: {
                sort: 10,
                lk: 'IDCS_VIEW_DISK_INFORMATION',
                group: 'diskInfo',
                default: true,
            },
        },
        // SMART信息
        smartInfo: {
            path: 'information/smart',
            component: 'disk/SmartInfo.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_DISK_SMART_INFO',
                group: 'diskInfo',
            },
        },
        // 健康状态检测
        healthStatusCheck: {
            path: 'information/health',
            component: 'disk/HealthStatusCheck.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_HEALTH_STATUS_CHECK',
                group: 'diskInfo',
            },
        },
    },
}

export default diskRoutes
