/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 11:47:13
 * @Description: 功能面板-通道
 */
export default {
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
                lk: 'IDCS_SMART_SETTINGS',
                icon: 'motion_s',
            },
            // 智能侦测
            // intelligence: {
            //     sort: 40,
            //     lk: 'IDCS_SMART_SETTINGS',
            //     icon: 'intelligent_s',
            // },
            //云台
            ptz: {
                sort: 50,
                lk: 'IDCS_PTZ',
                icon: 'ptz_s',
            },
        },
    },
    children: {
        channelAdd: {
            path: 'add',
            //添加通道
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
        channelList: {
            //查看或更改通道
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
        channelGroupAdd: {
            //添加分组
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
        channelGroupList: {
            //查看或更改分组
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
        signal: {
            //信号接入配置
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
        osd: {
            //OSD配置
            path: 'settings/osd',
            component: 'channel/ChannelOsd.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_OSD_SETTING',
                group: 'image',
                default: true,
            },
        },
        displaySet: {
            //图像参数配置
            path: 'settings/image',
            component: 'channel/ChannelImage.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_IMAGE_PARAMETER_SETTING',
                group: 'image',
                inHome: 'group',
                homeSort: 20,
            },
        },
        videoMask: {
            //视频遮挡配置
            path: 'settings/mask',
            component: 'channel/ChannelMask.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_VIDEO_MASK_SETTING',
                group: 'image',
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
        logoSet: {
            // logo设置
            path: 'settings/logoSet',
            component: 'channel/ChannelLogo.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_LOGO_SETTINGS',
                group: 'image',
                hasCap(systemCaps) {
                    const osType = getSystemInfo().platform
                    return systemCaps.supportLogoSetting && osType !== 'mac'
                },
            },
        },
        // signalShelter: {
        //     // 信号遮挡配置
        //     path: 'settings/signalshelter',
        //     component: 'channel/ChannelSignalShelter.vue',
        //     meta: {
        //         sort: 50,
        //         lk: 'IDCS_SIGNAL_SHELTER_SETTING',
        //         group: 'image',
        //     },
        // },
        watermark: {
            // 水印设置
            path: 'settings/waterMark',
            component: 'channel/ChannelWaterMark.vue',
            meta: {
                sort: 60,
                lk: 'IDCS_WATER_MARK_SETTING',
                group: 'image',
                hasCap(systemCaps) {
                    return systemCaps.supportWaterMark
                },
            },
        },
        fishEye: {
            //鱼眼设置
            path: 'settings/fisheye',
            component: 'channel/ChannelFisheye.vue',
            meta: {
                sort: 70,
                lk: 'IDCS_FISHEYE_SET',
                group: 'image',
                hasCap(systemCaps) {
                    const osType = getSystemInfo().platform
                    return systemCaps.supportFishEye && osType !== 'mac'
                },
            },
        },
        motion: {
            //移动侦测配置
            path: 'settings/motion',
            component: 'channel/ChannelMotion.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_MOTION_SETTING',
                group: 'motion',
                default: true,
                inHome: 'group',
                homeSort: 30,
            },
        },
        preset: {
            //预置点
            path: 'ptz/preset',
            component: 'channel/ChannelPreset.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_PRESET',
                group: 'ptz',
                default: true,
                inHome: 'group',
                homeSort: 40,
            },
        },
        cruise: {
            //巡航线
            path: 'ptz/cruise',
            component: 'channel/ChannelCruise.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_CRUISE',
                group: 'ptz',
            },
        },
        cruiseGroup: {
            //巡航线组
            path: 'ptz/cruise/group',
            component: 'channel/ChannelCruiseGroup.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_PTZ_GROUP',
                group: 'ptz',
                hasCap(systemCaps) {
                    return systemCaps.supportPtzGroupAndTrace
                },
            },
        },
        trace: {
            //轨迹
            path: 'ptz/trace',
            component: 'channel/ChannelTrace.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_PTZ_TRACE',
                group: 'ptz',
                hasCap(systemCaps) {
                    return systemCaps.supportPtzGroupAndTrace
                },
            },
        },
        ptzTask: {
            //任务
            path: 'ptz/task',
            component: 'channel/ChannelPtzTask.vue',
            meta: {
                sort: 50,
                lk: 'IDCS_TASK',
                group: 'ptz',
                hasCap(systemCaps) {
                    return systemCaps.supportPtzGroupAndTrace
                },
            },
        },
        smartTrack: {
            //智能追踪
            path: 'ptz/smart-track',
            component: 'channel/ChannelSmartTrack.vue',
            meta: {
                sort: 60,
                lk: 'IDCS_SMART_TRACKING',
                group: 'ptz',
            },
        },
        ptzProtocol: {
            //协议
            path: 'ptz/protocol',
            components: {
                toolBar: 'channel/ChannelPtzProtocolToolBar.vue',
                default: 'channel/ChannelPtzProtocol.vue',
            },
            meta: {
                sort: 70,
                lk: 'IDCS_PROTOCOL',
                group: 'ptz',
                hasCap(systemCaps) {
                    return !!systemCaps.analogChlCount
                },
            },
        },
        // 以下页面只有在UI3-A才有
        // vfd: {
        //     // 人脸侦测
        //     path: 'intelligence/vfd',
        //     component: 'channel/ChannelVfd.vue',
        //     meta: {
        //         sort: 10,
        //         lk: 'IDCS_FACE_DETECTION',
        //         group: 'intelligence',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
        // cdd: {
        //     // 人群密度检测
        //     path: 'intelligence/cdd',
        //     component: 'channel/ChannelCDD.vue',
        //     meta: {
        //         sort: 20,
        //         lk: 'IDCS_CROWD_DENSITY_DETECTION',
        //         group: 'intelligence',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
        // ipd: {
        //     // 人员入侵侦测
        //     path: 'intelligence/ipd',
        //     component: 'channel/ChannelIpd.vue',
        //     meta: {
        //         sort: 30,
        //         lk: 'IDCS_PEOPLE_INSTRUSION_DETECTION',
        //         group: 'intelligence',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
        // cpc: {
        //     // 人数统计
        //     path: 'intelligence/cpc',
        //     component: 'channel/ChannelCpc.vue',
        //     meta: {
        //         sort: 40,
        //         lk: 'IDCS_PEOPLE_COUNT_DETECTION',
        //         group: 'intelligence',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
        // osc: {
        //     // 物品遗留与看护
        //     path: 'intelligence/osc',
        //     component: 'channel/ChannelOSC.vue',
        //     meta: {
        //         sort: 50,
        //         lk: 'IDCS_WATCH_DETECTION',
        //         group: 'intelligence',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
        // avd: {
        //     // 异常
        //     path: 'intelligence/avd',
        //     component: 'channel/ChannelAVD.vue',
        //     meta: {
        //         sort: 60,
        //         lk: 'IDCS_ABNORMAL_DETECTION',
        //         group: 'intelligence',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
        // tripwire: {
        //     // 越界
        //     path: 'intelligence/tripwire',
        //     component: 'channel/ChannelTripwire.vue',
        //     meta: {
        //         sort: 70,
        //         lk: 'IDCS_BEYOND_DETECTION',
        //         group: 'intelligence',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
        // pea: {
        //     // 区域入侵
        //     path: 'intelligence/pea',
        //     component: 'channel/ChannelPEA.vue',
        //     meta: {
        //         sort: 80,
        //         lk: 'IDCS_INVADE_DETECTION',
        //         group: 'intelligence',
        //         auth(systemCaps, ui) {
        //             return ui === 'UI3-A'
        //         },
        //     },
        // },
    },
} as FeatureItem
