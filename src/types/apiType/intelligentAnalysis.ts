/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-29 09:13:28
 * @Description: 智能分析的类型定义，类型命名的前缀统一为Intel*
 */

/**
 * @description 引擎配置 表单
 */
export class IntelEngineConfigForm {
    supportAI = false
}

/**
 * @description 引擎配置 列表项
 */
export class IntelEngineConfigList {
    name = ''
    eventType = ''
}

/**
 * @description 人脸组选项
 */
export class IntelFaceDBGroupDto {
    id = ''
    name = ''
    groupId = ''
}

/**
 * @description 样本库 - 人脸组列表
 */
export class IntelFaceDBGroupList extends IntelFaceDBGroupDto {
    property = ''
    enableAlarmSwitch = false
    count = 0
}

/**
 * @description 样本库 - 人脸详情
 */
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
    pic: string[] = []
    groupId = ''
}

/**
 * @description 人脸注册表单
 */
export class IntelFaceDBSnapRegisterForm {
    name = ''
    sex = ''
    birthday = ''
    nativePlace = ''
    certificateType = 'idCard'
    certificateNum = ''
    mobile = ''
    number = ''
    note = ''
    groupId = ''
}

/**
 * @description 人脸信息表单
 */
export class IntelFaceDBFaceForm {
    number = ''
    name = ''
    sex = ''
    birthday = ''
    nativePlace = ''
    certificateType = ''
    certificateNum = ''
    mobile = ''
    note = ''
    groupId = ''
    pic = ''
    success = false
    error = false
}

/**
 * @description 人脸抓拍列表
 */
export class IntelFaceDBSnapFaceList {
    faceFeatureId = ''
    timestamp = 0
    frameTime = ''
    imgId = 0
    chlId = ''
    chlName = ''
    pic = ''
    featureStatus = false
}

/**
 * @description 导入人脸图片信息
 */
export class IntelFaceDBImportImgDto {
    imgName = ''
    pic = ''
    width = 0
    height = 0
}

/**
 * @description 导入人脸信息
 */
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

/**
 * @description 车牌组选项
 */
export class IntelPlateDBGroupList {
    id = ''
    name = ''
    plateNum = 0
}

/**
 * @description 车牌信息
 */
export class IntelPlateDBPlateInfo {
    id = ''
    groupId = ''
    plateNumber = ''
    owner = ''
    ownerPhone = ''
    vehicleType = ''
    ownerFaceId = ''
}

/**
 * @description 新增车牌表单
 */
export class IntelPlateDBAddPlateForm {
    plateNumber = ''
    groupId = ''
    owner = ''
    ownerPhone = ''
    vehicleType = ''
}

/**
 * @description 人员统计 - 通道项
 */
export class IntelPersonStatsChlList {
    chlId = ''
    imageNum = 0
    personIn = 0
    personOut = 0
}

/**
 * @description 人员统计 - 人员分组项
 */
export class IntelPersonStatsGroupList {
    groupId = ''
    name = ''
    imageNum = 0
}

/**
 * @description 人员统计 列表项
 */
export class IntelPersonStatsList {
    imageTotalNum = 0
    imageTotalInNum = 0
    imageTotalOutNum = 0
    chl: IntelPersonStatsChlList[] = []
    groups: IntelPersonStatsGroupList[] = []
}

/**
 * @description 人员统计 搜索表单
 */
export class IntelPersonStatsForm {
    chl: string[] = []
    event: string[] = []
    dateRange: [number, number] = [0, 0]
}

/**
 * @description 车辆统计 通道项
 */
export class IntelVehicleStatsChlList {
    chlId = ''
    imageNum = 0
    vehicleIn = 0
    vehicleOut = 0
    nonVehicleIn = 0
    nonVehicleOut = 0
}

/**
 * @description 车辆统计 列表项
 */
export class IntelVehicleStatsList {
    imageTotalNum = 0
    imageTotalInNum = 0
    imageTotalOutNum = 0
    chl: IntelVehicleStatsChlList[] = []
}

/**
 * @description 车辆统计 搜索表单
 */
export class IntelVehicleStatsForm {
    chl: string[] = []
    event: string[] = []
    dateRange: [number, number] = [0, 0]
    attribute: string[] = []
    deduplicate = false
}

/**
 * @description 组合统计 通道项
 */
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

/**
 * @description 统计-表格项
 */
export class IntelStatsBarChartDataDto {
    groupId = ''
    groupName = ''
    data: number[] = []
}

/**
 * @description 组合统计 - 分组项
 */
export class IntelCombineStatsGroupList extends IntelPersonStatsGroupList {}

/**
 * @description 组合统计 列表
 */
export class IntelCombineStatsList {
    imageTotalNum = 0
    imageTotalInNum = 0
    imageTotalOutNum = 0
    chl: IntelCombineStatsChlList[] = []
    groups: IntelCombineStatsGroupList[] = []
}

