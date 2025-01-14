/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-04-27 14:59:23
 * @Description: 全局类型定义
 */

import type { Action, MessageBoxState } from 'element-plus'
import type { usePlugin } from '@/utils/ocx/ocxPlugin'
import type { UserChlAuth as _UserChlAuth } from '@/hooks/useUserChlAuth'
import type { PlayerWinDataListItem, PlayerPosInfoItem, PlayerReturnsType } from '@/components/player/BaseVideoPlayer.vue'
import type { ScheduleLineReturnsType } from '@/components/BaseScheduleLine.vue'
import type { ScheduleWeekReturnsType } from '@/components/BaseScheduleWeek.vue'
import type { TimelineReturnsType } from '@/components/player/BaseTimeline.vue'
import type { LivePopReturnsType } from '@/components/player/BaseLivePop.vue'

export {}

declare global {
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

    type PluginType = ReturnType<typeof usePlugin>

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
