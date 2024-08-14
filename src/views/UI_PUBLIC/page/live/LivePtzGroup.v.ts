/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 15:58:44
 * @Description: 现场预览-云台视图-巡航线组
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 17:40:58
 */
export default defineComponent({
    props: {
        /**
         * @property 通道ID
         */
        chlId: {
            type: String,
            required: true,
            default: '',
        },
        /**
         * @property 是否可用
         */
        enabled: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    setup(prop) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const systemCaps = useCababilityStore()

        const pageData = ref({
            // 是否显示新增巡航线组弹窗
            isAddPop: false,
            // 当前选中巡航线组项索引
            active: 0,
        })

        // 列表数据
        const listData = ref<SelectOption<number, string>[]>([])

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
            if ($('/response/status').text() === 'success' && chlId === prop.chlId) {
                listData.value = $('/response/content/cruises/item').map((item, index) => {
                    const $item = queryXml(item.element)
                    return {
                        label: $item('name').text(),
                        value: Number(item.attr('index') ? item.attr('index') : index),
                    }
                })
            }
        }

        /**
         * @description 新增巡航线组
         */
        const addCruiseGroup = () => {
            if (!prop.enabled) {
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
            if (!prop.enabled) {
                return
            }

            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_CRUISE_BY_GROUP_S').formatForLang(getShortString(name, 10)),
            }).then(async () => {
                openLoading(LoadingTarget.FullScreen)

                const sendXml = rawXml`
                    <content>
                        <chlId>${prop.chlId}</chlId>
                        <index>1</index>
                        <name>group1</name>
                        <cruises type="list">
                            <item index="${index.toString()}">
                                <name>${wrapCDATA(name)}</name>
                            </item>
                        </cruises>
                    </content>
                `
                const result = await editChlPtzGroup(sendXml)
                const $ = queryXml(result)

                closeLoading(LoadingTarget.FullScreen)

                if ($('/response/status').text() === 'success') {
                    openMessageTipBox({
                        type: 'success',
                        message: Translate('IDCS_DELETE_SUCCESS'),
                    }).finally(() => {
                        getList()
                    })
                } else {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_DELETE_FAIL'),
                    }).finally(() => {
                        getList()
                    })
                }
            })
        }

        /**
         * @description 播放当前选中的巡航线组
         * @param {number} index
         */
        const playCurrentCruiseGroup = (index: number) => {
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
            const item = listData.value[pageData.value.active]
            if (!item) {
                return
            }
            if (prop.chlId) {
                const sendXml = rawXml`
                    <chlId>${prop.chlId}</chlId>
                    <index>${item.value.toString()}</index>
                `
                runChlPtzGroup(sendXml)
            }
        }

        /**
         * @description 停止播放巡航线组
         */
        const stopCruiseGroup = () => {
            if (prop.chlId) {
                const sendXml = rawXml`
                    <chlId>${prop.chlId}</chlId>
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
            listData,
            deleteCruiseGroup,
            addCruiseGroup,
            playCruiseGroup,
            playCurrentCruiseGroup,
            stopCruiseGroup,
            confirmAddCruiseGroup,
        }
    },
})
