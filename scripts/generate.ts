/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-07 15:12:23
 * @Description: 批量打包多UI
 * 命令行格式： npm run generate bundle=UI1-A,UI2-A_IL03,UI1-E_USE44
 * npm run generate bundle=UI1-A_TVT p2p=2.2.0.0_17782 (同时生成P2P ZIP发布件)
 */
import { exec } from 'node:child_process'
import fs from 'node:fs/promises'
import fsStream from 'node:fs'
import path from 'node:path'
import Chalk from 'chalk'
import Inquirer from 'inquirer'
import Archiver from 'archiver'

const LEGAL_UI = ['UI1-A', 'UI1-B', 'UI1-C', 'UI1-D', 'UI1-E', 'UI1-F', 'UI1-G', 'UI1-J', 'UI1-K', 'UI2-A']
const LEGAL_CUSTOMER_ID = ['IL03', 'PL14', 'TVT', 'USE44', 'USW02']

function print(head: string, body: string, type = 'info') {
    if (type === 'error') {
        return console.log(Chalk.bgRedBright.bold(head), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.red(body))
    } else {
        console.log(Chalk.bgCyanBright.bold(head), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.white(body))
    }
}

function getDateTime() {
    const date = new Date()
    return `${date.getFullYear()}${('00' + (date.getMonth() + 1)).slice(-2)}${('00' + date.getDate()).slice(-2)}`
}

function getDistName(...str: string[]) {
    return path.resolve('dist', str.join('_'))
}

async function generateUI(ui: string) {
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

async function generateCustomerPackage(ui: string, customer: string) {
    const sourcePath = path.resolve('dist', ui)

    if (!customer) {
        const standardPath = getDistName(ui, 'STANDARD')
        await copyDir(sourcePath, standardPath)
        await copyDir(path.resolve('plugin/OCX'), path.resolve(standardPath, 'OCX'))

        const p2pPath = getDistName(ui, 'P2P')
        await copyDir(sourcePath, p2pPath)
        await copyDir(path.resolve('plugin/OCX_P2P'), path.resolve(p2pPath, 'OCX'))
    } else {
        const standardPath = getDistName(ui, customer)
        await copyDir(sourcePath, standardPath)
        await copyDir(path.resolve(`plugin/OEM/${customer}`), path.resolve(standardPath, 'OCX'))

        const p2pPath = getDistName(ui, customer, 'P2P')
        await copyDir(sourcePath, p2pPath)
        await copyDir(path.resolve(`plugin/OEM/${customer}_P2P`), path.resolve(p2pPath, 'OCX'))
    }
}

async function cleanUp(src: string) {
    try {
        await fs.access(src)
        await fs.rm(src, {
            recursive: true,
        })
    } catch {}
}

async function copyDir(src: string, dest: string) {
    const entries = await fs.readdir(src, {
        withFileTypes: true,
    })

    await fs.mkdir(dest, {
        recursive: true,
    })

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)

        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath)
        } else {
            await fs.copyFile(srcPath, destPath)
        }
    }
}

async function generateCustomerP2PZip(customer: string, uiList: string[], version: string) {
    return new Promise((resolve) => {
        const outputCustomer = customer === 'STANDARD' ? 'TVT' : customer
        const outputFileName = path.resolve(`dist/${outputCustomer}_NVR_${getDateTime()}_${version}.zip`)
        const output = fsStream.createWriteStream(outputFileName)
        const archive = Archiver('zip')

        output.on('close', function () {
            print(outputCustomer, `Generate ${outputFileName}`)
            resolve(void 0)
        })

        output.on('end', function () {
            console.log(outputCustomer, Chalk.red('Data has been drained'), 'error')
            resolve(void 0)
        })

        uiList.forEach((ui) => {
            const uiMatch = ui.match(/UI(.*)-(.*)/)
            const versionUnderline = version.split('_')[0].split('.').join('_')
            archive.directory(path.resolve(`./dist/${ui}${customer === 'STANDARD' ? '' : '_' + customer}_P2P/`), `dev/bd/nvr/${versionUnderline}/u${uiMatch![1]}${uiMatch![2].toLowerCase()}/`)
        })

        archive.pipe(output)
        archive.finalize()
    })
}

async function getGitRevision() {
    return new Promise((resolve) => {
        exec('git rev-parse HEAD', (error, stdout, stderr) => {
            if (error) {
                resolve('')
                return
            }

            if (stderr) {
                resolve('')
                return
            }

            resolve(stdout.slice(0, 8))
        })
    })
}

