/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-12 10:24:36
 * @Description: 优化vite预构建，解决终端optimized dependencies changed. reloading的问题
 * 优化多UI在开发环境的路由切换
 */
import fs from 'node:fs'

const optimizeDepsIncludes = ['element-plus/es', '@element-plus/icons-vue']
fs.readdirSync('node_modules/element-plus/es/components').map((dirname) => {
    fs.access(`node_modules/element-plus/es/components/${dirname}/style/css.mjs`, (err) => {
        if (!err) {
            optimizeDepsIncludes.push(`element-plus/es/components/${dirname}/style/css`)
        }
    })
})

export default optimizeDepsIncludes
