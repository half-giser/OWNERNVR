/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 18:15:30
 * @Description: 磁盘
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-09 10:49:01
 */

export class DiskModeForm {
    enable = false
}

export class DiskSmartInfoDiskList {
    id = ''
    diskNum = ''
    serialNum = ''
    model = ''
}

export class DiskSmartInfoList {
    id = ''
    attribute = ''
    value = ''
    worstValue = ''
    threshold = ''
    rawValue = ''
    smartStatus = ''
}

export class DiskHealthInfoDiskList {
    id = ''
    name = ''
    serialNum = ''
    healthStatus = ''
    healthStatusValue = ''
    diskInterfaceType = ''
}

export class DiskHealthInfoDiskDetailList {
    id = ''
    name = ''
    status = ''
    value = ''
    suggest = ''
}

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

export class StorageModeDiskGroupListDatum {
    id = ''
    text = ''
}

export class StorageModeDiskGroupList {
    id = ''
    diskList = [] as StorageModeDiskGroupListDatum[]
    chlList = [] as StorageModeDiskGroupListDatum[]
    diskCount = 0
    totalSize = ''
}

export class StorageModeDiskList {
    id = ''
    name = ''
    size = 0
}

export class StorageModeChlList {
    id = ''
    name = ''
    chlIndex = ''
    chlType = ''
    ip = ''
}

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

export class DiskCreateRaidForm {
    name = ''
    type = 'RAID_TYPE_5' // 同步设备端，默认选择raid5
    space = ''
    diskId = [] as string[]
}

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
