/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 10:51:34
 * @Description: 智能与分析 路由配置
 */
export default {
    component: 'layout/L2T2Layout.vue',
    meta: {
        sort: 40,
        lk: 'IDCS_INTEL_DETECTION',
        auth: (systemCaps) => {
            return !systemCaps.IntelAndFaceConfigHide
        },
        icon: 'search_menu',
    },
    children: {
        egineCfg: {
            //引擎配置
            component: 'intelligentAnalysis/IntelEngineCfg.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_ENGINE_CONFIG',
                auth(systemCaps) {
                    return systemCaps.supportBootWorkMode
                },
            },
        },
        search: {
            //搜索
            component: 'layout/L2T2L3T1Layout.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_SEARCH',
            },
            children: {
                face: {
                    //人脸
                    name: 'searchFace',
                    component: 'intelligentAnalysis/IntelFaceSearch.vue',
                    meta: {
                        sort: 10,
                        lk: 'IDCS_FACE',
                        icon: 'event_search_face',
                        auth(systemCaps) {
                            return systemCaps.supportFaceMatch
                        },
                    },
                },
                body: {
                    //人体
                    name: 'searchBody',
                    component: 'intelligentAnalysis/IntelBodySearch.vue',
                    meta: {
                        sort: 20,
                        lk: 'IDCS_FIGURE',
                        icon: 'event_search_body',
                    },
                },
                vehicle: {
                    //车辆
                    name: 'searchVehicle',
                    component: 'intelligentAnalysis/IntelVehicleSearch.vue',
                    meta: {
                        sort: 30,
                        lk: 'IDCS_VEHICLE',
                        icon: 'event_search_car',
                    },
                },
                combine: {
                    //组合
                    name: 'searchCombine',
                    component: 'intelligentAnalysis/IntelCombineSearch.vue',
                    meta: {
                        sort: 40,
                        lk: 'IDCS_COMBINE_SEARCH',
                        icon: 'event_search_smart',
                    },
                },
            },
        },
        statistics: {
            //统计
            component: 'layout/L2T2L3T1Layout.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_STATISTICS',
            },
            children: {
                person: {
                    //人员
                    name: 'statisticsPerson',
                    component: 'intelligentAnalysis/IntelPersonStats.vue',
                    meta: {
                        sort: 10,
                        lk: 'IDCS_PERSON_STATISTICS',
                        icon: 'event_search_body',
                    },
                },
                vehicle: {
                    //车辆
                    name: 'statisticsVehicle',
                    component: 'intelligentAnalysis/IntelVehicleStats.vue',
                    meta: {
                        sort: 30,
                        lk: 'IDCS_VEHICLE',
                        icon: 'event_search_car',
                    },
                },
                combine: {
                    //组合
                    name: 'statisticsCombine',
                    component: 'intelligentAnalysis/IntelCombineStats.vue',
                    meta: {
                        sort: 40,
                        lk: 'IDCS_COMBINE_SEARCH',
                        icon: 'event_search_smart',
                    },
                },
            },
        },
        sampleDataBase: {
            //样本库
            component: 'layout/L2T2L3T1Layout.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_SAMPLE_DATABASE',
                auth(systemCaps) {
                    return systemCaps.supportFaceMatch || systemCaps.supportPlateMatch
                },
            },
            children: {
                face: {
                    //人脸
                    name: 'sampleDataBaseFace',
                    component: 'intelligentAnalysis/IntelFaceDB.vue',
                    meta: {
                        sort: 10,
                        lk: 'IDCS_FACE',
                        icon: 'event_search_body',
                        auth(systemCaps) {
                            return systemCaps.supportFaceMatch
                        },
                    },
                },
                licencePlate: {
                    //车牌
                    name: 'sampleDataBaseLicencePlate',
                    component: 'intelligentAnalysis/IntelLicencePlateDB.vue',
                    meta: {
                        sort: 30,
                        lk: 'IDCS_LICENSE_PLATE',
                        icon: 'event_search_car',
                        auth(systemCaps) {
                            return systemCaps.supportPlateMatch
                        },
                    },
                },
            },
        },
    },
} as FeatureItem
