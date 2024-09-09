/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-05-04 22:08:40
 * @Description: HTTP请求工具类
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 16:19:10
 */

/* axios配置入口文件 */
// import axios from 'axios'
import axios, { type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

export const xmlHeader = '<?xml version="1.0" encoding="UTF-8" ?>'
//公共错误上次处理时间
let commonErrorLastTime = dayjs().valueOf()
let userSessionStore: ReturnType<typeof useUserSessionStore>
let isErrorMessageBox = false

export type ApiResult = Element | XMLDocument

/**
 * @description: 添加xml外层公共包装
 * @param {string} data
 * @param {string} url
 * @param {boolean} refresh
 * @return {string}
 */
export const getXmlWrapData = (data: string, url = '', refresh = false) => {
    if (!userSessionStore) {
        userSessionStore = useUserSessionStore()
    }
    let tokenXml = ''
    if (userSessionStore.token) {
        tokenXml = `<token>${userSessionStore.token}</token>`
    }
    if (import.meta.env.VITE_APP_TYPE === 'P2P') {
        // TODO: CMD_QUEUE.viewFlag
        return rawXml`${xmlHeader}
            <cmd type="NVMS_NAT_CMD">
                <request version="1.0" systemType="NVMS-9000" clientType="WEB-NAT" url="${url}" flag="CMD_QUEUE.viewFlag" ${refresh ? `refresh="true"` : ''}>
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

const handleUserErrorRedirectToLogin = (param: { message: string }) => {
    const { openMessageTipBox } = useMessageBox()
    const layoutStore = useLayoutStore()
    if (!layoutStore.isInitial) {
        isErrorMessageBox = false
        Logout(true)
    } else {
        if (!isErrorMessageBox) {
            isErrorMessageBox = true
            openMessageTipBox({
                type: 'info',
                message: param.message,
            }).finally(() => {
                isErrorMessageBox = false
                Logout(true)
            })
        }
    }
}

/**
 * @description: HTTP请求工具类
 * @return {*}
 */
class Request {
    BASE_URL: string
    config: object

    constructor() {
        this.BASE_URL = import.meta.env.VITE_BASE_URL
        this.config = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            responseType: 'document',
            timeout: 20 * 1000,
        }
    }

    fetch(url: string, data: string, config?: AxiosRequestConfig, checkCommonErrorSwitch = true) {
        return new Promise((resolve: (data: ApiResult) => void, reject: (error: any) => void) => {
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
                        const xml = queryXml(xmlDoc)
                        if (xml('//status').text() === ApiStatus.fail) {
                            const errorCode = Number(queryXml(xmlDoc)('//errorCode').text())
                            if (checkCommonErrorSwitch && this.handelCommonError(errorCode)) {
                                reject(errorCode)
                                return
                            }
                        }
                        resolve(xml('/response')[0].element)
                    } else {
                        console.log('error = xmlDoc is null')
                        reject('xmlDoc_is_null')
                    }
                },
                (error) => {
                    console.log('error =', error)
                    reject(error)
                },
            )
        })
    }

    /**
     * @description: 处理公共错误
     * @param {errorCode} number
     * @return {*} true：停止继续处理，一般为流程中断了，比如退出登录，false：需要继续处理
     */
    handelCommonError(errorCode: number) {
        const { Translate } = useLangStore()
        const { closeAllLoading } = useLoading()
        let isStopHandle = true
        switch (errorCode) {
            case ErrorCode.USER_ERROR_NO_USER:
            case ErrorCode.USER_ERROR_PWD_ERR:
                handleUserErrorRedirectToLogin({
                    message: Translate('IDCS_LOGIN_FAIL_REASON_U_P_ERROR'),
                })
                break
            case ErrorCode.USER_ERROR_SERVER_NO_EXISTS:
                handleUserErrorRedirectToLogin({
                    message: Translate('IDCS_LOGIN_OVERTIME'),
                })
                break
            case ErrorCode.USER_ERROR_USER_LOCKED:
                handleUserErrorRedirectToLogin({
                    message: Translate('IDCS_LOGIN_FAIL_USER_LOCKED'),
                })
                break
            case ErrorCode.USER_ERROR_INVALID_PARAM:
                handleUserErrorRedirectToLogin({
                    message: Translate('IDCS_USER_ERROR_INVALID_PARAM'),
                })
                break
            case ErrorCode.USER_ERROR_FAIL:
                //Session无效相关错误处理，2秒内不重复处理，防止多个API并发调用时，弹出多次会话超时提示
                if (dayjs().valueOf() - commonErrorLastTime > 2000) {
                    ElMessage.error(Translate('IDCS_LOGIN_OVERTIME'))
                    Logout(true)
                    commonErrorLastTime = dayjs().valueOf()
                }
                break
            case ErrorCode.USER_SESSION_TIMEOUT:
            case ErrorCode.USER_SESSION_NOTFOUND:
                //Session无效相关错误处理，2秒内不重复处理，防止多个API并发调用时，弹出多次会话超时提示
                if (dayjs().valueOf() - commonErrorLastTime > 2000) {
                    ElMessage.error(Translate('IDCS_LOGIN_OVERTIME'))
                    // Logout(true)
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
