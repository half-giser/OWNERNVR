/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-05-09 16:45:59
 * @Description: 服务端能力集全局存储
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-25 16:40:40
 */
import { getXmlWrapData } from '@/api/api'
import { querySystemCaps } from '@/api/system'
import { queryXml } from '@/utils/xmlParse'

export const useCababilityStore = defineStore(
    'cabability',
    () => {
        const IntelAndFaceConfigHide = ref(false)
        const supportFaceMatch = ref(false)
        const supportPlateMatch = ref(false)
        const showAIReourceDetail = ref(false)
        const localTargetDectMaxCount = ref(0)
        const localFaceDectMaxCount = ref(0)
        const faceMatchLimitMaxChlNum = ref(0)
        const supportRaid = ref(false)
        const chlMaxCount = ref(0)
        const previewMaxWinForOutputSetting = ref(0)
        const previewMaxWin = ref(0)
        const sub1OutputMaxWin = ref(0)
        const sub2OutputMaxWin = ref(0)
        const sub3OutputMaxWin = ref(0)
        const outputScreensCount = ref(0)
        const supportBootWorkMode = ref(false)
        const supportModifyPoeMode = ref(false)
        const supportAlarmAudioConfig = ref(false)
        const RecordSubResAdaptive = ref(false)
        const supportParkingLotLEDVisible = ref(false)
        const devSystemType = ref(0)
        const supportRecDelete = ref(false)
        const supportANR = ref(false)
        const showNatAccessType = ref(false)
        const showNatVisitAddress = ref(false)
        const showNatServerAddress = ref(false)
        const showCloudUpgrade = ref(false)
        const supportPOS = ref(false)
        const supportsIPCActivation = ref(false)
        const analogChlCount = ref(0)
        const ipChlMaxCount = ref(0)
        const supportPwdSecurityConfig = ref(false)
        const switchableIpChlMaxCount = ref(0)
        const supportLite = ref(false)
        const supportZeroOprAdd = ref(false)
        const supportHdmiVgaSeparate = ref(false)
        const supportSHDB = ref(false)
        const supportAlarmServerConfig = ref(false)
        const poeChlMaxCount = ref(0)
        const supportOriginalDisplay = ref(false)
        const supportImageRotate = ref(false)
        const showVideoLossMessage = ref(false)
        const audioInNum = ref(0)
        const supportPtzGroupAndTrace = ref(false)
        const supportTalk = ref(false)
        const fishEyeCap = ref<Record<string, string[]>>({})

        const CustomerID = ref(0)
        const isInw48 = ref(false)

        const isUseRaid = ref(false)

        /**
         * @description: 获取系统能力集，存入sessionStorage
         * @return {*}
         */
        const updateCabability = async () => {
            const data = getXmlWrapData('')
            const result = await querySystemCaps(data)
            const $ = queryXml(result)

            IntelAndFaceConfigHide.value = $(`content/IntelAndFaceConfigHide`).text().toBoolean()
            supportFaceMatch.value = $(`content/supportFaceMatch`).text().toBoolean() // 人脸识别：最初只有supportFaceMatch这一个字段来代表‘人脸侦测和人脸识别’的能力集。
            supportPlateMatch.value = $(`content/supportPlateMatch`).text().toBoolean()
            showAIReourceDetail.value = $(`content/showAIReourceDetail`).text().toBoolean()
            localTargetDectMaxCount.value = Number($(`content/localTargetDectMaxCount`).text())
            localFaceDectMaxCount.value = Number($(`content/localFaceDectMaxCount`).text())
            faceMatchLimitMaxChlNum.value = Number($(`content/faceMatchLimitMaxChlNum`).text())
            supportRaid.value = $(`content/supportRaid`).text().toBoolean()
            chlMaxCount.value = Number($(`content/chlMaxCount`).text())
            previewMaxWinForOutputSetting.value = Number($(`content/previewMaxWin`).text()) // NT2-3582：主/辅输出配置web端与设备端保持一致
            previewMaxWin.value = Number($(`content/previewMaxWin`).text())
            previewMaxWin.value = previewMaxWin.value > 36 ? 36 : previewMaxWin.value // 最多支持36路 NT2-825

            sub1OutputMaxWin.value = Number($(`content/subOutputMaxWin`).text())
            sub2OutputMaxWin.value = Number($(`content/sub2OutputMaxWin`).text())
            sub3OutputMaxWin.value = Number($(`content/sub3OutputMaxWin`).text())
            outputScreensCount.value = $(`content/outputScreens/item`).length // 1：主输出；2:主输出/辅输出
            supportBootWorkMode.value = $(`content/supportBootWorkMode`).text().toBoolean()
            supportModifyPoeMode.value = $(`content/supportModifyPoeMode`).text().toBoolean()
            supportAlarmAudioConfig.value = $(`content/supportAlarmAudioConfig`).text().toBoolean()
            RecordSubResAdaptive.value = $(`content/RecordSubResAdaptive`).text().toBoolean()
            supportParkingLotLEDVisible.value = $(`content/supportParkingLotLEDVisible`).text().toBoolean()
            devSystemType.value = Number($(`content/devSystemType`).text())
            supportRecDelete.value = $(`content/supportRecDelete`).text().toBoolean() // 是否支持录像删除
            supportANR.value = $(`content/supportANR`).text().toBoolean() // 断网补录
            showNatAccessType.value = $(`content/showNatAccessType`).text().toBoolean()
            showNatVisitAddress.value = $(`content/showNatVisitAddress`).text().toBoolean()
            showNatServerAddress.value = $(`content/showNatServerAddress`).text().toBoolean()
            showCloudUpgrade.value = $(`content/showCloudUpgrade`).text().toBoolean()
            supportPOS.value = $(`content/supportPOS`).text().toBoolean()
            supportsIPCActivation.value = $(`content/supportsIPCActivation`).text().toBoolean() // TSSR-18907 去除IPC激活功能
            supportPwdSecurityConfig.value = $(`content/supportPwdSecurityConfig`).text().toBoolean()
            supportLite.value = $(`content/supportLite`).text().toBoolean()
            supportZeroOprAdd.value = $(`content/supportZeroOprAdd`).text().toBoolean()
            supportHdmiVgaSeparate.value = $(`content/supportHdmiVgaSeparate`).text().toBoolean() // 是否支持VGA异源输出
            supportOriginalDisplay.value = $('content/supportOriginalDisplay').text().toBoolean()
            supportImageRotate.value = $('content/supportImageRotate').text().toBoolean()
            showVideoLossMessage.value = $('content/showVideoLossMessage').text().toBoolean()
            audioInNum.value = Number($('content/audioInNum').text())
            supportPtzGroupAndTrace.value = $('content/supportPtzGroupAndTrace').text().toBoolean()
            supportTalk.value = $('content/supportTalk').text().toBoolean()
            analogChlCount.value = Number($(`content/analogChlCount`).text())
            ipChlMaxCount.value = Number($(`content/ipChlMaxCount`).text())
            switchableIpChlMaxCount.value = Number($(`content/switchableIpChlMaxCount`).text())
            supportSHDB.value = $(`content/supportSHDB`).text().toBoolean()
            supportAlarmServerConfig.value = $('content/supportAlarmServerConfig').text().toBoolean()
            poeChlMaxCount.value = Number($(`content/poeChlMaxCount`).text())

            $('content/FishEyeCaps/installType/enum').forEach((item) => {
                const text = item.text()
                fishEyeCap.value[text] = $(`content/FishEyeCaps/fishEyeMode/group[contains(@installType,'${text}')]/enum`).map((chl) => chl.text())
            })

            return $
        }

        return {
            IntelAndFaceConfigHide,
            supportFaceMatch,
            supportPlateMatch,
            showAIReourceDetail,
            localTargetDectMaxCount,
            localFaceDectMaxCount,
            faceMatchLimitMaxChlNum,
            supportRaid,
            chlMaxCount,
            previewMaxWinForOutputSetting,
            previewMaxWin,
            sub1OutputMaxWin,
            sub2OutputMaxWin,
            sub3OutputMaxWin,
            outputScreensCount,
            supportBootWorkMode,
            supportModifyPoeMode,
            supportAlarmAudioConfig,
            RecordSubResAdaptive,
            supportParkingLotLEDVisible,
            devSystemType,
            supportRecDelete,
            supportANR,
            showNatAccessType,
            showNatVisitAddress,
            showNatServerAddress,
            showCloudUpgrade,
            supportPOS,
            supportsIPCActivation,
            supportPwdSecurityConfig,
            analogChlCount,
            ipChlMaxCount,
            isInw48,
            supportLite,
            switchableIpChlMaxCount,
            supportZeroOprAdd,
            supportHdmiVgaSeparate,
            supportSHDB,
            supportAlarmServerConfig,
            updateCabability,
            CustomerID,
            isUseRaid,
            poeChlMaxCount,
            supportOriginalDisplay,
            supportImageRotate,
            showVideoLossMessage,
            audioInNum,
            supportPtzGroupAndTrace,
            supportTalk,
            fishEyeCap,
        }
    },
    {
        persist: true,
    },
)
