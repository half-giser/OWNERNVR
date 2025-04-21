/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-27 09:38:30
 * @Description: 业务应用-停车场管理-车位管理
 */
export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        const pageData = ref({
            // 停车选项列表
            parkingTypeList: [
                {
                    value: 'notPermit',
                    label: Translate('IDCS_NOT_PERMIT_PARKING'),
                },
                {
                    value: 'usingGroup',
                    label: Translate('IDCS_USING_GROUP_PARKING'),
                },
                {
                    value: 'usingTotalNum',
                    label: Translate('IDCS_USING_TOTAL_NUM_PARKING'),
                },
            ],
            // 总车位
            totalNum: 0,
            // 剩余总车位
            remainTotalNum: 0,
            // 排程选项列表
            scheduleList: [] as SelectOption<string, string>[],
            // 显示排程管理弹窗
            isSchedulePop: false,
        })

        const tableData = ref<BusinessParkSpaceManageList[]>([])
        const watchEdit = useWatchEditData(tableData)

        /**
         * @description 批量编辑排程
         * @param groupSchedule
         */
        const changeAllSchedule = (groupSchedule: string) => {
            tableData.value.forEach((ele) => {
                ele.groupSchedule = groupSchedule
            })
        }

        /**
         * @description 打开排程管理弹窗
         */
        const openSchedulePop = () => {
            pageData.value.isSchedulePop = true
        }

        /**
         * @description 修改并关闭排程管理弹窗
         */
        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            tableData.value.forEach((item) => {
                item.groupSchedule = getScheduleId(pageData.value.scheduleList, item.groupSchedule)
            })
        }

        /**
         * @description 获取数据-更新排程列表
         */
        const getScheduleList = async () => {
            openLoading()

            pageData.value.scheduleList = await buildScheduleList()

            closeLoading()
        }

        /**
         * @description 获取数据-更新页面初始数据
         */
        const getData = async () => {
            openLoading()

            const result = await queryParkingLotConfig()
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                pageData.value.totalNum = $('content/basicInfo/totalVehicleNum').text().num()
                pageData.value.remainTotalNum = $('content/basicInfo/remainSpaceNum').text().num()
                tableData.value = $('content/parkingSapce/item').map((item) => {
                    const $item = queryXml(item.element)
                    const schedule = getScheduleId(pageData.value.scheduleList, $item('groupSchedule').text())
                    return {
                        id: item.attr('id'),
                        groupName: $item('groupName').text(),
                        parkingType: $item('parkingType').text(),
                        groupTotalNum: $item('groupTotalNum').text().num(),
                        groupRemainNum: $item('groupRemainNum').text().num(),
                        groupSchedule: schedule,
                        linkEmail: $item('linkEmail').text(),
                    }
                })
                watchEdit.listen()
            }
        }

        /**
         * @description 校验数据合法性
         * @returns {boolean}
         */
        const validateData = () => {
            let groupTotalNum = 0 // 分组总车位数之和
            let groupRemainTotalNum = 0 // 分组剩余总车位数之和

            return tableData.value.every((item) => {
                // 分组总车位为空
                if (item.groupTotalNum.toString() === '' && item.parkingType === 'usingGroup') {
                    openMessageBox(Translate('IDCS_GROUP_TOTAL_VEHICLE_NOT_CONFIG'))
                    return false
                }

                // 分组剩余车位为空
                if (item.groupRemainNum.toString() === '' && item.parkingType === 'usingGroup') {
                    openMessageBox(Translate('IDCS_GROUP_REMAIN_VEHICLE_NOT_CONFIG'))
                    return false
                }

                // 分组剩余车位超过分组总车位
                if (item.groupRemainNum > item.groupTotalNum) {
                    openMessageBox(Translate('IDCS_GROUP_REMAIN_VEHICLE_NUM_OVER_TIPS'))
                    return false
                }

                // 邮箱格式错误
                if (item.linkEmail && !checkEmail(item.linkEmail)) {
                    openMessageBox(Translate('IDCS_PROMPT_INVALID_EMAIL'))
                    return false
                }

                // 分组总车位超过总车位
                if (item.groupTotalNum && item.parkingType === 'usingGroup') {
                    groupTotalNum += item.groupTotalNum
                }

                if (groupTotalNum > pageData.value.totalNum) {
                    openMessageBox(Translate('IDCS_ALL_GROUP_VEHICLE_NUM_OVER_TIPS'))
                    return false
                }

                // 剩余总车位之和超过剩余总车位
                if (item.groupRemainNum && item.parkingType === 'usingGroup') {
                    groupRemainTotalNum += item.groupRemainNum
                }

                if (groupRemainTotalNum > pageData.value.remainTotalNum) {
                    openMessageBox(Translate('IDCS_GROUP_TOTAL_REMAIN_SPACE_OVER_TIPS'))
                    return false
                }

                return true
            })
        }

        /**
         * @description 编辑-下发编辑协议
         */
        const apply = async () => {
            if (!validateData()) return

            const sendXml = rawXml`
                <content>
                    <parkingSapce>
                        ${tableData.value
                            .map((item) => {
                                return rawXml`
                                    <item id="${item.id}">
                                        <groupName>${item.groupName}</groupName>
                                        <parkingType>${item.parkingType}</parkingType>
                                        <groupTotalNum>${item.groupTotalNum}</groupTotalNum>
                                        <groupRemainNum>${item.groupRemainNum}</groupRemainNum>
                                        <groupSchedule>${item.groupSchedule}</groupSchedule>
                                        <linkEmail>${wrapCDATA(item.linkEmail)}</linkEmail>
                                    </item>`
                            })
                            .join('')}
                    </parkingSapce>
                </content>
            `
            openLoading()

            const result = await editParkingLotConfig(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
                watchEdit.update()
            } else {
                const errorCode = $('errorCode').text().num()
                let errorMsg = Translate('IDCS_SAVE_DATA_FAIL')
                if (errorCode === ErrorCode.USER_ERROR_NO_AUTH) {
                    errorMsg = Translate('IDCS_NO_PERMISSION')
                }
                openMessageBox(errorMsg)
            }
        }

        onActivated(async () => {
            await getScheduleList()
            getData()
        })

        return {
            pageData,
            tableData,
            watchEdit,
            changeAllSchedule,
            apply,
            openSchedulePop,
            closeSchedulePop,
        }
    },
})
