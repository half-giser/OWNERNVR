/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 语言相关api
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-27 19:33:54
 */

import http from './api'

// 获取支持的语言列表
export const getSupportLangList = (data: string) => http.fetch('getSupportLangList', data)

// 获取语言翻译
export const getLangContent = (data: string) => http.fetch('getLangContent', data)
