/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 10:25:04
 * @Description: websocket命令生成工具
 */

/**
 * @description 获取websocket握手url
 */
export const getWebsocketOpenUrl = () => {
    const userSession = useUserSessionStore()
    const localHost = window.location.host + import.meta.env.VITE_BASE_URL // import.meta.env.PROD ? window.location.host : import.meta.env.VITE_APP_IP
    const p2pHost = 'virtualWebsocket' + '/'
    const host = userSession.appType === 'STANDARD' ? localHost : p2pHost
    const protocol = window.location.protocol
    const wsProtocol = protocol === 'http:' ? 'ws' : 'wss'
    return wsProtocol + '://' + host + 'requestWebsocketConnection'
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
    'threshold',
    'smart_plate_verity',
    'smart_fire_point',
    'smart_temperature',
    'asd',
    'pvd',
    'SMDHuman',
    'SMDVehicle',
    'crowd_gather',
    'loitering',
    'reid',
    'target_human',
    'target_vehicle',
    'target_non_motor_vehicle',
]

/**
 * @description 生成basic数据
 */
export const getBasic = () => {
    const requestBasicId = sessionStorage.getItem(LocalCacheKey.KEY_REQUEST_BASIC_ID)
    const id = requestBasicId ? Number(requestBasicId) : 0
    const newId = id && id < Number.MAX_SAFE_INTEGER ? id + 1 : 1
    return {
        ver: '1.0',
        time: Date.now(),
        id: newId,
        nonce: getNonce(),
    }
}

export interface CmdPreviewOption {
    chlID: string // 通道id
    streamType: number // 码流类型 1主码流 2辅码流 3子码流
    audio: boolean // 是否携带音频
}

/**
 * @description 启动现场预览
 * @param {CmdPreviewOption} option
 */
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
 * @description 关闭现场预览
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
 * @description 现场预览打开音频
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
 * @description 现场预览关闭音频
 * @param {String} task_id 对应预览下发的guid
 */
export const CMD_PREVIEW_AUDIO_CLOSE = (task_id: string) => ({
    url: '/device/preview/audio/close',
    basic: getBasic(),
    data: {
        task_id,
    },
})

export interface CmdPlaybackOpenOption {
    chlID: string // 通道id
    startTime: number // 回放开始时间戳（秒）
    endTime: number // 回放结束时间戳（秒）
    streamType: number // 码流类型 0主码流 1子码流
    typeMask?: string[] // 录像事件类型
    backupVideo: boolean // 是否为备份视频，默认否
    backupAudio: boolean // 是否为备份音频，默认否
}

/**
 * @description 启动回放
 * @param {CmdPlaybackOpenOption} option
 */
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
 * @description 刷新回放帧索引
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
 * @description seek跳转回放
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
 * @description 启用关键帧回放
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
 * @description 恢复全帧回放
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
 * @description 回放打开音频
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
 * @description 回放关闭音频
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
 * @description 关闭回放
 * @param {String} guid 对应启动回放时下发的guid
 */
export const CMD_PLAYBACK_CLOSE = (task_id: string) => ({
    url: '/device/playback/close',
    basic: getBasic(),
    data: {
        task_id,
    },
})

export interface CmdUploadFileOpenOption {
    file_id: string // 文件类型 config_file/cert_file/upgrade_file
    size: number // 文件字节长度
    sign_method: string // 签名方法 SHA256/MD5
    param: {
        user_name?: string // 用户名 (file_id为cert_file不需要
        password?: string
        secPassword?: string
        token?: string // token (file_id为cert_file不需要)
        upgrade_head_info?: string // 升级文件前4096个字节的base64  (仅file_id为upgrade_file时需要)
        ipc_ids?: string[]
        security_ver?: number
        phrase?: string
    }
    checkversion?: boolean
}

/**
 * @description 上传文件请求
 * @param {CmdUploadFileOpenOption} config
 */
export const CMD_UPLOAD_FILE_OPEN = (data: CmdUploadFileOpenOption) => ({
    url: '/device/file/upload/start',
    basic: getBasic(),
    data,
})

/**
 * @description 上传文件数据
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

interface CmdUploadFileCloseOption {
    reason: string
    sign?: string
}

/**
 * @description 停止上传文件
 * @param {String} reason 结束上传的原因:
 * @param {String} sign 文件签名 (可选参数 文件上传完成时带上)
 *      finished:上传完成，开始执行对应上传文件类型的后续操作
 *      break:直接结束上传任务
 */
export const CMD_UPLOAD_FILE_CLOSE = (data: CmdUploadFileCloseOption) => ({
    url: '/device/file/upload/stop',
    basic: getBasic(),
    data,
})

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

