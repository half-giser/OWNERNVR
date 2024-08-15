/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-04-28 17:57:48
 * @Description: 工具方法
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-14 14:33:21
 */

import { useUserSessionStore } from '@/stores/userSession'
import { checkPort } from './validates'
import { useLangStore } from '@/stores/lang'
import { type QueryNodeListDto } from '@/types/apiType/channel'
import { queryNodeList } from '@/api/channel'
import { type ApiResult, getXmlWrapData } from '@/api/api'
import { type XMLQuery, type XmlResult } from './xmlParse'
import useMessageBox from '@/hooks/useMessageBox'
import { APP_TYPE } from '@/utils/constants'

export * from './transformers'
export * from './validates'
export * from './formats'
export * from './xmlParse'
export * from './encrypt'
export * from './date'

/**
 * @description: 获取对象的第一个属性的key和value
 * @param {any} obj
 * @return {*}
 */
export const getObjFirstKV = (obj: any): [string, any] | undefined => {
    for (const key in obj) {
        return [key, obj[key]]
    }
}

/**
 * @description: 获取当前网站的UI和主题
 * @return {UiAndTheme}
 */
export const getUiAndTheme = (): UiAndTheme => {
    const uiArr = (<string>import.meta.env.VITE_UI_TYPE).split('-')
    const ui = uiArr[0] as UiName
    const theme = uiArr[1]
    return {
        ui,
        theme,
        name: import.meta.env.VITE_UI_TYPE,
    }
}

/**
 * @description: 获取客户端操作系统
 * @return {SystemInfo} platform/version
 */
export const getSystemInfo = (): SystemInfo => {
    const systemInfo: SystemInfo = { platform: 'unknow', version: 'other' }

    const userAgent = navigator.userAgent
    const platform = navigator.platform.toLowerCase()

    const isWin = platform == 'win32' || platform == 'win64' || platform == 'windows'
    const isMac = platform == 'mac68k' || platform == 'macppc' || platform == 'macintosh' || platform == 'macintel'
    const isUnix = platform == 'x11' && !isWin && !isMac
    const isLinux = String(platform).indexOf('linux') > -1

    if (isWin) {
        systemInfo.platform = 'windows'
    } else if (isMac) {
        systemInfo.platform = 'mac'
    } else if (isUnix) {
        systemInfo.platform = 'unix'
    } else if (isLinux) {
        systemInfo.platform = 'linux'
    }

    if (isWin) {
        const isWin2K = userAgent.indexOf('Windows NT 5.0') > -1 || userAgent.indexOf('Windows 2000') > -1
        const isWinXP = userAgent.indexOf('Windows NT 5.1') > -1 || userAgent.indexOf('Windows XP') > -1
        const isWin2003 = userAgent.indexOf('Windows NT 5.2') > -1 || userAgent.indexOf('Windows 2003') > -1
        const isWinVista = userAgent.indexOf('Windows NT 6.0') > -1 || userAgent.indexOf('Windows Vista') > -1
        const isWin7 = userAgent.indexOf('Windows NT 6.1') > -1 || userAgent.indexOf('Windows 7') > -1
        const isWin8 = userAgent.indexOf('Windows NT 8') > -1
        const isWin10 = userAgent.indexOf('Windows NT 10') > -1

        if (isWin2K) {
            systemInfo.version = 'Win2000'
        } else if (isWinXP) {
            systemInfo.version = 'WinXP'
        } else if (isWin2003) {
            systemInfo.version = 'Win2003'
        } else if (isWinVista) {
            systemInfo.version = 'WinVista'
        } else if (isWin7) {
            systemInfo.version = 'Win7'
        } else if (isWin8) {
            systemInfo.version = 'Win8'
        } else if (isWin10) {
            systemInfo.version = 'Win10'
        }
    }
    return systemInfo
}

/**
 * @description: 获取浏览器信息（类型、版本、客户端信息）
 * @return {BrowserInfo} type/version/majorVersion
 */
