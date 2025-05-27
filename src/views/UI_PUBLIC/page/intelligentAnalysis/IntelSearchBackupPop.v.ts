/*
 * @Author: xujipeng
 * @Date: 2025-05-23 14:42:46
 * @Description: 智能分析 -- 搜索 -- 备份
 * 搜索 = 人（人脸、人体和属性）+ 车（机动车、非机动车和车牌号）+ 停车场（进出记录）
 * 备份 = 图片（抓拍图、原图、可见光图、热成像图） + 录像 + （图片+录像）
 */
export interface backupOption {
    isOldAPI?: boolean
    isBackupPic?: boolean
    isBackupVideo?: boolean
    isBackupPlateCsv?: boolean      // 车--车牌号csv
    isBackupPassRecordCsv?: boolean // 停车场--进出记录csv
    allChlAuth?: boolean
    chlAuthMapping?: Record<string, Record<string, string>>
    indexData: indexDataItem[]
}

interface newIndexDataItem {
    index: string           // 'AWAAAAAA..'
    chlId: string           // '{00000001-0000-0000-0000-000000000000}'
    chlID: string           // '{00000001-0000-0000-0000-000000000000}'
    chlName: string         // 'IPCamera01'
    channelName: string     // ..
    frameTime: number       // 1732593582（时间戳秒）
    timeStamp: number       // 1732593582（时间戳秒）
    startTime?: number      // 1732591582（时间戳秒）
    endTime?: number        // 1732598612（时间戳秒）
}

interface oldIndexDataItem {
    chlId: string           // '{00000001-0000-0000-0000-000000000000}'
    chlID: string           // '{00000001-0000-0000-0000-000000000000}'
    chlName: string         // 'IPCamera01'
    channelName: string     // ..
    frameTime: number       // 1732593582（时间戳秒）
    timeStamp: number       // 1732593582（时间戳秒）
    frameTimeStr: string    // '2024-11-28 22:40:16:3902110'（时间戳字符串）
    startTime?: number      // 1732591582（时间戳秒）
    endTime?: number        // 1732598612（时间戳秒）
    imgId: string           // '1146'
    pathGUID: string        // '{6750271C-376D-4AC3-85C0-574CF07085ED}'
    sectionNo: string       // '124'
    fileIndex: string       // '6'
    blockNo: string         // '58'
    offset: string          // '0'
    eventType: string       // '6'
    direction?: string
}

interface hadIndexDataItem {
    chlId: string           // '{00000001-0000-0000-0000-000000000000}'
    chlID: string           // '{00000001-0000-0000-0000-000000000000}'
    chlName: string         // 'IPCamera01'
    channelName: string     // ..
    frameTime: number       // 1732593582（时间戳秒）
    timeStamp: number       // 1732593582（时间戳秒）
    timeStamp100ns: number  // 1732591582000（时间戳100纳秒）
    snapContent: string     // 抓拍图base64
    originContent: string   // 原图图base64
    eventContent: string    // 事件图base64
    dataBaseContent: string // 原图/热力图base64
    targetID: string        // 目标ID
    isThermal: boolean      // 是否是热力图
    plateNumber: string     // 车牌
}

type indexDataItem = newIndexDataItem | oldIndexDataItem | hadIndexDataItem

interface getPicNameOption {
    targetID: string
    chlName: string
    frameTime: number
    originType?: string
    plateNumber: string
    timeStamp100ns: number
    isFaceCompare?: boolean
    snapContent?: string     // 抓拍图base64
    originContent?: string   // 原图图base64
    eventContent?: string    // 事件图base64
    dataBaseContent?: string // 原图/热力图base64
    isThermal?: boolean      // 是否是热力图
    faceDataBaseInfo?: {
        face_id?: string
        name?: string
        group_name?: string
    } 
}

interface getCsvContentOption {
    chlName?: string
    frameTime?: number
    plateNumber?: string
    parkDuration?: string
    parkResult?: string
    enterChl?: string
    enterTime?: string
    enterType?: string
    exitChl?: string
    exitTime?: string
    exitType?: string
    master?: string
    phoneNum?: string
}

