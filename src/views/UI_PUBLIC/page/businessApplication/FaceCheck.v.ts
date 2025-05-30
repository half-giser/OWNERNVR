/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-27 14:27:13
 * @Description: 业务应用-人脸签到
 */
import dayjs from 'dayjs'
import FaceDetailPop from './FaceDetailPop.vue'

export default defineComponent({
    components: {
        FaceDetailPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        // 周与文本的映射
        const WEEK_DAY_MAPPING = getTranslateMapping(DEFAULT_WEEK_MAPPING)

        const TYPE_MAPPING: Record<string, string> = {
            checked: Translate('IDCS_ATTENDANCE_CHECKED'),
            unchecked: Translate('IDCS_ATTENDANCE_UNCHECK'),
        }

        const pageData = ref({
            // 类型选项
            typeOptions: objectToOptions(TYPE_MAPPING, 'string'),
            // 日期范围类型
            dateRangeType: 'date',
            // 通道列表
            chlList: [] as SelectOption<string, string>[],
            // 人脸组列表
            faceGroupList: [] as BusinessFaceGroupList[],
            // 打开通道选项弹窗
            isSelectChlPop: false,
            // 打开人脸组选项弹窗
            isSelectFaceGroupPop: false,
            // 通道是否全选
            isAllChl: true,
            // 人脸组是否全选
            isAllFaceGroup: true,
            // 是否显示详情弹窗
            isDetailPop: false,
            // 详情数据
            detail: new BusinessFaceCheckList(),
        })

        const formData = ref(new BusinessFaceCheckForm())

        const tableData = ref<BusinessFaceCheckList[]>([])

        const chlMap: Record<string, string> = {}

        const sliceTableData = computed(() => {
            return tableData.value.slice((formData.value.currentPage - 1) * formData.value.pageSize, formData.value.currentPage * formData.value.pageSize)
        })

        /**
         * @description 更改时间范围类型
         * @param {Array} value 时间戳 ms
         * @param {String} type
         */
        const changeDateRange = (value: [number, number], type: string) => {
            formData.value.dateRange = [...value]
            if (type === 'today') {
                pageData.value.dateRangeType = 'date'
            } else {
                pageData.value.dateRangeType = type
            }
        }

        // 时间范围日期数
        const daysInRange = computed(() => {
            const today = dayjs()
            if (today.isBefore(dayjs(formData.value.dateRange[1]))) {
                return Math.ceil(today.diff(formData.value.dateRange[0], 'day', true))
            }
            return Math.ceil(dayjs(formData.value.dateRange[1]).diff(formData.value.dateRange[0], 'day', true))
        })

        /**
         * @description 序号显示
         * @param {Number} index
         * @returns {Number}
         */
        const displayIndex = (index: number) => {
            return formData.value.pageSize * (formData.value.currentPage - 1) + index + 1
        }

        /**
         * @description 状态文本显示
         * @param {Number} num
         * @returns {String}
         */
        const displayStatus = (num: number) => {
            if (!num) return '--'
            return num + Translate('IDCS_DAY_TIME')
        }

        /**
         * @description 获取通道列表
         */
        const getChannelList = async () => {
            const result = await getChlList({
                isContainsDeletedItem: true,
                authList: '@spr,@bk',
            })
            const $ = queryXml(result)
            pageData.value.chlList = $('content/item').map((item) => {
                const $item = queryXml(item.element)
                chlMap[item.attr('id')] = $item('name').text()
                return {
                    value: item.attr('id'),
                    label: $item('name').text(),
                }
            })
            formData.value.chls = cloneDeep(pageData.value.chlList)
        }

        /**
         * @description 获取人脸组列表
         */
        const getFaceGroupList = async () => {
            const result = await queryFacePersonnalInfoGroupList()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.faceGroupList = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    let name = $item('name').text()
                    const groupId = $item('groupId').text()
                    switch (groupId) {
                        case '1':
                        case '2':
                            name = name ? name : Translate('IDCS_WHITE_LIST') + groupId
                            break
                        case '3':
                            name = name ? name : Translate('IDCS_BLACK_LIST')
                            break
                        default:
                            break
                    }

                    return {
                        id: item.attr('id'),
                        name,
                        property: $item('property').text(),
                        groupId,
                        members: [],
                    }
                })
            }
        }

        /**
         * @description 人脸组信息
         * @param {String} id
         * @param {Number} index 索引
         */
        const getFaceGroupInfo = async (id: string, index: number) => {
            const sendXml = rawXml`
                <condition>
                    <faceFeatureGroups types="list">
                        <item id="${id}"></item>
                    </faceFeatureGroups>
                </condition>
            `
            const result = await queryFacePersonnalInfoList(sendXml)
            const $ = queryXml(result)
            pageData.value.faceGroupList[index].members = $('content/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    id: item.attr('id'),
                    name: $item('name').text(),
                }
            })
        }

        /**
         * @description 范围开始时间与结束时间的所有日子列表
         * @returns {Array}
         */
        const getAllDates = () => {
            const startTime = dayjs(formData.value.dateRange[0])
            const date: { date: string; day: string; format: string }[] = []
            for (let i = 0; i < daysInRange.value; i++) {
                const current = startTime.add(i, 'day')
                const day = current.day()
                date.push({
                    day: WEEK_DAY_MAPPING[day],
                    date: formatDate(current, DEFAULT_YMD_FORMAT),
                    format: formatDate(current, dateTime.dateFormat),
                })
            }

            return date
        }

        /**
         * @description 打开通道弹窗
         */
        const changeChl = () => {
            pageData.value.isSelectChlPop = true
        }

        /**
         * @description 确认更改通道
         * @param {Array} rows
         */
        const confirmChangeChl = (rows: SelectOption<string, string>[]) => {
            formData.value.chls = rows
            pageData.value.isAllChl = formData.value.chls.length === pageData.value.chlList.length
        }

        /**
         * @description 通道全选/取消全选
         */
        const changeAllChl = () => {
            if (pageData.value.isAllChl) {
                formData.value.chls = cloneDeep(pageData.value.chlList)
            } else {
                formData.value.chls = []
            }
        }

        /**
         * @description 打开人脸组弹窗
         */
        const changeFaceGroup = () => {
            pageData.value.isSelectFaceGroupPop = true
        }

        /**
         * @description 确认更改人脸组
         * @param {Array} rows
         */
        const confirmChangeFaceGroup = (rows: BusinessFaceGroupList[]) => {
            formData.value.faceGroup = rows
            pageData.value.isAllFaceGroup = formData.value.faceGroup.length === pageData.value.faceGroupList.length
        }

        /**
         * @description 人脸组全选/取消全选
         */
        const changeAllFaceGroup = () => {
            if (pageData.value.isAllFaceGroup) {
                formData.value.faceGroup = cloneDeep(pageData.value.faceGroupList)
            } else {
                formData.value.faceGroup = []
            }
        }

        /**
         * @description 查看详情
         * @param {Number} index
         */
        const showDetail = (index: number) => {
            pageData.value.detail = sliceTableData.value[index]
            pageData.value.isDetailPop = true
        }

        /**
         * @description 搜索数据
         */
        const searchData = () => {
            formData.value.currentPage = 1
            getData()
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            if (!formData.value.chls.length) {
                openMessageBox(Translate('IDCS_PROMPT_CHANNEL_GROUP_EMPTY'))
                return
            }

            if (!formData.value.faceGroup.length) {
                openMessageBox(Translate('IDCS_SELECT_GROUP_NOT_EMPTY'))
            }

            openLoading()

            const sendXml = rawXml`
                <condition>
                    <startTime>${localToUtc(formData.value.dateRange[0])}</startTime>
                    <endTime>${localToUtc(formData.value.dateRange[1])}</endTime>
                    <chls type="list">${formData.value.chls.map((item) => `<item id="${item.value}" />`).join('')}</chls>
                    <event>
                        <eventType>byWhiteList</eventType>
                    </event>
                </condition>
            `
            const result = await searchImageByImageV2(sendXml)
            const $ = queryXml(result)

            closeLoading()

            const tableRecord: Record<string, BusinessFaceCheckList> = {}
            formData.value.faceGroup.forEach((item) => {
                item.members.forEach((member) => {
                    tableRecord[member.id] = {
                        id: member.id,
                        name: member.name,
                        groupId: item.groupId,
                        groupName: item.name,
                        checked: 0,
                        unchecked: 0,
                        searchData: {},
                        detail: [],
                    }
                })
            })

            $('content/i')
                .map((item) => {
                    const textArr = item.text().array()
                    const chlId = getChlGuid16(textArr[4]).toUpperCase()
                    const timestamp = hexToDec(textArr[1]) * 1000
                    return {
                        faceFeatureId: hexToDec(textArr[0]) + '',
                        timestamp,
                        frameTime: localToUtc(timestamp) + ':' + padStart(hexToDec(textArr[2]), 7),
                        imgId: hexToDec(textArr[3]),
                        chlId,
                        chlName: chlMap[chlId],
                    }
                })
                .toSorted((a, b) => a.timestamp - b.timestamp)
                .forEach((item) => {
                    if (tableRecord[item.faceFeatureId]) {
                        const date = formatDate(item.timestamp, DEFAULT_YMD_FORMAT)
                        if (!tableRecord[item.faceFeatureId].searchData[date]) {
                            tableRecord[item.faceFeatureId].searchData[date] = []
                        }
                        tableRecord[item.faceFeatureId].searchData[date].push(item)
                    }
                })

            const allDates = getAllDates()
            const tableList = Object.values(tableRecord)

            allDates.forEach((date) => {
                tableList.forEach((item, index) => {
                    if (!item.searchData[date.date]) {
                        tableList[index].unchecked++
                        tableList[index].detail.push({
                            date: date.date,
                            day: date.day,
                            alarm: 'unchecked',
                            type: TYPE_MAPPING.unchecked,
                            detail: [],
                        })
                        return
                    }

                    const onTime = dayjs(date.date + ' ' + formData.value.startTime, DEFAULT_DATE_FORMAT).valueOf()
                    const offTime = dayjs(date.date + ' ' + formData.value.endTime, DEFAULT_DATE_FORMAT).valueOf()
                    const find = item.searchData[date.date].filter((data) => {
                        return data.timestamp > onTime && data.timestamp < offTime
                    })
                    if (find.length) {
                        tableList[index].checked++
                    }
                    tableList[index].detail.push({
                        date: date.date,
                        day: date.day,
                        type: find.length ? TYPE_MAPPING.checked : TYPE_MAPPING.unchecked,
                        alarm: find.length ? 'checked' : 'unchecked',
                        detail: find,
                    })
                })
            })

            tableData.value = tableList.filter((item) => {
                if (!formData.value.advanced) {
                    return true
                }

                let nameFlag = true
                if (formData.value.isName) {
                    if (item.name.includes(formData.value.name)) {
                        nameFlag = true
                    } else {
                        nameFlag = false
                    }
                }

                let typeFlag = true
                if (formData.value.isType) {
                    if (!formData.value.type.length) {
                        typeFlag = true
                    } else if (formData.value.type.includes('checked') && item.checked) {
                        typeFlag = true
                    } else if (formData.value.type.includes('unchecked') && item.unchecked) {
                        typeFlag = true
                    } else {
                        typeFlag = false
                    }
                }

                return nameFlag && typeFlag
            })
        }

        /**
         * @description 导出数据
         */
        const exportData = () => {
            const head = [Translate('IDCS_NAME_PERSON'), Translate('IDCS_DATE_TITLE'), Translate('IDCS_WEEK'), Translate('IDCS_TYPE'), Translate('IDCS_ATTENDANCE_DETAIL')]
            const body: string[][] = tableData.value
                .map((item) => {
                    return item.detail.map((detail) => {
                        return [item.name, detail.date, detail.day, detail.type, detail.detail.map((item) => formatDate(item.timestamp, dateTime.timeFormat)).join('')]
                    })
                })
                .flat()
            const fileName = 'EXPORT_FACE_ATTENDANCE-' + formatDate(Date.now(), 'YYYYMMSSHHmmss') + '.xls'
            downloadExcel(head, body, fileName)
        }

        onActivated(async () => {
            openLoading()
            await getChannelList()
            await getFaceGroupList()
            for (let i = 0; i < pageData.value.faceGroupList.length; i++) {
                const item = pageData.value.faceGroupList[i]
                await getFaceGroupInfo(item.groupId, i)
            }
            formData.value.faceGroup = cloneDeep(pageData.value.faceGroupList)
            closeLoading()
        })

        return {
            pageData,
            formData,
            changeDateRange,
            daysInRange,
            displayIndex,
            displayStatus,
            tableData,
            searchData,
            exportData,
            changeChl,
            changeAllChl,
            confirmChangeChl,
            changeFaceGroup,
            changeAllFaceGroup,
            confirmChangeFaceGroup,
            showDetail,
            sliceTableData,
        }
    },
})