export const getBrowserInfo = (): BrowserInfo => {
    const browserInfo: BrowserInfo = { type: 'unknow', version: '', majorVersion: 0 }
    const userAgent = navigator.userAgent.toLowerCase()
    let matches
    if (/msie\s*|trident\/7/i.test(userAgent)) {
        // IE浏览器
        browserInfo.type = 'ie'
        matches = userAgent.match(/trident\/(\d+(\.\d+)*)/i)
        if (matches) {
            browserInfo.version = { '4.0': '8.0', '5.0': '9.0', '6.0': '10.0', '7.0': '11.0' }[matches[1]] as string
        } else {
            matches = userAgent.match(/msie\s*(\d+(\.\d+)*)/i)
            if (matches) {
                browserInfo.version = matches[1]
            }
        }
    } else if (/opr/i.test(userAgent) || /opera/i.test(userAgent)) {
        // Opera浏览器
        browserInfo.type = 'opera'
        matches = userAgent.match(/opr\/(\d+(\.\d+)*)/i)
        if (matches) {
            browserInfo.version = matches[1]
        } else {
            matches = userAgent.match(/opera.*version\/(\d+(\.\d+)*)/i)
            if (matches) {
                browserInfo.version = matches[1]
            }
        }
    } else {
        // 其他浏览器
        const simpleBrowserList = [
            { name: 'lowEdge', reg: /edge\/(\d+(\.\d+)*)/i }, // EdgeHTML内核（79.0.309之前版本的Edge), 如：Edge/18.18363
            { name: 'edge', reg: /edg\/(\d+(\.\d+)*)/i }, // Chromium内核（79.0.309及更高版本的Edge）, 如：Edg/103.0.1264
            { name: 'firefox', reg: /firefox\/(\d+(\.\d+)*)/i },
            { name: 'chrome', reg: /chrome\/(\d+(\.\d+)*)/i },
            { name: 'safari', reg: /version\/(\d+(\.\d+)*).*safari/i },
        ]
        for (let i = 0; i < simpleBrowserList.length; i++) {
            matches = userAgent.match(simpleBrowserList[i]['reg'])
            if (matches) {
                browserInfo.type = simpleBrowserList[i]['name'] as BrowserType
                browserInfo.version = matches[1]
                break
            }
        }
    }
    if (browserInfo.version) {
        browserInfo.majorVersion = (browserInfo.version as any).split('.')[0] * 1
    }
    return browserInfo
}

/**
 * @description: 从路径获取文件名， 如：
 * /a/b/c.svg ==> c.svg
 * a/b/c.svg ==> c.svg
 * c.svg ==> c.svg
 * @param {string} path
 * @return {string}
 */
export const getFileNameFromPath = (path: string) => {
    return path.substring(path.lastIndexOf('/') + 1)
}

/**
 * @description: 从路径获取不带后缀的文件名， 如：
 * /a/b/c.svg ==> c
 * a/b/c.svg ==> c
 * c.svg ==> c
 * @param {string} path
 * @return {string}
 */
export const getFileNameNoExtFromPath = (path: string) => {
    return path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'))
}

/**
 * @description 判断当前是否为https访问
 * @returns {boolean}
 */
export const isHttpsLogin = () => {
    return window.location.protocol == 'https:'
}

// 判断浏览器是否支持webAssembly
export const isBrowserSupportWasm = () => {
    return 'WebAssembly' in window && APP_TYPE == 'STANDARD'
}

/**
 * @description 串化URL参数
 * @param params 参数
 * @returns {string}
 */
export const getURLSearchParams = (params: Record<string, string | number | boolean | null>) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null) searchParams.append(key, String(value))
    })
    return searchParams.toString()
}

/**
 * @description: 解析RTSP地址 [1]ip, [2]端口，[3]路径
 * @param {string} str
 * @return {Object}
 */
