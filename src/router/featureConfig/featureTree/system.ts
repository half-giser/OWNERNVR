/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 11:47:13
 * @Description: 功能面板-系统
 */
export default {
    component: 'layout/L2T1Layout.vue',
    path: 'system',
    meta: {
        sort: 70,
        lk: 'IDCS_SYSTEM',
        plClass: 'md3',
        icon: 'system',
        enabled: 'remoteSysCfgAndMaintain',
        groups: {
            //基本配置
            basicConfig: {
                sort: 10,
                lk: 'IDCS_BASIC_CONFIG',
                icon: 'basicCfg_s',
            },
            //系统维护
            maintenance: {
                sort: 20,
                lk: 'IDCS_SYSTEM_MAINTENANCE',
                icon: 'systemMaintenance_s',
            },
            //磁盘管理
            diskInfo: {
                sort: 30,
                lk: 'IDCS_SYSTEM_INFORMATION',
                icon: 'diskInfo_s',
            },
            //系统信息
            info: {
                sort: 40,
                lk: 'IDCS_SYSTEM_INFORMATION',
                icon: 'sysInfo_s',
            },
            // 上海地标平台
            localPlatform: {
                sort: 40,
                lk: 'IDCS_LOCAL_PLATFORM_MANAGE',
                icon: 'sysLandmark',
            },
        },
    },
    children: {
        generalSettings: {
            //通用配置
            path: 'common',
            component: 'system/GeneralSettings.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_GENERAL_SET',
                group: 'basicConfig',
                default: true,
                inHome: 'group',
                homeSort: 10,
                enabled: 'remoteSysCfgAndMaintain',
            },
        },
        dateAndTime: {
            //日期和时间
            path: 'time',
            component: 'system/DateAndTime.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_DATE_AND_TIME',
                group: 'basicConfig',
                enabled: 'remoteSysCfgAndMaintain',
            },
        },
        outputSettings: {
            //输出配置
            path: 'outputSetting',
            component: 'system/OutputSettings.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_OUTPUT_CONFIG',
                group: 'basicConfig',
                enabled: 'remoteSysCfgAndMaintain',
                auth() {
                    return import.meta.env.VITE_UI_TYPE !== 'UI3-A'
                },
            },
        },
        posSettings: {
            //POS配置
            path: 'pos',
            component: 'system/PosSettings.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_POS_CONFIG',
                group: 'basicConfig',
                enabled: 'remoteSysCfgAndMaintain',
                auth(systemCaps) {
                    return systemCaps.supportPOS
                },
            },
        },
        poeSettings: {
            // POE电源设置
            path: 'poePower',
            component: 'system/PoeSettings.vue',
            meta: {
                sort: 50,
                lk: 'IDCS_SYSTEM_POE_SETUP',
                group: 'basicConfig',
                enabled: 'remoteSysCfgAndMaintain',
                auth(systemCaps) {
                    return systemCaps.supportPoePowerManage && import.meta.env.VITE_UI_TYPE !== 'UI3-A'
                },
            },
        },
        recorderOsdSettings: {
            //录像机OSD配置
            path: 'osd',
            component: 'system/RecorderOsdSettings.vue',
            meta: {
                sort: 60,
                lk: 'IDCS_OSD_CONFIG',
                group: 'basicConfig',
                enabled: 'remoteSysCfgAndMaintain',
                auth() {
                    return import.meta.env.VITE_UI_TYPE !== 'UI3-A'
                },
            },
        },
        viewLog: {
            //查看日志
            path: 'log',
            component: 'system/ViewLog.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_VIEW_LOG',
                group: 'maintenance',
                default: true,
                inHome: 'self',
                homeSort: 20,
                enabled: 'remoteSysCfgAndMaintain',
            },
        },
        factoryDefault: {
            //恢复出厂配置
            path: 'restore_factory_settings',
            component: 'system/FactoryDefault.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_DEFAULT_SET',
                group: 'maintenance',
                enabled: 'remoteSysCfgAndMaintain',
            },
        },
        upgrade: {
            //升级
            path: 'upgrade',
            component: 'system/Upgrade.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_UPGRADE',
                group: 'maintenance',
                enabled: 'remoteSysCfgAndMaintain',
            },
        },
        backupAndRestore: {
            //备份和还原配置
            path: 'backup_and_restore',
            component: 'system/BackupAndRestore.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_BACKUP_AND_RESTORE_SET',
                group: 'maintenance',
                inHome: 'self',
                homeSort: 30,
                enabled: 'remoteSysCfgAndMaintain',
            },
        },
        reboot: {
            //系统重启
            path: 'reboot',
            component: 'system/Reboot.vue',
            meta: {
                sort: 50,
                lk: 'IDCS_SYSTEM_REBOOT',
                group: 'maintenance',
                enabled: 'remoteSysCfgAndMaintain',
            },
        },
        autoMaintenance: {
            //自动维护
            path: 'maintenance/auto',
            component: 'system/AutoMaintenance.vue',
            meta: {
                sort: 60,
                lk: 'IDCS_AUTO_MAINTENANCE',
                group: 'maintenance',
                enabled: 'remoteSysCfgAndMaintain',
            },
        },
        upgradeOnline: {
            //云升级
            path: 'upgradeOnline',
            component: 'net/CloudUpgrade.vue',
            meta: {
                sort: 70,
                lk: 'IDCS_ONLINE_UPGRADE',
                group: 'maintenance',
                auth(systemCaps) {
                    return systemCaps.showCloudUpgrade && import.meta.env.VITE_UI_TYPE === 'UI3-A'
                },
            },
        },
        basic: {
            //设备基本信息
            path: 'information',
            component: 'system/Basic.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_DEVICE_BASIC_INFORMATION',
                group: 'info',
                default: true,
            },
        },
        cameraStatus: {
            //通道状态
            path: 'channel/status',
            components: {
                toolBar: 'system/SystemToolBar.vue',
                default: 'system/CameraStatus.vue',
            },
            meta: {
                sort: 20,
                lk: 'IDCS_CHANNEL_STATE',
                group: 'info',
            },
        },
        alarmStatus: {
            //报警状态
            path: 'alarm/status',
            component: 'system/AlarmStatus.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_ALARM_STATE',
                group: 'info',
                auth() {
                    return import.meta.env.VITE_UI_TYPE !== 'UI3-A'
                },
            },
        },
        recordStatus: {
            //录像状态
            path: 'record/status',
            components: {
                toolBar: 'system/SystemToolBar.vue',
                default: 'system/RecordStatus.vue',
            },
            meta: {
                sort: 40,
                lk: 'IDCS_RECORD_STATE',
                group: 'info',
                auth() {
                    return import.meta.env.VITE_UI_TYPE !== 'UI3-A'
                },
            },
        },
        networkStatus: {
            //网络状态
            path: 'net/status',
            components: {
                toolBar: 'system/SystemToolBar.vue',
                default: 'system/NetworkStatus.vue',
            },
            meta: {
                sort: 50,
                lk: 'IDCS_NETWORK_STATE',
                group: 'info',
                auth() {
                    return import.meta.env.VITE_UI_TYPE !== 'UI3-A'
                },
            },
        },
        diskStatus: {
            //磁盘状态
            path: 'disk/information',
            components: {
                toolBar: 'system/SystemToolBar.vue',
                default: 'system/DiskStatus.vue',
            },
            meta: {
                sort: 60,
                lk: 'IDCS_DISK_STATE_TOOLTIP',
                group: 'info',
                auth() {
                    return import.meta.env.VITE_UI_TYPE !== 'UI3-A'
                },
            },
        },
        systemDiskManagement: {
            //磁盘管理
            path: 'disk/management',
            component: 'disk/DiskManagement.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_DISK_MANAGE',
                group: 'diskManagement',
                default: true,
                inHome: 'self',
                homeSort: 70,
                enabled: 'diskMgr',
                auth() {
                    return import.meta.env.VITE_UI_TYPE === 'UI3-A'
                },
            },
        },
        systemStorageMode: {
            //存储模式配置
            path: 'disk/storage/mode',
            component: 'disk/StorageMode.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_STORAGE_MODE_SET',
                group: 'storageMode',
                inHome: 'self',
                homeSort: 80,
                enabled: 'diskMgr',
                auth() {
                    return import.meta.env.VITE_UI_TYPE === 'UI3-A'
                },
            },
        },
        systemViewDiskInfo: {
            //查看磁盘信息
            path: 'disk/information',
            components: {
                toolBar: 'system/SystemToolBar.vue',
                default: 'system/DiskStatus.vue',
            },
            // component: 'disk/ViewDiskInfo.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_VIEW_DISK_INFORMATION',
                group: 'diskInfo',
                inHome: 'self',
                homeSort: 90,
                auth() {
                    return import.meta.env.VITE_UI_TYPE === 'UI3-A'
                },
            },
        },
        systemSmartInfo: {
            //SMART信息
            path: 'disk/information/smart',
            component: 'disk/SmartInfo.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_DISK_SMART_INFO',
                group: 'diskInfo',
                auth() {
                    return import.meta.env.VITE_UI_TYPE === 'UI3-A'
                },
            },
        },
        platformParam: {
            // 地标平台参数
            path: 'platform/parameter',
            components: 'system/PlatformParameter.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_PLATFORM_PARAMETER',
                group: 'localPlatform',
            },
        },
        imageUpload: {
            // 定时图像上传
            path: 'upload/image/timing',
            components: 'system/ImageUpload.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_SCHEDULE_PIC_UPLOAD',
                group: 'localPlatform',
            },
        },
        imageUploadAlarm: {
            // 报警图像上传
            path: 'upload/image/alarm',
            components: 'system/ImageUploadAlarm.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_ALARM_PIC_UPLOAD',
                group: 'localPlatform',
            },
        },
        platformOperation: {
            // 平台操作管理
            path: 'platform/operation',
            components: 'system/PlatformOperation.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_PLATFORM_OPERATE_MANAGE',
                group: 'localPlatform',
            },
        },
    },
} as FeatureItem
