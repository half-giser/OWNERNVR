/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2023-05-10 09:30:08
 * @Description: 用户相关api
 */

import type { AxiosRequestConfig } from 'axios'
import http from './api'
import router from '../router'

/**
 * @description 预登录
 * @param {string} data
 * @param config
 * @returns
 */
export const reqLogin = (data: string, config?: AxiosRequestConfig) => http.fetch('reqLogin', data, config)

/**
 * @description 登录
 * @param {string} data
 * @param config
 * @param checkCommonErrorSwitch
 * @returns
 */
export const doLogin = (data: string, config?: AxiosRequestConfig, checkCommonErrorSwitch = true) => http.fetch('doLogin', data, config, checkCommonErrorSwitch)

/**
 * @description 退出登录
 * @param {string} data
 * @param config
 * @returns
 */
export const doLogout = (data: string, config?: AxiosRequestConfig) => http.fetch('doLogout', data, config)

/**
 * @description 登出处理
 * @param {boolean} isTotokenInvalid
 * @returns
 */
export const Logout = (isTotokenInvalid: boolean = false) => {
    const userSession = useUserSessionStore()
    if (router.currentRoute.value.name === 'login') return
    if (!isTotokenInvalid) {
        doLogout(getXmlWrapData(''))
    }
    userSession.sessionId = ''
    // sessionStorage.removeItem(LocalCacheKey.sessionId)
    delCookie(LocalCacheKey.sessionId)
    router.push('/login')
}

/**
 * @description 查询隐私政策
 * @returns
 */
export const queryShowPrivacyView = () => http.fetch('queryShowPrivacyView', getXmlWrapData(''))
