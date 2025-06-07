/*
 * @Author: xujipeng
 * @Date: 2025-05-23 14:42:46
 * @Description: 智能分析 -- 搜索 -- 备份
 * 搜索 = 人（人脸、人体和属性）+ 车（机动车、非机动车和车牌号）+ 停车场（进出记录）
 * 备份 = 图片（抓拍图、原图、可见光图、热成像图） + 录像 + （图片+录像）
 */
export interface backupOption {
    apiType?: 'default' | 'snap-wall' | 'legacy'
    isBackupPic?: boolean
    isBackupVideo?: boolean
    isBackupPlateCsv?: boolean // 车--车牌号csv
    isBackupPassRecordCsv?: boolean // 停车场--进出记录csv
    indexData: indexDataItem[]
}

interface newIndexDataItem {
    index: string // 'AWAAAAAA..'
    chlId: string // '{00000001-0000-0000-0000-000000000000}'
    chlName: string // 'IPCamera01'
    frameTime: number // 1732593582（时间戳秒）
    startTime?: number // 1732591582（时间戳秒）
    endTime?: number // 1732598612（时间戳秒）
}

interface oldIndexDataItem {
    chlId: string // '{00000001-0000-0000-0000-000000000000}'
    chlName: string // 'IPCamera01'
    frameTime: number // 1732593582（时间戳秒）
    frameTimeStr: string // '2024-11-28 22:40:16:3902110'（时间戳字符串）
    startTime?: number // 1732591582（时间戳秒）
    endTime?: number // 1732598612（时间戳秒）
    imgId: string // '1146'
    pathGUID: string // '{6750271C-376D-4AC3-85C0-574CF07085ED}'
    sectionNo: number // '124'
    fileIndex: number // '6'
    blockNo: number // '58'
    offset: number // '0'
    eventType: number // '6'
}

