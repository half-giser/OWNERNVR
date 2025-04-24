/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-26 10:39:12
 * @Description: 监听和收集表格发生变化的行
 *
 * 注意：watcher不会记录原始值，只要值发生变化，就认为行已发生变化
 * 也就是哪怕后面更改回了原始值，也认为已经发生了变化
 */
import { type WatchStopHandle } from 'vue'

export const useWatchEditRows = <T extends TableRowStatus>() => {
    const editRows = ref<Set<T>>(new Set())
    const watcher = new Map<T, WatchStopHandle>()

    /**
     * @description 停止侦听，并清除所有记录的数据 (在获取数据前重置侦听)
     */
    const clear = () => {
        off()
        editRows.value.clear()
    }

    /**
     * @description 停止侦听，但不清除记录的数据
     */
    const off = () => {
        watcher.forEach((stopWatch) => {
            stopWatch()
        })
        watcher.clear()
    }

    /**
     * @description 侦听该行的变化
     * @param {T} item
     */
    const listen = (item: T) => {
        watcher.set(
            item,
            watch(
                () => JSON.stringify(item),
                (newItem, oldItem) => {
                    const cloneItem = JSON.parse(newItem)
                    const cloneOldItem = JSON.parse(oldItem)
                    cloneItem.disabled = false
                    cloneItem.status = ''
                    cloneItem.statusTip = ''
                    cloneOldItem.disabled = false
                    cloneOldItem.status = ''
                    cloneOldItem.statusTip = ''
                    if (!isEqual(cloneItem, cloneOldItem)) {
                        const stopWatch = watcher.get(item)
                        if (stopWatch) {
                            stopWatch()
                        }
                        editRows.value.add(item as any)
                    }
                },
                {
                    deep: true,
                },
            ),
        )
    }

    /**
     * @description 移除该行记录（在数据下发成功后重置改行侦听）
     * @param item
     */
    const remove = (item: T) => {
        nextTick(() => {
            editRows.value.delete(item as any)
            listen(item)
        })
    }

    /**
     * @description 判断该行是否发生了变化
     * @param item
     */
    const has = (item: T) => {
        return editRows.value.has(item as any)
    }

    /**
     * @description 返回发生变化的行的数量
     * @returns {number}
     */
    const size = () => {
        return editRows.value.size
    }

    /**
     * @description 返回所有发生变化的行
     * @returns {Array}
     */
    const toArray = () => {
        return Array.from(editRows.value) as T[]
    }

    onBeforeUnmount(() => {
        clear()
    })

    return {
        listen,
        clear,
        remove,
        off,
        has,
        size,
        toArray,
    }
}