/**
 * @description 下载文件请求
 * @param {CmdDownloadFileOpenOption} data
 */
export const CMD_DOWNLOAD_FILE_OPEN = (data: CmdDownloadFileOpenOption) => ({
    url: '/device/file/download/start',
    basic: getBasic(),
    data,
})

/**
 * @description 停止下载文件
 */
export const CMD_DOWNLOAD_FILE_CLOSE = () => ({
    url: '/device/file/download/stop',
    basic: getBasic(),
    data: {},
})

/**
 * @description 确认下载帧
 */
export const CMD_DOWNLOAD_CONFIRM_STEP = (index: number) => ({
    url: '/device/file/download/step#response',
    basic: getBasic(),
    data: {
        index,
    },
})

/**
 * @description 智能图片流订阅
 */
export const CMD_REALTIME_SNAP_SUBSCRIBE = (config: any) => ({
    url: '/device/real_image/subscribe',
    basic: getBasic(),
    data: config,
})

/**
 * @description 取消智能图片流订阅
 */
export const CMD_REALTIME_SNAP_UNSUBSCRIBE = () => ({
    url: '/device/real_image/unsubscribe',
    basic: getBasic(),
    data: {},
})

/**
 * @description 状态信息订阅
 */
export interface CmdStateInfoSubscribeOption {
    channel_state_info?: boolean
    alarm_state_info?: boolean
    ipc_upgrade_state_info?: boolean
}

export const CMD_STATE_INFO_SUBSCRIBE = (data: CmdStateInfoSubscribeOption) => ({
    url: '/device/state_info/subscribe',
    basic: getBasic(),
    data,
})

/**
 * @description 取消状态信息订阅
 */
export const CMD_STATE_INFO_UNSUBSCRIBE = () => ({
    url: '/device/state_info/unsubscribe',
    basic: getBasic(),
    data: {},
})

/**
 * @description 启动样本库-人脸库导出
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
 * @description 停止样本库-人脸库导出
 * @param {string} task_id
 */
export const CMD_FACELIB_EXPORT_STOP = (task_id: string) => ({
    url: '/device/facelib/export/stop',
    basic: getBasic(),
    data: {
        task_id,
    },
})

/**
 * @description 刷新样本库-人脸库数据索引
 * @param {number} index
 * @param {string} task_id
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
 * @description 启动样本库-车牌库导出
 * @param {string[]} group_ids
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
 * @description 停止样本库-车牌库导出
 * @param {string} task_id
 */
export const CMD_PLATELIB_EXPORT_STOP = (task_id: string) => ({
    url: '/device/platelib/export/stop',
    basic: getBasic(),
    data: {
        task_id,
    },
})

/**
 * @description 样本库导出-回复确认
 * @param {string} task_id
 */
export const CMD_PLATELIB_EXPORT_CONFIRM_STEP = (task_id: string) => ({
    url: '/device/platelib/export/data#response',
    basic: getBasic(),
    data: {
        task_id,
    },
})

/**
 * @description 启动样本库-车牌库导入
 */
export const CMD_PLATELIB_IMPORT_START = (totalNum: number) => ({
    url: '/device/platelib/import/start',
    basic: getBasic(),
    data: {
        task_id: getRandomGUID(),
        task_total: totalNum,
    },
})

export interface CmdPlateLibImportDataList {
    vehicle_plate_group_id: string
    plate_number: string
    owner: string
    owner_phone: string
    vehicle_type: string
}

/**
 * @description 启动样本库-车牌库导入数据
 * @param {string} task_id
 * @param {string[]} plate_data
 */
export const CMD_PLATELIB_IMPORT_DATA = (task_id: string, plate_data: CmdPlateLibImportDataList[]) => ({
    url: '/device/platelib/import/data',
    basic: getBasic(),
    data: {
        task_id,
        plate_data,
    },
})

/**
 * @description 停止样本库-车牌库导入
 */
export const CMD_PLATELIB_IMPORT_STOP = (task_id: string) => ({
    url: '/device/platelib/import/stop',
    basic: getBasic(),
    data: {
        task_id,
    },
})

export interface CmdKeyframeStartOption {
    chlId: string // 通道id
    startTime: number // 开始时间戳（秒）
    endTime: number // 结束时间戳（秒）
    frameNum: number // 切片数量
}

/**
 * @description 请求通道关键帧
 * @param {CmdKeyframeStartOption} option
 */
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
 * @description 停止请求通道关键帧任务
 * @param {string} task_id
 */
export const CMD_KEYFRAME_STOP = (task_id: string) => ({
    url: '/device/search/key/frame/stop',
    basic: getBasic(),
    data: {
        task_id,
    },
})