export const matchRtspUrl = (str: string) => {
    const rtspReg = /^rtsp:\/\/((?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|[1-9])(?:\.(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}):(\d{1,5})\/([^&$|\\'<>]+)$/
    const result = str.match(rtspReg)
    if (!result) {
        return null
    }
    const port = result[2]
    if (!checkPort(port)) {
        return null
    }
    return result
}

/**
 * @description 生成RTSP URL
 * @param ip
 * @param port
 * @param rtspUrl
 * @returns {string}
 */
export const getRtspUrl = (ip: string, port: string, rtspUrl: string) => {
    return `rtsp://${ip}:${port}/${rtspUrl}`
}

/**
 * @description 下载文件
 * @param { Blob } blob 文件的blob
 * @param { string } fileName 文件名(包含扩展名)
 */
export const download = (blob: Blob, fileName: string) => {
    const link = document.createElement('a')
    const url = window.URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    }, 1000)
}

/**
 * @description 下载文件
 * @param { imgBase64 } Base64 文件的blob
 * @param { string } fileName 文件名(包含扩展名)
 */
export const downloadFromBase64 = (imgBase64: string, fileName: string) => {
    const link = document.createElement('a')
    link.setAttribute('href', imgBase64)
    link.setAttribute('download', fileName)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
        document.body.removeChild(link)
    }, 1000)
}

/**
 * @description
 * @param arrayObject
 * @param property
 * @returns {Array}
 */
export const filterProperty = (arrayObject: Record<string, string>[], property: string): Array<string> => {
    const array: string[] = []
    arrayObject.forEach((ele) => {
        array.push(ele[property])
    })
    return array
}

/**
 * @description XML注入securityVer属性
 * @returns {string}
 */
export const getSecurityVer = () => {
    const userSessionStore = useUserSessionStore()
    return userSessionStore.sesionKey ? " securityVer='" + userSessionStore.securityVer + "'" : ''
}

/**
 * @description XML包裹CDATA
 * @param str
 * @returns {string}
 */
export const wrapCDATA = (str: string) => {
    return `<![CDATA[${str}]]>`
}

/**
 * @description XML包裹ENUM值
 * @returns {string}
 */
export const wrapEnums = (array: string[] | SelectOption<any, any>[]) => {
    if (array.length && typeof array[0] === 'string') {
        return array.map((item) => `<enum>${item}</enum>`).join('')
    } else {
        return array.map((item) => `<enum>${String((item as SelectOption<any, any>).value)}</enum>`).join('')
    }
}

export const ternary = (condition: boolean | number | string | undefined | null, trueResult = '', falseResult = '') => {
    return condition ? trueResult : falseResult
}

/**
 * @description 获取通道列表
 * @param options（options为过滤条件）
 * @returns {promise}
 */
export const getChlList = (options: Partial<QueryNodeListDto>) => {
    const data = rawXml`
        <types>
            <nodeType>
                <enum>chls</enum>
                <enum>sensors</enum>
                <enum>alarmOuts</enum>
            </nodeType>
        </types>
        ${ternary(options.pageIndex, `<pageIndex>${options.pageIndex}</pageIndex>`)}
        ${ternary(options.pageSize, `<pageSize>${options.pageSize}</pageSize>`)}
        <nodeType type='nodeType'>${options.nodeType || 'chls'}</nodeType>
        <condition>
            ${ternary(options.chlName, `<name>${wrapCDATA(options.chlName!)}</name>`)}
            ${ternary(options.isSupportPtz, `<supportPtz/>`)}
            ${ternary(options.isSupportPtzGroupTraceTask, `<supportPTZGroupTraceTask/>`)}
            ${ternary(options.isSupportTalkback, `<supportTalkback/>`)}
            ${ternary(options.isSupportOsc, `<supportOsc/>`)}
            ${ternary(options.isSupportSnap, '<supportSnap/>')}
            ${ternary(options.isSupportVfd, '<supportVfd/>')}
            ${ternary(options.isSupportBackEndVfd, '<supportBackEndVfd/>')}
            ${ternary(options.isSupportCpc, '<supportCpc/>')}
            ${ternary(options.isSupportCdd, '<supportCdd/>')}
            ${ternary(options.isSupportIpd, '<supportIpd/>')}
            ${ternary(options.isSupportAvd, '<supportAvd/>')}
            ${ternary(options.isSupportPea, '<supportPea/>')}
            ${ternary(options.isSupportTripwire, '<supportTripwire/>')}
            ${ternary(options.isSupportImageRotate, '<supportImageRotate/>')}
            ${ternary(options.isSupportFishEye, '<supportFishEye/>')}
            ${ternary(options.isSupportMotion, '<supportMotion/>')}
            ${ternary(options.isSupportOsd, '<supportOsd/>')}
            ${ternary(options.isSupportAudioSetting, '<supportAudioSetting/>')}
            ${ternary(options.isSupportMaskSetting, '<supportMaskSetting/>')}
            ${ternary(options.isSupportImageSetting, '<supportImageSetting/>')}
            ${ternary(options.isSupportWhiteLightAlarmOut, '<supportWhiteLightAlarmOut/>')}
            ${ternary(options.isSupportAudioAlarmOut, '<supportAudioAlarmOut/>')}
            ${ternary(options.isSupportAudioDev, '<supportAudioDev/>')}
            ${ternary(options.isSupportAOIEntry, '<supportAOIEntry/>')}
            ${ternary(options.isSupportAOILeave, '<supportAOILeave/>')}
            ${ternary(options.isSupportPassLine, '<supportPassLine/>')}
            ${ternary(options.isSupportVehiclePlate, '<supportVehiclePlate/>')}
            ${ternary(options.isSupportAutoTrack, '<supportAutoTrack/>')}
            ${ternary(options.isSupportAccessControl, '<supportAccessControl/>')}
            ${ternary(options.isContainsDeletedItem, '<containsDeletedItem/>')}
            ${ternary(options.authList, `<auth relation='or'>${options.authList}</auth>`)}
            ${ternary(options.chlType, `<chlType type='chlType'>${options.chlType}</chlType>`)}
            ${ternary(options.ignoreNdChl, '<ignoreNdChl/>')}
        </condition>
        <requireField>
            <name/>
            <chlIndex/>
            <chlType/>
            ${options.requireField ? options.requireField.map((ele) => `<${ele}/>`).join('') : ''}
        </requireField>
    `
    return queryNodeList(getXmlWrapData(data))
}

