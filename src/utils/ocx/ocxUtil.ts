/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-03 11:57:44
 * @Description: OCX公共模块
 */

// Windows本地插件
let ClientPort = 13853
let ClientPluDownLoadPath = 'OCX/WebClient_VPPlugin_v5.exe'

// Windows_P2P插件
let P2PClientPort = 12853
let P2PClientPluDownLoadPath = 'OCX/WebClient_VPPlugin_v5_P2P.exe'

// MAC_P2P插件
let MacP2PClientPort = 14853
let P2PMacClientPluDownLoadPath = 'OCX/WebClient_VPPlugin_v5_P2P.pkg'

if (import.meta.env.VITE_UI_TYPE === 'UI1-E') {
    ClientPort = 13863
    P2PClientPort = 12863
    MacP2PClientPort = 14863
    ClientPluDownLoadPath = 'OCX/Speco_Technologies_v5.exe'
    P2PClientPluDownLoadPath = 'OCX/Speco_Technologies_v5_p2p.exe'
    P2PMacClientPluDownLoadPath = 'OCX/Speco_Technologies_v5_P2P.pkg'
}

export { ClientPort, ClientPluDownLoadPath, P2PClientPort, P2PClientPluDownLoadPath, MacP2PClientPort, P2PMacClientPluDownLoadPath }

export const MAC_OCX_TASK_ID = 0 // 插件taskId
export const OCX_REC_EVENT_TYPE = ['MOTION', 'SCHEDULE', 'SENSOR', 'MANUAL', 'INTELLIGENT']
export const MAC_OCX_ERROR_CODE_MAP = {
    '0': 536870961, // 回放结束
}

// AI事件类型映射（AI事件中插件绘制需要使用此类型）
export const OCX_AI_EVENT_TYPE_NULL = 0
export const OCX_AI_EVENT_TYPE_MOTION = 1 // 移动侦测区域
export const OCX_AI_EVENT_TYPE_OSD_TIME = 2 // 画osd位置
export const OCX_AI_EVENT_TYPE_VIDEO_BLOCK = 3 // 画视频遮挡区域
export const OCX_AI_EVENT_TYPE_WATCH_DETECTION = 4 // 画物品看护
export const OCX_AI_EVENT_TYPE_PEA_DETECTION = 5 // 画区域入侵
export const OCX_AI_EVENT_TYPE_TRIPWIRE_LINE = 6 // 越界侦测
export const OCX_AI_EVENT_TYPE_LOGO = 7 // 画Logo位置
export const OCX_AI_EVENT_TYPE_WATER_MASK = 8 // 画水印
export const OCX_AI_EVENT_TYPE_VFD_BLOCK = 9 // 画人脸识别区域
export const OCX_AI_EVENT_TYPE_CDD_BLOCK = 10 // 画人群密度区域
export const OCX_AI_EVENT_TYPE_CPC_BLOCK = 11 // 画人数统计区域
export const OCX_AI_EVENT_TYPE_POSRGB_SET = 12 //pos颜色配置界面
export const OCX_AI_EVENT_TYPE_VSD = 13 //视频结构化
export const OCX_AI_EVENT_TYPE_PLATE_DETECTION = 14 // 车牌侦测

// 设备P2P访问方式
export const P2P_ACCESS_TYPE_SMALL_PLUGIN = 'p2pSmallPlugin' // 区分由P2P登录页跳转小插件查询版本号后再进行跳转登录
export const P2P_ACCESS_TYPE_LARGE_PLUGIN = 'p2pLargePlugin' // 区分由P2P登录页直接进行跳转大插件登录
export const P2P_ACCESS_TYPE_USERNAME_LOGIN = 'UserName' // 设备P2P访问方式为：用户名+密码+SN
export const P2P_ACCESS_TYPE_AUTHCODE_LOGIN = 'AuthCode' // 设备P2P访问方式为：授权码+SN

export const OCX_Plugin_Notice_Map: Record<string, { warning: boolean; downloadUrl: boolean }> = {
    IDCS_PLUGIN_VERSION_UPDATE: {
        warning: false,
        downloadUrl: true,
    },
    IDCS_NO_PLUGIN_FOR_WINDOWS: {
        warning: false,
        downloadUrl: true,
    },
    IDCS_NO_PLUGIN_FOR_MAC: {
        warning: false,
        downloadUrl: true,
    },
    IDCS_NPAPI_NOT_SUPPORT: {
        warning: true,
        downloadUrl: false,
    },
    IDCS_IE_VERSION_WARNING: {
        warning: true,
        downloadUrl: true,
    },
    IDCS_CHROME_VERSION_WARNING: {
        warning: true,
        downloadUrl: false,
    },
    IDCS_FIREFOX_VERSION_WARNING: {
        warning: true,
        downloadUrl: false,
    },
    IDCS_OPERA_VERSION_WARNING: {
        warning: true,
        downloadUrl: false,
    },
    IDCS_SAFARI_VERSION_WARNING: {
        warning: true,
        downloadUrl: false,
    },
    IDCS_EDGE_VERSION_WARNING: {
        warning: true,
        downloadUrl: false,
    },
    IDCS_OTHER_VERSION_WARNING: {
        warning: true,
        downloadUrl: false,
    },
    IDCS_SAFARI_VERSION_FOR_P2P: {
        warning: true,
        downloadUrl: false,
    },
}

export const getPluginPath = () => {
    const userSession = useUserSessionStore()
    const systemInfo = getSystemInfo()

    if (userSession.appType === 'STANDARD') {
        return ClientPluDownLoadPath
    } else {
        if (systemInfo.platform === 'mac') {
            return P2PMacClientPluDownLoadPath
        } else {
            return P2PClientPluDownLoadPath
        }
    }
}

export const getPluginPort = () => {
    const userSession = useUserSessionStore()
    const systemInfo = getSystemInfo()

    if (userSession.appType === 'STANDARD') {
        return ClientPort
    } else {
        if (systemInfo.platform === 'mac') {
            return MacP2PClientPort
        } else {
            return P2PClientPort
        }
    }
}
