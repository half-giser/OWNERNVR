/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 11:47:13
 * @Description: 功能面板-AI/事件
 */
const aiAndEventRoutes: FeatureItem = {
    path: 'alarm',
    component: 'layout/L2T1Layout.vue',
    meta: {
        sort: 30,
        lk: 'IDCS_AI_AND_EVENT',
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
            // 智能配置 1.4.13
            target: {
                sort: 30,
                lk: 'IDCS_INTELLIGENT_CONFIG',
                icon: 'config_intelligent',
            },
            //普通事件
            generalEvent: {
                sort: 50,
                lk: 'IDCS_GENERAL_EVENT',
                icon: 'motionAlarm_s',
            },
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
        // 报警输出
        alarmOut: {
            path: 'alarm_out',
            component: 'aiAndEvent/AlarmOut.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_ALARM_OUT',
                group: 'eventNotify',
                default: true,
                inHome: 'self',
                homeSort: 50,
                homeDefault: true,
            },
        },
        // E-Mail
        alarmEmailReceiver: {
            path: 'email',
            component: 'aiAndEvent/EmailReceiver.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_EMAIL',
                group: 'eventNotify',
            },
        },
        // 显示
        alarmDisplay: {
            path: 'display',
            component: 'aiAndEvent/Display.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_DISPLAY',
                group: 'eventNotify',
            },
        },
        // 蜂鸣器
        alarmBuzzer: {
            path: 'beeper',
            component: 'aiAndEvent/Buzzer.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_BUZZER',
                group: 'eventNotify',
            },
        },
        // 推送
        alarmPush: {
            path: 'push',
            component: 'aiAndEvent/Push.vue',
            meta: {
                sort: 50,
                lk: 'IDCS_PUSH_MESSAGE',
                group: 'eventNotify',
            },
        },
        // 声音
        alarmAudio: {
            path: 'audioAlarmOut',
            component: 'aiAndEvent/Audio.vue',
            meta: {
                sort: 60,
                lk: 'IDCS_AUDIO',
                group: 'eventNotify',
                minHeight: 800,
            },
        },
        // 闪灯
        alarmLight: {
            path: 'whiteLightAlarmOut',
            component: 'aiAndEvent/Light.vue',
            meta: {
                sort: 70,
                lk: 'IDCS_LIGHT',
                group: 'eventNotify',
                hasCap(systemCaps) {
                    return !systemCaps.hotStandBy
                },
            },
        },
        // 报警服务器
        alarmServer: {
            path: 'server',
            component: 'aiAndEvent/AlarmServer.vue',
            meta: {
                sort: 80,
                lk: 'IDCS_ALARM_SERVER',
                group: 'eventNotify',
                minHeight: 800,
                hasCap(systemCaps) {
                    return systemCaps.supportAlarmServerConfig
                },
            },
        },
        // 事件启用 1.4.13
        intelligentMode: {
            path: 'intelligentMode',
            component: 'aiAndEvent/IntelligentMode.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_EVENT_ENABLEMENT',
                group: 'aiEvent',
                hasCap(systemCaps) {
                    return !systemCaps.hotStandBy
                },
            },
        },
        // 周界防范
        perimeterDetection: {
            path: 'boundary',
            component: 'aiAndEvent/PerimeterDetection.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_HUMAN_CAR_OTHER_BOUNDARY',
                group: 'aiEvent',
                default: true,
                inHome: 'self',
                homeSort: 10,
                minWidth: 1800,
                minHeight: 850,
                hasCap(systemCaps) {
                    return !systemCaps.IntelAndFaceConfigHide && !systemCaps.hotStandBy
                },
            },
            async beforeEnter(to, from, next) {
                const { Translate } = useLangStore()
                const flag = await checkChlListCaps('boundary')
                if (flag) {
                    next()
                } else {
                    openMessageBox(Translate('IDCS_ADD_INTEL_CHANNEL_TIP').formatForLang(Translate('IDCS_HUMAN_CAR_OTHER_BOUNDARY')))
                    if (from.fullPath === to.fullPath) {
                        next('/live')
                    } else {
                        next(from)
                    }
                }
            },
        },
        // 人脸识别
        faceRecognition: {
            path: 'faceRecognition',
            component: 'aiAndEvent/FaceRecognition.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_FACE_RECOGNITION',
                group: 'aiEvent',
                inHome: 'self',
                homeSort: 20,
                minWidth: 1800,
                minHeight: 850,
                hasCap(systemCaps) {
                    return !systemCaps.IntelAndFaceConfigHide && !systemCaps.hotStandBy
                },
            },
            async beforeEnter(to, from, next) {
                const { Translate } = useLangStore()
                const flag = await checkChlListCaps('faceRecognition')
                if (flag) {
                    next()
                } else {
                    openMessageBox(Translate('IDCS_ADD_INTEL_CHANNEL_TIP').formatForLang(Translate('IDCS_FACE_RECOGNITION')))
                    if (from.fullPath === to.fullPath) {
                        next('/live')
                    } else {
                        next(from)
                    }
                }
            },
        },
        // 车牌识别
        lrp: {
            path: 'vehicleRecognition',
            component: 'aiAndEvent/LPR.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_VEHICLE_DETECTION',
                group: 'aiEvent',
                inHome: 'self',
                homeSort: 30,
                minWidth: 1800,
                minHeight: 850,
                hasCap(systemCaps) {
                    return !systemCaps.IntelAndFaceConfigHide && !systemCaps.hotStandBy
                },
            },
            async beforeEnter(to, from, next) {
                const { Translate } = useLangStore()
                const flag = await checkChlListCaps('vehicleRecognition')
                if (flag) {
                    next()
                } else {
                    openMessageBox(Translate('IDCS_ADD_INTEL_CHANNEL_TIP').formatForLang(Translate('IDCS_VEHICLE_DETECTION')))
                    if (from.fullPath === to.fullPath) {
                        next('/live')
                    } else {
                        next(from)
                    }
                }
            },
        },
        // 视频结构化 1.4.13
        videoStructure: {
            path: 'videoStructure',
            component: 'aiAndEvent/VideoStructure.vue',
            meta: {
                sort: 50,
                lk: 'IDCS_VSD_DETECTION',
                group: 'aiEvent',
                minWidth: 1800,
                minHeight: 850,
                hasCap(systemCaps) {
                    return !systemCaps.IntelAndFaceConfigHide && !systemCaps.hotStandBy
                },
            },
            async beforeEnter(to, from, next) {
                const { Translate } = useLangStore()
                const flag = await checkChlListCaps('videoStructure')
                if (flag) {
                    next()
                } else {
                    openMessageBox(Translate('IDCS_ADD_INTEL_CHANNEL_TIP').formatForLang(Translate('IDCS_VEHICLE_DETECTION')))
                    if (from.fullPath === to.fullPath) {
                        next('/live')
                    } else {
                        next(from)
                    }
                }
            },
        },
        // 更多
        aiEventMore: {
            path: 'more',
            component: 'aiAndEvent/More.vue',
            meta: {
                sort: 60,
                lk: 'IDCS_MORE',
                group: 'aiEvent',
                minWidth: 1800,
                minHeight: 850,
                hasCap(systemCaps) {
                    return !systemCaps.IntelAndFaceConfigHide && !systemCaps.hotStandBy
                },
            },
            async beforeEnter(to, from, next) {
                const { Translate } = useLangStore()
                const flag = await checkChlListCaps('more')
                if (flag) {
                    next()
                } else {
                    openMessageBox(Translate('IDCS_ADD_INTEL_CHANNEL_TIP').formatForLang(Translate('IDCS_INTELLIGENT')))
                    if (from.fullPath === to.fullPath) {
                        next('/live')
                    } else {
                        next(from)
                    }
                }
            },
        },
        // 目标侦测 1.4.13
        detectTarget: {
            path: 'detectTarget',
            component: 'aiAndEvent/DetectTarget.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_PICTURE_COMPARSION',
                group: 'target',
                hasCap(systemCaps) {
                    return !systemCaps.hotStandBy
                },
            },
        },
        // 移动侦测
        motionEventConfig: {
            path: 'motion',
            component: 'aiAndEvent/MotionEventConfig.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_MOTION_DETECTION',
                group: 'generalEvent',
                default: true,
                inHome: 'self',
                homeSort: 60,
                hasCap(systemCaps) {
                    return !systemCaps.hotStandBy
                },
            },
        },
        // 传感器
        sensorEventConfig: {
            path: 'sensor',
            component: 'aiAndEvent/SensorEventConfig.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_SENSOR',
                group: 'generalEvent',
                inHome: 'self',
                homeSort: 40,
                hasCap(systemCaps) {
                    return !systemCaps.hotStandBy
                },
            },
        },
        // 组合报警
        combinationAlarm: {
            path: 'combined',
            component: 'aiAndEvent/CombinationAlarm.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_COMBINATION_ALARM',
                group: 'generalEvent',
                hasCap(systemCaps) {
                    return !systemCaps.hotStandBy
                },
            },
        },
        // 前端掉线
        ipcOffline: {
            path: 'offline',
            component: 'aiAndEvent/IpcOffline.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_FRONT_OFFLINE',
                group: 'generalEvent',
                hasCap(systemCaps) {
                    return !!systemCaps.ipChlMaxCount && !systemCaps.hotStandBy
                },
            },
        },
        // 异常报警
        exceptionAlarm: {
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
        // 视频丢失
        alarmVideoLoss: {
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
        // 系统撤防
        systemDisarm: {
            path: 'systemDisarm',
            component: 'aiAndEvent/SystemDisarm.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_SYSTEM_ARM',
                group: 'systemDisarm',
                default: true,
                hasCap(systemCaps) {
                    return !systemCaps.hotStandBy
                },
            },
            // 撤防布防界面，若没有开启远程权限，提示开启权限，页面不跳转
            async beforeEnter(to, from, next) {
                const { Translate } = useLangStore()
                const result = await querySystemDisArmParam()
                const $ = queryXml(result)
                const remoteSwitch = $('content/remoteSwitch').text().bool()
                if (remoteSwitch) {
                    next()
                } else {
                    openMessageBox(Translate('IDCS_DISARM_AUTH_TIP'))
                    if (from.fullPath === to.fullPath) {
                        next('/live')
                    } else {
                        next(from)
                    }
                }
            },
        },
        // 报警状态
        alarmsStatus: {
            path: 'status',
            component: 'system/AlarmStatus.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_ALARM_STATE',
                group: 'alarmStatus',
                default: true,
            },
        },
    },
}

export default aiAndEventRoutes
