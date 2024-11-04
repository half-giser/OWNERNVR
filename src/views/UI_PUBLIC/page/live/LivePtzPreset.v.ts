/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:07:38
 * @Description: 现场预览-云台视图-预置点
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-09 18:34:25
 */
import ChannelPresetAddPop from '../channel/ChannelPresetAddPop.vue'
import { type ChannelPtzPresetDto } from '@/types/apiType/channel'

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
    setup(prop) {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()

        const pageData = ref({
            // 预置点最大数量
            maxCount: 0,
            // 是否显示新增预置点弹窗
            isAddPop: false,
            // 当前选中预置点项索引
            active: 0,
        })

        // 列表数据
        const listData = ref<ChannelPtzPresetDto[]>([])

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
            if ($('//status').text() === 'success' && chlId === prop.chlId) {
                pageData.value.maxCount = Number($('//content/presets').attr('maxCount'))
                listData.value = $('//content/presets/item').map((item) => {
                    return {
                        name: item.text(),
                        index: Number(item.attr('index')),
                    }
                })
            }
        }

        /**
         * @description 打开新增预置点弹窗
         */
        const addPreset = () => {
            if (!prop.enabled) {
                return
            }

            if (listData.value.length >= pageData.value.maxCount) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                })
                return
            }
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
            if (!prop.enabled) {
                return
            }

            const item = listData.value[pageData.value.active]
            if (!item) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_CHANNEL_PRESET_EMPTY'),
                })
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
                            <item index="${item.index.toString()}">${wrapCDATA(item.name)}</item>
                        </presetIndexes>
                    </condition>
                `
                const result = await delChlPreset(sendXml)
                const $ = queryXml(result)

                if ($('//status').text() === 'success') {
                    openMessageBox({
                        type: 'success',
                        message: Translate('IDCS_DELETE_SUCCESS'),
                    }).finally(() => {
                        getList()
                    })
                } else {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_DELETE_FAIL'),
                    })
                }
            })
        }

        /**
         * @description 保存预置点
         */
        const savePreset = async () => {
            if (!prop.enabled) {
                return
            }

            const item = listData.value[pageData.value.active]
            if (!item) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_CHANNEL_PRESET_EMPTY'),
                })
                return
            }

            const sendXml = rawXml`
                <content>
                    <chlId>${prop.chlId}</chlId>
                    <index>${item.index.toString()}</index>
                </content>
            `
            const result = await editChlPresetPosition(sendXml)

            commSaveResponseHadler(result)
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
                        <index>${value.toString()}</index>
                        <speed>${prop.speed.toString()}</speed>
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
            listData,
            pageData,
            confirmAddPreset,
            addPreset,
            deletePreset,
            callPreset,
            savePreset,
            ChannelPresetAddPop,
        }
    },
})
