/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-10 16:49:52
 * @Description: 业务应用-停车场管理-基础配置
 */

import { type FormRules, type FormInstance } from 'element-plus'
import { getXmlWrapData } from '@/api/api'
import { PkMgrBasicConfigPageData } from '@/types/apiType/business'
import { queryParkingLotConfig, editParkingLotConfig } from '@/api/business'
import { queryXml } from '@/utils/xmlParse'
import { useLangStore } from '@/stores/lang'
import useLoading from '@/hooks/useLoading'
import useMessageBox from '@/hooks/useMessageBox'

export default defineComponent({
    setup() {
        // 多语言翻译方法
        const { Translate } = useLangStore()
        // 页面Loading
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        // 提示弹框
        const { openMessageTipBox } = useMessageBox()

        // 页面初始数据
        const pageData = reactive<PkMgrBasicConfigPageData>(new PkMgrBasicConfigPageData())
        let originalPageData = new PkMgrBasicConfigPageData()
        let changeDataFlg = false

        // 获取数据-更新页面初始数据
        function getPageData() {
            openLoading(LoadingTarget.FullScreen)
            queryParkingLotConfig().then((result: any) => {
                closeLoading(LoadingTarget.FullScreen)
                const resultXml = queryXml(result)
                if (resultXml('status').text() === 'success') {
                    pageData.parkName = resultXml('//content/basicInfo/name').text()
                    pageData.totalNum = Number(resultXml('//content/basicInfo/totalVehicleNum').text())
                    pageData.remainTotalNum = Number(resultXml('//content/basicInfo/remainSpaceNum').text())
                    const parkingSapceNodes = resultXml('//content/parkingSapce/item')
                    for (let i = 0; i < parkingSapceNodes.length; i++) {
                        const eleXml = queryXml(parkingSapceNodes[i].element)
                        pageData.groupTotalNum += Number(eleXml('groupTotalNum').text())
                        pageData.groupRemainTotalNum += Number(eleXml('groupRemainNum').text())
                    }
                    // 备份原始数据
                    originalPageData = JSON.parse(JSON.stringify(pageData))
                }
            })
        }

        // 查询-发起请求
        getPageData()

        // 校验数据合法性
        const pkMgrFormRef = ref<FormInstance>()
        const rules = reactive<FormRules>({
            parkName: [{ required: true, message: Translate('IDCS_PARKING_LOT_NAME_EMPTY_TIPS'), trigger: 'blur' }],
            totalNum: [{ required: true, validator: validateTotalNum, trigger: 'manual' }],
            remainTotalNum: [{ required: true, validator: validateRemainTotalNum, trigger: 'manual' }],
        })
        function validateTotalNum(_rule: any, _value: any, callback: any) {
            if (!pageData.totalNum) {
                callback(new Error(Translate('IDCS_TOTAL_VEHICLE_NOT_CONFIG')))
                return
            }
            if (pageData.groupTotalNum > pageData.totalNum) {
                callback(new Error(Translate('IDCS_TOTAL_VEHICLE_SPACE_LESS_TIPS')))
                return
            }
            callback()
        }
        function validateRemainTotalNum(_rule: any, _value: any, callback: any) {
            if (pageData.remainTotalNum > pageData.totalNum) {
                callback(new Error(Translate('IDCS_REMAIN_VEHICLE_NUM_OVER_TIPS')))
                return
            }
            if (pageData.groupRemainTotalNum > pageData.remainTotalNum) {
                callback(new Error(Translate('IDCS_REMAIN_VEHICLE_SPACE_LESS_TIPS')))
                return
            }
            callback()
        }
        // 校验数据是否被修改
        function compareDataChange(pageData: PkMgrBasicConfigPageData, originalPageData: PkMgrBasicConfigPageData) {
            changeDataFlg = false
            if (pageData.parkName !== originalPageData.parkName || pageData.totalNum !== originalPageData.totalNum || pageData.remainTotalNum !== originalPageData.remainTotalNum) {
                changeDataFlg = true
            }
        }

        // 编辑-下发编辑协议
        function apply(formRef: FormInstance | undefined) {
            if (!formRef) return
            compareDataChange(pageData, originalPageData)
            formRef.validate((valid) => {
                if (valid && changeDataFlg) {
                    const data = getXmlWrapData(
                        `<content>
                            <basicInfo>
                                <name><![CDATA[${pageData.parkName}]]></name>
                                <totalVehicleNum>${pageData.totalNum}</totalVehicleNum>
                                <remainSpaceNum>${pageData.remainTotalNum}</remainSpaceNum>
                            </basicInfo>
                        </content>`,
                    )
                    openLoading(LoadingTarget.FullScreen)
                    editParkingLotConfig(data).then((result: any) => {
                        closeLoading(LoadingTarget.FullScreen)
                        // 更新原始数据
                        originalPageData = JSON.parse(JSON.stringify(pageData))
                        const resultXml = queryXml(result)
                        if (resultXml('status').text() === 'success') {
                            handleSuccess()
                        } else {
                            const errorCode = resultXml('errorCode').text()
                            handleError(errorCode)
                        }
                    })
                }
            })
        }

        // 处理成功提示
        function handleSuccess() {
            openMessageTipBox({
                type: 'success',
                title: Translate('IDCS_SUCCESS_TIP'),
                message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                showCancelButton: false,
            }).catch(() => {})
        }
        // 处理错误码提示
        function handleError(errorCode: string) {
            let errorMsg = Translate('IDCS_SAVE_DATA_FAIL')
            if (errorCode === '536870943') {
                errorMsg = Translate('IDCS_FTP_ERROR_INVALID_PARAM')
            } else if (errorCode === '536870953') {
                errorMsg = Translate('IDCS_NO_PERMISSION')
            }
            openMessageTipBox({
                type: 'info',
                title: Translate('IDCS_INFO_TIP'),
                message: errorMsg,
                showCancelButton: false,
            }).catch(() => {})
        }

        return {
            pageData,
            pkMgrFormRef,
            rules,
            apply,
        }
    },
})
