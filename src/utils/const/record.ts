/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-22 20:03:07
 * @Description: 录像相关常量
 */

// 视频编码类型
export const DEFAULT_VIDEO_ENCODE_TYPE_ARRAY = ['h264s', 'h265s', 'h264p', 'h265p']

// 图像质量与翻译的映射
export const DEFAULT_IMAGE_LEVEL_MAPPING: Record<string, string> = {
    highest: 'IDCS_HIGHEST',
    higher: 'IDCS_HIGHER',
    medium: 'IDCS_MEDIUM',
    low: 'IDCS_LOW',
    lower: 'IDCS_LOWER',
    lowest: 'IDCS_LOWEST',
    '': 'IDCS_LOWEST',
}

// 码流类型与翻译的映射
export const DEFAULT_STREAM_TYPE_MAPPING: Record<string, string> = {
    main: 'IDCS_MAIN_STREAM',
    sub: 'IDCS_SUB_STREAM',
    h264: 'IDCS_VIDEO_ENCT_TYPE_H264',
    h264s: 'IDCS_VIDEO_ENCT_TYPE_H264_SMART',
    h264p: 'IDCS_VIDEO_ENCT_TYPE_H264_PLUS',
    h265: 'IDCS_VIDEO_ENCT_TYPE_H265',
    h265s: 'IDCS_VIDEO_ENCT_TYPE_H265_SMART',
    h265p: 'IDCS_VIDEO_ENCT_TYPE_H265_PLUS',
}

// 所有的录像事件类型与名称翻译的映射（全集）
export const EVENT_TYPE_NAME_MAPPING: Record<string, string> = {
    // 通用事件
    motion: 'IDCS_MOTION_DETECTION',
    smdPerson: 'IDCS_MOTION_DETECTION',
    smdCar: 'IDCS_MOTION_DETECTION',
    manual: 'IDCS_MANUAL',
    pos: 'IDCS_POS',
    sensor: 'IDCS_SENSOR',
    // 周界防范
    intrusion: 'IDCS_INVADE_DETECTION',
    smartEntry: 'IDCS_SMART_AOI_ENTRY_DETECTION',
    smartLeave: 'IDCS_SMART_AOI_LEAVE_DETECTION',
    tripwire: 'IDCS_BEYOND_DETECTION',
    // 目标事件
    vfd: 'IDCS_FACE_DETECTION',
    faceMatch: 'IDCS_FACE_MATCH',
    plateMatch: 'IDCS_VEHICLE_DETECTION',
    // 异常行为
    loitering: 'IDCS_LOITERING_DETECTION',
    pvd: 'IDCS_PARKING_DETECTION',
    threshold: 'IDCS_SMART_STATISTIC_THRESHOLD_ALARM',
    cdd: 'IDCS_CROWD_DENSITY_DETECTION',
    osc: 'IDCS_WATCH_DETECTION',
    asd: 'IDCS_AUDIO_EXCEPTION_DETECTION',
    avd: 'IDCS_ABNORMAL_DETECTION',
    smartCroedGather: 'IDCS_CROWD_GATHERING',
    // 热成像
    firePoint: 'IDCS_FIRE_POINT_DETECTION',
    temperatureAlarm: 'IDCS_TEMPERATURE_DETECTION',
    // 排程
    schedule: 'IDCS_SCHEDULE',
    // 其他
    cpc: 'IDCS_PASS_LINE_COUNT_DETECTION',
    human: 'IDCS_DETECTION_PERSON',
    vehicle: 'IDCS_DETECTION_VEHICLE',
    nonMotorizedVehicle: 'IDCS_DETECTION_MOTORCYCLE',
}
