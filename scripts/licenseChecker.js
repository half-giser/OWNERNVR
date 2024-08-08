/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-07 15:12:23
 * @Description: 生成license列表文件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-07 16:13:10
 */
import checker from 'license-checker-rseidelsohn'
import fs from 'node:fs'

const MAIN_DEPENDENCY = {
    vue: {
        licensePath: 'https://github.com/vuejs/core/blob/main/LICENSE',
        target: 'UI框架',
    },
    'vue-router': {
        licensePath: 'https://github.com/vuejs/router/blob/main/LICENSE',
        target: 'URL路由器，用于URL切换',
    },
    'element-plus': {
        licensePath: 'https://github.com/element-plus/element-plus/blob/master/LICENSE',
        target: 'UI组件库，用于页面搭建',
    },
    axios: {
        licensePath: 'https://github.com/axios/axios/blob/master/LICENSE',
        target: '处理、拦截HTTP请求',
    },
    pinia: {
        licensePath: 'https://github.com/vuejs/pinia/blob/v2/LICENSE',
        target: '用于全局状态存储',
    },
    'pinia-plugin-persistedstate': {
        licensePath: 'https://github.com/prazdevs/pinia-plugin-persistedstate/blob/main/LICENSE',
        target: '用于全局状态的持久化存储',
    },
    qrcode: {
        licensePath: 'https://github.com/soldair/node-qrcode/blob/master/license',
        target: '用于二维码生成',
    },
    '@bassist/progress': {
        licensePath: 'https://github.com/chengpeiquan/chengpeiquan.com/blob/main/LICENSE',
        target: '用于进度条组件显示',
    },
    '@bassist/utils': {
        licensePath: 'https://github.com/chengpeiquan/chengpeiquan.com/blob/main/LICENSE',
        target: '用于进度条组件显示',
    },
    'crypto-js': {
        licensePath: 'https://github.com/brix/crypto-js/blob/develop/LICENSE',
        target: '用于数据加密、哈希',
    },
    'js-base64': {
        licensePath: 'https://github.com/dankogai/js-base64/blob/main/LICENSE.md',
        target: '用于Base64编解码',
    },
    'js-md5': {
        licensePath: 'https://github.com/emn178/js-md5/blob/master/LICENSE.txt',
        target: '用于MD5哈希',
    },
    jsencrypt: {
        licensePath: 'https://github.com/travist/jsencrypt/blob/master/LICENSE.txt',
        target: '用于数据加密',
    },
    jalaliday: {
        licensePath: 'https://github.com/alibaba-aero/jalaliday/blob/master/LICENSE',
        target: '用于公历与波斯日历的转换',
    },
}

checker.init(
    {
        start: './',
    },
    (err, packages) => {
        if (err) {
            console.log(err)
        } else {
            const result = Object.entries(packages)
                .map((item) => {
                    const key = item[0].split('@')
                    const value = item[1]
                    const version = key.pop()
                    const name = key.join('@')
                    const licensePath = MAIN_DEPENDENCY[name]?.licensePath || ''
                    const target = MAIN_DEPENDENCY[name]?.target || ''
                    return {
                        name: name,
                        version: version,
                        target: target,
                        repository: value.repository || '',
                        licensePath: licensePath,
                        licenses: value.licenses || '',
                    }
                })
                .sort((a, b) => {
                    if (a.target && !b.target) return -1
                    else if (a.target && b.target) return 0
                    else return 1
                })
                .map((item, index) => {
                    return `${index + 1},${item.name},${item.version},${item.target},${item.repository},${item.licensePath},${item.licenses}`
                })
                .join('\n')
            const text = `序号,第三方组件名称,版本,使用说明,下载地址,licence地址,许可证类型\n${result}`
            fs.writeFile('./licenses.csv', text, 'utf8', (err) => {
                if (err) {
                    console.err(err)
                }
            })
        }
    },
)
