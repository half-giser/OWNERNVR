/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 10:51:34
 * @Description: 业务应用-路由
 */

const businessApplicationRoutes: FeatureItem = {
    component: 'layout/L2T2Layout.vue',
    meta: {
        sort: 40,
        lk: 'IDCS_BUSINESS_APPLICATION',
        icon: 'business_menu',
    },
    children: {
        // 停车场管理
        parkLotManage: {
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
                // 基础配置
                basicConfig: {
                    component: 'businessApplication/ParkBasicConfig.vue',
                    meta: {
                        sort: 10,
                        lk: 'IDCS_PARKING_LOT_BASIC_CONFIG',
                        icon: 'park_baiscCfg',
                    },
                },
                // 车位管理
                spaceManage: {
                    component: 'businessApplication/ParkSpaceManage.vue',
                    meta: {
                        sort: 20,
                        lk: 'IDCS_PARKING_SPACE_MANAGEMENT',
                        icon: 'park_spaceMgr',
                    },
                },
                // 出入口
                enterExitManage: {
                    component: 'businessApplication/ParkEnterExitManage.vue',
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
        // 门禁管理
        accessControl: {
            // 门禁管理
            component: 'layout/L2T2L3T1Layout.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_ACCESS_CONTROL_MANAGEMENT',
                auth: 'AccessControlMgr',
            },
            children: {
                // 门禁配置
                config: {
                    name: 'accessControlConfig',
                    path: 'config',
                    component: 'businessApplication/AccessLock.vue',
                    meta: {
                        sort: 10,
                        lk: 'IDCS_ACCESS_CONTROL_CONFIG',
                        icon: 'accessCfg',
                    },
                },
            },
        },
        // 客流量 1.4.13
        passengerFlow: {
            component: 'layout/L2T2L3T1Layout.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_PASSENGER_FLOW',
            },
            children: {
                passengerFlowCfg: {
                    component: 'businessApplication/PassengerFlowCfg.vue',
                    meta: {
                        sort: 10,
                        lk: 'IDCS_CONFIG',
                        icon: 'park_baiscCfg',
                    },
                },
                passengerFlowStats: {
                    component: 'businessApplication/PassengerFlowStats.vue',
                    meta: {
                        sort: 10,
                        lk: 'IDCS_PEOPLE_COUNT_DETECTION',
                        icon: 'passengerFlow',
                    },
                    async beforeEnter(_to, from, next) {
                        const { Translate } = useLangStore()
                        const userSession = useUserSessionStore()
                        const auth = userSession.hasAuth('businessMgr')
                        if (!auth) {
                            openMessageBox(Translate('IDCS_NO_AUTH'))
                            if (from.fullPath.includes('business-application')) {
                                next('/live')
                            } else {
                                next(from)
                            }
                        } else {
                            next()
                        }
                    },
                },
            },
        },
        // 人脸考勤
        faceAttendance: {
            component: 'businessApplication/FaceAttendances.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_FACE_ATTENDANCE',
                minWidth: 1400,
                hasCap(systemCaps) {
                    return systemCaps.supportFaceMatch
                },
            },
        },
        // 人脸签到
        faceCheck: {
            component: 'businessApplication/FaceCheck.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_FACE_CHECK',
                minWidth: 1400,
                hasCap(systemCaps) {
                    return systemCaps.supportFaceMatch
                },
            },
        },
    },
    async beforeEnter(_to, from, next) {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const systemCaps = useCababilityStore()
        // 非管理员账户
        if (userSession.authGroupId) {
            const supportFaceMatch = systemCaps.supportFaceMatch
            const businessCfg = userSession.hasAuth('businessCfg')
            const businessMgr = userSession.hasAuth('businessMgr')
            if (!businessCfg && !businessMgr && !supportFaceMatch) {
                openMessageBox(Translate('IDCS_NO_AUTH'))
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
}

export default businessApplicationRoutes
