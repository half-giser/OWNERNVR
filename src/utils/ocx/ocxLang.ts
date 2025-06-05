/*
 * @Date: 2025-04-29 20:03:11
 * @Description: 插件初始化语言模块
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
export const useOCXLang = defineStore('ocxLang', () => {
    let ready = false
    const lang = useLangStore()
    const allLangItems = ref<Record<string, Record<string, string>>>({})
    // 语言列表(key值与显示文本的映射)
    const langItems = ref<Record<string, string>>({})

    /**
     * @description 获取语言项列表
     * @param {string} key 翻译key
     * @return {string}
     */
    const Translate = (key: string): string => {
        const res = key ? langItems.value[key] || key : key
        if (res) {
            return convertToTextEntities(res)
        }
        return res
    }

    const requestLangItems = () => {
        langItems.value = allLangItems.value[lang.langId] ?? allLangItems.value['0x0409']
        console.log(langItems.value)
    }

    const getLangContent = async () => {
        const data = await fetch('./languages.json').then((res) => res.json())
        allLangItems.value = data.translate
    }

    watch(
        () => lang.langId,
        async () => {
            if (!ready) {
                await getLangContent()
                ready = true
            }
            requestLangItems()
        },
        {
            immediate: true,
        },
    )

    return {
        Translate,
        langItems,
    }
})
