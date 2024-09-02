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

// 业务应用-人脸考勤
export interface ChlIdNameMap {
    [key: string]: string
}
export class FaceGroupInfoItem implements SelectItem {
    value: any
    label: any
    id = '' // UUID
    groupId = '' // 人脸分组Id
    groupName = '' // 人脸分组名称
    property = '' // 人脸分组property
}
export class FacePersonnalInfoItem {
    faceId = '' // 人脸id
    faceName = '' // 人脸名字
    groupId = '' // 人脸对应的人脸分组Id（标识该人脸属于哪个人脸分组 -> 一般来说每个人脸只对应一个分组，即使相同的人脸被添加到了不同分组，每个分组中的相同的人脸的人脸id也是不同的，因为人脸id是唯一的）
    groups = [
        {
            groupId: '', // 人脸分组Id
            groupName: '', // 人脸分组名称
        },
    ] as Array<{ groupId: string; groupName: string }> // 人脸所在的人脸分组（标识该人脸被添加到了哪些人脸分组 -> 一般来说每个人脸只对应一个分组，即使相同的人脸被添加到了不同分组，每个分组中的相同的人脸的人脸id也是不同的，因为人脸id是唯一的，故此列表只会存在一个元素）
}
export interface FacePersonnalInfoMap {
    [key: string | number]: FacePersonnalInfoItem
}
export interface FaceGroupIdFaceIdListMap {
    [key: string | number]: Array<string | number>
}
export class FaceAttendancePageData {
    chlSelectedAllFlg = true // 通道是否全选-默认全选
    chlList = [] as SelectItem[] // 通道列表-总
    chlSelectedList = [] as SelectItem[] // 通道列表-已选择
    chlIdList = [] as string[] // 通道Id列表-总
    chlSelectedIdList = [] as string[] // 通道Id列表-已选择
    chlNameList = [] as string[] // 通道名称列表-总
    chlSelectedNameList = [] as string[] // 通道名称列表-已选择
    chlNameListStr = '' // 通道名称列表组合起来的字符串-总
    chlSelectedNameListStr = '' // 通道名称列表组合起来的字符串-已选择
    chlIdNameMapping = {} as ChlIdNameMap // 通道Id、Name的关系映射表-{ '{00000001-0000-0000-0000-000000000000}': 'IPCamera' }
    faceGroupSelectedAllFlg = true // 人脸分组是否全选-默认全选
    faceGroupList = [] as FaceGroupInfoItem[] // 人脸分组列表-总
    faceGroupSelectedList = [] as FaceGroupInfoItem[] // 人脸分组列表-已选择
    faceGroupIdList = [] as string[] // 人脸分组Id列表-总
    faceGroupSelectedIdList = [] as string[] // 人脸分组Id列表-已选择
    faceGroupNameList = [] as string[] // 人脸分组名称列表-总
    faceGroupSelectedNameList = [] as string[] // 人脸分组名称列表-已选择
    faceGroupNameListStr = '' // 人脸分组名称列表组合起来的字符串-总
    faceGroupSelectedNameListStr = '' // 人脸分组名称列表组合起来的字符串-已选择
    dateTimeFormat = {
        dateFormat: 'yyyy/MM/dd',
        timeFormat: 'hh:mm:ss tt',
        format: 'yyyy/MM/dd hh:mm:ss tt',
        dateFormatForCalc: 'yyyy/MM/dd', // 固定格式，方便split,join,getMonth等自定义计算
        timeFormatForCalc: 'hh:mm:ss tt', // 固定格式，方便split,join,getMonth等自定义计算
        formatForCalc: 'yyyy/MM/dd hh:mm:ss tt', // 固定格式，方便split,join,getMonth等自定义计算
    } // 系统日期格式
    selectedDateInfo = {
        startTimeFormat: '', // 开始时间-查询协议需要的字段
        endTimeFormat: '', // 结束时间-查询协议需要的字段
        oneWeekFirstDayFormat: '', // 一周的第一天
        oneWeekLastDayFormat: '', // 一周的最后一天
        oneMonthFirstDayFormat: '', // 一个月的第一天
        oneMonthLastDayFormat: '', // 一个月的最后一天
        startTimeFormatForCalc: '', // 开始时间-查询协议需要的字段, 固定格式，方便split,join,getMonth等自定义计算
        endTimeFormatForCalc: '', // 结束时间-查询协议需要的字段, 固定格式，方便split,join,getMonth等自定义计算
        oneWeekFirstDayFormatForCalc: '', // 一周的第一天, 固定格式，方便split,join,getMonth等自定义计算
        oneWeekLastDayFormatForCalc: '', // 一周的最后一天, 固定格式，方便split,join,getMonth等自定义计算
        oneMonthFirstDayFormatForCalc: '', // 一个月的第一天, 固定格式，方便split,join,getMonth等自定义计算
        oneMonthLastDayFormatForCalc: '', // 一个月的最后一天, 固定格式，方便split,join,getMonth等自定义计算
        currentDateIndex: 'today', // 当前选中的日期标签项
        selectedDateForShow: Translate('IDCS_CALENDAR_TODAY'), // 选择的日期时间-供界面展示的时间
        selectedDateForLabel: Translate('IDCS_ATTENDANCE_DATE').formatForLang(1, ''), // 日期标题-(日期(1天), 日期(7天)), 英文下需要根据天数不同展示单位"天"的单复数形式
    } as SelectedDateInfo // 选择的日期信息
    attendanceCycleDayArr = [] // 考勤周期, [0, 1, 2, 3, 4, 5, 6]
    attendanceStartTime = '09:00:00' // 考勤开始时间, 09:00:00
    attendanceEndTime = '18:00:00' // 考勤开始时间, 18:00:00
    faceIdFacePersonnalInfoMap = {} as FacePersonnalInfoMap // 人脸信息Map-{人脸id: 该人脸相关信息}
    faceGroupIdFaceIdListMap = {} as FaceGroupIdFaceIdListMap // 人脸分组id映射人脸分组中的人脸id列表Map-{人脸分组id: [人脸id1, 人脸id2,...]}
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
    timeNS = ''
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

export class BusinessFaceAttendanceList extends BusinessFaceList {
    normal = 0
    late = 0
    leftEarly = 0
    absenteeism = 0
    abnormal = 0
}

export class BusinessFaceCheckList extends BusinessFaceList {
    checked = 0
    unchecked = 0
}

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