interface backupDataItem {
    content: string | ArrayBuffer
    folder: ''
    name: string
}

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        const pageData = ref({
            isShowDialog: false,
            title: Translate('IDCS_BACKUP'),
            isShowDialogClose: true,
            isShowForm: true,
            isShowOKBtn: true,
            isShowProgress: false,
            destination: 'local',
            destinationList: [{ value: 'local', label: 'local' }],
            format: 'AVI',
            formatList: [{ value: 'AVI', label: 'AVI' }],
            progress: 0,
            currentTask: 0,
            taskNum: 0
        })

        const SINGLE_VIDEO_FILE_SIZE = 500 * 1024 * 1024

        // 进场放行方式/出场放行方式与文本映射
        const OPEN_GATE_MAPPING: Record<string | number, string> = {
            0: '', // 拒绝放行
            1: Translate('IDCS_AUTO_RELEASE'), // 自动放行
            2: Translate('IDCS_MANNAL_RELEASE'), // 手动放行
            refuse: '', // 拒绝放行
            auto: Translate('IDCS_AUTO_RELEASE'), // 自动放行
            manual: Translate('IDCS_MANNAL_RELEASE'), // 手动放行
        }
        
        let backupData: backupDataItem[] = []
        let xlsList: string[][] = []
        let fileNameMap: Record<string, number> = {}
        let recorder: ReturnType<typeof WebsocketRecordBackup> | null = null
        let zipFileNum = 1
        let zipFileIndex = 0
        let maxFileOfZip = 1000
        let isOldAPI: backupOption['isOldAPI'] = false
        let isBackupPic: backupOption['isBackupPic'] = false
        let isBackupVideo: backupOption['isBackupVideo'] = false
        let isBackupPlateCsv: backupOption['isBackupPlateCsv'] = false
        let isBackupPassRecordCsv: backupOption['isBackupPassRecordCsv'] = false
        let allChlAuth: backupOption['allChlAuth'] = false
        let chlAuthMapping: backupOption['chlAuthMapping'] = {}
        let indexData: backupOption['indexData'] = []

        const startBackup = (option: backupOption) => {
            initData(option)
            if (!verification()) return false
            console.log('start backup ' + indexData.length + ' data =', formatDate(Date.now(), 'YYYY-MM-DD HH:mm:ss SSS'))
            maxFileOfZip = maxFileOfZip < indexData.length ? maxFileOfZip : indexData.length
            zipFileNum = Math.ceil(indexData.length / maxFileOfZip)
            showPage('backup')
            pageData.value.isShowDialog = true
            !isBackupVideo && handleBackup()
        }

        const initData = (option?: backupOption) => {
            backupData = []
            xlsList = []
            fileNameMap = {}
            zipFileNum = 1
            zipFileIndex = 0
            maxFileOfZip = 1000
            recorder && recorder.destroy()
            recorder = null
            if (option) {
                isOldAPI = option.isOldAPI
                isBackupPic = option.isBackupPic
                isBackupVideo = option.isBackupVideo
                isBackupPlateCsv = option.isBackupPlateCsv
                isBackupPassRecordCsv = option.isBackupPassRecordCsv
                allChlAuth = option.allChlAuth
                chlAuthMapping = option.chlAuthMapping
                indexData = option.indexData
            }
        }
        
        const verification = () => {
            if (indexData.length == 0) {
                openMessageBox(Translate('IDCS_NO_RECORD_DATA'))
                return false
            }
            if (!allChlAuth) {
                let chlIdArr: string[] = []
                let noAuthText = ''
                indexData.forEach((item: indexDataItem) => {
                    const chlId = item.chlId as string
                    const isBkAuth = chlAuthMapping && chlAuthMapping[chlId] && !chlAuthMapping[chlId]['@bk']
                    if (!chlIdArr.includes(chlId) && isBkAuth) {
                        noAuthText += item.chlName
                        chlIdArr.push(chlId)
                    }
                })
                if (noAuthText) {
                    openMessageBox(Translate('IDCS_CHANNEL_BACUP_NO_PERMISSION').formatForLang(noAuthText))
                    return false
                }
            }
            return true
        }

        const showPage = (type: string) => {
            const isBackup = type === 'backup' && isBackupVideo as boolean
            pageData.value.isShowForm = isBackup
            pageData.value.isShowDialogClose = isBackup
            pageData.value.title = isBackup ? Translate('IDCS_BACKUP') : Translate('IDCS_EXPORT')
            pageData.value.isShowOKBtn = isBackup
            pageData.value.isShowProgress = !isBackup
            pageData.value.currentTask = 0
            pageData.value.taskNum = indexData.length
            pageData.value.progress = 0
        }

        const handleBackup = async () => {
            showPage('export')
            for (let index = 0; index < indexData.length; index++) {
                let indexDataItem = indexData[index]
                indexDataItem.chlName = indexDataItem.chlName || indexDataItem.channelName
                indexDataItem.frameTime = indexDataItem.frameTime || indexDataItem.timeStamp
                indexDataItem.chlId = indexDataItem.chlId || indexDataItem.chlID
                let data = await getData(indexDataItem) as Record<string, Record<string, string>>
                setDataBackup(data)
                let currentTask = index + 1
                updateProgress(currentTask)
                if (currentTask % maxFileOfZip === 0 || currentTask === indexData.length) createZip()
            }
        }

        // 获取数据
        const getData = async (indexDataItem: indexDataItem) => {
            return new Promise(async resolve => {
                const promiseGetPic = getPicData(indexDataItem)
                const promiseGetRecord = getRecordData(indexDataItem)
                Promise.all([promiseGetPic, promiseGetRecord]).then(async results => {
                    const picData = results[0] as Record<string, string>
                    const recordData = results[1] as Record<string, string>
                    const csvData = await getCsvData(picData) as Record<string, string>
                    resolve({ picData, recordData, csvData })
                })
            })

        }

        // 设置数据备份格式
        const setDataBackup = (data: Record<string, (getPicNameOption | backupDataItem | getCsvContentOption)>) => {
            data.picData && setPicDataBackup(data.picData as getPicNameOption)
            data.recordData && setRecordDataBackup(data.recordData as backupDataItem)
            data.csvData && setCsvDataBackup(data.csvData as getCsvContentOption)
        }
        
        // 从外部/协议获取图片内容
        const getPicData = (indexDataItem: indexDataItem) => {
            return new Promise(async resolve => {
                if (isBackupPic) {
                    let hadIndexDataItem = indexDataItem as hadIndexDataItem
                    if (hadIndexDataItem.snapContent || hadIndexDataItem.originContent || hadIndexDataItem.dataBaseContent) { // 已获取图片
                        resolve({
                            chlName: hadIndexDataItem.chlName,
                            frameTime: hadIndexDataItem.frameTime,
                            targetID: hadIndexDataItem.targetID,
                            snapContent: hadIndexDataItem.snapContent && wrapBase64Img(hadIndexDataItem.snapContent as string),
                            originContent: hadIndexDataItem.originContent && wrapBase64Img(hadIndexDataItem.originContent as string),
                            dataBaseContent: hadIndexDataItem.dataBaseContent && wrapBase64Img(hadIndexDataItem.dataBaseContent as string),
                            isThermal: hadIndexDataItem.isThermal,
                            eventContent: hadIndexDataItem.isThermal && (wrapBase64Img(hadIndexDataItem.eventContent as string)),
                            plateNumber: hadIndexDataItem.plateNumber,
                            timeStamp100ns: hadIndexDataItem.timeStamp100ns
                        })
                    } else if (!isOldAPI) { // 新搜图协议: requestTargetData（1.4.13新增） 
                        let newIndexDataItem = indexDataItem as newIndexDataItem
                        const sendXml = rawXml`
                            <condition>
                                <index>${newIndexDataItem.index as string}</index>
                            </condition>
                        `
                        const result = await requestTargetData(sendXml)
                        const $ = queryXml(result)
                        let originContent = ''
                        let eventContent = ''
                        $('/response/content/backgroundPicDatas/item').forEach((item, index) => {
                            const $el = queryXml(item.element)
                            index == 0 && (originContent = $el('data').text() && wrapBase64Img($el('data').text()))
                            index == 1 && (eventContent = $el('data').text() && wrapBase64Img($el('data').text()))
                        })
                        resolve({
                            targetID: $('/response/content/targetID').text(),
                            chlName: newIndexDataItem.chlName,
                            frameTime: (newIndexDataItem.frameTime as number) * 1000,
                            timeStamp100ns: $('/response/content/timeStamp100ns').text(),
                            snapContent: wrapBase64Img($('/response/content/objPicData/data').text()),
                            originContent: originContent,
                            eventContent: eventContent,
                            isThermal: $('/response/content/backgroundPicDatas/item').length > 1,
                            plateNumber: $('/response/content/plateAttrInfo/plateNumber').text(),
                            isDelete: $('/response/content/isDelete').text().bool(),
                            isNoData: $('/response/status').text() !== 'success'
                        })
                    } else { // 旧搜图协议: requestSmartTargetSnapImage
                        let oldIndexDataItem = indexDataItem as oldIndexDataItem

                        const sendXml1 = getSmartTargetSnapImageXml(oldIndexDataItem)
                        const sendXml2 = getSmartTargetSnapImageXml(oldIndexDataItem, true)
                        
                        const result1 = requestSmartTargetSnapImage(sendXml1)
                        const result2 = requestSmartTargetSnapImage(sendXml2)

                        Promise.all([result1, result2]).then(results => {
                            const $snap = queryXml(results[0])
                            const $origin = queryXml(results[1])
                            resolve({
                                targetID: $snap('/response/targetID').text(),
                                snapContent: $snap('/response/content').text() && wrapBase64Img($snap('/response/content').text()),
                                originContent: $origin('/response/content').text() && wrapBase64Img($origin('/response/content').text()),
                                isThermal: $origin('/response/eventContent').length > 0,
                                eventContent: $origin('/response/eventContent').text() && wrapBase64Img($origin('/response/eventContent').text()),
                                plateNumber: $origin('/response/plateNumber').text(),
                                timeStamp100ns: oldIndexDataItem.frameTimeStr?.slice(-7),
                                isDelete: $snap('/response/status').text() !== 'success' && $origin('/response/status').text() !== 'success',
                                openType: $origin('/response/OpenGateType').text(),
                                owner: $origin('/response/owner').text(),
                                ownerPhone: $origin('/response/ownerPhone').text()
                            })
                        })
                    }
                } else {
                    resolve(false)
                }
            })
        }

        // 从协议获取录像内容
        const getRecordData = (indexDataItem: indexDataItem) => {
            return new Promise(resolve => {
                if (isBackupVideo) {
                    let recordDataItem = indexDataItem as (newIndexDataItem | oldIndexDataItem)
                    recorder = WebsocketRecordBackup({
                        maxSingleSize: SINGLE_VIDEO_FILE_SIZE,
                        onmessage: function (data) { // data = { file, taskId, taskIndex, chlId, frameTime, firstFrameTime, finished }
                            if (data.file) {
                                resolve({
                                    content: data.file,
                                    folder: '',
                                    name: getVideoName(recordDataItem.chlName, data.firstFrameTime)
                                })
                                recorder?.destroy()
                                recorder = null
                            }
                        },
                        onerror: function () {}
                    })
                    let recordObj = {
                        chlID: recordDataItem.chlId as string,
                        streamType: 0,
                        startTime: recordDataItem.startTime as number,
                        endTime: recordDataItem.endTime as number,
                        backupVideo: true,
                        backupAudio: true
                    }
                    recorder.start([recordObj])
                } else {
                    resolve(false)
                }
            })
        }

        // 从协议获取表格内容
        const getCsvData = (data: Record<string, (number | string)>) => {
            return new Promise(async resolve => {
                if (isBackupPlateCsv || isBackupPassRecordCsv) {
                    let obj = {
                        plateNumber: data.plateNumber,
                        direction: data.direction,
                        isEnter: data.direction == '1',
                        enterChl: data.direction == '1' ? data.chlName : '',
                        enterType: data.direction == '1' ? OPEN_GATE_MAPPING[data.openType] : '',
                        enterTime: data.direction == '1' ? data.frameTime : '',
                        isExit: data.direction == '2',
                        exitChl: data.direction == '2' ? data.chlName : '',
                        exitType: data.direction == '2' ? OPEN_GATE_MAPPING[data.openType] : '',
                        exitTime: data.direction == '2' ? data.frameTime : '',
                        master: data.owner || '',
                        phoneNum: data.ownerPhone || '',
                        parkDuration: '',
                        parkResult: ''
                    }
                    let virtualStart = '2000-01-01 00:00:00' // 进场和出场时, 取不到相关帧时间, 这里取虚拟极值
                    let virtualEnd = '2080-01-01 00:00:00'
                    let startTime = data.direction == '1' ? data.frameTimeStr : virtualStart
                    let endTime = data.direction == '1' ? virtualEnd : data.frameTimeStr

                    const sendXml = rawXml`
                        <condition>
                            <startTime>${startTime}</startTime>
                            <endTime>${endTime}</endTime>
                            <direction>${data.direction == '1' ? 'out' : 'in'}</direction>
                            <plate>${data.plateNumber}</plate>
                        </condition>
                    `
                    const result = await searchOpenGateEventRelevanceData(sendXml)
                    const $ = queryXml(result)

                    let directionType = $('directionType').text()
                    let gateName = $('gateName').text();
                    let openGateType = $('openGateType').text()
                    let apiTime = $('time').text()
                    let time = apiTime && new Date(utcToLocal(apiTime.slice(0, apiTime.length - 8).replace(/-/g, '/')).replace(/-/g, '/')).getTime()
                    if (directionType == 'in') {
                        obj.enterChl = gateName
                        obj.enterType = OPEN_GATE_MAPPING[openGateType]
                        obj.enterTime = time
                        obj.isEnter = true
                    } else if (directionType == 'out') {
                        obj.exitChl = gateName
                        obj.exitType = OPEN_GATE_MAPPING[openGateType]
                        obj.exitTime = time
                        obj.isExit = true
                    }
                    let parkType = getParkResultType(obj.isEnter, obj.enterType, obj.isExit, obj.exitType)
                    obj.parkDuration = displayDuration({ enterTime: obj.enterTime as number, exitTime: obj.exitTime as number }) || ''
                    obj.parkResult = OPEN_GATE_MAPPING[parkType] || ''
                    resolve(obj)
                } else {
                    resolve(false)
                }
            })
        }

        // 设置图片备份格式
        const setPicDataBackup = (picData: getPicNameOption) => {
            let getSnapPicNameOption = {
                targetID: picData.targetID,
                chlName: picData.chlName,
                frameTime: picData.frameTime,
                plateNumber: picData.plateNumber,
                timeStamp100ns: picData.timeStamp100ns
            }
            let snapObj = { content: picData.snapContent, folder: '', name: getPicName(getSnapPicNameOption) }

            let getOriginPicNameOption = {
                targetID: picData.targetID,
                chlName: picData.chlName,
                frameTime: picData.frameTime,
                originType: picData.isThermal ? 'background_thermal' : 'background',
                plateNumber: picData.plateNumber,
                timeStamp100ns: picData.timeStamp100ns
            }
            let originObj = { content: picData.originContent, folder: '', name: getPicName(getOriginPicNameOption) }

            let getdataBasePicNameOption = {
                targetID: picData.faceDataBaseInfo?.face_id as string,
                chlName: picData.chlName,
                frameTime: picData.frameTime,
                plateNumber: picData.plateNumber,
                timeStamp100ns: picData.timeStamp100ns,
                isFaceCompare: !!picData.faceDataBaseInfo,
                faceDataBaseInfo: picData.faceDataBaseInfo
            }
            let dataBaseObj = { content: picData.dataBaseContent, folder: '', name: getPicName(getdataBasePicNameOption) }
            
            let getEventPicNameOption = {
                targetID: picData.targetID,
                chlName: picData.chlName,
                frameTime: picData.frameTime,
                originType: 'background_optical',
                plateNumber: picData.plateNumber,
                timeStamp100ns: picData.timeStamp100ns
            }
            let eventObj = { content: picData.eventContent, folder: '', name: getPicName(getEventPicNameOption) }
            picData.snapContent && backupData.push(snapObj as backupDataItem)
            picData.originContent && backupData.push(originObj as backupDataItem)
            picData.dataBaseContent && backupData.push(dataBaseObj as backupDataItem)
            picData.eventContent && backupData.push(eventObj as backupDataItem)
        }

        // 设置录像备份格式
        const setRecordDataBackup = (recordData: backupDataItem) => {
            backupData.push(recordData)
        }

        // 设置表格备份格式
        const setCsvDataBackup = async (csvData: getCsvContentOption) => {
            if (isBackupPlateCsv) {
                xlsList.push([
                    '1',
                    (csvData.plateNumber || '--'),
                    csvData.chlName as string,
                    'csvDeviceName',
                    formatDate(new Date(csvData.frameTime as number), 'YYYY-MM-DD HH:mm:ss SSS')
                ])
            } else if (isBackupPassRecordCsv) {
                let newRow = [
                    (csvData.plateNumber || '--'),
                    (csvData.parkDuration || '--'),
                    (csvData.parkResult || '--'),
                    (csvData.enterChl || '--'),
                    (csvData.enterTime || '--'),
                    (csvData.enterType || '--'),
                    (csvData.exitChl || '--'),
                    (csvData.exitTime || '--'),
                    (csvData.exitType || '--'),
                    (csvData.master || '--'),
                    (csvData.phoneNum || '--')
                ]
                // 若同一个车牌进场后又出场，会根据两项记录进行两次getPic，最后生成的xlsList中会有两项相同的记录，因此需要去重 （不足：重复请求searchOpenGateEventRelevanceData）
                if (!xlsList.some((item: string[]) => {
                    return (item).toString() == newRow.toString()
                })) {
                    xlsList.push(newRow)
                }
            }
            if (pageData.value.currentTask % maxFileOfZip) {
                let titleArr = isBackupPlateCsv ? 
                    [
                        Translate('IDCS_SERIAL_NUMBER'),
                        Translate('IDCS_LICENSE_PLATE_NUM'),
                        Translate('IDCS_CHANNEL'),
                        Translate('IDCS_DEVICE_NAME'),
                        Translate('IDCS_SNAP_TIME')
                    ] 
                    : (
                        isBackupPassRecordCsv ? 
                    [
                        Translate('IDCS_LICENSE_PLATE_NUM'),
                        Translate('IDCS_VEHICLE_PARKING_TIME'),
                        Translate('IDCS_VEHICLE_IN_OUT_RESULT'),
                        Translate('IDCS_VEHICLE_ENTRANCE'),
                        Translate('IDCS_VEHICLE_IN_TIME'),
                        Translate('IDCS_VEHICLE_IN_RELEASE_METHOD'),
                        Translate('IDCS_VEHICLE_EXIT'),
                        Translate('IDCS_VEHICLE_OUT_TIME'),
                        Translate('IDCS_VEHICLE_OUT_RELEASE_METHOD'),
                        Translate('IDCS_VEHICLE_OWNER'),
                        Translate('IDCS_PHONE_NUMBER')
                    ] : []
                )
                let csvContent = await getExcelFile(titleArr, xlsList, getXlsName(), undefined).arrayBuffer().then(buffer => buffer)
                backupData.push({ content: csvContent, folder: '', name: getXlsName() })
            }
        }

        const updateProgress = (currentTask: number) => {
            pageData.value.progress = Math.ceil(currentTask / indexData.length * 100)
            pageData.value.currentTask = currentTask
        }

        const getSmartTargetSnapImageXml = (data: oldIndexDataItem, isPanorama?: boolean) => {
            return rawXml`
                <condition>
                    <imgId>${data.imgId as string}</imgId>
                    <chlId>${data.chlId as string}</chlId>
                    <frameTime>${data.frameTimeStr as string}</frameTime>
                    <pathGUID>${data.pathGUID as string}</pathGUID>
                    <sectionNo>${data.sectionNo as string}</sectionNo>
                    <fileIndex>${data.fileIndex as string}</fileIndex>
                    <blockNo>${data.blockNo as string}</blockNo>
                    <offset>${data.offset as string}</offset>
                    <eventType>${data.eventType as string}</eventType>
                    ${isPanorama ? '<isPanorama />' : ''}
                </condition>
            `
        }

        const getParkResultType = (isEnter: boolean, enterType: string, isExit: boolean, exitType: string) => {
            let type = ''
            if (isEnter && isExit) {
                type = 'enter-exit'
            }

            if (isEnter && !isExit) {
                type = 'enter-nonExit'
            }

            if (!isEnter && isExit) {
                type = 'nonEnter-exit'
            }

            // 进场-拒绝放行
            if (isEnter && (enterType === '0' || enterType === 'refuse')) {
                type = 'nonEnter-nonExit'
            }

            // 出场-拒绝放行
            if (isExit && (exitType === '0' || exitType === 'refuse')) {
                type = 'out-nonEnter-nonExit'
            }

            // NTA1-3765 车辆未进场且未出场的记录需要显示为未进场
            if (!isEnter && !isExit) {
                type = 'nonEnter-nonExit'
            }

            return type
        }

        const displayDuration = (data: Record<string, number>) => {
            if (!data.exitTime || !data.enterTime) return '--'
            const duration = data.exitTime - data.enterTime
            const e = 1000 * 60 * 60
            if (duration < 1000 * 60 * 60) {
                const minute = Math.round(duration / 1000 / 60)
                return minute + Translate('IDCS_MINUTE_LEAST')
            } else {
                const hour = Math.floor(duration / e)
                const minute = Math.round((duration % e) / 1000 / 60)
                return hour + Translate('IDCS_HOUR_LEAST') + (minute > 0 ? ' ' + minute + Translate('IDCS_MINUTE_LEAST') : '')
            }
        }

        const createZip = async () => {
            let chlName = indexData[zipFileIndex * maxFileOfZip].chlName
            zipFileIndex++
            await downloadZip({ zipName: getZipName(chlName as string), files: backupData as backupDataItem[] })
            if (zipFileIndex == zipFileNum) {
                console.log('end backup ' + indexData.length + ' data =', formatDate(new Date()))
                initData()
                pageData.value.isShowDialog = false
                openMessageBox({ type: 'success', message: Translate('IDCS_BACKUP_SUCCESS') })
            } else {
                backupData = []
            }
        }

        const getPicName = (option: getPicNameOption) => {
            let chlName = option.chlName || Translate('IDCS_UNKNOWN_CHANNEL') + '1'
            let time = formatDate(new Date(option.frameTime as number), 'YYYY-MM-DD HH:mm:ss')
            let plateName = option.plateNumber ? option.plateNumber + '_' : ''
            let picType = option.isFaceCompare ? 'target' : option.originType
            let picFaceName = option.isFaceCompare ? '_' + option.faceDataBaseInfo!.name : ''
            let picFaceGroup = option.isFaceCompare ? '-' + option.faceDataBaseInfo!.group_name : ''
            let targetIDName = option.targetID ? `_${option.targetID}` : ''
            let picTypeName = picType ? `_${picType}` : ''
            let fileName = plateName + chlName + '_' + time.replace(/(\-)|(\:)|(\s)/g, '') + '_' + option.timeStamp100ns + targetIDName + picTypeName + picFaceName + picFaceGroup + '.jpg'
            return checkFileName(fileName)
        }

        const getVideoName = (chlName: string | undefined, frameTime: number) => {
            chlName = chlName || Translate('IDCS_UNKNOWN_CHANNEL') + '1'
            let time = formatDate(new Date(frameTime), 'YYYY-MM-DD HH:mm:ss')
            let fileName = chlName + '_' + time.replace(/(\-)|(\:)|(\s)/g, '') + '.avi'
            return checkFileName(fileName)
        }

        const getXlsName = () => {
            let type = isBackupPlateCsv ? 'EXPORT_SNAP_PLATE_LIST' : (isBackupPassRecordCsv ? Translate('IDCS_VEHICLE_ENTRY_EXIT_RECORD') : '')
            let time = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
            let fileName = type + '-' + time + '.xls'
            return fileName
        }

        const getZipName = (chlName: string | null) => {
            let resultChlName = chlName || Translate('IDCS_UNKNOWN_CHANNEL') + '1'
            let time = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
            let fileName = resultChlName.replace(FILE_LIMIT_REG, '#') + '_' + time.replace(/(\-)|(\:)|(\s)/g, '')
            return checkFileName(fileName)
        }

        const checkFileName = (fileName: string) => {
            if (!fileNameMap[fileName]) {
                fileNameMap[fileName] = 1
            } else {
                fileNameMap[fileName]++
                let fileSuffixReg = /\.([a-zA-Z0-9]+)$/
                let fileSuffix = fileName.match(fileSuffixReg)![0]
                let fileSuffixIndex = fileName.indexOf(fileSuffix)
                fileName = fileName.slice(0, fileSuffixIndex) + '(' + fileNameMap[fileName] + ')' + fileSuffix
            }
            return fileName
        }

        return {
            pageData,
            Translate,
            startBackup,
            handleBackup,
        }
    }
})
