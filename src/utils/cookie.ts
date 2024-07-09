/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2023-05-24 01:35:38
 * @Description:
 */

// 获取cookie
export const getCookie = (name: string) => {
    let arr
    const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
    if ((arr = document.cookie.match(reg))) return arr[2]
    else return null
}

// 设置cookie,增加到vue实例方便全局调用
export const setCookie = (c_name: string, value: string | number, expiredays?: number) => {
    let exp = ''
    if (expiredays) {
        const exdate = new Date()
        exdate.setDate(exdate.getDate() + expiredays)
        exp += ';expires=' + exdate.toUTCString()
    }
    document.cookie = c_name + '=' + value + ';path=/' + exp
}

// 删除cookie
export const delCookie = (name: string) => {
    const exp = new Date()
    exp.setTime(exp.getTime() - 1)
    const cval = getCookie(name)
    if (cval != null) {
        document.cookie = name + '=' + cval + ';path=/' + ';expires=' + exp.toUTCString()
    }
}

// 清除全部
export const clearCookie = () => {
    const keys = document.cookie.match(/[^ =;]+(?=\=)/g)
    if (keys) {
        for (let i = keys.length; i--; ) {
            document.cookie = keys[i] + '=0;path=/;expires=' + new Date(0).toUTCString()
            document.cookie = keys[i] + '=0;path=/;domain=' + document.domain + ';expires=' + new Date(0).toUTCString()
            document.cookie = keys[i] + '=0;path=/;domain=kevis.com;expires=' + new Date(0).toUTCString()
        }
    }
}