interface hadIndexDataItem {
    chlId: string // '{00000001-0000-0000-0000-000000000000}'
    chlName: string // 'IPCamera01'
    frameTime: number // 1732593582（时间戳秒）
    timeStamp100ns: number // 1732591582000（时间戳100纳秒）
    snapContent: string // 抓拍图base64
    originContent: string // 原图图base64
    eventContent: string // 事件图base64
    dataBaseContent: string // 原图/热力图base64
    targetID: string // 目标ID
    isThermal: boolean // 是否是热力图
    plateNumber: string // 车牌
    faceDataBaseInfo?: {
        face_id?: string
        name?: string
        group_name?: string
    }
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
    snapContent?: string // 抓拍图base64
    originContent?: string // 原图图base64
    eventContent?: string // 事件图base64
    dataBaseContent?: string // 原图/热力图base64
    isThermal?: boolean // 是否是热力图
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

export interface IntelSearchBackUpExpose {
    startBackup: (data: backupOption) => void
}

export default defineComponent({
    props: {
        /**
         * @property 用户通道权限
         */
        auth: {
            type: Object as PropType<UserChlAuth>,
            required: true,
        },
    },
    setup(props, ctx) {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const dateTime = useDateTimeStore()

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
            taskNum: 0,
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

        const CSV_MAPPING = {
            passRecord: {
                title: Translate('IDCS_VEHICLE_ENTRY_EXIT_RECORD'),
                thead: [
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
                    Translate('IDCS_PHONE_NUMBER'),
                ],
            },
            plate: {
                title: Translate('EXPORT_SNAP_PLATE_LIST'),
                thead: [Translate('IDCS_SERIAL_NUMBER'), Translate('IDCS_LICENSE_PLATE_NUM'), Translate('IDCS_CHANNEL'), Translate('IDCS_DEVICE_NAME'), Translate('IDCS_SNAP_TIME')],
            },
        }

        let backupData: backupDataItem[] = []
        let xlsList: string[][] = []
        let fileNameMap: Record<string, number> = {}
        let recorder: ReturnType<typeof WebsocketRecordBackup> | null = null
        let zipFileNum = 1
        let zipFileIndex = 0
        let maxFileOfZip = 1000
        let apiType: backupOption['apiType'] = 'default'
        let isBackupPic: backupOption['isBackupPic'] = false
        let isBackupVideo: backupOption['isBackupVideo'] = false
        let isBackupPlateCsv: backupOption['isBackupPlateCsv'] = false
        let isBackupPassRecordCsv: backupOption['isBackupPassRecordCsv'] = false
        let indexData: backupOption['indexData'] = []

        const startBackup = (option: backupOption) => {
            initData(option)
            if (!verification()) return
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
                apiType = option.apiType || 'default'
                isBackupPic = option.isBackupPic
                isBackupVideo = option.isBackupVideo
                isBackupPlateCsv = option.isBackupPlateCsv
                isBackupPassRecordCsv = option.isBackupPassRecordCsv
                indexData = option.indexData
            }
        }

        const verification = () => {
            if (indexData.length === 0) {
                openMessageBox(Translate('IDCS_NO_RECORD_DATA'))
                return false
            }

            if (!props.auth.hasAll) {
                const noAuthText = indexData
                    .filter((item) => !props.auth.bk[item.chlId])
                    .map((item) => item.chlName)
                    .join(', ')

                if (noAuthText) {
                    openMessageBox(Translate('IDCS_CHANNEL_BACUP_NO_PERMISSION').formatForLang(noAuthText))
                    return false
                }
            }
            return true
        }

        const showPage = (type: string) => {
            const isBackup = type === 'backup' && (isBackupVideo as boolean)
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
                const indexDataItem = indexData[index]
                const data = await getData(indexDataItem)
                const currentTask = index + 1
                await setDataBackup(data as Record<string, getPicNameOption | backupDataItem | getCsvContentOption>)
                updateProgress(currentTask)

                if (!pageData.value.isShowDialog) {
                    recorder && recorder.destroy()
                    break
                }

                if (currentTask % maxFileOfZip === 0 || currentTask === indexData.length) {
                    createZip()
                }
            }
        }

        // 获取数据
        const getData = async (indexDataItem: indexDataItem) => {
            const picData = await getPicData(indexDataItem)
            const recordData = await getRecordData(indexDataItem)
            const csvData = (await getCsvData(picData as any as Record<string, string | number>)) as Record<string, string>
            return { picData, recordData, csvData }
        }

        // 设置数据备份格式
        const setDataBackup = async (data: Record<string, getPicNameOption | backupDataItem | getCsvContentOption>) => {
            if (data.picData) setPicDataBackup(data.picData as getPicNameOption)
            if (data.recordData) setRecordDataBackup(data.recordData as backupDataItem)
            if (data.csvData) await setCsvDataBackup(data.csvData as getCsvContentOption)
        }

        // 从外部/协议获取图片内容
        const getPicData = async (indexDataItem: indexDataItem) => {
            // return new Promise(async (resolve) => {
            if (isBackupPic || isBackupPassRecordCsv || isBackupPlateCsv) {
                const hadIndexDataItem = indexDataItem as hadIndexDataItem
                if (apiType === 'snap-wall') {
                    // 已获取图片
                    return {
                        chlName: hadIndexDataItem.chlName,
                        frameTime: hadIndexDataItem.frameTime * 1000,
                        targetID: hadIndexDataItem.targetID,
                        snapContent: hadIndexDataItem.snapContent && wrapBase64Img(hadIndexDataItem.snapContent),
                        originContent: hadIndexDataItem.originContent && wrapBase64Img(hadIndexDataItem.originContent),
                        dataBaseContent: hadIndexDataItem.dataBaseContent && wrapBase64Img(hadIndexDataItem.dataBaseContent),
                        isThermal: hadIndexDataItem.isThermal,
                        eventContent: hadIndexDataItem.isThermal && wrapBase64Img(hadIndexDataItem.eventContent),
                        plateNumber: hadIndexDataItem.plateNumber,
                        timeStamp100ns: hadIndexDataItem.timeStamp100ns,
                    }
                }

                if (apiType === 'default') {
                    // 新搜图协议: requestTargetData（1.4.13新增）
                    const newIndexDataItem = indexDataItem as newIndexDataItem
                    const sendXml = rawXml`
                            <condition>
                                <index>${newIndexDataItem.index as string}</index>
                            </condition>
                        `
                    const result = await requestTargetData(sendXml)
                    const $ = queryXml(result)
                    let originContent = ''
                    let eventContent = ''
                    $('content/backgroundPicDatas/item').forEach((item, index) => {
                        const $el = queryXml(item.element)
                        index === 0 && (originContent = $el('data').text() && wrapBase64Img($el('data').text()))
                        index === 1 && (eventContent = $el('data').text() && wrapBase64Img($el('data').text()))
                    })
                    return {
                        targetID: $('content/targetID').text(),
                        chlName: newIndexDataItem.chlName,
                        frameTime: newIndexDataItem.frameTime * 1000,
                        timeStamp100ns: $('content/timeStamp100ns').text(),
                        snapContent: wrapBase64Img($('content/objPicData/data').text()),
                        originContent: originContent,
                        eventContent: eventContent,
                        isThermal: $('content/backgroundPicDatas/item').length > 1,
                        plateNumber: $('content/plateAttrInfo/plateNumber').text(),
                        isDelete: $('content/isDelete').text().bool(),
                        isNoData: $('status').text() !== 'success',
                    }
                }

                if (apiType === 'legacy') {
                    // 旧搜图协议: requestSmartTargetSnapImage
                    const oldIndexDataItem = indexDataItem as oldIndexDataItem

                    const sendXml1 = getSmartTargetSnapImageXml(oldIndexDataItem)
                    const sendXml2 = getSmartTargetSnapImageXml(oldIndexDataItem, true)

                    const result1 = await requestSmartTargetSnapImage(sendXml1)
                    const result2 = await requestSmartTargetSnapImage(sendXml2)

                    // Promise.all([result1, result2]).then((results) => {
                    const $snap = queryXml(result1)
                    const $origin = queryXml(result2)
                    return {
                        targetID: $snap('targetID').text(),
                        snapContent: $snap('content').text() && wrapBase64Img($snap('content').text()),
                        originContent: $origin('content').text() && wrapBase64Img($origin('content').text()),
                        isThermal: $origin('eventContent').length > 0,
                        eventContent: $origin('eventContent').text() && wrapBase64Img($origin('eventContent').text()),
                        plateNumber: $origin('plateNumber').text(),
                        timeStamp100ns: oldIndexDataItem.frameTimeStr?.slice(-7),
                        isDelete: $snap('status').text() !== 'success' && $origin('status').text() !== 'success',
                        openType: $origin('OpenGateType').text(),
                        owner: $origin('owner').text(),
                        ownerPhone: $origin('ownerPhone').text(),
                        chlName: oldIndexDataItem.chlName,
                        frameTime: oldIndexDataItem.frameTime * 1000,
                        startTime: oldIndexDataItem.startTime,
                        endTime: oldIndexDataItem.endTime,
                        frameTimeStr: oldIndexDataItem.frameTimeStr,
                        direction: $snap('directionType').text(),
                    }
                }
            } else {
                return false
            }
            // })
        }

        // 从协议获取录像内容
        const getRecordData = (indexDataItem: indexDataItem) => {
            return new Promise((resolve) => {
                if (isBackupVideo) {
                    const recordDataItem = indexDataItem as newIndexDataItem | oldIndexDataItem
                    recorder = WebsocketRecordBackup({
                        maxSingleSize: SINGLE_VIDEO_FILE_SIZE,
                        onmessage(data) {
                            // data = { file, taskId, taskIndex, chlId, frameTime, firstFrameTime, finished }
                            if (data.file) {
                                resolve({
                                    content: data.file,
                                    folder: '',
                                    name: getVideoName(recordDataItem.chlName, data.firstFrameTime),
                                })
                                recorder?.destroy()
                                recorder = null
                            }
                        },
                        onerror() {},
                    })
                    const recordObj = {
                        chlID: recordDataItem.chlId as string,
                        streamType: 0,
                        startTime: recordDataItem.startTime as number,
                        endTime: recordDataItem.endTime as number,
                        backupVideo: true,
                        backupAudio: true,
                    }
                    recorder.start([recordObj])
                } else {
                    resolve(false)
                }
            })
        }

        // 从协议获取表格内容
        const getCsvData = (data: Record<string, number | string>) => {
            return new Promise(async (resolve) => {
                if (isBackupPassRecordCsv) {
                    const isDirectionIn = data.direction === '1' || data.direction === 'in'
                    const obj = {
                        plateNumber: data.plateNumber,
                        direction: data.direction,
                        isEnter: isDirectionIn,
                        enterChl: isDirectionIn ? data.chlName : '',
                        enterType: isDirectionIn ? OPEN_GATE_MAPPING[data.openType] : '',
                        enterTime: isDirectionIn ? data.frameTime : '',
                        isExit: isDirectionIn,
                        exitChl: !isDirectionIn ? data.chlName : '',
                        exitType: !isDirectionIn ? OPEN_GATE_MAPPING[data.openType] : '',
                        exitTime: !isDirectionIn ? data.frameTime : '',
                        master: data.owner || '',
                        phoneNum: data.ownerPhone || '',
                        parkDuration: '',
                        parkResult: '',
                    }
                    const virtualStart = '2000-01-01 00:00:00' // 进场和出场时, 取不到相关帧时间, 这里取虚拟极值
                    const virtualEnd = '2080-01-01 00:00:00'
                    const startTime = isDirectionIn ? data.frameTimeStr : virtualStart
                    const endTime = isDirectionIn ? virtualEnd : data.frameTimeStr

                    const sendXml = rawXml`
                        <condition>
                            <startTime>${startTime}</startTime>
                            <endTime>${endTime}</endTime>
                            <direction>${isDirectionIn ? 'out' : 'in'}</direction>
                            <plate>${wrapCDATA(data.plateNumber as string)}</plate>
                        </condition>
                    `
                    const result = await searchOpenGateEventRelevanceData(sendXml)
                    const $ = queryXml(result)

                    const directionType = $('directionType').text()
                    const gateName = $('gateName').text()
                    const openGateType = $('openGateType').text()
                    const apiTime = $('time').text()
                    const time = apiTime && new Date(utcToLocal(apiTime.slice(0, apiTime.length - 8).replace(/-/g, '/')).replace(/-/g, '/')).getTime()
                    if (directionType === 'in') {
                        obj.enterChl = gateName
                        obj.enterType = OPEN_GATE_MAPPING[openGateType]
                        obj.enterTime = time
                        obj.isEnter = true
                    } else if (directionType === 'out') {
                        obj.exitChl = gateName
                        obj.exitType = OPEN_GATE_MAPPING[openGateType]
                        obj.exitTime = time
                        obj.isExit = true
                    }
                    const parkType = getParkResultType(obj.isEnter, obj.enterType, obj.isExit, obj.exitType)
                    obj.parkDuration =
                        displayDuration({
                            enterTime: obj.enterTime as number,
                            exitTime: obj.exitTime as number,
                        }) || ''
                    obj.parkResult = OPEN_GATE_MAPPING[parkType] || ''
                    resolve(obj)
                } else if (isBackupPlateCsv) {
                    resolve({
                        plateNumber: data.plateNumber,
                        chlName: data.chlName,
                        frameTime: data.frameTime,
                    })
                } else {
                    resolve(false)
                }
            })
        }

        // 设置图片备份格式
        const setPicDataBackup = (picData: getPicNameOption) => {
            const getSnapPicNameOption = {
                targetID: picData.targetID,
                chlName: picData.chlName,
                frameTime: picData.frameTime,
                plateNumber: picData.plateNumber,
                timeStamp100ns: picData.timeStamp100ns,
            }
            const snapObj = { content: picData.snapContent, folder: '', name: getPicName(getSnapPicNameOption) }

            const getOriginPicNameOption = {
                targetID: picData.targetID,
                chlName: picData.chlName,
                frameTime: picData.frameTime,
                originType: picData.isThermal ? 'background_thermal' : 'background',
                plateNumber: picData.plateNumber,
                timeStamp100ns: picData.timeStamp100ns,
            }
            const originObj = { content: picData.originContent, folder: '', name: getPicName(getOriginPicNameOption) }

            const getdataBasePicNameOption = {
                targetID: picData.faceDataBaseInfo?.face_id as string,
                chlName: picData.chlName,
                frameTime: picData.frameTime,
                plateNumber: picData.plateNumber,
                timeStamp100ns: picData.timeStamp100ns,
                isFaceCompare: !!picData.faceDataBaseInfo,
                faceDataBaseInfo: picData.faceDataBaseInfo,
            }
            const dataBaseObj = { content: picData.dataBaseContent, folder: '', name: getPicName(getdataBasePicNameOption) }

            const getEventPicNameOption = {
                targetID: picData.targetID,
                chlName: picData.chlName,
                frameTime: picData.frameTime,
                originType: 'background_optical',
                plateNumber: picData.plateNumber,
                timeStamp100ns: picData.timeStamp100ns,
            }
            const eventObj = { content: picData.eventContent, folder: '', name: getPicName(getEventPicNameOption) }
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
                xlsList.push(['1', csvData.plateNumber || '--', csvData.chlName!, userSession.csvDeviceName, formatDate(new Date(csvData.frameTime!), 'YYYY-MM-DD HH:mm:ss SSS')])
            } else if (isBackupPassRecordCsv) {
                const newRow = [
                    csvData.plateNumber || '--',
                    csvData.parkDuration || '--',
                    csvData.parkResult || '--',
                    csvData.enterChl || '--',
                    csvData.enterTime ? formatDate(csvData.enterTime, dateTime.dateTimeFormat) : '--',
                    csvData.enterType || '--',
                    csvData.exitChl || '--',
                    csvData.exitTime ? formatDate(csvData.exitTime, dateTime.dateTimeFormat) : '--',
                    csvData.exitType || '--',
                    csvData.master || '--',
                    csvData.phoneNum || '--',
                ]
                // 若同一个车牌进场后又出场，会根据两项记录进行两次getPic，最后生成的xlsList中会有两项相同的记录，因此需要去重 （不足：重复请求searchOpenGateEventRelevanceData）
                if (
                    !xlsList.some((item) => {
                        return item.toString() === newRow.toString()
                    })
                ) {
                    xlsList.push(newRow)
                }
            }

            if (pageData.value.currentTask + 1 >= maxFileOfZip) {
                const titleArr = isBackupPlateCsv ? CSV_MAPPING.plate.thead : CSV_MAPPING.passRecord.thead
                const csvContent = await getExcelFile(titleArr, xlsList, getXlsName(), undefined)
                    .arrayBuffer()
                    .then((buffer) => buffer)
                backupData.push({
                    content: csvContent,
                    folder: '',
                    name: getXlsName(),
                })
            }
        }

