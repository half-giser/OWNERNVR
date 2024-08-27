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
            //
            database: {
                sort: 30,
                lk: 'IDCS_FACE_LIBRARY_SELECT',
                icon: 'database_s',
            },
            //普通事件
            generalEvent: {
                sort: 30,
                lk: 'IDCS_GENERAL_EVENT',
                icon: 'motionAlarm_s',
            },
            //系统撤防
            systemDisarm: {
                sort: 40,
                lk: 'IDCS_SYSTEM_ARM',
                icon: 'systemDisarm',
            },
            //报警状态
            alarmStatus: {
                sort: 50,
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
            },
        },
        alaramScheduleAdd: {
            //
            path: 'schedule/add',
            component: 'aiAndEvent/ScheduleAdd.vue',
            meta: {
                sort: 90,
                lk: 'IDCS_ADD_SCHEDULE',
                group: 'eventNotify',
            },
        },
        alaramScheduleManage: {
            //
            path: 'schedule/manager',
            component: 'aiAndEvent/ScheduleManage.vue',
            meta: {
                sort: 100,
                lk: 'IDCS_SCHEDULE_MANAGE',
                group: 'eventNotify',
            },
        },
        perimeterDetection: {
            //周界防范
            path: 'alarm/boundary',
            component: 'aiAndEvent/PerimeterDetection.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_HUMAN_CAR_OTHER_BOUNDARY',
                group: 'aiEvent',
                default: true,
                inHome: 'self',
                homeSort: 10,
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
            },
        },
        alarmVideoLoss: {
            //
            path: 'video/loss',
            component: 'aiAndEvent/VideoLoss.vue',
            meta: {
                sort: 180,
                lk: 'IDCS_VIDEO_LOSE_SET',
                group: 'generalEvent',
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
            //
            path: 'faceFeature',
            component: 'aiAndEvent/FaceFeature.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_FEATURE_LIBRARY',
                group: 'database',
                default: true,
            },
        },
        vehicleDatabase: {
            //
            path: 'vehicleDatabase',
            component: 'aiAndEvent/FaceFeature.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_VEHICLE_DATABASE',
                group: 'database',
            },
        },
    },
} as FeatureItem
