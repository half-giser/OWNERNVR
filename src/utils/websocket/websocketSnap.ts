/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 15:59:38
 * @Description: websocket 订阅实时抓拍
 */

type SnapDataConfig = Partial<{
    channel_id: string
    face_detect: {
        info: boolean
        detect_pic: boolean
        scene_pic: boolean
    }
    face_verify: {
        info: boolean
        detect_pic: boolean
        scene_pic: boolean
        repo_pic: boolean
    }
    vehicle_plate: {
        info: boolean
        detect_pic: boolean
        scene_pic: boolean
    }
    boundary: {
        info: boolean
        detect_pic: boolean
        scene_pic: boolean
    }
    parking_lot: {
        info: boolean
    }
    audio_exception: {
        info: boolean
    }
}>[]

export interface WebsocketSnapOption {
    config: SnapDataConfig
    onsuccess?: (param: WebsocketSnapOnSuccessParam[]) => void
}

type SnapDataDatum = {
    channel_id: string
    channel_name: string
    detect_time: number
    frame_time: string
    scene_pic: string
    snap_pic: string
    repo_pic: string
    detect_face_list: {
        face_info: string
        face_pic: string
    }[]
    verify_face_list: {
        verify_face_list: string
        face_pic: string
        face_info: string
        repo_pic: string
    }[]
    vehicle_plate_list: {
        vehicle_plate_pic: string
        vehicle_plate_info: string
    }[]
    detect_list: {
        target_pic: string
        boundary_info: string
        abnormal_type: number
        is_alarm: boolean
        sound_level: number
        background_sound_level: number
    }[]
    parking_lot_info: {
        remain_space: string // 剩余车位
        total_space: string // 总车位
        today_entrance_num: string // 今日进入车辆数
        today_exit_num: string // 今日离开车辆数
    }
    vehicle_info: {
        // 当前帧
        direction: string // 方向, 0: 拒绝入场, 1: 进场, 2: 出场
        scene_pic: string // 进场原图
        channel_id: string // 进场通道ID
        channel_name: string // 进场通道名称
        detect_time: number // 进场时间（毫秒数）
        enterframeTime: number // 进场时间（帧时间）
        vehicle_id: string // 进场车牌ID
        open_type: string // 进场放行方式
        frame_time: string // 进场时间（帧时间）
        vehicle_plate_pic: string
        ptWidth: string
        ptHeight: string
        point_left_top: string
        point_right_bottom: string
    }
    relative_vehicle_info: {
        // 相关帧
        direction: string // 方向, 0: 拒绝入场, 1: 进场, 2: 出场
        scene_pic: string // 进场原图
        channel_id: string // 进场通道ID
        channel_name: string // 进场通道名称
        detect_time: number // 进场时间（毫秒数）
        enterframeTime: number // 进场时间（帧时间）
        vehicle_id: string // 进场车牌ID
        open_type: string // 进场放行方式
        frame_time: string // 进场时间（帧时间）
        vehicle_plate_pic: string
        ptWidth: string
        ptHeight: string
        point_left_top: string
        point_right_bottom: string
    }
    fire_pic: string
    fire_info: {}
    plate: string // 车牌号
    owner: string // 车主
    mobile: string // 联系方式
    groupName: string // 车牌组名称
    remark: string
    plate_start_time: string
    plate_end_time: string
    optical_scene_pic: string
    thermal_scene_pic: string
}

type SnapDataKey = 'face_detect' | 'face_verify' | 'vehicle_plate' | 'boundary' | 'audio_exception' | 'fire_detect'

type SnapDataType = {
    [key in SnapDataKey]: SnapDataDatum[]
}

export type WebsocketSnapOnSuccessSnapInfo = {
    vehicle_type?: number
    similarity?: string
    text_tip?: string
    group_name?: string
    remarks?: string
    name?: string
    compare_status: number
    plate?: string
    event_type: string
    target_type: string
    target_id?: string
    person_info?: Record<string, string | number>
    car_info?: Record<string, string | number>
    bike_info?: Record<string, string | number>
    // plate: Record<string, string | number>
    face_respo_id?: string
    birth_date?: string
    certificate_number?: string
    mobile_phone_number?: string
    owner?: string
    repo_pic?: string
    face_id: string
    point_left_top: string
    point_right_bottom: string
    ptWidth: number
    ptHeight: number
    serial_number?: string
    gender?: string
    hometown?: string
    certificate_type?: number
    faceImgCount?: number
    platecolor?: number
    color?: number
    type?: number
    brand_type?: number
    X1: number
    Y1: number
    X2: number
    Y2: number
}

