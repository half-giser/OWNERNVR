/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-19 18:11:35
 * @Description: P2P语言模块
 */
export const useP2PLang = () => {
    type LanguageResultItem = {
        comment: string
        dir: string
        id: string
        name: string
    }

    type LanguageResult = {
        languages: Record<string, LanguageResultItem>
    }

    type LanguageTypeItem = {
        type: string
        comment: string
        dir: string
        id: string
        name: string
    }

    type LanguageItemResult = {
        text: Record<string, string>
    }

    // 语言key值（16进制字符串，如0x0409)
    const langType = ref('')
    // 语言代码 （如zh-cn、en-us）
    const langId = ref('')

    // 语言类型列表
    const langTypes = ref<LanguageTypeItem[]>([])
    // 语言列表(key值与显示文本的映射)
    const langItems = ref<Record<string, string>>({})

    /**
     * @description 从服务器请求指定语言类型列表
     */
    const requestLangTypes = () => {
        if (!langType.value) {
            langType.value = localStorage.getItem(LocalCacheKey.KEY_LANG_TYPE) || ''
        }

        if (!langId.value) {
            langId.value = localStorage.getItem(LocalCacheKey.KEY_LANG_ID) || ''
        }

        return fetch(`${import.meta.env.VITE_P2P_URL}/public/LanguageInfo/LanguageIndex.js?v=${import.meta.env.VITE_PACKAGE_VER}`)
            .then((res) => res.json())
            .then((res: LanguageResult) => {
                langTypes.value = Object.entries(res.languages).map((item) => {
                    return {
                        type: item[0],
                        comment: item[1].comment,
                        dir: item[1].dir,
                        id: item[1].id,
                        name: item[1].name,
                    }
                })

                if (!langId || langId.value === 'null' || langId.value === 'undefined') {
                    langType.value = navigator.language.toLowerCase()
                    langId.value = LANG_MAPPING[langType.value]
                    if (!langId.value) {
                        // 如果map中不存在，则尝试只比较前2位
                        langId.value = LANG_MAPPING[langType.value.substring(0, 2)]
                    }

                    if (!langId.value) {
                        langId.value = '0x0409'
                    }
                }

                langType.value = LANG_TYPE_MAPPING[langId.value] || ''

                // 记住用户选择的语言
                localStorage.setItem(LocalCacheKey.KEY_LANG_TYPE, langType.value)
                localStorage.setItem(LocalCacheKey.KEY_LANG_ID, langId.value)
            })
    }

    /**
     * @description 从服务器请求指定语言项列表
     * @param {string} langType 指定语言项id
     */
    const requestLangItems = () => {
        const find = langTypes.value.find((item) => item.id === langId.value)
        if (find) {
            return fetch(`${import.meta.env.VITE_P2P_URL}/public/LanguageInfo/${find.dir}.js?v=${import.meta.env.VITE_PACKAGE_VER}`)
                .then((res) => res.json())
                .then((res: LanguageItemResult) => {
                    langItems.value = res.text
                })
        } else {
            return Promise.reject()
        }
    }

    /**
     * @description 获取语言项列表
     * @param {string} key 翻译key
     * @return {string}
     */
    const Translate = (key: string): string => {
        const res = langItems.value[key] || key
        return convertToTextEntities(res)
    }

    /**
     * @description 获取语言类型列表
     * @return {Ref<LanguageTypeItem[]>}
     */
    const getLangTypes = async () => {
        if (langTypes.value.length) return langTypes
        await requestLangTypes()
        return langTypes
    }

    /**
     * @description 获取语言项列表
     * @param {boolean} force 是否强制刷新
     * @return {Ref<Record<string, string>>}
     */
    const getLangItems = async (force?: boolean) => {
        if (!force) {
            if (Object.keys(langItems.value).length) return langItems
        }
        await requestLangItems()
        return langItems
    }

    /**
     * @description 更新语言key值
     * @param {string} newVal
     */
    const updateLangType = (newVal: string) => {
        langType.value = newVal
        localStorage.setItem(LocalCacheKey.KEY_LANG_TYPE, newVal)
    }

    /**
     * @description 更新语言代码
     * @param {string} newVal
     */
    const updateLangId = (newVal: string) => {
        langId.value = newVal
        localStorage.setItem(LocalCacheKey.KEY_LANG_ID, newVal)
    }

    return {
        langType,
        langId,
        langTypes,
        getLangTypes,
        getLangItems,
        updateLangType,
        updateLangId,
        Translate,
    }
}
