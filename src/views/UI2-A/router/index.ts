/*
 * @Date: 2025-03-05 16:04:23
 * @Description: UI2-A 路由配置
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import routes from '@/router/featureConfig/featureTree'
import { merge } from 'lodash-es'

export default merge(routes, {
    root: {
        meta: {},
        children: {
            config: {
                meta: {},
                children: {
                    aiAndEvent: {
                        meta: {
                            groups: {
                                // 样本库
                                database: {
                                    sort: 30,
                                    lk: 'IDCS_FACE_LIBRARY_SELECT',
                                    icon: 'database_s',
                                },
                            },
                        },
                        children: {
                            faceFeatureLibrary: {
                                // 人脸库
                                path: 'faceFeature',
                                component: 'intelligentAnalysis/IntelFaceDB.vue',
                                meta: {
                                    sort: 10,
                                    lk: 'IDCS_FEATURE_LIBRARY',
                                    group: 'database',
                                    default: true,
                                    hasCap(systemCaps) {
                                        return systemCaps.supportFaceMatch && !systemCaps.hotStandBy
                                    },
                                },
                                alias: '/intelligent-analysis/sample-data-base/sample-data-base-face',
                            },
                            vehicleDatabase: {
                                // 车牌库
                                path: 'vehicleDatabase',
                                component: 'intelligentAnalysis/IntelLicencePlateDB.vue',
                                meta: {
                                    sort: 10,
                                    lk: 'IDCS_VEHICLE_DATABASE',
                                    group: 'database',
                                    hasCap(systemCaps) {
                                        return systemCaps.supportPlateMatch && !systemCaps.hotStandBy
                                    },
                                },
                                alias: '/intelligent-analysis/sample-data-base/sample-data-base-licence-plate',
                            },
                        },
                    },
                    channel: {
                        meta: {},
                        children: {
                            channelGroupAdd: {
                                meta: {
                                    inHome: 'hidden',
                                },
                            },
                            cruiseGroup: {
                                meta: {
                                    inHome: 'hidden',
                                },
                            },
                            trace: {
                                meta: {
                                    inHome: 'hidden',
                                },
                            },
                            ptzTask: {
                                meta: {
                                    inHome: 'hidden',
                                },
                            },
                            ptzProtocol: {
                                meta: {
                                    inHome: 'hidden',
                                },
                            },
                            permissionGroupAdd: {
                                meta: {
                                    inHome: 'hidden',
                                },
                            },
                        },
                    },
                },
            },
            intelligentAnalysis: {
                meta: {},
                children: {
                    sampleDataBase: {
                        meta: {
                            remove: true,
                        },
                    },
                },
            },
        },
    },
} as FeatureTree)
