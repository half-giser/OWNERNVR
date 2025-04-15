/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 顶层布局页
 */
import { type RouteLocationMatched } from 'vue-router'
import ChangePasswordPop from '../ChangePasswordPop.vue'
import { getMenu1 } from '@/router'
import { type XMLQuery } from '@/utils/xmlParse'

export default defineComponent({
    components: {
        ChangePasswordPop,
    },
    setup() {
        const route = useRoute()
        const router = useRouter()
        const userSession = useUserSessionStore()
        const systemCaps = useCababilityStore()
        const { Translate } = useLangStore()
        const systemInfo = getSystemInfo()
        const layoutStore = useLayoutStore()
        const pluginStore = usePluginStore()

        const menu1Item = computed(() => {
            return layoutStore.menu1Item
        })
        const allMenu1Items = computed(() => layoutStore.menu1Items)

        const pageData = ref({
            logoShow: true,
            logoProductModel: '',
            // 更改密码弹窗状态
            isPasswordDialogVisible: false,
            mustBeModifiedPassword: false,
            // 是否显示插件下载
            isPluginDownloadBtn: false,
            // 插件下载URL
            pluginDownloadURL: '',
            // 是否显示本地配置按钮
            isLocalConfigBtn: false,
        })

        /**
         * @description 关闭修改密码弹窗
         */
        const closeChangePwdPop = () => {
            pageData.value.mustBeModifiedPassword = false
            pageData.value.isPasswordDialogVisible = false
        }

        /**
         * @description 打开修改密码弹窗
         */
        const showChangePwdPop = () => {
            // pageData.value.passwordDialogTitle = 'IDCS_CHANGE_PWD'
            // mustBeModifiedPassword.value = false
            pageData.value.isPasswordDialogVisible = true
        }

        const routeMenu = computed(() => getMenu1(route) as RouteLocationMatched)

        /**
         * @description 是否是焦点菜单
         * @param {RouteRecordRawExtends} menu1
         * @returns {boolean}
         */
        const isMenu1Active = (menu1: RouteRecordRawExtends) => {
            return (menu1.name === 'functionPanel' && routeMenu.value.name === 'config') || menu1.meta.fullPath === routeMenu.value.meta.fullPath
        }

        /**
         * @description 路由跳转
         * @param {RouteRecordRawExtends} route
         */
        const goToPath = (route: RouteRecordRawExtends) => {
            router.push({
                path: route.meta.fullPath,
            })
        }

        /**
         * @description 注销登录
         */
        const doLogout = () => {
            Logout()
        }

        const showProductModel = async () => {
            const result = await queryBasicCfg()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                if (userSession.appType === 'P2P' && !isCorrectUI($)) return
                if (![5].includes(systemCaps.CustomerID)) {
                    return
                }
                pageData.value.logoProductModel = $('content/productModel').text()
            }
        }

        /**
         * @description 获取密码强度要求
         * @returns {string}
         */
        const getPasswordSecurityStrength = async () => {
            let strength: keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING = 'weak'
            const result = await queryPasswordSecurity()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                strength = $('content/pwdSecureSetting/pwdSecLevel').text() || 'weak'
                if (!systemCaps.supportPwdSecurityConfig) {
                    strength = 'strong'
                }
            }
            return strength
        }

        /**
         * @description 弹出密码需修改提示
         * @param {string} message
         * @param {boolean} force 是否强制修改
         */
        const handleModifyPassword = (message: string, force = false) => {
            openMessageBox({
                type: force ? 'info' : 'question',
                message,
            }).then(() => {
                if (force) {
                    pageData.value.mustBeModifiedPassword = true
                }

                pageData.value.isPasswordDialogVisible = true
            })
        }

        /**
         * @description 每次刷新都检测密码
         */
        const checkForDefaultPwd = async () => {
            const auInfo = userSession.auInfo_N9K
            if (!auInfo) {
                return
            }
            const passwordStrength = await getPasswordSecurityStrength()
            const isDefaultPwd = userSession.defaultPwd
            const isChangedPwd = userSession.isChangedPwd
            if (userSession.pwdExpired) {
                handleModifyPassword(Translate('IDCS_PASSWORD_EXPIRED'), true)
            } else if (isDefaultPwd) {
                // 密码判断策略为：
                // （1）如果是IL03\INW48，默认密码（123456）必现修改（ NT - 5497）
                // （2）如果是其它客户：如果与密码等级相符，提示是否修改；如果与密码等级不符，则必须修改
                // 相关问题单：NVRF-112
                // IL03客户ID：12
                // INW48客户ID：100
                if (systemCaps.CustomerID === 12 || systemCaps.CustomerID === 100) {
                    handleModifyPassword(userSession.defaultPwd ? Translate('IDCS_WARNING_DEFAULT_PASSWORD') : Translate('IDCS_PWD_STRONG_ERROR'), true)
                } else {
                    // 当前登录密码强度
                    const currentPwdStrength = userSession.pwdSaftyStrength // DEFAULT_PASSWORD_STREMGTH_MAPPING[userSession.pwdSaftyStrength]
                    // 系统要求密码强度
                    const pwdStrengthReqiured = DEFAULT_PASSWORD_STREMGTH_MAPPING[passwordStrength]
                    // 比较当前密码等级是否符合要求
                    // 符合强度要求，提示默认密码是否修改
                    if (currentPwdStrength >= pwdStrengthReqiured) {
                        handleModifyPassword(Translate('IDCS_WARNING_DEFAULT_PASSWORD'))
                    }
                    // 不符合强度要求，需要强制修改
                    else {
                        handleModifyPassword(userSession.defaultPwd ? Translate('IDCS_WARNING_DEFAULT_PASSWORD') : Translate('IDCS_PWD_STRONG_ERROR'), true)
                        // forceModifyPassword()
                    }
                }
            } else if (passwordStrength === 'weak') {
                if (isDefaultPwd && !isChangedPwd) {
                    handleModifyPassword(Translate('IDCS_WARNING_DEFAULT_PASSWORD'))
                    userSession.defaultPwd = false
                }
            } else {
                if (!isChangedPwd && userSession.pwdSaftyStrength < DEFAULT_PASSWORD_STREMGTH_MAPPING[passwordStrength]) {
                    handleModifyPassword(Translate('IDCS_PWD_STRONG_ERROR'), true)
                }
            }
        }

        /**
         * @description P2P 判断输入栏UI不是设备UI, 则跳转地址回设备UI
         * @param $basicXml
         * @returns {boolean}
         */
        const isCorrectUI = ($: XMLQuery) => {
            const devVersion = $('content/softwareVersion').text()
            const inputUI = import.meta.env.VITE_UI_TYPE.toLowerCase().replace(/i|-/g, '') // 输入栏UI
            let targetUI = '' // 设备UI

            if (devVersion) {
                const reg1_3 = /^((?:\d+\.){3}\d+)b(?:[^\.]+\.)([^\.]+)\.(\w+)(?:\(\d+([a-z]).+\)).*$/ // 1.4.7.52401b220822.n0n.u1(16a420).beta
                const infoArr = devVersion.toLowerCase().match(reg1_3)
                if (infoArr && infoArr.length > 0 && infoArr.length === 5) {
                    targetUI = infoArr[3] + infoArr[4]
                }
            }

            if (targetUI && inputUI !== targetUI) {
                const urlSplit = window.location.href.split('#')[0].split('/')
                const uiIndex = urlSplit.length - 2
                urlSplit[uiIndex] = targetUI
                window.location.href = urlSplit.join('/')
                return false
            }
            return true
        }

        /**
         * @description 检测磁盘状态
         */
        const checkIsDiskStatus = async () => {
            const result = await queryDiskStatus()
            const $ = queryXml(result)
            const diskNum = $('content/item').text().num()
            if (diskNum === 0) {
                openMessageBox(Translate('IDCS_NO_DISK'))
                return
            }
            let diskDamage = false //是否有磁盘损坏/未格式化
            $('content/item').forEach((item) => {
                const $item = queryXml(item.element)
                const diskStatus = $item('diskStatus').text()
                if (diskStatus === 'bad' || diskStatus === 'read') {
                    diskDamage = true
                }
            })
            if (diskDamage) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_QUESTION_JUMP_DISK_MANAGEMENT'),
                }).then(() => {
                    if (userSession.hasAuth('diskMgr')) {
                        const routeUrl = systemCaps.supportRaid && systemCaps.isUseRaid ? '/config/disk/diskArray' : '/config/disk/management'
                        router.push(routeUrl)
                    } else {
                        openMessageBox(Translate('IDCS_NO_PERMISSION'))
                    }
                })
            }
        }

        watch(
            () => pluginStore.currPluginMode,
            (mode) => {
                // 去插件方式不支持本地配置,显示插件下载按钮
                if (mode !== 'ocx') {
                    const path = getPluginPath()
                    pageData.value.pluginDownloadURL = path.ClientPluDownLoadPath
                    if (import.meta.env.DEV) {
                        pageData.value.pluginDownloadURL = '/plugin' + path.ClientPluDownLoadPath
                    }

                    // mac操作系统仅支持H5，插件下载按钮隐藏
                    if (systemInfo.platform !== 'mac') {
                        pageData.value.isPluginDownloadBtn = true
                    }
                } else if (mode === 'ocx') {
                    pageData.value.isLocalConfigBtn = true
                    pageData.value.isPluginDownloadBtn = false
                }
            },
            {
                immediate: true,
            },
        )

        /**
         * @description 执行插件下载
         */
        const handleDownloadPlugin = () => {
            const pluginName = pageData.value.pluginDownloadURL.slice(pageData.value.pluginDownloadURL.lastIndexOf('/') + 1)
            downloadFromBase64(pageData.value.pluginDownloadURL, pluginName)
        }

        /**
         * @description 跳转本地配置页
         */
        const showLocalConfig = () => {
            router.push({
                path: '/config/local',
            })
        }

        // 用户名显示
        const userName = computed(() => {
            const authInfo = userSession.getAuthInfo()
            if (authInfo) return authInfo[0]
            return ''
        })

        onMounted(async () => {
            const title = Translate('IDCS_WEB_CLIENT')
            document.title = title === 'IDCS_WEB_CLIENT' ? '' : title

            if (!layoutStore.isPwdChecked) {
                await showProductModel()
                checkForDefaultPwd()
                layoutStore.isPwdChecked = true
            }

            if (!userSession.loginCheck) {
                checkIsDiskStatus()
                userSession.loginCheck = true
            }
        })

        return {
            route, // 当前进入的二级菜单项
            pageData,
            menu1Item, // 当前进入的一级菜单项的二级菜单列表
            allMenu1Items,
            systemCaps,
            userSession,
            userName,
            goToPath,
            showLocalConfig,
            isMenu1Active,
            doLogout,
            closeChangePwdPop,
            showChangePwdPop,
            handleDownloadPlugin,
        }
    },
})
