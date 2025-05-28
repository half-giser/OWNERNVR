/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-14 10:33:02
 * @Description: 用户与安全的类型定义，类型命名的前缀统一为User*
 */

/**
 * @description 添加用户请求表单
 */
export class UserAddForm {
    userName = '' // 用户名
    password = '' // 密码
    confirmPassword = '' // 确认密码
    allowModifyPassword = true // 是否允许修改密码
    email = '' // 电子邮箱
    authGroup = '' // 权限组
    loginScheduleInfo = ''
    loginScheduleInfoEnabled = false
    accessCode = false
}

/**
 * @description 编辑用户请求表单
 */
export class UserEditForm {
    enabled = false
    userName = '' // 用户名
    userNameMaxByteLen = 63
    email = '' // 电子邮箱
    emailMaxByteLen = 63
    authGroup = '' // 权限组
    allowModifyPassword = false // 是否允许修改密码
    authEffective = false
    loginScheduleInfo = ''
    loginScheduleInfoEnabled = false
    accessCode = false
}

/**
 * @description 用户编辑其他用户密码表单
 */
export class UserEditPasswordForm {
    currentPassword = ''
    newPassword = ''
    confirmNewPassword = ''
}

/**
 * @description 权限组选项
 */
export class UserAuthGroupOption {
    id = ''
    name = ''
}

/**
 * @description 用户列表
 */
export class UserList {
    id = ''
    userName = ''
    password = ''
    bindMacSwitch = ''
    userType = ''
    mac = ''
    email = ''
    comment = ''
    enabled = ''
    authEffective = false

    authGroupId = ''
    authGroupName = ''
    del = false
    edit = false
}

export class UserPermissionSystemAuthList {
    [key: string]: {
        key: string
        value: Record<string, { key: string; value: boolean; hidden: boolean; label: string; formatForLang?: string[] }>
        label: string
    }
    // 设置
    configurations = {
        key: 'IDCS_CONFIGURATION',
        label: '',
        value: {
            // 本地通道
            localChlMgr: {
                key: 'IDCS_LOCAL_CHANNEL',
                value: false,
                hidden: false,
                label: '',
            },
            // 远程通道
            remoteChlMgr: {
                key: 'IDCS_REMOTE_CHANNEL',
                value: false,
                hidden: false,
                label: '',
            },
            // 磁盘
            diskMgr: {
                key: 'IDCS_DISK',
                value: false,
                hidden: false,
                label: '',
            },
            // AI/事件
            alarmMgr: {
                key: 'IDCS_AI_AND_EVENT',
                value: false,
                hidden: false,
                label: '',
            },
            // 网络
            net: {
                key: 'IDCS_NETWORK',
                value: false,
                hidden: false,
                label: '',
            },
            // 排程
            scheduleMgr: {
                key: 'IDCS_SCHEDULE',
                value: false,
                hidden: false,
                label: '',
            },
            // 录像
            rec: {
                key: 'IDCS_RECORD',
                value: false,
                hidden: false,
                label: '',
            },
            // 本地系统
            localSysCfgAndMaintain: {
                key: 'IDCS_SYSTEM_LOCAL_CONFIG',
                value: false,
                hidden: false,
                label: '',
            },
            // 远程系统
            remoteSysCfgAndMaintain: {
                key: 'IDCS_SYSTEM_REMOTE_CONFIG',
                value: false,
                hidden: false,
                label: '',
            },
            // 样本库
            facePersonnalInfoMgr: {
                key: 'IDCS_SAMPLE_DATABASE',
                value: false,
                hidden: false,
                label: '',
            },
            // 停车场管理
            // parkingLotMgr: {
            //     key: 'IDCS_PARKING_LOT_MANAGEMENT',
            //     value: false,
            //     hidden: false,
            // },
            // // 门禁
            // AccessControlMgr: {
            //     key: 'IDCS_ACCESS_CONTROL_MANAGEMENT',
            //     value: false,
            //     hidden: false,
            // },
            // 账户和安全
            securityMgr: {
                key: 'IDCS_ACCOUNT_AND_SECURITY',
                value: false,
                hidden: false,
                label: '',
            },
            // 业务应用配置
            businessCfg: {
                key: 'IDCS_XXX_CONFIG',
                formatForLang: ['IDCS_BUSINESS_APPLICATION'],
                value: false,
                hidden: false,
                label: '',
            },
        },
    }
    // 功能
    functions = {
        key: 'IDCS_FUNCTION',
        label: '',
        value: {
            // 语音对讲
            talk: {
                key: 'IDCS_AUDIO_TALK',
                value: false,
                hidden: false,
                label: '',
            },
            // 业务应用
            businessMgr: {
                key: 'IDCS_BUSINESS_APPLICATION',
                value: false,
                hidden: false,
                label: '',
            },
            // 远程登录
            remoteLogin: {
                key: 'IDCS_REMOTE_LOGIN',
                value: false,
                hidden: false,
                label: '',
            },
        },
    }
}

