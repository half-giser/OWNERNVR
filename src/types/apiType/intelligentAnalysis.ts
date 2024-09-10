/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-29 09:13:28
 * @Description: 智能分析
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-09 16:26:50
 */

export class EngineConfigForm {
    supportAI = false
}

export class EngineConfigList {
    name = ''
    eventType = ''
}

export class IntelFaceDBGroupDto {
    id = ''
    name = ''
    groupId = ''
}

export class IntelFaceDBGroupList extends IntelFaceDBGroupDto {
    property = ''
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

export class IntelFaceDBSnapRegisterForm {
    name = ''
    sex = ''
    birthday = ''
    nativePlace = ''
    certificateType = 'idCard'
    certificateNum = ''
    mobile = undefined as number | undefined
    number = undefined as number | undefined
    note = ''
    groupId = ''
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

export class IntelPlateDBAddPlateForm {
    plateNumber = ''
    groupId = ''
    owner = ''
    ownerPhone = ''
    vehicleType = ''
}

export class IntelPersonStatsChlList {
    chlId = ''
    imageNum = 0
    personIn = 0
    personOut = 0
}

// export class IntelPersonStatsGroupList {
//     groupId = ''
//     name = ''
//     imageNum = 0
// }

export class IntelPersonStatsList {
    imageTotalNum = 0
    imageTotalInNum = 0
    imageTotalOutNum = 0
    chl = [] as IntelPersonStatsChlList[]
    // groups = [] as IntelPersonStatsGroupList[]
}

export class IntelPersonStatsForm {
    chl = [] as string[]
    event = [] as string[]
    dateRange = [0, 0] as [number, number]
}

export class IntelVehicleStatsChlList {
    chlId = ''
    imageNum = 0
    vehicleIn = 0
    vehicleOut = 0
    nonVehicleIn = 0
    nonVehicleOut = 0
}

export class IntelVehicleStatsList {
    imageTotalNum = 0
    imageTotalInNum = 0
    imageTotalOutNum = 0
    chl = [] as IntelVehicleStatsChlList[]
}

export class IntelVehicleStatsForm {
    chl = [] as string[]
    event = [] as string[]
    dateRange = [0, 0] as [number, number]
    attribute = [] as string[]
    deduplicate = false
}

export class IntelCombineStatsChlList {
    chlId = ''
    imageNum = 0
    personIn = 0
    personOut = 0
    vehicleIn = 0
    vehicleOut = 0
    nonVehicleIn = 0
    nonVehicleOut = 0
}

export class IntelCombineStatsList {
    imageTotalNum = 0
    imageTotalInNum = 0
    imageTotalOutNum = 0
    chl = [] as IntelCombineStatsChlList[]
}

export class IntelCombineStatsForm {
    chl = [] as string[]
    event = [] as string[]
    dateRange = [0, 0] as [number, number]
    vehicleAttribute = [] as string[]
    personAttribute = [] as string[]
    deduplicate = false
}

export class IntelSearchCollectList {
    name = '' as string
    dateRange = [0, 0] as [number, number]
    chl = [] as string[]
    event = [] as string[]
    attribute = [] as [string[], string[]][] // ['车辆选项', '人脸选项']
    profile = {} as Record<string, Record<string, number[]>>
    direction = [] as number[]
}

export class IntelSnapImgDto {
    pic = ''
    panorama = ''
    eventType = ''
    targetType = ''
    width = 1
    height = 1
    X1 = 0
    Y1 = 0
    X2 = 0
    Y2 = 0
}

export class IntelSearchBodyList extends IntelSnapImgDto {
    isDelSnap = false
    imgId = ''
    timestamp = 0
    timeNS = ''
    guid = 0
    chlId = ''
    chlName = ''
    recStartTime = 0
    recEndTime = 0
    pathGUID = ''
    sectionNo = 0
    fileIndex = 0
    bolckNo = 0
    offset = 0
    eventTypeID = 0
}
