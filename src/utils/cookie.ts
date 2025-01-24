/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2023-05-24 01:35:38
 * @Description: Cookie操作
 */

/**
 * @description 获取cookie
 * @param {string} name
 * @returns {string | null}
 */
export const getCookie = (name: string) => {
    let arr
    const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
    if ((arr = document.cookie.match(reg))) return arr[2]
    else return null
}

/**
 * @description 设置cookie,增加到vue实例方便全局调用
 * @param {string} c_name
 * @param {string | number} value
 * @param {number} expiredays
 */
export const setCookie = (c_name: string, value: string | number, expiredays?: number) => {
    let exp = ''
    if (expiredays) {
        const exdate = new Date()
        exdate.setDate(exdate.getDate() + expiredays)
        exp += ';expires=' + exdate.toUTCString()
    }
    document.cookie = c_name + '=' + value + ';path=/' + exp
}

/**
 * @description 删除cookie
 * @param {string} name
 */
export const delCookie = (name: string) => {
    const exp = new Date(0).toUTCString()
    document.cookie = name + '=;path=/;expires=' + exp
}

/**
 * @description 清除全部
 */
export const clearCookie = () => {
    const keys = document.cookie.match(/[^ =;]+(?=\=)/g)
    if (keys) {
        for (let i = keys.length; i--; ) {
            delCookie(keys[i])
        }
    }
}
