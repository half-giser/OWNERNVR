/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-25 20:56:27
 * @Description: 收藏视图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 14:59:09
 */
import { type FormInstance, type FormRules } from 'element-plus'
import { SystemOutputSettingAddViewForm } from '@/types/apiType/system'
import { type PropType } from 'vue'

export interface ChlsDto {
    id: string
    winindex: number
}

export interface ChlGroupData {
    segNum: number
    chls: ChlsDto[]
}

export default defineComponent({
    props: {
        /**
         * @property 当前通道数据
         */
        chl: {
            type: Object as PropType<ChlGroupData>,
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
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const formRef = ref<FormInstance>()
        const formData = ref(new SystemOutputSettingAddViewForm())

        const rules = ref<FormRules>({
            name: [
                {
                    validator: (rule, value: string, callback) => {
                        if (value.length === 0) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 验证表单
         */
        const verify = () => {
            formRef.value!.validate(async (valid) => {
                if (valid) {
                    setData()
                }
            })
        }

        /**
         * @description 提交表单
         */
        const setData = async () => {
            openLoading(LoadingTarget.FullScreen)

            const sendXml = rawXml`
                <content>
                    <item>
                        <segNum>${String(prop.chl.segNum)}</segNum>
                        <name>${formData.value.name}</name>
                        <chls>
                            ${prop.chl.chls.map((item) => `<item id="${item.id}">${String(item.winindex)}</item>`).join('')}
                        </chls>
                    </item>
                </content>
            `
            const result = await addCustomerView(sendXml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('//status').text() === 'success') {
                ctx.emit('close')
            } else {
                const errorCode = Number($('//errorCode').text())
                if (errorCode === ErrorCode.USER_ERROR_NAME_EXISTED) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_NAME_SAME'),
                    })
                }
            }
        }

        const open = () => {
            formRef.value?.clearValidate()
            formData.value.name = ''
        }

        const close = () => {
            ctx.emit('close')
        }

        return {
            formData,
            formRef,
            rules,
            verify,
            open,
            close,
        }
    },
})
