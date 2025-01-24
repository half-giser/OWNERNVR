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
