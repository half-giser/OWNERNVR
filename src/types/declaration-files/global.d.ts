/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-04-27 14:59:23
 * @Description: 全局类型定义
 */

import type { Action, MessageBoxState } from 'element-plus'
import type { PluginType as _PluginType } from '@/utils/ocx/ocxPlugin'
import type { UserChlAuth as _UserChlAuth } from '@/hooks/useUserChlAuth'
import type { PlayerWinDataListItem, PlayerPosInfoItem, PlayerReturnsType } from '@/components/player/BaseVideoPlayer.vue'
import type { ScheduleLineReturnsType } from '@/components/BaseScheduleLine.vue'
import type { ScheduleWeekReturnsType } from '@/components/BaseScheduleWeek.vue'
import type { TimelineReturnsType } from '@/components/player/BaseTimeline.vue'
import type { LivePopReturnsType } from '@/components/player/BaseLivePop.vue'

export {}

declare global {
    interface String {
        formatForLang: (...args: (string | number)[]) => string
        format: (...args: (string | number)[]) => string
        /**
         * @description 如果text()/attr()返回的字符串为'true',则返回true，否则为false
         * @returns {boolean}
         */
        bool: () => boolean
        /**
         * @description 将text()/attr()返回的字符串转换为数字. 如果为空字符串，则返回0
         * @returns {number}
         */
        num: () => number
        /**
         * @description 将text()/attr()返回的字符串转换为字符串数组
         * @param {string} seperator 分隔符，默认为','
         * @returns {string[]}
         */
        array: (seperator?: string) => string[]
        /**
         * @description text()/attr()若为空字符串时，返回undefined，否则返回原字符串
         * @returns {string | undefined}
         */
        undef: () => string | undefined
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

    interface TableColumn<T> {
        row: T
        column: any
        $index: number
    }

    type PluginType = _PluginType

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

    interface SelectOption<T, K> {
        value: T
        label: K
        disabled?: boolean
        options?: SelectOption<T, K>[]
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
        player: PlayerReturnsType
        plugin: PluginType
        mode: 'h5' | 'ocx'
        ready: boolean
    }

    type TVTPlayerWinDataListItem = PlayerWinDataListItem

    type TVTPlayerPosInfoItem = PlayerPosInfoItem

    interface LivePopInstance {
        openLiveWin(chlId: string, chlName: string, isOnline?: boolean): void
    }

    type LivePopInstance = LivePopReturnsType

    type TimelineInstance = TimelineReturnsType

    type ScheduleWeekInstance = ScheduleWeekReturnsType

    type ScheduleLineInstance = ScheduleLineReturnsType

    type UserChlAuth = _UserChlAuth

    declare const natIp: string
    declare const natPort: string
    declare const natIp_2_0: string
    declare const natPort_2_0: string
    // declare const OCX_PLUGIN: undefined | PluginType

    interface WindowExtends {
        __RUNTIME_OCX_PLUGIN__: undefined | _PluginType
    }

    interface Window extends WindowExtends {}
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
