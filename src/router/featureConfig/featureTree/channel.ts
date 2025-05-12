/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 11:47:13
 * @Description: 功能面板-通道
 */
const channelRoutes: FeatureItem = {
    component: 'layout/L2T1Layout.vue',
    meta: {
        sort: 10,
        lk: 'IDCS_CHANNEL',
        plClass: 'md2',
        icon: 'chl',
        auth: 'remoteChlMgr',
        groups: {
            //通道管理
            channel: {
                sort: 10,
                lk: 'IDCS_CHANNEL_MANAGER',
                icon: 'chl_s',
            },
            //图像设置
            image: {
                sort: 20,
                lk: 'IDCS_IMAGE_SETTING',
                icon: 'displaySet_s',
            },
            //移动侦测
            motion: {
                sort: 30,
                lk: 'IDCS_MOTION_DETECTION',
                icon: 'motion_s',
            },
            //云台
            ptz: {
                sort: 50,
                lk: 'IDCS_PTZ',
                icon: 'ptz_s',
            },
            // IP Speaker
            ipspeaker: {
                sort: 60,
                lk: 'IDCS_IPSPEAKER',
                icon: 'ipSpeaker',
            },
        },
    },
    children: {
        // 添加通道
        channelAdd: {
            path: 'add',
            component: 'channel/ChannelAdd.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_ADD_CHANNEL',
                group: 'channel',
                navs: ['channelList'],
                hasCap(systemCaps) {
                    return !!systemCaps.ipChlMaxCount
                },
            },
        },
        // 查看或更改通道
        channelList: {
            path: 'list',
            components: {
                toolBar: 'channel/ChannelToolBar.vue',
                default: 'channel/Channel.vue',
            },
            meta: {
                sort: 20,
                lk: 'IDCS_CHANGE_OR_DELETE_CHANNEL',
                group: 'channel',
                default: true,
                inHome: 'self',
                homeSort: 10,
                homeDefault: true,
                hasCap(systemCaps) {
                    return !!systemCaps.ipChlMaxCount
                },
            },
        },
        // 添加分组
        channelGroupAdd: {
            path: 'group/add',
            component: 'channel/ChannelGroupAdd.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_ADD_GROUP',
                noMenu: true,
                group: 'channel',
                navs: ['channelGroupList'],
                hasCap(systemCaps) {
                    return !systemCaps.analogChlCount
                },
            },
        },
        // 查看或更改分组
        channelGroupList: {
            path: 'group/list',
            components: {
                toolBar: 'channel/ChannelGroupToolBar.vue',
                default: 'channel/ChannelGroup.vue',
            },
            meta: {
                sort: 40,
                lk: 'IDCS_CHANGE_OR_DELETE_CHANNEL_GROUP',
                group: 'channel',
                hasCap(systemCaps) {
                    return !systemCaps.analogChlCount
                },
            },
        },
        // 信号接入配置
        signal: {
            component: 'channel/ChannelSignal.vue',
            meta: {
                sort: 50,
                lk: 'IDCS_CHANNEL_SIGNAL_ACCESS_SET',
                group: 'channel',
                hasCap(systemCaps) {
                    return !!systemCaps.analogChlCount
                },
            },
        },
        // OSD配置
        osd: {
            path: 'settings/osd',
            component: 'channel/ChannelOsd.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_OSD_SETTING',
                group: 'image',
                default: true,
                minHeight: 850,
            },
        },
        // 图像参数配置
        displaySet: {
            path: 'settings/image',
            component: 'channel/ChannelImage.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_IMAGE_PARAMETER_SETTING',
                group: 'image',
                inHome: 'group',
                homeSort: 20,
                minHeight: 850,
            },
        },
        // 视频遮挡配置
        videoMask: {
            path: 'settings/mask',
            component: 'channel/ChannelMask.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_VIDEO_MASK_SETTING',
                group: 'image',
                minHeight: 850,
            },
        },
        // 以下页面没有在原项目中找到入口
        // audioSet: {
        //     //
        //     path: 'settings/audio',
        //     component: 'channel/ChannelAudio.vue',
        //     meta: {
        //         sort: 40,
        //         lk: 'IDCS_AUDIO_SET',
        //         group: 'image',
        //     },
        // },
        // LOGO设置
        logoSet: {
            path: 'settings/logoSet',
            component: 'channel/ChannelLogo.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_LOGO_SETTINGS',
                group: 'image',
                minHeight: 850,
                hasCap(systemCaps) {
                    const osType = getSystemInfo().platform
                    return systemCaps.supportLogoSetting && osType !== 'mac'
                },
            },
        },
        // 信号遮挡配置
        // signalShelter: {
        //     path: 'settings/signalshelter',
        //     component: 'channel/ChannelSignalShelter.vue',
        //     meta: {
        //         sort: 50,
        //         lk: 'IDCS_SIGNAL_SHELTER_SETTING',
        //         group: 'image',
        //     },
        // },
        // 水印设置
        watermark: {
            path: 'settings/waterMark',
            component: 'channel/ChannelWaterMark.vue',
            meta: {
                sort: 60,
                lk: 'IDCS_WATER_MARK_SETTING',
                group: 'image',
                minHeight: 850,
                hasCap(systemCaps) {
                    return systemCaps.supportWaterMark
                },
            },
        },
        // 鱼眼设置
        fishEye: {
            path: 'settings/fisheye',
            component: 'channel/ChannelFisheye.vue',
            meta: {
                sort: 70,
                lk: 'IDCS_FISHEYE_SET',
                group: 'image',
                minHeight: 850,
                hasCap(systemCaps) {
                    const osType = getSystemInfo().platform
                    return systemCaps.supportFishEye && osType !== 'mac'
                },
            },
        },
        // 智能补光 1.4.13
        fillLight: {
            path: 'settings/intelligentFillLight',
            component: 'channel/ChannelFillLight.vue',
            meta: {
                sort: 80,
                lk: 'IDCS_ILLUMINATION_SMART_LIGHT',
                group: 'image',
                minHeight: 850,
            },
        },
        // 拼接 1.4.13
        splicing: {
            path: 'settings/spliceCfg',
            component: 'channel/ChannelSplicing.vue',
            meta: {
                sort: 80,
                lk: 'IDCS_SPLICING',
                group: 'image',
                minHeight: 850,
            },
        },
        // 移动侦测配置
        motion: {
            path: 'settings/motion',
            component: 'channel/ChannelMotion.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_MOTION_SETTING',
                group: 'motion',
                default: true,
                inHome: 'group',
                homeSort: 30,
                minHeight: 850,
            },
        },
        // 预置点
        preset: {
            path: 'ptz/preset',
            component: 'channel/ChannelPreset.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_PRESET',
                group: 'ptz',
                default: true,
                inHome: 'group',
                homeSort: 40,
                minHeight: 850,
            },
        },
        // 巡航线
        cruise: {
            path: 'ptz/cruise',
            component: 'channel/ChannelCruise.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_CRUISE',
                group: 'ptz',
                minHeight: 850,
            },
        },
        // 巡航线组
        cruiseGroup: {
            path: 'ptz/cruise/group',
            component: 'channel/ChannelCruiseGroup.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_PTZ_GROUP',
                group: 'ptz',
                minHeight: 850,
                hasCap(systemCaps) {
                    return systemCaps.supportPtzGroupAndTrace
                },
            },
        },
        // 轨迹
        trace: {
            path: 'ptz/trace',
            component: 'channel/ChannelTrace.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_PTZ_TRACE',
                group: 'ptz',
                minHeight: 850,
                hasCap(systemCaps) {
                    return systemCaps.supportPtzGroupAndTrace
                },
            },
        },
        // 任务
        ptzTask: {
            path: 'ptz/task',
            component: 'channel/ChannelPtzTask.vue',
            meta: {
                sort: 50,
                lk: 'IDCS_TASK',
                group: 'ptz',
                minHeight: 850,
                hasCap(systemCaps) {
                    return systemCaps.supportPtzGroupAndTrace
                },
            },
        },
        // 智能追踪
        smartTrack: {
            path: 'ptz/smart-track',
            component: 'channel/ChannelSmartTrack.vue',
            meta: {
                sort: 60,
                lk: 'IDCS_SMART_TRACKING',
                group: 'ptz',
                minHeight: 850,
            },
        },
        // 协议
        ptzProtocol: {
            path: 'ptz/protocol',
            components: {
                toolBar: 'channel/ChannelPtzProtocolToolBar.vue',
                default: 'channel/ChannelPtzProtocol.vue',
            },
            meta: {
                sort: 70,
                lk: 'IDCS_PROTOCOL',
                group: 'ptz',
                minHeight: 850,
                // hasCap(systemCaps) {
                //     return !!systemCaps.analogChlCount
                // },
            },
        },
        // 看守位 1.4.13
        ptzGuard: {
            path: 'ptz/guard',
            component: 'channel/ChannelPtzGuard.vue',
            meta: {
                sort: 80,
                lk: 'IDCS_HOME_POSITION',
                group: 'ptz',
                minHeight: 850,
            },
        },
        // 查看或更改IPSpeaker 1.4.13
        ipSpeakerAdd: {
            path: 'IPSpeaker/list',
            components: {
                toolBar: 'channel/ChannelIPSpeakerToolBar.vue',
                default: 'channel/ChannelIPSpeaker.vue',
            },
            meta: {
                sort: 10,
                lk: 'IDCS_ADD_IP_SPEARKER',
                group: 'ipspeaker',
            },
            beforeEnter(_from, _to, next) {
                history.state.fromAdd = 'true'
                next()
            },
        },
        // 查看或更改IPSpeaker 1.4.13
        ipSpeaker: {
            path: 'IPSpeaker/list',
            components: {
                toolBar: 'channel/ChannelIPSpeakerToolBar.vue',
                default: 'channel/ChannelIPSpeaker.vue',
            },
            meta: {
                sort: 20,
                lk: 'IDCS_CHANGE_OR_DELETE_IP_SPEAKER',
                group: 'ipspeaker',
                default: true,
            },
        },
    },
}

export default channelRoutes
