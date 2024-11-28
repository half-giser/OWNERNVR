/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-13 16:05:05
 * @Description: 通道 - IPC升级弹窗
 */
import { type ChannelInfoDto } from '@/types/apiType/channel'
import WebsocketState from '@/utils/websocket/websocketState'
import WebsocketUpload from '@/utils/websocket/websocketUpload'
import { type UploadFile, type UploadInstance, type UploadRawFile, genFileId } from 'element-plus'
import { getRandomGUID } from '@/utils/websocket/websocketCmd'

export default defineComponent({
    setup(_prop, { expose }) {
        const { openMessageBox } = useMessageBox()
        const { Translate } = useLangStore()
        const ipcUpgradePopVisiable = ref(false)
        const productModelOptionList = ref<SelectOption<string, string>[]>([])
        const selectedProductModel = ref('')
        const type = ref<'single' | 'multiple'>('single') // 单个：single, 批量：multiple
        const upload = ref<UploadInstance>()
        const fileName = ref('')
        const btnOKDisabled = ref(true)

        const statusMap: Record<string, string> = {
            1: 'notActive', // 未激活
            2: 'progress', // 正在升级
            3: 'error', // 升级失败
            4: 'success', // 升级成功
            5: 'error', // 校验头文件失败
        }
        let wsState: WebsocketState | null
        let wsUpload: WebsocketUpload | null

        let chlData: ChannelInfoDto[] = [] // 所有通道
        let tempData: ChannelInfoDto[] = [] // 临时存储选中通道数据
        let contextMap: Record<string, ChannelInfoDto> = {}
        let uploadData: ChannelInfoDto[] = [] // 选中升级的通道
        let handleIndex = 0 // 已升级成功（失败）个数
        let file: UploadRawFile | undefined = undefined
        const taskGUIDMap = {} as Record<string, ChannelInfoDto[]> // 插件上传IPC升级包任务ID-上传通道数组

        const plugin = usePluginHook({
            onMessage: ($) => {
                //升级进度
                if ($("statenotify[@type='FileNetTransportProgress']").length) {
                    const taskGUID = $('statenotify/taskGUID').text().toLowerCase()
                    if (taskGUIDMap[taskGUID]) {
                        const progress = $('statenotify/progress').text().replace('%', '')
                        taskGUIDMap[taskGUID].forEach((ele) => {
                            changeStatus(ele, 'progress', progress)
                        })
                        if (progress === '100') {
                            openMessageBox({
                                type: 'info',
                                message: Translate('IDCS_UPGRADE_IPC_NOTE'),
                            })
                        }
                    }
                }
                //连接成功
                // else if ($("statenotify[@type='connectstate']").length) {
                //     const status = $("statenotify[@type='connectstate']").text()
                // }
                // 网络断开
                else if ($("statenotify[@type='FileNetTransport']").length) {
                    if ($('statenotify/errorCode').length) {
                        const taskGUID = $('statenotify/taskGUID').text().toLowerCase()
                        const errorCode = $('statenotify/errorCode').text().num()
                        if (taskGUIDMap[taskGUID]) handleError(errorCode)
                    }
                }
            },
        })

        const isSupportH5 = computed(() => {
            return plugin.IsSupportH5()
        })

        const init = (_type: 'single' | 'multiple', data: ChannelInfoDto[]) => {
            destory()
            type.value = _type
            tempData = data
            ipcUpgradePopVisiable.value = true
        }

        const opened = () => {
            upload.value?.clearFiles()
            file = undefined
            fileName.value = ''
            btnOKDisabled.value = true
            if (type.value === 'multiple') {
                const tmpList: string[] = []
                chlData.forEach((ele) => {
                    if (ele.protocolType === 'TVT_IPCAMERA' && ele.productModel && ele.productModel.innerText) {
                        const value = ele.productModel.innerText
                        if (tmpList.indexOf(value) === -1) tmpList.push(value)
                    }
                })
                productModelOptionList.value = arrayToOption(tmpList)
            }

            if (productModelOptionList.value.length) {
                selectedProductModel.value = productModelOptionList.value[0].value
            }
        }

        // websocket监听升级状态
        const initWsState = (list: ChannelInfoDto[]) => {
            destroyWsState()
            chlData = list
            contextMap = {}
            chlData.forEach((ele) => {
                contextMap[ele.id] = ele
            })
            if (isSupportH5.value) {
                // 监听升级进度
                wsState = new WebsocketState({
                    config: {
                        ipc_upgrade_state_info: true,
                    },
                    onmessage: (data: any) => {
                        if (data && data.ipc_upgrade_state_info) {
                            data.ipc_upgrade_state_info.forEach((ele: any) => {
                                const chlId = ele.node_id
                                const status = ele.chl_upgrade_status
                                const progress = ele.pack_upload_precent
                                changeStatus(contextMap[chlId], statusMap[status], progress)
                            })
                        }
                    },
                })
            }
        }

        // 更新IPC升级状态
        const changeStatus = (rowData: ChannelInfoDto, status: string, progress: string) => {
            if (status === 'progress') {
                rowData.upgradeStatus = status
                rowData.upgradeProgressText = progress + '%'
            } else if (status === 'error' || status === 'success') {
                rowData.upgradeStatus = status
                handleIndex++
                if (handleIndex === uploadData.length) destory()
            }
        }

        // 断开websocket状态信息订阅链接
        const destroyWsState = () => {
            if (wsState) {
                wsState.destroy()
                wsState = null
            }
            chlData = []
            contextMap = {}
        }

        // 重置参数
        const destory = () => {
            file = undefined
            handleIndex = 0
            wsUpload?.close()
            wsUpload = null
        }

        const handleError = (errorCode: number) => {
            // 恢复为默认状态
            tempData.forEach((ele) => {
                ele.upgradeStatus = 'normal'
            })
            if (errorCode === ErrorCode.USER_ERROR_DEVICE_BUSY) {
                // 设备忙
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_DEVICE_BUSY'),
                })
            } else if (errorCode === ErrorCode.USER_ERROR_FILE_MISMATCHING) {
                // 无磁盘
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_NO_DISK'),
                })
            } else {
                // 提示错误图标
                tempData.forEach((ele: ChannelInfoDto) => {
                    ele.upgradeStatus = 'error'
                })
            }
            destory()
        }

        const handleChange = (uploadFile: UploadFile) => {
            file = uploadFile.raw
            fileName.value = file!.name
            btnOKDisabled.value = false
        }

        const handleExceed = (files: Array<File>) => {
            upload.value!.clearFiles()
            const file = files[0] as UploadRawFile
            file.uid = genFileId()
            upload.value!.handleStart(file)
        }

        const handleOcxBtnClick = () => {
            const sendXML = OCX_XML_OpenFileBrowser('OPEN_FILE')
            plugin.AsynQueryInfo(plugin.GetVideoPlugin(), sendXML, (result) => {
                const path = OCX_XML_OpenFileBrowser_getpath(result).trim()
                if (path) {
                    fileName.value = path
                    btnOKDisabled.value = false
                }
            })
        }

        const save = () => {
            uploadData = tempData
            const ids: string[] = []
            if (type.value === 'multiple') {
                uploadData = []
                chlData.forEach((ele) => {
                    if (ele.productModel && ele.productModel.innerText) {
                        if (selectedProductModel.value === ele.productModel.innerText) uploadData.push(ele)
                    }
                })
            }
            uploadData.forEach((ele) => {
                ids.push(ele.id)
                ele.upgradeStatus = 'progress'
                ele.upgradeProgressText = '0%'
            })
            if (isSupportH5.value) {
                wsUpload = new WebsocketUpload({
                    file: file as Blob,
                    config: {
                        file_id: 'ipc_upgrade_file',
                        size: file!.size,
                        sign_method: 'MD5',
                        param: {
                            ipc_ids: ids,
                        },
                    },
                    error: (errorCode: number) => {
                        handleError(errorCode)
                    },
                    success: () => {},
                    progress: () => {},
                })
            } else {
                const taskGUID = getRandomGUID()
                taskGUIDMap[taskGUID] = uploadData
                const param = {
                    filePath: fileName.value,
                    version: 'SmallMemory',
                    progressInterval: 500,
                    chlIds: ids,
                    taskGUID: taskGUID,
                }
                const sendXML = OCX_XML_FileNetTransport('UpgradeIPC', param)
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            ipcUpgradePopVisiable.value = false
        }

        expose({
            init,
            initWsState,
        })

        return {
            opened,
            productModelOptionList,
            selectedProductModel,
            ipcUpgradePopVisiable,
            type,
            upload,
            file,
            fileName,
            handleChange,
            handleExceed,
            btnOKDisabled,
            isSupportH5,
            handleOcxBtnClick,
            save,
        }
    },
})
