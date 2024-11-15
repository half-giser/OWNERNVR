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
}

export default function minifyWorkers(option: MinifyWorkerOption): Plugin {
    return {
        name: 'minify-workers',
        apply: 'build',
        async writeBundle() {
            console.log(Chalk.green.bold('SUCCESS'), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.white(`Minified begin`))
            const files = await globby(option.src)
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                try {
                    const data = await fs.readFile(file, 'utf-8')
                    const result = await minify(data, {
                        module: file.includes('workers') ? false : true,
                    })
                    await fs.writeFile(file, result.code!)
                } catch (e) {
                    console.error(e)
                }
            }
            console.log(Chalk.green.bold('SUCCESS'), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.white(`Minified successfully`))
        },
    }
}
