/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2023-05-10 09:30:08
 * @Description: 用户相关api
 */

import type { AxiosRequestConfig } from 'axios'
import http from './api'
import router from '../router'
import { removeAsyncRoutes } from '../router'

/**
 * @description 预登录
 * @returns
 */
export const reqLogin = () => http.fetch('reqLogin', '')

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
export const doLogout = () => http.fetch('doLogout', '', {}, false)

/**
 * @description 登出处理
 * @returns
 */
export const Logout = async () => {
    const userSession = useUserSessionStore()
    const pluginStore = usePluginStore()
    if (router.currentRoute.value.name === 'login') return

    if (userSession.appType === 'STANDARD') {
        await doLogout()
        userSession.clearSession()
        pluginStore.showPluginNoResponse = false
        removeAsyncRoutes()
        router.push('/login')
    } else {
        userSession.clearSession()
        window.location.href = '/index.html'
    }
}

/**
 * @description 查询隐私政策
 * @returns
 */
export const queryShowPrivacyView = () => http.fetch('queryShowPrivacyView', '')