/**
 * @description 通用的加载数据请求处理
 * @param {XMLDocument} $response 响应数据
 * @param {Function} successHandler 成功回调
 * @param {Function} failedHandler 失败回调
 */
export const commLoadResponseHandler = ($response: any, successHandler?: (result: (path: string) => XmlResult) => void, failedHandler?: (result: (path: string) => XmlResult) => void) => {
    return new Promise((resolve: ($: (path: string) => XmlResult) => void, reject: ($: (path: string) => XmlResult) => void) => {
        const Translate = useLangStore().Translate
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const $ = queryXml($response)
        if ($('status').text() == 'success') {
            successHandler && successHandler($)
            resolve($)
        } else {
            openMessageTipBox({
                type: 'info',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_QUERY_DATA_FAIL'),
                showCancelButton: false,
            }).then(() => {
                failedHandler && failedHandler($)
                reject($)
            })
        }
    })
}

/**
 * @description 通用的保存数据请求处理
 * @param {XMLDocument} $response 响应数据
 * @param {Function} successHandler 成功回调
 * @param {Function} failedHandler 失败回调
 */
export const commSaveResponseHadler = ($response: ApiResult, successHandler?: (result: (path: string) => XmlResult) => void, failedHandler?: (result: (path: string) => XmlResult) => void) => {
    return new Promise((resolve: ($: (path: string) => XmlResult) => void, reject: ($: (path: string) => XmlResult) => void) => {
        const Translate = useLangStore().Translate
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const $ = queryXml($response)
        if ($('/response/status').text() == 'success') {
            openMessageTipBox({
                type: 'success',
                title: Translate('IDCS_SUCCESS_TIP'),
                message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                showCancelButton: false,
            }).then(() => {
                successHandler && successHandler($)
                resolve($)
            })
        } else {
            openMessageTipBox({
                type: 'info',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_SAVE_DATA_FAIL'),
                showCancelButton: false,
            }).then(() => {
                failedHandler && failedHandler($)
                reject($)
            })
        }
    })
}

/**
 * 通用的多个保存数据请求处理
 * @param responseList 返回结果列表
 * @param successHandler 成功回调
 * @param failedHandler 失败回调
 * @returns 结果的promise对象
 */
