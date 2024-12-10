/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 18:15:30
 * @Description: 磁盘
 */

/**
 * @description 磁盘模式配置表单
 */
export class DiskModeForm {
    enable = false
}

/**
 * @description S.M.A.R.T信息磁盘列表项
 */
export class DiskSmartInfoDiskList {
    index = 0
    id = ''
    diskNum = ''
    serialNum = ''
    model = ''
}

/**
 * @description S.M.A.R.T信息列表项
 */
export class DiskSmartInfoList {
    id = ''
    attribute = ''
    value = ''
    worstValue = ''
    threshold = ''
    rawValue = ''
    smartStatus = ''
}

/**
 * @description 磁盘健康磁盘列表项
 */
export class DiskHealthInfoDiskList {
    id = ''
    name = ''
    serialNum = ''
    healthStatus = ''
    healthStatusValue = ''
    diskInterfaceType = ''
}

/**
 * @description 磁盘健康磁盘详情列表项
 */
export class DiskHealthInfoDiskDetailList {
    id = ''
    name = ''
    status = ''
    value = ''
    suggest = ''
}

/**
 * @description 磁盘管理 磁盘列表项
 */
export class DiskManagememtList {
    id = ''
    cycleRecord = ''
    type = ''
    diskNum = ''
    // size = ''
    // freeSpace = ''
    serialNum = ''
    combinedStatus = ''
    diskStatus = ''
    diskEncryptStatus = ''
    model = ''
    raidType = ''
    recTime = ''
    sizeAndFreeSpace = ''
}

/**
 * @description 存储模式 磁盘组的磁盘列表项
 */
export class StorageModeDiskGroupListDatum {
    id = ''
    text = ''
}

/**
 * @description 存储模式 磁盘组列表项
 */
export class StorageModeDiskGroupList {
    id = ''
    diskList: StorageModeDiskGroupListDatum[] = []
    chlList: StorageModeDiskGroupListDatum[] = []
    diskCount = 0
    totalSize = ''
}

/**
 * @description 磁盘模式 磁盘列表项
 */
export class StorageModeDiskList {
    id = ''
    name = ''
    size = 0
}

/**
 * @description 磁盘模式 通道列表项
 */
export class StorageModeChlList {
    id = ''
    name = ''
    chlIndex = ''
    chlType = ''
    ip = ''
}

/**
 * @description 物理磁盘列表项
 */
export class DiskPhysicalList {
    id = ''
    slotIndex = ''
    capacity = 0
    raid = ''
    type = ''
    state = ''
    model = ''
    switch = false
}

/**
 * @description 创建RAID表单
 */
export class DiskCreateRaidForm {
    name = ''
    type = 'RAID_TYPE_5' // 同步设备端，默认选择raid5
    space = ''
    diskId: string[] = []
}

/**
 * @description RAID列表项
 */
export class DiskRaidList {
    id = ''
    logicDiskId = ''
    name = ''
    capacity = 0
    physicalDisk = ''
    raidState = 'downgrade'
    raidType = ''
    spareHard = ''
    task = ''
}

/**
 * @description 重建RAID表单
 */
export class DiskRaidRebuildForm {
    diskId = ''
}
