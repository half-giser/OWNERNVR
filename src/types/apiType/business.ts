/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-27 10:50:38
 * @Description: 业务应用（停车场管理、门禁管理、人脸考勤、人脸签到）
 */

import { useLangStore } from '@/stores/lang'

// 多语言翻译方法
const { Translate } = useLangStore()

// 业务应用-停车场管理-基础配置-停车场信息
export class PkMgrBasicConfigPageData {
    parkName = '' // 停车场名称
    totalNum = 0 // 总车位
    remainTotalNum = 0 // 剩余总车位
    groupTotalNum = 0 // 停车组总车位
    groupRemainTotalNum = 0 // 剩余停车组总车位
}

// 业务应用-停车场管理-车位管理-车位信息
export class PkMgrSpaceManageItem {
    id = '' // parkingSapce id（车位id）
    serialNum = 0 // 序号
    groupName = '' // 停车组名称
    parkingType = '' // 停车选项
    groupTotalNum = 0 // 总车位
    groupRemainNum = 0 // 剩余总车位
    groupSchedule = '' // 排程
    oldGroupSchedule = '' // 记录上一次选择的排程id（实现el-select下拉框最后一项'排程管理'点击后实际选中值不变的效果）
    linkEmail = '' // E-mail
}
export class PkMgrSpaceManagePageData {
    tableDatas = [] as PkMgrSpaceManageItem[] // 表格数据
    parkingTypeList = [
        { value: 'notPermit', label: Translate('IDCS_NOT_PERMIT_PARKING') },
        { value: 'usingGroup', label: Translate('IDCS_USING_GROUP_PARKING') },
        { value: 'usingTotalNum', label: Translate('IDCS_USING_TOTAL_NUM_PARKING') },
    ] as SelectItem[] // 停车选项列表
    totalNum = 0 // 总车位
    remainTotalNum = 0 // 剩余总车位
    defaultScheduleId = '{00000000-0000-0000-0000-000000000000}' // 默认排程Id
    scheduleList = [] as SelectItem[] // 排程选项列表
    scheduleIdList = [] as string[] // 排程Id列表
}

// 业务应用-停车场管理-出入口-出入口信息
export type directionType = 'no' | 'out' | 'in' // 方向-Type
export type screenType = 'JiaXun' // LED屏-Type
export class PkMgrEnterExitManageItem {
    id = '' // id
    serialNum = 0 // 序号
    channelName = '' // 出入口车道名称（通道名称）
    direction = '' // 方向
    ip = '' // 通道ip
    ipc = '' // IPC
    ipcStatus = 'offline' // 出入口在线状态（通道在线状态）
    enableLEDScreen = false // 启用LED屏
    enableLEDScreenValid = false // 启用LED屏-是否可操作
    LEDScreenType = '' // 关联LED屏
    LEDScreenTypeValid = false // 关联LED屏-是否可操作
}
export class PkMgrEnterExitManagePageData {
    tableDatas = [] as PkMgrEnterExitManageItem[] // 表格数据
    directionMap = {
        no: Translate('IDCS_CLOSE'),
        out: Translate('IDCS_APPEARANCE'),
        in: Translate('IDCS_APPROACH'),
    } // 方向-Map
    directionList = [] as SelectItem[] // 方向-List
    screenMap = {
        JiaXun: Translate('IDCS_JIAXUN_LED_SCREEN'),
    } // LED屏-Map
    screenList = [] as SelectItem[] // LED屏-List
}

// 业务应用-停车场管理-停车场-停车场信息

