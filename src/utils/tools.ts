/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-04-28 17:57:48
 * @Description: 工具方法
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-11 11:55:45
 */

import { type QueryNodeListDto } from '@/types/apiType/channel'
import { type ApiResult } from '@/api/api'
import { type XMLQuery, type XmlResult } from './xmlParse'
import JSZip from 'jszip'
import { type CanvasBasePoint } from './canvas/canvasBase'

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
    return 'WebAssembly' in window && import.meta.env.VITE_APP_TYPE == 'STANDARD'
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

type XlsDesc = {
    colspan: number | string
    content: number | string
}

const createExcelTemplate = (titleArr: string[], contentArr: string[][], xlsDesc?: XlsDesc) => {
    const content = contentArr
        .map((tr) => {
            return `<tr>${tr.map((td) => `<td style='vnd.ms-excel.numberformat:@'>${td}</td>`).join('')}</tr>`
        })
        .join('')
    return rawXml`
        <table cellspacing='0' cellpadding='0' border='1' style='display:none' class="excelTable">
            <thead>
                ${ternary(!!xlsDesc, `<tr><th colspan="${xlsDesc?.colspan}">${xlsDesc?.content}</th></tr>`, '')}
                <tr>${titleArr.map((item) => `<th>${item}</th>`).join('')}</tr>
            </thead>
            <tbody>${content}</tbody>
        </table>
    `
}

export const downloadExcel = (titleArr: string[], contentArr: string[][], fileName?: string, xlsDesc?: XlsDesc) => {
    // 替换table数据和worksheet名字
    const table = createExcelTemplate(titleArr, contentArr, xlsDesc)
    const template =
        "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel'" +
        "xmlns='http://www.w3.org/TR/REC-html40'><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>" +
        `<x:Name>${fileName || 'Worksheet'}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets>` +
        '</x:ExcelWorkbook></xml><![endif]-->' +
        "<style type='text/css'>table td, table th {height: 50px;text-align: center;font-size: 18px;}</style>" +
        `</head><body>${table}</body></html>`
    const blob = new Blob([template], { type: 'text/csv' })
    const link = document.createElement('a')
    const url = window.URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', fileName || 'Worksheet.xls')
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    }, 1000)
}

export type DownloadZipOptions = {
    zipName: string
    files: { name: string; content: string | ArrayBuffer; folder: string }[]
}

export const downloadZip = (options: DownloadZipOptions) => {
    return new Promise((resolve) => {
        const zipName = options.zipName || 'demo'
        const files = options.files || []

        if (!files.length) {
            resolve(void 0)
            return
        }

        const zip = new JSZip()
        const folders: Record<string, JSZip | null> = {}

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const name = file.name
            const content = file.content
            const folder = file.folder
            if (folder && !folders[folder]) {
                folders[folder] = zip.folder(folder)
            }
            const obj = folders[folder] || zip
            // 判断是否为图片文件
            const isImg = /\.(png|jpe?g|gif|svg)(\?.*)?$/.test(name)
            if (isImg) {
                obj.file(name, (content as string).replace(/data:image\/(png|jpg);base64,/, ''), { base64: true })
            } else {
                if (typeof content === 'string') {
                    if (!content.length) {
                        // 跳过空录像文件
                        files.splice(i, 1)
                        i--
                        continue
                    }
                } else if (!content.byteLength) {
                    files.splice(i, 1)
                    i--
                    continue
                }
                obj.file(name, content)
            }
        }

        zip.generateAsync({ type: 'blob' }).then((content) => {
            download(content, zipName + '.zip')
            // see FileSaver.js
            // saveAs(content, zipName + ".zip")
            resolve(void 0)
        })
    })
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
 * @description 传入当前页的路由 检测通道能力集
 * @param {string} route
 * @returns {Promise<Boolean>}
 */
