/*
 * @Author: tengxiang
 * @Date: 2024-05-30 08:58:30
 * @Description: Loading
 */

/**
 * 对同一个对象loading时，不再创建新的loading遮盖，否则会有多个loading遮盖重叠，显示效果不佳
 * 对同一个对象loading时，进行计数，打开时+1,关闭时-1，当loading对象已存在时不再新建loading，当计数为0时关闭loading
 * 当打开fullscreen loading时，关闭其他loading，并将count累加，此后在loading关闭前都对这个唯一的当打开fullscreen loading计数
 */
const loadingInstMap = new Map() as Map<string | HTMLElement, ReturnType<typeof ElLoading.service>>

export const LoadingTarget = {
    MainContent: 'MainContent',
    ConfigContent: 'ConfigContent',
    FullScreen: 'FullScreen',
}

/**
 * @description: 打开loading
 * @param {string} target 可处传递LoadingTarget常量，或自定义的选择器字符串
 * @param {string} text 自定义loding时显示的文本
 */
export const openLoading = (target: string | HTMLElement = 'FullScreen', text?: string) => {
    const { Translate } = useLangStore()
    const layoutStore = useLayoutStore()

    // 没有打开全屏loading时，局部loading间可同时打开，不处理相互覆盖的情况
    const inst = ElLoading.service({
        fullscreen: target === LoadingTarget.FullScreen ? true : false,
        target: getTarget(target) as string | HTMLElement,
        lock: true,
        text: typeof text === 'undefined' ? Translate('IDCS_LOADING') : text,
        svg: ' ',
    })
    loadingInstMap.set(target, inst)
    layoutStore.loadingCount = loadingInstMap.size
}

/**
 * @description 关闭loading
 */
export const closeLoading = (target: string | HTMLElement = 'FullScreen') => {
    const layoutStore = useLayoutStore()
    if (loadingInstMap.has(target)) {
        loadingInstMap.get(target)?.close()
        loadingInstMap.delete(target)
    }
    layoutStore.loadingCount = loadingInstMap.size
}

/**
 * @description 关闭所有loading
 */
export const closeAllLoading = () => {
    const layoutStore = useLayoutStore()
    loadingInstMap.forEach((item) => {
        item.close()
    })
    loadingInstMap.clear()
    layoutStore.loadingCount = 0
}

/**
 * @description
 * @param {string | HTMLElement} target
 * @returns {string | HTMLElement}
 */
const getTarget = (target: string | HTMLElement) => {
    if (target instanceof HTMLElement) {
        return target
    }

    switch (target) {
        case LoadingTarget.MainContent:
            return '#layoutMainBody'
        case LoadingTarget.ConfigContent:
            return '#layout2Content'
        default:
            return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || target
    }
}
