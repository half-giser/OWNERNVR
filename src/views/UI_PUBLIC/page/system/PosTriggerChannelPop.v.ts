/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 15:56:26
 * @Description: POS联动通道设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-03 15:26:24
 */
import { type SystemPosListChls } from '@/types/apiType/system'

export default defineComponent({
    props: {
        chls: {
            type: Array,
            // required: true,
            default: () => [] as SystemPosListChls[],
        },
    },
    emits: {
        confirm(e: SystemPosListChls[]) {
            return e
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()

        // 最大联动通道数量
        const MAX_TRIGGER_COUNT = 16

        // 选中的通道
        const value = ref<string[]>([])
        // 通道列表
        const chlList = ref<SystemPosListChls[]>([])

        /**
         * @description 获取通道列表数据
         */
        const getData = async () => {
            const sendXml = rawXml`
                <types>
                    <nodeType>
                        <enum>chls</enum>
                        <enum>sensors</enum>
                        <enum>alarmOuts</enum>
                    </nodeType>
                </types>
                <nodeType type="nodeType">chls</nodeType>
                <requireField>
                    <name/>
                    <device/>
                </requireField>
            `
            const result = await queryNodeList(getXmlWrapData(sendXml))
            commLoadResponseHandler(result, ($) => {
                chlList.value = $('/response/content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id')!,
                        text: $item('name').text(),
                    }
                })
            })
        }

        /**
         * @description 限制联动通道数量
         */
        const change = () => {
            if (value.value.length > MAX_TRIGGER_COUNT) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_ALARMOUT_LIMIT'),
                })
                value.value.splice(MAX_TRIGGER_COUNT, value.value.length - 1)
            }
        }

        /**
         * @description 打开弹窗时，请求通道列表，更新表单数据
         */
        const open = async () => {
            if (!chlList.value.length) {
                await getData()
            }
            value.value = (prop.chls as SystemPosListChls[]).map((item) => item.id)
        }

        /**
         * @description 保存数据
         */
        const verify = () => {
            const filterList = chlList.value.filter((item) => value.value.includes(item.id))
            ctx.emit('confirm', filterList)
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        return {
            open,
            change,
            value,
            chlList,
            verify,
            close,
        }
    },
})
