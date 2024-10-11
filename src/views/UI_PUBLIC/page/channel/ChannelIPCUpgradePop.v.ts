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
import type WebsocketPlugin from '@/utils/websocket/websocketPlugin'
import { type XMLQuery } from '@/utils/xmlParse'

export default defineComponent({
    setup() {
        const { openMessageTipBox } = useMessageBox()
        const { Translate } = useLangStore()
        const Plugin = inject('Plugin') as PluginType
        const isSupportH5 = Plugin.IsSupportH5()
        const ipcUpgradePopVisiable = ref(false)
        const productModelOptionList = ref([] as string[])
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

        const init = (_type: 'single' | 'multiple', data: ChannelInfoDto[]) => {
            if (!isSupportH5) {
                Plugin.VideoPluginNotifyEmitter.addListener(LiveNotify2Js)
            }
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
            if (type.value == 'multiple') {
                const tmpList: string[] = []
                chlData.forEach((ele: ChannelInfoDto) => {
                    if (ele.protocolType == 'TVT_IPCAMERA' && ele.productModel && ele.productModel.innerText) {
                        const value = ele.productModel.innerText
                        if (tmpList.indexOf(value) == -1) tmpList.push(value)
                    }
                })
                productModelOptionList.value = tmpList
            }
            selectedProductModel.value = productModelOptionList.value[0]
        }

        // websocket监听升级状态
        const initWsState = (list: ChannelInfoDto[]) => {
            destroyWsState()
            chlData = list
            contextMap = {}
            chlData.forEach((ele: ChannelInfoDto) => {
                contextMap[ele.id] = ele
            })
            if (isSupportH5) {
                // 监听升级进度
                wsState = new WebsocketState({
                    config: {
                        ipc_upgrade_state_info: true,
                    },
                    onmessage: (data: any) => {
                        if (data && data['ipc_upgrade_state_info']) {
                            data['ipc_upgrade_state_info'].forEach((ele: any) => {
                                const chlId = ele['node_id']
                                const status = ele['chl_upgrade_status']
                                const progress = ele['pack_upload_precent']
                                changeStatus(contextMap[chlId], statusMap[status], progress)
                            })
                        }
                    },
                })
            }
        }

        // 更新IPC升级状态
        const changeStatus = (rowData: ChannelInfoDto, status: string, progress: string) => {
            if (status == 'progress') {
                rowData.upgradeStatus = status
                rowData.upgradeProgressText = progress + '%'
            } else if (status == 'error' || status == 'success') {
                rowData.upgradeStatus = status
                handleIndex++
                if (handleIndex == uploadData.length) destory()
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

        const LiveNotify2Js = ($: XMLQuery) => {
            //升级进度
            if ($("statenotify[@type='FileNetTransportProgress']").length > 0) {
                const taskGUID = $("statenotify[@type='FileNetTransportProgress']/taskGUID").text().toLowerCase()
                if (taskGUIDMap[taskGUID]) {
                    const progress = $("statenotify[@type='FileNetTransportProgress']/progress").text().replace('%', '')
                    taskGUIDMap[taskGUID].forEach((ele: ChannelInfoDto) => {
                        changeStatus(ele, 'progress', progress)
                    })
                    if (progress == '100') {
                        openMessageTipBox({
                            type: 'info',
                            message: Translate('IDCS_UPGRADE_IPC_NOTE'),
                        })
                    }
                }
            }

            //连接成功
            // else if ($("statenotify[@type='connectstate']").length > 0) {
            //     const status = $("statenotify[@type='connectstate']").text()
            // }
            // 网络断开
            else if ($("statenotify[@type='FileNetTransport']").length > 0) {
                if ($("statenotify[@type='FileNetTransport']/errorCode").length > 0) {
                    const taskGUID = $("statenotify[@type='FileNetTransport']/taskGUID").text().toLowerCase()
                    const errorCode = Number($("statenotify[@type='FileNetTransport']/errorCode").text())
                    if (taskGUIDMap[taskGUID]) handleError(errorCode)
                }
            }
        }

        const handleError = (errorCode: number) => {
            // 恢复为默认状态
            tempData.forEach((ele: ChannelInfoDto) => {
                ele.upgradeStatus = 'normal'
            })
            if (errorCode === ErrorCode.USER_ERROR_DEVICE_BUSY) {
                // 设备忙
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_DEVICE_BUSY'),
                })
            } else if (errorCode === ErrorCode.USER_ERROR_FILE_MISMATCHING) {
                // 无磁盘
                openMessageTipBox({
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
            Plugin.AsynQueryInfo(Plugin.GetVideoPlugin() as WebsocketPlugin, sendXML, (result: string) => {
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
            if (type.value == 'multiple') {
                uploadData = []
                chlData.forEach((ele: ChannelInfoDto) => {
                    if (ele.productModel && ele.productModel.innerText) {
                        if (selectedProductModel.value == ele.productModel.innerText) uploadData.push(ele)
                    }
                })
            }
            uploadData.forEach((ele: ChannelInfoDto) => {
                ids.push(ele.id)
                ele.upgradeStatus = 'progress'
                ele.upgradeProgressText = '0%'
            })
            if (isSupportH5) {
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
                Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            ipcUpgradePopVisiable.value = false
        }

        return {
            init,
            opened,
            initWsState,
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
