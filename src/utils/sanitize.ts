/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-13 13:41:01
 * @Description: 防XSS攻击html过滤器
 */

const parser = new DOMParser()

const ALLOW_TAGS = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',

    'section',
    'div',
    'p',

    'hr',
    'br',

    'dl',
    'dd',
    'dt',
    'ul',
    'ol',
    'li',

    'a',
    'b',
    'i',
    'em',
    'strong',
    'span',
    'small',
    'sub',
    'sup',
    'code',

    'img',
    'video',
    'audio',
    'source',
    'picture',
    'embed',
    'track',

    'caption',
    'col',
    'colgroup',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
]

const ALLOW_ATTRS = ['class', 'href', 'src', 'id', 'width', 'height', 'controls', 'preload', 'target', 'style', 'referrerpolicy', 'ref']

const URI_ATTRS = ['src'] // 'href'

const IS_ALLOWED_URI = /^(?:(?:https?|mailto|tel|callto|sms|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i

const CLOBBERED_ATTRS = ['id']

const IS_ALLOWED_ID = /^_ca_[0-9]/

const cleanAttributes = (element: Element) => {
    const attributes = element.attributes
    if (!attributes) return
    const length = attributes.length
    for (let i = length - 1; i >= 0; i--) {
        const attributeName = attributes[i].name
        const attributeValue = attributes[i].value
        const attributeNameLowerCase = attributeName.toLowerCase()

        if (!ALLOW_ATTRS.includes(attributeNameLowerCase)) {
            element.removeAttribute(attributeName)
            continue
        }

        if (/\/>/i.test(attributeValue)) {
            element.removeAttribute(attributeName)
            continue
        }

        if (URI_ATTRS.includes(attributeNameLowerCase) && !IS_ALLOWED_URI.test(attributeValue)) {
            element.removeAttribute(attributeName)
            continue
        }

        if (CLOBBERED_ATTRS.includes(attributeNameLowerCase) && !IS_ALLOWED_ID.test(attributeValue)) {
            element.removeAttribute(attributeName)
            continue
        }
    }

    if (element.tagName.toLowerCase() === 'a') {
        element.setAttribute('referrerpolicy', 'no-referrer')
        element.setAttribute('rel', 'noopener noreferrer')
    }
}

const cleanElement = (element: Element) => {
    if (!ALLOW_TAGS.includes(element.tagName.toLowerCase())) {
        element.remove()
        return
    }

    if (element.hasChildNodes() && element.firstElementChild instanceof Node && /<[/\w]/g.test(element.innerHTML) && /<[/\w]/g.test(element.textContent || '')) {
        element.remove()
        return
    }

    cleanAttributes(element)

    const children = element.children
    if (children.length) {
        for (const child of children) {
            cleanElement(child)
        }
    }
}

export const sanitize = (dirty: string) => {
    if (typeof dirty !== 'string') return ''
    if (!dirty) return ''
    if (!parser) return dirty

    const dom = parser.parseFromString(dirty, 'text/html')
    const body = dom.documentElement.lastElementChild
    if (!body) return dirty

    const children = body.children
    for (const child of children) {
        cleanElement(child)
    }

    return body.innerHTML
}
