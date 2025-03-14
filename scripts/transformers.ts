/*
 * @Date: 2024-07-09 18:39:24
 * @Description:
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import { type Plugin } from 'vite'
import MagicString from 'magic-string'
import * as ParseLiterals from 'parse-literals'
import globby from 'globby'
import fs from 'node:fs/promises'
import { minify } from '@swc/core'
import Chalk from 'chalk'

// function compressXml(xml: string) {
//     return xml
//         .replace(/<!--[\s\S]*?-->/g, '')
//         .replace(/>\s+</g, '><')
//         .replace(/\s*([^\s=]+)\s*=\s*"([^"]*)"/g, ' $1="$2"')
//         .trim()
// }

function compressXml(xml: string) {
    const tagPattern = /(?<=<\/?[^?!\s\/>]+\b(?:\s+[^=\s>]+\s*=\s*(?:"[^"]*"|'[^']*'))*%1)/.source

    return xml
        .replace(/<!\s*(?:--(?:[^-]|-[^-])*--\s*)>/g, '') // remove comments
        .replace(/>\s+</g, '><') // remove whitespace between tags
        .replace(/<([^\s\/>]+)([^<]*?)(?<!\/)><\/\1\s*>/g, '<$1$2/>') // collapse elements with start / end tags and no content to empty element tags
        .replace(new RegExp(tagPattern.replace('%1', '') + /\s+/.source, 'g'), ' ') // collapse whitespace between attributes
        .replace(new RegExp(tagPattern.replace('%1', /\s+[^=\s>]+/.source) + /\s*=\s*/.source, 'g'), '=') // remove leading / tailing whitespace around attribute equal signs
        .replace(new RegExp(tagPattern.replace('%1', '') + /\s+(?=[/?]?>)/.source, 'g'), '') // remove whitespace before closing > /> ?> of tags
        .trim()
}

export function minifyXmlTemplateStrings(): Plugin {
    return {
        name: 'minify-raw-xml',
        enforce: 'pre',
        // apply: 'build',
        transform(code) {
            let shouldTransform = false
            const templates = ParseLiterals.parseLiterals(code)
            if (templates.length > 0) {
                const ms = new MagicString(code)
                templates.forEach((template) => {
                    if (template.tag === 'rawXml') {
                        shouldTransform = true
                        template.parts.forEach((part) => {
                            if (part.start < part.end) {
                                const mini = compressXml(part.text)
                                ms.overwrite(part.start, part.end, mini)
                            }
                        })
                    }
                })

                if (shouldTransform) {
                    const miniCode = ms.toString()
                    return miniCode
                }
            }
        },
    }
}

interface MinifyWorkerOption {
    src: string
    ui: string
}

function hideOriginalFilePath(ui: string, code: string) {
    // a tricky way to hide original file paths
    code = code.replace(new RegExp('/src/views/UI_PUBLIC/page/', 'g'), '/page/')
    code = code.replace(new RegExp(`/src/views/${ui}/page/`, 'g'), '/page/')
    return code
}

export function postMinifyCodes(option: MinifyWorkerOption): Plugin {
    return {
        name: 'post-minify-codes',
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
                        const code = hideOriginalFilePath(option.ui, result.code)
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

export function transpileVueTemplatePropTypes(): Plugin {
    return {
        name: 'transplie-vue-template-prop-types',
        enforce: 'pre',
        transform(code, fileName) {
            let shouldTransform = false

            const propTypes = [['TableColumn', 'TableColumn<(.*)>']]

            if (fileName.endsWith('.vue')) {
                for (const propType of propTypes) {
                    if (code.includes(propType[0])) {
                        shouldTransform = true
                        /**
                         * typescript syntax prop="data: PropType" works on VSCode, but compiles error on vite
                         * this is a tricky way to transpile prop="data: PropType" expressions to prop="data"
                         */
                        code = code.replace(new RegExp(`="(.*): ${propType[1]}"`, 'g'), '="$1"')
                    }
                }
            }

            if (shouldTransform) {
                return code
            }
        },
    }
}
