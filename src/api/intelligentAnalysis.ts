/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 17:02:54
 * @Description: 智能分析
 */
import http from './api'

/**
 * @description 获取报警状态
 * @returns
 */
export const getAlarmOutStatus = () => http.fetch('getAlarmOutStatus', '')

/**
 * @description 设置报警状态
 * @param {string} data
 * @returns
 */
export const setAlarmOutStatus = (data: string) => http.fetch('setAlarmOutStatus', data)

/**
 * @description 手动解锁
 * @param {string} data
 * @returns
 */
export const manualUnlocking = (data: string) => http.fetch('manualUnlocking', data)

/**
 * @description 获取人脸组数据
 * @returns
 */
export const queryFacePersonnalInfoGroupList = () => http.fetch('queryFacePersonnalInfoGroupList', '', {}, false)

/**
 * @description 创建人脸组
 * @param {string} data
 * @returns
 */
export const createFacePersonnalInfoGroup = (data: string) => http.fetch('createFacePersonnalInfoGroup', data)

/**
 * @description 删除人脸组
 * @param {string} data
 * @returns
 */
export const delFacePersonnalInfoGroups = (data: string) => http.fetch('delFacePersonnalInfoGroups', data)

/**
 * @description 编辑人脸组
 * @param {string} data
 * @returns
 */
export const editFacePersonnalInfoGroup = (data: string) => http.fetch('editFacePersonnalInfoGroup', data, {}, false)

/**
 * @description 获取人脸图片
 * @param {string} data
 * @returns
 */
export const requestFacePersonnalInfoImage = (data: string) => http.fetch('requestFacePersonnalInfoImage', data, {}, false)

/**
 * @description 删除人脸数据
 * @param {string} data
 * @returns
 */
export const delFacePersonnalInfo = (data: string) => http.fetch('delFacePersonnalInfo', data)

/**
 * @description 获取通道捕捉人脸图像
 * @param {string} data
 * @returns
 */
export const requestChSnapFaceImage = (data: string) => http.fetch('requestChSnapFaceImage', data, {}, false)

/**
 * @description 创建人脸数据
 * @param {string} data
 * @returns
 */
export const createFacePersonnalInfo = (data: string) => http.fetch('createFacePersonnalInfo', data, {}, false)

/**
 * @description 获取人脸组中的人脸数据
 * @param {string} data
 * @returns
 */
export const queryFacePersonnalInfoList = (data: string) => http.fetch('queryFacePersonnalInfoList', data, {}, false)

/**
 * @description 编辑人脸组中的人脸数据
 * @param {string} data
 * @returns
 */
export const editFacePersonnalInfo = (data: string) => http.fetch('editFacePersonnalInfo', data, {}, false)

/**
 * @description 查询车牌库
 * @returns
 */
export const queryPlateLibrary = () => http.fetch('queryPlateLibrary', '')

/**
 * @description 获取车牌组的车牌数据
 * @param {string} data
 * @returns
 */
export const queryPlateNumber = (data: string) => http.fetch('queryPlateNumber', data)

/**
 * @description 新增车牌组
 * @param {string} data
 * @returns
 */
export const addPlateLibrary = (data: string) => http.fetch('addPlateLibrary', data)

/**
 * @description 编辑车牌组
 * @param {string} data
 * @returns
 */
export const editPlateLibrary = (data: string) => http.fetch('editPlateLibrary', data)

/**
 * @description 删除车牌组
 * @param {string} data
 * @returns
 */
export const deletePlateLibrary = (data: string) => http.fetch('deletePlateLibrary', data)

/**
 * @description 删除车牌
 * @param {string} data
 * @returns
 */
export const deletePlateNumber = (data: string) => http.fetch('deletePlateNumber', data)

/**
 * @description 新增车牌
 * @param {string} data
 * @returns
 */
export const addPlateNumber = (data: string) => http.fetch('addPlateNumber', data)

/**
 * @description 编辑车牌
 * @param {string} data
 * @returns
 */
export const editPlateNumber = (data: string) => http.fetch('editPlateNumber', data)

/**
 * @description 人脸图像统计
 * @param {string} data
 * @returns
 */
export const faceImgStatistic_v2 = (data: string) => http.fetch('faceImgStatistic_v2', data)

/**
 * @description 智能搜索
 * @param {string} data
 * @returns
 */
export const searchSmartTarget = (data: string) => http.fetch('searchSmartTarget', data)

/**
 * @description 获取轨迹背景地图
 * @returns
 */
export const queryEMap = () => http.fetch('queryEMap', '')

/**
 * @description 获取轨迹地图配置
 * @returns
 */
export const queryEMapParam = () => http.fetch('queryEMapParam', '')

/**
 * @description 编辑轨迹地图配置
 * @param {string} data
 * @returns
 */
export const editEMapParam = (data: string) => http.fetch('editEMapParam', data)

/**
 * @description 搜索抓拍图像
 * @param {string} data
 * @returns
 */
export const searchImageByImageV2 = (data: string) => http.fetch('searchImageByImageV2', data)

/**
 * @description 获取智能目标抓拍图
 * @param {string} data
 * @returns
 */
export const requestSmartTargetSnapImage = (data: string) => http.fetch('requestSmartTargetSnapImage', data)
