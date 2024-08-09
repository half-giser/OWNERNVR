/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 12:00:49
 * @Description: 录像与回放
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-08-09 17:35:56
 */

export class RecPlayList {
    chlId = ''
    chlName = ''
    eventList = [] as string[]
    startTime = '' // 日期格式为公历 YYYY-MM-DD HH:mm:ss
    endTime = '' // 日期格式为公历 YYYY-MM-DD HH:mm:ss
}

export class RecordStreamInfoDto {
    '@id' = ''
    name = ''
    streamType = ''
    videoEncodeType = ''
    resolution = ''
    frameRate = ''
    bitRate = ''
    level = ''
    videoQuality = ''
    bitRange: { min: number; max: number } | null = { min: 0, max: 0 }
    audio = ''
    recordStream = ''
    GOP = ''
    chlType = ''
    mainCaps = {
        // 可选的编码类型
        '@supEnct': [] as string[],
        // 可选的码率
        '@bitType': [] as string[],
        res: [] as { '@fps': string; value: string }[],
    }
    main = {
        '@enct': '',
        '@aGOP': '',
        '@mGOP': '',
    }
    an = {
        '@res': '',
        '@fps': '',
        '@QoI': '',
        '@audio': '',
        '@type': '',
        '@bitType': '',
        '@level': '',
    }
    ae = {
        '@res': '',
        '@fps': '',
        '@QoI': '',
        '@audio': '',
        '@type': '',
        '@bitType': '',
        '@level': '',
    }
    mn = {
        '@res': '',
        '@fps': '',
        '@QoI': '',
        '@audio': '',
        '@type': '',
        '@bitType': '',
        '@level': '',
    }
    me = {
        '@res': '',
        '@fps': '',
        '@QoI': '',
        '@audio': '',
        '@type': '',
        '@bitType': '',
        '@level': '',
    }
    mainStreamQualityCaps: { '@enct': string; '@res': string; '@digitalDefault': string; '@analogDefault': string; value: string[] }[] = []
    levelNote: string[] = []
    bitType = ''
    supportAudio = false
    // 码率可选范围
    qualitys = [] as { value: string; label: string }[]
    // 帧率可选范围
    frameRates = [] as { value: string; label: string }[]
    resolutions = [] as { value: string; label: string }[]
    // 元素禁用
    rowDisable = false
    videoEncodeTypeDisable = false
    resolutionDisable = false
    frameRateDisable = false
    bitTypeDisable = false
    imageLevelDisable = false
    videoQualityDisable = false
    bitRangeDisable = false
    audioDisable = false
    GOPDisable = false
    // recordStream可能没用
    recordStreamDisable = false

    bitTypeVisible = true
}
