/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-12 14:16:44
 * @Description: 自定义事件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-12 14:24:17
 */
export class EventEmitter {
    eventName: string

    listeners: ((...arg: any[]) => void)[] = []

    constructor(eventName: string) {
        this.eventName = eventName
        // this.listeners = []
    }

    addListener(listener: (...arg: any[]) => void) {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener)
        }
    }

    removeListener(listener: (...arg: any[]) => void) {
        const index = this.listeners.indexOf(listener)
        if (index > -1) {
            this.listeners.splice(index, 1)
        }
    }

    emit(...arg: any[]) {
        this.listeners.forEach((item) => {
            item(...arg)
        })
    }
}

export const CreateEvent = (eventName: string) => new EventEmitter(eventName)
