/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-04-27 14:59:23
 * @Description: 全局类型定义
 */

import type { Action, MessageBoxState } from 'element-plus'
import type { usePlugin } from '@/utils/ocx/ocxPlugin'
import type TVTPlayer from '@/utils/wasmPlayer/tvtPlayer'
import type { UserChlAuth as _UserChlAuth } from '@/hooks/useUserChlAuth'

export {}

declare global {
    /**
     * 语言项
     */
    // interface LangItem {
    //     id: string
    //     value: string
    // }

    // interface ImportCallOptions {
    //     query: string
    // }

    interface String {
        formatForLang: Function
        format: Function
        /**
         * @description 如果text()返回的字符串为'true',则返回true，否则为false
         * @returns {boolean}
         */
        bool: () => boolean
        /**
         * @description 将text()返回的字符串转换为数字
         * @returns {number}
         */
        num: () => number
    }

    /**
     * el-tree自定义类型
     */
    // interface Tree {
    //     id: string
    //     value?: string | number | boolean | object
    //     label: string
    //     children?: Tree[]
    //     isLeaf: boolean
    //     status?: number
    //     disabled?: boolean
    //     pId?: string
    // }

    /**
     * 日期选择器单元格数据类型
     */
    // interface DateCell {
    //     column: number
    //     customClass: string
    //     disabled: boolean
    //     end: boolean
    //     inRange: boolean
    //     row: number
    //     selected: Dayjs
    //     isCurrent: boolean
    //     isSelected: boolean
    //     start: boolean
    //     text: number
    //     timestamp: number
    //     date: Date
    //     dayjs: Dayjs
    //     type: 'normal' | 'today' | 'week' | 'next-month' | 'prev-month'
    // }

    /**
     * 系统信息
     */
    interface SystemInfo {
        platform: string
        version: string
    }

    type BrowserType = 'ie' | 'opera' | 'lowEdge' | 'edge' | 'firefox' | 'chrome' | 'safari' | 'unknow'

    /**
     * 浏览器信息
     */
    interface BrowserInfo {
        type: BrowserType
        version: string
        majorVersion: number
    }
    /**
     * 资源树下拉选中资源返回数据类型
     */
    // type ValType = String | Number | Boolean | Object | Array<String | Number | Boolean | Object>

    // type ElMessageType = 'success' | 'warning' | 'error' | 'info'

    // type ElTagType = 'success' | 'warning' | 'info' | 'danger'

    // interface ElTableFilterItem {
    //     value: any
    //     text: any
    // }

    // interface Date {
    //     format(template: string): string
    // }

    /**
     * 事件信息
     */
    // interface ChlRecEvent {
    //     chlName: string
    //     event: string
    //     eventDisplay?: string
    //     startTime: string
    //     endTime: string
    //     dataSource: string
    //     duration: string
    //     size: string
    // }
    /**
     * 全局变量
     */
    interface appGlobalProp {
        Translate: (key: string) => string
        // systemInfo: SystemInfo
        browserInfo: BrowserInfo
        serverIp: string
        LoadingTarget: Record<string, string>
        openLoading: Function
        closeLoading: Function
        notify: Function
    }

    type PluginType = ReturnType<typeof usePlugin>

    // type AlarmContentType = 'none' | 'ptz' | 'tvWall' | 'sysRec' | 'popVideo' | 'snapShot' | 'alarmOut'

    interface ConfigToolBarEvent<T> {
        type: string
        data: T
    }

    interface SearchToolBarEvent {
        searchText: string
    }

    interface ConfigComponentInstance {
        handleToolBarEvent?: (e: ConfigToolBarEvent<T>) => void
    }

    /**
     * 消息提示框配置参数类型
     */
    interface MessageTipBoxOption {
        type: 'success' | 'error' | 'info' | 'alarm' | 'question'
        title?: string
        message: string
        dangerouslyUseHTMLString?: boolean
        draggable?: boolean
        closeOnClickModal?: boolean
        closeOnPressEscape?: boolean
        showConfirmButton?: boolean
        showCancelButton?: boolean
        confirmButtonText?: string
        cancelButtonText?: string
        beforeClose?: (action: Action, instance: MessageBoxState, done: () => void) => void
    }

    interface DocumentExtends {
        webkitExitFullscreen?: () => void
        mozCancelFullScreen?: () => void
        msExitFullscreen?: () => void
        webkitRequestFullscreen: () => void
        mozRequestFullScreen: () => void
        msRequestFullscreen: () => void
    }

    interface Document extends DocumentExtends {}

    interface HTMLCanvasElement extends DocumentExtends {}

    interface HTMLDivElement extends DocumentExtends {}

    /**
     * 通用下拉列表Item类型
     */
    // interface SelectItem {
    //     value: any
    //     label: any
    // }

    interface SelectOption<T, K> {
        value: T
        label: K
    }

    interface ImageSpriteProperties {
        width: number
        height: number
    }

    interface ImageSprite {
        properties: ImageSpriteProperties
        coordinates: Record<string, number[]> // x y width height
    }

    interface PlayerInstance {
        player: TVTPlayer
        plugin: PluginType
        mode: 'h5' | 'ocx'
        ready: boolean
    }

    interface LivePopInstance {
        openLiveWin(chlId: string, chlName: string, isOnline?: boolean): void
    }

    interface TimelineInstance {
        updateChlList: (
            chlList: { chlName: string; chlId: string; records: { startTime: number; endTime: number; event: string; [key?: string]: any }[] }[],
            autoPointer: boolean,
            pageType: 'live' | 'record',
        ) => void
        play: (step: number, speed: number) => void
        stop: () => void
        getTime: () => number
        setTime: (time: number) => void
        playForward: (second: number) => void
        playBack: (second: number) => void
        setDstDayTime: (currentDayStartTime: string) => void
        setClipStart: (time?: number) => void
        setClipEnd: (time?: number) => void
        clearData: () => void
        getMaxTime: () => number
        getMinTime: () => number
        setColorMap: (colorMap: { value: string; color: string; name: string; children: string[] }[]) => void
        getTimeSplitList: () => { startTime: number; endTime: number }[]
        getMinuteSplitList: () => { startTime: number; endTime: number }[]
        getPointerTime: () => number
        getTimeRangeMask: () => [number, number]
        clearClipRange: () => void
        getDST: () => {
            hours: number
            start: number
            end: number
        }
        clearTimeRangeMask: () => void
        drawTimeRangeMask: (startTime: number, endTime: number) => void
        setMode: (modeConfig: { mode?: string; startDate?: string; monthNum?: number }, newPointerTime?: number) => void
    }

    interface ScheduleWeekInstance {
        weekdayLang: string[]
        getValue: () => [string, string][][]
        resetValue: (value: [string, string][][]) => void
        resetSameValue: (value: [string, string][]) => void
        addTimeSpan: (timeSpan: [string, string] | [number, number], days: number[]) => void
        invert: () => void
    }

    interface ScheduleLineInstance {
        getValue: () => [string, string][]
        resetValue: (newValue: Array<[string, string]> | Array<[number, number]>) => void
        addTimeSpan: (timeSpan: [string, string] | [number, number]) => void
        invert: () => void
    }

    // interface FloatErrorInstance {
    //     show: (opt: { container?: string; message?: string; type?: string }) => void
    // }

    type UserChlAuth = _UserChlAuth

    declare const natIp: string
    declare const natPort: string
    declare const natIp_2_0: string
    declare const natPort_2_0: string
}

/**
 * Vue应用实例中增加的全局属性类型定义
 */
declare module 'vue' {
    interface ComponentCustomProperties {
        Translate: (key: string) => string
    }

    interface GlobalComponents {}
}

/**
 * dayjs应用实例中增加的全局属性类型定义
 */
declare module 'dayjs' {
    export function calendar(calendarType: string): void

    export interface FormatObjectExtends {
        jalali?: boolean
    }

    export interface FormatObject extends FormatObjectExtends {}
}
