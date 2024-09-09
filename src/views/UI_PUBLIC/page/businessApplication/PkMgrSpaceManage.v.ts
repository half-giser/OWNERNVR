/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-27 09:38:30
 * @Description: 业务应用-停车场管理-车位管理
 */

import { PkMgrSpaceManagePageData, PkMgrSpaceManageItem } from '@/types/apiType/business'

export default defineComponent({
    setup() {
        // 多语言翻译方法
        const { Translate } = useLangStore()
        // 页面Loading
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        // 提示弹框
        const { openMessageTipBox } = useMessageBox()

        // 页面初始数据
        const pageData = reactive<PkMgrSpaceManagePageData>(new PkMgrSpaceManagePageData())
        let originalPageData = new PkMgrSpaceManagePageData()
        let changeDataFlg = false

        // 获取数据-更新排程列表
        async function getPageScheduleList() {
            const result = await queryScheduleList()
            return result
        }
        // 批量编辑排程
        function changeAllSchedule(groupSchedule: string) {
            if (groupSchedule === 'scheduleMgr') {
                manageSchedule()
            } else {
                pageData.tableDatas.forEach((ele: PkMgrSpaceManageItem) => {
                    ele.groupSchedule = groupSchedule
                    ele.oldGroupSchedule = groupSchedule
                })
            }
        }
        // 单个编辑排程
        function changeSingleSchedule(rowData: PkMgrSpaceManageItem) {
            if (rowData.groupSchedule === 'scheduleMgr') {
                manageSchedule()
                rowData.groupSchedule = rowData.oldGroupSchedule
            } else {
                rowData.oldGroupSchedule = rowData.groupSchedule
            }
        }
        // 管理排程
        function manageSchedule() {
            openMessageTipBox({
                type: 'info',
                message: Translate('管理排程'),
            })
        }

        // 获取数据-更新页面初始数据
        async function getPageData() {
            const result = await queryParkingLotConfig()
            return result
        }

        // 查询-发起请求
        openLoading(LoadingTarget.FullScreen)
        Promise.all([getPageScheduleList(), getPageData()]).then((resultArr) => {
            closeLoading(LoadingTarget.FullScreen)
            const result1Xml = queryXml(resultArr[0])
            const result2Xml = queryXml(resultArr[1])
            if (result1Xml('status').text() === 'success' && result2Xml('status').text() === 'success') {
                // 排程列表数据
                pageData.scheduleList = []
                result1Xml('//content/item').forEach((ele) => {
                    const scheduleInfo = {} as SelectItem
                    scheduleInfo.value = ele.attr('id')
                    scheduleInfo.label = ele.text()
                    pageData.scheduleList.push(scheduleInfo)
                })
                pageData.scheduleList.push({ value: '{00000000-0000-0000-0000-000000000000}', label: `<${Translate('IDCS_NULL')}>` })
                pageData.scheduleList.push({ value: 'scheduleMgr', label: Translate('IDCS_SCHEDULE_MANAGE') })
                pageData.scheduleIdList = pageData.scheduleList.map((ele: SelectItem) => ele.value)
                // 页面数据
                pageData.tableDatas = []
                pageData.totalNum = Number(result2Xml('//content/basicInfo/totalVehicleNum').text())
                pageData.remainTotalNum = Number(result2Xml('//content/basicInfo/remainSpaceNum').text())
                result2Xml('//content/parkingSapce/item').forEach((ele, idx) => {
                    const eleXml = queryXml(ele.element)
                    const pkMgrSpaceManageItem = new PkMgrSpaceManageItem()
                    pkMgrSpaceManageItem.id = ele.attr('id')!
                    pkMgrSpaceManageItem.serialNum = idx + 1
                    pkMgrSpaceManageItem.groupName = eleXml('groupName').text()
                    pkMgrSpaceManageItem.parkingType = eleXml('parkingType').text()
                    pkMgrSpaceManageItem.groupTotalNum = Number(eleXml('groupTotalNum').text())
                    pkMgrSpaceManageItem.groupRemainNum = Number(eleXml('groupRemainNum').text())
                    const groupSchedule = eleXml('groupSchedule').text()
                    pkMgrSpaceManageItem.groupSchedule = pageData.scheduleIdList.indexOf(groupSchedule) > -1 ? groupSchedule : pageData.defaultScheduleId
                    pkMgrSpaceManageItem.oldGroupSchedule = pkMgrSpaceManageItem.groupSchedule
                    pkMgrSpaceManageItem.linkEmail = eleXml('linkEmail').text()
                    pageData.tableDatas.push(pkMgrSpaceManageItem)
                })
                // 备份原始数据
                originalPageData = JSON.parse(JSON.stringify(pageData))
            }
        })

        // 校验数据合法性
        function validatePageData() {
            let isGroupTotalNull = false // 分组总车位是否为空
            let isGroupRemainNull = false // 分组剩余车位是否为空
            let isGroupRemainExceedGroupTotal = false // 分组剩余车位是否超过分组总车位
            let isGroupTotalExceedTotal = false // 分组总车位是否超过总车位
            let isGroupRemainExceedTotalRemain = false // 分组剩余总车位之和是否超过剩余总车位
            let isEmailError = false // 邮箱格式是否错误
            let groupTotalNum = 0 // 分组总车位数之和
            let groupRemainTotalNum = 0 // 分组剩余总车位数之和

            pageData.tableDatas.forEach((ele: PkMgrSpaceManageItem, idx) => {
                if (String(ele.groupTotalNum) === '' && ele.parkingType === 'usingGroup') {
                    isGroupTotalNull = true
                    return false
                }
                if (String(ele.groupRemainNum) === '' && ele.parkingType === 'usingGroup') {
                    isGroupRemainNull = true
                    return false
                }
                if (ele.groupRemainNum > ele.groupTotalNum) {
                    isGroupRemainExceedGroupTotal = true
                    return false
                }
                if (ele.linkEmail && !checkEmail(ele.linkEmail)) {
                    isEmailError = true
                    return false
                }
                if (ele.groupTotalNum && ele.parkingType === 'usingGroup') {
                    groupTotalNum = groupTotalNum + ele.groupTotalNum
                }
                if (ele.groupRemainNum && ele.parkingType === 'usingGroup') {
                    groupRemainTotalNum = groupRemainTotalNum + ele.groupRemainNum
                }
                if (idx === pageData.tableDatas.length - 1 && groupTotalNum > pageData.totalNum) {
                    isGroupTotalExceedTotal = true
                }
                if (idx === pageData.tableDatas.length - 1 && groupRemainTotalNum > pageData.remainTotalNum) {
                    isGroupRemainExceedTotalRemain = true
                }
            })

            if (isGroupTotalNull) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_GROUP_TOTAL_VEHICLE_NOT_CONFIG'),
                })
                return false
            } else if (isGroupRemainNull) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_GROUP_REMAIN_VEHICLE_NOT_CONFIG'),
                })
                return false
            } else if (isGroupRemainExceedGroupTotal) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_GROUP_REMAIN_VEHICLE_NUM_OVER_TIPS'),
                })
                return false
            } else if (isEmailError) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_INVALID_EMAIL'),
                })
                return false
            } else if (isGroupTotalExceedTotal) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_ALL_GROUP_VEHICLE_NUM_OVER_TIPS'),
                })
                return false
            } else if (isGroupRemainExceedTotalRemain) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_GROUP_TOTAL_REMAIN_SPACE_OVER_TIPS'),
                })
                return false
            }
            return true
        }
        // 校验数据是否被修改
        function compareDataChange(pageData: PkMgrSpaceManagePageData, originalPageData: PkMgrSpaceManagePageData) {
            changeDataFlg = false
            for (let i = 0; i < pageData.tableDatas.length; i++) {
                const ele1 = pageData.tableDatas[i]
                const ele2 = originalPageData.tableDatas[i]
                if (
                    ele1.parkingType !== ele2.parkingType ||
                    ele1.groupTotalNum !== ele2.groupTotalNum ||
                    ele1.groupRemainNum !== ele2.groupRemainNum ||
                    ele1.groupSchedule !== ele2.groupSchedule ||
                    ele1.linkEmail !== ele2.linkEmail
                ) {
                    changeDataFlg = true
                    break
                }
            }
        }

        // 编辑-下发编辑协议
        function apply() {
            if (!validatePageData()) return
            compareDataChange(pageData, originalPageData)
            if (changeDataFlg) {
                let sendXml = '<content><parkingSapce>'
                pageData.tableDatas.forEach((ele: PkMgrSpaceManageItem) => {
                    sendXml += rawXml`<item id="${ele.id}">
                        <groupName>${ele.groupName}</groupName>
                        <parkingType>${ele.parkingType}</parkingType>
                        <groupTotalNum>${ele.groupTotalNum.toString()}</groupTotalNum>
                        <groupRemainNum>${ele.groupRemainNum.toString()}</groupRemainNum>
                        <groupSchedule>${ele.groupSchedule}</groupSchedule>
                        <linkEmail><![CDATA[${ele.linkEmail}]]></linkEmail>
                    </item>`
                })
                sendXml += '</parkingSapce></content>'
                openLoading(LoadingTarget.FullScreen)
                editParkingLotConfig(sendXml).then((result) => {
                    closeLoading(LoadingTarget.FullScreen)
                    // 更新原始数据
                    originalPageData = JSON.parse(JSON.stringify(pageData))
                    const resultXml = queryXml(result)
                    if (resultXml('status').text() === 'success') {
                        handleSuccess()
                    } else {
                        const errorCode = Number(resultXml('errorCode').text())
                        handleError(errorCode)
                    }
                })
            }
        }

        // 处理成功提示
        function handleSuccess() {
            openMessageTipBox({
                type: 'success',
                message: Translate('IDCS_SAVE_DATA_SUCCESS'),
            })
        }

        // 处理错误码提示
        function handleError(errorCode: number) {
            let errorMsg = Translate('IDCS_SAVE_DATA_FAIL')
            if (errorCode === ErrorCode.USER_ERROR_NO_AUTH) {
                errorMsg = Translate('IDCS_NO_PERMISSION')
            }
            openMessageTipBox({
                type: 'info',
                message: errorMsg,
            })
        }

        return {
            pageData,
            changeAllSchedule,
            changeSingleSchedule,
            manageSchedule,
            apply,
        }
    },
})