export const commMutiSaveResponseHadler = (
    responseList: ApiResult[],
    successHandler?: (result: ((path: string) => XmlResult)[]) => void,
    failedHandler?: (result: ((path: string) => XmlResult)[]) => void,
) => {
    let allSuccess = true
    const responseXmlList: ((path: string) => XmlResult)[] = []
    responseList.forEach((item) => {
        const resultXml = queryXml(item as ApiResult)
        responseXmlList.push(resultXml)
        if (resultXml('status').text() !== 'success') {
            allSuccess = false
            return
        }
    })
    const Translate = useLangStore().Translate
    const openMessageTipBox = useMessageBox().openMessageTipBox

    return new Promise((resolve: (responseXmlList: ((path: string) => XmlResult)[]) => void, reject: (responseXmlList: ((path: string) => XmlResult)[]) => void) => {
        if (allSuccess) {
            openMessageTipBox({
                type: 'success',
                title: Translate('IDCS_SUCCESS_TIP'),
                message: Translate('IDCS_SAVE_DATA_SUCCESS'),
            }).then(() => {
                successHandler && successHandler(responseXmlList)
                resolve(responseXmlList)
            })
        } else {
            openMessageTipBox({
                type: 'info',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_SAVE_DATA_FAIL'),
            }).then(() => {
                failedHandler && failedHandler(responseXmlList)
                reject(responseXmlList)
            })
        }
    })
}

/**
 * 对比两个数组有差异的行
 * @param arr1 对比数组1
 * @param arr2 对比数组2
 * @returns 返回 arr1 中相比 arr2 有差异的行
 */
export const getArrayDiffRows = (arr1: Record<string, any>[], arr2: Record<string, any>[], compareKeys?: string[]): Record<string, any>[] => {
    const diffRows: Record<string, any>[] = []
    for (let i = 0; i < arr1.length && i < arr2.length; i++) {
        const item1 = arr1[i]
        const item2 = arr2[i]

        if (!compareKeys) {
            compareKeys = Object.keys(item1)
        }

        compareKeys.forEach((key) => {
            if (item1[key] !== item2[key]) {
                diffRows.push(item1)
                return
            }
        })
    }
    return diffRows
}

/**
 * @description 公历转换成波斯日历
 * @param {any} date 公历日期对象
 * @return {object} 波斯历日期对象
 */
export const parseDateToPersianCalendar = (date: any) => {
    if (typeof date === 'string') {
        const dateParts = date.match(new RegExp('^(\\d{1,4})-(\\d{1,2})-(\\d{1,2})$'))
        date = dateParts && dateParts.length === 4 ? new Date(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3])) : null
    }
    if (!(date instanceof Date)) {
        return null
    }

    const pj = (year: number, month: number, day: number) => {
        const a = year - 474
        const b = a - 2820 * Math.floor(a / 2820) + 474
        return 1948321 - 1 + 1029983 * Math.floor(a / 2820) + 365 * (b - 1) + Math.floor((682 * b - 110) / 2816) + (month > 6 ? 30 * month + 6 : 31 * month) + day
    }
    const julianDay = Math.floor((new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 1, 1).getTime() + 210866803200000) / (24 * 60 * 60 * 1000))
    const a = julianDay - pj(475, 0, 1)
    const b = Math.floor(a / 1029983)
    const c = a - 1029983 * Math.floor(a / 1029983)
    const d = c !== 1029982 ? Math.floor((2816 * c + 1031337) / 1028522) : 2820
    const year = 474 + 2820 * b + d
    const f = 1 + julianDay - pj(year, 0, 1)
    const month = f > 186 ? Math.ceil((f - 6) / 30) - 1 : Math.ceil(f / 31) - 1
    const day = julianDay - (pj(year, month, 1) - 1)
    const r = (year << 16) | (month << 8) | day
    const persianYear = r >> 16
    const persianMonth = (r & 0xff00) >> 8
    const persianDay = r & 0xff
    return { year: persianYear > 0 ? persianYear : persianYear - 1, month: persianMonth, day: persianDay }
}

/**
 * @description 波斯日历转换成公历
 * @param {any} persianDate 波斯历日期对象
 * @return {Date} 公历日期对象
 */
