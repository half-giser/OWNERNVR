/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-29 09:13:28
 * @Description: 智能分析的类型定义，类型命名的前缀统一为Intel*
 */

/**
 * @description 图片（抓拍库和人脸库图片可能存在的信息）
 */
export class ImageInfo {
    id? = '' // 人脸库faceFeatureId
    imgId? = 0 // 抓拍库imgId
    chlId? = '' // 通道id
    frameTime? = '' // 帧时间
    picBase64? = '' // dataURL的base64部分
    name? = '' // 图片名称
    note? = '' // 图片描述
    libIndex? = 0
    picWidth? = 0
    picHeight? = 0
}

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
export class IntelFaceDBFaceInfo extends ImageInfo {
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
    faceImgCount = 0
    pic = ''
    groupId = ''
}

/**
 * @description 人脸注册表单
 */
export class IntelFaceDBSnapRegisterForm {
    name = ''
    sex = 'male'
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
    sex = 'male'
    birthday = ''
    nativePlace = ''
    certificateType = 'idCard'
    certificateNum = ''
    mobile = ''
    note = ''
    groupId = ''
    pic = ''
    success = false
    error = false
    errorTip = ' '
}

/**
 * @description 人脸抓拍列表
 */
export class IntelFaceDBSnapFaceList extends ImageInfo {
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
 * @description 人体抓拍列表
 */
export class IntelBodyDBSnapBodyList extends ImageInfo {
    index = ''
    searchByImageIndex = ''
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
    sex = 'male'
    birthday = ''
    // nativePlace = ''
    certificateType = 'idCard'
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
    id = ''
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
    childIn = 0
    childOut = 0
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
    attribute: Record<string, Record<string, string[]>> = {}
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
    attribute: Record<string, Record<string, string[]>> = {}
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
    profile: Record<string, Record<string, string[]>> = {}
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
 * @description 抓拍车辆图像
 */
export class IntelSnapVehicleImgDto extends IntelSnapImgDto {
    owner = ''
    ownerPhone = ''
}

/**
 * @description 人体搜索列表项
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
}

export class IntelSearchVehicleList extends IntelSearchList {
    direction = ''
    openType = ''
    isRelative = false
    owner = ''
    ownerPhone = ''
}

/**
 * @description 人体搜索 表单
 */
export class IntelSearchBodyForm {
    dateRange: [number, number] = [0, 0]
    chl: string[] = []
    event: string[] = []
    attribute: Record<string, Record<string, string[]>> = {}
    pageSize = 40
    pageIndex = 0
    eventType: string[] = []
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
    eventType: string[] = []
}

/**
 * @description 车牌颜色列表项
 */
export class IntelPlateColorList {
    value = ''
    label = ''
    selected? = false
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

/**
 * @description 智能搜索 - 索引数据列表项
 */
export class IntelTargetIndexItem {
    index = ''
    targetID = ''
    targetType = ''
    chlID = ''
    channelName = ''
    timeStamp = 0
    timeStampUTC = ''
    timeStamp100ns = ''
    quality = ''
    similarity = 0
    eventType = ''
    libIndex = 0
    startTime = 0
    startTimeUTC = ''
    endTime = 0
    endTimeUTC = ''
}

/**
 * @description 智能搜索 - 详情数据
 */
export class IntelTargetDataItem extends IntelTargetIndexItem {
    checked? = false // 界面中使用的变量，标识是否选中头部的checkbox选择框
    isNoData = false
    isDelete = false
    targetID = ''
    featureStatus = ''
    supportRegister = false
    targetType = ''
    timeStamp = 0 // 这一帧的时间戳
    timeStampLocal = '' // 这一帧的本地时间戳文字表达
    timeStampUTC = '' // 这一帧的UTC时间戳文字表达
    startTime = 0 // 目标开始时间戳
    startTimeLocal = '' // 目标开始本地时间戳文字表达
    startTimeUTC = '' // 目标开始UTC时间戳文字表达
    endTime = 0 // 目标消失的时间戳
    endTimeLocal = '' // 目标消失的本地时间戳文字表达
    endTimeUTC = '' // 目标消失的UTC时间戳文字表达
    objPicData = {} as IntelObjPicDataItem // 抓拍图信息
    backgroundPicDatas = [] as IntelBackgroundPicDataList[] // 原图信息（多目ipc会有多张图）
    targetTrace = {} as IntelTargetTraceItem // 目标框 rect
    ruleInfos = [] as IntelRuleInfoList[] // 触发了告警的规则信息
    humanAttrInfo = {} as IntelHumanAttrInfoItem // 人员属性信息
    vehicleAttrInfo = {} as IntelVehicleAttrInfoItem // 汽车属性信息
    nonMotorVehicleAttrInfo = {} as IntelNonMotorVehicleAttrInfoItem // 非机动车属性信息
    plateAttrInfo = {} as IntelPlateAttrInfoItem // 车牌号信息
}

/**
 * @description 智能搜索 - 点数据信息
 */
export class IntelPointItem {
    X = 0
    Y = 0
}

/**
 * @description 智能搜索 - 抓拍图数据
 */
export class IntelObjPicDataItem {
    data = ''
    picWidth = 0
    picHeight = 0
}

/**
 * @description 智能搜索 - 原图数据
 */
export class IntelBackgroundPicDataList {
    index = ''
    data = ''
    picWidth = 0
    picHeight = 0
}

/**
 * @description 智能搜索 - 目标框数据
 */
export class IntelTargetTraceItem {
    X1 = 0
    Y1 = 0
    X2 = 0
    Y2 = 0
}

/**
 * @description 智能搜索 - 告警规则信息
 */
export class IntelRuleInfoList {
    direction = ''
    startPoint = {
        X: 0,
        Y: 0,
    }
    endPoint = {
        X: 0,
        Y: 0,
    }
    points = [] as IntelPointItem[]
}

/**
 * @description 智能搜索 - 人员属性信息
 */
export class IntelHumanAttrInfoItem {
    gender = ''
    ageBracket = ''
    mask = ''
    hat = ''
    glasses = ''
    backpack = ''
    upperCloth = {
        upperClothType: '',
        upperClothColor: '',
    }
    lowerCloth = {
        lowerClothType: '',
        lowerClothColor: '',
    }
    skirt = ''
    direction = ''
}

/**
 * @description 智能搜索 - 汽车属性信息
 */
export class IntelVehicleAttrInfoItem {
    vehicleColor = ''
    vehicleBrand = ''
    vehicleType = ''
}

/**
 * @description 智能搜索 - 非机动车属性信息
 */
export class IntelNonMotorVehicleAttrInfoItem {
    nonMotorizedVehicleType = ''
}

/**
 * @description 智能搜索 - 车牌号信息
 */
export class IntelPlateAttrInfoItem {
    plateNumber = ''
    vehicleStyle = ''
    plateColor = ''
    vehicleColor = ''
    vehicleBrand = ''
    vehicleType = ''
    nonMotorizedVehicleType = ''
}
