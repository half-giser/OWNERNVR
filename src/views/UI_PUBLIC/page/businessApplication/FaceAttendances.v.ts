/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-05 18:18:35
 * @Description: 业务应用-人脸考勤
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-11-05 10:58:11
 */
import { cloneDeep } from 'lodash-es'
import dayjs from 'dayjs'
import { type BusinessFaceGroupList, BusinessFaceAttendanceList, BusinessFaceAttendanceForm } from '@/types/apiType/business'
import FaceDetailPop from './FaceDetailPop.vue'

export default defineComponent({
    components: {
        FaceDetailPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const dateTime = useDateTimeStore()

        // 周与文本的映射
        const WEEK_DAY_MAPPING: Record<number, string> = {
            0: Translate('IDCS_WEEK_DAY_SEVEN'),
            1: Translate('IDCS_WEEK_DAY_ONE'),
            2: Translate('IDCS_WEEK_DAY_TWO'),
            3: Translate('IDCS_WEEK_DAY_THREE'),
            4: Translate('IDCS_WEEK_DAY_FOUR'),
            5: Translate('IDCS_WEEK_DAY_FIVE'),
            6: Translate('IDCS_WEEK_DAY_SIX'),
        }

        const pageData = ref({
            // 周选项
            weekdayOptions: [
                {
                    label: Translate('IDCS_CALENDAR_SUNDAY'),
                    value: 0,
                },
                {
                    label: Translate('IDCS_CALENDAR_MONDAY'),
                    value: 1,
                },
                {
                    label: Translate('IDCS_CALENDAR_TUESDAY'),
                    value: 2,
                },
                {
                    label: Translate('IDCS_CALENDAR_WEDNESDAY'),
                    value: 3,
                },
                {
                    label: Translate('IDCS_CALENDAR_THURSDAY'),
                    value: 4,
                },
                {
                    label: Translate('IDCS_CALENDAR_FRIDAY'),
                    value: 5,
                },
                {
                    label: Translate('IDCS_CALENDAR_SATURDAY'),
                    value: 6,
                },
            ],
            // 类型选项
            typeOptions: [
                {
                    label: Translate('IDCS_NORMAL'),
                    value: 'normal',
                },
                {
                    label: Translate('IDCS_LATE'),
                    value: 'late',
                },
                {
                    label: Translate('IDCS_LEFT_EARLY'),
                    value: 'leftEarly',
                },
                {
                    label: Translate('IDCS_ATTENDANCE_NONE'),
                    value: 'absenteeism',
                },
                {
                    label: Translate('IDCS_ABNORMAL'),
                    value: 'abnormal',
                },
            ],
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
            detail: new BusinessFaceAttendanceList(),
        })

        const formData = ref(new BusinessFaceAttendanceForm())

        const tableData = ref<BusinessFaceAttendanceList[]>([])

        const startTime = computed(() => formData.value.startTime)
        const endTime = computed(() => formData.value.endTime)
        const pickerRange = useTimePickerRange(startTime, endTime)

        const chlMap: Record<string, string> = {}

        const sliceTableData = computed(() => {
            return tableData.value.slice(formData.value.currentPage - 1, formData.value.currentPage * formData.value.pageSize)
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
            pageData.value.chlList = $('//content/item').map((item) => {
                const $item = queryXml(item.element)
                chlMap[item.attr('id')!] = $item('name').text()
                return {
                    value: item.attr('id')!,
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
            if ($('//status').text() === 'success') {
                pageData.value.faceGroupList = $('//content/item').map((item) => {
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
                        id: item.attr('id')!,
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
            pageData.value.faceGroupList[index].members = $('//content/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    id: item.attr('id')!,
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
            const date: { day: string; date: string; format: string }[] = []
            for (let i = 0; i < daysInRange.value; i++) {
                const current = startTime.add(i, 'day')
                const day = current.day()
                if (formData.value.weekdays.includes(day)) {
                    date.push({
                        day: WEEK_DAY_MAPPING[day],
                        date: formatDate(current, 'YYYY-MM-DD'),
                        format: formatDate(current, dateTime.dateFormat),
                    })
                }
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
            pageData.value.isDetailPop = true
            pageData.value.detail = sliceTableData.value[index]
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
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_CHANNEL_GROUP_EMPTY'),
                })
                return
            }

            if (!formData.value.faceGroup.length) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_SELECT_GROUP_NOT_EMPTY'),
                })
            }

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

            const tableRecord: Record<string, BusinessFaceAttendanceList> = {}
            formData.value.faceGroup.forEach((item) => {
                item.members.forEach((member) => {
                    tableRecord[member.id] = {
                        id: member.id,
                        name: member.name,
                        groupId: item.groupId,
                        groupName: item.name,
                        normal: 0,
                        late: 0,
                        leftEarly: 0,
                        absenteeism: 0,
                        abnormal: 0,
                        searchData: {},
                        detail: [],
                    }
                })
            })

            $('//content/i')
                .map((item) => {
                    const textArr = item.text().split(',')
                    const chlId = getChlGuid16(textArr[4]).toUpperCase()
                    const timestamp = parseInt(textArr[1], 16) * 1000
                    return {
                        faceFeatureId: parseInt(textArr[0], 16) + '',
                        timestamp,
                        frameTime: localToUtc(timestamp) + ':' + ('0000000' + parseInt(textArr[2], 16)).slice(-7),
                        imgId: parseInt(textArr[3], 16),
                        chlId,
                        chlName: chlMap[chlId],
                    }
                    // obj.faceFeatureId = parseInt(textArr[0], 16)
                    // obj.calTimeS = parseInt(textArr[1], 16) * 1000
                    // obj.calTimeNS = ('0000000' + parseInt(textArr[2], 16)).slice(-7)
                    // obj.calTime = '' + obj.calTimeS + obj.calTimeNS
                    // obj.imgId = parseInt(textArr[3], 16)
                    // obj.chlId = getChlGuid16(textArr[4]).toUpperCase()
                    // obj.similarity = parseInt(textArr[5], 16)
                    // const randomNum = Math.round(Math.random() * $('//content/i').length)
                    // const random = ('000000000' + randomNum).slice(-10)
                    // const sim = ('000' + obj.similarity).slice(-3)
                    // obj.random = sim + obj.calTime + random
                    // obj.randomTime = obj.calTime + random
                    // const d1 = new Date(obj.calTimeS)
                    // const time1 = formatDate(d1, 'YYYY-MM-DD HH:mm:ss A')
                    // obj.frameTime = time1 + ':' + obj.calTimeNS
                    // obj.showTime = time1
                })
                .toSorted((a, b) => a.timestamp - b.timestamp)
                .forEach((item) => {
                    if (tableRecord[item.faceFeatureId]) {
                        const date = formatDate(item.timestamp, 'YYYY-MM-DD')
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
                        tableList[index].absenteeism++
                        tableList[index].detail.push({
                            date: date.date,
                            day: date.day,
                            type: Translate('IDCS_ATTENDANCE_NONE'),
                            alarm: true,
                            detail: [],
                        })
                        return
                    }

                    if (item.searchData[date.date].length === 1) {
                        tableList[index].abnormal++
                        tableList[index].detail.push({
                            type: Translate('IDCS_ABNORMAL'),
                            date: date.date,
                            day: date.day,
                            alarm: false,
                            detail: [item.searchData[date.date][0]],
                        })
                        return
                    }

                    const types: string[] = []
                    const onTime = dayjs(date.date + ' ' + formData.value.startTime, 'YYYY-MM-DD HH:mm:ss').valueOf()
                    const offTime = dayjs(date.date + ' ' + formData.value.endTime, 'YYYY-MM-DD HH:mm:ss').valueOf()

                    if (item.searchData[date.date][0].timestamp > onTime) {
                        tableList[index].late++
                        types.push(Translate('IDCS_LATE'))
                    }

                    if (item.searchData[date.date][item.searchData[date.date].length - 1].timestamp < offTime) {
                        tableList[index].leftEarly++
                        types.push(Translate('IDCS_LEFT_EARLY'))
                    }
                    tableList[index].detail.push({
                        date: date.date,
                        day: date.day,
                        type: !types.length ? Translate('IDCS_NORMAL') : types.join(', '),
                        alarm: types.includes(Translate('IDCS_LEFT_EARLY')),
                        detail: [item.searchData[date.date][0], item.searchData[date.date][item.searchData[date.date].length - 1]],
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
                    } else if (formData.value.type.includes('normal') && item.normal) {
                        typeFlag = true
                    } else if (formData.value.type.includes('abnormal') && item.abnormal) {
                        typeFlag = true
                    } else if (formData.value.type.includes('leftEarly') && item.leftEarly) {
                        typeFlag = true
                    } else if (formData.value.type.includes('late') && item.late) {
                        typeFlag = true
                    } else if (formData.value.type.includes('absenteeism') && item.absenteeism) {
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
            if (!tableData.value.length) {
                return
            }
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

        onMounted(async () => {
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
            pickerRange,
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
            FaceDetailPop,
        }
    },
})
