/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-18 16:35:38
 * @Description:
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-24 15:38:04
 */

import searchAndBackup from './searchAndBackup'
import intelligentAnalysis from './intelligentAnalysis'
import businessApplication from './businessApplication'

export default {
    live: {
        //现场
        component: 'topFeature/Live.vue',
        meta: {
            sort: 10,
            lk: 'IDCS_LIVE_PREVIEW',
            icon: 'live_menu',
        },
    },
    playback: {
        //回放
        component: 'topFeature/Playback.vue',
        meta: {
            sort: 20,
            lk: 'IDCS_REPLAY',
            icon: 'rec_menu',
        },
    },
    searchAndBackup, // 搜索与备份
    intelligentAnalysis, //智能分析
    functionPanel: {
        //功能面板
        component: 'topFeature/FunctionPanel.vue',
        meta: {
            sort: 50,
            lk: 'IDCS_FUNCTION_PANEL',
            icon: 'cfgHome_menu',
        },
    },
    businessApplication, //业务应用
} as FeatureTree
