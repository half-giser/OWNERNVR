<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-05 13:35:57
 * @Description: 多分屏WASM播放器控件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-13 19:27:18
-->
<template>
    <div
        ref="$screen"
        class="VideoPlayerScreen"
        :class="{
            'dblclick-to-full': dblclickToFull,
        }"
        @mousewheel="handleMouseWheel"
        @DOMMouseScroll="handleMouseWheel"
    >
        <div
            v-for="(item, key) in pageData"
            :key
            class="item"
            :class="{
                selected: selectedWinIndex === key,
                'full-target': fullTarget === key,
            }"
            :draggable="item.draggable"
            :data-position="item.position"
            :data-split="splitValue"
            @contextmenu.prevent="handleContextMenu"
            @mousedown="handleMouseDown($event, key)"
            @mouseover="handleMouseOver(key)"
            @mouseout="handleMouseOut(key)"
            @dblclick="handleDoubleClick($event, key)"
            @dragstart="handleDragStart(key)"
            @dragover="handleDragOver($event)"
            @drop="handleDrop(key)"
        >
            <!-- 视频丢失提示层
                （VideoLossLogo.png存在时显示videoloss-wrap：Logo+错误码，
                否则只显示error-tips-info：错误码） 
            -->
            <div
                v-if="isVideoLossWrap"
                v-show="item.isVideolossWrapVisible"
                class="videoloss"
                :style="{
                    zIndex: item.isVideolossWrapVisible ? 2 : 0,
                }"
            >
                <!-- 视频丢失logo -->
                <img
                    class="videoloss-logo"
                    :src="lossLogo"
                />
                <!-- 视频丢失logo下方显示错误码 -->
                <div class="videoloss-tips">{{ item.videolossText }}</div>
            </div>
            <div class="play">
                <canvas class="play-canvas"></canvas>
            </div>
            <div class="overlay">
                <div class="osd">
                    <BaseImgSprite
                        class="osd-icon"
                        file="inteligenceState"
                        :class="{
                            hide: !item.isInteligenceIcon,
                            invisible: !item.isInteligenceIconVisible,
                        }"
                    />
                    <BaseImgSprite
                        class="osd-icon"
                        file="motionState"
                        :class="{
                            hide: !item.isMotionIcon,
                            invisible: !item.isMotionIconVisible,
                        }"
                    />
                    <BaseImgSprite
                        class="osd-icon"
                        :file="item.recordIconStatus"
                        :class="{
                            invisible: !item.isRecordIconVisible,
                            hide: item.recordIconStatus === 'none' || !item.isRecordIcon,
                        }"
                        :data-event="item.recordIconStatus"
                    />
                    <BaseImgSprite
                        class="osd-icon"
                        file="ptz (2)"
                        :class="{
                            hide: !item.isPtzIcon,
                        }"
                    />
                    <BaseImgSprite
                        class="osd-icon"
                        :file="`ZoomState__${item.zoomIconData}`"
                        :class="{
                            hide: item.zoomIconData === 1 || !item.isZoomIcon,
                        }"
                        :data-zoom="item.zoomIconData"
                    />
                    <BaseImgSprite
                        class="osd-icon"
                        file="AudioState"
                        :class="{
                            hide: !item.isAudioIcon,
                        }"
                    />
                </div>
                <div
                    class="watermark"
                    :class="{
                        hide: !item.isWatermarkInfo,
                    }"
                >
                    {{ item.watermarkInfo }}
                </div>
            </div>
            <div
                class="pos"
                :style="{
                    width: `${item.posPosition.width}px`,
                    height: `${item.posPosition.width}px`,
                    top: `${item.posPosition.width}px`,
                    left: `${item.posPosition.width}px`,
                }"
                :class="{
                    hide: !item.isPos,
                }"
            >
                <span
                    v-for="(posItem, posKey) in item.posList"
                    :key="posKey"
                    :style="{ color: posItem.color }"
                    class="pos-item"
                    >{{ posItem.text }}</span
                >
            </div>
            <div
                class="chlip"
                :class="{
                    hide: !item.isChlIp,
                    invisible: !item.isChlIpVisible,
                }"
            >
                {{ item.chlIpInfo }}
            </div>
            <canvas class="draw"></canvas>
            <div
                class="error"
                :class="{
                    hide: !item.isErrorTips || (isVideoLossWrap && item.isVideolossWrapVisible),
                    mask: item.errorTipsText === 'none',
                }"
            >
                <div class="error-chl-name">{{ item.errorTipsChlName }}</div>
                <!-- 播放错误码提示层 -->
                <div class="error-tips">{{ item.errorTipsText === 'none' ? '' : item.errorTipsText }}</div>
            </div>
        </div>
        <div
            v-if="!onlyWasm && mode !== 'h5'"
            class="ocx"
        >
            <BasePluginPlayer :is-update-pos="prop.ocxUpdatePos" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import BasePluginPlayer from '../ocx/BasePluginPlayer.vue'
import VideoPlayer, { type TVTPlayerWinDataListItem, type TVTPlayerPosInfoItem } from '@/utils/wasmPlayer/tvtPlayer'
import { downloadFromBase64, Uint8ArrayToStr } from '@/utils/tools'
import { useLangStore } from '@/stores/lang'
import type WebGLPlayer from '@/utils/wasmPlayer/webglPlayer'
import { type WasmPlayerVideoFrame } from '@/utils/wasmPlayer/wasmPlayer'
import BaseImgSprite from '../sprite/BaseImgSprite.vue'
const Plugin = inject('Plugin') as PluginType

const pluginStore = usePluginStore()

const prop = withDefaults(
    defineProps<{
        /**
         * @description 是否只显示WASM播放器
         */
        onlyWasm?: boolean
        /**
         * @param 播放类型
         */
        type?: 'record' | 'live'
        /**
         * @param 初始分屏数. 只支持1/4分屏
         */
        split?: number
        /**
         * @param 允许pos数据
         */
        enablePos?: boolean
        /**
         * @param 是否显示视频丢失logo
         */
        showVideoLoss?: boolean
        /**
         * @param 是否向插件发送位置数据
         */
        ocxUpdatePos?: boolean
    }>(),
    {
        onlyWasm: false,
        type: 'live',
        split: 1,
        enablePos: false,
        ocxUpdatePos: true,
    },
)

const emits = defineEmits<{
    /**
     * @description 组件初始化后执行
     */
    (e: 'onready'): void
    /**
     * @description 播放器初始化成功后执行
     */
    (e: 'onsuccess', winIndex: number, item: TVTPlayerWinDataListItem): void
    /**
     * @description
     */
    (e: 'onplayStatus', items: TVTPlayerWinDataListItem[]): void
    /**
     * @description
     */
    (e: 'ontime', winIndex: number, item: TVTPlayerWinDataListItem, showTimestamp: number): void
    /**
     * @description
     */
    (e: 'onstop', winIndex: number, item: TVTPlayerWinDataListItem): void
    /**
     * @description
     */
    (e: 'onplayComplete', winIndex: number, item: TVTPlayerWinDataListItem): void
    /**
     * @description
     */
    (e: 'onrecordFile', recordBuf: ArrayBuffer, item: TVTPlayerWinDataListItem, recordStartTime: number): void
    // onpos: () => void
    /**
     * @description 失败回调
     */
    (e: 'onerror', winIndex: number, item: TVTPlayerWinDataListItem, reason?: string): void
    /**
     * @description 选中视窗后回调
     */
    (e: 'onselect', winIndex: number, item: TVTPlayerWinDataListItem): void
    /**
     * @description 视窗位置交换后回调
     */
    (e: 'onwinexchange', oldWinIndex: number, newWinIndex: number): void
    /**
     * @description 双击分屏后分屏变化的回调
     */
    (e: 'ondblclickchange', winIndex: number, newSplit: number): void
    /**
     * @description 组件销毁时回调
     */
    (e: 'ondestroy'): void
}>()