export const checkChlListCaps = async (route: string) => {
    const { openLoading, closeLoading } = useLoading()
    const systemCaps = useCababilityStore()

    if (route.includes('faceRecognition') || route.includes('vehicleRecognition') || route.includes('boundary') || route.includes('more')) {
    } else {
        return false
    }

    // 通过能力集判断设备是否支持人脸后侦测
    const localFaceDectEnabled = systemCaps.localFaceDectMaxCount !== 0
    const localTargetDectEnabled = systemCaps.localTargetDectMaxCount !== 0

    openLoading()

    const resultOnline = await queryOnlineChlList()
    const $online = queryXml(resultOnline)
    const onlineList = $online('//content/item').map((item) => item.attr('id')!)

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

    const supportFlag = $('//content/item').some((item) => {
        const $item = queryXml(item.element)
        const protocolType = $('protocolType').text()
        const factoryName = $('productModel').attr('factoryName')!
        if (factoryName === 'Recorder') {
            return false
        }
        const chlId = item.attr('id')!
        if (protocolType !== 'RTSP' && onlineList.includes(chlId)) {
            const supportOsc = $item('supportOsc').text().toBoolean()
            const supportCdd = $item('supportCdd').text().toBoolean()
            const supportVfd = $item('supportVfd').text().toBoolean()
            const supportAvd = $item('supportAvd').text().toBoolean()
            const supportPea = $item('supportPea').text().toBoolean()
            const supportPeaTrigger = $item('supportPeaTrigger').text().toBoolean()
            const supportTripwire = $item('supportTripwire').text().toBoolean()
            const supportAOIEntry = $item('supportAOIEntry').text().toBoolean()
            const supportAOILeave = $item('supportAOILeave').text().toBoolean()
            const supportVehiclePlate = $item('supportVehiclePlate').text().toBoolean()
            const supportPassLine = $item('supportPassLine').text().toBoolean()
            const supportCpc = $item('supportCpc').text().toBoolean()
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
        if ($('//status').text() == 'success') {
            openMessageTipBox({
                type: 'success',
                message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                showCancelButton: false,
            }).then(() => {
                successHandler && successHandler($)
                resolve($)
            })
        } else {
            openMessageTipBox({
                type: 'info',
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
                message: Translate('IDCS_SAVE_DATA_SUCCESS'),
            }).then(() => {
                successHandler && successHandler(responseXmlList)
                resolve(responseXmlList)
            })
        } else {
            openMessageTipBox({
                type: 'info',
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
 * @deprecated use dayjs
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
 * @description use dayjs
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
    const { openMessageTipBox } = useMessageBox()
    const { Translate } = useLangStore()
    const pluginStore = usePluginStore()
    const { closeLoading } = useLoading()

    if (import.meta.env.VITE_APP_TYPE === 'STANDARD') {
        return setTimeout(() => {
            reconnectStandard(() => {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_LOGIN_OVERTIME'),
                }).then(() => {
                    closeLoading()
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
        scheduleList = $('//content/item').map((item) => {
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
    const isMaxSearchResultNum = $('//content/IsMaxSearchResultNum').text().toBoolean()
    const { openMessageTipBox } = useMessageBox()
    const { Translate } = useLangStore()

    if (isMaxSearchResultNum) {
        openMessageTipBox({
            type: 'info',
            message: Translate('IDCS_SEARCH_RESULT_LIMIT_TIPS'),
        })
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
    if (typeof options.resolution == 'string') {
        const resParts = options.resolution.split('x')
        resolution = { width: Number(resParts[0]), height: Number(resParts[1]) }
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
    max = videoEncodeType == 'h265' ? Math.floor(max * 0.55) : Math.floor(max)
    if (videoEncodeType == 'h265' || videoEncodeType == 'h265p' || videoEncodeType == 'h265s') {
        min = Math.floor(min * 0.55)
    } else {
        min = Math.floor(min)
    }
    if (!min || !max) {
        return null
    }

    return { min: min, max: max }
}

// 将IPC音频文件转换为base64-导入摄像机声音/本地音频使用
export const fileToBase64 = (file: Blob, callback: Function) => {
    const reader = new FileReader()
    reader.onload = function (e) {
        const data = (e.target?.result as string).split(',')
        const base64 = data[1]
        const base64Str = formatBase64(base64)
        if (typeof callback === 'function') {
            callback(base64Str)
        }
    }
    reader.readAsDataURL(file)
}

// base64 每76位加一个换行
export const formatBase64 = (param: string) => {
    let result = ''
    for (let i = 0; i < param.length; i++) {
        if (i != 0 && i % 76 == 0) {
            result += '\r\n'
        }
        result += param[i]
    }
    return result
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
 * @returns Pstring
 */
export const getChlGuid16 = (id: string) => {
    try {
        while (id.length < 8) {
            id = '0' + id
        }
        const arr = [id, '0000', '0000', '0000', '000000000000']
        const guid = '{' + arr.join('-') + '}'
        return guid
    } catch (e) {
        return '{00000001-0000-0000-0000-000000000000}'
    }
}

// 翻译key值拼接添加空格（排除简体中文、繁体中文）
export const joinSpaceForLang = (str: string) => {
    if (!str) return ''
    const { langType } = useLangStore()
    const langTypeList = ['zh-cn', 'zh-tw']
    const currLangType = langType || 'en-us'
    const isInclude = langTypeList.includes(currLangType)
    str = isInclude ? str : str + ' '
    return str
}

/**
 * 判断线段AB和线段CD是否相交（不包含共端点）
 * 原理：如果线段CD的两个端点C和D，与另一条线段的一个端点（A或B，只能是其中一个）连成的向量，与向量AB做叉乘，
 *       若结果异号，表示C和D分别在直线AB的两边，
 *       若结果同号，则表示CD两点都在AB的一边，则肯定不相交。
 *       即判断CD是否在AB的两边、和AB是否在CD的两边，两者同时满足则证明线段相交
 * @see https://www.cnblogs.com/tuyang1129/p/9390376.html
 * @returns {Boolean} true:相交; false:不相交
 */
const IsIntersect = (pointA: CanvasBasePoint, pointB: CanvasBasePoint, pointC: CanvasBasePoint, pointD: CanvasBasePoint) => {
    const vectorAC = { X: pointC.X - pointA.X, Y: pointC.Y - pointA.Y }
    const vectorAD = { X: pointD.X - pointA.X, Y: pointD.Y - pointA.Y }
    const vectorAB = { X: pointB.X - pointA.X, Y: pointB.Y - pointA.Y }
    const vectorCA = { X: pointA.X - pointC.X, Y: pointA.Y - pointC.Y }
    const vectorCB = { X: pointB.X - pointC.X, Y: pointB.Y - pointC.Y }
    const vectorCD = { X: pointD.X - pointC.X, Y: pointD.Y - pointC.Y }
    const isBothSideCD = (vectorAC.X * vectorAB.Y - vectorAC.Y * vectorAB.X) * (vectorAD.X * vectorAB.Y - vectorAD.Y * vectorAB.X) < 0
    const isBothSideAB = (vectorCA.X * vectorCD.Y - vectorCA.Y * vectorCD.X) * (vectorCB.X * vectorCD.Y - vectorCB.Y * vectorCD.X) < 0
    return isBothSideCD && isBothSideAB
}
// 判断画点多边形区域是否可闭合（通过判断区域中的第一个点和最后一个点的连线是否与其他线相交）- true:可闭合; false:不可闭合
export const judgeAreaCanBeClosed = (pointList: CanvasBasePoint[]) => {
    let flag = true
    const startPoint = pointList[0]
    const lastPoint = pointList[pointList.length - 1]
    for (let i = 0; i < pointList.length; i++) {
        if (i < pointList.length - 1) {
            const item = pointList[i]
            const itemNext = pointList[i + 1]
            if (IsIntersect(item, itemNext, startPoint, lastPoint)) {
                flag = false
                break
            }
        }
    }
    return flag
}
