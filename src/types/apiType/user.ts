/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-24 17:12:55
 * @Description:
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-20 17:59:18
 */

/**
 * @description 登录表单数据
 */
export class LoginForm {
    userName = ''
    password = ''
    calendarType = ''
}

/**
 * @description 登录请求数据类型
 */
export class LoginReqData {
    userName = ''
    password = ''
    passwordMd5 = ''
}

/**
 * @description 授权码登录表单数据
 */
export class AuthCodeLoginForm {
    sn = ''
    code = ''
}

/**
 * @description 重置密码表单数据
 */
export class ChangePasswordForm {
    currentPassword = ''
    newPassword = ''
    confirmNewPassword = ''
}

/**
 * @description 重置密码请求数据类型
 */
export class ChangePasswordReqData {
    oldPassword = ''
    password = ''
}