const $screen = ref<HTMLDivElement>()
const { Translate } = useLangStore()

const MAUNUAL_CHLIDREN = ['manual']
const REC_CHLIDREN = ['sensor', 'gsensor']
const INTELIGENCE_CHLIDREN = ['vfd', 'face_verity', 'vehicle_plate_verity', 'smart_plate_verity', 'tripwire', 'perimeter', 'aoi_entry', 'aoi_leave', 'osc', 'avd', 'cdd', 'temperature', 'fire_point']
const MOTION_CHLIDREN = ['motion', 'SMDHuman', 'SMDVehicle']
const POS_CHLIDREN = ['pos']
const SCHEDULE_CHLIDREN = ['schedule']

/**
 * @const 回放事件和对应图标展示映射(图标顺序按优先级从高到低排列)
 */
const REC_EVENT_ICON_MAP: { icon: string; events: string[] }[] = [
    { icon: 'rec_manual', events: MAUNUAL_CHLIDREN },
    { icon: 'rec', events: REC_CHLIDREN },
    {
        icon: 'rec_inteligence',
        events: INTELIGENCE_CHLIDREN,
    },
    { icon: 'rec_motion', events: MOTION_CHLIDREN },
    { icon: 'rec_pos', events: POS_CHLIDREN },
    { icon: 'rec_schedule', events: SCHEDULE_CHLIDREN },
]

/**
 * @var 正在报警的AI类型
 */
const ALARMING_INTELIGENCE: Record<number, Record<string, boolean>> = {} // 正在报警的AI类型

const MAX_SPLIT = 4
const zoomList = [1, 1.5, 2, 3, 4, 6, 8, 9, 12, 16]

let isMouseInScreen = false // 鼠标是否悬浮在视频框
let is3DControl = false // 是否正在执行3D移动
let isHoldDownMouse = false // 是否处于鼠标按住左键或右键且不滑动状态（使用3D功能放大、缩小）
let downMouseTimer: NodeJS.Timeout | 0 = 0 // 鼠标按住左键或右键不滑动定时器

const pollIndex: number[] = [] // 通道组 轮询 的窗口集

const posBaseSize = {
    // pos绘制画布基准宽高
    width: 704,
    height: 480,
}
const lossLogo = ref('')
const posTimeoutTimer: Record<number, NodeJS.Timeout | 0> = {} // 对象方便控制多个窗口
const posNextPage: Record<string, boolean> = {}
const fullTarget = ref(-1)
const splitValue = ref(1)
const selectedWinIndex = ref(0) // 当前选中窗口
const isVideoLossWrap = ref(true) // 是否显示视频丢失logo
const dblclickToFull = ref(false) // 整屏状态
const pageData = ref(
    Array(MAX_SPLIT)
        .fill(0)
        .map((item, index) => ({
            key: item ? item : index,
            position: index,
            draggable: false,
            zoomIndex: 0, // 窗口号和窗口缩放索引的映射
            isZoom3D: false, // 3D功能开关
            isZoomIcon: true,
            zoomIconData: zoomList[0],
            isAudioIcon: false,
            isPtzIcon: false,
            isInteligenceIcon: false,
            isInteligenceIconVisible: true,
            isMotionIcon: false,
            isMotionIconVisible: true,
            isRecordIcon: true,
            isRecordIconVisible: true,
            recordIconStatus: 'none',
            isChlIp: false,
            isChlIpVisible: true,
            chlIpInfo: '',
            isVideolossWrapVisible: false,
            videolossText: '',
            isWatermarkInfo: false,
            watermarkInfo: '',
            isErrorTips: false,
            errorTipsText: '',
            errorTipsChlName: '',
            posList: [] as { color: string; text: string }[],
            isPos: false,
            displayPosition: {
                x: -1,
                y: -1,
                width: -1,
                height: -1,
            },
            posPosition: {
                top: 0,
                left: 0,
                width: 0,
                height: 0,
            },
        })),
)

/**
 * @description 根据录像类型列表获取
 * @param {Array} events
 */
const getIconByEvents = (events: string[]) => {
    const find = REC_EVENT_ICON_MAP.find((item) => {
        return item.events.find((item2) => events.includes(item2))
    })

    return find?.icon || ''
}

/**
 * @description 视频区域禁用右键弹出菜单栏
 */
const handleContextMenu = () => {
    return false
}

/**
 * @description 鼠标按下事件（1: 分屏画面放大状态时, 可拖拽移动  2: 3D移动）
 * @param {MouseEvent} e
 * @param {number} winIndex
 */
const handleMouseDown = (e: MouseEvent, winIndex: number) => {
    isMouseInScreen = true
    const currIndex = getSelectedWinIndex()
    if (winIndex === currIndex && pageData.value[winIndex].isZoom3D) {
        isHoldDownMouse = true
        setTimeout(() => {
            if (!isHoldDownMouse) return
            clearInterval(downMouseTimer)
            downMouseTimer = 0
            downMouseTimer = setInterval(() => {
                const mouseType = e.buttons === 1 ? 'left' : e.buttons === 2 ? 'right' : 'other' // buttons 1: 左键, 2: 右键
                if (!isHoldDownMouse || mouseType === 'other') {
                    clearInterval(downMouseTimer)
                    downMouseTimer = 0
                    return
                }
                player.screen.setZoom(winIndex, mouseType === 'right' ? 'ZoomIn' : 'ZoomOut', 1, 'control')
            }, 100)
        }, 1000)
        is3DControl = true // 画矩形 3D放大、缩小

        const startX = e.offsetX
        const startY = e.offsetY
        let endX = 0
        let endY = 0
        let rectWidth = 0
        let rectHeight = 0

        // 鼠标按下情况下移动
        const handle3DControlMouseMove = (e: MouseEvent) => {
            // 若是已启用downMouseTimer计时器, 则不处理isHoldDownMouse状态（反之置为false）
            if (!downMouseTimer) {
                isHoldDownMouse = false
            }
            endX = e.offsetX
            endY = e.offsetY
            rectWidth = endX - startX
            rectHeight = endY - startY
        }

        // 鼠标松开
        const handle3DControlMouseUp = () => {
            player.screen.setZoom(winIndex, 'StopAction', 1, 'stop')
            isHoldDownMouse = false
            document.removeEventListener('mousemove', handle3DControlMouseMove)
            document.removeEventListener('mouseup', handle3DControlMouseUp)
            // 避免单击也触发3d移动
            if (Math.abs(rectWidth) < 3 || Math.abs(rectHeight) < 3) {
                is3DControl = false
                return
            }
            const rect = {
                startX: startX,
                startY: startY,
                endX: endX,
                endY: endY,
                centerX: Math.floor(startX + rectWidth / 2),
                centerY: Math.floor(startY + rectHeight / 2),
                width: Math.floor(Math.abs(rectWidth)),
                height: Math.floor(Math.abs(rectHeight)),
            }
            const location = get3DParam(winIndex, rect)
            player.screen.setMagnify3D(
                winIndex,
                '',
                () => {
                    setTimeout(() => {
                        is3DControl = false
                    }, 200)
                },
                location,
            )
        }

        document.addEventListener('mousemove', handle3DControlMouseMove)
        document.addEventListener('mouseup', handle3DControlMouseUp)
    } else {
        if (selectedWinIndex.value !== winIndex) {
            selectedWinIndex.value = winIndex
            player.screen.onselect && player.screen.onselect(winIndex)
        }
        if (pageData.value[winIndex].zoomIndex === 0) {
            return
        }
        document.body.style.setProperty('cursor', 'grab')
        document.body.style.setProperty('user-select', 'none')

        let throttleTimer: NodeJS.Timeout | 0 = 0 // 防抖定时器
        const mouseDownX = e.screenX
        const mouseDownY = e.screenY

        const handleScreenDragMouseMove = (e: MouseEvent) => {
            const webglData = player.screen.getZoomCallback(winIndex)
            const offsetX = e.screenX - mouseDownX
            const offsetY = e.screenY - mouseDownY
            const newLeft = (webglData.left | 0) + offsetX
            const newBottom = (webglData.bottom | 0) - offsetY
            if (throttleTimer) return false
            throttleTimer = setTimeout(() => {
                player.screen.setZoomCallback(winIndex, newLeft, newBottom, webglData.viewWidth, webglData.viewHeight)
                fixPlayCavPosition(winIndex)
                throttleTimer = 0
            }, 100)
        }

        const handleScreenDragMouseUp = () => {
            document.removeEventListener('mousemove', handleScreenDragMouseMove)
            document.removeEventListener('mouseup', handleScreenDragMouseUp)
            document.body.style.setProperty('cursor', 'default')
            document.body.style.setProperty('user-select', 'unset')
        }

        document.addEventListener('mousemove', handleScreenDragMouseMove)
        document.addEventListener('mouseup', handleScreenDragMouseUp)
    }
}

