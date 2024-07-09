// 语言相关api
import type { AxiosRequestConfig } from 'axios'
import http from './api'

// 获取支持的语言列表
export const getSupportLangList = (data: string, config?: AxiosRequestConfig) => http.fetch('getSupportLangList', data, config)

// 获取语言翻译
export const getLangContent = (data: string, config?: AxiosRequestConfig) => http.fetch('getLangContent', data, config)
