/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 18:47:22
 * @Description: 智能分析 - 选择人脸 - 从外部导入
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-09 15:42:01
 */
import { type IntelFaceDBImportImgDto, IntelFaceDBImportFaceDto } from '@/types/apiType/intelligentAnalysis'
import { type XMLQuery } from '@/utils/tools'

export default defineComponent({
    props: {
        /**
         * @property 上传数量限制
         */
        limit: {
            type: Number,
            default: 10000,
        },
        /**
         * @property {'both' | 'img-only'} 支持的文件类型 both: 支持jpg和csv、xls；img-only：只支持jpg
         */
        accept: {
            type: String,
            default: 'both',
        },
        /**
         * @property {'both' | 'h5-only'} 上传的模式 both: 支持OCX与H5上传； h5-only: 只支持H5上传
         */
        type: {
            type: String,
            default: 'both',
        },
    },
    emits: {
        change(e: IntelFaceDBImportFaceDto[]) {
            return Array.isArray(e)
        },
    },
    setup(prop, ctx) {
        const Plugin = inject('Plugin') as PluginType
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()

        const DEFAULT_BIRTHDAY = formatDate(new Date(), 'YYYY/MM/DD')

        const mode = computed(() => {
            return Plugin.IsSupportH5() || prop.type === 'h5-only' ? 'h5' : 'ocx'
        })

        watch(
            mode,
            (newVal) => {
                // if (newVal !== 'h5' && !Plugin.IsPluginAvailable) {
                //     pluginStore.showPluginNoResponse = true
                //     Plugin.ShowPluginNoResponse()
                // }
                if (newVal === 'ocx' && prop.type === 'both') {
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                    Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            },
            {
                immediate: true,
            },
        )

        // 性别key值与value值的映射
        const SEX_MAPPING: Record<number, string> = {
            0: 'male',
            1: 'female',
        }

        /**
         * @description 检测图片数量是否超出限制
         * @param {number} len
         * @returns {boolean}
         */
        const checkImportFaceImgCount = (len: number) => {
            if (len > prop.limit) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_SELECT_FACE_UPTO_MAX').formatForLang(prop.limit),
                })
                return false
            }
            return true
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
                ['01', 'name'],
                ['02', 'sex'],
                ['03', 'birthday'],
                ['04', 'certificateType'],
                ['05', 'certificateNum'],
                ['08', 'mobile'],
                ['12', 'imgName'],
                ['13', 'number'],
                ['14', 'note'],
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
                    name: split[dataIndexMap.name] || '',
                    sex: split[dataIndexMap.sex] ? SEX_MAPPING[Number(split[dataIndexMap.sex || 10000])] : 'male',
                    // TODO: 日期兼容哪些格式？
                    birthday: split[dataIndexMap.birthday || 10000] || DEFAULT_BIRTHDAY,
                    certificateType: 'idCard', // 目前只有身份证
                    certificateNum: split[dataIndexMap.certificateNum] || '',
                    mobile: split[dataIndexMap.mobile] || '',
                    imgName: split[dataIndexMap.imgName] || '',
                    number: split[dataIndexMap.number] || '',
                    note: split[dataIndexMap.note] || '',
                    pic: '',
                    width: 0,
                    height: 0,
                }
            })
        }

        /**
         * @description 读取CSV/TXT文件
         * @param {File} file
         * @param {string} fileType
         */
        const parseDataFile = (file: File, fileType: string) => {
            return new Promise((resolve: (e: IntelFaceDBImportFaceDto[]) => void, reject: (e: string) => void) => {
                if (!fileType) {
                    resolve([])
                    return
                }
                const reader = new FileReader()
                reader.readAsText(file)
                reader.onloadend = async () => {
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
         * @description 读取图像文件
         * @param {File} file
         */
        const parseImgFile = (file: File) => {
            return new Promise((resolve: (e: IntelFaceDBImportImgDto) => void, reject: (e: string) => void) => {
                // NT2-3425 导入图片为0B
                if (file.size === 0) {
                    reject(Translate('IDCS_ADD_FACE_FAIL'))
                    return
                }
                // 图片小于200KB
                if (file.size > 200 * 1024) {
                    reject(Translate('IDCS_ADD_FACE_FAIL'))
                    return
                }

                const reader = new FileReader()
                reader.readAsDataURL(file)
                reader.onloadend = () => {
                    const img = new Image()
                    img.onload = () => {
                        resolve({
                            imgName: file.name,
                            pic: reader.result as string,
                            width: img.width,
                            height: img.height,
                        })
                    }
                    img.src = URL.createObjectURL(file)
                }
            })
        }

        /**
         * @description 读取文件
         * @param {FileList | File[]} files
         */
        const parseFiles = async (files: FileList | File[]) => {
            const supportTypes = prop.accept === 'img-only' ? ['jpg', 'jpeg'] : ['csv', 'txt', 'jpg', 'jpeg'] // 支持导入的文件类型
            let hasNotSupportedType = false
            let dataFileType = ''
            let dataFile = files[0]

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const fileType = file.name.split('.').pop()
                if (fileType === 'csv' || fileType === 'txt') {
                    dataFileType = fileType
                    dataFile = file
                    // csvOrTxtCount++
                }
                if (!fileType || !supportTypes.includes(fileType)) {
                    hasNotSupportedType = true
                    break
                }
            }

            if (hasNotSupportedType) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_FILE_NOT_AVAILABLE'),
                })
                return
            }

            openLoading()
            const clone = new IntelFaceDBImportFaceDto()

            try {
                const data = await parseDataFile(dataFile, dataFileType)
                const resultFile = []
                for (let i = 0; i < files.length; i++) {
                    const file = files[i]
                    const fileType = file.name.split('.').pop()
                    if (fileType === 'jpg' || fileType === 'jpeg') {
                        const result = await parseImgFile(file)
                        const find = data.find((item) => item.imgName === result.imgName)
                        if (find) {
                            resultFile.push({
                                ...find,
                                ...result,
                            })
                        } else {
                            resultFile.push({
                                ...clone,
                                ...result,
                            })
                        }
                    }
                }
                ctx.emit('change', resultFile)
                closeLoading()
                resetOCXData()
            } catch (e) {
                openMessageTipBox({
                    type: 'info',
                    message: e as string,
                })
                closeLoading()
                resetOCXData()
                return
            }
        }

        /**
         * @description H5导入的回调
         * @param {Event} e
         */
        const handleH5Import = (e: Event) => {
            const files = (e.target as HTMLInputElement).files

            if (files === null) {
                return
            }
            if (!checkImportFaceImgCount(files.length)) {
                return
            }

            parseFiles(files)
        }

        const ocxData = {
            // 文件路径列表
            fileList: [] as string[],
            // 当前上传的文件索引
            fileIndex: 0,
            // 文件列表
            uploadFileList: [] as File[],
        }

        /**
         * @description OCX导入的回调
         */
        const handleOCXImport = () => {
            const sendXML = OCX_XML_OpenFileBrowser('OPEN_FILE', '', '', true, '*.csv,*.txt,*.jpg,*.jpeg')
            Plugin.AsynQueryInfo(Plugin.GetVideoPlugin(), sendXML, (result) => {
                const path = OCX_XML_OpenFileBrowser_getpath(result).trim()
                if (path) {
                    const fileList = path.split('|')
                    if (!checkImportFaceImgCount(fileList.length)) {
                        return
                    }
                    ocxData.fileList = fileList
                    ocxData.fileIndex = 0
                    ocxData.uploadFileList = []
                    openLoading()
                    uploadOCXFile()
                }
            })
        }

        /**
         * @description OCX上传文件
         */
        const uploadOCXFile = () => {
            const filePath = ocxData.fileList[ocxData.fileIndex]
            const sendXML = OCX_XML_UploadIPCAudioBase64(filePath)
            Plugin.GetVideoPlugin().ExecuteCmd(sendXML)
        }

        /**
         * @description 重置
         */
        const resetOCXData = () => {
            ocxData.fileList = []
            ocxData.fileIndex = 0
            ocxData.uploadFileList = []
        }

        /**
         * @description OCX通知回调
         * @param {Function} $
         */
        const notify = ($: XMLQuery) => {
            if ($('statenotify[@type="UploadIPCAudioBase64"]').length) {
                const $item = queryXml($('statenotify[@type="UploadIPCAudioBase64"]')[0].element)
                if ($item('status').text() === 'success') {
                    const fileBase64 = $item('base64').text()
                    // const fileSize = $item('filesize').text()
                    const filePath = $item('filePath').text()
                    const fileName = filePath.replace(/\\/g, '/').split('/').pop()!
                    const file = base64ToFile(fileBase64, fileName)
                    ocxData.uploadFileList.push(file)
                } else {
                    const errorCode = Number($item('errorCode').text())
                    switch (errorCode) {
                        case ErrorCode.USER_ERROR_KEYBOARDINDEX_ERROR:
                            closeLoading()
                            resetOCXData()
                            openMessageTipBox({
                                type: 'info',
                                message: Translate('IDCS_ADD_FACE_FAIL'),
                            })
                            break
                        case ErrorCode.USER_ERROR_SPECIAL_CHAR_2:
                            closeLoading()
                            resetOCXData()
                            openMessageTipBox({
                                type: 'info',
                                message: Translate('IDCS_IMPORT_FAIL'),
                            })
                            break
                    }
                }

                if (ocxData.fileIndex === ocxData.fileList.length - 1) {
                    closeLoading()
                    parseFiles(ocxData.uploadFileList)
                } else {
                    ocxData.fileIndex++
                    uploadOCXFile()
                }
            }
            //网络断开
            else if ($('statenotify[@type="FileNetTransport"]').length) {
                closeLoading()
                resetOCXData()
                if (Number($('statenotify[@type="FileNetTransport"]/errorCode').text()) === ErrorCode.USER_ERROR_NODE_NET_DISCONNECT) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_OCX_NET_DISCONNECT'),
                    })
                }
            }
        }

        onMounted(() => {
            if (prop.type === 'both') {
                Plugin.VideoPluginNotifyEmitter.addListener(notify)
            }
        })

        onBeforeUnmount(() => {
            if (prop.type === 'both') {
                Plugin.VideoPluginNotifyEmitter.removeListener(notify)
            }
        })

        return {
            mode,
            handleH5Import,
            handleOCXImport,
        }
    },
})
