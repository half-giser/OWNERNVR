/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-26 10:39:12
 * @Description: 监听和收集表格发生变化的行
 */
import { type WatchStopHandle } from 'vue'
import { type TableRowStatus } from '@/types/apiType/base'

export const useWatchEditRows = <T extends TableRowStatus>() => {
    const editRows = ref<Set<T>>(new Set())
    const watcher = new Map<T, WatchStopHandle>()

    /**
     * @description 清除所有记录的数据
     */
    const clear = () => {
        off()
        editRows.value.clear()
    }

    /**
     * @description 暂停侦听，不清除记录的数据
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
                () => item,
                () => {
                    editRows.value.add(item as any)
                },
                {
                    deep: true,
                },
            ),
        )
    }

    /**
     * @description 移除该行记录
     * @param item
     */
    const remove = (item: T) => {
        nextTick(() => {
            editRows.value.delete(item as any)
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