export const parsePersianCalendartoDate = (persianDate: any) => {
    if (typeof persianDate === 'string') {
        const persianDateParts = persianDate.match(new RegExp('^(\\d{1,4})-(\\d{1,2})$'))
        persianDate =
            persianDateParts && persianDateParts.length === 3
                ? {
                      year: Number(persianDateParts[1]),
                      month: Number(persianDateParts[2]) - 1,
                      day: 1,
                  }
                : null
    }
    if (typeof persianDate !== 'object' || typeof persianDate['year'] !== 'number' || typeof persianDate['month'] !== 'number' || typeof persianDate['day'] !== 'number') {
        return null
    }

    const pj = (year: number, month: number, day: number) => {
        const a = year - 474
        const b = a - 2820 * Math.floor(a / 2820) + 474
        return 1948321 - 1 + 1029983 * Math.floor(a / 2820) + 365 * (b - 1) + Math.floor((682 * b - 110) / 2816) + (month > 6 ? 30 * month + 6 : 31 * month) + day
    }
    const julianDay = pj(persianDate['year'] > 0 ? persianDate['year'] : persianDate['year'] + 1, persianDate['month'], persianDate['day'])
    const date = new Date()
    const baseTime = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate(), 8, 1, 1).getTime()
    return new Date(julianDay * 24 * 60 * 60 * 1000 + (baseTime + 210866803200000 - 24 * 60 * 60 * 1000 * Math.floor((baseTime + 210866803200000) / (24 * 60 * 60 * 1000))) - 210866803200000)
}

/**
 * @description 根据某个日期，获取某月的最后一天
 * @param {string} timeFormat 某个日期时间字符串：yyyy/MM/dd
 * @return {Date} 某月最后一天的日期
 */
export const getOneMonthLastDay = (timeFormat: string) => {
    const oneDayMilliseconds = 24 * 60 * 60 * 1000
    // 解决IE不能new Date("year/month")的问题
    const timeFormatArr = timeFormat.replace(/-/g, '/').split('/')
    if (timeFormatArr.length === 2) {
        timeFormatArr.push('01')
    }
    // new Date("year/month/day")
    const currentDate = new Date(timeFormatArr.join('/'))
    const nextMonth = currentDate.getMonth() + 1
    const nextMonthFirstDay = new Date(currentDate.getFullYear(), nextMonth, 1).getTime()
    return new Date(nextMonthFirstDay - oneDayMilliseconds)
}

/**
 * @description 获取某月的所有天（若当月还没过完，则获取的是当月至今所有的天）
 * @param {string, string} (day1, day2, attendanceCycleDayArr) 日期时间字符串：yyyy/MM/dd
 * @return {Array} 某月所有的日期组成的数组
 */
export const getOneMonthAllDay = (day1: string, day2: string, attendanceCycleDayArr?: number[]) => {
    const getDate = (str: string) => {
        const tempDate = new Date()
        const list = str.replace(/-/g, '/').split('/')
        tempDate.setFullYear(Number(list[0]))
        tempDate.setMonth(Number(list[1]) - 1)
        tempDate.setDate(Number(list[2]))
        return tempDate
    }

    let date1 = getDate(day1)
    let date2 = getDate(day2)
    if (date1 > date2) {
        const tempDate = date1
        date1 = date2
        date2 = tempDate
    }
    date1.setDate(date1.getDate() + 1)

    let dateArr: any[] = []
    let i = 0
    let temp = 0
    if (day1 === day2) {
        dateArr.push(day1)
    } else {
        while (!(date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate())) {
            if (temp > 1000) {
                break
            }
            let dayStr = date1.getDate().toString()
            if (dayStr.length === 1) {
                dayStr = '0' + dayStr
            }
            dateArr[i] = date1.getFullYear() + '/' + (date1.getMonth() + 1) + '/' + dayStr
            i++
            date1.setDate(date1.getDate() + 1)
            temp++
        }
        dateArr.splice(0, 0, day1)
        dateArr.push(day2)
        const dateArr1: any[] = []
        dateArr.forEach((element) => {
            if (new Date(element.replace(/-/g, '/')).getTime() - new Date().getTime() < 0) {
                dateArr1.push(element.replace(/-/g, '/'))
            }
        })
        dateArr = dateArr1
    }
    // attendanceCycleDayArr: 考勤周期[0, 1, 2, 3, 4, 5, 6]
    if (attendanceCycleDayArr) {
        const dateArr1: any[] = []
        dateArr.forEach((element) => {
            const _dateArr = element.replace(/-/g, '/').split('/')
            const _month = _dateArr[1] < 10 && _dateArr[1].length === 1 ? '0' + _dateArr[1] : _dateArr[1]
            _dateArr[1] = _month
            const _date = _dateArr.join('/')
            const _day = new Date(_date.replace(/-/g, '/')).getDay()
            if (attendanceCycleDayArr.indexOf(_day) > -1) {
                dateArr1.push(_date.replace(/-/g, '/'))
            }
        })
        dateArr = dateArr1
    }
    return dateArr
}

