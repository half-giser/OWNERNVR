/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 10:51:34
 * @Description: 业务应用-路由
 */

export default {
    component: 'layout/L2T2Layout.vue',
    meta: {
        sort: 60,
        lk: 'IDCS_BUSINESS_APPLICATION',
        icon: 'business_menu',
    },
    children: {
        parkLotManage: {
            // 停车场管理
            component: 'layout/L2T2L3T1Layout.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_PARKING_LOT_MANAGEMENT',
                auth: 'parkingLotMgr',
                hasCap(systemCaps) {
                    return !systemCaps.IntelAndFaceConfigHide
                },
            },
            children: {
                basicConfig: {
                    // 基础配置
                    component: 'businessApplication/PkMgrBasicConfig.vue',
                    meta: {
                        sort: 10,
                        lk: 'IDCS_PARKING_LOT_BASIC_CONFIG',
                        icon: 'park_baiscCfg',
                    },
                },
                spaceManage: {
                    // 车位管理
                    component: 'businessApplication/PkMgrSpaceManage.vue',
                    meta: {
                        sort: 20,
                        lk: 'IDCS_PARKING_SPACE_MANAGEMENT',
                        icon: 'park_spaceMgr',
                    },
                },
                enterExitManage: {
                    // 出入口
                    component: 'businessApplication/PkMgrEnterExitManage.vue',
                    meta: {
                        sort: 30,
                        lk: 'IDCS_ENTRANCE_EXIT',
                        icon: 'parkEnterExitMgr',
                    },
                },
                parkLot: {
                    // 停车场
                    meta: {
                        sort: 40,
                        lk: 'IDCS_PARKING_LOT',
                        icon: 'parkRealRecord',
                    },
                },
            },
        },
        accessControl: {
            // 门禁管理
            component: 'layout/L2T2L3T1Layout.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_ACCESS_CONTROL_MANAGEMENT',
                auth: 'AccessControlMgr',
            },
            children: {
                config: {
                    // 门禁配置
                    name: 'accessControlConfig',
                    path: 'config',
                    component: 'businessApplication/ActConfigs.vue',
                    meta: {
                        sort: 10,
                        lk: 'IDCS_ACCESS_CONTROL_CONFIG',
                        icon: 'accessCfg',
                    },
                },
            },
        },
        faceAttendance: {
            // 人脸考勤
            component: 'businessApplication/FaceAttendances.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_FACE_ATTENDANCE',
                hasCap(systemCaps) {
                    return systemCaps.supportFaceMatch
                },
            },
        },
        faceCheck: {
            // 人脸签到
            component: 'businessApplication/FaceCheck.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_FACE_CHECK',
                hasCap(systemCaps) {
                    return systemCaps.supportFaceMatch
                },
            },
        },
    },
    async beforeEnter(_to, from, next) {
        const { openMessageBox } = useMessageBox()
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const systemCaps = useCababilityStore()
        // 非管理员账户
        if (userSession.authGroupId) {
            const supportFaceMatch = systemCaps.supportFaceMatch
            const IntelAndFaceConfigHide = systemCaps.IntelAndFaceConfigHide
            const parkingLotMgr = userSession.hasAuth('parkingLotMgr') && !IntelAndFaceConfigHide
            const AccessControlMgr = userSession.hasAuth('AccessControlMgr')
            if (!parkingLotMgr && !AccessControlMgr && !supportFaceMatch) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_NO_AUTH'),
                })
                if (from.fullPath.includes('business-application')) {
                    next('/live')
                } else {
                    next(from)
                }
            } else {
                next()
            }
        }
        // 管理员账户
        else {
            next()
        }
    },
} as FeatureItem
