/*
 * @Author: xujp xujp@tvt.net.cn
 * @Date: 2023-04-28 14:36:40
 * @Description:解析xml下指定路径的标签文本和属性
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-19 19:47:37
 */

/*
 *
 * 使用示例:（获取翻译列表api: /service/Common/getLangContent）
 * let $response = xmlParse("//response[@type='SetWebSocketPort']", $xmlDoc) // 按属性筛选指定标签
 * let path = '//content/langItems/item' // 1、/ 从根节点选取 2、// 当前节点选取 3、. 从选取当前节点（详见: https://www.cnblogs.com/xtreme/p/7839509.html）
 * let $langItem = xmlParse(path, res.data)
 * $langItem.attr('id') // IDCS_1400GATEWAY_SERVER
 * $langItem.text() // 1400 Server
 */

export interface XmlResult extends Array<XmlElement> {
    text: () => string
    attr: (id: string, name?: string) => string
}

export type XMLQuery = ReturnType<typeof queryXml>

const eva = new XPathEvaluator()
const parser = new DOMParser()

/**
 * @description: xml文档解析
 * @param {string} path 遍历路径, 如'//content/langItems/item'
 * @param {XMLDocument | Element | null} xmlDoc xml数据
 * @return {XmlResult} xmlNodes
 */
export const xmlParse = (path: string, xmlDoc: XMLDocument | Element | null): XmlResult => {
    const xmlNodes: any = []
    if (xmlDoc === null) return xmlNodes
    const xmlResult: XPathResult = eva.evaluate(path, <XMLDocument>xmlDoc, null, XPathResult.ANY_TYPE, null)
    let nodes: Node | null
    while ((nodes = xmlResult.iterateNext())) {
        xmlNodes[xmlNodes.length] = new XmlElement(nodes)
    }
    xmlNodes.text = xmlNodes.length === 0 ? () => '' : () => xmlNodes[0].text()
    xmlNodes.attr = xmlNodes.length === 0 ? () => '' : (a: string, b?: string) => xmlNodes[0].attr(a, b)
    return xmlNodes
}

/**
 * @description: xml文档解析
 * @param {XMLDocument | Element | null} xmlDoc xml数据
 * @return {(path: string) => XmlResult}
 */
export const queryXml = (xmlDoc: XMLDocument | Element | null) => {
    return (path: string): XmlResult => xmlParse(path, xmlDoc)
}

export const getElementText = (xmlObj: XmlElement | Element, eleName: string, defaultValue: string = '') => {
    const eleObj = xmlParse(eleName, (xmlObj as XmlElement).element ? (xmlObj as XmlElement).element : (xmlObj as Element))[0]
    return eleObj ? eleObj.text() : defaultValue
}

// xml标签元素（类）
export class XmlElement {
    // 标签元素集合
    element: Element
    outerHTML: string

    constructor(element: Node) {
        this.element = <Element>element
        this.outerHTML = this.element.outerHTML
    }

    /**
     * @description: 返回标签文本
     * @return {string} value
     */
    text(): string {
        return this.element.innerHTML.replace(/(<!\[CDATA\[)|(\]\]>$)/g, '')
    }

    /**
     * @description: 返回标签属性
     * @param {string} attribute
     * @param {string} value
     * @return {string}
     */
    attr(attribute: string, value?: string): string | undefined {
        if (value) this.element.setAttribute(attribute, value)
        else return this.element.getAttribute(attribute) || ''
    }
}

/**
 * @description: xml字符串 => xml文档对象
 * @param {XMLDocument | string} xmlData
 * @return {XMLDocument | null} xmlDoc
 */
export const getXmlDoc = (xmlData: XMLDocument | string) => {
    let xmlDoc: XMLDocument | null = null
    if (xmlData instanceof XMLDocument) {
        xmlDoc = xmlData
    } else if (typeof xmlData === 'string') {
        try {
            xmlDoc = XMLStr2XMLDoc(JSON.parse(xmlData).resultXml)
        } catch (e) {
            xmlDoc = XMLStr2XMLDoc(xmlData)
        }
    } else {
        xmlDoc = null
    }
    return xmlDoc
}

/**
 * @description: xml字符串 => xml文档对象
 * @param {string} str
 * @return {XMLDocument} xmlDoc
 */
export const XMLStr2XMLDoc = (str: string) => {
    let xmlDoc: XMLDocument | null = null
    if (DOMParser) {
        // 非IE
        const parser = new DOMParser()
        xmlDoc = parser.parseFromString(str, 'text/xml')
    }
    return xmlDoc
}

/**
 * @description: xml文档对象 => xml字符串
 * @param {XMLDocument} doc
 * @return {*}
 */
export const XMLDoc2XMLStr = (doc: XMLDocument) => {
    if (XMLSerializer) {
        return new XMLSerializer().serializeToString(doc)
    }
    return ''
}

/**
 * @description: 去除XML字符串空格
 * @param {string} xml
 * @return {string}
 */
export const compressXml = (xml: string) => {
    return xml
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .replace(/\s*([^\s=]+)\s*=\s*"([^"]*)"/g, ' $1="$2"')
        .trim()
}

/**
 * @description 检测XML字符串是否合法
 * @param {string} xml
 * @returns {Boolean}
 */
export const checkXml = (xml: string) => {
    const xmlDoc = parser.parseFromString(xml, 'text/xml')
    if (xmlDoc.getElementsByTagName('parsererror')) {
        console.error(xmlDoc)
        return false
    }
    return true
}

/**
 * @description 模版字符串函数，用于标识XML模版字符串，可（1）检测XML字符串合法性；（2）编译时进行压缩
 * @param
 * @return {string}
 */
export const rawXml = (strings: TemplateStringsArray, ...values: string[]) => {
    // const result = String.raw({ raw: strings }, ...(values || []))
    // if (import.meta.env.NODE_ENV === 'development') {
    //     checkXml(result)
    // }
    return String.raw({ raw: strings }, ...(values || []))
}
