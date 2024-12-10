/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-16 16:18:21
 * @Description: 云升级
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import { NetCloudUpgradeForm } from '@/types/apiType/net'
import type { UserCheckAuthForm } from '@/types/apiType/user'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()

        const pageData = ref({
            // 升级选项
            upgradeOptions: [
                {
                    label: Translate('IDCS_CLOSE'),
                    value: 'close',
                },
                {
                    label: Translate('IDCS_UPGRADE_ONLY_NOTIFY'),
                    value: 'notify',
                },
            ] as SelectOption<string, string>[],
            // 是否显示鉴权弹窗
            isCheckAuthPop: false,
            // 是否最新版本
            isLatest: false,
            // 是否下载中
            isDownloading: false,
            // 是否接受通知
            isUpdateNotify: false,
            // check Log文本
            checkLog: '',
            // 最新版本号
            latestVersion: '',
            // 版本信息
            versionInfo: '',
            // 版本GUID
            versionGUID: '',
            // 当前版本
            currentVersion: '',
            // 当前版本发布日期
            launchDate: '',
            // download请求的首次请求
            firstReq: false,
            // 下载进度
            downloadProgress: '0%',
        })

        // 下载进度定时器
        const checkDownloadTimer = useClock(() => {
            getDownloadProgess()
        }, 1000)
        // 获取云更新配置状态定时器
        const cloudCfgTimer = useClock(() => {
            getData(true)
        }, 3000)

        const formData = ref(new NetCloudUpgradeForm())

        /**
         * @description 执行云更新 打开鉴权弹窗
         */
        const upgrade = () => {
            pageData.value.isCheckAuthPop = true
        }

        /**
         * @description 执行云更新操作
         * @param e
         */
        const confirmUpgrade = async (e: UserCheckAuthForm) => {
            checkDownloadTimer.stop()

            if (pageData.value.isLatest) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_ONLINE_UPGRADE_TIP_LATEST'),
                })
                return
            }

            const sendXml = rawXml`
                <condition>
                    <versionGUID>${pageData.value.versionGUID}</versionGUID>
                </condition>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await cloudUpgrade(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                pageData.value.isCheckAuthPop = false

                // 鉴权成功以后才显示下载进度
                pageData.value.isDownloading = true
                cloudCfgTimer.stop()
                checkDownloadTimer.repeat()
            } else {
                checkDownloadTimer.repeat()

                const errorCode = $('errorCode').text().num()
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_PWD_ERR:
                        errorInfo = Translate('IDCS_USER_OR_PASSWORD_ERROR')
                        break
                    case ErrorCode.USER_ERROR_NO_USER:
                        errorInfo = Translate('IDCS_DEVICE_USER_NOTEXIST')
                        break
                    case ErrorCode.USER_ERROR_DEVICE_BUSY:
                        errorInfo = Translate('IDCS_DEVICE_BUSY')
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_AUTH')
                        break
                    default:
                        errorInfo = Translate('IDCS_CLOUD_UPGRADE_FAIED')
                        break
                }

                openMessageBox({
                    type: 'info',
                    message: errorInfo,
                })
            }
        }

        /**
         * @description 获取数据
         * @param {boolean} isInterval 是否轮询
         */
        const getData = async (isInterval = false) => {
            const result = await queryCloudUpgradeCfg()
            const $content = queryXml(queryXml(result)('content')[0].element)

            if (!isInterval) {
                formData.value.upgradeType = $content('cloudUpgrade/nvrItem/upgradeType').text()
                pageData.value.isUpdateNotify = formData.value.upgradeType !== 'close'
            }
            pageData.value.isLatest = $content('isLatest').text().bool()

            if (pageData.value.isLatest) {
                pageData.value.checkLog = Translate('IDCS_ONLINE_UPGRADE_TIP_LATEST')
            } else {
                pageData.value.checkLog = Translate('IDCS_ONLINE_UPGRADE_LATEST_INFO_NEW_VER')
            }

            pageData.value.latestVersion = $content('latestVersion').text()
            pageData.value.versionInfo = $content('versionInfo').text()
            pageData.value.versionGUID = $content('versionGUID').text()
            pageData.value.currentVersion = $content('currentVersion').text()
            const launchDate = $content('currentVersion').attr('launchDate')
            if (launchDate) {
                pageData.value.launchDate = formatDate(launchDate.split('.')[0], 'YYYY.MM.DD', 'YYYYMMDD')
            }
        }

        /**
         * @description 获取nat2.0开关状态
         */
        const getNat2Switch = async () => {
            const result = await queryP2PCfg()
            return queryXml(result)('content/switch[@index="1"]').text().bool()
        }

        /**
         * @description 获取云更新进度
         */
        const getDownloadProgess = async () => {
            try {
                const result = await getPackageDownloadStatus()
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    const $content = queryXml($('content')[0].element)
                    const state = $content('state').text()
                    const downloadLen = $content('downloadLen').text().num()
                    const fileLen = $content('fileLen').text().num()
                    const progress = fileLen ? Math.round((downloadLen / fileLen) * 100) : 0
                    const isRuningTask = $content('runCloudTask').text()
                    const errorCode = $content('errorCode').text().num()
                    // state 为installing 并且 errorCode 为 0  表明当前升级成功
                    if (state === 'installing' && errorCode === 0) {
                        pageData.value.firstReq = true
                    }
                    // NT-9558 有进度显示进度,由于设备升级失败时会立即清掉状态 此时web不一定取得到downloadFail和installFail
                    else if (!pageData.value.firstReq && !isRuningTask && errorCode !== 0) {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_CLOUD_UPGRADE_FAIL'),
                        }).finally(() => getData())
                        checkDownloadTimer.stop()
                        cloudCfgTimer.repeat()
                        return
                    } else {
                        pageData.value.firstReq = false
                    }

                    if (downloadLen && fileLen) {
                        pageData.value.downloadProgress = progress + '%'
                    } else {
                        checkDownloadTimer.stop()
                        getData()
                        cloudCfgTimer.repeat()
                    }
                } else {
                    // 请求失败提示网络断开
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_OCX_NET_DISCONNECT'),
                    }).finally(() => Logout())
                }
                return $('content/state').text()
            } catch (e) {
                // 请求失败提示网络断开
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_OCX_NET_DISCONNECT'),
                }).finally(() => Logout())
            }
        }

        /**
         * @description 版本检测
         */
        const getVersion = async () => {
            openLoading()

            // checkFromServer为设备端用于向服务器请求的标志,web端默认传true
            const sendXml = rawXml`
                <condition>
                    <checkFromServer>true</checkFromServer>
                </condition>
            `
            const result = await checkVersion(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                const $content = queryXml($('content')[0].element)

                pageData.value.isLatest = $content('isLatest').text().bool()

                if (pageData.value.isLatest) {
                    pageData.value.checkLog = Translate('IDCS_ONLINE_UPGRADE_TIP_LATEST')
                } else {
                    pageData.value.checkLog = Translate('IDCS_ONLINE_UPGRADE_LATEST_INFO_NEW_VER')
                }

                pageData.value.latestVersion = $content('latestVersion').text()
                pageData.value.versionInfo = $content('versionInfo').text()
                pageData.value.versionGUID = $content('versionGUID').text()

                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_CHECK_FINISH'),
                })
            } else {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_ONLINE_UPGRADE_TIP_CHECK_FAILED'),
                })
            }
        }

        /**
         * @description 确认更新配置
         */
        const confirmSetData = async () => {
            const sendXml = rawXml`
                <content>
                    <cloudUpgrade>
                        <nvrItem>
                            <upgradeType>${formData.value.upgradeType}</upgradeType>
                        </nvrItem>
                    </cloudUpgrade>
                </content>
            `
            const result = await editCloudUpgradeCfg(sendXml)
            commSaveResponseHandler(result)
            getData()

            closeLoading()
        }

        /**
         * @description 更新配置时，如果nat2.0未打开，弹出框确认是否需要打开
         */
        const setData = async () => {
            openLoading()

            if (formData.value.upgradeType === 'notify') {
                const status = await getNat2Switch()
                // 如果nat2.0未打开，弹出框确认是否需要打开
                if (!status) {
                    openMessageBox({
                        type: 'question',
                        message: Translate('IDCS_OPEN_CLOUD_UPGRADE_QUESTION'),
                    }).then(() => {
                        confirmSetData()
                    })
                } else {
                    confirmSetData()
                }
            } else {
                confirmSetData()
            }
        }

        onMounted(async () => {
            openLoading()

            await getData()
            const state = await getDownloadProgess()
            if (state === 'Downloading') {
                // 设备处于正在升级状态显示进度
                pageData.value.isDownloading = true
                cloudCfgTimer.stop()
                checkDownloadTimer.repeat()
            } else if (state === 'downloadNetException') {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_CLOUD_UPGRADE_CONNECT_FAIL'),
                })
            } else if (state === 'taskTerminate') {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_TASK_TERMINATION'),
                })
            }

            closeLoading()
        })

        return {
            pageData,
            formData,
            upgrade,
            confirmUpgrade,
            getVersion,
            setData,
        }
    },
})