/**
 * @description 鼠标进入事件
 * @param {number} winIndex
 */
const handleMouseOver = (winIndex: number) => {
    if (selectedWinIndex.value === winIndex) {
        isMouseInScreen = true
    }
}

/**
 * @description 鼠标离开事件
 * @param {number} winIndex
 */
const handleMouseOut = (winIndex: number) => {
    if (selectedWinIndex.value === winIndex) {
        isMouseInScreen = false
    }
}

/**
 * @description 3D功能滚轮放大缩小
 * @param {Event} e
 */
const handleMouseWheel = (e: Event) => {
    if (mode.value === 'ocx') return
    const winIndex = selectedWinIndex.value
    // 开启3D功能后, 禁用全局滚动条
    if (pageData.value[winIndex].isZoom3D) {
        e.preventDefault()
        e.stopPropagation()
    }
    const currIndex = getSelectedWinIndex()
    if (!isMouseInScreen || (winIndex === currIndex && !pageData.value[winIndex].isZoom3D) || is3DControl) return
    is3DControl = true
    const wheel = (e as any).originalEvent.wheelDelta || -(e as any).originalEvent.detail // IE、chrome监听wheelDelta, 火狐监听detail
    const delta = Math.max(-1, Math.min(1, wheel))
    const zoom3DType = delta < 0 ? 'zoom3DIn' : 'zoom3DOut' // 缩小 放大
    player.screen.setMagnify3D(
        winIndex,
        zoom3DType,
        () => {
            setTimeout(() => {
                is3DControl = false
            }, 200)
        },
        false,
    )
}

/**
 * @description 双击某一分屏执行单分屏或还原
 * @param {MouseEvent} e
 * @param winIndex
 */
const handleDoubleClick = (e: MouseEvent, winIndex: number) => {
    console.log('double click', fullTarget.value, winIndex)
    if (pageData.value[winIndex].isZoom3D) {
        // 3D功能状态
        const rect = {
            startX: e.offsetX,
            startY: e.offsetY,
            endX: e.offsetX,
            endY: e.offsetY,
            centerX: e.offsetX,
            centerY: e.offsetY,
            width: 0,
            height: 0,
        }
        const location = get3DParam(winIndex, rect)
        player.screen.setMagnify3D(
            winIndex,
            '',
            () => {
                setTimeout(() => {
                    is3DControl = false
                }, 200)
            },
            location,
        )
    }
    // 还原为原来的分屏显示
    else if (fullTarget.value === winIndex) {
        // console.log('reset', fullTarget.value)
        fullTarget.value = -1
        dblclickToFull.value = false
        // splitValue.value = prop.split
        // setSplit(splitValue.value, true)
        player.screen.ondblclickchange && player.screen.ondblclickchange(-1, -1)
    }
    // 双击的分屏单分屏显示
    else if (splitValue.value > 1) {
        // console.log('fullscreen', fullTarget.value)
        fullTarget.value = winIndex
        dblclickToFull.value = true
        // splitValue.value = 1
        // setSplit(splitValue.value, true)
        player.screen.ondblclickchange && player.screen.ondblclickchange(fullTarget.value, pageData.value[fullTarget.value].position)
    }
}

let isDrag = false
let oldDragIndex = -1

/**
 * @description 拖拽分屏窗口互换位置
 * @param {number} winIndex
 */
const handleDragStart = (winIndex: number) => {
    isDrag = true
    oldDragIndex = winIndex
}

/**
 * @description 拖拽过程
 * @param {Event} e
 */
const handleDragOver = (e: Event) => {
    e.preventDefault()
}

/**
 * @description 拖拽松开执行分屏窗口互换位置
 * @param {number} newWinIndex
 */
const handleDrop = (newWinIndex: number) => {
    if (!isDrag) return
    isDrag = false
    if (newWinIndex === oldDragIndex) return
    // 开启通道组轮询后，拖拽涉及轮询的窗口则拖拽失效
    if (pollIndex.length > 0) {
        if (pollIndex.indexOf(oldDragIndex) > -1 || pollIndex.indexOf(newWinIndex) > -1) return
    }

    const oldIndexPosition = pageData.value[oldDragIndex].position
    const newIndexPosition = pageData.value[newWinIndex].position
    pageData.value[oldDragIndex].position = newIndexPosition
    pageData.value[newWinIndex].position = oldIndexPosition
    console.log(pageData.value)

    // TODO 测试时效果没问题
    // 元素互换位置由逻辑/DOM结构上互换，变更为仅UI坐标互换，逻辑排序不变

    // 元素互换位置
    // var $oldTemp = $('<span></span>')
    // var $newTemp = $('<span></span>')
    // var $old = $('.screen-item__wrap', self.$el).eq(oldWinIndex)
    // var $new = $('.screen-item__wrap', self.$el).eq(newWinIndex)
    // $old.before($oldTemp)
    // $new.before($newTemp)
    // $old.attr("winindex", newWinIndex);
    // $new.attr("winindex", oldWinIndex);
    // $old.find('.play-video-cav').attr('id', '__PlayVideoCav__' + newWinIndex)
    // $new.find('.play-video-cav').attr('id', '__PlayVideoCav__' + oldWinIndex)
    // $old.find('.video-draw-board-cav').attr('id', '__VideoDrawBoardCav__' + newWinIndex)
    // $new.find('.video-draw-board-cav').attr('id', '__VideoDrawBoardCav__' + oldWinIndex)
    // $oldTemp.replaceWith($new)
    // $newTemp.replaceWith($old)

    // zoomIndexMap互换数据
    // const oldIndexZoom = zoomIndexMap[oldWinIndex]
    // const newIndexZoom = zoomIndexMap[newWinIndex]
    // zoomIndexMap[oldWinIndex] = newIndexZoom
    // zoomIndexMap[newWinIndex] = oldIndexZoom
    player.exchangWin(oldDragIndex, newIndexPosition, newWinIndex, oldIndexPosition)
    nextTick(() => {
        player.screen.onwinexchange(oldDragIndex, newWinIndex)
    })
}

