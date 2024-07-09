/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-13 13:43:45
 * @Description: 防XSS攻击DOM过滤
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-28 18:49:46
 */
import { type App } from 'vue'
import { sanitize } from '@/utils/sanitize'

export const dompurify = (app: App<Element>) => {
    app.directive('clean-html', {
        mounted(el, binding) {
            el.innerHTML = sanitize(binding.value) 
        },
        updated(el, binding) {
            el.innerHTML = sanitize(binding.value)
        },
    })
}