export type WebsocketSnapOnSuccessSnap = {
    type: string | number
    chlId: string
    chlName: string
    detect_time: number
    frame_time: string
    scene_pic?: string | null
    snap_pic?: string | null
    repo_pic?: string | null
    optical_scene_pic?: string | null
    thermal_scene_pic?: string | null
    isAlarm?: boolean
    soundLevel?: number
    backgroundLevel?: number
    info?: WebsocketSnapOnSuccessSnapInfo
}

export type WebsocketSnapOnSuccessPlate = {
    plateNum: string // 车牌号
    master: string // 车主
    remark: string
    phoneNum: string // 联系方式
    groupName: string // 车牌组名称
    plateStartTime: string
    plateEndTime: string
    restNum: string // 剩余车位
    totalNum: string // 总车位
    enterNum: string // 今日进入车辆数
    exitNum: string // 今日离开车辆数
    direction: string // 方向
    isEnter: boolean // 是否有进场数据
    enterImg: string | null // 进场原图
    enterSnapImg: string | null
    enterChlId: string // 进场通道ID
    enterChl: string // 进场通道名称
    enterTime: number | string // 进场时间（毫秒数）
    enterframeTime: number | string // 进场时间（帧时间）
    enterVehicleId: string // 进场车牌ID
    enterType: string // 进场放行方式
    enterTraceObj: { X1: number; Y1: number; X2: number; Y2: number }
    isExit: boolean // 是否有出场数据
    exitImg: string | null // 出场原图
    exitSnapImg: string | null
    exitChlId: string // 出场通道ID
    exitChl: string // 出场通道名称
    exitTime: number | string // 出场时间（毫秒数）
    exitframeTime: number | string // 进场时间（帧时间）
    exitVehicleId: string // 出场车牌ID
    exitType: string // 出场放行方式
    exitTraceObj: { X1: number; Y1: number; X2: number; Y2: number }
}

export type WebsocketSnapOnSuccessParam = WebsocketSnapOnSuccessSnap | WebsocketSnapOnSuccessPlate

const PIC_KEY_MAP: Record<string, Record<string, string>> = {
    fire_detect: {
        detect_list: 'detect_list',
        snap_pic: 'fire_pic',
        info: 'fire_info',
    },
    face_detect: {
        detect_list: 'detect_face_list',
        snap_pic: 'face_pic',
        info: 'face_info',
        repo_pic: '',
    },
    face_verify: {
        detect_list: 'verify_face_list',
        snap_pic: 'face_pic',
        info: 'face_info',
        repo_pic: 'repo_pic',
    },
    vehicle_plate: {
        detect_list: 'vehicle_plate_list',
        snap_pic: 'vehicle_plate_pic',
        info: 'vehicle_plate_info',
        repo_pic: '',
    },
    boundary: {
        detect_list: 'detect_list',
        snap_pic: 'target_pic',
        info: 'boundary_info',
        repo_pic: '',
    },
}

