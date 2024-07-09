/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-05 08:54:10
 * @Description: 生成雪碧图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-11 09:10:35
 */
import { type Plugin } from 'vite'

import fs from 'node:fs/promises'
import path from 'path'
import glob from 'glob'
import MagicString from 'magic-string'
import SpriteSmith from 'spritesmith'
import Chalk from 'chalk'

interface GenerateSpriteOption {
    src: string
    dist: string
}

function generateSprite(option: GenerateSpriteOption) {
    return new Promise((resolve, reject) => {
        const sprites = glob.glob.sync(option.src, {
            ignore: '**/img.png',
        })
        SpriteSmith.run({ src: sprites }, async (err, result) => {
            if (err) {
                console.log(Chalk.red.bold('ERROR'), Chalk.white(`GenerateSprite Error: ${err}`))
                reject(err)
            }
            const coordinates: typeof result.coordinates = {}
            Object.keys(result.coordinates).forEach((key) => {
                const split = key.split('/')
                const keyName = split[split.length - 1].split('.')[0]
                coordinates[keyName] = result.coordinates[key]
            })
            const data = {
                properties: result.properties,
                coordinates,
            }
            // const text = `const sprite:ImageSprite={properties:${JSON.stringify(result.properties)},coordinates:${JSON.stringify(coordinates)}};export default sprite`
            const ms = new MagicString(JSON.stringify(data))
            ms.prepend(`const sprite:ImageSprite=`)
            ms.append(`;export default sprite`)
            const text = ms.toString()
            await fs.writeFile(path.resolve(option.dist, 'sprites.png'), result.image)
            await fs.writeFile(path.resolve(option.dist, 'sprites.ts'), text)
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
