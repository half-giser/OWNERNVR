/*
 * @Date: 2025-03-05 16:04:32
 * @Description: UI3-A 路由配置
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import routes from '@/router/featureConfig/featureTree'
import { merge } from 'lodash-es'

export default merge(routes, {
    root: {
        meta: {},
        children: {
            config: {
                meta: {},
                children: {
                    channel: {
                        meta: {
                            groups: {
                                // 智能侦测
                                intelligence: {
                                    sort: 40,
                                    lk: 'IDCS_SMART_SETTINGS',
                                    icon: 'intelligent_s',
                                },
                            },
                        },
                        children: {
                            // 人脸侦测
                            vfd: {
                                path: 'intelligence/vfd',
                                component: 'channel/ChannelVfd.vue',
                                meta: {
                                    sort: 10,
                                    lk: 'IDCS_FACE_DETECTION',
                                    group: 'intelligence',
                                },
                            },
                            // 人群密度检测
                            cdd: {
                                path: 'intelligence/cdd',
                                component: 'channel/ChannelCDD.vue',
                                meta: {
                                    sort: 20,
                                    lk: 'IDCS_CROWD_DENSITY_DETECTION',
                                    group: 'intelligence',
                                },
                            },
                            // 人员入侵侦测
                            ipd: {
                                path: 'intelligence/ipd',
                                component: 'channel/ChannelIpd.vue',
                                meta: {
                                    sort: 30,
                                    lk: 'IDCS_PEOPLE_INSTRUSION_DETECTION',
                                    group: 'intelligence',
                                },
                            },
                            // 人数统计
                            cpc: {
                                path: 'intelligence/cpc',
                                component: 'channel/ChannelCpc.vue',
                                meta: {
                                    sort: 40,
                                    lk: 'IDCS_PEOPLE_COUNT_DETECTION',
                                    group: 'intelligence',
                                },
                            },
                            // 物品遗留与看护
                            osc: {
                                path: 'intelligence/osc',
                                component: 'channel/ChannelOSC.vue',
                                meta: {
                                    sort: 50,
                                    lk: 'IDCS_WATCH_DETECTION',
                                    group: 'intelligence',
                                },
                            },
                            // 异常
                            avd: {
                                path: 'intelligence/avd',
                                component: 'channel/ChannelAVD.vue',
                                meta: {
                                    sort: 60,
                                    lk: 'IDCS_ABNORMAL_DETECTION',
                                    group: 'intelligence',
                                },
                            },
                            // 越界
                            tripwire: {
                                path: 'intelligence/tripwire',
                                component: 'channel/ChannelTripwire.vue',
                                meta: {
                                    sort: 70,
                                    lk: 'IDCS_BEYOND_DETECTION',
                                    group: 'intelligence',
                                },
                            },
                            // 区域入侵
                            pea: {
                                path: 'intelligence/pea',
                                component: 'channel/ChannelPEA.vue',
                                meta: {
                                    sort: 80,
                                    lk: 'IDCS_INVADE_DETECTION',
                                    group: 'intelligence',
                                },
                            },
                        },
                    },
                    aiAndEvent: {
                        meta: {
                            groups: {
                                // 智能事件
                                smartAlarm: {
                                    sort: 40,
                                    lk: 'IDCS_SMART_ALARM',
                                    icon: 'intelligentAlarm_s',
                                },
                                combination: {
                                    sort: 60,
                                    lk: 'IDCS_COMBINATION_ALARM',
                                    icon: 'combinedAlarm_s',
                                },
                                abnormal: {
                                    sort: 70,
                                    lk: 'IDCS_ABNORMAL_ALARM',
                                    icon: 'abnormalAlarm_s',
                                },
                            },
                        },
                        children: {
                            // 声音
                            alarmAudio: {
                                meta: {
                                    // todo
                                    remove: true,
                                },
                            },
                            // 新增排程
                            alaramScheduleAdd: {
                                path: 'schedule/add',
                                component: 'aiAndEvent/ScheduleAdd.vue',
                                meta: {
                                    sort: 90,
                                    lk: 'IDCS_ADD_SCHEDULE',
                                    group: 'eventNotify',
                                },
                            },
                            // 排程管理
                            alaramScheduleManage: {
                                path: 'schedule/manager',
                                component: 'aiAndEvent/ScheduleManage.vue',
                                meta: {
                                    sort: 100,
                                    lk: 'IDCS_SCHEDULE_MANAGE',
                                    group: 'eventNotify',
                                },
                            },
                            // 人脸识别
                            alarmVfd: {
                                path: 'vfd',
                                component: 'aiAndEvent/Vfd.vue',
                                meta: {
                                    sort: 10,
                                    lk: 'IDCS_FACE_DETECTION',
                                    group: 'smartAlarm',
                                },
                            },
                            // 人群密度检测
                            alarmCdd: {
                                path: 'cdd',
                                component: 'aiAndEvent/Cdd.vue',
                                meta: {
                                    sort: 20,
                                    lk: 'IDCS_CROWD_DENSITY_DETECTION',
                                    group: 'smartAlarm',
                                },
                            },
                            // 人员入侵侦测
                            alarmIpd: {
                                path: 'ipd',
                                component: 'aiAndEvent/Ipd.vue',
                                meta: {
                                    sort: 30,
                                    lk: 'IDCS_PEOPLE_INSTRUSION_DETECTION',
                                    group: 'smartAlarm',
                                },
                            },
                            // 人数统计
                            alarmCpc: {
                                path: 'cpc',
                                component: 'aiAndEvent/Cpc.vue',
                                meta: {
                                    sort: 40,
                                    lk: 'IDCS_PEOPLE_COUNT_DETECTION',
                                    group: 'smartAlarm',
                                },
                            },
                            // 物品遗留与看护
                            alarmOsc: {
                                path: 'osc',
                                component: 'aiAndEvent/Osc.vue',
                                meta: {
                                    sort: 50,
                                    lk: 'IDCS_WATCH_DETECTION',
                                    group: 'smartAlarm',
                                },
                            },
                            // 异常
                            alarmAvd: {
                                path: 'avd',
                                component: 'aiAndEvent/Avd.vue',
                                meta: {
                                    sort: 60,
                                    lk: 'IDCS_ABNORMAL_DETECTION',
                                    group: 'smartAlarm',
                                },
                            },
                            // 越界
                            alarmTripwire: {
                                path: 'tripwire',
                                component: 'aiAndEvent/Tripwire.vue',
                                meta: {
                                    sort: 70,
                                    lk: 'IDCS_BEYOND_DETECTION',
                                    group: 'smartAlarm',
                                },
                            },
                            // 区域入侵
                            alarmPea: {
                                path: 'pea',
                                component: 'aiAndEvent/Pea.vue',
                                meta: {
                                    sort: 80,
                                    lk: 'IDCS_INVADE_DETECTION',
                                    group: 'smartAlarm',
                                },
                            },
                        },
                    },
                    disk: {
                        meta: {
                            remove: true,
                        },
                    },
                    record: {
                        meta: {
                            groups: {
                                // 排程
                                schedule: {
                                    sort: 30,
                                    lk: 'IDCS_RECORD_SCHEDULE',
                                    icon: 'scheduleRec_s',
                                },
                            },
                        },
                        children: {
                            // 录像的排程配置
                            recordSchedule: {
                                path: 'schedule',
                                component: 'record/RecordSchedule.vue',
                                meta: {
                                    sort: 20,
                                    lk: 'IDCS_SCHEDULE_OF_RECORD_SET',
                                    group: 'record',
                                },
                            },
                            recStatus: {
                                meta: {
                                    remove: true,
                                },
                            },
                        },
                    },
                    system: {
                        meta: {
                            groups: {
                                // 磁盘管理
                                diskInfo: {
                                    sort: 30,
                                    lk: 'IDCS_SYSTEM_INFORMATION',
                                    icon: 'diskInfo_s',
                                },
                            },
                        },
                        children: {
                            outputSettings: {
                                meta: {
                                    remove: true,
                                },
                            },
                            poeSettings: {
                                meta: {
                                    // todo
                                    remove: true,
                                },
                            },
                            recorderOsdSettings: {
                                meta: {
                                    remove: true,
                                },
                            },
                            // 云升级
                            upgradeOnline: {
                                path: 'upgradeOnline',
                                component: 'net/CloudUpgrade.vue',
                                meta: {
                                    sort: 70,
                                    lk: 'IDCS_ONLINE_UPGRADE',
                                    group: 'maintenance',
                                    hasCap(systemCaps) {
                                        return systemCaps.showCloudUpgrade
                                    },
                                },
                            },
                            alarmStatus: {
                                meta: {
                                    remove: true,
                                },
                            },
                            recordStatus: {
                                meta: {
                                    remove: true,
                                },
                            },
                            networkStatus: {
                                meta: {
                                    remove: true,
                                },
                            },
                            diskStatus: {
                                meta: {
                                    remove: true,
                                },
                            },
                            // 磁盘管理
                            systemDiskManagement: {
                                path: 'disk/management',
                                component: 'disk/DiskManagement.vue',
                                meta: {
                                    sort: 10,
                                    lk: 'IDCS_DISK_MANAGE',
                                    group: 'diskManagement',
                                    default: true,
                                    inHome: 'self',
                                    homeSort: 70,
                                    auth: 'diskMgr',
                                },
                            },
                            // 存储模式配置
                            systemStorageMode: {
                                path: 'disk/storage/mode',
                                component: 'disk/StorageMode.vue',
                                meta: {
                                    sort: 20,
                                    lk: 'IDCS_STORAGE_MODE_SET',
                                    group: 'storageMode',
                                    inHome: 'self',
                                    homeSort: 80,
                                    auth: 'diskMgr',
                                },
                            },
                            // 查看磁盘信息
                            systemViewDiskInfo: {
                                path: 'disk/information',
                                components: {
                                    toolBar: 'system/SystemToolBar.vue',
                                    default: 'system/DiskStatus.vue',
                                },
                                meta: {
                                    sort: 30,
                                    lk: 'IDCS_VIEW_DISK_INFORMATION',
                                    group: 'diskInfo',
                                    inHome: 'self',
                                    homeSort: 90,
                                },
                            },
                            // SMART信息
                            systemSmartInfo: {
                                path: 'disk/information/smart',
                                component: 'disk/SmartInfo.vue',
                                meta: {
                                    sort: 40,
                                    lk: 'IDCS_DISK_SMART_INFO',
                                    group: 'diskInfo',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
} as FeatureTree)
