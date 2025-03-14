<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-05 13:35:57
 * @Description: 多分屏WASM播放器控件
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
                <div
                    v-show="item.isOsd"
                    class="osd"
                >
                    <BaseImgSprite
                        file="inteligenceState"
                        :class="{
                            hide: !item.isInteligenceIcon,
                            invisible: !item.isInteligenceIconVisible,
                        }"
                    />
                    <BaseImgSprite
                        file="motionState"
                        :class="{
                            hide: !item.isMotionIcon,
                            invisible: !item.isMotionIconVisible,
                        }"
                    />
                    <BaseImgSprite
                        :file="item.recordIconStatus"
                        :class="{
                            invisible: !item.isRecordIconVisible,
                            hide: item.recordIconStatus === 'none' || !item.isRecordIcon,
                        }"
                        :data-event="item.recordIconStatus"
                    />
                    <BaseImgSprite
                        file="ptzState"
                        :class="{
                            hide: !item.isPtzIcon,
                        }"
                    />
                    <BaseImgSprite
                        :file="`ZoomState__${item.zoomIconData}`"
                        :class="{
                            hide: item.zoomIconData === 1 || !item.isZoomIcon,
                        }"
                        :data-zoom="item.zoomIconData"
                    />
                    <BaseImgSprite
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
                    height: `${item.posPosition.height}px`,
                    top: `${item.posPosition.top}px`,
                    left: `${item.posPosition.left}px`,
                    'justify-content': `${item.posList.length * 20 > item.posPosition.height ? 'flex-end' : 'flex-start'}`,
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
                >
                    {{ posItem.text }}
                </span>
            </div>
            <div
                class="chlip"
                :class="{
                    hide: !item.isChlIp || !item.isOsd,
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
            <BasePluginPlayer
                :is-update-pos="prop.ocxUpdatePos"
                @message="handleOCXMessage"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { type XMLQuery } from '@/utils/xmlParse'

export interface PlayerWinDataListItem {
    PLAY_STATUS: 'play' | 'stop' | 'error'
    CHANNEL_INFO: null | {
        chlID: string
        supportPtz: boolean
        chlName: string
        streamType: number
    }
    winIndex: number
    seeking: boolean
    original: boolean // 原始比例(1：1)状态，true开启，false关闭
    audio: boolean // 声音 true开启，false关闭
    magnify3D: boolean // 3D放大 true开启，false关闭
    localRecording: boolean // 是否开启本地录像 true开启，false关闭
    isPolling: boolean // 是否开启通道组轮询播放
    timestamp: number
    showWatermark: boolean
    showPos: boolean
    position: number
}

export interface PlayerPosInfoItem {
    previewDisplay: boolean // 现场预览是否显示pos
    printMode: 'page' | 'scroll' // pos显示模式：page翻页/scroll滚屏
    displayPosition: {
        // pos显示区域
        x: number
        y: number
        width: number
        height: number
    }
    timeout: number // pos超时隐藏时间，默认10秒
}