/**
 * @description 只改变样式
 */
const selectWin = (winIndex: number) => {
    selectedWinIndex.value = winIndex
    // $screen.value[children].
    // winIndex.mousedown().mouseup()
}

/**
 * @description 根据位置Index获取窗口Index
 * @param positionIndex
 * @returns {number}
 */
const getWinIndexByPosition = (positionIndex: number) => {
    const findIndex = pageData.value.findIndex((item) => item.position === positionIndex)
    return findIndex
}

/**
 * @description 设置分屏元素宽高
 */
const setItemSize = () => {
    // TODO 这里改为CSS设置，测试似乎没问题
    // var row = Math.sqrt(this.split)
    // var precent = row / this.split
    // 取真实的border宽度(如缩放浏览器后, 即使设置border为1px, 最小宽度仍是1.111px)
    // 火狐不支持border-width, 这里取border-left-width做兼容
    // var borderWith = Math.ceil($('.screen-item__wrap', this.$el).css('border-left-width').replace(/[a-z]/g, '') * 2)
    // var width = precent * this.elWidth - row * borderWith * precent
    // var height = precent * this.elHeight - row * borderWith * precent
    // $('.screen-item__wrap, .overlay-osd-wrap, .play-video-wrap', this.$el).width(width).height(height)
    // $('.play-video-cav, .video-draw-board-cav', this.$el).attr('width', width).attr('height', height)

    for (let i = 0; i < MAX_SPLIT; i++) {
        setPlayCavItemSize(i)
        fixPlayCavPosition(i)
        setPosWrapSize(i)
    }
}

/**
 * @description 设置播放画布canvas元素css宽高
 * @param {number} winIndex
 */
const setPlayCavItemSize = (winIndex: number) => {
    const $playWrapItem = getVideoWrapDiv(winIndex)
    const { width, height } = $playWrapItem.getBoundingClientRect()

    const playCav = getVideoCanvas(winIndex)
    playCav.width = width
    playCav.height = height
    playCav.style.width = width + 'px'
    playCav.style.height = height + 'px'

    const drawCav = getOverlayCanvas(winIndex)
    drawCav.width = width
    drawCav.height = height
    drawCav.style.width = width + 'px'
    drawCav.style.height = height + 'px'

    if (!player.screen.getZoomCallback || !player.screen.getZoomCallback(winIndex)) return
    const zoom = zoomList[pageData.value[winIndex].zoomIndex]
    const webglData = player.screen.getZoomCallback(winIndex)
    player.screen.setZoomCallback(winIndex, webglData.left, webglData.bottom, width * zoom, height * zoom)
    fixPlayCavPosition(winIndex)
}

/**
 * @description 设置分屏
 * @param {number} split
 * @param {boolean} isDblClickSplit
 */
const setSplit = (split: number) => {
    splitValue.value = split

    if (dblclickToFull.value) {
        // 如果不是双击事件调用，则去掉双击事件绑定的类名
        dblclickToFull.value = false
        fullTarget.value = -1
        player.screen.ondblclickchange && player.screen.ondblclickchange(-1, -1)
    }

    if (split > 1) {
        for (let i = 0; i < split; i++) {
            if (pageData.value[i].zoomIndex === 0) {
                // 只有非放大状态模式的窗口才能拖拽
                pageData.value[i].draggable = true
            }
        }
    } else {
        pageData.value.forEach((item) => {
            item.draggable = false
        })
    }
    nextTick(() => {
        resize()
    })
}

/**
 * @description 获取分屏数
 */
const getSplit = () => {
    return splitValue.value
}

/**
 * 根据窗口索引获取单个窗口宽高
 * @param {number} winIndex
 */
const getItemSize = (winIndex: number) => {
    const { width, height } = $screen.value!.children[winIndex].getBoundingClientRect()
    return {
        width,
        height,
    }
}

/**
 * @description 根据窗口索引设置视频容器父元素宽高
 * @param {number} winIndex
 * @param {number} width
 * @param {number} height
 */
const setVideoDivSize = (winIndex: number, width: number, height: number) => {
    const $item = getVideoWrapDiv(winIndex)
    $item.style.width = width + 'px'
    $item.style.height = height + 'px'
    nextTick(() => {
        setPlayCavItemSize(winIndex)
    })
}

/**
 * @description 根据窗口索引重置视频容器父元素宽高
 * @param {number} winIndex
 */
const resetVideoDivSize = (winIndex: number) => {
    const $item = getVideoWrapDiv(winIndex)
    $item.style.width = '100%'
    $item.style.height = '100%'
    nextTick(() => {
        setPlayCavItemSize(winIndex)
    })
}

/**
 * @description 根据窗口索引获取视频画面canvas的父容器div元素
 * @param {number} winIndex
 */
const getVideoWrapDiv = (winIndex: number) => {
    return $screen.value!.children[winIndex].querySelector('.play') as HTMLDivElement
}

/**
 * @description 根据窗口索引获取视频画面canvas元素
 * @param {number} winIndex
 */
const getVideoCanvas = (winIndex: number) => {
    return $screen.value!.children[winIndex].querySelector('.play-canvas') as HTMLCanvasElement
}

/**
 * @description 根据窗口索引获取视频覆盖层canvas元素
 * @param {number} winIndex
 */
const getOverlayCanvas = (winIndex: number) => {
    return $screen.value!.children[winIndex].querySelector('.draw') as HTMLCanvasElement
}

/**
 * @description 抓图
 * @param {WasmPlayerVideoFrame} frame 当前视频帧
 * @param {WebGLPlayer} player webgl播放器
 * @param {string} fileName 文件名
 */
const snap = (frame: WasmPlayerVideoFrame, player: typeof WebGLPlayer, fileName: string) => {
    const canvas = document.createElement('canvas')
    canvas.width = frame.width
    canvas.height = frame.height
    const webglPlayer = new player(canvas, {
        preserveDrawingBuffer: false,
    })
    const buffer = new Uint8Array(frame.buffer)
    const videoBuffer = buffer.slice(0, frame.yuvLen)
    const yLength = frame.width * frame.height
    const uvLength = (frame.width / 2) * (frame.height / 2)
    webglPlayer.renderFrame(videoBuffer, frame.width, frame.height, yLength, uvLength)
    const dataURL = canvas.toDataURL('image/bmp', 1)
    downloadFromBase64(dataURL, fileName + '.bmp')
}

