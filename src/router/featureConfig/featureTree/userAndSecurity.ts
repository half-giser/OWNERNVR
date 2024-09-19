/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 11:47:13
 * @Description: 功能面板-账户和安全
 */
export default {
    component: 'layout/L2T1Layout.vue',
    path: 'security',
    meta: {
        sort: 60,
        lk: 'IDCS_ACCOUNT_AND_SECURITY',
        plClass: 'md1',
        icon: 'user',
        enabled: 'securityMgr',
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
        userAdd: {
            //添加用户
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
        userlist: {
            //查看或更改用户
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
                inHome: 'self',
                homeSort: 20,
            },
        },
        permissionGroupAdd: {
            //添加权限组
            path: 'auth_group/add',
            component: 'userAndSecurity/PermissionGroupAdd.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_ADD_USER_RIGHT',
                noMenu: true,
                group: 'account',
            },
        },
        permissionGroup: {
            //查看或更改权限组
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
            },
        },
        blockAndAllowList: {
            //黑白名单
            path: 'security/rule/filter',
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
        previewOnLogout: {
            //登出后预览
            path: 'security/preview/logout',
            component: 'userAndSecurity/PreviewOnLogout.vue',
            meta: {
                sort: 20,
                lk: 'IDCS_PREVIEW_AUTHORITY_AFTER_LOGOUT',
                group: 'security',
            },
        },
        networkSecurity: {
            //网络安全
            path: 'security/network/security',
            component: 'userAndSecurity/NetworkSecurity.vue',
            meta: {
                sort: 30,
                lk: 'IDCS_NETWORK_SECURITY',
                group: 'security',
            },
        },
        passwordSecurity: {
            //密码安全
            path: 'security/passwordSecurity',
            component: 'userAndSecurity/PasswordSecurity.vue',
            meta: {
                sort: 40,
                lk: 'IDCS_PASSWORD_SAFETY',
                group: 'security',
                auth(systemCaps) {
                    return systemCaps.supportPwdSecurityConfig
                },
            },
        },
        onlineUser: {
            //在线用户
            path: 'security/user/status',
            component: 'userAndSecurity/OnlineUser.vue',
            meta: {
                sort: 10,
                lk: 'IDCS_ONLINE_USER',
                group: 'userStatus',
                default: true,
            },
        },
    },
} as FeatureItem
