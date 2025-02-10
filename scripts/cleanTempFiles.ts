/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-07 15:12:23
 * @Description: 移除临时文件
 * SSH打包有这样的需求，需要每次打包完将临时文件清理掉
 */
import { type Plugin } from 'vite'
import fs from 'node:fs/promises'
import path from 'node:path'
import Chalk from 'chalk'
import { TEMP_FOLDER, SPRITE_PNG_FILE_PATH, SPRITE_JSON_FILE_PATH, SPRITE_SASS_FILE_PATH, TYPE_AUTO_IMPORT_FILE_PATH, TYPE_COMPONENTS_FILE_PATH } from './filePaths'

async function cleanUp(src: string) {
    try {
        await fs.access(src)
        await fs.rm(src, {
            recursive: true,
        })
    } catch {}
}

async function cleanUpQueue(queue: string[]) {
    for (const item of queue) {
        const filePath = path.resolve(item)
        await cleanUp(filePath)
    }
}

async function main(level: string, done = () => {}) {
    // 清理与runtime无关的临时文件
    if (level === 'temp-folder') {
        await cleanUpQueue([TEMP_FOLDER])
    }
    // 清理所有临时文件，包括runtime相关的文件
    else if (level === 'runtime') {
        await cleanUpQueue([TEMP_FOLDER, SPRITE_PNG_FILE_PATH, SPRITE_JSON_FILE_PATH, SPRITE_SASS_FILE_PATH, TYPE_AUTO_IMPORT_FILE_PATH, TYPE_COMPONENTS_FILE_PATH])
    }
    // 仅清理类型文件
    else if (level === 'declaration') {
        await cleanUpQueue([TYPE_AUTO_IMPORT_FILE_PATH])
    }

    console.log(Chalk.green.bold('SUCCESS'), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.white('Clean up temp files!'))
    done()
}

const match = process.argv.find((item) => item.startsWith('level='))
if (match) {
    const level = match.split('=')[1]
    main(level, () => {
        process.exit(0)
    })
}

export function cleanUpTempFiles(level = 'declaration'): Plugin {
    return {
        name: 'clean-temp-files',
        enforce: 'pre',
        async buildStart() {
            await main(level)
        },
    }
}
