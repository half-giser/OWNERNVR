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
        const mainStreamLimitFps = ref(1)
        const supportRecorder = ref(false)
        const decoderOutputMaxWin = ref<Record<number, number>>({})
        const supportHttpPost = ref(false)
        const supportRS485 = ref(false)
        const supportParkingLot = ref(false) // NSSR32-2 停车场功能显示
        // 是否支持设备基本信息界面展示开源协议
        const showCameraPreviewLock = ref(false)
        const supportPIR = ref(false)
        const switchIpChlRangeStart = ref('')
        const switchIpChlRangeEnd = ref('')
        const newDevice = ref(false)
        const needP2pVersion1 = ref(false)
        const supportHDHealth = ref(false)
        const voiceDevMaxCount = ref(0)
        const supportPlateColor = ref(false)
        const showOpenSourceLicense = ref(false)
        const supportSuperResolution = ref(false)
        const supportREID = ref(false)
        const supportN1 = ref(false)
        const hotStandBy = ref(false)

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
            const $ = queryXml(queryXml(result)('content')[0].element)

            IntelAndFaceConfigHide.value = $('IntelAndFaceConfigHide').text().bool()
            supportFaceMatch.value = $('supportFaceMatch').text().bool() // 人脸识别：最初只有supportFaceMatch这一个字段来代表‘人脸侦测和人脸识别’的能力集。
            supportPlateMatch.value = $('supportPlateMatch').text().bool()
            supportWaterMark.value = $('supportWaterMark').text().bool()
            showAIReourceDetail.value = $('showAIReourceDetail').text().bool()
            localTargetDectMaxCount.value = $('localTargetDectMaxCount').text().num()
            localFaceDectMaxCount.value = $('localFaceDectMaxCount').text().num()
            faceMatchLimitMaxChlNum.value = $('faceMatchLimitMaxChlNum').text().num()
            supportRaid.value = $('supportRaid').text().bool()
            chlMaxCount.value = $('chlMaxCount').text().num()
            previewMaxWinForOutputSetting.value = $('previewMaxWin').text().num() // NT2-3582：主/辅输出配置web端与设备端保持一致
            previewMaxWin.value = $('previewMaxWin').text().num()
            previewMaxWin.value = previewMaxWin.value > 36 ? 36 : previewMaxWin.value // 最多支持36路 NT2-825
            supportRecorder.value = $('supportRecorder').text().bool()

            sub1OutputMaxWin.value = $('subOutputMaxWin').text().num()
            sub2OutputMaxWin.value = $('sub2OutputMaxWin').text().num()
            sub3OutputMaxWin.value = $('sub3OutputMaxWin').text().num()
            $('decoderOutput/item').forEach((item) => {
                const id = item.attr('id').num()
                decoderOutputMaxWin.value[id] = item.text().num()
            })
            outputScreensCount.value = $('outputScreens/item').length // 1：主输出；2:主输出/辅输出
            supportBootWorkMode.value = $('supportBootWorkMode').text().bool()
            supportModifyPoeMode.value = $('supportModifyPoeMode').text().bool()
            supportAlarmAudioConfig.value = $('supportAlarmAudioConfig').text().bool()
            RecordSubResAdaptive.value = $('RecordSubResAdaptive').text().bool()
            supportParkingLotLEDVisible.value = $('supportParkingLotLEDVisible').text().bool()
            devSystemType.value = $('devSystemType').text().num()
            supportRecDelete.value = $('supportRecDelete').text().bool() // 是否支持录像删除
            supportANR.value = $('supportANR').text().bool() // 断网补录
            showNatAccessType.value = $('showNatAccessType').text().bool()
            showNatVisitAddress.value = $('showNatVisitAddress').text().bool()
            showNatServerAddress.value = $('showNatServerAddress').text().bool()
            showCloudUpgrade.value = $('showCloudUpgrade').text().bool()
            supportPOS.value = $('supportPOS').text().bool()
            supportsIPCActivation.value = $('supportsIPCActivation').text().bool() // TSSR-18907 去除IPC激活功能
            supportPwdSecurityConfig.value = $('supportPwdSecurityConfig').text().bool()
            supportLite.value = $('supportLite').text().bool()
            supportZeroOprAdd.value = $('supportZeroOprAdd').text().bool()
            supportHdmiVgaSeparate.value = $('supportHdmiVgaSeparate').text().bool() // 是否支持VGA异源输出
            supportOriginalDisplay.value = $('supportOriginalDisplay').text().bool()
            supportImageRotate.value = $('supportImageRotate').text().bool()
            supportFTP.value = $('supportFTP').text().bool()
            showVideoLossMessage.value = $('showVideoLossMessage').text().bool()
            audioInNum.value = $('audioInNum').text().num()
            supportPtzGroupAndTrace.value = $('supportPtzGroupAndTrace').text().bool()
            supportTalk.value = $('supportTalk').text().bool()
            analogChlCount.value = $('analogChlCount').text().num()
            ipChlMaxCount.value = $('ipChlMaxCount').text().num()
            switchableIpChlMaxCount.value = $('switchableIpChlMaxCount').text().num()
            supportSHDB.value = $('supportSHDB').text().bool()
            supportAlarmServerConfig.value = $('supportAlarmServerConfig').text().bool()
            poeChlMaxCount.value = $('poeChlMaxCount').text().num()
            playbackMaxWin.value = $('playbackMaxWin').text().num()
            showNat.value = $('showNat').text().bool()
            supportHttpsConfig.value = $('supportHttpsConfig').text().bool()
            supportSnmp.value = $('supportSnmp').text().bool()
            supportPlatform.value = $('supportPlatform').text().bool()
            supportPoePowerManage.value = $('supportPoePowerManage').text().bool()
            supportLogoSetting.value = $('supportLogoSetting').text().bool()
            supportFishEye.value = $('supportFishEye').text().bool()
            supportHttpPost.value = $('supportHttpPost').text().bool()
            supportRS485.value = $('supportRS485').text().bool()
            supportParkingLot.value = $('supportParkingLot').text().bool()
            supportPIR.value = $('supportPIR').text().bool()

            chlSupSignalType.value = $('chlSupSignalType').text().split(':')
            switchIpChlRange.value.push($('switchIpChlRange/start').text().num())
            switchIpChlRange.value.push($('switchIpChlRange/end').text().num())
            mainStreamLimitFps.value = $('mainStreamLimitFps').text().num() || 1
            showCameraPreviewLock.value = $('showCameraPreviewLock').text().bool()
            switchIpChlRangeStart.value = $('switchIpChlRange/start').text()
            switchIpChlRangeEnd.value = $('switchIpChlRange/end').text()
            newDevice.value = $('newDevice').text().bool()
            needP2pVersion1.value = $('needP2pVersion1').text().bool()
            supportHDHealth.value = $('supportHDHealth').text().bool()
            voiceDevMaxCount.value = $('voiceDevMaxCount').text().num()
            supportPlateColor.value = $('supportPlateColor').text().bool()
            showOpenSourceLicense.value = $('showOpenSourceLicense').text().bool()
            supportSuperResolution.value = $('supportSuperResolution').text().bool()
            supportREID.value = $('supportREID').text().bool()
            // 是否支持N+1（热备配置）
            supportN1.value = $('supportN1').text().bool()

            $('FishEyeCaps/installType/enum').forEach((item) => {
                const text = item.text()
                fishEyeCap.value[text] = $(`FishEyeCaps/fishEyeMode/group[contains(@installType,'${text}')]/enum`).map((chl) => chl.text())
            })

            return queryXml(result)
        }

        const updateDiskMode = async () => {
            const result = await queryDiskMode()
            const $ = queryXml(result)
            isUseRaid.value = $('content/diskMode/isUseRaid').text().bool()
            return $
        }

        const updateBaseConfig = async () => {
            const result = await queryBasicCfg()
            const $ = queryXml(result)
            CustomerID.value = Number($('content/CustomerID').text())
            AISwitch.value = $('content/AISwitch').text().undef()?.bool()
            productModel.value = $('content/productModel').text()
            return $
        }

        const updateHotStandbyMode = async () => {
            if (supportN1.value) {
                const result = await queryHotStandbyCfg()
                const $ = queryXml(result)
                if ($('content/switch').text().bool()) {
                    hotStandBy.value = $('content/workMode').text() === 'hotStandbyMode'
                } else {
                    hotStandBy.value = false
                }
            } else {
                hotStandBy.value = false
            }
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
            mainStreamLimitFps,
            supportRecorder,
            decoderOutputMaxWin,
            updateBaseConfig,
            updateDiskMode,
            supportHttpPost,
            supportRS485,
            showCameraPreviewLock,
            supportParkingLot,
            supportPIR,
            switchIpChlRangeStart,
            switchIpChlRangeEnd,
            newDevice,
            needP2pVersion1,
            supportHDHealth,
            voiceDevMaxCount,
            supportPlateColor,
            showOpenSourceLicense,
            supportSuperResolution,
            supportREID,
            supportN1,
            updateHotStandbyMode,
            hotStandBy,
        }
    },
    {
        persist: true,
    },
)
