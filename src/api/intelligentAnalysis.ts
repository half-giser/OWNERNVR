/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 17:02:54
 * @Description: 智能分析
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-03 17:14:14
 */
import http from './api'

/**
 * @description 获取报警状态
 * @returns
 */
export const getAlarmOutStatus = () => http.fetch('getAlarmOutStatus', getXmlWrapData(''))

/**
 * @description 设置报警状态
 * @param {string} data
 * @returns
 */
export const setAlarmOutStatus = (data: string) => http.fetch('setAlarmOutStatus', getXmlWrapData(data))

/**
 * @description 手动解锁
 * @param {string} data
 * @returns
 */
export const manualUnlocking = (data: string) => http.fetch('manualUnlocking', getXmlWrapData(data))

/**
 * @description 获取AI资源细节
 * @returns
 */
export const queryAIResourceDetail = () => http.fetch('queryAIResourceDetail', getXmlWrapData(''))

/**
 * @description 获取人脸组数据
 * @returns
 */
export const queryFacePersonnalInfoGroupList = () => http.fetch('queryFacePersonnalInfoGroupList', getXmlWrapData(''), {}, false)

/**
 * @description 创建人脸组
 * @param {string} data
 * @returns
 */
export const createFacePersonnalInfoGroup = (data: string) => http.fetch('createFacePersonnalInfoGroup', getXmlWrapData(data))

/**
 * @description 删除人脸组
 * @param {string} data
 * @returns
 */
export const delFacePersonnalInfoGroups = (data: string) => http.fetch('delFacePersonnalInfoGroups', getXmlWrapData(data))

/**
 * @description 编辑人脸组
 * @param {string} data
 * @returns
 */
export const editFacePersonnalInfoGroup = (data: string) => http.fetch('editFacePersonnalInfoGroup', getXmlWrapData(data), {}, false)

/**
 * @description 获取人脸图片
 * @param {string} data
 * @returns
 */
export const requestFacePersonnalInfoImage = (data: string) => http.fetch('requestFacePersonnalInfoImage', getXmlWrapData(data), {}, false)

/**
 * @description 删除人脸数据
 * @param {string} data
 * @returns
 */
export const delFacePersonnalInfo = (data: string) => http.fetch('delFacePersonnalInfo', getXmlWrapData(data))

/**
 * @description 获取通道捕捉人脸图像
 * @param {string} data
 * @returns
 */
export const requestChSnapFaceImage = (data: string) => http.fetch('requestChSnapFaceImage', getXmlWrapData(data), {}, false)

/**
 * @description 创建人脸数据
 * @param {string} data
 * @returns
 */
export const createFacePersonnalInfo = (data: string) => http.fetch('createFacePersonnalInfo', getXmlWrapData(data), {}, false)

/**
 * @description 获取人脸组中的人脸数据
 * @param {string} data
 * @returns
 */
export const queryFacePersonnalInfoList = (data: string) => http.fetch('queryFacePersonnalInfoList', getXmlWrapData(data), {}, false)

/**
 * @description 编辑人脸组中的人脸数据
 * @param {string} data
 * @returns
 */
export const editFacePersonnalInfo = (data: string) => http.fetch('editFacePersonnalInfo', getXmlWrapData(data), {}, false)

/**
 * @description 查询车牌库
 * @returns
 */
export const queryPlateLibrary = () => http.fetch('queryPlateLibrary', getXmlWrapData(''))

/**
 * @description 获取车牌组的车牌数据
 * @param {string} data
 * @returns
 */
export const queryPlateNumber = (data: string) => http.fetch('queryPlateNumber', getXmlWrapData(data))

/**
 * @description 新增车牌组
 * @param {string} data
 * @returns
 */
export const addPlateLibrary = (data: string) => http.fetch('addPlateLibrary', getXmlWrapData(data))

/**
 * @description 编辑车牌组
 * @param {string} data
 * @returns
 */
export const editPlateLibrary = (data: string) => http.fetch('editPlateLibrary', getXmlWrapData(data))

/**
 * @description 删除车牌组
 * @param {string} data
 * @returns
 */
export const deletePlateLibrary = (data: string) => http.fetch('deletePlateLibrary', getXmlWrapData(data))

/**
 * @description 删除车牌
 * @param {string} data
 * @returns
 */
export const deletePlateNumber = (data: string) => http.fetch('deletePlateNumber', getXmlWrapData(data))

/**
 * @description 新增车牌
 * @param {string} data
 * @returns
 */
export const addPlateNumber = (data: string) => http.fetch('addPlateNumber', getXmlWrapData(data))

/**
 * @description 编辑车牌
 * @param {string} data
 * @returns
 */
export const editPlateNumber = (data: string) => http.fetch('editPlateNumber', getXmlWrapData(data))

/**
 * @description 人脸图像统计
 * @param {string} data
 * @returns
 */
export const faceImgStatistic_v2 = (data: string) => http.fetch('faceImgStatistic_v2', getXmlWrapData(data))