export type UserPermissionAuthKey = '_lp' | '_spr' | '_bk' | '_ad' | '_ptz' | '@lp' | '@spr' | '@bk' | '@ad' | '@ptz'

/**
 * @description 用户通道权限列表
 */
export class UserPermissionChannelAuthList {
    id = ''
    name = ''
    _lp = false
    _spr = false
    _bk = false
    _ad = false
    _ptz = false
    '@lp' = false
    '@spr' = false
    '@bk' = false
    '@ad' = false
    '@ptz' = false
}

/**
 * @description 新增权限组表单
 */
export class UserPermissionGroupAddForm {
    name = ''
    nameMaxByteLen = 63
}

/**
 * @description 权限组列表
 */
export type UserAuthGroupList = {
    id: string
    name: string
    isDefault: boolean
    enableEdit: boolean
    groupType: string
    chlAuth: {
        id: string
        name: string
        auth: string
    }[]
    systemAuth: {
        localChlMgr: boolean
        remoteChlMgr: boolean
        diskMgr: boolean
        talk: boolean
        alarmMgr: boolean
        net: boolean
        rec: boolean
        remoteLogin: boolean
        scheduleMgr: boolean
        localSysCfgAndMaintain: boolean
        facePersonnalInfoMgr: boolean
        remoteSysCfgAndMaintain: boolean
        securityMgr: boolean
        businessCfg: boolean
        businessMgr: boolean
        // parkingLotMgr: boolean
        // AccessControlMgr: boolean
        [key: string]: boolean
    }
}

/**
 * @description 密码安全性表单
 */
export class UserPasswordSecurityForm {
    passwordStrength = ''
    expirationTime = ''
}

/**
 * @description 黑白名单表单
 */
export class UserBlackAllowListForm {
    switch = false
    filterType = 'refuse'
}

/**
 * @description 黑白名单表单
 */
export class UserEditBlackAllowListForm {
    switch = true // 是否启用
    addressType = 'ip' // 地址类型
    ip = DEFAULT_EMPTY_IP // IP地址
    startIp = DEFAULT_EMPTY_IP // 开始IP段
    endIp = DEFAULT_EMPTY_IP // 结束IP段
    mac = DEFAULT_EMPTY_MAC // MAC地址
}

/**
 * @description 网络安全表单
 */
export class UserNetworkSecurityForm {
    id = ''
    gateway = DEFAULT_EMPTY_IP
    gatewayMac = DEFAULT_EMPTY_MAC
    arpSwitch = false
    autoGetGatewayMac = false
    manualInputGatewayMac = DEFAULT_EMPTY_MAC
    preventDetection = false
    getGatewayMac = DEFAULT_EMPTY_MAC
}

/**
 * @description 在线用户列表
 */
export class UserOnlineList {
    userName = ''
    loginType = ''
    ip = ''
    time = ''
    previewChlCount = ''
    playbackChlCount = ''
}

/**
 * @description 登出后预览列表
 */
export class UserPreviewOnLogoutChannelList {
    id = ''
    name = ''
    switch = ''
}

export class UserFindPwdQuestionForm extends SystemGuideQuestionForm {}

export class UserFindPwdEmailForm {
    email = ''
    switch = false
}

export class UserDualAuthUserDto {
    id = ''
    userName = ''
    userNameMaxByteLen = 63
    limitLoginUsers: { id: string; userName: string }[] = []
}

export class UserDualAuthUserForm {
    id = ''
    userName = ''
    userNameMaxByteLen = 63
    password = ''
    confirmPassword = ''
}

export class UserDualAuthLimitLoginUserDto {
    id = ''
    userName = ''
}
