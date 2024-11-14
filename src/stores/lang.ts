/*
 * @Author: xujp xujp@tvt.net.cn
 * @Date: 2023-05-04 17:27:29
 * @Description: 语言翻译的全局存储
 */
// import * as elLang from 'element-plus/es/locale/index.mjs'
import { type TranslatePair } from 'element-plus/es/locale'
export const useLangStore = defineStore(
    'lang',
    () => {
        // 语言key值（16进制字符串，如0x0409)
        const langType = ref('')
        // 语言代码 （如zh-cn、en-us）
        const langId = ref('')

        // 语言类型列表
        const langTypes = ref<Record<string, string>>({})
        // 语言列表(key值与显示文本的映射)
        const langItems = ref<Record<string, string>>({})
        // 需要文本右对齐的语言列表（如: 波斯语、阿拉伯语）
        const rtlLangList = ref<string[]>([])

        /**
         * @description: 从设备请求指定语言类型列表
         */
        const requestLangTypes = async () => {
            if (!langType.value) {
                langType.value = localStorage.getItem(LocalCacheKey.KEY_LANG_TYPE) || ''
            }

            if (!langId.value) {
                langId.value = localStorage.getItem(LocalCacheKey.KEY_LANG_ID) || ''
            }

            const result = await getSupportLangList()
            const $ = queryXml(result)

            const langTypesTemp: Record<string, string> = {}
            $('//content/item').forEach((item) => {
                langTypesTemp[item.attr('id')] = queryXml(item.element)('name').text()
            })
            langTypes.value = langTypesTemp

            if (!langId.value || langId.value === 'null' || langId.value === 'undefined') {
                const $ = queryXml(result)
                const devLandId = $('//content').attr('currentLangType')
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
                    return item.attr('id')
                })
                if (!rtlLangList.value.length) {
                    rtlLangList.value = ['0x0429', '0x0c01']
                }
            }

            langType.value = LANG_TYPE_MAPPING[langId.value] || ''

            // 记住用户选择的语言
            localStorage.setItem(LocalCacheKey.KEY_LANG_TYPE, langType.value)
            localStorage.setItem(LocalCacheKey.KEY_LANG_ID, langId.value)
        }

        /**
         * @description: 从设备请求指定语言项列表
         */
        const requestLangItems = async () => {
            const data = rawXml`
                <condition>
                    <langType>${langId.value}</langType>
                </condition>
            `
            const result = await getLangContent(data)
            const $ = queryXml(result)
            const langItemsTemp: Record<string, string> = {}
            $('//content/langItems/item').forEach((item) => {
                langItemsTemp[item.attr('id')] = item.text()
            })
            langItems.value = langItemsTemp
        }

        /**
         * @description 获取语言类型列表
         * @return {Ref<Record<string, string>>}
         */
        const getLangTypes = async () => {
            if (Object.keys(langTypes.value).length) return langTypes
            await requestLangTypes()
            return langTypes
        }

        /**
         * @description: 获取语言项列表
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
         * @description: 获取语言项列表
         * @param {string} key 翻译key
         * @return {string}
         */
        const Translate = (key: string): string => {
            const res = langItems.value[key] || key
            return convertToTextEntities(res)
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

        //element国际化资源
        const elLocale = computed(() => {
            return {
                name: 'custom',
                el: {
                    // breadcrumb: {
                    //     label: '',
                    // },
                    // colorpicker: {
                    //     confirm: '', // Translate('IDCS_OK'),
                    //     clear: '', // Translate("IDCS_CLEAR")
                    // },
                    datepicker: {
                        now: Translate('IDCS_CURRENT_TIME'), // "此刻",
                        today: Translate('IDCS_CALENDAR_TODAY'),
                        cancel: Translate('IDCS_CANCEL'),
                        clear: Translate('IDCS_CLEAR'),
                        confirm: Translate('IDCS_OK'),
                        selectDate: Translate('IDCS_SELECT'), // "选择日期",
                        selectTime: Translate('IDCS_SELECT'), // "选择时间",
                        startDate: Translate('IDCS_START_TIME'), // "开始日期",
                        startTime: Translate('IDCS_START_TIME'),
                        endDate: Translate('IDCS_END_TIME'), // "结束日期",
                        endTime: Translate('IDCS_END_TIME'),
                        prevYear: Translate('IDCS_PREVIOUS'), // "前一年",
                        nextYear: Translate('IDCS_NEXT'), // "后一年",
                        prevMonth: Translate('IDCS_PREVIOUS'), // "上个月",
                        nextMonth: Translate('IDCS_NEXT'), // "下个月",
                        year: Translate('IDCS_YEAR_ALL'),
                        month1: Translate('IDCS_Month_ONE'),
                        month2: Translate('IDCS_Month_TWO'),
                        month3: Translate('IDCS_Month_THREE'),
                        month4: Translate('IDCS_Month_FOUR'),
                        month5: Translate('IDCS_Month_FIVE'),
                        month6: Translate('IDCS_Month_SIX'),
                        month7: Translate('IDCS_Month_SEVEN'),
                        month8: Translate('IDCS_Month_EIGHT'),
                        month9: Translate('IDCS_Month_NINE'),
                        month10: Translate('IDCS_Month_TEM'),
                        month11: Translate('IDCS_Month_ELEVEN'),
                        month12: Translate('IDCS_Month_TWELVE'),
                        weeks: {
                            sun: Translate('IDCS_CALENDAR_SUNDAY'),
                            mon: Translate('IDCS_CALENDAR_MONDAY'),
                            tue: Translate('IDCS_CALENDAR_TUESDAY'),
                            wed: Translate('IDCS_CALENDAR_WEDNESDAY'),
                            thu: Translate('IDCS_CALENDAR_THURSDAY'),
                            fri: Translate('IDCS_CALENDAR_FRIDAY'),
                            sat: Translate('IDCS_CALENDAR_SATURDAY'),
                        },
                        months: {
                            jan: Translate('IDCS_CALENDAR_JANUARY'),
                            feb: Translate('IDCS_CALENDAR_FEBRUARY'),
                            mar: Translate('IDCS_CALENDAR_MARCH'),
                            apr: Translate('IDCS_CALENDAR_APRIL'),
                            may: Translate('IDCS_CALENDAR_MAY'),
                            jun: Translate('IDCS_CALENDAR_JUNE'),
                            jul: Translate('IDCS_CALENDAR_JULY'),
                            aug: Translate('IDCS_CALENDAR_AUGUST'),
                            sep: Translate('IDCS_CALENDAR_SEPTEMBER'),
                            oct: Translate('IDCS_CALENDAR_OCTOBER'),
                            nov: Translate('IDCS_CALENDAR_NOVEMBER'),
                            dec: Translate('IDCS_CALENDAR_DECEMBER'),
                        },
                    },
                    select: {
                        loading: '',
                        noMatch: '',
                        noData: '',
                        placeholder: '', // "请选择"
                    },
                    // cascader: {
                    //     noMatch: '',
                    //     loading: '',
                    //     placeholder: '',
                    //     noData: '',
                    // },
                    pagination: {
                        goto: '', // "前往",
                        pagesize: '',
                        total: Translate('IDCS_TOTAL') + ' {total}',
                        pageClassifier: '', // "页",
                        page: '', // "页",
                        prev: '', // "上一页",
                        next: '', // "下一页",
                        currentPage: '{pager}', //"第 {pager} 页",
                        prevPages: '', // "向前 {pager} 页",
                        nextPages: '', // "向后 {pager} 页",
                        deprecationWarning: '', // "你使用了一些已被废弃的用法，请参考 el-pagination 的官方文档"
                    },
                    messagebox: {
                        title: Translate('IDCS_INFO_TIP'),
                        confirm: Translate('IDCS_OK'),
                        cancel: Translate('IDCS_CANCEL'),
                        error: '', // "输入的数据不合法!"
                    },
                    upload: {
                        deleteTip: '', // "按 delete 键可删除",
                        delete: '', // "删除",
                        preview: '', // "查看图片",
                        continue: '', // "继续上传"
                    },
                    table: {
                        emptyText: '', // "暂无数据",
                        confirmFilter: '', // "筛选",
                        resetFilter: '', //"重置",
                        clearFilter: '', //"全部",
                        sumText: '', //"合计"
                    },
                    // tour: {
                    //     next: '', //"下一步",
                    //     previous: '', //"上一步",
                    //     finish: '', //"结束导览"
                    // },
                    // tree: {
                    //     emptyText: '', //"暂无数据"
                    // },
                    transfer: {
                        noMatch: '', //"无匹配数据",
                        noData: '', //"无数据",
                        titles: [
                            //"列表 1",
                            //"列表 2"
                            '',
                            '',
                        ],
                        filterPlaceholder: '', // "请输入搜索内容",
                        noCheckedFormat: '', // Translate('IDCS_TOTAL') + ': {total}',
                        hasCheckedFormat: '', // Translate('IDCS_SELECT_CHANNEL_COUNT').formatForLang('{checked}', '{total}'), // "已选 {checked}/{total} 项"
                    },
                    // image: {
                    //     error: '', // "加载失败"
                    // },
                    // pageHeader: {
                    //     title: Translate('IDCS_BACK'), // "返回"
                    // },
                    // popconfirm: {
                    //     confirmButtonText: Translate('IDCS_OK'),
                    //     cancelButtonText: Translate('IDCS_CANCEL'),
                    // },
                    // carousel: {
                    //     leftArrow: '', // "上一张幻灯片",
                    //     rightArrow: '', // "下一张幻灯片",
                    //     indicator: '', // "幻灯片切换至索引 {index}"
                    // },
                } as TranslatePair,
            }
            // if (ELEMENT_LANG_MAPPING[langId.value]) {
            //     /* @ts-expect-error */
            //     return elLang[ELEMENT_LANG_MAPPING[langId.value]]
            // } else {
            //     return elLang.en
            // }
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