export const WebsocketSnap = (option: WebsocketSnapOption) => {
    const config = option.config
    const onsuccess = option.onsuccess

    const ws = WebsocketBase({
        onopen: () => {
            start()
        },
        onmessage: (data: string | ArrayBuffer) => {
            if (typeof data === 'string') {
                const res = JSON.parse(data)
                const code = Number(res.basic.code)
                if (res.url === '/device/real_image/subscribe#response' && code === 0) {
                    console.log('intelligent picture subscription success')
                }
            } else {
                const dataView = new DataView(data)
                const encryptType = dataView.getUint32(0, true)
                const jsonOffset = encryptType === 0 ? 8 : 16
                const jsonLen = dataView.getUint32(4, true)
                const jsonEndPosition = jsonLen + jsonOffset
                const jsonBuf = data.slice(jsonOffset, jsonEndPosition)
                const json = JSON.parse(Uint8ArrayToStr(new Uint8Array(jsonBuf)))
                const snapDataList = getSnapData(json.data, jsonEndPosition, data)
                onsuccess && onsuccess(snapDataList)
            }
        },
    })

    const getTraceObj = (ptWidth: string, ptHeight: string, point_left_top: string, point_right_bottom: string) => {
        const leftTopX = Number(point_left_top.split(',')[0].split('(')[1])
        const leftTopY = Number(point_left_top.split(',')[1].split(')')[0])
        const rightBottomX = Number(point_right_bottom.split(',')[0].split('(')[1])
        const rightBottomY = Number(point_right_bottom.split(',')[1].split(')')[0])
        return {
            X1: leftTopX / Number(ptWidth),
            Y1: leftTopY / Number(ptHeight),
            X2: rightBottomX / Number(ptWidth),
            Y2: rightBottomY / Number(ptHeight),
        }
    }

    /**
     * @description 从响应json报文的data字段信息中读取抓拍数据
     * @param {SnapDataType} data
     * @param {number} jsonEndPosition
     * @param {ArrayBuffer} buffer
     * @returns {WebsocketSnapOnSuccessParam[]}
     */
    const getSnapData = (data: SnapDataType, jsonEndPosition: number, buffer: ArrayBuffer) => {
        const snapDataList: WebsocketSnapOnSuccessParam[] = []

        Object.entries(data).forEach(([currentKey, list]) => {
            const key = currentKey as SnapDataKey
            list.forEach((itemOut) => {
                // 停车场类型
                if (itemOut.parking_lot_info) {
                    snapDataList.push(analysisParkData(itemOut, jsonEndPosition, buffer))
                    return
                }

                // 声音异常类型
                if (key === 'audio_exception') {
                    analysisASDData(itemOut, snapDataList)
                    return
                }

                // 火点检测类型
                if (key === 'fire_detect') {
                    analysisFireData(itemOut, jsonEndPosition, buffer, key, snapDataList)
                    return
                }

                const chlId = itemOut.channel_id
                const chlName = itemOut.channel_name
                const detect_time = itemOut.detect_time * 1000
                const frame_time = itemOut.frame_time || ''
                const scene_pic = getPicBase64(buffer, itemOut.scene_pic, jsonEndPosition)
                const snapPicKey = PIC_KEY_MAP[key].snap_pic
                const repoPicKey = PIC_KEY_MAP[key].repo_pic
                const infoKey = PIC_KEY_MAP[key].info
                itemOut[PIC_KEY_MAP[key].detect_list as 'detect_face_list' | 'verify_face_list' | 'vehicle_plate_list' | 'detect_list'].forEach((item) => {
                    const snap_pic = getPicBase64(buffer, (item as any)[snapPicKey], jsonEndPosition)
                    const repo_pic = repoPicKey ? getPicBase64(buffer, (item as any)[repoPicKey], jsonEndPosition) : undefined
                    snapDataList.push({
                        type: key,
                        chlId: chlId,
                        chlName: chlName,
                        detect_time: detect_time,
                        frame_time: frame_time,
                        scene_pic: scene_pic,
                        snap_pic: snap_pic,
                        repo_pic: repo_pic,
                        info: (item as any)[infoKey],
                    })
                })
            })
        })

        return snapDataList
    }

    // 解析火点检测抓拍数据（数据结构见websocket协议 parking_lot）
    const analysisFireData = (itemOut: SnapDataDatum, jsonEndPosition: number, buffer: ArrayBuffer, key: string, snapDataList: WebsocketSnapOnSuccessParam[]) => {
        const chlId = itemOut.channel_id
        const chlName = itemOut.channel_name
        const detect_time = itemOut.detect_time * 1000
        const frame_time = itemOut.frame_time || ''
        const optical_scene_pic = getPicBase64(buffer, itemOut.optical_scene_pic, jsonEndPosition) // 可见光原图
        const thermal_scene_pic = getPicBase64(buffer, itemOut.thermal_scene_pic, jsonEndPosition) // 热成像原图
        const snapPicKey = PIC_KEY_MAP[key].snap_pic
        const infoKey = PIC_KEY_MAP[key].info
        itemOut.detect_list.forEach((item) => {
            const key = item[snapPicKey as 'target_pic' | 'boundary_info'] as string
            const snap_pic = getPicBase64(buffer, key, jsonEndPosition)
            snapDataList.push({
                type: key,
                chlId: chlId,
                chlName: chlName,
                detect_time: detect_time,
                frame_time: frame_time,
                optical_scene_pic: optical_scene_pic,
                thermal_scene_pic: thermal_scene_pic,
                snap_pic: snap_pic,
                info: (item as any)[infoKey],
            })
        })
    }

    // 解析声音异常强度数据
    const analysisASDData = (itemOut: SnapDataDatum, snapDataList: WebsocketSnapOnSuccessParam[]) => {
        const chlId = itemOut.channel_id
        const chlName = itemOut.channel_name
        const detect_time = itemOut.detect_time * 1000
        const frame_time = itemOut.frame_time || ''
        itemOut.detect_list.forEach((item) => {
            const type = item.abnormal_type // 异常类型 0:初始值，1:陡升，2:陡降，3:拾音异常
            const isAlarm = item.is_alarm // 是否正在告警
            const soundLevel = item.sound_level // 声音强度
            const backgroundLevel = item.background_sound_level // 背景音强度
            snapDataList.push({
                type: type,
                chlId: chlId,
                chlName: chlName,
                detect_time: detect_time,
                frame_time: frame_time,
                isAlarm: isAlarm,
                soundLevel: soundLevel,
                backgroundLevel: backgroundLevel,
            })
        })
    }

    /**
     * @description 解析停车场抓拍数据（数据结构见websocket协议 parking_lot）
     * @param {SnapDataDatum} data
     * @param {number} jsonEndPosition
     * @param {ArrayBuffer} buffer
     * @returns {WebsocketSnapOnSuccessPlate}
     */
    const analysisParkData = (data: SnapDataDatum, jsonEndPosition: number, buffer: ArrayBuffer) => {
        const parking_lot = data
        const parking_lot_info = parking_lot.parking_lot_info
        const vehicle_info = parking_lot.vehicle_info // 当前帧
        const relative_vehicle_info = parking_lot.relative_vehicle_info // 相关帧
        const direction = vehicle_info && vehicle_info.direction // 方向, 0: 拒绝入场, 1: 进场, 2: 出场
        // 当前帧和相关帧, 哪个是进场数据, 哪个是出场数据, 由方向决定
        const enterObj = Number(direction) === 0 || Number(direction) === 1 ? vehicle_info : relative_vehicle_info
        const exitObj = Number(direction) === 0 || Number(direction) === 1 ? relative_vehicle_info : vehicle_info
        const obj: WebsocketSnapOnSuccessParam = {
            plateNum: parking_lot.plate, // 车牌号
            master: parking_lot.owner, // 车主
            phoneNum: parking_lot.mobile, // 联系方式
            remark: parking_lot.remark,
            groupName: parking_lot.groupName, // 车牌组名称
            plateStartTime: parking_lot.plate_start_time, // 有效进场时间
            plateEndTime: parking_lot.plate_end_time, // 有效出场时间
            restNum: parking_lot_info.remain_space, // 剩余车位
            totalNum: parking_lot_info.total_space, // 总车位
            enterNum: parking_lot_info.today_entrance_num, // 今日进入车辆数
            exitNum: parking_lot_info.today_exit_num, // 今日离开车辆数
            direction: direction, // 方向
            isEnter: !!enterObj, // 是否有进场数据
            enterImg: enterObj && enterObj.scene_pic ? getPicBase64(buffer, enterObj.scene_pic, jsonEndPosition) : '', // 进场原图
            enterSnapImg: enterObj && enterObj.vehicle_plate_pic ? getPicBase64(buffer, enterObj.vehicle_plate_pic, jsonEndPosition) : '', // 进场抓拍图
            enterChlId: enterObj ? enterObj.channel_id : '', // 进场通道ID
            enterChl: enterObj ? enterObj.channel_name : '', // 进场通道名称
            enterTime: enterObj ? enterObj.detect_time * 1000 : '', // 进场时间（毫秒数）
            enterframeTime: enterObj ? enterObj.frame_time : '', // 进场时间（帧时间字符串：包含纳秒单位）
            // enterframeTime: enterObj ? enterObj.enterframeTime : '', // 进场时间（帧时间）
            enterVehicleId: enterObj ? enterObj.vehicle_id : '', // 进场车牌ID
            enterType: enterObj ? enterObj.open_type : '', // 进场放行方式
            enterTraceObj: enterObj ? getTraceObj(enterObj.ptWidth, enterObj.ptHeight, enterObj.point_left_top, enterObj.point_right_bottom) : { X1: 0, X2: 0, Y1: 0, Y2: 0 }, // 进场目标框
            isExit: !!exitObj, // 是否有出场数据
            exitImg: exitObj && exitObj.scene_pic ? getPicBase64(buffer, exitObj.scene_pic, jsonEndPosition) : '', // 出场原图
            exitSnapImg: exitObj && exitObj.vehicle_plate_pic ? getPicBase64(buffer, exitObj.vehicle_plate_pic, jsonEndPosition) : '', // 出场抓拍图
            exitChlId: exitObj ? exitObj.channel_id : '', // 出场通道ID
            exitChl: exitObj ? exitObj.channel_name : '', // 出场通道名称
            exitTime: exitObj ? exitObj.detect_time * 1000 : '', // 出场时间（毫秒数）
            // exitframeTime: enterObj ? enterObj.exitframeTime : '', // 进场时间（帧时间）
            exitframeTime: exitObj ? exitObj.frame_time : '', // 出场时间（帧时间字符串：包含纳秒单位）
            exitVehicleId: exitObj ? exitObj.vehicle_id : '', // 出场车牌ID
            exitType: exitObj ? exitObj.open_type : '', // 出场放行方式
            exitTraceObj: exitObj ? getTraceObj(exitObj.ptWidth, exitObj.ptHeight, exitObj.point_left_top, exitObj.point_right_bottom) : { X1: 0, X2: 0, Y1: 0, Y2: 0 }, // 出场目标框
        }
        return obj
    }

    const start = () => {
        const cmd = CMD_REALTIME_SNAP_SUBSCRIBE(config)
        ws.send(JSON.stringify(cmd))
    }

    const stop = () => {
        const cmd = CMD_REALTIME_SNAP_UNSUBSCRIBE()
        ws.send(JSON.stringify(cmd))
    }

    const destroy = () => {
        stop()
        ws.close()
    }

    return {
        start,
        stop,
        destroy,
    }
}
