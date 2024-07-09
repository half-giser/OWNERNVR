/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-22 16:06:16
 * @Description: 业务应用api
 */

import type { AxiosRequestConfig } from 'axios'
import http from './api'

// 获取停车场基础配置（基础配置、车位管理、出入口）
export const queryParkingLotConfig = () => http.fetch('queryParkingLotConfig', getXmlWrapData(''))
// 编辑停车场基础配置（基础配置、车位管理、出入口）
export const editParkingLotConfig = (data: string, config?: AxiosRequestConfig) => http.fetch('editParkingLotConfig', data, config)

// 获取门禁配置-门锁配置
export const queryAccessControlCfg = (data: string, config?: AxiosRequestConfig) => http.fetch('queryAccessControlCfg', data, config)
// 编辑门禁配置-门锁配置
export const editAccessControlCfg = (data: string, config?: AxiosRequestConfig) => http.fetch('editAccessControlCfg', data, config)
// 获取门禁配置-韦根配置
export const queryAccessDataComCfg = (data: string, config?: AxiosRequestConfig) => http.fetch('queryAccessDataComCfg', data, config)
// 编辑门禁配置-韦根配置
export const editAccessDataComCfg = (data: string, config?: AxiosRequestConfig) => http.fetch('editAccessDataComCfg', data, config)

// 获取人脸考勤-人脸分组列表数据
export const queryFacePersonnalInfoGroupList = () => http.fetch('queryFacePersonnalInfoGroupList', getXmlWrapData(''))
// 获取人脸考勤-人脸分组中的人脸数据
export const queryFacePersonnalInfoList = (data: string, config?: AxiosRequestConfig) => http.fetch('queryFacePersonnalInfoList', data, config)

export const queryPlateLibrary = () => http.fetch('queryPlateLibrary', getXmlWrapData(''))
