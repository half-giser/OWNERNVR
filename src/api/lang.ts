/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 语言相关api
 */

import http from './api'

/**
 * @description 获取支持的语言列表
 * @returns
 */
export const getSupportLangList = () => http.fetch('getSupportLangList', getXmlWrapData(''))

/**
 * @description 获取语言翻译
 * @param {string} data
 * @returns
 */
export const getLangContent = (data: string) => http.fetch('getLangContent', getXmlWrapData(data))
