/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-04-26 20:30:32
 * @Description: 功能树
 * 用来生成路由树的基础数据
 * 叶子节点代表功能页面：
 * 1、path如果没有，则默认为相对于组件路径的子路径，且Camel Case转Kebab Case
 * 2、component为基于UI目录的子路径，生成路由时会根据具体UI类别和对应的UI配置生成完整路径
 * 非叶子节点代表菜单页面
 *
 */

import channel from './channel'
import record from './record'
import aiAndEvent from './aiAndEvent'
import disk from './disk'
import net from './net'
import userAndSecurity from './userAndSecurity'
import system from './system'
import searchAndBackup from './searchAndBackup'
import intelligentAnalysis from './intelligentAnalysis'
import businessApplication from './businessApplication'

export default {
    // 登录
    login: {
        path: '/login',
        component: 'Login.vue',
        meta: {
            noToken: true,
        },
    },
    // URL自动登录
    urlLogin: {
        path: '/urllogin',
        component: 'URLLogin.vue',
        meta: {
            noToken: true,
        },
    },
    // 授权码登录
    authCodeLogin: {
        path: '/authCodeLogin',
        component: 'AuthCodeLogin.vue',
        meta: {
            noToken: true,
        },
    },
    // 忘记密码 1.4.13
    forgetPassword: {
        path: '/forgetPassword',
        component: 'ForgetPassword.vue',
        meta: {
            noToken: true,
        },
    },
    // 开机向导
    guide: {
        path: '/guide',
        component: 'Guide.vue',
        meta: {
            noToken: true,
        },
    },
    root: {
        path: '',
        component: 'layout/MainLayout.vue',
        meta: {},
        children: {
            // 现场预览
            live: {
                component: 'topFeature/Live.vue',
                meta: {
                    minWidth: 1260,
                    minHeight: 850,
                    sort: 10,
                    lk: 'IDCS_LIVE_PREVIEW',
                    icon: 'live_menu',
                },
            },
            // 回放
            playback: {
                component: 'topFeature/Playback.vue',
                meta: {
                    sort: 20,
                    lk: 'IDCS_REPLAY',
                    icon: 'rec_menu',
                    minWidth: 1580,
                    minHeight: 850,
                },
            },
            // 功能面板
            functionPanel: {
                component: 'topFeature/FunctionPanel.vue',
                meta: {
                    sort: 50,
                    lk: 'IDCS_FUNCTION_PANEL',
                    icon: 'cfgHome_menu',
                },
            },
            // 搜索与备份
            searchAndBackup,
            //智能分析
            intelligentAnalysis,
            //业务应用
            businessApplication,
            // 配置
            config: {
                meta: {
                    noMenu: true,
                },
                children: {
                    channel,
                    record,
                    aiAndEvent,
                    disk,
                    net,
                    userAndSecurity,
                    system,
                    // 本地配置
                    localConfig: {
                        path: 'local',
                        component: 'LocalConfig.vue',
                        meta: {},
                    },
                },
            },
        },
    },
    //停车场
    parkLot: {
        path: '/business-application/park-lot-manage/park-lot',
        component: 'businessApplication/ParkLot.vue',
        meta: {
            sort: 40,
            lk: 'IDCS_PARKING_LOT',
            icon: 'park',
            minWidth: 1400,
            minHeight: 800,
            hasCap(systemCaps) {
                return !systemCaps.IntelAndFaceConfigHide
            },
            auth: 'parkingLotMgr',
        },
        beforeEnter(from, _to, next) {
            const userSession = useUserSessionStore()
            if (!userSession.hasAuth('businessMgr')) {
                openMessageBox('IDCS_NO_PERMISSION')
                if (from.fullPath.includes('parkLotManage')) {
                    next('/live')
                } else {
                    next(from)
                }
            } else {
                next()
            }
        },
    },
    // 目标检索 1.4.13
    searchTarget: {
        path: '/intelligentAnalysis/search-target',
        component: 'intelligentAnalysis/SearchTarget.vue',
        meta: {
            sort: 40,
            lk: 'IDCS_REID',
            icon: 'target_retrieval',
            minWidth: 1400,
            minHeight: 800,
            hasCap(systemCaps) {
                return systemCaps.supportREID
            },
        },
    },
} as FeatureTree
