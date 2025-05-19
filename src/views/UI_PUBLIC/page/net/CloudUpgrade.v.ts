/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-16 16:18:21
 * @Description: 云升级
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
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
            // 是否接受通知（upgradeType === 'notify'表示接受通知）
            isUpdateNotify: false,
            // tab项（设备升级/通道升级）
            tab: 'dev',
            // 设备升级信息
            devInfoObj: {
                state: '', // 设备当前升级状态
                version: '', // 设备当前版本
                newVersion: '', // 新版本版本号
                newVersionNote: '', // 新版本功能信息
                newVersionGUID: '', // 新版本GUID
                progress: '', // 进度
            },
            // IPC升级信息（表格数据）
            ipcInfoList: [] as NetIpcUpgradeInfoList[],
            // 是否显示鉴权弹窗
            isCheckAuthPop: false,
            // 是否打开ipc升级信息详情弹窗
            isDetailPop: false,
            // 当前查看的ipc升级信息详情索引
            activeTableIndex: 0,
        })

        // 获取数据定时器
        const getDataTimer = useClock(() => {
            getData()
        }, 3000)

        /**
         * @description 获取数据
         */
        const getData = async () => {
            // 查询协议 - 通过queryCloudUpgradeCfg协议获取升级类型
            if (!pageData.value.upgradeType) {
                const upgradeCfgResult = await queryCloudUpgradeCfg()
                const $upgradeCfgContent = queryXml(queryXml(upgradeCfgResult)('content')[0].element)
                // 数据赋值 - pageData
                pageData.value.upgradeType = $upgradeCfgContent('cloudUpgrade/nvrItem/upgradeType').text()
                pageData.value.isUpdateNotify = pageData.value.upgradeType === 'notify'
            }

            // 查询协议 - 通过getCloudUpgradeInfo协议获取设备和ipc的升级信息
            const upgradeInfoResult = await getCloudUpgradeInfo()
            const $upgradeInfoContent = queryXml(queryXml(upgradeInfoResult)('content')[0].element)
            // 设备/ipc的新版本信息
            const newVersionInfo = {} as Record<string, { newVersion: string; newVersionNote: string }>
            $upgradeInfoContent('newVersionInfo/item').forEach((item) => {
                const $item = queryXml(item.element)
                const newVersion = $item('version').text()
                const newVersionNote = $item('newVersionNote').text()
                const newVersionGUID = item.attr('id')
                newVersionInfo[newVersionGUID] = {
                    newVersion: newVersion,
                    newVersionNote: newVersionNote,
                }
            })

            // 数据赋值 - pageData(devInfoObj)
            pageData.value.devInfoObj.state = $upgradeInfoContent('devInfoObj/state').text()
            pageData.value.devInfoObj.version = $upgradeInfoContent('devInfoObj/version').text()
            const newVersionGUID = $upgradeInfoContent('devInfoObj/newVersionGUID').text()
            if (newVersionGUID && newVersionInfo[newVersionGUID]) {
                pageData.value.devInfoObj.newVersion = newVersionInfo[newVersionGUID].newVersion
                pageData.value.devInfoObj.newVersionNote = newVersionInfo[newVersionGUID].newVersionNote
                pageData.value.devInfoObj.newVersionGUID = newVersionGUID
            }
            pageData.value.devInfoObj.progress = getRealProgress($upgradeInfoContent('devInfoObj/progress').text())

            // 数据赋值 - pageData(ipcInfoList)
            pageData.value.ipcInfoList = []
            $upgradeInfoContent('chlsInfo/item').forEach((item) => {
                const $item = queryXml(item.element)
                let newVersion = ''
                let newVersionNote = ''
                const newVersionGUID = $item('newVersionGUID').text()
                if (newVersionGUID && newVersionInfo[newVersionGUID]) {
                    newVersion = newVersionInfo[newVersionGUID].newVersion
                    newVersionNote = newVersionInfo[newVersionGUID].newVersionNote
                }
                const tempObj = {
                    ip: item.attr('ip'),
                    chlId: item.attr('id'),
                    chlName: item.attr('name'),
                    state: $item('state').text(),
                    formatState: '',
                    version: $item('version').text(),
                    newVersion: newVersion,
                    formatNewVersion: '',
                    newVersionNote: newVersionNote,
                    newVersionGUID: newVersionGUID,
                    progress: getRealProgress($item('progress').text()),
                } as NetIpcUpgradeInfoList
                tempObj.formatState = formatIpcUpgradeState(tempObj)
                tempObj.formatNewVersion = formatIpcNewVersion(tempObj)
                // 1. 无新版本的IPC设备（无newVersionGUID），界面不展示；2. IPC处于版本检测中，界面不展示；3. IPC版本小于5.2.0则不支持云升级，界面不展示；
                if (!(!newVersionGUID || tempObj.state === 'checkingVersion' || compareIpcVersion(tempObj.version.split('.').slice(0, 3), ['5', '2', '0']) < 0)) {
                    pageData.value.ipcInfoList.push(tempObj)
                }
            })

            getDataTimer.repeat()
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
        const devUpgrade = () => {
            pageData.value.isCheckAuthPop = true
        }

        /**
         * @description 执行设备云升级 - 确认执行操作
         * @param e
         */
        const confirmDevUpgrade = async (e: UserCheckAuthForm) => {
            getDataTimer.stop()
            const sendXml = rawXml`
                <condition>
                    <versionGUID>${pageData.value.devInfoObj.newVersionGUID}</versionGUID>
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
                getDataTimer.repeat()
            } else {
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
                    case ErrorCode.USER_ERROR_FILE_MISMATCHING:
                        errorInfo = Translate('IDCS_NO_DISK')
                        break
                    case ErrorCode.USER_ERROR_SERVER_NO_EXISTS:
                        errorInfo = Translate('IDCS_LOGIN_OVERTIME')
                        break
                    case ErrorCode.USER_ERROR_UNSUPPORTED_FUNC:
                        errorInfo = Translate('IDCS_DEVICE_NOT_ALLOW_UPGRADE')
                        break
                    default:
                        errorInfo = Translate('IDCS_CLOUD_UPGRADE_FAIED')
                        break
                }
                openMessageBox(errorInfo)
                getDataTimer.repeat()
            }
        }

        /**
         * @description 执行ipc云升级 - 单个升级/批量升级
         * @param ipcInfoList: NetIpcUpgradeInfoList
         */
        const ipcUpgrade = (ipcInfoList: NetIpcUpgradeInfoList[]) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_IPC_UPGRADE_FINISH_RESTART'),
            }).then(() => {
                confirmIpcUpgrade(ipcInfoList)
            })
        }

        /**
         * @description 执行ipc云升级 - 确认执行操作
         * @param ipcInfoList: NetIpcUpgradeInfoList
         */
        const confirmIpcUpgrade = async (ipcInfoList: NetIpcUpgradeInfoList[]) => {
            const sendXml = rawXml`
                    <condition>
                        <chls type="list">${ipcInfoList.map((item) => `<item id="${item.chlId}">${item.newVersionGUID}</item>`).join('')}</chls>
                    </condition>
                `
            const result = await cloudUpgradeNode(sendXml)
            commSaveResponseHandler(result)
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
            getData()
        }

        /**
         * @description 查看ipc升级详情
         * @param {Number} index
         */
        const showDetail = (index: number) => {
            pageData.value.isDetailPop = true
            pageData.value.activeTableIndex = index
        }

        /**
         * @description 切换日志详情选中
         * @param index
         */
        const changeDetail = (index: number) => {
            pageData.value.activeTableIndex = index
        }

        /**
         * @description 关闭日志详情弹窗
         */
        const closeDetail = () => {
            pageData.value.isDetailPop = false
        }

        /**
         * @description 格式化ipc云升级通道的新版本信息
         */
        const formatIpcNewVersion = (ipcInfo: NetIpcUpgradeInfoList) => {
            let newVersion = ipcInfo.newVersion
            if (['installSuccess', 'latest'].indexOf(ipcInfo.state) > -1 && !ipcInfo.newVersionGUID) {
                newVersion = Translate('IDCS_ONLINE_UPGRADE_TIP_LATEST')
            }
            return newVersion || '--'
        }

        /**
         * @description 格式化ipc云升级通道的状态变迁
         */
        const formatIpcUpgradeState = (ipcInfo: NetIpcUpgradeInfoList) => {
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
                    if (CLOUD_UPGRADE_FAILSTATE_ENUM.indexOf(ipcInfo.state) > -1 && ipcInfo.newVersionGUID) {
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
            if (progress === undefined || progress === '') return ''
            return parseInt(((Number(progress) / RELATIVE_PROGRESS) * 100) as unknown as string) + '%'
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
        const disabledIpcSingleUpgrade = (ipcInfo: NetIpcUpgradeInfoList) => {
            return ipcInfo.state === 'latest' || ipcInfo.state === 'installing' || ipcInfo.state === 'downloading' || ipcInfo.state === 'waitingForUpgrade' || !ipcInfo.newVersionGUID
        }

        /**
         * @description ipc单个详情按钮是否置灰
         */
        const disabledIpcSingleDetail = (ipcInfo: NetIpcUpgradeInfoList) => {
            return ipcInfo.state === 'latest' || !ipcInfo.newVersionGUID
        }

        // 手动检测按钮是否置灰
        const disabledCheckVersion = computed(() => {
            return !pageData.value.isUpdateNotify
        })

        // 设备升级按钮是否置灰
        const disabledDevUpgrade = computed(() => {
            return (
                !pageData.value.isUpdateNotify ||
                pageData.value.devInfoObj.state === 'downloading' ||
                pageData.value.devInfoObj.state === 'downloadSuccess' ||
                pageData.value.devInfoObj.state === 'installing' ||
                !pageData.value.devInfoObj.newVersionGUID
            )
        })

        // ipc批量升级按钮是否置灰
        const disabledIpcUpgrade = computed(() => {
            return !pageData.value.isUpdateNotify
        })

        onMounted(async () => {
            openLoading()
            await getData()
            closeLoading()
        })

        return {
            pageData,
            getData,
            getVersion,
            devUpgrade,
            confirmDevUpgrade,
            ipcUpgrade,
            setData,
            showDetail,
            changeDetail,
            closeDetail,
            disabledIpcSingleUpgrade,
            disabledIpcSingleDetail,
            disabledCheckVersion,
            disabledDevUpgrade,
            disabledIpcUpgrade,
        }
    },
})