/**
 * @description 根据倍数值放大
 * @param {number} winIndex
 * @param {number} zoomValue 放大值
 */
const zoom = (winIndex: number, zoomValue: number) => {
    if (zoomValue < zoomList[0] || zoomValue > zoomList[zoomList.length - 1]) {
        return
    }
    const zoomBefore = zoomList[pageData.value[winIndex].zoomIndex]
    pageData.value[winIndex].zoomIndex = zoomList.indexOf(zoomValue)
    setPlayCavPosition(winIndex, zoomValue / zoomBefore)
    setZoomIcon(winIndex, zoomValue)
}

/**
 * @description 画面放大
 * @param {number} winIndex
 */
const zoomOut = (winIndex: number) => {
    const zoomIndex = pageData.value[winIndex].zoomIndex
    if (zoomIndex === zoomList.length - 1) return
    const zoomBefore = zoomList[pageData.value[winIndex].zoomIndex]
    pageData.value[winIndex].zoomIndex++
    const zoomAfter = zoomList[pageData.value[winIndex].zoomIndex]
    setPlayCavPosition(winIndex, zoomAfter / zoomBefore)
    setZoomIcon(winIndex, zoomAfter)
}

/**
 * @description 画面缩小
 * @param {number} winIndex
 */
const zoomIn = (winIndex: number) => {
    const zoomIndex = pageData.value[winIndex].zoomIndex
    if (zoomIndex === 0) return
    const zoomBefore = zoomList[pageData.value[winIndex].zoomIndex]
    pageData.value[winIndex].zoomIndex--
    const zoomAfter = zoomList[pageData.value[winIndex].zoomIndex]
    setPlayCavPosition(winIndex, zoomAfter / zoomBefore)
    setZoomIcon(winIndex, zoomAfter)
}

/**
 * @description 3D功能
 * @param {number} winIndex
 * @param {boolean} status
 */
const zoom3D = (winIndex: number, status: boolean) => {
    pageData.value[winIndex].isZoom3D = status
    // 开启3D功能的窗口不能拖拽
    pageData.value[winIndex].draggable = !status
}

/**
 * @description 设置放大缩小图标样式
 * @param {number} winIndex
 * @param {number} zoom 放大倍数
 */
const setZoomIcon = (winIndex: number, zoom: number) => {
    pageData.value[winIndex].zoomIconData = zoom
    pageData.value[winIndex].draggable = zoom > 1 || splitValue.value === 1 ? false : true
}

/**
 * @description 校正视频画布位置
 * @param {number} winIndex
 */
const fixPlayCavPosition = (winIndex: number) => {
    if (!player.screen.getZoomCallback || !player.screen.getZoomCallback(winIndex)) return
    const bounding = player.screen.getZoomCallback(winIndex)
    let newLeft = bounding.left
    let newBottom = bounding.bottom
    const webglWidth = bounding.viewWidth
    const webglHeight = bounding.viewHeight
    const $playCav = getVideoCanvas(winIndex)
    const { width, height } = $playCav.getBoundingClientRect()

    // 边界处理
    const innerWidth = Math.abs(newLeft - width) // 偏移后的宽度
    if (newLeft >= 0) {
        newLeft = 0
    } else if (innerWidth >= webglWidth) {
        newLeft = width - webglWidth
    }
    const innerHeight = Math.abs(newBottom - height) // 偏移后的高度
    if (newBottom >= 0) {
        newBottom = 0
    } else if (innerHeight >= webglHeight) {
        newBottom = height - webglHeight
    }
    player.screen.setZoomCallback(winIndex, newLeft, newBottom, webglWidth, webglHeight)
}

/**
 * @description 放大缩小后设置视频画布位置
 * @param {number} winIndex
 * @param {number} zoomTimes
 */
const setPlayCavPosition = (winIndex: number, zoomTimes: number) => {
    const $playWrap = getVideoWrapDiv(winIndex)
    const { width, height } = $playWrap.getBoundingClientRect()
    const webglData = player.screen.getZoomCallback(winIndex)
    const x = (width / 2 - webglData.left) | 0
    const y = (height / 2 - webglData.bottom) | 0
    let newLeft = width / 2 - zoomTimes * x
    let newBottom = height / 2 - zoomTimes * y
    const zoom = zoomList[pageData.value[winIndex].zoomIndex]
    if (zoom === 1) {
        newLeft = 0
        newBottom = 0
    }
    player.screen.setZoomCallback(winIndex, newLeft, newBottom, width * zoom, height * zoom)
    fixPlayCavPosition(winIndex)
}

/**
 * @description 设置音频图标显示/隐藏
 * @param {number} winIndex
 * @param {boolean} bool
 */
const toggleAudioIcon = (winIndex: number, bool: boolean) => {
    pageData.value[winIndex].isAudioIcon = bool
}

/**
 * @description 设置云台图标显示/隐藏
 * @param {number} winIndex
 * @param {boolean} bool
 */
const togglePtzIcon = (winIndex: number, bool: boolean) => {
    pageData.value[winIndex].isPtzIcon = bool
}

/**
 * @description 设置所有报警状态图标可见性(优先级大于toggleAlarmStatus)
 * @param {number} winIndex
 * @param {boolean} bool
 * @param {string} hideAll
 */
const toggleAlarmOsdVisible = (winIndex: number, bool: boolean, hideAll?: string) => {
    pageData.value[winIndex].isMotionIconVisible = bool
    pageData.value[winIndex].isInteligenceIconVisible = bool
    if (hideAll) {
        pageData.value.forEach((item) => {
            item.isMotionIcon = false
            item.isInteligenceIcon = false
        })
    }
}

/**
 * @description 按报警类型设置对应报警状态图标显示/隐藏
 * @param {number} winIndex
 * @param {string} alarmType
 * @param {boolean} bool
 */
const toggleAlarmStatus = (winIndex: number, alarmType: string, bool: boolean) => {
    let iconClass = ''
    let isShowInteligence = false
    if (MOTION_CHLIDREN.indexOf(alarmType) >= 0) {
        iconClass = 'motion'
    } else if (INTELIGENCE_CHLIDREN.indexOf(alarmType) >= 0) {
        iconClass = 'inteligence'
        // 存下每个正在报警的智能类型(只要有一个智能类型正在报警, 就显示智能图标)
        if (!ALARMING_INTELIGENCE[winIndex]) {
            ALARMING_INTELIGENCE[winIndex] = {}
        }
        ALARMING_INTELIGENCE[winIndex][alarmType] = bool
        if (bool) {
            isShowInteligence = true
        }
        // 关了其中一个智能类型, 则去查询还有无正在报警的智能类型
        else {
            for (const type in ALARMING_INTELIGENCE[winIndex]) {
                if (ALARMING_INTELIGENCE[winIndex][type]) {
                    isShowInteligence = true
                    break
                }
            }
        }
    }
    if (iconClass === 'motion') {
        pageData.value[winIndex].isMotionIcon = bool || isShowInteligence ? true : false
    } else {
        pageData.value[winIndex].isInteligenceIcon = bool || isShowInteligence ? true : false
    }
}

/**
 * 设置录像状态可见性(优先级大于toggleRecordStatus)
 * @param {number} winIndex
 * @param {boolean} bool
 */
const toggleRecordOsdVisible = (winIndex: number, bool: boolean) => {
    pageData.value[winIndex].isRecordIconVisible = bool
}

