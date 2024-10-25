/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-04 20:56:11
 * @Description: 格式化工具模块
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-18 09:09:24
 */

/**
 * @description 驼峰（Camel Case）转串行（Kebab Case）
 * @param {string} name
 * @return {string}
 */
export const camel2Kebab = (name: string) => {
    const arr = name.split('')
    // 使用循环遍历字符串
    const nameArr = arr.map((item) => {
        if (item.toUpperCase() === item) {
            // 使用toUpperCase()方法检测当前字符是否为大写
            return '-' + item.toLowerCase()
            // 大写就在前面加上-，并用toLowerCase()将当前字符转为小写
        } else {
            return item
        }
    })
    return nameArr.join('')
}

/**
 * @description 用实体替换特殊字符
 * @param {string} str
 * @returns {string}
 */
export const replaceWithEntity = (str: string) => {
    str = '' + str // 参数必须转换为字符串，否则可能会报错
    const entityList = [
        { ch: '&', entity: '&amp;' },
        { ch: '<', entity: '&lt;' },
        { ch: '>', entity: '&gt;' },
        { ch: '"', entity: '&quot;' },
    ]
    entityList.forEach((element) => {
        str = str.replace(new RegExp(element.ch, 'g'), element.entity)
    })
    return str
}

/**
 * @description 字符串转换为实体
 * @param {String} str
 * @returns {String}
 */
export const convertToTextEntities = (str: string) => {
    str = '' + str
    const entityList: { ch: string; entity: string }[] = [
        { ch: '&amp;', entity: '&' },
        { ch: '&lt;', entity: '<' },
        { ch: '&gt;', entity: '>' },
        { ch: '&quot;', entity: '"' },
        { ch: '&nbsp;', entity: ' ' },
    ]
    entityList.forEach((element) => {
        str = str.replace(new RegExp(element.ch, 'g'), element.entity)
    })
    return str
}

/**
 * @description 16进制转10进制数字
 * @param {string} str
 * @return {number}
 */
export const hexToDec = (str: string) => {
    if (!str) return 0
    return parseInt(str, 16)
}

/**
 * @description 10进制转16进制字符串
 * @param {number} num
 * @return {string}
 */
export const decToHex = (num: number) => {
    return num.toString(16).toUpperCase()
}

/**
 * @description 获取指定字节长度字符串
 * @param {string} str 源字符串
 * @param {number} limit 指定字节长度
 * @returns {string} 指定字节长度字符串
 */
export const getLimitStr = (str: string, limit: number) => {
    // 中文算3个字符 其它算1个字符
    const len = str.length
    let flag = false
    let reLen = 0
    let sliceNo = 0
    for (let i = 0; i < len; i++) {
        if (str.charCodeAt(i) < 27 || str.charCodeAt(i) > 126) {
            // 全角
            reLen += 3
        } else {
            reLen++
        }

        if (reLen > limit && !flag) {
            sliceNo = i // 实际需要截取的位数
            flag = true
        }
    }

    if (reLen > limit) {
        return str.slice(0, sliceNo)
    }
    return str
}

/**
 * @description 截取字符串
 * @param {string} str
 * @param {number} len
 * @returns {string}
 */
export const getShortString = (str: string, len: number) => {
    return str.length > len ? str.substr(0, len) + '...' : str
}

/**
 * @description 按照字节长度来截取字符串
 * @param {string} $sourcestr
 * @param {number} $cutlength
 * @returns {string}
 */
export const cutStringByByte = ($sourcestr: string, $cutlength: number) => {
    let $returnstr = $sourcestr
    let $i = 0 // 字节个数
    let $j = 0 // 字符个数
    // let $lastByte = 0
    const $str_length = $sourcestr.length // 字符长度
    while ($i <= $cutlength && $j < $str_length) {
        const charCode = $sourcestr.charCodeAt($j)
        if (charCode < 0x007f) {
            $i++
            $j++
            // $lastByte = 1
        } else if (0x0080 <= charCode && charCode <= 0x07ff) {
            $i += 2
            $j++
            // $lastByte = 2
        } else if (0x0800 <= charCode && charCode <= 0xffff) {
            $i += 3
            $j++
            // $lastByte = 3
        } else {
            $i += 4
            $j++
            // $lastByte = 4
        }
    }

    if ($i > $cutlength) {
        $returnstr = $sourcestr.substr(0, $j - 1)
    }
    return $returnstr
}

/**
 * @description https访问提示文案格式化，返回文案格式：`当前https访问，不支持${content}`
 * @param {string} content
 */
