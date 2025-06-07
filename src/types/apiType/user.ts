/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-24 17:12:55
 * @Description: 用户登录
 */

/**
 * @description 登录表单数据
 */
export class UserLoginForm {
    userName = ''
    password = ''
    calendarType = ''
}

/**
 * @description 登录请求数据类型
 */
export class UserLoginReqData {
    userName = ''
    password = ''
    passwordMd5 = ''
    rsaPublic = ''
}

/**
 * @description 授权码登录表单数据
 */
export class UserAuthCodeLoginForm {
    sn = ''
    code = ''
    calendarType = ''
}

/**
 * @description 双重验证用户登录表单
 */
export class UserDualAuthLoginForm {
    username = ''
    password = ''
}

/**
 * @description 重置密码表单数据
 */
export class UserChangePasswordForm {
    currentPassword = ''
    newPassword = ''
    confirmNewPassword = ''
}

/**
 * @description 重置密码请求数据类型
 */
export class UserChangePasswordReqData {
    oldPassword = ''
    password = ''
}

/**
 * @description 用户鉴权弹窗表单
 */
export class UserCheckAuthForm {
    userName = ''
    password = '' // 明文密码用于与插件的鉴权交互
    hexHash = '' // 密文密码
}

/**
 * @description 用户输入加密密码弹窗表单
 */
export class UserInputEncryptPwdForm {
    password = ''
}

export class UserForgetPwdForm {
    password = ''
    confirmPassword = ''
    captcha = ''
    email = ''
}
