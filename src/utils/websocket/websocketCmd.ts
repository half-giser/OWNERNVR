/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 10:25:04
 * @Description: websocket命令生成工具
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-15 14:31:27
 */
import { ENV_MODE, APP_SERVER_IP } from '../constants'
import { useUserSessionStore } from '@/stores/userSession'
import { getNonce } from '../encrypt'

/**
 * 获取websocket握手url
 */
export const getWebsocketOpenUrl = () => {
    console.log('getWebsocketOpenUrl', APP_SERVER_IP)
    const host = window.location.host
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const userSession = useUserSessionStore()
    console.log(ENV_MODE === 'production')
    if (ENV_MODE === 'production') {
        // 正式环境
        return `${wsProtocol}://${host}/requestWebsocketConnection?sessionID=${userSession.sessionId}`
    } else {
        // 调试模式
        return `ws://${APP_SERVER_IP}/requestWebsocketConnection?sessionID=${userSession.sessionId}`
    }
}

/**
 * 生成16进制字符随机guid, 格式: {00000000-0000-0000-0000-000000000000}
 */
export const getRandomGUID = () => {
    const str = '0123456789abcdef'
    const temp = '00000000-0000-0000-0000-000000000000'
    let ret = ''
    for (let i = 0; i < temp.length; i++) {
        if (temp[i] === '-') {
            ret += '-'
            continue
        }
        ret += str[Math.floor(Math.random() * str.length)]
    }
    return `{${ret}}`
}

// 回放事件类型全集
export const REC_EVENT_TYPES = [
    'manual',
    'schedule',
    'motion',
    'sensor',
    'gsensor',
    'shelter',
    'overspeed',
    'overbound',
    'osc',
    'avd',
    'tripwire',
    'perimeter',
    'vfd',
    'pos',
    'smart_motion',
    'face_verity',
    'cpc',
    'cdd',
    'ipd',
    'smart_aoi_entry',
    'smart_aoi_leave',
    'smart_pass_line',
    'smart_plate_verity',
    'smart_fire_point',
    'smart_temperature',
    'SMDHuman',
    'SMDVehicle',
]

/**
 * 生成basic数据
 */
export const getBasic = () => {
    // TODO 原项目中 id = $.webSession('requestBasicId') * 1
    const id = 0
    const newId = id && id < Number.MAX_SAFE_INTEGER ? id + 1 : 1
    return {
        ver: '1.0',
        time: new Date().getTime(),
        id: newId,
        nonce: getNonce(),
    }
}

/**
 * 启动现场预览
 * @param {CmdPreviewOption} option
 * @property {String} chlID 通道id
 * @property {Number} streamType 码流类型 1主码流 2辅码流 3子码流
 * @property {Boolean} audio 是否携带音频
 */
export interface CmdPreviewOption {
    chlID: string
    streamType: number
    audio: boolean
}

export const CMD_PREVIEW = (option: CmdPreviewOption) => ({
    url: '/device/preview/open',
    basic: getBasic(),
    data: {
        task_id: getRandomGUID(),
        channel_id: option.chlID,
        stream_index: option.streamType || 2,
        audio: option.audio,
    },
})

/**
 * 关闭现场预览
 * @param {String} task_id 对应预览下发的guid
 */
export const CMD_STOP_PREVIEW = (task_id: string) => ({
    url: '/device/preview/close',
    basic: getBasic(),
    data: {
        task_id,
    },
})

/**
 * 现场预览打开音频
 * @param {String} task_id 对应预览下发的guid
 */
export const CMD_PREVIEW_AUDIO_OPEN = (task_id: string) => ({
    url: '/device/preview/audio/open',
    basic: getBasic(),
    data: {
        task_id,
    },
})

/**
 * 现场预览关闭音频
 * @param {String} task_id 对应预览下发的guid
 */
export const CMD_PREVIEW_AUDIO_CLOSE = (task_id: string) => ({
    url: '/device/preview/audio/close',
    basic: getBasic(),
    data: {
        task_id,
    },
})

/**
 * 启动回放
 * @param {Object} option
 *      @property {String} chlID 通道id
 *      @property {Number} startTime 回放开始时间戳（秒）
 *      @property {Number} endTime 回放结束时间戳（秒）
 *      @property {Number} streamType 码流类型 0主码流 1子码流
 *      @property {Array} typeMask 录像事件类型
 *      @property {Boolean} backupVideo 是否为备份视频，默认否
 *      @property {Boolean} backupAudio 是否为备份音频，默认否
 */
export interface CmdPlaybackOpenOption {
    chlID: string
    startTime: number
    endTime: number
    streamType: number
    typeMask: string[]
    backupVideo: boolean
    backupAudio: boolean
}

export const CMD_PLAYBACK_OPEN = (option: CmdPlaybackOpenOption) => ({
    url: '/device/playback/open',
    basic: getBasic(),
    data: {
        task_id: getRandomGUID(),
        channel_id: option.chlID,
        start_time: option.startTime,
        end_time: option.endTime,
        stream_index: option.streamType || 0, // 与插件保持一致：默认备份主码流
        type_mask: option.typeMask || REC_EVENT_TYPES,
        backup: option.backupVideo,
        audio: option.backupAudio,
    },
})

