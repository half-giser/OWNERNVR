/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-27 09:38:30
 * @Description: 业务应用-停车场管理-车位管理
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-10 14:05:37
 */

import { type PkMgrSpaceManageList } from '@/types/apiType/business'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'

export default defineComponent({
    components: {
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageTipBox } = useMessageBox()

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
            // 默认排程Id
            defaultScheduleId: '{00000000-0000-0000-0000-000000000000}',
            // 排程选项列表
            scheduleList: [] as SelectOption<string, string>[],
            // 排程Id列表
            scheduleIdList: [] as string[],
            // 是否获取数据成功
            mounted: false,
            // 是否可提交
            btnDisabled: true,
            // 显示排程管理弹窗
            isSchedulePop: false,
        })

        const tableData = ref<PkMgrSpaceManageList[]>([])

        /**
         * @description 批量编辑排程
         * @param groupSchedule
         */
        const changeAllSchedule = (groupSchedule: string) => {
            if (groupSchedule === 'scheduleMgr') {
                manageSchedule()
            } else {
                tableData.value.forEach((ele) => {
                    ele.groupSchedule = groupSchedule
                    ele.oldGroupSchedule = groupSchedule
                })
            }
        }

        /**
         * @description 单个编辑排程
         * @param rowData
         */
        const changeSingleSchedule = (rowData: PkMgrSpaceManageList) => {
            if (rowData.groupSchedule === 'scheduleMgr') {
                manageSchedule()
                rowData.groupSchedule = rowData.oldGroupSchedule
            } else {
                rowData.oldGroupSchedule = rowData.groupSchedule
            }
        }

        /**
         * @description 打开排程管理弹窗
         */
        const manageSchedule = () => {
            pageData.value.isSchedulePop = true
        }

        /**
         * @description 修改并关闭排程管理弹窗
         */
        const confirmManageSchedule = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            tableData.value.forEach((item) => {
                item.groupSchedule = pageData.value.scheduleIdList.indexOf(item.groupSchedule) > -1 ? item.groupSchedule : pageData.value.defaultScheduleId
                item.oldGroupSchedule = item.groupSchedule
            })
        }

        /**
         * @description 获取数据-更新排程列表
         */
        const getScheduleList = async () => {
            openLoading()

            const result = await queryScheduleList()
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                pageData.value.scheduleList = $('//content/item').map((item) => {
                    return {
                        value: item.attr('id')!,
                        label: item.text(),
                    }
                })
                pageData.value.scheduleList.push({
                    value: '{00000000-0000-0000-0000-000000000000}',
                    label: `<${Translate('IDCS_NULL')}>`,
                })
                pageData.value.scheduleList.push({
                    value: 'scheduleMgr',
                    label: Translate('IDCS_SCHEDULE_MANAGE'),
                })
                pageData.value.scheduleIdList = pageData.value.scheduleList.map((item) => item.value)
            }
        }

        /**
         * @description 获取数据-更新页面初始数据
         */
        const getData = async () => {
            openLoading()
            const result = await queryParkingLotConfig()
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                pageData.value.totalNum = Number($('//content/basicInfo/totalVehicleNum').text())
                pageData.value.remainTotalNum = Number($('//content/basicInfo/remainSpaceNum').text())
                tableData.value = $('//content/parkingSapce/item').map((item) => {
                    const $item = queryXml(item.element)
                    const groupSchedule = $item('groupSchedule').text()
                    const schedule = pageData.value.scheduleIdList.indexOf(groupSchedule) > -1 ? groupSchedule : pageData.value.defaultScheduleId
                    return {
                        id: item.attr('id')!,
                        groupName: $item('groupName').text(),
                        parkingType: $item('parkingType').text(),
                        groupTotalNum: Number($item('groupTotalNum').text()),
                        groupRemainNum: Number($item('groupRemainNum').text()),
                        groupSchedule: schedule,
                        oldGroupSchedule: schedule,
                        linkEmail: $item('linkEmail').text(),
                    }
                })
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
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_GROUP_TOTAL_VEHICLE_NOT_CONFIG'),
                    })
                    return false
                }
                // 分组剩余车位为空
                if (item.groupRemainNum.toString() === '' && item.parkingType === 'usingGroup') {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_GROUP_REMAIN_VEHICLE_NOT_CONFIG'),
                    })
                    return false
                }
                // 分组剩余车位超过分组总车位
                if (item.groupRemainNum > item.groupTotalNum) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_GROUP_REMAIN_VEHICLE_NUM_OVER_TIPS'),
                    })
                    return false
                }
                // 邮箱格式错误
                if (item.linkEmail && !checkEmail(item.linkEmail)) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_PROMPT_INVALID_EMAIL'),
                    })
                    return false
                }

                // 分组总车位超过总车位
                if (item.groupTotalNum && item.parkingType === 'usingGroup') {
                    groupTotalNum += item.groupTotalNum
                }
                if (groupTotalNum > pageData.value.totalNum) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_ALL_GROUP_VEHICLE_NUM_OVER_TIPS'),
                    })
                    return false
                }

                // 剩余总车位之和超过剩余总车位
                if (item.groupRemainNum && item.parkingType === 'usingGroup') {
                    groupRemainTotalNum += item.groupRemainNum
                }
                if (groupRemainTotalNum > pageData.value.remainTotalNum) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_GROUP_TOTAL_REMAIN_SPACE_OVER_TIPS'),
                    })
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

            const tableXml = tableData.value
                .map((item) => {
                    return rawXml`
                        <item id="${item.id}">
                            <groupName>${item.groupName}</groupName>
                            <parkingType>${item.parkingType}</parkingType>
                            <groupTotalNum>${item.groupTotalNum.toString()}</groupTotalNum>
                            <groupRemainNum>${item.groupRemainNum.toString()}</groupRemainNum>
                            <groupSchedule>${item.groupSchedule}</groupSchedule>
                            <linkEmail>${wrapCDATA(item.linkEmail)}</linkEmail>
                        </item>`
                })
                .join('')

            const sendXml = rawXml`
                <content>
                    <parkingSapce>${tableXml}</parkingSapce>
                </content>
            `
            openLoading()

            const result = await editParkingLotConfig(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                openMessageTipBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
                pageData.value.btnDisabled = true
            } else {
                const errorCode = Number($('//errorCode').text())
                let errorMsg = Translate('IDCS_SAVE_DATA_FAIL')
                if (errorCode === ErrorCode.USER_ERROR_NO_AUTH) {
                    errorMsg = Translate('IDCS_NO_PERMISSION')
                }
                openMessageTipBox({
                    type: 'info',
                    message: errorMsg,
                })
            }
        }

        onMounted(async () => {
            await getScheduleList()
            await getData()
            nextTick(() => {
                pageData.value.mounted = true
            })
        })

        watch(
            tableData,
            () => {
                if (pageData.value.mounted) {
                    pageData.value.btnDisabled = false
                }
            },
            {
                deep: true,
            },
        )

        return {
            pageData,
            tableData,
            changeAllSchedule,
            changeSingleSchedule,
            apply,
            confirmManageSchedule,
            ScheduleManagPop,
        }
    },
})