/**
 * @description 设置录像状态图标显示/隐藏
 * @param {number} winIndex
 * @param {string[]} recordTypes
 * @param {boolean} bool
 */
const toggleRecordStatus = (winIndex: number, recordTypes: string[], bool: boolean) => {
    let iconName = 'none'
    if (recordTypes && recordTypes.length) {
        iconName = getIconByEvents(recordTypes)
    }
    pageData.value[winIndex].recordIconStatus = bool ? iconName : 'none'
}

/**
 * @description 设置所有图标显示/隐藏
 * @param {boolean} bool
 */
const toggleOSD = (bool: boolean) => {
    pageData.value.forEach((item) => {
        item.isInteligenceIcon = bool
        item.isMotionIcon = bool
        item.isRecordIcon = bool
        item.isZoomIcon = bool
        item.isPtzIcon = bool
        item.isAudioIcon = bool
        item.isChlIp = bool
    })
}

/**
 * @description 设置右下角通道ip
 * @param {number} winIndex
 * @param {string} chlIp
 */
const setIpToScreen = (winIndex: number, chlIp: string) => {
    pageData.value[winIndex].chlIpInfo = chlIp
}

/**
 * @description 设置右下角通道ip显示/隐藏
 * @param {number} winIndex
 * @param {boolean} bool
 */
const toggleChlIp = (winIndex: number, bool: boolean) => {
    pageData.value[winIndex].isChlIp = bool
}

/**
 * @description 设置右下角通道ip可见性 (优先级高于toggleChlIp)
 */
// const toggleIpVisible = (bool: boolean) => {
//     pageData.value.forEach((item) => {
//         item.isChlIpVisible = bool
//     })
// }

/**
 * @description 设置水印显示/隐藏
 * @param {number} winIndex
 * @param {boolean} bool
 */
const toggleWatermark = (winIndex: number, bool: boolean) => {
    pageData.value[winIndex].isWatermarkInfo = bool
}

/**
 * @description 设置水印信息
 * @param {number} winIndex
 * @param {string} watermark
 */
const setWatermark = (winIndex: number, watermark: string) => {
    pageData.value[winIndex].watermarkInfo = watermark
}

/**
 * @description 更新尺寸
 */
const resize = () => {
    setItemSize()
}

/**
 * @description 全屏
 */
const fullscreen = () => {
    const el = $screen.value!
    if (el.requestFullscreen) {
        el.requestFullscreen()
    } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
    } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen()
    } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen()
    } else {
        alert("This browser doesn't supporter fullscreen")
    }

    // safari全屏时不触发window.onresize事件，需要手动执行
    setTimeout(() => {
        player.resize()
    }, 200)
}

// 退出全屏
// const exitfullscreen = () => {
//     if (document.exitFullscreen) {
//         document.exitFullscreen()
//     } else if (document.webkitExitFullscreen) {
//         document.webkitExitFullscreen()
//     } else if (document.mozCancelFullScreen) {
//         document.mozCancelFullScreen()
//     } else if (document.msExitFullscreen) {
//         document.msExitFullscreen()
//     } else {
//         alert("Exit fullscreen doesn't work")
//     }
// }

/**
 * @description 销毁screen实例
 */
const destroy = () => {
    for (const i in posTimeoutTimer) {
        clearPosTimeout(Number(i))
    }
    player.destroy()
}

/**
 * @description 隐藏错误提示
 * @param {number} winIndex
 */
const hideErrorTips = (winIndex: number) => {
    if (pageData.value[winIndex].isErrorTips) {
        pageData.value[winIndex].isErrorTips = false
    }
}

/**
 * @description 根据播放时的错误码显示相应提示
 * @param {string} type
 * @param {number} winIndex
 * @param {TVTPlayerWinDataListItem} winData
 */
const showErrorTips = (type: string, winIndex: number, winData?: TVTPlayerWinDataListItem) => {
    if (!type) return
    if (type === 'none') {
        if (!pageData.value[winIndex].isErrorTips) {
            pageData.value[winIndex].isErrorTips = true
            pageData.value[winIndex].errorTipsText = 'none'
        }
        return
    }
    pageData.value[winIndex].isErrorTips = true

    let tips = ''
    switch (type) {
        // 正在打开视频流
        case 'streamOpening':
            tips = Translate('IDCS_VIDEO_PENDING')
            break
        // 回放结束
        case 'playComplete':
            tips = Translate('IDCS_PLAYBACK_END')
            break
        // 无录像数据
        case 'noRecord':
            tips = Translate('IDCS_NO_RECORD_DATA')
            break
        // 设备忙
        case 'deviceBusy':
            tips = Translate('IDCS_DEVICE_BUSY')
            break
        // 无权限
        case 'noPermission':
            tips = Translate('IDCS_NO_PERMISSION')
            break
        // 通道离线
        case 'offline':
            tips = Translate('IDCS_OFFLINE')
            break
        default:
            break
    }
    pageData.value[winIndex].errorTipsText = tips

    // 回放结束时，左上角显示通道名
    if (winData?.CHANNEL_INFO?.chlName && type === 'playComplete') {
        pageData.value[winIndex].errorTipsChlName = winData.CHANNEL_INFO.chlName
    }
    // 显示视频丢失logo
    if (type !== 'streamOpening') {
        toggleVideoLossLogo(winIndex, true, tips)
    }
}

/**
 * @description 设置绘制pos的基准画布尺寸
 * @param {Object} baseSize：
 *    @property {Number} width 基准画布宽
 *    @property {Number} height 基准画布高
 */
const setPosBaseSize = (baseSize: { width: number; height: number }) => {
    posBaseSize.width = baseSize.width
    posBaseSize.height = baseSize.height
}

/**
 * @description 设置绘制pos的真实画布
 * @param {number} winIndex
 */
const setPosWrapSize = (winIndex: number) => {
    const displayPosition = pageData.value[winIndex].displayPosition
    if (displayPosition.x === -1) {
        return
    }
    const $screenItem = $screen.value!.children[winIndex]
    const { width: realW, height: realH } = $screenItem.getBoundingClientRect()
    const scaleX = displayPosition.width / posBaseSize.width
    const scaleY = displayPosition.height / posBaseSize.height
    const width = scaleX * realW
    const height = scaleY * realH

    pageData.value[winIndex].posPosition = {
        top: (height * displayPosition.y) / displayPosition.height,
        left: (width * displayPosition.x) / displayPosition.width,
        width,
        height,
    }
}

/**
 * @description 绘制pos
 * @param {Uint8Array} posFrame pos帧信息，包含字符串，包含换行符、颜色信息和终止符，示例：
 *    ------------- --- ------------- ---------------- -----
 *      这是第一行内容 \n 这是第二行内容 #?{RGB(0,0,0)}?# \129
 *      ------------- --- ------------- ---------------- -----
 *         pos内容   换行符    pos内容       颜色信息    终止符
 * @param {number} posLength pos长度
 * @param {TVTPlayerPosInfoItem} cfg previewDisplay
 * @param {number} winIndex
 * @param {string} chlId
 */
