/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-05-04 22:08:40
 * @Description: HTTP请求工具类
 */

/* axios配置入口文件 */
import axios, { type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

export const xmlHeader = '<?xml version="1.0" encoding="UTF-8" ?>'
//公共错误上次处理时间
let commonErrorLastTime = dayjs().valueOf()
let isErrorMessageBox = false

export type ApiResult = Element | XMLDocument

/**
 * @description 添加xml外层公共包装
 * @param {string} data
 * @param {string} url
 * @param {boolean} refresh
 * @returns {string}
 */
export const getXmlWrapData = (data: string, url = '', refresh = false) => {
    const userSessionStore = useUserSessionStore()

    let tokenXml = ''
    if (userSessionStore.token) {
        tokenXml = `<token>${userSessionStore.token}</token>`
    }

    if (userSessionStore.appType === 'P2P') {
        return rawXml`${xmlHeader}
            <cmd type="NVMS_NAT_CMD">
                <request version="1.0" systemType="NVMS-9000" clientType="WEB-NAT" url="${url}" flag="1" ${refresh ? `refresh="true"` : ''}>
                    ${tokenXml}
                    ${data}
                </request>
            </cmd>
        `
    } else {
        return rawXml`${xmlHeader}
            <request version="1.0" systemType="NVMS-9000" clientType="WEB" ${refresh ? `refresh="true"` : ''}>
                ${tokenXml}
                ${data}
            </request>`
    }
}

/**
 * @description 错误信息处理，返回登录页
 * @param {string} message
 */
const handleUserErrorRedirectToLogin = (message: string) => {
    const { openMessageBox } = useMessageBox()
    const layoutStore = useLayoutStore()
    if (!layoutStore.isInitial) {
        isErrorMessageBox = false
        Logout()
    } else {
        if (!isErrorMessageBox) {
            isErrorMessageBox = true
            openMessageBox({
                type: 'info',
                message: message,
            }).finally(() => {
                isErrorMessageBox = false
                Logout()
            })
        }
    }
}

/**
 * @description HTTP请求工具类
 * @returns
 */
class Request {
    BASE_URL: string
    config: object

    constructor() {
        this.BASE_URL = import.meta.env.VITE_BASE_URL
        this.config = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            responseType: 'document',
            timeout: 20 * 1000,
        }
    }

    fetch(url: string, data: string, config?: AxiosRequestConfig, checkCommonErrorSwitch = true) {
        return new Promise((resolve: (data: ApiResult) => void, reject: (error: any) => void) => {
            const appType = useUserSessionStore().appType
            if (appType === 'STANDARD') {
                return axios({
                    ...this.config,
                    ...config,
                    url,
                    data: compressXml(data),
                    baseURL: this.BASE_URL,
                }).then(
                    (response) => {
                        const xmlDoc = getXmlDoc(response.data)
                        if (xmlDoc) {
                            const $ = queryXml(xmlDoc)
                            if ($('//status').text() === ApiStatus.fail) {
                                const errorCode = Number(queryXml(xmlDoc)('//errorCode').text())
                                if (checkCommonErrorSwitch && this.handelCommonError(errorCode)) {
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
                    cmd: compressXml(data),
                    resolve: (xmlDoc) => {
                        const $ = queryXml(xmlDoc)
                        if ($('//status').text() === ApiStatus.fail) {
                            const errorCode = Number(queryXml(xmlDoc)('//errorCode').text())
                            if (checkCommonErrorSwitch && this.handelCommonError(errorCode)) {
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

    /**
     * @description 处理公共错误
     * @param {errorCode} number
     * @returns {boolean} true：停止继续处理，一般为流程中断了，比如退出登录，false：需要继续处理
     */
    handelCommonError(errorCode: number) {
        const { Translate } = useLangStore()
        const { closeAllLoading } = useLoading()
        let isStopHandle = true
        switch (errorCode) {
            case ErrorCode.USER_ERROR_NO_USER:
            case ErrorCode.USER_ERROR_PWD_ERR:
                handleUserErrorRedirectToLogin(Translate('IDCS_LOGIN_FAIL_REASON_U_P_ERROR'))
                break
            case ErrorCode.USER_ERROR_SERVER_NO_EXISTS:
                handleUserErrorRedirectToLogin(Translate('IDCS_LOGIN_OVERTIME'))
                break
            case ErrorCode.USER_ERROR_USER_LOCKED:
                handleUserErrorRedirectToLogin(Translate('IDCS_LOGIN_FAIL_USER_LOCKED'))
                break
            case ErrorCode.USER_ERROR_INVALID_PARAM:
                handleUserErrorRedirectToLogin(Translate('IDCS_USER_ERROR_INVALID_PARAM'))
                break
            case ErrorCode.USER_ERROR_FAIL:
                //Session无效相关错误处理，2秒内不重复处理，防止多个API并发调用时，弹出多次会话超时提示
                if (dayjs().valueOf() - commonErrorLastTime > 2000) {
                    ElMessage({
                        type: 'error',
                        message: Translate('IDCS_LOGIN_OVERTIME'),
                        grouping: true,
                    })
                    Logout()
                    commonErrorLastTime = dayjs().valueOf()
                }
                break
            case ErrorCode.USER_SESSION_TIMEOUT:
            case ErrorCode.USER_SESSION_NOTFOUND:
                //Session无效相关错误处理，2秒内不重复处理，防止多个API并发调用时，弹出多次会话超时提示
                if (dayjs().valueOf() - commonErrorLastTime > 2000) {
                    ElMessage({
                        type: 'error',
                        message: Translate('IDCS_LOGIN_OVERTIME'),
                        grouping: true,
                    })
                    // Logout()
                    commonErrorLastTime = dayjs().valueOf()
                }
                break
            default:
                isStopHandle = false
                break
        }
        closeAllLoading()
        return isStopHandle
    }
}

const http = new Request()

export default http

export { Request }
