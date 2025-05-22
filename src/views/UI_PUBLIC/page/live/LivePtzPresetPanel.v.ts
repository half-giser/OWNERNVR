/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:07:38
 * @Description: 现场预览-云台视图-预置点
 */
import ChannelPresetAddPop from '../channel/ChannelPresetAddPop.vue'

export default defineComponent({
    components: {
        ChannelPresetAddPop,
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
    emits: {
        trigger() {
            return true
        },
    },
    setup(prop) {
        const { Translate } = useLangStore()

        const pageData = ref({
            // 是否显示新增预置点弹窗
            isAddPop: false,
            // 当前选中预置点项索引
            active: 0,
        })

        const formData = ref(new ChannelPtzPresetChlDto())

        /**
         * @description 获取预置点列表
         */
        const getList = async () => {
            const chlId = prop.chlId
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryChlPresetList(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success' && chlId === prop.chlId) {
                formData.value.chlId = chlId
                formData.value.chlName = prop.chlName
                formData.value.maxCount = $('content/presets').attr('maxCount').num()
                formData.value.presets = $('content/presets/item').map((item) => {
                    return {
                        name: item.text(),
                        index: item.attr('index').num(),
                    }
                })
                formData.value.presetCount = formData.value.presets.length
                formData.value.nameMaxByteLen = $('content/presets/itemType').attr('maxByteLen').num() || nameByteMaxLen
            }
        }

        /**
         * @description 打开新增预置点弹窗
         */
        const addPreset = () => {
            if (formData.value.presets.length >= formData.value.maxCount) {
                openMessageBox(Translate('IDCS_OVER_MAX_NUMBER_LIMIT'))
                return
            }
            formData.value.chlId = prop.chlId
            formData.value.chlName = prop.chlName
            pageData.value.isAddPop = true
        }

        /**
         * @description 确认新增预置点后 刷新数据
         */
        const confirmAddPreset = () => {
            pageData.value.isAddPop = false
            getList()
        }

        /**
         * @description 删除预置点
         */
        const deletePreset = () => {
            const item = formData.value.presets[pageData.value.active]
            if (!item) {
                openMessageBox(Translate('IDCS_PROMPT_CHANNEL_PRESET_EMPTY'))
                return
            }

            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_PRESET_S').formatForLang(Translate('IDCS_CHANNEL'), getShortString(prop.chlName, 10), getShortString(item.name, 10)),
            }).then(async () => {
                const sendXml = rawXml`
                    <condition>
                        <chlId>${prop.chlId}</chlId>
                        <presetIndexes>
                            <item index="${item.index}">${wrapCDATA(item.name)}</item>
                        </presetIndexes>
                    </condition>
                `
                const result = await delChlPreset(sendXml)

                commDelResponseHandler(result, () => {
                    getList()
                })
            })
        }

        /**
         * @description 保存预置点
         */
        const savePreset = async () => {
            const item = formData.value.presets[pageData.value.active]
            if (!item) {
                openMessageBox(Translate('IDCS_PROMPT_CHANNEL_PRESET_EMPTY'))
                return
            }

            const sendXml = rawXml`
                <content>
                    <chlId>${prop.chlId}</chlId>
                    <index>${item.index}</index>
                </content>
            `
            const result = await editChlPresetPosition(sendXml)

            commSaveResponseHandler(result)
        }

        /**
         * @description 执行预置点
         * @param {Number} value
         * @param {Number} index
         */
        const callPreset = (value: number, index: number) => {
            pageData.value.active = index

            if (prop.chlId) {
                const sendXml = rawXml`
                    <content>
                        <chlId>${prop.chlId}</chlId>
                        <index>${value}</index>
                        <speed>${prop.speed}</speed>
                    </content>
                `
                goToPtzPreset(sendXml)
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
            formData,
            pageData,
            confirmAddPreset,
            addPreset,
            deletePreset,
            callPreset,
            savePreset,
        }
    },
})