const drawPos = (posFrame: Uint8Array, posLength: number, cfg: TVTPlayerPosInfoItem, winIndex: number, chlId: string) => {
    const printMode = cfg.printMode
    pageData.value[winIndex].displayPosition = cfg.displayPosition

    const posNextPageKey = '__POS_NEXT_PAGE__' + chlId
    if (posNextPage[posNextPageKey]) {
        pageData.value[winIndex].posList = []
    }

    // 超时(30s后无pos数据)清空pos
    clearPosTimeout(winIndex)
    posTimeoutTimer[winIndex] = setTimeout(() => {
        pageData.value[winIndex].posList = []
    }, 30 * 1000)

    // 如果是翻页模式，且拿到的pos信息为空，则说明需要翻页
    posNextPage[posNextPageKey] = printMode === 'page' && posLength === 0

    if (posLength === 0) {
        return
    }
    setPosWrapSize(winIndex)
    // 先使用终止符"\129"进行分割
    const posList = []
    let flagIndex = 0 // 当前行的起始下标
    for (let i = 0; i < posLength; i++) {
        const item = posFrame[i]
        if (item === 129) {
            let isNextLine = true // 是否起下一行
            const index = i - flagIndex // 当前行的终止符（129）下标和起始字符下标差值
            // 当前终止符129 前N位（1,2,3,4,5）的字符
            const char1 = posFrame[i - 1],
                char2 = posFrame[i - 2],
                char3 = posFrame[i - 3],
                char4 = posFrame[i - 4],
                char5 = posFrame[i - 5]
            // 2位 十六进制：\0xC0（转成十进制 192）
            if (index >= 1) {
                if (char1 >= 192) isNextLine = false
            }
            // 3位 十六进制：\0xE0（转成十进制 224）
            if (index >= 2) {
                if (char1 >= 224 || char2 >= 224) isNextLine = false
            }
            // 4位 十六进制：\0xF0（转成十进制 240）
            if (index >= 3) {
                if (char1 >= 240 || char2 >= 240 || char3 >= 240) isNextLine = false
            }
            // 5位 十六进制：\0xF8（转成十进制 248）
            if (index >= 4) {
                if (char1 >= 248 || char2 >= 248 || char3 >= 248 || char4 >= 248) isNextLine = false
            }
            // 6位 十六进制：\0xFC（转成十进制 252）
            if (index >= 5) {
                if (char1 >= 252 || char2 >= 252 || char3 >= 252 || char4 >= 252 || char5 >= 252) isNextLine = false
            }
            if (isNextLine) {
                const str = Uint8ArrayToStr(posFrame.slice(flagIndex, i))
                posList.push(str)
                flagIndex = i + 1
            }
        }
    }
    const rgbReg = /\#\?\{(\S+)\}\?\#/
    posList.forEach((posItem) => {
        pageData.value[winIndex].posList.push({
            text: posItem.replace(rgbReg, ''),
            // 先取出rgb颜色信息(若无则默认取白色)
            color: (posItem.match(rgbReg) && posItem.match(rgbReg)![1]) || '#FFFFFF',
        })
    })

    // if ($posList.height() > $posWrap.height()) {
    //     $posWrap.css('justify-content', 'flex-end')
    // } else {
    //     $posWrap.css('justify-content', 'flex-start')
    // }
}

/**
 * @description 销毁pos定时器
 * @param {number} winIndex
 */
const clearPosTimeout = (winIndex: number) => {
    if (posTimeoutTimer[winIndex]) {
        clearTimeout(posTimeoutTimer[winIndex])
        posTimeoutTimer[winIndex] = 0
    }
}

/**
 * @description 控制pos的显示隐藏
 * @param {number} winIndex
 * @param {boolean} bool
 */
const togglePos = (winIndex: number, bool: boolean) => {
    pageData.value[winIndex].isPos = bool
}

/**
 * @description 清空pos
 * @param {number} winIndex
 */
const clearPos = (winIndex: number) => {
    pageData.value[winIndex].posList = []
}

/**
 * 尝试去获取视频丢失图标，若找不到则去掉视频丢失logo节点，反之去掉视频丢失文本节点
 * @param {boolean} showVideoLoss
 */
const tryToGetVideoLossLogo = (showVideoLoss: boolean) => {
    if (!showVideoLoss) {
        isVideoLossWrap.value = showVideoLoss
        return
    }
    const img = new Image()
    img.onload = () => {
        lossLogo.value = '/VideoLossLogo.png'
    }
    img.onerror = () => {
        isVideoLossWrap.value = false
    }
    img.src = '/VideoLossLogo.png'
}

/**
 * @description 设置视频丢失logo的显示隐藏
 * @param {number} winIndex
 * @param {boolean} bool
 * @param {string} tips
 */
const toggleVideoLossLogo = (winIndex: number, bool: boolean, tips?: string) => {
    pageData.value[winIndex].isVideolossWrapVisible = bool
    pageData.value[winIndex].videolossText = bool ? (tips ? tips : '') : ''
}

/**
 * @description 设置当前轮询播放通道组的窗口
 */
const setPollIndex = (winIndex: number) => {
    if (pollIndex.indexOf(winIndex) == -1) {
        pollIndex.push(winIndex)
    }
}

interface Get3DParamRectParam {
    startX: number
    startY: number
    endX: number
    endY: number
    centerX: number
    centerY: number
    width: number
    height: number
}

/**
 * @description 获取设置3D放大功能需要的参数 dx dy zoom
 * @param {number} winIndex
 * @param {Get3DParamRectParam} rectWrap
 */
const get3DParam = (winIndex: number, rectWrap: Get3DParamRectParam) => {
    // rectWrap 为画框容器（鼠标移动时会画框，3D放大基于此来实现）
    const supportMin3DWidth = 40
    const supportMin3DHeight = 30
    if (rectWrap.width > 0 && rectWrap.height > 0 && rectWrap.width <= supportMin3DWidth && rectWrap.height <= supportMin3DHeight) {
        // 画的矩形宽少于40, 高少于30时判定为无效
        return false
    }
    const $item = getVideoWrapDiv(winIndex) // 画布dom元素
    // 以下是参考设备端插件3D功能逻辑
    let isZoomIn = false
    if (rectWrap.endX - rectWrap.startX >= 0 && rectWrap.endY - rectWrap.startY >= 0) {
        isZoomIn = true
    }
    let realWidth = 0
    let realHeight = 0
    const { width: drawWidth, height: drawHeight } = $item.getBoundingClientRect() // 画布宽高

    if (realWidth === 0 || realHeight === 0) {
        // 设备端代码默认都是进这个if
        realWidth = drawWidth
        realHeight = drawHeight
    }
    const drawPoint = {
        centerX: Math.floor(drawWidth / 2),
        centerY: Math.floor(drawHeight / 2),
    }

    const realP1X = (rectWrap.centerX * realWidth) / drawWidth
    const realP1Y = (rectWrap.centerY * realHeight) / drawHeight
    const realP2X = (drawPoint.centerX * realWidth) / drawWidth
    const realP2Y = (drawPoint.centerY * realHeight) / drawHeight

    let dx = realP1X - realP2X
    let dy = realP1Y - realP2Y

    dx = (dx * 1000) / (realWidth / 2)
    dy = (dy * 1000) / (realHeight / 2)

    let zoom = 1
    if (rectWrap.startX != rectWrap.endX || rectWrap.startY != rectWrap.endY) {
        if ((drawWidth * 10) / rectWrap.width > (drawHeight * 10) / rectWrap.height) {
            zoom = drawHeight / rectWrap.height > 10 ? 10 * 10 : (drawHeight * 10) / rectWrap.height
        } else {
            zoom = drawWidth / rectWrap.width > 10 ? 10 * 10 : (drawWidth * 10) / rectWrap.width
        }
        if (!isZoomIn) zoom = 0 - zoom
    }

    return {
        dx: dx,
        dy: -dy,
        zoom: zoom,
    }
}