        const updateProgress = (currentTask: number) => {
            pageData.value.progress = Math.ceil((currentTask / indexData.length) * 100)
            pageData.value.currentTask = currentTask
        }

        const getSmartTargetSnapImageXml = (data: oldIndexDataItem, isPanorama?: boolean) => {
            return rawXml`
                <condition>
                    <imgId>${data.imgId}</imgId>
                    <chlId>${data.chlId}</chlId>
                    <frameTime>${data.frameTimeStr}</frameTime>
                    <pathGUID>${data.pathGUID}</pathGUID>
                    <sectionNo>${data.sectionNo}</sectionNo>
                    <fileIndex>${data.fileIndex}</fileIndex>
                    <blockNo>${data.blockNo}</blockNo>
                    <offset>${data.offset}</offset>
                    <eventType>${data.eventType}</eventType>
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
            const chlName = indexData[zipFileIndex * maxFileOfZip].chlName
            zipFileIndex++
            await downloadZip({ zipName: getZipName(chlName as string), files: backupData as backupDataItem[] })
            if (zipFileIndex === zipFileNum) {
                console.log('end backup ' + indexData.length + ' data =', formatDate(new Date()))
                initData()
                pageData.value.isShowDialog = false
                openMessageBox({ type: 'success', message: Translate('IDCS_BACKUP_SUCCESS') })
            } else {
                backupData = []
            }
        }

        const getPicName = (option: getPicNameOption) => {
            const chlName = option.chlName || Translate('IDCS_UNKNOWN_CHANNEL') + '1'
            const time = formatDate(new Date(option.frameTime as number), 'YYYY-MM-DD HH:mm:ss')
            const plateName = option.plateNumber ? option.plateNumber + '_' : ''
            const picType = option.isFaceCompare ? 'target' : option.originType
            const picFaceName = option.isFaceCompare ? '_' + option.faceDataBaseInfo!.name : ''
            const picFaceGroup = option.isFaceCompare ? '-' + option.faceDataBaseInfo!.group_name : ''
            const targetIDName = option.targetID ? `_${option.targetID}` : ''
            const picTypeName = picType ? `_${picType}` : ''
            const fileName = plateName + chlName + '_' + time.replace(/(\-)|(\:)|(\s)/g, '') + '_' + option.timeStamp100ns + targetIDName + picTypeName + picFaceName + picFaceGroup + '.jpg'
            return checkFileName(fileName)
        }

        const getVideoName = (chlName: string | undefined, frameTime: number) => {
            chlName = chlName || Translate('IDCS_UNKNOWN_CHANNEL') + '1'
            const time = formatDate(new Date(frameTime), 'YYYY-MM-DD HH:mm:ss')
            const fileName = chlName + '_' + time.replace(/(\-)|(\:)|(\s)/g, '') + '.avi'
            return checkFileName(fileName)
        }

        const getXlsName = () => {
            const type = isBackupPlateCsv ? CSV_MAPPING.plate.title : CSV_MAPPING.passRecord.title
            const time = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
            const fileName = type + '-' + time + '.xls'
            return fileName
        }

        const getZipName = (chlName: string | null) => {
            const resultChlName = chlName || Translate('IDCS_UNKNOWN_CHANNEL') + '1'
            const time = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
            const fileName = resultChlName.replace(FILE_LIMIT_REG, '#') + '_' + time.replace(/(\-)|(\:)|(\s)/g, '')
            return checkFileName(fileName)
        }

        const checkFileName = (fileName: string) => {
            if (!fileNameMap[fileName]) {
                fileNameMap[fileName] = 1
            } else {
                fileNameMap[fileName]++
                const fileSuffixReg = /\.([a-zA-Z0-9]+)$/
                const fileSuffix = fileName.match(fileSuffixReg)![0]
                const fileSuffixIndex = fileName.indexOf(fileSuffix)
                fileName = fileName.slice(0, fileSuffixIndex) + '(' + fileNameMap[fileName] + ')' + fileSuffix
            }
            return fileName
        }

        ctx.expose({
            startBackup,
        })

        onBeforeUnmount(() => {
            recorder && recorder.destroy()
        })

        return {
            pageData,
            handleBackup,
        }
    },
})
