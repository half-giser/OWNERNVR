/*
 * @Date: 2025-05-08 14:59:41
 * @Description: 客流量 人数统计
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
export default defineComponent({
    setup() {
        const dateTime = useDateTimeStore()

        const formData = ref({
            personIn: '',
            personOut: '',
            personStay: '',
            childIn: '',
            childOut: '',
            childStay: '',
            startStatisticalTime: '',
            chls: '',
        })

        const getData = async () => {
            const result = await queryPassengerFlowStatisticsInfo()
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                formData.value.personIn = $('content/personIn').text()
                formData.value.personOut = $('content/personOut').text()
                formData.value.personStay = $('content/personStay').text() // 滞留人数
                formData.value.childIn = $('content/childIn').text() // 进入儿童数
                formData.value.childOut = $('content/childOut').text() // 离开儿童数
                formData.value.childStay = $('content/childStay').text() // 滞留儿童数
                const timeStr = $('content/startStatisticalTime').text().num() // 统计开始时间--格式为时间戳
                if (timeStr) {
                    formData.value.startStatisticalTime = formatDate(timeStr * 1000, dateTime.dateTimeFormat)
                } else {
                    formData.value.startStatisticalTime = ''
                }
                formData.value.chls = $('content/chls/item')
                    .map((item) => item.attr('name'))
                    .join(', ')
            }
        }

        const timer = useRefreshTimer(() => {
            getData()
        }, 5000)

        onActivated(async () => {
            await getData()
            timer.repeat(true)
        })

        onDeactivated(() => {
            timer.stop()
        })

        return {
            formData,
        }
    },
})