function getPackageVersion() {
    return process.env.npm_package_version
}

async function generate() {
    let uiList: string[] = []
    let bundleList: string[][] = []
    const match = process.argv.find((item) => item.startsWith('bundle='))
    // 判断命令行是否传入UI类型
    if (match) {
        const split = match.split('=')
        if (split[1]) {
            bundleList = split[1].split(',').map((item) => item.toUpperCase().split('_'))
            uiList = Array.from(new Set(bundleList.map((item) => item[0].trim())))
        } else {
            uiList = [LEGAL_UI[0]]
            bundleList = [[LEGAL_UI[0]]]
        }
    } else {
        uiList = [LEGAL_UI[0]]
        bundleList = [[LEGAL_UI[0]]]
    }

    console.log(Chalk.cyan('Clean Up Dist'))
    await cleanUp(path.resolve('dist'))

    console.log(Chalk.cyan('Ready to build...'))
    for (let i = 0; i < uiList.length; i++) {
        const ui = uiList[i]

        if (!LEGAL_UI.includes(ui)) {
            print(ui, `Build ${ui} error: UI_TYPE ERROR`, 'error')
            continue
        }

        try {
            print(ui, `Build ${ui} start, please wait...`)
            await generateUI(ui)
            print(ui, `Build ${ui} end`)
        } catch {
            print(ui, `Build ${ui} error: PROGRAM ERROR`, 'error')
        }
    }

    for (let i = 0; i < bundleList.length; i++) {
        const bundle = bundleList[i]
        const fileName = bundle[0] + (bundle[1] ? '_' + bundle[1] : '_STANDARD')

        if (!LEGAL_UI.includes(bundle[0].trim())) {
            print(fileName, `Build ${fileName} error: UI_TYPE ERROR`, 'error')
            continue
        }

        if (bundle[1] && !LEGAL_CUSTOMER_ID.includes(bundle[1].trim())) {
            print(fileName, `Build ${fileName} error: CUSTOMER_ID ERROR`, 'error')
            continue
        }

        try {
            print(fileName, `Build ${fileName} start, please wait...`)
            await generateCustomerPackage(bundle[0], bundle[1] || '')
            print(fileName, `Build ${fileName} end`)
        } catch {
            print(fileName, `Build ${fileName} error: PROGRAM ERROR`)
        }
    }

    for (let i = 0; i < uiList.length; i++) {
        const ui = uiList[i]

        if (LEGAL_UI.includes(ui)) {
            await cleanUp(path.resolve('dist', ui))
            try {
                const standardPath = getDistName(ui, 'STANDARD')
                await copyDir(standardPath, path.resolve('dist', ui))
                await cleanUp(standardPath)
            } catch {}
        }
    }

    const matchP2P = process.argv.find((item) => item.startsWith('p2p'))

    if (matchP2P) {
        let version = process.argv.find((item) => item.startsWith('p2p='))?.split('=')[1] // || '2.2.0.0'
        if (!version) {
            const gitVersion = await getGitRevision()
            const packageVersion = getPackageVersion()
            version = packageVersion + '_' + gitVersion
        }
        const bundleObj: Record<string, string[]> = {}
        bundleList.forEach((item) => {
            const customer = item[1] || 'STANDARD'
            if (!bundleObj[customer]) {
                bundleObj[customer] = []
            }
            bundleObj[customer].push(item[0])
        })
        for (const entry of Object.entries(bundleObj)) {
            await generateCustomerP2PZip(entry[0], entry[1], version)
        }
    }

    console.log(Chalk.greenBright('Done!'))
    process.exit(0)
}

async function generateManual() {
    let uiList: string[] = []

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
            choices: LEGAL_UI,
            validate(input) {
                if (input.length) {
                    return true
                }
                return 'You must choose at least one UI.'
            },
        },
    ])

    uiList = answers.UI_TYPE

    console.log(Chalk.white('Ready to build: '), Chalk.redBright(uiList.join(',')))
    for (let i = 0; i < uiList.length; i++) {
        const ui = uiList[i]
        try {
            print(ui, `Build ${ui} start, please wait...`)
            await generateUI(ui)
            print(ui, `Build ${ui} end`)
        } catch {
            print(ui, `Build ${ui} error: PROGRAM ERROR`, 'error')
        }
    }

    console.log(Chalk.greenBright('Done!'))
    process.exit(0)
}

const manual = process.argv.find((item) => item.startsWith('manual'))
if (manual) {
    generateManual()
} else {
    generate()
}
