/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 12:08:57
 * @Description: AI/事件
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-08-22 15:28:23
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

export class ipcAudioForm {
    ipcRadio = 'audioAlarm' // 摄像机选择项——语音播报/声音设备

    // 语音播报
    audioChl = '' // 通道
    audioChecked = false // 声音是否启用
    voice = '' // 语音
    number = '' // 次数
    volume = '' // 音量
    language = '' // 语言

    // 声音设备
    deviceChl = '' // 通道
    deviceEnable = false // 声音设备
    deviceAudioInput = '' // 音频输入设备
    micOrLinVolume = 0 // 音频输入音量
    loudSpeaker = '' // 扬声器（内置）
    deviceAudioOutput = '' // LOUT（外置）
    outputVolume = 0 // 音频输出音量
    audioEncode = '' // 音频输入编码
}

export class AudioAlarmOut {
    successFlag = false
    editFlag = false
    id = ''
    name = ''
    audioTypeList = [] as SelectOption<string, string>[]
    customeAudioNum = 0
    langArr = [] as SelectOption<string, string>[]
    audioSwitch = ''
    audioType = ''
    alarmTimes = ''
    audioVolume = ''
    languageType = ''
    audioFormat = ''
    sampleRate = ''
    audioChannel = ''
    audioDepth = ''
    audioFileLimitSize = ''
}

export class AudioDevice {
    successFlag = false
    editFlag = false
    id = ''
    name = ''
    audioEncodeType = [] as SelectOption<string, string>[]
    audioInputType = [] as SelectOption<string, string>[]
    audioOutputType = [] as SelectOption<string, string>[]
    audioInSwitch = ''
    audioEncode = ''
    audioInput = ''
    loudSpeaker = ''
    audioOutput = ''
    micInVolume = 0
    linInVolume = 0
    audioOutVolume = 0
    micMaxValue = 100
    linMaxValue = 100
    audioOutMaxValue = 100
    micOrLinEnabled = false
    audioOutEnabled = false
}

export class LocalTableRow {
    id = ''
    index = ''
    name = ''
    originalName = ''
    fileValid = ''
}

// 传感器页面——通道列表
export class ChlList {
    id = ''
    name = ''
}

// 传感器的table项
export class SensorEvent {
    id = ''
    status = '' //行状态: loading, success, error
    alarmInType = ''
    nodeIndex = ''
    disabled = true
    isEditable = false
    serialNum = '' // 序号
    name = '' // 名称
    originalName = ''
    // 类型
    type = ''
    // 启用
    switch = ''
    holdTimeNote = ''
    // 持续时间
    holdTime = ''
    // 排程
    schedule = {
        value: '',
        label: '',
    }
    // 打开排程管理时将原本的排程填入
    oldSchedule = ''
    // record录像
    sysRec = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
    recordList = [] as string[]
    // audio声音
    sysAudio = ''
    // snap抓图
    sysSnap = {
        switch: false,
        chls: [] as SelectOption<string, string>[],
    }
    snapList = [] as string[]
    // 报警输出
    alarmOut = {
        switch: false,
        alarmOuts: [] as SelectOption<string, string>[],
    }
    alarmOutList = [] as string[]
    // 视频弹出
    popVideo = {
        switch: '',
        chl: {
            id: '',
            innerText: '',
        },
    }
    // 预置点名称
    preset = {
        switch: false,
        presets: [] as PresetItem[],
    }
    msgPushSwitch = '' // 推送
    buzzerSwitch = '' // 蜂鸣器
    emailSwitch = '' // email
    popMsgSwitch = '' // 消息框弹出
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