/**
 * 刷新回放帧索引
 * @param {String} task_id 对应启动回放时下发的guid
 * @param {Number} play_frame_index 帧索引
 */
export const CMD_PLAYBACK_REFRESH_FRAME_INDEX = (task_id: string, play_frame_index: number) => ({
    url: '/device/playback/refresh_play_index',
    basic: getBasic(),
    data: {
        task_id,
        play_frame_index,
    },
})

/**
 * seek跳转回放
 * @param {String} task_id 对应启动回放时下发的guid
 * @param {String} frame_time 跳转的目标时间点：毫秒时间戳
 */
export const CMD_PLAYBACK_SEEK = (task_id: string, frame_time: string) => ({
    url: '/device/playback/seek',
    basic: getBasic(),
    data: {
        task_id,
        frame_time,
    },
})

/**
 * 启用关键帧回放
 * @param {String} task_id 对应启动回放时下发的guid
 * @param {String} frame_time 启用时间点：毫秒时间戳
 */
export const CMD_PLAYBACK_KEY_FRAME = (task_id: string, frame_time: string) => ({
    url: '/device/playback/key_frame',
    basic: getBasic(),
    data: {
        task_id,
        frame_time,
    },
})

/**
 * 恢复全帧回放
 * @param {String} guid 对应启动回放时下发的guid
 * @param {String} frameTime 启用时间点：毫秒时间戳
 */
export const CMD_PLAYBACK_ALL_FRAME = (task_id: string, frame_time: string) => ({
    url: '/device/playback/all_frame',
    basic: getBasic(),
    data: {
        task_id,
        frame_time,
    },
})

/**
 * 回放打开音频
 * @param {String} task_id 对应预览下发的guid
 */
export const CMD_PLAYBACK_AUDIO_OPEN = (task_id: string) => ({
    url: '/device/playback/audio/open',
    basic: getBasic(),
    data: {
        task_id,
    },
})

/**
 * 回放关闭音频
 * @param {String} guid 对应预览下发的guid
 */
export const CMD_PLAYBACK_AUDIO_CLOSE = (task_id: string) => ({
    url: '/device/playback/audio/close',
    basic: getBasic(),
    data: {
        task_id,
    },
})

/**
 * 关闭回放
 * @param {String} guid 对应启动回放时下发的guid
 */
export const CMD_PLAYBACK_CLOSE = (task_id: string) => ({
    url: '/device/playback/close',
    basic: getBasic(),
    data: {
        task_id,
    },
})

/**
 * 上传文件请求
 * @param {Object} config
 *      @param {String} file_id 文件类型 config_file/cert_file/upgrade_file
 *      @param {Number} size 文件字节长度
 *      @param {String} sign_method 签名方法 SHA256/MD5
 *      @param {Object} param 配置参数
 *          @param {String} user_name 用户名 (file_id为cert_file不需要)
 *          @param {String} token token (file_id为cert_file不需要)
 *          @param {String} upgrade_head_info 升级文件前4096个字节的base64  (仅file_id为upgrade_file时需要)
 */
export interface CmdUploadFileOpenOption {
    file_id: string
    size: number
    sign_method: string
    param: {
        user_name?: string
        password?: string
        secPassword?: string
        token?: string
        upgrade_head_info?: string
        ipc_ids?: string[]
        security_ver?: number
        phrase?: string
    }
    checkversion?: boolean
}

export const CMD_UPLOAD_FILE_OPEN = (data: CmdUploadFileOpenOption) => ({
    url: '/device/file/upload/start',
    basic: getBasic(),
    data,
})

/**
 * 上传文件数据
 * @param {Number} index 文件下标
 * @param {Object} str 文件buffer
 */
export const CMD_UPLOAD_FILE_HEADER = (index: number, upload_file_data: string) => ({
    url: '/device/file/upload/step',
    basic: getBasic(),
    data: {
        upload_file_data,
        index,
    },
})

/**
 * 停止上传文件
 * @param {String} reason 结束上传的原因:
 * @param {String} sign 文件签名 (可选参数 文件上传完成时带上)
 *      finished:上传完成，开始执行对应上传文件类型的后续操作
 *      break:直接结束上传任务
 */
interface CmdUploadFileCloseOption {
    reason: string
    sign?: string
}

export const CMD_UPLOAD_FILE_CLOSE = (data: CmdUploadFileCloseOption) => ({
    url: '/device/file/upload/stop',
    basic: getBasic(),
    data,
})

/**
 * 下载文件请求
 * @param {Object} option
 *      @param {String} config 下载配置参数
 */
export interface CmdDownloadFileOpenOption {
    config?: string
    file_id?: string
    param?: {
        user_name?: string
        password?: string
        secPassword?: string
        token?: string
    }
}

export const CMD_DOWNLOAD_FILE_OPEN = (data: CmdDownloadFileOpenOption) => ({
    url: '/device/file/download/start',
    basic: getBasic(),
    data,
})