/**
 * @description 检测重启
 * @returns {NodeJS.Timeout}
 */
export const reconnect = () => {
    const { openMessageTipBox } = useMessageBox()
    const { Translate } = useLangStore()
    const pluginStore = usePluginStore()
    const { closeLoading, LoadingTarget } = useLoading()

    if (APP_TYPE === 'STANDARD') {
        return setTimeout(() => {
            reconnectStandard(() => {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_LOGIN_OVERTIME'),
                }).then(() => {
                    closeLoading(LoadingTarget.FullScreen)
                    Logout()
                })
            })
        }, 150000)
    } else {
        pluginStore.isReconn = true
        return setTimeout(() => 0)
    }
}

/**
 * @description 检测重启 (Standard)
 * @param {Function} callback
 */
const reconnectStandard = async (callback?: () => void) => {
    httpConnectionTest()
        .then(() => {
            if (callback) callback()
        })
        .catch(() => {
            setTimeout(function () {
                reconnectStandard(callback)
            }, 5000)
        })
}

/**
 * @description: 构建排程选择列表
 * @return {*}
 */
export const buildScheduleList = async () => {
    const Translate = useLangStore().Translate
    const result = await queryScheduleList()
    let scheduleList = [] as SelectOption<string, string>[]
    commLoadResponseHandler(result, async ($) => {
        scheduleList = $('/response/content/item').map((item) => {
            return {
                value: item.attr('id')!,
                label: item.text(),
            }
        })
        scheduleList.push(
            {
                value: '',
                label: `<${Translate('IDCS_NULL')}>`,
            },
            {
                value: 'scheduleMgr',
                label: Translate('IDCS_SCHEDULE_MANAGE'),
            },
        )
    })
    return scheduleList
}

/**
 * @description: 将分钟转换为 x小时x分 的翻译
 * @param {number} value
 * @return {*}
 */
export const getTranslateForMin = (value: number) => {
    const Translate = useLangStore().Translate
    return getTranslateForTime(value, Translate('IDCS_HOUR'), Translate('IDCS_HOURS'), Translate('IDCS_MINUTE'), Translate('IDCS_MINUTES'))
}

/**
 * @description: 将秒转换为 x小时x分 的翻译
 * @param {number} value
 * @return {*}
 */
export const getTranslateForSecond = (value: number) => {
    const Translate = useLangStore().Translate
    return getTranslateForTime(value, Translate('IDCS_MINUTE'), Translate('IDCS_MINUTES'), Translate('IDCS_SECONDS'), Translate('IDCS_SECOND'))
}

/**
 * @description: 获取时长翻译
 * @param {number} value
 * @return {*}
 */
const getTranslateForTime = (value: number, unit1: string, unit1s: string, unit2: string, unit2s: string) => {
    const t1 = Math.floor(value / 60)
    const t2 = value % 60

    let label = ''
    if (t1 > 0) {
        label += `${t1} ${t1 === 1 ? unit1 : unit1s}`
    }
    if (t2 > 0) {
        label += (t1 > 0 ? ' ' : '') + `${t2} ${t2 === 1 ? unit2 : unit2s}`
    }
    return label
}

/**
 * @description 提示达到搜索最大数量
 * @param $
 */
export const showMaxSearchLimitTips = ($: XMLQuery) => {
    const isMaxSearchResultNum = $('/response/content/IsMaxSearchResultNum').text().toBoolean()
    const { openMessageTipBox } = useMessageBox()
    const { Translate } = useLangStore()

    if (isMaxSearchResultNum) {
        openMessageTipBox({
            type: 'info',
            message: Translate('IDCS_SEARCH_RESULT_LIMIT_TIPS'),
        })
    }
}
