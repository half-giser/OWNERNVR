/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 格式校验工具
 */

/**
 * @description: 校验ipv4地址是否合法
 * @param {string} str
 * @return {boolean}
 */
export const checkIpV4 = (str: string) => {
    const reg = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|[1-9])(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/
    return reg.test(str)
}

/**
 * @description: 校验ipv6地址是否合法
 * @param {string} str
 * @return {boolean}
 */
export const checkIpV6 = (str: string) => {
    const reg =
        /^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/
    return reg.test(str)
}

/**
 * @description 校验域名是否合法
 * @param {string} str
 * @returns {boolean}
 */
export const checkDomainName = (str: string) => {
    return /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/.test(str)
}

/**
 * @description 名称校验
 * @param {string} str
 * @return {boolean}
 */
export const checkName = (str: string) => {
    const name = str.replace(' ', '')
    // 前端过滤XML中不允许字符：<>&'\"\x00-\x08\x0b-\x0c\x0e-\x1f]以及键盘上看到的特殊字符：!@#$%^*()-+=:;,./?\\|
    // var reg = /[!@#$%^*()-+=:;,./?\\|<>&'\"\x00-\x08\x0b-\x0c\x0e-\x1f]/g;
    const reg = /[&$|\\'<>]/g
    return !reg.test(name)
}

/**
 * @description 用户名输入校验
 * @param {string} str
 * @return {boolean}
 */
export const checkUserName = (str: string) => {
    const reg = /([`\^\[\]]|[^A-z\d!@#%(){}~_\\'./\-\s])/g
    return !reg.test(str)
}

/**
 * @description 校验域名是否合法
 * @param {string} str
 * @return {boolean}
 */
export const checkDomain = (str: string) => {
    const reg =
        /^(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
    return reg.test(str.trim())
}

/**
 * @description 校验是否整数
 * @param {string} str
 * @return {boolean}
 */
export const checkInt = (str: string) => {
    const reg = /^[0-9]*$/
    return reg.test(str.trim())
}

/**
 * @description 校验端口是否合法
 * @param {string} str
 * @return {boolean}
 */
export const checkPort = (str: string) => {
    if (checkInt(str)) {
        const port = parseInt(str)
        return port >= 10 && port <= 65535
    }
    return false
}

/**
 * @description 检验RTSP地址
 * @param {string} str
 * @returns {boolean}
 */
export const checkRtspUrl = (str: string) => {
    /*
     * rtsp://10.15.2.174:554/profile1
     */
    const rtspReg = /^rtsp:\/\/((?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|[1-9])(?:\.(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}):(\d{1,5})\/([^&$|\\'<>]+)$/
    const result = str.match(rtspReg)
    return result != null
}

/**
 * @description 校验STMP服务器合法性
 * @param {string} str
 * @returns {boolean}
 */
export const checkStmpServer = (str: string) => {
    // //smtp服务器格式为 a.b.c.d ,多个点分割，可为数字字母或-，但-不能开头
    const reg = /^(([A-Za-z0-9])+([A-Za-z0-9-]*))(\.([A-Za-z0-9])+([A-Za-z0-9-]*))*$/g
    return reg.test(str)
}

/**
 * @description 通道名
 * @param strChlName
 * @returns {boolean}
 */
export const checkChlName = (strChlName: string) => {
    const name = strChlName.replace(' ', '')
    // 前端过滤XML中不允许字符：<>&'\"\x00-\x08\x0b-\x0c\x0e-\x1f]以及键盘上看到的特殊字符：!@#$%^*()-+=:;,./?\\|
    // var reg = /[!@#$%^*()-+=:;,./?\\|<>&'\"\x00-\x08\x0b-\x0c\x0e-\x1f]/g;
    const reg = /[&$|;`\\/:*?\"<>]/g
    if (!reg.test(name)) return true
    else return false
}

/**
 * @description 邮箱合法性
 * @param strEmail
 * @returns {boolean}
 */
export const checkEmail = (strEmail: string) => {
    // 匹配Email的正则表达式
    const re = /^[\-\_\w]+(\.[\-\_\w]+)*@[\-\_\w]+(\.[\-\_\w]{2,})+$/g
    if (re.test(strEmail)) {
        return true
    } else {
        return false
    }
}

/**
 * @description 检测字符串是否包含键盘上可见的符号
 * @param str
 * @returns {boolean}
 */
export const checkIllegalChar = (str: string) => {
    // 键盘上的可见符号
    const reg = /[`~!@#$%^&*()\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/g
    if (reg.test(str)) {
        return false
    }
    return true
}

/**
 * @description 获取密码强度值
 * @param {string} value
 * @return {number}
 */
export const getPwdSaftyStrength = (value: string) => {
    const reg1 = /([a-z])+/
    const reg2 = /([A-Z])+/
    const reg3 = /([0-9])+/
    const reg4 = /([|!@#$%^&*(){}\|:"<>?~_\\'./\-\s\[\];,=+])+/
    let sum = 0

    if (reg1.test(value)) {
        sum += 1
    }

    if (reg2.test(value)) {
        sum += 1
    }

    if (reg3.test(value)) {
        sum += 1
    }

    if (reg4.test(value)) {
        sum += 1
    }

    return sum
}

/**
 * @description 密码强度
 * @param {string} value
 * @return {boolean}
 */
export const checkPwdSaftyStrength = (value: string) => {
    return getPwdSaftyStrength(value) < 3
}

/**
 * @description: 判断table行是否需要校验
 * 适用于8080通过表格批量添加数据的场景
 * 当表格只有1行时，这行时需要保存的数据，需要校验
 * 当表格大于1行时，最后一行为空行，不保存，不需要检验（如果改了空行的值，会在后面自动产生一个新的空行）
 * @return {boolean} true:需要验证，false：不需要验证
 */
export const isTableRowNotValidate = (rule: any, tableDataLen: number) => {
    const rowIndex = parseInt(rule.field.split('.')[1])
    if (tableDataLen > 1 && rowIndex === tableDataLen - 1) return false
    return true
}