// 业务应用-门禁管理-门禁配置-门禁信息
export class AccessLockDataItem {
    delayTimeMin = 0 // 开门延时时间-最小值
    delayTimeMax = 0 // 开门延时时间-最大值
    delayTimeDefaultValue = 0 // 开门延时时间-默认值
    delayTimeValue = 0 // 开门延时时间-当前值
    delayTimeEnable = false // 开门延时时间-是否可操作
    openHoldTimeMin = 0 // 开门持续时间-最小值
    openHoldTimeMax = 0 // 开门持续时间-最大值
    openHoldTimeDefaultValue = 0 // 开门持续时间-默认值
    openHoldTimeValue = 0 // 开门持续时间-当前值
    openHoldTimeEnable = false // 开门持续时间-是否可操作
    doorLockConfig = '' // 门锁配置-当前值
    doorLockConfigEnable = false // 门锁配置-是否可操作
    alarmAction = '' // 报警联动类型-当前值
    alarmActionEnable = false // 报警联动类型-是否可操作
}
export interface AccessLockData {
    [key: number | string]: AccessLockDataItem
}
export class ActConfigPageData {
    chlId = '' // chlId-当前选中的通道Id
    chlList = [] as SelectItem[] // 通道列表-所有门禁通道列表
    accessLockData = {
        0: new AccessLockDataItem(),
    } as AccessLockData // 门锁数据
    accessLockDataEnable = false // 门锁数据-是否可操作
    accessLockIndexList = [
        {
            label: ' ',
            value: 0,
        },
    ] as SelectItem[] // 门锁-枚举（门锁1、门锁2...）
    accessLockCurrentIndex = 0 // 当前门锁-索引（1、2...）
    doorLockTypeEnum = [] as SelectItem[] // 门锁配置-枚举（自动、常开、常闭）
    doorLockActionEnum = [] as SelectItem[] // 报警联动类型-枚举（开门、关门）
    accessListTypeEnum = [] as SelectItem[] // 开门验证名单-枚举
    accessListType = '' // 开门验证名单-当前值
    accessListTypeEnable = false // 开门验证名单-是否可操作
    wearMaskOpen = false // 开门条件-戴口罩
    wearMaskOpenEnable = false // 开门条件-是否可操作
    wiegandIOTypeEnum = [] as SelectItem[] // 韦根配置-枚举
    wiegandIOType = '' // 韦根配置-当前值
    wiegandIOTypeEnable = false // 韦根配置-是否可操作
    wiegandModeEnum = [] as SelectItem[] // 韦根模式-枚举
    wiegandMode = '' // 韦根模式-当前值
    wiegandModeEnable = false // 韦根模式-是否可操作
}

export class BusinessFaceGroupList {
    id = ''
    name = ''
    property = ''
    groupId = ''
    members = [] as { id: string; name: string }[]
}

export class BusinessFaceResultList {
    faceFeatureId = ''
    timestamp = 0
    frameTime = ''
    imgId = 0
    chlId = ''
    chlName = ''
}

export class BusinessFaceDetailList {
    date = ''
    day = ''
    type = ''
    alarm = false
    detail = [] as BusinessFaceResultList[]
}

export class BusinessFaceList {
    id = ''
    name = ''
    groupId = ''
    groupName = ''
    searchData = {} as Record<string, BusinessFaceResultList[]>
    detail = [] as BusinessFaceDetailList[]
}

export class BusinessFaceForm {
    dateRange = [0, 0] as [number, number]
    pageSize = 100
    currentPage = 1
    startTime = '09:00:00'
    endTime = '18:00:00'
    chls = [] as SelectOption<string, string>[]
    faceGroup = [] as BusinessFaceGroupList[]
    // weekdays = [1, 2, 3, 4, 5]
    advanced = false
    isName = false
    name = ''
    isType = false
    type = [] as string[]
}

export class BusinessFaceAttendanceList extends BusinessFaceList {
    normal = 0
    late = 0
    leftEarly = 0
    absenteeism = 0
    abnormal = 0
}

export class BusinessFaceAttendanceForm extends BusinessFaceForm {
    weekdays = [1, 2, 3, 4, 5]
}

export class BusinessFaceCheckList extends BusinessFaceList {
    checked = 0
    unchecked = 0
}

export class BusinessFaceCheckForm extends BusinessFaceForm {}

export class BusinessParkingLotList {
    index = 0
    plateNum = ''
    eventType = ''
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

export class BusinessParkingLotRelevantList {
    eventTypeID = ''
    panoramaContent = ''
    chlName = ''
    openType = ''
    plateNumber = ''
    owner = ''
    ownerPhone = ''
    isRelative = true
    direction = ''
    frameTime = ''
}
