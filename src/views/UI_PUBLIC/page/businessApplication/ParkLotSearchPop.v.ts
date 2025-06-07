/*
 * @Date: 2025-05-24 11:06:51
 * @Description: 停车场-车辆进出记录搜索弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import ParkLotSnapPanel from './ParkLotSnapPanel.vue'
import ParkLotInfoPanel from './ParkLotInfoPanel.vue'
import dayjs from 'dayjs'
import IntelSearchBackupPop, { type IntelSearchBackUpExpose } from '../intelligentAnalysis/IntelSearchBackupPop.vue'

export default defineComponent({
    components: {
        ParkLotSnapPanel,
        ParkLotInfoPanel,
        IntelSearchBackupPop,
    },
    emits: {
        close() {
            return true
        },
    },
    setup() {
        const { Translate } = useLangStore()

        // 图像失败重新请求最大次数
        const REPEAR_REQUEST_IMG_TIMES = 2
        // 图像缓存，避免重复请求相同的图片
        const cachePic = new Map<string, IntelSnapVehicleImgDto>()

        const backupPopRef = ref<IntelSearchBackUpExpose>()

        // 方向与文本映射
        const DIRECTION_MAPPING: Record<string | number, string> = {
            0: '', // 无
            1: Translate('IDCS_APPROACH'), // 进场
            2: Translate('IDCS_APPEARANCE'), // 出场
            in: Translate('IDCS_APPROACH'), // 进场
            out: Translate('IDCS_APPEARANCE'), // 出场
            in_out: Translate('IDCS_APPROACH_APPEARANCE'), // 进场和出场
        }

        const pageData = ref({
            dateRange: [0, 0] as [number, number],
            // 选择的通道ID列表
            chlIdList: [] as string[],
            direction: [] as number[],
            isDetailOpen: false,
            listTypeOptions: [
                {
                    label: Translate('IDCS_OPERATE_SNAPSHOT_MSPB'),
                    value: 'pic',
                },
            ],
            listType: 'pic',
            pageIndex: 1,
            pageSize: 40,
            backupTypeOptions: [
                {
                    label: Translate('IDCS_BACKUP_PICTURE'),
                    value: 'pic',
                },
                {
                    label: Translate('IDCS_BACKUP_ENTRY_EXIT_RECORDING'),
                    value: 'csv',
                },
                {
                    label: Translate('IDCS_BACKUP_PICTURE_ENTRY_EXIT_RECORDING'),
                    value: 'pic+csv',
                },
            ],
            plateNumber: '',
            sortType: 'time',
            detail: new BusinessParkingLotList(),
            detailIndex: 0,
        })

        const auth = useUserChlAuth()

        const tableData = ref<IntelSearchVehicleList[]>([])
        const sliceTableData = ref<IntelSearchVehicleList[]>([])
        const peerSliceTableData = ref<IntelTargetDataItem[]>([])

        let chlIdNameMap: Record<string, string> = {}

        /**
         * @description 获取通道ID与通道名称的映射
         * @param {Record<string, string>} e
         */
        const getChlIdNameMap = async (e: Record<string, string>) => {
            chlIdNameMap = e
        }

        const getUniqueKey = (row: { imgId: string; frameTime: string }) => {
            if (!row || !row.imgId || !row.frameTime) {
                return getNonce() + ''
            }
            return `${row.imgId}:${row.frameTime}`
        }

        const switchDetail = () => {
            pageData.value.isDetailOpen = !pageData.value.isDetailOpen
            if (pageData.value.isDetailOpen) {
                showDetail(pageData.value.detailIndex)
            }
        }

        const selectAll = computed(() => {
            return !!peerSliceTableData.value.length && !peerSliceTableData.value.some((item) => !item.checked)
        })

        const hasSelected = computed(() => {
            return peerSliceTableData.value.some((item) => item.checked)
        })

        const handleSelectAll = () => {
            if (!selectAll.value) {
                peerSliceTableData.value.forEach((item) => {
                    item.checked = true
                })
            } else {
                peerSliceTableData.value.forEach((item) => {
                    item.checked = false
                })
            }
        }

        const getList = async () => {
            openLoading()

            const sendXml = rawXml`
                <resultLimit>10000</resultLimit>
                <condition>
                    <startTime>${localToUtc(pageData.value.dateRange[0], DEFAULT_DATE_FORMAT)}</startTime>
                    <endTime>${localToUtc(pageData.value.dateRange[1], DEFAULT_DATE_FORMAT)}</endTime>
                    <chls type="list">${pageData.value.chlIdList.map((item) => `<item id="${item}"></item>`).join('')}</chls>
                    <events type="list">
                        <item>openGates</item>
                    </events>
                    <vehicle>
                        <item>car</item>
                        <item>motor</item>
                        ${!!pageData.value.plateNumber ? `<item num="${pageData.value.plateNumber}">plate</item>` : ''}
                        ${pageData.value.direction.map((item) => `<item directionType="${item}">plate</item>`).join('')}
                    </vehicle>
                    <targetAttribute type="list">
                        <item type="car">
                            <attribute></attribute>
                        </item>
                        <item type="motor">
                            <attribute></attribute>
                        </item>
                    </targetAttribute>
                    <targetAttributeEx type="list">
                        <item type="plate">
                            <attribute>
                                <item name="color">0,1,2,3,4,5,6,7,8,9,10,11</item>
                            </attribute>
                        </item>
                    </targetAttributeEx>
                </condition>
            `

            const result = await searchSmartTarget(sendXml)
            const $ = queryXml(result)

            closeLoading()

            tableData.value = $('content/i').map((item) => {
                const isDelSnap = item.attr('s') === 'd'
                const split = item.text().array()
                const guid = hexToDec(split[3])
                const chlId = getChlGuid16(split[3]).toUpperCase()
                const timestamp = hexToDec(split[0]) * 1000

                return {
                    isDelSnap: isDelSnap,
                    isNoData: false,
                    imgId: hexToDec(split[2]) + '',
                    timestamp,
                    frameTime: localToUtc(timestamp) + ':' + padStart(hexToDec(split[1]), 7),
                    guid,
                    chlId,
                    chlName: chlIdNameMap[chlId] || Translate('IDCS_HISTORY_CHANNEL'),
                    recStartTime: hexToDec(split[4]) * 1000,
                    recEndTime: hexToDec(split[5]) * 1000,
                    pathGUID: split[6],
                    sectionNo: hexToDec(split[7]),
                    fileIndex: hexToDec(split[8]),
                    bolckNo: hexToDec(split[9]),
                    offset: hexToDec(split[10]),
                    eventTypeID: hexToDec(split[11]),
                    direction: split[13],
                    openType: split[12],
                    plateNumber: '--',
                    pic: '',
                    panorama: '',
                    eventType: '',
                    targetType: '',
                    width: 1,
                    height: 1,
                    X1: 0,
                    Y1: 0,
                    X2: 0,
                    Y2: 0,
                    attribute: {},
                    owner: '',
                    ownerPhone: '',
                    isRelative: split[13] ? true : false,
                    plateEndTime: '',
                    plateStartTime: '',
                    remark: '',
                }
            })

            if (!tableData.value.length) {
                openMessageBox(Translate('IDCS_NO_RECORD_DATA'))
            }

            changeSortType()
        }

        /**
         * @description 方向文本格式化
         * @param {string} direction
         */
        const displayDirection = (direction: number | string) => {
            return DIRECTION_MAPPING[direction] || '--'
        }

        const changeSortType = () => {
            if (tableData.value.length) {
                if (pageData.value.sortType === 'time') {
                    tableData.value.sort((a, b) => {
                        return b.timestamp - a.timestamp
                    })
                } else {
                    tableData.value.sort((a, b) => {
                        if (a.guid === b.guid) {
                            return b.timestamp - a.timestamp
                        }
                        return a.guid - b.guid
                    })
                }
            }
            changePage(1)
        }

        const setTargetDataItem = (item: IntelSearchVehicleList, index: number) => {
            const row = peerSliceTableData.value[index]
            row.index = index + ''
            row.targetID = getUniqueKey(item)
            row.isNoData = item.isNoData
            row.isDelete = item.isDelSnap
            row.objPicData.data = item.panorama
            row.plateAttrInfo.plateNumber = item.plateNumber
            row.timeStamp = item.timestamp
            row.channelName = item.chlName + '-' + displayDirection(item.direction)
            row.chlID = item.chlId
        }

        /**
         * @description 页码切换
         * @param {number} pageIndex
         */
        const changePage = async (pageIndex: number) => {
            openLoading()
            let index = 0
            pageData.value.pageIndex = pageIndex
            sliceTableData.value = tableData.value.slice((pageIndex - 1) * pageData.value.pageSize, pageIndex * pageData.value.pageSize)
            peerSliceTableData.value = Array(sliceTableData.value.length)
                .fill(0)
                .map(() => new IntelTargetDataItem())

            sliceTableData.value.forEach(async (item, i) => {
                setTargetDataItem(item, i)

                const key = getUniqueKey(item)
                const flag = await getPic(item, false, i)

                if (flag) {
                    const flag2 = await getPic(item, true, i)
                    if (flag2) {
                        const pic = cachePic.get(key)!
                        item.pic = pic.pic
                        item.panorama = pic.panorama
                        item.width = pic.width
                        item.height = pic.height
                        item.X1 = pic.X1
                        item.Y1 = pic.Y1
                        item.X2 = pic.X2
                        item.Y2 = pic.Y2
                        item.isDelSnap = pic.isDelSnap
                        item.isNoData = pic.isNoData
                        item.attribute = pic.attribute
                        item.eventType = pic.eventType
                        item.targetType = pic.targetType
                        item.plateNumber = pic.plateNumber
                        item.owner = pic.owner
                        item.ownerPhone = pic.ownerPhone
                        item.plateStartTime = pic.plateStartTime
                        item.plateEndTime = pic.plateEndTime
                        item.remark = pic.remark
                    }
                }

                index++
                setTargetDataItem(item, i)

                if (index >= sliceTableData.value.length) {
                    closeLoading()
                }
            })

            if (!sliceTableData.value.length) {
                closeLoading()
            }
        }

        /**
         * @description 获取抓拍图或原图
         * @param {IntelSearchVehicleList} row
         * @param {boolean} isPanorama
         * @param {number} index
         */
        const getPic = async (row: IntelSearchVehicleList, isPanorama: boolean, index: number, times = 0) => {
            try {
                const key = getUniqueKey(row)
                const pic = cachePic.get(key)
                if (!row.isDelSnap && (!pic || !pic.pic || !pic.panorama)) {
                    const sendXml = rawXml`
                        <condition>
                            <imgId>${row.imgId}</imgId>
                            <chlId>${row.chlId}</chlId>
                            <frameTime>${row.frameTime}</frameTime>
                            <pathGUID>${row.pathGUID}</pathGUID>
                            <sectionNo>${row.sectionNo}</sectionNo>
                            <fileIndex>${row.fileIndex}</fileIndex>
                            <blockNo>${row.bolckNo}</blockNo>
                            <offset>${row.offset}</offset>
                            <eventType>${row.eventTypeID}</eventType>
                            ${isPanorama ? '<isPanorama />' : ''}
                        </condition>
                    `
                    const result = await requestSmartTargetSnapImage(sendXml)
                    const $ = queryXml(result)

                    if ($('status').text() === 'success') {
                        const content = $('content').text()
                        if (!content && times < REPEAR_REQUEST_IMG_TIMES) {
                            return getPic(row, isPanorama, index, times + 1)
                        }
                        const width = $('rect/ptWidth').text().num() || 1
                        const height = $('rect/ptHeight').text().num() || 1
                        const leftTopX = $('rect/leftTopX').text().num()
                        const leftTopY = $('rect/leftTopY').text().num()
                        const rightBottomX = $('rect/rightBottomX').text().num()
                        const rightBottomY = $('rect/rightBottomY').text().num()
                        const item = {
                            pic: pic ? pic.pic : '',
                            panorama: pic ? pic.panorama : '',
                            eventType: $('eventType').text(),
                            targetType: $('targetType').text(),
                            plateNumber: $('plateNumber').text() || '--',
                            width,
                            height,
                            X1: leftTopX / width,
                            Y1: leftTopY / height,
                            X2: rightBottomX / width,
                            Y2: rightBottomY / height,
                            isDelSnap: false,
                            isNoData: !content,
                            attribute: {} as Record<string, string>,
                            owner: $('owner').text(),
                            ownerPhone: $('ownerPhone').text(),
                            plateStartTime: $('plateStartTime').text(),
                            plateEndTime: $('plateEndTime').text(),
                            remark: $('remark').text(),
                            // OpenGateType: $('OpenGateType').text(),
                        }

                        $('attribute/item').forEach((attribute) => {
                            item.attribute[attribute.attr('type')] = attribute.text()
                        })

                        if (isPanorama) {
                            item.panorama = wrapBase64Img(content)
                        } else {
                            item.pic = wrapBase64Img(content)
                        }

                        cachePic.set(key, item)
                    } else {
                        const item = pic || new IntelSnapVehicleImgDto()
                        const errorCode = $('errorCode').text().num()
                        switch (errorCode) {
                            case ErrorCode.HTTPS_CERT_EXIST:
                                item.isDelSnap = true
                                item.isNoData = false
                                cachePic.set(key, item)
                                break
                            case ErrorCode.USER_ERROR_NO_RECORDDATA:
                                item.isDelSnap = false
                                item.isNoData = true
                                cachePic.set(key, item)
                                break
                            default:
                                // 重复获取数据
                                if (times < REPEAR_REQUEST_IMG_TIMES) {
                                    return getPic(row, isPanorama, index, times + 1)
                                }
                        }
                    }
                }

                if (getUniqueKey(row) === getUniqueKey(sliceTableData.value[index])) {
                    return true
                } else {
                    return false
                }
            } catch (e) {
                if (times < REPEAR_REQUEST_IMG_TIMES) {
                    return getPic(row, isPanorama, index, times + 1)
                } else {
                    if (getUniqueKey(row) === getUniqueKey(sliceTableData.value[index])) {
                        return true
                    } else {
                        return false
                    }
                }
            }
        }

        const showDetail = async (index: number) => {
            if (!sliceTableData.value[index] || !sliceTableData.value[index].frameTime) {
                return
            }
            await getOpenGateEvent(sliceTableData.value[index])
            pageData.value.isDetailOpen = true
            pageData.value.detailIndex = index
        }

        const getOpenGateEvent = async (data: IntelSearchVehicleList) => {
            openLoading()
            const virtualStart = '2000-01-01 00:00:00'
            const virtualEnd = '2080-01-01 00:00:00'
            const frameTime = data.frameTime
            const isDirectionIn = Number(data.direction) === 1
            const enterExitTime = dayjs.utc(frameTime.slice(0, -8), DEFAULT_DATE_FORMAT).valueOf()
            const startTime = isDirectionIn ? frameTime : virtualStart
            const endTime = isDirectionIn ? virtualEnd : frameTime
            const sendXml = rawXml`
                <condition>
                    <startTime>${startTime}</startTime>
                    <endTime>${endTime}</endTime>
                    <direction>${isDirectionIn ? 'out' : 'in'}</direction>
                    <plate>${wrapCDATA(data.plateNumber)}</plate>
                </condition>
            `
            const result = await searchOpenGateEventRelevanceData(sendXml)
            const $ = queryXml(result)
            closeLoading()

            const obj: BusinessParkingLotList = {
                index: 0,
                plateNum: data.plateNumber,
                eventType: data.eventTypeID,
                master: data.owner,
                phoneNum: data.ownerPhone,
                isEnter: isDirectionIn,
                enterImg: isDirectionIn ? data.panorama : '',
                enterChl: isDirectionIn ? data.chlName : '',
                enterChlId: '',
                enterType: isDirectionIn ? data.openType : '',
                enterTime: isDirectionIn ? enterExitTime : 0,
                enterFrameTime: '',
                enterVehicleId: '',
                enterSnapImg: isDirectionIn ? data.pic : '',
                enterTraceObj: isDirectionIn
                    ? {
                          X1: data.X1,
                          X2: data.X2,
                          Y1: data.Y1,
                          Y2: data.Y2,
                      }
                    : {
                          X1: 0,
                          Y1: 0,
                          X2: 0,
                          Y2: 0,
                      },
                isExit: !isDirectionIn,
                exitImg: !isDirectionIn ? data.panorama : '',
                exitChl: !isDirectionIn ? data.chlName : '',
                exitChlId: '',
                exitType: !isDirectionIn ? data.openType : '',
                exitTime: !isDirectionIn ? enterExitTime : 0,
                exitFrameTime: '',
                exitVehicleId: '',
                exitSnapImg: !isDirectionIn ? data.pic : '',
                exitTraceObj: !isDirectionIn
                    ? {
                          X1: data.X1,
                          X2: data.X2,
                          Y1: data.Y1,
                          Y2: data.Y2,
                      }
                    : {
                          X1: 0,
                          Y1: 0,
                          X2: 0,
                          Y2: 0,
                      },
                direction: data.direction,
                isHistory: false,
                type: '',
                abnormal: false,
                isRelative: false,
                remark: data.remark,
                plateStartTime: data.plateStartTime,
                plateEndTime: data.plateEndTime,
            }
            if ($('status').text() === 'success') {
                obj.master = $('owner').text() || obj.master
                obj.phoneNum = $('ownerPhone').text() || obj.phoneNum
                const resDirection = $('directionType').text()
                const gateName = $('gateName').text()
                const openType = $('openGateType').text()
                const apiTime = $('time').text()
                const time = apiTime ? dayjs.utc(apiTime.slice(0, -8), DEFAULT_DATE_FORMAT).valueOf() : 0
                const img = $('content').text()
                const snapImg = $('snapImageDate').text()
                const width = $('rect/ptWidth').text().num() || 1
                const height = $('rect/ptHeight').text().num() || 1
                const leftTopX = $('rect/leftTopX').text().num()
                const leftTopY = $('rect/leftTopY').text().num()
                const rightBottomX = $('rect/rightBottomX').text().num()
                const rightBottomY = $('rect/rightBottomY').text().num()

                if (resDirection === 'in') {
                    obj.enterChl = gateName
                    obj.enterType = openType
                    obj.enterTime = time
                    obj.enterImg = wrapBase64Img(img)
                    obj.enterSnapImg = wrapBase64Img(snapImg)
                    obj.isEnter = true
                    obj.enterTraceObj.X1 = leftTopX / width
                    obj.enterTraceObj.Y1 = leftTopY / height
                    obj.enterTraceObj.X2 = rightBottomX / width
                    obj.enterTraceObj.Y2 = rightBottomY / height
                } else if (resDirection === 'out') {
                    obj.exitChl = gateName
                    obj.exitType = openType
                    obj.exitTime = time
                    obj.exitImg = wrapBase64Img(img)
                    obj.exitSnapImg = wrapBase64Img(snapImg)
                    obj.isExit = true
                    obj.exitTraceObj.X1 = leftTopX / width
                    obj.exitTraceObj.Y1 = leftTopY / height
                    obj.exitTraceObj.X2 = rightBottomX / width
                    obj.exitTraceObj.Y2 = rightBottomY / height
                }
            }
            obj.type = getType(obj.isEnter, obj.enterType, obj.isExit, obj.exitType)

            pageData.value.detail = obj
        }

        /**
         * @description 获取进出结果枚举值
         * @param {boolean} isEnter
         * @param {string} enterType
         * @param {boolean} isExit
         * @param {string} exitType
         * @return {Enum}
         */
        const getType = (isEnter: boolean, enterType: string, isExit: boolean, exitType: string) => {
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

        const handlePrev = () => {
            if (!sliceTableData.value.length || pageData.value.detailIndex <= 0) {
                return
            }
            showDetail(pageData.value.detailIndex - 1)
        }

        const handleNext = () => {
            if (!sliceTableData.value.length || pageData.value.detailIndex >= sliceTableData.value.length - 1) {
                return
            }
            showDetail(pageData.value.detailIndex + 1)
        }

        /**
         * @description 备份单个记录
         * @param index
         */
        const backUpItem = (index: number) => {
            const data = sliceTableData.value[index]
            backupPopRef.value?.startBackup({
                apiType: 'legacy',
                isBackupPic: true,
                isBackupPassRecordCsv: false,
                indexData: [
                    {
                        chlId: data.chlId,
                        chlName: chlIdNameMap[data.chlId],
                        frameTime: Math.floor(data.timestamp / 1000),
                        frameTimeStr: data.frameTime,
                        imgId: data.imgId,
                        pathGUID: data.pathGUID,
                        sectionNo: data.sectionNo,
                        fileIndex: data.fileIndex,
                        blockNo: data.bolckNo,
                        offset: data.offset,
                        eventType: data.eventTypeID,
                        startTime: Math.floor(data.recStartTime / 1000),
                        endTime: Math.floor(data.recEndTime / 1000),
                    },
                ],
            })
        }

        /**
         * @description 备份
         */
        const backUp = (value: string) => {
            const isBackupPic = value.includes('pic')
            const isBackupPassRecordCsv = value.includes('csv')
            backupPopRef.value?.startBackup({
                apiType: 'legacy',
                isBackupPic,
                isBackupPassRecordCsv,
                indexData: sliceTableData.value
                    .filter((_item, index) => peerSliceTableData.value[index].checked)
                    .map((data) => {
                        return {
                            chlId: data.chlId,
                            chlName: chlIdNameMap[data.chlId],
                            frameTime: Math.floor(data.timestamp / 1000),
                            frameTimeStr: data.frameTime,
                            imgId: data.imgId,
                            pathGUID: data.pathGUID,
                            sectionNo: data.sectionNo,
                            fileIndex: data.fileIndex,
                            blockNo: data.bolckNo,
                            offset: data.offset,
                            eventType: data.eventTypeID,
                            startTime: Math.floor(data.recStartTime / 1000),
                            endTime: Math.floor(data.recEndTime / 1000),
                        }
                    }),
            })
        }

        return {
            pageData,
            switchDetail,
            getChlIdNameMap,
            handleSelectAll,
            tableData,
            changePage,
            showDetail,
            backUp,
            sliceTableData,
            peerSliceTableData,
            getList,
            handlePrev,
            handleNext,
            selectAll,
            hasSelected,
            backUpItem,
            backupPopRef,
            auth,
        }
    },
})
