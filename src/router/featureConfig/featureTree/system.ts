/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 11:47:13
 * @Description: 功能面板-系统
 */
const systemRoutes: FeatureItem = {
    component: 'layout/L2T1Layout.vue',
    path: 'system',
    meta: {
        sort: 70,
        lk: 'IDCS_SYSTEM',
        icon: 'system',
        auth: 'remoteSysCfgAndMaintain',
        groups: {
            // 基本配置
            basicConfig: {
                sort: 10,
                lk: 'IDCS_BASIC_CONFIG',
                icon: 'basicCfg_s',
            },
            // 系统维护
            maintenance: {
                sort: 20,
                lk: 'IDCS_SYSTEM_MAINTENANCE',
                icon: 'systemMaintenance_s',
            },
            // 系统信息
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
        // 通用配置
        generalSettings: {
            path: 'common',
            component: 'system/GeneralSettings.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_GENERAL_SET',
                group: 'basicConfig',
                default: true,
                homeDefault: true,
                inHome: 'group',
                homeSort: 10,
                auth: 'remoteSysCfgAndMaintain',
            },
        },
        // 日期和时间
        dateAndTime: {
            path: 'time',
            component: 'system/DateAndTime.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_DATE_AND_TIME',
                group: 'basicConfig',
                auth: 'remoteSysCfgAndMaintain',
            },
        },
        // 输出配置
        outputSettings: {
            path: 'outputSetting',
            component: 'system/OutputSettings.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_OUTPUT_CONFIG',
                group: 'basicConfig',
                auth: 'remoteSysCfgAndMaintain',
                minWidth: 1620,
            },
        },
        // POS配置
        posSettings: {
            path: 'pos',
            component: 'system/PosSettings.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_POS_CONFIG',
                group: 'basicConfig',
                auth: 'remoteSysCfgAndMaintain',
                hasCap(systemCaps) {
                    return systemCaps.supportPOS
                },
            },
        },
        // POE电源设置
        poeSettings: {
            path: 'poePower',
            component: 'system/PoeSettings.vue',
            meta: {
                sort: 50,
                lk: 'IDCS_SYSTEM_POE_SETUP',
                group: 'basicConfig',
                auth: 'remoteSysCfgAndMaintain',
                hasCap(systemCaps) {
                    return systemCaps.poeChlMaxCount > 0
                },
            },
        },
        // 录像机OSD配置
        recorderOsdSettings: {
            path: 'osd',
            component: 'system/RecorderOsdSettings.vue',
            meta: {
                sort: 60,
                lk: 'IDCS_OSD_CONFIG',
                group: 'basicConfig',
                auth: 'remoteSysCfgAndMaintain',
            },
        },
        // 热备机配置 2.1.0
        hotStandbySettings: {
            path: 'hotStandby',
            component: 'system/HotStandbySettings.vue',
            meta: {
                sort: 70,
                lk: 'IDCS_HOT_STANDBY_SETTING',
                group: 'basicConfig',
                auth: 'remoteSysCfgAndMaintain',
                hasCap(systemCaps) {
                    return systemCaps.supportN1
                },
            },
        },
        // RS485 1.4.13
        rs485: {
            path: 'rs485',
            component: 'system/RS485.vue',
            meta: {
                sort: 70,
                lk: 'IDCS_RS485_SET',
                group: 'basicConfig',
                hasCap(systemCaps) {
                    return systemCaps.supportRS485
                },
            },
        },
        // 查看日志
        viewLog: {
            path: 'log',
            component: 'system/ViewLog.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_VIEW_LOG',
                group: 'maintenance',
                default: true,
                inHome: 'self',
                homeSort: 20,
                auth: 'remoteSysCfgAndMaintain',
            },
        },
        // 恢复出厂配置
        factoryDefault: {
            path: 'restore_factory_settings',
            component: 'system/FactoryDefault.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_DEFAULT_SET',
                group: 'maintenance',
                auth: 'remoteSysCfgAndMaintain',
            },
        },
        // 升级
        upgrade: {
            path: 'upgrade',
            component: 'system/Upgrade.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_UPGRADE',
                group: 'maintenance',
                auth: 'remoteSysCfgAndMaintain',
            },
        },
        // 备份和还原配置
        backupAndRestore: {
            path: 'backup_and_restore',
            component: 'system/BackupAndRestore.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_BACKUP_AND_RESTORE_SET',
                group: 'maintenance',
                inHome: 'self',
                homeSort: 30,
                auth: 'remoteSysCfgAndMaintain',
            },
        },
        // 系统重启
        reboot: {
            path: 'reboot',
            component: 'system/Reboot.vue',
            meta: {
                sort: 50,
                lk: 'IDCS_SYSTEM_REBOOT',
                group: 'maintenance',
                auth: 'remoteSysCfgAndMaintain',
            },
        },
        // 自动维护
        autoMaintenance: {
            path: 'maintenance/auto',
            component: 'system/AutoMaintenance.vue',
            meta: {
                sort: 60,
                lk: 'IDCS_AUTO_MAINTENANCE',
                group: 'maintenance',
                auth: 'remoteSysCfgAndMaintain',
            },
        },
        // 诊断数据 1.4.13
        debugMode: {
            path: 'maintenance/debugMode',
            component: 'system/DebugMode.vue',
            meta: {
                sort: 70,
                lk: 'IDCS_DEBUG_DATA',
                group: 'maintenance',
                auth: 'remoteSysCfgAndMaintain',
                hasCap() {
                    const userSession = useUserSessionStore()
                    return userSession.userType === USER_TYPE_DEFAULT_ADMIN
                },
            },
        },
        // 设备基本信息
        basic: {
            path: 'information',
            component: 'system/Basic.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_DEVICE_BASIC_INFORMATION',
                group: 'info',
                default: true,
            },
        },
        // 通道状态
        cameraStatus: {
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
        // 报警状态
        alarmStatus: {
            path: 'alarm/status',
            component: 'system/AlarmStatus.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_ALARM_STATE',
                group: 'info',
            },
        },
        // 录像状态
        recordStatus: {
            path: 'record/status',
            components: {
                toolBar: 'system/SystemToolBar.vue',
                default: 'system/RecordStatus.vue',
            },
            meta: {
                sort: 40,
                lk: 'IDCS_RECORD_STATE',
                group: 'info',
                hasCap(systemCaps) {
                    return !systemCaps.hotStandBy
                },
            },
        },
        // 网络状态
        networkStatus: {
            path: 'net/status',
            components: {
                toolBar: 'system/SystemToolBar.vue',
                default: 'system/NetworkStatus.vue',
            },
            meta: {
                sort: 50,
                lk: 'IDCS_NETWORK_STATE',
                group: 'info',
            },
        },
        // 磁盘状态
        diskStatus: {
            path: 'disk/information',
            components: {
                toolBar: 'system/SystemToolBar.vue',
                default: 'system/DiskStatus.vue',
            },
            meta: {
                sort: 60,
                lk: 'IDCS_DISK_STATE_TOOLTIP',
                group: 'info',
            },
        },
        // 地标平台参数
        platformParam: {
            path: 'platform/parameter',
            component: 'system/PlatformParameter.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_PLATFORM_PARAMETER',
                group: 'localPlatform',
                auth: 'remoteSysCfgAndMaintain',
                hasCap(systemCaps) {
                    return systemCaps.supportSHDB
                },
            },
        },
        // 定时图像上传
        imageUpload: {
            path: 'upload/image/timing',
            components: {
                toolBar: 'system/ImageUploadToolBar.vue',
                default: 'system/ImageUpload.vue',
            },
            meta: {
                sort: 20,
                lk: 'IDCS_SCHEDULE_PIC_UPLOAD',
                group: 'localPlatform',
                auth: 'remoteSysCfgAndMaintain',
                hasCap(systemCaps) {
                    return systemCaps.supportSHDB
                },
            },
        },
        // 报警图像上传
        imageUploadAlarm: {
            path: 'upload/image/alarm',
            component: 'system/ImageUploadAlarm.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_ALARM_PIC_UPLOAD',
                group: 'localPlatform',
                auth: 'remoteSysCfgAndMaintain',
                hasCap(systemCaps) {
                    return systemCaps.supportSHDB
                },
            },
        },
        // 平台操作管理
        platformOperation: {
            path: 'platform/operation',
            component: 'system/PlatformOperation.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_PLATFORM_OPERATE_MANAGE',
                group: 'localPlatform',
                auth: 'remoteSysCfgAndMaintain',
                hasCap(systemCaps) {
                    return systemCaps.supportSHDB
                },
            },
        },
    },
}

export default systemRoutes
