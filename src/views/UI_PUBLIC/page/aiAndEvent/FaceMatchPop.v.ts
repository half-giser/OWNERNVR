/*
 * @Description: 普通事件——组合报警——人脸识别edit弹窗
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-26 16:19:02
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-09-26 15:34:06
 */
import { type faceMatchObj } from '@/types/apiType/aiAndEvent'
export default defineComponent({
    props: {
        linkedEntity: {
            type: String,
            require: true,
        },
        linkedObj: {
            type: Object as PropType<Record<string, faceMatchObj>>,
            require: true,
        },
        handleLinkedObj: {
            type: Function,
            require: true,
        },
    },
    emits: {
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const pageData = ref({
            rule: '1',
            duration: 5, // 开始 持续时间
            delay: 5, // 结束 延迟时间
            noShowDisplay: false,
            displayText: '',
            faceDataIds: [] as string[],
            // 人脸库数据列表
            faceList: [] as SelectOption<string, string>[],
        })
        const open = async () => {
            pageData.value.faceDataIds = []
            pageData.value.faceList = []

            if (prop.linkedObj?.obj) {
                const obj = prop.linkedObj?.obj
                pageData.value.rule = obj.rule
                pageData.value.duration = -obj.duration
                pageData.value.delay = obj.delay
                pageData.value.noShowDisplay = obj.noShowDisplay == 'true' ? true : false
                pageData.value.displayText = obj.displayText
                pageData.value.faceDataIds = obj.groupId.filter((item: string) => item != 'undefined')
            }

            const result = await queryFacePersonnalInfoGroupList()
            commLoadResponseHandler(result, ($) => {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    pageData.value.faceList.push({
                        value: item.attr('id')!,
                        label: $item('name').text(),
                    })
                })
            })
        }
        const save = () => {
            const groupId = [] as string[]
            const faceDataBase = [] as string[]
            pageData.value.faceList.forEach((item) => {
                if (pageData.value.faceDataIds.includes(item.value)) {
                    groupId.push(item.value)
                    faceDataBase.push(item.label)
                }
            })
            const obj = {
                rule: pageData.value.rule,
                duration: -pageData.value.duration,
                delay: pageData.value.delay,
                groupId: groupId,
                noShowDisplay: pageData.value.noShowDisplay ? 'true' : 'false',
                displayText: pageData.value.displayText,
                faceDataBase: faceDataBase,
            }
            prop.handleLinkedObj!(prop.linkedEntity, obj)
            close()
        }
        const close = () => {
            pageData.value.rule = '1'
            pageData.value.duration = 5
            pageData.value.delay = 5
            pageData.value.noShowDisplay = false
            pageData.value.displayText = ''
            pageData.value.faceDataIds = []
            ctx.emit('close')
        }
        return {
            pageData,
            open,
            save,
            close,
        }
    },
})
