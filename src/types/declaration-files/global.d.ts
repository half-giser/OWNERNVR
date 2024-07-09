/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-04-27 14:59:23
 * @Description: 全局类型定义
 */

import type { Action, MessageBoxState } from 'element-plus'
import type usePlugin from '@/utils/ocx/ocxPlugin'
import type TVTPlayer from '@/utils/wasmPlayer/tvtPlayer'
// import dayjs from 'dayjs'

export {}

declare global {
    /**
     * 语言项
     */
    interface LangItem {
        id: string
        value: string
    }

    interface ImportCallOptions {
        query: string
    }

    interface String {
        formatForLang: Function
        format: Function
        toBoolean: () => boolean
    }
    /**
     * el-tree自定义类型
     */
    interface Tree {
        id: string
        value?: string | number | boolean | object
        label: string
        children?: Tree[]
        isLeaf: boolean
        status?: number
        disabled?: boolean
        pId?: string
    }
    /**
     * 日期选择器单元格数据类型
     */
    interface DateCell {
        column: number
        customClass: string
        disabled: boolean
        end: boolean
        inRange: boolean
        row: number
        selected: Dayjs
        isCurrent: boolean
        isSelected: boolean
        start: boolean
        text: number
        timestamp: number
        date: Date
        dayjs: Dayjs
        type: 'normal' | 'today' | 'week' | 'next-month' | 'prev-month'
    }
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
    type ValType = String | Number | Boolean | Object | Array<String | Number | Boolean | Object>

    type ElMessageType = 'success' | 'warning' | 'error' | 'info'

    type ElTagType = 'success' | 'warning' | 'info' | 'danger'

    interface ElTableFilterItem {
        value: any
        text: any
    }

    interface Date {
        format(template: string): string
    }
    /**
     * 事件信息
     */
    interface ChlRecEvent {
        chlName: string
        event: string
        eventDisplay?: string
        startTime: string
        endTime: string
        dataSource: string
        duration: string
        size: string
    }
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

    type AlarmContentType = 'none' | 'ptz' | 'tvWall' | 'sysRec' | 'popVideo' | 'snapShot' | 'alarmOut'

    interface ConfigToolBarEvent<T> {
        type: string
        data: T
    }
    interface ChannelToolBarEvent {
        searchText: string
    }

    /**
     * 消息提示框配置参数类型
     */
    interface MessageTipBoxOption {
        type: 'success' | 'error' | 'info' | 'alarm' | 'question'
        title: string
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
    interface SelectItem {
        value: any
        label: any
    }

    interface SelectOption<T, K> {
        value: T
        label: K
    }

    interface ImageSpriteCoordinatesItem {
        x: number
        y: number
        width: number
        height: number
    }

    interface ImageSpriteProperties {
        width: number
        height: number
    }

    interface ImageSprite {
        properties: ImageSpriteProperties
        coordinates: Record<string, ImageSpriteCoordinatesItem>
    }

    interface PlayerInstance {
        player: TVTPlayer
        plugin: PluginType
        mode: 'h5' | 'ocx'
        ready: boolean
    }

    interface LivePopInstance {
        openLiveWin(chlId: string, chlName: string, chlIndex: string, chlType: string, isOnline?: boolean): void
    }

    /**
     * 通用的日期选择选项卡组件选中日期后的日期信息
     */
    interface SelectedDateInfo {
        startTimeFormat: string
        endTimeFormat: string
        oneWeekFirstDayFormat: string
        oneWeekLastDayFormat: string
        oneMonthFirstDayFormat: string
        oneMonthLastDayFormat: string
        startTimeFormatForCalc: string
        endTimeFormatForCalc: string
        oneWeekFirstDayFormatForCalc: string
        oneWeekLastDayFormatForCalc: string
        oneMonthFirstDayFormatForCalc: string
        oneMonthLastDayFormatForCalc: string
        currentDateIndex: string
        selectedDateForShow: string
        selectedDateForLabel: string
    }
}

/**
 * Vue应用实例中增加的全局属性类型定义
 */
declare module 'vue' {
    interface ComponentCustomProperties {
        Translate: (key: string) => string
    }
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
