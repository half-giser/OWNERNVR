/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-16 16:18:21
 * @Description: 云升级
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import CloudUpgradeIPCInfoPop from './CloudUpgradeIPCInfoPop.vue'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
        CloudUpgradeIPCInfoPop,
    },
    setup() {
        const { Translate } = useLangStore()

        const RELATIVE_PROGRESS: number = 10000 // 万分比进度

        const CLOUD_UPGRADE_STATE_MAPPING: Record<string, string> = {
            latest: Translate('IDCS_ONLINE_UPGRADE_TIP_LATEST'), // 当前为最新版本
            newVersion: Translate('IDCS_ONLINE_UPGRADE_LATEST_INFO_NEW_VER'), // 有新版本
            checkingVersion: Translate('IDCS_CHECKING'), // 版本检测中
            waitingForUpgrade: Translate('IDCS_WAIT_TO_DOWNLOAD'), // 待下载
            downloading: Translate('IDCS_DOWNLOADING_EX'), // 下载中
            downloadFail: Translate('IDCS_UPGRADE_FAIL_TIP'), // 下载失败，网络异常
            downloadNetException: Translate('IDCS_UPGRADE_FAIL_TIP'), // 下载失败，通道被删除或通道被拔出所致
            downloadFailNodeInvalid: Translate('IDCS_UPGRADE_FAIL_TIP'), // 下载失败，通道被删除或通道被拔出所致
            downloadFailOSSException: Translate('IDCS_UPGRADE_FAIL_TIP'), // 下载失败，OSS异常所致
            downloadFailNodeDisconnect: Translate('IDCS_UPGRADE_FAIL_TIP'), // 下载失败，通道离线导致的失败
            downloadFailFileWritExecption: Translate('IDCS_UPGRADE_FAIL_TIP'), // 下载失败，文件写失败
            downloadFailFileReadExecption: Translate('IDCS_UPGRADE_FAIL_TIP'), // 下载失败，文件读取失败
            downloadFailFileOpenExecption: Translate('IDCS_UPGRADE_FAIL_TIP'), // 下载失败，文件打开失败
            downloadSuccess: Translate('IDCS_UPGRADE_DOWN_FINISHED'), // 下载完成
            installing: Translate('IDCS_UPGRADING_TIP'), // 升级中
            installSuccess: Translate('IDCS_UPGRADE_SUCCESSFULLY'), // 升级成功
            installFail: Translate('IDCS_UPGRADE_FAIL_TIP'), // 升级失败，转发失败的错误原因还未明确
            installFailNodeDisconnect: Translate('IDCS_UPGRADE_FAIL_TIP'), // 升级失败，通道离线所致
            installFailNodeInvalid: Translate('IDCS_UPGRADE_FAIL_TIP'), // 升级失败，通道被删除或POE通道被拔出所致
        }

        const CLOUD_UPGRADE_FAILSTATE_ENUM: string[] = [
            'downloadFail',
            'downloadNetException',
            'downloadFailNodeInvalid',
            'downloadFailOSSException',
            'downloadFailFileWritExecption',
            'downloadFailFileReadExecption',
            'downloadFailFileOpenExecption',
            'installFail',
            'installFailNodeDisconnect',
            'installFailNodeInvalid',
        ]

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
            // 升级类型
            upgradeType: '',
            // tab项（设备升级/通道升级）
            tab: 'nvr',
            // 是否显示鉴权弹窗
            isCheckAuthPop: false,
            // 是否打开ipc升级信息详情弹窗
            isDetailPop: false,
            // 当前查看的ipc升级信息详情索引
            detailIndex: 0,
            detailList: [] as NetCloudUpgradeIPCInfoList[],
        })

        const formData = ref(new NetCloudUpgradeForm())

        const nvrFormData = ref({
            state: '', // 设备当前升级状态
            version: '', // 设备当前版本
            newVersion: '', // 新版本版本号
            newVersionNote: '', // 新版本功能信息
            newVersionGUID: '', // 新版本GUID
            progress: '', // 进度
        })

        const ipcTableData = ref<NetCloudUpgradeIPCInfoList[]>([])

        // 获取数据定时器
        const timer = useRefreshTimer(() => {
            getData()
        }, 3000)

        const isUpdateNotify = computed(() => {
            return pageData.value.upgradeType === 'notify'
        })

        const getCloudUpgradeConfig = async () => {
            const result = await queryCloudUpgradeCfg()
            const $ = queryXml(result)
            pageData.value.upgradeType = $('content/cloudUpgrade/nvrItem/upgradeType').text()
            formData.value.upgradeType = pageData.value.upgradeType
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            timer.stop()

            try {
                // 通过getCloudUpgradeInfo协议获取设备和ipc的升级信息
                const result = await getCloudUpgradeInfo()
                const $ = queryXml(result)

                if ($('status').text() === 'success') {
                    // NVR/IPC的新版本信息
                    const newVersionInfo = {} as Record<string, { newVersion: string; newVersionNote: string }>
                    $('content/newVersionInfo/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const newVersion = $item('version').text()
                        const newVersionNote = $item('newVersionNote').text()
                        const newVersionGUID = item.attr('id')
                        newVersionInfo[newVersionGUID] = {
                            newVersion: newVersion,
                            newVersionNote: newVersionNote,
                        }
                    })

                    // NVR
                    nvrFormData.value.state = $('content/devInfo/state').text()
                    nvrFormData.value.version = $('content/devInfo/version').text()
                    const newVersionGUID = $('content/devInfo/newVersionGUID').text()
                    if (newVersionGUID && newVersionInfo[newVersionGUID]) {
                        nvrFormData.value.newVersion = newVersionInfo[newVersionGUID].newVersion
                        nvrFormData.value.newVersionNote = newVersionInfo[newVersionGUID].newVersionNote
                        nvrFormData.value.newVersionGUID = newVersionGUID
                    } else {
                        nvrFormData.value.newVersion = ''
                        nvrFormData.value.newVersionNote = ''
                        nvrFormData.value.newVersionGUID = ''
                    }
                    nvrFormData.value.progress = getRealProgress($('content/devInfo/progress').text())

                    // IPC
                    ipcTableData.value = []
                    if (isUpdateNotify.value) {
                        $('content/chlsInfo/item').forEach((item) => {
                            const $item = queryXml(item.element)
                            let newVersion = ''
                            let newVersionNote = ''
                            const newVersionGUID = $item('newVersionGUID').text()
                            if (newVersionGUID && newVersionInfo[newVersionGUID]) {
                                newVersion = newVersionInfo[newVersionGUID].newVersion
                                newVersionNote = newVersionInfo[newVersionGUID].newVersionNote
                            }
                            const tempObj: NetCloudUpgradeIPCInfoList = {
                                ip: item.attr('ip'),
                                chlId: item.attr('id'),
                                chlName: item.attr('name'),
                                state: $item('state').text(),
                                version: $item('version').text(),
                                newVersion: newVersion,
                                newVersionNote: newVersionNote,
                                newVersionGUID: newVersionGUID,
                                progress: getRealProgress($item('progress').text()),
                            }

                            // 1. 无新版本的IPC设备（无newVersionGUID），界面不展示；
                            // 2. IPC处于版本检测中，界面不展示；
                            // 3. IPC版本小于5.2.0则不支持云升级，界面不展示；
                            if (newVersionGUID && tempObj.state !== 'checkingVersion' && compareIpcVersion(tempObj.version.split('.').slice(0, 3), ['5', '2', '0']) >= 0) {
                                ipcTableData.value.push(tempObj)
                            }
                        })
                    }

                    if (isUpdateNotify.value) {
                        timer.repeat()
                    }
                } else {
                }
            } catch (e) {
                openMessageBox(Translate('IDCS_OCX_NET_DISCONNECT'))
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
                openMessageBox(Translate('IDCS_CHECK_FINISH'))
            } else {
                openMessageBox(Translate('IDCS_ONLINE_UPGRADE_TIP_CHECK_FAILED'))
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
         * @description 执行设备云升级 - 打开鉴权弹窗
         */
        const handleNVRUpgrade = () => {
            pageData.value.isCheckAuthPop = true
        }

        /**
         * @description 执行设备云升级 - 确认执行操作
         * @param e
         */
        const confirmNVRUpgrade = async (e: UserCheckAuthForm) => {
            timer.stop()
            const sendXml = rawXml`
                <condition>
                    <versionGUID>${nvrFormData.value.newVersionGUID}</versionGUID>
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
                timer.repeat()
            } else {
                const errorCode = $('errorCode').text().num()
                timer.repeat()
                handleError(errorCode)
            }
        }

        const handleError = (errorCode: number) => {
            let errorInfo = ''
            switch (errorCode) {
                case ErrorCode.USER_ERROR_PWD_ERR:
                    errorInfo = Translate('IDCS_USER_OR_PASSWORD_ERROR')
                    break
                case ErrorCode.USER_ERROR_NO_USER:
                    errorInfo = Translate('IDCS_DEVICE_USER_NOTEXIST')
                    break
                case ErrorCode.USER_ERROR_DEVICE_BUSY:
                case 536871060:
                    errorInfo = Translate('IDCS_DEVICE_BUSY')
                    break
                case ErrorCode.USER_ERROR_NO_AUTH:
                    errorInfo = Translate('IDCS_NO_AUTH')
                    break
                case ErrorCode.USER_ERROR_FILE_MISMATCHING:
                    errorInfo = Translate('IDCS_NO_DISK')
                    break
                case ErrorCode.USER_ERROR_SERVER_NO_EXISTS:
                    timer.stop()
                    openMessageBox(Translate('IDCS_LOGIN_OVERTIME')).then(() => {
                        Logout()
                    })
                    return
                case ErrorCode.USER_ERROR_UNSUPPORTED_FUNC:
                    errorInfo = Translate('IDCS_DEVICE_NOT_ALLOW_UPGRADE')
                    break
                case ErrorCode.USER_ERROR_FAIL: // 云升级IPC失败
                case 536871082: // 无新版本
                case 536871083: // 云升级版本不存在
                case ErrorCode.USER_ERROR_NO_READY: // 云升级关闭
                default:
                    errorInfo = Translate('IDCS_CLOUD_UPGRADE_FAIED')
                    break
            }
            openMessageBox(errorInfo)
        }

        /**
         * @description 执行ipc云升级 - 单个升级/批量升级
         * @param ipcInfoList: NetCloudUpgradeIPCInfoList
         */
        const handleIPCUpgrade = (ipcInfoList: NetCloudUpgradeIPCInfoList[]) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_IPC_UPGRADE_FINISH_RESTART'),
            }).then(() => {
                confirmIPCUpgrade(ipcInfoList)
            })
        }

        /**
         * @description 执行ipc云升级-批量升级
         */
        const batchIPCUpgrade = () => {
            const ipcList = ipcTableData.value.filter((item) => {
                return !disabledIPCUpgrade(item)
            })
            if (ipcList.length) {
                handleIPCUpgrade(ipcList)
            }
        }

        /**
         * @description 执行ipc云升级 - 确认执行操作
         * @param ipcInfoList: NetCloudUpgradeIPCInfoList
         */
        const confirmIPCUpgrade = async (ipcInfoList: NetCloudUpgradeIPCInfoList[]) => {
            const sendXml = rawXml`
                <condition>
                    <chls type="list">${ipcInfoList.map((item) => `<item id="${item.chlId}">${item.newVersionGUID}</item>`).join('')}</chls>
                </condition>
            `
            const result = await cloudUpgradeNode(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                const chls = ipcInfoList.map((item) => item.chlId)
                ipcTableData.value.forEach((item) => {
                    if (chls.includes(item.chlId)) {
                        item.state = 'waitingForUpgrade'
                    }
                })
            } else {
                const errorCode = $('errorCode').text().num()
                handleError(errorCode)
            }
        }

        /**
         * @description 更新配置时，如果nat2.0未打开，弹出框确认是否需要打开
         */
        const setData = async () => {
            openLoading()
            if (pageData.value.upgradeType === 'notify') {
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

        /**
         * @description 确认更新配置
         */
        const confirmSetData = async () => {
            const sendXml = rawXml`
                <content>
                    <cloudUpgrade>
                        <nvrItem>
                            <upgradeType>${pageData.value.upgradeType}</upgradeType>
                        </nvrItem>
                    </cloudUpgrade>
                </content>
            `
            const result = await editCloudUpgradeCfg(sendXml)
            commSaveResponseHandler(result)
            closeLoading()
            await getCloudUpgradeConfig()
            getData()
        }

        /**
         * @description 查看ipc升级详情
         * @param {Number} index
         */
        const showDetail = (index: number) => {
            pageData.value.detailList = ipcTableData.value.filter((item) => !disabledIPCDetail(item))
            pageData.value.detailIndex = pageData.value.detailList.findIndex((item) => item.chlId === ipcTableData.value[index].chlId)
            pageData.value.isDetailPop = true
        }

        /**
         * @description 格式化ipc云升级通道的新版本信息
         */
        const formatIpcNewVersion = (ipcInfo: NetCloudUpgradeIPCInfoList) => {
            let newVersion = ipcInfo.newVersion
            if (['installSuccess', 'latest'].includes(ipcInfo.state) && !ipcInfo.newVersionGUID) {
                newVersion = Translate('IDCS_ONLINE_UPGRADE_TIP_LATEST')
            }
            return newVersion || '--'
        }

        /**
         * @description 格式化ipc云升级通道的状态变迁
         */
        const formatIpcUpgradeState = (ipcInfo: NetCloudUpgradeIPCInfoList) => {
            let stateFormat = ''
            switch (ipcInfo.state) {
                case 'latest': // 当前为最新版本
                case 'newVersion': // 有新版本
                    stateFormat = '--'
                    break
                case 'downloading': // 下载中
                    stateFormat = Translate('IDCS_DOWNLOADING_EX') + '(' + ipcInfo.progress + ')'
                    break
                default:
                    // 下载失败、升级失败并且还有新版本的情况下，状态显示‘--’
                    if (CLOUD_UPGRADE_FAILSTATE_ENUM.includes(ipcInfo.state) && ipcInfo.newVersionGUID) {
                        stateFormat = '--'
                    } else {
                        stateFormat = CLOUD_UPGRADE_STATE_MAPPING[ipcInfo.state] || '--'
                    }
                    break
            }
            return stateFormat
        }

        /**
         * @description 升级文件下载进度比转换（万分比）
         */
        const getRealProgress = (progress: string) => {
            if (progress === '') return ''
            return Math.floor(Number(progress) / RELATIVE_PROGRESS) * 100 + '%'
        }

        /**
         * @description 比较IPC版本大小
         */
        const compareIpcVersion = (versionArr1: string[], versionArr2: string[]) => {
            for (let i = 0; i < versionArr1.length; i++) {
                if (Number(versionArr1[i]) * 1 > Number(versionArr2[i]) * 1) {
                    return 1
                } else if (Number(versionArr1[i]) * 1 === Number(versionArr2[i]) * 1) {
                    continue
                } else {
                    return -1
                }
            }
            return 0
        }

        /**
         * @description ipc单个升级按钮是否置灰
         */
        const disabledIPCUpgrade = (ipcInfo: NetCloudUpgradeIPCInfoList) => {
            return ['latest', 'installing', 'downloading', 'waitingForUpgrade'].includes(ipcInfo.state) || !ipcInfo.newVersionGUID
        }

        /**
         * @description ipc单个详情按钮是否置灰
         */
        const disabledIPCDetail = (ipcInfo: NetCloudUpgradeIPCInfoList) => {
            return ipcInfo.state === 'latest' || !ipcInfo.newVersionGUID
        }

        // 设备升级按钮是否置灰
        const disabledNVRUpgrade = computed(() => {
            return (
                !isUpdateNotify.value ||
                nvrFormData.value.state === 'downloading' ||
                nvrFormData.value.state === 'downloadSuccess' ||
                nvrFormData.value.state === 'installing' ||
                !nvrFormData.value.newVersionGUID
            )
        })

        onMounted(async () => {
            openLoading()
            await getCloudUpgradeConfig()
            await getData()
            closeLoading()
        })

        return {
            pageData,
            formData,
            getData,
            getVersion,
            handleNVRUpgrade,
            confirmNVRUpgrade,
            handleIPCUpgrade,
            batchIPCUpgrade,
            setData,
            showDetail,
            disabledIPCUpgrade,
            disabledIPCDetail,
            disabledNVRUpgrade,
            isUpdateNotify,
            nvrFormData,
            ipcTableData,
            formatIpcUpgradeState,
            formatIpcNewVersion,
        }
    },
})
