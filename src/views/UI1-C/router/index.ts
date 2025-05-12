/*
 * @Date: 2025-03-05 15:53:50
 * @Description: UI1-C 路由配置
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
                        meta: {},
                        children: {
                            motionEventConfig: {
                                meta: {
                                    inHome: 'IDCS_MOTION_DETECT_ALARM',
                                },
                            },
                            sensorEventConfig: {
                                meta: {
                                    inHome: 'IDCS_SENSOR_ALARM',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
} as FeatureTree)
