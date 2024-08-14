/*
 * @Description: 录像——参数配置——通道录像参数——过期时间自定义
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-05 16:26:27
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-08-09 11:23:32
 */

import { ChlRecParamList } from '@/types/apiType/record'

export default defineComponent({
    props: {
        expirationPopData: {
            type: Object,
            require: true,
            default: () => {
                return {
                    expirationType: String,
                    expirationData: ChlRecParamList,
                }
            },
        },
        handleGetExpirationData: {
            type: Function,
            require: true,
        },
    },
    emits: {
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()

        const week = [
            { value: '1', label: Translate('IDCS_MONDAY') },
            { value: '2', label: Translate('IDCS_TUESDAY') },
            { value: '3', label: Translate('IDCS_WEDNESDAY') },
            { value: '4', label: Translate('IDCS_THURSDAY') },
            { value: '5', label: Translate('IDCS_FRIDAY') },
            { value: '6', label: Translate('IDCS_SATURDAY') },
            { value: '7', label: Translate('IDCS_SUNDAY') },
        ]

        let dateFormat = ''

        const pageData = ref({
            expireTime: 1,
            isShowAddDate: false,
            selectDate: '',
            toAddDateList: [] as { date: string }[],
            weekArr: [] as Number[],
            dateFormat: '',
        })

        const getTimeCfg = async () => {
            const result = await queryTimeCfg()
            commLoadResponseHandler(result, ($) => {
                dateFormat = $('/response/content/formatInfo/date').text()
                switch (dateFormat) {
                    case 'year-month-day':
                        dateFormat = 'yyyy/MM/dd'
                        pageData.value.dateFormat = 'YYYY/MM/DD'
                        break
                    case 'month-day-year':
                        dateFormat = 'MM/dd/yyyy'
                        pageData.value.dateFormat = 'MM/DD/YYYY'
                        break
                    case 'day-month-year':
                        dateFormat = 'dd/MM/yyyy'
                        pageData.value.dateFormat = 'DD/MM/YYYY'
                        break
                    default:
                        dateFormat = 'yyyy/MM/dd'
                        pageData.value.dateFormat = 'YYYY/MM/DD'
                        break
                }
            })
        }

        /**
         * @description 打开弹窗时更新页面项
         */
        const open = async () => {
            await getTimeCfg()
            if (prop.expirationPopData.expirationType != 'all') {
                const expirationTime =
                    prop.expirationPopData.expirationData?.singleExpirationUnit == 'd'
                        ? Number(prop.expirationPopData.expirationData?.expiration) * 24
                        : Number(prop.expirationPopData.expirationData?.expiration)
                pageData.value.expireTime = expirationTime
                const week = prop.expirationPopData.expirationData?.week
                if (week) {
                    pageData.value.weekArr = week.split(',').map((item: any) => Number(item))
                }
                const holiday = prop.expirationPopData.expirationData?.holiday
                if (holiday) {
                    holiday.split(',').forEach((item: string) => {
                        const day = new Date(item)
                        pageData.value.toAddDateList.push({
                            date: day.format(dateFormat),
                        })
                    })
                }
            }
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
            pageData.value.expireTime = 1
            pageData.value.toAddDateList = []
            pageData.value.weekArr = []
        }

        // 提交数据
        const apply = () => {
            if (!pageData.value.expireTime) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_EXPIRE_TIME_EMPTY'),
                })
                return
            }
            if (pageData.value.expireTime < 1 || pageData.value.expireTime > 8760) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_EXPIRE_TIME_INVALID'),
                })
                return
            }
            if (pageData.value.weekArr.length == 7) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_KEEPVIDEO_WEEK_ALL'),
                })
                return
            }
            const unit = pageData.value.expireTime == 1 ? Translate('IDCS_HOUR') : Translate('IDCS_HOURS')
            const tips = pageData.value.expireTime + ' ' + unit
            ctx.emit('close')
            openMessageTipBox({
                type: 'info',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_CHANGE_EXPIRE_TIME_WARNING_D').formatForLang(tips),
            })
                .then(() => {
                    const week = pageData.value.weekArr.join(',')
                    const holiday = pageData.value.toAddDateList.map((item) => new Date(item.date).format('yyyy-MM-dd')).join(',')
                    if (prop.expirationPopData.expirationType == 'all') {
                        prop.handleGetExpirationData!(week, holiday, pageData.value.expireTime)
                    } else {
                        prop.handleGetExpirationData!(week, holiday, pageData.value.expireTime, prop.expirationPopData.expirationData)
                    }

                    pageData.value.expireTime = 1
                    pageData.value.toAddDateList = []
                    pageData.value.weekArr = []
                })
                .catch(() => {
                    pageData.value.expireTime = 1
                    pageData.value.toAddDateList = []
                    pageData.value.weekArr = []
                })
        }

        const inputLimit = () => {
            let value = pageData.value.expireTime
            if (value < 1) value = 1
            if (value > 8760) value = 8760
            pageData.value.expireTime = value
        }

        // 打开添加日期弹窗
        const openAddDate = () => {
            pageData.value.isShowAddDate = true
        }

        // 关闭添加日期弹窗
        const closeAddDate = () => {
            pageData.value.isShowAddDate = false
        }

        // 添加选中日期
        const addDateToList = () => {
            if (pageData.value.selectDate) {
                const dateList = pageData.value.toAddDateList.map((item) => item.date)
                if (!dateList.includes(pageData.value.selectDate)) {
                    pageData.value.toAddDateList.push({
                        date: pageData.value.selectDate,
                    })
                }
            }
            pageData.value.isShowAddDate = false
        }

        // 删除单行数据
        const handleDelDate = (value: { date: string }) => {
            pageData.value.toAddDateList = pageData.value.toAddDateList.filter((item) => {
                return item !== value
            })
        }

        // 删除全部数据
        const handleDelDateAll = () => {
            pageData.value.toAddDateList = []
        }

        onMounted(async () => {
            await getTimeCfg()
        })

        return {
            week,
            dateFormat,
            pageData,
            open,
            close,
            apply,
            inputLimit,
            openAddDate,
            closeAddDate,
            addDateToList,
            handleDelDate,
            handleDelDateAll,
        }
    },
})
