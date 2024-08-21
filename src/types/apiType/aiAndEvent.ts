/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 12:08:57
 * @Description: AI/事件
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-08-21 13:38:57
 */
const { Translate } = useLangStore()

/**
 * @description: 报警输出
 * @return {*}
 */
export class AlarmOut {
    id = '' //告警输出ID
    name = '' //告警输出名称
    index = '' //告警输出在设备上的序号
    devDesc = undefined as string | undefined //告警输出所在设备的描述，如果为undefined表示本机，否则表示通道的名称
    devID = undefined as string | undefined //告警输出所在设备的ID，如果为undefined表示本机，否则表示通道的ID
    delayTime = 0 //延迟时间
    scheduleId = '' //排程ID
    scheduleName = '' //排程名称
    type = '' //常开常闭类型--本机报警输出在有效
    status = '' //行状态: loading, success, error
    disabled = true //是否禁用
    // 表格中显示的序号，是devDesc-index
    get serialNum() {
        return `${this.devDesc ? this.devDesc : Translate('IDCS_LOCAL')}-${this.index}`
    }
}

/**
 * @description: email接收人
 * @return {*}
 */
export class EmailReceiver {
    address = ''
    addressShow = ''
    schedule = ''
    delDisabled = false
    rowDisabled = false
    rowClicked = false
}
// 事件通知——显示——弹出视频
export class PopVideoForm {
    popVideoDuration = 0 // 弹出视频持续时间
    popVideoOutputShow = false // 是否显示
    popVideoOutput = '' // 弹出视频输出
}

// 事件通知——显示——弹出消息框
export class PopMsgForm {
    popMsgDuration = 0
    popMsgShow = false
}

// 事件通知——蜂鸣器
export class buzzerForm {
    buzzerDuration = 0
}

// 事件通知——推送
export class pushForm {
    chkEnable = false // 是否启用
    pushSchedule = ''
}

// 事件通知——闪灯
export class whiteLightInfo {
    id = ''
    name = ''
    enable = ''
    durationTime: number | null = null
    frequencyType = ''
    enableDisable = true
    rowDisable = true
    durationTimeDisable = false
    frequencyTypeDisable = false
    status = '' //行状态: loading, success, error
}

// 事件通知——报警类型
export class AlarmTypeInfo {
    id = ''
    value = ''
}

export class MotionEventConfig {
    id = ''
    addType = ''
    chlType = ''
    poeIndex = ''
    productModel = {
        value: '',
        factoryName: '',
    }
    status = '' //行状态: loading, success, error
    name = ''
    schedule = {
        value: '',
        label: '',
    }
    record = {
        switch: false,
        chls: [] as { value: string; label: string }[],
    }
    recordList = [] as string[]
    snap = {
        switch: false,
        chls: [] as { value: string; label: string }[],
    }
    snapList = [] as string[]
    sysAudio = ''
    msgPush = ''
    alarmOut = {
        switch: false,
        chls: [] as { value: string; label: string }[],
    }
    alarmOutList = [] as string[]
    preset = {
        switch: false,
        presets: [] as { index: string; name: string; chl: { value: string; label: string } }[],
    }
    beeper = ''
    videoPopup = ''
    email = ''
    oldSchedule = {
        value: '',
        label: '',
    }

    rowDisable = true
}

export class PresetItem {
    index = ''
    name = ''
    chl = {
        value: '',
        label: '',
    }
}

export class PresetList {
    id = ''
    name = ''
    chlType = ''
    preset = {
        value: '',
        label: '',
    }
    presetList = [] as SelectOption<string, string>[]
}