/**
 * @description 获取当前选中窗口下标
 */
const getSelectedWinIndex = () => {
    return selectedWinIndex.value
}

/**
 * @description 重置zoom3D参数
 * @param {number} index
 */
const resetZoom3D = (index: number) => {
    pageData.value[index].isZoom3D = false
    // zoom3DMap[index] = false
    is3DControl = false
}

const createVideoPlayer = () => {
    return new VideoPlayer({
        type: prop.type,
        split: prop.split,
        enablePos: prop.enablePos,
        showVideoLoss: prop.showVideoLoss,
        onsuccess: (winIndex, item) => emits('onsuccess', winIndex, item),
        onplayStatus: (items) => emits('onplayStatus', items),
        ontime: (winIndex, item, showTimestamp) => emits('ontime', winIndex, item, showTimestamp),
        onstop: (winIndex, item) => emits('onstop', winIndex, item),
        onplayComplete: (winIndex, item) => emits('onplayComplete', winIndex, item),
        onrecordFile: (recordBuf, item, recordStartTime) => emits('onrecordFile', recordBuf, item, recordStartTime),
        // onpos: () => void
        onerror: (winIndex, item, reason) => emits('onerror', winIndex, item, reason),
        onselect: (winIndex, item) => emits('onselect', winIndex, item),
        onwinexchange: (oldWinIndex, newWinIndex) => emits('onwinexchange', oldWinIndex, newWinIndex),
        ondblclickchange: (winIndex, newSplit) => emits('ondblclickchange', winIndex, newSplit),
        screen: {
            getVideoCanvas,
            getWinIndexByPosition,
            toggleVideoLossLogo,
            showErrorTips,
            setPosBaseSize,
            toggleAudioIcon,
            togglePtzIcon,
            zoom,
            setWatermark,
            toggleWatermark,
            togglePos,
            clearPos,
            toggleAlarmOsdVisible,
            toggleRecordOsdVisible,
            toggleChlIp,
            hideErrorTips,
            setSplit,
            snap,
            getSplit,
            setVideoDivSize,
            resetVideoDivSize,
            zoomOut,
            zoom3D,
            toggleOSD,
            toggleRecordStatus,
            toggleAlarmStatus,
            zoomIn,
            getItemSize,
            setPollIndex,
            // setSize,
            fullscreen,
            resize,
            getOverlayCanvas,
            drawPos,
            setIpToScreen,
            resetZoom3D,
            selectWin,
        },
    })
}

const player: VideoPlayer = createVideoPlayer()
const ready = ref(false)
const mode = computed(() => {
    return prop.onlyWasm ? 'h5' : pluginStore.currPluginMode === 'h5' ? 'h5' : 'ocx'
})

const readyState = computed(() => {
    if (mode.value === 'h5') return ready.value
    else return ready.value && pluginStore.ready
})

const resizeObserver = new ResizeObserver(() => {
    resize()
})

onMounted(() => {
    tryToGetVideoLossLogo(prop.type === 'live')
    splitValue.value = prop.split
    requestAnimationFrame(() => {
        setItemSize()
        resizeObserver.observe($screen.value!)
        ready.value = true
    })
})

onBeforeUnmount(() => {
    resizeObserver.disconnect()
    destroy()
    emits('ondestroy')
})

/**
 * @description OCX或wasm播放器就绪后执行回调. 确保对OCX或wasm播放器的操作在ready之后
 */
watch(
    readyState,
    (val) => {
        if (val) emits('onready')
    },
    {
        immediate: true,
    },
)

const stopWatchSplit = watch(
    () => prop.split,
    () => {
        if (mode.value === 'h5') {
            player.setSplit(prop.split)
        } else {
            stopWatchSplit()
        }
    },
)

defineExpose({
    player,
    plugin: Plugin,
    mode,
    ready: readyState,
})
</script>

<style lang="scss" scoped>
.VideoPlayerScreen {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    background-color: var(--bg-player);

    & > .ocx {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    & > .item {
        position: absolute;
        overflow: hidden;
        background-color: var(--bg-player);

        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: calc(100% - 2px);
            height: calc(100% - 2px);
            border: 1px solid var(--border-player-split);
            pointer-events: none;
        }

        &.selected {
            &::after {
                border-color: var(--primary--04);
            }
        }

        &[data-split='1'] {
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            &:not(:first-child) {
                display: none;
            }
        }

        &[data-split='4'] {
            width: 50%;
            height: 50%;

            &[data-position='0'] {
                top: 0;
                left: 0;
            }
            &[data-position='1'] {
                top: 0;
                left: 50%;
            }
            &[data-position='2'] {
                top: 50%;
                left: 0;
            }
            &[data-position='3'] {
                top: 50%;
                left: 50%;
            }
        }

        &.full-target[data-split][data-position] {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 1;
            z-index: 1;
        }

        .play {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 50%;
            left: 50%;
            overflow: hidden;
            transform: translate3d(-50%, -50%, 0);

            canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
        }

        .error {
            height: 100%;
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            justify-content: center;
            align-items: center;

            &.hide {
                display: none;
            }

            &-tips {
                font-size: 16px;
                white-space: nowrap;
            }

            &-chl-name {
                position: absolute;
                left: 5px;
                top: 5px;
                font-size: 14px;
            }

            &.mask {
                background-color: var(--bg-player);
            }
        }

        .osd {
            position: absolute;
            top: 5px;
            right: 0;
            width: 100%;
            margin-right: 5px;
            display: flex;
            justify-content: flex-end;

            &-icon {
                margin-left: 10px;
                width: 24px;
                height: 24px;

                &.hide {
                    display: none;
                }

                &.invisible {
                    visibility: hidden;
                }
            }
        }

        .draw {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 100%;
            transform: translate3d(-50%, -50%, 0);
        }

        .watermark {
            position: absolute;
            left: 5px;
            bottom: 5px;
            font-size: 16px;
            font-weight: 400;
            user-select: none;
            letter-spacing: 1.2px;

            &.hide {
                display: none;
            }
        }

        .chlip {
            position: absolute;
            right: 20px;
            bottom: 10px;
            font-size: 16px;
            font-weight: 400;
            user-select: none;
            letter-spacing: 1.2px;

            &.hide {
                display: none;
            }

            &.invisible {
                visibility: hidden;
            }
        }

        .pos {
            position: absolute;
            left: 0;
            top: 0;
            font-weight: 400;
            user-select: none;
            letter-spacing: 1.2px;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            overflow: hidden;
            box-sizing: border-box;

            &.hide {
                display: none;
            }

            &-item {
                word-break: break-all;
                white-space: pre-wrap;
                font-size: 18px;
                box-sizing: border-box;
            }
        }

        /* 视频丢失logo层 */
        .videoloss {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;

            &-logo {
                width: 20%;
            }

            &-tips {
                margin-top: 10px;
                color: var(--color-white);
            }
        }
    }
}
</style>