/**
 * @description 组合统计 搜索表单
 */
export class IntelCombineStatsForm {
    chl: string[] = []
    event: string[] = []
    dateRange: [number, number] = [0, 0]
    vehicleAttribute: string[] = []
    personAttribute: string[] = []
    deduplicate = false
}

/**
 * @description 智能搜索 收藏 列表项
 */
export class IntelSearchCollectList {
    name: string = ''
    dateRange: [number, number] = [0, 0]
    chl: string[] = []
    event: string[] = []
    attribute: string[][] = [] // ['车辆选项', '人脸选项']
    profile: Record<string, Record<string, number[]>> = {}
    direction: number[] = []
    plateNumber: string = ''
}

/**
 * @description 抓拍图像
 */
export class IntelSnapImgDto {
    pic = ''
    panorama = ''
    eventType = ''
    targetType = ''
    plateNumber = ''
    width = 1
    height = 1
    X1 = 0
    Y1 = 0
    X2 = 0
    Y2 = 0
    isDelSnap = false
    isNoData = false
    attribute: Record<string, string | number> = {}
}

/**
 * @description 人脸搜索列表项
 */
export class IntelSearchList extends IntelSnapImgDto {
    imgId = ''
    timestamp = 0
    frameTime = ''
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
    direction: number | string = ''
}

/**
 * @description 人体搜索 表单
 */
export class IntelSearchBodyForm {
    dateRange: [number, number] = [0, 0]
    chl: string[] = []
    event: string[] = []
    attribute: Record<string, Record<string, number[]>> = {}
    pageSize = 40
    pageIndex = 0
}

/**
 * @description 车辆搜索 表单
 */
export class IntelSearchVehicleForm {
    dateRange: [number, number] = [0, 0]
    chl: string[] = []
    event: string[] = []
    attribute: Record<string, Record<string, number[]>> = {}
    pageSize = 40
    pageIndex = 0
    target: string[] = []
    direction: number[] = []
    plateNumber = ''
    searchType = 'event'
}

/**
 * @description 组合搜索 表单
 */
export class IntelSearchCombineForm {
    dateRange: [number, number] = [0, 0]
    chl: string[] = []
    event: string[] = []
    attribute: Record<string, Record<string, number[]>> = {}
    pageSize = 40
    pageIndex = 0
    target: string[][] = [[], []]
    plateNumber = ''
}

/**
 * @description 人脸数据
 */
export class IntelFaceImgDto {
    pic = ''
    panorama = ''
    match = ''
    width = 1
    height = 1
    X1 = 0
    Y1 = 0
    X2 = 0
    Y2 = 0
    isDelSnap = false
    isNoData = false
    identity = false
    attribute: Record<string, string | number> = {}
}

/**
 * @description 人脸搜索表单
 */
export class IntelSearchFaceList extends IntelFaceImgDto {
    faceFeatureId = 0
    imgId = ''
    timestamp = 0
    frameTime = ''
    guid = 0
    chlId = ''
    chlName = ''
    recStartTime = 0
    recEndTime = 0
    eventType = ''
    targetType = 'face'
    similarity = 0
    plateNumber = ''
    info = new IntelFaceDBFaceInfo()
}

/**
 * @description 抓拍弹窗
 */
export class IntelSnapPopList {
    imgId = ''
    // [key: string]: string | number | boolean
    pic = ''
    panorama = ''
    width = 1
    height = 1
    X1 = 0
    Y1 = 0
    X2 = 0
    Y2 = 0
    timestamp = 0
    frameTime = ''
    chlId = ''
    chlName = ''
    recStartTime = 0
    recEndTime = 0
    eventType = ''
    targetType = ''
    plateNumber = ''
    attribute: Record<string, string | number> = {}
}

/**
 * @description 原图弹窗
 */
export class IntelPanoramaPopList {
    panorama = ''
    width = 1
    height = 1
    X1 = 0
    Y1 = 0
    X2 = 0
    Y2 = 0
}

/**
 * @description 人脸比对结果弹窗
 */
export class IntelFaceMatchPopList extends IntelPanoramaPopList {
    imgId = ''
    pic = ''
    match = ''
    timestamp = 0
    frameTime = ''
    chlId = ''
    chlName = ''
    recStartTime = 0
    recEndTime = 0
    eventType = ''
    targetType = ''
    similarity = 0
    // frameTime = ''

    number = ''
    name = ''
    sex = ''
    birthday = ''
    nativePlace = ''
    certificateType = ''
    certificateNum = ''
    mobile = ''
    note = ''
    groupName = ''
}

/**
 * @description 人脸搜索 - 轨迹
 */
export class IntelFaceTrackMapList {
    chlId = ''
    chlName = ''
    recStartTime = 0
    recEndTime = 0
    timestamp = 0
    imgId = ''
    frameTime = ''
}
