/*
 * @Date: 2025-06-03 09:11:00
 * @Description: 由于el-select在页面滚动的时候不会自动关闭，所以需要自定义滚动事件监听
 * 目前实现方案只监听滑轮事件
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
export const usePopperObserver = defineStore('PopperObserver', () => {
    const event = CreateEvent()

    const addListener = (cbk: (target: HTMLElement) => void) => {
        event.addListener(cbk)
    }

    const removeListener = (cbk: (target: HTMLElement) => void) => {
        event.removeListener(cbk)
    }

    const create = () => {
        useEventListener(document.body, 'mousewheel', trigger, false)
        useEventListener(document.body, 'DOMMouseScroll', trigger, false)
    }

    const trigger = (e: Event) => {
        console.log(e)
        const target = e.target as HTMLElement
        event.emit(target)
    }

    const isCurrentTarget = (target: HTMLElement, classList: string) => {
        if (target.classList.contains(classList)) {
            return true
        } else {
            if (target.parentElement) {
                return isCurrentTarget(target.parentElement, classList)
            } else {
                return false
            }
        }
    }

    const observe = (cbk: () => void, classList: string) => {
        return (target: HTMLElement) => {
            if (isCurrentTarget(target, classList)) {
                return
            }
            cbk()
        }
    }

    return {
        create,
        addListener,
        removeListener,
        observe,
    }
})
