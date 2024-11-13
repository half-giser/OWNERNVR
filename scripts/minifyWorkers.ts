/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-11 17:45:18
 * @Description:
 */
import { type Plugin } from 'vite'
import globby from 'globby'
import fs from 'node:fs/promises'
import { minify } from 'terser'
import Chalk from 'chalk'

interface MinifyWorkerOption {
    src: string
}

export default function minifyWorkers(option: MinifyWorkerOption): Plugin {
    return {
        name: 'minify-workers',
        apply: 'build',
        async writeBundle() {
            const workers = await globby(option.src)
            for (let i = 0; i < workers.length; i++) {
                const worker = workers[i]
                const data = await fs.readFile(worker, 'utf-8')
                const result = await minify(data)
                await fs.writeFile(worker, result.code!)
                console.log(Chalk.green.bold('SUCCESS'), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.white(`Minified ${worker} successfully`))
            }
        },
    }
}
