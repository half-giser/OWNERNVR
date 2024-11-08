/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-07 15:12:23
 * @Description: 批量打包多UI
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-11-07 09:10:27
 */
import { exec } from 'node:child_process'
import Chalk from 'chalk'
import Inquirer from 'inquirer'

const ui = ['UI1-A', 'UI1-B', 'UI1-C', 'UI1-D', 'UI1-E', 'UI1-F', 'UI1-G', 'UI1-J', 'UI1-K', 'UI2-A']

async function generateSingle(ui: string) {
    return new Promise((resolve, reject) => {
        const command = exec(`vite --mode prod,${ui} build`, (err) => {
            if (err) {
                console.error(err)
                reject(void 0)
            }
            resolve(void 0)
        })
        command.stdout?.pipe(process.stdout)
    })
}

async function generate() {
    console.log(
        Chalk.blue('?'),
        Chalk.yellow.bold('请选择您需要打包的UI类型 (支持多选)：'),
        Chalk.white('（按压'),
        Chalk.cyanBright('<空格键>'),
        Chalk.white('选中，按压'),
        Chalk.cyanBright('<上下箭头>'),
        Chalk.white('可切换选项，按压'),
        Chalk.cyanBright('<a>'),
        Chalk.white('可全选/取消全选，按压'),
        Chalk.cyanBright('<回车键>'),
        Chalk.white('确认选项，并开始打包）'),
    )
    const answers: { UI_TYPE: string[] } = await Inquirer.prompt([
        {
            name: 'UI_TYPE',
            type: 'checkbox',
            message: 'Choose UIs you need to package (Multi-select support)',
            loop: false,
            choices: ui,
            validate(input) {
                if (input.length) {
                    return true
                }
                return 'You must choose at least one UI.'
            },
        },
    ])

    const uiList = answers.UI_TYPE
    console.log(Chalk.white('Ready to build: '), Chalk.redBright(uiList.join(',')))
    for (let i = 0; i < uiList.length; i++) {
        const ui = uiList[i]
        try {
            console.log(Chalk.bgCyanBright.bold(ui), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.white(`Build ${ui} start, please wait...`))
            await generateSingle(ui)
            console.log(Chalk.bgGreenBright.bold(ui), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.white(`Build ${ui} end`))
        } catch {
            console.log(Chalk.bgRedBright.bold(ui), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.white(`Build ${ui} error`))
        }
    }
    console.log(Chalk.greenBright('Done!'))
    process.exit(0)
}

generate()
