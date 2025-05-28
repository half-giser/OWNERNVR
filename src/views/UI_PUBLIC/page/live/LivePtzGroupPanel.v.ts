/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 15:58:44
 * @Description: 现场预览-云台视图-巡航线组
 */
import ChannelCruiseGroupAddPop from '../channel/ChannelCruiseGroupAddPop.vue'

export default defineComponent({
    components: {
        ChannelCruiseGroupAddPop,
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
    },
    emits: {
        trigger() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        // 巡航线最大数量
        const CRUISE_MAX_COUNT = 8

        const pageData = ref({
            // 是否显示新增巡航线组弹窗
            isAddPop: false,
            // 当前选中巡航线组项索引
            active: 0,
        })

        // 列表数据
        const formData = ref(new ChannelPtzCruiseGroupChlDto())

        /**
         * @description 获取巡航线组列表
         */
        const getList = async () => {
            const chlId = prop.chlId
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryLocalChlPtzGroup(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success' && chlId === prop.chlId) {
                formData.value.chlId = chlId
                formData.value.chlName = prop.chlName
                formData.value.cruise = $('content/cruises/item').map((item, index) => {
                    const $item = queryXml(item.element)
                    return {
                        name: $item('name').text(),
                        index: item.attr('index').num() || index,
                        number: item.attr('number').num(),
                    }
                })
                formData.value.cruiseCount = formData.value.cruise.length
                formData.value.maxCount = CRUISE_MAX_COUNT
            }
        }

        /**
         * @description 新增巡航线组
         */
        const addCruiseGroup = () => {
            // 巡航线数量达到上限8个
            if (formData.value.cruise.length >= formData.value.maxCount) {
                openMessageBox(Translate('IDCS_OVER_MAX_NUMBER_LIMIT'))
                return
            }
            pageData.value.isAddPop = true
        }

        /**
         * @description 确认新增巡航线组后 刷新数据
         */
        const confirmAddCruiseGroup = () => {
            pageData.value.isAddPop = false
            getList()
        }

        /**
         * @description 删除巡航线组
         * @param {number} index
         * @param {string} name
         */
        const deleteCruiseGroup = (index: number, name: string) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_CRUISE_BY_GROUP_S').formatForLang(getShortString(name, 10)),
            }).then(async () => {
                const sendXml = rawXml`
                    <content>
                        <chlId>${prop.chlId}</chlId>
                        <index>1</index>
                        <name>group1</name>
                        <cruises type="list">
                            <item index="${index}">
                                <name>${wrapCDATA(name)}</name>
                            </item>
                        </cruises>
                    </content>
                `
                const result = await editChlPtzGroup(sendXml)

                commDelResponseHandler(
                    result,
                    () => {
                        getList()
                    },
                    () => {
                        getList()
                    },
                )
            })
        }

        /**
         * @description 播放当前选中的巡航线组
         * @param {number} index
         */
        const playCurrentCruiseGroup = (index: number) => {
            ctx.emit('trigger')
            pageData.value.active = index
            playCruiseGroup()
        }

        /**
         * @description 请求播放巡航线组
         */
        const playCruiseGroup = () => {
            if (!prop.enabled) {
                return
            }
            const item = formData.value.cruise[pageData.value.active]
            if (!item) {
                return
            }

            if (prop.chlId) {
                const sendXml = rawXml`
                    <content>
                        <chlId>${prop.chlId}</chlId>
                        <index>${item.index}</index>
                    </content>
                `
                runChlPtzGroup(sendXml)
            }
        }

        /**
         * @description 停止播放巡航线组
         */
        const stopCruiseGroup = () => {
            ctx.emit('trigger')
            if (prop.chlId) {
                const sendXml = rawXml`
                    <content>
                        <chlId>${prop.chlId}</chlId>
                    </content>
                `
                stopChlPtzGroup(sendXml)
            }
        }

        watch(
            () => prop.chlId,
            (newVal) => {
                if (systemCaps.supportPtzGroupAndTrace && newVal) {
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
            deleteCruiseGroup,
            addCruiseGroup,
            playCruiseGroup,
            playCurrentCruiseGroup,
            stopCruiseGroup,
            confirmAddCruiseGroup,
        }
    },
})
