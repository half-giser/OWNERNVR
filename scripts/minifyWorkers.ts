/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-11 17:45:18
 * @Description:
 */
import { type Plugin } from 'vite'
import globby from 'globby'
import fs from 'node:fs/promises'
import { minify } from '@swc/core'
import Chalk from 'chalk'

interface MinifyWorkerOption {
    src: string
    ui: string
}

export default function minifyWorkers(option: MinifyWorkerOption): Plugin {
    return {
        name: 'minify-workers',
        apply: 'build',
        async writeBundle() {
            console.log(Chalk.green.bold('SUCCESS'), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.white('Minified begin'))
            const files = await globby(option.src, {
                ignore: ['**/server.js'],
            })
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                try {
                    const data = await fs.readFile(file, 'utf-8')
                    if (file.includes('workers')) {
                        const result = await minify(data, {
                            module: false,
                        })
                        await fs.writeFile(file, result.code)
                    } else {
                        const result = await minify(data, {
                            module: true,
                        })
                        // a tricky way to hide original file paths
                        let code = result.code.replace(new RegExp('/src/views/UI_PUBLIC/page/', 'g'), '/page/')
                        code = code.replace(new RegExp(`/src/views/${option.ui}/page/`, 'g'), '/page/')
                        await fs.writeFile(file, code)
                    }
                } catch (e) {
                    console.error(e)
                }
            }
            console.log(Chalk.green.bold('SUCCESS'), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.white('Minified successfully'))
        },
    }
}
