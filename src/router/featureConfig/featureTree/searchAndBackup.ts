/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-19 17:29:19
 * @Description: 搜索与备份
 */
export default {
    component: 'layout/L2T2Layout.vue',
    meta: {
        sort: 30,
        lk: 'IDCS_SEARCH_AND_BACKUP',
    },
    children: {
        byTimeSlice: {
            //按时间切片
            component: 'searchAndBackup/SearchAndBackupByTimeSlice.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_BY_TIME_SLICE',
            },
        },
        byEvent: {
            //按事件
            component: 'searchAndBackup/SearchAndBackupByEvent.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_BY_EVENT',
            },
        },
        byTime: {
            //按事件
            component: 'searchAndBackup/SearchAndBackupByTime.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_BY_TIME',
            },
        },
        imageManage: {
            //图片管理
            component: 'searchAndBackup/SearchAndBackupImageManage.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_IMAGE_MANAGE',
            },
        },
        backupState: {
            //备份状态
            component: 'searchAndBackup/SearchAndBackupState.vue',
            meta: {
                sort: 50,
                lk: 'IDCS_IMAGE_MANAGE',
            },
        },
    },
} as FeatureItem
