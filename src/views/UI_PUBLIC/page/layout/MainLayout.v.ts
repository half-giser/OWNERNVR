/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 顶层布局页
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-23 17:05:19
 */

import { type RouteLocationMatched } from 'vue-router'
import BaseChangePwdPop from '../../components/BaseChangePwdPop.vue'
import { APP_TYPE } from '@/utils/constants'
import { menu1Item, menu1Items as allMenu1Items, getMenu1 } from '@/router'

export default defineComponent({
    components: {
        BaseChangePwdPop,
    },
    setup() {
        const route = useRoute()
        const router = useRouter()
        const menu = useMenuStore()
        const userSession = useUserSessionStore()
        const systemCaps = useCababilityStore()
        const { openMessageTipBox } = useMessageBox()
        const { Translate } = useLangStore()
        const Plugin = inject('Plugin') as PluginType
        const systemInfo = getSystemInfo()

        // const key = computed(() => `${String(route.name || route.path)}-${new Date()}`)

        const pageData = ref({
            logoShow: true,
            logoProductModel: '',
            // 更改密码弹窗状态
            isPasswordDialogVisible: false,
            mustBeModifiedPassword: false,
            passwordDialogTitle: 'IDCS_CHANGE_PWD',
            passwordStrength: 'weak' as keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING,
            // 顶部插件icon状态
            hoverPluginIconIndex: 1,
            // 是否显示插件下载
            isPluginDownloadBtn: true,
            // 插件下载URL
            pluginDownloadURL: '',
            // 是否显示本地配置按钮
            isLocalConfigBtn: true,
        })

        const closeChangePwdPop = () => {
            pageData.value.mustBeModifiedPassword = false
            pageData.value.isPasswordDialogVisible = false
        }

        const showChangePwdPop = () => {
            pageData.value.passwordDialogTitle = 'IDCS_CHANGE_PWD'
            // mustBeModifiedPassword.value = false
            pageData.value.isPasswordDialogVisible = true
        }

        // 是否是焦点菜单
        const isMenu1Active = (menu1: RouteRecordRawExtends) => {
            const routeMenu1 = getMenu1(route) as RouteLocationMatched
            return (menu1.name === 'functionPanel' && routeMenu1.name === 'config') || ((menu1 && menu1.meta && routeMenu1.meta.fullPath === menu1.meta.fullPath) as boolean)
        }

        // 二级菜单列表（已过滤）
        const menu1Items = computed(() => {
            const routeArr: RouteRecordRawExtends[] = []
            allMenu1Items.value.forEach((v) => {
                //根据能力集过滤
                routeArr.push(v)
            })
            return routeArr
        })

        const doLogout = () => {
            Logout()
        }

        let CustomerID = Infinity
        const showProductModelList = [5]

        const showProductModel = async (cbk?: () => void) => {
            const result = await queryBasicCfg(getXmlWrapData(''))
            const $ = queryXml(result)
            if ($('/response/status').text() === 'success') {
                if (APP_TYPE === 'P2P' && judgeCurrUI(result)) return
                CustomerID = Number($('/response/content/CustomerID').text())
                cbk && cbk()
                if (!showProductModelList.includes(CustomerID)) {
                    return
                }
                pageData.value.logoProductModel = $('/response/content/productModel').text()
            }
        }

        const getPasswordSecurityStrength = async () => {
            let strength: keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING = 'weak'
            const isInw48 = systemCaps.supportPwdSecurityConfig // TODO: 原项目是这个值
            const result = await queryPasswordSecurity()
            const $ = queryXml(result)
            if ($('/response/status').text() === 'success') {
                strength = ($('/response/content/pwdSecureSetting/pwdSecLevel').text() as keyof typeof DEFAULT_PASSWORD_STREMGTH_MAPPING & null) ?? 'weak'
                if (isInw48) {
                    strength = 'strong'
                }
            }
            pageData.value.passwordStrength = strength
            return strength
        }

        const forceModifyPassword = () => {
            pageData.value.mustBeModifiedPassword = true
            pageData.value.passwordDialogTitle = userSession.defaultPwd ? 'IDCS_WARNING_DEFAULT_PASSWORD' : 'IDCS_PWD_STRONG_ERROR'
            pageData.value.isPasswordDialogVisible = true
        }

        // 每次刷新都检测密码
        const checkForDefaultPwd = async () => {
            const auInfo = userSession.auInfo_N9K
            if (!auInfo) {
                return
            }
            const passwordStrength = await getPasswordSecurityStrength()
            const isDefaultPwd = userSession.defaultPwd
            const isChangedPwd = userSession.isChangedPwd
            if (userSession.pwdExpired) {
                pageData.value.mustBeModifiedPassword = true
                pageData.value.passwordDialogTitle = 'IDCS_PASSWORD_EXPIRED'
                pageData.value.isPasswordDialogVisible = true
            } else if (isDefaultPwd) {
                // 密码判断策略为：
                // （1）如果是IL03\INW48，默认密码（123456）必现修改（ NT - 5497）
                // （2）如果是其它客户：如果与密码等级相符，提示是否修改；如果与密码等级不符，则必须修改
                // 相关问题单：NVRF-112
                // IL03客户ID：12
                // INW48客户ID：100
                if (CustomerID === 12 || CustomerID === 100) {
                    forceModifyPassword()
                } else {
                    // 当前登录密码强度
                    const currentPwdStrength = userSession.pwdSaftyStrength // DEFAULT_PASSWORD_STREMGTH_MAPPING[userSession.pwdSaftyStrength]
                    // 系统要求密码强度
                    const pwdStrengthReqiured = DEFAULT_PASSWORD_STREMGTH_MAPPING[passwordStrength]
                    // 比较当前密码等级是否符合要求
                    if (currentPwdStrength >= pwdStrengthReqiured) {
                        // 符合强度要求，提示默认密码是否修改
                        pageData.value.passwordDialogTitle = userSession.defaultPwd ? 'IDCS_WARNING_DEFAULT_PASSWORD' : 'IDCS_PWD_STRONG_ERROR'
                        pageData.value.isPasswordDialogVisible = true
                    } else {
                        // 不符合强度要求，需要强制修改
                        forceModifyPassword()
                    }
                }
            } else if (passwordStrength === 'weak') {
                if (isDefaultPwd && !isChangedPwd) {
                    pageData.value.isPasswordDialogVisible = true
                    pageData.value.passwordDialogTitle = 'IDCS_WARNING_DEFAULT_PASSWORD'
                    userSession.defaultPwd = false
                }
            } else {
                if (!isChangedPwd && userSession.pwdSaftyStrength < DEFAULT_PASSWORD_STREMGTH_MAPPING[passwordStrength]) {
                    pageData.value.mustBeModifiedPassword = true
                    pageData.value.passwordDialogTitle = 'IDCS_PWD_STRONG_ERROR'
                }
            }
        }

        // P2P 判断输入栏UI不是设备UI, 则跳转地址回设备UI
        const judgeCurrUI = ($basicXml: XMLDocument | Element) => {
            const devVersion = queryXml($basicXml)('/response/content/softwareVersion').text()
            const inputUI = getUiAndTheme().name.toLowerCase().replace(/i|-/g, '') // 输入栏UI
            let targetUI = '' // 设备UI

            if (devVersion) {
                const reg1_3 = /^((?:\d+\.){3}\d+)b(?:[^\.]+\.)([^\.]+)\.(\w+)(?:\(\d+([a-z]).+\)).*$/ // 1.4.7.52401b220822.n0n.u1(16a420).beta
                const infoArr = devVersion.toLowerCase().match(reg1_3)
                if (infoArr && infoArr.length > 0 && infoArr.length === 5) {
                    targetUI = infoArr[3] + infoArr[4]
                }
            }
            // TODO: 看不懂原项目这里的意思
            if (targetUI && inputUI !== targetUI) {
                const urlSplit = window.location.href.split('#')[0].split('/')
                const uiIndex = urlSplit.length - 2
                urlSplit[uiIndex] = targetUI
                window.location.href = urlSplit.join('/')
                return false
            }
            return true
        }

        // 检测磁盘状态
        const checkIsDiskStatus = async () => {
            const result = await queryDiskStatus()
            const $ = queryXml(result)
            const diskNum = Number($('/response/content/item').text())
            if (diskNum == 0) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_NO_DISK'),
                })
                return
            }
            let diskDamage = false //是否有磁盘损坏/未格式化
            $('/response/content/item').forEach((item) => {
                const $item = queryXml(item.element)
                const diskStatus = $item('/diskStatus').text()
                if (diskStatus === 'bad' || diskStatus == 'read') {
                    diskDamage = true
                }
            })
            if (diskDamage) {
                openMessageTipBox({
                    type: 'question',
                    message: Translate('IDCS_QUESTION_JUMP_DISK_MANAGEMENT'),
                }).then(() => {
                    if (userSession.hasAuth('diskMgr')) {
                        if (systemCaps.supportRaid) {
                            queryDiskMode().then((result) => {
                                const isUseRaid = queryXml(result)('/response/content/diskMode/isUseRaid').text().toBoolean()
                                // TODO: 具体URL待确认
                                const routeUrl = isUseRaid ? 'config/disk/diskArrayCfg' : 'config/disk/manager'
                                router.push(routeUrl)
                            })
                        } else {
                            // TODO: 具体URL待确认
                            router.push('config/disk/manager')
                        }
                    } else {
                        openMessageTipBox({
                            type: 'question',
                            message: Translate('IDCS_NO_PERMISSION'),
                        })
                    }
                })
            }
        }

        // 设置插件下载的链接
        const setPluginURL = () => {
            Plugin.TogglePageByPlugin()
            // mac操作系统仅支持H5，插件下载按钮隐藏
            if (systemInfo.platform === 'mac') {
                pageData.value.isPluginDownloadBtn = false
            }
            // 去插件方式不支持本地配置,显示插件下载按钮
            if (Plugin.IsSupportH5()) {
                pageData.value.isLocalConfigBtn = false
                const path = getPluginPath()
                pageData.value.pluginDownloadURL = path.ClientPluDownLoadPath
            }
        }

        // 执行插件下载
        const handleDownloadPlugin = () => {
            const pluginName = pageData.value.pluginDownloadURL.slice(pageData.value.pluginDownloadURL.lastIndexOf('/') + 1)
            const link = document.createElement('a')
            link.setAttribute('href', pageData.value.pluginDownloadURL)
            link.setAttribute('download', pluginName)
            link.style.display = 'none'
            document.body.appendChild(link)
            link.click()
            setTimeout(function () {
                document.body.removeChild(link)
            }, 1000)
        }

        // 跳转本地配置页
        const showLocalConfig = () => {
            // TODO route
            // router.push()
        }

        const userName = computed(() => {
            const authInfo = userSession.getAuthInfo()
            if (authInfo) return authInfo[0]
            return ''
        })

        onMounted(async () => {
            const title = Translate('IDCS_WEB_CLIENT')
            document.title = title === 'IDCS_WEB_CLIENT' ? '' : title
            await showProductModel(() => {
                checkForDefaultPwd()
                if (userSession.loginCheck === 'check') {
                    checkIsDiskStatus()
                    userSession.loginCheck = 'notCheck'
                }
            })
            setPluginURL()
            console.log('repeated mounted')
        })

        return {
            route, // 当前进入的二级菜单项
            pageData,
            menu1Item, // 当前进入的一级菜单项的二级菜单列表
            menu1Items,
            menu,
            systemCaps,
            userName,
            showLocalConfig,
            isMenu1Active,
            doLogout,
            closeChangePwdPop,
            showChangePwdPop,
            handleDownloadPlugin,
            BaseChangePwdPop,
            // key,
        }
    },
})
