/*
 * @Author: tengxiang
 * @Date: 2024-05-30 08:58:30
 * @Description: Loading
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-03 11:04:58
 */
import { useLangStore } from '@/stores/lang'

interface LoadingItem {
    inst: any
    count: number
}

/**
 * 对同一个对象loading时，不再创建新的loading遮盖，否则会有多个loading遮盖重叠，显示效果不佳
 * 对同一个对象loading时，进行计数，打开时+1,关闭时-1，当loading对象已存在时不再新建loading，当计数为0时关闭loading
 * 当打开fullscreen loading时，关闭其他loading，并将count累加，此后在loading关闭前都对这个唯一的当打开fullscreen loading计数
 */
const loadingInstMap = new Map() as Map<string | HTMLElement, LoadingItem>
let fullScreenInst: null | ReturnType<typeof ElLoading.service> = null
let fullScreenCount = 0

/**
 *  openLoading()：打开loading，默认仅遮盖#layoutMainBody
 *  openLoading(string| HTMLElement)：可处传递LoadingTarget常量，或自定义的选择器字符串，或HTMLElement，如：
 *  openLoading(LoadingTarget.ConfigContent);
 *  openLoading('.some-element');
 *  openLoading(document.querySelector('.el-table--fit') as HTMLElement);
 *  openLoading(string| HTMLElement, string)： 自定义loding时显示的问题，如：
 *  openLoading(LoadingTarget.ConfigContent, 'some message');
 *  closeLoading()：关闭loading
 *
 */
const useLoading = () => {
    const LoadingTarget = {
        MainContent: 'MainContent',
        ConfigContent: 'ConfigContent',
        FullScreen: 'FullScreen',
    }

    const { Translate } = useLangStore()
    /**
     * @description: 打开loading
     * @return {*}
     */
    const openLoading = (target: string | HTMLElement = 'MainContent', text: string = Translate('IDCS_LOADING')) => {
        //当前已经打开了全屏loading
        if (fullScreenInst != null) {
            fullScreenCount++
            // console.log("fullscreen loading already opend, other loading not open", target, gbp.fullScreenCount)
            return
        }

        //打开全屏loading
        if (target === LoadingTarget.FullScreen) {
            fullScreenInst = ElLoading.service({
                fullscreen: true,
                target: getTarget(target),
                lock: true,
                background: 'rgba(255, 255, 255, 0.8)',
                text: text,
            })
            fullScreenCount = 1
            // 将其他局部loading的count都加到全屏loading的count，后面打开关闭任何loading都是对全局loading计数
            loadingInstMap.forEach((value: LoadingItem) => {
                fullScreenCount += value.count
            })
            // console.log("open fullscreen loading, close all part loading...", target, gbp.fullScreenCount)
            closeAllPartLoading()
            return
        }

        //没有打开全屏loading时，局部loading间可同时打开，不处理相互覆盖的情况
        if (loadingInstMap.has(target)) {
            loadingInstMap.get(target)!.count++
        } else {
            const inst = ElLoading.service({
                target: getTarget(target),
                lock: true,
                background: 'rgba(255, 255, 255, 0.8)',
                text: text,
            })
            loadingInstMap.set(target, { inst, count: 1 })
        }
    }

    const closeAllPartLoading = () => {
        loadingInstMap.forEach((value: LoadingItem) => {
            closeInst(value.inst)
        })
        loadingInstMap.clear()
    }

    /**
     * @description: 关闭loading
     * @return {*}
     */
    const closeLoading = (target: string | HTMLElement = 'MainContent') => {
        //当前已经打开了全屏loading
        if (fullScreenInst != null) {
            if (fullScreenCount !== 0) fullScreenCount--
            if (fullScreenCount === 0) {
                const inst = fullScreenInst
                closeInst(inst)
                fullScreenInst = null
            }
            // console.log("closeLoading fullscreen", target, gbp.fullScreenCount)
            return
        }

        if (loadingInstMap.has(target)) {
            const item = loadingInstMap.get(target) as LoadingItem
            item.count--
            if (item.count == 0) {
                closeInst(item.inst)
                loadingInstMap.delete(target)
            }
            // console.log('closeLoading', target, item.count)
            // console.log('gbp.loadingInstMap', gbp.loadingInstMap)
        } else {
            console.warn('loading target not found, close all...', target)
            //如果传入的target没找到，将所有loading关闭
            closeAllPartLoading()
        }
    }

    const closeAllLoading = () => {
        // console.log('closeAllLoading')
        if (fullScreenInst != null) {
            closeInst(fullScreenInst)
            fullScreenCount = 0
        }
        closeAllPartLoading()
    }

    const closeInst = (inst: any) => {
        nextTick(() => {
            // Loading should be closed asynchronously
            inst.close()
        })
    }

    const getTarget = (target: string | HTMLElement) => {
        if (target instanceof HTMLElement) {
            return target
        }
        switch (target) {
            case LoadingTarget.MainContent:
                return '#layoutMainBody'
            case LoadingTarget.ConfigContent:
                return '.configBorder'
            default:
                return target
        }
    }

    return {
        LoadingTarget,
        openLoading,
        closeLoading,
        closeAllLoading,
    }
}

export default useLoading
