/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 11:31:57
 * @Description: 现场预览
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-02 19:45:03
 */
import { type WebsocketSnapOnSuccessSnap } from '@/utils/websocket/websocketSnap'

export class LiveChannelList {
    id = ''
    value = ''
    chlType = ''
    protocolType = ''
    supportPtz = false
    supportPTZGroupTraceTask = false
    supportAccessControl = false
    supportTalkback = false
}

export class LiveChannelGroupList {
    id = ''
    value = ''
    dwellTime = 0
}

export class LiveChlOfChannelGroupList {
    id = ''
    value = ''
}

export class LiveCustomViewChlList {
    chlId = ''
    chlIndex = 0
}

export class LiveCustomViewList {
    chlArr = [] as LiveCustomViewChlList[]
    historyPlay = ''
    segNum = 0
    value = ''
    id = 0
}

export class LiveAlarmList {
    id = ''
    name = ''
    switch = false
    delay = 0
}

export class LiveResolutionOptions {
    value = ''
    label = ''
    maxFps = 0
}

export class LiveQualityOptions {
    value = ''
    enct = ''
    res = ''
    chlType = ''
}

export class LiveStreamForm {
    resolution = ''
    frameRate = 0
    quality = ''
}

export class LiveLensForm {
    focusType = ''
    focusTime = 0
    irchangeFocus = false
}

export class LiveSharedWinData {
    PLAY_STATUS = 'stop' as 'play' | 'stop' | 'error'
    winIndex = 0
    seeking = false
    original = false
    audio = false
    magnify3D = false
    localRecording = false
    isPolling = false
    isDwellPlay = false
    groupID = ''
    timestamp = 0
    showWatermark = false
    showPos = false
    chlID = ''
    supportPtz = false
    chlName = ''
    streamType = 2
    talk = false
    supportAudio = true
}

export class LiveSnapData implements WebsocketSnapOnSuccessSnap {
    type = ''
    chlId = ''
    chlName = ''
    detect_time = 0
    frame_time = 0
    scene_pic = ''
    snap_pic = ''
    repo_pic = ''
    info = {
        similarity: '',
        text_tip: '',
        group_name: '',
        remarks: '',
        name: '',
        compare_status: 0,
        plate: '',
        event_type: '',
        target_type: '',
        person_info: {},
        car_info: {},
        bike_info: {},
        face_respo_id: '',
        birth_date: '',
        certificate_number: '',
        mobile_phone_number: '',
        repo_pic: '',
        face_id: '',
        point_left_top: '',
        point_right_bottom: '',
        ptWidth: 0,
        ptHeight: 0,
        serial_number: '',
        gender: '',
    }
}
