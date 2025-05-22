/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 10:51:34
 * @Description: 智能与分析 路由配置
 */
const intelligentAnalysisRoutes: FeatureItem = {
    component: 'layout/L2T2Layout.vue',
    meta: {
        sort: 40,
        lk: 'IDCS_INTEL_DETECTION',
        hasCap: (systemCaps) => {
            return !systemCaps.IntelAndFaceConfigHide
        },
        icon: 'search_menu',
    },
    children: {
        //引擎配置
        egineCfg: {
            component: 'intelligentAnalysis/IntelEngineCfg.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_ENGINE_CONFIG',
                hasCap(systemCaps) {
                    return systemCaps.supportBootWorkMode
                },
            },
        },
        //搜索
        search: {
            component: 'layout/L2T2L3T1Layout.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_SEARCH',
            },
            children: {
                // 人脸
                face: {
                    name: 'searchFace',
                    component: 'intelligentAnalysis/IntelFaceSearch.vue',
                    meta: {
                        sort: 40,
                        lk: 'IDCS_FACE',
                        icon: 'event_search_face',
                        minWidth: 1580,
                        minHeight: 850,
                        hasCap(systemCaps) {
                            return systemCaps.supportFaceMatch
                        },
                    },
                },
                // 人体
                body: {
                    name: 'searchBody',
                    component: 'intelligentAnalysis/IntelBodySearch.vue',
                    meta: {
                        sort: 50,
                        lk: 'IDCS_FIGURE',
                        icon: 'event_search_body',
                        minWidth: 1580,
                        minHeight: 850,
                    },
                },
                // 组合
                combine: {
                    name: 'searchCombine',
                    component: 'intelligentAnalysis/IntelCombineSearch.vue',
                    meta: {
                        sort: 60,
                        lk: 'IDCS_COMBINE_SEARCH',
                        icon: 'event_search_smart',
                        minWidth: 1580,
                        minHeight: 850,
                    },
                },

                // 人（人脸、人体、人属性）
                person: {
                    name: 'searchPerson',
                    component: 'intelligentAnalysis/IntelPersonSearch.vue',
                    meta: {
                        sort: 10,
                        lk: 'IDCS_DETECTION_PERSON',
                        icon: 'event_search_body',
                        minWidth: 1580,
                        minHeight: 850,
                    },
                },
                // 车（车、摩托车/单车、车牌号）
                vehicle: {
                    name: 'searchVehicle',
                    component: 'intelligentAnalysis/IntelVehicleSearch.vue',
                    meta: {
                        sort: 20,
                        lk: 'IDCS_VEHICLE',
                        icon: 'event_search_car',
                        minWidth: 1580,
                        minHeight: 850,
                    },
                },
            },
        },
        // 统计
        statistics: {
            component: 'layout/L2T2L3T1Layout.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_STATISTICS',
            },
            children: {
                // 人员
                person: {
                    name: 'statisticsPerson',
                    component: 'intelligentAnalysis/IntelPersonStats.vue',
                    meta: {
                        sort: 10,
                        lk: 'IDCS_PERSON_STATISTICS',
                        icon: 'event_search_body',
                        minWidth: 1580,
                        minHeight: 850,
                    },
                },
                // 车辆
                vehicle: {
                    name: 'statisticsVehicle',
                    component: 'intelligentAnalysis/IntelVehicleStats.vue',
                    meta: {
                        sort: 30,
                        lk: 'IDCS_VEHICLE',
                        icon: 'event_search_car',
                        minWidth: 1580,
                        minHeight: 850,
                    },
                },
                // 组合
                // combine: {
                //     name: 'statisticsCombine',
                //     component: 'intelligentAnalysis/IntelCombineStats.vue',
                //     meta: {
                //         sort: 40,
                //         lk: 'IDCS_COMBINE_SEARCH',
                //         icon: 'event_search_smart',
                //         minWidth: 1580,
                //         minHeight: 850,
                //     },
                // },
            },
        },
        // 样本库
        sampleDataBase: {
            component: 'layout/L2T2L3T1Layout.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_SAMPLE_DATABASE',
                hasCap(systemCaps) {
                    return systemCaps.supportFaceMatch || systemCaps.supportPlateMatch
                },
            },
            children: {
                // 人脸
                face: {
                    name: 'sampleDataBaseFace',
                    component: 'intelligentAnalysis/IntelFaceDB.vue',
                    meta: {
                        sort: 10,
                        lk: 'IDCS_FACE',
                        icon: 'event_search_body',
                        minWidth: 1360,
                        hasCap(systemCaps) {
                            return systemCaps.supportFaceMatch
                        },
                    },
                },
                // 车牌
                licencePlate: {
                    name: 'sampleDataBaseLicencePlate',
                    component: 'intelligentAnalysis/IntelLicencePlateDB.vue',
                    meta: {
                        sort: 30,
                        lk: 'IDCS_LICENSE_PLATE',
                        icon: 'event_search_car',
                        minWidth: 1360,
                        hasCap(systemCaps) {
                            return systemCaps.supportPlateMatch
                        },
                    },
                },
            },
        },
    },
}

export default intelligentAnalysisRoutes
