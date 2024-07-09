import { type Plugin } from 'vite'
import MagicString from 'magic-string'
import * as ParseLiterals from 'parse-literals'

const compressXml = (xml: string) => {
    return xml
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .replace(/\s*([^\s=]+)\s*=\s*"([^"]*)"/g, ' $1="$2"')
        .trim()
}

export default function minifyXmlTemplateStrings(): Plugin {
    return {
        name: 'minify-raw-xml',
        enforce: 'pre',
        apply: 'build',
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
