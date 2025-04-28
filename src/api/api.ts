/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-05-04 22:08:40
 * @Description: HTTP请求工具类
 */
import axios, { type AxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL
const BASE_CONFIG: AxiosRequestConfig = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    responseType: 'document',
    timeout: 20 * 1000,
}

export const xmlHeader = '<?xml version="1.0" encoding="UTF-8" ?>'
export type ApiResult = Element | XMLDocument

// 公共错误弹窗是否已打开
let isErrorMessageBox = false

/**
 * @description 添加xml外层公共包装
 * @param {string} data
 * @param {string} url
 * @param {boolean} refresh
 * @returns {string}
 */
const getXmlWrapData = (data: string, url = '', refresh = false) => {
    const userSessionStore = useUserSessionStore()

    let tokenXml = ''
    if (userSessionStore.token) {
        tokenXml = `<token>${userSessionStore.token}</token>`
    } else {
        tokenXml = '<token>null</token>'
    }

    if (userSessionStore.appType === 'P2P') {
        return (
            xmlHeader +
            checkXml(rawXml`
                <cmd type="NVMS_NAT_CMD">
                    <request version="1.0" systemType="NVMS-9000" clientType="WEB-NAT" url="${url}" flag="1" ${refresh ? ' refresh="true"' : ''}>
                        ${tokenXml}
                        ${data}
                    </request>
                </cmd>
            `)
        )
    } else {
        return (
            xmlHeader +
            checkXml(rawXml`
                <request version="1.0" systemType="NVMS-9000" clientType="WEB" ${refresh ? ' refresh="true"' : ''}>
                    ${tokenXml}
                    ${data}
                </request>
            `)
        )
    }
}

/**
 * @description 错误信息处理，返回登录页
 * @param {string} message
 */
const handleUserErrorRedirectToLogin = (message: string) => {
    closeAllLoading()

    if (!isErrorMessageBox) {
        isErrorMessageBox = true
        openMessageBox(message).then(() => {
            Logout()
            isErrorMessageBox = false
        })
    }
}

/**
 * @description 处理公共错误
 * @param {errorCode} number
 * @returns {boolean} true：停止继续处理，一般为流程中断了，比如退出登录，false：需要继续处理
 */
const handelCommonError = (errorCode: number) => {
    let isStopHandle = true
    const { Translate } = useLangStore()
    const layoutStore = useLayoutStore()

    if (!layoutStore.isInitial) {
        closeAllLoading()
        Logout()
        return
    }

    switch (errorCode) {
        case ErrorCode.USER_ERROR_NO_USER:
        case ErrorCode.USER_ERROR_PWD_ERR:
            if (!layoutStore.isAuth) {
                handleUserErrorRedirectToLogin(Translate('IDCS_LOGIN_FAIL_REASON_U_P_ERROR'))
            } else {
                isStopHandle = false
            }
            break
        case ErrorCode.USER_ERROR_SERVER_NO_EXISTS:
            handleUserErrorRedirectToLogin(Translate('IDCS_LOGIN_OVERTIME'))
            break
        case ErrorCode.USER_ERROR_USER_LOCKED:
            if (!layoutStore.isAuth) {
                handleUserErrorRedirectToLogin(Translate('IDCS_LOGIN_FAIL_USER_LOCKED'))
            } else {
                isStopHandle = false
            }
            break
        case ErrorCode.USER_ERROR_INVALID_PARAM:
            closeAllLoading()
            openMessageBox(Translate('IDCS_USER_ERROR_INVALID_PARAM'))
            break
        default:
            isStopHandle = false
            break
    }

    return isStopHandle
}

/**
 * @description HTTP请求工具类
 * @returns
 */
const fetch = (url: string, data: string, config?: AxiosRequestConfig, checkCommonErrorSwitch = true) => {
    return new Promise((resolve: (data: ApiResult) => void, reject: (error: any) => void) => {
        const appType = useUserSessionStore().appType
        if (appType === 'STANDARD') {
            return axios({
                ...BASE_CONFIG,
                ...config,
                url,
                data: getXmlWrapData(data),
                baseURL: BASE_URL,
            }).then(
                (response) => {
                    const xmlDoc = getXmlDoc(response.data)
                    if (xmlDoc) {
                        const $ = queryXml(xmlDoc)
                        if ($('//status').text() === ApiStatus.fail) {
                            const errorCode = queryXml(xmlDoc)('//errorCode').text().num()
                            if (checkCommonErrorSwitch && handelCommonError(errorCode)) {
                                reject(errorCode)
                                return
                            }
                        }
                        resolve($('/response')[0].element)
                    } else {
                        console.trace('error = xmlDoc is null')
                        reject('xmlDoc_is_null')
                    }
                },
                (error) => {
                    console.trace('error =', error)
                    reject(error)
                },
            )
        } else {
            const plugin = usePlugin()
            plugin.P2pCmdSender.add({
                cmd: getXmlWrapData(data, url),
                resolve: (xmlDoc) => {
                    const $ = queryXml(xmlDoc)
                    if ($('//status').text() === ApiStatus.fail) {
                        const errorCode = queryXml(xmlDoc)('//errorCode').text().num()
                        if (checkCommonErrorSwitch && handelCommonError(errorCode)) {
                            reject(errorCode)
                            return
                        }
                    }
                    resolve(xmlDoc)
                },
                reject: (e) => {
                    reject(e)
                },
            })
        }
    })
}

export default fetch
