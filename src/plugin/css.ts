/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-05-18 10:31:48
 * @Description: 加载全局样式
 */

// import type { App } from 'vue'
// import { getFileNameNoExtFromPath } from '@/utils/tools'
// const publicCSS = import.meta.glob('/src/views/UI_PUBLIC/publicStyle/*.scss', { eager: true })
// let uiCss: Record<string, any> = {}
// 新增UI后，需要在这里增加 --- TODO: 待优化，通过Vite插件动态扫描文件的方式引入
// if (__UI_1__) {
//     uiCss = import.meta.glob(`/src/views/UI1/theme/*/*.scss?url`, { eager: true })
// }
// if (__UI_2__) {
//     uiCss = import.meta.glob(`/src/views/UI2/theme/*/*.scss?url`, { eager: true })
// }
// if (__UI_3__) {
//     uiCss = import.meta.glob(`/src/views/UI3/theme/*/*.scss?url`, { eager: true })
// }
import '@/views/UI_PUBLIC/publicStyle/common.scss'
import '@/views/UI_PUBLIC/publicStyle/element.scss'
import '@/views/UI_PUBLIC/publicStyle/global.scss'
import '@ui/publicStyle/global.scss'

// import '@/views/UI1-B/publicStyle/global.scss'
// import
// const uiCss = import.meta.glob(`@style/*.scss?url`, { eager: true })
// for (const path in uiCss) {
//     if (path.startsWith('global')) {
//         import(path)
//     }
// }
// import(`@/views/${import.meta.env.VITE_UI_TYPE}/publicStyle/global.scss`)
// export default {
//     install: () => {
//         // 当前UI前缀
//         // const uiPathPre = `/src/views/${options['ui']}/theme/${options['theme']}/`
//         // 先加载UI-PUBLIC样式
//         // for (let path in publicCSS) {
//         //     // 帮助vite静态代码分析
//         //     // 解决报警信息：
//         //     // The above dynamic import cannot be analyzed by Vite.
//         //     // See https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations for supported dynamic import formats.
//         //     // If this is intended to be left as-is, you can use the /* @vite-ignore */ comment inside the import() call to suppress this warning.
//         //     let fileName = getFileNameNoExtFromPath(path)
//         //     // 浏览器控制台警告：Default import of CSS without `?inline` is deprecated. Add the `{ query: '?inline' }` glob option to fix this.
//         //     // 加上{ query: '?inline' }后vite会提示无法静态分析，先不加，目前测试没有影响，先这里记录 ，后续再研究
//         //     import(`../views/UI_PUBLIC/publicStyle/${fileName}.scss`)
//         //     // console.log("--load public css:" + `../views/UI_PUBLIC/publicStyle/${fileName}.scss`);
//         // }
//         // 再加载当前UI的差异样式
//         // for (let path in uiCss) {
//         //     if (path.startsWith(uiPathPre)) {
//         //         let fileName = getFileNameNoExtFromPath(path)
//         //         import(`../views/${options['ui']}/theme/${options['theme']}/${fileName}.scss`)
//         //         // console.log("--load ui css:" + `../views/${options['ui']}/theme/${options['theme']}/${fileName}.scss`);
//         //     }
//         // }
//         // import('@/views/UI_PUBLIC/publicStyle/common.scss')
//         // import('@/views/UI_PUBLIC/publicStyle/element.scss')
//         // import('@/views/UI_PUBLIC/publicStyle/global.scss')
//         import(`@/views/${import.meta.env.VITE_UI_TYPE}/publicStyle/global.scss`)
//         // @import "@/views/UI_PUBLIC/publicStyle/global.scss";
//         // @import "@/views/#{$GLOBAL_UI_TYPE}/publicStyle/global.scss";
//     },
// }
