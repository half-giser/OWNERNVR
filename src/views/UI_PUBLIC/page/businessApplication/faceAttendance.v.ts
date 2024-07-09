/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-05 18:18:35
 * @Description: 业务应用-人脸考勤
 */

import { type CheckboxValueType } from 'element-plus'
import { getChlList } from '@/utils/tools'
import { getXmlWrapData } from '@/api/api'
import { QueryNodeListDto } from '@/types/apiType/channel'
import { FaceAttendancePageData, FaceGroupInfoItem, FacePersonnalInfoItem } from '@/types/apiType/business'
import { queryFacePersonnalInfoGroupList, queryFacePersonnalInfoList } from '@/api/business'
import { queryTimeCfg } from '@/api/system'
import { queryXml } from '@/utils/xmlParse'
import { useLangStore } from '@/stores/lang'
import useLoading from '@/hooks/useLoading'
import useMessageBox from '@/hooks/useMessageBox'
import BaseTableSelectItemPop from '@/views/UI_PUBLIC/components/BaseTableSelectItemPop.vue'
import BaseDateSelectTab from '@/views/UI_PUBLIC/components/BaseDateSelectTab.vue'
import BaseDateSelectPreNextBtn from '@/views/UI_PUBLIC/components/BaseDateSelectPreNextBtn.vue'

