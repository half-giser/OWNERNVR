/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-10 16:49:52
 * @Description: 业务应用-停车场管理-基础配置
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()

        const formData = ref(new BusinessParkBasicConfigForm())
        const formRef = useFormRef()

        const rules = reactive<FormRules>({
            parkName: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PARKING_LOT_NAME_EMPTY_TIPS')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            totalNum: [
                {
                    validator: (_rule, value: number, callback) => {
                        if (!value) {
                            callback(new Error(Translate('IDCS_TOTAL_VEHICLE_NOT_CONFIG')))
                            return
                        }

                        if (formData.value.groupTotalNum > value) {
                            callback(new Error(Translate('IDCS_TOTAL_VEHICLE_SPACE_LESS_TIPS')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            remainTotalNum: [
                {
                    validator: (_rule, value: number, callback) => {
                        if (formData.value.remainTotalNum > value) {
                            callback(new Error(Translate('IDCS_REMAIN_VEHICLE_NUM_OVER_TIPS')))
                            return
                        }

                        if (formData.value.groupRemainTotalNum > value) {
                            callback(new Error(Translate('IDCS_REMAIN_VEHICLE_SPACE_LESS_TIPS')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            startOfVehicle: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (formData.value.autoOpenBarrierSwitch && !value.trim()) {
                            callback(new Error('IDCS_VEHICLE_START_EMPTY_TIPS'))
                            return false
                        }

                        const inputPlateArr = value.split(',')
                        const reg = /[`\s~!@#$%^&*()\-+=<>?:"{}|.\/;\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；'‘’，。、]/g
                        const flag = inputPlateArr.some((item) => reg.test(item))
                        if (flag) {
                            callback(new Error('IDCS_INVALID_CHAR'))
                            return false
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 获取数据-更新页面初始数据
         */
        const getData = async () => {
            openLoading()

            const result = await queryParkingLotConfig()
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                formData.value.parkName = $('content/basicInfo/name').text()
                formData.value.totalNum = $('content/basicInfo/totalVehicleNum').text().num()
                formData.value.remainTotalNum = $('content/basicInfo/remainSpaceNum').text().num()
                formData.value.autoOpenBarrierSwitch = $('content/basicInfo/autoOpenBarrier/switch').text().bool()
                formData.value.startOfVehicle = $('content/basicInfo/autoOpenBarrier/startOfVehicle').text()
                formData.value.remarkSwitch = $('content/basicInfo/remarkSwitch').text().bool()

                $('content/parkingSapce/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    formData.value.groupTotalNum += $item('groupTotalNum').text().num()
                    formData.value.groupRemainTotalNum += $item('groupRemainNum').text().num()
                })
            } else {
                const errorCode = $('errorCode').text().num()
                if (errorCode === ErrorCode.USER_ERROR_NO_AUTH) {
                    openMessageBox(Translate('IDCS_NO_PERMISSION'))
                }
            }
        }

        /**
         * @description 编辑-下发编辑协议
         */
        const apply = () => {
            if (!userSession.hasAuth('businessCfg')) {
                openMessageBox(Translate('IDCS_NO_PERMISSION'))
                return
            }

            formRef.value!.validate(async (valid) => {
                if (valid) {
                    const sendXml = rawXml`
                        <content>
                            <basicInfo>
                                <name>${wrapCDATA(formData.value.parkName)}</name>
                                <totalVehicleNum>${formData.value.totalNum}</totalVehicleNum>
                                <remainSpaceNum>${formData.value.remainTotalNum}</remainSpaceNum>
                                <autoOpenBarrier>
                                    <switch>${formData.value.autoOpenBarrierSwitch}</switch>
                                    <startOfVehicle>${wrapCDATA(formData.value.startOfVehicle)}</startOfVehicle>
                                </autoOpenBarrier>
                                <remarkSwitch>${formData.value.remarkSwitch}</remarkSwitch>
                            </basicInfo>
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
                    } else {
                        const errorCode = $('errorCode').text().num()
                        let errorMsg = Translate('IDCS_SAVE_DATA_FAIL')
                        switch (errorCode) {
                            case ErrorCode.USER_ERROR_INVALID_PARAM:
                                errorMsg = Translate('IDCS_FTP_ERROR_INVALID_PARAM')
                                break
                            case ErrorCode.USER_ERROR_NO_AUTH:
                                errorMsg = Translate('IDCS_NO_PERMISSION')
                                break
                        }
                        openMessageBox(errorMsg)
                    }
                }
            })
        }

        onActivated(() => {
            getData()
        })

        return {
            formData,
            formRef,
            rules,
            apply,
        }
    },
})
