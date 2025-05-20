/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-12-26 19:03:57
 * @Description: 语言相关常量
 */

/**
 * @description 语言类型与语言id映射
 */
export const LANG_MAPPING: Record<string, string> = {
    'en-us': '0x0409',
    'zh-cn': '0x0804',
    'zh-tw': '0x0404',
    zh: '0x0804',
    hr: '0x041a',
    cs: '0x0405',
    fa: '0x0429',
    de: '0x0407',
    el: '0x0408',
    he: '0x040d',
    hu: '0x040e',
    it: '0x0410',
    mk: '0x042f',
    pl: '0x0415',
    pt: '0x0816',
    ro: '0x0418',
    ru: '0x0419',
    sk: '0x041b',
    sl: '0x0424',
    'es-es': '0x0c0a',
    'es-mx': '0x080a',
    th: '0x041e',
    tr: '0x041f',
    af: '0x0436',
    nl: '0x0013',
    bg: '0x0402',
    fr: '0x040c',
    ja: '0x0411',
    kor: '0x0412',
    id: '0x0421',
    vi: '0x042a',
    kk: '0x043f',
    ar: '0x0c01',
    'sr-cyrl-cs': '0x0c1a',
    lt: '0x0427',
    lo: '0x0454',
    nb: '0x0414',
}

export const LANG_TYPE_MAPPING: Record<string, string> = {}
Object.entries(LANG_MAPPING).forEach((item) => {
    LANG_TYPE_MAPPING[item[1]] = item[0]
})

/**
 * @description 语言id映射与ElementPlus语言包映射
 */
// export const ELEMENT_LANG_MAPPING: Record<string, string> = {
//     '0x0c0a': 'es',
//     '0x0c01': 'ar',
//     '0x0c1a': 'sr',
//     '0x0013': 'nl',
//     '0x040c': 'fr',
//     '0x040d': 'he',
//     '0x040e': 'hu',
//     '0x041a': 'hr',
//     '0x041b': 'sk',
//     '0x041e': 'th',
//     '0x041f': 'tr',
//     '0x042a': 'vi',
//     // '0x042f': 'mk',
//     '0x043f': 'kk',
//     '0x080a': 'es',
//     '0x0402': 'bg',
//     '0x0404': 'zhTw',
//     '0x0405': 'cs',
//     '0x0407': 'de',
//     '0x0408': 'el',
//     '0x0409': 'en',
//     '0x0410': 'it',
//     '0x0411': 'ja',
//     '0x0412': 'ko',
//     // '0x0414': 'nb',
//     '0x0415': 'pl',
//     '0x0418': 'ro',
//     '0x0419': 'ru',
//     '0x0421': 'id',
//     '0x0424': 'sl',
//     '0x0427': 'lt',
//     '0x0429': 'fa',
//     '0x0436': 'af',
//     // '0x0454': 'lo',
//     '0x0804': 'zhCn',
//     '0x0816': 'pt',
// }
