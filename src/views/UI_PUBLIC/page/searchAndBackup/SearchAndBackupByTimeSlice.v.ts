/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 16:25:16
 * @Description: 按时间切片搜索
 */
import dayjs from 'dayjs'
import TimeSliceTopPanel from './TimeSliceTopPanel.vue'
import TimeSliceTimelinePanel from './TimeSliceTimelinePanel.vue'

export default defineComponent({
    components: {
        TimeSliceTopPanel,
        TimeSliceTimelinePanel,
    },
    setup() {
        const pageData = ref({
            // 面包屑
            nav: ['chl', 'year', 'month', 'day'],
            // 当前面包屑
            mode: 'chl',
            // 录像开始时间
            startTime: 0,
            // 通道的录像时间
            chlTime: 0,
            // 通道ID
            chlId: '',
            // 通道名称
            chlName: '',
        })

        const dateTime = useDateTimeStore()

        // 面包屑索引值
        const navIndex = computed(() => {
            return pageData.value.nav.indexOf(pageData.value.mode)
        })

        // 格式化年月
        const displayYearMonth = computed(() => {
            return formatDate(pageData.value.chlTime, dateTime.yearMonthFormat)
        })

        // 格式化日期
        const displayDate = computed(() => {
            return dayjs(pageData.value.chlTime).date()
        })

        /**
         * @description 切换面包屑
         * @param {String} mode
         */
        const changeMode = (mode: string) => {
            pageData.value.mode = mode
        }

        /**
         * @description 点击通道卡片，打开通道的时间切片详情
         * @param {String} mode
         * @param {String} chlId
         * @param {String} chlName
         * @param {Number} chlTime
         */
        const handleChlChange = (mode: string, chlId: string, chlName: string, chlTime: number) => {
            pageData.value.mode = mode
            pageData.value.chlId = chlId
            pageData.value.chlName = chlName
            pageData.value.chlTime = chlTime
        }

        /**
         * @description 时间切片详情的年月日切换
         * @param {String} mode
         * @param {Number} chlTime
         */
        const handleSliceChange = (mode: string, chlTime: number) => {
            pageData.value.mode = mode
            pageData.value.chlTime = chlTime
        }

        return {
            pageData,
            navIndex,
            displayYearMonth,
            displayDate,
            handleChlChange,
            handleSliceChange,
            changeMode,
        }
    },
})
