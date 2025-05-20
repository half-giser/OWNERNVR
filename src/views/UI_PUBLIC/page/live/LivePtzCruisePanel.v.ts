/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 15:50:48
 * @Description: 现场预览-云台视图-巡航线
 */
import ChannelCruiseAddPop from '../channel/ChannelCruiseAddPop.vue'

export default defineComponent({
    components: {
        ChannelCruiseAddPop,
    },
    props: {
        /**
         * @property 通道ID
         */
        chlId: {
            type: String,
            required: true,
        },
        /**
         * @property 通道名称
         */
        chlName: {
            type: String,
            required: true,
        },
        /**
         * @property 是否可用
         */
        enabled: {
            type: Boolean,
            required: true,
        },
        /**
         * @property 速度值
         */
        speed: {
            type: Number,
            required: true,
        },
    },
    setup(prop) {
        const { Translate } = useLangStore()

        const pageData = ref({
            // 是否显示增加选航线弹窗
            isAddPop: false,
            // 当前选中的选航线项索引
            active: 0,
        })

        // 列表数据
        const formData = ref(new ChannelPtzCruiseChlDto())

        /**
         * @description 获取列表数据
         */
        const getList = async () => {
            const chlId = prop.chlId
            const sendXml = rawXml`
                <condition>
                    <chlId>${prop.chlId}</chlId>
                </condition>
            `
            const result = await queryChlCruiseList(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success' && chlId === prop.chlId) {
                formData.value.chlId = chlId
                formData.value.chlName = prop.chlName
                formData.value.cruise = $('content/cruises/item').map((item) => {
                    return {
                        name: item.text(),
                        index: item.attr('index').num(),
                        number: item.attr('number').num(),
                    }
                })
                formData.value.maxCount = $('content/cruises').attr('maxCount').num()
                formData.value.cruiseCount = formData.value.cruise.length
                formData.value.cruisePresetMinSpeed = $('type/cruisePresetMinSpeed').text().num()
                formData.value.cruisePresetMaxSpeed = $('type/cruisePresetMaxSpeed').text().num()
                formData.value.cruisePresetMinHoldTime = $('type/cruisePresetMinHoldTime').text().num()
                formData.value.cruisePresetMaxHoldTime = $('type/cruisePresetMaxHoldTime').text().num()
                formData.value.cruisePresetDefaultHoldTime = $('type/cruisePresetDefaultHoldTime').text().num()
                formData.value.cruisePresetMaxCount = $('type/cruisePresetMaxCount').text().num()
                formData.value.cruisePresetHoldTimeList = $('type/cruisePresetHoldTime')
                    .text()
                    .array()
                    .map((item) => Number(item))
                    .sort((a, b) => a - b)
                    .map((item) => {
                        return {
                            label: item + getTranslateForSecond(item),
                            value: item,
                        }
                    })
                formData.value.cruiseNameMaxLen = $('cruises/itemType').attr('maxLen').num()
            }
        }

        /**
         * @description 删除巡航线
         * @param {number} index
         * @param {string} cruiseName
         */
        const deleteCruise = (index: number, cruiseName: string) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_CRUISE_S').formatForLang(Translate('IDCS_CHANNEL'), getShortString(prop.chlName, 10), getShortString(cruiseName, 10)),
            }).then(async () => {
                const sendXml = rawXml`
                    <condition>
                        <chlId>${prop.chlId}</chlId>
                        <cruiseIndexes>
                            <item index="${index}">${wrapCDATA(cruiseName)}</item>
                        </cruiseIndexes>
                    </condition>
                `
                const result = await delChlCruise(sendXml)

                commDelResponseHandler(result, () => {
                    getList()
                })
            })
        }

        /**
         * @description 当开新增巡航线弹窗
         */
        const addCruise = () => {
            // 巡航线数量达到上限8个
            if (formData.value.cruise.length >= formData.value.maxCount) {
                openMessageBox(Translate('IDCS_OVER_MAX_NUMBER_LIMIT'))
                return
            }
            pageData.value.isAddPop = true
        }

        /**
         * @description 确认新增巡航线，更新列表
         */
        const confirmAddCruise = () => {
            pageData.value.isAddPop = false
            getList()
        }

        /**
         * @description 播放当前巡航线
         * @param {number} value
         */
        const playCurrentCruise = (value: number) => {
            pageData.value.active = value
            playCruise()
        }

        /**
         * @description 请求播放巡航线
         */
        const playCruise = () => {
            const item = formData.value.cruise[pageData.value.active]
            if (!item) {
                return
            }

            if (prop.chlId) {
                const sendXml = rawXml`
                    <content>
                        <chlId>${prop.chlId}</chlId>
                        <index>${item.index}</index>
                        <speed>${prop.speed}</speed>
                    </content>
                `
                runPtzCruise(sendXml)
            }
        }

        /**
         * @description 停止播放巡航线
         */
        const stopCruise = () => {
            if (prop.chlId) {
                const sendXml = rawXml`
                    <content>
                        <chlId>${prop.chlId}</chlId>
                    </content>
                `
                stopPtzCruise(sendXml)
            }
        }

        watch(
            () => prop.chlId,
            (newVal) => {
                if (newVal) {
                    getList()
                }
            },
            {
                immediate: true,
            },
        )

        return {
            pageData,
            formData,
            deleteCruise,
            playCruise,
            stopCruise,
            addCruise,
            confirmAddCruise,
            playCurrentCruise,
        }
    },
})
