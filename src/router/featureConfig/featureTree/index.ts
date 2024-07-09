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

import topFeature from './topFeature'
import channel from './channel'
import record from './record'
import aiAndEvent from './aiAndEvent'
import disk from './disk'
import net from './net'
import userAndSecurity from './userAndSecurity'
import system from './system'

export default {
    login: {
        //登录
        path: '/login',
        component: 'Login.vue',
        meta: {},
    },
    root: {
        path: '',
        component: 'layout/MainLayout.vue',
        meta: {},
        children: {
            ...topFeature,
            config: {
                meta: { noMenu: true },
                children: {
                    channel,
                    record,
                    aiAndEvent,
                    disk,
                    net,
                    userAndSecurity,
                    system,
                },
            },
        },
    },
    parkLot: {
        //停车场
        path: '/business-application/park-lot-manage/park-lot',
        component: 'businessApplication/PkMgrParkLog.vue',
        meta: { sort: 40, lk: 'IDCS_PARKING_LOT', icon: 'park' },
    },
} as FeatureTree
