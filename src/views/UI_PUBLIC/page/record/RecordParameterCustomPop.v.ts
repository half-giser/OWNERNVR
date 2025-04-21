/*
 * @Description: 录像——参数配置——通道录像参数——过期时间自定义
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-05 16:26:27
 */
import dayjs from 'dayjs'
import { type BaseNumberInputReturnsType } from '@/components/form/BaseNumberInput.vue'

export default defineComponent({
    props: {
        expirationType: {
            type: String,
            required: true,
        },
        expirationData: {
            type: Object as PropType<RecordParamDto>,
            required: true,
        },
    },
    emits: {
        confirm(week: string, holiday: string, expiration: number, expirationData?: RecordParamDto) {
            return (typeof week === 'string' && typeof holiday === 'string' && typeof expiration === 'number') || !!expirationData
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        const week = objectToOptions(getTranslateMapping(DEFAULT_WEEK_MAPPING2), 'number')

        const pageData = ref({
            expireTime: undefined as number | undefined,
            isShowAddDate: false,
            selectDate: '',
            toAddDateList: [] as { date: string }[],
            weekArr: [] as number[],
        })

        const inputRef = ref<BaseNumberInputReturnsType>()

        /**
         * @description 打开弹窗时更新页面项
         */
        const open = () => {
            if (prop.expirationType !== 'all') {
                if (!prop.expirationData.expiration || !Number(prop.expirationData.expiration)) {
                    pageData.value.expireTime = undefined
                } else {
                    pageData.value.expireTime = prop.expirationData.singleExpirationUnit === 'd' ? Number(prop.expirationData.expiration) * 24 : Number(prop.expirationData.expiration)
                }
                const week = prop.expirationData?.week
                if (week) {
                    pageData.value.weekArr = week.split(',').map((item) => Number(item))
                }
                const holiday = prop.expirationData.holiday
                if (holiday) {
                    holiday.split(',').forEach((item) => {
                        pageData.value.toAddDateList.push({
                            date: formatGregoryDate(item, dateTime.dateFormat, 'YYYY-MM-DD'),
                        })
                    })
                }
            }
        }

        const blurExpireTime = () => {
            if (!pageData.value.expireTime) {
                pageData.value.expireTime = 1
            }
        }

        const opened = () => {
            inputRef.value?.focus()
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
                openMessageBox(Translate('IDCS_EXPIRE_TIME_EMPTY'))
                return
            }

            if (pageData.value.expireTime < 1 || pageData.value.expireTime > 8760) {
                openMessageBox(Translate('IDCS_EXPIRE_TIME_INVALID'))
                return
            }

            if (pageData.value.weekArr.length === 7) {
                openMessageBox(Translate('IDCS_KEEPVIDEO_WEEK_ALL'))
                return
            }
            const unit = pageData.value.expireTime === 1 ? Translate('IDCS_HOUR') : Translate('IDCS_HOURS')
            const tips = pageData.value.expireTime + ' ' + unit
            const week = pageData.value.weekArr.join(',')
            const holiday = pageData.value.toAddDateList.map((item) => formatGregoryDate(item.date, 'YYYY-MM-DD', dateTime.dateFormat)).join(',')
            const expiration = pageData.value.expireTime

            close()
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_CHANGE_EXPIRE_TIME_WARNING_D').formatForLang(tips),
            }).then(() => {
                if (prop.expirationType === 'all') {
                    ctx.emit('confirm', week, holiday, expiration)
                } else {
                    ctx.emit('confirm', week, holiday, expiration, prop.expirationData)
                }
            })
        }

        // 打开添加日期弹窗
        const openAddDate = () => {
            pageData.value.selectDate = dayjs(new Date()).calendar('gregory').format(dateTime.dateFormat)
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

        const displayDate = (date: string) => {
            return formatDate(date, dateTime.dateFormat)
        }

        return {
            week,
            pageData,
            open,
            close,
            apply,
            openAddDate,
            closeAddDate,
            addDateToList,
            handleDelDate,
            handleDelDateAll,
            inputRef,
            opened,
            blurExpireTime,
            displayDate,
        }
    },
})
