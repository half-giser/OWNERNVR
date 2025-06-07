/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-06-04 17:19:20
 * @Description: 热备机配置
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import HotStandbyWorkMachineAddPop from './HotStandbyWorkMachineAddPop.vue'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
        HotStandbyWorkMachineAddPop,
    },
    setup() {
        const { Translate } = useLangStore()
        // 工作模式名称映射
        const WORKING_MODE_MAPPING: Record<string, string> = {
            '': '',
            workMachineMode: Translate('IDCS_HOT_STANDBY_WORK_MACHINE_MODE'),
            hotStandbyMode: Translate('IDCS_HOT_STANDBY_HOT_STANDBY_MODE'),
        }
        // 热备机连接状态名称映射
        const HOT_STANDBY_CONNECT_STATUS_MAPPING: Record<string, string> = {
            '': '',
            online: Translate('IDCS_CONNECTED'),
            offline: Translate('IDCS_DISCONNECT'),
        }
        // 热备机工作状态名称映射
        const HOT_STANDBY_WORK_STATUS_MAPPING: Record<string, string> = {
            '': '',
            normal: Translate('IDCS_NORMAL'),
            initial: Translate('IDCS_INITIALING'),
            waitingSync: Translate('IDCS_WAITING_SYNC'),
            syncing: Translate('IDCS_SYNCHRONIZING'),
            waitingTakeover: Translate('IDCS_WAITING_TAKEOVER'),
            takeovering: Translate('IDCS_TAKING_OVER'),
            noTakeover: Translate('IDCS_NO_TAKEOVER'),
            monitoring: Translate('IDCS_MONITORING'),
            syncSuspend: Translate('IDCS_SYNC_SUSPEND'),
        }
        // 同步过程错误码映射
        const SYNC_ERRORCODE_MAPPING: Record<number, string> = {
            1: Translate('IDCS_HOT_STANDBY_SYNC_ERROR_NO_EXIST'),
            2: Translate('IDCS_HOT_STANDBY_SYNC_ERROR_NO_STORAGE_SPACE'),
            3: Translate('IDCS_NO_RECORD_DATA'),
            4: Translate('IDCS_HOT_STANDBY_SYNC_ERROR_NO_SUPPORT'),
            5: Translate('IDCS_INVALID_PARAMETER'),
            6: Translate('IDCS_HOT_STANDBY_SYNC_ERROR_BUSY'),
            7: Translate('IDCS_NO_RESOURCE'),
            8: Translate('IDCS_HOT_STANDBY_SYNC_ERROR_IO'),
            9: Translate('IDCS_HOT_STANDBY_SYNC_ERROR_SYNC_DESTROY'),
            10: Translate('IDCS_HOT_STANDBY_SYNC_ERROR_OTHER_SYNC'),
            11: Translate('IDCS_TEST_DDNS_UNKNOWN_ERROR'),
        }
        // 网络错误码映射
        const NETWORK_ERRORCODE_MAPPING: Record<string, string> = {
            '536871035': Translate('IDCS_NO_RESOURCE'), // 资源不足
            '536871030': Translate('IDCS_HOT_STANDBY_SYNC_ERROR_NO_STORAGE_SPACE'), // 没有存储空间
            '536870942': Translate('IDCS_NO_RECORD_DATA'), // 无数据
            '536870975': Translate('IDCS_NOT_SUPPORTFUNC'), // 不支持该功能
            '536870943': Translate('IDCS_INVALID_PARAMETER'), // 无效的参数
            '536870960': Translate('IDCS_DEVICE_BUSY'), // 系统忙
            '536871032': Translate('IDCS_HOT_STANDBY_SYNC_ERROR_IO'), // IO错误
            '536870966': Translate('IDCS_NOT_LOGIN'), // 未登录
            '536871004': Translate('IDCS_HOT_STANDBY_SYNC_ERROR_OTHER_SYNC'), // 其它热备机正在同步
            '536870936': Translate('IDCS_HOT_STANDBY_TEST_ERROR_NOT_WORK_MACHINE') + Translate('IDCS_UNABLE_TO_CONNECT_FORMAT'), // 未处于工作机模式
            '536870945': Translate('IDCS_ANR_RUNNING'), // 断网补录运行中
            '536870940': Translate('IDCS_SERVICE_NOT_READY'), // 服务尚未准备好
        }

        const pageData = ref({
            // 工作模式下拉列表（工作机模式、热备机模式）
            options: [] as SelectOption<string, string>[],
            // 热备机IP
            hotStandbyIp: '',
            // 热备机连接状态
            hotStandbyConnectStatus: '',
            // 热备机工作状态
            hotStandbyWorkStatus: '',
            // 添加、编辑工作机弹框
            isWorkMachinePop: false,
            // 弹框类型
            workMachinePopType: 'add', // add、edit
            // 当前操作的行数据
            currOperateRow: new SystemWorkMachineDto() as SystemWorkMachineDto,
            // 当前操作类型：删除工作机、删除全部工作机、编辑热备配置（这三个操作需要鉴权）
            workMachineOperateType: '',
            // 鉴权弹窗
            isCheckAuthPop: false,
        })
        const formData = ref(new HotStandbySettingsForm())
        const watchEdit = useWatchEditData(formData)
        const tableData = ref<SystemWorkMachineDto[]>([])

        // 记录原始的数据，点击应用按钮时，需要用这些数据做判断
        const initialSwitch = ref(false)
        const initialWorkMode = ref('')

        // 获取工作机状态数据定时器
        const getWorkMachineStatusDataTimer = useClock(() => {
            getWorkMachineStatusData('noLoading')
        }, 5000)
        // 获取热备机状态数据定时器
        const getHotStandbyStatusDataTimer = useClock(() => {
            getHotStandbyStatusData('noLoading')
        }, 5000)
        // 检测重启定时器
        let rebootTimer: NodeJS.Timeout | 0 = 0

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading()
            const result = await queryHotStandbyCfg()
            const $ = queryXml(result)
            closeLoading()

            watchEdit.reset()
            // 当前是否启用热备配置
            formData.value.switch = $('content/switch').text().bool()
            // 当前工作模式（工作机模式、热备机模式）
            formData.value.workMode = $('content/workMode').text()
            // 监听表单变化
            watchEdit.listen()

            // 工作模式下拉列表
            pageData.value.options = $('types/hotStandbyMode/enum').map((item) => {
                const value = item.text() || ''
                const label = WORKING_MODE_MAPPING[value]
                return {
                    value,
                    label,
                }
            })

            // true、false：设备当前热备配置的初始启用状态（打开此界面时候的初始启用状态）
            initialSwitch.value = formData.value.switch
            // workMachineMode、hotStandbyMode：设备当前热备配置的初始模式（打开此界面时候的初始模式）
            initialWorkMode.value = formData.value.workMode
            // 当前是热备机模式就查询工作机列表和状态，当前是工作机模式就查询热备机状态
            if (formData.value.switch) {
                if (formData.value.workMode === 'hotStandbyMode') {
                    // 获取工作机相关信息
                    getWorkMachineListData()
                } else if (formData.value.workMode === 'workMachineMode') {
                    // 获取热备机相关信息
                    getHotStandbyStatusData()
                }
            }
        }

        // 获取工作机列表
        const getWorkMachineListData = async () => {
            openLoading()
            const result = await queryWorkMachineList()
            const $ = queryXml(result)
            closeLoading()

            if ($('status').text() === 'success') {
                tableData.value = $('content/item').map((ele) => {
                    const $ele = queryXml(ele.element)
                    return {
                        ip: $ele('ip').text(),
                        port: $ele('port').text().num(),
                        index: $ele('index').text().num(),
                        connectStatus: '',
                        workStatus: '',
                        statusCode: 0,
                        syncErrorCode: 0,
                        networkErrorCode: 0,
                        syncVideoProgress: 0,
                    }
                })
                getWorkMachineStatusData()
            }
        }

        // 获取工作机状态
        const getWorkMachineStatusData = async (noLoading?: string) => {
            if (!noLoading) {
                openLoading()
            }
            const result = await queryWorkMachineStatus()
            const $ = queryXml(result)
            closeLoading()

            if ($('status').text() === 'success') {
                $('content/item').forEach((ele1) => {
                    const $ele1 = queryXml(ele1.element)
                    tableData.value.forEach((ele2) => {
                        if ($ele1('index').text().num() === ele2.index) {
                            ele2.connectStatus = $ele1('connectStatus').text()
                            ele2.workStatus = $ele1('workStatus').text()
                            ele2.statusCode = $ele1('statusCode').text().num()
                            ele2.syncErrorCode = $ele1('syncErrorCode').text().num()
                            ele2.networkErrorCode = $ele1('networkErrorCode').text().num()
                            ele2.syncVideoProgress = $ele1('syncVideoProgress').text().num()
                        }
                    })
                })
                // 开始轮询
                getWorkMachineStatusDataTimer.repeat()
            }
        }

        // 获取热备机状态
        const getHotStandbyStatusData = async (noLoading?: string) => {
            if (!noLoading) {
                openLoading()
            }
            const result = await queryHotStandbyStatus()
            const $ = queryXml(result)
            closeLoading()

            if ($('status').text() === 'success') {
                $('content/item').forEach((ele) => {
                    const $ele = queryXml(ele.element)
                    pageData.value.hotStandbyIp = $ele('ip').text() || ''
                    pageData.value.hotStandbyConnectStatus = $ele('connectStatus').text() || ''
                    pageData.value.hotStandbyWorkStatus = $ele('workStatus').text() || ''
                })
                // 开始轮询
                getHotStandbyStatusDataTimer.repeat()
            }
        }

        /**
         * @description 添加工作机
         */
        const addWorkMachine = () => {
            pageData.value.workMachinePopType = 'add'
            pageData.value.isWorkMachinePop = true
        }

        /**
         * @description 编辑工作机
         * @param {SystemWorkMachineDto} row
         */
        const editWorkMachine = (row: SystemWorkMachineDto) => {
            pageData.value.currOperateRow = row
            pageData.value.workMachinePopType = 'edit'
            pageData.value.isWorkMachinePop = true
        }

        /**
         * @description 添加、编辑、测试工作机的确认回调
         */
        const confirmWorkMachine = () => {
            pageData.value.isWorkMachinePop = false
            getWorkMachineListData()
        }

        /**
         * @description 删除某个工作机
         * @param {SystemWorkMachineDto} row
         */
        const delWorkMachine = (row: SystemWorkMachineDto) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_WORK_MACHINE_INFO') + Translate('IDCS_CONFIRM_TO_CONTINUE'),
            }).then(() => {
                pageData.value.currOperateRow = row
                pageData.value.workMachineOperateType = 'delOne'
                pageData.value.isCheckAuthPop = true
            })
        }

        /**
         * @description 删除全部工作机
         */
        const delAllWorkMachine = () => {
            if (tableData.value.length === 0) {
                return
            }
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_WORK_MACHINE_INFO') + Translate('IDCS_CONFIRM_TO_CONTINUE'),
            }).then(() => {
                pageData.value.workMachineOperateType = 'delAll'
                pageData.value.isCheckAuthPop = true
            })
        }

        /**
         * @description 应用按钮
         */
        const apply = async () => {
            pageData.value.workMachineOperateType = 'apply'
            openLoading()
            const result = await queryNetCfgV3()
            const $ = queryXml(result)
            closeLoading()

            // 一、先判断是否为DHCP（工作机模式要求网络为非DHCP、热备机模式要求网络为非DHCP并且是网络容错）
            // 如果为DHCP:
            // 1. 工作机模式提示：工作機模式要求設置靜態IP。請修改網路設置后再次嘗試！
            // 2. 熱備機模式提示：熱備機模式要求網路的工作模式為“網路容錯”模式，并且需要設置靜態IP！
            // 如果为非DHCP:
            // 1. 熱備機模式提示：熱備機模式要求網路的工作模式為“網路容錯”模式，并且需要設置靜態IP！
            if ($('status').text() === 'success') {
                let isDhcp = false
                const ipGroupSwitch = $('content/ipGroupConfig/switch').text().bool()
                if (ipGroupSwitch) {
                    $('content/ipGroupConfig/bonds/item').forEach((ele) => {
                        const $ele = queryXml(ele.element)
                        const dhcpSwitch = $ele('dhcpSwitch').text().bool()
                        if (dhcpSwitch) {
                            isDhcp = true
                        }
                    })
                } else {
                    $('content/nicConfigs/item').forEach((ele) => {
                        const $ele = queryXml(ele.element)
                        const dhcpSwitch = $ele('dhcpSwitch').text().bool()
                        if (dhcpSwitch) {
                            isDhcp = true
                        }
                    })
                }

                if (isDhcp) {
                    openMessageBox(
                        formData.value.workMode === 'workMachineMode'
                            ? Translate('IDCS_ENTER_WORK_MACHINE_MODE_LIMIT') + Translate('IDCS_CHANGE_NETWORK_SETTINGS_BEFORE_RETRY')
                            : Translate('IDCS_ENTER_HOT_STANDBY_MODE_LIMIT') + Translate('IDCS_CHANGE_NETWORK_SETTINGS_BEFORE_RETRY'),
                    )
                    return
                } else {
                    if ($('content/curWorkMode').text() !== 'network_fault_tolerance') {
                        openMessageBox(Translate('IDCS_ENTER_HOT_STANDBY_MODE_LIMIT') + Translate('IDCS_CHANGE_NETWORK_SETTINGS_BEFORE_RETRY'))
                        return
                    }
                }
            }

            // 二、以下为弹框提示规则，与设备端保持一致：
            // *** 初始为启用状态 ***：
            // 1. “工作机模式”切换为“热备机模式”，会提示：
            //     0）先判断如果该工作机已被某个热备机添加到其工作机列表了，就弹出选择框“如果退出工作机模式，会导致已连接的热备机一直接管本机，无法接管其它机器！建议在热备机端删除本机后再进行该操作。请确认是否继续？”
            //     1）开启或关闭热备机模式将会清除所有的配置信息和录像数据，请确认是否继续？
            //     2）修改热备机模式设置需要重启系统，确认重启吗？
            // 2. “热备机模式”切换为“工作机模式”，会提示：
            //     1）开启工作机模式，会将通道配置信息（IP、端口、协议、用户名、密码）同步给热备机，请确认是否继续？
            //     2）开启或关闭热备机模式将会清除所有的配置信息和录像数据，请确认是否继续？
            //     3）修改热备机模式设置需要重启系统，确认重启吗？
            // 3.  当前为“工作机模式”，取消勾选启用，会提示：
            //     0）先判断如果该工作机已被某个热备机添加到其工作机列表了，就弹出选择框“如果退出工作机模式，会导致已连接的热备机一直接管本机，无法接管其它机器！建议在热备机端删除本机后再进行该操作。请确认是否继续？”
            //     1）修改热备机模式设置需要重启系统，确认重启吗？
            // 4.  当前为“热备机模式”，取消勾选启用，会提示：
            //     1）开启或关闭热备机模式将会清除所有的配置信息和录像数据，请确认是否继续？
            //     2）修改热备机模式设置需要重启系统，确认重启吗？
            // *** 初始为未启用状态 ***：
            // 1. 勾选启用，且选择“工作机模式”，会提示：
            //     1）开启工作机模式，会将通道配置信息（IP、端口、协议、用户名、密码）同步给热备机，请确认是否继续？
            //     2）修改热备机模式设置需要重启系统，确认重启吗？
            // 2. 勾选启用，且选择“热备机模式”，会提示：
            //     1）开启或关闭热备机模式将会清除所有的配置信息和录像数据，请确认是否继续？
            //     2）修改热备机模式设置需要重启系统，确认重启吗？
            if (formData.value.switch) {
                if (formData.value.workMode === 'workMachineMode') {
                    if (initialSwitch.value) {
                        openMessageBox({
                            type: 'question',
                            message: Translate('IDCS_WORK_MACHINE_PRIVACY_WARNGING'),
                        }).then(() => {
                            openMessageBox({
                                type: 'question',
                                message: Translate('IDCS_HOT_STANDBY_MODE_CLEAN_ALL_WARNING') + Translate('IDCS_CONFIRM_TO_CONTINUE'),
                            }).then(() => {
                                openMessageBox({
                                    type: 'question',
                                    message: Translate('IDCS_HOT_STANDBY_MODE_CHANGE_AFTER_REBOOT') + Translate('IDCS_CONFIRM_TO_REBOOT'),
                                }).then(() => {
                                    pageData.value.isCheckAuthPop = true
                                })
                            })
                        })
                    } else {
                        openMessageBox({
                            type: 'question',
                            message: Translate('IDCS_WORK_MACHINE_PRIVACY_WARNGING'),
                        }).then(() => {
                            openMessageBox({
                                type: 'question',
                                message: Translate('IDCS_HOT_STANDBY_MODE_CHANGE_AFTER_REBOOT') + Translate('IDCS_CONFIRM_TO_REBOOT'),
                            }).then(() => {
                                pageData.value.isCheckAuthPop = true
                            })
                        })
                    }
                } else if (formData.value.workMode === 'hotStandbyMode') {
                    if (pageData.value.hotStandbyConnectStatus === 'online') {
                        openMessageBox({
                            type: 'question',
                            message: Translate('IDCS_WORK_MACHINE_CHANGE_MODE_WARNING') + Translate('IDCS_CONFIRM_TO_CONTINUE'),
                        }).then(() => {
                            openMessageBox({
                                type: 'question',
                                message: Translate('IDCS_HOT_STANDBY_MODE_CLEAN_ALL_WARNING') + Translate('IDCS_CONFIRM_TO_CONTINUE'),
                            }).then(() => {
                                openMessageBox({
                                    type: 'question',
                                    message: Translate('IDCS_HOT_STANDBY_MODE_CHANGE_AFTER_REBOOT') + Translate('IDCS_CONFIRM_TO_REBOOT'),
                                }).then(() => {
                                    pageData.value.isCheckAuthPop = true
                                })
                            })
                        })
                    } else {
                        openMessageBox({
                            type: 'question',
                            message: Translate('IDCS_HOT_STANDBY_MODE_CLEAN_ALL_WARNING') + Translate('IDCS_CONFIRM_TO_CONTINUE'),
                        }).then(() => {
                            openMessageBox({
                                type: 'question',
                                message: Translate('IDCS_HOT_STANDBY_MODE_CHANGE_AFTER_REBOOT') + Translate('IDCS_CONFIRM_TO_REBOOT'),
                            }).then(() => {
                                pageData.value.isCheckAuthPop = true
                            })
                        })
                    }
                }
            } else {
                if (initialWorkMode.value === 'workMachineMode') {
                    if (pageData.value.hotStandbyConnectStatus === 'online') {
                        openMessageBox({
                            type: 'question',
                            message: Translate('IDCS_WORK_MACHINE_CHANGE_MODE_WARNING') + Translate('IDCS_CONFIRM_TO_CONTINUE'),
                        }).then(() => {
                            openMessageBox({
                                type: 'question',
                                message: Translate('IDCS_HOT_STANDBY_MODE_CHANGE_AFTER_REBOOT') + Translate('IDCS_CONFIRM_TO_REBOOT'),
                            }).then(() => {
                                pageData.value.isCheckAuthPop = true
                            })
                        })
                    } else {
                        openMessageBox({
                            type: 'question',
                            message: Translate('IDCS_HOT_STANDBY_MODE_CHANGE_AFTER_REBOOT') + Translate('IDCS_CONFIRM_TO_REBOOT'),
                        }).then(() => {
                            pageData.value.isCheckAuthPop = true
                        })
                    }
                } else if (initialWorkMode.value === 'hotStandbyMode') {
                    openMessageBox({
                        type: 'question',
                        message: Translate('IDCS_HOT_STANDBY_MODE_CLEAN_ALL_WARNING') + Translate('IDCS_CONFIRM_TO_CONTINUE'),
                    }).then(() => {
                        openMessageBox({
                            type: 'question',
                            message: Translate('IDCS_HOT_STANDBY_MODE_CHANGE_AFTER_REBOOT') + Translate('IDCS_CONFIRM_TO_REBOOT'),
                        }).then(() => {
                            pageData.value.isCheckAuthPop = true
                        })
                    })
                }
            }
        }

        /**
         * @description 提交协议
         */
        const setData = async (e: UserCheckAuthForm) => {
            if (pageData.value.workMachineOperateType === 'apply') {
                openLoading()
                const sendXml = rawXml`
                    <content>
                        <switch>${formData.value.switch}</switch>
                        <workMode>${formData.value.workMode}</workMode>
                    </content>
                    <auth>
                        <userName>${e.userName}</userName>
                        <password>${e.hexHash}</password>
                    </auth>
                `
                const result = await editHotStandbyCfg(sendXml)
                const $ = queryXml(result)
                closeLoading()

                if ($('status').text() === 'success') {
                    pageData.value.isCheckAuthPop = false
                    // 检测重启
                    openLoading(LoadingTarget.FullScreen, Translate('IDCS_REBOOTING'))
                    rebootTimer = reconnect()
                    // 重置定时器
                    getWorkMachineStatusDataTimer.stop()
                    getHotStandbyStatusDataTimer.stop()
                    watchEdit.update()
                } else {
                    closeLoading()
                    const errorCode = $('errorCode').text().num()
                    handleErrorMsg(errorCode)
                }
            } else if (pageData.value.workMachineOperateType === 'delOne') {
                openLoading()
                const sendXml = rawXml`
                    <content>
                        <index>${pageData.value.currOperateRow.index}</index>
                    </content>
                    <auth>
                        <userName>${e.userName}</userName>
                        <password>${e.hexHash}</password>
                    </auth>
                `
                const result = await deleteWorkMachine(sendXml)
                const $ = queryXml(result)
                closeLoading()

                if ($('status').text() === 'success') {
                    pageData.value.isCheckAuthPop = false
                    // 删除工作机后，重新获取工作机列表
                    getWorkMachineListData()
                } else {
                    const errorCode = $('errorCode').text().num()
                    handleErrorMsg(errorCode)
                }
            } else if (pageData.value.workMachineOperateType === 'delAll') {
                openLoading()
                const sendXml = rawXml`
                    <content>
                        ${tableData.value
                            .map((element) => {
                                return rawXml`
                                    <index>${element.index}</index>
                                `
                            })
                            .join('')}
                    </content>
                    <auth>
                        <userName>${e.userName}</userName>
                        <password>${e.hexHash}</password>
                    </auth>
                `
                const result = await deleteWorkMachine(sendXml)
                const $ = queryXml(result)
                closeLoading()

                if ($('status').text() === 'success') {
                    pageData.value.isCheckAuthPop = false
                    // 删除工作机后，重新获取工作机列表
                    getWorkMachineListData()
                } else {
                    const errorCode = $('errorCode').text().num()
                    handleErrorMsg(errorCode)
                }
            }
        }

        /**
         * @description 错误信息处理
         * @param {number} errorCode
         */
        const handleErrorMsg = (errorCode: number) => {
            switch (errorCode) {
                case ErrorCode.USER_ERROR_NO_USER:
                case ErrorCode.USER_ERROR_PWD_ERR:
                    openMessageBox(Translate('IDCS_DEVICE_PWD_ERROR'))
                    break
                case ErrorCode.USER_ERROR_NO_AUTH:
                    openMessageBox(Translate('IDCS_NO_AUTH'))
                    break
                case ErrorCode.HTTPS_ACTIVED:
                    openMessageBox(
                        formData.value.workMode === 'workMachineMode'
                            ? Translate('IDCS_ENTER_WORK_MACHINE_MODE_LIMIT') + Translate('IDCS_CHANGE_NETWORK_SETTINGS_BEFORE_RETRY')
                            : Translate('IDCS_ENTER_HOT_STANDBY_MODE_LIMIT') + Translate('IDCS_CHANGE_NETWORK_SETTINGS_BEFORE_RETRY'),
                    )
                    break
                default:
                    openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                    break
            }
        }

        /**
         * @description 序号字段格式化
         * @param {SystemWorkMachineDto} row
         * @returns {string}
         */
        const displaySerialNum = (row: SystemWorkMachineDto) => {
            return `${row.index}`
        }

        /**
         * @description 工作状态字段格式化
         * @param {SystemWorkMachineDto} row
         * @returns {string}
         */
        const displayWorkStatus = (row: SystemWorkMachineDto) => {
            let workStatusTips = ''
            if (row.workStatus === 'syncing') {
                workStatusTips = HOT_STANDBY_WORK_STATUS_MAPPING[row.workStatus] + ' (' + (row.syncVideoProgress + '%') + ') '
            } else if (row.workStatus === 'syncSuspend') {
                const syncErrorCode = row.syncErrorCode
                const networkErrorCode = row.networkErrorCode
                if (syncErrorCode && syncErrorCode !== 0) {
                    workStatusTips = HOT_STANDBY_WORK_STATUS_MAPPING[row.workStatus] + ' (' + SYNC_ERRORCODE_MAPPING[syncErrorCode] + ') '
                } else if (networkErrorCode && networkErrorCode !== 0) {
                    workStatusTips = HOT_STANDBY_WORK_STATUS_MAPPING[row.workStatus] + ' (' + NETWORK_ERRORCODE_MAPPING[networkErrorCode] + ') '
                } else {
                    workStatusTips = HOT_STANDBY_WORK_STATUS_MAPPING[row.workStatus]
                }
            } else {
                workStatusTips = HOT_STANDBY_WORK_STATUS_MAPPING[row.workStatus]
            }
            return workStatusTips
        }

        onMounted(() => {
            getData()
        })

        onBeforeUnmount(() => {
            clearTimeout(rebootTimer)
            getWorkMachineStatusDataTimer.stop()
            getHotStandbyStatusDataTimer.stop()
        })

        return {
            pageData,
            formData,
            tableData,
            watchEdit,
            addWorkMachine,
            editWorkMachine,
            confirmWorkMachine,
            delWorkMachine,
            delAllWorkMachine,
            apply,
            setData,
            displaySerialNum,
            displayWorkStatus,
            initialSwitch,
            initialWorkMode,
            HOT_STANDBY_CONNECT_STATUS_MAPPING,
            HOT_STANDBY_WORK_STATUS_MAPPING,
        }
    },
})
