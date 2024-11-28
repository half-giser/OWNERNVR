/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-05 08:54:10
 * @Description: 生成雪碧图
 */
import { type Plugin } from 'vite'
import fs from 'node:fs/promises'
import path from 'path'
import globby from 'globby'
import MagicString from 'magic-string'
import SpriteSmith from 'spritesmith'
import Chalk from 'chalk'
import { SPRITE_PNG_FILE_PATH, SPRITE_JSON_FILE_PATH } from './filePaths'

interface GenerateSpriteOption {
    src: string
    // dist: string
}

function generateSprite(option: GenerateSpriteOption) {
    return new Promise(async (resolve, reject) => {
        let sprites = await globby(option.src, {
            ignore: ['**/img.png'],
        })
        if (!sprites.length) {
            sprites = await globby('sprite/UI-Public-sprite/sprite/*.png', {
                ignore: ['**/img.png'],
            })
        }
        SpriteSmith.run({ src: sprites }, async (err, result) => {
            if (err) {
                console.log(Chalk.red.bold('ERROR'), Chalk.white(`GenerateSprite Error: ${err}`))
                reject(err)
            }
            const coordinates: Record<string, number[]> = {}
            Object.keys(result.coordinates).forEach((key) => {
                const split = key.split('/')
                const keyName = split[split.length - 1].split('.')[0]
                const { x, y, width, height } = result.coordinates[key]
                coordinates[keyName] = [x, y, width, height]
            })
            const data = {
                properties: result.properties,
                coordinates,
            }
            const ms = new MagicString(JSON.stringify(data))
            ms.prepend('const sprite:ImageSprite=')
            ms.append(';export default sprite')
            const text = ms.toString()
            await fs.writeFile(path.resolve(SPRITE_PNG_FILE_PATH), result.image)
            await fs.writeFile(path.resolve(SPRITE_JSON_FILE_PATH), text)
            console.log(Chalk.green.bold('SUCCESS'), Chalk.blueBright(new Date().toLocaleString('zh-CN')), Chalk.white('Generate Sprite Successfully'))
            resolve(void 0)
        })
    })
}

export default function genrateSpritePlugin(option: GenerateSpriteOption): Plugin {
    return {
        name: 'generate-sprite',
        async buildStart() {
            await generateSprite(option)
        },
    }
}
