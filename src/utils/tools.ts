/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-04-28 17:57:48
 * @Description: 工具方法
 */

import { type ApiResult } from '@/api/api'
import { type XMLQuery, type XmlResult } from './xmlParse'

export { clamp, cloneDeep, debounce, isEqual } from 'lodash-es'

/**
 * @description: 获取客户端操作系统
 * @return {SystemInfo} platform/version
 */
export const getSystemInfo = (): SystemInfo => {
    const systemInfo: SystemInfo = { platform: 'unknow', version: 'other' }

    const userAgent = navigator.userAgent
    const platform = navigator.platform.toLowerCase()

    const isWin = platform === 'win32' || platform === 'win64' || platform === 'windows'
    const isMac = platform === 'mac68k' || platform === 'macppc' || platform === 'macintosh' || platform === 'macintel'
    const isUnix = platform === 'x11' && !isWin && !isMac
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
            matches = userAgent.match(simpleBrowserList[i].reg)
            if (matches) {
                browserInfo.type = simpleBrowserList[i].name as BrowserType
                browserInfo.version = matches[1]
                break
            }
        }
    }

    if (browserInfo.version) {
        browserInfo.majorVersion = Number(browserInfo.version.split('.')[0])
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
    return window.location.protocol === 'https:'
}

// 判断浏览器是否支持webAssembly
export const isBrowserSupportWasm = () => {
    const userSession = useUserSessionStore()
    return 'WebAssembly' in window && userSession.appType === 'STANDARD'
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
export const wrapEnums = <T extends number | string | boolean, K>(array: string[] | SelectOption<T, K>[]) => {
    if (array.length && typeof array[0] === 'string') {
        return array.map((item) => `<enum>${item}</enum>`).join('')
    } else {
        return array.map((item) => `<enum>${(item as SelectOption<T, K>).value}</enum>`).join('')
    }
}

/**
 * @description base64字符串添加前缀
 * @param {string} str
 * @returns {string}
 */
export const wrapBase64Img = (str: string) => {
    return 'data:image/png;base64,' + str
}

/**
 * @description 获取通道列表
 * @param options（options为过滤条件）
 * @returns {promise}
 */
export const getChlList = (options: Partial<ChannelQueryNodeListDto> = {}) => {
    const data = rawXml`
        <types>
            <nodeType>
                <enum>chls</enum>
                <enum>sensors</enum>
                <enum>alarmOuts</enum>
                <enum>voices</enum>
            </nodeType>
            <chlType>
                <enum>analog</enum>
                <enum>digital</enum>
                <enum>all</enum>
            </chlType>
        </types>
        ${options.pageIndex ? `<pageIndex>${options.pageIndex}</pageIndex>` : ''}
        ${options.pageSize ? `<pageSize>${options.pageSize}</pageSize>` : ''}
        <nodeType type='nodeType'>${options.nodeType || 'chls'}</nodeType>
        <condition>
            ${options.chlName ? `<name>${wrapCDATA(options.chlName)}</name>` : ''}
            ${options.isSupportPtz ? '<supportPtz/>' : ''}
            ${options.isSupportPtzGroupTraceTask ? '<supportPTZGroupTraceTask/>' : ''}
            ${options.isSupportTalkback ? '<supportTalkback/>' : ''}
            ${options.isSupportOsc ? '<supportOsc/>' : ''}
            ${options.isSupportSnap ? '<supportSnap/>' : ''}
            ${options.isSupportVfd ? '<supportVfd/>' : ''}
            ${options.isSupportBackEndVfd ? '<supportBackEndVfd/>' : ''}
            ${options.isSupportCpc ? '<supportCpc/>' : ''}
            ${options.isSupportCdd ? '<supportCdd/>' : ''}
            ${options.isSupportIpd ? '<supportIpd/>' : ''}
            ${options.isSupportAvd ? '<supportAvd/>' : ''}
            ${options.isSupportPea ? '<supportPea/>' : ''}
            ${options.isSupportTripwire ? '<supportTripwire/>' : ''}
            ${options.isSupportImageRotate ? '<supportImageRotate/>' : ''}
            ${options.isSupportFishEye ? '<supportFishEye/>' : ''}
            ${options.isSupportFishEyeConfig ? '<supportFishEyeConfig/>' : ''}
            ${options.isSupportMotion ? '<supportMotion/>' : ''}
            ${options.isSupportOsd ? '<supportOsd/>' : ''}
            ${options.isSupportAudioSetting ? '<supportAudioSetting/>' : ''}
            ${options.isSupportMaskSetting ? '<supportMaskSetting/>' : ''}
            ${options.isSupportImageSetting ? '<supportImageSetting/>' : ''}
            ${options.isSupportWhiteLightAlarmOut ? '<supportWhiteLightAlarmOut/>' : ''}
            ${options.isSupportAudioAlarmOut ? '<supportAudioAlarmOut/>' : ''}
            ${options.isSupportAudioDev ? '<supportAudioDev/>' : ''}
            ${options.isSupportAOIEntry ? '<supportAOIEntry/>' : ''}
            ${options.isSupportAOILeave ? '<supportAOILeave/>' : ''}
            ${options.isSupportPassLine ? '<supportPassLine/>' : ''}
            ${options.isSupportVehiclePlate ? '<supportVehiclePlate/>' : ''}
            ${options.isSupportRegionStatistics ? '<supportRegionStatistics/>' : ''}
            ${options.isSupportAutoTrack ? '<supportAutoTrack/>' : ''}
            ${options.isSupportAccessControl ? '<supportAccessControl/>' : ''}
            ${options.isSupportVehicleDirection ? '<supportVehicleDirection/>' : ''}
            ${options.isSupportRS485Ptz ? '<supportRS485Ptz/>' : ''}
            ${options.isContainsDeletedItem ? '<containsDeletedItem/>' : ''}
            ${options.authList ? `<auth relation='or'>${options.authList}</auth>` : ''}
            ${options.chlType ? `<chlType type='chlType'>${options.chlType}</chlType>` : ''}
            ${options.ignoreNdChl ? '<ignoreNdChl/>' : ''}
        </condition>
        <requireField>
            ${Array.from(new Set(['name', 'chlIndex', 'chlType'].concat(options.requireField || [])))
                .map((ele) => `<${ele}/>`)
                .join('')}
        </requireField>
    `
    return queryNodeList(data)
}

/**
 * @description 传入当前页的路由 检测通道能力集. AI智能事件跳转时,若当前没有通道支持则提示添加通道不进行页面跳转
 * @param {string} route
 * @returns {Promise<Boolean>}
 */
export const checkChlListCaps = async (route: string) => {
    const systemCaps = useCababilityStore()

    if (route.includes('faceRecognition') || route.includes('vehicleRecognition') || route.includes('boundary') || route.includes('more') || route.includes('videoStructure')) {
    } else {
        return false
    }

    // 通过能力集判断设备是否支持人脸后侦测
    const localFaceDectEnabled = systemCaps.localFaceDectMaxCount !== 0
    const localTargetDectEnabled = systemCaps.localTargetDectMaxCount !== 0

    openLoading()

    const resultOnline = await queryOnlineChlList()
    const $online = queryXml(resultOnline)
    const onlineList = $online('content/item').map((item) => item.attr('id'))

    const result = await getChlList({
        requireField: [
            'supportVfd',
            'supportVehiclePlate',
            'supportAOIEntry',
            'supportAOILeave',
            'supportTripwire',
            'supportPea',
            'supportPeaTrigger',
            'supportAvd',
            'supportCdd',
            'supportOsc',
            'supportPassLine',
            'supportPassLine',
            'protocolType',
        ],
    })
    const $ = queryXml(result)

    closeLoading()

    const supportFlag = $('content/item').some((item) => {
        const $item = queryXml(item.element)
        const protocolType = $('protocolType').text()
        const factoryName = $('productModel').attr('factoryName')
        if (factoryName === 'Recorder') {
            return false
        }
        const chlId = item.attr('id')
        if (protocolType !== 'RTSP' && onlineList.includes(chlId)) {
            const supportOsc = $item('supportOsc').text().bool()
            const supportCdd = $item('supportCdd').text().bool()
            const supportVfd = $item('supportVfd').text().bool()
            const supportAvd = $item('supportAvd').text().bool()
            const supportPea = $item('supportPea').text().bool()
            const supportPeaTrigger = $item('supportPeaTrigger').text().bool()
            const supportTripwire = $item('supportTripwire').text().bool()
            const supportAOIEntry = $item('supportAOIEntry').text().bool()
            const supportAOILeave = $item('supportAOILeave').text().bool()
            const supportVehiclePlate = $item('supportVehiclePlate').text().bool()
            const supportPassLine = $item('supportPassLine').text().bool()
            const supportCpc = $item('supportCpc').text().bool()
            let supportBackVfd = false
            if (localFaceDectEnabled && !supportVfd) {
                supportBackVfd = true
            }

            if (
                supportBackVfd ||
                supportVfd ||
                supportVehiclePlate ||
                supportTripwire ||
                supportPea ||
                supportPeaTrigger ||
                supportAOIEntry ||
                supportAOILeave ||
                localTargetDectEnabled ||
                supportOsc ||
                supportCdd ||
                supportPassLine ||
                supportAvd ||
                supportCpc
            ) {
                return true
            }
            return false
        }
    })

    return supportFlag
}

export const commResponseHandler = (response: ApiResult) => {
    return new Promise((resolve: ($: XMLQuery) => void, reject: ($: XMLQuery) => void) => {
        const $ = queryXml(response)
        if ($('status').text() === 'success') {
            resolve($)
        } else {
            reject($)
        }
    })
}

/**
 * @description 通用的加载数据请求处理
 * @param {XMLDocument} $response 响应数据
 * @param {Function} successHandler 成功回调
 * @param {Function} failedHandler 失败回调
 */
export const commLoadResponseHandler = (
    $response: ApiResult,
    successHandler?: (result: (path: string) => XmlResult) => void,
    failedHandler?: (result: (path: string) => XmlResult) => void,
): Promise<XMLQuery> => {
    const Translate = useLangStore().Translate
    return commResponseHandler($response)
        .then(($) => {
            successHandler && successHandler($)
            return Promise.resolve($)
        })
        .catch(($) => {
            const errorCode = $('errorCode').text().num()
            let errorInfo = Translate('IDCS_QUERY_DATA_FAIL')
            switch (errorCode) {
                case ErrorCode.USER_ERROR_NO_USER:
                case ErrorCode.USER_ERROR_PWD_ERR:
                    errorInfo = Translate('IDCS_LOGIN_FAIL_REASON_U_P_ERROR')
                    break
                case ErrorCode.USER_ERROR_SERVER_NO_EXISTS:
                    errorInfo = Translate('IDCS_LOGIN_OVERTIME')
                    break
                case ErrorCode.USER_ERROR_NO_AUTH:
                    errorInfo = Translate('IDCS_NO_PERMISSION')
                    break
                case ErrorCode.USER_ERROR_INVALID_PARAM:
                    errorInfo = Translate('IDCS_USER_ERROR_INVALID_PARAM')
                    break
                default:
                    break
            }
            return openMessageBox(errorInfo).then(() => {
                failedHandler && failedHandler($)
                return Promise.reject($)
            })
        })
}

/**
 * @description 通用的保存数据请求处理
 * @param {XMLDocument} $response 响应数据
 * @param {Function} successHandler 成功回调
 * @param {Function} failedHandler 失败回调
 */
export const commSaveResponseHandler = ($response: ApiResult, successHandler?: (result: XMLQuery) => void, failedHandler?: (result: XMLQuery) => void) => {
    const Translate = useLangStore().Translate
    commResponseHandler($response)
        .then(($) =>
            openMessageBox({
                type: 'success',
                message: Translate('IDCS_SAVE_DATA_SUCCESS'),
            }).finally(() => {
                successHandler && successHandler($)
            }),
        )
        .catch(($) =>
            openMessageBox(Translate('IDCS_SAVE_DATA_FAIL')).finally(() => {
                failedHandler && failedHandler($)
            }),
        )
}

/**
 * @description 通用的删除数据请求处理
 * @param {XMLDocument} $response 响应数据
 * @param {Function} successHandler 成功回调
 * @param {Function} failedHandler 失败回调
 */
export const commDelResponseHandler = ($response: ApiResult, successHandler?: (result: XMLQuery) => void, failedHandler?: (result: XMLQuery) => void) => {
    const Translate = useLangStore().Translate
    commResponseHandler($response)
        .then(($) =>
            openMessageBox({
                type: 'success',
                message: Translate('IDCS_DELETE_SUCCESS'),
            }).finally(() => {
                successHandler && successHandler($)
            }),
        )
        .catch(($) =>
            openMessageBox(Translate('IDCS_DELETE_FAIL')).finally(() => {
                failedHandler && failedHandler($)
            }),
        )
}

/**
 * 通用的多个保存数据请求处理
 * @param responseList 返回结果列表
 * @param successHandler 成功回调
 * @param failedHandler 失败回调
 * @returns 结果的promise对象
 */
export const commMutiSaveResponseHandler = (responseList: ApiResult[], successHandler?: (result: XMLQuery[]) => void, failedHandler?: (result: XMLQuery[]) => void) => {
    let allSuccess = true
    const responseXmlList: XMLQuery[] = []
    responseList.forEach((item) => {
        const $ = queryXml(item)
        responseXmlList.push($)
        if ($('status').text() !== 'success') {
            allSuccess = false
            return
        }
    })
    const Translate = useLangStore().Translate

    return new Promise((resolve: (responseXmlList: XMLQuery[]) => void, reject: (responseXmlList: XMLQuery[]) => void) => {
        if (allSuccess) {
            openMessageBox({
                type: 'success',
                message: Translate('IDCS_SAVE_DATA_SUCCESS'),
            }).finally(() => {
                successHandler && successHandler(responseXmlList)
                resolve(responseXmlList)
            })
        } else {
            openMessageBox(Translate('IDCS_SAVE_DATA_FAIL')).finally(() => {
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
 * @deprecated use dayjs
 * @description 公历转换成波斯日历
 * @param {any} date 公历日期对象
 * @return {object} 波斯历日期对象
 */
// export const parseDateToPersianCalendar = (date: any) => {
//     if (typeof date === 'string') {
//         const dateParts = date.match(new RegExp('^(\\d{1,4})-(\\d{1,2})-(\\d{1,2})$'))
//         date = dateParts && dateParts.length === 4 ? new Date(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3])) : null
//     }

//     if (!(date instanceof Date)) {
//         return null
//     }

//     const pj = (year: number, month: number, day: number) => {
//         const a = year - 474
//         const b = a - 2820 * Math.floor(a / 2820) + 474
//         return 1948321 - 1 + 1029983 * Math.floor(a / 2820) + 365 * (b - 1) + Math.floor((682 * b - 110) / 2816) + (month > 6 ? 30 * month + 6 : 31 * month) + day
//     }
//     const julianDay = Math.floor((new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 1, 1).getTime() + 210866803200000) / (24 * 60 * 60 * 1000))
//     const a = julianDay - pj(475, 0, 1)
//     const b = Math.floor(a / 1029983)
//     const c = a - 1029983 * Math.floor(a / 1029983)
//     const d = c !== 1029982 ? Math.floor((2816 * c + 1031337) / 1028522) : 2820
//     const year = 474 + 2820 * b + d
//     const f = 1 + julianDay - pj(year, 0, 1)
//     const month = f > 186 ? Math.ceil((f - 6) / 30) - 1 : Math.ceil(f / 31) - 1
//     const day = julianDay - (pj(year, month, 1) - 1)
//     const r = (year << 16) | (month << 8) | day
//     const persianYear = r >> 16
//     const persianMonth = (r & 0xff00) >> 8
//     const persianDay = r & 0xff
//     return { year: persianYear > 0 ? persianYear : persianYear - 1, month: persianMonth, day: persianDay }
// }

/**
 * @deprecated use dayjs
 * @description 波斯日历转换成公历
 * @param {any} persianDate 波斯历日期对象
 * @return {Date} 公历日期对象
 */
// export const parsePersianCalendartoDate = (persianDate: any) => {
//     if (typeof persianDate === 'string') {
//         const persianDateParts = persianDate.match(new RegExp('^(\\d{1,4})-(\\d{1,2})$'))
//         persianDate =
//             persianDateParts && persianDateParts.length === 3
//                 ? {
//                       year: Number(persianDateParts[1]),
//                       month: Number(persianDateParts[2]) - 1,
//                       day: 1,
//                   }
//                 : null
//     }

//     if (typeof persianDate !== 'object' || typeof persianDate.year !== 'number' || typeof persianDate.month !== 'number' || typeof persianDate.day !== 'number') {
//         return null
//     }

//     const pj = (year: number, month: number, day: number) => {
//         const a = year - 474
//         const b = a - 2820 * Math.floor(a / 2820) + 474
//         return 1948321 - 1 + 1029983 * Math.floor(a / 2820) + 365 * (b - 1) + Math.floor((682 * b - 110) / 2816) + (month > 6 ? 30 * month + 6 : 31 * month) + day
//     }
//     const julianDay = pj(persianDate.year > 0 ? persianDate.year : persianDate.year + 1, persianDate.month, persianDate.day)
//     const date = new Date()
//     const baseTime = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate(), 8, 1, 1).getTime()
//     return new Date(julianDay * 24 * 60 * 60 * 1000 + (baseTime + 210866803200000 - 24 * 60 * 60 * 1000 * Math.floor((baseTime + 210866803200000) / (24 * 60 * 60 * 1000))) - 210866803200000)
// }

/**
 * @deprecated use dayjs
 * @description 根据某个日期，获取某月的最后一天
 * @param {string} timeFormat 某个日期时间字符串：yyyy/MM/dd
 * @return {Date} 某月最后一天的日期
 */
// export const getOneMonthLastDay = (timeFormat: string) => {
//     const oneDayMilliseconds = 24 * 60 * 60 * 1000
//     // 解决IE不能new Date("year/month")的问题
//     const timeFormatArr = timeFormat.replace(/-/g, '/').split('/')
//     if (timeFormatArr.length === 2) {
//         timeFormatArr.push('01')
//     }
//     // new Date("year/month/day")
//     const currentDate = new Date(timeFormatArr.join('/'))
//     const nextMonth = currentDate.getMonth() + 1
//     const nextMonthFirstDay = new Date(currentDate.getFullYear(), nextMonth, 1).getTime()
//     return new Date(nextMonthFirstDay - oneDayMilliseconds)
// }

/**
 * @deprecated use dayjs
 * @description 获取某月的所有天（若当月还没过完，则获取的是当月至今所有的天）
 * @param {string, string} (day1, day2, attendanceCycleDayArr) 日期时间字符串：yyyy/MM/dd
 * @return {Array} 某月所有的日期组成的数组
 */
// export const getOneMonthAllDay = (day1: string, day2: string, attendanceCycleDayArr?: number[]) => {
//     const getDate = (str: string) => {
//         const tempDate = new Date()
//         const list = str.replace(/-/g, '/').split('/')
//         tempDate.setFullYear(Number(list[0]))
//         tempDate.setMonth(Number(list[1]) - 1)
//         tempDate.setDate(Number(list[2]))
//         return tempDate
//     }

//     let date1 = getDate(day1)
//     let date2 = getDate(day2)
//     if (date1 > date2) {
//         const tempDate = date1
//         date1 = date2
//         date2 = tempDate
//     }
//     date1.setDate(date1.getDate() + 1)

//     let dateArr: any[] = []
//     let i = 0
//     let temp = 0
//     if (day1 === day2) {
//         dateArr.push(day1)
//     } else {
//         while (!(date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate())) {
//             if (temp > 1000) {
//                 break
//             }
//             let dayStr = date1.getDate().toString()
//             if (dayStr.length === 1) {
//                 dayStr = '0' + dayStr
//             }
//             dateArr[i] = date1.getFullYear() + '/' + (date1.getMonth() + 1) + '/' + dayStr
//             i++
//             date1.setDate(date1.getDate() + 1)
//             temp++
//         }
//         dateArr.splice(0, 0, day1)
//         dateArr.push(day2)
//         const dateArr1: any[] = []
//         dateArr.forEach((element) => {
//             if (new Date(element.replace(/-/g, '/')).getTime() - new Date().getTime() < 0) {
//                 dateArr1.push(element.replace(/-/g, '/'))
//             }
//         })
//         dateArr = dateArr1
//     }
//     // attendanceCycleDayArr: 考勤周期[0, 1, 2, 3, 4, 5, 6]
//     if (attendanceCycleDayArr) {
//         const dateArr1: any[] = []
//         dateArr.forEach((element) => {
//             const _dateArr = element.replace(/-/g, '/').split('/')
//             const _month = _dateArr[1] < 10 && _dateArr[1].length === 1 ? '0' + _dateArr[1] : _dateArr[1]
//             _dateArr[1] = _month
//             const _date = _dateArr.join('/')
//             const _day = new Date(_date.replace(/-/g, '/')).getDay()
//             if (attendanceCycleDayArr.indexOf(_day) > -1) {
//                 dateArr1.push(_date.replace(/-/g, '/'))
//             }
//         })
//         dateArr = dateArr1
//     }
//     return dateArr
// }

/**
 * @description 检测重启
 * @returns {NodeJS.Timeout}
 */
export const reconnect = () => {
    const pluginStore = usePluginStore()
    const userSession = useUserSessionStore()

    if (userSession.appType === 'STANDARD') {
        return setTimeout(() => {
            reconnectStandard(() => {
                closeLoading()
                Logout()
            })
        }, 5000)
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
            setTimeout(() => {
                reconnectStandard(callback)
            }, 5000)
        })
}

type ScheduleListOption = {
    isDefault: boolean
    defaultValue: string
}

/**
 * @description 构建排程选择列表
 * @return {SelectOption<string, string>[]}
 */
export const buildScheduleList = async (option: Partial<ScheduleListOption> = {}) => {
    const options = {
        isManager: false,
        isDefault: true,
        defaultValue: DEFAULT_EMPTY_ID,
        ...option,
    }
    const Translate = useLangStore().Translate
    const result = await queryScheduleList()
    const $ = await commLoadResponseHandler(result)
    const scheduleList = $('content/item').map((item) => {
        return {
            value: item.attr('id'),
            label: item.text(),
        }
    })
    if (options.isDefault) {
        scheduleList.push({
            value: options.defaultValue,
            label: `<${Translate('IDCS_NULL')}>`,
        })
    }

    return scheduleList
}

/**
 * @description 判断排程ID是否在排程列表中存在，若存在，返回排程ID，否则返回默认ID
 * @param {SelectOption<string, string>[]} scheduleList
 * @param {string} scheduleId
 * @param {string} defaultScheduleId
 * @return {string}
 */
export const getScheduleId = (scheduleList: SelectOption<string, string>[], scheduleId: string, defaultScheduleId = DEFAULT_EMPTY_ID) => {
    if (scheduleId === '') {
        return defaultScheduleId
    }

    if (scheduleList.some((item) => item.value === scheduleId)) {
        return scheduleId
    }

    return defaultScheduleId
}

/**
 * @description 返回持续时间列表
 * @returns {SelectOption<string, string>[]}
 */
export const getAlarmHoldTimeList = (holdTimeList: string, holdTime: number) => {
    const holdTimeArr = holdTimeList.array().map((item) => Number(item))
    if (!holdTimeArr.includes(holdTime)) {
        holdTimeArr.push(holdTime)
    }
    return holdTimeArr
        .map((value) => {
            return {
                value,
                label: getTranslateForSecond(value),
            }
        })
        .toSorted((a, b) => {
            return a.value - b.value
        })
}

/**
 * @description 构建语音播报列表
 */
export const buildAudioList = async () => {
    const Translate = useLangStore().Translate
    const result = await queryAlarmAudioCfg()
    const $ = await commLoadResponseHandler(result)
    const audioList = $('content/audioList/item').map((item) => {
        const $item = queryXml(item.element)
        return {
            value: item.attr('id'),
            label: $item('name').text(),
        }
    })
    audioList.push({
        value: DEFAULT_EMPTY_ID,
        label: `<${Translate('IDCS_NULL')}>`,
    })
    return audioList
}

/**
 * @description 判断本地声音ID是否在声音列表中存在，若存在，返回本地声音ID，否则返回默认ID
 * @param {SelectOption<string, string>[]} voiceList
 * @param {string} audioId
 * @param {string} defaultAudioId
 * @return {string}
 */
export const getSystemAudioID = getScheduleId

/**
 * @description 构建报警输出通道列表
 */
export const buildAlarmOutChlList = async () => {
    const result = await getChlList({
        requireField: ['device'],
        nodeType: 'alarmOuts',
    })
    const $ = await commLoadResponseHandler(result)
    const alarmOutList = $('content/item').map((item) => {
        const $item = queryXml(item.element)
        let label = $item('name').text()
        if ($item('devDesc').text()) {
            label = $item('devDesc').text() + '_' + label
        }
        return {
            value: item.attr('id'),
            label,
            device: {
                value: $item('device').attr('id'),
                label: $item('device').text(),
            },
        }
    })
    return alarmOutList
}

/**
 * @description 获取录像通道列表
 */
export const buildRecordChlList = async () => {
    const result = await getChlList({
        nodeType: 'chls',
        isSupportSnap: false,
    })
    const $ = await commLoadResponseHandler(result)
    const chlList = $('content/item').map((item) => {
        const $item = queryXml(item.element)
        return {
            label: $item('name').text(),
            value: item.attr('id'),
        }
    })
    return chlList
}

/**
 * @description 获取抓图通道列表
 */
export const buildSnapChlList = async () => {
    const result = await getChlList({
        nodeType: 'chls',
        isSupportSnap: true,
    })
    const $ = await commLoadResponseHandler(result)
    const chlList = $('content/item').map((item) => {
        const $item = queryXml(item.element)
        return {
            label: $item('name').text(),
            value: item.attr('id'),
        }
    })
    return chlList
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
    return getTranslateForTime(value, Translate('IDCS_MINUTE'), Translate('IDCS_MINUTES'), Translate('IDCS_SECOND'), Translate('IDCS_SECONDS'))
}

/**
 * @description: 获取时长翻译
 * @param {number} value
 * @return {string}
 */
const getTranslateForTime = (value: number, unit1: string, unit1s: string, unit2: string, unit2s: string) => {
    value = Math.round(value)

    if (value === 0) {
        return value + unit2s
    }

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
 * @description 获取密码强度提示文本
 */
export const getTranslateForPasswordStrength = (key: keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING) => {
    const Translate = useLangStore().Translate
    switch (key) {
        case 'weak':
            return Translate('IDCS_PASSWORD_STRONG_WEAK').formatForLang(1, 16)
        case 'medium':
            return Translate('IDCS_PASSWORD_STRONG_MIDDLE').formatForLang(8, 16).replaceAll('\n', '<br>')
        case 'strong':
            return Translate('IDCS_PASSWORD_STRONG_HEIGHT').formatForLang(8, 16).replaceAll('\n', '<br>')
        case 'stronger':
            return Translate('IDCS_PASSWORD_STRONG_HEIGHEST').formatForLang(9, 16).replaceAll('\n', '<br>')
        default:
            return ''
    }
}

/**
 * @description 获取通用的开关选项
 * @returns {SelectOption<boolean, string>[]}
 */
export const getBoolSwitchOptions = () => {
    const Translate = useLangStore().Translate
    return DEFAULT_SWITCH_OPTIONS.map((item) => {
        return {
            label: Translate(item.label),
            value: item.value.bool(),
        }
    })
}

/**
 * @description 返回翻译label的选项
 * @param {SelectOption[]} options
 * @returns {SelectOption[]}
 */
export const getTranslateOptions = <K extends string | number | boolean>(options: SelectOption<K, string>[]): SelectOption<K, string>[] => {
    const Translate = useLangStore().Translate
    return options.map((item) => {
        return {
            label: Translate(item.label),
            value: item.value,
        }
    })
}

/**
 * @description 返回翻译value的Record<string, string>
 * @param {Record<string, string>} options
 * @returns {Record<string, string>}
 */
export const getTranslateMapping = (options: Record<string, string>): Record<string, string> => {
    const translatedOptions: Record<string, string> = {}
    const Translate = useLangStore().Translate
    const keys = Object.keys(options)
    keys.forEach((key) => {
        translatedOptions[key] = Translate(options[key])
    })
    return translatedOptions
}

/**
 * @description 提示达到搜索最大数量
 * @param $
 */
export const showMaxSearchLimitTips = ($: XMLQuery, type?: string) => {
    const { Translate } = useLangStore()

    let isMaxSearchResultNum = $('content/IsMaxSearchResultNum').text().bool()
    let maxSearchLimit = $('content/IsMaxSearchResultNum').attr('maxSearchLimit').num() || 150000

    if (type === 'smartSearch') {
        const total = $('content').attr('total').num()
        maxSearchLimit = 10000
        if (total >= 10000) {
            isMaxSearchResultNum = true
        }
    }

    if (isMaxSearchResultNum) {
        const msg = (type === 'smartSearch' ? 'web ' : '') + Translate('IDCS_SEARCH_RESULT_LIMIT_TIPS').formatForLang(maxSearchLimit)
        openMessageBox(msg)
    }
}

type GetBitRateRangeOption = {
    resolution:
        | {
              width: number
              height: number
          }
        | string
    level: string
    fps: number
    maxQoI: number
    videoEncodeType: string
}

/**
 * @description 获取比率范围
 * @param options
 * @returns
 */
export const getBitrateRange = (options: GetBitRateRangeOption) => {
    // 计算分辨率对应参数
    // const resolution = options.resolution
    const videoEncodeType = options.videoEncodeType
    let resolution = { width: 0, height: 0 }
    if (typeof options.resolution === 'string') {
        const resParts = options.resolution.split('x')
        resolution = {
            width: Number(resParts[0]),
            height: Number(resParts[1]),
        }
    } else {
        resolution = options.resolution
    }

    const totalResolution = resolution.width * resolution.height
    if (!totalResolution) {
        return null
    }

    let resParam = Math.floor(totalResolution / (totalResolution >= 1920 * 1080 ? 200000 : 150000))
    if (!resParam) {
        resParam = 0.5
    }

    // 计算图像质量对应参数
    const levelParamMapping: Record<string, number> = {
        highest: 100,
        higher: 67,
        medium: 50,
        lower: 34,
        lowest: 25,
    }

    const levelParam = levelParamMapping[options.level]
    if (!levelParam) {
        return null
    }

    // 根据帧率使用不同公式计算下限和上限
    const minBase = (768 * resParam * levelParam * (options.fps >= 10 ? options.fps : 10)) / 3000
    let min = minBase - (options.fps >= 10 ? 0 : ((10 - options.fps) * minBase * 2) / 27)
    const maxBase = (1280 * resParam * levelParam * (options.fps >= 10 ? options.fps : 10)) / 3000
    let max = maxBase - (options.fps >= 10 ? 0 : ((10 - options.fps) * maxBase * 2) / 27)
    min = options.maxQoI ? (options.maxQoI < min ? options.maxQoI : min) : min
    max = videoEncodeType === 'h265' ? Math.floor(max * 0.55) : Math.floor(max)
    if (videoEncodeType === 'h265' || videoEncodeType === 'h265p' || videoEncodeType === 'h265s') {
        min = Math.floor(min * 0.55)
    } else {
        min = Math.floor(min)
    }

    if (!min || !max) {
        return null
    }

    return { min, max }
}

// 获取base64文件大小，返回MB数字
export const base64FileSize = (base64url: string) => {
    let str = base64url || ''
    const equalIndex = str.indexOf('=')
    if (str.indexOf('=') > 0) {
        str = str.substring(0, equalIndex)
    }
    const strLength = str.length
    const fileLength = strLength - (strLength / 8) * 2
    // 返回单位为MB的大小
    return (fileLength / (1024 * 1024)).toFixed(1)
}

/**
 * @description 填充通道id,获取guid
 * @param {string} id
 * @returns {string} Pstring
 */
export const getChlGuid16 = (id: string) => {
    const arr = ['00000000', '0000', '0000', '0000', '000000000000']
    arr[0] = (arr[0] + id).slice(-8)
    const guid = '{' + arr.join('-') + '}'
    return guid
}

// 根据guid获取通道id，前面的数字为16进制
export const getChlId16 = (guid: string) => {
    try {
        const id = guid.substring(1, 9)
        return parseInt(id, 16)
    } catch (e) {
        return 1
    }
}

/**
 * @description 生成16进制字符随机guid, 格式: {00000000-0000-0000-0000-000000000000}
 * @returns {string} Pstring
 */
export const getRandomGUID = () => {
    const str = '0123456789abcdef'
    const temp = '00000000-0000-0000-0000-000000000000'
    let ret = ''
    for (let i = 0; i < temp.length; i++) {
        if (temp[i] === '-') {
            ret += '-'
            continue
        }
        ret += str[Math.floor(Math.random() * str.length)]
    }
    return `{${ret}}`
}

interface MutexChlDto {
    id: string
    ip: string
    name: string
    accessType: string
}

type MutexOptions = {
    isChange: boolean
    mutexList: AlarmMutexDto[]
    mutexListEx?: AlarmMutexDto[]
    chlList?: AlarmOnlineChlDto[]
    chlIp?: string
    chlName: string
    tips: string
}

/**
 * @description 翻译key值拼接添加空格（排除简体中文、繁体中文）
 * @param {string} str
 * @returns {string}
 */
const joinSpaceForLang = (str: string) => {
    if (!str) return ''
    const { langType } = useLangStore()
    const langTypeList = ['zh-cn', 'zh-tw']
    const currLangType = langType || 'en-us'
    const isInclude = langTypeList.includes(currLangType)
    str = isInclude ? str : str + ' '
    return str
}

const getMutexChlNameObj = (onlineChannelList: MutexChlDto[], chlIp: string, chlName: string) => {
    let normalChlName = ''
    let thermalChlName = ''
    const sameIPChlList = onlineChannelList.filter((chl) => {
        return chl.ip === chlIp
    })
    if (sameIPChlList.length > 1) {
        sameIPChlList.forEach((chl) => {
            if (chl.accessType === '1') {
                thermalChlName = chl.name === chlName ? '' : chl.name
            } else {
                normalChlName = chl.name === chlName ? '' : chl.name
            }
        })
    }
    return {
        normalChlName: normalChlName,
        thermalChlName: thermalChlName,
    }
}

/**
 * @description 查询是否有互斥通道
 */
export const checkMutexChl = async ({ isChange, mutexList, mutexListEx = [], chlList = [], chlIp = '', chlName, tips }: MutexOptions) => {
    if (!isChange) {
        return Promise.resolve()
    }

    const { Translate } = useLangStore()
    const DEFAULT_ALARM_EVENT: Record<string, string> = {
        cdd: Translate('IDCS_CROWD_DENSITY_DETECTION'),
        cpc: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
        ipd: Translate('IDCS_INVADE_DETECTION'),
        tripwire: Translate('IDCS_BEYOND_DETECTION'),
        osc: Translate('IDCS_WATCH_DETECTION'),
        avd: Translate('IDCS_ABNORMAL_DETECTION'),
        perimeter: Translate('IDCS_INVADE_DETECTION'),
        vfd: Translate('IDCS_FACE_DETECTION'),
        aoientry: Translate('IDCS_INVADE_DETECTION'),
        aoileave: Translate('IDCS_INVADE_DETECTION'),
        passlinecount: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
        vehicle: Translate('IDCS_PLATE_DETECTION'),
        fire: Translate('IDCS_FIRE_POINT_DETECTION'),
        vsd: Translate('IDCS_VSD_DETECTION'),
    }

    const switchChangeTypeArr: string[] = []

    if (chlList.length) {
        const mutexChlNameObj = getMutexChlNameObj(chlList, chlIp, chlName)

        mutexList.forEach((item) => {
            if (item.status) {
                const prefixName = mutexChlNameObj.normalChlName ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj.normalChlName) : ''
                const showInfo = prefixName ? prefixName + DEFAULT_ALARM_EVENT[item.object].toLowerCase() : DEFAULT_ALARM_EVENT[item.object].toLowerCase()
                switchChangeTypeArr.push(showInfo)
            }
        })

        mutexListEx.forEach((item) => {
            if (item.status) {
                const prefixName = mutexChlNameObj.thermalChlName ? joinSpaceForLang(Translate('IDCS_CHANNEL') + ':' + mutexChlNameObj.thermalChlName) : ''
                const showInfo = prefixName ? prefixName + DEFAULT_ALARM_EVENT[item.object].toLowerCase() : DEFAULT_ALARM_EVENT[item.object].toLowerCase()
                switchChangeTypeArr.push(showInfo)
            }
        })
    } else {
        mutexList.forEach((item) => {
            if (item.status) {
                switchChangeTypeArr.push(DEFAULT_ALARM_EVENT[item.object].toLowerCase())
            }
        })
    }

    if (switchChangeTypeArr.length) {
        const switchChangeType = switchChangeTypeArr.join(',')
        return openMessageBox({
            type: 'question',
            message: Translate(tips).formatForLang(Translate('IDCS_CHANNEL') + ':' + chlName, switchChangeType),
        })
    } else {
        return Promise.resolve()
    }
}

/**
 * @description 将number[]/string[]转换为SelectOption<number,number>[]/SelectOption<string, string>[]
 * @param {Array} array
 * @returns {SelectOption[]}
 */
export const arrayToOptions = <T>(array: T[]) => {
    return array.map((value) => ({
        label: value,
        value,
    }))
}

/**
 * @description 将Record<string,string>转换为SelectOption<T,string>[]
 * @param {Record} object
 * @param {valueType} string number | string | boolean
 * @returns {SelectOption[]}
 */
export const objectToOptions = <T extends 'number' | 'string' | 'boolean', K extends T extends 'number' ? number : T extends 'boolean' ? boolean : string>(
    object: Record<string, string>,
    valueType: T,
): SelectOption<K, string>[] => {
    return Object.entries(object).map((item) => {
        return {
            label: item[1],
            value: (valueType === 'number' ? item[0].num() : valueType === 'boolean' ? item[0].bool() : item[0]) as K,
        }
    })
}

/**
 * @description INPUT输入框失去焦点
 * @param {Event} event
 */
export const blurInput = (event: Event) => {
    ;(event.target as HTMLInputElement).blur()
}
