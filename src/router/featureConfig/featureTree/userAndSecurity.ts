/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 11:47:13
 * @Description: 功能面板-账户和安全
 */
const userAndSecurityRoutes: FeatureItem = {
    component: 'layout/L2T1Layout.vue',
    path: 'security',
    meta: {
        sort: 60,
        lk: 'IDCS_ACCOUNT_AND_SECURITY',
        plClass: 'md1',
        icon: 'user',
        auth: 'securityMgr',
        groups: {
            //账户和权限
            account: {
                sort: 10,
                lk: 'IDCS_ACCOUNT_AND_PERMISSION',
                icon: 'user_s',
            },
            //安全
            security: {
                sort: 20,
                lk: 'IDCS_SECURITY',
                icon: 'secure_s',
            },
            //用户状态
            userStatus: {
                sort: 30,
                lk: 'IDCS_USER_STATUS',
                icon: 'userStatus',
            },
        },
    },
    children: {
        // 添加用户
        userAdd: {
            path: 'user/add',
            component: 'userAndSecurity/UserAdd.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_ADD_USER',
                group: 'account',
                navs: ['userlist'],
                inHome: 'self',
                homeSort: 10,
            },
        },
        // 查看或更改用户
        userlist: {
            path: 'user/list',
            components: {
                toolBar: 'userAndSecurity/UserToolBar.vue',
                default: 'userAndSecurity/User.vue',
            },
            meta: {
                sort: 20,
                lk: 'IDCS_CHANGE_OR_DELETE_USER',
                group: 'account',
                default: true,
                homeDefault: true,
                inHome: 'self',
                homeSort: 20,
                minHeight: 850,
            },
        },
        // 添加权限组
        permissionGroupAdd: {
            path: 'auth_group/add',
            component: 'userAndSecurity/PermissionGroupAdd.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_ADD_USER_RIGHT',
                noMenu: true,
                group: 'account',
                minHeight: 850,
            },
        },
        // 查看或更改权限组
        permissionGroup: {
            path: 'auth_group/list',
            components: {
                toolBar: 'userAndSecurity/PermissionToolBar.vue',
                default: 'userAndSecurity/PermissionGroup.vue',
            },
            meta: {
                sort: 40,
                lk: 'IDCS_CHANGE_OR_DELETE_RIGHT_GROUP',
                group: 'account',
                inHome: 'self',
                homeSort: 30,
                minHeight: 850,
            },
        },
        // 黑白名单
        blockAndAllowList: {
            path: 'rule/filter',
            component: 'userAndSecurity/BlockAndAllowList.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_BLACK_AND_WHITE_LIST',
                group: 'security',
                default: true,
                inHome: 'self',
                homeSort: 40,
            },
        },
        // 登出后预览
        previewOnLogout: {
            path: 'preview/logout',
            component: 'userAndSecurity/PreviewOnLogout.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_PREVIEW_AUTHORITY_AFTER_LOGOUT',
                group: 'security',
            },
        },
        // 网络安全
        networkSecurity: {
            path: 'network/security',
            component: 'userAndSecurity/NetworkSecurity.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_NETWORK_SECURITY',
                group: 'security',
            },
        },
        // 密码安全
        passwordSecurity: {
            path: 'passwordSecurity',
            component: 'userAndSecurity/PasswordSecurity.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_PASSWORD_SAFETY',
                group: 'security',
                hasCap(systemCaps) {
                    return systemCaps.supportPwdSecurityConfig
                },
            },
        },
        // 找回密码设置 1.4.13
        findPassword: {
            path: 'findPwd',
            component: 'userAndSecurity/FindPassword.vue',
            meta: {
                sort: 50,
                lk: 'IDCS_PASSWORD_PROTECT_SET',
                group: 'security',
                hasCap() {
                    const userSession = useUserSessionStore()
                    return userSession.userType === USER_TYPE_DEFAULT_ADMIN
                },
            },
        },
        // 双重认证 1.4.13
        dualAuth: {
            path: 'dualAuthConfig',
            component: 'userAndSecurity/dualAuthConfig',
            meta: {
                sort: 60,
                lk: 'IDCS_DOUBLE_VERIFICATION',
                group: 'security',
                hasCap() {
                    const userSession = useUserSessionStore()
                    return userSession.userType === USER_TYPE_DEFAULT_ADMIN
                },
            },
        },
        // 在线用户
        onlineUser: {
            path: 'user/status',
            component: 'userAndSecurity/OnlineUser.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_ONLINE_USER',
                group: 'userStatus',
                default: true,
            },
        },
    },
}

export default userAndSecurityRoutes