export const formatHttpsTips = (content: string) => {
    const { Translate } = useLangStore()
    return Translate('IDCS_NOT_SUPPORTED').formatForLang('https', content) + ' !'
}

/**
 * @description 处理输入框最大输入字节数
 * @param {string} value
 * @returns {string}
 */
export const formatInputMaxLength = (value: string) => {
    value = cutStringByByte(value, nameByteMaxLen)
    return value
}

/**
 * @description 处理输入框名字输入
 * @param {string} value
 * @returns {string}
 */
export const formatInputUserName = (value: string) => {
    value = value.replace(/([`\^\[\]]|[^A-z\d!@#%(){}~_\\'./\-\s])/g, '')
    return formatInputMaxLength(value)
}

/**
 * @description 处理输入框长数字串的输入,过滤掉非数字字符
 * @param {string} value
 * @returns {string}
 */
export const formatDigit = (value: string) => {
    value = value.replace(/[^0-9]/g, '')
    return value
}

/**
 * @description 处理邮箱的输入
 * @param {string} email
 * @returns {string}
 */
export const hideEmailAddress = (email: string) => {
    if (email) {
        const split = email.split('@')
        let head = split[0]
        let tail = split[1]

        const type = tail ? '' : 'name'
        head = hideSensitiveInfo(head, head.length < 3 ? 'high' : 'medium', type)

        if (!tail) return head
        const tailArr = tail.split('.')
        const t = hideSensitiveInfo(tailArr[0], 'high')
        const newTailArr = [t].concat(tailArr.slice(1))
        tail = newTailArr.join('.')
        return head + '@' + tail
    } else {
        return email
    }
}

/**
 * @description 敏感信息脱敏变换
 * @param {string} value
 * @param {enum} level 'low' | 'high' | 'medium' | 'tail'
 * @param {string} type
 * @returns {string}
 */
export const hideSensitiveInfo = (value: string, level: 'low' | 'high' | 'medium' | 'tail', type?: string) => {
    if (!value) {
        return value
    }
    value = value.trim()
    const separator = [
        { type: /[\u4e00-\u9fa5]+\·/, value: '·' },
        { type: /\./, value: '.' },
        { type: /\·/, value: '·' },
        { type: /\s/, value: ' ' },
    ]
    if (type == 'name') {
        let result = ''
        const nameArr = []
        for (let index = 0; index < separator.length; index++) {
            if (separator[index].type.test(value)) {
                const tmpArr = value.split(separator[index].value)
                tmpArr.forEach((e, i) => {
                    nameArr.push(e)
                    i < tmpArr.length - 1 && nameArr.push(separator[index].value)
                })
                break
            }
        }

        if (!nameArr.length) {
            nameArr.push(value)
        }
        const spaceCharArr = nameArr.filter((item) => {
            return item == '·' || item == ' ' || item == '.'
        })
        if (spaceCharArr.length == 0) {
            const nameLevel = nameArr[0].length >= 3 ? 'medium' : 'tail'
            result = hideSensitiveInfo(nameArr[0], nameLevel)
        } else if (spaceCharArr.length == 1) {
            nameArr.forEach((e, i) => {
                if (i == 0 || i == nameArr.length - 1) {
                    result += hideSensitiveInfo(e, 'medium', 'name')
                } else {
                    result += e
                }
            })
        } else {
            nameArr.forEach((e, i) => {
                if (i == 0 || i == nameArr.length - 1) {
                    result += hideSensitiveInfo(e, 'medium', 'name')
                } else {
                    result += e
                }
            })
        }
        return result
    }
    // M=3N+X
    // M: 长度 N: M / 3 的商 X: M / 3 的余数
    // M = 3 N + X的中间脱敏方式： 总长度M = 开头显示长度 N + 中间脱敏长度 N + X + 尾部显示长度 N
    let str = ''
    const strLen = value.length
    const n = Math.floor(strLen / 3)
    const x = strLen % 3
    let f = ''
    for (let i = 0; i < n + x; i++) {
        f += '*'
    }

    // 全部显示
    if (level == 'low') {
        return value
    }

    // 全部脱敏
    if (level == 'high') {
        return value.replace(/./g, '*')
    }

    // 3N+x中间脱敏
    if (level == 'medium') {
        return (str = value.substr(0, n) + f + value.substr(strLen - n, n))
    }

    // 3N+x尾部脱敏
    if (level == 'tail') {
        if (strLen == 1) return (str = '*')
        if (strLen == 2) return (str = value.substr(0, 1) + '*')
        return (str = value.substr(0, 2 * n + x) + value.substr(strLen - n, n).replace(/./g, '*'))
    }

    if (strLen < 3) {
        return f
    }
    return str
}
