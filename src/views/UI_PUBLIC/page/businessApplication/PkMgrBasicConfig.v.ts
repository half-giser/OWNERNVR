/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-10 16:49:52
 * @Description: 业务应用-停车场管理-基础配置
 */

import { type FormRules, type FormInstance } from 'element-plus'
import { PkMgrBasicConfigForm } from '@/types/apiType/business'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageBox } = useMessageBox()

        const formData = ref(new PkMgrBasicConfigForm())
        const formRef = ref<FormInstance>()

        const rules = reactive<FormRules>({
            parkName: [
                {
                    required: true,
                    message: Translate('IDCS_PARKING_LOT_NAME_EMPTY_TIPS'),
                    trigger: 'blur',
                },
            ],
            totalNum: [
                {
                    validator: (_rule, value, callback) => {
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
                    validator: (_rule, value, callback) => {
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
                formData.value.parkName = $('//content/basicInfo/name').text()
                formData.value.totalNum = Number($('//content/basicInfo/totalVehicleNum').text())
                formData.value.remainTotalNum = Number($('//content/basicInfo/remainSpaceNum').text())
                $('//content/parkingSapce/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    formData.value.groupTotalNum += Number($item('groupTotalNum').text())
                    formData.value.groupRemainTotalNum += Number($item('groupRemainNum').text())
                })
            }
        }

        /**
         * @description 编辑-下发编辑协议
         */
        const apply = () => {
            formRef.value!.validate(async (valid) => {
                if (valid) {
                    const sendXml = rawXml`
                        <content>
                            <basicInfo>
                                <name>${wrapCDATA(formData.value.parkName)}</name>
                                <totalVehicleNum>${formData.value.totalNum}</totalVehicleNum>
                                <remainSpaceNum>${formData.value.remainTotalNum}</remainSpaceNum>
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
                        const errorCode = Number($('errorCode').text())
                        let errorMsg = Translate('IDCS_SAVE_DATA_FAIL')
                        if (errorCode === ErrorCode.USER_ERROR_INVALID_PARAM) {
                            errorMsg = Translate('IDCS_FTP_ERROR_INVALID_PARAM')
                        } else if (errorCode === ErrorCode.USER_ERROR_NO_AUTH) {
                            errorMsg = Translate('IDCS_NO_PERMISSION')
                        }
                        openMessageBox({
                            type: 'info',
                            message: errorMsg,
                        })
                    }
                }
            })
        }

        onMounted(() => {
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
