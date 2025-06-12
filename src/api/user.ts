/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2023-05-10 09:30:08
 * @Description: 用户相关api
 */

import type { AxiosRequestConfig } from 'axios'
import fetch from './api'
import router from '../router'
import { removeAsyncRoutes } from '../router'
import progress from '@bassist/progress'

/**
 * @description 预登录
 * @returns
 */
export const reqLogin = () => fetch('reqLogin', '')

/**
 * @description 登录
 * @param {string} data
 * @param config
 * @param checkCommonErrorSwitch
 * @returns
 */
export const doLogin = (data: string, config?: AxiosRequestConfig, checkCommonErrorSwitch = false) => fetch('doLogin', data, config, checkCommonErrorSwitch)

/**
 * @description 退出登录
 * @param {string} data
 * @param config
 * @returns
 */
export const doLogout = () => fetch('doLogout', '', {}, false)

/**
 * @description 登出处理
 * @param {boolean} isHttps 是否登出后以HTTPS访问登录页
 * @returns
 */
export const Logout = async (isHttps?: boolean) => {
    progress.start()

    const userSession = useUserSessionStore()
    const pluginStore = usePluginStore()
    if (router.currentRoute.value.name === 'login') return

    if (userSession.appType === 'STANDARD') {
        try {
            await doLogout()
        } catch {}
        userSession.clearSession()
        pluginStore.showPluginNoResponse = false
        removeAsyncRoutes()
        const r = getNonce()
        if (typeof isHttps === 'boolean') {
            if (isHttps) {
                window.location.href = `https://${location.host}/index.html?r=${r}`
            } else {
                window.location.href = `http://${location.host}/index.html?r=${r}`
            }
        } else {
            router.push('/login')
            window.location.href = `${location.origin}?r=${r}#/login`
        }
    } else {
        userSession.clearSession()
        window.location.href = '/index.html'
    }
}

/**
 * @description 从URL中解析用户信息
 * @returns
 */
export const getLoginInfoByURL = () => {
    const url = new URL(window.location.href)
    const reqTime = url.searchParams.get('reqTime')
    const reqID = url.searchParams.get('reqID')
    const userSession = useUserSessionStore()
    let info = url.searchParams.get('info')
    if (reqTime && reqID && info) {
        info = urlToBase64Str(info)
        const AESKey = sha256_encrypt_WordArray(reqTime + ':dashboard:' + reqID)
        const AESIV = MD5_encrypt_WordArray(reqID)
        const userInfo = AES_CBC_Decrypt(info, AESKey, AESIV)
        userSession.urlLoginAuth = userInfo
        window.location.href = location.origin + location.pathname
        return true
    } else {
        return false
    }
}

/**
 * @description 查询隐私政策
 * @returns
 */
export const queryShowPrivacyView = () => fetch('queryShowPrivacyView', '')

/**
 * @description 获取Session信息
 * @returns
 */
export const getSessionInfo = () => fetch('queryShowPrivacyView', '', {}, false)

/**
 * @description
 * @returns
 */
export const queryRecoverPasswordInfo = () => fetch('queryRecoverPasswordInfo', '', {}, false)

/**
 * @description
 * @param data
 * @returns
 */
export const sendCaptchaEmail = (data: string) => fetch('sendCaptchaEmail', data, {}, false)

/**
 * @description
 * @param data
 * @returns
 */
export const recoverPassword = (data: string) => fetch('recoverPassword', data, {}, false)
