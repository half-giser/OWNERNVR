/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 15:50:48
 * @Description: 现场预览-云台视图-巡航线
 */
import ChannelCruiseAddPop from '../channel/ChannelCruiseAddPop.vue'
import { type ChannelPtzCruiseDto } from '@/types/apiType/channel'

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

        const CRUISE_MAX_COUNT = 8

        const pageData = ref({
            // 是否显示增加选航线弹窗
            isAddPop: false,
            // 巡航线最大数量
            maxCount: CRUISE_MAX_COUNT,
            // 当前选中的选航线项索引
            active: 0,
        })

        // 列表数据
        const listData = ref<ChannelPtzCruiseDto[]>([])

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
                listData.value = $('content/cruises/item').map((item) => {
                    return {
                        name: item.text(),
                        index: item.attr('index').num(),
                    }
                })
            }
        }

        /**
         * @description 删除巡航线
         * @param {number} index
         * @param {string} cruiseName
         */
        const deleteCruise = (index: number, cruiseName: string) => {
            if (!prop.enabled) {
                return
            }

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
                const $ = queryXml(result)

                if ($('status').text() === 'success') {
                    openMessageBox({
                        type: 'success',
                        message: Translate('IDCS_DELETE_SUCCESS'),
                    }).finally(() => {
                        getList()
                    })
                }
            })
        }

        /**
         * @description 当开新增巡航线弹窗
         */
        const addCruise = () => {
            if (!prop.enabled) {
                return
            }

            // 巡航线数量达到上限8个
            if (listData.value.length >= CRUISE_MAX_COUNT) {
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
            const item = listData.value[pageData.value.active]
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
            listData,
            deleteCruise,
            playCruise,
            stopCruise,
            addCruise,
            confirmAddCruise,
            playCurrentCruise,
        }
    },
})
