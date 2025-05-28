/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2025-04-12 21:43:45
 * @Description: 获取元素的文本，并将文本设置title属性值
 */
import { type App } from 'vue'

const setAutoTitle = (el: HTMLElement) => {
    // 如果是<el-form>，则为所有el-form-label根据其文本值设置title
    if (el.classList.contains('el-form')) {
        const selectors = el.querySelectorAll('.el-form-item__label')
        for (const selector of selectors) {
            const innerText = (selector as HTMLElement).innerText.trim()
            if (innerText) {
                selector.setAttribute('title', innerText)
            }
        }
    }
    // 如果是<el-table>，则为thead下所有tr根据其文本值设置title
    else if (el.classList.contains('el-table')) {
        const selectors = el.querySelectorAll('.el-table__header .cell')
        for (const selector of selectors) {
            const innerText = (selector as HTMLElement).innerText.trim()
            if (innerText) {
                selector.setAttribute('title', innerText)
            }
        }
    }
    // 如果是<el-tabs>，则为el-tabs__header下所有菜单根据其文本值设置title
    else if (el.classList.contains('el-tabs')) {
        const selectors = el.querySelectorAll('&>.el-tabs__header .el-tabs__item')
        for (const selector of selectors) {
            const innerText = (selector as HTMLElement).innerText.trim()
            if (innerText) {
                selector.setAttribute('title', innerText)
            }
        }
    }
    // 如果是<el-transfer>，则为el-checkbox__label下所有菜单根据其文本值设置title
    else if (el.classList.contains('el-transfer')) {
        const selectors = el.querySelectorAll('.el-checkbox-group .el-checkbox__label')
        for (const selector of selectors) {
            const innerText = (selector as HTMLElement).innerText.trim()
            if (innerText) {
                selector.setAttribute('title', innerText)
            }
        }
    }
    // 其他元素根据其文本值设置title
    else {
        el.setAttribute('title', el.innerText)
    }
}

export const autoTitle = (app: App<Element>) => {
    app.directive('title', {
        mounted(el: HTMLElement) {
            nextTick(() => setAutoTitle(el))
        },
        updated(el: HTMLElement) {
            nextTick(() => setAutoTitle(el))
        },
    })
}
