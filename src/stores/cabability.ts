/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-05-09 16:45:59
 * @Description: 服务端能力集全局存储
 */
export const useCababilityStore = defineStore(
    'cabability',
    () => {
        const IntelAndFaceConfigHide = ref(false)
        const supportFaceMatch = ref(false)
        const supportPlateMatch = ref(false)
        const supportWaterMark = ref(false)
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
        const supportFTP = ref(false)
        const showVideoLossMessage = ref(false)
        const audioInNum = ref(0)
        const supportPtzGroupAndTrace = ref(false)
        const supportTalk = ref(false)
        const fishEyeCap = ref<Record<string, string[]>>({})
        const playbackMaxWin = ref(9)
        const showNat = ref(false)
        const supportHttpsConfig = ref(false)
        const supportSnmp = ref(false)
        const supportPlatform = ref(false)
        const supportPoePowerManage = ref(false)
        const supportLogoSetting = ref(false)
        const supportFishEye = ref(false)
        const chlSupSignalType = ref<string[]>([])
        const switchIpChlRange = ref<number[]>([])

        const CustomerID = ref(0)
        const AISwitch = ref<boolean | undefined>()
        const productModel = ref('')

        const isUseRaid = ref(false)

        /**
         * @description: 获取系统能力集，存入sessionStorage
         * @return {*}
         */
        const updateCabability = async () => {
            const result = await querySystemCaps()
            const $ = queryXml(result)

            IntelAndFaceConfigHide.value = $(`content/IntelAndFaceConfigHide`).text().bool()
            supportFaceMatch.value = $(`content/supportFaceMatch`).text().bool() // 人脸识别：最初只有supportFaceMatch这一个字段来代表‘人脸侦测和人脸识别’的能力集。
            supportPlateMatch.value = $(`content/supportPlateMatch`).text().bool()
            supportWaterMark.value = $(`content/supportWaterMark`).text().bool()
            showAIReourceDetail.value = $(`content/showAIReourceDetail`).text().bool()
            localTargetDectMaxCount.value = $(`content/localTargetDectMaxCount`).text().num()
            localFaceDectMaxCount.value = $(`content/localFaceDectMaxCount`).text().num()
            faceMatchLimitMaxChlNum.value = $(`content/faceMatchLimitMaxChlNum`).text().num()
            supportRaid.value = $(`content/supportRaid`).text().bool()
            chlMaxCount.value = $(`content/chlMaxCount`).text().num()
            previewMaxWinForOutputSetting.value = $(`content/previewMaxWin`).text().num() // NT2-3582：主/辅输出配置web端与设备端保持一致
            previewMaxWin.value = $(`content/previewMaxWin`).text().num()
            previewMaxWin.value = previewMaxWin.value > 36 ? 36 : previewMaxWin.value // 最多支持36路 NT2-825

            sub1OutputMaxWin.value = $(`content/subOutputMaxWin`).text().num()
            sub2OutputMaxWin.value = $(`content/sub2OutputMaxWin`).text().num()
            sub3OutputMaxWin.value = $(`content/sub3OutputMaxWin`).text().num()
            outputScreensCount.value = $(`content/outputScreens/item`).length // 1：主输出；2:主输出/辅输出
            supportBootWorkMode.value = $(`content/supportBootWorkMode`).text().bool()
            supportModifyPoeMode.value = $(`content/supportModifyPoeMode`).text().bool()
            supportAlarmAudioConfig.value = $(`content/supportAlarmAudioConfig`).text().bool()
            RecordSubResAdaptive.value = $(`content/RecordSubResAdaptive`).text().bool()
            supportParkingLotLEDVisible.value = $(`content/supportParkingLotLEDVisible`).text().bool()
            devSystemType.value = $(`content/devSystemType`).text().num()
            supportRecDelete.value = $(`content/supportRecDelete`).text().bool() // 是否支持录像删除
            supportANR.value = $(`content/supportANR`).text().bool() // 断网补录
            showNatAccessType.value = $(`content/showNatAccessType`).text().bool()
            showNatVisitAddress.value = $(`content/showNatVisitAddress`).text().bool()
            showNatServerAddress.value = $(`content/showNatServerAddress`).text().bool()
            showCloudUpgrade.value = $(`content/showCloudUpgrade`).text().bool()
            supportPOS.value = $(`content/supportPOS`).text().bool()
            supportsIPCActivation.value = $(`content/supportsIPCActivation`).text().bool() // TSSR-18907 去除IPC激活功能
            supportPwdSecurityConfig.value = $(`content/supportPwdSecurityConfig`).text().bool()
            supportLite.value = $(`content/supportLite`).text().bool()
            supportZeroOprAdd.value = $(`content/supportZeroOprAdd`).text().bool()
            supportHdmiVgaSeparate.value = $(`content/supportHdmiVgaSeparate`).text().bool() // 是否支持VGA异源输出
            supportOriginalDisplay.value = $('content/supportOriginalDisplay').text().bool()
            supportImageRotate.value = $('content/supportImageRotate').text().bool()
            supportFTP.value = $('content/supportFTP').text().bool()
            showVideoLossMessage.value = $('content/showVideoLossMessage').text().bool()
            audioInNum.value = $('content/audioInNum').text().num()
            supportPtzGroupAndTrace.value = $('content/supportPtzGroupAndTrace').text().bool()
            supportTalk.value = $('content/supportTalk').text().bool()
            analogChlCount.value = $(`content/analogChlCount`).text().num()
            ipChlMaxCount.value = $(`content/ipChlMaxCount`).text().num()
            switchableIpChlMaxCount.value = $(`content/switchableIpChlMaxCount`).text().num()
            supportSHDB.value = $(`content/supportSHDB`).text().bool()
            supportAlarmServerConfig.value = $('content/supportAlarmServerConfig').text().bool()
            poeChlMaxCount.value = $(`content/poeChlMaxCount`).text().num()
            playbackMaxWin.value = $('content/playbackMaxWin').text().num()
            showNat.value = $(`content/showNat`).text().bool()
            supportHttpsConfig.value = $(`content/supportHttpsConfig`).text().bool()
            supportSnmp.value = $(`content/supportSnmp`).text().bool()
            supportPlatform.value = $(`content/supportPlatform`).text().bool()
            supportPoePowerManage.value = $(`content/supportPoePowerManage`).text().bool()
            supportLogoSetting.value = $(`content/supportLogoSetting`).text().bool()
            supportFishEye.value = $(`content/supportFishEye`).text().bool()

            chlSupSignalType.value = $('content/chlSupSignalType').text().split(':')
            switchIpChlRange.value.push($('content/switchIpChlRange/start').text().num())
            switchIpChlRange.value.push($('content/switchIpChlRange/end').text().num())

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
            supportFTP,
            showVideoLossMessage,
            audioInNum,
            supportPtzGroupAndTrace,
            supportTalk,
            fishEyeCap,
            playbackMaxWin,
            AISwitch,
            supportWaterMark,
            showNat,
            supportHttpsConfig,
            supportSnmp,
            supportPlatform,
            supportPoePowerManage,
            supportLogoSetting,
            supportFishEye,
            chlSupSignalType,
            switchIpChlRange,
            productModel,
        }
    },
    {
        persist: true,
    },
)
