/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-19 17:29:19
 * @Description: 搜索与备份
 */
const searchAndBackupRoutes: FeatureItem = {
    component: 'layout/L2T2Layout.vue',
    meta: {
        sort: 30,
        lk: 'IDCS_SEARCH_AND_BACKUP',
        icon: 'recBackUp_menu',
    },
    children: {
        // 按时间切片
        byTimeSlice: {
            component: 'searchAndBackup/SearchAndBackupByTimeSlice.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_BY_TIME_SLICE',
            },
        },
        // 按事件
        byEvent: {
            component: 'searchAndBackup/SearchAndBackupByEvent.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_BY_EVENT',
            },
        },
        // 按时间
        byTime: {
            component: 'searchAndBackup/SearchAndBackupByTime.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_BY_TIME',
            },
        },
        // 图片管理
        imageManage: {
            component: 'searchAndBackup/SearchAndBackupImageManage.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_IMAGE_MANAGE',
            },
        },
        // 备份状态
        backupState: {
            component: 'searchAndBackup/SearchAndBackupState.vue',
            meta: {
                sort: 50,
                lk: 'IDCS_BACKUP_STATE',
            },
        },
    },
}

export default searchAndBackupRoutes