export default defineComponent({
    components: {
        BaseTableSelectItemPop,
        BaseDateSelectTab,
        BaseDateSelectPreNextBtn,
    },
    setup() {
        // 多语言翻译方法
        const { Translate } = useLangStore()
        // 页面Loading
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        // 提示弹框
        const { openMessageTipBox } = useMessageBox()

        // 页面初始数据
        const pageData = reactive<FaceAttendancePageData>(new FaceAttendancePageData())

        /*
         * 系统日期相关功能---start---
         */
        // 获取系统日期格式
        const formatMapping: Record<string, string> = {
            'year-month-day': 'yyyy/MM/dd',
            'month-day-year': 'MM/dd/yyyy',
            'day-month-year': 'dd/MM/yyyy',
            '24': 'HH:mm:ss',
            '12': 'hh:mm:ss tt',
        }
        function getTimeCfg(callback: Function) {
            openLoading(LoadingTarget.FullScreen)
            queryTimeCfg().then((result: any) => {
                closeLoading(LoadingTarget.FullScreen)
                const resultXml = queryXml(result)
                if (resultXml('status').text() === 'success') {
                    const dateType = resultXml('//content/formatInfo/date').text()
                    const timeType = resultXml('//content/formatInfo/time').text()
                    const dateFormat = formatMapping[dateType]
                    const timeFormat = formatMapping[timeType]
                    const dateTimeFormat = {
                        dateFormat: dateFormat,
                        timeFormat: timeFormat,
                        format: `${dateFormat} ${timeFormat}`,
                        dateFormatForCalc: 'yyyy/MM/dd', // 固定格式，方便split,join,getMonth等自定义计算
                        timeFormatForCalc: 'hh:mm:ss tt', // 固定格式，方便split,join,getMonth等自定义计算
                        formatForCalc: 'yyyy/MM/dd hh:mm:ss tt', // 固定格式，方便split,join,getMonth等自定义计算
                    }
                    pageData.dateTimeFormat = dateTimeFormat
                    if (typeof callback === 'function') {
                        callback()
                    }
                }
            })
        }
        /*
         * 系统日期相关功能---end---
         */

        /*
         * 1. 通道列表相关功能---start---
         */
        // 获取数据-更新通道列表
        function getPageChlList() {
            const queryNodeListDto = new QueryNodeListDto()
            queryNodeListDto.authList = '@spr,@bk'
            queryNodeListDto.isContainsDeletedItem = true
            openLoading(LoadingTarget.FullScreen)
            getChlList(queryNodeListDto).then((result: any) => {
                closeLoading(LoadingTarget.FullScreen)
                const resultXml = queryXml(result)
                if (resultXml('status').text() === 'success') {
                    resultXml('//content/item').forEach((ele: any) => {
                        const eleXml = queryXml(ele.element)
                        const chlId = ele.attr('id')
                        const chlName = eleXml('name').text()
                        const chlItem = {} as SelectItem
                        chlItem.value = chlId
                        chlItem.label = chlName
                        pageData.chlList.push(chlItem)
                        pageData.chlSelectedList.push(chlItem)
                        pageData.chlIdList.push(chlId)
                        pageData.chlSelectedIdList.push(chlId)
                        pageData.chlNameList.push(chlName)
                        pageData.chlSelectedNameList.push(chlName)
                        pageData.chlNameListStr = pageData.chlNameList.join(';')
                        pageData.chlSelectedNameListStr = pageData.chlSelectedNameList.join(';')
                        pageData.chlIdNameMapping[chlId] = chlName
                    })
                }
            })
        }
        // 选择通道弹框-标识
        const selectChlPopVisiable = ref(false)
        // 全选通道
        function handleChlSelectedAllFlgChange(selectedAll: CheckboxValueType) {
            pageData.chlSelectedList = selectedAll ? pageData.chlList : []
        }
        // 选择通道
        function handleSelectChl() {
            selectChlPopVisiable.value = true
        }
        // 选择通道-ok回调
        function setChlSelectedDataCallBack(chlSelectedList: SelectItem[]) {
            pageData.chlSelectedList = chlSelectedList
            pageData.chlSelectedAllFlg = pageData.chlSelectedList.length === pageData.chlList.length
            selectChlPopVisiable.value = false
        }
        // 选择通道-cancel回调
        function handleSelectChlPopClose() {
            selectChlPopVisiable.value = false
        }
        // 实时响应-选择不同通道后相关数据变化
        watchEffect(() => {
            pageData.chlSelectedIdList = pageData.chlSelectedList.map((ele: SelectItem) => ele.value)
            pageData.chlSelectedNameList = pageData.chlSelectedList.map((ele: SelectItem) => ele.label)
            pageData.chlSelectedNameListStr = pageData.chlSelectedNameList.join(';')
        })
        /*
         * 1. 通道列表相关功能---end---
         */

        /*
         * 2. 人脸分组相关功能---start---
         */
        // 获取数据-更新人脸分组列表数据
        function getFacePersonnalInfoGroupList() {
            openLoading(LoadingTarget.FullScreen)
            queryFacePersonnalInfoGroupList().then((result: any) => {
                closeLoading(LoadingTarget.FullScreen)
                pageData.faceIdFacePersonnalInfoMap = {}
                pageData.faceGroupIdFaceIdListMap = {}
                const resultXml = queryXml(result)
                if (resultXml('status').text() === 'success') {
                    resultXml('//content/item').forEach((ele: any) => {
                        const eleXml = queryXml(ele.element)
                        const id = ele.attr('id')
                        const groupId = eleXml('groupId').text()
                        const groupName = eleXml('name').text()
                        const property = eleXml('property').text()
                        const faceGroupItem = new FaceGroupInfoItem()
                        faceGroupItem.id = id
                        faceGroupItem.groupId = groupId
                        // 分组名称
                        let tempGroupName = ''
                        switch (faceGroupItem.groupId) {
                            case '1':
                            case '2':
                                tempGroupName = groupName ? groupName : Translate('IDCS_WHITE_LIST') + faceGroupItem.groupId
                                break
                            case '3':
                                tempGroupName = groupName ? groupName : Translate('IDCS_BLACK_LIST')
                                break
                            default:
                                tempGroupName = groupName
                                break
                        }
                        faceGroupItem.groupName = tempGroupName
                        faceGroupItem.property = property
                        faceGroupItem.value = faceGroupItem.groupId
                        faceGroupItem.label = faceGroupItem.groupName
                        pageData.faceGroupList.push(faceGroupItem)
                        pageData.faceGroupSelectedList.push(faceGroupItem)
                        pageData.faceGroupIdList.push(groupId)
                        pageData.faceGroupSelectedIdList.push(groupId)
                        pageData.faceGroupNameList.push(tempGroupName)
                        pageData.faceGroupSelectedNameList.push(tempGroupName)
                        pageData.faceGroupNameListStr = pageData.faceGroupNameList.join(';')
                        pageData.faceGroupSelectedNameListStr = pageData.faceGroupSelectedNameList.join(';')
                        // 获取数据-更新各个人脸分组对应的人脸信息列表
                        getFacePersonnalInfoList(faceGroupItem.groupId, '')
                    })
                }
            })
        }
        // 选择人脸分组弹框-标识
        const selectFaceGroupPopVisiable = ref(false)
        // 全选人脸分组
        function handleFaceGroupSelectedAllFlgChange(selectedAll: CheckboxValueType) {
            pageData.faceGroupSelectedList = selectedAll ? pageData.faceGroupList : []
        }
        // 选择人脸分组
        function handleSelectFaceGroup() {
            selectFaceGroupPopVisiable.value = true
        }
        // 选择人脸分组-ok回调
        function setFaceGroupSelectedDataCallBack(faceGroupSelectedList: FaceGroupInfoItem[]) {
            pageData.faceGroupSelectedList = faceGroupSelectedList
            pageData.faceGroupSelectedAllFlg = pageData.faceGroupSelectedList.length === pageData.faceGroupList.length
            selectFaceGroupPopVisiable.value = false
        }
        // 选择人脸分组-cancel回调
        function handleSelectFaceGroupPopClose() {
            selectFaceGroupPopVisiable.value = false
        }
        // 获取数据-更新各个人脸分组对应的人脸信息列表
        function getFacePersonnalInfoList(groudId: string, id: string) {
            let sendXml = '<condition>'
            if (groudId) {
                sendXml += `
                    <faceFeatureGroups type="list">
                        <item id="${groudId}"></item>
                    </faceFeatureGroups>
                `
            }
            if (id) {
                sendXml += '<id>' + id + '</id>'
            }
            sendXml += '</condition>'
            const data: string = getXmlWrapData(sendXml)
            openLoading(LoadingTarget.FullScreen)
            queryFacePersonnalInfoList(data).then((result: any) => {
                closeLoading(LoadingTarget.FullScreen)
                const resultXml = queryXml(result)
                if (resultXml('status').text() === 'success') {
                    resultXml('//content/item').forEach((ele1: any) => {
                        const ele1Xml = queryXml(ele1.element)
                        const faceId = ele1.attr('id')
                        const faceName = ele1Xml('name').text()
                        const groups: Array<{ groupId: string; groupName: string }> = []
                        ele1Xml('groups/item').forEach((ele2: any) => {
                            const ele2Xml = queryXml(ele2.element)
                            const groupId = ele2Xml('groupId').text()
                            const groupName = ele2Xml('name').text() || ''
                            groups.push({
                                groupId: groupId,
                                groupName: groupName,
                            })
                        })
                        const facePersonnalInfoItem = new FacePersonnalInfoItem()
                        facePersonnalInfoItem.faceId = faceId
                        facePersonnalInfoItem.faceName = faceName
                        facePersonnalInfoItem.groupId = groups[0]?.groupId
                        facePersonnalInfoItem.groups = groups
                        pageData.faceIdFacePersonnalInfoMap[facePersonnalInfoItem.faceId] = facePersonnalInfoItem
                        const faceGroupIdFaceIdListItem: Array<string | number> = []
                        if (!pageData.faceGroupIdFaceIdListMap[facePersonnalInfoItem.groupId]) {
                            pageData.faceGroupIdFaceIdListMap[facePersonnalInfoItem.groupId] = faceGroupIdFaceIdListItem
                        }
                        pageData.faceGroupIdFaceIdListMap[facePersonnalInfoItem.groupId].push(facePersonnalInfoItem.faceId)
                    })
                    // console.log('faceIdFacePersonnalInfoMap = ', pageData.faceIdFacePersonnalInfoMap)
                    // console.log('faceGroupIdFaceIdListMap = ', pageData.faceGroupIdFaceIdListMap)
                }
            })
        }
        // 实时响应-选择不同人脸分组后相关数据变化
        watchEffect(() => {
            pageData.faceGroupSelectedIdList = pageData.faceGroupSelectedList.map((ele: FaceGroupInfoItem) => ele.value)
            pageData.faceGroupSelectedNameList = pageData.faceGroupSelectedList.map((ele: FaceGroupInfoItem) => ele.label)
            pageData.faceGroupSelectedNameListStr = pageData.faceGroupSelectedNameList.join(';')
        })
        /*
         * 2. 人脸分组相关功能---end---
         */

        /*
         * 3. 日期选择相关功能---start---
         */
        // 日期选择-回调（获取当前选中的日期标签项、开始时间、展示时间）
        function handleSelectDateCallback(selectedDateInfo: SelectedDateInfo) {
            pageData.selectedDateInfo = selectedDateInfo
        }
        // 前一个日期
        function handlePreDateCallback(selectedDateInfo: SelectedDateInfo) {
            pageData.selectedDateInfo = selectedDateInfo
        }
        // 后一个日期
        function handleNextDateCallback(selectedDateInfo: SelectedDateInfo) {
            pageData.selectedDateInfo = selectedDateInfo
        }
        /*
         * 3. 日期选择相关功能---end---
         */

        /*
         * 4. 考勤周期、考勤时间、搜索、导出相关功能---start---
         */
        // 比较上班时间和下班时间（）
        let attendanceStartTimeBlur = '09:00:00'
        let attendanceEndTimeBlur = '18:00:00'
        function handleCompareAttdStartAndEndTime(time: string, timeType: string) {
            const startTimeStamp = new Date(`2018/01/01 ${pageData.attendanceStartTime}`).getTime()
            const endTimeStamp = new Date(`2018/01/01 ${pageData.attendanceEndTime}`).getTime()
            if (startTimeStamp >= endTimeStamp) {
                if (timeType === 'start') {
                    pageData.attendanceStartTime = attendanceStartTimeBlur
                } else {
                    pageData.attendanceEndTime = attendanceEndTimeBlur
                }
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_END_TIME_GREATER_THAN_START'),
                    showCancelButton: false,
                }).catch(() => {})
            }
            if (timeType === 'start') {
                attendanceStartTimeBlur = time
            } else {
                attendanceEndTimeBlur = time
            }
        }
        // 搜索
        function searchData() {
            console.log('search')
        }
        // 导出
        function exportData() {
            console.log('export')
        }
        /*
         * 4. 考勤周期、考勤时间、搜索、导出相关功能---end---
         */

        // 查询-发起请求
        getTimeCfg(() => {
            getPageChlList()
            getFacePersonnalInfoGroupList()
        })

        // 校验数据合法性
        // 校验数据是否被修改

        // 编辑-下发编辑协议

        // 处理错误码提示

        return {
            pageData,
            selectChlPopVisiable,
            handleChlSelectedAllFlgChange,
            handleSelectChl,
            setChlSelectedDataCallBack,
            handleSelectChlPopClose,
            selectFaceGroupPopVisiable,
            handleFaceGroupSelectedAllFlgChange,
            handleSelectFaceGroup,
            setFaceGroupSelectedDataCallBack,
            handleSelectFaceGroupPopClose,
            handleSelectDateCallback,
            handlePreDateCallback,
            handleNextDateCallback,
            handleCompareAttdStartAndEndTime,
            searchData,
            exportData,
        }
    },
})
