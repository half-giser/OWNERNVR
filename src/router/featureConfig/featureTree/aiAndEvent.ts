/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 11:47:13
 * @Description: 功能面板-AI/事件
 */
export default {
    path: 'alarm',
    component: 'layout/L2T1Layout.vue',
    meta: {
        sort: 30,
        lk: 'IDCS_AI_AND_EVENT',
        plClass: 'md2',
        icon: 'alarm',
        auth: 'alarmMgr',
        groups: {
            //事件通知
            eventNotify: {
                sort: 10,
                lk: 'IDCS_EVENT_NOTIFY',
                icon: 'eventNotification_s',
            },
            //AI事件
            aiEvent: {
                sort: 20,
                lk: 'IDCS_AI_EVENT',
                icon: 'intelligentAlarm_s',
            },
            // 样本库
            database: {
                sort: 30,
                lk: 'IDCS_FACE_LIBRARY_SELECT',
                icon: 'database_s',
            },
            // 智能事件
            // smartAlarm: {
            //     sort: 40,
            //     lk: 'IDCS_SMART_ALARM',
            //     icon: 'intelligentAlarm_s',
            // },
            //普通事件
            generalEvent: {
                sort: 50,
                lk: 'IDCS_GENERAL_EVENT',
                icon: 'motionAlarm_s',
            },
            // combination: {
            //     sort: 60,
            //     lk: 'IDCS_COMBINATION_ALARM',
            //     icon: 'combinedAlarm_s',
            // },
            // abnormal: {
            //     sort: 70,
            //     lk: 'IDCS_ABNORMAL_ALARM',
            //     icon: 'abnormalAlarm_s',
            // },
            //系统撤防
            systemDisarm: {
                sort: 80,
                lk: 'IDCS_SYSTEM_ARM',
                icon: 'systemDisarm',
            },
            //报警状态
            alarmStatus: {
                sort: 90,
                lk: 'IDCS_ALARM_STATE',
                icon: 'alarmStatus_s',
            },
        },
    },
    children: {
        alarmOut: {
            //报警输出
            path: 'alarm_out',
            component: 'aiAndEvent/AlarmOut.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_ALARM_OUT',
                group: 'eventNotify',
                default: true,
                inHome: 'self',
                homeSort: 50,
            },
        },
        alarmEmailReceiver: {
            //E-Mail
            path: 'email',
            component: 'aiAndEvent/EmailReceiver.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_EMAIL',
                group: 'eventNotify',
            },
        },
        alarmDisplay: {
            //显示
            path: 'display',
            component: 'aiAndEvent/Display.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_DISPLAY',
                group: 'eventNotify',
            },
        },
        alarmBuzzer: {
            //蜂鸣器
            path: 'beeper',
            component: 'aiAndEvent/Buzzer.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_BUZZER',
                group: 'eventNotify',
            },
        },
        alarmPush: {
            //推送
            path: 'push',
            component: 'aiAndEvent/Push.vue',
            meta: {
                sort: 50,
                lk: 'IDCS_PUSH_MESSAGE',
                group: 'eventNotify',
            },
        },
        alarmAudio: {
            //声音
            path: 'audioAlarmOut',
            component: 'aiAndEvent/Audio.vue',
            meta: {
                sort: 60,
                lk: 'IDCS_AUDIO',
                group: 'eventNotify',
                hasCap(systemCaps) {
                    return import.meta.env.VITE_UI_TYPE !== 'UI3-A' || systemCaps.supportAlarmAudioConfig
                },
            },
        },
        alarmLight: {
            //闪动
            path: 'whiteLightAlarmOut',
            component: 'aiAndEvent/Light.vue',
            meta: {
                sort: 70,
                lk: 'IDCS_LIGHT',
                group: 'eventNotify',
            },
        },
        alarmServer: {
            //报警服务器
            path: 'server',
            component: 'aiAndEvent/AlarmServer.vue',
            meta: {
                sort: 80,
                lk: 'IDCS_ALARM_SERVER',
                group: 'eventNotify',
                hasCap(systemCaps) {
                    return systemCaps.supportAlarmServerConfig
                },
            },
        },
        // 以下页面只有在UI3-A才有
        // alaramScheduleAdd: {
        //     //
        //     path: 'schedule/add',
        //     component: 'aiAndEvent/ScheduleAdd.vue',
        //     meta: {
        //         sort: 90,
        //         lk: 'IDCS_ADD_SCHEDULE',
        //         group: 'eventNotify',
        //     },
        // },
        // alaramScheduleManage: {
        //     //
        //     path: 'schedule/manager',
        //     component: 'aiAndEvent/ScheduleManage.vue',
        //     meta: {
        //         sort: 100,
        //         lk: 'IDCS_SCHEDULE_MANAGE',
        //         group: 'eventNotify',
        //     },
        // },
        perimeterDetection: {
            //周界防范
            path: 'boundary',
            component: 'aiAndEvent/PerimeterDetection.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_HUMAN_CAR_OTHER_BOUNDARY',
                group: 'aiEvent',
                default: true,
                inHome: 'self',
                homeSort: 10,
                hasCap(systemCaps) {
                    return !systemCaps.IntelAndFaceConfigHide
                },
            },
            async beforeEnter(to, from, next) {
                const { openMessageBox } = useMessageBox()
                const { Translate } = useLangStore()
                const flag = await checkChlListCaps('boundary')
                if (flag) {
                    next()
                } else {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_ADD_INTEL_CHANNEL_TIP').formatForLang(Translate('IDCS_HUMAN_CAR_OTHER_BOUNDARY')),
                    })
                    if (from.fullPath === to.fullPath) {
                        next('/live')
                    } else {
                        next(from)
                    }
                }
            },
        },
        faceRecognition: {
            //人脸识别
            path: 'faceRecognition',
            component: 'aiAndEvent/FaceRecognition.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_FACE_RECOGNITION',
                group: 'aiEvent',
                inHome: 'self',
                homeSort: 20,
                hasCap(systemCaps) {
                    return !systemCaps.IntelAndFaceConfigHide
                },
            },
            async beforeEnter(to, from, next) {
                const { openMessageBox } = useMessageBox()
                const { Translate } = useLangStore()
                const flag = await checkChlListCaps('faceRecognition')
                if (flag) {
                    next()
                } else {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_ADD_INTEL_CHANNEL_TIP').formatForLang(Translate('IDCS_FACE_RECOGNITION')),
                    })
                    if (from.fullPath === to.fullPath) {
                        next('/live')
                    } else {
                        next(from)
                    }
                }
            },
        },
        lrp: {
            //车牌识别
            path: 'vehicleRecognition',
            component: 'aiAndEvent/LPR.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_VEHICLE_DETECTION',
                group: 'aiEvent',
                inHome: 'self',
                homeSort: 30,
                hasCap(systemCaps) {
                    return !systemCaps.IntelAndFaceConfigHide
                },
            },
            async beforeEnter(to, from, next) {
                const { openMessageBox } = useMessageBox()
                const { Translate } = useLangStore()
                const flag = await checkChlListCaps('vehicleRecognition')
                if (flag) {
                    next()
                } else {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_ADD_INTEL_CHANNEL_TIP').formatForLang(Translate('IDCS_VEHICLE_DETECTION')),
                    })
                    if (from.fullPath === to.fullPath) {
                        next('/live')
                    } else {
                        next(from)
                    }
                }
            },
        },
        aiEventMore: {
            //更多
            path: 'more',
            component: 'aiAndEvent/More.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_MORE',
                group: 'aiEvent',
                hasCap(systemCaps) {
                    return !systemCaps.IntelAndFaceConfigHide
                },
            },
            async beforeEnter(to, from, next) {
                const { openMessageBox } = useMessageBox()
                const { Translate } = useLangStore()
                const flag = await checkChlListCaps('more')
                if (flag) {
                    next()
                } else {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_ADD_INTEL_CHANNEL_TIP').formatForLang(Translate('IDCS_INTELLIGENT')),
                    })
                    if (from.fullPath === to.fullPath) {
                        next('/live')
                    } else {
                        next(from)
                    }
                }
            },
        },
        motionEventConfig: {
            //移动侦测
            path: 'motion',
            component: 'aiAndEvent/MotionEventConfig.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_MOTION_DETECTION',
                group: 'generalEvent',
                default: true,
                inHome: 'self',
                homeSort: 60,
            },
        },
        sensorEventConfig: {
            //传感器
            path: 'sensor',
            component: 'aiAndEvent/SensorEventConfig.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_SENSOR',
                group: 'generalEvent',
                inHome: 'self',
                homeSort: 40,
            },
        },
        combinationAlarm: {
            //组合报警
            path: 'combined',
            component: 'aiAndEvent/CombinationAlarm.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_COMBINATION_ALARM',
                group: 'generalEvent',
            },
        },
        ipcOffline: {
            //前端掉线
            path: 'offline',
            component: 'aiAndEvent/IpcOffline.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_FRONT_OFFLINE',
                group: 'generalEvent',
                hasCap(systemCaps) {
                    return !!systemCaps.ipChlMaxCount
                },
            },
            async beforeEnter(to, from, next) {
                const { openMessageBox } = useMessageBox()
                const { Translate } = useLangStore()
                const result = await querySystemDisArmParam()
                const $ = queryXml(result)
                const remoteSwitch = $('//content/remoteSwitch').text().toBoolean()
                if (remoteSwitch) {
                    next()
                } else {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_DISARM_AUTH_TIP'),
                    })
                    if (from.fullPath === to.fullPath) {
                        next('/live')
                    } else {
                        next(from)
                    }
                }
            },
        },
        exceptionAlarm: {
            //异常报警
            path: 'abnormal',
            component: 'aiAndEvent/ExceptionAlarm.vue',
            meta: {
                sort: 170,
                lk: 'IDCS_ABNORMAL_ALARM',
                group: 'generalEvent',
                hasCap(systemCaps) {
                    return !!systemCaps.ipChlMaxCount
                },
            },
        },
        alarmVideoLoss: {
            // 视频丢失
            path: 'video/loss',
            component: 'aiAndEvent/VideoLoss.vue',
            meta: {
                sort: 180,
                lk: 'IDCS_VIDEO_LOSE_SET',
                group: 'generalEvent',
                hasCap(systemCaps) {
                    return !!systemCaps.analogChlCount
                },
            },
        },
        systemDisarm: {
            //系统撤防
            path: 'systemDisarm',
            component: 'aiAndEvent/SystemDisarm.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_SYSTEM_ARM',
                group: 'systemDisarm',
                default: true,
            },
            // 撤防布防界面，若没有开启远程权限，提示开启权限，页面不跳转
        },
        alarmsStatus: {
            //报警状态
            path: 'status',
            component: 'system/AlarmStatus.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_ALARM_STATE',
                group: 'alarmStatus',
                default: true,
            },
        },
        faceFeatureLibrary: {
            // 人脸库
            path: 'faceFeature',
            component: 'intelligentAnalysis/IntelFaceDB.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_FEATURE_LIBRARY',
                group: 'database',
                default: true,
                hasCap(systemCaps) {
                    return systemCaps.supportFaceMatch && import.meta.env.VITE_UI_TYPE === 'UI2-A'
                },
            },
        },
        vehicleDatabase: {
            // 车牌库
            path: 'vehicleDatabase',
            component: 'intelligentAnalysis/IntelLicencePlateDB.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_VEHICLE_DATABASE',
                group: 'database',
                hasCap(systemCaps) {
                    return systemCaps.supportPlateMatch && import.meta.env.VITE_UI_TYPE === 'UI2-A'
                },
            },
        },
        // 以下页面只有在UI3-A才有
        // alarmVfd: {
        //     path: 'vfd',
        //     component: 'aiAndEvent/Vfd.vue',
        //     meta: {
        //         sort: 10,
        //         lk: 'IDCS_FACE_DETECTION',
        //         group: 'smartAlarm',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
        // alarmCdd: {
        //     // 人群密度检测
        //     path: 'cdd',
        //     component: 'aiAndEvent/Cdd.vue',
        //     meta: {
        //         sort: 20,
        //         lk: 'IDCS_CROWD_DENSITY_DETECTION',
        //         group: 'smartAlarm',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
        // alarmIpd: {
        //     // 人员入侵侦测
        //     path: 'ipd',
        //     component: 'aiAndEvent/Ipd.vue',
        //     meta: {
        //         sort: 30,
        //         lk: 'IDCS_PEOPLE_INSTRUSION_DETECTION',
        //         group: 'smartAlarm',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
        // alarmCpc: {
        //     // 人数统计
        //     path: 'cpc',
        //     component: 'aiAndEvent/Cpc.vue',
        //     meta: {
        //         sort: 40,
        //         lk: 'IDCS_PEOPLE_COUNT_DETECTION',
        //         group: 'smartAlarm',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
        // alarmOsc: {
        //     // 物品遗留与看护
        //     path: 'osc',
        //     component: 'aiAndEvent/Osc.vue',
        //     meta: {
        //         sort: 50,
        //         lk: 'IDCS_WATCH_DETECTION',
        //         group: 'smartAlarm',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
        // alarmAvd: {
        //     // 异常
        //     path: 'avd',
        //     component: 'aiAndEvent/Avd.vue',
        //     meta: {
        //         sort: 60,
        //         lk: 'IDCS_ABNORMAL_DETECTION',
        //         group: 'smartAlarm',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
        // alarmTripwire: {
        //     // 越界
        //     path: 'tripwire',
        //     component: 'aiAndEvent/Tripwire.vue',
        //     meta: {
        //         sort: 70,
        //         lk: 'IDCS_BEYOND_DETECTION',
        //         group: 'smartAlarm',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
        // alarmPea: {
        //     // 区域入侵
        //     path: 'pea',
        //     component: 'aiAndEvent/Pea.vue',
        //     meta: {
        //         sort: 80,
        //         lk: 'IDCS_INVADE_DETECTION',
        //         group: 'smartAlarm',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
    },
} as FeatureItem
