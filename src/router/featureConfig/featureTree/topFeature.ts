/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-18 16:35:38
 * @Description:
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-11 14:14:42
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
        },
    },
    playback: {
        //回放
        component: 'topFeature/Playback.vue',
        meta: {
            sort: 20,
            lk: 'IDCS_REPLAY',
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
        },
    },
    businessApplication, //业务应用
} as FeatureTree
