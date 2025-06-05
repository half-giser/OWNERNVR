/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 11:47:13
 * @Description: 功能面板-录像
 */
const recordRoutes: FeatureItem = {
    path: 'record',
    component: 'layout/L2T1Layout.vue',
    meta: {
        sort: 20,
        lk: 'IDCS_RECORD',
        icon: 'rec',
        auth: 'rec',
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
            //录像状态
            recStatus: {
                sort: 40,
                lk: 'IDCS_RECORD_STATE',
                icon: 'recStatus_s',
            },
        },
        hasCap(systemCaps) {
            return !systemCaps.hotStandBy
        },
    },
    children: {
        // 模式配置
        mode: {
            path: 'mode',
            component: 'record/RecordMode.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_MODE_SET',
                group: 'record',
                default: true,
                homeDefault: true,
                inHome: 'self',
                homeSort: 10,
            },
        },
        // 参数配置
        parameter: {
            path: 'parameter',
            component: 'record/RecordParameter.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_PARAM_SET',
                group: 'record',
            },
        },
        // 事件录像码流
        eventStream: {
            path: 'stream/event',
            component: 'record/RecordStream.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_EVENT_RECORD_CODE_STREAM',
                group: 'stream',
                default: true,
                inHome: 'group',
                homeSort: 20,
            },
        },
        // 定时录像码流
        timingStream: {
            path: 'stream/timing',
            component: 'record/RecordStream.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_TIME_RECORD_CODE_STREAM',
                group: 'stream',
            },
        },
        // 录像子码流
        subStream: {
            path: 'stream/show',
            component: 'record/RecordSubStream.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_RECORD_SUB_CODE_STREAM',
                group: 'stream',
            },
        },
        // 录像状态
        recStatus: {
            path: 'status',
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
    },
}

export default recordRoutes
