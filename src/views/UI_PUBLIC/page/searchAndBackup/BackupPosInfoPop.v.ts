/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 16:13:26
 * @Description: POS信息弹窗
 */
export default defineComponent({
    props: {
        /**
         * @property 列表项
         */
        item: {
            type: Object as PropType<PlaybackRecLogList>,
            required: true,
        },
        /**
         * @property POS关键字
         */
        keyword: {
            type: String,
            required: true,
        },
    },
    emits: {
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        const pageData = ref({
            // POS名称
            name: '',
            // POS信息
            info: '',
        })

        /**
         * @description 获取POS信息
         */
        const getData = async () => {
            const sendXml = rawXml`
                <condition>
                    <keyword>${prop.keyword}</keyword>
                    <startTime>${localToUtc(prop.item.startTime)}</startTime>
                    <endTime>${localToUtc(prop.item.endTime)}</endTime>
                    <chl id="${prop.item.chlId}">${prop.item.chlName}</chl>
                </condition>
            `
            const result = await queryPosBillList(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.name = $('content/pos').text()
                // TODO 需要测试数据做测试
                pageData.value.info = base64Decode($('content/posInfo').text())
            }
        }

        /**
         * @description 打开弹窗时，请求POS信息
         */
        const open = () => {
            pageData.value.name = ''
            pageData.value.info = Translate('IDCS_NULL')
            getData()
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 显示格式化时间日期
         * @param {Number} timestamp
         * @returns {String}
         */
        const displayDateTime = (timestamp: number) => {
            return formatDate(timestamp, dateTime.dateTimeFormat)
        }

        return {
            open,
            close,
            displayDateTime,
            pageData,
        }
    },
})