const prop = withDefaults(
    defineProps<{
        /**
         * @property 是否只显示WASM播放器
         */
        onlyWasm?: boolean
        /**
         * @property 播放类型
         */
        type?: 'record' | 'live'
        /**
         * @property 初始分屏数. 只支持1/4分屏
         */
        split?: number
        /**
         * @property 允许pos数据
         */
        enablePos?: boolean
        /**
         * @property 是否显示视频丢失logo
         */
        showVideoLoss?: boolean
        /**
         * @property 是否向插件发送位置数据
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
     * @description 组件初始化后执行. 回调函数必须是同步函数
     */
    (e: 'ready'): void
    /**
     * @description 播放器初始化成功后执行
     */
    (e: 'success', winIndex: number, item: PlayerWinDataListItem): void
    /**
     * @description
     */
    (e: 'playStatus', items: PlayerWinDataListItem[]): void
    /**
     * @description
     */
    (e: 'time', winIndex: number, item: PlayerWinDataListItem, showTimestamp: number): void
    /**
     * @description
     */
    (e: 'stop', winIndex: number, item: PlayerWinDataListItem): void
    /**
     * @description
     */
    (e: 'playComplete', winIndex: number, item: PlayerWinDataListItem): void
    /**
     * @description
     */
    (e: 'recordFile', recordBuf: ArrayBuffer, item: PlayerWinDataListItem, recordStartTime: number): void
    // onpos: () => void
    /**
     * @description 失败回调
     */
    (e: 'error', winIndex: number, item: PlayerWinDataListItem, reason?: string): void
    /**
     * @description 选中视窗后回调
     */
    (e: 'select', winIndex: number, item: PlayerWinDataListItem): void
    /**
     * @description 视窗位置交换后回调
     */
    (e: 'winexchange', oldWinIndex: number, newWinIndex: number): void
    /**
     * @description 双击分屏后分屏变化的回调
     */
    (e: 'dblclickchange', winIndex: number, newSplit: number): void
    /**
     * @description 接收OCX通知信息
     */
    (e: 'message', $: XMLQuery, stateType: string): void
    /**
     * @description 组件销毁时回调
     */
    (e: 'destroy'): void
}>()

const plugin = usePlugin()
const systemCaps = useCababilityStore()
const pluginStore = usePluginStore()
const { Translate } = useLangStore()

const $screen = ref<HTMLDivElement>()

const MAUNUAL_CHLIDREN = ['manual']
const REC_CHLIDREN = ['sensor', 'gsensor']
const INTELIGENCE_CHLIDREN = ['vfd', 'face_verity', 'vehicle_plate_verity', 'smart_plate_verity', 'tripwire', 'perimeter', 'aoi_entry', 'aoi_leave', 'osc', 'avd', 'cdd', 'temperature', 'fire_point']
const MOTION_CHLIDREN = ['motion', 'SMDHuman', 'SMDVehicle']
const POS_CHLIDREN = ['pos']
const SCHEDULE_CHLIDREN = ['schedule']

/**
 * @const 回放事件和对应图标展示映射(图标顺序按优先级从高到低排列)
 */
const REC_EVENT_ICON_MAP: readonly { icon: string; events: string[] }[] = [
    { icon: 'rec_manual', events: MAUNUAL_CHLIDREN },
    { icon: 'rec_continuous', events: REC_CHLIDREN },
    {
        icon: 'rec_inteligence',
        events: INTELIGENCE_CHLIDREN,
    },
    { icon: 'rec_motion', events: MOTION_CHLIDREN },
    { icon: 'rec_pos', events: POS_CHLIDREN },
    { icon: 'rec_schedule', events: SCHEDULE_CHLIDREN },
]

const ERROR_CODE_MAP: Record<number, string> = {
    [ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED]: 'playComplete', // 文件流完成(回放结束时出现)
    [ErrorCode.USER_ERROR_NO_RECORDDATA]: 'noRecord', // 无录像数据
    [ErrorCode.USER_ERROR_DEVICE_BUSY]: 'deviceBusy', // 设备忙，不能请求
    [ErrorCode.USER_ERROR_DEV_RESOURCE_LIMITED]: 'deviceBusy', // 设备忙，设备资源限制
    [ErrorCode.USER_ERROR_NODE_NET_DISCONNECT]: 'offline', // 网络断开，通道离线
    [ErrorCode.USER_ERROR_NODE_NET_OFFLINE]: 'offline', // 通道不在线
    [ErrorCode.USER_ERROR_NO_AUTH]: 'noPermission', // 无权限
}

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

let showTimestamp = 0
const playerList: (ReturnType<typeof WasmPlayer> | null)[] = []
const winDataList: PlayerWinDataListItem[] = []
const recordStartTime: number[] = []
const enablePos = prop.enablePos && systemCaps.supportPOS
let seeking = false
let speed = 1
let timeGapMap: Record<number, number> = {}

// 通道id和录像状态的映射,录像状态包含属性见 setRecordStatus 方法
const recordStatusChlMap: Record<string, { recordTypes: string[]; isRecording: boolean }> = {}
// 通道id和报警状态的映射,录像状态包含属性见 setAlarmStatus 方法
const alarmStatusChlMap: Record<string, Record<string, boolean>> = {}
// 特殊处理问题单 NVRUSS78-252
let noRecordFlag = true
let posInfo: Record<string, PlayerPosInfoItem> = {}
// 通道GUID和通道ip的映射
let chlIpMap: Record<string, string> = {}

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
            isOsd: false,
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
                setZoom(winIndex, mouseType === 'right' ? 'ZoomIn' : 'ZoomOut', 1, 'control')
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
            setZoom(winIndex, 'StopAction', 1, 'stop')
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
            setMagnify3D(
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
            emits('select', winIndex, winDataList[winIndex])
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
            const webglData = getZoomCallback(winIndex)
            const offsetX = e.screenX - mouseDownX
            const offsetY = e.screenY - mouseDownY
            const newLeft = (webglData.left | 0) + offsetX
            const newBottom = (webglData.bottom | 0) - offsetY
            if (throttleTimer) return false
            throttleTimer = setTimeout(() => {
                setZoomCallback(winIndex, newLeft, newBottom, webglData.viewWidth, webglData.viewHeight)
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
    const delta = clamp(wheel, -1, 1)
    const zoom3DType = delta < 0 ? 'zoom3DIn' : 'zoom3DOut' // 缩小 放大
    setMagnify3D(
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
        setMagnify3D(
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
        fullTarget.value = -1
        dblclickToFull.value = false
        // splitValue.value = prop.split
        // setSplit(splitValue.value, true)
        handleDblClickChange(-1, -1)
    }
    // 双击的分屏单分屏显示
    else if (splitValue.value > 1) {
        fullTarget.value = winIndex
        dblclickToFull.value = true
        // splitValue.value = 1
        // setSplit(splitValue.value, true)
        handleDblClickChange(fullTarget.value, pageData.value[fullTarget.value].position)
    }
}

const handleDblClickChange = (winIndex: number, newSplit: number) => {
    // 保持所有分屏的显示状态
    for (let i = 0; i < MAX_SPLIT; i++) {
        const original = winDataList[i].original
        displayOriginal(i, original)
    }
    emits('dblclickchange', winIndex, newSplit)
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
    if (pollIndex.length) {
        if (pollIndex.indexOf(oldDragIndex) > -1 || pollIndex.indexOf(newWinIndex) > -1) return
    }

    const oldIndexPosition = pageData.value[oldDragIndex].position
    const newIndexPosition = pageData.value[newWinIndex].position
    pageData.value[oldDragIndex].position = newIndexPosition
    pageData.value[newWinIndex].position = oldIndexPosition

    winDataList[oldDragIndex].position = newIndexPosition
    winDataList[newWinIndex].position = oldIndexPosition

    nextTick(() => {
        emits('select', newWinIndex, winDataList[newWinIndex])
        emits('winexchange', oldDragIndex, newWinIndex)
    })
}

/**
 * @description 只改变样式
 */
const selectWin = (winIndex: number) => {
    selectedWinIndex.value = winIndex
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

    if (!getZoomCallback(winIndex)) return
    const zoom = zoomList[pageData.value[winIndex].zoomIndex]
    const webglData = getZoomCallback(winIndex)
    setZoomCallback(winIndex, webglData.left, webglData.bottom, width * zoom, height * zoom)
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
        handleDblClickChange(-1, -1)
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
const getVideoCanvas = (winIndex = 0) => {
    return $screen.value!.children[winIndex].querySelector('.play-canvas') as HTMLCanvasElement
}

/**
 * @description 根据窗口索引获取视频覆盖层canvas元素
 * @param {number} winIndex
 */
const getOverlayCanvas = (winIndex = 0) => {
    return $screen.value!.children[winIndex].querySelector('.draw') as HTMLCanvasElement
}

/**
 * @description 根据倍数值放大
 * @param {number} winIndex
 * @param {number} zoomValue 放大值
 */
const zoom = (winIndex: number, zoomValue: number) => {
    if (zoomValue < zoomList.at(0)! || zoomValue > zoomList.at(-1)!) {
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
const zoomIn = (winIndex: number) => {
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
const zoomOut = (winIndex: number) => {
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
    winDataList[winIndex].magnify3D = status
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
    if (!getZoomCallback(winIndex)) return
    const bounding = getZoomCallback(winIndex)
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
    setZoomCallback(winIndex, newLeft, newBottom, webglWidth, webglHeight)
}

/**
 * @description 放大缩小后设置视频画布位置
 * @param {number} winIndex
 * @param {number} zoomTimes
 */
const setPlayCavPosition = (winIndex: number, zoomTimes: number) => {
    const $playWrap = getVideoWrapDiv(winIndex)
    const { width, height } = $playWrap.getBoundingClientRect()
    const webglData = getZoomCallback(winIndex)
    const x = (width / 2 - webglData.left) | 0
    const y = (height / 2 - webglData.bottom) | 0
    let newLeft = width / 2 - zoomTimes * x
    let newBottom = height / 2 - zoomTimes * y
    const zoom = zoomList[pageData.value[winIndex].zoomIndex]
    if (zoom === 1) {
        newLeft = 0
        newBottom = 0
    }
    setZoomCallback(winIndex, newLeft, newBottom, width * zoom, height * zoom)
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
 * @description 设置录像状态可见性(优先级大于toggleRecordStatus)
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
        item.isOsd = bool
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
        resizePlayer()
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

    for (let i = 0; i < playerList.length; i++) {
        stop(i)
    }
    posInfo = {}
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
 * @param {PlayerWinDataListItem} winData
 */
const showErrorTips = (type: string, winIndex: number, winData?: PlayerWinDataListItem) => {
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
    const rect = $screenItem.getBoundingClientRect()

    const scaleX = displayPosition.width / posBaseSize.width
    const scaleY = displayPosition.height / posBaseSize.height
    const width = scaleX * rect.width
    const height = scaleY * rect.height

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
 * @param {PlayerPosInfoItem} cfg previewDisplay
 * @param {number} winIndex
 * @param {string} chlId
 */
const drawPos = (posFrame: Uint8Array, posLength: number, cfg: PlayerPosInfoItem, winIndex: number, chlId: string) => {
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
        if (pageData.value[winIndex].posList.length > 50) {
            pageData.value[winIndex].posList = pageData.value[winIndex].posList.slice(10)
        }
    })
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
    if (pollIndex.indexOf(winIndex) === -1) {
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
    if (rectWrap.startX !== rectWrap.endX || rectWrap.startY !== rectWrap.endY) {
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

/**
 * @description
 * @param {number} winIndex
 */
const getZoomCallback = (winIndex: number) => {
    return (
        playerList[winIndex]?.getWebGL() || {
            left: 0,
            bottom: 0,
            viewWidth: 0,
            viewHeight: 0,
        }
    )
}

/**
 * @description
 * @param {number} winIndex
 * @param {number} left
 * @param {number} bottom
 * @param {number} width
 * @param {number} height
 */
const setZoomCallback = (winIndex: number, left: number, bottom: number, width: number, height: number) => {
    playerList[winIndex]?.setWebGL(left, bottom, width, height)
}

// 设置3D功能
const setMagnify3D = (winIndex: number, zoom3DType: string, callback: () => void, obj: { dx: number; dy: number; zoom: number } | false) => {
    if (playerList[winIndex]) {
        const data = {
            chlId: winDataList[winIndex].CHANNEL_INFO!.chlID,
            dx: obj ? obj.dx : 0,
            dy: obj ? obj.dy : 0,
            zoom: zoom3DType ? (zoom3DType === 'zoom3DIn' ? -20 : 20) : obj ? obj.zoom : 1,
        }
        const sendXML = rawXml`
            <content>
                <chlId>${data.chlId}</chlId>
                <dx>${String(data.dx)}</dx>
                <dy>${String(data.dy)}</dy>
                <zoom>${String(data.zoom)}</zoom>
            </content>
        `
        ptz3DControl(sendXML)
            .then(() => {
                callback && callback()
            })
            .catch(() => {
                callback && callback()
            })
    }
}

/**
 * @description 设置缩放功能（3D球机和非球机统一使用ptzMoveCall协议控制缩放）
 * @param {number} winIndex
 * @param {string} actionType
 * @param {number} speed
 * @param {string} type
 */
const setZoom = (winIndex: number, actionType: 'ZoomIn' | 'ZoomOut' | 'StopAction', speed = 1, type: 'control' | 'direction' | 'activeStop' | 'stop') => {
    if (playerList[winIndex]) {
        const opt = {
            chlId: winDataList[winIndex].CHANNEL_INFO!.chlID,
            actionType, // ZoomIn, ZoomOut, StopAction
            speed, // 默认 1
            type, // control, direction, activeStop, stop
        }
        const sendXML = rawXml`
            <content>
                <chlId>${opt.chlId}</chlId>
                <actionType>${opt.actionType}</actionType>
                <speed>${String(opt.speed)}</speed>
                <type>${opt.type}</type>
            </content>
        `
        ptzMoveCall(sendXML)
    }
}

/**
 * @description 初始化数据
 */
const createVideoPlayer = () => {
    for (let i = 0; i < MAX_SPLIT; i++) {
        playerList.push(null)
        winDataList.push({
            PLAY_STATUS: 'stop',
            CHANNEL_INFO: null,
            winIndex: i,
            seeking: false,
            original: false,
            audio: false,
            magnify3D: false,
            localRecording: false,
            isPolling: false,
            timestamp: 0,
            showWatermark: false,
            showPos: false,
            position: getWinIndexByPosition(i),
        })
    }

    if (enablePos) {
        getPosCfg()
    }
}

interface PlayerPlayParams {
    winIndex?: number // 窗口索引, 不传则默认为激活窗口索引
    isSelect?: boolean // 播放之后焦点是否落在窗口索引位置
    showWatermark?: boolean // 是否显示水印
    callback?: (winIndex: number) => void // 播放完成(成功或失败)之后的自定义回调
    audioStatus?: boolean // 播放时设置音频开关状态（默认是继承上次音频状态，预览切换通道时需置为关）
    showPos?: boolean // 是否显示Pos
    isDblClickSplit?: boolean
    isOnline?: boolean // 如果调用方明确传入通道离线状态，则根据此字段显示离线提示，否则显示“正在请求视频流”
    volume?: number
    chlID: string
    isPolling?: boolean // 是否开启通道组轮询播放
    supportPtz?: boolean
    chlName?: string
    streamType: number
    startTime?: number // 时间戳 单位：秒
    endTime?: number // 时间戳 单位：秒
    typeMask?: string[]
    isPlayback?: boolean
    isEndRec?: boolean
}

/**
 * @description 播放
 * @param {Object} params 具体字段参考wasm-player的play方法
 *      @property {Number} winIndex 窗口索引, 不传则默认为激活窗口索引
 *      @property {Boolean} isSelect 播放之后焦点是否落在窗口索引位置
 *      @property {Boolean} showWatermark 是否显示水印
 *      @property {Boolean} callback 播放完成(成功或失败)之后的自定义回调
 *      @property {Boolean} audioStatus 播放时设置音频开关状态（默认是继承上次音频状态，预览切换通道时需置为关）
 *      @property {Boolean} showPos 是否显示Pos
 */
const play = (params: PlayerPlayParams) => {
    noRecordFlag = true
    // https访问时，拦截并根据业务类型弹出提示
    if (isHttpsLogin()) {
        handleHttpsPlay()
        return
    }
    const winIndex = getWinIndexByPosition(params.winIndex || params.winIndex === 0 ? params.winIndex : selectedWinIndex.value)
    const isDblClickSplit = params.isDblClickSplit || false
    stop(winIndex)
    const videoCav = getVideoCanvas(winIndex)
    const curSplit = getSplit()
    if (!isDblClickSplit && curSplit < winIndex + 1) {
        setSplit(MAX_SPLIT)
    }
    // 先隐藏视频丢失logo
    toggleVideoLossLogo(winIndex, false)
    const isOnline = typeof params.isOnline === 'undefined' ? true : params.isOnline
    if (!isOnline) {
        showErrorTips('offline', winIndex, winDataList[winIndex])
    } else {
        showErrorTips('streamOpening', winIndex, winDataList[winIndex])
    }
    playerList[winIndex] = WasmPlayer({
        canvas: videoCav,
        type: prop.type,
        volume: params.volume || 50,
        onopen: () => {},
        onsuccess: () => {
            // const winIndex = getWinIndexByCav(videoCav)
            if (params.audioStatus) winDataList[winIndex].audio = Boolean(params.audioStatus)
            handlePlaySuccess(winIndex)
        },
        onstop: () => {
            // const winIndex = getWinIndexByCav(videoCav)
            winDataList[winIndex].PLAY_STATUS = 'stop'
            winDataList[winIndex].seeking = false
            // this.winDataList[winIndex].audio = false  // NVR145-178 音频不重置
            winDataList[winIndex].magnify3D = false
            winDataList[winIndex].timestamp = 0
            toggleAudioIcon(winIndex, false)
            togglePtzIcon(winIndex, false)
            zoom(winIndex, 1)
            // 关闭并清除水印
            setWatermark(winIndex, '')
            toggleWatermark(winIndex, false)
            // 清除pos
            togglePos(winIndex, false)
            clearPos(winIndex)
            // 关闭报警事件图标
            toggleAlarmOsdVisible(winIndex, false, 'hideAll')
            // 关闭录像状态图标
            toggleRecordOsdVisible(winIndex, false)
            // 显示视频丢失logo
            toggleVideoLossLogo(winIndex, true)
            // 关闭通道ip信息
            toggleChlIp(winIndex, false)
            // 窗口停止播放时如果打开了原始比例按钮需要重置，否则切换通道时显示的还是上次设置的原始比例
            winDataList[winIndex].original && displayOriginal(winIndex, false)
            emits('stop', winIndex, winDataList[winIndex])
            emits('playStatus', getPlayingChlList())
        },
        onfinished: () => {
            // const winIndex = getWinIndexByCav(videoCav)
            if (params.callback) params.callback(winIndex)
        },
        onerror: (errorCode?: number, url?: string) => {
            // const winIndex = getWinIndexByCav(videoCav)
            handlePlayError(winIndex, errorCode, url)
            winDataList[winIndex].PLAY_STATUS = 'error'
            emits('error', winIndex, winDataList[winIndex])
            emits('playStatus', getPlayingChlList())
        },
        ontime: (timestamp: number) => {
            noRecordFlag = false
            // const winIndex = getWinIndexByCav(videoCav)
            handleOntime(winIndex, timestamp)
            if (winDataList[winIndex].PLAY_STATUS === 'error') {
                hideErrorTips(winIndex)
                toggleVideoLossLogo(winIndex, false)
                winDataList[winIndex].PLAY_STATUS = 'play'
                emits('playStatus', getPlayingChlList())
            }
        },
        onwatermark: (watermark: string) => {
            // const winIndex = getWinIndexByCav(videoCav)
            setWatermark(winIndex, watermark)
        },
        onrecordFile: (recordBuf: ArrayBuffer) => {
            // const winIndex = getWinIndexByCav(videoCav)
            emits('recordFile', recordBuf, winDataList[winIndex], recordStartTime[winIndex])
        },
        onpos: (posFrame: Uint8Array, posLength) => {
            if (!enablePos) return
            // const winIndex = getWinIndexByCav(videoCav)
            handlePos(posFrame, posLength, params.chlID, winIndex)
        },
    })
    playerList[winIndex]?.play(params)
    resetZoom3D(winIndex)
    winDataList[winIndex].CHANNEL_INFO = {
        chlID: params.chlID,
        supportPtz: params.supportPtz || false,
        chlName: params.chlName || '',
        streamType: params.streamType || 2,
    }
    winDataList[winIndex].original = false
    winDataList[winIndex].localRecording = false
    winDataList[winIndex].audio = false
    winDataList[winIndex].magnify3D = false
    winDataList[winIndex].timestamp = 0
    winDataList[winIndex].showWatermark = params.showWatermark || false
    winDataList[winIndex].showPos = params.showPos || false
    winDataList[winIndex].isPolling = params.isPolling || false
    if (params.isSelect !== false) {
        selectWin(winIndex)
    }
}

/**
 * @description 获取视频canvas对象所在窗口号
 * @param {HTMLCanvasElement} canvas
 * @returns {number}
 **/
const getWinIndexByCav = (canvas: HTMLCanvasElement) => {
    if (!playerList) return -1
    const findIndex = playerList.findIndex((item) => item?.isSameCanvas(canvas))
    return findIndex
}

/**
 * @description 停止某个窗口播放
 * @param {number} winIndex
 */
const stop = (winIndex: number) => {
    if (!playerList[winIndex]) {
        return
    }
    playerList[winIndex]?.stop()
    playerList[winIndex]?.destroy()
    hideErrorTips(winIndex)
    playerList[winIndex] = null
}

/**
 * @description 全部窗口停止播放
 */
const stopAll = () => {
    for (let i = 0; i < playerList.length; i++) {
        stop(i)
    }
}

/**
 * @description 暂停某个窗口播放
 * @param {number} winIndex
 */
const pause = (winIndex: number) => {
    playerList[winIndex]?.pause()
}

/**
 * @description 全部窗口暂停播放
 */
const pauseAll = () => {
    for (let i = 0; i < playerList.length; i++) {
        pause(i)
    }
}

/**
 * @description 继续某个窗口播放
 * @param {number} winIndex
 */
const resume = (winIndex: number) => {
    playerList[winIndex]?.resume()
}

/**
 * @description 全部窗口继续播放
 */
const resumeAll = () => {
    for (let i = 0; i < playerList.length; i++) {
        resume(i)
    }
}

/**
 * @description seek回放时间点
 * @param {number} frameTime
 */
const seek = (frameTime: number) => {
    seeking = true
    for (let i = 0; i < playerList.length; i++) {
        playerList[i]?.seek(frameTime)
        winDataList[i].seeking = winDataList[i].PLAY_STATUS === 'play'
    }
}

/**
 * @description 播放成功的处理
 * @param {number} winIndex
 */
const handlePlaySuccess = (winIndex: number) => {
    if (prop.type === 'record') {
        winDataList[winIndex].seeking = false
        showTimestamp = 0
        let seekingFlag = false
        for (let i = 0; i < splitValue.value; i++) {
            playerList[i]?.resetBasicTime()
            if (winDataList[i].seeking && playerList[i]) {
                seekingFlag = true
            }
        }
        seeking = seekingFlag
    } else if (prop.type === 'live') {
        const supportPtz = winDataList[winIndex].CHANNEL_INFO!.supportPtz
        togglePtzIcon(winIndex, supportPtz)
        const chlId = winDataList[winIndex].CHANNEL_INFO!.chlID
        if (recordStatusChlMap[chlId]) {
            const recordTypes = recordStatusChlMap[chlId].recordTypes
            const isRecording = recordStatusChlMap[chlId].isRecording
            setRecordStatus(chlId, recordTypes, isRecording)
        }

        if (alarmStatusChlMap[chlId]) {
            Object.keys(alarmStatusChlMap[chlId]).forEach((alarmType) => {
                const isAlarming = alarmStatusChlMap[chlId][alarmType]
                setAlarmStatus(chlId, alarmType, isAlarming)
            })
        }

        // 设置通道ip信息 (目前仅在UI1-E实现)
        setChlIp(winIndex, chlId)
        // 打开录像状态图标
        toggleRecordOsdVisible(winIndex, true)
        // 打开报警事件图标
        toggleAlarmOsdVisible(winIndex, true)
        // 打开通道ip信息
        toggleChlIp(winIndex, true)
    }
    winDataList[winIndex].audio ? openAudio(winIndex) : closeAudio(winIndex)
    toggleWatermark(winIndex, winDataList[winIndex].showWatermark)
    togglePos(winIndex, winDataList[winIndex].showPos)
    hideErrorTips(winIndex)
    winDataList[winIndex].PLAY_STATUS = 'play'
    emits('success', winIndex, winDataList[winIndex])
    emits('playStatus', getPlayingChlList())
}

/**
 * @description 处理播放失败
 * @param {number} winIndex
 * @param {number} errorCode
 * @param {string} url
 */
const handlePlayError = (winIndex: number, errorCode: number = 0, url: string = '') => {
    if (url === '/device/preview/audio/open#response' || url === '/device/playback/audio/open#response') {
        // 处理打开音频回复的错误码
        switch (errorCode) {
            case ErrorCode.USER_ERROR_UNSUPPORTED_CMD: // 不支持打开音频
                closeAudio(winIndex)
                emits('error', winIndex, winDataList[winIndex], 'notSupportAudio')
                emits('error', winIndex, winDataList[winIndex], 'audioClosed')
                break
            case ErrorCode.USER_ERROR_NO_AUTH: // 无权限
                closeAudio(winIndex)
                emits('error', winIndex, winDataList[winIndex], 'noPermission')
                emits('error', winIndex, winDataList[winIndex], 'audioClosed')
                break
        }
    } else if (url === '/device/preview/audio/close#response' || url === '/device/playback/audio/close#response') {
        // 处理关闭音频回复的错误码
        switch (errorCode) {
            // 音频流已关闭
            case ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED:
                emits('error', winIndex, winDataList[winIndex], 'audioClosed')
                break
            default:
                break
        }
    } else {
        // 处理视频流相关错误码
        switch (errorCode) {
            // 文件流完成(回放结束时出现)
            case ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED:
                emits('playComplete', winIndex, winDataList[winIndex])
                break
            case ErrorCode.USER_ERROR_DEVICE_BUSY:
            case ErrorCode.USER_ERROR_DEV_RESOURCE_LIMITED:
                // 回放返回设备忙时，直接关闭回放链路
                if (url === '/device/playback/open#response' && playerList[winIndex]) {
                    playerList[winIndex]!.stop()
                    playerList[winIndex]!.destroy()
                    playerList[winIndex] = null // NCNHZ07-49
                }
                break
            default:
                break
        }

        if (noRecordFlag && errorCode === ErrorCode.USER_ERROR_FILE_STREAM_COMPLETED) {
            showErrorTips('noRecord', winIndex, winDataList[winIndex])
        } else {
            showErrorTips(ERROR_CODE_MAP[errorCode], winIndex, winDataList[winIndex])
        }
    }
}

/**
 * @description 处理播放进度回调
 * @param {number} winIndex
 * @param {number} timestamp
 */
const handleOntime = (winIndex: number, timestamp: number) => {
    winDataList[winIndex].timestamp = timestamp
    if (prop.type === 'record') {
        if (seeking) return
        const timeArr = []
        for (let i = 0; i < splitValue.value; i++) {
            const statusI = winDataList[i].PLAY_STATUS
            const timestampI = winDataList[i].timestamp
            if (statusI === 'play' && timestampI >= showTimestamp) {
                const timeGap = timestampI - showTimestamp
                if (showTimestamp !== 0 && timeGap >= 2000 * speed) {
                    if (playerList[i]?.getPlayState() === 'PLAYING') {
                        playerList[i]!.pause()
                        timeGapMap[i] = timeGap
                    }
                } else if (timestampI >= showTimestamp) {
                    timeArr.push(timestampI)
                    if (playerList[i]?.getPlayState() === 'PAUSE') {
                        playerList[i]!.resume()
                    }
                }
            }
        }

        if (timeArr.length > 0) {
            showTimestamp = Math.min.apply(null, timeArr)
        } else {
            showTimestamp = timestamp
            const timeGapArr = Object.values(timeGapMap)
            const minTimeGap = timeGapArr.length > 0 ? Math.min.apply(null, timeGapArr) : 0
            for (let i = 0; i < splitValue.value; i++) {
                playerList[i]?.setTimeGap(minTimeGap)
                if (playerList[i]?.getPlayState() === 'PAUSE') {
                    playerList[i]!.resume()
                }
            }
            timeGapMap = {}
        }
    } else {
        showTimestamp = timestamp
    }
    emits('time', winIndex, winDataList[winIndex], showTimestamp)
}

/**
 * @description 倍速播放
 * @param {number} value
 */
const setSpeed = (value: number) => {
    speed = value
    for (let i = 0; i < playerList.length; i++) {
        playerList[i]?.setSpeed(speed)
    }
}

/**
 * @description 手动下一帧播放
 */
const nextFrame = () => {
    for (let i = 0; i < playerList.length; i++) {
        playerList[i]?.nextFrame()
    }
}

/**
 * @description 启用关键帧回放
 * @param {number} timestamp 毫秒时间戳
 */
const keyFramePlay = (timestamp: number) => {
    for (let i = 0; i < playerList.length; i++) {
        playerList[i]?.keyFramePlay(timestamp)
    }
}

/**
 * @description 恢复全帧回放
 * @param {number} timestamp 毫秒时间戳
 */
const allFramePlay = (timestamp: number) => {
    for (let i = 0; i < playerList.length; i++) {
        playerList[i]?.allFramePlay(timestamp)
    }
}

/**
 * @description 原始比例播放
 * @param {number} winIndex 窗口号
 * @param {boolean} bool 是否原始比例
 */
const displayOriginal = (winIndex: number, bool: boolean) => {
    if (!playerList[winIndex]) return
    if (bool) {
        playerList[winIndex]!.displayOriginal()
        const size = playerList[winIndex]!.getSize()
        setVideoDivSize(winIndex, size.width, size.height)
    } else {
        const size = getItemSize(winIndex)
        playerList[winIndex]!.setSize(size.width, size.height)
        resetVideoDivSize(winIndex)
    }
    winDataList[winIndex].original = bool
}

/**
 * @description 手动设置通道组轮询状态
 * @param {boolean} bool
 * @param {number} winIndex
 */
const setPollingState = (bool: boolean, winIndex?: number) => {
    if (winIndex !== undefined) {
        winDataList[winIndex].isPolling = bool
        return
    }

    for (let i = 0; i < MAX_SPLIT; i++) {
        winDataList[i].isPolling = bool
    }
}

/**
 * @description 显示/隐藏所有水印
 * @param {boolean} bool
 */
const toggleAllWatermark = (bool: boolean) => {
    for (let i = 0; i < MAX_SPLIT; i++) {
        winDataList[i].showWatermark = bool
        toggleWatermark(i, bool)
    }
}

/**
 * @description 显示/隐藏所有pos
 * @param {boolean} bool
 */
const toggleAllPos = (bool: boolean) => {
    for (let i = 0; i < MAX_SPLIT; i++) {
        winDataList[i].showPos = bool
        togglePos(i, bool)
    }
}

/**
 * @description 设置录像状态
 * @param {string} chlId 通道id
 * @param {Arrray<string>} recordTypes 录像类型 ['motion', 'manual', ...]
 * @param {boolean} isRecording 是否正在录像
 */
const setRecordStatus = (chlId: string, recordTypes: string[], isRecording: boolean) => {
    const winIndexes = getWinIndexesByChlId(chlId)
    recordStatusChlMap[chlId] = {
        recordTypes: recordTypes,
        isRecording: isRecording,
    }
    for (let i = 0; i < winIndexes.length; i++) {
        toggleRecordStatus(winIndexes[i], recordTypes, isRecording)
    }
}

/**
 * @description 设置报警状态
 * @param {string} chlId 通道id
 * @param {string} alarmType 报警类型(只处理移动侦测和智能事件，详情见 screen.js中的 INTELIGENCE_CHLIDREN 和 MOTION_CHLIDREN )
 * @param {boolean} isAlarming 是否正在报警
 */
const setAlarmStatus = (chlId: string, alarmType: string, isAlarming: boolean) => {
    const winIndexes = getWinIndexesByChlId(chlId)
    alarmStatusChlMap[chlId] = {}
    if (!alarmStatusChlMap[chlId]) {
        alarmStatusChlMap[chlId] = {}
    }
    alarmStatusChlMap[chlId][alarmType] = isAlarming
    for (let i = 0; i < winIndexes.length; i++) {
        toggleAlarmStatus(winIndexes[i], alarmType, isAlarming)
    }
}

/**
 * @description 设置音量，取值0-100
 * @param {number} winIndex
 * @param {number} volume
 */
const setVolume = (winIndex: number, volume: number) => {
    playerList[winIndex]?.setVolume(volume)
}

/**
 * @description 打开声音, 此操作为互斥行为，即只能同时打开1个通道的声音
 * @param {number} winIndex
 */
const openAudio = (winIndex: number) => {
    // 先关闭所有通道的声音
    for (let i = 0; i < playerList.length; i++) {
        closeAudio(i)
    }
    playerList[winIndex]?.openAudio()
    winDataList[winIndex].audio = true
    toggleAudioIcon(winIndex, true)
}

/**
 * @description 关闭声音
 * @param {number} winIndex
 */
const closeAudio = (winIndex: number) => {
    playerList[winIndex]?.closeAudio()
    winDataList[winIndex].audio = false
    toggleAudioIcon(winIndex, false)
}

/**
 * @description 获取正在播放的窗口集合
 * @returns {Array}
 */
const getPlayingWinIndexList = () => {
    const list = []
    for (let i = 0; i < winDataList.length; i++) {
        if (winDataList[i] && winDataList[i].PLAY_STATUS === 'play') {
            list.push(i)
        }
    }
    return list
}

/**
 * @description 根据通道id获取窗口号(返回值为窗口号数组，因为可能存在多个窗口打开同一通道)
 * @param {String} chlId
 */
const getWinIndexesByChlId = (chlId: string) => {
    const winIndexes = []
    for (let i = 0; i < winDataList.length; i++) {
        const item = winDataList[i]
        if (item?.CHANNEL_INFO?.chlID === chlId) {
            winIndexes.push(i)
        }
    }
    return winIndexes
}

/**
 * @description 获取处于播放状态的通道集合
 * @returns {Array}
 */
const getPlayingChlList = () => {
    const list = []
    for (let i = 0; i < winDataList.length; i++) {
        if (winDataList[i] && winDataList[i].PLAY_STATUS === 'play') {
            list.push(winDataList[i])
        }
    }
    return list
}

const getChlList = () => {
    return [...winDataList]
}

/**
 * @description 获取空闲窗口集合
 * @returns {Array}
 */
const getFreeWinIndexes = () => {
    const list = []
    for (let i = 0; i < winDataList.length; i++) {
        if (!(winDataList[i] && winDataList[i].PLAY_STATUS === 'play')) {
            list.push(i)
        }
    }
    return list
}

/**
 * @description 获取所有窗口数据
 * @returns {PlayerWinDataListItem[]}
 */
const getWinData = () => {
    return winDataList
}

/**
 * @description 抓图
 * @param {number} winIndex
 * @param {string} fileName
 */
const snap = (winIndex: number, fileName: string) => {
    const config = playerList[winIndex]!.getCurrFrame()
    const frame = config.frame
    const player = config.WebGLPlayer
    const canvas = document.createElement('canvas')
    canvas.width = frame.width
    canvas.height = frame.height
    const webglPlayer = player(canvas, {
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
 * @description 更新尺寸
 */
const resizePlayer = () => {
    resize()
    // 遍历查看当前窗口是否处于原始比例状态，如果是则置为原始比例
    for (let i = 0; i < playerList.length; i++) {
        if (winDataList[i].original && playerList[i]) {
            displayOriginal(i, true)
        }
    }
}

/**
 * @description 开始本地录像
 * @param {number} winIndex
 */
const startRecord = (winIndex: number) => {
    if (playerList[winIndex]) {
        recordStartTime[winIndex] = Date.now() // 记录开始录像时间
        playerList[winIndex]!.startRecord()
        winDataList[winIndex].localRecording = true
    }
}

/**
 * @description 停止本地录像
 * @param {number} winIndex
 */
const stopRecord = (winIndex: number) => {
    if (playerList[winIndex]) {
        playerList[winIndex]!.stopRecord(true)
        winDataList[winIndex].localRecording = false
    }
}

/**
 * @description 开始全部本地录像
 */
const startAllRecord = () => {
    for (let i = 0; i < playerList.length; i++) {
        startRecord(i)
    }
}

/**
 * @description 停止全部本地录像
 */
const stopAllRecord = () => {
    for (let i = 0; i < playerList.length; i++) {
        stopRecord(i)
    }
}

/**
 * @description 获取pos配置
 */
const getPosCfg = () => {
    queryPosList().then((res) => {
        const $ = queryXml(res)
        if ($('status').text() !== 'success') return
        const $systemX = $('content/itemType/param/displaySetting/displayPosition/coordinateSystem/X')
        const $systemY = $('content/itemType/param/displaySetting/displayPosition/coordinateSystem/Y')
        const width = $systemX.attr('max').num() - $systemX.attr('min').num()
        const height = $systemY.attr('max').num() - $systemY.attr('min').num()
        setPosBaseSize({ width, height })
        posInfo = {}
        $('channel/chl').forEach((ele) => {
            const chlId = ele.attr('id')
            const $ele = queryXml(ele.element)
            const previewDisplay = $ele('previewDisplay').text().bool()
            const printMode = $ele('printMode').text()
            posInfo[chlId] = {
                previewDisplay: previewDisplay, // 现场预览是否显示pos
                printMode: printMode as 'page' | 'scroll', // pos显示模式：page翻页/scroll滚屏
                displayPosition: {
                    // pos显示区域
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                },
                timeout: 10, // pos超时隐藏时间，默认10秒
            }
        })
        $('content/item').forEach((ele) => {
            const $ele = queryXml(ele.element)
            const $position = 'param/displaySetting/displayPosition/'
            const $triggerChls = $ele('trigger/triggerChl/chls/item')
            const timeout = $ele('param/displaySetting/common/timeOut').text()
            if (!$triggerChls.length) return
            const displayPosition = {
                x: $ele(`${$position}X`).text().num(),
                y: $ele(`${$position}Y`).text().num(),
                width: $ele(`${$position}width`).text().num(),
                height: $ele(`${$position}height`).text().num(),
            }
            $triggerChls.forEach((item) => {
                const chlId = item.attr('id')
                if (posInfo[chlId]) {
                    posInfo[chlId].displayPosition = displayPosition
                    posInfo[chlId].timeout = Number(timeout)
                }
            })
        })
    })
}

/**
 * @description 处理pos信息
 * @param {Uint8Array} posFrame
 * @param {number} posLength
 * @param {string} chlId
 * @param {number} winIndex
 */
const handlePos = (posFrame: Uint8Array, posLength: number, chlId: string, winIndex: number) => {
    if (!posInfo) {
        return
    }
    const cfg = posInfo[chlId]
    if (prop.type === 'live') {
        if (!cfg.previewDisplay) {
            return
        } else {
            // 现场预览默认打开pos
            togglePos(winIndex, true)
        }
    }
    drawPos(posFrame, posLength, cfg, winIndex, chlId)
}

/**
 * @description 处理https访问时的视频播放
 */
const handleHttpsPlay = () => {
    if (prop.type === 'live') {
        openNotify(formatHttpsTips(Translate('IDCS_LIVE_PREVIEW')), true)
    } else if (prop.type === 'record') {
        openNotify(formatHttpsTips(Translate('IDCS_REPLAY')), true)
    }
}

/**
 * @description UI1-E 获取通道IP
 */
const getChlIp = () => {
    queryDevOsdDisplayCfg().then((res) => {
        const $ = queryXml(res)
        if ($('status').text() !== 'success') return
        if ($('content/addressSwitch').text().bool()) {
            // 若为true则可以显示ip地址
            const sendXml = rawXml`
                <requireField>
                    <ip/>
                </requireField>
            `
            queryDevList(sendXml).then((res) => {
                const $ = queryXml(res)
                if ($('status').text() !== 'success') return
                chlIpMap = {}
                $('content/item').forEach((item) => {
                    const $el = queryXml(item.element)
                    const ip = $el('ip').text()
                    const id = item.attr('id')
                    chlIpMap[id] = ip
                })
                winDataList.forEach((item) => {
                    if (item.CHANNEL_INFO) {
                        for (const key in chlIpMap) {
                            if (item.CHANNEL_INFO.chlID === key) {
                                setChlIp(item.winIndex, key)
                                break
                            }
                        }
                    }
                })
            })
        }
    })
}

/**
 * @description UI1-E 设置通道IP
 * @param winIndex
 * @param chlId
 */
const setChlIp = (winIndex: number, chlId: string) => {
    if (import.meta.env.VITE_UI_TYPE === 'UI1-E') {
        setIpToScreen(winIndex, chlIpMap[chlId])
    }
}

const ready = ref(false)

const mode = computed(() => {
    return prop.onlyWasm ? 'h5' : pluginStore.currPluginMode === 'h5' ? 'h5' : 'ocx'
})

const readyState = computed(() => {
    if (mode.value === 'h5') return ready.value
    else return ready.value && pluginStore.ready
})

let lastScreenSize = 0

const resizeObserver = new ResizeObserver(() => {
    const rect = $screen.value!.getBoundingClientRect()
    const currentScreenSize = rect.width * rect.height
    if (rect.width && rect.height && lastScreenSize !== currentScreenSize) {
        resize()
        lastScreenSize = currentScreenSize
        if (!ready.value) {
            nextTick(() => {
                ready.value = true
            })
        }
    }
})

const handleOCXMessage = ($: XMLQuery, stateType: string) => {
    return emits('message', $, stateType)
}

createVideoPlayer()

onMounted(() => {
    tryToGetVideoLossLogo(prop.type === 'live')
    splitValue.value = prop.split
    resizeObserver.observe($screen.value!)
})

onBeforeUnmount(() => {
    resizeObserver.disconnect()
    destroy()
    emits('destroy')
})

/**
 * @description OCX或wasm播放器就绪后执行回调. 确保对OCX或wasm播放器的操作在ready之后
 */
watch(
    readyState,
    (val) => {
        if (val) {
            emits('ready')
            if (mode.value === 'ocx') {
                nextTick(() => {
                    plugin.DisplayOCX(true)
                    plugin.SetPluginSize(null, undefined, true)
                })
            }
        }
    },
    {
        immediate: true,
    },
)

const stopWatchSplit = watch(
    () => prop.split,
    () => {
        if (mode.value === 'h5') {
            setSplit(prop.split)
        } else {
            stopWatchSplit()
        }
    },
)

const player = {
    play,
    getWinIndexByCav,
    stop,
    stopAll,
    pause,
    pauseAll,
    resume,
    resumeAll,
    setSplit,
    getSplit,
    seek,
    setSpeed,
    nextFrame,
    keyFramePlay,
    allFramePlay,
    displayOriginal,
    zoomOut,
    zoomIn,
    setPollingState,
    zoom3D,
    toggleOSD,
    toggleWatermark: toggleAllWatermark,
    togglePos: toggleAllPos,
    setRecordStatus,
    setAlarmStatus,
    fullscreen,
    setVolume,
    openAudio,
    closeAudio,
    getPlayingWinIndexList,
    getWinIndexesByChlId,
    getPlayingChlList,
    getChlList,
    getFreeWinIndexes,
    getSelectedWinIndex,
    getWinData,
    snap,
    resize: resizePlayer,
    getDrawbordCanvas: getOverlayCanvas,
    startRecord,
    stopRecord,
    startAllRecord,
    stopAllRecord,
    getChlIp,
    setPollIndex,
    showErrorTips,
    hideErrorTips,
}

export type PlayerReturnsType = typeof player

defineExpose({
    player,
    plugin,
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
    background-color: var(--player-bg);

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
        background-color: var(--player-bg);

        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: calc(100% - 2px);
            height: calc(100% - 2px);
            border: 1px solid var(--player-split-border);
            pointer-events: none;
        }

        &.selected {
            &::after {
                border-color: var(--primary);
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
                color: var(--player-error-text);
                opacity: 0.8;
            }

            &-chl-name {
                position: absolute;
                left: 5px;
                top: 5px;
                font-size: 14px;
                color: var(--player-error-text);
            }

            &.mask {
                background-color: var(--player-bg);
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

            .Sprite {
                margin-left: 10px;

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
            color: var(--player-osd-text);
            text-shadow:
                -1px -1px 0 var(--player-osd-shadow),
                1px -1px 0 var(--player-osd-shadow),
                -1px 1px 0 var(--player-osd-shadow),
                1px 1px 0 var(--player-osd-shadow);

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
            color: var(--player-osd-text);
            text-shadow:
                -1px -1px 0 var(--player-osd-shadow),
                1px -1px 0 var(--player-osd-shadow),
                -1px 1px 0 var(--player-osd-shadow),
                1px 1px 0 var(--player-osd-shadow);

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
            color: var(--player-pos-text);
            text-shadow:
                -1px -1px 0 var(--player-pos-shadow),
                1px -1px 0 var(--player-pos-shadow),
                -1px 1px 0 var(--player-pos-shadow),
                1px 1px 0 var(--player-pos-shadow);

            &.hide {
                display: none;
            }

            &-item {
                word-break: break-all;
                white-space: pre-wrap;
                font-size: 18px;
                line-height: 20px;
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
