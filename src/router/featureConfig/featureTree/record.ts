/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 11:47:13
 * @Description: 功能面板-录像
 */
export default {
    path: 'record',
    component: 'layout/L2T1Layout.vue',
    meta: {
        sort: 20,
        lk: 'IDCS_RECORD',
        plClass: 'md2',
        icon: 'rec',
        groups: {
            //录像
            record: {
                sort: 10,
                lk: 'IDCS_RECORD',
                icon: 'rec_s',
            },
            //编码参数
            stream: {
                sort: 20,
                lk: 'IDCS_CODE_PARAM',
                icon: 'encodeParam_s',
            },
            // schedule:
            schedule: {
                sort: 30,
                lk: 'IDCS_RECORD_SCHEDULE',
                icon: 'scheduleRec_s',
            },
            //录像状态
            recStatus: {
                sort: 40,
                lk: 'IDCS_RECORD_STATE',
                icon: 'recStatus_s',
            },
        },
    },
    children: {
        mode: {
            //模式配置
            path: 'mode',
            component: 'record/RecordMode.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_MODE_SET',
                group: 'record',
                default: true,
                inHome: 'self',
                homeSort: 10,
            },
        },
        parameter: {
            //参数配置
            path: 'parameter',
            component: 'record/RecordParameter.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_PARAM_SET',
                group: 'record',
            },
        },
        eventStream: {
            //事件录像码流
            path: 'stream/event',
            component: 'record/RecordEventStream.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_EVENT_RECORD_CODE_STREAM',
                group: 'stream',
                default: true,
                inHome: 'group',
                homeSort: 20,
            },
        },
        timingStream: {
            //定时录像码流
            path: 'stream/timing',
            component: 'record/RecordTimingStream.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_TIME_RECORD_CODE_STREAM',
                group: 'stream',
            },
        },
        subStream: {
            //录像子码流
            path: 'stream/show',
            component: 'record/RecordSubStream.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_RECORD_SUB_CODE_STREAM',
                group: 'stream',
            },
        },
        recStatus: {
            //录像状态
            path: 'status',
            // component: 'record/RecordStatus.vue',
            components: {
                toolBar: 'system/SystemToolBar.vue',
                default: 'system/RecordStatus.vue',
            },
            meta: {
                sort: 10,
                lk: 'IDCS_RECORD_STATE',
                group: 'recStatus',
                default: true,
                inHome: 'self',
                homeSort: 30,
            },
        },
        recSchedule: {
            //
            path: 'schedule',
            components: 'record/RecordSchedule.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_SCHEDULE_OF_RECORD_SET',
                group: 'schedule',
            },
        },
        recScheduleAdd: {
            //
            path: 'schedule/add',
            components: 'record/RecordScheduleAdd.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_ADD_SCHEDULE',
                group: 'schedule',
            },
        },
        recScheduleManager: {
            //
            path: 'schedule/manager',
            components: 'record/RecordScheduleManage.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_VIEW_OR_CHANGE_SCHEDULE',
                group: 'schedule',
            },
        },
    },
} as FeatureItem
