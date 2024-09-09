/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-07 15:12:23
 * @Description: 批量打包多UI
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-02 09:03:11
 */
import { exec } from 'node:child_process'
import Chalk from 'chalk'

// const ui = ['UI1-A', 'UI1-B', 'UI1-C', 'UI1-D', 'UI1-E', 'UI1-F', 'UI1-G', 'UI1-J', 'UI1-K', 'UI2-A']
const ui = ['UI1-A', 'UI1-B']

async function generateSingle(ui: string) {
    return new Promise((resolve, reject) => {
        exec(`vite --mode prod,${ui} build`, (err) => {
            if (err) {
                console.error(err)
                reject(void 0)
            }
            resolve(void 0)
        })
    })
}

async function generate() {
    const env = process.argv[process.argv.length - 1]
    const uiList = env === 'all' ? ui : [env]
    for (let i = 0; i < uiList.length; i++) {
        try {
            const ui = uiList[i]
            console.log(Chalk.bgCyanBright.bold(ui), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.white(`Build ${ui} start`))
            await generateSingle(ui[i])
            console.log(Chalk.bgGreenBright.bold(ui), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.white(`Build ${ui} end`))
        } catch {
            console.log(Chalk.bgRedBright.bold(ui), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.white(`Build ${ui} error`))
        }
    }
}

generate()
