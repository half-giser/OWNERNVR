/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-29 09:13:28
 * @Description: 智能分析
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-02 14:54:51
 */

export class EngineConfigForm {
    supportAI = false
}

export class EngineConfigList {
    name = ''
    eventType = ''
}

export class IntelFaceDBGroupList {
    id = ''
    name = ''
    property = ''
    groupId = ''
    enableAlarmSwitch = false
    count = 0
}

export class IntelFaceDBFaceInfo {
    id = ''
    number = ''
    name = ''
    sex = ''
    birthday = ''
    nativePlace = ''
    certificateType = ''
    certificateNum = ''
    mobile = ''
    note = ''
    // createTime = ''
    faceImgCount = 0
    pic = [] as string[]
}

export class IntelFaceDBFaceForm {
    number = undefined as number | undefined
    name = ''
    sex = ''
    birthday = ''
    nativePlace = ''
    certificateType = ''
    certificateNum = ''
    mobile = undefined as number | undefined
    note = ''
    groupId = ''
    pic = ''
    success = false
    error = false
}

export class IntelFaceDBSnapFaceList {
    faceFeatureId = ''
    timestamp = 0
    timeNS = ''
    imgId = 0
    chlId = ''
    chlName = ''
    pic = ''
    featureStatus = false
}

export class IntelFaceDBImportImgDto {
    imgName = ''
    pic = ''
    width = 0
    height = 0
}

export class IntelFaceDBImportFaceDto extends IntelFaceDBImportImgDto {
    number = ''
    name = ''
    sex = ''
    birthday = ''
    // nativePlace = ''
    certificateType = ''
    certificateNum = ''
    mobile = ''
    note = ''
    // groupId = ''
}

export class IntelPlateDBGroupList {
    id = ''
    name = ''
    plateNum = 0
}

export class IntelPlateDBPlateInfo {
    id = ''
    groupId = ''
    plateNumber = ''
    owner = ''
    ownerPhone = ''
    vehicleType = ''
    ownerFaceId = ''
}