/**
 * 停止下载文件
 */
export const CMD_DOWNLOAD_FILE_CLOSE = () => ({
    url: '/device/file/download/stop',
    basic: getBasic(),
    data: {},
})

/**
 * 确认下载帧
 */
export const CMD_DOWNLOAD_CONFIRM_STEP = (index: number) => ({
    url: '/device/file/download/step#response',
    basic: getBasic(),
    data: {
        index,
    },
})

/**
 * 智能图片流订阅
 */
export const CMD_REALTIME_SNAP_SUBSCRIBE = (config: string) => ({
    url: '/device/real_image/subscribe',
    basic: getBasic(),
    data: config,
})

/**
 * 取消智能图片流订阅
 */
export const CMD_REALTIME_SNAP_UNSUBSCRIBE = () => ({
    url: '/device/real_image/unsubscribe',
    basic: getBasic(),
    data: {},
})

/**
 * 状态信息订阅
 */
// TODO 参数类型待确认
export interface CmdStateInfoSubscribeOption {
    channel_state_info?: boolean
    alarm_state_info?: string
    ipc_upgrade_state_info?: boolean
}

export const CMD_STATE_INFO_SUBSCRIBE = (data: CmdStateInfoSubscribeOption) => ({
    url: '/device/state_info/subscribe',
    basic: getBasic(),
    data,
})

/**
 * 取消状态信息订阅
 */
export const CMD_STATE_INFO_UNSUBSCRIBE = () => ({
    url: '/device/state_info/unsubscribe',
    basic: getBasic(),
    data: {},
})

/**
 * 启动样本库-人脸库导出
 */
export const CMD_FACELIB_EXPORT_START = (group_ids: string[] = []) => ({
    url: '/device/facelib/export/start',
    basic: getBasic(),
    data: {
        task_id: getRandomGUID(),
        group_ids,
    },
})

/**
 * 停止样本库-人脸库导出
 */
export const CMD_FACELIB_EXPORT_STOP = (task_id: string) => ({
    url: '/device/facelib/export/stop',
    basic: getBasic(),
    data: {
        task_id,
    },
})

/**
 * 刷新样本库-人脸库数据索引
 */
export const CMD_FACELIB_EXPORT_REFRESH_INDEX = (index: number, task_id: string) => ({
    url: '/device/facelib/export/refresh_index',
    basic: getBasic(),
    data: {
        index,
        task_id,
    },
})

/**
 * 启动样本库-车牌库导出
 */
export const CMD_PLATELIB_EXPORT_START = (group_ids: string[] = []) => ({
    url: '/device/platelib/export/start',
    basic: getBasic(),
    data: {
        task_id: getRandomGUID(),
        group_ids,
    },
})

/**
 * 停止样本库-车牌库导出
 */
export const CMD_PLATELIB_EXPORT_STOP = (task_id: string) => ({
    url: '/device/platelib/export/stop',
    basic: getBasic(),
    data: {
        task_id,
    },
})

/**
 * 样本库导出-回复确认
 */
export const CMD_PLATELIB_EXPORT_CONFIRM_STEP = (task_id: string) => ({
    url: '/device/platelib/export/data#response',
    basic: getBasic(),
    data: {
        task_id,
    },
})

/**
 * 启动样本库-车牌库导入
 */
export const CMD_PLATELIB_IMPORT_START = () => ({
    url: '/device/platelib/import/start',
    basic: getBasic(),
    data: {
        task_id: getRandomGUID(),
    },
})

/**
 * 启动样本库-车牌库导入数据
 */
// TODO: plate_data类型待确认
export const CMD_PLATELIB_IMPORT_DATA = (task_id: string, plate_data: string[]) => ({
    url: '/device/platelib/import/data',
    basic: getBasic(),
    data: {
        task_id,
        plate_data,
    },
})

/**
 * 停止样本库-车牌库导入
 */
export const CMD_PLATELIB_IMPORT_STOP = (task_id: string) => ({
    url: '/device/platelib/import/stop',
    basic: getBasic(),
    data: {
        task_id,
    },
})

/**
 * 请求通道关键帧
 * @param {Object} option
 *  @property {String} chlId: 通道id
 *  @property {Number} startTime: 开始时间戳（秒）
 *  @property {Number} endTime: 结束时间戳（秒）
 *  @property {Number} frameNum: 切片数量
 */
export interface CmdKeyframeStartOption {
    chlId: string
    startTime: number
    endTime: number
    frameNum: number
}

export const CMD_KEYFRAME_START = (option: CmdKeyframeStartOption) => ({
    url: '/device/search/key/frame/start',
    basic: getBasic(),
    data: {
        task_id: getRandomGUID(),
        channel_id: option.chlId,
        start_time: option.startTime,
        end_time: option.endTime,
        frame_num: option.frameNum,
    },
})

/**
 * 停止请求通道关键帧任务
 */
export const CMD_KEYFRAME_STOP = (task_id: string) => ({
    url: '/device/search/key/frame/stop',
    basic: getBasic(),
    data: {
        task_id,
    },
})
