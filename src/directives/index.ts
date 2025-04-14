/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-28 15:28:32
 * @Description: 注册所有的自定义指令（在main.js中引入并调用）
 */
import { type App } from 'vue'
import { dompurify } from './dompurify'
import { autoTitle } from './autoTitle'

export const regAllDirective = (app: App<Element>) => {
    dompurify(app)
    autoTitle(app)
}
