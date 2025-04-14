/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-27 10:50:38
 * @Description: 业务应用（停车场管理、门禁管理、人脸考勤、人脸签到）的类型定义，类型命名的前缀统一为Business*
 */

/**
 * @description 停车场管理-基础配置-停车场信息表单
 */
export class BusinessPkMgrBasicConfigForm {
    parkName = '' // 停车场名称
    totalNum = 0 // 总车位
    remainTotalNum = 0 // 剩余总车位
    groupTotalNum = 0 // 停车组总车位
    groupRemainTotalNum = 0 // 剩余停车组总车位
}

/**
 * @description 停车场管理-车位管理-车位信息列表
 */
export class BusinessPkMgrSpaceManageList {
    id = '' // parkingSapce id（车位id）
    groupName = '' // 停车组名称
    parkingType = '' // 停车选项
    groupTotalNum = 0 // 总车位
    groupRemainNum = 0 // 剩余总车位
    groupSchedule = '' // 排程
    oldGroupSchedule = '' // 记录上一次选择的排程id（实现el-select下拉框最后一项'排程管理'点击后实际选中值不变的效果）
    linkEmail = '' // E-mail
}

// 业务应用-停车场管理-出入口-出入口信息
export class BusinessPkMgrEnterExitManageList {
    id = '' // id
    channelName = '' // 出入口车道名称（通道名称）
    direction = '' // 方向
    ip = '' // 通道ip
    ipc = '' // IPC
    enableLEDScreen = false // 启用LED屏
    enableLEDScreenValid = false // 启用LED屏-是否可操作
    LEDScreenType = '' // 关联LED屏
    LEDScreenTypeValid = false // 关联LED屏-是否可操作
}

/**
 * @description 门禁管理-门禁配置-门禁信息
 */
export class BusinessAccessLockDataItem {
    index = 0
    id = 0
    name = ' '
    openDelayTimeMin = 0 // 开门延时时间-最小值
    openDelayTimeMax = 0 // 开门延时时间-最大值
    openDelayTimeDefault = 0 // 开门延时时间-默认值
    openDelayTime = 0 // 开门延时时间-当前值
    openDelayTimeEnabled = false
    openHoldTimeMin = 1 // 开门持续时间-最小值
    openHoldTimeMax = 1 // 开门持续时间-最大值
    openHoldTimeDefault = 0 // 开门持续时间-默认值
    openHoldTimeEnabled = false
    openHoldTime = 0 // 开门持续时间-当前值
    doorLockConfig = '' // 门锁配置-当前值
    alarmAction = '' // 报警联动类型-当前值
}

/**
 * @description 业务应用-门禁门锁表单
 */
export class BusinessAccessLockForm {
    doorLock = [new BusinessAccessLockDataItem()]
    accessListType = ''
    wearMaskOpen = false
}

/**
 * @description 业务应用-韦根配置表单
 */
export class BusinessWiegandForm {
    IOType = ''
    mode = ''
}

/**
 * @description 人脸考勤-人脸组数据列表
 */
export class BusinessFaceGroupList {
    id = ''
    name = ''
    property = ''
    groupId = ''
    members: { id: string; name: string }[] = []
}

/**
 * @description 人脸考勤-人脸数据列表
 */
export class BusinessFaceResultList {
    faceFeatureId = ''
    timestamp = 0
    frameTime = ''
    imgId = 0
    chlId = ''
    chlName = ''
}

/**
 * @description 人脸考勤详情-人脸数据列表
 */
export class BusinessFaceDetailList {
    date = ''
    day = ''
    type = ''
    alarm = ''
    detail: BusinessFaceResultList[] = []
}

/**
 * @description 人脸数据列表 （基类）
 */
export class BusinessFaceList {
    id = ''
    name = ''
    groupId = ''
    groupName = ''
    searchData: Record<string, BusinessFaceResultList[]> = {}
    detail: BusinessFaceDetailList[] = []
}

/**
 * @description 人脸搜索表单 （基类）
 */
export class BusinessFaceForm {
    dateRange: [number, number] = [0, 0]
    pageSize = 100
    currentPage = 1
    startTime = '09:00:00'
    endTime = '18:00:00'
    chls: SelectOption<string, string>[] = []
    faceGroup: BusinessFaceGroupList[] = []
    // weekdays = [1, 2, 3, 4, 5]
    advanced = false
    isName = false
    name = ''
    isType = false
    type: string[] = []
}

/**
 * @description 人脸考勤搜索列表
 */
export class BusinessFaceAttendanceList extends BusinessFaceList {
    normal = 0
    late = 0
    leftEarly = 0
    absenteeism = 0
    abnormal = 0
}

/**
 * @description 人脸考勤搜索表单
 */
export class BusinessFaceAttendanceForm extends BusinessFaceForm {
    weekdays = [1, 2, 3, 4, 5]
}

/**
 * @description 人脸签到搜索列表
 */
export class BusinessFaceCheckList extends BusinessFaceList {
    checked = 0
    unchecked = 0
}

/**
 * @description 人脸签到搜索表单
 */
export class BusinessFaceCheckForm extends BusinessFaceForm {}

/**
 * @description 停车场-进出车辆数据列表
 */
export class BusinessParkingLotList {
    index = 0
    plateNum = ''
    eventType = 0
    master = ''
    phoneNum = ''
    // groupName = ''
    isEnter = false
    enterChlId = ''
    enterChl = ''
    enterTime = 0
    enterFrameTime = ''
    enterVehicleId = ''
    enterType = ''
    enterImg = ''
    isExit = false
    exitChlId = ''
    exitChl = ''
    exitTime = 0
    exitFrameTime = ''
    exitVehicleId = ''
    exitType = ''
    exitImg = ''
    direction = ''
    isHistory = false
    type = ''
    abnormal = false
    isRelative = false
}

/**
 * @description 停车场-关联数据列表
 */
export class BusinessParkingLotRelevantList {
    eventTypeID = 0
    panorama = ''
    chlName = ''
    openType = ''
    plateNumber = ''
    owner = ''
    ownerPhone = ''
    isRelative = true
    direction = ''
    frameTime = ''
}
