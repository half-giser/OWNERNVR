/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-07 15:12:23
 * @Description: 移除临时文件
 * SSH打包有这样的需求，需要每次打包完将临时文件清理掉
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import Chalk from 'chalk'
import { TEMP_FOLDER, SPRITE_PNG_FILE_PATH, SPRITE_JSON_FILE_PATH, TYPE_AUTO_IMPORT_FILE_PATH, TYPE_COMPONENTS_FILE_PATH } from './filePaths'

async function cleanUp(src: string) {
    try {
        await fs.access(src)
        await fs.rm(src, {
            recursive: true,
        })
    } catch {}
}

async function cleanUpQueue(queue: string[]) {
    for (let i = 0; i < queue.length; i++) {
        const filePath = path.resolve(queue[i])
        console.log(filePath)
        await cleanUp(filePath)
    }
}

async function main() {
    let level = 0
    const match = process.argv.find((item) => item.startsWith('level='))
    if (match) {
        level = Number(match.split('=')[1])
    }

    // 清理与runtime无关的临时文件
    if (level === 0) {
        await cleanUpQueue([TEMP_FOLDER])
    }
    // 清理所有临时文件，包括runtime相关的文件
    else if (level === 1) {
        await cleanUpQueue([TEMP_FOLDER, SPRITE_PNG_FILE_PATH, SPRITE_JSON_FILE_PATH, TYPE_AUTO_IMPORT_FILE_PATH, TYPE_COMPONENTS_FILE_PATH])
    }

    console.log(Chalk.green.bold('SUCCESS'), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.white('Clean up temp files!'))
    process.exit(0)
}

main()
