/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-03 09:09:06
 * @Description: 新增车牌弹窗
 */
import { IntelPlateDBAddPlateForm, IntelPlateDBPlateInfo } from '@/types/apiType/intelligentAnalysis'
import IntelLicenceDBEditPop from './IntelLicencePlateDBEditPop.vue'
import { type FormRules } from 'element-plus'
import WebsocketImportPlate from '@/utils/websocket/websocketImportplate'

export default defineComponent({
    components: {
        IntelLicenceDBEditPop,
    },
    props: {
        /**
         * @property {'add' | 'edit' | 'register'} 弹窗类型
         */
        type: {
            type: String,
            default: 'add',
        },
        /**
         * @property 编辑数据
         */
        data: {
            type: Object as PropType<Partial<IntelPlateDBPlateInfo>>,
            default: new IntelPlateDBPlateInfo(),
        },
    },
    emits: {
        confirm() {
            return true
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const userSession = useUserSessionStore()

        const groupMap: Record<string, string> = {}

        const pageData = ref({
            // 是否打开新增分组弹窗
            isAddPop: false,
            // 分组选项
            groupList: [] as SelectOption<string, string>[],
            // tab选项
            tabs: [
                {
                    label: Translate('IDCS_ADD_LICENSE_PLATE'),
                    value: 'form',
                },
                {
                    label: Translate('IDCS_BULK_ENTRY'),
                    value: 'import',
                },
            ],
            // 当前tab
            tab: 'form',
            csvTitle: ['(B1)' + Translate('IDCS_LICENSE_PLATE_NUM'), '(B2)' + Translate('IDCS_VEHICLE_OWNER'), '(B3)' + Translate('IDCS_PHONE_NUMBER'), '(N1)' + Translate('IDCS_VEHICLE_TYPE')],
            // 是否禁用Tab
            disabledTab: userSession.appType === 'P2P' || isHttpsLogin(),
            // 导入框是否drag状态
            isDrag: false,
            // 导入的文件名
            fileName: '',
            // 导入的文件数据
            fileData: [] as IntelPlateDBAddPlateForm[],
        })

        const formRef = useFormRef()
        const formData = ref(new IntelPlateDBAddPlateForm())
        const formRule = ref<FormRules>({
            plateNumber: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_VEHICLE_NUMBER_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            groupId: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PLATE_LIBRARY_GROUP_NOT_EXIST')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        // 标题与文本的映射
        const TITLE_MAPPING: Record<string, string> = {
            add: Translate('IDCS_ADD'),
            edit: Translate('IDCS_EDIT'),
            register: Translate('IDCS_REGISTER'),
        }

        const plugin = setupPlugin({
            onMessage: ($) => {
                if ($('statenotify[@type="UploadIPCAudioBase64"]').length) {
                    const $item = queryXml($('statenotify')[0].element)
                    if ($item('status').text() === 'success') {
                        const fileBase64 = $item('base64').text()
                        const filePath = $item('filePath').text()
                        pageData.value.fileName = filePath.replace(/\\/g, '/').split('/').pop()!
                        const file = base64ToFile(fileBase64, pageData.value.fileName)
                        parseFiles(file)
                    } else {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_OUT_FILE_SIZE'),
                        })
                        closeLoading()
                    }
                }
                //网络断开
                else if ($('statenotify[@type="FileNetTransport"]').length) {
                    closeLoading()
                    if ($('statenotify/errorCode').text().num() === ErrorCode.USER_ERROR_NODE_NET_DISCONNECT) {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_OCX_NET_DISCONNECT'),
                        })
                    }
                }
            },
        })

        const mode = computed(() => {
            return plugin.IsSupportH5() ? 'h5' : 'ocx'
        })

        // 回显标题
        const displayTitle = computed(() => {
            return TITLE_MAPPING[prop.type]
        })

        /**
         * @description 打开新增分组弹窗
         */
        const addGroup = () => {
            pageData.value.isAddPop = true
        }

        /**
         * @description 确认新增分组 刷新数据
         */
        const confirmAddGroup = () => {
            pageData.value.isAddPop = false
            getGroupList()
        }

        /**
         * @description 获取分组选项
         */
        const getGroupList = async () => {
            openLoading()

            const result = await queryPlateLibrary()
            const $ = queryXml(result)

            closeLoading()

            pageData.value.groupList = $('content/group/item').map((item) => {
                const $item = queryXml(item.element)
                groupMap[$item('name').text()] = item.attr('id')
                return {
                    value: item.attr('id'),
                    label: $item('name').text(),
                }
            })
        }

        /**
         * @description 弹出错误信息
         * @param {number} errorCode
         */
        const handleError = (errorCode: number) => {
            let errorInfo = ''
            switch (errorCode) {
                case ErrorCode.USER_ERROR_CANNOT_DEL_CUR_USER:
                    errorInfo = Translate('IDCS_OVER_MAX_NUMBER_LIMIT')
                    break
                case ErrorCode.USER_ERROR_NAME_EXISTED:
                    errorInfo = Translate('IDCS_PLATE_NAME_SAME')
                    break
                case ErrorCode.USER_ERROR_HOT_POINT_EXISTS:
                    errorInfo = Translate('IDCS_PLATE_LIBRARY_GROUP_NOT_EXIST')
                    break
                case ErrorCode.USER_ERROR_NO_AUTH:
                    errorInfo = Translate('IDCS_NO_AUTH')
                    break
                case ErrorCode.USER_ERROR_INVALID_PARAM:
                    errorInfo = Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_FTP_ERROR_INVALID_PARAM')
                    break
                case ErrorCode.USER_ERROR_SERVER_NO_EXISTS:
                    errorInfo = Translate('IDCS_INVALID_PARAMETER')
                    break
                default:
                    errorInfo = Translate('IDCS_ADD_FACE_FAIL')
                    break
            }
            openMessageBox({
                type: 'info',
                message: errorInfo,
            })
        }

        /**
         * @description 新增单个车牌
         */
        const addPlate = async () => {
            openLoading()

            const form = formData.value
            const sendXML = rawXml`
                <content>
                    <plate type="list">
                        <item>
                            <plateNumber>${form.plateNumber}</plateNumber>
                            <groupId>${form.groupId}</groupId>
                            <owner>${form.owner}</owner>
                            <ownerPhone>${form.ownerPhone}</ownerPhone>
                            <vehicleType>${form.vehicleType}</vehicleType>
                        </item>
                    </plate>
                </content>
            `
            const result = await addPlateNumber(sendXML)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).finally(() => {
                    ctx.emit('confirm')
                })
            } else {
                handleError($('errorCode').text().num())
            }
        }

        /**
         * @description 编辑单个车牌
         */
        const editPlate = async () => {
            openLoading()

            const form = formData.value
            const sendXml = rawXml`
                <content>
                    <plate type="list">
                        <item id="${form.groupId}">
                            <plateNumber>${form.plateNumber}</plateNumber>
                            <groupId>${form.groupId}</groupId>
                            <owner>${form.owner}</owner>
                            <ownerPhone>${form.ownerPhone}</ownerPhone>
                            <vehicleType>${form.vehicleType}</vehicleType>
                        </item>
                    </plate>
                </content>
            `
            const result = await editPlateNumber(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).finally(() => {
                    ctx.emit('confirm')
                })
            } else {
                handleError($('errorCode').text().num())
            }
        }

        /**
         * @description 打开弹窗时，重置表单
         */
        const open = async () => {
            pageData.value.tab = 'form'
            pageData.value.fileName = ''
            pageData.value.fileData = []
            formData.value = new IntelPlateDBAddPlateForm()
            if (prop.type === 'edit') {
                formData.value.plateNumber = !prop.data.plateNumber || prop.data.plateNumber === '--' ? '' : prop.data.plateNumber
                formData.value.owner = prop.data.owner || ''
                formData.value.ownerPhone = prop.data.ownerPhone || ''
                formData.value.vehicleType = prop.data.vehicleType || ''
            }

            if (prop.type === 'register') {
                formData.value.plateNumber = !prop.data.plateNumber || prop.data.plateNumber === '--' ? '' : prop.data.plateNumber
            }

            await getGroupList()
            if (pageData.value.groupList.length) {
                if (!prop.data.groupId) {
                    formData.value.groupId = pageData.value.groupList[0].value
                } else {
                    formData.value.groupId = prop.data.groupId
                }
            }
        }

        /**
         * @description 点击确认时，校验表单，再执行新增或编辑
         */
        const verify = () => {
            if (pageData.value.tab === 'form') {
                formRef.value!.validate((valid) => {
                    if (valid) {
                        if (prop.type === 'add' || prop.type === 'register') {
                            addPlate()
                        } else {
                            if (prop.data.groupId && prop.data.groupId !== formData.value.groupId) {
                                openMessageBox({
                                    type: 'question',
                                    message: Translate('IDCS_CHANGE_PLATE_GROUP_TIP'),
                                }).then(() => {
                                    editPlate()
                                })
                            } else {
                                editPlate()
                            }
                        }
                    }
                })
            } else {
                if (pageData.value.fileName.indexOf('.csv') === -1) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_NO_CHOOSE_TDB_FILE'),
                    })
                } else if (!pageData.value.fileData.length) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_IMPORT_FAIL'),
                    })
                } else if (!formData.value.groupId) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_PLATE_LIBRARY_GROUP_NOT_EXIST'),
                    })
                }
                addPlates()
            }
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description OCX导入的回调
         */
        const handleOCXImport = () => {
            if (plugin.IsPluginAvailable()) {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
            }

            const sendXML = OCX_XML_OpenFileBrowser('OPEN_FILE', 'csv')
            plugin.AsynQueryInfo(sendXML, (result) => {
                const path = OCX_XML_OpenFileBrowser_getpath(result).trim()
                if (path) {
                    const sendXML = OCX_XML_UploadIPCAudioBase64(path)
                    plugin.ExecuteCmd(sendXML)
                    openLoading()
                }
            })
        }

        /**
         * @description dragover回调
         * @param {Event} e
         */
        const handleDragOver = (e: Event) => {
            e.preventDefault()
            pageData.value.isDrag = true
        }

        /**
         * @description dragleave回调
         * @param {Event} e
         */
        const handleDragLeave = (e: Event) => {
            e.preventDefault()
            pageData.value.isDrag = false
        }

        /**
         * @description 解析CSV/TXT数据成json
         * @param {string} data
         * @param {string} separator
         * @returns {IntelFaceDBImportFaceDto[]}
         */
        const formatDataFile = (data: string, separator: string) => {
            const rowData = data.indexOf('\r\n') > -1 ? data.split('\r\n') : data.split('\n')
            const firstRow = rowData[0]
            const indexDataMap = [
                ['B1', 'plateNumber'],
                ['B2', 'owner'],
                ['B3', 'ownerPhone'],
                ['N1', 'vehicleType'],

                ['01', 'plateNumber'],
                ['03', 'owner'],
                ['04', 'ownerPhone'],
                ['02', 'vehicleType'],
            ]
            const dataIndexArray: [string, number][] = []

            firstRow.split(separator).forEach((item, index) => {
                for (let i = 0; i < indexDataMap.length; i++) {
                    if (item.includes(indexDataMap[i][0])) {
                        dataIndexArray.push([indexDataMap[i][1], index])
                        break
                    }
                }
            })
            if (!dataIndexArray.length) {
                throw new Error()
            }
            const dataIndexMap = Object.fromEntries(dataIndexArray)
            indexDataMap.forEach((item) => {
                if (typeof dataIndexMap[item[1]] === 'undefined') {
                    dataIndexMap[item[1]] = 10000
                }
            })
            // 删除最后一行换行符导致的空数据
            if (!rowData[rowData.length - 1]) {
                rowData.pop()
            }
            return rowData.slice(1, rowData.length).map((item) => {
                const split = item.split(separator)

                return {
                    plateNumber: split[dataIndexMap.plateNumber] || '',
                    groupId: '',
                    owner: split[dataIndexMap.owner] || '',
                    ownerPhone: split[dataIndexMap.ownerPhone] || '',
                    vehicleType: split[dataIndexMap.vehicleType] || '',
                }
            })
        }

        /**
         * @description 读取CSV/TXT文件
         * @param {File} file
         * @param {string} fileType
         */
        const parseDataFile = (file: File, fileType: string) => {
            return new Promise((resolve: (e: IntelPlateDBAddPlateForm[]) => void, reject: (e: string) => void) => {
                if (!fileType) {
                    resolve([])
                    return
                }
                const reader = new FileReader()
                reader.readAsText(file)
                reader.onloadend = () => {
                    const separator = fileType === 'txt' ? '\t' : ','
                    try {
                        const map = formatDataFile(reader.result as string, separator)
                        resolve(map)
                    } catch {
                        reject(Translate('IDCS_FILE_NOT_AVAILABLE'))
                    }
                }
            })
        }

        /**
         * @description 解析CSV文件数据
         * @param {File} file
         */
        const parseFiles = async (file: File) => {
            const fileType = file.name.split('.').pop()
            if (fileType !== 'csv') {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_FILE_NOT_AVAILABLE'),
                })
                return
            }
            pageData.value.fileName = file.name

            openLoading()
            pageData.value.fileData = await parseDataFile(file, 'csv')
            closeLoading()
        }

        const handleDrop = (e: DragEvent) => {
            e.preventDefault()
            pageData.value.isDrag = false
            const files = e.dataTransfer?.files
            if (files) {
                parseFiles(files[0])
            }
        }

        /**
         * @description H5方式导入文件
         * @param {Event} e
         */
        const handleH5Import = (e: Event) => {
            const files = (e.target as HTMLInputElement).files
            if (files) {
                parseFiles(files[0])
            }
        }

        let ws: WebsocketImportPlate | null = null

        /**
         * @description 批量新增车牌
         */
        const addPlates = () => {
            const plateList = pageData.value.fileData
                .filter((item) => !!item.plateNumber)
                .map((item) => {
                    return {
                        vehicle_plate_group_id: formData.value.groupId,
                        plate_number: item.plateNumber,
                        owner: item.owner,
                        owner_phone: item.ownerPhone,
                        vehicle_type: item.vehicleType,
                    }
                })
            if (!plateList.length) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_IMPORT_FAIL'),
                })
            }
            ws = new WebsocketImportPlate({
                plateDataList: plateList,
                onsuccess() {
                    closeLoading()
                    ws?.stop()
                    openMessageBox({
                        type: 'success',
                        message: Translate('IDCS_IMPORT_SUCCESSED'),
                    }).then(() => {
                        ctx.emit('confirm')
                    })
                },
                onprogress(step) {
                    openLoading(LoadingTarget.FullScreen, Translate('IDCS_IMPORT_PROGRESS_NUM_TIP').formatForLang(step))
                },
                onerror(errorCode) {
                    closeLoading()
                    ws?.stop()

                    let errorInfo = ''

                    switch (errorCode) {
                        case ErrorCode.USER_ERROR_PWD_ERR:
                        case ErrorCode.USER_ERROR_NO_USER:
                            errorInfo = Translate('IDCS_DEVICE_PWD_ERROR')
                            break
                        case ErrorCode.USER_ERROR_NO_AUTH:
                            errorInfo = Translate('IDCS_NO_AUTH')
                            break
                        case ErrorCode.USER_ERROR_NODE_NET_DISCONNECT:
                            errorInfo = Translate('IDCS_OCX_NET_DISCONNECT')
                            break
                        case ErrorCode.USER_ERROR_OVER_LIMIT:
                            errorInfo = Translate('IDCS_OVER_MAX_NUMBER_LIMIT')
                            break
                        default:
                            errorInfo = Translate('IDCS_IMPORT_FAIL')
                            break
                    }
                    openMessageBox({
                        type: 'info',
                        message: errorInfo,
                    })
                },
                onclose() {
                    closeLoading()
                },
            })
        }

        onBeforeUnmount(() => {
            if (ws) {
                ws.destroy()
                ws = null
            }
        })

        return {
            formRef,
            formRule,
            open,
            pageData,
            formData,
            verify,
            close,
            getGroupList,
            handleOCXImport,
            handleDragOver,
            handleDragLeave,
            handleDrop,
            handleH5Import,
            addGroup,
            confirmAddGroup,
            mode,
            displayTitle,
        }
    },
})
