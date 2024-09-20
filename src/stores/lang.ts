/*
 * @Author: xujp xujp@tvt.net.cn
 * @Date: 2023-05-04 17:27:29
 * @Description:
 */
import { getXmlWrapData } from '@/api/api'
import { getLangContent, getSupportLangList } from '@/api/lang'
import { queryXml } from '@/utils/xmlParse'
import { LocalCacheKey, LANG_MAPPING } from '@/utils/constants'
import { convertToTextEntities } from '@/utils/tools'
import * as elLang from 'element-plus/es/locale/index.mjs'

export const useLangStore = defineStore(
    'lang',
    () => {
        /* 语言key值（16进制字符串，如0x0409） */
        const langType = ref('')
        /* 语言代码 （如zh-cn、en-us） */
        const langId = ref('')

        /** 语言类型列表 */
        const langTypes = ref<Record<string, string>>({})
        /** 语言列表(key值与显示文本的映射) */
        const langItems = ref<Record<string, string>>({})
        /** 需要文本右对齐的语言列表（如: 波斯语、阿拉伯语） */
        const rtlLangList = ref<string[]>([])

        /**
         * @description: 从设备请求指定语言类型列表
         * @return {*}
         */
        const requestLangTypes = () => {
            const data = getXmlWrapData('')
            if (!langType.value) {
                langType.value = localStorage.getItem(LocalCacheKey.langType) || ''
            }
            if (!langId.value) {
                langId.value = localStorage.getItem(LocalCacheKey.langId) || ''
            }
            return getSupportLangList(data).then((result) => {
                const langNodes = queryXml(result)('//content/item')
                const langTypesTemp: Record<string, string> = {}
                langNodes.forEach((item) => {
                    langTypesTemp[item.attr('id')!] = queryXml(item.element)('name').text()
                })
                langTypes.value = langTypesTemp
                if (!langId.value || langId.value === 'null') {
                    const $ = queryXml(result)
                    const devLandId = $('//content').attr('currentLangType')!
                    langType.value = navigator.language.toLowerCase()
                    langId.value = LANG_MAPPING[langType.value]
                    if (!langId.value) {
                        // 如果map中不存在，则尝试只比较前2位
                        langId.value = LANG_MAPPING[langType.value.substring(0, 2)] as string
                    }
                    if (!langId.value) {
                        langId.value = devLandId
                    }
                    if (!langTypes.value[langId.value]) {
                        langId.value = devLandId
                    }

                    rtlLangList.value = $('//content/item[@alignRight="true"]').map((item) => {
                        return item.attr('id')!
                    })
                    if (!rtlLangList.value.length) {
                        rtlLangList.value = ['0x0429', '0x0c01']
                    }
                }
                for (const key in LANG_MAPPING) {
                    if (LANG_MAPPING[key].toLowerCase() == langId.value) {
                        langType.value = key
                        break
                    }
                }
                // 记住用户选择的语言
                localStorage.setItem(LocalCacheKey.langType, langType.value)
                localStorage.setItem(LocalCacheKey.langId, langId.value)
            })
        }

        /**
         * @description: 从设备请求指定语言项列表
         * @param {*} langType 指定语言项id
         * @return {*}
         */
        const requestLangItems = () => {
            const data = getXmlWrapData(rawXml`
                <condition>
                    <langType>${langId.value}</langType>
                </condition>
            `)
            return getLangContent(data).then((result) => {
                const langNodes = queryXml(result)('//content/langItems/item')
                const langItemsTemp: Record<string, string> = {}
                langNodes.forEach((item) => {
                    langItemsTemp[item.attr('id') as string] = item.text()
                })
                langItems.value = langItemsTemp
            })
        }

        /**
         * @description: 获取语言类型列表
         * @return {*}
         */
        const getLangTypes = async () => {
            if (Object.keys(langTypes.value).length) return langTypes
            await requestLangTypes()
            return langTypes
        }

        /**
         * @description: 获取语言项列表
         * @param: {boolean} force 是否强制刷新
         * @return {*}
         */
        const getLangItems = async (force?: boolean) => {
            if (!force) {
                if (Object.keys(langItems.value).length) return langItems
            }
            await requestLangItems()
            return langItems
        }

        /**
         * @description: 获取语言项列表
         * @param {string} key 翻译key
         * @return {string}
         */
        const Translate = (key: string): string => {
            const res = langItems.value[key] || key
            return convertToTextEntities(res)
        }

        const updateLangType = (newVal: string) => {
            langType.value = newVal
            localStorage.setItem(LocalCacheKey.langType, newVal)
        }

        const updateLangId = (newVal: string) => {
            langId.value = newVal
            localStorage.setItem(LocalCacheKey.langId, newVal)
        }

        //element国际化资源
        const elLocale = computed(() => {
            if (ELEMENT_LANG_MAPPING[langId.value]) {
                /* @ts-expect-error */
                return elLang[ELEMENT_LANG_MAPPING[langId.value]]
            } else {
                return elLang.en
            }
        })

        /**
         * @description 获取当前语言的书写模式
         * @returns {string} rtl | ltr
         */
        const getTextDir = () => {
            return rtlLangList.value.includes(langId.value) ? 'rtl' : 'ltr'
        }

        return {
            langId,
            langType,
            // getLangId: langIdLocal,
            // getLangType: langTypeLocal,
            elLocale,
            langItems,
            getLangTypes,
            getLangItems,
            Translate,
            updateLangType,
            updateLangId,
            rtlLangList,
            getTextDir,
        }
    },
    {
        persist: true,
    },
)
